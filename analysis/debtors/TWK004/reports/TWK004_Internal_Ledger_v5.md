# Internal ledger: TWK AGRI (TWK004), matcher review
**INTERNAL, not for the customer.** Every transaction in ERP order with the ERP running balance and what matcher v5 did with it · generated 2026-10-14 · 3 confirmed / 0 probable ties · 3 rows open · ERP `CURRENT BALANCE` R61,000.00 · matcher v5 ratified 2026-10-10; probable ties are proposals until approved

**Status key:** `OPEN` untied · `T0001 EXACT_SINGLE ✓` confirmed tie · `T0001 BATCH_SUM ?` probable tie (needs approval) · `LOCKED` operator-approved lock · `◀ ZERO` ERP running balance is within R0.05 after this line.

**ERP balance returns to ~R0.00** after: 25 Feb 2026 (Pmt 43500, line 8, R0.00).

---

### October 2025

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Oct 2025 | Invoice | 46858 | DN#20289- 313100132 | OTHER | 9,000.36 | 9,000.36 | T0003 EXACT_RUN ✓ ↔ Pmt 43500, Inv 47176, Inv 47303, Inv 47584 |
| 18 Oct 2025 | Invoice | 47176 | DN#20195 | OTHER | 3,000.12 | 12,000.48 | T0003 EXACT_RUN ✓ ↔ Pmt 43500, Inv 46858, Inv 47303, Inv 47584 |
| 24 Oct 2025 | Crd Note | 13744 | DN#20749 | OTHER | -7,000.28 | 5,000.20 | T0001 CN_DN_PAIR ✓ ↔ Inv 47297 |
| 24 Oct 2025 | Invoice | 47297 | DN#20749 | OTHER | 7,000.28 | 12,000.48 | T0001 CN_DN_PAIR ✓ ↔ Crd Note 13744 |
| 24 Oct 2025 | Invoice | 47303 | DN-20749-313100223 | OTHER | 7,000.28 | 19,000.76 | T0003 EXACT_RUN ✓ ↔ Pmt 43500, Inv 46858, Inv 47176, Inv 47584 |

### November 2025

Opening balance (ERP running): **R19,000.76**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 10 Nov 2025 | Invoice | 47584 | DN-20779-313100349-0 | OTHER | 5,999.55 | 25,000.31 | T0003 EXACT_RUN ✓ ↔ Pmt 43500, Inv 46858, Inv 47176, Inv 47303 |

### February 2026

Opening balance (ERP running): **R25,000.31**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 25 Feb 2026 | Payment | 43500 | TRANSF \| STAT 123 | LPG | -25,000.31 | 0.00 | T0003 EXACT_RUN ✓ ↔ Inv 46858, Inv 47176, Inv 47303, Inv 47584 ◀ ZERO |

### September 2026

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Sept 2026 | Invoice | 52948 | DN#24817 | OTHER | 9,000.00 | 9,000.00 | OPEN |
| 10 Sept 2026 | Invoice | 53113 | DN#24985 | OTHER | 22,000.00 | 31,000.00 | OPEN |

### October 2026

Opening balance (ERP running): **R31,000.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 09 Oct 2026 | Invoice | 53535 | DN#24718 | OTHER | 32,500.00 | 63,500.00 | T0002 CN_DN_PAIR ✓ ↔ Crd Note 15781 |
| 09 Oct 2026 | Invoice | 53536 | DN#24718 | OTHER | 30,000.00 | 93,500.00 | OPEN |
| 10 Oct 2026 | Crd Note | 15781 | DN#24718 | OTHER | -32,500.00 | 61,000.00 | T0002 CN_DN_PAIR ✓ ↔ Inv 53535 |

---

## Ties by rule

| Rule | Confirmed | Probable |
| :--- | ---: | ---: |
| CN_DN_PAIR | 2 | 0 |
| EXACT_RUN | 1 | 0 |

Proof: holds (rebuilt R61,000.00 vs closing R61,000.00; ERP R61,000.00).

