import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import {
  compress,
  decompress,
  MAX_DECOMPRESSED_SIZE,
  preload,
} from 'woff2-encoder';
import subpathDecompress, {
  MAX_DECOMPRESSED_SIZE as subpathMaxDecompressedSize,
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
assert.equal(MAX_DECOMPRESSED_SIZE, 30 * 1024 * 1024);
assert.equal(subpathMaxDecompressedSize, MAX_DECOMPRESSED_SIZE);
await preload();
await subpathPreload();
assert.equal(Buffer.compare(Buffer.from(compressed), expectedWoff2), 0);
assert.equal(Buffer.compare(Buffer.from(decompressed), expectedTtf), 0);
assert.equal(Buffer.compare(Buffer.from(subpathDecompressed), expectedTtf), 0);

// CJS consumers load the ESM build through require(esm)
const require = createRequire(import.meta.url);
const required = require('woff2-encoder');
const requiredDecompress = require('woff2-encoder/decompress');

assert.equal(typeof required.compress, 'function');
assert.equal(typeof required.decompress, 'function');
assert.equal(typeof required.preload, 'function');
assert.equal(typeof requiredDecompress.default, 'function');
assert.equal(typeof requiredDecompress.preload, 'function');

const requiredCompressed = await required.compress(originalTtf);
const requiredDecompressed = await requiredDecompress.default(originalWoff2);

assert.equal(Buffer.compare(Buffer.from(requiredCompressed), expectedWoff2), 0);
assert.equal(Buffer.compare(Buffer.from(requiredDecompressed), expectedTtf), 0);
