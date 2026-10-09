# Open Items Statement: MOZAMBIK (MOZ002) — Internal
**Period:** from 15 Mar 2025 to 01 Oct 2026 &nbsp;|&nbsp; **Balance due:** R1,562.67
**Status:** PROPOSED — NOT RATIFIED (`PROPOSED_Projection_Matching_Locks.md`, build step 3) · generated 2026-10-09 by `render_open_items.mjs`
**Sources:** `analysis/debtors/MOZ002/data/v5_projection.json` (TXT sha256 `4a6e6bbcc724…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (105 confirmed / 0 probable ties)
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

_None._

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| LOCKED | 1 |
| CN_DN_PAIR | 49 |
| EXACT_SINGLE | 42 |
| EXACT_SUM | 2 |
| EXACT_RUN | 2 |
| CYL_EXCHANGE | 8 |
| BALANCE_ZERO | 1 |

Full tie list: `data/projection_matches.json`.

## Appendix D: Operator rulings applied (approved locks)

| Lock | Treatment | Documents | Net (R) | Ruling |
| :--- | :--- | :--- | ---: | :--- |
| L0001 | exact | Payment 44227, Payment 45590, Invoice 50529, Invoice 50528 | 0.01 | Operator 2026-10-09 ("Yes for now"; provisional pending the ERP answer on ADM-93): payments 44227 (R4,978.91) + 45590 (R3,490.37) settle MOZ002 delivery DN#22222: gas invoice 50528 (R4,329.29) + cylinder deposit invoice 50529 (R4,140.00), net R0.01 rounding. Deposit 50529 was also credited by returned empties (CN 14856), so the R4,140.00 stays open as a credit owed to the customer (empties credit note 15128 on the statement). Cylinder counts and credit notes checked: no missed deposit invoice, no duplicated credit note. Tripwire: ERP answer on ADM-93 that 44227/45590 belong wholly or partly to MOZ001 (void this lock and re-point the payment). |

