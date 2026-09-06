# LIN001 — Event Card: DN-21627

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Delivery note:** DN-21627
**Date:** 2026-01-10
**Status:** Payment **confirmed** via remittance advice; quantity mix **resolved**; pricing correction reopened — **R1,449.00 residual** (was R3,318.77) *(all corrected 2026-09-05)*

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
R52,906.77  event net (as posted)
− R49,588.00  payment 43247
────────────
= R3,318.77  gap, as posted

R52,906.77  event net (as posted)
− R1,869.77  pricing correction (R20.00/kg vs R20.87/kg posted — see below)
────────────
= R51,037.00  event net, corrected
− R49,588.00  payment 43247
────────────
= R1,449.00  residual, corrected
```

## Investigation: pricing — reopened 2026-09-05

Originally checked only against neighboring invoices (48504 prior, 49115 following), both of which also billed at R20.87/kg — so no *change* was visible, and the verdict was "R0.00 pricing impact." **That check missed the right reference point.** The customer confirmed his expected January rate was **R20.00/kg ex-VAT**, not R20.87/kg — meaning both this invoice and its immediate predecessor may have been billed at a stale rate, the same shape of issue as DK-590/DN#21237 (an unapplied correction), just discovered via customer confirmation rather than a neighboring invoice's rate change.

**Corrected at R20.00/kg ex-VAT (gas lines only — deposits are fixed, unaffected by the per-kg rate):**

| Category | Qty | Gas @ R20.00/kg ex-VAT | Deposit (unchanged) | Line total |
|---|---:|---:|---:|---:|
| 14K | 7 | R2,254.00 | R4,427.50 | R6,681.50 |
| 19K | 7 | R3,059.00 | R4,830.00 | R7,889.00 |
| 9KG | 182 | R37,674.00 | R94,185.00 | R131,859.00 |
| **Corrected invoice total** | | | | **R146,429.50** |

```
R148,299.27  Invoice 48725, as posted (R20.87/kg ex-VAT)
− R146,429.50  Invoice 48725, corrected (R20.00/kg ex-VAT)
────────────
= R1,869.77  overcharge — proposed credit
```

**Verdict: pricing explains 56.3% of the R3,318.77 gap** (R1,869.77 of it), not the full amount.

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

1. Post a credit note of **-R1,869.77** against invoice 48725, re-rating the gas lines to R20.00/kg ex-VAT (same treatment as DK-590's invoice 49115 correction).
2. This does **not** fully close the event — **R1,449.00 remains open** even after posting. Follow up with the customer directly on that residual; nothing further in the ERP data explains it (pricing and quantity mix are both now resolved).
3. Check whether the prior invoice (48504, also R20.87/kg) needs the same R20.00/kg correction — it may carry the same stale rate. Not yet investigated.

## Confidence

| Item | Confidence |
|---|---|
| Invoice/CN header figures | PROVEN (ERP) |
| CN 14250 is the empties-return deposit credit (not a reversal of 48725) | PROVEN (exact line-item reconciliation, both documents tie to the cent) |
| Pricing correction (R20.00/kg expected vs R20.87/kg posted) | **PROVEN** (2026-09-05, customer-confirmed expected rate; exact re-rate arithmetic) — explains 56.3% of the gap |
| Quantity-mix anomaly | PROVEN (exact qty comparison across 3 invoices) |
| Cause of the quantity mix | **RESOLVED** (2026-09-05) — confirmed genuine customer order via WhatsApp history, not a substitution or order-entry error |
| Payment 43247 belongs to this event | **Confirmed** (2026-09-05, payment-app receipt explicitly referencing "21627 Lin001", exact date+amount match) |
| R1,449.00 residual (corrected; R3,318.77 as posted) | GAP — pricing and quantity mix both now accounted for; still unexplained |

---

## Artifacts

| Artifact | Path |
|---|---|
| This card | `LIN001_event_DN-21627.md` |
| ERP correction request (pricing) | `LIN001_ERP_correction_request_48725.md` |
| Allocation edge | `../data/allocation_edges.csv` |
