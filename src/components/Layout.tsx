import { Outlet, NavLink, useLocation } from 'react-router-dom';

const Diamond = () => (
  <svg width="6" height="12" viewBox="0 0 4 12" className="inline-block shrink-0">
    <polygon points="2,0 4,6 2,12 0,6" fill="#7b7d74" />
  </svg>
);

export { Diamond };

const Layout = () => {
  const location = useLocation();
  const isStudio = location.pathname === '/studio';
  const isLanding = location.pathname === '/';

  return (
    <div className={`${isStudio ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-[#f4efe6] text-[#5a5c54] font-mono selection:bg-[#ff8c00] selection:text-white`}>
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
            <span className="text-[#171412] text-2xl font-bold tracking-[-0.03em] group-hover:text-[#f08b57] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
              Soroban
            </span>
            <span className="text-[#171412] text-2xl font-bold tracking-[-0.03em] group-hover:text-[#f08b57] transition-colors opacity-40" style={{ fontFamily: "'Playfair Display', serif" }}>
              /
            </span>
            <span className="text-[#171412] text-lg font-bold tracking-[-0.02em] group-hover:text-[#f08b57] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
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
                      ? 'text-[#171412] bg-[#171412]/5'
                      : 'text-[#8b857d] hover:text-[#171412] hover:bg-[#171412]/[0.03]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="h-px bg-[#ddd4c8]" />

        {/* Page content */}
        <main className={`relative ${isStudio ? 'h-[calc(100vh-57px)] overflow-hidden' : ''}`}>
          <Outlet />
        </main>

        {/* Footer */}
        {!isStudio && !isLanding && (
          <>
            <div className="h-px bg-[#ddd4c8]" />
            <footer className="px-6 sm:px-10 py-6 flex items-center justify-between">
              <span className="text-xs tracking-[0.15em] text-[#8d8478]">2026 {">>>"}</span>
              <div className="flex items-center gap-3">
                <Diamond />
                <span className="text-xs tracking-[0.15em] text-[#8d8478]">SOROBAN DECOMPILER</span>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default Layout;
