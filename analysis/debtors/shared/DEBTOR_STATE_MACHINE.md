# Debtor State Machine

> **Constitutional coupling:** `DEBTORS_DOCTRINE.md` §1 (state is derived) · §7 (governance). This file defines **valid transitions** for derived portfolio state (ALIGNED).

This document governs the allowed state transitions for debtor micro-projects to prevent data corruption and ensure logical workflow progression. It outlines the valid lifecycles between the `reconState` and `status` fields defined in `PROJECT_SCHEMA.md`.

## Lifecycle Stages

The debtor portfolio management slice divides operations into two distinct tracks:
1. **Reconciliation State (`reconState`)**: Tracks the analytical reconstruction of the ledger.
2. **Workflow Status (`status`)**: Tracks the commercial interaction with the client.

---

## 1. Reconciliation State (`reconState`)

**Valid States:** `pending` ➔ `in-progress` ➔ `complete`

### Allowed Transitions:
- `pending` ➔ `in-progress`: When an agent or analyst begins ingesting TXT statements and identifying variances.
- `in-progress` ➔ `complete`: When zero-variance is achieved or variances are formally signed off and documented in a BASELINE markdown report.
- `complete` ➔ `in-progress`: (Regression) Allowed *only* if new monthly statements arrive that break previous reconciliations or introduce new unmatched payments.

> **Rule:** You cannot move from `pending` directly to `complete` without passing through `in-progress` (even briefly).

---

## 2. Workflow Status (`status`)

**Valid States:** `active`, `collection`, `on-hold`, `resolved`

### Allowed Transitions:
- **`active` ➔ `collection`**: Only when the **D17** eligibility gate is met (see Strict Coupling Rule 1). Ageing (e.g. >180 days) sets **priority** among eligible accounts — it does **not** by itself authorise the transition.
- **`collection` ➔ `active`**: When the debtor settles the aged debt or signs an acceptable payment plan, returning the account to good standing.
- **`active` ➔ `on-hold` / `collection` ➔ `on-hold`**: When management halts operations (e.g., pending a legal dispute or internal audit).
- **`on-hold` ➔ `active` / `collection`**: When the hold is lifted.
- **`collection` ➔ `resolved`**: When the debt is entirely written off, settled via legal action, or handed over to external collections (closing out our internal tracking).
- **`active` ➔ `resolved`**: Only valid if the account is formally closed and final balance settled to zero.

---

## Strict Coupling Rules

To maintain portfolio integrity, the `debtors:sync` validator enforces these cross-field rules:

1. **No Collections Without a Collectable Balance (D17):**
   You **cannot** transition `status` to `collection` unless **all three** hold:

   a. `reconState` is strictly `complete` — constitutional closure, **not** a workbench session marked `COMPLETE` (**D16**: that state confers no `PROVEN` status and does not satisfy `reconState: complete`);
   b. a **stated collectable balance** exists under the §2 Collectable Rule (`ERP balance − Σ ratified holds`), with any bridge itemized, dated, and registered;
   c. **no** unresolved dispute, stale source, unratified hold, or open identity blocks that balance.

   You cannot demand payment on a ledger that hasn't been verified. An aged account failing (b) or (c) routes to **human review**, not to the collections lane.
   
2. **Action Required Flag:**
   If `status` is `collection`, then `collections.actionRequired` **must** be `true` and `collections.actionType` **cannot** be null.

3. **Resolved Integrity:**
   If `status` is `resolved`, the `financials.totalOutstanding` should ideally be `0.0`, OR an explicit write-off entry must exist in the `history` array.
