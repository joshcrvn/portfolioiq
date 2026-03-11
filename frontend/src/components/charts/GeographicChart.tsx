import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import type { ExposureItem } from '../../hooks/useExposure';

const REGION_COLORS: Record<string, string> = {
  'North America':    '#00FF94',
  'Europe':           '#00D4FF',
  'Asia Pacific':     '#A78BFA',
  'Emerging Markets': '#F59E0B',
  'Other':            '#8B949E',
  'Global':           '#60A5FA',
};

function getColor(name: string, index: number): string {
  if (REGION_COLORS[name]) return REGION_COLORS[name];
  const palette = ['#34D399', '#FB7185', '#FBBF24', '#C084FC'];
  return palette[index % palette.length];
}

interface GeographicChartProps {
  data: ExposureItem[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-3 py-2 text-xs"
      style={{ backgroundColor: '#1A1F2E', border: '1px solid #30363D' }}>
      <p className="font-medium" style={{ color: '#E6EDF3' }}>{label}</p>
      <p className="font-mono mt-0.5" style={{ color: '#00D4FF' }}>
        {(payload[0].value * 100).toFixed(1)}%
      </p>
    </div>
  );
}

export function GeographicChart({ data }: GeographicChartProps) {
  const chartData = [...data].sort((a, b) => b.weight - a.weight);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 48, bottom: 4, left: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1E2430" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 1]}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          tick={{ fill: '#8B949E', fontSize: 11, fontFamily: 'JetBrains Mono' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fill: '#8B949E', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="weight" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {chartData.map((entry, i) => (
            <Cell key={entry.name} fill={getColor(entry.name, i)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
