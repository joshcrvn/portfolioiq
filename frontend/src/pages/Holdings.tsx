import { useState } from 'react';
import { Plus } from 'lucide-react';
import { usePortfolio } from '../hooks/usePortfolio';
import { HoldingsTable } from '../components/portfolio/HoldingsTable';
import { AddHoldingModal } from '../components/portfolio/AddHoldingModal';

export function Holdings() {
  const { liveHoldings, isLoading } = usePortfolio();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#E6EDF3' }}>Holdings</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8B949E' }}>
            {liveHoldings.length} position{liveHoldings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #00FF94, #00D4FF)', color: '#0F1117' }}
        >
          <Plus size={14} strokeWidth={2.5} />
          Add Holding
        </button>
      </div>

      <HoldingsTable holdings={liveHoldings} isLoading={isLoading} />

      <AddHoldingModal isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
