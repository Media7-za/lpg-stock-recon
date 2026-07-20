import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import type { KnowledgeBundle } from '../types/knowledgeBundle';
import { CaseHealthBadge } from './CaseHealthBadge';
import { investigationBasePath } from '../domains/allocation/routePrefix';

export function InvestigationSidebar({ bundle }: { bundle: KnowledgeBundle }) {
  const base = investigationBasePath(bundle.debtorCode);
  const featuredCases = bundle.views.needsReviewCases.slice(0, 8);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    clsx(
      'block rounded-lg px-3 py-2 text-sm transition-colors',
      isActive ? 'bg-surface-elevated text-text-primary font-bold' : 'text-text-secondary hover:text-text-primary hover:bg-surface'
    );

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col overflow-hidden">
      <div className="p-4 border-b border-border">
        <p className="font-mono text-xs font-black text-text-secondary">{bundle.debtorCode}</p>
        <p className="text-sm font-black text-text-primary truncate">{bundle.debtorName}</p>
      </div>

      <nav className="p-3 space-y-1 overflow-y-auto flex-1">
        <NavLink to={base} end className={navClass}>
          Home
        </NavLink>

        <p className="pt-4 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-text-secondary">Cases</p>
        {featuredCases.map((c) => (
          <NavLink
            key={c.allocationGroupId}
            to={`${base}/cases/${encodeURIComponent(c.allocationGroupId)}`}
            className={({ isActive }) =>
              clsx(
                'block rounded-lg px-3 py-2 text-xs transition-colors border border-transparent',
                isActive ? 'bg-surface-elevated border-border' : 'hover:bg-surface-elevated/50'
              )
            }
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono truncate">{c.allocationGroupId.replace('CASE-', '')}</span>
              <CaseHealthBadge health={c.health} />
            </div>
          </NavLink>
        ))}

        <p className="pt-4 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-text-secondary">Documents</p>
        <NavLink to={`${base}/invoices`} className={navClass}>
          Invoices
        </NavLink>
        <NavLink to={`${base}/payments`} className={navClass}>
          Payments
        </NavLink>
        <NavLink to={`${base}/credit-notes`} className={navClass}>
          Credit Notes
        </NavLink>

        <p className="pt-4 pb-1 px-3 text-[10px] font-black uppercase tracking-wider text-text-secondary">Work queues</p>
        <NavLink to={`${base}/outstanding`} className={navClass}>
          Outstanding
        </NavLink>
        <NavLink to={`${base}/exceptions`} className={navClass}>
          Exceptions
        </NavLink>
      </nav>
    </aside>
  );
}
