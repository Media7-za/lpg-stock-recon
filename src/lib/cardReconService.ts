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
