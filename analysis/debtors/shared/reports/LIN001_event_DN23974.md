# LIN001 — Event DN#23974

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD  
**Proof of event:** delivery note **DN#23974**  
**Status:** **Closed** (2026-09-04)

---

## Four parts

| Part | Doc / ref | Date | Amount | Confidence |
|---|---|---:|---:|---|
| **Invoice** | **52768** | 2026-08-24 | R69,652.80 | PROVEN |
| **Credit note** | **15543** → 52768 | 2026-08-24 | R-39,445.00 | PROVEN |
| **Delivery note** | **DN#23974** | — | *(proof)* | PROVEN |
| **Payment** | **EXT-2901239645** | 2026-08-22 | R34,721.00 | ASSERTED |

**Event net:** **R30,207.80** (52768 − 15543)

---

## Payment (operator bank receipt)

| Field | Value |
|---|---|
| **Amount** | **R34,721.00** |
| **Date** | 2026-08-22 20:56 |
| **Reference** | HAPPY 8.22 |
| **Transaction ID** | 2901239645 |
| **Synthetic doc id** | `EXT-2901239645` |
| **Channel** | New Champion Supermarket → Bella Energy Services300 |

**Not in Supabase.**

### Event closure

```
R34,721.00  external payment EXT-2901239645
− R30,207.80  event net (52768 − 15543)
───────────
= R4,513.20  surplus → credit carry to DN#24947
```

**Receipt artifact:** `/opt/cursor/artifacts/LIN001_payment_receipt_34721_2026-08-22.jpg`

---

## Line mix (PROVEN — `transaction_items`, doc 52768)

| SKU | Description | Qty |
|---|---|---:|
| 14.4 | 14KG LPG - PACKED | 10 |
| 14.1 | 14KG CYLINDER DEPOSIT | 10 |
| 1901 | 19KG LPG PACKED | 10 |
| 19.1 | 19KG CYLINDER DEPOSIT | 10 |
| S.4 | 48KG SV LPG- PACKED | 17 |
| S01 | 48KG SINGLE VALVE PACKED | 3 |
| S.1 | 48KG SV CYLINDER DEPOSIT | 20 |

Mixed 14kg / 19kg / 48kg delivery — LPG fills + cylinder deposits.

**CN 15543:** cylinder deposit credits only (empty returns).

---

## Downstream impact

Credit carry **R4,513.20** (not R22,729.30) applies to event **DN#24947** unless a second payment toward this event is named.

Prior ASSUMED **44482 slice R18,216.10** toward this event is **withdrawn** — bank receipt is sole confirmed payment.

---

## Artifacts

| Artifact | Path |
|---|---|
| Events config | `analysis/debtors/LIN001/config/events.json` |
| Manual allocation | `analysis/debtors/shared/reports/LIN001_manual_allocation_2026-06_2026-09.csv` |
| Working notes | `analysis/debtors/shared/reports/LIN001_working_notes_2026-09-04.md` |
