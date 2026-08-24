## Dev Plan — Credit Card Purchase Intent, Capture & Statement Reconciliation
Combines: ARCHITECT-AGENT (Stage 3) + SCHEMA-AGENT (Stage 4) territory
Date: 2026-08-24

---

> **Pipeline deviation, noted per the Authority Model:** normally Stage 3
> (Architecture Note) and Stage 4 (Schema Diff) each produce a separate
> approved artifact before build starts, and Stage 2 (PRD) precedes both.
> None of those three ran for this epic — only the Slice Brief (Stage 1)
> and UX Blueprint (Stage 5, itself out of order) are locked. This plan
> synthesizes Architecture + Schema content directly from those two
> documents so build can actually start. **This is not a substitute for
> PM sign-off** — treat it the same as the other docs: read it, correct
> it, approve it.
>
> Confirmed from the codebase before writing this: there is **no separate
> backend/API layer**. Data access is direct Supabase client calls from
> `src/lib/*Service.ts` files, consumed by `src/hooks/`, consumed by
> components (see `src/lib/dispatchService.ts`, `src/lib/reconciliationEngine.ts`).
> Everything below follows that pattern — no new "backend stage" exists
> separately from "write the service file."
>
> **Updated since first written:** FR-CCR-RECEIPT-001 (a full PRD-style
> requirement for receipt attachment, processing, and storage) arrived
> after M0 had already shipped with a public storage bucket and a bare
> `receiptUrl` field — both wrong against this FR. Fixed directly rather
> than left as a known issue: `card-receipts` is now private with a
> follow-up migration adding `receiptMimeType`/`receiptSizeBytes` (and
> `receiptUploadedAt` on `CardLedgerEntry`), both already committed. The
> receipt processing pipeline itself (Section 3) is new.

---

### 1. Schema (Prisma)

All five prior slices' worth of entities, following existing conventions:
`cuid()` ids, ALL CAPS status strings (INV-006), FK-by-code where a
human-readable code is the natural lookup key (mirrors `Account.accountNo`).

```prisma
model LedgerAccount {
  id        String   @id @default(cuid())
  code      String   @unique   // immutable after creation — enforced in
                                // the service layer, not the DB; no update
                                // path exposes this field
  name      String
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
}

model PurchaseIntent {
  id                String   @id @default(cuid())
  description       String
  ledgerAccountCode String            // FK -> LedgerAccount.code
  status            String   @default("OPEN")  // OPEN | FULFILLED | ABANDONED
  requestedBy       String            // user id
  requestedAt       DateTime @default(now())
}

model CardCaptureRequest {
  id               String    @id @default(cuid())
  intentId         String?            // FK -> PurchaseIntent.id, optional
  submittedBy      String
  submittedAt      DateTime  @default(now())
  amount           Decimal
  purchaseDate     DateTime
  merchantNote     String?
  receiptUrl       String             // NOT NULL — mandatory (Slice Brief Section D).
                              // Private bucket object PATH, not a public URL — see
                              // Section 2 (Storage) and FR-CCR-RECEIPT-001.
  receiptMimeType  String             // image/jpeg or application/pdf, post-processing
  receiptSizeBytes Int                // processed size, not the original upload size
  status           String    @default("SUBMITTED")
                              // SUBMITTED | BATCHED | POSTED | REJECTED
  rejectionReason  String?
  reviewedBy       String?
  reviewedAt       DateTime?
}

model CardLedgerEntry {
  id                  String   @id @default(cuid())
  captureRequestId    String            // FK -> CardCaptureRequest.id
  capturedBy          String            // copied from submittedBy — the
                                         // segregation-of-duties check field
  vendor              String            // fixed card identifier (single-card
                                         // MVP assumption — see Open Question 6)
  reference           String            // receipt's own reference
  ledgerAccountCode   String            // FK -> LedgerAccount.code
  date                DateTime
  amount              Decimal
  receiptUrl          String            // mirrors CardCaptureRequest.receiptUrl
  receiptMimeType     String            // mirrors CardCaptureRequest.receiptMimeType
  receiptSizeBytes    Int               // mirrors CardCaptureRequest.receiptSizeBytes
  receiptUploadedAt   DateTime          // when the file was ORIGINALLY uploaded at
                                         // capture time — not postedAt, which is the
                                         // Capture Clerk's later review action
  reconciliationStatus String  @default("UNRECONCILED")
                              // UNRECONCILED | RECONCILED | EXCEPTION_UNRESOLVED | EXCEPTION_CANCELLED
  postedBy            String            // the Capture Clerk
  postedAt            DateTime @default(now())
}

model CardStatementLine {
  id            String   @id @default(cuid())
  sessionId     String            // FK -> CardReconSession.id
  date          DateTime
  description   String            // raw bank description text
  amount        Decimal
  status        String   @default("UNMATCHED")
                          // UNMATCHED | MATCHED | EXCEPTION_UNRESOLVED | EXCEPTION_CANCELLED
  cancelReason  String?
  cancelledBy   String?
  cancelledAt   DateTime?
}

model CardReconMatch {
  id               String   @id @default(cuid())
  sessionId        String            // FK -> CardReconSession.id
  statementLineId  String            // FK -> CardStatementLine.id
  ledgerEntryId    String            // FK -> CardLedgerEntry.id
  matchMethod      String            // AUTO_EXACT | AUTO_FUZZY | MANUAL
  matchedBy        String?           // null for AUTO_* — no human actor
  matchedAt        DateTime @default(now())
}

model CardReconSession {
  id                String    @id @default(cuid())
  status            String    @default("OPEN")  // OPEN | DRAFT | FINALIZED
  statementFilename String
  importedBy        String
  importedAt        DateTime  @default(now())
  finalizedBy       String?
  finalizedAt       DateTime?
}
```

**State-machine mechanics not yet spelled out anywhere else — filling in
the implementation gap, not reopening a locked decision:**
- `CardCaptureRequest.status`: `BATCHED` is an optimistic lock, not a
  separate workflow stage — set the instant a Capture Clerk opens a
  request's review panel, so two clerks can't post/reject the same
  request simultaneously. Reverts to `SUBMITTED` if the clerk navigates
  away without posting or rejecting.
- `CardReconSession.status`: mirrors `ReconciliationSession` exactly —
  created `OPEN` on statement upload, moves to `DRAFT` on the reconciler's
  first manual action (a match or a cancel), `FINALIZED` on finalize.
  Auto-matches alone do **not** move it to `DRAFT` — that would falsely
  suggest a human touched it.

**INV-005 (ID integrity) FK contracts, stated explicitly:**
- `PurchaseIntent.ledgerAccountCode → LedgerAccount.code` — never `.id`
- `CardCaptureRequest.intentId → PurchaseIntent.id`
- `CardLedgerEntry.captureRequestId → CardCaptureRequest.id`
- `CardLedgerEntry.ledgerAccountCode → LedgerAccount.code`
- `CardReconMatch.statementLineId → CardStatementLine.id` (never `.ledgerEntryId`'s type)
- `CardReconMatch.ledgerEntryId → CardLedgerEntry.id` (never a `CardStatementLine.id`)

**Migration classification:** entirely additive. Shipped as two migrations
— `add_card_recon_foundation` (the seven tables, M0) and a follow-up
`add_receipt_evidence_metadata` (the `receiptMimeType`/`receiptSizeBytes`/
`receiptUploadedAt` columns above, added once FR-CCR-RECEIPT-001 specified
what needed recording beyond the path). No backfill needed for either —
both tables were still empty when the second migration was written — and
no destructive risk in either case.

---

### 2. Storage

New Supabase Storage bucket `card-receipts` — **private** (`public =
false`), not the `invoice-documents` pattern, per FR-CCR-RECEIPT-001
("not publicly accessible without authorization"). See
`supabase/card_recon_storage.sql`.

**Path convention — corrected from the original draft:** cannot be keyed
by `captureRequestId` the way `invoice-documents` keys by `doc_no`,
because the atomicity requirement (Section 3 below) uploads the file
*before* the `CardCaptureRequest` row exists — there's no id yet to key
off. Instead, generate a fresh random id client-side purely for the
storage path (the `uuid` package is already a dependency):
```
requests/{uuid()}_{timestamp}.{ext}
```
`receiptUrl` on both `CardCaptureRequest` and `CardLedgerEntry` stores
this **object path**, never a public URL — the app resolves a
short-lived signed URL for display via `getReceiptSignedUrl(path)` (see
Section 3). The path's own randomness is what "non-guessable" means here
(FR-CCR-RECEIPT-001) — the RLS SELECT policy alone doesn't achieve that,
since a signed URL bypasses RLS by design (see the comment in
`card_recon_storage.sql`).

---

### 3. Service Layer (`src/lib/`)

One new file, `src/lib/cardReconService.ts`, following the pattern of
`dispatchService.ts` / `reconciliationEngine.ts` — typed functions wrapping
`supabase.from(...)` calls, no separate API route layer.

```
// Slice 0
listActiveLedgerAccounts(): LedgerAccount[]
createLedgerAccount(code, name): LedgerAccount        // rejects duplicate code
deactivateLedgerAccount(id): void                      // active = false only

// Slice A0
createPurchaseIntent(description, ledgerAccountCode): PurchaseIntent
listMyPurchaseIntents(userId): PurchaseIntent[]

// Slice A — receipt processing (FR-CCR-RECEIPT-001), client-side, pure
// logic, no Supabase calls — lives in src/lib/receiptProcessing.ts, not
// cardReconService.ts, so it's independently unit-testable
processReceiptFile(file: File): Promise<ProcessedReceipt>
  // ProcessedReceipt = { blob: Blob, mimeType: string, sizeBytes: number }
  // JPEG/PNG/HEIC: HEIC input first decoded to JPEG (heic2any — the one
  // new dependency this needs, see below), then createImageBitmap(file,
  // { imageOrientation: 'from-image' }) for orientation correction,
  // resize to <=2000px longest edge preserving aspect ratio, draw to an
  // OffscreenCanvas, export via convertToBlob({ type: 'image/jpeg',
  // quality: 0.8 }) — this canvas re-encode is what strips EXIF, no
  // separate metadata-stripping step needed. If still >500KB, iteratively
  // step quality down (0.8 -> 0.7 -> 0.6...) with a floor (0.5) below
  // which it stops degrading and accepts the larger size, per "where
  // this can be achieved without making the receipt unreadable."
  // Re-decodes the output blob to confirm it renders; throws
  // ReceiptUnreadableError if it doesn't (Step A.2's rejection path).
  // PDF: skips all of the above, validates against the upload-size
  // limit, returns the file unchanged as the blob.

// Slice A
submitCaptureRequest(fields, receiptFile, intentId?): CardCaptureRequest
  // ATOMIC per FR-CCR-RECEIPT-001: calls processReceiptFile() first,
  // then uploads the resulting blob to card-receipts at a fresh
  // uuid()-derived path (Section 2) — ONLY THEN inserts the
  // CardCaptureRequest row with receiptUrl/receiptMimeType/
  // receiptSizeBytes set from the upload result. If upload fails, no row
  // is ever inserted — there is no insert-then-upload path to leave a
  // partial record behind.
listCaptureQueue(): CardCaptureRequest[]                // status = SUBMITTED
getReceiptSignedUrl(path: string, ttlSeconds = 300): string
  // wraps supabase.storage.from('card-receipts').createSignedUrl() —
  // the only way this app ever displays a receipt; never store or reuse
  // a permanent URL
postCaptureRequest(id, ledgerAccountCode, actorId): CardLedgerEntry
  // Re-verifies the receipt object still exists in storage before
  // proceeding (FR-CCR-RECEIPT-001 — "cannot be posted if its receipt
  // file is missing or inaccessible"); throws if that check fails.
  // Otherwise creates CardLedgerEntry (copying receiptUrl/
  // receiptMimeType/receiptSizeBytes and the original submittedAt as
  // receiptUploadedAt), sets CardCaptureRequest.status = POSTED, and
  // PurchaseIntent.status = FULFILLED if intentId was set
rejectCaptureRequest(id, reason, actorId): void
  // reverts linked PurchaseIntent to OPEN if one exists

// Slice B
importStatement(csvFile, actorId): CardReconSession
  // creates session (OPEN) + CardStatementLine rows, then calls runAutoMatch
runAutoMatch(sessionId): CardReconMatch[]                // AUTO_EXACT then AUTO_FUZZY
confirmManualMatch(sessionId, statementLineId, ledgerEntryId, actorId): CardReconMatch
  // THROWS if actorId === CardLedgerEntry.capturedBy — segregation of
  // duties (Open Question 3) enforced here, server-side, not just a
  // disabled button
cancelException(sessionId, targetId, targetType, reason, actorId): void
  // targetType: 'statementLine' | 'ledgerEntry'
canFinalize(sessionId): boolean
  // false while any EXCEPTION_UNRESOLVED item remains in the session
finalizeSession(sessionId, actorId): void
  // throws (mirrors 409) if canFinalize() is false at call time —
  // never trust the UI's disabled state alone
```

**Matching engine (`AUTO_EXACT` / `AUTO_FUZZY`)** is pure logic, no
Supabase calls — same shape as `reconciliationEngine.ts`, and should get
the same unit-test treatment (see Testing Plan). `AUTO_EXACT`: amount
equal, date equal. `AUTO_FUZZY`: amount equal, date within an N-day
window (N — reasonable default 3 days, not yet PM-confirmed, flag for
Stage 2/PRD if one gets written).

---

### 4. Enforcement layer — a recommendation, not yet decided

The Slice Brief says "the system checks `actorId ≠ capturedBy`" — that
was written as a real control, not a UI nicety. If `confirmManualMatch`
only checks this in the service function, any direct Supabase call
(service-role scripts, a future integration) bypasses it entirely.
**Recommend:** back it with a Postgres RLS policy or a `BEFORE INSERT`
trigger on `CardReconMatch` as defense-in-depth, not just the service-layer
check. Same applies to the mandatory-`receiptUrl` constraint on
`CardLedgerEntry` — add a `NOT NULL` column constraint, don't rely on the
service layer alone to enforce it. This is a build-time decision, not a
new Open Question — flagging it here so it doesn't get skipped under
time pressure.

---

### 5. Build Sequence — Shippable Milestones

Each milestone is independently deployable and testable, in dependency
order (matches the Recommended Vertical Slice in the Slice Brief, broken
into real PRs):

**M0 — Schema & storage foundation** *(no UI)*
- Prisma migration: all 7 tables above
- `card-receipts` storage bucket + policy
- `cardReconService.ts` skeleton with types only
- Exit criteria: `prisma migrate deploy` succeeds against a clean DB; bucket visible in Supabase dashboard

**M1 — Slice 0: Ledger Account Admin**
- `LedgerAccountAdmin.tsx` + the three service functions
- Exit criteria: an admin can create, rename, and deactivate an account end to end

**M2 — Slice A0: Purchase Intent**
- `PurchaseIntentQuickForm.tsx`, `MyPurchaseIntents.tsx`
- Depends on M1 (needs a real `LedgerAccount` to select)
- Exit criteria: a cardholder logs an intent, sees it in My Intents as `OPEN`

**M3 — Slice A: Capture Request**
- `CardCaptureForm.tsx`, `MyCaptureRequests.tsx`, `CardCaptureQueue.tsx`, `src/lib/receiptProcessing.ts`
- Depends on M2 for the optional intent-link picker (M3 still works standalone if M2 shipped but no intent exists)
- Exit criteria: a cardholder submits a receipt, a Capture Clerk posts it, a `CardLedgerEntry` exists with `reconciliationStatus = UNRECONCILED`. Plus, per FR-CCR-RECEIPT-001's acceptance criteria: a JPEG/PNG/HEIC receipt from mobile is resized and normalized to JPEG before storage; a PDF receipt is accepted unprocessed; EXIF/location metadata is verifiably stripped; upload failure leaves no partial `CardCaptureRequest`; the stored receipt stays linked through to the resulting `CardLedgerEntry`

**M4 — Slice B: Statement Reconciliation**
- `CardReconDashboard.tsx`, `CardReconWorkspace.tsx`, matching engine, Cancel Exception flow, Finalize gate
- Depends on M3 (needs real `CardLedgerEntry` rows to reconcile against)
- Exit criteria: upload a real statement CSV → auto-match runs → manually clear the rest → Finalize succeeds only once every exception is matched or cancelled

**M5 — Deferred, not blocking ship:**
- Open Question 2 refinement (Capture Clerk GL-code override authority)
- Open Question 6 (multi-card `card_id` FK) — M0's schema ships with the
  single-card assumption from the Slice Brief; adding `card_id` later is
  a straightforward additive migration, not a rework
- Open Question 7 (`PurchaseIntent` auto-`ABANDONED` window) — ships as
  manual-only for M2 (option (b) from the register — never
  auto-transitions); a scheduled job can be added later without touching
  the state machine

---

### 6. Testing Plan

**Unit (Vitest, matches `reconciliationEngine.test.ts` convention):**
- `cardReconMatchEngine.test.ts` — `AUTO_EXACT`/`AUTO_FUZZY` logic against fixture bank lines + ledger entries, including the boundary case (date exactly N days apart)
- `cardReconService.test.ts` — mandatory-receipt rejection, segregation-of-duties rejection, `canFinalize` with mixed exception states
- `receiptProcessing.test.ts` — fixture images per FR-CCR-RECEIPT-001's acceptance criteria: a >2000px image gets resized, a PNG/HEIC input comes out as JPEG, output stays under jsdom/canvas-mockable size expectations, a corrupt/undecodable fixture throws `ReceiptUnreadableError`, a PDF fixture passes through unchanged. HEIC fixture decoding will need `heic2any` mocked or a real WASM-capable test environment — flag if Vitest's `jsdom` environment can't run it and Playwright-only coverage is the fallback

**E2E (Playwright, matches existing `tests/e2e/` convention):**
- One golden-path spec per milestone once M4 ships: intent → capture → post → import → auto-match → manual-match → cancel → finalize, asserting the exact status transitions at each step (not just that the UI doesn't crash)

---

### 7. What This Plan Does Not Decide

Same three items the Slice Brief left open — this plan builds around them
with stated defaults, it doesn't resolve them:
- **Q2** — GL-code override authority at posting time. M3 ships assuming
  the Capture Clerk *can* override (the service function signature already
  takes `ledgerAccountCode` as a parameter to `postCaptureRequest`,
  separate from whatever the intent had) — but whether that's actually
  the intended answer is still the PM's call.
- **Q6** — single-card assumption, as stated above.
- **Q7** — manual-only abandonment, as stated above.

**Found while building M1, not previously flagged:** the app's actual
`UserRole` type (`src/hooks/useAuth.ts`) only has three values —
`'Depot Manager' | 'Invoice Clerk' | 'Yard Counter'`. Every role the
Slice Brief and UX Blueprint use — Cardholder, Capture Clerk, Finance
Controller/reconciler, "admin" — has no corresponding entry. M1's
`LedgerAccountAdmin` route is gated to `Depot Manager` (the existing role
every other admin-only screen in this app already uses — `/upload`,
`/data-agent`, `/trends`), since that's the closest real fit and adding
new roles to the auth system is out of scope for a single admin screen.
**This will hit every remaining milestone**, not just M1: M3's
Capture-Clerk-only Capture Queue and M4's segregation-of-duties check
(Open Question 3) both assume role distinctions that don't exist yet.
The segregation-of-duties check itself still works — it compares actor
*identity* (user id), not role — but "who is allowed to open the Capture
Queue at all" has no real role to gate on beyond `Depot Manager` /
`Invoice Clerk` today. Needs a PM decision before M3: extend `UserRole`
with real new values, or reuse the existing three loosely (e.g. any
`Depot Manager` or `Invoice Clerk` can act as Capture Clerk)?
