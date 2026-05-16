# Pipeline: FINANCIAL CONTROL

Use this pipeline for any anomaly, bug, or data discrepancy that affects the financial integrity of the **LPG Stock Recon App**.

This pipeline treats every fix as a **Governed Financial Correction Event**, ensuring audit traceability and continuous financial intelligence.

---

## The Financial Bug Lifecycle

```text
DETECT → CLASSIFY → SPECIFY → IMPLEMENT → VERIFY → PERSIST → MONITOR
```

---

## Execution Environment

- **Jira:** Project **LSR**. All artifacts posted to Jira comments.
- **Database:** Supabase `financial_corrections` table tracks every event.
- **Tools:** `npm run build`, `npx tsc --noEmit`, `npm run lint`.

---

## Pipeline Overview

```
1. Detect anomaly (data or reconciliation mismatch)
2. Classify financial impact
3. Map affected ledger systems
4. Generate correction spec (Jira)
5. Implement fix
6. Validate financial outputs (Before vs After snapshot)
7. Persist correction as a financial event (financial_corrections table)
8. Monitor recurrence
```

---

## Phase 1 — Investigate & Classify

**Role doc:** `docs/roles/anomaly_investigator.md`

**Input:** Symptom description in Jira ticket (LSR-{n}).

**Output — Anomaly Report posted to Jira:**
- **Confirmed:** YES/NO/INCONCLUSIVE
- **Type:** ERP_MAPPING / LOGIC_ERROR / DATA_CORRUPTION / SCHEMA_MISMATCH
- **Severity:** Critical / High / Medium / Low
- **Financial Impact:** Estimated ZAR value of distortion (if applicable)
- **Root Cause:** Precise explanation (e.g., "VAT treated as exclusive")
- **Affected Ledgers:** List of tables/views impacted

---

## Phase 2 — Specification

**Role doc:** `docs/roles/ticket_architect.md`

**Output — Financial Correction Spec posted to Jira:**
- **Affected Files:** List of files to change
- **Ledger Impact Plan:** Which tables/records need correction
- **Step-by-Step Implementation:** Precise technical steps
- **Invariants Verified:** Compliance with `system-invariants.md`
- **Verification Plan:** How to generate the "Before vs After" snapshots

---

## Phase 3 — Implementation

**Role doc:** `docs/roles/coding_agent.md`

**Execution:**
- Implementation on `fix/LSR-{n}` branch.
- Build/Lint/TSC verification.
- Regression checks.

---

## Dual-Path Validation Model

To prevent systemic drift and ensure absolute correctness, this pipeline operates on two independent paths:

### 1. PRIMARY PATH (Execution)
`DETECT → CLASSIFY → SPECIFY → IMPLEMENT`
The goal is to fix the reported anomaly in the application code or data model.

### 2. INDEPENDENT PATH (Validation)
`RECALCULATE → VERIFY INVARIANTS → COMPARE OUTCOMES`
The goal is to independently prove the fix is correct by recomputing financial truth from raw data, ignoring all prior system conclusions.

---

## Phase 4 — Independent Validation & Persistence

**Role doc:** `docs/roles/financial_validator.md`

**The Independent Validation Pass:**
The validator must NOT rely on the application's UI or existing views to confirm the fix. Instead, they must perform an **Independent Recalculation** (using raw SQL or separate logic) and compare it against the system's output.

**Financial Truth Delta Report (Mandatory):**
Every fix must produce this report to prove the correction is accurate and has not caused secondary distortions.

| Metric | Before Fix | After Fix | Delta |
|---|---|---|---|
| Ledger Balance | X | Y | Z |
| Operational Balance | X | Y | Z |
| VAT Integrity Score | FAIL | PASS | +1 |
| Allocation Errors | {N} | {M} | {D} |

**Persistence:**
Once validated, the event is persisted to the `financial_corrections` table.
```sql
INSERT INTO financial_corrections (
    correction_id, type, severity, affected_module, 
    financial_impact, root_cause, fix_branch, status, 
    before_snapshot, after_snapshot
) VALUES (...);
```

---

## Severity & Governance Policy

| Severity | PM Gate | Code Review | Audit Log |
|---|---|---|---|
| **Critical** | Required (Spec + Fix) | Mandatory | High Priority |
| **High** | Required (Spec) | Recommended | Standard |
| **Medium** | Auto-proceed | Optional | Standard |
| **Low** | Auto-proceed | None | Standard |
