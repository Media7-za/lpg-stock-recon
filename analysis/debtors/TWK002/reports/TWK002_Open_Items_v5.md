# Open Items Statement: TWK AGRI PTY LTD (TWK002) — Internal
**Period:** from 01 Mar 2025 to 08 Oct 2026 &nbsp;|&nbsp; **Balance due:** R54,136.19
**Status:** matcher v5 RATIFIED 2026-10-10 (`PROPOSED_Projection_Matching_Locks.md`); probable ties are proposals until approved · generated 2026-10-10 by `render_open_items.mjs`
**Sources:** `analysis/debtors/TWK002/data/v5_projection.json` (TXT sha256 `e657e03f68cd…`, DB channel `supabase-connector-replay`) · `data/projection_matches.json` (17 confirmed / 0 probable ties) · **REVIEW ONLY:** ingestCoverage partial
**Locks:** no period closed yet

---

*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*

**Gas (LPG) opening balance:** R38,791.27

## Part 1A: LPG + OTHER open items

### August 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 12 Aug 2026 | Invoice | 52484 | DN#23954 | LPG | 6,926.34 | 45,717.61 |
| 26 Aug 2026 | Invoice | 52803 | DN#24938 | LPG | 11,142.35 | 56,859.96 |

### September 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 10 Sept 2026 | Invoice | 53077 | DN#24836 | LPG | 8,448.07 | 65,308.03 |
| 29 Sept 2026 | Invoice | 53350 | DN-21388 | LPG | 12,748.90 | 78,056.93 |

### October 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 08 Oct 2026 | Crd Note | 15775 | DN#23843 | LPG | -7,935.00 | 70,121.93 |
| 08 Oct 2026 | Invoice | 53507 | DN#23843 | LPG | 14,375.86 | 84,497.79 |

**Cylinder deposit opening balance:** R0.00

## Part 1B: CYL open items

### August 2026

| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| 12 Aug 2026 | Crd Note | 15443 | DN#23954 | CYL | -11,040.00 | -11,040.00 |
| 12 Aug 2026 | Invoice | 52484 | DN#23954 | CYL | 11,212.50 | 172.50 |
| 26 Aug 2026 | Crd Note | 15553 | DN#24938 | CYL | -17,077.50 | -16,905.00 |
| 26 Aug 2026 | Invoice | 52803 | DN#24938 | CYL | 17,250.00 | 345.00 |

---

## Proof: open items reconcile to the ERP balance

| Component | Gas (R) | Cylinder deposit (R) | Total (R) |
| :--- | ---: | ---: | ---: |
| Opening B/F (unitemised) | 38,791.27 | 0.00 | 38,791.27 |
| Open items listed above | 45,706.52 | 345.00 | 46,051.52 |
| Rounding on matched items (tie nets) | 0.00 | 0.00 | 0.00 |
| Payments applied to opening B/F (operator rulings) | -35,922.77 | 0.00 | -35,922.77 |
| Path B phantom journal nets (ratified bridge line phantom_cn_nets) (13 journal rows) | 9,894.01 | 0.00 | 9,894.01 |
| Path B discount journals, blank INVNO (ratified bridge line pathb_journals_untagged) (11 journal rows) | -4,677.84 | 0.00 | -4,677.84 |
| **Balance** | 53,791.19 | 345.00 | 54,136.19 |
| ERP `CURRENT BALANCE` (TXT header) | | | 54,136.19 |
| **Variance** | | | **0.00** |

## Operator notes on open rows

- **Crd Note 15775:** Operator ruling 2026-10-09 (ADM-94 Q5): CN 15775 (-R7,935.00, DN#23843, 2026-10-08) is a CYLINDER credit and belongs in the CYL lane. Shown in the gas (LPG) lane here only because its lines are not yet in the DB (split_basis HEADER_FALLBACK; ADM-93). Amounts are unchanged. The reconcile has no lane override, so the lane moves when the ADM-93 sync brings the DB lines; if any part then lands in the LPG lane, reopen this ruling. Check the DB lines (SKUs, quantities) against the R7,590 of cylinder deposits paid in cash on STAT 123 for a double credit (unverified).
- **Invoice 53507:** Same delivery as CN 15775 (DN#23843), dated 2026-10-08, lines not yet in the DB (HEADER_FALLBACK; ADM-93). May pair with the CYL deposit lane once the lines arrive.

---

## Appendix A: Probable ties (review required, not locked)

_None._

## Appendix B: Confirmed ties by rule

| Rule | Ties |
| :--- | ---: |
| LOCKED | 5 |
| REMITTANCE | 3 |
| CN_DN_PAIR | 9 |

Full tie list: `data/projection_matches.json`.

## Appendix D: Operator rulings applied (approved locks)

| Lock | Treatment | Documents | Net (R) | Ruling |
| :--- | :--- | :--- | ---: | :--- |
| L0001 | applied_to_bf | Payment 37770, Journal 508 | -35,922.77 | Operator ruling ADM-94 Q7 (2026-10-09, confirmed in the main session): payment 37770 (STAT 112, R35,693.84) and its discount journal 508 (-R228.93) are applied against the opening B/F, settling the eight pre-window documents inside it: invoices 39683, 40081, 40459, 40950 and credit notes 11648, 11743, 11821, 11953 (R35,922.77). Evidence: the STAT 112 advice (BATCH-2025-03-31), data/allocation_edges.csv AL-0109..AL-0116, raw/TWK0022024.TXT lines 19-22 and 49-52, and ERP journal 511. This is the ratified bridge line stat112_untagged. The unitemised B/F falls from R38,791.27 to R2,868.50. Tripwire: a full-history export restating the B/F as named invoices with real INVNOs for these journals reopens the bridge. |
| L0002 | exact | Invoice 51180, Crd Note 15063 | 0.00 | Operator ruling ADM-94 Q6 (2026-10-09, "approve all four", confirmed in the main session): invoice 51180 + CN 15063 (both lanes, DN#22798; ERP Crd Note tag to 51180, same order 00013935, exact reversal), invoice 53078 + CN 15646 (DN#24985, 4 days apart) and invoice 53351 + CN 15714 (ref 21388, same day). For 53078/15646 and 53351/15714 the deciding evidence is operator judgement (business_rules section 15 rule 7), with same DN or reference and exact amount as supporting evidence. Tripwires: an allocation-detail export tagging CN 15646 or CN 15714 to a different invoice; a re-issue of 51180, 53078 or 53351. |
| L0003 | exact | Invoice 51180, Crd Note 15063 | 0.00 | Operator ruling ADM-94 Q6 (2026-10-09, "approve all four", confirmed in the main session): invoice 51180 + CN 15063 (both lanes, DN#22798; ERP Crd Note tag to 51180, same order 00013935, exact reversal), invoice 53078 + CN 15646 (DN#24985, 4 days apart) and invoice 53351 + CN 15714 (ref 21388, same day). For 53078/15646 and 53351/15714 the deciding evidence is operator judgement (business_rules section 15 rule 7), with same DN or reference and exact amount as supporting evidence. Tripwires: an allocation-detail export tagging CN 15646 or CN 15714 to a different invoice; a re-issue of 51180, 53078 or 53351. |
| L0004 | exact | Invoice 53078, Crd Note 15646 | 0.00 | Operator ruling ADM-94 Q6 (2026-10-09, "approve all four", confirmed in the main session): invoice 51180 + CN 15063 (both lanes, DN#22798; ERP Crd Note tag to 51180, same order 00013935, exact reversal), invoice 53078 + CN 15646 (DN#24985, 4 days apart) and invoice 53351 + CN 15714 (ref 21388, same day). For 53078/15646 and 53351/15714 the deciding evidence is operator judgement (business_rules section 15 rule 7), with same DN or reference and exact amount as supporting evidence. Tripwires: an allocation-detail export tagging CN 15646 or CN 15714 to a different invoice; a re-issue of 51180, 53078 or 53351. |
| L0005 | exact | Invoice 53351, Crd Note 15714 | 0.00 | Operator ruling ADM-94 Q6 (2026-10-09, "approve all four", confirmed in the main session): invoice 51180 + CN 15063 (both lanes, DN#22798; ERP Crd Note tag to 51180, same order 00013935, exact reversal), invoice 53078 + CN 15646 (DN#24985, 4 days apart) and invoice 53351 + CN 15714 (ref 21388, same day). For 53078/15646 and 53351/15714 the deciding evidence is operator judgement (business_rules section 15 rule 7), with same DN or reference and exact amount as supporting evidence. Tripwires: an allocation-detail export tagging CN 15646 or CN 15714 to a different invoice; a re-issue of 51180, 53078 or 53351. |

