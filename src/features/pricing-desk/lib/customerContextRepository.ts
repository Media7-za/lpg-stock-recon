import { supabase } from '../../../lib/supabase';
import { CustomerCommercialContext } from '../types/pricingDesk';

// Raw shape returned by the get_customer_commercial_context() Postgres
// function (snake_case JSONB, see lpg-stock-recon's
// docs/Pricing-Desk-Phase-3-Context-API/Phase-3A-Schema-Diff.md).
interface RawContextResponse {
  error?: string;
  identifier?: string;
  customer?: {
    id: string;
    code: string;
    erp_accounts: string[] | null;
    name: string;
    lane: string | null;
    commercial_status: string | null;
  };
  purchase_history?: {
    last_purchase_date: string | null;
    days_since_last_purchase: number | null;
    average_days_between_orders: number | null;
    purchase_frequency: string | null;
    annual_volume_kg: number | null;
  };
  pricing?: {
    last_price_per_kg_ex_vat: number | null;
    average_price_per_kg_3m: number | null;
    average_price_per_kg_6m: number | null;
    average_price_per_kg_12m: number | null;
    highest_price_per_kg: number | null;
    lowest_price_per_kg: number | null;
  };
  average_order?: {
    average_order_kg: number | null;
    average_order_value_ex_vat: number | null;
    average_gross_profit: number | null;
    average_delivery_cost: number | null;
    average_net_contribution: number | null;
  };
  commercial_profile?: {
    buying_cycle: string | null;
    expected_reorder_date: string | null;
    commercial_rating: string | null;
    lifetime_contribution: number | null;
  };
  risk?: {
    churn_risk: string | null;
    reorder_status: string | null;
    last_order_gap: number | null;
  };
  classification?: {
    lpg_skus_included: string[] | null;
    excluded_sku_classes: string[] | null;
    confidence: string | null;
  };
  data_freshness?: {
    source: string;
    refreshed_at: string;
  };
}

function mapResponse(raw: RawContextResponse): CustomerCommercialContext {
  return {
    customer: {
      id: raw.customer!.id,
      code: raw.customer!.code,
      erpAccounts: raw.customer!.erp_accounts ?? [],
      name: raw.customer!.name,
      lane: raw.customer!.lane as CustomerCommercialContext['customer']['lane'],
      commercialStatus: raw.customer!.commercial_status as CustomerCommercialContext['customer']['commercialStatus'],
    },
    purchaseHistory: {
      lastPurchaseDate: raw.purchase_history?.last_purchase_date ?? null,
      daysSinceLastPurchase: raw.purchase_history?.days_since_last_purchase ?? null,
      averageDaysBetweenOrders: raw.purchase_history?.average_days_between_orders ?? null,
      purchaseFrequency: raw.purchase_history?.purchase_frequency ?? null,
      annualVolumeKg: raw.purchase_history?.annual_volume_kg ?? null,
    },
    pricing: {
      lastPricePerKgExVat: raw.pricing?.last_price_per_kg_ex_vat ?? null,
      averagePricePerKg3m: raw.pricing?.average_price_per_kg_3m ?? null,
      averagePricePerKg6m: raw.pricing?.average_price_per_kg_6m ?? null,
      averagePricePerKg12m: raw.pricing?.average_price_per_kg_12m ?? null,
      highestPricePerKg: raw.pricing?.highest_price_per_kg ?? null,
      lowestPricePerKg: raw.pricing?.lowest_price_per_kg ?? null,
    },
    averageOrder: {
      averageOrderKg: raw.average_order?.average_order_kg ?? null,
      averageOrderValueExVat: raw.average_order?.average_order_value_ex_vat ?? null,
      averageGrossProfit: raw.average_order?.average_gross_profit ?? null,
      averageDeliveryCost: raw.average_order?.average_delivery_cost ?? null,
      averageNetContribution: raw.average_order?.average_net_contribution ?? null,
    },
    commercialProfile: {
      buyingCycle: raw.commercial_profile?.buying_cycle ?? null,
      expectedReorderDate: raw.commercial_profile?.expected_reorder_date ?? null,
      commercialRating: raw.commercial_profile?.commercial_rating ?? null,
      lifetimeContribution: raw.commercial_profile?.lifetime_contribution ?? null,
    },
    risk: {
      churnRisk: raw.risk?.churn_risk ?? null,
      reorderStatus: raw.risk?.reorder_status ?? null,
      lastOrderGap: raw.risk?.last_order_gap ?? null,
    },
    classification: {
      lpgSkusIncluded: raw.classification?.lpg_skus_included ?? [],
      excludedSkuClasses: raw.classification?.excluded_sku_classes ?? [],
      confidence: raw.classification?.confidence ?? null,
    },
    dataFreshness: {
      source: raw.data_freshness?.source ?? 'lpg-stock-recon',
      refreshedAt: raw.data_freshness?.refreshed_at ?? new Date().toISOString(),
    },
  };
}

/**
 * Returns null for an unknown customer (the function's own
 * {"error":"unknown_customer"} response) as well as when Supabase isn't
 * configured — both are "no context available", handled identically by
 * the caller. Throws only on a genuine request failure (network, RLS
 * rejection for an unauthenticated session, etc.) so QuoteWorkspace can
 * distinguish "not found" from "failed" and show the right state.
 */
export async function getCustomerCommercialContext(identifier: string): Promise<CustomerCommercialContext | null> {
  if (!supabase || !identifier) return null;

  const { data, error } = await supabase.rpc('get_customer_commercial_context', { p_identifier: identifier });
  if (error) throw error;

  const raw = data as RawContextResponse | null;
  if (!raw || raw.error === 'unknown_customer' || !raw.customer) return null;

  return mapResponse(raw);
}
