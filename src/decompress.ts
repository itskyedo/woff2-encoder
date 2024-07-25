import initModule from '../build/woff2-decompress-wasm';

const _module = new Promise<Awaited<ReturnType<typeof initModule>>>(
  (resolve) => {
    initModule({
      onRuntimeInitialized() {
        resolve(this as ReturnType<typeof initModule>);
      },
    });
  }
);

/**
 * Asynchronously loads the WOFF2 module.
 *
 * @returns A promise resolving to the WOFF2 module.
 * @internal
 */
async function loadModule(): Promise<Awaited<typeof _module>> {
  const loadedModule = await _module;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(loadedModule);
    }, 0);
  });
}

/**
 * Decompresses WOFF2 font data back to SFNT (TrueType/OpenType) font data.
 *
 * @param buffer The WOFF2 font data.
 * @returns A promise resolving to the SFNT font data.
 */
export default async function decompress(
  buffer: ArrayBuffer | Uint8Array
): Promise<Uint8Array> {
  const encoder = await loadModule();
  const result = await encoder.decompress(buffer);
  if (!result) {
    throw new Error('Failed to decompress the font data.');
  }

  return Uint8Array.from(result);
}
