import { Ledger } from 'ledger';
import { Level } from 'ledger/struct';
import type { FileHandlerOptions } from './lib/option.ts';

let ledger: Ledger | null = null;
ledger = new Ledger({
  service: 'test-suite',
  useAsyncDispatchQueue: true,
  troubleshooting: true,
  troubleshootingIPC: false,
});
ledger.register<FileHandlerOptions>({
  definition: new URL('./mod.ts', import.meta.url).href,
  level: Level.SEVERE,
  configured: {
    path: new URL('./tmp/', import.meta.url).href,
    fileName: 'ledger.log',
    roughMaxSizeMB: 1,
    maxFileCount: 5,
    compress: 'tar.gz',
  },
});
await ledger.alive();

const fn = () => {
  ledger.information('Test Message', { foo: 'bar', baz: [1, 2, 3], err: new Error('Sample Error for Testing') });
  setTimeout(fn, 1);
};
fn();
