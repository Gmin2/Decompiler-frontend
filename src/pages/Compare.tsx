import { useState, type ChangeEvent } from 'react';
import { Diamond } from '../components/Layout';

const ScoreBar = ({ value, label, weight }: { value: number; label: string; weight?: string }) => {
  const color = value >= 0.9 ? 'score-green' : value >= 0.8 ? 'score-yellow' : value >= 0.5 ? 'score-cyan' : 'score-red';
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="paper-body">{label}</span>
        <div className="flex items-center gap-2">
          {weight && <span className="text-[10px] paper-muted">{weight}</span>}
          <span className="paper-text tabular-nums">{(value * 100).toFixed(0)}%</span>
        </div>
      </div>
      <div className="h-1.5 bg-[#e8dfd3] w-full rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
};

const Compare = () => {
  const [originalText, setOriginalText] = useState('');
  const [decompiledText, setDecompiledText] = useState('');
  const [hasScore, setHasScore] = useState(false);

  const mockScore = {
    overall: 0.92,
    types: 1.0,
    signatures: 1.0,
    bodies: 0.85,
    function_scores: [
      { name: 'hello', signature: 1.0, body: 0.85 },
    ],
  };

  const handleOriginalFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setOriginalText(reader.result as string);
      reader.readAsText(file);
    }
  };

  const handleDecompiledFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setDecompiledText(reader.result as string);
      reader.readAsText(file);
    }
  };

  const runComparison = () => {
    if (originalText && decompiledText) setHasScore(true);
  };

  return (
    <>
      <section className="px-[4vw] pt-14 pb-6">
        <div className="flex items-start gap-4 mb-10">
          <span
            className="text-5xl font-light tracking-tighter text-[#b9b0a3]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            03
          </span>
          <div>
            <span className="text-xs tracking-[0.15em] block paper-text">DIFF / COMPARE</span>
            <span className="text-[10px] tracking-[0.15em] paper-muted mt-1 block">
              COMPARE ORIGINAL SOURCE WITH DECOMPILED OUTPUT
            </span>
          </div>
        </div>
      </section>

      <div className="mx-[4vw] h-px bg-[#e1d8cc]" />

      <section className="px-[4vw] py-8">
        <div className="flex gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="paper-panel rounded-l-[28px] rounded-r-none border-r-0">
              <div className="paper-border border-b px-4 py-2.5 flex items-center justify-between">
                <span className="text-[10px] tracking-[0.2em] paper-muted">ORIGINAL SOURCE</span>
                <label className="text-[10px] tracking-wider border paper-border rounded-full px-3 py-1 cursor-pointer paper-body hover:border-[#f08b57] hover:text-[#f08b57] transition-colors">
                  UPLOAD .RS
                  <input type="file" accept=".rs" onChange={handleOriginalFile} className="hidden" />
                </label>
              </div>
              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Paste original Rust source here..."
                className="w-full h-[50vh] bg-transparent paper-body text-[13px] leading-relaxed p-4 outline-none resize-none font-mono"
              />
            </div>

            <div className="paper-panel rounded-r-[28px] rounded-l-none -ml-px">
              <div className="paper-border border-b px-4 py-2.5 flex items-center justify-between">
                <span className="text-[10px] tracking-[0.2em] paper-muted">DECOMPILED OUTPUT</span>
                <label className="text-[10px] tracking-wider border paper-border rounded-full px-3 py-1 cursor-pointer paper-body hover:border-[#f08b57] hover:text-[#f08b57] transition-colors">
                  UPLOAD .RS
                  <input type="file" accept=".rs" onChange={handleDecompiledFile} className="hidden" />
                </label>
              </div>
              <textarea
                value={decompiledText}
                onChange={(e) => setDecompiledText(e.target.value)}
                placeholder="Paste decompiled Rust output here, or upload a .wasm to auto-fill..."
                className="w-full h-[50vh] bg-transparent paper-body text-[13px] leading-relaxed p-4 outline-none resize-none font-mono"
              />
            </div>
          </div>

          <div className="w-64 shrink-0">
            <div className="paper-panel rounded-[28px] p-5">
              <div className="text-[10px] tracking-[0.2em] paper-muted mb-5">ACCURACY SCORE</div>

              {hasScore ? (
                <>
                  <ScoreBar value={mockScore.overall} label="Overall" />
                  <div className="h-px bg-[#e1d8cc] my-4" />
                  <ScoreBar value={mockScore.types} label="Types" weight="20%" />
                  <ScoreBar value={mockScore.signatures} label="Signatures" weight="20%" />
                  <ScoreBar value={mockScore.bodies} label="Bodies" weight="60%" />

                  <div className="h-px bg-[#e1d8cc] my-4" />
                  <div className="text-[10px] tracking-[0.2em] paper-muted mb-3">PER-FUNCTION</div>
                  {mockScore.function_scores.map((fs) => (
                    <div key={fs.name} className="flex items-center justify-between text-xs mb-2">
                      <span className="paper-body">{fs.name}</span>
                      <div className="flex gap-3 text-[10px]">
                        <span>sig: <span className="paper-text">{(fs.signature * 100).toFixed(0)}%</span></span>
                        <span>body: <span className="paper-text">{(fs.body * 100).toFixed(0)}%</span></span>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <Diamond />
                  <p className="text-xs paper-muted mt-4">
                    Paste or upload source on both sides, then compare.
                  </p>
                </div>
              )}

              <button
                onClick={runComparison}
                disabled={!originalText || !decompiledText}
                className="w-full mt-6 bg-[#171412] text-white text-[10px] tracking-[0.15em] py-2.5 rounded-full hover:bg-[#f08b57] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                COMPARE →
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Compare;
