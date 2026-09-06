# LIN001 — ERP Correction Request: Invoice 48725

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Target document:** Invoice 48725 (2026-01-10, event DN-21627)
**Action:** Apply corrected LPG gas rate — post as a credit note against 48725
**Status:** PROPOSED — not yet posted. Requires operator sign-off before ERP action.

---

## What to change

Invoice 48725 was billed at R20.87/kg ex-VAT. The customer confirmed his expected rate for January was **R20.00/kg ex-VAT** — a stale-rate issue in the same shape as DK-590 (invoice 49115).

**Note (2026-09-06):** a same-day investigation briefly also proposed a 9KG quantity correction (182→180), based on the customer's own notebook. **That is retracted** — the signed delivery note for DN#21627 confirms 182×9KG were dispatched, matching invoice 48725 exactly. This request covers the rate correction only, at the confirmed correct quantities.

| Category | Stock | Qty (confirmed correct) | Old price/unit (R20.87/kg) | Corrected price/unit (R20.00/kg) | Line delta (incl. VAT) |
|---|---|---:|---:|---:|---:|
| 14K | 1401 | 7 | R292.17 | R280.00 | -R97.97 |
| 19K | 1901 | 7 | R396.52 | R380.00 | -R132.98 |
| 9KG | 901 | 182 | R187.83 | R180.00 | -R1,638.83 |
| **Total** | | | | | **-R1,869.77** |

**Recommended posting:** one credit note against invoice 48725, for **-R1,869.77**, LPG gas lane only (deposit lines unaffected and unchanged).

---

## Verification (PROVEN — exact figures)

- Invoice 48725 actual gas-only total (incl. VAT): **R44,856.77** (14K R2,351.97 + 19K R3,191.98 + 9KG R39,312.82)
- Invoice 48725 gas-only at corrected rate, same qty (incl. VAT): **R42,987.00** (14K R2,254.00 + 19K R3,059.00 + 9KG R37,674.00)
- Difference: **R1,869.77**

## Effect on the event

```
R52,906.77  DN-21627 event net (as posted)
− R1,869.77  rate correction (this request)
────────────
= R51,037.00  corrected event net
− R49,588.00  payment received (43247, Confirmed via remittance)
────────────
= R1,449.00  residual
```

**This residual is explained but not creditable.** It exactly matches the value of 2 units of 9KG (2×his-rate-gas + 2×deposit = R1,449.00) — the customer's own notebook undercounted 9KG at 180 instead of the actual, delivery-note-confirmed 182. Posting this rate-only credit note leaves R1,449.00 genuinely still owed by the customer — a collections matter, not a further correction. See `LIN001_event_DN-21627.md` for the full narrative and the delivery-note evidence.

---

## Open follow-up, not yet investigated

Invoice 48504 (2025-12-26, event DN#21739, also confirmed via remittance — see `allocation_edges.csv` AL-0007) appears to have been billed at the same R20.87/kg rate as 48725. Whether it also needs the R20.00/kg correction has not been checked.

---

## Artifacts

| Artifact | Path |
|---|---|
| This request | `LIN001_ERP_correction_request_48725.md` |
| DN-21627 event card | `LIN001_event_DN-21627.md` |
| Allocation edge | `../data/allocation_edges.csv` (AL-0008) |
