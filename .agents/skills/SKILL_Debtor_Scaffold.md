---
name: debtor-scaffold
description: |
  Scaffold a new debtor account micro-project in lpg-stock-recon. Use this whenever the user wants to initialize a new debtor account for reconciliation analysis — initialize a new account code, set up the account structure, or create directories for a fresh debtor. This skill creates the full directory layout, generates project.json with the correct schema, creates stub configuration files, validates the structure, and provides a checklist of next steps (obtaining DEBENQ.TXT from finance, pulling DB data, running the reconciliation pipeline).
---

# Debtor Account Scaffolding

When scaffolding a new debtor account, you need to:
1. Create the directory structure
2. Generate `project.json` with sensible defaults
3. Create stub config files
4. Validate the account
5. Report what was created and what's next

This skill automates all of that.

## Input

The user provides:
- **Debtor code** (e.g., `EMB001`, `TWK002`) — must match the ERP customer code
- **Client name** (e.g., `ACME CORP PTY LTD`) — the trading/registered name of the customer

## Process

### 1. Validate Input

- **Debtor code**: Must be uppercase, alphanumeric, 3–6 chars (matches existing pattern)
- **Client name**: Non-empty string
- **Uniqueness check**: Ensure the code doesn't already exist in `analysis/debtors/`

If validation fails, report the specific issue and ask the user to correct it.

### 2. Create Directory Structure

Create the following under `analysis/debtors/<CODE>/`:

```
analysis/debtors/<CODE>/
├── project.json          # Account metadata
├── config/               # Configuration overrides
│   ├── statement_of_account.json
│   ├── statement_v5.json
│   ├── payment_pattern_overrides.json
│   └── settlement_discount_overrides.json
├── data/                 # Generated data (empty on init)
├── raw/                  # ERP exports (empty on init)
├── docs/                 # Investigation & doctrine docs (empty on init)
├── reports/              # Generated statements (empty on init)
└── scripts/              # Account-specific scripts (optional, skip on init)
```

### 3. Generate `project.json`

Use this template:

```json
{
  "debtorCode": "<CODE>",
  "clientName": "<CLIENT_NAME>",
  "status": "active",
  "reconState": "pending",
  "financials": {
    "totalOutstanding": 0.0,
    "lastInvoiceDate": null,
    "lastPaymentDate": null,
    "agedDebt180Plus": 0.0
  },
  "collections": {
    "actionRequired": false,
    "actionType": null,
    "dateSent": null,
    "deadlineDate": null,
    "nextAction": null,
    "nextActionDate": null,
    "notes": "Account initialization",
    "blockers": []
  },
  "history": [
    {
      "date": "<TODAY_ISO>",
      "event": "Initialized micro-project scaffolding"
    }
  ]
}
```

Fill in `<CODE>`, `<CLIENT_NAME>`, and `<TODAY_ISO>` (ISO 8601 date like 2026-10-01).

### 4. Generate Stub Config Files

**`config/statement_of_account.json`:**
```json
{
  "debtorCode": "<CODE>",
  "layoutVersion": "v5",
  "created": "<TODAY_ISO>"
}
```

**`config/statement_v5.json`:**
```json
{
  "version": 5,
  "debtorCode": "<CODE>",
  "created": "<TODAY_ISO>",
  "properties": {}
}
```

**`config/payment_pattern_overrides.json`:**
```json
{
  "patterns": []
}
```

**`config/settlement_discount_overrides.json`:**
```json
{
  "discounts": []
}
```

### 5. Validate with Sync Pipeline

Run:
```bash
npm run debtors:sync
```

If validation passes, report success. If it fails, show the error and suggest remedies.

### 6. Report Summary

Show the user:
- ✅ Directories created
- ✅ Files generated
- ✅ Validation status (pass/fail + details)
- 📋 Next steps checklist:
  1. Obtain `DEBENQ.TXT` from finance and place at `analysis/debtors/<CODE>/raw/DEBENQ.TXT`
  2. (Optional) Pull transaction data from DB: `npm run debtors:pull-db -- --debtor <CODE>`
  3. Run reconciliation status: `npm run debtors:reconciliation-status -- --debtor <CODE>`
  4. Check ingest coverage: `npm run debtors:ingest-check -- --debtor <CODE>`

## Output Format

```
✅ Scaffolded debtor account: <CODE> (<CLIENT_NAME>)

📁 Created directories:
  - analysis/debtors/<CODE>/config/
  - analysis/debtors/<CODE>/data/
  - analysis/debtors/<CODE>/raw/
  - analysis/debtors/<CODE>/docs/
  - analysis/debtors/<CODE>/reports/

📄 Generated files:
  - project.json
  - config/statement_of_account.json
  - config/statement_v5.json
  - config/payment_pattern_overrides.json
  - config/settlement_discount_overrides.json

✅ Validation: PASS (npm run debtors:sync)

📋 Next steps:
  1. Obtain DEBENQ.TXT from finance → analysis/debtors/<CODE>/raw/DEBENQ.TXT
  2. (Optional) npm run debtors:pull-db -- --debtor <CODE>
  3. npm run debtors:reconciliation-status -- --debtor <CODE>
  4. npm run debtors:ingest-check -- --debtor <CODE>
```

## Error Handling

- **Debtor code already exists**: Report and ask user to choose a different code or confirm overwrite
- **Invalid input format**: Report specific validation issue (e.g., "code must be 3–6 uppercase alphanumeric")
- **Directory creation fails**: Report OS error and suggest checking permissions
- **`npm run debtors:sync` fails**: Show the error message and suggest fixes (e.g., "Check that project.json has required fields")

## Implementation Notes

- Use the current date (ISO 8601 format) for timestamps
- Preserve exact JSON indentation (2 spaces) for consistency with existing files
- The skill runs from the repo root (`/home/user/lpg-stock-recon`)
