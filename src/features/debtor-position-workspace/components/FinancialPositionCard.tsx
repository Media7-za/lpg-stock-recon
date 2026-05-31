import { AlertTriangle } from 'lucide-react';

interface FinancialPositionCardProps {
  lpgGasDebt: number;
  cylinderFinancialBalance: number;
  totalDebtorBalance: number;
  erpStatedBalance: number;
  erpVariance: number;
}

function formatZAR(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value < 0 ? `R-${formatted}` : `R${formatted}`;
}

function DataRow({ label, value, highlight }: { label: string; value: number; highlight?: 'amber' | 'muted' | null }) {
  const formatted = formatZAR(value);
  let valueClass = 'text-text-primary font-mono font-bold';
  if (highlight === 'muted') valueClass = 'text-text-secondary font-mono';
  if (highlight === 'amber') valueClass = 'text-amber-400 font-mono font-bold';

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className={valueClass}>{formatted}</span>
    </div>
  );
}

export function FinancialPositionCard({
  lpgGasDebt,
  cylinderFinancialBalance,
  totalDebtorBalance,
  erpStatedBalance,
  erpVariance,
}: FinancialPositionCardProps) {
  const erpVarianceHighlight = erpVariance === 0 ? 'muted' : 'amber';

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h2 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">Financial Position</h2>
      <div className="divide-y divide-border">
        <DataRow label="LPG Gas Debt" value={lpgGasDebt} />
        <DataRow label="Cylinder Financial Balance" value={cylinderFinancialBalance} />
        <DataRow label="Total Reconstructed Debtor Balance" value={totalDebtorBalance} />
        <DataRow label="ERP Stated Balance" value={erpStatedBalance} />
        <div className="flex items-center justify-between py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">ERP Variance</span>
            {erpVariance !== 0 && <AlertTriangle size={13} className="text-amber-400" />}
          </div>
          <span className={`font-mono font-bold ${erpVariance === 0 ? 'text-text-secondary' : 'text-amber-400'}`}>
            {formatZAR(erpVariance)}
          </span>
        </div>
      </div>
    </div>
  );
}
