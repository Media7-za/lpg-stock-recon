# Open Items Statement: Spoon Eatery (JEN001) — Internal
**Period:** from 03 Mar 2025 to 06 Oct 2026 &nbsp;|&nbsp; **Balance due:** R25,332.00
**Status:** PROPOSED — NOT RATIFIED (`PROPOSED_Projection_Matching_Locks.md`, build step 3) · generated 2026-10-09 by `render_open_items.mjs`
**Sources:** `analysis/debtors/JEN001/data/v5_projection.json` (TXT sha256 `5f6c5151b1a6…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (16 confirmed / 1 probable ties)
**Locks:** no period closed yet

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R9,978.51

## Part 1A: LPG + OTHER open items

### July 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 23 Jul 2026 | Invoice | 52044 | DN#22976 | LPG | 3,951.29 | 13,929.80 |

### August 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 04 Aug 2026 | Invoice | 52305 | DN#23940 | LPG | 5,199.03 | 19,128.83 |
| 19 Aug 2026 | Invoice | 52648 | DN#24281 | LPG | 4,360.11 | 23,488.94 |

### September 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 07 Sept 2026 | Invoice | 53029 | DN#24977 | LPG | 4,445.57 | 27,934.51 |
| 21 Sept 2026 | Invoice | 53224 | DN#23802 | LPG | 3,594.28 | 31,528.79 |

### October 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 05 Oct 2026 | Invoice | 53468 | DN#24702 | LPG | 4,729.33 | 36,258.12 |

**Cylinder deposit opening balance:** R-517.50

## Part 1B: CYL open items

_No open items._

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 9,978.51 | -517.50 | 9,461.01 |
| Open items listed above | 26,279.61 | 0.00 | 26,279.61 |
| Opening B/F settled (ERP balance returned to zero) | -9,978.51 | 517.50 | -9,461.01 |
| Rounding on matched items (tie nets) | 0.00 | 0.00 | 0.00 |
| Part-payments on open invoices (operator rulings) | -947.61 | 0.00 | -947.61 |
| **Balance** | 25,332.00 | 0.00 | 25,332.00 |
| ERP `CURRENT BALANCE` (TXT header) | | | 25,332.00 |
| **Variance** | | | **0.00** |

- Invoice 52044 R3,951.29 less part-payment R947.61 (payments 44878, 45717, 46098) = R3,003.68 outstanding.

---

## Appendix A: Probable ties (review required, not locked)

| Tie | Rule | Documents | Variance (R) | Note |
| :--- | :--- | :--- | ---: | :--- |
| T0006 | CN_DN_PAIR | Invoice 51155, Crd Note 15066 | — | CN 4 day(s) after invoice |

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| LOCKED | 1 |
| SETTLED_THROUGH | 1 |
| CN_DN_PAIR | 13 |
| CYL_EXCHANGE | 1 |

Full tie list: `data/projection_matches.json`.

## Appendix D: Operator rulings applied (approved locks)

| Lock | Treatment | Documents | Net (R) | Ruling |
| :--- | :--- | :--- | ---: | :--- |
| L0002 | part_payment → 52044 | Payment 44878, Payment 45717, Payment 46098, Invoice 50051, Invoice 50146, Invoice 50318, Invoice 50536, Invoice 50753, Invoice 50970, Invoice 51154, Invoice 51387, Invoice 51564, Invoice 51691, Invoice 51823 | -947.61 | Operator ruling ADM-92 items 3-4 (2026-10-09): ADM-83 round-amount payments settle oldest first, in payment-date order. Recorded as ONE lock because a part-payment chain across payments cannot be split into separate locks. Sequence: 44878 (R10,000.00) settles 50051 and 50146 in full and R1,972.67 of 50318. 45717 (R15,000.00) settles the rest of 50318 (R1,476.16), 50536, 50753 and 50970 in full, and R1,196.21 of 51154. 46098 (R15,000.00) settles the rest of 51154 (R3,670.67), 51387, 51564, 51691 and 51823 in full, and R947.61 of 52044. 52044 stays open for R3,003.68. Supersedes L0001 (voided) and the legacy LIFO overrides for 44878 and 45717. |
| S0001 | settled through 2026-03-31 | Invoice 41158, Invoice 41159, Crd Note 11995, Payment 37238, Invoice 41615, Invoice 41617, Crd Note 12102, Invoice 41880, Invoice 41881, Crd Note 12172, Invoice 41989, Invoice 41990, Crd Note 12197, Invoice 42165, Invoice 42166, Crd Note 12259, Invoice 42551, Invoice 42552, Invoice 42618, Crd Note 12366, Crd Note 12353, Invoice 42692, Invoice 42693, Crd Note 12405, Invoice 43026, Invoice 43027, Crd Note 12465, Payment 38808, Invoice 43311, Invoice 43312, Crd Note 12559, Payment 38928, Invoice 43488, Invoice 43489, Invoice 43579, Invoice 43580, Crd Note 12648, Invoice 44050, Invoice 44051, Crd Note 12770, Invoice 44182, Invoice 44183, Crd Note 12801, Payment 39619, Invoice 44422, Invoice 44423, Crd Note 12874, Invoice 44797, Invoice 44798, Crd Note 12976, Payment 40266, Invoice 45088, Invoice 45092, Crd Note 13044, Invoice 45372, Invoice 45373, Crd Note 13128, Invoice 45635, Invoice 45636, Crd Note 13226, Invoice 45758, Invoice 45759, Crd Note 13267, Payment 40745, Invoice 46057, Invoice 46058, Crd Note 13355, Crd Note 13432, Invoice 46459, Invoice 46460, Payment 41247, Crd Note 13498, Invoice 46626, Invoice 46627, Crd Note 13541, Invoice 46904, Invoice 46905, Crd Note 13625, Invoice 47082, Invoice 47083, Crd Note 13679, Payment 41812, Invoice 47273, Invoice 47274, Crd Note 13738, Invoice 47341, Invoice 47342, Crd Note 13756, Invoice 47591, Invoice 47592, Crd Note 13839, Payment 42224, Invoice 47808, Invoice 47809, Crd Note 13918, Invoice 48073, Invoice 48074, Crd Note 14000, Payment 42597, Invoice 48328, Invoice 48329, Crd Note 14101, Invoice 48471, Invoice 48473, Crd Note 14163, Payment 42917, Invoice 48675, Invoice 48676, Crd Note 14231, Invoice 49067, Invoice 49068, Crd Note 14374, Payment 43367, Invoice 49287, Invoice 49288, Crd Note 14445, Invoice 49379, Invoice 49380, Crd Note 14477, Invoice 49609, Invoice 49610, Crd Note 14556, Payment 43638, Invoice 49752, Invoice 49753, Crd Note 14601, Payment 43927 | -9,461.01 | Operator ruling ADM-92 (2026-10-09, confirmed in the main session): payments 37238, 38928, 41247, 41812, 42224, 42597 and 43927 each paid a statement (month-end closing balance; for 38928 that months LPG invoices) and settle every document on it, gas, cylinders and credit notes alike. Separate basis from ADM-83. B/F R9,461.01 + every row dated up to 2026-03-31 + payment 43927 (8 Apr 2026, paying the March statement) = R0.00, anchored on TXT line 131 of raw/JEN001_2026-10-08.TXT. Tripwires: a remittance naming invoices for any of these payments; a new TXT with a different B/F or window start; any document added, changed or back-dated to on or before 2026-03-31 (the record then becomes a lock CONFLICT); a statement or TXT explaining 37238s R1,552.50. |

