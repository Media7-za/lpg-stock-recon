import { apiClient } from '../../../lib/toolGateway/client';
import { ClassifyPaymentPayload, CustomerSearchResult, OutstandingPayment } from '../types/paymentCollections';

// Raw shape returned by supabase/functions/payment-collections (snake_case).
interface RawRecord {
  id: string;
  commercial_customer_id: string;
  amount_due: string | number;
  statement_url: string | null;
  statement_filename: string | null;
  status: string;
  follow_up_date: string | null;
  notes: string | null;
  last_contacted_at: string | null;
  commercial_customers: {
    customer_name: string;
    primary_contact: string | null;
    contact_phone: string | null;
  } | null;
}

function mapRecord(row: RawRecord): OutstandingPayment {
  return {
    id: row.id,
    commercialCustomerId: row.commercial_customer_id,
    amountDue: Number(row.amount_due),
    statementUrl: row.statement_url,
    statementFilename: row.statement_filename,
    status: row.status as OutstandingPayment['status'],
    followUpDate: row.follow_up_date,
    notes: row.notes,
    lastContactedAt: row.last_contacted_at,
    customerName: row.commercial_customers?.customer_name ?? 'Unknown customer',
    primaryContact: row.commercial_customers?.primary_contact ?? null,
    contactPhone: row.commercial_customers?.contact_phone ?? null,
  };
}

export async function listPaymentRecords(): Promise<OutstandingPayment[]> {
  const res = await apiClient.get('/payment-collections/records');
  if (res?.error) {
    throw new Error(res.error.error ?? 'Failed to load outstanding payments');
  }
  return (res as RawRecord[]).map(mapRecord);
}

export async function searchCustomers(q: string): Promise<CustomerSearchResult[]> {
  const res = await apiClient.get(`/payment-collections/customers?q=${encodeURIComponent(q)}`);
  if (res?.error) {
    throw new Error(res.error.error ?? 'Customer search failed');
  }
  return (res as any[]).map((c) => ({
    id: c.id,
    customerName: c.customer_name,
    contactPhone: c.contact_phone ?? null,
  }));
}

export async function createOrUpdatePayment(input: {
  commercialCustomerId: string;
  amountDue: number;
  file?: { base64: string; name: string; contentType: string };
}): Promise<OutstandingPayment> {
  const res = await apiClient.post('/payment-collections/records', {
    commercialCustomerId: input.commercialCustomerId,
    amountDue: input.amountDue,
    fileBase64: input.file?.base64,
    fileName: input.file?.name,
    contentType: input.file?.contentType,
  });
  if (res?.error) {
    throw new Error(res.error.error ?? 'Failed to save the outstanding payment');
  }
  return mapRecord(res as RawRecord);
}

export async function classifyPayment(payload: ClassifyPaymentPayload): Promise<{ ok: boolean }> {
  const res = await apiClient.post('/payment-collections/records/classify', payload);
  if (res?.error) {
    throw new Error(res.error.error ?? 'Failed to log outcome');
  }
  return res;
}
