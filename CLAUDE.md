# PortfolioIQ — Claude Code Context

## Project Summary
PortfolioIQ is a personal ETF portfolio tracker and analytics web app. Users add ETF holdings manually (ticker, shares, avg buy price, currency), see live P&L from yfinance data, and will eventually get risk analytics (Sharpe, VaR, Monte Carlo), sector/geographic exposure charts, news feed, and price alerts. Built to CV-quality standard with a Bloomberg-inspired dark terminal aesthetic.

## Current Status
- Phase 1 of 6 complete
- Last commit: `feat(api): wire up /api/portfolio/quote with yfinance + mock fallback for dev`
- Frontend builds cleanly, backend starts and serves quotes

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
│   │   ├── api/client.ts             # Axios instance, BASE_URL from VITE_API_BASE_URL
│   │   ├── store/portfolioStore.ts   # Zustand store, persisted to localStorage
│   │   ├── types/index.ts            # All TypeScript types
│   │   ├── hooks/usePortfolio.ts     # TanStack Query hook for live quotes
│   │   ├── utils/formatters.ts       # formatCurrency, formatPercent, pnlColor
│   │   ├── components/
│   │   │   ├── layout/Sidebar.tsx
│   │   │   ├── layout/Navbar.tsx
│   │   │   ├── portfolio/AddHoldingModal.tsx
│   │   │   └── portfolio/HoldingsTable.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx         # Summary cards + HoldingsTable
│   │   │   ├── Holdings.tsx          # Full holdings management
│   │   │   ├── Analytics.tsx         # Placeholder (Phase 3)
│   │   │   ├── RiskMetrics.tsx       # Placeholder (Phase 4)
│   │   │   ├── News.tsx              # Placeholder (Phase 5)
│   │   │   └── Alerts.tsx            # Placeholder (Phase 5)
│   │   ├── App.tsx                   # Router + QueryClient provider
│   │   └── main.tsx
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI app, CORS, router registration
│   │   ├── routers/
│   │   │   ├── portfolio.py          # GET /api/portfolio/quote
│   │   │   ├── metrics.py            # Placeholder (Phase 4)
│   │   │   ├── news.py               # Placeholder (Phase 5)
│   │   │   └── alerts.py             # POST /api/alerts/check (basic)
│   │   ├── services/
│   │   │   └── market_data.py        # get_quotes(), get_history(), mock fallback
│   │   └── models/schemas.py         # Pydantic models
│   ├── requirements.txt
│   ├── .env.example
│   └── venv/                         # Python virtual env (gitignored)
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
- [ ] Phase 2 — CSV Upload & Benchmarking
- [ ] Phase 3 — Sector & Geographic Exposure
- [ ] Phase 4 — Risk Metrics Engine
- [ ] Phase 5 — News Feed & Price Alerts
- [ ] Phase 6 — Polish & Deployment
