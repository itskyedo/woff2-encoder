/**
 * The machine-readable reasons for errors thrown by this library.
 */
export const Woff2ErrorCode = Object.freeze({
  COMPRESS_FAILED: 'COMPRESS_FAILED',
  DECOMPRESS_FAILED: 'DECOMPRESS_FAILED',
  MAX_SIZE_EXCEEDED: 'MAX_SIZE_EXCEEDED',
} as const);

/**
 * The machine-readable reason for an error thrown by this library.
 */
export type Woff2ErrorCode =
  (typeof Woff2ErrorCode)[keyof typeof Woff2ErrorCode];

const WOFF2_ERROR_MESSAGES: Readonly<Record<Woff2ErrorCode, string>> =
  Object.freeze({
    COMPRESS_FAILED: 'Failed to compress the font data.',
    DECOMPRESS_FAILED: 'Failed to decompress the font data.',
    MAX_SIZE_EXCEEDED: 'Font decompressed output size cannot exceed 30 MB.',
  });

/**
 * An error thrown by this library. The `code` identifies the failure and is
 * stable across releases; the `message` is human-readable and may change.
 *
 * Only the type is part of the public API. The constructor is internal so
 * consumers use the structural `isWoff2Error` guard instead of `instanceof`,
 * which breaks across bundled copies and the two package entry points.
 */
export class Woff2Error extends Error {
  code: Woff2ErrorCode;

  constructor(
    code: Woff2ErrorCode,
    message: string = WOFF2_ERROR_MESSAGES[code]
  ) {
    super(message);
    this.name = 'Woff2Error';
    this.code = code;
  }
}

/**
 * Returns whether an unknown value is an error thrown by this library. The
 * check is structural rather than `instanceof`-based so it works across
 * bundled copies, realms, and both package entry points.
 *
 * @param error - The value to check.
 * @returns Whether the value is an error thrown by this library.
 */
export function isWoff2Error(error: unknown): error is Woff2Error {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as Partial<Woff2Error>).name === 'Woff2Error' &&
    typeof (error as Partial<Woff2Error>).code === 'string'
  );
}
