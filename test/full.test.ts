import { type TarStreamEntry, UntarStream } from '@std/tar/untar-stream';
// deno-lint-ignore no-external-import
import { assertEquals, assertStringIncludes } from 'jsr:@std/assert@1.0.16';

let spCode: number;
let spStdout: string;
let spStderr: string;

Deno.test('Ledger - File Handler Runtime Report', async (kit) => {
  await kit.step('Dispatch Process', async () => {
    const command = new Deno.Command(Deno.execPath(), {
      args: ['run', '--allow-all', './test/mock-runtime.ts'],
      stdout: 'piped',
      stderr: 'piped',
    });

    const decoder = new TextDecoder();
    const { code, stdout, stderr } = await command.output();
    spCode = code;
    spStdout = decoder.decode(stdout);
    spStderr = decoder.decode(stderr);
  });
  await kit.step('Verify Process Output Expectations', () => {
    assertEquals(spCode, 0);
    assertEquals(spStdout.length, 0);
    assertEquals(spStderr.length, 0);
  });
  await kit.step('Verify Process (File) Content', async () => {
    // Read Archive
    const tgzfile = await Deno.open(new URL('./tmp/mock-runtime.log.1.tar.gz', import.meta.url), {
      read: true,
      write: false,
    });
    const stream = ReadableStream.from<TarStreamEntry>(tgzfile.readable.pipeThrough(new DecompressionStream('gzip')).pipeThrough(new UntarStream()));
    for await (const entry of stream) {
      assertEquals(entry.header.size, 2177406);
      const file = await Deno.open(new URL('./tmp/mock-runtime.test-extract.log', import.meta.url), { read: true, write: true, create: true, truncate: true });
      await entry.readable?.pipeTo(file.writable);
      break;
    }

    // Read Current File
    const spfile = await Deno.readTextFile(new URL('./tmp/mock-runtime.log', import.meta.url));
    // Base
    assertStringIncludes(spfile, 'Test IPC Service');
    assertStringIncludes(spfile, 'Validating API');
    // Levels
    assertStringIncludes(spfile, 'TRACE');
    assertStringIncludes(spfile, 'Trace');
    assertStringIncludes(spfile, 'INFORMATION');
    assertStringIncludes(spfile, 'Information');
    assertStringIncludes(spfile, 'WARNING');
    assertStringIncludes(spfile, 'Warning');
    assertStringIncludes(spfile, 'SEVERE');
    assertStringIncludes(spfile, 'Severe');
    // Properties
    assertStringIncludes(spfile, 'some test');
    assertStringIncludes(spfile, 'Object.assign(');
    assertStringIncludes(spfile, 'new Error("Test Error"),');
    assertStringIncludes(spfile, 'array');
    assertStringIncludes(spfile, 'set');
    assertStringIncludes(spfile, 'map');
    assertStringIncludes(spfile, 'k1');
    assertStringIncludes(spfile, 'v1');
    assertStringIncludes(spfile, 'k2');
    assertStringIncludes(spfile, 'v2');
    assertStringIncludes(spfile, 'nested');
    assertStringIncludes(spfile, '"d":"deep"');
    assertStringIncludes(spfile, '"date":new Date(1735689600000)');
  });
});
