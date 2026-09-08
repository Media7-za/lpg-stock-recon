# FIR001 — Statement snapshots

Immutable customer Statement of Account artifacts. Cite a snapshot folder + `manifest.json` sha256 for send or dispute — not the live `reports/FIR001_Statement_of_Account.md`.

## Regenerate

```bash
npm run debtors:customer-statement -- --debtor FIR001 --as-at 2026-09-05 --snapshot --pdf --also-live
```

## Snapshots on file

| Snapshot id | Statement as-at | Amount due (PROVEN) | Gate | Manifest |
| :--- | :--- | ---: | :--- | :--- |
| `2026-09-05_v1` | 2026-09-05 | R8,721.02 | REVIEW_REQUIRED · PATTERN_ONLY | `2026-09-05_v1/manifest.json` |

Open LPG: inv **52962** R7,606.09. Account-level: B/F R597.43 + CYL residual R517.50.

## Tripwires — reopen snapshot validity if

| Closed ruling | Reopens if |
| :--- | :--- |
| Amount due R8,721.02 | Fresh TXT changes `CURRENT BALANCE`; operator changes `customerDueBasis` |
| Open list = inv 52962 only | Remittance names 52962 paid; FIFO overrides removed; new invoices after 5 Sep 2026 |
| Gate REVIEW_REQUIRED | Operator ratifies `allocationGate` or a remittance batch lands |
