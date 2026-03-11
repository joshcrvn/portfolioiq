import { Globe, Layers, TrendingUp } from 'lucide-react';
import { usePortfolioStore } from '../store/portfolioStore';
import { useSectorExposure, useGeoExposure } from '../hooks/useExposure';
import { SectorPieChart } from '../components/charts/SectorPieChart';
import { GeographicChart } from '../components/charts/GeographicChart';

function ChartCard({
  title,
  icon: Icon,
  isLoading,
  isEmpty,
  children,
}: {
  title: string;
  icon: React.ElementType;
  isLoading: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-6"
      style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
      <div className="flex items-center gap-2 mb-5">
        <Icon size={15} color="#00D4FF" />
        <h2 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>{title}</h2>
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm" style={{ color: '#8B949E' }}>
            Add holdings to see exposure breakdown
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 rounded-full border-2 animate-spin"
            style={{ borderColor: '#30363D', borderTopColor: '#00D4FF' }} />
        </div>
      ) : children}
    </div>
  );
}

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score >= 75 ? '#00FF94' : score >= 55 ? '#F59E0B' : score >= 35 ? '#00D4FF' : '#FF4D4D';

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="#1E2430" strokeWidth="8" />
          <circle
            cx="48" cy="48" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={`${progress} ${circumference}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-xl font-bold" style={{ color }}>{score}</span>
          <span className="text-xs" style={{ color: '#8B949E' }}>/100</span>
        </div>
      </div>
      <div>
        <p className="font-semibold text-sm" style={{ color }}>{grade}</p>
        <p className="text-xs mt-1" style={{ color: '#8B949E' }}>Diversification</p>
      </div>
    </div>
  );
}

export function Analytics() {
  const holdings = usePortfolioStore((s) => s.holdings);
  const isEmpty = holdings.length === 0;

  const { data: sectorData, isLoading: sectorLoading } = useSectorExposure(holdings);
  const { data: geoData, isLoading: geoLoading } = useGeoExposure(holdings);

  const div = sectorData?.diversification;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#E6EDF3' }}>Analytics</h1>
        <p className="text-sm mt-0.5" style={{ color: '#8B949E' }}>
          Sector and geographic exposure weighted by portfolio value
        </p>
      </div>

      {/* Diversification score */}
      <div className="rounded-xl p-6"
        style={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}>
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={15} color="#00FF94" />
          <h2 className="text-sm font-semibold" style={{ color: '#E6EDF3' }}>
            Portfolio Diversification Score
          </h2>
        </div>

        {isEmpty ? (
          <p className="text-sm" style={{ color: '#8B949E' }}>
            Add holdings to see your diversification score
          </p>
        ) : sectorLoading ? (
          <div className="w-6 h-6 rounded-full border-2 animate-spin"
            style={{ borderColor: '#30363D', borderTopColor: '#00FF94' }} />
        ) : div ? (
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <ScoreRing score={div.score} grade={div.grade} />
            <div className="grid grid-cols-2 gap-4">
              <SubScore label="Holdings" value={div.holdingScore}
                hint="How evenly spread across positions" />
              <SubScore label="Sectors" value={div.sectorScore}
                hint="How spread across industry sectors" />
            </div>
          </div>
        ) : null}
      </div>

      {/* Charts side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard
          title="Sector Exposure"
          icon={Layers}
          isLoading={sectorLoading}
          isEmpty={isEmpty}
        >
          {sectorData && <SectorPieChart data={sectorData.sectors} />}
        </ChartCard>

        <ChartCard
          title="Geographic Exposure"
          icon={Globe}
          isLoading={geoLoading}
          isEmpty={isEmpty}
        >
          {geoData && <GeographicChart data={geoData.regions} />}
        </ChartCard>
      </div>

      {/* Top holdings note */}
      {!isEmpty && (
        <p className="text-xs" style={{ color: '#8B949E' }}>
          Sector and geographic exposure derived from fund compositions based on the latest available ETF factsheet data.
          Blended by cost-basis weight across your {holdings.length} holding{holdings.length !== 1 ? 's' : ''}.
        </p>
      )}
    </div>
  );
}

function SubScore({ label, value, hint }: { label: string; value: number; hint: string }) {
  const color = value >= 75 ? '#00FF94' : value >= 55 ? '#F59E0B' : value >= 35 ? '#00D4FF' : '#FF4D4D';
  return (
    <div className="rounded-lg p-3"
      style={{ backgroundColor: '#0F1117', border: '1px solid #30363D' }}>
      <p className="text-xs font-medium" style={{ color: '#8B949E' }}>{label}</p>
      <p className="font-mono text-lg font-bold mt-0.5" style={{ color }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: '#8B949E' }}>{hint}</p>
    </div>
  );
}
