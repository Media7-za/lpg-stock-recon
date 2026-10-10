# Internal ledger: JIMMY'S / INVESCO (JIM001), matcher review
**INTERNAL, not for the customer.** Every transaction in ERP order with the ERP running balance and what matcher v5 did with it · generated 2026-10-10 · 51 confirmed / 6 probable ties · 52 rows open · ERP `CURRENT BALANCE` R122,884.84 · matcher v5 ratified 2026-10-10; probable ties are proposals until approved · **REVIEW ONLY:** ingestCoverage partial

**Status key:** `OPEN` untied · `T0001 EXACT_SINGLE ✓` confirmed tie · `T0001 BATCH_SUM ?` probable tie (needs approval) · `LOCKED` operator-approved lock · `◀ ZERO` ERP running balance is within R0.05 after this line.

---

### May 2022

Opening balance (ERP running): **R60,183.98**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 16 May 2022 | Payment | 44686 | TRANSF \| STAT199 | LPG | -14,941.48 | 45,242.50 | T0001 LOCKED:OPERATOR_RULING [applied_to_bf] ↔ Pmt 38481, Pmt 38846, Pmt 39812 |

### May 2024

Opening balance (ERP running): **R45,242.50**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 May 2024 | Crd Note | 12314 | EMPTIES PRICE FIX | CYL | -1,380.00 | 43,862.50 | OPEN |
| 03 May 2024 | Invoice | 42406 | EMPTIES PRICE FIX | CYL | 2,392.00 | 46,254.50 | OPEN |

### July 2024

Opening balance (ERP running): **R46,254.50**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Jul 2024 | Crd Note | 12313 | INTEREST- JUNE 2024 | OTHER | -1,051.83 | 45,202.67 | OPEN |

### March 2025

Opening balance (ERP running): **R45,202.67**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Mar 2025 | Crd Note | 12003 | DN#10507-EMPTY | CYL | -2,415.00 | 42,787.67 | T0009 CN_DN_PAIR ✓ ↔ Inv 41217 |
| 05 Mar 2025 | Invoice | 41216 | DN#10507 | LPG | 2,948.81 | 45,736.48 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 40063, Inv 41486, Inv 41633, Inv 41799 |
| 05 Mar 2025 | Invoice | 41217 | DN#10507-EMPTY | CYL | 2,415.00 | 48,151.48 | T0009 CN_DN_PAIR ✓ ↔ Crd Note 12003 |
| 14 Mar 2025 | Crd Note | 12072 | DN#4435-EMPTY | CYL | -2,415.00 | 45,736.48 | T0010 CN_DN_PAIR ✓ ↔ Inv 41487 |
| 14 Mar 2025 | Invoice | 41486 | DN#4435 | LPG | 2,948.81 | 48,685.29 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 40063, Inv 41216, Inv 41633, Inv 41799 |
| 14 Mar 2025 | Invoice | 41487 | DN#4435-EMPTY | CYL | 2,415.00 | 51,100.29 | T0010 CN_DN_PAIR ✓ ↔ Crd Note 12072 |
| 20 Mar 2025 | Invoice | 41633 | DN#12963 | LPG | 2,948.81 | 54,049.10 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 40063, Inv 41216, Inv 41486, Inv 41799 |
| 20 Mar 2025 | Invoice | 41634 | DN#12963-EMPTY | CYL | 2,415.00 | 56,464.10 | T0011 CN_DN_PAIR ? ↔ Crd Note 12116 |
| 22 Mar 2025 | Crd Note | 12116 | DN#12963-EMPTY | CYL | -2,415.00 | 54,049.10 | T0011 CN_DN_PAIR ? ↔ Inv 41634 |
| 28 Mar 2025 | Crd Note | 12141 | DN#12984-EMPTY | CYL | -2,415.00 | 51,634.10 | T0012 CN_DN_PAIR ✓ ↔ Inv 41800 |
| 28 Mar 2025 | Invoice | 41799 | DN#12984 | LPG | 2,948.81 | 54,582.91 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 40063, Inv 41216, Inv 41486, Inv 41633 |
| 28 Mar 2025 | Invoice | 41800 | DN#12984-EMPTY | CYL | 2,415.00 | 56,997.91 | T0012 CN_DN_PAIR ✓ ↔ Crd Note 12141 |

### April 2025

Opening balance (ERP running): **R56,997.91**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Apr 2025 | Crd Note | 12178 | DN#4464- EMPTY | CYL | -2,415.00 | 54,582.91 | OPEN |
| 02 Apr 2025 | Invoice | 41926 | DN#4464 | LPG | 4,423.21 | 59,006.12 | OPEN |
| 02 Apr 2025 | Invoice | 41927 | DN#4464- EMPTY | CYL | 3,622.50 | 62,628.62 | OPEN |
| 10 Apr 2025 | Invoice | 42181 | DN#13012 | LPG | 4,325.33 | 66,953.95 | OPEN |
| 17 Apr 2025 | Crd Note | 12300 | DN#4494-EMPTY | CYL | -3,622.50 | 63,331.45 | T0013 CN_DN_PAIR ✓ ↔ Inv 42358 |
| 17 Apr 2025 | Invoice | 42357 | DN#4494 | LPG | 4,325.33 | 67,656.78 | OPEN |
| 17 Apr 2025 | Invoice | 42358 | DN#4494-EMPTY | CYL | 3,622.50 | 71,279.28 | T0013 CN_DN_PAIR ✓ ↔ Crd Note 12300 |
| 25 Apr 2025 | Crd Note | 12349 | DN#13165- EMPTY | CYL | -3,622.50 | 67,656.78 | T0014 CN_DN_PAIR ✓ ↔ Inv 42566 |
| 25 Apr 2025 | Invoice | 42565 | DN#13165 | LPG | 4,325.33 | 71,982.11 | OPEN |
| 25 Apr 2025 | Invoice | 42566 | DN#13165- EMPTY | CYL | 3,622.50 | 75,604.61 | T0014 CN_DN_PAIR ✓ ↔ Crd Note 12349 |
| 30 Apr 2025 | Invoice | 42704 | DN#13120 | LPG | 4,325.33 | 79,929.94 | T0015 CN_DN_PAIR ? ↔ Crd Note 12390 |
| 30 Apr 2025 | Invoice | 42705 | DN#13120-EMPTY | CYL | 3,622.50 | 83,552.44 | T0016 CN_DN_PAIR ? ↔ Crd Note 12391 |

### May 2025

Opening balance (ERP running): **R83,552.44**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 May 2025 | Crd Note | 12390 | DN#13120 | LPG | -4,325.33 | 79,227.11 | T0015 CN_DN_PAIR ? ↔ Inv 42704 |
| 03 May 2025 | Crd Note | 12391 | DN#13120-EMPTY | CYL | -3,622.50 | 75,604.61 | T0016 CN_DN_PAIR ? ↔ Inv 42705 |
| 03 May 2025 | Invoice | 42755 | DN#13120 | LPG | 3,153.89 | 78,758.50 | OPEN |
| 03 May 2025 | Invoice | 42756 | DN#13120-EMPTY | CYL | 2,932.50 | 81,691.00 | OPEN |
| 05 May 2025 | Crd Note | 12408 | DN#13120-EMPTY | CYL | -2,415.00 | 79,276.00 | OPEN |
| 05 May 2025 | Payment | 38481 | TRANSF \| STAT:115 | LPG | -15,816.63 | 63,459.37 | T0001 LOCKED:OPERATOR_RULING [applied_to_bf] ↔ Pmt 44686, Pmt 38846, Pmt 39812 |
| 09 May 2025 | Crd Note | 12453 | DN#13209-EMPTY | CYL | -3,622.50 | 59,836.87 | T0017 CN_DN_PAIR ✓ ↔ Inv 42951 |
| 09 May 2025 | Invoice | 42949 | DN#13209 | LPG | 4,325.33 | 64,162.20 | OPEN |
| 09 May 2025 | Invoice | 42951 | DN#13209-EMPTY | CYL | 3,622.50 | 67,784.70 | T0017 CN_DN_PAIR ✓ ↔ Crd Note 12453 |
| 15 May 2025 | Crd Note | 12488 | DN#13229-EMPTY | CYL | -2,415.00 | 65,369.70 | T0018 CN_DN_PAIR ✓ ↔ Inv 43090 |
| 15 May 2025 | Invoice | 43089 | DN#13229 | LPG | 2,883.56 | 68,253.26 | OPEN |
| 15 May 2025 | Invoice | 43090 | DN#13229-EMPTY | CYL | 2,415.00 | 70,668.26 | T0018 CN_DN_PAIR ✓ ↔ Crd Note 12488 |
| 21 May 2025 | Invoice | 43271 | DN#12254 | LPG | 4,382.95 | 75,051.21 | OPEN |
| 22 May 2025 | Crd Note | 12543 | DN#12254-EMPTY | CYL | -3,622.50 | 71,428.71 | T0019 CN_DN_PAIR ✓ ↔ Inv 43272 |
| 22 May 2025 | Payment | 38846 | TRANSF \| STAT:115 | LPG | -7,337.97 | 64,090.74 | T0001 LOCKED:OPERATOR_RULING [applied_to_bf] ↔ Pmt 44686, Pmt 38481, Pmt 39812 |
| 22 May 2025 | Invoice | 43272 | DN#12254-EMPTY | CYL | 3,622.50 | 67,713.24 | T0019 CN_DN_PAIR ✓ ↔ Crd Note 12543 |
| 29 May 2025 | Crd Note | 12592 | DN#12133-EMPTY | CYL | -3,622.50 | 64,090.74 | OPEN |
| 29 May 2025 | Invoice | 43451 | DN#12133 | LPG | 2,921.97 | 67,012.71 | OPEN |
| 29 May 2025 | Invoice | 43452 | DN#12133-EMPTY | CYL | 2,415.00 | 69,427.71 | OPEN |

### June 2025

Opening balance (ERP running): **R69,427.71**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Jun 2025 | Crd Note | 12634 | DN#12300-EMPTY | CYL | -2,415.00 | 67,012.71 | OPEN |
| 05 Jun 2025 | Invoice | 43628 | DN#12300 | LPG | 4,382.95 | 71,395.66 | OPEN |
| 05 Jun 2025 | Invoice | 43630 | DN#12300-EMPTY | CYL | 3,622.50 | 75,018.16 | OPEN |
| 12 Jun 2025 | Crd Note | 12712 | DN#12384 | LPG | -3,115.05 | 71,903.11 | T0020 CN_DN_PAIR ✓ ↔ Inv 43880 |
| 12 Jun 2025 | Crd Note | 12713 | DN#12384-EMPTY | CYL | -2,932.50 | 68,970.61 | T0021 CN_DN_PAIR ✓ ↔ Inv 43883 |
| 12 Jun 2025 | Payment | 39812 | TRANSF \| STAT:116 | LPG | -20,557.69 | 48,412.92 | T0001 LOCKED:OPERATOR_RULING [applied_to_bf] ↔ Pmt 44686, Pmt 38481, Pmt 38846 |
| 12 Jun 2025 | Invoice | 43880 | DN#12384 | LPG | 3,115.05 | 51,527.97 | T0020 CN_DN_PAIR ✓ ↔ Crd Note 12712 |
| 12 Jun 2025 | Invoice | 43883 | DN#12384-EMPTY | CYL | 2,932.50 | 54,460.47 | T0021 CN_DN_PAIR ✓ ↔ Crd Note 12713 |
| 13 Jun 2025 | Crd Note | 12725 | DN#12517-EMPTY | CYL | -2,932.50 | 51,527.97 | T0022 CN_DN_PAIR ✓ ↔ Inv 43911 |
| 13 Jun 2025 | Invoice | 43910 | DN#12517 | LPG | 3,115.05 | 54,643.02 | OPEN |
| 13 Jun 2025 | Invoice | 43911 | DN#12517-EMPTY | CYL | 2,932.50 | 57,575.52 | T0022 CN_DN_PAIR ✓ ↔ Crd Note 12725 |
| 20 Jun 2025 | Invoice | 44097 | DN#12582 | LPG | 4,272.07 | 61,847.59 | OPEN |
| 20 Jun 2025 | Invoice | 44098 | DN#12582-EMPTY | CYL | 3,622.50 | 65,470.09 | T0023 CN_DN_PAIR ✓ ↔ Crd Note 12775 |
| 21 Jun 2025 | Crd Note | 12775 | DN#12582-EMPTY | CYL | -3,622.50 | 61,847.59 | T0023 CN_DN_PAIR ✓ ↔ Inv 44098 |
| 26 Jun 2025 | Crd Note | 12823 | DN#12429-EMPTY | CYL | -2,415.00 | 59,432.59 | T0024 CN_DN_PAIR ✓ ↔ Inv 44242 |
| 26 Jun 2025 | Invoice | 44241 | DN#12429 | LPG | 2,848.04 | 62,280.63 | OPEN |
| 26 Jun 2025 | Invoice | 44242 | DN#12429-EMPTY | CYL | 2,415.00 | 64,695.63 | T0024 CN_DN_PAIR ✓ ↔ Crd Note 12823 |

### July 2025

Opening balance (ERP running): **R64,695.63**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Jul 2025 | Invoice | 44516 | DN#12654 | LPG | 3,115.05 | 67,810.68 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 40746, Inv 44707, Inv 44933, Inv 45091 +1 |
| 04 Jul 2025 | Invoice | 44517 | DN#12654-EMPTY | CYL | 2,932.50 | 70,743.18 | T0025 CN_DN_PAIR ✓ ↔ Crd Note 12900 |
| 05 Jul 2025 | Crd Note | 12900 | DN#12654-EMPTY | CYL | -2,932.50 | 67,810.68 | T0025 CN_DN_PAIR ✓ ↔ Inv 44517 |
| 10 Jul 2025 | Invoice | 44707 | DN#12187 | LPG | 4,200.69 | 72,011.37 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 40746, Inv 44516, Inv 44933, Inv 45091 +1 |
| 14 Jul 2025 | Payment | 40063 | TRANSF \| STAT:117 | LPG | -11,795.24 | 60,216.13 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Inv 41216, Inv 41486, Inv 41633, Inv 41799 |
| 18 Jul 2025 | Crd Note | 13010 | DN#12714-EMPTY | CYL | -3,622.50 | 56,593.63 | T0026 CN_DN_PAIR ✓ ↔ Inv 44934 |
| 18 Jul 2025 | Invoice | 44933 | DN#12714 | LPG | 4,200.69 | 60,794.32 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 40746, Inv 44516, Inv 44707, Inv 45091 +1 |
| 18 Jul 2025 | Invoice | 44934 | DN#12714-EMPTY | CYL | 3,622.50 | 64,416.82 | T0026 CN_DN_PAIR ✓ ↔ Crd Note 13010 |
| 24 Jul 2025 | Crd Note | 13047 | D/N 12726 | CYL | -3,622.50 | 60,794.32 | OPEN |
| 24 Jul 2025 | Invoice | 45091 | D/N 12726 | LPG | 2,800.46 | 63,594.78 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 40746, Inv 44516, Inv 44707, Inv 44933 +1 |
| 24 Jul 2025 | Invoice | 45096 | D/N 12726 | CYL | 2,415.00 | 66,009.78 | OPEN |
| 26 Jul 2025 | Crd Note | 13061 | DN 20012. | CYL | -517.50 | 65,492.28 | T0027 CN_DN_PAIR ✓ ↔ Inv 45165 |
| 26 Jul 2025 | Invoice | 45162 | D/N 20012 | LPG | 262.55 | 65,754.83 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 40746, Inv 44516, Inv 44707, Inv 44933 +1 |
| 26 Jul 2025 | Invoice | 45165 | DN 20012. | CYL | 517.50 | 66,272.33 | T0027 CN_DN_PAIR ✓ ↔ Crd Note 13061 |

### August 2025

Opening balance (ERP running): **R66,272.33**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Aug 2025 | Invoice | 45323 | DN#20132 | LPG | 4,200.69 | 70,473.02 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 41664, Inv 45498, Inv 45671, Inv 45831 +1 |
| 01 Aug 2025 | Invoice | 45324 | DN#20132-EMPTY | CYL | 3,622.50 | 74,095.52 | OPEN |
| 03 Aug 2025 | Crd Note | 13118 | DN#20132-EMPTY | CYL | -2,415.00 | 71,680.52 | OPEN |
| 08 Aug 2025 | Crd Note | 13171 | DN#20073-EMPTY | CYL | -2,415.00 | 69,265.52 | T0028 CN_DN_PAIR ✓ ↔ Inv 45499 |
| 08 Aug 2025 | Invoice | 45498 | DN#20073 | LPG | 2,800.46 | 72,065.98 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 41664, Inv 45323, Inv 45671, Inv 45831 +1 |
| 08 Aug 2025 | Invoice | 45499 | DN#20073-EMPTY | CYL | 2,415.00 | 74,480.98 | T0028 CN_DN_PAIR ✓ ↔ Crd Note 13171 |
| 15 Aug 2025 | Invoice | 45671 | DN#20511 | LPG | 4,114.57 | 78,595.55 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 41664, Inv 45323, Inv 45498, Inv 45831 +1 |
| 15 Aug 2025 | Invoice | 45672 | DN#20511-EMPTY | CYL | 3,622.50 | 82,218.05 | OPEN |
| 16 Aug 2025 | Crd Note | 13239 | DN#20511-EMPTY | CYL | -1,207.50 | 81,010.55 | OPEN |
| 22 Aug 2025 | Crd Note | 13288 | DN#20536-EMPTY | CYL | -3,622.50 | 77,388.05 | T0029 CN_DN_PAIR ✓ ↔ Inv 45832 |
| 22 Aug 2025 | Payment | 40746 | TRANSF \| STAT 117 | LPG | -14,579.44 | 62,808.61 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Inv 44516, Inv 44707, Inv 44933, Inv 45091 +1 |
| 22 Aug 2025 | Invoice | 45831 | DN#20536 | LPG | 4,114.57 | 66,923.18 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 41664, Inv 45323, Inv 45498, Inv 45671 +1 |
| 22 Aug 2025 | Invoice | 45832 | DN#20536-EMPTY | CYL | 3,622.50 | 70,545.68 | T0029 CN_DN_PAIR ✓ ↔ Crd Note 13288 |
| 29 Aug 2025 | Crd Note | 13333 | D/N20346 | CYL | -1,207.50 | 69,338.18 | T0030 CN_DN_PAIR ✓ ↔ Inv 45993 |
| 29 Aug 2025 | Invoice | 45992 | D/N 20346 | LPG | 1,371.53 | 70,709.71 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 41664, Inv 45323, Inv 45498, Inv 45671 +1 |
| 29 Aug 2025 | Invoice | 45993 | D/N20346 | CYL | 1,207.50 | 71,917.21 | T0030 CN_DN_PAIR ✓ ↔ Crd Note 13333 |

### September 2025

Opening balance (ERP running): **R71,917.21**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Sept 2025 | Crd Note | 13375 | DN-20574 | CYL | -3,622.50 | 68,294.71 | T0031 CN_DN_PAIR ✓ ↔ Inv 46121 |
| 04 Sept 2025 | Invoice | 46121 | DN-20574 | CYL | 3,622.50 | 71,917.21 | T0031 CN_DN_PAIR ✓ ↔ Crd Note 13375 |
| 04 Sept 2025 | Invoice | 46124 | DN:20574 | LPG | 4,114.57 | 76,031.78 | T0005 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 42134, Inv 46308, Inv 46525, Inv 46686 |
| 11 Sept 2025 | Invoice | 46308 | DN#20239 | LPG | 3,948.56 | 79,980.34 | T0005 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 42134, Inv 46124, Inv 46525, Inv 46686 |
| 11 Sept 2025 | Invoice | 46309 | DN#20239-EMPTY | CYL | 3,622.50 | 83,602.84 | T0032 CN_DN_PAIR ✓ ↔ Crd Note 13450 |
| 12 Sept 2025 | Crd Note | 13450 | DN#20239-EMPTY | CYL | -3,622.50 | 79,980.34 | T0032 CN_DN_PAIR ✓ ↔ Inv 46309 |
| 19 Sept 2025 | Invoice | 46525 | DN#21048 | LPG | 2,632.37 | 82,612.71 | T0005 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 42134, Inv 46124, Inv 46308, Inv 46686 |
| 19 Sept 2025 | Invoice | 46526 | DN#21048-EMPTY | CYL | 2,415.00 | 85,027.71 | OPEN |
| 22 Sept 2025 | Crd Note | 13519 | DN#21048-EMPTY | CYL | -4,830.00 | 80,197.71 | OPEN |
| 26 Sept 2025 | Crd Note | 13554 | DN#21072-EMPTY | CYL | -2,415.00 | 77,782.71 | T0033 CN_DN_PAIR ✓ ↔ Inv 46687 |
| 26 Sept 2025 | Invoice | 46686 | DN#21072 | LPG | 2,632.37 | 80,415.08 | T0005 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 42134, Inv 46124, Inv 46308, Inv 46525 |
| 26 Sept 2025 | Invoice | 46687 | DN#21072-EMPTY | CYL | 2,415.00 | 82,830.08 | T0033 CN_DN_PAIR ✓ ↔ Crd Note 13554 |

### October 2025

Opening balance (ERP running): **R82,830.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Oct 2025 | Crd Note | 13607 | DN#21093-EMPTY | CYL | -3,622.50 | 79,207.58 | T0034 CN_DN_PAIR ✓ ↔ Inv 46860 |
| 03 Oct 2025 | Invoice | 46859 | DN#21093 | LPG | 3,948.56 | 83,156.14 | T0006 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 42788, Inv 46990, Inv 47148, Inv 47292 |
| 03 Oct 2025 | Invoice | 46860 | DN#21093-EMPTY | CYL | 3,622.50 | 86,778.64 | T0034 CN_DN_PAIR ✓ ↔ Crd Note 13607 |
| 09 Oct 2025 | Crd Note | 13647 | DN#20608-EMPTY | CYL | -2,415.00 | 84,363.64 | OPEN |
| 09 Oct 2025 | Invoice | 46990 | DN#20608 | LPG | 3,948.56 | 88,312.20 | T0006 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 42788, Inv 46859, Inv 47148, Inv 47292 |
| 09 Oct 2025 | Invoice | 46991 | DN#20608-EMPTY | CYL | 3,622.50 | 91,934.70 | T0057 CYL_EXCHANGE ✓ ↔ Crd Note 13705 |
| 14 Oct 2025 | Payment | 41664 | TRANSF \| STAT 119 | LPG | -16,601.81 | 75,332.89 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Inv 45323, Inv 45498, Inv 45671, Inv 45831 +1 |
| 17 Oct 2025 | Crd Note | 13705 | DN#20734-EMPTY | CYL | -3,622.50 | 71,710.39 | T0057 CYL_EXCHANGE ✓ ↔ Inv 46991 |
| 17 Oct 2025 | Invoice | 47148 | DN#20734 | LPG | 2,632.37 | 74,342.76 | T0006 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 42788, Inv 46859, Inv 46990, Inv 47292 |
| 17 Oct 2025 | Invoice | 47157 | DN#20734-EMPTY | CYL | 2,415.00 | 76,757.76 | T0056 CYL_EXCHANGE ✓ ↔ Crd Note 13828, Inv 47572, Crd Note 13870 |
| 24 Oct 2025 | Crd Note | 13745 | DN#21125-EMPTY | CYL | -2,415.00 | 74,342.76 | T0035 CN_DN_PAIR ✓ ↔ Inv 47293 |
| 24 Oct 2025 | Invoice | 47292 | DN#21125 | LPG | 2,632.37 | 76,975.13 | T0006 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 42788, Inv 46859, Inv 46990, Inv 47148 |
| 24 Oct 2025 | Invoice | 47293 | DN#21125-EMPTY | CYL | 2,415.00 | 79,390.13 | T0035 CN_DN_PAIR ✓ ↔ Crd Note 13745 |

### November 2025

Opening balance (ERP running): **R79,390.13**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Nov 2025 | Invoice | 47464 | DN#21141 | LPG | 3,948.56 | 83,338.69 | T0007 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 43199, Inv 47571, Inv 47670, Inv 47848 +1 |
| 01 Nov 2025 | Invoice | 47465 | DN#21141-EMPTY | CYL | 3,622.50 | 86,961.19 | T0036 CN_DN_PAIR ? ↔ Crd Note 13804 |
| 03 Nov 2025 | Crd Note | 13804 | DN#21141-EMPTY | CYL | -3,622.50 | 83,338.69 | T0036 CN_DN_PAIR ? ↔ Inv 47465 |
| 06 Nov 2025 | Payment | 42134 | TRANSF \| STAT 120 | LPG | -13,327.87 | 70,010.82 | T0005 LOCKED:OPERATOR_RULING [exact] ↔ Inv 46124, Inv 46308, Inv 46525, Inv 46686 |
| 08 Nov 2025 | Crd Note | 13828 | DN#21149-EMPTY | CYL | -3,622.50 | 66,388.32 | T0056 CYL_EXCHANGE ✓ ↔ Inv 47157, Inv 47572, Crd Note 13870 |
| 08 Nov 2025 | Invoice | 47571 | DN#21149 | LPG | 2,584.37 | 68,972.69 | T0007 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 43199, Inv 47464, Inv 47670, Inv 47848 +1 |
| 08 Nov 2025 | Invoice | 47572 | DN#21149-EMPTY | CYL | 2,415.00 | 71,387.69 | T0056 CYL_EXCHANGE ✓ ↔ Inv 47157, Crd Note 13828, Crd Note 13870 |
| 14 Nov 2025 | Crd Note | 13870 | DN#20833-EMPTY | CYL | -1,207.50 | 70,180.19 | T0056 CYL_EXCHANGE ✓ ↔ Inv 47157, Crd Note 13828, Inv 47572 |
| 14 Nov 2025 | Invoice | 47670 | DN#20833 | LPG | 2,584.37 | 72,764.56 | T0007 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 43199, Inv 47464, Inv 47571, Inv 47848 +1 |
| 14 Nov 2025 | Invoice | 47671 | DN#20833-EMPTY | CYL | 2,415.00 | 75,179.56 | T0055 CYL_EXCHANGE ✓ ↔ Crd Note 13925, Inv 47849 |
| 21 Nov 2025 | Crd Note | 13925 | DN-20857 EMPTY | CYL | -3,622.50 | 71,557.06 | T0055 CYL_EXCHANGE ✓ ↔ Inv 47671, Inv 47849 |
| 21 Nov 2025 | Invoice | 47848 | DN-20857 | LPG | 3,876.56 | 75,433.62 | T0007 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 43199, Inv 47464, Inv 47571, Inv 47670 +1 |
| 21 Nov 2025 | Invoice | 47849 | DN-20857 EMPTY | CYL | 1,207.50 | 76,641.12 | T0055 CYL_EXCHANGE ✓ ↔ Inv 47671, Crd Note 13925 |
| 28 Nov 2025 | Invoice | 47983 | DN#20689 | LPG | 2,584.37 | 79,225.49 | T0007 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 43199, Inv 47464, Inv 47571, Inv 47670 +1 |
| 28 Nov 2025 | Invoice | 47984 | DN#20689-EMPTY | CYL | 1,207.50 | 80,432.99 | T0054 CYL_EXCHANGE ✓ ↔ Crd Note 14008, Inv 48099, Crd Note 14066, Inv 48245 +8 |

### December 2025

Opening balance (ERP running): **R80,432.99**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Dec 2025 | Crd Note | 14008 | DN#20894-EMPTY | CYL | -2,415.00 | 78,017.99 | T0054 CYL_EXCHANGE ✓ ↔ Inv 47984, Inv 48099, Crd Note 14066, Inv 48245 +8 |
| 04 Dec 2025 | Invoice | 48098 | DN#20894 | LPG | 3,876.56 | 81,894.55 | T0008 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 44555, Inv 48244, Inv 48391, Inv 48487 |
| 04 Dec 2025 | Invoice | 48099 | DN#20894-EMPTY | CYL | 3,622.50 | 85,517.05 | T0054 CYL_EXCHANGE ✓ ↔ Inv 47984, Crd Note 14008, Crd Note 14066, Inv 48245 +8 |
| 12 Dec 2025 | Crd Note | 14066 | DN#20920-EMPTY | CYL | -3,622.50 | 81,894.55 | T0054 CYL_EXCHANGE ✓ ↔ Inv 47984, Crd Note 14008, Inv 48099, Inv 48245 +8 |
| 12 Dec 2025 | Invoice | 48244 | DN#20920 | LPG | 2,596.52 | 84,491.07 | T0008 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 44555, Inv 48098, Inv 48391, Inv 48487 |
| 12 Dec 2025 | Invoice | 48245 | DN#20920-EMPTY | CYL | 2,415.00 | 86,906.07 | T0054 CYL_EXCHANGE ✓ ↔ Inv 47984, Crd Note 14008, Inv 48099, Crd Note 14066 +8 |
| 19 Dec 2025 | Invoice | 48391 | DN#21727 | LPG | 3,894.77 | 90,800.84 | T0008 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 44555, Inv 48098, Inv 48244, Inv 48487 |
| 19 Dec 2025 | Invoice | 48392 | DN#21727-EMPTY | CYL | 3,622.50 | 94,423.34 | T0037 CN_DN_PAIR ✓ ↔ Crd Note 14131 |
| 20 Dec 2025 | Crd Note | 14131 | DN#21727-EMPTY | CYL | -3,622.50 | 90,800.84 | T0037 CN_DN_PAIR ✓ ↔ Inv 48392 |
| 24 Dec 2025 | Crd Note | 14159 | DN-21735-EMPTY | CYL | -1,207.50 | 89,593.34 | T0038 CN_DN_PAIR ✓ ↔ Inv 48488 |
| 24 Dec 2025 | Invoice | 48487 | DN-21735 | LPG | 1,298.26 | 90,891.60 | T0008 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 44555, Inv 48098, Inv 48244, Inv 48391 |
| 24 Dec 2025 | Invoice | 48488 | DN-21735-EMPTY | CYL | 1,207.50 | 92,099.10 | T0038 CN_DN_PAIR ✓ ↔ Crd Note 14159 |
| 29 Dec 2025 | Payment | 42788 | TRANSF \| STAT 121 | LPG | -13,161.86 | 78,937.24 | T0006 LOCKED:OPERATOR_RULING [exact] ↔ Inv 46859, Inv 46990, Inv 47148, Inv 47292 |
| 31 Dec 2025 | Crd Note | 14198 | DN#21443 | LPG | -3,894.77 | 75,042.47 | T0039 CN_DN_PAIR ✓ ↔ Inv 48578 |
| 31 Dec 2025 | Crd Note | 14199 | DN#21443-EMPTY | CYL | -3,622.50 | 71,419.97 | T0040 CN_DN_PAIR ✓ ↔ Inv 48579 |
| 31 Dec 2025 | Invoice | 48578 | DN#21443 | LPG | 3,894.77 | 75,314.74 | T0039 CN_DN_PAIR ✓ ↔ Crd Note 14198 |
| 31 Dec 2025 | Invoice | 48579 | DN#21443-EMPTY | CYL | 3,622.50 | 78,937.24 | T0040 CN_DN_PAIR ✓ ↔ Crd Note 14199 |

### January 2026

Opening balance (ERP running): **R78,937.24**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Jan 2026 | Crd Note | 14259 | DN#21443-EMPTY | CYL | -2,415.00 | 76,522.24 | T0054 CYL_EXCHANGE ✓ ↔ Inv 47984, Crd Note 14008, Inv 48099, Crd Note 14066 +8 |
| 01 Jan 2026 | Invoice | 48599 | DN#21443 | LPG | 3,894.77 | 80,417.01 | OPEN |
| 01 Jan 2026 | Invoice | 48600 | DN#21443-EMPTY | CYL | 3,622.50 | 84,039.51 | T0054 CYL_EXCHANGE ✓ ↔ Inv 47984, Crd Note 14008, Inv 48099, Crd Note 14066 +8 |
| 03 Jan 2026 | Crd Note | 14201 | DN#21443 | LPG | -2,596.52 | 81,442.99 | T0052 CN_AMOUNT_DATE ? ↔ Inv 48776 |
| 03 Jan 2026 | Invoice | 48776 | REV CN#14201 | LPG | 2,596.52 | 84,039.51 | T0052 CN_AMOUNT_DATE ? ↔ Crd Note 14201 |
| 09 Jan 2026 | Crd Note | 14239 | DN-21626 | CYL | -4,830.00 | 79,209.51 | T0054 CYL_EXCHANGE ✓ ↔ Inv 47984, Crd Note 14008, Inv 48099, Crd Note 14066 +8 |
| 09 Jan 2026 | Invoice | 48701 | DN-21626 | LPG | 3,894.77 | 83,104.28 | OPEN |
| 09 Jan 2026 | Invoice | 48702 | DN-21626 | CYL | 3,622.50 | 86,726.78 | T0054 CYL_EXCHANGE ✓ ↔ Inv 47984, Crd Note 14008, Inv 48099, Crd Note 14066 +8 |
| 17 Jan 2026 | Invoice | 48828 | DN~21645 | LPG | 3,920.13 | 90,646.91 | OPEN |
| 17 Jan 2026 | Invoice | 48829 | DN~21645~EMPTY | CYL | 3,622.50 | 94,269.41 | T0054 CYL_EXCHANGE ✓ ↔ Inv 47984, Crd Note 14008, Inv 48099, Crd Note 14066 +8 |
| 22 Jan 2026 | Crd Note | 14313 | DN~21645~EMPTY | CYL | -2,415.00 | 91,854.41 | T0054 CYL_EXCHANGE ✓ ↔ Inv 47984, Crd Note 14008, Inv 48099, Crd Note 14066 +8 |
| 28 Jan 2026 | Invoice | 48994 | DN#21220 | LPG | 2,613.42 | 94,467.83 | OPEN |
| 28 Jan 2026 | Invoice | 48995 | DN#21220-EMPTY | CYL | 2,415.00 | 96,882.83 | T0054 CYL_EXCHANGE ✓ ↔ Inv 47984, Crd Note 14008, Inv 48099, Crd Note 14066 +8 |
| 29 Jan 2026 | Crd Note | 14352 | DN#21220-EMPTY | CYL | -4,830.00 | 92,052.83 | T0054 CYL_EXCHANGE ✓ ↔ Inv 47984, Crd Note 14008, Inv 48099, Crd Note 14066 +8 |

### February 2026

Opening balance (ERP running): **R92,052.83**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Feb 2026 | Payment | 43199 | TRANSF \| STAT 123 | LPG | -15,578.23 | 76,474.60 | T0007 LOCKED:OPERATOR_RULING [exact] ↔ Inv 47464, Inv 47571, Inv 47670, Inv 47848 +1 |
| 06 Feb 2026 | Crd Note | 14389 | DN#21526-EMPTY | CYL | -3,622.50 | 72,852.10 | T0041 CN_DN_PAIR ✓ ↔ Inv 49127 |
| 06 Feb 2026 | Invoice | 49126 | DN#21526 | LPG | 3,959.98 | 76,812.08 | OPEN |
| 06 Feb 2026 | Invoice | 49127 | DN#21526-EMPTY | CYL | 3,622.50 | 80,434.58 | T0041 CN_DN_PAIR ✓ ↔ Crd Note 14389 |
| 13 Feb 2026 | Invoice | 49242 | DN#21254 | LPG | 2,639.99 | 83,074.57 | OPEN |
| 18 Feb 2026 | Crd Note | 14438 | DN/21261-EMPTY | CYL | -2,415.00 | 80,659.57 | T0053 CYL_EXCHANGE ✓ ↔ Inv 49316, Crd Note 14525, Inv 49541, Crd Note 14694 +3 |
| 18 Feb 2026 | Invoice | 49315 | DN/21261 | LPG | 3,959.98 | 84,619.55 | OPEN |
| 18 Feb 2026 | Invoice | 49316 | DN/21261-EMPTY | CYL | 3,622.50 | 88,242.05 | T0053 CYL_EXCHANGE ✓ ↔ Crd Note 14438, Crd Note 14525, Inv 49541, Crd Note 14694 +3 |

### March 2026

Opening balance (ERP running): **R88,242.05**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Mar 2026 | Invoice | 49530 | DN=21810 | LPG | 3,959.98 | 92,202.03 | T0042 CN_DN_PAIR ✓ ↔ Crd Note 14526 |
| 03 Mar 2026 | Invoice | 49531 | DN=21810-EMPTY | CYL | 3,622.50 | 95,824.53 | T0043 CN_DN_PAIR ✓ ↔ Crd Note 14527 |
| 04 Mar 2026 | Crd Note | 14525 | DN#22016-EMPTY | CYL | -2,415.00 | 93,409.53 | T0053 CYL_EXCHANGE ✓ ↔ Crd Note 14438, Inv 49316, Inv 49541, Crd Note 14694 +3 |
| 04 Mar 2026 | Crd Note | 14526 | DN=21810 | LPG | -3,959.98 | 89,449.55 | T0042 CN_DN_PAIR ✓ ↔ Inv 49530 |
| 04 Mar 2026 | Crd Note | 14527 | DN=21810-EMPTY | CYL | -3,622.50 | 85,827.05 | T0043 CN_DN_PAIR ✓ ↔ Inv 49531 |
| 04 Mar 2026 | Invoice | 49540 | DN#22016 | LPG | 3,959.98 | 89,787.03 | OPEN |
| 04 Mar 2026 | Invoice | 49541 | DN#22016-EMPTY | CYL | 3,622.50 | 93,409.53 | T0053 CYL_EXCHANGE ✓ ↔ Crd Note 14438, Inv 49316, Crd Note 14525, Crd Note 14694 +3 |
| 13 Mar 2026 | Invoice | 49727 | DN#21964 | LPG | 3,988.79 | 97,398.32 | OPEN |
| 13 Mar 2026 | Invoice | 49728 | DN#21964-EMPTY | CYL | 3,622.50 | 101,020.82 | T0044 CN_DN_PAIR ✓ ↔ Crd Note 14591 |
| 14 Mar 2026 | Crd Note | 14591 | DN#21964-EMPTY | CYL | -3,622.50 | 97,398.32 | T0044 CN_DN_PAIR ✓ ↔ Inv 49728 |
| 20 Mar 2026 | Crd Note | 14630 | DN-21838-EMPTY | CYL | -3,622.50 | 93,775.82 | T0045 CN_DN_PAIR ✓ ↔ Inv 49843 |
| 20 Mar 2026 | Invoice | 49842 | DN-21838 | LPG | 3,988.79 | 97,764.61 | OPEN |
| 20 Mar 2026 | Invoice | 49843 | DN-21838-EMPTY | CYL | 3,622.50 | 101,387.11 | T0045 CN_DN_PAIR ✓ ↔ Crd Note 14630 |

### April 2026

Opening balance (ERP running): **R101,387.11**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Apr 2026 | Crd Note | 14694 | DN-21855-EMPTY | CYL | -4,830.00 | 96,557.11 | T0053 CYL_EXCHANGE ✓ ↔ Crd Note 14438, Inv 49316, Crd Note 14525, Inv 49541 +3 |
| 01 Apr 2026 | Invoice | 50042 | DN-21855 | LPG | 3,988.79 | 100,545.90 | OPEN |
| 01 Apr 2026 | Invoice | 50043 | DN-21855-EMPTY | CYL | 3,622.50 | 104,168.40 | T0053 CYL_EXCHANGE ✓ ↔ Crd Note 14438, Inv 49316, Crd Note 14525, Inv 49541 +3 |
| 09 Apr 2026 | Crd Note | 14731 | DN-22157-EMPTY | CYL | -3,622.50 | 100,545.90 | T0046 CN_DN_PAIR ✓ ↔ Inv 50162 |
| 09 Apr 2026 | Invoice | 50161 | DN-22157 | LPG | 4,420.80 | 104,966.70 | OPEN |
| 09 Apr 2026 | Invoice | 50162 | DN-22157-EMPTY | CYL | 3,622.50 | 108,589.20 | T0046 CN_DN_PAIR ✓ ↔ Crd Note 14731 |
| 18 Apr 2026 | Invoice | 50290 | DN-21329 | LPG | 2,947.20 | 111,536.40 | OPEN |
| 18 Apr 2026 | Invoice | 50291 | DN-21329-EMPTY | CYL | 2,415.00 | 113,951.40 | T0053 CYL_EXCHANGE ✓ ↔ Crd Note 14438, Inv 49316, Crd Note 14525, Inv 49541 +3 |
| 20 Apr 2026 | Crd Note | 14779 | DN-21329-EMPTY | CYL | -3,622.50 | 110,328.90 | T0053 CYL_EXCHANGE ✓ ↔ Crd Note 14438, Inv 49316, Crd Note 14525, Inv 49541 +3 |
| 24 Apr 2026 | Crd Note | 14878 | DN-21348-EMPTY | CYL | -2,415.00 | 107,913.90 | T0047 CN_DN_PAIR ✓ ↔ Inv 50372 |
| 24 Apr 2026 | Invoice | 50371 | DN-21348 | LPG | 2,947.20 | 110,861.10 | OPEN |
| 24 Apr 2026 | Invoice | 50372 | DN-21348-EMPTY | CYL | 2,415.00 | 113,276.10 | T0047 CN_DN_PAIR ✓ ↔ Crd Note 14878 |
| 30 Apr 2026 | Crd Note | 14835 | DN-2213-EMPTY | CYL | -3,622.50 | 109,653.60 | T0048 CN_DN_PAIR ✓ ↔ Inv 50469 |
| 30 Apr 2026 | Invoice | 50468 | DN-22213 | LPG | 4,420.80 | 114,074.40 | OPEN |
| 30 Apr 2026 | Invoice | 50469 | DN-2213-EMPTY | CYL | 3,622.50 | 117,696.90 | T0048 CN_DN_PAIR ✓ ↔ Crd Note 14835 |

### May 2026

Opening balance (ERP running): **R117,696.90**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 May 2026 | Crd Note | 14877 | DN#22378-EMPTY | CYL | -2,415.00 | 115,281.90 | T0049 CN_DN_PAIR ✓ ↔ Inv 50595 |
| 08 May 2026 | Invoice | 50594 | DN#22378 | LPG | 3,370.81 | 118,652.71 | OPEN |
| 08 May 2026 | Invoice | 50595 | DN#22378-EMPTY | CYL | 2,415.00 | 121,067.71 | T0049 CN_DN_PAIR ✓ ↔ Crd Note 14877 |
| 16 May 2026 | Invoice | 50712 | DN#22718 | LPG | 3,370.81 | 124,438.52 | OPEN |
| 16 May 2026 | Invoice | 50713 | DN#22718-EMPTY | CYL | 2,415.00 | 126,853.52 | T0050 CN_DN_PAIR ? ↔ Crd Note 14924 |
| 19 May 2026 | Crd Note | 14924 | DN#22718-EMPTY | CYL | -2,415.00 | 124,438.52 | T0050 CN_DN_PAIR ? ↔ Inv 50713 |
| 21 May 2026 | Crd Note | 14940 | DN#22394-EMPTY | CYL | -3,622.50 | 120,816.02 | T0051 CN_DN_PAIR ✓ ↔ Inv 50811 |
| 21 May 2026 | Invoice | 50810 | DN#22394 | LPG | 5,056.22 | 125,872.24 | OPEN |
| 21 May 2026 | Invoice | 50811 | DN#22394-EMPTY | CYL | 3,622.50 | 129,494.74 | T0051 CN_DN_PAIR ✓ ↔ Crd Note 14940 |
| 28 May 2026 | Invoice | 50920 | DN#22763 | LPG | 5,056.22 | 134,550.96 | OPEN |

### June 2026

Opening balance (ERP running): **R134,550.96**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Jun 2026 | Payment | 44555 | TRANSF \| STAT 127 | LPG | -11,666.12 | 122,884.84 | T0008 LOCKED:OPERATOR_RULING [exact] ↔ Inv 48098, Inv 48244, Inv 48391, Inv 48487 |

---

## Ties by rule

| Rule | Confirmed | Probable |
| :--- | ---: | ---: |
| LOCKED | 8 | 0 |
| CN_DN_PAIR | 38 | 5 |
| CN_AMOUNT_DATE | 0 | 1 |
| CYL_EXCHANGE | 5 | 0 |

## Probable ties awaiting approval

| Tie | Rule | Documents | Variance (R) |
| :--- | :--- | :--- | ---: |
| T0011 | CN_DN_PAIR | Invoice 41634, Crd Note 12116 | — |
| T0015 | CN_DN_PAIR | Invoice 42704, Crd Note 12390 | — |
| T0016 | CN_DN_PAIR | Invoice 42705, Crd Note 12391 | — |
| T0036 | CN_DN_PAIR | Invoice 47465, Crd Note 13804 | — |
| T0050 | CN_DN_PAIR | Invoice 50713, Crd Note 14924 | — |
| T0052 | CN_AMOUNT_DATE | Invoice 48776, Crd Note 14201 | — |

Proof: holds (rebuilt R122,884.84 vs closing R122,884.84; ERP R122,884.84).

