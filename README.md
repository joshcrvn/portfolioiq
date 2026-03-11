# PortfolioIQ

A full-stack ETF portfolio tracker and analytics platform with a Bloomberg-inspired terminal aesthetic. Built as a CV-quality project demonstrating modern full-stack development across six phases.

## Features

| Page | What it does |
|------|-------------|
| **Dashboard** | Live P&L, daily change, portfolio value vs S&P 500 performance chart with period selector |
| **Holdings** | Add ETFs manually or import from a Trading 212 CSV export; confirm-before-delete |
| **Analytics** | Sector & geographic exposure blended by portfolio weight; HHI-based diversification score |
| **Risk Metrics** | Sharpe ratio, annualised volatility, max drawdown, beta, historical & Monte Carlo VaR, correlation heatmap, 3-month Monte Carlo fan chart |
| **News** | Financial news per holding with keyword sentiment scoring; ticker filter tabs |
| **Alerts** | Price alert management with live triggered detection; above/below conditions |

## Tech Stack

**Frontend**

- React 18 + TypeScript (Vite, `verbatimModuleSyntax`)
- Tailwind CSS v4 via `@tailwindcss/vite`
- Recharts (LineChart, PieChart, BarChart, ComposedChart)
- Zustand with `persist` middleware (holdings + alerts in localStorage)
- TanStack Query v5 (server state caching)
- Axios, React Router v7, Lucide React

**Backend**

- Python 3.13, FastAPI 0.115, Uvicorn
- yfinance for live market data (with GBM mock fallback for dev)
- pandas, NumPy, SciPy
- NewsAPI (optional) for live news

## Quick Start

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# .env already has MOCK_DATA=true — bypasses Yahoo Finance rate limits in dev
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_BASE_URL=http://localhost:8000" > .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `MOCK_DATA` | `true` | Use GBM mock data instead of live yfinance (set `false` in production) |
| `RISK_FREE_RATE` | `0.0525` | Annual risk-free rate for Sharpe ratio computation |
| `NEWSAPI_KEY` | _(optional)_ | [NewsAPI.org](https://newsapi.org) key — falls back to curated mock articles if unset |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated CORS allowed origins |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend URL (e.g. `http://localhost:8000` or your Railway/Render URL) |

## Deployment

### Frontend → Vercel

1. Import the repo in Vercel, set **Root Directory** to `frontend`
2. Add environment variable: `VITE_API_BASE_URL=https://your-backend.railway.app`
3. Deploy — the included `vercel.json` handles SPA client-side routing

### Backend → Railway

1. Import the repo in Railway, set **Root Directory** to `backend`
2. Add environment variables from `.env.example`
3. Set `MOCK_DATA=false` and `ALLOWED_ORIGINS=https://your-app.vercel.app` in production
4. The included `railway.toml` configures the start command and health check

Alternatively, any platform that supports a `Procfile` (Heroku, Render) will work with the included `Procfile`.

## Architecture

```
Client (React SPA)
├── Zustand store      — holdings + alerts, persisted to localStorage
├── TanStack Query     — server-state caching per endpoint
│   ├── quotes         30s stale / 60s refetch
│   ├── history        10 min stale
│   ├── risk metrics   5 min stale
│   └── news           5 min stale / 10 min refetch
└── Axios              — typed API client, BASE_URL from env

FastAPI Backend (stateless)
├── /api/portfolio     — quote, history, benchmark, sector/geo exposure
├── /api/metrics       — risk metrics (Sharpe, VaR, beta, Monte Carlo)
├── /api/news          — news feed (NewsAPI + mock fallback)
└── /api/alerts        — alert trigger checking

Data sources
├── yfinance           — live prices + historical OHLCV
├── NewsAPI            — financial news (optional)
└── GBM mock           — deterministic fallback for local dev
```

## Key Design Decisions

**No database.** Holdings and alerts live in browser `localStorage` via Zustand persist. The backend is fully stateless, which makes deployment trivial — no migrations, no data management.

**Mock-first development.** `MOCK_DATA=true` generates Geometric Brownian Motion price series seeded per-ticker (deterministic across restarts). All six pages are fully functional in dev without a Yahoo Finance connection or any API keys.

**Hardcoded ETF compositions.** yfinance doesn't expose underlying holdings for broad ETFs. Sector and geographic breakdowns use a curated lookup table for 11 common ETFs (VWRL/VWRP, VUSA/CSPX/SPY/IVV, QQQ/EQQQ, VTI, VXUS, IWDG) with factsheet-sourced approximate weights. A `_lookup()` helper normalises `.L` suffix variants so `VWRL` and `VWRL.L` resolve identically.

**HHI diversification scoring.** The diversification score uses the Herfindahl-Hirschman Index: score = 100 × (1 − HHI), combining 40 % holding concentration with 60 % sector concentration. Grades: Excellent ≥ 75, Good ≥ 55, Fair ≥ 35, Concentrated < 35.

**Risk metrics.** All computed from daily log-returns over the selected lookback window. Beta = cov(portfolio, S&P 500) / var(S&P 500). VaR figures are 1-day at 95 % confidence. The Monte Carlo fan chart runs 500 simulated paths over 63 trading days (≈ 3 months) with percentile bands at p5/p25/p50/p75/p95.

## Project Phases

- [x] Phase 1 — Scaffolding, Zustand store, AddHoldingModal, HoldingsTable, live quotes
- [x] Phase 2 — Trading 212 CSV import, performance chart vs S&P 500
- [x] Phase 3 — Sector & geographic exposure, diversification score
- [x] Phase 4 — Risk metrics engine (Sharpe, VaR, Monte Carlo, Beta, Correlation)
- [x] Phase 5 — News feed with sentiment, price alerts
- [x] Phase 6 — Polish, code splitting, deployment configuration
