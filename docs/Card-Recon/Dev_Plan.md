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
  receiptUrl       String             // NOT NULL — mandatory (Slice Brief Section D)
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

**Migration classification:** entirely additive — seven new tables, zero
changes to existing ones. No backfill needed, no destructive risk.

---

### 2. Storage

New Supabase Storage bucket `card-receipts`, path convention mirroring
`invoice-documents` in `DispatchDetailView.tsx`:
```
requests/{captureRequestId}_{timestamp}.{ext}
```
Both `CardCaptureRequest.receiptUrl` and `CardLedgerEntry.receiptUrl`
store the same public URL once posted.

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

// Slice A
submitCaptureRequest(fields, receiptFile, intentId?): CardCaptureRequest
  // rejects if no receiptFile — INV mandatory-receipt check lives here,
  // not just in the UI form
listCaptureQueue(): CardCaptureRequest[]                // status = SUBMITTED
postCaptureRequest(id, ledgerAccountCode, actorId): CardLedgerEntry
  // creates CardLedgerEntry, sets CardCaptureRequest.status = POSTED,
  // and PurchaseIntent.status = FULFILLED if intentId was set
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
- `CardCaptureForm.tsx`, `MyCaptureRequests.tsx`, `CardCaptureQueue.tsx`
- Depends on M2 for the optional intent-link picker (M3 still works standalone if M2 shipped but no intent exists)
- Exit criteria: a cardholder submits a receipt, a Capture Clerk posts it, a `CardLedgerEntry` exists with `reconciliationStatus = UNRECONCILED`

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
