# LIN001 — Event Card: Proforma 2026-09-04

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Reference:** Proforma invoice, LIN001, dated 2026-09-04
**Status:** **Open — short-paid, no delivery note**

---

## Documents

| Part | Doc | Date | Amount |
|---|---|---|---:|
| Invoice | Proforma (no ERP doc_no) | 2026-09-04 | R16,291.80 |
| Credit note | N/A — pure LPG refill | — | R0.00 |
| Delivery note | **MISSING** | — | *(gap)* |
| Payment 1 | EXT-2949387151 | 2026-09-04 | R13,416.80 |
| Payment 2 | EXT-2950393933 | 2026-09-04 | R690.00 |

**Line detail:** 70 × 9kg LPG refill (no cylinder deposit line — refill on existing stock, consistent with a pure gas-only event).

---

## Why this event is open

1. **No delivery note.** Every other event in this register carries a DN# proof (in the ERP `description` field of the invoice/CN). This proforma has none — it has not been converted to an ERP invoice yet, so there is no `doc_no`, `ref_no`, or `description` to check against `transaction_headers`. Confirmed: no LIN001 invoice/CN posted on 2026-09-04 in ERP matching R16,291.80.
2. **Short-paid.** Two bank receipts total R14,106.80 against a R16,291.80 proforma.

```
R16,291.80  proforma (70×9kg LPG refill)
− R13,416.80  EXT-2949387151
− R690.00     EXT-2950393933
────────────
= R2,185.00  short-paid — event open
```

---

## Payment matching

Both payment references (`EXT-2949387151`, `EXT-2950393933`) were checked against `transaction_headers` for account_no LIN001 and are **not present** as ERP `Payment` entries — same as the other `EXT-` references in this register (they are bank-side receipts, not yet posted to ERP). This is expected: with no ERP invoice posted for the proforma either, there is nothing in ERP for a payment to post against yet.

---

## Outstanding items (operator action required)

| # | Item | Owner |
|---|---|---|
| 1 | Supply the delivery note number (DN#) for this delivery | Operator |
| 2 | Confirm whether the R2,185.00 shortfall will be paid, or whether the proforma amount itself needs correction | Operator |
| 3 | Confirm timing of ERP invoice posting (currently proforma-only) | Operator / ERP capture |

---

## Evidence

| Item | Status |
|---|---|
| Proforma invoice image | **GAP** — `LIN001_proforma_invoice_2026-09-04.jpg` referenced but not yet uploaded to this repo |
| Bank receipt images | **GAP** — `LIN001_payment_receipt_13416.80_2026-09-04.jpg`, `LIN001_payment_receipt_690_2026-09-04.jpg` referenced but not yet uploaded to this repo |
| ERP invoice/CN | **GAP** — no matching document found in `transaction_headers` |

---

*Internal workspace artifact — `analysis/debtors/LIN001/docs/LIN001_event_2026-09-04_proforma.md`*
