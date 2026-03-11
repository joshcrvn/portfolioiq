import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { useBenchmark } from '../../hooks/useBenchmark';
import type { Holding } from '../../types';

interface PerformanceChartProps {
  holdings: Holding[];
}

const PERIODS = [
  { label: '1M', value: '1mo' },
  { label: '3M', value: '3mo' },
  { label: '6M', value: '6mo' },
  { label: '1Y', value: '1y' },
  { label: '3Y', value: '3y' },
] as const;

type Period = typeof PERIODS[number]['value'];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs"
      style={{ backgroundColor: '#1A1F2E', border: '1px solid #30363D' }}>
      <p className="font-mono mb-1" style={{ color: '#8B949E' }}>{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="font-mono font-medium"
          style={{ color: entry.color }}>
          {entry.name}: {Number(entry.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
}

export function PerformanceChart({ holdings }: PerformanceChartProps) {
  const [period, setPeriod] = useState<Period>('1y');
  const { data, isLoading, isError } = useBenchmark(holdings, period);

  const chartData = data?.dates.map((date, i) => ({
    date: formatDate(date, period),
    portfolio: data.portfolioReturns[i],
    benchmark: data.benchmarkReturns[i],
  })) ?? [];

  const portFinal = data?.portfolioReturns.at(-1) ?? 100;
  const benchFinal = data?.benchmarkReturns.at(-1) ?? 100;
  const portReturn = portFinal - 100;
  const benchReturn = benchFinal - 100;

  return (
    <div className="rounded-xl p-6"
      style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>
            Performance
          </h2>
          {data && !isLoading && (
            <div className="flex items-center gap-4 mt-1">
              <ReturnBadge label="Portfolio" value={portReturn} />
              <ReturnBadge label="S&P 500" value={benchReturn} />
            </div>
          )}
        </div>

        {/* Period selector */}
        <div className="flex gap-1 rounded-lg p-1"
          style={{ backgroundColor: '#0F1117', border: '1px solid #30363D' }}>
          {PERIODS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              className="px-3 py-1 rounded text-xs font-mono font-medium transition-all"
              style={{
                backgroundColor: period === value ? '#30363D' : 'transparent',
                color: period === value ? '#E6EDF3' : '#8B949E',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        {holdings.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm" style={{ color: '#8B949E' }}>
              Add holdings to see performance chart
            </p>
          </div>
        ) : isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-6 h-6 rounded-full border-2 animate-spin"
              style={{ borderColor: '#30363D', borderTopColor: '#00FF94' }} />
          </div>
        ) : isError ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm" style={{ color: '#FF4D4D' }}>
              Failed to load performance data
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,36,48,0.6)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v.toFixed(0)}`}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={100} stroke="#30363D" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="portfolio"
                name="Portfolio"
                stroke="#00FF94"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#00FF94', strokeWidth: 0 }}
                isAnimationActive
                animationDuration={1000}
                animationEasing="ease-out"
              />
              <Line
                type="monotone"
                dataKey="benchmark"
                name="S&P 500"
                stroke="#00D4FF"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                activeDot={{ r: 4, fill: '#00D4FF', strokeWidth: 0 }}
                isAnimationActive
                animationDuration={1000}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      {holdings.length > 0 && !isLoading && (
        <div className="flex items-center gap-5 mt-3">
          <LegendItem color="#00FF94" label="Your Portfolio" />
          <LegendItem color="#00D4FF" label="S&P 500" dashed />
        </div>
      )}
    </div>
  );
}

function ReturnBadge({ label, value }: { label: string; value: number }) {
  const sign = value >= 0 ? '+' : '';
  return (
    <span className="text-xs font-mono">
      <span style={{ color: '#8B949E' }}>{label} </span>
      <span style={{ color: value >= 0 ? '#00FF94' : '#FF4D4D' }}>
        {sign}{value.toFixed(2)}%
      </span>
    </span>
  );
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="20" height="2" viewBox="0 0 20 2">
        <line
          x1="0" y1="1" x2="20" y2="1"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={dashed ? '4 3' : undefined}
        />
      </svg>
      <span className="text-xs" style={{ color: '#8B949E' }}>{label}</span>
    </div>
  );
}

function formatDate(iso: string, period: Period): string {
  const d = new Date(iso);
  if (period === '1mo' || period === '3mo') {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
  return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}
