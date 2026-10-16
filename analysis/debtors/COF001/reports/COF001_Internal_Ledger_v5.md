# Internal ledger: COFFEEBERRY-CASCADES (COF001), matcher review
**INTERNAL, not for the customer.** Every transaction in ERP order with the ERP running balance and what matcher v5 did with it · generated 2026-10-16 · 219 confirmed / 0 probable ties · 50 rows open · ERP `CURRENT BALANCE` R-16,256.52 · matcher v5 ratified 2026-10-10; probable ties are proposals until approved · **REVIEW ONLY:** ingestCoverage partial

**Status key:** `OPEN` untied · `T0001 EXACT_SINGLE ✓` confirmed tie · `T0001 BATCH_SUM ?` probable tie (needs approval) · `LOCKED` operator-approved lock · `◀ ZERO` ERP running balance is within R0.05 after this line.

---

### March 2022

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Mar 2022 | Crd Note | 3283 | — | CYL | -1,035.00 | -1,035.00 | T0006 LOCKED:OPERATOR_RULING [exact] ↔ Inv 12420 |

### March 2023

Opening balance (ERP running): **R-1,035.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Mar 2023 | Crd Note | 4598 | D/N 3382 EMPTIES | CYL | -1,035.00 | -2,070.00 | T0023 CN_DN_PAIR ✓ ↔ Inv 18353 |

### September 2023

Opening balance (ERP running): **R-2,070.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 29 Sept 2023 | Payment | 24732 | TRANSF \| STAT: 95 | LPG | -6,625.90 | -8,695.90 | T0140 EXACT_SINGLE ✓ ↔ Inv 24815 |

### March 2024

Opening balance (ERP running): **R-8,695.90**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Mar 2024 | Invoice | 30007 | D/N 7885 | LPG | 8,390.33 | -305.57 | T0149 EXACT_SINGLE ✓ ↔ Pmt 29646 |

### March 2022

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Mar 2022 | Invoice | 12420 | — | CYL | 1,035.00 | 729.43 | T0006 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 3283 |
| 01 Mar 2022 | Invoice | 12420 | — | LPG | 838.01 | 1,567.44 | T0086 EXACT_SINGLE ✓ ↔ Pmt 12928 |

### March 2023

Opening balance (ERP running): **R-1,035.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Mar 2023 | Invoice | 18332 | D/N 3382 | LPG | 945.44 | 2,512.88 | T0120 EXACT_SINGLE ✓ ↔ Pmt 19066 |

### March 2024

Opening balance (ERP running): **R-8,695.90**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Mar 2024 | Invoice | 30276 | — | LPG | 7,628.30 | 10,141.18 | T0148 EXACT_SINGLE ✓ ↔ Pmt 30219 |
| 12 Mar 2024 | Payment | 30219 | TRANSF \| STAT:101 | LPG | -7,628.30 | 2,512.88 | T0148 EXACT_SINGLE ✓ ↔ Inv 30276 |

### March 2023

Opening balance (ERP running): **R-1,035.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Mar 2023 | Invoice | 18353 | D/N 3382 EMPTIES | CYL | 1,035.00 | 3,547.88 | T0023 CN_DN_PAIR ✓ ↔ Crd Note 4598 |

### March 2022

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Mar 2022 | Payment | 12928 | TRANSF \| STAT197 | LPG | -838.01 | 2,709.87 | T0086 EXACT_SINGLE ✓ ↔ Inv 12420 |

### March 2024

Opening balance (ERP running): **R-8,695.90**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Mar 2024 | Payment | 29646 | TRANSF \| STAT:101 | LPG | -8,390.33 | -5,680.46 | T0149 EXACT_SINGLE ✓ ↔ Inv 30007 |
| 20 Mar 2024 | Crd Note | 7772 | DN#3793 SO#7975 | LPG | -3,051.32 | -8,731.78 | T0038 CN_DN_PAIR ✓ ↔ Inv 30571 |

### March 2022

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Mar 2022 | Crd Note | 3292 | — | CYL | -1,725.00 | -10,456.78 | T0007 LOCKED:OPERATOR_RULING [exact] ↔ Inv 12454 |

### March 2023

Opening balance (ERP running): **R-1,035.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Mar 2023 | Invoice | 18384 | D/N 3386 | LPG | 8,403.74 | -2,053.04 | T0122 EXACT_SINGLE ✓ ↔ Pmt 19720 |

### March 2024

Opening balance (ERP running): **R-8,695.90**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Mar 2024 | Invoice | 30571 | DN#3793 SO#7975 | LPG | 3,051.32 | 998.28 | T0038 CN_DN_PAIR ✓ ↔ Crd Note 7772 |
| 25 Mar 2024 | Payment | 29696 | TRANSF \| STAT:101 | LPG | -8,486.48 | -7,488.20 | T0150 EXACT_SINGLE ✓ ↔ Inv 30576 |

### March 2022

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Mar 2022 | Invoice | 12454 | — | CYL | 1,725.00 | -5,763.20 | T0007 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 3292 |
| 04 Mar 2022 | Invoice | 12454 | — | LPG | 7,593.62 | 1,830.42 | T0087 EXACT_SINGLE ✓ ↔ Pmt 13232 |

### March 2023

Opening balance (ERP running): **R-1,035.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 13 Mar 2023 | Payment | 19066 | TRANSF \| STAT: 89 | LPG | -945.44 | 884.98 | T0120 EXACT_SINGLE ✓ ↔ Inv 18332 |

### March 2024

Opening balance (ERP running): **R-8,695.90**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Mar 2024 | Invoice | 30576 | DN#3793 SO#7979 | LPG | 8,486.48 | 9,371.46 | T0150 EXACT_SINGLE ✓ ↔ Pmt 29696 |

### November 2024

Opening balance (ERP running): **R9,371.46**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Nov 2024 | Payment | 44844 | TRANSF \| STAT:109 | LPG | -7,224.65 | 2,146.81 | OPEN |

### March 2022

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Mar 2022 | Payment | 13232 | TRANSF \| STAT197 | LPG | -7,593.60 | -5,446.79 | T0087 EXACT_SINGLE ✓ ↔ Inv 12454 |

### March 2023

Opening balance (ERP running): **R-1,035.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Mar 2023 | Payment | 19056 | TRANSF \| STAT: 89 | LPG | -8,400.00 | -13,846.79 | T0121 EXACT_SINGLE ✓ ↔ Inv 18037 |

### April 2024

Opening balance (ERP running): **R-13,846.79**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Apr 2024 | Crd Note | 7906 | DN#8860 SO#8082 | LPG | -8,486.48 | -22,333.27 | T0039 CN_DN_PAIR ✓ ↔ Inv 30890 |

### December 2024

Opening balance (ERP running): **R-22,333.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Dec 2024 | Journal | 476 | — | LPG | 7,224.65 | -15,108.62 | OPEN |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Mar 2025 | Crd Note | 12009 | DN#11727-EMPTY | CYL | -6,037.50 | -21,146.12 | T0047 CN_DN_PAIR ✓ ↔ Inv 41239 |

### March 2022

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Mar 2022 | Invoice | 12619 | — | LPG | 8,163.16 | -12,982.96 | T0088 EXACT_SINGLE ✓ ↔ Pmt 13247 |

### March 2023

Opening balance (ERP running): **R-1,035.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Mar 2023 | Payment | 19720 | TRANSF \| STAT: 89 | LPG | -8,403.74 | -21,386.70 | T0122 EXACT_SINGLE ✓ ↔ Inv 18384 |

### April 2024

Opening balance (ERP running): **R-13,846.79**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Apr 2024 | Invoice | 30890 | DN#8860 SO#8082 | LPG | 8,486.48 | -12,900.22 | T0039 CN_DN_PAIR ✓ ↔ Crd Note 7906 |

### March 2022

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 22 Mar 2022 | Payment | 13247 | TRANSF \| STAT197 | LPG | -8,163.16 | -21,063.38 | T0088 EXACT_SINGLE ✓ ↔ Inv 12619 |

### March 2023

Opening balance (ERP running): **R-1,035.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 Mar 2023 | Invoice | 18688 | D/N 3920 | LPG | 8,403.74 | -12,659.64 | T0123 EXACT_SINGLE ✓ ↔ Pmt 19495 |

### April 2024

Opening balance (ERP running): **R-13,846.79**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Apr 2024 | Invoice | 30918 | DN#8093 SO#8090 | LPG | 8,486.48 | -4,173.16 | T0151 EXACT_SINGLE ✓ ↔ Pmt 29994 |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Mar 2025 | Invoice | 41238 | DN#11727 | LPG | 7,638.42 | 3,465.26 | OPEN |
| 05 Mar 2025 | Invoice | 41239 | DN#11727-EMPTY | CYL | 6,037.50 | 9,502.76 | T0047 CN_DN_PAIR ✓ ↔ Crd Note 12009 |

### March 2022

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 31 Mar 2022 | Invoice | 12750 | — | LPG | 8,447.91 | 17,950.67 | T0089 EXACT_SINGLE ✓ ↔ Pmt 13430 |

### March 2023

Opening balance (ERP running): **R-1,035.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 28 Mar 2023 | Invoice | 18836 | D/N 3938 | LPG | 945.44 | 18,896.11 | T0124 EXACT_SINGLE ✓ ↔ Pmt 19505 |

### April 2024

Opening balance (ERP running): **R-13,846.79**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Apr 2024 | Payment | 29994 | TRANSF \| STAT:102 | LPG | -8,486.48 | 10,409.63 | T0151 EXACT_SINGLE ✓ ↔ Inv 30918 |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Mar 2025 | Crd Note | 12089 | DN#12932-EMPTY | CYL | -7,072.50 | 3,337.13 | T0048 CN_DN_PAIR ✓ ↔ Inv 41563 |

### April 2022

Opening balance (ERP running): **R3,337.13**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Apr 2022 | Payment | 13430 | TRANSF \| STAT198 | LPG | -8,447.91 | -5,110.78 | T0089 EXACT_SINGLE ✓ ↔ Inv 12750 |

### March 2023

Opening balance (ERP running): **R-1,035.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 28 Mar 2023 | Payment | 19495 | TRANSF \| STAT: 89 | LPG | -8,403.74 | -13,514.52 | T0123 EXACT_SINGLE ✓ ↔ Inv 18688 |

### April 2024

Opening balance (ERP running): **R-13,846.79**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Apr 2024 | Payment | 29492 | TRANSF \| STAT:102 | LPG | -7,628.30 | -21,142.82 | OPEN |

### April 2022

Opening balance (ERP running): **R3,337.13**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 13 Apr 2022 | Invoice | 12930 | — | LPG | 8,725.58 | -12,417.24 | T0090 EXACT_SINGLE ✓ ↔ Pmt 13577 |

### March 2023

Opening balance (ERP running): **R-1,035.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 30 Mar 2023 | Payment | 19505 | TRANSF \| STAT: 89 | LPG | -945.44 | -13,362.68 | T0124 EXACT_SINGLE ✓ ↔ Inv 18836 |

### April 2024

Opening balance (ERP running): **R-13,846.79**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Apr 2024 | Invoice | 31431 | DN#8893 | LPG | 7,589.65 | -5,773.03 | T0152 EXACT_SINGLE ✓ ↔ Pmt 30279 |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Mar 2025 | Invoice | 41562 | DN#12932 | LPG | 8,211.30 | 2,438.27 | OPEN |
| 18 Mar 2025 | Invoice | 41563 | DN#12932-EMPTY | CYL | 7,072.50 | 9,510.77 | T0048 CN_DN_PAIR ✓ ↔ Crd Note 12089 |

### April 2022

Opening balance (ERP running): **R3,337.13**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 16 Apr 2022 | Payment | 13577 | TRANSF \| STAT198 | LPG | -8,725.58 | 785.19 | T0090 EXACT_SINGLE ✓ ↔ Inv 12930 |

### April 2023

Opening balance (ERP running): **R785.19**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Apr 2023 | Invoice | 18978 | D/N 3956 | LPG | 8,403.74 | 9,188.93 | T0125 EXACT_SINGLE ✓ ↔ Pmt 19689 |

### April 2024

Opening balance (ERP running): **R-13,846.79**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 22 Apr 2024 | Payment | 30279 | TRANSF \| STAT:102 | LPG | -7,589.65 | 1,599.28 | T0152 EXACT_SINGLE ✓ ↔ Inv 31431 |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Mar 2025 | Invoice | 41576 | D/N 11836 RENTAL FEB | CYL | 250.00 | 1,849.28 | OPEN |

### April 2022

Opening balance (ERP running): **R3,337.13**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 25 Apr 2022 | Invoice | 13110 | — | LPG | 8,725.56 | 10,574.84 | T0091 EXACT_SINGLE ✓ ↔ Pmt 13563 |

### April 2023

Opening balance (ERP running): **R785.19**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Apr 2023 | Payment | 19689 | TRANSF \| STAT: 90 | LPG | -8,403.74 | 2,171.10 | T0125 EXACT_SINGLE ✓ ↔ Inv 18978 |

### April 2024

Opening balance (ERP running): **R-13,846.79**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 29 Apr 2024 | Invoice | 31699 | DN#8831 | LPG | 853.84 | 3,024.94 | T0153 EXACT_SINGLE ✓ ↔ Pmt 30458 |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Mar 2025 | Invoice | 41577 | D/N 11836 MAR RENTAL | CYL | 250.00 | 3,274.94 | OPEN |

### April 2022

Opening balance (ERP running): **R3,337.13**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 28 Apr 2022 | Payment | 13563 | TRANSF \| STAT198 | LPG | -8,725.56 | -5,450.62 | T0091 EXACT_SINGLE ✓ ↔ Inv 13110 |

### April 2023

Opening balance (ERP running): **R785.19**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Apr 2023 | Invoice | 19400 | D/N 4708 | LPG | 8,827.62 | 3,377.00 | T0126 EXACT_SINGLE ✓ ↔ Pmt 20487 |

### May 2024

Opening balance (ERP running): **R3,377.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 May 2024 | Payment | 30458 | TRANSF \| STAT:103 | LPG | -853.84 | 2,523.16 | T0153 EXACT_SINGLE ✓ ↔ Inv 31699 |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Mar 2025 | Invoice | 41578 | D/N 12851 FEB RENTAL | CYL | 250.00 | 2,773.16 | OPEN |

### May 2022

Opening balance (ERP running): **R2,773.16**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 May 2022 | Invoice | 13349 | — | LPG | 8,915.13 | 11,688.29 | T0092 EXACT_SINGLE ✓ ↔ Pmt 13973 |

### May 2023

Opening balance (ERP running): **R11,688.29**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 May 2023 | Payment | 20487 | TRANSF \| STAT: 91 | LPG | -8,827.62 | 2,860.67 | T0126 EXACT_SINGLE ✓ ↔ Inv 19400 |

### May 2024

Opening balance (ERP running): **R3,377.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 May 2024 | Invoice | 31803 | DN#8843 | LPG | 7,589.65 | 10,450.32 | T0154 EXACT_SINGLE ✓ ↔ Pmt 30635 |

### May 2023

Opening balance (ERP running): **R11,688.29**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 May 2023 | Crd Note | 4837 | D/N 4731 EMPTIES | CYL | -2,760.00 | 7,690.32 | T0024 CN_DN_PAIR ✓ ↔ Inv 19881 |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Mar 2025 | Invoice | 41579 | D/N 12851 MARCH RENT | CYL | 250.00 | 7,940.32 | OPEN |

### May 2022

Opening balance (ERP running): **R2,773.16**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 May 2022 | Invoice | 13593 | — | LPG | 8,292.08 | 16,232.40 | T0093 EXACT_SINGLE ✓ ↔ Pmt 13974 |

### May 2024

Opening balance (ERP running): **R3,377.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 May 2024 | Payment | 30635 | TRANSF \| STAT:103 | LPG | -7,589.65 | 8,642.75 | T0154 EXACT_SINGLE ✓ ↔ Inv 31803 |

### May 2022

Opening balance (ERP running): **R2,773.16**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 24 May 2022 | Payment | 13973 | TRANSF \| STAT199 | LPG | -8,915.13 | -272.38 | T0092 EXACT_SINGLE ✓ ↔ Inv 13349 |

### May 2023

Opening balance (ERP running): **R11,688.29**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 May 2023 | Invoice | 19867 | D/N 4731 | LPG | 9,135.56 | 8,863.18 | T0127 EXACT_SINGLE ✓ ↔ Pmt 20666 |

### May 2024

Opening balance (ERP running): **R3,377.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 May 2024 | Invoice | 32280 | DN#8471 | LPG | 8,339.36 | 17,202.54 | T0155 EXACT_SINGLE ✓ ↔ Pmt 31367 |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 19 Mar 2025 | Payment | 37628 | TRANSF \| STAT:113 | LPG | -250.00 | 16,952.54 | OPEN |

### May 2023

Opening balance (ERP running): **R11,688.29**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 May 2023 | Invoice | 19881 | D/N 4731 EMPTIES | CYL | 2,760.00 | 19,712.54 | T0024 CN_DN_PAIR ✓ ↔ Crd Note 4837 |

### May 2022

Opening balance (ERP running): **R2,773.16**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 24 May 2022 | Payment | 13974 | TRANSF \| STAT199 | LPG | -8,292.08 | 11,420.46 | T0093 EXACT_SINGLE ✓ ↔ Inv 13593 |

### May 2024

Opening balance (ERP running): **R3,377.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 27 May 2024 | Payment | 31367 | TRANSF \| STAT:103 | LPG | -8,339.36 | 3,081.10 | T0155 EXACT_SINGLE ✓ ↔ Inv 32280 |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 19 Mar 2025 | Payment | 37629 | TRANSF \| STAT:113 | LPG | -250.00 | 2,831.10 | OPEN |

### May 2022

Opening balance (ERP running): **R2,773.16**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 28 May 2022 | Invoice | 13712 | D/N1060 | LPG | 9,224.92 | 12,056.02 | T0094 EXACT_SINGLE ✓ ↔ Pmt 14441 |

### May 2023

Opening balance (ERP running): **R11,688.29**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 May 2023 | Payment | 20666 | TRANSF \| STAT: 91 | LPG | -9,135.56 | 2,920.46 | T0127 EXACT_SINGLE ✓ ↔ Inv 19867 |

### June 2024

Opening balance (ERP running): **R2,920.46**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Jun 2024 | Invoice | 32727 | DN#8524 | LPG | 8,339.36 | 11,259.82 | T0156 EXACT_SINGLE ✓ ↔ Pmt 31352 |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 19 Mar 2025 | Payment | 37630 | TRANSF \| STAT:113 | LPG | -250.00 | 11,009.82 | OPEN |

### June 2022

Opening balance (ERP running): **R11,009.82**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Jun 2022 | Crd Note | 3685 | — | CYL | -598.00 | 10,411.82 | OPEN |

### May 2023

Opening balance (ERP running): **R11,688.29**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 May 2023 | Invoice | 20063 | D/N 4186 | LPG | 7,287.78 | 17,699.60 | T0132 EXACT_SINGLE ✓ ↔ Pmt 22185 |

### June 2024

Opening balance (ERP running): **R2,920.46**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Jun 2024 | Payment | 31352 | TRANSF \| STAT:104 | LPG | -8,339.36 | 9,360.24 | T0156 EXACT_SINGLE ✓ ↔ Inv 32727 |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 19 Mar 2025 | Payment | 37631 | TRANSF \| STAT:113 | LPG | -250.00 | 9,110.24 | OPEN |

### June 2022

Opening balance (ERP running): **R11,009.82**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Jun 2022 | Crd Note | 3687 | — | CYL | -3,588.00 | 5,522.24 | OPEN |

### May 2023

Opening balance (ERP running): **R11,688.29**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 May 2023 | Payment | 23445 | TRANSF \| STAT: 91 | LPG | -8,827.62 | -3,305.38 | OPEN |

### June 2024

Opening balance (ERP running): **R2,920.46**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 19 Jun 2024 | Crd Note | 8895 | DN#9098 | LPG | -7,485.79 | -10,791.17 | T0040 CN_DN_PAIR ✓ ↔ Inv 33245 |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 19 Mar 2025 | Payment | 37633 | TRANSF \| STAT:113 | LPG | -8,784.18 | -19,575.35 | T0181 EXACT_SINGLE ✓ ↔ Inv 40942 |

### June 2022

Opening balance (ERP running): **R11,009.82**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Jun 2022 | Invoice | 13944 | — | LPG | 9,224.92 | -10,350.43 | T0095 EXACT_SINGLE ✓ ↔ Pmt 14442 |

### May 2023

Opening balance (ERP running): **R11,688.29**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 May 2023 | Invoice | 20545 | D/N 4776 | LPG | 7,834.35 | -2,516.08 | T0128 EXACT_SINGLE ✓ ↔ Pmt 21426 |

### June 2024

Opening balance (ERP running): **R2,920.46**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 19 Jun 2024 | Invoice | 33245 | DN#9098 | LPG | 7,485.79 | 4,969.71 | T0040 CN_DN_PAIR ✓ ↔ Crd Note 8895 |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 31 Mar 2025 | Crd Note | 12159 | DN:12973 | OTHER | -1,505.01 | 3,464.70 | T0049 CN_DN_PAIR ✓ ↔ Inv 41869 |

### June 2022

Opening balance (ERP running): **R11,009.82**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Jun 2022 | Invoice | 13956 | — | CYL | 4,784.00 | 8,248.70 | OPEN |

### May 2023

Opening balance (ERP running): **R11,688.29**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 30 May 2023 | Payment | 21426 | TRANSF \| STAT: 91 | LPG | -7,834.35 | 414.35 | T0128 EXACT_SINGLE ✓ ↔ Inv 20545 |

### June 2024

Opening balance (ERP running): **R2,920.46**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 19 Jun 2024 | Invoice | 33254 | DN#9098 | LPG | 8,026.93 | 8,441.28 | T0157 EXACT_SINGLE ✓ ↔ Pmt 31551 |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 31 Mar 2025 | Invoice | 41869 | DN:12973 | OTHER | 1,505.01 | 9,946.29 | T0049 CN_DN_PAIR ✓ ↔ Crd Note 12159 |

### June 2022

Opening balance (ERP running): **R11,009.82**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Jun 2022 | Payment | 14441 | TRANSF \| STAT200 | LPG | -9,224.92 | 721.37 | T0094 EXACT_SINGLE ✓ ↔ Inv 13712 |

### June 2023

Opening balance (ERP running): **R721.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Jun 2023 | Invoice | 21076 | D/N 5311 | LPG | 8,002.06 | 8,723.43 | T0129 EXACT_SINGLE ✓ ↔ Pmt 21559 |

### June 2024

Opening balance (ERP running): **R2,920.46**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 26 Jun 2024 | Payment | 31551 | TRANSF \| STAT:104 | LPG | -8,026.93 | 696.50 | T0157 EXACT_SINGLE ✓ ↔ Inv 33254 |

### March 2025

Opening balance (ERP running): **R-15,108.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 31 Mar 2025 | Invoice | 41870 | DN:12973 | OTHER | 838.35 | 1,534.85 | T0197 EXACT_SINGLE ✓ ↔ Pmt 41952 |

### June 2023

Opening balance (ERP running): **R721.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Jun 2023 | Crd Note | 5192 | D/N 4683 EMPTIES | CYL | -1,725.00 | -190.15 | T0025 CN_DN_PAIR ✓ ↔ Inv 21235 |

### April 2025

Opening balance (ERP running): **R-190.15**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Apr 2025 | Crd Note | 12176 | DN#4462-EMPTY | CYL | -8,625.00 | -8,815.15 | T0050 CN_DN_PAIR ✓ ↔ Inv 41931 |

### June 2022

Opening balance (ERP running): **R11,009.82**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Jun 2022 | Payment | 14442 | TRANSF \| STAT200 | LPG | -9,224.92 | -18,040.07 | T0095 EXACT_SINGLE ✓ ↔ Inv 13944 |

### July 2024

Opening balance (ERP running): **R-18,040.07**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Jul 2024 | Invoice | 33790 | DN#9759 | LPG | 8,026.93 | -10,013.14 | T0158 EXACT_SINGLE ✓ ↔ Pmt 32143 |

### June 2022

Opening balance (ERP running): **R11,009.82**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 21 Jun 2022 | Invoice | 14119 | — | LPG | 8,292.08 | -1,721.06 | T0096 EXACT_SINGLE ✓ ↔ Pmt 14554 |

### June 2023

Opening balance (ERP running): **R721.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Jun 2023 | Invoice | 21234 | D/N 4683 | LPG | 7,443.78 | 5,722.72 | T0130 EXACT_SINGLE ✓ ↔ Pmt 21687 |

### July 2024

Opening balance (ERP running): **R-18,040.07**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Jul 2024 | Payment | 32143 | TRANSF \| STAT:105 | LPG | -8,026.93 | -2,304.21 | T0158 EXACT_SINGLE ✓ ↔ Inv 33790 |

### April 2025

Opening balance (ERP running): **R-190.15**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Apr 2025 | Invoice | 41930 | DN#4462 | LPG | 9,070.63 | 6,766.42 | T0182 EXACT_SINGLE ✓ ↔ Pmt 38217 |

### June 2023

Opening balance (ERP running): **R721.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Jun 2023 | Invoice | 21235 | D/N 4683 EMPTIES | CYL | 1,725.00 | 8,491.42 | T0025 CN_DN_PAIR ✓ ↔ Crd Note 5192 |

### April 2025

Opening balance (ERP running): **R-190.15**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Apr 2025 | Invoice | 41931 | DN#4462-EMPTY | CYL | 8,625.00 | 17,116.42 | T0050 CN_DN_PAIR ✓ ↔ Crd Note 12176 |

### June 2022

Opening balance (ERP running): **R11,009.82**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 Jun 2022 | Payment | 14554 | TRANSF \| STAT200 | LPG | -8,292.08 | 8,824.34 | T0096 EXACT_SINGLE ✓ ↔ Inv 14119 |

### July 2024

Opening balance (ERP running): **R-18,040.07**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Jul 2024 | Crd Note | 9450 | DN#9824 | LPG | -7,705.92 | 1,118.42 | T0041 CN_DN_PAIR ✓ ↔ Inv 34412 |

### April 2025

Opening balance (ERP running): **R-190.15**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Apr 2025 | Crd Note | 12218 | DN#13004- SWAP | CYL | -1,207.50 | -89.08 | T0052 CN_DN_PAIR ✓ ↔ Inv 42061 |

### July 2022

Opening balance (ERP running): **R-89.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Jul 2022 | Invoice | 14312 | D/N 1234 | LPG | 8,913.97 | 8,824.89 | T0097 EXACT_SINGLE ✓ ↔ Pmt 14860 |

### June 2023

Opening balance (ERP running): **R721.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Jun 2023 | Payment | 21559 | TRANSF \| STAT: 92 | LPG | -8,002.06 | 822.83 | T0129 EXACT_SINGLE ✓ ↔ Inv 21076 |

### July 2024

Opening balance (ERP running): **R-18,040.07**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Jul 2024 | Invoice | 34412 | DN#9824 | LPG | 7,705.92 | 8,528.75 | T0041 CN_DN_PAIR ✓ ↔ Crd Note 9450 |

### April 2025

Opening balance (ERP running): **R-190.15**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Apr 2025 | Crd Note | 12218 | DN#13004- SWAP | LPG | -1,495.06 | 7,033.69 | T0051 CN_DN_PAIR ✓ ↔ Inv 42061 |
| 07 Apr 2025 | Invoice | 42061 | DN#13004- SWAP | CYL | 1,207.50 | 8,241.19 | T0052 CN_DN_PAIR ✓ ↔ Crd Note 12218 |

### July 2022

Opening balance (ERP running): **R-89.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Jul 2022 | Payment | 14860 | TRANSF \| STAT201 | LPG | -8,913.97 | -672.78 | T0097 EXACT_SINGLE ✓ ↔ Inv 14312 |

### June 2023

Opening balance (ERP running): **R721.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Jun 2023 | Payment | 21687 | TRANSF \| STAT: 92 | LPG | -7,443.78 | -8,116.56 | T0130 EXACT_SINGLE ✓ ↔ Inv 21234 |

### July 2024

Opening balance (ERP running): **R-18,040.07**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Jul 2024 | Invoice | 34418 | DN#9824 | LPG | 7,705.92 | -410.64 | T0159 EXACT_SINGLE ✓ ↔ Pmt 37733 |

### April 2025

Opening balance (ERP running): **R-190.15**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Apr 2025 | Invoice | 42061 | DN#13004- SWAP | LPG | 1,495.06 | 1,084.42 | T0051 CN_DN_PAIR ✓ ↔ Crd Note 12218 |

### June 2023

Opening balance (ERP running): **R721.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Jun 2023 | Crd Note | 5252 | D/N 4802 EMPTIES | CYL | -1,035.00 | 49.42 | T0026 CN_DN_PAIR ✓ ↔ Inv 21415 |

### July 2022

Opening balance (ERP running): **R-89.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Jul 2022 | Invoice | 14478 | D/N 1970 | LPG | 8,353.97 | 8,403.39 | T0098 EXACT_SINGLE ✓ ↔ Pmt 14970 |

### July 2024

Opening balance (ERP running): **R-18,040.07**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 26 Jul 2024 | Payment | 37733 | TRANSF \| STAT:105 | LPG | -7,705.92 | 697.47 | T0159 EXACT_SINGLE ✓ ↔ Inv 34418 |

### April 2025

Opening balance (ERP running): **R-190.15**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Apr 2025 | Payment | 38217 | TRANSF \| STAT:114 | LPG | -9,070.63 | -8,373.16 | T0182 EXACT_SINGLE ✓ ↔ Inv 41930 |
| 14 Apr 2025 | Crd Note | 12273 | DN#13063-EMPTY | CYL | -6,037.50 | -14,410.66 | T0053 CN_DN_PAIR ✓ ↔ Inv 42261 |

### July 2022

Opening balance (ERP running): **R-89.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Jul 2022 | Payment | 14970 | TRANSF \| STAT201 | LPG | -8,353.97 | -22,764.63 | T0098 EXACT_SINGLE ✓ ↔ Inv 14478 |

### June 2023

Opening balance (ERP running): **R721.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Jun 2023 | Invoice | 21379 | D/N 4802 | LPG | 837.42 | -21,927.21 | T0131 EXACT_SINGLE ✓ ↔ Pmt 21926 |

### August 2024

Opening balance (ERP running): **R-21,927.21**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Aug 2024 | Invoice | 34831 | D/N 9362 | LPG | 7,437.11 | -14,490.10 | T0160 EXACT_SINGLE ✓ ↔ Pmt 32620 |

### June 2023

Opening balance (ERP running): **R721.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Jun 2023 | Invoice | 21415 | D/N 4802 EMPTIES | CYL | 1,035.00 | -13,455.10 | T0026 CN_DN_PAIR ✓ ↔ Crd Note 5252 |

### July 2022

Opening balance (ERP running): **R-89.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 26 Jul 2022 | Invoice | 14717 | D/N 1535 | LPG | 8,957.88 | -4,497.22 | T0018 CN_DN_PAIR ✓ ↔ Crd Note 3759 |

### August 2024

Opening balance (ERP running): **R-21,927.21**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Aug 2024 | Payment | 32615 | TRANSF \| STAT:106 | LPG | -8,512.36 | -13,009.58 | T0015 UD_CLEARING ✓ |

### April 2025

Opening balance (ERP running): **R-190.15**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Apr 2025 | Invoice | 42260 | DN#13063 | LPG | 7,475.29 | -5,534.29 | T0183 EXACT_SINGLE ✓ ↔ Pmt 38242 |
| 14 Apr 2025 | Invoice | 42261 | DN#13063-EMPTY | CYL | 6,037.50 | 503.21 | T0053 CN_DN_PAIR ✓ ↔ Crd Note 12273 |

### July 2022

Opening balance (ERP running): **R-89.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 27 Jul 2022 | Crd Note | 3759 | D/N 1535 | LPG | -8,957.88 | -8,454.67 | T0018 CN_DN_PAIR ✓ ↔ Inv 14717 |

### June 2023

Opening balance (ERP running): **R721.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Jun 2023 | Payment | 21926 | TRANSF \| STAT: 92 | LPG | -837.42 | -9,292.09 | T0131 EXACT_SINGLE ✓ ↔ Inv 21379 |

### August 2024

Opening balance (ERP running): **R-21,927.21**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Aug 2024 | Bank UD | 32615 | TRANSF \| STAT:105 | LPG | 8,512.36 | -779.73 | T0015 UD_CLEARING ✓ |

### June 2023

Opening balance (ERP running): **R721.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 24 Jun 2023 | Crd Note | 5320 | D/N 5325 EMPTIES | CYL | -1,725.00 | -2,504.73 | T0027 CN_DN_PAIR ✓ ↔ Inv 21662 |

### July 2022

Opening balance (ERP running): **R-89.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 27 Jul 2022 | Invoice | 14749 | D/N 1137 | LPG | 8,957.88 | 6,453.15 | T0099 EXACT_SINGLE ✓ ↔ Pmt 15261 |

### August 2024

Opening balance (ERP running): **R-21,927.21**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Aug 2024 | Payment | 32620 | TRANSF \| STAT:106 | LPG | -7,437.11 | -983.96 | T0160 EXACT_SINGLE ✓ ↔ Inv 34831 |

### April 2025

Opening balance (ERP running): **R-190.15**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Apr 2025 | Payment | 38270 | TRANSF \| STAT:114 | LPG | -9,070.63 | -10,054.59 | OPEN |

### July 2022

Opening balance (ERP running): **R-89.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 29 Jul 2022 | Payment | 15261 | TRANSF \| STAT201 | LPG | -8,957.88 | -19,012.47 | T0099 EXACT_SINGLE ✓ ↔ Inv 14749 |

### June 2023

Opening balance (ERP running): **R721.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 24 Jun 2023 | Invoice | 21661 | D/N 5325 | LPG | 7,443.78 | -11,568.69 | T0133 EXACT_SINGLE ✓ ↔ Pmt 22180 |

### August 2024

Opening balance (ERP running): **R-21,927.21**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 19 Aug 2024 | Invoice | 35371 | DN#10879 | LPG | 7,974.73 | -3,593.96 | T0161 EXACT_SINGLE ✓ ↔ Pmt 32942 |

### April 2025

Opening balance (ERP running): **R-190.15**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 Apr 2025 | Payment | 38242 | TRANSF \| STAT:114 | LPG | -7,475.29 | -11,069.25 | T0183 EXACT_SINGLE ✓ ↔ Inv 42260 |

### August 2022

Opening balance (ERP running): **R-11,069.25**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Aug 2022 | Crd Note | 3779 | EMPTIES D/N 1540 | CYL | -2,990.00 | -14,059.25 | T0019 CN_DN_PAIR ✓ ↔ Inv 14878 |

### June 2023

Opening balance (ERP running): **R721.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 24 Jun 2023 | Invoice | 21662 | D/N 5325 EMPTIES | CYL | 1,725.00 | -12,334.25 | T0027 CN_DN_PAIR ✓ ↔ Crd Note 5320 |

### April 2025

Opening balance (ERP running): **R-190.15**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 29 Apr 2025 | Crd Note | 12370 | DN#13111-EMPTY | CYL | -1,035.00 | -13,369.25 | T0054 CN_DN_PAIR ✓ ↔ Inv 42615 |

### August 2024

Opening balance (ERP running): **R-21,927.21**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 22 Aug 2024 | Payment | 32942 | TRANSF \| STAT:106 | LPG | -7,974.73 | -21,343.98 | T0161 EXACT_SINGLE ✓ ↔ Inv 35371 |

### August 2022

Opening balance (ERP running): **R-11,069.25**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Aug 2022 | Crd Note | 3784 | EMPTIES | CYL | -2,990.00 | -24,333.98 | T0008 LOCKED:OPERATOR_RULING [exact] ↔ Inv 14866 |

### June 2023

Opening balance (ERP running): **R721.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 26 Jun 2023 | Payment | 22185 | TRANSF \| STAT: 92 | LPG | -7,287.78 | -31,621.76 | T0132 EXACT_SINGLE ✓ ↔ Inv 20063 |

### September 2024

Opening balance (ERP running): **R-31,621.76**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Sept 2024 | Invoice | 36047 | DN#11573 | LPG | 7,168.30 | -24,453.46 | T0164 EXACT_SINGLE ✓ ↔ Pmt 33618 |

### April 2025

Opening balance (ERP running): **R-190.15**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 29 Apr 2025 | Invoice | 42614 | DN#13111 | LPG | 560.65 | -23,892.81 | OPEN |
| 29 Apr 2025 | Invoice | 42615 | DN#13111-EMPTY | CYL | 1,035.00 | -22,857.81 | T0054 CN_DN_PAIR ✓ ↔ Crd Note 12370 |

### August 2022

Opening balance (ERP running): **R-11,069.25**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Aug 2022 | Invoice | 14860 | D/N 1540 | LPG | 6,743.57 | -16,114.24 | T0100 EXACT_SINGLE ✓ ↔ Pmt 15414 |

### June 2023

Opening balance (ERP running): **R721.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 29 Jun 2023 | Payment | 22180 | TRANSF \| STAT: 92 | LPG | -7,443.78 | -23,558.02 | T0133 EXACT_SINGLE ✓ ↔ Inv 21661 |

### September 2024

Opening balance (ERP running): **R-31,621.76**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Sept 2024 | Invoice | 36109 | D/N 11268 | LPG | 7,369.88 | -16,188.14 | T0162 EXACT_SINGLE ✓ ↔ Pmt 33629 |

### August 2022

Opening balance (ERP running): **R-11,069.25**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Aug 2022 | Invoice | 14866 | EMPTIES | CYL | 2,990.00 | -13,198.14 | T0008 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 3784 |

### July 2023

Opening balance (ERP running): **R-13,198.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Jul 2023 | Crd Note | 5410 | D/N 4851 EMPTIES | CYL | -2,415.00 | -15,613.14 | T0028 CN_DN_PAIR ✓ ↔ Inv 21943 |

### May 2025

Opening balance (ERP running): **R-15,613.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 May 2025 | Crd Note | 12396 | DN#13183- EMPTY | CYL | -8,107.50 | -23,720.64 | T0055 CN_DN_PAIR ✓ ↔ Inv 42749 |

### September 2024

Opening balance (ERP running): **R-31,621.76**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Sept 2024 | Crd Note | 10298 | DN#11593 | LPG | -4,794.87 | -28,515.51 | T0042 CN_DN_PAIR ✓ ↔ Inv 36358 |

### August 2022

Opening balance (ERP running): **R-11,069.25**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Aug 2022 | Invoice | 14878 | EMPTIES D/N 1540 | CYL | 2,990.00 | -25,525.51 | T0019 CN_DN_PAIR ✓ ↔ Crd Note 3779 |

### July 2023

Opening balance (ERP running): **R-13,198.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Jul 2023 | Invoice | 21940 | D/N 4851 | LPG | 8,002.06 | -17,523.45 | T0134 EXACT_SINGLE ✓ ↔ Pmt 22703 |

### September 2024

Opening balance (ERP running): **R-31,621.76**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Sept 2024 | Invoice | 36265 | DN#11593 | LPG | 7,902.65 | -9,620.80 | T0163 EXACT_SINGLE ✓ ↔ Pmt 33627 |

### May 2025

Opening balance (ERP running): **R-15,613.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 May 2025 | Invoice | 42748 | DN#13183 | LPG | 8,596.58 | -1,024.22 | T0192 EXACT_SINGLE ✓ ↔ Pmt 41285 |

### July 2023

Opening balance (ERP running): **R-13,198.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Jul 2023 | Invoice | 21943 | D/N 4851 EMPTIES | CYL | 2,415.00 | 1,390.78 | T0028 CN_DN_PAIR ✓ ↔ Crd Note 5410 |

### May 2025

Opening balance (ERP running): **R-15,613.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 May 2025 | Invoice | 42749 | DN#13183- EMPTY | CYL | 8,107.50 | 9,498.28 | T0055 CN_DN_PAIR ✓ ↔ Crd Note 12396 |

### August 2022

Opening balance (ERP running): **R-11,069.25**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Aug 2022 | Payment | 15414 | TRANSF \| STAT202 | LPG | -6,743.57 | 2,754.71 | T0100 EXACT_SINGLE ✓ ↔ Inv 14860 |

### September 2024

Opening balance (ERP running): **R-31,621.76**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Sept 2024 | Invoice | 36358 | DN#11593 | LPG | 4,794.87 | 7,549.58 | T0042 CN_DN_PAIR ✓ ↔ Crd Note 10298 |

### May 2025

Opening balance (ERP running): **R-15,613.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 May 2025 | Crd Note | 12429 | DN#12064-EMPTY | CYL | -6,037.50 | 1,512.08 | T0056 CN_DN_PAIR ✓ ↔ Inv 42876 |

### August 2022

Opening balance (ERP running): **R-11,069.25**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Aug 2022 | Crd Note | 3861 | NO DELIVERY D/N1774 | LPG | -8,784.92 | -7,272.84 | T0020 CN_DN_PAIR ✓ ↔ Inv 15087 |

### July 2023

Opening balance (ERP running): **R-13,198.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Jul 2023 | Payment | 22703 | TRANSF \| STAT: 93 | LPG | -8,002.06 | -15,274.90 | T0134 EXACT_SINGLE ✓ ↔ Inv 21940 |

### September 2024

Opening balance (ERP running): **R-31,621.76**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 16 Sept 2024 | Payment | 33629 | TRANSF \| STAT:107 | LPG | -7,369.88 | -22,644.78 | T0162 EXACT_SINGLE ✓ ↔ Inv 36109 |

### July 2023

Opening balance (ERP running): **R-13,198.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Jul 2023 | Crd Note | 5505 | D/N 5282 EMPTIES | CYL | -2,760.00 | -25,404.78 | T0029 CN_DN_PAIR ✓ ↔ Inv 22270 |

### August 2022

Opening balance (ERP running): **R-11,069.25**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Aug 2022 | Invoice | 15087 | D/N 1774 | LPG | 8,784.92 | -16,619.86 | T0020 CN_DN_PAIR ✓ ↔ Crd Note 3861 |

### September 2024

Opening balance (ERP running): **R-31,621.76**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Sept 2024 | Payment | 33627 | TRANSF \| STAT:107 | LPG | -7,902.65 | -24,522.51 | T0163 EXACT_SINGLE ✓ ↔ Inv 36265 |

### May 2025

Opening balance (ERP running): **R-15,613.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 May 2025 | Invoice | 42875 | DN#12064 | LPG | 7,475.29 | -17,047.22 | OPEN |
| 07 May 2025 | Invoice | 42876 | DN#12064-EMPTY | CYL | 6,037.50 | -11,009.72 | T0056 CN_DN_PAIR ✓ ↔ Crd Note 12429 |

### August 2022

Opening balance (ERP running): **R-11,069.25**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Aug 2022 | Invoice | 15169 | D/N 1734 | LPG | 8,784.92 | -2,224.80 | T0101 EXACT_SINGLE ✓ ↔ Pmt 15670 |

### July 2023

Opening balance (ERP running): **R-13,198.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Jul 2023 | Invoice | 22252 | D/N 5282 | LPG | 7,596.15 | 5,371.35 | OPEN |

### September 2024

Opening balance (ERP running): **R-31,621.76**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Sept 2024 | Payment | 33618 | TRANSF \| STAT:107 | LPG | -7,168.30 | -1,796.95 | T0164 EXACT_SINGLE ✓ ↔ Inv 36047 |

### July 2023

Opening balance (ERP running): **R-13,198.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Jul 2023 | Invoice | 22270 | D/N 5282 EMPTIES | CYL | 2,760.00 | 963.05 | T0029 CN_DN_PAIR ✓ ↔ Crd Note 5505 |

### May 2025

Opening balance (ERP running): **R-15,613.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 May 2025 | Crd Note | 12547 | DN#12110-EMPTY | CYL | -6,037.50 | -5,074.45 | T0057 CN_DN_PAIR ✓ ↔ Inv 43288 |

### August 2022

Opening balance (ERP running): **R-11,069.25**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 22 Aug 2022 | Payment | 15670 | TRANSF \| STAT202 | LPG | -8,784.92 | -13,859.37 | T0101 EXACT_SINGLE ✓ ↔ Inv 15169 |

### October 2024

Opening balance (ERP running): **R-13,859.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Oct 2024 | Invoice | 36863 | DN#10385 | LPG | 7,902.65 | -5,956.72 | T0165 EXACT_SINGLE ✓ ↔ Pmt 33989 |

### September 2022

Opening balance (ERP running): **R-5,956.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Sept 2022 | Crd Note | 4012 | D/N 2048 EMPTIES | CYL | -4,784.00 | -10,740.72 | T0021 CN_DN_PAIR ✓ ↔ Inv 15477 |

### July 2023

Opening balance (ERP running): **R-13,198.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 27 Jul 2023 | Crd Note | 5688 | D/N 5846 EMPTIES | CYL | -2,415.00 | -13,155.72 | T0030 CN_DN_PAIR ✓ ↔ Inv 22841 |

### October 2024

Opening balance (ERP running): **R-13,859.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Oct 2024 | Payment | 33989 | TRANSF \| STAT:108 | LPG | -7,902.65 | -21,058.37 | T0165 EXACT_SINGLE ✓ ↔ Inv 36863 |

### May 2025

Opening balance (ERP running): **R-15,613.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 May 2025 | Invoice | 43287 | DN#12110 | LPG | 7,571.31 | -13,487.06 | OPEN |
| 23 May 2025 | Invoice | 43288 | DN#12110-EMPTY | CYL | 6,037.50 | -7,449.56 | T0057 CN_DN_PAIR ✓ ↔ Crd Note 12547 |

### September 2022

Opening balance (ERP running): **R-5,956.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Sept 2022 | Invoice | 15470 | D/N 2048 | LPG | 9,091.37 | 1,641.81 | T0102 EXACT_SINGLE ✓ ↔ Pmt 15897 |

### July 2023

Opening balance (ERP running): **R-13,198.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 27 Jul 2023 | Invoice | 22840 | D/N 5846 | LPG | 7,340.05 | 8,981.86 | T0135 EXACT_SINGLE ✓ ↔ Pmt 23099 |

### October 2024

Opening balance (ERP running): **R-13,859.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Oct 2024 | Invoice | 37197 | DN#10424 | LPG | 7,150.13 | 16,131.99 | T0166 EXACT_SINGLE ✓ ↔ Pmt 34139 |

### September 2022

Opening balance (ERP running): **R-5,956.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Sept 2022 | Invoice | 15477 | D/N 2048 EMPTIES | CYL | 4,784.00 | 20,915.99 | T0021 CN_DN_PAIR ✓ ↔ Crd Note 4012 |

### July 2023

Opening balance (ERP running): **R-13,198.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 27 Jul 2023 | Invoice | 22841 | D/N 5846 EMPTIES | CYL | 2,415.00 | 23,330.99 | T0030 CN_DN_PAIR ✓ ↔ Crd Note 5688 |

### October 2024

Opening balance (ERP running): **R-13,859.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Oct 2024 | Payment | 34139 | TRANSF \| STAT:108 | LPG | -7,150.13 | 16,180.86 | T0166 EXACT_SINGLE ✓ ↔ Inv 37197 |

### June 2025

Opening balance (ERP running): **R16,180.86**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Jun 2025 | Payment | 39144 | TRANSF \| STAT:116 | LPG | -6,446.60 | 9,734.26 | OPEN |
| 06 Jun 2025 | Crd Note | 12644 | DN#12353-EMPTY | CYL | -7,590.00 | 2,144.26 | T0058 CN_DN_PAIR ✓ ↔ Inv 43672 |

### September 2022

Opening balance (ERP running): **R-5,956.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Sept 2022 | Payment | 15897 | TRANSF \| STAT203 | LPG | -9,091.37 | -6,947.11 | T0102 EXACT_SINGLE ✓ ↔ Inv 15470 |

### July 2023

Opening balance (ERP running): **R-13,198.14**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 31 Jul 2023 | Payment | 23099 | TRANSF \| STAT: 93 | LPG | -7,340.05 | -14,287.16 | T0135 EXACT_SINGLE ✓ ↔ Inv 22840 |

### October 2024

Opening balance (ERP running): **R-13,859.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 Oct 2024 | Invoice | 37530 | DN#10254 | LPG | 7,954.53 | -6,332.63 | T0167 EXACT_SINGLE ✓ ↔ Pmt 34565 |

### September 2022

Opening balance (ERP running): **R-5,956.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Sept 2022 | Invoice | 15582 | D/N2083 | LPG | 7,439.98 | 1,107.35 | T0103 EXACT_SINGLE ✓ ↔ Pmt 16038 |

### August 2023

Opening balance (ERP running): **R1,107.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Aug 2023 | Crd Note | 5805 | D/N 5575 | LPG | -6,978.91 | -5,871.56 | T0031 CN_DN_PAIR ✓ ↔ Inv 23187 |

### October 2024

Opening balance (ERP running): **R-13,859.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 28 Oct 2024 | Payment | 34565 | TRANSF \| STAT:108 | LPG | -7,954.53 | -13,826.09 | T0167 EXACT_SINGLE ✓ ↔ Inv 37530 |

### June 2025

Opening balance (ERP running): **R16,180.86**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Jun 2025 | Invoice | 43671 | DN#12353 | LPG | 8,423.08 | -5,403.01 | T0185 EXACT_SINGLE ✓ ↔ Pmt 39533 |

### August 2023

Opening balance (ERP running): **R1,107.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Aug 2023 | Crd Note | 5806 | D/N 5575 EMPTIES | CYL | -2,415.00 | -7,818.01 | T0032 CN_DN_PAIR ✓ ↔ Inv 23188 |

### June 2025

Opening balance (ERP running): **R16,180.86**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Jun 2025 | Invoice | 43672 | DN#12353-EMPTY | CYL | 7,590.00 | -228.01 | T0058 CN_DN_PAIR ✓ ↔ Crd Note 12644 |

### September 2022

Opening balance (ERP running): **R-5,956.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Sept 2022 | Payment | 16038 | TRANSF \| STAT203 | LPG | -7,439.98 | -7,667.99 | T0103 EXACT_SINGLE ✓ ↔ Inv 15582 |

### November 2024

Opening balance (ERP running): **R9,371.46**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Nov 2024 | Invoice | 37967 | DN#10299 | LPG | 7,954.53 | 286.54 | T0168 EXACT_SINGLE ✓ ↔ Pmt 34683 |

### September 2022

Opening balance (ERP running): **R-5,956.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 Sept 2022 | Invoice | 15768 | D/N 2469 | LPG | 7,997.99 | 8,284.53 | T0104 EXACT_SINGLE ✓ ↔ Pmt 16225 |

### August 2023

Opening balance (ERP running): **R1,107.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Aug 2023 | Invoice | 23187 | D/N 5575 | LPG | 6,978.91 | 15,263.44 | T0031 CN_DN_PAIR ✓ ↔ Crd Note 5805 |

### November 2024

Opening balance (ERP running): **R9,371.46**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Nov 2024 | Payment | 34683 | TRANSF \| STAT:109 | LPG | -7,954.53 | 7,308.91 | T0168 EXACT_SINGLE ✓ ↔ Inv 37967 |

### June 2025

Opening balance (ERP running): **R16,180.86**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Jun 2025 | Invoice | 44011 | DN#12401 | LPG | 7,386.51 | 14,695.42 | T0184 EXACT_SINGLE ✓ ↔ Pmt 39402 |

### August 2023

Opening balance (ERP running): **R1,107.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Aug 2023 | Invoice | 23188 | D/N 5575 EMPTIES | CYL | 2,415.00 | 17,110.42 | T0032 CN_DN_PAIR ✓ ↔ Crd Note 5806 |

### June 2025

Opening balance (ERP running): **R16,180.86**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Jun 2025 | Invoice | 44012 | DN#12401-EMPTY | CYL | 6,037.50 | 23,147.92 | T0059 CN_DN_PAIR ✓ ↔ Crd Note 12753 |

### September 2022

Opening balance (ERP running): **R-5,956.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 27 Sept 2022 | Payment | 16225 | TRANSF \| STAT203 | LPG | -7,997.99 | 15,149.93 | T0104 EXACT_SINGLE ✓ ↔ Inv 15768 |

### November 2024

Opening balance (ERP running): **R9,371.46**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Nov 2024 | Invoice | 38158 | DN#10316 | LPG | 7,224.65 | 22,374.58 | T0169 EXACT_SINGLE ✓ ↔ Pmt 35214 |

### August 2023

Opening balance (ERP running): **R1,107.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Aug 2023 | Crd Note | 5827 | D/N 5584 EMPTIES | CYL | -3,105.00 | 19,269.58 | OPEN |

### June 2025

Opening balance (ERP running): **R16,180.86**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Jun 2025 | Crd Note | 12753 | DN#12401-EMPTY | CYL | -6,037.50 | 13,232.08 | T0059 CN_DN_PAIR ✓ ↔ Inv 44012 |

### October 2022

Opening balance (ERP running): **R13,232.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Oct 2022 | Invoice | 15906 | D/N 2225 | LPG | 7,997.99 | 21,230.07 | T0105 EXACT_SINGLE ✓ ↔ Pmt 16884 |

### November 2024

Opening balance (ERP running): **R9,371.46**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Nov 2024 | Payment | 35214 | TRANSF \| STAT:110 | LPG | -7,224.65 | 14,005.42 | T0169 EXACT_SINGLE ✓ ↔ Inv 38158 |

### October 2022

Opening balance (ERP running): **R13,232.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Oct 2022 | Invoice | 15911 | D/N 2225 EMPTIES | CYL | 4,186.00 | 18,191.42 | T0022 CN_DN_PAIR ✓ ↔ Crd Note 4148 |

### August 2023

Opening balance (ERP running): **R1,107.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Aug 2023 | Invoice | 23258 | D/N 5584 | LPG | 5,680.49 | 23,871.91 | OPEN |

### November 2024

Opening balance (ERP running): **R9,371.46**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 26 Nov 2024 | Invoice | 38585 | DN#11235 | LPG | 812.79 | 24,684.70 | T0170 EXACT_SINGLE ✓ ↔ Pmt 35248 |

### June 2025

Opening balance (ERP running): **R16,180.86**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Jun 2025 | Payment | 39402 | TRANSF \| STAT:116 | LPG | -7,386.51 | 17,298.19 | T0184 EXACT_SINGLE ✓ ↔ Inv 44011 |

### October 2022

Opening balance (ERP running): **R13,232.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Oct 2022 | Crd Note | 4148 | D/N 2225 EMPTIES | CYL | -4,186.00 | 13,112.19 | T0022 CN_DN_PAIR ✓ ↔ Inv 15911 |

### August 2023

Opening balance (ERP running): **R1,107.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Aug 2023 | Invoice | 23259 | D/N 5584 EMPTIES | CYL | 2,070.00 | 15,182.19 | OPEN |

### November 2024

Opening balance (ERP running): **R9,371.46**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 29 Nov 2024 | Payment | 35248 | TRANSF \| STAT:109 | LPG | -812.79 | 14,369.40 | T0170 EXACT_SINGLE ✓ ↔ Inv 38585 |

### June 2025

Opening balance (ERP running): **R16,180.86**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Jun 2025 | Payment | 39533 | TRANSF \| STAT:116 | LPG | -8,423.08 | 5,946.32 | T0185 EXACT_SINGLE ✓ ↔ Inv 43671 |

### August 2023

Opening balance (ERP running): **R1,107.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Aug 2023 | Crd Note | 5835 | D/N 5586 EMPTIES | CYL | -1,725.00 | 4,221.32 | OPEN |

### October 2022

Opening balance (ERP running): **R13,232.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Oct 2022 | Payment | 16884 | TRANSF \| STAT204 | LPG | -7,997.99 | -3,776.67 | T0105 EXACT_SINGLE ✓ ↔ Inv 15906 |

### December 2024

Opening balance (ERP running): **R-22,333.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Dec 2024 | Invoice | 38734 | D/N 10776 | LPG | 7,224.65 | 3,447.98 | T0171 EXACT_SINGLE ✓ ↔ Pmt 35898 |

### June 2025

Opening balance (ERP running): **R16,180.86**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 26 Jun 2025 | Invoice | 44264 | — | LPG | 830.97 | 4,278.95 | T0186 EXACT_SINGLE ✓ ↔ Pmt 39817 |
| 30 Jun 2025 | Crd Note | 12857 | DN#12603-EMPTY | CYL | -6,037.50 | -1,758.55 | T0060 CN_DN_PAIR ✓ ↔ Inv 44349 |

### October 2022

Opening balance (ERP running): **R13,232.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Oct 2022 | Crd Note | 4195 | INCORRECT QUANTY | LPG | -9,485.98 | -11,244.53 | T0009 LOCKED:OPERATOR_RULING [exact] ↔ Inv 16091 |

### August 2023

Opening balance (ERP running): **R1,107.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Aug 2023 | Invoice | 23252 | D/N 5586 | LPG | 6,978.91 | -4,265.62 | T0136 EXACT_SINGLE ✓ ↔ Pmt 23396 |

### December 2024

Opening balance (ERP running): **R-22,333.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Dec 2024 | Invoice | 38735 | D/N 10777 | LPG | 7,224.65 | 2,959.03 | T0172 EXACT_SINGLE ✓ ↔ Pmt 39454 |

### August 2023

Opening balance (ERP running): **R1,107.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Aug 2023 | Invoice | 23253 | D/N 5586 EMPTIES | CYL | 2,415.00 | 5,374.03 | OPEN |

### December 2024

Opening balance (ERP running): **R-22,333.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Dec 2024 | Crd Note | 11452 | SALES ORDER 10750 | CYL | -1,552.50 | 3,821.53 | T0011 LOCKED:OPERATOR_RULING [exact] ↔ Inv 38976 |

### October 2022

Opening balance (ERP running): **R13,232.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Oct 2022 | Invoice | 16090 | D/N 2242 | LPG | 4,463.99 | 8,285.52 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 4214 |

### June 2025

Opening balance (ERP running): **R16,180.86**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 30 Jun 2025 | Invoice | 44348 | DN#12603 | LPG | 7,386.51 | 15,672.03 | T0188 EXACT_SINGLE ✓ ↔ Pmt 41416 |
| 30 Jun 2025 | Invoice | 44349 | DN#12603-EMPTY | CYL | 6,037.50 | 21,709.53 | T0060 CN_DN_PAIR ✓ ↔ Crd Note 12857 |

### October 2022

Opening balance (ERP running): **R13,232.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Oct 2022 | Invoice | 16091 | D/N 2243 | LPG | 9,485.98 | 31,195.51 | T0009 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 4195 |

### August 2023

Opening balance (ERP running): **R1,107.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Aug 2023 | Payment | 23395 | TRANSF \| STAT: 94 | LPG | -4,449.02 | 26,746.49 | OPEN |

### December 2024

Opening balance (ERP running): **R-22,333.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Dec 2024 | Payment | 35898 | TRANSF \| STAT:110 | LPG | -7,224.65 | 19,521.84 | T0171 EXACT_SINGLE ✓ ↔ Inv 38734 |
| 11 Dec 2024 | Invoice | 38976 | SALES ORDER 10750 | CYL | 1,552.50 | 21,074.34 | T0011 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 11452 |

### October 2022

Opening balance (ERP running): **R13,232.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Oct 2022 | Invoice | 16092 | D/N 2243. | LPG | 7,997.99 | 29,072.33 | T0106 EXACT_SINGLE ✓ ↔ Pmt 16649 |

### August 2023

Opening balance (ERP running): **R1,107.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Aug 2023 | Payment | 23396 | TRANSF \| STAT: 94 | LPG | -6,978.91 | 22,093.42 | T0136 EXACT_SINGLE ✓ ↔ Inv 23252 |

### December 2024

Opening balance (ERP running): **R-22,333.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Dec 2024 | Invoice | 38976 | SALES ORDER 10750 | LPG | 848.53 | 22,941.95 | T0174 EXACT_SINGLE ✓ ↔ Pmt 35888 |

### July 2025

Opening balance (ERP running): **R22,941.95**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Jul 2025 | Payment | 39817 | TRANSF \| STAT:117 | LPG | -830.97 | 22,110.98 | T0186 EXACT_SINGLE ✓ ↔ Inv 44264 |

### August 2023

Opening balance (ERP running): **R1,107.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 29 Aug 2023 | Crd Note | 6040 | D/N 6413 EMPTIES | CYL | -2,415.00 | 19,695.98 | T0033 CN_DN_PAIR ✓ ↔ Inv 23892 |

### October 2022

Opening balance (ERP running): **R13,232.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Oct 2022 | Payment | 16649 | TRANSF \| STAT204 | LPG | -7,997.99 | 11,697.99 | T0106 EXACT_SINGLE ✓ ↔ Inv 16092 |

### December 2024

Opening balance (ERP running): **R-22,333.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Dec 2024 | Payment | 39454 | TRANSF \| STAT:110 | LPG | -7,224.65 | 4,473.34 | T0172 EXACT_SINGLE ✓ ↔ Inv 38735 |

### July 2025

Opening balance (ERP running): **R22,941.95**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Jul 2025 | Invoice | 44729 | DN#12190 | LPG | 8,630.23 | 13,103.57 | T0187 EXACT_SINGLE ✓ ↔ Pmt 40148 |

### December 2024

Opening balance (ERP running): **R-22,333.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Dec 2024 | Invoice | 39076 | DN#10837 | CYL | 6,037.50 | 19,141.07 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 11492 |

### July 2025

Opening balance (ERP running): **R22,941.95**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Jul 2025 | Invoice | 44730 | DN#12190-EMPTY | CYL | 8,625.00 | 27,766.07 | OPEN |

### October 2022

Opening balance (ERP running): **R13,232.08**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 22 Oct 2022 | Crd Note | 4214 | RETURN FULLSD/N 2242 | LPG | -4,463.99 | 23,302.08 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Inv 16090 |

### August 2023

Opening balance (ERP running): **R1,107.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 29 Aug 2023 | Invoice | 23891 | D/N 6413 | LPG | 7,275.60 | 30,577.68 | T0137 EXACT_SINGLE ✓ ↔ Pmt 23983 |

### December 2024

Opening balance (ERP running): **R-22,333.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Dec 2024 | Invoice | 39076 | DN#10837 | LPG | 7,542.39 | 38,120.07 | T0173 EXACT_SINGLE ✓ ↔ Pmt 35887 |

### August 2023

Opening balance (ERP running): **R1,107.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 29 Aug 2023 | Invoice | 23892 | D/N 6413 EMPTIES | CYL | 2,415.00 | 40,535.07 | T0033 CN_DN_PAIR ✓ ↔ Crd Note 6040 |

### December 2024

Opening balance (ERP running): **R-22,333.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Dec 2024 | Crd Note | 11492 | DN#10837 | CYL | -6,037.50 | 34,497.57 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Inv 39076 |

### July 2025

Opening balance (ERP running): **R22,941.95**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Jul 2025 | Crd Note | 12956 | DN#12190-EMPTY | CYL | -8,107.50 | 26,390.07 | OPEN |

### November 2022

Opening balance (ERP running): **R26,390.07**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Nov 2022 | Invoice | 16264 | D/N 2419 | LPG | 7,997.99 | 34,388.06 | T0107 EXACT_SINGLE ✓ ↔ Pmt 16741 |

### December 2024

Opening balance (ERP running): **R-22,333.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 Dec 2024 | Crd Note | 11573 | DN#11988 | CYL | -7,590.00 | 26,798.06 | T0043 CN_DN_PAIR ✓ ↔ Inv 39311 |

### November 2022

Opening balance (ERP running): **R26,390.07**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Nov 2022 | Payment | 16741 | TRANSF \| STAT205 | LPG | -7,997.99 | 18,800.07 | T0107 EXACT_SINGLE ✓ ↔ Inv 16264 |

### September 2023

Opening balance (ERP running): **R-2,070.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Sept 2023 | Payment | 23983 | TRANSF \| STAT: 95 | LPG | -7,275.60 | 11,524.47 | T0137 EXACT_SINGLE ✓ ↔ Inv 23891 |

### July 2025

Opening balance (ERP running): **R22,941.95**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Jul 2025 | Payment | 40148 | TRANSF \| STAT:117 | LPG | -8,630.23 | 2,894.24 | T0187 EXACT_SINGLE ✓ ↔ Inv 44729 |

### November 2022

Opening balance (ERP running): **R26,390.07**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Nov 2022 | Crd Note | 4286 | D/N2559 EMPTIES | CYL | -1,196.00 | 1,698.24 | OPEN |

### September 2023

Opening balance (ERP running): **R-2,070.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Sept 2023 | Crd Note | 6137 | D/N 6389 EMPTIES | CYL | -2,415.00 | -716.76 | T0034 CN_DN_PAIR ✓ ↔ Inv 24191 |

### December 2024

Opening balance (ERP running): **R-22,333.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 Dec 2024 | Payment | 35887 | TRANSF \| STAT:110 | LPG | -7,542.39 | -8,259.15 | T0173 EXACT_SINGLE ✓ ↔ Inv 39076 |

### July 2025

Opening balance (ERP running): **R22,941.95**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 22 Jul 2025 | Bank UD | 40294 | TRANSF \| STAT:117 | LPG | 6,446.60 | -1,812.55 | T0016 UD_CLEARING ✓ |

### November 2022

Opening balance (ERP running): **R26,390.07**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Nov 2022 | Invoice | 16433 | D/N 2559 | LPG | 814.06 | -998.49 | T0112 EXACT_SINGLE ✓ ↔ Pmt 17335 |

### September 2023

Opening balance (ERP running): **R-2,070.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Sept 2023 | Invoice | 24190 | D/N 6389 | LPG | 7,275.61 | 6,277.12 | T0138 EXACT_SINGLE ✓ ↔ Pmt 24265 |

### December 2024

Opening balance (ERP running): **R-22,333.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 Dec 2024 | Payment | 35888 | TRANSF \| STAT:110 | LPG | -848.53 | 5,428.59 | T0174 EXACT_SINGLE ✓ ↔ Inv 38976 |

### July 2025

Opening balance (ERP running): **R22,941.95**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 22 Jul 2025 | Payment | 40294 | TRANSF \| STAT:117 | LPG | -6,446.60 | -1,018.01 | T0016 UD_CLEARING ✓ |

### November 2022

Opening balance (ERP running): **R26,390.07**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Nov 2022 | Invoice | 16442 | D/N2559 EMPTIES | CYL | 1,794.00 | 775.99 | OPEN |

### September 2023

Opening balance (ERP running): **R-2,070.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Sept 2023 | Invoice | 24191 | D/N 6389 EMPTIES | CYL | 2,415.00 | 3,190.99 | T0034 CN_DN_PAIR ✓ ↔ Crd Note 6137 |

### December 2024

Opening balance (ERP running): **R-22,333.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 Dec 2024 | Invoice | 39311 | DN#11988 | CYL | 7,590.00 | 10,780.99 | T0043 CN_DN_PAIR ✓ ↔ Crd Note 11573 |
| 23 Dec 2024 | Invoice | 39311 | DN#11988 | LPG | 8,390.92 | 19,171.91 | OPEN |

### July 2025

Opening balance (ERP running): **R22,941.95**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 22 Jul 2025 | Payment | 41416 | TRANSF \| STAT:117 | LPG | -7,386.51 | 11,785.40 | T0188 EXACT_SINGLE ✓ ↔ Inv 44348 |

### November 2022

Opening balance (ERP running): **R26,390.07**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Nov 2022 | Crd Note | 4304 | D/N2653 EMPTIES | CYL | -598.00 | 11,187.40 | OPEN |

### July 2025

Opening balance (ERP running): **R22,941.95**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 26 Jul 2025 | Crd Note | 13059 | DN 20007 | CYL | -6,037.50 | 5,149.90 | T0061 CN_DN_PAIR ✓ ↔ Inv 45144 |

### September 2023

Opening balance (ERP running): **R-2,070.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Sept 2023 | Payment | 24265 | TRANSF \| STAT: 95 | LPG | -7,275.61 | -2,125.71 | T0138 EXACT_SINGLE ✓ ↔ Inv 24190 |

### December 2024

Opening balance (ERP running): **R-22,333.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 30 Dec 2024 | Payment | 35877 | TRANSF \| STAT:110 | LPG | -9,649.56 | -11,775.27 | OPEN |

### September 2023

Opening balance (ERP running): **R-2,070.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Sept 2023 | Crd Note | 6281 | D/N 6543 EMPTIES | CYL | -2,415.00 | -14,190.27 | T0035 CN_DN_PAIR ✓ ↔ Inv 24652 |

### January 2025

Opening balance (ERP running): **R-14,190.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Jan 2025 | Crd Note | 11625 | 39608-EMPTY | CYL | -7,072.50 | -21,262.77 | T0012 LOCKED:OPERATOR_RULING [exact] ↔ Inv 39609 |

### November 2022

Opening balance (ERP running): **R26,390.07**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Nov 2022 | Invoice | 16497 | D/N 2653 | LPG | 7,235.97 | -14,026.80 | T0108 EXACT_SINGLE ✓ ↔ Pmt 17080 |

### July 2025

Opening balance (ERP running): **R22,941.95**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 26 Jul 2025 | Invoice | 45143 | D/N 20007 | LPG | 7,267.54 | -6,759.26 | T0189 EXACT_SINGLE ✓ ↔ Pmt 40427 |
| 26 Jul 2025 | Invoice | 45144 | DN 20007 | CYL | 6,037.50 | -721.76 | T0061 CN_DN_PAIR ✓ ↔ Crd Note 13059 |

### November 2022

Opening balance (ERP running): **R26,390.07**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 22 Nov 2022 | Payment | 17080 | TRANSF \| STAT205 | LPG | -7,235.97 | -7,957.73 | T0108 EXACT_SINGLE ✓ ↔ Inv 16497 |

### September 2023

Opening balance (ERP running): **R-2,070.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Sept 2023 | Invoice | 24651 | D/N 6543 | LPG | 7,122.84 | -834.89 | T0139 EXACT_SINGLE ✓ ↔ Pmt 24559 |

### January 2025

Opening balance (ERP running): **R-14,190.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Jan 2025 | Invoice | 39608 | DN#9300 | LPG | 8,146.82 | 7,311.93 | T0175 EXACT_SINGLE ✓ ↔ Pmt 36190 |

### September 2023

Opening balance (ERP running): **R-2,070.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Sept 2023 | Invoice | 24652 | D/N 6543 EMPTIES | CYL | 2,415.00 | 9,726.93 | T0035 CN_DN_PAIR ✓ ↔ Crd Note 6281 |

### January 2025

Opening balance (ERP running): **R-14,190.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Jan 2025 | Invoice | 39609 | 39608-EMPTY | CYL | 7,072.50 | 16,799.43 | T0012 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 11625 |

### December 2022

Opening balance (ERP running): **R16,799.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Dec 2022 | Invoice | 16651 | D/N 2712 | LPG | 7,507.33 | 24,306.76 | T0109 EXACT_SINGLE ✓ ↔ Pmt 17233 |

### July 2025

Opening balance (ERP running): **R22,941.95**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 31 Jul 2025 | Payment | 40427 | TRANSF \| STAT:117 | LPG | -7,267.54 | 17,039.22 | T0189 EXACT_SINGLE ✓ ↔ Inv 45143 |

### January 2025

Opening balance (ERP running): **R-14,190.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Jan 2025 | Crd Note | 11718 | 39944-EMPTY | CYL | -8,107.50 | 8,931.72 | T0013 LOCKED:OPERATOR_RULING [exact] ↔ Inv 39968 |

### August 2025

Opening balance (ERP running): **R8,931.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Aug 2025 | Invoice | 45528 | DN#20080 | CYL | 6,037.50 | 14,969.22 | T0014 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 40757 |

### December 2022

Opening balance (ERP running): **R16,799.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Dec 2022 | Payment | 17233 | TRANSF \| STAT206 | LPG | -7,507.33 | 7,461.89 | T0109 EXACT_SINGLE ✓ ↔ Inv 16651 |

### September 2023

Opening balance (ERP running): **R-2,070.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 26 Sept 2023 | Payment | 24559 | TRANSF \| STAT: 95 | LPG | -7,122.84 | 339.05 | T0139 EXACT_SINGLE ✓ ↔ Inv 24651 |

### August 2025

Opening balance (ERP running): **R8,931.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Aug 2025 | Invoice | 45528 | DN#20080 | LPG | 1,362.69 | 1,701.74 | T0014 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 40757 |
| 09 Aug 2025 | Invoice | 45529 | DN#20080-EMPTY | CYL | 8,625.00 | 10,326.74 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 13191 |

### December 2022

Opening balance (ERP running): **R16,799.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Dec 2022 | Invoice | 16763 | D/N 2686 | LPG | 836.45 | 11,163.19 | T0110 EXACT_SINGLE ✓ ↔ Pmt 17271 |

### September 2023

Opening balance (ERP running): **R-2,070.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 26 Sept 2023 | Invoice | 24815 | D/N 6556 | LPG | 6,625.90 | 17,789.09 | T0140 EXACT_SINGLE ✓ ↔ Pmt 24732 |

### January 2025

Opening balance (ERP running): **R-14,190.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Jan 2025 | Invoice | 39944 | — | LPG | 8,715.19 | 26,504.28 | T0176 EXACT_SINGLE ✓ ↔ Pmt 36950 |

### December 2022

Opening balance (ERP running): **R16,799.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Dec 2022 | Crd Note | 4362 | D/N 2686 EMPTIES | CYL | -1,196.00 | 25,308.28 | OPEN |

### September 2023

Opening balance (ERP running): **R-2,070.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 26 Sept 2023 | Invoice | 24816 | D/N 6556 EMPTIES | CYL | 1,725.00 | 27,033.28 | T0036 CN_DN_PAIR ✓ ↔ Crd Note 6331 |

### January 2025

Opening balance (ERP running): **R-14,190.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Jan 2025 | Invoice | 39968 | 39944-EMPTY | CYL | 8,107.50 | 35,140.78 | T0013 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 11718 |

### August 2025

Opening balance (ERP running): **R8,931.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Aug 2025 | Crd Note | 13191 | DN#20080-EMPTY | CYL | -8,625.00 | 26,515.78 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Inv 45529 |

### December 2022

Opening balance (ERP running): **R16,799.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Dec 2022 | Invoice | 16770 | D/N 2686 EMPTIES | CYL | 1,794.00 | 28,309.78 | OPEN |

### September 2023

Opening balance (ERP running): **R-2,070.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 27 Sept 2023 | Crd Note | 6331 | D/N 6556 EMPTIES | CYL | -1,725.00 | 26,584.78 | T0036 CN_DN_PAIR ✓ ↔ Inv 24816 |

### January 2025

Opening balance (ERP running): **R-14,190.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Jan 2025 | Payment | 36190 | TRANSF \| STAT:111 | LPG | -8,146.82 | 18,437.96 | T0175 EXACT_SINGLE ✓ ↔ Inv 39608 |

### August 2025

Opening balance (ERP running): **R8,931.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Aug 2025 | Payment | 40757 | TRANSF \| STAT:118 | LPG | -7,400.19 | 11,037.77 | T0014 LOCKED:OPERATOR_RULING [exact] ↔ Inv 45528 |

### October 2023

Opening balance (ERP running): **R11,037.77**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Oct 2023 | Crd Note | 6459 | D/N 6265 EMPTIES | CYL | -2,760.00 | 8,277.77 | T0037 CN_DN_PAIR ✓ ↔ Inv 25274 |

### December 2022

Opening balance (ERP running): **R16,799.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Dec 2022 | Payment | 17271 | TRANSF \| STAT206 | LPG | -836.45 | 7,441.32 | T0110 EXACT_SINGLE ✓ ↔ Inv 16763 |

### January 2025

Opening balance (ERP running): **R-14,190.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 22 Jan 2025 | Payment | 36950 | TRANSF \| STAT:111 | LPG | -8,715.19 | -1,273.87 | T0176 EXACT_SINGLE ✓ ↔ Inv 39944 |

### August 2025

Opening balance (ERP running): **R8,931.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 25 Aug 2025 | Invoice | 45883 | DN#20547 | LPG | 7,124.02 | 5,850.15 | T0190 EXACT_SINGLE ✓ ↔ Pmt 40923 |

### December 2022

Opening balance (ERP running): **R16,799.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Dec 2022 | Crd Note | 4376 | D/N 2743 EMPTIES | CYL | -690.00 | 5,160.15 | OPEN |

### January 2025

Opening balance (ERP running): **R-14,190.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 29 Jan 2025 | Crd Note | 11780 | DN#11830-EMPTY | CYL | -7,072.50 | -1,912.35 | T0044 CN_DN_PAIR ✓ ↔ Inv 40253 |

### August 2025

Opening balance (ERP running): **R8,931.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 25 Aug 2025 | Invoice | 45884 | DN#20547-EMPTY | CYL | 6,037.50 | 4,125.15 | T0062 CN_DN_PAIR ✓ ↔ Crd Note 13307 |

### October 2023

Opening balance (ERP running): **R11,037.77**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Oct 2023 | Invoice | 25273 | D/N 6265 | LPG | 7,948.59 | 12,073.74 | T0141 EXACT_SINGLE ✓ ↔ Pmt 25260 |
| 09 Oct 2023 | Invoice | 25274 | D/N 6265 EMPTIES | CYL | 2,760.00 | 14,833.74 | T0037 CN_DN_PAIR ✓ ↔ Crd Note 6459 |

### August 2025

Opening balance (ERP running): **R8,931.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 26 Aug 2025 | Crd Note | 13307 | DN#20547-EMPTY | CYL | -6,037.50 | 8,796.24 | T0062 CN_DN_PAIR ✓ ↔ Inv 45884 |

### December 2022

Opening balance (ERP running): **R16,799.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Dec 2022 | Invoice | 16804 | D/N 2740 | LPG | 7,435.21 | 16,231.45 | T0111 EXACT_SINGLE ✓ ↔ Pmt 17348 |

### January 2025

Opening balance (ERP running): **R-14,190.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 29 Jan 2025 | Invoice | 40252 | DN#11830 | LPG | 8,146.82 | 24,378.27 | T0177 EXACT_SINGLE ✓ ↔ Pmt 36658 |
| 29 Jan 2025 | Invoice | 40253 | DN#11830-EMPTY | CYL | 7,072.50 | 31,450.77 | T0044 CN_DN_PAIR ✓ ↔ Crd Note 11780 |

### December 2022

Opening balance (ERP running): **R16,799.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Dec 2022 | Payment | 17348 | TRANSF \| STAT206 | LPG | -7,435.21 | 24,015.56 | T0111 EXACT_SINGLE ✓ ↔ Inv 16804 |

### October 2023

Opening balance (ERP running): **R11,037.77**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 13 Oct 2023 | Payment | 25260 | TRANSF \| STAT: 96 | LPG | -7,948.59 | 16,066.97 | T0141 EXACT_SINGLE ✓ ↔ Inv 25273 |

### August 2025

Opening balance (ERP running): **R8,931.72**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 26 Aug 2025 | Payment | 40923 | TRANSF \| STAT:118 | LPG | -7,124.02 | 8,942.95 | T0190 EXACT_SINGLE ✓ ↔ Inv 45883 |

### December 2022

Opening balance (ERP running): **R16,799.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 16 Dec 2022 | Invoice | 16871 | D/N2808 | LPG | 1,394.09 | 10,337.04 | T0113 EXACT_SINGLE ✓ ↔ Pmt 17477 |

### December 2023

Opening balance (ERP running): **R10,337.04**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Dec 2023 | Invoice | 27821 | D/N 7502 | LPG | 7,996.26 | 18,333.30 | T0142 EXACT_SINGLE ✓ ↔ Pmt 27448 |

### September 2025

Opening balance (ERP running): **R18,333.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Sept 2025 | Invoice | 46071 | DN#20567 | LPG | 8,459.80 | 26,793.10 | T0191 EXACT_SINGLE ✓ ↔ Pmt 41162 |

### January 2025

Opening balance (ERP running): **R-14,190.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 29 Jan 2025 | Invoice | 40274 | DN11836 | OTHER | 632.50 | 27,425.60 | T0178 EXACT_SINGLE ✓ ↔ Pmt 36659 |

### December 2022

Opening balance (ERP running): **R16,799.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 16 Dec 2022 | Invoice | 17259 | D/N 2808 EMPTIES | CYL | 1,380.00 | 28,805.60 | OPEN |

### September 2025

Opening balance (ERP running): **R18,333.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Sept 2025 | Invoice | 46072 | DN#20567-EMPTY | CYL | 8,625.00 | 37,430.60 | T0063 CN_DN_PAIR ✓ ↔ Crd Note 13363 |

### December 2023

Opening balance (ERP running): **R10,337.04**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 Dec 2023 | Invoice | 27997 | D/N 7544 | LPG | 7,996.26 | 45,426.86 | T0143 EXACT_SINGLE ✓ ↔ Pmt 27449 |

### January 2025

Opening balance (ERP running): **R-14,190.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 31 Jan 2025 | Payment | 36509 | TRANSF \| STAT:111 | LPG | -8,715.19 | 36,711.67 | OPEN |

### September 2025

Opening balance (ERP running): **R18,333.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Sept 2025 | Crd Note | 13363 | DN#20567-EMPTY | CYL | -8,625.00 | 28,086.67 | T0063 CN_DN_PAIR ✓ ↔ Inv 46072 |

### December 2022

Opening balance (ERP running): **R16,799.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 19 Dec 2022 | Payment | 17335 | TRANSF \| STAT206 | LPG | -814.06 | 27,272.61 | T0112 EXACT_SINGLE ✓ ↔ Inv 16433 |

### December 2023

Opening balance (ERP running): **R10,337.04**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 30 Dec 2023 | Payment | 27448 | TRANSF \| STAT: 98 | LPG | -7,996.26 | 19,276.35 | T0142 EXACT_SINGLE ✓ ↔ Inv 27821 |

### January 2025

Opening balance (ERP running): **R-14,190.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 31 Jan 2025 | Payment | 36512 | TRANSF \| STAT:111 | LPG | -7,224.65 | 12,051.70 | OPEN |

### December 2022

Opening balance (ERP running): **R16,799.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Dec 2022 | Payment | 17477 | TRANSF \| STAT206 | LPG | -1,394.09 | 10,657.61 | T0113 EXACT_SINGLE ✓ ↔ Inv 16871 |

### December 2023

Opening balance (ERP running): **R10,337.04**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 30 Dec 2023 | Payment | 27449 | TRANSF \| STAT: 98 | LPG | -7,996.26 | 2,661.35 | T0143 EXACT_SINGLE ✓ ↔ Inv 27997 |

### February 2025

Opening balance (ERP running): **R2,661.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Feb 2025 | Payment | 36658 | TRANSF \| STAT:112 | LPG | -8,146.82 | -5,485.47 | T0177 EXACT_SINGLE ✓ ↔ Inv 40252 |

### September 2025

Opening balance (ERP running): **R18,333.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Sept 2025 | Payment | 41162 | TRANSF \| STAT:119 | LPG | -8,459.80 | -13,945.27 | T0191 EXACT_SINGLE ✓ ↔ Inv 46071 |

### December 2022

Opening balance (ERP running): **R16,799.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 24 Dec 2022 | Invoice | 17044 | D/N 2870 | LPG | 7,435.21 | -6,510.06 | T0115 EXACT_SINGLE ✓ ↔ Pmt 17778 |

### January 2024

Opening balance (ERP running): **R-6,510.06**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Jan 2024 | Invoice | 28389 | D/N 7182 | LPG | 8,022.40 | 1,512.34 | T0144 EXACT_SINGLE ✓ ↔ Pmt 27740 |

### February 2025

Opening balance (ERP running): **R2,661.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Feb 2025 | Payment | 36659 | TRANSF \| STAT:112 | LPG | -632.50 | 879.84 | T0178 EXACT_SINGLE ✓ ↔ Inv 40274 |

### September 2025

Opening balance (ERP running): **R18,333.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Sept 2025 | Crd Note | 13464 | DN#20247 | LPG | -6,847.27 | -5,967.43 | T0064 CN_DN_PAIR ✓ ↔ Inv 46375 |
| 15 Sept 2025 | Crd Note | 13465 | DN#20247-EMPTY | CYL | -6,037.50 | -12,004.93 | T0065 CN_DN_PAIR ✓ ↔ Inv 46376 |

### January 2023

Opening balance (ERP running): **R-12,004.93**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Jan 2023 | Invoice | 17222 | D/N 2993 | LPG | 7,605.58 | -4,399.35 | T0114 EXACT_SINGLE ✓ ↔ Pmt 17715 |

### January 2024

Opening balance (ERP running): **R-6,510.06**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Jan 2024 | Payment | 27740 | TRANSF \| STAT: 99 | LPG | -8,022.40 | -12,421.75 | T0144 EXACT_SINGLE ✓ ↔ Inv 28389 |

### February 2025

Opening balance (ERP running): **R2,661.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Feb 2025 | Invoice | 40536 | D/N 12851 | OTHER | 974.05 | -11,447.70 | T0180 EXACT_SINGLE ✓ ↔ Pmt 36800 |

### September 2025

Opening balance (ERP running): **R18,333.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Sept 2025 | Crd Note | 13469 | DN#20247-EMPTY | CYL | -6,037.50 | -17,485.20 | T0066 CN_DN_PAIR ✓ ↔ Inv 46380 |

### January 2023

Opening balance (ERP running): **R-12,004.93**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Jan 2023 | Payment | 17715 | TRANSF \| STAT207 | LPG | -7,605.58 | -25,090.78 | T0114 EXACT_SINGLE ✓ ↔ Inv 17222 |

### January 2024

Opening balance (ERP running): **R-6,510.06**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 18 Jan 2024 | Invoice | 28747 | D/N 7734 | LPG | 8,302.16 | -16,788.62 | T0145 EXACT_SINGLE ✓ ↔ Pmt 28328 |

### February 2025

Opening balance (ERP running): **R2,661.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Feb 2025 | Invoice | 40553 | DN#12772 | LPG | 7,638.42 | -9,150.20 | T0179 EXACT_SINGLE ✓ ↔ Pmt 36799 |
| 07 Feb 2025 | Invoice | 40554 | DN#12772-EMPTY | CYL | 6,037.50 | -3,112.70 | T0045 CN_DN_PAIR ✓ ↔ Crd Note 11840 |

### January 2023

Opening balance (ERP running): **R-12,004.93**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 19 Jan 2023 | Payment | 17778 | TRANSF \| STAT207 | LPG | -7,435.21 | -10,547.91 | T0115 EXACT_SINGLE ✓ ↔ Inv 17044 |

### January 2024

Opening balance (ERP running): **R-6,510.06**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 22 Jan 2024 | Payment | 28328 | TRANSF \| STAT: 99 | LPG | -8,302.16 | -18,850.07 | T0145 EXACT_SINGLE ✓ ↔ Inv 28747 |

### September 2025

Opening balance (ERP running): **R18,333.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Sept 2025 | Invoice | 46375 | DN#20247 | LPG | 6,847.27 | -12,002.80 | T0064 CN_DN_PAIR ✓ ↔ Crd Note 13464 |

### January 2023

Opening balance (ERP running): **R-12,004.93**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 21 Jan 2023 | Crd Note | 4489 | D/N 3078 EMPTIES | CYL | -690.00 | -12,692.80 | OPEN |

### February 2025

Opening balance (ERP running): **R2,661.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Feb 2025 | Crd Note | 11840 | DN#12772-EMPTY | CYL | -6,037.50 | -18,730.30 | T0045 CN_DN_PAIR ✓ ↔ Inv 40554 |

### September 2025

Opening balance (ERP running): **R18,333.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Sept 2025 | Invoice | 46376 | DN#20247-EMPTY | CYL | 6,037.50 | -12,692.80 | T0065 CN_DN_PAIR ✓ ↔ Crd Note 13465 |

### February 2024

Opening balance (ERP running): **R-12,692.80**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Feb 2024 | Invoice | 29248 | D/N 7783 | LPG | 8,581.10 | -4,111.70 | T0146 EXACT_SINGLE ✓ ↔ Pmt 28820 |

### January 2023

Opening balance (ERP running): **R-12,004.93**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 21 Jan 2023 | Invoice | 17350 | D/N 3078 | LPG | 8,461.22 | 4,349.52 | T0116 EXACT_SINGLE ✓ ↔ Pmt 17883 |

### February 2024

Opening balance (ERP running): **R-12,692.80**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Feb 2024 | Payment | 28820 | TRANSF \| STAT:100 | LPG | -8,581.10 | -4,231.58 | T0146 EXACT_SINGLE ✓ ↔ Inv 29248 |

### February 2025

Opening balance (ERP running): **R2,661.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Feb 2025 | Payment | 36799 | TRANSF \| STAT:112 | LPG | -7,638.42 | -11,870.00 | T0179 EXACT_SINGLE ✓ ↔ Inv 40553 |

### September 2025

Opening balance (ERP running): **R18,333.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Sept 2025 | Invoice | 46379 | DN#20247 | LPG | 6,847.27 | -5,022.73 | T0194 EXACT_SINGLE ✓ ↔ Pmt 41578 |
| 15 Sept 2025 | Invoice | 46380 | DN#20247-EMPTY | CYL | 6,037.50 | 1,014.77 | T0066 CN_DN_PAIR ✓ ↔ Crd Note 13469 |

### February 2023

Opening balance (ERP running): **R1,014.77**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Feb 2023 | Payment | 17883 | TRANSF \| STAT208 | LPG | -8,461.22 | -7,446.45 | T0116 EXACT_SINGLE ✓ ↔ Inv 17350 |

### February 2024

Opening balance (ERP running): **R-12,692.80**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 13 Feb 2024 | Invoice | 29536 | D/N 7811 | LPG | 7,550.67 | 104.22 | T0147 EXACT_SINGLE ✓ ↔ Pmt 28857 |

### February 2025

Opening balance (ERP running): **R2,661.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Feb 2025 | Payment | 36800 | TRANSF \| STAT:112 | LPG | -974.05 | -869.83 | T0180 EXACT_SINGLE ✓ ↔ Inv 40536 |
| 24 Feb 2025 | Crd Note | 11950 | DN#10491-EMPTY | CYL | -8,107.50 | -8,977.33 | T0046 CN_DN_PAIR ✓ ↔ Inv 40943 |

### February 2023

Opening balance (ERP running): **R1,014.77**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Feb 2023 | Crd Note | 4561 | DELIVERY POSTPONED | LPG | -7,605.58 | -16,582.91 | T0010 LOCKED:OPERATOR_RULING [exact] ↔ Inv 17465 |

### February 2024

Opening balance (ERP running): **R-12,692.80**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 16 Feb 2024 | Payment | 28857 | TRANSF \| STAT:100 | LPG | -7,550.67 | -24,133.58 | T0147 EXACT_SINGLE ✓ ↔ Inv 29536 |

### September 2025

Opening balance (ERP running): **R18,333.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 19 Sept 2025 | Payment | 41285 | TRANSF \| STAT:119 | LPG | -8,596.58 | -32,730.16 | T0192 EXACT_SINGLE ✓ ↔ Inv 42748 |

### February 2023

Opening balance (ERP running): **R1,014.77**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Feb 2023 | Invoice | 17465 | D/N 3040 | LPG | 7,605.58 | -25,124.58 | T0010 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 4561 |

### February 2025

Opening balance (ERP running): **R2,661.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 24 Feb 2025 | Invoice | 40942 | DN#10491 | LPG | 8,784.18 | -16,340.40 | T0181 EXACT_SINGLE ✓ ↔ Pmt 37633 |

### September 2025

Opening balance (ERP running): **R18,333.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 23 Sept 2025 | Invoice | 46829 | DN#20083 | OTHER | 838.35 | -15,502.05 | T0193 EXACT_SINGLE ✓ ↔ Pmt 41478 |

### February 2025

Opening balance (ERP running): **R2,661.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 24 Feb 2025 | Invoice | 40943 | DN#10491-EMPTY | CYL | 8,107.50 | -7,394.55 | T0046 CN_DN_PAIR ✓ ↔ Crd Note 11950 |

### February 2023

Opening balance (ERP running): **R1,014.77**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Feb 2023 | Invoice | 17478 | D/N 3250 | LPG | 7,605.58 | 211.03 | T0117 EXACT_SINGLE ✓ ↔ Pmt 18009 |

### September 2025

Opening balance (ERP running): **R18,333.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 25 Sept 2025 | Payment | 41478 | TRANSF \| STAT:119 | LPG | -838.35 | -627.32 | T0193 EXACT_SINGLE ✓ ↔ Inv 46829 |

### February 2023

Opening balance (ERP running): **R1,014.77**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Feb 2023 | Payment | 18009 | TRANSF \| STAT208 | LPG | -7,605.58 | -8,232.90 | T0117 EXACT_SINGLE ✓ ↔ Inv 17478 |

### October 2025

Opening balance (ERP running): **R-8,232.90**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Oct 2025 | Invoice | 46819 | DN#21089 | LPG | 7,617.59 | -615.31 | T0195 EXACT_SINGLE ✓ ↔ Pmt 41949 |
| 01 Oct 2025 | Invoice | 46820 | DN#21089-EMPTY | CYL | 7,590.00 | 6,974.69 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 13599 |

### February 2023

Opening balance (ERP running): **R1,014.77**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 21 Feb 2023 | Invoice | 17713 | D/N 3326 | LPG | 7,861.50 | 14,836.19 | T0119 EXACT_SINGLE ✓ ↔ Pmt 18494 |
| 21 Feb 2023 | Invoice | 17720 | D/N 3326. | LPG | 274.24 | 15,110.43 | T0118 EXACT_SINGLE ✓ ↔ Pmt 18490 |

### October 2025

Opening balance (ERP running): **R-8,232.90**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Oct 2025 | Payment | 41578 | TRANSF \| STAT:120 | LPG | -6,847.27 | 8,263.16 | T0194 EXACT_SINGLE ✓ ↔ Inv 46379 |
| 03 Oct 2025 | Crd Note | 13599 | DN#21089-EMPTY | CYL | -7,590.00 | 673.16 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Inv 46820 |

### February 2023

Opening balance (ERP running): **R1,014.77**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 27 Feb 2023 | Payment | 18490 | TRANSF \| STAT208 | LPG | -274.24 | 398.92 | T0118 EXACT_SINGLE ✓ ↔ Inv 17720 |
| 27 Feb 2023 | Payment | 18494 | TRANSF \| STAT208 | LPG | -7,861.50 | -7,462.58 | T0119 EXACT_SINGLE ✓ ↔ Inv 17713 |

### October 2025

Opening balance (ERP running): **R-8,232.90**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 13 Oct 2025 | Invoice | 47064 | DN#20187 | LPG | 6,847.27 | -615.31 | T0196 EXACT_SINGLE ✓ ↔ Pmt 41950 |
| 13 Oct 2025 | Invoice | 47065 | DN#20187-EMPTY | CYL | 6,037.50 | 5,422.19 | T0067 CN_DN_PAIR ✓ ↔ Crd Note 13676 |

### March 2023

Opening balance (ERP running): **R-1,035.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Mar 2023 | Invoice | 18037 | D/N 3357 | LPG | 8,400.00 | 13,822.19 | T0121 EXACT_SINGLE ✓ ↔ Pmt 19056 |

### October 2025

Opening balance (ERP running): **R-8,232.90**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 Oct 2025 | Crd Note | 13676 | DN#20187-EMPTY | CYL | -6,037.50 | 7,784.69 | T0067 CN_DN_PAIR ✓ ↔ Inv 47065 |
| 20 Oct 2025 | Payment | 41949 | TRANSF \| STAT:120 | LPG | -7,617.59 | 167.10 | T0195 EXACT_SINGLE ✓ ↔ Inv 46819 |
| 20 Oct 2025 | Payment | 41950 | TRANSF \| STAT:120 | LPG | -6,847.27 | -6,680.17 | T0196 EXACT_SINGLE ✓ ↔ Inv 47064 |
| 21 Oct 2025 | Payment | 41952 | TRANSF \| STAT:120 | LPG | -838.35 | -7,518.52 | T0197 EXACT_SINGLE ✓ ↔ Inv 41870 |
| 27 Oct 2025 | Crd Note | 13753 | DN#20627-EMPTY | CYL | -7,072.50 | -14,591.02 | T0068 CN_DN_PAIR ✓ ↔ Inv 47336 |
| 27 Oct 2025 | Invoice | 47335 | DN#20627 | LPG | 7,360.82 | -7,230.20 | T0198 EXACT_SINGLE ✓ ↔ Pmt 42145 |
| 27 Oct 2025 | Invoice | 47336 | DN#20627-EMPTY | CYL | 7,072.50 | -157.70 | T0068 CN_DN_PAIR ✓ ↔ Crd Note 13753 |
| 29 Oct 2025 | Crd Note | 13765 | DN#20762-EMPTY | CYL | -7,590.00 | -7,747.70 | T0069 CN_DN_PAIR ✓ ↔ Inv 47380 |
| 29 Oct 2025 | Invoice | 47380 | DN#20762-EMPTY | CYL | 7,590.00 | -157.70 | T0069 CN_DN_PAIR ✓ ↔ Crd Note 13765 |

### November 2025

Opening balance (ERP running): **R-157.70**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Nov 2025 | Invoice | 47504 | DN#21145 | OTHER | 838.35 | 680.65 | T0199 EXACT_SINGLE ✓ ↔ Pmt 42236 |
| 07 Nov 2025 | Payment | 42145 | TRANSF \| STAT:121 | LPG | -7,360.82 | -6,680.17 | T0198 EXACT_SINGLE ✓ ↔ Inv 47335 |
| 14 Nov 2025 | Payment | 42236 | TRANSF \| STAT:121 | LPG | -838.35 | -7,518.52 | T0199 EXACT_SINGLE ✓ ↔ Inv 47504 |
| 17 Nov 2025 | Invoice | 47706 | DN#20793 | LPG | 7,484.10 | -34.42 | T0200 EXACT_SINGLE ✓ ↔ Pmt 42322 |
| 20 Nov 2025 | Payment | 42322 | TRANSF \| STAT:121 | LPG | -7,484.10 | -7,518.52 | T0200 EXACT_SINGLE ✓ ↔ Inv 47706 |

### December 2025

Opening balance (ERP running): **R-7,518.52**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Dec 2025 | Crd Note | 13996 | DN#20888-EMPTY | CYL | -7,590.00 | -15,108.52 | T0070 CN_DN_PAIR ✓ ↔ Inv 48068 |
| 03 Dec 2025 | Invoice | 48067 | DN#20888 | LPG | 7,484.10 | -7,624.42 | T0201 EXACT_SINGLE ✓ ↔ Pmt 42635 |
| 03 Dec 2025 | Invoice | 48068 | DN#20888-EMPTY | CYL | 7,590.00 | -34.42 | T0070 CN_DN_PAIR ✓ ↔ Crd Note 13996 |
| 09 Dec 2025 | Bank UD | 42621 | TRANSF \| STAT:122 | LPG | 7,360.82 | 7,326.40 | T0017 UD_CLEARING ✓ |
| 09 Dec 2025 | Payment | 42621 | TRANSF \| STAT:122 | LPG | -7,360.82 | -34.42 | T0017 UD_CLEARING ✓ |
| 09 Dec 2025 | Payment | 42635 | TRANSF \| STAT:122 | LPG | -7,484.10 | -7,518.52 | T0201 EXACT_SINGLE ✓ ↔ Inv 48067 |
| 11 Dec 2025 | Crd Note | 14053 | DN#21407-EMPTY | CYL | -6,037.50 | -13,556.02 | T0071 CN_DN_PAIR ✓ ↔ Inv 48217 |
| 11 Dec 2025 | Invoice | 48216 | DN#21407 | LPG | 6,757.63 | -6,798.39 | T0202 EXACT_SINGLE ✓ ↔ Pmt 42637 |
| 11 Dec 2025 | Invoice | 48217 | DN#21407-EMPTY | CYL | 6,037.50 | -760.89 | T0071 CN_DN_PAIR ✓ ↔ Crd Note 14053 |
| 17 Dec 2025 | Payment | 42636 | TRANSF \| STAT:122 | LPG | -517.50 | -1,278.39 | OPEN |
| 17 Dec 2025 | Payment | 42637 | TRANSF \| STAT:122 | LPG | -6,757.63 | -8,036.02 | T0202 EXACT_SINGLE ✓ ↔ Inv 48216 |
| 22 Dec 2025 | Crd Note | 14139 | DN#21434-EMPTY | CYL | -7,072.50 | -15,108.52 | T0072 CN_DN_PAIR ✓ ↔ Inv 48423 |
| 22 Dec 2025 | Invoice | 48422 | DN#21434 | LPG | 7,264.46 | -7,844.06 | T0203 EXACT_SINGLE ✓ ↔ Pmt 42889 |
| 22 Dec 2025 | Invoice | 48423 | DN#21434-EMPTY | CYL | 7,072.50 | -771.56 | T0072 CN_DN_PAIR ✓ ↔ Crd Note 14139 |

### January 2026

Opening balance (ERP running): **R-771.56**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Jan 2026 | Payment | 42889 | TRANSF \| STAT:122 | LPG | -7,264.46 | -8,036.02 | T0203 EXACT_SINGLE ✓ ↔ Inv 48422 |
| 07 Jan 2026 | Invoice | 48651 | DN 21754 | LPG | 760.24 | -7,275.78 | T0204 EXACT_SINGLE ✓ ↔ Pmt 42997 |
| 07 Jan 2026 | Invoice | 48651 | DN 21754 | OTHER | 974.05 | -6,301.73 | T0204 EXACT_SINGLE ✓ ↔ Pmt 42997 |
| 08 Jan 2026 | Crd Note | 14221 | DN21754-EMPTY | CYL | -1,552.50 | -7,854.23 | T0073 CN_DN_PAIR ✓ ↔ Inv 48682 |
| 08 Jan 2026 | Invoice | 48682 | DN21754-EMPTY | CYL | 1,552.50 | -6,301.73 | T0073 CN_DN_PAIR ✓ ↔ Crd Note 14221 |
| 12 Jan 2026 | Payment | 42997 | TRANSF \| STAT:122 | LPG | -1,734.29 | -8,036.02 | T0204 EXACT_SINGLE ✓ ↔ Inv 48651 |
| 12 Jan 2026 | Invoice | 48739 | DN#20976 | LPG | 6,757.63 | -1,278.39 | T0205 EXACT_SINGLE ✓ ↔ Pmt 43003 |
| 12 Jan 2026 | Invoice | 48740 | DN#20976-EMPTY | CYL | 6,037.50 | 4,759.11 | T0074 CN_DN_PAIR ✓ ↔ Crd Note 14252 |
| 12 Jan 2026 | Invoice | 48745 | DN-21631 | OTHER | 838.35 | 5,597.46 | T0206 EXACT_SINGLE ✓ ↔ Pmt 43004 |
| 13 Jan 2026 | Crd Note | 14252 | DN#20976-EMPTY | CYL | -6,037.50 | -440.04 | T0074 CN_DN_PAIR ✓ ↔ Inv 48740 |
| 16 Jan 2026 | Payment | 43003 | TRANSF \| STAT:122 | LPG | -6,757.63 | -7,197.67 | T0205 EXACT_SINGLE ✓ ↔ Inv 48739 |
| 16 Jan 2026 | Payment | 43004 | TRANSF \| STAT:122 | LPG | -838.35 | -8,036.02 | T0206 EXACT_SINGLE ✓ ↔ Inv 48745 |
| 26 Jan 2026 | Crd Note | 14331 | DN-21665-EMPTY | CYL | -6,555.00 | -14,591.02 | T0075 CN_DN_PAIR ✓ ↔ Inv 48939 |
| 26 Jan 2026 | Invoice | 48936 | DN/ | LPG | 7,054.95 | -7,536.07 | T0207 EXACT_SINGLE ✓ ↔ Pmt 43162 |
| 26 Jan 2026 | Invoice | 48939 | DN-21665-EMPTY | CYL | 6,555.00 | -981.07 | T0075 CN_DN_PAIR ✓ ↔ Crd Note 14331 |
| 28 Jan 2026 | Payment | 43162 | TRANSF \| STAT:122 | LPG | -7,054.95 | -8,036.02 | T0207 EXACT_SINGLE ✓ ↔ Inv 48936 |

### February 2026

Opening balance (ERP running): **R-8,036.02**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 11 Feb 2026 | Crd Note | 14412 | DN#21247-EMPTY | CYL | -7,072.50 | -15,108.52 | T0076 CN_DN_PAIR ✓ ↔ Inv 49194 |
| 11 Feb 2026 | Invoice | 49193 | DN#21247 | LPG | 7,381.33 | -7,727.19 | T0208 EXACT_SINGLE ✓ ↔ Pmt 43374 |
| 11 Feb 2026 | Invoice | 49194 | DN#21247-EMPTY | CYL | 7,072.50 | -654.69 | T0076 CN_DN_PAIR ✓ ↔ Crd Note 14412 |
| 11 Feb 2026 | Invoice | 49204 | SM CYL RENTAL | CYL | 6,960.00 | 6,305.31 | OPEN |
| 18 Feb 2026 | Payment | 43374 | TRANSF \| STAT:123 | LPG | -7,381.33 | -1,076.02 | T0208 EXACT_SINGLE ✓ ↔ Inv 49193 |

### March 2026

Opening balance (ERP running): **R-1,076.02**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Mar 2026 | Crd Note | 14531 | DN#22110-EMPTY | CYL | -7,072.50 | -8,148.52 | T0077 CN_DN_PAIR ✓ ↔ Inv 49555 |
| 04 Mar 2026 | Invoice | 49554 | DN#22110 | LPG | 7,381.33 | -767.19 | T0209 EXACT_SINGLE ✓ ↔ Pmt 43653 |
| 04 Mar 2026 | Invoice | 49555 | DN#22110-EMPTY | CYL | 7,072.50 | 6,305.31 | T0077 CN_DN_PAIR ✓ ↔ Crd Note 14531 |
| 11 Mar 2026 | Payment | 43653 | TRANSF \| STAT:124 | LPG | -7,381.33 | -1,076.02 | T0209 EXACT_SINGLE ✓ ↔ Inv 49554 |
| 18 Mar 2026 | Crd Note | 14613 | DN#22135-EMPTY | CYL | -7,072.50 | -8,148.52 | T0078 CN_DN_PAIR ✓ ↔ Inv 49795 |
| 18 Mar 2026 | Invoice | 49794 | DN#22135 | LPG | 7,432.90 | -715.62 | T0210 EXACT_SINGLE ✓ ↔ Pmt 43758 |
| 18 Mar 2026 | Invoice | 49795 | DN#22135-EMPTY | CYL | 7,072.50 | 6,356.88 | T0078 CN_DN_PAIR ✓ ↔ Crd Note 14613 |
| 24 Mar 2026 | Payment | 43758 | TRANSF \| STAT:124 | LPG | -7,432.90 | -1,076.02 | T0210 EXACT_SINGLE ✓ ↔ Inv 49794 |

### April 2026

Opening balance (ERP running): **R-1,076.02**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Apr 2026 | Crd Note | 14703 | DN-21856-EMPTY | CYL | -7,590.00 | -8,666.02 | T0079 CN_DN_PAIR ✓ ↔ Inv 50063 |
| 02 Apr 2026 | Invoice | 50062 | DN-21856 | LPG | 8,493.21 | -172.81 | T0211 EXACT_SINGLE ✓ ↔ Pmt 43966 |
| 02 Apr 2026 | Invoice | 50063 | DN-21856-EMPTY | CYL | 7,590.00 | 7,417.19 | T0079 CN_DN_PAIR ✓ ↔ Crd Note 14703 |
| 09 Apr 2026 | Payment | 43966 | TRANSF \| STAT:125 | LPG | -8,493.21 | -1,076.02 | T0211 EXACT_SINGLE ✓ ↔ Inv 50062 |
| 17 Apr 2026 | Invoice | 50273 | DN-22328 | LPG | 8,206.92 | 7,130.90 | T0212 EXACT_SINGLE ✓ ↔ Pmt 44067 |
| 17 Apr 2026 | Invoice | 50274 | DN-22328-EMPTY | CYL | 7,072.50 | 14,203.40 | T0005 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 14768 |
| 19 Apr 2026 | Crd Note | 14768 | DN-22328-EMPTY | CYL | -7,072.50 | 7,130.90 | T0005 LOCKED:OPERATOR_RULING [exact] ↔ Inv 50274 |
| 21 Apr 2026 | Payment | 44067 | TRANSF \| STAT:125 | LPG | -8,206.92 | -1,076.02 | T0212 EXACT_SINGLE ✓ ↔ Inv 50273 |

### May 2026

Opening balance (ERP running): **R-1,076.02**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 May 2026 | Crd Note | 14854 | DN#22220-EMPTY | CYL | -7,590.00 | -8,666.02 | T0080 CN_DN_PAIR ✓ ↔ Inv 50515 |
| 05 May 2026 | Invoice | 50513 | DN#22220 | LPG | 8,493.21 | -172.81 | T0213 EXACT_SINGLE ✓ ↔ Pmt 44300 |
| 05 May 2026 | Invoice | 50513 | DN#22220 | OTHER | 1,000.50 | 827.69 | T0213 EXACT_SINGLE ✓ ↔ Pmt 44300 |
| 05 May 2026 | Invoice | 50515 | DN#22220-EMPTY | CYL | 7,590.00 | 8,417.69 | T0080 CN_DN_PAIR ✓ ↔ Crd Note 14854 |
| 11 May 2026 | Payment | 44300 | TRANSF \| STAT:126 | LPG | -9,493.71 | -1,076.02 | T0213 EXACT_SINGLE ✓ ↔ Inv 50513 |
| 21 May 2026 | Crd Note | 14939 | DN#22393-EMPTY | CYL | -7,590.00 | -8,666.02 | T0081 CN_DN_PAIR ✓ ↔ Inv 50809 |
| 21 May 2026 | Invoice | 50808 | DN#22393 | LPG | 9,671.37 | 1,005.35 | T0214 EXACT_SINGLE ✓ ↔ Pmt 44560 |
| 21 May 2026 | Invoice | 50809 | DN#22393-EMPTY | CYL | 7,590.00 | 8,595.35 | T0081 CN_DN_PAIR ✓ ↔ Crd Note 14939 |

### June 2026

Opening balance (ERP running): **R8,595.35**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Jun 2026 | Payment | 44560 | TRANSF \| STAT:127 | LPG | -9,671.37 | -1,076.02 | T0214 EXACT_SINGLE ✓ ↔ Inv 50808 |
| 09 Jun 2026 | Invoice | 51107 | — | LPG | 9,311.22 | 8,235.20 | T0215 EXACT_SINGLE ✓ ↔ Pmt 44753 |
| 15 Jun 2026 | Payment | 44753 | TRANSF \| STAT:127 | LPG | -9,311.22 | -1,076.02 | T0215 EXACT_SINGLE ✓ ↔ Inv 51107 |
| 23 Jun 2026 | Invoice | 51372 | DN#22657 | LPG | 8,683.50 | 7,607.48 | T0216 EXACT_SINGLE ✓ ↔ Pmt 44968 |
| 23 Jun 2026 | Invoice | 51373 | DN#22657-EMPTY | CYL | 6,555.00 | 14,162.48 | T0082 CN_DN_PAIR ✓ ↔ Crd Note 15113 |
| 24 Jun 2026 | Crd Note | 15113 | DN#22657-EMPTY | CYL | -6,555.00 | 7,607.48 | T0082 CN_DN_PAIR ✓ ↔ Inv 51373 |
| 29 Jun 2026 | Payment | 44968 | TRANSF \| STAT:127 | LPG | -8,683.50 | -1,076.02 | T0216 EXACT_SINGLE ✓ ↔ Inv 51372 |

### July 2026

Opening balance (ERP running): **R-1,076.02**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Jul 2026 | Invoice | 51705 | DN#24202 | LPG | 9,034.40 | 7,958.38 | T0217 EXACT_SINGLE ✓ ↔ Pmt 45209 |
| 08 Jul 2026 | Invoice | 51706 | DN#24202=EMPTY | CYL | 7,072.50 | 15,030.88 | T0083 CN_DN_PAIR ✓ ↔ Crd Note 15227 |
| 09 Jul 2026 | Crd Note | 15227 | DN#24202=EMPTY | CYL | -7,072.50 | 7,958.38 | T0083 CN_DN_PAIR ✓ ↔ Inv 51706 |
| 15 Jul 2026 | Payment | 45209 | TRANSF \| STAT:128 | LPG | -9,034.40 | -1,076.02 | T0217 EXACT_SINGLE ✓ ↔ Inv 51705 |
| 22 Jul 2026 | Invoice | 52014 | DN#23902 | LPG | 9,349.56 | 8,273.54 | T0218 EXACT_SINGLE ✓ ↔ Pmt 45480 |
| 22 Jul 2026 | Invoice | 52015 | DN#23902=EMPTY | CYL | 7,590.00 | 15,863.54 | T0084 CN_DN_PAIR ✓ ↔ Crd Note 15312 |
| 23 Jul 2026 | Crd Note | 15312 | DN#23902=EMPTY | CYL | -7,590.00 | 8,273.54 | T0084 CN_DN_PAIR ✓ ↔ Inv 52015 |
| 31 Jul 2026 | Payment | 45480 | TRANSF \| STAT:128 | LPG | -9,349.56 | -1,076.02 | T0218 EXACT_SINGLE ✓ ↔ Inv 52014 |

### August 2026

Opening balance (ERP running): **R-1,076.02**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 20 Aug 2026 | Crd Note | 15531 | DN#22890-EMPTY | CYL | -1,725.00 | -2,801.02 | T0085 CN_DN_PAIR ✓ ↔ Inv 52750 |
| 20 Aug 2026 | Crd Note | 15532 | DN#22890-EMPTY | CYL | -2,415.00 | -5,216.02 | OPEN |
| 20 Aug 2026 | Invoice | 52691 | DN#22890 | LPG | 3,284.35 | -1,931.67 | T0219 EXACT_SINGLE ✓ ↔ Pmt 45896 |
| 20 Aug 2026 | Invoice | 52750 | DN#22890-EMPTY | CYL | 1,725.00 | -206.67 | T0085 CN_DN_PAIR ✓ ↔ Crd Note 15531 |
| 20 Aug 2026 | Invoice | 52751 | DN#22890-EMPTY | CYL | 2,932.50 | 2,725.83 | OPEN |
| 24 Aug 2026 | Payment | 45896 | TRANSF \| STAT:129 | LPG | -3,284.35 | -558.52 | T0219 EXACT_SINGLE ✓ ↔ Inv 52691 |
| 26 Aug 2026 | Crd Note | 15558 | DN#22890-EMPTY | CYL | -15,697.50 | -16,256.02 | OPEN |
| 26 Aug 2026 | Crd Note | 15558 | DN#22890-EMPTY | LPG | -3,002.83 | -19,258.85 | OPEN |

### September 2026

Opening balance (ERP running): **R-19,258.85**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Sept 2026 | Bank XFer | 7473 | STAT 130 | LPG | 3,002.33 | -16,256.52 | OPEN |

---

## Ties by rule

| Rule | Confirmed | Probable |
| :--- | ---: | ---: |
| LOCKED | 14 | 0 |
| UD_CLEARING | 3 | 0 |
| CN_DN_PAIR | 68 | 0 |
| EXACT_SINGLE | 134 | 0 |

Proof: holds (rebuilt R-16,256.52 vs closing R-16,256.52; ERP R-16,256.52).

