import initModule from '../build/woff2-wasm.js';
import { assertDecompressedSizeWithinLimit } from './limits.ts';

export { MAX_DECOMPRESSED_SIZE } from './limits.ts';

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
 * Runs a call against the loaded WOFF2 module. If the call crashes the WASM
 * runtime, the cached module is discarded so the next call re-initializes a
 * fresh instance instead of reusing the dead one.
 *
 * @param callback - The operation to run against the module.
 * @returns The result of the operation.
 * @internal
 */
async function withModule<T>(
  callback: (encoder: Awaited<ReturnType<typeof initModule>>) => T
): Promise<T> {
  const promise = loadModule();
  const encoder = await promise;

  try {
    return callback(encoder);
  } catch (error) {
    if (
      error instanceof WebAssembly.RuntimeError &&
      modulePromise === promise
    ) {
      modulePromise = undefined;
    }

    throw error;
  }
}

/**
 * Eagerly initializes the WOFF2 module so the first call to `compress` or
 * `decompress` does not pay the one-time WASM instantiation cost. Calling
 * this is optional: the module initializes automatically on first use.
 *
 * @returns A promise that resolves once the WOFF2 module is ready.
 */
export async function preload(): Promise<void> {
  await loadModule();
}

/**
 * Compresses SFNT (TrueType/OpenType) font data to WOFF2 font data.
 *
 * @param buffer - The SFNT font data.
 * @returns A promise resolving to the WOFF2 font data.
 */
export async function compress(
  buffer: ArrayBuffer | Uint8Array
): Promise<Uint8Array> {
  const result = await withModule((encoder) => encoder.compress(buffer));
  if (!result) {
    throw new Error('Failed to compress the font data.');
  }

  return result;
}

/**
 * Decompresses WOFF2 font data back to SFNT (TrueType/OpenType) font data.
 *
 * @param buffer - The WOFF2 font data.
 * @returns A promise resolving to the SFNT font data.
 */
export async function decompress(
  buffer: ArrayBuffer | Uint8Array
): Promise<Uint8Array> {
  assertDecompressedSizeWithinLimit(buffer);

  const result = await withModule((encoder) => encoder.decompress(buffer));
  if (!result) {
    throw new Error('Failed to decompress the font data.');
  }

  return result;
}
