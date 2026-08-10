# TWK002 — Phase 2 (2025 settlement discount)

**Opened:** 2026-08-09  
**Doctrine:** `docs/TWK002_Settlement_Discount_Doctrine_v2.md` (unchanged — Model B)  
**Phase 1:** `data/finance_posting_checklist.csv` — 16/16 DONE (2023–2024, STAT 100–109)

---

## 1. Objective

Apply the same remittance-batch rules to **2025+** payments: remittance PDF = authority; ERP payment should equal **cash**; **DISCOUNT ALLOWED** journal = remittance discount; verify cash + journal = gross.

Phase 2 does **not** reopen Phase 1 journals unless new evidence contradicts posted amounts.

---

## 2. First batch — STAT 110 / `00036467`

| Field | Value |
| :--- | :--- |
| ERP doc | `00036467` |
| Date | 31/01/2025 |
| Reference | `TRANSF \| STAT 110` |
| ERP amount | **R4,398.27** (payment) |
| Remittance PDF in repo | **None** |

### Partial vs full batch (pre-PDF assessment)

| Signal | Reading |
| :--- | :--- |
| Size vs 2024 cash | Between Sep-24 (R2,984.27) and Dec-24 (R12,104.70); not obviously “full month” vs “token partial” without footer |
| Phase 1 exclusion | Doctrine §8 — outside 2024 manifest; required **separate review**, not silent merge into 2024 tasks |
| ERP-only linkage | Payment gross = **R4,398.27** until PDF shows whether that is **cash** or **cash+embedded discount** |

**Working status:** **FULL** batch — ERP payment = remittance **cash** (R4,398.27). Post **R-112.78** `DISCOUNT ALLOWED` on **31/01/2025**.

After PDF ingest (done 2026-08-09):

1. If ERP payment = remittance **cash** and discount missing → Path B journal (same as 2024 cash-only batches). ✅ **applies to all three ingested batches**
2. If ERP payment = remittance **gross** (over-post) → Path B discount journal + optional orphan strip (same as 2024 over-post).
3. If ERP payment **<** remittance cash → possible **partial** remittance or second payment still to post — do not journal until batch is closed on the advice.

---

## 3. Evidence gate (do this first)

| Step | Action |
| :---: | :--- |
| 1 | ~~Obtain TWK **STAT 110** remittance advice~~ ✅ in `raw/Remittances/` |
| 2 | ~~Save as `raw/Remittances/`~~ ✅ |
| 3 | ~~Extract footer~~ ✅ → `remittance_manifest_2025.json`, `remittance_lines_2025.csv` |
| 4 | ~~`TASK-2025-EVID-01` → DONE~~ ✅ 2026-08-09 |
| 5 | Post journals per `finance_posting_checklist_2025_phase2.csv` (3× READY) |

**Linkage report:** `reports/TWK002_Phase2_2025_Linkage.md`

**Human task:** `H-013` in `analysis/debtors/shared/HUMAN_TASKS.md`

---

## 4. Other ERP STAT rows (discovered, not started)

From `data/erp_stat_payments_2025.csv` (source TXTs: `TWK0022024.TXT`, `TWK002CURRENT23072026.TXT`):

| STAT | Doc | Date | Amount |
| :---: | :--- | :--- | ---: |
| 110 | 00036467 | 31/01/2025 | R4,398.27 |
| 112 | 00037770 | 28/03/2025 | R35,693.84 |
| 114 | 00039080 | 30/05/2025 | R15,365.65 |
| 123 | 00043500 | 25/02/2026 | R176,824.24 |

**Gaps:** no STAT **111**, **113**, or **115–122** in indexed exports — may mean no payment yet, different numbering, or need a **full-history** debtor TXT export.

---

## 5. Out of scope (unchanged)

| Item | Note |
| :--- | :--- |
| `00037732` | Jul-2024 orphan payment reversed by Bank UD — net zero; separate hygiene if needed |
| Phase 1 journals | 00000490–506 — signed off 2026-08-09 |

---

## 6. Artifacts

| File | Role |
| :--- | :--- |
| `data/finance_posting_checklist_2025_phase2.csv` | Tick-off for 2025+ posting |
| `data/remittance_manifest_2025.json` | Batch metadata (STAT 110 stub) |
| `data/erp_stat_payments_2025.csv` | ERP STAT index |
