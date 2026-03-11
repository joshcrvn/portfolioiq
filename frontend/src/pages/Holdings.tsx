import { usePortfolio } from '../hooks/usePortfolio';
import { HoldingsTable } from '../components/portfolio/HoldingsTable';

export function Holdings() {
  const { liveHoldings, isLoading } = usePortfolio();

  return (
    <div className="space-y-6">
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
          Holdings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {liveHoldings.length} position{liveHoldings.length !== 1 ? 's' : ''}
        </p>
      </div>

      <HoldingsTable holdings={liveHoldings} isLoading={isLoading} />
    </div>
  );
}
