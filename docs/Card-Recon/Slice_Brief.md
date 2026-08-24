## Slice Brief — Credit Card Purchase Intent, Capture & Statement Reconciliation
Produced by: EXPLORATION-ARCHITECT
Date: 2026-08-24
Jira ticket: TBD — to be raised in project LSR (no ticket number invented here)

---

This epic covers four dependent slices. They are separated per the
pipeline rule that conflated features must be split: different actors,
different triggers, different outputs. Slice 0 is a hard prerequisite for
Slice A0 (Open Question 8, resolved — discovered during UX screen audit,
not part of the original request); Slice A0 feeds Slice A; Slice A must
exist before Slice B has anything to reconcile against.

- **Slice 0 — Ledger Account Admin (Master Data):** an admin maintains the
  GL/cost code reference list that Slices A0 and A pick from — this table
  does not exist anywhere in the codebase today.
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
  (`status = EXCEPTION_UNRESOLVED`, or explicitly written off as
  `EXCEPTION_CANCELLED` — see Open Question 5, resolved).
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

## Slice 0 — Ledger Account Admin (Master Data)

### A. Slice Frame

**Feature name:** Ledger Account Admin
**Actor:** Depot Manager / Finance Controller (admin)
**User outcome:** After using this feature, an admin can create, rename,
and deactivate the ledger account/project codes that Slice A0's Quick
Request form and Slice A's Capture form pick from — so that data comes
from the database, never a hardcoded list, satisfying INV-001.
**Type:** Admin surface
**Priority tier:** MVP-critical — Slice A0 cannot function without this
(Open Question 8, resolved)

### B. Slice Boundary

**In scope:**
- List view of all `LedgerAccount` rows: code, display name, active/inactive.
- Create: code + display name, both required. Code is immutable once
  created — historical `CardCaptureRequest`/`CardLedgerEntry`/
  `PurchaseIntent` rows reference it by code, and changing it after the
  fact would silently corrupt those references (INV-005 spirit).
- Edit: display name only.
- Deactivate (soft — `active = false`), never hard-delete. An inactive
  account disappears from Slice A0/A pickers going forward, but every
  historical record that already references it keeps displaying its name
  unchanged — deleting it would violate the closed-loop accountability
  principle by breaking the audit trail on old entries.

**Out of scope:**
- Budget or spend-limit configuration per account — not this epic.
- Hierarchical/parent-child account structures — flat list only for MVP.
- Bulk import — one-at-a-time manual entry, given the expected small
  number of accounts at this volume.

**Events that enter this slice:**
- Admin opens the Ledger Account Admin screen — self-initiated, no
  external trigger.

**Outputs that leave this slice:**
- `LedgerAccount` rows, consumed by Slice A0's account picker and Slice
  A's GL-code confirm/override step.

**Reads from:** none — net-new domain.
**Writes to:** `LedgerAccount` (new).

**Owns state:** YES
**Transactional:** NO — simple CRUD, no multi-row transaction needed.
**New session state:** NO — `LedgerAccount` has a simple `active` boolean,
not a full lifecycle state machine; it doesn't participate in the
Guiding Principle's terminal-status model the way the other five entities do.
**Offline-capable:** NOT REQUIRED — desktop admin screen.
**Position in flow:** UPSTREAM of Slice A0 and Slice A — a hard
prerequisite, not merely upstream-and-optional like Slice A0 is to A.

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
- Offline capability — **deferred to a later version** (Open Question 4,
  resolved). This version requires connectivity to submit an intent.

**Events that enter this slice:**
- Cardholder opens the quick-request form and submits a description +
  ledger account/project — entirely self-initiated, no external trigger.

**Outputs that leave this slice:**
- `PurchaseIntent` rows, consumed by Slice A for optional linking.

**Reads from:** `LedgerAccount` (Slice 0, new — Open Question 8, resolved).
**Writes to:** `PurchaseIntent` (new).

**Owns state:** YES
**Transactional:** NO
**New session state:** YES — new state machine, `PurchaseIntent.status`.
**Offline-capable:** NOT REQUIRED this version — deferred to a later
version (Open Question 4, resolved). Requires connectivity to submit.
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
- Cardholder submits a Capture Request: receipt evidence (**mandatory** —
  see FR-CCR-RECEIPT-001 below), amount, date, free-text note/reference.
- Optional: cardholder links the request to an open `PurchaseIntent`
  (Slice A0) — if linked, the intent's description and ledger
  account/project pre-fill the form and the intent moves to `FULFILLED`.
- Request enters a queue with status `SUBMITTED`.
- A manual "Run Batch" action (Open Question 1, resolved — see Section D)
  lets the Capture Clerk review queued requests and post each as a
  `CardLedgerEntry`: vendor = the card account, reference = the receipt's
  own reference, GL/cost code, date, amount, `receiptUrl`, and the linked
  `intentId` if one exists. No cron/scheduled auto-posting for MVP —
  posting requires human review (receipt legibility, GL code
  confirm/override) that a scheduler cannot perform.
- The queue view surfaces pending count and the age of the oldest pending
  request, so a neglected queue is visible rather than silent — the cheap
  substitute for a scheduler.
- Request status: `SUBMITTED → BATCHED → POSTED`, or `REJECTED` if the
  Capture Clerk cannot post it (bad amount, unreadable receipt).
- Receipt file stored in a new Supabase Storage bucket (`card-receipts`)
  — **private**, not the public pattern `invoice-documents` uses; see
  FR-CCR-RECEIPT-001 below.

**FR-CCR-RECEIPT-001 — Receipt Attachment and Storage Optimization**
(supplied this session, incorporated in full — not summarized down):

- Accepts a photo (JPEG/PNG/HEIC) or an existing file, or a digital PDF.
  Never requires a traditional scanned document.
- JPEG/PNG/HEIC uploads are processed client-side before storage:
  orientation-corrected, resized to a max 2000px longest edge (aspect
  ratio preserved), converted to JPEG at ~80% quality, EXIF metadata
  (including location) stripped, targeted at ≤500KB where achievable
  without making the receipt unreadable. A processed image that can't be
  reliably rendered/read is rejected before submit.
- PDFs are stored as uploaded, subject to the configured upload-size limit
  — no image processing applied.
- One processed evidence file per capture request; original is not
  retained separately unless a future compliance need requires it.
- Stored in `card-receipts`, at a unique, non-guessable path.
- `receiptUrl`, MIME type, processed size, and upload timestamp are all
  recorded (see Dev Plan's schema section for the exact fields).
- **`CardLedgerEntry` cannot be created without a valid `receiptUrl`** —
  already locked as a non-negotiable constraint below; this FR doesn't
  change that, it specifies what "valid" means.
- **Files are not publicly accessible without authorization** — this is
  why the bucket is private, not the `invoice-documents` pattern (see
  Dev Plan for the signed-URL access mechanism).
- UI label is "Attach receipt", never "Scan receipt". Mobile offers both
  "Take photo" and "Choose file". A preview is shown before submission.
  Submit stays disabled until a valid receipt is attached. Processing and
  upload progress are visible. On failure, the form retains every entered
  field and allows retry — this applies to optimization failures and
  upload failures alike, not just network errors.
- Upload failure must not create a partial `CardCaptureRequest` or
  `CardLedgerEntry` — see the atomicity requirement in Dev Plan's service
  layer section.
- A `CardLedgerEntry` cannot be posted if its receipt file is missing or
  inaccessible — `postCaptureRequest` re-verifies the object exists
  before creating the ledger entry, not just trusting the stored path.

**Out of scope:**
- Pre-purchase approval / PO workflow — the purchase itself stays
  informal-approval-only; this slice does not touch that.
- Bank statement reconciliation — Slice B.
- OCR / auto-extraction of receipt fields — manual entry only for MVP.
- Offline capability — **deferred to a later version** (Open Question 4,
  resolved). This version requires connectivity to submit a Capture
  Request; a cardholder purchasing in the field waits until they're back
  online.

**Events that enter this slice:**
- Cardholder taps "Submit Receipt".
- Capture Clerk manually triggers "Run Batch" — the sole posting trigger
  for MVP (Open Question 1, resolved).

**Outputs that leave this slice:**
- Posted `CardLedgerEntry` rows — consumed by Slice B.
- Receipt file in `card-receipts` storage, referenced by URL.

**Reads from:** `PurchaseIntent` (Slice A0, optional lookup for linking).
**Writes to:** `CardCaptureRequest` (new), `CardLedgerEntry` (new),
`card-receipts` storage bucket; updates `PurchaseIntent.status` when linked.

**Owns state:** YES
**Transactional:** Submission — NO. Batch posting — YES per request.
**New session state:** YES — new state machine, `CardCaptureRequest.status`.
**Offline-capable:** NOT REQUIRED this version — deferred to a later
version (Open Question 4, resolved). Requires connectivity to submit.
**Position in flow:** UPSTREAM of Slice B.

---

## Slice B — Card Statement Reconciliation

### A. Slice Frame

**Feature name:** Card Statement Reconciliation
**Actor:** Depot Manager / Finance Controller — **any user other than the
original capturer of a given entry** (Open Question 3, resolved — see
Section D)
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
- Manual match/unmatch UI for everything auto-match doesn't resolve — a
  `MANUAL` match/clear is blocked if the acting user is the entry's
  original capturer (Open Question 3, resolved — segregation of duties).
- `CardReconSession` per statement period: `OPEN → DRAFT → FINALIZED`,
  mirroring `ReconciliationSession`.
- Exception surfacing: unmatched bank line (a charge nobody captured) vs.
  unmatched ledger entry (keyed wrong, wrong period) — shown separately.
- Receipt image from Slice A displayed inline on each ledger entry during
  exception review.
- Every `CardStatementLine` carries `status ∈ {UNMATCHED, MATCHED,
  EXCEPTION_UNRESOLVED, EXCEPTION_CANCELLED}`; every `CardLedgerEntry`
  carries `reconciliationStatus ∈ {UNRECONCILED, RECONCILED,
  EXCEPTION_UNRESOLVED, EXCEPTION_CANCELLED}`. A line/entry with no status
  is not a valid state — see Guiding Principle above.
- `FINALIZED` is blocked while any `CardStatementLine` in this session is
  `UNMATCHED` or `EXCEPTION_UNRESOLVED` (Open Question 5, resolved). The
  only way past a blocking exception is an explicit **"Cancel Exception"**
  action — the reconciler states a reason (required, same pattern as
  Capture Clerk rejection in Slice A), and the item moves to
  `EXCEPTION_CANCELLED`: permanently visible, logged with actor + reason +
  timestamp, but no longer blocking. There is no silent non-blocking path
  for a bank line — every one either gets matched or gets a reasoned,
  attributed cancellation.
  **Refined during M4 build:** the gate checks the bank-line side only,
  not `CardLedgerEntry.reconciliationStatus`. An entry posted near this
  statement period's end may legitimately belong on *next* month's
  statement — auto-flagging it as this session's exception would force a
  decision on something that isn't actually overdue, and would also
  remove it from future auto-match candidate pools (which only query
  `UNRECONCILED`), permanently orphaning it. A `CardLedgerEntry` can still
  be manually matched or explicitly Cancelled in any session's workspace
  — it just doesn't block a *specific* session's Finalize on its own.

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

**Domain entities:** `LedgerAccount` (Slice 0, new master-data entity —
Open Question 8, resolved; this epic is the first thing in the codebase to
need a GL/cost code reference table, none existed before), `PurchaseIntent`,
`CardCaptureRequest`, `CardLedgerEntry`, `CardStatementLine`,
`CardReconMatch`, `CardReconSession`
**Session states touched:** New — `PurchaseIntent.status`,
`CardCaptureRequest.status`, `CardReconSession.status`,
`CardStatementLine.status`, `CardLedgerEntry.reconciliationStatus`.
`LedgerAccount.active` is a simple boolean, not a lifecycle state machine.
None reuse an existing state machine.
**Invariants touched:** INV-001 (no hardcoded reference data — this is why
Slice 0 exists), INV-002 (date format), INV-005 (ID integrity — new FK
contracts must be documented before code exists, incl.
`CardCaptureRequest.intentId → PurchaseIntent.id`, `PurchaseIntent.ledgerAccountCode
→ LedgerAccount.code`), INV-006 (status casing — a convention must be
picked), INV-008 (analog: an unreconciled line is a disclosed state,
never silently corrected), INV-009 (ZAR display)
**Existing Supabase views/queries:** None reused directly. The
`invoice-documents` storage *upload* pattern is a starting reference, but
NOT reused as-is — that bucket is public; `card-receipts` is private per
FR-CCR-RECEIPT-001, so access uses signed URLs, a new pattern for this
codebase.
**New Supabase views/queries needed:** `card_recon_summary` (mirrors
`reconciliation_summary`), `card_capture_queue` (pending-request view for
the Capture Clerk), `open_purchase_intents` (unlinked/`OPEN` intents, for
the linking picker in Slice A), `active_ledger_accounts` (for both pickers)
**Dexie stores touched:** None — resolved by Open Question 4 (offline
deferred to a later version).
**External libraries:** PapaParse (already used), Supabase Storage
(already used), `uuid` (already a dependency, now also used for storage
paths — see Dev Plan Section 2), `heic2any` (new dependency —
FR-CCR-RECEIPT-001's HEIC decode step; browsers can't decode HEIC via
Canvas/`createImageBitmap` outside Safari on Apple hardware).
**UI surfaces:** New — `LedgerAccountAdmin`, `PurchaseIntentQuickForm`,
`MyPurchaseIntents`, `CardCaptureForm`, `MyCaptureRequests`,
`CardCaptureQueue` (Capture Clerk batch view), `CardReconDashboard`,
`CardReconWorkspace` (mirrors `ReconciliationWorkspace`).
**Offline implications:** None for this version — deferred (Open Question
4, resolved) for Slice A0 and Slice A; none applicable to Slice B.
**Audit/sync implications:** Every batch-post and every match/unmatch
action must be logged with actor + timestamp — same audit-trail bar as the
rest of the system.

---

### D. Non-Negotiable Constraints

| Constraint | Source | What it means for this slice |
|---|---|---|
| No hardcoded reference data | INV-001 | Card account(s) and GL/cost codes are fetched from DB, never hardcoded in the capture form. Satisfied by Slice 0 (`LedgerAccount` table + admin screen) — Open Question 8, resolved |
| `dd MMM yyyy` date display | INV-002 | Statement dates and capture dates use the shared `formatDate()` utility |
| Every UI action wired | INV-003 | Submit / Run Batch / Match buttons need real handlers, or explicit `disabled` + `TODO: LSR-{ticket}` |
| Dark theme tokens only | INV-004 | New screens use the existing Tailwind token set — no new component library |
| ID type integrity | INV-005 | Contract fixed now: `CardReconMatch.statementLineId → CardStatementLine.id`, `CardReconMatch.ledgerEntryId → CardLedgerEntry.id` — never cross-assign |
| Status casing convention | INV-006 | Match the `ReconciliationSession` precedent — ALL CAPS: `PurchaseIntent.status ∈ {OPEN, FULFILLED, ABANDONED}`; `CardCaptureRequest.status ∈ {SUBMITTED, BATCHED, POSTED, REJECTED}`; `CardReconSession.status ∈ {OPEN, DRAFT, FINALIZED}`; `CardStatementLine.status ∈ {UNMATCHED, MATCHED, EXCEPTION_UNRESOLVED, EXCEPTION_CANCELLED}`; `CardLedgerEntry.reconciliationStatus ∈ {UNRECONCILED, RECONCILED, EXCEPTION_UNRESOLVED, EXCEPTION_CANCELLED}` |
| Variance is informational, never a silent gate | INV-008 (analog) | An unmatched bank line or ledger entry must be surfaced as a disclosed exception, never auto-written-off |
| ZAR currency format | INV-009 | All amounts via `formatZAR()` |
| Mandatory receipt attachment | Decided this session | `CardLedgerEntry` cannot exist without `receiptUrl` — enforced in the UI AND as a DB constraint, not just a UI nicety |
| Receipt evidence is processed, not raw-stored — orientation, resize ≤2000px, JPEG ~80%, EXIF stripped, ≤500KB target | FR-CCR-RECEIPT-001 | PDFs pass through unprocessed subject to the upload-size limit; a processed image that can't be reliably read is rejected client-side before submit is even possible |
| Receipt storage must not be publicly accessible without authorization | FR-CCR-RECEIPT-001 | `card-receipts` bucket is private (`public = false`), unlike the `invoice-documents` precedent — access is via authenticated session or a short-lived signed URL, never a permanent public link |
| Capture submission is atomic — no partial records on failure | FR-CCR-RECEIPT-001 | A failed upload or processing step must not leave a `CardCaptureRequest` or `CardLedgerEntry` half-created; the DB write only happens after the file is successfully processed and stored |
| UI copy: "Attach receipt", never "Scan receipt" | FR-CCR-RECEIPT-001 | Applies to every label, button, and empty/error state referencing this action across Slice A's screens |
| Closed-loop accountability — no event without a terminal status | Decided this session (Guiding Principle above) | Every `PurchaseIntent`, `CardCaptureRequest`, `CardStatementLine`, and `CardLedgerEntry` must always resolve to a defined status. A record with a NULL/undefined status field, or a bank line silently dropped from an import, is a bug — not a display gap |
| Purchase Intent must never block the purchase | Decided this session (Slice A0) | `PurchaseIntent` submission has no validation that can prevent or delay a purchase — no required-field check runs against the cardholder's ability to buy. It is a log, never a gate |
| No scheduled auto-posting — batch posting is a manual, reviewed action | PM Decision, Open Question 1 (resolved this session) | `CardCaptureRequest → CardLedgerEntry` posting only happens via the Capture Clerk's manual "Run Batch" action. No cron/scheduled job posts on its own — GL code confirmation and receipt review require a human. The queue view must surface pending count + oldest-pending age as the substitute safeguard against neglect |
| Capturer ≠ reconciler on the same entry — segregation of duties | PM Decision, Open Question 3 (resolved this session) | The system checks `actorId ≠ CardLedgerEntry.capturedBy` before allowing any `MANUAL` match or exception clear in Slice B. `AUTO_EXACT`/`AUTO_FUZZY` matches are exempt — they're system-generated, not a self-attestation. This is enforced at the entry level, not via a separate fixed "reconciler" role — any user other than the original capturer may act |
| Unresolved exceptions block `FINALIZED`; only an explicit, reasoned Cancel lifts the block | PM Decision, Open Question 5 (resolved this session) | `CardReconSession → FINALIZED` is rejected (`409`) while any `EXCEPTION_UNRESOLVED` item exists. The only way past it is "Cancel Exception" — a required reason, logged with actor + timestamp, moving the item to `EXCEPTION_CANCELLED`. There is no non-blocking/silent-carryover path |
| Offline capability deferred, not designed for this version | PM Decision, Open Question 4 (resolved this session) | Slice A0 and Slice A require connectivity to submit. No Dexie store, no offline queue, no sync-status indicator for this epic in this version. Revisit as a separate future slice if field connectivity becomes a real blocker |
| Build a real `LedgerAccount` table + admin screen — no hardcoded exception, no borrowing from another epic | PM Decision, Open Question 8 (resolved this session) | `LedgerAccount.code` is immutable once created (historical records reference it by code); deactivation is a soft `active = false` flag, never a hard delete — deleting would break the audit trail on every historical entry that references it, violating the Guiding Principle |

---

### E. Open Questions Register

| # | Question | Blocks | Options | Status |
|---|---|---|---|---|
| 1 | ~~What actually triggers a batch run — a fixed schedule (cron) or a manual "Run Batch" button?~~ | `CardCaptureRequest` state machine design; whether a scheduler is needed at all for MVP | **Resolved: (a)** — manual "Run Batch" only, no cron, for MVP. Posting requires human review (receipt legibility, GL code confirm/override) that a scheduler can't perform, so full automation was never really an option. Neglect risk covered by a UI safeguard instead of infrastructure: the queue view shows pending count + oldest-pending age. Scheduling stays an easy fast-follow if volume grows — the state machine doesn't change, only the trigger. | **RESOLVED — PM Decision, 2026-08-24** |
| 2 | Who assigns the GL/cost code — **partially resolved**: Slice A0 has the cardholder pick it at intent time. Still open: can the Capture Clerk override it at batch-posting (e.g. the cardholder guessed wrong), and what happens when a capture arrives with no linked intent at all? | Capture form design; whether the Clerk has override authority | (a) Cardholder's Slice A0 pick is final, (b) Clerk can override at posting, (c) unlinked captures require the Clerk to pick from scratch | Awaiting PM |
| 3 | ~~Who owns resolving Slice B exceptions — the same person who captures, or a separate reviewer/controller?~~ | Role/permission model; whether a second-approver control is enforced in the state machine | **Resolved: (b)** — capturer ≠ reconciler, enforced by the system at the entry level (`actorId ≠ capturedBy` on any `MANUAL` match/clear), not via a dedicated fixed "reconciler" role. Rationale: the front-end purchase has no real control (informal approval only), so this is the one place a compensating control can live; entry-level blocking gets that value without requiring dedicated staffing at low transaction volume. | **RESOLVED — PM Decision, 2026-08-24** |
| 4 | ~~Does Capture Request (and now Purchase Intent) submission need to work offline (purchase happens in the field, no signal)?~~ | Dexie store design; sync strategy for Slice A0 and Slice A | **Resolved: deferred to a later version.** Slice A0 and Slice A require connectivity for this version — no Dexie store, no offline queue, no sync indicator built now. Revisit as its own slice later if field connectivity becomes a real blocker. | **RESOLVED — PM Decision, 2026-08-24 (deferred)** |
| 5 | ~~When a bank line has no matching ledger entry after the monthly cycle closes, must it block `FINALIZED`, or can it carry over as a standing exception?~~ | Exception-lane design; `FINALIZED` gate rules for `CardReconSession` | **Resolved: blocks, with an explicit Cancel escape hatch.** `FINALIZED` is rejected while any `EXCEPTION_UNRESOLVED` item exists (like `UNCLASSIFIED_EXCEPTION`) — but unlike that lane, the reconciler can explicitly "Cancel Exception" with a required reason, moving it to `EXCEPTION_CANCELLED`: permanently visible and logged, no longer blocking. No silent non-blocking carryover — every exception ends in either a match or a reasoned, attributed cancellation. | **RESOLVED — PM Decision, 2026-08-24** |
| 6 | Only one card exists today — should the schema still carry a `card_id` FK from day one, or is a single-card assumption acceptable to hardcode for MVP? | Schema design for `CardLedgerEntry` / `CardReconSession` | (a) Hardcode single card for MVP, add `card_id` later, (b) add `card_id` now even with one row, to avoid a migration later | Awaiting PM |
| 7 | How long does an unlinked `PurchaseIntent` stay `OPEN` before it's surfaced as `ABANDONED`? | `PurchaseIntent` state machine — the exact `OPEN → ABANDONED` transition trigger | (a) Fixed window (e.g. 14/30 days), (b) never auto-transitions — stays `OPEN` indefinitely until manually marked, (c) tied to the next Slice B statement close | Awaiting PM |
| 8 | ~~No GL/cost code or ledger account reference table exists anywhere in this codebase — does this epic build one, or is there another source?~~ | Slice A0 form design; `LedgerAccountAdmin` screen in/out of scope; whether Slice A0 can build at all without this | **Resolved: (a)** — build a minimal `LedgerAccount` table + admin CRUD screen as part of this epic (now **Slice 0**, with its own full Slice Frame/Boundary above). Code immutable once created, deactivation is soft-delete only — see Section D. | **RESOLVED — PM Decision, 2026-08-24** |

---

### Recommended Vertical Slice

The smallest end-to-end path that proves the whole pipeline: an admin
creates one `LedgerAccount` in the new admin screen → a Cardholder
optionally logs a Purchase Intent ("litre of oil for the vehicle" + that
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
- [x] Open Questions Register complete — 3 open (Q2, Q6, Q7), 5 resolved (Q1, Q3, Q4, Q5, Q8)
- [x] Offline implications stated (resolved — deferred to a later version)
- Awaiting PM approval and resolution of open questions
