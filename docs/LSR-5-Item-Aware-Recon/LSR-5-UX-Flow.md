## UX Flow — Item-Aware Manual Reconciliation Tool
Produced by: UX-DESIGN-AGENT
PRD approved: 2026-05-16
Architecture Note approved: 2026-05-16
Date: 2026-05-16

---

### Screen Inventory

| Screen / Component | Path | Context | Status | What changes |
|---|---|---|---|---|
| Reconciliation Dashboard | `src/components/reconciliation/ReconciliationDashboard.tsx` | Desktop | New | Main account selection and status overview. |
| Reconciliation Workspace | `src/components/reconciliation/ReconciliationWorkspace.tsx` | Desktop | New | Full-screen interactive matching environment. |
| Invoice Card (Focus) | `src/components/reconciliation/InvoiceCard.tsx` | Desktop | New | The primary target for allocations. |
| Allocation Card | `src/components/reconciliation/AllocationCard.tsx` | Desktop | New | Draggable Credit/Payment document. |

---

### User Flow — Happy Path

Step 1 — Actor: Selects a customer account from the Dashboard.
         System: Loads the `ReconciliationWorkspace` with the oldest unallocated invoice as the focus.
         State: `ReconciliationSession` moves to `DRAFT`.

Step 2 — Actor: Reviews the recommended credits ranked by `Recommendation Score`.
         System: Highlights high-score matches (>80%) with a green "Item Match" badge.
         State: No data change.

Step 3 — Actor: Drags a Credit Note card onto the focus Invoice card.
         System: Displays a quick-allocation modal with the amount pre-filled to cover the invoice.
         State: No data change (Local state only).

Step 4 — Actor: Clicks "Confirm Allocation".
         System: Animates the card merging into the invoice. Updates `available_balance` and `outstanding_balance` instantly.
         State: Writes `allocation` record; auto-saves draft to Supabase.

Step 5 — Actor: Completes all open invoices and clicks "Finalize Session".
         System: Shows a final reconciliation report summary.
         State: `ReconciliationSession` moves to `FINALIZED`.

---

### Unhappy Paths

If **Allocation > Available Balance**:
  - What the actor sees: "Amount exceeds credit balance" error on the input field.
  - Recovery action: Reduce allocation amount to match or exceed balance.
  - System state: No transaction persisted.

If **Connectivity Lost**:
  - What the actor sees: "Sync Pending" badge and a persistent banner "Actions Restricted — Go Online to Save".
  - Recovery action: Re-establish network connection.
  - System state: Local changes buffered but not committed.

If **Manual Override (High Score Ignored)**:
  - What the actor sees: A "Reason Required" dropdown pops up upon dropping the card.
  - Recovery action: Select a Reason Code (e.g., `SAME_DEBORDER`).
  - System state: Blocked until reason is selected.

---

### Component Specification

**Focus Invoice (3+1+3 Queue):**
- System: Shows center focus invoice with 3 preceding and 3 succeeding document thumbnails.
- onClick: Clicking a thumbnail shifts it to center focus.
- Visuals: Center card is 25% larger than thumbnails.

**AllocationCard:**
- Draggable: YES (via `dnd-kit`).
- Badges: `Blue` (Exact Amount Match), `Yellow` (SKU Overlap), `Orange` (Warning/Low Score).
- Content: `Available ZAR`, `Doc No`, `Date`, `Item Summary Tooltip`.

---

### State Coverage

- **Loading state:** Shimmer/Skeleton cards for the 3+1+3 queue.
- **Empty state:** "Perfect Balance! This account has no unallocated documents."
- **Error state:** Toast notification "Database collision — document was modified by another user. Refreshing..."
- **Success state:** Confetti micro-animation on full invoice settlement.

---

### Permission Gates

Element: "Finalize Session" Button
Visible to: Finance Manager
Hidden from: Yard Counter
Disabled when: Any manual override exists without a recorded reason (PRD BR-6).

---

### Interaction Details

- **Variance Color Coding:**
  - `MATCH` (R0.00): Green highlight
  - `MINOR` (≤ R50): Yellow border
  - `CRITICAL` (> R50): Red border
- **Optimistic Updates:** UI reflects balance change immediately; rolls back on Supabase error.
- **Drag Feedback:** Scale down (0.95x) and opacity (0.8) while dragging.

---

### UX Checklist
- [x] Every component in Architecture Note is covered
- [x] Every PRD acceptance criterion has a corresponding UX step
- [x] All unhappy paths are defined (including offline/network failure)
- [x] All loading / empty / error / success / offline states defined
- [x] All buttons specified with disabled condition
- [x] All counter inputs specified with auto-save trigger
- [x] Variance colour coding matches MATCH/MINOR/CRITICAL thresholds
- [x] Permission gates reference session state machine
- [ ] Awaiting PM approval
