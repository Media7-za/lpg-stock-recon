# Statement of Account: Family Gas (FAM000 ONLY)
**Period:** March 2026 → Latest &nbsp;|&nbsp; **Account:** FAM000

---

## ⚠️ Audit Disclosure & Executive Summary

During the reconciliation of FAM000, we uncovered critical ERP reporting bugs that severely distort the customer's ledger balance in the database header table (`transaction_headers`).

### 🔍 Key Findings:
1. **Bug A: Credit Note Double-Taxation in Database Headers**
   * **Problem:** The physical CSV statement is correct, but the ERP database header table incorrectly records the tax-inclusive total (e.g. `-R7,705.00`) inside the `amount_excl` field for Credit Notes. Any database query summing `amount_excl + tax_amount` double-taxes the transaction, resulting in an artificial `-R8,710.00` total.
   * **Solution:** Our reconciliation logic sums the raw line items (`line_total` from `vw_clean_transactions`) directly, safely bypassing this header-level bug.
2. **Bug B: Re-Used Document Numbers & Truncated History**
   * **Problem:** The ERP re-uses document numbers across different financial years. Because the statement was generated for the "CURRENT" year, historical line items were hidden in the `Balance B/F`, creating an artificially inflated starting balance and giving the false illusion that the ERP was randomly dropping lines from mixed documents.
3. **True Reconciled Balance:**
   * This Stacked Statement calculates the **True Balance directly from raw database line items** (`vw_clean_transactions`), safely bypassing the ERP statement generator's bugs.

---

## Part 1: LPG Gas Statement
*Tracks all gas invoiced and all payments received since 1 March 2026. The Balance B/F is the true reconciled financial balance as of 28 February 2026.*

| Date | Entry Type | Doc # | Amount (R) | Running Balance (R) |
| :--- | :--- | :--- | ---: | ---: |
| **28 Feb 2026** | **Balance B/F** | — | | **61,626.78** |
| 02 Mar 2026 | Payment | 43498 | -18,938.31 | 42,688.47 |
| 06 Mar 2026 | Invoice | 49619 / 49620 | 11,156.55 | 53,845.02 |
| 08 Mar 2026 | Crd Note | 14559 / 14560 | -863.74 | 52,981.28 |
| 08 Mar 2026 | Invoice | 49626 / 49627 / 49628 / 49629 | 8,925.17 | 61,906.45 |
| 09 Mar 2026 | Payment | 43590 / 43590 / 43590 / 43590 | -20,343.00 | 41,563.45 |
| 09 Mar 2026 | Invoice | 49668 / 49669 | 13,507.79 | 55,071.24 |
| 11 Mar 2026 | Payment | 43612 | -11,156.50 | 43,914.74 |
| 13 Mar 2026 | Invoice | 49746 | 12,955.92 | 56,870.66 |
| 16 Mar 2026 | Payment | 43671 / 43671 | -12,957.00 | 43,913.66 |
| 18 Mar 2026 | Payment | 43702 / 43702 | -8,062.00 | 35,851.66 |
| 18 Mar 2026 | Invoice | 49832 / 49833 | 16,866.68 | 52,718.34 |
| 22 Mar 2026 | Invoice | 49871 / 49872 | 18,402.21 | 71,120.55 |
| 23 Mar 2026 | Payment | 43741 / 43741 | -21,600.00 | 49,520.55 |
| 28 Mar 2026 | Invoice | 49991 | 25,312.05 | 74,832.60 |
| 30 Mar 2026 | Payment | 43825 / 43826 | -25,312.00 | 49,520.60 |
| 06 Apr 2026 | Payment | 43891 / 43891 / 43891 / 43892 | -37,200.00 | 12,320.60 |
| 06 Apr 2026 | Invoice | 50102 / 50103 / 50111 / 50112 | 40,925.01 | 53,245.61 |
| 09 Apr 2026 | Invoice | 50199 / 50200 | 8,920.83 | 62,166.44 |
| 15 Apr 2026 | Payment | 44007 / 44007 / 44007 / 44007 / 44007 / 44007 / 44007 / 44007 / 44007 | -21,000.00 | 41,166.44 |
| 15 Apr 2026 | Invoice | 50254 / 50255 | 20,059.30 | 61,225.74 |
| 19 Apr 2026 | Invoice | 50316 / 50317 | 12,096.05 | 73,321.79 |
| 20 Apr 2026 | Payment | 44046 / 44046 / 44046 | -15,500.00 | 57,821.79 |
| 20 Apr 2026 | Invoice | 50322 / 50323 / 50324 | 2,394.02 | 60,215.81 |
| 23 Apr 2026 | Invoice | 50368 / 50369 | 13,078.88 | 73,294.69 |
| 28 Apr 2026 | Payment | 44102 / 44102 / 44102 | -30,000.00 | 43,294.69 |
| 28 Apr 2026 | Invoice | 50401 / 50402 | 16,254.09 | 59,548.78 |
| 30 Apr 2026 | Invoice | 50481 / 50482 | 13,078.88 | 72,627.66 |
| 04 May 2026 | Invoice | 50498 / 50499 | 13,104.07 | 85,731.73 |
| 05 May 2026 | Payment | 44170 / 44170 / 44170 | -39,000.00 | 46,731.73 |
| 05 May 2026 | Invoice | 50526 / 50527 | 17,942.48 | 64,674.21 |
| 08 May 2026 | Payment | 44199 / 44199 / 44199 | -10,000.00 | 54,674.21 |
| 10 May 2026 | Invoice | 50610 | 9,772.18 | 64,446.39 |

> [!IMPORTANT]
> **Final LPG Gas Balance: R64,446.39 Debt**

---

## Part 2: Cylinder (CYL) Ledger
*Tracks the physical outstanding cylinder quantities.*

| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **28 Feb 2026** | **Balance B/F** | — | **13** | **-43** | **52** | **-1** | **11** |
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
| **TOTAL OUTSTANDING** | — | — | **12** | **-51** | **36** | **-6** | **4** |

> [!TIP]
> **Final CYL Deposit Value (Net Balances Only): R27,000.00 Debt**

---

## 🧮 Final Reconciliation

* **LPG Gas Balance:** R64,446.39 Debt
* **CYL Deposit Debt:** R27,000.00 Debt
* **Reconciled True Total Account Balance: R91,446.39 Debt**
