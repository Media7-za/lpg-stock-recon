# LIN001 — Event Card: DN-21627

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Delivery note:** DN-21627
**Date:** 2026-01-10
**Status:** Payment **confirmed** via remittance advice (2026-09-05); gap NOT explained by pricing — open question for operator

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

## Payment confirmed, gap open

**Corrected 2026-09-05:** payment 43247 was previously a forced/ASSERTED match (smallest-difference candidate among the three open 2026 events). A customer payment-app receipt (New Champion Supermarket → Bella Energy Services300, 2026-02-06 08:08, Transaction ID 2287807790, R49,588.00) explicitly references **"No: 21627 Lin001"** — exact date and amount match. The target is now **Confirmed** via genuine remittance advice, not inference. This means the R3,318.77 gap is a real, confirmed shortfall on this specific event, not a case of the payment belonging elsewhere.

A companion receipt from the same customer, same 2-minute window (08:06, R34,877.50, ref "No: 21739"), separately confirms payment 43246 → DN#21739 (see `allocation_edges.csv` AL-0007) — both payments were made together in one sitting.

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

9KG spiked well above both neighbors while 14K/19K dropped and SV/DV disappeared entirely. This is a substitution pattern, not a pricing issue.

**RESOLVED 2026-09-05: confirmed customer order, via WhatsApp history.** The customer requested this specific 9KG-heavy mix directly — not a stock shortage and not an order-entry error. The quantities on invoice 48725 are correct and intentional.

**Checked 2026-09-05: CN 14250 is not a reversal of invoice 48725, and this isn't a posting error.** CN 14250 is deposit-only (no gas lines) at qty 15×14K/15×19K/146×9KG — the "empties returned" credit, at the actual *received* quantities, same pattern as DN#21541's Rt/Bt structure. It doesn't need to match 48725's *dispatched* quantities (7×14K/7×19K/182×9KG), and both documents tie to the cent (invoice R148,299.27, CN -R95,392.50, net R52,906.77). The net effect: the customer handed back *more* 14K/19K empties (15 each) than were freshly dispatched (7 each) while taking on a large net increase in 9KG cylinders (182 dispatched vs 146 returned) — consistent with a real substitution on this delivery, not a data-entry mistake.

## Recommended action

The payment target is confirmed and the quantity mix is confirmed intentional — both threads that could have explained the R3,318.77 gap are closed. **What remains is a plain, unexplained underpayment**, not a data or documentation question. Recommend following up with the customer directly on the R3,318.77 shortfall itself, since nothing in the ERP data (pricing, quantities, or document structure) accounts for it.

## Confidence

| Item | Confidence |
|---|---|
| Invoice/CN header figures | PROVEN (ERP) |
| CN 14250 is the empties-return deposit credit (not a reversal of 48725) | PROVEN (exact line-item reconciliation, both documents tie to the cent) |
| Pricing ruled out as the cause | PROVEN (exact price-per-kg comparison, R0.00 impact) |
| Quantity-mix anomaly | PROVEN (exact qty comparison across 3 invoices) |
| Cause of the quantity mix | **RESOLVED** (2026-09-05) — confirmed genuine customer order via WhatsApp history, not a substitution or order-entry error |
| Payment 43247 belongs to this event | **Confirmed** (2026-09-05, payment-app receipt explicitly referencing "21627 Lin001", exact date+amount match) |
| R3,318.77 gap cause | GAP — confirmed real, both candidate explanations (pricing, quantity mix) ruled out; a plain unexplained shortfall |

---

## Artifacts

| Artifact | Path |
|---|---|
| This card | `LIN001_event_DN-21627.md` |
| Allocation edge | `../data/allocation_edges.csv` |
