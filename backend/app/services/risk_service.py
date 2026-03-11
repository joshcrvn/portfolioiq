"""
Risk Metrics Engine — Phase 4.

Computes portfolio-level risk statistics from historical daily log-returns:
  - Annualised Sharpe Ratio
  - Annualised Volatility
  - Maximum Drawdown
  - Beta vs S&P 500
  - Historical VaR (95 %, 99 %)
  - Monte Carlo VaR (95 %, 1-day horizon)
  - Per-ticker Pearson correlation matrix
  - Monte Carlo simulation path percentiles for fan chart (63 trading days)

Mock mode (MOCK_DATA=true) uses Geometric Brownian Motion seeded per-ticker
so results are deterministic across restarts.
"""
import logging
import os

import numpy as np
import pandas as pd
import yfinance as yf

from .market_data import (
    MOCK_PRICES,
    USE_MOCK,
    _business_days,
    _mock_benchmark_series,
    _mock_price_series,
)

logger = logging.getLogger(__name__)

RISK_FREE_RATE = float(os.getenv('RISK_FREE_RATE', '0.0525'))
TRADING_DAYS = 252


# ── Return computation ─────────────────────────────────────────────────────────

def _mock_returns(
    tickers: list[str],
    weights: list[float],
    period: str,
) -> tuple[dict[str, np.ndarray], np.ndarray, np.ndarray]:
    n_days = _business_days(period)

    ticker_prices: dict[str, np.ndarray] = {}
    for i, ticker in enumerate(tickers):
        base = MOCK_PRICES.get(ticker.upper(), {}).get('price', 100.0)
        ticker_prices[ticker] = np.array(
            _mock_price_series(base, n_days, seed=i * 7 + 1), dtype=float
        )

    bench_prices = np.array(_mock_benchmark_series(n_days), dtype=float)

    return _compute_returns(tickers, weights, ticker_prices, bench_prices)


def _live_returns(
    tickers: list[str],
    weights: list[float],
    period: str,
) -> tuple[dict[str, np.ndarray], np.ndarray, np.ndarray]:
    n_days = _business_days(period)
    try:
        all_tickers = tickers + ['^GSPC']
        data = yf.download(all_tickers, period=period, auto_adjust=True, progress=False)
        if data.empty:
            raise ValueError('No data returned from yfinance')

        close = data['Close'] if 'Close' in data.columns else data
        if isinstance(close.columns, pd.MultiIndex):
            close.columns = close.columns.get_level_values(0)
        close = close.ffill().dropna()

        ticker_prices: dict[str, np.ndarray] = {}
        for i, ticker in enumerate(tickers):
            if ticker in close.columns:
                ticker_prices[ticker] = close[ticker].values
            else:
                base = MOCK_PRICES.get(ticker.upper(), {}).get('price', 100.0)
                ticker_prices[ticker] = np.array(
                    _mock_price_series(base, n_days, seed=i * 7 + 1), dtype=float
                )

        if '^GSPC' in close.columns:
            bench_prices = close['^GSPC'].values
        else:
            bench_prices = np.array(_mock_benchmark_series(n_days), dtype=float)

        return _compute_returns(tickers, weights, ticker_prices, bench_prices)
    except Exception as e:
        logger.warning(f'yfinance failed for risk metrics: {e} — using mock')
        return _mock_returns(tickers, weights, period)


def _compute_returns(
    tickers: list[str],
    weights: list[float],
    ticker_prices: dict[str, np.ndarray],
    bench_prices: np.ndarray,
) -> tuple[dict[str, np.ndarray], np.ndarray, np.ndarray]:
    """Convert price arrays to daily log-return arrays and compute weighted portfolio returns."""
    ticker_returns: dict[str, np.ndarray] = {}
    for ticker, prices in ticker_prices.items():
        p = prices[~np.isnan(prices)]
        ticker_returns[ticker] = np.diff(np.log(p))

    w = np.array(weights, dtype=float)
    w /= w.sum()
    min_len = min(len(ticker_returns[t]) for t in tickers)
    port_rets = sum(w[i] * ticker_returns[t][:min_len] for i, t in enumerate(tickers))

    b = bench_prices[~np.isnan(bench_prices)]
    bench_rets = np.diff(np.log(b))[:min_len]

    return ticker_returns, port_rets, bench_rets


def _get_returns(
    tickers: list[str],
    weights: list[float],
    period: str,
) -> tuple[dict[str, np.ndarray], np.ndarray, np.ndarray]:
    if USE_MOCK:
        return _mock_returns(tickers, weights, period)
    return _live_returns(tickers, weights, period)


# ── Individual metrics ─────────────────────────────────────────────────────────

def _sharpe(returns: np.ndarray) -> float:
    ann_ret = float(np.mean(returns) * TRADING_DAYS)
    ann_vol = float(np.std(returns, ddof=1) * np.sqrt(TRADING_DAYS))
    if ann_vol == 0:
        return 0.0
    return round((ann_ret - RISK_FREE_RATE) / ann_vol, 3)


def _volatility(returns: np.ndarray) -> float:
    return round(float(np.std(returns, ddof=1) * np.sqrt(TRADING_DAYS)), 4)


def _max_drawdown(returns: np.ndarray) -> float:
    cumulative = np.cumprod(1 + returns)
    running_max = np.maximum.accumulate(cumulative)
    drawdown = (cumulative - running_max) / running_max
    return round(float(np.min(drawdown)), 4)


def _beta(port_rets: np.ndarray, bench_rets: np.ndarray) -> float:
    n = min(len(port_rets), len(bench_rets))
    if n < 2:
        return 1.0
    p, b = port_rets[:n], bench_rets[:n]
    var_b = float(np.var(b, ddof=1))
    if var_b == 0:
        return 1.0
    return round(float(np.cov(p, b)[0, 1] / var_b), 3)


def _historical_var(returns: np.ndarray, confidence: float) -> float:
    """1-day historical VaR (negative = loss)."""
    return round(float(np.percentile(returns, (1 - confidence) * 100)), 4)


def _monte_carlo_var(returns: np.ndarray, confidence: float = 0.95, n_sims: int = 10_000) -> float:
    """1-day MC VaR sampled from fitted normal distribution."""
    mu = float(np.mean(returns))
    sigma = float(np.std(returns, ddof=1))
    rng = np.random.default_rng(42)
    sim = rng.normal(mu, sigma, n_sims)
    return round(float(np.percentile(sim, (1 - confidence) * 100)), 4)


def _correlation_matrix(tickers: list[str], ticker_returns: dict[str, np.ndarray]) -> dict:
    n = len(tickers)
    min_len = min(len(ticker_returns[t]) for t in tickers)
    mat = np.zeros((n, n))
    for i in range(n):
        for j in range(n):
            ri = ticker_returns[tickers[i]][:min_len]
            rj = ticker_returns[tickers[j]][:min_len]
            mat[i, j] = round(float(np.corrcoef(ri, rj)[0, 1]), 3)
    return {'tickers': tickers, 'matrix': mat.tolist()}


def _monte_carlo_paths(port_rets: np.ndarray, n_days: int = 63, n_sims: int = 500) -> dict:
    """
    Simulate n_sims portfolio paths over n_days trading days.
    Each path starts at 100. Returns percentile bands for a fan chart.
    """
    mu = float(np.mean(port_rets))
    sigma = float(np.std(port_rets, ddof=1))
    rng = np.random.default_rng(42)
    sim_rets = rng.normal(mu, sigma, (n_sims, n_days))
    cum = np.cumprod(1 + sim_rets, axis=1) * 100.0  # base = 100

    return {
        f'p{p}': [round(float(v), 2) for v in np.percentile(cum, p, axis=0)]
        for p in (5, 25, 50, 75, 95)
    }


# ── Public API ─────────────────────────────────────────────────────────────────

def compute_risk_metrics(tickers: list[str], weights: list[float], period: str = '1y') -> dict:
    """
    Compute all risk metrics for a portfolio.
    Returns a dict suitable for direct JSON serialisation.
    """
    ticker_returns, port_rets, bench_rets = _get_returns(tickers, weights, period)

    return {
        'sharpe':       _sharpe(port_rets),
        'volatility':   _volatility(port_rets),
        'maxDrawdown':  _max_drawdown(port_rets),
        'beta':         _beta(port_rets, bench_rets),
        'var95':        _historical_var(port_rets, 0.95),
        'var99':        _historical_var(port_rets, 0.99),
        'mcVar95':      _monte_carlo_var(port_rets, 0.95),
        'correlations': _correlation_matrix(tickers, ticker_returns),
        'monteCarlo':   _monte_carlo_paths(port_rets, n_days=63),
        'mcDays':       63,
    }
