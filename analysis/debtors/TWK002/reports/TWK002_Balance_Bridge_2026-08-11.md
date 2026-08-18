# TWK002 — B/F → current balance bridge

**Generated:** 2026-08-11  
**Source:** `raw/DEBENQ_TWK002.TXT`

---

## Summary

| Measure | R |
| :--- | ---: |
| BALANCE B/F | 38,791.27 |
| ERP CURRENT BALANCE (TWK002) | 118,131.54 |
| Σ open invoice Due (11 lines) | 110,046.87 |
| **Account-level balance (primary)** | **8,084.67** |
| Site adjustments | 0.00 |
| **Balance due (statement)** | **118,131.54** |

## Ledger roll-forward

| Component | R |
| :--- | ---: |
| BALANCE B/F | 38,791.27 |
| + Invoices (all, export window) | 845,581.17 |
| + Credits/settlements (tagged to open invoices) | -138,115.00 |
| + Credits/settlements (tagged to closed/override) | -578,574.85 |
| + Untagged settlements | -49,551.05 |
| + Phantom CN mirrors (no Invoice row) | 9,894.01 |
| **= CURRENT BALANCE** | **118,131.54** |
| Identity check | PASS |

## Account-level balance — ratified bridge lines

These lines sum to **Balance due − Σ open invoices** and appear on the customer statement.

| Label | R | Reference |
| :--- | ---: | :--- |
| Opening balance and settled-period residual (not on invoice list below) | 57,635.72 | Net of B/F R38,791.27 and export-window activity on invoices not in the open table — see TWK002_Balance_Gap_Investigation_2026-08-11.md |
| Untagged settlements (STAT payment slices and discount journals) | -49,551.05 | ERP posted with blank INVNO — 00037770 (−R35,693.84), 00039080 (−R7,306.68), 00043500 (−R1,249.77), Path B journals 00000507–509 |
| **Total (must equal Balance due − Σ open)** | **8,084.67** | |
| Open invoice subtotal | 110,046.87 | 11 lines below |
| **Balance due** | **118,131.54** | |

## Row classification (export window)

| Bucket | R |
| :--- | ---: |
| open_invoice | 110,046.87 |
| closed_invoice | 0.00 |
| override_invoice | 8,950.44 |
| untagged_settlement | -49,551.05 |
| phantom_cn | 9,894.01 |
| other | 0.00 |

## Untagged settlements (detail)

| Date | Doc | Entry | Amount (R) |
| :--- | :--- | :--- | ---: |
| 2025-03-28 | 00037770 | Payment | -35,693.84 |
| 2025-05-30 | 00039080 | Payment | -7,306.68 |
| 2026-02-25 | 00043500 | Payment | -1,249.77 |
| 2026-07-12 | 00000491 | Journal | -203.65 |
| 2026-07-12 | 00000491 | Journal | -367.10 |
| 2026-07-12 | 00000491 | Journal | -426.60 |
| 2026-07-12 | 00000491 | Journal | -469.22 |
| 2026-07-12 | 00000491 | Journal | -701.93 |
| 2026-07-12 | 00000491 | Journal | -1,160.62 |
| 2026-07-23 | 00000499 | Journal | -375.10 |
| 2026-07-23 | 00000499 | Journal | -552.04 |
| 2026-07-23 | 00000500 | Journal | -300.54 |
| 2026-07-23 | 00000501 | Journal | -983.04 |
| 2026-07-23 | 00000502 | Journal | -310.37 |
| 2026-08-09 | 00000507 | Journal | -112.78 |
| 2026-08-09 | 00000508 | Journal | -228.93 |
| 2026-08-09 | 00000509 | Journal | -393.99 |
