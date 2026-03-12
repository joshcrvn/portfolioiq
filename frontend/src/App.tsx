import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
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
