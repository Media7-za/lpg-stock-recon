# Open Items Statement: TWK AGRI (TWK003) — Internal
**Period:** from 01 Mar 2025 to 25 Feb 2026 &nbsp;|&nbsp; **Balance due:** R-300.00
**Status:** matcher v5 RATIFIED 2026-10-10 (`PROPOSED_Projection_Matching_Locks.md`); probable ties are proposals until approved · generated 2026-10-12 by `render_open_items.mjs`
**Sources:** `analysis/debtors/TWK003/data/v5_projection.json` (TXT sha256 `9b68fd84a163…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (1 confirmed / 1 probable ties)
**Locks:** no period closed yet

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R0.00

## Part 1A: LPG + OTHER open items

### November 2025

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 21 Nov 2025 | Invoice | 47866 | DN # 21166 | OTHER | 2,000.00 | 2,000.00 |
| 24 Nov 2025 | Crd Note | 13933 | DN # 21166 | OTHER | -2,300.00 | -300.00 |

**Cylinder deposit opening balance:** R0.00

## Part 1B: CYL open items

_No open items._

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 0.00 | 0.00 | 0.00 |
| Open items listed above | -300.00 | 0.00 | -300.00 |
| Rounding on matched items (tie nets) | 0.00 | 0.00 | 0.00 |
| **Balance** | -300.00 | 0.00 | -300.00 |
| ERP `CURRENT BALANCE` (TXT header) | | | -300.00 |
| **Variance** | | | **0.00** |

## Operator notes on open rows

- **Invoice 47866:** Operator ruling 2026-10-12 (main session): the R-300.00 on TWK003 is an ERP agent typo on the unit price of CN 13933 (20 units at R115.00 instead of the original R100.00 on invoice 47866). It will be reversed on the ERP: the ERP agent will invoice at the credit-note price (20 x R115.00 = R2,300.00, cancelling CN 13933) and credit at the original price (20 x R100.00 = R2,000.00, cancelling invoice 47866), taking TWK003 to R0.00. Not a customer credit and not a refund. Until those documents post, the ERP balance stays R-300.00 and the statement carries it as it is. Reading of the correction mechanics is the agent's, to be confirmed against the posted documents. Tripwires: the correcting invoice and credit note post (re-export the TXT and rebuild the TWK003 projection; family amount due then rises by R300.00); the posted amounts differ from R2,300.00 / R2,000.00; the correction is not made.
- **Crd Note 13933:** Operator ruling 2026-10-12 (main session): the R-300.00 on TWK003 is an ERP agent typo on the unit price of CN 13933 (20 units at R115.00 instead of the original R100.00 on invoice 47866). It will be reversed on the ERP: the ERP agent will invoice at the credit-note price (20 x R115.00 = R2,300.00, cancelling CN 13933) and credit at the original price (20 x R100.00 = R2,000.00, cancelling invoice 47866), taking TWK003 to R0.00. Not a customer credit and not a refund. Until those documents post, the ERP balance stays R-300.00 and the statement carries it as it is. Reading of the correction mechanics is the agent's, to be confirmed against the posted documents. Tripwires: the correcting invoice and credit note post (re-export the TXT and rebuild the TWK003 projection; family amount due then rises by R300.00); the posted amounts differ from R2,300.00 / R2,000.00; the correction is not made.

---

## Appendix A: Probable ties (review required, not locked)

| Tie | Rule | Documents | Variance (R) | Note |
| :--- | :--- | :--- | ---: | :--- |
| T0002 | CN_DN_PAIR | Invoice 47880, Crd Note 13966 | — | CN 6 day(s) after invoice |

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| LOCKED | 1 |

Full tie list: `data/projection_matches.json`.

## Appendix D: Operator rulings applied (approved locks)

| Lock | Treatment | Documents | Net (R) | Ruling |
| :--- | :--- | :--- | ---: | :--- |
| L0001 | exact | Payment 43500, Invoice 46857, Invoice 47076, Invoice 47523, Invoice 47991 | 0.00 | Operator approval 2026-10-12 (main session): STAT 123 payment 43500 TWK003 slice R-38,501.31 settles invoices 46857, 47076, 47523 (R11,000.44 each) and the R5,499.99 invoice. The advice names 47880 for the R5,499.99 but 47880 is reversed by CN 13966 (same DN#21166), so the cash is applied to 47991 (equal amount, only open one). Same cash either way. 47880/CN 13966 stays a separate probable tie, not approved. |

