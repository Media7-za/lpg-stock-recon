import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useInvestigationContext } from '../context/InvestigationContext';
import { CaseHealthBadge } from '../components/CaseHealthBadge';
import { formatZAR } from '../utils/format';
import { relationshipPath, invoicePath, paymentPath } from '../domains/allocation/routePrefix';

export function CaseDetailView() {
  const { allocationGroupId } = useParams<{ allocationGroupId: string }>();
  const { bundle, setSelection } = useInvestigationContext();
  const caseRecord = bundle.cases.find((c) => c.allocationGroupId === allocationGroupId);
  const relationships = bundle.relationships.filter((r) => caseRecord?.relationshipIds.includes(r.id));

  useEffect(() => {
    if (caseRecord) setSelection({ kind: 'case', caseId: caseRecord.allocationGroupId });
  }, [caseRecord, setSelection]);

  if (!caseRecord) {
    return <p className="text-text-secondary">Case not found.</p>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-black uppercase text-text-secondary">Investigation Case</p>
        <h1 className="text-2xl font-black font-mono text-text-primary">{caseRecord.allocationGroupId}</h1>
        <div className="mt-2 flex gap-2 items-center">
          <CaseHealthBadge health={caseRecord.health} />
          <span className="text-xs text-text-secondary capitalize">{caseRecord.lifecycle}</span>
        </div>
      </div>

      <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-[11px] font-black uppercase text-text-secondary">Open</dt>
          <dd className="font-mono font-black">{formatZAR(caseRecord.openBalance)}</dd>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-[11px] font-black uppercase text-text-secondary">Paid</dt>
          <dd className="font-mono font-black">{formatZAR(caseRecord.paidAmount)}</dd>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-[11px] font-black uppercase text-text-secondary">Relationships</dt>
          <dd className="font-mono font-black">{relationships.length}</dd>
        </div>
      </dl>

      {caseRecord.primaryInvoiceDoc && (
        <Link
          to={invoicePath(bundle.debtorCode, caseRecord.primaryInvoiceDoc.replace(/^0+/, '') || '0')}
          className="text-sm text-sky-400 hover:underline"
        >
          Primary invoice {caseRecord.primaryInvoiceDoc.replace(/^0+/, '')}
        </Link>
      )}
      {caseRecord.primaryPaymentDoc && (
        <Link
          to={paymentPath(bundle.debtorCode, caseRecord.primaryPaymentDoc.replace(/^0+/, '') || '0')}
          className="text-sm text-sky-400 hover:underline block"
        >
          Primary payment {caseRecord.primaryPaymentDoc.replace(/^0+/, '')}
        </Link>
      )}

      <section>
        <h2 className="text-sm font-black uppercase text-text-secondary mb-3">Relationships</h2>
        <div className="space-y-2">
          {relationships.map((rel) => (
            <Link
              key={rel.id}
              to={relationshipPath(bundle.debtorCode, rel.id)}
              className="block rounded-lg border border-border bg-surface px-4 py-3 hover:border-border/60"
            >
              <div className="flex justify-between text-sm">
                <span className="font-mono">{rel.sourceEdgeId}</span>
                <span className="font-mono">{formatZAR(rel.amount)}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                {rel.from.docKey} → {rel.to.docKey || '—'} · {rel.allocationType}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
