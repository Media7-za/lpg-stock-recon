# LIN001 — Event Card: DN#23974

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Delivery note:** DN#23974
**Date:** 2026-08-24
**Status:** Closed

---

## Documents

| Part | Doc | Date | Amount |
|---|---|---|---:|
| Invoice | 52768 | 2026-08-24 | R69,652.80 |
| Credit note | 15543 (ref_no → 52768) | 2026-08-24 | R-39,445.00 |
| **Event net** | | | **R30,207.80** |
| Payment | EXT-2901239645 | 2026-08-22 | R34,721.00 |

---

## Payment matching

Bank receipt narration: **"HAPPY 8.22"** (22 August 2026).

**ERP header check** (PROVEN — `transaction_headers`, Supabase project `lpg-stock-recon`, account_no LIN001, doc_no 00052768):

| Field | ERP value |
|---|---|
| doc_no | 00052768 |
| entry_type | Invoice |
| tx_date | 2026-08-24 |
| ref_no | 00052768 |
| description | DN#23974 |

Payment received 2026-08-22, two days ahead of the invoice posting on 2026-08-24 — same pay-ahead-of-invoice pattern as DN#22936.

---

## Reconciliation

```
R34,721.00  payment EXT-2901239645
− R30,207.80  event net
────────────
= R4,513.20  surplus on this event alone
```

**Note on the R4,513.20 surplus:** taken in isolation, this event alone shows a R4,513.20 surplus. That figure is **not** the basis for the closed-book claim — the aggregate five-event tie-out (`../reports/LIN001_balance_bridge_2026-06_2026-09.md`) sums total event net against total payments directly across all five ERP deliveries (R154,493.88 vs R221,780.96 = R67,287.08 credit), which holds regardless of whether any individual surplus is read as funding a later event.

---

## Evidence

| Item | Status |
|---|---|
| ERP headers (invoice, CN) | PROVEN — queried directly |
| Bank receipt image | **GAP** — `LIN001_payment_receipt_34721_2026-08-22.jpg` referenced but not yet uploaded to this repo |

---

*Internal workspace artifact — `analysis/debtors/LIN001/docs/LIN001_event_DN23974.md`*
