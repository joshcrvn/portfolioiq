import { Link } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5">
      <BarChart2 size={40} color="#30363D" />
      <div className="text-center">
        <p className="font-mono text-5xl font-bold mb-2" style={{ color: '#30363D' }}>404</p>
        <p className="text-sm" style={{ color: '#8B949E' }}>Page not found</p>
      </div>
      <Link
        to="/"
        className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
        style={{ backgroundColor: '#161B22', border: '1px solid #30363D', color: '#E6EDF3' }}
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
