# Internal ledger: BLUFF MEAT SUPPLY(PTY) LTD (MD0003), matcher review
**INTERNAL, not for the customer.** Every transaction in ERP order with the ERP running balance and what matcher v5 did with it · generated 2026-10-10 · 95 confirmed / 0 probable ties · 32 rows open · ERP `CURRENT BALANCE` R16,547.81 · matcher v5 ratified 2026-10-10; probable ties are proposals until approved · **REVIEW ONLY:** ingestCoverage partial

**Status key:** `OPEN` untied · `T0001 EXACT_SINGLE ✓` confirmed tie · `T0001 BATCH_SUM ?` probable tie (needs approval) · `LOCKED` operator-approved lock · `◀ ZERO` ERP running balance is within R0.05 after this line.

---

### February 2025

Opening balance (ERP running): **R52,607.52**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Feb 2025 | Payment | 37143 | TRANSF \| STAT:112 | LPG | -15,295.33 | 37,312.19 | OPEN |
| 03 Feb 2025 | Payment | 37144 | TRANSF \| STAT:112 | LPG | -4,441.70 | 32,870.49 | OPEN |

### March 2025

Opening balance (ERP running): **R32,870.49**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Mar 2025 | Payment | 37262 | TRANSF \| STAT:113 | LPG | -4,653.98 | 28,216.51 | OPEN |
| 03 Mar 2025 | Payment | 37263 | TRANSF \| STAT:113 | LPG | -17,064.59 | 11,151.92 | OPEN |
| 08 Mar 2025 | Crd Note | 12030 | DN#11738-EMPTY VICT | CYL | -3,622.50 | 7,529.42 | T0015 CN_DN_PAIR ✓ ↔ Inv 41325 |
| 08 Mar 2025 | Invoice | 41324 | DN#11738 - 245472 | LPG | 4,689.96 | 12,219.38 | T0088 EXACT_SINGLE ✓ ↔ Pmt 38372 |
| 08 Mar 2025 | Invoice | 41325 | DN#11738-EMPTY VICT | CYL | 3,622.50 | 15,841.88 | T0015 CN_DN_PAIR ✓ ↔ Crd Note 12030 |

### April 2025

Opening balance (ERP running): **R15,841.88**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Apr 2025 | Invoice | 42011 | DN#12997 | LPG | 4,689.96 | 20,531.84 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 12220 |
| 04 Apr 2025 | Invoice | 42012 | DN#12997-EMPTY | CYL | 3,622.50 | 24,154.34 | T0016 CN_DN_PAIR ✓ ↔ Crd Note 12200 |
| 04 Apr 2025 | Invoice | 42092 | DN#12997-250758 VICT | LPG | 3,808.83 | 27,963.17 | T0089 EXACT_MONTH_SUM ✓ ↔ Pmt 39145, Inv 42046, Inv 42279, Inv 42318 +1 |
| 05 Apr 2025 | Crd Note | 12200 | DN#12997-EMPTY | CYL | -3,622.50 | 24,340.67 | T0016 CN_DN_PAIR ✓ ↔ Inv 42012 |
| 07 Apr 2025 | Crd Note | 12211 | DN#10544-EMPTY | CYL | -2,415.00 | 21,925.67 | T0017 CN_DN_PAIR ✓ ↔ Inv 42047 |
| 07 Apr 2025 | Crd Note | 12220 | DN#12997 | LPG | -4,689.96 | 17,235.71 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Inv 42011 |
| 07 Apr 2025 | Payment | 37817 | TRANSF \| STAT:114 | LPG | -15,633.20 | 1,602.51 | OPEN |
| 07 Apr 2025 | Invoice | 42046 | DN#10544 | LPG | 2,539.22 | 4,141.73 | T0089 EXACT_MONTH_SUM ✓ ↔ Pmt 39145, Inv 42092, Inv 42279, Inv 42318 +1 |
| 07 Apr 2025 | Invoice | 42047 | DN#10544-EMPTY | CYL | 2,415.00 | 6,556.73 | T0017 CN_DN_PAIR ✓ ↔ Crd Note 12211 |
| 15 Apr 2025 | Crd Note | 12278 | DN#13067-EMPTY | CYL | -3,622.50 | 2,934.23 | T0018 CN_DN_PAIR ✓ ↔ Inv 42280 |
| 15 Apr 2025 | Invoice | 42279 | DN#13067- 245210 | LPG | 3,808.83 | 6,743.06 | T0089 EXACT_MONTH_SUM ✓ ↔ Pmt 39145, Inv 42092, Inv 42046, Inv 42318 +1 |
| 15 Apr 2025 | Invoice | 42280 | DN#13067-EMPTY | CYL | 3,622.50 | 10,365.56 | T0018 CN_DN_PAIR ✓ ↔ Crd Note 12278 |
| 16 Apr 2025 | Crd Note | 12285 | DN#13017-EMPTY | CYL | -9,660.00 | 705.56 | T0019 CN_DN_PAIR ✓ ↔ Inv 42319 |
| 16 Apr 2025 | Invoice | 42318 | DN#13017 ROSE-24984 | LPG | 10,156.89 | 10,862.45 | T0089 EXACT_MONTH_SUM ✓ ↔ Pmt 39145, Inv 42092, Inv 42046, Inv 42279 +1 |
| 16 Apr 2025 | Invoice | 42319 | DN#13017-EMPTY | CYL | 9,660.00 | 20,522.45 | T0019 CN_DN_PAIR ✓ ↔ Crd Note 12285 |
| 30 Apr 2025 | Invoice | 42676 | 256821- DN13179 | LPG | 3,808.83 | 24,331.28 | T0089 EXACT_MONTH_SUM ✓ ↔ Pmt 39145, Inv 42092, Inv 42046, Inv 42279 +1 |
| 30 Apr 2025 | Invoice | 42677 | DN#13179-EMPTY | CYL | 3,622.50 | 27,953.78 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 12386 |

### May 2025

Opening balance (ERP running): **R27,953.78**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 May 2025 | Crd Note | 12386 | DN#13179-EMPTY | CYL | -3,622.50 | 24,331.28 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Inv 42677 |
| 02 May 2025 | Payment | 38372 | TRANSF \| STAT:115 | LPG | -4,689.96 | 19,641.32 | T0088 EXACT_SINGLE ✓ ↔ Inv 41324 |
| 14 May 2025 | Crd Note | 12482 | DN#13141-EMPTY | CYL | -3,622.50 | 16,018.82 | T0020 CN_DN_PAIR ✓ ↔ Inv 43063 |
| 14 May 2025 | Invoice | 43062 | DN#13141 | LPG | 3,808.83 | 19,827.65 | T0090 EXACT_SUM ✓ ↔ Pmt 39816, Inv 43377, Inv 43319 |
| 14 May 2025 | Invoice | 43063 | DN#13141-EMPTY | CYL | 3,622.50 | 23,450.15 | T0020 CN_DN_PAIR ✓ ↔ Crd Note 12482 |
| 23 May 2025 | Crd Note | 12548 | DN#12111- ROSE 24986 | LPG | -2,577.63 | 20,872.52 | T0021 CN_DN_PAIR ✓ ↔ Inv 43290 |
| 23 May 2025 | Crd Note | 12549 | DN#12111- ROSEDALE | CYL | -2,415.00 | 18,457.52 | T0022 CN_DN_PAIR ✓ ↔ Inv 43289 |
| 23 May 2025 | Invoice | 43289 | DN#12111- ROSEDALE | CYL | 2,415.00 | 20,872.52 | T0022 CN_DN_PAIR ✓ ↔ Crd Note 12549 |
| 23 May 2025 | Invoice | 43290 | DN#12111- ROSE 24986 | LPG | 2,577.63 | 23,450.15 | T0021 CN_DN_PAIR ✓ ↔ Crd Note 12548 |
| 24 May 2025 | Invoice | 43319 | DN#12111-ROSE | LPG | 2,577.63 | 26,027.78 | T0090 EXACT_SUM ✓ ↔ Pmt 39816, Inv 43377, Inv 43062 |
| 27 May 2025 | Crd Note | 12574 | DN#12119-EMPTY | CYL | -3,622.50 | 22,405.28 | T0023 CN_DN_PAIR ✓ ↔ Inv 43378 |
| 27 May 2025 | Invoice | 43377 | DN#12119-VICTORIA | LPG | 3,866.45 | 26,271.73 | T0090 EXACT_SUM ✓ ↔ Pmt 39816, Inv 43319, Inv 43062 |
| 27 May 2025 | Invoice | 43378 | DN#12119-EMPTY | CYL | 3,622.50 | 29,894.23 | T0023 CN_DN_PAIR ✓ ↔ Crd Note 12574 |
| 27 May 2025 | Invoice | 43387 | DN#12268- MKONDENI | LPG | 2,577.63 | 32,471.86 | OPEN |

### June 2025

Opening balance (ERP running): **R32,471.86**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Jun 2025 | Payment | 39145 | TRANSF \| STAT:116 | LPG | -24,122.60 | 8,349.26 | T0089 EXACT_MONTH_SUM ✓ ↔ Inv 42092, Inv 42046, Inv 42279, Inv 42318 +1 |
| 05 Jun 2025 | Invoice | 43636 | ROSEDALE- DN#12297 | CYL | 1,265.00 | 9,614.26 | OPEN |
| 05 Jun 2025 | Invoice | 43636 | ROSEDALE- DN#12297 | LPG | 751.80 | 10,366.06 | OPEN |
| 09 Jun 2025 | Crd Note | 12664 | DN#12361-EMPTY | CYL | -3,622.50 | 6,743.56 | T0024 CN_DN_PAIR ✓ ↔ Inv 43722 |
| 09 Jun 2025 | Invoice | 43721 | DN#12361 | LPG | 3,866.45 | 10,610.01 | T0008 REMITTANCE ✓ ↔ Pmt 42051, Inv 45437, Inv 45895, Inv 46055 +6 |
| 09 Jun 2025 | Invoice | 43722 | DN#12361-EMPTY | CYL | 3,622.50 | 14,232.51 | T0024 CN_DN_PAIR ✓ ↔ Crd Note 12664 |
| 12 Jun 2025 | Crd Note | 12714 | DN#12385-EMPTY | CYL | -7,245.00 | 6,987.51 | T0025 CN_DN_PAIR ✓ ↔ Inv 43879 |
| 12 Jun 2025 | Invoice | 43878 | DN#12385 | LPG | 7,511.13 | 14,498.64 | OPEN |
| 12 Jun 2025 | Invoice | 43879 | DN#12385-EMPTY | CYL | 7,245.00 | 21,743.64 | T0025 CN_DN_PAIR ✓ ↔ Crd Note 12714 |
| 23 Jun 2025 | Crd Note | 12788 | DN#12586-EMPTY | CYL | -3,622.50 | 18,121.14 | T0026 CN_DN_PAIR ✓ ↔ Inv 44137 |
| 23 Jun 2025 | Invoice | 44136 | DN#12586 - 245285 | LPG | 3,755.57 | 21,876.71 | T0091 EXACT_SINGLE ✓ ↔ Pmt 40430 |
| 23 Jun 2025 | Invoice | 44137 | DN#12586-EMPTY | CYL | 3,622.50 | 25,499.21 | T0026 CN_DN_PAIR ✓ ↔ Crd Note 12788 |

### July 2025

Opening balance (ERP running): **R25,499.21**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Jul 2025 | Payment | 39816 | TRANSF \| STAT:117 | LPG | -10,252.91 | 15,246.30 | T0090 EXACT_SUM ✓ ↔ Inv 43377, Inv 43319, Inv 43062 |
| 02 Jul 2025 | Crd Note | 12880 | DN#12151-EMPTY | CYL | -3,622.50 | 11,623.80 | T0027 CN_DN_PAIR ✓ ↔ Inv 44440 |
| 02 Jul 2025 | Invoice | 44439 | DN#12151 | LPG | 3,755.57 | 15,379.37 | T0092 EXACT_SUM ✓ ↔ Pmt 41044, Inv 45435, Inv 44634 |
| 02 Jul 2025 | Invoice | 44440 | DN#12151-EMPTY | CYL | 3,622.50 | 19,001.87 | T0027 CN_DN_PAIR ✓ ↔ Crd Note 12880 |
| 08 Jul 2025 | Crd Note | 12927 | DN#12173-EMPTY | CYL | -2,415.00 | 16,586.87 | T0028 CN_DN_PAIR ✓ ↔ Inv 44635 |
| 08 Jul 2025 | Invoice | 44634 | DN#12173-MKONDENI | LPG | 2,456.12 | 19,042.99 | T0092 EXACT_SUM ✓ ↔ Pmt 41044, Inv 45435, Inv 44439 |
| 08 Jul 2025 | Invoice | 44635 | DN#12173-EMPTY | CYL | 2,415.00 | 21,457.99 | T0028 CN_DN_PAIR ✓ ↔ Crd Note 12927 |
| 16 Jul 2025 | Crd Note | 12996 | DN#12642-EMPTY | CYL | -6,037.50 | 15,420.49 | T0029 CN_DN_PAIR ✓ ↔ Inv 44873 |
| 16 Jul 2025 | Invoice | 44872 | DN#12642-ROSEDALE | LPG | 6,140.31 | 21,560.80 | OPEN |
| 16 Jul 2025 | Invoice | 44873 | DN#12642-EMPTY | CYL | 6,037.50 | 27,598.30 | T0029 CN_DN_PAIR ✓ ↔ Crd Note 12996 |
| 18 Jul 2025 | Crd Note | 13011 | DN#12715-EMPTY- VICT | CYL | -3,622.50 | 23,975.80 | T0030 CN_DN_PAIR ✓ ↔ Inv 44938 |
| 18 Jul 2025 | Invoice | 44937 | 257203- DN#12715 | LPG | 3,684.19 | 27,659.99 | T0093 EXACT_SUM ✓ ↔ Pmt 41501, Inv 45778, Inv 45787 |
| 18 Jul 2025 | Invoice | 44938 | DN#12715-EMPTY- VICT | CYL | 3,622.50 | 31,282.49 | T0030 CN_DN_PAIR ✓ ↔ Crd Note 13011 |
| 26 Jul 2025 | Crd Note | 13062 | ON 257219 | CYL | -3,622.50 | 27,659.99 | T0006 LOCKED:OPERATOR_RULING [exact] ↔ Inv 45161 |
| 26 Jul 2025 | Invoice | 45160 | ON:257219 DN20011 | LPG | 3,684.19 | 31,344.18 | OPEN |
| 26 Jul 2025 | Invoice | 45161 | ON 257219 | CYL | 3,622.50 | 34,966.68 | T0006 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 13062 |

### August 2025

Opening balance (ERP running): **R34,966.68**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Aug 2025 | Payment | 40430 | TRANSF \| STAT:118 | LPG | -3,755.57 | 31,211.11 | T0091 EXACT_SINGLE ✓ ↔ Inv 44136 |
| 06 Aug 2025 | Crd Note | 13151 | DN#20138-EMPTY VICT | CYL | -3,622.50 | 27,588.61 | T0031 CN_DN_PAIR ✓ ↔ Inv 45436 |
| 06 Aug 2025 | Crd Note | 13152 | DN#20139-EMPTY-ROSE | CYL | -4,830.00 | 22,758.61 | T0032 CN_DN_PAIR ✓ ↔ Inv 45438 |
| 06 Aug 2025 | Invoice | 45435 | DN#20138- VICTORIA | LPG | 3,684.19 | 26,442.80 | T0092 EXACT_SUM ✓ ↔ Pmt 41044, Inv 44634, Inv 44439 |
| 06 Aug 2025 | Invoice | 45436 | DN#20138-EMPTY VICT | CYL | 3,622.50 | 30,065.30 | T0031 CN_DN_PAIR ✓ ↔ Crd Note 13151 |
| 06 Aug 2025 | Invoice | 45437 | DN#20139 | LPG | 4,912.25 | 34,977.55 | T0008 REMITTANCE ✓ ↔ Pmt 42051, Inv 43721, Inv 45895, Inv 46055 +6 |
| 06 Aug 2025 | Invoice | 45438 | DN#20139-EMPTY-ROSE | CYL | 4,830.00 | 39,807.55 | T0032 CN_DN_PAIR ✓ ↔ Crd Note 13152 |
| 20 Aug 2025 | Crd Note | 13275 | MKONDENI DN20430 EMP | CYL | -2,415.00 | 37,392.55 | T0033 CN_DN_PAIR ✓ ↔ Inv 45779 |
| 20 Aug 2025 | Invoice | 45778 | MKONDENI- DN20430 | LPG | 2,398.72 | 39,791.27 | T0093 EXACT_SUM ✓ ↔ Pmt 41501, Inv 45787, Inv 44937 |
| 20 Aug 2025 | Invoice | 45779 | MKONDENI DN20430 EMP | CYL | 2,415.00 | 42,206.27 | T0033 CN_DN_PAIR ✓ ↔ Crd Note 13275 |
| 20 Aug 2025 | Invoice | 45787 | DN#20430 MKONDENI | LPG | 150.02 | 42,356.29 | T0093 EXACT_SUM ✓ ↔ Pmt 41501, Inv 45778, Inv 44937 |
| 26 Aug 2025 | Crd Note | 13311 | DN#20443- EMPTY | CYL | -3,622.50 | 38,733.79 | T0034 CN_DN_PAIR ✓ ↔ Inv 45896 |
| 26 Aug 2025 | Invoice | 45895 | 257284- DN20443 VICT | LPG | 3,598.07 | 42,331.86 | T0008 REMITTANCE ✓ ↔ Pmt 42051, Inv 43721, Inv 45437, Inv 46055 +6 |
| 26 Aug 2025 | Invoice | 45896 | DN#20443- EMPTY | CYL | 3,622.50 | 45,954.36 | T0034 CN_DN_PAIR ✓ ↔ Crd Note 13311 |

### September 2025

Opening balance (ERP running): **R45,954.36**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Sept 2025 | Payment | 41044 | TRANSF \| STAT:119 | LPG | -9,895.88 | 36,058.48 | T0092 EXACT_SUM ✓ ↔ Inv 45435, Inv 44634, Inv 44439 |
| 01 Sept 2025 | Invoice | 46055 | DN#20353 | LPG | 4,797.43 | 40,855.91 | T0008 REMITTANCE ✓ ↔ Pmt 42051, Inv 43721, Inv 45437, Inv 45895 +6 |
| 01 Sept 2025 | Invoice | 46056 | DN#20353-EMPTY ROSE | CYL | 4,830.00 | 45,685.91 | T0035 CN_DN_PAIR ✓ ↔ Crd Note 13353 |
| 02 Sept 2025 | Crd Note | 13353 | DN#20353-EMPTY ROSE | CYL | -4,830.00 | 40,855.91 | T0035 CN_DN_PAIR ✓ ↔ Inv 46056 |
| 02 Sept 2025 | Invoice | 46075 | DN#20569- VICTORIA | LPG | 3,598.07 | 44,453.98 | T0008 REMITTANCE ✓ ↔ Pmt 42051, Inv 43721, Inv 45437, Inv 45895 +6 |
| 02 Sept 2025 | Invoice | 46076 | DN#20569-EMPTY | CYL | 3,622.50 | 48,076.48 | T0036 CN_DN_PAIR ✓ ↔ Crd Note 13365 |
| 03 Sept 2025 | Crd Note | 13365 | DN#20569-EMPTY | CYL | -3,622.50 | 44,453.98 | T0036 CN_DN_PAIR ✓ ↔ Inv 46076 |
| 12 Sept 2025 | Crd Note | 13458 | DN#20483-EMPTY | CYL | -3,622.50 | 40,831.48 | T0037 CN_DN_PAIR ✓ ↔ Inv 46335 |
| 12 Sept 2025 | Invoice | 46334 | DN#20483- VICTORIA | LPG | 3,432.06 | 44,263.54 | T0008 REMITTANCE ✓ ↔ Pmt 42051, Inv 43721, Inv 45437, Inv 45895 +6 |
| 12 Sept 2025 | Invoice | 46335 | DN#20483-EMPTY | CYL | 3,622.50 | 47,886.04 | T0037 CN_DN_PAIR ✓ ↔ Crd Note 13458 |
| 17 Sept 2025 | Crd Note | 13494 | DN#20387-EMPTY- ROS | CYL | -3,047.50 | 44,838.54 | OPEN |
| 17 Sept 2025 | Invoice | 46444 | DN#20387- ROSEDALE | LPG | 2,740.88 | 47,579.42 | T0008 REMITTANCE ✓ ↔ Pmt 42051, Inv 43721, Inv 45437, Inv 45895 +6 |
| 17 Sept 2025 | Invoice | 46445 | DN#20387-EMPTY- ROS | CYL | 3,105.00 | 50,684.42 | T0008 REMITTANCE ✓ ↔ Pmt 42051, Inv 43721, Inv 45437, Inv 45895 +6 |
| 29 Sept 2025 | Crd Note | 13569 | DN#20085-EMPTY-VICTO | CYL | -3,622.50 | 47,061.92 | T0038 CN_DN_PAIR ✓ ↔ Inv 46725 |
| 29 Sept 2025 | Invoice | 46724 | DN#20085-VICTORIA | LPG | 3,432.06 | 50,493.98 | T0008 REMITTANCE ✓ ↔ Pmt 42051, Inv 43721, Inv 45437, Inv 45895 +6 |
| 29 Sept 2025 | Invoice | 46725 | DN#20085-EMPTY-VICTO | CYL | 3,622.50 | 54,116.48 | T0038 CN_DN_PAIR ✓ ↔ Crd Note 13569 |
| 30 Sept 2025 | Invoice | 46760 | DN#21078-MKONDENI | LPG | 2,288.04 | 56,404.52 | T0008 REMITTANCE ✓ ↔ Pmt 42051, Inv 43721, Inv 45437, Inv 45895 +6 |
| 30 Sept 2025 | Invoice | 46761 | DN#21078-EMPTY MKOND | CYL | 2,415.00 | 58,819.52 | T0039 CN_DN_PAIR ✓ ↔ Crd Note 13586 |

### October 2025

Opening balance (ERP running): **R58,819.52**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Oct 2025 | Crd Note | 13586 | DN#21078-EMPTY MKOND | CYL | -2,415.00 | 56,404.52 | T0039 CN_DN_PAIR ✓ ↔ Inv 46761 |
| 01 Oct 2025 | Payment | 41501 | TRANSF \| STAT:120 | LPG | -6,232.93 | 50,171.59 | T0093 EXACT_SUM ✓ ↔ Inv 45778, Inv 45787, Inv 44937 |
| 03 Oct 2025 | Crd Note | 13608 | DN#21094-EMPTY | CYL | -3,622.50 | 46,549.09 | T0040 CN_DN_PAIR ✓ ↔ Inv 46862 |
| 03 Oct 2025 | Invoice | 46861 | DN#21094 | LPG | 3,432.06 | 49,981.15 | OPEN |
| 03 Oct 2025 | Invoice | 46862 | DN#21094-EMPTY | CYL | 3,622.50 | 53,603.65 | T0040 CN_DN_PAIR ✓ ↔ Crd Note 13608 |
| 14 Oct 2025 | Invoice | 47094 | DN#20722 | LPG | 3,432.06 | 57,035.71 | OPEN |
| 14 Oct 2025 | Invoice | 47095 | DN#20722-EMPTY | CYL | 3,622.50 | 60,658.21 | T0041 CN_DN_PAIR ✓ ↔ Crd Note 13683 |
| 15 Oct 2025 | Crd Note | 13683 | DN#20722-EMPTY | CYL | -3,622.50 | 57,035.71 | T0041 CN_DN_PAIR ✓ ↔ Inv 47095 |
| 15 Oct 2025 | Invoice | 47101 | DN#20723- ROSEDALE | LPG | 5,720.10 | 62,755.81 | OPEN |
| 15 Oct 2025 | Invoice | 47102 | DN#20723-EMPTY | CYL | 6,037.50 | 68,793.31 | T0042 CN_DN_PAIR ✓ ↔ Crd Note 13689 |
| 16 Oct 2025 | Crd Note | 13689 | DN#20723-EMPTY | CYL | -6,037.50 | 62,755.81 | T0042 CN_DN_PAIR ✓ ↔ Inv 47102 |
| 27 Oct 2025 | Crd Note | 13754 | DN#20628-EMPTY | CYL | -3,622.50 | 59,133.31 | T0043 CN_DN_PAIR ✓ ↔ Inv 47334 |
| 27 Oct 2025 | Invoice | 47333 | DN#20628- VICTORIA | LPG | 3,432.06 | 62,565.37 | OPEN |
| 27 Oct 2025 | Invoice | 47334 | DN#20628-EMPTY | CYL | 3,622.50 | 66,187.87 | T0043 CN_DN_PAIR ✓ ↔ Crd Note 13754 |

### November 2025

Opening balance (ERP running): **R66,187.87**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Nov 2025 | Payment | 42051 | TRANSF \| STAT:121 | LPG | -35,770.31 | 30,417.56 | T0008 REMITTANCE ✓ ↔ Inv 43721, Inv 45437, Inv 45895, Inv 46055 +6 |
| 08 Nov 2025 | Invoice | 47558 | DN#20807- VICTORIA | LPG | 3,360.06 | 33,777.62 | OPEN |
| 12 Nov 2025 | Invoice | 47622 | DN#20787-MKONDENI | LPG | 2,240.04 | 36,017.66 | OPEN |
| 12 Nov 2025 | Invoice | 47623 | DN#20787-EMPTY | CYL | 2,415.00 | 38,432.66 | T0044 CN_DN_PAIR ✓ ↔ Crd Note 13846 |
| 13 Nov 2025 | Crd Note | 13846 | DN#20787-EMPTY | CYL | -2,415.00 | 36,017.66 | T0044 CN_DN_PAIR ✓ ↔ Inv 47623 |
| 18 Nov 2025 | Crd Note | 13883 | DN#21158-EMPTY | CYL | -6,037.50 | 29,980.16 | T0045 CN_DN_PAIR ✓ ↔ Inv 47735 |
| 18 Nov 2025 | Invoice | 47734 | DN#21158 | LPG | 5,600.10 | 35,580.26 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 13916 |
| 18 Nov 2025 | Invoice | 47735 | DN#21158-EMPTY | CYL | 6,037.50 | 41,617.76 | T0045 CN_DN_PAIR ✓ ↔ Crd Note 13883 |
| 19 Nov 2025 | Crd Note | 13895 | DN#20843-EMPTY | CYL | -3,622.50 | 37,995.26 | T0046 CN_DN_PAIR ✓ ↔ Inv 47764 |
| 19 Nov 2025 | Invoice | 47763 | DN#20843- VICTORIA | LPG | 3,360.06 | 41,355.32 | T0047 CN_DN_PAIR ✓ ↔ Crd Note 13917 |
| 19 Nov 2025 | Invoice | 47764 | DN#20843-EMPTY | CYL | 3,622.50 | 44,977.82 | T0046 CN_DN_PAIR ✓ ↔ Crd Note 13895 |
| 20 Nov 2025 | Crd Note | 13916 | DN#21158 | LPG | -5,600.10 | 39,377.72 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Inv 47734 |
| 20 Nov 2025 | Crd Note | 13917 | DN#20843- VICTORIA | LPG | -3,360.06 | 36,017.66 | T0047 CN_DN_PAIR ✓ ↔ Inv 47763 |
| 20 Nov 2025 | Invoice | 47827 | DN-20843-ROSEDALE | LPG | 5,600.10 | 41,617.76 | OPEN |
| 20 Nov 2025 | Invoice | 47828 | DN-21158 | LPG | 3,360.06 | 44,977.82 | OPEN |
| 28 Nov 2025 | Payment | 42440 | TRANSF \| STAT:121 | LPG | -47,511.17 | -2,533.35 | OPEN |

### December 2025

Opening balance (ERP running): **R-2,533.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Dec 2025 | Invoice | 48019 | DN#20695- 260974 VIC | LPG | 3,360.06 | 826.71 | T0009 REMITTANCE ✓ ↔ Pmt 43239, Inv 48165, Inv 48190, Inv 48372 +1 |
| 01 Dec 2025 | Invoice | 48021 | DN#20695-EMPTY | CYL | 3,622.50 | 4,449.21 | T0048 CN_DN_PAIR ✓ ↔ Crd Note 13986 |
| 02 Dec 2025 | Crd Note | 13986 | DN#20695-EMPTY | CYL | -3,622.50 | 826.71 | T0048 CN_DN_PAIR ✓ ↔ Inv 48021 |
| 09 Dec 2025 | Crd Note | 14036 | DN#20907-EMPTY | CYL | -3,622.50 | -2,795.79 | T0049 CN_DN_PAIR ✓ ↔ Inv 48166 |
| 09 Dec 2025 | Invoice | 48165 | DN#20907 | LPG | 3,378.27 | 582.48 | T0009 REMITTANCE ✓ ↔ Pmt 43239, Inv 48019, Inv 48190, Inv 48372 +1 |
| 09 Dec 2025 | Invoice | 48166 | DN#20907-EMPTY | CYL | 3,622.50 | 4,204.98 | T0049 CN_DN_PAIR ✓ ↔ Crd Note 14036 |
| 10 Dec 2025 | Crd Note | 14042 | DN#20913- EMPTY | CYL | -2,415.00 | 1,789.98 | T0050 CN_DN_PAIR ✓ ↔ Inv 48191 |
| 10 Dec 2025 | Invoice | 48190 | DN#20913- MKONDENI | LPG | 2,252.18 | 4,042.16 | T0009 REMITTANCE ✓ ↔ Pmt 43239, Inv 48019, Inv 48165, Inv 48372 +1 |
| 10 Dec 2025 | Invoice | 48191 | DN#20913- EMPTY | CYL | 2,415.00 | 6,457.16 | T0050 CN_DN_PAIR ✓ ↔ Crd Note 14042 |
| 19 Dec 2025 | Crd Note | 14121 | DN#21721-EMPTY | CYL | -6,037.50 | 419.66 | T0051 CN_DN_PAIR ✓ ↔ Inv 48373 |
| 19 Dec 2025 | Invoice | 48372 | DN#21721 | LPG | 5,630.46 | 6,050.12 | T0009 REMITTANCE ✓ ↔ Pmt 43239, Inv 48019, Inv 48165, Inv 48190 +1 |
| 19 Dec 2025 | Invoice | 48373 | DN#21721-EMPTY | CYL | 6,037.50 | 12,087.62 | T0051 CN_DN_PAIR ✓ ↔ Crd Note 14121 |
| 29 Dec 2025 | Crd Note | 14172 | DN#21744-EMPTY | CYL | -3,622.50 | 8,465.12 | T0052 CN_DN_PAIR ✓ ↔ Inv 48524 |
| 29 Dec 2025 | Invoice | 48523 | DN#21744- VICTORIA | LPG | 3,378.27 | 11,843.39 | T0009 REMITTANCE ✓ ↔ Pmt 43239, Inv 48019, Inv 48165, Inv 48190 +1 |
| 29 Dec 2025 | Invoice | 48524 | DN#21744-EMPTY | CYL | 3,622.50 | 15,465.89 | T0052 CN_DN_PAIR ✓ ↔ Crd Note 14172 |
| 31 Dec 2025 | Payment | 42858 | TRANSF \| STAT:122 | LPG | -9,730.26 | 5,735.63 | OPEN |

### January 2026

Opening balance (ERP running): **R5,735.63**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Jan 2026 | Crd Note | 14251 | DN-21630-EMPTY | CYL | -3,622.50 | 2,113.13 | T0053 CN_DN_PAIR ✓ ↔ Inv 48738 |
| 12 Jan 2026 | Invoice | 48737 | DN-21630 | LPG | 3,378.27 | 5,491.40 | T0007 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 43494, Inv 48784, Inv 48906, Inv 48919 +2 |
| 12 Jan 2026 | Invoice | 48738 | DN-21630-EMPTY | CYL | 3,622.50 | 9,113.90 | T0053 CN_DN_PAIR ✓ ↔ Crd Note 14251 |
| 14 Jan 2026 | Invoice | 48784 | DN#21635-KONDENI | LPG | 2,252.18 | 11,366.08 | T0007 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 43494, Inv 48737, Inv 48906, Inv 48919 +2 |
| 14 Jan 2026 | Invoice | 48785 | DN#21635MPTY-KONDENI | CYL | 2,415.00 | 13,781.08 | T0054 CN_DN_PAIR ✓ ↔ Crd Note 14269 |
| 15 Jan 2026 | Crd Note | 14269 | DN#21635MPTY-KONDENI | CYL | -2,415.00 | 11,366.08 | T0054 CN_DN_PAIR ✓ ↔ Inv 48785 |
| 22 Jan 2026 | Invoice | 48906 | DN#21659 | LPG | 3,403.63 | 14,769.71 | T0007 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 43494, Inv 48737, Inv 48784, Inv 48919 +2 |
| 22 Jan 2026 | Invoice | 48907 | DN-21659EMPTY | CYL | 3,622.50 | 18,392.21 | T0055 CN_DN_PAIR ✓ ↔ Crd Note 14322 |
| 22 Jan 2026 | Invoice | 48927 | DN#21502- EMPTY | CYL | 5,462.50 | 23,854.71 | T0007 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 43494, Inv 48737, Inv 48784, Inv 48906 +2 |
| 23 Jan 2026 | Crd Note | 14322 | DN-21659EMPTY | CYL | -3,622.50 | 20,232.21 | T0055 CN_DN_PAIR ✓ ↔ Inv 48907 |
| 23 Jan 2026 | Crd Note | 14325 | DN#21502EMPTY | CYL | -5,462.50 | 14,769.71 | T0056 CN_DN_PAIR ✓ ↔ Inv 48920 |
| 23 Jan 2026 | Invoice | 48919 | DN#21502ROSEDALE | LPG | 4,869.09 | 19,638.80 | T0007 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 43494, Inv 48737, Inv 48784, Inv 48906 +2 |
| 23 Jan 2026 | Invoice | 48920 | DN#21502EMPTY | CYL | 5,462.50 | 25,101.30 | T0056 CN_DN_PAIR ✓ ↔ Crd Note 14325 |
| 24 Jan 2026 | Crd Note | 14328 | DN#21502- EMPTY | CYL | -5,520.00 | 19,581.30 | T0007 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 43494, Inv 48737, Inv 48784, Inv 48906 +2 |

### February 2026

Opening balance (ERP running): **R19,581.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Feb 2026 | Payment | 43239 | TRANSF \| STAT:123 | LPG | -17,999.24 | 1,582.06 | T0009 REMITTANCE ✓ ↔ Inv 48019, Inv 48165, Inv 48190, Inv 48372 +1 |
| 06 Feb 2026 | Crd Note | 14385 | DN#21680 | LPG | -3,443.48 | -1,861.42 | T0057 CN_DN_PAIR ✓ ↔ Inv 49119 |
| 06 Feb 2026 | Crd Note | 14386 | DN#21680-EMPTY | CYL | -3,622.50 | -5,483.92 | T0058 CN_DN_PAIR ✓ ↔ Inv 49120 |
| 06 Feb 2026 | Invoice | 49119 | DN#21680 | LPG | 3,443.48 | -2,040.44 | T0057 CN_DN_PAIR ✓ ↔ Crd Note 14385 |
| 06 Feb 2026 | Invoice | 49120 | DN#21680-EMPTY | CYL | 3,622.50 | 1,582.06 | T0058 CN_DN_PAIR ✓ ↔ Crd Note 14386 |
| 06 Feb 2026 | Invoice | 49128 | DN#21680-VICTORIA | LPG | 3,443.48 | 5,025.54 | T0010 REMITTANCE ✓ ↔ Pmt 43854, Inv 49166, Inv 49322, Inv 49443 |
| 10 Feb 2026 | Crd Note | 14408 | DN#2124EMPTY-KONDENI | CYL | -2,415.00 | 2,610.54 | T0059 CN_DN_PAIR ✓ ↔ Inv 49167 |
| 10 Feb 2026 | Invoice | 49166 | DN#21242- MKONDENI | LPG | 2,295.65 | 4,906.19 | T0010 REMITTANCE ✓ ↔ Pmt 43854, Inv 49128, Inv 49322, Inv 49443 |
| 10 Feb 2026 | Invoice | 49167 | DN#2124EMPTY-KONDENI | CYL | 2,415.00 | 7,321.19 | T0059 CN_DN_PAIR ✓ ↔ Crd Note 14408 |
| 19 Feb 2026 | Crd Note | 14454 | DN-212EMPTY-VICTORIA | CYL | -3,622.50 | 3,698.69 | T0060 CN_DN_PAIR ✓ ↔ Inv 49323 |
| 19 Feb 2026 | Invoice | 49322 | DN-VICTORIA | LPG | 3,443.48 | 7,142.17 | T0010 REMITTANCE ✓ ↔ Pmt 43854, Inv 49128, Inv 49166, Inv 49443 |
| 19 Feb 2026 | Invoice | 49323 | DN-212EMPTY-VICTORIA | CYL | 3,622.50 | 10,764.67 | T0060 CN_DN_PAIR ✓ ↔ Crd Note 14454 |
| 26 Feb 2026 | Invoice | 49443 | DN#21931-ROSEDALE | LPG | 4,591.31 | 15,355.98 | T0010 REMITTANCE ✓ ↔ Pmt 43854, Inv 49128, Inv 49166, Inv 49322 |
| 26 Feb 2026 | Invoice | 49444 | DN#21931-ROSE-EMPTY | CYL | 4,830.00 | 20,185.98 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 14494 |
| 28 Feb 2026 | Crd Note | 14494 | DN#21931-ROSE-EMPTY | CYL | -4,830.00 | 15,355.98 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Inv 49444 |

### March 2026

Opening balance (ERP running): **R15,355.98**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Mar 2026 | Payment | 43494 | TRANSF \| STAT:124 | LPG | -13,845.67 | 1,510.31 | T0007 LOCKED:OPERATOR_RULING [exact] ↔ Inv 48737, Inv 48784, Inv 48906, Inv 48919 +2 |
| 04 Mar 2026 | Invoice | 49573 | DN#22113 | LPG | 3,443.48 | 4,953.79 | T0011 REMITTANCE ✓ ↔ Pmt 44231, Inv 49796, Inv 49905, Inv 50004 +1 |
| 04 Mar 2026 | Invoice | 49574 | DN#22113-EMPTY | CYL | 3,622.50 | 8,576.29 | T0061 CN_DN_PAIR ✓ ↔ Crd Note 14535 |
| 05 Mar 2026 | Crd Note | 14535 | DN#22113-EMPTY | CYL | -3,622.50 | 4,953.79 | T0061 CN_DN_PAIR ✓ ↔ Inv 49574 |
| 18 Mar 2026 | Crd Note | 14612 | DN#22134- EMPTY | CYL | -3,622.50 | 1,331.29 | T0062 CN_DN_PAIR ✓ ↔ Inv 49797 |
| 18 Mar 2026 | Invoice | 49796 | DN#22134- VICTORIA | LPG | 3,472.29 | 4,803.58 | T0011 REMITTANCE ✓ ↔ Pmt 44231, Inv 49573, Inv 49905, Inv 50004 +1 |
| 18 Mar 2026 | Invoice | 49797 | DN#22134- EMPTY | CYL | 3,622.50 | 8,426.08 | T0062 CN_DN_PAIR ✓ ↔ Crd Note 14612 |
| 25 Mar 2026 | Crd Note | 14652 | DN-21978-ROSEDALE | CYL | -1,207.50 | 7,218.58 | T0063 CN_DN_PAIR ✓ ↔ Inv 49906 |
| 25 Mar 2026 | Invoice | 49905 | DN-0-ROSEDALE | LPG | 1,157.43 | 8,376.01 | T0011 REMITTANCE ✓ ↔ Pmt 44231, Inv 49573, Inv 49796, Inv 50004 +1 |
| 25 Mar 2026 | Invoice | 49906 | DN-21978-ROSEDALE | CYL | 1,207.50 | 9,583.51 | T0063 CN_DN_PAIR ✓ ↔ Crd Note 14652 |
| 30 Mar 2026 | Invoice | 50004 | DN-22033-KONDENI | LPG | 3,472.29 | 13,055.80 | T0011 REMITTANCE ✓ ↔ Pmt 44231, Inv 49573, Inv 49796, Inv 49905 +1 |
| 30 Mar 2026 | Invoice | 50005 | DN-22033-KONDE-EMPTY | CYL | 3,622.50 | 16,678.30 | T0064 CN_DN_PAIR ✓ ↔ Crd Note 14684 |
| 31 Mar 2026 | Crd Note | 14684 | DN-22033-KONDE-EMPTY | CYL | -3,622.50 | 13,055.80 | T0064 CN_DN_PAIR ✓ ↔ Inv 50005 |
| 31 Mar 2026 | Invoice | 50013 | DN-21851-VICTORIA | LPG | 3,472.29 | 16,528.09 | T0011 REMITTANCE ✓ ↔ Pmt 44231, Inv 49573, Inv 49796, Inv 49905 +1 |
| 31 Mar 2026 | Invoice | 50014 | DN-21851-VICT-EMPTY | CYL | 3,622.50 | 20,150.59 | T0065 CN_DN_PAIR ✓ ↔ Crd Note 14692 |

### April 2026

Opening balance (ERP running): **R20,150.59**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Apr 2026 | Crd Note | 14692 | DN-21851-VICT-EMPTY | CYL | -3,622.50 | 16,528.09 | T0065 CN_DN_PAIR ✓ ↔ Inv 50014 |
| 01 Apr 2026 | Payment | 43854 | TRANSF \| STAT:125 | LPG | -13,773.92 | 2,754.17 | T0010 REMITTANCE ✓ ↔ Inv 49128, Inv 49166, Inv 49322, Inv 49443 |
| 06 Apr 2026 | Invoice | 50100 | DN-22047-ROSEDALE | LPG | 5,205.68 | 7,959.85 | T0012 REMITTANCE ✓ ↔ Pmt 44561, Inv 50234, Inv 50429 |
| 06 Apr 2026 | Invoice | 50101 | DN-22047-EMPTY-ROSE | CYL | 4,830.00 | 12,789.85 | T0066 CN_DN_PAIR ✓ ↔ Crd Note 14712 |
| 07 Apr 2026 | Crd Note | 14712 | DN-22047-EMPTY-ROSE | CYL | -4,830.00 | 7,959.85 | T0066 CN_DN_PAIR ✓ ↔ Inv 50101 |
| 15 Apr 2026 | Crd Note | 14759 | DN-22170-EMPTY-VIC | CYL | -3,622.50 | 4,337.35 | T0067 CN_DN_PAIR ✓ ↔ Inv 50235 |
| 15 Apr 2026 | Invoice | 50234 | DN-22170-VICT | LPG | 3,904.26 | 8,241.61 | T0012 REMITTANCE ✓ ↔ Pmt 44561, Inv 50100, Inv 50429 |
| 15 Apr 2026 | Invoice | 50235 | DN-22170-EMPTY-VIC | CYL | 3,622.50 | 11,864.11 | T0067 CN_DN_PAIR ✓ ↔ Crd Note 14759 |
| 29 Apr 2026 | Invoice | 50429 | DN-21358-VICTORIA | LPG | 3,904.26 | 15,768.37 | T0012 REMITTANCE ✓ ↔ Pmt 44561, Inv 50100, Inv 50234 |
| 29 Apr 2026 | Invoice | 50430 | DN-21358-EMPTY-VICT | CYL | 3,622.50 | 19,390.87 | T0068 CN_DN_PAIR ✓ ↔ Crd Note 14822 |
| 30 Apr 2026 | Crd Note | 14822 | DN-21358-EMPTY-VICT | CYL | -3,622.50 | 15,768.37 | T0068 CN_DN_PAIR ✓ ↔ Inv 50430 |

### May 2026

Opening balance (ERP running): **R15,768.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 May 2026 | Payment | 44231 | TRANSF \| STAT:126 | LPG | -15,017.78 | 750.59 | T0011 REMITTANCE ✓ ↔ Inv 49573, Inv 49796, Inv 49905, Inv 50004 +1 |
| 05 May 2026 | Crd Note | 14858 | DN#22225-EMPTY | CYL | -4,830.00 | -4,079.41 | T0069 CN_DN_PAIR ✓ ↔ Inv 50525 |
| 05 May 2026 | Invoice | 50524 | DN#22225- ROSEDALE | LPG | 5,205.68 | 1,126.27 | T0013 REMITTANCE ✓ ↔ Pmt 44972, Inv 50671, Inv 50867, Inv 50886 |
| 05 May 2026 | Invoice | 50525 | DN#22225-EMPTY | CYL | 4,830.00 | 5,956.27 | T0069 CN_DN_PAIR ✓ ↔ Crd Note 14858 |
| 14 May 2026 | Invoice | 50671 | DN#22389 | LPG | 4,539.72 | 10,495.99 | T0013 REMITTANCE ✓ ↔ Pmt 44972, Inv 50524, Inv 50867, Inv 50886 |
| 25 May 2026 | Invoice | 50867 | DN#22431- MKONDENI | LPG | 3,026.48 | 13,522.47 | T0013 REMITTANCE ✓ ↔ Pmt 44972, Inv 50524, Inv 50671, Inv 50886 |
| 25 May 2026 | Invoice | 50868 | DN#22431-EMPTY | CYL | 2,415.00 | 15,937.47 | T0070 CN_DN_PAIR ✓ ↔ Crd Note 14970 |
| 26 May 2026 | Crd Note | 14970 | DN#22431-EMPTY | CYL | -2,415.00 | 13,522.47 | T0070 CN_DN_PAIR ✓ ↔ Inv 50868 |
| 27 May 2026 | Crd Note | 14972 | DN#22759-EMPTY | CYL | -3,622.50 | 9,899.97 | T0071 CN_DN_PAIR ✓ ↔ Inv 50887 |
| 27 May 2026 | Invoice | 50886 | DN#22759 | LPG | 4,539.72 | 14,439.69 | T0013 REMITTANCE ✓ ↔ Pmt 44972, Inv 50524, Inv 50671, Inv 50867 |
| 27 May 2026 | Invoice | 50887 | DN#22759-EMPTY | CYL | 3,622.50 | 18,062.19 | T0071 CN_DN_PAIR ✓ ↔ Crd Note 14972 |

### June 2026

Opening balance (ERP running): **R18,062.19**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Jun 2026 | Payment | 44561 | TRANSF \| STAT:127 | LPG | -13,014.20 | 5,047.99 | T0012 REMITTANCE ✓ ↔ Inv 50100, Inv 50234, Inv 50429 |
| 02 Jun 2026 | Invoice | 50996 | DN#22616-ROSEDALE | LPG | 5,822.54 | 10,870.53 | T0014 REMITTANCE ✓ ↔ Pmt 45595, Inv 50998, Inv 51099, Inv 51398 |
| 02 Jun 2026 | Invoice | 50997 | DN#22616-EMPTY | CYL | 4,830.00 | 15,700.53 | T0072 CN_DN_PAIR ✓ ↔ Crd Note 15017 |
| 02 Jun 2026 | Invoice | 50998 | BMS ROSEDALE 22616 | OTHER | 349.99 | 16,050.52 | T0014 REMITTANCE ✓ ↔ Pmt 45595, Inv 50996, Inv 51099, Inv 51398 |
| 03 Jun 2026 | Crd Note | 15017 | DN#22616-EMPTY | CYL | -4,830.00 | 11,220.52 | T0072 CN_DN_PAIR ✓ ↔ Inv 50997 |
| 09 Jun 2026 | Crd Note | 15037 | DN#22631 | CYL | -3,622.50 | 7,598.02 | T0073 CN_DN_PAIR ✓ ↔ Inv 51100 |
| 09 Jun 2026 | Invoice | 51099 | DN#22631 | LPG | 4,345.45 | 11,943.47 | T0014 REMITTANCE ✓ ↔ Pmt 45595, Inv 50996, Inv 50998, Inv 51398 |
| 09 Jun 2026 | Invoice | 51100 | DN#22631 | CYL | 3,622.50 | 15,565.97 | T0073 CN_DN_PAIR ✓ ↔ Crd Note 15037 |
| 24 Jun 2026 | Crd Note | 15116 | DN#22523=EMPTY | CYL | -3,622.50 | 11,943.47 | T0074 CN_DN_PAIR ✓ ↔ Inv 51399 |
| 24 Jun 2026 | Invoice | 51398 | DN#22523 | LPG | 4,345.45 | 16,288.92 | T0014 REMITTANCE ✓ ↔ Pmt 45595, Inv 50996, Inv 50998, Inv 51099 |
| 24 Jun 2026 | Invoice | 51399 | DN#22523=EMPTY | CYL | 3,622.50 | 19,911.42 | T0074 CN_DN_PAIR ✓ ↔ Crd Note 15116 |
| 29 Jun 2026 | Crd Note | 15145 | DN#22920=EMPTY=ROSED | CYL | -4,772.50 | 15,138.92 | T0075 CN_DN_PAIR ✓ ↔ Inv 51471 |
| 29 Jun 2026 | Invoice | 51470 | DN#22920=ROSEDALE | LPG | 5,039.52 | 20,178.44 | T0094 EXACT_RUN ✓ ↔ Pmt 46021, Inv 51655, Inv 51839, Inv 51923 +3 |
| 29 Jun 2026 | Invoice | 51471 | DN#22920=EMPTY=ROSED | CYL | 4,772.50 | 24,950.94 | T0075 CN_DN_PAIR ✓ ↔ Crd Note 15145 |

### July 2026

Opening balance (ERP running): **R24,950.94**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Jul 2026 | Payment | 44972 | TRANSF \| STAT:128 | LPG | -17,311.60 | 7,639.34 | T0013 REMITTANCE ✓ ↔ Inv 50524, Inv 50671, Inv 50867, Inv 50886 |
| 07 Jul 2026 | Crd Note | 15212 | DN#22806=EMPTY | CYL | -3,622.50 | 4,016.84 | T0076 CN_DN_PAIR ✓ ↔ Inv 51656 |
| 07 Jul 2026 | Invoice | 51655 | DN#22806 | LPG | 4,366.11 | 8,382.95 | T0094 EXACT_RUN ✓ ↔ Pmt 46021, Inv 51470, Inv 51839, Inv 51923 +3 |
| 07 Jul 2026 | Invoice | 51656 | DN#22806=EMPTY | CYL | 3,622.50 | 12,005.45 | T0076 CN_DN_PAIR ✓ ↔ Crd Note 15212 |
| 15 Jul 2026 | Crd Note | 15256 | DN#22575-EMPTY=ROSED | CYL | -3,622.50 | 8,382.95 | T0077 CN_DN_PAIR ✓ ↔ Inv 51840 |
| 15 Jul 2026 | Invoice | 51839 | DN#22575=ROSEDALE | LPG | 4,366.11 | 12,749.06 | T0094 EXACT_RUN ✓ ↔ Pmt 46021, Inv 51470, Inv 51655, Inv 51923 +3 |
| 15 Jul 2026 | Invoice | 51840 | DN#22575-EMPTY=ROSED | CYL | 3,622.50 | 16,371.56 | T0077 CN_DN_PAIR ✓ ↔ Crd Note 15256 |
| 20 Jul 2026 | Crd Note | 15281 | DN#22830-EMPTY | CYL | -2,415.00 | 13,956.56 | T0078 CN_DN_PAIR ✓ ↔ Inv 51924 |
| 20 Jul 2026 | Invoice | 51923 | DN#22830- MKONDENI | LPG | 2,910.74 | 16,867.30 | T0094 EXACT_RUN ✓ ↔ Pmt 46021, Inv 51470, Inv 51655, Inv 51839 +3 |
| 20 Jul 2026 | Invoice | 51924 | DN#22830-EMPTY | CYL | 2,415.00 | 19,282.30 | T0078 CN_DN_PAIR ✓ ↔ Crd Note 15281 |
| 27 Jul 2026 | Crd Note | 15339 | DN#22847=EMPTY | CYL | -3,622.50 | 15,659.80 | T0079 CN_DN_PAIR ✓ ↔ Inv 52103 |
| 27 Jul 2026 | Invoice | 52102 | DN#22847 | LPG | 4,366.11 | 20,025.91 | T0094 EXACT_RUN ✓ ↔ Pmt 46021, Inv 51470, Inv 51655, Inv 51839 +3 |
| 27 Jul 2026 | Invoice | 52103 | DN#22847=EMPTY | CYL | 3,622.50 | 23,648.41 | T0079 CN_DN_PAIR ✓ ↔ Crd Note 15339 |
| 31 Jul 2026 | Crd Note | 15365 | DN#24226-EMPTY | CYL | -3,622.50 | 20,025.91 | T0080 CN_DN_PAIR ✓ ↔ Inv 52220 |
| 31 Jul 2026 | Invoice | 52219 | DN#24226 | LPG | 4,366.11 | 24,392.02 | T0094 EXACT_RUN ✓ ↔ Pmt 46021, Inv 51470, Inv 51655, Inv 51839 +3 |
| 31 Jul 2026 | Invoice | 52220 | DN#24226-EMPTY | CYL | 3,622.50 | 28,014.52 | T0080 CN_DN_PAIR ✓ ↔ Crd Note 15365 |
| 31 Jul 2026 | Invoice | 52242 | DN#24230 | LPG | 4,639.00 | 32,653.52 | T0094 EXACT_RUN ✓ ↔ Pmt 46021, Inv 51470, Inv 51655, Inv 51839 +3 |

### August 2026

Opening balance (ERP running): **R32,653.52**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Aug 2026 | Crd Note | 15377 | DN#24230-EMPTY | CYL | -4,140.00 | 28,513.52 | T0081 CN_DN_PAIR ✓ ↔ Inv 52243 |
| 01 Aug 2026 | Invoice | 52243 | DN#24230-EMPTY | CYL | 4,140.00 | 32,653.52 | T0081 CN_DN_PAIR ✓ ↔ Crd Note 15377 |
| 03 Aug 2026 | Payment | 45595 | TRANSF \| STAT:129 | LPG | -14,863.43 | 17,790.09 | T0014 REMITTANCE ✓ ↔ Inv 50996, Inv 50998, Inv 51099, Inv 51398 |
| 08 Aug 2026 | Invoice | 52421 | DN#23948- ROSEDALE | LPG | 545.77 | 18,335.86 | T0095 EXACT_MONTH_SUM ✓ ↔ Pmt 46344, Inv 52542, Inv 52720, Inv 52757 +1 |
| 08 Aug 2026 | Invoice | 52422 | DN#23948-EMPTY | CYL | 1,035.00 | 19,370.86 | OPEN |
| 09 Aug 2026 | Crd Note | 15422 | DN#23948-EMPTY | CYL | -517.50 | 18,853.36 | OPEN |
| 14 Aug 2026 | Crd Note | 15461 | DN#24270-EMPTY | CYL | -3,622.50 | 15,230.86 | T0082 CN_DN_PAIR ✓ ↔ Inv 52543 |
| 14 Aug 2026 | Invoice | 52542 | DN#24270 - VICTORIA | LPG | 3,827.91 | 19,058.77 | T0095 EXACT_MONTH_SUM ✓ ↔ Pmt 46344, Inv 52421, Inv 52720, Inv 52757 +1 |
| 14 Aug 2026 | Invoice | 52543 | DN#24270-EMPTY | CYL | 3,622.50 | 22,681.27 | T0082 CN_DN_PAIR ✓ ↔ Crd Note 15461 |
| 21 Aug 2026 | Invoice | 52720 | DN#24926-MKONDENI | LPG | 2,551.94 | 25,233.21 | T0095 EXACT_MONTH_SUM ✓ ↔ Pmt 46344, Inv 52421, Inv 52542, Inv 52757 +1 |
| 21 Aug 2026 | Invoice | 52721 | DN#24926-EMPTY | CYL | 2,415.00 | 27,648.21 | T0083 CN_DN_PAIR ✓ ↔ Crd Note 15528 |
| 22 Aug 2026 | Crd Note | 15528 | DN#24926-EMPTY | CYL | -2,415.00 | 25,233.21 | T0083 CN_DN_PAIR ✓ ↔ Inv 52721 |
| 23 Aug 2026 | Invoice | 52757 | DN#228976 | LPG | 2,551.94 | 27,785.15 | T0095 EXACT_MONTH_SUM ✓ ↔ Pmt 46344, Inv 52421, Inv 52542, Inv 52720 +1 |
| 23 Aug 2026 | Invoice | 52758 | DN#22896- ROSEDALE | CYL | 2,415.00 | 30,200.15 | T0084 CN_DN_PAIR ✓ ↔ Crd Note 15542 |
| 24 Aug 2026 | Crd Note | 15542 | DN#22896- ROSEDALE | CYL | -2,415.00 | 27,785.15 | T0084 CN_DN_PAIR ✓ ↔ Inv 52758 |
| 25 Aug 2026 | Crd Note | 15545 | DN#22897-EMPTY | CYL | -3,622.50 | 24,162.65 | T0085 CN_DN_PAIR ✓ ↔ Inv 52773 |
| 25 Aug 2026 | Invoice | 52772 | DN#22897- VICTORIA | LPG | 3,827.91 | 27,990.56 | T0095 EXACT_MONTH_SUM ✓ ↔ Pmt 46344, Inv 52421, Inv 52542, Inv 52720 +1 |
| 25 Aug 2026 | Invoice | 52773 | DN#22897-EMPTY | CYL | 3,622.50 | 31,613.06 | T0085 CN_DN_PAIR ✓ ↔ Crd Note 15545 |

### September 2026

Opening balance (ERP running): **R31,613.06**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Sept 2026 | Payment | 46021 | TRANSF \| STAT:130 | LPG | -30,053.70 | 1,559.36 | T0094 EXACT_RUN ✓ ↔ Inv 51470, Inv 51655, Inv 51839, Inv 51923 +3 |
| 07 Sept 2026 | Crd Note | 15619 | DN#24826-EMPTY | CYL | -5,865.00 | -4,305.64 | T0086 CN_DN_PAIR ✓ ↔ Inv 53005 |
| 07 Sept 2026 | Invoice | 53004 | DN#24826- ROSEDALE | LPG | 5,709.61 | 1,403.97 | OPEN |
| 07 Sept 2026 | Invoice | 53005 | DN#24826-EMPTY | CYL | 5,865.00 | 7,268.97 | T0086 CN_DN_PAIR ✓ ↔ Crd Note 15619 |
| 07 Sept 2026 | Invoice | 53019 | DN#24972 | LPG | 3,915.16 | 11,184.13 | OPEN |
| 07 Sept 2026 | Invoice | 53019 | DN#24972 | OTHER | 524.99 | 11,709.12 | OPEN |
| 15 Sept 2026 | Invoice | 53138 | DN#24853 | OTHER | 3,599.99 | 15,309.11 | OPEN |
| 23 Sept 2026 | Invoice | 53259 | DN#24871 | LPG | 3,915.16 | 19,224.27 | OPEN |
| 26 Sept 2026 | Invoice | 53316 | DN#21383 | LPG | 3,915.16 | 23,139.43 | OPEN |
| 26 Sept 2026 | Invoice | 53317 | DN#21383-EMPTY | CYL | 3,622.50 | 26,761.93 | T0005 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 15708 |
| 28 Sept 2026 | Crd Note | 15708 | DN#21383-EMPTY | CYL | -3,622.50 | 23,139.43 | T0005 LOCKED:OPERATOR_RULING [exact] ↔ Inv 53317 |

### October 2026

Opening balance (ERP running): **R23,139.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Oct 2026 | Payment | 46344 | TRANSF \| STAT:131 | LPG | -13,305.47 | 9,833.96 | T0095 EXACT_MONTH_SUM ✓ ↔ Inv 52421, Inv 52542, Inv 52720, Inv 52757 +1 |
| 01 Oct 2026 | Invoice | 53417 | DN#23831 | LPG | 2,746.04 | 12,580.00 | OPEN |
| 08 Oct 2026 | Crd Note | 15774 | DN#23844-EMPTY | CYL | -3,622.50 | 8,957.50 | T0087 CN_DN_PAIR ✓ ↔ Inv 53509 |
| 08 Oct 2026 | Invoice | 53508 | DN#23844 | LPG | 3,967.81 | 12,925.31 | OPEN |
| 08 Oct 2026 | Invoice | 53509 | DN#23844-EMPTY | CYL | 3,622.50 | 16,547.81 | T0087 CN_DN_PAIR ✓ ↔ Crd Note 15774 |

---

## Ties by rule

| Rule | Confirmed | Probable |
| :--- | ---: | ---: |
| LOCKED | 7 | 0 |
| REMITTANCE | 7 | 0 |
| CN_DN_PAIR | 73 | 0 |
| EXACT_SINGLE | 2 | 0 |
| EXACT_MONTH_SUM | 2 | 0 |
| EXACT_SUM | 3 | 0 |
| EXACT_RUN | 1 | 0 |

Proof: holds (rebuilt R16,547.81 vs closing R16,547.81; ERP R16,547.81).

