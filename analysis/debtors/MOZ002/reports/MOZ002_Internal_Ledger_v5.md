# Internal ledger: MOZAMBIK (MOZ002), matcher review
**INTERNAL, not for the customer.** Every transaction in ERP order with the ERP running balance and what matcher v5 did with it · generated 2026-10-09 · 105 confirmed / 0 probable ties · 2 rows open · ERP `CURRENT BALANCE` R1,562.67 · PROPOSED — NOT RATIFIED

**Status key:** `OPEN` untied · `T0001 EXACT_SINGLE ✓` confirmed tie · `T0001 BATCH_SUM ?` probable tie (needs approval) · `LOCKED` operator-approved lock · `◀ ZERO` ERP running balance is within R0.05 after this line.

**ERP balance returns to ~R0.00** after: 15 Mar 2025 (Inv 41504, line 5, R0.00); 17 Mar 2025 (CN 12080, line 9, R0.00); 20 Mar 2025 (Pmt 37590, line 14, R0.00); 16 Oct 2025 (Pmt 41857, line 119, R-0.01); 23 Oct 2025 (Pmt 41946, line 123, R-0.01); 06 Nov 2025 (Pmt 42137, line 127, R-0.01); 24 Dec 2025 (Pmt 42769, line 147, R-0.01); 22 Jan 2026 (Pmt 43074, line 155, R-0.01); 05 Feb 2026 (Pmt 43234, line 159, R-0.01); 12 Mar 2026 (Pmt 43640, line 171, R-0.01); 19 Mar 2026 (Pmt 43716, line 175, R-0.01); 09 Apr 2026 (Pmt 43962, line 183, R-0.01).

---

### March 2025

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Mar 2025 | Crd Note | 12074 | DN#4438 | LPG | -3,234.35 | -3,234.35 | T0002 CN_DN_PAIR ✓ ↔ Inv 41503 |
| 15 Mar 2025 | Crd Note | 12075 | DN#4438-EMPTY | CYL | -3,105.00 | -6,339.35 | T0003 CN_DN_PAIR ✓ ↔ Inv 41504 |
| 15 Mar 2025 | Invoice | 41503 | DN#4438 | LPG | 3,234.35 | -3,105.00 | T0002 CN_DN_PAIR ✓ ↔ Crd Note 12074 |
| 15 Mar 2025 | Invoice | 41504 | DN#4438-EMPTY | CYL | 3,105.00 | 0.00 | T0003 CN_DN_PAIR ✓ ↔ Crd Note 12075 ◀ ZERO |
| 15 Mar 2025 | Invoice | 41522 | DN#4438 | LPG | 2,953.12 | 2,953.12 | T0105 BALANCE_ZERO ✓ ↔ Crd Note 12079, Inv 44949, Inv 45199, Inv 45303 +5 |
| 15 Mar 2025 | Invoice | 41523 | DN#4438-EMPTY | CYL | 2,932.50 | 5,885.62 | T0100 CYL_EXCHANGE ✓ ↔ Crd Note 12081, Crd Note 12082 |
| 17 Mar 2025 | Crd Note | 12079 | DN#4438 | LPG | -2,953.12 | 2,932.50 | T0105 BALANCE_ZERO ✓ ↔ Inv 41522, Inv 44949, Inv 45199, Inv 45303 +5 |
| 17 Mar 2025 | Crd Note | 12080 | DN#4438-EMPTY | CYL | -2,932.50 | 0.00 | T0005 CN_DN_PAIR ✓ ↔ Inv 41535 ◀ ZERO |
| 17 Mar 2025 | Crd Note | 12081 | DN#4438-EMPTY | CYL | -2,415.00 | -2,415.00 | T0100 CYL_EXCHANGE ✓ ↔ Inv 41523, Crd Note 12082 |
| 17 Mar 2025 | Crd Note | 12082 | DN#4438-EMPTY | CYL | -517.50 | -2,932.50 | T0100 CYL_EXCHANGE ✓ ↔ Inv 41523, Crd Note 12081 |
| 17 Mar 2025 | Invoice | 41534 | DN#4438 | LPG | 2,980.00 | 47.50 | T0053 EXACT_SINGLE ✓ ↔ Pmt 37590 |
| 17 Mar 2025 | Invoice | 41535 | DN#4438-EMPTY | CYL | 2,932.50 | 2,980.00 | T0005 CN_DN_PAIR ✓ ↔ Crd Note 12080 |
| 20 Mar 2025 | Payment | 37590 | TRANSF \| STAT 112 | LPG | -2,980.00 | 0.00 | T0053 EXACT_SINGLE ✓ ↔ Inv 41534 ◀ ZERO |
| 25 Mar 2025 | Crd Note | 12123 | DN#12977-EMPTY | CYL | -2,932.50 | -2,932.50 | T0006 CN_DN_PAIR ✓ ↔ Inv 41713 |
| 25 Mar 2025 | Invoice | 41712 | DN#12978 | LPG | 2,953.12 | 20.62 | T0054 EXACT_SINGLE ✓ ↔ Pmt 38035 |
| 25 Mar 2025 | Invoice | 41713 | DN#12977-EMPTY | CYL | 2,932.50 | 2,953.12 | T0006 CN_DN_PAIR ✓ ↔ Crd Note 12123 |

### April 2025

Opening balance (ERP running): **R2,953.12**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Apr 2025 | Invoice | 41894 | DN#12836 | LPG | 2,699.99 | 5,653.11 | T0055 EXACT_SUM ✓ ↔ Pmt 38227, Inv 42306 |
| 01 Apr 2025 | Invoice | 41895 | DN#12836-EMPTY | CYL | 2,415.00 | 8,068.11 | T0007 CN_DN_PAIR ✓ ↔ Crd Note 12174 |
| 02 Apr 2025 | Crd Note | 12174 | DN#12836-EMPTY | CYL | -2,415.00 | 5,653.11 | T0007 CN_DN_PAIR ✓ ↔ Inv 41895 |
| 03 Apr 2025 | Payment | 38035 | TRANSF \| STAT 113 | LPG | -2,953.12 | 2,699.99 | T0054 EXACT_SINGLE ✓ ↔ Inv 41712 |
| 16 Apr 2025 | Invoice | 42306 | DN#13072 | LPG | 4,227.89 | 6,927.88 | T0055 EXACT_SUM ✓ ↔ Pmt 38227, Inv 41894 |
| 16 Apr 2025 | Invoice | 42307 | DN#13072-EMPTY | CYL | 4,140.00 | 11,067.88 | T0008 CN_DN_PAIR ✓ ↔ Crd Note 12296 |
| 17 Apr 2025 | Crd Note | 12296 | DN#13072-EMPTY | CYL | -4,140.00 | 6,927.88 | T0008 CN_DN_PAIR ✓ ↔ Inv 42307 |
| 22 Apr 2025 | Invoice | 42434 | DN#13083 | LPG | 2,901.50 | 9,829.38 | T0056 EXACT_SINGLE ✓ ↔ Pmt 38366 |
| 24 Apr 2025 | Payment | 38227 | TRANSF \| STAT 113 | LPG | -6,927.88 | 2,901.50 | T0055 EXACT_SUM ✓ ↔ Inv 42306, Inv 41894 |
| 29 Apr 2025 | Crd Note | 12369 | DN#13110-EMPTY | CYL | -2,415.00 | 486.50 | T0009 CN_DN_PAIR ✓ ↔ Inv 42613 |
| 29 Apr 2025 | Invoice | 42612 | DN#13110 | LPG | 2,652.80 | 3,139.30 | T0057 EXACT_SINGLE ✓ ↔ Pmt 38812 |
| 29 Apr 2025 | Invoice | 42613 | DN#13110-EMPTY | CYL | 2,415.00 | 5,554.30 | T0009 CN_DN_PAIR ✓ ↔ Crd Note 12369 |

### May 2025

Opening balance (ERP running): **R5,554.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 May 2025 | Payment | 38366 | TRANSF \| STAT 114 | LPG | -2,901.50 | 2,652.80 | T0056 EXACT_SINGLE ✓ ↔ Inv 42434 |
| 06 May 2025 | Crd Note | 12423 | DN#12058-EMPTY | CYL | -2,932.50 | -279.70 | T0010 CN_DN_PAIR ✓ ↔ Inv 42844 |
| 06 May 2025 | Invoice | 42843 | DN#12058 | LPG | 2,901.50 | 2,621.80 | T0058 EXACT_SINGLE ✓ ↔ Pmt 38838 |
| 06 May 2025 | Invoice | 42844 | DN#12058-EMPTY | CYL | 2,932.50 | 5,554.30 | T0010 CN_DN_PAIR ✓ ↔ Crd Note 12423 |
| 13 May 2025 | Crd Note | 12468 | DN#12076-EMPTY | CYL | -2,415.00 | 3,139.30 | T0011 CN_DN_PAIR ✓ ↔ Inv 43007 |
| 13 May 2025 | Invoice | 43005 | DN#12076 | LPG | 2,652.80 | 5,792.10 | T0067 EXACT_SINGLE ✓ ↔ Pmt 41441 |
| 13 May 2025 | Invoice | 43007 | DN#12076-EMPTY | CYL | 2,415.00 | 8,207.10 | T0011 CN_DN_PAIR ✓ ↔ Crd Note 12468 |
| 15 May 2025 | Payment | 38812 | TRANSF \| STAT 114 | LPG | -2,652.80 | 5,554.30 | T0057 EXACT_SINGLE ✓ ↔ Inv 42612 |
| 15 May 2025 | Invoice | 43081 | DN#13232 | LPG | 248.70 | 5,803.00 | T0060 EXACT_RUN ✓ ↔ Pmt 39589, Inv 43461, Inv 43648, Inv 43905 +1 |
| 15 May 2025 | Invoice | 43082 | DN#13232-EMPTY | CYL | 517.50 | 6,320.50 | T0101 CYL_EXCHANGE ✓ ↔ Inv 43246, Crd Note 12535, Inv 43462, Crd Note 12599 |
| 21 May 2025 | Invoice | 43245 | DN#12106 | LPG | 2,943.51 | 9,264.01 | T0059 EXACT_SINGLE ✓ ↔ Pmt 39077 |
| 21 May 2025 | Invoice | 43246 | DN#12106-EMPTY | CYL | 2,932.50 | 12,196.51 | T0101 CYL_EXCHANGE ✓ ↔ Inv 43082, Crd Note 12535, Inv 43462, Crd Note 12599 |
| 22 May 2025 | Crd Note | 12535 | DN#12106-EMPTY | CYL | -2,415.00 | 9,781.51 | T0101 CYL_EXCHANGE ✓ ↔ Inv 43082, Inv 43246, Inv 43462, Crd Note 12599 |
| 22 May 2025 | Payment | 38838 | TRANSF \| STAT 114 | LPG | -2,901.50 | 6,880.01 | T0058 EXACT_SINGLE ✓ ↔ Inv 42843 |
| 29 May 2025 | Payment | 39077 | TRANSF \| STAT 114 | LPG | -2,943.51 | 3,936.50 | T0059 EXACT_SINGLE ✓ ↔ Inv 43245 |
| 29 May 2025 | Invoice | 43461 | DN#12137 | LPG | 2,691.21 | 6,627.71 | T0060 EXACT_RUN ✓ ↔ Pmt 39589, Inv 43081, Inv 43648, Inv 43905 +1 |
| 29 May 2025 | Invoice | 43462 | DN#12137-EMPTY | CYL | 2,415.00 | 9,042.71 | T0101 CYL_EXCHANGE ✓ ↔ Inv 43082, Inv 43246, Crd Note 12535, Crd Note 12599 |
| 30 May 2025 | Crd Note | 12599 | DN#12137-EMPTY | CYL | -3,450.00 | 5,592.71 | T0101 CYL_EXCHANGE ✓ ↔ Inv 43082, Inv 43246, Crd Note 12535, Inv 43462 |

### June 2025

Opening balance (ERP running): **R5,592.71**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Jun 2025 | Invoice | 43648 | DN#12149 | LPG | 2,943.51 | 8,536.22 | T0060 EXACT_RUN ✓ ↔ Pmt 39589, Inv 43081, Inv 43461, Inv 43905 +1 |
| 05 Jun 2025 | Invoice | 43649 | DN#12149-EMPTY | CYL | 2,415.00 | 10,951.22 | T0012 CN_DN_PAIR ✓ ↔ Crd Note 12639 |
| 06 Jun 2025 | Crd Note | 12639 | DN#12149-EMPTY | CYL | -2,415.00 | 8,536.22 | T0012 CN_DN_PAIR ✓ ↔ Inv 43649 |
| 06 Jun 2025 | Crd Note | 12640 | DN#12149-EMPTY | CYL | -2,932.50 | 5,603.72 | T0013 CN_DN_PAIR ✓ ↔ Inv 43669 |
| 06 Jun 2025 | Invoice | 43669 | DN#12149-EMPTY | CYL | 2,932.50 | 8,536.22 | T0013 CN_DN_PAIR ✓ ↔ Crd Note 12640 |
| 12 Jun 2025 | Crd Note | 12710 | DN#12560-E,MPTY | CYL | -2,415.00 | 6,121.22 | T0014 CN_DN_PAIR ✓ ↔ Inv 43859 |
| 12 Jun 2025 | Crd Note | 12717 | DN#12560 | LPG | -1,308.64 | 4,812.58 | T0015 CN_DN_PAIR ✓ ↔ Inv 43858 |
| 12 Jun 2025 | Invoice | 43858 | DN#12560 | LPG | 1,308.64 | 6,121.22 | T0015 CN_DN_PAIR ✓ ↔ Crd Note 12717 |
| 12 Jun 2025 | Invoice | 43859 | DN#12560-E,MPTY | CYL | 2,415.00 | 8,536.22 | T0014 CN_DN_PAIR ✓ ↔ Crd Note 12710 |
| 12 Jun 2025 | Invoice | 43905 | DN#12560 | LPG | 2,617.29 | 11,153.51 | T0060 EXACT_RUN ✓ ↔ Pmt 39589, Inv 43081, Inv 43461, Inv 43648 +1 |
| 19 Jun 2025 | Crd Note | 12763 | DN#12412-EMPTY | CYL | -2,932.50 | 8,221.01 | T0016 CN_DN_PAIR ✓ ↔ Inv 44063 |
| 19 Jun 2025 | Invoice | 44062 | DN#12412 | LPG | 2,862.66 | 11,083.67 | T0060 EXACT_RUN ✓ ↔ Pmt 39589, Inv 43081, Inv 43461, Inv 43648 +1 |
| 19 Jun 2025 | Invoice | 44063 | DN#12412-EMPTY | CYL | 2,932.50 | 14,016.17 | T0016 CN_DN_PAIR ✓ ↔ Crd Note 12763 |
| 24 Jun 2025 | Invoice | 44200 | DN#12325 | LPG | 2,617.29 | 16,633.46 | T0061 EXACT_SINGLE ✓ ↔ Pmt 39764 |
| 24 Jun 2025 | Invoice | 44201 | DN#12325-EMPTY | CYL | 2,415.00 | 19,048.46 | T0017 CN_DN_PAIR ✓ ↔ Crd Note 12812 |
| 25 Jun 2025 | Crd Note | 12812 | DN#12325-EMPTY | CYL | -2,415.00 | 16,633.46 | T0017 CN_DN_PAIR ✓ ↔ Inv 44201 |
| 26 Jun 2025 | Payment | 39589 | TRANSF \| STAT 115 | LPG | -11,363.37 | 5,270.09 | T0060 EXACT_RUN ✓ ↔ Inv 43081, Inv 43461, Inv 43648, Inv 43905 +1 |

### July 2025

Opening balance (ERP running): **R5,270.09**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Jul 2025 | Crd Note | 12872 | DN#12349-EMPTY | CYL | -2,415.00 | 2,855.09 | T0102 CYL_EXCHANGE ✓ ↔ Inv 44404, Crd Note 13251, Inv 45721 |
| 01 Jul 2025 | Invoice | 44403 | DN#12349 | LPG | 3,925.93 | 6,781.02 | T0062 EXACT_SINGLE ✓ ↔ Pmt 40139 |
| 01 Jul 2025 | Invoice | 44404 | DN#12349-EMPTY | CYL | 3,622.50 | 10,403.52 | T0102 CYL_EXCHANGE ✓ ↔ Crd Note 12872, Crd Note 13251, Inv 45721 |
| 03 Jul 2025 | Payment | 39764 | TRANSF \| STAT 116 | LPG | -2,617.29 | 7,786.23 | T0061 EXACT_SINGLE ✓ ↔ Inv 44200 |
| 10 Jul 2025 | Payment | 40139 | TRANSF \| STAT 116 | LPG | -3,925.93 | 3,860.30 | T0062 EXACT_SINGLE ✓ ↔ Inv 44403 |
| 10 Jul 2025 | Invoice | 44742 | DN#12686 | LPG | 2,810.61 | 6,670.91 | T0063 EXACT_SINGLE ✓ ↔ Pmt 40271 |
| 11 Jul 2025 | Invoice | 44743 | DN#12686-EMPTY | CYL | 2,932.50 | 9,603.41 | T0018 CN_DN_PAIR ✓ ↔ Crd Note 12962 |
| 12 Jul 2025 | Crd Note | 12962 | DN#12686-EMPTY | CYL | -2,932.50 | 6,670.91 | T0018 CN_DN_PAIR ✓ ↔ Inv 44743 |
| 18 Jul 2025 | Invoice | 44949 | DN#12649 | LPG | 2,810.61 | 9,481.52 | T0105 BALANCE_ZERO ✓ ↔ Inv 41522, Crd Note 12079, Inv 45199, Inv 45303 +5 |
| 18 Jul 2025 | Invoice | 44950 | DN#12649-EMPTY | CYL | 2,932.50 | 12,414.02 | T0019 CN_DN_PAIR ✓ ↔ Crd Note 13020 |
| 19 Jul 2025 | Crd Note | 13020 | DN#12649-EMPTY | CYL | -2,932.50 | 9,481.52 | T0019 CN_DN_PAIR ✓ ↔ Inv 44950 |
| 24 Jul 2025 | Payment | 40271 | TRANSF \| STAT 116 | LPG | -2,810.61 | 6,670.91 | T0063 EXACT_SINGLE ✓ ↔ Inv 44742 |
| 28 Jul 2025 | Invoice | 45199 | DN20020 | LPG | 2,810.61 | 9,481.52 | T0105 BALANCE_ZERO ✓ ↔ Inv 41522, Crd Note 12079, Inv 44949, Inv 45303 +5 |
| 28 Jul 2025 | Invoice | 45200 | DN20020. | CYL | 2,932.50 | 12,414.02 | T0020 CN_DN_PAIR ✓ ↔ Crd Note 13069 |
| 29 Jul 2025 | Crd Note | 13069 | DN20020. | CYL | -2,932.50 | 9,481.52 | T0020 CN_DN_PAIR ✓ ↔ Inv 45200 |

### August 2025

Opening balance (ERP running): **R9,481.52**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Aug 2025 | Crd Note | 13102 | DN #20126- EMPTIES | CYL | -1,725.00 | 7,756.52 | T0021 CN_DN_PAIR ✓ ↔ Inv 45304 |
| 01 Aug 2025 | Invoice | 45303 | DN #20126 | LPG | 1,525.76 | 9,282.28 | T0105 BALANCE_ZERO ✓ ↔ Inv 41522, Crd Note 12079, Inv 44949, Inv 45199 +5 |
| 01 Aug 2025 | Invoice | 45304 | DN #20126- EMPTIES | CYL | 1,725.00 | 11,007.28 | T0021 CN_DN_PAIR ✓ ↔ Crd Note 13102 |
| 07 Aug 2025 | Invoice | 45488 | DN#20072 | LPG | 2,569.70 | 13,576.98 | T0105 BALANCE_ZERO ✓ ↔ Inv 41522, Crd Note 12079, Inv 44949, Inv 45199 +5 |
| 07 Aug 2025 | Invoice | 45489 | DN#20072-- EMPTY | CYL | 2,415.00 | 15,991.98 | T0022 CN_DN_PAIR ✓ ↔ Crd Note 13165 |
| 08 Aug 2025 | Crd Note | 13165 | DN#20072-- EMPTY | CYL | -2,415.00 | 13,576.98 | T0022 CN_DN_PAIR ✓ ↔ Inv 45489 |
| 11 Aug 2025 | Crd Note | 13194 | DN#20306-EMPTY | CYL | -2,932.50 | 10,644.48 | T0023 CN_DN_PAIR ✓ ↔ Inv 45578 |
| 11 Aug 2025 | Invoice | 45577 | DN#20306 | LPG | 2,810.61 | 13,455.09 | T0068 EXACT_RUN ✓ ↔ Pmt 41654, Inv 46050, Inv 46267, Inv 46562 +2 |
| 11 Aug 2025 | Invoice | 45578 | DN#20306-EMPTY | CYL | 2,932.50 | 16,387.59 | T0023 CN_DN_PAIR ✓ ↔ Crd Note 13194 |
| 14 Aug 2025 | Payment | 40729 | TRANSF \| STAT 117 | LPG | -9,716.68 | 6,670.91 | T0105 BALANCE_ZERO ✓ ↔ Inv 41522, Crd Note 12079, Inv 44949, Inv 45199 +5 |
| 18 Aug 2025 | Crd Note | 13251 | DN#20515-EMPTY | CYL | -2,932.50 | 3,738.41 | T0102 CYL_EXCHANGE ✓ ↔ Crd Note 12872, Inv 44404, Inv 45721 |
| 18 Aug 2025 | Invoice | 45720 | DN#20515 | LPG | 1,491.68 | 5,230.09 | T0065 EXACT_SINGLE ✓ ↔ Pmt 40891 |
| 18 Aug 2025 | Invoice | 45721 | DN#20515-EMPTY | CYL | 1,725.00 | 6,955.09 | T0102 CYL_EXCHANGE ✓ ↔ Crd Note 12872, Inv 44404, Crd Note 13251 |
| 25 Aug 2025 | Crd Note | 13301 | DN#20439-EMPTY | CYL | -2,932.50 | 4,022.59 | T0024 CN_DN_PAIR ✓ ↔ Inv 45873 |
| 25 Aug 2025 | Invoice | 45872 | DN#20439 | LPG | 2,747.82 | 6,770.41 | T0066 EXACT_SINGLE ✓ ↔ Pmt 41106 |
| 25 Aug 2025 | Invoice | 45873 | DN#20439-EMPTY | CYL | 2,932.50 | 9,702.91 | T0024 CN_DN_PAIR ✓ ↔ Crd Note 13301 |
| 28 Aug 2025 | Payment | 40891 | TRANSF \| STAT 117 | LPG | -1,491.68 | 8,211.23 | T0065 EXACT_SINGLE ✓ ↔ Inv 45720 |

### September 2025

Opening balance (ERP running): **R8,211.23**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Sept 2025 | Crd Note | 13349 | DN#20566-EMPTY | CYL | -3,622.50 | 4,588.73 | T0025 CN_DN_PAIR ✓ ↔ Inv 46051 |
| 01 Sept 2025 | Invoice | 46050 | DN#20566 | LPG | 3,768.44 | 8,357.17 | T0068 EXACT_RUN ✓ ↔ Pmt 41654, Inv 45577, Inv 46267, Inv 46562 +2 |
| 01 Sept 2025 | Invoice | 46051 | DN#20566-EMPTY | CYL | 3,622.50 | 11,979.67 | T0025 CN_DN_PAIR ✓ ↔ Crd Note 13349 |
| 04 Sept 2025 | Payment | 41106 | TRANSF \| STAT 118 | LPG | -2,747.82 | 9,231.85 | T0066 EXACT_SINGLE ✓ ↔ Inv 45872 |
| 10 Sept 2025 | Crd Note | 13434 | DN#20477-EMPTY | CYL | -2,932.50 | 6,299.35 | T0026 CN_DN_PAIR ✓ ↔ Inv 46268 |
| 10 Sept 2025 | Invoice | 46267 | DN#20477 | LPG | 2,626.74 | 8,926.09 | T0068 EXACT_RUN ✓ ↔ Pmt 41654, Inv 45577, Inv 46050, Inv 46562 +2 |
| 10 Sept 2025 | Invoice | 46268 | DN#20477-EMPTY | CYL | 2,932.50 | 11,858.59 | T0026 CN_DN_PAIR ✓ ↔ Crd Note 13434 |
| 22 Sept 2025 | Crd Note | 13523 | DN#21051-EMPTY | CYL | -2,932.50 | 8,926.09 | T0027 CN_DN_PAIR ✓ ↔ Inv 46563 |
| 22 Sept 2025 | Invoice | 46562 | DN#21051 | LPG | 2,626.74 | 11,552.83 | T0068 EXACT_RUN ✓ ↔ Pmt 41654, Inv 45577, Inv 46050, Inv 46267 +2 |
| 22 Sept 2025 | Invoice | 46563 | DN#21051-EMPTY | CYL | 2,932.50 | 14,485.33 | T0027 CN_DN_PAIR ✓ ↔ Crd Note 13523 |
| 25 Sept 2025 | Payment | 41441 | TRANSF \| STAT 118 | LPG | -2,652.80 | 11,832.53 | T0067 EXACT_SINGLE ✓ ↔ Inv 43005 |
| 26 Sept 2025 | Crd Note | 13552 | DN#20277-EMPTY | CYL | -2,932.50 | 8,900.03 | T0028 CN_DN_PAIR ✓ ↔ Inv 46670 |
| 26 Sept 2025 | Invoice | 46669 | DN#20277 | LPG | 2,626.74 | 11,526.77 | T0068 EXACT_RUN ✓ ↔ Pmt 41654, Inv 45577, Inv 46050, Inv 46267 +2 |
| 26 Sept 2025 | Invoice | 46670 | DN#20277-EMPTY | CYL | 2,932.50 | 14,459.27 | T0028 CN_DN_PAIR ✓ ↔ Crd Note 13552 |

### October 2025

Opening balance (ERP running): **R14,459.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Oct 2025 | Invoice | 46825 | DN#21092 | LPG | 2,401.59 | 16,860.86 | T0068 EXACT_RUN ✓ ↔ Pmt 41654, Inv 45577, Inv 46050, Inv 46267 +2 |
| 01 Oct 2025 | Invoice | 46826 | DN#21092-EPTY | CYL | 2,415.00 | 19,275.86 | T0105 BALANCE_ZERO ✓ ↔ Inv 41522, Crd Note 12079, Inv 44949, Inv 45199 +5 |
| 03 Oct 2025 | Crd Note | 13602 | DN#21092-EPTY | CYL | -2,415.00 | 16,860.86 | T0105 BALANCE_ZERO ✓ ↔ Inv 41522, Crd Note 12079, Inv 44949, Inv 45199 +5 |
| 07 Oct 2025 | Payment | 41529 | CASH | LPG | -0.01 | 16,860.85 | T0105 BALANCE_ZERO ✓ ↔ Inv 41522, Crd Note 12079, Inv 44949, Inv 45199 +5 |
| 09 Oct 2025 | Crd Note | 13651 | DN#20704-EMPTY | CYL | -2,932.50 | 13,928.35 | T0030 CN_DN_PAIR ✓ ↔ Inv 46981 |
| 09 Oct 2025 | Payment | 41654 | TRANSF \| STAT 119 | LPG | -16,860.86 | -2,932.51 | T0068 EXACT_RUN ✓ ↔ Inv 45577, Inv 46050, Inv 46267, Inv 46562 +2 |
| 09 Oct 2025 | Invoice | 46980 | DN#20704 | LPG | 2,626.74 | -305.77 | T0069 EXACT_SINGLE ✓ ↔ Pmt 41857 |
| 09 Oct 2025 | Invoice | 46981 | DN#20704-EMPTY | CYL | 2,932.50 | 2,626.73 | T0030 CN_DN_PAIR ✓ ↔ Crd Note 13651 |
| 16 Oct 2025 | Payment | 41857 | TRANSF \| STAT 119 | LPG | -2,626.74 | -0.01 | T0069 EXACT_SINGLE ✓ ↔ Inv 46980 ◀ ZERO |
| 18 Oct 2025 | Crd Note | 13710 | DN#21109-EMPTY | CYL | -4,140.00 | -4,140.01 | T0031 CN_DN_PAIR ✓ ↔ Inv 47171 |
| 18 Oct 2025 | Invoice | 47170 | DN#21109 | LPG | 3,827.53 | -312.48 | T0070 EXACT_SINGLE ✓ ↔ Pmt 41946 |
| 18 Oct 2025 | Invoice | 47171 | DN#21109-EMPTY | CYL | 4,140.00 | 3,827.52 | T0031 CN_DN_PAIR ✓ ↔ Crd Note 13710 |
| 23 Oct 2025 | Payment | 41946 | TRANSF \| STAT 119 | LPG | -3,827.53 | -0.01 | T0070 EXACT_SINGLE ✓ ↔ Inv 47170 ◀ ZERO |
| 30 Oct 2025 | Crd Note | 13771 | DN#20767-EMPTY | CYL | -4,657.50 | -4,657.51 | T0032 CN_DN_PAIR ✓ ↔ Inv 47402 |
| 30 Oct 2025 | Invoice | 47401 | DN#20767 | LPG | 4,052.68 | -604.83 | T0071 EXACT_SINGLE ✓ ↔ Pmt 42137 |
| 30 Oct 2025 | Invoice | 47402 | DN#20767-EMPTY | CYL | 4,657.50 | 4,052.67 | T0032 CN_DN_PAIR ✓ ↔ Crd Note 13771 |

### November 2025

Opening balance (ERP running): **R4,052.67**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Nov 2025 | Payment | 42137 | TRANSF \| STAT 120 | LPG | -4,052.68 | -0.01 | T0071 EXACT_SINGLE ✓ ↔ Inv 47401 ◀ ZERO |
| 10 Nov 2025 | Invoice | 47589 | DN#20815 | LPG | 3,751.04 | 3,751.03 | T0072 EXACT_SINGLE ✓ ↔ Pmt 42306 |
| 10 Nov 2025 | Invoice | 47590 | DN#20815-EMPTY | CYL | 4,140.00 | 7,891.03 | T0103 CYL_EXCHANGE ✓ ↔ Crd Note 13838, Crd Note 14007, Inv 48096, Crd Note 14113 +1 |
| 11 Nov 2025 | Crd Note | 13838 | DN#20815-EMPTY | CYL | -3,622.50 | 4,268.53 | T0103 CYL_EXCHANGE ✓ ↔ Inv 47590, Crd Note 14007, Inv 48096, Crd Note 14113 +1 |
| 20 Nov 2025 | Payment | 42306 | TRANSF \| STAT 120 | LPG | -3,751.04 | 517.49 | T0072 EXACT_SINGLE ✓ ↔ Inv 47589 |
| 22 Nov 2025 | Crd Note | 13931 | DN#20859-EMPTY | CYL | -2,415.00 | -1,897.51 | T0033 CN_DN_PAIR ✓ ↔ Inv 47858 |
| 22 Nov 2025 | Invoice | 47857 | DN#20859 | LPG | 2,353.59 | 456.08 | T0073 EXACT_SINGLE ✓ ↔ Pmt 42422 |
| 22 Nov 2025 | Invoice | 47858 | DN#20859-EMPTY | CYL | 2,415.00 | 2,871.08 | T0033 CN_DN_PAIR ✓ ↔ Crd Note 13931 |
| 27 Nov 2025 | Payment | 42422 | TRANSF \| STAT 120 | LPG | -2,353.59 | 517.49 | T0073 EXACT_SINGLE ✓ ↔ Inv 47857 |
| 28 Nov 2025 | Crd Note | 13974 | DN#20691-EMPTY | CYL | -4,140.00 | -3,622.51 | T0034 CN_DN_PAIR ✓ ↔ Inv 47980 |
| 28 Nov 2025 | Invoice | 47979 | DN#20691 | LPG | 3,751.04 | 128.53 | T0074 EXACT_SINGLE ✓ ↔ Pmt 42529 |
| 28 Nov 2025 | Invoice | 47980 | DN#20691-EMPTY | CYL | 4,140.00 | 4,268.53 | T0034 CN_DN_PAIR ✓ ↔ Crd Note 13974 |

### December 2025

Opening balance (ERP running): **R4,268.53**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Dec 2025 | Crd Note | 14007 | DN20893 EMPTY | CYL | -2,415.00 | 1,853.53 | T0103 CYL_EXCHANGE ✓ ↔ Inv 47590, Crd Note 13838, Inv 48096, Crd Note 14113 +1 |
| 04 Dec 2025 | Payment | 42529 | TRANSF \| STAT 121 | LPG | -3,751.04 | -1,897.51 | T0074 EXACT_SINGLE ✓ ↔ Inv 47979 |
| 04 Dec 2025 | Invoice | 48095 | DN20893 | LPG | 3,530.39 | 1,632.88 | T0075 EXACT_SINGLE ✓ ↔ Pmt 42601 |
| 04 Dec 2025 | Invoice | 48096 | DN20893 EMPTY | CYL | 3,622.50 | 5,255.38 | T0103 CYL_EXCHANGE ✓ ↔ Inv 47590, Crd Note 13838, Crd Note 14007, Crd Note 14113 +1 |
| 11 Dec 2025 | Payment | 42601 | TRANSF \| STAT 121 | LPG | -3,530.39 | 1,724.99 | T0075 EXACT_SINGLE ✓ ↔ Inv 48095 |
| 18 Dec 2025 | Crd Note | 14113 | DN#21716-EMPTY | CYL | -5,865.00 | -4,140.01 | T0103 CYL_EXCHANGE ✓ ↔ Inv 47590, Crd Note 13838, Crd Note 14007, Inv 48096 +1 |
| 18 Dec 2025 | Invoice | 48347 | DN#21716 | LPG | 3,770.39 | -369.62 | T0076 EXACT_SINGLE ✓ ↔ Pmt 42769 |
| 18 Dec 2025 | Invoice | 48348 | DN#21716-EMPTY | CYL | 4,140.00 | 3,770.38 | T0103 CYL_EXCHANGE ✓ ↔ Inv 47590, Crd Note 13838, Crd Note 14007, Inv 48096 +1 |
| 24 Dec 2025 | Payment | 42769 | TRANSF \| STAT 121 | LPG | -3,770.39 | -0.01 | T0076 EXACT_SINGLE ✓ ↔ Inv 48347 ◀ ZERO |

### January 2026

Opening balance (ERP running): **R-0.01**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Jan 2026 | Crd Note | 14210 | DN-21449-EMPTY | CYL | -4,140.00 | -4,140.01 | T0035 CN_DN_PAIR ✓ ↔ Inv 48614 |
| 05 Jan 2026 | Invoice | 48613 | DN-21449 | LPG | 3,770.39 | -369.62 | T0077 EXACT_SINGLE ✓ ↔ Pmt 42992 |
| 05 Jan 2026 | Invoice | 48614 | DN-21449-EMPTY | CYL | 4,140.00 | 3,770.38 | T0035 CN_DN_PAIR ✓ ↔ Crd Note 14210 |
| 15 Jan 2026 | Crd Note | 14276 | DN#21640-EMPTY | CYL | -4,140.00 | -369.62 | T0036 CN_DN_PAIR ✓ ↔ Inv 48798 |
| 15 Jan 2026 | Payment | 42992 | TRANSF \| STAT 122 | LPG | -3,770.39 | -4,140.01 | T0077 EXACT_SINGLE ✓ ↔ Inv 48613 |
| 15 Jan 2026 | Invoice | 48797 | DN#21640 | LPG | 3,797.37 | -342.64 | T0078 EXACT_SINGLE ✓ ↔ Pmt 43074 |
| 15 Jan 2026 | Invoice | 48798 | DN#21640-EMPTY | CYL | 4,140.00 | 3,797.36 | T0036 CN_DN_PAIR ✓ ↔ Crd Note 14276 |
| 22 Jan 2026 | Payment | 43074 | TRANSF \| STAT 122 | LPG | -3,797.37 | -0.01 | T0078 EXACT_SINGLE ✓ ↔ Inv 48797 ◀ ZERO |
| 26 Jan 2026 | Crd Note | 14335 | DN#21481EMPTY | CYL | -4,140.00 | -4,140.01 | T0037 CN_DN_PAIR ✓ ↔ Inv 48941 |
| 26 Jan 2026 | Invoice | 48940 | DN#21481 | LPG | 3,797.37 | -342.64 | T0079 EXACT_SINGLE ✓ ↔ Pmt 43234 |
| 26 Jan 2026 | Invoice | 48941 | DN#21481EMPTY | CYL | 4,140.00 | 3,797.36 | T0037 CN_DN_PAIR ✓ ↔ Crd Note 14335 |

### February 2026

Opening balance (ERP running): **R3,797.36**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Feb 2026 | Payment | 43234 | TRANSF \| STAT 123 | LPG | -3,797.37 | -0.01 | T0079 EXACT_SINGLE ✓ ↔ Inv 48940 ◀ ZERO |
| 07 Feb 2026 | Invoice | 49143 | DN-21528 | LPG | 3,839.70 | 3,839.69 | T0080 EXACT_SINGLE ✓ ↔ Pmt 45287 |
| 07 Feb 2026 | Invoice | 49144 | DN-21528-EMPTY | CYL | 4,140.00 | 7,979.69 | T0104 CYL_EXCHANGE ✓ ↔ Crd Note 14395, Crd Note 14533, Inv 49551 |
| 09 Feb 2026 | Crd Note | 14395 | DN-21528-EMPTY | CYL | -3,622.50 | 4,357.19 | T0104 CYL_EXCHANGE ✓ ↔ Inv 49144, Crd Note 14533, Inv 49551 |
| 12 Feb 2026 | Payment | 45287 | TRANSF \| STAT 123 | LPG | -3,839.70 | 517.49 | T0080 EXACT_SINGLE ✓ ↔ Inv 49143 |
| 19 Feb 2026 | Crd Note | 14458 | DN_21913-EMPTY | CYL | -3,622.50 | -3,105.01 | T0038 CN_DN_PAIR ✓ ↔ Inv 49329 |
| 19 Feb 2026 | Invoice | 49328 | DN_21913 | LPG | 3,613.84 | 508.83 | T0081 EXACT_SINGLE ✓ ↔ Pmt 43471 |
| 19 Feb 2026 | Invoice | 49329 | DN_21913-EMPTY | CYL | 3,622.50 | 4,131.33 | T0038 CN_DN_PAIR ✓ ↔ Crd Note 14458 |
| 26 Feb 2026 | Payment | 43471 | TRANSF \| STAT 123 | LPG | -3,613.84 | 517.49 | T0081 EXACT_SINGLE ✓ ↔ Inv 49328 |

### March 2026

Opening balance (ERP running): **R517.49**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Mar 2026 | Crd Note | 14533 | DN#22112-EMPTY | CYL | -4,657.50 | -4,140.01 | T0104 CYL_EXCHANGE ✓ ↔ Inv 49144, Crd Note 14395, Inv 49551 |
| 04 Mar 2026 | Invoice | 49550 | DN#22112 | LPG | 3,839.70 | -300.31 | T0082 EXACT_SINGLE ✓ ↔ Pmt 43640 |
| 04 Mar 2026 | Invoice | 49551 | DN#22112-EMPTY | CYL | 4,140.00 | 3,839.69 | T0104 CYL_EXCHANGE ✓ ↔ Inv 49144, Crd Note 14395, Crd Note 14533 |
| 12 Mar 2026 | Payment | 43640 | TRANSF \| STAT 124 | LPG | -3,839.70 | -0.01 | T0082 EXACT_SINGLE ✓ ↔ Inv 49550 ◀ ZERO |
| 12 Mar 2026 | Invoice | 49710 | DN#21963 | LPG | 3,870.28 | 3,870.27 | T0083 EXACT_SINGLE ✓ ↔ Pmt 43716 |
| 12 Mar 2026 | Invoice | 49711 | DN#21963-EMPTY | CYL | 4,140.00 | 8,010.27 | T0039 CN_DN_PAIR ✓ ↔ Crd Note 14587 |
| 13 Mar 2026 | Crd Note | 14587 | DN#21963-EMPTY | CYL | -4,140.00 | 3,870.27 | T0039 CN_DN_PAIR ✓ ↔ Inv 49711 |
| 19 Mar 2026 | Payment | 43716 | TRANSF \| STAT 124 | LPG | -3,870.28 | -0.01 | T0083 EXACT_SINGLE ✓ ↔ Inv 49710 ◀ ZERO |
| 26 Mar 2026 | Crd Note | 14666 | DN-21985-EMPTY | CYL | -2,415.00 | -2,415.01 | T0040 CN_DN_PAIR ✓ ↔ Inv 49934 |
| 26 Mar 2026 | Invoice | 49933 | DN-21985 | LPG | 2,428.41 | 13.40 | T0084 EXACT_SINGLE ✓ ↔ Pmt 43878 |
| 26 Mar 2026 | Invoice | 49934 | DN-21985-EMPTY | CYL | 2,415.00 | 2,428.40 | T0040 CN_DN_PAIR ✓ ↔ Crd Note 14666 |

### April 2026

Opening balance (ERP running): **R2,428.40**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Apr 2026 | Crd Note | 14705 | DN-21858-EMPTY | CYL | -2,932.50 | -504.10 | T0041 CN_DN_PAIR ✓ ↔ Inv 50067 |
| 02 Apr 2026 | Payment | 43878 | TRANSF \| STAT 125 | LPG | -2,428.41 | -2,932.51 | T0084 EXACT_SINGLE ✓ ↔ Inv 49933 |
| 02 Apr 2026 | Invoice | 50066 | DN-21858 | LPG | 2,971.08 | 38.57 | T0085 EXACT_SINGLE ✓ ↔ Pmt 43962 |
| 02 Apr 2026 | Invoice | 50067 | DN-21858-EMPTY | CYL | 2,932.50 | 2,971.07 | T0041 CN_DN_PAIR ✓ ↔ Crd Note 14705 |
| 09 Apr 2026 | Payment | 43962 | TRANSF \| STAT 125 | LPG | -2,971.08 | -0.01 | T0085 EXACT_SINGLE ✓ ↔ Inv 50066 ◀ ZERO |
| 10 Apr 2026 | Crd Note | 14741 | DN-22161-EMPTY | CYL | -2,415.00 | -2,415.01 | T0105 CYL_EXCHANGE ✓ ↔ Inv 50174, Crd Note 14856, Inv 50658, Crd Note 14904 +3 |
| 10 Apr 2026 | Invoice | 50173 | DN-22161 | LPG | 2,971.08 | 556.07 | T0086 EXACT_SINGLE ✓ ↔ Pmt 44028 |
| 10 Apr 2026 | Invoice | 50174 | DN-22161-EMPTY | CYL | 2,932.50 | 3,488.57 | T0105 CYL_EXCHANGE ✓ ↔ Crd Note 14741, Crd Note 14856, Inv 50658, Crd Note 14904 +3 |
| 16 Apr 2026 | Payment | 44028 | TRANSF \| STAT 125 | LPG | -2,971.08 | 517.49 | T0086 EXACT_SINGLE ✓ ↔ Inv 50173 |
| 20 Apr 2026 | Crd Note | 14773 | DN-21336-EMPTY | CYL | -3,622.50 | -3,105.01 | T0042 CN_DN_PAIR ✓ ↔ Inv 50306 |
| 20 Apr 2026 | Invoice | 50305 | DN-21336 | LPG | 4,074.62 | 969.61 | T0087 EXACT_SINGLE ✓ ↔ Pmt 44147 |
| 20 Apr 2026 | Invoice | 50306 | DN-21336-EMPTY | CYL | 3,622.50 | 4,592.11 | T0042 CN_DN_PAIR ✓ ↔ Crd Note 14773 |
| 30 Apr 2026 | Payment | 44147 | TRANSF \| STAT 125 | LPG | -4,074.62 | 517.49 | T0087 EXACT_SINGLE ✓ ↔ Inv 50305 |

### May 2026

Opening balance (ERP running): **R517.49**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 May 2026 | Crd Note | 14849 | DN#22222 | LPG | -2,971.08 | -2,453.59 | T0043 CN_DN_PAIR ✓ ↔ Inv 50518 |
| 05 May 2026 | Crd Note | 14850 | DN#22222-EMPTY | CYL | -2,932.50 | -5,386.09 | T0044 CN_DN_PAIR ✓ ↔ Inv 50519 |
| 05 May 2026 | Crd Note | 14856 | DN#22222-EMPTY | CYL | -5,175.00 | -10,561.09 | T0105 CYL_EXCHANGE ✓ ↔ Crd Note 14741, Inv 50174, Inv 50658, Crd Note 14904 +3 |
| 05 May 2026 | Invoice | 50518 | DN#22222 | LPG | 2,971.08 | -7,590.01 | T0043 CN_DN_PAIR ✓ ↔ Crd Note 14849 |
| 05 May 2026 | Invoice | 50519 | DN#22222-EMPTY | CYL | 2,932.50 | -4,657.51 | T0044 CN_DN_PAIR ✓ ↔ Crd Note 14850 |
| 05 May 2026 | Invoice | 50528 | DN#22222 | LPG | 4,329.29 | -328.22 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 44227, Pmt 45590, Inv 50529 |
| 05 May 2026 | Invoice | 50529 | DN#22222-EMPTY | CYL | 4,140.00 | 3,811.78 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 44227, Pmt 45590, Inv 50528 |
| 07 May 2026 | Payment | 44227 | TRANSF \| STAT 125 | LPG | -4,978.91 | -1,167.13 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 45590, Inv 50529, Inv 50528 |
| 13 May 2026 | Invoice | 50657 | DN#22385 | LPG | 5,004.42 | 3,837.29 | T0093 EXACT_SINGLE ✓ ↔ Pmt 45202 |
| 13 May 2026 | Invoice | 50658 | DN#22385-EMPTY | CYL | 4,140.00 | 7,977.29 | T0105 CYL_EXCHANGE ✓ ↔ Crd Note 14741, Inv 50174, Crd Note 14856, Crd Note 14904 +3 |
| 14 May 2026 | Crd Note | 14904 | DN#22385-EMPTY | CYL | -3,622.50 | 4,354.79 | T0105 CYL_EXCHANGE ✓ ↔ Crd Note 14741, Inv 50174, Crd Note 14856, Inv 50658 +3 |
| 28 May 2026 | Crd Note | 14981 | DN#22603 | CYL | -517.50 | 3,837.29 | T0046 CN_DN_PAIR ✓ ↔ Inv 50917 |
| 28 May 2026 | Crd Note | 14981 | DN#22603 | LPG | -3,140.03 | 697.26 | T0045 CN_DN_PAIR ✓ ↔ Inv 50917 |
| 28 May 2026 | Invoice | 50917 | DN#22603 | CYL | 517.50 | 1,214.76 | T0046 CN_DN_PAIR ✓ ↔ Crd Note 14981 |
| 28 May 2026 | Invoice | 50917 | DN#22603 | LPG | 3,140.03 | 4,354.79 | T0045 CN_DN_PAIR ✓ ↔ Crd Note 14981 |
| 28 May 2026 | Invoice | 50918 | DN#22603 | LPG | 3,434.41 | 7,789.20 | T0088 EXACT_SINGLE ✓ ↔ Pmt 44554 |

### June 2026

Opening balance (ERP running): **R7,789.20**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Jun 2026 | Payment | 44554 | TRANSF \| STAT 127 | LPG | -3,434.41 | 4,354.79 | T0088 EXACT_SINGLE ✓ ↔ Inv 50918 |
| 06 Jun 2026 | Crd Note | 15027 | DN# 22786 | CYL | -2,932.50 | 1,422.29 | T0105 CYL_EXCHANGE ✓ ↔ Crd Note 14741, Inv 50174, Crd Note 14856, Inv 50658 +3 |
| 06 Jun 2026 | Invoice | 51077 | — | LPG | 4,798.04 | 6,220.33 | T0089 EXACT_SINGLE ✓ ↔ Pmt 44659 |
| 06 Jun 2026 | Invoice | 51078 | — | CYL | 4,140.00 | 10,360.33 | T0105 CYL_EXCHANGE ✓ ↔ Crd Note 14741, Inv 50174, Crd Note 14856, Inv 50658 +3 |
| 11 Jun 2026 | Payment | 44659 | TRANSF \| STAT 127 | LPG | -4,798.04 | 5,562.29 | T0089 EXACT_SINGLE ✓ ↔ Inv 51077 |
| 15 Jun 2026 | Crd Note | 15072 | DN#22502-EMPTY | CYL | -4,140.00 | 1,422.29 | T0047 CN_DN_PAIR ✓ ↔ Inv 51236 |
| 15 Jun 2026 | Invoice | 51235 | DN#22502 | LPG | 4,798.04 | 6,220.33 | T0090 EXACT_SUM ✓ ↔ Pmt 44881, Inv 51337 |
| 15 Jun 2026 | Invoice | 51236 | DN#22502-EMPTY | CYL | 4,140.00 | 10,360.33 | T0047 CN_DN_PAIR ✓ ↔ Crd Note 15072 |
| 20 Jun 2026 | Invoice | 51337 | DN#22512 | OTHER | 1,300.01 | 11,660.34 | T0090 EXACT_SUM ✓ ↔ Pmt 44881, Inv 51235 |
| 25 Jun 2026 | Payment | 44881 | TRANSF \| STAT 127 | LPG | -6,098.05 | 5,562.29 | T0090 EXACT_SUM ✓ ↔ Inv 51337, Inv 51235 |
| 25 Jun 2026 | Invoice | 51431 | DN#22662 | LPG | 3,292.77 | 8,855.06 | T0091 EXACT_SINGLE ✓ ↔ Pmt 44963 |
| 25 Jun 2026 | Invoice | 51432 | DN#22662=EMPTY | CYL | 2,932.50 | 11,787.56 | T0105 CYL_EXCHANGE ✓ ↔ Crd Note 14741, Inv 50174, Crd Note 14856, Inv 50658 +3 |
| 26 Jun 2026 | Crd Note | 15128 | DN#22662=EMPTY | CYL | -4,140.00 | 7,647.56 | OPEN |

### July 2026

Opening balance (ERP running): **R7,647.56**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Jul 2026 | Invoice | 51526 | DN#22538 | LPG | 4,536.47 | 12,184.03 | T0092 EXACT_SINGLE ✓ ↔ Pmt 45104 |
| 02 Jul 2026 | Payment | 44963 | TRANSF \| STAT 128 | LPG | -3,292.77 | 8,891.26 | T0091 EXACT_SINGLE ✓ ↔ Inv 51431 |
| 02 Jul 2026 | Invoice | 51527 | DN#22538=EMPTY | CYL | 3,622.50 | 12,513.76 | T0107 CYL_EXCHANGE ✓ ↔ Crd Note 15166, Crd Note 15254, Inv 51790 |
| 03 Jul 2026 | Crd Note | 15166 | DN#22538=EMPTY | CYL | -2,415.00 | 10,098.76 | T0107 CYL_EXCHANGE ✓ ↔ Inv 51527, Crd Note 15254, Inv 51790 |
| 09 Jul 2026 | Payment | 45104 | TRANSF \| STAT 128 | LPG | -4,536.47 | 5,562.29 | T0092 EXACT_SINGLE ✓ ↔ Inv 51526 |
| 13 Jul 2026 | Crd Note | 15254 | DN#22810=EMPTY | CYL | -5,347.50 | 214.79 | T0107 CYL_EXCHANGE ✓ ↔ Inv 51527, Crd Note 15166, Inv 51790 |
| 13 Jul 2026 | Invoice | 51789 | DN#22810 | LPG | 4,820.01 | 5,034.80 | T0094 EXACT_SINGLE ✓ ↔ Pmt 45333 |
| 13 Jul 2026 | Invoice | 51790 | DN#22810=EMPTY | CYL | 4,140.00 | 9,174.80 | T0107 CYL_EXCHANGE ✓ ↔ Inv 51527, Crd Note 15166, Crd Note 15254 |
| 16 Jul 2026 | Payment | 45202 | TRANSF \| STAT 128 | LPG | -5,004.42 | 4,170.38 | T0093 EXACT_SINGLE ✓ ↔ Inv 50657 |
| 20 Jul 2026 | Crd Note | 15284 | DN#22695=EMPTY | CYL | -2,932.50 | 1,237.88 | T0106 CYL_EXCHANGE ✓ ↔ Inv 51955, Crd Note 15738, Inv 53403 |
| 20 Jul 2026 | Invoice | 51954 | DN#22695 | LPG | 4,820.01 | 6,057.89 | T0095 EXACT_SINGLE ✓ ↔ Pmt 45487 |
| 20 Jul 2026 | Invoice | 51955 | DN#22695=EMPTY | CYL | 4,140.00 | 10,197.89 | T0106 CYL_EXCHANGE ✓ ↔ Crd Note 15284, Crd Note 15738, Inv 53403 |
| 23 Jul 2026 | Payment | 45333 | TRANSF \| STAT 128 | LPG | -4,820.01 | 5,377.88 | T0094 EXACT_SINGLE ✓ ↔ Inv 51789 |
| 30 Jul 2026 | Payment | 45487 | TRANSF \| STAT 128 | LPG | -4,820.01 | 557.87 | T0095 EXACT_SINGLE ✓ ↔ Inv 51954 |

### August 2026

Opening balance (ERP running): **R557.87**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Aug 2026 | Crd Note | 15404 | DN#24235-EMPTY | CYL | -5,347.50 | -4,789.63 | T0048 CN_DN_PAIR ✓ ↔ Inv 52271 |
| 03 Aug 2026 | Invoice | 52270 | DN#24235 | LPG | 6,332.16 | 1,542.53 | T0096 EXACT_SINGLE ✓ ↔ Pmt 45714 |
| 03 Aug 2026 | Invoice | 52271 | DN#24235-EMPTY | CYL | 5,347.50 | 6,890.03 | T0048 CN_DN_PAIR ✓ ↔ Crd Note 15404 |
| 06 Aug 2026 | Payment | 45590 | TRANSF \| STAT 129 | LPG | -3,490.37 | 3,399.66 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 44227, Inv 50529, Inv 50528 |
| 13 Aug 2026 | Payment | 45714 | TRANSF \| STAT 129 | LPG | -6,332.16 | -2,932.50 | T0096 EXACT_SINGLE ✓ ↔ Inv 52270 |
| 19 Aug 2026 | Crd Note | 15501 | DN#22883-EMPTY | CYL | -4,140.00 | -7,072.50 | T0049 CN_DN_PAIR ✓ ↔ Inv 52663 |
| 19 Aug 2026 | Invoice | 52662 | DN#22883 | LPG | 4,248.17 | -2,824.33 | T0097 EXACT_SINGLE ✓ ↔ Pmt 45923 |
| 19 Aug 2026 | Invoice | 52663 | DN#22883-EMPTY | CYL | 4,140.00 | 1,315.67 | T0049 CN_DN_PAIR ✓ ↔ Crd Note 15501 |
| 27 Aug 2026 | Payment | 45923 | TRANSF \| STAT 129 | LPG | -4,248.17 | -2,932.50 | T0097 EXACT_SINGLE ✓ ↔ Inv 52662 |

### September 2026

Opening balance (ERP running): **R-2,932.50**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Sept 2026 | Invoice | 52911 | DN#23994 | LPG | 4,248.17 | 1,315.67 | T0098 EXACT_SINGLE ✓ ↔ Pmt 46095 |
| 01 Sept 2026 | Invoice | 52912 | DN#23994-EMPTY | CYL | 4,140.00 | 5,455.67 | T0050 CN_DN_PAIR ✓ ↔ Crd Note 15591 |
| 02 Sept 2026 | Crd Note | 15591 | DN#23994-EMPTY | CYL | -4,140.00 | 1,315.67 | T0050 CN_DN_PAIR ✓ ↔ Inv 52912 |
| 10 Sept 2026 | Payment | 46095 | TRANSF \| STAT 130 | LPG | -4,248.17 | -2,932.50 | T0098 EXACT_SINGLE ✓ ↔ Inv 52911 |
| 14 Sept 2026 | Crd Note | 15649 | DN#24995-EMPTY | CYL | -5,347.50 | -8,280.00 | T0051 CN_DN_PAIR ✓ ↔ Inv 53112 |
| 14 Sept 2026 | Invoice | 53111 | DN#24995 | LPG | 5,702.67 | -2,577.33 | T0099 EXACT_SINGLE ✓ ↔ Pmt 46166 |
| 14 Sept 2026 | Invoice | 53112 | DN#24995-EMPTY | CYL | 5,347.50 | 2,770.17 | T0051 CN_DN_PAIR ✓ ↔ Crd Note 15649 |
| 17 Sept 2026 | Payment | 46166 | TRANSF \| STAT 130 | LPG | -5,702.67 | -2,932.50 | T0099 EXACT_SINGLE ✓ ↔ Inv 53111 |

### October 2026

Opening balance (ERP running): **R-2,932.50**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Oct 2026 | Crd Note | 15738 | DN-21393 | CYL | -6,555.00 | -9,487.50 | T0106 CYL_EXCHANGE ✓ ↔ Crd Note 15284, Inv 51955, Inv 53403 |
| 01 Oct 2026 | Crd Note | 15739 | DN-21393 | LPG | -1,617.18 | -11,104.68 | T0052 CN_DN_PAIR ✓ ↔ Inv 53401 |
| 01 Oct 2026 | Invoice | 53401 | DN-21393 | LPG | 1,617.18 | -9,487.50 | T0052 CN_DN_PAIR ✓ ↔ Crd Note 15739 |
| 01 Oct 2026 | Invoice | 53402 | DN-21393 | LPG | 5,702.67 | -3,784.83 | OPEN |
| 01 Oct 2026 | Invoice | 53403 | DN-21393 | CYL | 5,347.50 | 1,562.67 | T0106 CYL_EXCHANGE ✓ ↔ Crd Note 15284, Inv 51955, Crd Note 15738 |

---

## Ties by rule

| Rule | Confirmed | Probable |
| :--- | ---: | ---: |
| LOCKED | 1 | 0 |
| CN_DN_PAIR | 49 | 0 |
| EXACT_SINGLE | 42 | 0 |
| EXACT_SUM | 2 | 0 |
| EXACT_RUN | 2 | 0 |
| CYL_EXCHANGE | 8 | 0 |
| BALANCE_ZERO | 1 | 0 |

## Probable ties dissolved by BALANCE_ZERO

| Group | Through | Dissolved |
| :--- | :--- | :--- |
| T0105 | 07 Oct 2025 (line 183) | CN_DN_PAIR: Invoice 41522 + Crd Note 12079; CN_DN_PAIR: Invoice 46826 + Crd Note 13602; EXACT_RUN: Payment 40729 + Invoice 44949 + Invoice 45199 + Invoice 45303 + Invoice 45488 |

Proof: holds (rebuilt R1,562.67 vs closing R1,562.67; ERP R1,562.67).

