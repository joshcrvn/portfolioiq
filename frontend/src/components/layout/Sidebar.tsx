import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  BarChart2,
  Shield,
  Newspaper,
  Bell,
  TrendingUp,
  Home,
} from 'lucide-react';

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/holdings',  icon: Briefcase,       label: 'Holdings' },
  { to: '/app/analytics', icon: BarChart2,        label: 'Analytics' },
  { to: '/app/risk',      icon: Shield,           label: 'Risk Metrics' },
  { to: '/app/news',      icon: Newspaper,        label: 'News' },
  { to: '/app/alerts',    icon: Bell,             label: 'Alerts' },
];

export function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 h-full w-16 lg:w-56 flex flex-col z-40"
      style={{
        background: 'rgba(8, 12, 20, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo — links back to landing */}
      <Link to="/" className="flex items-center gap-2.5 px-3 py-5 lg:px-4 hover:opacity-90 transition-opacity">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #00FF94, #00D4FF)',
            boxShadow: '0 0 16px rgba(0,255,148,0.3)',
          }}
        >
          <TrendingUp size={16} color="#080C14" strokeWidth={2.5} />
        </div>
        <span
          className="hidden lg:block font-bold text-base tracking-wide"
          style={{
            background: 'linear-gradient(135deg, #00FF94, #00D4FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          PortfolioIQ
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
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
                <span className="hidden lg:block text-sm font-medium">{label}</span>
                {isActive && (
                  <div
                    className="hidden lg:block ml-auto w-1.5 h-4 rounded-full"
                    style={{ background: 'linear-gradient(180deg, #00FF94, #00D4FF)' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section: divider + Home link + Live indicator */}
      <div className="px-2 pb-4">
        <div className="mb-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />
        <Link
          to="/"
          className="flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-150 w-full"
          style={{ color: 'rgba(255,255,255,0.35)' }}
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
          <span className="hidden lg:block text-sm font-medium">Home</span>
        </Link>

        <div className="hidden lg:flex items-center gap-2 px-2 pt-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: '#00FF94',
              boxShadow: '0 0 6px rgba(0,255,148,0.8)',
              animation: 'liveDotPulse 2s ease-in-out infinite',
            }}
          />
          <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Live Data
          </span>
        </div>
      </div>
    </aside>
  );
}
