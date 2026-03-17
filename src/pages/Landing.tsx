import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { NETWORKS } from '../data/contracts';
import { useDecompiler } from '../context/DecompilerContext';
import ExpandableFeatures from '../components/ExpandableFeatures';


const opcodeMarkers = [
  { label: 'SOROBAN VM', className: 'left-[4%] top-[12%]' },
  { label: 'HOST FN MAP', className: 'left-[7%] top-[33%]' },
  { label: 'STELLAR XDR', className: 'right-[5%] top-[18%]' },
  { label: 'WASM CFG', className: 'right-[6%] top-[48%]' },
];

const codeColumnLeft = [
  '0000 0061 736d',
  '0004 0100 0000',
  'type  func(env)',
  'call  symbol_short',
  'ret   vec<symbol>',
];

const codeColumnRight = [
  '#[contractimpl]',
  'pub fn hello(',
  '  env: Env,',
  '  to: Symbol,',
  ') -> Vec<Symbol>',
];

const SketchBadge = ({
  className,
  title,
  subtitle,
  children,
}: {
  className: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <div className={`pointer-events-none absolute hidden lg:block ${className}`}>
    <div className="sketch-badge rounded-[28px] px-5 py-4">
      <div className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[var(--color-ink-tag)]">{title}</div>
      <div className="flex items-center justify-center">{children}</div>
      <div className="mt-3 text-[9px] uppercase tracking-[0.24em] text-[var(--color-ink-caption)]">{subtitle}</div>
    </div>
  </div>
);

const StellarSketch = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="sketch-stroke">
    <circle cx="60" cy="60" r="36" />
    <path d="M28 76L90 42" />
    <path d="M31 90L93 56" />
    <path d="M31 75C30 60 35 46 47 36" opacity="0.72" />
    <path d="M75 85C63 92 49 91 38 85" opacity="0.72" />
    <path d="M89 45C91 60 86 73 74 83" opacity="0.72" />
  </svg>
);

const SorobanSketch = () => (
  <svg width="132" height="120" viewBox="0 0 132 120" fill="none" className="sketch-stroke">
    <rect x="18" y="18" width="96" height="84" rx="10" />
    <path d="M34 40H96" />
    <path d="M34 60H80" />
    <path d="M34 80H88" />
    <path d="M90 34L101 45L90 56" />
    <circle cx="40" cy="40" r="3" />
    <circle cx="40" cy="60" r="3" />
    <circle cx="40" cy="80" r="3" />
  </svg>
);

const OrbitLines = () => (
  <svg width="180" height="130" viewBox="0 0 180 130" fill="none" className="sketch-stroke">
    <ellipse cx="90" cy="65" rx="70" ry="34" />
    <ellipse cx="90" cy="65" rx="46" ry="20" opacity="0.65" />
    <path d="M30 94C58 80 121 80 150 96" />
    <path d="M40 34C61 52 120 52 141 35" opacity="0.7" />
    <circle cx="33" cy="93" r="3.5" />
    <circle cx="147" cy="35" r="3.5" />
  </svg>
);

const CodeStrip = ({
  lines,
  className,
}: {
  lines: string[];
  className: string;
}) => (
  <div
    className={`pointer-events-none absolute hidden rounded-[24px] border border-[var(--color-sand-float)] bg-[var(--color-surface)]/30 px-4 py-3 text-[10px] leading-6 tracking-[0.16em] text-[var(--color-ink-label)] shadow-[0_10px_24px_rgba(45,34,20,0.04)] backdrop-blur-[2px] lg:block ${className}`}
  >
    {lines.map((line) => (
      <div key={line}>{line}</div>
    ))}
  </div>
);

const DraftRing = () => (
  <>
    <div className="draft-ring absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
    <div className="draft-ring absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35" />
    <div className="absolute left-1/2 top-[26%] h-[44%] w-px -translate-x-1/2 bg-[var(--color-sand-rule)]" />
    <div className="absolute left-[22%] top-1/2 h-px w-[56%] -translate-y-1/2 bg-[var(--color-sand-rule)]" />
    <div className="absolute left-[28%] top-[38%] h-px w-[44%] bg-[var(--color-sand-soft)]" />
    <div className="absolute left-[28%] top-[62%] h-px w-[44%] bg-[var(--color-sand-soft)]" />
    <div className="absolute left-[50%] top-[13%] h-5 w-5 -translate-x-1/2 text-[var(--color-ink-guide)]">
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
    </div>
    <div className="absolute bottom-[12%] left-1/2 h-5 w-5 -translate-x-1/2 text-[var(--color-ink-guide)]">
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
    </div>
    <div className="absolute left-[31%] top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-accent)]">
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
    </div>
    <div className="absolute right-[31%] top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-accent)]">
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current" />
      <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
    </div>
  </>
);

const Landing = () => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [contractId, setContractId] = useState('');
  const [network, setNetwork] = useState('testnet');
  const [fetchLoading, setFetchLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { loadFromFile, fetchFromRpc, loading } = useDecompiler();

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file?.name.endsWith('.wasm')) setSelectedFile(file);
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file?.name.endsWith('.wasm')) setSelectedFile(file);
  };

  const handleDecompile = async () => {
    if (!selectedFile) return;
    await loadFromFile(selectedFile);
    navigate('/studio');
  };

  const handleFetchContract = async () => {
    if (!contractId) return;
    setFetchLoading(true);
    await fetchFromRpc(contractId, network);
    setFetchLoading(false);
    navigate('/studio');
  };

  return (
    <div className="landing-paper text-[var(--color-ink-deep)]">
      <section className="relative isolate overflow-hidden px-6 pb-16 pt-8 sm:px-10 lg:px-16">
        <CodeStrip lines={codeColumnLeft} className="left-[2%] top-[16%] -rotate-6" />
        <CodeStrip lines={codeColumnRight} className="right-[2%] top-[58%] rotate-4 text-right" />
        <SketchBadge
          className="left-[2%] top-[46%] -rotate-4"
          title="stellar network"
          subtitle="logo study / orbit cut"
        >
          <StellarSketch />
        </SketchBadge>
        <SketchBadge
          className="right-[2%] top-[18%] rotate-6"
          title="soroban contract"
          subtitle="host functions / export map"
        >
          <SorobanSketch />
        </SketchBadge>
        <div className="pointer-events-none absolute bottom-[8%] left-[4%] hidden lg:block">
          <OrbitLines />
        </div>
        {opcodeMarkers.map((marker) => (
          <div
            key={marker.label}
            className={`pointer-events-none absolute hidden rounded-full border border-[var(--color-sand-marker)] bg-[var(--color-surface)]/55 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[var(--color-ink-marker)] md:block ${marker.className}`}
          >
            {marker.label}
          </div>
        ))}

        <div className="mx-auto flex min-h-[calc(100vh-14rem)] max-w-6xl flex-col items-center justify-center">
          <div className="connector-hatch-surface w-full max-w-5xl p-4 lg:p-5">
          <div className="draft-frame relative w-full px-3 py-6 sm:px-6">
            <div className="draft-frame__outline pointer-events-none absolute inset-0" />
            <div className="draft-frame__inner pointer-events-none absolute inset-[5%_7%_7%_7%]" />
            <div className="draft-frame__topline pointer-events-none absolute left-[7%] right-[7%] top-[18%]" />
            <div className="draft-frame__baseline pointer-events-none absolute bottom-[14%] left-[7%] right-[7%]" />
            <div className="draft-hatch draft-hatch-left pointer-events-none absolute bottom-[14%] left-[9%] top-[21%] w-[7%]" />
            <div className="draft-hatch draft-hatch-right pointer-events-none absolute bottom-[14%] right-[9%] top-[21%] w-[7%]" />
            <div className="draft-hatch draft-hatch-bottom pointer-events-none absolute bottom-[14%] left-[16%] right-[16%] h-[8%]" />
            <div className="draft-rail pointer-events-none absolute bottom-[14%] left-[9%] right-[9%]" />
            <div className="draft-rail pointer-events-none absolute left-[16%] top-[21%] bottom-[14%]" />
            <div className="draft-rail pointer-events-none absolute right-[16%] top-[21%] bottom-[14%]" />

            <div className="hero-blueprint relative w-full px-4 py-16 sm:px-10 sm:py-24">
              <DraftRing />

              <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center" style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 40%, transparent 70%)' }}>
                <h1 className="hero-wordmark text-[clamp(3.5rem,10vw,7.8rem)] leading-[0.92] tracking-[-0.05em] text-[var(--color-ink)]">
                  Soroban
                </h1>
                <span className="hero-wordmark text-[clamp(1.8rem,5vw,4rem)] leading-[0.92] tracking-[-0.05em] text-[var(--color-ink)]">
                  Decompiler
                </span>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-[var(--color-ink-mid)]">
                  Turn any Soroban contract binary into readable Rust — instantly, in your browser.
                </p>

                {/* CTA buttons */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/studio')}
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--color-accent)] px-8 text-[11px] uppercase tracking-[0.28em] text-white transition hover:bg-[var(--color-accent-hover)]"
                  >
                    Open Studio
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const dropCard = document.querySelector('.action-draft-card');
                      dropCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--color-ink)] bg-[var(--color-surface)]/70 px-8 text-[11px] uppercase tracking-[0.28em] text-[var(--color-ink)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    Drop a Wasm
                  </button>
                </div>

                {/* Tag pills */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] text-[var(--color-ink-strong)]">
                  <span className="rounded-full border border-[var(--color-ink-badge)] bg-[var(--color-surface)]/80 px-4 py-2 shadow-sm">
                    Wasm uploads
                  </span>
                  <span className="rounded-full border border-[var(--color-ink-badge)] bg-[var(--color-surface)]/80 px-4 py-2 shadow-sm">
                    Contract fetch
                  </span>
                  <span className="rounded-full border border-[var(--color-ink-badge)] bg-[var(--color-surface)]/80 px-4 py-2 shadow-sm">
                    Compare output
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cards grid — still inside connector-hatch-surface */}
          <div className="relative z-10 w-full mt-4 lg:mt-5">
            <div className="relative grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div
                className={`action-draft-card group relative overflow-hidden p-6 sm:p-8 ${
                  dragOver ? 'ring-1 ring-[var(--color-accent)]' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="action-draft-card__outline pointer-events-none absolute inset-0" />
                <div className="action-draft-card__inner pointer-events-none absolute inset-[18px]" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".wasm"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="section-kicker relative z-10">Upload binary</span>
                <h2 className="relative z-10 mt-4 text-[clamp(2rem,3.6vw,3rem)] leading-[1.08] text-[var(--color-ink)]">
                  Drop a Wasm
                </h2>
                <p className="relative z-10 mt-4 max-w-lg text-sm leading-7 text-[var(--color-ink-body)]">
                  Start from the compiled contract artifact and push it directly into the decompiler pipeline.
                </p>

                <div
                  className={`action-dropzone relative z-10 mt-6 rounded-[30px] p-5 sm:p-6 ${
                    dragOver ? 'border-[var(--color-accent)] bg-[var(--color-sand-warm)]' : ''
                  }`}
                >
                  {selectedFile ? (
                    <div className="action-dropzone__frame flex min-h-[220px] flex-col items-center justify-center rounded-[24px] px-6 py-8 text-center sm:min-h-[250px]">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] border border-[var(--color-sand-frame)] bg-[var(--color-surface)]/82">
                        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" className="text-[var(--color-ink)]">
                          <path d="M12 6.5h9l5 5V29a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" />
                          <path d="M21 6.5v6h6" stroke="currentColor" strokeWidth="1.6" />
                          <path d="M19 24V14" stroke="#f08b57" strokeWidth="1.8" strokeLinecap="round" />
                          <path d="M15.5 17.5 19 14l3.5 3.5" stroke="#f08b57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-[var(--color-ink-muted)]">artifact loaded</p>
                      <p className="mt-3 text-[clamp(1.4rem,2.5vw,2rem)] leading-tight text-[var(--color-ink)]">{selectedFile.name}</p>
                      <p className="mt-2 text-sm text-[var(--color-ink-mid)]">
                        {(selectedFile.size / 1024).toFixed(1)} KB ready for decompilation
                      </p>
                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          disabled={loading}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDecompile();
                          }}
                          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--color-ink)] px-6 text-[11px] uppercase tracking-[0.28em] text-[var(--color-sand-cream)] transition hover:bg-[var(--color-accent)] disabled:opacity-50"
                        >
                          {loading ? 'Decompiling...' : 'Decompile now'}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--color-ink)] bg-[var(--color-surface)]/70 px-6 text-[11px] uppercase tracking-[0.28em] text-[var(--color-ink)]"
                        >
                          Replace file
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="action-dropzone__frame flex min-h-[220px] items-center justify-center rounded-[24px] px-4 py-8 text-center sm:min-h-[250px]">
                      <div className="mx-auto max-w-xs">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] border border-[var(--color-sand-frame)] bg-[var(--color-surface)]/82">
                          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" className="text-[var(--color-ink)]">
                            <path d="M12 6.5h9l5 5V29a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" />
                            <path d="M21 6.5v6h6" stroke="currentColor" strokeWidth="1.6" />
                            <path d="M19 24V14" stroke="#f08b57" strokeWidth="1.8" strokeLinecap="round" />
                            <path d="M15.5 17.5 19 14l3.5 3.5" stroke="#f08b57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-[var(--color-ink-muted)]">drop target</p>
                        <p className="mt-3 text-[clamp(1.7rem,3vw,2.4rem)] leading-tight text-[var(--color-ink)]">Drop a Wasm</p>
                        <p className="mt-2 text-sm text-[var(--color-ink-mid)]">Drag the file into this center box or click anywhere to browse.</p>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-[var(--color-ink)] bg-[var(--color-surface)]/75 px-5 text-[11px] uppercase tracking-[0.24em] text-[var(--color-ink)]"
                        >
                          Browse `.wasm`
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="action-draft-card relative overflow-hidden p-6 sm:p-8">
                <div className="action-draft-card__outline pointer-events-none absolute inset-0" />
                <div className="action-draft-card__inner pointer-events-none absolute inset-[18px]" />
                <span className="section-kicker relative z-10">Fetch contract</span>
                <h2 className="relative z-10 mt-4 text-[clamp(2rem,3.6vw,3rem)] leading-[1.08] text-[var(--color-ink)]">
                  Pull a live contract
                </h2>
                <p className="relative z-10 mt-3 text-sm leading-7 text-[var(--color-ink-body)]">
                  Pull a deployed contract into the studio and inspect its reconstructed source flow.
                </p>
                <div className="relative z-10 mt-8 space-y-5">
                  <label className="block">
                    <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">
                      Contract id
                    </span>
                    <input
                      type="text"
                      value={contractId}
                      onChange={(event) => setContractId(event.target.value)}
                      placeholder="CABC...XYZ"
                      className="w-full rounded-full border border-[var(--color-sand-border)] bg-[var(--color-surface)]/78 px-5 py-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-ink-dim)] focus:border-[var(--color-accent)]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-[var(--color-ink-label)]">
                      Network
                    </span>
                    <select
                      value={network}
                      onChange={(event) => setNetwork(event.target.value)}
                      className="w-full rounded-full border border-[var(--color-sand-border)] bg-[var(--color-surface)]/78 px-5 py-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)]"
                    >
                      {NETWORKS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    disabled={fetchLoading || !contractId}
                    onClick={handleFetchContract}
                    className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--color-ink)] px-6 text-[11px] uppercase tracking-[0.28em] text-[var(--color-sand-cream)] transition hover:bg-[var(--color-accent)] disabled:opacity-50"
                  >
                    {fetchLoading ? 'Fetching...' : 'Open in studio'}
                  </button>
                  <div className="rounded-[24px] border border-[var(--color-sand-card)] bg-[var(--color-surface)]/54 px-4 py-4 text-[11px] uppercase tracking-[0.24em] text-[var(--color-ink-marker)]">
                    on-chain lookup / contract id / network route
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      <ExpandableFeatures />
    </div>
  );
};

export default Landing;
