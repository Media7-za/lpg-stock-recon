# FIR001 — Ingest Coverage Report

**Generated:** 2026-10-08 · **Display status:** `CURRENT_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/FIR001/raw/FIR001_2026-10-08.TXT` |
| TXT as-at (last period row) | 2026-10-07 |
| Header sync as-at | 2026-10-08 |
| Items sync as-at | 2026-10-08 |
| ingestFreshness | `current` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 355 |
| Healthy / expected | 351 |
| Gaps | 4 |
| DB-only (not in TXT) | 304 |

## Gate result

| Lane | Status |
| :--- | :--- |
| Financial balance from TXT | ALLOWED |
| Custody / Part 2 qty | BLOCKED |
| SKU analysis | BLOCKED |
| Allocation | BLOCKED |

## Document gaps

| Doc | Type | Date | Class | Blocks |
| :--- | :--- | :--- | :--- | :--- |
| 17570 | Payment | 2022-12-29 | MISSING_HEADER | custody, sku_analysis, allocation |
| 17151 | Invoice | 2023-01-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17655 | Payment | 2023-01-06 | MISSING_HEADER | custody, sku_analysis, allocation |
| 17274 | Invoice | 2023-01-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17786 | Payment | 2023-01-18 | MISSING_HEADER | custody, sku_analysis, allocation |
| 17367 | Invoice | 2023-01-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17849 | Payment | 2023-01-24 | MISSING_HEADER | custody, sku_analysis, allocation |
| 17460 | Invoice | 2023-02-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18011 | Payment | 2023-02-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17613 | Invoice | 2023-02-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17614 | Invoice | 2023-02-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4533 | Crd Note | 2023-02-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18162 | Payment | 2023-02-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18162 | Payment | 2023-02-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17760 | Invoice | 2023-02-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18208 | Invoice | 2023-03-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18842 | Payment | 2023-03-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18845 | Payment | 2023-03-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18532 | Invoice | 2023-03-16 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19169 | Payment | 2023-03-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18831 | Invoice | 2023-03-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19435 | Payment | 2023-04-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19195 | Invoice | 2023-04-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20127 | Payment | 2023-04-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19493 | Invoice | 2023-04-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19498 | Invoice | 2023-04-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19515 | Invoice | 2023-04-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4754 | Crd Note | 2023-04-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4758 | Crd Note | 2023-04-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20348 | Payment | 2023-04-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19844 | Invoice | 2023-05-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19863 | Invoice | 2023-05-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4830 | Crd Note | 2023-05-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20494 | Payment | 2023-05-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20064 | Invoice | 2023-05-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20082 | Invoice | 2023-05-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20797 | Payment | 2023-05-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20442 | Invoice | 2023-05-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20444 | Invoice | 2023-05-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5004 | Crd Note | 2023-05-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21092 | Payment | 2023-05-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20736 | Invoice | 2023-05-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20739 | Invoice | 2023-05-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5072 | Crd Note | 2023-05-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21452 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21085 | Invoice | 2023-06-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22197 | Payment | 2023-06-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21527 | Invoice | 2023-06-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21528 | Invoice | 2023-06-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5285 | Crd Note | 2023-06-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22187 | Payment | 2023-06-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21881 | Invoice | 2023-06-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21883 | Invoice | 2023-06-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5383 | Crd Note | 2023-06-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22008 | Invoice | 2023-07-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22011 | Invoice | 2023-07-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5437 | Crd Note | 2023-07-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22655 | Payment | 2023-07-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22656 | Payment | 2023-07-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22410 | Invoice | 2023-07-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22411 | Invoice | 2023-07-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5541 | Crd Note | 2023-07-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22850 | Payment | 2023-07-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22700 | Invoice | 2023-07-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22713 | Invoice | 2023-07-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5642 | Crd Note | 2023-07-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23104 | Payment | 2023-07-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23049 | Invoice | 2023-08-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23050 | Invoice | 2023-08-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5759 | Crd Note | 2023-08-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23402 | Payment | 2023-08-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23434 | Invoice | 2023-08-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23435 | Invoice | 2023-08-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5877 | Crd Note | 2023-08-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23634 | Payment | 2023-08-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23614 | Invoice | 2023-08-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23615 | Invoice | 2023-08-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5955 | Crd Note | 2023-08-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23779 | Payment | 2023-08-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23904 | Invoice | 2023-08-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23905 | Invoice | 2023-08-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6036 | Crd Note | 2023-08-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23985 | Payment | 2023-09-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24192 | Invoice | 2023-09-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24193 | Invoice | 2023-09-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6136 | Crd Note | 2023-09-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24249 | Payment | 2023-09-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24653 | Invoice | 2023-09-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24654 | Invoice | 2023-09-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6280 | Crd Note | 2023-09-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24565 | Payment | 2023-09-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24864 | Invoice | 2023-09-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24865 | Invoice | 2023-09-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6342 | Crd Note | 2023-09-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24721 | Payment | 2023-09-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25148 | Invoice | 2023-10-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25149 | Invoice | 2023-10-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6427 | Crd Note | 2023-10-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24989 | Payment | 2023-10-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25423 | Invoice | 2023-10-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25424 | Invoice | 2023-10-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6514 | Crd Note | 2023-10-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25252 | Payment | 2023-10-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25690 | Invoice | 2023-10-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25691 | Invoice | 2023-10-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6582 | Crd Note | 2023-10-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25904 | Payment | 2023-10-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26037 | Invoice | 2023-10-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26038 | Invoice | 2023-10-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6671 | Crd Note | 2023-10-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26331 | Invoice | 2023-11-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26332 | Invoice | 2023-11-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6748 | Crd Note | 2023-11-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26088 | Payment | 2023-11-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26567 | Invoice | 2023-11-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26568 | Invoice | 2023-11-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6808 | Crd Note | 2023-11-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26293 | Payment | 2023-11-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26296 | Payment | 2023-11-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26896 | Invoice | 2023-11-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26897 | Invoice | 2023-11-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6906 | Crd Note | 2023-11-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26676 | Payment | 2023-11-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27208 | Invoice | 2023-12-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27209 | Invoice | 2023-12-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6977 | Crd Note | 2023-12-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27391 | Invoice | 2023-12-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27392 | Invoice | 2023-12-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7028 | Crd Note | 2023-12-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27348 | Payment | 2023-12-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27342 | Payment | 2023-12-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27770 | Invoice | 2023-12-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27771 | Invoice | 2023-12-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27800 | Invoice | 2023-12-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27801 | Invoice | 2023-12-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7131 | Crd Note | 2023-12-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7132 | Crd Note | 2023-12-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7133 | Crd Note | 2023-12-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27947 | Invoice | 2023-12-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27951 | Invoice | 2023-12-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7153 | Crd Note | 2023-12-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7177 | Crd Note | 2023-12-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28088 | Invoice | 2023-12-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28089 | Invoice | 2023-12-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7198 | Crd Note | 2023-12-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28472 | Invoice | 2024-01-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28473 | Invoice | 2024-01-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7276 | Crd Note | 2024-01-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27957 | Payment | 2024-01-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27957 | Payment | 2024-01-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27957 | Payment | 2024-01-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28764 | Invoice | 2024-01-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28905 | Invoice | 2024-01-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28906 | Invoice | 2024-01-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7362 | Crd Note | 2024-01-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28322 | Payment | 2024-01-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29206 | Invoice | 2024-02-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29207 | Invoice | 2024-02-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7428 | Crd Note | 2024-02-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28573 | Payment | 2024-02-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28814 | Payment | 2024-02-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29472 | Invoice | 2024-02-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29473 | Invoice | 2024-02-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7466 | Crd Note | 2024-02-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28813 | Payment | 2024-02-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29719 | Invoice | 2024-02-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29869 | Invoice | 2024-02-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29256 | Payment | 2024-03-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30070 | Invoice | 2024-03-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30084 | Invoice | 2024-03-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29506 | Payment | 2024-03-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30292 | Invoice | 2024-03-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30298 | Invoice | 2024-03-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30529 | Invoice | 2024-03-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29692 | Payment | 2024-03-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29692 | Payment | 2024-03-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29692 | Payment | 2024-03-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29681 | Payment | 2024-03-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29681 | Payment | 2024-03-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30781 | Invoice | 2024-03-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30018 | Payment | 2024-03-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30978 | Invoice | 2024-04-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29997 | Payment | 2024-04-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31275 | Invoice | 2024-04-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30221 | Payment | 2024-04-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31496 | Invoice | 2024-04-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30416 | Payment | 2024-04-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31684 | Invoice | 2024-04-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30533 | Payment | 2024-05-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31897 | Invoice | 2024-05-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30634 | Payment | 2024-05-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32256 | Invoice | 2024-05-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32363 | Invoice | 2024-05-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30918 | Payment | 2024-05-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30918 | Payment | 2024-05-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32674 | Invoice | 2024-06-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31333 | Payment | 2024-06-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32913 | Invoice | 2024-06-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32972 | Invoice | 2024-06-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36306 | Payment | 2024-06-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36306 | Payment | 2024-06-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36306 | Payment | 2024-06-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36306 | Payment | 2024-06-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36306 | Payment | 2024-06-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36306 | Payment | 2024-06-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36306 | Payment | 2024-06-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36306 | Payment | 2024-06-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36306 | Payment | 2024-06-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36306 | Payment | 2024-06-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36306 | Payment | 2024-06-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36306 | Payment | 2024-06-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36306 | Payment | 2024-06-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36306 | Payment | 2024-06-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36306 | Payment | 2024-06-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33256 | Invoice | 2024-06-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31467 | Payment | 2024-06-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33404 | Invoice | 2024-06-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31853 | Payment | 2024-06-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33715 | Invoice | 2024-07-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31831 | Payment | 2024-07-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33921 | Invoice | 2024-07-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32133 | Payment | 2024-07-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34193 | Invoice | 2024-07-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34414 | Invoice | 2024-07-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32344 | Payment | 2024-07-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34463 | Invoice | 2024-07-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 9460 | Crd Note | 2024-07-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32337 | Payment | 2024-07-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34633 | Invoice | 2024-07-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32611 | Payment | 2024-08-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32613 | Payment | 2024-08-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34860 | Invoice | 2024-08-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34928 | Invoice | 2024-08-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 9686 | Crd Note | 2024-08-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34993 | Invoice | 2024-08-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35008 | Invoice | 2024-08-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 9706 | Crd Note | 2024-08-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32607 | Payment | 2024-08-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35152 | Invoice | 2024-08-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32852 | Payment | 2024-08-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35360 | Invoice | 2024-08-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35572 | Invoice | 2024-08-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33237 | Payment | 2024-08-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35863 | Invoice | 2024-09-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33394 | Payment | 2024-09-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36105 | Invoice | 2024-09-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33395 | Payment | 2024-09-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36298 | Invoice | 2024-09-16 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33624 | Payment | 2024-09-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36449 | Invoice | 2024-09-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33611 | Payment | 2024-09-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36624 | Invoice | 2024-09-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33824 | Payment | 2024-09-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33992 | Payment | 2024-10-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36963 | Invoice | 2024-10-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33990 | Payment | 2024-10-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 37195 | Invoice | 2024-10-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 37323 | Invoice | 2024-10-16 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34134 | Payment | 2024-10-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34136 | Payment | 2024-10-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 37622 | Invoice | 2024-10-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34559 | Payment | 2024-10-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 37797 | Invoice | 2024-10-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34546 | Payment | 2024-11-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38046 | Invoice | 2024-11-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34685 | Payment | 2024-11-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38318 | Invoice | 2024-11-16 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35219 | Payment | 2024-11-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38453 | Invoice | 2024-11-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35220 | Payment | 2024-11-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38662 | Invoice | 2024-11-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35221 | Payment | 2024-12-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11403 | Crd Note | 2024-12-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38829 | Invoice | 2024-12-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35781 | Payment | 2024-12-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39797 | Invoice | 2024-12-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11538 | Crd Note | 2024-12-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39225 | Invoice | 2024-12-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35754 | Payment | 2024-12-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39436 | Invoice | 2024-12-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39668 | Invoice | 2025-01-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39669 | Invoice | 2025-01-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11647 | Crd Note | 2025-01-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11673 | Crd Note | 2025-01-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39800 | Invoice | 2025-01-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39801 | Invoice | 2025-01-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36256 | Payment | 2025-01-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40028 | Invoice | 2025-01-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36504 | Payment | 2025-01-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40213 | Invoice | 2025-01-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36476 | Payment | 2025-01-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36476 | Payment | 2025-01-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36476 | Payment | 2025-01-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36476 | Payment | 2025-01-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36476 | Payment | 2025-01-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36476 | Payment | 2025-01-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40500 | Invoice | 2025-02-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40501 | Invoice | 2025-02-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11841 | Crd Note | 2025-02-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36784 | Payment | 2025-02-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11907 | Crd Note | 2025-02-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40762 | Invoice | 2025-02-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40763 | Invoice | 2025-02-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11949 | Crd Note | 2025-02-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36963 | Payment | 2025-02-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40940 | Invoice | 2025-02-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40941 | Invoice | 2025-02-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36959 | Payment | 2025-02-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
