# TASKS_AND_KNOWLEDGE_UPDATE

> Source inputs: LSR5_Business_Rules_Spec.html v2.3.1 · Decision Node 2026-05-17 · CURRENT_STATE.md
> Generated: 2026-05-17

---

## 1. IMPLEMENTATION TASKS

---

### T-01 · Run DTRX entry_type discovery query

- **Priority:** Critical — this is the single hard gate on the PMT lane
- **Type:** Validation
- **Description:** Execute the following against Supabase `transaction_headers` for INC001 before any PMT lane code is written. Confirm: (a) exact `entry_type` string values for payment records, (b) whether reversal entries exist and how they are typed, (c) deduplication behaviour for re-imported batches. Document results and update `CURRENT_STATE.md` §7 (assumed → validated).
  ```sql
  SELECT DISTINCT entry_type, COUNT(*) AS cnt
  FROM transaction_headers
  WHERE account_no = 'INC001'
  GROUP BY entry_type
  ORDER BY cnt DESC;
  ```
- **Dependencies:** None — run independently
- **Risk Level:** Critical — PMT lane correctness depends entirely on this output
- **Suggested Owner:** Backend / Data engineer
- **Related Decision Node:** D2 — DTRX as payment source
- **Estimated Complexity:** Low (query only; analysis of output is medium)

---

### T-02 · Audit Findings #1, #2, #3 from ChatGPT PRD session

- **Priority:** High — spec cannot be treated as fully locked until all findings closed
- **Type:** Validation
- **Description:** Retrieve the ChatGPT PRD session transcript that produced Session B summary. Identify the three named findings. Map each to the current v2.3.1 spec. Determine whether each is (a) already addressed, (b) contradicted, or (c) a gap requiring a surgical spec amendment. If amendments are required, apply them as `str_replace` operations to `LSR5_Business_Rules_Spec.html` and bump the version to v2.3.2.
- **Dependencies:** ChatGPT session transcript must be accessible
- **Risk Level:** Medium — if remaining findings contradict locked rules, implementation may need to pause
- **Suggested Owner:** Product / domain owner
- **Related Decision Node:** Decision Node §5 conflict matrix — Findings #1/#2/#3 open item
- **Estimated Complexity:** Medium

#### Finding Tracker — T-02 COMPLETE

| # | Finding | Severity | Status | Resolved in |
|---|---|---|---|---|
| 1 | Invoice settlement logic wrong — `cyl_qty = 0` required for settlement, breaking `pays_for_cyl` accounts | Critical | **RESOLVED** | v2.2.0 |
| 2 | Historical cross-bucket learning invented — 40% suppression threshold never approved | Critical | **RESOLVED** | v2.2.0 |
| 3 | PMT splits proportionally unless directed — never approved; dangerous accounting assumption | Critical | **RESOLVED** | v2.3.1 |
| 4 | Bank UD routing contradiction — §6 said Suspense-PMT, §16 said UNCLASSIFIED_EXCEPTION | Critical | **RESOLVED** | v2.2.0 / v2.2.1 |
| 5 | §9 invariant "all allocations require operator confirmation" conflicted with operational CYL CRN auto-apply | Critical | **RESOLVED** | v2.2.1 |
| 6 | DTRX declared "authoritative PMT truth" before integration validation | Critical | **RESOLVED** | v2.2.0 |
| 7 | `partial_settled` badly named — financially settled + custody open is not partial settlement | Architecture | **RESOLVED** | v2.2.0 |
| 8 | Synthetic epoch date `1900-01-01` leaked implementation into business rules | Architecture | **RESOLVED** | v2.2.0 |
| 9 | Operational CRN blind auto-apply — risky without exact match condition | Architecture | **RESOLVED** | v2.2.1 |
| 10 | `mixed_invoices` customer flag unnecessary — mixed buckets are a document fact | Architecture | **RESOLVED** | v2.2.0 |
| 11 | Audit trail contradiction — MVP simplification vs spec content | Medium | **RESOLVED** | v2.2.0 |
| 12 | ERP convergence as completion gate — residual language in older artifacts | Medium | **RESOLVED** | v2.2.1 |
| 13 | Three-source architecture label — reality is four-source | Medium | **RESOLVED** | v2.2.0 |

**T-02 STATUS: CLOSED — all 13 findings resolved in v2.3.1. No open items.**

#### Finding #1 — Closure Record (2026-05-17)

**Original defect:** §7 stated invoice fully settled only when `cyl_qty = 0`. This broke `pays_for_cyl` accounts: a customer paying commercially for cylinders achieves `cyl_value_balance = 0` but `cyl_qty` remains open. Under the old rule the invoice would be marked unsettled — incorrect.

**Locked correct model:** `financial_state` and `custody_state` are independent enums. `SETTLED + OUTSTANDING` is a valid complete financial outcome for `pays_for_cyl` accounts.

**Closure verification — §7 v2.3.1:**
- Schema contains both `financial_state` and `custody_state` as independent fields with full enum sets
- "Note — State Independence" callout: *"SETTLED + OUTSTANDING is a valid complete state for pays_for_cyl accounts. Neither state requires the other to be resolved first."*
- "Hard Rule — Invoice Settlement" block with `pays_for_cyl` example explicitly stated
- State combination table: seven rows, `SETTLED + OUTSTANDING` marked "Valid complete financial outcome — Yes (financial)"

**Verdict:** RESOLVED.

#### Finding #2 — Closure Record (2026-05-17)

**Original defect:** §11 contained a 40% historical cross-bucket suppression threshold — if a customer's historical cross-bucket allocation rate exceeded 40%, warnings were suppressed automatically. This was never approved; it constitutes implicit ML-style behavioural inference.

**Locked correct model:** Warning suppression is controlled exclusively by the `allows_cross_bucket_settlement` operator flag. No counting logic. No threshold-triggered suppression.

**Closure verification — §11 v2.3.1:**
- *"Warning suppression is controlled only by the `allows_cross_bucket_settlement` flag. No automatic learning or historical rate inference."*
- No occurrence of "40%" in any active rule section — only in the v2.2.0 changelog entry recording its removal
- §25 anti-pattern table explicitly lists "System auto-sets flag after N overrides" as the wrong pattern

**Verdict:** RESOLVED.

#### Finding #3 — Closure Record (2026-05-17)

**Original defect:** §21 stated "PMT splits proportionally unless directed" — meaning a R5,000 payment against a mixed invoice would be distributed 60% LPG / 30% CYL / 10% OTHER unless the operator specified otherwise. This was never approved and constitutes an invisible accounting policy assumption.

**Locked correct model:** One PMT → one invoice → one sub-ledger component per action. No proportional split. No automatic spillover. Remainder to Suspense-PMT. Locked in v2.3.1.

**Closure verification — §10 and §21 v2.3.1:**
- §10: *"A single PMT allocation action targets exactly: one PMT → one invoice → one sub-ledger component. No proportional split. No automatic spillover into other components. No silent distribution."*
- §10 "what the engine must never do" list: *"Proportionally distribute a PMT across LPG, CYL, and OTHER components"* is the first prohibited item
- §21: *"A PMT is applied to one operator-selected invoice. PMT remainder routes to Suspense-PMT. Allocation policy is never inferred by the engine."*
- Worked example (§10): R5,000 PMT, operator selects LPG → LPG → R0, R2,000 remainder → Suspense-PMT, CYL unchanged

**Verdict:** RESOLVED.

#### Findings #7–#13 — Batch Closure Record (2026-05-17)

| # | Defect | v2.3.1 resolution |
|---|---|---|
| 7 | `partial_settled` badly named | Removed entirely. Replaced by `financial_state` / `custody_state` enums. Changelog: *"partial_settled was a misleading name — SETTLED financial + OUTSTANDING custody is a fully valid and complete state."* |
| 8 | Epoch anchor `1900-01-01` leaked into business rules | Removed. §13 and §3 now state: *"Business rule: ranks before all dated invoices. Implementation decides how to achieve this ordering — the business rule does not prescribe a synthetic date."* One residual `epoch anchor` reference in §17 step 6 is implementation-facing only — does not prescribe the date. |
| 9 | Blind operational CRN auto-apply | Conditional qualifier applied throughout. §8, §17 step 5: *"only when an exact SKU match to a prior-dated invoice exists. Ambiguous or unmatched → operational exception queue. Never blind auto-apply."* |
| 10 | `mixed_invoices` flag unnecessary | Removed. §11: *"mixed_invoices flag removed — mixed buckets are a document fact derived from detail lines, not customer configuration."* §23 implementation order confirms removal. |
| 11 | Audit trail contradiction | Resolved with explicit two-tier model: formal queryable trail deferred post-MVP; append-only allocation log mandatory from day one. §17: *"it costs near-zero and will be essential by month 3."* |
| 12 | ERP convergence as completion gate | Removed. §18: *"ERP balance convergence is NOT a required condition."* §5 softened to "ERP reference balance." Balance mismatch = informational warning only. |
| 13 | Three-source architecture label | Corrected to four-source throughout. §5 heading: "Data Sources — Four-Source Architecture." §4: *"triangulates across four sources (ERP summary, detail lines, transaction_headers, transaction_items)."* |

**Verdict for #7–#13:** All RESOLVED.

---

**One residual note on Finding #8 (epoch anchor):** The term "epoch anchor" appears once in §17 step 6 — *"positive → INV lane (epoch anchor)"*. This is an implementation hint, not a business rule prescription, and is consistent with the §3 glossary entry which states *"Implementation detail only — no synthetic date is mandated by the business spec."* However, for complete cleanliness this phrase could be replaced with *"positive → INV lane (ranked before all dated invoices)"* in a future v2.3.2 pass. **Low priority — not a functional defect.**

#### Finding #4 — Closure Record (2026-05-17)

**Original defect:** Two conflicting routing rules existed in v1.0.0/v2.1.0:
- §6 document taxonomy: `Bank UD → Auto-routed to Suspense-PMT`
- §16 exception lanes: `Bank UD → UNCLASSIFIED_EXCEPTION`

**Why it was dangerous:** `Suspense-PMT` semantically means confirmed unapplied cash. `Bank UD` is an unknown correction or reversal artifact. Auto-treating Bank UD as cash received would corrupt financial meaning — a reversal entry would be processed as a payment.

**Locked correct rule:** Bank UD must always route to `UNCLASSIFIED_EXCEPTION`, with mandatory operator classification and completion blocked until resolved. Never auto-treated as PMT.

**Closure verification — v2.3.1 contains all six required statements:**
- §6 → `Routes to UNCLASSIFIED_EXCEPTION on load. Operator must classify before engine touches it. Blocks session completion.`
- §14 → `JNL and Bank UD documents default to UNCLASSIFIED_EXCEPTION on session load.`
- §16 → `UNCLASSIFIED_EXCEPTION: Any JNL or Bank UD on session load. Blocks session completion.`
- §17 step 7 → `Route all JNL and Bank UD to UNCLASSIFIED_EXCEPTION queue. Neither enters any financial lane until operator classification is complete.`
- §18 → `no UNCLASSIFIED_EXCEPTION remains` is a hard session completion gate
- §21 → `Bank UD correction artifacts → Routes to UNCLASSIFIED_EXCEPTION on session load — never to Suspense-PMT.`

**Verdict:** Spec contradiction fully resolved. No further architectural action required.

**Implementation QA required (not optional):** Even though the spec is clean, this is a high-risk accounting control. The following test cases must be explicitly covered before PMT lane goes live:

```
QA-BANKUD-01: Bank UD import → appears in UNCLASSIFIED_EXCEPTION queue
QA-BANKUD-02: Bank UD present → session completion button disabled
QA-BANKUD-03: Bank UD present → allocation action blocked (UI must not permit)
QA-BANKUD-04: Bank UD classified as PAYMENT_EQUIVALENT → moves to PMT lane correctly
QA-BANKUD-05: Bank UD classified as IGNORE → removed from session, audit logged
QA-BANKUD-06: Bank UD classified as DEBIT_ADJUSTMENT → danger UI fires; exposure increases
QA-BANKUD-07: Two Bank UDs in session → both must be resolved before completion unblocks
```

#### Finding #5 — Closure Record (2026-05-17)

**Original defect:** §9 invariant stated "all allocations require operator confirmation," which conflicted with operational zero-value CYL CRN auto-apply on session load. Auto-applying qty changes does alter reconciliation state, so the invariant appeared to prohibit it.

**Why it was dangerous:** If taken literally, the original wording either (a) prohibited legitimate deterministic custody reconciliation, requiring unnecessary operator clicks for every operational CRN, or (b) created an undocumented exception that silently violated a stated hard rule — either outcome undermines the invariant's authority as an engineering constraint.

**Locked correct rule (two explicit clauses, adjacent in §9):**
- *"All financial (monetary) allocations require operator confirmation. The engine suggests; it never acts autonomously on value balances."*
- *"Deterministic operational CRN qty reconciliation (exact SKU match, prior-dated invoice) may auto-apply custody-only adjustments on session load — this does not constitute a financial allocation."*

**Closure verification — three required properties all present in v2.3.1 §9:**
1. Prohibition scoped correctly — "financial (monetary) allocations" not "all allocations"
2. Carve-out is explicit and conditional — auto-apply only for exact SKU + prior-dated invoice match; not a blanket permission
3. Semantic boundary stated — "this does not constitute a financial allocation" names why there is no conflict

**Verdict:** Spec contradiction fully resolved in v2.2.1. No further architectural action required.

**Audit model locked — Model A (logged operational event):**
Operational deterministic qty auto-apply must create a `custody_reconciliation_event` record. It must NOT create a financial `allocation_record`. Silent mutation (Model B) is explicitly rejected — state changed; traceability is required.

```
custody_reconciliation_event {
  id              UUID
  session_id      UUID
  crn_doc_no      TEXT   -- the operational CRN applied
  invoice_id      TEXT   -- target invoice
  sku             TEXT   -- SKU matched
  qty_applied     NUMERIC
  applied_at      TIMESTAMPTZ
  match_basis     TEXT   -- 'EXACT_SKU_PRIOR_DATED'
}
```

**Implementation QA required:** The conditional nature of the carve-out must be enforced in code — it is not a blanket auto-apply permission.

```
QA-OPCRNQTY-01: Operational CRN, exact SKU + prior-dated invoice
                → auto-applies to cyl_qty_balance only
                → zero change to lpg_value_balance, cyl_value_balance, other_value_balance (assert all three)
                → creates custody_reconciliation_event record
                → does NOT create allocation_record of any financial action type

QA-OPCRNQTY-02: Operational CRN, exact SKU but no prior-dated invoice
                → routes to OPERATIONAL_EXCEPTION
                → no auto-apply
                → no custody_reconciliation_event created
                → no monetary balance change

QA-OPCRNQTY-03: Operational CRN, ambiguous SKU match (multiple candidate invoices)
                → routes to OPERATIONAL_EXCEPTION
                → no auto-apply
                → no custody_reconciliation_event created

QA-OPCRNQTY-04: Operational CRN auto-applied → custody_reconciliation_event.match_basis = 'EXACT_SKU_PRIOR_DATED'
                → event is queryable by session_id, crn_doc_no, invoice_id

QA-OPCRNQTY-05: Session with 3 operational CRNs (2 deterministic matches, 1 ambiguous)
                → 2 custody_reconciliation_events created
                → 1 OPERATIONAL_EXCEPTION entry created
                → 0 allocation_records created for any of the three
```

#### Finding #6 — Closure Record (2026-05-17)

**Original defect:** §3 domain language declared DTRX (`transaction_headers`) as "authoritative PMT truth" before any integration validation had been performed. `entry_type` values, deduplication behaviour, reversal handling, and completeness were all unconfirmed assumptions at the time of declaration.

**Why it was dangerous:** "Authoritative truth" as a label instructs implementors to trust the source unconditionally. If DTRX contains reversal entries typed the same as payments, duplicate rows from re-imports, or correction records, the PMT lane would ingest incorrect data with no validation gate — and the spec would have provided no basis for questioning it. Premature authority claims remove the engineering discipline that would normally catch integration failures before they corrupt financial data.

**Locked correct wording:** "Designated PMT lane source — pending integration validation (entry_type enumeration, deduplication, reversal detection)." This retains DTRX as the intended source while making the validation obligation explicit and naming the three specific unknowns.

**Closure verification — "authoritative truth" language is absent from all sections in v2.3.1:**
- §3 glossary → *"Designated PMT lane source pending full integration validation. Run discovery query to confirm entry_type values before going live."*
- §5 data sources table → *"Designated PMT lane source — pending integration validation (entry_type enumeration, deduplication, reversal detection)"*
- §22 open risks → *"DTRX entry_type values unconfirmed — High — Run discovery query (Section 5) before PMT lane goes live."*
- v2.2.0 changelog → *"Fixed CRITICAL: Softened DTRX 'authoritative truth' to 'designated source pending integration validation'."*

**Verdict:** Spec language corrected in v2.2.0. No section retains the premature authority claim. No further architectural action required.

**Remaining live dependency (not closed by this finding):** The three unknowns named in §5 — entry_type values, deduplication, reversal detection — are still unvalidated in the production Supabase instance. This is T-01 (DTRX discovery query), which remains the single hardest gate on PMT lane implementation. Finding #6 closes the *spec language* defect; T-01 closes the *integration reality* gap.

```
QA-DTRX-01: Discovery query run → entry_type values documented and added to CURRENT_STATE.md §7
QA-DTRX-02: Reversal entry_type confirmed or ruled out → PMT ingestion filter updated accordingly
QA-DTRX-03: Deduplication behaviour confirmed → idempotent load strategy documented
QA-DTRX-04: PMT lane integration test against INC001 real data → reconstructed payment total
             reconciles with known payment history before session goes live
```

---

### T-03 · Create Git repository and commit canonical spec

- **Priority:** High — spec is not under version control; divergence risk is real
- **Type:** Migration
- **Description:** Create GitHub repo `LPG Stock Recon`. Commit `LSR5_Business_Rules_Spec.html` (v2.3.1) to `docs/`. Enable GitHub Pages. From this point, all spec changes are `str_replace` surgical edits committed to this repo — no new file copies, no local-only edits. Add a `README.md` pointing to the GitHub Pages URL as the canonical spec location.
- **Dependencies:** None
- **Risk Level:** Low
- **Suggested Owner:** Any team member with GitHub access
- **Related Decision Node:** D10 — single canonical spec file
- **Estimated Complexity:** Low

---

### T-04 · Build data schemas

- **Priority:** High — all subsequent implementation depends on these
- **Type:** Feature
- **Description:** Implement the following tables in Supabase (Postgres). All schemas must exactly match the spec definitions.

  **`invoice_sub_ledger`**
  ```sql
  invoice_id            TEXT PRIMARY KEY,     -- doc_no from ERP summary
  account_no            TEXT NOT NULL,
  total_amount          NUMERIC NOT NULL,
  lpg_value_balance     NUMERIC NOT NULL DEFAULT 0,
  cyl_value_balance     NUMERIC NOT NULL DEFAULT 0,
  other_value_balance   NUMERIC NOT NULL DEFAULT 0,
  cyl_qty_balance       JSONB NOT NULL DEFAULT '{}',  -- { "9.1": 5, "14.1": 2 }
  financial_state       TEXT NOT NULL DEFAULT 'OUTSTANDING',
    -- CHECK IN ('OUTSTANDING','SETTLED','EXCEPTIONED','WRITTEN_OFF','IGNORED')
  custody_state         TEXT NOT NULL DEFAULT 'OUTSTANDING',
    -- CHECK IN ('OUTSTANDING','PARTIALLY_RETURNED','RETURNED','COMMERCIALIZED','DISPUTED','IGNORED')
  invoice_date          DATE NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT now()
  ```

  **`allocation_record`** — append-only log
  ```sql
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID NOT NULL,
  invoice_id            TEXT NOT NULL,
  pmt_or_crn_id         TEXT,
  component             TEXT,   -- 'LPG' | 'CYL_VALUE' | 'OTHER' | 'CYL_QTY'
  amount_applied        NUMERIC,
  action_type           TEXT,   -- 'PMT_ALLOCATION' | 'CRN_ALLOCATION' | 'WRITE_OFF' | 'ROUNDING_WRITE_OFF' | 'CREDIT_POOL_APPLICATION'
  operator_id           TEXT NOT NULL,
  timestamp             TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes                 TEXT
  ```

  **`session`**
  ```sql
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_no            TEXT NOT NULL,
  state                 TEXT NOT NULL DEFAULT 'DRAFT',
    -- CHECK IN ('DRAFT','ACTIVE','COMPLETE','ARCHIVED')
  started_at            TIMESTAMPTZ,
  completed_at          TIMESTAMPTZ,
  operator_id           TEXT NOT NULL,
  erp_balance_at_close  NUMERIC,
  reconstructed_balance NUMERIC,
  balance_delta         NUMERIC,
  notes                 TEXT
  ```

  **`customer_config`** — per spec §25.3
  ```sql
  account_no                      TEXT PRIMARY KEY,
  allows_cross_bucket_settlement  BOOLEAN NOT NULL DEFAULT false,
  pays_for_cyl                    BOOLEAN NOT NULL DEFAULT false,
  updated_by                      TEXT,
  updated_at                      TIMESTAMPTZ
  ```

  **`customer_config_log`** — append-only audit
  ```sql
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_no    TEXT NOT NULL,
  flag_changed  TEXT NOT NULL,
  old_value     BOOLEAN,
  new_value     BOOLEAN NOT NULL,
  operator_id   TEXT NOT NULL,
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT now()
  ```

  **`exception_queue`**
  ```sql
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL,
  document_id   TEXT NOT NULL,
  lane          TEXT NOT NULL,
    -- 'SUSPENSE_PMT' | 'SUSPENSE_CRN' | 'MANUAL_HOLD' | 'UNCLASSIFIED_EXCEPTION' | 'OPERATIONAL_EXCEPTION'
  reason_code   TEXT,
  operator_id   TEXT,
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  ```

  **`classification_table`** — JNL / Bank UD classifications
  ```sql
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID NOT NULL,
  document_id      TEXT NOT NULL,
  document_type    TEXT NOT NULL,   -- 'JNL' | 'BANK_UD'
  classification   TEXT NOT NULL,
    -- 'PAYMENT_EQUIVALENT' | 'CREDIT_NOTE_EQUIVALENT' | 'DEBIT_ADJUSTMENT' | 'WRITE_OFF' | 'IGNORE'
  target_bucket    TEXT,             -- required if DEBIT_ADJUSTMENT
  operator_id      TEXT NOT NULL,
  classified_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  ```

  **`customer_credit_pool`** — append-only movement log
  ```sql
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_no    TEXT NOT NULL,
  session_id    UUID,
  event_type    TEXT NOT NULL,   -- 'CREDIT' | 'DEBIT'
  amount        NUMERIC NOT NULL,
  source_doc_id TEXT,
  operator_id   TEXT NOT NULL,
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT now()
  ```

  **`custody_reconciliation_event`** — append-only; created by operational CRN auto-apply only
  ```sql
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL,
  crn_doc_no    TEXT NOT NULL,   -- the operational CRN applied
  invoice_id    TEXT NOT NULL,   -- target invoice
  sku           TEXT NOT NULL,   -- SKU matched
  qty_applied   NUMERIC NOT NULL,
  match_basis   TEXT NOT NULL,   -- always 'EXACT_SKU_PRIOR_DATED' for auto-apply
  applied_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  ```
  Note: this table records custody state changes only. It must never be created by a financial allocation action. Financial allocations write to `allocation_record` exclusively.

- **Dependencies:** T-01 (DTRX validation) for field alignment, T-03 (repo exists) for migration files
- **Risk Level:** Medium — JSONB GIN index strategy must be defined before production load (see T-05)
- **Suggested Owner:** Backend engineer
- **Related Decision Node:** D1 — four-component sub-ledger
- **Estimated Complexity:** Medium

---

### T-05 · Define GIN index strategy for `cyl_qty_balance` JSONB

- **Priority:** High — must be resolved before schema is committed to production
- **Type:** Feature / Validation
- **Description:** Benchmark JSONB query patterns against representative data (INC001: ~197 invoices, ~108 operational CRNs). Key queries: (a) find all invoices with qty > 0 for a given SKU, (b) sum qty across all open invoices per SKU for a session. Implement GIN index if query plans show seq scans on relevant query shapes. Document index definition in schema migration file.
  ```sql
  CREATE INDEX ON invoice_sub_ledger USING GIN (cyl_qty_balance);
  ```
- **Dependencies:** T-04
- **Risk Level:** Medium — performance failure at scale is predictable but not yet measured
- **Suggested Owner:** Backend / DB engineer
- **Related Decision Node:** CURRENT_STATE §5 — open risk
- **Estimated Complexity:** Low–Medium

---

### T-06 · Implement 9-step session load pipeline

- **Priority:** High — foundational; nothing else can run without it
- **Type:** Feature
- **Description:** Implement the session load sequence exactly as specified in §17. Steps must execute in order. Each step is independently testable.

  1. Load all documents from ERP summary export for `account_no` + date range → parse into typed document records (INV / CRN / OB / JNL / BANK_UD)
  2. Load DTRX payments from `transaction_headers` for same account + date range
  3. Load CYL qty data from `transaction_items` → build `cyl_qty_balance_by_sku` (JSONB) per invoice
  4. Split CRNs: `HDR_TOTAL ≠ 0` → financial queue; `HDR_TOTAL = 0` → operational queue
  5. Apply operational CRNs to `cyl_qty_balance_by_sku` deterministically: exact SKU match + `crn_date < invoice_date` → auto-apply; all others → `OPERATIONAL_EXCEPTION`
  6. Sign-split OBs: positive → INV lane (ranked before all dated invoices); negative → credit pool
  7. Route all JNL and Bank UD to `UNCLASSIFIED_EXCEPTION` queue unconditionally
  8. Seed invoice sub-ledgers from detail lines using CAT-to-bucket map (see §7 sub-ledger seeding table)
  9. Display session workspace; expose suggestions; session state → `ACTIVE`

  **CAT-to-bucket map (from §7):**
  - `14K, 19K, 9KG, SV, DV` → `LPG`
  - `CYL`, `SKU ending in .1` → `CYL`
  - `AGR` → `OTHER` (warn: "Rarely used — verify allocation")
  - Unmapped → `OTHER` (no warning)

- **Dependencies:** T-04 (schemas), T-01 (DTRX entry_type)
- **Risk Level:** High — errors here propagate through the entire session
- **Suggested Owner:** Backend engineer
- **Related Decision Node:** D5, D7, §17 spec
- **Estimated Complexity:** High

---

### T-07 · Build composite allocation scorer

- **Priority:** High
- **Type:** Feature
- **Description:** Implement the scoring stack from §10 with these exact signal weights and the hard past-only filter:

  ```
  // Hard filter (BEFORE scoring — not a signal)
  eligible_invoices = invoices.filter(inv => inv.invoice_date <= payment.tx_date)

  // Scoring stack (applied to eligible_invoices only)
  Signal 1: date_proximity     — primary   — ABS(inv.invoice_date - pmt.tx_date), ascending
  Signal 2: amount_proximity   — strong    — ABS(inv.remaining_balance - pmt.amount), ascending
  Signal 3: balance_impact     — tiebreak  — prefer allocations minimising net session balance delta
  Signal 4: FIFO               — tiebreak  — older invoice preferred among equal candidates
  Signal 5: bank_ref_fuzzy     — near-zero — fuzzy match on pmt.description
  Signal 6: customer_ref_fuzzy — near-zero — fuzzy match on pmt.batch_ref

  // OB priority rule (applied after filter, before scoring)
  // Positive OB always ranks before all dated invoices — business rule, not a score signal
  ```

  CRN scoring (§10):
  - Primary: date proximity (same past-only constraint)
  - Secondary: `ABS(crn_remaining - invoice_component_balance)`
  - Tertiary: bucket similarity (CRN bucket fraction vs invoice dominant bucket; ≥70% = dominant)

  Scorer must return an ordered suggestion list, never auto-allocate.

- **Dependencies:** T-04, T-06
- **Risk Level:** Medium
- **Suggested Owner:** Backend engineer
- **Related Decision Node:** D3, D8, §10 spec
- **Estimated Complexity:** Medium

---

### T-08 · Implement PMT allocation mechanics

- **Priority:** High — gated on T-01 (entry_type confirmed)
- **Type:** Feature
- **Description:** Implement the locked four-step PMT allocation rule from §10 exactly. The engine must enforce these constraints at the service layer, not just the UI layer.

  ```
  Step 1: Operator selects target invoice (engine has suggested; must satisfy date invariant)
  Step 2: For mixed invoices — operator MUST explicitly select component (LPG / CYL_VALUE / OTHER)
          For single-component invoices — component is implicit
          Engine may suggest; NEVER auto-select for mixed invoices
  Step 3: Engine applies MIN(pmt_amount, component_balance)
          If pmt_amount <= component_balance → component reduced, PMT consumed
          If pmt_amount > component_balance → component → 0, remainder → Suspense-PMT
  Step 4: PMT remainder in Suspense-PMT; engine SUGGESTS next allocation; NEVER performs it
  ```

  Enforcement constraints (enforced in service layer):
  - No proportional distribution of PMT across LPG + CYL + OTHER simultaneously
  - No auto-spill of PMT remainder into next component
  - No auto-selection of component for mixed invoices
  - No chaining of two allocation actions without an operator confirmation event between them

  Allocation record must be written to `allocation_record` on every confirmed action.

- **Dependencies:** T-04, T-06, T-07, T-01
- **Risk Level:** High
- **Suggested Owner:** Backend engineer
- **Related Decision Node:** D3, §10 spec
- **Estimated Complexity:** High

---

### T-09 · Implement all five exception lanes

- **Priority:** High
- **Type:** Feature
- **Description:** Implement exception lane routing and UI states for all five lanes. UNCLASSIFIED_EXCEPTION is the only blocking lane.

  | Lane | Source | Blocks completion? |
  |---|---|---|
  | `SUSPENSE_PMT` | PMT with no eligible past-dated invoice, or PMT remainder > R1.00 | No |
  | `SUSPENSE_CRN` | Financial CRN with no open invoice match, or CRN remainder | No |
  | `MANUAL_HOLD` | Invoice remainder > R1.00 after all PMTs and CRNs applied | No |
  | `UNCLASSIFIED_EXCEPTION` | Any JNL or Bank UD on session load | **Yes** |
  | `OPERATIONAL_EXCEPTION` | Operational CYL CRN without exact SKU + prior-dated match | No (custody-only) |

  Session completion button must be disabled while any `UNCLASSIFIED_EXCEPTION` remains unresolved.
  `OPERATIONAL_EXCEPTION` must be visually distinct from financial exception lanes — it is a custody lane.

- **Dependencies:** T-04, T-06
- **Risk Level:** Medium
- **Suggested Owner:** Backend + Frontend
- **Related Decision Node:** D5, §16 spec
- **Estimated Complexity:** Medium

---

### T-10 · Implement JNL / Bank UD classification modal

- **Priority:** High — blocks session completion until resolved
- **Type:** Feature
- **Description:** Build the classification modal for `UNCLASSIFIED_EXCEPTION` documents. Classification options per §14:

  | Classification | Effect | Special requirement |
  |---|---|---|
  | `PAYMENT_EQUIVALENT` | Enters PMT lane | Past-only date constraint applies |
  | `CREDIT_NOTE_EQUIVALENT` | Enters financial CRN lane | Bucket scoring applied |
  | `DEBIT_ADJUSTMENT` | Enters INV lane, INCREASES exposure | **Danger UI mandatory** — red styling, explicit "Adds R[amount] to debtor balance" confirmation modal. Operator must set target bucket. |
  | `WRITE_OFF` | Clears document | Operator must enter reason; explicit confirmation required |
  | `IGNORE` | Removed from session | Logged to audit with timestamp + operator ID |

  `DEBIT_ADJUSTMENT` must never use the same UI styling as settlement actions. Confirmation modal must show the exact amount added to the debtor balance before saving.

- **Dependencies:** T-04, T-09
- **Risk Level:** High — operator error risk on DEBIT_ADJUSTMENT is the highest single UX risk in the system
- **Suggested Owner:** Frontend + Backend
- **Related Decision Node:** D9, §14 spec
- **Estimated Complexity:** Medium

---

### T-11 · Implement friction-born customer flag prompts

- **Priority:** High
- **Type:** Feature
- **Description:** Implement the two flag workflows from §25 exactly. Flags must NOT be set via a settings screen as the primary entry point.

  **`allows_cross_bucket_settlement` flow (§25.1):**
  Trigger: first cross-bucket allocation attempt in a session where flag is `NULL` or `false`
  ```
  condition: operator attempts CRN/PMT to different bucket AND flag IS NULL OR false AND first attempt this session
  modal options:
    - "Proceed once"            → allocation completes, flag unchanged
    - "Always allow for this customer" → allocation completes, flag = true saved to customer_config
    - "Cancel"                  → allocation cancelled, no change
  ```
  Once `flag = true`: soft informational badge only, no blocking modal.

  **`pays_for_cyl` flow (§25.2):**
  Trigger: first PMT allocation targeting `cyl_value_balance` where flag is `NULL` or `false`
  ```
  condition: PMT directed to cyl_value_balance AND flag IS NULL OR false AND first attempt this session
  modal options:
    - "Proceed once"                    → PMT applied, custody_state stays OUTSTANDING
    - "Mark customer as pays for cylinders" → PMT applied, flag = true saved, custody_state → COMMERCIALIZED
    - "Cancel"                           → allocation cancelled
  ```
  All config changes logged to `customer_config_log` (append-only).
  Flags also editable from session header customer info panel — take effect immediately for current session.

- **Dependencies:** T-04, T-08
- **Risk Level:** Medium
- **Suggested Owner:** Frontend + Backend
- **Related Decision Node:** D4, §25 spec
- **Estimated Complexity:** Medium–High

---

### T-12 · Implement session completion validator

- **Priority:** High
- **Type:** Feature
- **Description:** Session completion requires all three conditions (§18):
  1. Every document has a terminal state (`ALLOCATED`, `PARTIAL_ALLOCATED`, `MANUAL_HOLD`, `SUSPENSE_PMT`, `SUSPENSE_CRN`, `WRITE_OFF`, `IGNORED`, or `OPERATIONAL_EXCEPTION`)
  2. No `UNCLASSIFIED_EXCEPTION` remains in any queue
  3. Operator explicitly clicks "Mark Complete"

  ERP balance convergence is NOT a required condition. When `reconstructed_balance ≠ erp_balance`: display informational warning only. Operator may complete with noted discrepancy.
  On completion: save `reconstructed_balance`, `balance_delta`, `completed_at` to `session` table.

- **Dependencies:** T-04, T-06, T-09
- **Risk Level:** Low
- **Suggested Owner:** Backend + Frontend
- **Related Decision Node:** D6, §18 spec
- **Estimated Complexity:** Low–Medium

---

### T-13 · Implement credit pool (persistent, operator-triggered)

- **Priority:** Medium — needed for sessions with negative OB or overpayments
- **Type:** Feature
- **Description:** Credit pool per §15. Sources: overpayment (PMT > invoice balance), unapplied financial CRN remainder, negative OB on session load.
  - Persistence: indefinite, survives session close
  - Application: operator-triggered ONLY; engine never auto-applies
  - Balance displayed on session header at all times
  - JNL credits do NOT automatically feed the pool (JNL → UNCLASSIFIED_EXCEPTION first)
  - Negative OB → credit pool on session load (step 6 of session load pipeline)
  - Schema: `customer_credit_pool` (append-only movement log, customer-keyed)
  - UI: credit pool application must be presented from a dedicated action, never inline with regular allocation cards

- **Dependencies:** T-04, T-06
- **Risk Level:** Low
- **Suggested Owner:** Backend + Frontend
- **Related Decision Node:** §15 spec
- **Estimated Complexity:** Medium

---

### T-14 · Implement rounding write-off flow

- **Priority:** Medium
- **Type:** Feature
- **Description:** Per §18: residuals ≤ R1.00 eligible for `ROUNDING_WRITE_OFF`. Operator one-click approval required — never silent or automatic. On approval:
  - Create `ROUNDING_WRITE_OFF` record in `allocation_record` with approving operator ID
  - Set invoice `financial_state = SETTLED` (component balance zeroed within tolerance)
  - Consider making the R1.00 threshold per-account configurable (open risk — low priority; hardcode initially with TODO comment)
- **Dependencies:** T-04, T-08
- **Risk Level:** Low
- **Suggested Owner:** Backend + Frontend
- **Related Decision Node:** §18 spec
- **Estimated Complexity:** Low

---

### T-15 · Implement append-only allocation audit log

- **Priority:** Medium — "costs near-zero and will be essential by month 3" (§17)
- **Type:** Feature
- **Description:** Per §17, a formal queryable audit trail is deferred post-MVP but an append-only allocation log is mandatory from day one. Minimum required log content:
  - All allocation records (amounts, doc refs, operator ID, timestamp) — `allocation_record` table covers this
  - All exception lane assignments with reason codes — `exception_queue` table covers this
  - Credit pool movements — `customer_credit_pool` table covers this
  - Reconstructed running balance at session close — `session` table covers this
  - `ROUNDING_WRITE_OFF` records with approving operator ID — `allocation_record` covers this
  - JNL / Bank UD classification decisions — `classification_table` covers this
  - IGNORED document log (doc_id, operator_id, timestamp) — add `IGNORE` action type to `allocation_record`
  
  The tables designed in T-04 cover all of this if implemented as append-only. Enforce: no UPDATE/DELETE on `allocation_record`, `exception_queue`, `customer_credit_pool`, `classification_table`. Row-level append-only via Postgres policy or application-layer constraint.

- **Dependencies:** T-04
- **Risk Level:** Low
- **Suggested Owner:** Backend
- **Related Decision Node:** §17 spec
- **Estimated Complexity:** Low

---

### T-16 · UI safety contract implementation

- **Priority:** Medium — tied to T-08, T-09, T-10
- **Type:** Feature
- **Description:** Per §19, the following UI safety contracts are mandatory (not optional polish):
  1. `DEBIT_ADJUSTMENT` — red/danger styling + "Adds R[amount] to debtor balance" confirmation modal before saving
  2. Cross-bucket allocations — warning displayed; severity adapts to `allows_cross_bucket_settlement` flag
  3. `UNCLASSIFIED` documents — visually block allocation; operator cannot allocate an unclassified JNL
  4. Confirmation dialogs — must show affected sub-ledger component balances before and after proposed allocation
  5. PMT against CYL component — separate alert: "Cash payment applied to CYL balance — verify physical return with operations"
  6. Session completion button — disabled until all docs reach terminal state AND no UNCLASSIFIED_EXCEPTION exists
  7. Credit pool application — operator-initiated from dedicated action; never inline with regular allocation cards

- **Dependencies:** T-08, T-09, T-10, T-11
- **Risk Level:** High (DEBIT_ADJUSTMENT specifically), Medium (others)
- **Suggested Owner:** Frontend
- **Related Decision Node:** D9, §19 spec
- **Estimated Complexity:** Medium

---

## 2. TECHNICAL DEBT

---

### TD-01 · DTRX integration is assumed, not validated

- **Severity:** Critical
- **Cause:** PMT lane depends on `transaction_headers` for payment data, but `entry_type` values, reversal handling, and deduplication logic are unconfirmed in the production Supabase instance.
- **Risk:** PMT lane may load incorrect, doubled, or reversed payments into sessions if entry_type assumptions are wrong.
- **Suggested Resolution:** T-01 discovery query must be run before any PMT lane code is deployed. Once validated, update `CURRENT_STATE.md` to reflect confirmed assumptions.
- **Temporary Workaround:** Block PMT lane UI with a visible "DTRX integration pending validation" state during development.
- **Long-Term Impact:** If reversal handling is complex, a normalisation layer between DTRX and the PMT scorer may be needed post-MVP.

---

### TD-02 · Rounding threshold hardcoded at R1.00

- **Severity:** Low
- **Cause:** Spec defines R1.00 as the auto-close threshold. INC001 data shows R0.13 residuals — suggesting the threshold is reasonable but may not suit all accounts.
- **Risk:** Threshold may be too generous for high-value accounts or too tight for others with accumulated rounding diffs.
- **Suggested Resolution:** Make threshold a per-account configurable field on `customer_config`. Add `rounding_threshold NUMERIC DEFAULT 1.00` to the schema.
- **Temporary Workaround:** Hardcode R1.00 with a `TODO: make per-account configurable` comment.
- **Long-Term Impact:** If left hardcoded, support requests will accumulate as edge cases emerge.

---

### TD-03 · No formal queryable audit trail (deferred post-MVP)

- **Severity:** Medium (grows over time)
- **Cause:** §17 explicitly defers a formal queryable audit interface to post-MVP. Append-only log tables exist but have no query API surface.
- **Risk:** Month 3 operational reality: finance will want to answer "what happened to invoice INV-12345?" without reading raw database tables.
- **Suggested Resolution:** Build a simple audit query API (by invoice_id, by session_id, by operator_id) in the first post-MVP sprint.
- **Temporary Workaround:** Raw Supabase dashboard query access for the initial period.
- **Long-Term Impact:** Without a queryable audit surface, operator trust in the system erodes as unexplained session outcomes accumulate.

---

### TD-04 · Cross-period allocation rules undefined

- **Severity:** Low (now), Medium (at scale)
- **Cause:** Deferred post-MVP. Past-only payment rule (`invoice_date ≤ payment_date`) covers most cases in practice.
- **Risk:** Accounts with payments predating invoices in the export window will surface as scoring edge cases. The scorer will correctly exclude future-dated invoices, but "future-dated relative to the payment" and "older than the export window" are different problems.
- **Suggested Resolution:** Define cross-period rules in a post-MVP spec amendment.
- **Temporary Workaround:** Document the limitation in session operator notes. Surface as an informational warning when the scorer finds zero eligible invoices for a payment.
- **Long-Term Impact:** Grows in importance as more historical sessions are processed.

---

### TD-05 · Append-only constraint not enforced at DB layer

- **Severity:** Medium
- **Cause:** The audit log tables (`allocation_record`, `exception_queue`, etc.) are designed as append-only but have no Postgres-level enforcement (e.g. no `BEFORE UPDATE OR DELETE` trigger or RLS policy blocking mutation).
- **Risk:** A bug or accidental migration could silently mutate audit records.
- **Suggested Resolution:** Add Postgres row-level security policies or triggers blocking UPDATE/DELETE on audit tables.
- **Temporary Workaround:** Application-layer constraint (no UPDATE/DELETE calls from the service layer) during MVP.
- **Long-Term Impact:** Audit integrity failure is a compliance and trust issue; must be resolved before the system handles real production volume.

---

## 3. REUSABLE KNOWLEDGE

---

### Pattern 1 · Friction-born configuration

- **Description:** Customer configuration flags are never set via a settings screen. They surface as a modal prompt at the exact moment the operator encounters the relevant friction for the first time in a session. The operator makes an explicit choice: proceed once, always allow (persists), or cancel. No counting logic. No threshold-triggered prompts. Operator intent is the sole source of config truth.
- **Recommended Usage:** Any system that requires per-customer behavioural overrides (cross-bucket, CYL cash settlement, write-off thresholds). Also applicable to any human-in-the-loop workflow where implicit preference inference would create hidden state drift.
- **Constraints:** Requires a `customer_config` table with a config-change audit log. Modal must appear inline in the workflow context, not as a navigation away from the current action. Flag must be immediately effective for the current session.
- **Related Systems:** `customer_config`, `customer_config_log`, §25 spec
- **Reusability Level:** High

---

### Pattern 2 · Dual independent state machine per domain entity

- **Description:** An invoice carries two independent settlement state machines (`financial_state`, `custody_state`) rather than a single composite state. Neither state machine blocks the other. `SETTLED + OUTSTANDING` is a valid complete outcome, not a partial one. This pattern avoids the "settled only when everything is settled" assumption that creates false blocking conditions.
- **Recommended Usage:** Any domain entity with multiple independent dimensions of completion (value vs. physical asset, financial vs. operational). Payment systems, lease/return workflows, goods-in-transit tracking.
- **Constraints:** UI must clearly communicate that the two states are independent. Engineers must not add a `is_fully_settled` composite flag — it reintroduces the coupling the pattern is designed to avoid.
- **Related Systems:** `invoice_sub_ledger.financial_state`, `invoice_sub_ledger.custody_state`, §20 spec
- **Reusability Level:** High

---

### Pattern 3 · Suggest-only allocation engine

- **Description:** The reconciliation engine scores, ranks, and suggests allocation targets but never executes an allocation autonomously. Every financial allocation requires an explicit operator confirmation event. The engine can chain suggestions after each confirmed action, but must not chain actions. This pattern is applicable wherever ERP or source-of-record data is known to be incomplete or unreliable.
- **Recommended Usage:** Any reconciliation workflow where source data reliability is in question, or where accounting decisions require defensible audit trails. Financial close workflows, payment matching, inventory adjustments.
- **Constraints:** The suggest-only boundary must be enforced at the service layer, not only at the UI layer. It is not enough to grey out a button — the backend must reject autonomous allocation calls.
- **Related Systems:** Matching engine §10, §9 domain invariants
- **Reusability Level:** High

---

### Pattern 4 · Temporal hard filter before scoring

- **Description:** Before any scoring signal is evaluated, a hard temporal filter removes ineligible candidates from the scoring pool. In this system: `invoice_date ≤ payment_date`. Candidates that fail the filter are invisible to the scorer — they receive no score, not a low score. This prevents future-dated invoices from appearing as low-confidence suggestions.
- **Recommended Usage:** Any matching engine where temporal validity is a non-negotiable accounting constraint. Revenue recognition, invoice aging, credit term enforcement.
- **Constraints:** The filter is applied in code before the scoring function is called, not as a score weight of zero or negative infinity. A weight-based approach risks edge cases where the filter is bypassed by extreme values on other signals.
- **Related Systems:** §10 matching engine, §9 domain invariants
- **Reusability Level:** High

---

### Pattern 5 · Sub-ledger decomposition of a single document

- **Description:** An invoice is not a single balance. It is decomposed into named sub-ledger components (LPG value, CYL value, OTHER value, CYL qty by SKU). Each component is independently tracked and independently settled. Allocations target one component per action. This allows partial settlement of mixed documents without losing visibility into what remains open on each dimension.
- **Recommended Usage:** Any domain where a single document carries heterogeneous liability types (products with physical assets, multi-category billing, bundled services). Utility bills, equipment leases, gas + cylinder accounts.
- **Constraints:** Sub-ledger seeding from line-item detail is required — the pattern fails if only header totals are available. Bucket-to-line mapping logic must be maintained (CAT code map in this system).
- **Related Systems:** `invoice_sub_ledger`, §7 spec, detail line seeding in session load pipeline
- **Reusability Level:** High

---

### Pattern 6 · Four-source triangulation for incomplete ERP data

- **Description:** When no single data source is complete or reliable, the engine triangulates across multiple sources to reconstruct a complete picture. Each source contributes what it does reliably: ERP summary → document headers, detail lines → item composition, DTRX → payment truth, transaction_items → custody quantities. The ERP running balance is treated as a health signal, not a ground truth.
- **Recommended Usage:** Any reconciliation engine operating against legacy ERP systems with known export limitations, incomplete payment linkage, or missing line-item detail in header exports.
- **Constraints:** Each source must have a clearly defined role and trust level. Conflicts between sources must surface as exceptions, not be silently resolved. The "least trusted" source (ERP balance) must be explicitly labelled as a health signal in the UI.
- **Related Systems:** §5 data sources, §18 completion rules
- **Reusability Level:** Medium

---

## 4. CODING / ARCHITECTURE STANDARDS

---

### Standard S-01 · Financial allocations are never performed autonomously

- **Rule:** The allocation service layer must reject any call that would apply a PMT or CRN allocation without a confirmed operator action event (operator_id + timestamp). No background jobs, no event-triggered allocations, no "best guess" auto-completion.
- **Rationale:** ERP data is known incomplete. Autonomous allocation creates undefendable accounting decisions. The spec explicitly prohibits this in §9.
- **Enforcement Priority:** Critical
- **Applies To:** Allocation service, API endpoints, session load pipeline, any background job touching `invoice_sub_ledger`

---

### Standard S-02 · PMT allocation: one PMT → one invoice → one component per action

- **Rule:** A single PMT allocation action may reduce exactly one sub-ledger component of exactly one invoice. Service layer must enforce this constraint regardless of what the UI sends. No proportional distribution. No multi-component application. Remainder → Suspense-PMT.
- **Rationale:** Proportional split is an invented assumption that destroys operator intent and creates silent accounting errors. Locked after three spec review passes.
- **Enforcement Priority:** Critical
- **Applies To:** PMT allocation service, API, integration tests

---

### Standard S-03 · Bank UD routes to UNCLASSIFIED_EXCEPTION; never to Suspense-PMT

- **Rule:** `BANK_UD` document types must be routed to `UNCLASSIFIED_EXCEPTION` on session load unconditionally. They may never enter `Suspense-PMT` or any financial lane until operator classification is complete.
- **Rationale:** Bank UD may be a correction artifact or a reversal. It does not imply cash was received. Suspense-PMT is reserved for confirmed cash receipts only.
- **Enforcement Priority:** Critical
- **Applies To:** Session load pipeline step 7, exception routing, integration tests

---

### Standard S-04 · Zero-value CRNs never touch financial balances

- **Rule:** A CRN with `HDR_TOTAL = 0` may only reduce `cyl_qty_balance_by_sku`. It must never be applied to `lpg_value_balance`, `cyl_value_balance`, or `other_value_balance`. Service layer must enforce this by type-checking before applying.
- **Rationale:** Zero-value CRNs are custody events, not financial settlement instruments.
- **Enforcement Priority:** Critical
- **Applies To:** Operational CRN apply logic, session load step 5

---

### Standard S-05 · `financial_state` and `custody_state` are always tracked independently

- **Rule:** No code may derive `financial_state` from `custody_state` or vice versa. No composite "is_settled" boolean. No trigger that sets one state based on the other. Both states are updated only by explicit allocation actions targeting their respective sub-ledger components.
- **Rationale:** `SETTLED + OUTSTANDING` is a valid complete outcome. Coupling the states reintroduces the `partial_settled` anti-pattern.
- **Enforcement Priority:** High
- **Applies To:** `invoice_sub_ledger` update logic, state machine transitions, ORM hooks

---

### Standard S-06 · Customer config may only be mutated by operator action

- **Rule:** `customer_config` rows may only be created or updated by an explicit operator action (carries `operator_id`). No background job, no session load pipeline step, no scoring engine may write to `customer_config`. All writes must be accompanied by an entry in `customer_config_log`.
- **Rationale:** Implicit config mutation creates hidden behavioural drift. Operator intent is the sole source of config truth (§25 spec).
- **Enforcement Priority:** High
- **Applies To:** `customer_config` write path, API, session load pipeline

---

### Standard S-07 · Audit log tables are append-only

- **Rule:** `allocation_record`, `exception_queue`, `customer_credit_pool`, `classification_table`, `customer_config_log` are append-only. No UPDATE or DELETE operations are permitted. Corrections are made by creating a new compensating record with a reason code.
- **Rationale:** Audit integrity requires immutable history. Silent overwrites destroy the ability to reconstruct session events.
- **Enforcement Priority:** High
- **Applies To:** All audit log tables; Postgres RLS policies should enforce this once TD-05 is resolved

---

### Standard S-08 · ERP is read-only

- **Rule:** No service, job, or agent may write to the ERP system or ERP export files. The reconciliation engine is a read workbench only.
- **Rationale:** ERP writeback is explicitly out of scope for MVP (§2). Any writeback path introduces integration complexity and rollback risk.
- **Enforcement Priority:** High
- **Applies To:** All backend services, data connectors

---

### Standard S-09 · DEBIT_ADJUSTMENT UI must use danger styling

- **Rule:** Any UI surface that presents or confirms a `DEBIT_ADJUSTMENT` classification must use red/danger styling and display an explicit "Adds R[amount] to debtor balance" confirmation modal before saving. It must never use the same visual treatment as a settlement action (green, neutral, or payment-adjacent styling).
- **Rationale:** DEBIT_ADJUSTMENT is the only classification that increases debtor exposure. Operator confusion here has direct financial impact.
- **Enforcement Priority:** High
- **Applies To:** Classification modal, session exception lane UI, frontend component library

---

### Standard S-10 · Spec changes require version bump and changelog entry

- **Rule:** Any change to a locked business rule in `LSR5_Business_Rules_Spec.html` must (a) be applied as a `str_replace` surgical edit to the single canonical file, (b) increment the version number, and (c) add a new entry to the version timeline inside the document. No new versioned file copies.
- **Rationale:** Multiple versioned file copies create divergence and context confusion. The internal changelog is the audit trail.
- **Enforcement Priority:** Medium
- **Applies To:** Product owner, implementation agents, any developer touching the spec

---

### Standard S-11 · Operational CRN auto-apply creates custody event, not financial allocation record

- **Rule:** When a deterministic operational CRN qty auto-apply occurs on session load, the system must write a `custody_reconciliation_event` record and must NOT write an `allocation_record` of any financial action type. Silent mutation with no persisted event is explicitly prohibited.
- **Rationale:** The domain boundary between financial allocations and custody reconciliation must be preserved in the audit trail, not just in code logic. `allocation_record` carries accounting meaning — an operational CRN appearing there would corrupt the financial audit log. At the same time, untraceable state mutation is operationally dangerous; `custody_reconciliation_event` preserves observability without crossing the accounting boundary.
- **Enforcement Priority:** High
- **Applies To:** Session load pipeline step 5 (operational CRN auto-apply), `custody_reconciliation_event` write path, integration tests QA-OPCRNQTY-01 through QA-OPCRNQTY-05

**Permitted auto-apply actions (write `custody_reconciliation_event`):**
- Reduce `cyl_qty_balance_by_sku` for a matched SKU
- Update `custody_state` if all SKU qtys reach zero

**Prohibited in auto-apply (never permitted without operator confirmation):**
- Any change to `lpg_value_balance`, `cyl_value_balance`, `other_value_balance`
- Any write to `allocation_record`
- Any change to `financial_state`

---

## 5. OPEN RISKS REQUIRING TRACKING

---

### Risk R-01 · DTRX entry_type values unknown

- **Description:** `transaction_headers.entry_type` field values for payment records have not been confirmed in the production Supabase instance. Reversal entries, deduplication behaviour, and field mapping are all unvalidated assumptions.
- **Likelihood:** High — this is a confirmed unknown, not a speculative risk
- **Impact:** Critical — incorrect entry_type filtering could load reversed or doubled payments into sessions
- **Monitoring Requirement:** Run discovery query (T-01) before any PMT lane code is merged. Block PMT lane deployment until result is documented.
- **Escalation Trigger:** If entry_type values differ from expectations, pause PMT lane implementation and update DTRX field mapping in §5 of spec before proceeding.

---

### Risk R-02 · ~~Findings from ChatGPT PRD session unaudited~~ — CLOSED

- **Description:** All 13 findings from the ChatGPT PRD review (v2.1.0 review pass) have been systematically verified against v2.3.1. Every finding is resolved. T-02 is complete.
- **Likelihood:** N/A — closed
- **Impact:** N/A — closed
- **Resolution:** Full closure record documented in T-02 finding tracker. No spec amendments required — all fixes were already applied in v2.2.0 through v2.3.1.

---

### Risk R-03 · JSONB JSONB cyl_qty_balance performance at scale

- **Description:** `cyl_qty_balance_by_sku` is JSONB. Key access patterns (find all invoices with qty > 0 for a SKU, sum qty across open invoices per SKU) may degrade without a GIN index. Performance at production scale is unknown.
- **Likelihood:** Medium
- **Impact:** Medium — slow session load is an operational friction issue, not a data correctness issue
- **Monitoring Requirement:** Benchmark before production load (T-05). Monitor query plan for seq scans on `cyl_qty_balance`.
- **Escalation Trigger:** p95 session load time > 3s on accounts with > 500 open invoices.

---

### Risk R-04 · INC001 R700k balance origin unverified

- **Description:** The ~R700k open AR balance for INC001 is assumed to be genuine outstanding AR. It may partly reflect ERP export data completeness issues (missing historical payments, mismatched periods).
- **Likelihood:** Medium
- **Impact:** Medium — if the balance is inflated by ERP completeness issues, the first real session will surface a large unexplained balance delta
- **Monitoring Requirement:** Run the first INC001 session carefully. Flag any balance delta > R50k for investigation.
- **Escalation Trigger:** Reconstructed balance deviates from ERP balance by > 20% after all available DTRX payments are applied.

---

### Risk R-05 · OPERATIONAL_EXCEPTION queue volume in production unknown

- **Description:** The MVP boundary places unmatched operational CRNs in the `OPERATIONAL_EXCEPTION` queue for manual operator assignment. If the volume of unmatched CRNs is high (many ambiguous cases), the queue becomes a significant operational burden.
- **Likelihood:** Low–Medium
- **Impact:** Low (operationally) — non-blocking. Medium (strategically) — may require CYL engine acceleration.
- **Monitoring Requirement:** Count `OPERATIONAL_EXCEPTION` entries per session in the first 5 production sessions.
- **Escalation Trigger:** More than 20 unmatched operational CRNs per account per session — triggers CYL engine prioritisation.

---

## 6. KNOWLEDGE BASE UPDATES

---

### Knowledge Update K-01

- **Target File:** `/knowledge/architecture/dual-state-settlement-model.md`
- **Recommended Addition:** Document the `financial_state` / `custody_state` independent enum model, the valid state combinations table from §7, and the rationale for why `SETTLED + OUTSTANDING` is a complete (not partial) outcome. Include the schema definition.
- **Reason:** This is the most frequently misunderstood aspect of the domain model. Engineers and future AI sessions need a clear reference that prevents reintroduction of the `partial_settled` anti-pattern.

---

### Knowledge Update K-02

- **Target File:** `/knowledge/business-rules/pmt-allocation-mechanics.md`
- **Recommended Addition:** The full locked four-step PMT allocation rule from §10, including the worked example (R5,000 PMT against LPG R3,000 + CYL R2,000), the "what the engine must never do" list, and the enforcement constraint that this must be validated at the service layer.
- **Reason:** PMT allocation is the highest-complexity mechanic in the engine. The worked example is the fastest way to confirm understanding.

---

### Knowledge Update K-03

- **Target File:** `/knowledge/workflows/session-load-pipeline.md`
- **Recommended Addition:** The 9-step session load sequence from §17 in order, with the exact condition for operational CRN auto-apply (exact SKU + prior-dated, else OPERATIONAL_EXCEPTION), the OB sign-split rule, and the unconditional Bank UD → UNCLASSIFIED_EXCEPTION routing.
- **Reason:** Session load is executed first and its errors propagate through the entire session. A standalone reference reduces implementation risk.

---

### Knowledge Update K-04

- **Target File:** `/knowledge/prompts/lsr5-ai-session-bootstrap.md`
- **Recommended Addition:** A ~30-line context bootstrap prompt for future AI sessions. Should include: the "suggest-only, no autonomous allocation" constraint; the four-component sub-ledger model; the locked PMT rule; the prohibited patterns list (proportional split, auto-spill, inferred config, Bank UD → Suspense-PMT); and a pointer to `CURRENT_STATE.md` and the canonical spec.
- **Reason:** Future AI sessions need a fast, authoritative orientation to avoid re-deriving or contradicting locked decisions.

---

### Knowledge Update K-05

- **Target File:** `/knowledge/business-rules/cat-bucket-mapping.md`
- **Recommended Addition:** The complete CAT-to-bucket mapping table from §7 (14K/19K/9KG/SV/DV → LPG; CYL / SKU ending .1 → CYL; AGR → OTHER with warning; unmapped → OTHER). Note: DV and SV are LPG variants, not cylinder SKUs — common source of confusion.
- **Reason:** Sub-ledger seeding depends on this mapping. Errors here cause incorrect component balances for the entire session.

---

### Knowledge Update K-06

- **Target File:** `/knowledge/architecture/four-source-data-architecture.md`
- **Recommended Addition:** The four-source architecture table from §5, the DTRX field mapping for the PMT lane, the discovery query for entry_type validation, and the trust levels for each source (ERP summary = reference; DTRX = payment truth pending validation; detail lines = item composition; transaction_items = custody qty).
- **Reason:** The four-source architecture is counterintuitive. Engineers need to understand why no single source is sufficient and what each contributes.

---

## 7. DEPRECATED / OBSOLETE ITEMS

The following must not appear in implementation code, comments, tests, or documentation. If found, treat as a bug.

| Deprecated item | Replaced by | Risk if reintroduced |
|---|---|---|
| Single invoice balance scalar | Four-component sub-ledger | Incorrect settlement detection; custody tracking breaks |
| `partial_settled` boolean | `financial_state` / `custody_state` independent enums | Reintroduces false blocking; valid complete states flagged as partial |
| `is_financially_settled` boolean | `financial_state = SETTLED` | Coupling; enum is the canonical state |
| Proportional PMT split across components | One PMT → one component per action | Silent accounting errors; destroys operator intent |
| Auto-spill PMT remainder into next component | Explicit Suspense-PMT routing | Autonomous allocation — prohibited |
| 40% historical cross-bucket suppression | `allows_cross_bucket_settlement` operator flag | Hidden behavioural inference; config drift |
| `mixed_invoices` customer flag | Document fact from detail lines | Incorrect — bucket mix is per-document, not per-customer |
| Bank UD → Suspense-PMT routing | Bank UD → UNCLASSIFIED_EXCEPTION | May load reversals or corrections as confirmed cash |
| Blind operational CRN auto-apply | Conditional deterministic apply (exact match only) | May apply CRNs to wrong invoices |
| Three-source architecture | Four-source (ERP summary + detail + tx_headers + tx_items) | Taxonomy only; no functional risk |
| ERP balance as session completion gate | Informational health signal | Blocks valid session completions |
| Customer config via settings screen (primary entry) | Friction-born modal at first qualifying event | Operators never visit settings; flags never get set |
| Epoch anchor `1900-01-01` for OB ranking | Business rule: OB ranks before all dated invoices | Synthetic date may cause scorer edge cases |
| Fully automated / high-confidence matching | Suggest-only; operator confirms all actions | Autonomous allocation on unreliable data |
| `erp_snapshots` / `movement_data` in MVP scope | CYL Custody Engine (post-MVP) | Out of scope; implementation effort wasted |
| Regenerated parallel spec file copies | Surgical edits to single canonical HTML file | Spec divergence; version confusion |
