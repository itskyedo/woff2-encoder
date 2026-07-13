# woff2-encoder

[![License: MIT](https://img.shields.io/github/license/itskyedo/woff2-encoder?color=blue)](https://github.com/itskyedo/woff2-encoder/blob/main/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/woff2-encoder.svg?logo=npm&color=red)](https://npmjs.org/package/woff2-encoder)
[![Download Count](https://img.shields.io/npm/dm/woff2-encoder.svg?color=brightgreen)](https://npmjs.org/package/woff2-encoder)

## 👋 Introduction

A TypeScript library for handling WOFF2 encoding using WebAssembly.

### Getting Started

#### Prerequisites

- If using Node, `>= 22.12`
- If using a browser, Chrome/Edge `>= 85`, Firefox `>= 79`, or Safari `>= 14.1`

#### Installation

```console
npm install woff2-encoder
```

## 🗒️ Notes

If you only need to decompress WOFF2 files, it's recommended that you import
from `woff2-encoder/decompress` (see the [Decompress only](#decompress-only)
example below). This will net your end users a significant decrease in bundle
size as it uses its own separate WASM file with a much smaller footprint.

This package is ESM-only, however CJS projects can still load with `require`.

Decompression output is limited to 30 MB of uncompressed font data, matching
the default limit of the upstream [google/woff2](https://github.com/google/woff2)
library. This guards against decompression bombs, but it means fonts larger
than 30 MB uncompressed will fail to decompress.

## 📚 API Reference

### `compress`

Compresses SFNT (TrueType/OpenType) font data to WOFF2 font data.

**Returns:** `Promise<Uint8Array>` A promise resolving to the WOFF2 font data.

| Parameter | Type                        | Description         |
| :-------- | :-------------------------- | :------------------ |
| buffer    | `ArrayBuffer \| Uint8Array` | The SFNT font data. |

### `decompress`

Decompresses WOFF2 font data back to SFNT (TrueType/OpenType) font data.

**Returns:** `Promise<Uint8Array>` A promise resolving to the SFNT font data.

| Parameter | Type                        | Description          |
| :-------- | :-------------------------- | :------------------- |
| buffer    | `ArrayBuffer \| Uint8Array` | The WOFF2 font data. |

### `preload`

Eagerly initializes the WASM module so the first `compress` or `decompress`
call does not pay the one-time instantiation cost. Both the package root and
the `woff2-encoder/decompress` subpath export their own `preload`.

**Returns:** `Promise<void>` A promise that resolves once the module is ready.

### `isWoff2Error`

Returns whether an unknown value is an error thrown by this library.

**Returns:** `error is Woff2Error`

| Parameter | Type      | Description         |
| :-------- | :-------- | :------------------ |
| error     | `unknown` | The value to check. |

| Code                | Meaning                                                         |
| :------------------ | :-------------------------------------------------------------- |
| `COMPRESS_FAILED`   | The input could not be compressed (e.g. invalid SFNT data).     |
| `DECOMPRESS_FAILED` | The input could not be decompressed (e.g. invalid WOFF2 data).  |
| `MAX_SIZE_EXCEEDED` | The declared decompressed size exceeds `MAX_DECOMPRESSED_SIZE`. |

The codes are also available with the `Woff2ErrorCode` object.

```typescript
import { decompress, isWoff2Error, Woff2ErrorCode } from 'woff2-encoder';

try {
  await decompress(fontBuffer);
} catch (error) {
  if (isWoff2Error(error) && error.code === Woff2ErrorCode.MAX_SIZE_EXCEEDED) {
    // The font is too large to decompress.
  } else {
    throw error;
  }
}
```

### `MAX_DECOMPRESSED_SIZE`

The maximum decompressed font size in bytes (3,1457,280 bytes, i.e. 30 MB), matching
the default limit of the upstream [google/woff2](https://github.com/google/woff2)
library. Fonts whose WOFF2 header declares a larger size are rejected by
`decompress` before any processing.

## 💡 Examples

### Compress a TTF font using Node.js

```typescript
import fs from 'node:fs';
import { compress } from 'woff2-encoder';

async function example() {
  const fontFile = fs.readFileSync('./my-font.ttf');
  const output = await compress(fontFile);
}
```

### Decompress a WOFF2 font from a URL

```typescript
import { decompress } from 'woff2-encoder';

async function example() {
  const fontBuffer = await fetch('https://example.com/my-font.woff2').then(
    (res) => res.arrayBuffer()
  );

  const output = await decompress(fontBuffer);
}
```

### Parse a WOFF2 font with [opentype.js](https://github.com/opentypejs/opentype.js)

```typescript
import fs from 'node:fs';
import opentype from 'opentype.js';
import { decompress } from 'woff2-encoder';

async function example() {
  const fontFile = fs.readFileSync('./my-font.woff2');
  const output = await decompress(fontFile);

  // Since opentype.js requires a buffer, we pass
  // in the buffer and not the byte array itself
  const fontData = opentype.parse(output.buffer);
}
```

### Preload the WASM module

This will preload the WASM module to speed up the initialization that happens on
the first compress/decompress call.

```typescript
import fs from 'node:fs';
import { compress, preload } from 'woff2-encoder';

async function startup() {
  // Initialize the WASM module before it's needed.
  await preload();
}

async function example() {
  // The first call no longer pays the initialization cost.
  const fontFile = fs.readFileSync('./my-font.ttf');
  const output = await compress(fontFile);
}
```

### Decompress only

If your project requires both compression and decompression, you should only
import from the package root.

However, if your project only needs to decompress fonts, it's highly recommended
to import using the `/decompress` subpath. It uses its own separate WASM file
which is 70% smaller.

```typescript
import fs from 'node:fs';
import opentype from 'opentype.js';
import decompress from 'woff2-encoder/decompress';

async function example() {
  const fontBuffer = await fetch('https://example.com/my-font.woff2').then(
    (res) => res.arrayBuffer()
  );

  const output = await decompress(fontBuffer);
}
```

## ⭐ Acknowledgements

- [google/woff2](https://github.com/google/woff2) - For the C++ implementation
  for encoding WOFF2 files.
- [fontello/wawoff2](https://github.com/fontello/wawoff2) - For the initial
  WebAssembly port of Google's WOFF2 encoder.

## 📃 License

Created by [Kyedo](https://github.com/itskyedo) and licensed under the MIT
License. See [LICENSE](./LICENSE) for more details.
