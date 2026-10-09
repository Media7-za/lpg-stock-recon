# Matcher preview

Generated 2026-10-09 by `matcher_preview.mjs`. Compares the current matcher with each account's committed `projection_matches.json`. **Nothing was written to any account.** PROPOSED — NOT RATIFIED.

| Account | Ties | Open rows (internal) | Open rows (customer) | Unallocated pmts | BALANCE_ZERO cut | Check |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- |
| FIR001 | 161 → 163 | 28 → 21 | 48 → 39 | 9 | — | clean |
| JEN001 | 44 → 44 | 88 → 22 | 106 → 28 | 3 | line 107 (2025-12-10) | clean |
| MD0003 | 95 → 95 | 32 → 32 | 51 → 51 | 7 | — | clean |
| MON001 | 29 → 30 | 12 → 8 | 18 → 18 | 2 | — | clean |
| MOZ002 | 105 → 105 | 2 → 2 | 2 → 2 | 0 | line 183 (2025-10-07) | clean |
| RED001 | 59 → 61 | 26 → 6 | 30 → 6 | 1 | line 56 (2026-03-17) | clean |
| SA0001 | 161 → 162 | 10 → 6 | 43 → 39 | 0 | — | clean |
| TAN002 | 87 → 89 | 55 → 41 | 97 → 83 | 7 | — | clean |
| TWK002 | 30 → 31 | 71 → 69 | 81 → 79 | 3 | — | clean |

## Detail

### FIR001

- Ties before: v4: LOCKED 19, CN_DN_PAIR 63+5?, CN_AMOUNT_DATE 0+5?, EXACT_SINGLE 65, EXACT_SUM 3, EXACT_MONTH_SUM 1
- Ties after (v5): LOCKED 19, CN_DN_PAIR 64+5?, CN_AMOUNT_DATE 0+4?, EXACT_SINGLE 65, EXACT_SUM 3, EXACT_MONTH_SUM 1, CYL_EXCHANGE 2
- Open rows internal 28 → 21; customer 48 → 39. Balance R9,469.77 (ERP R9,469.77).
- Rows changing status: 7 (7 now settled, 0 now open). Locks applied 19, conflicts 0, closedThrough 2026-08-31.
- Probable ties needing approval (9): T0026 CN_DN_PAIR Invoice 42699 + Crd Note 12410 | T0049 CN_DN_PAIR Invoice 46902 + Crd Note 13638 | T0068 CN_DN_PAIR Invoice 49035 + Crd Note 14367 | T0069 CN_DN_PAIR Invoice 49146 + Crd Note 14396 | T0072 CN_DN_PAIR Invoice 49459 + Crd Note 14521 | T0089 CN_AMOUNT_DATE Invoice 44987 + Crd Note 13027 | T0090 CN_AMOUNT_DATE Invoice 47067 + Crd Note 13677 | T0091 CN_AMOUNT_DATE Invoice 51146 + Crd Note 15044 | T0092 CN_AMOUNT_DATE Invoice 53277 + Crd Note 15694
- Unallocated payments (9, R50,588.14): 17570 R6,316.11, 17655 R6,087.81, 17786 R6,258.19, 17849 R6,492.87, 41506 R0.02, 41939 R6,270.26, 43546 R6,525.20, 43639 R6,101.45, 46328 R6,536.23

### JEN001

- Ties before: v4: LOCKED 1, CN_DN_PAIR 29+7?, EXACT_MONTH_SUM 5, EXACT_SINGLE 1, NEAR_SUM 0+1?
- Ties after (v5): LOCKED 1, CN_DN_PAIR 29+3?, EXACT_MONTH_SUM 5, EXACT_SINGLE 1, CYL_EXCHANGE 4, BALANCE_ZERO 1
- Open rows internal 88 → 22; customer 106 → 28. Balance R25,332.00 (ERP R25,332.00).
- Rows changing status: 66 (66 now settled, 0 now open). Locks applied 1, conflicts 0, closedThrough —.
- BALANCE_ZERO: 35 rows through line 107; dissolved probable: CN_DN_PAIR Invoice 42166+Crd Note 12259; CN_DN_PAIR Invoice 42693+Crd Note 12405; CN_DN_PAIR Invoice 43580+Crd Note 12648; CN_DN_PAIR Invoice 46627+Crd Note 13541; NEAR_SUM Payment 39619+Invoice 43488+Invoice 42692+Invoice 42618; opening settled R9,461.01.
- Probable ties needing approval (3): T0021 CN_DN_PAIR Invoice 49288 + Crd Note 14445 | T0023 CN_DN_PAIR Invoice 49610 + Crd Note 14556 | T0027 CN_DN_PAIR Invoice 51155 + Crd Note 15066
- Unallocated payments (3, R31,703.96): 43927 R6,703.96, 44878 R10,000.00, 46098 R15,000.00

### MD0003

- Ties before: v4: REMITTANCE 7+1?, CN_DN_PAIR 73+5?, CN_AMOUNT_DATE 0+1?, EXACT_SINGLE 2, EXACT_MONTH_SUM 2, EXACT_SUM 3, EXACT_RUN 1
- Ties after (v5): REMITTANCE 7+1?, CN_DN_PAIR 73+5?, CN_AMOUNT_DATE 0+1?, EXACT_SINGLE 2, EXACT_MONTH_SUM 2, EXACT_SUM 3, EXACT_RUN 1
- Open rows internal 32 → 32; customer 51 → 51. Balance R16,547.81 (ERP R16,547.81).
- Rows changing status: 0 (0 now settled, 0 now open). Locks applied 0, conflicts 0, closedThrough —.
- Probable ties needing approval (7): T0003 REMITTANCE Payment 43494 + Invoice 48737 + Invoice 48784 + Invoice 48906 + Invoice 48919 + Invoice 48927 + Crd Note 14328 | T0012 CN_DN_PAIR Invoice 42011 + Crd Note 12220 | T0015 CN_DN_PAIR Invoice 42677 + Crd Note 12386 | T0043 CN_DN_PAIR Invoice 47734 + Crd Note 13916 | T0058 CN_DN_PAIR Invoice 49444 + Crd Note 14494 | T0085 CN_DN_PAIR Invoice 53317 + Crd Note 15708 | T0087 CN_AMOUNT_DATE Invoice 45161 + Crd Note 13062
- Unallocated payments (7, R114,330.23): 37143 R15,295.33, 37144 R4,441.70, 37262 R4,653.98, 37263 R17,064.59, 37817 R15,633.20, 42440 R47,511.17, 42858 R9,730.26

### MON001

- Ties before: v4: CN_DN_PAIR 15+2?, EXACT_SINGLE 10, EXACT_MONTH_SUM 1, PROXIMITY 0+1?
- Ties after (v5): CN_DN_PAIR 15+2?, EXACT_SINGLE 10, EXACT_MONTH_SUM 1, PROXIMITY 0+1?, BATCH_SUM 0+1?
- Open rows internal 12 → 8; customer 18 → 18. Balance R2,417.24 (ERP R2,417.24).
- Rows changing status: 4 (4 now settled, 0 now open). Locks applied 0, conflicts 0, closedThrough —.
- Probable ties needing approval (4): T0010 CN_DN_PAIR Invoice 49461 + Crd Note 14512 | T0015 CN_DN_PAIR Invoice 51953 + Crd Note 15303 | T0029 PROXIMITY Payment 45589 + Invoice 51846 | T0030 BATCH_SUM Payment 45216 + Invoice 50363 + Invoice 50097
- Unallocated payments (2, R5,445.62): 45158 R2,628.79, 37379 R2,816.83

### MOZ002

- Ties before: v5: LOCKED 1, CN_DN_PAIR 49, EXACT_SINGLE 42, EXACT_SUM 2, EXACT_RUN 2, CYL_EXCHANGE 8, BALANCE_ZERO 1
- Ties after (v5): LOCKED 1, CN_DN_PAIR 49, EXACT_SINGLE 42, EXACT_SUM 2, EXACT_RUN 2, CYL_EXCHANGE 8, BALANCE_ZERO 1
- Open rows internal 2 → 2; customer 2 → 2. Balance R1,562.67 (ERP R1,562.67).
- Rows changing status: 0 (0 now settled, 0 now open). Locks applied 1, conflicts 0, closedThrough —.
- BALANCE_ZERO: 10 rows through line 183; dissolved probable: CN_DN_PAIR Invoice 41522+Crd Note 12079; CN_DN_PAIR Invoice 46826+Crd Note 13602; EXACT_RUN Payment 40729+Invoice 44949+Invoice 45199+Invoice 45303+Invoice 45488; opening settled R0.00.

### RED001

- Ties before: v4: LOCKED 4, CN_DN_PAIR 27+2?, EXACT_SINGLE 25, EXACT_MONTH_SUM 1
- Ties after (v5): LOCKED 4, CN_DN_PAIR 27, EXACT_SINGLE 25, EXACT_MONTH_SUM 1, CYL_EXCHANGE 3, BALANCE_ZERO 1
- Open rows internal 26 → 6; customer 30 → 6. Balance R10,183.43 (ERP R10,183.43).
- Rows changing status: 20 (20 now settled, 0 now open). Locks applied 4, conflicts 0, closedThrough —.
- BALANCE_ZERO: 8 rows through line 56; dissolved probable: CN_DN_PAIR Invoice 43615+Crd Note 12638; CN_DN_PAIR Invoice 45541+Crd Note 13187; opening settled R0.00.
- Unallocated payments (1, R5,311.25): 46332 R5,311.25

### SA0001

- Ties before: v4: LOCKED 144, CN_DN_PAIR 1+9?, CN_AMOUNT_DATE 0+5?, NEAR_SUM 0+1?, PROXIMITY 0+1?
- Ties after (v5): LOCKED 144, CN_DN_PAIR 1+9?, CN_AMOUNT_DATE 0+5?, NEAR_SUM 0+1?, PROXIMITY 0+1?, CYL_EXCHANGE 1
- Open rows internal 10 → 6; customer 43 → 39. Balance R16,002.86 (ERP R16,002.86).
- Rows changing status: 4 (4 now settled, 0 now open). Locks applied 144, conflicts 0, closedThrough 2026-09-30.
- Probable ties needing approval (16): T0145 CN_DN_PAIR Invoice 42584 + Crd Note 12361 | T0146 CN_DN_PAIR Invoice 46653 + Crd Note 13559 | T0147 CN_DN_PAIR Invoice 47451 + Crd Note 13805 | T0148 CN_DN_PAIR Invoice 48825 + Crd Note 14311 | T0149 CN_DN_PAIR Invoice 49456 + Crd Note 14516 | T0150 CN_DN_PAIR Invoice 49457 + Crd Note 14517 | T0151 CN_DN_PAIR Invoice 50289 + Crd Note 14780 | T0152 CN_DN_PAIR Invoice 50982 + Crd Note 15015 | T0153 CN_DN_PAIR Invoice 52739 + Crd Note 15536 | T0155 CN_AMOUNT_DATE Invoice 44988 + Crd Note 13028 | T0156 CN_AMOUNT_DATE Invoice 45002 + Crd Note 13264 | T0157 CN_AMOUNT_DATE Invoice 49904 + Crd Note 14651 …

### TAN002

- Ties before: v4: CN_DN_PAIR 49+17?, CN_AMOUNT_DATE 0+2?, EXACT_RUN 2, EXACT_SINGLE 6, EXACT_SUM 7, EXACT_MONTH_SUM 3, NEAR_SUM 0+1?
- Ties after (v5): CN_DN_PAIR 49+17?, CN_AMOUNT_DATE 0+2?, EXACT_RUN 2, EXACT_SINGLE 6, EXACT_SUM 7, EXACT_MONTH_SUM 3, NEAR_SUM 0+1?, CYL_EXCHANGE 2
- Open rows internal 55 → 41; customer 97 → 83. Balance R7,938.37 (ERP R7,938.37).
- Rows changing status: 14 (14 now settled, 0 now open). Locks applied 0, conflicts 0, closedThrough —.
- Probable ties needing approval (20): T0003 CN_DN_PAIR Invoice 41893 + Crd Note 12186 | T0004 CN_DN_PAIR Invoice 42018 + Crd Note 12204 | T0008 CN_DN_PAIR Invoice 42575 + Crd Note 12360 | T0011 CN_DN_PAIR Invoice 42965 + Crd Note 12459 | T0012 CN_DN_PAIR Invoice 43134 + Crd Note 12516 | T0013 CN_DN_PAIR Invoice 43334 + Crd Note 12565 | T0014 CN_DN_PAIR Invoice 43702 + Crd Note 12661 | T0019 CN_DN_PAIR Invoice 45351 + Crd Note 13135 | T0020 CN_DN_PAIR Invoice 45537 + Crd Note 13185 | T0021 CN_DN_PAIR Invoice 45544 + Crd Note 13188 | T0029 CN_DN_PAIR Invoice 46655 + Crd Note 13561 | T0030 CN_DN_PAIR Invoice 46656 + Crd Note 13562 …
- Unallocated payments (7, R78,617.03): 36865 R12,282.56, 37780 R10,431.35, 39962 R10,000.00, 40610 R12,880.00, 40718 R15,000.00, 41252 R13,764.51, 41964 R4,258.61

### TWK002

- Ties before: v4: REMITTANCE 1, CN_DN_PAIR 24+4?, CN_AMOUNT_DATE 0+1?
- Ties after (v5): REMITTANCE 1, CN_DN_PAIR 24+4?, CN_AMOUNT_DATE 0+1?, CYL_EXCHANGE 1
- Open rows internal 71 → 69; customer 81 → 79. Balance R54,136.19 (ERP R54,136.19).
- Rows changing status: 2 (2 now settled, 0 now open). Locks applied 0, conflicts 0, closedThrough —.
- Probable ties needing approval (5): T0011 CN_DN_PAIR Invoice 44731 + Crd Note 12958 | T0025 CN_DN_PAIR Invoice 51180 + Crd Note 15063 | T0026 CN_DN_PAIR Invoice 51180 + Crd Note 15063 | T0029 CN_DN_PAIR Invoice 53078 + Crd Note 15646 | T0030 CN_AMOUNT_DATE Invoice 53351 + Crd Note 15714
- Unallocated payments (3, R227,883.73): 37770 R35,693.84, 39080 R15,365.65, 43500 R176,824.24

