import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useInvestigationContext } from '../context/InvestigationContext';
import { casePath, relationshipPath } from '../domains/allocation/routePrefix';

export function ExceptionsView() {
  const { bundle, setSelection } = useInvestigationContext();

  useEffect(() => {
    setSelection(null);
  }, [setSelection]);

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-2xl font-black text-text-primary">Exceptions</h1>
      <p className="text-sm text-text-secondary">{bundle.views.exceptions.length} flagged relationships</p>
      <div className="space-y-2">
        {bundle.views.exceptions.map((ex) => (
          <div
            key={ex.relationshipId}
            className="rounded-lg border border-border bg-surface px-4 py-3"
          >
            <Link
              to={relationshipPath(bundle.debtorCode, ex.relationshipId)}
              className="block hover:opacity-90"
            >
              <div className="flex justify-between text-sm">
                <span className="font-mono">{ex.sourceEdgeId}</span>
                <span className="text-amber-400">{ex.allocationType}</span>
              </div>
              <p className="text-xs text-text-secondary mt-1">
                Payment {ex.paymentDocKey}
                {ex.invoiceDocKey ? ` → Invoice ${ex.invoiceDocKey}` : ''}
              </p>
            </Link>
            {ex.caseId && (
              <Link
                to={casePath(bundle.debtorCode, ex.caseId)}
                className="text-[10px] text-text-secondary hover:text-text-primary mt-2 inline-block"
              >
                {ex.caseId}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
