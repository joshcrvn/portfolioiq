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
    # Global / broad market
    {
        'ticker': 'GLOBAL',
        'title': 'Global equities rally as inflation data surprises to the downside',
        'description': 'Stock markets climbed broadly after the latest CPI print came in below consensus estimates, raising hopes of earlier-than-expected rate cuts from major central banks including the Fed and ECB.',
        'url': '#',
        'publishedAt': _ts(2),
        'source': 'Financial Times',
        'sentiment': 'positive',
    },
    {
        'ticker': 'GLOBAL',
        'title': 'IMF upgrades global growth forecast on resilient consumer spending',
        'description': 'The International Monetary Fund raised its 2026 global growth outlook to 3.4%, citing stronger-than-expected consumer demand in advanced economies and a recovery in emerging market trade.',
        'url': '#',
        'publishedAt': _ts(5),
        'source': 'Reuters',
        'sentiment': 'positive',
    },
    {
        'ticker': 'GLOBAL',
        'title': 'Bond yields edge higher amid uncertainty over central bank policy path',
        'description': 'Treasury and gilt yields ticked upward as investors weighed mixed economic signals and debated the timing of rate cuts. The 10-year Treasury yield rose to 4.42%, pressuring risk assets.',
        'url': '#',
        'publishedAt': _ts(8),
        'source': 'Bloomberg',
        'sentiment': 'negative',
    },
    {
        'ticker': 'GLOBAL',
        'title': 'Passive investing continues to dominate as ETF inflows hit quarterly record',
        'description': 'Global ETF assets under management crossed $14 trillion for the first time, with broad index funds capturing the lion\'s share of net new flows as investors favour low-cost diversification.',
        'url': '#',
        'publishedAt': _ts(14),
        'source': 'Morningstar',
        'sentiment': 'positive',
    },
    {
        'ticker': 'GLOBAL',
        'title': 'Currency volatility rises as dollar strengthens against major peers',
        'description': 'The US dollar index climbed to a three-month high, raising concerns about the translation impact on international equity returns for dollar-based investors and creating headwinds for emerging markets.',
        'url': '#',
        'publishedAt': _ts(20),
        'source': 'Wall Street Journal',
        'sentiment': 'negative',
    },
    {
        'ticker': 'GLOBAL',
        'title': 'Analysts maintain neutral outlook for developed market equities heading into Q2',
        'description': 'A Goldman Sachs strategy note maintained a neutral stance on global equities, citing stretched valuations in the US offset by attractive pricing in European and Asian markets.',
        'url': '#',
        'publishedAt': _ts(30),
        'source': 'Goldman Sachs Research',
        'sentiment': 'neutral',
    },
    # S&P 500 / US market
    {
        'ticker': 'SPY',
        'title': 'S&P 500 posts best week since November as tech earnings impress',
        'description': 'The S&P 500 gained 2.1% over the week, led by strong earnings from mega-cap technology companies that beat analyst estimates on both revenue and margins.',
        'url': '#',
        'publishedAt': _ts(3),
        'source': 'CNBC',
        'sentiment': 'positive',
    },
    {
        'ticker': 'SPY',
        'title': 'US jobs data beats expectations, complicating Fed rate cut timeline',
        'description': 'Nonfarm payrolls rose by 275,000 in February, well above the 200,000 consensus, leading markets to reprice expectations for the first Fed rate cut further into 2026.',
        'url': '#',
        'publishedAt': _ts(18),
        'source': 'Reuters',
        'sentiment': 'neutral',
    },
    {
        'ticker': 'IVV',
        'title': 'iShares Core S&P 500 ETF sees record single-day inflows',
        'description': 'IVV attracted over $4.2 billion in a single session, the largest daily inflow on record, as institutional investors rotated from active funds into passive index vehicles.',
        'url': '#',
        'publishedAt': _ts(22),
        'source': 'Bloomberg ETF',
        'sentiment': 'positive',
    },
    # FTSE All-World / global ETFs
    {
        'ticker': 'VWRL',
        'title': 'Vanguard FTSE All-World ETF sees strong inflows as investors seek diversification',
        'description': 'VWRL attracted over £800 million in net new money during February, reflecting growing investor preference for globally diversified passive exposure amid uncertainty in single-country markets.',
        'url': '#',
        'publishedAt': _ts(6),
        'source': 'Trustnet',
        'sentiment': 'positive',
    },
    {
        'ticker': 'VWRL',
        'title': 'Emerging market allocation drags on FTSE All-World performance this quarter',
        'description': 'The FTSE All-World index underperformed pure US benchmarks by 1.8% in Q1, with weakness in Chinese and Brazilian equities weighing on the 10% emerging markets allocation.',
        'url': '#',
        'publishedAt': _ts(28),
        'source': 'Hargreaves Lansdown',
        'sentiment': 'negative',
    },
    # NASDAQ-100
    {
        'ticker': 'QQQ',
        'title': 'NASDAQ-100 surges 3% as AI spending cycle shows no signs of slowing',
        'description': 'The tech-heavy index outperformed broader markets sharply after several large-cap companies raised their AI infrastructure capex guidance significantly above consensus estimates.',
        'url': '#',
        'publishedAt': _ts(4),
        'source': 'The Verge',
        'sentiment': 'positive',
    },
    {
        'ticker': 'EQQQ',
        'title': 'Invesco EQQQ tracks Nasdaq-100 through volatile session after Fed minutes',
        'description': 'European-listed EQQQ saw elevated volumes as the Fed released minutes showing members were divided over the appropriate pace of rate reductions, triggering intraday swings in tech stocks.',
        'url': '#',
        'publishedAt': _ts(12),
        'source': 'Interactive Investor',
        'sentiment': 'neutral',
    },
    # US total market
    {
        'ticker': 'VTI',
        'title': 'Small-cap rally boosts Vanguard Total Market ETF relative to S&P 500',
        'description': 'VTI outpaced SPY by 0.4% as small and mid-cap stocks enjoyed a rotation boost following softer-than-expected inflation data that favoured rate-sensitive sectors.',
        'url': '#',
        'publishedAt': _ts(10),
        'source': 'Seeking Alpha',
        'sentiment': 'positive',
    },
    # International
    {
        'ticker': 'VXUS',
        'title': 'International developed markets lag US peers on dollar strength concerns',
        'description': 'VXUS fell 0.6% as a stronger dollar eroded the local-currency gains of European and Asian holdings. Analysts warn the USD headwind could persist through H1 2026.',
        'url': '#',
        'publishedAt': _ts(16),
        'source': 'Morningstar',
        'sentiment': 'negative',
    },
    # Value ETFs
    {
        'ticker': 'IWDG',
        'title': 'Value factor revival continues as financials and energy outperform',
        'description': 'The MSCI World Value index outperformed growth by 1.2% in February as rising yields and stable commodity prices favoured financials, energy, and consumer staples over high-multiple growth names.',
        'url': '#',
        'publishedAt': _ts(24),
        'source': 'JPMorgan Asset Management',
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
