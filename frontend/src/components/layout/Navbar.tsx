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
    const tick = () => setTime(formatTime(new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-2.5">
      <span
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: '#00FF94',
          animation: 'liveDotPulse 2s ease-in-out infinite',
        }}
      />
      <span className="text-xs font-mono font-bold tracking-widest" style={{ color: '#00FF94' }}>
        LIVE
      </span>
      <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>
        · {time}
      </span>
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
        style={{
          background: 'rgba(8, 12, 20, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <LiveIndicator />

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          <button
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150"
            style={{
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <Upload size={14} />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="btn-gradient-glow flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #00FF94, #00D4FF)',
              color: '#080C14',
            }}
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
