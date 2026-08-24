import clsx from 'clsx';

// One badge component for every status enum in the card recon epic.
// docs/Card-Recon/UX_Blueprint.md — Interaction Details, status pill colors.
// Colors are mapped per entity, not globally by string value, because
// the same status string means different things in different entities
// (e.g. "OPEN" is grey for PurchaseIntent but blue for CardReconSession).

export type StatusPillKind =
  | 'purchaseIntent'
  | 'captureRequest'
  | 'ledgerEntryReconciliation'
  | 'statementLine'
  | 'reconSession'
  | 'matchMethod';

type PillColor = 'grey' | 'blue' | 'green' | 'amber' | 'red' | 'purple';

const COLOR_MAPS: Record<StatusPillKind, Record<string, PillColor>> = {
  purchaseIntent: { OPEN: 'grey', FULFILLED: 'green', ABANDONED: 'amber' },
  captureRequest: { SUBMITTED: 'grey', BATCHED: 'blue', POSTED: 'green', REJECTED: 'red' },
  ledgerEntryReconciliation: {
    UNRECONCILED: 'amber',
    RECONCILED: 'green',
    EXCEPTION_UNRESOLVED: 'red',
    EXCEPTION_CANCELLED: 'purple',
  },
  statementLine: {
    UNMATCHED: 'amber',
    MATCHED: 'green',
    EXCEPTION_UNRESOLVED: 'red',
    EXCEPTION_CANCELLED: 'purple',
  },
  reconSession: { OPEN: 'blue', DRAFT: 'amber', FINALIZED: 'green' },
  // Not in the original UX Blueprint color list (found while building
  // M4 — CardReconMatch.matchMethod needed its own badge, distinct from
  // captureRequest's SUBMITTED/BATCHED/POSTED/REJECTED, which it was
  // mistakenly rendered with in an early workspace draft).
  matchMethod: { AUTO_EXACT: 'green', AUTO_FUZZY: 'blue', MANUAL: 'purple' },
};

const COLOR_CLASSES: Record<PillColor, string> = {
  grey: 'bg-surface-elevated text-text-secondary',
  blue: 'bg-blue-500/10 text-blue-500',
  green: 'bg-emerald-500/10 text-emerald-500',
  amber: 'bg-amber-500/10 text-amber-500',
  red: 'bg-red-500/10 text-red-500',
  purple: 'bg-purple-500/10 text-purple-500',
};

export interface StatusPillProps {
  kind: StatusPillKind;
  status: string;
}

export default function StatusPill({ kind, status }: StatusPillProps) {
  const color = COLOR_MAPS[kind][status] ?? 'grey';
  return (
    <span
      className={clsx(
        'inline-block px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap',
        COLOR_CLASSES[color]
      )}
    >
      {status}
    </span>
  );
}
