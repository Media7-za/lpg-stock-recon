# Statement of Account: Family Gas (FAM000 / FAM002) - DB-ONLY STRIPPED SCENARIO (CORRECTED)
**Data Source:** Supabase (transaction_headers & vw_clean_transactions)

> [!TIP]
> **Scenario Rules:** 
> * **Financials:** Opening Balance for 01 March dynamically calculated from DB historicals (R47,668.64 total - R-828.00 CYL = **R18,938.31** Gas Balance). Cylinder deposits dynamically subtracted. Pure-cylinder documents hidden.
> * **Cylinders:** Treated purely as physical assets owing. Cumulative historical balances retrieved from the database.

---

## Part 1: Financial Statement (Pure LPG Gas - Stripped)

### March 2026
**Pure Gas Mini-Summary:**
* Gas Opening Balance: **R18,938.31**
* Total Gas Invoices: **R127,468.93**
* Total Payments & Others: **R-118,368.81**
* Total Gas Credit Notes: **R-863.74**
* Gas Closing Balance: **R27,174.69**

| Date | Entry Type | Doc # | Gas Amount (R) | Running Gas Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **18,938.31** |
| 01 Mar 2026 | Invoice | 49501 | 20,342.56 | 39,280.87 |
| 03 Mar 2026 | Payment | 00043498 | -18,938.31 | 20,342.56 |
| 07 Mar 2026 | Invoice | 49619 | 11,156.55 | 31,499.11 |
| 09 Mar 2026 | Invoice | 49626 | 863.74 | 32,362.85 |
| 09 Mar 2026 | Invoice | 49628 | 8,061.43 | 40,424.28 |
| 09 Mar 2026 | Crd Note | 14559 | -863.74 | 39,560.54 |
| 10 Mar 2026 | Payment | 00043590 | -20,343.00 | 19,217.54 |
| 10 Mar 2026 | Invoice | 49668 | 13,507.79 | 32,725.33 |
| 12 Mar 2026 | Payment | 00043612 | -11,156.50 | 21,568.83 |
| 14 Mar 2026 | Invoice | 49746 | 12,955.92 | 34,524.75 |
| 17 Mar 2026 | Payment | 00043671 | -12,957.00 | 21,567.75 |
| 19 Mar 2026 | Payment | 00043702 | -8,062.00 | 13,505.75 |
| 19 Mar 2026 | Invoice | 49832 | 16,866.68 | 30,372.43 |
| 23 Mar 2026 | Invoice | 49871 | 18,402.21 | 48,774.64 |
| 24 Mar 2026 | Payment | 00043741 | -21,600.00 | 27,174.64 |
| 29 Mar 2026 | Invoice | 49991 | 25,312.05 | 52,486.69 |
| 31 Mar 2026 | Payment | 00043825 | -24,000.00 | 28,486.69 |
| 31 Mar 2026 | Payment | 00043826 | -1,312.00 | 27,174.69 |

---

### April 2026
**Pure Gas Mini-Summary:**
* Gas Opening Balance: **R27,174.69**
* Total Gas Invoices: **R113,728.18**
* Total Payments & Others: **R-104,657.61**
* Total Gas Credit Notes: **R0.00**
* Gas Closing Balance: **R36,245.26**

| Date | Entry Type | Doc # | Gas Amount (R) | Running Gas Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **27,174.69** |
| 07 Apr 2026 | Payment | 00043891 | -27,200.00 | -25.31 |
| 07 Apr 2026 | Payment | 00043892 | -10,000.00 | -10,025.31 |
| 07 Apr 2026 | Invoice | 50102 | 17,463.68 | 7,438.37 |
| 07 Apr 2026 | Invoice | 50111 | 23,461.33 | 30,899.70 |
| 10 Apr 2026 | Invoice | 50199 | 8,920.83 | 39,820.53 |
| 16 Apr 2026 | Payment | 00044007 | -21,000.00 | 18,820.53 |
| 16 Apr 2026 | Invoice | 50254 | 20,059.30 | 38,879.83 |
| 20 Apr 2026 | Invoice | 50316 | 12,096.05 | 50,975.88 |
| 21 Apr 2026 | Payment | 00044045 | -957.61 | 50,018.27 |
| 21 Apr 2026 | Payment | 00044046 | -15,500.00 | 34,518.27 |
| 21 Apr 2026 | Invoice | 50322 | 1,436.41 | 35,954.68 |
| 21 Apr 2026 | Invoice | 50324 | 957.61 | 36,912.29 |
| 24 Apr 2026 | Invoice | 50368 | 13,078.88 | 49,991.17 |
| 29 Apr 2026 | Payment | 00044102 | -30,000.00 | 19,991.17 |
| 29 Apr 2026 | Invoice | 50401 | 16,254.09 | 36,245.26 |

---

### May 2026
**Pure Gas Mini-Summary:**
* Gas Opening Balance: **R36,245.26**
* Total Gas Invoices: **R125,507.59**
* Total Payments & Others: **R-125,993.48**
* Total Gas Credit Notes: **R-2,565.01**
* Gas Closing Balance: **R33,194.36**

| Date | Entry Type | Doc # | Gas Amount (R) | Running Gas Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **36,245.26** |
| 01 May 2026 | Invoice | 50481 | 13,078.88 | 49,324.14 |
| 05 May 2026 | Invoice | 50498 | 13,104.07 | 62,428.21 |
| 06 May 2026 | Payment | 00044170 | -39,000.00 | 23,428.21 |
| 06 May 2026 | Invoice | 50526 | 17,942.48 | 41,370.69 |
| 09 May 2026 | Payment | 00044199 | -10,000.00 | 31,370.69 |
| 11 May 2026 | Invoice | 50610 | 9,772.18 | 41,142.87 |
| 12 May 2026 | Payment | 00044245 | -19,000.00 | 22,142.87 |
| 13 May 2026 | Invoice | 50650 | 19,807.51 | 41,950.38 |
| 15 May 2026 | Invoice | 50714 | 1,500.00 | 43,450.38 |
| 16 May 2026 | Payment | 00044282 | -11,500.00 | 31,950.38 |
| 16 May 2026 | Payment | 00044283 | -1,282.48 | 30,667.90 |
| 16 May 2026 | Payment | 00044292 | -1,500.00 | 29,167.90 |
| 16 May 2026 | Invoice | 50717 | 1,282.48 | 30,450.38 |
| 18 May 2026 | Payment | 00044311 | -11,856.00 | 18,594.38 |
| 18 May 2026 | Invoice | 50724 | 11,855.99 | 30,450.37 |
| 20 May 2026 | Payment | 00044335 | -10,000.00 | 20,450.37 |
| 20 May 2026 | Invoice | 50794 | 2,565.01 | 23,015.38 |
| 20 May 2026 | Invoice | 50795 | 21,745.51 | 44,760.89 |
| 21 May 2026 | Crd Note | 14934 | -2,565.01 | 42,195.88 |
| 25 May 2026 | Invoice | 50863 | 12,853.48 | 55,049.36 |
| 26 May 2026 | Payment | 00044405 | -12,855.00 | 42,194.36 |
| 26 May 2026 | Payment | 00044409 | -9,000.00 | 33,194.36 |

---

## Part 2: Cylinder Physical Asset Tracker

### March 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **21** | **-78** | **70** | **-2** | **-4** |
| 01 Mar 2026 | Invoice | 49502 | +3 | +3 | +20 | 0 | +12 |
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
