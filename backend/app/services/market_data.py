import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, date
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
    'VUSA.L': {'price': 98.72,  'currency': 'GBP', 'name': 'Vanguard S&P 500 UCITS ETF'},
    'CSPX.L': {'price': 562.10, 'currency': 'USD', 'name': 'iShares Core S&P 500 UCITS ETF'},
    'VWRP.L': {'price': 114.20, 'currency': 'GBP', 'name': 'Vanguard FTSE All-World UCITS ETF (Acc)'},
    'IWDG.L': {'price': 68.34,  'currency': 'GBP', 'name': 'iShares Edge MSCI World Value Factor UCITS ETF'},
    'EQQQ.L': {'price': 394.82, 'currency': 'USD', 'name': 'Invesco EQQQ NASDAQ-100 UCITS ETF'},
    'SPY':    {'price': 568.40, 'currency': 'USD', 'name': 'SPDR S&P 500 ETF Trust'},
    'QQQ':    {'price': 484.20, 'currency': 'USD', 'name': 'Invesco QQQ Trust'},
    'VTI':    {'price': 280.15, 'currency': 'USD', 'name': 'Vanguard Total Stock Market ETF'},
    'VXUS':   {'price': 62.48,  'currency': 'USD', 'name': 'Vanguard Total International Stock ETF'},
}

# Annualised drift and vol assumptions for mock history generation
MOCK_DRIFT = 0.10   # 10% annual return
MOCK_VOL   = 0.16   # 16% annual volatility


def _cache_get(key: str):
    if key in _cache:
        cached_at, value = _cache[key]
        if datetime.now() - cached_at < timedelta(minutes=CACHE_TTL_MINUTES):
            return value
        del _cache[key]
    return None


def _cache_set(key: str, value):
    _cache[key] = (datetime.now(), value)


def _business_days(period: str) -> int:
    """Convert period string to approximate number of trading days."""
    mapping = {'1mo': 21, '3mo': 63, '6mo': 126, '1y': 252, '3y': 756, '5y': 1260}
    return mapping.get(period, 252)


def _mock_price_series(seed_price: float, n_days: int, drift: float = MOCK_DRIFT,
                        vol: float = MOCK_VOL, seed: int = 42) -> list[float]:
    """Generate a realistic GBM price series ending near seed_price."""
    rng = np.random.default_rng(seed)
    dt = 1 / 252
    daily_drift = (drift - 0.5 * vol ** 2) * dt
    daily_vol = vol * np.sqrt(dt)
    returns = rng.normal(daily_drift, daily_vol, n_days)
    # Work backwards so the series ends at seed_price
    log_prices = np.concatenate([[0], np.cumsum(returns)])
    prices = seed_price * np.exp(log_prices - log_prices[-1])
    return [round(float(p), 4) for p in prices]


def _mock_benchmark_series(n_days: int, seed: int = 99) -> list[float]:
    """Generate S&P 500 benchmark series (starts at 100, normalised)."""
    rng = np.random.default_rng(seed)
    dt = 1 / 252
    daily_drift = (0.10 - 0.5 * 0.18 ** 2) * dt
    daily_vol = 0.18 * np.sqrt(dt)
    returns = rng.normal(daily_drift, daily_vol, n_days)
    log_prices = np.concatenate([[0], np.cumsum(returns)])
    prices = 100 * np.exp(log_prices - log_prices[0])
    return [round(float(p), 4) for p in prices]


def _trading_date_range(n_days: int) -> list[str]:
    """Return list of ISO date strings for the last n_days trading days."""
    dates = []
    d = date.today()
    while len(dates) < n_days + 1:
        if d.weekday() < 5:  # Mon-Fri
            dates.append(d.isoformat())
        d -= timedelta(days=1)
    return list(reversed(dates))


# ── Quotes ────────────────────────────────────────────────────────────────────

def _mock_quote(ticker: str) -> dict:
    base = MOCK_PRICES.get(ticker.upper(), {
        'price': round(random.uniform(50, 500), 2),
        'currency': 'USD',
        'name': ticker,
    })
    price = base['price']
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


# ── History ───────────────────────────────────────────────────────────────────

def get_history(tickers: list[str], period: str = '1y') -> dict:
    """Fetch historical close prices. Falls back to mock on failure."""
    cache_key = f"history:{period}:{'|'.join(sorted(tickers))}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    if USE_MOCK:
        result = _mock_history(tickers, period)
        _cache_set(cache_key, result)
        return result

    try:
        data = yf.download(tickers, period=period, auto_adjust=True, progress=False)
        if data.empty:
            raise ValueError("No data returned")

        close = data['Close'] if 'Close' in data.columns else data
        if isinstance(close, pd.Series):
            close = close.to_frame(name=tickers[0])

        # Multi-level columns when multiple tickers
        if isinstance(close.columns, pd.MultiIndex):
            close.columns = close.columns.get_level_values(0)

        result = {
            'dates': [d.strftime('%Y-%m-%d') for d in close.index],
            'prices': {
                ticker: [None if pd.isna(v) else round(float(v), 4) for v in close[ticker].tolist()]
                for ticker in tickers
                if ticker in close.columns
            }
        }
        _cache_set(cache_key, result)
        return result
    except Exception as e:
        logger.warning(f"yfinance history failed: {e} — using mock fallback")
        result = _mock_history(tickers, period)
        _cache_set(cache_key, result)
        return result


def _mock_history(tickers: list[str], period: str) -> dict:
    n_days = _business_days(period)
    dates = _trading_date_range(n_days)
    prices = {}
    for i, ticker in enumerate(tickers):
        base_price = MOCK_PRICES.get(ticker.upper(), {}).get('price', 100.0)
        prices[ticker] = _mock_price_series(base_price, n_days, seed=i * 7 + 1)
    return {'dates': dates, 'prices': prices}


# ── Benchmark ─────────────────────────────────────────────────────────────────

def get_benchmark(tickers: list[str], weights: list[float], period: str = '1y') -> dict:
    """
    Return normalised (base=100) cumulative return series for:
      - portfolioReturns: weighted combination of tickers
      - benchmarkReturns: S&P 500 (^GSPC)
    """
    cache_key = f"benchmark:{period}:{'|'.join(sorted(tickers))}"
    cached = _cache_get(cache_key)
    if cached is not None:
        return cached

    if USE_MOCK:
        result = _mock_benchmark(tickers, weights, period)
        _cache_set(cache_key, result)
        return result

    try:
        all_tickers = tickers + ['^GSPC']
        data = yf.download(all_tickers, period=period, auto_adjust=True, progress=False)
        if data.empty:
            raise ValueError("No data returned")

        close = data['Close'] if 'Close' in data.columns else data
        if isinstance(close.columns, pd.MultiIndex):
            close.columns = close.columns.get_level_values(0)

        close = close.ffill().dropna()
        if close.empty:
            raise ValueError("No valid data after cleaning")

        # Normalised returns (start = 100)
        w = np.array(weights)
        w = w / w.sum()

        port_returns = []
        bench_returns = []
        dates = []

        for t_idx, row_date in enumerate(close.index):
            dates.append(row_date.strftime('%Y-%m-%d'))
            if t_idx == 0:
                port_returns.append(100.0)
                bench_returns.append(100.0)
            else:
                prev = close.iloc[t_idx - 1]
                curr = close.iloc[t_idx]
                ticker_rets = np.array([
                    (curr[tk] / prev[tk] - 1) if tk in close.columns and prev[tk] > 0 else 0.0
                    for tk in tickers
                ])
                port_ret = float(np.dot(w, ticker_rets))
                bench_ret = float((curr['^GSPC'] / prev['^GSPC'] - 1) if '^GSPC' in close.columns else 0.0)
                port_returns.append(round(port_returns[-1] * (1 + port_ret), 4))
                bench_returns.append(round(bench_returns[-1] * (1 + bench_ret), 4))

        result = {
            'dates': dates,
            'portfolioReturns': port_returns,
            'benchmarkReturns': bench_returns,
        }
        _cache_set(cache_key, result)
        return result
    except Exception as e:
        logger.warning(f"yfinance benchmark failed: {e} — using mock fallback")
        result = _mock_benchmark(tickers, weights, period)
        _cache_set(cache_key, result)
        return result


def _mock_benchmark(tickers: list[str], weights: list[float], period: str) -> dict:
    n_days = _business_days(period)
    dates = _trading_date_range(n_days)

    w = np.array(weights, dtype=float)
    w = w / w.sum()

    # Generate per-ticker price series and compute weighted portfolio
    all_series = []
    for i, ticker in enumerate(tickers):
        base_price = MOCK_PRICES.get(ticker.upper(), {}).get('price', 100.0)
        prices = _mock_price_series(base_price, n_days, seed=i * 7 + 1)
        # Convert to cumulative return indexed at 100
        p0 = prices[0]
        normalised = [round(p / p0 * 100, 4) for p in prices]
        all_series.append(normalised)

    # Weighted portfolio returns (cumulative)
    portfolio = []
    for day_i in range(len(dates)):
        val = sum(w[j] * all_series[j][day_i] for j in range(len(tickers)))
        portfolio.append(round(float(val), 4))

    benchmark = _mock_benchmark_series(n_days)

    return {
        'dates': dates,
        'portfolioReturns': portfolio,
        'benchmarkReturns': benchmark,
    }
