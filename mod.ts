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
      console.info('lock mutex interv');
      await this.mutex.acquire();
      console.info('resolve acq');
      const fstat = await Deno.lstat(this.absolute);
      console.info('fsize', fstat.size, 'roughMax', (this.options.configured.roughMaxSizeMB ?? 24) * 1024);
      if (fstat.size >= (this.options.configured.roughMaxSizeMB ?? 24) * 1024) {
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
            const partial = ent.name.replace(`${this.options.configured.fileName}.`, '').split('.')[0];
            const index = parseInt(partial ?? '');
            if (isNaN(index)) continue;
            fileList.push({
              name: ent.name,
              index,
            });
          }
        }
        fileList = fileList.sort((a, b) => b.index - a.index);
        console.info(fileList);
      }
      console.info('release mutex interv');
      this.mutex.release();
    }, 15 * 1000);
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

  public async rotate(): Promise<void> {
  }
}
