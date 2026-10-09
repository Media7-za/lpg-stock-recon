# Internal ledger: TANDOOR THE CLAY OVEN (TAN002), matcher review
**INTERNAL, not for the customer.** Every transaction in ERP order with the ERP running balance and what matcher v5 did with it · generated 2026-10-09 · 69 confirmed / 20 probable ties · 41 rows open · ERP `CURRENT BALANCE` R7,938.37 · PROPOSED — NOT RATIFIED · **REVIEW ONLY:** ingestCoverage partial

**Status key:** `OPEN` untied · `T0001 EXACT_SINGLE ✓` confirmed tie · `T0001 BATCH_SUM ?` probable tie (needs approval) · `LOCKED` operator-approved lock · `◀ ZERO` ERP running balance is within R0.05 after this line.

---

### February 2025

Opening balance (ERP running): **R16,828.85**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 22 Feb 2025 | Payment | 36865 | SPEEDP \| PC-76-17 | LPG | -12,282.56 | 4,546.29 | OPEN |

### March 2025

Opening balance (ERP running): **R4,546.29**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Mar 2025 | Crd Note | 12022 | DN#11730-EMPTY | CYL | -1,207.50 | 3,338.79 | T0001 CN_DN_PAIR ✓ ↔ Inv 41271 |
| 06 Mar 2025 | Invoice | 41270 | DN#11730 | LPG | 1,338.78 | 4,677.57 | OPEN |
| 06 Mar 2025 | Invoice | 41271 | DN#11730-EMPTY | CYL | 1,207.50 | 5,885.07 | T0001 CN_DN_PAIR ✓ ↔ Crd Note 12022 |
| 12 Mar 2025 | Invoice | 41408 | D/N 12919 | LPG | 3,207.50 | 9,092.57 | OPEN |
| 18 Mar 2025 | Invoice | 41584 | DN#10527 | LPG | 2,677.57 | 11,770.14 | OPEN |
| 18 Mar 2025 | Invoice | 41589 | DN#10527-EMPTY | CYL | 2,415.00 | 14,185.14 | T0002 CN_DN_PAIR ✓ ↔ Crd Note 12093 |
| 19 Mar 2025 | Crd Note | 12093 | DN#10527-EMPTY | CYL | -2,415.00 | 11,770.14 | T0002 CN_DN_PAIR ✓ ↔ Inv 41589 |
| 27 Mar 2025 | Payment | 37780 | TRANSF \| STAT 112 | LPG | -10,431.35 | 1,338.79 | OPEN |

### April 2025

Opening balance (ERP running): **R1,338.79**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Apr 2025 | Invoice | 41892 | DN#12835 | LPG | 1,868.72 | 3,207.51 | OPEN |
| 01 Apr 2025 | Invoice | 41893 | DN#12835-EMPTY | CYL | 1,897.50 | 5,105.01 | T0003 CN_DN_PAIR ? ↔ Crd Note 12186 |
| 04 Apr 2025 | Crd Note | 12186 | DN#12835-EMPTY | CYL | -1,897.50 | 3,207.51 | T0003 CN_DN_PAIR ? ↔ Inv 41893 |
| 04 Apr 2025 | Invoice | 42017 | DN#3000 | LPG | 2,677.57 | 5,885.08 | T0069 EXACT_RUN ✓ ↔ Pmt 39035, Inv 42249, Inv 42315, Inv 42427 +3 |
| 04 Apr 2025 | Invoice | 42018 | DN#13000-EMPTY | CYL | 2,415.00 | 8,300.08 | T0004 CN_DN_PAIR ? ↔ Crd Note 12204 |
| 07 Apr 2025 | Crd Note | 12204 | DN#13000-EMPTY | CYL | -2,415.00 | 5,885.08 | T0004 CN_DN_PAIR ? ↔ Inv 42018 |
| 14 Apr 2025 | Crd Note | 12271 | DN#13061-EMPTY | CYL | -1,207.50 | 4,677.58 | T0005 CN_DN_PAIR ✓ ↔ Inv 42250 |
| 14 Apr 2025 | Invoice | 42249 | DN#13061 | LPG | 1,306.16 | 5,983.74 | T0069 EXACT_RUN ✓ ↔ Pmt 39035, Inv 42017, Inv 42315, Inv 42427 +3 |
| 14 Apr 2025 | Invoice | 42250 | DN#13061-EMPTY | CYL | 1,207.50 | 7,191.24 | T0005 CN_DN_PAIR ✓ ↔ Crd Note 12271 |
| 16 Apr 2025 | Invoice | 42315 | DN#13075 | LPG | 1,306.16 | 8,497.40 | T0069 EXACT_RUN ✓ ↔ Pmt 39035, Inv 42017, Inv 42249, Inv 42427 +3 |
| 16 Apr 2025 | Invoice | 42316 | DN#13075-EMPTY | CYL | 1,207.50 | 9,704.90 | T0006 CN_DN_PAIR ✓ ↔ Crd Note 12298 |
| 17 Apr 2025 | Crd Note | 12298 | DN#13075-EMPTY | CYL | -1,207.50 | 8,497.40 | T0006 CN_DN_PAIR ✓ ↔ Inv 42316 |
| 22 Apr 2025 | Crd Note | 12321 | DN#13152-EMPTY | CYL | -3,105.00 | 5,392.40 | T0007 CN_DN_PAIR ✓ ↔ Inv 42428 |
| 22 Apr 2025 | Invoice | 42427 | DN#13152 | LPG | 3,129.33 | 8,521.73 | T0069 EXACT_RUN ✓ ↔ Pmt 39035, Inv 42017, Inv 42249, Inv 42315 +3 |
| 22 Apr 2025 | Invoice | 42428 | DN#13152-EMPTY | CYL | 3,105.00 | 11,626.73 | T0007 CN_DN_PAIR ✓ ↔ Crd Note 12321 |
| 26 Apr 2025 | Invoice | 42574 | DN#13167 | LPG | 1,306.16 | 12,932.89 | T0069 EXACT_RUN ✓ ↔ Pmt 39035, Inv 42017, Inv 42249, Inv 42315 +3 |
| 26 Apr 2025 | Invoice | 42575 | DN#13167-EMPTY | CYL | 1,207.50 | 14,140.39 | T0008 CN_DN_PAIR ? ↔ Crd Note 12360 |
| 29 Apr 2025 | Crd Note | 12360 | DN#13167-EMPTY | CYL | -1,207.50 | 12,932.89 | T0008 CN_DN_PAIR ? ↔ Inv 42575 |

### May 2025

Opening balance (ERP running): **R12,932.89**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 May 2025 | Crd Note | 12393 | DN#13184- EMPTY | CYL | -1,207.50 | 11,725.39 | T0009 CN_DN_PAIR ✓ ↔ Inv 42751 |
| 03 May 2025 | Invoice | 42750 | DN#13184 | LPG | 1,306.16 | 13,031.55 | T0069 EXACT_RUN ✓ ↔ Pmt 39035, Inv 42017, Inv 42249, Inv 42315 +3 |
| 03 May 2025 | Invoice | 42751 | DN#13184- EMPTY | CYL | 1,207.50 | 14,239.05 | T0009 CN_DN_PAIR ✓ ↔ Crd Note 12393 |
| 06 May 2025 | Crd Note | 12426 | DN#12061-EMPTY | CYL | -2,415.00 | 11,824.05 | T0010 CN_DN_PAIR ✓ ↔ Inv 42840 |
| 06 May 2025 | Invoice | 42839 | DN#12061 | LPG | 2,612.32 | 14,436.37 | T0069 EXACT_RUN ✓ ↔ Pmt 39035, Inv 42017, Inv 42249, Inv 42315 +3 |
| 06 May 2025 | Invoice | 42840 | DN#12061-EMPTY | CYL | 2,415.00 | 16,851.37 | T0010 CN_DN_PAIR ✓ ↔ Crd Note 12426 |
| 09 May 2025 | Invoice | 42964 | DN#13212 | LPG | 1,306.16 | 18,157.53 | OPEN |
| 10 May 2025 | Invoice | 42965 | DN#13212-EMPTY | CYL | 1,207.50 | 19,365.03 | T0011 CN_DN_PAIR ? ↔ Crd Note 12459 |
| 12 May 2025 | Crd Note | 12459 | DN#13212-EMPTY | CYL | -1,207.50 | 18,157.53 | T0011 CN_DN_PAIR ? ↔ Inv 42965 |
| 16 May 2025 | Invoice | 43132 | DN#13148 | LPG | 1,306.16 | 19,463.69 | OPEN |
| 16 May 2025 | Invoice | 43134 | DN#13148-EMPTY | CYL | 1,207.50 | 20,671.19 | T0012 CN_DN_PAIR ? ↔ Crd Note 12516 |
| 19 May 2025 | Crd Note | 12516 | DN#13148-EMPTY | CYL | -1,207.50 | 19,463.69 | T0012 CN_DN_PAIR ? ↔ Inv 43134 |
| 24 May 2025 | Invoice | 43333 | DN#12262 | LPG | 2,650.73 | 22,114.42 | OPEN |
| 24 May 2025 | Invoice | 43334 | DN#12262-EMPTY | CYL | 2,415.00 | 24,529.42 | T0013 CN_DN_PAIR ? ↔ Crd Note 12565 |
| 24 May 2025 | Invoice | 43353 | DN#12263 | LPG | 1,849.98 | 26,379.40 | OPEN |
| 26 May 2025 | Crd Note | 12565 | DN#12262-EMPTY | CYL | -2,415.00 | 23,964.40 | T0013 CN_DN_PAIR ? ↔ Inv 43334 |
| 26 May 2025 | Crd Note | 12567 | DN#12263-EMPTY | CYL | -1,725.00 | 22,239.40 | OPEN |
| 26 May 2025 | Invoice | 43365 | DN#12263-EMPTY | CYL | 1,897.50 | 24,136.90 | OPEN |
| 29 May 2025 | Invoice | 43465 | DN#12139 | LPG | 1,573.87 | 25,710.77 | OPEN |
| 29 May 2025 | Invoice | 43468 | DN#12139-EMPTY | CYL | 1,725.00 | 27,435.77 | OPEN |
| 30 May 2025 | Crd Note | 12597 | DN#12139-EMPTY | CYL | -1,207.50 | 26,228.27 | T0089 CYL_EXCHANGE ✓ ↔ Crd Note 12883, Inv 44448, Crd Note 13036, Inv 45078 +6 |

### June 2025

Opening balance (ERP running): **R26,228.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Jun 2025 | Payment | 39035 | SPEEDP \| PC-76-20 | LPG | -13,643.86 | 12,584.41 | T0069 EXACT_RUN ✓ ↔ Inv 42017, Inv 42249, Inv 42315, Inv 42427 +3 |
| 07 Jun 2025 | Invoice | 43701 | DN#12497 | LPG | 1,849.98 | 14,434.39 | OPEN |
| 07 Jun 2025 | Invoice | 43702 | DN#12497-EMPTY | CYL | 1,897.50 | 16,331.89 | T0014 CN_DN_PAIR ? ↔ Crd Note 12661 |
| 09 Jun 2025 | Crd Note | 12661 | DN#12497-EMPTY | CYL | -1,897.50 | 14,434.39 | T0014 CN_DN_PAIR ? ↔ Inv 43702 |
| 10 Jun 2025 | Invoice | 43762 | DN#12367 | LPG | 3,175.35 | 17,609.74 | OPEN |
| 10 Jun 2025 | Invoice | 43763 | DN#12367-EMPTY | CYL | 3,105.00 | 20,714.74 | T0015 CN_DN_PAIR ✓ ↔ Crd Note 12683 |
| 11 Jun 2025 | Crd Note | 12683 | DN#12367-EMPTY | CYL | -3,105.00 | 17,609.74 | T0015 CN_DN_PAIR ✓ ↔ Inv 43763 |
| 17 Jun 2025 | Crd Note | 12738 | DN#12399-EMPTY | CYL | -3,105.00 | 14,504.74 | T0016 CN_DN_PAIR ✓ ↔ Inv 43995 |
| 17 Jun 2025 | Invoice | 43994 | DN#12399-HILTON | LPG | 3,086.80 | 17,591.54 | OPEN |
| 17 Jun 2025 | Invoice | 43995 | DN#12399-EMPTY | CYL | 3,105.00 | 20,696.54 | T0016 CN_DN_PAIR ✓ ↔ Crd Note 12738 |
| 24 Jun 2025 | Invoice | 44198 | DN#12326 | LPG | 2,576.80 | 23,273.34 | OPEN |
| 24 Jun 2025 | Invoice | 44199 | DN#12326-EMPTY | CYL | 2,415.00 | 25,688.34 | T0017 CN_DN_PAIR ✓ ↔ Crd Note 12813 |
| 25 Jun 2025 | Crd Note | 12813 | DN#12326-EMPTY | CYL | -2,415.00 | 23,273.34 | T0017 CN_DN_PAIR ✓ ↔ Inv 44199 |

### July 2025

Opening balance (ERP running): **R23,273.34**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Jul 2025 | Crd Note | 12883 | DN#12154-EMPTY | CYL | -1,897.50 | 21,375.84 | T0089 CYL_EXCHANGE ✓ ↔ Crd Note 12597, Inv 44448, Crd Note 13036, Inv 45078 +6 |
| 02 Jul 2025 | Invoice | 44447 | DN#12154 | LPG | 2,576.80 | 23,952.64 | OPEN |
| 02 Jul 2025 | Invoice | 44448 | DN#12154-EMPTY | CYL | 2,415.00 | 26,367.64 | T0089 CYL_EXCHANGE ✓ ↔ Crd Note 12597, Crd Note 12883, Crd Note 13036, Inv 45078 +6 |
| 09 Jul 2025 | Crd Note | 12944 | DN#12677-EMPTY | CYL | -2,415.00 | 23,952.64 | T0018 CN_DN_PAIR ✓ ↔ Inv 44673 |
| 09 Jul 2025 | Invoice | 44672 | DN#12677 | LPG | 2,529.22 | 26,481.86 | OPEN |
| 09 Jul 2025 | Invoice | 44673 | DN#12677-EMPTY | CYL | 2,415.00 | 28,896.86 | T0018 CN_DN_PAIR ✓ ↔ Crd Note 12944 |
| 15 Jul 2025 | Payment | 39960 | SPEEDP \| PC-76-21 | LPG | -500.57 | 28,396.29 | T0070 EXACT_SINGLE ✓ ↔ Inv 44854 |
| 15 Jul 2025 | Payment | 39962 | SPEEDP \| PC-76-21 | LPG | -10,000.00 | 18,396.29 | OPEN |
| 15 Jul 2025 | Invoice | 44854 | — | LPG | 500.57 | 18,896.86 | T0070 EXACT_SINGLE ✓ ↔ Pmt 39960 |
| 16 Jul 2025 | Invoice | 44883 | DN#12210 | LPG | 2,529.22 | 21,426.08 | OPEN |
| 23 Jul 2025 | Crd Note | 13033 | PMB | CYL | -3,105.00 | 18,321.08 | T0067 CN_AMOUNT_DATE ? ↔ Inv 45066 |
| 23 Jul 2025 | Crd Note | 13036 | HILTON - | CYL | -2,415.00 | 15,906.08 | T0089 CYL_EXCHANGE ✓ ↔ Crd Note 12597, Crd Note 12883, Inv 44448, Inv 45078 +6 |
| 23 Jul 2025 | Invoice | 45061 | PIETERMARITZBURG | LPG | 3,029.79 | 18,935.87 | OPEN |
| 23 Jul 2025 | Invoice | 45066 | PMB | CYL | 3,105.00 | 22,040.87 | T0067 CN_AMOUNT_DATE ? ↔ Crd Note 13033 |
| 23 Jul 2025 | Invoice | 45067 | HILTON | LPG | 1,765.18 | 23,806.05 | OPEN |
| 23 Jul 2025 | Invoice | 45078 | HILTON - | CYL | 1,897.50 | 25,703.55 | T0089 CYL_EXCHANGE ✓ ↔ Crd Note 12597, Crd Note 12883, Inv 44448, Crd Note 13036 +6 |

### August 2025

Opening balance (ERP running): **R25,703.55**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Aug 2025 | Invoice | 45350 | HILTON. | LPG | 1,264.61 | 26,968.16 | OPEN |
| 02 Aug 2025 | Invoice | 45351 | DN#20049 | CYL | 1,207.50 | 28,175.66 | T0019 CN_DN_PAIR ? ↔ Crd Note 13135 |
| 05 Aug 2025 | Crd Note | 13135 | DN#20049 | CYL | -1,207.50 | 26,968.16 | T0019 CN_DN_PAIR ? ↔ Inv 45351 |
| 09 Aug 2025 | Invoice | 45536 | DN#20155 | LPG | 1,264.61 | 28,232.77 | OPEN |
| 09 Aug 2025 | Invoice | 45537 | DN#20155-EMPTY | CYL | 1,207.50 | 29,440.27 | T0020 CN_DN_PAIR ? ↔ Crd Note 13185 |
| 09 Aug 2025 | Invoice | 45543 | DN#20158 | LPG | 2,529.22 | 31,969.49 | OPEN |
| 09 Aug 2025 | Invoice | 45544 | DN#20158-EMPTY | CYL | 2,415.00 | 34,384.49 | T0021 CN_DN_PAIR ? ↔ Crd Note 13188 |
| 11 Aug 2025 | Crd Note | 13185 | DN#20155-EMPTY | CYL | -1,207.50 | 33,176.99 | T0020 CN_DN_PAIR ? ↔ Inv 45537 |
| 11 Aug 2025 | Crd Note | 13188 | DN#20158-EMPTY | CYL | -2,415.00 | 30,761.99 | T0021 CN_DN_PAIR ? ↔ Inv 45544 |
| 15 Aug 2025 | Payment | 40610 | SPEEDP \| PC-76-22 | LPG | -12,880.00 | 17,881.99 | OPEN |
| 21 Aug 2025 | Crd Note | 13280 | DN#20328-EMPTY PMB | CYL | -2,415.00 | 15,466.99 | T0022 CN_DN_PAIR ✓ ↔ Inv 45793 |
| 21 Aug 2025 | Invoice | 45792 | DN#20328-PMB | LPG | 2,471.81 | 17,938.80 | OPEN |
| 21 Aug 2025 | Invoice | 45793 | DN#20328-EMPTY PMB | CYL | 2,415.00 | 20,353.80 | T0022 CN_DN_PAIR ✓ ↔ Crd Note 13280 |
| 21 Aug 2025 | Invoice | 45802 | DN#20533 | LPG | 2,471.81 | 22,825.61 | OPEN |
| 21 Aug 2025 | Invoice | 45803 | DN#20533-EMPTY | CYL | 2,415.00 | 25,240.61 | T0023 CN_DN_PAIR ✓ ↔ Crd Note 13285 |
| 22 Aug 2025 | Crd Note | 13285 | DN#20533-EMPTY | CYL | -2,415.00 | 22,825.61 | T0023 CN_DN_PAIR ✓ ↔ Inv 45803 |
| 23 Aug 2025 | Payment | 40718 | SPEEDP \| PC-76-22 | LPG | -15,000.00 | 7,825.61 | OPEN |

### September 2025

Opening balance (ERP running): **R7,825.61**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Sept 2025 | Invoice | 46077 | DN#20570 | LPG | 1,725.12 | 9,550.73 | OPEN |
| 02 Sept 2025 | Invoice | 46078 | DN#20570-EMPTY | CYL | 1,897.50 | 11,448.23 | T0024 CN_DN_PAIR ✓ ↔ Crd Note 13366 |
| 03 Sept 2025 | Crd Note | 13366 | DN#20570-EMPTY | CYL | -1,897.50 | 9,550.73 | T0024 CN_DN_PAIR ✓ ↔ Inv 46078 |
| 06 Sept 2025 | Crd Note | 13405 | DN#20364-EMPTY | CYL | -3,105.00 | 6,445.73 | T0025 CN_DN_PAIR ✓ ↔ Inv 46192 |
| 06 Sept 2025 | Invoice | 46191 | DN#20364-PMB | LPG | 2,828.41 | 9,274.14 | OPEN |
| 06 Sept 2025 | Invoice | 46192 | DN#20364-EMPTY | CYL | 3,105.00 | 12,379.14 | T0025 CN_DN_PAIR ✓ ↔ Crd Note 13405 |
| 11 Sept 2025 | Invoice | 46310 | DN#20240 | LPG | 1,180.56 | 13,559.70 | T0071 EXACT_SUM ✓ ↔ Pmt 41261, Inv 46498 |
| 11 Sept 2025 | Invoice | 46311 | DN#20240-EMPTY | CYL | 1,207.50 | 14,767.20 | T0026 CN_DN_PAIR ✓ ↔ Crd Note 13449 |
| 12 Sept 2025 | Crd Note | 13449 | DN#20240-EMPTY | CYL | -1,207.50 | 13,559.70 | T0026 CN_DN_PAIR ✓ ↔ Inv 46311 |
| 18 Sept 2025 | Crd Note | 13502 | DN#20389-EMPTY | CYL | -1,207.50 | 12,352.20 | T0027 CN_DN_PAIR ✓ ↔ Inv 46477 |
| 18 Sept 2025 | Payment | 41252 | TRANSF \| STAT 118 | LPG | -13,764.51 | -1,412.31 | OPEN |
| 18 Sept 2025 | Invoice | 46476 | DN#20389 | LPG | 1,180.56 | -231.75 | T0072 EXACT_SUM ✓ ↔ Pmt 41474, Inv 46654 |
| 18 Sept 2025 | Invoice | 46477 | DN#20389-EMPTY | CYL | 1,207.50 | 975.75 | T0027 CN_DN_PAIR ✓ ↔ Crd Note 13502 |
| 19 Sept 2025 | Crd Note | 13508 | DN#20256-EMPTY | CYL | -2,415.00 | -1,439.25 | T0028 CN_DN_PAIR ✓ ↔ Inv 46499 |
| 19 Sept 2025 | Invoice | 46498 | DN#20256- PMB | LPG | 2,361.11 | 921.86 | T0071 EXACT_SUM ✓ ↔ Pmt 41261, Inv 46310 |
| 19 Sept 2025 | Invoice | 46499 | DN#20256-EMPTY | CYL | 2,415.00 | 3,336.86 | T0028 CN_DN_PAIR ✓ ↔ Crd Note 13508 |
| 20 Sept 2025 | Payment | 41261 | TRANSF \| STAT 118 | LPG | -3,541.67 | -204.81 | T0071 EXACT_SUM ✓ ↔ Inv 46498, Inv 46310 |
| 25 Sept 2025 | Invoice | 46654 | DN#21066- PMB | LPG | 1,180.56 | 975.75 | T0072 EXACT_SUM ✓ ↔ Pmt 41474, Inv 46476 |
| 25 Sept 2025 | Invoice | 46655 | DN#21066-EMPTY PMB | CYL | 1,207.50 | 2,183.25 | T0029 CN_DN_PAIR ? ↔ Crd Note 13561 |
| 25 Sept 2025 | Invoice | 46656 | DN#21067-HILTON | LPG | 1,180.56 | 3,363.81 | T0030 CN_DN_PAIR ? ↔ Crd Note 13562 |
| 25 Sept 2025 | Invoice | 46657 | DN#21067-EMPTY | CYL | 1,207.50 | 4,571.31 | T0031 CN_DN_PAIR ? ↔ Crd Note 13563 |
| 29 Sept 2025 | Crd Note | 13561 | DN#21066-EMPTY PMB | CYL | -1,207.50 | 3,363.81 | T0029 CN_DN_PAIR ? ↔ Inv 46655 |
| 29 Sept 2025 | Crd Note | 13562 | DN#21067-HILTON | LPG | -1,180.56 | 2,183.25 | T0030 CN_DN_PAIR ? ↔ Inv 46656 |
| 29 Sept 2025 | Crd Note | 13563 | DN#21067-EMPTY | CYL | -1,207.50 | 975.75 | T0031 CN_DN_PAIR ? ↔ Inv 46657 |
| 29 Sept 2025 | Crd Note | 13571 | DN#20280-EMPTY | CYL | -1,207.50 | -231.75 | T0032 CN_DN_PAIR ✓ ↔ Inv 46730 |
| 29 Sept 2025 | Invoice | 46729 | DN#20280 | LPG | 1,180.56 | 948.81 | T0074 EXACT_SINGLE ✓ ↔ Pmt 41630 |
| 29 Sept 2025 | Invoice | 46730 | DN#20280-EMPTY | CYL | 1,207.50 | 2,156.31 | T0032 CN_DN_PAIR ✓ ↔ Crd Note 13571 |
| 30 Sept 2025 | Payment | 41474 | TRANSF \| STAT 118 | LPG | -2,361.12 | -204.81 | T0072 EXACT_SUM ✓ ↔ Inv 46654, Inv 46476 |

### October 2025

Opening balance (ERP running): **R-204.81**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Oct 2025 | Crd Note | 13639 | DN#20293-EMPTY | CYL | -1,207.50 | -1,412.31 | T0033 CN_DN_PAIR ✓ ↔ Inv 46883 |
| 04 Oct 2025 | Invoice | 46882 | DN#20293- HILTON | LPG | 1,180.56 | -231.75 | OPEN |
| 04 Oct 2025 | Invoice | 46883 | DN#20293-EMPTY | CYL | 1,207.50 | 975.75 | T0033 CN_DN_PAIR ✓ ↔ Crd Note 13639 |
| 08 Oct 2025 | Invoice | 46968 | DN#20606 | LPG | 2,828.41 | 3,804.16 | T0073 EXACT_SUM ✓ ↔ Pmt 41629, Inv 46984 |
| 08 Oct 2025 | Invoice | 46969 | DN#20606-EMPTY | CYL | 3,105.00 | 6,909.16 | T0034 CN_DN_PAIR ✓ ↔ Crd Note 13645 |
| 09 Oct 2025 | Crd Note | 13645 | DN#20606-EMPTY | CYL | -3,105.00 | 3,804.16 | T0034 CN_DN_PAIR ✓ ↔ Inv 46969 |
| 09 Oct 2025 | Crd Note | 13653 | DN#20706-EMPTY | CYL | -1,897.50 | 1,906.66 | T0035 CN_DN_PAIR ✓ ↔ Inv 46985 |
| 09 Oct 2025 | Invoice | 46984 | DN#20706 | LPG | 1,647.86 | 3,554.52 | T0073 EXACT_SUM ✓ ↔ Pmt 41629, Inv 46968 |
| 09 Oct 2025 | Invoice | 46985 | DN#20706-EMPTY | CYL | 1,897.50 | 5,452.02 | T0035 CN_DN_PAIR ✓ ↔ Crd Note 13653 |
| 13 Oct 2025 | Payment | 41629 | SPEEDP \| PC-76-24 | LPG | -4,476.27 | 975.75 | T0073 EXACT_SUM ✓ ↔ Inv 46984, Inv 46968 |
| 13 Oct 2025 | Payment | 41630 | SPEEDP \| PC-76-24 | LPG | -1,180.56 | -204.81 | T0074 EXACT_SINGLE ✓ ↔ Inv 46729 |
| 20 Oct 2025 | Crd Note | 13713 | DN#21111-EMPTY | CYL | -1,207.50 | -1,412.31 | T0089 CYL_EXCHANGE ✓ ↔ Crd Note 12597, Crd Note 12883, Inv 44448, Crd Note 13036 +6 |
| 20 Oct 2025 | Invoice | 47178 | DN#21111- HILTON | LPG | 1,647.86 | 235.55 | OPEN |
| 20 Oct 2025 | Invoice | 47179 | DN#21111-EMPTY | CYL | 1,897.50 | 2,133.05 | T0089 CYL_EXCHANGE ✓ ↔ Crd Note 12597, Crd Note 12883, Inv 44448, Crd Note 13036 +6 |
| 24 Oct 2025 | Crd Note | 13743 | DN#20754-EMPTY | CYL | -2,415.00 | -281.95 | T0036 CN_DN_PAIR ✓ ↔ Inv 47286 |
| 24 Oct 2025 | Invoice | 47285 | DN#20754 | LPG | 2,361.11 | 2,079.16 | T0087 NEAR_SUM ? ↔ Pmt 42300, Inv 47662, Inv 47666 |
| 24 Oct 2025 | Invoice | 47286 | DN#20754-EMPTY | CYL | 2,415.00 | 4,494.16 | T0036 CN_DN_PAIR ✓ ↔ Crd Note 13743 |
| 27 Oct 2025 | Payment | 41964 | TRANSF \| STAT 119 | LPG | -4,258.61 | 235.55 | OPEN |
| 30 Oct 2025 | Crd Note | 13780 | DN#21133-EMPTY | CYL | -3,622.50 | -3,386.95 | T0037 CN_DN_PAIR ✓ ↔ Inv 47430 |
| 30 Oct 2025 | Crd Note | 13781 | DN#21133-EMPTY | CYL | -3,105.00 | -6,491.95 | T0089 CYL_EXCHANGE ✓ ↔ Crd Note 12597, Crd Note 12883, Inv 44448, Crd Note 13036 +6 |
| 30 Oct 2025 | Invoice | 47420 | DN#21133 | LPG | 2,361.11 | -4,130.84 | OPEN |
| 30 Oct 2025 | Invoice | 47421 | DN#21133-EMPTY | CYL | 2,415.00 | -1,715.84 | T0089 CYL_EXCHANGE ✓ ↔ Crd Note 12597, Crd Note 12883, Inv 44448, Crd Note 13036 +6 |
| 30 Oct 2025 | Invoice | 47430 | DN#21133-EMPTY | CYL | 3,622.50 | 1,906.66 | T0037 CN_DN_PAIR ✓ ↔ Crd Note 13780 |

### November 2025

Opening balance (ERP running): **R1,906.66**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Nov 2025 | Crd Note | 13866 | DN#20829-EMPTY | CYL | -1,897.50 | 9.16 | T0038 CN_DN_PAIR ✓ ↔ Inv 47667 |
| 14 Nov 2025 | Crd Note | 13868 | DN#20831-EMPTY | CYL | -3,105.00 | -3,095.84 | T0039 CN_DN_PAIR ✓ ↔ Inv 47663 |
| 14 Nov 2025 | Invoice | 47662 | DN#20831-PMB | LPG | 2,770.91 | -324.93 | T0087 NEAR_SUM ? ↔ Pmt 42300, Inv 47666, Inv 47285 |
| 14 Nov 2025 | Invoice | 47663 | DN#20831-EMPTY | CYL | 3,105.00 | 2,780.07 | T0039 CN_DN_PAIR ✓ ↔ Crd Note 13868 |
| 14 Nov 2025 | Invoice | 47666 | DN#20829 | LPG | 1,614.36 | 4,394.43 | T0087 NEAR_SUM ? ↔ Pmt 42300, Inv 47662, Inv 47285 |
| 14 Nov 2025 | Invoice | 47667 | DN#20829-EMPTY | CYL | 1,897.50 | 6,291.93 | T0038 CN_DN_PAIR ✓ ↔ Crd Note 13866 |
| 18 Nov 2025 | Payment | 42300 | TRANSF \| STAT 120 | LPG | -6,746.02 | -454.09 | T0087 NEAR_SUM ? ↔ Inv 47662, Inv 47666, Inv 47285 |
| 21 Nov 2025 | Crd Note | 13926 | DN#20853-EMPTY | CYL | -1,207.50 | -1,661.59 | T0040 CN_DN_PAIR ✓ ↔ Inv 47839 |
| 21 Nov 2025 | Invoice | 47838 | DN#20853 | LPG | 1,156.56 | -505.03 | T0075 EXACT_SUM ✓ ↔ Pmt 42421, Inv 47887 |
| 21 Nov 2025 | Invoice | 47839 | DN#20853-EMPTY | CYL | 1,207.50 | 702.47 | T0040 CN_DN_PAIR ✓ ↔ Crd Note 13926 |
| 25 Nov 2025 | Crd Note | 13938 | DN#21171-EMPTY | CYL | -2,415.00 | -1,712.53 | T0041 CN_DN_PAIR ✓ ↔ Inv 47888 |
| 25 Nov 2025 | Invoice | 47887 | DN#21171 | LPG | 2,313.11 | 600.58 | T0075 EXACT_SUM ✓ ↔ Pmt 42421, Inv 47838 |
| 25 Nov 2025 | Invoice | 47888 | DN#21171-EMPTY | CYL | 2,415.00 | 3,015.58 | T0041 CN_DN_PAIR ✓ ↔ Crd Note 13938 |
| 26 Nov 2025 | Payment | 42421 | TRANSF \| STAT 120 | LPG | -3,469.67 | -454.09 | T0075 EXACT_SUM ✓ ↔ Inv 47887, Inv 47838 |
| 27 Nov 2025 | Crd Note | 13953 | DN#21174-EMPTY | CYL | -1,207.50 | -1,661.59 | T0042 CN_DN_PAIR ✓ ↔ Inv 47942 |
| 27 Nov 2025 | Invoice | 47941 | DN#21174 | LPG | 1,156.56 | -505.03 | T0076 EXACT_SUM ✓ ↔ Pmt 42543, Inv 48130 |
| 27 Nov 2025 | Invoice | 47942 | DN#21174-EMPTY | CYL | 1,207.50 | 702.47 | T0042 CN_DN_PAIR ✓ ↔ Crd Note 13953 |

### December 2025

Opening balance (ERP running): **R702.47**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Dec 2025 | Invoice | 48130 | DN#21401 | LPG | 1,156.56 | 1,859.03 | T0076 EXACT_SUM ✓ ↔ Pmt 42543, Inv 47941 |
| 06 Dec 2025 | Invoice | 48131 | DN#21401-EMPTY | CYL | 1,207.50 | 3,066.53 | T0043 CN_DN_PAIR ? ↔ Crd Note 14023 |
| 08 Dec 2025 | Crd Note | 14023 | DN#21401-EMPTY | CYL | -1,207.50 | 1,859.03 | T0043 CN_DN_PAIR ? ↔ Inv 48131 |
| 08 Dec 2025 | Payment | 42543 | TRANSF \| STAT 121 | LPG | -2,313.12 | -454.09 | T0076 EXACT_SUM ✓ ↔ Inv 48130, Inv 47941 |
| 10 Dec 2025 | Invoice | 48185 | DN#21704 | LPG | 1,162.63 | 708.54 | T0077 EXACT_SINGLE ✓ ↔ Pmt 42611 |
| 10 Dec 2025 | Invoice | 48186 | DN#21704-EMPTY | CYL | 1,207.50 | 1,916.04 | T0044 CN_DN_PAIR ? ↔ Crd Note 14063 |
| 12 Dec 2025 | Crd Note | 14063 | DN#21704-EMPTY | CYL | -1,207.50 | 708.54 | T0044 CN_DN_PAIR ? ↔ Inv 48186 |
| 13 Dec 2025 | Payment | 42611 | TRANSF \| STAT 121 | LPG | -1,162.63 | -454.09 | T0077 EXACT_SINGLE ✓ ↔ Inv 48185 |
| 18 Dec 2025 | Crd Note | 14110 | DN#21714-EMPTY | CYL | -1,897.50 | -2,351.59 | T0045 CN_DN_PAIR ✓ ↔ Inv 48352 |
| 18 Dec 2025 | Invoice | 48351 | DN#21714 | LPG | 1,622.83 | -728.76 | T0078 EXACT_RUN ✓ ↔ Pmt 43067, Inv 48353, Inv 48538, Inv 48646 +2 |
| 18 Dec 2025 | Invoice | 48352 | DN#21714-EMPTY | CYL | 1,897.50 | 1,168.74 | T0045 CN_DN_PAIR ✓ ↔ Crd Note 14110 |
| 18 Dec 2025 | Invoice | 48353 | DN#21713 | LPG | 2,325.25 | 3,493.99 | T0078 EXACT_RUN ✓ ↔ Pmt 43067, Inv 48351, Inv 48538, Inv 48646 +2 |
| 18 Dec 2025 | Invoice | 48354 | DN#21713-EMPTY | CYL | 2,415.00 | 5,908.99 | T0046 CN_DN_PAIR ✓ ↔ Crd Note 14123 |
| 19 Dec 2025 | Crd Note | 14123 | DN#21713-EMPTY | CYL | -2,415.00 | 3,493.99 | T0046 CN_DN_PAIR ✓ ↔ Inv 48354 |
| 30 Dec 2025 | Crd Note | 14183 | DN#20960-EMPTY | CYL | -1,207.50 | 2,286.49 | T0047 CN_DN_PAIR ✓ ↔ Inv 48539 |
| 30 Dec 2025 | Invoice | 48538 | DN#20960 | LPG | 1,162.63 | 3,449.12 | T0078 EXACT_RUN ✓ ↔ Pmt 43067, Inv 48351, Inv 48353, Inv 48646 +2 |
| 30 Dec 2025 | Invoice | 48539 | DN#20960-EMPTY | CYL | 1,207.50 | 4,656.62 | T0047 CN_DN_PAIR ✓ ↔ Crd Note 14183 |

### January 2026

Opening balance (ERP running): **R4,656.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Jan 2026 | Crd Note | 14218 | D/N 21625 | LPG | -2,325.25 | 2,331.37 | T0048 CN_DN_PAIR ✓ ↔ Inv 48645 |
| 07 Jan 2026 | Invoice | 48645 | D/N 21625 | LPG | 2,325.25 | 4,656.62 | T0048 CN_DN_PAIR ✓ ↔ Crd Note 14218 |
| 07 Jan 2026 | Invoice | 48646 | DN12625 | LPG | 1,162.63 | 5,819.25 | T0078 EXACT_RUN ✓ ↔ Pmt 43067, Inv 48351, Inv 48353, Inv 48538 +2 |
| 08 Jan 2026 | Crd Note | 14222 | DN-21625-EMPTY | CYL | -1,207.50 | 4,611.75 | T0049 CN_DN_PAIR ✓ ↔ Inv 48680 |
| 08 Jan 2026 | Invoice | 48680 | DN-21625-EMPTY | CYL | 1,207.50 | 5,819.25 | T0049 CN_DN_PAIR ✓ ↔ Crd Note 14222 |
| 09 Jan 2026 | Crd Note | 14235 | DN-21459 - PMB | LPG | -1,162.63 | 4,656.62 | T0068 CN_AMOUNT_DATE ? ↔ Inv 48722 |
| 09 Jan 2026 | Crd Note | 14240 | DN 21459 | CYL | -1,207.50 | 3,449.12 | T0089 CYL_EXCHANGE ✓ ↔ Crd Note 12597, Crd Note 12883, Inv 44448, Crd Note 13036 +6 |
| 09 Jan 2026 | Invoice | 48693 | DN-21459 - PMB | LPG | 2,325.25 | 5,774.37 | T0078 EXACT_RUN ✓ ↔ Pmt 43067, Inv 48351, Inv 48353, Inv 48538 +2 |
| 09 Jan 2026 | Invoice | 48698 | DN 21459 | CYL | 2,415.00 | 8,189.37 | T0089 CYL_EXCHANGE ✓ ↔ Crd Note 12597, Crd Note 12883, Inv 44448, Crd Note 13036 +6 |
| 09 Jan 2026 | Invoice | 48722 | REV CN#14235 | LPG | 1,162.63 | 9,352.00 | T0068 CN_AMOUNT_DATE ? ↔ Crd Note 14235 |
| 12 Jan 2026 | Crd Note | 14287 | DN-21762-EMPTY | CYL | -2,415.00 | 6,937.00 | T0050 CN_DN_PAIR ✓ ↔ Inv 48731 |
| 12 Jan 2026 | Invoice | 48730 | DN-21762 | LPG | 2,325.25 | 9,262.25 | T0078 EXACT_RUN ✓ ↔ Pmt 43067, Inv 48351, Inv 48353, Inv 48538 +2 |
| 12 Jan 2026 | Invoice | 48731 | DN-21762-EMPTY | CYL | 2,415.00 | 11,677.25 | T0050 CN_DN_PAIR ✓ ↔ Crd Note 14287 |
| 20 Jan 2026 | Payment | 43067 | TRANSF \| STAT 122 | LPG | -10,923.84 | 753.41 | T0078 EXACT_RUN ✓ ↔ Inv 48351, Inv 48353, Inv 48538, Inv 48646 +2 |
| 28 Jan 2026 | Crd Note | 14339 | DN#21215 | LPG | -1,171.09 | -417.68 | T0051 CN_DN_PAIR ✓ ↔ Inv 48971 |
| 28 Jan 2026 | Crd Note | 14340 | DN#21215-EMPTY | CYL | -1,207.50 | -1,625.18 | T0052 CN_DN_PAIR ✓ ↔ Inv 48972 |
| 28 Jan 2026 | Crd Note | 14345 | DN#21214EMPTY HILTON | CYL | -1,207.50 | -2,832.68 | T0053 CN_DN_PAIR ✓ ↔ Inv 48976 |
| 28 Jan 2026 | Crd Note | 14347 | DN#21217-EMPTY | CYL | -2,415.00 | -5,247.68 | T0088 CYL_EXCHANGE ✓ ↔ Inv 48980, Inv 53490 |
| 28 Jan 2026 | Invoice | 48971 | DN#21215 | LPG | 1,171.09 | -4,076.59 | T0051 CN_DN_PAIR ✓ ↔ Crd Note 14339 |
| 28 Jan 2026 | Invoice | 48972 | DN#21215-EMPTY | CYL | 1,207.50 | -2,869.09 | T0052 CN_DN_PAIR ✓ ↔ Crd Note 14340 |
| 28 Jan 2026 | Invoice | 48975 | DN#21214-HILTON | LPG | 1,171.09 | -1,698.00 | T0079 EXACT_MONTH_SUM ✓ ↔ Pmt 43216, Inv 48979 |
| 28 Jan 2026 | Invoice | 48976 | DN#21214EMPTY HILTON | CYL | 1,207.50 | -490.50 | T0053 CN_DN_PAIR ✓ ↔ Crd Note 14345 |
| 28 Jan 2026 | Invoice | 48979 | DN#21217- BULWER ST | LPG | 1,171.09 | 680.59 | T0079 EXACT_MONTH_SUM ✓ ↔ Pmt 43216, Inv 48975 |
| 28 Jan 2026 | Invoice | 48980 | DN#21217-EMPTY | CYL | 1,207.50 | 1,888.09 | T0088 CYL_EXCHANGE ✓ ↔ Crd Note 14347, Inv 53490 |

### February 2026

Opening balance (ERP running): **R1,888.09**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Feb 2026 | Payment | 43216 | TRANSF \| STAT 123 | LPG | -2,342.18 | -454.09 | T0079 EXACT_MONTH_SUM ✓ ↔ Inv 48975, Inv 48979 |
| 05 Feb 2026 | Invoice | 49100 | DN#21524 | LPG | 1,171.09 | 717.00 | T0080 EXACT_MONTH_SUM ✓ ↔ Pmt 43373, Inv 49228, Inv 49259 |
| 05 Feb 2026 | Invoice | 49101 | DN#21524-EMPTY | CYL | 1,207.50 | 1,924.50 | T0054 CN_DN_PAIR ✓ ↔ Crd Note 14383 |
| 06 Feb 2026 | Crd Note | 14383 | DN#21524-EMPTY | CYL | -1,207.50 | 717.00 | T0054 CN_DN_PAIR ✓ ↔ Inv 49101 |
| 13 Feb 2026 | Crd Note | 14425 | DN#21250-EMPTY | CYL | -2,415.00 | -1,698.00 | T0055 CN_DN_PAIR ✓ ↔ Inv 49229 |
| 13 Feb 2026 | Invoice | 49228 | DN#21250 | LPG | 2,368.75 | 670.75 | T0080 EXACT_MONTH_SUM ✓ ↔ Pmt 43373, Inv 49100, Inv 49259 |
| 13 Feb 2026 | Invoice | 49229 | DN#21250-EMPTY | CYL | 2,415.00 | 3,085.75 | T0055 CN_DN_PAIR ✓ ↔ Crd Note 14425 |
| 16 Feb 2026 | Crd Note | 14434 | DN#21544-EMPTY | CYL | -1,897.50 | 1,188.25 | T0056 CN_DN_PAIR ✓ ↔ Inv 49260 |
| 16 Feb 2026 | Invoice | 49259 | DN#21544 | LPG | 1,653.19 | 2,841.44 | T0080 EXACT_MONTH_SUM ✓ ↔ Pmt 43373, Inv 49100, Inv 49228 |
| 16 Feb 2026 | Invoice | 49260 | DN#21544-EMPTY | CYL | 1,897.50 | 4,738.94 | T0056 CN_DN_PAIR ✓ ↔ Crd Note 14434 |
| 18 Feb 2026 | Payment | 43373 | TRANSF \| STAT 123 | LPG | -5,193.03 | -454.09 | T0080 EXACT_MONTH_SUM ✓ ↔ Inv 49100, Inv 49228, Inv 49259 |
| 21 Feb 2026 | Invoice | 49360 | DN-21922-HILTON | LPG | 1,184.37 | 730.28 | T0057 CN_DN_PAIR ? ↔ Crd Note 14472 |
| 21 Feb 2026 | Invoice | 49361 | DN-21922-EMPTY-HIL | LPG | 1,184.37 | 1,914.65 | T0081 EXACT_SUM ✓ ↔ Pmt 43562, Inv 49577, Inv 49397 |
| 23 Feb 2026 | Crd Note | 14472 | DN-21922-EMPTY-HIL | LPG | -1,184.37 | 730.28 | T0057 CN_DN_PAIR ? ↔ Inv 49360 |
| 24 Feb 2026 | Invoice | 49397 | DN#21929 | LPG | 1,653.19 | 2,383.47 | T0081 EXACT_SUM ✓ ↔ Pmt 43562, Inv 49577, Inv 49361 |
| 24 Feb 2026 | Invoice | 49398 | DN#21929-EMPTY | CYL | 1,897.50 | 4,280.97 | T0058 CN_DN_PAIR ✓ ↔ Crd Note 14485 |
| 25 Feb 2026 | Crd Note | 14485 | DN#21929-EMPTY | CYL | -1,897.50 | 2,383.47 | T0058 CN_DN_PAIR ✓ ↔ Inv 49398 |

### March 2026

Opening balance (ERP running): **R2,383.47**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Mar 2026 | Crd Note | 14543 | DN#21814-EMPTY | CYL | -1,207.50 | 1,175.97 | T0059 CN_DN_PAIR ✓ ↔ Inv 49578 |
| 05 Mar 2026 | Invoice | 49577 | DN#21814 | LPG | 1,184.37 | 2,360.34 | T0081 EXACT_SUM ✓ ↔ Pmt 43562, Inv 49397, Inv 49361 |
| 05 Mar 2026 | Invoice | 49578 | DN#21814-EMPTY | CYL | 1,207.50 | 3,567.84 | T0059 CN_DN_PAIR ✓ ↔ Crd Note 14543 |
| 06 Mar 2026 | Payment | 43562 | TRANSF \| STAT 124 | LPG | -4,021.93 | -454.09 | T0081 EXACT_SUM ✓ ↔ Inv 49577, Inv 49397, Inv 49361 |
| 13 Mar 2026 | Invoice | 49733 | DN#22127- HILTON | LPG | 1,193.96 | 739.87 | T0082 EXACT_MONTH_SUM ✓ ↔ Pmt 43752, Inv 49767, Inv 49849 |
| 17 Mar 2026 | Crd Note | 14603 | DN=21969=EMPTY | CYL | -2,415.00 | -1,675.13 | T0060 CN_DN_PAIR ✓ ↔ Inv 49770 |
| 17 Mar 2026 | Invoice | 49767 | DN=21969 | LPG | 2,387.93 | 712.80 | T0082 EXACT_MONTH_SUM ✓ ↔ Pmt 43752, Inv 49733, Inv 49849 |
| 17 Mar 2026 | Invoice | 49770 | DN=21969=EMPTY | CYL | 2,415.00 | 3,127.80 | T0060 CN_DN_PAIR ✓ ↔ Crd Note 14603 |
| 20 Mar 2026 | Crd Note | 14633 | DN-22143-EMPTY | CYL | -1,207.50 | 1,920.30 | T0061 CN_DN_PAIR ✓ ↔ Inv 49850 |
| 20 Mar 2026 | Invoice | 49849 | DN-22143 | LPG | 1,193.96 | 3,114.26 | T0082 EXACT_MONTH_SUM ✓ ↔ Pmt 43752, Inv 49733, Inv 49767 |
| 20 Mar 2026 | Invoice | 49850 | DN-22143-EMPTY | CYL | 1,207.50 | 4,321.76 | T0061 CN_DN_PAIR ✓ ↔ Crd Note 14633 |
| 23 Mar 2026 | Payment | 43752 | TRANSF \| STAT 124 | LPG | -4,775.85 | -454.09 | T0082 EXACT_MONTH_SUM ✓ ↔ Inv 49733, Inv 49767, Inv 49849 |
| 28 Mar 2026 | Invoice | 49971 | DN-22032 | LPG | 1,193.96 | 739.87 | T0083 EXACT_SINGLE ✓ ↔ Pmt 44064 |
| 28 Mar 2026 | Invoice | 49972 | DN-22032-EMPTY | CYL | 1,207.50 | 1,947.37 | T0062 CN_DN_PAIR ? ↔ Crd Note 14678 |
| 30 Mar 2026 | Crd Note | 14678 | DN-22032-EMPTY | CYL | -1,207.50 | 739.87 | T0062 CN_DN_PAIR ? ↔ Inv 49972 |
| 31 Mar 2026 | Crd Note | 14686 | DN-21852 | LPG | -2,387.93 | -1,648.06 | T0063 CN_DN_PAIR ✓ ↔ Inv 50015 |
| 31 Mar 2026 | Crd Note | 14687 | DN-21852-EMPTY | CYL | -2,415.00 | -4,063.06 | T0064 CN_DN_PAIR ✓ ↔ Inv 50016 |
| 31 Mar 2026 | Invoice | 50015 | DN-21852 | LPG | 2,387.93 | -1,675.13 | T0063 CN_DN_PAIR ✓ ↔ Crd Note 14686 |
| 31 Mar 2026 | Invoice | 50016 | DN-21852-EMPTY | CYL | 2,415.00 | 739.87 | T0064 CN_DN_PAIR ✓ ↔ Crd Note 14687 |
| 31 Mar 2026 | Invoice | 50035 | DN-21852 | LPG | 1,193.96 | 1,933.83 | OPEN |

### April 2026

Opening balance (ERP running): **R1,933.83**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 21 Apr 2026 | Payment | 44064 | TRANSF \| STAT 125 | LPG | -1,193.96 | 739.87 | T0083 EXACT_SINGLE ✓ ↔ Inv 49971 |

### July 2026

Opening balance (ERP running): **R739.87**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Jul 2026 | Crd Note | 15164 | DN#22539=EMPTY | CYL | -2,415.00 | -1,675.13 | T0065 CN_DN_PAIR ✓ ↔ Inv 51543 |
| 02 Jul 2026 | Invoice | 51542 | BULWER STREET | LPG | 2,783.99 | 1,108.86 | T0084 EXACT_SINGLE ✓ ↔ Pmt 45199 |
| 02 Jul 2026 | Invoice | 51543 | DN#22539=EMPTY | CYL | 2,415.00 | 3,523.86 | T0065 CN_DN_PAIR ✓ ↔ Crd Note 15164 |
| 15 Jul 2026 | Payment | 45199 | TRANSF \| STAT 128 | LPG | -2,783.99 | 739.87 | T0084 EXACT_SINGLE ✓ ↔ Inv 51542 |

### August 2026

Opening balance (ERP running): **R739.87**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Aug 2026 | Crd Note | 15518 | DN#22891-EMPTY | CYL | -1,207.50 | -467.63 | T0066 CN_DN_PAIR ✓ ↔ Inv 52694 |
| 20 Aug 2026 | Invoice | 52693 | DN#22891 | LPG | 1,312.52 | 844.89 | T0085 EXACT_SUM ✓ ↔ Pmt 46208, Inv 53267 |
| 20 Aug 2026 | Invoice | 52694 | DN#22891-EMPTY | CYL | 1,207.50 | 2,052.39 | T0066 CN_DN_PAIR ✓ ↔ Crd Note 15518 |

### September 2026

Opening balance (ERP running): **R2,052.39**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 Sept 2026 | Payment | 46208 | SPEEDP \| PC-76-35 | LPG | -4,052.53 | -2,000.14 | T0085 EXACT_SUM ✓ ↔ Inv 53267, Inv 52693 |
| 23 Sept 2026 | Invoice | 53267 | — | LPG | 2,240.00 | 239.86 | T0085 EXACT_SUM ✓ ↔ Pmt 46208, Inv 52693 |
| 23 Sept 2026 | Invoice | 53267 | — | OTHER | 500.01 | 739.87 | T0085 EXACT_SUM ✓ ↔ Pmt 46208, Inv 52693 |
| 29 Sept 2026 | Payment | 46333 | TRANSF \| STAT 130 | LPG | -2,995.00 | -2,255.13 | T0086 EXACT_SINGLE ✓ ↔ Inv 53368 |
| 29 Sept 2026 | Invoice | 53368 | — | LPG | 2,995.00 | 739.87 | T0086 EXACT_SINGLE ✓ ↔ Pmt 46333 |

### October 2026

Opening balance (ERP running): **R739.87**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Oct 2026 | Invoice | 53505 | — | LPG | 3,490.00 | 4,229.87 | OPEN |
| 06 Oct 2026 | Invoice | 53490 | 24896 | CYL | 1,207.50 | 5,437.37 | T0088 CYL_EXCHANGE ✓ ↔ Crd Note 14347, Inv 48980 |
| 06 Oct 2026 | Invoice | 53490 | 24896 | LPG | 2,501.00 | 7,938.37 | OPEN |

---

## Ties by rule

| Rule | Confirmed | Probable |
| :--- | ---: | ---: |
| CN_DN_PAIR | 49 | 17 |
| CN_AMOUNT_DATE | 0 | 2 |
| EXACT_RUN | 2 | 0 |
| EXACT_SINGLE | 6 | 0 |
| EXACT_SUM | 7 | 0 |
| EXACT_MONTH_SUM | 3 | 0 |
| NEAR_SUM | 0 | 1 |
| CYL_EXCHANGE | 2 | 0 |

## Probable ties awaiting approval

| Tie | Rule | Documents | Variance (R) |
| :--- | :--- | :--- | ---: |
| T0003 | CN_DN_PAIR | Invoice 41893, Crd Note 12186 | — |
| T0004 | CN_DN_PAIR | Invoice 42018, Crd Note 12204 | — |
| T0008 | CN_DN_PAIR | Invoice 42575, Crd Note 12360 | — |
| T0011 | CN_DN_PAIR | Invoice 42965, Crd Note 12459 | — |
| T0012 | CN_DN_PAIR | Invoice 43134, Crd Note 12516 | — |
| T0013 | CN_DN_PAIR | Invoice 43334, Crd Note 12565 | — |
| T0014 | CN_DN_PAIR | Invoice 43702, Crd Note 12661 | — |
| T0019 | CN_DN_PAIR | Invoice 45351, Crd Note 13135 | — |
| T0020 | CN_DN_PAIR | Invoice 45537, Crd Note 13185 | — |
| T0021 | CN_DN_PAIR | Invoice 45544, Crd Note 13188 | — |
| T0029 | CN_DN_PAIR | Invoice 46655, Crd Note 13561 | — |
| T0030 | CN_DN_PAIR | Invoice 46656, Crd Note 13562 | — |
| T0031 | CN_DN_PAIR | Invoice 46657, Crd Note 13563 | — |
| T0043 | CN_DN_PAIR | Invoice 48131, Crd Note 14023 | — |
| T0044 | CN_DN_PAIR | Invoice 48186, Crd Note 14063 | — |
| T0057 | CN_DN_PAIR | Invoice 49360, Crd Note 14472 | — |
| T0062 | CN_DN_PAIR | Invoice 49972, Crd Note 14678 | — |
| T0067 | CN_AMOUNT_DATE | Invoice 45066, Crd Note 13033 | — |
| T0068 | CN_AMOUNT_DATE | Invoice 48722, Crd Note 14235 | — |
| T0087 | NEAR_SUM | Payment 42300, Invoice 47662, Invoice 47666, Invoice 47285 | -0.36 |

Proof: holds (rebuilt R7,938.37 vs closing R7,938.37; ERP R7,938.37).

