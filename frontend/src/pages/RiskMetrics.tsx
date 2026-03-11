import { useState } from 'react';
import { Activity, TrendingDown, BarChart2, Zap, ShieldAlert, GitBranch } from 'lucide-react';
import { usePortfolioStore } from '../store/portfolioStore';
import { useRiskMetrics } from '../hooks/useRiskMetrics';
import { CorrelationHeatmap } from '../components/charts/CorrelationHeatmap';
import { MonteCarloChart } from '../components/charts/MonteCarloChart';

// ── Period selector ────────────────────────────────────────────────────────────

const PERIODS = ['1mo', '3mo', '6mo', '1y', '3y'] as const;
type Period = typeof PERIODS[number];

const PERIOD_LABELS: Record<Period, string> = {
  '1mo': '1M', '3mo': '3M', '6mo': '6M', '1y': '1Y', '3y': '3Y',
};

// ── Metric card ────────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-xl p-5"
      style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} color={iconColor} />
        <p className="text-xs font-medium" style={{ color: '#8B949E' }}>{label}</p>
      </div>
      <p className="font-mono text-2xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: '#8B949E' }}>{sub}</p>}
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-xl p-5 animate-pulse"
      style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
      <div className="h-3 rounded mb-3" style={{ backgroundColor: '#30363D', width: '60%' }} />
      <div className="h-7 rounded" style={{ backgroundColor: '#30363D', width: '50%' }} />
    </div>
  );
}

function SectionCard({
  title, icon: Icon, iconColor, children,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-6"
      style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
      <div className="flex items-center gap-2 mb-5">
        <Icon size={15} color={iconColor} />
        <h2 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(v: number, decimals = 2): string {
  return v.toFixed(decimals);
}

function pct(v: number): string {
  return `${(v * 100).toFixed(2)}%`;
}

function sharpeColor(v: number): string {
  if (v >= 1.5) return '#00FF94';
  if (v >= 0.5) return '#F59E0B';
  if (v >= 0)   return '#00D4FF';
  return '#FF4D4D';
}

function varColor(): string { return '#FF4D4D'; }
function drawdownColor(): string { return '#FF4D4D'; }

function betaColor(v: number): string {
  if (v < 0.8)  return '#00D4FF'; // low beta
  if (v <= 1.2) return '#F59E0B'; // market-like
  return '#FF4D4D';               // high beta
}

function volColor(v: number): string {
  if (v < 0.10) return '#00FF94';
  if (v < 0.20) return '#F59E0B';
  return '#FF4D4D';
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function RiskMetrics() {
  const [period, setPeriod] = useState<Period>('1y');
  const holdings = usePortfolioStore((s) => s.holdings);
  const isEmpty  = holdings.length === 0;

  const { data, isLoading } = useRiskMetrics(holdings, period);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#E6EDF3' }}>Risk Metrics</h1>
          <p className="text-sm mt-0.5" style={{ color: '#8B949E' }}>
            Portfolio risk statistics computed from historical daily returns
          </p>
        </div>

        {/* Period selector */}
        {!isEmpty && (
          <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={{
                  backgroundColor: period === p ? '#21262D' : 'transparent',
                  color: period === p ? '#E6EDF3' : '#8B949E',
                  border: period === p ? '1px solid #30363D' : '1px solid transparent',
                }}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="rounded-xl p-10 flex flex-col items-center gap-3"
          style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
          <ShieldAlert size={32} color="#8B949E" />
          <p className="text-sm" style={{ color: '#8B949E' }}>
            Add holdings to see portfolio risk metrics
          </p>
        </div>
      )}

      {/* Metric cards */}
      {!isEmpty && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => <LoadingCard key={i} />)
            ) : data ? (
              <>
                <MetricCard
                  icon={Activity}
                  label="Sharpe Ratio"
                  value={fmt(data.sharpe)}
                  sub="Return per unit of risk"
                  color={sharpeColor(data.sharpe)}
                  iconColor={sharpeColor(data.sharpe)}
                />
                <MetricCard
                  icon={BarChart2}
                  label="Ann. Volatility"
                  value={pct(data.volatility)}
                  sub="Annualised standard deviation"
                  color={volColor(data.volatility)}
                  iconColor={volColor(data.volatility)}
                />
                <MetricCard
                  icon={TrendingDown}
                  label="Max Drawdown"
                  value={pct(data.maxDrawdown)}
                  sub="Worst peak-to-trough loss"
                  color={drawdownColor()}
                  iconColor="#FF4D4D"
                />
                <MetricCard
                  icon={Zap}
                  label="Beta (vs S&P 500)"
                  value={fmt(data.beta)}
                  sub="Market sensitivity"
                  color={betaColor(data.beta)}
                  iconColor={betaColor(data.beta)}
                />
                <MetricCard
                  icon={ShieldAlert}
                  label="Hist. VaR 95%"
                  value={pct(data.var95)}
                  sub="1-day loss (historical)"
                  color={varColor()}
                  iconColor="#FF4D4D"
                />
                <MetricCard
                  icon={ShieldAlert}
                  label="MC VaR 95%"
                  value={pct(data.mcVar95)}
                  sub="1-day loss (Monte Carlo)"
                  color={varColor()}
                  iconColor="#FF4D4D"
                />
              </>
            ) : null}
          </div>

          {/* Monte Carlo + Correlation side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SectionCard title="Monte Carlo Simulation (3-Month Outlook)" icon={GitBranch} iconColor="#00D4FF">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-6 h-6 rounded-full border-2 animate-spin"
                    style={{ borderColor: '#30363D', borderTopColor: '#00D4FF' }} />
                </div>
              ) : data ? (
                <MonteCarloChart data={data.monteCarlo} nDays={data.mcDays} />
              ) : null}
            </SectionCard>

            <SectionCard title="Correlation Matrix" icon={BarChart2} iconColor="#A78BFA">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-6 h-6 rounded-full border-2 animate-spin"
                    style={{ borderColor: '#30363D', borderTopColor: '#A78BFA' }} />
                </div>
              ) : data ? (
                data.correlations.tickers.length < 2 ? (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-sm text-center" style={{ color: '#8B949E' }}>
                      Add at least 2 holdings to see correlation data
                    </p>
                  </div>
                ) : (
                  <CorrelationHeatmap data={data.correlations} />
                )
              ) : null}
            </SectionCard>
          </div>

          {/* Footnote */}
          <p className="text-xs" style={{ color: '#8B949E' }}>
            Metrics computed from {period} of daily log-returns, weighted by cost basis.
            VaR figures represent estimated 1-day losses at 95 % confidence.
            Monte Carlo uses 500 simulated paths over the next 63 trading days (≈3 months).
          </p>
        </>
      )}
    </div>
  );
}
