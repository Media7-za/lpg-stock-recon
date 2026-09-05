# LIN001 — ERP Correction Request: Invoice 49115

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Target document:** Invoice 49115 (2026-02-06, event DN#21237)
**Action:** Apply corrected LPG gas rate — post as a credit note against 49115
**Status:** PROPOSED — not yet posted. Requires operator sign-off before ERP action.

---

## What to change

Invoice 49115 was billed at the pre-correction LPG rate. Invoice 49265 (2026-02-16, same account, event DN#21541) shows the corrected rate applied days later for an unrelated delivery. Recommend applying the same per-unit correction to 49115, retroactively.

| Category | Stock | Qty | Old price (49115) | Corrected price (from 49265) | Delta/unit (ex-VAT) | Line delta (incl. VAT) |
|---|---|---:|---:|---:|---:|---:|
| 14K | 1401 | 14 | R297.69 | R285.48 | -R12.21 | -R196.57 |
| 19K | 1901 | 28 | R404.01 | R387.43 | -R16.58 | -R533.88 |
| 9KG | 901 | 98 | R191.37 | R183.52 | -R7.85 | -R884.70 |
| DV | D01 | 5 | R1,020.65 | R978.78 | -R41.87 | -R240.76 |
| SV | S01 | 5 | R1,020.65 | R978.78 | -R41.87 | -R240.75 |
| **Total** | | | | | | **-R2,096.66** |

*(Line delta computed from each invoice's actual `retail_price` and `line_tax` values — not a flat 15% multiply, which would introduce ~1c/line rounding drift. Cross-checked against a flat-15% recompute: agrees to within R0.01 per line, R0.01 in aggregate.)*

**Recommended posting:** One credit note against invoice 49115, dated on approval, for **-R2,096.66**, LPG lane only (no CYL/deposit lines — those are unaffected and confirmed unchanged between 49115 and 49265).

---

## Verification (PROVEN — exact figures, not estimated)

Computed directly from `transaction_items` (`retail_price`, `line_tax`), deduped to `source_file='CURRENT2307.TXT'`:

- Invoice 49115 actual LPG total (incl. VAT): **R51,106.81**
- Invoice 49115 LPG total at corrected rate (incl. VAT): **R49,010.15**
- Difference: **R2,096.66**

## Effect on the open event

```
R78,304.31  DN#21237 event net (as posted)
− R2,096.66  proposed correction
────────────
= R76,207.65  corrected event net
− R75,844.50  payment received (44482, 2026-05-08)
────────────
= R362.85  residual — would remain open even after this correction
```

Posting this CN does **not** fully close DN#21237 — R362.85 stays unaccounted for. See `LIN001_event_DN21237.md` for the full narrative and `LIN001_Pricing_Investigation_2026-02.md`-equivalent reasoning (folded into the event cards per operator direction — no combined report file).

---

## Why this correction, not a different one

Invoice 49115 and the original invoice 49252 (both dated before 2026-02-13) were billed at the same higher rate. 49252 was reversed and reissued as 49265 at the lower rate within days — a deliberate, uniform (-4.10%) rate-table correction, not category-specific haggling (see `LIN001_event_DN21541.md`). 49115 was never given the same correction. This request proposes closing that gap.

---

## Artifacts

| Artifact | Path |
|---|---|
| This request | `LIN001_ERP_correction_request_49115.md` |
| DN#21237 event card | `LIN001_event_DN21237.md` |
| DN#21541 event card (source of the corrected rate) | `LIN001_event_DN21541.md` |
| Allocation edge | `../data/allocation_edges.csv` (AL for payment 44482) |
