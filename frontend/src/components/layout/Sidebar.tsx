import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  Shield,
  Newspaper,
  TrendingUp,
  Home,
  ChevronLeft,
} from 'lucide-react';

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/portfolio',  icon: Briefcase,       label: 'Portfolio' },
  { to: '/app/risk',       icon: Shield,           label: 'Risk' },
  { to: '/app/news',       icon: Newspaper,        label: 'News & Alerts' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const TOOLTIP_STYLE: React.CSSProperties = {
  background: 'rgba(13,17,23,0.95)',
  border: '1px solid rgba(0,255,148,0.2)',
  borderRadius: 6,
  padding: '4px 12px',
  fontSize: '0.8rem',
  color: '#E6EDF3',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
};

function NavItemWithTooltip({
  to,
  icon: Icon,
  label,
  collapsed,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <NavLink
        to={to}
        end
        className={({ isActive }) =>
          `flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-150 group ${
            isActive ? 'nav-active-glow' : ''
          }`
        }
        style={({ isActive }) => ({
          backgroundColor: isActive ? 'rgba(0, 255, 148, 0.08)' : 'transparent',
          color: isActive ? '#00FF94' : 'rgba(255,255,255,0.45)',
          justifyContent: collapsed ? 'center' : undefined,
        })}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          if (!el.classList.contains('nav-active-glow')) {
            el.style.color = 'rgba(255,255,255,0.85)';
            el.style.backgroundColor = 'rgba(255,255,255,0.03)';
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          if (!el.classList.contains('nav-active-glow')) {
            el.style.color = 'rgba(255,255,255,0.45)';
            el.style.backgroundColor = 'transparent';
          }
        }}
      >
        {({ isActive }) => (
          <>
            <Icon
              size={18}
              style={{ color: isActive ? '#00FF94' : 'inherit', flexShrink: 0 }}
            />
            {!collapsed && (
              <span className="text-sm font-medium">{label}</span>
            )}
            {!collapsed && isActive && (
              <div
                className="ml-auto w-1.5 h-4 rounded-full"
                style={{ background: 'linear-gradient(180deg, #00FF94, #00D4FF)' }}
              />
            )}
          </>
        )}
      </NavLink>

      <AnimatePresence>
        {collapsed && hovered && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50"
            style={TOOLTIP_STYLE}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HomeLinkWithTooltip({ collapsed }: { collapsed: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to="/"
        className="flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-150 w-full"
        style={{
          color: 'rgba(255,255,255,0.35)',
          justifyContent: collapsed ? 'center' : undefined,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Home size={18} style={{ flexShrink: 0 }} />
        {!collapsed && <span className="text-sm font-medium">Home</span>}
      </Link>

      <AnimatePresence>
        {collapsed && hovered && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50"
            style={TOOLTIP_STYLE}
          >
            Home
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-40"
      style={{
        width: collapsed ? 56 : 224,
        transition: 'width 0.25s ease',
        background: 'rgba(8, 12, 20, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        overflow: 'visible',
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center hover:opacity-90 transition-opacity flex-shrink-0 overflow-hidden"
        style={{
          padding: '20px 12px',
          gap: collapsed ? 0 : 10,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #00FF94, #00D4FF)',
            boxShadow: '0 0 16px rgba(0,255,148,0.3)',
          }}
        >
          <TrendingUp size={16} color="#080C14" strokeWidth={2.5} />
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              key="wordmark"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="font-bold text-base tracking-wide whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, #00FF94, #00D4FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                overflow: 'hidden',
              }}
            >
              PortfolioIQ
            </motion.span>
          )}
        </AnimatePresence>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavItemWithTooltip
            key={to}
            to={to}
            icon={Icon}
            label={label}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Collapse toggle button — visible green pill on right edge */}
      <button
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute flex items-center justify-center"
        style={{
          top: '50%',
          right: -13,
          transform: 'translateY(-50%)',
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: 'rgba(0,255,148,0.12)',
          border: '1px solid rgba(0,255,148,0.35)',
          cursor: 'pointer',
          boxShadow: '0 0 10px rgba(0,255,148,0.15), 0 2px 8px rgba(0,0,0,0.5)',
          zIndex: 50,
          color: '#00FF94',
          transition: 'background 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0,255,148,0.25)';
          e.currentTarget.style.boxShadow = '0 0 16px rgba(0,255,148,0.3), 0 2px 8px rgba(0,0,0,0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,255,148,0.12)';
          e.currentTarget.style.boxShadow = '0 0 10px rgba(0,255,148,0.15), 0 2px 8px rgba(0,0,0,0.5)';
        }}
      >
        <motion.span
          animate={{ rotate: collapsed ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <ChevronLeft size={13} />
        </motion.span>
      </button>

      {/* Bottom section */}
      <div className="px-2 pb-4">
        <div className="mb-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        <HomeLinkWithTooltip collapsed={collapsed} />

        <div
          className="flex items-center gap-2 px-2 pt-3"
          style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              backgroundColor: '#00FF94',
              boxShadow: '0 0 6px rgba(0,255,148,0.8)',
              animation: 'liveDotPulse 2s ease-in-out infinite',
            }}
          />
          {!collapsed && (
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Live Data
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
