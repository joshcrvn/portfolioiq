import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { TrendingUp, ArrowRight, PlayCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { usePortfolioStore } from '../store/portfolioStore';
import type { Holding } from '../types';

// ── Demo portfolio ────────────────────────────────────────────────────────────

const DEMO_HOLDINGS: Holding[] = [
  { id: uuidv4(), ticker: 'VWRL', name: 'Vanguard FTSE All-World UCITS ETF',    shares: 100, avgBuyPrice: 108.50, currency: 'GBP', addedAt: new Date().toISOString() },
  { id: uuidv4(), ticker: 'VUSA', name: 'Vanguard S&P 500 UCITS ETF',           shares: 50,  avgBuyPrice: 95.20,  currency: 'GBP', addedAt: new Date().toISOString() },
  { id: uuidv4(), ticker: 'EQQQ', name: 'Invesco EQQQ NASDAQ-100 UCITS ETF',   shares: 25,  avgBuyPrice: 380.00, currency: 'USD', addedAt: new Date().toISOString() },
  { id: uuidv4(), ticker: 'IWDG', name: 'iShares MSCI World Value UCITS ETF',  shares: 200, avgBuyPrice: 65.80,  currency: 'GBP', addedAt: new Date().toISOString() },
];

// ── Animation variants ────────────────────────────────────────────────────────

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

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
      style={{ backgroundColor: '#080C14' }}
    >
      {/* Gradient orbs */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute"
          style={{
            top: '-10%', right: '-5%',
            width: '60vw', height: '60vw',
            background: 'radial-gradient(ellipse, rgba(0,212,255,0.05) 0%, transparent 65%)',
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: '-10%', left: '-5%',
            width: '50vw', height: '50vw',
            background: 'radial-gradient(ellipse, rgba(0,255,148,0.04) 0%, transparent 65%)',
          }}
        />
      </div>

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='0.5' cy='0.5' r='0.5' fill='rgba(255%2C255%2C255%2C0.04)'/%3E%3C/svg%3E")`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Animated grid lines */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,148,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,148,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
            animation: 'gridDrift 24s linear infinite',
          }}
        />
      </div>

      {/* Hero content */}
      <motion.div
        className="relative flex flex-col items-center text-center px-6 max-w-2xl mx-auto"
        style={{ zIndex: 2 }}
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Logo badge */}
        <motion.div variants={item} className="flex items-center gap-3 mb-10">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #00FF94, #00D4FF)',
              boxShadow: '0 0 40px rgba(0,255,148,0.35)',
            }}
          >
            <TrendingUp size={22} color="#080C14" strokeWidth={2.5} />
          </div>
        </motion.div>

        {/* Main wordmark */}
        <motion.h1
          variants={item}
          style={{
            fontSize: '5rem',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #00FF94 0%, #00D4FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          PortfolioIQ
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={item}
          className="leading-relaxed mb-10 max-w-md"
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: '0.875rem',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.01em',
          }}
        >
          Institutional-grade ETF analytics.<br />
          Monte Carlo VaR · Sector Exposure · Live P&amp;L
        </motion.p>

        {/* CTAs */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="btn-gradient-glow flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #00FF94, #00D4FF)',
              color: '#080C14',
            }}
          >
            Enter App
            <ArrowRight size={15} strokeWidth={2.5} />
          </button>
          <button
            onClick={handleDemo}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200"
            style={{
              background: 'transparent',
              color: '#00FF94',
              border: '1px solid rgba(0,255,148,0.4)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,255,148,0.06)';
              e.currentTarget.style.borderColor = 'rgba(0,255,148,0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(0,255,148,0.4)';
            }}
          >
            <PlayCircle size={15} />
            Load Demo
          </button>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 text-xs tracking-wide"
        style={{
          color: 'rgba(255,255,255,0.2)',
          zIndex: 2,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Real-time ETF analytics · Monte Carlo VaR · Built with React &amp; FastAPI
      </motion.p>
    </div>
  );
}
