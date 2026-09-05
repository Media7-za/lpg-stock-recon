# LIN001 — ERP Correction Request: DN#21541 Price Adjustment (Discount Journal)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Target document:** CN 14435 (2026-02-16), against invoice 49265, event DN#21541
**Action:** Post a discount journal (price adjustment) — NOT a credit note
**Status:** PROPOSED — not yet posted. Requires operator sign-off before ERP action.

---

## What to change

CN 14435 (-R3,082.00) credited the gas content of the 2×19kg + 2×48kg leaking cylinders (134kg total) at a rounded **R20.00/kg ex-VAT**. The confirmed LIN001 rate in effect for February 2026 was **R20.391/kg ex-VAT (R23.45/kg incl VAT)** — the same rate charged on the rest of invoice 49265 and verified against every other category on that invoice. This is a price-per-kg shortfall on an already-posted credit, not a new item — a **discount journal**, not a credit note.

| Basis | Rate (ex-VAT) | Value for 134kg (incl. VAT) |
|---|---:|---:|
| Posted (CN 14435) | R20.00/kg | R3,082.00 |
| Correct — Feb 2026 confirmed rate (R23.45/kg incl VAT) | R20.391/kg | R3,142.25 |
| **Discount journal needed** | | **-R60.25** |

**Recommended posting:** a discount journal of **-R60.25** topping up CN 14435 to its correct value.

---

## Effect on the event

```
R44,794.87  DN#21541 event net (as posted)
− R60.25  price-adjustment discount journal (this request)
────────────
= R44,734.62  corrected event net (before the separate empties credit)
```

This is one of two corrections needed on DN#21541 — see `LIN001_ERP_correction_request_21541_empties_credit.md` for the separate, larger empties credit note (-R3,795.00). Combined, both bring the event to R40,939.62 owed against payment 44974 (R40,590.60), leaving R349.02 open — itself explained by a rate mismatch in the customer's own reconciliation (see `LIN001_event_DN21541.md`), not a further correction item.

---

## Why a discount journal, not a credit note

This is a rate correction on a line that already exists and was already posted (CN 14435) — the quantity (134kg) and the fact that a credit was due are not in question, only the per-kg rate used. That's a price adjustment on an existing document, distinct in kind from the empties credit (a wholly new, unposted line item) — hence the two separate requests.

---

## Confidence

| Item | Confidence |
|---|---|
| CN 14435 posted at a rounded, under-value rate | PROVEN (ERP line data) |
| Feb 2026 confirmed rate (R23.45/kg incl VAT) | PROVEN (verified across invoice 49265's other categories, and against invoice 49115/DK-590) |

---

## Artifacts

| Artifact | Path |
|---|---|
| This request | `LIN001_ERP_correction_request_21541_price_adjustment.md` |
| Related request (empties credit note) | `LIN001_ERP_correction_request_21541_empties_credit.md` |
| DN#21541 event card | `LIN001_event_DN21541.md` |
| Allocation edge (44974) | `../data/allocation_edges.csv` (AL-0010) |
