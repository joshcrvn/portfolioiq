import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ParticleBackground } from './components/layout/ParticleBackground';
import { PageTransition } from './components/layout/PageTransition';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Portfolio } from './pages/Portfolio';
import { RiskMetrics } from './pages/RiskMetrics';
import { NewsAlerts } from './pages/NewsAlerts';
import { NotFound } from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

// ── App shell (sidebar + navbar + animated route outlet) ──────────────────────
function AppLayout() {
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('sidebar-collapsed');
    if (stored !== null) return stored === 'true';
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const sidebarWidth = sidebarCollapsed ? 56 : 224;

  return (
    <div className="flex min-h-screen" style={{ position: 'relative', zIndex: 1 }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      {/* Toggle button — fixed sibling so sidebar overflow:hidden doesn't clip it */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          position: 'fixed',
          left: sidebarWidth - 13,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: 'rgba(0,255,148,0.12)',
          border: '1px solid rgba(0,255,148,0.35)',
          cursor: 'pointer',
          boxShadow: '0 0 10px rgba(0,255,148,0.15), 0 2px 8px rgba(0,0,0,0.5)',
          zIndex: 50,
          color: '#00FF94',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'left 0.25s ease, background 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0,255,148,0.25)';
          e.currentTarget.style.boxShadow = '0 0 16px rgba(0,255,148,0.3), 0 2px 8px rgba(0,0,0,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,255,148,0.12)';
          e.currentTarget.style.boxShadow = '0 0 10px rgba(0,255,148,0.15), 0 2px 8px rgba(0,0,0,0.5)';
        }}
      >
        <motion.span
          animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronLeft size={13} />
        </motion.span>
      </button>
      <div style={{ width: sidebarWidth, flexShrink: 0, transition: 'width 0.25s ease' }} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar sidebarWidth={sidebarWidth} />
        <main className="flex-1 pl-10 pr-8 lg:pl-14 lg:pr-10 pb-10" style={{ paddingTop: '96px' }}>
          <AnimatePresence mode="wait" initial={false}>
            <div key={location.pathname}>
              <Outlet />
            </div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ── Root router ───────────────────────────────────────────────────────────────
function AppRouter() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname.startsWith('/app') ? 'app' : location.pathname}>
        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Main app — all behind /app */}
        <Route path="/app" element={<AppLayout />}>
          <Route index       element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
          <Route path="risk"      element={<PageTransition><RiskMetrics /></PageTransition>} />
          <Route path="news"      element={<PageTransition><NewsAlerts /></PageTransition>} />
          <Route path="*"         element={<PageTransition><NotFound /></PageTransition>} />
        </Route>

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ParticleBackground />
        <AppRouter />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
