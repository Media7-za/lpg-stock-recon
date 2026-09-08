# FIR001 — STAT payment FIFO (LPG open list)

**As-at:** 2026-09-05  
**Source:** `raw/FIR001CURRENT.TXT.TXT` (EXCLUDE ALLOCATION DETAIL)  
**Method:** `lpg_stripped` invoices, then FIFO apply `TRANSF | STAT 128/129` payments to oldest open LPG invoice  
**Status:** **PATTERN_ONLY** — not remittance-ratified (`allocationGate.status` is not `RATIFIED`)

---

## Result

| Component | Amount (R) | Tag |
| :--- | ---: | :--- |
| ERP `CURRENT BALANCE` | 8,721.02 | **PROVEN** — TXT header |
| Remaining open LPG invoice **52962** (05 Sep 2026, DN#24820) | 7,606.09 | **PROVEN** — FIFO remainder equals v5 Part 1A close minus B/F |
| BALANCE B/F | 597.43 | **PROVEN** — TXT line 14 |
| CYL residual (inv 52737 / CN 15535) | 517.50 | **PROVEN** — EMPTY pair net |
| **B/F + open LPG + CYL** | **8,721.02** | **PROVEN** — identity |

LIFO on the same payments would leave inv **51530** open at R7,606.09 and is **rejected** — it contradicts the v5 LPG running balance (returns to B/F after each STAT, newest invoice remains).

---

## Closed LPG invoices (FIFO)

Recorded as `closedInvoiceOverrides` in `config/statement_of_account.json`. Regenerating the customer statement reads those overrides — do not hand-edit the `.md`.

| Inv | DN | Amount | Closed by |
| :--- | :--- | ---: | :--- |
| 51530 | DN#22536 | 8,084.86 | STAT 128 / 45093 |
| 51628 | DN#22555 | 7,827.07 | STAT 128 / 45103 |
| 51791 | DN#22809 | 8,120.59 | STAT 128 / 45205 (pair) |
| 51877 | DN#22960 | 8,120.59 | STAT 128 / 45205 (pair) |
| 52036 | DN#23906 | 8,120.59 | STAT 128 / 45474 |
| 52195 | DN#23927 | 8,120.59 | STAT 129 / 45586+45591 |
| 52268 | DN#24234 | 7,827.07 | STAT 129 / 45586+45591 |
| 52463 | DN#24259 | 7,189.95 | STAT 129 / 45779 (pair) |
| 52578 | DN#24913 | 7,189.95 | STAT 129 / 45779 (pair) |
| 52736 | DN#24929 | 7,189.95 | STAT 129 / 45891 |
| 52844 | DN#23984 | 7,189.95 | STAT 129 / 45995 |

---

## Tripwires

| Ruling | Reopens if |
| :--- | :--- |
| Open inv 52962 R7,606.09 | Fresh TXT after 5 Sep 2026 posts a payment against it, or a remittance names it paid |
| FIFO not LIFO | Operator ratifies a different allocation method |
| PATTERN_ONLY gate | Remittance advice lands, or operator sets `allocationGate.status` to `RATIFIED` |
