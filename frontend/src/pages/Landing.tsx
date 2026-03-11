import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { TrendingUp, ArrowRight, PlayCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { usePortfolioStore } from '../store/portfolioStore';
import type { Holding } from '../types';

// ── Demo portfolio loaded when user clicks "View Demo" ────────────────────────

const DEMO_HOLDINGS: Holding[] = [
  { id: uuidv4(), ticker: 'VWRL', name: 'Vanguard FTSE All-World UCITS ETF',    shares: 100, avgBuyPrice: 108.50, currency: 'GBP', addedAt: new Date().toISOString() },
  { id: uuidv4(), ticker: 'VUSA', name: 'Vanguard S&P 500 UCITS ETF',           shares: 50,  avgBuyPrice: 95.20,  currency: 'GBP', addedAt: new Date().toISOString() },
  { id: uuidv4(), ticker: 'EQQQ', name: 'Invesco EQQQ NASDAQ-100 UCITS ETF',   shares: 25,  avgBuyPrice: 380.00, currency: 'USD', addedAt: new Date().toISOString() },
  { id: uuidv4(), ticker: 'IWDG', name: 'iShares MSCI World Value UCITS ETF',  shares: 200, avgBuyPrice: 65.80,  currency: 'GBP', addedAt: new Date().toISOString() },
];

// ── Animation variants ─────────────────────────────────────────────────────────

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ── Feature pills ─────────────────────────────────────────────────────────────

const FEATURES = ['Live P&L', 'Risk Analytics', 'Monte Carlo VaR', 'Sector Exposure', 'News Feed', 'Price Alerts'];

// ── Landing page ──────────────────────────────────────────────────────────────

export function Landing() {
  const navigate    = useNavigate();
  const setHoldings = usePortfolioStore((s) => s.setHoldings);

  function handleDemo() {
    setHoldings(DEMO_HOLDINGS);
    navigate('/app/dashboard');
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#0F1117' }}
    >
      {/* CSS animated grid lines — pure CSS, below particles */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,148,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,148,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            animation: 'gridDrift 24s linear infinite',
          }}
        />
      </div>

      {/* Radial glow behind hero text */}
      <div
        className="absolute pointer-events-none"
        style={{
          zIndex: 1,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          width: 600, height: 600,
          background: 'radial-gradient(ellipse, rgba(0,255,148,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Hero content */}
      <motion.div
        className="relative flex flex-col items-center text-center px-6 max-w-2xl mx-auto"
        style={{ zIndex: 2 }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Logo badge */}
        <motion.div variants={item} className="flex items-center gap-2.5 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00FF94, #00D4FF)', boxShadow: '0 0 32px rgba(0,255,148,0.3)' }}
          >
            <TrendingUp size={20} color="#0F1117" strokeWidth={2.5} />
          </div>
          <span
            className="text-sm font-semibold tracking-widest uppercase"
            style={{ color: '#00FF94', letterSpacing: '0.15em' }}
          >
            PortfolioIQ
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          variants={item}
          className="font-bold leading-tight mb-5"
          style={{
            fontSize: 'clamp(2.25rem, 6vw, 3.5rem)',
            background: 'linear-gradient(135deg, #E6EDF3 30%, #00FF94 70%, #00D4FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Institutional-grade portfolio analytics for every investor
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={item}
          className="text-base leading-relaxed mb-8 max-w-lg"
          style={{ color: '#8B949E' }}
        >
          Real-time P&amp;L, sector exposure, Monte Carlo risk simulation, and AI-curated
          news — all in one Bloomberg-inspired terminal.
        </motion.p>

        {/* Feature pills */}
        <motion.div variants={item} className="flex flex-wrap justify-center gap-2 mb-10">
          {FEATURES.map((f) => (
            <span
              key={f}
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ backgroundColor: 'rgba(0,255,148,0.08)', color: '#00FF94', border: '1px solid rgba(0,255,148,0.2)' }}
            >
              {f}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #00FF94, #00D4FF)', color: '#0F1117' }}
          >
            Get Started
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={handleDemo}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: '#161B22', color: '#E6EDF3', border: '1px solid #30363D' }}
          >
            <PlayCircle size={16} />
            View Demo
          </button>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className="absolute bottom-8 text-xs"
        style={{ color: '#30363D', zIndex: 2 }}
      >
        Built with React, FastAPI &amp; Monte Carlo simulation
      </motion.p>
    </div>
  );
}
