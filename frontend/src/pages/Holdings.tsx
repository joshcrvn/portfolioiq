import { usePortfolio } from '../hooks/usePortfolio';
import { HoldingsTable } from '../components/portfolio/HoldingsTable';

export function Holdings() {
  const { liveHoldings, isLoading } = usePortfolio();

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-xl font-bold" style={{ color: '#E6EDF3' }}>Holdings</h1>
        <p className="text-sm mt-0.5" style={{ color: '#8B949E' }}>
          {liveHoldings.length} position{liveHoldings.length !== 1 ? 's' : ''}
        </p>
      </div>

      <HoldingsTable holdings={liveHoldings} isLoading={isLoading} />
    </div>
  );
}
