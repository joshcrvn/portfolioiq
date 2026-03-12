import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ParticleBackground } from './components/layout/ParticleBackground';
import { PageTransition } from './components/layout/PageTransition';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Holdings } from './pages/Holdings';
import { Analytics } from './pages/Analytics';
import { RiskMetrics } from './pages/RiskMetrics';
import { News } from './pages/News';
import { Alerts } from './pages/Alerts';
import { NotFound } from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

// ── App shell (sidebar + navbar + animated route outlet) ──────────────────────
function AppLayout() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen" style={{ position: 'relative', zIndex: 1 }}>
      <Sidebar />
      <div className="w-16 lg:w-56 flex-shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />
        <main className="flex-1 pl-10 pr-8 lg:pl-14 lg:pr-10 pb-8" style={{ paddingTop: '80px' }}>
          <AnimatePresence mode="wait" initial={false}>
            {/* Key by pathname so AnimatePresence fires exit → enter on every navigation */}
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
          <Route index element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="dashboard"  element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="holdings"   element={<PageTransition><Holdings /></PageTransition>} />
          <Route path="analytics"  element={<PageTransition><Analytics /></PageTransition>} />
          <Route path="risk"       element={<PageTransition><RiskMetrics /></PageTransition>} />
          <Route path="news"       element={<PageTransition><News /></PageTransition>} />
          <Route path="alerts"     element={<PageTransition><Alerts /></PageTransition>} />
          <Route path="*"          element={<PageTransition><NotFound /></PageTransition>} />
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
