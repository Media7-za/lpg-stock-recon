import { Wifi, WifiOff, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function Header() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { userRole, logout, isBypassed } = useAuth();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="bg-surface border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">LPG Stock Reconciliation System</h1>
          {userRole && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-text-secondary">Logged in as:</span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                {userRole}
              </span>
              {isBypassed && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 px-1.5 py-0.2 rounded border border-amber-500/25">
                  Bypassed
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-text-secondary">
            {isOnline ? (
              <>
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="text-sm">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-amber-500" />
                <span className="text-sm">Offline</span>
              </>
            )}
          </div>
          {userRole && (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-elevated hover:bg-red-500/10 border border-border hover:border-red-500/30 text-text-secondary hover:text-red-400 rounded text-sm transition-all"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}


