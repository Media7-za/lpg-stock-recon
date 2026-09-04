# LIN001 — Event DN#24947

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD  
**Proof of event:** delivery note **DN#24947**  
**Status:** **Closed** (2026-09-04)

---

## Four parts

| Part | Doc / ref | Date | Amount | Confidence |
|---|---|---:|---:|---|
| **Invoice** | **52924** | 2026-09-02 | R74,433.70 | PROVEN |
| **Credit note** | **15592** → 52924 | 2026-09-02 | R-69,000.00 | PROVEN |
| **Delivery note** | **DN#24947** | — | *(proof)* | PROVEN |
| **Payment** | **45961** | 2026-09-01 | R28,163.00 | ASSERTED |

**Event net:** **R5,433.70** (52924 − 15592)

**Payment detail (PROVEN — Supabase):** SPEEDP · batch **PC-76-35**

---

## Payment allocation (operator)

Payment **45961** relates to DN#24947. Short-paid on current net because of **overpayment credit from DN#23974**.

```
R28,163.00  payment 45961
− R5,433.70  event net (52924 − 15592)
───────────
= R22,729.30  credit from DN#23974 applied to this event
```

| Slice | Amount | Role |
|---|---:|---|
| 45961 → event net | R5,433.70 | Settles current delivery |
| Credit carry DN#23974 → DN#24947 | R22,729.30 | Prior-event overpayment credit |

**Event DN#24947 → closed.** Payment 45961 fully allocated.

---

## Line mix (PROVEN — `transaction_items`, doc 52924)

| SKU | Description | Qty |
|---|---|---:|
| 1401 | 14KG LPG PACKED | 20 |
| 14.1 | 14KG CYLINDER DEPOSIT | 20 |
| 1901 | 19KG LPG PACKED | 5 |
| 19.1 | 19KG CYLINDER DEPOSIT | 5 |
| D.4 | 48KG DV LPG - PACKED | 10 |
| D.1 | 48KG DV CYLINDER DEPOSIT | 10 |
| S.4 | 48KG SV LPG- PACKED | 10 |
| S.1 | 48KG SV CYLINDER DEPOSIT | 10 |

Mixed 14kg / 19kg / 48kg DV + SV — LPG fills + cylinder deposits.

**CN 15592 — corrected line detail (PROVEN, live Supabase pull 2026-09-04, superseding the earlier "deposit credits only" assumption):**

| SKU | Description | Qty | Rate (incl. VAT) |
|---|---|---:|---:|
| 9.1 | 9kg cylinder deposit | 80 | R517.50 |
| D.1 | 48kg DV cylinder deposit | 4 | R1,207.50 |
| S.1 | 48kg SV cylinder deposit | 1 | R1,207.50 |

Note: invoice 52924 itself carries **no 9kg line items** (only 14kg/19kg/48kg, per the line mix above) — so this CN's 80×9.1 credit is **not a same-invoice deposit reversal**; it is a much larger, separately-sourced batch of 9kg deposit returns posted against 52924 by document reference. The 4×D.1 + 1×S.1 = **5** 48kg units (not 8, and not matched to either later claim below).

**CN 15592 is fully spent** — already netted into this event's closed **R5,433.70** event net. Nothing from it remains available to apply elsewhere.

**Note — line detail does not fully reconcile to the CN total:** the three lines above sum to **R47,437.50** (41,400 + 4,830 + 1,207.50), against a CN total of **R69,000.00** — a **R21,562.50 residual** not itemized here. The operator's fresh pull reported these lines specifically in response to the cylinder-return question; it is not represented as the complete line-by-line breakdown of CN 15592. The residual likely includes other SKUs (e.g. 14.1/19.1 deposits, or LPG credits) not itemized in this exchange. **UNVERIFIED** pending a full itemized pull if ever needed.

> ⚠ This CN is the likely source of confusion for the 2026-09-04 cylinder-return claims (see `LIN001_event_2026-09-04_proforma.md` and `LIN001_note_2026-09-04_cylinder_return.md`): the customer's WhatsApp math uses the exact same 9kg/R517.50 pairing that this already-closed CN used two days earlier. Neither the operator's "8×48kg" report nor the customer's "50×9kg" claim independently confirms against ERP — ERP shows **nothing posted for LIN001 cylinders after 2026-09-02**.

---

## Cross-event note (not reconciled)

DN#23974 bank receipt (**EXT-2901239645**, R34,721) supports only **R4,513.20** surplus carry, not R22,729.30.

Gap of **R18,216.10** on the carry leg is **not reconciled** against DN#23974 payment proof — operator allocation on 45961 takes precedence for DN#24947 closure.

---

## Artifacts

| Artifact | Path |
|---|---|
| Events config | `analysis/debtors/LIN001/config/events.json` |
| Manual allocation | `analysis/debtors/shared/reports/LIN001_manual_allocation_2026-06_2026-09.csv` |
| Prior event | `LIN001_event_DN23974.md` |
