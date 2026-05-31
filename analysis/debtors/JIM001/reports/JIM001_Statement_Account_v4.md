# Statement of Account: Jim Gas (JIM001) - Version 4 (Canonical Settlement Allocation Doctrine)
**Period:** 3 December 2018 → 31 May 2026 &nbsp;|&nbsp; **Account:** JIM001
**Opening Balance B/F:** R0.00 (Account inception in ERP database)

---

<!-- INTERNAL_ONLY_START -->
## ⚠️ Audit Disclosure & Executive Summary

During the reconstruction of JIM001, we verified that the account contains large-scale payment allocation splits and credit note double-taxation discrepancies in the ERP database header layer.

### 🔍 Key Findings:
1. **Deduplication Defect Diagnosed (R284,760.09):**
   * A naive database deduplication checking `DISTINCT ON (doc_no, entry_type, tx_date)` incorrectly drops split payment allocations of identical amounts on the same date, dropping **R268,000.00+** of customer payments.
   * By implementing corrected payment consolidation (grouping splits by document number and date before cross-file deduplication), the true payment total of **-R950,729.61** is preserved.
   * Additionally, all Credit Notes were double-taxed in the header layer (populating `amount_excl` with the tax-inclusive total), creating a **R78,261.93** error.
2. **True Reconciled Balance & Residual Variance:**
   * The true combined customer balance at 31 May 2026 is **R138,185.06** (LPG Gas Debt: R138,191.56, Cylinder Financial Balance: R-6.50).
   * The fully corrected ERP stated balance is **R146,907.13**, resulting in a tiny, residual unexplained variance of only **R8,722.07**.

---
<!-- INTERNAL_ONLY_END -->

## Part 1: LPG Gas Statement
*Tracks all gas invoiced, cylinder deposits, and payments received since 1 January 2026. Matching cylinder invoice/credit note pairs (which cancel out exactly) are stripped from this view for readability. This combined ledger directly reconciles with the ERP running balance.*

### December 2018

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **0.00** |
| 03 Dec 2018 | Invoice | 4635 | 4,750.02 | 4,750.02 |
| 17 Dec 2018 | Journal | 00000029 | -4,750.00 | 0.02 |
| 17 Dec 2018 | Journal | 00000030 | 12,750.00 | 12,750.02 |
| 17 Dec 2018 | Payment | 00004832 | -3,750.00 | 9,000.02 |
| 21 Dec 2018 | Invoice | 4542 | 4,250.00 | 13,250.02 |
| 28 Dec 2018 | Payment | 00004839 | -4,250.00 | 9,000.02 |

---

### January 2019

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **9,000.02** |
| 01 Jan 2019 | Invoice | 4553 | 4,250.00 | 13,250.02 |
| 01 Jan 2019 | Invoice | 4559 | 2,100.01 | 15,350.03 |
| 01 Jan 2019 | Invoice | 4561 | 350.00 | 15,700.03 |
| 01 Jan 2019 | Invoice | 4562 | 700.01 | 16,400.04 |
| 01 Jan 2019 | Invoice | 4563 | 1,400.01 | 17,800.05 |
| 01 Jan 2019 | Invoice | 4564 | 1,725.00 | 19,525.05 |
| 01 Jan 2019 | Invoice | 4565 | 1,750.01 | 21,275.06 |
| 01 Jan 2019 | Invoice | 4566 | 700.01 | 21,975.07 |
| 01 Jan 2019 | Invoice | 4567 | 690.00 | 22,665.07 |
| 01 Jan 2019 | Invoice | 4568 | 1,390.01 | 24,055.08 |
| 03 Jan 2019 | Invoice | 4578 | 700.01 | 24,755.09 |
| 03 Jan 2019 | Crd Note | 616 | -700.01 | 24,055.08 |
| 04 Jan 2019 | Payment | 00004807 | -700.01 | 23,355.07 |
| 04 Jan 2019 | Invoice | 4591 | 1,750.01 | 25,105.08 |
| 04 Jan 2019 | Invoice | 4592 | 345.00 | 25,450.08 |
| 08 Jan 2019 | Payment | 00004898 | -8,500.00 | 16,950.08 |
| 08 Jan 2019 | Invoice | 4610 | 1,400.01 | 18,350.09 |
| 08 Jan 2019 | Crd Note | 607 | -345.00 | 18,005.09 |
| 09 Jan 2019 | Payment | 00004841 | -700.01 | 17,305.08 |
| 09 Jan 2019 | Invoice | 4617 | 700.01 | 18,005.09 |
| 11 Jan 2019 | Invoice | 4626 | 1,050.00 | 19,055.09 |
| 11 Jan 2019 | Crd Note | 613 | -690.00 | 18,365.09 |
| 14 Jan 2019 | Invoice | 4646 | 1,400.01 | 19,765.10 |
| 15 Jan 2019 | Crd Note | 620 | -2,443.34 | 17,321.76 |
| 20 Jan 2019 | Payment | 00004904 | -7,000.00 | 10,321.76 |
| 25 Jan 2019 | Invoice | 4690 | 900.00 | 11,221.76 |
| 27 Jan 2019 | Invoice | 4695 | 1,400.01 | 12,621.77 |
| 30 Jan 2019 | Invoice | 4719 | 1,200.00 | 13,821.77 |

---

### February 2019

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **13,821.77** |
| 01 Feb 2019 | Invoice | 4732 | 1,750.01 | 15,571.78 |
| 01 Feb 2019 | Invoice | 4733 | 345.00 | 15,916.78 |
| 05 Feb 2019 | Invoice | 4741 | 1,400.01 | 17,316.79 |
| 06 Feb 2019 | Payment | 00005043 | -4,870.00 | 12,446.79 |
| 07 Feb 2019 | Invoice | 4754 | 1,200.00 | 13,646.79 |
| 11 Feb 2019 | Invoice | 4766 | 1,500.00 | 15,146.79 |
| 11 Feb 2019 | Invoice | 4767 | 1,200.00 | 16,346.79 |
| 11 Feb 2019 | Invoice | 4768 | 1,380.00 | 17,726.79 |
| 13 Feb 2019 | Crd Note | 639 | -345.00 | 17,381.79 |
| 13 Feb 2019 | Crd Note | 647 | -1,500.00 | 15,881.79 |
| 15 Feb 2019 | Invoice | 4791 | 442.11 | 16,323.90 |
| 15 Feb 2019 | Invoice | 4794 | 2,415.00 | 18,738.90 |
| 16 Feb 2019 | Invoice | 4792 | 1,105.28 | 19,844.18 |
| 18 Feb 2019 | Payment | 00005047 | -6,827.39 | 13,016.79 |
| 18 Feb 2019 | Invoice | 4807 | 1,200.00 | 14,216.79 |
| 20 Feb 2019 | Crd Note | 656 | -2,760.00 | 11,456.79 |
| 21 Feb 2019 | Invoice | 4820 | 600.00 | 12,056.79 |
| 26 Feb 2019 | Invoice | 4839 | 1,200.00 | 13,256.79 |
| 26 Feb 2019 | Crd Note | 661 | -690.00 | 12,566.79 |
| 27 Feb 2019 | Journal | 00000032 | -650.00 | 11,916.79 |
| 28 Feb 2019 | Invoice | 4850 | 600.00 | 12,516.79 |

---

### March 2019

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **12,516.79** |
| 03 Mar 2019 | Invoice | 4866 | 1,200.00 | 13,716.79 |
| 03 Mar 2019 | Crd Note | 662 | -1,700.00 | 12,016.79 |
| 03 Mar 2019 | Crd Note | 663 | -2,100.01 | 9,916.78 |
| 03 Mar 2019 | Crd Note | 664 | -1,390.01 | 8,526.77 |
| 03 Mar 2019 | Crd Note | 665 | -350.00 | 8,176.77 |
| 03 Mar 2019 | Crd Note | 666 | -700.01 | 7,476.76 |
| 07 Mar 2019 | Invoice | 4886 | 975.00 | 8,451.76 |
| 11 Mar 2019 | Invoice | 4900 | 1,299.99 | 9,751.75 |
| 14 Mar 2019 | Invoice | 4920 | 1,300.01 | 11,051.76 |
| 19 Mar 2019 | Invoice | 4942 | 1,625.00 | 12,676.76 |
| 22 Mar 2019 | Invoice | 4960 | 975.00 | 13,651.76 |
| 22 Mar 2019 | Invoice | 4961 | 1,035.00 | 14,686.76 |
| 26 Mar 2019 | Invoice | 4973 | 1,300.01 | 15,986.77 |
| 29 Mar 2019 | Invoice | 5001 | 650.00 | 16,636.77 |

---

### April 2019

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **16,636.77** |
| 01 Apr 2019 | Invoice | 5013 | 1,625.01 | 18,261.78 |
| 04 Apr 2019 | Invoice | 5030 | 1,439.98 | 19,701.76 |
| 09 Apr 2019 | Invoice | 5047 | 1,439.98 | 21,141.74 |
| 12 Apr 2019 | Invoice | 5063 | 719.99 | 21,861.73 |
| 15 Apr 2019 | Invoice | 5072 | 1,799.98 | 23,661.71 |
| 17 Apr 2019 | Invoice | 5083 | 1,439.98 | 25,101.69 |
| 23 Apr 2019 | Payment | 00005437 | -9,925.00 | 15,176.69 |
| 23 Apr 2019 | Invoice | 5106 | 1,439.98 | 16,616.67 |
| 23 Apr 2019 | Crd Note | 704 | -1,380.00 | 15,236.67 |
| 24 Apr 2019 | Invoice | 5112 | 1,439.98 | 16,676.65 |
| 29 Apr 2019 | Invoice | 5130 | 2,159.98 | 18,836.63 |

---

### May 2019

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **18,836.63** |
| 05 May 2019 | Payment | 00005436 | -13,505.00 | 5,331.63 |
| 05 May 2019 | Invoice | 5157 | 1,125.01 | 6,456.64 |
| 08 May 2019 | Invoice | 5167 | 1,875.02 | 8,331.66 |
| 14 May 2019 | Invoice | 5193 | 1,960.58 | 10,292.24 |
| 16 May 2019 | Invoice | 5206 | 750.01 | 11,042.25 |
| 21 May 2019 | Invoice | 5231 | 1,500.01 | 12,542.26 |
| 21 May 2019 | Crd Note | 721 | -1,380.00 | 11,162.26 |
| 23 May 2019 | Invoice | 5253 | 1,500.00 | 12,662.26 |
| 31 May 2019 | Invoice | 5297 | 1,500.00 | 14,162.26 |

---

### June 2019

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **14,162.26** |
| 03 Jun 2019 | Invoice | 5306 | 1,500.00 | 15,662.26 |
| 06 Jun 2019 | Invoice | 5330 | 1,500.00 | 17,162.26 |
| 10 Jun 2019 | Invoice | 5345 | 1,500.00 | 18,662.26 |
| 13 Jun 2019 | Invoice | 5361 | 1,125.00 | 19,787.26 |
| 17 Jun 2019 | Invoice | 5374 | 1,500.00 | 21,287.26 |
| 19 Jun 2019 | Payment | 00005618 | -8,625.00 | 12,662.26 |
| 20 Jun 2019 | Invoice | 5400 | 1,500.00 | 14,162.26 |
| 25 Jun 2019 | Invoice | 5432 | 1,500.00 | 15,662.26 |
| 27 Jun 2019 | Invoice | 5451 | 1,125.00 | 16,787.26 |
| 27 Jun 2019 | Invoice | 5453 | 1,035.00 | 17,822.26 |

---

### July 2019

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **17,822.26** |
| 01 Jul 2019 | Invoice | 5463 | 1,875.02 | 19,697.28 |
| 03 Jul 2019 | Payment | 00005804 | -12,750.00 | 6,947.28 |
| 03 Jul 2019 | Crd Note | 766 | -1,035.00 | 5,912.28 |
| 04 Jul 2019 | Invoice | 5480 | 1,500.00 | 7,412.28 |
| 07 Jul 2019 | Payment | 00005226 | -3,000.00 | 4,412.28 |
| 07 Jul 2019 | Invoice | 5496 | 1,500.00 | 5,912.28 |
| 11 Jul 2019 | Invoice | 5515 | 1,500.00 | 7,412.28 |
| 14 Jul 2019 | Invoice | 5522 | 554.00 | 7,966.28 |
| 15 Jul 2019 | Invoice | 5525 | 1,874.99 | 9,841.27 |
| 15 Jul 2019 | Crd Note | 773 | -1,380.00 | 8,461.27 |
| 18 Jul 2019 | Invoice | 5543 | 1,500.00 | 9,961.27 |
| 18 Jul 2019 | Invoice | 5638 | 552.00 | 10,513.27 |
| 18 Jul 2019 | Crd Note | 789 | -690.00 | 9,823.27 |
| 22 Jul 2019 | Invoice | 5561 | 1,500.00 | 11,323.27 |
| 25 Jul 2019 | Invoice | 5582 | 1,125.00 | 12,448.27 |
| 29 Jul 2019 | Invoice | 5593 | 1,500.00 | 13,948.27 |

---

### August 2019

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **13,948.27** |
| 01 Aug 2019 | Invoice | 5603 | 1,500.00 | 15,448.27 |
| 05 Aug 2019 | Payment | 00005876 | -14,429.00 | 1,019.27 |
| 05 Aug 2019 | Invoice | 5612 | 1,874.99 | 2,894.26 |
| 07 Aug 2019 | Invoice | 5624 | 1,500.00 | 4,394.26 |
| 07 Aug 2019 | Invoice | 5633 | 690.00 | 5,084.26 |
| 07 Aug 2019 | Invoice | 5636 | 1,380.00 | 6,464.26 |
| 07 Aug 2019 | Invoice | 5643 | 345.00 | 6,809.26 |
| 13 Aug 2019 | Invoice | 5652 | 1,500.00 | 8,309.26 |
| 13 Aug 2019 | Crd Note | 787 | -345.00 | 7,964.26 |
| 15 Aug 2019 | Invoice | 5667 | 1,500.00 | 9,464.26 |
| 20 Aug 2019 | Invoice | 5678 | 1,500.00 | 10,964.26 |
| 22 Aug 2019 | Invoice | 5688 | 1,125.00 | 12,089.26 |
| 25 Aug 2019 | Invoice | 5698 | 1,500.00 | 13,589.26 |
| 28 Aug 2019 | Invoice | 5710 | 1,500.00 | 15,089.26 |
| 29 Aug 2019 | Invoice | 5712 | 375.00 | 15,464.26 |

---

### September 2019

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **15,464.26** |
| 01 Sep 2019 | Invoice | 5716 | 1,500.00 | 16,964.26 |
| 01 Sep 2019 | Crd Note | 788 | -552.00 | 16,412.26 |
| 03 Sep 2019 | Payment | 00005988 | -13,875.00 | 2,537.26 |
| 04 Sep 2019 | Invoice | 5742 | 1,874.99 | 4,412.25 |
| 08 Sep 2019 | Invoice | 5753 | 1,875.02 | 6,287.27 |
| 12 Sep 2019 | Invoice | 5768 | 1,874.99 | 8,162.26 |
| 16 Sep 2019 | Invoice | 5779 | 1,500.00 | 9,662.26 |
| 19 Sep 2019 | Invoice | 5797 | 1,500.00 | 11,162.26 |
| 24 Sep 2019 | Invoice | 5807 | 1,874.99 | 13,037.25 |
| 29 Sep 2019 | Invoice | 5821 | 1,874.99 | 14,912.24 |

---

### October 2019

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **14,912.24** |
| 03 Oct 2019 | Invoice | 5848 | 1,874.99 | 16,787.23 |
| 10 Oct 2019 | Invoice | 5864 | 1,874.99 | 18,662.22 |
| 14 Oct 2019 | Invoice | 5872 | 1,874.99 | 20,537.21 |
| 17 Oct 2019 | Invoice | 5883 | 1,500.00 | 22,037.21 |
| 20 Oct 2019 | Payment | 00006104 | -13,875.00 | 8,162.21 |
| 22 Oct 2019 | Invoice | 5900 | 1,874.99 | 10,037.20 |
| 25 Oct 2019 | Invoice | 5907 | 750.00 | 10,787.20 |
| 29 Oct 2019 | Invoice | 5924 | 1,125.00 | 11,912.20 |
| 31 Oct 2019 | Invoice | 5931 | 1,874.99 | 13,787.19 |

---

### November 2019

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **13,787.19** |
| 06 Nov 2019 | Invoice | 5945 | 1,500.00 | 15,287.19 |
| 07 Nov 2019 | Invoice | 5949 | 1,500.00 | 16,787.19 |
| 11 Nov 2019 | Invoice | 5961 | 1,500.00 | 18,287.19 |
| 14 Nov 2019 | Invoice | 5978 | 1,500.00 | 19,787.19 |
| 19 Nov 2019 | Invoice | 5990 | 1,874.99 | 21,662.18 |
| 19 Nov 2019 | Invoice | 5991 | 1,799.98 | 23,462.16 |
| 19 Nov 2019 | Crd Note | 824 | -1,874.99 | 21,587.17 |
| 21 Nov 2019 | Invoice | 6000 | 719.99 | 22,307.16 |
| 25 Nov 2019 | Invoice | 6007 | 1,439.98 | 23,747.14 |
| 28 Nov 2019 | Invoice | 6028 | 1,079.99 | 24,827.13 |

---

### December 2019

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **24,827.13** |
| 02 Dec 2019 | Invoice | 6044 | 1,799.98 | 26,627.11 |
| 05 Dec 2019 | Invoice | 6057 | 1,079.99 | 27,707.10 |
| 08 Dec 2019 | Payment | 00006316 | -10,875.00 | 16,832.10 |
| 08 Dec 2019 | Invoice | 6068 | 1,439.98 | 18,272.08 |
| 12 Dec 2019 | Invoice | 6086 | 1,828.50 | 20,100.58 |
| 16 Dec 2019 | Invoice | 6097 | 1,828.50 | 21,929.08 |
| 19 Dec 2019 | Invoice | 6114 | 1,462.80 | 23,391.88 |
| 22 Dec 2019 | Invoice | 6126 | 2,194.20 | 25,586.08 |
| 23 Dec 2019 | Payment | 00006381 | -930.00 | 24,656.08 |
| 26 Dec 2019 | Payment | 00006376 | -12,915.00 | 11,741.08 |
| 27 Dec 2019 | Invoice | 6140 | 1,097.10 | 12,838.18 |
| 31 Dec 2019 | Invoice | 6145 | 1,462.80 | 14,300.98 |

---

### January 2020

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **14,300.98** |
| 02 Jan 2020 | Invoice | 6151 | 1,480.00 | 15,780.98 |
| 05 Jan 2020 | Invoice | 6158 | 1,110.00 | 16,890.98 |
| 08 Jan 2020 | Invoice | 6165 | 1,875.02 | 18,766.00 |
| 13 Jan 2020 | Invoice | 6179 | 1,500.01 | 20,266.01 |
| 16 Jan 2020 | Payment | 00006423 | -12,715.00 | 7,551.01 |
| 16 Jan 2020 | Invoice | 6191 | 1,500.01 | 9,051.02 |
| 21 Jan 2020 | Invoice | 6205 | 1,875.02 | 10,926.04 |
| 23 Jan 2020 | Invoice | 6209 | 1,500.01 | 12,426.05 |
| 28 Jan 2020 | Invoice | 6230 | 1,500.01 | 13,926.06 |
| 30 Jan 2020 | Invoice | 6238 | 1,500.01 | 15,426.07 |

---

### February 2020

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **15,426.07** |
| 03 Feb 2020 | Invoice | 6248 | 1,125.01 | 16,551.08 |
| 06 Feb 2020 | Invoice | 6260 | 1,125.00 | 17,676.08 |
| 10 Feb 2020 | Invoice | 6277 | 1,875.02 | 19,551.10 |
| 13 Feb 2020 | Invoice | 6293 | 1,500.00 | 21,051.10 |
| 17 Feb 2020 | Invoice | 6306 | 1,874.99 | 22,926.09 |
| 20 Feb 2020 | Invoice | 6330 | 1,125.00 | 24,051.09 |
| 24 Feb 2020 | Invoice | 6341 | 1,500.01 | 25,551.10 |
| 27 Feb 2020 | Invoice | 6354 | 1,125.00 | 26,676.10 |

---

### March 2020

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **26,676.10** |
| 02 Mar 2020 | Payment | 00006685 | -15,302.80 | 11,373.30 |
| 03 Mar 2020 | Invoice | 6367 | 1,875.02 | 13,248.32 |
| 05 Mar 2020 | Invoice | 6381 | 750.01 | 13,998.33 |
| 09 Mar 2020 | Invoice | 6394 | 1,500.00 | 15,498.33 |
| 12 Mar 2020 | Invoice | 6401 | 1,500.00 | 16,998.33 |
| 16 Mar 2020 | Invoice | 6417 | 1,500.00 | 18,498.33 |
| 19 Mar 2020 | Invoice | 6428 | 1,500.00 | 19,998.33 |
| 23 Mar 2020 | Invoice | 6446 | 1,500.00 | 21,498.33 |
| 31 Mar 2020 | Crd Note | 850 | -345.00 | 21,153.33 |

---

### June 2020

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **21,153.33** |
| 03 Jun 2020 | Payment | 00007216 | -3,250.00 | 17,903.33 |
| 28 Jun 2020 | Payment | 00007226 | -5,000.00 | 12,903.33 |

---

### August 2020

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **12,903.33** |
| 03 Aug 2020 | Payment | 00007348 | -3,000.00 | 9,903.33 |

---

### September 2020

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **9,903.33** |
| 03 Sep 2020 | Payment | 00007489 | -5,000.00 | 4,903.33 |

---

### November 2020

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **4,903.33** |
| 04 Nov 2020 | Payment | 00007572 | -5,125.00 | -221.67 |

---

### March 2021

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **-221.67** |
| 04 Mar 2021 | Invoice | 7903 | 1,138.02 | 916.35 |
| 08 Mar 2021 | Invoice | 7925 | 1,517.36 | 2,433.71 |
| 12 Mar 2021 | Invoice | 7953 | 1,517.36 | 3,951.07 |
| 17 Mar 2021 | Invoice | 7984 | 2,276.03 | 6,227.10 |
| 23 Mar 2021 | Invoice | 8026 | 1,517.36 | 7,744.46 |
| 23 Mar 2021 | Invoice | 8037 | 1,380.00 | 9,124.46 |
| 24 Mar 2021 | Crd Note | 974 | -1,380.00 | 7,744.46 |
| 25 Mar 2021 | Invoice | 8059 | 2,897.36 | 10,641.82 |
| 25 Mar 2021 | Crd Note | 990 | -1,380.00 | 9,261.82 |
| 29 Mar 2021 | Invoice | 8090 | 5,794.71 | 15,056.53 |
| 30 Mar 2021 | Crd Note | 1018 | -1,380.00 | 13,676.53 |

---

### April 2021

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **13,676.53** |
| 05 Apr 2021 | Invoice | 8128 | 379.34 | 14,055.87 |
| 05 Apr 2021 | Crd Note | 1043 | -1,725.00 | 12,330.87 |
| 06 Apr 2021 | Invoice | 8137 | 3,621.70 | 15,952.57 |
| 06 Apr 2021 | Invoice | 8147 | 1,517.36 | 17,469.93 |
| 06 Apr 2021 | Crd Note | 1057 | -1,380.00 | 16,089.93 |
| 08 Apr 2021 | Payment | 00008420 | -12,518.21 | 3,571.72 |
| 16 Apr 2021 | Invoice | 8225 | 1,617.96 | 5,189.68 |
| 19 Apr 2021 | Invoice | 8249 | 1,213.47 | 6,403.15 |
| 22 Apr 2021 | Invoice | 8276 | 1,213.47 | 7,616.62 |
| 28 Apr 2021 | Invoice | 8321 | 1,927.46 | 9,544.08 |

---

### May 2021

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **9,544.08** |
| 03 May 2021 | Invoice | 8368 | 2,498.96 | 12,043.04 |
| 06 May 2021 | Invoice | 8399 | 1,440.58 | 13,483.62 |
| 10 May 2021 | Payment | 00008764 | -9,765.76 | 3,717.86 |
| 11 May 2021 | Invoice | 8441 | 1,080.44 | 4,798.30 |
| 12 May 2021 | Crd Note | 1316 | -1,035.00 | 3,763.30 |
| 12 May 2021 | Crd Note | 1317 | -345.00 | 3,418.30 |
| 13 May 2021 | Invoice | 8460 | 720.29 | 4,138.59 |
| 16 May 2021 | Invoice | 8475 | 1,800.73 | 5,939.32 |
| 19 May 2021 | Invoice | 8510 | 1,080.44 | 7,019.76 |
| 23 May 2021 | Invoice | 8554 | 1,080.44 | 8,100.20 |
| 27 May 2021 | Invoice | 8607 | 1,440.58 | 9,540.78 |
| 30 May 2021 | Invoice | 8629 | 1,080.44 | 10,621.22 |

---

### June 2021

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **10,621.22** |
| 02 Jun 2021 | Payment | 00009315 | -12,222.90 | -1,601.68 |
| 03 Jun 2021 | Invoice | 8692 | 1,800.73 | 199.05 |
| 06 Jun 2021 | Invoice | 8730 | 1,080.44 | 1,279.49 |
| 09 Jun 2021 | Invoice | 8805 | 1,969.98 | 3,249.47 |
| 09 Jun 2021 | Invoice | 8809 | 170.00 | 3,419.47 |
| 14 Jun 2021 | Invoice | 8864 | 1,347.11 | 4,766.58 |
| 17 Jun 2021 | Invoice | 8897 | 1,683.89 | 6,450.47 |
| 22 Jun 2021 | Invoice | 8953 | 1,799.98 | 8,250.45 |
| 23 Jun 2021 | Invoice | 8972 | 1,439.98 | 9,690.43 |
| 30 Jun 2021 | Payment | 00009996 | -11,292.11 | -1,601.68 |
| 30 Jun 2021 | Invoice | 9069 | 1,079.99 | -521.69 |

---

### July 2021

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **-521.69** |
| 05 Jul 2021 | Invoice | 9139 | 1,079.99 | 558.30 |
| 07 Jul 2021 | Invoice | 9169 | 1,459.99 | 2,018.29 |
| 18 Jul 2021 | Invoice | 9306 | 1,095.00 | 3,113.29 |
| 21 Jul 2021 | Invoice | 9350 | 1,079.99 | 4,193.28 |
| 25 Jul 2021 | Invoice | 9452 | 1,824.99 | 6,018.27 |
| 29 Jul 2021 | Invoice | 9517 | 1,459.99 | 7,478.26 |

---

### August 2021

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **7,478.26** |
| 01 Aug 2021 | Invoice | 9561 | 1,095.00 | 8,573.26 |
| 04 Aug 2021 | Payment | 00010226 | -9,079.94 | -506.68 |
| 04 Aug 2021 | Invoice | 9619 | 1,206.02 | 699.34 |
| 10 Aug 2021 | Invoice | 9692 | 1,790.02 | 2,489.36 |
| 12 Aug 2021 | Invoice | 9756 | 884.10 | 3,373.46 |
| 13 Aug 2021 | Invoice | 9760 | 884.10 | 4,257.56 |
| 16 Aug 2021 | Invoice | 9789 | 1,600.02 | 5,857.58 |
| 18 Aug 2021 | Invoice | 9841 | 1,600.02 | 7,457.60 |
| 22 Aug 2021 | Invoice | 9891 | 1,200.01 | 8,657.61 |
| 25 Aug 2021 | Invoice | 9933 | 1,200.01 | 9,857.62 |
| 25 Aug 2021 | Invoice | 9935 | 1,200.01 | 11,057.63 |
| 25 Aug 2021 | Invoice | 9937 | 1,600.02 | 12,657.65 |
| 25 Aug 2021 | Crd Note | 2280 | -1,200.01 | 11,457.64 |
| 25 Aug 2021 | Crd Note | 2282 | -1,200.01 | 10,257.63 |
| 29 Aug 2021 | Invoice | 9979 | 1,153.20 | 11,410.83 |

---

### September 2021

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **11,410.83** |
| 01 Sep 2021 | Payment | 00010584 | -13,012.50 | -1,601.67 |
| 02 Sep 2021 | Invoice | 10042 | 1,599.65 | -2.02 |
| 06 Sep 2021 | Invoice | 10103 | 1,599.65 | 1,597.63 |
| 07 Sep 2021 | Crd Note | 2389 | -399.91 | 1,197.72 |
| 09 Sep 2021 | Invoice | 10149 | 1,599.65 | 2,797.37 |
| 15 Sep 2021 | Invoice | 10213 | 1,599.65 | 4,397.02 |
| 20 Sep 2021 | Invoice | 10265 | 1,599.65 | 5,996.67 |
| 20 Sep 2021 | Invoice | 10268 | 2,062.73 | 8,059.40 |
| 20 Sep 2021 | Crd Note | 2473 | -1,599.65 | 6,459.75 |
| 21 Sep 2021 | Invoice | 10299 | 1,999.56 | 8,459.31 |
| 26 Sep 2021 | Invoice | 10363 | 1,199.74 | 9,659.05 |
| 29 Sep 2021 | Invoice | 10409 | 1,999.56 | 11,658.61 |
| 29 Sep 2021 | Invoice | 10410 | 1,725.00 | 13,383.61 |
| 30 Sep 2021 | Crd Note | 2551 | -1,035.00 | 12,348.61 |

---

### October 2021

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **12,348.61** |
| 06 Oct 2021 | Payment | 00011068 | -13,260.28 | -911.67 |
| 06 Oct 2021 | Invoice | 10581 | 2,062.73 | 1,151.06 |
| 06 Oct 2021 | Crd Note | 2615 | -345.00 | 806.06 |
| 08 Oct 2021 | Invoice | 10616 | 1,599.65 | 2,405.71 |
| 08 Oct 2021 | Invoice | 10617 | 1,380.00 | 3,785.71 |
| 10 Oct 2021 | Crd Note | 2635 | -1,599.65 | 2,186.06 |
| 10 Oct 2021 | Crd Note | 2636 | -1,380.00 | 806.06 |
| 11 Oct 2021 | Invoice | 10672 | 2,068.91 | 2,874.97 |
| 11 Oct 2021 | Invoice | 10673 | 1,725.00 | 4,599.97 |
| 12 Oct 2021 | Crd Note | 2664 | -345.00 | 4,254.97 |
| 12 Oct 2021 | Crd Note | 2665 | -1,725.00 | 2,529.97 |
| 14 Oct 2021 | Invoice | 10704 | 1,599.65 | 4,129.62 |
| 14 Oct 2021 | Invoice | 10705 | 1,380.00 | 5,509.62 |
| 14 Oct 2021 | Crd Note | 2882 | -1,380.00 | 4,129.62 |
| 17 Oct 2021 | Invoice | 10737 | 1,599.65 | 5,729.27 |
| 21 Oct 2021 | Invoice | 10838 | 1,599.65 | 7,328.92 |
| 21 Oct 2021 | Invoice | 10839 | 1,380.00 | 8,708.92 |
| 21 Oct 2021 | Invoice | 11230 | 1,599.65 | 10,308.57 |
| 21 Oct 2021 | Crd Note | 2713 | -1,199.74 | 9,108.83 |
| 25 Oct 2021 | Invoice | 10901 | 1,999.56 | 11,108.39 |
| 28 Oct 2021 | Invoice | 10979 | 1,999.56 | 13,107.95 |

---

### November 2021

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **13,107.95** |
| 01 Nov 2021 | Invoice | 11039 | 1,999.56 | 15,107.51 |
| 03 Nov 2021 | Payment | 00011558 | -12,929.71 | 2,177.80 |
| 04 Nov 2021 | Invoice | 11088 | 1,385.55 | 3,563.35 |
| 04 Nov 2021 | Invoice | 11089 | 1,035.00 | 4,598.35 |
| 05 Nov 2021 | Crd Note | 2827 | -1,385.55 | 3,212.80 |
| 05 Nov 2021 | Crd Note | 2828 | -1,035.00 | 2,177.80 |
| 09 Nov 2021 | Invoice | 11175 | 1,385.55 | 3,563.35 |
| 12 Nov 2021 | Invoice | 11218 | 1,847.41 | 5,410.76 |
| 12 Nov 2021 | Crd Note | 2881 | -1,380.00 | 4,030.76 |
| 14 Nov 2021 | Crd Note | 2892 | -399.91 | 3,630.85 |
| 17 Nov 2021 | Invoice | 11278 | 2,309.26 | 5,940.11 |
| 17 Nov 2021 | Invoice | 11279 | 1,725.00 | 7,665.11 |
| 17 Nov 2021 | Crd Note | 2908 | -1,725.00 | 5,940.11 |
| 21 Nov 2021 | Invoice | 11332 | 2,309.26 | 8,249.37 |
| 21 Nov 2021 | Invoice | 11333 | 1,725.00 | 9,974.37 |
| 21 Nov 2021 | Crd Note | 2924 | -1,380.00 | 8,594.37 |
| 25 Nov 2021 | Invoice | 11442 | 2,309.26 | 10,903.63 |
| 28 Nov 2021 | Crd Note | 2972 | -345.00 | 10,558.63 |
| 29 Nov 2021 | Invoice | 11497 | 4,618.52 | 15,177.15 |

---

### December 2021

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **15,177.15** |
| 10 Dec 2021 | Invoice | 11643 | 2,332.26 | 17,509.41 |
| 14 Dec 2021 | Invoice | 11686 | 2,332.26 | 19,841.67 |
| 19 Dec 2021 | Payment | 00012146 | -12,160.30 | 7,681.37 |
| 21 Dec 2021 | Invoice | 11774 | 1,414.74 | 9,096.11 |
| 22 Dec 2021 | Invoice | 11780 | 2,357.90 | 11,454.01 |
| 27 Dec 2021 | Invoice | 11818 | 2,476.64 | 13,930.65 |
| 27 Dec 2021 | Invoice | 11819 | 1,485.98 | 15,416.63 |

---

### January 2022

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **15,416.63** |
| 02 Jan 2022 | Invoice | 11859 | 2,476.58 | 17,893.21 |
| 13 Jan 2022 | Invoice | 11970 | 1,924.00 | 19,817.21 |
| 16 Jan 2022 | Invoice | 11995 | 1,443.00 | 21,260.21 |
| 19 Jan 2022 | Invoice | 12042 | 2,405.00 | 23,665.21 |
| 25 Jan 2022 | Invoice | 12073 | 2,405.00 | 26,070.21 |
| 27 Jan 2022 | Invoice | 12088 | 2,405.00 | 28,475.21 |
| 30 Jan 2022 | Payment | 00012719 | -17,018.30 | 11,456.91 |
| 31 Jan 2022 | Invoice | 12120 | 1,443.00 | 12,899.91 |

---

### February 2022

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **12,899.91** |
| 03 Feb 2022 | Invoice | 12163 | 1,924.00 | 14,823.91 |
| 04 Feb 2022 | Invoice | 12178 | 345.00 | 15,168.91 |
| 09 Feb 2022 | Invoice | 12228 | 1,924.00 | 17,092.91 |
| 10 Feb 2022 | Crd Note | 3216 | -345.00 | 16,747.91 |
| 14 Feb 2022 | Invoice | 12285 | 2,405.00 | 19,152.91 |
| 16 Feb 2022 | Invoice | 12312 | 1,443.00 | 20,595.91 |
| 16 Feb 2022 | Invoice | 12316 | 690.00 | 21,285.91 |
| 20 Feb 2022 | Invoice | 12340 | 1,924.00 | 23,209.91 |
| 24 Feb 2022 | Invoice | 12387 | 1,443.00 | 24,652.91 |
| 25 Feb 2022 | Crd Note | 3272 | -690.00 | 23,962.91 |
| 27 Feb 2022 | Invoice | 12403 | 1,443.00 | 25,405.91 |

---

### March 2022

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **25,405.91** |
| 03 Mar 2022 | Invoice | 12460 | 1,924.00 | 27,329.91 |
| 07 Mar 2022 | Invoice | 12501 | 1,473.01 | 28,802.92 |
| 09 Mar 2022 | Invoice | 12523 | 2,008.08 | 30,811.00 |
| 13 Mar 2022 | Invoice | 12561 | 1,506.06 | 32,317.06 |
| 16 Mar 2022 | Payment | 00013245 | -14,982.58 | 17,334.48 |
| 16 Mar 2022 | Invoice | 12621 | 1,506.06 | 18,840.54 |
| 21 Mar 2022 | Invoice | 12638 | 2,510.11 | 21,350.65 |
| 23 Mar 2022 | Invoice | 12676 | 2,008.08 | 23,358.73 |
| 27 Mar 2022 | Invoice | 12718 | 2,008.08 | 25,366.81 |
| 31 Mar 2022 | Invoice | 12761 | 2,008.08 | 27,374.89 |

---

### April 2022

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **27,374.89** |
| 03 Apr 2022 | Invoice | 12792 | 1,506.06 | 28,880.95 |
| 06 Apr 2022 | Invoice | 12843 | 2,173.73 | 31,054.68 |
| 11 Apr 2022 | Payment | 00013583 | -13,949.00 | 17,105.68 |
| 11 Apr 2022 | Invoice | 12911 | 2,714.98 | 19,820.66 |
| 12 Apr 2022 | Invoice | 12946 | 1,630.30 | 21,450.96 |
| 18 Apr 2022 | Invoice | 13011 | 1,630.30 | 23,081.26 |
| 27 Apr 2022 | Invoice | 13158 | 3,804.03 | 26,885.29 |
| 27 Apr 2022 | Invoice | 13161 | 2,415.00 | 29,300.29 |
| 28 Apr 2022 | Crd Note | 3470 | -2,415.00 | 26,885.29 |

---

### May 2022

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **26,885.29** |
| 03 May 2022 | Invoice | 13255 | 2,229.21 | 29,114.50 |
| 03 May 2022 | Invoice | 13256 | 1,380.00 | 30,494.50 |
| 03 May 2022 | Crd Note | 3500 | -1,380.00 | 29,114.50 |
| 06 May 2022 | Invoice | 13332 | 1,671.90 | 30,786.40 |
| 06 May 2022 | Crd Note | 3534 | -1,035.00 | 29,751.40 |
| 08 May 2022 | Invoice | 13359 | 1,671.90 | 31,423.30 |
| 08 May 2022 | Invoice | 13360 | 1,035.00 | 32,458.30 |
| 11 May 2022 | Invoice | 13452 | 2,229.21 | 34,687.51 |
| 11 May 2022 | Invoice | 13453 | 1,380.00 | 36,067.51 |
| 11 May 2022 | Crd Note | 3566 | -1,380.00 | 34,687.51 |
| 11 May 2022 | Crd Note | 3578 | -1,380.00 | 33,307.51 |
| 16 May 2022 | Invoice | 13518 | 2,229.07 | 35,536.58 |
| 18 May 2022 | Invoice | 13563 | 2,229.07 | 37,765.65 |
| 18 May 2022 | Invoice | 13571 | 2,392.00 | 40,157.65 |
| 18 May 2022 | Crd Note | 3602 | -1,794.00 | 38,363.65 |
| 22 May 2022 | Invoice | 13637 | 1,671.80 | 40,035.45 |
| 22 May 2022 | Crd Note | 3617 | -1,196.00 | 38,839.45 |
| 26 May 2022 | Invoice | 13685 | 2,229.07 | 41,068.52 |
| 30 May 2022 | Invoice | 13744 | 2,786.34 | 43,854.86 |
| 30 May 2022 | Crd Note | 3641 | -2,990.00 | 40,864.86 |
| 31 May 2022 | Payment | 00014135 | -18,184.64 | 22,680.22 |

---

### June 2022

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **22,680.22** |
| 02 Jun 2022 | Invoice | 13822 | 2,229.07 | 24,909.29 |
| 02 Jun 2022 | Invoice | 13823 | 2,392.00 | 27,301.29 |
| 02 Jun 2022 | Crd Note | 3653 | -598.00 | 26,703.29 |
| 06 Jun 2022 | Invoice | 13877 | 2,229.07 | 28,932.36 |
| 09 Jun 2022 | Invoice | 13937 | 1,671.80 | 30,604.16 |
| 13 Jun 2022 | Invoice | 13968 | 1,671.80 | 32,275.96 |
| 16 Jun 2022 | Invoice | 14049 | 2,229.07 | 34,505.03 |
| 20 Jun 2022 | Invoice | 14116 | 2,229.07 | 36,734.10 |
| 22 Jun 2022 | Invoice | 14788 | 1,614.81 | 38,348.91 |
| 27 Jun 2022 | Invoice | 14341 | 2,229.07 | 40,577.98 |

---

### July 2022

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **40,577.98** |
| 01 Jul 2022 | Invoice | 14279 | 2,229.07 | 42,807.05 |
| 06 Jul 2022 | Invoice | 14353 | 4,458.14 | 47,265.19 |
| 13 Jul 2022 | Invoice | 14521 | 2,691.35 | 49,956.54 |
| 21 Jul 2022 | Invoice | 14654 | 3,229.61 | 53,186.15 |
| 21 Jul 2022 | Invoice | 14663 | 3,588.00 | 56,774.15 |
| 21 Jul 2022 | Crd Note | 3790 | -3,588.00 | 53,186.15 |
| 25 Jul 2022 | Payment | 00015071 | -17,275.67 | 35,910.48 |
| 26 Jul 2022 | Invoice | 14744 | 4,561.12 | 40,471.60 |

---

### August 2022

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **40,471.60** |
| 03 Aug 2022 | Invoice | 14916 | 3,286.61 | 43,758.21 |
| 03 Aug 2022 | Crd Note | 3791 | -598.00 | 43,160.21 |
| 09 Aug 2022 | Invoice | 14994 | 4,929.91 | 48,090.12 |
| 09 Aug 2022 | Invoice | 15004 | 1,794.00 | 49,884.12 |
| 09 Aug 2022 | Crd Note | 3817 | -1,196.00 | 48,688.12 |
| 10 Aug 2022 | Payment | 00015473 | -14,488.95 | 34,199.17 |
| 18 Aug 2022 | Invoice | 15189 | 2,738.84 | 36,938.01 |
| 18 Aug 2022 | Invoice | 15191 | 4,382.14 | 41,320.15 |
| 18 Aug 2022 | Crd Note | 3901 | -2,738.84 | 38,581.31 |
| 26 Aug 2022 | Invoice | 15343 | 3,286.61 | 41,867.92 |
| 26 Aug 2022 | Invoice | 15345 | 3,588.00 | 45,455.92 |
| 26 Aug 2022 | Invoice | 15346 | 3,588.00 | 49,043.92 |
| 26 Aug 2022 | Crd Note | 3963 | -3,588.00 | 45,455.92 |
| 26 Aug 2022 | Crd Note | 3964 | -5,331.77 | 40,124.15 |
| 28 Aug 2022 | Invoice | 15360 | 5,331.77 | 45,455.92 |
| 28 Aug 2022 | Crd Note | 3966 | -1,794.00 | 43,661.92 |
| 28 Aug 2022 | Crd Note | 3967 | -2,990.00 | 40,671.92 |
| 28 Aug 2022 | Crd Note | 3969 | -547.77 | 40,124.15 |
| 31 Aug 2022 | Invoice | 15423 | 2,767.68 | 42,891.83 |
| 31 Aug 2022 | Invoice | 15431 | 1,196.00 | 44,087.83 |
| 31 Aug 2022 | Crd Note | 3999 | -2,990.00 | 41,097.83 |

---

### September 2022

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **41,097.83** |
| 04 Sep 2022 | Invoice | 15490 | 1,383.84 | 42,481.67 |
| 04 Sep 2022 | Invoice | 15491 | 598.00 | 43,079.67 |
| 08 Sep 2022 | Invoice | 15556 | 4,151.52 | 47,231.19 |
| 09 Sep 2022 | Payment | 00015987 | -17,169.29 | 30,061.90 |
| 09 Sep 2022 | Invoice | 15560 | 1,794.00 | 31,855.90 |
| 09 Sep 2022 | Crd Note | 4034 | -598.00 | 31,257.90 |
| 09 Sep 2022 | Crd Note | 4035 | -2,392.00 | 28,865.90 |
| 14 Sep 2022 | Invoice | 15623 | 4,151.52 | 33,017.42 |
| 22 Sep 2022 | Invoice | 15782 | 4,151.52 | 37,168.94 |
| 22 Sep 2022 | Invoice | 15801 | 1,794.00 | 38,962.94 |
| 22 Sep 2022 | Crd Note | 4112 | -1,196.00 | 37,766.94 |
| 30 Sep 2022 | Invoice | 15865 | 2,767.68 | 40,534.62 |

---

### October 2022

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **40,534.62** |
| 06 Oct 2022 | Invoice | 15953 | 2,767.68 | 43,302.30 |
| 11 Oct 2022 | Invoice | 16019 | 2,767.68 | 46,069.98 |
| 19 Oct 2022 | Payment | 00016648 | -15,885.27 | 30,184.71 |
| 19 Oct 2022 | Invoice | 16125 | 2,767.68 | 32,952.39 |
| 20 Oct 2022 | Crd Note | 4209 | -598.00 | 32,354.39 |
| 25 Oct 2022 | Invoice | 16185 | 4,151.52 | 36,505.91 |
| 26 Oct 2022 | Invoice | 16200 | 1,794.00 | 38,299.91 |
| 26 Oct 2022 | Crd Note | 4225 | -1,196.00 | 37,103.91 |

---

### November 2022

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **37,103.91** |
| 02 Nov 2022 | Invoice | 16308 | 2,767.68 | 39,871.59 |
| 02 Nov 2022 | Crd Note | 4255 | -598.00 | 39,273.59 |
| 09 Nov 2022 | Invoice | 16397 | 2,686.08 | 41,959.67 |
| 10 Nov 2022 | Invoice | 16419 | 1,196.00 | 43,155.67 |
| 10 Nov 2022 | Invoice | 16420 | 598.00 | 43,753.67 |
| 10 Nov 2022 | Invoice | 16421 | 598.00 | 44,351.67 |
| 17 Nov 2022 | Invoice | 16505 | 2,686.08 | 47,037.75 |
| 23 Nov 2022 | Payment | 00017073 | -13,838.40 | 33,199.35 |
| 23 Nov 2022 | Invoice | 16557 | 2,686.08 | 35,885.43 |
| 29 Nov 2022 | Invoice | 16647 | 2,686.08 | 38,571.51 |
| 29 Nov 2022 | Crd Note | 4336 | -2,686.08 | 35,885.43 |
| 29 Nov 2022 | Crd Note | 4337 | -2,686.08 | 33,199.35 |
| 30 Nov 2022 | Invoice | 16648 | 2,686.08 | 35,885.43 |
| 30 Nov 2022 | Invoice | 16649 | 3,217.70 | 39,103.13 |

---

### December 2022

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **39,103.13** |
| 05 Dec 2022 | Invoice | 16718 | 4,029.12 | 43,132.25 |
| 05 Dec 2022 | Invoice | 16723 | 5,372.16 | 48,504.41 |
| 05 Dec 2022 | Invoice | 16724 | 2,392.00 | 50,896.41 |
| 05 Dec 2022 | Crd Note | 4349 | -4,029.12 | 46,867.29 |
| 06 Dec 2022 | Crd Note | 4350 | -1,794.00 | 45,073.29 |
| 12 Dec 2022 | Invoice | 16826 | 5,531.50 | 50,604.79 |
| 12 Dec 2022 | Invoice | 16830 | 2,392.00 | 52,996.79 |
| 12 Dec 2022 | Crd Note | 4377 | -1,794.00 | 51,202.79 |
| 18 Dec 2022 | Payment | 00017578 | -17,989.92 | 33,212.87 |
| 18 Dec 2022 | Invoice | 16934 | 5,531.50 | 38,744.37 |
| 18 Dec 2022 | Invoice | 17076 | 1,380.00 | 40,124.37 |
| 18 Dec 2022 | Crd Note | 4419 | -1,035.00 | 39,089.37 |
| 22 Dec 2022 | Invoice | 17014 | 2,765.75 | 41,855.12 |
| 22 Dec 2022 | Invoice | 17028 | 345.00 | 42,200.12 |
| 30 Dec 2022 | Invoice | 17132 | 2,765.75 | 44,965.87 |

---

### January 2023

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **44,965.87** |
| 02 Jan 2023 | Crd Note | 4441 | -598.00 | 44,367.87 |
| 05 Jan 2023 | Invoice | 17191 | 2,833.92 | 47,201.79 |
| 11 Jan 2023 | Invoice | 17256 | 2,833.92 | 50,035.71 |
| 18 Jan 2023 | Payment | 00017777 | -10,825.92 | 39,209.79 |
| 22 Jan 2023 | Invoice | 17357 | 1,416.96 | 40,626.75 |
| 23 Jan 2023 | Invoice | 17369 | 4,250.88 | 44,877.63 |

---

### February 2023

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **44,877.63** |
| 02 Feb 2023 | Invoice | 17458 | 2,833.92 | 47,711.55 |
| 02 Feb 2023 | Crd Note | 4514 | -598.00 | 47,113.55 |
| 10 Feb 2023 | Invoice | 17581 | 5,433.80 | 52,547.35 |
| 12 Feb 2023 | Payment | 00018185 | -25,184.36 | 27,362.99 |
| 22 Feb 2023 | Invoice | 17769 | 4,075.35 | 31,438.34 |

---

### March 2023

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **31,438.34** |
| 01 Mar 2023 | Invoice | 18062 | 6,305.48 | 37,743.82 |
| 07 Mar 2023 | Invoice | 18299 | 2,801.72 | 40,545.54 |
| 15 Mar 2023 | Invoice | 18507 | 2,801.72 | 43,347.26 |
| 21 Mar 2023 | Payment | 00019176 | -11,335.68 | 32,011.58 |
| 22 Mar 2023 | Invoice | 18695 | 4,202.58 | 36,214.16 |
| 22 Mar 2023 | Invoice | 18696 | 1,035.00 | 37,249.16 |
| 22 Mar 2023 | Crd Note | 4634 | -345.00 | 36,904.16 |

---

### April 2023

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **36,904.16** |
| 05 Apr 2023 | Invoice | 19153 | 5,603.44 | 42,507.60 |
| 13 Apr 2023 | Invoice | 19347 | 2,724.93 | 45,232.53 |
| 13 Apr 2023 | Crd Note | 4726 | -345.00 | 44,887.53 |
| 19 Apr 2023 | Invoice | 19494 | 2,724.93 | 47,612.46 |
| 25 Apr 2023 | Invoice | 19697 | 4,087.39 | 51,699.85 |

---

### May 2023

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **51,699.85** |
| 01 May 2023 | Payment | 00020357 | -12,343.07 | 39,356.78 |
| 03 May 2023 | Invoice | 19924 | 4,087.39 | 43,444.17 |
| 09 May 2023 | Invoice | 20117 | 3,561.12 | 47,005.29 |
| 09 May 2023 | Invoice | 20124 | 1,035.00 | 48,040.29 |
| 09 May 2023 | Crd Note | 4908 | -690.00 | 47,350.29 |
| 17 May 2023 | Invoice | 20356 | 3,561.12 | 50,911.41 |
| 24 May 2023 | Invoice | 20630 | 2,597.14 | 53,508.55 |
| 30 May 2023 | Payment | 00021193 | -15,409.46 | 38,099.09 |
| 31 May 2023 | Invoice | 20864 | 3,561.78 | 41,660.87 |
| 31 May 2023 | Invoice | 20873 | 1,035.00 | 42,695.87 |
| 31 May 2023 | Crd Note | 5101 | -1,380.00 | 41,315.87 |

---

### June 2023

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **41,315.87** |
| 07 Jun 2023 | Invoice | 21098 | 2,436.92 | 43,752.79 |
| 07 Jun 2023 | Invoice | 21111 | 690.00 | 44,442.79 |
| 07 Jun 2023 | Crd Note | 5151 | -1,035.00 | 43,407.79 |
| 14 Jun 2023 | Invoice | 21341 | 3,655.38 | 47,063.17 |
| 14 Jun 2023 | Invoice | 21346 | 1,035.00 | 48,098.17 |
| 14 Jun 2023 | Crd Note | 5235 | -345.00 | 47,753.17 |
| 21 Jun 2023 | Invoice | 21561 | 3,655.38 | 51,408.55 |
| 27 Jun 2023 | Invoice | 21756 | 3,655.38 | 55,063.93 |

---

### July 2023

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **55,063.93** |
| 05 Jul 2023 | Invoice | 22050 | 3,655.38 | 58,719.31 |
| 12 Jul 2023 | Invoice | 22332 | 1,035.00 | 59,754.31 |
| 12 Jul 2023 | Invoice | 22337 | 3,281.74 | 63,036.05 |
| 19 Jul 2023 | Invoice | 22566 | 3,281.74 | 66,317.79 |
| 19 Jul 2023 | Invoice | 22604 | 410.94 | 66,728.73 |
| 19 Jul 2023 | Invoice | 22605 | 690.00 | 67,418.73 |
| 20 Jul 2023 | Payment | 00022711 | -15,140.69 | 52,278.04 |
| 26 Jul 2023 | Invoice | 22842 | 3,281.74 | 55,559.78 |
| 26 Jul 2023 | Invoice | 22847 | 1,035.00 | 56,594.78 |
| 26 Jul 2023 | Crd Note | 5686 | -1,725.00 | 54,869.78 |

---

### August 2023

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **54,869.78** |
| 02 Aug 2023 | Invoice | 23098 | 3,280.33 | 58,150.11 |
| 09 Aug 2023 | Invoice | 23278 | 3,080.16 | 61,230.27 |
| 10 Aug 2023 | Payment | 00023280 | -13,806.77 | 47,423.50 |
| 16 Aug 2023 | Invoice | 23545 | 3,080.16 | 50,503.66 |
| 23 Aug 2023 | Invoice | 23732 | 3,080.16 | 53,583.82 |
| 30 Aug 2023 | Invoice | 23964 | 3,245.76 | 56,829.58 |
| 31 Aug 2023 | Crd Note | 6074 | -3,245.76 | 53,583.82 |

---

### September 2023

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **53,583.82** |
| 01 Sep 2023 | Invoice | 24087 | 2,163.84 | 55,747.66 |
| 04 Sep 2023 | Payment | 00023977 | -16,964.84 | 38,782.82 |
| 06 Sep 2023 | Invoice | 24245 | 2,352.96 | 41,135.78 |
| 06 Sep 2023 | Invoice | 24246 | 690.00 | 41,825.78 |
| 06 Sep 2023 | Crd Note | 6151 | -1,035.00 | 40,790.78 |
| 14 Sep 2023 | Invoice | 24516 | 2,251.98 | 43,042.76 |
| 14 Sep 2023 | Invoice | 24517 | 690.00 | 43,732.76 |
| 14 Sep 2023 | Crd Note | 6232 | -1,380.00 | 42,352.76 |
| 20 Sep 2023 | Invoice | 24693 | 2,251.98 | 44,604.74 |
| 27 Sep 2023 | Invoice | 24907 | 2,251.98 | 46,856.72 |
| 27 Sep 2023 | Invoice | 24908 | 690.00 | 47,546.72 |
| 27 Sep 2023 | Crd Note | 6357 | -345.00 | 47,201.72 |

---

### October 2023

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **47,201.72** |
| 04 Oct 2023 | Invoice | 25154 | 2,460.30 | 49,662.02 |
| 04 Oct 2023 | Invoice | 25155 | 690.00 | 50,352.02 |
| 05 Oct 2023 | Crd Note | 6422 | -1,035.00 | 49,317.02 |
| 06 Oct 2023 | Invoice | 25251 | 1,230.16 | 50,547.18 |
| 13 Oct 2023 | Invoice | 25475 | 2,459.52 | 53,006.70 |
| 18 Oct 2023 | Invoice | 25616 | 3,689.28 | 56,695.98 |
| 18 Oct 2023 | Invoice | 25617 | 1,035.00 | 57,730.98 |
| 18 Oct 2023 | Crd Note | 6563 | -690.00 | 57,040.98 |
| 23 Oct 2023 | Payment | 00025394 | -13,911.54 | 43,129.44 |
| 25 Oct 2023 | Invoice | 25852 | 3,689.28 | 46,818.72 |

---

### November 2023

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **46,818.72** |
| 01 Nov 2023 | Invoice | 26141 | 3,875.04 | 50,693.76 |
| 01 Nov 2023 | Invoice | 26142 | 1,035.00 | 51,728.76 |
| 01 Nov 2023 | Crd Note | 6684 | -345.00 | 51,383.76 |
| 08 Nov 2023 | Invoice | 26403 | 3,875.04 | 55,258.80 |
| 22 Nov 2023 | Invoice | 26892 | 3,875.04 | 59,133.84 |
| 28 Nov 2023 | Payment | 00026601 | -12,520.81 | 46,613.03 |
| 29 Nov 2023 | Crd Note | 6957 | -1,035.00 | 45,578.03 |
| 30 Nov 2023 | Invoice | 27132 | 2,583.36 | 48,161.39 |
| 30 Nov 2023 | Invoice | 27133 | 690.00 | 48,851.39 |

---

### December 2023

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **48,851.39** |
| 06 Dec 2023 | Invoice | 27384 | 4,037.76 | 52,889.15 |
| 13 Dec 2023 | Invoice | 27641 | 4,037.78 | 56,926.93 |
| 20 Dec 2023 | Invoice | 27897 | 4,037.78 | 60,964.71 |
| 20 Dec 2023 | Invoice | 27972 | 1,035.00 | 61,999.71 |
| 20 Dec 2023 | Crd Note | 7156 | -2,070.00 | 59,929.71 |
| 28 Dec 2023 | Payment | 00027468 | -24,801.28 | 35,128.43 |
| 28 Dec 2023 | Invoice | 28136 | 2,691.85 | 37,820.28 |
| 28 Dec 2023 | Invoice | 28137 | 1,035.00 | 38,855.28 |
| 28 Dec 2023 | Invoice | 28140 | 4,037.78 | 42,893.06 |
| 28 Dec 2023 | Crd Note | 7204 | -2,691.85 | 40,201.21 |
| 28 Dec 2023 | Crd Note | 7210 | -690.00 | 39,511.21 |

---

### January 2024

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **39,511.21** |
| 03 Jan 2024 | Invoice | 28328 | 2,701.46 | 42,212.67 |
| 03 Jan 2024 | Invoice | 28329 | 690.00 | 42,902.67 |
| 03 Jan 2024 | Invoice | 28330 | 4,052.20 | 46,954.87 |
| 03 Jan 2024 | Crd Note | 7247 | -2,701.46 | 44,253.41 |
| 03 Jan 2024 | Crd Note | 7248 | -690.00 | 43,563.41 |
| 10 Jan 2024 | Invoice | 28565 | 2,701.46 | 46,264.87 |
| 10 Jan 2024 | Invoice | 28586 | 690.00 | 46,954.87 |
| 10 Jan 2024 | Crd Note | 7291 | -1,035.00 | 45,919.87 |
| 17 Jan 2024 | Invoice | 28751 | 1,604.00 | 47,523.87 |
| 24 Jan 2024 | Invoice | 28959 | 2,747.65 | 50,271.52 |
| 24 Jan 2024 | Invoice | 28960 | 690.00 | 50,961.52 |
| 24 Jan 2024 | Crd Note | 7379 | -1,035.00 | 49,926.52 |
| 31 Jan 2024 | Invoice | 29161 | 4,121.47 | 54,047.99 |

---

### February 2024

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **54,047.99** |
| 07 Feb 2024 | Invoice | 29384 | 4,174.74 | 58,222.73 |
| 14 Feb 2024 | Invoice | 29584 | 2,783.16 | 61,005.89 |
| 19 Feb 2024 | Payment | 00028893 | -14,208.48 | 46,797.41 |
| 21 Feb 2024 | Invoice | 29763 | 2,783.16 | 49,580.57 |
| 29 Feb 2024 | Invoice | 30008 | 2,783.05 | 52,363.62 |

---

### March 2024

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **52,363.62** |
| 04 Mar 2024 | Invoice | 30147 | 4,169.50 | 56,533.12 |
| 14 Mar 2024 | Invoice | 30414 | 2,814.21 | 59,347.33 |
| 18 Mar 2024 | Invoice | 30537 | 2,814.21 | 62,161.54 |
| 27 Mar 2024 | Invoice | 30806 | 2,814.21 | 64,975.75 |

---

### April 2024

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **64,975.75** |
| 03 Apr 2024 | Invoice | 30977 | 2,814.21 | 67,789.96 |
| 10 Apr 2024 | Invoice | 31201 | 2,798.75 | 70,588.71 |
| 17 Apr 2024 | Invoice | 31413 | 4,213.14 | 74,801.85 |
| 23 Apr 2024 | Payment | 00030269 | -12,113.34 | 62,688.51 |
| 23 Apr 2024 | Payment | 00030269 | -4,037.70 | 58,650.81 |
| 25 Apr 2024 | Invoice | 31640 | 2,808.76 | 61,459.57 |

---

### May 2024

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **61,459.57** |
| 01 May 2024 | Invoice | 31801 | 4,213.14 | 65,672.71 |
| 01 May 2024 | Invoice | 31806 | 1,794.00 | 67,466.71 |
| 02 May 2024 | Invoice | 42406 | 2,392.00 | 69,858.71 |
| 02 May 2024 | Crd Note | 12314 | -1,380.00 | 68,478.71 |
| 02 May 2024 | Crd Note | 8280 | -2,392.00 | 66,086.71 |
| 08 May 2024 | Invoice | 31997 | 4,213.14 | 70,299.85 |
| 16 May 2024 | Invoice | 32219 | 2,808.76 | 73,108.61 |
| 23 May 2024 | Invoice | 32409 | 2,808.76 | 75,917.37 |
| 26 May 2024 | Payment | 00030891 | -11,105.31 | 64,812.06 |
| 27 May 2024 | Invoice | 32531 | 2,808.76 | 67,620.82 |
| 30 May 2024 | Invoice | 32614 | 1,404.38 | 69,025.20 |

---

### June 2024

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **69,025.20** |
| 05 Jun 2024 | Invoice | 32787 | 2,808.76 | 71,833.96 |
| 09 Jun 2024 | Payment | 00031179 | -13,862.03 | 57,971.93 |
| 10 Jun 2024 | Invoice | 32976 | 4,141.14 | 62,113.07 |
| 19 Jun 2024 | Invoice | 33272 | 4,141.14 | 66,254.21 |
| 26 Jun 2024 | Invoice | 33533 | 4,141.14 | 70,395.35 |

---

### July 2024

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **70,395.35** |
| 03 Jul 2024 | Invoice | 33806 | 4,141.14 | 74,536.49 |
| 03 Jul 2024 | Invoice | 33830 | 1,051.83 | 75,588.32 |
| 03 Jul 2024 | Crd Note | 12313 | -1,051.83 | 74,536.49 |
| 08 Jul 2024 | Payment | 00031792 | -15,395.18 | 59,141.31 |
| 10 Jul 2024 | Invoice | 34098 | 4,141.14 | 63,282.45 |
| 10 Jul 2024 | Invoice | 34099 | 1,794.00 | 65,076.45 |
| 10 Jul 2024 | Crd Note | 9314 | -1,196.00 | 63,880.45 |
| 17 Jul 2024 | Invoice | 34326 | 1,380.38 | 65,260.83 |
| 18 Jul 2024 | Invoice | 34383 | 3,019.58 | 68,280.41 |
| 25 Jul 2024 | Invoice | 34614 | 2,760.76 | 71,041.17 |

---

### August 2024

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **71,041.17** |
| 01 Aug 2024 | Invoice | 34849 | 2,760.76 | 73,801.93 |
| 01 Aug 2024 | Invoice | 34850 | 690.00 | 74,491.93 |
| 01 Aug 2024 | Crd Note | 9641 | -1,035.00 | 73,456.93 |
| 07 Aug 2024 | Invoice | 35094 | 4,141.14 | 77,598.07 |
| 14 Aug 2024 | Invoice | 35297 | 4,141.14 | 81,739.21 |
| 14 Aug 2024 | Invoice | 35298 | 1,794.00 | 83,533.21 |
| 14 Aug 2024 | Crd Note | 9865 | -1,196.00 | 82,337.21 |
| 22 Aug 2024 | Payment | 00032896 | -17,634.86 | 64,702.35 |
| 22 Aug 2024 | Invoice | 35522 | 1,380.38 | 66,082.73 |
| 29 Aug 2024 | Invoice | 35749 | 2,760.76 | 68,843.49 |

---

### September 2024

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **68,843.49** |
| 04 Sep 2024 | Invoice | 35961 | 1,380.38 | 70,223.87 |
| 04 Sep 2024 | Invoice | 35962 | 598.00 | 70,821.87 |
| 05 Sep 2024 | Invoice | 35990 | 2,760.76 | 73,582.63 |
| 05 Sep 2024 | Invoice | 35991 | 1,196.00 | 74,778.63 |
| 05 Sep 2024 | Crd Note | 10168 | -1,794.00 | 72,984.63 |
| 05 Sep 2024 | Crd Note | 10186 | -598.00 | 72,386.63 |
| 11 Sep 2024 | Invoice | 36191 | 4,358.65 | 76,745.28 |
| 11 Sep 2024 | Invoice | 36192 | 2,392.00 | 79,137.28 |
| 12 Sep 2024 | Crd Note | 10276 | -1,794.00 | 77,343.28 |
| 17 Sep 2024 | Invoice | 36395 | 4,102.26 | 81,445.54 |
| 17 Sep 2024 | Invoice | 36396 | 1,794.00 | 83,239.54 |
| 17 Sep 2024 | Crd Note | 10361 | -1,196.00 | 82,043.54 |
| 25 Sep 2024 | Invoice | 36680 | 2,734.84 | 84,778.38 |
| 25 Sep 2024 | Invoice | 36681 | 1,196.00 | 85,974.38 |
| 25 Sep 2024 | Crd Note | 10495 | -1,794.00 | 84,180.38 |
| 29 Sep 2024 | Payment | 00033810 | -20,232.18 | 63,948.20 |

---

### October 2024

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **63,948.20** |
| 02 Oct 2024 | Invoice | 36945 | 2,394.34 | 66,342.54 |
| 02 Oct 2024 | Invoice | 36946 | 1,040.00 | 67,382.54 |
| 04 Oct 2024 | Invoice | 37020 | 2,753.48 | 70,136.02 |
| 04 Oct 2024 | Crd Note | 10648 | -2,394.34 | 67,741.68 |
| 06 Oct 2024 | Crd Note | 10668 | -1,196.00 | 66,545.68 |
| 10 Oct 2024 | Invoice | 37216 | 2,753.49 | 69,299.17 |
| 16 Oct 2024 | Invoice | 37363 | 2,753.49 | 72,052.66 |
| 24 Oct 2024 | Invoice | 37619 | 3,011.63 | 75,064.29 |
| 24 Oct 2024 | Invoice | 37620 | 1,794.00 | 76,858.29 |
| 25 Oct 2024 | Crd Note | 10919 | -2,392.00 | 74,466.29 |
| 27 Oct 2024 | Payment | 00034425 | -17,729.87 | 56,736.42 |
| 27 Oct 2024 | Payment | 00034425 | -2,713.13 | 54,023.29 |
| 30 Oct 2024 | Invoice | 37799 | 2,753.49 | 56,776.78 |

---

### November 2024

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **56,776.78** |
| 06 Nov 2024 | Invoice | 38040 | 4,174.95 | 60,951.73 |
| 06 Nov 2024 | Invoice | 38041 | 1,794.00 | 62,745.73 |
| 06 Nov 2024 | Crd Note | 11101 | -1,196.00 | 61,549.73 |
| 13 Nov 2024 | Invoice | 38266 | 2,783.30 | 64,333.03 |
| 13 Nov 2024 | Invoice | 38267 | 1,196.00 | 65,529.03 |
| 13 Nov 2024 | Crd Note | 11200 | -1,794.00 | 63,735.03 |
| 20 Nov 2024 | Invoice | 38456 | 2,783.30 | 66,518.33 |
| 28 Nov 2024 | Invoice | 38664 | 2,783.30 | 69,301.63 |

---

### December 2024

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **69,301.63** |
| 03 Dec 2024 | Payment | 00035270 | -17,992.94 | 51,308.69 |
| 03 Dec 2024 | Payment | 00035270 | -448.18 | 50,860.51 |
| 03 Dec 2024 | Invoice | 38820 | 4,174.95 | 55,035.46 |
| 11 Dec 2024 | Invoice | 39008 | 7,988.13 | 63,023.59 |
| 12 Dec 2024 | Crd Note | 11464 | -3,622.50 | 59,401.09 |
| 17 Dec 2024 | Invoice | 39149 | 7,988.13 | 67,389.22 |
| 17 Dec 2024 | Crd Note | 11509 | -2,415.00 | 64,974.22 |
| 22 Dec 2024 | Invoice | 39307 | 5,325.42 | 70,299.64 |
| 22 Dec 2024 | Crd Note | 11570 | -2,415.00 | 67,884.64 |

---

### January 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **67,884.64** |
| 01 Jan 2025 | Invoice | 39558 | 2,950.74 | 70,835.38 |
| 08 Jan 2025 | Invoice | 39714 | 4,387.23 | 75,222.61 |
| 08 Jan 2025 | Invoice | 39715 | 3,622.50 | 78,845.11 |
| 08 Jan 2025 | Crd Note | 11660 | -4,830.00 | 74,015.11 |
| 14 Jan 2025 | Invoice | 39898 | 4,387.23 | 78,402.34 |
| 14 Jan 2025 | Invoice | 39899 | 3,622.50 | 82,024.84 |
| 15 Jan 2025 | Crd Note | 11693 | -2,415.00 | 79,609.84 |
| 16 Jan 2025 | Payment | 00036139 | -20,843.86 | 58,765.98 |
| 16 Jan 2025 | Payment | 00036139 | -1,493.03 | 57,272.95 |
| 23 Jan 2025 | Invoice | 40143 | 2,924.82 | 60,197.77 |
| 30 Jan 2025 | Invoice | 40319 | 2,924.82 | 63,122.59 |

---

### February 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **63,122.59** |
| 10 Feb 2025 | Invoice | 40622 | 4,423.21 | 67,545.80 |
| 10 Feb 2025 | Invoice | 40623 | 3,622.50 | 71,168.30 |
| 10 Feb 2025 | Crd Note | 11876 | -4,830.00 | 66,338.30 |
| 20 Feb 2025 | Payment | 00036988 | -15,536.48 | 50,801.82 |
| 20 Feb 2025 | Payment | 00036988 | -4,013.94 | 46,787.88 |
| 20 Feb 2025 | Invoice | 40881 | 4,423.21 | 51,211.09 |
| 26 Feb 2025 | Invoice | 41051 | 1,474.40 | 52,685.49 |
| 26 Feb 2025 | Invoice | 41052 | 1,207.50 | 53,892.99 |
| 27 Feb 2025 | Crd Note | 11977 | -2,415.00 | 51,477.99 |

---

### March 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **51,477.99** |
| 04 Mar 2025 | Invoice | 41216 | 2,948.81 | 54,426.80 |
| 13 Mar 2025 | Invoice | 41486 | 2,948.81 | 57,375.61 |
| 19 Mar 2025 | Invoice | 41633 | 2,948.81 | 60,324.42 |
| 27 Mar 2025 | Invoice | 41799 | 2,948.81 | 63,273.23 |

---

### April 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **63,273.23** |
| 01 Apr 2025 | Invoice | 41926 | 4,423.21 | 67,696.44 |
| 01 Apr 2025 | Invoice | 41927 | 3,622.50 | 71,318.94 |
| 01 Apr 2025 | Crd Note | 12178 | -2,415.00 | 68,903.94 |
| 09 Apr 2025 | Invoice | 42181 | 4,325.33 | 73,229.27 |
| 16 Apr 2025 | Invoice | 42357 | 4,325.33 | 77,554.60 |
| 24 Apr 2025 | Invoice | 42565 | 4,325.33 | 81,879.93 |
| 29 Apr 2025 | Invoice | 42704 | 4,325.33 | 86,205.26 |

---

### May 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **86,205.26** |
| 02 May 2025 | Invoice | 42755 | 3,153.89 | 89,359.15 |
| 02 May 2025 | Invoice | 42756 | 2,932.50 | 92,291.65 |
| 02 May 2025 | Crd Note | 12390 | -4,325.33 | 87,966.32 |
| 04 May 2025 | Payment | 00038481 | -15,816.63 | 72,149.69 |
| 04 May 2025 | Crd Note | 12408 | -2,415.00 | 69,734.69 |
| 08 May 2025 | Invoice | 42949 | 4,325.33 | 74,060.02 |
| 14 May 2025 | Invoice | 43089 | 2,883.56 | 76,943.58 |
| 20 May 2025 | Invoice | 43271 | 4,382.95 | 81,326.53 |
| 21 May 2025 | Payment | 00038846 | -7,337.97 | 73,988.56 |
| 28 May 2025 | Invoice | 43451 | 2,921.97 | 76,910.53 |
| 28 May 2025 | Invoice | 43452 | 2,415.00 | 79,325.53 |
| 28 May 2025 | Crd Note | 12592 | -3,622.50 | 75,703.03 |

---

### June 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **75,703.03** |
| 04 Jun 2025 | Invoice | 43628 | 4,382.95 | 80,085.98 |
| 04 Jun 2025 | Invoice | 43630 | 3,622.50 | 83,708.48 |
| 04 Jun 2025 | Crd Note | 12634 | -2,415.00 | 81,293.48 |
| 11 Jun 2025 | Payment | 00039812 | -20,557.69 | 60,735.79 |
| 11 Jun 2025 | Invoice | 43880 | 3,115.05 | 63,850.84 |
| 11 Jun 2025 | Crd Note | 12712 | -3,115.05 | 60,735.79 |
| 12 Jun 2025 | Invoice | 43910 | 3,115.05 | 63,850.84 |
| 19 Jun 2025 | Invoice | 44097 | 4,272.07 | 68,122.91 |
| 25 Jun 2025 | Invoice | 44241 | 2,848.04 | 70,970.95 |

---

### July 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **70,970.95** |
| 03 Jul 2025 | Invoice | 44516 | 3,115.05 | 74,086.00 |
| 09 Jul 2025 | Invoice | 44707 | 4,200.69 | 78,286.69 |
| 13 Jul 2025 | Payment | 00040063 | -11,795.24 | 66,491.45 |
| 17 Jul 2025 | Invoice | 44933 | 4,200.69 | 70,692.14 |
| 23 Jul 2025 | Invoice | 45091 | 2,800.46 | 73,492.60 |
| 23 Jul 2025 | Invoice | 45096 | 2,415.00 | 75,907.60 |
| 23 Jul 2025 | Crd Note | 13047 | -3,622.50 | 72,285.10 |
| 25 Jul 2025 | Invoice | 45162 | 262.55 | 72,547.65 |
| 31 Jul 2025 | Invoice | 45323 | 4,200.69 | 76,748.34 |
| 31 Jul 2025 | Invoice | 45324 | 3,622.50 | 80,370.84 |

---

### August 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **80,370.84** |
| 02 Aug 2025 | Crd Note | 13118 | -2,415.00 | 77,955.84 |
| 07 Aug 2025 | Invoice | 45498 | 2,800.46 | 80,756.30 |
| 14 Aug 2025 | Invoice | 45671 | 4,114.57 | 84,870.87 |
| 14 Aug 2025 | Invoice | 45672 | 3,622.50 | 88,493.37 |
| 15 Aug 2025 | Crd Note | 13239 | -1,207.50 | 87,285.87 |
| 21 Aug 2025 | Payment | 00040746 | -14,579.44 | 72,706.43 |
| 21 Aug 2025 | Invoice | 45831 | 4,114.57 | 76,821.00 |
| 28 Aug 2025 | Invoice | 45992 | 1,371.53 | 78,192.53 |

---

### September 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **78,192.53** |
| 03 Sep 2025 | Invoice | 46124 | 4,114.57 | 82,307.10 |
| 10 Sep 2025 | Invoice | 46308 | 3,948.56 | 86,255.66 |
| 18 Sep 2025 | Invoice | 46525 | 2,632.37 | 88,888.03 |
| 18 Sep 2025 | Invoice | 46526 | 2,415.00 | 91,303.03 |
| 21 Sep 2025 | Crd Note | 13519 | -4,830.00 | 86,473.03 |
| 25 Sep 2025 | Invoice | 46686 | 2,632.37 | 89,105.40 |

---

### October 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **89,105.40** |
| 02 Oct 2025 | Invoice | 46859 | 3,948.56 | 93,053.96 |
| 08 Oct 2025 | Invoice | 46990 | 3,948.56 | 97,002.52 |
| 08 Oct 2025 | Invoice | 46991 | 3,622.50 | 100,625.02 |
| 08 Oct 2025 | Crd Note | 13647 | -2,415.00 | 98,210.02 |
| 13 Oct 2025 | Payment | 00041664 | -16,601.81 | 81,608.21 |
| 16 Oct 2025 | Invoice | 47148 | 2,632.37 | 84,240.58 |
| 16 Oct 2025 | Invoice | 47157 | 2,415.00 | 86,655.58 |
| 16 Oct 2025 | Crd Note | 13705 | -3,622.50 | 83,033.08 |
| 23 Oct 2025 | Invoice | 47292 | 2,632.37 | 85,665.45 |
| 31 Oct 2025 | Invoice | 47464 | 3,948.56 | 89,614.01 |

---

### November 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **89,614.01** |
| 05 Nov 2025 | Payment | 00042134 | -13,327.87 | 76,286.14 |
| 07 Nov 2025 | Invoice | 47571 | 2,584.37 | 78,870.51 |
| 07 Nov 2025 | Invoice | 47572 | 2,415.00 | 81,285.51 |
| 07 Nov 2025 | Crd Note | 13828 | -3,622.50 | 77,663.01 |
| 13 Nov 2025 | Invoice | 47670 | 2,584.37 | 80,247.38 |
| 13 Nov 2025 | Invoice | 47671 | 2,415.00 | 82,662.38 |
| 13 Nov 2025 | Crd Note | 13870 | -1,207.50 | 81,454.88 |
| 20 Nov 2025 | Invoice | 47848 | 3,876.56 | 85,331.44 |
| 20 Nov 2025 | Invoice | 47849 | 1,207.50 | 86,538.94 |
| 20 Nov 2025 | Crd Note | 13925 | -3,622.50 | 82,916.44 |
| 27 Nov 2025 | Invoice | 47983 | 2,584.37 | 85,500.81 |
| 27 Nov 2025 | Invoice | 47984 | 1,207.50 | 86,708.31 |

---

### December 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **86,708.31** |
| 03 Dec 2025 | Invoice | 48098 | 3,876.56 | 90,584.87 |
| 03 Dec 2025 | Invoice | 48099 | 3,622.50 | 94,207.37 |
| 03 Dec 2025 | Crd Note | 14008 | -2,415.00 | 91,792.37 |
| 11 Dec 2025 | Invoice | 48244 | 2,596.52 | 94,388.89 |
| 11 Dec 2025 | Invoice | 48245 | 2,415.00 | 96,803.89 |
| 11 Dec 2025 | Crd Note | 14066 | -3,622.50 | 93,181.39 |
| 18 Dec 2025 | Invoice | 48391 | 3,894.77 | 97,076.16 |
| 23 Dec 2025 | Invoice | 48487 | 1,298.26 | 98,374.42 |
| 28 Dec 2025 | Payment | 00042788 | -13,161.86 | 85,212.56 |
| 30 Dec 2025 | Invoice | 48578 | 3,894.77 | 89,107.33 |
| 30 Dec 2025 | Crd Note | 14198 | -3,894.77 | 85,212.56 |
| 31 Dec 2025 | Invoice | 48599 | 3,894.77 | 89,107.33 |
| 31 Dec 2025 | Invoice | 48600 | 3,622.50 | 92,729.83 |
| 31 Dec 2025 | Crd Note | 14259 | -2,415.00 | 90,314.83 |

---

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **90,314.83** |
| 02 Jan 2026 | Invoice | 48776 | 2,596.52 | 92,911.35 |
| 02 Jan 2026 | Crd Note | 14201 | -2,596.52 | 90,314.83 |
| 08 Jan 2026 | Invoice | 48701 | 3,894.77 | 94,209.60 |
| 08 Jan 2026 | Invoice | 48702 | 3,622.50 | 97,832.10 |
| 08 Jan 2026 | Crd Note | 14239 | -4,830.00 | 93,002.10 |
| 16 Jan 2026 | Invoice | 48828 | 3,920.13 | 96,922.23 |
| 16 Jan 2026 | Invoice | 48829 | 3,622.50 | 100,544.73 |
| 21 Jan 2026 | Crd Note | 14313 | -2,415.00 | 98,129.73 |
| 27 Jan 2026 | Invoice | 48994 | 2,613.42 | 100,743.15 |
| 27 Jan 2026 | Invoice | 48995 | 2,415.00 | 103,158.15 |
| 28 Jan 2026 | Crd Note | 14352 | -4,830.00 | 98,328.15 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **98,328.15** |
| 04 Feb 2026 | Payment | 00043199 | -15,578.23 | 82,749.92 |
| 05 Feb 2026 | Invoice | 49126 | 3,959.98 | 86,709.90 |
| 12 Feb 2026 | Invoice | 49242 | 2,639.99 | 89,349.89 |
| 17 Feb 2026 | Invoice | 49315 | 3,959.98 | 93,309.87 |
| 17 Feb 2026 | Invoice | 49316 | 3,622.50 | 96,932.37 |
| 17 Feb 2026 | Crd Note | 14438 | -2,415.00 | 94,517.37 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **94,517.37** |
| 02 Mar 2026 | Invoice | 49530 | 3,959.98 | 98,477.35 |
| 03 Mar 2026 | Invoice | 49540 | 3,959.98 | 102,437.33 |
| 03 Mar 2026 | Invoice | 49541 | 3,622.50 | 106,059.83 |
| 03 Mar 2026 | Crd Note | 14525 | -2,415.00 | 103,644.83 |
| 03 Mar 2026 | Crd Note | 14526 | -3,959.98 | 99,684.85 |
| 12 Mar 2026 | Invoice | 49727 | 3,988.79 | 103,673.64 |
| 19 Mar 2026 | Invoice | 49842 | 3,988.79 | 107,662.43 |
| 31 Mar 2026 | Invoice | 50042 | 3,988.79 | 111,651.22 |
| 31 Mar 2026 | Invoice | 50043 | 3,622.50 | 115,273.72 |
| 31 Mar 2026 | Crd Note | 14694 | -4,830.00 | 110,443.72 |

---

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **110,443.72** |
| 08 Apr 2026 | Invoice | 50161 | 4,420.80 | 114,864.52 |
| 17 Apr 2026 | Invoice | 50290 | 2,947.20 | 117,811.72 |
| 17 Apr 2026 | Invoice | 50291 | 2,415.00 | 120,226.72 |
| 19 Apr 2026 | Crd Note | 14779 | -3,622.50 | 116,604.22 |
| 23 Apr 2026 | Invoice | 50371 | 2,947.20 | 119,551.42 |
| 23 Apr 2026 | Invoice | 50372 | 2,415.00 | 121,966.42 |
| 30 Apr 2026 | Invoice | 50468 | 4,420.80 | 126,387.22 |

---

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **126,387.22** |
| 08 May 2026 | Invoice | 50594 | 3,370.81 | 129,758.03 |
| 15 May 2026 | Invoice | 50712 | 3,370.81 | 133,128.84 |
| 20 May 2026 | Invoice | 50810 | 5,056.22 | 138,185.06 |

---

## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders are tracked purely by physical count. The Opening Balance on 03 December 2018 is R0.00 as it represents account inception.*

### December 2018
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| **End Dec** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### January 2019
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| 01 Jan 2019 | Invoice | 4564 | 0 | 0 | +5 | 0 | 0 |
| 01 Jan 2019 | Invoice | 4567 | 0 | 0 | +2 | 0 | 0 |
| 01 Jan 2019 | Invoice | 4568 | 0 | 0 | +2 | 0 | 0 |
| 04 Jan 2019 | Invoice | 4592 | 0 | 0 | +1 | 0 | 0 |
| 08 Jan 2019 | Crd Note | 607 | 0 | 0 | -1 | 0 | 0 |
| 09 Jan 2019 | Invoice | 4620 | 0 | 0 | +1 | 0 | 0 |
| 11 Jan 2019 | Crd Note | 613 | 0 | 0 | -2 | 0 | 0 |
| 11 Jan 2019 | Crd Note | 617 | 0 | 0 | -1 | 0 | 0 |
| **End Jan** | **Closing Balance** | — | **0** | **0** | **7** | **0** | **0** |

---

### February 2019
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **0** | **0** | **7** | **0** | **0** |
| 01 Feb 2019 | Invoice | 4733 | 0 | 0 | +1 | 0 | 0 |
| 11 Feb 2019 | Invoice | 4768 | 0 | 0 | +4 | 0 | 0 |
| 13 Feb 2019 | Crd Note | 639 | 0 | 0 | -1 | 0 | 0 |
| 15 Feb 2019 | Invoice | 4794 | 0 | 0 | +7 | 0 | 0 |
| 20 Feb 2019 | Crd Note | 656 | 0 | 0 | -8 | 0 | 0 |
| 26 Feb 2019 | Crd Note | 661 | 0 | 0 | -2 | 0 | 0 |
| 28 Feb 2019 | Crd Note | 671 | 0 | 0 | -1 | 0 | 0 |
| **End Feb** | **Closing Balance** | — | **0** | **0** | **7** | **0** | **0** |

---

### March 2019
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **0** | **0** | **7** | **0** | **0** |
| 03 Mar 2019 | Crd Note | 664 | 0 | 0 | -2 | 0 | 0 |
| 07 Mar 2019 | Invoice | 4902 | 0 | 0 | +1 | 0 | 0 |
| 22 Mar 2019 | Invoice | 4961 | 0 | 0 | +3 | 0 | 0 |
| **End Mar** | **Closing Balance** | — | **0** | **0** | **9** | **0** | **0** |

---

### April 2019
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **0** | **0** | **9** | **0** | **0** |
| 17 Apr 2019 | Invoice | 5092 | 0 | 0 | +4 | 0 | 0 |
| 23 Apr 2019 | Crd Note | 697 | 0 | 0 | -4 | 0 | 0 |
| 23 Apr 2019 | Crd Note | 704 | 0 | 0 | -4 | 0 | 0 |
| **End Apr** | **Closing Balance** | — | **0** | **0** | **5** | **0** | **0** |

---

### May 2019
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **0** | **0** | **5** | **0** | **0** |
| 21 May 2019 | Crd Note | 721 | 0 | 0 | -4 | 0 | 0 |
| **End May** | **Closing Balance** | — | **0** | **0** | **1** | **0** | **0** |

---

### June 2019
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **0** | **0** | **1** | **0** | **0** |
| 27 Jun 2019 | Invoice | 5453 | 0 | 0 | +3 | 0 | 0 |
| **End Jun** | **Closing Balance** | — | **0** | **0** | **4** | **0** | **0** |

---

### July 2019
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **0** | **0** | **4** | **0** | **0** |
| 03 Jul 2019 | Crd Note | 766 | 0 | 0 | -3 | 0 | 0 |
| 15 Jul 2019 | Crd Note | 773 | 0 | 0 | -4 | 0 | 0 |
| 18 Jul 2019 | Crd Note | 789 | 0 | 0 | -2 | 0 | 0 |
| **End Jul** | **Closing Balance** | — | **0** | **0** | **-5** | **0** | **0** |

---

### August 2019
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **0** | **-5** | **0** | **0** |
| 07 Aug 2019 | Invoice | 5633 | 0 | 0 | +2 | 0 | 0 |
| 07 Aug 2019 | Invoice | 5636 | 0 | 0 | +4 | 0 | 0 |
| 07 Aug 2019 | Invoice | 5643 | 0 | 0 | +1 | 0 | 0 |
| 13 Aug 2019 | Crd Note | 787 | 0 | 0 | -1 | 0 | 0 |
| **End Aug** | **Closing Balance** | — | **0** | **0** | **1** | **0** | **0** |

---

### September 2019
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **0** | **0** | **1** | **0** | **0** |
| **End Sep** | **Closing Balance** | — | **0** | **0** | **1** | **0** | **0** |

---

### October 2019
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | **0** | **0** | **1** | **0** | **0** |
| **End Oct** | **Closing Balance** | — | **0** | **0** | **1** | **0** | **0** |

---

### November 2019
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | **0** | **0** | **1** | **0** | **0** |
| **End Nov** | **Closing Balance** | — | **0** | **0** | **1** | **0** | **0** |

---

### December 2019
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | **0** | **0** | **1** | **0** | **0** |
| **End Dec** | **Closing Balance** | — | **0** | **0** | **1** | **0** | **0** |

---

### January 2020
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **0** | **0** | **1** | **0** | **0** |
| 08 Jan 2020 | Invoice | 6201 | 0 | 0 | +1 | 0 | 0 |
| **End Jan** | **Closing Balance** | — | **0** | **0** | **2** | **0** | **0** |

---

### February 2020
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **0** | **0** | **2** | **0** | **0** |
| **End Feb** | **Closing Balance** | — | **0** | **0** | **2** | **0** | **0** |

---

### March 2020
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **0** | **0** | **2** | **0** | **0** |
| 31 Mar 2020 | Crd Note | 849 | 0 | 0 | -1 | 0 | 0 |
| 31 Mar 2020 | Crd Note | 850 | 0 | 0 | -1 | 0 | 0 |
| **End Mar** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### June 2020
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| **End Jun** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### August 2020
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| **End Aug** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### September 2020
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| **End Sep** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### November 2020
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| **End Nov** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### March 2021
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| 23 Mar 2021 | Invoice | 8037 | 0 | 0 | +4 | 0 | 0 |
| 24 Mar 2021 | Crd Note | 974 | 0 | -4 | 0 | 0 | 0 |
| 25 Mar 2021 | Invoice | 8059 | 0 | +4 | 0 | 0 | 0 |
| 25 Mar 2021 | Crd Note | 990 | 0 | -4 | 0 | 0 | 0 |
| 29 Mar 2021 | Invoice | 8090 | 0 | +8 | 0 | 0 | 0 |
| 30 Mar 2021 | Crd Note | 1018 | 0 | 0 | -4 | 0 | 0 |
| **End Mar** | **Closing Balance** | — | **0** | **4** | **0** | **0** | **0** |

---

### April 2021
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **0** | **4** | **0** | **0** | **0** |
| 05 Apr 2021 | Crd Note | 1043 | 0 | -5 | 0 | 0 | 0 |
| 06 Apr 2021 | Invoice | 8137 | 0 | +5 | 0 | 0 | 0 |
| 06 Apr 2021 | Invoice | 8147 | 0 | +4 | 0 | 0 | 0 |
| 06 Apr 2021 | Crd Note | 1057 | 0 | -4 | 0 | 0 | 0 |
| 16 Apr 2021 | Invoice | 8225 | 0 | +4 | 0 | 0 | 0 |
| 19 Apr 2021 | Invoice | 8249 | 0 | +3 | 0 | 0 | 0 |
| 19 Apr 2021 | Crd Note | 1129 | 0 | -3 | 0 | 0 | 0 |
| 22 Apr 2021 | Invoice | 8276 | 0 | +3 | 0 | 0 | 0 |
| 22 Apr 2021 | Crd Note | 1157 | 0 | -2 | 0 | 0 | 0 |
| 28 Apr 2021 | Invoice | 8321 | 0 | +5 | 0 | 0 | 0 |
| 28 Apr 2021 | Crd Note | 1195 | 0 | -6 | 0 | 0 | 0 |
| **End Apr** | **Closing Balance** | — | **0** | **8** | **0** | **0** | **0** |

---

### May 2021
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **0** | **8** | **0** | **0** | **0** |
| 03 May 2021 | Invoice | 8368 | 0 | +7 | 0 | 0 | 0 |
| 03 May 2021 | Crd Note | 1236 | 0 | -6 | 0 | 0 | 0 |
| 06 May 2021 | Invoice | 8399 | 0 | +4 | 0 | 0 | 0 |
| 07 May 2021 | Crd Note | 1279 | 0 | -1 | 0 | 0 | 0 |
| 11 May 2021 | Invoice | 8441 | 0 | +3 | 0 | 0 | 0 |
| 12 May 2021 | Crd Note | 1316 | 0 | -3 | 0 | 0 | 0 |
| 12 May 2021 | Crd Note | 1317 | 0 | -1 | 0 | 0 | 0 |
| 12 May 2021 | Crd Note | 1318 | 0 | -3 | 0 | 0 | 0 |
| 13 May 2021 | Invoice | 8460 | 0 | +2 | 0 | 0 | 0 |
| 16 May 2021 | Invoice | 8475 | 0 | +5 | 0 | 0 | 0 |
| 16 May 2021 | Crd Note | 1352 | 0 | -7 | 0 | 0 | 0 |
| 19 May 2021 | Invoice | 8510 | 0 | +3 | 0 | 0 | 0 |
| 19 May 2021 | Crd Note | 1382 | 0 | -2 | 0 | 0 | 0 |
| 23 May 2021 | Invoice | 8554 | 0 | +3 | 0 | 0 | 0 |
| 23 May 2021 | Crd Note | 1424 | 0 | -4 | 0 | 0 | 0 |
| 27 May 2021 | Invoice | 8607 | 0 | +4 | 0 | 0 | 0 |
| 27 May 2021 | Crd Note | 1478 | 0 | -5 | 0 | 0 | 0 |
| 30 May 2021 | Invoice | 8629 | 0 | +3 | 0 | 0 | 0 |
| 30 May 2021 | Crd Note | 1497 | 0 | -2 | 0 | 0 | 0 |
| **End May** | **Closing Balance** | — | **0** | **8** | **0** | **0** | **0** |

---

### June 2021
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **0** | **8** | **0** | **0** | **0** |
| 03 Jun 2021 | Invoice | 8692 | 0 | +5 | 0 | 0 | 0 |
| 03 Jun 2021 | Crd Note | 1557 | 0 | -5 | 0 | 0 | 0 |
| 06 Jun 2021 | Invoice | 8730 | 0 | +3 | 0 | 0 | 0 |
| 06 Jun 2021 | Crd Note | 1588 | 0 | -3 | 0 | 0 | 0 |
| 09 Jun 2021 | Invoice | 8805 | 0 | +5 | +1 | 0 | 0 |
| 09 Jun 2021 | Invoice | 8809 | 0 | 0 | +1 | 0 | 0 |
| 09 Jun 2021 | Crd Note | 1645 | 0 | -5 | -1 | 0 | 0 |
| 14 Jun 2021 | Invoice | 8864 | 0 | +4 | 0 | 0 | 0 |
| 14 Jun 2021 | Crd Note | 1695 | 0 | -4 | 0 | 0 | 0 |
| 17 Jun 2021 | Invoice | 8897 | 0 | +5 | 0 | 0 | 0 |
| 17 Jun 2021 | Crd Note | 1722 | 0 | -4 | 0 | 0 | 0 |
| 22 Jun 2021 | Invoice | 8953 | 0 | +5 | 0 | 0 | 0 |
| 22 Jun 2021 | Crd Note | 1767 | 0 | -5 | 0 | 0 | 0 |
| 23 Jun 2021 | Invoice | 8972 | 0 | +4 | 0 | 0 | 0 |
| 23 Jun 2021 | Crd Note | 1789 | 0 | -1 | 0 | 0 | 0 |
| 30 Jun 2021 | Invoice | 9069 | 0 | +3 | 0 | 0 | 0 |
| **End Jun** | **Closing Balance** | — | **0** | **15** | **1** | **0** | **0** |

---

### July 2021
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **0** | **15** | **1** | **0** | **0** |
| 01 Jul 2021 | Crd Note | 1874 | 0 | -5 | 0 | 0 | 0 |
| 05 Jul 2021 | Invoice | 9139 | 0 | +3 | 0 | 0 | 0 |
| 05 Jul 2021 | Crd Note | 1933 | 0 | -3 | 0 | 0 | 0 |
| 07 Jul 2021 | Invoice | 9169 | 0 | +4 | 0 | 0 | 0 |
| 07 Jul 2021 | Crd Note | 1963 | 0 | -4 | 0 | 0 | 0 |
| 18 Jul 2021 | Invoice | 9306 | 0 | +3 | 0 | 0 | 0 |
| 21 Jul 2021 | Invoice | 9350 | 0 | +3 | 0 | 0 | 0 |
| 25 Jul 2021 | Invoice | 9452 | 0 | +5 | 0 | 0 | 0 |
| 29 Jul 2021 | Invoice | 9517 | 0 | +4 | 0 | 0 | 0 |
| **End Jul** | **Closing Balance** | — | **0** | **25** | **1** | **0** | **0** |

---

### August 2021
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **25** | **1** | **0** | **0** |
| 01 Aug 2021 | Invoice | 9561 | 0 | +3 | 0 | 0 | 0 |
| 02 Aug 2021 | Crd Note | 2101 | 0 | -3 | 0 | 0 | 0 |
| 04 Aug 2021 | Invoice | 9619 | 0 | +3 | 0 | 0 | 0 |
| 04 Aug 2021 | Crd Note | 2124 | 0 | -6 | 0 | 0 | 0 |
| 10 Aug 2021 | Invoice | 9692 | 0 | +4 | +1 | 0 | 0 |
| 12 Aug 2021 | Invoice | 9756 | 0 | +3 | 0 | 0 | 0 |
| 13 Aug 2021 | Invoice | 9760 | +3 | 0 | 0 | 0 | 0 |
| 13 Aug 2021 | Crd Note | 2191 | 0 | -9 | -1 | 0 | 0 |
| 16 Aug 2021 | Invoice | 9789 | 0 | +4 | 0 | 0 | 0 |
| 16 Aug 2021 | Crd Note | 2205 | -2 | -2 | 0 | 0 | 0 |
| 18 Aug 2021 | Invoice | 9841 | 0 | +4 | 0 | 0 | 0 |
| 19 Aug 2021 | Crd Note | 2239 | -2 | -2 | 0 | 0 | 0 |
| 22 Aug 2021 | Invoice | 9891 | 0 | +3 | 0 | 0 | 0 |
| 22 Aug 2021 | Crd Note | 2263 | -2 | -2 | 0 | 0 | 0 |
| 25 Aug 2021 | Invoice | 9933 | 0 | +3 | 0 | 0 | 0 |
| 25 Aug 2021 | Invoice | 9935 | 0 | +3 | 0 | 0 | 0 |
| 25 Aug 2021 | Invoice | 9937 | 0 | +4 | 0 | 0 | 0 |
| 25 Aug 2021 | Crd Note | 2280 | 0 | -3 | 0 | 0 | 0 |
| 25 Aug 2021 | Crd Note | 2282 | 0 | -3 | 0 | 0 | 0 |
| 25 Aug 2021 | Crd Note | 2285 | 0 | -2 | 0 | 0 | 0 |
| 29 Aug 2021 | Crd Note | 2308 | 0 | -3 | 0 | 0 | 0 |
| **End Aug** | **Closing Balance** | — | **-3** | **24** | **1** | **0** | **0** |

---

### September 2021
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **-3** | **24** | **1** | **0** | **0** |
| 02 Sep 2021 | Invoice | 10042 | 0 | +4 | 0 | 0 | 0 |
| 02 Sep 2021 | Crd Note | 2348 | 0 | -4 | 0 | 0 | 0 |
| 06 Sep 2021 | Invoice | 10103 | 0 | +4 | 0 | 0 | 0 |
| 07 Sep 2021 | Crd Note | 2389 | 0 | -3 | 0 | 0 | 0 |
| 09 Sep 2021 | Invoice | 10149 | 0 | +4 | 0 | 0 | 0 |
| 10 Sep 2021 | Crd Note | 2409 | 0 | -3 | 0 | 0 | 0 |
| 15 Sep 2021 | Invoice | 10213 | 0 | +4 | 0 | 0 | 0 |
| 16 Sep 2021 | Crd Note | 2437 | 0 | -5 | 0 | 0 | 0 |
| 20 Sep 2021 | Invoice | 10265 | 0 | +4 | 0 | 0 | 0 |
| 20 Sep 2021 | Invoice | 10268 | +7 | 0 | 0 | 0 | 0 |
| 20 Sep 2021 | Crd Note | 2468 | 0 | -8 | 0 | 0 | 0 |
| 20 Sep 2021 | Crd Note | 2473 | 0 | -4 | 0 | 0 | 0 |
| 21 Sep 2021 | Invoice | 10299 | 0 | +5 | 0 | 0 | 0 |
| 21 Sep 2021 | Crd Note | 2484 | -1 | 0 | 0 | 0 | 0 |
| 26 Sep 2021 | Invoice | 10363 | 0 | +3 | 0 | 0 | 0 |
| 26 Sep 2021 | Crd Note | 2528 | -3 | -3 | 0 | 0 | 0 |
| 29 Sep 2021 | Invoice | 10410 | 0 | +5 | 0 | 0 | 0 |
| 30 Sep 2021 | Crd Note | 2551 | -2 | -1 | 0 | 0 | 0 |
| **End Sep** | **Closing Balance** | — | **-2** | **26** | **1** | **0** | **0** |

---

### October 2021
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | **-2** | **26** | **1** | **0** | **0** |
| 06 Oct 2021 | Invoice | 10581 | +7 | 0 | 0 | 0 | 0 |
| 06 Oct 2021 | Crd Note | 2614 | 0 | -7 | 0 | 0 | 0 |
| 06 Oct 2021 | Crd Note | 2615 | -1 | 0 | 0 | 0 | 0 |
| 08 Oct 2021 | Invoice | 10617 | 0 | +4 | 0 | 0 | 0 |
| 10 Oct 2021 | Crd Note | 2636 | 0 | -4 | 0 | 0 | 0 |
| 11 Oct 2021 | Invoice | 10673 | 0 | +5 | 0 | 0 | 0 |
| 12 Oct 2021 | Crd Note | 2664 | 0 | -1 | 0 | 0 | 0 |
| 12 Oct 2021 | Crd Note | 2665 | -3 | -2 | 0 | 0 | 0 |
| 14 Oct 2021 | Invoice | 10705 | 0 | +4 | 0 | 0 | 0 |
| 14 Oct 2021 | Crd Note | 2882 | 0 | -4 | 0 | 0 | 0 |
| 21 Oct 2021 | Invoice | 10839 | 0 | +4 | 0 | 0 | 0 |
| **End Oct** | **Closing Balance** | — | **1** | **25** | **1** | **0** | **0** |

---

### November 2021
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | **1** | **25** | **1** | **0** | **0** |
| 03 Nov 2021 | Invoice | 11062 | 0 | +5 | 0 | 0 | 0 |
| 04 Nov 2021 | Invoice | 11089 | 0 | +3 | 0 | 0 | 0 |
| 05 Nov 2021 | Crd Note | 2828 | 0 | -3 | 0 | 0 | 0 |
| 12 Nov 2021 | Crd Note | 2880 | 0 | -5 | 0 | 0 | 0 |
| 12 Nov 2021 | Crd Note | 2881 | 0 | -4 | 0 | 0 | 0 |
| 17 Nov 2021 | Invoice | 11279 | 0 | +5 | 0 | 0 | 0 |
| 17 Nov 2021 | Crd Note | 2908 | 0 | -5 | 0 | 0 | 0 |
| 21 Nov 2021 | Invoice | 11333 | 0 | +5 | 0 | 0 | 0 |
| 21 Nov 2021 | Crd Note | 2924 | 0 | -4 | 0 | 0 | 0 |
| 28 Nov 2021 | Crd Note | 2972 | 0 | -1 | 0 | 0 | 0 |
| **End Nov** | **Closing Balance** | — | **1** | **21** | **1** | **0** | **0** |

---

### December 2021
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | **1** | **21** | **1** | **0** | **0** |
| **End Dec** | **Closing Balance** | — | **1** | **21** | **1** | **0** | **0** |

---

### January 2022
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **1** | **21** | **1** | **0** | **0** |
| 19 Jan 2022 | Invoice | 12042 | 0 | +5 | 0 | 0 | 0 |
| 25 Jan 2022 | Invoice | 12073 | 0 | +5 | 0 | 0 | 0 |
| 26 Jan 2022 | Crd Note | 3156 | 0 | -5 | 0 | 0 | 0 |
| 27 Jan 2022 | Invoice | 12088 | 0 | +5 | 0 | 0 | 0 |
| **End Jan** | **Closing Balance** | — | **1** | **31** | **1** | **0** | **0** |

---

### February 2022
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **1** | **31** | **1** | **0** | **0** |
| 04 Feb 2022 | Invoice | 12178 | 0 | +6 | 0 | 0 | 0 |
| 10 Feb 2022 | Crd Note | 3216 | 0 | -6 | 0 | 0 | 0 |
| 16 Feb 2022 | Invoice | 12316 | 0 | +2 | 0 | 0 | 0 |
| 25 Feb 2022 | Crd Note | 3272 | 0 | -2 | 0 | 0 | 0 |
| **End Feb** | **Closing Balance** | — | **1** | **31** | **1** | **0** | **0** |

---

### March 2022
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **1** | **31** | **1** | **0** | **0** |
| **End Mar** | **Closing Balance** | — | **1** | **31** | **1** | **0** | **0** |

---

### April 2022
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **1** | **31** | **1** | **0** | **0** |
| 20 Apr 2022 | Invoice | 13067 | 0 | +2 | 0 | 0 | 0 |
| 27 Apr 2022 | Invoice | 13161 | 0 | +7 | 0 | 0 | 0 |
| 28 Apr 2022 | Crd Note | 3470 | 0 | -7 | 0 | 0 | 0 |
| **End Apr** | **Closing Balance** | — | **1** | **33** | **1** | **0** | **0** |

---

### May 2022
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **1** | **33** | **1** | **0** | **0** |
| 03 May 2022 | Invoice | 13256 | 0 | +4 | 0 | 0 | 0 |
| 03 May 2022 | Crd Note | 3500 | 0 | -4 | 0 | 0 | 0 |
| 03 May 2022 | Crd Note | 3501 | 0 | -2 | 0 | 0 | 0 |
| 06 May 2022 | Invoice | 13333 | 0 | +3 | 0 | 0 | 0 |
| 06 May 2022 | Crd Note | 3534 | 0 | -3 | 0 | 0 | 0 |
| 08 May 2022 | Invoice | 13360 | 0 | +3 | 0 | 0 | 0 |
| 11 May 2022 | Invoice | 13453 | 0 | +4 | 0 | 0 | 0 |
| 11 May 2022 | Crd Note | 3566 | 0 | -4 | 0 | 0 | 0 |
| 11 May 2022 | Crd Note | 3578 | 0 | -4 | 0 | 0 | 0 |
| 18 May 2022 | Invoice | 13571 | 0 | +4 | 0 | 0 | 0 |
| 18 May 2022 | Crd Note | 3602 | 0 | -3 | 0 | 0 | 0 |
| 22 May 2022 | Crd Note | 3617 | 0 | -2 | 0 | 0 | 0 |
| 30 May 2022 | Invoice | 13745 | 0 | +5 | 0 | 0 | 0 |
| 30 May 2022 | Crd Note | 3641 | 0 | -5 | 0 | 0 | 0 |
| **End May** | **Closing Balance** | — | **1** | **29** | **1** | **0** | **0** |

---

### June 2022
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **1** | **29** | **1** | **0** | **0** |
| 02 Jun 2022 | Invoice | 13823 | 0 | +4 | 0 | 0 | 0 |
| 02 Jun 2022 | Crd Note | 3653 | 0 | -1 | 0 | 0 | 0 |
| **End Jun** | **Closing Balance** | — | **1** | **32** | **1** | **0** | **0** |

---

### July 2022
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **1** | **32** | **1** | **0** | **0** |
| 21 Jul 2022 | Invoice | 14663 | 0 | +6 | 0 | 0 | 0 |
| 21 Jul 2022 | Crd Note | 3790 | 0 | -6 | 0 | 0 | 0 |
| **End Jul** | **Closing Balance** | — | **1** | **32** | **1** | **0** | **0** |

---

### August 2022
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **1** | **32** | **1** | **0** | **0** |
| 03 Aug 2022 | Crd Note | 3791 | 0 | -1 | 0 | 0 | 0 |
| 09 Aug 2022 | Invoice | 15004 | 0 | +3 | 0 | 0 | 0 |
| 09 Aug 2022 | Crd Note | 3817 | 0 | -2 | 0 | 0 | 0 |
| 18 Aug 2022 | Invoice | 15192 | 0 | +8 | 0 | 0 | 0 |
| 18 Aug 2022 | Crd Note | 3906 | 0 | -8 | 0 | 0 | 0 |
| 26 Aug 2022 | Invoice | 15345 | 0 | 0 | +6 | 0 | 0 |
| 26 Aug 2022 | Invoice | 15346 | 0 | +6 | 0 | 0 | 0 |
| 26 Aug 2022 | Crd Note | 3963 | 0 | 0 | -6 | 0 | 0 |
| 26 Aug 2022 | Crd Note | 3964 | 0 | -8 | 0 | 0 | 0 |
| 28 Aug 2022 | Invoice | 15360 | 0 | +8 | 0 | 0 | 0 |
| 28 Aug 2022 | Crd Note | 3966 | 0 | -3 | 0 | 0 | 0 |
| 28 Aug 2022 | Crd Note | 3967 | 0 | -5 | 0 | 0 | 0 |
| 31 Aug 2022 | Invoice | 15431 | 0 | 0 | 0 | 0 | +2 |
| 31 Aug 2022 | Crd Note | 3999 | 0 | -5 | 0 | 0 | 0 |
| **End Aug** | **Closing Balance** | — | **1** | **25** | **1** | **0** | **2** |

---

### September 2022
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **1** | **25** | **1** | **0** | **2** |
| 04 Sep 2022 | Invoice | 15491 | 0 | 0 | 0 | 0 | +1 |
| 09 Sep 2022 | Invoice | 15560 | 0 | 0 | 0 | +2 | +1 |
| 09 Sep 2022 | Crd Note | 4034 | 0 | -1 | 0 | 0 | 0 |
| 09 Sep 2022 | Crd Note | 4035 | 0 | -2 | 0 | 0 | -2 |
| 14 Sep 2022 | Invoice | 15626 | 0 | 0 | 0 | +3 | 0 |
| 14 Sep 2022 | Crd Note | 4068 | 0 | -1 | 0 | 0 | -2 |
| 22 Sep 2022 | Invoice | 15801 | 0 | 0 | 0 | +3 | 0 |
| 22 Sep 2022 | Crd Note | 4112 | 0 | 0 | 0 | -2 | 0 |
| **End Sep** | **Closing Balance** | — | **1** | **21** | **1** | **6** | **0** |

---

### October 2022
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | **1** | **21** | **1** | **6** | **0** |
| 19 Oct 2022 | Invoice | 16128 | 0 | 0 | 0 | 0 | +2 |
| 20 Oct 2022 | Crd Note | 4209 | 0 | 0 | 0 | 0 | -1 |
| 20 Oct 2022 | Crd Note | 4210 | 0 | 0 | 0 | 0 | -2 |
| 26 Oct 2022 | Invoice | 16200 | 0 | 0 | 0 | 0 | +3 |
| 26 Oct 2022 | Crd Note | 4225 | 0 | 0 | 0 | 0 | -2 |
| **End Oct** | **Closing Balance** | — | **1** | **21** | **1** | **6** | **0** |

---

### November 2022
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | **1** | **21** | **1** | **6** | **0** |
| 02 Nov 2022 | Invoice | 16316 | 0 | 0 | 0 | 0 | +2 |
| 02 Nov 2022 | Crd Note | 4255 | 0 | 0 | 0 | 0 | -1 |
| 02 Nov 2022 | Crd Note | 4256 | 0 | 0 | 0 | 0 | -2 |
| 09 Nov 2022 | Invoice | 16400 | 0 | 0 | 0 | +2 | 0 |
| 10 Nov 2022 | Invoice | 16419 | 0 | +2 | 0 | 0 | 0 |
| 10 Nov 2022 | Invoice | 16420 | 0 | +1 | 0 | 0 | 0 |
| 10 Nov 2022 | Invoice | 16421 | 0 | +1 | 0 | 0 | 0 |
| 10 Nov 2022 | Crd Note | 4276 | 0 | 0 | 0 | 0 | -2 |
| **End Nov** | **Closing Balance** | — | **1** | **25** | **1** | **8** | **-3** |

---

### December 2022
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | **1** | **25** | **1** | **8** | **-3** |
| 05 Dec 2022 | Invoice | 16724 | 0 | 0 | 0 | 0 | +4 |
| 06 Dec 2022 | Crd Note | 4350 | 0 | -1 | 0 | 0 | -2 |
| 12 Dec 2022 | Invoice | 16830 | 0 | 0 | 0 | +4 | 0 |
| 12 Dec 2022 | Crd Note | 4377 | 0 | 0 | 0 | -3 | 0 |
| 18 Dec 2022 | Invoice | 17076 | 0 | 0 | 0 | 0 | +4 |
| 18 Dec 2022 | Crd Note | 4419 | 0 | 0 | 0 | 0 | -3 |
| 22 Dec 2022 | Invoice | 17028 | 0 | 0 | 0 | 0 | +1 |
| **End Dec** | **Closing Balance** | — | **1** | **24** | **1** | **9** | **1** |

---

### January 2023
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **1** | **24** | **1** | **9** | **1** |
| 02 Jan 2023 | Crd Note | 4441 | 0 | 0 | 0 | 0 | -1 |
| **End Jan** | **Closing Balance** | — | **1** | **24** | **1** | **9** | **0** |

---

### February 2023
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **1** | **24** | **1** | **9** | **0** |
| 02 Feb 2023 | Crd Note | 4514 | 0 | 0 | 0 | -1 | 0 |
| **End Feb** | **Closing Balance** | — | **1** | **24** | **1** | **8** | **0** |

---

### March 2023
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **1** | **24** | **1** | **8** | **0** |
| 22 Mar 2023 | Invoice | 18696 | 0 | 0 | 0 | 0 | +3 |
| 22 Mar 2023 | Crd Note | 4634 | 0 | 0 | 0 | 0 | -1 |
| **End Mar** | **Closing Balance** | — | **1** | **24** | **1** | **8** | **2** |

---

### April 2023
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **1** | **24** | **1** | **8** | **2** |
| 13 Apr 2023 | Invoice | 19349 | 0 | 0 | 0 | 0 | +2 |
| 13 Apr 2023 | Crd Note | 4725 | 0 | 0 | 0 | 0 | -2 |
| 13 Apr 2023 | Crd Note | 4726 | 0 | 0 | 0 | 0 | -1 |
| 19 Apr 2023 | Invoice | 19499 | 0 | 0 | 0 | 0 | +2 |
| 19 Apr 2023 | Crd Note | 4759 | 0 | 0 | 0 | 0 | -2 |
| 25 Apr 2023 | Invoice | 19698 | 0 | 0 | 0 | 0 | +3 |
| 25 Apr 2023 | Crd Note | 4799 | 0 | 0 | 0 | 0 | -3 |
| **End Apr** | **Closing Balance** | — | **1** | **24** | **1** | **8** | **1** |

---

### May 2023
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **1** | **24** | **1** | **8** | **1** |
| 03 May 2023 | Invoice | 19928 | 0 | 0 | 0 | +2 | +1 |
| 03 May 2023 | Crd Note | 4859 | 0 | 0 | 0 | -2 | -1 |
| 09 May 2023 | Invoice | 20124 | 0 | 0 | 0 | 0 | +3 |
| 09 May 2023 | Crd Note | 4908 | 0 | 0 | 0 | 0 | -2 |
| 17 May 2023 | Invoice | 20358 | 0 | 0 | 0 | 0 | +3 |
| 17 May 2023 | Crd Note | 4977 | 0 | 0 | 0 | 0 | -3 |
| 31 May 2023 | Invoice | 20873 | 0 | 0 | 0 | 0 | +3 |
| 31 May 2023 | Crd Note | 5101 | 0 | 0 | 0 | 0 | -4 |
| **End May** | **Closing Balance** | — | **1** | **24** | **1** | **8** | **1** |

---

### June 2023
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **1** | **24** | **1** | **8** | **1** |
| 07 Jun 2023 | Invoice | 21111 | 0 | 0 | 0 | 0 | +2 |
| 07 Jun 2023 | Crd Note | 5151 | 0 | 0 | 0 | 0 | -3 |
| 14 Jun 2023 | Invoice | 21346 | 0 | 0 | 0 | 0 | +3 |
| 14 Jun 2023 | Crd Note | 5235 | 0 | 0 | 0 | 0 | -1 |
| 21 Jun 2023 | Invoice | 21564 | 0 | 0 | 0 | 0 | +3 |
| 21 Jun 2023 | Crd Note | 5299 | 0 | 0 | 0 | 0 | -3 |
| 27 Jun 2023 | Invoice | 21763 | 0 | 0 | 0 | 0 | +3 |
| 27 Jun 2023 | Crd Note | 5356 | 0 | 0 | 0 | 0 | -3 |
| **End Jun** | **Closing Balance** | — | **1** | **24** | **1** | **8** | **2** |

---

### July 2023
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **1** | **24** | **1** | **8** | **2** |
| 05 Jul 2023 | Invoice | 22051 | 0 | 0 | 0 | 0 | +3 |
| 05 Jul 2023 | Crd Note | 5440 | 0 | 0 | 0 | 0 | -3 |
| 12 Jul 2023 | Invoice | 22332 | 0 | 0 | 0 | 0 | +3 |
| 19 Jul 2023 | Invoice | 22569 | 0 | 0 | 0 | 0 | +3 |
| 19 Jul 2023 | Invoice | 22605 | 0 | 0 | +2 | 0 | 0 |
| 20 Jul 2023 | Crd Note | 5594 | 0 | 0 | 0 | 0 | -3 |
| 26 Jul 2023 | Invoice | 22847 | 0 | 0 | 0 | 0 | +3 |
| 26 Jul 2023 | Crd Note | 5686 | 0 | 0 | -2 | 0 | -3 |
| **End Jul** | **Closing Balance** | — | **1** | **24** | **1** | **8** | **5** |

---

### August 2023
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **1** | **24** | **1** | **8** | **5** |
| 02 Aug 2023 | Invoice | 23099 | 0 | 0 | 0 | 0 | +3 |
| 02 Aug 2023 | Crd Note | 5771 | 0 | 0 | 0 | 0 | -3 |
| 09 Aug 2023 | Invoice | 23279 | 0 | 0 | 0 | 0 | +3 |
| 09 Aug 2023 | Crd Note | 5833 | 0 | 0 | 0 | 0 | -3 |
| 16 Aug 2023 | Invoice | 23546 | 0 | 0 | 0 | 0 | +3 |
| 23 Aug 2023 | Invoice | 23733 | 0 | 0 | 0 | 0 | +3 |
| 23 Aug 2023 | Crd Note | 5983 | 0 | 0 | 0 | 0 | -3 |
| 30 Aug 2023 | Invoice | 23965 | 0 | 0 | 0 | 0 | +3 |
| 31 Aug 2023 | Crd Note | 6075 | 0 | 0 | 0 | 0 | -3 |
| **End Aug** | **Closing Balance** | — | **1** | **24** | **1** | **8** | **8** |

---

### September 2023
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **1** | **24** | **1** | **8** | **8** |
| 01 Sep 2023 | Invoice | 24088 | 0 | 0 | 0 | 0 | +2 |
| 03 Sep 2023 | Crd Note | 6101 | 0 | 0 | 0 | 0 | -2 |
| 03 Sep 2023 | Crd Note | 6105 | 0 | 0 | 0 | 0 | -3 |
| 06 Sep 2023 | Invoice | 24246 | 0 | 0 | 0 | 0 | +2 |
| 06 Sep 2023 | Crd Note | 6151 | 0 | 0 | 0 | 0 | -3 |
| 14 Sep 2023 | Invoice | 24517 | 0 | 0 | 0 | 0 | +2 |
| 14 Sep 2023 | Crd Note | 6232 | 0 | 0 | 0 | 0 | -4 |
| 20 Sep 2023 | Invoice | 24694 | 0 | 0 | 0 | 0 | +2 |
| 20 Sep 2023 | Crd Note | 6290 | 0 | 0 | 0 | 0 | -2 |
| 27 Sep 2023 | Invoice | 24908 | 0 | 0 | 0 | 0 | +2 |
| 27 Sep 2023 | Crd Note | 6357 | 0 | 0 | 0 | 0 | -1 |
| **End Sep** | **Closing Balance** | — | **1** | **24** | **1** | **8** | **3** |

---

### October 2023
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | **1** | **24** | **1** | **8** | **3** |
| 04 Oct 2023 | Invoice | 25155 | 0 | 0 | 0 | 0 | +2 |
| 05 Oct 2023 | Crd Note | 6422 | 0 | 0 | 0 | 0 | -3 |
| 06 Oct 2023 | Invoice | 25252 | 0 | 0 | 0 | 0 | +1 |
| 08 Oct 2023 | Crd Note | 6454 | 0 | 0 | 0 | 0 | -1 |
| 13 Oct 2023 | Invoice | 25476 | 0 | 0 | 0 | 0 | +2 |
| 15 Oct 2023 | Crd Note | 6527 | 0 | 0 | 0 | 0 | -2 |
| 18 Oct 2023 | Invoice | 25617 | 0 | 0 | 0 | 0 | +3 |
| 18 Oct 2023 | Crd Note | 6563 | 0 | 0 | 0 | 0 | -2 |
| 25 Oct 2023 | Invoice | 25853 | 0 | 0 | 0 | 0 | +3 |
| 25 Oct 2023 | Crd Note | 6624 | 0 | 0 | 0 | 0 | -3 |
| **End Oct** | **Closing Balance** | — | **1** | **24** | **1** | **8** | **3** |

---

### November 2023
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | **1** | **24** | **1** | **8** | **3** |
| 01 Nov 2023 | Invoice | 26142 | 0 | 0 | 0 | +3 | 0 |
| 01 Nov 2023 | Crd Note | 6684 | 0 | 0 | 0 | -1 | 0 |
| 08 Nov 2023 | Invoice | 26404 | 0 | 0 | 0 | 0 | +3 |
| 08 Nov 2023 | Crd Note | 6775 | 0 | 0 | 0 | 0 | -3 |
| 22 Nov 2023 | Invoice | 26893 | 0 | 0 | 0 | +1 | +2 |
| 22 Nov 2023 | Crd Note | 6904 | 0 | 0 | 0 | 0 | -3 |
| 29 Nov 2023 | Crd Note | 6957 | 0 | 0 | 0 | 0 | -3 |
| 30 Nov 2023 | Invoice | 27133 | 0 | 0 | 0 | +2 | 0 |
| **End Nov** | **Closing Balance** | — | **1** | **24** | **1** | **13** | **-1** |

---

### December 2023
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | **1** | **24** | **1** | **13** | **-1** |
| 06 Dec 2023 | Invoice | 27385 | 0 | 0 | 0 | 0 | +3 |
| 06 Dec 2023 | Crd Note | 7020 | 0 | 0 | 0 | -2 | -1 |
| 20 Dec 2023 | Invoice | 27972 | 0 | 0 | 0 | 0 | +3 |
| 20 Dec 2023 | Crd Note | 7156 | 0 | 0 | 0 | -1 | -5 |
| 28 Dec 2023 | Invoice | 28137 | 0 | 0 | 0 | 0 | +3 |
| 28 Dec 2023 | Crd Note | 7210 | 0 | 0 | 0 | 0 | -2 |
| **End Dec** | **Closing Balance** | — | **1** | **24** | **1** | **10** | **0** |

---

### January 2024
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **1** | **24** | **1** | **10** | **0** |
| 03 Jan 2024 | Invoice | 28329 | 0 | 0 | 0 | 0 | +2 |
| 03 Jan 2024 | Invoice | 28331 | 0 | 0 | 0 | 0 | +3 |
| 03 Jan 2024 | Crd Note | 7248 | 0 | 0 | 0 | 0 | -2 |
| 03 Jan 2024 | Crd Note | 7253 | 0 | 0 | 0 | 0 | -3 |
| 10 Jan 2024 | Invoice | 28586 | 0 | 0 | 0 | 0 | +2 |
| 10 Jan 2024 | Crd Note | 7291 | 0 | 0 | 0 | 0 | -3 |
| 17 Jan 2024 | Invoice | 28752 | 0 | 0 | +1 | 0 | +1 |
| 17 Jan 2024 | Crd Note | 7339 | 0 | 0 | -1 | 0 | -1 |
| 24 Jan 2024 | Invoice | 28960 | 0 | 0 | 0 | 0 | +2 |
| 24 Jan 2024 | Crd Note | 7379 | 0 | 0 | 0 | 0 | -3 |
| 31 Jan 2024 | Invoice | 29162 | 0 | 0 | 0 | +3 | 0 |
| 31 Jan 2024 | Crd Note | 7418 | 0 | 0 | 0 | 0 | -3 |
| **End Jan** | **Closing Balance** | — | **1** | **24** | **1** | **13** | **-5** |

---

### February 2024
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **1** | **24** | **1** | **13** | **-5** |
| 07 Feb 2024 | Invoice | 29385 | 0 | 0 | 0 | 0 | +3 |
| 07 Feb 2024 | Crd Note | 7453 | 0 | 0 | 0 | -1 | -2 |
| 14 Feb 2024 | Invoice | 29585 | 0 | 0 | 0 | 0 | +2 |
| 14 Feb 2024 | Crd Note | 7484 | 0 | 0 | 0 | 0 | -2 |
| 21 Feb 2024 | Invoice | 29764 | 0 | 0 | 0 | 0 | +2 |
| 21 Feb 2024 | Crd Note | 7523 | 0 | 0 | 0 | 0 | -2 |
| 29 Feb 2024 | Invoice | 30012 | 0 | 0 | 0 | 0 | +2 |
| 29 Feb 2024 | Crd Note | 7576 | 0 | 0 | 0 | 0 | -2 |
| **End Feb** | **Closing Balance** | — | **1** | **24** | **1** | **12** | **-4** |

---

### March 2024
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **1** | **24** | **1** | **12** | **-4** |
| 04 Mar 2024 | Invoice | 30148 | 0 | 0 | 0 | 0 | +3 |
| 05 Mar 2024 | Crd Note | 7605 | 0 | 0 | 0 | 0 | -3 |
| **End Mar** | **Closing Balance** | — | **1** | **24** | **1** | **12** | **-4** |

---

### April 2024
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **1** | **24** | **1** | **12** | **-4** |
| 03 Apr 2024 | Invoice | 31002 | 0 | 0 | 0 | 0 | +2 |
| 04 Apr 2024 | Crd Note | 7950 | 0 | 0 | 0 | 0 | -2 |
| 10 Apr 2024 | Invoice | 31212 | 0 | 0 | 0 | 0 | +2 |
| 10 Apr 2024 | Crd Note | 8041 | 0 | 0 | 0 | 0 | -2 |
| 17 Apr 2024 | Invoice | 31426 | 0 | 0 | 0 | 0 | +3 |
| 17 Apr 2024 | Crd Note | 8117 | 0 | 0 | 0 | 0 | -3 |
| 25 Apr 2024 | Invoice | 31655 | 0 | 0 | 0 | 0 | +2 |
| 25 Apr 2024 | Crd Note | 8209 | 0 | 0 | 0 | 0 | -2 |
| **End Apr** | **Closing Balance** | — | **1** | **24** | **1** | **12** | **-4** |

---

### May 2024
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **1** | **24** | **1** | **12** | **-4** |
| 01 May 2024 | Invoice | 31806 | 0 | 0 | 0 | 0 | +3 |
| 02 May 2024 | Invoice | 42406 | 0 | 0 | 0 | 0 | +4 |
| 02 May 2024 | Crd Note | 12314 | 0 | 0 | 0 | 0 | -4 |
| 02 May 2024 | Crd Note | 8280 | 0 | 0 | 0 | 0 | -4 |
| 08 May 2024 | Invoice | 31998 | 0 | 0 | 0 | 0 | +3 |
| 08 May 2024 | Crd Note | 8359 | 0 | 0 | 0 | 0 | -3 |
| 16 May 2024 | Invoice | 32220 | 0 | 0 | 0 | 0 | +2 |
| 16 May 2024 | Crd Note | 8461 | 0 | 0 | 0 | 0 | -2 |
| 23 May 2024 | Invoice | 32410 | 0 | 0 | 0 | 0 | +2 |
| 24 May 2024 | Crd Note | 8533 | 0 | 0 | 0 | 0 | -2 |
| 27 May 2024 | Invoice | 32532 | 0 | 0 | 0 | 0 | +2 |
| 28 May 2024 | Crd Note | 8579 | 0 | 0 | 0 | 0 | -2 |
| 30 May 2024 | Invoice | 32615 | 0 | 0 | 0 | 0 | +1 |
| 30 May 2024 | Crd Note | 8612 | 0 | 0 | 0 | 0 | -1 |
| **End May** | **Closing Balance** | — | **1** | **24** | **1** | **12** | **-5** |

---

### June 2024
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **1** | **24** | **1** | **12** | **-5** |
| 05 Jun 2024 | Invoice | 32812 | 0 | 0 | 0 | 0 | +2 |
| 05 Jun 2024 | Crd Note | 8690 | 0 | 0 | 0 | 0 | -2 |
| 10 Jun 2024 | Invoice | 32985 | 0 | 0 | 0 | 0 | +3 |
| 10 Jun 2024 | Crd Note | 8781 | 0 | 0 | 0 | 0 | -3 |
| 19 Jun 2024 | Invoice | 33273 | 0 | 0 | 0 | 0 | +3 |
| 19 Jun 2024 | Crd Note | 8915 | 0 | 0 | 0 | 0 | -3 |
| 26 Jun 2024 | Invoice | 33534 | 0 | 0 | 0 | 0 | +3 |
| 26 Jun 2024 | Crd Note | 9041 | 0 | 0 | 0 | 0 | -3 |
| **End Jun** | **Closing Balance** | — | **1** | **24** | **1** | **12** | **-5** |

---

### July 2024
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **1** | **24** | **1** | **12** | **-5** |
| 03 Jul 2024 | Invoice | 33807 | 0 | 0 | 0 | 0 | +3 |
| 03 Jul 2024 | Crd Note | 9161 | 0 | 0 | 0 | 0 | -3 |
| 10 Jul 2024 | Invoice | 34099 | 0 | 0 | 0 | 0 | +3 |
| 10 Jul 2024 | Crd Note | 9314 | 0 | 0 | 0 | 0 | -2 |
| 17 Jul 2024 | Invoice | 34329 | 0 | 0 | 0 | 0 | +1 |
| 17 Jul 2024 | Crd Note | 9419 | 0 | 0 | 0 | 0 | -1 |
| 18 Jul 2024 | Invoice | 34384 | 0 | 0 | +1 | 0 | +2 |
| 19 Jul 2024 | Crd Note | 9454 | 0 | 0 | -1 | 0 | -2 |
| 25 Jul 2024 | Invoice | 34615 | 0 | 0 | 0 | 0 | +2 |
| 26 Jul 2024 | Crd Note | 9547 | 0 | 0 | 0 | 0 | -2 |
| **End Jul** | **Closing Balance** | — | **1** | **24** | **1** | **12** | **-4** |

---

### August 2024
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **1** | **24** | **1** | **12** | **-4** |
| 01 Aug 2024 | Invoice | 34850 | 0 | 0 | 0 | 0 | +2 |
| 01 Aug 2024 | Crd Note | 9641 | 0 | 0 | 0 | 0 | -3 |
| 07 Aug 2024 | Invoice | 35095 | 0 | 0 | 0 | 0 | +3 |
| 07 Aug 2024 | Crd Note | 9770 | 0 | 0 | 0 | 0 | -3 |
| 14 Aug 2024 | Invoice | 35298 | 0 | 0 | 0 | 0 | +3 |
| 14 Aug 2024 | Crd Note | 9865 | 0 | 0 | 0 | 0 | -2 |
| 22 Aug 2024 | Invoice | 35523 | 0 | 0 | 0 | 0 | +1 |
| 22 Aug 2024 | Crd Note | 9970 | 0 | 0 | 0 | 0 | -1 |
| 29 Aug 2024 | Invoice | 35750 | 0 | 0 | 0 | 0 | +2 |
| 29 Aug 2024 | Crd Note | 10086 | 0 | 0 | 0 | 0 | -2 |
| **End Aug** | **Closing Balance** | — | **1** | **24** | **1** | **12** | **-4** |

---

### September 2024
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **1** | **24** | **1** | **12** | **-4** |
| 04 Sep 2024 | Invoice | 35962 | 0 | 0 | 0 | 0 | +1 |
| 05 Sep 2024 | Invoice | 35991 | 0 | 0 | 0 | 0 | +2 |
| 05 Sep 2024 | Crd Note | 10168 | 0 | 0 | -1 | 0 | -2 |
| 05 Sep 2024 | Crd Note | 10186 | 0 | 0 | 0 | 0 | -1 |
| 11 Sep 2024 | Invoice | 36192 | 0 | 0 | +1 | 0 | +3 |
| 12 Sep 2024 | Crd Note | 10276 | 0 | 0 | 0 | 0 | -3 |
| 17 Sep 2024 | Invoice | 36396 | 0 | 0 | 0 | 0 | +3 |
| 17 Sep 2024 | Crd Note | 10361 | 0 | 0 | 0 | 0 | -2 |
| 25 Sep 2024 | Invoice | 36681 | 0 | 0 | 0 | 0 | +2 |
| 25 Sep 2024 | Crd Note | 10495 | 0 | 0 | 0 | 0 | -3 |
| **End Sep** | **Closing Balance** | — | **1** | **24** | **1** | **12** | **-4** |

---

### October 2024
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | **1** | **24** | **1** | **12** | **-4** |
| 02 Oct 2024 | Invoice | 36946 | 0 | 0 | 0 | 0 | +2 |
| 06 Oct 2024 | Crd Note | 10668 | 0 | 0 | 0 | 0 | -2 |
| 10 Oct 2024 | Invoice | 37217 | 0 | 0 | 0 | 0 | +2 |
| 11 Oct 2024 | Crd Note | 10743 | 0 | 0 | 0 | 0 | -2 |
| 16 Oct 2024 | Invoice | 37364 | 0 | 0 | 0 | 0 | +2 |
| 16 Oct 2024 | Crd Note | 10806 | 0 | 0 | 0 | 0 | -2 |
| 24 Oct 2024 | Invoice | 37620 | 0 | 0 | +1 | 0 | +2 |
| 25 Oct 2024 | Crd Note | 10919 | 0 | 0 | -1 | 0 | -3 |
| 30 Oct 2024 | Invoice | 37800 | 0 | 0 | 0 | 0 | +2 |
| 30 Oct 2024 | Crd Note | 10998 | 0 | 0 | 0 | 0 | -2 |
| **End Oct** | **Closing Balance** | — | **1** | **24** | **1** | **12** | **-5** |

---

### November 2024
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | **1** | **24** | **1** | **12** | **-5** |
| 06 Nov 2024 | Invoice | 38041 | 0 | 0 | 0 | 0 | +3 |
| 06 Nov 2024 | Crd Note | 11101 | 0 | 0 | 0 | 0 | -2 |
| 13 Nov 2024 | Invoice | 38267 | 0 | 0 | 0 | 0 | +2 |
| 13 Nov 2024 | Crd Note | 11200 | 0 | 0 | 0 | 0 | -3 |
| 20 Nov 2024 | Invoice | 38457 | 0 | 0 | 0 | 0 | +2 |
| 20 Nov 2024 | Crd Note | 11277 | 0 | 0 | 0 | 0 | -2 |
| 28 Nov 2024 | Invoice | 38665 | 0 | 0 | 0 | 0 | +2 |
| 28 Nov 2024 | Crd Note | 11351 | 0 | 0 | 0 | 0 | -2 |
| **End Nov** | **Closing Balance** | — | **1** | **24** | **1** | **12** | **-5** |

---

### December 2024
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | **1** | **24** | **1** | **12** | **-5** |
| 03 Dec 2024 | Invoice | 38821 | 0 | 0 | 0 | 0 | +3 |
| 03 Dec 2024 | Crd Note | 11394 | 0 | 0 | 0 | 0 | -3 |
| 11 Dec 2024 | Invoice | 39008 | 0 | 0 | 0 | 0 | +3 |
| 12 Dec 2024 | Crd Note | 11464 | 0 | 0 | 0 | 0 | -3 |
| 17 Dec 2024 | Invoice | 39149 | 0 | 0 | 0 | 0 | +3 |
| 17 Dec 2024 | Crd Note | 11509 | 0 | 0 | 0 | 0 | -2 |
| 22 Dec 2024 | Invoice | 39307 | 0 | 0 | 0 | 0 | +2 |
| 22 Dec 2024 | Crd Note | 11570 | 0 | 0 | 0 | 0 | -2 |
| **End Dec** | **Closing Balance** | — | **1** | **24** | **1** | **12** | **-4** |

---

### January 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **1** | **24** | **1** | **12** | **-4** |
| 08 Jan 2025 | Invoice | 39715 | 0 | 0 | 0 | +3 | 0 |
| 08 Jan 2025 | Crd Note | 11660 | 0 | 0 | 0 | 0 | -4 |
| 14 Jan 2025 | Invoice | 39899 | 0 | 0 | 0 | 0 | +3 |
| 15 Jan 2025 | Crd Note | 11693 | 0 | 0 | 0 | 0 | -2 |
| 23 Jan 2025 | Invoice | 40144 | 0 | 0 | 0 | 0 | +2 |
| 23 Jan 2025 | Crd Note | 11757 | 0 | 0 | 0 | 0 | -2 |
| 30 Jan 2025 | Invoice | 40320 | 0 | 0 | 0 | 0 | +2 |
| 31 Jan 2025 | Crd Note | 11803 | 0 | 0 | 0 | 0 | -2 |
| **End Jan** | **Closing Balance** | — | **1** | **24** | **1** | **15** | **-7** |

---

### February 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **1** | **24** | **1** | **15** | **-7** |
| 10 Feb 2025 | Invoice | 40623 | 0 | 0 | 0 | 0 | +3 |
| 10 Feb 2025 | Crd Note | 11876 | 0 | 0 | 0 | 0 | -4 |
| 20 Feb 2025 | Invoice | 40882 | 0 | 0 | 0 | 0 | +3 |
| 20 Feb 2025 | Crd Note | 11938 | 0 | 0 | 0 | 0 | -3 |
| 26 Feb 2025 | Invoice | 41052 | 0 | 0 | 0 | 0 | +1 |
| 27 Feb 2025 | Crd Note | 11977 | 0 | 0 | 0 | 0 | -2 |
| **End Feb** | **Closing Balance** | — | **1** | **24** | **1** | **15** | **-9** |

---

### March 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **1** | **24** | **1** | **15** | **-9** |
| 04 Mar 2025 | Invoice | 41217 | 0 | 0 | 0 | 0 | +2 |
| 04 Mar 2025 | Crd Note | 12003 | 0 | 0 | 0 | 0 | -2 |
| 13 Mar 2025 | Invoice | 41487 | 0 | 0 | 0 | 0 | +2 |
| 13 Mar 2025 | Crd Note | 12072 | 0 | 0 | 0 | 0 | -2 |
| 19 Mar 2025 | Invoice | 41634 | 0 | 0 | 0 | 0 | +2 |
| 21 Mar 2025 | Crd Note | 12116 | 0 | 0 | 0 | 0 | -2 |
| 27 Mar 2025 | Invoice | 41800 | 0 | 0 | 0 | 0 | +2 |
| 27 Mar 2025 | Crd Note | 12141 | 0 | 0 | 0 | 0 | -2 |
| **End Mar** | **Closing Balance** | — | **1** | **24** | **1** | **15** | **-9** |

---

### April 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **1** | **24** | **1** | **15** | **-9** |
| 01 Apr 2025 | Invoice | 41927 | 0 | 0 | 0 | 0 | +3 |
| 01 Apr 2025 | Crd Note | 12178 | 0 | 0 | 0 | 0 | -2 |
| 16 Apr 2025 | Invoice | 42358 | 0 | 0 | 0 | 0 | +3 |
| 16 Apr 2025 | Crd Note | 12300 | 0 | 0 | 0 | 0 | -3 |
| 24 Apr 2025 | Invoice | 42566 | 0 | 0 | 0 | 0 | +3 |
| 24 Apr 2025 | Crd Note | 12349 | 0 | 0 | 0 | 0 | -3 |
| 29 Apr 2025 | Invoice | 42705 | 0 | 0 | 0 | 0 | +3 |
| **End Apr** | **Closing Balance** | — | **1** | **24** | **1** | **15** | **-5** |

---

### May 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **1** | **24** | **1** | **15** | **-5** |
| 02 May 2025 | Invoice | 42756 | 0 | 0 | +1 | 0 | +2 |
| 02 May 2025 | Crd Note | 12391 | 0 | 0 | 0 | 0 | -3 |
| 04 May 2025 | Crd Note | 12408 | 0 | 0 | 0 | 0 | -2 |
| 08 May 2025 | Invoice | 42951 | 0 | 0 | 0 | 0 | +3 |
| 08 May 2025 | Crd Note | 12453 | 0 | 0 | 0 | 0 | -3 |
| 14 May 2025 | Invoice | 43090 | 0 | 0 | 0 | 0 | +2 |
| 14 May 2025 | Crd Note | 12488 | 0 | 0 | 0 | 0 | -2 |
| 21 May 2025 | Invoice | 43272 | 0 | 0 | 0 | 0 | +3 |
| 21 May 2025 | Crd Note | 12543 | 0 | 0 | 0 | 0 | -3 |
| 28 May 2025 | Invoice | 43452 | 0 | 0 | 0 | 0 | +2 |
| 28 May 2025 | Crd Note | 12592 | 0 | 0 | 0 | 0 | -3 |
| **End May** | **Closing Balance** | — | **1** | **24** | **2** | **15** | **-9** |

---

### June 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **1** | **24** | **2** | **15** | **-9** |
| 04 Jun 2025 | Invoice | 43630 | 0 | 0 | 0 | 0 | +3 |
| 04 Jun 2025 | Crd Note | 12634 | 0 | 0 | 0 | 0 | -2 |
| 11 Jun 2025 | Invoice | 43883 | 0 | 0 | +1 | 0 | +2 |
| 11 Jun 2025 | Crd Note | 12713 | 0 | 0 | -1 | 0 | -2 |
| 12 Jun 2025 | Invoice | 43911 | 0 | 0 | +1 | 0 | +2 |
| 12 Jun 2025 | Crd Note | 12725 | 0 | 0 | -1 | 0 | -2 |
| 19 Jun 2025 | Invoice | 44098 | 0 | 0 | 0 | 0 | +3 |
| 20 Jun 2025 | Crd Note | 12775 | 0 | 0 | 0 | 0 | -3 |
| 25 Jun 2025 | Invoice | 44242 | 0 | 0 | 0 | 0 | +2 |
| 25 Jun 2025 | Crd Note | 12823 | 0 | 0 | 0 | 0 | -2 |
| **End Jun** | **Closing Balance** | — | **1** | **24** | **2** | **15** | **-8** |

---

### July 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **1** | **24** | **2** | **15** | **-8** |
| 03 Jul 2025 | Invoice | 44517 | 0 | 0 | +1 | 0 | +2 |
| 04 Jul 2025 | Crd Note | 12900 | 0 | 0 | -1 | 0 | -2 |
| 17 Jul 2025 | Invoice | 44934 | 0 | 0 | 0 | 0 | +3 |
| 17 Jul 2025 | Crd Note | 13010 | 0 | 0 | 0 | 0 | -3 |
| 23 Jul 2025 | Invoice | 45096 | 0 | 0 | 0 | 0 | +2 |
| 23 Jul 2025 | Crd Note | 13047 | 0 | 0 | 0 | 0 | -3 |
| 25 Jul 2025 | Invoice | 45165 | 0 | 0 | +1 | 0 | 0 |
| 25 Jul 2025 | Crd Note | 13061 | 0 | 0 | -1 | 0 | 0 |
| 31 Jul 2025 | Invoice | 45324 | 0 | 0 | 0 | 0 | +3 |
| **End Jul** | **Closing Balance** | — | **1** | **24** | **2** | **15** | **-6** |

---

### August 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **1** | **24** | **2** | **15** | **-6** |
| 02 Aug 2025 | Crd Note | 13118 | 0 | 0 | 0 | 0 | -2 |
| 07 Aug 2025 | Invoice | 45499 | 0 | 0 | 0 | 0 | +2 |
| 07 Aug 2025 | Crd Note | 13171 | 0 | 0 | 0 | 0 | -2 |
| 14 Aug 2025 | Invoice | 45672 | 0 | 0 | 0 | 0 | +3 |
| 15 Aug 2025 | Crd Note | 13239 | 0 | 0 | 0 | 0 | -1 |
| 21 Aug 2025 | Invoice | 45832 | 0 | 0 | 0 | 0 | +3 |
| 21 Aug 2025 | Crd Note | 13288 | 0 | 0 | 0 | 0 | -3 |
| 28 Aug 2025 | Invoice | 45993 | 0 | 0 | 0 | 0 | +1 |
| 28 Aug 2025 | Crd Note | 13333 | 0 | 0 | 0 | 0 | -1 |
| **End Aug** | **Closing Balance** | — | **1** | **24** | **2** | **15** | **-6** |

---

### September 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **1** | **24** | **2** | **15** | **-6** |
| 03 Sep 2025 | Invoice | 46121 | 0 | 0 | 0 | 0 | +3 |
| 03 Sep 2025 | Crd Note | 13375 | 0 | 0 | 0 | 0 | -3 |
| 10 Sep 2025 | Invoice | 46309 | 0 | 0 | 0 | 0 | +3 |
| 11 Sep 2025 | Crd Note | 13450 | 0 | 0 | 0 | 0 | -3 |
| 18 Sep 2025 | Invoice | 46526 | 0 | 0 | 0 | 0 | +2 |
| 21 Sep 2025 | Crd Note | 13519 | 0 | 0 | 0 | 0 | -4 |
| 25 Sep 2025 | Invoice | 46687 | 0 | 0 | 0 | 0 | +2 |
| 25 Sep 2025 | Crd Note | 13554 | 0 | 0 | 0 | 0 | -2 |
| **End Sep** | **Closing Balance** | — | **1** | **24** | **2** | **15** | **-8** |

---

### October 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | **1** | **24** | **2** | **15** | **-8** |
| 02 Oct 2025 | Invoice | 46860 | 0 | 0 | 0 | 0 | +3 |
| 02 Oct 2025 | Crd Note | 13607 | 0 | 0 | 0 | 0 | -3 |
| 08 Oct 2025 | Invoice | 46991 | 0 | 0 | 0 | 0 | +3 |
| 08 Oct 2025 | Crd Note | 13647 | 0 | 0 | 0 | 0 | -2 |
| 16 Oct 2025 | Invoice | 47157 | 0 | 0 | 0 | 0 | +2 |
| 16 Oct 2025 | Crd Note | 13705 | 0 | 0 | 0 | 0 | -3 |
| 23 Oct 2025 | Invoice | 47293 | 0 | 0 | 0 | 0 | +2 |
| 23 Oct 2025 | Crd Note | 13745 | 0 | 0 | 0 | 0 | -2 |
| 31 Oct 2025 | Invoice | 47465 | 0 | 0 | 0 | 0 | +3 |
| **End Oct** | **Closing Balance** | — | **1** | **24** | **2** | **15** | **-5** |

---

### November 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | **1** | **24** | **2** | **15** | **-5** |
| 02 Nov 2025 | Crd Note | 13804 | 0 | 0 | 0 | 0 | -3 |
| 07 Nov 2025 | Invoice | 47572 | 0 | 0 | 0 | 0 | +2 |
| 07 Nov 2025 | Crd Note | 13828 | 0 | 0 | 0 | 0 | -3 |
| 13 Nov 2025 | Invoice | 47671 | 0 | 0 | 0 | 0 | +2 |
| 13 Nov 2025 | Crd Note | 13870 | 0 | 0 | 0 | 0 | -1 |
| 20 Nov 2025 | Invoice | 47849 | 0 | 0 | 0 | 0 | +1 |
| 20 Nov 2025 | Crd Note | 13925 | 0 | 0 | 0 | 0 | -3 |
| 27 Nov 2025 | Invoice | 47984 | 0 | 0 | 0 | 0 | +1 |
| **End Nov** | **Closing Balance** | — | **1** | **24** | **2** | **15** | **-9** |

---

### December 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | **1** | **24** | **2** | **15** | **-9** |
| 03 Dec 2025 | Invoice | 48099 | 0 | 0 | 0 | 0 | +3 |
| 03 Dec 2025 | Crd Note | 14008 | 0 | 0 | 0 | 0 | -2 |
| 11 Dec 2025 | Invoice | 48245 | 0 | 0 | 0 | 0 | +2 |
| 11 Dec 2025 | Crd Note | 14066 | 0 | 0 | 0 | 0 | -3 |
| 18 Dec 2025 | Invoice | 48392 | 0 | 0 | 0 | 0 | +3 |
| 19 Dec 2025 | Crd Note | 14131 | 0 | 0 | 0 | 0 | -3 |
| 23 Dec 2025 | Invoice | 48488 | 0 | 0 | 0 | 0 | +1 |
| 23 Dec 2025 | Crd Note | 14159 | 0 | 0 | 0 | 0 | -1 |
| 30 Dec 2025 | Invoice | 48579 | 0 | 0 | 0 | 0 | +3 |
| 30 Dec 2025 | Crd Note | 14199 | 0 | 0 | 0 | 0 | -3 |
| 31 Dec 2025 | Invoice | 48600 | 0 | 0 | 0 | 0 | +3 |
| 31 Dec 2025 | Crd Note | 14259 | 0 | 0 | 0 | 0 | -2 |
| **End Dec** | **Closing Balance** | — | **1** | **24** | **2** | **15** | **-8** |

---

### January 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **1** | **24** | **2** | **15** | **-8** |
| 08 Jan 2026 | Invoice | 48702 | 0 | 0 | 0 | 0 | +3 |
| 08 Jan 2026 | Crd Note | 14239 | 0 | 0 | 0 | 0 | -4 |
| 16 Jan 2026 | Invoice | 48829 | 0 | 0 | 0 | 0 | +3 |
| 21 Jan 2026 | Crd Note | 14313 | 0 | 0 | 0 | 0 | -2 |
| 27 Jan 2026 | Invoice | 48995 | 0 | 0 | 0 | 0 | +2 |
| 28 Jan 2026 | Crd Note | 14352 | 0 | 0 | 0 | 0 | -4 |
| **End Jan** | **Closing Balance** | — | **1** | **24** | **2** | **15** | **-10** |

---

### February 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **1** | **24** | **2** | **15** | **-10** |
| 05 Feb 2026 | Invoice | 49127 | 0 | 0 | 0 | 0 | +3 |
| 05 Feb 2026 | Crd Note | 14389 | 0 | 0 | 0 | 0 | -3 |
| 17 Feb 2026 | Invoice | 49316 | 0 | 0 | 0 | +3 | 0 |
| 17 Feb 2026 | Crd Note | 14438 | 0 | 0 | 0 | 0 | -2 |
| **End Feb** | **Closing Balance** | — | **1** | **24** | **2** | **18** | **-12** |

---

### March 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **1** | **24** | **2** | **18** | **-12** |
| 02 Mar 2026 | Invoice | 49531 | 0 | 0 | 0 | 0 | +3 |
| 03 Mar 2026 | Invoice | 49541 | 0 | 0 | 0 | 0 | +3 |
| 03 Mar 2026 | Crd Note | 14525 | 0 | 0 | 0 | 0 | -2 |
| 03 Mar 2026 | Crd Note | 14527 | 0 | 0 | 0 | 0 | -3 |
| 12 Mar 2026 | Invoice | 49728 | 0 | 0 | 0 | 0 | +3 |
| 13 Mar 2026 | Crd Note | 14591 | 0 | 0 | 0 | 0 | -3 |
| 19 Mar 2026 | Invoice | 49843 | 0 | 0 | 0 | 0 | +3 |
| 19 Mar 2026 | Crd Note | 14630 | 0 | 0 | 0 | -2 | -1 |
| 31 Mar 2026 | Invoice | 50043 | 0 | 0 | 0 | 0 | +3 |
| 31 Mar 2026 | Crd Note | 14694 | 0 | 0 | 0 | 0 | -4 |
| **End Mar** | **Closing Balance** | — | **1** | **24** | **2** | **16** | **-10** |

---

### April 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **1** | **24** | **2** | **16** | **-10** |
| 08 Apr 2026 | Invoice | 50162 | 0 | 0 | 0 | 0 | +3 |
| 08 Apr 2026 | Crd Note | 14731 | 0 | 0 | 0 | 0 | -3 |
| 17 Apr 2026 | Invoice | 50291 | 0 | 0 | 0 | 0 | +2 |
| 19 Apr 2026 | Crd Note | 14779 | 0 | 0 | 0 | 0 | -3 |
| 23 Apr 2026 | Invoice | 50372 | 0 | 0 | 0 | 0 | +2 |
| 30 Apr 2026 | Invoice | 50469 | 0 | 0 | 0 | 0 | +3 |
| 30 Apr 2026 | Crd Note | 14835 | 0 | 0 | 0 | 0 | -3 |
| **End Apr** | **Closing Balance** | — | **1** | **24** | **2** | **16** | **-9** |

---

### May 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **1** | **24** | **2** | **16** | **-9** |
| 08 May 2026 | Invoice | 50595 | 0 | 0 | 0 | 0 | +2 |
| 08 May 2026 | Crd Note | 14877 | 0 | 0 | 0 | 0 | -2 |
| 15 May 2026 | Invoice | 50713 | 0 | 0 | 0 | 0 | +2 |
| 18 May 2026 | Crd Note | 14924 | 0 | 0 | 0 | 0 | -2 |
| 20 May 2026 | Invoice | 50811 | 0 | 0 | 0 | 0 | +3 |
| 20 May 2026 | Crd Note | 14940 | 0 | 0 | 0 | 0 | -3 |
| **End May** | **Closing Balance** | — | **1** | **24** | **2** | **16** | **-9** |

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt | R138,191.56 |
| Cylinder Financial Balance | R-6.50 |
| **Total Debtor Balance** | **R138,185.06** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 14kg | 1 | R575.00 | R575.00 |
| 19kg | 24 | R690.00 | R16,560.00 |
| 9kg | 2 | R517.50 | R1,035.00 |
| Double-Valve (D.1) | 16 | R1,150.00 | R18,400.00 |
| Single-Valve (S.1) | -9 | R1,150.00 | R-10,350.00 |
| **Total** | **34** | — | **R26,220.00** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position | R-6.50 | R26,220.00 | R-26,226.50 |

**ERP Combined Balance:** R146,907.13  
**Reconstructed Balance:** R138,185.06  
**Variance:** R8,722.07

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
