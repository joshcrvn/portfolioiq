export interface Holding {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgBuyPrice: number;
  currency: 'GBP' | 'USD' | 'EUR';
  addedAt: string;
}

export interface LiveHolding extends Holding {
  currentPrice: number;
  currentValue: number;
  costBasis: number;
  pnl: number;
  pnlPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCostBasis: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  holdings: LiveHolding[];
}

export interface RiskMetrics {
  sharpeRatio: number;
  volatility: number;
  varHistorical: number;
  varMonteCarlo: number;
  maxDrawdown: number;
  beta: number;
  correlationMatrix: Record<string, Record<string, number>>;
}

export interface BenchmarkData {
  dates: string[];
  portfolioReturns: number[];
  benchmarkReturns: number[];
}

export interface SectorExposure {
  sector: string;
  weight: number;
  value: number;
}

export interface GeographicExposure {
  region: string;
  weight: number;
  value: number;
}

export interface NewsItem {
  id: string;
  ticker: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface PriceAlert {
  id: string;
  ticker: string;
  condition: 'above' | 'below';
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}
