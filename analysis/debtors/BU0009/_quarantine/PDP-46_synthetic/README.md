# Quarantined: PDP-46 synthetic test data (BU0009)

Moved here on 2026-10-10 on operator approval (ADM-89 BU0009 Q1: "Quarantine the PDP-46 files: approved"). **Moved, not deleted**; original paths were `data/{allocation_edges,invoices,payments}.csv`, `data/dashboard_metrics.json` and `reports/reconciliation_status.csv`.

Why: they were synthetic fixtures (`Synthetic PDP-46 test data`, `SYNTHETIC_TEST.TXT`, invented docs INV-1001..1005 and PMT-2001..2003) added on 2026-09-16 (commit `2f921e7`) to validate `build_reconciliation_status.mjs`. They are not ERP data and must not be read as BU0009's position. BU0009's real position is `data/v5_projection.json` built from `raw/BU0009_2026-10-10.TXT`.

Not quarantined: `reports/impendle_wholesale_intelligence.md` (a real ERP commercial analysis dated 3 June 2026).

Restore with `git mv` back to the original paths if a fixture is needed again. Nothing else in the repo referenced these files (checked: scripts, tests, package.json).
