## Architecture Note — Invoice Dispatch Module (LSR-3)
Produced by: ARCHITECT-AGENT
PRD approved: 2026-05-11
Date: 2026-05-11

---

### Frontend Surfaces

**1. Dispatch Dashboard (`src/components/dispatch/DispatchDashboard.tsx`)**
- **Purpose**: Main entry point for Invoice Clerks. Lists invoices for a selected date.
- **Data Fetching**: 
    - Queries a new Supabase view `dispatch_eligible_invoices`.
    - Uses a `tx_date` filter provided by a standard HTML5 date picker.
- **State**: `selectedDate` (defaults to `MAX(tx_date)`).
- **Offline Behaviour**: Displays "Connection Required" overlay if `navigator.onLine` is false.

**2. Dispatch Detail View (`src/components/dispatch/DispatchDetailView.tsx`)**
- **Purpose**: Drill-down view for a single invoice. Handles POD upload and dispatch trigger.
- **Data Fetching**: Queries `transaction_items` for the specific `doc_no`.
- **State**: `podFile` (File object), `uploading` (boolean), `logs` (array of previous attempts).
- **Behaviour**: Validates file type (JPG, PNG, PDF) and file size (<5MB).

**3. Customer Import Utility (`src/components/dashboard/CustomerImport.tsx`)**
- **Purpose**: Allow clerks/managers to update the contact list via CSV.
- **Location**: Added as a tab or button in the existing `DataHub`.
- **Logic**: Upsert into the `customers` table based on `account_code`.

---

### Supabase Changes

**1. New Tables & Indexes (Flagged for SCHEMA-AGENT)**
- **Table**: `customers` (`account_code` PK, `name`, `whatsapp_number`).
- **Table**: `invoice_dispatch_logs` (`id` PK, `doc_no`, `sent_at`, `status`, `error_details`, `signed_doc_url`, `merged_doc_url`, `actor_id`).
- **Indexes**: 
    - `idx_dispatch_logs_doc_no` on `invoice_dispatch_logs(doc_no)`.
    - Confirm `idx_headers_tx_date` on `transaction_headers(tx_date)`.

**2. Optimized View: `dispatch_eligible_invoices`**
- **Purpose**: Returns latest dispatch status per invoice.
- **Logic**: 
    ```sql
    SELECT DISTINCT ON (h.doc_no)
      h.doc_no, h.tx_date, h.account_no, h.account_name, 
      (h.amount_excl + h.tax_amount) as amount_inc,
      c.whatsapp_number,
      l.status as last_status,
      l.sent_at as last_sent_at
    FROM transaction_headers h
    LEFT JOIN customers c ON h.account_no = c.account_code
    LEFT JOIN invoice_dispatch_logs l ON h.doc_no = l.doc_no
    WHERE h.entry_type = 'Invoice'
    ORDER BY h.doc_no, l.sent_at DESC;
    ```

**3. Storage Security (RLS)**
- **Bucket**: `invoice-documents`.
- **Policies**: 
    - `Invoice Clerk`: `SELECT`, `INSERT`. (Explicitly NO `DELETE`).
    - `Depot Manager`: `SELECT`.

**4. Edge Function: `whatsapp-dispatch`**
- **Purpose**: Securely handle Whapi.Cloud API calls.
- **Auth**: Service Role key access to environment variables (`WHAPI_API_KEY`).
- **Trigger**: Called by the frontend service layer after PDF generation and storage upload.

---

### Schema Impact
**CHANGES REQUIRED** — Flag for SCHEMA-AGENT (Stage 4).
- Create `customers` table + indexes.
- Create `invoice_dispatch_logs` table + index.
- Create `invoice-documents` Storage bucket + RLS.

---

### State Machine Impact
**NONE** — This module does not interact with the Physical Count session lifecycle.

---

### Offline / Sync Impact
- **Online-Only**: Explicitly online-only.
- **Sync Trigger**: Direct Supabase writes; no Dexie local storage for this module.

---

### SKU Mapping Impact
**NONE** — Uses raw `description` and `stock_no` from `transaction_items`.

---

### Ownership Split

**Frontend Agent owns:**
- `src/components/dispatch/*` and `src/components/dashboard/CustomerImport.tsx`.
- `src/hooks/useDispatchInvoices.ts`.

**Backend / Supabase Agent owns:**
- `supabase/deploy_all.sql` — View definitions and RLS.
- `supabase/functions/whatsapp-dispatch/index.ts` — Whapi integration.
- `src/lib/dispatchService.ts` — Client-side PDF generation and merge logic.

---

### Sequencing

1. **Schema (Stage 4)**: Tables, Indexes, and Storage Bucket.
2. **Supabase Layer (Backend)**: Optimized View, RLS Policies.
3. **Edge Function (Backend)**: `whatsapp-dispatch` logic.
4. **Service Layer (Backend)**: Browser-side PDF generation/merge + Edge Function caller.
5. **UI Implementation (Frontend)**: Dispatch Dashboard, Detail View, and Customer Import utility.

---

### Architecture Checklist
- [x] All new Supabase views follow deploy_all.sql pattern
- [x] View optimized via `DISTINCT ON` to show latest status only
- [x] Indexing strategy defined for performance
- [x] Storage RLS excludes DELETE permission for clerks
- [x] Sensitive API keys moved to Supabase Edge Function
- [x] CSV utility included for customer management
- [x] Ownership split is unambiguous
- [x] Sequencing accounts for all dependencies
- [ ] Awaiting PM approval

