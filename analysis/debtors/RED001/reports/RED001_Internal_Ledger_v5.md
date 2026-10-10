# Internal ledger: REDLANDS HOTEL (RED001), matcher review
**INTERNAL, not for the customer.** Every transaction in ERP order with the ERP running balance and what matcher v5 did with it · generated 2026-10-10 · 61 confirmed / 0 probable ties · 6 rows open · ERP `CURRENT BALANCE` R10,183.43 · matcher v5 ratified 2026-10-10; probable ties are proposals until approved · **REVIEW ONLY:** ingestCoverage partial

**Status key:** `OPEN` untied · `T0001 EXACT_SINGLE ✓` confirmed tie · `T0001 BATCH_SUM ?` probable tie (needs approval) · `LOCKED` operator-approved lock · `◀ ZERO` ERP running balance is within R0.05 after this line.

**ERP balance returns to ~R0.00** after: 09 May 2025 (Inv 42954, line 5, R0.00); 04 Jun 2025 (Inv 43614, line 7, R0.00); 06 Jun 2025 (CN 12638, line 9, R0.00); 17 Mar 2026 (Pmt 43698, line 52, R0.00); 24 Mar 2026 (Inv 49875, line 54, R0.00); 25 Mar 2026 (CN 14644, line 56, R0.00).

---

### May 2025

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 May 2025 | Payment | 38566 | TRANSF \| STAT 114 | LPG | -5,399.99 | -5,399.99 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Inv 42948 |
| 09 May 2025 | Crd Note | 12452 | DN#13208-EMPTY | CYL | -4,830.00 | -10,229.99 | T0005 CN_DN_PAIR ✓ ↔ Inv 42954 |
| 09 May 2025 | Invoice | 42948 | DN#13208 | LPG | 5,399.99 | -4,830.00 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 38566 |
| 09 May 2025 | Invoice | 42954 | DN#13208-EMPTY | CYL | 4,830.00 | 0.00 | T0005 CN_DN_PAIR ✓ ↔ Crd Note 12452 ◀ ZERO |

### June 2025

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Jun 2025 | Payment | 39087 | TRANSF \| STAT 115 | LPG | -8,639.97 | -8,639.97 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Inv 43614 |
| 04 Jun 2025 | Invoice | 43614 | DN#12492 | LPG | 8,639.97 | 0.00 | T0002 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 39087 ◀ ZERO |
| 04 Jun 2025 | Invoice | 43615 | DN#12492-EMPTY | CYL | 7,245.00 | 7,245.00 | T0061 BALANCE_ZERO ✓ ↔ Crd Note 12638, Inv 45541, Crd Note 13187, Inv 49409 +3 |
| 06 Jun 2025 | Crd Note | 12638 | DN#12492-EMPTY | CYL | -7,245.00 | 0.00 | T0061 BALANCE_ZERO ✓ ↔ Inv 43615, Inv 45541, Crd Note 13187, Inv 49409 +3 ◀ ZERO |

### July 2025

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Jul 2025 | Crd Note | 12945 | DN#12678-EMPTY | CYL | -3,622.50 | -3,622.50 | T0060 CYL_EXCHANGE ✓ ↔ Inv 44675, Crd Note 13687, Crd Note 14704, Inv 50065 +3 |
| 09 Jul 2025 | Payment | 40136 | TRANSF \| STAT 116 | LPG | -5,759.98 | -9,382.48 | T0034 EXACT_SINGLE ✓ ↔ Inv 44674 |
| 09 Jul 2025 | Invoice | 44674 | DN#12678 | LPG | 5,759.98 | -3,622.50 | T0034 EXACT_SINGLE ✓ ↔ Pmt 40136 |
| 09 Jul 2025 | Invoice | 44675 | DN#12678-EMPTY | CYL | 4,830.00 | 1,207.50 | T0060 CYL_EXCHANGE ✓ ↔ Crd Note 12945, Crd Note 13687, Crd Note 14704, Inv 50065 +3 |

### August 2025

Opening balance (ERP running): **R1,207.50**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Aug 2025 | Invoice | 45540 | DN#20157 | LPG | 8,639.97 | 9,847.47 | T0035 EXACT_SINGLE ✓ ↔ Pmt 40727 |
| 09 Aug 2025 | Invoice | 45541 | DN#20157 | CYL | 7,245.00 | 17,092.47 | T0061 BALANCE_ZERO ✓ ↔ Inv 43615, Crd Note 12638, Crd Note 13187, Inv 49409 +3 |
| 11 Aug 2025 | Crd Note | 13187 | DN#20157 | CYL | -7,245.00 | 9,847.47 | T0061 BALANCE_ZERO ✓ ↔ Inv 43615, Crd Note 12638, Inv 45541, Inv 49409 +3 |
| 13 Aug 2025 | Payment | 40727 | TRANSF \| STAT 117 | LPG | -8,639.97 | 1,207.50 | T0035 EXACT_SINGLE ✓ ↔ Inv 45540 |

### October 2025

Opening balance (ERP running): **R1,207.50**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 15 Oct 2025 | Crd Note | 13687 | DN#20157 | CYL | -8,452.50 | -7,245.00 | T0060 CYL_EXCHANGE ✓ ↔ Crd Note 12945, Inv 44675, Crd Note 14704, Inv 50065 +3 |

### November 2025

Opening balance (ERP running): **R-7,245.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 25 Nov 2025 | Payment | 42420 | TRANSF \| STAT 120 | LPG | -4,780.00 | -12,025.00 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Inv 48022 |
| 27 Nov 2025 | Crd Note | 13954 | DN#21176 | LPG | -4,780.00 | -16,805.00 | T0008 CN_DN_PAIR ✓ ↔ Inv 47943 |
| 27 Nov 2025 | Crd Note | 13955 | DN#21176-EMPTY | CYL | -4,830.00 | -21,635.00 | T0009 CN_DN_PAIR ✓ ↔ Inv 47944 |
| 27 Nov 2025 | Invoice | 47943 | DN#21176 | LPG | 4,780.00 | -16,855.00 | T0008 CN_DN_PAIR ✓ ↔ Crd Note 13954 |
| 27 Nov 2025 | Invoice | 47944 | DN#21176-EMPTY | CYL | 4,830.00 | -12,025.00 | T0009 CN_DN_PAIR ✓ ↔ Crd Note 13955 |

### December 2025

Opening balance (ERP running): **R-12,025.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Dec 2025 | Invoice | 48022 | DN#20694 | LPG | 4,780.00 | -7,245.00 | T0003 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 42420 |
| 01 Dec 2025 | Invoice | 48023 | DN#20694-EMPTY | CYL | 4,830.00 | -2,415.00 | T0010 CN_DN_PAIR ✓ ↔ Crd Note 13987 |
| 02 Dec 2025 | Crd Note | 13987 | DN#20694-EMPTY | CYL | -4,830.00 | -7,245.00 | T0010 CN_DN_PAIR ✓ ↔ Inv 48023 |
| 22 Dec 2025 | Crd Note | 14140 | D/N 21435 - EMPTIES | CYL | -7,245.00 | -14,490.00 | T0011 CN_DN_PAIR ✓ ↔ Inv 48431 |
| 22 Dec 2025 | Invoice | 48430 | D/N 21435 | LPG | 8,639.97 | -5,850.03 | T0036 EXACT_SINGLE ✓ ↔ Pmt 42732 |
| 22 Dec 2025 | Invoice | 48431 | D/N 21435 - EMPTIES | CYL | 7,245.00 | 1,394.97 | T0011 CN_DN_PAIR ✓ ↔ Crd Note 14140 |
| 23 Dec 2025 | Payment | 42732 | TRANSF \| STAT 121 | LPG | -8,639.97 | -7,245.00 | T0036 EXACT_SINGLE ✓ ↔ Inv 48430 |
| 30 Dec 2025 | Crd Note | 14185 | DN#20962-EMPTY | CYL | -4,830.00 | -12,075.00 | T0012 CN_DN_PAIR ✓ ↔ Inv 48543 |
| 30 Dec 2025 | Invoice | 48542 | DN#20962 | LPG | 5,759.98 | -6,315.02 | T0037 EXACT_SINGLE ✓ ↔ Pmt 42868 |
| 30 Dec 2025 | Invoice | 48543 | DN#20962-EMPTY | CYL | 4,830.00 | -1,485.02 | T0012 CN_DN_PAIR ✓ ↔ Crd Note 14185 |

### January 2026

Opening balance (ERP running): **R-1,485.02**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 05 Jan 2026 | Payment | 42868 | TRANSF \| STAT 122 | LPG | -5,759.98 | -7,245.00 | T0037 EXACT_SINGLE ✓ ↔ Inv 48542 |
| 12 Jan 2026 | Payment | 42984 | TRANSF \| STAT 122 | LPG | -5,759.98 | -13,004.98 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Inv 48747 |
| 13 Jan 2026 | Crd Note | 14254 | DN#21632-EMPTY | CYL | -4,830.00 | -17,834.98 | T0013 CN_DN_PAIR ✓ ↔ Inv 48748 |
| 13 Jan 2026 | Invoice | 48747 | DN#21632 | LPG | 5,759.98 | -12,075.00 | T0004 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 42984 |
| 13 Jan 2026 | Invoice | 48748 | DN#21632-EMPTY | CYL | 4,830.00 | -7,245.00 | T0013 CN_DN_PAIR ✓ ↔ Crd Note 14254 |
| 28 Jan 2026 | Crd Note | 14341 | DN*21218-EMPTY | CYL | -7,245.00 | -14,490.00 | T0014 CN_DN_PAIR ✓ ↔ Inv 48983 |
| 28 Jan 2026 | Invoice | 48982 | DN*21218 | LPG | 8,639.97 | -5,850.03 | T0038 EXACT_SINGLE ✓ ↔ Pmt 43155 |
| 28 Jan 2026 | Invoice | 48983 | DN*21218-EMPTY | CYL | 7,245.00 | 1,394.97 | T0014 CN_DN_PAIR ✓ ↔ Crd Note 14341 |
| 30 Jan 2026 | Payment | 43155 | TRANSF \| STAT 122 | LPG | -8,639.97 | -7,245.00 | T0038 EXACT_SINGLE ✓ ↔ Inv 48982 |

### February 2026

Opening balance (ERP running): **R-7,245.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Feb 2026 | Crd Note | 14409 | DN#21243EMPTY | CYL | -4,830.00 | -12,075.00 | T0015 CN_DN_PAIR ✓ ↔ Inv 49165 |
| 10 Feb 2026 | Payment | 43317 | TRANSF \| STAT 123 | LPG | -5,759.98 | -17,834.98 | T0039 EXACT_SINGLE ✓ ↔ Inv 49164 |
| 10 Feb 2026 | Invoice | 49164 | DN#21243 | LPG | 5,759.98 | -12,075.00 | T0039 EXACT_SINGLE ✓ ↔ Pmt 43317 |
| 10 Feb 2026 | Invoice | 49165 | DN#21243EMPTY | CYL | 4,830.00 | -7,245.00 | T0015 CN_DN_PAIR ✓ ↔ Crd Note 14409 |
| 25 Feb 2026 | Invoice | 49409 | DN#21930 | LPG | 7,199.98 | -45.02 | T0061 BALANCE_ZERO ✓ ↔ Inv 43615, Crd Note 12638, Inv 45541, Crd Note 13187 +3 |

### March 2026

Opening balance (ERP running): **R-45.02**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 12 Mar 2026 | Payment | 43641 | TRANSF \| STAT 124 | LPG | -1,440.00 | -1,485.02 | T0061 BALANCE_ZERO ✓ ↔ Inv 43615, Crd Note 12638, Inv 45541, Crd Note 13187 +3 |
| 12 Mar 2026 | Invoice | 49714 | DN#21961 | LPG | 5,759.98 | 4,274.96 | T0061 BALANCE_ZERO ✓ ↔ Inv 43615, Crd Note 12638, Inv 45541, Crd Note 13187 +3 |
| 12 Mar 2026 | Invoice | 49715 | DN#21961-EMPTY | CYL | 4,830.00 | 9,104.96 | T0016 CN_DN_PAIR ✓ ↔ Crd Note 14585 |
| 13 Mar 2026 | Crd Note | 14585 | DN#21961-EMPTY | CYL | -4,830.00 | 4,274.96 | T0016 CN_DN_PAIR ✓ ↔ Inv 49715 |
| 17 Mar 2026 | Payment | 43698 | TRANSF \| STAT 124 | LPG | -4,274.96 | 0.00 | T0061 BALANCE_ZERO ✓ ↔ Inv 43615, Crd Note 12638, Inv 45541, Crd Note 13187 +3 ◀ ZERO |
| 24 Mar 2026 | Payment | 43754 | TRANSF \| STAT 124 | LPG | -8,639.97 | -8,639.97 | T0040 EXACT_SINGLE ✓ ↔ Inv 49875 |
| 24 Mar 2026 | Invoice | 49875 | DN-21844 | LPG | 8,639.97 | 0.00 | T0040 EXACT_SINGLE ✓ ↔ Pmt 43754 ◀ ZERO |
| 24 Mar 2026 | Invoice | 49876 | DN-21844-EMPTY | CYL | 7,245.00 | 7,245.00 | T0017 CN_DN_PAIR ✓ ↔ Crd Note 14644 |
| 25 Mar 2026 | Crd Note | 14644 | DN-21844-EMPTY | CYL | -7,245.00 | 0.00 | T0017 CN_DN_PAIR ✓ ↔ Inv 49876 ◀ ZERO |

### April 2026

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 02 Apr 2026 | Crd Note | 14704 | DN-21857-EMPTY | CYL | -4,830.00 | -4,830.00 | T0060 CYL_EXCHANGE ✓ ↔ Crd Note 12945, Inv 44675, Crd Note 13687, Inv 50065 +3 |
| 02 Apr 2026 | Invoice | 50064 | DN-21857 | LPG | 8,639.97 | 3,809.97 | T0041 EXACT_SINGLE ✓ ↔ Pmt 43921 |
| 02 Apr 2026 | Invoice | 50065 | DN-21857-EMPTY | CYL | 7,245.00 | 11,054.97 | T0060 CYL_EXCHANGE ✓ ↔ Crd Note 12945, Inv 44675, Crd Note 13687, Crd Note 14704 +3 |
| 07 Apr 2026 | Payment | 43921 | TRANSF \| STAT 125 | LPG | -8,639.97 | 2,415.00 | T0041 EXACT_SINGLE ✓ ↔ Inv 50064 |
| 22 Apr 2026 | Invoice | 50344 | DN-21345 | LPG | 5,759.98 | 8,174.98 | T0042 EXACT_MONTH_SUM ✓ ↔ Pmt 44143, Inv 50406 |
| 22 Apr 2026 | Invoice | 50346 | DN-213454-EMPTY | CYL | 4,830.00 | 13,004.98 | T0018 CN_DN_PAIR ✓ ↔ Crd Note 14798 |
| 23 Apr 2026 | Crd Note | 14798 | DN-213454-EMPTY | CYL | -4,830.00 | 8,174.98 | T0018 CN_DN_PAIR ✓ ↔ Inv 50346 |
| 28 Apr 2026 | Crd Note | 14880 | DN-22349-EMPTY | CYL | -4,830.00 | 3,344.98 | T0019 CN_DN_PAIR ✓ ↔ Inv 50407 |
| 28 Apr 2026 | Invoice | 50406 | DN-22349 | LPG | 5,759.98 | 9,104.96 | T0042 EXACT_MONTH_SUM ✓ ↔ Pmt 44143, Inv 50344 |
| 28 Apr 2026 | Invoice | 50407 | DN-22349-EMPTY | CYL | 4,830.00 | 13,934.96 | T0019 CN_DN_PAIR ✓ ↔ Crd Note 14880 |
| 29 Apr 2026 | Payment | 44143 | TRANSF \| STAT 125 | LPG | -11,519.96 | 2,415.00 | T0042 EXACT_MONTH_SUM ✓ ↔ Inv 50344, Inv 50406 |

### May 2026

Opening balance (ERP running): **R2,415.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 07 May 2026 | Invoice | 50580 | DN#22374 | LPG | 5,759.98 | 8,174.98 | T0043 EXACT_SINGLE ✓ ↔ Pmt 44288 |
| 07 May 2026 | Invoice | 50581 | DN#22374-EMPTY | CYL | 4,830.00 | 13,004.98 | T0020 CN_DN_PAIR ✓ ↔ Crd Note 15238 |
| 08 May 2026 | Crd Note | 14885 | CYL RETURN WITH LPG | LPG | -1,289.66 | 11,715.32 | OPEN |
| 08 May 2026 | Crd Note | 15238 | DN#22374-EMPTY | CYL | -4,830.00 | 6,885.32 | T0020 CN_DN_PAIR ✓ ↔ Inv 50581 |
| 12 May 2026 | Payment | 44288 | TRANSF \| STAT 126 | LPG | -5,759.98 | 1,125.34 | T0043 EXACT_SINGLE ✓ ↔ Inv 50580 |
| 20 May 2026 | Crd Note | 14926 | DN#22741 | LPG | -6,143.99 | -5,018.65 | T0021 CN_DN_PAIR ✓ ↔ Inv 50776 |
| 20 May 2026 | Crd Note | 14927 | DN#22741-EMPTY | CYL | -4,830.00 | -9,848.65 | T0022 CN_DN_PAIR ✓ ↔ Inv 50777 |
| 20 May 2026 | Invoice | 50776 | DN#22741 | LPG | 6,143.99 | -3,704.66 | T0021 CN_DN_PAIR ✓ ↔ Crd Note 14926 |
| 20 May 2026 | Invoice | 50777 | DN#22741-EMPTY | CYL | 4,830.00 | 1,125.34 | T0022 CN_DN_PAIR ✓ ↔ Crd Note 14927 |
| 20 May 2026 | Invoice | 50780 | DN#22741 | LPG | 7,679.99 | 8,805.33 | T0044 EXACT_SINGLE ✓ ↔ Pmt 44376 |
| 20 May 2026 | Invoice | 50781 | DN#22741-EMPTY | CYL | 6,037.50 | 14,842.83 | T0023 CN_DN_PAIR ✓ ↔ Crd Note 14932 |
| 21 May 2026 | Crd Note | 14932 | DN#22741-EMPTY | CYL | -6,037.50 | 8,805.33 | T0023 CN_DN_PAIR ✓ ↔ Inv 50781 |
| 21 May 2026 | Payment | 44376 | TRANSF \| STAT 126 | LPG | -7,679.99 | 1,125.34 | T0044 EXACT_SINGLE ✓ ↔ Inv 50780 |
| 28 May 2026 | Invoice | 50915 | DN#22601 | LPG | 6,143.99 | 7,269.33 | T0045 EXACT_SINGLE ✓ ↔ Pmt 44552 |

### June 2026

Opening balance (ERP running): **R7,269.33**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Jun 2026 | Payment | 44552 | TRANSF \| STAT 127 | LPG | -6,143.99 | 1,125.34 | T0045 EXACT_SINGLE ✓ ↔ Inv 50915 |
| 05 Jun 2026 | Invoice | 51048 | DN#22778 | LPG | 5,885.01 | 7,010.35 | T0046 EXACT_SINGLE ✓ ↔ Pmt 44653 |
| 09 Jun 2026 | Payment | 44653 | TRANSF \| STAT 127 | LPG | -5,885.01 | 1,125.34 | T0046 EXACT_SINGLE ✓ ↔ Inv 51048 |
| 15 Jun 2026 | Crd Note | 15069 | DN#22902-EMPTIES | CYL | -6,037.50 | -4,912.16 | T0060 CYL_EXCHANGE ✓ ↔ Crd Note 12945, Inv 44675, Crd Note 13687, Crd Note 14704 +3 |
| 15 Jun 2026 | Invoice | 51221 | DN#22902 | LPG | 5,885.01 | 972.85 | T0047 EXACT_SINGLE ✓ ↔ Pmt 44744 |
| 15 Jun 2026 | Invoice | 51222 | DN#22902-EMPTIES | CYL | 4,830.00 | 5,802.85 | T0060 CYL_EXCHANGE ✓ ↔ Crd Note 12945, Inv 44675, Crd Note 13687, Crd Note 14704 +3 |
| 17 Jun 2026 | Payment | 44744 | TRANSF \| STAT 127 | LPG | -5,885.01 | -82.16 | T0047 EXACT_SINGLE ✓ ↔ Inv 51221 |
| 18 Jun 2026 | Invoice | 51286 | DN#22650 | LPG | 5,885.01 | 5,802.85 | T0048 EXACT_SINGLE ✓ ↔ Pmt 44870 |
| 18 Jun 2026 | Invoice | 51287 | DN#22650-EMPTIES | CYL | 4,830.00 | 10,632.85 | T0024 CN_DN_PAIR ✓ ↔ Crd Note 15090 |
| 19 Jun 2026 | Crd Note | 15090 | DN#22650-EMPTIES | CYL | -4,830.00 | 5,802.85 | T0024 CN_DN_PAIR ✓ ↔ Inv 51287 |
| 22 Jun 2026 | Payment | 44870 | TRANSF \| STAT 127 | LPG | -5,885.01 | -82.16 | T0048 EXACT_SINGLE ✓ ↔ Inv 51286 |
| 25 Jun 2026 | Invoice | 51426 | DN#22917 | LPG | 7,356.26 | 7,274.10 | T0049 EXACT_SINGLE ✓ ↔ Pmt 44959 |
| 25 Jun 2026 | Invoice | 51427 | DN#22917_EMPTY | CYL | 6,037.50 | 13,311.60 | T0060 CYL_EXCHANGE ✓ ↔ Crd Note 12945, Inv 44675, Crd Note 13687, Crd Note 14704 +3 |
| 26 Jun 2026 | Crd Note | 15125 | DN#22917_EMPTY | CYL | -3,622.50 | 9,689.10 | OPEN |
| 29 Jun 2026 | Payment | 44959 | TRANSF \| STAT 127 | LPG | -7,356.26 | 2,332.84 | T0049 EXACT_SINGLE ✓ ↔ Inv 51426 |

### July 2026

Opening balance (ERP running): **R2,332.84**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Jul 2026 | Crd Note | 15192 | DN#22541=EMPTY | CYL | -4,830.00 | -2,497.16 | T0025 CN_DN_PAIR ✓ ↔ Inv 51558 |
| 03 Jul 2026 | Invoice | 51557 | DN#22541 | LPG | 5,912.56 | 3,415.40 | T0050 EXACT_SINGLE ✓ ↔ Pmt 45094 |
| 03 Jul 2026 | Invoice | 51558 | DN#22541=EMPTY | CYL | 4,830.00 | 8,245.40 | T0025 CN_DN_PAIR ✓ ↔ Crd Note 15192 |
| 06 Jul 2026 | Payment | 45094 | TRANSF \| STAT 128 | LPG | -5,912.56 | 2,332.84 | T0050 EXACT_SINGLE ✓ ↔ Inv 51557 |
| 16 Jul 2026 | Invoice | 51890 | DN#22961 | LPG | 7,390.70 | 9,723.54 | T0051 EXACT_SINGLE ✓ ↔ Pmt 45328 |
| 16 Jul 2026 | Invoice | 51891 | DN#22961- EMPTY | CYL | 6,037.50 | 15,761.04 | T0062 CYL_EXCHANGE ✓ ↔ Crd Note 15274, Crd Note 15418, Inv 52383 |
| 17 Jul 2026 | Crd Note | 15274 | DN#22961- EMPTY | CYL | -7,245.00 | 8,516.04 | T0062 CYL_EXCHANGE ✓ ↔ Inv 51891, Crd Note 15418, Inv 52383 |
| 21 Jul 2026 | Payment | 45328 | TRANSF \| STAT 128 | LPG | -7,390.70 | 1,125.34 | T0051 EXACT_SINGLE ✓ ↔ Inv 51890 |
| 23 Jul 2026 | Invoice | 52042 | DN#22974 | LPG | 4,434.42 | 5,559.76 | T0052 EXACT_SINGLE ✓ ↔ Pmt 45465 |
| 24 Jul 2026 | Invoice | 52053 | DN#22974-EMPTY | CYL | 3,622.50 | 9,182.26 | T0027 CN_DN_PAIR ✓ ↔ Crd Note 15327 |
| 24 Jul 2026 | Invoice | 52086 | DN#22974 | LPG | 4,434.42 | 13,616.68 | T0026 CN_DN_PAIR ✓ ↔ Crd Note 15325 |
| 25 Jul 2026 | Crd Note | 15325 | DN#22974 | LPG | -4,434.42 | 9,182.26 | T0026 CN_DN_PAIR ✓ ↔ Inv 52086 |
| 25 Jul 2026 | Crd Note | 15327 | DN#22974-EMPTY | CYL | -3,622.50 | 5,559.76 | T0027 CN_DN_PAIR ✓ ↔ Inv 52053 |
| 28 Jul 2026 | Payment | 45465 | TRANSF \| STAT 128 | LPG | -4,434.42 | 1,125.34 | T0052 EXACT_SINGLE ✓ ↔ Inv 52042 |
| 31 Jul 2026 | Crd Note | 15366 | DN#24225-EMPTY | CYL | -4,830.00 | -3,704.66 | T0028 CN_DN_PAIR ✓ ↔ Inv 52218 |
| 31 Jul 2026 | Invoice | 52217 | DN#24225 | LPG | 5,912.56 | 2,207.90 | T0053 EXACT_SINGLE ✓ ↔ Pmt 45584 |
| 31 Jul 2026 | Invoice | 52218 | DN#24225-EMPTY | CYL | 4,830.00 | 7,037.90 | T0028 CN_DN_PAIR ✓ ↔ Crd Note 15366 |

### August 2026

Opening balance (ERP running): **R7,037.90**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Aug 2026 | Payment | 45584 | TRANSF \| STAT 129 | LPG | -5,912.56 | 1,125.34 | T0053 EXACT_SINGLE ✓ ↔ Inv 52217 |
| 07 Aug 2026 | Crd Note | 15418 | DN#24250=EMPTY | CYL | -3,622.50 | -2,497.16 | T0062 CYL_EXCHANGE ✓ ↔ Inv 51891, Crd Note 15274, Inv 52383 |
| 07 Aug 2026 | Invoice | 52382 | DN#24250 | LPG | 5,912.56 | 3,415.40 | T0054 EXACT_SINGLE ✓ ↔ Pmt 45715 |
| 07 Aug 2026 | Invoice | 52383 | DN#24250=EMPTY | CYL | 4,830.00 | 8,245.40 | T0062 CYL_EXCHANGE ✓ ↔ Inv 51891, Crd Note 15274, Crd Note 15418 |
| 13 Aug 2026 | Payment | 45715 | TRANSF \| STAT 129 | LPG | -5,912.56 | 2,332.84 | T0054 EXACT_SINGLE ✓ ↔ Inv 52382 |
| 14 Aug 2026 | Crd Note | 15462 | DN#24271-EMPTY | CYL | -4,830.00 | -2,497.16 | T0029 CN_DN_PAIR ✓ ↔ Inv 52546 |
| 14 Aug 2026 | Invoice | 52545 | DN#24271 | LPG | 5,194.96 | 2,697.80 | T0055 EXACT_SINGLE ✓ ↔ Pmt 45780 |
| 14 Aug 2026 | Invoice | 52546 | DN#24271-EMPTY | CYL | 4,830.00 | 7,527.80 | T0029 CN_DN_PAIR ✓ ↔ Crd Note 15462 |
| 17 Aug 2026 | Payment | 45780 | TRANSF \| STAT 129 | LPG | -5,194.96 | 2,332.84 | T0055 EXACT_SINGLE ✓ ↔ Inv 52545 |
| 18 Aug 2026 | Crd Note | 15493 | DN#24276-EMPTY | CYL | -3,622.50 | -1,289.66 | T0061 CYL_EXCHANGE ✓ ↔ Inv 52636, Inv 53044, Crd Note 15630 |
| 18 Aug 2026 | Invoice | 52635 | DN#24276 | LPG | 5,194.96 | 3,905.30 | OPEN |
| 18 Aug 2026 | Invoice | 52636 | DN#24276-EMPTY | CYL | 4,830.00 | 8,735.30 | T0061 CYL_EXCHANGE ✓ ↔ Crd Note 15493, Inv 53044, Crd Note 15630 |
| 21 Aug 2026 | Crd Note | 15519 | DN#23969-EMPTY | CYL | -3,622.50 | 5,112.80 | T0030 CN_DN_PAIR ✓ ↔ Inv 52706 |
| 21 Aug 2026 | Invoice | 52705 | DN#23969 | LPG | 3,896.22 | 9,009.02 | T0056 EXACT_SINGLE ✓ ↔ Pmt 45924 |
| 21 Aug 2026 | Invoice | 52706 | DN#23969-EMPTY | CYL | 3,622.50 | 12,631.52 | T0030 CN_DN_PAIR ✓ ↔ Crd Note 15519 |
| 27 Aug 2026 | Payment | 45924 | TRANSF \| STAT 129 | LPG | -3,896.22 | 8,735.30 | T0056 EXACT_SINGLE ✓ ↔ Inv 52705 |
| 27 Aug 2026 | Invoice | 52842 | DN#23983 | LPG | 3,896.22 | 12,631.52 | T0057 EXACT_SINGLE ✓ ↔ Pmt 45996 |
| 28 Aug 2026 | Crd Note | 15570 | DN#23983-EMPTY | CYL | -3,622.50 | 9,009.02 | T0031 CN_DN_PAIR ✓ ↔ Inv 52843 |
| 28 Aug 2026 | Invoice | 52843 | DN#23983-EMPTY | CYL | 3,622.50 | 12,631.52 | T0031 CN_DN_PAIR ✓ ↔ Crd Note 15570 |
| 31 Aug 2026 | Payment | 45996 | TRANSF \| STAT 129 | LPG | -3,896.22 | 8,735.30 | T0057 EXACT_SINGLE ✓ ↔ Inv 52842 |

### September 2026

Opening balance (ERP running): **R8,735.30**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 08 Sept 2026 | Invoice | 53043 | DN#24980 | LPG | 5,311.25 | 14,046.55 | T0058 EXACT_SINGLE ✓ ↔ Pmt 46100 |
| 08 Sept 2026 | Invoice | 53044 | DN#24980-EMPTY | CYL | 4,830.00 | 18,876.55 | T0061 CYL_EXCHANGE ✓ ↔ Crd Note 15493, Inv 52636, Crd Note 15630 |
| 09 Sept 2026 | Crd Note | 15630 | DN#24980-EMPTY | CYL | -6,037.50 | 12,839.05 | T0061 CYL_EXCHANGE ✓ ↔ Crd Note 15493, Inv 52636, Inv 53044 |
| 11 Sept 2026 | Payment | 46100 | TRANSF \| STAT 130 | LPG | -5,311.25 | 7,527.80 | T0058 EXACT_SINGLE ✓ ↔ Inv 53043 |
| 17 Sept 2026 | Invoice | 53163 | DN#24860 | LPG | 5,311.25 | 12,839.05 | T0059 EXACT_SINGLE ✓ ↔ Pmt 46236 |
| 17 Sept 2026 | Invoice | 53164 | DN#24860-EMPTY | CYL | 4,830.00 | 17,669.05 | T0032 CN_DN_PAIR ✓ ↔ Crd Note 15667 |
| 18 Sept 2026 | Crd Note | 15667 | DN#24860-EMPTY | CYL | -4,830.00 | 12,839.05 | T0032 CN_DN_PAIR ✓ ↔ Inv 53164 |
| 21 Sept 2026 | Payment | 46236 | TRANSF \| STAT 130 | LPG | -5,311.25 | 7,527.80 | T0059 EXACT_SINGLE ✓ ↔ Inv 53163 |
| 25 Sept 2026 | Invoice | 53283 | DN#21374 | LPG | 3,983.44 | 11,511.24 | OPEN |
| 29 Sept 2026 | Payment | 46332 | TRANSF \| STAT 130 | LPG | -5,311.25 | 6,199.99 | OPEN |

### October 2026

Opening balance (ERP running): **R6,199.99**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 01 Oct 2026 | Invoice | 53422 | DN#23832 | LPG | 3,983.44 | 10,183.43 | OPEN |
| 01 Oct 2026 | Invoice | 53423 | DN#23832-EMPTY | CYL | 3,622.50 | 13,805.93 | T0033 CN_DN_PAIR ✓ ↔ Crd Note 15742 |
| 02 Oct 2026 | Crd Note | 15742 | DN#23832-EMPTY | CYL | -3,622.50 | 10,183.43 | T0033 CN_DN_PAIR ✓ ↔ Inv 53423 |

---

## Ties by rule

| Rule | Confirmed | Probable |
| :--- | ---: | ---: |
| LOCKED | 4 | 0 |
| CN_DN_PAIR | 27 | 0 |
| EXACT_SINGLE | 25 | 0 |
| EXACT_MONTH_SUM | 1 | 0 |
| CYL_EXCHANGE | 3 | 0 |
| BALANCE_ZERO | 1 | 0 |

## Probable ties dissolved by BALANCE_ZERO

| Group | Through | Dissolved |
| :--- | :--- | :--- |
| T0061 | 17 Mar 2026 (line 56) | CN_DN_PAIR: Invoice 43615 + Crd Note 12638; CN_DN_PAIR: Invoice 45541 + Crd Note 13187 |

Proof: holds (rebuilt R10,183.43 vs closing R10,183.43; ERP R10,183.43).

