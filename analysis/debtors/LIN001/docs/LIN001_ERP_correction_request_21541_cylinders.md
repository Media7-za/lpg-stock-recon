# LIN001 — ERP Correction Request: DN#21541 Leaking-Cylinder Credit (Empties + Gas Top-Up)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Target event:** DN#21541 (2026-02-13→16), final reissue invoice 49265
**Action:** Post a supplementary credit note against the DN#21541 chain
**Status:** PROPOSED — not yet posted. Requires operator sign-off before ERP action.

---

## What to change

The customer reported 2×19kg and 2×48kg (single-valve) cylinders returned faulty/leaking on this delivery (2026-02-14, per delivery note #21541 and accompanying WhatsApp claim). Two credits are needed; only one was posted.

**1. Empties (deposit) credit — NOT yet posted, needs to be:**

The delivery note's recorded "received" totals (21×19kg, 14×48kg-SV, both annotated "2 leaking"/"2 leaks") are the basis for CN 14432 (-R96,600.00), which is a same-day reversal of an unrelated quantity correction, unconnected to this claim. **Per operator confirmation, the 2×19kg + 2×48kg faulty units were physically returned but not recorded as additional on the delivery note** — the recorded 21/14 counts reflect the normal return only, not these units on top. CN 14432 therefore does not cover their deposits.

| Category | Qty | Deposit rate (ex-VAT) | Line credit (incl. VAT) |
|---|---:|---:|---:|
| 19KG deposit | 2 | R600.00 | -R1,380.00 |
| 48KG SV deposit | 2 | R1,050.00 | -R2,415.00 |
| **Total (empties)** | | | **-R3,795.00** |

**2. Gas credit — already posted (CN 14435), but under-rated:**

CN 14435 (-R3,082.00, 2026-02-16) credited the gas content of these same 4 cylinders (134kg total) at a rounded R20.00/kg ex-VAT, instead of invoice 49265's own actual rate (R20.391/kg ex-VAT — what the customer was actually charged for this gas).

| Basis | Rate (ex-VAT) | Value for 134kg (incl. VAT) |
|---|---:|---:|
| Posted (CN 14435) | R20.00/kg | R3,082.00 |
| Correct — invoice 49265's own rate | R20.391/kg | R3,142.25 |
| **Top-up needed** | | **-R60.25** |

**Recommended posting:** one combined credit note against the DN#21541 chain for **-R3,855.25** (-R3,795.00 empties + -R60.25 gas top-up), or two separate lines if the ERP requires empties and LPG lanes to post separately.

---

## Effect on the event

```
R144,476.87  Invoice 49265 (final reissue)
− R96,600.00  CN 14432 (unrelated quantity correction)
− R3,142.25   CN 14435, corrected (gas, was posted at R3,082.00)
− R3,795.00   NEW credit — empties (2×19kg + 2×48kg-SV deposits, never previously posted)
──────────────
= R40,939.62  total owed
− R40,590.60  payment 44974 (2026-06-06, confirmed via WhatsApp remittance, ref "21541")
──────────────
= R349.02  residual — would remain open even after this correction
```

Posting this credit does **not** fully close DN#21541 — R349.02 stays unaccounted for. That residual traces to a separate, unrelated cause: the customer's own reconciliation used a flat R23.27/kg rate across the *entire* invoice's gas content (not just these 4 cylinders) versus the actual R23.4497/kg incl-VAT rate charged — a systematic rate gap, not a cylinder-count or credit-posting issue. See `LIN001_event_DN21541.md` for the full walkthrough.

---

## Why this correction, not the earlier "double-count" framing

An earlier pass on this account concluded the customer had double-deducted the empties value (once via CN 14432's return figures, once again in his own notebook) — because CN 14432's 21/14 counts were assumed to already include these 4 units. **That assumption is retracted** on operator confirmation that the 4 leaking cylinders were returned but never added to the delivery note's recorded counts. The customer's own deduction for the empties (R3,795.00) was therefore a **legitimate, correct claim**, not an error — LIN001 simply never posted the matching credit.

---

## Confidence

| Item | Confidence |
|---|---|
| CN 14435 gas credit posted at a rounded, under-value rate | PROVEN (ERP line data) |
| Empties credit for these 4 units never posted | ASSERTED — operator-confirmed (delivery note recording gap), not independently verifiable from ERP data alone |
| R349.02 residual, unrelated to the cylinder claim | PROVEN (rate-mismatch arithmetic, reproduces the customer's own payment to within a few cents) |

---

## Artifacts

| Artifact | Path |
|---|---|
| This request | `LIN001_ERP_correction_request_21541_cylinders.md` |
| DN#21541 event card | `LIN001_event_DN21541.md` |
| Allocation edge (44974) | `../data/allocation_edges.csv` (AL-0010) |
| Payment allocation ledger | `../reports/LIN001_Payment_Allocation_v1.md` |
