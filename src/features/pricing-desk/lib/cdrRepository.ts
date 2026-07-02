import { supabase } from '../../../lib/supabase';
import {
  CommercialDecisionRecord,
  CreateCommercialDecisionRecordInput,
  DecisionState,
} from '../types/pricingDesk';

// Mirrors the `commercial_decision_records` table created by the Phase 2
// migration (see lpg-stock-recon/docs/Pricing-Desk-Phase-2-CDR/CDR-Schema-Diff.md).
// Hand-written to match the codebase's existing convention of querying the
// untyped Supabase client directly rather than generated Database types.
interface CommercialDecisionRecordRow {
  id: string;
  decision_code: string | null;
  previous_decision_id: string | null;
  customer_code: string;
  customer_name: string;
  customer_lane: string;
  commercial_status: string;
  decision_type: string;
  state: string;
  pricing_intake_snapshot: unknown;
  customer_context_snapshot: unknown;
  delivery_economics_snapshot: unknown;
  supplier_cost_snapshot: unknown;
  market_context_snapshot: unknown;
  floor_price_per_kg: number | null;
  target_price_per_kg: number | null;
  stretch_price_per_kg: number | null;
  recommended_price_per_kg: number | null;
  approved_price_per_kg: number | null;
  price_basis: string;
  approved_by: string | null;
  decision_reason: string | null;
  confidence: string | null;
  proforma_id: string | null;
  erp_order_id: string | null;
  outcome: string | null;
  outcome_reason: string | null;
  created_at: string;
  approved_at: string | null;
  quoted_at: string | null;
  closed_at: string | null;
}

const TABLE = 'commercial_decision_records';

function mapRowToDecision(row: CommercialDecisionRecordRow): CommercialDecisionRecord {
  return {
    decisionId: row.id,
    decisionCode: row.decision_code,
    previousDecisionId: row.previous_decision_id,
    customerCode: row.customer_code,
    customerName: row.customer_name,
    customerLane: row.customer_lane as CommercialDecisionRecord['customerLane'],
    commercialStatus: row.commercial_status as CommercialDecisionRecord['commercialStatus'],
    state: row.state as DecisionState,
    approvedPricePerKg: row.approved_price_per_kg ?? 0,
    approvedBy: row.approved_by,
    decisionReason: row.decision_reason ?? '',
    orderLines: (row.pricing_intake_snapshot as CommercialDecisionRecord['pricingIntakeSnapshot'] | null)?.orderLines ?? [],
    pricingIntakeSnapshot: row.pricing_intake_snapshot as CommercialDecisionRecord['pricingIntakeSnapshot'],
    customerContextSnapshot: row.customer_context_snapshot as CommercialDecisionRecord['customerContextSnapshot'],
    deliveryEconomicsSnapshot: row.delivery_economics_snapshot as CommercialDecisionRecord['deliveryEconomicsSnapshot'],
    supplierCostSnapshot: row.supplier_cost_snapshot as CommercialDecisionRecord['supplierCostSnapshot'],
    marketContextSnapshot: row.market_context_snapshot as CommercialDecisionRecord['marketContextSnapshot'],
    createdAt: row.created_at,
    approvedAt: row.approved_at,
    quotedAt: row.quoted_at,
  };
}

export async function listRecentCommercialDecisionRecords(limit = 20): Promise<CommercialDecisionRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as CommercialDecisionRecordRow[]).map(mapRowToDecision);
}

export async function createCommercialDecisionRecord(
  input: CreateCommercialDecisionRecordInput
): Promise<CommercialDecisionRecord> {
  if (!supabase) throw new Error('Supabase is not configured — cannot create a Commercial Decision Record.');

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      previous_decision_id: input.previousDecisionId ?? null,
      customer_code: input.customerCode,
      customer_name: input.customerName,
      customer_lane: input.customerLane,
      commercial_status: input.commercialStatus,
      state: 'approved',
      pricing_intake_snapshot: input.pricingIntakeSnapshot,
      customer_context_snapshot: input.customerContextSnapshot,
      delivery_economics_snapshot: input.deliveryEconomicsSnapshot,
      supplier_cost_snapshot: input.supplierCostSnapshot,
      market_context_snapshot: input.marketContextSnapshot,
      approved_price_per_kg: input.approvedPricePerKg,
      approved_by: input.approvedBy,
      decision_reason: input.decisionReason,
      approved_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapRowToDecision(data as CommercialDecisionRecordRow);
}

export async function updateCommercialDecisionRecordState(
  decisionId: string,
  patch: { state: DecisionState; quotedAt?: string; closedAt?: string; outcome?: string; outcomeReason?: string }
): Promise<CommercialDecisionRecord> {
  if (!supabase) throw new Error('Supabase is not configured — cannot update a Commercial Decision Record.');

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      state: patch.state,
      ...(patch.quotedAt ? { quoted_at: patch.quotedAt } : {}),
      ...(patch.closedAt ? { closed_at: patch.closedAt } : {}),
      ...(patch.outcome ? { outcome: patch.outcome } : {}),
      ...(patch.outcomeReason ? { outcome_reason: patch.outcomeReason } : {}),
    })
    .eq('id', decisionId)
    .select('*')
    .single();

  if (error) throw error;
  return mapRowToDecision(data as CommercialDecisionRecordRow);
}
