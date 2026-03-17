import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Diamond = () => (
  <svg width="6" height="12" viewBox="0 0 4 12" className="inline-block shrink-0">
    <polygon points="2,0 4,6 2,12 0,6" fill="currentColor" className="text-[var(--color-complexity-simple)]" />
  </svg>
);

export { Diamond };

function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, () => setDark((d) => !d)] as const;
}

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const Layout = () => {
  const location = useLocation();
  const isStudio = location.pathname === '/studio';
  const isLanding = location.pathname === '/';
  const [dark, toggleTheme] = useTheme();

  return (
    <div className={`${isStudio ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-[var(--color-sand-paper)] text-[var(--color-ink-base)] font-mono selection:bg-[var(--color-accent-alt)] selection:text-white`}>
      {/* Grid shell + hatching only on landing */}
      {isLanding && (
        <div className="page-grid-shell page-grid-shell--landing" aria-hidden="true">
          <div className="page-grid-shell__border" />
          <div className="page-grid-shell__v page-grid-shell__v--left" />
          <div className="page-grid-shell__v page-grid-shell__v--mid" />
          <div className="page-grid-shell__v page-grid-shell__v--right" />
          <div className="page-grid-shell__h page-grid-shell__h--top" />
          <div className="page-grid-shell__h page-grid-shell__h--mid" />
          <div className="page-grid-shell__h page-grid-shell__h--bottom" />
        </div>
      )}

      <div className={isLanding ? 'relative z-[1] min-h-screen' : 'relative z-[1]'}>

        {/* Navigation */}
        <nav className={`flex items-center justify-between relative z-[5] ${isLanding ? 'px-6 py-5 sm:px-10 lg:px-16' : 'px-6 py-5 sm:px-10'}`}>
          <NavLink to="/" className="flex items-baseline gap-1.5 group">
            <span className="text-[var(--color-ink)] text-2xl font-bold tracking-[-0.03em] group-hover:text-[var(--color-accent)] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
              Soroban
            </span>
            <span className="text-[var(--color-ink)] text-2xl font-bold tracking-[-0.03em] group-hover:text-[var(--color-accent)] transition-colors opacity-40" style={{ fontFamily: "'Playfair Display', serif" }}>
              /
            </span>
            <span className="text-[var(--color-ink)] text-lg font-bold tracking-[-0.02em] group-hover:text-[var(--color-accent)] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
              Decompiler
            </span>
          </NavLink>
          <div className="flex items-center gap-1">
            {[
              { to: '/studio', label: 'Studio' },
              { to: '/compare', label: 'Compare' },
              { to: '/gallery', label: 'Gallery' },
              { to: '/docs', label: 'Docs' },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-2 text-[11px] tracking-[0.12em] uppercase rounded-full transition-colors duration-200 ${
                    isActive
                      ? 'text-[var(--color-ink)] bg-[var(--color-ink)]/5'
                      : 'text-[var(--color-ink-nav)] hover:text-[var(--color-ink)] hover:bg-[var(--color-ink)]/[0.03]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={toggleTheme}
              className="ml-2 flex items-center justify-center rounded-full border border-[var(--color-sand-border)] bg-[var(--color-surface)]/70 p-2 text-[var(--color-ink-nav)] transition-colors hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
              aria-label="Toggle theme"
            >
              {dark ? <SunIcon /> : <MoonIcon />}
            </button>
            <a
              href="https://github.com/Gmin2/soroban-decoder"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 flex items-center gap-1.5 rounded-full border border-[var(--color-sand-border)] bg-[var(--color-surface)]/70 px-3.5 py-2 text-[11px] tracking-[0.12em] uppercase text-[var(--color-ink-nav)] transition-colors hover:border-[var(--color-ink)] hover:text-[var(--color-ink)]"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
              GitHub
            </a>
          </div>
        </nav>

        <div className="h-px bg-[var(--color-sand-border)]" />

        {/* Page content */}
        <main className={`relative ${isStudio ? 'h-[calc(100vh-57px)] overflow-hidden' : ''}`}>
          <Outlet />
        </main>

        {/* Footer */}
        {!isStudio && !isLanding && (
          <>
            <div className="h-px bg-[var(--color-sand-border)]" />
            <footer className="px-6 sm:px-10 py-6 flex items-center justify-between">
              <span className="text-xs tracking-[0.15em] text-[var(--color-ink-footer)]">2026 {">>>"}</span>
              <div className="flex items-center gap-3">
                <Diamond />
                <span className="text-xs tracking-[0.15em] text-[var(--color-ink-footer)]">SOROBAN DECOMPILER</span>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default Layout;
