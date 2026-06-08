# Lane 4: Presentation & Exports Memory Document

This document defines the layouts, exports, and React state integration logic used in the **Presentation & Exports** lane.

---

## 1. Dual-View Stripping Convention
Reconciliation details, internal audits, and variances are hidden from customer views to prevent invoice disputes. We enforce this boundary using explicit comments in the markdown source files:

```markdown
<!-- INTERNAL_ONLY_START -->
## ⚠️ Audit Disclosure & Executive Summary
...
<!-- INTERNAL_ONLY_END -->
```

*   **Internal View:** Preserves all sections (both comments are removed during parsing, but contents remain).
*   **Customer View:** The parser removes the comments and everything written between them before rendering.

---

## 2. Workspace Card Parsing
The 3-section Debtor Position Workspace at the bottom of the statement is enclosed in structural tags:

```markdown
<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->
## Debtor Position Summary
### 1. Financial Position
...
### 2. Custody Position
...
### 3. Reconciliation Position
...
<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
```

*   **HTML Converter Logic:** The shared [export_to_html.py](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/shared/scripts/export_to_html.py) converter script parses the block, identifies the H3 headers, and wraps each sub-section in nested `<div class="position-card">` components inside a main `<div class="workspace-card">` layout.

---

## 3. React State Integration (Frontend Slice)
When implementing the frontend client, the UI should represent the workspace metrics using the following TypeScript interfaces (defined in [DEBTOR_POSITION_WORKSPACE.md](file:///Users/admin/Documents/LPG%20Stock%20Recon%20App/analysis/debtors/shared/docs/DEBTOR_POSITION_WORKSPACE.md)):

```typescript
export interface SKUPosition {
  sku: string;
  netQty: number;
  rate: number;
  exposure: number;
}

export interface DebtorPosition {
  // Section 1 - Financial Position
  gasDebt: number;
  cylinderFinancialBalance: number;
  totalDebtorBalance: number;

  // Section 2 - Custody Position
  outstandingCylinders: SKUPosition[];
  cylinderCustodyExposure: number;

  // Section 3 - Reconciliation Position
  cylinderVariance: number; // cylinderFinancialBalance - cylinderCustodyExposure
  erpBalance: number;
  reconstructedBalance: number;
  erpVariance: number; // erpBalance - reconstructedBalance
}
```

*   **Toggle State:** The UI should support a state toggle (`viewMode = 'internal' | 'customer'`). When `customer` mode is active, the DOM should omit the Reconciliation Position card, the Cylinder Financial Balance column, and all variance metrics.
