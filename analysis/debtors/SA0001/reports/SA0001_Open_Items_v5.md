# Open Items Statement: SAKI - VICTORIA RD (SA0001) — Internal
**Period:** from 07 Feb 2023 to 31 Jul 2026 &nbsp;|&nbsp; **Balance due:** R10,804.97
**Status:** PROPOSED — NOT RATIFIED (`PROPOSED_Projection_Matching_Locks.md`, build step 3) · generated 2026-10-06 by `render_open_items.mjs`
**Sources:** `analysis/debtors/SA0001/data/v5_projection.json` (TXT sha256 `dab06b2f0efc…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (123 confirmed / 13 probable ties)

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R4,945.93

## Part 1A: LPG + OTHER open items

### February 2023

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 07 Feb 2023 | Payment | 44740 | TRANSF \| STAT208 | LPG | -621.68 | 4,324.25 |

### April 2025

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 08 Apr 2025 | Invoice | 42123 | DN#11748 | LPG | 6,235.37 | 10,559.62 |

### May 2025

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 15 May 2025 | Invoice | 43083 | DN#13226 | LPG | 6,235.37 | 16,794.99 |
| 21 May 2025 | Payment | 38837 | TRANSF \| STAT 114 | LPG | -12,607.36 | 4,187.63 |

### August 2025

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 22 Aug 2025 | Invoice | 45829 | DN#20535 | LPG | 5,675.16 | 9,862.79 |
| 29 Aug 2025 | Invoice | 45990 | D/N 20345 | LPG | 266.03 | 10,128.82 |

### September 2025

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 01 Sept 2025 | Payment | 41012 | TRANSF \| STAT 118 | LPG | -6,192.66 | 3,936.16 |

### October 2025

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 20 Oct 2025 | Invoice | 47182 | DN#21113 | LPG | 255.65 | 4,191.81 |

### January 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 09 Jan 2026 | Invoice | 48695 | DN-21461 PMB | LPG | 252.29 | 4,444.10 |
| 12 Jan 2026 | Payment | 42986 | TRANSF \| STAT 122 | LPG | -652.29 | 3,791.81 |

### July 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 27 Jul 2026 | Invoice | 52100 | DN#22846 | LPG | 6,699.21 | 10,491.02 |
| 30 Jul 2026 | Invoice | 52193 | DN#23928 | LPG | 314.03 | 10,805.05 |

**Cylinder deposit opening balance:** R0.00

## Part 1B: CYL open items

### October 2025

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 09 Oct 2025 | Crd Note | 13648 | DN#20609-EMPTY | CYL | -3,622.50 | -3,622.50 |
| 09 Oct 2025 | Invoice | 46993 | DN#20609-EMPTY | CYL | 4,830.00 | 1,207.50 |
| 30 Oct 2025 | Crd Note | 13778 | DN#21130-EMPTY | CYL | -4,830.00 | -3,622.50 |
| 30 Oct 2025 | Invoice | 47415 | DN#21130-EMPTY | CYL | 3,622.50 | 0.00 |

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 4,945.93 | 0.00 | 4,945.93 |
| Open items listed above | 5,859.12 | 0.00 | 5,859.12 |
| Rounding on matched items (tie nets) | -0.08 | 0.00 | -0.08 |
| **Balance** | 10,804.97 | 0.00 | 10,804.97 |
| ERP `CURRENT BALANCE` (TXT header) | | | 10,804.97 |
| **Variance** | | | **0.00** |

---

## Appendix A: Probable ties (review required, not locked)

| Tie | Rule | Documents | Variance (R) | Note |
| :--- | :--- | :--- | ---: | :--- |
| T0008 | CN_DN_PAIR | Invoice 42584, Crd Note 12361 | — | CN 3 day(s) after invoice |
| T0031 | CN_DN_PAIR | Invoice 46653, Crd Note 13559 | — | CN 4 day(s) after invoice |
| T0038 | CN_DN_PAIR | Invoice 47451, Crd Note 13805 | — | CN 2 day(s) after invoice |
| T0049 | CN_DN_PAIR | Invoice 48825, Crd Note 14311 | — | CN 5 day(s) after invoice |
| T0054 | CN_DN_PAIR | Invoice 49456, Crd Note 14516 | — | CN 4 day(s) after invoice |
| T0055 | CN_DN_PAIR | Invoice 49457, Crd Note 14517 | — | CN 4 day(s) after invoice |
| T0063 | CN_DN_PAIR | Invoice 50289, Crd Note 14780 | — | CN 2 day(s) after invoice |
| T0070 | CN_DN_PAIR | Invoice 50982, Crd Note 15015 | — | CN 2 day(s) after invoice |
| T0082 | CN_AMOUNT_DATE | Invoice 44988, Crd Note 13028 | — | CN 0 day(s) after invoice |
| T0083 | CN_AMOUNT_DATE | Invoice 45002, Crd Note 13264 | — | CN 0 day(s) after invoice |
| T0084 | CN_AMOUNT_DATE | Invoice 49904, Crd Note 14651 | — | CN 0 day(s) after invoice |
| T0087 | NEAR_SUM | Payment 38531, Invoice 42816, Invoice 42583 | -0.06 | within R1.00 truncation |
| T0089 | PROXIMITY | Payment 38878, Invoice 43375 | 0.20 | within ±R5.00 |

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| UD_CLEARING | 2 |
| CN_DN_PAIR | 71 |
| EXACT_MONTH_SUM | 11 |
| EXACT_SUM | 9 |
| EXACT_SINGLE | 30 |

Full tie list: `data/projection_matches.json`.

