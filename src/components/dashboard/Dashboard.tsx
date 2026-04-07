import { Link } from 'react-router-dom';
import { Upload, ClipboardList, Download } from 'lucide-react';
import { useERPSnapshots, usePhysicalCountSessions } from '../../hooks/useDatabase';
import SummaryCards from './SummaryCards';
import RecentCounts from './RecentCounts';
import { buildDexieExportPayload, downloadJson } from '../../lib/dexieExport';

export default function Dashboard() {
  const { snapshots, loading: snapshotsLoading } = useERPSnapshots();
  const { sessions, loading: sessionsLoading } = usePhysicalCountSessions();

  const loading = snapshotsLoading || sessionsLoading;

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={async () => {
              const payload = await buildDexieExportPayload();
              const date = new Date().toISOString().split('T')[0];
              downloadJson(payload, `dexie-export-${date}.json`);
            }}
            className="px-4 py-2 bg-surface-elevated hover:bg-surface border border-border rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export DB
          </button>
          <Link
            to="/upload"
            className="px-4 py-2 bg-surface-elevated hover:bg-surface border border-border rounded-lg flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Upload CSV
          </Link>
          <Link
            to="/results"
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            Run Recon Engine
          </Link>
          <Link
            to="/count"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            New Count
          </Link>
        </div>
      </div>

      <SummaryCards sessions={sessions} snapshots={snapshots} />
      <RecentCounts sessions={sessions} />
    </div>
  );
}

