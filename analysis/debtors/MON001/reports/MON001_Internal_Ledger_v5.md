# Internal ledger: SHORTEN INTERNATIONAL 66 ON MONZALI (MON001), matcher review
**INTERNAL, not for the customer.** Every transaction in ERP order with the ERP running balance and what matcher v5 did with it · generated 2026-10-10 · 30 confirmed / 0 probable ties · 8 rows open · ERP `CURRENT BALANCE` R2,417.24 · matcher v5 ratified 2026-10-10; probable ties are proposals until approved · **REVIEW ONLY:** ingestCoverage partial

**Status key:** `OPEN` untied · `T0001 EXACT_SINGLE ✓` confirmed tie · `T0001 BATCH_SUM ?` probable tie (needs approval) · `LOCKED` operator-approved lock · `◀ ZERO` ERP running balance is within R0.05 after this line.

---

### July 2024

Opening balance (ERP running): **R162.86**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Jul 2024 | Payment | 45158 | TRANSF \| STAT 104 | LPG | -2,628.79 | -2,465.93 | OPEN |

### March 2025

Opening balance (ERP running): **R-2,465.93**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Mar 2025 | Payment | 37379 | TRANSF \| STAT 112 | LPG | -2,816.83 | -5,282.76 | OPEN |

### April 2025

Opening balance (ERP running): **R-5,282.76**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Apr 2025 | Crd Note | 12210 | DN#4470-EMPTY | CYL | -2,415.00 | -7,697.76 | T0005 CN_DN_PAIR ✓ ↔ Inv 42054 |
| 07 Apr 2025 | Invoice | 42053 | DN#4470 | LPG | 2,751.58 | -4,946.18 | T0020 EXACT_SINGLE ✓ ↔ Pmt 38126 |
| 07 Apr 2025 | Invoice | 42054 | DN#4470-EMPTY | CYL | 2,415.00 | -2,531.18 | T0005 CN_DN_PAIR ✓ ↔ Crd Note 12210 |
| 14 Apr 2025 | Crd Note | 12272 | DN#13062-EMPTY | CYL | -2,415.00 | -4,946.18 | T0006 CN_DN_PAIR ✓ ↔ Inv 42252 |
| 14 Apr 2025 | Payment | 38126 | TRANSF \| STAT 113 | LPG | -2,751.58 | -7,697.76 | T0020 EXACT_SINGLE ✓ ↔ Inv 42053 |
| 14 Apr 2025 | Invoice | 42251 | DN#13062 | LPG | 2,751.58 | -4,946.18 | T0021 EXACT_SINGLE ✓ ↔ Pmt 38667 |
| 14 Apr 2025 | Invoice | 42252 | DN#13062-EMPTY | CYL | 2,415.00 | -2,531.18 | T0006 CN_DN_PAIR ✓ ↔ Crd Note 12272 |

### May 2025

Opening balance (ERP running): **R-2,531.18**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 13 May 2025 | Payment | 38667 | TRANSF \| STAT 114 | LPG | -2,751.58 | -5,282.76 | T0021 EXACT_SINGLE ✓ ↔ Inv 42251 |

### June 2025

Opening balance (ERP running): **R-5,282.76**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Jun 2025 | Crd Note | 12663 | DN#12360-EMPTY | CYL | -4,830.00 | -10,112.76 | T0007 CN_DN_PAIR ✓ ↔ Inv 43720 |
| 09 Jun 2025 | Invoice | 43719 | DN#12360 | LPG | 5,579.98 | -4,532.78 | T0022 EXACT_SINGLE ✓ ↔ Pmt 40111 |
| 09 Jun 2025 | Invoice | 43720 | DN#12360-EMPTY | CYL | 4,830.00 | 297.22 | T0007 CN_DN_PAIR ✓ ↔ Crd Note 12663 |

### July 2025

Opening balance (ERP running): **R297.22**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Jul 2025 | Payment | 40111 | TRANSF \| STAT 116 | LPG | -5,579.98 | -5,282.76 | T0022 EXACT_SINGLE ✓ ↔ Inv 43719 |
| 08 Jul 2025 | Invoice | 44648 | DN#12178 | LPG | 2,668.48 | -2,614.28 | T0024 EXACT_SINGLE ✓ ↔ Pmt 41246 |
| 08 Jul 2025 | Invoice | 44649 | DN#12178-EMPTY | CYL | 2,415.00 | -199.28 | T0008 CN_DN_PAIR ✓ ↔ Crd Note 12941 |
| 09 Jul 2025 | Crd Note | 12941 | DN#12178-EMPTY | CYL | -2,415.00 | -2,614.28 | T0008 CN_DN_PAIR ✓ ↔ Inv 44649 |

### August 2025

Opening balance (ERP running): **R-2,614.28**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 25 Aug 2025 | Invoice | 45879 | DN#20545 | LPG | 2,611.08 | -3.20 | T0023 EXACT_MONTH_SUM ✓ ↔ Pmt 40894, Inv 45915 |
| 25 Aug 2025 | Invoice | 45880 | DN#20545-EMPTY | CYL | 2,415.00 | 2,411.80 | T0009 CN_DN_PAIR ✓ ↔ Crd Note 13305 |
| 26 Aug 2025 | Crd Note | 13305 | DN#20545-EMPTY | CYL | -2,415.00 | -3.20 | T0009 CN_DN_PAIR ✓ ↔ Inv 45880 |
| 26 Aug 2025 | Crd Note | 13317 | D/N20553 | CYL | -2,415.00 | -2,418.20 | T0010 CN_DN_PAIR ✓ ↔ Inv 45916 |
| 26 Aug 2025 | Invoice | 45915 | — | LPG | 2,611.08 | 192.88 | T0023 EXACT_MONTH_SUM ✓ ↔ Pmt 40894, Inv 45879 |
| 26 Aug 2025 | Invoice | 45916 | D/N20553 | CYL | 2,415.00 | 2,607.88 | T0010 CN_DN_PAIR ✓ ↔ Crd Note 13317 |
| 29 Aug 2025 | Payment | 40894 | TRANSF \| STAT 117 | LPG | -5,222.16 | -2,614.28 | T0023 EXACT_MONTH_SUM ✓ ↔ Inv 45879, Inv 45915 |

### September 2025

Opening balance (ERP running): **R-2,614.28**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Sept 2025 | Payment | 41246 | TRANSF \| STAT 118 | LPG | -2,668.48 | -5,282.76 | T0024 EXACT_SINGLE ✓ ↔ Inv 44648 |

### October 2025

Opening balance (ERP running): **R-5,282.76**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Oct 2025 | Crd Note | 13650 | DN#20703-EMPTY | CYL | -2,415.00 | -7,697.76 | T0011 CN_DN_PAIR ✓ ↔ Inv 46979 |
| 09 Oct 2025 | Invoice | 46978 | DN#20703 | LPG | 2,500.38 | -5,197.38 | OPEN |
| 09 Oct 2025 | Invoice | 46979 | DN#20703-EMPTY | CYL | 2,415.00 | -2,782.38 | T0011 CN_DN_PAIR ✓ ↔ Crd Note 13650 |

### November 2025

Opening balance (ERP running): **R-2,782.38**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Nov 2025 | Crd Note | 13835 | DN#20814-EMPTY | CYL | -2,415.00 | -5,197.38 | T0012 CN_DN_PAIR ✓ ↔ Inv 47588 |
| 10 Nov 2025 | Invoice | 47587 | DN#20814 | LPG | 2,452.38 | -2,745.00 | T0025 EXACT_SINGLE ✓ ↔ Pmt 42302 |
| 10 Nov 2025 | Invoice | 47588 | DN#20814-EMPTY | CYL | 2,415.00 | -330.00 | T0012 CN_DN_PAIR ✓ ↔ Crd Note 13835 |
| 19 Nov 2025 | Payment | 42302 | TRANSF \| STAT 120 | LPG | -2,452.38 | -2,782.38 | T0025 EXACT_SINGLE ✓ ↔ Inv 47587 |

### December 2025

Opening balance (ERP running): **R-2,782.38**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 30 Dec 2025 | Crd Note | 14184 | DN#20961-EMPTY | CYL | -2,415.00 | -5,197.38 | T0013 CN_DN_PAIR ✓ ↔ Inv 48541 |
| 30 Dec 2025 | Invoice | 48540 | DN#20961 | LPG | 2,464.52 | -2,732.86 | T0026 EXACT_SINGLE ✓ ↔ Pmt 43248 |
| 30 Dec 2025 | Invoice | 48541 | DN#20961-EMPTY | CYL | 2,415.00 | -317.86 | T0013 CN_DN_PAIR ✓ ↔ Crd Note 14184 |

### January 2026

Opening balance (ERP running): **R-317.86**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 27 Jan 2026 | Invoice | 52130 | — | OTHER | 960.00 | 642.14 | OPEN |

### February 2026

Opening balance (ERP running): **R642.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Feb 2026 | Payment | 43248 | TRANSF \| STAT 123 | LPG | -2,464.52 | -1,822.38 | T0026 EXACT_SINGLE ✓ ↔ Inv 48540 |
| 26 Feb 2026 | Invoice | 49460 | DN#21803 | LPG | 2,508.01 | 685.63 | T0027 EXACT_SINGLE ✓ ↔ Pmt 43557 |
| 26 Feb 2026 | Invoice | 49461 | DN#21803-EMPTY | CYL | 2,415.00 | 3,100.63 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 14512 |
| 28 Feb 2026 | Crd Note | 14512 | DN#21803-EMPTY | CYL | -2,415.00 | 685.63 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Inv 49461 |

### March 2026

Opening balance (ERP running): **R685.63**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Mar 2026 | Payment | 43557 | TRANSF \| STAT 124 | LPG | -2,508.01 | -1,822.38 | T0027 EXACT_SINGLE ✓ ↔ Inv 49460 |

### April 2026

Opening balance (ERP running): **R-1,822.38**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Apr 2026 | Crd Note | 14710 | DN-21861-EMPTY | CYL | -2,415.00 | -4,237.38 | T0014 CN_DN_PAIR ✓ ↔ Inv 50073 |
| 02 Apr 2026 | Invoice | 50072 | DN-21861 | LPG | 2,527.19 | -1,710.19 | T0028 EXACT_SINGLE ✓ ↔ Pmt 43928 |
| 02 Apr 2026 | Invoice | 50073 | DN-21861-EMPTY | CYL | 2,415.00 | 704.81 | T0014 CN_DN_PAIR ✓ ↔ Crd Note 14710 |
| 02 Apr 2026 | Invoice | 50097 | DN#21861- EXTRA SV | CYL | 1,207.50 | 1,912.31 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 45216, Inv 50363 |
| 02 Apr 2026 | Invoice | 50097 | DN#21861- EXTRA SV | LPG | 1,407.60 | 3,319.91 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 45216, Inv 50363 |
| 08 Apr 2026 | Payment | 43928 | TRANSF \| STAT 125 | LPG | -2,527.19 | 792.72 | T0028 EXACT_SINGLE ✓ ↔ Inv 50072 |
| 16 Apr 2026 | Crd Note | 14792 | FAULTY RETURN | CYL | -1,207.50 | -414.78 | OPEN |
| 16 Apr 2026 | Crd Note | 14792 | FAULTY RETURN | LPG | -498.53 | -913.31 | OPEN |
| 24 Apr 2026 | Crd Note | 14803 | DN-22341-EMPTY | CYL | -2,415.00 | -3,328.31 | T0015 CN_DN_PAIR ✓ ↔ Inv 50364 |
| 24 Apr 2026 | Invoice | 50363 | DN-22341 | LPG | 2,815.20 | -513.11 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 45216, Inv 50097 |
| 24 Apr 2026 | Invoice | 50364 | DN-22341-EMPTY | CYL | 2,415.00 | 1,901.89 | T0015 CN_DN_PAIR ✓ ↔ Crd Note 14803 |

### June 2026

Opening balance (ERP running): **R1,901.89**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Jun 2026 | Crd Note | 15052 | DN#22477-EMPTIES | CYL | -2,415.00 | -513.11 | T0016 CN_DN_PAIR ✓ ↔ Inv 51176 |
| 12 Jun 2026 | Invoice | 51175 | DN#22477 | LPG | 3,109.32 | 2,596.21 | T0029 EXACT_SINGLE ✓ ↔ Pmt 44746 |
| 12 Jun 2026 | Invoice | 51176 | DN#22477-EMPTIES | CYL | 2,415.00 | 5,011.21 | T0016 CN_DN_PAIR ✓ ↔ Crd Note 15052 |
| 18 Jun 2026 | Payment | 44746 | TRANSF \| STAT 127 | LPG | -3,109.32 | 1,901.89 | T0029 EXACT_SINGLE ✓ ↔ Inv 51175 |

### July 2026

Opening balance (ERP running): **R1,901.89**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Jul 2026 | Crd Note | 15263 | DN#22820=EMPTIES | CYL | -2,415.00 | -513.11 | T0017 CN_DN_PAIR ✓ ↔ Inv 51847 |
| 15 Jul 2026 | Payment | 45216 | TRANSF \| STAT 128 | LPG | -5,430.30 | -5,943.41 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Inv 50363, Inv 50097 |
| 15 Jul 2026 | Invoice | 51846 | DN#22820 | LPG | 3,123.10 | -2,820.31 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 45589 |
| 15 Jul 2026 | Invoice | 51847 | DN#22820=EMPTIES | CYL | 2,415.00 | -405.31 | T0017 CN_DN_PAIR ✓ ↔ Crd Note 15263 |
| 20 Jul 2026 | Invoice | 51952 | DN#22696 | LPG | 3,123.10 | 2,717.79 | OPEN |
| 20 Jul 2026 | Invoice | 51953 | DN#22696-EMPTY | CYL | 2,415.00 | 5,132.79 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 15303 |
| 22 Jul 2026 | Crd Note | 15303 | DN#22696-EMPTY | CYL | -2,415.00 | 2,717.79 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Inv 51953 |

### August 2026

Opening balance (ERP running): **R2,717.79**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Aug 2026 | Payment | 45589 | TRANSF \| STAT 129 | LPG | -3,123.00 | -405.21 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Inv 51846 |
| 31 Aug 2026 | Crd Note | 15578 | DN#23990-EMPTY | CYL | -4,830.00 | -5,235.21 | T0018 CN_DN_PAIR ✓ ↔ Inv 52880 |
| 31 Aug 2026 | Invoice | 52879 | DN#23990 | LPG | 5,528.60 | 293.39 | T0030 EXACT_SINGLE ✓ ↔ Pmt 46003 |
| 31 Aug 2026 | Invoice | 52880 | DN#23990-EMPTY | CYL | 4,830.00 | 5,123.39 | T0018 CN_DN_PAIR ✓ ↔ Crd Note 15578 |

### September 2026

Opening balance (ERP running): **R5,123.39**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Sept 2026 | Payment | 46003 | TRANSF \| STAT 130 | LPG | -5,528.60 | -405.21 | T0030 EXACT_SINGLE ✓ ↔ Inv 52879 |

### October 2026

Opening balance (ERP running): **R-405.21**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Oct 2026 | Crd Note | 15750 | DN#23829-EMPTY | CYL | -2,415.00 | -2,820.21 | T0019 CN_DN_PAIR ✓ ↔ Inv 53433 |
| 02 Oct 2026 | Invoice | 53432 | DN#23829 | LPG | 2,822.45 | 2.24 | OPEN |
| 02 Oct 2026 | Invoice | 53433 | DN#23829-EMPTY | CYL | 2,415.00 | 2,417.24 | T0019 CN_DN_PAIR ✓ ↔ Crd Note 15750 |

---

## Ties by rule

| Rule | Confirmed | Probable |
| :--- | ---: | ---: |
| LOCKED | 4 | 0 |
| CN_DN_PAIR | 15 | 0 |
| EXACT_SINGLE | 10 | 0 |
| EXACT_MONTH_SUM | 1 | 0 |

Proof: holds (rebuilt R2,417.24 vs closing R2,417.24; ERP R2,417.24).

