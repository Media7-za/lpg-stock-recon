# Statement of Account: Family Gas (FAM000 / FAM002) - Version 4 (Canonical Settlement Allocation Doctrine)
**Period:** 1 March 2026 → 31 May 2026 &nbsp;|&nbsp; **Accounts:** FAM000 + FAM002
**Opening Balance B/F:** R61,626.77 (ERP verified — source: Consolidated Audit / Statement)

---

<!-- INTERNAL_ONLY_START -->
## ⚠️ Audit Disclosure & Executive Summary

During the reconciliation of FAM000 + FAM002, we uncovered critical ERP reporting bugs that severely distort the customer's ledger balance in the database header table (`transaction_headers`).

### 🔍 Key Findings:
1. **Bug A: Credit Note Double-Taxation in Database Headers**
   * **Problem:** The physical CSV statement is correct, but the ERP database header table incorrectly records the tax-inclusive total (e.g. `-R7,705.00`) inside the `amount_excl` field for Credit Notes. Any database query summing `amount_excl + tax_amount` double-taxes the transaction, resulting in an artificial `-R8,710.00` total.
   * **Solution:** Our reconciliation logic sums the raw line items (`line_total` from `vw_clean_transactions`) directly, safely bypassing this header-level bug.
2. **Bug B: Re-Used Document Numbers & Truncated History**
   * **Problem:** The ERP re-uses document numbers across different financial years. Because the statement was generated for the "CURRENT" year, historical line items were hidden in the `Balance B/F`, creating an artificially inflated starting balance and giving the false illusion that the ERP was randomly dropping lines from mixed documents.
3. **True Reconciled Balance:**
   * This Stacked Statement calculates the **True Balance directly from raw database line items** (`vw_clean_transactions`), safely bypassing the ERP statement generator's bugs.

---
<!-- INTERNAL_ONLY_END -->

## Part 1: LPG Gas Statement
*Tracks all gas invoiced and all payments received since 1 March 2026. The Balance B/F is the true reconciled financial balance as of 28 February 2026.*

| Date | Entry Type | Doc # | Amount (R) | Running Balance (R) |
| :--- | :--- | :--- | ---: | ---: |
| **28 Feb 2026** | **Balance B/F** | — | | **61,626.77** |
| 02 Mar 2026 | Payment | 43498 | -18,938.31 | 42,688.46 |
| 06 Mar 2026 | Invoice | 49619 / 49620 | 11,156.55 | 53,845.01 |
| 08 Mar 2026 | Crd Note | 14559 / 14560 | -863.74 | 52,981.27 |
| 08 Mar 2026 | Invoice | 49626 / 49627 / 49628 / 49629 | 8,925.17 | 61,906.44 |
| 09 Mar 2026 | Payment | 43590 / 43590 / 43590 / 43590 | -20,343.00 | 41,563.44 |
| 09 Mar 2026 | Invoice | 49668 / 49669 | 13,507.79 | 55,071.23 |
| 11 Mar 2026 | Payment | 43612 | -11,156.50 | 43,914.73 |
| 13 Mar 2026 | Invoice | 49746 | 12,955.92 | 56,870.65 |
| 16 Mar 2026 | Payment | 43671 / 43671 | -12,957.00 | 43,913.65 |
| 18 Mar 2026 | Payment | 43702 / 43702 | -8,062.00 | 35,851.65 |
| 18 Mar 2026 | Invoice | 49832 / 49833 | 16,866.68 | 52,718.33 |
| 22 Mar 2026 | Invoice | 49871 / 49872 | 18,402.21 | 71,120.54 |
| 23 Mar 2026 | Payment | 43741 / 43741 | -21,600.00 | 49,520.54 |
| 28 Mar 2026 | Invoice | 49991 | 25,312.05 | 74,832.59 |
| 30 Mar 2026 | Payment | 43825 / 43826 | -25,312.00 | 49,520.59 |
| 06 Apr 2026 | Payment | 43891 / 43891 / 43891 / 43892 | -37,200.00 | 12,320.59 |
| 06 Apr 2026 | Invoice | 50102 / 50103 / 50111 / 50112 | 40,925.01 | 53,245.60 |
| 09 Apr 2026 | Invoice | 50199 / 50200 | 8,920.83 | 62,166.43 |
| 15 Apr 2026 | Payment | 44007 / 44007 / 44007 / 44007 / 44007 / 44007 / 44007 / 44007 / 44007 | -21,000.00 | 41,166.43 |
| 15 Apr 2026 | Invoice | 50254 / 50255 | 20,059.30 | 61,225.73 |
| 19 Apr 2026 | Invoice | 50316 / 50317 | 12,096.05 | 73,321.78 |
| 20 Apr 2026 | Payment | 44046 / 44046 / 44046 | -15,500.00 | 57,821.78 |
| 20 Apr 2026 | Invoice | 50322 / 50323 / 50324 | 2,394.02 | 60,215.80 |
| 23 Apr 2026 | Invoice | 50368 / 50369 | 13,078.88 | 73,294.68 |
| 28 Apr 2026 | Payment | 44102 / 44102 / 44102 | -30,000.00 | 43,294.68 |
| 28 Apr 2026 | Invoice | 50401 / 50402 | 16,254.09 | 59,548.77 |
| 30 Apr 2026 | Invoice | 50481 / 50482 | 13,078.88 | 72,627.65 |
| 04 May 2026 | Invoice | 50498 / 50499 | 13,104.07 | 85,731.72 |
| 05 May 2026 | Payment | 44170 / 44170 / 44170 | -39,000.00 | 46,731.72 |
| 05 May 2026 | Invoice | 50526 / 50527 | 17,942.48 | 64,674.20 |
| 08 May 2026 | Payment | 44199 / 44199 / 44199 | -10,000.00 | 54,674.20 |
| 10 May 2026 | Invoice | 50610 | 9,772.18 | 64,446.38 |

> [!IMPORTANT]
> **Final LPG Gas Balance: R65,389.38 Debit**

---

## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Tracks the physical outstanding cylinder quantities.*

| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **28 Feb 2026** | **Balance B/F** | — | **24** | **-75** | **90** | **-2** | **8** |
| 01 Mar 2026 | Crd Note | 14518 | -3 | -3 | -20 | -2 | -10 |
| 09 Mar 2026 | Invoice | 49669 | +2 | +1 | +20 | 0 | +7 |
| 09 Mar 2026 | Crd Note | 14571 | -2 | -1 | -20 | 0 | -7 |
| 22 Mar 2026 | Invoice | 49872 | +2 | +1 | +16 | 0 | +12 |
| 24 Mar 2026 | Crd Note | 14641 | -2 | -1 | -16 | 0 | -12 |
| 29 Mar 2026 | Invoice | 49992 | +3 | +5 | +22 | 0 | +15 |
| 29 Mar 2026 | Crd Note | 14682 | -3 | -5 | -21 | 0 | -15 |
| 06 Apr 2026 | Invoice | 50103 | +2 | +5 | +10 | 0 | +10 |
| 06 Apr 2026 | Invoice | 50112 | +4 | +2 | +29 | 0 | +12 |
| 06 Apr 2026 | Crd Note | 14715 | -3 | -5 | -22 | 0 | -12 |
| 06 Apr 2026 | Crd Note | 14716 | -2 | -6 | -9 | 0 | -10 |
| 09 Apr 2026 | Invoice | 50200 | +2 | +2 | 0 | 0 | +6 |
| 11 Apr 2026 | Crd Note | 14743 | -2 | -2 | -5 | 0 | -6 |
| 15 Apr 2026 | Invoice | 50255 | +2 | +3 | +15 | 0 | +12 |
| 15 Apr 2026 | Crd Note | 14764 | -2 | -3 | -15 | 0 | -12 |
| 04 May 2026 | Invoice | 50499 | +2 | +8 | +12 | 0 | 0 |
| 04 May 2026 | Crd Note | 14845 | -2 | -8 | -12 | 0 | 0 |
| 05 May 2026 | Invoice | 50527 | +5 | +6 | +16 | 0 | +8 |
| 05 May 2026 | Crd Note | 14859 | -4 | -7 | -16 | 0 | -8 |
| 18 Mar 2026 | Invoice | 49833 | 0 | +1 | +12 | 0 | +12 |
| 19 Mar 2026 | Crd Note | 14627 | 0 | -1 | -12 | 0 | -12 |
| 20 Apr 2026 | Invoice | 50323 | 0 | +3 | 0 | 0 | 0 |
| 20 Apr 2026 | Crd Note | 14782 | 0 | -3 | 0 | 0 | 0 |
| 28 Apr 2026 | Invoice | 50402 | 0 | +3 | +12 | 0 | +10 |
| 28 Apr 2026 | Crd Note | 14813 | 0 | -3 | -12 | 0 | -10 |
| 06 Mar 2026 | Invoice | 49620 | 0 | 0 | +25 | 0 | +5 |
| 06 Mar 2026 | Crd Note | 14555 | 0 | 0 | -25 | -3 | -9 |
| 08 Mar 2026 | Invoice | 49627 | 0 | 0 | +4 | 0 | 0 |
| 08 Mar 2026 | Crd Note | 14560 | 0 | 0 | -4 | 0 | 0 |
| 23 Apr 2026 | Invoice | 50369 | 0 | 0 | +15 | 0 | +8 |
| 23 Apr 2026 | Crd Note | 14804 | 0 | 0 | -15 | 0 | -8 |
| 30 Apr 2026 | Invoice | 50482 | 0 | 0 | +15 | 0 | +8 |
| 02 May 2026 | Crd Note | 14839 | 0 | 0 | -15 | 0 | -8 |
| 11 May 2026 | Invoice | 50611 | 0 | 0 | +10 | 0 | +5 |
| 11 May 2026 | Crd Note | 14889 | 0 | 0 | -10 | 0 | -5 |
| 08 Mar 2026 | Invoice | 49629 | 0 | 0 | 0 | 0 | +7 |
| 19 Apr 2026 | Invoice | 50317 | 0 | 0 | 0 | 0 | +10 |
| 20 Apr 2026 | Crd Note | 14785 | 0 | 0 | 0 | 0 | -10 |
| **TOTAL OUTSTANDING** | — | — | **23** | **-83** | **74** | **-7** | **1** |

> [!TIP]
> **Final Outstanding Cylinders (Custody): 14kg: 23 | 19kg: -83 | 9kg: 74 | D.1: -7 | S.1: 1**

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt | R65,389.38 |
| Cylinder Financial Balance | -R5,117.50 |
| **Total Debtor Balance** | **R60,271.88** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 14kg | 23 | R575.00 | R13,225.00 |
| 19kg | -83 | R690.00 | -R57,270.00 |
| 9kg | 74 | R517.50 | R38,295.00 |
| Double-Valve (D.1) | -7 | R1,150.00 | -R8,050.00 |
| Single-Valve (S.1) | 1 | R1,150.00 | R1,150.00 |
| **Total** | **8** | — | **-R12,650.00** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position | -R5,117.50 | -R12,650.00 | +R7,532.50 |

**ERP Combined Balance:** R60,271.88  
**Reconstructed Balance:** R60,271.88  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
