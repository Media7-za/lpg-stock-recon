# Agent Validation Checklist

> **Agent Rule:** Complete this checklist before marking ANY implementation task done. Respond with PASS / FAIL / N/A for each applicable item. A single FAIL means the task is not complete. Fix the failing item and re-check.

---

## Section 1 — Data Identity

| # | Check | Result |
|---|---|---|
| 1.1 | Every ID passed to an API is the correct entity type (`Account.accountNo` String ≠ `Account.id` cuid ≠ `TransactionHeader.id` BigInt) | |
| 1.2 | `AllocationEvent.sourceId` contains a **Payment** `TransactionHeader.id` — never an Invoice id | |
| 1.3 | `AllocationEvent.targetId` contains an **Invoice** `TransactionHeader.id` — never a Payment id | |
| 1.4 | Operator-facing document references use `TransactionHeader.doc_no`, not `TransactionHeader.id` | |
| 1.5 | No variable is sourced from one entity response and passed as a different entity's ID | |

---

## Section 2 — Status Values

| # | Check | Result |
|---|---|---|
| 2.1 | `ReconciliationSession.status` comparisons use ALL CAPS: `'OPEN'` `'DRAFT'` `'FINALIZED'` | |
| 2.2 | `PhysicalCountSession.status` comparisons use snake_case: `'in_progress'` `'completed'` | |
| 2.3 | `PhysicalCountSession.current_state` comparisons use ALL CAPS | |
| 2.4 | `EntryType` comparisons use exact casing: `'Invoice'` `'Payment'` `'Crd Note'` (not `'CRD_NOTE'` or `'credit_note'`) | |
| 2.5 | No status display label is ever passed to an API filter | |
| 2.6 | No `.toLowerCase()` or `.toUpperCase()` applied before status comparison | |

---

## Section 3 — UI Actions

| # | Check | Result |
|---|---|---|
| 3.1 | Every `<button>` element has an `onClick` prop | |
| 3.2 | Every `<a>` / `<Link>` element has an `href` / `to` prop | |
| 3.3 | No interactive element is rendered without a handler (dead element = INV-003 violation) | |
| 3.4 | Placeholder action buttons are `disabled` or carry a visible "delegated to workflow" label with a `// TODO: LSR-{n}` comment | |

---

## Section 4 — Navigation Context

| # | Check | Result |
|---|---|---|
| 4.1 | Navigation from debtor list to workspace passes `accountNo` (String), not `id` (cuid) | |
| 4.2 | Navigation from transaction list to allocation view passes correct `session_id` | |
| 4.3 | No navigation action silently drops context that exists on the source screen | |

---

## Section 5 — Dynamic Data

| # | Check | Result |
|---|---|---|
| 5.1 | No SKU codes (`'9.1'`, `'19.1'`, etc.) hardcoded as filter sources — fetched from `products` table | |
| 5.2 | No deposit rates hardcoded in component logic — fetched from DB or config | |
| 5.3 | No account names hardcoded — fetched from `accounts` table | |
| 5.4 | No status filter lists hardcoded as inline string arrays — derived from type constants | |

---

## Section 6 — Doctrine Compliance (Debtor Workspace)

| # | Check | Result |
|---|---|---|
| 6.1 | `Cylinder Financial Balance` and `Cylinder Custody Exposure` displayed as separate, independent fields | |
| 6.2 | Non-zero `erpVariance` is visible — never hidden, suppressed, or corrected away | |
| 6.3 | Non-zero `cylinderVariance` is visible — never hidden or suppressed | |
| 6.4 | Variances are labelled as disclosed outcomes — not automatically as errors unless `severity: 'critical'` | |
| 6.5 | React performs no canonical balance calculations — all figures come from fixture/API payload | |
| 6.6 | Customer view does not expose internal audit disclosures (Reconciliation Position, internal variance detail) | |

---

## Section 7 — Formatting Standards

| # | Check | Result |
|---|---|---|
| 7.1 | All user-facing dates use `formatDate()` utility (outputs `dd MMM yyyy`) | |
| 7.2 | No direct calls to `toLocaleDateString()`, `format()`, or `toString()` on dates in UI components | |
| 7.3 | All monetary values use `formatZAR(value)` utility (`R{n,nnn.nn}` / `R-{n,nnn.nn}`) | |
| 7.4 | No inline currency formatting in JSX | |
| 7.5 | Cylinder quantities displayed as integers (no decimal places) | |

---

## Section 8 — State Machine Compliance

| # | Check | Result |
|---|---|---|
| 8.1 | All side effects of the triggered state transition are implemented (see `docs/governance/state_machines.md`) | |
| 8.2 | `UNCLASSIFIED_EXCEPTION` records block `FINALIZED` transition — guard is enforced server-side | |
| 8.3 | `DEBIT_ADJUSTMENT` surfaces a danger-class confirmation modal — not a standard action | |
| 8.4 | `ROUNDING_WRITE_OFF` requires explicit one-click operator approval — never silent | |
| 8.5 | Zero-value CRNs are routed to custody lane only — never to financial allocation engine | |
| 8.6 | Bank UD records route to `UNCLASSIFIED_EXCEPTION` on session load — never to `Suspense-PMT` | |

---

## Section 9 — Event Consumers

| # | Check | Result |
|---|---|---|
| 9.1 | After any write operation, all UI consumers are updated (re-fetch or optimistic update) | |
| 9.2 | After allocation, the source payment `available_balance` and target invoice `available_balance` update in the UI | |
| 9.3 | After session status change, the workspace status badge and toolbar reflect the new state | |

---

## Section 10 — Scope Compliance

| # | Check | Result |
|---|---|---|
| 10.1 | No ERP writeback logic introduced — workbench is read-only with respect to ERP | |
| 10.2 | No autonomous financial allocation — engine suggests, operator confirms every action | |
| 10.3 | No proportional PMT split logic introduced | |
| 10.4 | No auto-spill of PMT remainder — remainder always routes explicitly to Suspense-PMT | |
| 10.5 | All new features reference a LSR ticket number in a `// TODO: LSR-{n}` comment or PR description | |

---

## Sign-off

```
Task / Ticket: LSR-___
Sections checked: ___________
All applicable items: PASS ☐
Agent sign-off: ____________
```
