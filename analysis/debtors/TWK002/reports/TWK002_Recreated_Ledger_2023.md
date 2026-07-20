# TWK002 — Recreated Ledger (2023)

**Account:** TWK002 · TWK AGRI PTY LTD  
**Turn:** 5 — Model B ledger reconstruction  
**Generated:** 2026-07-12  
**Output:** `data/recreated_ledger_2023.csv`

---

## 1. Purpose

The ERP TXT export posts **gross remittance settlements as single payment lines** but omits the separate **`DISCOUNT ALLOWED` journals** required under Model B (cash 97.5% + journal 2.5%).

This recreated ledger shows the **target state** after:

1. **Adjusting** six 2023 payment rows to **remittance cash** amounts
2. **Inserting** six pro forma consolidated `DISCOUNT ALLOWED` journals on **remittance paid dates**

All other TXT rows are unchanged (`source_type: erp_actual`).

---

## 2. Transformation summary

| Metric | ERP TXT | Recreated | Delta |
| :--- | ---: | ---: | ---: |
| Transaction rows | 79 | **85** (+6 journals) | +6 |
| 2023 payment total | R-145,930.01 | R-141,910.89 (cash) | +R3,329.12 |
| 2023 discount journals | R0.00 | **R-3,329.12** | R-3,329.12 |
| **2023 settlement effect** | R-145,930.01 | **R-145,240.01** | **+R690.00** |
| Closing balance (full ledger) | R87,226.46 | **R87,916.46** | **+R690.00** |
| Balance after last 2023 payment | R8,764.71 | **R9,454.71** | +R690.00 |

The **R690.00** closing delta equals the sum of ERP gross variances on receipts `00023836` and `00026681` (2 × R345.00). The recreated ledger reflects **remittance-authoritative** settlement; ERP over-posted those two receipts.

---

## 3. Payment bridge (Model B decomposition)

| Batch | Paid | ERP doc | ERP gross | → Cash | + Journal | = Gross | Variance |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 06-26 | 26.06 | 00022182 | -46,424.87 | -45,264.25 | -1,160.62 | -46,424.87 | — |
| 07-26 | 26.07 | 00023115 | -8,145.79 | -7,942.14 | -203.65 | -8,145.79 | — |
| 08-28 | 28.08 | 00023836 | -27,738.41 | -26,924.19 | -469.22 | -27,393.41 | +345 |
| 09-26 | 26.09 | 00024560 | -14,684.27 | -14,317.17 | -367.10 | -14,684.27 | — |
| 10-26 | 26.10 | 00025906 | -17,064.38 | -16,637.78 | -426.60 | -17,064.38 | — |
| 11-27 | 27.11 | 00026681 | -31,872.29 | -30,825.36 | -701.93 | -31,527.29 | +345 |

**Bridge CSV:** `data/recreated_ledger_payment_bridge_2023.csv`

Check: cash + journal = remittance gross for all six batches ✅

---

## 4. Pro forma journal rows inserted

| Pro forma doc | Batch | Post date | Amount | Linked receipt |
| :--- | :--- | :--- | ---: | :--- |
| PROFORMA-DJ-01 | BATCH-2023-06-26 | 26/06/2023 | R-1,160.62 | 00022182 |
| PROFORMA-DJ-02 | BATCH-2023-07-26 | 26/07/2023 | R-203.65 | 00023115 |
| PROFORMA-DJ-03 | BATCH-2023-08-28 | 28/08/2023 | R-469.22 | 00023836 |
| PROFORMA-DJ-04 | BATCH-2023-09-26 | 26/09/2023 | R-367.10 | 00024560 |
| PROFORMA-DJ-05 | BATCH-2023-10-26 | 26/10/2023 | R-426.60 | 00025906 |
| PROFORMA-DJ-06 | BATCH-2023-11-27 | 27/11/2023 | R-701.93 | 00026681 |

Journal format matches WES004/WO0001 convention: `ENTRY=Journal`, `REFERENCE=DISCOUNT ALLOWED`.

Ref-level splits remain in `data/proforma_journals_2023.csv` for ERP posting detail; recreated ledger uses **consolidated** journal headers only.

---

## 5. Chronology notes

| Event | ERP behaviour | Recreated behaviour |
| :--- | :--- | :--- |
| Journal post date | N/A (missing) | **Remittance paid date** per doctrine |
| Payment post date | ERP receipt date (may lag) | Unchanged — cash amount adjusted |
| Jun payment | Posted 03/07, gross | Journal 26/06; payment 03/07 at cash |
| Aug payment | Posted 01/09, R27,738.41 | Journal 28/08; payment 01/09 at R26,924.19 |
| Oct payment | Posted 08/11, gross | Journal 26/10; payment 08/11 at cash |

Settlement identity holds at batch level regardless of ERP post-date lag.

---

## 6. CSV schema

`data/recreated_ledger_2023.csv` columns:

| Column | Description |
| :--- | :--- |
| `line` | Recomputed sequence |
| `docno` / `entry` / `date` / `amount` / `balance` | TXT-compatible fields |
| `source_type` | `erp_actual` · `erp_adjusted_payment` · `proforma_journal` |
| `batch_id` | Remittance batch (payments + journals only) |
| `proforma_doc` | PROFORMA-DJ-xx for journal rows |
| `notes` | Adjustment rationale |

---

## 7. Sign-off

| # | Check | Result |
| :---: | :--- | :---: |
| 1 | All 6 payments decomposed to cash + journal | ✅ |
| 2 | Journal dates = remittance paid dates | ✅ |
| 3 | 2023 settlement = remittance gross R145,240.01 | ✅ |
| 4 | Closing delta explained (R690 ERP variance) | ✅ |
| 5 | Non-2023 rows unchanged | ✅ |

---

## 8. ERP posting sequence (finance ops)

For each batch, finance should:

1. **Adjust** existing payment to remittance **cash** (or verify bank deposit matches)
2. **Post** `DISCOUNT ALLOWED` journal per `data/missing_journal_tasks_2023.csv`
3. **Apply** ref splits from `data/proforma_journals_2023.csv`
4. **Respect** invoice exceptions in `config/settlement_discount_overrides.json`

After posting, live TXT should converge toward this recreated ledger (except the R690 variance on two receipts — separate deposit reconciliation).

---

## 9. Next turn

**Turn 6 (optional):** Discount-aware payment pattern analysis for full 2023 using recreated settlement totals.
