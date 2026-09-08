# JAY000 raw evidence

No DEBENQ / statement TXT has been ingested for this account.

| File | Role |
| :--- | :--- |
| `DTRX_RECONSTRUCTED_JAY000.TXT` | **Derived** audit reconstruction from `data/dtrx_headers.csv`. The `CURRENT BALANCE` line is the header-sum running total (**ASSERTED**), not an ERP enquiry header. Do not treat as Tier-3 DEBENQ. |

Refresh evidence:

```bash
DATABASE_URL=... PGSSL_REJECT_UNAUTHORIZED=false \
  npm run debtors:dtrx-header-export -- --debtor JAY000
npm run debtors:dtrx-header-statement -- --debtor JAY000 --as-at 2026-09-08
```
