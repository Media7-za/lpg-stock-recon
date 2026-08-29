# SA0001 Turn 001 — Worker Report

**Generated:** 2026-08-05 (resume after `raw/SA0001.TXT` upload)  
**Outcome:** **PARTIAL PASS** — financial bridge PROVEN; ingest partial; custody blocked

## Step 1 — Raw inventory

| File | Present |
| :--- | :---: |
| `raw/SA0001.TXT` | ✅ |
| `config/statement_v5.json` | ✅ |

## Step 2 — TXT header

| Field | Value |
| :--- | ---: |
| CURRENT BALANCE | R10 804,97 |
| BALANCE B/F | R4 945,93 |
| Last period date | 2026-07-31 |
| TOTAL TRANSACTIONS | R10 804,97 |

## Step 3 — Ingest check

- Command: `PGSSL_REJECT_UNAUTHORIZED=false npm run debtors:ingest-check -- --debtor SA0001`
- Result: `CURRENT_PARTIAL` — 5 custody-blocking gaps
- Artifacts: `reports/SA0001_INGEST_COVERAGE_2026-08-05.json` / `.md`

## Step 4 — v5 generator

```
[SA0001] Combined 1A+1B: R10,804.97 (ERP variance R0.00)
[SA0001] Sub-ledger tie variance: R0.00
```

- Artifact: `reports/SA0001_Statement_Account_v5.md`

## Epistemic tags

| Item | Tag |
| :--- | :--- |
| Part 1A + 1B vs TXT CURRENT BALANCE | **PROVEN** (R0.00) |
| CURRENT BALANCE R10 804,97 | **ASSERTED** until operator confirms export latest |
| Custody / Part 2 qty | **BLOCKED** (ingest partial) |

## Steps deferred

- `reconState: complete` — custody lane not closed
- Registry ratification — none required this turn

## H-012

Sources intake satisfied by `raw/SA0001.TXT` (operator-provided path 2026-08-05).
