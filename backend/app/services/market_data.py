import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Simple in-memory cache with 15-minute TTL
_cache: dict[str, tuple[datetime, any]] = {}
CACHE_TTL_MINUTES = 15


def _cache_get(key: str):
    if key in _cache:
        cached_at, value = _cache[key]
        if datetime.now() - cached_at < timedelta(minutes=CACHE_TTL_MINUTES):
            return value
        del _cache[key]
    return None


def _cache_set(key: str, value):
    _cache[key] = (datetime.now(), value)


def _normalise_ticker(ticker: str) -> str:
    """Append .L for LSE tickers if not already present and not a US ticker."""
    ticker = ticker.upper().strip()
    return ticker


def get_quotes(tickers: list[str]) -> dict:
    """
    Fetch live quote data for a list of tickers.
    Returns dict keyed by ticker with price, day change, etc.
    """
    cache_key = f"quotes:{'|'.join(sorted(tickers))}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    result = {}
    for ticker in tickers:
        try:
            t = yf.Ticker(ticker)
            info = t.info
            fast_info = t.fast_info

            current_price = (
                fast_info.get('last_price') or
                info.get('regularMarketPrice') or
                info.get('currentPrice') or
                info.get('previousClose', 0)
            )
            prev_close = (
                fast_info.get('previous_close') or
                info.get('previousClose', current_price)
            )
            day_change = current_price - prev_close if current_price and prev_close else 0
            day_change_pct = (day_change / prev_close * 100) if prev_close else 0

            result[ticker] = {
                'ticker': ticker,
                'name': info.get('longName') or info.get('shortName') or ticker,
                'currentPrice': round(current_price, 4) if current_price else 0,
                'previousClose': round(prev_close, 4) if prev_close else 0,
                'dayChange': round(day_change, 4),
                'dayChangePercent': round(day_change_pct, 4),
                'currency': info.get('currency', 'USD'),
                'marketCap': info.get('marketCap'),
            }
        except Exception as e:
            logger.warning(f"Failed to fetch quote for {ticker}: {e}")
            result[ticker] = {
                'ticker': ticker,
                'name': ticker,
                'currentPrice': 0,
                'previousClose': 0,
                'dayChange': 0,
                'dayChangePercent': 0,
                'currency': 'USD',
                'marketCap': None,
                'error': str(e),
            }

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
                ticker: close[ticker].fillna(method='ffill').tolist()
                for ticker in close.columns
                if ticker in tickers
            }
        }
        _cache_set(cache_key, result)
        return result
    except Exception as e:
        logger.error(f"Failed to fetch history: {e}")
        return {}
