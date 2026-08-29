# TWK002 — ERP opening balance fix plan

**Debtor:** TWK002 · TWK AGRI PTY LTD · ref B226  
**Ratified:** 2026-08-29  
**Authority:** Finance/ERP execution plan. Collections posture is already locked separately — customer statement bills **open invoices only (R110,046.87)**; this document covers **ERP ledger alignment** only.

**Related:** `TWK002_Model_B_Position.md` · `TWK002_Settlement_Discount_Doctrine_v2.md` · `config/statement_of_account.json` · `shared/HUMAN_TASKS.md`

---

## Executive summary

The ERP “opening balance” problem is **two layers**. Do not conflate them.

| Layer | Amount | What it is in ERP | Can it go to zero? |
| :--- | ---: | :--- | :--- |
| **A. BALANCE B/F (export line)** | R38,791.27 | Pre–Mar 2025 running total carried into the current export window | **No** — not one bad posting; eleven remittance-backed STAT batches (Jul 2023 → Jan 2025) rolled forward |
| **B. Account-level residual (current window)** | R8,084.67 | Header R118,131.54 minus open invoices R110,046.87 | **Partially** — fixable by tagging + settlement cleanup; B/F portion stays unless history is restated |

**Collections (done):** Amount due on customer statement = **R110,046.87** only. R8,084.67 is internal Model B reconciliation — not billable.

**ERP (this plan):** Path B journals are mostly posted. Remaining work is **allocation hygiene** (Phase 2), not another discount journal wave.

---

## Current financial picture (as-at 2026-08-29)

| Item | Amount | Notes |
| :--- | ---: | :--- |
| ERP header balance | R118,131.54 | `DEBENQ_TWK002.TXT` / `TWK002CURRENT.TXT` |
| Open invoices (billable) | R110,046.87 | 11 invoices; tag gate ALLOWED (REMITTANCE_BACKED) |
| Account-level residual | R8,084.67 | 7 ratified bridge sub-lines in config — internal only |
| DB max transaction date | 2026-08-25 | TXT export still stops ~2026-08-09 — **H-013** |

### Seven bridge sub-lines (sum to R8,084.67)

| ID | Label | Amount | ERP fix lever |
| :--- | :--- | ---: | :--- |
| `bf_carry` | BALANCE B/F (pre–Mar 2025 export window) | +38,791.27 | Accept / document — not a single field to edit |
| `override_42468_42470` | Paid on STAT 114, ERP untagged | +8,950.44 | Phase 2 — tag payment slice |
| `phantom_cn_nets` | Path B phantom journal nets | +9,894.01 | Mostly absorbed in Path B; detail in phantom breakdown report |
| `stat112_untagged` | STAT 112 receipt 00037770 | −35,693.84 | **Phase 2 priority 1** — `allocation_edges.csv` AL-0109–0116 |
| `stat114_untagged` | STAT 114 untagged slice 00039080 | −7,306.68 | **Phase 2 priority 2** — tag to inv 42468/42470 |
| `stat123_orphan` | STAT 123 orphan slice 00043500 | −1,249.77 | **Phase 2 priority 3** — H-014 |
| `pathb_journals_untagged` | Path B discount journals (blank INVNO) | −5,300.76 | Already posted Path B — correct as-is |

Provenance: `reports/TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md`, `reports/TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md`, `reports/TWK002_Phantom_CN_Nets_Breakdown_2026-08-11.md`.

---

## What Path B already did

Per `data/finance_posting_checklist.csv` and `data/finance_posting_checklist_2025_phase2.csv`:

| Tranche | Scope | Status |
| :--- | :--- | :---: |
| 2023–2024 catch-up | 16 batches — journals 00000490–506 incl. hygiene 503–506 | **DONE** |
| 2025 Phase 2 | STAT 110/112/114 discount journals 00000507–509 (R735.70) | **DONE** |
| Path A (optional) | Payment header gross→cash; deposit orphan DISCOUNT strip | **NOT DONE** (`payment_done=false`, `deposit_done=false` on all checklist rows) |

Path B was the deliberate shortcut: post balancing journals in the **open period** instead of reopening archived 2023–2024 periods. Settlement arithmetic is fixed; structural weaknesses remain (untagged cash, open paid invoices, B/F carry).

---

## Phased execution plan

```
H-013 fresh TXT
    ↓
Phase 2: tag STAT 112 → STAT 114 → resolve STAT 123     ← do this first
    ↓
Re-run bridge + internal reports
    ↓
Phase 3 Path A (only if finance wants deposit audit)
    ↓
Phase 4 sign-off → reconState: complete
```

### Phase 1 — Fresh export and validate (Sources · H-013)

**Goal:** Confirm what ERP thinks today before any more posting.

| Step | Action | Command / path |
| :---: | :--- | :--- |
| 1 | Pull fresh full-history `DEBENQ_TWK002.TXT` through today | Sources Agent |
| 2 | Ingest coverage check | `npm run debtors:ingest-check -- --debtor TWK002` |
| 3 | Tag / remittance gate | `npm run debtors:tag-check -- --debtor TWK002` |
| 4 | Rebuild internal bridge (not customer statement) | `node analysis/debtors/TWK002/scripts/build_balance_bridge.mjs --write` |

**Exit criteria:** Known header balance, known open invoice sum, updated gap breakdown.

**Note:** DB already has documents not in TXT (inv 52484, CN 15443 on 2026-08-11; inv 52803, CN 15553 on 2026-08-25). Fresh export required before sign-off.

---

### Phase 2 — Payment→invoice tagging (ERP Agent · highest impact)

**Goal:** Close the current-window gap between header and open invoices. Untagged payments already reduced the balance but never cleared invoices (−R44,250.29 net in bridge).

**Mechanism:** Tagging moves open invoice balances down; header barely moves (cash already posted).

| Priority | Receipt | Amount | Remittance authority | ERP action | Human task |
| :---: | :--- | ---: | :--- | :--- | :--- |
| 1 | **00037770** (STAT 112) | −R35,693.84 | `allocation_edges.csv` **AL-0109–0116** (8 edges) | Tag payment to remittance invoices/CNs per edges | **H-022** |
| 2 | **00039080** (STAT 114) | −R7,306.68 untagged slice | Paid batch; clears **42468/42470** | Tag to those invoices or formal write-off | **H-023** |
| 3 | **00043500** (STAT 123) | −R1,249.77 orphan | 19 tagged siblings on same receipt | Identify target invoice or ratify as batch residual | **H-014** |

#### STAT 112 allocation detail (receipt 00037770)

Apply from `data/allocation_edges.csv`:

| Edge | Type | Target doc | LPG amount |
| :--- | :--- | :--- | ---: |
| AL-0109 | REMITTANCE_EXPLICIT | 39683 | 26,765.92 |
| AL-0110 | REMITTANCE_EXPLICIT | 40081 | 15,217.83 |
| AL-0111 | REMITTANCE_CN_OFFSET | 11648 (CN) | 15,473.25 |
| AL-0112 | REMITTANCE_CN_OFFSET | 11743 (CN) | 10,091.25 |
| AL-0113 | REMITTANCE_EXPLICIT | 40459 | 22,372.30 |
| AL-0114 | REMITTANCE_CN_OFFSET | 11821 (CN) | 12,950.44 |
| AL-0115 | REMITTANCE_EXPLICIT | 40950 | 24,821.42 |
| AL-0116 | REMITTANCE_CN_OFFSET | 11953 (CN) | 14,968.69 |

**Exit criteria:** Override invoices 42468/42470 no longer show open net in ERP; STAT 112 fully allocated; STAT 123 orphan resolved or ratified. Re-run `debtors:tag-check` and bridge after each tranche.

---

### Phase 3 — Path A cleanup (ERP Agent · optional)

Only if finance wants **deposit screen and payment headers** to match remittance, not just AR total. Doctrine §4 Path A — **not required** for settlement arithmetic.

| Step | What | Scope |
| :---: | :--- | :--- |
| A | Open remittance + deposit detail | Per batch |
| B | Correct payment header **gross → remittance cash** | 6× 2023 gross + 5× 2024 over-post receipts (`step_b_payment_adjust=true` in checklist) |
| C | Strip orphan **DISCOUNT** lines from deposit detail | R690 (2023) + R6,374.90 (2024 over-posts) |
| D | Discount journals at economic paid date | Already posted Path B in open period — may not be reversible |
| E | Verify `cash + discount = remittance gross` per batch | 16 + 3 batches |

**Blocker:** Archived 2023–2024 periods may be period-locked. Path A on closed periods is a finance policy call.

**Human task:** **H-024** (optional — finance decision required).

---

### Phase 4 — Sign-off and collections gate

| Step | Action |
| :---: | :--- |
| 1 | Finance controller sign-off on 16 + 3 batch checklist (H-006 follow-through) |
| 2 | Confirm header ≈ open invoices + documented B/F carry (exact match may not be achievable) |
| 3 | Set `reconState: complete` in `project.json` |
| 4 | Snapshot customer statement if sending: `npm run debtors:twk002-statement-snapshot -- --as-at YYYY-MM-DD` |

---

## B/F R38,791.27 — explicit non-goals

There is **no sensible ERP fix that zeros B/F** without a full pre–Mar 2025 ledger restatement. Doctrine explicitly rejects that.

| Option | Posture |
| :--- | :--- |
| **Accept (recommended)** | Document provenance; bill open invoices only |
| **Restate** | Reopen 2023–2024, Path A every batch, re-export — large, high risk |
| **Cosmetic opening journal** | Force header = open invoices — hides root cause |

**What we have instead:**

- Provenance: `reports/TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md` — 11 STAT batches tie exactly
- Variance explained: raw ERP vs remittance-authoritative replay differs by **R6,099.03** cumulative — origin of phantom/discount Path B journals already posted
- Operator posture: treat B/F as historical carry

---

## What we are not trying to do

- Rebuild the whole ERP ledger from scratch
- Zero B/F R38,791.27 with a single opening-balance edit
- Require Path A unless finance explicitly wants deposit-screen audit
- Bill the R8,084.67 residual to the customer (collections posture locked)
- Mix 2025 Phase 2 forward scope into 2023–2024 sign-off

---

## Regeneration commands (after ERP changes)

```bash
# After fresh TXT lands (Phase 1)
npm run debtors:ingest-check -- --debtor TWK002
npm run debtors:tag-check -- --debtor TWK002
node analysis/debtors/TWK002/scripts/build_balance_bridge.mjs --write
npm run debtors:twk002-bf-bridge

# Optional DB sync (do not overwrite allocation_edges.csv)
npm run debtors:pull-db -- --debtor TWK002
npm run debtors:knowledge-compile -- --debtor TWK002

# Customer statement (open invoices only)
node analysis/debtors/shared/scripts/generate_statement_of_account.mjs --debtor TWK002 --as-at YYYY-MM-DD --pdf
```

---

## Key paths

| Asset | Path |
| :--- | :--- |
| This plan | `docs/TWK002_ERP_Opening_Balance_Fix_Plan.md` |
| Model B north star | `docs/TWK002_Model_B_Position.md` |
| Doctrine v2 | `docs/TWK002_Settlement_Discount_Doctrine_v2.md` |
| Bridge config (7 lines) | `config/statement_of_account.json` → `balanceBridgeLines` |
| Payment→invoice edges | `data/allocation_edges.csv` |
| Finance checklist (16 batch) | `data/finance_posting_checklist.csv` |
| Phase 2 checklist | `data/finance_posting_checklist_2025_phase2.csv` |
| B/F provenance | `reports/TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md` |
| Human task queue | `analysis/debtors/shared/HUMAN_TASKS.md` (H-013, H-014, H-022–H-024) |
