import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import type { PhysicalCountSession } from '../../types';

interface RecentCountsProps {
  sessions: PhysicalCountSession[];
}

export default function RecentCounts({ sessions }: RecentCountsProps) {
  const recentSessions = sessions.slice(0, 5);


  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'AM':
        return 'text-blue-500';
      case 'PM':
        return 'text-amber-500';
      case 'EOD':
        return 'text-purple-500';
      default:
        return 'text-text-secondary';
    }
  };

  if (recentSessions.length === 0) {
    return (
      <div className="bg-surface rounded-lg border border-border p-8 text-center">
        <Clock className="w-12 h-12 mx-auto mb-4 text-text-secondary" />
        <h3 className="text-lg font-semibold mb-2">No Counts Yet</h3>
        <p className="text-text-secondary mb-4">
          Start by uploading an ERP CSV file, then create your first count session.
        </p>
        <Link
          to="/count"
          className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors"
        >
          Start First Count
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Counts</h3>
      <div className="space-y-3">
        {recentSessions.map((session) => (
          <Link
            key={session.id}
            to={`/results/${session.id}`}
            className="block p-4 bg-surface-elevated hover:bg-surface rounded-lg border border-border transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className={`text-lg font-semibold ${getSessionTypeColor(session.sessionType)}`}>
                  {session.sessionType}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {format(session.timestamp, 'PPp')}
                  </div>
                  {session.counterName && (
                    <div className="text-xs text-text-secondary">
                      by {session.counterName}
                    </div>
                  )}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-blue-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

