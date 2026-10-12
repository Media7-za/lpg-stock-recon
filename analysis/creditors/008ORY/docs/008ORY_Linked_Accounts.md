# 008ORY Linked Accounts

## 007ORY — Legacy Oryx Energy (pre-Mar 2025)

| Account | Status | Role |
| :--- | :--- | :--- |
| **008ORY** | Active primary | Current Oryx Energy supplier AP code |
| **007ORY** | Legacy / inactive | Historical Oryx code through Feb 2025 |

### Rules

- DB line-split and Part 2 qty queries include **both** codes via `linkedAccounts` in `config/statement_v5.json`.
- ERP TXT exports may only list **008ORY** — pre-period balance from 007ORY must be captured in `combinedBf` / `bfSourceNote` if material.
- Do not merge 007ORY rows into v5 running balance without TXT evidence for the combined opening.

See [`lpg_costing_and_supplier_rules.md`](../../shared/docs/lpg_costing_and_supplier_rules.md) for SKU suffix conventions (`.4` LPG, `.1` CYL).
