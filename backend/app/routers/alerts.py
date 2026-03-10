from fastapi import APIRouter
from app.models.schemas import AlertCheckRequest

router = APIRouter(prefix='/api/alerts', tags=['alerts'])


@router.post('/check')
async def check_alerts(body: AlertCheckRequest):
    """Check which alerts have been triggered."""
    triggered = []
    for alert in body.alerts:
        if not alert.isActive:
            continue
        price = body.currentPrices.get(alert.ticker)
        if price is None:
            continue
        if alert.condition == 'above' and price >= alert.targetPrice:
            triggered.append(alert)
        elif alert.condition == 'below' and price <= alert.targetPrice:
            triggered.append(alert)
    return {'triggered': triggered}
