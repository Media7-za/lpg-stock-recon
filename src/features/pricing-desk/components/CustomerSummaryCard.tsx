import { CommercialStatus, CustomerCommercialContext, CustomerLane } from '../types/pricingDesk';

export type CustomerContextStatus = 'loading' | 'error' | 'not_found' | 'ready';

function formatLane(lane: CustomerLane): string {
  return lane.replace(/_/g, ' ');
}

function formatStatus(status: CommercialStatus): string {
  return status.replace(/_/g, ' ');
}

function formatMoney(value: number | null): string {
  return value !== null ? `R${value}` : '—';
}

interface CustomerSummaryCardProps {
  customerName: string;
  customerLane: CustomerLane | null;
  commercialStatus: CommercialStatus | null;
  status: CustomerContextStatus;
  context: CustomerCommercialContext | null;
}

function Skeleton() {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 animate-pulse">
      <div className="h-4 w-40 bg-surface-elevated rounded mb-3" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="h-2.5 w-16 bg-surface-elevated rounded mb-2" />
            <div className="h-3.5 w-12 bg-surface-elevated rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CustomerSummaryCard({ customerName, customerLane, commercialStatus, status, context }: CustomerSummaryCardProps) {
  if (status === 'loading') {
    return <Skeleton />;
  }

  if (status === 'error') {
    return (
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
        <p className="text-sm font-bold text-amber-400 mb-1">Couldn't load customer commercial context</p>
        <p className="text-xs text-text-secondary">
          The lookup failed — you can still continue the quote manually. Retry by reselecting the customer.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <h2 className="text-base font-black text-text-primary">{customerName}</h2>
        {customerLane && (
          <span className="text-[11px] font-black uppercase tracking-wider bg-surface-elevated text-text-secondary px-2 py-0.5 rounded capitalize">
            {formatLane(customerLane)}
          </span>
        )}
        {commercialStatus && (
          <span className="text-[11px] font-black uppercase tracking-wider bg-surface-elevated text-amber-400 px-2 py-0.5 rounded capitalize">
            {formatStatus(commercialStatus)}
          </span>
        )}
      </div>

      {status === 'not_found' || !context ? (
        <p className="text-sm text-text-secondary">No commercial history found for this customer yet.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-0.5">Last Purchase</p>
              <p className="text-sm font-bold text-text-primary">{context.purchaseHistory.lastPurchaseDate ?? '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-0.5">Last Price Paid</p>
              <p className="text-sm font-mono font-bold text-text-primary">
                {context.pricing.lastPricePerKgExVat !== null ? `R${context.pricing.lastPricePerKgExVat}/kg` : '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-0.5">Avg Order</p>
              <p className="text-sm font-mono font-bold text-text-primary">
                {context.averageOrder.averageOrderKg !== null ? `${context.averageOrder.averageOrderKg}kg` : '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-0.5">Avg Net Contribution</p>
              <p className="text-sm font-mono font-bold text-text-primary">
                {formatMoney(context.averageOrder.averageNetContribution)}
                {context.averageOrder.averageNetContribution === null && (
                  <span className="block text-[10px] font-normal text-text-secondary normal-case">not yet available</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-0.5">Buying Cycle</p>
              <p className="text-sm font-bold text-text-primary capitalize">
                {context.commercialProfile.buyingCycle?.replace(/_/g, ' ') ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-0.5">Days Since Last Order</p>
              <p className="text-sm text-text-primary">{context.purchaseHistory.daysSinceLastPurchase ?? '—'}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-text-secondary">
            <span>Confidence: <span className="text-text-primary capitalize">{context.classification.confidence ?? 'unknown'}</span></span>
            <span>Source refreshed: {new Date(context.dataFreshness.refreshedAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</span>
          </div>
        </>
      )}
    </div>
  );
}
