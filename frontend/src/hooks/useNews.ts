import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { NewsItem } from '../types';

export function useNews(tickers: string[]) {
  const tickerParam = tickers.join(',');
  return useQuery({
    queryKey: ['news', tickerParam],
    queryFn: async () => {
      const { data } = await api.get('/api/news/feed', { params: { tickers: tickerParam } });
      return data.articles as NewsItem[];
    },
    enabled: tickers.length > 0,
    staleTime: 5 * 60_000,
    refetchInterval: 10 * 60_000,
  });
}
