import { Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
        <h1 className="text-2xl font-bold">LPG Stock Reconciliation System</h1>
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
        </div>
      </div>
    </header>
  );
}

