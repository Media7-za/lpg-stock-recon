# TWK002 — ERP opening balance fix plan

**Debtor:** TWK002 · TWK AGRI PTY LTD · ref B226  
**Ratified:** 2026-08-29  
**Authority:** Finance/ERP execution plan. Collections posture is already locked separately — customer statement bills **open invoices only (R110,046.87)**; this document covers **ERP ledger alignment** only.

**Related:** `TWK002_Model_B_Position.md` · `TWK002_Settlement_Discount_Doctrine_v2.md` · `config/statement_of_account.json` · `shared/HUMAN_TASKS.md`  
**Root cause (2026-08-30):** `reports/TWK002_Account_Level_Residual_Root_Cause_2026-08-30.md` — sub-ledger ↔ GL desync. Tagging does **not** reduce the residual *total*.  
**Residual lever (operator 2026-08-30):** H-027 current-period **BS reclassification** — `docs/TWK002_ERP_Agent_Note_H027_BS_Reclassification.md`. Not accept-in-header. Not P&L write-off.

---

## Executive summary

The ERP “opening balance” problem is **two layers**. Do not conflate them.

| Layer | Amount | What it is in ERP | Can it go to zero? |
| :--- | ---: | :--- | :--- |
| **A. BALANCE B/F (export line)** | R38,791.27 | Pre–Mar 2025 running total carried into the current export window | **No** — not one bad posting; eleven remittance-backed STAT batches (Jul 2023 → Jan 2025) rolled forward |
| **B. Account-level residual (current window)** | R8,084.67 | Header − statement open (identity). After STAT 129 + H-025: R26,498.36 − R18,413.69 | **H-027 BS reclass** (DR suspense / CR AR) after hygiene tagging. ~~Accept vs write-off~~ **superseded 2026-08-30 (evening)** |

**Collections (done):** Amount due on customer statement = **R110,046.87** only. R8,084.67 is internal Model B reconciliation — not billable.

**ERP (this plan):** Path B journals are mostly posted. **Hygiene tagging first** (H-022 / H-023 / H-026) — required before the journal; does not change residual *total*. **Residual lever:** H-027 current-period BS reclassification (quarantine into AR Historical Reconciliation Suspense). Tagging is not a residual lever — see §Root cause.

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
| `override_42468_42470` | Paid on STAT 114, ERP untagged | +8,950.44 | Hygiene (H-023) — already excluded from statement open; tagging does not move residual |
| `phantom_cn_nets` | Path B phantom journal nets | +9,894.01 | Mostly absorbed in Path B; detail in phantom breakdown report |
| `stat112_untagged` | STAT 112 receipt 00037770 | −35,693.84 | Hygiene only (H-022) — already in the header; tagging does not move residual |
| `stat114_untagged` | STAT 114 untagged slice 00039080 | −7,306.68 | Hygiene only (H-023) — already in the header |
| `stat123_orphan` | STAT 123 orphan slice 00043500 | −1,249.77 | Hygiene / ratify (H-014) — already in the header |
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

## Root cause of R8,084.67 (2026-08-30)

> Full write-up: `reports/TWK002_Account_Level_Residual_Root_Cause_2026-08-30.md`.

The residual is **header − statement open**. It is not a missing invoice. The seven bridge lines already name every component (H-019, PROVEN). They are a **decomposition of the plug**, not levers.

**True root cause (operator 2026-08-30):** **sub-ledger ↔ GL desynchronization.**

1. **Historical gross posting** — 11 STAT batches (2023–2024) posted at gross instead of cash + discount, inflating B/F carry.
2. **Blank / phantom INVNOs** — Path B P&L-fix journals and cash receipts saved with blank or non-existent INVNOs.

Unallocated credits and phantom journals sit in **AR Control** (the header) with no corresponding open-invoice line. That is a permanent structural gap.

**Natural experiment — STAT 129:** cash `00045899` closed the R110,046.87 cluster; residual survived. Journal `00000510` (new money, H-025) moved the plug by −R1,223.45, then restored **R8,084.67** vs the post-journal header. Allocation did not.

| Route | Residual effect | Status |
| :--- | :--- | :--- |
| **Current-period BS reclass** — DR AR Historical Reconciliation Suspense / CR AR Control | Header → statement open; artefact quarantined on BS (no P&L) | **Ratified** — **H-027** |
| ~~Accept + leave in AR Control~~ | Header stays above billable | **Superseded 2026-08-30 (evening)** |
| ~~P&L / bad-debt write-off~~ | Hits expense | **Rejected** — not credit-risk |
| Phase 2 tagging | **Total unchanged**; composition of 7 lines cleaner | **Required before H-027** (hygiene) |
| Path A restatement | Rejected | — |

---

## Phased execution plan

```
H-013 fresh TXT (validate header vs open)
    ↓
Phase 2 hygiene tagging — H-022 (112) → H-023 (114) → H-026 (129)
    ↓
Fresh TXT + rebuild bridge (post-tag residual; expected R8,084.67)
    ↓
H-027 current-period BS reclass (DR suspense / CR AR)   ← only residual lever
    ↓
Fresh TXT → header = open invoices → strip 42468/42470 overrides → Phase 4
    ↓
Phase 3 Path A remains optional (deposit-screen audit only)
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

### Phase 2 — Payment→invoice tagging (ERP Agent · required hygiene before H-027)

> **SUPERSEDED 2026-08-30 (afternoon) — do not follow the next sentence as a residual plan.**
> ~~Goal: Close the current-window gap between header and open invoices.~~
> Tagging does **not** reduce the account-level residual *total*. Residual elimination is **H-027 BS reclass**.

**Corrected goal:** Exhaust every mechanical allocation so Finance can see the residual is not unallocated cash. Clears the ERP open-invoice screen and allows `closedInvoiceOverrides` for 42468/42470 to be removed **after** H-023 verifies. Changes **composition** of the seven lines (override / untagged collapse); does **not** change the net.

**Mechanism:** Tagging assigns already-posted cash to invoice rows. Header does not move. Tagging a credit to a *still-open* invoice would shrink statement open and **widen** the residual (reshuffle). H-022 / H-023 / H-026 targets are already off the remittance open list, so the **net** should stay R8,084.67.

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

**Exit criteria (hygiene):** 42468/42470 no longer show open net in ERP; STAT 112 and STAT 129 fully allocated. H-014 (STAT 123 orphan) is **not** on the H-027 critical path. Re-run `debtors:tag-check` after each tranche. **A still-present R8,084.67 residual is expected — proceed to rebuild + H-027.**

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

### Phase 2.5 — Residual quarantine (Finance · H-027)

**This is the only residual lever.** **Wait for Phase 2 tagging + rebuilt bridge** — then post.

> **SUPERSEDED 2026-08-30 (evening):** ~~Accept vs P&L write-off.~~ Operator ratified a **current-period balance-sheet reclassification**.

**Instruction:** `docs/TWK002_ERP_Agent_Note_H027_BS_Reclassification.md`.

| Line | Debit | Credit |
| :--- | :--- | :--- |
| AR Historical Reconciliation Suspense (BS) | post-tag residual (expected R8,084.67) | |
| Accounts Receivable Control — TWK002 (BS) | | same |

No P&L. No 240000. No 2023–2024 period unlock. Optional: split across the seven post-tag bridge lines; one net journal + 7-line attachment is standard.

**Expected after post + fresh TXT:** header = statement open (R18,413.69 if 52484 + 52803 unchanged). Suspense holds the quarantined residual with the 7-line narrative.

---

### Phase 4 — Sign-off and collections gate

| Step | Action |
| :---: | :--- |
| 1 | Finance controller sign-off on 16 + 3 batch checklist (H-006 follow-through) |
| 2 | **H-027 posted** — fresh TXT shows header = Σ open invoices; suspense = residual |
| 3 | Worker: remove 42468/42470 from `closedInvoiceOverrides` if ERP closed; set `collapseAccountLevelAsOpeningBalance: false`; comment that residual is on BS suspense |
| 4 | Set `reconState: complete` in `project.json` |
| 5 | Snapshot customer statement if sending: `npm run debtors:twk002-statement-snapshot -- --as-at YYYY-MM-DD` |

---

## B/F R38,791.27 — explicit non-goals

There is **no sensible ERP fix that zeros B/F** without a full pre–Mar 2025 ledger restatement. Doctrine explicitly rejects that.

| Option | Posture |
| :--- | :--- |
| **Accept (recommended)** | Document provenance; bill open invoices only |
| **Restate** | Reopen 2023–2024, Path A every batch, re-export — large, high risk |
| **Cosmetic opening journal** (no suspense, no 7-line attachment) | Force header = open invoices — hides root cause. **Not** H-027. |
| **H-027 BS reclass** (ratified) | Current-period DR suspense / CR AR with 7-line provenance — quarantines the artefact; does not restate B/F |

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
- Treat Phase 2 tagging as residual elimination (superseded 2026-08-30)
- Leave the residual in AR Control as "accepted" (superseded 2026-08-30 evening — H-027 quarantines it)
- Write the residual to P&L / bad debt / DISCOUNT ALLOWED 240000
- Search for a missing invoice of R8,084.67 (identity already fully decomposed — H-019)
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
| Residual root cause | `reports/TWK002_Account_Level_Residual_Root_Cause_2026-08-30.md` |
| H-027 ERP instruction | `docs/TWK002_ERP_Agent_Note_H027_BS_Reclassification.md` |
| Human task queue | `analysis/debtors/shared/HUMAN_TASKS.md` (H-013, H-014, H-022–H-027) |

---

## Epistemic status & tripwires

> Per `DEBTORS_DOCTRINE.md` §6. Material numbers for ERP execution only — collections due remains snapshot-backed.

| Claim | Tag | Source | Kill condition |
| :--- | :--- | :--- | :--- |
| ERP header R118,131.54 | **PROVEN** | `raw/DEBENQ_TWK002.TXT` CURRENT BALANCE | H-013 TXT shows different header without re-bridge |
| Open invoices R110,046.87 (11) | **PROVEN** | `snapshots/2026-08-11_v1/manifest.json` | Tag-check BLOCKED; fresh TXT adds/removes open rows |
| Bridge residual R8,084.67 | **PROVEN** | `config/statement_of_account.json` `balanceBridgeLines` sum | Bridge rebuild after TXT ≠ sum of 7 lines |
| B/F R38,791.27 provenance | **PROVEN** | `reports/TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md` | Historical TXT/recreated ledgers regenerated with different adjustments |
| Residual is pure settlement-discount artefact | **ASSERTED rejected** | Hypothesis review 2026-08-29 — directionally discount-related but bundle includes untagged cash + phantom nets | Full replay shows gap closes without tagging (unlikely) |
| Phase 2 tagging closes header−open gap | **ASSERTED rejected** | `reports/TWK002_Account_Level_Residual_Root_Cause_2026-08-30.md` — tagging does not post new money | A tag post is observed to change **header** (would mean a journal, not allocation) |
| Residual = missing invoice of R8,084.67 | **ASSERTED rejected** | 7-line identity PROVEN (H-019) | Fresh TXT + config gap ≠ rebuilt bridge-line sum ± known new blank-INVNO journals |
| Residual = sub-ledger ↔ GL desync | **ASSERTED** (operator 2026-08-30) | Gross STAT history + blank/phantom INVNO Path B/cash | Fresh export restates B/F as named invoices *and* all journals carry real INVNOs |
| H-027 is BS reclass not P&L write-off | **ASSERTED** (operator 2026-08-30) | ERP agent note H-027 | Journal posted to 240000 or bad-debt expense |
| Path A required for arithmetic | **ASSUMED false** | Doctrine v2 §4; checklists show Path B DONE, Path A not done | Finance asserts deposit screen must tie before sign-off → triggers H-024 |
| DB ahead of TXT (Aug 11/25 docs) | **PROVEN** | `data/db_pull_meta.json` max 2026-08-25 vs TXT ~2026-08-09 | H-013 export includes those docs |

### Tripwires (closed rulings)

| Closed ruling | Reopens if |
| :--- | :--- |
| B/F R38,791.27 accepted as historical carry | Operator orders full 2023–2024 restatement or cosmetic opening journal without Path A |
| Phase 2 = tagging not new journals | Finance posts another blank-INVNO discount journal expecting gap to close |
| Phase 2 tagging closes residual | **Superseded 2026-08-30** — reopens only if a tag post changes header |
| R8,084.67 not billable | `customerDueBasis` reverted to `erp_header` without operator re-ratification |
| STAT 112 authority AL-0109–0116 | Remittance batch amended; `allocation_edges.csv` regenerated with different targets |
| H-022/H-023 clear override invoices | `closedInvoiceOverrides` for 42468/42470 removed **before** ERP tags land |
| Accept residual in AR Control | **Superseded 2026-08-30 (evening)** — H-027 is BS reclass |
| Plan ratified 2026-08-29 | Superseding plan written without marking this doc superseded |

### Proposed doctrine — NOT RATIFIED

> Per `DEBTORS_DOCTRINE.md` §7. TWK002-local only until an orchestration session ratifies.

| # | Proposed ruling | Operator decision needed |
| :--- | :--- | :--- |
| **P12** | Model B accounts with a ratified named residual may **quarantine** it via current-period BS reclass (DR historical-recon suspense / CR AR control). Never P&L write-off, never DISCOUNT ALLOWED, never leave the artefact in active AR Control after the residual is named. | Portfolio playbook, or TWK002-only? |

