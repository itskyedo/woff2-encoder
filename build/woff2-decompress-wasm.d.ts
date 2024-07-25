export interface ModuleArgs {
  onRuntimeInitialized?: () => void;
}

export default function initModule(args?: ModuleArgs): Promise<{
  decompress(buffer: ArrayBuffer | Uint8Array): Promise<Uint8Array | null>;
}>;
