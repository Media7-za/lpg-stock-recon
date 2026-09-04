# LIN001 — Event DN#22936

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD  
**Proof of event:** delivery note **DN#22936**  
**Status:** **Closed** (2026-09-04)

---

## Four parts

| Part | Doc / ref | Date | Amount | Confidence |
|---|---|---:|---:|---|
| **Invoice** | **51681** | 2026-07-08 | R134,049.19 | PROVEN |
| **Credit note** | **15215** → 51681 | 2026-07-08 | R-80,097.50 | PROVEN |
| **Delivery note** | **DN#22936** | — | *(proof)* | PROVEN |
| **Payment** | **EXT-2744666881** | 2026-07-03 | R54,981.36 | ASSERTED |

**Event net:** **R53,951.69** (51681 − 15215)

**Order no (invoice):** 13991 — matches bank receipt ref **Lin001 7.3 13991** (PROVEN link)

---

## Payment (operator bank receipt)

| Field | Value |
|---|---|
| **Amount** | **R54,981.36** |
| **Date** | 2026-07-03 09:00 |
| **Reference** | Lin001 7.3 13991 |
| **Transaction ID** | 2744666881 |
| **Synthetic doc id** | `EXT-2744666881` |
| **Channel** | New Champion Supermarket → Bella Energy Services300 |

**Not in Supabase.**

### Event closure

```
R54,981.36  external payment EXT-2744666881
− R53,951.69  event net (51681 − 15215)
───────────
= R1,029.67  surplus → credit carry (target TBD)
```

**Receipt artifact:** `/opt/cursor/artifacts/LIN001_payment_receipt_DN22936_2026-07-03.jpg`

---

## Line mix (PROVEN — `transaction_items`, doc 51681)

| Description | Qty |
|---|---:|
| 9KG LPG PACKED 01 | 84 |
| 9KG CYLINDER DEPOSIT | 84 |
| 19KG LPG - PACKED | 14 |
| 19KG CYLINDER DEPOSIT | 14 |
| 48KG SINGLE VALVE PACKED | 15 |
| 48KG SV CYLINDER DEPOSIT | 15 |
| 14KG LPG - PACKED | 13 |
| 14KG CYLINDER DEPOSIT | 13 |

---

## Superseded proposal

Prior ASSUMED split (44482 partial + carry from DN#22630) **withdrawn** — replaced by bank receipt above.

**Note:** DN#22630 surplus **R39,014.91** (from PC-76-32 batch) is now **unallocated** — no longer applied to this event.

---

## Artifacts

| Artifact | Path |
|---|---|
| Events config | `analysis/debtors/LIN001/config/events.json` |
| Manual allocation | `analysis/debtors/shared/reports/LIN001_manual_allocation_2026-06_2026-09.csv` |
| Working notes | `analysis/debtors/shared/reports/LIN001_working_notes_2026-09-04.md` |
