import { useState } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { AddHoldingModal } from '../portfolio/AddHoldingModal';

interface NavbarProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Navbar({ onRefresh, isRefreshing }: NavbarProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <header
        className="fixed top-0 right-0 left-16 lg:left-56 h-14 flex items-center justify-between px-4 lg:px-6 z-30"
        style={{ backgroundColor: '#0F1117', borderBottom: '1px solid #30363D' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2 py-1 rounded"
            style={{ backgroundColor: '#161B22', color: '#8B949E', border: '1px solid #30363D' }}>
            LIVE
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 disabled:opacity-50"
              style={{
                backgroundColor: '#161B22',
                color: '#8B949E',
                border: '1px solid #30363D',
              }}
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              background: 'linear-gradient(135deg, #00FF94, #00D4FF)',
              color: '#0F1117',
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            <span className="hidden sm:inline">Add Holding</span>
          </button>
        </div>
      </header>

      <AddHoldingModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  );
}
