# Creditors (Accounts Payable) Doctrine

This is the AP counterpart to the debtors (Accounts Receivable) doctrine. It governs
the `analysis/creditors/**` micro-project. It **mirrors** the debtor v5 pipeline and
deliberately does **not** modify any existing debtor v4/v5 artifact.

## C1 — Tiered evidence
- **Tier-3 (authority):** the ERP creditor-enquiry **TXT** `CURRENT BALANCE`. This is the
  single source of truth for the payable balance and the v5 pass gate.
- **Tier-2 (cross-check):** the supplier's own ledger (e.g. the Oryx statement). Used for
  document-level cross-checks (SON refs, dispute evidence). Never overrides Tier-3.
- **Tier-1 (line detail):** `vw_clean_transactions` line qty from Supabase — drives the
  Part 1B LPG/CYL split and Part 2 custody. A derived cache, never an authority.
- **Advisory:** free-text description dates on supplier documents.

## C2 — Document mapping (AR → AP)
| Debtor (AR) | Creditor (AP) | Meaning |
| :--- | :--- | :--- |
| `Invoice` | `GRV` | Goods received voucher / supplier charge |
| `Crd Note` | `Deb Note` | Supplier return / credit |
| `Payment` | `Payment` | Money paid to the supplier |

## C3 — Direction (sign convention)
The payable **increases** on a `GRV` and **decreases** on a `Deb Note` or `Payment` —
the debit/credit inverse of the AR side. Signs are carried by the TXT `AMOUNT` column
(GRV `+`, Deb Note/Payment `−`), so the running-balance arithmetic is identical to the
debtor lane and no code-level sign flip is required.

## C4 — v5 layout (same as debtors)
Part 1A (LPG gas, `.4` SKUs + payments) · Part 1B (CYL deposits, `.1` SKUs) ·
Reconciliation Bridge (`1A + 1B = ERP CURRENT BALANCE`) · Ingest Gate · Part 2
(cylinder shell movement) · Creditor Position Summary (`INTERNAL_ONLY`).

## C5 — Pass gates
A v5 creditor statement is **signed off** only when **both** hold:
1. ERP variance (`Combined − ERP header`) = **R0.00**, and
2. Sub-ledger tie (`1A + 1B − Combined`) = **R0.00**.

Custody (Part 2) is signed off separately and only when the ingest gate is not
`BLOCKED`/`UNVERIFIED`. A custody or supplier-ledger variance does **not** block the
financial sign-off when Tier-3 reconciles to R0.00, but it must surface as an exception.

## C6 — Linked accounts
Legacy supplier codes are treated as a single economic counterparty via
`config.statement_v5.json.linkedAccounts` (e.g. `008ORY` links `007ORY`). DB coverage
and line-split queries scope to `account_no = ANY([code, ...linkedAccounts])`.

## C7 — Non-goals
Do not edit debtor artifacts. Do not derive a `collectable`/`payable-now` figure inside
the generator — the statement computes sub-ledger positions and variances only.
