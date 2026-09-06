# LIN001 — Event Card: DN-21627

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Delivery note:** DN-21627
**Date:** 2026-01-10
**Status:** Payment confirmed; rate correction due (-R1,869.77); **R1,449.00 remains owed by the customer** (his own 9KG counting error) *(2026-09-06)*

---

## Documents

| Part | Doc | Date | Amount |
|---|---|---|---:|
| Invoice | 48725 | 2026-01-10 | R148,299.27 |
| Credit note | 14250 | 2026-01-10 | R-95,392.50 |
| **Event net (as posted)** | | | **R52,906.77** |
| Payment | 43247 | 2026-02-06 | R49,588.00 |

27-day lag, within this account's normal range.

---

## Correction log (2026-09-06) — a prior "full closure" is partially retracted

Earlier the same day, the customer's own notebook (using a 9KG quantity of 180) was taken as reproducing his payment exactly, and the event was marked fully closed to R0.00 by crediting both a rate difference AND a 2-unit 9KG quantity difference.

**The 9KG quantity portion is retracted.** The signed delivery note for DN#21627 shows **182×9KG dispatched**, matching invoice 48725 exactly — client-signed, unambiguous. The customer's notebook figure of 180 was his own undercount, not a legitimate billing dispute. **Only the rate correction stands.**

---

## What's legitimate: the rate correction

The customer confirmed his expected January rate was **R20.00/kg ex-VAT**, versus the R20.87/kg actually posted on invoice 48725. This is the same shape of issue as DK-590 (an unapplied rate correction), and applies at the **correct, delivery-note-confirmed quantities** (182×9KG, 7×14K, 7×19K):

| Category | Qty (confirmed correct) | Gas @ R20.00/kg ex-VAT | Deposit (unchanged) | Line total |
|---|---:|---:|---:|---:|
| 14K | 7 | R2,254.00 | R4,427.50 | R6,681.50 |
| 19K | 7 | R3,059.00 | R4,830.00 | R7,889.00 |
| 9KG | 182 | R37,674.00 | R94,185.00 | R131,859.00 |
| **Corrected invoice total** | | | | **R146,429.50** |

```
R148,299.27  Invoice 48725, as posted (R20.87/kg ex-VAT)
− R146,429.50  Invoice 48725, corrected (R20.00/kg ex-VAT, qty unchanged)
────────────
= R1,869.77  overcharge — legitimate credit

R52,906.77  event net, as posted
− R1,869.77  rate correction
────────────
= R51,037.00  event net, corrected
− R49,588.00  payment 43247
────────────
= R1,449.00  residual
```

## What's not legitimate: the R1,449.00 residual is the customer's own counting error, not a credit

His notebook used 180×9KG instead of the actual, delivery-note-confirmed 182. The value of that 2-unit shortfall at his own rate (2×207 gas + 2×517.50 deposit = R1,449.00) **exactly** matches the residual left after the rate correction. This isn't a coincidence — it's the mechanical explanation for his underpayment: he miscounted his own delivery by 2 units of 9KG and paid accordingly short.

**This means R1,449.00 is still owed by the customer** — it is explained, but not creditable. The delivery note (signed by the client's receiver) is the evidence LIN001 needs if the customer disputes this.

---

## Other threads (unaffected by today's retraction)

- **Quantity-mix shape** (9KG-heavy order vs neighboring invoices): still confirmed genuine via WhatsApp — the customer did intentionally order a 9KG-heavy mix. Only his own later recollection of the *exact count* (180 vs 182) was wrong.
- **CN 14250**: confirmed to be the empties-return deposit credit (deposit-only, at received quantities 146/15/15) — unaffected, still ties to the cent, no change.
- **Payment target**: confirmed via payment-app receipt explicitly referencing "21627 Lin001" (2026-02-06 08:08, R49,588.00 exact match).

## Recommended action

1. Post a credit note of **-R1,869.77** against invoice 48725 (rate correction only — see `LIN001_ERP_correction_request_48725.md`).
2. **Do not credit the 9KG quantity** — the signed delivery note confirms 182 were dispatched, matching the invoice.
3. Follow up with the customer for the **R1,449.00 still owed** — show him the signed delivery note (182×9KG) against his own notebook (180×9KG) to explain the shortfall. This is a collections conversation, not a further correction.

## Confidence

| Item | Confidence |
|---|---|
| Invoice/CN header figures | PROVEN (ERP) |
| CN 14250 is the empties-return deposit credit | PROVEN (exact line-item reconciliation) |
| Payment 43247 belongs to this event | **Confirmed** (payment-app receipt, exact reference + amount match) |
| 9KG quantity dispatched = 182 (not 180) | **PROVEN** — signed delivery note, matches invoice 48725 exactly |
| Rate correction (R20.00/kg vs R20.87/kg posted) | **PROVEN** (customer-confirmed expected rate) — R1,869.77 legitimate credit |
| R1,449.00 residual | **EXPLAINED, not creditable** — customer's own 2-unit 9KG undercount, still owed |

---

## Artifacts

| Artifact | Path |
|---|---|
| This card | `LIN001_event_DN-21627.md` |
| ERP correction request (rate only) | `LIN001_ERP_correction_request_48725.md` |
| Allocation edge | `../data/allocation_edges.csv` |
