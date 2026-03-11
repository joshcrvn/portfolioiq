from fastapi import APIRouter, Query

from ..services.news_service import get_news

router = APIRouter(prefix='/api/news', tags=['news'])


@router.get('/feed')
async def get_news_feed(
    tickers: str = Query(..., description='Comma-separated ticker list'),
):
    ticker_list = [t.strip() for t in tickers.split(',') if t.strip()]
    return {'articles': get_news(ticker_list)}
