---
name: remittance-advice-cross-check
description: >
  Pre-release scan of a customer statement against remittance advices (worked example the
  TWK AGRI family). Use before a statement goes out, and when deciding whether the v5
  evidence path can stand in for the invoice-tag gate where debtors:tag-check returns
  NOT_DERIVABLE_FROM_TXT: compare every untied invoice and credit note on the customer list
  with the advice lines, and treat any listed item the customer says it paid as a finding.
---

# Remittance Advice Cross-Check

Governance: `DEBTORS_DOCTRINE.md` D20 (family release rule), `ALLOCATION_DOCTRINE.md`, `AGENTS.md` (tags and artifact paths on every number). The scan is evidence for the operator's release decision; it does not itself release, lock or tie. Recording rulings: `SKILL_Family_Rulings_And_Holds.md`. Re-running after changes: `SKILL_Family_Statement_Refresh.md`.

## 1. Why

A customer list can show an invoice as open that the customer's own remittance says it paid. Sending that statement damages the account. This scan found, before the TWK AGRI family was released, that three TWK003 invoices (46857, 47076, 47523) and the payment they belong to (43500) were on the STAT 123 advice yet still listed, which led to an operator-approved allocation lock (L0001 on TWK003).

## 2. Inputs

| Input | Where |
| :--- | :--- |
| The customer list (internal and customer view) | `<ACCOUNT>/reports/<ACCOUNT>_Open_Items_v5.md` and `_Customer_PREVIEW.md`, or the family statement and `<PARENT>_Family_Internal_Reconciliation.md` |
| Advice lines | `<PARENT>/data/remittance_lines_<year>.csv` (columns `batch_id, line_type, doc_no, doc_date, original_amount, net_amount, on_remittance, notes`) |
| Advice evidence incl. which member account a document belongs to | `<PARENT>/data/remittance_evidence.json` (`batches`, `family.postings`, `family.siteDocs`) |
| Doc-number aliases the advice uses | `remittanceDocAliases` in `statement_v5.json` |
| The matcher's view | `data/projection_matches.json` (`ties`, `unallocatedPayments`, `residual`) |

## 3. Procedure

1. **List the untied items.** Every invoice and credit note on the customer list that has no tie. (Items that are tied are already settled by a rule or a lock.)
2. **Look each one up in the advice lines** by document number, after applying aliases. The doc number in the CSV has leading zeros (`00041747`).
3. **Classify each item:**
   | Result | Meaning | Action |
   | :--- | :--- | :--- |
   | On no advice | The customer has not claimed it | Fine; nothing to do |
   | On an advice and still open | The customer says it paid it | **Finding.** Report to the operator before release; usually an unallocated payment or a missing tie |
   | Not on the advice, but an equal-amount document is | The advice names a different document of the same amount (TWK003: advice names 47880, which CN 13966 reverses; cash applies to 47991) | Finding; allocation is a lock decision by the operator, same cash either way |
   | Credit note on an advice | The customer deducted it | Check it is tied to its invoice |
4. **Check the cash.** Sum the advice cash by member account and compare with the payment postings (TWK: payment 43500 appears as R38,501.31 on TWK003, R25,000.31 on TWK004 and R176,824.24 on TWK002, summing to the advice cash R240,325.86).
5. **Do it for every member**, not only the parent. A member without its own `statement_of_account.json` has no `tag-check` of its own: this scan is the only check it gets, and the note must say so.
6. **Write the result** in the preview note's update section: items scanned, findings, what is not covered, and tripwires.

## 4. Feeding the release-gate decision

Where `npm run debtors:tag-check -- --debtor <PARENT>` returns `NOT_DERIVABLE_FROM_TXT` (the export deliberately excludes allocation detail), it is neither a pass nor a block. Whether the v5 evidence path stands in for the tag gate is **the operator's ruling**. Give: the matcher proof (HOLDS), the per-account tie-out, this scan (no untied list item on an advice after any approved lock), and the gaps (members with no tag-check). TWK AGRI: ruled yes on 2026-10-12 (hold H4 removed); TWK002 and TWK004 had no listed item on an advice, TWK003 only after L0001.

## 5. Traps

- An advice can name a document by its customer reference; match on `doc_no` and the alias map, then on amount and date.
- Do not allocate a payment to make a finding disappear. The agent reports; the operator approves a lock.
- Cash that sums to the advice is not proof every named document is the right one.

## 6. Tripwires

A new advice batch for the family; a re-export or new document on any member; a lock voided; the customer disputes a listed item.
