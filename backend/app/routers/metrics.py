from fastapi import APIRouter

router = APIRouter(prefix='/api/metrics', tags=['metrics'])


@router.get('/health')
async def metrics_health():
    return {'status': 'ok'}
