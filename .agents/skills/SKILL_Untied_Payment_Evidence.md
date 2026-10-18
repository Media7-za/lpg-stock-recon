---
name: untied-payment-evidence
description: >
  How to work payments the matcher leaves untied (unallocated or unmatched) without asking the
  ERP for allocation detail: classify them, climb the evidence ladder (remittance advice, customer
  ledger, bank line, bounded exact-sum search, pattern), test for duplicate/advance/reversal
  explanations, stage numbered operator questions with dry-run commands, and chase missing evidence.
  DRAFT 2026-10-18 for a trial on COF001; not yet operator-approved. Use after the matcher has run
  and a debtor still has unallocated payments (MD0003, COF001 style).
---

# Untied payment evidence

**Status: DRAFT, trial on COF001. Operator approval needed before other sessions rely on it.**
Governance: `AGENTS.md` (§5 idempotency, §6 epistemic tags, §7 authority), `business_rules.md` §3 and §15, `ALLOCATION_DOCTRINE.md`, `SKILL_Human_Sources_Agent.md` §6.1.

## 0. Hard rules

1. **Never request ERP allocation detail to tie payments.** ERP allocation is untrusted input. The only allowed reason is operator-requested credit-note or cylinder detail.
2. **Never hand-patch generated CSV/JSON.** Rulings live in `config/*.json`; the matcher and ingest apply them.
3. **You stage, the operator rules.** No `approve_tie.mjs` apply, no `reconState` change, no lock, no release. Dry-run only.
4. Every number carries `PROVEN`, `ASSERTED` or `ASSUMED` and an artifact path. Arithmetic on the committed projection is PROVEN; DB reads are ASSERTED (connector-sourced); a customer's intention is ASSUMED until a remittance or ruling says so.
5. An amount match alone is weak. Say so in the tag; never present an exact sum as the customer's intent.

## 1. Inputs and scope

- Read `data/v5_projection.json` and `data/projection_matches.json`; list the untied payments with doc number, date, STAT/reference, amount, lane.
- Record the matcher version and the as-at of the ledger file. If the ledger file is undated (D21 exception), say so.
- Count and total what is untied, and what open invoices (by lane) remain. This is your search space and the check at the end.

## 2. Classify each untied payment (write the class in the table)

| Class | Meaning |
| :-- | :-- |
| LANE | Payment posted to LPG but equal sums sit on CYL (or the reverse) |
| ADVANCE | Payment dated before the invoice it would settle |
| DUPLICATE | Equals an invoice already settled by another payment |
| REVERSAL | An ERP journal or credit offsets it (same amount, opposite sign) |
| CREDIT | No open invoice can absorb it; account is in credit on the lane |
| UNKNOWN | None of the above |

## 3. Evidence ladder (highest authority first; stop climbing when a rung settles the question)

1. **Remittance advice** for that payment (`raw/Remittances/`, `data/remittance_lines_*.csv`). If it exists, it leads. Run `SKILL_Remittance_Advice_Cross_Check.md`.
2. **Customer AP ledger** or statement received from the customer.
3. **Bank statement line** for the payment (date, amount, reference, payer). Needs the operator; list the lines to look up.
4. **Bounded exact-sum search** over the matcher's residual only: subsets of up to 4 untied payments against up to 4 open invoices, cent-exact (tolerance 0.00 first, then 0.05 and say so). Report only structures that sum; list the ones tried. Equal repeated amounts (for example four payments of R250) are a set tie, not 1:1.
5. **Pattern** (round amounts, same day-after-invoice timing, payer batch habits). ASSUMED at best.

If no rung 1 to 3 evidence exists for a payment, say so in the table. That drives the chase list (section 6).

## 4. Explanation tests (run for each UNKNOWN or suspicious payment)

- Equal to an invoice that another payment already settles? (DUPLICATE candidate)
- An ERP journal or credit of the same amount and opposite sign near the date? (REVERSAL candidate)
- Posted to the wrong lane? (LANE candidate: check the invoices' lane)
- Is the account, or the other lane, in credit by roughly the residual? (CREDIT)
- Could it belong to a sibling account (like COF001/COF002)? Do not move anything; flag it as a cross-posting question and name the check (bank line, document header facts).

## 5. Stage questions (numbered P1, P2 ...)

For each proposal write: payments, invoices, total, class, evidence rung, tag, and the **dry-run** command (`approve_tie.mjs --dry-run ...`). Provide the alternative treatment (for example `customer_credit`) and the tripwire that reopens it. Nothing is applied.

End with the residual check: untied total, absorbed by P-items, remaining, and the open invoices left. The remaining amount must reconcile to the lane balance.

## 6. Chase list (outward, draft only)

Table: payment, date, amount, STAT, who can supply (customer remittance, bank line, ERP header facts, none). Customer requests go as Gmail drafts, never sent; check the mailbox first for earlier requests (do not ask twice) and name the contact. ERP requests follow `SKILL_Linear_Task_Logging.md` and never ask for allocation detail.

## 7. Output

- A preview section or file `docs/previews/<date>_<CODE>_untied_payments.md` with sections 1 to 6.
- A handoff entry: untied total before/after staging, questions open, evidence missing, tripwires.
- Do not edit `config/` unless the operator has ruled; then record exactly the ruling.

## 8. Trial notes (fill in during the COF001 trial)

Record here, as dated additions: steps that were unclear, steps that added no value, a search or check that had to be done by hand and should become a script (for example a shared bounded exact-sum search), and anything the skill got wrong.
