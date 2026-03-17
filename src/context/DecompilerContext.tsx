import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { decompileWasm, inspectWasm, importsWasm } from '../lib/wasm';
import { NETWORKS } from '../data/contracts';
import * as StellarSdk from '@stellar/stellar-sdk';

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
  // Run inspect/imports first — they're lighter and succeed even when decompile fails
  const [specJson, importsJson] = await Promise.all([
    inspectWasm(bytes),
    importsWasm(bytes),
  ]);

  let rustSource: string;
  try {
    rustSource = await decompileWasm(bytes);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const isStackOverflow = msg === 'unreachable' || msg.includes('RuntimeError');
    if (isStackOverflow) {
      // Try signatures-only mode as fallback
      try {
        rustSource = await decompileWasm(bytes, true);
      } catch {
        rustSource = '';
      }
      throw Object.assign(
        new Error(
          isStackOverflow
            ? 'WASM_STACK_OVERFLOW'
            : msg
        ),
        { sigsOutput: rustSource }
      );
    }
    throw e;
  }

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
    } catch (e: any) {
      // On stack overflow, we still have spec/imports from the pipeline
      if (e.message === 'WASM_STACK_OVERFLOW') {
        // Set whatever partial results we got
        const sigsOutput = e.sigsOutput || '';
        setRustSource(sigsOutput);
        // Re-run inspect/imports since they succeed independently
        try {
          const [spec, imp] = await Promise.all([inspectWasm(bytes), importsWasm(bytes)]);
          setSpecJson(spec);
          setImportsJson(imp);
        } catch { /* ignore */ }
      }
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
      const server = new StellarSdk.rpc.Server(net.rpc);

      // Step 1: Get contract instance to extract WASM hash
      const instanceKey = StellarSdk.xdr.LedgerKey.contractData(
        new StellarSdk.xdr.LedgerKeyContractData({
          contract: new StellarSdk.Address(contractId).toScAddress(),
          key: StellarSdk.xdr.ScVal.scvLedgerKeyContractInstance(),
          durability: StellarSdk.xdr.ContractDataDurability.persistent(),
        })
      );

      const response = await server.getLedgerEntries(instanceKey);

      if (!response.entries || response.entries.length === 0) {
        throw new Error(`Contract not found on ${net.label}. Check the contract ID and network.`);
      }

      const entry = response.entries[0];
      const contractData = entry.val.contractData();
      const contractInstance = contractData.val().instance();
      const executable = contractInstance.executable();

      if (executable.switch().name !== 'contractExecutableWasm') {
        throw new Error('This is a Stellar Asset Contract (SAC) — no custom WASM to decompile.');
      }

      const wasmHash = executable.wasmHash();

      // Step 2: Fetch the WASM code by hash
      const wasmKey = StellarSdk.xdr.LedgerKey.contractCode(
        new StellarSdk.xdr.LedgerKeyContractCode({ hash: wasmHash })
      );
      const wasmResponse = await server.getLedgerEntries(wasmKey);

      if (!wasmResponse.entries || wasmResponse.entries.length === 0) {
        throw new Error('WASM code not found on ledger. It may have expired.');
      }

      const wasmCode = wasmResponse.entries[0].val.contractCode().code();

      await processBytes(new Uint8Array(wasmCode), contractId.slice(0, 8) + '...' + contractId.slice(-4));
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
