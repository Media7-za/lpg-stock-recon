# Open Items Statement: SHORTEN INTERNATIONAL 66 ON MONZALI (MON001) — Internal
**Period:** from 11 Jul 2024 to 02 Oct 2026 &nbsp;|&nbsp; **Balance due:** R2,417.24
**Status:** PROPOSED — NOT RATIFIED (`PROPOSED_Projection_Matching_Locks.md`, build step 3) · generated 2026-10-08 by `render_open_items.mjs`
**Sources:** `analysis/debtors/MON001/data/v5_projection.json` (TXT sha256 `3b289b8d9d76…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (26 confirmed / 3 probable ties) · **REVIEW ONLY:** ingestCoverage partial
**Locks:** no period closed yet

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R162.86

## Part 1A: LPG + OTHER open items

### July 2024

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 11 Jul 2024 | Payment | 45158 | TRANSF \| STAT 104 | LPG | -2,628.79 | -2,465.93 |

### March 2025

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 06 Mar 2025 | Payment | 37379 | TRANSF \| STAT 112 | LPG | -2,816.83 | -5,282.76 |

### October 2025

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 09 Oct 2025 | Invoice | 46978 | DN#20703 | LPG | 2,500.38 | -2,782.38 |

### January 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 27 Jan 2026 | Invoice | 52130 | — | OTHER | 960.00 | -1,822.38 |

### April 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 02 Apr 2026 | Invoice | 50097 | DN#21861- EXTRA SV | LPG | 1,407.60 | -414.78 |
| 16 Apr 2026 | Crd Note | 14792 | FAULTY RETURN | LPG | -498.53 | -913.31 |
| 24 Apr 2026 | Invoice | 50363 | DN-22341 | LPG | 2,815.20 | 1,901.89 |

### July 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 15 Jul 2026 | Payment | 45216 | TRANSF \| STAT 128 | LPG | -5,430.30 | -3,528.41 |
| 20 Jul 2026 | Invoice | 51952 | DN#22696 | LPG | 3,123.10 | -405.31 |

### October 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 02 Oct 2026 | Invoice | 53432 | DN#23829 | LPG | 2,822.45 | 2,417.14 |

**Cylinder deposit opening balance:** R0.00

## Part 1B: CYL open items

### April 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 02 Apr 2026 | Invoice | 50097 | DN#21861- EXTRA SV | CYL | 1,207.50 | 1,207.50 |
| 16 Apr 2026 | Crd Note | 14792 | FAULTY RETURN | CYL | -1,207.50 | 0.00 |

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 162.86 | 0.00 | 162.86 |
| Open items listed above | 2,254.28 | 0.00 | 2,254.28 |
| Rounding on matched items (tie nets) | 0.10 | 0.00 | 0.10 |
| **Balance** | 2,417.24 | 0.00 | 2,417.24 |
| ERP `CURRENT BALANCE` (TXT header) | | | 2,417.24 |
| **Variance** | | | **0.00** |

---

## Appendix A: Probable ties (review required, not locked)

| Tie | Rule | Documents | Variance (R) | Note |
| :--- | :--- | :--- | ---: | :--- |
| T0010 | CN_DN_PAIR | Invoice 49461, Crd Note 14512 | — | CN 2 day(s) after invoice |
| T0015 | CN_DN_PAIR | Invoice 51953, Crd Note 15303 | — | CN 2 day(s) after invoice |
| T0029 | PROXIMITY | Payment 45589, Invoice 51846 | -0.10 | within ±R5.00 |

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| CN_DN_PAIR | 15 |
| EXACT_SINGLE | 10 |
| EXACT_MONTH_SUM | 1 |

Full tie list: `data/projection_matches.json`.

