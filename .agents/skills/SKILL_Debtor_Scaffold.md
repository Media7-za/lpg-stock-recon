---
name: debtor-scaffold
description: >-
  Scaffold a new debtor micro-project (analysis/debtors/{CODE}/) with its
  directories and a schema-valid project.json. Use when the operator asks to
  onboard, initialize, or set up a new debtor account code. Creates the shell
  only; it does not ingest ERP evidence or write config overrides.
---

# Debtor Scaffold

Run from the repo root:

```bash
npm run debtors:scaffold -- --code <CODE> --name "<CLIENT NAME>"
```

- `<CODE>` is the exact ERP code: 3-6 uppercase alphanumerics. The script refuses an existing directory.
- `<CLIENT NAME>` must be the real ERP name. If it is unknown, ask the operator. If the operator cannot give it yet, pass a name containing `Placeholder` so `debtors:sync` keeps warning until it is fixed. Never invent one.

## What it creates

`project.json` (`status: active`, `reconState: pending`, zeroed financials, one history event) plus empty `config/ data/ raw/ docs/ reports/`. Git does not track empty directories; they persist once evidence lands.

It deliberately creates **no** `config/*.json`. Those hold recorded operator judgement and have lane-specific shapes (see `payment_pattern_overrides.json` in JEN001 or TWK002).

## After scaffolding

1. Run the ERP freshness gate (`SKILL_Debtors_Orchestrator.md` §3): get the DEBENQ TXT from the Sources role into `raw/`.
2. `npm run debtors:ingest-check -- --debtor <CODE>`.
3. Pick the lane skill (`SKILL_Debtor_Statement_v5_From_TXT.md`, allocation, etc.).
4. Regenerate the registers: `npm run debtors:artifact-index:write`.

`debtors:sync` validates the whole portfolio and currently fails on unrelated legacy accounts; the script reports only the new account's line.
