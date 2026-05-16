# Supabase Schema Context for LSR-3 (Invoice Dispatch Module)

This document provides a technical overview of the current Supabase schema and how the **Invoice Dispatch Module** (LSR-3) will interact with it.

## 1. Core Data Source: Transaction Tables
The "dtrx archival data" mentioned in the ticket resides in two main tables:

### `transaction_headers`
This table represents the "Header" of each ERP document (Invoice, Credit Note, etc.).
- `doc_no`: The unique document number (e.g., `INV001`).
- `account_no`: The customer account code (e.g., `BU0002`).
- `tx_date`: The date of the transaction.
- `amount_excl` & `tax_amount`: Used for calculating the "Amount Incl" for the invoice PDF.
- `fingerprint`: A unique hash used to prevent duplicate ingestion.

### `transaction_items`
This table contains the line items for each document.
- `stock_no`: The SKU (e.g., `9.4` for 9KG Oryx LPG).
- `qty`: Quantity sold or returned.
- `retail_price`: The price per unit.
- `category`: Categorized as `LPG` or `CYL`.

## 2. Required Schema Extensions (Stage 4)
The following extensions are anticipated for LSR-3. The **EXPLORATION-ARCHITECT** should consider these during framing:

### `customers` (New Table)
Used to store the mapping between ERP account codes and dispatch contact info.
- `account_code` (TEXT, PK): Links to `transaction_headers.account_no`.
- `whatsapp_number` (TEXT): The destination for Whapi.Cloud dispatch.
- `name` (TEXT): Customer display name.

### `invoice_dispatch_logs` (New Table)
Used to track the status of WhatsApp deliveries and store metadata.
- `doc_no` (TEXT): Foreign key to `transaction_headers.doc_no`.
- `sent_at` (TIMESTAMPTZ): When the message was triggered.
- `status` (TEXT): `PENDING`, `SENT`, `FAILED`, `DELIVERED`.
- `signed_doc_url` (TEXT): Storage link to the hand-signed delivery note uploaded by the clerk.
- `merged_doc_url` (TEXT): Storage link to the final merged PDF (Invoice + Delivery Note).

## 3. Storage Buckets
The system will need a Supabase Storage bucket (e.g., `invoice-documents`) to store the raw uploads and the final merged PDFs.

## 4. Operational Flow for LSR-3
1. **Query**: Fetch headers from `transaction_headers` where `tx_date = CURRENT_DATE` and `entry_type = 'Invoice'`.
2. **Contact Lookup**: Join with the new `customers` table to get the `whatsapp_number`.
3. **Dispatch**: Upon clerk action, generate PDF, upload to Storage, call Whapi.Cloud, and log to `invoice_dispatch_logs`.
