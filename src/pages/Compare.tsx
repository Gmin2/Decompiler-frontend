import { useEffect, useState, useRef, type ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { scoreWasm, decompileWasm } from '../lib/wasm';
import { CONTRACTS, formatName } from '../data/contracts';

interface ScoreResult {
  overall: number;
  types: number;
  signatures: number;
  bodies: number;
  function_scores: { name: string; signature: number; body: number }[];
}

interface BatchEntry {
  name: string;
  score: ScoreResult | null;
  original: string;
  decompiled: string;
  error?: string;
}

type Mode = 'batch' | 'single';

const tierLabel = (pct: number) =>
  pct >= 90 ? 'top' : pct >= 80 ? 'high' : pct >= 50 ? 'mid' : pct >= 30 ? 'low' : 'minimal';

const tierColor = (pct: number) =>
  pct >= 90 ? 'text-[var(--color-score-green)]' : pct >= 80 ? 'text-[var(--color-score-gold)]' : pct >= 50 ? 'text-[var(--color-score-teal)]' : 'text-[var(--color-score-rust)]';

const scoreColor = (value: number) =>
  value >= 0.9 ? 'score-green' : value >= 0.8 ? 'score-yellow' : value >= 0.5 ? 'score-cyan' : 'score-red';

const Compare = () => {
  const [mode, setMode] = useState<Mode>('batch');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('example')) setMode('single');
  }, [searchParams]);

  return (
    <div className="px-[4vw] py-10">
      <div className="mx-auto max-w-[1400px]">
        <section className="paper-panel rounded-[34px] px-7 py-7">
          <div className="flex items-start justify-between gap-8">
            <div>
              <div className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-ink-label)]">Accuracy benchmark</div>
              <h1 className="mt-3 text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.95] text-[var(--color-ink)]">
                {mode === 'batch' ? 'Benchmark all contracts' : 'Compare source and decompiled output'}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-ink-body)]">
                {mode === 'batch'
                  ? 'Run the AST-based accuracy benchmark across all 19 bundled contracts. Decompiles each WASM, scores against original source, and produces a full report.'
                  : 'Select a bundled contract or upload files, then run the AST-based accuracy benchmark.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => setMode('batch')}
                className={`rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.22em] transition-colors ${
                  mode === 'batch' ? 'bg-[var(--color-ink)] text-[var(--color-sand-cream)]' : 'border paper-border bg-[var(--color-surface)]/70 text-[var(--color-ink-body)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                }`}
              >
                Benchmark all
              </button>
              <button
                onClick={() => setMode('single')}
                className={`rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.22em] transition-colors ${
                  mode === 'single' ? 'bg-[var(--color-ink)] text-[var(--color-sand-cream)]' : 'border paper-border bg-[var(--color-surface)]/70 text-[var(--color-ink-body)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                }`}
              >
                Compare one
              </button>
            </div>
          </div>
        </section>

        {mode === 'batch' ? <BatchBenchmark /> : <SingleCompare />}
      </div>
    </div>
  );
};

const BatchBenchmark = () => {
  const [results, setResults] = useState<BatchEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);

  const runBenchmark = async () => {
    setRunning(true);
    setResults([]);
    setProgress(0);
    const entries: BatchEntry[] = [];

    for (let i = 0; i < CONTRACTS.length; i++) {
      const c = CONTRACTS[i];
      setProgress(i + 1);
      try {
        const [origResp, wasmResp] = await Promise.all([
          fetch(`/contracts/original/${c.name}.rs`),
          fetch(`/contracts/${c.name}.wasm`),
        ]);
        if (!origResp.ok || !wasmResp.ok) {
          entries.push({ name: c.name, score: null, original: '', decompiled: '', error: 'Failed to load files' });
          continue;
        }
        const original = await origResp.text();
        const bytes = new Uint8Array(await wasmResp.arrayBuffer());
        const decompiled = await decompileWasm(bytes);
        const score = await scoreWasm(original, decompiled);
        entries.push({ name: c.name, score, original, decompiled });
      } catch (e) {
        entries.push({ name: c.name, score: null, original: '', decompiled: '', error: String(e) });
      }
      setResults([...entries]);
    }
    setRunning(false);
  };

  const scored = results.filter((r) => r.score);
  const avgOverall = scored.length ? scored.reduce((s, r) => s + (r.score?.overall ?? 0), 0) / scored.length : 0;
  const avgTypes = scored.length ? scored.reduce((s, r) => s + (r.score?.types ?? 0), 0) / scored.length : 0;
  const avgSigs = scored.length ? scored.reduce((s, r) => s + (r.score?.signatures ?? 0), 0) / scored.length : 0;
  const avgBodies = scored.length ? scored.reduce((s, r) => s + (r.score?.bodies ?? 0), 0) / scored.length : 0;
  const above90 = scored.filter((r) => (r.score?.overall ?? 0) >= 0.9).length;
  const above80 = scored.filter((r) => (r.score?.overall ?? 0) >= 0.8).length;
  const above50 = scored.filter((r) => (r.score?.overall ?? 0) >= 0.5).length;

  const sorted = [...results].sort((a, b) => (b.score?.overall ?? 0) - (a.score?.overall ?? 0));

  return (
    <section className="mt-6 space-y-6">
      <div className="paper-panel rounded-[30px] p-6">
        <div className="flex items-center justify-between gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">Full suite benchmark</div>
            <div className="mt-2 text-lg text-[var(--color-ink)]">
              {running
                ? `Scoring contract ${progress} of ${CONTRACTS.length}...`
                : results.length > 0
                  ? `${scored.length} contracts scored`
                  : `${CONTRACTS.length} contracts ready`}
            </div>
          </div>
          <button
            onClick={runBenchmark}
            disabled={running}
            className="rounded-full bg-[var(--color-ink)] px-6 py-2.5 text-[10px] uppercase tracking-[0.22em] text-[var(--color-sand-cream)] hover:bg-[var(--color-accent)] transition-colors disabled:opacity-50"
          >
            {running ? `${progress}/${CONTRACTS.length}` : results.length > 0 ? 'Re-run' : 'Run benchmark'}
          </button>
        </div>
        {running && (
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-sand-track)]">
            <div className="h-full bg-[var(--color-accent)] transition-all duration-300" style={{ width: `${(progress / CONTRACTS.length) * 100}%` }} />
          </div>
        )}
      </div>

      {scored.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-6">
            <div className="paper-panel rounded-[30px] p-6">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">Results</div>
              <div className="mt-4 space-y-2">
                {sorted.map((entry) => {
                  const pct = (entry.score?.overall ?? 0) * 100;
                  const isExpanded = expanded === entry.name;
                  return (
                    <div key={entry.name}>
                      <button
                        type="button"
                        onClick={() => setExpanded(isExpanded ? null : entry.name)}
                        className="flex w-full items-center gap-4 rounded-2xl border paper-border bg-[var(--color-surface)]/60 px-4 py-3 text-left transition-colors hover:bg-[var(--color-surface)]/80"
                      >
                        <span className={`w-14 text-right text-sm font-medium tabular-nums ${tierColor(pct)}`}>{pct.toFixed(1)}%</span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-sand-track)]">
                          <div className={`h-full rounded-full ${scoreColor(entry.score?.overall ?? 0)}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-40 truncate text-sm text-[var(--color-ink)]">{formatName(entry.name)}</span>
                        <span className={`text-[10px] uppercase tracking-[0.14em] ${tierColor(pct)}`}>{tierLabel(pct)}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`shrink-0 text-[var(--color-ink-label)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>

                      {isExpanded && entry.score && (
                        <div className="mt-3 mb-3 space-y-4 pl-4 border-l-2 border-[var(--color-sand-track)] ml-6">
                          <div className="grid grid-cols-3 gap-3">
                            <MiniScore label="Types" value={entry.score.types} />
                            <MiniScore label="Signatures" value={entry.score.signatures} />
                            <MiniScore label="Bodies" value={entry.score.bodies} />
                          </div>
                          {entry.score.function_scores.length > 0 && (
                            <div className="rounded-2xl border paper-border bg-[var(--color-surface)]/50 px-4 py-3">
                              <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-label)] mb-2">Functions</div>
                              {entry.score.function_scores.map((fn) => (
                                <div key={fn.name} className="flex items-center justify-between py-1 text-xs">
                                  <span className="font-medium text-[var(--color-ink)]">{fn.name}</span>
                                  <div className="flex gap-4 tabular-nums">
                                    <span className="text-[var(--color-ink-sub)]">sig {(fn.signature * 100).toFixed(0)}%</span>
                                    <span className="text-[var(--color-ink-sub)]">body {(fn.body * 100).toFixed(0)}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="grid gap-4 xl:grid-cols-2">
                            <CodeBlock label="Original" code={entry.original} />
                            <CodeBlock label="Decompiled" code={entry.decompiled} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="paper-panel rounded-[30px] p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">Summary</div>
              <div className="mt-4">
                <div className="text-3xl font-medium text-[var(--color-ink)] tabular-nums">{(avgOverall * 100).toFixed(1)}%</div>
                <div className="mt-1 text-xs text-[var(--color-ink-sub)]">average across {scored.length} contracts</div>
              </div>
              <div className="mt-5">
                <ScoreBar value={avgTypes} label="Types" weight="20%" />
                <ScoreBar value={avgSigs} label="Signatures" weight="20%" />
                <ScoreBar value={avgBodies} label="Bodies" weight="60%" />
              </div>
            </div>
            <div className="paper-panel rounded-[30px] p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">Thresholds</div>
              <div className="mt-4 space-y-3">
                <ThresholdRow label="90%+" count={above90} total={scored.length} />
                <ThresholdRow label="80%+" count={above80} total={scored.length} />
                <ThresholdRow label="50%+" count={above50} total={scored.length} />
              </div>
            </div>
            <div className="paper-panel rounded-[30px] p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">Tier breakdown</div>
              <div className="mt-4 space-y-3">
                {['top', 'high', 'mid', 'low', 'minimal'].map((tier) => {
                  const inTier = sorted.filter((r) => tierLabel((r.score?.overall ?? 0) * 100) === tier);
                  if (!inTier.length) return null;
                  return (
                    <div key={tier}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="uppercase tracking-[0.14em] text-[var(--color-ink-label)]">{tier}</span>
                        <span className="text-[var(--color-ink)] tabular-nums">{inTier.length}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-[var(--color-ink-sub)]">{inTier.map((r) => formatName(r.name)).join(', ')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
};

const SingleCompare = () => {
  const [originalText, setOriginalText] = useState('');
  const [decompiledText, setDecompiledText] = useState('');
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null);
  const [scoring, setScoring] = useState(false);
  const [decompiling, setDecompiling] = useState(false);
  const [loadingExample, setLoadingExample] = useState(false);
  const [selectedExample, setSelectedExample] = useState('');
  const wasmInputRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const example = searchParams.get('example');
    if (example && !originalText && !decompiledText) {
      setSelectedExample(example);
      loadExample(example);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadExample = async (name: string) => {
    setLoadingExample(true);
    setScoreResult(null);
    try {
      const [origResp, wasmResp] = await Promise.all([
        fetch(`/contracts/original/${name}.rs`),
        fetch(`/contracts/${name}.wasm`),
      ]);
      if (origResp.ok) setOriginalText(await origResp.text());
      if (wasmResp.ok) {
        const bytes = new Uint8Array(await wasmResp.arrayBuffer());
        setDecompiledText(await decompileWasm(bytes));
      }
    } catch (e) {
      console.error('Failed to load example:', e);
    } finally {
      setLoadingExample(false);
    }
  };

  const handleOriginalFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setOriginalText(reader.result as string);
    reader.readAsText(file);
  };

  const handleDecompiledFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDecompiledText(reader.result as string);
    reader.readAsText(file);
  };

  const handleWasmFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDecompiling(true);
    try {
      const buf = await file.arrayBuffer();
      setDecompiledText(await decompileWasm(new Uint8Array(buf)));
    } catch (err) {
      setDecompiledText(`// Error: ${err instanceof Error ? err.message : err}`);
    } finally {
      setDecompiling(false);
    }
  };

  const runComparison = async () => {
    if (!originalText || !decompiledText) return;
    setScoring(true);
    try { setScoreResult(await scoreWasm(originalText, decompiledText)); }
    catch (e) { console.error('Scoring failed:', e); }
    finally { setScoring(false); }
  };

  return (
    <section className="mt-6 space-y-6">
      <div className="paper-panel rounded-[30px] p-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">Example contract</div>
              <select
                value={selectedExample}
                onChange={(e) => { setSelectedExample(e.target.value); if (e.target.value) loadExample(e.target.value); }}
                className="mt-2 rounded-full border border-[var(--color-sand-border)] bg-[var(--color-surface)]/78 px-4 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-accent)]"
              >
                <option value="">Select a contract...</option>
                {CONTRACTS.map((c) => <option key={c.name} value={c.name}>{formatName(c.name)}</option>)}
              </select>
            </div>
            {loadingExample && <span className="rounded-full border border-[var(--color-accent)] bg-[var(--color-accent)]/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--color-accent)]">Loading...</span>}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setOriginalText(''); setDecompiledText(''); setScoreResult(null); setSelectedExample(''); }}
              className="rounded-full border paper-border bg-[var(--color-surface)]/70 px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-body)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors">Clear</button>
            <button onClick={runComparison} disabled={scoring || !originalText || !decompiledText}
              className="rounded-full bg-[var(--color-ink)] px-5 py-2 text-[10px] uppercase tracking-[0.22em] text-[var(--color-sand-cream)] hover:bg-[var(--color-accent)] transition-colors disabled:opacity-50">
              {scoring ? 'Scoring...' : 'Run compare'}</button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <UploadCard title="Original source" subtitle="Upload .rs" onChange={handleOriginalFile} hasContent={!!originalText} />
        <div className="paper-panel rounded-[28px] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">Decompiled output</div>
              <div className="mt-2 text-sm text-[var(--color-ink-body)]">{decompiledText ? `${decompiledText.split('\n').length} lines` : 'Upload .rs or .wasm'}</div>
            </div>
            <div className="flex gap-2">
              <label className="cursor-pointer rounded-full border paper-border bg-[var(--color-surface)]/70 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-body)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors">
                .rs <input type="file" accept=".rs" onChange={handleDecompiledFile} className="hidden" />
              </label>
              <button onClick={() => wasmInputRef.current?.click()} disabled={decompiling}
                className="rounded-full border paper-border bg-[var(--color-surface)]/70 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-body)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors disabled:opacity-50">
                {decompiling ? 'Working...' : '.wasm'}</button>
              <input ref={wasmInputRef} type="file" accept=".wasm" onChange={handleWasmFile} className="hidden" />
            </div>
          </div>
        </div>
      </div>

      {(originalText && decompiledText) && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <SideBySideDiff original={originalText} decompiled={decompiledText} />

          <aside className="space-y-6">
            <div className="paper-panel rounded-[30px] p-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">Accuracy score</div>
              {scoreResult ? (
                <div className="mt-5">
                  <ScoreBar value={scoreResult.overall} label="Overall" />
                  <div className="my-4 h-px bg-[var(--color-sand-divide)]" />
                  <ScoreBar value={scoreResult.types} label="Types" weight="20%" />
                  <ScoreBar value={scoreResult.signatures} label="Signatures" weight="20%" />
                  <ScoreBar value={scoreResult.bodies} label="Bodies" weight="60%" />
                </div>
              ) : (
                <p className="mt-4 text-sm text-[var(--color-ink-sub)]">Click "Run compare" to score.</p>
              )}
            </div>
            {scoreResult && scoreResult.function_scores.length > 0 && (
              <div className="paper-panel rounded-[30px] p-5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">Per-function</div>
                <div className="mt-4 space-y-3">
                  {scoreResult.function_scores.map((fn) => (
                    <div key={fn.name} className="rounded-2xl border paper-border bg-[var(--color-surface)]/60 px-4 py-3">
                      <div className="font-medium text-[var(--color-ink)]">{fn.name}</div>
                      <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                        <div><span className="text-[var(--color-ink-label)]">sig</span> <span className="font-medium text-[var(--color-ink)] tabular-nums">{(fn.signature * 100).toFixed(0)}%</span></div>
                        <div><span className="text-[var(--color-ink-label)]">body</span> <span className="font-medium text-[var(--color-ink)] tabular-nums">{(fn.body * 100).toFixed(0)}%</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </section>
  );
};

const SideBySideDiff = ({ original, decompiled }: { original: string; decompiled: string }) => {
  const origLines = original.split('\n');
  const decompLines = decompiled.split('\n');
  const maxLines = Math.max(origLines.length, decompLines.length);
  const changedCount = Array.from({ length: maxLines }).filter((_, i) =>
    (origLines[i] ?? '') !== (decompLines[i] ?? '')
  ).length;

  return (
    <div className="paper-panel overflow-hidden rounded-[28px]">
      <div className="flex items-center justify-between border-b paper-border px-5 py-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">Side-by-side diff</div>
        </div>
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.16em]">
          <span className="rounded-full bg-[var(--color-score-green)]/10 px-2.5 py-1 text-[var(--color-score-green)]">
            {maxLines - changedCount} stable
          </span>
          <span className="rounded-full bg-[var(--color-accent)]/10 px-2.5 py-1 text-[var(--color-accent)]">
            {changedCount} changed
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="border-b border-r paper-border bg-[var(--color-surface)]/45 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-label)]">
          Original <span className="text-[var(--color-ink-faint)]">{origLines.length} lines</span>
        </div>
        <div className="border-b paper-border bg-[var(--color-surface)]/45 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-label)]">
          Decompiled <span className="text-[var(--color-ink-faint)]">{decompLines.length} lines</span>
        </div>
      </div>
      <div className="max-h-[480px] overflow-auto font-mono text-[11px] leading-5">
        {Array.from({ length: maxLines }).map((_, i) => {
          const ol = origLines[i] ?? '';
          const dl = decompLines[i] ?? '';
          const same = ol === dl;
          return (
            <div key={i} className="grid grid-cols-2">
              <div className={`flex border-b border-r paper-border-soft ${same ? '' : 'bg-[var(--color-accent)]/[0.05]'}`}>
                <span className={`w-0.5 shrink-0 ${same ? '' : 'bg-[var(--color-accent)]/40'}`} />
                <span className="w-8 shrink-0 select-none pr-2 text-right text-[9px] tabular-nums text-[var(--color-ink-faint)] leading-5">{i + 1}</span>
                <pre className={`whitespace-pre-wrap break-all pr-2 py-px ${same ? 'text-[var(--color-ink-code)]' : 'text-[var(--color-ink)]'}`}>{ol || ' '}</pre>
              </div>
              <div className={`flex border-b paper-border-soft ${same ? '' : 'bg-[var(--color-score-green)]/[0.05]'}`}>
                <span className={`w-0.5 shrink-0 ${same ? '' : 'bg-[var(--color-score-green)]/40'}`} />
                <span className="w-8 shrink-0 select-none pr-2 text-right text-[9px] tabular-nums text-[var(--color-ink-faint)] leading-5">{i + 1}</span>
                <pre className={`whitespace-pre-wrap break-all pr-2 py-px ${same ? 'text-[var(--color-ink-code)]' : 'text-[var(--color-ink)]'}`}>{dl || ' '}</pre>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CodeBlock = ({ label, code }: { label: string; code: string }) => {
  const lines = code.split('\n');
  return (
    <div className="paper-panel overflow-hidden rounded-[24px]">
      <div className="border-b paper-border px-4 py-3 text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">
        {label}
        <span className="ml-3 text-[var(--color-ink-faint)]">{lines.length} lines</span>
      </div>
      <div className="max-h-[500px] overflow-auto bg-[var(--color-sand-code)] py-2 font-mono text-[12px] leading-6">
        {lines.map((line, i) => (
          <div key={i} className="flex px-1 hover:bg-[var(--color-accent)]/[0.03]">
            <span className="w-10 shrink-0 select-none pr-3 text-right text-[10px] tabular-nums text-[var(--color-ink-faint)] leading-6">{i + 1}</span>
            <pre className="whitespace-pre text-[var(--color-ink-code)]">{line || ' '}</pre>
          </div>
        ))}
      </div>
    </div>
  );
};

const MiniScore = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl border paper-border bg-[var(--color-surface)]/50 px-3 py-2 text-center">
    <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-ink-label)]">{label}</div>
    <div className="mt-1 text-sm font-medium text-[var(--color-ink)] tabular-nums">{(value * 100).toFixed(0)}%</div>
  </div>
);

const ThresholdRow = ({ label, count, total }: { label: string; count: number; total: number }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-[var(--color-ink-body)]">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-[var(--color-ink)] tabular-nums">{count}</span>
      <span className="text-[10px] text-[var(--color-ink-label)]">/ {total}</span>
    </div>
  </div>
);

const UploadCard = ({ title, subtitle, onChange, hasContent }: {
  title: string; subtitle: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; hasContent?: boolean;
}) => (
  <div className="paper-panel rounded-[28px] p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">{title}</div>
        <div className="mt-2 text-sm text-[var(--color-ink-body)]">{hasContent ? 'File loaded' : subtitle}</div>
      </div>
      <label className="cursor-pointer rounded-full border paper-border bg-[var(--color-surface)]/70 px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-body)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors">
        Upload .rs <input type="file" accept=".rs" onChange={onChange} className="hidden" />
      </label>
    </div>
  </div>
);

const ScoreBar = ({ value, label, weight }: { value: number; label: string; weight?: string }) => (
  <div className="mb-3">
    <div className="mb-1 flex items-center justify-between text-xs">
      <span className="text-[var(--color-ink-body)]">{label}</span>
      <div className="flex items-center gap-2">
        {weight && <span className="text-[10px] text-[var(--color-ink-label)]">{weight}</span>}
        <span className="font-medium text-[var(--color-ink)] tabular-nums">{(value * 100).toFixed(0)}%</span>
      </div>
    </div>
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-sand-track)]">
      <div className={`h-full ${scoreColor(value)}`} style={{ width: `${value * 100}%` }} />
    </div>
  </div>
);

export default Compare;
