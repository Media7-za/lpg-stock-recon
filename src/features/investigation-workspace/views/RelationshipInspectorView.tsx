import { Link, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useInvestigationContext } from '../context/InvestigationContext';
import { formatZAR } from '../utils/format';
import { casePath, invoicePath, paymentPath } from '../domains/allocation/routePrefix';
import { DOCTRINE_LABELS } from '../domains/allocation/labels';

export function RelationshipInspectorView() {
  const { relationshipId } = useParams<{ relationshipId: string }>();
  const { bundle, setSelection } = useInvestigationContext();
  const rel = bundle.relationships.find((r) => r.id === decodeURIComponent(relationshipId ?? ''));

  useEffect(() => {
    if (rel) setSelection({ kind: 'relationship', relationshipId: rel.id });
  }, [rel, setSelection]);

  if (!rel) {
    return <p className="text-text-secondary">Relationship not found.</p>;
  }

  const caseRecord = bundle.cases.find((c) => c.relationshipIds.includes(rel.id));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-black uppercase text-text-secondary">Relationship Inspector</p>
        <h1 className="text-2xl font-black font-mono text-text-primary">{rel.sourceEdgeId}</h1>
        <p className="text-sm text-text-secondary mt-1">{rel.id}</p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4 space-y-2 text-sm">
        <p>
          <Link to={paymentPath(bundle.debtorCode, rel.from.docKey)} className="text-sky-400 hover:underline">
            Payment {rel.from.docKey}
          </Link>
          {' → '}
          {rel.to.docKey ? (
            <Link to={invoicePath(bundle.debtorCode, rel.to.docKey)} className="text-sky-400 hover:underline">
              Invoice {rel.to.docKey}
            </Link>
          ) : (
            '—'
          )}
        </p>
        <p className="font-mono text-lg font-black">{formatZAR(rel.amount)}</p>
        <p>{DOCTRINE_LABELS[rel.doctrine] ?? rel.doctrine} · {rel.allocationType}</p>
        <p className="text-text-secondary">{rel.paymentDate} · {rel.statNo || rel.batchRef || '—'}</p>
        {caseRecord && (
          <Link to={casePath(bundle.debtorCode, caseRecord.allocationGroupId)} className="text-sky-400 hover:underline text-xs">
            {caseRecord.allocationGroupId}
          </Link>
        )}
      </div>

      <section>
        <h2 className="text-sm font-black uppercase text-text-secondary mb-3">Evidence</h2>
        <div className="space-y-3">
          {rel.evidence.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase">{item.type}</span>
                <span className="font-black text-sm">{item.result}</span>
              </div>
              {item.detail && <p className="mt-2 text-sm text-text-secondary">{item.detail}</p>}
              <div className="mt-3 pt-3 border-t border-border text-[11px] text-text-secondary space-y-1">
                <p>Source: {item.provenance.source}{item.provenance.column ? ` · ${item.provenance.column}` : ''}</p>
                <p>Derived by: {item.provenance.derivedBy}</p>
                {item.provenance.runner && <p>Runner: {item.provenance.runner}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-sm text-text-secondary">{rel.notes}</p>
    </div>
  );
}
