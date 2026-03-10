from fastapi import APIRouter, Query, HTTPException
from app.services.market_data import get_quotes
from app.models.schemas import ErrorResponse

router = APIRouter(prefix='/api/portfolio', tags=['portfolio'])


@router.get('/quote')
async def get_quote(tickers: str = Query(..., description='Comma-separated ticker symbols')):
    """Get live quotes for one or more tickers."""
    ticker_list = [t.strip().upper() for t in tickers.split(',') if t.strip()]
    if not ticker_list:
        raise HTTPException(status_code=400, detail='No tickers provided')

    quotes = get_quotes(ticker_list)
    return {'quotes': quotes}
