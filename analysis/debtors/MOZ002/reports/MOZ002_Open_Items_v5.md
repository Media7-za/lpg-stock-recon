# Open Items Statement: MOZAMBIK (MOZ002) — Internal
**Period:** from 15 Mar 2025 to 01 Oct 2026 &nbsp;|&nbsp; **Balance due:** R1,562.67
**Status:** PROPOSED — NOT RATIFIED (`PROPOSED_Projection_Matching_Locks.md`, build step 3) · generated 2026-10-09 by `render_open_items.mjs`
**Sources:** `analysis/debtors/MOZ002/data/v5_projection.json` (TXT sha256 `4a6e6bbcc724…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (102 confirmed / 5 probable ties)
**Locks:** no period closed yet

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R0.00

## Part 1A: LPG + OTHER open items

### October 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 01 Oct 2026 | Invoice | 53402 | DN-21393 | LPG | 5,702.67 | 5,702.67 |

**Cylinder deposit opening balance:** R0.00

## Part 1B: CYL open items

### June 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 26 Jun 2026 | Crd Note | 15128 | DN#22662=EMPTY | CYL | -4,140.00 | -4,140.00 |

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 0.00 | 0.00 | 0.00 |
| Open items listed above | 5,702.67 | -4,140.00 | 1,562.67 |
| Rounding on matched items (tie nets) | 0.00 | 0.00 | 0.00 |
| **Balance** | 5,702.67 | -4,140.00 | 1,562.67 |
| ERP `CURRENT BALANCE` (TXT header) | | | 1,562.67 |
| **Variance** | | | **0.00** |

---

## Appendix A: Probable ties (review required, not locked)

| Tie | Rule | Documents | Variance (R) | Note |
| :--- | :--- | :--- | ---: | :--- |
| T0003 | CN_DN_PAIR | Invoice 41522, Crd Note 12079 | — | CN 2 day(s) after invoice |
| T0028 | CN_DN_PAIR | Invoice 46826, Crd Note 13602 | — | CN 2 day(s) after invoice |
| T0051 | CN_AMOUNT_DATE | Invoice 49329, Crd Note 14458 | — | CN 0 day(s) after invoice |
| T0063 | EXACT_RUN | Payment 40729, Invoice 44949, Invoice 45199, Invoice 45303, Invoice 45488 | 0.00 |  |
| T0099 | BATCH_SUM | Payment 44227, Payment 45590, Invoice 50528, Invoice 50529, Payment 41529 | 0.00 |  |

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| CN_DN_PAIR | 48 |
| EXACT_SINGLE | 42 |
| EXACT_SUM | 2 |
| EXACT_RUN | 2 |
| CYL_EXCHANGE | 8 |

Full tie list: `data/projection_matches.json`.

