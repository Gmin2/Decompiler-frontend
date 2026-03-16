import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONTRACTS, GALLERY_SCORES, formatName, COMPLEXITY_COLOR, type Contract } from '../data/contracts';

type SortKey = 'name' | 'size' | 'score';
type ComplexityFilter = 'all' | 'simple' | 'medium' | 'complex';

const ScoreBar = ({ value }: { value: number }) => {
  const color = value >= 0.9 ? 'score-green' : value >= 0.8 ? 'score-yellow' : value >= 0.5 ? 'score-cyan' : 'score-red';
  return (
    <div className="h-1 bg-[#e8dfd3] w-full rounded-full overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${value * 100}%` }} />
    </div>
  );
};

const Gallery = () => {
  const [search, setSearch] = useState('');
  const [complexity, setComplexity] = useState<ComplexityFilter>('all');
  const [sort, setSort] = useState<SortKey>('name');
  const navigate = useNavigate();

  const filtered = CONTRACTS
    .filter((c) => {
      if (complexity !== 'all' && c.complexity !== complexity) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'size') return a.bytes - b.bytes;
      return (GALLERY_SCORES[b.name]?.overall ?? 0) - (GALLERY_SCORES[a.name]?.overall ?? 0);
    });

  return (
    <>
      {/* Header */}
      <section className="px-[4vw] pt-14 pb-8">
        <div className="flex items-start gap-4 mb-10">
          <span
            className="text-5xl font-light tracking-tighter text-[#b9b0a3]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            04
          </span>
          <div>
            <span className="text-xs tracking-[0.15em] block paper-text">EXAMPLE GALLERY</span>
            <span className="text-[10px] tracking-[0.15em] paper-muted mt-1 block">
              {CONTRACTS.length} BUNDLED CONTRACTS WITH PRE-COMPUTED SCORES
            </span>
          </div>
        </div>
      </section>

      <div className="mx-[4vw] h-px bg-[#e1d8cc]" />

      {/* Filter bar */}
      <section className="px-[4vw] py-5 flex flex-wrap items-center gap-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contracts..."
          className="bg-transparent border-b paper-border focus:border-[#f08b57] outline-none py-2 text-sm paper-text w-56 transition-colors"
        />

        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] paper-muted">COMPLEXITY</span>
          {(['all', 'simple', 'medium', 'complex'] as ComplexityFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setComplexity(f)}
              className={`text-[10px] tracking-wider px-3 py-1 border transition-colors ${
                complexity === f
                  ? 'border-[#f08b57] text-[#f08b57]'
                  : 'paper-border paper-muted hover:text-[#171412] hover:border-[#d1c6b8]'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] paper-muted">SORT</span>
          {(['name', 'size', 'score'] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`text-[10px] tracking-wider px-3 py-1 border transition-colors ${
                sort === s
                  ? 'border-[#f08b57] text-[#f08b57]'
                  : 'paper-border paper-muted hover:text-[#171412] hover:border-[#d1c6b8]'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        <span className="text-[10px] tracking-wider paper-muted ml-auto tabular-nums">
          {filtered.length} results
        </span>
      </section>

      <div className="mx-[4vw] h-px bg-[#e1d8cc]" />

      {/* Contract grid */}
      <section className="px-[4vw] py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0">
          {filtered.map((c) => (
            <GalleryCard key={c.name} contract={c} navigate={navigate} />
          ))}
        </div>
      </section>
    </>
  );
};

const GalleryCard = ({ contract: c, navigate }: { contract: Contract; navigate: ReturnType<typeof useNavigate> }) => {
  const score = GALLERY_SCORES[c.name];
  return (
    <div className="paper-panel rounded-[28px] p-5 group relative">
      <div className="absolute left-0 top-0 w-0.5 h-full bg-[#f08b57] scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top rounded-full" />

      <div className="text-sm paper-text mb-2">{formatName(c.name)}</div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs tabular-nums paper-body">{c.size}</span>
        <span className={`text-[10px] tracking-[0.15em] ${COMPLEXITY_COLOR[c.complexity]}`}>
          {c.complexity}
        </span>
      </div>

      {score && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="paper-muted">ACCURACY</span>
            <span className="paper-text tabular-nums">{(score.overall * 100).toFixed(0)}%</span>
          </div>
          <ScoreBar value={score.overall} />
        </div>
      )}

      {score?.functions && (
        <div className="text-[10px] paper-muted mb-4 truncate">
          {score.functions.join(', ')}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/studio?example=${c.name}`)}
          className="flex-1 text-[10px] tracking-wider border paper-border py-1.5 rounded-full text-center paper-body hover:border-[#f08b57] hover:text-[#f08b57] transition-colors"
        >
          DECOMPILE
        </button>
        <button
          onClick={() => navigate('/compare')}
          className="flex-1 text-[10px] tracking-wider border paper-border py-1.5 rounded-full text-center paper-body hover:border-[#f08b57] hover:text-[#f08b57] transition-colors"
        >
          COMPARE
        </button>
      </div>
    </div>
  );
};

export default Gallery;
