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
| 1 | 45528 lines + audit trail | 2026-10-18: page 1 (PROVEN); page 2 empty (ASSERTED); no history available (ASSERTED) | **Closed, undecided.** Stored code is S.1; no audit trail exists. |
| 2 | DN#20080 delivered / collected by size | Sent 2026-10-18 | **Decisive** |

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

## Task 1 follow-up (received 2026-10-18, typed in the liaison session)

- **Page 2 of 45528.** "there was nothing on page 2". ASSERTED (the ERP side's typed statement, no screenshot). Invoice 45528 therefore has only the two lines on page 1.
- **Audit trail.** Not yet answered. The ERP side asked what the request meant, so it was re-explained in plain terms; see the ADM-152 comment of the same date. If FINCON keeps no edit history, that answer is recorded as "not available", and the decision moves to task 2 (delivery note DN#20080).
- **Interim H3 assumption:** still neither confirmed nor broken.
- **Audit trail answer (2026-10-18):** "no history available". ASSERTED (the ERP side's typed statement). FINCON gives no record of whether line 2 was first saved as S01, S.4 or S.1. **Item 1 of ADM-152 is closed without deciding the question.** The decisive evidence is now task 2 (delivery note DN#20080).

**Task 1 closed.**
- **What it proved:** the stored lines (PROVEN) and that page 2 was empty (ASSERTED).
- **What it could not prove:** whether line 2 was changed, because FINCON keeps no edit history.
- **Interim H3 assumption:** neither confirmed nor broken.
- **Next:** task 2, delivery note DN#20080 (fulls delivered and empties collected, by size).

---

## Operator ruling relayed by the parent session (2026-10-18 22:24Z)

- **The ruling.** The operator ruled that invoice 45528 was incorrect, and so was its selling price. **H3 is now operator-confirmed.**
  - The source is the parent session `session_01PETzS3tSogSeziSVM1u665`, by cross-session message. This liaison session did not see the ruling directly. Its record is on the parent's side.
  - The confirmation rests on the operator's judgement, not on FINCON evidence. FINCON proved only the stored S.1 line (task 1), and it has no edit history.
- **The correction is a separate ticket.** [ADM-158](https://linear.app/p2p-marketplace/issue/ADM-158/cof001-correct-invoice-45528-48kg-gas-billed-as-deposit-wrong-price) is a child of ADM-151, assigned to Sharmin, and was verified to exist on 2026-10-18. It covers:
  - a credit note for S.1 × 5;
  - a 48kg gas invoice at the correct price;
  - a write-off of the R1,776.24 gas credit against the shortfall.
  
  None of this is filed here.
- **Effect on ADM-152.** Task 2 (DN#20080) is no longer decisive. It is optional corroboration only.
- **Tripwires that still apply.** These would contradict the ruling and go back to the operator:
  - DN#20080 shows no 48kg fulls delivered;
  - a site count shows five 48kg cylinders above the float.

---

## Closed 2026-10-19 (operator decision in the liaison session)

- **Withdrawn.** The operator chose to withdraw the outstanding requests and close ADM-152. Turns 2-4 and Task 2 are marked WITHDRAWN on Linear; their text is kept, struck through.
- **Closed.** The closing comment is `384c300b-20c3-46dc-ae13-76aaff7eadd2`. ADM-152 is set to Done.
- **Never asked.** DN#20080 counts; stock movements on 9 Aug 2025; the empties documents 45529/13191 and 44730/12956/DN#12190; the bank lines for 40757 and 42636.
  - The R517.50 9kg deposit on 44730 (investigation report §5) therefore stays ASSUMED.
  - The database bank gap for Feb-Nov 2025 stays open.
- **Tripwires that reopen this:**
  - any DN#20080 record showing no 48kg fulls delivered;
  - a site count showing five 48kg cylinders above the float;
  - ADM-158's correction documents differing from the ruling.
