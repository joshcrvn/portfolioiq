from fastapi import APIRouter, HTTPException, Query

from ..services.risk_service import compute_risk_metrics

router = APIRouter(prefix='/api/metrics', tags=['metrics'])


@router.get('/risk')
async def get_risk_metrics(
    tickers: str = Query(..., description='Comma-separated ticker list'),
    weights: str = Query(..., description='Comma-separated portfolio weights (same order as tickers)'),
    period:  str = Query('1y', description='Lookback period: 1mo 3mo 6mo 1y 3y'),
):
    ticker_list  = [t.strip() for t in tickers.split(',') if t.strip()]
    weight_list  = [float(w) for w in weights.split(',') if w.strip()]

    if not ticker_list:
        raise HTTPException(status_code=400, detail='No tickers provided')
    if len(ticker_list) != len(weight_list):
        raise HTTPException(status_code=400, detail='Ticker and weight counts must match')

    return compute_risk_metrics(ticker_list, weight_list, period)
