from fastapi import APIRouter

router = APIRouter(prefix='/api/news', tags=['news'])


@router.get('/health')
async def news_health():
    return {'status': 'ok'}
