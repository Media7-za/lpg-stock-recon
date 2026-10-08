# Open Items Statement: FIRE AND VINE (FIR001) — Internal
**Period:** from 01 Jul 2026 to 05 Sept 2026 &nbsp;|&nbsp; **Balance due:** R8,721.02
**Status:** PROPOSED — NOT RATIFIED (`PROPOSED_Projection_Matching_Locks.md`, build step 3) · generated 2026-10-08 by `render_open_items.mjs`
**Sources:** `analysis/debtors/FIR001/data/v5_projection.json` (TXT sha256 `a6461eb6f27f…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (20 confirmed / 0 probable ties)
**Locks:** no period closed yet

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R597.43

## Part 1A: LPG + OTHER open items

### September 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 05 Sept 2026 | Invoice | 52962 | DN#24820 | LPG | 7,606.09 | 8,203.52 |

**Cylinder deposit opening balance:** R0.00

## Part 1B: CYL open items

### August 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 22 Aug 2026 | Invoice | 52737 | DN#24929-EMPTY | CYL | 6,555.00 | 6,555.00 |
| 24 Aug 2026 | Crd Note | 15535 | DN#24929-EMPTY | CYL | -6,037.50 | 517.50 |

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 597.43 | 0.00 | 597.43 |
| Open items listed above | 7,606.09 | 517.50 | 8,123.59 |
| Rounding on matched items (tie nets) | 0.00 | 0.00 | 0.00 |
| **Balance** | 8,203.52 | 517.50 | 8,721.02 |
| ERP `CURRENT BALANCE` (TXT header) | | | 8,721.02 |
| **Variance** | | | **0.00** |

---

## Appendix A: Probable ties (review required, not locked)

_None._

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| CN_DN_PAIR | 11 |
| EXACT_SINGLE | 7 |
| EXACT_MONTH_SUM | 2 |

Full tie list: `data/projection_matches.json`.

