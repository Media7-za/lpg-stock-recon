# Open Items Statement: SAKI - VICTORIA RD (SA0001) — Internal
**Period:** from 07 Feb 2023 to 02 Oct 2026 &nbsp;|&nbsp; **Balance due:** R16,002.86
**Status:** PROPOSED — NOT RATIFIED (`PROPOSED_Projection_Matching_Locks.md`, build step 3) · generated 2026-10-09 by `render_open_items.mjs`
**Sources:** `analysis/debtors/SA0001/data/v5_projection.json` (TXT sha256 `837cff982c0c…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (146 confirmed / 16 probable ties)
**Locks:** closed through 2026-09-30, 144 locks applied

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R4,945.93

## Part 1A: LPG + OTHER open items

### October 2025

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 20 Oct 2025 | Invoice | 47182 | DN#21113 | LPG | 255.65 | 5,201.58 |

### August 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 12 Aug 2026 | Invoice | 52814 | DN#24904 | LPG | 5,981.61 | 11,183.19 |

### September 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 25 Sept 2026 | Invoice | 53293 | DN#21379 | LPG | 258.75 | 11,441.94 |
| 29 Sept 2026 | Invoice | 53355 | DN#23818 | LPG | 258.75 | 11,700.69 |

### October 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 02 Oct 2026 | Invoice | 53436 | DN-21397 | LPG | 5,520.00 | 17,220.69 |
| 02 Oct 2026 | Invoice | 53446 | DN-23836 | LPG | 258.75 | 17,479.44 |

**Cylinder deposit opening balance:** R0.00

## Part 1B: CYL open items

_No open items._

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 4,945.93 | 0.00 | 4,945.93 |
| Open items listed above | 12,533.51 | 0.00 | 12,533.51 |
| Rounding on matched items (tie nets) | -0.08 | 0.00 | -0.08 |
| Payments applied to opening B/F (operator rulings) | -1,409.77 | 0.00 | -1,409.77 |
| Overpayments held as customer credit (operator rulings) | -66.73 | 0.00 | -66.73 |
| **Balance** | 16,002.86 | 0.00 | 16,002.86 |
| ERP `CURRENT BALANCE` (TXT header) | | | 16,002.86 |
| **Variance** | | | **0.00** |

---

## Appendix A: Probable ties (review required, not locked)

| Tie | Rule | Documents | Variance (R) | Note |
| :--- | :--- | :--- | ---: | :--- |
| T0145 | CN_DN_PAIR | Invoice 42584, Crd Note 12361 | — | CN 3 day(s) after invoice (closed period: not locked) |
| T0146 | CN_DN_PAIR | Invoice 46653, Crd Note 13559 | — | CN 4 day(s) after invoice (closed period: not locked) |
| T0147 | CN_DN_PAIR | Invoice 47451, Crd Note 13805 | — | CN 2 day(s) after invoice (closed period: not locked) |
| T0148 | CN_DN_PAIR | Invoice 48825, Crd Note 14311 | — | CN 5 day(s) after invoice (closed period: not locked) |
| T0149 | CN_DN_PAIR | Invoice 49456, Crd Note 14516 | — | CN 4 day(s) after invoice (closed period: not locked) |
| T0150 | CN_DN_PAIR | Invoice 49457, Crd Note 14517 | — | CN 4 day(s) after invoice (closed period: not locked) |
| T0151 | CN_DN_PAIR | Invoice 50289, Crd Note 14780 | — | CN 2 day(s) after invoice (closed period: not locked) |
| T0152 | CN_DN_PAIR | Invoice 50982, Crd Note 15015 | — | CN 2 day(s) after invoice (closed period: not locked) |
| T0153 | CN_DN_PAIR | Invoice 52739, Crd Note 15536 | — | CN 2 day(s) after invoice (closed period: not locked) |
| T0155 | CN_AMOUNT_DATE | Invoice 44988, Crd Note 13028 | — | CN 0 day(s) after invoice (closed period: not locked) |
| T0156 | CN_AMOUNT_DATE | Invoice 45002, Crd Note 13264 | — | CN 0 day(s) after invoice (closed period: not locked) |
| T0157 | CN_AMOUNT_DATE | Invoice 49904, Crd Note 14651 | — | CN 0 day(s) after invoice (closed period: not locked) |
| T0158 | CN_AMOUNT_DATE | Invoice 53174, Crd Note 15661 | — | CN 0 day(s) after invoice (closed period: not locked) |
| T0159 | CN_AMOUNT_DATE | Invoice 53437, Crd Note 15747 | — | CN 0 day(s) after invoice |
| T0160 | NEAR_SUM | Payment 38531, Invoice 42816, Invoice 42583 | -0.06 | within R1.00 truncation (closed period: not locked) |
| T0161 | PROXIMITY | Payment 38878, Invoice 43375 | 0.20 | within ±R5.00 (closed period: not locked) |

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| LOCKED | 144 |
| CN_DN_PAIR | 1 |
| CYL_EXCHANGE | 1 |

Full tie list: `data/projection_matches.json`.

## Appendix D: Operator rulings applied (approved locks)

| Lock | Treatment | Documents | Net (R) | Ruling |
| :--- | :--- | :--- | ---: | :--- |
| L0113 | customer_credit | Payment 45782, Invoice 52813, Invoice 52547 | -33.64 | Operator accepted 2026-10-08 (SA0001 group 2, re-pricing): paid 594.42 = original DN#24252 R314.03 + 52547 R280.39; DN#24252 later credited (15556) and re-issued as 52813 at R280.39; R33.64 overpaid |
| L0114 | customer_credit | Payment 46237, Invoice 53214, Invoice 53215 | -27.09 | Operator accepted 2026-10-08 (SA0001 group 2, re-pricing): paid 5,805.84 = 53214 R5,520.00 + original DN-25000 R285.84; DN-25000 credited (15680) and re-issued as 53215 at R258.75; R27.09 overpaid |
| L0115 | customer_credit | Payment 46092, Invoice 52893 | -6.00 | Operator accepted 2026-10-08 (SA0001 group 2, re-pricing): DN#24805 delivered 01 Sep, paid 08 Sep; R6.00 over, unexplained; moderate confidence (alternative 52814+53011 rejected because 46160 pays 53011 exactly); leaves 52814 (DN#24904) open |
| L0116 | applied_to_bf | Payment 38837, Invoice 42123, Invoice 43083 | -136.62 | Operator accepted 2026-10-08 (SA0001 group 3, old balance): paid R6,303.68 per delivery vs R6,235.37 invoiced; R136.62 excess reduced the customer's standing opening balance |
| L0117 | applied_to_bf | Payment 41012, Invoice 45829, Invoice 45990 | -251.47 | Operator accepted 2026-10-08 (SA0001 group 3, old balance): paid 45829 + deposit line 45991 R517.50 (credited by 13334) instead of 45990; R251.47 excess reduced the opening balance |
| L0118 | applied_to_bf | Payment 42986, Invoice 48695 | -400.00 | Operator accepted 2026-10-08 (SA0001 group 3, old balance): R400.00 over 48695 (round extra payment or keying of 252.29); excess reduced the opening balance |
| L0119 | applied_to_bf | Payment 44740 | -621.68 | Operator accepted 2026-10-08 (SA0001 group 3, old balance): dated 07/02/2023, before every invoice in the TXT window (doc number fits a 2026 sequence, year likely mis-keyed); applied to the opening B/F |

