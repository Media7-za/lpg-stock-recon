# Internal ledger: TWK AGRI PTY LTD (TWK002), matcher review
**INTERNAL, not for the customer.** Every transaction in ERP order with the ERP running balance and what matcher v5 did with it · generated 2026-10-09 · 17 confirmed / 0 probable ties · 34 rows open · ERP `CURRENT BALANCE` R54,136.19 · PROPOSED — NOT RATIFIED · **REVIEW ONLY:** ingestCoverage partial

**Status key:** `OPEN` untied · `T0001 EXACT_SINGLE ✓` confirmed tie · `T0001 BATCH_SUM ?` probable tie (needs approval) · `LOCKED` operator-approved lock · `◀ ZERO` ERP running balance is within R0.05 after this line.

---

### March 2025

Opening balance (ERP running): **R38,791.27**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Mar 2025 | Journal | 494 | — | LPG | -956.28 | 37,834.99 | OPEN |
| 01 Mar 2025 | Journal | 494 | — | LPG | 1,762.55 | 39,597.54 | OPEN |
| 01 Mar 2025 | Journal | 495 | — | LPG | -429.16 | 39,168.38 | OPEN |
| 01 Mar 2025 | Journal | 495 | — | LPG | 1,324.29 | 40,492.67 | OPEN |
| 01 Mar 2025 | Journal | 496 | — | LPG | -543.52 | 39,949.15 | OPEN |
| 01 Mar 2025 | Journal | 496 | — | LPG | 1,141.52 | 41,090.67 | OPEN |
| 26 Mar 2025 | Invoice | 41747 | DN#12826 | CYL | 19,837.50 | 60,928.17 | T0006 REMITTANCE ✓ ↔ Pmt 39080, Crd Note 12131, Inv 42050, Crd Note 12214 +4 |
| 26 Mar 2025 | Invoice | 41747 | DN#12826 | LPG | 12,226.63 | 73,154.80 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Crd Note 12502, Inv 43112, Inv 43294 +32 |
| 27 Mar 2025 | Crd Note | 12131 | DN#12826 | CYL | -19,837.50 | 53,317.30 | T0006 REMITTANCE ✓ ↔ Pmt 39080, Inv 41747, Inv 42050, Crd Note 12214 +4 |
| 28 Mar 2025 | Payment | 37770 | TRANSF \| STAT 112 | LPG | -35,693.84 | 17,623.46 | T0001 LOCKED:OPERATOR_RULING [applied_to_bf] ↔ Jnl 508 |

### April 2025

Opening balance (ERP running): **R17,623.46**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 Apr 2025 | Crd Note | 12207 | DN#10546 | CYL | -12,075.00 | 5,548.46 | T0010 CN_DN_PAIR ✓ ↔ Inv 42045 |
| 07 Apr 2025 | Crd Note | 12207 | DN#10546 | LPG | -8,249.30 | -2,700.84 | T0009 CN_DN_PAIR ✓ ↔ Inv 42045 |
| 07 Apr 2025 | Crd Note | 12214 | DN#10546 | CYL | -12,075.00 | -14,775.84 | T0006 REMITTANCE ✓ ↔ Pmt 39080, Inv 41747, Crd Note 12131, Inv 42050 +4 |
| 07 Apr 2025 | Crd Note | 12215 | DN#12826 | CYL | -690.00 | -15,465.84 | T0006 REMITTANCE ✓ ↔ Pmt 39080, Inv 41747, Crd Note 12131, Inv 42050 +4 |
| 07 Apr 2025 | Crd Note | 12215 | DN#12826 | LPG | -559.77 | -16,025.61 | T0006 REMITTANCE ✓ ↔ Pmt 39080, Inv 41747, Crd Note 12131, Inv 42050 +4 |
| 07 Apr 2025 | Invoice | 42045 | DN#10546 | CYL | 12,075.00 | -3,950.61 | T0010 CN_DN_PAIR ✓ ↔ Crd Note 12207 |
| 07 Apr 2025 | Invoice | 42045 | DN#10546 | LPG | 8,249.30 | 4,298.69 | T0009 CN_DN_PAIR ✓ ↔ Crd Note 12207 |
| 07 Apr 2025 | Invoice | 42050 | DN#10546 | CYL | 12,075.00 | 16,373.69 | T0006 REMITTANCE ✓ ↔ Pmt 39080, Inv 41747, Crd Note 12131, Crd Note 12214 +4 |
| 07 Apr 2025 | Invoice | 42050 | DN#10546 | LPG | 8,058.97 | 24,432.66 | T0006 REMITTANCE ✓ ↔ Pmt 39080, Inv 41747, Crd Note 12131, Crd Note 12214 +4 |
| 23 Apr 2025 | Crd Note | 12329 | DN#13029-EMPTY | CYL | -12,592.50 | 11,840.16 | T0011 CN_DN_PAIR ✓ ↔ Inv 42469 |
| 23 Apr 2025 | Invoice | 42468 | DN#13029 | LPG | 7,713.58 | 19,553.74 | T0006 REMITTANCE ✓ ↔ Pmt 39080, Inv 41747, Crd Note 12131, Inv 42050 +4 |
| 23 Apr 2025 | Invoice | 42469 | DN#13029-EMPTY | CYL | 12,592.50 | 32,146.24 | T0011 CN_DN_PAIR ✓ ↔ Crd Note 12329 |
| 23 Apr 2025 | Invoice | 42470 | DN#13030 | CYL | 690.00 | 32,836.24 | T0006 REMITTANCE ✓ ↔ Pmt 39080, Inv 41747, Crd Note 12131, Inv 42050 +4 |
| 23 Apr 2025 | Invoice | 42470 | DN#13030 | LPG | 546.86 | 33,383.10 | T0006 REMITTANCE ✓ ↔ Pmt 39080, Inv 41747, Crd Note 12131, Inv 42050 +4 |

### May 2025

Opening balance (ERP running): **R33,383.10**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 16 May 2025 | Crd Note | 12494 | DN#13234 | LPG | -10,649.34 | 22,733.76 | T0012 CN_DN_PAIR ✓ ↔ Inv 43111 |
| 16 May 2025 | Crd Note | 12502 | DN#13234 | CYL | -17,250.00 | 5,483.76 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Inv 43112, Inv 43294 +32 |
| 16 May 2025 | Invoice | 43111 | DN#13234 | LPG | 10,649.34 | 16,133.10 | T0012 CN_DN_PAIR ✓ ↔ Crd Note 12494 |
| 16 May 2025 | Invoice | 43112 | DN#13234 | CYL | 17,250.00 | 33,383.10 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43294 +32 |
| 16 May 2025 | Invoice | 43112 | DN#13234 | LPG | 10,649.34 | 44,032.44 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43294 +32 |
| 23 May 2025 | Invoice | 43294 | DN#12257 | CYL | 15,007.50 | 59,039.94 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 23 May 2025 | Invoice | 43294 | DN#12257 | LPG | 9,425.71 | 68,465.65 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 24 May 2025 | Crd Note | 12550 | DN#12257 | CYL | -14,835.00 | 53,630.65 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 30 May 2025 | Payment | 39080 | TRANSF \| STAT 114 | LPG | -15,365.65 | 38,265.00 | T0006 REMITTANCE ✓ ↔ Inv 41747, Crd Note 12131, Inv 42050, Crd Note 12214 +4 |

### June 2025

Opening balance (ERP running): **R38,265.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 13 Jun 2025 | Crd Note | 12724 | DN#12516 | CYL | -16,905.00 | 21,360.00 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 13 Jun 2025 | Invoice | 43909 | DN#12516 | CYL | 17,250.00 | 38,610.00 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 13 Jun 2025 | Invoice | 43909 | DN#12516 | LPG | 10,512.26 | 49,122.26 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 26 Jun 2025 | Crd Note | 12825 | DN#12335 | CYL | -17,250.00 | 31,872.26 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 26 Jun 2025 | Invoice | 44235 | DN#12335 | CYL | 17,250.00 | 49,122.26 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 26 Jun 2025 | Invoice | 44235 | DN#12335 | LPG | 10,512.26 | 59,634.52 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |

### July 2025

Opening balance (ERP running): **R59,634.52**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Jul 2025 | Crd Note | 12908 | DN#12620 | CYL | -17,250.00 | 42,384.52 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 05 Jul 2025 | Invoice | 44542 | DN#12620 | CYL | 17,250.00 | 59,634.52 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 05 Jul 2025 | Invoice | 44542 | DN#12620 | LPG | 10,512.26 | 70,146.78 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 10 Jul 2025 | Invoice | 44731 | DN#12191 | CYL | 5,175.00 | 75,321.78 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 10 Jul 2025 | Invoice | 44731 | DN#12191 | LPG | 2,512.52 | 77,834.30 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 12 Jul 2025 | Crd Note | 12958 | DN#12191 | CYL | -5,175.00 | 72,659.30 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 14 Jul 2025 | Crd Note | 12982 | DN#12202 | CYL | -5,175.00 | 67,484.30 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 14 Jul 2025 | Invoice | 44816 | DN#12202 | CYL | 5,175.00 | 72,659.30 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 14 Jul 2025 | Invoice | 44816 | DN#12202 | LPG | 2,512.52 | 75,171.82 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 19 Jul 2025 | Crd Note | 13019 | DN#12721 | CYL | -13,972.50 | 61,199.32 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 19 Jul 2025 | Invoice | 44967 | DN#12721 | CYL | 13,972.50 | 75,171.82 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 19 Jul 2025 | Invoice | 44967 | DN#12721 | LPG | 8,542.51 | 83,714.33 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 26 Jul 2025 | Crd Note | 13057 | DN 20009 | CYL | -7,762.50 | 75,951.83 | T0013 CN_DN_PAIR ✓ ↔ Inv 45149 |
| 26 Jul 2025 | Invoice | 45148 | ON 375149748-001 | LPG | 3,768.78 | 79,720.61 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 26 Jul 2025 | Invoice | 45149 | DN 20009 | CYL | 7,762.50 | 87,483.11 | T0013 CN_DN_PAIR ✓ ↔ Crd Note 13057 |

### August 2025

Opening balance (ERP running): **R87,483.11**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Aug 2025 | Crd Note | 13101 | DN #20125 | CYL | -11,730.00 | 75,753.11 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 01 Aug 2025 | Invoice | 45302 | DN #20125 | CYL | 11,730.00 | 87,483.11 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 01 Aug 2025 | Invoice | 45302 | DN #20125 | LPG | 8,374.97 | 95,858.08 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 15 Aug 2025 | Crd Note | 13235 | DN#20319 | CYL | -16,215.00 | 79,643.08 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 15 Aug 2025 | Invoice | 45666 | DN#20319 | CYL | 16,215.00 | 95,858.08 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 15 Aug 2025 | Invoice | 45666 | DN#20319 | LPG | 9,616.19 | 105,474.27 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 29 Aug 2025 | Crd Note | 13335 | DN#20560 | CYL | -16,905.00 | 88,569.27 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 29 Aug 2025 | Invoice | 45986 | DN#20560 | CYL | 16,905.00 | 105,474.27 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 29 Aug 2025 | Invoice | 45986 | DN#20560 | LPG | 10,654.27 | 116,128.54 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |

### September 2025

Opening balance (ERP running): **R116,128.54**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Sept 2025 | Invoice | 46470 | D/N 21042 | CYL | 20,700.00 | 136,828.54 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 17 Sept 2025 | Invoice | 46470 | D/N 21042 | LPG | 12,166.71 | 148,995.25 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 18 Sept 2025 | Crd Note | 13500 | D/N 21042 | CYL | -20,700.00 | 128,295.25 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 30 Sept 2025 | Invoice | 46762 | DN#21079 | CYL | 7,245.00 | 135,540.25 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 30 Sept 2025 | Invoice | 46762 | DN#21079 | LPG | 3,846.26 | 139,386.51 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |

### October 2025

Opening balance (ERP running): **R139,386.51**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Oct 2025 | Crd Note | 13587 | DN#21079 | CYL | -7,245.00 | 132,141.51 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 20 Oct 2025 | Crd Note | 13716 | DN#20197 | CYL | -16,215.00 | 115,926.51 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 20 Oct 2025 | Invoice | 47196 | DN#20197 | CYL | 23,287.50 | 139,214.01 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 20 Oct 2025 | Invoice | 47196 | DN#20197 | LPG | 13,344.14 | 152,558.15 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |

### November 2025

Opening balance (ERP running): **R152,558.15**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 17 Nov 2025 | Crd Note | 13874 | DN#20798 EMPTIES | CYL | -15,870.00 | 136,688.15 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 17 Nov 2025 | Invoice | 47714 | DN#20798 | CYL | 15,870.00 | 152,558.15 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 17 Nov 2025 | Invoice | 47714 | DN#20798 | LPG | 8,520.86 | 161,079.01 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |

### December 2025

Opening balance (ERP running): **R161,079.01**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Dec 2025 | Invoice | 48160 | DN#20905 | CYL | 15,180.00 | 176,259.01 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 08 Dec 2025 | Invoice | 48160 | DN#20905 | LPG | 9,156.02 | 185,415.03 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 09 Dec 2025 | Crd Note | 14034 | DN#20905 | CYL | -15,180.00 | 170,235.03 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |

### January 2026

Opening balance (ERP running): **R170,235.03**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Jan 2026 | Crd Note | 14232 | DN-20974 | LPG | -12,380.03 | 157,855.00 | T0014 CN_DN_PAIR ✓ ↔ Inv 48686 |
| 09 Jan 2026 | Crd Note | 14237 | DN-20975 | CYL | -22,770.00 | 135,085.00 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 09 Jan 2026 | Invoice | 48686 | DN-20974 | LPG | 12,380.03 | 147,465.03 | T0014 CN_DN_PAIR ✓ ↔ Crd Note 14232 |
| 09 Jan 2026 | Invoice | 48687 | DN-20975 | CYL | 22,770.00 | 170,235.03 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |
| 09 Jan 2026 | Invoice | 48687 | DN-20975 | LPG | 12,380.03 | 182,615.06 | T0007 REMITTANCE ✓ ↔ Pmt 43500, Inv 41747, Crd Note 12502, Inv 43112 +32 |

### February 2026

Opening balance (ERP running): **R182,615.06**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Feb 2026 | Crd Note | 14414 | DN#21535 | CYL | -22,195.00 | 160,420.06 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14554, Crd Note 14649, Crd Note 14711 +17 |
| 12 Feb 2026 | Invoice | 49208 | DN#21535 | CYL | 22,252.50 | 182,672.56 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 12 Feb 2026 | Invoice | 49208 | DN#21535 | LPG | 13,410.97 | 196,083.53 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 25 Feb 2026 | Payment | 43500 | TRANSF \| STAT 123 | LPG | -176,824.24 | 19,259.29 | T0007 REMITTANCE ✓ ↔ Inv 41747, Crd Note 12502, Inv 43112, Inv 43294 +32 |

### March 2026

Opening balance (ERP running): **R19,259.29**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Mar 2026 | Journal | 492 | — | LPG | -506.36 | 18,752.93 | OPEN |
| 01 Mar 2026 | Journal | 493 | — | LPG | 4,081.85 | 22,834.78 | OPEN |
| 06 Mar 2026 | Invoice | 49606 | DN#21950 | CYL | 15,180.00 | 38,014.78 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 06 Mar 2026 | Invoice | 49606 | DN#21950 | LPG | 8,277.21 | 46,291.99 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 07 Mar 2026 | Crd Note | 14554 | DN#21950 | CYL | -15,180.00 | 31,111.99 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14649, Crd Note 14711 +17 |
| 24 Mar 2026 | Invoice | 49882 | DN-21976 | CYL | 14,490.00 | 45,601.99 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 24 Mar 2026 | Invoice | 49882 | DN-21976 | LPG | 8,858.97 | 54,460.96 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 25 Mar 2026 | Crd Note | 14649 | DN-21976 | CYL | -14,490.00 | 39,970.96 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14711 +17 |

### April 2026

Opening balance (ERP running): **R39,970.96**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 06 Apr 2026 | Invoice | 50099 | DN-22046 | CYL | 13,972.50 | 53,943.46 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 06 Apr 2026 | Invoice | 50099 | DN-22046 | LPG | 9,010.16 | 62,953.62 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 07 Apr 2026 | Crd Note | 14711 | DN-22046 | CYL | -13,972.50 | 48,981.12 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 29 Apr 2026 | Invoice | 50439 | DN-21880 | LPG | 5,300.12 | 54,281.24 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 29 Apr 2026 | Invoice | 50440 | DN-21880-EMPTY | CYL | 10,350.00 | 64,631.24 | T0015 CN_DN_PAIR ✓ ↔ Crd Note 14820 |
| 30 Apr 2026 | Crd Note | 14820 | DN-21880-EMPTY | CYL | -10,350.00 | 54,281.24 | T0015 CN_DN_PAIR ✓ ↔ Inv 50440 |

### May 2026

Opening balance (ERP running): **R54,281.24**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 14 May 2026 | Invoice | 50680 | DN#22709 | CYL | 9,142.50 | 63,423.74 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 14 May 2026 | Invoice | 50680 | DN#22709 | LPG | 7,245.45 | 70,669.19 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 15 May 2026 | Crd Note | 14910 | DN#22709 | CYL | -9,142.50 | 61,526.69 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 27 May 2026 | Invoice | 50898 | DN#22761 | CYL | 11,902.50 | 73,429.19 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 27 May 2026 | Invoice | 50898 | DN#22761 | LPG | 8,430.45 | 81,859.64 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 28 May 2026 | Crd Note | 14982 | DN#22761 | CYL | -11,385.00 | 70,474.64 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |

### June 2026

Opening balance (ERP running): **R70,474.64**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Jun 2026 | Invoice | 51180 | DN#22798 | CYL | 17,250.00 | 87,724.64 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 15063 |
| 12 Jun 2026 | Invoice | 51180 | DN#22798 | LPG | 12,471.98 | 100,196.62 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 15063 |
| 15 Jun 2026 | Crd Note | 15063 | DN#22798 | CYL | -17,250.00 | 82,946.62 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Inv 51180 |
| 15 Jun 2026 | Crd Note | 15063 | DN#22798 | LPG | -12,471.98 | 70,474.64 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Inv 51180 |
| 15 Jun 2026 | Crd Note | 15070 | DN#22904-EMPTY | CYL | -17,250.00 | 53,224.64 | T0016 CN_DN_PAIR ✓ ↔ Inv 51227 |
| 15 Jun 2026 | Invoice | 51226 | DN#22904 | LPG | 12,471.98 | 65,696.62 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 15 Jun 2026 | Invoice | 51227 | DN#22904-EMPTY | CYL | 17,250.00 | 82,946.62 | T0016 CN_DN_PAIR ✓ ↔ Crd Note 15070 |

### July 2026

Opening balance (ERP running): **R82,946.62**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Jul 2026 | Crd Note | 15155 | DN#22534 | CYL | -17,250.00 | 65,696.62 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 01 Jul 2026 | Invoice | 51496 | DN#22534 | CYL | 17,250.00 | 82,946.62 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 01 Jul 2026 | Invoice | 51496 | DN#22534 | LPG | 12,471.98 | 95,418.60 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 12 Jul 2026 | Journal | 490 | — | LPG | 4,019.12 | 99,437.72 | OPEN |
| 12 Jul 2026 | Journal | 491 | — | LPG | -203.65 | 99,234.07 | OPEN |
| 12 Jul 2026 | Journal | 491 | — | LPG | -367.10 | 98,866.97 | OPEN |
| 12 Jul 2026 | Journal | 491 | — | LPG | -426.60 | 98,440.37 | OPEN |
| 12 Jul 2026 | Journal | 491 | — | LPG | -469.22 | 97,971.15 | OPEN |
| 12 Jul 2026 | Journal | 491 | — | LPG | -701.93 | 97,269.22 | OPEN |
| 12 Jul 2026 | Journal | 491 | — | LPG | -1,160.62 | 96,108.60 | OPEN |
| 15 Jul 2026 | Crd Note | 15262 | DN#22576 | CYL | -14,835.00 | 81,273.60 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 15 Jul 2026 | Invoice | 51841 | DN#22576 | CYL | 14,490.00 | 95,763.60 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 15 Jul 2026 | Invoice | 51841 | DN#22576 | LPG | 9,952.49 | 105,716.09 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 23 Jul 2026 | Journal | 499 | — | LPG | 124.91 | 105,841.00 | OPEN |
| 23 Jul 2026 | Journal | 500 | — | LPG | -300.54 | 105,540.46 | OPEN |
| 23 Jul 2026 | Journal | 501 | — | LPG | -749.94 | 104,790.52 | OPEN |
| 23 Jul 2026 | Journal | 502 | — | LPG | -310.37 | 104,480.15 | OPEN |
| 31 Jul 2026 | Invoice | 52241 | DN#24229 | CYL | 19,665.00 | 124,145.15 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 31 Jul 2026 | Invoice | 52241 | DN#24229 | LPG | 14,387.09 | 138,532.24 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |

### August 2026

Opening balance (ERP running): **R138,532.24**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Aug 2026 | Crd Note | 15370 | DN#24229 | CYL | -19,665.00 | 118,867.24 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 09 Aug 2026 | Journal | 503 | — | LPG | 500.01 | 119,367.25 | OPEN |
| 09 Aug 2026 | Journal | 504 | — | LPG | -375.10 | 118,992.15 | OPEN |
| 09 Aug 2026 | Journal | 505 | — | LPG | 108.19 | 119,100.34 | OPEN |
| 09 Aug 2026 | Journal | 506 | — | LPG | -233.10 | 118,867.24 | OPEN |
| 09 Aug 2026 | Journal | 507 | — | LPG | -112.78 | 118,754.46 | OPEN |
| 09 Aug 2026 | Journal | 508 | — | LPG | -228.93 | 118,525.53 | T0001 LOCKED:OPERATOR_RULING [applied_to_bf] ↔ Pmt 37770 |
| 09 Aug 2026 | Journal | 509 | — | LPG | -393.99 | 118,131.54 | T0006 REMITTANCE ✓ ↔ Pmt 39080, Inv 41747, Crd Note 12131, Inv 42050 +4 |
| 12 Aug 2026 | Crd Note | 15443 | DN#23954 | CYL | -11,040.00 | 107,091.54 | OPEN |
| 12 Aug 2026 | Invoice | 52484 | DN#23954 | CYL | 11,212.50 | 118,304.04 | OPEN |
| 12 Aug 2026 | Invoice | 52484 | DN#23954 | LPG | 6,926.34 | 125,230.38 | OPEN |
| 26 Aug 2026 | Journal | 510 | — | LPG | -1,223.45 | 124,006.93 | T0008 REMITTANCE ✓ ↔ Pmt 45899, Crd Note 14414, Crd Note 14554, Crd Note 14649 +17 |
| 26 Aug 2026 | Crd Note | 15553 | DN#24938 | CYL | -17,077.50 | 106,929.43 | OPEN |
| 26 Aug 2026 | Payment | 45899 | TRANSF \| STAT 129 | LPG | -108,823.42 | -1,893.99 | T0008 REMITTANCE ✓ ↔ Crd Note 14414, Crd Note 14554, Crd Note 14649, Crd Note 14711 +17 |
| 26 Aug 2026 | Invoice | 52803 | DN#24938 | CYL | 17,250.00 | 15,356.01 | OPEN |
| 26 Aug 2026 | Invoice | 52803 | DN#24938 | LPG | 11,142.35 | 26,498.36 | OPEN |

### September 2026

Opening balance (ERP running): **R26,498.36**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Sept 2026 | Invoice | 53077 | DN#24836 | CYL | 13,800.00 | 40,298.36 | T0017 CN_DN_PAIR ✓ ↔ Crd Note 15637 |
| 10 Sept 2026 | Invoice | 53077 | DN#24836 | LPG | 8,448.07 | 48,746.43 | OPEN |
| 10 Sept 2026 | Invoice | 53078 | DN#24985 | OTHER | 22,000.00 | 70,746.43 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 15646 |
| 11 Sept 2026 | Crd Note | 15637 | DN#24836 | CYL | -13,800.00 | 56,946.43 | T0017 CN_DN_PAIR ✓ ↔ Inv 53077 |
| 14 Sept 2026 | Crd Note | 15646 | DN#24985 | OTHER | -22,000.00 | 34,946.43 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Inv 53078 |
| 29 Sept 2026 | Crd Note | 15714 | 21388 | CYL | -19,837.50 | 15,108.93 | T0005 LOCKED:OPERATOR_RULING [exact] ↔ Inv 53351 |
| 29 Sept 2026 | Invoice | 53350 | DN-21388 | LPG | 12,748.90 | 27,857.83 | OPEN |
| 29 Sept 2026 | Invoice | 53351 | 21388 | CYL | 19,837.50 | 47,695.33 | T0005 LOCKED:OPERATOR_RULING [exact] ↔ Crd Note 15714 |

### October 2026

Opening balance (ERP running): **R47,695.33**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Oct 2026 | Crd Note | 15775 | DN#23843 | LPG | -7,935.00 | 39,760.33 | OPEN |
| 08 Oct 2026 | Invoice | 53507 | DN#23843 | LPG | 14,375.86 | 54,136.19 | OPEN |

---

## Ties by rule

| Rule | Confirmed | Probable |
| :--- | ---: | ---: |
| LOCKED | 5 | 0 |
| REMITTANCE | 3 | 0 |
| CN_DN_PAIR | 9 | 0 |

Proof: holds (rebuilt R54,136.19 vs closing R54,136.19; ERP R54,136.19).

