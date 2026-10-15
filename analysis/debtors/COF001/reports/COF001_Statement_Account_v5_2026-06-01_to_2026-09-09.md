# Statement of Account - Version 5 (Sub-Ledger Position Statement)

**Account:** COF001 - COFFEEBERRY-CASCADES  
**Period:** 2026-06-01 to 2026-09-09 (ERP extracts 2023, 2024, 2025, CURRENT)  
**Sources:** `analysis/debtors/COF001/raw/COF001_{2023,2024,2025,CURRENT}.TXT`; combined as `raw/COF001_COMBINED.TXT`  
**Authority:** ERP TXT for amounts and balances. Supabase (DB) for SKU routing, mixed-document splits and Part 2 quantities.  
**Generator:** `analysis/debtors/COF001/scripts/build_statement_v5.mjs` (generated, not hand-edited).

## Summary

| Position | Amount | Tag / artifact |
| :--- | ---: | :--- |
| ERP opening balance (before first row) | 8,595.35 | PROVEN - `raw/COF001_2023.TXT` B/F row or prior ERP running balance |
| ERP closing balance (last row) | -16,256.52 | PROVEN - ERP running balance on the last row |
| Part 1A LPG closing | -8,482.52 | PROVEN - computed in this report |
| Part 1B CYL deposit closing | -7,774.00 | PROVEN - computed in this report |
| Bridge variance (1A + 1B - ERP) | 0.00 | PROVEN - zero on every row |

Chain integrity across the four extracts: PROVEN - every row balances and each extract opens on the prior closing.

## Part 1 - Reconciliation Bridge (1A + 1B = ERP)

| Movement | 1A LPG | 1B CYL | Total | ERP |
| :--- | ---: | ---: | ---: | ---: |
| Opening | 1,189.35 | 7,406.00 | 8,595.35 | 8,595.35 |
| Movements | -9,671.87 | -15,180.00 | -24,851.87 | -24,851.87 |
| Closing | -8,482.52 | -7,774.00 | -16,256.52 | -16,256.52 |

Mixed documents split at line level: 1 documents (15558). Payments route to 1A only (`paymentLane: LPG`); no proportional payment split.

## Part 1A: LPG Gas Financial Statement

| Date | Period | Doc | Type | Ref | Amount | Balance |
| :--- | :---: | :--- | :--- | :--- | ---: | ---: |
| 2026-06-01 | 16 | 00044560 | Payment | TRANSF / STAT:127 | -9,671.37 | -8,482.02 |
| 2026-06-09 | 16 | 00051107 | Invoice | COFFEEBERRY-CASCADES | 9,311.22 | 829.20 |
| 2026-06-15 | 16 | 00044753 | Payment | TRANSF / STAT:127 | -9,311.22 | -8,482.02 |
| 2026-06-23 | 16 | 00051372 | Invoice | DN#22657 | 8,683.50 | 201.48 |
| 2026-06-29 | 16 | 00044968 | Payment | TRANSF / STAT:127 | -8,683.50 | -8,482.02 |
| 2026-07-08 | 17 | 00051705 | Invoice | DN#24202 | 9,034.40 | 552.38 |
| 2026-07-15 | 17 | 00045209 | Payment | TRANSF / STAT:128 | -9,034.40 | -8,482.02 |
| 2026-07-22 | 17 | 00052014 | Invoice | DN#23902 | 9,349.56 | 867.54 |
| 2026-07-31 | 17 | 00045480 | Payment | TRANSF / STAT:128 | -9,349.56 | -8,482.02 |
| 2026-08-20 | 18 | 00052691 | Invoice | DN#22890 | 3,284.35 | -5,197.67 |
| 2026-08-24 | 18 | 00045896 | Payment | TRANSF / STAT:129 | -3,284.35 | -8,482.02 |
| 2026-08-26 | 18 | 00015558 | Crd Note (split) | DN#22890-EMPTY | -3,002.83 | -11,484.85 |
| 2026-09-09 | 19 | 00007473 | Bank XFer | STAT 130 | 3,002.33 | -8,482.52 |

## Part 1B: Cylinder Deposit Financial Statement

| Date | Period | Doc | Type | Ref | Amount | Balance |
| :--- | :---: | :--- | :--- | :--- | ---: | ---: |
| 2026-06-23 | 16 | 00051373 | Invoice | DN#22657-EMPTY | 6,555.00 | 13,961.00 |
| 2026-06-24 | 16 | 00015113 | Crd Note | DN#22657-EMPTY | -6,555.00 | 7,406.00 |
| 2026-07-08 | 17 | 00051706 | Invoice | DN#24202=EMPTY | 7,072.50 | 14,478.50 |
| 2026-07-09 | 17 | 00015227 | Crd Note | DN#24202=EMPTY | -7,072.50 | 7,406.00 |
| 2026-07-22 | 17 | 00052015 | Invoice | DN#23902=EMPTY | 7,590.00 | 14,996.00 |
| 2026-07-23 | 17 | 00015312 | Crd Note | DN#23902=EMPTY | -7,590.00 | 7,406.00 |
| 2026-08-20 | 18 | 00015531 | Crd Note | DN#22890-EMPTY | -1,725.00 | 5,681.00 |
| 2026-08-20 | 18 | 00015532 | Crd Note | DN#22890-EMPTY | -2,415.00 | 3,266.00 |
| 2026-08-20 | 18 | 00052750 | Invoice | DN#22890-EMPTY | 1,725.00 | 4,991.00 |
| 2026-08-20 | 18 | 00052751 | Invoice | DN#22890-EMPTY | 2,932.50 | 7,923.50 |
| 2026-08-26 | 18 | 00015558 | Crd Note (split) | DN#22890-EMPTY | -15,697.50 | -7,774.00 |

## Part 2: Cylinder (CYL) Custody - Physical Asset Tracker

Net quantity = invoiced less credited, de-duplicated DB lines (see `data/db_sku_classification.json`). **ASSERTED** from DB: the ingest coverage gate (`npm run debtors:ingest-check -- --debtor COF001`) was not run in this session, so custody conclusions are not yet gated.

| SKU | Net qty | Template rate (ASSUMED) | Exposure at rate |
| :--- | ---: | ---: | ---: |
| 9.1 | -3 | 517.50 | -1,552.50 |
| 14.1 | 0 | 575.00 | 0.00 |
| 19.1 | -1 | 690.00 | -690.00 |
| S.1 | -15 | 1,150.00 | -17,250.00 |
| D.1 | 10 | 1,150.00 | 11,500.00 |
| **Total** | | | **-7,992.50** |

Negative net quantities mean credits exceed invoices in the ledger for that SKU. That can reflect stock held before the ledger window, so they are not a physical count.

## Validation

### Routing rule (cylinder SKUs in invoices and credit notes)

| Check | Result | Tag |
| :--- | :--- | :--- |
| DB LPG invoices (no 9.1/14.1/19.1/S.1/D.1 line) | 155 documents, 0 with a cylinder SKU | PROVEN - DB query |
| DB LPG credit notes (no cylinder SKU line) | 13 documents, 0 with a cylinder SKU | PROVEN - DB query |
| DB cylinder invoices (cylinder SKU lines only) | 69 documents, all cylinder SKU | PROVEN - DB query |
| DB cylinder credit notes (cylinder SKU lines only) | 77 documents, all cylinder SKU | PROVEN - DB query |
| Mixed documents (both kinds of line) | 7 invoices + 2 credit notes, split at line level; each split ties to its TXT amount | PROVEN - `data/db_sku_classification.json` |
| TXT rows by lane (type \| lane: count) | Crd Note | 1B: 77; Invoice | SPLIT: 7; Payment | 1A: 152; Invoice | 1A: 155; Invoice | 1B: 69; Crd Note | 1A: 13; Bank UD | 1A: 3; Journal | 1A: 1; Crd Note | SPLIT: 2; Bank XFer | 1A: 1 | PROVEN - this run |

### Other checks

| Check | Result | Tag |
| :--- | :--- | :--- |
| Balance chain across extracts (rows and file boundaries) | No breaks | PROVEN |
| Per-row bridge 1A + 1B = ERP balance | Holds on all rows | PROVEN |
| TXT rows by type | Crd Note: 92; Invoice: 231; Payment: 152; Bank UD: 3; Journal: 1; Bank XFer: 1 | PROVEN - TXT |
| DB header rows by type (for coverage comparison) | Invoice: 317; Crd Note: 132; Payment: 263; Bank UD: 7; Bank XFer: 1; Journal: 1 | ASSERTED - DB |
| Invoice rows: TXT vs DB | TXT 231 rows; DB 317 rows | Not reconciled per document; ingest gate not run | UNRECONCILED |
| Credit-note rows whose EMPTY marker routes to 1A | 0 rows | PROVEN - none |
| Cylinder-lane rows without an EMPTY marker in the ERP reference | 58 rows | Expected: routing is SKU-based (user rule), not ERP-reference-based |
| Document number used on more than one row (invoice or credit note) | 0 keys | PROVEN - none |

### Findings for review

- **DB line duplication:** raw DB lines double-count six of the nine mixed documents (for example 00045528: 14,800.38 raw vs 7,400.19 in the TXT). The split uses de-duplicated lines (same rule as the generator), which tie to the TXT.
- **DB row count exceeds the extracts:** DB has 317 invoice and 263 payment rows; the four extracts have 231 and 152. The TXT chain ties to the ERP balance, so the statement is unaffected, but Part 2 custody (DB-only) may include documents outside the ERP extracts.
- **EMPTY marker vs SKU rule:** 58 cylinder-routed rows carry no EMPTY marker in the ERP reference. A reference-based generator would send them to 1A, so the SKU rule changes the answer here.
- **Charges without cylinder SKUs:** lines such as `SM CYL RENTAL` (00049204) and rental lines 00041576 to 00041579 contain no cylinder SKU, so the SKU rule routes them to 1A. Confirm that is the intended treatment.
- **1B vs custody:** 1B closes at -7,774.00 and custody exposure at template rates is -7,992.50. The statement does not reconcile deposits to custody quantities.

### Not done in this run

- `npm run debtors:reconcile-v5` / `reconcile_debtor_v5_from_txt.mjs` was not run: it needs `DATABASE_URL`, which is not set in this session. This report applies the same routing rules from the Supabase connector, and the generator should be re-run once the connection string is available.
- Ingest coverage gate (`debtors:ingest-check`) not run, so Part 2 is ASSERTED, not gated.
- Workspace fixture `src/features/debtor-position-workspace/data/fixtures/COF001.v5.json` not produced.

---
*Derived artifact - regenerate with the build script; do not hand-edit numbers.*
