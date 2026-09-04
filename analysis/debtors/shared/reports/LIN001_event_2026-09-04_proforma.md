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

## Customer-asserted cylinder credit (WhatsApp, 2026-09-04 11:18–11:20)

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

The customer is using our **actual SKU deposit rates**, not arbitrary numbers — the arithmetic is internally consistent and ties to the exact payment received.

### Where I disagree / need confirmation — **do not treat as settled without operator sign-off**

1. **Direction of the credit is backwards on its face.** If "this time's" 50 returned bottles (R25,875, presumably 9kg) are worth *less* than "last time's" 50 (R28,750, presumably 14kg — a different cylinder size, not a shortfall on the same size), the R2,875 gap should represent an **outstanding cylinder-deposit debt** the customer still owes us (they've under-returned value relative to some baseline) — not a **credit that reduces a same-day, unrelated LPG cash invoice**. The customer has flipped the sign in their own favor. I have no independent basis (no CN doc, no custody ledger visibility this session) to confirm which direction is correct.
2. **Conflicts with the previously logged fact this same session:** `LIN001_note_2026-09-04_cylinder_return.md` records **"8 × 48kg empties returned"** (operator-reported, ~R9,660 estimated value at R1,207.50/cyl). This WhatsApp describes **50 bottles** at a **9kg-implied rate** (R517.50/cyl). These cannot both describe the same physical return — 8 ≠ 50, and 48kg ≠ 9kg. **Needs clarification: which is the real return, or are these two separate events?**
3. **"Last time" R28,750 baseline is customer-asserted, unverified.** No prior CN/invoice in our LIN001 records has been checked against this figure — Supabase was unreachable this session (`DATABASE_URL` connection refused), so this could not be cross-checked against `transaction_items`.

### Two possible closure scenarios (not yet resolved)

| Scenario | Logic | Result |
|---|---|---|
| **A — Reject customer's credit** (as I originally recorded) | Full invoice R16,291.80 stands; both payments (R13,416.80 + R690.00 = R14,106.80) apply | **Short-paid R2,185.00** — matches original analysis |
| **B — Accept customer's credit** | R16,291.80 − R2,875.00 credit = R13,416.80 net payable; that was paid in full | **Fully settled**, and the second payment (R690.00) becomes a **pure overpayment/surplus**, not a partial fill |

Note the two scenarios reconcile with each other exactly: **R2,875.00 (customer's claimed credit) − R690.00 (2nd payment) = R2,185.00** (our original shortfall). Neither scenario is "wrong" arithmetically — the open question is **which one is real**, which depends on resolving the 8×48kg-vs-50-bottles conflict and verifying the R28,750 baseline.

**Recommendation:** Hold this event as **open pending operator confirmation** of (a) the true cylinder return (8×48kg or 50×9kg — or both, if genuinely separate), and (b) whether a deposit-return shortfall may properly be netted against an unrelated cash invoice. Do not close the books on Scenario B without that confirmation.

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
