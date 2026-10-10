# JIM001 ruling pack for ADM-89 (2026-10-10)

Status: REVIEW ONLY. Nothing approved, locked or closed. Source: `config/payment_pattern_overrides.json` (36 legacy overrides, registry from June 2026), `data/projection_matches.json` and `data/v5_projection.json` (matcher v5, built from `raw/JIM001_2026-10-10.TXT`, connector-sourced db_replay).

## Question 1: do the 36 legacy overrides become approved locks?

**Finding (PROVEN, from the table below):** only 1 of the 36 overrides refers to a payment that exists in the current projection. The other 35 are payments dated 2022 to early 2025 that sit before the TXT window (they are inside the unitemised B/F of R60,183.98, TXT line 14) or have no payment at all (3 rows with `null`). A lock keyed on a row that is not in the projection would do nothing, so converting them would add records without changing any statement.

**Recommendation:** do not convert the 35. Keep them as history (they stay in the registry untouched, per the amendments-append rule). For the one live row, see question 3.

| # | Override payment | Date | Amount | Billing month | Type | In current projection? |
| -: | :-- | :-- | ---: | :-- | :-- | :-- |
| 1 | 13245 | 2022-03-17 | 14982.58 | 2022-01 | VERIFIED_MONTHLY_BATCH_MATCH | no |
| 2 | 13583 | 2022-04-12 | 13949 | 2022-02 | VERIFIED_MONTHLY_BATCH_MATCH | no |
| 3 | null | null | 0 | 2022-03 | VERIFIED_MISSING_PAYMENT | no |
| 4 | 14135 | 2022-06-01 | 18184.64 | 2022-04 | VERIFIED_MONTHLY_BATCH_MATCH | no |
| 5 | 15071 | 2022-07-26 | 17275.67 | 2022-05 | PATTERN_2_CANDIDATE_UNDERPAYMENT | no |
| 6 | 15473 | 2022-08-11 | 14488.95 | 2022-06 | PATTERN_2_CANDIDATE_UNDERPAYMENT | no |
| 7 | 15987 | 2022-09-10 | 17169.29 | 2022-07 | VERIFIED_MONTHLY_BATCH_MATCH | no |
| 8 | 16648 | 2022-10-20 | 15885.27 | 2022-08 | RULE_13_SURPLUS | no |
| 9 | 17073 | 2022-11-24 | 13838.4 | 2022-09 | PATTERN_3_MIRROR_CARRY | no |
| 10 | 17578 | 2022-12-19 | 17989.92 | 2022-10 | PATTERN_3_MIRROR_CARRY | no |
| 11 | 17777 | 2023-01-19 | 10825.92 | 2022-11 | PATTERN_3_MIRROR_CARRY | no |
| 12 | 18185 | 2023-02-13 | 25184.36 | 2022-12 | PATTERN_3_MIRROR_CARRY | no |
| 13 | 19176 | 2023-03-22 | 11335.68 | 2023-01 | VERIFIED_MONTHLY_BATCH_MATCH | no |
| 14 | 20357 | 2023-05-02 | 12343.07 | 2023-02 | VERIFIED_MONTHLY_BATCH_MATCH | no |
| 15 | 21193 | 2023-05-31 | 15409.46 | 2023-03 | VERIFIED_UNDERPAYMENT | no |
| 16 | 22711 | 2023-07-21 | 15140.69 | 2023-04 | VERIFIED_MONTHLY_BATCH_MATCH | no |
| 17 | 23280 | 2023-08-11 | 13806.77 | 2023-05 | VERIFIED_MONTHLY_BATCH_MATCH | no |
| 18 | 23977 | 2023-09-05 | 16964.84 | 2023-06 | VERIFIED_MONTHLY_BATCH_MATCH | no |
| 19 | 25394 | 2023-10-24 | 13911.54 | 2023-07 | VERIFIED_MONTHLY_BATCH_MATCH | no |
| 20 | 26601 | 2023-11-29 | 12520.81 | 2023-08 | VERIFIED_UNDERPAYMENT | no |
| 21 | 27468 | 2023-12-29 | 24801.28 | 2023-09 | PATTERN_3_MIRROR_CARRY | no |
| 22 | 30269 | 2024-04-24 | 16151.04 | 2023-10 | RULE_13_SURPLUS | no |
| 23 | 28893 | 2024-02-20 | 14208.48 | 2023-11 | RULE_13_SURPLUS | no |
| 24 | 35270 | 2024-12-04 | 18441.12 | 2023-12 | VERIFIED_UNDERPAYMENT | no |
| 25 | 30891 | 2024-05-27 | 11105.31 | 2024-01 | VERIFIED_MONTHLY_BATCH_MATCH | no |
| 26 | 31179 | 2024-06-10 | 13862.03 | 2024-02 | BEST_FIT_AMOUNT_MATCH | no |
| 27 | 31792 | 2024-07-09 | 15395.18 | 2024-03 | VERIFIED_MONTHLY_BATCH_MATCH | no |
| 28 | 32896 | 2024-08-23 | 17634.86 | 2024-04 | DOCUMENTED_SETTLEMENT_WINDOW | no |
| 29 | 33810 | 2024-09-30 | 20232.18 | 2024-05 | DOCUMENTED_SETTLEMENT_WINDOW | no |
| 30 | 34425 | 2024-10-28 | 20443 | 2024-06 | DOCUMENTED_SETTLEMENT_WINDOW | no |
| 31 | 35270 | 2024-12-04 | 18441.12 | 2024-07 | DOCUMENTED_SETTLEMENT_WINDOW | no |
| 32 | 36139 | 2025-01-17 | 22336.89 | 2024-08 | DOCUMENTED_SETTLEMENT_WINDOW | no |
| 33 | 36988 | 2025-02-21 | 19550.42 | 2024-09 | DOCUMENTED_SETTLEMENT_WINDOW | no |
| 34 | null | null | 0 | 2024-10 | DOCUMENTED_SETTLEMENT_WINDOW | no |
| 35 | null | null | 0 | 2024-11 | DOCUMENTED_SETTLEMENT_WINDOW | no |
| 36 | 38481 | 2025-05-05 | 15816.63 | 2024-12 | BOUNDARY_PAYMENT | yes |

## Question 2: should monthly-total matches count as probable?

Seven EXACT_MONTH_SUM ties are CONFIRMED today. Each is one payment equal to the sum of one calendar month's invoices (variance within R0.01). No remittance advice exists to confirm them.

| Tie | Payment | Date | Amount | Invoices | Invoice dates | Variance |
| :-- | :-- | :-- | ---: | -: | :-- | ---: |
| T0045 | 40063 | 2025-07-14 | 11795.24 | 4 | 2025-03-05..2025-03-28 | 0 |
| T0046 | 40746 | 2025-08-22 | 14579.44 | 5 | 2025-07-04..2025-07-26 | 0 |
| T0047 | 41664 | 2025-10-14 | 16601.81 | 5 | 2025-08-01..2025-08-29 | -0.01 |
| T0048 | 42134 | 2025-11-06 | 13327.87 | 4 | 2025-09-04..2025-09-26 | 0 |
| T0049 | 42788 | 2025-12-29 | 13161.86 | 4 | 2025-10-03..2025-10-24 | 0 |
| T0050 | 43199 | 2026-02-05 | 15578.23 | 5 | 2025-11-01..2025-11-28 | 0 |
| T0051 | 44555 | 2026-06-05 | 11666.12 | 4 | 2025-12-04..2025-12-24 | 0.01 |

**What changes if you rule "probable":** the 31 invoices in these seven ties return to the open list until the ties are approved, so the open-row count rises from 56 to about 87 until then. They are approved with one group command (`approve_tie.mjs --ties ...`), as was done for the other probable ties on 2026-10-10, which records your approval and a tripwire.

**Recommendation (ASSERTED):** rule "probable, then approve as one group". Exact month sums to within a cent on seven of seven months are strong evidence, and a batch payer without remittances is exactly where a recorded operator approval is worth having.

## Question 3: a pattern worth ruling on (ASSUMED, not tested as a lock)

The matcher leaves four payments unallocated: 44686 (R14,941.48, 16 May 2022), 38481 (R15,816.63, 5 May 2025), 38846 (R7,337.97) and 39812 (R20,557.69), netting R58,653.77. Their dates and the override for 38481 (type BOUNDARY_PAYMENT, billing month 2024-12) say they pay invoices that are inside the B/F. The B/F is R60,183.98, so applying them to the B/F would leave R1,530.21 of B/F open. This is the same treatment used for TWK002 L0001 (`applied_to_bf`). It needs your ruling and a proof run before any lock is recorded.
