# Debtors Reconciliation (Adjusted)
**Account**: SA0001 (SAKI - VICTORIA RD)
**Period**: March 2026
**Region/File**: DRTX

## Summary of Activity

| Entry Type | Total Amount (ZAR) | Notes |
|---|---|---|
| Invoices (March Activity) | 25,288.64 | Standard March invoicing |
| Credit Notes (March Activity) | -11,730.00 | Standard empty returns |
| Payments (March Activity) | -12,263.67 | Cash received in March |
| **Adjusted March Movement** | **1,294.97** | **Net Movement excluding Feb error reversals** |
| *Less*: Reversal of Feb Error (DN#21801) | -12,873.79 | Credits processed on 02/03 for erroneous Feb invoices |
| **Total Ledger Movement** | **-11,578.82** | **Matches system total** |

## Breakdown of the +1,294.97 ZAR Balance
The positive 1,294.97 balance in March activity is perfectly explained by two timing differences crossing month-end boundaries:

1. **New Unpaid March Debt (+1,551.33 ZAR)**
   Invoices generated on the final day of the month (31/03/2026) that haven't been paid or credited yet:
   - Invoice `00050011` (DN-21850): +516.33
   - Invoice `00050012` (DN-21850-EMPTY): +1,035.00
   *Total: +1,551.33 ZAR*

2. **March Cash Applied to February Debt (-256.36 ZAR)**
   A payment of -5,981.75 ZAR on 09/03 covered a March invoice (5,725.39) AND an old unpaid invoice from February:
   - Invoice `00049297` (18/02/2026): -256.36
   *Total: -256.36 ZAR*

**Reconciliation**: +1,551.33 (Unpaid New Debt) - 256.36 (Paid Old Debt) = **+1,294.97 ZAR**

## Detailed Ledger Entries

### 1. Reversal of Erroneous February Invoices (DN#21801)
*These credit notes were processed on 02/03 but relate to invoices `00049456` and `00049457` from 26/02. The entire delivery was reversed.*
| Date | Doc No | Description | Amount |
|---|---|---|---|
| 02/03/2026 | 00014516 | DN#21801 | -6,836.29 |
| 02/03/2026 | 00014517 | DN#21801-EMPTY | -6,037.50 |
| **Total** | | | **-12,873.79** |

### 2. March Invoices
| Date | Doc No | Description | Amount |
|---|---|---|---|
| 02/03/2026 | 00049506 | DN#21946 (Replacement for DN#21801) | 5,725.39 |
| 02/03/2026 | 00049507 | DN#21946-EMPTY | 5,347.50 |
| 09/03/2026 | 00049642 | DN#21952 | 258.16 |
| 09/03/2026 | 00049643 | DN#21952-EMPTY | 517.50 |
| 18/03/2026 | 00049798 | DN#22133 | 258.16 |
| 18/03/2026 | 00049799 | DN#22133-EMPTY | 517.50 |
| 19/03/2026 | 00049836 | DN=22140 | 5,507.44 |
| 19/03/2026 | 00049837 | DN=22140=EMPTY | 4,830.00 |
| 25/03/2026 | 00049903 | DN-21977 | 258.16 |
| 25/03/2026 | 00049904 | DN-00-EMPTY | 517.50 |
| 31/03/2026 | 00050011 | DN-21850 | 516.33 |
| 31/03/2026 | 00050012 | DN-21850-EMPTY | 1,035.00 |
| **Total** | | | **25,288.64** |

### 3. March Credit Notes (Standard Returns)
| Date | Doc No | Description | Amount |
|---|---|---|---|
| 02/03/2026 | 00014520 | DN#21946-EMPTY | -5,347.50 |
| 10/03/2026 | 00014564 | DN#21952-EMPTY | -517.50 |
| 18/03/2026 | 00014611 | DN#22133-EMPTY | -517.50 |
| 20/03/2026 | 00014629 | DN=22140=EMPTY | -4,830.00 |
| 25/03/2026 | 00014651 | DN-00-EMPTY | -517.50 |
| **Total** | | | **-11,730.00** |

### 4. March Payments
| Date | Doc No | Alloc Details | Amount |
|---|---|---|---|
| 09/03/2026 | 00043644 | Pays Inv 00049506 (5,725.39) + Feb Inv 00049297 (256.36) | -5,981.75 |
| 16/03/2026 | 00043696 | Pays Inv 00049642 | -258.16 |
| 23/03/2026 | 00043751 | Pays Inv 00049798 | -258.16 |
| 23/03/2026 | 00043751 | Pays Inv 00049836 | -5,507.44 |
| 31/03/2026 | 00043871 | Pays Inv 00049903 | -258.16 |
| **Total** | | | **-12,263.67** |
