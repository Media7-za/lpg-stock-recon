# TWK002 — Recreated Ledger (2024)

**Account:** TWK002 · TWK AGRI PTY LTD  
**Model:** B (cash 97.5% + `DISCOUNT ALLOWED` journal 2.5%)  
**Generated:** 2026-07-12  
**Output:** `data/recreated_ledger_2024.csv`

---

## 1. Purpose

The 2024 TXT export (`raw/TWK0022024.TXT`) posts **10 remittance settlements** as payment headers. Five are **cash-only** (discount journals missing); five **over-post** (discount + orphan embedded in payment DISCOUNT column per deposit detail).

This recreated ledger shows the **target state** after:

1. **Adjusting** five over-post payments to **remittance cash**
2. **Inserting** ten pro forma consolidated `DISCOUNT ALLOWED` journals on **remittance paid dates**
3. **Excluding** partial journal `00000334` (R385.04) and duplicate payment ghost — superseded by full Oct journal

All other TXT rows are unchanged (`source_type: erp_actual`).

---

## 2. Transformation summary

| Metric | ERP TXT | Recreated | Delta |
| :--- | ---: | ---: | ---: |
| Transaction rows | 66 | **74** (+10 journals, −2 excluded) | +8 net |
| 10-batch payment total | R-288,138.18 | R-263,946.86 (cash) | +R24,191.32 |
| Discount journals | R-385.04 (partial) | **R-4,723.31** (+ Sep R233.10) | R-4,338.27 |
| **10-batch settlement** | R-288,523.22* | **R-268,670.17** | **+R19,853.05** |
| Closing balance (full ledger) | R38,791.27 | **R44,200.30** | **+R5,409.03** |

\*ERP 10-batch = payments + partial journal `00000334`.

The **R5,409.03** closing delta decomposes as:

| Component | Effect on balance |
| :--- | ---: |
| Strip orphan from 5 over-post payments | +R9,362.26 |
| Insert 10 pro forma journals | R-4,723.31 |
| Remove partial Oct journal + ghost line | +R770.08 |
| **Net** | **+R5,409.03** |

The recreated ledger reflects **remittance-authoritative** settlement; ERP over-credited debtor on five receipts by **R6,374.90** (orphan slices), partially offset by missing journals on cash-only batches.

---

## 3. Payment bridge (Model B decomposition)

| Batch | Paid | ERP doc | ERP gross | → Cash | + Journal | = Gross | Variance |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 03-26 | 26.03 | 00029684 | -77,692.03 | -73,610.18 | -506.36 | -74,116.54 | +3,575 |
| 04-26 | 26.04 | 00030419 | -28,428.84 | -28,428.84 | -375.10 | -28,803.94 | — |
| 05-27 | 27.05 | 00031365 | -11,721.10 | -11,721.10 | -300.54 | -12,021.64 | — |
| 06-26 | 26.06 | 00031558 | -39,057.53 | -37,294.98 | -956.28 | -38,251.26 | +806 |
| 07-26 | 26.07 | 00032332 | -18,061.64 | -16,737.35 | -429.16 | -17,166.51 | +895 |
| 08-26 | 26.08 | 00033224 | -22,338.84 | -21,197.32 | -543.52 | -21,740.84 | +598 |
| 09-26 | 26.09 | 00033921 | -2,984.27 | -2,984.27 | +233.10 | -2,751.17 | +233 |
| 10-26 | 26.10 | 00034518 | -38,338.45 | -38,338.45 | -983.04 | -39,321.49 | — |
| 11-26 | 26.11 | 00035263 | -22,581.72 | -21,529.67 | -552.04 | -22,081.71 | +500 |
| 12-27 | 27.12 | 00036195 | -12,104.70 | -12,104.70 | -310.37 | -12,415.07 | — |

**Bridge CSV:** `data/recreated_ledger_payment_bridge_2024.csv`

Check: cash + journal = remittance gross for all ten batches ✅

---

## 4. Pro forma journal rows inserted

| Pro forma doc | Batch | Post date | Amount | Linked receipt |
| :--- | :--- | :--- | ---: | :--- |
| PROFORMA-DJ-07 | BATCH-2024-03-26 | 26/03/2024 | R-506.36 | 00029684 |
| PROFORMA-DJ-08 | BATCH-2024-04-26 | 26/04/2024 | R-375.10 | 00030419 |
| PROFORMA-DJ-09 | BATCH-2024-05-27 | 27/05/2024 | R-300.54 | 00031365 |
| PROFORMA-DJ-10 | BATCH-2024-06-26 | 26/06/2024 | R-956.28 | 00031558 |
| PROFORMA-DJ-11 | BATCH-2024-07-26 | 26/07/2024 | R-429.16 | 00032332 |
| PROFORMA-DJ-12 | BATCH-2024-08-26 | 26/08/2024 | R-543.52 | 00033224 |
| PROFORMA-DJ-13 | BATCH-2024-09-26 | 26/09/2024 | R+233.10 | 00033921 |
| PROFORMA-DJ-14 | BATCH-2024-10-26 | 26/10/2024 | R-983.04 | 00034518 |
| PROFORMA-DJ-15 | BATCH-2024-11-26 | 26/11/2024 | R-552.04 | 00035263 |
| PROFORMA-DJ-16 | BATCH-2024-12-27 | 27/12/2024 | R-310.37 | 00036195 |

Journal format: `ENTRY=Journal`, `REFERENCE=DISCOUNT ALLOWED`.  
Ref-level splits in `data/proforma_journals_2024.csv`.

**Sep batch note:** Net negative consolidated discount → journal posts **positive** R233.10 (CN reversals exceed invoice discounts on remittance).

**Oct batch note:** Target journal R-983.04 **replaces** partial ERP journal `00000334` (R-385.04). Finance should reverse partial and post full consolidated amount.

---

## 5. Excluded / out-of-scope rows

| Row | Treatment | Reason |
| :--- | :--- | :--- |
| `00000334` Journal R-385.04 | Excluded | Superseded by PROFORMA-DJ-14 R-983.04 |
| `00034518` Payment R-385.04 | Excluded | Erroneous duplicate (discount as payment line) |
| `00037732` Payment R-10,430.79 | Unchanged | Orphan receipt — reversed by Bank UD |
| `00036467` Payment R-4,398.27 | Unchanged | Jan-2025 STAT 110 — outside 2024 remittance set |

---

## 6. Chronology notes

| Event | ERP behaviour | Recreated behaviour |
| :--- | :--- | :--- |
| Journal post date | Missing (9) / partial (1) | **Remittance paid date** per doctrine |
| Over-post payments | Gross = cash + disc + orphan | Payment at **cash**; journal at remittance disc |
| Cash-only payments | Cash correct; journal missing | Cash unchanged; journal inserted |
| Nov payment | ERP posted 10/12 | Journal 26/11; payment date unchanged |
| Mar payment | ERP posted 27/03 | Journal 26/03; payment 27/03 at cash |

---

## 7. CSV schema

`data/recreated_ledger_2024.csv` columns:

| Column | Description |
| :--- | :--- |
| `line` | Recomputed sequence |
| `docno` / `entry` / `date` / `amount` / `balance` | TXT-compatible fields |
| `source_type` | `erp_actual` · `erp_adjusted_payment` · `proforma_journal` |
| `batch_id` | Remittance batch (payments + journals only) |
| `proforma_doc` | PROFORMA-DJ-07…16 for journal rows |
| `notes` | Adjustment rationale |

**Build script:** `scripts/build_recreated_ledger_2024.py`

---

## 8. Sign-off

| # | Check | Result |
| :---: | :--- | :---: |
| 1 | All 10 batches decomposed to cash + journal | ✅ |
| 2 | Journal dates = remittance paid dates | ✅ |
| 3 | 5 over-post payments adjusted to cash | ✅ |
| 4 | 10-batch settlement = remittance gross R268,669.17 | ✅ (ΔR1 rounding) |
| 5 | Closing delta R5,409.03 explained | ✅ |
| 6 | Orphan receipts excluded / unchanged | ✅ |

---

## 9. ERP posting sequence (finance ops)

For each batch:

1. **Adjust** over-post payments to remittance **cash** (five receipts)
2. **Post** `DISCOUNT ALLOWED` journal per `data/missing_journal_tasks_2024.csv`
3. **Apply** ref splits from `data/proforma_journals_2024.csv`
4. **Oct:** Reverse partial `00000334` (R385.04); post full R983.04
5. **Respect** invoice exceptions in `config/settlement_discount_overrides.json`

After posting, live TXT should converge toward this recreated ledger. Residual **R6,374.90** orphan on five deposits requires deposit discount correction per `reports/TWK002_Overpost_Investigation_2024.md`.

---

## 10. Related artifacts

| File | Purpose |
| :--- | :--- |
| `data/recreated_ledger_2024.csv` | Target ledger (74 rows) |
| `data/recreated_ledger_payment_bridge_2024.csv` | Batch payment decomposition |
| `data/deposit_detail_2024.csv` | Confirmed deposit allocations |
| `reports/TWK002_Overpost_Investigation_2024.md` | Orphan root-cause analysis |
