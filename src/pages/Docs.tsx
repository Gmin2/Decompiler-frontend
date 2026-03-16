import { useState } from 'react';
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
import { PATTERNS } from '../data/contracts';

type FlowNodeData = {
  title: string;
  subtitle: string;
  tone?: 'core' | 'type' | 'io';
};

const initialNodes: Node<FlowNodeData>[] = [
  {
    id: 'entry',
    type: 'docNode',
    position: { x: 40, y: 180 },
    data: { title: 'hello(env, to)', subtitle: 'entry function', tone: 'core' },
  },
  {
    id: 'vec',
    type: 'docNode',
    position: { x: 340, y: 70 },
    data: { title: 'vec![&env, ...]', subtitle: 'collection constructor', tone: 'core' },
  },
  {
    id: 'symbol',
    type: 'docNode',
    position: { x: 340, y: 290 },
    data: { title: 'symbol_short!("Hello")', subtitle: 'macro / symbol literal', tone: 'type' },
  },
  {
    id: 'return',
    type: 'docNode',
    position: { x: 700, y: 160 },
    data: { title: 'Vec<Symbol>', subtitle: 'return path', tone: 'io' },
  },
  {
    id: 'host',
    type: 'docNode',
    position: { x: 700, y: 360 },
    data: { title: 'host import map', subtitle: 'resolved calls', tone: 'type' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1',
    source: 'entry',
    target: 'vec',
    label: 'builds',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#d67a76' },
    style: { stroke: '#d67a76', strokeWidth: 1.5 },
    labelStyle: { fill: '#8f8477', fontSize: 11, letterSpacing: '0.08em' },
  },
  {
    id: 'e2',
    source: 'entry',
    target: 'symbol',
    label: 'emits',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#d67a76' },
    style: { stroke: '#d67a76', strokeWidth: 1.5 },
    labelStyle: { fill: '#8f8477', fontSize: 11, letterSpacing: '0.08em' },
  },
  {
    id: 'e3',
    source: 'vec',
    target: 'return',
    label: 'returns',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#d67a76' },
    style: { stroke: '#d67a76', strokeWidth: 1.5 },
    labelStyle: { fill: '#8f8477', fontSize: 11, letterSpacing: '0.08em' },
  },
  {
    id: 'e4',
    source: 'symbol',
    target: 'return',
    label: 'pushes',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#d67a76' },
    style: { stroke: '#d67a76', strokeWidth: 1.5 },
    labelStyle: { fill: '#8f8477', fontSize: 11, letterSpacing: '0.08em' },
  },
  {
    id: 'e5',
    source: 'symbol',
    target: 'host',
    label: 'maps to',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#d67a76' },
    style: { stroke: '#d67a76', strokeWidth: 1.5, strokeDasharray: '5 4' },
    labelStyle: { fill: '#8f8477', fontSize: 11, letterSpacing: '0.08em' },
  },
];

const FUNCTION_TRACE = [
  { step: 'Decode wasm export', detail: 'Locate exported `hello` entrypoint and derive signature.' },
  { step: 'Map host imports', detail: 'Resolve symbol construction and vector operations from raw imports.' },
  { step: 'Recover AST blocks', detail: 'Reconstruct expression tree for the vector literal and return path.' },
  { step: 'Emit Rust surface syntax', detail: 'Render contractimpl body with readable Soroban SDK types.' },
];

const TYPE_TABLE = [
  { name: 'Env', role: 'Context handle', source: 'sdk type' },
  { name: 'Symbol', role: 'String-like contract atom', source: 'decoded literal' },
  { name: 'Vec<Symbol>', role: 'Return payload', source: 'recovered container' },
];

const toneClasses: Record<NonNullable<FlowNodeData['tone']>, string> = {
  core: 'bg-[#fffdf8]',
  type: 'bg-[#fbf7ef]',
  io: 'bg-[#fffaf2]',
};

const FlowCardNode = ({ data, selected }: NodeProps<Node<FlowNodeData>>) => (
  <div
    className={`w-[220px] rounded-[24px] border p-4 text-left shadow-[0_16px_40px_rgba(58,46,30,0.05)] transition ${
      selected ? 'border-[#f08b57] ring-1 ring-[#f08b57]/25' : 'border-[#ddd4c8]'
    } ${toneClasses[data.tone ?? 'core']}`}
  >
    <Handle type="target" position={Position.Left} className="!h-3 !w-3 !border-2 !border-[#fdfbf7] !bg-[#d67a76]" />
    <div className="text-[10px] uppercase tracking-[0.22em] text-[#a29a8d]">
      {data.tone === 'core' ? 'core node' : data.tone === 'type' ? 'type node' : 'output node'}
    </div>
    <div className="mt-2 text-sm font-medium text-[#171412]">{data.title}</div>
    <div className="mt-2 text-xs leading-6 text-[#72695e]">{data.subtitle}</div>
    <Handle type="source" position={Position.Right} className="!h-3 !w-3 !border-2 !border-[#fdfbf7] !bg-[#d67a76]" />
  </div>
);

const nodeTypes = {
  docNode: FlowCardNode,
};

const DocsCanvas = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [activeNodeId, setActiveNodeId] = useState('entry');
  const activeNode = nodes.find((node) => node.id === activeNodeId) ?? nodes[0];

  return (
    <div className="px-[4vw] py-10">
      <div className="mx-auto max-w-[1400px]">
        <section className="paper-panel rounded-[34px] px-7 py-7">
          <div className="flex items-start justify-between gap-8">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#a29a8d]">AST / flow documentation</div>
              <h1 className="mt-3 text-[clamp(2.3rem,5vw,4.1rem)] leading-[0.95] text-[#171412]">
                Visualize function flow, extracted types, and host mappings
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#72695e]">
                Parse wasm, recover AST blocks, infer types, and expose function flow as a real node-edge graph for inspection.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Badge>xyflow canvas</Badge>
              <Badge>{PATTERNS.length} host patterns</Badge>
              <Badge>AST oriented</Badge>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <div className="paper-panel overflow-hidden rounded-[32px]">
              <div className="border-b paper-border px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-[#a29a8d]">Function flow graph</div>
                    <div className="mt-2 text-lg text-[#171412]">`hello` reconstruction pipeline</div>
                  </div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#8f8477]">
                    drag nodes / inspect edges
                  </div>
                </div>
              </div>

              <div className="h-[560px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_transparent_55%),linear-gradient(180deg,#fcfaf5_0%,#f8f3ea_100%)]">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onNodeClick={(_, node) => setActiveNodeId(node.id)}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.2 }}
                  minZoom={0.6}
                  maxZoom={1.6}
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

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="paper-panel rounded-[28px] p-5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[#a29a8d]">Function reconstruction flow</div>
                <div className="mt-5 space-y-4">
                  {FUNCTION_TRACE.map((item, index) => (
                    <div key={item.step} className="flex gap-4 rounded-2xl border paper-border bg-white/60 px-4 py-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#171412] text-[10px] uppercase tracking-[0.12em] text-[#f8f3ea]">
                        {index + 1}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[#171412]">{item.step}</div>
                        <div className="mt-2 text-sm leading-6 text-[#72695e]">{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="paper-panel rounded-[28px] p-5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[#a29a8d]">Recovered types</div>
                <div className="mt-5 overflow-hidden rounded-[24px] border paper-border">
                  <div className="grid grid-cols-3 bg-white/65 px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-[#a29a8d]">
                    <span>Type</span>
                    <span>Role</span>
                    <span>Source</span>
                  </div>
                  {TYPE_TABLE.map((item) => (
                    <div key={item.name} className="grid grid-cols-3 border-t paper-border-soft px-4 py-3 text-sm">
                      <span className="font-medium text-[#171412]">{item.name}</span>
                      <span className="text-[#72695e]">{item.role}</span>
                      <span className="text-[#8f8477]">{item.source}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="paper-panel rounded-[30px] p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#a29a8d]">Selected node</div>
              <div className="mt-4 rounded-[24px] border paper-border bg-white/60 px-4 py-4">
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#a29a8d]">Current focus</div>
                <div className="mt-2 text-lg font-medium text-[#171412]">{activeNode.data.title}</div>
                <p className="mt-3 text-sm leading-7 text-[#72695e]">
                  {activeNode.data.subtitle}. Use the canvas to inspect the recovered execution path, move nodes around, and trace how symbols and collections flow into the final return type.
                </p>
              </div>
            </div>

            <div className="paper-panel rounded-[30px] p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#a29a8d]">Host function extraction</div>
              <div className="mt-4 space-y-3">
                {PATTERNS.slice(0, 5).map((pattern) => (
                  <div key={pattern.name} className="rounded-2xl border paper-border bg-white/58 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-[#171412]">{pattern.name}</div>
                        <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-[#a29a8d]">
                          {pattern.module} / {pattern.category}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.14em] ${
                          pattern.status === 'handled'
                            ? 'bg-[#78875b]/10 text-[#78875b]'
                            : pattern.status === 'partial'
                              ? 'bg-[#c4a35a]/10 text-[#c4a35a]'
                              : 'bg-[#87605b]/10 text-[#87605b]'
                        }`}
                      >
                        {pattern.status}
                      </span>
                    </div>
                    <div className="mt-3 text-xs leading-6 text-[#72695e]">
                      SDK pattern: <code className="text-[#f08b57]">{pattern.sdk}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="paper-panel rounded-[30px] p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#a29a8d]">Graph goals</div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-[#72695e]">
                <li>Trace execution blocks from wasm exports to emitted Rust</li>
                <li>Show type propagation through recovered expressions</li>
                <li>Connect host function usage to higher-level AST nodes</li>
                <li>Bridge graph nodes back to decompiled source segments</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border paper-border bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[#8f8477]">
    {children}
  </span>
);

const Docs = () => (
  <ReactFlowProvider>
    <DocsCanvas />
  </ReactFlowProvider>
);

export default Docs;
