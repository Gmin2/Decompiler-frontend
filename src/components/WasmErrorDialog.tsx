import { useState } from 'react';

interface Props {
  error: string;
  contractName: string;
  wasmSize: number | null;
  onDismiss: () => void;
}

export default function WasmErrorDialog({ error, contractName, wasmSize, onDismiss }: Props) {
  const [copied, setCopied] = useState(false);

  if (error !== 'WASM_STACK_OVERFLOW') return null;

  const cliInstall = 'cargo install soroban-decompiler-cli';
  const cliRun = 'soroban-decompile decompile --input contract.wasm';

  function copyCommand() {
    navigator.clipboard.writeText(`${cliInstall}\n${cliRun}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative my-4 rounded-lg border border-red-500/20 bg-red-950/30 p-5">
      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="absolute right-3 top-3 rounded border border-white/10 px-2 py-0.5 text-[11px] text-white/40 hover:border-white/30 hover:text-white/70"
      >
        Dismiss
      </button>

      {/* Title */}
      <div className="mb-3 flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 16 16" className="flex-shrink-0 fill-red-400">
          <path d="M4.47.22A.749.749 0 0 1 5 0h6c.199 0 .389.079.53.22l4.25 4.25c.141.14.22.331.22.53v6a.749.749 0 0 1-.22.53l-4.25 4.25A.749.749 0 0 1 11 16H5a.749.749 0 0 1-.53-.22L.22 11.53A.749.749 0 0 1 0 11V5c0-.199.079-.389.22-.53Zm.84 1.28L1.5 5.31v5.38l3.81 3.81h5.38l3.81-3.81V5.31L10.69 1.5ZM8 4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
        </svg>
        <h3 className="text-[15px] font-bold text-red-400">
          Contract Too Large for Browser WASM Sandbox
        </h3>
      </div>

      {/* Body */}
      <div className="mb-4 space-y-2 text-[13px] leading-relaxed text-white/70">
        <p>
          The contract{' '}
          <strong className="text-white/90">{contractName}</strong>
          {wasmSize && (
            <span> ({(wasmSize / 1024).toFixed(1)} KB)</span>
          )}{' '}
          caused a stack overflow in the browser&apos;s WASM sandbox. This happens with
          larger or deeply nested contracts — the browser limits WASM stack depth to ~1MB.
        </p>
        <p>
          <strong className="text-white/90">Smaller contracts (under ~10KB) decompile perfectly in the browser.</strong>{' '}
          The Spec and Imports tabs still have results — only the full body decompilation
          needs more stack space.
        </p>
      </div>

      {/* CLI solution */}
      <div className="rounded-md border border-white/10 bg-black/40 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
            Solution — Use the CLI
          </span>
          <button
            onClick={copyCommand}
            className="rounded border border-white/10 px-2 py-0.5 text-[11px] text-white/40 hover:border-white/30 hover:text-white/70"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="text-[13px] leading-7 text-white/85">
          <span className="text-white/40"># Install the CLI</span>{'\n'}
          {cliInstall}{'\n'}
          {'\n'}
          <span className="text-white/40"># Decompile any contract, no size limit</span>{'\n'}
          {cliRun}
        </pre>
      </div>

      {/* Note */}
      <p className="mt-3 text-[12px] italic text-white/40">
        The native CLI has no stack limit and decompiles this contract in under a second.
        Available on{' '}
        <a
          href="https://crates.io/crates/soroban-decompiler-cli"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400/70 underline decoration-blue-400/30 hover:decoration-blue-400/70"
        >
          crates.io
        </a>
        .
      </p>
    </div>
  );
}
