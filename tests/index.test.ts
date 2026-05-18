import fs from 'node:fs';
import path from 'node:path';
import { parse as parseFont } from 'opentype.js';
import { describe, expect, it } from 'vitest';
import decompress2 from '../src/decompress.ts';
import { compress, decompress } from '../src/index.ts';

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
