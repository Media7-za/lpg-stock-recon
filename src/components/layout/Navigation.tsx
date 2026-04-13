import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, ClipboardList, TrendingUp, Database, Calculator } from 'lucide-react';
import clsx from 'clsx';

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/upload', label: 'Upload CSV', icon: Upload },
    { path: '/count', label: 'New Count', icon: ClipboardList },
    { path: '/trends', label: 'Trends', icon: TrendingUp },
    { path: '/data-agent', label: 'Data Agent', icon: Database },
    { path: '/audit', label: 'Audit Hub', icon: Calculator },
  ];

  return (
    <nav className="bg-surface border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-blue-500 border-b-2 border-blue-500'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

