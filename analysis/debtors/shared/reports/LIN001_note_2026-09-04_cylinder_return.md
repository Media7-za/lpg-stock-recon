# LIN001 — Cylinder return: 8 × 48kg empties (2026-09-04)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD  
**Reported:** 2026-09-04 (operator statement)  
**Status:** **Pending** — physical return noted; not yet posted as an ERP credit note

---

## What was reported

Operator states: **8 × 48kg empty cylinders returned.**

This is **not** a line item on the same-day proforma (`LIN001_event_2026-09-04_proforma.md`), which is a pure **9kg** refill order (70 × 9kg, no 48kg, no cylinder-deposit lines at all). The 48kg empties therefore relate to **custody outstanding from an earlier delivery**, not this proforma's SKU mix.

---

## Estimated deposit value

| Field | Value | Confidence |
|---|---:|---|
| Cylinders returned | 8 × 48kg | ASSERTED (operator statement) |
| DV/SV split | Not specified | — |
| ERP posted deposit rate (D.1 / S.1, both variants) | R1,207.50 / cyl incl. VAT | PROVEN — confirmed from JIM001, TWK002, WO0001, MD0003 CN/invoice lines (same rate for DV and SV) |
| **Estimated credit value** | **8 × R1,207.50 = R9,660.00** | **ASSUMED** — rate applied is the cross-account ERP standard; not yet confirmed by a LIN001-specific CN |

```
8 × R1,207.50 = R9,660.00  estimated cylinder-deposit credit
```

---

## Gaps

| Gap | Detail |
|---|---|
| **No ERP CN doc yet** | Not in Supabase — physical return reported, ERP credit note not yet raised/confirmed |
| **Target invoice unconfirmed** | Most likely candidate is **DN#24947** (invoice 52924 carried 10×48kg DV + 10×48kg SV = 20 cylinders out), but this is **not confirmed** — LIN001 may have older 48kg custody outstanding from before the Jun–Sep window this project covers |
| **DV vs SV not specified** | Doesn't change the total at current ERP rate (both R1,207.50), but matters for stock-side (DV/SV) custody tracking |
| **Does not offset the open proforma event** | Proforma (2026-09-04) has no 48kg lines — this credit is a separate custody/account matter, not a resolution to that event's R2,185.00 shortfall, unless the operator directs it to be applied there |

---

## Not yet actioned

This is recorded as an **operator statement pending reconciliation** — no CSV/config totals have been changed to reflect this R9,660.00 as a confirmed credit, since:
1. The target invoice/CN is unconfirmed.
2. The valuation rate is ASSUMED (cross-account standard, not LIN001-specific).
3. Applying it against any specific event (e.g. the open proforma, or DN#24947) is an allocation decision, not a derivation from data — reserved for operator direction.

---

## Artifacts

| Artifact | Path |
|---|---|
| This note | `LIN001_note_2026-09-04_cylinder_return.md` |
| Related open event | `LIN001_event_2026-09-04_proforma.md` |
| Prior event with 48kg lines | `LIN001_event_DN24947.md` |
