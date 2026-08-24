import { supabase } from './supabase';

export interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  active: boolean;
  createdAt: string;
}

interface LedgerAccountRow {
  id: string;
  code: string;
  name: string;
  active: boolean;
  created_at: string;
}

function mapLedgerAccount(row: LedgerAccountRow): LedgerAccount {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    active: row.active,
    createdAt: row.created_at,
  };
}

// Slice 0 — Ledger Account Admin
// docs/Card-Recon/Dev_Plan.md Section 3

export async function listActiveLedgerAccounts(): Promise<LedgerAccount[]> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('ledger_accounts')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapLedgerAccount);
}

export async function listAllLedgerAccounts(): Promise<LedgerAccount[]> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('ledger_accounts')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapLedgerAccount);
}

export async function createLedgerAccount(code: string, name: string): Promise<LedgerAccount> {
  if (!supabase) throw new Error('Supabase not initialized');

  const trimmedCode = code.trim();
  const trimmedName = name.trim();
  if (!trimmedCode || !trimmedName) {
    throw new Error('Code and name are both required');
  }

  const { data, error } = await supabase
    .from('ledger_accounts')
    .insert({ code: trimmedCode, name: trimmedName })
    .select()
    .single();

  if (error) {
    // Postgres unique_violation on the code column
    if (error.code === '23505') {
      throw new Error('This code already exists');
    }
    throw error;
  }
  return mapLedgerAccount(data);
}

export async function renameLedgerAccount(id: string, name: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');

  const trimmedName = name.trim();
  if (!trimmedName) throw new Error('Name is required');

  // Code is deliberately not editable here — no update path exposes it.
  // Historical records reference LedgerAccount by code, and changing it
  // after creation would silently corrupt those references.
  const { error } = await supabase
    .from('ledger_accounts')
    .update({ name: trimmedName })
    .eq('id', id);

  if (error) throw error;
}

export async function deactivateLedgerAccount(id: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { error } = await supabase
    .from('ledger_accounts')
    .update({ active: false })
    .eq('id', id);

  if (error) throw error;
}

// Slice A0 — Purchase Intent (Quick Request)
// docs/Card-Recon/Dev_Plan.md Section 3. Non-blocking by design (Slice
// Brief Section D) — these functions never validate anything that could
// prevent or delay a purchase, only the intent log itself.

export type PurchaseIntentStatus = 'OPEN' | 'FULFILLED' | 'ABANDONED';

export interface PurchaseIntent {
  id: string;
  description: string;
  ledgerAccountCode: string;
  status: PurchaseIntentStatus;
  requestedBy: string;
  requestedAt: string;
}

interface PurchaseIntentRow {
  id: string;
  description: string;
  ledger_account_code: string;
  status: PurchaseIntentStatus;
  requested_by: string;
  requested_at: string;
}

function mapPurchaseIntent(row: PurchaseIntentRow): PurchaseIntent {
  return {
    id: row.id,
    description: row.description,
    ledgerAccountCode: row.ledger_account_code,
    status: row.status,
    requestedBy: row.requested_by,
    requestedAt: row.requested_at,
  };
}

export async function createPurchaseIntent(
  description: string,
  ledgerAccountCode: string,
  requestedBy: string
): Promise<PurchaseIntent> {
  if (!supabase) throw new Error('Supabase not initialized');

  const trimmedDescription = description.trim();
  if (!trimmedDescription) throw new Error('Description is required');
  if (!ledgerAccountCode) throw new Error('Ledger account is required');

  const { data, error } = await supabase
    .from('purchase_intents')
    .insert({
      description: trimmedDescription,
      ledger_account_code: ledgerAccountCode,
      requested_by: requestedBy,
    })
    .select()
    .single();

  if (error) throw error;
  return mapPurchaseIntent(data);
}

export async function listMyPurchaseIntents(requestedBy: string): Promise<PurchaseIntent[]> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('purchase_intents')
    .select('*')
    .eq('requested_by', requestedBy)
    .order('requested_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapPurchaseIntent);
}

// Open Question 7 (unresolved): no automatic OPEN -> ABANDONED transition
// is implemented here. An intent stays OPEN indefinitely until either
// linked by a Capture Request (-> FULFILLED, in Slice A's service
// functions) or manually marked ABANDONED -- there is no such manual
// action yet either, since the UX Blueprint doesn't specify one. Revisit
// once Q7 resolves.
