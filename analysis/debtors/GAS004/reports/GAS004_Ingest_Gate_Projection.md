# GAS004 — Operator Ingest Gate Projection

**As at:** 2026-08-17 · **Source:** `GAS004_INGEST_COVERAGE_2026-08-17.json`

| Field | Value |
| :--- | :--- |
| Display status | `CURRENT_PARTIAL` |
| ingestFreshness | `current` (DB sync **2026-08-17** ≥ TXT as-at **2026-08-03**) |
| ingestCoverage | `partial` (**10** missing headers) |
| Financial balance from TXT | **ALLOWED** (running close R20,061.51) |
| Custody / Part 2 | **BLOCKED** |
| SKU analysis | **BLOCKED** |
| Allocation | **BLOCKED** |

## Missing headers (2026 period)

| Doc | Type | Date | Class |
| :--- | :--- | :--- | :--- |
| 44130 | Ud Paymnt | 02 May | MISSING_HEADER |
| 44139 | Ud Paymnt | 02 May | MISSING_HEADER |
| 44533 | Ud Paymnt | 06 Jun | MISSING_HEADER |
| 44534 | Ud Paymnt | 06 Jun | MISSING_HEADER |
| 44845 | Payment | 26 Jun | MISSING_HEADER |
| 45049 | Payment | 10 Jul | MISSING_HEADER |
| 45077 | Payment | 13 Jul | MISSING_HEADER |
| 45282 | Payment | 23 Jul | MISSING_HEADER |
| 45412 | Ud Paymnt | 30 Jul | MISSING_HEADER |
| 45484 | Ud Paymnt | 03 Aug | MISSING_HEADER |

## TXT behind live ERP (DB-only after 3 Aug)

These invoices are in Supabase and **not** in `DEBENQ_CURRENT.TXT`. Do not infer SKUs from paired CNs.

| Doc | Type | Date |
| :--- | :--- | :--- |
| 52467 | Invoice | 10 Aug 2026 |
| 52478 | Invoice | 10 Aug 2026 |
| 52518 | Invoice | 12 Aug 2026 |
| 52519 | Invoice | 12 Aug 2026 |
| 52586 | Invoice | 14 Aug 2026 |

Also: **45412** appears in DB as `Payment` (29 Jul) and in TXT as `Ud Paymnt` (30 Jul).

## Collections eligibility

Financial position may be stated from the TXT **running close** (R20,061.51). Header `CURRENT BALANCE` R30,242.46 is the same ledger **excluding** UD. **Do not** treat Part 2 custody or the R-57.50 1B-vs-qty residual as sourced. **Do not** send a customer statement until H-021 lands.

## Next Sources action

1. Re-export GAS004 enquiry/statement through **today**, plus same-session DTRX + ITEMS.  
2. Drop into `analysis/debtors/GAS004/raw/`.  
3. Re-run `npm run debtors:ingest-check -- --debtor GAS004` and v5.

Target: `CURRENT_COMPLETE`, or narrow ratified exceptions in `config/ingest_exceptions.json` for genuine header-only UD docs.
