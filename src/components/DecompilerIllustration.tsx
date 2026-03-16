/**
 * Isometric decompiler illustration — three stacked layers
 * representing the decompilation pipeline:
 *   Bottom: WASM input
 *   Middle: Analysis engine
 *   Top:    Rust output
 *
 * Each layer uses striped pattern fills (hatching).
 * The active layer highlights in the accent color.
 */
const DecompilerIllustration = ({ activeLayer }: { activeLayer: number | null }) => {
  const hasSelection = activeLayer !== null;

  const layerStyle = (index: number) => ({
    opacity: hasSelection ? (activeLayer === index ? 1 : 0.25) : 1,
    transform: activeLayer === index ? 'scale(1.05)' : 'scale(1)',
    transformOrigin: '180px 250px',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
  });

  const platformStyle = {
    opacity: hasSelection ? 0.5 : 1,
    transition: 'opacity 0.5s ease',
  };

  return (
    <svg
      viewBox="0 0 360 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-sm h-auto"
    >
      <defs>
        <pattern id="hatchStripes" patternUnits="userSpaceOnUse" width="6" height="4" patternTransform="rotate(0)">
          <rect width="6" height="4" fill="#d5d3c7" />
          <rect x="3" width="1" height="4" fill="#b8b6aa" />
        </pattern>
        <pattern id="hatchStripesActive" patternUnits="userSpaceOnUse" width="6" height="4" patternTransform="rotate(0)">
          <rect width="6" height="4" fill="#d5d3c7" />
          <rect x="3" width="1" height="4" fill="#78875b" />
        </pattern>
      </defs>

      {/* Platform / base shadow */}
      <g style={platformStyle}>
        <path
          d="M180 460 L320 380 L320 390 L180 470 L40 390 L40 380 Z"
          fill="#b8b6aa"
          opacity="0.3"
        />
        <path
          d="M180 450 L320 370 L180 290 L40 370 Z"
          fill="none"
          stroke="#b8b6aa"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
      </g>

      {/* ── Layer 0: WASM Input (bottom) ── */}
      <g style={layerStyle(0)}>
        {/* Body */}
        <path
          d="M80 340 L80 380 L180 440 L280 380 L280 340 L180 400 Z"
          fill={activeLayer === 0 ? 'url(#hatchStripesActive)' : 'url(#hatchStripes)'}
          stroke="#b8b6aa"
        />
        {/* Top face */}
        <path
          d="M180 300 L280 340 L180 380 L80 340 Z"
          fill="#d5d3c7"
          stroke={activeLayer === 0 ? '#78875b' : '#b8b6aa'}
          strokeWidth={activeLayer === 0 ? 1.5 : 1}
        />
        {/* Hex bytes on top face */}
        <text x="140" y="335" fill={activeLayer === 0 ? '#ff8c00' : '#9a9890'} fontSize="8" fontFamily="monospace">00 61 73 6d</text>
        <text x="155" y="348" fill={activeLayer === 0 ? '#ff8c00' : '#9a9890'} fontSize="8" fontFamily="monospace">01 00 00</text>
        {/* Status dots on body */}
        <circle cx="100" cy="360" r="3" fill={activeLayer === 0 ? '#ff8c00' : '#b8b6aa'} style={{ transition: 'fill 0.3s' }} />
        <circle cx="110" cy="366" r="3" fill={activeLayer === 0 ? '#ff8c00' : '#b8b6aa'} style={{ transition: 'fill 0.3s' }} />
        <circle cx="120" cy="372" r="3" fill={activeLayer === 0 ? '#78875b' : '#b8b6aa'} style={{ transition: 'fill 0.3s' }} />
      </g>

      {/* ── Layer 1: Analysis Engine (middle) ── */}
      <g style={layerStyle(1)}>
        {/* Body */}
        <path
          d="M80 240 L80 280 L180 340 L280 280 L280 240 L180 300 Z"
          fill={activeLayer === 1 ? 'url(#hatchStripesActive)' : 'url(#hatchStripes)'}
          stroke="#b8b6aa"
        />
        {/* Top face */}
        <path
          d="M180 200 L280 240 L180 280 L80 240 Z"
          fill="#d5d3c7"
          stroke={activeLayer === 1 ? '#78875b' : '#b8b6aa'}
          strokeWidth={activeLayer === 1 ? 1.5 : 1}
        />
        {/* Gear/analysis symbol on top face */}
        <path
          d="M170 235 L180 228 L190 235 L185 245 L175 245 Z"
          fill="none"
          stroke={activeLayer === 1 ? '#ff8c00' : '#9a9890'}
          strokeWidth="1.5"
          style={{ transition: 'stroke 0.3s' }}
        />
        <circle cx="180" cy="238" r="4" fill="none" stroke={activeLayer === 1 ? '#ff8c00' : '#9a9890'} strokeWidth="1" style={{ transition: 'stroke 0.3s' }} />
        {/* Progress bars on body */}
        <rect x="95" y="260" width="20" height="2" rx="1" fill={activeLayer === 1 ? '#78875b' : '#b8b6aa'} transform="rotate(30 95 260)" style={{ transition: 'fill 0.3s' }} />
        <rect x="95" y="268" width="14" height="2" rx="1" fill={activeLayer === 1 ? '#78875b' : '#b8b6aa'} transform="rotate(30 95 268)" style={{ transition: 'fill 0.3s' }} />
        <rect x="95" y="276" width="8" height="2" rx="1" fill={activeLayer === 1 ? '#ff8c00' : '#b8b6aa'} transform="rotate(30 95 276)" style={{ transition: 'fill 0.3s' }} />
      </g>

      {/* ── Layer 2: Rust Output (top) ── */}
      <g style={layerStyle(2)}>
        {/* Body */}
        <path
          d="M80 140 L80 180 L180 240 L280 180 L280 140 L180 200 Z"
          fill={activeLayer === 2 ? 'url(#hatchStripesActive)' : 'url(#hatchStripes)'}
          stroke="#b8b6aa"
        />
        {/* Top face */}
        <path
          d="M180 100 L280 140 L180 180 L80 140 Z"
          fill="#d5d3c7"
          stroke={activeLayer === 2 ? '#78875b' : '#b8b6aa'}
          strokeWidth={activeLayer === 2 ? 1.5 : 1}
        />
        {/* Code brackets on top face */}
        <text x="145" y="137" fill={activeLayer === 2 ? '#78875b' : '#9a9890'} fontSize="9" fontFamily="monospace" style={{ transition: 'fill 0.3s' }}>{'fn '}</text>
        <text x="165" y="137" fill={activeLayer === 2 ? '#d2d1c0' : '#9a9890'} fontSize="9" fontFamily="monospace" style={{ transition: 'fill 0.3s' }}>hello()</text>
        <text x="160" y="150" fill={activeLayer === 2 ? '#ff8c00' : '#9a9890'} fontSize="8" fontFamily="monospace" style={{ transition: 'fill 0.3s' }}>{'{ ... }'}</text>
        {/* Status bars on body */}
        <rect x="255" y="152" width="3" height="12" fill={activeLayer === 2 ? '#78875b' : '#b8b6aa'} transform="rotate(-30 255 152)" style={{ transition: 'fill 0.3s' }} />
        <rect x="262" y="156" width="3" height="18" fill={activeLayer === 2 ? '#78875b' : '#b8b6aa'} transform="rotate(-30 262 156)" style={{ transition: 'fill 0.3s' }} />
        <rect x="269" y="160" width="3" height="10" fill={activeLayer === 2 ? '#ff8c00' : '#b8b6aa'} transform="rotate(-30 269 160)" style={{ transition: 'fill 0.3s' }} />
      </g>

      {/* ── Connection arrows between layers ── */}
      <g style={platformStyle}>
        {/* Arrow: Layer 0 → Layer 1 */}
        <line x1="180" y1="295" x2="180" y2="285" stroke="#9a9890" strokeWidth="1" strokeDasharray="2 2" />
        <polygon points="176,287 180,280 184,287" fill="#9a9890" />
        {/* Arrow: Layer 1 → Layer 2 */}
        <line x1="180" y1="195" x2="180" y2="185" stroke="#9a9890" strokeWidth="1" strokeDasharray="2 2" />
        <polygon points="176,187 180,180 184,187" fill="#9a9890" />
      </g>

      {/* ── Corner dots (like the Noamix diamonds but as connection nodes) ── */}
      <g style={platformStyle}>
        <circle cx="80" cy="140" r="2.5" fill="#b8b6aa" stroke="#9a9890" strokeWidth="0.5" />
        <circle cx="280" cy="140" r="2.5" fill="#b8b6aa" stroke="#9a9890" strokeWidth="0.5" />
        <circle cx="80" cy="340" r="2.5" fill="#b8b6aa" stroke="#9a9890" strokeWidth="0.5" />
        <circle cx="280" cy="340" r="2.5" fill="#b8b6aa" stroke="#9a9890" strokeWidth="0.5" />
      </g>
    </svg>
  );
};

export default DecompilerIllustration;
