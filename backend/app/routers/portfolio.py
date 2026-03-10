from fastapi import APIRouter, Query, HTTPException
from app.services.market_data import get_quotes, get_history, get_benchmark

router = APIRouter(prefix='/api/portfolio', tags=['portfolio'])


@router.get('/quote')
async def get_quote(tickers: str = Query(..., description='Comma-separated ticker symbols')):
    """Get live quotes for one or more tickers."""
    ticker_list = [t.strip().upper() for t in tickers.split(',') if t.strip()]
    if not ticker_list:
        raise HTTPException(status_code=400, detail='No tickers provided')
    quotes = get_quotes(ticker_list)
    return {'quotes': quotes}


@router.get('/history')
async def get_price_history(
    tickers: str = Query(..., description='Comma-separated ticker symbols'),
    period: str = Query('1y', description='Period: 1mo, 3mo, 6mo, 1y, 3y, 5y'),
):
    """Get historical close prices for one or more tickers."""
    ticker_list = [t.strip().upper() for t in tickers.split(',') if t.strip()]
    if not ticker_list:
        raise HTTPException(status_code=400, detail='No tickers provided')
    valid_periods = {'1mo', '3mo', '6mo', '1y', '3y', '5y'}
    if period not in valid_periods:
        raise HTTPException(status_code=400, detail=f'Invalid period. Must be one of: {valid_periods}')
    data = get_history(ticker_list, period)
    return data


@router.get('/benchmark')
async def get_benchmark_data(
    tickers: str = Query(..., description='Comma-separated ticker symbols'),
    weights: str = Query(..., description='Comma-separated portfolio weights (same order as tickers)'),
    period: str = Query('1y', description='Period: 1mo, 3mo, 6mo, 1y, 3y, 5y'),
):
    """
    Get normalised cumulative return series for the portfolio vs S&P 500.
    Both series start at 100.
    """
    ticker_list = [t.strip().upper() for t in tickers.split(',') if t.strip()]
    if not ticker_list:
        raise HTTPException(status_code=400, detail='No tickers provided')

    try:
        weight_list = [float(w.strip()) for w in weights.split(',') if w.strip()]
    except ValueError:
        raise HTTPException(status_code=400, detail='Weights must be numeric')

    if len(weight_list) != len(ticker_list):
        raise HTTPException(status_code=400, detail='Number of weights must match number of tickers')

    valid_periods = {'1mo', '3mo', '6mo', '1y', '3y', '5y'}
    if period not in valid_periods:
        raise HTTPException(status_code=400, detail=f'Invalid period. Must be one of: {valid_periods}')

    data = get_benchmark(ticker_list, weight_list, period)
    return data
