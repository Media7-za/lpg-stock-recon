import { useParams } from 'react-router-dom';
import { useDebtorWorkspace } from '../hooks/useDebtorWorkspace';
import { StatusBadge } from './StatusBadge';
import { FinancialPositionCard } from './FinancialPositionCard';
import { CustodyPositionCard } from './CustodyPositionCard';
import { ReconciliationPositionCard } from './ReconciliationPositionCard';
import { ExceptionPanel } from './ExceptionPanel';
import { AllocationEvidenceRegister } from './AllocationEvidenceRegister';
import { ReportArtifactsPanel } from './ReportArtifactsPanel';
import { ActionToolbar } from './ActionToolbar';

function formatPeriod(from: string, to: string): string {
  const fmt = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' });
  };
  return `${fmt(from)} – ${fmt(to)}`;
}

function formatGeneratedAt(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return date.toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
}

export function DebtorWorkspacePage() {
  const { debtorCode } = useParams<{ debtorCode: string }>();
  const workspace = useDebtorWorkspace(debtorCode ?? '');

  if (!workspace) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <p className="text-lg font-black text-text-primary mb-2">Debtor not found</p>
          <p className="text-sm text-text-secondary font-mono">{debtorCode ?? 'unknown'}</p>
          <p className="mt-4 text-xs text-text-secondary">No workspace fixture is loaded for this debtor code.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span className="font-mono text-xs font-black text-text-secondary bg-surface-elevated px-2 py-0.5 rounded">
            {workspace.debtorCode}
          </span>
          <h1 className="text-xl font-black text-text-primary">{workspace.debtorName}</h1>
          <StatusBadge status={workspace.workspaceStatus} />
        </div>
        <div className="flex flex-wrap gap-6 mt-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary">Period</p>
            <p className="text-sm font-bold text-text-primary">{formatPeriod(workspace.period.from, workspace.period.to)}</p>
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary">Version</p>
            <p className="text-sm font-mono font-bold text-text-primary">{workspace.version}</p>
          </div>
          {workspace.lastGeneratedAt && (
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary">Last Generated</p>
              <p className="text-sm text-text-primary">{formatGeneratedAt(workspace.lastGeneratedAt)}</p>
            </div>
          )}
        </div>
      </div>

      <FinancialPositionCard {...workspace.financialPosition} />
      <CustodyPositionCard
        totalCustodyExposure={workspace.custodyPosition.totalCustodyExposure}
        lines={workspace.custodyPosition.lines}
      />
      <ReconciliationPositionCard
        financialPosition={workspace.financialPosition}
        custodyPosition={workspace.custodyPosition}
        reconciliationPosition={workspace.reconciliationPosition}
      />
      <ExceptionPanel exceptions={workspace.reconciliationPosition.exceptions} />
      <AllocationEvidenceRegister entries={workspace.allocationEvidence} />
      <ReportArtifactsPanel artifacts={workspace.artifacts} />
      <ActionToolbar />
    </div>
  );
}
