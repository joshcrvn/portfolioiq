import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
import logging
import os
import random

logger = logging.getLogger(__name__)

# Simple in-memory cache with 15-minute TTL
_cache: dict[str, tuple[datetime, any]] = {}
CACHE_TTL_MINUTES = 15

# Use mock data if yfinance is rate-limited (set MOCK_DATA=true in .env for dev)
USE_MOCK = os.getenv('MOCK_DATA', 'false').lower() == 'true'

# Realistic mock prices for common ETFs
MOCK_PRICES: dict[str, dict] = {
    'VWRL.L': {'price': 112.50, 'currency': 'GBP', 'name': 'Vanguard FTSE All-World UCITS ETF'},
    'VUSA.L': {'price': 98.72, 'currency': 'GBP', 'name': 'Vanguard S&P 500 UCITS ETF'},
    'CSPX.L': {'price': 562.10, 'currency': 'USD', 'name': 'iShares Core S&P 500 UCITS ETF'},
    'VWRP.L': {'price': 114.20, 'currency': 'GBP', 'name': 'Vanguard FTSE All-World UCITS ETF (Acc)'},
    'IWDG.L': {'price': 68.34, 'currency': 'GBP', 'name': 'iShares Edge MSCI World Value Factor UCITS ETF'},
    'EQQQ.L': {'price': 394.82, 'currency': 'USD', 'name': 'Invesco EQQQ NASDAQ-100 UCITS ETF'},
    'SPY':    {'price': 568.40, 'currency': 'USD', 'name': 'SPDR S&P 500 ETF Trust'},
    'QQQ':    {'price': 484.20, 'currency': 'USD', 'name': 'Invesco QQQ Trust'},
    'VTI':    {'price': 280.15, 'currency': 'USD', 'name': 'Vanguard Total Stock Market ETF'},
    'VXUS':   {'price': 62.48, 'currency': 'USD', 'name': 'Vanguard Total International Stock ETF'},
}


def _cache_get(key: str):
    if key in _cache:
        cached_at, value = _cache[key]
        if datetime.now() - cached_at < timedelta(minutes=CACHE_TTL_MINUTES):
            return value
        del _cache[key]
    return None


def _cache_set(key: str, value):
    _cache[key] = (datetime.now(), value)


def _mock_quote(ticker: str) -> dict:
    """Return a mock quote with realistic-ish values."""
    base = MOCK_PRICES.get(ticker.upper(), {
        'price': round(random.uniform(50, 500), 2),
        'currency': 'USD',
        'name': ticker,
    })
    price = base['price']
    # Add small random daily fluctuation ±1.5%
    day_change_pct = random.uniform(-1.5, 1.5)
    day_change = round(price * day_change_pct / 100, 4)
    return {
        'ticker': ticker,
        'name': base['name'],
        'currentPrice': round(price, 4),
        'previousClose': round(price - day_change, 4),
        'dayChange': round(day_change, 4),
        'dayChangePercent': round(day_change_pct, 4),
        'currency': base['currency'],
        'marketCap': None,
        'mock': True,
    }


def _fetch_quote_yfinance(ticker: str) -> dict:
    """Fetch a single ticker quote using yfinance history endpoint."""
    t = yf.Ticker(ticker)
    hist = t.history(period='5d')
    if hist.empty:
        raise ValueError(f"No data returned for {ticker}")

    close = hist['Close'].dropna()
    if len(close) < 1:
        raise ValueError(f"No close prices for {ticker}")

    current_price = float(close.iloc[-1])
    prev_close = float(close.iloc[-2]) if len(close) >= 2 else current_price
    day_change = current_price - prev_close
    day_change_pct = (day_change / prev_close * 100) if prev_close else 0

    # Attempt to get metadata
    name = ticker
    currency = 'USD'
    try:
        fi = t.fast_info
        currency = getattr(fi, 'currency', 'USD') or 'USD'
    except Exception:
        pass

    return {
        'ticker': ticker,
        'name': name,
        'currentPrice': round(current_price, 4),
        'previousClose': round(prev_close, 4),
        'dayChange': round(day_change, 4),
        'dayChangePercent': round(day_change_pct, 4),
        'currency': currency,
        'marketCap': None,
    }


def get_quotes(tickers: list[str]) -> dict:
    """
    Fetch live quote data for a list of tickers.
    Falls back to mock data if yfinance is unavailable.
    """
    cache_key = f"quotes:{'|'.join(sorted(tickers))}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    result = {}

    for ticker in tickers:
        if USE_MOCK:
            result[ticker] = _mock_quote(ticker)
            continue

        try:
            result[ticker] = _fetch_quote_yfinance(ticker)
        except Exception as e:
            logger.warning(f"yfinance failed for {ticker}: {e} — using mock fallback")
            result[ticker] = _mock_quote(ticker)

    _cache_set(cache_key, result)
    return result


def get_history(tickers: list[str], period: str = '1y') -> dict:
    """Fetch historical close prices for tickers."""
    cache_key = f"history:{period}:{'|'.join(sorted(tickers))}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    try:
        data = yf.download(tickers, period=period, auto_adjust=True, progress=False)
        if data.empty:
            return {}

        close = data['Close'] if 'Close' in data.columns else data
        if isinstance(close, pd.Series):
            close = close.to_frame(name=tickers[0])

        result = {
            'dates': [d.strftime('%Y-%m-%d') for d in close.index],
            'prices': {
                ticker: [None if pd.isna(v) else round(float(v), 4) for v in close[ticker].tolist()]
                for ticker in close.columns
                if ticker in tickers
            }
        }
        _cache_set(cache_key, result)
        return result
    except Exception as e:
        logger.error(f"Failed to fetch history: {e}")
        return {}
