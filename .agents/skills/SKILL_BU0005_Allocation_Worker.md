---
name: bu0005-allocation-worker
description: >
  Cold-start worker for debtor BU0005 (CHOBOZA - BULWER). Clones
  github.com/Media7-za/lpg-stock-recon — no local repo assumed. Payment-to-invoice
  allocation lane with STAT-batch rounding journals — NOT settlement discount.
  Use when dispatching BU0005 reconciliation, continuing Turns 3–5, building
  allocation_edges, finance checklists, or any work under analysis/debtors/BU0005/.
---

# BU0005 Allocation Worker

You are the **BU0005 worker agent**. You reconcile **CHOBOZA - BULWER** (ERP code `BU0005`) using the **allocation lane** (WO0001 family). You have **no prior chat context** and **no local checkout** unless you create one — follow §0 below.

**Do NOT** apply TWK002 settlement-discount turns, remittance PDF ingestion, or `settlement_discount_overrides.json` to this account.

---

## 0. Environment setup (clone from Git — required)

You start **without** the repo. Clone before any account work.

### 0.1 Clone and checkout

```bash
git clone https://github.com/Media7-za/lpg-stock-recon.git
cd lpg-stock-recon
```

**Branch / commit:** The orchestrator **must** supply `branch:` or `commit:` in the dispatch. BU0005 work may not be on `main` yet.

```bash
# If branch named (example)
git fetch origin
git checkout <branch-from-dispatch>

# If commit SHA pinned
git checkout <sha-from-dispatch>
```

### 0.2 Verify BU0005 exists on this checkout

```bash
test -f analysis/debtors/BU0005/project.json && echo OK || echo MISSING
test -f .agents/skills/SKILL_BU0005_Allocation_Worker.md && echo OK || echo MISSING
```

If **MISSING** — stop. Report to operator: *"BU0005 folder not on this branch/commit. Push work or specify branch."* Do not scaffold from scratch unless explicitly told to.

### 0.3 Install deps (for `debtors:sync` only)

Turns 3–5 are **file-based** (TXT + CSV + markdown). No database or Supabase required.

```bash
npm install
npm run debtors:sync    # must PASS after project.json edits
```

`DATABASE_URL` is **not** required for BU0005 TXT-only allocation work. Do not run `payment_doc_allocation.mjs` (WO0001 DB script) unless dispatch explicitly requests DB mode.

### 0.4 Paths

All paths below are relative to **repo root** (`lpg-stock-recon/`).

### 0.5 Delivering work back

Only commit when the operator explicitly asks.

```bash
git checkout -b bu0005/turn-3-allocation   # or use branch from dispatch
git add analysis/debtors/BU0005/ .agents/skills/SKILL_BU0005_Allocation_Worker.md
git status && git diff --staged
git commit -m "$(cat <<'EOF'
BU0005 Turn 3: allocation graph and payment allocation report.

EOF
)"
git push -u origin HEAD
```

Open a PR if that is the team workflow; otherwise report branch name and commit SHA to the orchestrator.

---

## 0A. Cold-start protocol (after clone)

1. Re-read **this skill** from `.agents/skills/SKILL_BU0005_Allocation_Worker.md` (in clone).
2. Read `analysis/debtors/BU0005/reports/BU0005_Onboarding_Status.md` — current turn and blockers.
3. Read `analysis/debtors/BU0005/project.json` — `reconState`, `financials`, `history`.
4. Read `analysis/debtors/BU0005/docs/BU0005_Allocation_Doctrine_v1.md` — locked rules.
5. Read raw ledgers only as needed:
   - `analysis/debtors/BU0005/raw/BU0005.TXT` (CURRENT, Jan–Jun 2026)
   - `analysis/debtors/BU0005/raw/BU00052023.TXT` (2022 activity; closes at B/F)
6. Optional cross-check: `ERP RAW DATA/DETRANS.TXT` (BU0005 payment ref splits).
7. Load parent skills from clone when executing allocation logic:
   - `.agents/skills/SKILL_Payment_To_Invoice_Allocation.md`
   - `.agents/skills/debtors-analysis_Skill.md`
8. After any `project.json` change: `npm run debtors:sync` (must PASS).

**Work one turn at a time.** State the next single turn and inputs needed before expanding scope.

---

## 1. Account snapshot (locked)

| Field | Value |
| :--- | :--- |
| **Code** | BU0005 |
| **Name** | CHOBOZA - BULWER |
| **Terms** | COD |
| **Lane** | `allocation` |
| **reconState** | `in-progress` |
| **Outstanding** | R3,450.17 |
| **Open LPG invoice** | 00050949 — R2,087.22 (DN#22609) |
| **Remittances** | Not expected (COD Bulwer-family payer) |

### Commercial model (do not re-litigate)

| Element | Ruling |
| :--- | :--- |
| Settlement discount | **NONE** |
| Discount terms | **NONE** |
| Unit of work | Invoice `ref_no` / proximity to LPG doc |
| Match target | **LPG-only** — strip CYL/EMPTY before compare |
| CYL in match base | **No** |
| Payment pattern | EFT `TRANSF \| STAT 12x` (122, 124, 125 in CURRENT) |

---

## 2. Rounding doctrine (locked 2026-07-15)

When `payment_header > lpg_invoice_amount`:

```text
payment_header  = lpg_amount + rounding_slice
lpg_slice         → allocation edge to invoice doc_no
rounding_slice    → DISCOUNT ALLOWED journal (ERP Agent), post date = payment date
```

| Task | Payment | LPG doc | LPG amt | Rounding | Status |
| :--- | :--- | :--- | ---: | ---: | :--- |
| TASK-BU0005-000 | 00016579+00016837 | 00016195 | 1,493.19 | 1.81 | OPEN |
| TASK-BU0005-001 | 00043092 | 00048766 | 1,027.87 | 2.13 | OPEN |
| TASK-BU0005-002 | 00043648 | 00049566 | 2,697.51 | 2.49 | OPEN |
| TASK-BU0005-003 | 00044065 | 00050193 | 1,159.38 | 10.62 | OPEN |

Artifacts: `data/finance_posting_checklist.csv`, `data/proforma_rounding_journals.csv`  
ERP playbook: `.agents/skills/SKILL_Human_ERP_Agent.md`

**STAT 122 split confirmed** in `ERP RAW DATA/DETRANS.TXT` (ref `00048766` + R2.13 orphan). CURRENT TXT **excludes allocation detail** — use DETRANS when ref splits matter.

---

## 3. Balance bridge (verified)

```text
2023 export close     R1,378.19  =  R1,380.00 legacy B/F  −  R1.81 (D/N2406)
CURRENT B/F           R1,378.19  ✓  (chains from 2023 close)

Post-STAT125 residual R1,362.95  =  R1,378.19  −  (2.13 + 2.49 + 10.62)

Current outstanding   R3,450.17  =  R1,362.95 residual  +  R2,087.22 (inv 00050949)
```

Report: `reports/BU0005_BF_Bridge_v1.md`

**Gap:** No ERP rows between 2022-11-15 and 2026-01-14 in available exports. Legacy **R1,380.00** has no pre-2022 TXT.

---

## 4. CURRENT ledger inventory (BU0005.TXT)

### STAT payments (2026)

| Payment | Date | STAT | Header | LPG target | Rounding |
| :--- | :--- | :--- | ---: | :--- | ---: |
| 00043092 | 2026-01-16 | 122 | 1,030.00 | 00048766 / 1,027.87 | 2.13 |
| 00043648 | 2026-03-11 | 124 | 2,700.00 | 00049566 / 2,697.51 | 2.49 |
| 00044065 | 2026-04-21 | 125 | 1,170.00 | 00050193 / 1,159.38 | 10.62 |

Pilot review (invoice vs receipt): `reports/BU0005_Pilot_Review_Invoice_vs_Receipt.md`  
STAT 125: invoice **2026-04-10**, receipt **2026-04-21** (+11d) — **pending operator sign-off**.

### Dual-line DN pattern

Each delivery = LPG invoice + `-EMPTY` invoice; EMPTY cleared by CN (usually within days). One May exception: CN **00014992** reversed full LPG **00050906** (DN#22444), re-issued as **00050949** (DN#22609).

Register: `data/dn_pairs.csv`, `data/invoices.csv`, `data/payments.csv`

---

## 5. Turn plan and status

| Turn | Deliverable | Status |
| :---: | :--- | :---: |
| 1 | Scaffold + doctrine | ✅ |
| 2 | ERP ingest + pilot STAT 125 | ✅ |
| 2+ | B/F bridge (BU00052023.TXT) | ✅ |
| **3** | **Full allocation graph** | ⏳ **NEXT** |
| 4 | Overrides + exception audit | ⏸ |
| 5 | Statement bridge + recon complete | ⏸ |

### Turn 3 — definition of done

- [ ] `data/allocation_edges.csv` — all payments (2022 D/N2406 + 3× STAT 2026)
- [ ] `reports/BU0005_Payment_Allocation_v1.md` — narrative + tier summary
- [ ] Promote pilot edges from `data/allocation_edges_pilot.csv` where approved
- [ ] Update `reports/BU0005_Onboarding_Status.md`
- [ ] Append `project.json` `history`; `npm run debtors:sync` PASS

### Turn 4 — definition of done

- [ ] Populate `config/payment_pattern_overrides.json` (approved exceptions only)
- [ ] Exception audit CSV or section in allocation report
- [ ] DN-pair recon for any EMPTY anomalies (esp. DN#22444 LPG CN)

### Turn 5 — definition of done

- [ ] `reports/BU0005_Statement_Account_v1.md` — bridge to R3,450.17
- [ ] Set `reconState: complete` only if variances signed off or journaled
- [ ] Do **not** recommend collection until `reconState: complete`

---

## 6. Artifact layout

```text
analysis/debtors/BU0005/
├── project.json
├── config/payment_pattern_overrides.json   # empty until Turn 4 approvals
├── docs/BU0005_Allocation_Doctrine_v1.md
├── raw/BU0005.TXT
├── raw/BU00052023.TXT
├── data/
│   ├── invoices.csv
│   ├── payments.csv
│   ├── payments_historical.csv
│   ├── dn_pairs.csv
│   ├── allocation_edges_pilot.csv
│   ├── finance_posting_checklist.csv
│   └── proforma_rounding_journals.csv
└── reports/
    ├── BU0005_Onboarding_Status.md        # ← status board (keep updated)
    ├── BU0005_BASELINE_v1.md
    ├── BU0005_BF_Bridge_v1.md
    ├── BU0005_Allocation_Pilot_STAT125.md
    └── BU0005_Pilot_Review_Invoice_vs_Receipt.md
```

**Out of scope:** `settlement_discount_overrides.json`, remittance manifests, TWK002 recreated ledger.

---

## 7. Allocation rules (BU0005-specific)

Apply WO0001 skill with these account overrides:

| Rule | BU0005 ruling |
| :--- | :--- |
| LPG match ≤ R0.05 | Tier 1 confirmed |
| `payment_header − lpg > R0.05` | Treat excess as **rounding** (not open invoice) once operator rule locked |
| Blank `ref_no` on CURRENT TXT | Use DETRANS ref split if present; else proximity + amount inference → override in Turn 4 |
| Prepayment | `payment_date < invoice_date` → UNALLOCATED, `review_required: true` |
| One EFT = one pass | Never sum across payment docs |
| Overrides | Never silent-adjust — register in `payment_pattern_overrides.json` |

### Override JSON shape (per edge)

```json
{
  "payment_doc": "00044065",
  "payment_date": "2026-04-21",
  "target_doc": "00050193",
  "allocated_amount": 1159.38,
  "override_type": "PROBABLE_PROXIMITY_BLANK_REF",
  "approval_status": "pending",
  "reason": "STAT 125; 11d lag; rounding R10.62 → DISCOUNT ALLOWED",
  "evidence_source": "raw/BU0005.TXT",
  "reconciled_month": "2026-04"
}
```

---

## 8. Rules of engagement

| Rule | Detail |
| :--- | :--- |
| Tier-1 authority | ERP TXT + DETRANS ref splits; bank deposit for cash sign-off only |
| Tolerance | R0.05 on LPG slice; rounding slices are **not** match variance |
| Exceptions | Every non-standard line → overrides JSON — never silent adjust |
| Finance posting | Analysis separate from ERP catch-up; queue via finance checklist |
| Collections gate | No collection action until `reconState: complete` |
| Commits | Only when the user explicitly asks |
| One turn at a time | Do not skip to statement bridge before allocation graph |

---

## 9. Commands

```bash
# Validate project.json + regenerate portfolio dashboard
npm run debtors:sync
```

Optional cross-check: `ERP RAW DATA/DETRANS.TXT` for BU0005 payment allocation rows.

---

## 10. Blockers (check before Turn 3)

1. **Pilot sign-off** — STAT 125, 11-day invoice→receipt lag (`BU0005_Pilot_Review_Invoice_vs_Receipt.md`).
2. **Legacy R1,380.00** — no pre-2022 TXT.
3. **2023–2025 gap** — confirm dormant or ingest missing year exports.
4. **Rounding journals R17.05** — ERP Agent tasks OPEN (analysis can proceed; recon complete may wait on posting).

---

## 11. Dispatch template (orchestrator → you)

```text
debtorCode: BU0005
lane: allocation
skill: SKILL_BU0005_Allocation_Worker.md
repo: https://github.com/Media7-za/lpg-stock-recon.git
branch: <required — BU0005 may not be on main>
commit: <optional SHA pin>
phase: turn_3_allocation_graph
inputs: [raw/BU0005.TXT, raw/BU00052023.TXT, data/*.csv]
definitionOfDone:
  - allocation_edges.csv complete
  - BU0005_Payment_Allocation_v1.md
  - onboarding status + project.json history updated
  - npm run debtors:sync PASS
deliverBack:
  - push branch + report SHA (or open PR)
humanTasks: [TASK-BU0005-000..003 ERP rounding journals]
```

---

## 12. Related skills

| Skill | When |
| :--- | :--- |
| `SKILL_Payment_To_Invoice_Allocation.md` | Edge-building logic |
| `SKILL_Debtors_Project_Manager.md` | `project.json` / sync |
| `SKILL_Debtors_Orchestrator.md` | Portfolio routing — BU0005 is allocation not settlement_discount |
| `SKILL_Human_ERP_Agent.md` | Posting DISCOUNT ALLOWED rounding journals |
| `debtors-analysis_Skill.md` | Exception taxonomy, report sections |
