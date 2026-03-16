import { useState } from 'react';
import { NETWORKS, MOCK_RUST_SOURCE, MOCK_SPEC, MOCK_IMPORTS } from '../data/contracts';

type Tab = 'rust' | 'host' | 'spec' | 'imports';

const TABS: { id: Tab; label: string; blurb: string }[] = [
  { id: 'rust', label: 'Decompiled Rust', blurb: 'Readable contract reconstruction' },
  { id: 'host', label: 'Host Calls', blurb: 'Resolved runtime imports' },
  { id: 'spec', label: 'Spec JSON', blurb: 'Derived interface metadata' },
  { id: 'imports', label: 'Raw Imports', blurb: 'Low-level wasm import table' },
];

const Studio = () => {
  const [activeTab, setActiveTab] = useState<Tab>('rust');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [leftOpen, setLeftOpen] = useState(true);
  const [network, setNetwork] = useState(NETWORKS[0]?.value ?? 'testnet');

  return (
    <div className="h-full overflow-hidden px-5 py-5 text-[#171412]">
      <div className="flex h-full flex-col gap-5">
        <header className="paper-panel rounded-[30px] px-6 py-5">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#a29a8d]">Studio workspace</div>
              <div className="mt-3 flex items-center gap-3">
                <h1 className="text-[2rem] leading-none text-[#171412]">hello_world</h1>
                <span className="rounded-full border border-[#ddd4c8] bg-white/75 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#8f8477]">
                  660 B
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#72695e]">
                Inspect the decompiled contract, browse function structure, and move between host calls, spec output, and raw imports without leaving the workspace.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={() => setLeftOpen(!leftOpen)}
                className="rounded-full border border-[#ddd4c8] bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#72695e] hover:border-[#f08b57] hover:text-[#f08b57] transition-colors"
              >
                {leftOpen ? 'Hide explorer' : 'Show explorer'}
              </button>
              <button className="rounded-full border border-[#ddd4c8] bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#72695e] hover:border-[#f08b57] hover:text-[#f08b57] transition-colors">
                Upload new
              </button>
              <input
                placeholder="Contract ID..."
                className="paper-input w-44 rounded-full border px-4 py-2 text-sm outline-none placeholder:text-[#b4ab9e]"
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
                <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#8f8477]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </div>
              <button className="rounded-full bg-[#171412] px-5 py-2 text-[10px] uppercase tracking-[0.22em] text-[#f8f3ea] hover:bg-[#f08b57] transition-colors">
                Fetch
              </button>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-5" style={{ gridTemplateColumns: leftOpen ? '260px minmax(0,1fr) 310px' : 'minmax(0,1fr) 310px' }}>
          {leftOpen && (
            <aside className="paper-panel min-h-0 overflow-hidden rounded-[28px]">
              <div className="border-b paper-border px-5 py-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#a29a8d]">Contract explorer</div>
              </div>
              <div className="h-[calc(100%-57px)] overflow-y-auto px-5 py-5">
                <ExplorerTimeline
                  selectedItem={selectedItem}
                  onSelectItem={setSelectedItem}
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
                        ? 'bg-[#171412] text-[#f8f3ea]'
                        : 'bg-white/70 text-[#72695e] hover:text-[#171412]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-[#8f8477]">
                {TABS.find((tab) => tab.id === activeTab)?.blurb}
              </p>
            </div>

            <div className="h-[calc(100%-87px)] overflow-auto bg-[#fdfbf7]">
              {activeTab === 'rust' && <CodeView code={MOCK_RUST_SOURCE} />}
              {activeTab === 'host' && <HostCallsView />}
              {activeTab === 'spec' && <CodeView code={JSON.stringify(MOCK_SPEC, null, 2)} />}
              {activeTab === 'imports' && <CodeView code={JSON.stringify(MOCK_IMPORTS, null, 2)} />}
            </div>
          </section>

          <aside className="paper-panel min-h-0 overflow-hidden rounded-[28px]">
            <div className="border-b paper-border px-5 py-4">
              <div className="text-[10px] uppercase tracking-[0.24em] text-[#a29a8d]">Inspector</div>
            </div>
            <div className="h-[calc(100%-57px)] overflow-y-auto px-5 py-5">
              {selectedItem ? (
                <>
                  {MOCK_SPEC.functions
                    .filter((item) => item.name === selectedItem)
                    .map((item) => (
                      <div key={item.name}>
                        <Label>Function</Label>
                        <ValueBlock>{item.name}</ValueBlock>

                        <Label className="mt-5">Parameters</Label>
                        <div className="space-y-2">
                          {item.inputs.map((input) => (
                            <div key={input.name} className="rounded-2xl border paper-border bg-white/60 px-4 py-3 text-xs">
                              <div className="text-[#8f8477]">{input.name}</div>
                              <div className="mt-1 font-medium text-[#171412]">{input.type}</div>
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
                  <ValueBlock>hello_world</ValueBlock>

                  <div className="mt-6 space-y-0">
                    {[
                      ['WASM Size', `${MOCK_SPEC.wasm_size} bytes`],
                      ['Functions', String(MOCK_SPEC.functions.length)],
                      ['Types', String(MOCK_SPEC.structs.length + MOCK_SPEC.enums.length)],
                      ['Errors', String(MOCK_SPEC.errors.length)],
                      ['Events', String(MOCK_SPEC.events.length)],
                      ['Host Imports', `${MOCK_IMPORTS.total} (${MOCK_IMPORTS.resolved} resolved)`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between border-b paper-border-soft py-3 text-xs">
                        <span className="text-[#a29a8d]">{label}</span>
                        <span className="font-medium text-[#171412] tabular-nums">{value}</span>
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
  <div className={`mb-2 text-[10px] uppercase tracking-[0.22em] text-[#a29a8d] ${className}`}>{children}</div>
);

const ValueBlock = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border paper-border bg-white/60 px-4 py-3 text-sm font-medium text-[#171412]">
    {children}
  </div>
);

const ExplorerTimeline = ({
  selectedItem,
  onSelectItem,
}: {
  selectedItem: string | null;
  onSelectItem: (value: string | null) => void;
}) => {
  return (
    <div className="relative pl-6">
      <div className="absolute bottom-3 left-[10px] top-3 w-px bg-[#ddd4c8]" />

      <TimelineGroup title="contract" tone="active">
        <TimelineItem
          title="hello_world"
          subtitle="entry module / root export surface"
          meta="root"
          active={selectedItem === null}
          tone="active"
          onClick={() => onSelectItem(null)}
        />
      </TimelineGroup>

      <TimelineGroup title="functions">
        {MOCK_SPEC.functions.map((item, index) => (
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

      <TimelineGroup title="contract data">
        <TimelineItem
          title="types"
          subtitle={`${MOCK_SPEC.structs.length + MOCK_SPEC.enums.length} recovered definitions`}
          meta="spec"
          active={false}
          tone="muted"
          onClick={() => {}}
        />
        <TimelineItem
          title="errors"
          subtitle={`${MOCK_SPEC.errors.length} recovered variants`}
          meta="spec"
          active={false}
          tone="muted"
          onClick={() => {}}
        />
        <TimelineItem
          title="events"
          subtitle={`${MOCK_SPEC.events.length} published schemas`}
          meta="spec"
          active={false}
          tone="muted"
          onClick={() => {}}
        />
      </TimelineGroup>

      <TimelineGroup title="runtime">
        <TimelineItem
          title="host imports"
          subtitle={`${MOCK_IMPORTS.resolved}/${MOCK_IMPORTS.total} resolved runtime calls`}
          meta="host"
          active={false}
          tone="muted"
          onClick={() => onSelectItem(null)}
        />
      </TimelineGroup>
    </div>
  );
};

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
    <div className={`mb-2 flex items-center gap-3 ${tone === 'active' ? 'text-[#171412]' : 'text-[#72695e]'}`}>
      <span className={`absolute left-[-18px] h-2.5 w-2.5 rounded-full border ${tone === 'active' ? 'border-[#22c55e] bg-[#22c55e]' : 'border-[#d6cdc0] bg-[#f6f1e8]'}`} />
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
      active ? 'bg-white/70' : 'hover:bg-white/45'
    }`}
  >
    <span
      className={`absolute left-[-18px] top-[18px] h-1.5 w-1.5 rounded-full ${
        tone === 'active' ? 'bg-[#22c55e]' : 'bg-[#d8d0c3]'
      }`}
    />
    <div className="flex items-start justify-between gap-3 px-3">
      <div className="min-w-0">
        <div className={`text-[0.98rem] font-semibold tracking-[-0.02em] ${active ? 'text-[#171412]' : 'text-[#3f382f]'}`}>
          {title}
        </div>
        <div className="mt-1 text-[12px] leading-5 text-[#7e7468]">
          {subtitle}
        </div>
      </div>
      <span className="shrink-0 pt-0.5 text-[11px] text-[#b2a89b]">{meta}</span>
    </div>
  </button>
);

const CodeView = ({ code }: { code: string }) => {
  const lines = code.split('\n');

  return (
    <div className="py-3 font-mono text-[13px] leading-7">
      {lines.map((line, index) => (
        <div key={index} className="flex px-1 hover:bg-[#f08b57]/[0.04]">
          <span className="w-12 shrink-0 select-none pl-4 pr-5 text-right text-xs tabular-nums text-[#c8bfb2] leading-7">
            {index + 1}
          </span>
          <pre className="whitespace-pre text-[#544c43]">{highlightRust(line)}</pre>
        </div>
      ))}
    </div>
  );
};

const highlightRust = (line: string): React.ReactNode => {
  if (line.trimStart().startsWith('//')) {
    return <span className="text-[#b4ab9e] italic">{line}</span>;
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
    [attrs, 'text-[#c4a35a]'],
    [strings, 'text-[#f08b57]'],
    [macros, 'text-[#78875b]'],
    [keywords, 'text-[#78875b]'],
    [types, 'text-[#171412] font-medium'],
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

const HostCallsView = () => {
  const [filter, setFilter] = useState('');
  const filtered = MOCK_IMPORTS.imports.filter((item) =>
    item.semantic_name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-5">
      <input
        type="text"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        placeholder="Filter by name..."
        className="paper-input mb-5 w-64 rounded-full border px-4 py-2 text-sm outline-none placeholder:text-[#b4ab9e]"
      />

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-[#a29a8d]">
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
              <tr key={item.semantic_name} className="border-t paper-border-soft hover:bg-[#f08b57]/[0.04]">
                <td className="py-2.5 pr-4 font-medium text-[#171412]">{item.semantic_name}</td>
                <td className="py-2.5 pr-4 text-[#78875b]">{item.semantic_module}</td>
                <td className="py-2.5 pr-4 text-[#72695e]">{item.args.join(', ')}</td>
                <td className="py-2.5 pr-4 text-[#171412]">{item.return_type}</td>
                <td className="py-2.5 pr-4 text-[#b4ab9e]">{item.module}</td>
                <td className="py-2.5 text-[#b4ab9e]">{item.field}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Studio;
