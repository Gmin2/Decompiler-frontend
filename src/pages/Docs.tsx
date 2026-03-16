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
  handled: { bg: 'bg-[#78875b]/10', text: 'text-[#78875b]', border: 'border-[#78875b]/30' },
  partial: { bg: 'bg-[#c4a35a]/10', text: 'text-[#c4a35a]', border: 'border-[#c4a35a]/30' },
  unhandled: { bg: 'bg-[#87605b]/10', text: 'text-[#87605b]', border: 'border-[#87605b]/30' },
};

const kindStyles = {
  center: 'w-[200px] bg-[#171412] text-[#f8f3ea] border-[#171412]',
  category: 'w-[200px] bg-[#fffdf8] border-[#ddd4c8]',
  pattern: 'w-[180px] bg-white/90 border-[#e8dfd3]',
};

const CatalogNode = ({ data, selected }: NodeProps<Node<NodeData>>) => {
  const sc = data.status ? statusColors[data.status] : null;

  return (
    <div className={`rounded-[18px] border px-4 py-3 text-left shadow-[0_8px_24px_rgba(58,46,30,0.04)] transition ${
      selected ? 'ring-2 ring-[#f08b57]/40' : ''
    } ${kindStyles[data.kind]}`}>
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#d67a76]" />
      {data.kind === 'center' ? (
        <>
          <div className="text-[10px] uppercase tracking-[0.22em] text-[#f8f3ea]/60">host runtime</div>
          <div className="mt-1 text-sm font-medium">{data.label}</div>
          {data.sublabel && <div className="mt-1 text-[10px] text-[#f8f3ea]/50">{data.sublabel}</div>}
        </>
      ) : data.kind === 'category' ? (
        <>
          <div className="text-[10px] uppercase tracking-[0.22em] text-[#a29a8d]">category</div>
          <div className="mt-1 text-sm font-medium text-[#171412]">{data.label}</div>
          {data.sublabel && <div className="mt-1 text-[10px] text-[#8f8477]">{data.sublabel}</div>}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-xs font-medium text-[#171412]">{data.label}</div>
            {sc && (
              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] uppercase tracking-[0.1em] ${sc.bg} ${sc.text}`}>
                {data.status}
              </span>
            )}
          </div>
        </>
      )}
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#d67a76]" />
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
                    <div className="text-[10px] uppercase tracking-[0.24em] text-[#a29a8d]">Soroban host function map</div>
                    <div className="mt-2 text-lg text-[#171412]">
                      {PATTERNS.length} patterns across {PATTERN_CATEGORIES.length} categories
                    </div>
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#8f8477]">
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
                    className="[&>button]:!border-[#ddd4c8] [&>button]:!bg-white/90 [&>button]:!text-[#72695e]"
                  />
                </ReactFlow>
              </div>
            </div>

            <div className="paper-panel rounded-[28px] p-6">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#a29a8d]">Decompilation pipeline</div>
              <div className="mt-2 text-sm text-[#72695e]">4-stage WASM to Rust reconstruction</div>
              <div className="mt-5 grid gap-4 xl:grid-cols-4">
                {PIPELINE.map((item, i) => (
                  <div key={item.step} className="rounded-2xl border paper-border bg-white/60 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#171412] text-[10px] text-[#f8f3ea]">
                        {i + 1}
                      </div>
                      <div className="text-sm font-medium text-[#171412]">{item.step}</div>
                    </div>
                    <div className="mt-3 text-xs leading-5 text-[#72695e]">{item.detail}</div>
                    <div className="mt-3 rounded-lg bg-[#171412]/5 px-2.5 py-1.5 text-[10px] font-mono text-[#8f8477]">
                      → {item.output}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="paper-panel rounded-[30px] p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#a29a8d]">
                {selectedPattern ? 'Pattern detail' : 'Inspector'}
              </div>

              {selectedPattern ? (
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border paper-border bg-white/60 px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-lg font-medium text-[#171412]">{selectedPattern.name}</div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${
                        statusColors[selectedPattern.status].bg
                      } ${statusColors[selectedPattern.status].text}`}>
                        {selectedPattern.status}
                      </span>
                    </div>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[#a29a8d]">
                      {selectedPattern.module} / {selectedPattern.category}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[#a29a8d] mb-2">Arguments</div>
                    <div className="rounded-2xl border paper-border bg-white/60 px-4 py-3 font-mono text-xs text-[#544c43]">
                      {selectedPattern.args || '(none)'}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[#a29a8d] mb-2">Return type</div>
                    <div className="rounded-2xl border paper-border bg-white/60 px-4 py-3 font-mono text-xs text-[#544c43]">
                      {selectedPattern.returnType}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-[#a29a8d] mb-2">SDK equivalent</div>
                    <div className="rounded-2xl border border-[#f08b57]/20 bg-[#f08b57]/[0.04] px-4 py-3 font-mono text-xs text-[#f08b57]">
                      {selectedPattern.sdk}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPattern(null)}
                    className="w-full rounded-full border paper-border py-2 text-[10px] uppercase tracking-[0.18em] text-[#72695e] hover:border-[#f08b57] hover:text-[#f08b57] transition-colors"
                  >
                    Clear selection
                  </button>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm leading-7 text-[#72695e]">
                    Click any pattern node in the graph to see its host function signature, arguments, return type, and SDK equivalent.
                  </p>
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#72695e]">Total patterns</span>
                      <span className="font-medium text-[#171412] tabular-nums">{PATTERNS.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#72695e]">Handled</span>
                      <span className="font-medium text-[#78875b] tabular-nums">{PATTERNS.filter((p) => p.status === 'handled').length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#72695e]">Partial</span>
                      <span className="font-medium text-[#c4a35a] tabular-nums">{PATTERNS.filter((p) => p.status === 'partial').length}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#72695e]">Categories</span>
                      <span className="font-medium text-[#171412] tabular-nums">{PATTERN_CATEGORIES.length}</span>
                    </div>
                  </div>

                  <div className="mt-6 text-[10px] uppercase tracking-[0.18em] text-[#a29a8d] mb-3">By category</div>
                  {PATTERN_CATEGORIES.map((cat) => {
                    const inCat = PATTERNS.filter((p) => p.category === cat);
                    const handled = inCat.filter((p) => p.status === 'handled').length;
                    return (
                      <div key={cat} className="flex items-center justify-between border-b paper-border-soft py-2 text-xs">
                        <span className="text-[#72695e]">{cat}</span>
                        <span className="tabular-nums text-[#171412]">{handled}/{inCat.length}</span>
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
