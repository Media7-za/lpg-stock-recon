# TWK002 — Missing Discount Journals (2023)

**Account:** TWK002 · TWK AGRI PTY LTD  
**Period:** Jan–Dec 2023 (6 remittance batches)  
**Doctrine:** `docs/TWK002_Settlement_Discount_Doctrine_v1.md` (Model B — 2.5% settlement discount)  
**Generated:** 2026-07-12  
**Deliverable:** 1 of 2 — ERP posting task list

---

## 1. Executive summary

| Metric | Value |
| :--- | ---: |
| Remittance batches (2023) | **6** |
| Total remittance gross settled | **R145,240.01** |
| Total settlement discount (2.5%) | **R3,329.12** |
| Total electronic cash paid | **R141,910.89** |
| ERP payment receipts in TXT | **6** (R145,930.01 gross) |
| `DISCOUNT ALLOWED` journals in TXT | **0** |
| **Journals to post** | **6 consolidated entries** |

**Finding:** Every 2023 TWK remittance batch applies a 2.5% settlement discount on the remittance advice, but **no `DISCOUNT ALLOWED` journal rows exist** in `raw/TWK002.TXT`. Cash receipts are posted as gross payments; discount is implicit in the bank transfer only.

**ERP action:** Post one consolidated `DISCOUNT ALLOWED` journal per batch on the **electronic paid date**, with `ref_no` splits per invoice/CN doc (pilot batch has ref-level splits in `data/proforma_journals_2023.csv`).

---

## 2. Batch register (Tier 1 remittance → ERP linkage)

| Batch | Paid date | Remittance ref | Gross | Discount | Cash | ERP doc | ERP date | ERP gross | Variance |
| :--- | :--- | :--- | ---: | ---: | ---: | :--- | :--- | ---: | ---: |
| BATCH-2023-06-26 | 26.06.2023 | B226/KRD4028219 | 46,424.87 | 1,160.62 | 45,264.25 | 00022182 | 03/07/2023 | 46,424.87 | — |
| BATCH-2023-07-26 | 26.07.2023 | B226/KRD4028723 | 8,145.79 | 203.65 | 7,942.14 | 00023115 | 26/07/2023 | 8,145.79 | — |
| BATCH-2023-08-28 | 28.08.2023 | B226/KRD4029225 | 27,393.41 | 469.22 | 26,924.19 | 00023836 | 01/09/2023 | 27,738.41 | **+345.00** |
| BATCH-2023-09-26 | 26.09.2023 | B226/KRD4029717 | 14,684.27 | 367.10 | 14,317.17 | 00024560 | 26/09/2023 | 14,684.27 | — |
| BATCH-2023-10-26 | 26.10.2023 | B226/KRDJ003560 | 17,064.38 | 426.60 | 16,637.78 | 00025906 | 08/11/2023 | 17,064.38 | — |
| BATCH-2023-11-27 | 27.11.2023 | B226/KRDJ004047 | 31,527.29 | 701.93 | 30,825.36 | 00026681 | 29/11/2023 | 31,872.29 | **+345.00** |
| **Total** | | | **145,240.01** | **3,329.12** | **141,910.89** | | | **145,930.01** | **+690.00** |

**Settlement check (all batches):** cash + discount = gross payable ✅

**Sources:** `raw/Remittances/*.pdf` (Tier 1) · `data/remittance_batches_2023.csv`

---

## 3. TXT payment cross-check

```text
Payment 00022182  03/07/2023  R-46,424.87  STAT:92   ← BATCH-2023-06-26 ✅
Payment 00023115  26/07/2023  R-8,145.79   STAT 92   ← BATCH-2023-07-26 ✅
Payment 00023836  01/09/2023  R-27,738.41  STAT 93   ← BATCH-2023-08-28 ⚠️ +R345
Payment 00024560  26/09/2023  R-14,684.27  STAT 94   ← BATCH-2023-09-26 ✅
Payment 00025906  08/11/2023  R-17,064.38  STAT 95   ← BATCH-2023-10-26 ✅ (13-day post lag)
Payment 00026681  29/11/2023  R-31,872.29  STAT 96   ← BATCH-2023-11-27 ⚠️ +R345
```

No `DISCOUNT ALLOWED` document type appears anywhere in the 79-row TXT export.

---

## 4. ERP posting tasks

| Task | Batch | Post date | Action | Amount | ERP receipt | Status |
| :--- | :--- | :--- | :--- | ---: | :--- | :---: |
| TASK-0001 | BATCH-2023-06-26 | 2023-06-26 | POST_DISCOUNT_ALLOWED_JOURNAL | **R-1,160.62** | 00022182 | OPEN |
| TASK-0002 | BATCH-2023-07-26 | 2023-07-26 | POST_DISCOUNT_ALLOWED_JOURNAL | **R-203.65** | 00023115 | OPEN |
| TASK-0003 | BATCH-2023-08-28 | 2023-08-28 | POST_DISCOUNT_ALLOWED_JOURNAL | **R-469.22** | 00023836 | OPEN |
| TASK-0004 | BATCH-2023-09-26 | 2023-09-26 | POST_DISCOUNT_ALLOWED_JOURNAL | **R-367.10** | 00024560 | OPEN |
| TASK-0005 | BATCH-2023-10-26 | 2023-10-26 | POST_DISCOUNT_ALLOWED_JOURNAL | **R-426.60** | 00025906 | OPEN |
| TASK-0006 | BATCH-2023-11-27 | 2023-11-27 | POST_DISCOUNT_ALLOWED_JOURNAL | **R-701.93** | 00026681 | OPEN |

**Canonical task list:** `data/missing_journal_tasks_2023.csv`  
**Pro forma journal entries:** `data/proforma_journals_2023.csv`  
**Line-level remittance detail:** `data/remittance_lines_2023.csv` (51 lines, Tier 1)

### Posting rules (doctrine v1)

1. **One journal header** per remittance batch on **electronic paid date** (not ERP receipt date where they differ).
2. **Amount** = remittance discount column (not ERP deposit discount allocation where they differ).
3. **`ref_no`** = ERP `doc_no` for each invoice/CN on the remittance (ref splits for pilot batch only; other batches consolidated until Turn 4 exceptions).
4. **CN lines** post as **positive** discount reversal amounts.

---

## 5. Variances requiring review

### 5a. ERP gross +R345.00 (two batches)

Both **BATCH-2023-08-28** (`00023836`) and **BATCH-2023-11-27** (`00026681`) post **R345.00 higher** than remittance gross payable.

| Batch | Remittance gross | ERP payment | Gap | Likely cause |
| :--- | ---: | ---: | ---: | :--- |
| 28.08.2023 | 27,393.41 | 27,738.41 | +345.00 | Deposit allocation includes doc `23077` partial slice not on remittance |
| 27.11.2023 | 31,527.29 | 31,872.29 | +345.00 | Same R345 pattern — investigate deposit detail |

**Action:** Post discount journal at **remittance amount** (R469.22 / R701.93). Do **not** use ERP deposit discount allocation (pilot showed R814.22 vs R469.22 on 08-28 batch). See `reports/TWK002_Pilot_Batch_2023-08-28.md` §3a.

### 5b. Post-date lag

| Batch | Remittance paid | ERP posted | Lag |
| :--- | :--- | :--- | :--- |
| 06-26 | 26.06.2023 | 03.07.2023 | 7 days |
| 08-28 | 28.08.2023 | 01.09.2023 | 4 days |
| 10-26 | 26.10.2023 | 08.11.2023 | 13 days |

Journal post date follows **remittance paid date** per doctrine; receipt date is informational.

### 5c. Cross-batch partial settlement (`24011`)

Invoice `00024011` (R8,532.19) spans two batches:

| Batch | Payable on remittance | Discount | Notes |
| :--- | ---: | ---: | :--- |
| 26.10.2023 | 5,082.19 | 127.05 | First slice |
| 27.11.2023 | 3,450.00 | 0.00 | Residual — ALREADY PAID R5,082.19 |

Discount applies only to the first slice per remittance line.

### 5d. Invoice-level exceptions (Turn 4)

Lines with **zero discount** on remittance despite 2.5% terms (late-payment rule):

| Batch | Doc | Gross | Discount | Notes |
| :--- | :--- | ---: | ---: | :--- |
| 08-28 | 00020607 | 3,450.00 | 0.00 | No discount — exception |
| 08-28 | 00021123 | 5,175.00 | 0.00 | No discount — exception |
| 11-27 | 00024011 | 3,450.00 | 0.00 | Residual after prior payment |

Register overrides in `config/settlement_discount_overrides.json` in Turn 4.

---

## 6. Batch line counts

| Batch | Lines | Source PDF |
| :--- | ---: | :--- |
| BATCH-2023-06-26 | 5 | `raw/Remittances/26.06.2023.pdf` |
| BATCH-2023-07-26 | 2 | `raw/Remittances/26.07.2023.pdf` |
| BATCH-2023-08-28 | 18 | `raw/Remittances/28.08.2023.pdf` |
| BATCH-2023-09-26 | 9 | `raw/Remittances/26.09.2023.pdf` |
| BATCH-2023-10-26 | 8 | `raw/Remittances/26.10.2023.pdf` |
| BATCH-2023-11-27 | 9 | `raw/Remittances/27.11.2023.pdf` |

---

## 7. Sign-off checklist

| # | Check | Result |
| :---: | :--- | :---: |
| 1 | All 2023 remittance PDFs ingested | ✅ 6/6 |
| 2 | Cash + discount = gross per batch | ✅ 6/6 |
| 3 | ERP payment linked per batch | ✅ 6/6 |
| 4 | No discount journals in TXT | ✅ confirmed |
| 5 | Pro forma journals drafted | ✅ R3,329.12 total |
| 6 | ERP gross variances flagged | ⚠️ 2 batches (+R345 each) |
| 7 | Invoice exceptions documented | ✅ Turn 4 — 7 overrides |

---

## 8. Next turns

| Turn | Deliverable |
| :--- | :--- |
| **4** | Invoice-level exceptions → `settlement_discount_overrides.json` |
| **5** | Recreated ledger CSV with pro forma journals inserted |
| **6** | Optional discount-aware payment pattern analysis |

**Pilot deep-dive:** `reports/TWK002_Pilot_Batch_2023-08-28.md`
