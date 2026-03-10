import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { BenchmarkData } from '../types';
import type { Holding } from '../types';

async function fetchBenchmark(
  holdings: Holding[],
  period: string
): Promise<BenchmarkData> {
  const tickers = holdings.map((h) => h.ticker).join(',');
  // Weight by cost basis (shares × avg price)
  const costBases = holdings.map((h) => h.shares * h.avgBuyPrice);
  const total = costBases.reduce((s, v) => s + v, 0);
  const weights = costBases.map((c) => (total > 0 ? c / total : 1 / holdings.length));
  const weightStr = weights.join(',');

  const { data } = await api.get('/api/portfolio/benchmark', {
    params: { tickers, weights: weightStr, period },
  });
  return data as BenchmarkData;
}

export function useBenchmark(holdings: Holding[], period: string) {
  return useQuery({
    queryKey: ['benchmark', holdings.map((h) => h.ticker).join('|'), period],
    queryFn: () => fetchBenchmark(holdings, period),
    enabled: holdings.length > 0,
    staleTime: 5 * 60_000,
  });
}
