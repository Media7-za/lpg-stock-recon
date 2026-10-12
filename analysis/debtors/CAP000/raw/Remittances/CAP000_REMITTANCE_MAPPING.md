# CAP000 Remittance Mapping — Google Drive Discovery

**Status:** Files located on Google Drive  
**Source Folder:** `https://drive.google.com/drive/folders/1zSMLoURs99ML8SnMpRTlg8wZYWCrm9Yg`  
**As At:** 2026-10-03  
**Purpose:** Map 8 unallocated STAT payments to invoices using customer remittance breakdowns

---

## ✓ Confirmed Remittance Files (Match Payment Amounts Exactly)

### 1. R35,844.65 Jan–Mar 2025 Remittance
- **File:** `R35 844.65 Jan-Mar 2025.xlsx`
- **Google Drive ID:** `1JyyS1NMRqVgdhbnlJvCtQIxdQfs86MMO`
- **Payment Doc:** 00038536
- **Payment Date:** 2025-05-07
- **Payment Amount:** R35,844.65
- **Period Covered:** January–March 2025
- **Status:** ✓ EXACT MATCH
- **Action:** Download & extract invoice detail

### 2. R8,356.32 November Remittance
- **File:** `R8356.32 November remittance.xlsx`
- **Google Drive ID:** `1TysrfMSGCvkSgfrAYFuSbEjPUh9fdcb5`
- **Payment Doc:** 00042697
- **Payment Date:** 2025-12-18
- **Payment Amount:** R8,356.32
- **Status:** ✓ EXACT MATCH

### 3. R7,120.32 September 2025 Remittance
- **File:** `R7120.32 September 2025.xlsx`
- **Google Drive ID:** `1OfwvjN4eK71uCzCtKXMz__tr_KwBFyNG`
- **Payment Doc:** 00042043
- **Payment Date:** 2025-10-31
- **Payment Amount:** R7,120.32
- **Status:** ✓ EXACT MATCH

---

## Remaining 5 Payments (No Remittance Found Yet)

| Payment Doc | Date | Amount | Status |
|:---|:---|---:|:---|
| 00041466 | 2025-09-29 | R97,933.00 | ✗ MISSING |
| 00042518 | 2025-12-01 | R12,750.48 | ✗ MISSING |
| 00043235 | 2026-02-05 | R3,656.43 | ✗ MISSING |
| 00043472 | 2026-02-26 | R8,443.46 | ✗ MISSING |
| 00043872 | 2026-03-31 | R9,908.97 | ✗ MISSING |

---

## Ingestion Steps

1. **Download:** All 3 Excel files from Google Drive (folder link above)
2. **Extract:** Invoice-level breakdowns (invoice no, amount, reference)
3. **Map:** Populate allocation_edges.csv with:
   - `target_doc` ← invoice number from remittance
   - `allocated_amount` ← invoice amount
   - `allocation_type` ← `REMITTANCE_EXPLICIT`
   - `confidence` ← `Confirmed`
4. **Re-run:** `npm run debtors:reconciliation-status -- --debtor CAP000`
5. **Verify:** reconciliation_status.csv shows PROVEN evidence for matched invoices

---

## Impact

**H-011 Progress:** 3 of 8 payments (R51,321.29) can be cleared immediately  
**Evidence Upgrade:** ASSUMED → PROVEN for allocated invoices  
**Remaining Work:** Request remittance for 5 payments (R132,891.34)
