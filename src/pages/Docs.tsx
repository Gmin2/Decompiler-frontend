import { useState } from 'react';
import { PATTERNS, PATTERN_CATEGORIES, type Pattern } from '../data/contracts';

const STATUS_STYLE = {
  handled: 'text-[#78875b] bg-[#78875b]/10 rounded-full',
  partial: 'text-[#c4a35a] bg-[#c4a35a]/10 rounded-full',
  unhandled: 'text-[#87605b] bg-[#87605b]/10 rounded-full',
} as const;

const Docs = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = PATTERNS.filter((p) => {
    if (activeCategory && p.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.module.toLowerCase().includes(q) ||
        p.sdk.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const countByCategory = (cat: string) => PATTERNS.filter((p) => p.category === cat).length;

  return (
    <div className="flex min-h-[calc(100vh-57px)]">
      <aside className="w-56 border-r paper-border shrink-0 overflow-y-auto py-6 px-4">
        <div className="text-[10px] tracking-[0.2em] paper-muted mb-4">CATEGORIES</div>

        <button
          onClick={() => setActiveCategory(null)}
          className={`block w-full text-left text-xs py-2 px-3 mb-1 transition-colors ${
            activeCategory === null ? 'text-[#f08b57] bg-[#f08b57]/5 rounded-full' : 'paper-body hover:text-[#171412] rounded-full'
          }`}
        >
          All patterns
          <span className="text-[10px] paper-muted ml-2 tabular-nums">({PATTERNS.length})</span>
        </button>

        {PATTERN_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`block w-full text-left text-xs py-2 px-3 mb-1 transition-colors ${
              activeCategory === cat ? 'text-[#f08b57] bg-[#f08b57]/5 rounded-full' : 'paper-body hover:text-[#171412] rounded-full'
            }`}
          >
            {cat}
            <span className="text-[10px] paper-muted ml-2 tabular-nums">({countByCategory(cat)})</span>
          </button>
        ))}
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-12 pb-6">
          <div className="flex items-start gap-4 mb-8">
            <span
            className="text-5xl font-light tracking-tighter text-[#b9b0a3]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              05
            </span>
            <div>
              <span className="text-xs tracking-[0.15em] block paper-text">PATTERN CATALOG</span>
              <span className="text-[10px] tracking-[0.15em] paper-muted mt-1 block">
                HOST FUNCTIONS AND THEIR SDK EQUIVALENTS
              </span>
            </div>
          </div>

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patterns by name, module, or SDK..."
            className="bg-transparent border-b paper-border focus:border-[#f08b57] outline-none py-2 text-sm paper-text w-80 transition-colors"
          />
        </div>

        <div className="h-px bg-[#e1d8cc]" />

        {/* Pattern entries */}
        <div className="px-6 py-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 paper-muted text-xs">
              No patterns match your search.
            </div>
          ) : (
            filtered.map((p) => <PatternCard key={p.name} pattern={p} />)
          )}
        </div>
      </div>
    </div>
  );
};

const PatternCard = ({ pattern: p }: { pattern: Pattern }) => (
  <div className="paper-panel mb-3 p-5 rounded-[28px] transition-colors group paper-hover">
    <div className="flex items-start justify-between mb-4">
      <div>
        <span className="text-sm paper-text">{p.name}</span>
        <span className="text-[10px] tracking-wider text-[#78875b] ml-3">{p.category}</span>
      </div>
      <span className={`text-[10px] tracking-wider px-2 py-0.5 ${STATUS_STYLE[p.status]}`}>
        {p.status.toUpperCase()}
      </span>
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs mb-4">
      <div>
        <div className="text-[10px] tracking-[0.15em] paper-muted mb-1">MODULE</div>
        <div className="paper-body">{p.module}</div>
      </div>
      <div>
        <div className="text-[10px] tracking-[0.15em] paper-muted mb-1">ARGUMENTS</div>
        <div className="paper-body">{p.args || '—'}</div>
      </div>
      <div>
        <div className="text-[10px] tracking-[0.15em] paper-muted mb-1">RETURN</div>
        <div className="paper-text">{p.returnType}</div>
      </div>
      <div>
        <div className="text-[10px] tracking-[0.15em] paper-muted mb-1">SDK PATTERN</div>
        <code className="text-[#f08b57] text-[11px]">{p.sdk}</code>
      </div>
    </div>
  </div>
);

export default Docs;
