# Open Items Statement: Spoon Eatery (JEN001) — Internal
**Period:** from 01 Jul 2026 to 14 Aug 2026 &nbsp;|&nbsp; **Balance due:** R22,685.21
**Status:** PROPOSED — NOT RATIFIED (`PROPOSED_Projection_Matching_Locks.md`, build step 3) · generated 2026-10-08 by `render_open_items.mjs`
**Sources:** `analysis/debtors/JEN001/data/v5_projection.json` (TXT sha256 `7743da65f77e…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (9 confirmed / 0 probable ties)
**Locks:** no period closed yet

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R22,605.60

## Part 1A: LPG + OTHER open items

### August 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 04 Aug 2026 | Invoice | 52305 | DN#23940 | LPG | 5,199.03 | 27,804.63 |

**Cylinder deposit opening balance:** R-517.50

## Part 1B: CYL open items

_No open items._

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 22,605.60 | -517.50 | 22,088.10 |
| Open items listed above | 5,199.03 | 0.00 | 5,199.03 |
| Rounding on matched items (tie nets) | 0.00 | 0.00 | 0.00 |
| Part-payments on open invoices (operator rulings) | -4,601.92 | 0.00 | -4,601.92 |
| **Balance** | 23,202.71 | -517.50 | 22,685.21 |
| ERP `CURRENT BALANCE` (TXT header) | | | 22,685.21 |
| **Variance** | | | **0.00** |

- Invoice 52305 R5,199.03 less part-payment R4,601.92 (payment 45717) = R597.11 outstanding.

---

## Appendix A: Probable ties (review required, not locked)

_None._

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| LOCKED | 1 |
| CN_DN_PAIR | 8 |

Full tie list: `data/projection_matches.json`.

## Appendix D: Operator rulings applied (approved locks)

| Lock | Treatment | Documents | Net (R) | Ruling |
| :--- | :--- | :--- | ---: | :--- |
| L0001 | part_payment → 52305 | Payment 45717, Invoice 51564, Invoice 51691, Invoice 51823, Invoice 52044 | -4,601.92 | Operator delegated (ADM-83, 2026-10-08: "You decide. ... she is paying round amounts not what is owed to specific invoices or batches"). Round-amount payment on account settles oldest invoices first (FIFO, consistent with the ADM-86 tie-break ruling): 51564, 51691, 51823, 52044 in full; R4,601.92 part-payment on 52305, leaving R597.11 open on 52305. Supersedes the LIFO pilot allocation (2026-08-25 / PDP-33 2026-09-12) for the v5 statement. |

