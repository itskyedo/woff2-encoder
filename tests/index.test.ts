import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { compress, decompress } from '../src';

const fixturesPath = path.join(__dirname, 'fixtures');

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

    expect(Buffer.compare(target, output)).toStrictEqual(0);
  });

  it('decompresses compressed TTF', async () => {
    const target = fs.readFileSync(path.join(fixturesPath, 'dec-enc-ttf.ttf'));
    const input = fs.readFileSync(path.join(fixturesPath, 'enc-ttf.woff2'));
    const output = await decompress(input);

    expect(Buffer.compare(target, output)).toStrictEqual(0);
  });

  it('decompresses compressed OTF', async () => {
    const target = fs.readFileSync(path.join(fixturesPath, 'dec-enc-otf.otf'));
    const input = fs.readFileSync(path.join(fixturesPath, 'enc-otf.woff2'));
    const output = await decompress(input);

    expect(Buffer.compare(target, output)).toStrictEqual(0);
  });

  it('decompresses compressed variable TTF', async () => {
    const target = fs.readFileSync(
      path.join(fixturesPath, 'dec-enc-var-ttf.ttf')
    );
    const input = fs.readFileSync(path.join(fixturesPath, 'enc-var-ttf.woff2'));
    const output = await decompress(input);

    expect(Buffer.compare(target, output)).toStrictEqual(0);
  });
});
