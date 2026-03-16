import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { decompileWasm, inspectWasm, importsWasm } from '../lib/wasm';
import { NETWORKS } from '../data/contracts';

export interface SpecJson {
  wasm_size: number;
  functions: { name: string; inputs: { name: string; type: string }[]; output?: string }[];
  structs: { name: string; fields: { name: string; type: string }[] }[];
  enums: { name: string; variants: { name: string; types?: string[]; value?: number }[] }[];
  errors: { name: string; variants: { name: string; value: number }[] }[];
  events: { name: string; fields: { name: string; type: string }[] }[];
}

export interface ImportsJson {
  total: number;
  resolved: number;
  unresolved: number;
  imports: {
    semantic_name: string;
    semantic_module: string;
    module: string;
    field: string;
    args: string[];
    return_type: string;
  }[];
}

interface DecompilerState {
  wasmBytes: Uint8Array | null;
  contractName: string;
  rustSource: string;
  specJson: SpecJson | null;
  importsJson: ImportsJson | null;
  loading: boolean;
  error: string | null;
  loadFromFile: (file: File) => Promise<void>;
  loadFromUrl: (url: string, name: string) => Promise<void>;
  loadFromBytes: (bytes: Uint8Array, name: string) => Promise<void>;
  fetchFromRpc: (contractId: string, network: string) => Promise<void>;
  clear: () => void;
}

const DecompilerContext = createContext<DecompilerState | null>(null);

export function useDecompiler() {
  const ctx = useContext(DecompilerContext);
  if (!ctx) throw new Error('useDecompiler must be inside DecompilerProvider');
  return ctx;
}

async function runPipeline(bytes: Uint8Array) {
  const [rustSource, specJson, importsJson] = await Promise.all([
    decompileWasm(bytes),
    inspectWasm(bytes),
    importsWasm(bytes),
  ]);
  return { rustSource, specJson, importsJson };
}

export function DecompilerProvider({ children }: { children: ReactNode }) {
  const [wasmBytes, setWasmBytes] = useState<Uint8Array | null>(null);
  const [contractName, setContractName] = useState('');
  const [rustSource, setRustSource] = useState('');
  const [specJson, setSpecJson] = useState<SpecJson | null>(null);
  const [importsJson, setImportsJson] = useState<ImportsJson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processBytes = useCallback(async (bytes: Uint8Array, name: string) => {
    setLoading(true);
    setError(null);
    setWasmBytes(bytes);
    setContractName(name);
    try {
      const result = await runPipeline(bytes);
      setRustSource(result.rustSource);
      setSpecJson(result.specJson);
      setImportsJson(result.importsJson);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFromFile = useCallback(async (file: File) => {
    const buffer = await file.arrayBuffer();
    await processBytes(new Uint8Array(buffer), file.name.replace(/\.wasm$/, ''));
  }, [processBytes]);

  const loadFromUrl = useCallback(async (url: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
      const buffer = await resp.arrayBuffer();
      await processBytes(new Uint8Array(buffer), name);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  }, [processBytes]);

  const loadFromBytes = useCallback(async (bytes: Uint8Array, name: string) => {
    await processBytes(bytes, name);
  }, [processBytes]);

  const fetchFromRpc = useCallback(async (contractId: string, networkValue: string) => {
    setLoading(true);
    setError(null);
    try {
      const net = NETWORKS.find((n) => n.value === networkValue) ?? NETWORKS[0];
      const rpc = net.rpc;

      // Step 1: Get contract instance to find WASM hash
      const instanceRes = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getLedgerEntries',
          params: {
            keys: [
              {
                type: 'CONTRACT_DATA',
                contract: contractId,
                key: 'LedgerKeyContractInstance',
                durability: 'persistent',
              },
            ],
          },
        }),
      });
      const instanceData = await instanceRes.json();
      const entries = instanceData?.result?.entries;
      if (!entries?.length) throw new Error('Contract not found on ' + net.label);

      // The WASM hash is embedded in the contract instance XDR.
      // For simplicity, try the getContractWasmByContractId approach
      const wasmRes = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'getContractWasmByContractId',
          params: { contract_id: contractId },
        }),
      });
      const wasmData = await wasmRes.json();

      if (wasmData?.result?.wasm) {
        const binary = Uint8Array.from(atob(wasmData.result.wasm), (c) => c.charCodeAt(0));
        await processBytes(binary, contractId.slice(0, 8) + '...');
      } else {
        // Fallback: extract from ledger entry XDR
        throw new Error(
          'Could not fetch WASM code. The RPC may not support getContractWasmByContractId. Try uploading the .wasm file directly.'
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    }
  }, [processBytes]);

  const clear = useCallback(() => {
    setWasmBytes(null);
    setContractName('');
    setRustSource('');
    setSpecJson(null);
    setImportsJson(null);
    setError(null);
    setLoading(false);
  }, []);

  return (
    <DecompilerContext.Provider
      value={{
        wasmBytes,
        contractName,
        rustSource,
        specJson,
        importsJson,
        loading,
        error,
        loadFromFile,
        loadFromUrl,
        loadFromBytes,
        fetchFromRpc,
        clear,
      }}
    >
      {children}
    </DecompilerContext.Provider>
  );
}
