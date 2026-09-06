# LIN001 — ERP Correction Request: Invoice 48725

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Target document:** Invoice 48725 (2026-01-10, event DN-21627)
**Action:** Apply corrected LPG gas rate — post as a credit note against 48725
**Status:** PROPOSED — not yet posted. Requires operator sign-off before ERP action.

---

## What to change

Invoice 48725 was billed at R20.87/kg ex-VAT. The customer confirmed his expected rate for January was **R20.00/kg ex-VAT** — a stale-rate issue in the same shape as DK-590 (invoice 49115), just identified via customer confirmation rather than a neighboring invoice's rate change (48725's own neighbors, 48504 and 49115, were also billed at or near R20.87/kg, which is why an earlier pass comparing only against those invoices concluded "no pricing impact").

| Category | Stock | Qty | Old price/unit (48725, at R20.87/kg) | Corrected price/unit (at R20.00/kg) | Line delta (incl. VAT) |
|---|---|---:|---:|---:|---:|
| 14K | 1401 | 7 | R292.17 | R280.00 | -R97.94 |
| 19K | 1901 | 7 | R396.52 | R380.00 | -R133.02 |
| 9KG | 901 | 182 | R187.83 | R180.00 | -R1,638.83 |
| **Total** | | | | | **-R1,869.77** |

*(Line delta computed from each category's exact `retail_price`, re-rated at R20.00/kg ex-VAT and re-taxed at 15% — not a flat percentage cut, since the discount is expressed per kg. Deposit lines are unaffected by the gas rate and confirmed unchanged.)*

**Recommended posting:** one credit note against invoice 48725, dated on approval, for **-R1,869.77**, LPG gas lane only (no CYL/deposit lines — those are fixed rates, unrelated to the per-kg gas price).

---

## Verification (PROVEN — exact figures, not estimated)

Computed directly from `transaction_items` (`retail_price`, `line_tax`), deduped to `source_file='CURRENT2307.TXT'`:

- Invoice 48725 actual gas-only total (incl. VAT): **R44,856.77** (14K R2,351.97 + 19K R3,191.98 + 9KG R39,312.82 — full invoice incl. deposit lines is R148,299.27)
- Invoice 48725 gas-only at corrected rate (incl. VAT): **R42,987.00** (14K R2,254.00 + 19K R3,059.00 + 9KG R37,674.00)
- Difference: **R1,869.77**

## Effect on the open event

```
R52,906.77  DN-21627 event net (as posted)
− R1,869.77  proposed correction
────────────
= R51,037.00  corrected event net
− R49,588.00  payment received (43247, 2026-02-06, Confirmed via remittance)
────────────
= R1,449.00  residual — would remain open even after this correction
```

Posting this CN does **not** fully close DN-21627 — R1,449.00 stays unaccounted for. The quantity-mix question that was the other candidate explanation is already resolved (confirmed genuine customer order via WhatsApp history) — it does not contribute to this residual. See `LIN001_event_DN-21627.md` for the full narrative.

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
