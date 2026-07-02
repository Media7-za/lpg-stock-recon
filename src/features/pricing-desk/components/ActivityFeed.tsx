import { CommercialDecisionRecord } from '../types/pricingDesk';

function formatCreatedAt(iso: string): string {
  return new Date(iso).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });
}

export function ActivityFeed({ decisions }: { decisions: CommercialDecisionRecord[] }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-3">
        Today's Pricing Decisions
      </h3>
      {decisions.length === 0 ? (
        <p className="text-sm text-text-secondary">No decisions recorded yet this session.</p>
      ) : (
        <div className="space-y-3">
          {decisions.map((decision) => (
            <div key={decision.decisionId} className="border-b border-border last:border-0 pb-3 last:pb-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-black text-text-primary">{decision.customerName}</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-surface-elevated text-text-secondary px-2 py-0.5 rounded">
                  {decision.state}
                </span>
                <span className="ml-auto text-xs text-text-secondary">{formatCreatedAt(decision.createdAt)}</span>
              </div>
              <p className="text-sm font-mono text-text-primary mt-0.5">R{decision.approvedPricePerKg}/kg</p>
              <p className="text-xs text-text-secondary">{decision.decisionReason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
