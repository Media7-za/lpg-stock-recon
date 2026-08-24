import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';
import type { ProcessedReceipt } from './receiptProcessing';
import { parseStatementCsv } from './cardStatementParser';
import { computeAutoMatches } from './cardReconMatchEngine';

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
  cancelReason: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
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
  cancel_reason: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
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
    cancelReason: row.cancel_reason,
    cancelledBy: row.cancelled_by,
    cancelledAt: row.cancelled_at,
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

// Slice B — Card Statement Reconciliation
// docs/Card-Recon/Dev_Plan.md Section 3. The statement CSV upload is the
// SOLE trigger for this slice — no separate "Start Reconciliation"
// action (Slice Brief Section B). importStatement() creates the session
// and runs the auto-match pass in one call.

export type CardReconSessionStatus = 'OPEN' | 'DRAFT' | 'FINALIZED';

export interface CardReconSession {
  id: string;
  status: CardReconSessionStatus;
  statementFilename: string;
  importedBy: string;
  importedAt: string;
  finalizedBy: string | null;
  finalizedAt: string | null;
}

interface CardReconSessionRow {
  id: string;
  status: CardReconSessionStatus;
  statement_filename: string;
  imported_by: string;
  imported_at: string;
  finalized_by: string | null;
  finalized_at: string | null;
}

function mapCardReconSession(row: CardReconSessionRow): CardReconSession {
  return {
    id: row.id,
    status: row.status,
    statementFilename: row.statement_filename,
    importedBy: row.imported_by,
    importedAt: row.imported_at,
    finalizedBy: row.finalized_by,
    finalizedAt: row.finalized_at,
  };
}

export type CardStatementLineStatus = 'UNMATCHED' | 'MATCHED' | 'EXCEPTION_UNRESOLVED' | 'EXCEPTION_CANCELLED';

export interface CardStatementLine {
  id: string;
  sessionId: string;
  date: string;
  description: string;
  amount: number;
  status: CardStatementLineStatus;
  cancelReason: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
}

interface CardStatementLineRow {
  id: string;
  session_id: string;
  date: string;
  description: string;
  amount: number | string;
  status: CardStatementLineStatus;
  cancel_reason: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
}

function mapCardStatementLine(row: CardStatementLineRow): CardStatementLine {
  return {
    id: row.id,
    sessionId: row.session_id,
    date: row.date,
    description: row.description,
    amount: Number(row.amount),
    status: row.status,
    cancelReason: row.cancel_reason,
    cancelledBy: row.cancelled_by,
    cancelledAt: row.cancelled_at,
  };
}

export type CardMatchMethod = 'AUTO_EXACT' | 'AUTO_FUZZY' | 'MANUAL';

export interface CardReconMatch {
  id: string;
  sessionId: string;
  statementLineId: string;
  ledgerEntryId: string;
  matchMethod: CardMatchMethod;
  matchedBy: string | null;
  matchedAt: string;
}

interface CardReconMatchRow {
  id: string;
  session_id: string;
  statement_line_id: string;
  ledger_entry_id: string;
  match_method: CardMatchMethod;
  matched_by: string | null;
  matched_at: string;
}

function mapCardReconMatch(row: CardReconMatchRow): CardReconMatch {
  return {
    id: row.id,
    sessionId: row.session_id,
    statementLineId: row.statement_line_id,
    ledgerEntryId: row.ledger_entry_id,
    matchMethod: row.match_method,
    matchedBy: row.matched_by,
    matchedAt: row.matched_at,
  };
}

export async function listCardReconSessions(): Promise<CardReconSession[]> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('card_recon_sessions').select('*').order('imported_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapCardReconSession);
}

export async function getCardReconSession(sessionId: string): Promise<CardReconSession> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('card_recon_sessions').select('*').eq('id', sessionId).single();
  if (error) throw error;
  return mapCardReconSession(data);
}

export async function listSessionStatementLines(sessionId: string): Promise<CardStatementLine[]> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase
    .from('card_statement_lines')
    .select('*')
    .eq('session_id', sessionId)
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapCardStatementLine);
}

// Not scoped to a session -- CardLedgerEntry is created independently in
// Slice A and isn't tied to any particular statement period. Every
// UNRECONCILED entry is shown as a manual-match/cancel candidate in
// every open workspace; low volume (Slice Brief) makes this fine without
// pagination.
export async function listUnreconciledLedgerEntries(): Promise<CardLedgerEntry[]> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase
    .from('card_ledger_entries')
    .select('*')
    .eq('reconciliation_status', 'UNRECONCILED')
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapCardLedgerEntry);
}

// Used to display already-matched pairs in the workspace, where the
// ledger entry side is RECONCILED (not UNRECONCILED) so
// listUnreconciledLedgerEntries won't return it.
export async function getCardLedgerEntriesByIds(ids: string[]): Promise<CardLedgerEntry[]> {
  if (!supabase) throw new Error('Supabase not initialized');
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from('card_ledger_entries').select('*').in('id', ids);
  if (error) throw error;
  return (data ?? []).map(mapCardLedgerEntry);
}

export async function listSessionMatches(sessionId: string): Promise<CardReconMatch[]> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { data, error } = await supabase.from('card_recon_matches').select('*').eq('session_id', sessionId);
  if (error) throw error;
  return (data ?? []).map(mapCardReconMatch);
}

/**
 * The statement CSV upload is the sole trigger for Slice B: creates the
 * session, inserts the parsed statement lines, and immediately runs the
 * auto-match pass — there is no separate "Start Reconciliation" step
 * (Slice Brief Section B).
 */
export async function importStatement(csvFile: File, importedBy: string): Promise<CardReconSession> {
  if (!supabase) throw new Error('Supabase not initialized');

  const csvText = await csvFile.text();
  const parsed = parseStatementCsv(csvText);
  if (!parsed.success || !parsed.lines) {
    throw new Error(parsed.error ?? "Couldn't read this file — check it's the unedited bank export");
  }

  const { data: sessionRow, error: sessionError } = await supabase
    .from('card_recon_sessions')
    .insert({ statement_filename: csvFile.name, imported_by: importedBy })
    .select()
    .single();
  if (sessionError) throw sessionError;
  const session = mapCardReconSession(sessionRow);

  const { error: linesError } = await supabase.from('card_statement_lines').insert(
    parsed.lines.map((line) => ({
      session_id: session.id,
      date: line.date,
      description: line.description,
      amount: line.amount,
    }))
  );
  if (linesError) throw linesError;

  await runAutoMatch(session.id);

  return session;
}

/**
 * Auto-match pass: AUTO_EXACT then AUTO_FUZZY (cardReconMatchEngine.ts)
 * against every UNRECONCILED CardLedgerEntry. Statement lines that don't
 * match move to EXCEPTION_UNRESOLVED — bank lines are inherently
 * session-scoped and one-shot, so an unmatched line genuinely needs this
 * session's review.
 *
 * Ledger entries that don't match are deliberately left UNRECONCILED,
 * not flipped to EXCEPTION_UNRESOLVED: an entry posted near the end of
 * this statement's period may legitimately belong on NEXT month's
 * statement instead. Auto-flagging it here would incorrectly force a
 * decision on something that isn't actually overdue yet, and — because
 * an EXCEPTION_UNRESOLVED entry would then be excluded from future
 * auto-match candidate pools (which only query UNRECONCILED) — it could
 * never automatically match a later statement either. It stays a
 * candidate for manual match or Cancel Exception in any session's
 * workspace until one of those actually happens.
 */
export async function runAutoMatch(sessionId: string): Promise<CardReconMatch[]> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: lineRows, error: linesError } = await supabase
    .from('card_statement_lines')
    .select('*')
    .eq('session_id', sessionId)
    .eq('status', 'UNMATCHED');
  if (linesError) throw linesError;
  const lines = (lineRows ?? []).map(mapCardStatementLine);
  if (lines.length === 0) return [];

  const entries = await listUnreconciledLedgerEntries();
  const autoMatches = computeAutoMatches(lines, entries);

  const createdMatches: CardReconMatch[] = [];
  for (const m of autoMatches) {
    const { data: matchRow, error: matchError } = await supabase
      .from('card_recon_matches')
      .insert({
        session_id: sessionId,
        statement_line_id: m.statementLineId,
        ledger_entry_id: m.ledgerEntryId,
        match_method: m.matchMethod,
        matched_by: null,
      })
      .select()
      .single();
    if (matchError) throw matchError;
    createdMatches.push(mapCardReconMatch(matchRow));

    await supabase.from('card_statement_lines').update({ status: 'MATCHED' }).eq('id', m.statementLineId);
    await supabase
      .from('card_ledger_entries')
      .update({ reconciliation_status: 'RECONCILED' })
      .eq('id', m.ledgerEntryId);
  }

  const matchedLineIds = new Set(autoMatches.map((m) => m.statementLineId));
  const unmatchedLineIds = lines.filter((l) => !matchedLineIds.has(l.id)).map((l) => l.id);
  if (unmatchedLineIds.length > 0) {
    await supabase.from('card_statement_lines').update({ status: 'EXCEPTION_UNRESOLVED' }).in('id', unmatchedLineIds);
  }

  return createdMatches;
}

/**
 * Open Question 3, resolved: capturer != reconciler. A MANUAL match is
 * blocked if the acting user is the ledger entry's own capturer — a
 * self-attestation the rest of the system never allows. AUTO_* matches
 * are exempt (enforced in runAutoMatch, which never receives an actorId
 * at all).
 */
export async function confirmManualMatch(
  sessionId: string,
  statementLineId: string,
  ledgerEntryId: string,
  actorId: string
): Promise<CardReconMatch> {
  if (!supabase) throw new Error('Supabase not initialized');

  const { data: entryRow, error: entryError } = await supabase
    .from('card_ledger_entries')
    .select('*')
    .eq('id', ledgerEntryId)
    .single();
  if (entryError) throw entryError;
  const entry = mapCardLedgerEntry(entryRow);

  if (entry.capturedBy === actorId) {
    throw new Error('You submitted this receipt — another user needs to reconcile it');
  }

  const { data: matchRow, error: matchError } = await supabase
    .from('card_recon_matches')
    .insert({
      session_id: sessionId,
      statement_line_id: statementLineId,
      ledger_entry_id: ledgerEntryId,
      match_method: 'MANUAL',
      matched_by: actorId,
    })
    .select()
    .single();
  if (matchError) throw matchError;

  await supabase.from('card_statement_lines').update({ status: 'MATCHED' }).eq('id', statementLineId);
  await supabase.from('card_ledger_entries').update({ reconciliation_status: 'RECONCILED' }).eq('id', ledgerEntryId);
  // First manual action on a session moves it from OPEN to DRAFT — mirrors
  // ReconciliationSession (only a human touching the session, not
  // auto-matches, signals real progress).
  await supabase.from('card_recon_sessions').update({ status: 'DRAFT' }).eq('id', sessionId).eq('status', 'OPEN');

  return mapCardReconMatch(matchRow);
}

export type CancelExceptionTargetType = 'statementLine' | 'ledgerEntry';

/**
 * The only way past a blocking EXCEPTION_UNRESOLVED statement line, or
 * to explicitly write off a stray ledger entry — a required reason,
 * logged with actor + timestamp, same pattern as Capture Clerk rejection
 * in Slice A. Open Question 5, resolved.
 */
export async function cancelException(
  sessionId: string,
  targetId: string,
  targetType: CancelExceptionTargetType,
  reason: string,
  actorId: string
): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');
  if (!reason.trim()) throw new Error('A reason is required to cancel an exception');

  const table = targetType === 'statementLine' ? 'card_statement_lines' : 'card_ledger_entries';
  const statusColumn = targetType === 'statementLine' ? 'status' : 'reconciliation_status';

  const { error } = await supabase
    .from(table)
    .update({
      [statusColumn]: 'EXCEPTION_CANCELLED',
      cancel_reason: reason,
      cancelled_by: actorId,
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', targetId);
  if (error) throw error;

  await supabase.from('card_recon_sessions').update({ status: 'DRAFT' }).eq('id', sessionId).eq('status', 'OPEN');
}

/**
 * FINALIZED is blocked while any CardStatementLine in this session is
 * still UNMATCHED or EXCEPTION_UNRESOLVED — every bank line must reach
 * MATCHED or EXCEPTION_CANCELLED first. Deliberately does NOT check
 * CardLedgerEntry state: an entry can legitimately carry forward
 * unreconciled to a future session (see runAutoMatch's doc comment) — a
 * session shouldn't be blocked on line items outside its own statement
 * period. Open Question 5, resolved.
 */
export async function canFinalize(sessionId: string): Promise<boolean> {
  if (!supabase) throw new Error('Supabase not initialized');
  const { count, error } = await supabase
    .from('card_statement_lines')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .in('status', ['UNMATCHED', 'EXCEPTION_UNRESOLVED']);
  if (error) throw error;
  return (count ?? 0) === 0;
}

export async function finalizeSession(sessionId: string, actorId: string): Promise<void> {
  if (!supabase) throw new Error('Supabase not initialized');

  // Never trust a caller's own prior canFinalize() check alone — the UI's
  // disabled state is a convenience, not the actual gate.
  const ok = await canFinalize(sessionId);
  if (!ok) {
    throw new Error('This period still has unresolved exceptions — match or cancel every item first');
  }

  const { error } = await supabase
    .from('card_recon_sessions')
    .update({ status: 'FINALIZED', finalized_by: actorId, finalized_at: new Date().toISOString() })
    .eq('id', sessionId);
  if (error) throw error;
}
