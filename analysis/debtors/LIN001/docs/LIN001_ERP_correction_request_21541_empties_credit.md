# LIN001 — ERP Correction Request: DN#21541 Empties Credit (Credit Note)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Target event:** DN#21541 (2026-02-13→16), delivery note dated 2026-02-14
**Action:** Post a new credit note for the empties/deposits — NOT a discount journal
**Status:** PROPOSED — not yet posted. Requires operator sign-off before ERP action.

---

## What to change

The customer reported 2×19kg and 2×48kg (single-valve) cylinders returned faulty/leaking on this delivery. The delivery note's recorded "received" totals (21×19kg, 14×48kg-SV, each annotated "2 leaking"/"2 leaks") are the basis for CN 14432 (-R96,600.00) — a same-day reversal of an unrelated quantity correction. **Per operator confirmation, the 2×19kg + 2×48kg faulty units were physically returned but not recorded as additional on the delivery note** — the recorded 21/14 counts reflect the normal return only. CN 14432 therefore does not cover their deposits, and no other document does either. This is a brand-new, unposted item — a **credit note**, not a rate/price adjustment.

| Category | Qty | Deposit rate (ex-VAT) | Line credit (incl. VAT) |
|---|---:|---:|---:|
| 19KG deposit | 2 | R600.00 | -R1,380.00 |
| 48KG SV deposit | 2 | R1,050.00 | -R2,415.00 |
| **Total (empties)** | | | **-R3,795.00** |

**Recommended posting:** a new credit note of **-R3,795.00** for the empties/deposits, referencing DN#21541.

---

## Effect on the event

```
R44,794.87  DN#21541 event net (as posted)
− R3,795.00  empties credit note (this request)
────────────
= R40,999.87  corrected event net (before the separate R60.25 price adjustment)
```

This is one of two corrections needed on DN#21541 — see `LIN001_ERP_correction_request_21541_price_adjustment.md` for the separate, smaller price-adjustment discount journal (-R60.25). Combined, both bring the event to R40,939.62 owed against payment 44974 (R40,590.60), leaving R349.02 open — itself explained by a rate mismatch in the customer's own reconciliation (see `LIN001_event_DN21541.md`), not a further correction item.

---

## Why a credit note, not a discount journal

This is a wholly new item that was never posted anywhere in ERP — not a rate correction on an existing line. The deposit value itself (R600/R1,050 ex-VAT per unit) is not in dispute; what's owed is a credit that simply doesn't exist yet. That's distinct in kind from the price adjustment on CN 14435 (an existing, already-posted line whose rate needs correcting) — hence the two separate requests.

---

## Confidence

| Item | Confidence |
|---|---|
| Empties credit for these 4 units never posted | ASSERTED — operator-confirmed (delivery note recording gap), not independently verifiable from ERP data alone |
| Deposit rates (R600/R1,050 ex-VAT) | PROVEN — fixed rates, unchanged across all LIN001 events checked |

---

## Artifacts

| Artifact | Path |
|---|---|
| This request | `LIN001_ERP_correction_request_21541_empties_credit.md` |
| Related request (price adjustment) | `LIN001_ERP_correction_request_21541_price_adjustment.md` |
| DN#21541 event card | `LIN001_event_DN21541.md` |
| Allocation edge (44974) | `../data/allocation_edges.csv` (AL-0010) |
