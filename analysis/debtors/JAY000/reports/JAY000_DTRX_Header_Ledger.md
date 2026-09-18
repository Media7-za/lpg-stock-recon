# JAY000 — DTRX header ledger

**Account:** JAY000 · **Name:** JAYZ GRILL  
**As-at:** 2026-09-08  
**Source:** `transaction_headers` + `transaction_items` (DTRX ingest) — **ASSERTED**

## Running reconstruction

| Date | Type | Doc | INVNO tag | DN / ref | Amount (R) | Balance (R) | Source file |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Aug 2026 | Invoice | 52631 | — | DN#24274 | 6,930.07 | 6,930.07 | `DTRX1808.TXT` |
| 18 Aug 2026 | Invoice | 52632 | — | DN#24274-EMPTY | 6,037.50 | 12,967.57 | `DTRX1808.TXT` |
| 18 Aug 2026 | Invoice | 52688 | — | DN#24274 | 12,967.57 | 25,935.14 | `DTRX2008.TXT` |
| 18 Aug 2026 | Crd Note | 15509 | 52631 | DN#24274 | -6,930.07 | 19,005.07 | `DTRX2008.TXT` |
| 18 Aug 2026 | Crd Note | 15510 | 52632 | DN#24274-EMPTY | -6,037.50 | 12,967.57 | `DTRX2008.TXT` |
| 25 Aug 2026 | Invoice | 52793 | — | DN#23979 | 6,930.07 | 19,897.64 | `DETRANS.TXT` |
| 25 Aug 2026 | Invoice | 52794 | — | DN#23979-EMPTY | 6,037.50 | 25,935.14 | `DETRANS.TXT` |
| 26 Aug 2026 | Crd Note | 15552 | 52794 | DN#23979-EMPTY | -6,037.50 | 19,897.64 | `DTRX2608.TXT` |
| 03 Sept 2026 | Crd Note | 15594 | 52793 | DN#24950 EMPTIES | -6,037.50 | 13,860.14 | `DTRX0309.TXT` |

**Closing reconstructed total:** R13,860.14 **ASSERTED**

## Open invoices (header tagging)

| Inv | Date | DN | Due (R) | Item split |
| :--- | :--- | :--- | ---: | :--- |
| 52688 | 18 Aug 2026 | DN#24274 | 12,967.57 | LPG 6,930.07 · CYL 6,037.50 |
| 52793 | 25 Aug 2026 | DN#23979 | 892.57 | LPG 6,930.07 · CYL 0.00 |

## Tagging anomalies

- CN **15594** (CYL, R-6,037.50, `DN#24950 EMPTIES`) is tagged to invoice **52793** (LPG). DTRX items: CN 15594 is CYL but header ref_no tags LPG/CYL-mismatched invoice 52793 (LPG).

Financial total is unchanged if the CN is re-attributed; the open-invoice *split* changes. Do not ratify a re-tag without operator decision.

## Header inventory

| Count | 9 |
| First tx | 2026-08-18 |
| Last tx | 2026-09-03 |
| Payments | 0 |

*Not DEBENQ.* Cylinder custody qty in Part 2 is **not** signed off from this reconstruction (D19 ingest gate remains blocked until a statement TXT exists).

