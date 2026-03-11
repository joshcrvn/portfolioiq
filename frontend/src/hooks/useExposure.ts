import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { Holding } from '../types';

// API returns { name, weight } shape (not the generic SectorExposure/GeographicExposure types)
export interface ExposureItem {
  name: string;
  weight: number;
}

function buildParams(holdings: Holding[]) {
  const tickers = holdings.map((h) => h.ticker).join(',');
  const costBases = holdings.map((h) => h.shares * h.avgBuyPrice);
  const total = costBases.reduce((s, v) => s + v, 0);
  const weights = costBases
    .map((c) => (total > 0 ? c / total : 1 / holdings.length))
    .join(',');
  return { tickers, weights };
}

export interface DiversificationScore {
  score: number;
  grade: string;
  holdingScore: number;
  sectorScore: number;
}

export function useSectorExposure(holdings: Holding[]) {
  const params = buildParams(holdings);
  return useQuery({
    queryKey: ['sector-exposure', params.tickers],
    queryFn: async () => {
      const { data } = await api.get('/api/portfolio/sector-exposure', { params });
      return data as { sectors: ExposureItem[]; diversification: DiversificationScore };
    },
    enabled: holdings.length > 0,
    staleTime: 10 * 60_000,
  });
}

export function useGeoExposure(holdings: Holding[]) {
  const params = buildParams(holdings);
  return useQuery({
    queryKey: ['geo-exposure', params.tickers],
    queryFn: async () => {
      const { data } = await api.get('/api/portfolio/geo-exposure', { params });
      return data as { regions: ExposureItem[] };
    },
    enabled: holdings.length > 0,
    staleTime: 10 * 60_000,
  });
}
