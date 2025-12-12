import { Ledger } from 'ledger';
import { Level } from 'ledger/struct';
import type { FileHandlerOptions } from './lib/option.ts';

let ledger: Ledger | null = null;
ledger = new Ledger({
  service: 'test-suite',
  useAsyncDispatchQueue: true,
  troubleshooting: true,
});
ledger.register<FileHandlerOptions>({
  definition: new URL('./mod.ts', import.meta.url).href,
  level: Level.SEVERE,
  configured: {
    path: new URL('./tmp/', import.meta.url).href,
    fileName: 'ledger.log',
    roughMaxSizeMB: 1,
    maxFileCount: 5,
  },
});
await ledger.alive();

setInterval(() => {
  ledger.information('test');
}, 3);
