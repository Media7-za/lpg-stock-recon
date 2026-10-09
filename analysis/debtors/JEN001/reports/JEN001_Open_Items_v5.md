# Open Items Statement: Spoon Eatery (JEN001) — Internal
**Period:** from 03 Mar 2025 to 06 Oct 2026 &nbsp;|&nbsp; **Balance due:** R25,332.00
**Status:** PROPOSED — NOT RATIFIED (`PROPOSED_Projection_Matching_Locks.md`, build step 3) · generated 2026-10-09 by `render_open_items.mjs`
**Sources:** `analysis/debtors/JEN001/data/v5_projection.json` (TXT sha256 `5f6c5151b1a6…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (41 confirmed / 3 probable ties)
**Locks:** no period closed yet

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R9,978.51

## Part 1A: LPG + OTHER open items

### March 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 06 Mar 2026 | Invoice | 49609 | DN#22114 | LPG | 2,589.05 | 12,567.56 |
| 16 Mar 2026 | Invoice | 49752 | DN#22130 | LPG | 3,597.41 | 16,164.97 |

### April 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 02 Apr 2026 | Invoice | 50051 | DN-22040 | LPG | 4,578.50 | 20,743.47 |
| 08 Apr 2026 | Payment | 43927 | TRANSF \| STAT 125 | LPG | -6,703.96 | 14,039.51 |
| 09 Apr 2026 | Invoice | 50146 | DN-22304 | LPG | 3,448.83 | 17,488.34 |
| 20 Apr 2026 | Invoice | 50318 | DN-22337 | LPG | 3,448.83 | 20,937.17 |

### May 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 05 May 2026 | Invoice | 50536 | DN#22364 | LPG | 5,082.47 | 26,019.64 |
| 18 May 2026 | Invoice | 50753 | DN#22734 | LPG | 3,951.91 | 29,971.55 |

### June 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 01 Jun 2026 | Invoice | 50970 | DN#22452 | LPG | 3,293.25 | 33,264.80 |
| 11 Jun 2026 | Invoice | 51154 | DN#22474 | LPG | 4,866.88 | 38,131.68 |
| 23 Jun 2026 | Invoice | 51387 | DN#22914 | LPG | 3,934.93 | 42,066.61 |
| 25 Jun 2026 | Payment | 44878 | TRANSF \| STAT 127 | LPG | -10,000.00 | 32,066.61 |

### August 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 04 Aug 2026 | Invoice | 52305 | DN#23940 | LPG | 5,199.03 | 37,265.64 |
| 19 Aug 2026 | Invoice | 52648 | DN#24281 | LPG | 4,360.11 | 41,625.75 |

### September 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 07 Sept 2026 | Invoice | 53029 | DN#24977 | LPG | 4,445.57 | 46,071.32 |
| 11 Sept 2026 | Payment | 46098 | TRANSF \| STAT 130 | LPG | -15,000.00 | 31,071.32 |
| 21 Sept 2026 | Invoice | 53224 | DN#23802 | LPG | 3,594.28 | 34,665.60 |

### October 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 05 Oct 2026 | Invoice | 53468 | DN#24702 | LPG | 4,729.33 | 39,394.93 |

**Cylinder deposit opening balance:** R-517.50

## Part 1B: CYL open items

### September 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 21 Sept 2026 | Crd Note | 15682 | DN#23802-EMPTY | CYL | -4,657.50 | -5,175.00 |
| 21 Sept 2026 | Invoice | 53225 | DN#23802-EMPTY | CYL | 4,140.00 | -1,035.00 |

### October 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 05 Oct 2026 | Invoice | 53469 | DN#24702-EMPTY | CYL | 6,210.00 | 5,175.00 |
| 06 Oct 2026 | Crd Note | 15766 | DN#24702-EMPTY | CYL | -5,175.00 | 0.00 |

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 9,978.51 | -517.50 | 9,461.01 |
| Open items listed above | 29,416.42 | 517.50 | 29,933.92 |
| Opening B/F settled (ERP balance returned to zero) | -9,978.51 | 517.50 | -9,461.01 |
| Rounding on matched items (tie nets) | 0.00 | 0.00 | 0.00 |
| Part-payments on open invoices (operator rulings) | -4,601.92 | 0.00 | -4,601.92 |
| **Balance** | 24,814.50 | 517.50 | 25,332.00 |
| ERP `CURRENT BALANCE` (TXT header) | | | 25,332.00 |
| **Variance** | | | **0.00** |

- Invoice 52305 R5,199.03 less part-payment R4,601.92 (payment 45717) = R597.11 outstanding.

---

## Appendix A: Probable ties (review required, not locked)

| Tie | Rule | Documents | Variance (R) | Note |
| :--- | :--- | :--- | ---: | :--- |
| T0021 | CN_DN_PAIR | Invoice 49288, Crd Note 14445 | — | CN 2 day(s) after invoice |
| T0023 | CN_DN_PAIR | Invoice 49610, Crd Note 14556 | — | CN 3 day(s) after invoice |
| T0027 | CN_DN_PAIR | Invoice 51155, Crd Note 15066 | — | CN 4 day(s) after invoice |

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| LOCKED | 1 |
| CN_DN_PAIR | 29 |
| EXACT_MONTH_SUM | 5 |
| EXACT_SINGLE | 1 |
| CYL_EXCHANGE | 4 |
| BALANCE_ZERO | 1 |

Full tie list: `data/projection_matches.json`.

## Appendix D: Operator rulings applied (approved locks)

| Lock | Treatment | Documents | Net (R) | Ruling |
| :--- | :--- | :--- | ---: | :--- |
| L0001 | part_payment → 52305 | Payment 45717, Invoice 51564, Invoice 51691, Invoice 51823, Invoice 52044 | -4,601.92 | Operator delegated (ADM-83, 2026-10-08: "You decide. ... she is paying round amounts not what is owed to specific invoices or batches"). Round-amount payment on account settles oldest invoices first (FIFO, consistent with the ADM-86 tie-break ruling): 51564, 51691, 51823, 52044 in full; R4,601.92 part-payment on 52305, leaving R597.11 open on 52305. Supersedes the LIFO pilot allocation (2026-08-25 / PDP-33 2026-09-12) for the v5 statement. |

