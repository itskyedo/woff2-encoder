import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { compress, decompress, preload } from 'woff2-encoder';
import subpathDecompress, {
  preload as subpathPreload,
} from 'woff2-encoder/decompress';

const fixturesDir = new URL('../fixtures/', import.meta.url);
const originalTtf = await readFile(new URL('og.ttf', fixturesDir));
const originalWoff2 = await readFile(new URL('og.woff2', fixturesDir));
const expectedWoff2 = await readFile(new URL('enc-ttf.woff2', fixturesDir));
const expectedTtf = await readFile(new URL('dec-woff2.ttf', fixturesDir));
const compressed = await compress(originalTtf);
const decompressed = await decompress(originalWoff2);
const subpathDecompressed = await subpathDecompress(originalWoff2);

assert.equal(typeof compress, 'function');
assert.equal(typeof decompress, 'function');
assert.equal(typeof preload, 'function');
assert.equal(typeof subpathDecompress, 'function');
assert.equal(typeof subpathPreload, 'function');
await preload();
await subpathPreload();
assert.equal(Buffer.compare(Buffer.from(compressed), expectedWoff2), 0);
assert.equal(Buffer.compare(Buffer.from(decompressed), expectedTtf), 0);
assert.equal(Buffer.compare(Buffer.from(subpathDecompressed), expectedTtf), 0);
