import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { ExposureItem } from '../../hooks/useExposure';

// Terminal-palette colours cycled for slices
const COLORS = [
  '#00FF94', '#00D4FF', '#A78BFA', '#F59E0B', '#F87171',
  '#34D399', '#60A5FA', '#FBBF24', '#C084FC', '#FB7185',
  '#6EE7B7', '#93C5FD',
];

interface SectorPieChartProps {
  data: ExposureItem[];
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="rounded-lg px-3 py-2 text-xs"
      style={{ backgroundColor: '#1A1F2E', border: '1px solid #30363D' }}>
      <p className="font-medium" style={{ color: '#E6EDF3' }}>{name}</p>
      <p className="font-mono mt-0.5" style={{ color: '#00FF94' }}>
        {(value * 100).toFixed(1)}%
      </p>
    </div>
  );
}

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5 + 20;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (value < 0.04) return null; // skip tiny slices
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 10, fill: '#0D1117', fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
      {(value * 100).toFixed(0)}%
    </text>
  );
}

export function SectorPieChart({ data }: SectorPieChartProps) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="weight"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={50}
            labelLine={false}
            label={<CustomLabel />}
            isAnimationActive
            animationDuration={900}
            animationEasing="ease-out"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5 min-w-0">
            <div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-xs truncate" style={{ color: '#8B949E' }}>{item.name}</span>
            <span className="text-xs font-mono ml-auto flex-shrink-0"
              style={{ color: '#E6EDF3' }}>
              {(item.weight * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
