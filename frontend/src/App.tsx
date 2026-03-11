import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { ParticleBackground } from './components/layout/ParticleBackground';
import { Dashboard } from './pages/Dashboard';
import { Holdings } from './pages/Holdings';
import { Analytics } from './pages/Analytics';
import { RiskMetrics } from './pages/RiskMetrics';
import { News } from './pages/News';
import { Alerts } from './pages/Alerts';
import { NotFound } from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/holdings" element={<Holdings />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/risk" element={<RiskMetrics />} />
                <Route path="/news" element={<News />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
