# LIN001 — Event Card: DN#22630

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Delivery note:** DN#22630
**Date:** 2026-06-08
**Status:** **CLOSED** — payment fully honors the customer's quote; R1,575.69 gap is a quote-vs-invoice rate/structure mismatch, not a shortfall *(2026-09-06)*

---

## Documents

| Part | Doc | Date | Amount |
|---|---|---|---:|
| Invoice | 51132 | 2026-06-08 | R132,693.19 |
| Credit note | 15039 | 2026-06-08 | R-67,792.50 |
| **Event net (as posted)** | | | **R64,900.69** |
| Payment | 44975 | 2026-06-07 | R63,325.00 |

---

## Correction log

Payment 44975 was originally assumed to split with 44974 across this event (a R39,014.91 "surplus"). 44974 was reassigned to DN#21541 (confirmed via WhatsApp remittance, ref "21541" — see `LIN001_event_DN21541.md`), leaving 44975 alone against this event's R64,900.69 net — a R1,575.69 shortfall.

**Resolved 2026-09-06: the customer's own proforma quote for this delivery exactly reproduces the payment.**

---

## The proforma — exact match to the payment

Customer-forwarded proforma, reference "LPG + Empty DV", flat rate **R27.50/kg incl VAT**:

| Qty | Description | Unit (incl VAT) | Total |
|---:|---|---:|---:|
| 80 | 9kg LPG Refill | R247.50 | R19,800.00 |
| 20 | 14kg LPG Refill | R385.00 | R7,700.00 |
| 20 | 19kg LPG Refill | R522.50 | R10,450.00 |
| 10 | 48kg LPG Refill | R1,320.00 | R13,200.00 |
| 10 | Empty DV Cylinder | R1,217.50 | R12,175.00 |
| **Total payable (VAT incl.)** | | | **R63,325.00** |

**This is exactly payment 44975.** The refill quantities (80×9kg, 20×14kg, 20×19kg, 10×48kg) also exactly match invoice 51132's actual gas lines (30×9kg ORYX + 50×9kg packed = 80; 20×14kg; 20×19kg; 10×48kg DV) — this proforma is unambiguously the quote for this specific delivery.

---

## Why ERP's invoice nets to R1,575.69 more

Invoice 51132 was posted at the account's standard header gas rate — **R24.6696/kg ex-VAT (R28.37/kg incl VAT)** — not the R27.50/kg quoted in the proforma. ERP also charges/nets cylinder deposits (dispatch vs. return) rather than the proforma's flat "refill + one-off Empty DV Cylinder charge" model.

```
ERP gas total (posted rate, all 5 gas lines)         R52,768.19
ERP deposit net kept (dispatched − actually returned) R12,132.50
                                                       ──────────
ERP event net                                         R64,900.69

Proforma gas total (4 refill lines, R27.50/kg)        R51,150.00
Proforma Empty DV Cylinder charge                     R12,175.00
                                                       ──────────
Proforma total                                        R63,325.00

Gap = R64,900.69 − R63,325.00 = R1,575.69, decomposed as:
  Gas rate gap (R28.37/kg ERP vs R27.50/kg quoted, × 1,860kg)   +R1,618.19
  Deposit-netting vs. flat DV-line difference                     -R42.50
                                                                 ──────────
                                                                  R1,575.69  (exact)
```

Both components verified to the cent against exact ERP line data (`retail_price`/`line_tax`) and the proforma's own totals.

## What this means

**Payment 44975 fully honors the quote the customer was given.** The R1,575.69 gap is not a shortfall on the customer's part — it's a structural/rate mismatch between the proforma quote (flat R27.50/kg refill pricing + a one-off cylinder charge) and how ERP actually posted the transaction (header rate R24.6696/kg ex-VAT + deposit dispatch/return accounting). This is a pricing/posting question for LIN001 to resolve internally, not a collections matter.

## Recommended action

1. Post a credit note of **-R1,575.69** against invoice 51132, reconciling it to the quoted proforma total — see `LIN001_ERP_correction_request_51132.md`.
2. No customer follow-up needed — the payment already matches what they were quoted, exactly.
3. Worth flagging separately: why does this account have two live pricing models (header rate + deposit dispatch/return, vs. flat refill + cylinder-charge proformas)? If proformas are quoted at a different rate than what ERP later invoices, this could recur on other deliveries.

## Confidence

| Item | Confidence |
|---|---|
| Invoice/CN header figures | PROVEN (ERP) |
| Payment 44975 → this event | **Confirmed** — exact match to the customer's own proforma quote, and quantities match invoice 51132's gas lines exactly |
| R1,575.69 gap, full cause | **PROVEN** (2026-09-06) — exact decomposition into gas-rate gap + deposit-netting difference, reproducing the gap to the cent |

---

## Artifacts

| Artifact | Path |
|---|---|
| This card | `LIN001_event_DN22630.md` |
| ERP correction request | `LIN001_ERP_correction_request_51132.md` |
| DN#21541 card (where 44974 actually belongs) | `LIN001_event_DN21541.md` |
| Allocation edge | `../data/allocation_edges.csv` (AL-0011) |
