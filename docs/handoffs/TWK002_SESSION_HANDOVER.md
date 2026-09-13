# TWK002 — Session Handover (cold start)

**Purpose:** Move Model B reconciliation, customer statement, and ERP hygiene work to a **new session** without re-deriving context.  
**Last updated:** 2026-09-02  
**Branch / commit:** `main` @ `22ebf3c` (`TWK002: ratify residual root cause, H-027 BS reclass, and ERP hygiene lane`)  
**Account:** TWK002 · TWK AGRI PTY LTD · ref **B226**  
**reconState:** `validation_pending` — collections gate **not closed**

---

## Paste this to open the next session

```text
Role: WORKER (TWK002 Model B)

Read first (in order):
1. docs/handoffs/TWK002_SESSION_HANDOVER.md
2. analysis/debtors/TWK002/project.json
3. docs/TWK002_Model_B_Position.md
4. reports/TWK002_Account_Level_Residual_Root_Cause_2026-08-30.md

Do NOT send snapshots/2026-08-11_v1/ — STALE (R110,046.87 cluster closed by STAT 129).

Resume sequence (ERP hygiene before H-027):
  H-022 STAT 112 tagging → H-023 STAT 114 tagging → H-026 STAT 129 cash tagging
  → fresh TXT → rebuild bridge → H-027 BS reclassification journal
  → new customer snapshot (--snapshot --pdf)

Authority: remittance > allocation_edges > closedInvoiceOverrides > ERP INVNO (Model B).
Customer billable = open invoices on statement only (customerDueBasis: open_invoices).
```

---

## 1. Resume here (executable)

**Next action:** Execute **H-026** (STAT 129 cash tagging on receipt **00045899**) unless ERP agent is still on H-022/H-023.

```bash
# 1. Verify current open list + gate (CURRENT TXT — not Aug snapshot)
npm run debtors:tag-check -- --debtor TWK002 --write

# 2. After ERP posts H-022, H-023, H-026 — Sources drops fresh TXT, then:
node analysis/debtors/TWK002/scripts/build_balance_bridge.mjs --write
npm run debtors:customer-statement -- --debtor TWK002 --as-at $(date +%Y-%m-%d) --pdf

# 3. When header ≈ open invoices (post H-027) — immutable send artifact:
npm run debtors:twk002-statement-snapshot -- --as-at YYYY-MM-DD
```

**Operator decisions still open:**

| # | Decision | Blocks |
| :--- | :--- | :--- |
| 1 | Confirm **H-027** BS reclass (DR Historical Reconciliation Suspense / CR AR Control) after hygiene lane | `reconState: complete`, header = open invoices |
| 2 | Send customer statement from **new snapshot** (not live draft, not `2026-08-11_v1`) | Collections / dispute baseline |
| 3 | **P12** (portfolio): Model B residual = BS reclass playbook vs accept-in-header | Doctrine — NOT RATIFIED |

---

## 2. Current numbers (epistemic)

| Metric | Value | Tag | Source |
| :--- | ---: | :--- | :--- |
| ERP header (export) | R27,721.81 | **PROVEN** | `raw/DEBENQTWK002CURRENT.TXT` (2026-08-30) |
| ERP header (live, post H-025) | R26,498.36 | **PROVEN** | export − journal `00000510` (−R1,223.45); `project.json` history |
| Customer **Amount due** (live draft) | **R18,413.69** | **PROVEN** | `reports/TWK002_Statement_of_Account.md` — inv **52484** R7,098.84 + **52803** R11,314.85 |
| Account-level residual | **R8,084.67** | **PROVEN** | R26,498.36 − R18,413.69 (post H-025); identity in root-cause report |
| Prior billable cluster (Aug snapshot) | R110,046.87 | **PROVEN** (historical) | `snapshots/2026-08-11_v1/manifest.json` — **closed by STAT 129** |
| Internal bridge decomposition | R8,084.67 (7 lines) | **PROVEN** | `TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md` |
| B/F historical carry | R38,791.27 | **PROVEN** | `TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md` — non-zeroable |
| Allocation edges | 191 (incl. STAT 129 AL-0171–0191) | **PROVEN** | `data/allocation_edges.csv` |
| Tag gate | ALLOWED (remittance-backed overrides) | **PROVEN** | last `debtors:tag-check` on CURRENT model |

**Kill conditions (ASSUMED):**

| Assumption | Falsified if |
| :--- | :--- |
| ASSUMED: R8,084.67 = sub-ledger↔GL desync plug | Fresh TXT after full hygiene shows header = open invoices **without** H-027 |
| ASSUMED: H-022/H-023/H-026 do not change residual total | Residual moves after tagging only — would contradict root-cause identity |
| ASSUMED: Live draft R18,413.69 is billable | Tag-check BLOCKED or remittance contradicts 52484/52803 |

---

## 3. What is locked (do not unwind)

| Ruling | Recorded in | Tripwire — reopens if |
| :--- | :--- | :--- |
| Model B: remittance is Tier-1 for settlement | `docs/TWK002_Model_B_Position.md` | Operator reverses to ERP INVNO authority |
| Customer due = **open invoices only** (`customerDueBasis: open_invoices`) | `config/statement_of_account.json` | Set to `erp_header` without re-ratification |
| R8,084.67 is **header − open**, not a missing invoice | `TWK002_Account_Level_Residual_Root_Cause_2026-08-30.md` | New evidence of unmatched billable invoice R8,084.67 |
| Phase 2 **tagging does not zero residual** | Root-cause report §Why tagging cannot move it | Residual changes after H-022/H-023/H-026 alone |
| **H-027 = BS reclass**, not discount / bad debt | `docs/TWK002_ERP_Agent_Note_H027_BS_Reclassification.md` | Finance posts to P&L or DISCOUNT ALLOWED instead |
| **Snapshot `2026-08-11_v1` immutable but STALE** | `snapshots/README.md` | Never send for current balance — STAT 129 closed that cluster |
| B/F R38,791.27 accepted, not zeroable | ERP fix plan + bf-bridge report | Operator orders full 2023–2024 restatement |
| `allocation_edges.csv` evidence; generator does **not** consume it | Skill + dead ends in handoffs | Expecting edges alone to fix ERP tags |

---

## 4. Human task sequence (open)

| Task | Owner | Status | Notes |
| :--- | :--- | :--- | :--- |
| **H-022** | ERP | OPEN | Tag **00037770** per AL-0109–0116 — hygiene only |
| **H-023** | ERP | OPEN | Tag **00039080** slice → 42468/42470 — hygiene only |
| **H-026** | ERP | OPEN | Tag **00045899** per AL-0171–0191 — **blocks H-027** |
| **H-027** | ERP/Finance | OPEN | BS reclass after rebuild — expected **R8,084.67** |
| **H-013** | Sources | OPEN | Full-history TXT (partial: CURRENT through 26 Aug exists) |
| **H-014** | Sources | OPEN | STAT 123 shortfall — depends H-013 |
| **H-015** | Sources | OPEN | Email CN copies for inv 50898/51841 |
| **H-024** | Finance | OPEN | Optional Path A — not required for H-027 |
| H-025 | ERP | DONE | Journal `00000510` −R1,223.45 posted |
| H-019 | Worker | DONE | Bridge decomposed + provenance |

Full register: `analysis/debtors/shared/HUMAN_TASKS.md`

---

## 5. Key artifacts (file map)

| Need | Path |
| :--- | :--- |
| North star | `analysis/debtors/TWK002/docs/TWK002_Model_B_Position.md` |
| ERP fix sequence | `analysis/debtors/TWK002/docs/TWK002_ERP_Opening_Balance_Fix_Plan.md` |
| H-027 posting instruction | `analysis/debtors/TWK002/docs/TWK002_ERP_Agent_Note_H027_BS_Reclassification.md` |
| Residual root cause | `analysis/debtors/TWK002/reports/TWK002_Account_Level_Residual_Root_Cause_2026-08-30.md` |
| Bridge (7 lines) | `analysis/debtors/TWK002/reports/TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md` |
| B/F provenance | `analysis/debtors/TWK002/reports/TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md` |
| STAT 129 remittance | `analysis/debtors/TWK002/reports/TWK002_STAT129_Remittance_2026-08.md` |
| Payment→invoice edges | `analysis/debtors/TWK002/data/allocation_edges.csv` |
| Knowledge graph | `analysis/debtors/TWK002/data/knowledge-bundle.json` |
| Statement config | `analysis/debtors/TWK002/config/statement_of_account.json` |
| Live customer draft | `analysis/debtors/TWK002/reports/TWK002_Statement_of_Account.md` (+ `.pdf`) |
| Sign-off snapshot (STALE) | `analysis/debtors/TWK002/snapshots/2026-08-11_v1/` |
| CURRENT ERP extract | `analysis/debtors/TWK002/raw/DEBENQ.TXT` |
| **Full history (stitched)** | `analysis/debtors/TWK002/raw/TWK002_FULL_HISTORY.TXT` — 301 rows, 2023-04-28 → 2026-08-31 |
| Onboarding board | `analysis/debtors/TWK002/reports/TWK002_Onboarding_Status.md` |

**Commands:**

```bash
npm run debtors:tag-check -- --debtor TWK002 --write
npm run debtors:twk002-allocation-ingest          # regenerate edges after remittance change
node analysis/debtors/TWK002/scripts/build_knowledge_prep.mjs && npm run debtors:knowledge-compile -- --debtor TWK002
npm run debtors:twk002-statement-snapshot -- --as-at YYYY-MM-DD
```

---

## 6. Dead ends (do not retry)

| Tried | Why it failed |
| :--- | :--- |
| Send **`2026-08-11_v1` snapshot** | STALE — STAT 129 closed R110,046.87 cluster; current due R18,413.69 |
| **Another Path B discount journal** to close R8,084.67 | H-025 moved plug by R1,223.45 then identity restored — not a discount problem |
| **Phase 2 tagging** to zero residual | Root cause PROVEN: tagging moves INVNO only, not header plug |
| **`allocation_edges.csv` auto-fixes statement** | Generator reads overrides in config, not CSV; edges are evidence + knowledge compile |
| **Zero B/F R38,791.27** with one journal | 11 STAT batches — full restatement only |
| Regenerate live draft for **dispute defence** | Use snapshot + manifest sha256 after next `--snapshot` |
| `knowledge-compile` without prep | Needs `build_knowledge_prep.mjs` → `invoices.csv` |

---

## 7. Proposed doctrine — NOT RATIFIED

> Worker session — await operator in orchestration session. Silence ≠ ratification.

| ID | Proposal | Operator decides |
| :--- | :--- | :--- |
| P1 | Snapshots mandatory for customer send (portfolio) | Constitutional or TWK002-only? |
| P2 | `customerDueBasis: open_invoices` default for Model B bridge accounts | Portfolio default? |
| P3 | Ageing as-at = last day of prior month | Portfolio default? |
| P4 | Model B ERP fix phased playbook (H-013 → tag → H-027) | Portfolio playbook? |
| P5 | Do not bill ERP header when bridge ratified internal | Confirm with P2? |
| **P12** | Residual R8,084.67 → **BS reclass** (H-027 pattern) for sub-ledger↔GL desync | Portfolio vs TWK002-only? |

Prior handoff blocks (other accounts, same date): `docs/handoffs/2026-08-29.md`

---

## 8. Session arc (what this workstream covered)

1. **Bridge investigation** — decomposed R8,084.67 into 7 ratified lines; pre–Mar 2025 B/F traced (PROVEN).
2. **Allocation lane** — `allocation_edges.csv` (remittance Tier-1); knowledge bundle compiled.
3. **Customer statement** — `customerDueBasis: open_invoices`; snapshot doctrine (`--snapshot` + manifest).
4. **STAT 129** — remittance ingested; H-025 journal posted; R110k cluster closed on statement.
5. **Root cause** — residual = header − open; tagging hygiene ≠ residual lever; **H-027 BS reclass** ratified as path.

---

## 9. Definition of done (this workstream)

- [ ] H-022, H-023, H-026 posted in ERP  
- [ ] Fresh TXT; bridge rebuilt; residual amount confirmed post-tag  
- [ ] H-027 BS reclass posted; header = Σ open invoices on statement  
- [ ] New `--snapshot` with manifest; operator authorises customer send  
- [ ] `reconState: complete` after finance sign-off (16-batch + Phase 2 validation)  
- [ ] Optional: strip `closedInvoiceOverrides` for 42468/42470 once ERP shows closed  

---

*Maintained by session closer. Append dated addendum below when state changes materially — do not overwrite history.*
