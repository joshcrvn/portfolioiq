import { TrendingUp, TrendingDown, Wallet, Activity, Layers, Briefcase, Newspaper, ExternalLink, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePortfolio } from '../hooks/usePortfolio';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { useNews } from '../hooks/useNews';
import { HoldingsTable } from '../components/portfolio/HoldingsTable';
import { PerformanceChart } from '../components/charts/PerformanceChart';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { usePortfolioStore } from '../store/portfolioStore';
import type { LiveHolding } from '../types';
import type { NewsItem } from '../types';

const CARD_STYLE = {
  background: 'rgba(13,17,23,0.8)',
  border: '1px solid rgba(255,255,255,0.06)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
};

const SENTIMENT_COLORS: Record<NewsItem['sentiment'], string> = {
  positive: '#00FF94',
  negative: '#FF4D4D',
  neutral: '#8B949E',
};

// ── Animated summary card ──────────────────────────────────────────────────────

function SummaryCard({
  label,
  rawValue,
  subValue,
  subSuffix,
  isPositive,
  icon: Icon,
  index,
  formatter,
}: {
  label: string;
  rawValue: number;
  subValue?: number;
  subSuffix?: string;
  isPositive?: boolean;
  icon: React.ElementType;
  index: number;
  formatter: (n: number) => string;
}) {
  const color = isPositive === undefined ? '#00D4FF' : isPositive ? '#00FF94' : '#FF4D6D';
  const glowColor = isPositive === undefined ? 'rgba(0,212,255,0.2)' : isPositive ? 'rgba(0,255,148,0.2)' : 'rgba(255,77,109,0.2)';

  const animatedValue = useAnimatedCounter(rawValue);
  const animatedSub   = useAnimatedCounter(subValue ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{
        borderColor: `rgba(0,255,148,0.2)`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 20px ${glowColor}`,
      }}
      className="rounded-xl p-6 cursor-default"
      style={{
        background: 'rgba(13,17,23,0.8)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <span
          className="font-medium tracking-[0.12em] uppercase"
          style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)' }}
        >
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon size={16} color={color} />
        </div>
      </div>
      <div
        className="font-mono font-bold"
        style={{
          fontSize: '1.5rem',
          color: '#E6EDF3',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}
      >
        {formatter(animatedValue)}
      </div>
      {subValue !== undefined && (
        <div
          className="font-mono text-sm mt-1.5"
          style={{
            color: isPositive === undefined ? 'rgba(255,255,255,0.4)' : color,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          }}
        >
          {formatPercent(animatedSub)}{subSuffix ?? ''}
        </div>
      )}
    </motion.div>
  );
}

// ── Mini widgets ──────────────────────────────────────────────────────────────

function TopHoldings({ liveHoldings }: { liveHoldings: LiveHolding[] }) {
  const top3 = [...liveHoldings]
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 3);

  return (
    <div className="card rounded-xl p-6 h-full" style={CARD_STYLE}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Briefcase size={15} color="#00D4FF" />
          <h2 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>Top Holdings</h2>
        </div>
        <Link
          to="/app/portfolio"
          className="text-xs transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#00FF94'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
        >
          View all →
        </Link>
      </div>

      {liveHoldings.length === 0 ? (
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>No holdings yet</p>
      ) : (
        <div className="flex flex-col gap-3">
          {top3.map((h) => (
            <div key={h.id} className="flex items-center gap-3">
              <span
                className="font-mono text-xs font-semibold px-2 py-0.5 rounded flex-shrink-0"
                style={{
                  backgroundColor: 'rgba(0,255,148,0.1)',
                  color: '#00FF94',
                  border: '1px solid rgba(0,255,148,0.3)',
                  borderRadius: 4,
                }}
              >
                {h.ticker}
              </span>
              <span
                className="font-mono text-sm flex-1 text-right"
                style={{ color: '#E6EDF3', fontFamily: "'JetBrains Mono', monospace" }}
              >
                {formatCurrency(h.currentValue)}
              </span>
              <span
                className="font-mono text-xs flex-shrink-0 w-16 text-right"
                style={{
                  color: h.pnlPercent >= 0 ? '#00FF94' : '#FF4D6D',
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {h.pnlPercent >= 0 ? '+' : ''}{h.pnlPercent.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60_000))}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function CompactNewsCard({ article }: { article: NewsItem }) {
  return (
    <div
      className="flex flex-col gap-1.5 py-3"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: 'rgba(0,212,255,0.08)',
              color: '#00D4FF',
              border: '1px solid rgba(0,212,255,0.25)',
            }}
          >
            {article.ticker === 'GLOBAL' ? 'MARKET' : article.ticker}
          </span>
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded-full"
            style={{
              color: SENTIMENT_COLORS[article.sentiment],
              backgroundColor: SENTIMENT_COLORS[article.sentiment] + '18',
            }}
          >
            {article.sentiment}
          </span>
        </div>
        {article.url !== '#' && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
            style={{ color: 'rgba(255,255,255,0.25)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#8B949E'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>
      <p className="text-xs font-medium leading-snug" style={{ color: '#E6EDF3' }}>
        {article.title}
      </p>
      <div className="flex items-center gap-1.5">
        <Clock size={10} color="rgba(255,255,255,0.25)" />
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{timeAgo(article.publishedAt)}</span>
      </div>
    </div>
  );
}

function LatestNews({ tickers }: { tickers: string[] }) {
  const { data: articles, isLoading } = useNews(tickers);
  const latest3 = articles?.slice(0, 3) ?? [];

  return (
    <div className="card rounded-xl p-6 h-full" style={CARD_STYLE}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Newspaper size={15} color="#00D4FF" />
          <h2 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>Latest News</h2>
        </div>
        <Link
          to="/app/news"
          className="text-xs transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#00FF94'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
        >
          View all →
        </Link>
      </div>

      {tickers.length === 0 ? (
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Add holdings to see news
        </p>
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="h-3 rounded mb-2" style={{ backgroundColor: 'rgba(255,255,255,0.06)', width: '40%' }} />
              <div className="h-3 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.04)', width: '90%' }} />
            </div>
          ))}
        </div>
      ) : latest3.length === 0 ? (
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>No articles yet</p>
      ) : (
        <div>
          {latest3.map((article) => (
            <CompactNewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function Dashboard() {
  const { liveHoldings, summary, isLoading, refetch } = usePortfolio();
  const holdings = usePortfolioStore((s) => s.holdings);
  const tickers = holdings.map((h) => h.ticker);

  return (
    <div className="flex flex-col gap-12">
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
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Your portfolio at a glance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="TOTAL VALUE"
          rawValue={summary.totalValue}
          icon={Wallet}
          index={0}
          formatter={formatCurrency}
        />
        <SummaryCard
          label="TOTAL P&L"
          rawValue={summary.totalPnL}
          subValue={summary.totalPnLPercent}
          isPositive={summary.totalPnL >= 0}
          icon={summary.totalPnL >= 0 ? TrendingUp : TrendingDown}
          index={1}
          formatter={formatCurrency}
        />
        <SummaryCard
          label="DAY CHANGE"
          rawValue={summary.dayChange}
          subValue={summary.dayChangePercent}
          isPositive={summary.dayChange >= 0}
          icon={Activity}
          index={2}
          formatter={formatCurrency}
        />
        <SummaryCard
          label="HOLDINGS"
          rawValue={liveHoldings.length}
          icon={Layers}
          index={3}
          formatter={(n) => String(Math.round(n))}
        />
      </div>

      {/* Performance Chart */}
      <PerformanceChart holdings={holdings} />

      {/* Mini widgets — Top Holdings + Latest News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopHoldings liveHoldings={liveHoldings} />
        <LatestNews tickers={tickers} />
      </div>

      {/* Holdings Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ fontSize: '1rem', color: '#E6EDF3' }}>
            Holdings
          </h2>
          <button
            onClick={() => refetch()}
            className="text-xs px-3 py-1.5 rounded-lg transition-all duration-150"
            style={{
              color: 'rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            Refresh
          </button>
        </div>
        <HoldingsTable holdings={liveHoldings} isLoading={isLoading} />
      </div>
    </div>
  );
}
