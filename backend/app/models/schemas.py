from pydantic import BaseModel
from typing import Optional, Literal


class Holding(BaseModel):
    id: str
    ticker: str
    name: str
    shares: float
    avgBuyPrice: float
    currency: Literal['GBP', 'USD', 'EUR']
    addedAt: str


class LiveHolding(Holding):
    currentPrice: float
    currentValue: float
    costBasis: float
    pnl: float
    pnlPercent: float
    dayChange: float
    dayChangePercent: float


class PortfolioSummary(BaseModel):
    totalValue: float
    totalCostBasis: float
    totalPnL: float
    totalPnLPercent: float
    dayChange: float
    dayChangePercent: float
    holdings: list[LiveHolding]


class RiskMetricsRequest(BaseModel):
    holdings: list[Holding]
    period: Literal['1y', '3y', '5y'] = '1y'


class PriceAlert(BaseModel):
    id: str
    ticker: str
    condition: Literal['above', 'below']
    targetPrice: float
    isActive: bool
    createdAt: str
    triggeredAt: Optional[str] = None


class AlertCheckRequest(BaseModel):
    alerts: list[PriceAlert]
    currentPrices: dict[str, float]


class ErrorResponse(BaseModel):
    error: str
    detail: str = ''
