# 008ORY — Linked Accounts

**Supplier:** Oryx Energy (LPG bulk + cylinder gas supplier)

| Code | Status | Window | Notes |
| :--- | :--- | :--- | :--- |
| `008ORY` | Active (primary) | Mar 2025 → present | Current ERP supplier account |
| `007ORY` | Legacy | up to Feb 2025 | Predecessor code; same economic counterparty |

## Consolidation rule
`008ORY` and `007ORY` are the **same supplier** across an ERP account-code change. They
are treated as one counterparty via `config/statement_v5.json.linkedAccounts: ["007ORY"]`.
The ingest gate and DB line-split queries scope to `account_no = ANY(['008ORY','007ORY'])`
(mirrors the debtor JEN001/JEN010 consolidation precedent).

## Direction reminder (AP)
GRV increases the payable (we owe Oryx more); Deb Note and Payment reduce it. Cylinder
deposit `.1` GRV charges and matching `.1` Deb Note returns normally net to zero and are
excluded from LPG cost-per-kg.
