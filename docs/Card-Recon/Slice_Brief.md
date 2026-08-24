## Slice Brief — Credit Card Purchase Intent, Capture & Statement Reconciliation
Produced by: EXPLORATION-ARCHITECT
Date: 2026-08-24
Jira ticket: TBD — to be raised in project LSR (no ticket number invented here)

---

This epic covers three dependent slices. They are separated per the
pipeline rule that conflated features must be split: different actors,
different triggers, different outputs. Slice A0 feeds Slice A; Slice A
must exist before Slice B has anything to reconcile against.

- **Slice A0 — Purchase Intent (Quick Request):** cardholder logs a quick,
  non-blocking "I'm about to buy X" — description + ledger account/project
  — before the card is swiped.
- **Slice A — Card Purchase Capture Request:** cardholder submits a
  receipt after the purchase; a batch process posts it into the ERP,
  optionally linked back to its intent.
- **Slice B — Card Statement Reconciliation:** the monthly bank statement
  is matched against what Slice A posted.

---

## Guiding Principle — Closed-Loop Accountability

This is the actual point of the epic, not a side effect of it: **every event
that enters this pipeline must reach a visible, terminal status.** Nothing
is allowed to sit in limbo with no recorded outcome. Concretely, every
event this system tracks must end up as exactly one of:

- **Intended** (optional stage) — a `PurchaseIntent` was logged and either
  `FULFILLED` (a capture followed) or `ABANDONED` (nothing followed —
  itself a useful signal, not an error).
- **Captured** — a purchase has a posted `CardLedgerEntry` with a receipt
  attached.
- **Failed** — a request was submitted but could not be posted
  (`CardCaptureRequest.status = REJECTED`), or a bank line/ledger entry
  could not be matched by the statement deadline
  (`status = EXCEPTION_UNRESOLVED`).
- **Reconciled** — a `CardLedgerEntry` has a confirmed `CardReconMatch`
  against a `CardStatementLine`.

This is why `PurchaseIntent`, `CardStatementLine`, and `CardLedgerEntry`
all carry an explicit status field below rather than being inferred from
"does a linked/matching row exist" — an entity with no status is exactly
the silent-disappearance failure mode this epic exists to close. Every
status transition must be logged with actor + timestamp, same audit bar as
the rest of the system (see Section C, Audit/sync implications).

**Non-blocking is a hard constraint, not a nicety:** Slice A0 exists purely
for visibility. It must never delay or gate the purchase itself — that
would recreate the PO/pre-approval step this system deliberately does not
have. A cardholder can buy something with no `PurchaseIntent` on file at
all; that just means the eventual `CardCaptureRequest` in Slice A arrives
unlinked, which is a normal, allowed outcome — not an error state.

---

## Slice A0 — Purchase Intent (Quick Request)

### A. Slice Frame

**Feature name:** Purchase Intent (Quick Request)
**Actor:** Cardholder
**User outcome:** After using this feature, the Cardholder can log a quick,
optional "I'm about to buy X" — a short description and a ledger
account/project — in the moments before making a purchase, without that
logging step ever blocking or delaying the purchase itself.
**Type:** Workflow (lightweight, sidecar to the actual purchase)
**Priority tier:** Operational — strengthens accountability and resolves
Open Question 2 (GL code assignment), but Slice A works without it

### B. Slice Boundary

**In scope:**
- Quick-entry form: free-text description (e.g. "litre of oil for the
  vehicle") + a ledger account **or** project name picker, both required
  to submit — but submitting is entirely optional.
- Creates a `PurchaseIntent` row, `status = OPEN`.
- When a `CardCaptureRequest` (Slice A) is later submitted, the cardholder
  can optionally link it to an open `PurchaseIntent` — on link, the
  intent's `status → FULFILLED` and its description/ledger account
  pre-fill the capture form.
- An intent with no linked capture after a reasonable window (exact
  duration — see Open Question 7) is surfaced as `ABANDONED`, informational
  only, never auto-deleted.

**Out of scope:**
- Any form of approval/rejection of the intent — there is no gate here,
  only a log. (See "Non-blocking is a hard constraint" above.)
- Budget or spend-limit checking against the intent — not in this epic.
- Making the intent mandatory before a purchase — it stays optional by
  design.

**Events that enter this slice:**
- Cardholder opens the quick-request form and submits a description +
  ledger account/project — entirely self-initiated, no external trigger.

**Outputs that leave this slice:**
- `PurchaseIntent` rows, consumed by Slice A for optional linking.

**Reads from:** ledger account / project reference list (existing GL/cost
code source — see Open Question 2).
**Writes to:** `PurchaseIntent` (new).

**Owns state:** YES
**Transactional:** NO
**New session state:** YES — new state machine, `PurchaseIntent.status`.
**Offline-capable:** Same open question as Slice A (Open Question 4) — if
purchases happen in the field, intents likely need to as well.
**Position in flow:** UPSTREAM of Slice A; entirely optional.

---

## Slice A — Card Purchase Capture Request

### A. Slice Frame

**Feature name:** Card Purchase Capture Request
**Actor:** Cardholder (submits) / Capture Clerk (processes the batch)
**User outcome:** After using this feature, the Cardholder can submit a
purchase receipt as a Capture Request the moment they have it, and the
Capture Clerk can process queued requests in scheduled batches into posted
ERP ledger entries — with the digital receipt attached as a condition of
posting, not an afterthought.
**Type:** Workflow
**Priority tier:** MVP-critical — Slice B has nothing to reconcile without this

### B. Slice Boundary

**In scope:**
- Cardholder submits a Capture Request: receipt photo/scan (**mandatory**),
  amount, date, free-text note/reference.
- Optional: cardholder links the request to an open `PurchaseIntent`
  (Slice A0) — if linked, the intent's description and ledger
  account/project pre-fill the form and the intent moves to `FULFILLED`.
- Request enters a queue with status `SUBMITTED`.
- A batch action (manual "Run Batch" for MVP — see Open Question 1) picks up
  `SUBMITTED` requests and posts each as a `CardLedgerEntry`: vendor = the
  card account, reference = the receipt's own reference, GL/cost code, date,
  amount, `receiptUrl`, and the linked `intentId` if one exists.
- Request status: `SUBMITTED → BATCHED → POSTED`, or `REJECTED` if the
  Capture Clerk cannot post it (bad amount, unreadable receipt).
- Receipt file stored in a new Supabase Storage bucket (`card-receipts`),
  same pattern as `invoice-documents` in `DispatchDetailView.tsx`.

**Out of scope:**
- Pre-purchase approval / PO workflow — the purchase itself stays
  informal-approval-only; this slice does not touch that.
- Bank statement reconciliation — Slice B.
- OCR / auto-extraction of receipt fields — manual entry only for MVP.

**Events that enter this slice:**
- Cardholder taps "Submit Receipt".
- Capture Clerk triggers a batch run (or a scheduled job — TBD).

**Outputs that leave this slice:**
- Posted `CardLedgerEntry` rows — consumed by Slice B.
- Receipt file in `card-receipts` storage, referenced by URL.

**Reads from:** `PurchaseIntent` (Slice A0, optional lookup for linking).
**Writes to:** `CardCaptureRequest` (new), `CardLedgerEntry` (new),
`card-receipts` storage bucket; updates `PurchaseIntent.status` when linked.

**Owns state:** YES
**Transactional:** Submission — NO. Batch posting — YES per request.
**New session state:** YES — new state machine, `CardCaptureRequest.status`.
**Offline-capable:** Open — see Open Question 4.
**Position in flow:** UPSTREAM of Slice B.

---

## Slice B — Card Statement Reconciliation

### A. Slice Frame

**Feature name:** Card Statement Reconciliation
**Actor:** Depot Manager / Finance Controller (reconciler — role TBD, see
Open Question 3)
**User outcome:** After using this feature, the reconciler can import the
monthly card statement CSV and match each bank line against posted
`CardLedgerEntry` records, resolving exceptions before finalizing the
period.
**Type:** Workflow — mirrors the existing `ReconciliationSession` pattern
**Priority tier:** MVP-critical

### B. Slice Boundary

**In scope:**
- CSV statement import (PapaParse — already used for ERP import) →
  `CardStatementLine` rows.
- Auto-match: `AUTO_EXACT` (amount + date exact), `AUTO_FUZZY` (amount
  exact, date within an N-day window) — mirrors `AllocationEvent.matchMethod`.
- Manual match/unmatch UI for everything auto-match doesn't resolve.
- `CardReconSession` per statement period: `OPEN → DRAFT → FINALIZED`,
  mirroring `ReconciliationSession`.
- Exception surfacing: unmatched bank line (a charge nobody captured) vs.
  unmatched ledger entry (keyed wrong, wrong period) — shown separately.
- Receipt image from Slice A displayed inline on each ledger entry during
  exception review.
- Every `CardStatementLine` carries `status ∈ {UNMATCHED, MATCHED,
  EXCEPTION_UNRESOLVED}`; every `CardLedgerEntry` carries
  `reconciliationStatus ∈ {UNRECONCILED, RECONCILED, EXCEPTION_UNRESOLVED}`.
  A line/entry with no status is not a valid state — see Guiding Principle
  above.

**Out of scope:**
- Multi-card support — only one card/account exists today; deferred (see
  Open Question 6).
- Automated bank feed / API — CSV import only; the bank only offers a
  downloadable statement.
- Continuous/real-time reconciliation — monthly cadence only, per stated
  volume.

**Events that enter this slice:**
- The monthly card statement CSV is uploaded — this is the **sole** trigger
  for the slice. There is no separate "Start Reconciliation" action: the
  upload itself creates the `CardReconSession` (`OPEN`) and immediately
  runs the `AUTO_EXACT`/`AUTO_FUZZY` match pass against posted
  `CardLedgerEntry` rows, before the reconciler does anything manually.

**Outputs that leave this slice:**
- `CardReconMatch` records.
- `CardReconSession` finalized state.
- Exception report — on-screen, mirrors the Unmatched Report in LSR-5.

**Reads from:** `CardLedgerEntry` (from Slice A), `CardStatementLine`.
**Writes to:** `CardStatementLine`, `CardReconMatch`, `CardReconSession`.

**Owns state:** YES
**Transactional:** YES — every match/unmatch action.
**New session state:** YES — new state machine, `CardReconSession.status`
(mirrors `ReconciliationSession`).
**Offline-capable:** NOT REQUIRED — same precedent as `ReconciliationSession`
(desktop workbench, not the field PWA).
**Position in flow:** DOWNSTREAM of Slice A.

---

### C. Dependency Map (all three slices)

**Domain entities:** `PurchaseIntent`, `CardCaptureRequest`,
`CardLedgerEntry`, `CardStatementLine`, `CardReconMatch`, `CardReconSession`
**Session states touched:** New — `PurchaseIntent.status`,
`CardCaptureRequest.status`, `CardReconSession.status`,
`CardStatementLine.status`, `CardLedgerEntry.reconciliationStatus`. None
reuse an existing state machine.
**Invariants touched:** INV-002 (date format), INV-005 (ID integrity — new
FK contracts must be documented before code exists, incl.
`CardCaptureRequest.intentId → PurchaseIntent.id`), INV-006 (status
casing — a convention must be picked), INV-008 (analog: an unreconciled
line is a disclosed state, never silently corrected), INV-009 (ZAR display)
**Existing Supabase views/queries:** None reused directly — but the
`invoice-documents` storage upload pattern is reused as-is.
**New Supabase views/queries needed:** `card_recon_summary` (mirrors
`reconciliation_summary`), `card_capture_queue` (pending-request view for
the Capture Clerk), `open_purchase_intents` (unlinked/`OPEN` intents, for
the linking picker in Slice A)
**Dexie stores touched:** None decided — depends on Open Question 4.
**External libraries:** PapaParse (already used), Supabase Storage
(already used).
**UI surfaces:** New — `PurchaseIntentQuickForm`, `CardCaptureForm`,
`CardCaptureQueue` (Capture Clerk batch view), `CardReconWorkspace`
(mirrors `ReconciliationWorkspace`).
**Offline implications:** Open for Slice A0 and Slice A (field
submission); none for Slice B.
**Audit/sync implications:** Every batch-post and every match/unmatch
action must be logged with actor + timestamp — same audit-trail bar as the
rest of the system.

---

### D. Non-Negotiable Constraints

| Constraint | Source | What it means for this slice |
|---|---|---|
| No hardcoded reference data | INV-001 | Card account(s) and GL/cost codes are fetched from DB, never hardcoded in the capture form |
| `dd MMM yyyy` date display | INV-002 | Statement dates and capture dates use the shared `formatDate()` utility |
| Every UI action wired | INV-003 | Submit / Run Batch / Match buttons need real handlers, or explicit `disabled` + `TODO: LSR-{ticket}` |
| Dark theme tokens only | INV-004 | New screens use the existing Tailwind token set — no new component library |
| ID type integrity | INV-005 | Contract fixed now: `CardReconMatch.statementLineId → CardStatementLine.id`, `CardReconMatch.ledgerEntryId → CardLedgerEntry.id` — never cross-assign |
| Status casing convention | INV-006 | Match the `ReconciliationSession` precedent — ALL CAPS: `PurchaseIntent.status ∈ {OPEN, FULFILLED, ABANDONED}`; `CardCaptureRequest.status ∈ {SUBMITTED, BATCHED, POSTED, REJECTED}`; `CardReconSession.status ∈ {OPEN, DRAFT, FINALIZED}`; `CardStatementLine.status ∈ {UNMATCHED, MATCHED, EXCEPTION_UNRESOLVED}`; `CardLedgerEntry.reconciliationStatus ∈ {UNRECONCILED, RECONCILED, EXCEPTION_UNRESOLVED}` |
| Variance is informational, never a silent gate | INV-008 (analog) | An unmatched bank line or ledger entry must be surfaced as a disclosed exception, never auto-written-off |
| ZAR currency format | INV-009 | All amounts via `formatZAR()` |
| Mandatory receipt attachment | Decided this session | `CardLedgerEntry` cannot exist without `receiptUrl` — enforced in the UI AND as a DB constraint, not just a UI nicety |
| Closed-loop accountability — no event without a terminal status | Decided this session (Guiding Principle above) | Every `PurchaseIntent`, `CardCaptureRequest`, `CardStatementLine`, and `CardLedgerEntry` must always resolve to a defined status. A record with a NULL/undefined status field, or a bank line silently dropped from an import, is a bug — not a display gap |
| Purchase Intent must never block the purchase | Decided this session (Slice A0) | `PurchaseIntent` submission has no validation that can prevent or delay a purchase — no required-field check runs against the cardholder's ability to buy. It is a log, never a gate |

---

### E. Open Questions Register

| # | Question | Blocks | Options | Status |
|---|---|---|---|---|
| 1 | What actually triggers a batch run — a fixed schedule (cron) or a manual "Run Batch" button? | `CardCaptureRequest` state machine design; whether a scheduler is needed at all for MVP | (a) Manual button only for MVP, (b) weekly cron, (c) both — manual override on a schedule | Awaiting PM |
| 2 | Who assigns the GL/cost code — **partially resolved**: Slice A0 has the cardholder pick it at intent time. Still open: can the Capture Clerk override it at batch-posting (e.g. the cardholder guessed wrong), and what happens when a capture arrives with no linked intent at all? | Capture form design; whether the Clerk has override authority | (a) Cardholder's Slice A0 pick is final, (b) Clerk can override at posting, (c) unlinked captures require the Clerk to pick from scratch | Awaiting PM |
| 3 | Who owns resolving Slice B exceptions — the same person who captures, or a separate reviewer/controller? | Role/permission model; whether a second-approver control is enforced in the state machine | (a) Single role, (b) capturer ≠ reconciler enforced by the system, (c) capturer ≠ reconciler by policy only, not enforced | Awaiting PM (raised earlier, still unresolved) |
| 4 | Does Capture Request (and now Purchase Intent) submission need to work offline (purchase happens in the field, no signal)? | Dexie store design; sync strategy for Slice A0 and Slice A | (a) Always online, like `ReconciliationSession`, (b) offline-capable like the Yard Counter PWA | Awaiting PM |
| 5 | When a bank line has no matching ledger entry after the monthly cycle closes, must it block `FINALIZED`, or can it carry over as a standing exception? Either way it stays `EXCEPTION_UNRESOLVED` and visible per the Guiding Principle — this only decides whether it also blocks the session. | Exception-lane design; `FINALIZED` gate rules for `CardReconSession` | (a) Blocks finalize, like `UNCLASSIFIED_EXCEPTION`, (b) non-blocking, like `Suspense-PMT` | Awaiting PM |
| 6 | Only one card exists today — should the schema still carry a `card_id` FK from day one, or is a single-card assumption acceptable to hardcode for MVP? | Schema design for `CardLedgerEntry` / `CardReconSession` | (a) Hardcode single card for MVP, add `card_id` later, (b) add `card_id` now even with one row, to avoid a migration later | Awaiting PM |
| 7 | How long does an unlinked `PurchaseIntent` stay `OPEN` before it's surfaced as `ABANDONED`? | `PurchaseIntent` state machine — the exact `OPEN → ABANDONED` transition trigger | (a) Fixed window (e.g. 14/30 days), (b) never auto-transitions — stays `OPEN` indefinitely until manually marked, (c) tied to the next Slice B statement close | Awaiting PM |

---

### Recommended Vertical Slice

The smallest end-to-end path that proves the whole pipeline: a Cardholder
optionally logs a Purchase Intent ("litre of oil for the vehicle" + a
ledger account) → later submits one Capture Request with a mandatory
receipt photo, linked back to that intent → a Capture Clerk manually runs
a batch (no cron yet) that posts it as a `CardLedgerEntry` carrying the
intent's GL code → a Depot Manager uploads one real monthly statement CSV
→ the system auto-matches on exact amount+date, everything else lands in a
manual-match exception list → the Depot Manager manually matches/clears the
rest → the session is finalized. This validates intent → request → post →
import → match → finalize before adding scheduling, GL-code override
rules, or fuzzy matching.

---

### Ready for Stage 2?
- [x] All five sections complete
- [x] Scope boundary is explicit (in AND out)
- [x] All dependencies named
- [x] All constraints extracted from governance docs
- [x] Open Questions Register complete — 7 open, unresolved
- [x] Offline implications stated (flagged as open, not assumed)
- Awaiting PM approval and resolution of open questions
