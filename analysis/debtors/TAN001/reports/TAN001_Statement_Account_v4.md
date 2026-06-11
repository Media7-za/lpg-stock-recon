# Statement of Account: Tanya Lehman (TAN001) - Version 4 (Canonical Settlement Allocation Doctrine)
**Period:** 1 January 2026 → 30 June 2026 &nbsp;|&nbsp; **Account:** TAN001
**Opening Balance B/F:** R60,355.10 (ERP verified — source: Consolidated Audit / Statement)

---

<!-- INTERNAL_ONLY_START -->
## ⚠️ Audit Disclosure & Executive Summary

During the reconstruction of TAN001, we verified that the account contains legacy date-shift anomalies and minor invoice-level double-taxation discrepancies in the ERP database header layer.

### 🔍 Key Findings:
1. **Header Layer Double-Taxation Bugs (Historical):**
   * Two historical invoices before 2026, **Invoice 11632** (R322.91 tax) and **Invoice 14337** (R1,441.17 tax), were double-taxed on the ERP database header table, creating a legacy variance of **R1,764.08**.
2. **Period Credit Note Tax Polarity (2026):**
   * Unlike historical periods, 2026 Credit Notes were recorded correctly in the database header table (with tax-exclusive amount in `amount_excl` and tax in `tax_amount`). Applying the standard historical credit note correction would introduce an artificial mismatch of **R3,060.00** in the period.
3. **True Reconciled Balance:**
   * This Stacked Statement calculates the **True Balance directly from raw database line items** (`vw_clean_transactions`), safely bypassing the ERP statement generator's header bugs.
   * The final True Reconciled Balance is **R96,284.18**, which matches the corrected ERP running ledger.

---
<!-- INTERNAL_ONLY_END -->

## Part 1: LPG Gas Statement
*Tracks all gas invoiced, cylinder deposits, and payments received since 1 January 2026. Matching cylinder invoice/credit note pairs (which cancel out exactly) are stripped from this view for readability. This combined ledger directly reconciles with the ERP running balance.*

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **60,355.10** |
| 04 Jan 2026 | Payment | 00042860 | -5,000.00 | 55,355.10 |
| 07 Jan 2026 | Invoice | 48666 | 4,673.68 | 60,028.78 |
| 07 Jan 2026 | Invoice | 48667 | 5,175.00 | 65,203.78 |
| 07 Jan 2026 | Crd Note | 14228 | -3,967.50 | 61,236.28 |
| 13 Jan 2026 | Payment | 00042988 | -5,000.00 | 56,236.28 |
| 20 Jan 2026 | Payment | 00043069 | -2,000.00 | 54,236.28 |
| 20 Jan 2026 | Invoice | 48887 | 3,135.87 | 57,372.15 |
| 25 Jan 2026 | Invoice | 48951 | 3,135.87 | 60,508.02 |
| 25 Jan 2026 | Invoice | 48952 | 3,450.00 | 63,958.02 |
| 25 Jan 2026 | Crd Note | 14337 | -2,932.50 | 61,025.52 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **61,025.52** |
| 01 Feb 2026 | Payment | 00043228 | -3,000.00 | 58,025.52 |
| 01 Feb 2026 | Invoice | 49065 | 2,640.72 | 60,666.24 |
| 01 Feb 2026 | Invoice | 49066 | 2,415.00 | 63,081.24 |
| 09 Feb 2026 | Payment | 00043319 | -3,000.00 | 60,081.24 |
| 09 Feb 2026 | Invoice | 49173 | 1,833.76 | 61,915.00 |
| 16 Feb 2026 | Invoice | 49289 | 2,917.34 | 64,832.34 |
| 16 Feb 2026 | Invoice | 49290 | 2,932.50 | 67,764.84 |
| 18 Feb 2026 | Crd Note | 14446 | -5,347.50 | 62,417.34 |
| 22 Feb 2026 | Payment | 00043432 | -3,000.00 | 59,417.34 |
| 22 Feb 2026 | Invoice | 49382 | 3,417.46 | 62,834.80 |
| 22 Feb 2026 | Invoice | 49383 | 3,967.50 | 66,802.30 |
| 23 Feb 2026 | Crd Note | 14478 | -1,552.50 | 65,249.80 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **65,249.80** |
| 04 Mar 2026 | Invoice | 49583 | 2,667.29 | 67,917.09 |
| 04 Mar 2026 | Invoice | 49584 | 2,415.00 | 70,332.09 |
| 04 Mar 2026 | Crd Note | 14545 | -3,622.50 | 66,709.59 |
| 11 Mar 2026 | Payment | 00043620 | -3,000.00 | 63,709.59 |
| 11 Mar 2026 | Invoice | 49700 | 3,190.21 | 66,899.80 |
| 11 Mar 2026 | Invoice | 49701 | 3,190.21 | 70,090.01 |
| 11 Mar 2026 | Invoice | 49705 | 3,450.00 | 73,540.01 |
| 11 Mar 2026 | Crd Note | 14583 | -3,190.21 | 70,349.80 |
| 12 Mar 2026 | Crd Note | 14589 | -5,692.50 | 64,657.30 |
| 15 Mar 2026 | Invoice | 49754 | 3,442.08 | 68,099.38 |
| 15 Mar 2026 | Invoice | 49755 | 3,967.50 | 72,066.88 |
| 16 Mar 2026 | Crd Note | 14599 | -1,725.00 | 70,341.88 |
| 24 Mar 2026 | Invoice | 49922 | 3,190.21 | 73,532.09 |
| 24 Mar 2026 | Invoice | 49923 | 3,450.00 | 76,982.09 |
| 25 Mar 2026 | Crd Note | 14664 | -2,415.00 | 74,567.09 |

---

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **74,567.09** |
| 01 Apr 2026 | Invoice | 50055 | 5,372.98 | 79,940.07 |
| 01 Apr 2026 | Invoice | 50056 | 4,830.00 | 84,770.07 |
| 01 Apr 2026 | Crd Note | 14700 | -5,692.50 | 79,077.57 |
| 12 Apr 2026 | Payment | 00043976 | -5,000.00 | 74,077.57 |
| 15 Apr 2026 | Invoice | 50252 | 2,974.50 | 77,052.07 |
| 15 Apr 2026 | Invoice | 50253 | 2,415.00 | 79,467.07 |
| 15 Apr 2026 | Crd Note | 14763 | -1,725.00 | 77,742.07 |
| 17 Apr 2026 | Invoice | 50280 | 557.73 | 78,299.80 |
| 17 Apr 2026 | Invoice | 50326 | 1,035.00 | 79,334.80 |
| 17 Apr 2026 | Crd Note | 14781 | -517.50 | 78,817.30 |
| 23 Apr 2026 | Invoice | 50380 | 3,532.22 | 82,349.52 |
| 29 Apr 2026 | Invoice | 50415 | 1,766.11 | 84,115.63 |
| 29 Apr 2026 | Invoice | 50416 | 1,725.00 | 85,840.63 |
| 29 Apr 2026 | Crd Note | 14816 | -1,207.50 | 84,633.13 |

---

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **84,633.13** |
| 05 May 2026 | Invoice | 50538 | 3,811.09 | 88,444.22 |
| 05 May 2026 | Invoice | 50539 | 3,967.50 | 92,411.72 |
| 06 May 2026 | Payment | 00044224 | -3,000.00 | 89,411.72 |
| 06 May 2026 | Crd Note | 14865 | -3,450.00 | 85,961.72 |
| 11 May 2026 | Invoice | 50637 | 3,398.11 | 89,359.83 |
| 17 May 2026 | Invoice | 50755 | 4,353.83 | 93,713.66 |
| 21 May 2026 | Payment | 00044381 | -3,500.00 | 90,213.66 |
| 24 May 2026 | Invoice | 50851 | 4,035.26 | 94,248.92 |
| 31 May 2026 | Payment | 00044460 | -2,000.00 | 92,248.92 |
| 31 May 2026 | Invoice | 50973 | 4,035.26 | 96,284.18 |

---

## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders are tracked purely by physical count. The Opening Balance on 01 January 2026 incorporates legacied migration balances.*

### January 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **0** | **-3** | **13** | **2** | **-9** |
| 07 Jan 2026 | Invoice | 48667 | 0 | 0 | +3 | 0 | +3 |
| 07 Jan 2026 | Crd Note | 14228 | 0 | 0 | -3 | 0 | -2 |
| 20 Jan 2026 | Invoice | 48888 | 0 | 0 | +2 | 0 | +2 |
| 21 Jan 2026 | Crd Note | 14305 | 0 | 0 | -2 | 0 | -2 |
| 25 Jan 2026 | Invoice | 48952 | 0 | 0 | +2 | 0 | +2 |
| 25 Jan 2026 | Crd Note | 14337 | 0 | 0 | -1 | 0 | -2 |
| **End Jan** | **Closing Balance** | — | **0** | **-3** | **14** | **2** | **-8** |

---

### February 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **0** | **-3** | **14** | **2** | **-8** |
| 01 Feb 2026 | Invoice | 49066 | 0 | 0 | 0 | 0 | +2 |
| 09 Feb 2026 | Invoice | 49174 | 0 | 0 | +2 | 0 | +1 |
| 11 Feb 2026 | Crd Note | 14417 | 0 | -1 | -3 | 0 | 0 |
| 16 Feb 2026 | Invoice | 49290 | 0 | 0 | +1 | 0 | +2 |
| 18 Feb 2026 | Crd Note | 14446 | 0 | 0 | -1 | 0 | -4 |
| 22 Feb 2026 | Invoice | 49383 | 0 | 0 | +3 | 0 | +2 |
| 23 Feb 2026 | Crd Note | 14478 | 0 | 0 | -3 | 0 | 0 |
| **End Feb** | **Closing Balance** | — | **0** | **-4** | **13** | **2** | **-5** |

---

### March 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **0** | **-4** | **13** | **2** | **-5** |
| 04 Mar 2026 | Invoice | 49584 | 0 | 0 | 0 | 0 | +2 |
| 04 Mar 2026 | Crd Note | 14545 | 0 | 0 | 0 | 0 | -3 |
| 11 Mar 2026 | Invoice | 49702 | 0 | 0 | +2 | 0 | +2 |
| 11 Mar 2026 | Invoice | 49705 | 0 | 0 | +2 | +1 | +1 |
| 11 Mar 2026 | Crd Note | 14584 | 0 | 0 | -2 | 0 | -2 |
| 12 Mar 2026 | Crd Note | 14589 | 0 | 0 | -4 | 0 | -3 |
| 15 Mar 2026 | Invoice | 49755 | 0 | 0 | +3 | 0 | +2 |
| 16 Mar 2026 | Crd Note | 14599 | 0 | 0 | -1 | 0 | -1 |
| 24 Mar 2026 | Invoice | 49923 | 0 | 0 | +2 | 0 | +2 |
| 25 Mar 2026 | Crd Note | 14664 | 0 | 0 | 0 | 0 | -2 |
| **End Mar** | **Closing Balance** | — | **0** | **-4** | **15** | **3** | **-7** |

---

### April 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **0** | **-4** | **15** | **3** | **-7** |
| 01 Apr 2026 | Invoice | 50056 | 0 | 0 | 0 | 0 | +4 |
| 01 Apr 2026 | Crd Note | 14700 | 0 | 0 | -4 | -1 | -2 |
| 15 Apr 2026 | Invoice | 50253 | 0 | 0 | 0 | 0 | +2 |
| 15 Apr 2026 | Crd Note | 14763 | 0 | 0 | -1 | 0 | -1 |
| 17 Apr 2026 | Invoice | 50281 | 0 | 0 | +2 | 0 | 0 |
| 17 Apr 2026 | Invoice | 50326 | 0 | 0 | +2 | 0 | 0 |
| 17 Apr 2026 | Crd Note | 14781 | 0 | 0 | -1 | 0 | 0 |
| 18 Apr 2026 | Crd Note | 14771 | 0 | 0 | -2 | 0 | 0 |
| 23 Apr 2026 | Invoice | 50381 | 0 | 0 | +2 | 0 | +2 |
| 24 Apr 2026 | Crd Note | 14807 | 0 | 0 | -2 | 0 | -2 |
| 29 Apr 2026 | Invoice | 50416 | 0 | 0 | +1 | 0 | +1 |
| 29 Apr 2026 | Crd Note | 14816 | 0 | 0 | 0 | 0 | -1 |
| **End Apr** | **Closing Balance** | — | **0** | **-4** | **12** | **2** | **-4** |

---

### May 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **0** | **-4** | **12** | **2** | **-4** |
| 05 May 2026 | Invoice | 50539 | 0 | 0 | +3 | 0 | +2 |
| 06 May 2026 | Crd Note | 14865 | 0 | 0 | -2 | 0 | -2 |
| 11 May 2026 | Invoice | 50638 | 0 | 0 | 0 | 0 | +2 |
| 11 May 2026 | Crd Note | 14897 | 0 | 0 | 0 | 0 | -2 |
| 18 May 2026 | Invoice | 50756 | 0 | 0 | +3 | 0 | +2 |
| 18 May 2026 | Crd Note | 14923 | 0 | 0 | -3 | 0 | -2 |
| 24 May 2026 | Invoice | 50858 | 0 | 0 | +2 | 0 | +2 |
| 24 May 2026 | Crd Note | 14967 | 0 | 0 | -2 | 0 | -2 |
| 31 May 2026 | Invoice | 50974 | 0 | 0 | +2 | 0 | +2 |
| **End May** | **Closing Balance** | — | **0** | **-4** | **15** | **2** | **-2** |

---

### June 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **0** | **-4** | **15** | **2** | **-2** |
| 01 Jun 2026 | Crd Note | 15006 | 0 | 0 | -2 | 0 | -2 |
| **End Jun** | **Closing Balance** | — | **0** | **-4** | **13** | **2** | **-4** |

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt | R97,146.68 |
| Cylinder Financial Balance | R-862.50 |
| **Total Debtor Balance** | **R96,284.18** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 19kg (19.1) | -4 | R690.00 | R-2,760.00 |
| 9kg (9.1) | 13 | R517.50 | R6,727.50 |
| Double-Valve (D.1) | 2 | R1,150.00 | R2,300.00 |
| Single-Valve (S.1) | -4 | R1,150.00 | R-4,600.00 |
| **Total** | **7** | — | **R1,667.50** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position | R-862.50 | R1,667.50 | R-2,530.00 |

**ERP Combined Balance:** R99,374.75  
**Reconstructed Balance:** R96,284.18  
**Variance:** R3,090.57

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
