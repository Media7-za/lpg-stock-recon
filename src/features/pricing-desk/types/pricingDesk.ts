export type CustomerLane =
  | 'commodity_wholesale'
  | 'standard_wholesale'
  | 'consuming_customer'
  | 'relationship_account'
  | 'strategic_account';

export type CommercialStatus =
  | 'new_prospect'
  | 'active_customer'
  | 'dormant_customer'
  | 'win_back'
  | 'churn_risk'
  | 'lost';

export type DeliveryOrCollection = 'delivery' | 'collection';

export type DecisionState =
  | 'draft'
  | 'recommended'
  | 'approved'
  | 'quoted'
  | 'won'
  | 'lost'
  | 'expired'
  | 'superseded'
  | 'withdrawn';

export interface CustomerRecord {
  customerCode: string;
  customerName: string;
  erpAccountCodes: string[];
  customerLane: CustomerLane;
  commercialStatus: CommercialStatus;
  primaryContact?: string;
}

// Mirrors the real output of the get_customer_commercial_context() Postgres
// function (Phase 3A, lpg-stock-recon). Every field is nullable because the
// API returns null/"unknown" rather than a guessed value wherever it can't
// infer something — see COMMERCIAL_ANALYTICS.md's guardrails.
export interface CustomerCommercialContext {
  customer: {
    id: string;
    code: string;
    erpAccounts: string[];
    name: string;
    lane: CustomerLane | null;
    commercialStatus: CommercialStatus | null;
  };
  purchaseHistory: {
    lastPurchaseDate: string | null;
    daysSinceLastPurchase: number | null;
    averageDaysBetweenOrders: number | null;
    purchaseFrequency: string | null;
    annualVolumeKg: number | null;
  };
  pricing: {
    lastPricePerKgExVat: number | null;
    averagePricePerKg3m: number | null;
    averagePricePerKg6m: number | null;
    averagePricePerKg12m: number | null;
    highestPricePerKg: number | null;
    lowestPricePerKg: number | null;
  };
  averageOrder: {
    averageOrderKg: number | null;
    averageOrderValueExVat: number | null;
    averageGrossProfit: number | null;
    averageDeliveryCost: number | null;
    averageNetContribution: number | null;
  };
  commercialProfile: {
    buyingCycle: string | null;
    expectedReorderDate: string | null;
    commercialRating: string | null;
    lifetimeContribution: number | null;
  };
  risk: {
    churnRisk: string | null;
    reorderStatus: string | null;
    lastOrderGap: number | null;
  };
  classification: {
    lpgSkusIncluded: string[];
    excludedSkuClasses: string[];
    confidence: string | null;
  };
  dataFreshness: {
    source: string;
    refreshedAt: string;
  };
}

export interface OrderLine {
  description: string;
  qty: number;
  kgPerUnit: number;
}

export interface PricingIntake {
  customerCode: string;
  customerName: string;
  customerLane: CustomerLane | null;
  commercialStatus: CommercialStatus | null;
  deliveryOrCollection: DeliveryOrCollection | null;
  roundTripKm: number | null;
  orderLines: OrderLine[];
  competitorReference: string | null;
  notes: string | null;
}

export interface DeliveryEconomics {
  roundTripKm: number;
  totalLpgKg: number;
  recommendedVehicle: string;
  fuelCostPerKm: number;
  estimatedFuelCost: number;
}

export interface SupplierCostSnapshot {
  supplier: string;
  postedCostExVat: number;
  firmRebateExVat: number;
  guaranteedCostExVat: number;
  conditionalRebateExVat: number;
  targetVolumeKg: number;
  monthPosture: boolean;
}

export interface MarketObservation {
  observedAt: string;
  competitorName: string;
  pricePerKgInclVat: number;
  segment: string;
  notes?: string;
}

export interface PricingRecommendation {
  floorPricePerKg: number;
  targetPricePerKg: number;
  stretchPricePerKg: number;
  recommendedPricePerKg: number;
  reasoning: string[];
  illustrative: boolean;
}

export interface CommercialDecisionRecord {
  decisionId: string;
  decisionCode: string | null;
  previousDecisionId: string | null;
  customerCode: string;
  customerName: string;
  customerLane: CustomerLane;
  commercialStatus: CommercialStatus;
  state: DecisionState;
  approvedPricePerKg: number;
  approvedBy: string | null;
  decisionReason: string;
  orderLines: OrderLine[];
  pricingIntakeSnapshot: PricingIntake;
  customerContextSnapshot: CustomerCommercialContext | null;
  deliveryEconomicsSnapshot: DeliveryEconomics | null;
  supplierCostSnapshot: SupplierCostSnapshot;
  marketContextSnapshot: MarketObservation[] | null;
  createdAt: string;
  approvedAt: string | null;
  quotedAt: string | null;
}

export interface CreateCommercialDecisionRecordInput {
  customerCode: string;
  customerName: string;
  customerLane: CustomerLane;
  commercialStatus: CommercialStatus;
  approvedPricePerKg: number;
  approvedBy: string | null;
  decisionReason: string;
  pricingIntakeSnapshot: PricingIntake;
  customerContextSnapshot: CustomerCommercialContext | null;
  deliveryEconomicsSnapshot: DeliveryEconomics | null;
  supplierCostSnapshot: SupplierCostSnapshot;
  marketContextSnapshot: MarketObservation[] | null;
  previousDecisionId?: string | null;
}

export interface MobileProformaLine {
  description: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface MobileProforma {
  decisionId: string;
  customer: string;
  contact?: string;
  pricePerKg: number;
  items: MobileProformaLine[];
  totalPayable: number;
  createdAt: string;
}
