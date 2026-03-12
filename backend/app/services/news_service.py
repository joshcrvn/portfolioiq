"""
News service — Phase 5.

Fetches financial news articles relevant to portfolio holdings.
Uses NewsAPI if NEWSAPI_KEY is configured, otherwise falls back to a set of
realistic mock articles so the UI is fully functional without an API key.

Sentiment scoring uses a simple positive/negative keyword approach — no ML.
"""
import logging
import os
import uuid
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)

NEWSAPI_KEY = os.getenv('NEWSAPI_KEY', '')

# ── Sentiment keywords ─────────────────────────────────────────────────────────

_POSITIVE = {
    'surges', 'surge', 'gains', 'gain', 'rises', 'rose', 'climbs', 'jumps',
    'rallies', 'rally', 'outperforms', 'outperform', 'bullish', 'growth',
    'record', 'beats', 'beat', 'strong', 'optimism', 'upgrade', 'upgraded',
    'recovery', 'rebound', 'breakout', 'boosts', 'boost', 'positive', 'soars',
}
_NEGATIVE = {
    'drops', 'drop', 'falls', 'fell', 'declines', 'decline', 'bearish',
    'concerns', 'concern', 'losses', 'loss', 'recession', 'miss', 'missed',
    'plunge', 'plunges', 'tumbles', 'tumble', 'downgrade', 'downgraded',
    'selloff', 'sell-off', 'slumps', 'slump', 'warns', 'warning', 'risk',
    'fears', 'fear', 'volatility', 'correction', 'crash', 'weak', 'weakness',
}


def _score_sentiment(text: str) -> str:
    words = set(text.lower().split())
    pos = len(words & _POSITIVE)
    neg = len(words & _NEGATIVE)
    if pos > neg:
        return 'positive'
    if neg > pos:
        return 'negative'
    return 'neutral'


# ── Mock articles ──────────────────────────────────────────────────────────────

def _ts(hours_ago: int) -> str:
    t = datetime.now(timezone.utc) - timedelta(hours=hours_ago)
    return t.strftime('%Y-%m-%dT%H:%M:%SZ')


_MOCK_ARTICLES = [
    # ── Global / broad market ──────────────────────────────────────────────────
    {
        'ticker': 'GLOBAL',
        'title': 'Global equities rally as inflation data surprises to the downside',
        'description': 'Stock markets climbed broadly after the latest CPI print came in below consensus estimates, raising hopes of earlier-than-expected rate cuts from major central banks including the Fed and ECB.',
        'url': '#',
        'publishedAt': _ts(1),
        'source': 'Financial Times',
        'sentiment': 'positive',
    },
    {
        'ticker': 'GLOBAL',
        'title': 'Bond yields edge higher amid uncertainty over central bank policy path',
        'description': 'Treasury and gilt yields ticked upward as investors weighed mixed economic signals and debated the timing of rate cuts. The 10-year Treasury yield rose to 4.42%, pressuring risk assets and growth valuations.',
        'url': '#',
        'publishedAt': _ts(6),
        'source': 'Bloomberg',
        'sentiment': 'negative',
    },
    {
        'ticker': 'GLOBAL',
        'title': 'Passive investing continues to dominate as ETF inflows hit quarterly record',
        'description': 'Global ETF assets under management crossed $14 trillion for the first time, with broad index funds capturing the lion\'s share of net new flows as investors favour low-cost diversification over active management.',
        'url': '#',
        'publishedAt': _ts(11),
        'source': 'Morningstar',
        'sentiment': 'positive',
    },
    {
        'ticker': 'GLOBAL',
        'title': 'Currency volatility rises as dollar strengthens against major peers',
        'description': 'The US dollar index climbed to a three-month high, raising concerns about translation impact on international equity returns for sterling and euro-based investors holding unhedged global funds.',
        'url': '#',
        'publishedAt': _ts(18),
        'source': 'Wall Street Journal',
        'sentiment': 'negative',
    },
    {
        'ticker': 'GLOBAL',
        'title': 'IMF upgrades global growth forecast on resilient consumer spending',
        'description': 'The International Monetary Fund raised its 2026 global growth outlook to 3.4%, citing stronger-than-expected consumer demand in advanced economies and a recovery in emerging market trade volumes.',
        'url': '#',
        'publishedAt': _ts(27),
        'source': 'Reuters',
        'sentiment': 'positive',
    },
    {
        'ticker': 'GLOBAL',
        'title': 'Analysts maintain neutral stance on developed markets heading into Q2',
        'description': 'A Goldman Sachs strategy note maintained a neutral view on global equities, citing stretched US valuations offset by attractive pricing in European and Asian markets. Sector rotation into defensives recommended.',
        'url': '#',
        'publishedAt': _ts(38),
        'source': 'Goldman Sachs Research',
        'sentiment': 'neutral',
    },
    # ── iShares Core S&P 500 (CSPX) ───────────────────────────────────────────
    {
        'ticker': 'CSPX',
        'title': 'S&P 500 posts best week since November as mega-cap earnings beat forecasts',
        'description': 'The S&P 500 gained 2.3% over the week, driven by strong earnings beats from the largest technology and consumer companies. iShares Core S&P 500 UCITS ETF closely tracked the rally, delivering solid returns for UK investors.',
        'url': '#',
        'publishedAt': _ts(3),
        'source': 'CNBC',
        'sentiment': 'positive',
    },
    {
        'ticker': 'CSPX',
        'title': 'BlackRock\'s CSPX remains the top-held ETF on major UK platforms',
        'description': 'iShares Core S&P 500 UCITS ETF (CSPX) retained the number one spot on Hargreaves Lansdown and AJ Bell by assets held, reflecting continued demand from UK retail investors for low-cost US equity exposure.',
        'url': '#',
        'publishedAt': _ts(14),
        'source': 'Hargreaves Lansdown',
        'sentiment': 'positive',
    },
    {
        'ticker': 'CSPX',
        'title': 'US jobs data complicates Fed rate cut timeline, weighing on growth stocks',
        'description': 'Nonfarm payrolls rose by 275,000 in February, well above the 200,000 consensus. Markets repriced expectations for the first Fed rate cut to Q4, triggering a modest pullback in rate-sensitive growth names within the S&P 500.',
        'url': '#',
        'publishedAt': _ts(22),
        'source': 'Reuters',
        'sentiment': 'negative',
    },
    {
        'ticker': 'CSPX',
        'title': 'S&P 500 concentration risk grows as top-10 stocks reach 37% of index weight',
        'description': 'The ten largest constituents of the S&P 500 now account for 37% of total index weight, the highest level in decades. Analysts at JPMorgan flag this as a risk for passive S&P 500 investors, though near-term earnings momentum remains strong.',
        'url': '#',
        'publishedAt': _ts(44),
        'source': 'JPMorgan Asset Management',
        'sentiment': 'neutral',
    },
    # ── Vanguard FTSE All-World (VWRL / VWRP) ─────────────────────────────────
    {
        'ticker': 'VWRL',
        'title': 'Vanguard FTSE All-World ETF sees strong inflows as investors diversify away from US',
        'description': 'VWRL attracted over £900 million in net new money during February, reflecting growing investor preference for globally diversified passive exposure as concerns about US concentration risk mount.',
        'url': '#',
        'publishedAt': _ts(5),
        'source': 'Trustnet',
        'sentiment': 'positive',
    },
    {
        'ticker': 'VWRL',
        'title': 'FTSE All-World index hits all-time high on broad developed market gains',
        'description': 'The FTSE All-World Index reached a record level this week, boosted by simultaneous gains in US, European, and Japanese equities. Vanguard\'s VWRL and VWRP ETFs, which track the index, both surged to new highs.',
        'url': '#',
        'publishedAt': _ts(16),
        'source': 'AJ Bell',
        'sentiment': 'positive',
    },
    {
        'ticker': 'VWRL',
        'title': 'Emerging market allocation drags on FTSE All-World performance this quarter',
        'description': 'The FTSE All-World index underperformed pure US benchmarks by 1.8% in Q1, with weakness in Chinese and Brazilian equities weighing on the roughly 12% emerging markets allocation within VWRL and VWRP.',
        'url': '#',
        'publishedAt': _ts(31),
        'source': 'Hargreaves Lansdown',
        'sentiment': 'negative',
    },
    {
        'ticker': 'VWRL',
        'title': 'VWRL vs VWRP: the accumulating vs distributing debate for ISA investors',
        'description': 'Financial planners highlight the key differences between Vanguard\'s VWRL (distributing) and VWRP (accumulating) FTSE All-World ETFs. For ISA holders, VWRP\'s automatic reinvestment typically offers superior compounding over long horizons.',
        'url': '#',
        'publishedAt': _ts(43),
        'source': 'Interactive Investor',
        'sentiment': 'neutral',
    },
    # ── NASDAQ-100 ─────────────────────────────────────────────────────────────
    {
        'ticker': 'EQQQ',
        'title': 'Nasdaq-100 surges 3% as AI infrastructure spending cycle shows no signs of slowing',
        'description': 'The tech-heavy index outperformed broader markets sharply after several large-cap companies raised AI capex guidance above consensus. Invesco\'s EQQQ and QQQ ETFs led European and US technology fund performance.',
        'url': '#',
        'publishedAt': _ts(8),
        'source': 'Bloomberg',
        'sentiment': 'positive',
    },
    # ── Value / diversified ─────────────────────────────────────────────────────
    {
        'ticker': 'IWDG',
        'title': 'Value factor revival continues as financials and energy outperform growth',
        'description': 'The MSCI World Value index outperformed growth by 1.4% in February as rising yields and stable commodity prices favoured financials, energy, and consumer staples. iShares MSCI World Value ETF (IWDG) benefited strongly.',
        'url': '#',
        'publishedAt': _ts(20),
        'source': 'BlackRock Investment Institute',
        'sentiment': 'positive',
    },
    # ── Broad passive / UK investing ───────────────────────────────────────────
    {
        'ticker': 'VUSA',
        'title': 'Vanguard S&P 500 UCITS ETF passes £10bn in UK assets as demand for passive soars',
        'description': 'VUSA reached a milestone £10 billion in assets under management on the London Stock Exchange, cementing its position as one of the UK\'s most popular passive investment vehicles alongside CSPX and VWRL.',
        'url': '#',
        'publishedAt': _ts(35),
        'source': 'Morningstar',
        'sentiment': 'positive',
    },
]

# Deduplicate by assigning stable ids
for _i, _a in enumerate(_MOCK_ARTICLES):
    _a['id'] = f'mock-{_i + 1:03d}'


# ── Live fetch (NewsAPI) ───────────────────────────────────────────────────────

def _live_news(tickers: list[str]) -> list[dict]:
    try:
        from newsapi import NewsApiClient  # type: ignore
        client = NewsApiClient(api_key=NEWSAPI_KEY)

        articles = []
        seen: set[str] = set()
        queries = tickers[:5]  # cap API calls

        for ticker in queries:
            resp = client.get_everything(
                q=ticker,
                language='en',
                sort_by='publishedAt',
                page_size=5,
            )
            for raw in resp.get('articles', []):
                title = raw.get('title') or ''
                if title in seen or '[Removed]' in title:
                    continue
                seen.add(title)
                desc = raw.get('description') or ''
                sentiment = _score_sentiment(f'{title} {desc}')
                articles.append({
                    'id':          str(uuid.uuid4()),
                    'ticker':      ticker,
                    'title':       title,
                    'description': desc,
                    'url':         raw.get('url', '#'),
                    'publishedAt': raw.get('publishedAt', datetime.now(timezone.utc).isoformat()),
                    'source':      (raw.get('source') or {}).get('name', 'Unknown'),
                    'sentiment':   sentiment,
                })

        articles.sort(key=lambda a: a['publishedAt'], reverse=True)
        return articles

    except Exception as e:
        logger.warning(f'NewsAPI failed: {e} — using mock news')
        return _mock_news(tickers)


# ── Mock fetch ─────────────────────────────────────────────────────────────────

def _mock_news(tickers: list[str]) -> list[dict]:
    upper = {t.upper().removesuffix('.L') for t in tickers}
    result = []
    for article in _MOCK_ARTICLES:
        art_ticker = article['ticker'].upper().removesuffix('.L')
        if art_ticker == 'GLOBAL' or art_ticker in upper:
            result.append(article)
    result.sort(key=lambda a: a['publishedAt'], reverse=True)
    return result


# ── Public API ─────────────────────────────────────────────────────────────────

def get_news(tickers: list[str]) -> list[dict]:
    if NEWSAPI_KEY and NEWSAPI_KEY != 'your_newsapi_key_here':
        return _live_news(tickers)
    return _mock_news(tickers)
