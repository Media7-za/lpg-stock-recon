import { DebtorWorkspaceStatus } from '../types/debtorWorkspace';

interface StatusBadgeProps {
  status: DebtorWorkspaceStatus;
}

const STATUS_CONFIG: Record<DebtorWorkspaceStatus, { label: string; className: string }> = {
  clean:             { label: 'Clean',              className: 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/50' },
  cylinder_variance: { label: 'Cyl Variance',       className: 'bg-amber-900/40 text-amber-400 border border-amber-700/50' },
  erp_exception:     { label: 'ERP Exception',      className: 'bg-orange-900/40 text-orange-400 border border-orange-700/50' },
  pending_review:    { label: 'Pending Review',      className: 'bg-blue-900/40 text-blue-400 border border-blue-700/50' },
  approved_internal: { label: 'Approved (Internal)', className: 'bg-indigo-900/40 text-indigo-400 border border-indigo-700/50' },
  customer_ready:    { label: 'Customer Ready',      className: 'bg-teal-900/40 text-teal-400 border border-teal-700/50' },
  sent:              { label: 'Sent',                className: 'bg-slate-800 text-slate-400 border border-slate-600/50' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${className}`}>
      {label}
    </span>
  );
}
