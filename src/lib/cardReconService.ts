import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';
import type { ProcessedReceipt } from './receiptProcessing';

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
// linked by a Capture Request (-> FULFILLED, below) or manually marked
// ABANDONED -- there is no such manual action yet either, since the UX
// Blueprint doesn't specify one. Revisit once Q7 resolves.

// Slice A — Card Purchase Capture Request
// docs/Card-Recon/Dev_Plan.md Section 3

export type CardCaptureRequestStatus = 'SUBMITTED' | 'BATCHED' | 'POSTED' | 'REJECTED';

export interface CardCaptureRequest {
  id: string;
  intentId: string | null;
  submittedBy: string;
  submittedAt: string;
  amount: number;
  purchaseDate: string;
  description: string;
  ledgerAccountCode: string | null;
  receiptUrl: string;
  receiptMimeType: string;
  receiptSizeBytes: number;
  status: CardCaptureRequestStatus;
  rejectionReason: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

interface CardCaptureRequestRow {
  id: string;
  intent_id: string | null;
  submitted_by: string;
  submitted_at: string;
  amount: number | string;
  purchase_date: string;
  description: string;
  ledger_account_code: string | null;
  receipt_url: string;
  receipt_mime_type: string;
  receipt_size_bytes: number;
  status: CardCaptureRequestStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

function mapCardCaptureRequest(row: CardCaptureRequestRow): CardCaptureRequest {
  return {
    id: row.id,
    intentId: row.intent_id,
    submittedBy: row.submitted_by,
    submittedAt: row.submitted_at,
    amount: Number(row.amount),
    purchaseDate: row.purchase_date,
    description: row.description,
    ledgerAccountCode: row.ledger_account_code,
    receiptUrl: row.receipt_url,
    receiptMimeType: row.receipt_mime_type,
    receiptSizeBytes: row.receipt_size_bytes,
    status: row.status,
    rejectionReason: row.rejection_reason,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
  };
}

const RECEIPTS_BUCKET = 'card-receipts';

function extensionForMimeType(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'image/jpeg') return 'jpg';
  return 'bin';
}

// FR-CCR-RECEIPT-001: card-receipts is a private bucket. This is the
// only sanctioned way this app ever displays or fetches a receipt --
// never store or reuse a permanent URL.
export async function getReceiptSignedUrl(path: string, ttlSeconds = 300): Promise<string> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.storage.from(RECEIPTS_BUCKET).createSignedUrl(path, ttlSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export interface SubmitCaptureRequestFields {
  description: string;
  amount: number;
  purchaseDate: string; // yyyy-MM-dd, matches the <input type="date"> convention (INV-002)
  ledgerAccountCode?: string;
}

export async function submitCaptureRequest(
  fields: SubmitCaptureRequestFields,
  processed: ProcessedReceipt,
  submittedBy: string,
  intentId?: string
): Promise<CardCaptureRequest> {
  if (!supabase) throw new Error('Supabase not initialized');

  const trimmedDescription = fields.description.trim();
  if (!trimmedDescription) throw new Error('Description is required');
  if (!(fields.amount > 0)) throw new Error('Enter the amount from the receipt');

  // `processed` is already the output of processReceiptFile() — the
  // caller runs that at file-select time (UX Blueprint Step A.2, with
  // its own progress indicator) so the preview can show the real
  // processed image, not the raw upload. Re-running it here on submit
  // would just redo identical, deterministic work for no benefit.
  //
  // ATOMIC per FR-CCR-RECEIPT-001: the upload below MUST succeed before
  // any DB row is created — there is no insert-then-upload path that
  // could leave a partial CardCaptureRequest behind.
  const path = `requests/${uuidv4()}_${Date.now()}.${extensionForMimeType(processed.mimeType)}`;
  const { error: uploadError } = await supabase.storage
    .from(RECEIPTS_BUCKET)
    .upload(path, processed.blob, { contentType: processed.mimeType });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from('card_capture_requests')
    .insert({
      intent_id: intentId ?? null,
      submitted_by: submittedBy,
      amount: fields.amount,
      purchase_date: fields.purchaseDate,
      description: trimmedDescription,
      ledger_account_code: fields.ledgerAccountCode ?? null,
      receipt_url: path,
      receipt_mime_type: processed.mimeType,
      receipt_size_bytes: processed.sizeBytes,
    })
    .select()
    .single();

  if (error) throw error;

  if (intentId) {
    // Best-effort: the CardCaptureRequest above is already committed:
    // its own atomicity guarantee doesn't extend to this side-effect.
    // If this update fails, the intent is simply stale until the next
    // read reconciles it — acceptable, since PurchaseIntent is a
    // visibility aid (Guiding Principle), not itself a financial record.
    await supabase.from('purchase_intents').update({ status: 'FULFILLED' }).eq('id', intentId);
  }

  return mapCardCaptureRequest(data);
}

export async function listMyCaptureRequests(submittedBy: string): Promise<CardCaptureRequest[]> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('card_capture_requests')
    .select('*')
    .eq('submitted_by', submittedBy)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapCardCaptureRequest);
}

export async function listCaptureQueue(): Promise<CardCaptureRequest[]> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data, error } = await supabase
    .from('card_capture_requests')
    .select('*')
    .eq('status', 'SUBMITTED')
    .order('submitted_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapCardCaptureRequest);
}

export interface CardLedgerEntry {
  id: string;
  captureRequestId: string;
  capturedBy: string;
  vendor: string;
  reference: string;
  ledgerAccountCode: string;
  date: string;
  amount: number;
  receiptUrl: string;
  receiptMimeType: string;
  receiptSizeBytes: number;
  receiptUploadedAt: string;
  reconciliationStatus: string;
  postedBy: string;
  postedAt: string;
}

interface CardLedgerEntryRow {
  id: string;
  capture_request_id: string;
  captured_by: string;
  vendor: string;
  reference: string;
  ledger_account_code: string;
  date: string;
  amount: number | string;
  receipt_url: string;
  receipt_mime_type: string;
  receipt_size_bytes: number;
  receipt_uploaded_at: string;
  reconciliation_status: string;
  posted_by: string;
  posted_at: string;
}

function mapCardLedgerEntry(row: CardLedgerEntryRow): CardLedgerEntry {
  return {
    id: row.id,
    captureRequestId: row.capture_request_id,
    capturedBy: row.captured_by,
    vendor: row.vendor,
    reference: row.reference,
    ledgerAccountCode: row.ledger_account_code,
    date: row.date,
    amount: Number(row.amount),
    receiptUrl: row.receipt_url,
    receiptMimeType: row.receipt_mime_type,
    receiptSizeBytes: row.receipt_size_bytes,
    receiptUploadedAt: row.receipt_uploaded_at,
    reconciliationStatus: row.reconciliation_status,
    postedBy: row.posted_by,
    postedAt: row.posted_at,
  };
}

export async function postCaptureRequest(
  requestId: string,
  ledgerAccountCode: string,
  actorId: string
): Promise<CardLedgerEntry> {
  if (!supabase) throw new Error('Supabase not initialized');
  if (!ledgerAccountCode) throw new Error('A ledger account is required to post');

  const { data: requestRow, error: fetchError } = await supabase
    .from('card_capture_requests')
    .select('*')
    .eq('id', requestId)
    .single();
  if (fetchError) throw fetchError;
  const captureRequest = mapCardCaptureRequest(requestRow);

  // FR-CCR-RECEIPT-001: "cannot be posted if its receipt file is missing
  // or inaccessible" — re-verify before creating the ledger entry rather
  // than trusting the stored path blindly.
  try {
    await getReceiptSignedUrl(captureRequest.receiptUrl, 60);
  } catch {
    throw new Error("Can't verify the receipt for this request — try again or reject it.");
  }

  const { data: entryRow, error: insertError } = await supabase
    .from('card_ledger_entries')
    .insert({
      capture_request_id: captureRequest.id,
      captured_by: captureRequest.submittedBy,
      vendor: 'Card', // single-card MVP assumption — Open Question 6
      reference: captureRequest.description,
      ledger_account_code: ledgerAccountCode,
      date: captureRequest.purchaseDate,
      amount: captureRequest.amount,
      receipt_url: captureRequest.receiptUrl,
      receipt_mime_type: captureRequest.receiptMimeType,
      receipt_size_bytes: captureRequest.receiptSizeBytes,
      receipt_uploaded_at: captureRequest.submittedAt,
    })
    .select()
    .single();
  if (insertError) throw insertError;

  const { error: updateError } = await supabase
    .from('card_capture_requests')
    .update({ status: 'POSTED', reviewed_by: actorId, reviewed_at: new Date().toISOString() })
    .eq('id', requestId);
  if (updateError) throw updateError;

  // PurchaseIntent, if linked, already moved to FULFILLED at submit time
  // (submitCaptureRequest) — per the UX Blueprint's Step A.3, not here.

  return mapCardLedgerEntry(entryRow);
}

export async function rejectCaptureRequest(requestId: string, reason: string, actorId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  if (!reason.trim()) throw new Error('A reason is required');

  const { data: requestRow, error: fetchError } = await supabase
    .from('card_capture_requests')
    .select('intent_id')
    .eq('id', requestId)
    .single();
  if (fetchError) throw fetchError;

  const { error } = await supabase
    .from('card_capture_requests')
    .update({
      status: 'REJECTED',
      rejection_reason: reason,
      reviewed_by: actorId,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', requestId);
  if (error) throw error;

  const intentId = (requestRow as { intent_id: string | null } | null)?.intent_id;
  if (intentId) {
    await supabase.from('purchase_intents').update({ status: 'OPEN' }).eq('id', intentId);
  }
}
