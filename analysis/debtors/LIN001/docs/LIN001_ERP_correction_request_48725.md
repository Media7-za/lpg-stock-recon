# LIN001 — ERP Correction Request: Invoice 48725

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Target document:** Invoice 48725 (2026-01-10, event DN-21627)
**Action:** Post a credit note against 48725 correcting both rate and 9KG quantity
**Status:** PROPOSED — not yet posted. Requires operator sign-off before ERP action.

---

## What to change

**Updated 2026-09-05 — supersedes the R1,869.77 rate-only version of this request.** The customer's own reconciliation notebook for this delivery revealed a second discrepancy on top of the rate: he was invoiced for 182 units of 9KG, but his own dispatched-quantity figure was **180**. Applying both corrections together reproduces his actual payment (43247, R49,588.00) exactly, to the cent — this is now a full, confirmed correction, not a partial one.

| Category | Stock | Qty (posted → corrected) | Old price/unit (R20.87/kg) | Corrected price/unit (R20.00/kg) | Line delta (incl. VAT) |
|---|---|---|---:|---:|---:|
| 14K | 1401 | 7 → 7 | R292.17 | R280.00 | -R97.97 |
| 19K | 1901 | 7 → 7 | R396.52 | R380.00 | -R132.98 |
| 9KG gas | 901 | 182 → 180 | R187.83 | R180.00 (×180, not 182) | -R2,052.82 |
| 9KG deposit | 9.1 | 182 → 180 | R450.00 | R450.00 (×180, not 182) | -R1,035.00 |
| **Total** | | | | | **-R3,318.77** |

**Recommended posting:** one credit note against invoice 48725, dated on approval, for **-R3,318.77** — covering both the gas-rate correction (all categories) and the 9KG quantity correction (gas + deposit, 182→180). This fully closes the event: R52,906.77 (posted net) − R3,318.77 = R49,588.00, exactly matching payment 43247.

---

## Verification (PROVEN — exact figures, reproduces customer's payment to the cent)

Customer's handwritten notebook (delivery dated 2026-01-10, "No: 21627"):

```
GAS:  180×207 (9KG) + 7×322 (14K) + 7×437 (19K)   = R42,573.00
Bt:   180×517.50 + 7×632.50 + 7×690               = R102,407.50
Rt:   146×517.50 + 15×632.50 + 15×690             = R95,392.50   (ties exactly to CN 14250, unaffected)
──────────────────────────────────────────────────
GAS + Bt − Rt = R49,588.00   ← exactly payment 43247
```

His rate (R23.00/kg incl VAT = R20.00/kg ex-VAT) and his 9KG quantity (180) together fully reconcile — no rounding, no residual.

## Effect on the event

```
R52,906.77  DN-21627 event net (as posted)
− R3,318.77  full correction (rate + 9KG quantity)
────────────
= R49,588.00  corrected event net
− R49,588.00  payment received (43247, Confirmed via remittance)
────────────
= R0.00  residual — event fully closes
```

This **fully closes** DN-21627 — no further customer follow-up needed on the amount. See `LIN001_event_DN-21627.md` for the full narrative.

---

## Open follow-up, not yet investigated

Invoice 48504 (2025-12-26, event DN#21739, also confirmed via remittance — see `allocation_edges.csv` AL-0007) appears to have been billed at the same R20.87/kg rate as 48725. Whether it also needs a rate and/or quantity correction has not been checked.

---

## Artifacts

| Artifact | Path |
|---|---|
| This request | `LIN001_ERP_correction_request_48725.md` |
| DN-21627 event card | `LIN001_event_DN-21627.md` |
| Allocation edge | `../data/allocation_edges.csv` (AL-0008) |
