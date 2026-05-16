## Slice Brief — Item-Aware Manual Reconciliation Tool
Produced by: EXPLORATION-ARCHITECT (LSR-Agent)
Date: 2026-05-16

---

### A. Slice Frame

**Feature name:** Item-Aware Manual Reconciliation Tool
**Actor:** Debtors Clerk / Finance Manager
**User outcome:** After using this feature, the Clerk can now manually allocate payments and credit notes to invoices with high confidence, guided by archival item-level lookups and recommendation scores.
**Type:** Workflow + Reporting Surface
**Priority tier:** MVP-critical (for Debtors Recon module)

---

### B. Slice Boundary

- **Contextual Queue:** Dashboard showing the current invoice with a preview of 3 prior and 3 after invoices (sorted by DOCNO). Users can navigate the queue by clicking any thumbnail.
- **Item-Aware Scoring:** Recommendation engine that ranks Credits/Payments based on SKU-overlap with the current Invoice.
- **Item Signature Display:** Cards show a compact item summary (e.g., `9KG CYLINDER DEPOSIT x 5`) with an expandable detail view.
- **Warning Badges:** Cards display color-coded warnings (Info, Suggestion, Warning) for weak item matches, amount-only payments, or spillover conditions.
- **Manual Allocation Flow:** User can "Accept Recommendation", "Remove Card", or "Manually Allocate" specific amounts.
- **Drag-and-Drop Allocation:** User can drag a credit note/payment card and drop it onto any invoice thumbnail (prior, current, or next) to initiate an allocation event.
- **Feedback Collection:** When a user manually allocates a card the system did not suggest, a dropdown captures the reason (e.g., "Same DEBORDER", "Amount matches exactly") to train the recommendation engine.
- **Real-Time Balance Tracking:** Cards reflect the remaining `available_balance` instantly.
- **Integrity Validation:** Prevents over-allocation of invoices or over-spending of credits.
- **Draft Session Persistence:** Auto-save draft state to Supabase.
- **Unmatched Report:** On-screen and CSV export of remaining exceptions.

**Out of scope:**
- **Automated "One-Click" Reconciliation:** (Deferred to V2 - Human must confirm).
- **Physical Inventory Impact:** (Stock Recon is a separate module).
- **External Bank Feeds:** (Ingestion is via ERP file import only).

**Events that enter this slice:**
- Manager selects "Start Reconciliation" for a specific account.
- New ERP DRTXS/STDatabase files are uploaded to the DataHub.

**Outputs that leave this slice:**
- `allocation` records written to Supabase.
- `unmatched_credit` pool entries for spillover.
- `ReconciliationSession` state updates.

**Reads from:**
- `transaction_headers` (ERP data)
- `transaction_items` (ERP line items)
- `item_classification` (New - mapping raw SKUs to business buckets)
- `normalized_document` (New - derived snapshot)

**Writes to:**
- `allocation`
- `allocation_item_impact`
- `unmatched_credit`
- `reconciliation_session`
- `training_record` (New - for "Why" feedback storage)

**Owns state:** YES
**Transactional:** YES (DB Transactions required for balance updates)
**New session state:** YES (Extends `reconciliation_session`)
**Offline-capable:** NOT REQUIRED (Requires real-time balance checks)
**Position in flow:** DOWNSTREAM of ERP Ingestion; UPSTREAM of Financial Reporting.

---

### C. Dependency Map

**Domain entities:** `Invoice`, `CreditNote`, `Payment`, `Allocation`, `SpilloverCredit`, `ItemClassification`, `TrainingFeedback`.
**Session states touched:** `OPEN`, `DRAFT`, `FINALIZED`.
**Invariants touched:** INV-3 (Immutability), INV-7 (Audit Trail), INV-8 (Idempotency), INV-9 (Learning Feedback).
**Existing Supabase views/queries:** `reconciliation_summary`, `dispatch_eligible_invoices`.
**New Supabase views/queries needed:** `unallocated_documents`, `allocation_history`, `document_item_signature`.
**Dexie stores touched:** None (Session-based, not offline-first for this slice).
**External libraries:** TanStack Table, Lucide React (Icons).
**UI surfaces:** `ReconciliationWorkspace`, `AccountSelector`, `ExceptionReportView`.
**Offline implications:** None. This module requires an active connection to ensure ledger integrity.
**Audit/sync implications:** Every allocation event MUST be logged with actor ID and timestamp.

---

### D. Non-Negotiable Constraints

| Constraint | Source | What it means for this slice |
|---|---|---|
| Monetary Truth | Classification Lock | Line amount MUST be calculated as `QTY × RETAIL` (tax inclusive). |
| Financial Primacy | Classification Lock | Item data is RECOMMENDATION ONLY. It never blocks a manual financial allocation. |
| Transactional Integrity | Schema Proposal | Balance updates MUST use row-level locks and transactional `WHERE` clauses. |
| Spillover Logic | Schema Proposal | Excess credit MUST flow to an explicit `unmatched_credit` pool, not vanish. |
| VAT Consistency | ERP Import Engine | Documents with invalid VAT calculations (per LSR-4 fix) must be flagged in the workspace. |

---

### E. Open Questions Register (RESOLVED)

| # | Question | Resolution | Source |
|---|---|---|---|
| 1 | Is the unmatched report stored permanently, or recomputed on-the-fly? | **Stored to the database.** | Session_A1.md:762 |
| 2 | Do we support cross-account credit allocation in MVP? | **No.** Internal tool assumption. | Session_A1.md:754 |
| 3 | How do we handle "Partial" item matching? | **User specifies both LPG/CYL amounts manually.** | Session_A1.md:760 |
| 4 | Concurrent users? | **No.** Single user per account. | Session_A1.md:756 |
| 5 | What is the retraining frequency for global weights? | **Weekly (Automated) or On-Demand.** | Auditor Feedback 2026-05-16 |
| 6 | Should `PAID = "Y"` invoices be excluded from queue? | **Yes.** Exclude fully paid invoices to focus on open items. | Auditor Feedback 2026-05-16 |

---

### Recommended Vertical Slice

**The "Oldest-First" Matching Path:**
Build the end-to-end flow for a single account where the system identifies the oldest Invoice and recommends the oldest eligible Credit Note/Payment. The user accepts the recommendation, and the system performs the allocation, updates the `available_balance`, and writes the `allocation` record. This validates the entire data-to-allocation pipeline before adding complex scoring.

---

### Ready for Stage 2?
- [x] All five sections complete
- [x] Scope boundary is explicit (in AND out)
- [x] All dependencies named
- [x] All constraints extracted from governance docs
- [x] Open Questions Register complete
- [x] Offline implications stated
- Awaiting PM approval and resolution of open questions
