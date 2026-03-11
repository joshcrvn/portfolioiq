import { useState } from 'react';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';
import { usePortfolioStore } from '../store/portfolioStore';
import { useNews } from '../hooks/useNews';
import type { NewsItem } from '../types';

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const SENTIMENT_STYLES: Record<NewsItem['sentiment'], { label: string; color: string; bg: string }> = {
  positive: { label: 'Positive', color: '#00FF94', bg: 'rgba(0,255,148,0.12)' },
  negative: { label: 'Negative', color: '#FF4D4D', bg: 'rgba(255,77,77,0.12)'  },
  neutral:  { label: 'Neutral',  color: '#8B949E', bg: 'rgba(139,148,158,0.12)' },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

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
      className="rounded-xl p-5 flex flex-col gap-3 hover:border-opacity-60 transition-colors"
      style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
            style={{ backgroundColor: '#21262D', color: '#00D4FF', border: '1px solid #30363D' }}
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
        <h3
          className="text-sm font-semibold leading-snug mb-1.5"
          style={{ color: '#E6EDF3' }}
        >
          {article.title}
        </h3>
        <p className="text-xs leading-relaxed line-clamp-3" style={{ color: '#8B949E' }}>
          {article.description}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-auto pt-1" style={{ borderTop: '1px solid #21262D' }}>
        <span className="text-xs font-medium" style={{ color: '#8B949E' }}>{article.source}</span>
        <span style={{ color: '#30363D' }}>·</span>
        <Clock size={11} color="#8B949E" />
        <span className="text-xs" style={{ color: '#8B949E' }}>{timeAgo(article.publishedAt)}</span>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl p-5 animate-pulse"
      style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 rounded" style={{ backgroundColor: '#21262D' }} />
        <div className="h-5 w-16 rounded-full" style={{ backgroundColor: '#21262D' }} />
      </div>
      <div className="h-4 w-full rounded mb-2" style={{ backgroundColor: '#21262D' }} />
      <div className="h-4 w-3/4 rounded mb-3" style={{ backgroundColor: '#21262D' }} />
      <div className="h-3 w-full rounded mb-1.5" style={{ backgroundColor: '#1A1F2E' }} />
      <div className="h-3 w-5/6 rounded mb-1.5" style={{ backgroundColor: '#1A1F2E' }} />
      <div className="h-3 w-4/6 rounded" style={{ backgroundColor: '#1A1F2E' }} />
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function News() {
  const holdings  = usePortfolioStore((s) => s.holdings);
  const tickers   = holdings.map((h) => h.ticker);
  const isEmpty   = holdings.length === 0;
  const [filter, setFilter] = useState<string>('ALL');

  const { data: articles, isLoading } = useNews(tickers);

  const filtered = articles?.filter(
    (a) => filter === 'ALL' || a.ticker === filter || a.ticker === 'GLOBAL'
  ) ?? [];

  // Sentiment summary counts
  const counts = articles?.reduce(
    (acc, a) => { acc[a.sentiment] = (acc[a.sentiment] ?? 0) + 1; return acc; },
    {} as Record<string, number>
  ) ?? {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#E6EDF3' }}>News</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8B949E' }}>
            Financial news relevant to your holdings
          </p>
        </div>

        {/* Sentiment summary */}
        {articles && articles.length > 0 && (
          <div className="flex gap-3 text-xs">
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
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="rounded-xl p-10 flex flex-col items-center gap-3"
          style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
          <Newspaper size={32} color="#8B949E" />
          <p className="text-sm" style={{ color: '#8B949E' }}>
            Add holdings to see relevant news
          </p>
        </div>
      )}

      {/* Ticker filter tabs */}
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

      {/* Articles grid */}
      {!isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.length === 0
              ? (
                <div className="col-span-full rounded-xl p-8 flex items-center justify-center"
                  style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
                  <p className="text-sm" style={{ color: '#8B949E' }}>No articles found for {filter}</p>
                </div>
              )
              : filtered.map((a) => <ArticleCard key={a.id} article={a} />)
          }
        </div>
      )}

      {!isEmpty && !isLoading && articles && (
        <p className="text-xs" style={{ color: '#8B949E' }}>
          {articles.length} article{articles.length !== 1 ? 's' : ''} ·
          Refreshes every 10 minutes · Sentiment scored by keyword analysis
        </p>
      )}
    </div>
  );
}
