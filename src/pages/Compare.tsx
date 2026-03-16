import { useState, type ChangeEvent } from 'react';

const MOCK_ORIGINAL = `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec};

#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
        vec![&env, symbol_short!("Hello"), to]
    }
}`;

const MOCK_DECOMPILED = `#![no_std]
use soroban_sdk::{contract, contractimpl, vec, Env, Symbol, Vec};

#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
        vec![&env, Symbol::new(&env, "Hello"), to]
    }
}`;

const SCORE = {
  overall: 0.92,
  types: 1.0,
  signatures: 1.0,
  bodies: 0.85,
  function_scores: [{ name: 'hello', signature: 1.0, body: 0.85 }],
};

const statusTone = (same: boolean) =>
  same ? 'bg-transparent' : 'bg-[#f08b57]/[0.08]';

const scoreColor = (value: number) =>
  value >= 0.9 ? 'score-green' : value >= 0.8 ? 'score-yellow' : value >= 0.5 ? 'score-cyan' : 'score-red';

const Compare = () => {
  const [originalText, setOriginalText] = useState(MOCK_ORIGINAL);
  const [decompiledText, setDecompiledText] = useState(MOCK_DECOMPILED);
  const [hasScore, setHasScore] = useState(true);

  const handleOriginalFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setOriginalText(reader.result as string);
    reader.readAsText(file);
  };

  const handleDecompiledFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDecompiledText(reader.result as string);
    reader.readAsText(file);
  };

  const runComparison = () => {
    if (originalText && decompiledText) setHasScore(true);
  };

  const loadMock = () => {
    setOriginalText(MOCK_ORIGINAL);
    setDecompiledText(MOCK_DECOMPILED);
    setHasScore(true);
  };

  const originalLines = originalText.split('\n');
  const decompiledLines = decompiledText.split('\n');
  const totalLines = Math.max(originalLines.length, decompiledLines.length);
  const changedCount = Array.from({ length: totalLines }).filter((_, index) => (
    (originalLines[index] ?? '') !== (decompiledLines[index] ?? '')
  )).length;

  return (
    <div className="px-[4vw] py-10">
      <div className="mx-auto max-w-[1400px]">
        <section className="paper-panel rounded-[34px] px-7 py-7">
          <div className="flex items-start justify-between gap-8">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-[#a29a8d]">Review workspace</div>
              <h1 className="mt-3 text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.95] text-[#171412]">
                Compare source and decompiled output
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[#72695e]">
                Review reconstructed Rust against the expected source with a diff layout closer to a GitHub code review, while keeping Sorbon’s lighter paper palette.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={loadMock}
                className="rounded-full border paper-border bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#72695e] hover:border-[#f08b57] hover:text-[#f08b57] transition-colors"
              >
                Load mock
              </button>
              <button
                onClick={() => {
                  setOriginalText('');
                  setDecompiledText('');
                  setHasScore(false);
                }}
                className="rounded-full border paper-border bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[#72695e] hover:border-[#f08b57] hover:text-[#f08b57] transition-colors"
              >
                Clear
              </button>
              <button
                onClick={runComparison}
                className="rounded-full bg-[#171412] px-5 py-2 text-[10px] uppercase tracking-[0.22em] text-[#f8f3ea] hover:bg-[#f08b57] transition-colors"
              >
                Run compare
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="rounded-full border paper-border bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[#8f8477]">
              Mock diff ready
            </span>
            <span className="rounded-full border paper-border bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[#8f8477]">
              {changedCount} changed lines
            </span>
            <span className="rounded-full border paper-border bg-white/70 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-[#8f8477]">
              GitHub-style review
            </span>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-2">
              <UploadCard
                title="Original source"
                subtitle="Expected Rust implementation"
                onChange={handleOriginalFile}
              />
              <UploadCard
                title="Decompiled output"
                subtitle="Sorbon reconstruction"
                onChange={handleDecompiledFile}
              />
            </div>

            <div className="paper-panel overflow-hidden rounded-[32px]">
              <div className="border-b paper-border px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-[#a29a8d]">hello_world.rs</div>
                    <div className="mt-2 text-lg text-[#171412]">Side-by-side diff review</div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em]">
                    <span className="rounded-full bg-[#78875b]/10 px-3 py-1 text-[#78875b]">
                      {totalLines - changedCount} stable
                    </span>
                    <span className="rounded-full bg-[#f08b57]/10 px-3 py-1 text-[#f08b57]">
                      {changedCount} changed
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid xl:grid-cols-2">
                <DiffColumn title="Original" lines={originalLines} otherLines={decompiledLines} />
                <DiffColumn title="Decompiled" lines={decompiledLines} otherLines={originalLines} />
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="paper-panel rounded-[30px] p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#a29a8d]">Accuracy score</div>
              {hasScore ? (
                <div className="mt-5">
                  <ScoreBar value={SCORE.overall} label="Overall" />
                  <div className="my-4 h-px bg-[#e1d8cc]" />
                  <ScoreBar value={SCORE.types} label="Types" weight="20%" />
                  <ScoreBar value={SCORE.signatures} label="Signatures" weight="20%" />
                  <ScoreBar value={SCORE.bodies} label="Bodies" weight="60%" />
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#8f8477]">Load or upload both files to generate the mock comparison view.</p>
              )}
            </div>

            <div className="paper-panel rounded-[30px] p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#a29a8d]">Review notes</div>
              <div className="mt-4 space-y-3">
                <ReviewNote tone="good" title="Signatures preserved">
                  The function boundary and return type are reconstructed correctly.
                </ReviewNote>
                <ReviewNote tone="warn" title="Literal reconstruction differs">
                  `symbol_short!` became `Symbol::new`, which is valid but less exact.
                </ReviewNote>
                <ReviewNote tone="good" title="Contract structure stable">
                  Contract and impl layout match the original source file.
                </ReviewNote>
              </div>
            </div>

            <div className="paper-panel rounded-[30px] p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#a29a8d]">Per-function</div>
              <div className="mt-4 space-y-3">
                {SCORE.function_scores.map((item) => (
                  <div key={item.name} className="rounded-2xl border paper-border bg-white/60 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#171412]">{item.name}</span>
                      <span className="text-[10px] uppercase tracking-[0.18em] text-[#8f8477]">function</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[#a29a8d]">Signature</div>
                        <div className="mt-1 font-medium text-[#171412]">{(item.signature * 100).toFixed(0)}%</div>
                      </div>
                      <div>
                        <div className="text-[#a29a8d]">Body</div>
                        <div className="mt-1 font-medium text-[#171412]">{(item.body * 100).toFixed(0)}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

const UploadCard = ({
  title,
  subtitle,
  onChange,
}: {
  title: string;
  subtitle: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="paper-panel rounded-[28px] p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-[#a29a8d]">{title}</div>
        <div className="mt-2 text-sm text-[#72695e]">{subtitle}</div>
      </div>
      <label className="cursor-pointer rounded-full border paper-border bg-white/70 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[#72695e] hover:border-[#f08b57] hover:text-[#f08b57] transition-colors">
        Upload .rs
        <input type="file" accept=".rs" onChange={onChange} className="hidden" />
      </label>
    </div>
  </div>
);

const ScoreBar = ({ value, label, weight }: { value: number; label: string; weight?: string }) => (
  <div className="mb-3">
    <div className="mb-1 flex items-center justify-between text-xs">
      <span className="text-[#72695e]">{label}</span>
      <div className="flex items-center gap-2">
        {weight && <span className="text-[10px] text-[#a29a8d]">{weight}</span>}
        <span className="font-medium text-[#171412] tabular-nums">{(value * 100).toFixed(0)}%</span>
      </div>
    </div>
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8dfd3]">
      <div className={`h-full ${scoreColor(value)}`} style={{ width: `${value * 100}%` }} />
    </div>
  </div>
);

const ReviewNote = ({
  tone,
  title,
  children,
}: {
  tone: 'good' | 'warn';
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-2xl border paper-border bg-white/58 px-4 py-3">
    <div className={`text-[10px] uppercase tracking-[0.18em] ${tone === 'good' ? 'text-[#78875b]' : 'text-[#f08b57]'}`}>
      {title}
    </div>
    <p className="mt-2 text-sm leading-6 text-[#72695e]">{children}</p>
  </div>
);

const DiffColumn = ({
  title,
  lines,
  otherLines,
}: {
  title: string;
  lines: string[];
  otherLines: string[];
}) => {
  const total = Math.max(lines.length, otherLines.length);

  return (
    <div className="min-w-0 border-r paper-border last:border-r-0">
      <div className="border-b paper-border bg-white/45 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-[#8f8477]">
        {title}
      </div>
      <div className="max-h-[62vh] overflow-auto font-mono text-[13px] leading-7">
        {Array.from({ length: total }).map((_, index) => {
          const line = lines[index] ?? '';
          const other = otherLines[index] ?? '';
          const same = line === other;

          return (
            <div key={index} className={`flex border-b paper-border-soft px-1 ${statusTone(same)}`}>
              <span className="w-12 shrink-0 select-none pl-4 pr-4 text-right text-xs tabular-nums text-[#c8bfb2] leading-7">
                {index + 1}
              </span>
              <pre className="min-w-0 whitespace-pre-wrap break-words py-1 text-[#544c43]">
                {line || ' '}
              </pre>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Compare;
