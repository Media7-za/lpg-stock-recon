# Probable ties by group

Generated 2026-10-10 by `probable_ties_review.mjs`. Read-only. 8 probable ties across 9 accounts. PROPOSED until approved (an approval records an operator ruling as a lock).

| Group | What it is | Ties | Zero-net | Gross (R) | FIR001 | JEN001 | MD0003 | MON001 | MOZ002 | RED001 | SA0001 | TAN002 | TWK002 |
| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **CN-AD** | CN pair, exact amount + date only (no DN) | 1 | 1 | 1,162.63 |  |  |  |  |  |  |  | 1 |  |
| **CN-DN-1** | CN pair, same DN, exact amount, lag 2-7 days | 1 | 1 | 1,184.37 |  |  |  |  |  |  |  | 1 |  |
| **PAY-BATCH** | payments settling a delivery batch | 1 | 1 | 5,430.30 |  |  |  | 1 |  |  |  |  |  |
| **PAY-NEAR** | payment within R1.00 of 2-3 invoices | 2 | 0 | 13,260.94 |  |  |  |  |  |  | 1 | 1 |  |
| **PAY-PROX** | payment within R5.00 of one invoice | 2 | 0 | 3,405.90 |  |  |  | 1 |  |  | 1 |  |  |
| **REMIT** | remittance tie with line discrepancies | 1 | 1 | 19,365.67 |  |  | 1 |  |  |  |  |  |  |

## Detail

### CN-AD: CN pair, exact amount + date only (no DN)

| Account | Tie | Documents | Lanes | Dates | Lag (d) | Net (R) | Gross (R) | Note |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | ---: | :--- |
| TAN002 | T0068 | Invoice 48722 + Crd Note 14235 | LPG | 2026-01-09 | 0 | 0.00 | 1,162.63 |  |

### CN-DN-1: CN pair, same DN, exact amount, lag 2-7 days

| Account | Tie | Documents | Lanes | Dates | Lag (d) | Net (R) | Gross (R) | Note |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | ---: | :--- |
| TAN002 | T0059 | Invoice 49360 + Crd Note 14472 | LPG | 2026-02-21 → 2026-02-23 | 2 | 0.00 | 1,184.37 |  |

### PAY-BATCH: payments settling a delivery batch

| Account | Tie | Documents | Lanes | Dates | Lag (d) | Net (R) | Gross (R) | Note |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | ---: | :--- |
| MON001 | T0030 | Payment 45216 + Invoice 50363 + Invoice 50097 | LPG+CYL | 2026-04-02 → 2026-07-15 | — | 0.00 | 5,430.30 |  |

### PAY-NEAR: payment within R1.00 of 2-3 invoices

| Account | Tie | Documents | Lanes | Dates | Lag (d) | Net (R) | Gross (R) | Note |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | ---: | :--- |
| SA0001 | T0160 | Payment 38531 + Invoice 42816 + Invoice 42583 | LPG | 2025-04-26 → 2025-05-07 | — | 0.06 | 6,514.56 | closed period; needs a treatment |
| TAN002 | T0087 | Payment 42300 + Invoice 47662 + Invoice 47666 + Invoice 47285 | LPG | 2025-10-24 → 2025-11-18 | — | 0.36 | 6,746.38 | needs a treatment |

### PAY-PROX: payment within R5.00 of one invoice

| Account | Tie | Documents | Lanes | Dates | Lag (d) | Net (R) | Gross (R) | Note |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | ---: | :--- |
| MON001 | T0029 | Payment 45589 + Invoice 51846 | LPG | 2026-07-15 → 2026-08-05 | — | 0.10 | 3,123.10 | needs a treatment |
| SA0001 | T0161 | Payment 38878 + Invoice 43375 | LPG | 2025-05-27 | — | -0.20 | 282.80 | closed period; needs a treatment |

### REMIT: remittance tie with line discrepancies

| Account | Tie | Documents | Lanes | Dates | Lag (d) | Net (R) | Gross (R) | Note |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | ---: | :--- |
| MD0003 | T0009 | Payment 43494 + Invoice 48737 + Invoice 48784 + Invoice 48906 + Invoice 48919 + Invoice 48927 + Crd Note 14328 | LPG+CYL | 2026-01-12 → 2026-03-02 | — | 0.00 | 19,365.67 |  |

