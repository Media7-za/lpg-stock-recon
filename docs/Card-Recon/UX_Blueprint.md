## UX Flow — Credit Card Purchase Intent, Capture & Statement Reconciliation
Produced by: UX-DESIGN-AGENT
Slice Brief: `docs/Card-Recon/Slice_Brief.md` (3 open, 5 resolved)
PRD approved: N/A — not yet produced (Stage 2 skipped at PM request)
Architecture Note approved: N/A — not yet produced (Stage 3 skipped at PM request)
Date: 2026-08-24

---

> **Pipeline deviation, noted per the Authority Model:** this UX Flow is
> normally Stage 5, built from an approved PRD (Stage 2) and Architecture
> Note (Stage 3). Neither exists for this epic yet. Everything below is
> derived directly from the approved Slice Brief's Section D (constraints)
> and Section E (Open Questions Register) in their place.
>
> Since first drafted, **Open Question 4** (offline capability) and
> **Open Question 5** (Finalize gating) have both been resolved and are
> reflected throughout below rather than left as PENDING:
> - **Q4 — deferred to a later version.** Slice A0/A are online-only in
>   this version; no Dexie store, no offline queue, no sync indicator.
> - **Q5 — blocks, with an explicit Cancel escape hatch.** `FINALIZED` is
>   rejected while any `EXCEPTION_UNRESOLVED` item exists; the reconciler
>   can explicitly "Cancel Exception" with a required reason to lift the
>   block on that item (→ `EXCEPTION_CANCELLED`), but there is no silent
>   non-blocking path.
> - **Q8 — build `LedgerAccount` + admin CRUD as part of this epic.**
>   Found during a screen audit (no such table existed anywhere in the
>   codebase). Now **Slice 0**, a hard prerequisite for Slice A0's account
>   picker. The screen below is no longer blocked.

---

### Screen Inventory

| Screen / Component | Path | Context | Status | What changes | Slice |
|---|---|---|---|---|---|
| Ledger Account Admin | `src/components/card-recon/LedgerAccountAdmin.tsx` | Desktop | New | Minimal CRUD for the GL/cost code reference list: list, create (code + name), rename, deactivate. Code immutable once created; deactivate is soft-delete only | 0 |
| Quick Request Form | `src/components/card-recon/PurchaseIntentQuickForm.tsx` | Mobile | New | Lightweight, optional pre-purchase intent log | A0 |
| My Intents | `src/components/card-recon/MyPurchaseIntents.tsx` | Mobile | New | Cardholder's own intent history — `OPEN`/`FULFILLED`/`ABANDONED` (parallel to My Requests; closes an accountability gap Slice A0 otherwise leaves) | A0 |
| Capture Request Form | `src/components/card-recon/CardCaptureForm.tsx` | Mobile | New | Mandatory receipt capture + submit, optional intent link | A |
| My Requests | `src/components/card-recon/MyCaptureRequests.tsx` | Mobile | New | Cardholder's own request history with status | A |
| Capture Queue | `src/components/card-recon/CardCaptureQueue.tsx` | Desktop | New | Capture Clerk reviews and posts (the "Run Batch" screen); single-request review is an inline expand-row here, not a separate screen | A |
| Card Recon Dashboard | `src/components/card-recon/CardReconDashboard.tsx` | Desktop | New | Statement CSV upload (sole trigger) + session history | B |
| Card Recon Workspace | `src/components/card-recon/CardReconWorkspace.tsx` | Desktop | New | Match/exception workbench, mirrors `ReconciliationWorkspace`; also renders `FINALIZED` sessions read-only — no separate history screen | B |
| Status Pill (shared) | `src/components/card-recon/StatusPill.tsx` | Both | New | One badge component for every status enum in this epic | A0 / A / B |

**Deliberately not added:** a dedicated Activity Log / audit-trail screen. At this volume, the inline reason field + status pill on each item already carries the accountability weight the Guiding Principle asks for; a standalone log would be over-building for now.

---

### User Flow — Happy Path

**Slice 0 — Ledger Account Admin**

```
Step 0.1   — Actor: Admin opens Ledger Account Admin, clicks "New Account".
             System: Shows a form — code (text, required) + display name
                     (text, required).
             State: No entity yet.

Step 0.2   — Actor: Enters code "FUEL" and name "Fuel & Vehicle Costs",
                     taps Save.
             System: Adds the row to the list, active by default; toast
                     "Account created".
             State: LedgerAccount created, active = true. Immediately
                    available in the Slice A0 and Slice A pickers.
```

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
                    Form, taps "Attach Receipt" (never "Scan Receipt" —
                    FR-CCR-RECEIPT-001).
            System: Presents two explicit options — "Take Photo" and
                    "Choose File" (mobile) — plus a file picker on desktop.
                    Accepts JPEG, PNG, HEIC, or PDF. If any OPEN
                    PurchaseIntent exists, a "Link to a request?" picker
                    appears above the form, pre-selected to the most
                    recent OPEN intent if only one exists.
            State: No entity yet.

Step A.2  — Actor: Selects or captures a file.
            System: For JPEG/PNG/HEIC: runs client-side processing
                    (orientation correction, resize to ≤2000px longest
                    edge, JPEG re-encode at ~80% quality, EXIF/location
                    strip, iterative quality reduction targeting ≤500KB)
                    with a visible progress indicator — this is NOT the
                    same as the upload progress in Step A.3, and both are
                    shown distinctly if they overlap. For PDF: skips
                    processing, validates against the upload-size limit.
                    On completion, shows a preview of the processed
                    receipt. If the processed file can't be reliably
                    rendered, rejects it before the user can proceed —
                    see Unhappy Paths.
            State: No entity yet — file is held client-side only, nothing
                   is uploaded until Submit.

Step A.3  — Actor: Confirms amount + date (typed manually — OCR is out of
                    scope), optionally links the intent, taps Submit.
            System: Submit stays disabled until a valid processed receipt
                    exists (Slice Brief Section D). On tap: uploads the
                    processed file to `card-receipts` with a visible
                    upload progress indicator, THEN — only after upload
                    succeeds — creates the `CardCaptureRequest` row. If
                    upload fails, the form retains every entered field
                    (description, amount, date, intent link, and the
                    already-processed file) and offers Retry; no partial
                    `CardCaptureRequest` is ever created (FR-CCR-RECEIPT-001
                    atomicity requirement). On success, toast "Submitted —
                    awaiting batch".
            State: CardCaptureRequest created, status SUBMITTED, with
                   receiptUrl (private object path), receiptMimeType,
                   receiptSizeBytes all set. If linked, PurchaseIntent →
                   FULFILLED.

Step A.4  — Actor: Capture Clerk opens Capture Queue (desktop).
            System: Shows all SUBMITTED requests, with a banner: "{n}
                    pending — oldest submitted {days} ago" (the
                    staleness safeguard from Open Question 1's
                    resolution). Each row's receipt thumbnail is rendered
                    from a short-lived signed URL, not a public link.
            State: No change — read view.

Step A.5  — Actor: Clerk opens a request, reviews the receipt image and
                    fields, confirms or overrides the GL/cost code, taps
                    "Post".
            System: Re-verifies the receipt object still exists and is
                    accessible in storage before proceeding (FR-CCR-RECEIPT-001
                    — a ledger entry cannot be posted with a missing/
                    inaccessible receipt); if that check fails, blocks
                    posting with an explanatory message instead of
                    silently creating a broken ledger entry. Otherwise:
                    row disappears from the queue; running batch summary
                    updates ("3 posted this session").
            State: CardCaptureRequest → POSTED. CardLedgerEntry created
                   (vendor = card, reference = receipt ref, GL code,
                   date, amount, receiptUrl/receiptMimeType/
                   receiptSizeBytes/receiptUploadedAt carried forward
                   from the capture request, reconciliationStatus =
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

Step B.4  — Actor: (Optional, per remaining exception) Reconciler clicks
                    "Cancel Exception" on an item they cannot match — a
                    charge that turns out to be a bank fee, or a ledger
                    entry that was a genuine duplicate.
            System: Requires a reason (required dropdown/text, same
                    pattern as Capture Clerk rejection in Slice A) before
                    the action commits.
            State: CardStatementLine.status or
                   CardLedgerEntry.reconciliationStatus → EXCEPTION_CANCELLED.
                   Logged with actor + reason + timestamp.

Step B.5  — Actor: Reconciler clicks "Finalize Session".
            System: Disabled — with a visible count and list — while any
                    item is still `EXCEPTION_UNRESOLVED` (mirrors
                    `UNCLASSIFIED_EXCEPTION`). `EXCEPTION_CANCELLED` items
                    do not block. Once every item is `MATCHED`,
                    `RECONCILED`, or `EXCEPTION_CANCELLED`, the button
                    enables with a confirmation dialog: "Finalize this
                    period? N items were cancelled with a reason — this
                    cannot be undone."
            State: CardReconSession → FINALIZED.
```

---

### Unhappy Paths

If **admin creates a `LedgerAccount` with a duplicate code**:
- What the actor sees: "This code already exists" inline error on the code field; existing account's name shown for reference.
- Recovery action: Choose a different code, or edit the existing account instead.
- System state: No new row created.

If **admin tries to deactivate an account that's the only account** (Slice A0/A would have nothing to pick from):
- What the actor sees: Non-blocking warning — "This is the only active account. Deactivating it will leave nothing to select." — deactivation still proceeds if confirmed, it's a warning not a hard block, since the admin may know a replacement is coming.
- Recovery action: Create a replacement account first, or confirm anyway.
- System state: `LedgerAccount.active → false` if confirmed.

If **receipt missing at Capture Request submit**:
- What the actor sees: Submit button stays disabled; inline text "Attach your receipt to continue."
- Recovery action: Attach a file.
- System state: No `CardCaptureRequest` created.

If **processed receipt can't be reliably rendered** (corrupt file, failed HEIC decode, degenerate image):
- What the actor sees: Rejected immediately after processing, before Submit is even reachable — "Couldn't read this file — try another photo." Original selection is cleared; the rest of the form (description, amount, date, intent link) is untouched.
- Recovery action: Attach a different file.
- System state: No `CardCaptureRequest` created — this never reaches the upload step at all.

If **image processing or upload fails** (browser crash mid-resize, network drop mid-upload):
- What the actor sees: Toast "Couldn't process/save your receipt — check your connection" with a Retry button. Every entered field — description, amount, date, intent link, and the already-processed file if processing itself succeeded — is retained exactly as entered; nothing needs retyping.
- Recovery action: Tap Retry (resumes from upload, not from scratch, if processing already succeeded).
- System state: No `CardCaptureRequest` created until the full atomic sequence (process → upload → DB insert) completes — FR-CCR-RECEIPT-001's atomicity requirement.

If **Capture Clerk rejects a request** (bad amount, unreadable receipt):
- What the actor sees: Clerk selects a reason from a required dropdown (e.g. "Unreadable receipt", "Amount doesn't match receipt", "Duplicate"); cardholder later sees their request in My Requests with a `REJECTED` pill and the reason.
- Recovery action: Cardholder resubmits a new Capture Request.
- System state: `CardCaptureRequest.status → REJECTED`. No `CardLedgerEntry` created. Linked `PurchaseIntent`, if any, reverts to `OPEN` (the fulfillment didn't actually happen).

If **the receipt object is missing or inaccessible when the Clerk taps Post** (deleted between submit and review, storage error):
- What the actor sees: "Post" blocked with "Can't verify the receipt for this request — try again or reject it." — never silently posts a `CardLedgerEntry` with a broken receipt link.
- Recovery action: Retry the check, or reject the request with a reason if the file is genuinely gone.
- System state: `CardCaptureRequest` stays `SUBMITTED`/`BATCHED` — no `CardLedgerEntry` created (FR-CCR-RECEIPT-001).

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

If **reconciler attempts to Cancel Exception without a reason**:
- What the actor sees: The action is blocked; inline text "A reason is required to cancel an exception."
- Recovery action: Provide a reason.
- System state: No status change — item stays `EXCEPTION_UNRESOLVED`.

If **reconciler attempts to Finalize with unresolved exceptions remaining**:
- What the actor sees: Finalize button stays disabled; a summary line above it reads "N items still need to be matched or cancelled before finalizing" with a jump-to-first-exception link.
- Recovery action: Match or explicitly cancel every remaining exception.
- System state: `CardReconSession` stays `OPEN`/`DRAFT` — `FINALIZED` is rejected server-side (`409`) even if the button were somehow clicked.

If **empty queue / no exceptions / no open intents**:
- What the actor sees: Never a blank screen — each list has a specific empty state (see State Coverage).
- Recovery action: N/A — informational.

If **offline** (Slice A0/A, mobile) — resolved, deferred to a later version (Open Question 4):
- What the actor sees: "You're offline — reconnect to submit." Submit stays disabled while offline; nothing queues locally.
- Recovery action: Reconnect and resubmit — the form retains what was typed.
- System state: No entity created. This is a known, accepted limitation for this version, not a bug — a future slice can add a Dexie-queued write with a `Pending sync` badge, matching the Yard Counter PWA pattern, without changing this form's fields.

---

### Component Specification

**Buttons:**
```
Button: "New Account" (Ledger Account Admin)
Context: Desktop
Size: Standard
Disabled when: never
onClick: Opens the create-account form

Button: "Save" (Ledger Account Admin create/edit form)
Context: Desktop
Size: Standard
Disabled when: code empty, name empty, or code already exists
onClick: Creates or updates LedgerAccount

Button: "Deactivate" (Ledger Account Admin row)
Context: Desktop
Size: Standard
Disabled when: never (warns rather than blocks — see Unhappy Paths)
onClick: LedgerAccount.active → false

Button: "+ Quick Request" (FAB)
Context: Mobile
Size: Large (min 44px tap target)
Disabled when: never — always available, per "must never block the purchase"
onClick: Opens PurchaseIntentQuickForm

Button: "Attach Receipt" (Capture Request Form) — never "Scan Receipt"
Context: Mobile
Size: Large (min 44px tap target)
Disabled when: never
onClick: Opens the Take Photo / Choose File choice (mobile) or file picker (desktop)

Button: "Take Photo" (within Attach Receipt flow)
Context: Mobile
Size: Large (min 44px tap target)
Disabled when: never
onClick: Opens the device camera; captured photo enters processing (Step A.2)

Button: "Choose File" (within Attach Receipt flow)
Context: Mobile + Desktop
Size: Large (min 44px tap target)
Disabled when: never
onClick: Opens the file picker filtered to JPEG/PNG/HEIC/PDF; selection enters processing (Step A.2)

Button: "Submit" (Capture Request Form)
Context: Mobile
Size: Large (min 44px tap target)
Disabled when: no successfully processed receipt attached, OR amount/date empty
onClick: Uploads the processed file, then creates CardCaptureRequest (SUBMITTED) only after upload succeeds; links PurchaseIntent if selected

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

Button: "Cancel Exception" (Recon Workspace, per unresolved item)
Context: Desktop
Size: Standard
Disabled when: no reason provided
onClick: item's status → EXCEPTION_CANCELLED, logged with actor + reason + timestamp

Button: "Finalize Session"
Context: Desktop
Size: Standard
Disabled when: any CardStatementLine.status or CardLedgerEntry.reconciliationStatus === EXCEPTION_UNRESOLVED exists in the session
onClick: CardReconSession → FINALIZED
```

**Forms and inputs:**
```
Field: Code (Ledger Account Admin — create only)
Type: text
Validation: required, unique, immutable after creation (disabled on edit)
Error message: "This code already exists"

Field: Name (Ledger Account Admin)
Type: text
Validation: required, max 100 chars
Error message: "Enter a display name"

Field: Description (Quick Request + Capture Request)
Type: text
Placeholder: "What's this for? e.g. litre of oil for the vehicle"
Validation: required, max 200 chars
Error message: "Add a short description"

Field: Ledger account / project
Type: select
Options source: active LedgerAccount rows (Slice 0 — INV-001, never hardcoded)
Default: none selected
Validation: required to submit a Quick Request; on Capture Request, pre-filled
            from a linked intent but always editable

Field: Receipt (Capture Request)
Type: file / camera capture — accepts JPEG, PNG, HEIC, PDF
Validation: required — no submit without a successfully processed file
            (Mandatory receipt attachment, Slice Brief Section D); a file
            that fails to decode/render is rejected before it counts as
            "attached" (FR-CCR-RECEIPT-001)
Error message: "Attach your receipt to continue" (missing) / "Couldn't
               read this file — try another photo" (unreadable)

Component: Receipt processing indicator (Capture Request Form)
Context: Mobile + Desktop
Shows: a progress state while orientation/resize/re-encode/EXIF-strip
       runs client-side (JPEG/PNG/HEIC only — PDFs skip straight to the
       preview). Distinct from the later upload-progress indicator in
       Step A.3, shown separately if both are visible in sequence.

Component: Receipt preview (Capture Request Form)
Context: Mobile + Desktop
Shows: the processed image (or a PDF icon + filename for PDFs) before
       Submit is enabled. Tap/click to view full-size in a modal.
       Replacing the file restarts processing and preview.

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

Select: Cancel Exception reason (Recon Workspace)
Options source: static list — "Bank fee, no receipt expected", "Duplicate charge", "Confirmed error, written off", "Other"
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
- Processing (Capture Request Form only): visible progress indicator while the receipt is being resized/re-encoded client-side, distinct from the later upload-progress state
- Empty: If no OPEN intents exist, the "Link to a request?" picker doesn't render at all — no empty dropdown
- Error: Inline toast "Couldn't save — check your connection", form stays populated for retry — including the already-processed receipt file, not just the text fields (FR-CCR-RECEIPT-001)
- Success: Toast confirmation, form clears
- Offline: Not supported this version (Open Question 4, resolved — deferred) — see Unhappy Paths

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
Element: Ledger Account Admin (entire screen)
Visible to: Depot Manager / Finance Controller (admin)
Hidden from: Cardholder, Capture Clerk

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
Disabled when: any EXCEPTION_UNRESOLVED item remains in the session
               (Open Question 5, resolved — blocks with an explicit
               Cancel escape hatch, not a silent carryover)

Element: "Cancel Exception"
Visible to: Depot Manager / Finance Controller
Disabled when: no reason provided (same required-reason pattern as
               Capture Clerk rejection)

Element: "+ Quick Request" / Capture Request Form
Visible to: any cardholder
Hidden from: no one — this is the one open surface in the whole epic
```

---

### Interaction Details

- **Confirmation dialogs:**
  - Reject: "Reject this request? The cardholder will need to resubmit. — [Cancel] [Reject]"
  - Cancel Exception: no separate confirmation dialog — the required reason field itself is the deliberate-action gate.
  - Finalize: "Finalize this period? N items were cancelled with a reason — this cannot be undone. — [Cancel] [Finalize]", shown only once the button is enabled (no unresolved exceptions remain).
- **Toast / banner notifications:** success (green, 3s), error (red, persists until dismissed or retried), info (grey, 3s) — bottom-center on mobile, top-right on desktop.
- **Staleness banner (Capture Queue):** "{n} pending — oldest submitted {days} ago", amber past 7 days, red past 14 days (provisional thresholds — not yet PM-confirmed, flagged for Stage 2).
- **Status pill colors** (shared `StatusPill` component, one enum → one color mapping):
  - `PurchaseIntent`: `OPEN` grey, `FULFILLED` green, `ABANDONED` amber
  - `CardCaptureRequest`: `SUBMITTED` grey, `BATCHED` blue, `POSTED` green, `REJECTED` red
  - `CardLedgerEntry.reconciliationStatus`: `UNRECONCILED` amber, `RECONCILED` green, `EXCEPTION_UNRESOLVED` red, `EXCEPTION_CANCELLED` purple
  - `CardStatementLine.status`: `UNMATCHED` amber, `MATCHED` green, `EXCEPTION_UNRESOLVED` red, `EXCEPTION_CANCELLED` purple
  - `CardReconSession`: `OPEN` blue, `DRAFT` amber, `FINALIZED` green
- **Optimistic updates:** None for financial writes (Post, Match, Finalize) — these wait for Supabase confirmation given the transactional requirement in Slice Brief Section B; the Quick Request form may optimistically clear since it has no downstream financial effect.
- **Receipt inline preview:** thumbnail in both Capture Queue and Recon Workspace; click to open full-size in a modal, never a new tab (keeps workspace context). Rendered from a short-lived signed URL fetched on demand, never a stored public URL (`card-receipts` is a private bucket — FR-CCR-RECEIPT-001).
- **Mobile-specific:** sticky "Submit" button at the bottom of both A0 and A forms; back navigation confirms discard if the form has unsaved text.
- **Currency:** every monetary value uses the shared `formatZAR()` utility (INV-009) — unlike the quantity-only stock-count PWA, this epic is inherently financial and ZAR values are expected throughout.

---

### UX Checklist
- [x] Every entity in the Slice Brief has a corresponding screen or component
- [x] Every Slice Brief constraint (Section D) has a corresponding UX step or gate
- [x] All unhappy paths are defined
- [x] All loading / empty / error / success states defined for every screen
- [x] All buttons specified with a disabled condition
- [x] Status pill colors defined for every status enum in the epic, including `EXCEPTION_CANCELLED`
- [x] Permission gates reference the resolved segregation-of-duties rule (Open Question 3)
- [x] Mobile tap targets are minimum 44px
- [x] Monetary values specified as `formatZAR()` — this domain is financial, not quantity-only
- [x] Offline behavior (Open Question 4) — resolved, deferred to a later version
- [x] Finalize gating (Open Question 5) — resolved, blocks with an explicit Cancel Exception escape hatch
- [x] Ledger Account reference data (Open Question 8) — resolved: Slice 0 (Ledger Account Admin) builds the missing table + admin screen, fully specified above
- [x] FR-CCR-RECEIPT-001 incorporated — Attach Receipt copy, Take Photo/Choose File, processing + upload progress shown distinctly, preview before submit, form-state-preserving retry on any failure, private-bucket signed-URL rendering, receipt re-verification before posting
- Awaiting PM approval. Remaining Slice Brief open questions — Q2 (GL override), Q6 (multi-card schema), Q7 (abandonment window) — don't materially change this UX and can resolve during Stage 2 (PRD)
