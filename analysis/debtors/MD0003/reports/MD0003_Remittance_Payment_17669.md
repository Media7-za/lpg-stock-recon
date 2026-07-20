# MD0003 — Remittance Cross-Check: Payment 17669 (STAT 207)

**Source:** COD Remittance Advice dated **01/01/2023**  
**File:** `raw/Remittances/01.01.2023.pdf`  
**Payer:** BLUFF MEAT SUPPLY (PTY) LTD (MD0003)  
**Payee:** GAZ EXPRESS  
**Bank reference:** `000151222080`  
**Generated:** 2026-07-16

---

## 1. Summary

| Field | Remittance | ERP Payment 17669 |
| :--- | ---: | ---: |
| Payment date | 2023-01-01 | 2023-01-03 |
| STAT batch | — | STAT207 |
| **Total** | **R12,025.08** | **R12,025.08** ✓ |
| Invoice lines | 4 | 4 ref slices |
| Alloc/Recon noise | — | **None** |

**Verdict:** **Perfect 4-way match** — remittance and ERP ref slices are cent-exact for all Nov 2022 LPG invoices. No clerk mirror rows on this payment doc.

---

## 2. Line-by-Line Match

| Doc | Inv Date | Remittance | ERP ref slice | LPG target | Match |
| :--- | :--- | ---: | ---: | ---: | :--- |
| 16425 | 2022-11-13 | R1,273.05 | R1,273.05 | R1,273.05 | ✓ |
| 16474 | 2022-11-17 | R4,032.01 | R4,032.01 | R4,032.01 | ✓ |
| 16544 | 2022-11-20 | R2,688.01 | R2,688.01 | R2,688.01 | ✓ |
| 16615 | 2022-11-28 | R4,032.01 | R4,032.01 | R4,032.01 | ✓ |

---

## 3. Billing Period

Nov 2022 invoice pool (4 deliveries) settled by Jan 2023 STAT207 batch. Remittance total equals sum of listed invoices — no surplus, no blank ref, no CYL lines.

---

## 4. Artifacts

| File | Role |
| :--- | :--- |
| `raw/Remittances/01.01.2023.pdf` | Source remittance |
| `data/remittance_manifest_2023.json` | Structured parse |
| `config/payment_pattern_overrides.json` | Override RM-17669 registered |
