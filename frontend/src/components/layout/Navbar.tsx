import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Upload } from 'lucide-react';
import { AddHoldingModal } from '../portfolio/AddHoldingModal';
import { CSVUploadModal } from '../portfolio/CSVUploadModal';

interface NavbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

function LiveIndicator() {
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    // Update every minute
    const tick = () => setTime(formatTime(new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: '#00FF94',
          boxShadow: '0 0 6px rgba(0,255,148,0.8)',
          animation: 'livePulse 2s ease-in-out infinite',
        }}
      />
      <span className="text-xs font-mono font-semibold" style={{ color: '#00FF94' }}>LIVE</span>
      <span className="text-xs font-mono" style={{ color: '#8B949E' }}>· {time}</span>
    </div>
  );
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function Navbar({ onRefresh, isRefreshing }: NavbarProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 right-0 left-16 lg:left-56 h-14 flex items-center justify-between px-4 lg:px-6 z-30"
        style={{ backgroundColor: '#0F1117', borderBottom: '1px solid #30363D' }}
      >
        <LiveIndicator />

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 disabled:opacity-50"
              style={{ backgroundColor: '#161B22', color: '#8B949E', border: '1px solid #30363D' }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          <button
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150"
            style={{ backgroundColor: '#161B22', color: '#8B949E', border: '1px solid #30363D' }}
          >
            <Upload size={14} />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ background: 'linear-gradient(135deg, #00FF94, #00D4FF)', color: '#0F1117' }}
          >
            <Plus size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">Add Holding</span>
          </button>
        </div>
      </header>

      <AddHoldingModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
      <CSVUploadModal isOpen={showCSVModal} onClose={() => setShowCSVModal(false)} />
    </>
  );
}
