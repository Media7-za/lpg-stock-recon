# Creditors Micro-Project Schema

Parallel to `analysis/debtors/`. One folder per supplier account under
`analysis/creditors/[CODE]/`, plus shared tooling in `analysis/creditors/shared/`.

## Folder layout
```
analysis/creditors/
  shared/
    scripts/
      require_database_url.mjs            # re-export of debtor helper + hasDatabaseUrl()
      ingest_coverage_classifier.mjs      # AP entry-shape map (GRV / Deb Note)
      validate_txt_db_coverage.mjs        # ingest gate (--creditor, DB-optional)
      reconcile_creditor_v5_from_txt.mjs  # v5 generator (--creditor, DB-optional)
    templates/statement_v5_config.template.json
    docs/CREDITORS_DOCTRINE.md
    docs/AP_Recon_Workflow.md
    docs/lpg_costing_and_supplier_rules.md
    PROJECT_SCHEMA.md
  [CODE]/
    config/statement_v5.json
    raw/[CODE]CURRENT.TXT
    docs/[CODE]_Linked_Accounts.md
    reports/[CODE]_Statement_Account_v5.md
    reports/[CODE]_INGEST_COVERAGE_[date].{json,md}
    reports/[CODE]_Onboarding_Status.md
    project.json
```

## `config/statement_v5.json`
| Field | Type | Role |
| :--- | :--- | :--- |
| `creditorCode` | string | ERP supplier account code (must match `--creditor`) |
| `creditorName` | string | Supplier trading name from TXT `ACCOUNT:` header |
| `linkedAccounts` | string[] | Legacy/related supplier codes treated as one counterparty |
| `txtPath` | string | Relative path to the authoritative ERP TXT |
| `periodStart` | ISO date | First row included in the statement |
| `combinedBf` | number | ERP combined opening balance before the first period row |
| `bfSourceNote` | string | Audit note (TXT line reference) |
| `cylOpeningFinancial` | number | CYL deposit financial B/F (Part 1B opening); 1A opening = `combinedBf − cylOpeningFinancial` |
| `paymentLane` | `LPG`\|`CYL`\|`COMBINED` | Which sub-ledger payments post to (default `LPG`) |
| `cylOpeningQty` | object | Part 2 physical custody B/F per SKU (`14.1`,`19.1`,`9.1`,`D.1`,`S.1`) |
| `skuRates` | object | VAT-inclusive deposit rates for custody exposure |

## `project.json`
Lightweight status manifest: `reconState`, `financials` (payable + last GRV/payment
dates), and `ingestGate.status`. Human/agent-maintained, not generated.

## `[CODE].v5.json` fixture (generated)
Written to `src/features/creditor-position-workspace/data/fixtures/[CODE].v5.json` by the
reconcile script for future UI consumption (creditor-position workspace, not yet built).
