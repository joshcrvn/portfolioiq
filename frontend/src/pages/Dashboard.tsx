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
  const color = isPositive === undefined ? '#00D4FF' : isPositive ? '#00FF94' : '#FF4D4D';
  const glowColor = isPositive === undefined ? 'rgba(0,212,255,0.25)' : isPositive ? 'rgba(0,255,148,0.25)' : 'rgba(255,77,77,0.25)';

  const animatedValue = useAnimatedCounter(rawValue);
  const animatedSub   = useAnimatedCounter(subValue ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ boxShadow: `0 0 0 1px ${glowColor}, 0 4px 24px ${glowColor}` }}
      className="rounded-xl p-6 transition-shadow duration-300 cursor-default"
      style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium tracking-wider" style={{ color: '#8B949E' }}>
          {label}
        </span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}18` }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <div className="font-mono text-xl font-semibold" style={{ color: '#E6EDF3' }}>
        {formatter(animatedValue)}
      </div>
      {subValue !== undefined && (
        <div className="font-mono text-sm mt-1" style={{ color: isPositive === undefined ? '#8B949E' : color }}>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#E6EDF3' }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: '#8B949E' }}>Your portfolio at a glance</p>
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
          <h2 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>Holdings</h2>
          <button
            onClick={() => refetch()}
            className="text-xs px-2 py-1 rounded"
            style={{ color: '#8B949E', backgroundColor: '#161B22', border: '1px solid #30363D' }}
          >
            Refresh
          </button>
        </div>
        <HoldingsTable holdings={liveHoldings} isLoading={isLoading} />
      </div>
    </div>
  );
}
