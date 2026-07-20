import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useInvestigationContext } from '../context/InvestigationContext';
import { CaseHealthBadge } from '../components/CaseHealthBadge';
import { formatZAR } from '../utils/format';
import { casePath, relationshipPath } from '../domains/allocation/routePrefix';

export function HomeView() {
  const { bundle, setSelection } = useInvestigationContext();
  const { summary, recentRelationships, recentCases, needsReviewCases, largestOutstanding, timelineBuckets } =
    bundle.views;

  useEffect(() => {
    setSelection(null);
  }, [setSelection]);

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-black text-text-primary">Home</h1>
        <p className="text-sm text-text-secondary mt-1">
          Allocation investigation · compiled {new Date(bundle.generatedAt).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ['Relationships', summary.relationshipCount],
          ['Cases', summary.caseCount],
          ['Outstanding', summary.outstandingCount],
          ['Exceptions', summary.exceptionCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-4">
            <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary">{label}</p>
            <p className="mt-1 text-2xl font-black font-mono text-text-primary">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-2">Outstanding exposure</p>
        <p className="font-mono text-xl font-black text-text-primary">{formatZAR(summary.outstandingAmount)}</p>
      </div>

      <section>
        <h2 className="text-sm font-black uppercase tracking-wider text-text-secondary mb-3">Needs review</h2>
        <div className="space-y-2">
          {needsReviewCases.slice(0, 6).map((c) => (
            <Link
              key={c.allocationGroupId}
              to={casePath(bundle.debtorCode, c.allocationGroupId)}
              className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3 hover:border-border/60"
            >
              <span className="font-mono text-sm">{c.allocationGroupId}</span>
              <CaseHealthBadge health={c.health} />
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-black uppercase tracking-wider text-text-secondary mb-3">Recent relationships</h2>
        <div className="space-y-2">
          {recentRelationships.map((rel) => (
            <Link
              key={rel.id}
              to={relationshipPath(bundle.debtorCode, rel.id)}
              className="block rounded-lg border border-border bg-surface px-4 py-3 hover:border-border/60"
            >
              <div className="flex justify-between gap-4 text-sm">
                <span>
                  {rel.fromDocKey} → {rel.toDocKey || '—'}
                </span>
                <span className="font-mono">{formatZAR(rel.amount)}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1">{rel.paymentDate} · {rel.allocationType}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-black uppercase tracking-wider text-text-secondary mb-3">Largest outstanding</h2>
        <div className="space-y-2">
          {largestOutstanding.map((row) => (
            <Link
              key={row.invoiceDocKey}
              to={casePath(bundle.debtorCode, row.caseId)}
              className="flex justify-between rounded-lg border border-border bg-surface px-4 py-3 hover:border-border/60"
            >
              <span className="font-mono">{row.invoiceDocKey}</span>
              <span className="font-mono">{formatZAR(row.engineOpen)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-black uppercase tracking-wider text-text-secondary mb-3">Timeline</h2>
        <div className="flex flex-wrap gap-2">
          {timelineBuckets.slice(-12).map((bucket) => (
            <div key={bucket.period} className="rounded-lg border border-border bg-surface px-3 py-2 text-xs">
              <span className="font-black">{bucket.period}</span>
              <span className="text-text-secondary ml-2">{bucket.edgeCount} edges</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-black uppercase tracking-wider text-text-secondary mb-3">Recent cases</h2>
        <div className="grid md:grid-cols-2 gap-2">
          {recentCases.map((c) => (
            <Link
              key={c.allocationGroupId}
              to={casePath(bundle.debtorCode, c.allocationGroupId)}
              className="rounded-lg border border-border bg-surface px-4 py-3 hover:border-border/60"
            >
              <div className="flex justify-between items-start gap-2">
                <span className="font-mono text-sm">{c.allocationGroupId}</span>
                <CaseHealthBadge health={c.health} />
              </div>
              <p className="text-xs text-text-secondary mt-1">{c.relationshipCount} relationships</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
