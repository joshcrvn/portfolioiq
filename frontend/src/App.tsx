import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Holdings } from './pages/Holdings';
import { Analytics } from './pages/Analytics';
import { RiskMetrics } from './pages/RiskMetrics';
import { News } from './pages/News';
import { Alerts } from './pages/Alerts';

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
        <div className="min-h-screen" style={{ backgroundColor: '#0F1117' }}>
          <Sidebar />
          <div className="ml-16 lg:ml-56 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pt-14 px-4 lg:px-6 py-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/holdings" element={<Holdings />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/risk" element={<RiskMetrics />} />
                <Route path="/news" element={<News />} />
                <Route path="/alerts" element={<Alerts />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
