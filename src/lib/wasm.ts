import wasmInit, {
  decompile,
  inspect,
  imports,
  score,
  benchmark,
} from '@riverith/soroban-decompiler-wasm';

let initialized = false;

export async function ensureInit() {
  if (!initialized) {
    await wasmInit();
    initialized = true;
  }
}

export async function decompileWasm(bytes: Uint8Array, sigsOnly = false) {
  await ensureInit();
  return decompile(bytes, sigsOnly);
}

export async function inspectWasm(bytes: Uint8Array) {
  await ensureInit();
  const raw = JSON.parse(inspect(bytes));
  return {
    wasm_size: raw.wasm_size ?? 0,
    functions: raw.functions ?? [],
    structs: raw.structs ?? [],
    enums: raw.enums ?? [],
    errors: raw.errors ?? [],
    events: raw.events ?? [],
  };
}

export async function importsWasm(bytes: Uint8Array) {
  await ensureInit();
  return JSON.parse(imports(bytes));
}

export async function scoreWasm(original: string, decompiled: string) {
  await ensureInit();
  return JSON.parse(score(original, decompiled));
}

export async function benchmarkWasm(name: string, original: string, decompiled: string) {
  await ensureInit();
  return JSON.parse(benchmark(name, original, decompiled));
}
