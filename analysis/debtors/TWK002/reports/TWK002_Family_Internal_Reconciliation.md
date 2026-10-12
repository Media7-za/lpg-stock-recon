# Family reconciliation: TWK AGRI PTY LTD (TWK002 + TWK003 + TWK004), internal
**INTERNAL, not for the customer.** Consolidated statement as at 2026-10-10 · generated 2026-10-12 · parent TWK002 · no draft reasons · customer amount due R115,136.19 vs sum of ERP headers R114,836.19 excluding quarantined R-300.00 (not shown to the customer) (unexplained variance R0.00).

## Reconciliation to each ERP balance

| Account | Role | ERP header (R) | Open items (R) | Named / other lines (R) | Quarantined, not on customer copy (R) | Customer balance (R) | Variance (R) | Matcher | Review only |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- | :--- |
| TWK002 | parent | 54,136.19 | 46,051.52 | 8,084.67 | 0.00 | 54,136.19 | 0.00 | 17 confirmed / 0 probable | no |
| TWK003 | child | -300.00 | 0.00 | 0.00 | -300.00 | 0.00 | 0.00 | 1 confirmed / 1 probable | no |
| TWK004 | child | 61,000.00 | 61,000.00 | 0.00 | 0.00 | 61,000.00 | 0.00 | 3 confirmed / 0 probable | no |
| **Family** | | **114,836.19** | **107,051.52** | **8,084.67** | **-300.00** | **115,136.19** | **0.00** | | |

**Quarantined (operator ruling; real in the ERP, not shown on the customer copy):**

- **TWK003 Q1_PRICE_TYPO:** Invoice 47866 + Crd Note 13933 net R-300.00. Operator ruling 2026-10-12 (main session): the R-300.00 is an ERP agent price typo on CN 13933 (R115.00 instead of R100.00) and will be reversed on the ERP; release the consolidated statement with it quarantined and do not show it on the customer statement. Invoice 47866 (R2,000.00) and CN 13933 (R-2,300.00) are therefore left off the customer copy; the customer amount due is the sum of the ERP balances plus R300.00 and equals the figure expected once the ERP reversal posts. The generator aborts if these two rows ever stop netting to R-300.00 (e.g. after the correcting documents post), so the ruling is reviewed then. Tripwires: the correcting invoice and credit note post; the posted amounts differ from R2,300.00 / R2,000.00; the correction is not made.

Sources (TXT fingerprint = projection fingerprint is a gate):

| Account | TXT | sha256 | Projection sha256 | Match |
| :--- | :--- | :--- | :--- | :--- |
| TWK002 | `analysis/debtors/TWK002/raw/TWK002_2026-10-08.TXT` | `e657e03f68cd…` | `e657e03f68cd…` | yes |
| TWK003 | `analysis/debtors/TWK002/raw/TWK003_2026-10-10.TXT` | `9b68fd84a163…` | `9b68fd84a163…` | yes |
| TWK004 | `analysis/debtors/TWK002/raw/TWK004_2026-10-10.TXT` | `e3e46aca4947…` | `e3e46aca4947…` | yes |

---

## TWK002: parent, ERP R54,136.19

Open rows after confirmed **and probable** ties are removed (internal view), 11 row(s):

| Date | Type | Doc # | Reference | Lane | Amount (R) |
| :--- | :--- | :--- | :--- | :--- | ---: |
| 12 Aug 2026 | Crd Note | 15443 | DN#23954 | CYL | -11,040.00 |
| 12 Aug 2026 | Invoice | 52484 | DN#23954 | LPG | 6,926.34 |
| 12 Aug 2026 | Invoice | 52484 | DN#23954 | CYL | 11,212.50 |
| 26 Aug 2026 | Crd Note | 15553 | DN#24938 | CYL | -17,077.50 |
| 26 Aug 2026 | Invoice | 52803 | DN#24938 | LPG | 11,142.35 |
| 26 Aug 2026 | Invoice | 52803 | DN#24938 | CYL | 17,250.00 |
| 10 Sept 2026 | Invoice | 53077 | DN#24836 | LPG | 8,448.07 |
| 29 Sept 2026 | Invoice | 53350 | DN-21388 | LPG | 12,748.90 |
| 08 Oct 2026 | Crd Note | 15775 | DN#23843 | CYL | -7,935.00 |
| 08 Oct 2026 | Invoice | 53507 | DN#23843 | LPG | 5,750.86 |
| 08 Oct 2026 | Invoice | 53507 | DN#23843 | CYL | 8,625.00 |

- **Crd Note 15775 (operator note):** Operator ruling 2026-10-09 (ADM-94 Q5): CN 15775 (-R7,935.00, DN#23843, 2026-10-08) is a CYLINDER credit and belongs in the CYL lane. Shown in the gas (LPG) lane here only because its lines are not yet in the DB (split_basis HEADER_FALLBACK; ADM-93). Amounts are unchanged. The reconcile has no lane override, so the lane moves when the ADM-93 sync brings the DB lines; if any part then lands in the LPG lane, reopen this ruling. Check the DB lines (SKUs, quantities) against the R7,590 of cylinder deposits paid in cash on STAT 123 for a double credit (unverified). CONFIRMED 2026-10-12 (operator instruction "yes, record it", main session) against DB lines from connector replay 2026-10-11 (data/db_replay/2026-10-11): CN 15775 is entirely cylinder (19.1 x -4 = R-2,760.00 and 9.1 x -10 = R-5,175.00; no LPG line), the CYL lane is correct, the reopen condition did not fire. Double-credit check against the R7,590 STAT 123 deposits: no overlap indicated (docs/previews/2026-10-12_TWK002_CN15775_double_credit_check.md; ASSERTED, physical return unverified). Tripwires: a DB re-sync that changes the 15775 or 53507 SKU lines; a remittance or ERP correction naming 15775 or 53507; any LPG line on 15775.
- **Invoice 53507 (operator note):** Same delivery as CN 15775 (DN#23843), dated 2026-10-08, lines not yet in the DB (HEADER_FALLBACK; ADM-93). May pair with the CYL deposit lane once the lines arrive.

Reconciliation:

| Component | Amount (R) |
| :--- | ---: |
| Opening B/F | 38,791.27 |
| Open rows listed above | 46,051.52 |
| Ruling: applied_to_bf | -35,922.77 |
| Named: Path B phantom journal nets (ratified bridge line phantom_cn_nets) (13 journal rows) | 9,894.01 |
| Named: Path B discount journals, blank INVNO (ratified bridge line pathb_journals_untagged) (11 journal rows) | -4,677.84 |
| **Rebuilt balance** | **54,136.19** |
| ERP header | 54,136.19 |
| **Variance** | **0.00** |

---

## TWK003: child, ERP R-300.00

Open rows after confirmed **and probable** ties are removed (internal view), 2 row(s):

| Date | Type | Doc # | Reference | Lane | Amount (R) |
| :--- | :--- | :--- | :--- | :--- | ---: |
| 21 Nov 2025 | Invoice | 47866 | DN # 21166 | OTHER | 2,000.00 |
| 24 Nov 2025 | Crd Note | 13933 | DN # 21166 | OTHER | -2,300.00 |

- **Invoice 47866 (operator note):** Operator ruling 2026-10-12 (main session): the R-300.00 on TWK003 is an ERP agent typo on the unit price of CN 13933 (20 units at R115.00 instead of the original R100.00 on invoice 47866). It will be reversed on the ERP: the ERP agent will invoice at the credit-note price (20 x R115.00 = R2,300.00, cancelling CN 13933) and credit at the original price (20 x R100.00 = R2,000.00, cancelling invoice 47866), taking TWK003 to R0.00. Not a customer credit and not a refund. Until those documents post, the ERP balance stays R-300.00 and the statement carries it as it is. Reading of the correction mechanics is the agent's, to be confirmed against the posted documents. Tripwires: the correcting invoice and credit note post (re-export the TXT and rebuild the TWK003 projection; family amount due then rises by R300.00); the posted amounts differ from R2,300.00 / R2,000.00; the correction is not made.
- **Crd Note 13933 (operator note):** Operator ruling 2026-10-12 (main session): the R-300.00 on TWK003 is an ERP agent typo on the unit price of CN 13933 (20 units at R115.00 instead of the original R100.00 on invoice 47866). It will be reversed on the ERP: the ERP agent will invoice at the credit-note price (20 x R115.00 = R2,300.00, cancelling CN 13933) and credit at the original price (20 x R100.00 = R2,000.00, cancelling invoice 47866), taking TWK003 to R0.00. Not a customer credit and not a refund. Until those documents post, the ERP balance stays R-300.00 and the statement carries it as it is. Reading of the correction mechanics is the agent's, to be confirmed against the posted documents. Tripwires: the correcting invoice and credit note post (re-export the TXT and rebuild the TWK003 projection; family amount due then rises by R300.00); the posted amounts differ from R2,300.00 / R2,000.00; the correction is not made.

Reconciliation:

| Component | Amount (R) |
| :--- | ---: |
| Opening B/F | 0.00 |
| Open rows listed above | -300.00 |
| **Rebuilt balance** | **-300.00** |
| ERP header | -300.00 |
| **Variance** | **0.00** |

Probable ties (proposals; not approved, not locked):

| Tie | Rule | Documents | Variance (R) |
| :--- | :--- | :--- | ---: |
| T0002 | CN_DN_PAIR | Invoice 47880, Crd Note 13966 | — |

---

## TWK004: child, ERP R61,000.00

Open rows after confirmed **and probable** ties are removed (internal view), 3 row(s):

| Date | Type | Doc # | Reference | Lane | Amount (R) |
| :--- | :--- | :--- | :--- | :--- | ---: |
| 04 Sept 2026 | Invoice | 52948 | DN#24817 | OTHER | 9,000.00 |
| 10 Sept 2026 | Invoice | 53113 | DN#24985 | OTHER | 22,000.00 |
| 09 Oct 2026 | Invoice | 53536 | DN#24718 | OTHER | 30,000.00 |

- **Invoice 53536 (operator note):** Operator ruling 2026-10-12 (main session, answer "yes"): invoice 53536 (R30,000.00, DN#24718, 2026-10-09) REPLACES invoice 53535 (R32,500.00, same DN, same day), which CN 15781 (-R32,500.00, 2026-10-10) reverses in full. 53535 / CN 15781 is a settled pair (matcher CONFIRMED CN_DN_PAIR T0002, 2026-10-11 replay; no lock needed or possible) and 53536 is the open, correct invoice. Evidence: headers 53535/53536/15781 in DB (DTRX1010.TXT); lines show 53536 = 200 x stock 00000400 + 40 x 00000401 vs 53535 = 200 x 00000400 + 50 x 00000401. The R2,500.00 difference (10 x R250.00) is the correction; the reason for it is unverified. Tripwires: a delivery note or ERP statement that 53536 is NOT a replacement; any further credit or document on DN#24718; a DB re-sync that changes the 53535, 53536 or 15781 lines.

Reconciliation:

| Component | Amount (R) |
| :--- | ---: |
| Opening B/F | 0.00 |
| Open rows listed above | 61,000.00 |
| **Rebuilt balance** | **61,000.00** |
| ERP header | 61,000.00 |
| **Variance** | **0.00** |

---

Derived from `data/v5_projection.json` and `data/projection_matches.json` of each account. Tags and decisions: see the dated preview note for this family.

