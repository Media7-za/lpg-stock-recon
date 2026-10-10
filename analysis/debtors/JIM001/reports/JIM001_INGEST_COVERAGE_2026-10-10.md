# JIM001 — Ingest Coverage Report

**Generated:** 2026-10-10 · **Display status:** `CURRENT_PARTIAL`

## Summary

| Field | Value |
| :--- | :--- |
| Statement TXT | `analysis/debtors/JIM001/raw/JIM001_2026-10-10.TXT` |
| TXT as-at (last period row) | 2026-06-05 |
| Header sync as-at | 2026-10-08 |
| Items sync as-at | 2026-10-08 |
| ingestFreshness | `current` |
| ingestCoverage | `partial` |
| Documents in TXT (period) | 212 |
| Healthy / expected | 211 |
| Gaps | 1 |
| DB-only (not in TXT) | 633 |

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
| 44686 | Payment | 2022-05-16 | MISSING_HEADER | custody, sku_analysis, allocation |
| 13518 | Invoice | 2022-05-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 13563 | Invoice | 2022-05-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 13571 | Invoice | 2022-05-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 3602 | Crd Note | 2022-05-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 13637 | Invoice | 2022-05-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 3617 | Crd Note | 2022-05-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 13685 | Invoice | 2022-05-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 13744 | Invoice | 2022-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 13745 | Invoice | 2022-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 3641 | Crd Note | 2022-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14135 | Payment | 2022-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 13822 | Invoice | 2022-06-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 13823 | Invoice | 2022-06-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 3653 | Crd Note | 2022-06-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 13877 | Invoice | 2022-06-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 13937 | Invoice | 2022-06-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 13968 | Invoice | 2022-06-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14049 | Invoice | 2022-06-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14116 | Invoice | 2022-06-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14788 | Invoice | 2022-06-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14341 | Invoice | 2022-06-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14279 | Invoice | 2022-07-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14353 | Invoice | 2022-07-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14521 | Invoice | 2022-07-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14654 | Invoice | 2022-07-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14663 | Invoice | 2022-07-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 3790 | Crd Note | 2022-07-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15071 | Payment | 2022-07-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15071 | Payment | 2022-07-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15071 | Payment | 2022-07-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15071 | Payment | 2022-07-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15071 | Payment | 2022-07-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15071 | Payment | 2022-07-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15071 | Payment | 2022-07-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15071 | Payment | 2022-07-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14744 | Invoice | 2022-07-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14916 | Invoice | 2022-08-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 3791 | Crd Note | 2022-08-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 14994 | Invoice | 2022-08-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15004 | Invoice | 2022-08-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 3817 | Crd Note | 2022-08-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15473 | Payment | 2022-08-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15473 | Payment | 2022-08-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15473 | Payment | 2022-08-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15473 | Payment | 2022-08-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15473 | Payment | 2022-08-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15473 | Payment | 2022-08-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15473 | Payment | 2022-08-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15189 | Invoice | 2022-08-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15191 | Invoice | 2022-08-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15192 | Invoice | 2022-08-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 3901 | Crd Note | 2022-08-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 3906 | Crd Note | 2022-08-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15343 | Invoice | 2022-08-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15345 | Invoice | 2022-08-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15346 | Invoice | 2022-08-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 3963 | Crd Note | 2022-08-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 3964 | Crd Note | 2022-08-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15360 | Invoice | 2022-08-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 3966 | Crd Note | 2022-08-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 3967 | Crd Note | 2022-08-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 3969 | Crd Note | 2022-08-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15423 | Invoice | 2022-09-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15431 | Invoice | 2022-09-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 3999 | Crd Note | 2022-09-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15490 | Invoice | 2022-09-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15491 | Invoice | 2022-09-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15556 | Invoice | 2022-09-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15560 | Invoice | 2022-09-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15987 | Payment | 2022-09-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15987 | Payment | 2022-09-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15987 | Payment | 2022-09-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15987 | Payment | 2022-09-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15987 | Payment | 2022-09-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4034 | Crd Note | 2022-09-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4035 | Crd Note | 2022-09-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15623 | Invoice | 2022-09-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15626 | Invoice | 2022-09-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4068 | Crd Note | 2022-09-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15782 | Invoice | 2022-09-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15801 | Invoice | 2022-09-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4112 | Crd Note | 2022-09-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15865 | Invoice | 2022-10-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 15953 | Invoice | 2022-10-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16019 | Invoice | 2022-10-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16125 | Invoice | 2022-10-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16128 | Invoice | 2022-10-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16648 | Payment | 2022-10-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16648 | Payment | 2022-10-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16648 | Payment | 2022-10-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16648 | Payment | 2022-10-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16648 | Payment | 2022-10-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4209 | Crd Note | 2022-10-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4210 | Crd Note | 2022-10-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16185 | Invoice | 2022-10-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16200 | Invoice | 2022-10-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4225 | Crd Note | 2022-10-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16308 | Invoice | 2022-11-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16316 | Invoice | 2022-11-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4255 | Crd Note | 2022-11-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4256 | Crd Note | 2022-11-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16397 | Invoice | 2022-11-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16400 | Invoice | 2022-11-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16419 | Invoice | 2022-11-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16420 | Invoice | 2022-11-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16421 | Invoice | 2022-11-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4276 | Crd Note | 2022-11-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16505 | Invoice | 2022-11-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16557 | Invoice | 2022-11-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17073 | Payment | 2022-11-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17073 | Payment | 2022-11-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17073 | Payment | 2022-11-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17073 | Payment | 2022-11-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16647 | Invoice | 2022-11-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4336 | Crd Note | 2022-11-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4337 | Crd Note | 2022-11-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16648 | Invoice | 2022-12-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16649 | Invoice | 2022-12-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16718 | Invoice | 2022-12-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16723 | Invoice | 2022-12-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16724 | Invoice | 2022-12-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4349 | Crd Note | 2022-12-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4350 | Crd Note | 2022-12-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16826 | Invoice | 2022-12-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16830 | Invoice | 2022-12-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4377 | Crd Note | 2022-12-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 16934 | Invoice | 2022-12-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17076 | Invoice | 2022-12-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17578 | Payment | 2022-12-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17578 | Payment | 2022-12-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17578 | Payment | 2022-12-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17578 | Payment | 2022-12-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17578 | Payment | 2022-12-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17578 | Payment | 2022-12-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4419 | Crd Note | 2022-12-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17014 | Invoice | 2022-12-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17028 | Invoice | 2022-12-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17132 | Invoice | 2022-12-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4441 | Crd Note | 2023-01-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17191 | Invoice | 2023-01-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17256 | Invoice | 2023-01-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17777 | Payment | 2023-01-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17777 | Payment | 2023-01-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17777 | Payment | 2023-01-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17777 | Payment | 2023-01-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17357 | Invoice | 2023-01-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17369 | Invoice | 2023-01-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17458 | Invoice | 2023-02-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4514 | Crd Note | 2023-02-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17581 | Invoice | 2023-02-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18185 | Payment | 2023-02-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18185 | Payment | 2023-02-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18185 | Payment | 2023-02-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18185 | Payment | 2023-02-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18185 | Payment | 2023-02-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18185 | Payment | 2023-02-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 17769 | Invoice | 2023-02-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18062 | Invoice | 2023-03-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18299 | Invoice | 2023-03-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18507 | Invoice | 2023-03-16 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19176 | Payment | 2023-03-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19176 | Payment | 2023-03-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19176 | Payment | 2023-03-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19176 | Payment | 2023-03-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18695 | Invoice | 2023-03-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 18696 | Invoice | 2023-03-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4634 | Crd Note | 2023-03-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19153 | Invoice | 2023-04-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19347 | Invoice | 2023-04-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19349 | Invoice | 2023-04-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4725 | Crd Note | 2023-04-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4726 | Crd Note | 2023-04-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19494 | Invoice | 2023-04-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19499 | Invoice | 2023-04-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4759 | Crd Note | 2023-04-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19697 | Invoice | 2023-04-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19698 | Invoice | 2023-04-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4799 | Crd Note | 2023-04-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20357 | Payment | 2023-05-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20357 | Payment | 2023-05-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20357 | Payment | 2023-05-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19924 | Invoice | 2023-05-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 19928 | Invoice | 2023-05-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4859 | Crd Note | 2023-05-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20117 | Invoice | 2023-05-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20124 | Invoice | 2023-05-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4908 | Crd Note | 2023-05-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20356 | Invoice | 2023-05-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20358 | Invoice | 2023-05-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 4977 | Crd Note | 2023-05-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20630 | Invoice | 2023-05-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21193 | Payment | 2023-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20864 | Invoice | 2023-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 20873 | Invoice | 2023-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5101 | Crd Note | 2023-06-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21098 | Invoice | 2023-06-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21111 | Invoice | 2023-06-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5151 | Crd Note | 2023-06-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21341 | Invoice | 2023-06-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21346 | Invoice | 2023-06-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5235 | Crd Note | 2023-06-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21561 | Invoice | 2023-06-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21564 | Invoice | 2023-06-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5299 | Crd Note | 2023-06-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21756 | Invoice | 2023-06-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 21763 | Invoice | 2023-06-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5356 | Crd Note | 2023-06-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22050 | Invoice | 2023-07-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22051 | Invoice | 2023-07-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5440 | Crd Note | 2023-07-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22332 | Invoice | 2023-07-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22337 | Invoice | 2023-07-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22566 | Invoice | 2023-07-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22569 | Invoice | 2023-07-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22604 | Invoice | 2023-07-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22605 | Invoice | 2023-07-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22711 | Payment | 2023-07-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22711 | Payment | 2023-07-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22711 | Payment | 2023-07-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22711 | Payment | 2023-07-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5594 | Crd Note | 2023-07-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22842 | Invoice | 2023-07-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 22847 | Invoice | 2023-07-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5686 | Crd Note | 2023-07-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23098 | Invoice | 2023-08-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23099 | Invoice | 2023-08-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5771 | Crd Note | 2023-08-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23278 | Invoice | 2023-08-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23279 | Invoice | 2023-08-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5833 | Crd Note | 2023-08-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23280 | Payment | 2023-08-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23280 | Payment | 2023-08-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23280 | Payment | 2023-08-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23280 | Payment | 2023-08-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23545 | Invoice | 2023-08-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23546 | Invoice | 2023-08-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23732 | Invoice | 2023-08-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23733 | Invoice | 2023-08-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 5983 | Crd Note | 2023-08-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23964 | Invoice | 2023-08-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23965 | Invoice | 2023-08-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6074 | Crd Note | 2023-09-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6075 | Crd Note | 2023-09-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24087 | Invoice | 2023-09-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24088 | Invoice | 2023-09-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6101 | Crd Note | 2023-09-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6105 | Crd Note | 2023-09-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23977 | Payment | 2023-09-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23977 | Payment | 2023-09-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23977 | Payment | 2023-09-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23977 | Payment | 2023-09-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 23977 | Payment | 2023-09-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24245 | Invoice | 2023-09-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24246 | Invoice | 2023-09-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6151 | Crd Note | 2023-09-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24516 | Invoice | 2023-09-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24517 | Invoice | 2023-09-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6232 | Crd Note | 2023-09-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24693 | Invoice | 2023-09-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24694 | Invoice | 2023-09-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6290 | Crd Note | 2023-09-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24907 | Invoice | 2023-09-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 24908 | Invoice | 2023-09-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6357 | Crd Note | 2023-09-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25154 | Invoice | 2023-10-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25155 | Invoice | 2023-10-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6422 | Crd Note | 2023-10-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25251 | Invoice | 2023-10-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25252 | Invoice | 2023-10-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6454 | Crd Note | 2023-10-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25475 | Invoice | 2023-10-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25476 | Invoice | 2023-10-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6527 | Crd Note | 2023-10-16 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25616 | Invoice | 2023-10-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25617 | Invoice | 2023-10-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6563 | Crd Note | 2023-10-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25394 | Payment | 2023-10-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25394 | Payment | 2023-10-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25394 | Payment | 2023-10-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25394 | Payment | 2023-10-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25394 | Payment | 2023-10-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25852 | Invoice | 2023-10-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 25853 | Invoice | 2023-10-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6624 | Crd Note | 2023-10-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26141 | Invoice | 2023-11-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26142 | Invoice | 2023-11-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6684 | Crd Note | 2023-11-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26403 | Invoice | 2023-11-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26404 | Invoice | 2023-11-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6775 | Crd Note | 2023-11-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26892 | Invoice | 2023-11-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26893 | Invoice | 2023-11-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6904 | Crd Note | 2023-11-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26601 | Payment | 2023-11-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26601 | Payment | 2023-11-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26601 | Payment | 2023-11-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 26601 | Payment | 2023-11-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 6957 | Crd Note | 2023-11-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27132 | Invoice | 2023-12-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27133 | Invoice | 2023-12-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27384 | Invoice | 2023-12-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27385 | Invoice | 2023-12-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7020 | Crd Note | 2023-12-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27641 | Invoice | 2023-12-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27897 | Invoice | 2023-12-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27972 | Invoice | 2023-12-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7156 | Crd Note | 2023-12-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27468 | Payment | 2023-12-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27468 | Payment | 2023-12-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27468 | Payment | 2023-12-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27468 | Payment | 2023-12-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27468 | Payment | 2023-12-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27468 | Payment | 2023-12-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27468 | Payment | 2023-12-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27468 | Payment | 2023-12-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27468 | Payment | 2023-12-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 27468 | Payment | 2023-12-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28136 | Invoice | 2023-12-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28137 | Invoice | 2023-12-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28140 | Invoice | 2023-12-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7204 | Crd Note | 2023-12-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7210 | Crd Note | 2023-12-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28328 | Invoice | 2024-01-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28329 | Invoice | 2024-01-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28330 | Invoice | 2024-01-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28331 | Invoice | 2024-01-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7247 | Crd Note | 2024-01-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7248 | Crd Note | 2024-01-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7253 | Crd Note | 2024-01-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28565 | Invoice | 2024-01-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28586 | Invoice | 2024-01-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7291 | Crd Note | 2024-01-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28751 | Invoice | 2024-01-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28752 | Invoice | 2024-01-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7339 | Crd Note | 2024-01-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28959 | Invoice | 2024-01-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28960 | Invoice | 2024-01-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7379 | Crd Note | 2024-01-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29161 | Invoice | 2024-02-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29162 | Invoice | 2024-02-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7418 | Crd Note | 2024-02-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29384 | Invoice | 2024-02-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29385 | Invoice | 2024-02-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7453 | Crd Note | 2024-02-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29584 | Invoice | 2024-02-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29585 | Invoice | 2024-02-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7484 | Crd Note | 2024-02-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28893 | Payment | 2024-02-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28893 | Payment | 2024-02-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28893 | Payment | 2024-02-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 28893 | Payment | 2024-02-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29763 | Invoice | 2024-02-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 29764 | Invoice | 2024-02-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7523 | Crd Note | 2024-02-22 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30008 | Invoice | 2024-03-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30012 | Invoice | 2024-03-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7576 | Crd Note | 2024-03-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30147 | Invoice | 2024-03-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30148 | Invoice | 2024-03-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7605 | Crd Note | 2024-03-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30414 | Invoice | 2024-03-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30537 | Invoice | 2024-03-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30806 | Invoice | 2024-03-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30977 | Invoice | 2024-04-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31002 | Invoice | 2024-04-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 7950 | Crd Note | 2024-04-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31201 | Invoice | 2024-04-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31212 | Invoice | 2024-04-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 8041 | Crd Note | 2024-04-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31413 | Invoice | 2024-04-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31426 | Invoice | 2024-04-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 8117 | Crd Note | 2024-04-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30269 | Payment | 2024-04-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30269 | Payment | 2024-04-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30269 | Payment | 2024-04-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30269 | Payment | 2024-04-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31640 | Invoice | 2024-04-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31655 | Invoice | 2024-04-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 8209 | Crd Note | 2024-04-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31801 | Invoice | 2024-05-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31806 | Invoice | 2024-05-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 8280 | Crd Note | 2024-05-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31997 | Invoice | 2024-05-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31998 | Invoice | 2024-05-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 8359 | Crd Note | 2024-05-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32219 | Invoice | 2024-05-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32220 | Invoice | 2024-05-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 8461 | Crd Note | 2024-05-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32409 | Invoice | 2024-05-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32410 | Invoice | 2024-05-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 8533 | Crd Note | 2024-05-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30891 | Payment | 2024-05-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30891 | Payment | 2024-05-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30891 | Payment | 2024-05-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 30891 | Payment | 2024-05-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32531 | Invoice | 2024-05-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32532 | Invoice | 2024-05-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 8579 | Crd Note | 2024-05-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32614 | Invoice | 2024-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32615 | Invoice | 2024-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 8612 | Crd Note | 2024-05-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32787 | Invoice | 2024-06-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32812 | Invoice | 2024-06-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 8690 | Crd Note | 2024-06-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31179 | Payment | 2024-06-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31179 | Payment | 2024-06-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31179 | Payment | 2024-06-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31179 | Payment | 2024-06-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31179 | Payment | 2024-06-10 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32976 | Invoice | 2024-06-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32985 | Invoice | 2024-06-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 8781 | Crd Note | 2024-06-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33272 | Invoice | 2024-06-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33273 | Invoice | 2024-06-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 8915 | Crd Note | 2024-06-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33533 | Invoice | 2024-06-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33534 | Invoice | 2024-06-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 9041 | Crd Note | 2024-06-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33806 | Invoice | 2024-07-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33807 | Invoice | 2024-07-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33830 | Invoice | 2024-07-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 9161 | Crd Note | 2024-07-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31792 | Payment | 2024-07-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31792 | Payment | 2024-07-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31792 | Payment | 2024-07-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31792 | Payment | 2024-07-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 31792 | Payment | 2024-07-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34098 | Invoice | 2024-07-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34099 | Invoice | 2024-07-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 9314 | Crd Note | 2024-07-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34326 | Invoice | 2024-07-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34329 | Invoice | 2024-07-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 9419 | Crd Note | 2024-07-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34383 | Invoice | 2024-07-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34384 | Invoice | 2024-07-19 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 9454 | Crd Note | 2024-07-20 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34614 | Invoice | 2024-07-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34615 | Invoice | 2024-07-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 9547 | Crd Note | 2024-07-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34849 | Invoice | 2024-08-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34850 | Invoice | 2024-08-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 9641 | Crd Note | 2024-08-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35094 | Invoice | 2024-08-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35095 | Invoice | 2024-08-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 9770 | Crd Note | 2024-08-08 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35297 | Invoice | 2024-08-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35298 | Invoice | 2024-08-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 9865 | Crd Note | 2024-08-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32896 | Payment | 2024-08-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32896 | Payment | 2024-08-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32896 | Payment | 2024-08-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32896 | Payment | 2024-08-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32896 | Payment | 2024-08-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 32896 | Payment | 2024-08-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35522 | Invoice | 2024-08-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35523 | Invoice | 2024-08-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 9970 | Crd Note | 2024-08-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 10086 | Crd Note | 2024-08-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35749 | Invoice | 2024-08-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35750 | Invoice | 2024-08-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35961 | Invoice | 2024-09-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35962 | Invoice | 2024-09-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 10168 | Crd Note | 2024-09-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 10186 | Crd Note | 2024-09-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35990 | Invoice | 2024-09-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35991 | Invoice | 2024-09-06 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36191 | Invoice | 2024-09-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36192 | Invoice | 2024-09-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 10276 | Crd Note | 2024-09-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 10361 | Crd Note | 2024-09-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36395 | Invoice | 2024-09-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36396 | Invoice | 2024-09-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 10495 | Crd Note | 2024-09-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36680 | Invoice | 2024-09-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36681 | Invoice | 2024-09-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33810 | Payment | 2024-09-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33810 | Payment | 2024-09-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33810 | Payment | 2024-09-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33810 | Payment | 2024-09-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33810 | Payment | 2024-09-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 33810 | Payment | 2024-09-30 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36945 | Invoice | 2024-10-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36946 | Invoice | 2024-10-03 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 10648 | Crd Note | 2024-10-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 37020 | Invoice | 2024-10-05 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 10668 | Crd Note | 2024-10-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 37216 | Invoice | 2024-10-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 37217 | Invoice | 2024-10-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 10743 | Crd Note | 2024-10-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 10806 | Crd Note | 2024-10-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 37363 | Invoice | 2024-10-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 37364 | Invoice | 2024-10-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 37619 | Invoice | 2024-10-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 37620 | Invoice | 2024-10-25 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 10919 | Crd Note | 2024-10-26 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34425 | Payment | 2024-10-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34425 | Payment | 2024-10-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34425 | Payment | 2024-10-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34425 | Payment | 2024-10-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34425 | Payment | 2024-10-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34425 | Payment | 2024-10-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34425 | Payment | 2024-10-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 34425 | Payment | 2024-10-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 10998 | Crd Note | 2024-10-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 37799 | Invoice | 2024-10-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 37800 | Invoice | 2024-10-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11101 | Crd Note | 2024-11-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38040 | Invoice | 2024-11-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38041 | Invoice | 2024-11-07 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11200 | Crd Note | 2024-11-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38266 | Invoice | 2024-11-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38267 | Invoice | 2024-11-14 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11277 | Crd Note | 2024-11-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38456 | Invoice | 2024-11-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38457 | Invoice | 2024-11-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11351 | Crd Note | 2024-11-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38664 | Invoice | 2024-11-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38665 | Invoice | 2024-11-29 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11394 | Crd Note | 2024-12-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35270 | Payment | 2024-12-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35270 | Payment | 2024-12-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35270 | Payment | 2024-12-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35270 | Payment | 2024-12-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35270 | Payment | 2024-12-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35270 | Payment | 2024-12-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 35270 | Payment | 2024-12-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38820 | Invoice | 2024-12-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 38821 | Invoice | 2024-12-04 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39008 | Invoice | 2024-12-12 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11464 | Crd Note | 2024-12-13 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11509 | Crd Note | 2024-12-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39149 | Invoice | 2024-12-18 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11570 | Crd Note | 2024-12-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39307 | Invoice | 2024-12-23 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39558 | Invoice | 2025-01-02 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11660 | Crd Note | 2025-01-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39714 | Invoice | 2025-01-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39715 | Invoice | 2025-01-09 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39898 | Invoice | 2025-01-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 39899 | Invoice | 2025-01-15 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11693 | Crd Note | 2025-01-16 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36139 | Payment | 2025-01-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36139 | Payment | 2025-01-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36139 | Payment | 2025-01-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36139 | Payment | 2025-01-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36139 | Payment | 2025-01-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36139 | Payment | 2025-01-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36139 | Payment | 2025-01-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36139 | Payment | 2025-01-17 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11757 | Crd Note | 2025-01-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40143 | Invoice | 2025-01-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40144 | Invoice | 2025-01-24 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40319 | Invoice | 2025-01-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40320 | Invoice | 2025-01-31 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11803 | Crd Note | 2025-02-01 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11876 | Crd Note | 2025-02-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40622 | Invoice | 2025-02-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40623 | Invoice | 2025-02-11 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11938 | Crd Note | 2025-02-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36988 | Payment | 2025-02-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36988 | Payment | 2025-02-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36988 | Payment | 2025-02-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36988 | Payment | 2025-02-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36988 | Payment | 2025-02-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36988 | Payment | 2025-02-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36988 | Payment | 2025-02-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36988 | Payment | 2025-02-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 36988 | Payment | 2025-02-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40881 | Invoice | 2025-02-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 40882 | Invoice | 2025-02-21 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 41051 | Invoice | 2025-02-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 41052 | Invoice | 2025-02-27 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |
| 11977 | Crd Note | 2025-02-28 | DB_ONLY_DOCUMENT | financial_bridge_from_txt |

## Doctrine

> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.
