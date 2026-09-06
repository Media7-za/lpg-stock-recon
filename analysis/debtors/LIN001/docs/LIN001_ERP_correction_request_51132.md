# LIN001 — ERP Correction Request: Invoice 51132

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Target document:** Invoice 51132 (2026-06-08, event DN#22630)
**Action:** Post a discount journal (rate correction) plus a small deposit-side adjustment, reconciling the invoice to the customer's quoted proforma
**Status:** PROPOSED — not yet posted. Requires operator sign-off before ERP action.

---

## What to change

The customer's proforma quote for this delivery ("LPG + Empty DV", R27.50/kg incl VAT flat) totals **R63,325.00**, exactly matching payment 44975. Invoice 51132 was posted at the account's standard header rate (R24.6696/kg ex-VAT, R28.37/kg incl VAT) plus deposit dispatch/return accounting, netting to **R64,900.69** — R1,575.69 more than quoted.

| Component | ERP (as posted) | Proforma (quoted) | Delta |
|---|---:|---:|---:|
| Gas (5 lines, all sizes) | R52,768.19 | R51,150.00 (4 refill lines) | -R1,618.19 |
| 48kg DV deposit (kept, never reversed) | R12,075.00 | — | |
| 14/19/9kg deposit net (dispatch − actual return) | R57.50 | — | |
| Empty DV Cylinder charge | — | R12,175.00 | |
| **Deposit-side total** | **R12,132.50** | **R12,175.00** | **+R42.50** |
| **Total** | **R64,900.69** | **R63,325.00** | **-R1,575.69** |

**Recommended posting — two entries, not one blanket credit note** (consistent with how DN#21541's price-vs-empties correction was split, DK-591/DK-596):

1. **Discount journal, -R1,618.19** — LPG rate adjustment on invoice 51132 (DN#22630): billed at R28.37/kg incl VAT vs the customer's quoted proforma rate R27.50/kg. This is the price-adjustment component, same transaction type as DK-591.
2. **Deposit-side adjustment, +R42.50** — reconciles ERP's dispatch/return deposit netting (R12,132.50 kept) to the proforma's flat Empty DV Cylinder charge (R12,175.00).

Net effect of both: **-R1,575.69**, bringing the event to exactly R63,325.00 — matching the quote and the payment received. The two entries are correctly typed rather than posted as a single mislabeled credit note.

---

## Verification (PROVEN — exact figures, reproduces the gap to the cent)

```
ERP gas total (posted rate, exact retail_price/line_tax)         R52,768.19
ERP deposit net kept (invoice 51132 deposits − CN 15039 returns) R12,132.50
                                                                  ──────────
ERP event net                                                    R64,900.69

Proforma gas total (80x9kg+20x14kg+20x19kg+10x48kg @ R27.50/kg)  R51,150.00
Proforma Empty DV Cylinder charge (10 x R1,217.50)               R12,175.00
                                                                  ──────────
Proforma total (= payment 44975, exact)                          R63,325.00

Gap                                                                R1,575.69
```

The refill quantities on the proforma (80×9kg, 20×14kg, 20×19kg, 10×48kg) exactly match invoice 51132's actual gas lines — this is unambiguously the quote for this delivery, not a different or unrelated document.

## Effect on the event

```
R64,900.69  DN#22630 event net (as posted)
− R1,618.19  discount journal (LPG rate adjustment)
+ R42.50  deposit-side adjustment
────────────
= R63,325.00  corrected event net
− R63,325.00  payment received (44975, 2026-06-07)
────────────
= R0.00  residual — event fully closes
```

---

## Why this correction, not further chasing the customer

Payment 44975 already exactly matches what the customer was quoted. The gap exists entirely because ERP posted the delivery using its standard header-rate + deposit-dispatch/return model, while the customer was quoted a flat refill rate with a one-off cylinder charge. This is an internal pricing/posting reconciliation, not a collections matter.

**Worth flagging separately:** this account appears to have two live pricing paths — the standard invoice+deposit model (used elsewhere on this account, e.g. DN-21627, DN#21237, DN#21541) and a flat "refill" proforma model (seen here). If proformas are quoted at a rate that doesn't match what ERP later invoices, this discrepancy could recur on future deliveries quoted the same way.

---

## Artifacts

| Artifact | Path |
|---|---|
| This request | `LIN001_ERP_correction_request_51132.md` |
| DN#22630 event card | `LIN001_event_DN22630.md` |
| Allocation edge | `../data/allocation_edges.csv` (AL-0011) |
