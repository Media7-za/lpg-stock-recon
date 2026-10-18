---
name: untied-payment-evidence
description: >
  How to work payments the matcher leaves untied (unallocated or unmatched) without asking the
  ERP for allocation detail: record the residual by matcher bucket, classify each payment with a
  primary and an alternative explanation, climb the evidence ladder (remittance advice, customer
  ledger, bank line, ERP tags already on file as corroboration, bounded exact-sum search, pattern),
  test pool, payment-plus-credit-note, duplicate, advance, reversal and cross-posting explanations,
  stage numbered operator questions with dry-run commands, and chase missing evidence.
  DRAFT v2 (2026-10-18, revised after the COF001 trial); not yet operator-approved. Use after the
  matcher has run and a debtor still has unallocated payments (MD0003, COF001 style).
---

# Untied payment evidence

**Status: DRAFT v2, revised after the COF001 trial (`docs/previews/2026-10-18_COF001_untied_payments.md`). Operator approval needed before other sessions rely on it.**
Governance: `AGENTS.md` (§5 idempotency, §6 epistemic tags, §7 authority), `business_rules.md` §3 and §15, `ALLOCATION_DOCTRINE.md`, `SKILL_Human_Sources_Agent.md` §6.1.

Trial result in one line: on COF001 the skill reproduced two ties exactly (P1, P2), and shrank an earlier "8 payments, R56,477.08, customer credit" to 5 payments (R40,442.35) once pool and payment-plus-credit-note structures were tested. Follow the order below; the order matters.

## 0. Hard rules

1. **Never request ERP allocation detail to tie payments.** ERP allocation is untrusted input. The only allowed reason is operator-requested credit-note or cylinder detail.
2. **Never hand-patch generated CSV/JSON.** Rulings live in `config/*.json`; the matcher and ingest apply them.
3. **You stage, the operator rules.** No `approve_tie.mjs` apply, no `reconState` change, no lock, no release. Dry-run only.
4. Every number carries `PROVEN`, `ASSERTED` or `ASSUMED` and an artifact path. Arithmetic is PROVEN only when the script that did it is committed; scratch arithmetic is ASSERTED. DB reads are ASSERTED (connector-sourced). A customer's intention is ASSUMED until a remittance or ruling says so.
5. An amount match alone is weak. Never present an exact sum as the customer's intent.

## 1. Inputs and the residual by bucket

- Read `data/v5_projection.json` and `data/projection_matches.json`. Record the matcher version, the ledger file name, its SHA-256 and its D21 status (dated or an interim exception), not just the projection's `generatedAt`.
- Build one table of the matcher's **residual buckets**: `unallocatedPayments`, `openInvoicesLpgOther`, `openInvoicesCyl`, **`otherUntied`** (journals and similar, a fifth bucket that is easy to omit), and any credit-note bucket. Give the total per bucket and per lane. This table is the search space and the closing check.
- List every untied payment: doc number, date, STAT or reference, amount, lane, and the posting position in the file (file order against document date; flag LATE_POSTED receipts whose date sits far from their position, because they distort file-order balances).

## 2. Classify each payment: a primary and an alternative class

Classes are **not mutually exclusive**. Record the primary class and the alternative, and do not state DUPLICATE or CREDIT until the tests in section 4 have been run.

| Class | Meaning |
| :-- | :-- |
| POOL | Two or more payments settle several invoices together, possibly short by a small amount |
| PAY+CN | A payment plus a credit note settles an invoice (the credit note may sit on the other lane) |
| LANE | Payment posted to LPG while the matching items sit on CYL (or the reverse). Check credit notes on the other side too |
| ADVANCE | Dated before the invoice it settles; valid only inside a staged structure |
| DUPLICATE | Equals an invoice already settled by another payment. Apply only after POOL and PAY+CN were tested |
| REVERSAL | An ERP journal or credit offsets it. Direction and chronology required: the journal must follow the payment |
| CREDIT | A lane-level residual: the lane is in credit after every other structure is staged. Not decidable per payment |
| UNKNOWN | None of the above |

## 3. Evidence ladder (highest authority first)

1. **Remittance advice** for that payment (`raw/Remittances/`, `data/remittance_lines_*.csv`). If it exists it leads. Run `SKILL_Remittance_Advice_Cross_Check.md`.
2. **Customer AP ledger** or statement received from the customer.
3. **Bank statement line** (date, amount, reference, payer). Needs the operator; list the lines to look up.
4. **Bounded exact-sum search** over the matcher's residual only (see 3.1).
5. **ERP tags already on file** (DETRANS slices, delivered DEBENQ files), **corroboration only**. They never feed the matcher and never raise confidence above ASSUMED. A tag that agrees with a staged structure is noted; a tag that contradicts it is a flag. Produce a read-only report: staged proposal against ERP tag as agree, contradict or no tag.
6. **Pattern** (timing, round amounts, payer habits). ASSUMED at best; in the COF001 trial it added no value. Use it only to say a payment is anomalous, never to tie.

### 3.1 Bounded exact-sum search: required settings

- Payments up to 4 against open invoices up to 4, **cent-exact (tolerance 0.00) first**. Use 0.05 only as a second pass and say so: at 0.05, nine of eleven hits in the trial were cross-year coincidences.
- **Date window**: restrict invoices to within N days of the payment (default 120) and report anything outside it as implausible.
- Allow **credit notes and journals on the payment side** (PAY+CN, payment plus journal).
- **Pool mode**: payments against invoices with a stated shortfall allowance; report the shortfall (the trial found a pool short by R90.02).
- **Collapse equal amounts** into one set tie (four payments of R250 against four invoices of R250 is one structure, not sixteen hits).
- Report the structures tried and the ones that sum. Tag the output PROVEN only if the search script is committed.

The trial helper is `analysis/debtors/COF001/scripts/untied_payment_search.mjs`. It is account-specific and not yet a shared script. A shared version with the settings above is a pending task; until it exists, run the helper and commit it with the output.

## 4. Explanation tests (in this order)

1. POOL, PAY+CN and LANE structures (3.1).
2. DUPLICATE (only for what is left): equals an invoice already settled by another payment. Check the ERP tag for a split that sums to the same amount before flagging.
3. REVERSAL: same amount, opposite sign, **journal after the payment**. One journal can reverse only one payment.
4. CREDIT: compute the lane position after everything staged. State it as a lane residual.
5. Cross-posting to a sibling account (like COF001/COF002): do not move anything. Flag the question and run the checklist: bank line, ERP document header facts (entered-by, entry date, original account), the sibling account's open invoices of the same amount, and the sibling-account analysis file.
6. LATE_POSTED: a receipt keyed after later documents and back-dated. State the document date against the file position.

## 5. Stage questions (numbered P1, P2 ...)

For each: payments, invoices (or journal or credit note), total, primary class and alternative, evidence rung, tag, ERP-tag corroboration (agree, contradict, none) and the dry-run command (`approve_tie.mjs --dry-run ...`).

Tool limits to state, not hide:
- A payment in the LPG lane that settles CYL items uses `--deposits`.
- `part_payment` needs `--partial` to name the invoice left open.
- **`approve_tie.mjs` has no form for payment plus journal, or for a pure customer credit.** Say "no valid form" and describe the ruling needed in plain words; do not invent a command.

State who can approve each class: DUPLICATE kept as customer credit or refunded is the operator's decision; a CONFIRMED tie is never locked, only PROBABLE ties get locks.

**Closing residual table.** Bucket totals before and after the staged proposals, including `otherUntied`. The remaining total must reconcile to the ERP balance for the lane. If it does not, you omitted a bucket.

## 6. Chase list (outward, draft only)

Table: payment, date, amount, STAT, who can supply (customer remittance, bank line, ERP header facts, none). Customer requests are Gmail drafts, never sent. **Mailbox check:** search metadata only (sender, subject, date); open a message only when the metadata shows a request or an advice for the same payments, and record what you opened. If the customer contact is not confirmed, stop and ask the operator; never guess a contact. ERP requests follow `SKILL_Linear_Task_Logging.md` and never ask for allocation detail.

## 7. Output

- A preview file `docs/previews/<date>_<CODE>_untied_payments.md` with sections 1 to 6, committed with the search script and its output.
- A handoff entry: untied total before and after staging, questions open, evidence missing, tripwires.
- No change to `config/` unless the operator has ruled; then record exactly that ruling.

## 8. Trial notes (append dated entries; do not delete earlier ones)

**2026-10-18, COF001 trial (analyst session `claude/cof001-analysis`, commit `7ec5643`).** Added value: classification table, dry-run staging, residual check. P1 (four R250 rentals) and P2 (2023 batch, R13,276.64) reproduced. The earlier 8-payment credit residual (R56,477.08) shrank to 5 payments (R40,442.35) once a pool (38270 + 39144 vs 42614/42875/43287, short R90.02) and payment plus credit note (42636 + CN 12956 vs 44730) were found; four of the five (R30,792.79) are DUPLICATE candidates and one is CREDIT or UNKNOWN. Journal 476 (+R7,224.65, `otherUntied`) can reverse only 44844. Changes made in v2: residual by bucket (including `otherUntied`), primary and alternative class, POOL and PAY+CN classes, ERP-tag rung (corroboration only), cent-exact first with date window, reversal direction, tool-limit statement, mailbox scope, cross-posting checklist, LATE_POSTED. Open: promote the search helper to a shared script, and a read-only ERP-tag corroboration report.
