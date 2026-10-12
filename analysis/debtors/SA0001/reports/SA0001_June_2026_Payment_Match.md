# SA0001 — June 2026 payment ↔ invoice matching

**Source:** `raw/SA0001.TXT` · **Scope:** calendar June 2026  
**Method:** LPG **gas invoice** lines (non-EMPTY `REFERENCE`) matched to **Payment** rows by **exact amount** (±R0.01), invoice date ≤ payment date, FIFO within eligible pool. EMPTY deposit legs cleared by same-month credit notes — not allocated to STAT transfers.

> **Advisory only** — ERP does not publish allocation detail on STAT payments; matches are amount/date consistency for operator review.

---

## Summary

| Metric | Value |
| :--- | ---: |
| Payments in Jun 2026 | 3 |
| Total collected | R8 573,68 |
| Matched to gas invoice(s) | R8 573,68 (100%) |
| Cross-month gas in matches | 1 line (May **50843** on payment **44551**) |
| Unpaid Jun gas (month-end) | R6 984,39 (DN#22661 + DN#22921) |

---

## Payment matching

| Pay doc | Date | Amount | STAT | Allocated gas invoice(s) | DN | Inv date |
| :--- | :--- | ---: | :--- | :--- | :--- | :--- |
| 44551 | 02/06/2026 | 649,75 | 127 | **50843** | DN#22752 | 25/05/2026 ⚠️ prior month |
| 44654 | 09/06/2026 | 314,08 | 127 | **50981** | DN#22613 | 01/06/2026 |
| 44877 | 24/06/2026 | 7 609,85 | 127 | **51137** + **51250** + **51314** | DN#22792 + DN#22906 + DN#22516 | 10/06 + 17/06 + 20/06 |

**Note on 44877:** Credit note **15043** (−R5 347,50, ref DN#22792) pairs with the **empty** leg of that delivery; gas invoice **51137** (R6 984,39) remains in the payment decomposition. Do not treat 15043 as zeroing the gas line for STAT matching.

---

## June deliveries (gas + empty / CN)

| DN (gas) | Gas inv | Gas R | Empty inv | Empty CN | Gas paid by |
| :--- | :--- | ---: | :--- | :---: | :--- |
| DN#22613 | 50981 | 314,08 | 50982 | 15015 ✓ | 44654 |
| DN#22792 | 51137 | 6 984,39 | 51138 | — (CN 15043 on gas ref)* | 44877 |
| DN#22906 | 51250 | 312,73 | 51251 | 15076 ✓ | 44877 |
| DN#22516 | 51314 | 312,73 | 51315 | 15094 ✓ | 44877 |
| DN#22661 | 51428 | 312,73 | 51429 | 15129 ✓ | **Unpaid** (Jul **44962**) |
| DN#22921 | 51472 | 6 671,66 | 51473 | 15146 ✓ | **Unpaid** (Jul **45095**) |

\*CN 15043 clears deposit timing on DN#22792 batch; gas amount still allocated to payment 44877.

---

## Month-end open (Jun gas only)

| Invoice | DN | Amount | Paid in |
| :--- | :--- | ---: | :--- |
| 51428 | DN#22661 | 312,73 | Jul 2026 payment 44962 |
| 51472 | DN#22921 | 6 671,66 | Jul 2026 payment 45095 |
| **Total** | | **6 984,39** | |

---

## Visual review

Open canvas: `sa0001-june-2026-payment-match.canvas.tsx` (Cursor Canvases panel).
