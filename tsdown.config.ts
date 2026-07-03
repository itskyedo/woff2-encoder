import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['./src/index.ts'],
    outDir: './dist',
    format: ['esm', 'cjs'],
    target: ['node22', 'chrome85', 'firefox79', 'safari14.1'],
    clean: true,
    minify: true,
    dts: true,
    sourcemap: false,
  },

  {
    entry: ['./src/decompress.ts'],
    outDir: './dist',
    format: ['esm', 'cjs'],
    target: ['node22', 'chrome85', 'firefox79', 'safari14.1'],
    clean: true,
    minify: true,
    dts: true,
    sourcemap: false,
  },
]);
