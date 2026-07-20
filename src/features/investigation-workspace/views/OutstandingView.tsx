import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useInvestigationContext } from '../context/InvestigationContext';
import { formatZAR } from '../utils/format';
import { casePath, invoicePath } from '../domains/allocation/routePrefix';

export function OutstandingView() {
  const { bundle, setSelection } = useInvestigationContext();

  useEffect(() => {
    setSelection(null);
  }, [setSelection]);

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-2xl font-black text-text-primary">Outstanding</h1>
      <p className="text-sm text-text-secondary">
        {bundle.views.outstanding.length} invoices · {formatZAR(bundle.views.summary.outstandingAmount)}
      </p>
      <div className="space-y-2">
        {bundle.views.outstanding.map((row) => (
          <div key={row.invoiceDocKey} className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
            <div>
              <Link to={invoicePath(bundle.debtorCode, row.invoiceDocKey)} className="font-mono font-black text-sky-400 hover:underline">
                {row.invoiceDocKey}
              </Link>
              <p className="text-xs text-text-secondary">{row.txDate}</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-black">{formatZAR(row.engineOpen)}</p>
              <Link to={casePath(bundle.debtorCode, row.caseId)} className="text-[10px] text-text-secondary hover:text-text-primary">
                {row.caseId}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
