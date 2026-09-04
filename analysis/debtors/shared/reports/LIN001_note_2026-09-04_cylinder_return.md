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

## Two independent, unconfirmed cylinder-return claims (corrected 2026-09-04, live ERP re-check)

A WhatsApp chat with the customer (Jack Lin), timestamped 2026-09-04 11:18–11:20, separately describes **"50 empty bottles"** valued at **R25,875.00** (= 50 × R517.50, the **9kg** deposit rate — not 48kg). See full analysis in `LIN001_event_2026-09-04_proforma.md` § "Customer-asserted cylinder credit."

An earlier version of this note treated the operator's "8×48kg" report and the customer's "50×9kg" claim as **contradictory versions of one event**. That framing has been retracted after a live Supabase re-check by the operator:

- **ERP shows nothing posted for LIN001 cylinders after 2026-09-02** — neither claim is confirmable either way.
- **The last CN (15592, 2026-09-02, already fully spent into the closed DN#24947 event) is a full five-SKU deposit-only CN** (9.1 ×80, D.1 ×4, S.1 ×1, 14.1 ×21, 19.1 ×12; sum −R69,000.00 matches header exactly) — see `LIN001_event_DN24947.md`. This account routinely moves both 9kg and 48kg cylinders, so a customer returning different sizes on different days is not inherently contradictory.
- The customer's 9kg/R517.50 rate match is **not diagnostic** — it's the standard rate, and this exact SKU/rate pair was already moved in CN 15592 two days earlier. The likelier explanation is the customer **conflating the already-settled Sept 2 batch** with a claimed Sept 4 return, not a genuinely new fact.

**Correct framing:** these are **two independent, unconfirmed claims**, not two versions of one event. Resolving which (if either) is real requires a **physical count** (driver/warehouse goods-returned slip) — ERP has nothing to arbitrate with, since it's silent after Sept 2.

**Regardless of which count is confirmed:** any confirmed cylinder return should post as its own CN before being applied anywhere. **Correction (2026-09-04):** this was previously cited as following directly from `business_rules.md` Rule 3 (Debt Partitioning) / Rule 4 (Asset Write-Off) — that overstated the rules, which govern payment pooling and quarantined-payment write-offs, not CN-to-invoice netting. The real reason: LIN001's own DN# events already net LPG and CYL together on one document routinely (invoice 52924 + CN 15592, see `LIN001_event_DN24947.md`), so there's no general prohibition on mixing them here — the objection is specifically that this claim has no source CN or confirmed physical count, not that LPG and CYL may never net. See `LIN001_event_2026-09-04_proforma.md` for the corrected argument.

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
