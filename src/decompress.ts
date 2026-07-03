import initModule from '../build/woff2-decompress-wasm.js';

let modulePromise: ReturnType<typeof initModule> | undefined;

/**
 * Asynchronously loads the WOFF2 module. The module is initialized on first
 * call and shared by all subsequent calls. If initialization fails, the error
 * propagates to the caller and the next call retries instead of reusing the
 * failed attempt.
 *
 * @returns A promise resolving to the WOFF2 module.
 * @internal
 */
function loadModule(): ReturnType<typeof initModule> {
  modulePromise ??= initModule().catch((error: unknown) => {
    modulePromise = undefined;
    throw error;
  });

  return modulePromise;
}

/**
 * Decompresses WOFF2 font data back to SFNT (TrueType/OpenType) font data.
 *
 * @param buffer - The WOFF2 font data.
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
