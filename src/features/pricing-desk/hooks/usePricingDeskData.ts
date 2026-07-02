import {
  DeliveryEconomics,
  OrderLine,
  PricingIntake,
  PricingRecommendation,
  SupplierCostSnapshot,
} from '../types/pricingDesk';
import { SUPPLIER_COST_SNAPSHOT, getFixtureBundle } from '../data/fixtures/pricingDeskFixtures';

export function hasMinimumIntake(intake: PricingIntake): boolean {
  const orderKnown = intake.orderLines.length > 0;
  const deliveryKnown =
    intake.deliveryOrCollection === 'collection' ||
    (intake.deliveryOrCollection === 'delivery' && !!intake.roundTripKm);
  return !!(intake.customerName && intake.customerLane && orderKnown && intake.deliveryOrCollection && deliveryKnown);
}

export function missingIntakeFields(intake: PricingIntake): string[] {
  const missing: string[] = [];
  if (!intake.customerName) missing.push('Customer name');
  if (!intake.customerLane) missing.push('Customer lane');
  if (!intake.commercialStatus) missing.push('Commercial status');
  if (!intake.deliveryOrCollection) missing.push('Delivery or collection');
  if (intake.deliveryOrCollection === 'delivery' && !intake.roundTripKm) {
    missing.push('Round-trip distance');
  }
  if (intake.orderLines.length === 0) missing.push('Expected order');
  return missing;
}

function totalKg(lines: OrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty * line.kgPerUnit, 0);
}

export function computeDeliveryEconomics(intake: PricingIntake): DeliveryEconomics | null {
  if (intake.deliveryOrCollection !== 'delivery' || !intake.roundTripKm) return null;
  const kg = totalKg(intake.orderLines);
  const { vehicle, ratePerKm } = kg <= 500
    ? { vehicle: 'CS70HKZN', ratePerKm: 3.66 }
    : { vehicle: 'CS70HMZN', ratePerKm: 5.67 };
  return {
    roundTripKm: intake.roundTripKm,
    totalLpgKg: kg,
    recommendedVehicle: vehicle,
    fuelCostPerKm: ratePerKm,
    estimatedFuelCost: Number((intake.roundTripKm * ratePerKm).toFixed(2)),
  };
}

export function getSupplierCostSnapshot(): SupplierCostSnapshot {
  return SUPPLIER_COST_SNAPSHOT;
}

/**
 * Illustrative-only placeholder for the doctrine pricing_strategy skill.
 * Used when no fixture recommendation exists for the entered customer.
 * Not a doctrine-compliant pricing algorithm — Phase 4 replaces this.
 */
export function computeIllustrativeRecommendation(intake: PricingIntake): PricingRecommendation {
  const fixture = getFixtureBundle(intake.customerCode);
  if (fixture) return fixture.recommendation;

  const guaranteedCost = SUPPLIER_COST_SNAPSHOT.guaranteedCostExVat;
  const floor = Number((guaranteedCost * 1.15).toFixed(2));
  const target = Number((guaranteedCost * 1.2).toFixed(2));
  const stretch = Number((guaranteedCost * 1.25).toFixed(2));
  const monthPostureApplies = intake.customerLane === 'commodity_wholesale' || intake.customerLane === 'standard_wholesale';

  return {
    floorPricePerKg: floor,
    targetPricePerKg: target,
    stretchPricePerKg: stretch,
    recommendedPricePerKg: target,
    reasoning: [
      monthPostureApplies
        ? 'Month posture applies by default for this lane.'
        : 'Month posture does not apply by default for this lane.',
      `Guaranteed supplier cost basis used: R${guaranteedCost}/kg excl VAT.`,
      'Illustrative placeholder markup — replace with pricing_strategy skill output in a later phase.',
    ],
    illustrative: true,
  };
}
