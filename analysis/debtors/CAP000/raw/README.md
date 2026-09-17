# CAP000 raw intake

**H-011 resolved 2026-09-17.** Operator supplied 4 chronological ERP account-enquiry TXT exports covering the full account history, B/F-chained with zero variance at every boundary:

| File | Coverage | Opens | Closes |
| :--- | :--- | ---: | ---: |
| `DEBENQ23.TXT` | 2022 FEBRUARY (23 Jul 2022 – 01 Mar 2023) | R0.00 | R48,267.34 |
| `DEBENQ24.TXT` | 2024 FEBRUARY (07 Mar 2023 – 28 Feb 2024) | R48,267.34 | R60,437.64 |
| `DEBENQ25.TXT` | 2025 MARCH (incl. backdated Jan/Feb 2023 STAT:89 reallocations – 28 Feb 2025) | R60,437.64 | R43,865.94 |
| `DEBENQ.TXT` | CURRENT (03 Mar 2025 – 17 Sep 2026) | R43,865.94 | R70,773.28 |

All four carry allocation detail (`INVNO` populated) — CAP000 is **not** one of the `H-016` EXCLUDE-flagged accounts.

`CAP000.TXT` (pre-existing, stale — closes 2026-08-03 at R56,654.30, no allocation detail) is retained for provenance only; superseded by `DEBENQ.TXT` above.

Statements:

| Version | Path | Notes |
| :--- | :--- | :--- |
| Part 1 (combined, TXT-only) | `reports/CAP000_Statement_Account.md` | ERP variance R0.00 |
| v5 (LPG/CYL sub-ledger + custody) | `reports/CAP000_Statement_Account_v5.md` | ERP variance R0.00, sub-ledger tie R0.00. DB data sourced via Supabase MCP `execute_sql` against the `lpg-stock-recon` project (`oqhpxnaadahohwkslive`), no local `DATABASE_URL` — see `config/statement_v5.json`. Open **H-029**: R8,245.50 CYL custody variance. |

No remittance PDFs received or required (lane re-locked `position_recon`, not `settlement_discount`).
