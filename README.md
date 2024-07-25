# woff2-encoder

A TypeScript library for handling WOFF2 encoding using WebAssembly.

---

## 🚀 Getting Started

### Prerequisites

- If using Node, `>= 16.x`

### Installation

```console
npm install woff2-encoder
```

---

## Notes

If you only need to decompress WOFF2 files, it's recommended that you import
from `woff2-encoder/decompress` (see the [Decompress only](#decompress-only)
example below). This will net your end users a significant decrease in bundle
size as it uses its own separate WASM file with a much smaller footprint.

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

---

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

### Decompress only

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

---

## ⭐ Acknowledgements

- [google/woff2](https://github.com/google/woff2) - For the C++ implemention for encoding WOFF2 files.
- [fontello/wawoff2](https://github.com/fontello/wawoff2) - For the initial WebAssembly port of Google's WOFF2 encoder.

---

## 📃 License

MIT License. See [LICENSE](https://github.com/itskyedo/woff2-encoder/blob/main/LICENSE) for details.
