import { Link } from 'react-router-dom';
import { useInvestigationContext } from '../context/InvestigationContext';
import { formatZAR } from '../utils/format';
import { invoicePath, paymentPath, creditNotePath } from '../domains/allocation/routePrefix';

type DocKind = 'invoices' | 'payments' | 'creditNotes';

const CONFIG: Record<
  DocKind,
  {
    title: string;
    path: (debtorCode: string, docKey: string) => string;
    subtitle: (item: { txDate?: string; paymentDate?: string; amountIncl?: number; totalAmount?: number }) => string;
  }
> = {
  invoices: {
    title: 'Invoices',
    path: invoicePath,
    subtitle: (item) => `${item.txDate ?? '—'} · ${formatZAR(item.amountIncl ?? 0)}`,
  },
  payments: {
    title: 'Payments',
    path: paymentPath,
    subtitle: (item) => `${item.paymentDate ?? '—'} · ${formatZAR(item.totalAmount ?? 0)}`,
  },
  creditNotes: {
    title: 'Credit Notes',
    path: creditNotePath,
    subtitle: (item) => `${item.txDate ?? '—'} · ${formatZAR(item.amountIncl ?? 0)}`,
  },
};

export function DocumentListView({ kind }: { kind: DocKind }) {
  const { bundle } = useInvestigationContext();
  const config = CONFIG[kind];
  const records = Object.values(bundle.entities[kind]).sort((a, b) => {
    const dateA = 'paymentDate' in a ? a.paymentDate : a.txDate;
    const dateB = 'paymentDate' in b ? b.paymentDate : b.txDate;
    return (dateB || '').localeCompare(dateA || '');
  });

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-2xl font-black text-text-primary">{config.title}</h1>
      <p className="text-sm text-text-secondary">{records.length} documents</p>
      <div className="space-y-1 max-h-[70vh] overflow-y-auto">
        {records.map((item) => (
          <Link
            key={item.doc}
            to={config.path(bundle.debtorCode, item.docKey)}
            className="flex justify-between rounded-lg border border-border bg-surface px-4 py-2 hover:border-border/60 text-sm"
          >
            <span className="font-mono font-black">{item.docKey}</span>
            <span className="text-text-secondary">{config.subtitle(item)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
