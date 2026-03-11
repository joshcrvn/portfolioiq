import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { Holding } from '../types';

export interface CorrelationData {
  tickers: string[];
  matrix: number[][];
}

export interface MonteCarloData {
  p5:  number[];
  p25: number[];
  p50: number[];
  p75: number[];
  p95: number[];
}

export interface RiskMetrics {
  sharpe:       number;
  volatility:   number;
  maxDrawdown:  number;
  beta:         number;
  var95:        number;
  var99:        number;
  mcVar95:      number;
  correlations: CorrelationData;
  monteCarlo:   MonteCarloData;
  mcDays:       number;
}

function buildParams(holdings: Holding[], period: string) {
  const tickers   = holdings.map((h) => h.ticker).join(',');
  const costBases = holdings.map((h) => h.shares * h.avgBuyPrice);
  const total     = costBases.reduce((s, v) => s + v, 0);
  const weights   = costBases
    .map((c) => (total > 0 ? c / total : 1 / holdings.length))
    .join(',');
  return { tickers, weights, period };
}

export function useRiskMetrics(holdings: Holding[], period = '1y') {
  const params = buildParams(holdings, period);
  return useQuery({
    queryKey: ['risk-metrics', params.tickers, period],
    queryFn: async () => {
      const { data } = await api.get('/api/metrics/risk', { params });
      return data as RiskMetrics;
    },
    enabled: holdings.length > 0,
    staleTime: 5 * 60_000,
  });
}
