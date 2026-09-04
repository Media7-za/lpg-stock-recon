# LIN001 — Event 2026-09-04 (Proforma, no DN# yet)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD  
**Proof of event:** **MISSING** — no delivery note (DN#) provided; only a **proforma invoice** (LPG quote slice)  
**Status:** **Open** — reconstructed invoice includes CYL slice; CN not posted

---

## Four parts (incomplete)

| Part | Doc / ref | Date | Amount | Confidence |
|---|---|---:|---:|---|
| **Invoice (reconstructed)** | Proforma LPG + CYL dual-line | 2026-09-04 | **R52,516.80** | LPG ASSERTED / CYL ASSUMED |
| ↳ LPG slice | Proforma — 70×9kg @ R232.74 | 2026-09-04 | R16,291.80 | ASSERTED (quote image) |
| ↳ CYL slice | 70×9.1 @ R517.50 | 2026-09-04 | R36,225.00 | ASSUMED (Rule 5 — qty matches fills) |
| **Credit note** | **Forthcoming ERP** — 8×48kg @ R1,207.50 | 2026-09-04 | **R9,660.00** | ASSERTED (operator — not yet in ERP) |
| **Delivery note** | **MISSING** | — | *(no DN# supplied)* | **GAP** |
| **Payment** | Two receipts | 2026-09-04 | R14,106.80 | ASSERTED |

**Event net (invoice − forthcoming CN):** **R42,856.80**

The 8×48kg CN does **not** offset the 70×9.1 on the invoice (different SKU). Those 9kg deposits remain on this event until a 9.1 CN posts. Mixed-size same-document pattern matches CN 15592 on DN#24947.

---

## Invoice detail

The proforma **exposes the LPG slice only**, for quote purposes. Operator instruction 2026-09-04: add the cylinder slice to the invoice (same dual-line pattern as DN#22630–24947).

| Slice | SKU / line | Qty | Rate | Amount | Tag |
|---|---|---:|---:|---:|---|
| **LPG** | 9kg LPG Refill | 70 | R232.74 | **R16,291.80** | ASSERTED — proforma |
| **CYL** | 9.1 cylinder deposit | 70 | R517.50 | **R36,225.00** | ASSUMED — dual-line, ERP standard rate |
| **Invoice total** | | | | **R52,516.80** | reconstructed |

Total LPG weight 630kg · Price basis R25.86/kg incl. VAT · Delivery included.

**Not yet posted to Supabase.** CYL qty of 70 is inferred from the 70 fills — correct if this is a standard packed delivery; wrong if some cylinders are customer-owned refills with no deposit charge.

---

## Payments (two receipts, operator bank)

| Doc | Date | Amount | Reference | Transaction ID |
|---|---|---:|---|---|
| EXT-2949387151 | 2026-09-04 11:17 | R13,416.80 | happy 9.4 | 2949387151 |
| EXT-2950393933 | 2026-09-04 15:09 | R690.00 | happy | 2950393933 |
| **Total** | | **R14,106.80** | | |

Both: New Champion Supermarket → Bella Energy Services300 (GSRH1V).

---

## Closure attempt

```
R52,516.80  reconstructed invoice (LPG R16,291.80 + 9.1 R36,225.00)
− R 9,660.00  forthcoming CN (8 × 48kg @ R1,207.50)
────────────
= R42,856.80  event net

R42,856.80  event net
− R14,106.80  payments
────────────
= R28,750.00  shortage (no prior-event surplus applied)
```

With Event 3 running surplus R28,272.17 applied: shortage **R477.83**.

**70×9.1 deposits (R36,225.00) are not credited by this CN.** Event still open pending ERP posting of invoice + CN, DN#, and any 9kg empty-return CN.

---

## Gaps

| Gap | Detail |
|---|---|
| **No delivery note (DN#)** | Required proof of event per model — not supplied |
| **Not in Supabase** | Proforma stage — no ERP `transaction_headers` row yet |
| **Short-paid (reconstructed invoice)** | Payments R14,106.80 vs invoice R52,516.80 = **shortage R38,410.00** until a CYL CN posts |
| **LPG-slice cash shortfall** | Payments vs LPG quote R16,291.80 = **R2,185.00** |
| **CYL qty unconfirmed** | 70×9.1 is ASSUMED from fill qty — operator to confirm |

---

## Customer-asserted cylinder credit (WhatsApp, 2026-09-04 11:18–11:20) — **corrected 2026-09-04, live ERP re-check**

**Source:** WhatsApp chat with Jack Lin (customer contact) — screenshot in `/opt/cursor/artifacts/LIN001_whatsapp_jacklin_2026-09-04_bottle_credit.jpg`

**Customer's claim (verbatim):**
> "Last time the returned empty bottles were worth R28,750. This time your 50 empty bottles are worth 25,875. So I still have a balance of R2,875"
> "I deducted it directly, so I need to pay you 13,416"
> "16291.8-2875=R13416.8"

### Rate-math check (PROVEN against our own ERP standard rate card)

| Claim | Calculation | Matches our rate card? |
|---|---|---|
| "This time" 50 bottles = R25,875 | 50 × **R517.50** (9kg deposit rate, SKU 9.1) | ✅ Exact match |
| "Last time" 50 bottles = R28,750 | 50 × **R575.00** (14kg deposit rate, SKU 14.1) | ✅ Exact match |
| Balance = R2,875 | R28,750 − R25,875 | ✅ Arithmetic correct |
| Payment due = R13,416.80 | R16,291.80 − R2,875.00 | ✅ Arithmetic correct — matches receipt EXT-2949387151 exactly |

The customer is using our **actual SKU deposit rates**, not arbitrary numbers. But a live Supabase re-check (2026-09-04, operator-run — see below) shows this rate match is **not diagnostic of a new Sept 4 return**; it very plausibly traces to an already-closed Sept 2 document instead.

### Corrected picture — live Supabase re-check (2026-09-04)

Operator re-queried Supabase directly (this agent's earlier session could not — `DATABASE_URL` was unreachable then). Findings:

- **ERP shows nothing posted for LIN001 cylinders after 2026-09-02.** No new CN/return for either the "8×48kg" or "50×9kg" claim exists in the ledger as of this check.
- **The last CN is 15592** (2026-09-02, part of the already-closed DN#24947 event): a **full five-SKU deposit-only CN** (9.1 ×80, D.1 ×4, S.1 ×1, 14.1 ×21, 19.1 ×12; sum −R69,000.00 matches header exactly). See full breakdown in `LIN001_event_DN24947.md`.
- **CN 15592 is fully spent** — already netted into DN#24947's closed R5,433.70 event net. There is nothing left over from it to apply here.

**Revised read — retracting the earlier "cannot both be true" framing:**

The earlier version of this note treated the operator's "8×48kg" report and the customer's "50×9kg" WhatsApp claim as **competing versions of one event** (they can't both be true because the counts/sizes differ). That framing was too strong. Two things argue against it:

1. **This account routinely moves both cylinder sizes** — DN#24947 itself (Sept 2, two days prior) shipped 48kg *and* 14kg/19kg gas in the same delivery, and CN 15592 credited 9kg *and* 48kg deposits together. A customer returning empties of different sizes on different days is not inherently contradictory.
2. **The 9kg/R517.50 rate match is not surprising or diagnostic.** It's simply the standard ERP rate, and we already know this exact SKU/rate pair (80 × 9.1 @ R517.50) was moved on this account just two days earlier, in CN 15592. That's a reason to suspect the customer may be **misremembering or conflating the already-settled Sept 2 batch** with a new Sept 4 return — not a reason to trust the 50-unit figure as a fresh, independent fact.

**Correct framing: these are two independent, unconfirmed claims, not two versions of one event.** Neither is confirmable from ERP as of this check (silent since Sept 2). No amount of ledger analysis will settle which (if either) reflects a real Sept 4 return — **a physical count (driver/warehouse goods-returned slip) is required** for whichever claim(s) are real.

### Can a cylinder-return credit net against the LPG quote?

**Rule 3/4 overclaim retracted (a67f059):** those rules do not prohibit LPG+CYL on one invoice. LIN001 already does that routinely (invoice 52924 + CN 15592). No separate netting lane is needed.

**Operator 2026-09-04:** the proforma was LPG-quote only. Reconstructed invoice now **has** a CYL slice (70×9.1 @ R517.50 = R36,225.00). Confirmed empty returns belong as **this event's credit note**, offsetting that deposit slice — same as Events 1–3.

What still does **not** work: the customer subtracting R2,875 from the **LPG quote** before paying. That figure is not 70 units, and there is no posted CN.

- LPG slice R16,291.80 is the gas charge — payments apply here
- CYL slice R36,225.00 is deposit exposure — emptied cylinders post as CN against 9.1
- Customer's 50-bottle / R2,875 figure is neither 70 units nor a posted CN

**If a 70×9.1 CN later posts:** invoice R52,516.80 − CN R36,225.00 = **Balance R16,291.80** (the quote). Payments R14,106.80 leave **Shortage R2,185.00** on the LPG slice.

WhatsApp claim stays unapplied because it has **no source CN and no confirmed physical count** — not because LPG and CYL may never mix on this account.

---

## Artifacts

| Artifact | Path |
|---|---|
| Proforma invoice | `LIN001_proforma_invoice_2026-09-04.jpg` |
| Payment receipt (R13,416.80) | `LIN001_payment_receipt_13416.80_2026-09-04.jpg` |
| Payment receipt (R690.00) | `LIN001_payment_receipt_690_2026-09-04.jpg` |
| WhatsApp cylinder-credit chat | `/opt/cursor/artifacts/LIN001_whatsapp_jacklin_2026-09-04_bottle_credit.jpg` |
| Conflicting cylinder-return note | `LIN001_note_2026-09-04_cylinder_return.md` |
| Events config | `analysis/debtors/LIN001/config/events.json` |
