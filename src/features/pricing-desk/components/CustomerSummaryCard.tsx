import { CommercialStatus, CustomerCommercialContext, CustomerLane } from '../types/pricingDesk';

function formatLane(lane: CustomerLane): string {
  return lane.replace(/_/g, ' ');
}

function formatStatus(status: CommercialStatus): string {
  return status.replace(/_/g, ' ');
}

interface CustomerSummaryCardProps {
  customerName: string;
  customerLane: CustomerLane;
  commercialStatus: CommercialStatus;
  context: CustomerCommercialContext;
}

export function CustomerSummaryCard({ customerName, customerLane, commercialStatus, context }: CustomerSummaryCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <h2 className="text-base font-black text-text-primary">{customerName}</h2>
        <span className="text-[11px] font-black uppercase tracking-wider bg-surface-elevated text-text-secondary px-2 py-0.5 rounded capitalize">
          {formatLane(customerLane)}
        </span>
        <span className="text-[11px] font-black uppercase tracking-wider bg-surface-elevated text-amber-400 px-2 py-0.5 rounded capitalize">
          {formatStatus(commercialStatus)}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-0.5">Last Purchase</p>
          <p className="text-sm font-bold text-text-primary">{context.lastPurchaseDate ?? '—'}</p>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-0.5">Last Price Paid</p>
          <p className="text-sm font-mono font-bold text-text-primary">
            {context.lastPricePerKgInclVat ? `R${context.lastPricePerKgInclVat}/kg` : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-0.5">Avg Order</p>
          <p className="text-sm font-mono font-bold text-text-primary">
            {context.averageOrderKg ? `${context.averageOrderKg}kg` : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-0.5">Avg Net Contribution</p>
          <p className="text-sm font-mono font-bold text-text-primary">
            {context.averageNetContributionPerOrder ? `R${context.averageNetContributionPerOrder}` : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-0.5">Churn Risk</p>
          <p className="text-sm font-bold text-text-primary capitalize">{context.churnRisk ?? '—'}</p>
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-0.5">Purchase Rhythm</p>
          <p className="text-sm text-text-primary">{context.purchaseRhythm ?? '—'}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-1">Previous Decisions</p>
        {context.previousDecisionSummaries.length === 0 ? (
          <p className="text-sm text-text-secondary">No previous commercial decisions on record.</p>
        ) : (
          <ul className="text-sm text-text-primary list-disc list-inside space-y-0.5">
            {context.previousDecisionSummaries.map((summary, i) => (
              <li key={i}>{summary}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
