import { SupplierCostSnapshot } from '../types/pricingDesk';

export function SupplierCostCard({ snapshot }: { snapshot: SupplierCostSnapshot }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-3">
        Supplier Cost — {snapshot.supplier}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-[11px] text-text-secondary mb-0.5">Guaranteed Cost</p>
          <p className="text-sm font-mono font-bold text-text-primary">R{snapshot.guaranteedCostExVat}/kg</p>
        </div>
        <div>
          <p className="text-[11px] text-text-secondary mb-0.5">Posted Cost</p>
          <p className="text-sm font-mono text-text-secondary">R{snapshot.postedCostExVat}/kg</p>
        </div>
        <div>
          <p className="text-[11px] text-text-secondary mb-0.5">Target Volume</p>
          <p className="text-sm font-mono text-text-secondary">{snapshot.targetVolumeKg.toLocaleString()}kg</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-text-secondary">
        Pricing uses guaranteed cost. Conditional rebate (R{snapshot.conditionalRebateExVat}/kg) is for forecasting only unless explicitly confirmed.
      </p>
    </div>
  );
}
