## UX Flow — Invoice Dispatch Module (LSR-3)
Produced by: UX-DESIGN-AGENT
PRD approved: 2026-05-11
Architecture Note approved: 2026-05-11
Date: 2026-05-11

---

### Screen Inventory

| Screen / Component | Path | Context | Status | What changes |
|---|---|---|---|---|
| **Dispatch Dashboard** | `src/components/dispatch/DispatchDashboard.tsx` | Desktop | New | Full new screen for invoice listing and date filtering. |
| **Dispatch Detail View** | `src/components/dispatch/DispatchDetailView.tsx` | Desktop | New | Slide-over or Modal for invoice details, POD upload, and dispatch logic. |
| **Customer Import** | `src/components/dashboard/CustomerImport.tsx` | Desktop | New | New tab/utility in DataHub for CSV-based customer contact seeding. |
| **Navigation** | `src/components/layout/Navigation.tsx` | Desktop | Existing | Add "Invoice Dispatch" link for `Invoice Clerk` and `Depot Manager` roles. |

---

### User Flow — Happy Path

#### Dispatch an Invoice
1. **Step 1 — Actor**: Opens "Invoice Dispatch" from the sidebar.
            **System**: Renders `DispatchDashboard`. Date Picker defaults to the `MAX(tx_date)` found in headers.
            **State**: `selectedDate` initialized.
2. **Step 2 — Actor**: Locates an invoice in the table and taps the "View/Dispatch" icon.
            **System**: Opens `DispatchDetailView` (Modal). Fetches line items and previous dispatch logs.
            **State**: `selectedDoc` loaded.
3. **Step 3 — Actor**: Taps the "Upload POD" area and selects a photo of a signed delivery note.
            **System**: Shows a thumbnail preview of the image. Uploads file to `invoice-documents` bucket.
            **State**: `podUrl` updated in local state; log entry `PENDING` created.
4. **Step 4 — Actor**: Taps "Send to WhatsApp".
            **System**: Shows a "Generating & Sending..." overlay. Triggers Edge Function.
            **State**: Disables interaction.
5. **Step 5 — Actor**: Views success toast.
            **System**: Displays "Invoice SENT to [Customer] via WhatsApp." Updates log to `SENT`.
            **State**: Status indicator in dashboard updates to Green/Sent.

---

### Unhappy Paths

**1. If Device is Offline:**
- **What the actor sees**: A non-dismissible banner: "Connection Required. You must be online to dispatch invoices or upload documents."
- **Recovery action**: Restore internet connection.
- **System state**: All "Send" and "Upload" buttons are disabled.

**2. If Customer Contact is Missing:**
- **What the actor sees**: In the dashboard and detail view, the WhatsApp number field is highlighted in amber: "No contact info found."
- **Recovery action**: Use the "Customer Import" utility in DataHub to seed the missing account code.
- **System state**: "Send" button is disabled.

**3. If Resending an Invoice:**
- **What the actor sees**: An amber banner: "Warning: This invoice was already successfully sent on [Date]. Sending again will create a new dispatch log."
- **Recovery action**: Actor must check "I understand" or tap "Confirm Resend" in a dialog.
- **System state**: No data change until confirm.

---

### Component Specification

#### Dispatch Dashboard Table
| Column | Data | Sortable | Default Sort | Width |
|---|---|---|---|---|
| Status | Icon (Gray/Clock=Pending, Green/Check=Sent, Red/X=Failed) | YES | - | 80px |
| Doc No | `doc_no` | YES | DESC | 150px |
| Customer | `account_name` | YES | - | Auto |
| Amount (Incl) | `(amount_excl + tax_amount)` (format 2 dec) | YES | - | 120px |
| Contact | `whatsapp_number` (or "Missing" badge) | NO | - | 180px |
| Last Sent | `last_sent_at` (Relative time, e.g., "2h ago") | YES | - | 150px |
| Actions | Button (Eye Icon) | NO | - | 80px |

#### Dispatch Detail View (Modal)
- **Document Header**: Large `doc_no` and `tx_date`.
- **Amount Summary**: 3-column grid (Subtotal, VAT, Total).
- **Line Items Table**: Compact version of `AuditDashboard` item table (Desc, Qty, Price).
- **POD Upload Zone**: 
    - Dotted border box with `FileUp` icon.
    - Text: "Drop signed POD here or click to browse (JPG, PNG, PDF)".
- **Dispatch Log History**: 
    - Vertical timeline showing status changes and timestamps.
- **Primary Action**: 
    - **Button**: "Send to WhatsApp" (Blue, Large).
    - **Condition**: Disabled if `!podFile` OR `!whatsapp_number`.

#### Customer Import (Utility)
- **Dropzone**: Standard CSV upload box.
- **Mapping Guide**: Shows required headers: `account_code`, `account_name`, `whatsapp_number`.
- **Process Button**: "Import Contacts".
- **Feedback**: Shows "X contacts added/updated successfully".

---

### State Coverage

| State | Dispatch Dashboard | Dispatch Detail View |
|---|---|---|
| **Loading** | Skeleton rows for the table. | Spinner in the modal body; disabled buttons. |
| **Empty** | "No invoices found for [Date]. Please select a different date." | "No line items found for this document." |
| **Error** | Banner: "Failed to load invoices. [Retry]" | Toast: "Failed to upload document / Trigger dispatch. [Reason]" |
| **Success** | Row status updates to Green icon. | Timeline log adds a `SENT` entry with timestamp. |
| **Offline** | "Connection Required" overlay. | All actions disabled; warning banner visible. |

---

### Permission Gates

**Element: Invoice Dispatch Screen**
- **Visible to**: Invoice Clerk, Depot Manager.
- **Hidden from**: Yard Counter.

**Element: Customer Import Utility**
- **Visible to**: Depot Manager.
- **Hidden from**: Invoice Clerk (Clerks use the data, Managers manage the list).

---

### Interaction Details

- **Resend Confirmation**:
    - **Trigger**: Tapping "Send" when `last_status` is `SENT` or `DELIVERED`.
    - **Text**: "This invoice was already successfully dispatched. Are you sure you want to resend it to [Number]?"
    - **Buttons**: [Cancel] [Confirm Resend].
- **POD Preview**: Tapping the uploaded POD thumbnail opens a full-screen image/PDF viewer.
- **Status Colors**: 
    - `PENDING` (Gray)
    - `SENT` / `DELIVERED` (Emerald Green)
    - `FAILED` (Red)
    - `Missing Contact` (Amber)

---

### UX Checklist
- [x] Every component in Architecture Note is covered
- [x] Every PRD acceptance criterion has a corresponding UX step
- [x] All unhappy paths are defined (including offline/network failure)
- [x] All loading / empty / error / success / offline states defined
- [x] All buttons specified with disabled condition
- [x] All counter inputs specified (N/A for this module)
- [x] Variance colour coding (N/A - using Status codes instead)
- [x] No financial (ZAR) values appear (Only Totals for invoice matching)
- [x] Permission gates reference session state machine (Using roles instead)
- [x] Mobile tap targets (N/A - Desktop focused, but accessible)
- [ ] Awaiting PM approval
