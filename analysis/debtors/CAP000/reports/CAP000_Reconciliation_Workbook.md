# CAP000 Reconciliation Workbook (Google Sheet)

**Status:** Live review surface (unformatted single sheet)  
**As At:** 2026-10-03  
**URL:** https://docs.google.com/spreadsheets/d/1GDnxxxtIGeEa43wsSa0O4rySbz-ZYhqvWgzCb6nlYFU/edit?usp=drivesdk  
**Sheet ID:** `1GDnxxxtIGeEa43wsSa0O4rySbz-ZYhqvWgzCb6nlYFU`

---

## What it is

Operator-facing Google Sheet built from repo artifacts (DEBENQ ledger, `allocation_edges.csv`, `reconciliation_status.csv`). Created via Drive (no Sheets editor connector in the authoring session), so it is **one tab, A1:L429**, stacked blocks with live formulas — not multi-tab / formatted.

### Blocks

| Block | Contents |
| :--- | :--- |
| Account position | B/F R43,865.94 → closing R70,773.28, variance R0.00 |
| Payments | All 8 STAT payments with status |
| Monthly roll-forward | 19 months, each difference 0 vs ERP |
| Open items | Current open-item list |
| Allocation edges | 20 rows |
| Reconciliation status | 134 rows |
| Ledger | 207 DEBENQ lines |

Authoring session reported formulas recalculate after upload: 7 PROVEN, remittance-linked R51,321.29, unallocated R132,692.34.

---

## Epistemic notes

| Claim | Tag | Basis |
| :--- | :--- | :--- |
| Account balance R70,773.28 | **PROVEN** | DEBENQ B/F + 207 lines |
| Sheet formula results | **ASSERTED** | Authoring agent read-back after Drive create; not re-verified in this close |
| Σ(open) on status block | **Not meaningful as debt** | DEBENQ lacks payment/CN tags for most invoices |

### Not on the sheet

- 7 Jan–Feb 2025 remittance invoices inside opening B/F
- Open-invoice ageing (would overstate debt without payment tags)

---

## Related fix

`data/invoices.csv` previously included 8 Payment rows. Payment **00042697** collides with invoice **42697** (R2,415.00). Payments removed → invoice shows R2,415.00. See `project.json` history 2026-10-03 correction.

---

## Tripwires

| Ruling | Reopens if |
| :--- | :--- |
| Sheet is the review surface | Repo edges/status regenerate and sheet is not refreshed |
| Invoice 42697 = R2,415.00 | `invoices.csv` again includes Payment rows, or DEBENQ changes that invoice |
