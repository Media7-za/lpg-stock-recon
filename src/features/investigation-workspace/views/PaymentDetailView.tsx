import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useInvestigationContext } from '../context/InvestigationContext';
import { docKeyFromParam, formatZAR } from '../utils/format';
import { casePath, relationshipPath } from '../domains/allocation/routePrefix';

export function PaymentDetailView() {
  const { doc } = useParams<{ doc: string }>();
  const docKey = docKeyFromParam(doc);
  const { bundle, setSelection } = useInvestigationContext();
  const payment = Object.values(bundle.entities.payments).find((p) => p.docKey === docKey);
  const rels = bundle.relationships.filter((r) => r.from.docKey === docKey);

  useEffect(() => {
    if (docKey) setSelection({ kind: 'payment', docKey });
  }, [docKey, setSelection]);

  if (!payment) {
    return <p className="text-text-secondary">Payment {docKey} not found in bundle.</p>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-black uppercase text-text-secondary">Payment</p>
        <h1 className="text-2xl font-black font-mono text-text-primary">{docKey}</h1>
        <p className="text-sm text-text-secondary">{payment.paymentDate} · {payment.statNo || payment.batchRef || '—'}</p>
      </div>

      <dl className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-[11px] font-black uppercase text-text-secondary">Total</dt>
          <dd className="font-mono font-black">{formatZAR(payment.totalAmount)}</dd>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-[11px] font-black uppercase text-text-secondary">Slices</dt>
          <dd className="font-mono font-black">{payment.sliceCount}</dd>
        </div>
      </dl>

      <Link to={casePath(bundle.debtorCode, `CASE-PMT${docKey}`)} className="text-sm text-sky-400 hover:underline">
        Open CASE-PMT{docKey}
      </Link>

      <section>
        <h2 className="text-sm font-black uppercase text-text-secondary mb-3">Allocation slices</h2>
        <div className="space-y-2">
          {rels.map((rel) => (
            <Link
              key={rel.id}
              to={relationshipPath(bundle.debtorCode, rel.id)}
              className="block rounded-lg border border-border bg-surface px-4 py-3 hover:border-border/60"
            >
              <div className="flex justify-between text-sm">
                <span>{rel.to.docKey || '—'} · {rel.allocationType}</span>
                <span className="font-mono">{formatZAR(rel.amount)}</span>
              </div>
              <p className="text-xs text-text-secondary">{rel.sourceEdgeId}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
