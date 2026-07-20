# TWK002 — ERP Linkage Report (2024)

**Source:** `raw/TWK0022024.TXT` (export label: 2025 MARCH)  
**Generated:** 2026-07-12

---

## 1. Summary

| Metric | Value |
| :--- | ---: |
| Remittance batches linked | **10 / 10** |
| STAT range | STAT 100 → STAT 109 |
| Exact cash match (ERP payment = remittance cash) | **5** |
| Cash-only ERP posting (discount journal missing) | **5** |
| ERP over-post vs remittance gross | **5** batches |
| Discount journals in ERP | **1 partial** (`00000334` R385.04) |
| Still to post | **R4,338.27** |

---

## 2. Batch linkage table

| Batch | Paid | ERP doc | ERP date | STAT | Remit. cash | ERP gross | ERP Δ gross | Match type |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | ---: | :--- |
| 03-26 | 26.03 | 00029684 | 27.03 | STAT 100 | 73,610.18 | 77,692.03 | +3,575.49 | Over-post |
| 04-26 | 26.04 | 00030419 | 25.04 | STAT 101 | 28,428.84 | 28,428.84 | −375.10 | Cash-only ✅ |
| 05-27 | 27.05 | 00031365 | 27.05 | STAT 102 | 11,721.10 | 11,721.10 | −300.54 | Cash-only ✅ |
| 06-26 | 26.06 | 00031558 | 26.06 | STAT 103 | 37,294.98 | 39,057.53 | +806.27 | Over-post |
| 07-26 | 26.07 | 00032332 | 30.07 | STAT 104 | 16,737.35 | 18,061.64 | +895.13 | Over-post |
| 08-26 | 26.08 | 00033224 | 26.08 | STAT 105 | 21,197.32 | 22,338.84 | +598.00 | Over-post |
| 09-26 | 26.09 | 00033921 | 26.09 | STAT 106 | 2,984.27 | 2,984.27 | +233.10 | Cash-only ✅ |
| 10-26 | 26.10 | 00034518 | 26.10 | STAT 107 | 38,338.45 | 38,338.45 | −983.04 | Cash-only ✅ |
| 11-26 | 26.11 | 00035263 | 10.12 | STAT 108 | 21,529.67 | 22,581.72 | +500.01 | Over-post |
| 12-27 | 27.12 | 00036195 | 27.12 | STAT 109 | 12,104.70 | 12,104.70 | −310.37 | Cash-only ✅ |

**Negative ERP Δ** = payment equals remittance **cash**; discount not embedded in payment (journal missing).

**Machine-readable:** `data/erp_linkage_2024.csv`

---

## 3. Orphan / reversed ERP rows

| Doc | Type | Date | Amount | Notes |
| :--- | :--- | :--- | ---: | :--- |
| 00037732 | Payment | 23.07.2024 | −10,430.79 | Reversed by Bank UD +10,430.79 (STAT:105) — net zero |
| 00000334 | Journal | 26.10.2024 | −385.04 | Partial `DISCOUNT ALLOWED` for Oct batch (remittance R983.04) |
| 00036467 | Payment | 31.01.2025 | −4,398.27 | STAT 110 — partial 2025 payment, outside 2024 remittance set |

---

## 4. 2024 ERP pattern vs 2023

| Year | Dominant ERP behaviour |
| :--- | :--- |
| **2023** | Gross payment posted (cash + discount combined in one line) |
| **2024** | **Cash-only** payment on 5 batches; discount journals mostly missing; 5 batches over-post vs gross |

Oct batch `00034518` posts cash correctly but also has a duplicate STAT 107 line for R385.04 labelled `DISCOUNT ALLOWED` inside the payment block — only **39%** of remittance discount posted.

---

## 5. Open actions

1. Post remaining discount journals — `data/missing_journal_tasks_2024.csv`
2. Investigate Mar/Jun/Jul/Aug/Nov **over-post** variances (deposit allocation?)
3. Reconcile reversed payment `00037732`

**Combined 2023–2024 discount still to post:** R8,052.43 − R385.04 posted = **R7,667.39**
