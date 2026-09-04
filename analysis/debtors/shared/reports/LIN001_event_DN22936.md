# LIN001 — Event DN#22936

**Account:** LIN001 — SLINDOKUHLE ENTERPRISES (PTY) LTD  
**Added:** 2026-09-04 (operator)  
**Proof of event:** delivery note **DN#22936**

---

## Four parts

| Part | Doc / ref | Date | Amount | Confidence |
|---|---|---:|---:|---|
| **Invoice** | **51681** | 2026-07-08 | R134,049.19 | PROVEN |
| **Credit note** | **15215** → 51681 | 2026-07-08 | R-80,097.50 | PROVEN |
| **Delivery note** | **DN#22936** | — | *(proof)* | PROVEN |
| **Payment** | 44482 partial + carry | see below | R53,951.69 | ASSUMED |

**Event net:** **R53,951.69** (51681 − 15215)

**Order no (invoice):** 13991

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

Mixed-size delivery — LPG fills + cylinder deposits across 9kg / 14kg / 19kg / 48kg.

---

## Proposed payment closure (ASSUMED)

```
Credit carry from DN#22630   R39,014.91
44482 partial (PC-76-31)     R14,936.78
────────────────────────────────────────
                             R53,951.69  → event net closed
```

| Slice | Doc | Amount | Batch |
|---|---|---:|---|
| Carry | CREDIT-39014.91 | R39,014.91 | from PC-76-32 surplus |
| Cash | 44482 | R14,936.78 | PC-76-31 SPEEDP |

**44482 remainder after this slice:** R75,844.50 − R14,936.78 = **R60,907.72** (before DN#23974 slice).

---

## Status

| Field | Value |
|---|---|
| Event structure | **Complete** (invoice + CN + DN#) |
| Payment proof | **Pending** — proposed split not operator-confirmed |
| Closure | **Proposed** |

**Tripwire:** Operator supplies payment proof or rejects 44482/carry split → reopen payment leg.

---

## Artifacts

| Artifact | Path |
|---|---|
| Events config | `analysis/debtors/LIN001/config/events.json` |
| Manual allocation | `analysis/debtors/shared/reports/LIN001_manual_allocation_2026-06_2026-09.csv` |
| Working notes | `analysis/debtors/shared/reports/LIN001_working_notes_2026-09-04.md` |
