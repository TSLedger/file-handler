import { Ledger } from 'ledger';
import { Level } from 'ledger/struct';
import type { FileHandlerOptions } from '../lib/option.ts';

const ledger = new Ledger({
  service: 'Test IPC Service',
  troubleshooting: false,
  troubleshootingIPC: false,
  useAsyncDispatchQueue: true,
});

ledger.register<FileHandlerOptions>({
  definition: new URL('../mod.ts', import.meta.url).href,
  level: Level.TRACE,
  configured: {
    path: new URL('./tmp/', import.meta.url).href,
    fileName: 'mock-runtime.log',
    maxFileCount: 5,
    roughMaxSizeMB: 1,
    fileSizePollRate: 5,
    compress: 'tar.gz',
  },
});
await ledger.alive();

// This is a random string used for rapidly reaching the file rotation threshhold for more real-to-life processing during the suite.
const random =
  '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';

const object = {
  name: 'some test',
  value: 42,
  error: new Error('Test Error'),
  array: [1, 2, 3],
  set: new Set([1, 2, 3]),
  map: new Map([['k1', 'v1'], ['k2', 'v2']]),
  nested: {
    a: 1,
    b: [true, false, null],
    c: { d: 'deep' },
  },
  date: new Date('2025'),
};

// Fill Log and Rotate for Size Check
for (let i = 0; i < 512; i++) {
  ledger.information('Filling Log File to Rotate', {
    random,
  });
}
await new Promise((resolve) => setTimeout(resolve, 20000));

ledger.trace('Validating API... (Trace)', object);
ledger.information('Validating API... (Information)', object);
ledger.warning('Validating API... (Warning)', object);
ledger.severe('Validating API... (Severe)', object);
await new Promise((resolve) => setTimeout(resolve, 1000));

ledger.terminate();
setTimeout(() => {
  Deno.exit(0);
}, 1000);
