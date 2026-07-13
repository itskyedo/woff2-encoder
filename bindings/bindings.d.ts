export default function initModule(): Promise<{
  compress(buffer: ArrayBuffer | Uint8Array): Uint8Array | null;
  decompress(buffer: ArrayBuffer | Uint8Array): Uint8Array | null;
}>;
