# Statement of Account — Version 5 (Sub-Ledger Position Statement)

> **PARTIAL RUN — Part 2 and the ingest gate were NOT executed.** This session has no `DATABASE_URL`/`pg` package available (`Error: Cannot find package 'pg'` on both `npm run debtors:ingest-check -- --debtor MD0003` and `reconcile_debtor_v5_from_txt.mjs --debtor MD0003`, 2026-09-20). Per `SKILL_Debtor_Statement_v5_From_TXT.md`, Part 2 (physical cylinder custody) and the ingest-coverage gate are DB-dependent and cannot be produced without it. **Part 1A/1B/Bridge below were reconstructed directly from the ERP TXT** using the skill's documented routing rule (`-EMPTY`/`EMPTIES` reference match → Part 1B, everything else → Part 1A, payments to Part 1A per `paymentLane: LPG`), verified line-by-line against the TXT's own running-balance column with zero divergence. Do **not** treat this as a passing v5 run — re-run the real generator once DB access is available.

**Account:** MD0003 — BLUFF MEAT SUPPLY(PTY) LTD
**Period:** 2026-01-01 → 2026-09-15
**Source:** `raw/Enquiry/DEBENQ_CURRENT.TXT` (refreshed 2026-09-17, includes STAT:130/doc 46021 confirmed against `01.09.2026.pdf`)
**Config:** `config/statement_v5.json`
**Generated:** 2026-09-20

---

## Opening / Closing Summary

| | Part 1A (LPG) | Part 1B (CYL) | Combined |
| :--- | ---: | ---: | ---: |
| **Opening (as at 2026-01-01, before first Jan txn)** | 5,678.13 | 57.50 | **5,735.63** |
| **Closing (as at 2026-09-15)** | 14,791.61 | 517.50 | **15,309.11** |

Combined figures are **PROVEN** — closing matches the ERP `CURRENT BALANCE` header exactly, and opening matches the independently-verified 31/12/2025 running balance (`DEBENQ_CURRENT.TXT` line 204, confirmed in this session's lifetime-chain investigation). The **1A/1B split itself is ASSERTED, not PROVEN** — see "Basis and limitations" below.

---

## Part 1A: LPG Gas Financial Statement

| Month | Net movement | Closing balance |
| :--- | ---: | ---: |
| Opening (31 Dec 2025) | — | 5,678.13 |
| Jan 2026 | +13,903.17 | 19,581.30 |
| Feb 2026 | −4,225.32 | 15,355.98 |
| Mar 2026 | +1,172.11 | 16,528.09 |
| Apr 2026 | −759.72 | 15,768.37 |
| May 2026 | +2,293.82 | 18,062.19 |
| Jun 2026 | +6,888.75 | 24,950.94 |
| Jul 2026 | +7,702.58 | 32,653.52 |
| Aug 2026 | −1,557.96 | 31,095.56 |
| Sep 2026 (to 15th) | −16,303.95 | **14,791.61** |

Large monthly swings are the account's normal one-month-in-arrears STAT batch cadence (invoices accrue, then a lump payment lands ~1 month later) — see `MD0003_Statement_of_Account.md` for the STAT:126–130 reconciliation detail and `MD0003_Lifetime_Balance_Investigation_2026-09-17.md` for the account's full history.

---

## Part 1B: Cylinder Deposit Financial Statement

| Month | Net movement | Closing balance | Notes |
| :--- | ---: | ---: | :--- |
| Opening (31 Dec 2025) | — | 57.50 | Carry from doc 46445 (17/09/2025) — invoice R3,105.00 vs credit note only R3,047.50; already flagged in onboarding history, unresolved since 2025 |
| Jan 2026 | −57.50 | 0.00 | ERP CN 14328 (24/01/2026, doc 48927, −R5,520.00) over-credits its own invoice by exactly R57.50 — a second, independently-confirmed instance of the same "leftover dumped on adjacent doc" ERP behaviour (see the doc-48372 finding). Coincidentally zeroes the opening carry; **not causally linked** to it — flagging so this isn't misread as "the 46445 issue resolved itself." |
| Feb 2026 | 0.00 | 0.00 | Clean — all EMPTY pairs net exactly |
| Mar 2026 | +3,622.50 | 3,622.50 | Timing only — EMPTY invoice (doc 50235, 15/03/2026 period) posted; matching CN follows next month |
| Apr 2026 | −3,622.50 | 0.00 | CN clears the March timing gap above |
| May–Jul 2026 | 0.00 | 0.00 | Clean throughout |
| Aug 2026 | +517.50 | 517.50 | Doc 52422 (08/08/2026): invoice R1,035.00, CN only −R517.50 — the same still-open item flagged in `MD0003_Statement_of_Account.md`'s unresolved Aug–Sep window |
| Sep 2026 (to 15th) | 0.00 | **517.50** | No further CYL movement |

**Both endpoints of this sub-ledger land exactly on independently-identified exceptions** (R57.50 = doc 46445's known shortfall; R517.50 = doc 52422's known shortfall) — nothing else contributes to the Part 1B balance across the whole period. This is a strong internal-consistency check on the "CYL opening = 0 at account's Feb-2025 B/F" assumption below.

---

## Part 1 — Reconciliation Bridge (1A + 1B = ERP)

| Date | 1A | 1B | 1A+1B | ERP TXT running balance | Variance |
| :--- | ---: | ---: | ---: | ---: | ---: |
| 31 Dec 2025 (opening) | 5,678.13 | 57.50 | 5,735.63 | 5,735.63 | **R0.00** |
| 31 Jan 2026 | 19,581.30 | 0.00 | 19,581.30 | 19,581.30 | R0.00 |
| 28 Feb 2026 | 15,355.98 | 0.00 | 15,355.98 | 15,355.98 | R0.00 |
| 31 Mar 2026 | 16,528.09 | 3,622.50 | 20,150.59 | 20,150.59 | R0.00 |
| 30 Apr 2026 | 15,768.37 | 0.00 | 15,768.37 | 15,768.37 | R0.00 |
| 31 May 2026 | 18,062.19 | 0.00 | 18,062.19 | 18,062.19 | R0.00 |
| 30 Jun 2026 | 24,950.94 | 0.00 | 24,950.94 | 24,950.94 | R0.00 |
| 31 Jul 2026 | 32,653.52 | 0.00 | 32,653.52 | 32,653.52 | R0.00 |
| 31 Aug 2026 | 31,095.56 | 517.50 | 31,613.06 | 31,613.06 | R0.00 |
| 15 Sep 2026 (closing) | 14,791.61 | 517.50 | **15,309.11** | **15,309.11** | **R0.00** |

**`ERP variance R0.00` at every month-end** — the split ties to the raw TXT exactly throughout the period, matching the real script's own pass criterion for this bridge (the Part 2 / sub-ledger-tie gate below is the piece this session couldn't run).

---

## Ingest Gate

*No coverage report found. Run `npm run debtors:ingest-check -- --debtor MD0003` before trusting Part 2 qty.* (Verbatim fallback text — this session could not run the check: `Error: Cannot find package 'pg'`, no `DATABASE_URL` configured.)

---

## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)

**NOT RUN.** Part 2 requires `transaction_items` custody data via `DATABASE_URL` — unavailable this session. `config/statement_v5.json`'s `cylOpeningQty` fields are placeholder zeros explicitly marked `UNVERIFIED PLACEHOLDER` — do not use them for custody or collections decisions.

---

## Debtor Position Summary (INTERNAL_ONLY)

| Metric | Value | Basis |
| :--- | ---: | :--- |
| Combined balance (15 Sep 2026) | R15,309.11 | **PROVEN** — ERP `CURRENT BALANCE` header |
| Part 1A (LPG) closing | R14,791.61 | ASSERTED — TXT-only split, DB not run |
| Part 1B (CYL) closing | R517.50 | ASSERTED — TXT-only split, DB not run |
| Physical CYL custody | — | **NOT ASSESSED** — Part 2 not run |

---

## Basis and limitations (read before using this document)

1. **Opening CYL sub-balance is an assumption, not a proven figure.** `config/statement_v5.json`'s `combinedBf` (R5,735.63, 31/12/2025) is PROVEN from the raw TXT. Splitting it into 1A/1B required assuming the CYL sub-ledger was exactly R0.00 at `DEBENQ_CURRENT.TXT`'s own opening B/F (26 Feb 2025) — a full 2016–2025 CYL-only replay was not performed. The fact that both period endpoints land exactly on independently-confirmed exceptions (46445, 52422) is supporting evidence, not proof.
2. **Known classification miss:** doc 48785 (14/01/2026, ref `DN#21635MPTY-KONDENI`) is a genuine CYL deposit invoice, but its reference text is missing the leading "E" ("MPTY" not "EMPTY"), so the TXT-only regex classifies it as Part 1A instead of Part 1B. Its same-day-paired CN (doc 48785, next line) has the identical typo and lands in the same bucket, so the **net effect on both sub-ledgers' closing balances is R0.00** — but Part 1A's Jan-2026 turnover is overstated by R2,415.00 and Part 1B's is understated by the same amount. This is exactly the failure mode `SKILL_Debtor_Statement_v5_From_TXT.md` and the `lpg-recon-bug-fixer` skill's Pattern 2 lesson warn about — a DB-sourced `debt_group` column would classify this correctly where a text regex cannot. Not corrected here (would be hand-patching a generated view); flagged instead.
3. **Not a substitute for the real generator.** Re-run `node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor MD0003` in an environment with `DATABASE_URL` set and `pg` installed to get a genuine passing v5 statement (Part 2 populated, ingest gate evaluated, mixed-doc lines DB-split). This document should be superseded by that run, not treated as final.
