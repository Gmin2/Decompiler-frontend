import { useMemo, useState } from 'react';
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PATTERNS, PATTERN_CATEGORIES, type Pattern } from '../data/contracts';

type NodeData = {
  label: string;
  sublabel?: string;
  kind: 'center' | 'category' | 'pattern';
  status?: 'handled' | 'partial' | 'unhandled';
  patternName?: string;
};

const CATEGORY_POSITIONS: Record<string, { x: number; y: number }> = {
  Storage: { x: 340, y: 0 },
  Authentication: { x: 340, y: 140 },
  Context: { x: 340, y: 280 },
  Collections: { x: 340, y: 420 },
  Types: { x: 340, y: 560 },
  Crypto: { x: 340, y: 700 },
  Ledger: { x: 340, y: 840 },
  'Cross-contract': { x: 340, y: 940 },
};

function buildGraph() {
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: 'center',
    type: 'catalogNode',
    position: { x: 0, y: 420 },
    data: { label: 'Soroban Host Layer', sublabel: `${PATTERNS.length} recognized patterns`, kind: 'center' },
  });

  PATTERN_CATEGORIES.forEach((cat) => {
    const pos = CATEGORY_POSITIONS[cat] ?? { x: 340, y: 0 };
    const patternsInCat = PATTERNS.filter((p) => p.category === cat);
    const handled = patternsInCat.filter((p) => p.status === 'handled').length;

    nodes.push({
      id: `cat-${cat}`,
      type: 'catalogNode',
      position: pos,
      data: { label: cat, sublabel: `${handled}/${patternsInCat.length} handled`, kind: 'category' },
    });

    edges.push({
      id: `e-center-${cat}`,
      source: 'center',
      target: `cat-${cat}`,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#d67a76' },
      style: { stroke: '#d67a76', strokeWidth: 1.4 },
    });

    patternsInCat.forEach((p, i) => {
      const nodeId = `pat-${p.name}`;
      nodes.push({
        id: nodeId,
        type: 'catalogNode',
        position: { x: pos.x + 320, y: pos.y + i * 60 - ((patternsInCat.length - 1) * 30) },
        data: { label: p.name, kind: 'pattern', status: p.status, patternName: p.name },
      });

      edges.push({
        id: `e-${cat}-${p.name}`,
        source: `cat-${cat}`,
        target: nodeId,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ddd4c8' },
        style: { stroke: '#ddd4c8', strokeWidth: 1 },
      });
    });
  });

  return { nodes, edges };
}

const statusColors = {
  handled: { bg: 'bg-[var(--color-score-green)]/10', text: 'text-[var(--color-score-green)]', border: 'border-[var(--color-score-green)]/30' },
  partial: { bg: 'bg-[var(--color-score-gold)]/10', text: 'text-[var(--color-score-gold)]', border: 'border-[var(--color-score-gold)]/30' },
  unhandled: { bg: 'bg-[var(--color-score-rust)]/10', text: 'text-[var(--color-score-rust)]', border: 'border-[var(--color-score-rust)]/30' },
};

const kindStyles = {
  center: 'w-[200px] bg-[var(--color-ink)] text-[var(--color-sand-cream)] border-[var(--color-ink)]',
  category: 'w-[200px] bg-[var(--color-sand-white)] border-[var(--color-sand-border)]',
  pattern: 'w-[180px] bg-[var(--color-surface)]/90 border-[var(--color-sand-track)]',
};

const CatalogNode = ({ data, selected }: NodeProps<Node<NodeData>>) => {
  const sc = data.status ? statusColors[data.status] : null;

  return (
    <div className={`rounded-[18px] border px-4 py-3 text-left shadow-[0_8px_24px_rgba(58,46,30,0.04)] transition ${
      selected ? 'ring-2 ring-[var(--color-accent)]/40' : ''
    } ${kindStyles[data.kind]}`}>
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[var(--color-status-node)]" />
      {data.kind === 'center' ? (
        <>
          <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-sand-cream)]/60">host runtime</div>
          <div className="mt-1 text-sm font-medium">{data.label}</div>
          {data.sublabel && <div className="mt-1 text-[10px] text-[var(--color-sand-cream)]/50">{data.sublabel}</div>}
        </>
      ) : data.kind === 'category' ? (
        <>
          <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">category</div>
          <div className="mt-1 text-sm font-medium text-[var(--color-ink)]">{data.label}</div>
          {data.sublabel && <div className="mt-1 text-[10px] text-[var(--color-ink-sub)]">{data.sublabel}</div>}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-xs font-medium text-[var(--color-ink)]">{data.label}</div>
            {sc && (
              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] uppercase tracking-[0.1em] ${sc.bg} ${sc.text}`}>
                {data.status}
              </span>
            )}
          </div>
        </>
      )}
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[var(--color-status-node)]" />
    </div>
  );
};

const nodeTypes = { catalogNode: CatalogNode };

const PIPELINE = [
  { step: 'Spec Extraction', detail: 'Read contractspecv0 custom section. Recover struct definitions, enum variants, error types, event schemas, and function signatures via XDR deserialization.', output: 'ScSpecEntry[]' },
  { step: 'Stack Simulation', detail: 'Parse WASM with walrus, trace dispatcher chain, simulate operand stack instruction-by-instruction. Track values through locals, memory, function calls.', output: 'AnalyzedModule' },
  { step: 'Pattern Recognition', detail: 'Map host call sequences to SDK method chains. Strip Val encoding, decode SymbolSmall, merge i128 pairs. Run 6 optimization passes (CSE, DCE, i128, guards, identity, hoisting).', output: 'FunctionIR[]' },
  { step: 'Code Generation', detail: 'Walk IR, emit Rust token streams via syn/quote. Reconstruct #[contracttype] structs, #[contractimpl] bodies, storage ops, auth calls. Format with prettyplease.', output: 'String (Rust)' },
];

const DocsCanvas = () => {
  const { nodes: initNodes, edges: initEdges } = useMemo(buildGraph, []);
  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(initEdges);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);

  const handleNodeClick = (_: unknown, node: Node<NodeData>) => {
    if (node.data.patternName) {
      const p = PATTERNS.find((pat) => pat.name === node.data.patternName);
      setSelectedPattern(p ?? null);
    } else {
      setSelectedPattern(null);
    }
  };

  return (
    <div className="px-[4vw] py-10">
      <div className="mx-auto max-w-[1400px]">
        <section className="mt-0 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <div className="paper-panel overflow-hidden rounded-[32px]">
              <div className="border-b paper-border px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-ink-label)]">Soroban host function map</div>
                    <div className="mt-2 text-lg text-[var(--color-ink)]">
                      {PATTERNS.length} patterns across {PATTERN_CATEGORIES.length} categories
                    </div>
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink-sub)]">
                    click a pattern node to inspect
                  </div>
                </div>
              </div>

              <div className="h-[620px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_transparent_55%),linear-gradient(180deg,#fcfaf5_0%,#f8f3ea_100%)]">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={handleNodeClick}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.15 }}
                  minZoom={0.3}
                  maxZoom={1.4}
                  proOptions={{ hideAttribution: true }}
                  className="bg-transparent"
                >
                  <Background color="#e9dfd3" gap={28} size={1} />
                  <Controls
                    showInteractive={false}
                    className="[&>button]:!border-[var(--color-sand-border)] [&>button]:!bg-[var(--color-surface)]/90 [&>button]:!text-[var(--color-ink-body)]"
                  />
                </ReactFlow>
              </div>
            </div>

            <div className="paper-panel rounded-[28px] p-6">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">Decompilation pipeline</div>
              <div className="mt-2 text-sm text-[var(--color-ink-body)]">4-stage WASM to Rust reconstruction</div>
              <div className="mt-5 grid gap-4 xl:grid-cols-4">
                {PIPELINE.map((item, i) => (
                  <div key={item.step} className="rounded-2xl border paper-border bg-[var(--color-surface)]/60 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)] text-[10px] text-[var(--color-sand-cream)]">
                        {i + 1}
                      </div>
                      <div className="text-sm font-medium text-[var(--color-ink)]">{item.step}</div>
                    </div>
                    <div className="mt-3 text-xs leading-5 text-[var(--color-ink-body)]">{item.detail}</div>
                    <div className="mt-3 rounded-lg bg-[var(--color-ink)]/5 px-2.5 py-1.5 text-[10px] font-mono text-[var(--color-ink-sub)]">
                      → {item.output}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="paper-panel rounded-[30px] p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">
                {selectedPattern ? 'Pattern detail' : 'Inspector'}
              </div>

              {selectedPattern ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border paper-border bg-[var(--color-surface)]/60 px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-lg font-medium text-[var(--color-ink)]">{selectedPattern.name}</div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${
                        statusColors[selectedPattern.status].bg
                      } ${statusColors[selectedPattern.status].text}`}>
                        {selectedPattern.status}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[var(--color-ink-label)]">
                      {selectedPattern.module} / {selectedPattern.category}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-label)] mb-2">Arguments</div>
                    <div className="rounded-2xl border paper-border bg-[var(--color-surface)]/60 px-4 py-3 font-mono text-xs text-[var(--color-ink-code)]">
                      {selectedPattern.args || '(none)'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-label)] mb-2">Return type</div>
                    <div className="rounded-2xl border paper-border bg-[var(--color-surface)]/60 px-4 py-3 font-mono text-xs text-[var(--color-ink-code)]">
                      {selectedPattern.returnType}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-label)] mb-2">SDK equivalent</div>
                    <div className="rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/[0.04] px-4 py-3 font-mono text-xs text-[var(--color-accent)]">
                      {selectedPattern.sdk}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPattern(null)}
                    className="w-full rounded-full border paper-border py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-body)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    Clear selection
                  </button>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm leading-7 text-[var(--color-ink-body)]">
                    Click any pattern node in the graph to see its host function signature, arguments, return type, and SDK equivalent.
                  </p>
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-ink-body)]">Total patterns</span>
                      <span className="font-medium text-[var(--color-ink)] tabular-nums">{PATTERNS.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-ink-body)]">Handled</span>
                      <span className="font-medium text-[var(--color-score-green)] tabular-nums">{PATTERNS.filter((p) => p.status === 'handled').length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-ink-body)]">Partial</span>
                      <span className="font-medium text-[var(--color-score-gold)] tabular-nums">{PATTERNS.filter((p) => p.status === 'partial').length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-ink-body)]">Categories</span>
                      <span className="font-medium text-[var(--color-ink)] tabular-nums">{PATTERN_CATEGORIES.length}</span>
                    </div>
                  </div>

                  <div className="mt-6 text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-label)] mb-3">By category</div>
                  {PATTERN_CATEGORIES.map((cat) => {
                    const inCat = PATTERNS.filter((p) => p.category === cat);
                    const handled = inCat.filter((p) => p.status === 'handled').length;
                    return (
                      <div key={cat} className="flex items-center justify-between border-b paper-border-soft py-2 text-xs">
                        <span className="text-[var(--color-ink-body)]">{cat}</span>
                        <span className="tabular-nums text-[var(--color-ink)]">{handled}/{inCat.length}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

const Docs = () => (
  <ReactFlowProvider>
    <DocsCanvas />
  </ReactFlowProvider>
);

export default Docs;
