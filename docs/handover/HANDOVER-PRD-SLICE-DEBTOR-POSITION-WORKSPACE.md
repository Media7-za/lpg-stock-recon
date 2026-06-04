# Handover Documentation: LPG Stock Recon PRD Slice

This document serves as a detailed handover for the incoming agent working on the **PRD Slice** phase of the LPG Stock Reconciliation application.

---

## 1. Project Quick Reference

| Detail | Value |
| :--- | :--- |
| **Live App** | https://lpg-stock-recon.vercel.app |
| **Jira Project Key** | `LSR` |
| **Supabase Project Ref** | `movixifclapeprdemgwk` (Region: `eu-west-2`) |
| **Git Config Email** | `56847p@gmail.com` |
| **Git Config Name** | `Media7-za` |
| **Branch Convention** | `fix/LSR-{TICKET-NUMBER}` or `feature/LSR-{TICKET-NUMBER}-{slug}` |
| **Deploy Trigger** | Merge/push to `main` (automatic Vercel production build) |
| **Stack** | React 18 + Vite, Tailwind CSS v3, Prisma v6, Supabase PostgreSQL |

---

## 2. Core Operational Doctrines

### 2.1 The SKU Dual-Line Pattern

Every physical cylinder delivery generates **two independent lines** on a single invoice:

- **LPG Content (Suffix `01`)**: Represents the consumable gas product, for example `1901` for 19kg gas fill or `901` for 9kg gas fill. Categorized as `debt_group = 'LPG'`. Billed as gas revenue and tracked in the LPG Gas Statement (Part 1).
- **Cylinder Container (Suffix `.1`)**: Represents the refundable physical cylinder asset deposit/bond, for example `19.1`, `9.1`, `14.1`, `D.1`, `S.1`. Categorized as `debt_group = 'CYL'`. Billed as cylinder deposit debt and tracked in the Cylinder Ledger (Part 2).

### 2.2 Debtor Position Workspace

A debtor clerk manages three independent dimensions of an account, represented in the `DEBTOR_POSITION_WORKSPACE.md` spec:

1. **Financial Position (Ledger)**: Tracks LPG Gas Debt, Cylinder Financial Balance, and Total Debtor Balance. The total must match the ERP statement total.
2. **Custody Position (Stock)**: Tracks physical cylinder assets outstanding in customer possession by SKU, valued at standard deposit rates. The total equals Cylinder Custody Exposure.
3. **Reconciliation Position (Recon)**: Compares the financial cylinder balance against custody exposure to calculate the **Cylinder Variance**:

```text
Cylinder Variance = Financial Balance - Custody Exposure
```

This surfaces variance from historical price changes or incorrect rates.

### 2.3 Containment & Security Policies (HTML Stripping)

Reconciliation details and ledger variances are for internal finance eyes only. The system generates dual HTML views from a single Version 4 markdown statement using comment markers:

- **Internal View (`_Internal.html`)**: Retains all disclosures and workspace cards.
- **Customer View (`_Customer.html`)**: Automatically strips sections wrapped in `<!-- INTERNAL_ONLY_START -->` / `<!-- INTERNAL_ONLY_END -->` tags.
- **Card Parsing**: Elements wrapped in `<!-- DEBTOR_POSITION_WORKSPACE_START -->` are automatically parsed into styled UI cards by the shared script `export_to_html.py`.

---

## 3. Current Account Reconstruction Status (v4)

### 3.1 Spoon Eatery (`JEN001`)

Rebuilt successfully under the v4 doctrines:

| Metric | Value |
|---|---:|
| LPG Gas Debt | R20,510.54 |
| Cylinder Financial Balance | R2,932.50 Debit |
| Total Debtor Balance | R23,443.04 |
| Outstanding Custody | 2x `19kg`, 3x `9kg` |
| Cylinder Custody Exposure | R2,932.50 |
| Cylinder Variance | R0.00 |

Notes:

- Total Debtor Balance matches ERP exactly.
- Ledger-to-custody alignment is perfect.

### 3.2 Family Gas (`FAM000` / `FAM002` Consolidated)

Rebuilt and pushed to `main` successfully:

| Metric | Value |
|---|---:|
| LPG Gas Debt | R65,389.38 |
| Cylinder Financial Balance | -R5,117.50 Credit |
| Total Debtor Balance | R60,271.88 |
| Outstanding Custody | 23x `14kg`, -83x `19kg`, 74x `9kg`, -7x `D.1`, 1x `S.1` |
| Cylinder Custody Exposure | -R12,650.00 Credit |
| Cylinder Variance | +R7,532.50 |

Notes:

- Total Debtor Balance matches ERP exactly.
- Family Gas has 8 net cylinders outstanding.
- Credit ledger is R7,532.50 short of standard custody replacement values.

---

## 4. Immediate Next Steps: Option C

The backend data and PDF/HTML generation doctrines are now proven and stable across two distinct debtors.

The next move is to build the **frontend workspace slice** in the React application:

1. Extend the React state slice to ingest the `DebtorPosition` schema.
2. Build the internal dashboard UI rendering the three-section workspace:
   - Financial Position
   - Custody Position
   - Reconciliation Position
3. Implement the toggle to export or render either:
   - Customer View: LPG ledger + simple custody summary
   - Internal Audit View: disclosures and variance cards included

---

## 5. Agent Guardrails

- Do not expose internal reconciliation disclosures in the customer-facing view.
- Preserve the dual-line SKU doctrine: LPG content and cylinder container are separate ERP lines.
- Ensure Total Debtor Balance reconciles to ERP before presenting outputs as final.
- Keep financial ledger, custody stock, and reconciliation variance as separate conceptual dimensions.
- Use the established internal/customer HTML stripping markers if generating HTML artifacts.

---

## 6. Relationship to `lpg-gate-log`

This handover belongs to `lpg-stock-recon`, not `lpg-gate-log`.

However, the two systems share a domain doctrine:

- `lpg-gate-log` captures physical movements at the gate.
- `lpg-stock-recon` reconciles ERP and debtor/custody positions.

The shared concept is that a full cylinder has two ERP dimensions:

```text
Full cylinder = LPG content SKU + cylinder container / shell SKU
```

Future integration should preserve this boundary.
