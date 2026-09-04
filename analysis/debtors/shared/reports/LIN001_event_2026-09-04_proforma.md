# LIN001 — Event 2026-09-04 (Proforma, no DN# yet)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD  
**Proof of event:** **MISSING** — no delivery note (DN#) provided; only a **proforma invoice**  
**Status:** **Open — short-paid** (pending DN# and/or credit application)

---

## Four parts (incomplete)

| Part | Doc / ref | Date | Amount | Confidence |
|---|---|---:|---:|---|
| **Invoice** | Proforma (LIN001) | 2026-09-04 | R16,291.80 | ASSERTED (image only — not in Supabase) |
| **Credit note** | **N/A** | — | R0.00 | N/A — no cylinder-deposit lines on this order |
| **Delivery note** | **MISSING** | — | *(no DN# supplied)* | **GAP** |
| **Payment** | Two receipts (below) | 2026-09-04 | R14,106.80 | ASSERTED |

**Event net (no CN):** **R16,291.80**

---

## Invoice detail (proforma — not yet in ERP)

| Field | Value |
|---|---|
| Customer | LIN001 |
| Reference | LIN001 |
| Supply | LPG Refills — Delivered |
| Line | 9kg LPG Refill × 70 @ R232.74 |
| Total LPG | 630kg |
| Price basis | R25.86/kg incl. VAT |
| Delivery | Included |
| **Total payable** | **R16,291.80 incl. VAT** |

**No cylinder deposit lines** — pure refill order, so no credit note is structurally expected (unlike the DN#22630–24947 events, which all had CYL deposit + CN pairs).

**Not yet posted to Supabase** — this is a **proforma**, ahead of the ERP invoice/DN# being raised.

---

## Payments (two receipts, operator bank)

| Doc | Date | Amount | Reference | Transaction ID |
|---|---|---:|---|---|
| EXT-2949387151 | 2026-09-04 11:17 | R13,416.80 | happy 9.4 | 2949387151 |
| EXT-2950393933 | 2026-09-04 15:09 | R690.00 | happy | 2950393933 |
| **Total** | | **R14,106.80** | | |

Both: New Champion Supermarket → Bella Energy Services300 (GSRH1V).

**Receipts:**
- `/opt/cursor/artifacts/LIN001_payment_receipt_13416.80_2026-09-04.jpg`
- `/opt/cursor/artifacts/LIN001_payment_receipt_690_2026-09-04.jpg`
- Proforma: `/opt/cursor/artifacts/LIN001_proforma_invoice_2026-09-04.jpg`

---

## Closure attempt

```
R16,291.80  proforma invoice (event net — no CN)
− R14,106.80  payments received (R13,416.80 + R690.00)
────────────
= R2,185.00  short-paid
```

**Event NOT closed** — short by **R2,185.00**.

### Possible resolutions (not operator-confirmed)

1. **Apply prior surplus credit** — R67,287.08 aggregate credit exists across DN#22630–24947 (see `LIN001_balance_bridge_2026-06_2026-09.md`); R2,185.00 could be drawn from that pool. **ASSUMED — not directed by operator.**
2. **Await DN#** — this is a proforma; the physical delivery note may not yet exist. Event may remain **pending** until DN# is raised and reconciled against ERP.
3. **Additional payment expected** — R2,185.00 may follow as a third receipt.

---

## Gaps

| Gap | Detail |
|---|---|
| **No delivery note (DN#)** | Required proof of event per model — not supplied |
| **Not in Supabase** | Proforma stage — no ERP `transaction_headers` row yet |
| **Short-paid R2,185.00** | Two payments total R14,106.80 vs invoice R16,291.80 (before considering customer's cylinder-credit claim below) |

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

### Can a cylinder-return credit net against this invoice? — **No, by rule, not just by caution**

Per `analysis/debtors/shared/docs/business_rules.md`:
- **Rule 3 (Debt Partitioning):** the debt must be split into two ledgers — purely **LPG Gas Debt** and purely **Cylinder (CYL) Deposit Debt**.
- **Rule 4 (Asset Write-Off):** cylinder deposit settlement is handled as its own physical/financial write-off against the CYL ledger, not folded into gas revenue.

This proforma is a **pure 9kg-gas line with zero deposit lines** — an **LPG-ledger** event. A cylinder return, once physically confirmed, is a **CYL-ledger** CN against the standard deposit SKU/rate. **It should post there, reducing custody debt — not be subtracted by the customer from an unrelated cash invoice before paying.** If the resulting CYL credit is later applied toward the open R2,185.00 LPG shortfall, that is a **separate, explicit allocation call** (same category as the still-unapplied R67,287.08 pool) — it does not happen by default.

### Two possible closure scenarios (still not resolved — now correctly framed)

| Scenario | Logic | Result |
|---|---|---|
| **A — Reject customer's credit** (current standing position, doctrinally correct per Rule 3/4 regardless of physical count) | Full invoice R16,291.80 stands; both payments (R13,416.80 + R690.00 = R14,106.80) apply | **Short-paid R2,185.00** |
| **B — Accept customer's credit** (would require an explicit operator allocation decision, on top of physical confirmation) | R16,291.80 − R2,875.00 = R13,416.80 net payable; that was paid in full | Fully settled; R690.00 second payment becomes a pure overpayment |

Note the two scenarios reconcile with each other exactly: **R2,875.00 (customer's claimed credit) − R690.00 (2nd payment) = R2,185.00** (the shortfall). This is a coincidence of arithmetic, not evidence that Scenario B is correct.

**Recommendation:** Treat this as **Scenario A** by default (ledger separation is a standing business rule, not a case-by-case judgment call). Hold the event open. Obtain a physical goods-returned slip for whichever cylinder return(s) actually happened; once confirmed, post it as its own CYL-ledger CN; only then consider — as a separate, explicit allocation decision — whether any resulting credit should offset the R2,185.00 LPG shortfall.

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
