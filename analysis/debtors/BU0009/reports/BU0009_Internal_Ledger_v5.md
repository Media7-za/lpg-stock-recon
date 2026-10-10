# Internal ledger: IMPENDLE WHOLESALE 2025 (BU0009), matcher review
**INTERNAL, not for the customer.** Every transaction in ERP order with the ERP running balance and what matcher v5 did with it · generated 2026-10-10 · 42 confirmed / 8 probable ties · 61 rows open · ERP `CURRENT BALANCE` R17,118.47 · matcher v5 ratified 2026-10-10; probable ties are proposals until approved · **REVIEW ONLY:** ingestCoverage partial

**Status key:** `OPEN` untied · `T0001 EXACT_SINGLE ✓` confirmed tie · `T0001 BATCH_SUM ?` probable tie (needs approval) · `LOCKED` operator-approved lock · `◀ ZERO` ERP running balance is within R0.05 after this line.

---

### December 2024

Opening balance (ERP running): **R1,035.15**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 21 Dec 2024 | Payment | 44848 | TRANSF \| STAT:110 | LPG | -3,656.48 | -2,621.33 | OPEN |

### March 2025

Opening balance (ERP running): **R-2,621.33**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Mar 2025 | Invoice | 41205 | DN#12900 | CYL | 15,697.50 | 13,076.17 | T0002 CN_DN_PAIR ✓ ↔ Crd Note 12012 |
| 05 Mar 2025 | Invoice | 41205 | DN#12900 | LPG | 9,386.78 | 22,462.95 | T0027 EXACT_SINGLE ✓ ↔ Pmt 37385 |
| 06 Mar 2025 | Crd Note | 12012 | DN#12900 | CYL | -15,697.50 | 6,765.45 | T0002 CN_DN_PAIR ✓ ↔ Inv 41205 |
| 06 Mar 2025 | Crd Note | 12013 | DN12879-EMPTY | CYL | -1,035.00 | 5,730.45 | OPEN |
| 08 Mar 2025 | Payment | 37385 | TRANSF \| STAT:113 | LPG | -9,386.78 | -3,656.33 | T0027 EXACT_SINGLE ✓ ↔ Inv 41205 |
| 19 Mar 2025 | Invoice | 41595 | DN#12959 | CYL | 22,137.50 | 18,481.17 | OPEN |
| 19 Mar 2025 | Invoice | 41595 | DN#12959 | LPG | 12,880.92 | 31,362.09 | T0047 PROXIMITY ? ↔ Pmt 37815 |
| 20 Mar 2025 | Crd Note | 12098 | DN#12959 | CYL | -20,872.50 | 10,489.59 | OPEN |
| 29 Mar 2025 | Payment | 37815 | TRANSF \| STAT:113 | LPG | -12,881.00 | -2,391.41 | T0047 PROXIMITY ? ↔ Inv 41595 |

### April 2025

Opening balance (ERP running): **R-2,391.41**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Apr 2025 | Crd Note | 12163 | DN#12940-EMPTY | CYL | -9,545.00 | -11,936.41 | OPEN |
| 01 Apr 2025 | Payment | 38161 | TRANSF \| STAT:114 | LPG | -4,599.26 | -16,535.67 | OPEN |
| 01 Apr 2025 | Invoice | 41871 | DN#12940 | LPG | 4,264.02 | -12,271.65 | T0028 EXACT_MONTH_SUM ✓ ↔ Pmt 38162, Inv 41940 |
| 01 Apr 2025 | Invoice | 41872 | DN#12940-EMPTY | CYL | 8,280.00 | -3,991.65 | OPEN |
| 02 Apr 2025 | Invoice | 41940 | DN#12837 | LPG | 13,769.30 | 9,777.65 | T0028 EXACT_MONTH_SUM ✓ ↔ Pmt 38162, Inv 41871 |
| 02 Apr 2025 | Invoice | 41941 | DN:12837 | CYL | 20,987.50 | 30,765.15 | OPEN |
| 03 Apr 2025 | Crd Note | 12181 | DN:12837 | CYL | -16,560.00 | 14,205.15 | OPEN |
| 07 Apr 2025 | Payment | 38162 | TRANSF \| STAT:114 | LPG | -18,033.30 | -3,828.15 | T0028 EXACT_MONTH_SUM ✓ ↔ Inv 41871, Inv 41940 |
| 14 Apr 2025 | Invoice | 42255 | DN#13014 | LPG | 10,559.99 | 6,731.84 | T0048 PROXIMITY ? ↔ Pmt 38240 |
| 14 Apr 2025 | Invoice | 42256 | DN#13014-EMPTY | CYL | 18,975.00 | 25,706.84 | T0003 CN_DN_PAIR ? ↔ Crd Note 12282 |
| 16 Apr 2025 | Crd Note | 12282 | DN#13014-EMPTY | CYL | -18,975.00 | 6,731.84 | T0003 CN_DN_PAIR ? ↔ Inv 42256 |
| 22 Apr 2025 | Payment | 38240 | TRANSF \| STAT:114 | LPG | -10,559.90 | -3,828.06 | T0048 PROXIMITY ? ↔ Inv 42255 |
| 29 Apr 2025 | Invoice | 42621 | DN#13039 | LPG | 14,610.41 | 10,782.35 | T0030 EXACT_SINGLE ✓ ↔ Pmt 38679 |
| 29 Apr 2025 | Invoice | 42622 | DN#13039-EMPTY | CYL | 25,012.50 | 35,794.85 | OPEN |
| 30 Apr 2025 | Crd Note | 12379 | DN#13039-EMPTY | CYL | -27,772.50 | 8,022.35 | OPEN |

### May 2025

Opening balance (ERP running): **R8,022.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 May 2025 | Invoice | 42966 | DN#13213 | LPG | 9,258.08 | 17,280.43 | T0029 EXACT_SINGLE ✓ ↔ Pmt 38678 |
| 10 May 2025 | Invoice | 42967 | DN#13213-EMPTY | CYL | 16,675.00 | 33,955.43 | OPEN |
| 12 May 2025 | Crd Note | 12460 | DN#13213-EMPTY | CYL | -10,982.50 | 22,972.93 | OPEN |
| 13 May 2025 | Payment | 38678 | TRANSF \| STAT:115 | LPG | -9,258.08 | 13,714.85 | T0029 EXACT_SINGLE ✓ ↔ Inv 42966 |
| 13 May 2025 | Payment | 38679 | TRANSF \| STAT:115 | LPG | -14,610.41 | -895.56 | T0030 EXACT_SINGLE ✓ ↔ Inv 42621 |
| 28 May 2025 | Crd Note | 12576 | DN#12472-EMPTY | CYL | -28,807.50 | -29,703.06 | OPEN |
| 28 May 2025 | Invoice | 43408 | DN#12472 | LPG | 11,395.99 | -18,307.07 | OPEN |
| 28 May 2025 | Invoice | 43409 | DN#12472-EMPTY | CYL | 20,872.50 | 2,565.43 | OPEN |
| 30 May 2025 | Payment | 39143 | TRANSF \| STAT:115 | LPG | -10,820.99 | -8,255.56 | OPEN |

### June 2025

Opening balance (ERP running): **R-8,255.56**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Jun 2025 | Invoice | 43681 | DN#12355 | LPG | 14,307.99 | 6,052.43 | T0032 EXACT_SINGLE ✓ ↔ Pmt 39536 |
| 06 Jun 2025 | Invoice | 43682 | DN#12355-EMPTY | CYL | 26,680.00 | 32,732.43 | T0004 CN_DN_PAIR ✓ ↔ Crd Note 12654 |
| 07 Jun 2025 | Crd Note | 12654 | DN#12355-EMPTY | CYL | -26,680.00 | 6,052.43 | T0004 CN_DN_PAIR ✓ ↔ Inv 43682 |
| 17 Jun 2025 | Crd Note | 12747 | DN#12529-EMPTY | CYL | -24,322.50 | -18,270.07 | OPEN |
| 17 Jun 2025 | Invoice | 43970 | DN#12529 | LPG | 16,337.94 | -1,932.13 | T0031 EXACT_SINGLE ✓ ↔ Pmt 39535 |
| 17 Jun 2025 | Invoice | 43971 | DN#12529-EMPTY | CYL | 28,750.00 | 26,817.87 | OPEN |
| 21 Jun 2025 | Invoice | 44130 | DN#12413 | OTHER | 6,500.00 | 33,317.87 | T0033 EXACT_SINGLE ✓ ↔ Pmt 39537 |
| 24 Jun 2025 | Crd Note | 12799 | DN#12540 | LPG | -7,351.95 | 25,965.92 | T0005 CN_DN_PAIR ✓ ↔ Inv 44189 |
| 24 Jun 2025 | Crd Note | 12800 | DN#12540-EMPTY | CYL | -15,525.00 | 10,440.92 | T0006 CN_DN_PAIR ✓ ↔ Inv 44190 |
| 24 Jun 2025 | Payment | 39535 | TRANSF \| STAT:116 | LPG | -16,337.94 | -5,897.02 | T0031 EXACT_SINGLE ✓ ↔ Inv 43970 |
| 24 Jun 2025 | Payment | 39536 | TRANSF \| STAT:116 | LPG | -14,307.99 | -20,205.01 | T0032 EXACT_SINGLE ✓ ↔ Inv 43681 |
| 24 Jun 2025 | Payment | 39537 | TRANSF \| STAT:116 | LPG | -6,500.00 | -26,705.01 | T0033 EXACT_SINGLE ✓ ↔ Inv 44130 |
| 24 Jun 2025 | Invoice | 44189 | DN#12540 | LPG | 7,351.95 | -19,353.06 | T0005 CN_DN_PAIR ✓ ↔ Crd Note 12799 |
| 24 Jun 2025 | Invoice | 44190 | DN#12540-EMPTY | CYL | 15,525.00 | -3,828.06 | T0006 CN_DN_PAIR ✓ ↔ Crd Note 12800 |
| 24 Jun 2025 | Invoice | 44212 | DN#12540 | LPG | 6,126.63 | 2,298.57 | T0035 EXACT_SUM ✓ ↔ Pmt 40058, Inv 44420 |
| 24 Jun 2025 | Invoice | 44213 | DN#12540-EMPYY | CYL | 12,937.50 | 15,236.07 | T0008 CN_DN_PAIR ? ↔ Crd Note 12820 |
| 25 Jun 2025 | Crd Note | 12809 | DN#12540 | LPG | -6,126.63 | 9,109.44 | T0007 CN_DN_PAIR ✓ ↔ Inv 44253 |
| 25 Jun 2025 | Invoice | 44253 | DN#12540 | LPG | 6,126.63 | 15,236.07 | T0007 CN_DN_PAIR ✓ ↔ Crd Note 12809 |
| 26 Jun 2025 | Crd Note | 12820 | DN#12540-EMPYY | CYL | -12,937.50 | 2,298.57 | T0008 CN_DN_PAIR ? ↔ Inv 44213 |

### July 2025

Opening balance (ERP running): **R2,298.57**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Jul 2025 | Invoice | 44420 | DN#12611 | LPG | 8,713.55 | 11,012.12 | T0035 EXACT_SUM ✓ ↔ Pmt 40058, Inv 44212 |
| 01 Jul 2025 | Invoice | 44421 | DN#12611-EMPTY | CYL | 16,675.00 | 27,687.12 | OPEN |
| 02 Jul 2025 | Crd Note | 12877 | DN#12611-EMPTY | CYL | -15,410.00 | 12,277.12 | OPEN |
| 05 Jul 2025 | Invoice | 44565 | DN#12617 | OTHER | 6,000.00 | 18,277.12 | T0034 EXACT_SINGLE ✓ ↔ Pmt 40053 |
| 07 Jul 2025 | Payment | 40053 | TRANSF \| STAT:117 | LPG | -6,000.00 | 12,277.12 | T0034 EXACT_SINGLE ✓ ↔ Inv 44565 |
| 07 Jul 2025 | Payment | 40058 | TRANSF \| STAT:117 | LPG | -14,840.18 | -2,563.06 | T0035 EXACT_SUM ✓ ↔ Inv 44420, Inv 44212 |
| 09 Jul 2025 | Invoice | 44680 | DN#12183 | OTHER | 3,250.00 | 686.94 | OPEN |
| 16 Jul 2025 | Invoice | 44892 | DN#12708 | LPG | 11,763.24 | 12,450.18 | OPEN |
| 16 Jul 2025 | Invoice | 44893 | DN#12708-EMPTY | CYL | 20,412.50 | 32,862.68 | OPEN |
| 17 Jul 2025 | Crd Note | 12998 | DN#12708-EMPTY | CYL | -23,057.50 | 9,805.18 | OPEN |
| 19 Jul 2025 | Invoice | 44978 | D/N 12214 | OTHER | 6,000.00 | 15,805.18 | T0050 NEAR_SUM ? ↔ Pmt 41581, Inv 46694, Inv 46662 |
| 29 Jul 2025 | Invoice | 45770 | DN#20113 | OTHER | 6,000.00 | 21,805.18 | OPEN |
| 31 Jul 2025 | Invoice | 45274 | D/N 20113 | OTHER | 6,000.00 | 27,805.18 | OPEN |
| 31 Jul 2025 | Invoice | 45281 | DN20123 | LPG | 12,137.56 | 39,942.74 | OPEN |
| 31 Jul 2025 | Invoice | 45282 | DN20123 | CYL | 22,827.50 | 62,770.24 | OPEN |

### August 2025

Opening balance (ERP running): **R62,770.24**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Aug 2025 | Crd Note | 13105 | DN20123 | CYL | -24,092.50 | 38,677.74 | OPEN |
| 04 Aug 2025 | Payment | 40431 | TRANSF \| STAT:118 | LPG | -33,150.80 | 5,526.94 | OPEN |
| 11 Aug 2025 | Invoice | 45592 | DN#20309 | LPG | 8,715.55 | 14,242.49 | OPEN |
| 11 Aug 2025 | Invoice | 45593 | DN#20309-EMPTY | CYL | 18,055.00 | 32,297.49 | T0009 CN_DN_PAIR ✓ ↔ Crd Note 13205 |
| 12 Aug 2025 | Crd Note | 13205 | DN#20309-EMPTY | CYL | -18,055.00 | 14,242.49 | T0009 CN_DN_PAIR ✓ ↔ Inv 45593 |
| 23 Aug 2025 | Invoice | 45860 | — | OTHER | 1,440.00 | 15,682.49 | OPEN |
| 26 Aug 2025 | Payment | 40925 | TRANSF \| STAT:118 | LPG | -10,673.20 | 5,009.29 | OPEN |

### September 2025

Opening balance (ERP running): **R5,009.29**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Sept 2025 | Invoice | 46083 | DN#20356 | LPG | 7,658.06 | 12,667.35 | T0049 PROXIMITY ? ↔ Pmt 41048 |
| 02 Sept 2025 | Invoice | 46084 | DN#20356-EMPTY | CYL | 14,950.00 | 27,617.35 | T0010 CN_DN_PAIR ✓ ↔ Crd Note 13362 |
| 03 Sept 2025 | Crd Note | 13362 | DN#20356-EMPTY | CYL | -14,950.00 | 12,667.35 | T0010 CN_DN_PAIR ✓ ↔ Inv 46084 |
| 04 Sept 2025 | Payment | 41048 | TRANSF \| STAT:119 | LPG | -0.06 | 12,667.29 | OPEN |
| 04 Sept 2025 | Payment | 41048 | TRANSF \| STAT:119 | LPG | -7,658.00 | 5,009.29 | T0049 PROXIMITY ? ↔ Inv 46083 |
| 25 Sept 2025 | Invoice | 46662 | DN#20276 | LPG | 11,267.49 | 16,276.78 | T0050 NEAR_SUM ? ↔ Pmt 41581, Inv 46694, Inv 44978 |
| 25 Sept 2025 | Invoice | 46663 | DN#20276- EMPTY | CYL | 22,137.50 | 38,414.28 | T0011 CN_DN_PAIR ✓ ↔ Crd Note 13551 |
| 26 Sept 2025 | Crd Note | 13551 | DN#20276- EMPTY | CYL | -22,137.50 | 16,276.78 | T0011 CN_DN_PAIR ✓ ↔ Inv 46663 |
| 26 Sept 2025 | Invoice | 46694 | DN#20276 | OTHER | 3,199.99 | 19,476.77 | T0050 NEAR_SUM ? ↔ Pmt 41581, Inv 46662, Inv 44978 |

### October 2025

Opening balance (ERP running): **R19,476.77**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Oct 2025 | Payment | 41581 | TRANSF \| STAT:120 | LPG | -20,468.00 | -991.23 | T0050 NEAR_SUM ? ↔ Inv 46694, Inv 46662, Inv 44978 |
| 13 Oct 2025 | Invoice | 47042 | DN#20185 | OTHER | 1,750.00 | 758.77 | T0036 EXACT_MONTH_SUM ✓ ↔ Pmt 41953, Inv 47074, Inv 47117 |
| 14 Oct 2025 | Invoice | 47074 | DN#20298 | LPG | 12,041.96 | 12,800.73 | T0036 EXACT_MONTH_SUM ✓ ↔ Pmt 41953, Inv 47042, Inv 47117 |
| 14 Oct 2025 | Invoice | 47075 | DN#20298-EMPTY | CYL | 24,092.50 | 36,893.23 | OPEN |
| 14 Oct 2025 | Invoice | 47117 | DN#20298 | OTHER | 12,280.00 | 49,173.23 | T0036 EXACT_MONTH_SUM ✓ ↔ Pmt 41953, Inv 47042, Inv 47074 |
| 15 Oct 2025 | Crd Note | 13681 | DN#20298-EMPTY | CYL | -23,575.00 | 25,598.23 | OPEN |
| 22 Oct 2025 | Payment | 41953 | TRANSF \| STAT:120 | LPG | -26,071.96 | -473.73 | T0036 EXACT_MONTH_SUM ✓ ↔ Inv 47042, Inv 47074, Inv 47117 |

### November 2025

Opening balance (ERP running): **R-473.73**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Nov 2025 | Crd Note | 13815 | DN# 20775 | CYL | -16,962.50 | -17,436.23 | T0025 CN_AMOUNT_DATE ? ↔ Inv 47517 |
| 05 Nov 2025 | Invoice | 47516 | DN#20775 | LPG | 8,619.25 | -8,816.98 | T0037 EXACT_MONTH_SUM ✓ ↔ Pmt 42235, Inv 47531 |
| 05 Nov 2025 | Invoice | 47517 | — | CYL | 16,962.50 | 8,145.52 | T0025 CN_AMOUNT_DATE ? ↔ Crd Note 13815 |
| 05 Nov 2025 | Invoice | 47531 | DN# 20775 | OTHER | 6,790.00 | 14,935.52 | T0037 EXACT_MONTH_SUM ✓ ↔ Pmt 42235, Inv 47516 |
| 12 Nov 2025 | Payment | 42235 | TRANSF \| STAT:121 | LPG | -15,409.25 | -473.73 | T0037 EXACT_MONTH_SUM ✓ ↔ Inv 47516, Inv 47531 |
| 19 Nov 2025 | Invoice | 47760 | DN#21163 | LPG | 8,754.55 | 8,280.82 | T0038 EXACT_SINGLE ✓ ↔ Pmt 42548 |
| 19 Nov 2025 | Invoice | 47760 | DN#21163 | OTHER | 6,200.00 | 14,480.82 | T0038 EXACT_SINGLE ✓ ↔ Pmt 42548 |
| 19 Nov 2025 | Invoice | 47761 | DN#21163-EMPTY | CYL | 19,090.00 | 33,570.82 | OPEN |
| 20 Nov 2025 | Crd Note | 13911 | DN#21163-EMPTY | CYL | -19,607.50 | 13,963.32 | OPEN |

### December 2025

Opening balance (ERP running): **R13,963.32**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Dec 2025 | Payment | 42548 | TRANSF \| STAT:122 | LPG | -14,954.50 | -991.18 | T0038 EXACT_SINGLE ✓ ↔ Inv 47760 |
| 08 Dec 2025 | Crd Note | 14032 | DN#21405-EMPTY | CYL | -18,687.50 | -19,678.68 | T0012 CN_DN_PAIR ✓ ↔ Inv 48149 |
| 08 Dec 2025 | Crd Note | 14033 | DN#21405 | LPG | -7,356.43 | -27,035.11 | T0013 CN_DN_PAIR ✓ ↔ Inv 48148 |
| 08 Dec 2025 | Invoice | 48148 | DN#21405 | LPG | 7,356.43 | -19,678.68 | T0013 CN_DN_PAIR ✓ ↔ Crd Note 14033 |
| 08 Dec 2025 | Invoice | 48149 | DN#21405-EMPTY | CYL | 18,687.50 | -991.18 | T0012 CN_DN_PAIR ✓ ↔ Crd Note 14032 |
| 10 Dec 2025 | Invoice | 48204 | DN#21405 | LPG | 7,356.43 | 6,365.25 | T0039 EXACT_SINGLE ✓ ↔ Pmt 42771 |
| 10 Dec 2025 | Invoice | 48205 | DN#21405-EMPTY | CYL | 18,687.50 | 25,052.75 | T0014 CN_DN_PAIR ✓ ↔ Crd Note 14051 |
| 11 Dec 2025 | Crd Note | 14051 | DN#21405-EMPTY | CYL | -18,687.50 | 6,365.25 | T0014 CN_DN_PAIR ✓ ↔ Inv 48205 |
| 19 Dec 2025 | Crd Note | 14133 | DN#21725-EMPTY | CYL | -17,422.50 | -11,057.25 | OPEN |
| 19 Dec 2025 | Invoice | 48386 | DN#21725 | LPG | 18,391.03 | 7,333.78 | T0040 EXACT_SINGLE ✓ ↔ Pmt 42857 |
| 19 Dec 2025 | Invoice | 48387 | DN#21725-EMPTY | CYL | 42,262.50 | 49,596.28 | OPEN |
| 22 Dec 2025 | Payment | 42771 | TRANSF \| STAT:122 | LPG | -7,356.43 | 42,239.85 | T0039 EXACT_SINGLE ✓ ↔ Inv 48204 |
| 29 Dec 2025 | Payment | 42857 | TRANSF \| STAT:122 | LPG | -18,391.00 | 23,848.85 | T0040 EXACT_SINGLE ✓ ↔ Inv 48386 |
| 29 Dec 2025 | Invoice | 48513 | DN#20957 | LPG | 7,789.18 | 31,638.03 | T0041 EXACT_SUM ✓ ↔ Pmt 43005, Inv 48819, Inv 48772 |
| 29 Dec 2025 | Invoice | 48514 | DN#20957- EMPTY | CYL | 20,700.00 | 52,338.03 | T0015 CN_DN_PAIR ✓ ↔ Crd Note 14179 |
| 30 Dec 2025 | Crd Note | 14179 | DN#20957- EMPTY | CYL | -20,700.00 | 31,638.03 | T0015 CN_DN_PAIR ✓ ↔ Inv 48514 |

### January 2026

Opening balance (ERP running): **R31,638.03**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Jan 2026 | Bank UD | 42900 | TRANSF \| STAT:122 | LPG | 42,262.50 | 73,900.53 | T0001 UD_CLEARING ✓ |
| 06 Jan 2026 | Payment | 42900 | TRANSF \| STAT:122 | LPG | -42,262.50 | 31,638.03 | T0001 UD_CLEARING ✓ |
| 14 Jan 2026 | Crd Note | 14281 | DN#20982-EMPTY | CYL | -38,985.00 | -7,346.97 | OPEN |
| 14 Jan 2026 | Invoice | 48772 | DN#20982 | LPG | 5,712.05 | -1,634.92 | T0041 EXACT_SUM ✓ ↔ Pmt 43005, Inv 48819, Inv 48513 |
| 14 Jan 2026 | Invoice | 48773 | DN#20982-EMPTY | CYL | 14,145.00 | 12,510.08 | OPEN |
| 16 Jan 2026 | Invoice | 48819 | — | OTHER | 6,600.00 | 19,110.08 | T0041 EXACT_SUM ✓ ↔ Pmt 43005, Inv 48772, Inv 48513 |
| 17 Jan 2026 | Payment | 43005 | TRANSF \| STAT:122 | LPG | -20,101.23 | -991.15 | T0041 EXACT_SUM ✓ ↔ Inv 48819, Inv 48772, Inv 48513 |

### February 2026

Opening balance (ERP running): **R-991.15**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Feb 2026 | Invoice | 49056 | DN_20999 | LPG | 11,473.54 | 10,482.39 | T0042 EXACT_MONTH_SUM ✓ ↔ Pmt 43375, Inv 49271 |
| 02 Feb 2026 | Invoice | 49057 | DN_EMPTY | CYL | 24,782.50 | 35,264.89 | T0026 CN_AMOUNT_DATE ? ↔ Crd Note 14366 |
| 03 Feb 2026 | Crd Note | 14366 | DN_EMPTY | CYL | -24,782.50 | 10,482.39 | T0026 CN_AMOUNT_DATE ? ↔ Inv 49057 |
| 11 Feb 2026 | Journal | 457 | — | LPG | -0.05 | 10,482.34 | OPEN |
| 11 Feb 2026 | Journal | 458 | — | LPG | -0.03 | 10,482.31 | OPEN |
| 17 Feb 2026 | Invoice | 49271 | DN#21257 | LPG | 9,586.72 | 20,069.03 | T0042 EXACT_MONTH_SUM ✓ ↔ Pmt 43375, Inv 49056 |
| 17 Feb 2026 | Invoice | 49272 | DN#21257-EMPTY | CYL | 24,035.00 | 44,104.03 | T0018 CN_DN_PAIR ✓ ↔ Crd Note 14442 |
| 17 Feb 2026 | Invoice | 49273 | FAULTY SWAP-DN#21258 | CYL | 517.50 | 44,621.53 | T0017 CN_DN_PAIR ✓ ↔ Crd Note 14440 |
| 17 Feb 2026 | Invoice | 49273 | FAULTY SWAP-DN#21258 | LPG | 198.80 | 44,820.33 | T0016 CN_DN_PAIR ✓ ↔ Crd Note 14440 |
| 18 Feb 2026 | Crd Note | 14440 | FAULTY SWAP-DN#21258 | CYL | -517.50 | 44,302.83 | T0017 CN_DN_PAIR ✓ ↔ Inv 49273 |
| 18 Feb 2026 | Crd Note | 14440 | FAULTY SWAP-DN#21258 | LPG | -198.80 | 44,104.03 | T0016 CN_DN_PAIR ✓ ↔ Inv 49273 |
| 18 Feb 2026 | Crd Note | 14442 | DN#21257-EMPTY | CYL | -24,035.00 | 20,069.03 | T0018 CN_DN_PAIR ✓ ↔ Inv 49272 |
| 18 Feb 2026 | Payment | 43375 | TRANSF \| STAT:123 | LPG | -21,060.26 | -991.23 | T0042 EXACT_MONTH_SUM ✓ ↔ Inv 49056, Inv 49271 |
| 26 Feb 2026 | Invoice | 49466 | DN#22103 | LPG | 10,448.30 | 9,457.07 | T0043 EXACT_SINGLE ✓ ↔ Pmt 43608 |
| 26 Feb 2026 | Invoice | 49467 | DN#22103-EMPTY | CYL | 21,447.50 | 30,904.57 | OPEN |
| 28 Feb 2026 | Crd Note | 14509 | DN#22103-EMPTY | CYL | -19,377.50 | 11,527.07 | OPEN |

### March 2026

Opening balance (ERP running): **R11,527.07**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Mar 2026 | Payment | 43608 | TRANSF \| STAT:124 | LPG | -10,448.30 | 1,078.77 | T0043 EXACT_SINGLE ✓ ↔ Inv 49466 |
| 17 Mar 2026 | Crd Note | 14606 | DN#21830 | LPG | -9,361.59 | -8,282.82 | T0019 CN_DN_PAIR ✓ ↔ Inv 49776 |
| 17 Mar 2026 | Crd Note | 14607 | DN#21830-EMPTY | CYL | -20,067.50 | -28,350.32 | T0020 CN_DN_PAIR ✓ ↔ Inv 49777 |
| 17 Mar 2026 | Invoice | 49776 | DN#21830 | LPG | 9,361.59 | -18,988.73 | T0019 CN_DN_PAIR ✓ ↔ Crd Note 14606 |
| 17 Mar 2026 | Invoice | 49777 | DN#21830-EMPTY | CYL | 20,067.50 | 1,078.77 | T0020 CN_DN_PAIR ✓ ↔ Crd Note 14607 |
| 18 Mar 2026 | Invoice | 49811 | DN=22136 | LPG | 9,361.59 | 10,440.36 | T0044 EXACT_MONTH_SUM ✓ ↔ Pmt 43933, Inv 49966 |
| 18 Mar 2026 | Invoice | 49812 | DN=22136-EMPTY | CYL | 20,067.50 | 30,507.86 | OPEN |
| 19 Mar 2026 | Crd Note | 14621 | DN=22136-EMPTY | CYL | -22,137.50 | 8,370.36 | OPEN |
| 28 Mar 2026 | Crd Note | 14672 | DN-22030-EMPTY | CYL | -47,150.00 | -38,779.64 | T0021 CN_DN_PAIR ✓ ↔ Inv 49967 |
| 28 Mar 2026 | Invoice | 49966 | DN-22030 | LPG | 19,057.51 | -19,722.13 | T0044 EXACT_MONTH_SUM ✓ ↔ Pmt 43933, Inv 49811 |
| 28 Mar 2026 | Invoice | 49967 | DN-22030-EMPTY | CYL | 47,150.00 | 27,427.87 | T0021 CN_DN_PAIR ✓ ↔ Crd Note 14672 |
| 28 Mar 2026 | Invoice | 49974 | DN#22030-EMPTY | CYL | 40,537.50 | 67,965.37 | OPEN |
| 30 Mar 2026 | Crd Note | 14680 | DN#22030-EMPTY | CYL | -10,407.50 | 57,557.87 | OPEN |

### April 2026

Opening balance (ERP running): **R57,557.87**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Apr 2026 | Payment | 43933 | TRANSF \| STAT:125 | LPG | -28,419.10 | 29,138.77 | T0044 EXACT_MONTH_SUM ✓ ↔ Inv 49811, Inv 49966 |

### May 2026

Opening balance (ERP running): **R29,138.77**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 May 2026 | Invoice | 50627 | DN#22702 | LPG | 8,168.05 | 37,306.82 | T0046 EXACT_SUM ✓ ↔ Pmt 45930, Inv 52152 |
| 11 May 2026 | Invoice | 50628 | DN#22702-EMPTY | CYL | 13,800.00 | 51,106.82 | OPEN |
| 12 May 2026 | Crd Note | 14895 | DN#22702-EMPTY | CYL | -32,085.00 | 19,021.82 | OPEN |

### June 2026

Opening balance (ERP running): **R19,021.82**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Jun 2026 | Crd Note | 15048 | DN#22638 EMPTIES | CYL | -28,635.00 | -9,613.18 | OPEN |
| 11 Jun 2026 | Invoice | 51167 | DN#22638 | LPG | 13,572.09 | 3,958.91 | T0045 EXACT_SINGLE ✓ ↔ Pmt 44969 |
| 11 Jun 2026 | Invoice | 51168 | DN#22638 EMPTIES | CYL | 23,460.00 | 27,418.91 | OPEN |
| 30 Jun 2026 | Payment | 44969 | TRANSF \| STAT:127 | LPG | -13,572.09 | 13,846.82 | T0045 EXACT_SINGLE ✓ ↔ Inv 51167 |

### July 2026

Opening balance (ERP running): **R13,846.82**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 28 Jul 2026 | Invoice | 52152 | DN#24221 | LPG | 12,615.10 | 26,461.92 | T0046 EXACT_SUM ✓ ↔ Pmt 45930, Inv 50627 |
| 28 Jul 2026 | Invoice | 52153 | DN#24221-EMPTY | CYL | 22,137.50 | 48,599.42 | OPEN |
| 31 Jul 2026 | Crd Note | 15364 | DN#24221-EMPTY | CYL | -23,057.50 | 25,541.92 | OPEN |

### August 2026

Opening balance (ERP running): **R25,541.92**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 24 Aug 2026 | Payment | 45930 | TRANSF \| STAT:129 | LPG | -20,783.15 | 4,758.77 | T0046 EXACT_SUM ✓ ↔ Inv 52152, Inv 50627 |

### September 2026

Opening balance (ERP running): **R4,758.77**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Sept 2026 | Crd Note | 15581 | DN#23996-FAULTY SWAP | CYL | -517.50 | 4,241.27 | T0023 CN_DN_PAIR ✓ ↔ Inv 52915 |
| 01 Sept 2026 | Crd Note | 15581 | DN#23996-FAULTY SWAP | LPG | -227.37 | 4,013.90 | T0022 CN_DN_PAIR ✓ ↔ Inv 52915 |
| 01 Sept 2026 | Crd Note | 15582 | DN#23995-EMPTY | CYL | -8,855.00 | -4,841.10 | T0024 CN_DN_PAIR ✓ ↔ Inv 52914 |
| 01 Sept 2026 | Invoice | 52913 | DN#23995 | LPG | 4,269.39 | -571.71 | OPEN |
| 01 Sept 2026 | Invoice | 52914 | DN#23995-EMPTY | CYL | 8,855.00 | 8,283.29 | T0024 CN_DN_PAIR ✓ ↔ Crd Note 15582 |
| 01 Sept 2026 | Invoice | 52915 | DN#23996-FAULTY SWAP | CYL | 517.50 | 8,800.79 | T0023 CN_DN_PAIR ✓ ↔ Crd Note 15581 |
| 01 Sept 2026 | Invoice | 52915 | DN#23996-FAULTY SWAP | LPG | 227.37 | 9,028.16 | T0022 CN_DN_PAIR ✓ ↔ Crd Note 15581 |
| 21 Sept 2026 | Invoice | 53236 | DN#23805 | LPG | 11,252.81 | 20,280.97 | OPEN |
| 21 Sept 2026 | Invoice | 53237 | DN#23805-EMPTY | CYL | 22,137.50 | 42,418.47 | OPEN |
| 22 Sept 2026 | Crd Note | 15686 | DN#23805-EMPTY | CYL | -25,300.00 | 17,118.47 | OPEN |

---

## Ties by rule

| Rule | Confirmed | Probable |
| :--- | ---: | ---: |
| UD_CLEARING | 1 | 0 |
| CN_DN_PAIR | 21 | 2 |
| CN_AMOUNT_DATE | 0 | 2 |
| EXACT_SINGLE | 12 | 0 |
| EXACT_MONTH_SUM | 5 | 0 |
| EXACT_SUM | 3 | 0 |
| PROXIMITY | 0 | 3 |
| NEAR_SUM | 0 | 1 |

## Probable ties awaiting approval

| Tie | Rule | Documents | Variance (R) |
| :--- | :--- | :--- | ---: |
| T0003 | CN_DN_PAIR | Invoice 42256, Crd Note 12282 | — |
| T0008 | CN_DN_PAIR | Invoice 44213, Crd Note 12820 | — |
| T0025 | CN_AMOUNT_DATE | Invoice 47517, Crd Note 13815 | — |
| T0026 | CN_AMOUNT_DATE | Invoice 49057, Crd Note 14366 | — |
| T0047 | PROXIMITY | Payment 37815, Invoice 41595 | 0.08 |
| T0048 | PROXIMITY | Payment 38240, Invoice 42255 | -0.09 |
| T0049 | PROXIMITY | Payment 41048, Invoice 46083 | -0.06 |
| T0050 | NEAR_SUM | Payment 41581, Invoice 46694, Invoice 46662, Invoice 44978 | 0.52 |

Proof: holds (rebuilt R17,118.47 vs closing R17,118.47; ERP R17,118.47).

