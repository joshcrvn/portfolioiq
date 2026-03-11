import { useState } from 'react';
import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import type { LiveHolding } from '../../types';
import { usePortfolioStore } from '../../store/portfolioStore';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface HoldingsTableProps {
  holdings: LiveHolding[];
  isLoading: boolean;
}

const HEADERS = ['Holding', 'Shares', 'Avg Price', 'Current', 'Value', 'P&L', 'Day', ''];

export function HoldingsTable({ holdings, isLoading }: HoldingsTableProps) {
  const removeHolding = usePortfolioStore((s) => s.removeHolding);

  if (holdings.length === 0 && !isLoading) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{
          background: 'rgba(13,17,23,0.8)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <div className="text-4xl mb-3">📊</div>
        <p className="font-semibold text-base mb-1" style={{ color: '#E6EDF3' }}>
          No holdings yet
        </p>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Click "Add Holding" to start tracking your ETF portfolio
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(13,17,23,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full" style={{ minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {HEADERS.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3.5 text-left font-medium tracking-[0.08em] uppercase"
                  style={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.35)',
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
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {HEADERS.map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div
                          className="h-4 rounded animate-pulse"
                          style={{ backgroundColor: 'rgba(255,255,255,0.06)', width: j === 0 ? '140px' : '60px' }}
                        />
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
      className="transition-colors duration-100"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)')}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        setConfirmDelete(false);
      }}
    >
      {/* Holding: ticker badge + name */}
      <td className="px-4 py-3.5">
        <div className="flex flex-col gap-0.5">
          <span
            className="font-mono font-semibold self-start"
            style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0,255,148,0.1)',
              border: '1px solid rgba(0,255,148,0.3)',
              color: '#00FF94',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }}
          >
            {holding.ticker}
          </span>
          <span
            className="text-xs truncate"
            style={{ color: 'rgba(255,255,255,0.35)', maxWidth: '200px' }}
          >
            {holding.name}
          </span>
        </div>
      </td>

      {/* Shares */}
      <td className="px-4 py-3.5" style={{ whiteSpace: 'nowrap' }}>
        <span
          className="text-sm"
          style={{ color: '#E6EDF3', fontFamily: "'JetBrains Mono', monospace" }}
        >
          {holding.shares.toLocaleString()}
        </span>
      </td>

      {/* Avg Price */}
      <td className="px-4 py-3.5" style={{ whiteSpace: 'nowrap' }}>
        <span
          className="text-sm"
          style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace" }}
        >
          {formatCurrency(holding.avgBuyPrice, holding.currency)}
        </span>
      </td>

      {/* Current Price */}
      <td className="px-4 py-3.5" style={{ whiteSpace: 'nowrap' }}>
        <span
          className="text-sm font-medium"
          style={{ color: '#E6EDF3', fontFamily: "'JetBrains Mono', monospace" }}
        >
          {holding.currentPrice > 0 ? formatCurrency(holding.currentPrice, holding.currency) : '—'}
        </span>
      </td>

      {/* Value */}
      <td className="px-4 py-3.5" style={{ whiteSpace: 'nowrap' }}>
        <span
          className="text-sm font-semibold"
          style={{ color: '#E6EDF3', fontFamily: "'JetBrains Mono', monospace" }}
        >
          {holding.currentValue > 0 ? formatCurrency(holding.currentValue, holding.currency) : '—'}
        </span>
      </td>

      {/* P&L */}
      <td className="px-4 py-3.5" style={{ whiteSpace: 'nowrap' }}>
        <div className="flex items-center gap-1.5">
          {isUp ? (
            <TrendingUp size={11} color="#00FF94" />
          ) : (
            <TrendingDown size={11} color="#FF4D6D" />
          )}
          <div>
            <div
              className="text-sm font-medium"
              style={{
                color: holding.pnl >= 0 ? '#00FF94' : '#FF4D6D',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {formatCurrency(holding.pnl, holding.currency)}
            </div>
            <div
              className="text-xs"
              style={{
                color: holding.pnlPercent >= 0 ? '#00FF94' : '#FF4D6D',
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {formatPercent(holding.pnlPercent)}
            </div>
          </div>
        </div>
      </td>

      {/* Day Change */}
      <td className="px-4 py-3.5" style={{ whiteSpace: 'nowrap' }}>
        <span
          className="text-sm"
          style={{
            color: holding.dayChange >= 0 ? '#00FF94' : '#FF4D6D',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
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
              backgroundColor: 'rgba(255,77,109,0.15)',
              color: '#FF4D6D',
              border: '1px solid rgba(255,77,109,0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            Confirm
          </button>
        ) : (
          <button
            onClick={handleDelete}
            className="p-1 rounded transition-all"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FF4D6D')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
            title="Remove holding"
          >
            <Trash2 size={14} />
          </button>
        )}
      </td>
    </tr>
  );
}
