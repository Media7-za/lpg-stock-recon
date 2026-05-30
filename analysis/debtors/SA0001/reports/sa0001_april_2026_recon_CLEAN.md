# Debtors Reconciliation Report: SA0001 (April 2026) — CLEAN
**Status**: RECONCILED (ZERO VARIANCE)
**Data Snapshot**: Healed Supabase (Post-LSR-4 Fix)
**Generated**: 2026-05-12

## Section 1: Operational Activity
*True economic events occurring within the April billing cycle.*

| Doc No | Date | Event Type | Amount (ZAR) | Description |
| :--- | :--- | :--- | :--- | :--- |
| 00050140 | 07/04/2026 | Revenue | 6,083.41 | DN#22155 (LPG + Cylinders) |
| 00050144 | 13/04/2026 | Revenue | 3,122.25 | DN#21856 (LPG) |
| **TOTAL** | | | **9,205.66** | |

## Section 2: Settlement Timing Variances
*Settlements applied to April invoices or received during the period.*

| Doc No | Date | Event Type | Amount (ZAR) | Allocation State |
| :--- | :--- | :--- | :--- | :--- |
| 00050012 | 01/04/2026 | Settlement | -1,035.00 | Applied Credit |
| 00050108 | 07/04/2026 | Settlement | -517.50 | Applied Credit |
| 00050141 | 09/04/2026 | Settlement | -4,830.00 | Applied Credit |
| 00014731 | 08/04/2026 | Settlement | -7,133.49 | Electronic Payment |
| **TOTAL** | | | **-13,515.99** | |

## Section 3: Reconciliation Bridge
*Connecting Operational Reality to the Final Ledger Position.*

| Category | Value (ZAR) | Note |
| :--- | :--- | :--- |
| **Operational Net Change** | **-4,310.33** | April billing vs April collections |
| Timing Variances | 0.00 | All collections fully reconciled |
| Prior Period Adj | 0.00 | No historical reversals found |
| System Exceptions | 0.00 | **VAT Distortion eliminated (LSR-4 fixed)** |
| **Final Ledger Change** | **-4,310.33** | **Matches ERP Net Movement** |

## Section 4: Net Financial Position
The account experienced a net credit movement of **-4,310.33 ZAR** for the month of April. 

**Integrity Status**: 🟢 PASS
The variance between the Ledger and Operational Truth is **0.00**. This account is now fully reconciled and the double-taxation error has been successfully stripped from all historical April records.
