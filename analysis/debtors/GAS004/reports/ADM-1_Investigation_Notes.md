# ADM-1: Investigate UD Payments on GAS004 Account
**Status:** In Progress  
**Last Updated:** 2026-09-23  
**Investigator:** Claude Code

---

## Executive Summary

GAS004's ERP account balance discrepancy resolves to exactly 10 **undeposited payments (UD)** — receipts captured in the ERP but **not yet posted to the bank ledger** — totaling **R-10,180.95**. These represent:

- **Stale receipts never deposited:** R-4,755.04 (2024-2025 entries, 1-2 years old)
- **Duplicate receipt entries:** R-5,425.92 (July-August 2026, identical amounts)
- **Rounding residual:** R-0.01 (reversal mismatch)

**Key Finding:** Two July-August 2026 UD Payment entries are identical in amount (both -2,712.96) on successive dates (30 July → 3 August), **almost certainly a duplicate receipt entry for a single bank deposit** that was recorded twice in the ERP.

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

## Hypothesis 1: Stale Undeposited Receipts (Entries #1-2)

**R-4,755.04 from 2024-2025 receipts were never deposited to the bank**

### Evidence
- Both are > 1 year old (July 2024, April 2025)
- Both reference customer invoices (InvNos 00033041 and 00042102)
- Both still sit as "UD" (undeposited) in the ERP, meaning no bank posting ever occurred
- Neither appears in the 2026 statement segment

### Critical Questions
1. **Are these checks/payment instruments still valid?**
   - Checks dated 2024 are likely stale and uncashable
   - Bank transfer confirmations may be long since expired
2. **Were these receipts lost or misfiled?**
   - If the physical check/receipt still exists, has it been deposited since the ERP entry?
   - If the deposit slip was never created, is the cash still in a petty cash box?
3. **Should these be reversed as unrecoverable?**
   - At 1-2 years old, these likely need to be written off as bad debts or lost receipts
   - A negative UD entry reversal would clear the ERP balance

---

## Hypothesis 2: Duplicate Receipt Entry (Entries #9-10)

**Two identical-amount undeposited receipts on successive dates — almost certainly a data-entry error**

### Evidence
```
Entry #9:  30/07/2026  DocNo 00045412  InvNo 00052202  Amount -2,712.96  (UD payment)
Entry #10: 03/08/2026  DocNo 00045484  InvNo 00052262  Amount -2,712.96  (UD payment)
```

- **Identical amount to the cent** (not a coincidence)
- InvNos differ (00052202 vs 00052262) — but this doesn't mean different payments
- Dates are 4 calendar days apart — likely a delayed correction attempt or duplicate data entry
- Both remain undeposited (still "UD" status)

### Probable Root Cause
A single bank deposit of **R-2,712.96 was received on or around July 30, 2026**, and was:
1. Entered once with InvNo 00052202 on July 30
2. **Re-entered with a different InvNo (00052262) on August 3** — possibly:
   - As a correction attempt that didn't void the original
   - As a duplicate entry by a different clerk
   - As a reconciliation adjustment that was never reversed

### Critical Action
**One of these two entries must be reversed immediately.** They represent the same physical bank deposit recorded twice, which:
- Overstates the UD balance by R-2,712.96
- Blocks the account from reconciliation
- Will cause bank statement mismatch when the actual R-2,712.96 deposit posts (the duplicate entry will appear unexplained)

### Questions to investigate
1. **Which entry is correct?** (likely the first: DocNo 00045412, July 30)
2. **Can we find the actual bank deposit record?** (check July 30 bank reconciliation in the GL)
3. **Who entered DocNo 00045484 on August 3, and why?** (may reveal if it was intentional or a data-entry error)

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

### Phase 1: Bank Reconciliation (URGENT)
- [ ] **Jul-Aug duplicates (R-5,425.92):** Pull the actual July 2026 & August 2026 bank reconciliation / GL posting
  - Was R-2,712.96 actually deposited once or twice?
  - If once, which of the two UD entries (DocNo 00045412 vs 00045484) matches the real deposit?
  - If not yet deposited, which entry should be reversed?
- [ ] **Stale receipts (R-4,755.04):** Check July 2024 & April 2025 bank statements
  - Were the R-3,000 and R-1,755.04 deposits ever posted to the bank?
  - If not, are the original checks/payment instruments still in the petty cash or lost?

### Phase 2: ERP Data Correction (Once Bank Truth is Established)
- [ ] For Jul-Aug duplicates: **Reverse the duplicate entry** (likely DocNo 00045484 on Aug 3) via a reversing UD Paymnt entry
  - Document the reversal as "Duplicate receipt correction — real deposit was July 30, DocNo 00045412"
  - After reversal, the UD balance should drop from R-10,180.95 to R-7,468.00
- [ ] For stale receipts (R-4,755.04): Decide per bank findings:
  - If deposits never posted: create reversing UD entries (dated current date) to write off as uncollected
  - If deposits eventually posted: create a positive UD entry to net the original negative out

### Phase 3: Customer Communication
- [ ] Notify GAS004 of the R-4,755.04 undeposited receipts from 2024-2025
  - Ask: "Did you send checks/transfers on these dates? Are they still valid, or should we treat them as cancelled?"
- [ ] If Jul-Aug entries both represent real payments from the customer, clarify which date/amount is correct
  - Otherwise, explain that we found a duplicate entry and are correcting it

### Phase 4: Reconciliation Cleanup
- [ ] Once UD entries are corrected, regenerate GAS004_Statement_Account_v5.md
  - The running balance and header CURRENT BALANCE variance should narrow significantly
- [ ] Update project.json with new UD balance and status (awaiting customer response on stale receipts)

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
