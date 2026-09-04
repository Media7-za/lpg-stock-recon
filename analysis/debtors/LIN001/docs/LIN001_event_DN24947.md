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

## Evidence

| Item | Status |
|---|---|
| ERP headers (payment, invoice, CN) | PROVEN — queried directly, all three docs ERP-posted |

---

*Internal workspace artifact — `analysis/debtors/LIN001/docs/LIN001_event_DN24947.md`*
