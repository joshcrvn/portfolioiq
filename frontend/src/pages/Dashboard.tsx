import { TrendingUp, TrendingDown, DollarSign, Activity, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePortfolio } from '../hooks/usePortfolio';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { HoldingsTable } from '../components/portfolio/HoldingsTable';
import { PerformanceChart } from '../components/charts/PerformanceChart';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { usePortfolioStore } from '../store/portfolioStore';

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

// ── Page ───────────────────────────────────────────────────────────────────────

export function Dashboard() {
  const { liveHoldings, summary, isLoading, refetch } = usePortfolio();
  const holdings = usePortfolioStore((s) => s.holdings);

  return (
    <div className="space-y-8">
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
          icon={DollarSign}
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

      {/* Holdings Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="font-semibold"
            style={{ fontSize: '1rem', color: '#E6EDF3' }}
          >
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
