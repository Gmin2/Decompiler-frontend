import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';

const features = [
  {
    title: 'WASM Parser',
    description:
      'Parse WebAssembly binaries, resolve host imports, and map obfuscated module/field pairs to their semantic names — all in the browser.',
  },
  {
    title: 'Pattern Engine',
    description:
      '24 recognized host function patterns mapped to idiomatic Soroban SDK calls — storage, auth, crypto, collections, and more.',
  },
  {
    title: 'Type Recovery',
    description:
      'Reconstruct full contract specs — structs, enums, errors, and events — from embedded contractspecv0 metadata sections.',
  },
  {
    title: 'Rust Output',
    description:
      'Generate clean, readable Rust with proper #[contract] macros, typed function signatures, and idiomatic SDK usage patterns.',
  },
  {
    title: 'Studio',
    description:
      'Three-panel workspace with contract explorer, syntax-highlighted code viewer, and live inspector — no install required.',
  },
];

/* Isometric decompiler scene — 5 "devices" on a platform */
const deviceGroups = [
  { id: 'wasm-file', cx: 205, cy: 120 },
  { id: 'pattern-engine', cx: 293, cy: 184 },
  { id: 'type-system', cx: 393, cy: 228 },
  { id: 'rust-output', cx: 200, cy: 393 },
  { id: 'studio', cx: 100, cy: 328 },
] as const;

const StripesPattern = ({ id }: { id: string }) => (
  <pattern id={id} patternUnits="userSpaceOnUse" width="6" height="4" patternTransform="rotate(0)">
    <rect width="6" height="4" fill="var(--color-bg, #f4efe6)" />
    <rect x="3" width="1" height="5" fill="var(--color-border, #d6cfbf)" />
  </pattern>
);

const SceneIllustration = ({ activeDevice }: { activeDevice: number | null }) => {
  const getStyle = (index: number) => {
    const { cx, cy } = deviceGroups[index];
    const isActive = activeDevice === index;
    const hasSelection = activeDevice !== null;
    return {
      opacity: hasSelection ? (isActive ? 1 : 0.25) : 1,
      transform: isActive ? 'scale(1.1)' : 'scale(1)',
      transformOrigin: `${cx}px ${cy}px`,
      transition: 'opacity 0.5s ease, transform 0.5s ease',
    } as React.CSSProperties;
  };

  const platformStyle = {
    opacity: activeDevice !== null ? 0.5 : 1,
    transition: 'opacity 0.5s ease',
  } as React.CSSProperties;

  // Colors that match the landing page theme
  const bg = '#f4efe6';
  const border = '#d6cfbf';
  const borderStrong = 'rgba(47,42,36,0.35)';
  const primary = '#f08b57';
  const muted = '#e8e2d8';

  return (
    <svg viewBox="0 0 520 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-md lg:max-w-lg">
      <defs>
        <StripesPattern id="sceneStripes" />
      </defs>

      {/* Platform */}
      <g style={platformStyle}>
        <path d="M260 410 L490 280 L490 300 L260 430 L30 300 L30 280 Z" fill={border} opacity="0.3" />
        <path
          d="M260 395 L490 265 L260 135 L30 265 Z"
          fill={bg} stroke={border} strokeWidth="1"
        />
        <path
          d="M30 265 L260 135 L260 8 M260 135 L490 265"
          stroke={border} strokeWidth="1.5" strokeDasharray="2 6" strokeLinecap="square"
        />
      </g>

      {/* Device 0: WASM File (isometric cube, top-left) */}
      <g style={getStyle(0)}>
        <path d="M220 118H155V148L155.02 148C155.02 153 161.5 157 175 164.5C188 172 194.5 175.5 203 175.5C211.5 175.5 218 172 231 164.5C243.5 157 250 153 250 148V118H220Z" fill="url(#sceneStripes)" stroke={borderStrong} />
        <path d="M175 100C188 93 194.5 89.5 203 89.5C211.5 89.5 218 93 231 100C243.5 107 250 110.5 250 115C250 119.5 243.5 123 231 130C218 137 211.5 140.5 203 140.5C194.5 140.5 188 137 175 130C162 123 155 119.5 155 115C155 110.5 162 107 175 100Z" fill={bg} stroke={borderStrong} />
        <text x="189" y="118" fill={activeDevice === 0 ? primary : '#8b857d'} fontSize="10" fontFamily="monospace" style={{ transition: 'fill 0.3s' }}>.wasm</text>
        {/* Status LEDs */}
        <rect x="165" y="130" width="3" height="12" rx="1" fill={activeDevice === 0 ? primary : border} transform="rotate(30 165 130)" style={{ transition: 'fill 0.3s' }} />
        <rect x="172" y="134" width="3" height="8" rx="1" fill={activeDevice === 0 ? primary : border} transform="rotate(30 172 134)" style={{ transition: 'fill 0.3s' }} />
        <rect x="179" y="138" width="3" height="15" rx="1" fill={activeDevice === 0 ? '#78875b' : border} transform="rotate(30 179 138)" style={{ transition: 'fill 0.3s' }} />
      </g>

      {/* Device 1: Pattern Engine (isometric prism, center-top) */}
      <g style={getStyle(1)}>
        <path d="M310 180H245V208L245.02 208C245.02 213 251.5 216.5 264 224C276.5 231 283 234.5 291 234.5C299 234.5 305.5 231 318 224C330 216.5 336.5 213 336.5 208V180H310Z" fill="url(#sceneStripes)" stroke={borderStrong} />
        <path d="M264 162C276.5 155 283 151.5 291 151.5C299 151.5 305.5 155 318 162C330 169 336.5 172.5 336.5 177C336.5 181.5 330 185 318 192C305.5 199 299 202.5 291 202.5C283 202.5 276.5 199 264 192C251.5 185 245 181.5 245 177C245 172.5 251.5 169 264 162Z" fill={bg} stroke={borderStrong} />
        {/* Gear icon */}
        <path d="M283 174 L291 168 L299 174 L296 182 L286 182 Z" fill="none" stroke={activeDevice === 1 ? primary : '#a39a8f'} strokeWidth="1.5" style={{ transition: 'stroke 0.3s' }} />
        <circle cx="291" cy="176" r="3.5" fill="none" stroke={activeDevice === 1 ? primary : '#a39a8f'} strokeWidth="1" style={{ transition: 'stroke 0.3s' }} />
      </g>

      {/* Device 2: Type System (isometric box, right) */}
      <g style={getStyle(2)}>
        <path d="M355 235L400 260V285L355 260V235Z" fill="url(#sceneStripes)" stroke={borderStrong} />
        <path d="M400 260L445 235V260L400 285V260Z" fill="url(#sceneStripes)" stroke={borderStrong} />
        <path d="M400 210L445 235L400 260L355 235L400 210Z" fill={bg} stroke={borderStrong} />
        {/* Struct brackets */}
        <text x="378" y="248" fill={activeDevice === 2 ? primary : '#a39a8f'} fontSize="9" fontFamily="monospace" style={{ transition: 'fill 0.3s' }}>{'{ }'}</text>
        {/* Status dots */}
        <circle cx="362" cy="253" r="2.5" fill={activeDevice === 2 ? primary : border} style={{ transition: 'fill 0.3s' }} />
        <circle cx="369" cy="257" r="2.5" fill={activeDevice === 2 ? '#78875b' : border} style={{ transition: 'fill 0.3s' }} />
      </g>

      {/* Device 3: Studio (isometric screen/tab, bottom-left) */}
      <g style={getStyle(4)}>
        <path d="M85 300C87 299 90 299 92 300L165 340H182V351C182 352 181 353 180 353.5L114 392C112 393 109 393 107 392L19 341C18 340.5 17.5 340 17.5 339V328H34L85 300Z" fill={bg} stroke={border} />
        <path d="M85 288C87 287 90 287 92 288L180 339C182 340 182 342 180 343L114 381C112 382 109 382 107 381L19 330C17 329 17 327 19 326L85 288Z" fill={bg} stroke={border} />
        <path d="M87 293C88 292 90 292 91 293L172 339C173 340 173 341 172 342L113 376C112 377 110 377 108 376L28 330C27 329 27 328 28 327L87 293Z" fill={muted} stroke={border} />
        {/* Screen lines */}
        <line x1="55" y1="328" x2="130" y2="371" stroke={activeDevice === 4 ? primary : border} strokeWidth="0.8" style={{ transition: 'stroke 0.3s' }} />
        <line x1="60" y1="325" x2="115" y2="357" stroke={activeDevice === 4 ? '#78875b' : border} strokeWidth="0.8" style={{ transition: 'stroke 0.3s' }} />
      </g>

      {/* Device 4: Rust Output (isometric document, bottom-center) */}
      <g style={getStyle(3)}>
        <path d="M213 375C215 374 218 374 220 375L238 385H255V396C255 397 254 397.5 253 398L187 436C185 437 182 437 180 436L147 418C146 417.5 145.5 417 145.5 416V405H162L213 375Z" fill={bg} stroke={border} />
        <path d="M213 364C215 363 218 363 220 364L253 383C255 384 255 386 253 387L187 425C185 426 182 426 180 425L147 406C145 405 145 403 147 402L213 364Z" fill={bg} stroke={border} />
        <path d="M215 369C216 368 218 368 219 369L244 383C245 384 245 385 244 386L196 414C195 415 193 415 191 414L167 400C166 399 166 398 167 397L215 369Z" fill={muted} stroke={border} />
        {/* fn text */}
        <text x="192" y="396" fill={activeDevice === 3 ? primary : '#a39a8f'} fontSize="8" fontFamily="monospace" style={{ transition: 'fill 0.3s' }}>fn()</text>
      </g>
    </svg>
  );
};

/* ── Main component ── */
const ExpandableFeatures = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-6 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 grid items-end gap-4 md:grid-cols-2">
          <h2 className="text-3xl text-[#171412] lg:text-4xl" style={{ fontFamily: "'Playfair Display', serif" }}>
            How the decompiler works
          </h2>
          <p className="text-sm leading-relaxed text-[#72695e]">
            Five stages that transform opaque WASM into auditable Rust — all running client-side.
          </p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-5">
          {/* Feature accordion */}
          <div className="relative z-10 lg:col-span-2">
            <AnimatePresence>
              {typeof expandedIndex === 'number' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.75, y: 44, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.75, y: 44, filter: 'blur(4px)' }}
                  className="absolute inset-y-0 flex items-center gap-3 sm:flex-col lg:-left-8 lg:-translate-x-full max-sm:-inset-x-4 max-sm:justify-between"
                >
                  <button
                    disabled={expandedIndex === 0}
                    onClick={() => handleSelect(expandedIndex - 1)}
                    className="h-9 w-9 rounded-full border border-[#d6cfbf] bg-white/70 flex items-center justify-center text-[#72695e] disabled:opacity-30 hover:border-[#f08b57] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 15l-6-6-6 6"/></svg>
                  </button>
                  <button
                    disabled={expandedIndex === features.length - 1}
                    onClick={() => handleSelect(expandedIndex + 1)}
                    className="h-9 w-9 rounded-full border border-[#d6cfbf] bg-white/70 flex items-center justify-center text-[#72695e] disabled:opacity-30 hover:border-[#f08b57] transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2 max-lg:px-16 max-sm:px-9">
              <LayoutGroup>
                {features.map((feature, index) => {
                  const isActive = expandedIndex === index;
                  return (
                    <motion.div
                      layout
                      layoutDependency={expandedIndex}
                      layoutId={feature.title}
                      key={feature.title}
                      initial={false}
                      animate={{
                        paddingTop: isActive ? 18 : 0,
                        paddingBottom: isActive ? 18 : 0,
                        width: isActive ? '100%' : 'fit-content',
                      }}
                      transition={{
                        layout: { type: 'spring', bounce: 0.2, duration: 0.5 },
                        type: 'spring',
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                      className={`group relative min-w-0 max-w-xs overflow-hidden rounded-3xl text-left ring-1 transition-colors duration-500 max-md:mx-auto ${
                        isActive
                          ? 'w-full bg-white/60 shadow-md shadow-black/5 ring-[#d6cfbf]'
                          : 'ring-transparent text-[#a39a8f] hover:text-[#72695e]'
                      }`}
                    >
                      <AnimatePresence initial={false}>
                        {!isActive && (
                          <motion.button
                            layout="position"
                            onClick={() => handleSelect(index)}
                            initial={{ opacity: 0, filter: 'blur(4px)', y: 4 }}
                            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                            exit={{ opacity: 0, filter: 'blur(4px)', y: -4 }}
                            transition={{ duration: 0.5 }}
                            className="flex h-10 cursor-pointer items-center gap-2 px-4"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                            <h3 className="text-nowrap text-sm">{feature.title}</h3>
                          </motion.button>
                        )}

                        {isActive && (
                          <motion.div
                            layout="position"
                            initial={{ opacity: 0, height: 0, filter: 'blur(4px)', y: 4 }}
                            animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)', y: 0 }}
                            exit={{ opacity: 0, height: 0, filter: 'blur(4px)', y: -4 }}
                            transition={{ duration: 0.6, type: 'spring', bounce: 0.2 }}
                            className="px-6"
                          >
                            <p className="text-sm leading-relaxed text-[#72695e]">
                              <strong className="text-[#171412]">{feature.title}.</strong>{' '}
                              {feature.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </LayoutGroup>
            </div>
          </div>

          {/* Illustration */}
          <div className="max-lg:row-start-1 lg:col-span-3 lg:-translate-x-10">
            <SceneIllustration activeDevice={expandedIndex} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpandableFeatures;
