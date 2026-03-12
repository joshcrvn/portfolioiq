import { useState } from 'react';
import { Newspaper, Bell, BellOff, Trash2, Plus, TrendingUp, TrendingDown, AlertTriangle, ExternalLink, Clock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { usePortfolioStore } from '../store/portfolioStore';
import { usePortfolio } from '../hooks/usePortfolio';
import { useNews } from '../hooks/useNews';
import type { NewsItem, PriceAlert } from '../types';

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatPrice(price: number): string {
  return price.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function isTriggered(alert: PriceAlert, currentPrice: number | undefined): boolean {
  if (!alert.isActive || currentPrice == null || currentPrice === 0) return false;
  if (alert.condition === 'above') return currentPrice >= alert.targetPrice;
  return currentPrice <= alert.targetPrice;
}

const SENTIMENT_STYLES: Record<NewsItem['sentiment'], { label: string; color: string; bg: string }> = {
  positive: { label: 'Positive', color: '#00FF94', bg: 'rgba(0,255,148,0.12)' },
  negative: { label: 'Negative', color: '#FF4D4D', bg: 'rgba(255,77,77,0.12)'  },
  neutral:  { label: 'Neutral',  color: '#8B949E', bg: 'rgba(139,148,158,0.12)' },
};

const CARD_STYLE = {
  background: 'rgba(13,17,23,0.8)',
  border: '1px solid rgba(255,255,255,0.06)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
};

// ── News sub-components ────────────────────────────────────────────────────────

function SentimentBadge({ sentiment }: { sentiment: NewsItem['sentiment'] }) {
  const s = SENTIMENT_STYLES[sentiment];
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ color: s.color, backgroundColor: s.bg }}
    >
      {s.label}
    </span>
  );
}

function ArticleCard({ article }: { article: NewsItem }) {
  return (
    <div
      className="card rounded-xl p-5 flex flex-col gap-3 transition-all duration-200"
      style={CARD_STYLE}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
            style={{
              backgroundColor: 'rgba(0,212,255,0.08)',
              color: '#00D4FF',
              border: '1px solid rgba(0,212,255,0.25)',
            }}
          >
            {article.ticker === 'GLOBAL' ? 'MARKET' : article.ticker}
          </span>
          <SentimentBadge sentiment={article.sentiment} />
        </div>
        {article.url !== '#' && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
            style={{ color: '#8B949E' }}
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold leading-snug mb-1.5" style={{ color: '#E6EDF3' }}>
          {article.title}
        </h3>
        <p className="text-xs leading-relaxed line-clamp-3" style={{ color: '#8B949E' }}>
          {article.description}
        </p>
      </div>

      <div
        className="flex items-center gap-2 mt-auto pt-1"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>{article.source}</span>
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
        <Clock size={11} color="rgba(255,255,255,0.3)" />
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{timeAgo(article.publishedAt)}</span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl p-5 animate-pulse" style={{ background: 'rgba(13,17,23,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <div className="h-5 w-16 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
      </div>
      <div className="h-4 w-full rounded mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
      <div className="h-4 w-3/4 rounded mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
      <div className="h-3 w-full rounded mb-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
      <div className="h-3 w-5/6 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
    </div>
  );
}

// ── Alerts sub-components ──────────────────────────────────────────────────────

function AddAlertForm({ currentPrices }: { currentPrices: Record<string, number> }) {
  const holdings = usePortfolioStore((s) => s.holdings);
  const addAlert  = usePortfolioStore((s) => s.addAlert);

  const [ticker,    setTicker]    = useState(holdings[0]?.ticker ?? '');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [price,     setPrice]     = useState('');
  const [error,     setError]     = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceNum = parseFloat(price);
    if (!ticker.trim()) { setError('Select a ticker'); return; }
    if (isNaN(priceNum) || priceNum <= 0) { setError('Enter a valid price'); return; }

    const alert: PriceAlert = {
      id:          uuidv4(),
      ticker:      ticker.trim().toUpperCase(),
      condition,
      targetPrice: priceNum,
      isActive:    true,
      createdAt:   new Date().toISOString(),
    };
    addAlert(alert);
    setPrice('');
    setError('');
  }

  const currentPrice = currentPrices[ticker] ?? 0;

  return (
    <div className="rounded-xl p-6" style={CARD_STYLE}>
      <div className="flex items-center gap-2 mb-5">
        <Plus size={15} color="#00FF94" />
        <h2 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>Add Alert</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: '#8B949E' }}>Ticker</label>
          {holdings.length > 0 ? (
            <select
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm font-mono outline-none"
              style={{ backgroundColor: '#050810', border: '1px solid rgba(255,255,255,0.08)', color: '#E6EDF3' }}
            >
              {holdings.map((h) => (
                <option key={h.id} value={h.ticker}>{h.ticker}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g. VWRL"
              className="w-full rounded-lg px-3 py-2.5 text-sm font-mono outline-none"
              style={{ backgroundColor: '#050810', border: '1px solid rgba(255,255,255,0.08)', color: '#E6EDF3' }}
            />
          )}
          {currentPrice > 0 && (
            <p className="text-xs mt-1" style={{ color: '#8B949E' }}>
              Current price: <span className="font-mono" style={{ color: '#00D4FF' }}>{formatPrice(currentPrice)}</span>
            </p>
          )}
        </div>

        <div>
          <label className="text-xs mb-1.5 block" style={{ color: '#8B949E' }}>Condition</label>
          <div className="grid grid-cols-2 gap-2">
            {(['above', 'below'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCondition(c)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: condition === c ? '#21262D' : 'transparent',
                  border: `1px solid ${condition === c ? (c === 'above' ? '#00FF94' : '#FF4D4D') : '#30363D'}`,
                  color: condition === c ? (c === 'above' ? '#00FF94' : '#FF4D4D') : '#8B949E',
                }}
              >
                {c === 'above' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                Price {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs mb-1.5 block" style={{ color: '#8B949E' }}>Target Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => { setPrice(e.target.value); setError(''); }}
            placeholder="0.00"
            step="0.01"
            min="0.01"
            className="w-full rounded-lg px-3 py-2.5 text-sm font-mono outline-none"
            style={{ backgroundColor: '#050810', border: '1px solid rgba(255,255,255,0.08)', color: '#E6EDF3' }}
          />
        </div>

        {error && <p className="text-xs" style={{ color: '#FF4D4D' }}>{error}</p>}

        <button
          type="submit"
          className="w-full py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #00FF94, #00D4FF)', color: '#0F1117' }}
        >
          Add Alert
        </button>
      </form>
    </div>
  );
}

function AlertRow({
  alert,
  currentPrice,
  triggered,
  onToggle,
  onDelete,
  confirmDelete,
  onConfirmDelete,
  onCancelDelete,
}: {
  alert: PriceAlert;
  currentPrice: number | undefined;
  triggered: boolean;
  onToggle: () => void;
  onDelete: () => void;
  confirmDelete: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
}) {
  const conditionColor = alert.condition === 'above' ? '#00FF94' : '#FF4D4D';

  return (
    <div
      className="rounded-lg px-4 py-3.5 flex items-center gap-4"
      style={{
        background: triggered ? 'rgba(255,77,109,0.06)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${triggered ? 'rgba(255,77,109,0.5)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'border-color 0.2s',
      }}
    >
      {triggered && <AlertTriangle size={15} color="#FF4D6D" className="flex-shrink-0" />}

      <span
        className="font-mono text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0"
        style={{ backgroundColor: 'rgba(0,255,148,0.1)', color: '#00FF94', border: '1px solid rgba(0,255,148,0.3)' }}
      >
        {alert.ticker}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: '#E6EDF3' }}>
          Price <span style={{ color: conditionColor }}>{alert.condition}</span>{' '}
          <span className="font-mono">{formatPrice(alert.targetPrice)}</span>
        </p>
        {currentPrice != null && currentPrice > 0 && (
          <p className="text-xs mt-0.5" style={{ color: '#8B949E' }}>
            Current: <span className="font-mono">{formatPrice(currentPrice)}</span>
            {triggered && <span className="ml-2 font-medium" style={{ color: '#FF4D4D' }}>● Triggered</span>}
          </p>
        )}
      </div>

      <button onClick={onToggle} title={alert.isActive ? 'Disable alert' : 'Enable alert'}
        style={{ color: alert.isActive ? '#00FF94' : '#8B949E' }}>
        {alert.isActive ? <Bell size={15} /> : <BellOff size={15} />}
      </button>

      {confirmDelete ? (
        <div className="flex items-center gap-2">
          <button onClick={onConfirmDelete} className="text-xs px-2 py-1 rounded font-medium"
            style={{ backgroundColor: 'rgba(255,77,77,0.15)', color: '#FF4D4D' }}>
            Confirm
          </button>
          <button onClick={onCancelDelete} className="text-xs px-2 py-1 rounded" style={{ color: '#8B949E' }}>
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={onDelete} style={{ color: '#8B949E' }}>
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

// ── Tab content components ─────────────────────────────────────────────────────

function NewsContent() {
  const holdings = usePortfolioStore((s) => s.holdings);
  const tickers  = holdings.map((h) => h.ticker);
  const isEmpty  = holdings.length === 0;
  const [filter, setFilter] = useState<string>('ALL');

  const { data: articles, isLoading } = useNews(tickers);

  const filtered = articles?.filter(
    (a) => filter === 'ALL' || a.ticker === filter || a.ticker === 'GLOBAL'
  ) ?? [];

  const counts = articles?.reduce(
    (acc, a) => { acc[a.sentiment] = (acc[a.sentiment] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  ) ?? {};

  return (
    <div className="space-y-6">
      {/* Sentiment summary */}
      {articles && articles.length > 0 && (
        <div className="flex gap-3 text-xs flex-wrap">
          {(['positive', 'neutral', 'negative'] as const).map((s) => {
            const { label, color } = SENTIMENT_STYLES[s];
            return (
              <div key={s} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                <span style={{ color: '#8B949E' }}>{counts[s] ?? 0} {label}</span>
              </div>
            );
          })}
        </div>
      )}

      {isEmpty && (
        <div className="rounded-xl p-10 flex flex-col items-center gap-3" style={CARD_STYLE}>
          <Newspaper size={32} color="rgba(255,255,255,0.3)" />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Add holdings to see relevant news
          </p>
        </div>
      )}

      {!isEmpty && (
        <div className="flex gap-1 flex-wrap">
          {['ALL', ...tickers].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: filter === t ? '#21262D' : 'transparent',
                color: filter === t ? '#E6EDF3' : '#8B949E',
                border: `1px solid ${filter === t ? '#30363D' : 'transparent'}`,
              }}
            >
              {t === 'ALL' ? 'All' : t}
            </button>
          ))}
        </div>
      )}

      {!isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.length === 0
              ? (
                <div className="col-span-full rounded-xl p-8 flex items-center justify-center" style={CARD_STYLE}>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>No articles found for {filter}</p>
                </div>
              )
              : filtered.map((a) => <ArticleCard key={a.id} article={a} />)
          }
        </div>
      )}

      {!isEmpty && !isLoading && articles && (
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {articles.length} article{articles.length !== 1 ? 's' : ''} ·
          Refreshes every 10 minutes · Sentiment scored by keyword analysis
        </p>
      )}
    </div>
  );
}

function AlertsContent() {
  const alerts      = usePortfolioStore((s) => s.alerts);
  const removeAlert = usePortfolioStore((s) => s.removeAlert);
  const toggleAlert = usePortfolioStore((s) => s.toggleAlert);
  const { liveHoldings } = usePortfolio();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const currentPrices: Record<string, number> = {};
  for (const h of liveHoldings) {
    currentPrices[h.ticker] = h.currentPrice;
  }

  const triggeredIds = new Set(
    alerts.filter((a) => isTriggered(a, currentPrices[a.ticker])).map((a) => a.id)
  );

  const sorted = [...alerts].sort((a, b) => {
    const aScore = triggeredIds.has(a.id) ? 2 : a.isActive ? 1 : 0;
    const bScore = triggeredIds.has(b.id) ? 2 : b.isActive ? 1 : 0;
    return bScore - aScore || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <AddAlertForm currentPrices={currentPrices} />
        </div>

        <div className="xl:col-span-2">
          <div className="rounded-xl p-6" style={CARD_STYLE}>
            <div className="flex items-center justify-between gap-2 mb-5">
              <div className="flex items-center gap-2">
                <Bell size={15} color="#F59E0B" />
                <h2 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>Your Alerts</h2>
                {alerts.length > 0 && (
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                    {alerts.length}
                  </span>
                )}
              </div>
              {triggeredIds.size > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(255,77,77,0.12)', color: '#FF4D4D' }}>
                  {triggeredIds.size} triggered
                </span>
              )}
            </div>

            {alerts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <Bell size={28} color="#8B949E" />
                <p className="text-sm" style={{ color: '#8B949E' }}>No alerts yet — add one to get started</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {sorted.map((alert) => (
                  <AlertRow
                    key={alert.id}
                    alert={alert}
                    currentPrice={currentPrices[alert.ticker]}
                    triggered={triggeredIds.has(alert.id)}
                    onToggle={() => toggleAlert(alert.id)}
                    onDelete={() => setConfirmId(alert.id)}
                    confirmDelete={confirmId === alert.id}
                    onConfirmDelete={() => { removeAlert(alert.id); setConfirmId(null); }}
                    onCancelDelete={() => setConfirmId(null)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <p className="text-xs" style={{ color: '#8B949E' }}>
          Alerts are checked against live prices. Triggered alerts are shown in red. Prices refresh every 60 seconds.
        </p>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

const TAB_ACTIVE = {
  color: '#E6EDF3',
  borderBottom: '2px solid #00FF94',
  paddingBottom: '10px',
};

const TAB_INACTIVE = {
  color: 'rgba(255,255,255,0.4)',
  borderBottom: '2px solid transparent',
  paddingBottom: '10px',
};

export function NewsAlerts() {
  const [tab, setTab] = useState<'news' | 'alerts'>('news');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="font-bold"
          style={{
            fontSize: '1.75rem',
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          News & Alerts
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Financial news and price alerts for your holdings
        </p>

        {/* Tabs */}
        <div
          className="flex gap-6 mt-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <button
            onClick={() => setTab('news')}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={tab === 'news' ? TAB_ACTIVE : TAB_INACTIVE}
          >
            <Newspaper size={14} />
            News
          </button>
          <button
            onClick={() => setTab('alerts')}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={tab === 'alerts' ? TAB_ACTIVE : TAB_INACTIVE}
          >
            <Bell size={14} />
            Alerts
          </button>
        </div>
      </div>

      {tab === 'news'   ? <NewsContent />   : <AlertsContent />}
    </div>
  );
}
