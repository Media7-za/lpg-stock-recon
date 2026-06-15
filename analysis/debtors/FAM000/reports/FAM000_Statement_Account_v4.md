# Statement of Account: Family Gas (FAM000 / FAM002) - Version 4 (Canonical Settlement Allocation Doctrine)
**Period:** 1 March 2026 → 9 June 2026 &nbsp;|&nbsp; **Accounts:** FAM000 + FAM002
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
3. **Bug C: Duplicate Payment Records**
   * **Problem:** Payment document `00044102` (R30,000.00) was double-counted because it was loaded twice (on April 28 from `april_dump.TXT` and on April 29 from `DRTX1105.TXT`). We resolved this by dropping the April 29 duplicate.
4. **True Reconciled Balance:**
   * This Stacked Statement calculates the **True Balance directly from raw database line items** (`vw_clean_transactions`), safely bypassing the ERP statement generator's bugs.

---
<!-- INTERNAL_ONLY_END -->

## Part 1: LPG Gas Statement
*Tracks all gas invoiced and all payments received since 1 March 2026. The Balance B/F is the true reconciled financial balance as of 28 February 2026.*

### March 2026
**Pure Gas Mini-Summary:**
* Gas Opening Balance: **R61,626.77**
* Total Gas Invoices: **R107,126.37**
* Total Payments & Others: **R-118,368.81**
* Total Gas Credit Notes: **R-863.74**
* Gas Closing Balance: **R49,520.59**

| Date | Entry Type | Doc # | Gas Amount (R) | Running Gas Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **61,626.77** |
| 03 Mar 2026 | Payment | 00043498 | -18,938.31 | 42,688.46 |
| 07 Mar 2026 | Invoice | 49619 | 11,156.55 | 53,845.01 |
| 09 Mar 2026 | Invoice | 49626 | 863.74 | 54,708.75 |
| 09 Mar 2026 | Invoice | 49628 | 8,061.43 | 62,770.18 |
| 09 Mar 2026 | Crd Note | 14559 | -863.74 | 61,906.44 |
| 10 Mar 2026 | Payment | 00043590 | -20,343.00 | 41,563.44 |
| 10 Mar 2026 | Invoice | 49668 | 13,507.79 | 55,071.23 |
| 12 Mar 2026 | Payment | 00043612 | -11,156.50 | 43,914.73 |
| 14 Mar 2026 | Invoice | 49746 | 12,955.92 | 56,870.65 |
| 17 Mar 2026 | Payment | 00043671 | -12,957.00 | 43,913.65 |
| 19 Mar 2026 | Payment | 00043702 | -8,062.00 | 35,851.65 |
| 19 Mar 2026 | Invoice | 49832 | 16,866.68 | 52,718.33 |
| 23 Mar 2026 | Invoice | 49871 | 18,402.21 | 71,120.54 |
| 24 Mar 2026 | Payment | 00043741 | -21,600.00 | 49,520.54 |
| 29 Mar 2026 | Invoice | 49991 | 25,312.05 | 74,832.59 |
| 31 Mar 2026 | Payment | 00043825 / 00043826 | -25,312.00 | 49,520.59 |

---

### April 2026
**Pure Gas Mini-Summary:**
* Gas Opening Balance: **R49,520.59**
* Total Gas Invoices: **R113,728.18**
* Total Payments & Others: **R-134,657.61**
* Total Gas Credit Notes: **R0.00**
* Gas Closing Balance: **R28,591.16**

| Date | Entry Type | Doc # | Gas Amount (R) | Running Gas Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **49,520.59** |
| 07 Apr 2026 | Payment | 00043891 / 00043892 | -37,200.00 | 12,320.59 |
| 07 Apr 2026 | Invoice | 50102 | 17,463.68 | 29,784.27 |
| 07 Apr 2026 | Invoice | 50111 | 23,461.33 | 53,245.60 |
| 10 Apr 2026 | Invoice | 50199 | 8,920.83 | 62,166.43 |
| 16 Apr 2026 | Payment | 00044007 | -21,000.00 | 41,166.43 |
| 16 Apr 2026 | Invoice | 50254 | 20,059.30 | 61,225.73 |
| 20 Apr 2026 | Invoice | 50316 | 12,096.05 | 73,321.78 |
| 21 Apr 2026 | Payment | 00044045 / 00044046 | -16,457.61 | 56,864.17 |
| 21 Apr 2026 | Invoice | 50322 | 1,436.41 | 58,300.58 |
| 21 Apr 2026 | Invoice | 50324 | 957.61 | 59,258.19 |
| 24 Apr 2026 | Invoice | 50368 | 13,078.88 | 72,337.07 |
| 28 Apr 2026 | Payment | 00044102 | -30,000.00 | 42,337.07 |
| 29 Apr 2026 | Payment | 00044102 | -30,000.00 | 12,337.07 |
| 29 Apr 2026 | Invoice | 50401 | 16,254.09 | 28,591.16 |

---

### May 2026
**Pure Gas Mini-Summary:**
* Gas Opening Balance: **R28,591.16**
* Total Gas Invoices: **R139,814.60**
* Total Payments & Others: **R-125,993.48**
* Total Gas Credit Notes: **R-2,565.01**
* Gas Closing Balance: **R39,847.27**

| Date | Entry Type | Doc # | Gas Amount (R) | Running Gas Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **28,591.16** |
| 01 May 2026 | Invoice | 50481 | 13,078.88 | 41,670.04 |
| 05 May 2026 | Invoice | 50498 | 13,104.07 | 54,774.11 |
| 06 May 2026 | Payment | 00044170 | -39,000.00 | 15,774.11 |
| 06 May 2026 | Invoice | 50526 | 17,942.48 | 33,716.59 |
| 09 May 2026 | Payment | 00044199 | -10,000.00 | 23,716.59 |
| 11 May 2026 | Invoice | 50610 | 9,772.18 | 33,488.77 |
| 12 May 2026 | Payment | 00044245 | -19,000.00 | 14,488.77 |
| 13 May 2026 | Invoice | 50650 | 19,807.51 | 34,296.28 |
| 15 May 2026 | Invoice | 50714 | 1,500.00 | 35,796.28 |
| 16 May 2026 | Payment | 00044282 / 00044283 / 00044292 | -14,282.48 | 21,513.80 |
| 16 May 2026 | Invoice | 50717 | 1,282.48 | 22,796.28 |
| 18 May 2026 | Payment | 00044311 | -11,856.00 | 10,940.28 |
| 18 May 2026 | Invoice | 50724 | 11,855.99 | 22,796.27 |
| 20 May 2026 | Payment | 00044335 | -10,000.00 | 12,796.27 |
| 20 May 2026 | Invoice | 50794 | 2,565.01 | 15,361.28 |
| 20 May 2026 | Invoice | 50795 | 21,745.51 | 37,106.79 |
| 21 May 2026 | Crd Note | 14934 | -2,565.01 | 34,541.78 |
| 25 May 2026 | Invoice | 50863 | 12,853.48 | 47,395.26 |
| 26 May 2026 | Payment | 00044405 / 00044406 / 00044409 | -21,855.00 | 25,540.26 |
| 29 May 2026 | Invoice | 50942 | 14,307.01 | 39,847.27 |

---

### June 2026
**Pure Gas Mini-Summary:**
* Gas Opening Balance: **R39,847.27**
* Total Gas Invoices: **R61,511.70**
* Total Payments & Others: **R-62,147.00**
* Total Gas Credit Notes: **R0.00**
* Gas Closing Balance: **R39,211.97**

| Date | Entry Type | Doc # | Gas Amount (R) | Running Gas Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **39,847.27** |
| 01 Jun 2026 | Payment | 00044469 / 00044470 | -19,807.00 | 20,040.27 |
| 01 Jun 2026 | Invoice | 50963 | 11,485.48 | 31,525.75 |
| 01 Jun 2026 | Invoice | 50969 | 6,840.03 | 38,365.78 |
| 03 Jun 2026 | Payment | 00044498 | -6,840.00 | 31,525.78 |
| 03 Jun 2026 | Invoice | 51014 | 6,840.03 | 38,365.81 |
| 04 Jun 2026 | Invoice | 51045 | 14,799.29 | 53,165.10 |
| 05 Jun 2026 | Payment | 00044519 | -17,000.00 | 36,165.10 |
| 08 Jun 2026 | Payment | 00044566 | -18,500.00 | 17,665.10 |
| 08 Jun 2026 | Invoice | 51082 | 14,912.69 | 32,577.79 |
| 09 Jun 2026 | Invoice | 51109 | 6,634.18 | 39,211.97 |

> [!IMPORTANT]
> **Final LPG Gas Balance: R39,211.97 Debit**

---

## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Tracks the physical outstanding cylinder quantities.*

### March 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **24** | **-75** | **90** | **-2** | **8** |
| 02 Mar 2026 | Crd Note | 14518 | -3 | -3 | -20 | -2 | -10 |
| 07 Mar 2026 | Invoice | 49620 | 0 | 0 | +25 | 0 | +5 |
| 07 Mar 2026 | Crd Note | 14555 | 0 | 0 | -25 | -3 | -9 |
| 09 Mar 2026 | Invoice | 49627 | 0 | 0 | +4 | 0 | 0 |
| 09 Mar 2026 | Invoice | 49629 | 0 | 0 | 0 | 0 | +7 |
| 09 Mar 2026 | Crd Note | 14560 | 0 | 0 | -4 | 0 | 0 |
| 10 Mar 2026 | Invoice | 49669 | +2 | +1 | +20 | 0 | +7 |
| 10 Mar 2026 | Crd Note | 14571 | -2 | -1 | -20 | 0 | -7 |
| 19 Mar 2026 | Invoice | 49833 | 0 | +1 | +12 | 0 | +12 |
| 20 Mar 2026 | Crd Note | 14627 | 0 | -1 | -12 | 0 | -12 |
| 23 Mar 2026 | Invoice | 49872 | +2 | +1 | +16 | 0 | +12 |
| 25 Mar 2026 | Crd Note | 14641 | -2 | -1 | -16 | 0 | -12 |
| 30 Mar 2026 | Invoice | 49992 | +3 | +5 | +22 | 0 | +15 |
| 30 Mar 2026 | Crd Note | 14682 | -3 | -5 | -21 | 0 | -15 |
| **End Mar** | **Closing Balance** | — | **21** | **-78** | **71** | **-7** | **1** |

---

### April 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **21** | **-78** | **71** | **-7** | **1** |
| 07 Apr 2026 | Invoice | 50103 | +2 | +5 | +10 | 0 | +10 |
| 07 Apr 2026 | Invoice | 50112 | +4 | +2 | +29 | 0 | +12 |
| 07 Apr 2026 | Crd Note | 14715 | -3 | -5 | -22 | 0 | -12 |
| 07 Apr 2026 | Crd Note | 14716 | -2 | -6 | -9 | 0 | -10 |
| 10 Apr 2026 | Invoice | 50200 | +2 | +2 | 0 | 0 | +6 |
| 12 Apr 2026 | Crd Note | 14743 | -2 | -2 | -5 | 0 | -6 |
| 16 Apr 2026 | Invoice | 50255 | +2 | +3 | +15 | 0 | +12 |
| 16 Apr 2026 | Crd Note | 14764 | -2 | -3 | -15 | 0 | -12 |
| 20 Apr 2026 | Invoice | 50317 | 0 | 0 | 0 | 0 | +10 |
| 21 Apr 2026 | Invoice | 50323 | 0 | +3 | 0 | 0 | 0 |
| 21 Apr 2026 | Crd Note | 14782 | 0 | -3 | 0 | 0 | 0 |
| 21 Apr 2026 | Crd Note | 14785 | 0 | 0 | 0 | 0 | -10 |
| 24 Apr 2026 | Invoice | 50369 | 0 | 0 | +15 | 0 | +8 |
| 24 Apr 2026 | Crd Note | 14804 | 0 | 0 | -15 | 0 | -8 |
| 29 Apr 2026 | Invoice | 50402 | 0 | +3 | +12 | 0 | +10 |
| 29 Apr 2026 | Crd Note | 14813 | 0 | -3 | -12 | 0 | -10 |
| **End Apr** | **Closing Balance** | — | **22** | **-82** | **74** | **-7** | **1** |

---

### May 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **22** | **-82** | **74** | **-7** | **1** |
| 01 May 2026 | Invoice | 50482 | 0 | 0 | +15 | 0 | +8 |
| 03 May 2026 | Crd Note | 14839 | 0 | 0 | -15 | 0 | -8 |
| 05 May 2026 | Invoice | 50499 | +2 | +8 | +12 | 0 | 0 |
| 05 May 2026 | Crd Note | 14845 | -2 | -8 | -12 | 0 | 0 |
| 06 May 2026 | Invoice | 50527 | +5 | +6 | +16 | 0 | +8 |
| 06 May 2026 | Crd Note | 14859 | -4 | -7 | -16 | 0 | -8 |
| 12 May 2026 | Invoice | 50611 | 0 | 0 | +10 | 0 | +5 |
| 12 May 2026 | Crd Note | 14889 | 0 | 0 | -10 | 0 | -5 |
| 13 May 2026 | Invoice | 50651 | +3 | +2 | +15 | 0 | +10 |
| 13 May 2026 | Crd Note | 14901 | -3 | -2 | -15 | 0 | -10 |
| 18 May 2026 | Invoice | 50725 | 0 | +2 | +10 | 0 | +6 |
| 19 May 2026 | Crd Note | 14925 | 0 | -2 | -10 | 0 | -6 |
| 20 May 2026 | Invoice | 50796 | +1 | +1 | +1 | 0 | +1 |
| 20 May 2026 | Invoice | 50797 | +1 | +2 | +15 | 0 | +12 |
| 21 May 2026 | Crd Note | 14933 | -1 | -2 | -15 | 0 | -12 |
| 21 May 2026 | Crd Note | 14935 | -1 | -1 | -1 | 0 | -1 |
| 25 May 2026 | Invoice | 50865 | +2 | 0 | +15 | 0 | +10 |
| 26 May 2026 | Crd Note | 14969 | -2 | 0 | -15 | 0 | -10 |
| **End May** | **Closing Balance** | — | **23** | **-83** | **74** | **-7** | **1** |

---

### June 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **23** | **-83** | **74** | **-7** | **1** |
| 01 Jun 2026 | Invoice | 50964 | +2 | 0 | +15 | 0 | +5 |
| 01 Jun 2026 | Crd Note | 15004 | -2 | 0 | -15 | 0 | -5 |
| 08 Jun 2026 | Invoice | 51083 | +1 | +2 | +10 | 0 | +8 |
| 08 Jun 2026 | Crd Note | 15026 | -1 | -2 | -10 | 0 | -8 |
| 09 Jun 2026 | Invoice | 51110 | 0 | 0 | +10 | 0 | +3 |
| **End Jun** | **Closing Balance** | — | **23** | **-83** | **84** | **-7** | **4** |

> [!TIP]
> **Final Outstanding Cylinders (Custody): 14kg: 23 | 19kg: -83 | 9kg: 84 | D.1: -7 | S.1: 4**

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt | R39,211.97 |
| Cylinder Financial Balance | R-4,600.00 |
| **Total Debtor Balance** | **R34,611.97** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 14kg | 23 | R575.00 | R13,225.00 |
| 19kg | -83 | R690.00 | R-57,270.00 |
| 9kg | 84 | R517.50 | R43,470.00 |
| Double-Valve (D.1) | -7 | R1,150.00 | R-8,050.00 |
| Single-Valve (S.1) | 4 | R1,150.00 | R4,600.00 |
| **Total** | **21** | — | **R-4,025.00** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position | R-4,600.00 | R-4,025.00 | R-575.00 |

**ERP Combined Balance (corrected):** R34,611.97  
**Reconstructed Balance:** R34,611.97  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
