import { DeliveryEconomics } from '../types/pricingDesk';

export function DeliveryEconomicsCard({ economics }: { economics: DeliveryEconomics }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <h3 className="text-[11px] font-black uppercase tracking-wider text-text-secondary mb-3">Delivery Economics</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <p className="text-[11px] text-text-secondary mb-0.5">Round Trip</p>
          <p className="text-sm font-mono font-bold text-text-primary">{economics.roundTripKm}km</p>
        </div>
        <div>
          <p className="text-[11px] text-text-secondary mb-0.5">Total LPG kg</p>
          <p className="text-sm font-mono font-bold text-text-primary">{economics.totalLpgKg}kg</p>
        </div>
        <div>
          <p className="text-[11px] text-text-secondary mb-0.5">Vehicle</p>
          <p className="text-sm font-mono font-bold text-text-primary">{economics.recommendedVehicle}</p>
        </div>
        <div>
          <p className="text-[11px] text-text-secondary mb-0.5">Est. Fuel Cost</p>
          <p className="text-sm font-mono font-bold text-text-primary">R{economics.estimatedFuelCost}</p>
        </div>
      </div>
    </div>
  );
}
