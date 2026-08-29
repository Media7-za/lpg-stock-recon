# TWK002 — Onboarding Status

**Updated:** 2026-08-29  
**North star:** [`docs/TWK002_Model_B_Position.md`](../docs/TWK002_Model_B_Position.md) — remittance-authoritative Model B; balance and collections based on real debt, not posting artefacts.  
**Scope:** 2023–2024 analysis complete · ERP catch-up **mostly posted** (Path B) · **`reconState: validation_pending`** until finance sign-off

---

## Statement & allocation (Aug 2026) — PROVEN anchors

| Item | Path | Basis | Status |
| :--- | :--- | :--- | :---: |
| Bridge decomposition (7 sub-lines → R8,084.67) | `config/statement_of_account.json` · `reports/TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md` | PROVEN | ✅ |
| Pre–Mar 2025 B/F provenance (R38,791.27) | `reports/TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md` | PROVEN (11 STAT batches tie) | ✅ |
| Payment→invoice edges | `data/allocation_edges.csv` (170 edges, 20 batches) | PROVEN (remittance) | ✅ |
| Knowledge bundle | `data/knowledge-bundle.json` | PROVEN (compiled from edges) | ✅ |
| Customer statement config | `customerDueBasis: open_invoices`, `hideAccountLevelSection: true` | Operator decision 2026-08-29 | ✅ |
| **Sign-off snapshot** | `snapshots/2026-08-11_v1/` + `manifest.json` | PROVEN (gate ALLOWED, sha256) | ✅ created — **send not authorised** |
| Live working draft | `reports/TWK002_Statement_of_Account.md` | ASSERTED (re-runnable) | ✅ |

**Customer amount due (billable):** **R110,046.87** — PROVEN (`snapshots/2026-08-11_v1/manifest.json`, 11 open invoices, tag gate ALLOWED REMITTANCE_BACKED).

**Internal bridge (not billable):** R8,084.67 — PROVEN (bridge lines sum; not on customer snapshot).

**ERP header (operator console):** R118,131.54 — PROVEN (`raw/DEBENQ_TWK002.TXT` CURRENT BALANCE).

---

## ERP opening balance fix (Aug 2026) — ratified execution plan

**Authority:** [`docs/TWK002_ERP_Opening_Balance_Fix_Plan.md`](../docs/TWK002_ERP_Opening_Balance_Fix_Plan.md) (ratified 2026-08-29, pushed `main` @ `e09c815`).

| Layer | Amount | Epistemic | ERP action |
| :--- | ---: | :--- | :--- |
| B/F export carry | R38,791.27 | **PROVEN** (11 STAT batches) | Accept — not zeroable without full restatement |
| Account-level residual | R8,084.67 | **PROVEN** (7 bridge lines sum) | Phase 2 tagging (H-022/H-023/H-014) |
| Path B journals posted | 16 + 3 batches | **PROVEN** (checklists DONE) | No further discount journal wave |

**Human tasks:** H-013 (fresh TXT) → H-022 (STAT 112) → H-023 (STAT 114) → H-014 (STAT 123) → H-024 optional Path A.

**Collections posture unchanged:** customer due remains **R110,046.87** open invoices only — ERP plan does not change billable amount.

---

## Finance posting sign-off (2026-08-09)

| Item | Status |
| :--- | :---: |
| Checklist | `data/finance_posting_checklist.csv` — **16/16 DONE** |
| Validation TXT | `raw/TWK002CURRENT.TXT` · `raw/TWK002CURRENT09082026.TXT` |
| CURRENT balance | **R118,867.24** |
| Method | Path B journals (payment/deposit headers unchanged) |
| Optional | Deposit line cleanup; **Phase 2** 2025 remittances — see kickoff report |

---

## Phase 2 — 2025 settlement discount (open)

| Item | Status |
| :--- | :---: |
| **Phase 2 tranche 1** | STAT 110/112/114 — **posted** |
| **Phase 2 tranche 2** | STAT 123 — blocked on `18.02.2026.pdf` footer; gaps 111/113/115–122 documented |
| Kickoff / extension | `TWK002_Phase2_2025_Kickoff.md` · `TWK002_Phase2_Extension.md` |

---

## Turn 1 — Complete

| Item | Path | Status |
| :--- | :--- | :--- |
| ERP TXT (2023) | `raw/TWK0022023.TXT` | ✅ |
| Project metadata | `project.json` | ✅ |
| Override registry | `config/settlement_discount_overrides.json` | ✅ (7 exceptions) |
| Doctrine | `docs/TWK002_Settlement_Discount_Doctrine_v2.md` (v1 superseded) | ✅ |

---

## Turn 2 — Complete (pilot batch)

| Item | Status |
| :--- | :---: |
| Tier 1 remittance `28.08.2023.pdf` | ✅ |
| Deposit detail variance analysis | ✅ |
| Pilot report | `reports/TWK002_Pilot_Batch_2023-08-28.md` | ✅ |

---

## Turn 3 — Complete (all 2023 remittances)

| Item | Path | Status |
| :--- | :--- | :---: |
| Remittance PDFs (2023) | `raw/Remittances/` — 6 unique batches | ✅ |
| Batch manifest | `data/remittance_manifest_2023.json` | ✅ |
| Batch headers CSV | `data/remittance_batches_2023.csv` | ✅ |
| Line register CSV | `data/remittance_lines_2023.csv` (51 lines) | ✅ |
| Pro forma journals | `data/proforma_journals_2023.csv` | ✅ |
| Missing journal tasks | `data/missing_journal_tasks_2023.csv` (6 tasks) | ✅ |
| **Deliverable 1 report** | `reports/TWK002_Missing_Discount_Journals_2023.md` | ✅ |

### 2023 totals

| Metric | Amount |
| :--- | ---: |
| Remittance gross settled | R145,240.01 |
| Settlement discount (2.5%) | R3,329.12 |
| Electronic cash paid | R141,910.89 |
| ERP payments in TXT | R145,930.01 |
| ERP gross variance | +R690.00 (2 batches × R345) |
| Discount journals in TXT | **0** |

---

## TXT export summary

| Field | Value |
| :--- | ---: |
| Account | TWK002 — TWK AGRI PTY LTD |
| Export label | 2024 FEBRUARY |
| ERP CURRENT BALANCE (header) | R89,543.71 |
| Ledger closing (last row) | R87,226.46 |
| Transaction rows | 79 (lines 2–90) |
| Period covered | 2023-04-28 → 2024-02-26 |

> **Note:** Header CURRENT BALANCE (R89,543.71) differs from reconstructed ledger total (R87,226.46) by **R2,317.25** — investigate in a later turn.

---

## 2023 payments in TXT

| Payment doc | Date | STAT | Amount | Remittance batch |
| :--- | :--- | :--- | ---: | :--- |
| 00022182 | 2023-07-03 | STAT:92 | R-46,424.87 | BATCH-2023-06-26 |
| 00023115 | 2023-07-26 | STAT 92 | R-8,145.79 | BATCH-2023-07-26 |
| 00023836 | 2023-09-01 | STAT 93 | R-27,738.41 | BATCH-2023-08-28 (+R345) |
| 00024560 | 2023-09-26 | STAT 94 | R-14,684.27 | BATCH-2023-09-26 |
| 00025906 | 2023-11-08 | STAT 95 | R-17,064.38 | BATCH-2023-10-26 |
| 00026681 | 2023-11-29 | STAT 96 | R-31,872.29 | BATCH-2023-11-27 (+R345) |

---

## Turn 4 — Complete (invoice exceptions)

| Item | Path | Status |
| :--- | :--- | :---: |
| Override registry | `config/settlement_discount_overrides.json` (7 entries) | ✅ |
| Exception audit CSV | `data/discount_exception_audit_2023.csv` | ✅ |
| Pro forma ref splits (all batches) | `data/proforma_journals_2023.csv` (53 rows) | ✅ |
| Exception report | `reports/TWK002_Invoice_Exceptions_2023.md` | ✅ |

### Registered exceptions

| ID | Doc | Type |
| :--- | :--- | :--- |
| EXC-0001 | 00020607 | Late payment — no discount |
| EXC-0002 | 00021123 | Late payment — no discount |
| EXC-0003 | 00023075 | Partial settlement (R345 prior slice) |
| EXC-0004 | 00024011 | Partial — Oct batch first slice |
| EXC-0005 | 00024011 | Cross-batch residual — no discount |
| EXC-0006 | 5845/5875 | Composite remittance CN line |
| EXC-0007 | STMT-DIFF-AUG23 | Statement rounding (no ERP doc) |

---

## Turn 5 — Complete (recreated ledger)

| Item | Path | Status |
| :--- | :--- | :---: |
| Recreated ledger CSV | `data/recreated_ledger_2023.csv` (85 rows) | ✅ |
| Payment bridge | `data/recreated_ledger_payment_bridge_2023.csv` | ✅ |
| Narrative report | `reports/TWK002_Recreated_Ledger_2023.md` | ✅ |

### Key outcomes

| Metric | ERP | Recreated |
| :--- | ---: | ---: |
| 2023 settlement effect | R-145,930.01 | R-145,240.01 |
| Discount journals | 0 | 6 (R-3,329.12) |
| Closing balance | R87,226.46 | R87,916.46 (+R690 ERP variance) |

---

## Turn 6 — Complete (payment pattern analysis)

| Item | Path | Status |
| :--- | :--- | :---: |
| Analysis script | `scripts/discount_payment_pattern_analysis.py` | ✅ |
| Batch match CSV | `data/payment_pattern_batches_2023.csv` | ✅ |
| Pattern overrides | `config/payment_pattern_overrides.json` (6 batches) | ✅ |
| **Report** | `reports/TWK002_2023_Payment_Pattern_Analysis.md` | ✅ |

### Pattern verdict

All **6 remittance batches** = `FULL_MATCH` under Model B (cash + discount = gross). No permanent batch underpayments. R690 ERP variance is deposit artefact, not unpaid debt.

---

## 2023 onboarding — complete

| Turn | Deliverable | Status |
| :---: | :--- | :---: |
| 1 | Scaffold + doctrine | ✅ |
| 2 | Pilot batch 28.08.2023 | ✅ |
| 3 | Missing discount journals | ✅ |
| 4 | Invoice exceptions | ✅ |
| 5 | Recreated ledger | ✅ |
| 6 | Payment pattern analysis | ✅ |

### Future scope

- ~~ERP journal posting sign-off (Path B catch-up)~~ ✅ 2026-08-09
- **Phase 2:** 2025 remittances — STAT 110 first (`00036467`); kickoff 2026-08-09
- Optional deposit detail cleanup (Path A)

---

## TXT exports

| File | Coverage |
| :--- | :--- |
| `raw/TWK0022023.TXT` | Apr 2023 – Feb 2024, payments through STAT 96 |
| `raw/TWK0022024.TXT` | Balance B/F R87,226.46, payments STAT 100–109, through early 2025 |

---

## 2024 extension — complete (remittance ingest)

| Item | Path | Status |
| :--- | :--- | :---: |
| Remittance PDFs | 10 batches (Mar–Dec 2024) | ✅ |
| Manifest + CSVs | `data/remittance_manifest_2024.json`, `*_2024.csv` | ✅ |
| Pro forma / tasks | `proforma_journals_2024.csv`, `missing_journal_tasks_2024.csv` | ✅ |
| Reports | `TWK002_Missing_Discount_Journals_2024.md`, `TWK002_2024_Payment_Pattern_Analysis.md` | ✅ |
| Build script | `scripts/build_remittance_2024.mjs` | ✅ |

| Metric | Amount |
| :--- | ---: |
| 2024 remittance gross | R262,834.13 |
| 2024 discount | R4,723.31 |
| 2024 cash | R258,110.82 |
| Combined 2023–2024 discount | **R8,052.43** |
| ERP payments in TXT | **10 linked** STAT 100–109 |
| ERP linkage report | `reports/TWK002_ERP_Linkage_2024.md` | ✅ |
| Discount posted in ERP | R385.04 (partial Oct) |
| Discount still to post | R4,338.27 |
