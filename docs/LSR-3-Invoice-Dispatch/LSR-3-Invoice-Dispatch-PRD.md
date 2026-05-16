## Module PRD — Invoice Dispatch Module (LSR-3)
Produced by: DOMAIN-PRD-AGENT
Slice Brief: approved 2026-05-11
Date: 2026-05-11

---

### 1. Vocabulary

| Term | Definition | Status |
|---|---|---|
| **Invoice Clerk** | A new domain actor responsible for dispatching invoices and PODs to customers. | New |
| **POD (Proof of Delivery)** | A hand-signed delivery note, captured as an image or PDF, proving the customer received the goods. | New |
| **Dispatch Log** | A record in `invoice_dispatch_logs` tracking a specific attempt to send a document via WhatsApp. | New |
| **Merged Document** | A single PDF containing the system-generated Invoice followed by the uploaded POD. | New |
| **Whapi.Cloud** | The external gateway service used to send PDFs to WhatsApp numbers. | New |
| **Account Code** | The unique identifier for a customer (e.g., `BU0001`), linking ERP data to the `customers` table. | Existing |

---

### 2. Actors and Permissions

**Invoice Clerk**
- **CAN**: View transaction headers (Invoices) for any selected date.
- **CAN**: View line items (`transaction_items`) for a specific invoice.
- **CAN**: Upload images or PDFs as PODs.
- **CAN**: Trigger the dispatch of a Merged Document to a customer's WhatsApp.
- **CAN**: View the dispatch history (logs) for any invoice.
- **CANNOT**: Create, edit, or delete physical count sessions.
- **CANNOT**: Start or modify a reconciliation run.
- **CANNOT**: Edit customer account codes or names (read-only from seeded table).
- **SEES**: The "Invoice Dispatch" dashboard and individual document details. Does not see the "Yard Count" or "Reconciliation" modules.

**Depot Manager**
- **CAN**: All permissions of the Invoice Clerk (inherited for oversight).
- **CAN**: View dispatch logs to verify clerk activity.

---

### 3. Business Rules

**Data & Privacy**
- **BR-1**: **Quantity & Total Only.** The system displays `amount_excl`, `tax_amount`, and `total_amount` (calculated) for invoices. It must NOT display unit costs or margins.
- **BR-2**: **Seeded Customers.** Dispatch is only permitted for invoices where the `account_no` exists in the `customers` table with a valid `whatsapp_number`.

**Invoice Generation**
- **BR-3**: **Authoritative Totals.** The Invoice PDF must use the totals from `transaction_headers` (`amount_excl` + `tax_amount`).
- **BR-4**: **Line Item Detail.** The Invoice PDF must list all items from `transaction_items` using the `description`, `qty`, and `retail_price` fields.

**Dispatch Logic**
- **BR-5**: **POD Requirement.** A dispatch attempt cannot be triggered unless a POD (image or PDF) has been uploaded for the document.
- **BR-6**: **Image Normalization.** If the uploaded POD is an image (JPG/PNG), the system must wrap it into a standard A4 PDF page before merging.
- **BR-7**: **Immutable Logic.** Once a Merged Document is generated and sent, that specific PDF file is immutable. A "Resend" generates a new Merged Document (to account for potential POD corrections).
- **BR-8**: **Resend Warning.** If an invoice has already been successfully dispatched (status `SENT` or `DELIVERED` in logs), the system must require explicit confirmation from the clerk before resending.

**Audit & Logging**
- **BR-9**: **Append-Only Logs.** Every dispatch attempt must create a *new* entry in `invoice_dispatch_logs` with a unique ID, timestamp, and actor ID. Existing logs must never be overwritten.
- **BR-10**: **Status Mapping.** The dispatch status must reflect the response from Whapi.Cloud (`PENDING`, `SENT`, `FAILED`).

---

### 4. Workflows

#### Dispatch Invoice with POD

**Happy path:**
1. **Trigger**: Invoice Clerk opens the "Invoice Dispatch" screen.
2. **Filter**: Clerk selects a date using the Date Picker (defaults to the date of the latest ERP upload).
3. **Selection**: Clerk identifies an invoice from the list (showing `doc_no`, `account_name`, `amount`).
4. **Detail**: Clerk taps the invoice to open the Dispatch View.
5. **Upload**: Clerk uploads a photo or PDF of the hand-signed delivery note.
6. **Preview**: System shows a preview of the POD and a summary of the WhatsApp destination.
7. **Dispatch**: Clerk taps "Send to WhatsApp".
8. **Process**:
    - System generates the Invoice PDF.
    - System merges/wraps the POD.
    - System uploads the final PDF to Supabase Storage.
    - System calls Whapi.Cloud API.
    - System creates a `SENT` log entry.
9. **Outcome**: Clerk sees a "Success" message and the invoice status updates to "Sent" in the list.

**Unhappy paths:**
- **Missing Customer**: If the invoice account has no WhatsApp number in the `customers` table, the "Send" button is disabled and a "Missing Contact" warning is shown.
- **Upload Failure**: If the POD fails to upload (e.g., network error), the dispatch is aborted and the clerk is prompted to retry the upload.
- **API Error**: If Whapi.Cloud returns an error, the system creates a `FAILED` log entry and displays the error message (e.g., "Invalid WhatsApp number format").

**Empty state:**
- If no invoices exist for the selected date, the screen displays "No invoices found for [Date]. Try selecting a different date."

**Loading state:**
- While generating/merging the PDF and calling the API, a blocking overlay says "Generating & Sending Document...".

**Offline state:**
- **Online-Only**: This module requires an active connection to Supabase and Whapi. If the device is offline, the "Invoice Dispatch" screen displays a "Connection Required" message and prevents uploads or dispatch actions.

---

### 5. State Transitions

**Dispatch Status (`invoice_dispatch_logs.status`)**

| FROM | TO | TRIGGER | GUARD | SIDE EFFECTS |
|---|---|---|---|---|
| (None) | `PENDING` | Clerk taps "Send" | POD uploaded & Customer has WhatsApp | Log created; PDF merge started |
| `PENDING` | `SENT` | Whapi returns 200 OK | - | Update log with `sent_at` |
| `PENDING` | `FAILED` | Whapi returns error | - | Update log with error details |

---

### 6. Acceptance Criteria

| ID | Given | When | Then |
|---|---|---|---|
| **AC-1** | A clerk is on the Dispatch screen | They select a date with 10 invoices | A list shows 10 rows with Doc No, Customer Name, and Amount. |
| **AC-2** | An invoice is selected | The customer has no WhatsApp number in the system | The "Send" button is disabled and a warning "Account [Code] has no WhatsApp number" is visible. |
| **AC-3** | A clerk uploads a JPG image of a POD | They tap "Send" | The recipient receives a single PDF where Page 1 is the Invoice and Page 2 is the POD image. |
| **AC-4** | A clerk sends an invoice that was already sent | They tap "Send" | A warning popup appears: "This invoice was already sent at [Time]. Do you want to send it again?" |
| **AC-5** | A dispatch attempt fails | Whapi return an error | A new log entry is created with status `FAILED` and the error message is visible in the invoice history. |
| **AC-6** | An Invoice Clerk is logged in | They try to access the "Reconciliation" screen | They are redirected or shown an "Access Denied" message (Role Gate). |

---

### 7. Error Conditions

| Error | Cause | Actor sees | System state | Recovery |
|---|---|---|---|---|
| `UNSUPPORTED_POD_FORMAT` | File is not JPG, PNG, or PDF | "Invalid file format. Please upload an image or PDF." | No change | Clerk selects valid file |
| `WHAPI_API_DOWN` | External service unreachable | "Service temporarily unavailable. Please try again in a few minutes." | Logged as `FAILED` | Clerk retries later |
| `MISSING_CUSTOMER_DATA` | Account code not in `customers` table | "Customer contact info not found. Please notify the administrator." | Send disabled | Admin must seed the customer |

---

### 8. PRD Completeness Check
- [x] All actors defined with explicit permissions (Invoice Clerk introduced)
- [x] All business rules are testable and unambiguous
- [x] All workflows include unhappy paths and offline states (Online-only confirmed)
- [x] All state transitions defined
- [x] All acceptance criteria are binary and traceable
- [x] All error conditions have recovery paths
- [x] Vocabulary consistent with recon-engine-spec.md
- [x] No ZAR financial values introduced (only totals for invoice purposes)
- [ ] Awaiting PM approval
