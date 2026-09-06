# LIN001 — ERP Correction Request: Invoice 49115

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Target document:** Invoice 49115 (2026-02-06, event DN#21237)
**Action:** Apply corrected LPG gas rate — post as a credit note against 49115
**Status:** PROPOSED — not yet posted. Requires operator sign-off before ERP action.

---

## What to change

**Updated 2026-09-06 — supersedes the earlier R2,096.66 version of this request.** Invoice 49115 was billed at the pre-correction LPG rate (R21.264/kg ex-VAT). The earlier version of this request used invoice 49265's own posted rate (R20.391/kg) as the correction target, since that was the only concrete reference point available at the time. **The operator has since confirmed the actual agreed February rate was R20.24/kg ex-VAT** — a different (lower) figure. Re-rating at the confirmed agreed rate, not 49265's posted rate, is the correct basis.

| Category | Stock | Qty | Old price (49115, ex-VAT) | Corrected price (at R20.24/kg) | Delta/unit (ex-VAT) | Line delta (incl. VAT) |
|---|---|---:|---:|---:|---:|---:|
| 14K | 1401 | 14 | R297.69 | R283.36 | -R14.33 | -R230.70 |
| 19K | 1901 | 28 | R404.01 | R384.56 | -R19.45 | -R626.30 |
| 9KG | 901 | 98 | R191.37 | R182.16 | -R9.21 | -R1,037.97 |
| DV | D01 | 5 | R1,020.65 | R971.52 | -R49.13 | -R282.51 |
| SV | S01 | 5 | R1,020.65 | R971.52 | -R49.13 | -R282.49 |
| **Total** | | | | | | **-R2,459.97** |

*(Line delta computed from each category's exact `retail_price`, re-rated at R20.24/kg ex-VAT and re-taxed at 15% per line — not a flat percentage cut.)*

**Recommended posting:** one credit note against invoice 49115, dated on approval, for **-R2,459.97**, LPG lane only (no CYL/deposit lines — those are unaffected).

---

## Verification (PROVEN — exact figures, not estimated)

Computed directly from `transaction_items` (`retail_price`, `line_tax`), deduped to `source_file='CURRENT2307.TXT'`:

- Invoice 49115 actual LPG total (incl. VAT): **R51,106.81**
- Invoice 49115 LPG total at the confirmed agreed rate (R20.24/kg ex-VAT, incl. VAT): **R48,646.84**
- Difference: **R2,459.97**

## Effect on the open event — closes almost exactly

```
R78,304.31  DN#21237 event net (as posted)
− R2,459.97  proposed correction (at the confirmed agreed rate)
────────────
= R75,844.34  corrected event net
− R75,844.50  payment received (44482, 2026-05-08, Confirmed via remittance)
────────────
= R0.16  residual — immaterial, within normal VAT-rounding tolerance
```

**This correction closes the event to within R0.16** — effectively fully explained. This is a materially better result than the earlier R2,096.66 version (which left R362.85 open): using the actual agreed rate, rather than invoice 49265's own posted rate (itself apparently not exactly the agreed rate either — see `LIN001_event_DN21541.md`), accounts for nearly the entire original R2,459.81 gap.

---

## Why this correction, not the earlier one

The earlier version assumed invoice 49265's posted rate (R20.391/kg) was the "correct" reference, since it was the only concrete rate this account had moved to. That assumption is now understood to be slightly off — 49265 itself wasn't billed at the true agreed rate. The operator-confirmed R20.24/kg is the right basis, and it happens to close this event almost exactly, which is strong independent confirmation that R20.24/kg is correct.

---

## Artifacts

| Artifact | Path |
|---|---|
| This request | `LIN001_ERP_correction_request_49115.md` |
| DN#21237 event card | `LIN001_event_DN21237.md` |
| DN#21541 event card (related rate history) | `LIN001_event_DN21541.md` |
| Allocation edge | `../data/allocation_edges.csv` (AL-0009) |
