import fs from 'node:fs';
import path from 'node:path';
import { parse as parseFont } from 'opentype.js';
import { describe, expect, it } from 'vitest';
import decompress2, {
  preload as preloadDecompress,
} from '../src/decompress.ts';
import { compress, decompress, preload } from '../src/index.ts';

const fixturesPath = path.join(__dirname, 'fixtures');

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function expectParseableFont(bytes: Uint8Array): void {
  const font = parseFont(toArrayBuffer(bytes));

  expect(font.numGlyphs).toBeGreaterThan(0);
  expect(font.unitsPerEm).toBeGreaterThan(0);
}

describe('compress', () => {
  it('compresses TTF', async () => {
    const target = fs.readFileSync(path.join(fixturesPath, 'enc-ttf.woff2'));
    const input = fs.readFileSync(path.join(fixturesPath, 'og.ttf'));
    const output = await compress(input);

    expect(Buffer.compare(target, output)).toStrictEqual(0);
  });

  it('compresses OTF', async () => {
    const target = fs.readFileSync(path.join(fixturesPath, 'enc-otf.woff2'));
    const input = fs.readFileSync(path.join(fixturesPath, 'og.otf'));
    const output = await compress(input);

    expect(Buffer.compare(target, output)).toStrictEqual(0);
  });

  it('compresses original variable TTF', async () => {
    const target = fs.readFileSync(
      path.join(fixturesPath, 'enc-var-ttf.woff2')
    );
    const input = fs.readFileSync(path.join(fixturesPath, 'og-var.ttf'));
    const output = await compress(input);

    expect(Buffer.compare(target, output)).toStrictEqual(0);
  });
});

describe('preload', () => {
  it('resolves for both entry points and is idempotent', async () => {
    await expect(preload()).resolves.toBeUndefined();
    await expect(preloadDecompress()).resolves.toBeUndefined();
    await expect(
      Promise.all([preload(), preload(), preloadDecompress()])
    ).resolves.toBeDefined();
  });

  it('leaves the module fully functional', async () => {
    await preload();

    const target = fs.readFileSync(path.join(fixturesPath, 'enc-ttf.woff2'));
    const input = fs.readFileSync(path.join(fixturesPath, 'og.ttf'));
    const output = await compress(input);

    expect(Buffer.compare(target, output)).toStrictEqual(0);
  });
});

describe('input handling', () => {
  it('accepts ArrayBuffer input', async () => {
    const target = fs.readFileSync(path.join(fixturesPath, 'enc-ttf.woff2'));
    const input = fs.readFileSync(path.join(fixturesPath, 'og.ttf'));
    const output = await compress(toArrayBuffer(input));

    expect(Buffer.compare(target, output)).toStrictEqual(0);
  });

  it('rejects invalid SFNT data', async () => {
    await expect(compress(new Uint8Array([1, 2, 3, 4]))).rejects.toThrow(
      'Failed to compress the font data.'
    );
  });

  it('rejects invalid WOFF2 data', async () => {
    await expect(decompress(new Uint8Array([1, 2, 3, 4]))).rejects.toThrow(
      'Failed to decompress the font data.'
    );
    await expect(decompress2(new Uint8Array([1, 2, 3, 4]))).rejects.toThrow(
      'Failed to decompress the font data.'
    );
  });

  it('still works after rejecting invalid input', async () => {
    await expect(compress(new Uint8Array([1, 2, 3, 4]))).rejects.toThrow(
      'Failed to compress the font data.'
    );

    const target = fs.readFileSync(path.join(fixturesPath, 'enc-ttf.woff2'));
    const input = fs.readFileSync(path.join(fixturesPath, 'og.ttf'));
    const output = await compress(input);

    expect(Buffer.compare(target, output)).toStrictEqual(0);
  });
});

describe('concurrency', () => {
  it('produces correct output for concurrent calls', async () => {
    const ttf = fs.readFileSync(path.join(fixturesPath, 'og.ttf'));
    const woff2 = fs.readFileSync(path.join(fixturesPath, 'og.woff2'));
    const expectedWoff2 = fs.readFileSync(
      path.join(fixturesPath, 'enc-ttf.woff2')
    );
    const expectedTtf = fs.readFileSync(
      path.join(fixturesPath, 'dec-woff2.ttf')
    );

    const outputs = await Promise.all([
      compress(ttf),
      compress(ttf),
      compress(ttf),
      compress(ttf),
      decompress(woff2),
      decompress(woff2),
      decompress(woff2),
      decompress(woff2),
    ]);

    for (const output of outputs.slice(0, 4)) {
      expect(Buffer.compare(expectedWoff2, output)).toStrictEqual(0);
    }
    for (const output of outputs.slice(4)) {
      expect(Buffer.compare(expectedTtf, output)).toStrictEqual(0);
    }
  });
});

describe('decompress', () => {
  it('decompresses WOFF2', async () => {
    const target = fs.readFileSync(path.join(fixturesPath, 'dec-woff2.ttf'));
    const input = fs.readFileSync(path.join(fixturesPath, 'og.woff2'));
    const output = await decompress(input);
    const output2 = await decompress2(input);

    expect(Buffer.compare(target, output)).toStrictEqual(0);
    expect(Buffer.compare(target, output2)).toStrictEqual(0);
  });

  it('decompresses WOFF2 into parseable OpenType fonts', async () => {
    const input = fs.readFileSync(path.join(fixturesPath, 'og.woff2'));
    const output = await decompress(input);
    const output2 = await decompress2(input);

    expectParseableFont(output);
    expectParseableFont(output2);
  });

  it('decompresses compressed TTF', async () => {
    const target = fs.readFileSync(path.join(fixturesPath, 'dec-enc-ttf.ttf'));
    const input = fs.readFileSync(path.join(fixturesPath, 'enc-ttf.woff2'));
    const output = await decompress(input);
    const output2 = await decompress2(input);

    expect(Buffer.compare(target, output)).toStrictEqual(0);
    expect(Buffer.compare(target, output2)).toStrictEqual(0);
  });

  it('ignores an overstated totalSfntSize header field', async () => {
    const target = fs.readFileSync(path.join(fixturesPath, 'dec-woff2.ttf'));
    const input = fs.readFileSync(path.join(fixturesPath, 'og.woff2'));

    const tampered = Buffer.from(input);
    tampered.writeUInt32BE(tampered.readUInt32BE(16) + 4096, 16);

    const output = await decompress(tampered);
    const output2 = await decompress2(tampered);

    expect(Buffer.compare(target, output)).toStrictEqual(0);
    expect(Buffer.compare(target, output2)).toStrictEqual(0);
  });

  it('decompresses compressed OTF', async () => {
    const target = fs.readFileSync(path.join(fixturesPath, 'dec-enc-otf.otf'));
    const input = fs.readFileSync(path.join(fixturesPath, 'enc-otf.woff2'));
    const output = await decompress(input);
    const output2 = await decompress2(input);

    expect(Buffer.compare(target, output)).toStrictEqual(0);
    expect(Buffer.compare(target, output2)).toStrictEqual(0);
  });

  it('decompresses compressed variable TTF', async () => {
    const target = fs.readFileSync(
      path.join(fixturesPath, 'dec-enc-var-ttf.ttf')
    );
    const input = fs.readFileSync(path.join(fixturesPath, 'enc-var-ttf.woff2'));
    const output = await decompress(input);
    const output2 = await decompress2(input);

    expect(Buffer.compare(target, output)).toStrictEqual(0);
    expect(Buffer.compare(target, output2)).toStrictEqual(0);
  });
});
