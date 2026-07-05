export default function initModule(): Promise<{
  decompress(buffer: ArrayBuffer | Uint8Array): Uint8Array | null;
}>;
