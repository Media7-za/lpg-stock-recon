# LPG Stock Recon App: Current Architecture & Context

This document is designed to serve as the context prompt for your next AI session. Simply copy-paste this file into the new chat to instantly onboard the agent to the current state of the architecture.

---

## 1. Project Overview & Milestone Completed
The **LPG Stock Recon App** has successfully deprecated its legacy Python-based prototype pipeline (`STTRANS`). The app is now a fully functional, cloud-native Next.js/Vite application backed by Supabase.

The system is responsible for ingesting extremely raw, heavily obfuscated `.TXT` logs from the `FINCON` ERP system, parsing them locally in the browser, and syncing them efficiently to a cloud PostgreSQL database. It then automatically crunches complex, item-aware mathematical reconciliations between `LPG` and `CYL` stock codes and generates downstream Excel-ready CSV reports.

## 2. Current Core Architecture

### **A. Data Ingestion (The `DataHub` Component)**
*   **Location:** `src/components/dashboard/DataHub.tsx`
*   **Logic:** `src/lib/erpImportEngine.ts`
*   **State:** Users drag and drop raw ERP `.TXT` log files into exactly three distinct drop zones: `Transaction Headers`, `Transaction Items`, or `Account Balances`.
*   **Validation:** The `erpImportEngine` reads the headers using `PapaParse`, cleans the strings, and validates the file schema (e.g., rejecting an Items file dropped in a Headers zone).
*   **Logging:** Successfully ingested files trigger a permanent database record in the `sync_logs` Supabase table. The `DataHub` surfaces these recent logs dynamically to visually confirm ingestion integrity across the team.

### **B. Data Storage (Supabase)**
*   **Primary Tables:** `transaction_headers` and `transaction_items`.
*   **Indexing:** Indexed strictly on `account_no` and `doc_no`.
*   **Relational Model:** Items are bound to Headers via a composite key of `(doc_no, account_no)`.

### **C. The Reconciliation Engine (Supabase Views)**
*   **Location:** `supabase/deploy_all.sql`
*   **`unique_accounts` View:** Extracts perfectly ordered, distinct account names by aggressively forcing a `GROUP BY account_no` clause to eliminate thousands of duplicate or dirty "Reference" names generated organically by the ERP.
*   **`reconciliation_summary` View:** The mathematical beating heart of the app. It performs a massive `LEFT JOIN` between headers and items, dynamically splitting out `LPG` vs `CYL` gross totals using complex wildcard matches on stock codes (e.g., `9.1`, `14.1`, `1901`).
*   **Payment Grouping:** Custom SQL safely aggregates "allocation splits" on single payments (which the ERP splits by default) into single parent sums, identically matching the legacy expectation.

### **D. Reporting (The `AuditDashboard` Component)**
*   **Location:** `src/components/dashboard/AuditDashboard.tsx`
*   **State:** The dashboard queries `unique_accounts` for a clean alphabetical dropdown. When an account is selected, it queries the `reconciliation_summary` for high-level numbers, matching them against legacy variances.
*   **Export:** Fully handles generating and automatically downloading mathematically perfect, item-aware `CSV` exports matching the downstream strict format.

## 3. Next Slice / Goal Path
*(Specify your next feature or requirement below when starting the next session!)*

*   **Potential Goal A:** Implement the next major feature (e.g., visual discrepancy highlighting, PDF report generation).
*   **Potential Goal B:** Transition completely to another application slice (e.g., The Driver PWA).
*   **Potential Goal C:** Implement Row-Level Security (RLS) policies on Supabase for enterprise deployment.
