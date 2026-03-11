import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import type { MonteCarloData } from '../../hooks/useRiskMetrics';

interface MonteCarloChartProps {
  data: MonteCarloData;
  nDays: number;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const byKey: Record<string, number> = {};
  for (const p of payload) byKey[p.dataKey] = p.value;
  return (
    <div className="rounded-lg px-3 py-2 text-xs"
      style={{ backgroundColor: '#1A1F2E', border: '1px solid #30363D' }}>
      <p className="font-medium mb-1" style={{ color: '#8B949E' }}>Day {label}</p>
      {[['p95', '95th'], ['p75', '75th'], ['p50', 'Median'], ['p25', '25th'], ['p5', '5th']].map(
        ([key, label]) => byKey[key] != null ? (
          <p key={key} className="font-mono" style={{ color: key === 'p50' ? '#00FF94' : '#8B949E' }}>
            {label}: {byKey[key].toFixed(1)}
          </p>
        ) : null
      )}
    </div>
  );
}

export function MonteCarloChart({ data, nDays }: MonteCarloChartProps) {
  const chartData = Array.from({ length: nDays }, (_, i) => ({
    day:  i + 1,
    p5:   data.p5[i],
    p25:  data.p25[i],
    p50:  data.p50[i],
    p75:  data.p75[i],
    p95:  data.p95[i],
  }));

  const allValues = [...data.p5, ...data.p95];
  const yMin = Math.floor(Math.min(...allValues) * 0.98);
  const yMax = Math.ceil(Math.max(...allValues) * 1.02);

  const lineProps = { dot: false as const, activeDot: false as const, isAnimationActive: false };

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2430" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Trading days', position: 'insideBottomRight', offset: -4, fill: '#8B949E', fontSize: 10 }}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toFixed(0)}
            width={40}
          />
          <ReferenceLine y={100} stroke="#30363D" strokeDasharray="4 4" />
          <Tooltip content={<CustomTooltip />} />

          {/* Outer band — 5th / 95th percentile */}
          <Line dataKey="p95" stroke="#00FF94" strokeOpacity={0.18} strokeWidth={1} strokeDasharray="3 3" {...lineProps} />
          <Line dataKey="p5"  stroke="#00FF94" strokeOpacity={0.18} strokeWidth={1} strokeDasharray="3 3" {...lineProps} />

          {/* Inner band — 25th / 75th percentile */}
          <Line dataKey="p75" stroke="#00FF94" strokeOpacity={0.4}  strokeWidth={1} strokeDasharray="2 2" {...lineProps} />
          <Line dataKey="p25" stroke="#00FF94" strokeOpacity={0.4}  strokeWidth={1} strokeDasharray="2 2" {...lineProps} />

          {/* Median */}
          <Line dataKey="p50" stroke="#00FF94" strokeOpacity={1.0}  strokeWidth={2} {...lineProps} />
        </ComposedChart>
      </ResponsiveContainer>

      <p className="text-xs text-center mt-2" style={{ color: '#8B949E' }}>
        500 simulated paths · solid = median · dashed = 25th/75th · faint = 5th/95th percentile
      </p>
    </div>
  );
}
