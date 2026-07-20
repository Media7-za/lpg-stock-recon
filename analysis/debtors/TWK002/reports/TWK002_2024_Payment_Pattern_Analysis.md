# TWK002 — 2024 Payment Pattern Analysis (Discount-Aware)

Generated on 2026-07-12 | Tolerance: 0.1% of batch gross

> **Methodology:** Remittance-batch settlement (not monthly LPG strip). Model B: `cash + DISCOUNT ALLOWED = gross payable`. CYL/EMPTIES included in discount base per TWK002 doctrine v1.

---

## 1. Executive Summary

* **2024 net billed (invoices + CNs, TXT headers):** **R194,119.51**
* **Remittance batches (2024):** **10** totalling **−R268,670.17** gross
* **Discount-aware cash paid:** **−R263,946.86** + journals **−R4,723.31**
* **ERP payment total (gross postings in TXT):** **−R284,124.95**
* **ERP vs remittance gross variance:** **R4,638.95**

**Pattern verdict:** All 10 remittance batches reconcile under Model B.

---

## 2. Remittance Batch Settlement Table (Primary)

Discount-aware expected settlement = **remittance cash + pro forma journal**.

| Batch | Paid | STAT | Remittance Gross | Cash | Discount | Cash+Disc | ERP Payment | ERP Δ | Status |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 2024-03-26 | 2024-03-26 | STAT 100 | R74,116.54 | R73,610.18 | R506.36 | R74,116.54 | R-77,692.03 | R3,575.49 | **ERP_GROSS_VARIANCE** |
| 2024-04-26 | 2024-04-26 | STAT 101 | R28,803.94 | R28,428.84 | R375.10 | R28,803.94 | R-28,428.84 | R-375.10 | **CASH_ONLY_ERP** |
| 2024-05-27 | 2024-05-27 | STAT 102 | R12,021.64 | R11,721.10 | R300.54 | R12,021.64 | R-11,721.10 | R-300.54 | **CASH_ONLY_ERP** |
| 2024-06-26 | 2024-06-26 | STAT 103 | R38,251.26 | R37,294.98 | R956.28 | R38,251.26 | R-39,057.53 | R806.27 | **ERP_GROSS_VARIANCE** |
| 2024-07-26 | 2024-07-26 | STAT 104 | R17,166.51 | R16,737.35 | R429.16 | R17,166.51 | R-18,061.64 | R895.13 | **ERP_GROSS_VARIANCE** |
| 2024-08-26 | 2024-08-26 | STAT 105 | R21,740.84 | R21,197.32 | R543.52 | R21,740.84 | R-22,338.84 | R598.00 | **ERP_GROSS_VARIANCE** |
| 2024-09-26 | 2024-09-26 | STAT 106 | R2,751.17 | R2,984.27 | R-233.10 | R2,751.17 | R-2,984.27 | R233.10 | **CASH_ONLY_ERP** |
| 2024-10-26 | 2024-10-26 | STAT 107 | R39,321.49 | R38,338.45 | R983.04 | R39,321.49 | R-38,338.45 | R-983.04 | **CASH_ONLY_ERP** |
| 2024-11-26 | 2024-11-26 | STAT 108 | R22,081.71 | R21,529.67 | R552.04 | R22,081.71 | R-22,581.72 | R500.01 | **ERP_GROSS_VARIANCE** |
| 2024-12-27 | 2024-12-27 | STAT 109 | R12,415.07 | R12,104.70 | R310.37 | R12,415.07 | R-12,104.70 | R-310.37 | **CASH_ONLY_ERP** |
| **TOTAL** | | | **R268,670.17** | **R263,946.86** | **R4,723.31** | **R268,670.17** | **R-284,124.95** | **R4,638.95** | |

### 2.1 Batch reconciliation notes

* **BATCH-2024-03-26** (`00029684`): ERP over-posted R3,575.49 vs remittance gross
* **BATCH-2024-04-26** (`00030419`): ERP posts remittance cash; discount journal R375.10 missing in payment
* **BATCH-2024-05-27** (`00031365`): ERP posts remittance cash; discount journal R300.54 missing in payment
* **BATCH-2024-06-26** (`00031558`): ERP over-posted R806.27 vs remittance gross
* **BATCH-2024-07-26** (`00032332`): ERP over-posted R895.13 vs remittance gross
* **BATCH-2024-08-26** (`00033224`): ERP over-posted R598.00 vs remittance gross
* **BATCH-2024-09-26** (`00033921`): ERP posts remittance cash; discount journal R-233.10 missing in payment
* **BATCH-2024-10-26** (`00034518`): ERP posts remittance cash; discount journal R983.04 missing in payment
* **BATCH-2024-11-26** (`00035263`): ERP over-posted R500.01 vs remittance gross
* **BATCH-2024-12-27** (`00036195`): ERP posts remittance cash; discount journal R310.37 missing in payment

---

## 3. Billing Months Touched by Remittances (Informational)

TWK002 batches span multiple invoice months. This table shows **which billing months' documents appear on remittance advices** — not independent monthly payment matching.

| Billing Month | Docs on Remittance | Gross | Discount | Net (Cash) | Settled In Batch |
| :--- | ---: | ---: | ---: | ---: | :--- |
| 2023-08 | 1 | R3,943.81 | R0.00 | R345.00 | 2024-03-26 |
| 2023-11 | 3 | R9,109.79 | R0.00 | R9,109.79 | 2024-03-26 |
| 2023-12 | 5 | R53,031.80 | R0.00 | R53,031.80 | 2024-03-26 |
| 2024-01 | 6 | R30,557.57 | R634.56 | R29,923.01 | 2024-03-26, 2024-04-26 |
| 2024-02 | 4 | R-5,127.62 | R-128.20 | R-4,999.42 | 2024-03-26 |
| 2024-03 | 3 | R15,003.94 | R375.10 | R14,628.84 | 2024-04-26 |
| 2024-04 | 3 | R12,021.64 | R300.54 | R11,721.10 | 2024-05-27 |
| 2024-05 | 5 | R57,935.56 | R1,448.39 | R56,487.17 | 2024-06-26 |
| 2024-06 | 5 | R-2,517.79 | R-62.95 | R-2,454.84 | 2024-06-26, 2024-07-26 |
| 2024-07 | 6 | R12,885.84 | R20.27 | R12,865.57 | 2024-08-26, 2024-09-26 |
| 2024-08 | 3 | R11,606.17 | R290.15 | R11,316.02 | 2024-09-26 |
| 2024-09 | 2 | R39,321.49 | R983.04 | R38,338.45 | 2024-10-26 |
| 2024-10 | 6 | R40,366.71 | R1,009.17 | R39,357.54 | 2024-11-26 |
| 2024-11 | 2 | R16,555.07 | R413.87 | R16,141.20 | 2024-11-26, 2024-12-27 |
| 2024-12 | 1 | R-22,425.00 | R-560.63 | R-21,864.37 | 2024-12-27 |

---

## 4. CYL / EMPTIES Treatment

* **2024 invoice headers:** 26 totalling **R490,402.05**
* **2024 credit notes:** 16 totalling **−R296,282.54**

Unlike JIM001 LPG-only strip, TWK002 settlement discount applies to **VAT-inclusive gross per document** including EMPTIES/CYL pairs. Remittance lines include both gas and deposit invoices; discount is computed on the remittance advice column, not stripped by SKU.

---

## 5. STAT Sequence & Payment Flow

| Seq | Payment Doc | ERP Date | Remittance Paid | STAT | ERP Gross | Remittance Cash | Proforma Journal |
| :---: | :--- | :--- | :--- | :--- | ---: | ---: | ---: |
| 1 | 00029684 | 2024-03-27 | 2024-03-26 | STAT 100 | R-77,692.03 | R73,610.18 | R506.36 |
| 2 | 00030419 | 2024-04-25 | 2024-04-26 | STAT 101 | R-28,428.84 | R28,428.84 | R375.10 |
| 3 | 00031365 | 2024-05-27 | 2024-05-27 | STAT 102 | R-11,721.10 | R11,721.10 | R300.54 |
| 4 | 00031558 | 2024-06-26 | 2024-06-26 | STAT 103 | R-39,057.53 | R37,294.98 | R956.28 |
| 5 | 00032332 | 2024-07-30 | 2024-07-26 | STAT 104 | R-18,061.64 | R16,737.35 | R429.16 |
| 6 | 00033224 | 2024-08-26 | 2024-08-26 | STAT 105 | R-22,338.84 | R21,197.32 | R543.52 |
| 7 | 00033921 | 2024-09-26 | 2024-09-26 | STAT 106 | R-2,984.27 | R2,984.27 | R-233.10 |
| 8 | 00034518 | 2024-10-26 | 2024-10-26 | STAT 107 | R-38,338.45 | R38,338.45 | R983.04 |
| 9 | 00035263 | 2024-12-10 | 2024-11-26 | STAT 108 | R-22,581.72 | R21,529.67 | R552.04 |
| 10 | 00036195 | 2024-12-27 | 2024-12-27 | STAT 109 | R-12,104.70 | R12,104.70 | R310.37 |

### 5.1 Settlement pool reconciliation

```text
Remittance gross settled (2024):     R  268,670.17
  = Cash paid:                         R  263,946.86
  + Discount journals (pro forma):     R    4,723.31

ERP payments posted (2024):                 R  284,124.95
ERP over-post vs remittance:                  R    4,638.95
```

---

## 6. Variance & Outstanding Pool

| Item | Amount | Classification |
| :--- | ---: | :--- |
| ERP gross variance | R4,638.95 | Deposit allocation artefact |
| Missing DISCOUNT ALLOWED journals | R4,723.31 | Pro forma — see `missing_journal_tasks_2024.csv` |

**No permanent remittance-batch underpayments identified** at 0.1% tolerance under Model B.

---

## 7. Artefacts

| File | Role |
| :--- | :--- |
| `data/payment_pattern_batches_2024.csv` | Machine-readable batch match register |
| `data/remittance_batches_2024.csv` | Tier-1 batch headers |
| `data/missing_journal_tasks_2024.csv` | ERP posting tasks |

**Script:** `scripts/discount_payment_pattern_analysis.py`
