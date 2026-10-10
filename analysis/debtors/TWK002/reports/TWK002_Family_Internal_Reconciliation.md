# Family reconciliation: TWK AGRI PTY LTD (TWK002 + TWK003 + TWK004), internal
**INTERNAL, not for the customer.** Consolidated statement as at 2026-10-10 · generated 2026-10-10 · parent TWK002 · **DRAFT: not releasable** · family amount due R114,836.19 vs sum of ERP headers R114,836.19 (variance R0.00).

**Why this is a draft:**
- TWK002 is review-only: ingestCoverage partial
- TWK004 is review-only: ingestCoverage partial

## Reconciliation to each ERP balance

| Account | Role | ERP header (R) | Open items (R) | Named / other lines (R) | Statement balance (R) | Variance (R) | Matcher | Review only |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | :--- | :--- |
| TWK002 | parent | 54,136.19 | 46,051.52 | 8,084.67 | 54,136.19 | 0.00 | 17 confirmed / 0 probable | YES |
| TWK003 | child | -300.00 | -300.00 | 0.00 | -300.00 | 0.00 | 0 confirmed / 1 probable | no |
| TWK004 | child | 61,000.00 | 61,000.00 | 0.00 | 61,000.00 | 0.00 | 2 confirmed / 1 probable | YES |
| **Family** | | **114,836.19** | **106,751.52** | **8,084.67** | **114,836.19** | **0.00** | | |

Sources (TXT fingerprint = projection fingerprint is a gate):

| Account | TXT | sha256 | Projection sha256 | Match |
| :--- | :--- | :--- | :--- | :--- |
| TWK002 | `analysis/debtors/TWK002/raw/TWK002_2026-10-08.TXT` | `e657e03f68cd…` | `e657e03f68cd…` | yes |
| TWK003 | `analysis/debtors/TWK002/raw/TWK003_2026-10-10.TXT` | `9b68fd84a163…` | `9b68fd84a163…` | yes |
| TWK004 | `analysis/debtors/TWK002/raw/TWK004_2026-10-10.TXT` | `e3e46aca4947…` | `e3e46aca4947…` | yes |

---

## TWK002: parent, ERP R54,136.19

Open rows after confirmed **and probable** ties are removed (internal view), 10 row(s):

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
| 08 Oct 2026 | Crd Note | 15775 | DN#23843 | LPG | -7,935.00 |
| 08 Oct 2026 | Invoice | 53507 | DN#23843 | LPG | 14,375.86 |

- **Crd Note 15775 (operator note):** Operator ruling 2026-10-09 (ADM-94 Q5): CN 15775 (-R7,935.00, DN#23843, 2026-10-08) is a CYLINDER credit and belongs in the CYL lane. Shown in the gas (LPG) lane here only because its lines are not yet in the DB (split_basis HEADER_FALLBACK; ADM-93). Amounts are unchanged. The reconcile has no lane override, so the lane moves when the ADM-93 sync brings the DB lines; if any part then lands in the LPG lane, reopen this ruling. Check the DB lines (SKUs, quantities) against the R7,590 of cylinder deposits paid in cash on STAT 123 for a double credit (unverified).
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

**REVIEW ONLY:** ingestCoverage partial

---

## TWK003: child, ERP R-300.00

Open rows after confirmed **and probable** ties are removed (internal view), 7 row(s):

| Date | Type | Doc # | Reference | Lane | Amount (R) |
| :--- | :--- | :--- | :--- | :--- | ---: |
| 03 Oct 2025 | Invoice | 46857 | DN#20290- 391175708 | OTHER | 11,000.44 |
| 10 Oct 2025 | Invoice | 47076 | DN #20297 | OTHER | 11,000.44 |
| 04 Nov 2025 | Invoice | 47523 | DN #20774 | OTHER | 11,000.44 |
| 21 Nov 2025 | Invoice | 47866 | DN # 21166 | OTHER | 2,000.00 |
| 24 Nov 2025 | Crd Note | 13933 | DN # 21166 | OTHER | -2,300.00 |
| 28 Nov 2025 | Invoice | 47991 | 391176350-001 /21166 | OTHER | 5,499.99 |
| 25 Feb 2026 | Payment | 43500 | TRANSF \| STAT 123 | LPG | -38,501.31 |

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
| T0001 | CN_DN_PAIR | Invoice 47880, Crd Note 13966 | — |

---

## TWK004: child, ERP R61,000.00

Open rows after confirmed **and probable** ties are removed (internal view), 3 row(s):

| Date | Type | Doc # | Reference | Lane | Amount (R) |
| :--- | :--- | :--- | :--- | :--- | ---: |
| 04 Sept 2026 | Invoice | 52948 | DN#24817 | OTHER | 9,000.00 |
| 10 Sept 2026 | Invoice | 53113 | DN#24985 | OTHER | 22,000.00 |
| 09 Oct 2026 | Invoice | 53536 | DN#24718 | LPG | 30,000.00 |

Reconciliation:

| Component | Amount (R) |
| :--- | ---: |
| Opening B/F | 0.00 |
| Open rows listed above | 61,000.00 |
| **Rebuilt balance** | **61,000.00** |
| ERP header | 61,000.00 |
| **Variance** | **0.00** |

Probable ties (proposals; not approved, not locked):

| Tie | Rule | Documents | Variance (R) |
| :--- | :--- | :--- | ---: |
| T0002 | CN_DN_PAIR | Invoice 53535, Crd Note 15781 | — |

**REVIEW ONLY:** ingestCoverage partial

---

Derived from `data/v5_projection.json` and `data/projection_matches.json` of each account. Tags and decisions: see the dated preview note for this family.

