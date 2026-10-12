import { apiClient } from '../../../lib/toolGateway/client';
import { ClassifyPayload, Desk, SolicitationTarget } from '../types/solicitation';

// Raw shape returned by supabase/functions/solicitation (snake_case, mirrors
// solicitation_queue joined to commercial_customers plus the
// commercial_customer_last_order view — see SOLICITATION_RULEBOOK in
// app_config for the authoritative source of these fields).
interface RawRow {
  id: string;
  commercial_customer_id: string;
  status: string;
  predicted_due_date: string | null;
  notes: string | null;
  last_contacted_at: string | null;
  last_lpg_order_date: string | null;
  commercial_customers: {
    customer_name: string;
    commercial_status: string | null;
    avg_cycle_days: number | null;
    primary_contact: string | null;
    contact_phone: string | null;
  } | null;
}

function mapRow(row: RawRow): SolicitationTarget {
  return {
    queueId: row.id,
    commercialCustomerId: row.commercial_customer_id,
    status: row.status as SolicitationTarget['status'],
    predictedDueDate: row.predicted_due_date,
    notes: row.notes,
    lastContactedAt: row.last_contacted_at,
    customerName: row.commercial_customers?.customer_name ?? 'Unknown customer',
    commercialStatus: (row.commercial_customers?.commercial_status ?? null) as SolicitationTarget['commercialStatus'],
    avgCycleDays: row.commercial_customers?.avg_cycle_days ?? null,
    primaryContact: row.commercial_customers?.primary_contact ?? null,
    contactPhone: row.commercial_customers?.contact_phone ?? null,
    lastLpgOrderDate: row.last_lpg_order_date,
  };
}

const DESK_PATH: Record<Desk, string> = {
  targets: '/solicitation/targets',
  leads: '/solicitation/leads',
  review: '/solicitation/review',
};

export async function listDesk(desk: Desk): Promise<SolicitationTarget[]> {
  const res = await apiClient.get(DESK_PATH[desk]);
  if (res?.error) {
    throw new Error(res.error.error ?? `Failed to load the ${desk} desk`);
  }
  return (res as RawRow[]).map(mapRow);
}

export async function classify(payload: ClassifyPayload): Promise<{ ok: boolean; intent: string }> {
  const res = await apiClient.post('/solicitation/classify', payload);
  if (res?.error) {
    throw new Error(res.error.error ?? 'Failed to log outcome');
  }
  return res;
}
