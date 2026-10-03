# CAP000 Remittance Mapping — Google Drive Discovery

**Status:** 3 remittance workbooks located on Google Drive (not yet downloaded into `raw/Remittances/`)  
**Source Folder:** https://drive.google.com/drive/folders/1zSMLoURs99ML8SnMpRTlg8wZYWCrm9Yg  
**As At:** 2026-10-03  
**Purpose:** Map 8 unallocated STAT payments to invoices using customer remittance breakdowns  
**Unallocated universe:** **R184,013.63** (`PROVEN` — row-sum of `data/allocation_edges.csv`)

---

## Epistemic posture

| Layer | Tag | Basis |
| :--- | :--- | :--- |
| Payment amounts in `allocation_edges.csv` | **PROVEN** | DEBENQ-derived edges |
| Drive file ↔ payment amount match | **ASSERTED** | Filename/Drive metadata equals payment amount exactly; Excel contents not yet ingested in-repo |
| Invoice-level allocation | **ASSUMED** until ingest | Edges remain `UNALLOCATED` until remittance lines are written as `REMITTANCE_EXPLICIT` |

Do **not** mark reconciliation rows PROVEN until steps 1–5 below complete and `reconciliation_status.csv` is regenerated.

---

## Confirmed remittance files (exact amount match)

### 1. R35,844.65 Jan–Mar 2025
- **File:** `R35 844.65 Jan-Mar 2025.xlsx`
- **Google Drive ID:** `1JyyS1NMRqVgdhbnlJvCtQIxdQfs86MMO`
- **Link:** https://drive.google.com/file/d/1JyyS1NMRqVgdhbnlJvCtQIxdQfs86MMO/view?usp=drivesdk
- **Payment Doc:** 00038536
- **Payment Date:** 2025-05-07
- **Payment Amount:** R35,844.65
- **Period Covered:** January–March 2025
- **Status:** EXACT MATCH (ASSERTED) — download & extract pending

### 2. R8,356.32 November
- **File:** `R8356.32 November remittance.xlsx`
- **Google Drive ID:** `1TysrfMSGCvkSgfrAYFuSbEjPUh9fdcb5`
- **Link:** https://drive.google.com/file/d/1TysrfMSGCvkSgfrAYFuSbEjPUh9fdcb5/view?usp=drivesdk
- **Payment Doc:** 00042697
- **Payment Date:** 2025-12-18
- **Payment Amount:** R8,356.32
- **Status:** EXACT MATCH (ASSERTED) — download & extract pending

### 3. R7,120.32 September 2025
- **File:** `R7120.32 September 2025.xlsx`
- **Google Drive ID:** `1OfwvjN4eK71uCzCtKXMz__tr_KwBFyNG`
- **Link:** https://drive.google.com/file/d/1OfwvjN4eK71uCzCtKXMz__tr_KwBFyNG/view?usp=drivesdk
- **Payment Doc:** 00042043
- **Payment Date:** 2025-10-31
- **Payment Amount:** R7,120.32
- **Status:** EXACT MATCH (ASSERTED) — download & extract pending

**Matched subtotal:** R51,321.29 (**27.9%** of R184,013.63) — `PROVEN` arithmetic on matched payment amounts.

---

## Remaining 5 payments (no remittance located yet)

| Payment Doc | Date | Amount | Status |
| :--- | :--- | ---: | :--- |
| 00041466 | 2025-09-29 | R97,933.00 | MISSING |
| 00042518 | 2025-12-01 | R12,750.48 | MISSING |
| 00043235 | 2026-02-05 | R3,656.43 | MISSING |
| 00043472 | 2026-02-26 | R8,443.46 | MISSING |
| 00043872 | 2026-03-31 | R9,908.97 | MISSING |
| **TOTAL** | — | **R132,692.34** | — |

> Prior prose total **R132,891.34** for the remaining five is **SUPERSEDED** (arithmetic error). Use **R132,692.34** (`PROVEN` sum of the five edge amounts).

---

## Ingestion steps

1. **Download** the 3 Excel files from Google Drive into this directory (`raw/Remittances/`).
2. **Extract** invoice-level breakdowns (invoice no, amount, reference) — prefer a `remittance_lines_*.csv` shape consistent with TWK002/MD0003 if available.
3. **Map** into `data/allocation_edges.csv`:
   - `target_doc` ← invoice number from remittance
   - `allocated_amount` ← invoice amount
   - `allocation_type` ← `REMITTANCE_EXPLICIT`
   - `confidence` ← `High` / `Confirmed`
   - `review_required` ← `false` once verified
4. **Re-run:** `npm run debtors:reconciliation-status -- --debtor CAP000`
5. **Verify:** `reports/reconciliation_status.csv` shows remittance-linked / PROVEN evidence for matched invoices

---

## Impact (pre-ingest)

| Metric | Value | Tag |
| :--- | :--- | :--- |
| Payments with Drive remittance located | 3 of 8 | ASSERTED (amount match) |
| Value covered if ingest succeeds | R51,321.29 (27.9%) | PROVEN (payment amounts) |
| Still missing remittance | 5 payments / R132,692.34 | ASSUMED allocation |
| Evidence upgrade to PROVEN | **Pending ingest** | — |

Summary report: `reports/CAP000_Remittance_Discovery_2026-10-03.md`
