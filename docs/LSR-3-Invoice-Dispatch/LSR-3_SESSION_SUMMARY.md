# Session Summary: Invoice Dispatch Module (LSR-3)

## Project Context
The **Invoice Dispatch Module** (LSR-3) was developed to automate the delivery of LPG invoices and signed Proof of Delivery (POD) documents to customers via WhatsApp. This feature bridges the gap between physical stock reconciliation and customer billing.

## Core Feature: Automated Dispatch
- **Workflow**: Clerks upload a photo/PDF of a signed delivery note; the app generates a professional invoice PDF, merges it with the POD, and sends it via WhatsApp.
- **Technology**:
    - **PDF Generation**: Browser-side `jsPDF` for speed and offline-ready layout.
    - **PDF Merging**: Browser-side `pdf-lib` for combining the invoice and POD image.
    - **WhatsApp Dispatch**: Triggered via a Supabase Edge Function (`whatsapp-dispatch`) calling the **Whapi.Cloud** API.
    - **Storage**: Signed notes and merged documents are stored in the `invoice-documents` Supabase bucket.

## Data Layer Extensions
- **`customers` table**: Maps ERP account codes to WhatsApp numbers.
- **`invoice_dispatch_logs` table**: Provides a full audit trail (Append-only) of every dispatch attempt, including status (`SENT`, `FAILED`, `PENDING`) and document links.
- **`dispatch_eligible_invoices` view**: An optimized view using `DISTINCT ON (doc_no)` to show only the most recent status for each document on the dashboard.

## Security & Role Model
- **New Role**: `Invoice Clerk` — specifically permitted to manage dispatch but restricted from seeing yard counts, costs, or reconciliation logic.
- **Protected Routes**: Implemented `ProtectedRoute` in `App.tsx` to enforce role-based access at the routing level.
- **Credential Safety**: Whapi API keys are stored securely in Supabase Secrets, never exposed to the client.

## Pipeline Progress
- **Status**: **Feature Complete** ✅
- **Stages Run**: All 10 stages (Exploration Architect -> Domain PRD -> Architect -> Schema -> UX -> Coding Backend -> Coding Frontend -> Code Review -> QA Auditor -> PM Sign-off).
- **Branch**: `fix/LSR-3` (Built, audited, and ready for merge).

## Key Decisions
1. **Online-Only**: Unlike the "Count" module, Dispatch is online-only due to its dependency on external APIs and Cloud Storage.
2. **Authoritative Financials**: The system uses ERP-ingested totals (`amount_excl + tax_amount`) as the financial source of truth for the PDF.
3. **Public Storage**: The `invoice-documents` bucket must be set to Public to allow WhatsApp message recipients to view the document link without authentication.

## Next Steps
1. **Merge**: `git checkout main && git merge fix/LSR-3`.
2. **Deploy**: Push to production and deploy the Supabase Edge Function.
3. **Seed**: Import the initial customer contact list via the new "Data Hub > Customer Import" utility.
