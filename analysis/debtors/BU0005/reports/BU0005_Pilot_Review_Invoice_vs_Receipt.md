# BU0005 — Pilot Review: Invoice vs Receipt (STAT 125)

**Updated:** 2026-07-15  
**Payment:** 00044065 · STAT 125  
**Target invoice:** 00050193 (DN-22310 LPG)

---

## Timeline

| # | Event | Doc | Date | Day offset |
| :---: | :--- | :--- | :--- | :--- |
| 1 | LPG invoice | 00050193 | **2026-04-10** | — |
| 2 | EMPTY invoice | 00050194 | 2026-04-10 | +0 |
| 3 | EMPTY credit note | 00014749 | **2026-04-13** | +3 from inv |
| 4 | **EFT receipt** | 00044065 | **2026-04-21** | **+11 from LPG inv** |
| | | | | **+8 from EMPTY CN** |

**Prepayment check:** Payment date **after** invoice date → not a prepayment / DN-lag case.

**EMPTY pair:** CYL line netted by CN three days before receipt — LPG line `00050193` remains the commercial gas debt at payment date.

---

## Amount decomposition (operator ruling 2026-07-15)

| Component | Amount | Treatment |
| :--- | ---: | :--- |
| LPG invoice `00050193` | 1,159.38 | Allocation target — clears LPG doc |
| Rounding slice | 10.62 | **Intentional** → ERP `DISCOUNT ALLOWED` journal |
| Payment header total | 1,170.00 | Cash received |

Same pattern as STAT 122 (confirmed in `ERP RAW DATA/DETRANS.TXT`):

| Slice | Amount | ref_no |
| :--- | ---: | :--- |
| LPG allocation | 1,027.87 | `00048766` |
| Rounding | 2.13 | *(blank)* → journal |

STAT 124 inferred: R2,697.51 + R2.49 = R2,700.00 (allocation detail not yet in DETRANS export).

---

## Account context at receipt date

| Metric | Value |
| :--- | ---: |
| Running balance before payment (line 12) | R2,532.95 |
| Payment amount | R1,170.00 |
| Running balance after payment (line 13) | R1,362.95 |
| LPG invoice alone | R1,159.38 |

Payment is a **partial account settlement** (R1,170 vs R2,532.95 open), but the **LPG + rounding decomposition** matches DN-22310 delivery — consistent with Bulwer-family STAT batch behaviour (pay gas line + post rounding to discount).

---

## Allocation verdict (for sign-off)

| Field | Proposed value |
| :--- | :--- |
| Payment doc | 00044065 |
| Receipt date | 2026-04-21 |
| Invoice doc | 00050193 |
| Invoice date | 2026-04-10 |
| Lag | 11 days |
| Allocated LPG | R1,159.38 |
| Rounding journal | R10.62 → DISCOUNT ALLOWED |
| Tier (LPG slice) | **Tier 1** once journal task queued |
| `review_required` | **false** after rounding rule locked |

**Recommendation:** Approve allocation **00044065 → 00050193** at R1,159.38 LPG; queue ERP journal R10.62 on payment date 2026-04-21.

---

## Open item for operator

Please confirm sign-off on the 11-day invoice→receipt lag for DN-22310 (no dispute / normal COD terms).

If approved, Turn 3 will promote all three STAT batches using the split pattern above.
