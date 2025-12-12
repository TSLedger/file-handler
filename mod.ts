import { TarStream } from '@std/tar';
import { type DispatchMessageContext, Level, type ServiceHandlerOption, type WorkerHandler } from 'ledger/struct';
import type { FileHandlerOptions } from './lib/option.ts';
import { Mutex } from './lib/util/mutex.ts';

/** Handler Exported Class. */
export class Handler implements WorkerHandler {
  private readonly mutex = new Mutex();
  private readonly options: FileHandlerOptions & ServiceHandlerOption;

  private readonly handle: IFHandler;
  private readonly absolute: URL;

  public constructor(options: ServiceHandlerOption) {
    this.options = options as FileHandlerOptions & ServiceHandlerOption;

    // Set Handler and Rotation Options
    this.absolute = new URL(this.options.configured.fileName, this.options.configured.path);
    this.handle = new IFHandler(this.options, this.absolute);

    // Start Rotation Interval (1 Minute Check)
    setInterval(async () => {
      await this.mutex.acquire();
      const fstat = await Deno.lstat(this.absolute);
      console.info('fsize', fstat.size / 1024, 'roughMax', (this.options.configured.roughMaxSizeMB ?? 100) * 1024);
      if ((fstat.size / 1024) >= (this.options.configured.roughMaxSizeMB ?? 100) * 1024) {
        console.info('size exceeded. rotate!');
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
            console.info('removed', oldPath.href);
          } else {
            const newPath = new URL(`${this.options.configured.fileName}.${file.index + 1}`, this.options.configured.path);
            await Deno.rename(oldPath, newPath);
            console.info('renamed', oldPath.href, 'to', newPath.href);
            if (this.options.configured.compress === 'tar.gz') {
              // TODO:  Use Usage Docs of TarStream to create tar.gz compressed file
              new TarStream();
            }
          }
        }
      }
      this.mutex.release();
    }, 3 * 1000);
  }

  public async receive({ context }: DispatchMessageContext): Promise<void> {
    // Filter Level
    if (!(context.level <= (this.options.level ?? Level.LEDGER_ERROR))) {
      return;
    }

    // Await Mutex
    await this.mutex.acquire();

    // Write to Output
    switch (context.level) {
      case Level.TRACE: {
        await this.handle.write();
        break;
      }
      case Level.INFORMATION: {
        await this.handle.write();
        break;
      }
      case Level.WARNING: {
        await this.handle.write();
        break;
      }
      case Level.SEVERE: {
        await this.handle.write();
        break;
      }
      default: {
        await this.handle.write();
        break;
      }
    }
    await this.mutex.release();
  }
}

class IFHandler {
  private absolute: URL;

  public constructor(options: FileHandlerOptions, absolute: URL) {
    this.absolute = absolute;
  }

  public async write(): Promise<void> {
    await Deno.writeTextFile(this.absolute, `${crypto.randomUUID()}\n`, { append: true, create: true });
  }
}
