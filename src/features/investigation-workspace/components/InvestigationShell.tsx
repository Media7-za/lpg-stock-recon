import { Link, Outlet, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useKnowledgeBundle } from '../hooks/useKnowledgeBundle';
import { InvestigationProvider } from '../context/InvestigationContext';
import { InvestigationSidebar } from './InvestigationSidebar';
import { GlobalSearch } from './GlobalSearch';
import { WorkspaceContextPanel } from './WorkspaceContextPanel';

export function InvestigationShell() {
  const { debtorCode } = useParams<{ debtorCode: string }>();
  const { bundle, loading, error } = useKnowledgeBundle(debtorCode);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text-secondary">
        Loading investigation workspace…
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <p className="text-text-primary font-black mb-2">Investigation bundle unavailable</p>
        <p className="text-sm text-text-secondary mb-4">{error ?? 'Unknown error'}</p>
        <Link to="/debtors" className="text-sky-400 hover:underline text-sm">
          Back to debtors
        </Link>
      </div>
    );
  }

  return (
    <InvestigationProvider bundle={bundle}>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="h-14 shrink-0 border-b border-border bg-surface flex items-center gap-4 px-4">
          <Link
            to="/debtors"
            className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            Debtors
          </Link>
          <GlobalSearch bundle={bundle} />
          <span className="text-[10px] text-text-secondary whitespace-nowrap">
            {bundle.views.summary.relationshipCount} edges · {bundle.views.summary.outstandingCount} outstanding
          </span>
        </header>

        <div className="flex flex-1 min-h-0">
          <InvestigationSidebar bundle={bundle} />
          <main className="flex-1 overflow-y-auto p-6 min-w-0">
            <Outlet />
          </main>
          <WorkspaceContextPanel />
        </div>
      </div>
    </InvestigationProvider>
  );
}
