import initModule from '../build/woff2-wasm';

const _module = initModule();
let _woff2: Awaited<ReturnType<typeof initModule>>;

_loadModule();

/**
 * Asynchronously loads the WOFF2 module.
 *
 * @internal
 */
async function _loadModule(): Promise<void> {
  if (!(_woff2 as typeof _woff2 | undefined)) {
    const loadedModule = await _module;

    if (!(_woff2 as typeof _woff2 | undefined)) {
      _woff2 = loadedModule;
    }
  }
}

/**
 * Compresses SFNT (TrueType/OpenType) font data to WOFF2 font data.
 *
 * @param buffer The SFNT font data.
 * @returns A promise resolving to the WOFF2 font data.
 */
export async function compress(
  buffer: ArrayBuffer | Uint8Array
): Promise<Uint8Array> {
  await _loadModule();

  const result = await _woff2.compress(buffer);
  if (!result) {
    throw new Error('Failed to compress the font data!');
  }

  return Uint8Array.from(result);
}

/**
 * Decompresses WOFF2 font data back to SFNT (TrueType/OpenType) font data.
 *
 * @param buffer The WOFF2 font data.
 * @returns A promise resolving to the SFNT font data.
 */
export async function decompress(
  buffer: ArrayBuffer | Uint8Array
): Promise<Uint8Array> {
  await _loadModule();

  const result = await _woff2.decompress(buffer);
  if (!result) {
    throw new Error('Failed to decompress the font data!');
  }

  return Uint8Array.from(result);
}
