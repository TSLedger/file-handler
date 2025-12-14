import { format } from '@std/datetime/format';
import { TarStream, type TarStreamInput } from '@std/tar/tar-stream';
import { Mutex } from 'async-mutex';
import { type DispatchMessageContext, Level, type ServiceHandlerOption, type WorkerHandler } from 'ledger/struct';
import type { FileHandlerOptions } from './lib/option.ts';
import { serialize } from './lib/util.ts';

/** Handler Exported Class. */
export class Handler implements WorkerHandler {
  private readonly mutex = new Mutex();
  private readonly options: FileHandlerOptions & ServiceHandlerOption;

  private writer: WritableStreamDefaultWriter<Uint8Array<ArrayBufferLike>>;
  private readonly absolute: URL;

  public constructor(options: ServiceHandlerOption) {
    this.options = options as FileHandlerOptions & ServiceHandlerOption;

    // Set Handler and Rotation Options
    this.absolute = new URL(this.options.configured.fileName, this.options.configured.path);
    this.writer = Deno.openSync(this.absolute, {
      write: true,
      create: true,
      append: true,
    }).writable.getWriter();

    // Start Rotation Interval (1 Minute Check)
    setInterval(async () => {
      await this.mutex.runExclusive(async () => {
        const fstat = await Deno.lstat(this.absolute);
        if ((fstat.size / 1024) >= (this.options.configured.roughMaxSizeMB ?? 100) * 1024) {
          await this.writer.close();

          let fileList: { name: string; index: number }[] = [];
          for await (const ent of Deno.readDir(new URL(this.options.configured.path))) {
            if (ent.isDirectory || ent.isSymlink) continue;
            if (ent.name.startsWith(this.options.configured.fileName)) {
              if (ent.name === this.options.configured.fileName) {
                fileList.push({
                  name: ent.name,
                  index: 0,
                });
                continue;
              }
              const index = parseInt(ent.name.replace(`${this.options.configured.fileName}.`, '').replace('.tar', '').split('.')[0] ?? '');
              if (isNaN(index)) continue;
              fileList.push({
                name: ent.name,
                index,
              });
            }
          }
          fileList = fileList.sort((a, b) => b.index - a.index);

          for (const file of fileList) {
            const oldPath = new URL(file.name, this.options.configured.path);
            if (file.index + 1 >= (this.options.configured.maxFileCount ?? 5)) {
              // Remove File Exceeding Max Count
              await Deno.remove(oldPath);
            } else {
              const newPath = new URL(`${this.options.configured.fileName}.${file.index + 1}${this.options.configured.compress === 'tar.gz' ? '.tar.gz' : ''}`, this.options.configured.path);
              if (this.options.configured.compress === 'tar.gz' && file.index === 0) {
                await ReadableStream.from<TarStreamInput>([
                  {
                    type: 'file',
                    path: this.options.configured.fileName,
                    size: (await Deno.stat(oldPath)).size,
                    readable: (await Deno.open(oldPath)).readable,
                  },
                ])
                  .pipeThrough(new TarStream())
                  .pipeThrough(new CompressionStream('gzip'))
                  .pipeTo((await Deno.create(newPath)).writable);
                await Deno.remove(oldPath);
              } else {
                await Deno.rename(oldPath, newPath);
              }
            }
          }
        }

        this.writer = (await Deno.open(this.absolute, {
          write: true,
          create: true,
          append: true,
        })).writable.getWriter();
      }, 100);
    }, 60000);
  }

  public async receive({ context }: DispatchMessageContext): Promise<void> {
    // Filter Level
    if (!(context.level <= (this.options.level ?? Level.LEDGER_ERROR))) {
      return;
    }

    // Message
    const level = Level[context.level];
    let message = context.q ?? '';
    if (message instanceof Error) {
      message = message.stack ?? message.message;
    } else {
      message = serialize(message);
    }

    // Arguments
    let args = serialize(context.args);
    if (args.trim() === '[]') args = '';

    // Variables
    const content: Record<string, string> = {
      timestamp: format(context.date, 'yyyy-MM-dd HH:mm:ss.SSS'),
      service: this.options.service,
      level,
      message: message,
      args: args,
    };

    // Await Mutex
    const release = await this.mutex.acquire(1);

    try {
      this.write(serialize(content));
    } catch (e: unknown) {
      // deno-lint-ignore no-console
      console.error('[Ledger/FileHandler] File Write Error:', content, e);
      release();
    }
    release();
  }

  private async write(text: string): Promise<void> {
    await this.writer.write(new TextEncoder().encode([text, '\n'].join('')));
  }
}
