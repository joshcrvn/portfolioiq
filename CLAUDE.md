# PortfolioIQ — Master Claude Code Prompt

## Project Overview

Build **PortfolioIQ**, a personal ETF portfolio tracker and analytics web application. This is a full-stack webapp with a React/TypeScript/Tailwind frontend and a Python FastAPI backend. The app allows users to track their ETF holdings, monitor live P&L, analyse risk metrics, benchmark against the S&P 500, visualise sector/geographic exposure, and stay up to date with a news feed per holding.

This project is built to a production-grade standard — clean code, strong UI, fully deployed, and impressive enough to feature on a financial data science graduate CV.

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS for styling
- Recharts for all data visualisation (line charts, pie charts, bar charts)
- React Query (TanStack Query) for data fetching and caching
- Zustand for global state management (portfolio holdings)
- React Router for page navigation
- Axios for API calls
- Lucide React for icons

### Backend
- Python 3.11+
- FastAPI as the web framework
- yfinance for live ETF price data and historical data
- pandas + numpy for data processing and risk calculations
- scipy for Monte Carlo simulations
- NewsAPI for news feed per holding
- python-dotenv for environment variables
- CORS middleware configured for frontend origin
- Uvicorn as the ASGI server

### Deployment
- Frontend: Vercel
- Backend: Railway or Render
- Environment variables managed via .env files (never committed to git)

---

## Project Structure

```
portfolioiq/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   ├── portfolio/
│   │   │   │   ├── HoldingsTable.tsx
│   │   │   │   ├── AddHoldingModal.tsx
│   │   │   │   └── CSVUploadModal.tsx
│   │   │   ├── charts/
│   │   │   │   ├── PerformanceChart.tsx
│   │   │   │   ├── SectorPieChart.tsx
│   │   │   │   ├── GeographicChart.tsx
│   │   │   │   ├── CorrelationMatrix.tsx
│   │   │   │   └── VaRDistributionChart.tsx
│   │   │   ├── metrics/
│   │   │   │   ├── MetricCard.tsx
│   │   │   │   └── RiskMetricsPanel.tsx
│   │   │   ├── news/
│   │   │   │   └── NewsFeed.tsx
│   │   │   └── alerts/
│   │   │       └── PriceAlerts.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Holdings.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── RiskMetrics.tsx
│   │   │   └── News.tsx
│   │   ├── store/
│   │   │   └── portfolioStore.ts
│   │   ├── hooks/
│   │   │   ├── usePortfolio.ts
│   │   │   ├── useRiskMetrics.ts
│   │   │   └── usePriceAlerts.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── formatters.ts
│   │   │   └── csvParser.ts
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── portfolio.py
│   │   │   ├── metrics.py
│   │   │   ├── news.py
│   │   │   └── alerts.py
│   │   ├── services/
│   │   │   ├── market_data.py
│   │   │   ├── risk_engine.py
│   │   │   └── news_service.py
│   │   ├── models/
│   │   │   └── schemas.py
│   │   └── utils/
│   │       └── calculations.py
│   ├── requirements.txt
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## Design Direction

PortfolioIQ should feel like a **premium financial terminal** — not a generic dashboard. Think Bloomberg meets a modern fintech app. Dark theme by default. Sharp, professional, data-dense but not cluttered.

- **Colour palette**: Deep navy/charcoal background (#0F1117 or similar), with electric green (#00FF94) or cyan (#00D4FF) as the primary accent for positive returns, red (#FF4D4D) for losses. Muted greys for secondary text.
- **Typography**: Use a distinctive monospace or semi-monospace font for numbers and metrics (like JetBrains Mono or IBM Plex Mono). A clean geometric sans-serif for headings (like DM Sans or Syne).
- **Layout**: Sidebar navigation, main content area with a card-based grid. Metrics cards with subtle glowing borders on hover.
- **Motion**: Subtle fade-in on page load, smooth chart transitions, number counters that animate up on first render.
- **Data density**: Show as much useful information as possible without feeling overwhelming. Think terminal-inspired panels.

---

## Core Data Types (TypeScript)

```typescript
// types/index.ts

export interface Holding {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgBuyPrice: number;
  currency: 'GBP' | 'USD' | 'EUR';
  addedAt: string;
}

export interface LiveHolding extends Holding {
  currentPrice: number;
  currentValue: number;
  costBasis: number;
  pnl: number;
  pnlPercent: number;
  dayChange: number;
  dayChangePercent: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCostBasis: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayChange: number;
  dayChangePercent: number;
  holdings: LiveHolding[];
}

export interface RiskMetrics {
  sharpeRatio: number;
  volatility: number;
  varHistorical: number;
  varMonteCarlo: number;
  maxDrawdown: number;
  beta: number;
  correlationMatrix: Record<string, Record<string, number>>;
}

export interface BenchmarkData {
  dates: string[];
  portfolioReturns: number[];
  benchmarkReturns: number[];
}

export interface SectorExposure {
  sector: string;
  weight: number;
  value: number;
}

export interface GeographicExposure {
  region: string;
  weight: number;
  value: number;
}

export interface NewsItem {
  id: string;
  ticker: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface PriceAlert {
  id: string;
  ticker: string;
  condition: 'above' | 'below';
  targetPrice: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
}
```

---

## Backend API Endpoints

### Portfolio Router (`/api/portfolio`)

```
GET  /api/portfolio/quote?tickers=VWRL,VUSA,CSPX
     → Returns live prices, day change, market cap for given tickers

GET  /api/portfolio/history?tickers=VWRL,VUSA&period=1y
     → Returns historical price data for performance chart

GET  /api/portfolio/benchmark?tickers=VWRL,VUSA&period=1y
     → Returns portfolio vs S&P 500 (^GSPC) normalised performance

GET  /api/portfolio/sector-exposure?tickers=VWRL,VUSA
     → Returns sector breakdown for given ETF tickers

GET  /api/portfolio/geo-exposure?tickers=VWRL,VUSA
     → Returns geographic/regional breakdown
```

### Metrics Router (`/api/metrics`)

```
POST /api/metrics/risk
     Body: { holdings: Holding[], period: '1y' | '3y' | '5y' }
     → Returns RiskMetrics object including:
        - Sharpe ratio (annualised, risk-free rate = current UK base rate ~5.25%)
        - Historical VaR (95% and 99% confidence)
        - Monte Carlo VaR (10,000 simulations, 95% confidence)
        - Portfolio volatility (annualised)
        - Maximum drawdown
        - Beta vs S&P 500
        - Correlation matrix between all holdings
```

### News Router (`/api/news`)

```
GET  /api/news?tickers=VWRL,VUSA&limit=20
     → Returns latest news articles per ticker from NewsAPI
     → Each article includes a basic sentiment tag (positive/negative/neutral)
        derived from headline keyword analysis
```

### Alerts Router (`/api/alerts`)

```
POST /api/alerts/check
     Body: { alerts: PriceAlert[], currentPrices: Record<string, number> }
     → Checks which alerts have been triggered, returns triggered list
```

---

## Implementation Phases

### Phase 1 — Project Scaffolding & Core Infrastructure
**Goal**: Both frontend and backend running locally, connected, with basic portfolio input working.

Tasks:
1. Initialise frontend with Vite + React + TypeScript + Tailwind
2. Install all frontend dependencies (recharts, zustand, react-query, axios, lucide-react, react-router-dom)
3. Set up FastAPI backend with folder structure above
4. Install all backend dependencies (fastapi, uvicorn, yfinance, pandas, numpy, scipy, newsapi-python, python-dotenv)
5. Configure CORS in FastAPI to allow frontend origin
6. Build Zustand portfolio store — holds holdings array, persisted to localStorage
7. Build the Navbar and Sidebar layout components
8. Build the Add Holding modal (form: ticker, shares, avg buy price, currency)
9. Wire up the `/api/portfolio/quote` endpoint with yfinance
10. Display a basic HoldingsTable showing each holding with live price and P&L

**Done when**: User can add ETF holdings manually, see live prices, and P&L updates on page load.

---

### Phase 2 — CSV Upload & Performance Benchmarking
**Goal**: CSV import works, performance chart vs S&P 500 is live.

Tasks:
1. Build CSV upload modal — accepts Trading 212 export format
2. Write CSV parser utility that maps Trading 212 columns to Holding type
3. Handle edge cases: duplicate tickers, missing fields, unsupported assets
4. Build `/api/portfolio/history` and `/api/portfolio/benchmark` endpoints
5. Build PerformanceChart component (Recharts LineChart, two lines: portfolio vs S&P 500)
6. Add time period selector (1M, 3M, 6M, 1Y, 3Y)
7. Show portfolio summary metrics at top of Dashboard: total value, total P&L, day change

**Done when**: User can upload a CSV, see their full portfolio imported, and view a performance chart benchmarked against S&P 500.

---

### Phase 3 — Sector & Geographic Exposure
**Goal**: Visual breakdown of what the portfolio is actually exposed to.

Tasks:
1. Build `/api/portfolio/sector-exposure` endpoint
   - Use yfinance `.info` to get sector data per ETF
   - For broad ETFs (e.g. VWRL), use a hardcoded lookup table of known ETF compositions (top sectors/regions) since yfinance won't return full underlying data
   - Weight by portfolio value
2. Build `/api/portfolio/geo-exposure` endpoint using same approach
3. Build SectorPieChart (Recharts PieChart with custom tooltip)
4. Build GeographicChart (Recharts BarChart showing regional weights)
5. Add an Analytics page that hosts both charts side by side
6. Add a portfolio diversification score (simple heuristic: penalise concentration)

**Done when**: Analytics page shows clear sector and geographic breakdown weighted by portfolio value.

---

### Phase 4 — Risk Metrics Engine
**Goal**: Proper quantitative risk analysis that would impress a quant interviewer.

Tasks:
1. Build the risk engine service (`risk_engine.py`):

   **Sharpe Ratio**:
   - Fetch historical returns for all holdings and portfolio
   - Annualise: `(mean_daily_return * 252 - risk_free_rate) / (std_daily_return * sqrt(252))`
   - Use UK base rate (5.25% at time of writing, make this configurable)

   **Historical VaR**:
   - Calculate daily portfolio returns over selected period
   - Sort returns, take 5th percentile (95% confidence)
   - Express as £ value at risk given current portfolio value

   **Monte Carlo VaR**:
   - Run 10,000 simulations of 1-day portfolio return
   - Use multivariate normal distribution parameterised by historical mean returns and covariance matrix
   - Take 5th percentile of simulation results
   - This is the headline metric — make it clear in the UI

   **Maximum Drawdown**:
   - Calculate running maximum of portfolio value
   - Drawdown at each point = (current - running max) / running max
   - Return the minimum (worst) drawdown

   **Beta**:
   - Regress portfolio daily returns against S&P 500 daily returns
   - Beta = covariance(portfolio, market) / variance(market)

   **Correlation Matrix**:
   - Daily return correlation between all holdings
   - Return as nested dict for frontend heatmap

2. Build `/api/metrics/risk` POST endpoint wiring up the engine
3. Build RiskMetricsPanel component — display each metric as a card with:
   - The metric value
   - A plain English explanation of what it means
   - A colour indicator (green/amber/red based on thresholds)
4. Build VaRDistributionChart — histogram of Monte Carlo simulation results with VaR line marked
5. Build CorrelationMatrix — heatmap grid coloured from red (negative) to green (positive correlation)
6. Add a dedicated Risk Metrics page

**Done when**: Risk page shows all six metrics clearly with the Monte Carlo VaR distribution chart and correlation heatmap.

---

### Phase 5 — News Feed & Price Alerts
**Goal**: Live market intelligence layer on top of the portfolio.

Tasks:
1. Set up NewsAPI key in backend .env
2. Build news service — fetch top 5 articles per holding ticker, add basic sentiment:
   - Positive keywords: beat, surge, rally, upgrade, growth, record
   - Negative keywords: miss, drop, cut, downgrade, loss, risk, fall
   - Everything else: neutral
3. Build `/api/news` endpoint
4. Build NewsFeed component — card per article, ticker badge, sentiment colour tag, time ago
5. Add a News page that shows all holdings' news in reverse chronological order
6. Build price alert system:
   - User sets alert: ticker + above/below + target price
   - Alerts stored in Zustand store (persisted to localStorage)
   - On page load, frontend calls `/api/alerts/check` with current prices
   - Triggered alerts shown as a notification banner at top of screen
7. Build PriceAlerts management page — list all alerts, toggle active/inactive, delete

**Done when**: News page is live with per-holding articles and sentiment tags. Alerts trigger visibly when price conditions are met.

---

### Phase 6 — Polish, README & Deployment
**Goal**: Production-ready, deployed, CV-worthy.

Tasks:
1. Add loading skeletons for all data-fetching states
2. Add error states with helpful messages (e.g. invalid ticker, API limit reached)
3. Add empty states for new users with onboarding prompt
4. Ensure full mobile responsiveness
5. Add a demo mode — pre-loads a sample ETF portfolio so employers can explore without adding their own data
6. Write README.md covering:
   - Project overview and motivation
   - Features list with screenshots
   - Tech stack with justification
   - Finance concepts explained (VaR, Sharpe, Monte Carlo) in plain English
   - Local setup instructions
   - Deployment instructions
   - Future roadmap (Trading 212 API integration, multi-currency support, tax reporting)
7. Deploy frontend to Vercel
8. Deploy backend to Railway (set all env vars in dashboard)
9. Update CORS in backend to allow Vercel domain
10. Test full flow end to end on production URLs

**Done when**: Live URL works, demo mode loads a sample portfolio, README is thorough and professional.

---

## Key Implementation Notes

### yfinance ETF Data
- Use `yf.Ticker(ticker).info` for metadata (name, sector, currency)
- Use `yf.download(tickers, period='1y')` for historical price data
- For LSE-listed ETFs, append `.L` to the ticker (e.g. `VWRL.L`, `VUSA.L`)
- Cache yfinance responses with a 15-minute TTL to avoid rate limiting — use a simple in-memory dict with timestamps

### Monte Carlo VaR Implementation
```python
import numpy as np

def monte_carlo_var(returns_df: pd.DataFrame, portfolio_weights: np.array, 
                    portfolio_value: float, n_simulations: int = 10000, 
                    confidence: float = 0.95) -> float:
    mean_returns = returns_df.mean()
    cov_matrix = returns_df.cov()
    
    simulated_returns = np.random.multivariate_normal(
        mean_returns, cov_matrix, n_simulations
    )
    
    portfolio_simulated_returns = simulated_returns @ portfolio_weights
    var = np.percentile(portfolio_simulated_returns, (1 - confidence) * 100)
    
    return abs(var * portfolio_value)
```

### CSV Format (Trading 212 Export)
Trading 212 exports include columns: `Ticker`, `Name`, `Shares`, `Average price`, `Currency`. The CSV parser should:
- Map these directly to the Holding type
- Handle both `.L` suffix and plain tickers
- Skip non-ETF rows gracefully
- Show a summary of what was imported (X holdings imported, Y skipped)

### Environment Variables
```
# backend/.env
NEWSAPI_KEY=your_newsapi_key_here
RISK_FREE_RATE=0.0525
ALLOWED_ORIGINS=http://localhost:5173,https://your-vercel-url.vercel.app
```

```
# frontend/.env
VITE_API_BASE_URL=http://localhost:8000
```

### Error Handling
- All FastAPI endpoints should return structured error responses: `{"error": "message", "detail": "..."}`
- Frontend should catch all API errors and display user-friendly messages
- Invalid tickers should return a clear error, not crash the app

---

## README Structure to Generate

```markdown
# PortfolioIQ 📊

> A personal ETF portfolio tracker with institutional-grade risk analytics

[Live Demo] [Screenshot]

## Features
- Real-time P&L tracking for ETF portfolios
- Benchmark performance vs S&P 500
- Monte Carlo Value at Risk simulation (10,000 runs)
- Sharpe ratio, volatility, max drawdown, and beta
- Sector and geographic exposure breakdown
- Per-holding news feed with sentiment analysis
- Price alert system
- CSV import from Trading 212

## Tech Stack
[...]

## Finance Concepts
### Value at Risk (VaR)
[...]
### Sharpe Ratio
[...]
### Monte Carlo Simulation
[...]

## Setup
[...]

## Roadmap
- [ ] Trading 212 API live sync
- [ ] Multi-currency normalisation
- [ ] Tax year P&L reporting
- [ ] Options and individual stock support
```

---

## Git Workflow

Every meaningful unit of work must be committed and pushed to GitHub. Do not batch up large amounts of work into a single commit. Follow this pattern throughout the entire build:

- After completing each individual task within a phase, stage and commit with a clear, descriptive message
- After completing an entire phase, push all commits to the `main` branch
- Commit message format: `type(scope): description` — for example:
  - `feat(holdings): add manual holding input modal`
  - `feat(risk): implement Monte Carlo VaR engine`
  - `fix(csv): handle missing ticker column in Trading 212 export`
  - `chore(deps): add yfinance and scipy to requirements`
  - `style(dashboard): improve metric card layout and colours`
- Never go more than one completed task without committing
- Always run `git push origin main` at the end of each phase

This keeps the GitHub commit history clean, readable, and impressive — which matters for a CV project.

---

## CLAUDE.md — Persistent Project Context

Maintain a `CLAUDE.md` file in the root of the project at all times. This file is the persistent memory of the project — it tells any future Claude Code session everything it needs to know to continue working without losing context.

Update `CLAUDE.md` at the end of every phase and after any significant architectural decision. It should always reflect the current true state of the project.

### CLAUDE.md Structure

```markdown
# PortfolioIQ — Claude Code Context

## Project Summary
[One paragraph describing what the app does]

## Current Status
- Phase X of 6 complete
- Currently working on: [specific task]
- Last commit: [commit message]

## Tech Stack
[List frontend and backend stack as implemented, note any deviations from original plan]

## Project Structure
[Updated file tree reflecting actual current structure]

## Environment Variables
Frontend (.env):
- VITE_API_BASE_URL

Backend (.env):
- NEWSAPI_KEY
- RISK_FREE_RATE
- ALLOWED_ORIGINS

## Key Architectural Decisions
[Any decisions made during the build that future sessions need to know — e.g. "Using .L suffix for all LSE tickers", "ETF sector data uses hardcoded lookup table", "Alerts stored in Zustand persisted to localStorage"]

## Known Issues / TODOs
[Any outstanding bugs, edge cases, or deferred work]

## How to Run Locally
Frontend: cd frontend && npm run dev
Backend: cd backend && uvicorn app.main:app --reload

## Phase Completion Checklist
- [x] Phase 1 — Scaffolding & Core Infrastructure
- [ ] Phase 2 — CSV Upload & Benchmarking
- [ ] Phase 3 — Sector & Geographic Exposure
- [ ] Phase 4 — Risk Metrics Engine
- [ ] Phase 5 — News Feed & Price Alerts
- [ ] Phase 6 — Polish & Deployment
```

Commit the updated `CLAUDE.md` at the end of every phase with message: `docs(claude): update project context after phase X`

---

## Start Command

Begin with Phase 1. Scaffold the full project structure first, then implement each file. Do not skip ahead to later phases. Confirm completion of each phase before moving to the next. Create the CLAUDE.md file as part of the Phase 1 scaffolding and commit it along with the initial project structure.
