import { useState } from 'react';
import { Activity, TrendingDown, BarChart2, Zap, ShieldAlert, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePortfolioStore } from '../store/portfolioStore';
import { useRiskMetrics } from '../hooks/useRiskMetrics';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { CorrelationHeatmap } from '../components/charts/CorrelationHeatmap';
import { MonteCarloChart } from '../components/charts/MonteCarloChart';

const CARD_STYLE = {
  background: 'rgba(13,17,23,0.8)',
  border: '1px solid rgba(255,255,255,0.06)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
};

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
  rawValue,
  sub,
  color,
  iconColor,
  index,
  formatter,
}: {
  icon: React.ElementType;
  label: string;
  rawValue: number;
  sub?: string;
  color: string;
  iconColor: string;
  index: number;
  formatter: (n: number) => string;
}) {
  const animated = useAnimatedCounter(rawValue);
  const glowColor = color + '33';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
      whileHover={{
        borderColor: `rgba(0,255,148,0.2)`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 20px ${glowColor}`,
      }}
      className="rounded-xl p-5 cursor-default"
      style={CARD_STYLE}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} color={iconColor} />
        <p
          className="font-medium tracking-[0.1em] uppercase"
          style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)' }}
        >
          {label}
        </p>
      </div>
      <p
        className="font-bold"
        style={{
          fontSize: '1.5rem',
          color,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        }}
      >
        {formatter(animated)}
      </p>
      {sub && <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{sub}</p>}
    </motion.div>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-xl p-5 animate-pulse" style={CARD_STYLE}>
      <div className="h-3 rounded mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)', width: '60%' }} />
      <div className="h-7 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.06)', width: '50%' }} />
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
    <div className="card rounded-xl p-6" style={CARD_STYLE}>
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
  return '#FF4D6D';
}

function varColor(): string { return '#FF4D6D'; }
function drawdownColor(): string { return '#FF4D6D'; }

function betaColor(v: number): string {
  if (v < 0.8)  return '#00D4FF';
  if (v <= 1.2) return '#F59E0B';
  return '#FF4D6D';
}

function volColor(v: number): string {
  if (v < 0.10) return '#00FF94';
  if (v < 0.20) return '#F59E0B';
  return '#FF4D6D';
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function RiskMetrics() {
  const [period, setPeriod] = useState<Period>('1y');
  const holdings = usePortfolioStore((s) => s.holdings);
  const isEmpty  = holdings.length === 0;

  const { data, isLoading } = useRiskMetrics(holdings, period);

  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
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
            Risk Metrics
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Portfolio risk statistics computed from historical daily returns
          </p>
        </div>

        {/* Period selector */}
        {!isEmpty && (
          <div
            className="flex gap-1 rounded-lg p-1"
            style={{
              background: 'rgba(13,17,23,0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150"
                style={{
                  backgroundColor: period === p ? 'rgba(0,255,148,0.1)' : 'transparent',
                  color: period === p ? '#00FF94' : 'rgba(255,255,255,0.4)',
                  border: period === p ? '1px solid rgba(0,255,148,0.25)' : '1px solid transparent',
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
        <div
          className="rounded-xl p-10 flex flex-col items-center gap-3"
          style={CARD_STYLE}
        >
          <ShieldAlert size={32} color="rgba(255,255,255,0.3)" />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
                  rawValue={data.sharpe}
                  sub="Return per unit of risk"
                  color={sharpeColor(data.sharpe)}
                  iconColor={sharpeColor(data.sharpe)}
                  index={0}
                  formatter={(n) => fmt(n)}
                />
                <MetricCard
                  icon={BarChart2}
                  label="Ann. Volatility"
                  rawValue={data.volatility}
                  sub="Annualised standard deviation"
                  color={volColor(data.volatility)}
                  iconColor={volColor(data.volatility)}
                  index={1}
                  formatter={(n) => pct(n)}
                />
                <MetricCard
                  icon={TrendingDown}
                  label="Max Drawdown"
                  rawValue={data.maxDrawdown}
                  sub="Worst peak-to-trough loss"
                  color={drawdownColor()}
                  iconColor="#FF4D6D"
                  index={2}
                  formatter={(n) => pct(n)}
                />
                <MetricCard
                  icon={Zap}
                  label="Beta (vs S&P 500)"
                  rawValue={data.beta}
                  sub="Market sensitivity"
                  color={betaColor(data.beta)}
                  iconColor={betaColor(data.beta)}
                  index={3}
                  formatter={(n) => fmt(n)}
                />
                <MetricCard
                  icon={ShieldAlert}
                  label="Hist. VaR 95%"
                  rawValue={data.var95}
                  sub="1-day loss (historical)"
                  color={varColor()}
                  iconColor="#FF4D6D"
                  index={4}
                  formatter={(n) => pct(n)}
                />
                <MetricCard
                  icon={ShieldAlert}
                  label="MC VaR 95%"
                  rawValue={data.mcVar95}
                  sub="1-day loss (Monte Carlo)"
                  color={varColor()}
                  iconColor="#FF4D6D"
                  index={5}
                  formatter={(n) => pct(n)}
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
                    style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#00D4FF' }} />
                </div>
              ) : data ? (
                <MonteCarloChart data={data.monteCarlo} nDays={data.mcDays} />
              ) : null}
            </SectionCard>

            <SectionCard title="Correlation Matrix" icon={BarChart2} iconColor="#A78BFA">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-6 h-6 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#A78BFA' }} />
                </div>
              ) : data ? (
                data.correlations.tickers.length < 2 ? (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Metrics computed from {period} of daily log-returns, weighted by cost basis.
            VaR figures represent estimated 1-day losses at 95 % confidence.
            Monte Carlo uses 500 simulated paths over the next 63 trading days (≈3 months).
          </p>
        </>
      )}
    </div>
  );
}
