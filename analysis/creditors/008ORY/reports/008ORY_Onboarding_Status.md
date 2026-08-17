# 008ORY (Oryx Energy) — Creditor v5 Onboarding Status

**State:** `in-progress` · **Version:** v5 · **Period:** Jul 2026

First creditor (Accounts Payable) account onboarded onto the v5 pipeline, mirroring the
debtor v5 machinery in a new parallel `analysis/creditors/` micro-project.

## Lane 1 — ERP TXT financial bridge (DONE, TXT-only)
| Check | Result |
| :--- | :--- |
| ERP `CURRENT BALANCE` (TXT header) | R257,563.80 |
| Part 1A (LPG Gas Purchases) close | R257,563.80 |
| Part 1B (CYL Deposits) close | R0.00 |
| Combined (1A + 1B) | R257,563.80 |
| **ERP variance** | **R0.00 ✅** |
| **Sub-ledger tie variance** | **R0.00 ✅** |

Generated via `npm run creditors:statement-v5 -- --creditor 008ORY` →
`reports/008ORY_Statement_Account_v5.md`.

## Ingest gate — UNVERIFIED (expected here)
`DATABASE_URL` is not wired in this environment, so custody / SKU / allocation coverage
could not be verified. Financial balance from TXT remains `ALLOWED`. See
`reports/008ORY_INGEST_COVERAGE_*.md`. This does not block the Tier-3 financial sign-off.

## Data-quality caveats (must resolve before sign-off)
1. **`008ORYCURRENT.TXT` is interim/synthetic** — reconstructed from the July 2026 Oryx
   supplier-ledger excerpt (SAINV→GRV, SACRN→Deb Note, ARPAY→Payment). Replace with the
   authoritative ERP creditor-enquiry export and re-derive `combinedBf`.
2. **Custody (Part 1B / Part 2) unverified** — wire `DATABASE_URL` and re-run the ingest
   check + statement to populate the LPG/CYL line-split and cylinder shell tracker.

## Not yet built — Lane 2 (Tier-2 supplier-ledger cross-check)
Parse the Oryx supplier ledger and cross-check SON refs (e.g. `SON2607ZA105000002`)
against ERP GRV refs; surface unmatched lines as bridge exceptions. Planned scripts:
`creditors:oryx-parse`, `creditors:oryx-bridge`; config `config/oryx_ledger_map.json`.
