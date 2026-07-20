import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useInvestigationContext } from '../context/InvestigationContext';
import { docKeyFromParam, formatZAR } from '../utils/format';
import { casePath, relationshipPath } from '../domains/allocation/routePrefix';

export function InvoiceDetailView() {
  const { doc } = useParams<{ doc: string }>();
  const docKey = docKeyFromParam(doc);
  const { bundle, setSelection } = useInvestigationContext();
  const invoice = Object.values(bundle.entities.invoices).find((inv) => inv.docKey === docKey);
  const rels = bundle.relationships.filter((r) => r.to.docKey === docKey);
  const outstanding = bundle.views.outstanding.find((row) => row.invoiceDocKey === docKey);

  useEffect(() => {
    if (docKey) setSelection({ kind: 'invoice', docKey });
  }, [docKey, setSelection]);

  if (!invoice) {
    return <p className="text-text-secondary">Invoice {docKey} not found in bundle.</p>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-black uppercase text-text-secondary">Invoice</p>
        <h1 className="text-2xl font-black font-mono text-text-primary">{docKey}</h1>
        <p className="text-sm text-text-secondary">{invoice.txDate} · {invoice.lanes.join(', ')}</p>
      </div>

      <dl className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-[11px] font-black uppercase text-text-secondary">Amount incl</dt>
          <dd className="font-mono font-black">{formatZAR(invoice.amountIncl)}</dd>
        </div>
        {outstanding && (
          <div className="rounded-xl border border-border bg-surface p-4">
            <dt className="text-[11px] font-black uppercase text-text-secondary">Engine open</dt>
            <dd className="font-mono font-black">{formatZAR(outstanding.engineOpen)}</dd>
          </div>
        )}
      </dl>

      <Link to={casePath(bundle.debtorCode, `CASE-INV${docKey}`)} className="text-sm text-sky-400 hover:underline">
        Open CASE-INV{docKey}
      </Link>

      <section>
        <h2 className="text-sm font-black uppercase text-text-secondary mb-3">Allocations ({rels.length})</h2>
        <div className="space-y-2">
          {rels.map((rel) => (
            <Link
              key={rel.id}
              to={relationshipPath(bundle.debtorCode, rel.id)}
              className="block rounded-lg border border-border bg-surface px-4 py-3 hover:border-border/60"
            >
              <div className="flex justify-between text-sm">
                <span>{rel.from.docKey}</span>
                <span className="font-mono">{formatZAR(rel.amount)}</span>
              </div>
              <p className="text-xs text-text-secondary">{rel.allocationType}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
