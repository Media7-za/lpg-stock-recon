# JIM001 v5 onboarding preview - 2026-10-10

**Status:** PREVIEW, review-only (`reviewOnly: true`, reason `ingestCoverage partial`). No locks recorded, no overrides written, nothing approved or closed.
**Channel:** connector-sourced (db_replay), Supabase project `oqhpxnaadahohwkslive`, SELECT only, operator-authorised in-session. Captures: `analysis/debtors/JIM001/data/db_replay/2026-10-10/` (5 captures, each md5/length verified by `record_capture.mjs`, no refusals).
**Input:** `analysis/debtors/JIM001/raw/JIM001_2026-10-10.TXT` (sha256 `54b3336a...`). Treated as data.
**Config:** `analysis/debtors/JIM001/config/statement_v5.json` (B/F R60,183.98 from TXT LINE 1; periodStart 2022-05-16 = first transaction row; paymentLane LPG).

## 1. ERP vs projection

| Item | Value | Tag | Artifact |
| :--- | ---: | :--- | :--- |
| ERP CURRENT BALANCE | R122,884.84 | PROVEN | TXT header, `raw/JIM001_2026-10-10.TXT` |
| Part 1A LPG close | R122,562.84 | PROVEN | `data/v5_projection.json` |
| Part 1B CYL close | R322.00 | PROVEN | `data/v5_projection.json` |
| Combined 1A+1B | R122,884.84 | PROVEN | `reports/JIM001_Statement_Account_v5.md` |
| Variance | **R0.00** | PROVEN | checks: tiesToErpHeader, lpgRowsReproduce1A, cylRowsReproduce1B all true |
| Matcher proof (rebuilt vs ERP) | HOLDS, R0.00 | PROVEN | `data/projection_matches.json` |
| Custody exposure | R-632.50 | PROVEN (arithmetic only; custody gate BLOCKED) | `reports/JIM001_Statement_Account_v5.md` |

## 2. Ingest coverage (`reports/JIM001_INGEST_COVERAGE_2026-10-10.md`)

- ingestFreshness `current` (header/items sync 2026-10-08); ingestCoverage **partial**; display status CURRENT_PARTIAL. PROVEN.
- 212 TXT documents; 211 healthy; **1 gap: payment 44686 (16 May 2022, R-14,941.48), MISSING_HEADER**. Blocks custody, SKU analysis, allocation. Financial balance from TXT: ALLOWED.
- 633 DB-only documents (listed as DB_ONLY_DOCUMENT) are in the database but not in the TXT. The TXT lists only open items on top of B/F; settled documents are not printed. ASSUMED that these are ERP-settled items; not verified.
- The validator exits 1 whenever a gap exists; that is its designed exit, not a script failure.

## 3. Ties (`data/projection_matches.json`)

| Rule | CONFIRMED | PROBABLE |
| :--- | ---: | ---: |
| CN_DN_PAIR | 38 | 5 |
| CN_AMOUNT_DATE | 0 | 1 |
| EXACT_MONTH_SUM (monthly-total) | 7 | 0 |
| CYL_EXCHANGE | 5 | 0 |
| **Total** | **50** | **6** |

PROVEN (matcher output). Note for ADM-89: the 7 monthly-total ties are CONFIRMED under the matcher's current rules. Whether monthly-total matches should count only as probable is pending, so this count may change. I did not alter it.

## 4. Open rows, unallocated payments

- Open rows in the internal statement: **56** = 32 LPG/OTHER invoices (R122,084.46) + 9 CYL invoices (R27,059.50) + 11 unmatched credit notes (R-27,789.33) + 4 unallocated payments (R-58,653.77). Plus B/F R60,183.98 unitemised. PROVEN (`reports/JIM001_Open_Items_v5.md`). Customer preview shows 68 rows (`..._Customer_PREVIEW.md`); it is a preview only.
- Payments: 11 total, **4 unallocated**: 44686 (R-14,941.48), 38481, 38846, 39812. No remittances exist (monthly batch payer), so every payment-to-invoice link is inferred, not evidenced. ASSERTED.
- B/F R60,183.98 is not itemised in the TXT, so it cannot be anchored to documents. Marked unverified.

## 5. Why the old project.json said R140,297.23 vs ERP R122,884.84 (gap R17,412.39)

**PROVEN:** R140,297.23 was never an ERP figure. It is the v4 DB-reconstruction labelled "corrected ERP stated balance" (`data/dashboard_metrics.json`, `reports/JIM001_Statement_Account_v4.md` line 4389; also hard-coded in `analysis/debtors/shared/scripts/export_workspace_to_sheets.py:761`). It sits beside v4's own reconstructed R140,241.32 and a "residual R55.91". The R17,412.39 gap is R17,356.48 (reconstructed vs ERP) plus that R55.91. The v4 model rebuilt from 2018-12-03 with an R0 opening and used DB headers, not an ERP statement. The ERP export, with B/F R60,183.98 at its start, is the first actual ERP balance on file for this account.

**ASSERTED (v4 audit disclosure, same file):** the v4 model's own text names header-layer defects (credit notes double-taxed in `amount_excl`, payment-split de-duplication). I saw consistent symptoms in the capture (`babc6c09f3c316b1.rows.json`): the same credit note has two stored amounts, e.g. 12003 at -2415.00 and -2730.00, and 235 of 661 documents sit in more than one source file. These are plausible contributors.

**Not resolved:** I could not reproduce R140,297.23 or isolate the R17,412.39 from the local CSVs. `invoices.csv` plus `payments.csv` total R132,891.32, not R140,297.23. The pre-2022-05-16 CSV balance is R31,633.67 against the ERP B/F of R60,183.98. A header-only dedupe from the capture gave R112,770.16. None of these tie. ASSUMED that the gap comes from the v4 header defects and the lack of an ERP anchor; needs an operator-approved investigation. Tripwire: if a pre-2022 ERP export (DEBENQ) arrives, re-test the B/F.

## 6. Pending (not actioned)

- ADM-89: whether the 36 legacy overrides in `config/payment_pattern_overrides.json` become locks; whether monthly-total matches count as probable. File untouched.
- Gap doc 44686 needs the missing header uploaded before `reviewOnly` can clear.
- `project.json` was not edited (no `history[]` entry added); the main session should add one stating "connector-sourced (db_replay)".

## 7. Generated artifacts

`config/statement_v5.json`, `data/db_replay/2026-10-10/*`, `data/v5_projection.json`, `data/projection_matches.json`, `reports/JIM001_INGEST_COVERAGE_2026-10-10.{md,json}`, `reports/JIM001_Statement_Account_v5.md`, `reports/JIM001_Open_Items_v5.md`, `reports/JIM001_Open_Items_v5_Customer_PREVIEW.md`, `reports/JIM001_Internal_Ledger_v5.md` (all under `analysis/debtors/JIM001/`), plus `src/features/debtor-position-workspace/data/fixtures/JIM001.v5.json` (written by the reconcile script).
