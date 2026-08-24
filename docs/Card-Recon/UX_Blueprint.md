## UX Flow — Credit Card Purchase Intent, Capture & Statement Reconciliation
Produced by: UX-DESIGN-AGENT
Slice Brief: `docs/Card-Recon/Slice_Brief.md` (5 open, 2 resolved)
PRD approved: N/A — not yet produced (Stage 2 skipped at PM request)
Architecture Note approved: N/A — not yet produced (Stage 3 skipped at PM request)
Date: 2026-08-24

---

> **Pipeline deviation, noted per the Authority Model:** this UX Flow is
> normally Stage 5, built from an approved PRD (Stage 2) and Architecture
> Note (Stage 3). Neither exists for this epic yet. Everything below is
> derived directly from the approved Slice Brief's Section D (constraints)
> and Section E (Open Questions Register) in their place. Two open
> questions change this document's content, not just its polish, and are
> marked **PENDING** inline rather than silently resolved:
>
> - **Open Question 4** (offline capability for Slice A0/A) — every mobile
>   screen below is designed to work online-only for now; if Q4 resolves
>   to "offline-capable," the state coverage for those screens needs a
>   Dexie sync layer added, not a redesign.
> - **Open Question 5** (does an unmatched bank line block `FINALIZED`) —
>   the Finalize button's exact disabled-condition is written as
>   **PENDING** below with both variants shown, so implementation isn't
>   blocked on it but also doesn't guess it.

---

### Screen Inventory

| Screen / Component | Path | Context | Status | What changes | Slice |
|---|---|---|---|---|---|
| Quick Request Form | `src/components/card-recon/PurchaseIntentQuickForm.tsx` | Mobile | New | Lightweight, optional pre-purchase intent log | A0 |
| Capture Request Form | `src/components/card-recon/CardCaptureForm.tsx` | Mobile | New | Mandatory receipt capture + submit, optional intent link | A |
| My Requests | `src/components/card-recon/MyCaptureRequests.tsx` | Mobile | New | Cardholder's own request history with status | A |
| Capture Queue | `src/components/card-recon/CardCaptureQueue.tsx` | Desktop | New | Capture Clerk reviews and posts (the "Run Batch" screen) | A |
| Card Recon Dashboard | `src/components/card-recon/CardReconDashboard.tsx` | Desktop | New | Statement CSV upload (sole trigger) + session history | B |
| Card Recon Workspace | `src/components/card-recon/CardReconWorkspace.tsx` | Desktop | New | Match/exception workbench, mirrors `ReconciliationWorkspace` | B |
| Status Pill (shared) | `src/components/card-recon/StatusPill.tsx` | Both | New | One badge component for every status enum in this epic | A0 / A / B |

---

### User Flow — Happy Path

**Slice A0 — Purchase Intent**

```
Step A0.1 — Actor: Cardholder taps "+ Quick Request" (persistent FAB, mobile).
            System: Opens Quick Request Form — description + ledger
                    account/project, both required to submit.
            State: No entity yet.

Step A0.2 — Actor: Types "litre of oil for the vehicle", picks a ledger
                    account, taps Submit.
            System: Confirms with a toast ("Logged") and returns to
                    wherever the cardholder was — no forced next step.
            State: PurchaseIntent created, status OPEN.
```

**Slice A — Capture Request**

```
Step A.1  — Actor: After the purchase, cardholder opens Capture Request
                    Form.
            System: Camera/file picker opens for the receipt (mandatory);
                    if any OPEN PurchaseIntent exists, a "Link to a
                    request?" picker appears above the form, pre-selected
                    to the most recent OPEN intent if only one exists.
            State: No entity yet.

Step A.2  — Actor: Attaches receipt photo, confirms amount + date
                    (pre-filled from OCR-free manual entry is not in
                    scope — cardholder types them), optionally links the
                    intent, taps Submit.
            System: Blocks submit until a receipt image is attached
                    (Slice Brief Section D — Mandatory receipt attachment).
                    On success, toast "Submitted — awaiting batch".
            State: CardCaptureRequest created, status SUBMITTED. If
                   linked, PurchaseIntent → FULFILLED.

Step A.3  — Actor: Capture Clerk opens Capture Queue (desktop).
            System: Shows all SUBMITTED requests, with a banner: "{n}
                    pending — oldest submitted {days} ago" (the
                    staleness safeguard from Open Question 1's
                    resolution).
            State: No change — read view.

Step A.4  — Actor: Clerk opens a request, reviews the receipt image and
                    fields, confirms or overrides the GL/cost code, taps
                    "Post".
            System: Row disappears from the queue; running batch summary
                    updates ("3 posted this session").
            State: CardCaptureRequest → POSTED. CardLedgerEntry created
                   (vendor = card, reference = receipt ref, GL code,
                   date, amount, receiptUrl, reconciliationStatus =
                   UNRECONCILED).
```

**Slice B — Statement Reconciliation**

```
Step B.1  — Actor: Depot Manager uploads the monthly statement CSV on
                    the Card Recon Dashboard.
            System: This is the sole trigger — no separate "Start
                    Reconciliation" button exists.
            State: CardReconSession created, status OPEN. CardStatementLine
                   rows created (status UNMATCHED). AUTO_EXACT / AUTO_FUZZY
                   match pass runs immediately.

Step B.2  — Actor: System redirects to the Card Recon Workspace.
            System: Two columns — bank lines (left) / ledger entries
                    (right). Auto-matched pairs shown collapsed under a
                    "Matched automatically (n)" section; everything else
                    sits in an "Needs review" section, each side showing
                    its own status pill.
            State: Matched pairs: CardReconMatch (AUTO_EXACT/AUTO_FUZZY),
                   both sides → MATCHED/RECONCILED.

Step B.3  — Actor: Reconciler drags/selects a bank line and a ledger
                    entry from "Needs review" and confirms a manual match.
                    Receipt image shows inline on the ledger entry side
                    for verification.
            System: If the reconciler is the entry's original capturer,
                    the match action is disabled with an explanatory
                    tooltip (Open Question 3 — segregation of duties);
                    otherwise the match confirms immediately.
            State: CardReconMatch (MANUAL). Both sides → MATCHED/RECONCILED.

Step B.4  — Actor: Reconciler clicks "Finalize Session".
            System: **PENDING Open Question 5.** If unresolved
                    exceptions block finalize: button stays disabled
                    with a count of blocking items, mirroring
                    `UNCLASSIFIED_EXCEPTION`. If non-blocking: button is
                    enabled with a confirmation dialog listing carried-
                    over exceptions, mirroring `Suspense-PMT`. Build the
                    disabled-condition as a single named function
                    (`canFinalize(session)`) so this resolves without a
                    UI rework either way.
            State: CardReconSession → FINALIZED (when allowed).
```

---

### Unhappy Paths

If **receipt image missing at Capture Request submit**:
- What the actor sees: Submit button stays disabled; inline text "Attach a photo of your receipt to continue."
- Recovery action: Attach an image.
- System state: No `CardCaptureRequest` created.

If **Capture Clerk rejects a request** (bad amount, unreadable receipt):
- What the actor sees: Clerk selects a reason from a required dropdown (e.g. "Unreadable receipt", "Amount doesn't match receipt", "Duplicate"); cardholder later sees their request in My Requests with a `REJECTED` pill and the reason.
- Recovery action: Cardholder resubmits a new Capture Request.
- System state: `CardCaptureRequest.status → REJECTED`. No `CardLedgerEntry` created. Linked `PurchaseIntent`, if any, reverts to `OPEN` (the fulfillment didn't actually happen).

If **duplicate-looking Capture Request** (same amount + date + description as an existing one):
- What the actor sees: A non-blocking warning banner on the clerk's review screen — "Possible duplicate of request #{id}, posted {date}" — not a hard block, since legitimate repeat purchases exist (e.g. fuel twice in a week).
- Recovery action: Clerk uses judgement; posts or rejects.
- System state: Unaffected until the clerk acts.

If **statement CSV fails to parse** (wrong columns, corrupt file):
- What the actor sees: "Couldn't read this file — check it's the unedited bank export" with a retry/re-upload control.
- Recovery action: Re-upload the correct file.
- System state: No `CardReconSession` created — the upload-as-trigger only fires on a successful parse.

If **reconciler attempts to manually match their own captured entry**:
- What the actor sees: Match action greyed out; tooltip "You submitted this receipt — another user needs to reconcile it" (segregation of duties, Open Question 3).
- Recovery action: A different user completes the match.
- System state: Unchanged; entry stays in "Needs review".

If **network error during statement upload or batch post**:
- What the actor sees: Toast "Couldn't save — check your connection" with a retry button; the action does not silently disappear.
- Recovery action: Retry once connection is restored.
- System state: No partial writes — batch posting and session creation are transactional per Slice Brief Section B.

If **empty queue / no exceptions / no open intents**:
- What the actor sees: Never a blank screen — each list has a specific empty state (see State Coverage).
- Recovery action: N/A — informational.

If **offline submission** (Slice A0/A, mobile) — **PENDING Open Question 4**:
- Until resolved: submission simply requires connectivity; offline shows "You're offline — reconnect to submit" and nothing queues locally.
- If Q4 resolves to offline-capable: this becomes a Dexie-queued write with a `Pending sync` badge, matching the Yard Counter PWA pattern — noted here so the fallback path is intentional, not an oversight.

---

### Component Specification

**Buttons:**
```
Button: "+ Quick Request" (FAB)
Context: Mobile
Size: Large (min 44px tap target)
Disabled when: never — always available, per "must never block the purchase"
onClick: Opens PurchaseIntentQuickForm

Button: "Submit" (Capture Request Form)
Context: Mobile
Size: Large (min 44px tap target)
Disabled when: no receipt image attached, OR amount/date empty
onClick: Creates CardCaptureRequest (SUBMITTED); links PurchaseIntent if selected

Button: "Post" (Capture Queue row)
Context: Desktop
Size: Standard
Disabled when: GL/cost code field is empty
onClick: Creates CardLedgerEntry; CardCaptureRequest → POSTED

Button: "Reject" (Capture Queue row)
Context: Desktop
Size: Standard
Disabled when: no reason selected
onClick: CardCaptureRequest → REJECTED; linked PurchaseIntent (if any) reverts to OPEN

Button: "Confirm Match" (Recon Workspace)
Context: Desktop
Size: Standard
Disabled when: acting user === the ledger entry's capturedBy (segregation of duties)
onClick: Creates CardReconMatch (MANUAL); both sides → MATCHED/RECONCILED

Button: "Finalize Session"
Context: Desktop
Size: Standard
Disabled when: PENDING Open Question 5 — see Step B.4
onClick: CardReconSession → FINALIZED
```

**Forms and inputs:**
```
Field: Description (Quick Request + Capture Request)
Type: text
Placeholder: "What's this for? e.g. litre of oil for the vehicle"
Validation: required, max 200 chars
Error message: "Add a short description"

Field: Ledger account / project
Type: select
Options source: DB reference list (INV-001 — never hardcoded)
Default: none selected
Validation: required to submit a Quick Request; on Capture Request, pre-filled
            from a linked intent but always editable

Field: Receipt image (Capture Request)
Type: file / camera capture
Validation: required — no submit without it (Mandatory receipt attachment, Slice Brief Section D)
Error message: "Attach a photo of your receipt to continue"

Field: Amount
Type: number
Validation: > 0, two decimal places
Error message: "Enter the amount from the receipt"

Field: Date
Type: date
Validation: not in the future
Error message: "Date can't be after today"
```

**Selects / Dropdowns:**
```
Select: "Link to a request?" (Capture Request Form)
Options source: cardholder's own OPEN PurchaseIntent rows
Default: most recent OPEN intent if exactly one exists, otherwise "None"

Select: Rejection reason (Capture Queue)
Options source: static list — "Unreadable receipt", "Amount mismatch", "Duplicate", "Other"
Default: none selected — required
```

**Tables (Desktop only):**
```
Table: Capture Queue
Column: Submitted | Cardholder | Description | Amount | Receipt (thumbnail) | Age
Sortable: YES (Age, Amount)
Default sort: Age DESC (oldest first)

Table: Card Recon Workspace — bank lines
Column: Date | Description | Amount | Status
Sortable: YES (Date, Amount)
Default sort: Date ASC

Table: Card Recon Workspace — ledger entries
Column: Date | Reference | GL Code | Amount | Receipt | Status | Captured by
Sortable: YES (Date, Amount)
Default sort: Date ASC
```

---

### State Coverage

**Quick Request Form / Capture Request Form**
- Loading: N/A (local form, no fetch on open — except intent list, see below)
- Empty: If no OPEN intents exist, the "Link to a request?" picker doesn't render at all — no empty dropdown
- Error: Inline toast "Couldn't save — check your connection", form stays populated for retry
- Success: Toast confirmation, form clears
- Offline: **PENDING Open Question 4** — see Unhappy Paths

**My Requests**
- Loading: Skeleton rows
- Empty: "No requests yet — tap + Quick Request to log a purchase, or submit a receipt after buying." with a CTA
- Error: "Couldn't load your requests" + retry
- Success: N/A (read-only list)

**Capture Queue**
- Loading: Skeleton rows
- Empty: "Queue is clear — nothing pending." (positive framing, not a warning)
- Error: "Couldn't load the queue" + retry
- Success: Toast "Posted" / "Rejected" per action, row removed from list

**Card Recon Dashboard**
- Loading: Skeleton for session history list
- Empty: "No reconciliations yet — upload this month's statement to start." + upload CTA
- Error: CSV parse failure — see Unhappy Paths
- Success: Redirects into Card Recon Workspace on successful upload

**Card Recon Workspace**
- Loading: Skeleton for both columns while the auto-match pass runs
- Empty ("Needs review" section): "Everything matched automatically." (only shown when true)
- Error: Toast on failed match/finalize action, no silent failure
- Success: Toast "Matched" per confirm; summary banner on Finalize

---

### Permission Gates

```
Element: "Post" / "Reject" (Capture Queue)
Visible to: Capture Clerk, Depot Manager
Hidden from: Cardholder-only accounts (no clerk permission)

Element: "Confirm Match" (Recon Workspace)
Visible to: Depot Manager / Finance Controller
Disabled when: acting user === CardLedgerEntry.capturedBy for that specific
               entry (Open Question 3, resolved — entry-level check, not a
               fixed role)

Element: "Finalize Session"
Visible to: Depot Manager / Finance Controller
Disabled when: PENDING Open Question 5

Element: "+ Quick Request" / Capture Request Form
Visible to: any cardholder
Hidden from: no one — this is the one open surface in the whole epic
```

---

### Interaction Details

- **Confirmation dialogs:**
  - Reject: "Reject this request? The cardholder will need to resubmit. — [Cancel] [Reject]"
  - Finalize: exact text depends on Open Question 5's resolution — either "N unresolved exceptions must be cleared first" (blocking variant, no dialog, button stays disabled) or "M exceptions will carry over to next period. Finalize anyway? — [Cancel] [Finalize]" (non-blocking variant).
- **Toast / banner notifications:** success (green, 3s), error (red, persists until dismissed or retried), info (grey, 3s) — bottom-center on mobile, top-right on desktop.
- **Staleness banner (Capture Queue):** "{n} pending — oldest submitted {days} ago", amber past 7 days, red past 14 days (provisional thresholds — not yet PM-confirmed, flagged for Stage 2).
- **Status pill colors** (shared `StatusPill` component, one enum → one color mapping):
  - `PurchaseIntent`: `OPEN` grey, `FULFILLED` green, `ABANDONED` amber
  - `CardCaptureRequest`: `SUBMITTED` grey, `BATCHED` blue, `POSTED` green, `REJECTED` red
  - `CardLedgerEntry.reconciliationStatus`: `UNRECONCILED` amber, `RECONCILED` green, `EXCEPTION_UNRESOLVED` red
  - `CardStatementLine.status`: `UNMATCHED` amber, `MATCHED` green, `EXCEPTION_UNRESOLVED` red
  - `CardReconSession`: `OPEN` blue, `DRAFT` amber, `FINALIZED` green
- **Optimistic updates:** None for financial writes (Post, Match, Finalize) — these wait for Supabase confirmation given the transactional requirement in Slice Brief Section B; the Quick Request form may optimistically clear since it has no downstream financial effect.
- **Receipt inline preview:** thumbnail in both Capture Queue and Recon Workspace; click to open full-size in a modal, never a new tab (keeps workspace context).
- **Mobile-specific:** sticky "Submit" button at the bottom of both A0 and A forms; back navigation confirms discard if the form has unsaved text.
- **Currency:** every monetary value uses the shared `formatZAR()` utility (INV-009) — unlike the quantity-only stock-count PWA, this epic is inherently financial and ZAR values are expected throughout.

---

### UX Checklist
- [x] Every entity in the Slice Brief has a corresponding screen or component
- [x] Every Slice Brief constraint (Section D) has a corresponding UX step or gate
- [x] All unhappy paths are defined, including the two PENDING open questions
- [x] All loading / empty / error / success states defined for every screen
- [x] All buttons specified with a disabled condition
- [x] Status pill colors defined for every status enum in the epic
- [x] Permission gates reference the resolved segregation-of-duties rule (Open Question 3)
- [x] Mobile tap targets are minimum 44px
- [x] Monetary values specified as `formatZAR()` — this domain is financial, not quantity-only
- [ ] Offline behavior (Open Question 4) — PENDING, not yet locked
- [ ] Finalize gating (Open Question 5) — PENDING, not yet locked
- Awaiting PM approval — and resolution of Open Questions 4 and 5 before Stage 2 (PRD) can fully lock business rules
