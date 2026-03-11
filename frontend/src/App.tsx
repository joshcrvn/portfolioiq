import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ParticleBackground } from './components/layout/ParticleBackground';
import { PageTransition } from './components/layout/PageTransition';
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

// Separate component so useLocation can read the router context
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/"          element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/holdings"  element={<PageTransition><Holdings /></PageTransition>} />
        <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
        <Route path="/risk"      element={<PageTransition><RiskMetrics /></PageTransition>} />
        <Route path="/news"      element={<PageTransition><News /></PageTransition>} />
        <Route path="/alerts"    element={<PageTransition><Alerts /></PageTransition>} />
        <Route path="*"          element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ParticleBackground />
        {/* z-index: 1 lifts the app layout above the particle canvas (z-index: 0) */}
        <div className="flex min-h-screen" style={{ position: 'relative', zIndex: 1 }}>
          <Sidebar />
          {/* Spacer that matches sidebar width — keeps content out from behind the fixed sidebar */}
          <div className="w-16 lg:w-56 flex-shrink-0" />
          <div className="flex-1 min-w-0 flex flex-col">
            <Navbar />
            <main className="flex-1 px-8 lg:px-10 pb-8" style={{ paddingTop: '80px' }}>
              <AnimatedRoutes />
            </main>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
