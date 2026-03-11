"""
Sector and geographic exposure service.

Because yfinance does not return full underlying holdings for broad ETFs,
this service uses a hardcoded composition lookup table for well-known ETFs,
then blends by portfolio weight to produce an aggregate exposure view.
Unknown tickers fall back to a generic "Diversified" bucket.
"""
import numpy as np
from typing import Literal

# ── ETF composition lookup tables ─────────────────────────────────────────────
# Weights sum to 1.0 per ETF. Sources: fund factsheets / morningstar (approximate).

SECTOR_COMPOSITIONS: dict[str, dict[str, float]] = {
    # Vanguard FTSE All-World
    'VWRL.L': {
        'Technology':            0.225,
        'Financials':            0.178,
        'Healthcare':            0.118,
        'Consumer Discretionary':0.114,
        'Industrials':           0.098,
        'Communication':         0.072,
        'Consumer Staples':      0.068,
        'Energy':                0.050,
        'Materials':             0.038,
        'Utilities':             0.022,
        'Real Estate':           0.017,
    },
    # Same fund, accumulating share class
    'VWRP.L': {
        'Technology':            0.225,
        'Financials':            0.178,
        'Healthcare':            0.118,
        'Consumer Discretionary':0.114,
        'Industrials':           0.098,
        'Communication':         0.072,
        'Consumer Staples':      0.068,
        'Energy':                0.050,
        'Materials':             0.038,
        'Utilities':             0.022,
        'Real Estate':           0.017,
    },
    # Vanguard S&P 500
    'VUSA.L': {
        'Technology':            0.295,
        'Financials':            0.132,
        'Healthcare':            0.122,
        'Consumer Discretionary':0.108,
        'Communication':         0.090,
        'Industrials':           0.082,
        'Consumer Staples':      0.058,
        'Energy':                0.038,
        'Materials':             0.028,
        'Utilities':             0.028,
        'Real Estate':           0.019,
    },
    # iShares Core S&P 500
    'CSPX.L': {
        'Technology':            0.295,
        'Financials':            0.132,
        'Healthcare':            0.122,
        'Consumer Discretionary':0.108,
        'Communication':         0.090,
        'Industrials':           0.082,
        'Consumer Staples':      0.058,
        'Energy':                0.038,
        'Materials':             0.028,
        'Utilities':             0.028,
        'Real Estate':           0.019,
    },
    # US equivalents
    'SPY': {
        'Technology':            0.295,
        'Financials':            0.132,
        'Healthcare':            0.122,
        'Consumer Discretionary':0.108,
        'Communication':         0.090,
        'Industrials':           0.082,
        'Consumer Staples':      0.058,
        'Energy':                0.038,
        'Materials':             0.028,
        'Utilities':             0.028,
        'Real Estate':           0.019,
    },
    'IVV': {
        'Technology':            0.295,
        'Financials':            0.132,
        'Healthcare':            0.122,
        'Consumer Discretionary':0.108,
        'Communication':         0.090,
        'Industrials':           0.082,
        'Consumer Staples':      0.058,
        'Energy':                0.038,
        'Materials':             0.028,
        'Utilities':             0.028,
        'Real Estate':           0.019,
    },
    # Invesco Nasdaq-100
    'EQQQ.L': {
        'Technology':            0.575,
        'Communication':         0.168,
        'Consumer Discretionary':0.132,
        'Healthcare':            0.062,
        'Industrials':           0.038,
        'Consumer Staples':      0.015,
        'Utilities':             0.010,
    },
    'QQQ': {
        'Technology':            0.575,
        'Communication':         0.168,
        'Consumer Discretionary':0.132,
        'Healthcare':            0.062,
        'Industrials':           0.038,
        'Consumer Staples':      0.015,
        'Utilities':             0.010,
    },
    # Vanguard Total Stock Market
    'VTI': {
        'Technology':            0.278,
        'Financials':            0.138,
        'Healthcare':            0.122,
        'Consumer Discretionary':0.100,
        'Industrials':           0.098,
        'Communication':         0.090,
        'Consumer Staples':      0.052,
        'Energy':                0.040,
        'Materials':             0.030,
        'Utilities':             0.028,
        'Real Estate':           0.024,
    },
    # Vanguard Total International
    'VXUS': {
        'Financials':            0.220,
        'Technology':            0.172,
        'Industrials':           0.140,
        'Consumer Discretionary':0.122,
        'Healthcare':            0.098,
        'Materials':             0.080,
        'Consumer Staples':      0.052,
        'Communication':         0.058,
        'Energy':                0.058,
    },
    # iShares MSCI World Value
    'IWDG.L': {
        'Financials':            0.280,
        'Healthcare':            0.145,
        'Industrials':           0.130,
        'Consumer Staples':      0.102,
        'Energy':                0.088,
        'Consumer Discretionary':0.082,
        'Materials':             0.075,
        'Technology':            0.060,
        'Utilities':             0.038,
    },
}

GEO_COMPOSITIONS: dict[str, dict[str, float]] = {
    'VWRL.L': {
        'North America': 0.635,
        'Europe':        0.155,
        'Emerging Markets': 0.118,
        'Asia Pacific':  0.072,
        'Other':         0.020,
    },
    'VWRP.L': {
        'North America': 0.635,
        'Europe':        0.155,
        'Emerging Markets': 0.118,
        'Asia Pacific':  0.072,
        'Other':         0.020,
    },
    'VUSA.L': {
        'North America': 1.000,
    },
    'CSPX.L': {
        'North America': 1.000,
    },
    'SPY': {
        'North America': 1.000,
    },
    'IVV': {
        'North America': 1.000,
    },
    'EQQQ.L': {
        'North America': 0.950,
        'Europe':        0.030,
        'Asia Pacific':  0.020,
    },
    'QQQ': {
        'North America': 0.950,
        'Europe':        0.030,
        'Asia Pacific':  0.020,
    },
    'VTI': {
        'North America': 1.000,
    },
    'VXUS': {
        'Europe':           0.352,
        'Asia Pacific':     0.298,
        'Emerging Markets': 0.252,
        'North America':    0.058,
        'Other':            0.040,
    },
    'IWDG.L': {
        'North America': 0.582,
        'Europe':        0.238,
        'Asia Pacific':  0.138,
        'Other':         0.042,
    },
}

# Fallback for unknown tickers
_FALLBACK_SECTOR = {'Diversified': 1.0}
_FALLBACK_GEO    = {'Global': 1.0}


def _lookup(compositions: dict[str, dict[str, float]], ticker: str, fallback: dict[str, float]) -> dict[str, float]:
    """
    Look up a ticker in the compositions table, trying multiple forms:
      1. Exact uppercase (e.g. 'VWRL.L')
      2. With '.L' appended (e.g. 'VWRL' -> 'VWRL.L')
      3. With '.L' stripped (e.g. 'VWRL.L' -> 'VWRL')
    This handles the case where the user stores 'VWRL' but the table key is 'VWRL.L'.
    """
    t = ticker.upper()
    if t in compositions:
        return compositions[t]
    with_suffix = t + '.L'
    if with_suffix in compositions:
        return compositions[with_suffix]
    without_suffix = t.removesuffix('.L')
    if without_suffix in compositions:
        return compositions[without_suffix]
    return fallback


def _blend(
    compositions: dict[str, dict[str, float]],
    tickers: list[str],
    weights: list[float],
    fallback: dict[str, float],
) -> list[dict]:
    """
    Blend per-ETF compositions by portfolio weight.
    Returns list of {sector/region, weight, value} sorted by weight desc.
    """
    w = np.array(weights, dtype=float)
    w = w / w.sum()

    blended: dict[str, float] = {}
    for i, ticker in enumerate(tickers):
        comp = _lookup(compositions, ticker, fallback)
        for category, frac in comp.items():
            blended[category] = blended.get(category, 0.0) + frac * w[i]

    # Normalise to 1.0 (floating point safety)
    total = sum(blended.values())
    if total > 0:
        blended = {k: v / total for k, v in blended.items()}

    return sorted(
        [{'name': k, 'weight': round(v, 4)} for k, v in blended.items()],
        key=lambda x: x['weight'],
        reverse=True,
    )


def get_sector_exposure(tickers: list[str], weights: list[float]) -> list[dict]:
    return _blend(SECTOR_COMPOSITIONS, tickers, weights, _FALLBACK_SECTOR)


def get_geo_exposure(tickers: list[str], weights: list[float]) -> list[dict]:
    return _blend(GEO_COMPOSITIONS, tickers, weights, _FALLBACK_GEO)


def diversification_score(
    tickers: list[str],
    holding_weights: list[float],
    sector_exposure: list[dict],
) -> dict:
    """
    Compute a simple 0-100 diversification score.
    Penalises concentration at both the holding and sector level using HHI.
    Returns the score plus component subscores.
    """
    hw = np.array(holding_weights, dtype=float)
    hw = hw / hw.sum()
    hhi_holdings = float(np.sum(hw ** 2))

    sw = np.array([s['weight'] for s in sector_exposure], dtype=float)
    hhi_sectors = float(np.sum(sw ** 2))

    # HHI = 1 for fully concentrated, 1/n for perfectly equal
    # Score = 100 * (1 - HHI), clamped to [0, 100]
    holding_score  = round(max(0, min(100, 100 * (1 - hhi_holdings))), 1)
    sector_score   = round(max(0, min(100, 100 * (1 - hhi_sectors))), 1)

    # Weighted average: 40% holding diversification, 60% sector diversification
    overall = round(0.4 * holding_score + 0.6 * sector_score, 1)

    grade = (
        'Excellent' if overall >= 75 else
        'Good'      if overall >= 55 else
        'Fair'      if overall >= 35 else
        'Concentrated'
    )

    return {
        'score':         overall,
        'grade':         grade,
        'holdingScore':  holding_score,
        'sectorScore':   sector_score,
    }
