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
| **Short-paid R2,185.00** | Two payments total R14,106.80 vs invoice R16,291.80 |

---

## Artifacts

| Artifact | Path |
|---|---|
| Proforma invoice | `LIN001_proforma_invoice_2026-09-04.jpg` |
| Payment receipt (R13,416.80) | `LIN001_payment_receipt_13416.80_2026-09-04.jpg` |
| Payment receipt (R690.00) | `LIN001_payment_receipt_690_2026-09-04.jpg` |
| Events config | `analysis/debtors/LIN001/config/events.json` |
