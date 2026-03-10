import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { usePortfolioStore } from '../../store/portfolioStore';
import type { Holding } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CURRENCIES = ['GBP', 'USD', 'EUR'] as const;

export function AddHoldingModal({ isOpen, onClose }: AddHoldingModalProps) {
  const addHolding = usePortfolioStore((s) => s.addHolding);
  const holdings = usePortfolioStore((s) => s.holdings);

  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [avgBuyPrice, setAvgBuyPrice] = useState('');
  const [currency, setCurrency] = useState<'GBP' | 'USD' | 'EUR'>('GBP');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setTicker('');
      setShares('');
      setAvgBuyPrice('');
      setCurrency('GBP');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const tickerUpper = ticker.trim().toUpperCase();
    if (!tickerUpper) return setError('Ticker is required');
    if (!shares || isNaN(Number(shares)) || Number(shares) <= 0)
      return setError('Enter a valid number of shares');
    if (!avgBuyPrice || isNaN(Number(avgBuyPrice)) || Number(avgBuyPrice) <= 0)
      return setError('Enter a valid average buy price');

    const duplicate = holdings.find((h) => h.ticker === tickerUpper);
    if (duplicate) return setError(`${tickerUpper} is already in your portfolio`);

    const holding: Holding = {
      id: uuidv4(),
      ticker: tickerUpper,
      name: tickerUpper, // will be enriched from live data
      shares: Number(shares),
      avgBuyPrice: Number(avgBuyPrice),
      currency,
      addedAt: new Date().toISOString(),
    };

    addHolding(holding);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-xl fade-in"
        style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #30363D' }}>
          <h2 className="font-semibold text-base" style={{ color: '#E6EDF3' }}>
            Add ETF Holding
          </h2>
          <button onClick={onClose}
            className="rounded-lg p-1 transition-colors"
            style={{ color: '#8B949E' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)', color: '#FF4D4D', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8B949E' }}>
              TICKER SYMBOL
            </label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g. VWRL, CSPX, VUSA"
              className="w-full px-3 py-2.5 rounded-lg text-sm font-mono transition-colors outline-none"
              style={{
                backgroundColor: '#0F1117',
                border: '1px solid #30363D',
                color: '#E6EDF3',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#00FF94')}
              onBlur={(e) => (e.target.style.borderColor = '#30363D')}
              autoFocus
            />
            <p className="mt-1 text-xs" style={{ color: '#8B949E' }}>
              For LSE ETFs, include .L suffix (e.g. VWRL.L)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8B949E' }}>
                SHARES
              </label>
              <input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="0.00"
                min="0"
                step="any"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-mono transition-colors outline-none"
                style={{
                  backgroundColor: '#0F1117',
                  border: '1px solid #30363D',
                  color: '#E6EDF3',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#00FF94')}
                onBlur={(e) => (e.target.style.borderColor = '#30363D')}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#8B949E' }}>
                AVG BUY PRICE
              </label>
              <input
                type="number"
                value={avgBuyPrice}
                onChange={(e) => setAvgBuyPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="any"
                className="w-full px-3 py-2.5 rounded-lg text-sm font-mono transition-colors outline-none"
                style={{
                  backgroundColor: '#0F1117',
                  border: '1px solid #30363D',
                  color: '#E6EDF3',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#00FF94')}
                onBlur={(e) => (e.target.style.borderColor = '#30363D')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#8B949E' }}>
              CURRENCY
            </label>
            <div className="flex gap-2">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className="flex-1 py-2 rounded-lg text-sm font-mono font-medium transition-all"
                  style={{
                    backgroundColor: currency === c ? 'rgba(0, 255, 148, 0.1)' : '#0F1117',
                    border: `1px solid ${currency === c ? '#00FF94' : '#30363D'}`,
                    color: currency === c ? '#00FF94' : '#8B949E',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 mt-2"
            style={{
              background: 'linear-gradient(135deg, #00FF94, #00D4FF)',
              color: '#0F1117',
            }}
          >
            Add to Portfolio
          </button>
        </form>
      </div>
    </div>
  );
}
