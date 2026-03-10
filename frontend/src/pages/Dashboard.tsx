import { TrendingUp, TrendingDown, DollarSign, Activity, Layers } from 'lucide-react';
import { usePortfolio } from '../hooks/usePortfolio';
import { HoldingsTable } from '../components/portfolio/HoldingsTable';
import { PerformanceChart } from '../components/charts/PerformanceChart';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { usePortfolioStore } from '../store/portfolioStore';

function SummaryCard({
  label,
  value,
  sub,
  isPositive,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  isPositive?: boolean;
  icon: React.ElementType;
}) {
  const color =
    isPositive === undefined ? '#00D4FF' : isPositive ? '#00FF94' : '#FF4D4D';
  return (
    <div
      className="rounded-xl p-8 transition-all duration-150"
      style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium tracking-wider" style={{ color: '#8B949E' }}>
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={16} color={color} />
        </div>
      </div>
      <div className="font-mono text-xl font-semibold" style={{ color: '#E6EDF3' }}>
        {value}
      </div>
      {sub && (
        <div
          className="font-mono text-sm mt-1"
          style={{ color: isPositive === undefined ? '#8B949E' : color }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  const { liveHoldings, summary, isLoading, refetch } = usePortfolio();
  const holdings = usePortfolioStore((s) => s.holdings);

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#E6EDF3' }}>
          Dashboard
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#8B949E' }}>
          Your portfolio at a glance
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="TOTAL VALUE"
          value={formatCurrency(summary.totalValue)}
          icon={DollarSign}
        />
        <SummaryCard
          label="TOTAL P&L"
          value={formatCurrency(summary.totalPnL)}
          sub={formatPercent(summary.totalPnLPercent)}
          isPositive={summary.totalPnL >= 0}
          icon={summary.totalPnL >= 0 ? TrendingUp : TrendingDown}
        />
        <SummaryCard
          label="DAY CHANGE"
          value={formatCurrency(summary.dayChange)}
          sub={formatPercent(summary.dayChangePercent)}
          isPositive={summary.dayChange >= 0}
          icon={Activity}
        />
        <SummaryCard
          label="HOLDINGS"
          value={String(liveHoldings.length)}
          icon={Layers}
        />
      </div>

      {/* Performance Chart */}
      <PerformanceChart holdings={holdings} />

      {/* Holdings Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>
            Holdings
          </h2>
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
