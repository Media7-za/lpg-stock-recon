# LIN001 — Event Card: DN#24947

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Delivery note:** DN#24947
**Date:** 2026-09-02
**Status:** Closed

---

## Documents

| Part | Doc | Date | Amount |
|---|---|---|---:|
| Invoice | 52924 | 2026-09-02 | R74,433.70 |
| Credit note | 15592 (ref_no → 52924) | 2026-09-02 | R-69,000.00 |
| **Event net** | | | **R5,433.70** |
| Payment | 45961 | 2026-09-01 | R28,163.00 |

---

## Payment matching

Payment 45961 is an **ERP-posted** `Payment` entry — PROVEN directly, no bank-receipt inference required.

**ERP header check** (`transaction_headers`, Supabase project `lpg-stock-recon`, account_no LIN001):

| Doc | entry_type | tx_date | batch_ref | gross |
|---|---|---|---|---:|
| 00045961 | Payment | 2026-09-01 | PC-76-35 | R-28,163.00 |
| 00052924 | Invoice | 2026-09-02 | | R74,433.70 |
| 00015592 | Crd Note (ref_no 00052924) | 2026-09-02 | | R-69,000.00 |

Payment posted 2026-09-01, one day ahead of the invoice/CN pair on 2026-09-02.

---

## Reconciliation

```
R28,163.00  payment 45961 (2026-09-01, PC-76-35)
− R5,433.70  event net
───────────
= R22,729.30  surplus — payment 45961 alone funds this event in full
```

This is the largest single-event surplus in the register and is fully PROVEN from ERP-posted documents on both sides (payment, invoice, CN) — no bank receipt or operator assertion required.

---

## CN 15592 — full line detail (PROVEN, verified 2026-09-04)

Invoice 52924 mixes LPG gas-fill lines (D.4/S.4 48kg, 1401 14kg, 1901 19kg) with CYL deposit lines (S.1/D.1 48kg, 14.1, 19.1) on **one document** — this account's normal, established pattern (see `LIN001_event_2026-09-04_proforma.md` § "Customer-asserted cylinder credit" for why this matters). CN 15592 is a **five-SKU, deposit-only** reversal, confirmed by direct query (`vw_clean_transactions`, `SUM(line_total)` ties exactly to the CN header total, no residual):

| SKU | Description | Qty | Line total |
|---|---|---:|---:|
| 9.1 | 9kg deposit | -80 | -R41,400.00 |
| D.1 | 48kg DV deposit | -4 | -R4,830.00 |
| S.1 | 48kg SV deposit | -1 | -R1,207.50 |
| 14.1 | 14kg deposit | -21 | -R13,282.50 |
| 19.1 | 19kg deposit | -12 | -R8,280.00 |
| **Sum** | | | **-R69,000.00** |

Note: invoice 52924 itself carries no 9kg lines — the 80×9.1 credit is a larger, separately-sourced batch of 9kg deposit returns posted against 52924 by document reference, not a same-invoice reversal. This CN is fully spent into this event's closed R5,433.70 net; nothing is left over from it to apply elsewhere (in particular, not to the 2026-09-04 proforma's cylinder-credit question).

---

## Evidence

| Item | Status |
|---|---|
| ERP headers (payment, invoice, CN) | PROVEN — queried directly, all three docs ERP-posted |

---

*Internal workspace artifact — `analysis/debtors/LIN001/docs/LIN001_event_DN24947.md`*
