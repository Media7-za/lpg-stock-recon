# Open Items Statement: Spoon Eatery (JEN001) — Internal
**Period:** from 01 Jul 2026 to 14 Aug 2026 &nbsp;|&nbsp; **Balance due:** R22,685.21
**Status:** PROPOSED — NOT RATIFIED (`PROPOSED_Projection_Matching_Locks.md`, build step 3) · generated 2026-10-07 by `render_open_items.mjs`
**Sources:** `analysis/debtors/JEN001/data/v5_projection.json` (TXT sha256 `7743da65f77e…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (8 confirmed / 0 probable ties)
**Locks:** no period closed yet

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R22,605.60

## Part 1A: LPG + OTHER open items

### July 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 03 Jul 2026 | Invoice | 51564 | DN#22673 | LPG | 623.88 | 23,229.48 |
| 08 Jul 2026 | Invoice | 51691 | DN#22679 | LPG | 4,887.10 | 28,116.58 |
| 14 Jul 2026 | Invoice | 51823 | DN#22816 | LPG | 935.81 | 29,052.39 |
| 23 Jul 2026 | Invoice | 52044 | DN#22976 | LPG | 3,951.29 | 33,003.68 |

### August 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 04 Aug 2026 | Invoice | 52305 | DN#23940 | LPG | 5,199.03 | 38,202.71 |
| 14 Aug 2026 | Payment | 45717 | TRANSF \| STAT 129 | LPG | -15,000.00 | 23,202.71 |

**Cylinder deposit opening balance:** R-517.50

## Part 1B: CYL open items

_No open items._

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 22,605.60 | -517.50 | 22,088.10 |
| Open items listed above | 597.11 | 0.00 | 597.11 |
| Rounding on matched items (tie nets) | 0.00 | 0.00 | 0.00 |
| **Balance** | 23,202.71 | -517.50 | 22,685.21 |
| ERP `CURRENT BALANCE` (TXT header) | | | 22,685.21 |
| **Variance** | | | **0.00** |

---

## Appendix A: Probable ties (review required, not locked)

_None._

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| CN_DN_PAIR | 8 |

Full tie list: `data/projection_matches.json`.

