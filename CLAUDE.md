# PortfolioIQ — Claude Code Context

## Project Summary
PortfolioIQ is a personal ETF portfolio tracker and analytics web app. Users add ETF holdings manually (ticker, shares, avg buy price, currency), see live P&L from yfinance data, and will eventually get risk analytics (Sharpe, VaR, Monte Carlo), sector/geographic exposure charts, news feed, and price alerts. Built to CV-quality standard with a Bloomberg-inspired dark terminal aesthetic.

## Current Status
- Phase 3 of 6 complete
- Last commit: `fix(analytics): handle ticker suffix mismatch in exposure service lookup`
- Frontend builds cleanly, backend serves quotes + history + benchmark + sector/geo exposure

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
│   │   │   └── useExposure.ts              # TanStack Query: sector + geo exposure
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
│   │   │       └── GeographicChart.tsx     # Recharts BarChart (horizontal), regional weights
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx               # Summary cards + PerformanceChart + HoldingsTable
│   │   │   ├── Holdings.tsx
│   │   │   ├── Analytics.tsx               # Sector/geo charts + diversification score
│   │   │   ├── RiskMetrics.tsx             # Placeholder (Phase 4)
│   │   │   ├── News.tsx                    # Placeholder (Phase 5)
│   │   │   └── Alerts.tsx                  # Placeholder (Phase 5)
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── portfolio.py          # GET /quote, /history, /benchmark, /sector-exposure, /geo-exposure
│   │   │   ├── metrics.py            # Placeholder (Phase 4)
│   │   │   ├── news.py               # Placeholder (Phase 5)
│   │   │   └── alerts.py             # POST /api/alerts/check
│   │   ├── services/
│   │   │   ├── market_data.py        # get_quotes(), get_history(), get_benchmark(), mock fallback
│   │   │   └── exposure_service.py   # get_sector_exposure(), get_geo_exposure(), diversification_score()
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
- `App.css` (Vite default) still exists — can be deleted in cleanup phase
- `frontend/public/vite.svg` and `frontend/src/assets/react.svg` still present — clean up in Phase 6
- Recharts bundle adds ~370 KB to JS — acceptable for this project, can code-split in Phase 6 if needed

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

## Phase Completion Checklist
- [x] Phase 1 — Scaffolding & Core Infrastructure
- [x] Phase 2 — CSV Upload & Benchmarking
- [x] Phase 3 — Sector & Geographic Exposure
- [ ] Phase 4 — Risk Metrics Engine
- [ ] Phase 5 — News Feed & Price Alerts
- [ ] Phase 6 — Polish & Deployment
