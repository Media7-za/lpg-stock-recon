---
name: customer-statement-send
description: >
  Send checklist for a customer statement email (worked example the TWK AGRI consolidated
  statement). Use only after the operator has said to send: find the thread, read the
  customer's last message, create the draft (never send), attach the PDF by hand, include
  nothing internal, and confirm the amount due equals the generator output. TWK-specific
  contact and thread details are supplied by the operator, never guessed.
---

# Customer Statement Send

Governance: `AGENTS.md` (customer copy is released only through `generate_statement_of_account.mjs` plus `npm run debtors:tag-check`), `DEBTORS_DOCTRINE.md` D20 for a family, and the Collections role in `SKILL_Human_Collections_Agent.md`. **Do not auto-email customers.** The agent prepares a **draft** and stops; a human sends it.

## 1. Preconditions (all must hold)

- [ ] The operator has asked for the send in this session, naming the account and the as-at date
- [ ] The statement is a release copy: for a family, `familyReleaseHolds` is empty, no member is review-only, and the generator wrote `<PARENT>_Statement_of_Account.md`, not a `..._DRAFT_PREVIEW`
- [ ] Anything that changed since the last run has been refreshed (`SKILL_Family_Statement_Refresh.md`): no TXT re-export, no new document, no quarantine or lock gate abort
- [ ] `npm run debtors:tag-check -- --debtor <PARENT>` has been run and its verdict recorded; if it is `NOT_DERIVABLE_FROM_TXT`, the operator has ruled the v5 evidence path stands in (`SKILL_Remittance_Advice_Cross_Check.md` section 4)
- [ ] The PDF was made from that exact markdown with `analysis/debtors/shared/scripts/md_to_pdf.mjs` (not `npx md-to-pdf`, which fails as root)

## 2. Steps

1. **Find the thread.** Search the mailbox for the customer's contact and the latest statement or account thread (Gmail search tool). Read the customer's **last** message in full before drafting: a dispute, a payment notice or a change of contact changes what you say. The contact and thread for a given account are supplied or confirmed by the operator; do not guess an address from a name.
2. **Create the draft** with the Gmail draft tool, as a reply on that thread where one exists. **Never call send.** Leave the draft unsent.
3. **Attach the PDF by hand.** The Gmail tool cannot carry a base64 attachment reliably. Tell the operator the exact path of the PDF to attach and to attach it before sending.
4. **Keep it clean.** The body and the PDF contain nothing internal: no matcher, lock, hold, quarantine or ruling language, no internal ledger, no account codes the customer does not use, no notes about ERP errors. A quarantined or ruled-off item is simply not mentioned.
5. **Check the amount.** The amount due in the email equals the generator output to the cent. For a family it can deliberately differ from the sum of the ERP balances by a quarantined amount; that difference is explained on the internal view only, never in the email.
6. **Record the send package** in the handoff and the preview note: draft created (not sent), the PDF path, the amount due, and the SHA-256 of the exact PDF and markdown. Family statements have no snapshot (`--snapshot` is refused), so this hash is the send record; **the operator has not yet ruled on that practice**, so mark it PROPOSED in the handoff.
7. **Stop.** Report to the operator: draft ready, attachment pending, nothing sent.

## 3. TWK AGRI specifics

- Statement: `analysis/debtors/TWK002/reports/TWK002_Statement_of_Account.md` and `.pdf` (consolidated TWK002 + TWK003 + TWK004); amount due R115,136.19 at 2026-10-12 (ERP sum R114,836.19 less the ruled TWK003 R-300.00 quarantine). Re-read it from the generator at send time; never copy this figure.
- The customer is addressed as in the statement header (TWK AGRI PTY LTD; reference per `statement_of_account.json`). The contact and thread are not recorded in the repo: ask the operator.
- Do not mention the TWK003 price correction; if the customer asks about it, escalate to the operator.

## 4. Never

- Send, schedule, or auto-reply.
- Paste an internal view, a draft preview or a snapshot meant for finance into the email.
- Change the amount, wording of items or lane labels to suit the email.

## 5. Tripwires (stop and refresh if)

A re-export or new document on any member after the PDF was made; the ERP correction behind a quarantine posting (the generator will abort); the customer's last message disputes an item.
