# Internal ledger: TWK AGRI (TWK003), matcher review
**INTERNAL, not for the customer.** Every transaction in ERP order with the ERP running balance and what matcher v5 did with it · generated 2026-10-14 · 1 confirmed / 1 probable ties · 2 rows open · ERP `CURRENT BALANCE` R-300.00 · matcher v5 ratified 2026-10-10; probable ties are proposals until approved

**Status key:** `OPEN` untied · `T0001 EXACT_SINGLE ✓` confirmed tie · `T0001 BATCH_SUM ?` probable tie (needs approval) · `LOCKED` operator-approved lock · `◀ ZERO` ERP running balance is within R0.05 after this line.

---

### October 2025

Opening balance (ERP running): **R0.00**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 03 Oct 2025 | Invoice | 46857 | DN#20290- 391175708 | OTHER | 11,000.44 | 11,000.44 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 43500, Inv 47076, Inv 47523, Inv 47991 |
| 10 Oct 2025 | Invoice | 47076 | DN #20297 | OTHER | 11,000.44 | 22,000.88 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 43500, Inv 46857, Inv 47523, Inv 47991 |

### November 2025

Opening balance (ERP running): **R22,000.88**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 04 Nov 2025 | Invoice | 47523 | DN #20774 | OTHER | 11,000.44 | 33,001.32 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 43500, Inv 46857, Inv 47076, Inv 47991 |
| 21 Nov 2025 | Invoice | 47866 | DN # 21166 | OTHER | 2,000.00 | 35,001.32 | OPEN |
| 22 Nov 2025 | Invoice | 47880 | DN#21166 | OTHER | 5,499.99 | 40,501.31 | T0002 CN_DN_PAIR ? ↔ Crd Note 13966 |
| 24 Nov 2025 | Crd Note | 13933 | DN # 21166 | OTHER | -2,300.00 | 38,201.31 | OPEN |
| 28 Nov 2025 | Crd Note | 13966 | DN#21166 | OTHER | -5,499.99 | 32,701.32 | T0002 CN_DN_PAIR ? ↔ Inv 47880 |
| 28 Nov 2025 | Invoice | 47991 | 391176350-001 /21166 | OTHER | 5,499.99 | 38,201.31 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Pmt 43500, Inv 46857, Inv 47076, Inv 47523 |

### February 2026

Opening balance (ERP running): **R38,201.31**

| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |
| 25 Feb 2026 | Payment | 43500 | TRANSF \| STAT 123 | LPG | -38,501.31 | -300.00 | T0001 LOCKED:OPERATOR_RULING [exact] ↔ Inv 46857, Inv 47076, Inv 47523, Inv 47991 |

---

## Ties by rule

| Rule | Confirmed | Probable |
| :--- | ---: | ---: |
| LOCKED | 1 | 0 |
| CN_DN_PAIR | 0 | 1 |

## Probable ties awaiting approval

| Tie | Rule | Documents | Variance (R) |
| :--- | :--- | :--- | ---: |
| T0002 | CN_DN_PAIR | Invoice 47880, Crd Note 13966 | — |

Proof: holds (rebuilt R-300.00 vs closing R-300.00; ERP R-300.00).

