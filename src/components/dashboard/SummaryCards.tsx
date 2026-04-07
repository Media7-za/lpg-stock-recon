import { FileText, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import type { PhysicalCountSession, ERPSnapshot } from '../../types';

interface SummaryCardsProps {
  sessions: PhysicalCountSession[];
  snapshots: ERPSnapshot[];
}

export default function SummaryCards({ sessions, snapshots }: SummaryCardsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaySessions = sessions.filter(
    s => new Date(s.timestamp) >= today
  );

  const latestSession = sessions[0];
  const latestSnapshot = snapshots[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-secondary">Today's Counts</h3>
          <Clock className="w-5 h-5 text-text-secondary" />
        </div>
        <div className="text-3xl font-bold">{todaySessions.length}</div>
        <div className="text-sm text-text-secondary mt-1">
          {todaySessions.length > 0 ? `${todaySessions.length} session${todaySessions.length > 1 ? 's' : ''} today` : 'No counts today'}
        </div>
      </div>


      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-secondary">Last Count</h3>
          <FileText className="w-5 h-5 text-text-secondary" />
        </div>
        <div className="text-lg font-semibold">
          {latestSession
            ? `${latestSession.sessionType} - ${format(latestSession.timestamp, 'HH:mm')}`
            : 'No counts yet'}
        </div>
        <div className="text-sm text-text-secondary mt-1">
          {latestSession
            ? format(latestSession.timestamp, 'PP')
            : 'Start your first count'}
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-text-secondary">Last ERP Sync</h3>
          <TrendingUp className="w-5 h-5 text-text-secondary" />
        </div>
        <div className="text-lg font-semibold">
          {latestSnapshot
            ? format(latestSnapshot.exportTime, 'HH:mm')
            : 'No data'}
        </div>
        <div className="text-sm text-text-secondary mt-1">
          {latestSnapshot
            ? format(latestSnapshot.exportTime, 'PP')
            : 'Upload CSV to start'}
        </div>
      </div>
    </div>
  );
}

