# JIM001 ruling pack for ADM-89 (2026-10-10)

Status: **Q1 and Q2 recorded** (operator leanings in session "Jim001 ruling pack decisions", 2026-10-10). **Q3 proof dry-run only — not locked.** Source: `config/payment_pattern_overrides.json` (36 legacy overrides untouched; 7 new `projectionLocks` L0001–L0007), `data/projection_matches.json` and `data/v5_projection.json` (matcher v5, `raw/JIM001_2026-10-10.TXT`, connector-sourced db_replay).

## Question 1: do the 36 legacy overrides become approved locks?

**Decision (operator, 2026-10-10): NO.** Keep them as history. The registry `overrides[]` array is untouched (still 36 rows). No lock was keyed on a legacy payment doc.

**Finding (PROVEN, from the table below):** only 1 of the 36 overrides refers to a payment that exists in the current projection. The other 35 are payments dated 2022 to early 2025 that sit before the TXT window (they are inside the unitemised B/F of R60,183.98, TXT line 14) or have no payment at all (3 rows with `null`). A lock keyed on a row that is not in the projection would do nothing, so converting them would add records without changing any statement.

For the one live row (38481), see question 3.

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

**Decision (operator, 2026-10-10): YES — probable, then approve as one group.**

**Recorded:**

1. `config/statement_v5.json` → `payerCadence: "monthly_batch"`.
2. Matcher P-c: `EXACT_MONTH_SUM` is PROBABLE when that flag is set (default accounts unchanged). Amendment in `PROPOSED_Projection_Matching_Locks.md` (PROPOSED — NOT RATIFIED portfolio-wide).
3. Group approval → locks **L0001–L0007** (`approve_tie.mjs --ties T0045…T0051`), treatment `exact`. Tripwire on each lock reason.
4. After approval: internal open rows **56**, customer preview **68**, proof HOLDS at ERP R122,884.84, 0 lock conflicts. PROVEN (`data/projection_matches.json`).

| Tie (pre-approve) | Lock | Payment | Date | Amount | Invoices | Variance | Net |
| :-- | :-- | :-- | :-- | ---: | -: | ---: | ---: |
| T0045 | L0001 | 40063 | 2025-07-14 | 11795.24 | 4 | 0 | 0 |
| T0046 | L0002 | 40746 | 2025-08-22 | 14579.44 | 5 | 0 | 0 |
| T0047 | L0003 | 41664 | 2025-10-14 | 16601.81 | 5 | -0.01 | 0.01 |
| T0048 | L0004 | 42134 | 2025-11-06 | 13327.87 | 4 | 0 | 0 |
| T0049 | L0005 | 42788 | 2025-12-29 | 13161.86 | 4 | 0 | 0 |
| T0050 | L0006 | 43199 | 2026-02-05 | 15578.23 | 5 | 0 | 0 |
| T0051 | L0007 | 44555 | 2026-06-05 | 11666.12 | 4 | 0.01 | -0.01 |

**Display note (PROVEN):** while the seven ties were PROBABLE (before approval), internal open rows stayed **56** (probable ties omit from the main internal view; Appendix A). Customer preview rose **68 → 106**, then returned to **68** after L0001–L0007. The pack's earlier "56 → ~87" figure counted probable invoice members as if they were open residual rows; the renderer does not do that on the internal copy.

## Question 3: unallocated payments vs B/F (`applied_to_bf`) — ASSUMED, not locked

**Status: proof dry-run only. Awaiting operator yes/no before any lock.**

The matcher leaves four payments unallocated: 44686 (R14,941.48, 16 May 2022), 38481 (R15,816.63, 5 May 2025), 38846 (R7,337.97) and 39812 (R20,557.69), netting **R58,653.77** (PROVEN, `data/projection_matches.json` residual). B/F is **R60,183.98**. Applying them to the B/F would leave **R1,530.21** of B/F open.

| Check | Result | Tag |
| :--- | :--- | :--- |
| Dry-run `approve_tie --payment 44686,38481,38846,39812 --treatment applied_to_bf` | Would record L0008, net R-58,653.77 | PROVEN (tool accepted) |
| Arithmetic B/F − payments | 60,183.98 − 58,653.77 = **1,530.21** | PROVEN |
| Counterfactual proof identity | remain B/F + open LPG/OTHER + CYL + unmatched CN = **R122,884.84** = ERP | PROVEN (arithmetic on residual) |
| Jan/Feb 2025 invoices in current projection | **0** (consistent with those months sitting inside unitemised B/F) | PROVEN |
| Override 38481 | type BOUNDARY_PAYMENT, billing month 2024-12 | ASSERTED (registry history) |
| Same treatment as TWK002 L0001 | pattern match only | ASSUMED |

**Tension (do not resolve without a ruling):** `project.json` history 2026-09-13 assigned 38846/39812 to specific Jan/Feb 2025 invoice runs in the CSV era. Those invoices are absent from today's open TXT, so `applied_to_bf` is compatible with that story at the B/F layer — but it is still an assumption, not a remittance.

**Not recorded.** No L0008. No change to B/F display.

### Decision needed for Q3

Rule all four as one `applied_to_bf` lock (or split), or leave them unallocated until a remittance / pre-window TXT itemises the B/F?

```bash
# Only after an explicit yes:
node analysis/debtors/shared/scripts/approve_tie.mjs --debtor JIM001 \
  --payment 44686,38481,38846,39812 --treatment applied_to_bf \
  --reason "…" --by "Wall St"
node analysis/debtors/shared/scripts/match_projection.mjs --debtor JIM001
node analysis/debtors/shared/scripts/render_open_items.mjs --debtor JIM001
```
