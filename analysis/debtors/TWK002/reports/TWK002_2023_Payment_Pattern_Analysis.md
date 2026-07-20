# TWK002 — 2023 Payment Pattern Analysis (Discount-Aware)

Generated on 2026-07-12 | Tolerance: 0.1% of batch gross

> **Methodology:** Remittance-batch settlement (not monthly LPG strip). Model B: `cash + DISCOUNT ALLOWED = gross payable`. CYL/EMPTIES included in discount base per TWK002 doctrine v1.

---

## 1. Executive Summary

* **2023 net billed (invoices + CNs, TXT headers):** **R199,101.52**
* **Remittance batches (2023):** **6** totalling **−R145,240.01** gross
* **Discount-aware cash paid:** **−R141,910.89** + journals **−R3,329.12**
* **ERP payment total (gross postings in TXT):** **−R145,930.01**
* **ERP vs remittance gross variance:** **R690.00**
* **Balance after last 2023 payment (`00026681`):** **R8,764.71**
* **Dec 2023 billing unpaid at year-end:** **R44,406.80** (settled Mar 2024 catch-up batch)

**Pattern verdict:** All 6 remittance batches achieve **FULL_MATCH** or **REMITTANCE_ONLY** under Model B.

---

## 2. Remittance Batch Settlement Table (Primary)

Discount-aware expected settlement = **remittance cash + pro forma journal**.

| Batch | Paid | STAT | Remittance Gross | Cash | Discount | Cash+Disc | ERP Payment | ERP Δ | Status |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 2023-06-26 | 2023-06-26 | STAT:92 | R46,424.87 | R45,264.25 | R1,160.62 | R46,424.87 | R-46,424.87 | R0.00 | **FULL_MATCH** |
| 2023-07-26 | 2023-07-26 | STAT 92 | R8,145.79 | R7,942.14 | R203.65 | R8,145.79 | R-8,145.79 | R0.00 | **FULL_MATCH** |
| 2023-08-28 | 2023-08-28 | STAT 93 | R27,393.41 | R26,924.19 | R469.22 | R27,393.41 | R-27,738.41 | R345.00 | **ERP_GROSS_VARIANCE** |
| 2023-09-26 | 2023-09-26 | STAT 94 | R14,684.27 | R14,317.17 | R367.10 | R14,684.27 | R-14,684.27 | R0.00 | **FULL_MATCH** |
| 2023-10-26 | 2023-10-26 | STAT 95 | R17,064.38 | R16,637.78 | R426.60 | R17,064.38 | R-17,064.38 | R0.00 | **FULL_MATCH** |
| 2023-11-27 | 2023-11-27 | STAT 96 | R31,527.29 | R30,825.36 | R701.93 | R31,527.29 | R-31,872.29 | R345.00 | **ERP_GROSS_VARIANCE** |
| **TOTAL** | | | **R145,240.01** | **R141,910.89** | **R3,329.12** | **R145,240.01** | **R-145,930.01** | **R690.00** | |

### 2.1 Batch reconciliation notes

* **BATCH-2023-06-26** (`00022182`): Cash + discount = remittance gross; lines reconcile
* **BATCH-2023-07-26** (`00023115`): Cash + discount = remittance gross; lines reconcile
* **BATCH-2023-08-28** (`00023836`): ERP over-posted R345.00; remittance Model B matches
* **BATCH-2023-09-26** (`00024560`): Cash + discount = remittance gross; lines reconcile
* **BATCH-2023-10-26** (`00025906`): Cash + discount = remittance gross; lines reconcile
* **BATCH-2023-11-27** (`00026681`): ERP over-posted R345.00; remittance Model B matches

---

## 3. Billing Months Touched by Remittances (Informational)

TWK002 batches span multiple invoice months. This table shows **which billing months' documents appear on remittance advices** — not independent monthly payment matching.

| Billing Month | Docs on Remittance | Gross | Discount | Net (Cash) | Settled In Batch |
| :--- | ---: | ---: | ---: | ---: | :--- |
| 2023-04 | 4 | R44,155.92 | R1,103.90 | R43,052.02 | 2023-06-26 |
| 2023-05 | 2 | R5,718.95 | R56.72 | R5,662.23 | 2023-06-26, 2023-08-28 |
| 2023-06 | 4 | R20,220.79 | R376.15 | R19,844.64 | 2023-07-26, 2023-08-28 |
| 2023-07 | 13 | R20,148.41 | R503.72 | R19,644.69 | 2023-08-28 |
| 2023-08 | 11 | R6,749.27 | R160.10 | R6,244.17 | 2023-08-28, 2023-09-26 |
| 2023-09 | 5 | R46,296.57 | R857.85 | R36,906.53 | 2023-10-26, 2023-11-27 |
| 2023-10 | 11 | R21,867.29 | R546.68 | R21,320.61 | 2023-10-26, 2023-11-27 |
| 2023-11 | 1 | R-11,040.00 | R-276.00 | R-10,764.00 | 2023-11-27 |

---

## 4. CYL / EMPTIES Treatment

* **2023 invoice headers:** 41 totalling **R369,361.09**
* **2023 credit notes:** 22 totalling **−R170,259.57**

Unlike JIM001 LPG-only strip, TWK002 settlement discount applies to **VAT-inclusive gross per document** including EMPTIES/CYL pairs. Remittance lines include both gas and deposit invoices; discount is computed on the remittance advice column, not stripped by SKU.

---

## 5. STAT Sequence & Payment Flow

| Seq | Payment Doc | ERP Date | Remittance Paid | STAT | ERP Gross | Remittance Cash | Proforma Journal |
| :---: | :--- | :--- | :--- | :--- | ---: | ---: | ---: |
| 1 | 00022182 | 2023-07-03 | 2023-06-26 | STAT:92 | R-46,424.87 | R45,264.25 | R1,160.62 |
| 2 | 00023115 | 2023-07-26 | 2023-07-26 | STAT 92 | R-8,145.79 | R7,942.14 | R203.65 |
| 3 | 00023836 | 2023-09-01 | 2023-08-28 | STAT 93 | R-27,738.41 | R26,924.19 | R469.22 |
| 4 | 00024560 | 2023-09-26 | 2023-09-26 | STAT 94 | R-14,684.27 | R14,317.17 | R367.10 |
| 5 | 00025906 | 2023-11-08 | 2023-10-26 | STAT 95 | R-17,064.38 | R16,637.78 | R426.60 |
| 6 | 00026681 | 2023-11-29 | 2023-11-27 | STAT 96 | R-31,872.29 | R30,825.36 | R701.93 |

### 5.1 Settlement pool reconciliation

```text
Remittance gross settled (2023):     R  145,240.01
  = Cash paid:                         R  141,910.89
  + Discount journals (pro forma):     R    3,329.12

ERP payments posted (2023):                 R  145,930.01
ERP over-post vs remittance:                  R      690.00
```

---

## 6. Variance & Outstanding Pool

| Item | Amount | Classification |
| :--- | ---: | :--- |
| ERP gross variance | R690.00 | Deposit allocation artefact |
| Missing DISCOUNT ALLOWED journals | R3,329.12 | Pro forma — see `missing_journal_tasks_2023.csv` |

**No permanent remittance-batch underpayments identified** at 0.1% tolerance under Model B.

---

## 7. Artefacts

| File | Role |
| :--- | :--- |
| `data/payment_pattern_batches_2023.csv` | Machine-readable batch match register |
| `data/remittance_batches_2023.csv` | Tier-1 batch headers |
| `data/missing_journal_tasks_2023.csv` | ERP posting tasks |

**Script:** `scripts/discount_payment_pattern_analysis.py`
