# Internal ledger: FIRE AND VINE (FIR001), matcher review
**INTERNAL, not for the customer.** Every transaction in ERP order with the ERP running balance and what matcher v5 did with it · generated 2026-10-09 · 154 confirmed / 9 probable ties · 21 rows open · ERP `CURRENT BALANCE` R9,469.77 · PROPOSED — NOT RATIFIED · **REVIEW ONLY:** ingestCoverage partial

**Status key:** `OPEN` untied · `T0001 EXACT_SINGLE ✓` confirmed tie · `T0001 BATCH_SUM ?` probable tie (needs approval) · `LOCKED` operator-approved lock · `◀ ZERO` ERP running balance is within R0.05 after this line.

---

### December 2022

Opening balance (ERP running): **R25,752.41**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 29 Dec 2022 | Payment | 17570 | TRANSF \| STAT90 | LPG | -6,316.11 | 19,436.30 | OPEN |

### January 2023

Opening balance (ERP running): **R19,436.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Jan 2023 | Payment | 17655 | TRANSF \| STAT90 | LPG | -6,087.81 | 13,348.49 | OPEN |
| 18 Jan 2023 | Payment | 17786 | TRANSF \| STAT90 | LPG | -6,258.19 | 7,090.30 | OPEN |
| 24 Jan 2023 | Payment | 17849 | TRANSF \| STAT90 | LPG | -6,492.87 | 597.43 | OPEN |

### March 2025

Opening balance (ERP running): **R597.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Mar 2025 | Crd Note | 11993 | DN#11723-EMPTY | CYL | -6,555.00 | -5,957.57 | T0020 CN_DN_PAIR ✓ ↔ Inv 41191 |
| 04 Mar 2025 | Invoice | 41174 | DN#11720 | LPG | 7,326.20 | 1,368.63 | T0093 EXACT_SINGLE ✓ ↔ Pmt 37377 |
| 04 Mar 2025 | Invoice | 41191 | DN#11723-EMPTY | CYL | 6,555.00 | 7,923.63 | T0020 CN_DN_PAIR ✓ ↔ Crd Note 11993 |
| 07 Mar 2025 | Payment | 37377 | TRANSF \| STAT 112 | LPG | -7,326.20 | 597.43 | T0093 EXACT_SINGLE ✓ ↔ Inv 41174 |
| 10 Mar 2025 | Invoice | 41366 | D/N12910 | LPG | 7,326.20 | 7,923.63 | T0094 EXACT_SINGLE ✓ ↔ Pmt 37563 |
| 15 Mar 2025 | Payment | 37563 | TRANSF \| STAT 112 | LPG | -7,326.20 | 597.43 | T0094 EXACT_SINGLE ✓ ↔ Inv 41366 |
| 17 Mar 2025 | Invoice | 41536 | DN#441 | LPG | 7,326.20 | 7,923.63 | T0095 EXACT_SINGLE ✓ ↔ Pmt 37587 |
| 17 Mar 2025 | Invoice | 41537 | DN#4441-EMPTY | CYL | 6,555.00 | 14,478.63 | T0021 CN_DN_PAIR ✓ ↔ Crd Note 12085 |
| 18 Mar 2025 | Crd Note | 12085 | DN#4441-EMPTY | CYL | -6,555.00 | 7,923.63 | T0021 CN_DN_PAIR ✓ ↔ Inv 41537 |
| 20 Mar 2025 | Payment | 37587 | TRANSF \| STAT 112 | LPG | -7,326.20 | 597.43 | T0095 EXACT_SINGLE ✓ ↔ Inv 41536 |
| 25 Mar 2025 | Crd Note | 12124 | DN#12978-EMPTY | CYL | -6,555.00 | -5,957.57 | T0022 CN_DN_PAIR ✓ ↔ Inv 41715 |
| 25 Mar 2025 | Invoice | 41714 | DN#12978 | LPG | 7,326.20 | 1,368.63 | T0096 EXACT_SINGLE ✓ ↔ Pmt 37779 |
| 25 Mar 2025 | Invoice | 41715 | DN#12978-EMPTY | CYL | 6,555.00 | 7,923.63 | T0022 CN_DN_PAIR ✓ ↔ Crd Note 12124 |
| 27 Mar 2025 | Payment | 37779 | TRANSF \| STAT 112 | LPG | -7,326.20 | 597.43 | T0096 EXACT_SINGLE ✓ ↔ Inv 41714 |

### April 2025

Opening balance (ERP running): **R597.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Apr 2025 | Invoice | 41897 | DN#12833 | LPG | 7,326.20 | 7,923.63 | T0097 EXACT_SINGLE ✓ ↔ Pmt 38064 |
| 01 Apr 2025 | Invoice | 41898 | DN#12833-EMPTY | CYL | 6,555.00 | 14,478.63 | T0023 CN_DN_PAIR ✓ ↔ Crd Note 12175 |
| 02 Apr 2025 | Crd Note | 12175 | DN#12833-EMPTY | CYL | -6,555.00 | 7,923.63 | T0023 CN_DN_PAIR ✓ ↔ Inv 41898 |
| 07 Apr 2025 | Crd Note | 12209 | DN#4469- EMPTY | CYL | -6,555.00 | 1,368.63 | T0024 CN_DN_PAIR ✓ ↔ Inv 42052 |
| 07 Apr 2025 | Payment | 38064 | TRANSF \| STAT 113 | LPG | -7,326.20 | -5,957.57 | T0097 EXACT_SINGLE ✓ ↔ Inv 41897 |
| 07 Apr 2025 | Invoice | 42051 | DN#4469 | LPG | 7,156.96 | 1,199.39 | T0098 EXACT_SINGLE ✓ ↔ Pmt 38107 |
| 07 Apr 2025 | Invoice | 42052 | DN#4469- EMPTY | CYL | 6,555.00 | 7,754.39 | T0024 CN_DN_PAIR ✓ ↔ Crd Note 12209 |
| 14 Apr 2025 | Crd Note | 12270 | DN#13060-EMPTY | CYL | -6,037.50 | 1,716.89 | T0025 CN_DN_PAIR ✓ ↔ Inv 42248 |
| 14 Apr 2025 | Payment | 38107 | TRANSF \| STAT 113 | LPG | -7,156.96 | -5,440.07 | T0098 EXACT_SINGLE ✓ ↔ Inv 42051 |
| 14 Apr 2025 | Invoice | 42247 | DN#13060 | LPG | 6,898.28 | 1,458.21 | T0099 EXACT_SINGLE ✓ ↔ Pmt 38147 |
| 14 Apr 2025 | Invoice | 42248 | DN#13060-EMPTY | CYL | 6,037.50 | 7,495.71 | T0025 CN_DN_PAIR ✓ ↔ Crd Note 12270 |
| 17 Apr 2025 | Payment | 38147 | TRANSF \| STAT 113 | LPG | -6,898.28 | 597.43 | T0099 EXACT_SINGLE ✓ ↔ Inv 42247 |
| 22 Apr 2025 | Invoice | 42433 | DN#13084 | LPG | 7,156.96 | 7,754.39 | T0100 EXACT_SINGLE ✓ ↔ Pmt 38301 |
| 29 Apr 2025 | Payment | 38301 | TRANSF \| STAT 113 | LPG | -7,156.96 | 597.43 | T0100 EXACT_SINGLE ✓ ↔ Inv 42433 |
| 30 Apr 2025 | Invoice | 42698 | DN#13123 | LPG | 7,156.96 | 7,754.39 | T0101 EXACT_SINGLE ✓ ↔ Pmt 38524 |
| 30 Apr 2025 | Invoice | 42699 | DN#13123-EMPTY | CYL | 6,555.00 | 14,309.39 | T0026 CN_DN_PAIR ? ↔ Crd Note 12410 |

### May 2025

Opening balance (ERP running): **R14,309.39**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 May 2025 | Crd Note | 12410 | DN#13123-EMPTY | CYL | -6,555.00 | 7,754.39 | T0026 CN_DN_PAIR ? ↔ Inv 42699 |
| 06 May 2025 | Crd Note | 12424 | DN#12059-EMPTY | CYL | -6,555.00 | 1,199.39 | T0027 CN_DN_PAIR ✓ ↔ Inv 42846 |
| 06 May 2025 | Payment | 38524 | TRANSF \| STAT 114 | LPG | -7,156.96 | -5,957.57 | T0101 EXACT_SINGLE ✓ ↔ Inv 42698 |
| 06 May 2025 | Invoice | 42845 | DN#12059 | LPG | 7,156.96 | 1,199.39 | T0102 EXACT_SINGLE ✓ ↔ Pmt 38809 |
| 06 May 2025 | Invoice | 42846 | DN#12059-EMPTY | CYL | 6,555.00 | 7,754.39 | T0027 CN_DN_PAIR ✓ ↔ Crd Note 12424 |
| 13 May 2025 | Crd Note | 12469 | DN#12077-EMPTY | CYL | -6,555.00 | 1,199.39 | T0028 CN_DN_PAIR ✓ ↔ Inv 43009 |
| 13 May 2025 | Invoice | 43008 | DN#12077 | LPG | 7,156.96 | 8,356.35 | T0103 EXACT_SINGLE ✓ ↔ Pmt 38810 |
| 13 May 2025 | Invoice | 43009 | DN#12077-EMPTY | CYL | 6,555.00 | 14,911.35 | T0028 CN_DN_PAIR ✓ ↔ Crd Note 12469 |
| 15 May 2025 | Payment | 38809 | TRANSF \| STAT 114 | LPG | -7,156.96 | 7,754.39 | T0102 EXACT_SINGLE ✓ ↔ Inv 42845 |
| 15 May 2025 | Payment | 38810 | TRANSF \| STAT 114 | LPG | -7,156.96 | 597.43 | T0103 EXACT_SINGLE ✓ ↔ Inv 43008 |
| 21 May 2025 | Invoice | 43243 | DN#12105 | LPG | 7,256.52 | 7,853.95 | T0104 EXACT_SINGLE ✓ ↔ Pmt 38924 |
| 21 May 2025 | Invoice | 43244 | DN#12105-EMPTY | CYL | 6,555.00 | 14,408.95 | T0029 CN_DN_PAIR ✓ ↔ Crd Note 12534 |
| 22 May 2025 | Crd Note | 12534 | DN#12105-EMPTY | CYL | -6,555.00 | 7,853.95 | T0029 CN_DN_PAIR ✓ ↔ Inv 43244 |
| 27 May 2025 | Payment | 38924 | TRANSF \| STAT 114 | LPG | -7,256.52 | 597.43 | T0104 EXACT_SINGLE ✓ ↔ Inv 43243 |
| 28 May 2025 | Invoice | 43422 | DN#12475 | LPG | 7,256.52 | 7,853.95 | T0105 EXACT_SINGLE ✓ ↔ Pmt 39081 |
| 28 May 2025 | Invoice | 43423 | DN#12475-EMPTY | CYL | 6,555.00 | 14,408.95 | T0030 CN_DN_PAIR ✓ ↔ Crd Note 12585 |
| 29 May 2025 | Crd Note | 12585 | DN#12475-EMPTY | CYL | -6,555.00 | 7,853.95 | T0030 CN_DN_PAIR ✓ ↔ Inv 43423 |
| 30 May 2025 | Payment | 39081 | TRANSF \| STAT 114 | LPG | -7,256.52 | 597.43 | T0105 EXACT_SINGLE ✓ ↔ Inv 43422 |

### June 2025

Opening balance (ERP running): **R597.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Jun 2025 | Invoice | 43650 | DN#12150 | LPG | 7,256.52 | 7,853.95 | T0118 EXACT_SINGLE ✓ ↔ Pmt 41439 |
| 05 Jun 2025 | Invoice | 43651 | DN#12150-EMPTY | CYL | 6,555.00 | 14,408.95 | T0031 CN_DN_PAIR ✓ ↔ Crd Note 12641 |
| 06 Jun 2025 | Crd Note | 12641 | DN#12150-EMPTY | CYL | -6,555.00 | 7,853.95 | T0031 CN_DN_PAIR ✓ ↔ Inv 43651 |
| 12 Jun 2025 | Crd Note | 12709 | DN#12559 | CYL | -6,555.00 | 1,298.95 | T0032 CN_DN_PAIR ✓ ↔ Inv 43861 |
| 12 Jun 2025 | Invoice | 43860 | DN#12559-EMPTY | LPG | 7,064.85 | 8,363.80 | T0106 EXACT_SINGLE ✓ ↔ Pmt 39541 |
| 12 Jun 2025 | Invoice | 43861 | DN#12559 | CYL | 6,555.00 | 14,918.80 | T0032 CN_DN_PAIR ✓ ↔ Crd Note 12709 |
| 17 Jun 2025 | Invoice | 44009 | DN#12400 | LPG | 7,064.85 | 21,983.65 | T0107 EXACT_SUM ✓ ↔ Pmt 39625, Inv 44202 |
| 17 Jun 2025 | Invoice | 44010 | DN#12400-EMPTY | CYL | 6,555.00 | 28,538.65 | T0033 CN_DN_PAIR ✓ ↔ Crd Note 12752 |
| 18 Jun 2025 | Crd Note | 12752 | DN#12400-EMPTY | CYL | -6,555.00 | 21,983.65 | T0033 CN_DN_PAIR ✓ ↔ Inv 44010 |
| 23 Jun 2025 | Payment | 39541 | TRANSF \| STAT 115 | LPG | -7,064.85 | 14,918.80 | T0106 EXACT_SINGLE ✓ ↔ Inv 43860 |
| 24 Jun 2025 | Invoice | 44202 | DN#12324 | LPG | 7,064.85 | 21,983.65 | T0107 EXACT_SUM ✓ ↔ Pmt 39625, Inv 44009 |
| 24 Jun 2025 | Invoice | 44203 | DN#12324-EMPTY | CYL | 6,555.00 | 28,538.65 | T0034 CN_DN_PAIR ✓ ↔ Crd Note 12811 |
| 25 Jun 2025 | Crd Note | 12811 | DN#12324-EMPTY | CYL | -6,555.00 | 21,983.65 | T0034 CN_DN_PAIR ✓ ↔ Inv 44203 |
| 28 Jun 2025 | Payment | 39625 | TRANSF \| STAT 115 | LPG | -14,129.70 | 7,853.95 | T0107 EXACT_SUM ✓ ↔ Inv 44202, Inv 44009 |
| 30 Jun 2025 | Crd Note | 12856 | DN#12602-EMPTY | CYL | -6,555.00 | 1,298.95 | T0035 CN_DN_PAIR ✓ ↔ Inv 44351 |
| 30 Jun 2025 | Invoice | 44350 | DN#12602 | LPG | 7,064.85 | 8,363.80 | T0108 EXACT_SINGLE ✓ ↔ Pmt 39771 |
| 30 Jun 2025 | Invoice | 44351 | DN#12602-EMPTY | CYL | 6,555.00 | 14,918.80 | T0035 CN_DN_PAIR ✓ ↔ Crd Note 12856 |

### July 2025

Opening balance (ERP running): **R14,918.80**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Jul 2025 | Payment | 39771 | TRANSF \| STAT 116 | LPG | -7,064.85 | 7,853.95 | T0108 EXACT_SINGLE ✓ ↔ Inv 44350 |
| 08 Jul 2025 | Crd Note | 12925 | DN#12671-EMPTY | CYL | -6,555.00 | 1,298.95 | T0036 CN_DN_PAIR ✓ ↔ Inv 44622 |
| 08 Jul 2025 | Invoice | 44621 | DN#12671 | LPG | 6,941.42 | 8,240.37 | T0109 EXACT_SUM ✓ ↔ Pmt 40176, Inv 44819 |
| 08 Jul 2025 | Invoice | 44622 | DN#12671-EMPTY | CYL | 6,555.00 | 14,795.37 | T0036 CN_DN_PAIR ✓ ↔ Crd Note 12925 |
| 14 Jul 2025 | Crd Note | 12984 | DN#12203-EMPTY | CYL | -6,555.00 | 8,240.37 | T0037 CN_DN_PAIR ✓ ↔ Inv 44820 |
| 14 Jul 2025 | Invoice | 44819 | DN#12203 | LPG | 6,941.42 | 15,181.79 | T0109 EXACT_SUM ✓ ↔ Pmt 40176, Inv 44621 |
| 14 Jul 2025 | Invoice | 44820 | DN#12203-EMPTY | CYL | 6,555.00 | 21,736.79 | T0037 CN_DN_PAIR ✓ ↔ Crd Note 12984 |
| 21 Jul 2025 | Crd Note | 13027 | — | CYL | -6,555.00 | 15,181.79 | T0089 CN_AMOUNT_DATE ? ↔ Inv 44987 |
| 21 Jul 2025 | Payment | 40176 | TRANSF \| STAT 116 | LPG | -13,882.84 | 1,298.95 | T0109 EXACT_SUM ✓ ↔ Inv 44819, Inv 44621 |
| 21 Jul 2025 | Invoice | 44986 | D/N 12219 | LPG | 6,941.42 | 8,240.37 | T0110 EXACT_SINGLE ✓ ↔ Pmt 40267 |
| 21 Jul 2025 | Invoice | 44987 | — | CYL | 6,555.00 | 14,795.37 | T0089 CN_AMOUNT_DATE ? ↔ Crd Note 13027 |
| 23 Jul 2025 | Payment | 40267 | TRANSF \| STAT 116 | LPG | -6,941.42 | 7,853.95 | T0110 EXACT_SINGLE ✓ ↔ Inv 44986 |
| 28 Jul 2025 | Invoice | 45201 | D/N20021 | LPG | 6,941.42 | 14,795.37 | T0111 EXACT_SINGLE ✓ ↔ Pmt 40449 |
| 28 Jul 2025 | Invoice | 45202 | D/N 20021 | CYL | 6,555.00 | 21,350.37 | T0038 CN_DN_PAIR ✓ ↔ Crd Note 13070 |
| 29 Jul 2025 | Crd Note | 13070 | D/N 20021 | CYL | -6,555.00 | 14,795.37 | T0038 CN_DN_PAIR ✓ ↔ Inv 45202 |

### August 2025

Opening balance (ERP running): **R14,795.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Aug 2025 | Crd Note | 13123 | DN#20213-EMPTY | CYL | -6,037.50 | 8,757.87 | T0162 CYL_EXCHANGE ✓ ↔ Inv 45361, Crd Note 13195 |
| 04 Aug 2025 | Payment | 40449 | TRANSF \| STAT 117 | LPG | -6,941.42 | 1,816.45 | T0111 EXACT_SINGLE ✓ ↔ Inv 45201 |
| 04 Aug 2025 | Invoice | 45360 | DN#20213 | LPG | 6,941.42 | 8,757.87 | T0115 EXACT_SUM ✓ ↔ Pmt 41112, Inv 46048 |
| 04 Aug 2025 | Invoice | 45361 | DN#20213-EMPTY | CYL | 6,555.00 | 15,312.87 | T0162 CYL_EXCHANGE ✓ ↔ Crd Note 13123, Crd Note 13195 |
| 11 Aug 2025 | Crd Note | 13193 | DN#20307-EMPTY | CYL | -6,037.50 | 9,275.37 | T0039 CN_DN_PAIR ✓ ↔ Inv 45580 |
| 11 Aug 2025 | Crd Note | 13195 | DN#20213-DN20307 | CYL | -517.50 | 8,757.87 | T0162 CYL_EXCHANGE ✓ ↔ Crd Note 13123, Inv 45361 |
| 11 Aug 2025 | Invoice | 45579 | DN#20307 | LPG | 6,690.53 | 15,448.40 | T0112 EXACT_SINGLE ✓ ↔ Pmt 40734 |
| 11 Aug 2025 | Invoice | 45580 | DN#20307-EMPTY | CYL | 6,037.50 | 21,485.90 | T0039 CN_DN_PAIR ✓ ↔ Crd Note 13193 |
| 16 Aug 2025 | Payment | 40734 | TRANSF \| STAT 117 | LPG | -6,690.53 | 14,795.37 | T0112 EXACT_SINGLE ✓ ↔ Inv 45579 |
| 18 Aug 2025 | Crd Note | 13250 | DN#20514-EMPTY | CYL | -6,555.00 | 8,240.37 | T0040 CN_DN_PAIR ✓ ↔ Inv 45719 |
| 18 Aug 2025 | Invoice | 45718 | DN#20514 | LPG | 6,792.52 | 15,032.89 | T0113 EXACT_SINGLE ✓ ↔ Pmt 40743 |
| 18 Aug 2025 | Invoice | 45719 | DN#20514-EMPTY | CYL | 6,555.00 | 21,587.89 | T0040 CN_DN_PAIR ✓ ↔ Crd Note 13250 |
| 20 Aug 2025 | Payment | 40743 | TRANSF \| STAT 117 | LPG | -6,792.52 | 14,795.37 | T0113 EXACT_SINGLE ✓ ↔ Inv 45718 |
| 25 Aug 2025 | Crd Note | 13300 | DN#20438-EMPTY | CYL | -6,555.00 | 8,240.37 | T0041 CN_DN_PAIR ✓ ↔ Inv 45875 |
| 25 Aug 2025 | Invoice | 45874 | DN#20438 | LPG | 6,792.52 | 15,032.89 | T0114 EXACT_SINGLE ✓ ↔ Pmt 40889 |
| 25 Aug 2025 | Invoice | 45875 | DN#20438-EMPTY | CYL | 6,555.00 | 21,587.89 | T0041 CN_DN_PAIR ✓ ↔ Crd Note 13300 |
| 27 Aug 2025 | Payment | 40889 | TRANSF \| STAT 117 | LPG | -6,792.52 | 14,795.37 | T0114 EXACT_SINGLE ✓ ↔ Inv 45874 |

### September 2025

Opening balance (ERP running): **R14,795.37**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Sept 2025 | Crd Note | 13348 | DN#20565-EMPTY | CYL | -6,555.00 | 8,240.37 | T0042 CN_DN_PAIR ✓ ↔ Inv 46049 |
| 01 Sept 2025 | Invoice | 46048 | DN#20565 | LPG | 6,792.52 | 15,032.89 | T0115 EXACT_SUM ✓ ↔ Pmt 41112, Inv 45360 |
| 01 Sept 2025 | Invoice | 46049 | DN#20565-EMPTY | CYL | 6,555.00 | 21,587.89 | T0042 CN_DN_PAIR ✓ ↔ Crd Note 13348 |
| 08 Sept 2025 | Payment | 41112 | TRANSF \| STAT 118 | LPG | -13,733.92 | 7,853.97 | T0115 EXACT_SUM ✓ ↔ Inv 46048, Inv 45360 |
| 10 Sept 2025 | Crd Note | 13435 | DN20478- EMPTY | CYL | -6,555.00 | 1,298.97 | T0043 CN_DN_PAIR ✓ ↔ Inv 46270 |
| 10 Sept 2025 | Invoice | 46269 | DN 20478 | LPG | 6,505.40 | 7,804.37 | T0116 EXACT_SINGLE ✓ ↔ Pmt 41230 |
| 10 Sept 2025 | Invoice | 46270 | DN20478- EMPTY | CYL | 6,555.00 | 14,359.37 | T0043 CN_DN_PAIR ✓ ↔ Crd Note 13435 |
| 11 Sept 2025 | Payment | 41230 | TRANSF \| STAT 118 | LPG | -6,505.40 | 7,853.97 | T0116 EXACT_SINGLE ✓ ↔ Inv 46269 |
| 17 Sept 2025 | Crd Note | 13495 | DN#20388-EMPTY | CYL | -6,555.00 | 1,298.97 | T0044 CN_DN_PAIR ✓ ↔ Inv 46457 |
| 17 Sept 2025 | Invoice | 46456 | DN#20388 | LPG | 6,505.40 | 7,804.37 | T0117 EXACT_MONTH_SUM ✓ ↔ Pmt 41438, Inv 46560 |
| 17 Sept 2025 | Invoice | 46457 | DN#20388-EMPTY | CYL | 6,555.00 | 14,359.37 | T0044 CN_DN_PAIR ✓ ↔ Crd Note 13495 |
| 22 Sept 2025 | Crd Note | 13524 | DN#21052-EMPTY | CYL | -6,555.00 | 7,804.37 | T0045 CN_DN_PAIR ✓ ↔ Inv 46561 |
| 22 Sept 2025 | Invoice | 46560 | DN#21052 | LPG | 6,505.40 | 14,309.77 | T0117 EXACT_MONTH_SUM ✓ ↔ Pmt 41438, Inv 46456 |
| 22 Sept 2025 | Invoice | 46561 | DN#21052-EMPTY | CYL | 6,555.00 | 20,864.77 | T0045 CN_DN_PAIR ✓ ↔ Crd Note 13524 |
| 25 Sept 2025 | Payment | 41438 | TRANSF \| STAT 118 | LPG | -13,010.80 | 7,853.97 | T0117 EXACT_MONTH_SUM ✓ ↔ Inv 46456, Inv 46560 |
| 25 Sept 2025 | Payment | 41439 | TRANSF \| STAT 118 | LPG | -7,256.52 | 597.45 | T0118 EXACT_SINGLE ✓ ↔ Inv 43650 |
| 29 Sept 2025 | Crd Note | 13572 | DN#20281-EMPTY | CYL | -6,037.50 | -5,440.05 | T0046 CN_DN_PAIR ✓ ↔ Inv 46732 |
| 29 Sept 2025 | Invoice | 46731 | DN#20281 | LPG | 6,270.26 | 830.21 | T0119 EXACT_SINGLE ✓ ↔ Pmt 41560 |
| 29 Sept 2025 | Invoice | 46732 | DN#20281-EMPTY | CYL | 6,037.50 | 6,867.71 | T0046 CN_DN_PAIR ✓ ↔ Crd Note 13572 |

### October 2025

Opening balance (ERP running): **R6,867.71**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Oct 2025 | Payment | 41560 | TRANSF \| STAT 119 | LPG | -6,270.26 | 597.45 | T0119 EXACT_SINGLE ✓ ↔ Inv 46731 |
| 04 Oct 2025 | Payment | 41506 | CASH \| T2000222 | LPG | -0.02 | 597.43 | OPEN |
| 06 Oct 2025 | Crd Note | 13622 | DN-20167-EMPTY | CYL | -6,555.00 | -5,957.57 | T0047 CN_DN_PAIR ✓ ↔ Inv 46903 |
| 06 Oct 2025 | Crd Note | 13623 | DN-20167 | LPG | -6,270.26 | -12,227.83 | T0048 CN_DN_PAIR ✓ ↔ Inv 46927 |
| 06 Oct 2025 | Invoice | 46902 | DN-20167 | LPG | 1,489.19 | -10,738.64 | T0049 CN_DN_PAIR ? ↔ Crd Note 13638 |
| 06 Oct 2025 | Invoice | 46903 | DN-20167-EMPTY | CYL | 6,555.00 | -4,183.64 | T0047 CN_DN_PAIR ✓ ↔ Crd Note 13622 |
| 06 Oct 2025 | Invoice | 46927 | DN-20167 | LPG | 6,270.26 | 2,086.62 | T0048 CN_DN_PAIR ✓ ↔ Crd Note 13623 |
| 06 Oct 2025 | Invoice | 46928 | DN-20167 | LPG | 6,505.40 | 8,592.02 | T0120 EXACT_SINGLE ✓ ↔ Pmt 41856 |
| 09 Oct 2025 | Crd Note | 13638 | DN-20167 | LPG | -1,489.19 | 7,102.83 | T0049 CN_DN_PAIR ? ↔ Inv 46902 |
| 13 Oct 2025 | Invoice | 47066 | DN#20188 | LPG | 6,505.40 | 13,608.23 | T0121 EXACT_SINGLE ✓ ↔ Pmt 41960 |
| 13 Oct 2025 | Invoice | 47067 | DN#20`88-EMPTY | CYL | 6,555.00 | 20,163.23 | T0090 CN_AMOUNT_DATE ? ↔ Crd Note 13677 |
| 14 Oct 2025 | Crd Note | 13677 | DN#20`88-EMPTY | CYL | -6,555.00 | 13,608.23 | T0090 CN_AMOUNT_DATE ? ↔ Inv 47067 |
| 16 Oct 2025 | Payment | 41856 | TRANSF \| STAT 119 | LPG | -6,505.40 | 7,102.83 | T0120 EXACT_SINGLE ✓ ↔ Inv 46928 |
| 18 Oct 2025 | Crd Note | 13709 | DN#21108-EMPTY | CYL | -6,555.00 | 547.83 | T0050 CN_DN_PAIR ✓ ↔ Inv 47167 |
| 18 Oct 2025 | Crd Note | 13709 | DN#21108-EMPTY | LPG | -235.14 | 312.69 | OPEN |
| 18 Oct 2025 | Invoice | 47166 | DN#21108 | LPG | 6,505.40 | 6,818.09 | OPEN |
| 18 Oct 2025 | Invoice | 47167 | DN#21108-EMPTY | CYL | 6,555.00 | 13,373.09 | T0050 CN_DN_PAIR ✓ ↔ Crd Note 13709 |
| 20 Oct 2025 | Payment | 41939 | TRANSF \| STAT 119 | LPG | -6,270.26 | 7,102.83 | OPEN |
| 25 Oct 2025 | Crd Note | 13746 | DN#20623-EMPTY | CYL | -6,037.50 | 1,065.33 | T0051 CN_DN_PAIR ✓ ↔ Inv 47306 |
| 25 Oct 2025 | Payment | 41960 | TRANSF \| STAT 119 | LPG | -6,505.40 | -5,440.07 | T0121 EXACT_SINGLE ✓ ↔ Inv 47066 |
| 25 Oct 2025 | Invoice | 47305 | DN#20623 | LPG | 6,270.26 | 830.19 | T0127 EXACT_SINGLE ✓ ↔ Pmt 42534 |
| 25 Oct 2025 | Invoice | 47306 | DN#20623-EMPTY | CYL | 6,037.50 | 6,867.69 | T0051 CN_DN_PAIR ✓ ↔ Crd Note 13746 |

### November 2025

Opening balance (ERP running): **R6,867.69**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Nov 2025 | Crd Note | 13798 | DN#20646-EMPTY | CYL | -7,072.50 | -204.81 | T0052 CN_DN_PAIR ✓ ↔ Inv 47453 |
| 01 Nov 2025 | Invoice | 47452 | DN#20646 | LPG | 6,740.54 | 6,535.73 | T0122 EXACT_SINGLE ✓ ↔ Pmt 42093 |
| 01 Nov 2025 | Invoice | 47453 | DN#20646-EMPTY | CYL | 7,072.50 | 13,608.23 | T0052 CN_DN_PAIR ✓ ↔ Crd Note 13798 |
| 04 Nov 2025 | Payment | 42093 | TRANSF \| STAT 120 | LPG | -6,740.54 | 6,867.69 | T0122 EXACT_SINGLE ✓ ↔ Inv 47452 |
| 08 Nov 2025 | Invoice | 47557 | DN#20781 | LPG | 6,380.89 | 13,248.58 | T0123 EXACT_SINGLE ✓ ↔ Pmt 42295 |
| 15 Nov 2025 | Invoice | 47688 | DN#20790 | LPG | 6,150.26 | 19,398.84 | T0126 EXACT_SINGLE ✓ ↔ Pmt 42523 |
| 17 Nov 2025 | Payment | 42295 | TRANSF \| STAT 120 | LPG | -6,380.89 | 13,017.95 | T0123 EXACT_SINGLE ✓ ↔ Inv 47557 |
| 22 Nov 2025 | Crd Note | 13930 | DN#20858-EMPTY | CYL | -6,555.00 | 6,462.95 | T0053 CN_DN_PAIR ✓ ↔ Inv 47860 |
| 22 Nov 2025 | Invoice | 47859 | DN#20858 | LPG | 6,380.89 | 12,843.84 | T0124 EXACT_SINGLE ✓ ↔ Pmt 42416 |
| 22 Nov 2025 | Invoice | 47860 | DN#20858-EMPTY | CYL | 6,555.00 | 19,398.84 | T0053 CN_DN_PAIR ✓ ↔ Crd Note 13930 |
| 24 Nov 2025 | Payment | 42416 | TRANSF \| STAT 120 | LPG | -6,380.89 | 13,017.95 | T0124 EXACT_SINGLE ✓ ↔ Inv 47859 |
| 27 Nov 2025 | Invoice | 47953 | DN#20869 | LPG | 6,380.89 | 19,398.84 | T0125 EXACT_SINGLE ✓ ↔ Pmt 42513 |
| 27 Nov 2025 | Invoice | 47954 | DN#20869-EMPTY | CYL | 6,555.00 | 25,953.84 | T0054 CN_DN_PAIR ✓ ↔ Crd Note 13957 |
| 28 Nov 2025 | Crd Note | 13957 | DN#20869-EMPTY | CYL | -6,555.00 | 19,398.84 | T0054 CN_DN_PAIR ✓ ↔ Inv 47954 |

### December 2025

Opening balance (ERP running): **R19,398.84**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Dec 2025 | Payment | 42513 | TRANSF \| STAT 121 | LPG | -6,380.89 | 13,017.95 | T0125 EXACT_SINGLE ✓ ↔ Inv 47953 |
| 02 Dec 2025 | Payment | 42523 | TRANSF \| STAT 121 | LPG | -6,150.26 | 6,867.69 | T0126 EXACT_SINGLE ✓ ↔ Inv 47688 |
| 04 Dec 2025 | Crd Note | 14006 | DN-20892 EMPTY | CYL | -6,037.50 | 830.19 | T0055 CN_DN_PAIR ✓ ↔ Inv 48094 |
| 04 Dec 2025 | Invoice | 48093 | DN-20892 | LPG | 6,150.26 | 6,980.45 | T0128 EXACT_SINGLE ✓ ↔ Pmt 42535 |
| 04 Dec 2025 | Invoice | 48094 | DN-20892 EMPTY | CYL | 6,037.50 | 13,017.95 | T0055 CN_DN_PAIR ✓ ↔ Crd Note 14006 |
| 05 Dec 2025 | Payment | 42534 | TRANSF \| STAT 121 | LPG | -6,270.26 | 6,747.69 | T0127 EXACT_SINGLE ✓ ↔ Inv 47305 |
| 05 Dec 2025 | Payment | 42535 | TRANSF \| STAT 121 | LPG | -6,150.26 | 597.43 | T0128 EXACT_SINGLE ✓ ↔ Inv 48093 |
| 11 Dec 2025 | Crd Note | 14054 | DN#21408 -EMPTY | CYL | -6,555.00 | -5,957.57 | T0056 CN_DN_PAIR ✓ ↔ Inv 48220 |
| 11 Dec 2025 | Invoice | 48218 | DN#21408 | LPG | 6,412.39 | 454.82 | T0129 EXACT_SINGLE ✓ ↔ Pmt 42609 |
| 11 Dec 2025 | Invoice | 48220 | DN#21408 -EMPTY | CYL | 6,555.00 | 7,009.82 | T0056 CN_DN_PAIR ✓ ↔ Crd Note 14054 |
| 12 Dec 2025 | Payment | 42609 | TRANSF \| STAT 121 | LPG | -6,412.39 | 597.43 | T0129 EXACT_SINGLE ✓ ↔ Inv 48218 |
| 19 Dec 2025 | Crd Note | 14119 | DN#21723-EMPTY | CYL | -6,555.00 | -5,957.57 | T0057 CN_DN_PAIR ✓ ↔ Inv 48379 |
| 19 Dec 2025 | Payment | 42698 | TRANSF \| STAT 121 | LPG | -6,412.39 | -12,369.96 | T0130 EXACT_SINGLE ✓ ↔ Inv 48378 |
| 19 Dec 2025 | Invoice | 48378 | DN#21723 | LPG | 6,412.39 | -5,957.57 | T0130 EXACT_SINGLE ✓ ↔ Pmt 42698 |
| 19 Dec 2025 | Invoice | 48379 | DN#21723-EMPTY | CYL | 6,555.00 | 597.43 | T0057 CN_DN_PAIR ✓ ↔ Crd Note 14119 |
| 22 Dec 2025 | Invoice | 48436 | DN#20941 | LPG | 6,180.62 | 6,778.05 | T0131 EXACT_SINGLE ✓ ↔ Pmt 42831 |
| 22 Dec 2025 | Invoice | 48437 | DN#20941-EMPTY | CYL | 6,037.50 | 12,815.55 | T0058 CN_DN_PAIR ✓ ↔ Crd Note 14142 |
| 23 Dec 2025 | Crd Note | 14142 | DN#20941-EMPTY | CYL | -6,037.50 | 6,778.05 | T0058 CN_DN_PAIR ✓ ↔ Inv 48437 |
| 24 Dec 2025 | Crd Note | 14153 | DN-20949 | LPG | -6,180.62 | 597.43 | T0059 CN_DN_PAIR ✓ ↔ Inv 48467 |
| 24 Dec 2025 | Crd Note | 14154 | DN-20949-EMPY | CYL | -6,037.50 | -5,440.07 | T0060 CN_DN_PAIR ✓ ↔ Inv 48468 |
| 24 Dec 2025 | Invoice | 48467 | DN-20949 | LPG | 6,180.62 | 740.55 | T0059 CN_DN_PAIR ✓ ↔ Crd Note 14153 |
| 24 Dec 2025 | Invoice | 48468 | DN-20949-EMPY | CYL | 6,037.50 | 6,778.05 | T0060 CN_DN_PAIR ✓ ↔ Crd Note 14154 |
| 27 Dec 2025 | Payment | 42831 | TRANSF \| STAT 121 | LPG | -6,180.62 | 597.43 | T0131 EXACT_SINGLE ✓ ↔ Inv 48436 |
| 29 Dec 2025 | Crd Note | 14171 | DN#21743-EMPTY | CYL | -6,037.50 | -5,440.07 | T0061 CN_DN_PAIR ✓ ↔ Inv 48522 |
| 29 Dec 2025 | Invoice | 48521 | DN#21743 | LPG | 6,180.62 | 740.55 | T0132 EXACT_SINGLE ✓ ↔ Pmt 42845 |
| 29 Dec 2025 | Invoice | 48522 | DN#21743-EMPTY | CYL | 6,037.50 | 6,778.05 | T0061 CN_DN_PAIR ✓ ↔ Crd Note 14171 |
| 31 Dec 2025 | Payment | 42845 | TRANSF \| STAT 121 | LPG | -6,180.62 | 597.43 | T0132 EXACT_SINGLE ✓ ↔ Inv 48521 |

### January 2026

Opening balance (ERP running): **R597.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Jan 2026 | Crd Note | 14264 | DN-21455 | LPG | -6,412.39 | -5,814.96 | T0062 CN_DN_PAIR ✓ ↔ Inv 48662 |
| 08 Jan 2026 | Crd Note | 14319 | DN21455 | CYL | -6,555.00 | -12,369.96 | T0063 CN_DN_PAIR ✓ ↔ Inv 48663 |
| 08 Jan 2026 | Invoice | 48661 | DN 21455 | LPG | 1,467.89 | -10,902.07 | T0064 CN_DN_PAIR ✓ ↔ Crd Note 14233 |
| 08 Jan 2026 | Invoice | 48662 | DN-21455 | LPG | 6,412.39 | -4,489.68 | T0062 CN_DN_PAIR ✓ ↔ Crd Note 14264 |
| 08 Jan 2026 | Invoice | 48663 | DN21455 | CYL | 6,555.00 | 2,065.32 | T0063 CN_DN_PAIR ✓ ↔ Crd Note 14319 |
| 08 Jan 2026 | Invoice | 48912 | DN-21455 | LPG | 6,412.39 | 8,477.71 | T0133 EXACT_SINGLE ✓ ↔ Pmt 42919 |
| 09 Jan 2026 | Crd Note | 14233 | DN 21455 | LPG | -1,467.89 | 7,009.82 | T0064 CN_DN_PAIR ✓ ↔ Inv 48661 |
| 09 Jan 2026 | Payment | 42919 | TRANSF \| STAT 122 | LPG | -6,412.39 | 597.43 | T0133 EXACT_SINGLE ✓ ↔ Inv 48912 |
| 12 Jan 2026 | Invoice | 48741 | DN#20977 | LPG | 6,412.39 | 7,009.82 | T0134 EXACT_SINGLE ✓ ↔ Pmt 42990 |
| 12 Jan 2026 | Invoice | 48742 | DN#20977-EMPTY | CYL | 6,555.00 | 13,564.82 | T0065 CN_DN_PAIR ✓ ↔ Crd Note 14253 |
| 13 Jan 2026 | Crd Note | 14253 | DN#20977-EMPTY | CYL | -6,555.00 | 7,009.82 | T0065 CN_DN_PAIR ✓ ↔ Inv 48742 |
| 15 Jan 2026 | Payment | 42990 | TRANSF \| STAT 122 | LPG | -6,412.39 | 597.43 | T0134 EXACT_SINGLE ✓ ↔ Inv 48741 |
| 19 Jan 2026 | Crd Note | 14292 | DN~21650-EMPTY | CYL | -6,037.50 | -5,440.07 | T0066 CN_DN_PAIR ✓ ↔ Inv 48847 |
| 19 Jan 2026 | Invoice | 48846 | DN~21650 | LPG | 6,222.94 | 782.87 | T0135 EXACT_SINGLE ✓ ↔ Pmt 43073 |
| 19 Jan 2026 | Invoice | 48847 | DN~21650-EMPTY | CYL | 6,037.50 | 6,820.37 | T0066 CN_DN_PAIR ✓ ↔ Crd Note 14292 |
| 22 Jan 2026 | Payment | 43073 | TRANSF \| STAT 122 | LPG | -6,222.94 | 597.43 | T0135 EXACT_SINGLE ✓ ↔ Inv 48846 |
| 26 Jan 2026 | Crd Note | 14334 | DN#21480- EMPTY | CYL | -6,555.00 | -5,957.57 | T0067 CN_DN_PAIR ✓ ↔ Inv 48943 |
| 26 Jan 2026 | Invoice | 48942 | DN#21480 | LPG | 6,456.30 | 498.73 | T0136 EXACT_SINGLE ✓ ↔ Pmt 43156 |
| 26 Jan 2026 | Invoice | 48943 | DN#21480- EMPTY | CYL | 6,555.00 | 7,053.73 | T0067 CN_DN_PAIR ✓ ↔ Crd Note 14334 |
| 30 Jan 2026 | Payment | 43156 | TRANSF \| STAT 122 | LPG | -6,456.30 | 597.43 | T0136 EXACT_SINGLE ✓ ↔ Inv 48942 |
| 31 Jan 2026 | Invoice | 49034 | DN#21232 | LPG | 6,456.30 | 7,053.73 | T0137 EXACT_SINGLE ✓ ↔ Pmt 43227 |
| 31 Jan 2026 | Invoice | 49035 | DN#21232- EMPTY | CYL | 6,555.00 | 13,608.73 | T0068 CN_DN_PAIR ? ↔ Crd Note 14367 |

### February 2026

Opening balance (ERP running): **R13,608.73**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Feb 2026 | Payment | 43227 | TRANSF \| STAT 123 | LPG | -6,456.30 | 7,152.43 | T0137 EXACT_SINGLE ✓ ↔ Inv 49034 |
| 03 Feb 2026 | Crd Note | 14367 | DN#21232- EMPTY | CYL | -6,555.00 | 597.43 | T0068 CN_DN_PAIR ? ↔ Inv 49035 |
| 07 Feb 2026 | Invoice | 49145 | DN-21529 | LPG | 6,289.35 | 6,886.78 | T0138 EXACT_SINGLE ✓ ↔ Pmt 43320 |
| 07 Feb 2026 | Invoice | 49146 | DN-21529-EMPTY | CYL | 6,037.50 | 12,924.28 | T0069 CN_DN_PAIR ? ↔ Crd Note 14396 |
| 09 Feb 2026 | Crd Note | 14396 | DN-21529-EMPTY | CYL | -6,037.50 | 6,886.78 | T0069 CN_DN_PAIR ? ↔ Inv 49146 |
| 11 Feb 2026 | Payment | 43320 | TRANSF \| STAT 123 | LPG | -6,289.35 | 597.43 | T0138 EXACT_SINGLE ✓ ↔ Inv 49145 |
| 13 Feb 2026 | Invoice | 49243 | DN#21255 | LPG | 6,525.20 | 7,122.63 | T0139 EXACT_SINGLE ✓ ↔ Pmt 43395 |
| 13 Feb 2026 | Invoice | 49244 | DN#21255-EMPTY | CYL | 6,555.00 | 13,677.63 | T0070 CN_DN_PAIR ✓ ↔ Crd Note 14428 |
| 14 Feb 2026 | Crd Note | 14428 | DN#21255-EMPTY | CYL | -6,555.00 | 7,122.63 | T0070 CN_DN_PAIR ✓ ↔ Inv 49244 |
| 19 Feb 2026 | Payment | 43395 | TRANSF \| STAT 123 | LPG | -6,525.20 | 597.43 | T0139 EXACT_SINGLE ✓ ↔ Inv 49243 |
| 20 Feb 2026 | Crd Note | 14465 | DN_21916-EMPTY | CYL | -6,555.00 | -5,957.57 | T0071 CN_DN_PAIR ✓ ↔ Inv 49348 |
| 20 Feb 2026 | Invoice | 49347 | DN | LPG | 6,525.20 | 567.63 | T0140 EXACT_SINGLE ✓ ↔ Pmt 43431 |
| 20 Feb 2026 | Invoice | 49348 | DN_21916-EMPTY | CYL | 6,555.00 | 7,122.63 | T0071 CN_DN_PAIR ✓ ↔ Crd Note 14465 |
| 23 Feb 2026 | Payment | 43431 | TRANSF \| STAT 123 | LPG | -6,525.20 | 597.43 | T0140 EXACT_SINGLE ✓ ↔ Inv 49347 |
| 26 Feb 2026 | Invoice | 49458 | DN#21802 | LPG | 6,289.35 | 6,886.78 | OPEN |
| 26 Feb 2026 | Invoice | 49459 | DN#21802-EMPTY | CYL | 6,037.50 | 12,924.28 | T0072 CN_DN_PAIR ? ↔ Crd Note 14521 |

### March 2026

Opening balance (ERP running): **R12,924.28**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Mar 2026 | Crd Note | 14521 | DN#21802-EMPTY | CYL | -6,037.50 | 6,886.78 | T0072 CN_DN_PAIR ? ↔ Inv 49459 |
| 02 Mar 2026 | Payment | 43546 | TRANSF \| STAT 124 | LPG | -6,525.20 | 361.58 | OPEN |
| 09 Mar 2026 | Crd Note | 14562 | DN#22120-EMPTY | CYL | -6,037.50 | -5,675.92 | T0073 CN_DN_PAIR ✓ ↔ Inv 49633 |
| 09 Mar 2026 | Invoice | 49632 | DN#22120 | LPG | 6,337.30 | 661.38 | T0142 EXACT_SINGLE ✓ ↔ Pmt 43717 |
| 09 Mar 2026 | Invoice | 49633 | DN#22120-EMPTY | CYL | 6,037.50 | 6,698.88 | T0073 CN_DN_PAIR ✓ ↔ Crd Note 14562 |
| 12 Mar 2026 | Payment | 43639 | TRANSF \| STAT 124 | LPG | -6,101.45 | 597.43 | OPEN |
| 12 Mar 2026 | Invoice | 49712 | DN#21962 | LPG | 6,812.60 | 7,410.03 | T0141 EXACT_SINGLE ✓ ↔ Pmt 43693 |
| 12 Mar 2026 | Invoice | 49713 | DN#21962-EMPTY | CYL | 7,072.50 | 14,482.53 | T0074 CN_DN_PAIR ✓ ↔ Crd Note 14586 |
| 13 Mar 2026 | Crd Note | 14586 | DN#21962-EMPTY | CYL | -7,072.50 | 7,410.03 | T0074 CN_DN_PAIR ✓ ↔ Inv 49713 |
| 14 Mar 2026 | Payment | 43693 | TRANSF \| STAT 124 | LPG | -6,812.60 | 597.43 | T0141 EXACT_SINGLE ✓ ↔ Inv 49712 |
| 18 Mar 2026 | Invoice | 49805 | DN#22022 | LPG | 6,337.30 | 6,934.73 | T0144 EXACT_SINGLE ✓ ↔ Pmt 43865 |
| 18 Mar 2026 | Invoice | 49806 | DN#22022-EMPTY | CYL | 6,037.50 | 12,972.23 | T0075 CN_DN_PAIR ✓ ↔ Crd Note 14617 |
| 19 Mar 2026 | Crd Note | 14617 | DN#22022-EMPTY | CYL | -6,037.50 | 6,934.73 | T0075 CN_DN_PAIR ✓ ↔ Inv 49806 |
| 19 Mar 2026 | Payment | 43717 | TRANSF \| STAT 124 | LPG | -6,337.30 | 597.43 | T0142 EXACT_SINGLE ✓ ↔ Inv 49632 |
| 20 Mar 2026 | Crd Note | 14632 | DN=00=EMPTY | CYL | -517.50 | 79.93 | T0163 CYL_EXCHANGE ✓ ↔ Inv 49848, Inv 51355, Crd Note 15109 |
| 20 Mar 2026 | Invoice | 49847 | DN=22142 | LPG | 6,574.95 | 6,654.88 | T0143 EXACT_SINGLE ✓ ↔ Pmt 43749 |
| 20 Mar 2026 | Invoice | 49848 | DN=00=EMPTY | CYL | 6,555.00 | 13,209.88 | T0163 CYL_EXCHANGE ✓ ↔ Crd Note 14632, Inv 51355, Crd Note 15109 |
| 23 Mar 2026 | Payment | 43749 | TRANSF \| STAT 124 | LPG | -6,574.95 | 6,634.93 | T0143 EXACT_SINGLE ✓ ↔ Inv 49847 |
| 25 Mar 2026 | Invoice | 49931 | DN-21984 | LPG | 6,337.30 | 12,972.23 | OPEN |
| 26 Mar 2026 | Crd Note | 14665 | DN-21984-EMPTY | CYL | -6,037.50 | 6,934.73 | T0076 CN_DN_PAIR ✓ ↔ Inv 49932 |
| 26 Mar 2026 | Invoice | 49932 | DN-21984-EMPTY | CYL | 6,037.50 | 12,972.23 | T0076 CN_DN_PAIR ✓ ↔ Crd Note 14665 |
| 30 Mar 2026 | Payment | 43865 | TRANSF \| STAT 124 | LPG | -6,337.30 | 6,634.93 | T0144 EXACT_SINGLE ✓ ↔ Inv 49805 |

### April 2026

Opening balance (ERP running): **R6,634.93**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Apr 2026 | Crd Note | 14706 | DN-21859-EMPTY | CYL | -6,555.00 | 79.93 | T0077 CN_DN_PAIR ✓ ↔ Inv 50068 |
| 02 Apr 2026 | Invoice | 50068 | DN-21859-EMPTY | CYL | 6,555.00 | 6,634.93 | T0077 CN_DN_PAIR ✓ ↔ Crd Note 14706 |
| 02 Apr 2026 | Invoice | 50069 | DN-21859 | LPG | 7,321.97 | 13,956.90 | T0145 EXACT_SINGLE ✓ ↔ Pmt 43920 |
| 04 Apr 2026 | Payment | 43920 | TRANSF \| STAT 125 | LPG | -7,321.97 | 6,634.93 | T0145 EXACT_SINGLE ✓ ↔ Inv 50069 |
| 08 Apr 2026 | Crd Note | 14726 | DN-21866-EMPTY | CYL | -6,555.00 | 79.93 | T0078 CN_DN_PAIR ✓ ↔ Inv 50131 |
| 08 Apr 2026 | Invoice | 50130 | DN-21866 | LPG | 7,321.97 | 7,401.90 | T0146 EXACT_SINGLE ✓ ↔ Pmt 43961 |
| 08 Apr 2026 | Invoice | 50131 | DN-21866-EMPTY | CYL | 6,555.00 | 13,956.90 | T0078 CN_DN_PAIR ✓ ↔ Crd Note 14726 |
| 09 Apr 2026 | Payment | 43961 | TRANSF \| STAT 125 | LPG | -7,321.97 | 6,634.93 | T0146 EXACT_SINGLE ✓ ↔ Inv 50130 |
| 14 Apr 2026 | Invoice | 50223 | DN-22168 | LPG | 7,057.32 | 13,692.25 | T0147 EXACT_SINGLE ✓ ↔ Pmt 44027 |
| 14 Apr 2026 | Invoice | 50224 | DN-22168-EMPTY | CYL | 6,037.50 | 19,729.75 | T0079 CN_DN_PAIR ✓ ↔ Crd Note 14756 |
| 15 Apr 2026 | Crd Note | 14756 | DN-22168-EMPTY | CYL | -6,037.50 | 13,692.25 | T0079 CN_DN_PAIR ✓ ↔ Inv 50224 |
| 16 Apr 2026 | Payment | 44027 | TRANSF \| STAT 125 | LPG | -7,057.32 | 6,634.93 | T0147 EXACT_SINGLE ✓ ↔ Inv 50223 |
| 20 Apr 2026 | Crd Note | 14772 | DN-21335-EMPTY | CYL | -6,555.00 | 79.93 | T0080 CN_DN_PAIR ✓ ↔ Inv 50308 |
| 20 Apr 2026 | Invoice | 50307 | DN-21335 | LPG | 7,321.97 | 7,401.90 | T0148 EXACT_SINGLE ✓ ↔ Pmt 44093 |
| 20 Apr 2026 | Invoice | 50308 | DN-21335-EMPTY | CYL | 6,555.00 | 13,956.90 | T0080 CN_DN_PAIR ✓ ↔ Crd Note 14772 |
| 23 Apr 2026 | Payment | 44093 | TRANSF \| STAT 125 | LPG | -7,321.97 | 6,634.93 | T0148 EXACT_SINGLE ✓ ↔ Inv 50307 |
| 28 Apr 2026 | Invoice | 50405 | DN-22350 | LPG | 7,321.97 | 13,956.90 | T0149 EXACT_SINGLE ✓ ↔ Pmt 44145 |
| 30 Apr 2026 | Payment | 44145 | TRANSF \| STAT 125 | LPG | -7,321.97 | 6,634.93 | T0149 EXACT_SINGLE ✓ ↔ Inv 50405 |

### May 2026

Opening balance (ERP running): **R6,634.93**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 May 2026 | Crd Note | 14855 | DN#22221-EMPTY | CYL | -6,555.00 | 79.93 | T0081 CN_DN_PAIR ✓ ↔ Inv 50517 |
| 05 May 2026 | Invoice | 50516 | DN#22221 | LPG | 7,321.97 | 7,401.90 | T0150 EXACT_SINGLE ✓ ↔ Pmt 44225 |
| 05 May 2026 | Invoice | 50517 | DN#22221-EMPTY | CYL | 6,555.00 | 13,956.90 | T0081 CN_DN_PAIR ✓ ↔ Crd Note 14855 |
| 07 May 2026 | Payment | 44225 | TRANSF \| STAT 125 | LPG | -7,321.97 | 6,634.93 | T0150 EXACT_SINGLE ✓ ↔ Inv 50516 |
| 11 May 2026 | Crd Note | 14890 | DN#22410 | CYL | -6,555.00 | 79.93 | T0082 CN_DN_PAIR ✓ ↔ Inv 50617 |
| 11 May 2026 | Invoice | 50616 | DN#22410 | LPG | 8,420.71 | 8,500.64 | T0151 EXACT_SINGLE ✓ ↔ Pmt 44291 |
| 11 May 2026 | Invoice | 50617 | DN#22410 | CYL | 6,555.00 | 15,055.64 | T0082 CN_DN_PAIR ✓ ↔ Crd Note 14890 |
| 14 May 2026 | Payment | 44291 | TRANSF \| STAT 126 | LPG | -8,420.71 | 6,634.93 | T0151 EXACT_SINGLE ✓ ↔ Inv 50616 |
| 20 May 2026 | Invoice | 50782 | DN#22743 | LPG | 8,116.36 | 14,751.29 | T0152 EXACT_SINGLE ✓ ↔ Pmt 44378 |
| 20 May 2026 | Invoice | 50783 | DN#22743-EMPTY | CYL | 6,037.50 | 20,788.79 | T0083 CN_DN_PAIR ✓ ↔ Crd Note 14930 |
| 21 May 2026 | Crd Note | 14930 | DN#22743-EMPTY | CYL | -6,037.50 | 14,751.29 | T0083 CN_DN_PAIR ✓ ↔ Inv 50783 |
| 22 May 2026 | Crd Note | 14947 | DN#22748-EMPTY | CYL | -7,072.50 | 7,678.79 | T0084 CN_DN_PAIR ✓ ↔ Inv 50824 |
| 22 May 2026 | Payment | 44378 | TRANSF \| STAT 126 | LPG | -8,116.36 | -437.57 | T0152 EXACT_SINGLE ✓ ↔ Inv 50782 |
| 22 May 2026 | Invoice | 50823 | DN#22748 | LPG | 8,725.07 | 8,287.50 | T0153 EXACT_SINGLE ✓ ↔ Pmt 44450 |
| 22 May 2026 | Invoice | 50824 | DN#22748-EMPTY | CYL | 7,072.50 | 15,360.00 | T0084 CN_DN_PAIR ✓ ↔ Crd Note 14947 |
| 25 May 2026 | Payment | 44450 | TRANSF \| STAT 126 | LPG | -8,725.07 | 6,634.93 | T0153 EXACT_SINGLE ✓ ↔ Inv 50823 |
| 28 May 2026 | Invoice | 50916 | DN#22602 | LPG | 8,420.71 | 15,055.64 | T0154 EXACT_SINGLE ✓ ↔ Pmt 44546 |

### June 2026

Opening balance (ERP running): **R15,055.64**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Jun 2026 | Payment | 44546 | TRANSF \| STAT 127 | LPG | -8,420.71 | 6,634.93 | T0154 EXACT_SINGLE ✓ ↔ Inv 50916 |
| 03 Jun 2026 | Invoice | 51028 | DN#22623 | LPG | 7,792.63 | 14,427.56 | T0155 EXACT_SINGLE ✓ ↔ Pmt 44556 |
| 05 Jun 2026 | Payment | 44556 | TRANSF \| STAT 127 | LPG | -7,792.63 | 6,634.93 | T0155 EXACT_SINGLE ✓ ↔ Inv 51028 |
| 10 Jun 2026 | Invoice | 51143 | DN#22637 | LPG | 8,084.86 | 14,719.79 | T0156 EXACT_SINGLE ✓ ↔ Pmt 44749 |
| 10 Jun 2026 | Invoice | 51146 | — | CYL | 6,555.00 | 21,274.79 | T0091 CN_AMOUNT_DATE ? ↔ Crd Note 15044 |
| 11 Jun 2026 | Crd Note | 15044 | DN#22637 EMPTIES | CYL | -6,555.00 | 14,719.79 | T0091 CN_AMOUNT_DATE ? ↔ Inv 51146 |
| 19 Jun 2026 | Payment | 44749 | TRANSF \| STAT 127 | LPG | -8,084.86 | 6,634.93 | T0156 EXACT_SINGLE ✓ ↔ Inv 51143 |
| 22 Jun 2026 | Invoice | 51354 | DN#22519 | LPG | 8,377.08 | 15,012.01 | T0157 EXACT_SINGLE ✓ ↔ Pmt 44879 |
| 22 Jun 2026 | Invoice | 51355 | DN#22519*EMPTY | CYL | 7,072.50 | 22,084.51 | T0163 CYL_EXCHANGE ✓ ↔ Crd Note 14632, Inv 49848, Crd Note 15109 |
| 23 Jun 2026 | Crd Note | 15109 | DN#22519*EMPTY | CYL | -13,110.00 | 8,974.51 | T0163 CYL_EXCHANGE ✓ ↔ Crd Note 14632, Inv 49848, Inv 51355 |
| 25 Jun 2026 | Payment | 44879 | TRANSF \| STAT 127 | LPG | -8,377.08 | 597.43 | T0157 EXACT_SINGLE ✓ ↔ Inv 51354 |

### July 2026

Opening balance (ERP running): **R597.43**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Jul 2026 | Invoice | 51530 | DN#22536 | LPG | 8,084.86 | 8,682.29 | T0011 LOCKED:EXACT_SINGLE ↔ Pmt 45093 |
| 02 Jul 2026 | Invoice | 51531 | DN#22536=EMPTY | CYL | 6,555.00 | 15,237.29 | T0001 LOCKED:CN_DN_PAIR ↔ Crd Note 15165 |
| 03 Jul 2026 | Crd Note | 15165 | DN#22536=EMPTY | CYL | -6,555.00 | 8,682.29 | T0001 LOCKED:CN_DN_PAIR ↔ Inv 51531 |
| 06 Jul 2026 | Crd Note | 15181 | DN#22555=EMPTY | CYL | -6,037.50 | 2,644.79 | T0002 LOCKED:CN_DN_PAIR ↔ Inv 51629 |
| 06 Jul 2026 | Payment | 45093 | TRANSF \| STAT 128 | LPG | -8,084.86 | -5,440.07 | T0011 LOCKED:EXACT_SINGLE ↔ Inv 51530 |
| 06 Jul 2026 | Invoice | 51628 | DN#22555 | LPG | 7,827.07 | 2,387.00 | T0012 LOCKED:EXACT_SINGLE ↔ Pmt 45103 |
| 06 Jul 2026 | Invoice | 51629 | DN#22555=EMPTY | CYL | 6,037.50 | 8,424.50 | T0002 LOCKED:CN_DN_PAIR ↔ Crd Note 15181 |
| 09 Jul 2026 | Payment | 45103 | TRANSF \| STAT 128 | LPG | -7,827.07 | 597.43 | T0012 LOCKED:EXACT_SINGLE ↔ Inv 51628 |
| 13 Jul 2026 | Crd Note | 15253 | DN#22809=EMPTY | CYL | -6,555.00 | -5,957.57 | T0003 LOCKED:CN_DN_PAIR ↔ Inv 51792 |
| 13 Jul 2026 | Invoice | 51791 | DN#22809 | LPG | 8,120.59 | 2,163.02 | T0013 LOCKED:EXACT_MONTH_SUM ↔ Pmt 45205, Inv 51877 |
| 13 Jul 2026 | Invoice | 51792 | DN#22809=EMPTY | CYL | 6,555.00 | 8,718.02 | T0003 LOCKED:CN_DN_PAIR ↔ Crd Note 15253 |
| 16 Jul 2026 | Crd Note | 15269 | DN#22960=EMPTY | CYL | -6,555.00 | 2,163.02 | T0004 LOCKED:CN_DN_PAIR ↔ Inv 51878 |
| 16 Jul 2026 | Invoice | 51877 | DN#22960 | LPG | 8,120.59 | 10,283.61 | T0013 LOCKED:EXACT_MONTH_SUM ↔ Pmt 45205, Inv 51791 |
| 16 Jul 2026 | Invoice | 51878 | DN#22960=EMPTY | CYL | 6,555.00 | 16,838.61 | T0004 LOCKED:CN_DN_PAIR ↔ Crd Note 15269 |
| 17 Jul 2026 | Payment | 45205 | TRANSF \| STAT 128 | LPG | -16,241.18 | 597.43 | T0013 LOCKED:EXACT_MONTH_SUM ↔ Inv 51791, Inv 51877 |
| 23 Jul 2026 | Invoice | 52036 | DN#23906 | LPG | 8,120.59 | 8,718.02 | T0018 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 45474 |
| 23 Jul 2026 | Invoice | 52037 | DN#23906-EMPTY | CYL | 6,555.00 | 15,273.02 | T0005 LOCKED:CN_DN_PAIR ↔ Crd Note 15319 |
| 24 Jul 2026 | Crd Note | 15319 | DN#23906-EMPTY | CYL | -6,555.00 | 8,718.02 | T0005 LOCKED:CN_DN_PAIR ↔ Inv 52037 |
| 30 Jul 2026 | Invoice | 52195 | DN#23927 | LPG | 8,120.59 | 16,838.61 | T0019 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 45591 |
| 30 Jul 2026 | Invoice | 52196 | DN#23927:EMPTY | CYL | 6,555.00 | 23,393.61 | T0006 LOCKED:CN_DN_PAIR ↔ Crd Note 15361 |
| 31 Jul 2026 | Crd Note | 15361 | DN#23927:EMPTY | CYL | -6,555.00 | 16,838.61 | T0006 LOCKED:CN_DN_PAIR ↔ Inv 52196 |
| 31 Jul 2026 | Payment | 45474 | TRANSF \| STAT 128 | LPG | -8,120.59 | 8,718.02 | T0018 LOCKED:OPERATOR_RULING [exact] ↔ Inv 52036 |

### August 2026

Opening balance (ERP running): **R8,718.02**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Aug 2026 | Crd Note | 15379 | DN#24234-EMPTY | CYL | -6,037.50 | 2,680.52 | T0007 LOCKED:CN_DN_PAIR ↔ Inv 52269 |
| 03 Aug 2026 | Invoice | 52268 | DN#24234 | LPG | 7,827.07 | 10,507.59 | T0014 LOCKED:EXACT_SINGLE ↔ Pmt 45586 |
| 03 Aug 2026 | Invoice | 52269 | DN#24234-EMPTY | CYL | 6,037.50 | 16,545.09 | T0007 LOCKED:CN_DN_PAIR ↔ Crd Note 15379 |
| 05 Aug 2026 | Payment | 45586 | TRANSF \| STAT 129 | LPG | -7,827.07 | 8,718.02 | T0014 LOCKED:EXACT_SINGLE ↔ Inv 52268 |
| 07 Aug 2026 | Payment | 45591 | TRANSF \| STAT 129 | LPG | -8,120.59 | 597.43 | T0019 LOCKED:OPERATOR_RULING [exact] ↔ Inv 52195 |
| 11 Aug 2026 | Crd Note | 15439 | DN#24259-EMPTY | CYL | -6,555.00 | -5,957.57 | T0008 LOCKED:CN_DN_PAIR ↔ Inv 52464 |
| 11 Aug 2026 | Invoice | 52463 | DN#24259 | LPG | 7,189.95 | 1,232.38 | T0015 LOCKED:EXACT_MONTH_SUM ↔ Pmt 45779, Inv 52578 |
| 11 Aug 2026 | Invoice | 52464 | DN#24259-EMPTY | CYL | 6,555.00 | 7,787.38 | T0008 LOCKED:CN_DN_PAIR ↔ Crd Note 15439 |
| 14 Aug 2026 | Invoice | 52578 | DN#24913 | LPG | 7,189.95 | 14,977.33 | T0015 LOCKED:EXACT_MONTH_SUM ↔ Pmt 45779, Inv 52463 |
| 14 Aug 2026 | Invoice | 52579 | DN#24913-EMPTY | CYL | 6,555.00 | 21,532.33 | T0009 LOCKED:CN_DN_PAIR ↔ Crd Note 15488 |
| 15 Aug 2026 | Crd Note | 15488 | DN#24913-EMPTY | CYL | -6,555.00 | 14,977.33 | T0009 LOCKED:CN_DN_PAIR ↔ Inv 52579 |
| 17 Aug 2026 | Payment | 45779 | TRANSF \| STAT 129 | LPG | -14,379.90 | 597.43 | T0015 LOCKED:EXACT_MONTH_SUM ↔ Inv 52463, Inv 52578 |
| 22 Aug 2026 | Invoice | 52736 | DN#24929 | LPG | 7,189.95 | 7,787.38 | T0016 LOCKED:EXACT_SINGLE ↔ Pmt 45891 |
| 22 Aug 2026 | Invoice | 52737 | DN#24929-EMPTY | CYL | 6,555.00 | 14,342.38 | OPEN |
| 24 Aug 2026 | Crd Note | 15535 | DN#24929-EMPTY | CYL | -6,037.50 | 8,304.88 | OPEN |
| 26 Aug 2026 | Payment | 45891 | TRANSF \| STAT 129 | LPG | -7,189.95 | 1,114.93 | T0016 LOCKED:EXACT_SINGLE ↔ Inv 52736 |
| 28 Aug 2026 | Crd Note | 15569 | DN#23984-EMPTY | CYL | -6,555.00 | -5,440.07 | T0010 LOCKED:CN_DN_PAIR ↔ Inv 52845 |
| 28 Aug 2026 | Invoice | 52844 | DN#23984 | LPG | 7,189.95 | 1,749.88 | T0017 LOCKED:EXACT_SINGLE ↔ Pmt 45995 |
| 28 Aug 2026 | Invoice | 52845 | DN#23984-EMPTY | CYL | 6,555.00 | 8,304.88 | T0010 LOCKED:CN_DN_PAIR ↔ Crd Note 15569 |
| 31 Aug 2026 | Payment | 45995 | TRANSF \| STAT 129 | LPG | -7,189.95 | 1,114.93 | T0017 LOCKED:EXACT_SINGLE ↔ Inv 52844 |

### September 2026

Opening balance (ERP running): **R1,114.93**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Sept 2026 | Crd Note | 15604 | DN#24820-EMPTY | CYL | -7,072.50 | -5,957.57 | T0085 CN_DN_PAIR ✓ ↔ Inv 52963 |
| 05 Sept 2026 | Invoice | 52962 | DN#24820 | LPG | 7,606.09 | 1,648.52 | T0158 EXACT_SINGLE ✓ ↔ Pmt 46084 |
| 05 Sept 2026 | Invoice | 52963 | DN#24820-EMPTY | CYL | 7,072.50 | 8,721.02 | T0085 CN_DN_PAIR ✓ ↔ Crd Note 15604 |
| 07 Sept 2026 | Payment | 46084 | TRANSF \| STAT 130 | LPG | -7,606.09 | 1,114.93 | T0158 EXACT_SINGLE ✓ ↔ Inv 52962 |
| 10 Sept 2026 | Invoice | 53075 | DN#24835 | LPG | 6,809.15 | 7,924.08 | T0159 EXACT_SINGLE ✓ ↔ Pmt 46099 |
| 10 Sept 2026 | Invoice | 53076 | DN#24835-EMPTY | CYL | 6,037.50 | 13,961.58 | T0086 CN_DN_PAIR ✓ ↔ Crd Note 15638 |
| 11 Sept 2026 | Crd Note | 15638 | DN#24835-EMPTY | CYL | -6,037.50 | 7,924.08 | T0086 CN_DN_PAIR ✓ ↔ Inv 53076 |
| 11 Sept 2026 | Payment | 46099 | TRANSF \| STAT 130 | LPG | -6,809.15 | 1,114.93 | T0159 EXACT_SINGLE ✓ ↔ Inv 53075 |
| 18 Sept 2026 | Crd Note | 15678 | DN#21366 | LPG | -7,606.09 | -6,491.16 | T0087 CN_DN_PAIR ✓ ↔ Inv 53192 |
| 18 Sept 2026 | Invoice | 53192 | DN#21366 | LPG | 7,606.09 | 1,114.93 | T0087 CN_DN_PAIR ✓ ↔ Crd Note 15678 |
| 18 Sept 2026 | Invoice | 53193 | DN#21366-EMPTY | CYL | 7,072.50 | 8,187.43 | OPEN |
| 18 Sept 2026 | Invoice | 53213 | DN#21366 | LPG | 7,319.84 | 15,507.27 | OPEN |
| 19 Sept 2026 | Crd Note | 15675 | DN#21366-EMPTY | CYL | -6,555.00 | 8,952.27 | OPEN |
| 24 Sept 2026 | Invoice | 53277 | 24873 | CYL | 6,037.50 | 14,989.77 | T0092 CN_AMOUNT_DATE ? ↔ Crd Note 15694 |
| 24 Sept 2026 | Invoice | 53281 | DN#24873 | LPG | 6,536.23 | 21,526.00 | T0160 EXACT_SINGLE ✓ ↔ Pmt 46327 |
| 25 Sept 2026 | Crd Note | 15693 | DN-24873 | LPG | -6,299.99 | 15,226.01 | T0088 CN_DN_PAIR ✓ ↔ Inv 53280 |
| 25 Sept 2026 | Crd Note | 15694 | 24873 | CYL | -6,037.50 | 9,188.51 | T0092 CN_AMOUNT_DATE ? ↔ Inv 53277 |
| 25 Sept 2026 | Invoice | 53280 | DN-24873 | LPG | 6,299.99 | 15,488.50 | T0088 CN_DN_PAIR ✓ ↔ Crd Note 15693 |
| 28 Sept 2026 | Payment | 46327 | TRANSF \| STAT 130 | LPG | -6,536.23 | 8,952.27 | T0160 EXACT_SINGLE ✓ ↔ Inv 53281 |
| 28 Sept 2026 | Payment | 46328 | TRANSF \| STAT 130 | LPG | -6,536.23 | 2,416.04 | OPEN |
| 30 Sept 2026 | Invoice | 53394 | DN#23828 | LPG | 6,536.23 | 8,952.27 | T0161 EXACT_SINGLE ✓ ↔ Pmt 46334 |

### October 2026

Opening balance (ERP running): **R8,952.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Oct 2026 | Payment | 46334 | TRANSF \| STAT 131 | LPG | -6,536.23 | 2,416.04 | T0161 EXACT_SINGLE ✓ ↔ Inv 53394 |
| 06 Oct 2026 | Invoice | 53480 | DN#24706 | LPG | 6,536.23 | 8,952.27 | OPEN |
| 06 Oct 2026 | Invoice | 53481 | DN#24706-EMPTY | CYL | 6,555.00 | 15,507.27 | OPEN |
| 07 Oct 2026 | Crd Note | 15770 | DN#24706-EMPTY | CYL | -6,037.50 | 9,469.77 | OPEN |

---

## Ties by rule

| Rule | Confirmed | Probable |
| :--- | ---: | ---: |
| LOCKED | 19 | 0 |
| CN_DN_PAIR | 64 | 5 |
| CN_AMOUNT_DATE | 0 | 4 |
| EXACT_SINGLE | 65 | 0 |
| EXACT_SUM | 3 | 0 |
| EXACT_MONTH_SUM | 1 | 0 |
| CYL_EXCHANGE | 2 | 0 |

## Probable ties awaiting approval

| Tie | Rule | Documents | Variance (R) |
| :--- | :--- | :--- | ---: |
| T0026 | CN_DN_PAIR | Invoice 42699, Crd Note 12410 | — |
| T0049 | CN_DN_PAIR | Invoice 46902, Crd Note 13638 | — |
| T0068 | CN_DN_PAIR | Invoice 49035, Crd Note 14367 | — |
| T0069 | CN_DN_PAIR | Invoice 49146, Crd Note 14396 | — |
| T0072 | CN_DN_PAIR | Invoice 49459, Crd Note 14521 | — |
| T0089 | CN_AMOUNT_DATE | Invoice 44987, Crd Note 13027 | — |
| T0090 | CN_AMOUNT_DATE | Invoice 47067, Crd Note 13677 | — |
| T0091 | CN_AMOUNT_DATE | Invoice 51146, Crd Note 15044 | — |
| T0092 | CN_AMOUNT_DATE | Invoice 53277, Crd Note 15694 | — |

Proof: holds (rebuilt R9,469.77 vs closing R9,469.77; ERP R9,469.77).

