import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { NETWORKS, formatName, CONTRACTS } from '../data/contracts';
import { useDecompiler, type SpecJson, type ImportsJson } from '../context/DecompilerContext';
import WasmErrorDialog from '../components/WasmErrorDialog';

type Tab = 'rust' | 'host' | 'spec' | 'imports';

const TABS: { id: Tab; label: string; blurb: string }[] = [
  { id: 'rust', label: 'Decompiled Rust', blurb: 'Readable contract reconstruction' },
  { id: 'host', label: 'Host Calls', blurb: 'Resolved runtime imports' },
  { id: 'spec', label: 'Spec JSON', blurb: 'Derived interface metadata' },
  { id: 'imports', label: 'Raw Imports', blurb: 'Low-level wasm import table' },
];

const EMPTY_SPEC: SpecJson = { wasm_size: 0, functions: [], structs: [], enums: [], errors: [], events: [] };
const EMPTY_IMPORTS: ImportsJson = { total: 0, resolved: 0, unresolved: 0, imports: [] };

const Studio = () => {
  const [activeTab, setActiveTab] = useState<Tab>('rust');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [network, setNetwork] = useState(NETWORKS[0]?.value ?? 'testnet');
  const [contractIdInput, setContractIdInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    contractName,
    rustSource,
    specJson,
    importsJson,
    loading,
    error,
    loadFromUrl,
    loadFromFile,
    fetchFromRpc,
  } = useDecompiler();

  const spec = specJson ?? EMPTY_SPEC;
  const imp = importsJson ?? EMPTY_IMPORTS;

  // Auto-load from query params on mount
  useEffect(() => {
    const example = searchParams.get('example');
    const id = searchParams.get('id');
    const net = searchParams.get('network');

    if (example && !rustSource) {
      loadFromUrl(`/contracts/${example}.wasm`, formatName(example));
    } else if (id && !rustSource) {
      if (net) setNetwork(net);
      fetchFromRpc(id, net ?? network);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file?.name.endsWith('.wasm')) await loadFromFile(file);
  };

  const handleFetch = async () => {
    if (contractIdInput) await fetchFromRpc(contractIdInput, network);
  };

  return (
    <div className="h-full overflow-hidden px-5 py-5 text-[var(--color-ink)]">
      <div className="flex h-full flex-col gap-5">
        <header className="paper-panel rounded-[30px] px-6 py-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-ink-label)]">Studio workspace</div>
              <div className="mt-3 flex items-center gap-3">
                <h1 className="text-[2rem] leading-none text-[var(--color-ink)]">
                  {contractName || 'No contract loaded'}
                </h1>
                {spec.wasm_size > 0 && (
                  <span className="rounded-full border border-[var(--color-sand-border)] bg-[var(--color-surface)]/75 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--color-ink-sub)]">
                    {spec.wasm_size > 1024
                      ? `${(spec.wasm_size / 1024).toFixed(1)} KB`
                      : `${spec.wasm_size} B`}
                  </span>
                )}
                {loading && (
                  <span className="rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)]/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent)]">
                    Decompiling...
                  </span>
                )}
              </div>
              {error && error !== 'WASM_STACK_OVERFLOW' && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
              )}
              {error === 'WASM_STACK_OVERFLOW' && (
                <WasmErrorDialog
                  error={error}
                  contractName={contractName}
                  wasmSize={spec?.wasm_size ?? null}
                  onDismiss={() => {}}
                />
              )}
              {!rustSource && !loading && (
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-ink-body)]">
                  Upload a .wasm file, fetch a contract by ID, or pick one from the Gallery to get started.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={() => setLeftOpen(!leftOpen)}
                className="rounded-full border border-[var(--color-sand-border)] bg-[var(--color-surface)]/70 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-body)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
              >
                {leftOpen ? 'Hide explorer' : 'Show explorer'}
              </button>
              {rustSource && (
                <button
                  onClick={() => {
                    const match = CONTRACTS.find((c) => formatName(c.name) === contractName || c.name === contractName);
                    if (match) {
                      navigate(`/compare?example=${match.name}`);
                    } else {
                      navigate('/compare');
                    }
                  }}
                  className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--color-sand-cream)] hover:bg-[var(--color-accent)] transition-colors"
                >
                  Benchmark
                </button>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border border-[var(--color-sand-border)] bg-[var(--color-surface)]/70 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-body)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
              >
                Upload new
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".wasm"
                onChange={handleUpload}
                className="hidden"
              />
              <input
                value={contractIdInput}
                onChange={(e) => setContractIdInput(e.target.value)}
                placeholder="Contract ID..."
                className="paper-input w-44 rounded-full border px-4 py-2 text-sm outline-none placeholder:text-[var(--color-ink-dim)]"
              />
              <div className="relative">
                <select
                  value={network}
                  onChange={(event) => setNetwork(event.target.value)}
                  className="paper-input min-w-32 appearance-none rounded-full border py-2 pl-4 pr-10 text-sm outline-none"
                >
                  {NETWORKS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--color-ink-sub)]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </div>
              <button
                onClick={handleFetch}
                disabled={!contractIdInput || loading}
                className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--color-sand-cream)] hover:bg-[var(--color-accent)] transition-colors disabled:opacity-50"
              >
                Fetch
              </button>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-5" style={{ gridTemplateColumns: leftOpen ? '320px minmax(0,1fr) 310px' : 'minmax(0,1fr) 310px' }}>
          {leftOpen && (
            <aside className="paper-panel min-h-0 overflow-hidden rounded-[28px]">
              <div className="border-b paper-border px-5 py-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-ink-label)]">Contract explorer</div>
              </div>
              <div className="h-[calc(100%-57px)] overflow-y-auto px-5 py-5">
                <ExplorerTimeline
                  spec={spec}
                  imports={imp}
                  selectedItem={selectedItem}
                  onSelectItem={setSelectedItem}
                  contractName={contractName}
                />
              </div>
            </aside>
          )}

          <section className="paper-panel min-h-0 overflow-hidden rounded-[30px]">
            <div className="border-b paper-border px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[var(--color-ink)] text-[var(--color-sand-cream)]'
                        : 'bg-[var(--color-surface)]/70 text-[var(--color-ink-body)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-[var(--color-ink-sub)]">
                {TABS.find((tab) => tab.id === activeTab)?.blurb}
              </p>
            </div>

            <div className="h-[calc(100%-87px)] overflow-auto bg-[var(--color-sand-code)]">
              {activeTab === 'rust' && <CodeView code={rustSource || '// No contract loaded.\n// Upload a .wasm file, fetch by contract ID,\n// or pick one from the Gallery.'} />}
              {activeTab === 'host' && <HostCallsView imports={imp} />}
              {activeTab === 'spec' && <CodeView code={specJson ? JSON.stringify(specJson, null, 2) : '{}'} />}
              {activeTab === 'imports' && <CodeView code={importsJson ? JSON.stringify(importsJson, null, 2) : '{}'} />}
            </div>
          </section>

          <aside className="paper-panel min-h-0 overflow-hidden rounded-[28px]">
            <div className="border-b paper-border px-5 py-4">
              <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-ink-label)]">Inspector</div>
            </div>
            <div className="h-[calc(100%-57px)] overflow-y-auto px-5 py-5">
              {selectedItem ? (
                <>
                  {spec.functions
                    .filter((item) => item.name === selectedItem)
                    .map((item) => (
                      <div key={item.name}>
                        <Label>Function</Label>
                        <ValueBlock>{item.name}</ValueBlock>

                        <Label className="mt-5">Parameters</Label>
                        <div className="space-y-2">
                          {item.inputs.map((input) => (
                            <div key={input.name} className="rounded-2xl border paper-border bg-[var(--color-surface)]/60 px-4 py-3 text-xs">
                              <div className="text-[var(--color-ink-sub)]">{input.name}</div>
                              <div className="mt-1 font-medium text-[var(--color-ink)]">{input.type}</div>
                            </div>
                          ))}
                        </div>

                        <Label className="mt-5">Return type</Label>
                        <ValueBlock>{item.output || '()'}</ValueBlock>
                      </div>
                    ))}
                </>
              ) : (
                <div>
                  <Label>Contract</Label>
                  <ValueBlock>{contractName || 'none'}</ValueBlock>

                  <div className="mt-6 space-y-0">
                    {[
                      ['WASM Size', spec.wasm_size > 0 ? `${spec.wasm_size} bytes` : '-'],
                      ['Functions', String(spec.functions.length)],
                      ['Types', String(spec.structs.length + spec.enums.length)],
                      ['Errors', String(spec.errors.length)],
                      ['Events', String(spec.events.length)],
                      ['Host Imports', `${imp.total} (${imp.resolved} resolved)`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between border-b paper-border-soft py-3 text-xs">
                        <span className="text-[var(--color-ink-label)]">{label}</span>
                        <span className="font-medium text-[var(--color-ink)] tabular-nums">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const Label = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`mb-2 text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)] ${className}`}>{children}</div>
);

const ValueBlock = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border paper-border bg-[var(--color-surface)]/60 px-4 py-3 text-sm font-medium text-[var(--color-ink)]">
    {children}
  </div>
);

const ExplorerTimeline = ({
  spec,
  imports: imp,
  selectedItem,
  onSelectItem,
  contractName,
}: {
  spec: SpecJson;
  imports: ImportsJson;
  selectedItem: string | null;
  onSelectItem: (value: string | null) => void;
  contractName: string;
}) => (
  <div className="relative pl-6">
    <div className="absolute bottom-3 left-[10px] top-3 w-px bg-[var(--color-sand-border)]" />

    <TimelineGroup title="contract" tone="active">
      <TimelineItem
        title={contractName || 'none'}
        subtitle="entry module / root export surface"
        meta="root"
        active={selectedItem === null}
        tone="active"
        onClick={() => onSelectItem(null)}
      />
    </TimelineGroup>

    {spec.functions.length > 0 && (
      <TimelineGroup title="functions">
        {spec.functions.map((item, index) => (
          <TimelineItem
            key={item.name}
            title={item.name}
            subtitle={`${item.inputs.map((input) => input.type).join(', ') || 'no args'}${item.output ? ` -> ${item.output}` : ''}`}
            meta={`fn ${String(index + 1).padStart(2, '0')}`}
            active={selectedItem === item.name}
            tone="active"
            onClick={() => onSelectItem(item.name)}
          />
        ))}
      </TimelineGroup>
    )}

    <TimelineGroup title="contract data">
      <TimelineItem
        title="types"
        subtitle={`${spec.structs.length + spec.enums.length} recovered definitions`}
        meta="spec"
        active={false}
        tone={spec.structs.length + spec.enums.length > 0 ? 'active' : 'muted'}
        onClick={() => {}}
      />
      <TimelineItem
        title="errors"
        subtitle={`${spec.errors.length} recovered variants`}
        meta="spec"
        active={false}
        tone={spec.errors.length > 0 ? 'active' : 'muted'}
        onClick={() => {}}
      />
      <TimelineItem
        title="events"
        subtitle={`${spec.events.length} published schemas`}
        meta="spec"
        active={false}
        tone={spec.events.length > 0 ? 'active' : 'muted'}
        onClick={() => {}}
      />
    </TimelineGroup>

    <TimelineGroup title="runtime">
      <TimelineItem
        title="host imports"
        subtitle={`${imp.resolved}/${imp.total} resolved runtime calls`}
        meta="host"
        active={false}
        tone={imp.resolved > 0 ? 'active' : 'muted'}
        onClick={() => onSelectItem(null)}
      />
    </TimelineGroup>
  </div>
);

const TimelineGroup = ({
  title,
  tone = 'muted',
  children,
}: {
  title: string;
  tone?: 'active' | 'muted';
  children: React.ReactNode;
}) => (
  <div className="relative pb-4">
    <div className={`mb-2 flex items-center gap-3 ${tone === 'active' ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-body)]'}`}>
      <span className={`absolute left-[-20px] flex h-4 w-4 items-center justify-center ${tone === 'active' ? 'text-[var(--color-status-success)]' : 'text-[var(--color-sand-muted)]'}`}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><path d="M3 1l5 4-5 4V1z" /></svg>
      </span>
      <h3 className="text-[1.05rem] font-semibold capitalize tracking-[-0.02em]">{title}</h3>
    </div>
    <div className="space-y-1">{children}</div>
  </div>
);

const TimelineItem = ({
  title,
  subtitle,
  meta,
  active,
  tone,
  onClick,
}: {
  title: string;
  subtitle: string;
  meta: string;
  active: boolean;
  tone: 'active' | 'muted';
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative block w-full rounded-[18px] px-0 py-2 text-left transition-colors ${
      active ? 'bg-[var(--color-surface)]/70' : 'hover:bg-[var(--color-surface)]/45'
    }`}
  >
    <span
      className={`absolute left-[-19px] top-[16px] flex h-3 w-3 items-center justify-center ${
        tone === 'active' ? 'text-[var(--color-status-success)]' : 'text-[var(--color-sand-rule)]'
      }`}
    >
      <svg width="7" height="7" viewBox="0 0 10 10" fill="currentColor"><path d="M3 1l5 4-5 4V1z" /></svg>
    </span>
    <div className="flex items-start justify-between gap-3 px-3">
      <div className="min-w-0">
        <div className={`text-[0.98rem] font-semibold tracking-[-0.02em] ${active ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-bold)]'}`}>
          {title}
        </div>
        <div className="mt-1 text-[12px] leading-5 text-[var(--color-ink-mid)]">
          {subtitle}
        </div>
      </div>
      <span className="shrink-0 pt-0.5 text-[11px] text-[var(--color-ink-meta)]">{meta}</span>
    </div>
  </button>
);

const CodeView = ({ code }: { code: string }) => {
  const lines = code.split('\n');

  return (
    <div className="overflow-x-auto py-3 font-mono text-[13px] leading-7">
      <div className="min-w-fit">
        {lines.map((line, index) => (
          <div key={index} className="flex px-1 hover:bg-[var(--color-accent)]/[0.04]">
            <span className="w-12 shrink-0 select-none pl-4 pr-5 text-right text-xs tabular-nums text-[var(--color-ink-faint)] leading-7">
              {index + 1}
            </span>
            <pre className="whitespace-pre text-[var(--color-ink-code)]">{highlightRust(line)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

const highlightRust = (line: string): React.ReactNode => {
  if (line.trimStart().startsWith('//')) {
    return <span className="text-[var(--color-ink-dim)] italic">{line}</span>;
  }

  const parts: React.ReactNode[] = [];
  const keywords = /\b(pub|fn|struct|impl|use|let|return|mut|mod|type|enum|trait|const|unsafe|crate|self|Self)\b/g;
  const attrs = /#!\[.*?\]|#\[.*?\]/g;
  const types = /\b(Env|Symbol|Vec|Address|BytesN|Map|String|i128|u128|i64|u64|i32|u32|bool|Void)\b/g;
  const strings = /"[^"]*"/g;
  const macros = /\b(\w+!)/g;
  const result = line;
  const segments: { start: number; end: number; className: string }[] = [];

  let match;
  for (const [regex, className] of [
    [attrs, 'text-[var(--color-score-gold)]'],
    [strings, 'text-[var(--color-accent)]'],
    [macros, 'text-[var(--color-score-green)]'],
    [keywords, 'text-[var(--color-score-green)]'],
    [types, 'text-[var(--color-ink)] font-medium'],
  ] as [RegExp, string][]) {
    const runner = new RegExp(regex.source, regex.flags);
    while ((match = runner.exec(result)) !== null) {
      segments.push({ start: match.index, end: match.index + match[0].length, className });
    }
  }

  if (segments.length === 0) return line;

  segments.sort((a, b) => a.start - b.start);
  const filtered: typeof segments = [];
  let lastEnd = 0;

  for (const segment of segments) {
    if (segment.start >= lastEnd) {
      filtered.push(segment);
      lastEnd = segment.end;
    }
  }

  let position = 0;
  for (const segment of filtered) {
    if (segment.start > position) parts.push(result.slice(position, segment.start));
    parts.push(
      <span key={segment.start} className={segment.className}>
        {result.slice(segment.start, segment.end)}
      </span>
    );
    position = segment.end;
  }

  if (position < result.length) parts.push(result.slice(position));

  return <>{parts}</>;
};

const HostCallsView = ({ imports: imp }: { imports: ImportsJson }) => {
  const [filter, setFilter] = useState('');
  const filtered = imp.imports.filter((item) =>
    item.semantic_name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-5">
      <input
        type="text"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Filter by name..."
        className="paper-input mb-5 w-64 rounded-full border px-4 py-2 text-sm outline-none placeholder:text-[var(--color-ink-dim)]"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-[var(--color-ink-label)]">
              <th className="pb-3 pr-4 font-normal">Name</th>
              <th className="pb-3 pr-4 font-normal">Module</th>
              <th className="pb-3 pr-4 font-normal">Args</th>
              <th className="pb-3 pr-4 font-normal">Return</th>
              <th className="pb-3 pr-4 font-normal">Raw module</th>
              <th className="pb-3 font-normal">Raw field</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={`${item.module}-${item.field}`} className="border-t paper-border-soft hover:bg-[var(--color-accent)]/[0.04]">
                <td className="py-2.5 pr-4 font-medium text-[var(--color-ink)]">{item.semantic_name}</td>
                <td className="py-2.5 pr-4 text-[var(--color-score-green)]">{item.semantic_module}</td>
                <td className="py-2.5 pr-4 text-[var(--color-ink-body)]">{item.args.join(', ')}</td>
                <td className="py-2.5 pr-4 text-[var(--color-ink)]">{item.return_type}</td>
                <td className="py-2.5 pr-4 text-[var(--color-ink-dim)]">{item.module}</td>
                <td className="py-2.5 text-[var(--color-ink-dim)]">{item.field}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Studio;
