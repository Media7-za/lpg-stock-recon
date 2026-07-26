import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useDebtorList } from '../hooks/useDebtorWorkspace';
import { StatusBadge } from './StatusBadge';
import { probeKnowledgeBundle } from '../../investigation-workspace';

function formatZAR(value: number): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value < 0 ? `R-${formatted}` : `R${formatted}`;
}

function formatPeriod(from: string, to: string): string {
  const fmt = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' });
  };
  return `${fmt(from)} – ${fmt(to)}`;
}

export function DebtorListView() {
  const debtors = useDebtorList();
  const navigate = useNavigate();
  const [investigationReady, setInvestigationReady] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!debtors.length) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        debtors.map(async (d) => [d.debtorCode, await probeKnowledgeBundle(d.debtorCode)] as const)
      );
      if (!cancelled) {
        setInvestigationReady(Object.fromEntries(entries));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debtors]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-text-primary">Debtor Position Workspace</h1>
        <p className="mt-1 text-sm text-text-secondary">
          v4 reconciliation positions — {debtors.length} debtors loaded
        </p>
      </div>

      <div className="space-y-3">
        {debtors.map((debtor) => {
          const cylVar = debtor.reconciliationPosition.cylinderVariance;
          const erpVar = debtor.reconciliationPosition.erpVariance;
          const canInvestigate = investigationReady[debtor.debtorCode];
          return (
            <div
              key={debtor.debtorCode}
              className="w-full bg-surface border border-border rounded-xl p-5 hover:border-border/60 hover:bg-surface-elevated transition-colors"
            >
              <button
                type="button"
                onClick={() => navigate(`/debtors/${debtor.debtorCode}`)}
                className="w-full text-left"
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="font-mono text-xs font-black text-text-secondary bg-surface-elevated px-2 py-0.5 rounded">
                    {debtor.debtorCode}
                  </span>
                  <span className="text-base font-black text-text-primary">{debtor.debtorName}</span>
                  <StatusBadge status={debtor.workspaceStatus} />
                  <span className="ml-auto text-xs text-text-secondary">
                    {formatPeriod(debtor.period.from, debtor.period.to)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-0.5">Total Balance</p>
                    <p className="font-mono font-bold text-text-primary">{formatZAR(debtor.financialPosition.totalDebtorBalance)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-0.5">ERP Variance</p>
                    <p className={`font-mono font-bold ${erpVar === 0 ? 'text-text-secondary' : 'text-amber-400'}`}>
                      {formatZAR(erpVar)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-0.5">Cyl Variance</p>
                    <p className={`font-mono font-bold ${cylVar === 0 ? 'text-text-secondary' : 'text-amber-400'}`}>
                      {formatZAR(cylVar)}
                    </p>
                  </div>
                </div>
              </button>
              {canInvestigate && (
                <button
                  type="button"
                  onClick={() => navigate(`/debtors/${debtor.debtorCode}/investigate`)}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-black text-sky-400 hover:underline"
                >
                  <Search className="w-3 h-3" />
                  Investigate allocation
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
