# CAP000 Track B Harvest — PROPOSED Amendment

**Status:** PROPOSED — NOT RATIFIED  
**Source:** `origin/claude/cap000-folder-576j34` (Turn 002 isolated branch)  
**Canonical Story:** `origin/main` (Turn 003, allocation-pending posture)  
**Purpose:** Document useful findings from Track B; clarify governance when merging evidence.

---

## What Track B Adds (Bounded Harvest)

### ✓ Custody Variance — H-029 (OPEN)

**Finding:** Part 1B financial CYL close (-R9,683.00) vs Part 2 physical custody valuation (-R1,437.50) differ by **R8,245.50**.

- ERP variance: R0.00 (financial statement balances)
- Sub-ledger tie variance: R0.00 (asset ledger balances)
- **Custody exception: R8,245.50** (likely physical count discrepancy or unrecorded damage/loss)

**Sourced from:** DB-driven v5 statement gen (via Supabase MCP during Track B's Turn 002)  
**Action:** Investigate custody shortfall before deposit-related customer communication.  
**Status:** Open exception; does not block canonical allocation story.

---

### ✓ Payment Gap Screening — H-030 (OPEN)

**Hypothesis (ASSERTED, not PROVEN):**

Two untagged 2023 payments likely cleared 7 stale-open invoices:

| Payment Doc | Date | Amount (R) | Note |
|:---|:---|---:|:---|
| 17886 | 2023-01-30 | -15,383.27 | TRANSF \| STAT:89, no INVNO |
| 18484 | 2023-02-28 | -11,471.71 | TRANSF \| STAT:89, no INVNO |
| **Sum** | | **-26,854.98** | Exact match to 7 invoices Nov 2022–Jan 2023 |

**Evidence tier:** 4 (pattern match, no remittance advice)  
**Confidence:** Medium (exact-sum match, stale-open context supports inference)  
**Not proof:** ERP never tagged INVNO; no customer remittance on file; pattern alone is not sufficient to close allocation lane.

**Action:** ERP Agent task — populate INVNO on payments 17886/18484 with invoice references if available in transaction detail.

**Status:** Open task; does not supersede the 8 STAT payments (May 2025 onward) awaiting allocation.

---

### ✗ H-011 Status — NOT "Resolved" (Clarification)

Track B marks H-011 as "resolved" based on account B/F chain variance = R0.00.  
**Canonical story clarifies:** H-011 (allocation lane) is **NOT closed** — it is **BALANCE-VERIFIED** but **ALLOCATION-PENDING**.

| Layer | Status |
|:---|:---|
| **Account-level balance** | Verified R70,773.28 (ERP = reconstructed, variance R0.00) ✓ |
| **Invoice-level allocation** | Pending — awaiting remittance advice or manual mapping ⏸ |

The 8 STAT payments (May 2025–Mar 2026, **R184,013.63** — `PROVEN` from `data/allocation_edges.csv`; prior R182,213.63 figure superseded) remain unallocated and require external evidence (remittance advice, payment instruction detail, or manual review).

---

## What Track B Does NOT Replace

The canonical main-branch story stands as the authoritative allocation posture:

- **invoices.csv** (207 docs, DEBENQ-derived, LPG/CYL classified) ✓
- **allocation_edges.csv** (8 unallocated STAT payments) ✓
- **reconciliation_status.csv** (129 invoices, 104 genuine gaps) ✓
- **CAP000_Allocation_Gap_Analysis.md** (3 options: remittance/manual/pending) ✓

Track B's multi-DEBENQ-export chain (DEBENQ23/24/25/CURRENT.TXT) is **superseded** by the main branch's consolidated CAP000.TXT + backup strategy.

---

## Integration Path (If Ratified)

1. **Custody variance (H-029):** Add to CAP000 project.json `history[]` as an open sub-task.  
   - Does not block allocation closure.  
   - Requires physical reconciliation / damage investigation.

2. **Payment gap screening (H-030):** Add as a specific recommendation to `CAP000_Allocation_Gap_Analysis.md`.  
   - Suggests ERP agent to tag the two 2023 payments if detail is available.  
   - Clarifies that this is pattern evidence (ASSERTED) for those 7 invoices only.  
   - The remaining 104 invoices / 8 STAT payments still require allocation evidence.

3. **Allocation status (H-011):** Keep canonical "allocation pending" framing.  
   - Do not merge Track B's "H-011 resolved" language.

---

## Governance Note

This harvest reflects the doctrine on evidence:

- **PROVEN:** Remittance-linked (Track A style: explicit customer evidence)
- **ASSERTED:** Pattern-matched or ERP-tagged (Track B's 7+2 hypothesis: strong inference, not proof)
- **ASSUMED:** DEBENQ-only unallocated (Track A's 8 STAT payments: no allocation evidence)

Track B's findings are valuable **supporting analysis**, not a **superseding closure**. Merging them as amendments keeps the allocation lane open to future remittance evidence, consistent with doctrine §3 (ERP tagging is not authoritative).

---

## Recommendation

✓ **Harvest H-029 and H-030 as open items** in the canonical story.  
✓ **Do not merge Track B's reconState change** ("v5_complete_custody_variance_open" → remain "pending").  
✓ **Keep the three allocation options (remittance/manual/pending)** as the primary path forward.

This preserves governance clarity: allocation remains pending on evidence; custody variance and ERP tagging are side-track exceptions, not blockers.
