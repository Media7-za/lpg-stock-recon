import { MarketObservation } from '../types/pricingDesk';

export function MarketContextCard({ observations }: { observations: MarketObservation[] }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-3">Market Context</h3>
      {observations.length === 0 ? (
        <p className="text-sm text-text-secondary">No recent market observations.</p>
      ) : (
        <div className="space-y-2">
          {observations.map((obs, i) => (
            <div key={i} className="flex items-baseline justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-text-primary">{obs.competitorName}</p>
                <p className="text-xs text-text-secondary">{obs.observedAt} — {obs.segment.replace(/_/g, ' ')}</p>
              </div>
              <p className="text-sm font-mono font-bold text-text-primary">R{obs.pricePerKgInclVat}/kg</p>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-text-secondary">Market price is context only, not an automatic matching instruction.</p>
    </div>
  );
}
