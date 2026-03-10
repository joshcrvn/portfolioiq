import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import portfolio, metrics, news, alerts

load_dotenv()

app = FastAPI(
    title='PortfolioIQ API',
    description='ETF portfolio tracker and analytics API',
    version='1.0.0',
)

allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173').split(',')

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(portfolio.router)
app.include_router(metrics.router)
app.include_router(news.router)
app.include_router(alerts.router)


@app.get('/')
async def root():
    return {'status': 'PortfolioIQ API running', 'version': '1.0.0'}


@app.get('/health')
async def health():
    return {'status': 'ok'}
