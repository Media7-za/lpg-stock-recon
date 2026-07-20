import { Link } from 'react-router-dom';
import { useInvestigationContext } from '../context/InvestigationContext';
import { CaseHealthBadge } from './CaseHealthBadge';
import { formatZAR } from '../utils/format';
import { DOCTRINE_LABELS } from '../domains/allocation/labels';
import {
  casePath,
  relationshipPath,
} from '../domains/allocation/routePrefix';

export function WorkspaceContextPanel() {
  const { bundle, selection } = useInvestigationContext();

  if (!selection) {
    return (
      <aside className="w-80 shrink-0 border-l border-border bg-surface p-4">
        <p className="text-xs font-black uppercase tracking-wider text-text-secondary mb-2">
          Workspace Context
        </p>
        <p className="text-sm text-text-secondary">
          Select a case, document, or relationship to inspect evidence and links.
        </p>
      </aside>
    );
  }

  if (selection.kind === 'case') {
    const caseRecord = bundle.cases.find((c) => c.allocationGroupId === selection.caseId);
    if (!caseRecord) return null;
    return (
      <aside className="w-80 shrink-0 border-l border-border bg-surface p-4 overflow-y-auto">
        <p className="text-xs font-black uppercase tracking-wider text-text-secondary mb-2">Case</p>
        <p className="font-mono text-sm font-black text-text-primary mb-2">{caseRecord.allocationGroupId}</p>
        <CaseHealthBadge health={caseRecord.health} />
        <dl className="mt-4 space-y-2 text-sm">
          <div>
            <dt className="text-text-secondary text-xs uppercase">Lifecycle</dt>
            <dd className="text-text-primary">{caseRecord.lifecycle}</dd>
          </div>
          <div>
            <dt className="text-text-secondary text-xs uppercase">Relationships</dt>
            <dd className="text-text-primary">{caseRecord.relationshipIds.length}</dd>
          </div>
          <div>
            <dt className="text-text-secondary text-xs uppercase">Open balance</dt>
            <dd className="font-mono text-text-primary">{formatZAR(caseRecord.openBalance)}</dd>
          </div>
        </dl>
      </aside>
    );
  }

  if (selection.kind === 'invoice') {
    const invoice = bundle.entities.invoices
      ? Object.values(bundle.entities.invoices).find((inv) => inv.docKey === selection.docKey)
      : undefined;
    const rels = bundle.relationships.filter((r) => r.to.docKey === selection.docKey);
    return (
      <aside className="w-80 shrink-0 border-l border-border bg-surface p-4 overflow-y-auto">
        <p className="text-xs font-black uppercase tracking-wider text-text-secondary mb-2">Invoice</p>
        <p className="font-mono text-lg font-black text-text-primary">{selection.docKey}</p>
        {invoice && (
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-text-secondary text-xs uppercase">Date</dt>
              <dd>{invoice.txDate}</dd>
            </div>
            <div>
              <dt className="text-text-secondary text-xs uppercase">Amount incl</dt>
              <dd className="font-mono">{formatZAR(invoice.amountIncl)}</dd>
            </div>
          </dl>
        )}
        <p className="mt-4 text-xs font-black uppercase text-text-secondary">Incoming payments ({rels.length})</p>
        <ul className="mt-2 space-y-1">
          {rels.slice(0, 6).map((rel) => (
            <li key={rel.id}>
              <Link
                to={relationshipPath(bundle.debtorCode, rel.id)}
                className="text-sm text-sky-400 hover:underline"
              >
                {rel.from.docKey} · {formatZAR(rel.amount)}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          to={casePath(bundle.debtorCode, `CASE-INV${selection.docKey}`)}
          className="mt-4 inline-block text-xs text-text-secondary hover:text-text-primary"
        >
          Open CASE-INV{selection.docKey}
        </Link>
      </aside>
    );
  }

  if (selection.kind === 'payment') {
    const payment = Object.values(bundle.entities.payments).find((p) => p.docKey === selection.docKey);
    const rels = bundle.relationships.filter((r) => r.from.docKey === selection.docKey);
    return (
      <aside className="w-80 shrink-0 border-l border-border bg-surface p-4 overflow-y-auto">
        <p className="text-xs font-black uppercase tracking-wider text-text-secondary mb-2">Payment</p>
        <p className="font-mono text-lg font-black text-text-primary">{selection.docKey}</p>
        {payment && (
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-text-secondary text-xs uppercase">Date</dt>
              <dd>{payment.paymentDate}</dd>
            </div>
            <div>
              <dt className="text-text-secondary text-xs uppercase">STAT</dt>
              <dd>{payment.statNo || '—'}</dd>
            </div>
            <div>
              <dt className="text-text-secondary text-xs uppercase">Total</dt>
              <dd className="font-mono">{formatZAR(payment.totalAmount)}</dd>
            </div>
          </dl>
        )}
        <Link
          to={casePath(bundle.debtorCode, `CASE-PMT${selection.docKey}`)}
          className="mt-4 inline-block text-xs text-text-secondary hover:text-text-primary"
        >
          Open CASE-PMT{selection.docKey}
        </Link>
        <p className="mt-4 text-xs font-black uppercase text-text-secondary">Slices ({rels.length})</p>
      </aside>
    );
  }

  if (selection.kind === 'relationship') {
    const rel = bundle.relationships.find((r) => r.id === selection.relationshipId);
    if (!rel) return null;
    return (
      <aside className="w-80 shrink-0 border-l border-border bg-surface p-4 overflow-y-auto">
        <p className="text-xs font-black uppercase tracking-wider text-text-secondary mb-2">Relationship</p>
        <p className="font-mono text-sm font-black text-text-primary">{rel.sourceEdgeId}</p>
        <p className="mt-2 text-sm text-text-secondary">
          {rel.from.docKey} → {rel.to.docKey || '—'}
        </p>
        <p className="mt-1 font-mono text-text-primary">{formatZAR(rel.amount)}</p>
        <p className="mt-3 text-xs text-text-secondary">{DOCTRINE_LABELS[rel.doctrine] ?? rel.doctrine}</p>
        <div className="mt-4 space-y-3">
          {rel.evidence.map((item, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-surface-elevated p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase text-text-secondary">{item.type}</span>
                <span className="text-xs font-black">{item.result}</span>
              </div>
              {item.detail && <p className="mt-2 text-xs text-text-secondary">{item.detail}</p>}
              <p className="mt-2 text-[10px] text-text-secondary/80">
                {item.provenance.source}
                {item.provenance.column ? ` · ${item.provenance.column}` : ''}
              </p>
              <p className="text-[10px] text-text-secondary/80">{item.provenance.derivedBy}</p>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return null;
}
