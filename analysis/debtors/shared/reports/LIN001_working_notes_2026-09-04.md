# LIN001 — Slindokuhle Enterprises
## Debtor reconciliation working notes (2026-09-04)

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD  
**Lane (portfolio triage):** `position_recon` · Tier C  
**Source of truth for this note:** Supabase `transaction_headers` + operator manual allocation session

**Consolidated register:** [`LIN001_events_consolidated_2026-06_2026-09.md`](LIN001_events_consolidated_2026-06_2026-09.md) · [`LIN001_events_consolidated_2026-06_2026-09.csv`](LIN001_events_consolidated_2026-06_2026-09.csv)

---

## 1. Scaffold status

- **No** dedicated ERP account TXT export in repo
- **Scaffold opened** `analysis/debtors/LIN001/` (2026-09-04) — events config + `project.json`
- Supabase holds ~732 header rows all-time; scoped automated pass used **2025-03-01 → 2026-02-28**

---

## 2. Fresh allocation pass (automated, best-effort)

**Script:** `analysis/debtors/shared/scripts/lin001_fresh_allocation.mjs`  
**Output:** `analysis/debtors/shared/reports/LIN001_fresh_allocation_2025-03_2026-02.csv`

| Metric | Result |
|---|---:|
| Invoices | 47 |
| Credit notes matched | 51 / 51 (`CN_REFNO`) |
| Payment docs | 37 |
| Payment→invoice edges | 48 |
| Fully unallocated payments | 2 |
| Partial payment residuals | 2 |
| Unverified residual total | R164,733.59 |

**Not canonical pipeline** — ignored header tags, used header totals (LPG+CYL), amount-only payment matching with FIFO partial fallback.

---

## 3. Event model (operator)

An **event** is a closed delivery cycle with **four parts**:

| Part | Role |
|---|---|
| **Invoice** | Charges for the delivery (LPG + cylinder deposits) |
| **Credit note** | Empty-cylinder returns credited against the invoice |
| **Delivery note (DN#)** | **Proof of the event** — ties invoice, CN, and payment to one physical delivery |
| **Payment** | Cash that settles the event net |

Reconciliation proceeds **event-by-event**. An event is not closed until all four parts are named and the net balances.

**Event net** = invoice total − credit note total (header basis, LPG + CYL).

---

## 4. Event register — Jun–Sep 2026 (PROVEN structure)

**Generator:** `analysis/debtors/shared/scripts/lin001_event_register.mjs`  
**Output:** `analysis/debtors/shared/reports/LIN001_event_register_2026-06_2026-09.csv`

| Event (DN#) | Date | Invoice | Credit note | Event net | Payment status |
|---|---:|---:|---:|---:|---|
| **22630** | 2026-06-08 | 51132 | 15039 | **R64,900.69** | ASSUMED — PC-76-32 batch |
| **22508** | 2026-06-18 | 51268 | 15086 | **R0.00** | Closed — zero-net (CN full offset) |
| **22936** | 2026-07-08 | 51681 | 15215 | **R53,951.69** | **Closed** — EXT-2744666881 ([detail](LIN001_event_DN22936.md)) |
| **23974** | 2026-08-24 | 52768 | 15543 | **R30,207.80** | **Closed** — EXT-2901239645 ([detail](LIN001_event_DN23974.md)) |
| **24947** | 2026-09-02 | 52924 | 15592 | **R5,433.70** | **Closed** — 45961 ([detail](LIN001_event_DN24947.md)) |
| **Proforma 09-04** | 2026-09-04 | — | — | **R16,291.80** | **Open — short-paid R2,185.00**, no DN# ([detail](LIN001_event_2026-09-04_proforma.md)) |

**Payment pool (Mar–Sep 2026, PROVEN in Supabase unless noted):**

| Doc | Date | Amount | Batch | Notes |
|---|---|---:|---|---|
| **44482** | 2026-05-08 | R75,844.50 | PC-76-31 | SPEEDP |
| **44974** | 2026-06-06 | R40,590.60 | PC-76-32 | SPEEDP |
| **44975** | 2026-06-07 | R63,325.00 | PC-76-32 | TRANSF |
| **EXT-2744666881** | 2026-07-03 | R54,981.36 | Lin001 7.3 13991 | External bank — DN#22936 |
| **EXT-2901239645** | 2026-08-22 | R34,721.00 | HAPPY 8.22 | External bank — DN#23974 |
| **45961** | 2026-09-01 | R28,163.00 | PC-76-35 | SPEEDP — DN#24947 (fully allocated) |

---

## 5. Manual event closure — Jun–Sep 2026

### Event DN#22936 — closed (operator bank receipt)

**Detail:** `LIN001_event_DN22936.md` · **Config:** `analysis/debtors/LIN001/config/events.json`

| Part | Doc / ref | Date | Amount |
|---|---|---:|---:|
| Invoice | **51681** | 2026-07-08 | R134,049.19 |
| Credit note | **15215** → 51681 | 2026-07-08 | R-80,097.50 |
| Delivery note | **DN#22936** | — | *(proof)* |
| Payment | **EXT-2744666881** | 2026-07-03 | R54,981.36 |
| **Event net** | | | **R53,951.69** |

**Receipt ref `Lin001 7.3 13991`** matches invoice **order_no 13991** (PROVEN link).

```
R54,981.36  external payment EXT-2744666881
− R53,951.69  event net (51681 − 15215)
───────────
= R1,029.67  surplus → credit carry (target TBD)
```

**Event DN#22936 → closed.**

**Receipt:** `/opt/cursor/artifacts/LIN001_payment_receipt_DN22936_2026-07-03.jpg`

Prior ASSUMED split (44482 + carry from DN#22630) **withdrawn**.

### Event DN#22630 — ASSUMED payment (PC-76-32)

```
44974  R40,590.60
44975  R24,310.09  (partial — completes event net)
──────────────────
       R64,900.69  event net

44974 + 44975 total R103,915.60 − R64,900.69 = R39,014.91 credit surplus (unallocated — DN#22936 paid separately)
```

### Event DN#22508 — PROVEN zero-net

Invoice and CN both **R132,862.38** — net **R0.00**. No payment leg required. **Closed.**

### Event DN#23974 — closed (operator bank receipt)

**Detail:** `LIN001_event_DN23974.md` · **Config:** `analysis/debtors/LIN001/config/events.json`

| Part | Doc / ref | Date | Amount |
|---|---|---:|---:|
| Invoice | **52768** | 2026-08-24 | R69,652.80 |
| Credit note | **15543** → 52768 | 2026-08-24 | R-39,445.00 |
| Delivery note | **DN#23974** | — | *(proof)* |
| Payment | **EXT-2901239645** | 2026-08-22 | R34,721.00 |
| **Event net** | | | **R30,207.80** |

```
R34,721.00  external payment EXT-2901239645
− R30,207.80  event net (52768 − 15543)
───────────
= R4,513.20  bank-receipt surplus (PROVEN math)

Operator applies **R22,729.30** credit carry to DN#24947 via payment 45961 — **R18,216.10** of that carry is **not reconciled** to DN#23974 payment proof alone.
```

**Line mix (PROVEN):** 10×14kg, 10×19kg, 20×48kg SV + 3×48kg SV single — LPG + deposits.

**Event DN#23974 → closed.**

**Receipt:** `/opt/cursor/artifacts/LIN001_payment_receipt_34721_2026-08-22.jpg`

### Event DN#24947 — closed (payment 45961)

**Detail:** `LIN001_event_DN24947.md` · **Config:** `analysis/debtors/LIN001/config/events.json`

| Part | Doc / ref | Date | Amount |
|---|---|---:|---:|
| Invoice | **52924** | 2026-09-02 | R74,433.70 |
| Credit note | **15592** → 52924 | 2026-09-02 | R-69,000.00 |
| Delivery note | **DN#24947** | — | *(proof)* |
| Payment | **45961** | 2026-09-01 | R28,163.00 |
| **Event net** | | | **R5,433.70** |

**Payment (PROVEN — Supabase):** SPEEDP · batch **PC-76-35**

```
R28,163.00  payment 45961
− R5,433.70  event net (52924 − 15592)
───────────
= R22,729.30  credit from DN#23974 (operator)
```

**Line mix (PROVEN):** 20×14kg, 5×19kg, 10×48kg DV + 10×48kg SV — LPG + deposits.

**Event DN#24947 → closed.** Payment 45961 fully allocated per operator.

> **Carry gap resolved by balance bridge:** see `LIN001_balance_bridge_2026-06_2026-09.md`. Payment 45961 alone fully funds DN#24947's event net **and** its R22,729.30 surplus — no external source required. The DN#23974→24947 carry narrative is a valid attribution choice, not a required one; the aggregate credit position ties either way.

### Event 2026-09-04 (Proforma) — open, short-paid, no DN#

**Detail:** `LIN001_event_2026-09-04_proforma.md`

| Part | Ref | Amount |
|---|---|---:|
| Invoice | Proforma (LIN001) | R16,291.80 |
| Credit note | N/A — pure LPG refill, no CYL lines | R0.00 |
| Delivery note | **MISSING** | *(gap)* |
| Payment | EXT-2949387151 + EXT-2950393933 | R14,106.80 |
| **Event net** | | | **R16,291.80** |

```
R16,291.80  proforma invoice (70×9kg LPG refill)
− R14,106.80  payments (R13,416.80 + R690.00)
────────────
= R2,185.00  short-paid
```

**Not closed.** No DN# supplied; not yet in Supabase (proforma stage). R2,185.00 shortfall could draw on the R67,287.08 surplus pool from the five ERP events, but this is **not operator-directed**.

**Receipts:** `/opt/cursor/artifacts/LIN001_payment_receipt_13416.80_2026-09-04.jpg`, `/opt/cursor/artifacts/LIN001_payment_receipt_690_2026-09-04.jpg`, `/opt/cursor/artifacts/LIN001_proforma_invoice_2026-09-04.jpg`

### Cylinder return — 8 × 48kg empties (2026-09-04) — pending

**Detail:** `LIN001_note_2026-09-04_cylinder_return.md`

Operator reports **8 × 48kg empty cylinders returned**. Not a line item on the same-day proforma (which is pure 9kg refill, no 48kg, no CN lines) — this is a separate custody/deposit matter, most plausibly tied to the earlier DN#24947 delivery (20×48kg out), but **unconfirmed**.

```
8 × R1,207.50 (ERP standard 48kg deposit rate, DV=SV) = R9,660.00  estimated credit
```

> ⚠ **Conflicts with the WhatsApp claim below** — cannot both be the real return (8 vs 50 units, 48kg vs 9kg).

### Customer-asserted cylinder credit — WhatsApp, Jack Lin (2026-09-04 11:18–11:20) — **not accepted; corrected 2026-09-04**

**Detail:** `LIN001_event_2026-09-04_proforma.md` § "Customer-asserted cylinder credit" · **Chat:** `/opt/cursor/artifacts/LIN001_whatsapp_jacklin_2026-09-04_bottle_credit.jpg`

Customer claims: 50 empty bottles returned this time worth **R25,875** (= 50 × R517.50, **9kg** rate) vs **R28,750** "last time" (= 50 × R575.00, **14kg** rate) → balance **R2,875**, netted off the invoice → pays **R13,416.80**.

**Rate math is PROVEN** against our own ERP standard deposit rates (517.50 for 9kg, 575.00 for 14kg — both exact) and **ties exactly** to the actual payment received (EXT-2949387151, R13,416.80) and to our own R2,185.00 shortfall figure (R2,875.00 − R690.00 = R2,185.00 exactly). But the rate match is **not diagnostic** — see correction below.

**Correction (operator, live Supabase re-check 2026-09-04):** Supabase was unreachable in the earlier turn (this agent); the operator re-queried it directly. Findings:
- **ERP shows nothing posted for LIN001 cylinders after 2026-09-02** — neither the 8×48kg (operator) nor 50×9kg (customer) claim is confirmable either way.
- **CN 15592** (2026-09-02, already fully spent into the closed DN#24947 event) is a **full five-SKU deposit-only CN** (9.1 ×80, D.1 ×4, S.1 ×1, 14.1 ×21, 19.1 ×12; `SUM(line_total) = −R69,000.00` matches header exactly — PROVEN, operator complete pull). It has nothing left over.
- **Retracted the "cannot both be true" framing.** This account routinely moves both 9kg and 48kg cylinders (DN#24947 itself did, two days earlier). The 8×48kg and 50×9kg claims are **two independent, unconfirmed claims**, not competing versions of one event.
- The customer's 9kg/R517.50 match is **not surprising** — it's the standard rate, and that exact SKU/rate pair was already used in the (now fully-spent) Sept 2 CN. The likelier read is the customer **conflating that already-settled batch** with a claimed Sept 4 return.
- **Neither claim is ERP-confirmable as of this check.** Resolving which (if either) reflects a real Sept 4 return needs a **physical goods-returned slip**, not further ledger analysis.

**Why it can't net against this invoice regardless — by rule, not just caution:** per `analysis/debtors/shared/docs/business_rules.md` Rule 3 (Debt Partitioning) and Rule 4 (Asset Write-Off), LPG gas debt and CYL deposit debt sit in **separate ledgers**. This proforma is pure LPG (zero deposit lines) — a confirmed cylinder return posts as its own **CYL-ledger** CN and does not offset an unrelated LPG cash invoice by default. Applying a resulting credit here would be a **separate, explicit allocation call**.

**Two scenarios (Scenario A is now the doctrinally-correct default, independent of which physical count is eventually confirmed):**

| Scenario | Result |
|---|---|
| **A — reject credit (default per Rule 3/4)** | Short-paid **R2,185.00** |
| B — accept credit (would require an explicit operator allocation decision on top of physical confirmation) | Fully settled; R690.00 second payment becomes pure **overpayment** |

Recorded as `customerAssertedCredit` on the proforma event in `events.json` — **not applied**. Event remains open pending a physical goods-returned slip and, separately, an explicit operator allocation decision.

### ⚠ Branch collision flagged (2026-09-04)

A separate branch, **`claude/lin001-delivery-events-xb8nt7`**, independently built overlapping LIN001 delivery-event scaffolding (its own `events.json`, event cards, balance bridge, consolidated register) under `analysis/debtors/LIN001/docs/` — a different path from `analysis/debtors/shared/reports/` used on this branch (`cursor/lin001-fresh-allocation-bb32`). Both branches touch LIN001 concurrently. **Do not merge either without reconciling the two** — flagged to the operator for branch/ownership deconfliction.

**Pending** — no ERP CN doc yet, target invoice unconfirmed, DV/SV split unspecified. **Not applied** to any event or pool total; recorded as `pendingCreditNotes` in `analysis/debtors/LIN001/config/events.json` for operator disposition.

---

## 6. Balance bridge (PROVEN aggregate tie-out)

**Full detail:** `LIN001_balance_bridge_2026-06_2026-09.md` · **Data:** `analysis/debtors/LIN001/config/balance_bridge_lines.json`

```
Total event net (5 ERP deliveries + proforma)   R170,785.68
Total payments (all sources)                    R235,887.76
─────────────────────────────────────────────
Net credit position                              R65,102.08  (customer overpaid, net of R2,185 proforma shortfall)
```

This **R67,287.08 credit from the 5 ERP events is PROVEN** by direct arithmetic — it ties whether or not any specific event-to-event carry story (e.g. DN#23974→24947) is used. Layering in the open proforma event (short-paid R2,185.00, no DN#) nets the position to **R65,102.08**.

---

## 7. Unallocated cash / credit

| Pool | Amount | Status |
|---|---:|---|
| **44482** (PC-76-31) | R75,844.50 | ASSUMED — fully unallocated |
| **DN#22630** surplus (PC-76-32) | R39,014.91 | ASSUMED |
| **DN#22936** surplus (EXT-2744666881) | R1,029.67 | ASSERTED |
| **Total surplus (bridge-tied, 5 ERP events)** | **R67,287.08** | **PROVEN** |
| **Proforma 2026-09-04 shortfall** | **(R2,185.00)** | **ASSERTED — event open** |
| **Net position after proforma** | **R65,102.08** | **PROVEN** |

---

## 8. Open questions

1. Confirm **44974/44975** allocation to DN#22630 — batch PC-76-32 timing fits, amounts ASSUMED.
2. **Proforma 2026-09-04:** raise/name the DN# and post to ERP; resolve R2,185.00 shortfall (apply surplus credit, or await 3rd payment).
3. **Which cylinder return is real (2026-09-04)?** 8×48kg (~R9,660, operator-reported) vs 50 bottles at 9kg rate (R25,875, customer WhatsApp claim, net R2,875 balance) — these conflict and cannot both be the same event. Confirm the actual physical return, target invoice/DN#, and whether any resulting credit may be netted against the proforma's cash invoice or must be tracked separately as custody debt.
4. Where does the **R65,102.08** aggregate net credit apply going forward — next delivery, refund, or held as float?
5. Target for **R75,844.50** on 44482 — separate from the event bridge; still fully unallocated.
6. Canonical allocation lane rerun for Mar–Feb open items?

---

## 9. Artifacts

| Artifact | Path |
|---|---|
| **Balance bridge (6 events)** | `LIN001_balance_bridge_2026-06_2026-09.md` |
| **Consolidated events (Jun–Sep)** | `LIN001_events_consolidated_2026-06_2026-09.md` / `.csv` |
| Allocation CSV (Mar–Feb) | `analysis/debtors/shared/reports/LIN001_fresh_allocation_2025-03_2026-02.csv` |
| Event register (Jun–Sep) | `analysis/debtors/shared/reports/LIN001_event_register_2026-06_2026-09.csv` |
| Manual event closure (Jun–Sep) | `analysis/debtors/shared/reports/LIN001_manual_allocation_2026-06_2026-09.csv` |
| Event register script | `analysis/debtors/shared/scripts/lin001_event_register.mjs` |
| Fresh allocation script | `analysis/debtors/shared/scripts/lin001_fresh_allocation.mjs` |
| **Event DN#22936 card** | `analysis/debtors/shared/reports/LIN001_event_DN22936.md` |
| **Event DN#23974 card** | `analysis/debtors/shared/reports/LIN001_event_DN23974.md` |
| **Event DN#24947 card** | `analysis/debtors/shared/reports/LIN001_event_DN24947.md` |
| **Event proforma 2026-09-04 card** | `analysis/debtors/shared/reports/LIN001_event_2026-09-04_proforma.md` |
| **Cylinder return note (8×48kg, 2026-09-04)** | `analysis/debtors/shared/reports/LIN001_note_2026-09-04_cylinder_return.md` |
| **LIN001 events config** | `analysis/debtors/LIN001/config/events.json` |
| **LIN001 balance bridge config** | `analysis/debtors/LIN001/config/balance_bridge_lines.json` |
| Bank receipt (DN#22936) | `LIN001_payment_receipt_DN22936_2026-07-03.jpg` |
| Bank receipt (DN#23974) | `LIN001_payment_receipt_34721_2026-08-22.jpg` |
| Proforma invoice (2026-09-04) | `LIN001_proforma_invoice_2026-09-04.jpg` |
| Payment receipt R13,416.80 (2026-09-04) | `LIN001_payment_receipt_13416.80_2026-09-04.jpg` |
| Payment receipt R690.00 (2026-09-04) | `LIN001_payment_receipt_690_2026-09-04.jpg` |

**Epistemic tags:** PROVEN (Supabase event structure), ASSERTED (operator-confirmed closures), ASSUMED (payment splits / carry chain).
