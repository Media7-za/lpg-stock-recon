# ADM-1: Investigate UD Payments on GAS004 Account
**Status:** In Progress  
**Last Updated:** 2026-09-23  
**Investigator:** Claude Code

---

## Executive Summary

GAS004's ERP account balance discrepancy resolves to exactly 10 unallocated/unapplied payment (UD) rows totaling **R-10,180.95**. These represent:

- **Historical unallocated:** R-4,755.04 (2024-2025 entries, 1-2 years old)
- **Recent duplicates:** R-5,425.92 (July-August 2026, identical amounts)
- **Rounding residual:** R-0.01 (reversal mismatch)

**Key Finding:** Two July-August 2026 UD Payment entries are identical in amount (both -2,712.96) with successive dates (30 July → 3 August), suggesting possible duplication rather than independent payments.

---

## Detailed Analysis

### All 10 UD Payment Entries in DEBENQ_CURRENT.TXT

| # | DocNo | Date | InvNo | Amount | Status | Notes |
|---|-------|------|-------|--------|--------|-------|
| 1 | 00031944 | 13/07/2024 | 00033041 | -3,000.00 | **UNALLOCATED** | 2-year-old payment; has invoice reference but not cleared |
| 2 | 00037824 | 08/04/2025 | 00042102 | -1,755.04 | **UNALLOCATED** | 1.5-year-old payment; has invoice reference but not cleared |
| 3 | 00041785 | 18/10/2025 | — | -3,127.04 | REVERSED | Paired with DocNo 00041810 (+3,127.04, same date) |
| 4 | 00041810 | 18/10/2025 | — | +3,127.04 | REVERSAL | Reverses #3; net = 0.00 |
| 5 | 00044130 | 02/05/2026 | 00050483 | -3,289.90 | REVERSED | Paired with DocNo 00044139 (+3,289.90, same date) |
| 6 | 00044139 | 02/05/2026 | 00050483 | +3,289.90 | REVERSAL | Reverses #5; net = 0.00 |
| 7 | 00044533 | 06/06/2026 | 00051063 | -6,360.00 | REVERSED | Paired with DocNo 00044534 (+6,360.01, same date) |
| 8 | 00044534 | 06/06/2026 | 00051063 | +6,360.01 | REVERSAL | Reverses #7; net = +0.01 (rounding) |
| 9 | 00045412 | 30/07/2026 | 00052202 | -2,712.96 | **UNALLOCATED** | Linked to Invoice 00052202; recent |
| 10 | 00045484 | 03/08/2026 | 00052262 | -2,712.96 | **UNALLOCATED** | ⚠️ **DUPLICATE AMOUNT** to #9; different InvNo |

**Sum of all 10 entries:** -10,180.95 ✓ (matches ERP header UD PAY/CHEQUES)

---

## Hypothesis 1: Historical Stale Unallocated Payments (Entries #1-2)

**R-4,755.04 from 2024-2025 payments remain unallocated**

### Evidence
- Both have invoice references (InvNos 00033041 and 00042102)
- Both are > 1 year old (July 2024, April 2025)
- Neither appears in the 2026 statement segment

### Questions to investigate
1. **Do these invoice references still exist in the database?**
   - Query: `SELECT doc_no, entry_type, tx_date FROM transaction_headers WHERE account_no='GAS004' AND doc_no IN ('00033041', '00042102')`
2. **Have the corresponding invoices been fully paid off elsewhere?**
   - These might represent "advance payments" or "pre-payments" against future invoices
3. **Why are they classified as "Ud Paymnt" if they're linked to invoices?**
   - Rule 3 (Debt Partitioning) allows unallocated payments to pool; these may be legitimately unmatched despite the invoice reference

---

## Hypothesis 2: July-August 2026 Duplication (Entries #9-10)

**Two entries with identical amount (-2,712.96) on successive dates**

### Evidence
```
Entry #9:  30/07/2026  DocNo 00045412  InvNo 00052202  Amount -2,712.96
Entry #10: 03/08/2026  DocNo 00045484  InvNo 00052262  Amount -2,712.96
```

- Identical amount to the cent
- InvNos differ (00052202 vs 00052262) — different documents
- Dates are 4 calendar days apart
- Both remain "unallocated" (not reversed by later entries)

### Questions to investigate
1. **Is this a PDP-31 fingerprint-duplication pattern?**
   - Query: `SELECT doc_no, entry_type, tx_date, COUNT(*) FROM transaction_headers WHERE account_no='GAS004' AND doc_no IN ('00045412', '00045484') GROUP BY doc_no, entry_type, tx_date HAVING COUNT(*) > 1`
   - If both exist with identical amounts, check `transaction_items` for line-level duplication
2. **Or are these intentionally two separate customer payments on different dates?**
   - Check payment reference/memo fields on both doc_no entries to see if they're linked (e.g., same bank reference)
3. **Do the corresponding invoices (00052202, 00052262) exist and tie to the same customer issue?**

---

## Hypothesis 3: Reversal-Pair Rounding Issue (Entries #7-8)

**R-0.01 discrepancy in a reversal pair**

| DocNo | Date | InvNo | Amount |
|-------|------|-------|--------|
| 00044533 | 06/06/2026 | 00051063 | -6,360.00 |
| 00044534 | 06/06/2026 | 00051063 | +6,360.01 |
| **Net** | | | **+0.01** |

### Evidence
- Both linked to same InvNo (00051063)
- Same date
- Amounts differ by 0.01 — classic rounding residual

### Assessment
This is **minor and expected** under Rule 6 (ERP Header Cross-Check). The +0.01 residual is too small to investigate further unless it's part of a broader pattern. No action needed unless customer dispute arises.

---

## Investigation Checklist

### Phase 1: Database Verification (Requires Supabase Access)
- [ ] Query `transaction_headers` for all 10 doc_no entries; confirm entry_type and amounts
- [ ] For entries #1-2 (2024-2025): Verify invoice doc_nos 00033041, 00042102 exist; check their aging
- [ ] For entries #9-10 (July-August 2026): Check for line-item duplication in `transaction_items`
- [ ] For entries #3-8 (reversed pairs): Confirm pairs appear in both headers and items with correct amounts

### Phase 2: Invoice Tieout (ERP Reconciliation)
- [ ] Retrieve full DTRX/H-021 fresh DEBENQ/DTRX export for GAS004 through current date (currently queued)
- [ ] Compare 2024-2025 payment references against original delivery notes/sales orders
- [ ] For July-August duplicates, check whether both payment doc_nos appear on the same H-021 export or if one is from an older file

### Phase 3: Customer Communication
- [ ] Determine if GAS004 has been notified of the R-4,755.04 stale unallocated balance
- [ ] Check whether customer disputes these payments or acknowledges them as valid but misallocated
- [ ] If July-August duplication is real, determine which payment customer actually made and which is the erroneous re-entry

### Phase 4: ERP Action (If Duplicated)
- [ ] If PDP-31-style duplication is confirmed, apply dedup migration (after human sign-off)
- [ ] If entries are intentional (two real payments), document the customer reason and leave as-is
- [ ] For 2024-2025 stale entries, decide: allocate to open invoices, reverse, or refund

---

## Reference Files
- **Raw Data:** `analysis/debtors/GAS004/raw/DEBENQ_CURRENT.TXT`
- **Statement Report:** `analysis/debtors/GAS004/reports/GAS004_Statement_Account_v5.md`
- **Project Metadata:** `analysis/debtors/GAS004/project.json`
- **Business Rules:** `analysis/debtors/shared/docs/business_rules.md` (Rule 3, Rule 6, Rule 8b)

---

## Next Steps

**Awaiting:**
1. Fresh H-021 DEBENQ/DTRX export (status in project.json: queued)
2. Database query results confirming line-level duplication or invoice linkage
3. Customer communication from GAS004 regarding stale payments

**Owner:** Sharmin (assigned in Linear)  
**Due Date:** TBD (awaiting H-021 export)
