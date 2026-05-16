## Module PRD — Item-Aware Manual Reconciliation Tool
Produced by: DOMAIN-PRD-AGENT
Slice Brief: approved 2026-05-16
Date: 2026-05-16

---

### Vocabulary

| Term | Definition | Status |
|---|---|---|
| **Allocation** | A transactional link between a Credit Note/Payment and an Invoice for a specific ZAR amount. | New |
| **Spillover Credit** | The residual unallocated balance of a credit-type document. | New |
| **Item Classification** | A mapping layer that groups raw ERP SKUs into business-logical buckets (e.g., "9kg LPG"). | New |
| **Item Signature** | The unique set of SKU/Quantity pairs that define a document's content for recommendation scoring. | New |
| **Recommendation Score** | A 0-100 index of confidence that a credit document belongs to an invoice based on Item Signatures and dates. | New |
| **Unmatched Credit Pool** | The system-wide collection of credit documents with `available_balance > 0`. | New |
| **Training Feedback** | Mandatory user-provided rationale for manual overrides of high-confidence recommendations. | New |

---

### Feedback Reason Codes
The following codes are the authoritative reasons available for manual overrides:
- `SAME_DEBORDER` — Document numbers share the same "Deborder" prefix.
- `SAME_ORDERNO` — Document references share a common Order Number.
- `NAME_MATCH` — Customer name string similarity found.
- `EXACT_AMOUNT` — Financial total matches exactly (R0.00 variance).
- `PARTIAL_MATCH` — Logical split of a larger payment/credit.
- `DATE_PROXIMITY` — Documents occur within 24 hours of each other.
- `OTHER` — Unclassified manual decision.

---

### Actors and Permissions

**Debtors Clerk**
- CAN: View the reconciliation queue for assigned accounts.
- CAN: Accept system recommendations for document matching.
- CAN: Perform manual drag-and-drop allocations.
- CAN: View document item details and signatures.
- CANNOT: Modify allocations after a session is transitioned to `FINALIZED`.
- CANNOT: Delete system-generated `audit_log` entries.
- SEES: Workspace with cards, recommendation scores, and real-time balance updates.

**Finance Manager**
- CAN: Perform all Debtors Clerk actions.
- CAN: Transition a session state to `FINALIZED`.
- CAN: Export the Unmatched Report to CSV.
- CANNOT: Override `Monetary Truth` rules (e.g., cannot allocate more than the invoice total).
- SEES: Global account reconciliation status and exception dashboards.

---

### Business Rules

**BR-1: Financial Primacy**
The authoritative truth for an allocation is the ZAR amount (Quantity × Retail, tax inclusive). Item-level signatures are advisory and used only for recommendation scoring.

**BR-2: Monetary Integrity**
An allocation amount MUST NOT exceed the `available_balance` of the credit document OR the `outstanding_balance` of the target invoice at the time of execution.

**BR-3: Item-Aware Mapping**
Recommendation scoring must adhere to the SKU Shell Extraction rules (Deposit .1 vs Content .4/01) defined in `Documents/recon-engine-spec.md`.

**BR-4: Explicit Feedback Loop (INV-9)**
Any manual allocation that overrides a recommendation score > 80% MUST be accompanied by a `TrainingFeedback` reason code selected from a predefined list.

**BR-5: Spillover Persistence**
Excess credit resulting from an allocation MUST be preserved as a `Spillover Credit` in the `Unmatched Credit Pool` and remains available for future allocations.

**BR-6: Immutability (INV-3)**
A `FINALIZED` reconciliation session is immutable. No new allocations, edits, or deletions are permitted.

**BR-7: Real-Time Connectivity**
Reconciliation actions require an active network connection to ensure ledger integrity and prevent race conditions on balance updates.

**BR-8: Quantity-Only Foundation**
While this slice introduces ZAR for matching, the underlying SKU quantities remain the basis for "Item-Aware" confidence scores.

**BR-9: Retraining Frequency**
Global recommendation weights must be recomputed weekly (automated) or on-demand to incorporate new Training Feedback data into the scoring matrix.

**BR-10: Queue Exclusion**
Invoices with `PAID = 'Y'` or an `outstanding_balance = 0` MUST be excluded from the reconciliation queue to maintain focus on open items.

---

### Workflows

#### Manual Allocation Workflow

**Happy path:**
1. **Trigger:** Clerk selects an account and starts a reconciliation session.
2. **Queueing:** System displays the oldest unallocated Invoice as the "Target" card.
3. **Discovery:** System presents a ranked list of "Candidate" Credits/Payments based on Recommendation Score.
4. **Action:** Clerk drags a Candidate card onto the Target card.
5. **Validation:** System confirms balances are sufficient and triggers a DB transaction.
6. **Outcome:** `allocation` record is created; Target card `outstanding_balance` decreases; Candidate card `available_balance` decreases.

**Unhappy paths:**
- **Insufficient Balance:** If the allocation amount exceeds available funds, the system blocks the drop and vibrates/highlights the balance field in red.
- **Concurrent Edit:** If another user (or the ERP sync) updates a document balance during the workflow, the system rejects the allocation and triggers a "Data Stale" refresh.
- **Missing Reason:** If a user attempts to override a high-score match without selecting a reason, the "Submit" action is disabled until the reason is provided.

**Empty state:** "All documents for this account are fully allocated."
**Loading state:** "Calculating recommendations and item signatures..."
**Offline state:** "Connectivity lost. Allocation actions are disabled to prevent ledger desync."
**Concurrent access:** Only one active session per account is permitted (INV-9).

---

### State Transitions

This slice extends the `ReconciliationSession` state machine:

**Transition 1: Start Reconciliation**
- **FROM:** `OPEN`
- **TO:** `DRAFT`
- **TRIGGER:** Clerk saves the first allocation or manually "Starts" the session workspace.
- **GUARD:** ERP Snapshot must be present for the current period.
- **SIDE EFFECTS:** Audit log entry; session locked to current actor.

**Transition 2: Finalize Reconciliation**
- **FROM:** `DRAFT`
- **TO:** `FINALIZED`
- **TRIGGER:** Manager clicks "Finalize".
- **GUARD:** All critical variances acknowledged; all invoices in the queue addressed (even if partially unallocated).
- **SIDE EFFECTS:** Emit `session.finalized` event; unlock account for next period.

---

### Acceptance Criteria

**AC-1: Recommendation Ranking**
Given an Invoice containing `9kg LPG` and `19kg LPG`, when the system scans the Credit Note pool, then Credit Notes containing the same SKUs must appear at the top of the recommendation list with a score > 60.

**AC-2: Spillover Handling**
Given a R1000 Payment and a R800 Invoice, when the user allocates the payment to the invoice, then the invoice status becomes `FULLY_ALLOCATED` and the payment remains in the list with an `available_balance` of R200.

**AC-3: Manual Reason Enforcement**
Given a system recommendation with a 95% score, when the user attempts to allocate a different credit note instead, then the system must prompt for a "Reason for Override" before persisting the allocation.

**AC-4: Integrity Guard**
Given a document with a VAT calculation error (flagged during ERP ingestion), when viewed in the workspace, then a "VAT Consistency Warning" badge must be visible on the card.

**AC-5: CSV Export**
Given a session in `DRAFT` or `FINALIZED` state, when the Manager selects "Export Unmatched Report", then a CSV file containing all unallocated documents and their remaining balances is generated.

---

### Error Conditions

| Error | Cause | Actor sees | System state | Recovery |
|---|---|---|---|---|
| `INSUFFICIENT_FUNDS` | Allocation > Available Credit | "Amount exceeds available credit balance." | Unchanged | Reduce allocation amount |
| `SESSION_LOCKED` | Another user has the session open | "This account is currently being reconciled by [User]." | Read-only | Wait for session release |
| `STALE_DATA` | Balance changed in background | "Document balance has changed. Refreshing queue..." | Auto-refresh | Re-attempt allocation |
| `INVALID_CLASSIFICATION` | SKU not found in mapping table | "Warning: Unknown SKU [Code] found. Recommendation may be inaccurate." | Data persists | Manual classification |

---

### PRD Completeness Check
- [x] All actors defined with explicit permissions
- [x] All business rules are testable and unambiguous
- [x] All workflows include unhappy paths and offline states
- [x] All state transitions defined and checked against state-machines.md
- [x] All acceptance criteria are binary and traceable
- [x] All error conditions have recovery paths
- [x] Vocabulary consistent with recon-engine-spec.md
- [x] Hybrid Quantity/Financial model documented
- [ ] Awaiting PM approval
