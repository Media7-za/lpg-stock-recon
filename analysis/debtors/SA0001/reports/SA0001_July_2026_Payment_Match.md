# SA0001 — July 2026 payment ↔ invoice matching

**Source:** `raw/SA0001.TXT` · **Scope:** calendar July 2026 only  
**Method:** LPG **gas invoice** lines (non-EMPTY `REFERENCE`) matched to **Payment** rows by **exact amount** (±R0.01), invoice date ≤ payment date, FIFO within eligible pool. EMPTY deposit legs cleared by same-month credit notes — not allocated to STAT transfers.

> **Advisory only** — ERP does not publish allocation detail on these STAT payments; matches are amount/date consistency for operator review, not PROVEN allocation edges.

---

## Summary

| Metric | Value |
| :--- | ---: |
| Payments in Jul 2026 | 5 |
| Total collected | R15 253,75 |
| Matched to gas invoice(s) | R15 253,75 (100%) |
| Cross-month gas in matches | 2 lines (Jun invoices on payments 44962, 45095) |
| Unpaid Jul gas (month-end) | R7 013,24 (DN#22846 + DN#23928) |

---

## Payment matching

| Pay doc | Date | Amount | STAT | Allocated gas invoice(s) | DN | Inv date |
| :--- | :--- | ---: | :--- | :--- | :--- | :--- |
| 44962 | 01/07/2026 | 312,73 | 127 | **51250** | DN#22906 | 17/06/2026 ⚠️ prior month |
| 45095 | 06/07/2026 | 6 985,69 | 128 | **51472** + **51594** | DN#22921 + DN#22545 | 29/06 + 03/07 ⚠️ mixed |
| 45194 | 13/07/2026 | 7 013,24 | 128 | **51723** + **51739** | DN#22683 + DN#22950 | 09/07 + 10/07 |
| 45329 | 21/07/2026 | 314,03 | 128 | **51866** | DN#22959 | 16/07/2026 |
| 45466 | 28/07/2026 | 628,06 | 128 | **52077** | DN#23910 | 25/07/2026 |

---

## July deliveries (gas + empty / CN)

| DN (gas) | Gas inv | Gas R | Empty inv | Empty CN | Gas paid by |
| :--- | :--- | ---: | :--- | :---: | :--- |
| DN#22545 | 51594 | 314,03 | 51595 | 15191 ✓ | 45095 |
| DN#22683 | 51723 | 314,03 | 51724 | 15228 ✓ | 45194 |
| DN#22950 | 51739 | 6 699,21 | 51740 | 15233 ✓ | 45194 |
| DN#22959 | 51866 | 314,03 | 51867 | 15270 ✓ | 45329 |
| DN#23910 | 52077 | 628,06 | — | — | 45466 |
| DN#22846 | 52100 | 6 699,21 | 52101 | 15347 ✓ | **Unpaid** |
| DN#23928 | 52193 | 314,03 | 52194 | 15362 ✓ | **Unpaid** |

---

## Month-end open (Jul gas only)

| Invoice | DN | Amount | Note |
| :--- | :--- | ---: | :--- |
| 52100 | DN#22846 | 6 699,21 | Issued 27/07; empty credited 28/07 |
| 52193 | DN#23928 | 314,03 | Issued 30/07; empty credited 31/07 |
| **Total** | | **7 013,24** | Aligns with two typical STAT 128 “gas + gas” payment size |

---

## Visual review

Open canvas: `sa0001-july-2026-payment-match.canvas.tsx` (Cursor Canvases panel).
