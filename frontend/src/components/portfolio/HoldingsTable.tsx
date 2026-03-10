import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import type { LiveHolding } from '../../types';
import { usePortfolioStore } from '../../store/portfolioStore';
import { formatCurrency, formatPercent, pnlColor } from '../../utils/formatters';

interface HoldingsTableProps {
  holdings: LiveHolding[];
  isLoading: boolean;
}

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
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #30363D' }}>
              {['Ticker', 'Name', 'Shares', 'Avg Price', 'Current Price', 'Value', 'P&L', 'Day Change', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium tracking-wider"
                  style={{ color: '#8B949E' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && holdings.length === 0
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #1E2430' }}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded animate-pulse"
                          style={{ backgroundColor: '#30363D', width: j === 1 ? '120px' : '70px' }} />
                      </td>
                    ))}
                    <td />
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
  const isUp = holding.pnl >= 0;

  return (
    <tr
      className="transition-colors group"
      style={{ borderBottom: '1px solid #1E2430' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1A1F2E')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Ticker */}
      <td className="px-4 py-3">
        <span className="font-mono font-semibold text-sm px-2 py-0.5 rounded"
          style={{ backgroundColor: 'rgba(0, 212, 255, 0.1)', color: '#00D4FF' }}>
          {holding.ticker}
        </span>
      </td>

      {/* Name */}
      <td className="px-4 py-3 max-w-[160px]">
        <span className="text-sm truncate block" style={{ color: '#E6EDF3' }}>
          {holding.name}
        </span>
      </td>

      {/* Shares */}
      <td className="px-4 py-3">
        <span className="font-mono text-sm" style={{ color: '#E6EDF3' }}>
          {holding.shares.toLocaleString()}
        </span>
      </td>

      {/* Avg Price */}
      <td className="px-4 py-3">
        <span className="font-mono text-sm" style={{ color: '#8B949E' }}>
          {formatCurrency(holding.avgBuyPrice, holding.currency)}
        </span>
      </td>

      {/* Current Price */}
      <td className="px-4 py-3">
        <span className="font-mono text-sm font-medium" style={{ color: '#E6EDF3' }}>
          {holding.currentPrice > 0 ? formatCurrency(holding.currentPrice, holding.currency) : '—'}
        </span>
      </td>

      {/* Value */}
      <td className="px-4 py-3">
        <span className="font-mono text-sm font-semibold" style={{ color: '#E6EDF3' }}>
          {holding.currentValue > 0 ? formatCurrency(holding.currentValue, holding.currency) : '—'}
        </span>
      </td>

      {/* P&L */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {isUp ? (
            <TrendingUp size={12} color="#00FF94" />
          ) : (
            <TrendingDown size={12} color="#FF4D4D" />
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
      <td className="px-4 py-3">
        <div className="font-mono text-sm" style={{ color: pnlColor(holding.dayChange) }}>
          {formatPercent(holding.dayChangePercent)}
        </div>
      </td>

      {/* Delete */}
      <td className="px-4 py-3">
        <button
          onClick={() => onRemove(holding.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
          style={{ color: '#8B949E' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FF4D4D')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#8B949E')}
        >
          <Trash2 size={14} />
        </button>
      </td>
    </tr>
  );
}
