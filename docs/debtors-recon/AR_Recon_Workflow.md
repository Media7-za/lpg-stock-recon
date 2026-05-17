# AR_Recon_Workflow.md

**Project:** Debtors_Recon_Slice  
**Document Type:** Operator Workflow Specification  
**Version:** v0.3.0  
**Status:** Draft — pending T-01 DTRX validation  
**Companion Spec:** LSR5_Business_Rules_Spec.html v2.4.0  
**Last Updated:** 2026-05-17  

---

## 1. Purpose

This file defines the operator workflow for the AR Reconciliation Workbench.

The business rules spec defines **what the system must believe**.

This workflow spec defines **how the finance operator moves through the system**.

The core workflow principle is:

> Operators do not reconcile raw ERP rows.  
> Operators reconcile prepared domain projections generated from normalized Supabase artifacts.

---

## 2. Workflow Scope

### In scope

- One debtor account per reconciliation session
- Session creation and recovery
- Source artifact loading
- Preflight checks
- Customer configuration prompts
- JNL / Bank UD classification
- Payment allocation workflow
- Financial CRN allocation workflow
- Operational CYL CRN custody workflow
- Credit pool workflow
- Exception lane handling
- Session completion

### Out of scope

- ERP writeback
- Fully autonomous reconciliation
- Cross-account batch reconciliation
- Full CYL yard / SOH reconciliation
- Multi-user concurrent workflow
- Supervisor approval workflow

---

## 3. Primary Operator Mental Model

The operator is not simply matching documents.

The operator is resolving a customer account across two coupled ledgers:

```text
Commercial AR Ledger
- LPG value balance
- CYL value balance
- OTHER value balance
- payments
- financial credits
- debit adjustments
- write-offs

Cylinder Custody Ledger
- CYL quantity balance by SKU
- operational CYL returns
- commercialized CYL settlements
- disputed / unresolved CYL quantities
```

The UI must therefore always make clear whether the operator is acting on:

```text
money
quantity
classification
exception
credit pool
```

A **Commercial CYL Settlement** is a coupling event — a single operator-confirmed action that affects both ledgers simultaneously. The UI must make this duality visible in the allocation preview (before/after for both value and qty).

---

## 4. High-Level Workflow

```text
1. Select debtor account
2. Create or resume reconciliation session
3. Pull normalized source artifacts
4. Build reconciliation projections
5. Run preflight checks
6. Operator confirms customer flags
7. Operator resolves classification blockers
8. Operator enters main reconciliation workspace
9. Operator processes suggested matches
10. Operator handles exception lanes
11. Operator applies credit pool if needed
12. Operator reviews session summary
13. Operator marks session complete
14. Session is archived / remains reopenable
```

---

## 5. Source Data Pull Workflow

### 5.1 Trigger

The source pull begins when the operator selects a debtor account and starts or resumes a session.

Example:

```text
Account: INC001
Action: Start reconciliation
```

### 5.2 Source artifacts

The system pulls from normalized Supabase / imported artifacts:

| Source | Used For |
|---|---|
| ERP Summary Export | INV / CRN / OB / JNL headers |
| Detail Lines Export | LPG / CYL / OTHER value split |
| transaction_headers | PMT / DTRX transaction source |
| transaction_items | CYL SKU quantity exposure |
| customer_credit_pool | Existing credit available |
| prior sessions | Existing allocations / exceptions if resuming |

### 5.3 Operator-facing rule

The operator should never see this as raw source import unless there is a loading error.

The operator sees:

```text
Preparing reconciliation workspace...
```

not:

```text
Parsing transaction_headers...
```

---

## 6. Session Entry Workflow

### Step 1 — Select debtor

Operator selects one debtor account.

```text
Debtor: INC001
```

### Step 2 — System checks for existing session

If an incomplete session exists:

```text
Resume existing session?
- Resume
- Start new session
- View completed sessions
```

### Step 3 — Start session

System creates or resumes a session with status:

```text
DRAFT → ACTIVE
```

### Step 4 — Workspace build

System constructs domain projections:

```text
invoice_sub_ledger
payment_queue
financial_crn_queue
operational_cyl_queue
exception_queue
credit_pool_snapshot
```

---

## 7. Preflight Workflow

Preflight is the first screen shown after session loading.

Purpose:

> Show the operator what the system found before reconciliation begins.

### 7.1 Preflight cards

The screen should show:

```text
Invoices loaded
Payments loaded
Financial CRNs loaded
Operational CYL CRNs loaded
Opening balances found
JNL documents requiring classification
Bank UD documents requiring classification
Existing credit pool
Potential data gaps
```

### 7.2 Example preflight summary

```text
INC001 Reconciliation Preflight

197 invoices
108 credit notes
54 operational CYL returns
23 payments
2 Bank UD exceptions
1 positive opening balance
R8,540 credit pool available

Status:
- 2 documents require classification before completion
- 14 operational CYL returns need manual custody assignment
```

### 7.3 Preflight actions

Operator can:

```text
Continue to configuration
Review source warnings
Cancel session
```

---

## 8. Customer Configuration Workflow

Customer configuration is surfaced at the point of friction, not hidden in settings.

### 8.1 Session header flags

The session header displays:

```text
allows_cross_bucket_settlement
pays_for_cyl
```

Both are editable during a session.

### 8.2 First cross-bucket allocation prompt

Triggered when operator attempts:

```text
CYL credit/payment → LPG component
LPG credit/payment → CYL component
OTHER → LPG/CYL
```

Prompt:

```text
This is a cross-bucket commercial settlement.

Options:
- Proceed once
- Always allow for this customer
- Cancel
```

### 8.3 First PMT-to-CYL prompt

Triggered when operator applies cash payment to CYL value balance.

Prompt:

```text
Cash payment is being applied to CYL value.

This may mean the customer pays for cylinders instead of returning them.

Options:
- Proceed once
- Mark customer as pays for cylinders
- Cancel
```

### 8.4 Config persistence

If operator chooses “always allow” or “mark customer as pays for cylinders”:

```text
customer_config updated
operator_id logged
timestamp logged
```

---

## 9. Classification Gate Workflow

### 9.1 Documents requiring classification

Before normal reconciliation can be completed, the operator must classify:

```text
JNL
Bank UD
```

### 9.2 Classification options

Allowed classifications:

```text
PAYMENT_EQUIVALENT
CREDIT_NOTE_EQUIVALENT
DEBIT_ADJUSTMENT
WRITE_OFF
IGNORE
```

### 9.3 Classification workflow

```text
Open classification queue
Select document
Review amount/date/reference
Choose classification
Confirm effect
System routes document into correct lane
```

### 9.4 DEBIT_ADJUSTMENT safety rule

If operator selects:

```text
DEBIT_ADJUSTMENT
```

UI must show:

```text
This will ADD R[amount] to what the customer owes.
```

Operator must explicitly confirm.

### 9.5 Completion blocking

Any unclassified JNL or Bank UD blocks session completion.

---

## 10. Main Reconciliation Workspace

The main workspace should be domain-ready, not raw-table based.

### 10.1 Recommended layout

```text
Header:
- Customer
- Session status
- Credit pool
- Customer flags
- Source freshness
- Completion readiness

Left panel:
- Invoice / exposure queue
- Manual hold candidates

Center:
- Active document / suggested matches
- Allocation action area

Right panel:
- Suspense PMT
- Suspense CRN
- Operational CYL exceptions
- Classification queue

Bottom / side drawer:
- CYL custody summary by SKU
```

### 10.2 Important UI rule

The operator should always know:

```text
What document am I acting on?
Which sub-ledger component am I reducing/increasing?
What remains after the action?
Where does the remainder go?
```

---

## 11. Payment Allocation Workflow

### 11.1 Payment candidate rules

Payments may only target invoices where:

```text
invoice_date <= payment_date
```

Future-dated invoices are not shown as candidates.

### 11.2 Operator action flow

```text
Select payment
View suggested invoice candidates (past-dated only)
Choose target invoice
Choose target sub-ledger component (LPG / CYL_VALUE / OTHER)
↓
If component = CYL_VALUE:
  Branch: CYL allocation decision (see §11.5)
Else:
  Confirm allocation (financial only)
System applies amount
Remainder routes to Suspense-PMT if any
```

### 11.3 Mixed invoice rule

For mixed invoices, operator must choose one component:

```text
LPG
CYL_VALUE
OTHER
```

No proportional split.

No automatic spillover.

### 11.4 Example — LPG component

```text
PMT: R5,000

Invoice:
- LPG balance: R3,000
- CYL balance: R2,000

Operator selects LPG.

Result:
- LPG balance → R0
- CYL balance remains R2,000
- PMT remainder R2,000 → Suspense-PMT
```

The operator must perform a second allocation action to apply the remainder.

### 11.5 CYL allocation decision — branch logic

When operator selects CYL_VALUE as the target component, the system must determine whether this is a financial-only settlement or a Commercial CYL Settlement (coupling event).

**If `pays_for_cyl = true` (customer flag set):**

```text
Default: Commercial CYL Settlement
No prompt required.
Soft badge shown: "Cash CYL settlement — commercial account"
```

**If `pays_for_cyl` is not set:**

```text
Prompt:
"This payment is being applied to CYL value.

How should this be treated?

○ Financial settlement only
  → reduces cyl_value_balance
  → cyl_qty_balance unchanged
  → custody_state remains OUTSTANDING

○ Commercial cylinder purchase (reduces custody qty)
  → reduces cyl_value_balance
  → reduces cyl_qty_balance_by_sku
  → custody_state → COMMERCIALIZED
```

**Allocation preview must show before/after for both:**

```text
Before:
  CYL value:  R1,200
  19kg qty:   10 units

After (commercial):
  CYL value:  R0
  19kg qty:   0 units

After (financial only):
  CYL value:  R0
  19kg qty:   10 units  ← custody still outstanding
```

---

## 12. Financial CRN Allocation Workflow

### 12.1 Financial CRN definition

```text
ABS(HDR_TOTAL) > 0
```

### 12.2 Operator action flow

```text
Select financial CRN
View suggested invoice candidates (past-dated only)
Choose target invoice
Choose sub-ledger component (LPG / CYL_VALUE / OTHER)
↓
If component = CYL_VALUE AND SKU qty exists on invoice:
  System automatically applies Commercial CYL Settlement semantics
  → reduces cyl_value_balance
  → reduces cyl_qty_balance_by_sku
  → custody_state → COMMERCIALIZED (or PARTIALLY_RETURNED)
Review allocation preview (value + qty before/after)
Review warnings
Confirm allocation
Remainder routes to Suspense-CRN if any
```

### 12.3 Financial CRN — CYL settlement rule

Unlike PMT (which requires explicit operator choice), a financial CYL CRN applied to the CYL component always reduces both value and qty when SKU qty exists on the invoice. This is because a financial CRN with CYL line items represents a commercial reversal — the monetary and custody effects are inseparable.

```text
Financial CYL CRN allocated to CYL component:
  → cyl_value_balance reduced
  → cyl_qty_balance_by_sku reduced (by CRN SKU qty)
  → custody_state updated
```

### 12.4 Cross-bucket warning

If CRN bucket differs from target invoice component:

```text
Cross-bucket commercial settlement warning
```

Operator can continue.

---

## 13. Operational CYL CRN Workflow

Operational CYL CRNs are custody-only.

They do not reduce money.

### 13.1 Definition

```text
HDR_TOTAL = 0
AND CYL quantity movement exists
```

### 13.2 Auto-apply rule

Operational CYL CRNs may auto-apply only if:

```text
exact SKU match
AND prior-dated invoice exists
AND match is unambiguous
```

### 13.3 Ambiguous operational CRNs

If no clean match exists:

```text
route to OPERATIONAL_EXCEPTION
```

### 13.4 Operator action flow

```text
Open operational exception
Review returned SKU / qty
View candidate invoices
Assign return to invoice custody balance
Confirm
System reduces cyl_qty_balance_by_sku
```

### 13.5 Important rule

This action affects:

```text
custody_state
```

not:

```text
financial_state
```

---

## 14. Credit Pool Workflow

### 14.1 Credit pool display

Credit pool is shown in the session header:

```text
Available credit pool: R[amount]
```

### 14.2 Credit pool sources

```text
Overpayment
Unapplied financial CRN remainder
Negative OB
```

### 14.3 Application rule

Credit pool is never auto-applied.

Operator must click:

```text
Apply credit pool
```

### 14.4 Operator action flow

```text
Click Apply Credit Pool
Choose invoice
Choose sub-ledger component
Enter amount
Confirm
System creates credit_pool_movement
System creates allocation_record
```

---

## 15. Exception Lane Workflows

### 15.1 Suspense — PMT

Meaning:

```text
confirmed cash received but not allocated
```

Operator actions:

```text
allocate to invoice
move to credit pool
leave in suspense
add note
```

### 15.2 Suspense — CRN

Meaning:

```text
financial credit exists but not allocated
```

Operator actions:

```text
allocate to invoice
move to credit pool
leave in suspense
add note
```

### 15.3 Manual Hold — INV

Meaning:

```text
invoice exposure remains open
```

Operator actions:

```text
leave open
write off
apply credit pool
add note
```

### 15.4 UNCLASSIFIED_EXCEPTION

Meaning:

```text
JNL or Bank UD requires classification
```

Operator actions:

```text
classify
ignore
write off
```

Blocks completion until resolved.

### 15.5 OPERATIONAL_EXCEPTION

Meaning:

```text
zero-value CYL return needs manual custody assignment
```

Operator actions:

```text
assign to invoice custody balance
mark disputed
ignore
add note
```

Does not block financial session completion unless business later chooses to enforce custody completion.

---

## 16. Write-Off Workflow

### 16.1 Rounding write-off

If residual is:

```text
<= R1.00
```

System may offer:

```text
Create ROUNDING_WRITE_OFF
```

Operator approves.

### 16.2 Manual write-off

For larger amounts:

```text
Operator selects write-off
Operator enters reason
System creates WRITE_OFF record
```

### 16.3 UI rule

Write-off must always show:

```text
Amount being written off
Affected invoice/component
Reason
Operator
Timestamp
```

---

## 17. Notes Workflow

Notes are optional.

Notes may be attached to:

```text
session
allocation
exception
classification
credit pool movement
operational CYL assignment
```

Notes are persisted if present.

Notes are never required for ordinary allocation.

---

## 18. Undo / Edit Workflow

### 18.1 MVP rule

Operator should be able to reverse unsaved or current-session actions.

### 18.2 Recommended undo model

Instead of mutating records:

```text
create reversal event
```

Example:

```text
allocation_record
allocation_reversal_record
```

### 18.3 Required UI

Every reversible action should show:

```text
Undo
```

until session completion.

Post-completion editing can be deferred.

---

## 19. Session Completion Workflow

### 19.1 Completion readiness check

Session can be completed when:

```text
all visible documents are processed
AND no UNCLASSIFIED_EXCEPTION remains
AND operator marks complete
```

### 19.2 Not required

```text
ERP balance convergence
all invoices fully settled
all CYL custody fully returned
zero suspense
```

### 19.3 Completion screen

Before completion, show summary:

```text
Invoices settled
Invoices in manual hold
Payments in suspense
CRNs in suspense
Credit pool balance
Operational CYL exceptions
JNL / Bank UD classifications
Rounding write-offs
ERP/reference balance mismatch warning
```

### 19.4 Completion action

Operator clicks:

```text
Mark Session Complete
```

System saves session state:

```text
COMPLETE
```

---

## 20. Reopen / Archive Workflow

### 20.1 Reopen

A completed session may be reopened in a future version.

MVP can defer this, but should not design data in a way that prevents it.

### 20.2 Archive

Archived sessions are read-only.

### 20.3 Recommended rule

```text
COMPLETE sessions are locked from direct mutation.
Corrections are made through new session / reversal events.
```

---

## 21. Workflow State Diagram

```text
SELECT_ACCOUNT
  ↓
LOAD_SOURCE_ARTIFACTS
  ↓
BUILD_PROJECTIONS
  ↓
PREFLIGHT_REVIEW
  ↓
CUSTOMER_CONFIG_REVIEW
  ↓
CLASSIFICATION_GATE
  ↓
ACTIVE_RECONCILIATION
  ↓
EXCEPTION_HANDLING
  ↓
COMPLETION_REVIEW
  ↓
COMPLETE
  ↓
ARCHIVED
```

Alternative interruption flows:

```text
ACTIVE_RECONCILIATION
  → CROSS_BUCKET_PROMPT
  → PMT_TO_CYL_PROMPT
  → CLASSIFICATION_MODAL
  → CREDIT_POOL_MODAL
  → WRITE_OFF_MODAL
  → OPERATIONAL_CYL_ASSIGNMENT
```

---

## 22. Workflow Safety Rules

1. Operator must never allocate an unclassified JNL or Bank UD.
2. Operator must never apply payment to a future invoice.
3. Operator must explicitly choose sub-ledger component on mixed invoices.
4. Operator must confirm every financial allocation.
5. Operator must explicitly request credit pool application.
6. Operator must see danger-state UI for DEBIT_ADJUSTMENT.
7. Operator must see alert for PMT applied to CYL.
8. Operator must see cross-bucket warning unless customer flag softens it.
9. System must show remainder destination before confirming allocation.
10. Session completion must not require ERP balance convergence.
11. For CYL allocations, system must show before/after for both cyl_value_balance and cyl_qty_balance_by_sku in the confirmation preview.
12. PMT→CYL requires explicit operator choice between financial-only and commercial CYL settlement semantics unless pays_for_cyl = true.
13. Financial CYL CRNs automatically apply commercial CYL settlement (both ledgers) when SKU qty exists — no separate prompt needed.

---

## 23. Engineering Notes

The workflow assumes the following projections already exist or are generated on session load:

```text
invoice_sub_ledger
payment_queue
financial_crn_queue
operational_cyl_queue
exception_queue
customer_credit_pool
customer_config
allocation_records
session_events
```

The UI should never calculate business meaning from raw source rows directly.

The UI should consume prepared domain objects.

---

## 24. Open Workflow Questions

1. Should classification gate be mandatory before entering main workspace, or can it remain as a blocking queue visible throughout?
2. Should OPERATIONAL_EXCEPTION block session completion in later versions?
3. Should post-completion reopen be MVP or post-MVP?
4. Should supervisors approve large write-offs?
5. Should session notes be required when ERP/reference balance mismatch exists?
6. Should operators be able to bulk mark invoices as Manual Hold?

---

## 25. Version Control

### v0.3.0 — 2026-05-17

Status: Draft — pending T-01 DTRX validation

Changes:
- Updated companion spec reference to LSR5_Business_Rules_Spec.html v2.4.0.
- §11 Payment Allocation Workflow: added CYL branch logic (§11.5) with explicit two-path decision — financial-only vs Commercial CYL Settlement. Added allocation preview requirement showing before/after for both value and qty.
- §12 Financial CRN Allocation Workflow: added CYL settlement rule — financial CYL CRNs automatically reduce both value and qty (no separate prompt). Updated action flow.
- §22 Safety Rules: added rules 11–13 covering CYL allocation preview, PMT→CYL choice requirement, and financial CRN automatic coupling.
- Mental model (§3): added coupling event concept.

### v0.2.0 — 2026-05-17

Status: Superseded

Changes:
- Intermediate version — companion spec reference updated to v2.3.2.
- No structural workflow changes from v0.1.0.

### v0.1.0 — 2026-05-17

Status: Superseded

Changes:
- Created first operator workflow specification.
- Separated workflow rules from business/domain rules.
- Defined session lifecycle from debtor selection to completion.
- Added payment, CRN, operational CYL, credit pool, exception, and completion workflows.
- Added workflow safety rules and open workflow questions.
