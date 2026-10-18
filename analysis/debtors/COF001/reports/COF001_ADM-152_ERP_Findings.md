# COF001 - ADM-152: FINCON answers on invoice 45528 / DN#20080

**Session:** ERP liaison, branch `claude/adm-152-cof001-45528-erp`
**Linear:** [ADM-152](https://linear.app/p2p-marketplace/issue/ADM-152/cof001-invoice-45528-payment-40757-fincon-line-detail-audit-trail-and)
**Requests:** `docs/requests/2026-10-18_ADM-152_erp_turns.md`. On 2026-10-18 the operator asked for one short task at a time; tasks are numbered in the order sent.
**Evidence folder:** `analysis/debtors/COF001/raw/erp_requests/ADM-152/` (files as received, never edited)
**Hypotheses** (`reports/COF001_ADM-149_45528_Deposit_Investigation.md` §3):
- **H3:** wrong code. S.1 was keyed for 48kg gas.
- **H1:** double charge.
- **H2:** the customer kept or bought the cylinders.

**Operator's interim assumption:** H3. It is recorded as an ASSUMED lane override in `analysis/debtors/COF001/config/lane_overrides.json` on branch `claude/eager-mccarthy-vsfs1u` (not this branch). Each answer below states whether it confirms or breaks that assumption.

Tags: **PROVEN** = an ERP screenshot or export, with its path; **ASSERTED** = the ERP agent's typed statement, or an inference; **ASSUMED** = a hypothesis.

---

## Status

| Task | Asked | Received | Decides |
| :--- | :--- | :--- | :--- |
| 1 | 45528 lines + audit trail | 2026-10-18: page 1 of the printed invoice. **No audit trail. Page 2 not sent.** | Not yet. The decisive part (audit trail) is still outstanding. |

---

## Task 1: invoice 45528 (received 2026-10-18)

**File:** `raw/erp_requests/ADM-152/2026-10-18_task1_invoice_45528_page1.png`

- **What it is.** A FINCON "TAX INVOICE" print, page 1, relayed by the operator in the ERP liaison session.
- **sha256:** `e6a3d6bf7e1b6d5d79159b51818ec23a00d1b855261eaa56f7358a0ae03a1bf0`
- **Also on ADM-152** as an attachment.

### What it shows (PROVEN, path above)

| Field | Value |
| :--- | :--- |
| Account / name | COF001, COFFEEBERRY-CASCADES, CASCADES |
| Invoice number / date | 00045528, 09/08/2025 |
| Customer ref | DN#20080 |
| Sales rep | DELIVERY |
| Order number | blank (a figure `10.00` prints just below the field) |
| Stock location | 01 TWK |
| Line 1 | 9.4, 9KG ORYX LPG, EA, 5.00 @ 272.54 = 1,362.69 |
| Line 2 | **S.1, 48KG SV CYLINDER DEPOSIT, EA, 5.00 @ 1,207.50 = 6,037.50** |
| Footer | "Continued on page: 2"; Total 7,400.19 |

### Reading

- **The stored lines match the database snapshot.** Prices on the print include VAT: 272.54 = 236.99 × 1.15, and 1,207.50 = 1,050.00 × 1.15. The 1,362.69 + 6,037.50 = 7,400.19 equals the TXT total and payment 40757. The 45528 line detail now has an ERP source. Before this, it came only from the database (`data/adm149_line_snapshot.json`). ADM-152 tagged it ASSERTED; investigation report §2.2 tagged it PROVEN because the totals tie. For 45528 it is now PROVEN from FINCON directly.
- **Line 2 is stored as S.1 today.** This is what all three hypotheses expect. **It does not separate H3 from H1 or H2.** The ticket's tripwire turns on the audit trail (what the line was when first saved, and any edit) and on the delivery note. Neither has been received yet.
- **There is no linked sales order.** The order number is blank, so no sales order or picking slip is linked from the invoice. ASSERTED (a blank field on a print, not a lookup result). The `10.00` under it is unexplained. It may be the total quantity, 5 + 5. ASSUMED.
- **Sales rep reads DELIVERY.** The database header had rep `002`, which is probably the code behind the name. Not material.
- **"Continued on page: 2"** although the total ties to the two lines on page 1. Page 2 may hold zero-value lines or a note. It must be seen before "two lines only" is treated as PROVEN.

### Against the tripwires and the interim H3 assumption

- **ADM-152 tripwire.** Not triggered either way. The tripwire needs item 1's audit trail or item 2's delivery note.
- **Report §7 tripwire "dated export shows different lines for 45528".** Not triggered: the lines are the same.
- **H3 interim assumption (`lane_overrides.json`):** **neither confirmed nor broken.** The override stands as ASSUMED. No change to recommend.

### Follow-up sent

Task 1 is incomplete, so one short follow-up was posted on ADM-152: page 2 of 45528, and the audit trail or edit history for 45528 (who created it and when, and whether line 2 was ever changed).

ADM-152 comments, 2026-10-18:
- `8825ac47-2505-4e09-b0c4-a62412dd86e0`: "Answer to task 1"
- `32765328-e9e3-48f4-826c-6b41b32be1dc`: "Task 1, follow-up"
