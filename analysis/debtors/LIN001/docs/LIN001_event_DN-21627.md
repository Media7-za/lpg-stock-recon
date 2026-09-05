# LIN001 — Event Card: DN-21627

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Delivery note:** DN-21627
**Date:** 2026-01-10
**Status:** Payment forced-matched; gap NOT explained by pricing — open question for operator

---

## Documents

| Part | Doc | Date | Amount |
|---|---|---|---:|
| Invoice | 48725 | 2026-01-10 | R148,299.27 |
| Credit note | 14250 | 2026-01-10 | R-95,392.50 |
| **Event net** | | | **R52,906.77** |
| Payment | 43247 | 2026-02-06 | R49,588.00 |

27-day lag, within this account's normal range — nothing unusual about the timing itself.

---

## Forced match and gap

Payment 43247 was forced-matched to this event as the smallest-difference candidate among the three open 2026 events (see `../data/allocation_edges.csv`).

```
R52,906.77  event net
− R49,588.00  payment 43247
────────────
= R3,318.77  gap
```

## Investigation: pricing dispute — ruled out

Unlike DN#21237/DN#21541 (see those event cards), this event's price-per-kg was checked against the prior invoice (48504, Dec 26, 2025) and the following invoice (49115, Feb 6, 2026):

- Price-per-kg was **flat at R20.87/kg** on both the prior invoice and this one (48725) — no price change on this delivery itself.
- The price step to R21.264/kg only appears on the *following* invoice (49115), aligned with the Feb 4 first-Wednesday reset.
- Estimated pricing impact on this event: **R0.00**.

**Verdict: pricing does not explain the R3,318.77 gap.**

## What the investigation found instead: a quantity-mix anomaly

Invoice 48725's LPG category mix looks distorted compared to its neighbors:

| Category | Prior (48504) qty | **Own (48725) qty** | Following (49115) qty |
|---|---:|---:|---:|
| 9KG | 112 | **182** | 98 |
| 14K | 12 | **7** | 14 |
| 19K | 21 | **7** | 28 |
| SV/DV | 5 (DV) | **0 — none ordered** | 5+5 |

9KG spiked well above both neighbors while 14K/19K dropped and SV/DV disappeared entirely. This is a substitution pattern, not a pricing issue. Possible explanations (none confirmed):

- A stock shortage on 14K/19K/SV/DV forced substitution with 9KG on this delivery
- An order-entry error (wrong SKU quantities keyed)
- A genuine, deliberate customer request for that particular mix

## Recommended action

This needs operator/customer input, not an ERP price correction — there's nothing to correct in the pricing, and the quantity mix as recorded may simply be accurate. Suggest confirming with the customer or the driver/delivery record whether the 9KG-heavy mix on this specific delivery was intentional or a substitution, before treating the R3,318.77 gap as a dispute at all — it may be an unrelated short payment.

## Confidence

| Item | Confidence |
|---|---|
| Invoice/CN header figures | PROVEN (ERP) |
| Pricing ruled out as the cause | PROVEN (exact price-per-kg comparison, R0.00 impact) |
| Quantity-mix anomaly | PROVEN (exact qty comparison across 3 invoices) |
| Cause of the anomaly | GAP — needs operator/customer confirmation |
| Payment 43247 belongs to this event (vs. a different one) | ASSERTED (forced match — smallest residual among candidates, not a ref/remittance-confirmed link) |
| R3,318.77 gap cause | GAP — unexplained |

---

## Artifacts

| Artifact | Path |
|---|---|
| This card | `LIN001_event_DN-21627.md` |
| Allocation edge | `../data/allocation_edges.csv` |
