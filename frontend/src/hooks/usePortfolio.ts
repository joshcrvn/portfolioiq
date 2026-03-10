import { useQuery } from '@tanstack/react-query';
import { usePortfolioStore } from '../store/portfolioStore';
import api from '../api/client';
import type { LiveHolding, PortfolioSummary } from '../types';

async function fetchQuotes(tickers: string[]): Promise<Record<string, any>> {
  if (tickers.length === 0) return {};
  const { data } = await api.get('/api/portfolio/quote', {
    params: { tickers: tickers.join(',') },
  });
  return data.quotes;
}

export function usePortfolio() {
  const holdings = usePortfolioStore((s) => s.holdings);
  const tickers = holdings.map((h) => h.ticker);

  const { data: quotes, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['quotes', tickers],
    queryFn: () => fetchQuotes(tickers),
    enabled: tickers.length > 0,
    refetchInterval: 60_000, // refresh every 60s
    staleTime: 30_000,
  });

  const liveHoldings: LiveHolding[] = holdings.map((holding) => {
    const quote = quotes?.[holding.ticker];
    const currentPrice = quote?.currentPrice || 0;
    const currentValue = currentPrice * holding.shares;
    const costBasis = holding.avgBuyPrice * holding.shares;
    const pnl = currentValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    const dayChange = (quote?.dayChange || 0) * holding.shares;
    const dayChangePercent = quote?.dayChangePercent || 0;

    return {
      ...holding,
      name: quote?.name || holding.name || holding.ticker,
      currentPrice,
      currentValue,
      costBasis,
      pnl,
      pnlPercent,
      dayChange,
      dayChangePercent,
    };
  });

  const summary: PortfolioSummary = {
    totalValue: liveHoldings.reduce((s, h) => s + h.currentValue, 0),
    totalCostBasis: liveHoldings.reduce((s, h) => s + h.costBasis, 0),
    totalPnL: liveHoldings.reduce((s, h) => s + h.pnl, 0),
    totalPnLPercent: 0,
    dayChange: liveHoldings.reduce((s, h) => s + h.dayChange, 0),
    dayChangePercent: 0,
    holdings: liveHoldings,
  };

  if (summary.totalCostBasis > 0) {
    summary.totalPnLPercent = (summary.totalPnL / summary.totalCostBasis) * 100;
  }
  if (summary.totalValue > 0) {
    summary.dayChangePercent =
      (summary.dayChange / (summary.totalValue - summary.dayChange)) * 100;
  }

  return { liveHoldings, summary, isLoading, isError, error, refetch };
}
