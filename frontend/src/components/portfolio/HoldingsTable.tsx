import { useState } from 'react';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import type { LiveHolding } from '../../types';
import { usePortfolioStore } from '../../store/portfolioStore';
import { formatCurrency, formatPercent, pnlColor } from '../../utils/formatters';

interface HoldingsTableProps {
  holdings: LiveHolding[];
  isLoading: boolean;
}

const HEADERS = ['Holding', 'Shares', 'Avg Price', 'Current', 'Value', 'P&L', 'Day', ''];

export function HoldingsTable({ holdings, isLoading }: HoldingsTableProps) {
  const removeHolding = usePortfolioStore((s) => s.removeHolding);

  if (holdings.length === 0 && !isLoading) {
    return (
      <div className="rounded-xl p-12 text-center"
        style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
        <div className="text-4xl mb-3">📊</div>
        <p className="font-semibold text-base mb-1" style={{ color: '#E6EDF3' }}>
          No holdings yet
        </p>
        <p className="text-sm" style={{ color: '#8B949E' }}>
          Click "Add Holding" to start tracking your ETF portfolio
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #30363D' }}>
              {HEADERS.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3.5 text-left text-xs font-medium tracking-wider"
                  style={{
                    color: '#8B949E',
                    width: h === 'Holding' ? '220px' : h === '' ? '40px' : undefined,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && holdings.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1E2430' }}>
                    {HEADERS.map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 rounded animate-pulse"
                          style={{ backgroundColor: '#30363D', width: j === 0 ? '140px' : '60px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              : holdings.map((h) => (
                  <HoldingRow key={h.id} holding={h} onRemove={removeHolding} />
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HoldingRow({
  holding,
  onRemove,
}: {
  holding: LiveHolding;
  onRemove: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isUp = holding.pnl >= 0;

  const handleDelete = () => {
    if (confirmDelete) {
      onRemove(holding.id);
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <tr
      className="transition-colors"
      style={{ borderBottom: '1px solid #1E2430' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A1F2E')}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        setConfirmDelete(false);
      }}
    >
      {/* Holding: ticker badge + name */}
      <td className="px-4 py-3.5">
        <div className="flex flex-col gap-0.5">
          <span
            className="font-mono font-semibold text-sm px-2 py-0.5 rounded self-start"
            style={{ backgroundColor: 'rgba(0, 212, 255, 0.1)', color: '#00D4FF' }}
          >
            {holding.ticker}
          </span>
          <span
            className="text-xs truncate"
            style={{ color: '#8B949E', maxWidth: '200px' }}
          >
            {holding.name}
          </span>
        </div>
      </td>

      {/* Shares */}
      <td className="px-4 py-3.5" style={{ whiteSpace: 'nowrap' }}>
        <span className="font-mono text-sm" style={{ color: '#E6EDF3' }}>
          {holding.shares.toLocaleString()}
        </span>
      </td>

      {/* Avg Price */}
      <td className="px-4 py-3.5" style={{ whiteSpace: 'nowrap' }}>
        <span className="font-mono text-sm" style={{ color: '#8B949E' }}>
          {formatCurrency(holding.avgBuyPrice, holding.currency)}
        </span>
      </td>

      {/* Current Price */}
      <td className="px-4 py-3.5" style={{ whiteSpace: 'nowrap' }}>
        <span className="font-mono text-sm font-medium" style={{ color: '#E6EDF3' }}>
          {holding.currentPrice > 0 ? formatCurrency(holding.currentPrice, holding.currency) : '—'}
        </span>
      </td>

      {/* Value */}
      <td className="px-4 py-3.5" style={{ whiteSpace: 'nowrap' }}>
        <span className="font-mono text-sm font-semibold" style={{ color: '#E6EDF3' }}>
          {holding.currentValue > 0 ? formatCurrency(holding.currentValue, holding.currency) : '—'}
        </span>
      </td>

      {/* P&L */}
      <td className="px-4 py-3.5" style={{ whiteSpace: 'nowrap' }}>
        <div className="flex items-center gap-1">
          {isUp ? (
            <TrendingUp size={11} color="#00FF94" />
          ) : (
            <TrendingDown size={11} color="#FF4D4D" />
          )}
          <div>
            <div className="font-mono text-sm font-medium" style={{ color: pnlColor(holding.pnl) }}>
              {formatCurrency(holding.pnl, holding.currency)}
            </div>
            <div className="font-mono text-xs" style={{ color: pnlColor(holding.pnlPercent) }}>
              {formatPercent(holding.pnlPercent)}
            </div>
          </div>
        </div>
      </td>

      {/* Day Change */}
      <td className="px-4 py-3.5" style={{ whiteSpace: 'nowrap' }}>
        <span className="font-mono text-sm" style={{ color: pnlColor(holding.dayChange) }}>
          {formatPercent(holding.dayChangePercent)}
        </span>
      </td>

      {/* Delete */}
      <td className="px-4 py-3.5">
        {confirmDelete ? (
          <button
            onClick={handleDelete}
            className="text-xs font-medium px-2 py-0.5 rounded transition-colors"
            style={{
              backgroundColor: 'rgba(255, 77, 77, 0.15)',
              color: '#FF4D4D',
              border: '1px solid rgba(255, 77, 77, 0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            Confirm
          </button>
        ) : (
          <button
            onClick={handleDelete}
            className="p-1 rounded transition-all"
            style={{ color: '#8B949E' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FF4D4D')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#8B949E')}
            title="Remove holding"
          >
            <Trash2 size={14} />
          </button>
        )}
      </td>
    </tr>
  );
}
