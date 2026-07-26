import { WorkspaceException, StatementException, ExceptionSeverity } from '../types/debtorWorkspace';

interface ExceptionPanelProps {
  exceptions: (WorkspaceException | StatementException)[];
}

const SEVERITY_CONFIG: Record<ExceptionSeverity, { label: string; badgeClass: string; rowClass: string }> = {
  info:     { label: 'INFO',     badgeClass: 'bg-blue-900/40 text-blue-400 border border-blue-700/50',    rowClass: 'border-blue-800/30' },
  warning:  { label: 'WARNING',  badgeClass: 'bg-amber-900/40 text-amber-400 border border-amber-700/50', rowClass: 'border-amber-800/30' },
  critical: { label: 'CRITICAL', badgeClass: 'bg-red-900/40 text-red-400 border border-red-700/50',       rowClass: 'border-red-800/30' },
};

// v4 exceptions carry `severity` (UI display-priority); v5 exceptions carry `basis`
// (epistemic truth-quality, DEBTORS_DOCTRINE.md §6) instead. Different axis, not a
// renaming — do not map one onto the other.
function isWorkspaceException(ex: WorkspaceException | StatementException): ex is WorkspaceException {
  return 'severity' in ex;
}

const BASIS_BADGE_CLASS: Record<StatementException['basis'], string> = {
  PROVEN: 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/50',
  ASSERTED: 'bg-amber-900/40 text-amber-400 border border-amber-700/50',
  ASSUMED: 'bg-slate-800 text-slate-400 border border-slate-600/50',
};

export function ExceptionPanel({ exceptions }: ExceptionPanelProps) {
  if (exceptions.length === 0) return null;

  return (
    <div className="bg-surface rounded-xl border border-border p-5">
      <h2 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4">
        Exceptions ({exceptions.length})
      </h2>
      <div className="space-y-3">
        {exceptions.map((ex, i) => {
          if (isWorkspaceException(ex)) {
            const cfg = SEVERITY_CONFIG[ex.severity];
            return (
              <div key={i} className={`rounded-lg border p-4 ${cfg.rowClass} bg-surface-elevated`}>
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${cfg.badgeClass}`}>
                    {cfg.label}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{ex.title}</p>
                    <p className="mt-1 text-xs text-text-secondary">{ex.description}</p>
                    <p className="mt-1 text-[10px] font-mono text-text-secondary/60">{ex.type}</p>
                  </div>
                </div>
              </div>
            );
          }

          // StatementException (v5) — epistemic basis, not UI severity. This exception
          // describes a statement reconciliation gap only; it is never a D18 collections
          // blocker and must not be presented or treated as one.
          return (
            <div key={i} className="rounded-lg border border-border/50 p-4 bg-surface-elevated">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shrink-0 ${BASIS_BADGE_CLASS[ex.basis]}`}>
                  {ex.basis}
                </span>
                <div>
                  <p className="text-sm font-bold text-text-primary">{ex.description}</p>
                  <p className="mt-1 text-[10px] font-mono text-text-secondary/60">
                    {ex.type} · {ex.status}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
