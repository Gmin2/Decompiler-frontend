import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONTRACTS, GALLERY_SCORES, formatName, COMPLEXITY_COLOR, type Contract } from '../data/contracts';
import { useDecompiler } from '../context/DecompilerContext';

type SortKey = 'name' | 'size' | 'score';
type ComplexityFilter = 'all' | 'simple' | 'medium' | 'complex';

const ScoreBar = ({ value }: { value: number }) => (
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8dfd3]">
    <div
      className="h-full rounded-full bg-[linear-gradient(90deg,#f08b57_0%,#d39f69_45%,#80915f_100%)]"
      style={{ width: `${value * 100}%` }}
    />
  </div>
);

const scoreLabel = (value: number) => `${Math.round(value * 100)}%`;

const Gallery = () => {
  const [search, setSearch] = useState('');
  const [complexity, setComplexity] = useState<ComplexityFilter>('all');
  const [sort, setSort] = useState<SortKey>('name');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return [...CONTRACTS]
      .filter((contract) => {
        if (complexity !== 'all' && contract.complexity !== complexity) return false;
        if (search && !formatName(contract.name).toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === 'name') return formatName(a.name).localeCompare(formatName(b.name));
        if (sort === 'size') return a.bytes - b.bytes;
        return (GALLERY_SCORES[b.name]?.overall ?? 0) - (GALLERY_SCORES[a.name]?.overall ?? 0);
      });
  }, [complexity, search, sort]);

  return (
    <>
      <section className="px-[4vw] pb-8 pt-14">
        <div className="mb-10 flex items-start gap-4">
          <span
            className="text-5xl font-light tracking-tighter text-[#b9b0a3]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            04
          </span>
          <div>
            <span className="block text-xs tracking-[0.15em] paper-text">EXAMPLE GALLERY</span>
            <span className="mt-1 block text-[10px] tracking-[0.15em] paper-muted">
              {CONTRACTS.length} BUNDLED CONTRACTS WITH RECOVERY SCORES
            </span>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <h1
              className="max-w-3xl text-[clamp(2.4rem,4.8vw,4.6rem)] leading-[0.98] tracking-[-0.04em] text-[#171412]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Browse bundled Soroban contracts and inspect reconstruction quality.
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-8 paper-body">
            Use the bundled examples to test Sorbon against simple, medium, and complex contracts.
            Each card shows typed recovery, signature recovery, and function body reconstruction scores.
          </p>
        </div>
      </section>

      <div className="mx-[4vw] h-px bg-[#e1d8cc]" />

      <section className="flex flex-wrap items-center gap-6 px-[4vw] py-5">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search contracts..."
          className="w-56 border-b bg-transparent py-2 text-sm paper-text outline-none transition-colors paper-border focus:border-[#f08b57]"
        />

        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] paper-muted">COMPLEXITY</span>
          {(['all', 'simple', 'medium', 'complex'] as ComplexityFilter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setComplexity(item)}
              className={`border px-3 py-1 text-[10px] tracking-wider transition-colors ${
                complexity === item
                  ? 'border-[#f08b57] text-[#f08b57]'
                  : 'paper-border paper-muted hover:border-[#d1c6b8] hover:text-[#171412]'
              }`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.2em] paper-muted">SORT</span>
          {(['name', 'size', 'score'] as SortKey[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSort(item)}
              className={`border px-3 py-1 text-[10px] tracking-wider transition-colors ${
                sort === item
                  ? 'border-[#f08b57] text-[#f08b57]'
                  : 'paper-border paper-muted hover:border-[#d1c6b8] hover:text-[#171412]'
              }`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        <span className="ml-auto text-[10px] tracking-wider paper-muted tabular-nums">
          {filtered.length} results
        </span>
      </section>

      <div className="mx-[4vw] h-px bg-[#e1d8cc]" />

      <section className="px-[4vw] py-8">
        <div className="rounded-[32px] border p-4 paper-border-soft hatch-fill-dense">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((contract) => (
              <GalleryCard key={contract.name} contract={contract} navigate={navigate} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

const GalleryCard = ({
  contract,
  navigate,
}: {
  contract: Contract;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  const score = GALLERY_SCORES[contract.name];
  const { loadFromUrl } = useDecompiler();
  const [cardLoading, setCardLoading] = useState(false);

  const handleDecompile = async () => {
    setCardLoading(true);
    await loadFromUrl(`/contracts/${contract.name}.wasm`, formatName(contract.name));
    setCardLoading(false);
    navigate('/studio');
  };

  return (
    <div className="paper-panel group relative rounded-[28px] p-5">
      <div className="absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 rounded-full bg-[#f08b57] transition-transform duration-200 group-hover:scale-y-100" />

      <div className="mb-2 text-sm paper-text">{formatName(contract.name)}</div>

      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs paper-body tabular-nums">{contract.size}</span>
        <span className={`text-[10px] tracking-[0.15em] ${COMPLEXITY_COLOR[contract.complexity]}`}>
          {contract.complexity}
        </span>
      </div>

      {score && (
        <div className="mb-5 space-y-3">
          <MetricRow label="Typed" value={score.types} />
          <MetricRow label="Signatures" value={score.signatures} />
          <MetricRow label="Function body" value={score.bodies} />
        </div>
      )}

      {score?.functions && (
        <div className="mb-4 text-[10px] paper-muted truncate">
          {score.functions.join(', ')}
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          disabled={cardLoading}
          onClick={handleDecompile}
          className="flex-1 rounded-full bg-[#171412] py-1.5 text-center text-[10px] tracking-wider text-[#f8f3ea] transition-colors hover:bg-[#f08b57] disabled:opacity-50"
        >
          {cardLoading ? 'LOADING...' : 'DECOMPILE'}
        </button>
        <button
          type="button"
          onClick={() => navigate(`/compare?example=${contract.name}`)}
          className="flex-1 rounded-full border py-1.5 text-center text-[10px] tracking-wider transition-colors paper-border paper-body hover:border-[#f08b57] hover:text-[#f08b57]"
        >
          COMPARE
        </button>
      </div>
    </div>
  );
};

const MetricRow = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="mb-1 flex items-center justify-between text-[10px]">
      <span className="paper-muted uppercase tracking-[0.16em]">{label}</span>
      <span className="paper-text tabular-nums">{scoreLabel(value)}</span>
    </div>
    <ScoreBar value={value} />
  </div>
);

export default Gallery;
