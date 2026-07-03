import {
  CustomerRecord,
  DeliveryEconomics,
  MarketObservation,
  OrderLine,
  PricingIntake,
  PricingRecommendation,
  SupplierCostSnapshot,
} from '../../types/pricingDesk';

// Sourced from lpg-intelligence doctrine (Oryx supplier record, June 2026 cost basis).
export const SUPPLIER_COST_SNAPSHOT: SupplierCostSnapshot = {
  supplier: 'Oryx',
  postedCostExVat: 24.64086,
  firmRebateExVat: 1.0,
  guaranteedCostExVat: 23.64086,
  conditionalRebateExVat: 0.5,
  targetVolumeKg: 30000,
  monthPosture: true,
};

// Sourced from lpg-intelligence market signal register / UX_WORKSPACES.md example card.
export const MARKET_OBSERVATIONS: MarketObservation[] = [
  {
    observedAt: '2026-06-09',
    competitorName: 'Phoenix Cash & Carry',
    pricePerKgInclVat: 28.33,
    segment: 'commodity_wholesale',
    notes: 'Wholesale reference only — not an automatic price match instruction.',
  },
];

// Note: this bundle no longer carries a `context` field. Customer
// commercial context now comes live from get_customer_commercial_context()
// (Phase 3A, src/features/pricing-desk/lib/customerContextRepository.ts) --
// see docs/Pricing-Desk-Phase-3-Context-API/App-Integration-Slice-Scope.md.
// `intake`, `delivery`, and `recommendation` remain fixture-driven; none of
// those are provided by that API.
export interface PricingDeskFixtureBundle {
  customer: CustomerRecord;
  intake: PricingIntake;
  delivery: DeliveryEconomics;
  recommendation: PricingRecommendation;
}

function totalKg(lines: OrderLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty * line.kgPerUnit, 0);
}

function recommendedVehicleFor(kg: number): { vehicle: string; ratePerKm: number } {
  return kg <= 500
    ? { vehicle: 'CS70HKZN', ratePerKm: 3.66 }
    : { vehicle: 'CS70HMZN', ratePerKm: 5.67 };
}

function deliveryEconomicsFor(roundTripKm: number, lines: OrderLine[]): DeliveryEconomics {
  const kg = totalKg(lines);
  const { vehicle, ratePerKm } = recommendedVehicleFor(kg);
  return {
    roundTripKm,
    totalLpgKg: kg,
    recommendedVehicle: vehicle,
    fuelCostPerKm: ratePerKm,
    estimatedFuelCost: Number((roundTripKm * ratePerKm).toFixed(2)),
  };
}

const TAN002_ORDER_LINES: OrderLine[] = [{ description: '48kg Cylinder', qty: 2, kgPerUnit: 48 }];

const TAN002: PricingDeskFixtureBundle = {
  customer: {
    customerCode: 'TAN002',
    customerName: 'Tandoor The Clay Oven',
    erpAccountCodes: ['TAN002'],
    customerLane: 'consuming_customer',
    commercialStatus: 'win_back',
    primaryContact: undefined,
  },
  intake: {
    customerCode: 'TAN002',
    customerName: 'Tandoor The Clay Oven',
    customerLane: 'consuming_customer',
    commercialStatus: 'win_back',
    deliveryOrCollection: 'delivery',
    roundTripKm: 17,
    orderLines: TAN002_ORDER_LINES,
    competitorReference: null,
    notes: null,
  },
  delivery: deliveryEconomicsFor(17, TAN002_ORDER_LINES),
  // Recommendation figures below are the doctrine example from
  // lpg-intelligence PRD_SLICE_002_COMMERCIAL_DECISION_RECORDS.md (CDR-2026-00017),
  // reused here as fixed illustrative reference values for the Phase 1 shell.
  recommendation: {
    floorPricePerKg: 29.5,
    targetPricePerKg: 30.5,
    stretchPricePerKg: 31.5,
    recommendedPricePerKg: 30.5,
    reasoning: [
      'Month posture does not apply — consuming customer lane, win-back status.',
      'Guaranteed supplier cost basis used: R23.64086/kg excl VAT (conditional rebate excluded).',
      'Objective is reliable supply and retention, not month-end volume.',
      'Reference values from prior win-back decision doctrine (CDR-2026-00017).',
    ],
    illustrative: true,
  },
};

const SIYAYA_ORDER_LINES: OrderLine[] = [
  { description: '9kg Cylinder', qty: 50, kgPerUnit: 9 },
  { description: '48kg Cylinder (DV)', qty: 10, kgPerUnit: 48 },
];

const SIYAYA: PricingDeskFixtureBundle = {
  customer: {
    customerCode: 'SIY000',
    customerName: 'Siyaya Cash & Carry',
    erpAccountCodes: ['SIY000'],
    customerLane: 'commodity_wholesale',
    commercialStatus: 'active_customer',
    primaryContact: 'Imtiaas',
  },
  intake: {
    customerCode: 'SIY000',
    customerName: 'Siyaya Cash & Carry',
    customerLane: 'commodity_wholesale',
    commercialStatus: 'active_customer',
    deliveryOrCollection: 'delivery',
    roundTripKm: 10,
    orderLines: SIYAYA_ORDER_LINES,
    competitorReference: 'Phoenix Cash & Carry R28.33/kg',
    notes: null,
  },
  delivery: deliveryEconomicsFor(10, SIYAYA_ORDER_LINES),
  // Sourced from lpg-intelligence UX_WORKSPACES.md activity feed example
  // (accepted R29.00/kg vs Phoenix reference R28.33/kg, 930kg won).
  recommendation: {
    floorPricePerKg: 27.5,
    targetPricePerKg: 29.0,
    stretchPricePerKg: 30.0,
    recommendedPricePerKg: 29.0,
    reasoning: [
      'Month posture applies — commodity wholesale lane, 30,000kg monthly target.',
      'Guaranteed supplier cost basis used: R23.64086/kg excl VAT.',
      'Phoenix Cash & Carry reference of R28.33/kg is context only, not an automatic match.',
      'Delivery economics calculated for 930kg total across 9kg and 48kg DV lines.',
    ],
    illustrative: true,
  },
};

export const PRICING_DESK_FIXTURES: Record<string, PricingDeskFixtureBundle> = {
  TAN002: TAN002,
  SIY000: SIYAYA,
};

export function getFixtureBundle(customerCode: string): PricingDeskFixtureBundle | null {
  return PRICING_DESK_FIXTURES[customerCode.toUpperCase()] ?? null;
}

export function listFixtureCustomers(): CustomerRecord[] {
  return Object.values(PRICING_DESK_FIXTURES).map((bundle) => bundle.customer);
}
