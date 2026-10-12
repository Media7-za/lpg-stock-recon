---
name: allocation-worker
description: >
  Cold-start worker for invoice-linked debtors (WO0001 family). Use when
  starting a new allocation-lane session, running Turn 2 pilot, building
  allocation_edges.csv, or continuing allocation work on any debtor whose
  payments carry ref_no → invoice doc_no. NOT for monthly batch payers (JIM001)
  or settlement-discount accounts (TWK002). Account-specific workers (e.g.
  BU0005) extend this skill.
---

# Allocation Lane Worker (generic)

You are the **allocation worker agent** for debtor **`[DEBTOR_CODE]`**. You build the payment→invoice allocation graph using the **allocation lane** (WO0001 family). You have **no prior chat context** unless the operator pasted a handoff — follow §0 below.

**Do NOT** apply monthly batch payment-pattern analysis (JIM001), settlement-discount turns (TWK002), or replace a v5 position statement unless explicitly dispatched to both lanes.

---

## 0. Session starter (paste this to open a new account / session)

Replace bracketed fields, then send as your first message:

```text
Role: ALLOCATION-WORKER

Read and follow: .agents/skills/SKILL_Allocation_Worker.md
Then: .agents/skills/SKILL_Payment_To_Invoice_Allocation.md

debtorCode: [DEBTOR_CODE]
debtorName: [TRADING NAME FROM TXT HEADER]
lane: allocation
turn: [1 | 2_pilot | 3_full_graph | 4_overrides | 5_statement_bridge]
pilotFrom: [YYYY-MM-DD]          # Turn 2 only — e.g. first month of CURRENT TXT
pilotTo: [YYYY-MM-DD]            # Turn 2 only — e.g. TXT as-at date
prerequisite: [none | v5_position_recon_PASS | prior_turn_complete]

Mandatory reads (in order):
1. analysis/debtors/[DEBTOR_CODE]/reports/[DEBTOR_CODE]_Onboarding_Status.md (create if missing)
2. analysis/debtors/[DEBTOR_CODE]/raw/[DEBTOR_CODE]CURRENT.TXT (or operator-supplied TXT path)
3. analysis/debtors/shared/docs/ALLOCATION_DOCTRINE.md
4. Reference engine: analysis/debtors/MOZ002/scripts/allocation_ingest.mjs

Payer-class gate (before Turn 2):
- Confirm >50% of payment rows have ref_no → invoice doc_no (not Alloc/Recon/blank)
- If NO → STOP and switch to lpg-payment-pattern-analysis (JIM001 skill)

Turn 2 pilot definition of done:
- [ ] allocation_edges.csv (pilot period only)
- [ ] [DEBTOR_CODE]_Payment_Allocation_v1.md
- [ ] ≥90% edges Tier 1/2 OR explicit exception register with operator review items
- [ ] [DEBTOR_CODE]_Onboarding_Status.md updated
- [ ] Do NOT change reconState without operator authority

Rules (locked):
- LPG-only match target; sum payment doc slices; exclude Alloc/Recon mirrors
- CN net gate before payment match; no prepayment auto-allocate; no instalment chaining
- Dedupe duplicate vw_clean_transactions line rows before LPG sums
- Do not commit unless operator asks

DATABASE_URL required for DB mode. Run ingest check if v5 already onboarded:
  npm run debtors:ingest-check -- --debtor [DEBTOR_CODE]
  PGSSL_REJECT_UNAUTHORIZED=false node analysis/debtors/[DEBTOR_CODE]/scripts/allocation_ingest.mjs
```

---

## 1. Environment setup

### 1.1 Local repo (Cursor / Claude Code)

```bash
cd /path/to/lpg-stock-recon
npm install
```

Ensure `.env` contains `DATABASE_URL` for Supabase-backed allocation runs.

### 1.2 Claude.ai / no local checkout

See `docs/handoffs/Session_Starter.md` — clone first, then use §0 session starter.

### 1.3 Verify debtor folder

```bash
DEBTOR=[DEBTOR_CODE]
test -d "analysis/debtors/$DEBTOR" && echo OK || echo MISSING
test -f "analysis/debtors/$DEBTOR/raw/${DEBTOR}CURRENT.TXT" && echo TXT_OK || echo TXT_MISSING
```

If folder **MISSING** — scaffold only when operator explicitly requests Turn 1 onboarding:

```text
analysis/debtors/[DEBTOR_CODE]/
├── raw/[DEBTOR_CODE]CURRENT.TXT      ← operator must supply
├── config/statement_v5.json          ← if position_recon also needed
├── config/payment_pattern_overrides.json   ← empty until Turn 4
├── data/allocation_edges.csv
├── docs/[DEBTOR_CODE]_Allocation_Doctrine_v1.md
├── reports/[DEBTOR_CODE]_Onboarding_Status.md
├── reports/[DEBTOR_CODE]_Payment_Allocation_v1.md
└── scripts/allocation_ingest.mjs     ← copy from MOZ002, parameterise DEBTOR/FROM/TO
```

---

## 2. Cold-start protocol (every session)

1. Re-read **this skill** and `SKILL_Payment_To_Invoice_Allocation.md`.
2. Read `analysis/debtors/[DEBTOR_CODE]/reports/[DEBTOR_CODE]_Onboarding_Status.md`.
3. Read `project.json` if present — note `reconState`; **do not change without operator authority**.
4. Read CURRENT TXT header (`ACCOUNT:`, `CURRENT BALANCE:`).
5. Run payer-class gate (§3) before building edges.
6. Work **one turn at a time** — state next turn and blockers before expanding scope.

---

## 3. Payer-class gate (mandatory)

From `SKILL_Payment_To_Invoice_Allocation.md` §13:

```text
Does >50% of payment value have ref_no → invoice.doc_no?
├── YES → continue allocation lane (this skill)
└── NO  → STOP → lpg-payment-pattern-analysis (JIM001)
```

Quick SQL (replace `:debtor`):

```sql
SELECT
  COUNT(*) FILTER (WHERE ref_no NOT IN ('','Alloc','Recon')) AS with_ref,
  COUNT(*) AS total
FROM transaction_headers
WHERE account_no = :debtor AND entry_type = 'Payment';
```

Document result in `[DEBTOR_CODE]_Allocation_Doctrine_v1.md` §0.

---

## 4. Turn plan

| Turn | Goal | Key deliverables |
| :---: | :--- | :--- |
| **1** | Scaffold + commercial model + payer-class gate | `Onboarding_Status.md`, `Allocation_Doctrine_v1.md`, optional v5 if position also needed |
| **2** | **Pilot** — one period (e.g. one month or one STAT batch) | `allocation_edges.csv`, `Payment_Allocation_v1.md`, pilot report |
| **3** | Full allocation graph (CURRENT TXT period) | Complete `allocation_edges.csv`, tier summary |
| **4** | Operator overrides + exception audit | `payment_pattern_overrides.json`, exception register |
| **5** | Statement bridge + recon complete | Bridge to ERP closing; `reconState: complete` only if signed off |

### Turn 2 pilot gate

- **≥90%** of pilot edges at Tier 1 or 2 (confirmed, not review-required).
- Material blank-ref slices → Tier 5 review (do not auto-allocate).
- Pilot **FAIL** is a valid outcome — document review queue and stop full roll-out until operator ratifies.

---

## 5. Execution (DB mode)

Reference implementations (copy and parameterise — do not reinvent tier logic):

| Account | Script |
| :--- | :--- |
| MOZ002 | `analysis/debtors/MOZ002/scripts/allocation_ingest.mjs` |
| MON001 pilot | `analysis/debtors/MON001/scripts/allocation_ingest_pilot.mjs` |
| WO0001 | `analysis/debtors/shared/scripts/payment_doc_allocation.mjs` |

Typical run:

```bash
npm run debtors:ingest-check -- --debtor [DEBTOR_CODE]

PGSSL_REJECT_UNAUTHORIZED=false node analysis/debtors/[DEBTOR_CODE]/scripts/allocation_ingest.mjs
```

### Locked matching rules

| Rule | Ruling |
| :--- | :--- |
| Match target | **LPG line total** — not header, not CYL |
| Payment splits | Sum by `doc_no` before match |
| Exclude | `ref_no IN ('Alloc','Recon')` |
| Tolerance | R0.05 Tier 1; R0.06–R1.00 → review |
| Prepayment | `payment_date < invoice_date` → UNALLOCATED + review |
| Instalments | One EFT = one pass — never sum across payment docs |
| CN gate | Apply LPG CN offsets before payment match |
| Line dedupe | `DISTINCT ON` duplicate vw_clean_transactions rows |

---

## 6. Deliverables (every material run)

| Artifact | Path |
| :--- | :--- |
| Allocation edges | `analysis/debtors/[DEBTOR_CODE]/data/allocation_edges.csv` |
| Allocation report | `analysis/debtors/[DEBTOR_CODE]/reports/[DEBTOR_CODE]_Payment_Allocation_v1.md` |
| Doctrine (locked rules) | `analysis/debtors/[DEBTOR_CODE]/docs/[DEBTOR_CODE]_Allocation_Doctrine_v1.md` |
| Status board | `analysis/debtors/[DEBTOR_CODE]/reports/[DEBTOR_CODE]_Onboarding_Status.md` |
| Overrides (Turn 4+) | `analysis/debtors/[DEBTOR_CODE]/config/payment_pattern_overrides.json` |

Report sections: follow `SKILL_Payment_To_Invoice_Allocation.md` §8.

After `project.json` edits: `npm run debtors:sync` (must PASS).

---

## 7. Relationship to position_recon (v5)

Allocation lane and v5 position recon are **parallel**, not substitutes:

| Lane | Answers |
| :--- | :--- |
| **v5 position_recon** | ERP combined balance R0.00; LPG/CYL sub-ledger tie |
| **allocation** | Which payment cleared which invoice; open invoice proof |

Run v5 first when onboarding a new debtor (Turn 1). Run allocation Turn 2 pilot once v5 PASS or operator waives.

---

## 8. Rules of engagement

| Rule | Detail |
| :--- | :--- |
| Evidence tiers | `ALLOCATION_DOCTRINE.md` + `DEBTORS_DOCTRINE.md` D14/D15 |
| Overrides | Never silent-adjust — register in `payment_pattern_overrides.json` |
| Collections gate | No collection action until `reconState: complete` |
| Commits | Only when operator explicitly asks |
| reconState | Do not set `complete` with open Tier 5 items unless operator signs off |

---

## 9. Dispatch template (orchestrator → worker)

```text
debtorCode: [DEBTOR_CODE]
lane: allocation
skill: SKILL_Allocation_Worker.md
phase: turn_2_pilot
pilotFrom: YYYY-MM-DD
pilotTo: YYYY-MM-DD
inputs:
  - raw/[DEBTOR_CODE]CURRENT.TXT
  - reports/[DEBTOR_CODE]_Statement_Account_v5.md   # if Turn 1 v5 done
definitionOfDone:
  - allocation_edges.csv (pilot period)
  - [DEBTOR_CODE]_Payment_Allocation_v1.md
  - Onboarding_Status.md updated
  - pilot gate result documented (PASS/FAIL)
humanTasks: [list Tier 5 review items for operator]
```

---

## 10. Related skills

| Skill | When |
| :--- | :--- |
| `SKILL_Payment_To_Invoice_Allocation.md` | Tier algorithm + report template |
| `SKILL_Debtor_Statement_v5_From_TXT.md` | Turn 1 position_recon (parallel) |
| `SKILL_Debtors_Orchestrator.md` | Portfolio routing |
| `SKILL_Debtors_Project_Manager.md` | `project.json` / sync |
| `SKILL_BU0005_Allocation_Worker.md` | BU0005-specific (rounding journals) |
| `lpg-payment-pattern-analysis` | Monthly batch payers — **mutually exclusive** |

---

## 11. Known account mapping (reference)

| Account | Allocation worker |
| :--- | :--- |
| WO0001 | Generic + `payment_doc_allocation.mjs` |
| MOZ002 | Generic + `MOZ002/scripts/allocation_ingest.mjs` |
| MON001 | Generic + `MON001/scripts/allocation_ingest_pilot.mjs` |
| BU0005 | `SKILL_BU0005_Allocation_Worker.md` (rounding doctrine) |
| JIM001 | **Not allocation** — payment-pattern skill |
