# IVE001 — Open Invoices & Overpayment Batch

**Account:** IVE001 · ST IVES  
**As at:** 22 July 2026  
**Source:** `IVE001X22072026.TXT` (Tier-3) · v5 statement **R 0.00 bridge**  
**Status:** Financial position signed off from TXT · Custody **BLOCKED** (`STALE_PARTIAL`)

---

## 1. Open invoices

### Summary

| | Amount (R) |
| :--- | ---: |
| **ERP CURRENT BALANCE (22 Jul 2026)** | **2,879.99** |
| Part 1A — LPG gas | 2,879.99 |
| Part 1B — CYL deposits | 0.00 |

> Supersedes global aged-debt snapshot **R 12,959.96** (13 Jul 2026) — payment **45099** and July deliveries are in this TXT.

### Open detail

| Doc | DN ref | Inv date | Gross (R) | **Due (R)** | Note |
| :--- | :--- | :--- | ---: | ---: | :--- |
| **51844** | DN#22821 | 15 Jul 2026 | 7,199.98 | **2,879.99** | Gas invoice; account credit **R 4,319.99** from payment timing reduces amount due |

**Collections:** Invoice **R 2,879.99** only — not R 7,199.98 gross.

### Recently closed (do not collect)

| Doc | Gross (R) | Closed by | Pay date | Pay amount(s) (R) |
| :--- | ---: | :--- | :--- | :--- |
| **49476** | 7,199.98 | **43647** + **43880** | 10 Mar + 2 Apr 2026 | −5,759.98 · −1,440.00 |
| **50687** | 8,639.97 | **44457** | 27 May 2026 | −8,639.97 |
| **51036** | 4,319.99 | **44876** | 24 Jun 2026 | *(in STAT 127 batch)* |
| **50242** | 7,199.98 | **44876** | 24 Jun 2026 | *(in STAT 127 batch)* |
| **49889** | 7,199.98 | **44876** | 24 Jun 2026 | *(in STAT 127 batch)* |
| **51291** | 10,079.97 | **45099** | 7 Jul 2026 | −10,079.97 |
| **51603** | 7,199.98 | **45099** | 7 Jul 2026 | −7,199.98 |

#### Inv 49476 — split payment (confirmed)

| Doc | Date | Amount (R) |
| :--- | :--- | ---: |
| **49476** | 27/02/2026 | 7,199.98 |
| **43647** | 10/03/2026 | −5,759.98 |
| **43880** | 02/04/2026 | −1,440.00 |
| **Balance** | | **0.00** ✓ |

---

## 2. Overpayment batch — Pay **44876** (STAT 127)

| Field | Value |
| :--- | :--- |
| **Payment doc** | **44876** |
| **Date** | 24 Jun 2026 |
| **Batch** | STAT 127 |
| **Bank gross (TXT)** | **R 23,039.94** |

### TXT manifest (single line)

Statement TXT shows one payment **R 23,039.94** clearing June STAT batch — LPG balance after: **R 5,759.98** (carried into July).

### DTRX ref slices *(internal — for ERP Agent only)*

| Ref | Amount (R) | Target |
| :--- | ---: | :--- |
| 51036 | −4,319.99 | Inv **51036** ✓ |
| 50242 | −7,199.98 | Inv **50242** ✓ |
| 49889 | −7,199.98 | Inv **49889** ✓ |
| *(blank)* | **−4,319.99** | ⚠ No invoice tagged in DB |

### Overpayment / credit trace

| Item | Amount (R) | Explanation |
| :--- | ---: | :--- |
| Blank DB slice on **44876** | 4,319.99 | Possible duplicate posting vs **51036** leg — verify in ERP |
| LPG balance after **45099** (7 Jul) | −4,319.99 | Credit on account before inv **51844** |
| **Net amount due now** | **2,879.99** | −4,319.99 credit + **51844** R 7,199.98 |

**ERP Agent:** Reconcile blank **44876** slice with TXT single-line **R 23,039.94** and July **R 4,319.99** account credit.

---

## 3. Cross-check

| Check | Result |
| :--- | :--- |
| ERP CURRENT BALANCE (TXT) | **R 2,879.99** ✓ |
| v5 bridge (1A + 1B) | **R 0.00 variance** ✓ |
| Open to collect | **R 2,879.99** (not R 12,959.96) |
| Ingest gate | `STALE_PARTIAL` — custody blocked |
| Pay **45099** | R 17,279.95 → **51291** + **51603** ✓ |

---

## 4. Next steps

| Role | Action |
| :--- | :--- |
| **Collections** | Invoice **R 2,879.99** (DN#22821 / doc **51844**) |
| **Sources** | Fresh DTRX + ITEMS through 22 Jul 2026 → clear 9 ingest gaps |
| **ERP Agent** | Resolve **44876** blank R 4,319.99 slice vs July account credit |
