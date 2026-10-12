---
name: debtor-statement-v5-from-txt
description: >-
  Generates debtor Statement of Account v5 markdown from ERP TXT exports.
  Splits Part 1 into 1A (LPG Gas) and 1B (CYL Deposits) with a reconciliation
  bridge (1A + 1B = ERP). Part 2 cylinder qty tracker unchanged. Use when
  rebuilding [CODE]_Statement_Account_v5.md, sub-ledger position layout, or
  when the user mentions v5 statement or Part 1A/1B split.
---

# Debtor Statement v5 From TXT

Generate `[CODE]_Statement_Account_v5.md` with **split financial sub-ledgers**. Reference: JEN001 / Spoon Eatery.

> **v4 remains unchanged.** v5 is a separate layout and generator. Do not modify v4 artifacts when building v5.

> **Do not** build from Supabase alone. ERP TXT is Tier-3 authority for combined balance. DB is used for line-level LPG/CYL split (mixed docs) and Part 2 qty.

---

## When to use

| Use v5 | Use v4 instead |
| :--- | :--- |
| Split LPG vs CYL deposit financial ledgers | Combined Part 1 with EMPTY-pair stripping |
| Show CYL deposit inv+CN in 1B (exceptions visible) | Hide paired EMPTY rows for readability |
| Sub-ledger position statement | Legacy v4 customer layout |

| Use v5 | Do NOT use |
| :--- | :--- |
| `position_recon` + sub-ledger layout | `allocation` lane (`SKILL_Payment_To_Invoice_Allocation.md`) |
| | `settlement_discount` (TWK002) |

---

## Prerequisites

1. Fresh ERP TXT in `analysis/debtors/[CODE]/raw/`
2. `config/statement_v5.json` (copy from `shared/templates/statement_v5_config.template.json`)
3. `DATABASE_URL` set (Part 2 qty + mixed-doc line split)
4. **Ingest coverage:** `npm run debtors:ingest-check -- --debtor [CODE]` — custody blocked until pass or ratified exception

---

## Quick start

```bash
cp analysis/debtors/shared/templates/statement_v5_config.template.json \
   analysis/debtors/[CODE]/config/statement_v5.json
# Edit debtorCode, debtorName, txtPath, combinedBf, cylOpeningFinancial, paymentLane

node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor [CODE]
```

**Pass gate:** console shows `ERP variance R0.00` and `Sub-ledger tie variance: R0.00`.

---

## Config fields

| Field | Role |
| :--- | :--- |
| `combinedBf` | ERP combined opening (TXT) |
| `cylOpeningFinancial` | Part 1B opening; 1A opening = combinedBf − cylOpeningFinancial |
| `paymentLane` | `LPG` (default) — payments post to Part 1A only |
| `cylOpeningQty` | Part 2 physical custody B/F |
| `skuRates` | Deposit rates for custody exposure |

---

## Layout produced

```
# Statement of Account - Version 5 (Sub-Ledger Position Statement)

## Part 1A: LPG Gas Financial Statement
## Part 1B: Cylinder Deposit Financial Statement
## Part 1 — Reconciliation Bridge (1A + 1B = ERP)
## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
## Debtor Position Summary (INTERNAL_ONLY)
```

---

## Routing rules (Part 1 split)

| Row type | Part 1A (LPG) | Part 1B (CYL) |
| :--- | :---: | :---: |
| Gas invoice/CN (no `-EMPTY` ref) | ✓ | |
| Deposit invoice/CN (`-EMPTY` / `EMPTIES` ref) | | ✓ |
| Payment / Bank / Journal | ✓ (when `paymentLane: LPG`) | |
| Mixed doc (LPG + CYL lines) | DB line split | DB line split |

**No proportional payment split** — payments route to configured lane only (LSR5 aligned).

---

## Outputs

| Artifact | Path |
| :--- | :--- |
| Statement markdown | `reports/[CODE]_Statement_Account_v5.md` |
| Workspace fixture | `src/features/debtor-position-workspace/data/fixtures/[CODE].v5.json` |

---

## JEN001 reference

| Item | Path |
| :--- | :--- |
| Config | `JEN001/config/statement_v5.json` |
| TXT | `JEN001/raw/JEN00116JULY.TXT` |
| Wrapper | `JEN001/scripts/reconcile_jen_v5_from_txt.mjs` |
| v4 (unchanged) | `JEN001/reports/JEN001_Statement_Account_v4.md` |

---

## Related skills

| Skill | Role |
| :--- | :--- |
| `SKILL_Debtor_Statement_v4_From_TXT.md` | Combined Part 1 layout (prior version) |
| `SKILL_Debtors_Orchestrator.md` | Lane routing |
| `SKILL_Payment_To_Invoice_Allocation.md` | Allocation lane (not this layout) |
