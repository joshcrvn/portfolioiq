# PortfolioIQ — Claude Code Context

## Project Summary
PortfolioIQ is a personal ETF portfolio tracker and analytics web app. Users add ETF holdings manually (ticker, shares, avg buy price, currency), see live P&L from yfinance data, and will eventually get risk analytics (Sharpe, VaR, Monte Carlo), sector/geographic exposure charts, news feed, and price alerts. Built to CV-quality standard with a Bloomberg-inspired dark terminal aesthetic.

## Current Status
- Phase 6 of 6 complete — ALL PHASES DONE
- Last commit: `feat(phase6): polish, code splitting, deployment config, README`
- Frontend builds cleanly with manual chunk splitting (Recharts isolated at 391 KB gzip 114 KB)

## Tech Stack

### Frontend (as implemented)
- React 18 + TypeScript (Vite, verbatimModuleSyntax — use `import type` for types)
- Tailwind CSS v4 via `@tailwindcss/vite` plugin (NOT postcss config)
- Recharts, Zustand (with persist middleware), TanStack Query v5, Axios, Lucide React, React Router v7, uuid
- Google Fonts: DM Sans (headings), JetBrains Mono (numbers/code)

### Backend (as implemented)
- Python 3.13, FastAPI 0.115, Uvicorn
- yfinance 0.2.51 — NOTE: rate-limited by Yahoo Finance in dev (429 errors)
- pandas, numpy, scipy, newsapi-python, python-dotenv
- Virtual env at `backend/venv/`

## Project Structure
```
portfolioiq/
├── frontend/
│   ├── src/
│   │   ├── api/client.ts                   # Axios instance, BASE_URL from VITE_API_BASE_URL
│   │   ├── store/portfolioStore.ts         # Zustand store, persisted to localStorage
│   │   ├── types/index.ts                  # All TypeScript types
│   │   ├── hooks/
│   │   │   ├── usePortfolio.ts             # TanStack Query: live quotes → LiveHolding[]
│   │   │   ├── useBenchmark.ts             # TanStack Query: portfolio vs S&P 500
│   │   │   ├── useExposure.ts              # TanStack Query: sector + geo exposure
│   │   │   ├── useRiskMetrics.ts           # TanStack Query: risk metrics from /api/metrics/risk
│   │   │   └── useNews.ts                  # TanStack Query: news feed, 10-min refetch
│   │   ├── utils/
│   │   │   ├── formatters.ts               # formatCurrency, formatPercent, pnlColor
│   │   │   └── csvParser.ts                # Trading 212 CSV → Holding[] parser
│   │   ├── components/
│   │   │   ├── layout/Sidebar.tsx
│   │   │   ├── layout/Navbar.tsx           # Add Holding + Import CSV buttons
│   │   │   ├── portfolio/
│   │   │   │   ├── AddHoldingModal.tsx
│   │   │   │   ├── CSVUploadModal.tsx      # Drag/drop CSV import, 3-step flow
│   │   │   │   └── HoldingsTable.tsx
│   │   │   └── charts/
│   │   │       ├── PerformanceChart.tsx    # Recharts LineChart, period selector, S&P 500 benchmark
│   │   │       ├── SectorPieChart.tsx      # Recharts PieChart (donut), sector weights
│   │   │       ├── GeographicChart.tsx     # Recharts BarChart (horizontal), regional weights
│   │   │       ├── CorrelationHeatmap.tsx  # SVG heatmap, red–neutral–green colour scale
│   │   │       └── MonteCarloChart.tsx     # Recharts ComposedChart, 5-percentile fan chart
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx               # Summary cards + PerformanceChart + HoldingsTable
│   │   │   ├── Holdings.tsx
│   │   │   ├── Analytics.tsx               # Sector/geo charts + diversification score
│   │   │   ├── RiskMetrics.tsx             # Sharpe, VaR, Beta, MC chart, Correlation heatmap
│   │   │   ├── News.tsx                    # Article cards, ticker filter tabs, sentiment badges
│   │   │   ├── Alerts.tsx                  # Add alert form, alert list, triggered detection
│   │   │   └── NotFound.tsx                # 404 catch-all page
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── portfolio.py          # GET /quote, /history, /benchmark, /sector-exposure, /geo-exposure
│   │   │   ├── metrics.py            # GET /api/metrics/risk
│   │   │   ├── news.py               # GET /api/news/feed
│   │   │   └── alerts.py             # POST /api/alerts/check
│   │   ├── services/
│   │   │   ├── market_data.py        # get_quotes(), get_history(), get_benchmark(), mock fallback
│   │   │   ├── exposure_service.py   # get_sector_exposure(), get_geo_exposure(), diversification_score()
│   │   │   ├── risk_service.py       # compute_risk_metrics(): Sharpe, VaR, drawdown, beta, MC paths
│   │   │   └── news_service.py       # get_news(): NewsAPI + mock fallback, keyword sentiment scoring
│   │   └── models/schemas.py
│   ├── requirements.txt
│   ├── .env.example
│   └── venv/
│
├── .gitignore
└── CLAUDE.md
```

## Environment Variables

### Frontend (`frontend/.env` — gitignored)
- `VITE_API_BASE_URL=http://localhost:8000`

### Backend (`backend/.env` — gitignored)
- `NEWSAPI_KEY=your_newsapi_key_here`
- `RISK_FREE_RATE=0.0525`
- `ALLOWED_ORIGINS=http://localhost:5173,https://your-vercel-url.vercel.app`
- `MOCK_DATA=true` — set to `true` in dev to bypass yfinance rate limits

## Key Architectural Decisions
- **LSE tickers**: Users must include `.L` suffix themselves (e.g. `VWRL.L`). Documented in the AddHoldingModal hint text.
- **yfinance rate limiting**: Yahoo Finance aggressively rate-limits dev IPs (429 errors). Implemented mock fallback — set `MOCK_DATA=true` in `backend/.env` for local development. In production (Railway/Render on fresh IPs), yfinance works normally. Set `MOCK_DATA=false` for production.
- **Mock data**: Defined in `market_data.py` `MOCK_PRICES` dict for ~10 common ETFs. Unknown tickers get random price in $50-500 range.
- **TypeScript**: `verbatimModuleSyntax` is enabled — always use `import type` for type-only imports.
- **Tailwind v4**: Uses `@tailwindcss/vite` plugin, not the legacy postcss approach. CSS imports `@import "tailwindcss"`.
- **Zustand**: Holdings and alerts persisted to localStorage under key `portfolioiq-store`. Duplicate tickers are rejected on add.
- **TanStack Query**: Quote data refreshes every 60s, stale after 30s. Cache key includes ticker list.
- **Color palette**: bg `#0F1117`, card `#161B22`, accent green `#00FF94`, cyan `#00D4FF`, red `#FF4D4D`, text `#E6EDF3`, muted `#8B949E`, border `#30363D`.

## Known Issues / TODOs
- yfinance `.info` endpoint is very rate-limited — `get_quotes` uses `.history()` instead (more reliable)
- Name enrichment from yfinance is not working in dev (mock mode returns proper names from MOCK_PRICES)
- All Vite default artifacts removed (App.css, vite.svg, react.svg)
- Recharts code-split into `vendor-recharts` chunk (391 KB / 114 KB gzip)

## Key Architectural Decisions (Phase 6 additions)
- **Code splitting**: Vite `manualChunks` splits vendors into `vendor-react`, `vendor-query`, `vendor-recharts`, `vendor-zustand`. Main app chunk: 290 KB / 91 KB gzip. Recharts isolated: 391 KB / 114 KB gzip.
- **Favicon**: Custom SVG bar-chart icon (`frontend/public/favicon.svg`) with `#0F1117` background and green/cyan bars matching the colour palette.
- **Deployment**: `frontend/vercel.json` rewrites all paths to `/index.html` for SPA routing. `backend/Procfile` and `backend/railway.toml` for Railway/Render/Heroku.
- **`.env.example`**: Updated to include `MOCK_DATA=true` as the default for new developers.
- **NotFound page**: 404 catch-all route added to the React Router config.

## Key Architectural Decisions (Phase 5 additions)
- **News**: `GET /api/news/feed?tickers=...`. Uses NewsAPI if `NEWSAPI_KEY` env var is set (and not the placeholder value). Otherwise returns curated mock articles covering broad market, S&P 500, NASDAQ, FTSE All-World, value ETFs etc. GLOBAL-tagged articles appear for all tickers.
- **Sentiment scoring**: Keyword-based positive/negative word sets applied to `title + description`. No ML dependency.
- **News mock articles**: 16 pre-authored articles with varied sentiment, realistic sources (FT, Reuters, Bloomberg, Morningstar), and ticker-keyed relevance. Timestamps computed relative to `datetime.now()` so they always appear recent.
- **News ticker filter**: Client-side filter tabs (All + each holding ticker). GLOBAL articles always appear in every filter.
- **Alerts**: Entirely client-side. State lives in Zustand store (`alerts: PriceAlert[]`). Triggered detection: compare `alert.targetPrice` vs `currentPrice` from `usePortfolio` — no backend call needed per check. Sorted: triggered first → active → inactive.
- **Alert UI**: Two-panel layout (Add form left, list right on xl). Confirm-before-delete pattern matching HoldingsTable. Active/inactive toggled via Bell/BellOff icon. Triggered alerts get red border + `AlertTriangle` icon.

## Key Architectural Decisions (Phase 4 additions)
- **Risk endpoint**: `GET /api/metrics/risk?tickers=...&weights=...&period=...` — all metrics in one call.
- **Risk metrics**: Sharpe (annualised, excess over RISK_FREE_RATE env var), Ann. Volatility, Max Drawdown, Beta vs S&P 500, Historical VaR 95%/99%, Monte Carlo VaR 95% (10k sims, fitted normal).
- **Monte Carlo fan chart**: 500 paths over 63 trading days (≈3 months). Returns p5/p25/p50/p75/p95 bands. Rendered as 5 `Line` components in a Recharts `ComposedChart` (solid median, progressively faded outer bands).
- **Correlation heatmap**: Pure SVG grid. Colour interpolation: −1=`#FF4D4D` (red) → 0=neutral → +1=`#00FF94` (green). Hidden when only 1 holding.
- **Risk period selector**: 1M/3M/6M/1Y/3Y. Changing period refetches metrics. staleTime: 5 min.
- **Beta calculation**: Portfolio log-returns covariance with S&P 500 divided by S&P 500 variance. In mock mode, uses GBM benchmark series.

## Key Architectural Decisions (Phase 3 additions)
- **Sector/geo compositions**: Hardcoded in `exposure_service.py` — covers VWRL, VWRP, VUSA, CSPX, SPY, IVV, QQQ, EQQQ, VTI, VXUS, IWDG. Unknown tickers fall back to `{Diversified: 1.0}` / `{Global: 1.0}`.
- **Ticker suffix normalisation**: `_lookup()` helper in `exposure_service.py` tries exact match → with `.L` appended → without `.L`, so users can store `VWRL` or `VWRL.L` and the correct composition is always found.
- **Diversification score**: HHI-based. Score = 40% holding concentration + 60% sector concentration, scaled 0–100. Grades: Excellent ≥75, Good ≥55, Fair ≥35, Concentrated <35.
- **ExposureItem type**: API returns `{name, weight}` shape. Local `ExposureItem` interface in `useExposure.ts` used throughout charts (not the generic `SectorExposure`/`GeographicExposure` types from `types/index.ts`).
- **Sector colours**: Fixed palette cycling `COLORS[]` in `SectorPieChart`. Geographic colours keyed by region name in `REGION_COLORS` record.

## Key Architectural Decisions (Phase 2 additions)
- **CSV import**: Trading 212 format — Ticker, Name, Shares, Average price, Currency. Parser handles quoted fields, duplicate tickers within file, missing columns. GBX (pence) normalised to GBP.
- **Benchmark weights**: Derived from cost basis (shares × avgBuyPrice) on the frontend — passed as `weights` query param to `/api/portfolio/benchmark`.
- **Mock history**: Uses geometric Brownian motion (GBM) seeded per ticker so series are deterministic. Benchmark series uses separate seed (99).
- **Period mapping**: `1mo`=21, `3mo`=63, `6mo`=126, `1y`=252, `3y`=756, `5y`=1260 trading days.
- **PerformanceChart**: Both series normalised to base=100, dashed reference line at 100. Portfolio = solid green, S&P 500 = dashed cyan.

## UI Conventions (established post-Phase 1)
- **Add Holding**: single entry point — Navbar button only. No per-page duplicate buttons.
- **Sidebar layout**: flex-based spacer div (`w-16 lg:w-56 flex-shrink-0`) rather than margin-left, to avoid Tailwind v4 responsive class issues.
- **Card padding**: `p-8` on summary/metric cards. Table cells: `px-4 py-3.5`.
- **Main content padding**: `px-8 lg:px-10 pb-8`, `paddingTop: '80px'` inline style (56px navbar + 24px gap).

## How to Run Locally

### Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
# Ensure backend/.env has MOCK_DATA=true for dev
```

### Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

## UI Overhaul (post-Phase 6)

### New Dependencies
- `framer-motion` — page transitions, animated metric cards, number count-up
- `@tsparticles/react` + `@tsparticles/slim` — particle canvas background
  - Import: `loadSlim` from `@tsparticles/slim` (NOT `loadSlimPreset` — that export doesn't exist)

### Route Structure
- Landing page at `/` (`pages/Landing.tsx`) — full-screen hero, "Get Started" → `/app/dashboard`, "View Demo" loads preset holdings
- All app pages moved to `/app/*` prefix via `AppLayout` parent route with `Outlet`
- `AppLayout` renders `<Sidebar>`, spacer div, `<Navbar>`, and `<main>` with `AnimatePresence`

### Animation Architecture
- `ParticleBackground` (`components/layout/ParticleBackground.tsx`): module-level `engineReady` guard prevents double-init in React 18 StrictMode
- `PageTransition` (`components/layout/PageTransition.tsx`): wraps each page, respects `useReducedMotion()`
- `useAnimatedCounter` (`hooks/useAnimatedCounter.ts`): uses framer-motion `animate()` for number count-up, skips animation if `useReducedMotion()` returns true
- `AnimatePresence mode="wait"` around `Outlet`, keyed by `location.pathname`
- TypeScript: framer-motion `ease` cubic-bezier arrays must be cast as `[number, number, number, number]`; use `import type { Variants }`

### CSS Animations (index.css)
- `gridDrift` — landing page moving grid lines (64px, 24s linear)
- `navGlowPulse` — sidebar active item pulses between green (#00FF94) and cyan (#00D4FF) glow, 3s ease-in-out
- `livePulse` — navbar live dot fades opacity + box-shadow, 2s ease-in-out
- `.nav-active-glow` — applies `navGlowPulse` to active sidebar NavLinks
- `@media (prefers-reduced-motion: reduce)` — overrides all animation-duration to 0.01ms

### Z-index Layering
- Particle canvas: `position: fixed`, `z-index: 0` (via `#tsparticles` in CSS)
- App layout wrapper: `position: relative`, `zIndex: 1`
- Sidebar: `z-40` (fixed, above content)
- Navbar: `z-30` (fixed, above content)

### Recharts Animations
All charts have first-render animation via `isAnimationActive`, `animationDuration`, `animationEasing="ease-out"`. MonteCarloChart uses `isAnimationActive: true as const` (was false).

## Phase Completion Checklist
- [x] Phase 1 — Scaffolding & Core Infrastructure
- [x] Phase 2 — CSV Upload & Benchmarking
- [x] Phase 3 — Sector & Geographic Exposure
- [x] Phase 4 — Risk Metrics Engine
- [x] Phase 5 — News Feed & Price Alerts
- [x] Phase 6 — Polish & Deployment
- [x] UI Overhaul — Particles, Framer Motion, Landing Page, Chart Animations, Final Polish
