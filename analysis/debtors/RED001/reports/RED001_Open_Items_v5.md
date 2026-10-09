# Open Items Statement: REDLANDS HOTEL (RED001) — Internal
**Period:** from 08 May 2025 to 02 Oct 2026 &nbsp;|&nbsp; **Balance due:** R10,183.43
**Status:** PROPOSED — NOT RATIFIED (`PROPOSED_Projection_Matching_Locks.md`, build step 3) · generated 2026-10-09 by `render_open_items.mjs`
**Sources:** `analysis/debtors/RED001/data/v5_projection.json` (TXT sha256 `57faaf07f287…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (61 confirmed / 0 probable ties) · **REVIEW ONLY:** ingestCoverage partial
**Locks:** no period closed yet

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R0.00

## Part 1A: LPG + OTHER open items

### May 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 08 May 2026 | Crd Note | 14885 | CYL RETURN WITH LPG | LPG | -1,289.66 | -1,289.66 |

### August 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 18 Aug 2026 | Invoice | 52635 | DN#24276 | LPG | 5,194.96 | 3,905.30 |

### September 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 25 Sept 2026 | Invoice | 53283 | DN#21374 | LPG | 3,983.44 | 7,888.74 |
| 29 Sept 2026 | Payment | 46332 | TRANSF \| STAT 130 | LPG | -5,311.25 | 2,577.49 |

### October 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 01 Oct 2026 | Invoice | 53422 | DN#23832 | LPG | 3,983.44 | 6,560.93 |

**Cylinder deposit opening balance:** R0.00

## Part 1B: CYL open items

### June 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 26 Jun 2026 | Crd Note | 15125 | DN#22917_EMPTY | CYL | -3,622.50 | -3,622.50 |

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 0.00 | 0.00 | 0.00 |
| Open items listed above | 6,560.93 | -3,622.50 | 2,938.43 |
| Rounding on matched items (tie nets) | 7,245.00 | 0.00 | 7,245.00 |
| **Balance** | 13,805.93 | -3,622.50 | 10,183.43 |
| ERP `CURRENT BALANCE` (TXT header) | | | 10,183.43 |
| **Variance** | | | **0.00** |

---

## Appendix A: Probable ties (review required, not locked)

_None._

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| LOCKED | 4 |
| CN_DN_PAIR | 27 |
| EXACT_SINGLE | 25 |
| EXACT_MONTH_SUM | 1 |
| CYL_EXCHANGE | 3 |
| BALANCE_ZERO | 1 |

Full tie list: `data/projection_matches.json`.

## Appendix D: Operator rulings applied (approved locks)

| Lock | Treatment | Documents | Net (R) | Ruling |
| :--- | :--- | :--- | ---: | :--- |
| L0001 | exact | Payment 38566, Invoice 42948 | 0.00 | Operator ruling (Linear ADM-84, 2026-10-08): prepayment - "this customer terms were payment before delivery, then it changed to payment after delivery"; payment 38566 settles invoice 42948 delivered after it |
| L0002 | exact | Payment 39087, Invoice 43614 | 0.00 | Operator ruling (Linear ADM-84, 2026-10-08): prepayment - "this customer terms were payment before delivery, then it changed to payment after delivery"; payment 39087 settles invoice 43614 delivered after it |
| L0003 | exact | Payment 42420, Invoice 48022 | 0.00 | Operator ruling (Linear ADM-84, 2026-10-08): prepayment - "this customer terms were payment before delivery, then it changed to payment after delivery"; payment 42420 settles invoice 48022 delivered after it |
| L0004 | exact | Payment 42984, Invoice 48747 | 0.00 | Operator ruling (Linear ADM-84, 2026-10-08): prepayment - "this customer terms were payment before delivery, then it changed to payment after delivery"; payment 42984 settles invoice 48747 delivered after it |

