# LIN001 — Event Card: Proforma 2026-09-04

> **SUPERSEDED 2026-09-06.** This proforma posted to ERP as **invoice 52949 / DN#24817**. See `LIN001_event_DN24817.md` for the resolved event — the deposit-vs-refill question below is answered there (signed delivery note confirms no 9kg cylinders were returned; the deposit charge is legitimate, not a posting error). This file is kept for the proforma-stage history only.

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD
**Reference:** Proforma invoice, LIN001, dated 2026-09-04
**Status:** **Superseded — see `LIN001_event_DN24817.md`**

---

## Documents

| Part | Doc | Date | Amount |
|---|---|---|---:|
| Invoice | Proforma (no ERP doc_no) | 2026-09-04 | R16,291.80 |
| Credit note | N/A — pure LPG refill | — | R0.00 |
| Delivery note | **MISSING** | — | *(gap)* |
| Payment 1 | EXT-2949387151 | 2026-09-04 | R13,416.80 |
| Payment 2 | EXT-2950393933 | 2026-09-04 | R690.00 |

**Line detail:** 70 × 9kg LPG refill (no cylinder deposit line — refill on existing stock, consistent with a pure gas-only event).

---

## Why this event is open

1. **No delivery note.** Every other event in this register carries a DN# proof (in the ERP `description` field of the invoice/CN). This proforma has none — it has not been converted to an ERP invoice yet, so there is no `doc_no`, `ref_no`, or `description` to check against `transaction_headers`. Confirmed: no LIN001 invoice/CN posted on 2026-09-04 in ERP matching R16,291.80.
2. **Short-paid.** Two bank receipts total R14,106.80 against a R16,291.80 proforma.

```
R16,291.80  proforma (70×9kg LPG refill)
− R13,416.80  EXT-2949387151
− R690.00     EXT-2950393933
────────────
= R2,185.00  short-paid — event open
```

---

## Payment matching

Both payment references (`EXT-2949387151`, `EXT-2950393933`) were checked against `transaction_headers` for account_no LIN001 and are **not present** as ERP `Payment` entries — same as the other `EXT-` references in this register (they are bank-side receipts, not yet posted to ERP). This is expected: with no ERP invoice posted for the proforma either, there is nothing in ERP for a payment to post against yet.

---

## Customer-asserted cylinder credit (WhatsApp, not applied)

A parallel workspace (`cursor/lin001-fresh-allocation-bb32`, `analysis/debtors/shared/reports/LIN001_event_2026-09-04_proforma.md`) is tracking a customer WhatsApp claim netting a R2,875.00 cylinder-return balance off this proforma (paid R13,416.80 instead of R16,291.80). Full detail lives there; summary and correction here for cross-reference.

**Correction to an earlier citation (2026-09-04):** an earlier round of this analysis (both branches) argued the credit "cannot net against this invoice — per Rule 3 (Debt Partitioning) / Rule 4 (Asset Write-Off)" in `business_rules.md`. On review, that overstates what those rules say. Rule 3/4 govern how **payments** are pooled and how a **quarantined cylinder payment** writes off physical custody in the retrospective statement-building process — they don't address whether a credit note for a returned cylinder may net against a cash invoice. Citing them as a direct prohibition was an overclaim; corrected on both branches.

**What actually distinguishes this case, on inspection of LIN001's own invoice structure:** LIN001's regular DN# events (22630, 22936, 23974, 24947 — this register) already combine LPG and CYL lines on **one invoice**, netted against **one CN**, at the delivery-event level — e.g. invoice 52924 (DN#24947) carries LPG gas-fill lines (D.4/S.4/1401/1901) and CYL deposit lines (14.1/S.1/19.1/D.1) together, and CN 15592 reverses the deposit side of that same event. That combined-document netting is this customer's **normal, established pattern** — not something requiring a special "netting customer" lane.

The proforma is different in kind, not just degree: it is a **pure LPG invoice with zero CYL lines of its own** (70×9kg refill, no deposit line at all), and the customer's claimed credit is sourced from **outside this document** — an unconfirmed physical return, asserted informally (WhatsApp), not from this invoice's own CN. That is cross-event, out-of-document netting, which is a different and materially riskier operation than LIN001's routine same-invoice LPG+CYL combination. **This is the actual basis for holding the shortfall open (Scenario A) — not a blanket rule against mixing LPG and CYL, which this customer's own invoices do routinely and legitimately.**

**On a separate netting "lane" for LIN001:** not needed, and not yet — the existing per-event model (`event_net = invoice gross + CN gross`, already mixing LPG+CYL where the source documents do) already handles this customer's normal pattern correctly by construction. What would need a lane/flag is a *different* thing: a policy for whether self-asserted, out-of-document credit claims may ever be accepted against an unrelated invoice — and the answer to that, independent of which customer, should stay "no, not without a posted CN and an explicit allocation decision," per the physical-count/CN-first logic already recommended for this event.

---

## Outstanding items (operator action required)

| # | Item | Owner |
|---|---|---|
| 1 | Supply the delivery note number (DN#) for this delivery | Operator |
| 2 | Confirm whether the R2,185.00 shortfall will be paid, or whether the proforma amount itself needs correction | Operator |
| 3 | Confirm timing of ERP invoice posting (currently proforma-only) | Operator / ERP capture |

---

## Evidence

| Item | Status |
|---|---|
| Proforma invoice image | **GAP** — `LIN001_proforma_invoice_2026-09-04.jpg` referenced but not yet uploaded to this repo |
| Bank receipt images | **GAP** — `LIN001_payment_receipt_13416.80_2026-09-04.jpg`, `LIN001_payment_receipt_690_2026-09-04.jpg` referenced but not yet uploaded to this repo |
| ERP invoice/CN | **GAP** — no matching document found in `transaction_headers` |

---

*Internal workspace artifact — `analysis/debtors/LIN001/docs/LIN001_event_2026-09-04_proforma.md`*
