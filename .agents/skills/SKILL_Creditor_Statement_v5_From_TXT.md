---
name: creditor-statement-v5-from-txt
description: >-
  Generates creditor Statement of Account v5 markdown from ERP TXT exports.
  Splits Part 1 into 1A (LPG purchases) and 1B (CYL deposit shells) with a
  reconciliation bridge. Part 2 cylinder shell qty tracker. Use for 008ORY
  Oryx Energy AP recon, GRV/Deb Note routing, or creditor v5 statements.
---

# Creditor Statement v5 From TXT

Generate `[CODE]_Statement_Account_v5.md` for supplier AP accounts. Reference: **008ORY / Oryx Energy**.

> **Do not** build from Supabase alone. ERP TXT is Tier-3 authority. DB is for LPG/CYL line split and Part 2 qty.

> **Do not modify** debtor v4/v5 scripts when building creditor artifacts.

---

## When to use

| Use v5 | Do NOT use |
| :--- | :--- |
| Split LPG vs CYL deposit AP ledgers | Debtor AR statements (`SKILL_Debtor_Statement_v5_From_TXT.md`) |
| GRV / Deb Note / Payment layout | LPG cost-per-kg only (`lpg_costing_and_supplier_rules.md`) |

---

## Prerequisites

1. ERP creditor TXT in `analysis/creditors/[CODE]/raw/`
2. `config/statement_v5.json` (template: `analysis/creditors/shared/templates/statement_v5_config.template.json`)
3. `DATABASE_URL` set
4. Ingest coverage: `npm run creditors:ingest-check -- --creditor [CODE]`

---

## Quick start

```bash
cp analysis/creditors/shared/templates/statement_v5_config.template.json \
   analysis/creditors/008ORY/config/statement_v5.json
# Edit creditorCode, creditorName, txtPath, combinedBf, linkedAccounts

npm run creditors:ingest-check -- --creditor 008ORY
npm run creditors:statement-v5 -- --creditor 008ORY
```

**Pass gate:** `ERP variance R0.00` and `Sub-ledger tie variance: R0.00`.

---

## Document routing

| ERP row | Part 1A (LPG) | Part 1B (CYL) |
| :--- | :---: | :---: |
| GRV / Deb Note — `.4` lines | DB split | |
| GRV / Deb Note — `.1` lines | | DB split |
| Payment | ✓ (`paymentLane: LPG`) | |

Intraday order: **GRV before Deb Note**, then doc_no ASC.

---

## 008ORY reference

| Item | Path |
| :--- | :--- |
| Config | `analysis/creditors/008ORY/config/statement_v5.json` |
| Linked legacy | `007ORY` in `linkedAccounts` |
| Doctrine | `analysis/creditors/shared/docs/CREDITORS_DOCTRINE.md` |
| Workflow | `analysis/creditors/shared/docs/AP_Recon_Workflow.md` |

---

## Related skills

| Skill | Role |
| :--- | :--- |
| `SKILL_Debtor_Statement_v5_From_TXT.md` | AR parallel (do not modify) |
| `lpg_costing_and_supplier_rules.md` | SKU / costing rules |
