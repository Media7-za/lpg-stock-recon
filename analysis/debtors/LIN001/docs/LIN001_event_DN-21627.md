# LIN001 — Event Card: DN-21627

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Delivery note:** DN-21627
**Date:** 2026-01-10
**Status:** **CLOSED** — payment 43247 reconciles exactly to R0.00 once the correct rate and 9KG quantity are applied. *(2026-09-05)*

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

## Resolution: the customer's own notebook closes the gap exactly

His handwritten reconciliation for this delivery (dated 2026.01.10, "No: 21627") reproduces his payment to the cent:

```
GAS:  180×207 (9KG) + 7×322 (14K) + 7×437 (19K)   = R42,573.00
Bt:   180×517.50 + 7×632.50 + 7×690               = R102,407.50
Rt:   146×517.50 + 15×632.50 + 15×690             = R95,392.50   (ties exactly to CN 14250)
──────────────────────────────────────────────────
GAS + Bt − Rt = R49,588.00   ← exactly his payment
```

**Two discrepancies, both real, together explaining the whole R3,318.77 gap:**

1. **Rate**: his notebook uses a flat R23.00/kg incl VAT (= R20.00/kg ex-VAT) across all categories — 9×23=207, 14×23=322, 19×23=437 — versus the R20.87/kg ex-VAT actually posted on invoice 48725.
2. **9KG quantity**: his notebook uses **180 units** for 9KG (both GAS and Bt), not the **182 units** ERP invoiced. His Rt figures (146/15/15) match CN 14250 exactly — no dispute there, only on what was dispatched.

| | Rate (ex-VAT) | 9KG qty | 14K/19K qty |
|---|---:|---:|---:|
| Invoice 48725 (as posted) | R20.87/kg | 182 | 7 / 7 (agreed) |
| Customer's basis | R20.00/kg | 180 | 7 / 7 (agreed) |

**Full correction, decomposed exactly:**

| Category | Cause | Amount |
|---|---|---:|
| 9KG (gas + deposit, rate + 2-unit qty combined) | Rate + quantity | R3,087.82 |
| 14K gas | Rate only | R97.97 |
| 19K gas | Rate only | R132.98 |
| **Total** | | **R3,318.77** |

**This equals the entire original gap, to the cent.** Nothing remains unexplained.

```
R148,299.27  Invoice 48725, as posted
− R3,318.77   full correction (rate + 9KG quantity)
────────────
= R144,980.50  corrected invoice total
− R95,392.50   CN 14250 (unaffected — already matches actual returns)
────────────
= R49,588.00  corrected event net
− R49,588.00  payment 43247
────────────
= R0.00  residual
```

---

## Prior investigation threads (for context — all superseded or folded into the above)

- **Quantity-mix anomaly** (9KG spiking to 182 vs 112 prior/98 following, 14K/19K dropped, zero SV/DV): confirmed via WhatsApp history to be a genuine customer order, not a substitution or error. Still true — the *shape* of the order was intentional; only the *count* of 9KG units (180 vs 182) turned out to be in question.
- **CN 14250**: confirmed to be the empties-return deposit credit (not a reversal of 48725) — both documents tie to the cent independent of this correction, and CN 14250 needs no change.
- **Payment target**: confirmed via payment-app receipt explicitly referencing "21627 Lin001" (2026-02-06 08:08, R49,588.00 exact match) — was previously a forced/ASSERTED match.
- An earlier pass corrected only the rate (R1,869.77, 56.3% of the gap) before the notebook surfaced the 9KG quantity discrepancy — that partial correction is superseded by the full one above.

## Recommended action

1. Post a credit note of **-R3,318.77** against invoice 48725: re-rate all gas lines to R20.00/kg ex-VAT, and reduce 9KG quantity from 182 to 180 (both gas and deposit lines). See `LIN001_ERP_correction_request_48725.md` (needs updating from the partial R1,869.77 figure).
2. **No further customer follow-up needed on this event** — the gap is fully explained and closes to R0.00.
3. Check whether invoice 48504 (2025-12-26, DN#21739, also billed at R20.87/kg) has a similar quantity or rate discrepancy — not yet investigated.

## Confidence

| Item | Confidence |
|---|---|
| Invoice/CN header figures | PROVEN (ERP) |
| CN 14250 is the empties-return deposit credit | PROVEN (exact line-item reconciliation) |
| Payment 43247 belongs to this event | **Confirmed** (payment-app receipt, exact reference + amount match) |
| Cause of the 9KG-heavy order | **RESOLVED** — confirmed genuine customer order via WhatsApp |
| R3,318.77 gap, full cause | **RESOLVED** (2026-09-05) — customer's own notebook reproduces his payment to the cent; rate (R20.00/kg vs R20.87/kg) + 9KG quantity (180 vs 182) together explain 100% |

---

## Artifacts

| Artifact | Path |
|---|---|
| This card | `LIN001_event_DN-21627.md` |
| ERP correction request (pricing + quantity) | `LIN001_ERP_correction_request_48725.md` |
| Allocation edge | `../data/allocation_edges.csv` |
