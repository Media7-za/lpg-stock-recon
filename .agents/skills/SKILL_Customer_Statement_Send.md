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
2. **Create the draft** (only after the send record of step 6 is committed and pushed) with the Gmail draft tool, as a reply on that thread where one exists. **Never call send.** Leave the draft unsent.
3. **Attach the PDF by hand.** The Gmail tool cannot carry a base64 attachment reliably. Tell the operator the exact path of the PDF to attach and to attach it before sending.
4. **Keep it clean.** The body and the PDF contain nothing internal: no matcher, lock, hold, quarantine or ruling language, no internal ledger, no account codes the customer does not use, no notes about ERP errors. A quarantined or ruled-off item is simply not mentioned.
5. **Check the amount.** The amount due in the email equals the generator output to the cent. For a family it can deliberately differ from the sum of the ERP balances by a quarantined amount; that difference is explained on the internal view only, never in the email.
6. **Make the send record (mandatory, section 3 below)** before the draft is shown to the operator as ready: the exact PDF and markdown, a manifest with their hashes, committed to git. A family statement has no snapshot (`--snapshot` is refused), so this record is the proof of what the customer received. Adopted by the operator on 2026-10-13 ("Yes, do option 2").
7. **Stop.** Report to the operator: draft ready, attachment pending, nothing sent.

## 3. Send record (family statements; operator-adopted 2026-10-13)

A hash alone proves nothing unless the file is kept, so the record stores the files and the hashes, committed to git. Single-account statements keep using `--snapshot` and its manifest; this section is for statements where the generator refuses a snapshot.

**Folder:** `analysis/debtors/<PARENT>/sends/<YYYY-MM-DD>_v<N>/` (the as-at date of the statement; `v2` if the same date is re-sent after a change). Never edit a record after it is committed; a changed statement is a new `v<N>`.

| File | Content |
| :--- | :--- |
| `<PARENT>_Statement_of_Account.md` | Exact copy of the release markdown |
| `<PARENT>_Statement_of_Account.pdf` | Exact copy of the PDF that will be attached |
| `manifest.json` | Fields below |

**`manifest.json` fields:**

```json
{
  "sendId": "TWK002_2026-10-12_v1",
  "parent": "TWK002",
  "members": ["TWK002", "TWK003", "TWK004"],
  "asAt": "2026-10-12",
  "amountDue": 115136.19,
  "files": [{ "path": "TWK002_Statement_of_Account.pdf", "sha256": "...", "bytes": 0 },
            { "path": "TWK002_Statement_of_Account.md",  "sha256": "...", "bytes": 0 }],
  "memberTxt": [{ "code": "TWK002", "path": "analysis/debtors/TWK002/raw/...", "sha256": "..." }],
  "projectionTxtSha256": [{ "code": "TWK002", "sha256": "..." }],
  "generatorCommit": "<git rev-parse HEAD at generation>",
  "quarantinedOffCustomerCopy": [{ "id": "Q1_PRICE_TYPO", "account": "TWK003", "amount": -300.00 }],
  "familyReleaseHolds": [],
  "tagCheckVerdict": "NOT_DERIVABLE_FROM_TXT",
  "tagCheckRuling": "operator 2026-10-12: v5 evidence path stands in (hold H4 removed)",
  "preparedBy": "agent", "preparedAt": "<ISO time>",
  "draftCreated": true, "sent": false
}
```

**How to fill it (all values come from files, never typed):**

```bash
D=analysis/debtors/<PARENT>; V=$D/sends/<YYYY-MM-DD>_v1; mkdir -p $V
cp $D/reports/<PARENT>_Statement_of_Account.md $D/reports/<PARENT>_Statement_of_Account.pdf $V/
sha256sum $V/*.md $V/*.pdf                      # files[]
sha256sum analysis/debtors/*/raw/<member TXT>   # memberTxt[] (the exact TXT in each member's config)
git rev-parse HEAD                              # generatorCommit
# projectionTxtSha256: source.txtSha256 in each member's data/v5_projection.json
# amountDue: the generator's "amount due" line; quarantined amounts: customerQuarantine in member configs
```

Order: generate and test, make the PDF with `md_to_pdf.mjs`, run the tag-check, make the record, `git add` and **commit and push the record**, then create the Gmail draft. The commit hash of the record goes into the handoff.

**After the human sends:** append (never rewrite) a `sent` block to `manifest.json` in a new commit: `{ "sent": true, "sentBy": "...", "sentAt": "...", "to": "<recipient role, not the address>" }`. A human fills it; the agent never marks something sent.

**Verify a record later:** `cd <folder> && sha256sum -c` against the manifest values, and compare `memberTxt` hashes with the TXT files at the recorded `generatorCommit`.

The manifest is internal. It names quarantines and holds, so it is never attached to or quoted in the email.

## 4. TWK AGRI specifics

- Statement: `analysis/debtors/TWK002/reports/TWK002_Statement_of_Account.md` and `.pdf` (consolidated TWK002 + TWK003 + TWK004); amount due R115,136.19 at 2026-10-12 (ERP sum R114,836.19 less the ruled TWK003 R-300.00 quarantine). Re-read it from the generator at send time; never copy this figure.
- The customer is addressed as in the statement header (TWK AGRI PTY LTD; reference per `statement_of_account.json`). The contact and thread are not recorded in the repo: ask the operator.
- First record: `analysis/debtors/TWK002/sends/<as-at date>_v1/` (none exists yet; nothing has been sent).
- Do not mention the TWK003 price correction; if the customer asks about it, escalate to the operator.

## 5. Never

- Send, schedule, or auto-reply.
- Paste an internal view, a draft preview or a snapshot meant for finance into the email.
- Change the amount, wording of items or lane labels to suit the email.

## 6. Tripwires (stop and refresh if)

A re-export or new document on any member after the PDF was made; the ERP correction behind a quarantine posting (the generator will abort); the customer's last message disputes an item.
