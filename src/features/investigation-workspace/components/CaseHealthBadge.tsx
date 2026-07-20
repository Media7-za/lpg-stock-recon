import clsx from 'clsx';
import type { CaseHealth } from '../types/knowledgeBundle';
import { HEALTH_LABELS } from '../domains/allocation/labels';

const styles: Record<CaseHealth, string> = {
  healthy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  needs_review: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  conflict: 'text-red-400 bg-red-400/10 border-red-400/30',
  incomplete: 'text-sky-400 bg-sky-400/10 border-sky-400/30',
};

export function CaseHealthBadge({ health }: { health: CaseHealth }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded px-2 py-0.5 text-[11px] font-black uppercase tracking-wide border',
        styles[health]
      )}
    >
      {HEALTH_LABELS[health]}
    </span>
  );
}
