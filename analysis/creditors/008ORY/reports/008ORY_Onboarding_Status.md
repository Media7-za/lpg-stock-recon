# 008ORY (Oryx Energy) — Creditor v5 Onboarding Status

**State:** `reconciled-financial` · **Version:** v5 · **Period:** Mar 2025 → Aug 2026

First creditor (Accounts Payable) account onboarded onto the v5 pipeline, mirroring the
debtor v5 machinery in a new parallel `analysis/creditors/` micro-project. Now running on
the **authoritative** ERP creditor-enquiry export (`CREDENQ_2939`, full ledger from B/F 0.00).

## Lane 1 — ERP TXT financial bridge (DONE, TXT-only, R0.00)
| Check | Reconstructed | ERP | Variance |
| :--- | ---: | ---: | ---: |
| Ledger tie (1A + 1B vs `TOTAL TRANSACTIONS`) | R-121,237.70 | R-121,237.70 | **R0.00 ✅** |
| ERP tie ((Combined − UD) vs `CURRENT BALANCE`) | R-437,114.03 | R-437,114.03 | **R0.00 ✅** |
| Sub-ledger tie (1A + 1B vs combined) | R-121,237.70 | — | **R0.00 ✅** |

Sub-ledger split (ref-pattern only, no DB): Part 1A LPG **R60,922.30**, Part 1B CYL
(`EMPTIES` refs) **R-182,160.00**. Undeposited payments (`Ud XFer`) **R315,876.33** are the
reconciling item between the itemised ledger and the payable.

Generated via `npm run creditors:statement-v5 -- --creditor 008ORY` →
`reports/008ORY_Statement_Account_v5.md`.

## Ingest gate — UNVERIFIED (expected here)
`DATABASE_URL` is not wired in this environment, so custody / SKU / allocation coverage
could not be verified (486 GRV/Deb Note docs are `DB_UNVERIFIED`). Financial balance from
TXT remains `ALLOWED`; this does not block the Tier-3 financial sign-off.

## Remaining before full sign-off
1. **Wire `DATABASE_URL`** (Supabase) to populate the Part 1B DB line-split and the Part 2
   cylinder shell tracker, and to move the ingest gate off `UNVERIFIED`. The current Part 1B
   figure is derived only from `EMPTIES` ref matching, not the authoritative line-level
   `debt_group` split.
2. **Lane 2 (Tier-2 supplier-ledger cross-check)** — SON-ref matching against ERP GRV refs —
   remains designed but not built (`creditors:oryx-parse`, `creditors:oryx-bridge`).
