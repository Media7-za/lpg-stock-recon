# LIN001 — Event Card: DN#22936

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Delivery note:** DN#22936
**Date:** 2026-07-08
**Status:** Closed

---

## Documents

| Part | Doc | Date | Amount |
|---|---|---|---:|
| Invoice | 51681 | 2026-07-08 | R134,049.19 |
| Credit note | 15215 (ref_no → 51681) | 2026-07-08 | R-80,097.50 |
| **Event net** | | | **R53,951.69** |
| Payment | EXT-2744666881 | 2026-07-03 | R54,981.36 |

---

## Payment matching

Bank receipt narration: **"Lin001 7.3 13991"** (3 July 2026).

Invoice 51681 carries ERP `order_no` = `00013991` — the trailing "13991" in the bank narration matches this order number exactly.

**Match: PROVEN** — confirmed against `transaction_headers` (Supabase project `lpg-stock-recon`, account_no LIN001, doc_no 00051681):

| Field | ERP value |
|---|---|
| doc_no | 00051681 |
| entry_type | Invoice |
| tx_date | 2026-07-08 |
| ref_no | 00051681 |
| order_no | 00013991 |
| description | DN#22936 |

The payment predates the invoice by 5 days — bank receipt dated 2026-07-03, invoice posted 2026-07-08. This is consistent with payment-on-order rather than payment-on-invoice (order 13991 preceded the DN# invoice posting).

---

## Reconciliation

```
R54,981.36  payment EXT-2744666881
− R53,951.69  event net
────────────
= R1,029.67  surplus
```

Surplus of R1,029.67 is carried into the aggregate credit position — see `../reports/LIN001_balance_bridge_2026-06_2026-09.md`. It is not separately assigned to a later event.

---

## Evidence

| Item | Status |
|---|---|
| ERP headers (invoice, CN) | PROVEN — queried directly |
| Bank receipt image | **GAP** — `LIN001_payment_receipt_DN22936_2026-07-03.jpg` referenced but not yet uploaded to this repo |

---

*Internal workspace artifact — `analysis/debtors/LIN001/docs/LIN001_event_DN22936.md`*
