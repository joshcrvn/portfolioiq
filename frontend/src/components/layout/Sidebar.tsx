import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  BarChart2,
  Shield,
  Newspaper,
  Bell,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/holdings', icon: Briefcase, label: 'Holdings' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/risk', icon: Shield, label: 'Risk Metrics' },
  { to: '/news', icon: Newspaper, label: 'News' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-16 lg:w-56 flex flex-col z-40"
      style={{ backgroundColor: '#161B22', borderRight: '1px solid #30363D' }}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-5 lg:px-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #00FF94, #00D4FF)' }}>
          <TrendingUp size={16} color="#0F1117" strokeWidth={2.5} />
        </div>
        <span className="hidden lg:block font-bold text-sm tracking-wide"
          style={{ color: '#E6EDF3' }}>
          PortfolioIQ
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-150 group ${
                isActive ? 'nav-active' : 'nav-inactive'
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'rgba(0, 255, 148, 0.1)' : 'transparent',
              color: isActive ? '#00FF94' : '#8B949E',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  style={{ color: isActive ? '#00FF94' : '#8B949E', flexShrink: 0 }}
                />
                <span className="hidden lg:block text-sm font-medium">{label}</span>
                {isActive && (
                  <div className="hidden lg:block ml-auto w-1 h-4 rounded-full"
                    style={{ backgroundColor: '#00FF94' }} />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t" style={{ borderColor: '#30363D' }}>
        <div className="hidden lg:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#00FF94' }} />
          <span className="text-xs" style={{ color: '#8B949E' }}>Live Data</span>
        </div>
      </div>
    </aside>
  );
}
