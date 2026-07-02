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
  | 'superseded';

export interface CustomerRecord {
  customerCode: string;
  customerName: string;
  erpAccountCodes: string[];
  customerLane: CustomerLane;
  commercialStatus: CommercialStatus;
  primaryContact?: string;
}

export interface CustomerCommercialContext {
  lastPurchaseDate?: string;
  lastPricePerKgInclVat?: number;
  averageOrderKg?: number;
  averageNetContributionPerOrder?: number;
  churnRisk?: 'low' | 'medium' | 'high';
  purchaseRhythm?: string;
  previousDecisionSummaries: string[];
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
  customerCode: string;
  customerName: string;
  customerLane: CustomerLane;
  commercialStatus: CommercialStatus;
  state: DecisionState;
  approvedPricePerKg: number;
  decisionReason: string;
  orderLines: OrderLine[];
  createdAt: string;
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
