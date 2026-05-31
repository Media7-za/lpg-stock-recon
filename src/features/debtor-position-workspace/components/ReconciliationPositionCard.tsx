import { AlertTriangle } from 'lucide-react';
import { DebtorWorkspaceState } from '../types/debtorWorkspace';

interface ReconciliationPositionCardProps {
  financialPosition: DebtorWorkspaceState['financialPosition'];
  custodyPosition: DebtorWorkspaceState['custodyPosition'];
  reconciliationPosition: DebtorWorkspaceState['reconciliationPosition'];
}

function formatZAR(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value < 0 ? `R-${formatted}` : `R${formatted}`;
}

function ReconRow({
  label,
  value,
  isVariance,
  nonZeroAmber,
}: {
  label: string;
  value: number;
  isVariance?: boolean;
  nonZeroAmber?: boolean;
}) {
  const isNonZero = value !== 0;
  const showAmber = nonZeroAmber && isNonZero;

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-secondary">{label}</span>
        {isVariance && isNonZero && <AlertTriangle size={13} className="text-amber-400" />}
      </div>
      <span className={`font-mono font-bold ${showAmber ? 'text-amber-400' : isNonZero && isVariance ? 'text-amber-400' : value === 0 && isVariance ? 'text-text-secondary' : 'text-text-primary'}`}>
        {formatZAR(value)}
      </span>
    </div>
  );
}

export function ReconciliationPositionCard({
  financialPosition,
  custodyPosition,
  reconciliationPosition,
}: ReconciliationPositionCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h2 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">Reconciliation Position</h2>
      <div className="divide-y divide-border">
        <ReconRow label="Cylinder Financial Balance" value={financialPosition.cylinderFinancialBalance} />
        <ReconRow label="Cylinder Custody Exposure" value={custodyPosition.totalCustodyExposure} />
        <ReconRow label="Cylinder Variance" value={reconciliationPosition.cylinderVariance} isVariance />
        <ReconRow label="ERP Stated Balance" value={financialPosition.erpStatedBalance} />
        <ReconRow label="Reconstructed Balance" value={financialPosition.totalDebtorBalance} />
        <ReconRow label="ERP Variance" value={reconciliationPosition.erpVariance} isVariance />
      </div>
      {(reconciliationPosition.erpVariance !== 0 || reconciliationPosition.cylinderVariance !== 0) && (
        <p className="mt-3 text-[11px] text-text-secondary italic">
          Non-zero variances above are disclosed outcomes from the reconciliation process, not uncategorised errors.
        </p>
      )}
    </div>
  );
}
