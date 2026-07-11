const WOFF2_SIGNATURE = 0x77_4f_46_32;

/**
 * The maximum decompressed font size in bytes, matching the default limit of
 * the upstream WOFF2 library.
 */
export const MAX_DECOMPRESSED_SIZE = 30 * 1024 * 1024;

/**
 * Throws if the WOFF2 header declares a decompressed size larger than the
 * WOFF2 module can produce. Inputs without a valid WOFF2 signature are left
 * for the module to reject.
 *
 * @param buffer - The WOFF2 font data.
 * @internal
 */
export function assertDecompressedSizeWithinLimit(
  buffer: ArrayBuffer | Uint8Array
): void {
  const view =
    buffer instanceof Uint8Array
      ? new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
      : new DataView(buffer);

  if (view.byteLength < 20 || view.getUint32(0) !== WOFF2_SIGNATURE) {
    return;
  }

  const declaredSize = view.getUint32(16);
  if (declaredSize > MAX_DECOMPRESSED_SIZE) {
    throw new Error('Font decompressed output size cannot exceed 30 MB.');
  }
}
