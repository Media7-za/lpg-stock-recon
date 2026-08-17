import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, ClipboardList, TrendingUp, Database, Calculator, Truck, Users, Tag, FileScan } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';

export default function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home, roles: ['Yard Counter', 'Depot Manager', 'Invoice Clerk'] },
    { path: '/upload', label: 'Upload CSV', icon: Upload, roles: ['Depot Manager'] },
    { path: '/count', label: 'New Count', icon: ClipboardList, roles: ['Yard Counter', 'Depot Manager'] },
    { path: '/trends', label: 'Trends', icon: TrendingUp, roles: ['Depot Manager'] },
    { path: '/data-agent', label: 'Data Hub', icon: Database, roles: ['Depot Manager'] },
    { path: '/audit', label: 'Audit Hub', icon: Calculator, roles: ['Depot Manager', 'Invoice Clerk'] },
    { path: '/dispatch', label: 'Invoice Dispatch', icon: Truck, roles: ['Depot Manager', 'Invoice Clerk'] },
    { path: '/receipts', label: 'Receipt Scan', icon: FileScan, roles: ['Yard Counter', 'Depot Manager', 'Invoice Clerk'] },
    { path: '/debtors', label: 'Debtors', icon: Users, roles: ['Depot Manager', 'Invoice Clerk'] },
    { path: '/pricing-desk', label: 'Pricing Desk', icon: Tag, roles: ['Depot Manager', 'Invoice Clerk'] },
  ];

  const { userRole, loading } = useAuth();

  return (
    <nav className="bg-surface border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex gap-1">
          {navItems.filter(item => !loading && userRole && item.roles.includes(userRole)).map((item) => {
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

