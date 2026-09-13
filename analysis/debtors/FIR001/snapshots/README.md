# FIR001 — Statement snapshots

Immutable customer Statement of Account artifacts. Cite a snapshot folder + `manifest.json` sha256 for send or dispute — not the live `reports/FIR001_Statement_of_Account.md`, and **not** the v5 operator sub-ledger.

Presentation is the JEN001 two-layer model: v5 operator / customer SOA (`reports/FIR001_Presentation_Layer.md`).

## Regenerate

```bash
npm run debtors:customer-statement -- --debtor FIR001 --as-at 2026-09-05 --snapshot --pdf
```

## Snapshots on file

| Snapshot id | Statement as-at | Amount due (PROVEN) | Gate | Notes |
| :--- | :--- | ---: | :--- | :--- |
| `2026-09-05_v1` | 2026-09-05 | R8,721.02 | REVIEW_REQUIRED · PATTERN_ONLY | **SUPERSEDED presentation** — itemised CYL residual on customer face. Do not send. |
| `2026-09-05_v2` | 2026-09-05 | R8,721.02 | REVIEW_REQUIRED · PATTERN_ONLY | **Current send candidate** — JEN001 collapsed opening. `2026-09-05_v2/manifest.json` |

Open LPG: inv **52962** R7,606.09. Collapsed opening: R1,114.93 (v5 B/F + Part 1B).

## Tripwires — reopen snapshot validity if

| Closed ruling | Reopens if |
| :--- | :--- |
| Amount due R8,721.02 | Fresh TXT changes `CURRENT BALANCE`; v5 regenerated with a different combined close |
| Open list = inv 52962 only | Remittance names 52962 paid; FIFO overrides removed; new invoices after 5 Sep 2026 |
| Collapsed opening (not itemised CYL) | Operator sets `collapseAccountLevelAsOpeningBalance` false; v1 sent by mistake |
| Gate REVIEW_REQUIRED | Operator ratifies `allocationGate` or a remittance batch lands |
| v5 / SOA split | v5 composed used as the customer document |
