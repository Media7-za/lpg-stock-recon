import { useParams } from 'react-router-dom';
import { useInvestigationContext } from '../context/InvestigationContext';
import { docKeyFromParam, formatZAR } from '../utils/format';

export function CreditNoteDetailView() {
  const { doc } = useParams<{ doc: string }>();
  const docKey = docKeyFromParam(doc);
  const { bundle } = useInvestigationContext();
  const cn = Object.values(bundle.entities.creditNotes).find((item) => item.docKey === docKey);

  if (!cn) {
    return <p className="text-text-secondary">Credit note {docKey} not found.</p>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-xs font-black uppercase text-text-secondary">Credit Note</p>
        <h1 className="text-2xl font-black font-mono text-text-primary">{docKey}</h1>
        <p className="text-sm text-text-secondary">{cn.txDate}</p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <p className="text-[11px] font-black uppercase text-text-secondary">Amount incl</p>
        <p className="font-mono font-black text-lg">{formatZAR(cn.amountIncl)}</p>
      </div>
    </div>
  );
}
