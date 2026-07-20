---
name: debtor-statement-v4-from-txt
description: >-
  Generates debtor Statement of Account v4 markdown from ERP TXT exports
  (CYL Settlement Allocation layout). Produces Part 1 combined ledger, Part 2
  cylinder tracker, and Debtor Position Summary. Use when rebuilding
  [CODE]_Statement_Account_v4.md, onboarding a new debtor statement, or when
  the user mentions v4 statement, ERP TXT reconcile, or position_recon layout.
---

# Debtor Statement v4 From TXT

Generate `[CODE]_Statement_Account_v4.md` for any debtor using **ERP TXT as Tier-3 authority**. Reference implementation: JEN001 / Spoon Eatery.

> **Do not** build v4 from Supabase alone. DB is for Part 2 qty and LPG/CYL split only. Part 1 running balance **must** match ERP `CURRENT BALANCE` header to the cent.

---

## When to use

| Use this skill | Do NOT use |
| :--- | :--- |
| `position_recon` + CYL v4 layout | `allocation` lane (WO0001 — use `SKILL_Payment_To_Invoice_Allocation.md`) |
| `settlement_discount` (TWK002 remittance journals) | JIM001 monthly batch (`lpg-payment-pattern-analysis`) |
| Rebuild after fresh ERP TXT ingest | DB-only extend without TXT cross-check |

---

## Prerequisites (block until met)

1. **Fresh ERP TXT** in `analysis/debtors/[CODE]/raw/` (e.g. `[CODE]CURRENT.TXT`, `[CODE]16JULY.TXT`)
2. **Trading name** from TXT `ACCOUNT:` header (not legacy doc names)
3. **Opening balances** derived from TXT + historical analysis (never copy JEN001 constants blindly)

---

## Quick start

```bash
# 1. Scaffold config (first time only)
cp analysis/debtors/shared/templates/statement_v4_config.template.json \
   analysis/debtors/[CODE]/config/statement_v4.json
# Edit: debtorCode, debtorName, txtPath, combinedBf, cylOpeningQty, cylOpeningFinancial

# 2. Generate markdown + fixture
node analysis/debtors/shared/scripts/reconcile_debtor_v4_from_txt.mjs --debtor [CODE]

# 3. Optional HTML (after Part 1 variance = R0.00)
python3 analysis/debtors/shared/scripts/export_to_html.py \
  analysis/debtors/[CODE]/reports/[CODE]_Statement_Account_v4.md \
  analysis/debtors/[CODE]/reports/[CODE]_Statement_Account_v4.html
```

**Pass gate:** console shows `variance R0.00`. If not, stop — do not sign off.

---

## Workflow

### Step 1 — Scaffold debtor folder

```
analysis/debtors/[CODE]/
├── config/
│   └── statement_v4.json      # required
├── raw/
│   └── [CODE]*.TXT             # required — REQUEST if missing
├── reports/
│   └── [CODE]_Statement_Account_v4.md
└── docs/
    └── [CODE]_Onboarding_Status.md
```

### Step 2 — Configure `statement_v4.json`

| Field | Source |
| :--- | :--- |
| `debtorName` | Trading name (e.g. Spoon Eatery) |
| `txtPath` | Relative path to authoritative TXT |
| `periodStart` | Statement start ISO date |
| `combinedBf` | ERP balance immediately before first period row |
| `bfSourceNote` | TXT line reference for audit |
| `cylOpeningFinancial` | Net cylinder financial B/F (v4 doctrine) |
| `cylOpeningQty` | Physical custody B/F per SKU (`14.1`, `19.1`, `9.1`, `D.1`, `S.1`) |
| `skuRates` | VAT-inclusive deposit rates |

Template: `analysis/debtors/shared/templates/statement_v4_config.template.json`  
JEN001 example: `analysis/debtors/JEN001/config/statement_v4.json`

### Step 3 — Run generator

Script: `analysis/debtors/shared/scripts/reconcile_debtor_v4_from_txt.mjs`

**Outputs:**

| Artifact | Path |
| :--- | :--- |
| Statement markdown | `reports/[CODE]_Statement_Account_v4.md` |
| Workspace fixture | `src/features/debtor-position-workspace/data/fixtures/[CODE].v4.json` |

### Step 4 — Validate

| Check | Pass |
| :--- | :--- |
| Part 1 closing = TXT `CURRENT BALANCE` | R0.00 variance |
| Cylinder financial vs custody | < R1.00 (flag if not) |
| `npm run debtors:sync` | After `project.json` update |

### Step 5 — Update project metadata

Append `project.json` `history` with TXT path, closing balance, variance result.

---

## Markdown layout produced

```
# Statement of Account: [Name] ([CODE]) - Version 4 (Canonical Settlement Allocation Doctrine)

## Part 1: Combined Financial Statement
  ### [Month YYYY]
  | Date | Entry Type | Doc # | Amount | Running Bal |

## Part 2: Cylinder (CYL) Ledger
  ### [Month YYYY]
  | Date | Entry Type | Doc # | 14kg | 19kg | 9kg | D.1 | S.1 |

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->
## Debtor Position Summary
  ### 1. Financial Position (LPG / CYL / Total)
  ### 2. Custody Position
  ### 3. Reconciliation Position
<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
```

---

## Part 1 rules (TXT parser)

1. Parse quoted CSV rows: `DOCNO`, `ENTRY`, `DATE`, `CUSTOMER/BANK REF`, `AMOUNT`, `BALANCE`
2. Filter `iso >= periodStart`
3. Sort: date ASC → Invoice before Crd Note same day → doc_no ASC
4. **EMPTY/CYL classification — line-level (canonical):** For each document, classify **each DB line** independently:
   - **Empty/CYL lane:** `category = 'CYL'` OR `stock_no ∈ {9.1, S.1, D.1, 19.1, 14.1, FL.1, …}` per addendum table
   - **LPG lane:** all other product lines on the same document (mixed documents are normal)
   - **Payments:** whole payment document (no line split)
   - TXT-only docs without DB lines: whole-document fallback; flag `DERIVED_FROM_VALUE` for qty
5. **Header regex demoted:** `/[-#]?EMPTY|EMPTIES/i` on `customer_ref` is **fallback only** for TXT-only docs. Do **not** use doc-level regex to strip or classify when DB lines exist — it misses typos (`E,MPTY`, `EPTY`, blank-ref companions like `DN20020.`) and manufactured phantom cross-lane residuals (MOZ002 Turn 7h: −R1,207.50).
6. **Legacy EMPTY-pair strip (doc-level):** Only when **both** sides lack DB line detail and refs match with net R0.00 — prefer line-level partition instead.
7. Running balance from `combinedBf` + lane-assigned amounts; four-lane identity must equal TXT `CURRENT BALANCE` to the cent.

### Skill changelog

| Date | Change |
| :--- | :--- |
| 2026-07-20 | Part 1 rules 4–5 rewritten: line-level CYL classification canonical; header EMPTY regex demoted to flagged fallback. Root cause: regex missed `E,MPTY`, `EPTY`, `DN20020.` on MOZ002 → Turn 7h phantom. |

---

## Part 2 rules (DB + TXT dates)

1. Cylinder qty from `vw_clean_transactions` (`debt_group = 'CYL'`)
2. Lookup by `doc_no + entry_type` only (**not** strict date — TXT/DB dates may differ)
3. Display dates from TXT; qty from DB
4. Flag when TXT docs exist but DB has no qty (ingest gap)

---

## HTML generation

`export_to_html.py` strips `<!-- INTERNAL_ONLY_* -->` blocks for customer view.

Add display-name mapping in `export_to_html.py` if new debtor:

```python
elif "[CODE]" in account:
    display_account = "Trading Name ([CODE])"
```

---

## Forking for a new debtor (checklist)

```
- [ ] REQUEST fresh ERP TXT — do not proceed without it
- [ ] Create analysis/debtors/[CODE]/config/statement_v4.json
- [ ] Derive combinedBf from TXT (balance before period start payment/invoice)
- [ ] Derive cylOpeningQty from DB historical CYL or baseline doc
- [ ] Lock commercial model (settlement NONE? CYL strip? allocation vs position_recon)
- [ ] Run reconcile_debtor_v4_from_txt.mjs --debtor [CODE]
- [ ] Verify R0.00 ERP variance
- [ ] Write [CODE]_Onboarding_Status.md
- [ ] Append project.json history; npm run debtors:sync
```

---

## JEN001 reference

| Item | Value |
| :--- | :--- |
| Archetype | `analysis/debtors/JEN001/` |
| Config | `JEN001/config/statement_v4.json` |
| TXT | `JEN001/raw/JEN00116JULY.TXT` |
| Legacy per-debtor script | `JEN001/scripts/reconcile_jen_v4_from_txt.mjs` (superseded by shared script) |
| Do not use | `reconcile_jen_v4_extended.mjs` (DB-only — failed TXT check) |

---

## Common failures

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| Part 1 variance ≠ 0 | Wrong `combinedBf` or stale TXT | Re-derive B/F from TXT line before period start |
| Missing June/July rows | DB-only extend | Use TXT generator |
| Part 2 orphan CNs | DB missing invoices | Flag ingest gap; do not silent adjust |
| Wrong customer name | Legacy doc label | Use TXT `ACCOUNT:` trading name |

---

## Doctrine addendum — line-level lanes (Turn 7i, MOZ002)

> Summarized in [`SKILL_Debtors_Orchestrator.md` §5 Orchestration Methods · §3 Evidence hierarchy](SKILL_Debtors_Orchestrator.md#3-evidence-hierarchy); **this section is canonical — edit here only.**

**Lane membership is a property of the line, not the document.**

Mixed LPG+shell invoices are the norm in cylinder trading. Partitioning TXT by document header (`EMPTY` in `customer_ref`) assigns whole headers to empty or LPG lanes and **manufactures phantom cross-lane residuals** (exactly one shell-module wide, e.g. −R1,207.50).

| Rule | Implementation |
| :--- | :--- |
| Empty/CYL lane | `transaction_items` / `vw_clean_transactions` lines where `category='CYL'` or `stock_no ∈ {9.1, S.1, D.1, 19.1, …}` |
| LPG lane | All other product lines on the same document |
| Payments | Whole payment document (no line split) |
| TXT-only docs (no DB lines) | Whole-document fallback by header desc; flag as `DERIVED_FROM_VALUE` for qty |
| Four-lane identity | LPG lines + empty lines + payments = TXT `CURRENT BALANCE` to the cent |
| Conservation | Σ registry outstanding qty per SKU class = net custody qty (basis d, per-DN cluster) |

When doc-level empty lane ≠ 0 but line-level empty lane = 0, investigate **shell lines on LPG-classified headers** (including EMPTY typos and blank-ref companions) before accepting a custody float.

---

## Related skills

| Skill | Role |
| :--- | :--- |
| `SKILL_Debtors_Orchestrator.md` | Lane routing, turn plan |
| `debtors-analysis_Skill.md` | Exception taxonomy |
| `SKILL_Payment_To_Invoice_Allocation.md` | Allocation lane (not this layout) |
