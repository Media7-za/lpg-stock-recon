# Portfolio — invoice tag coverage sweep (2026-08-11)

**Trigger:** TWK002 was found billing a customer for invoices 42468 / 42470, paid 15 months earlier, because ERP had settled them with an untagged payment slice (`TWK002_Stale_Open_Invoices_2026-08-11.md`). The operator asked for the risk to be addressed across all processes rather than patched on one account, so the new gate was run over the whole portfolio.

**Command:** `npm run debtors:tag-check:all`

> **Revised twice on 2026-08-11 after operator correction.** The measurements have not changed; the conclusions drawn from them have.
>
> *First correction.* The original report called the eight exports lacking allocation detail an *export defect* and prescribed re-exporting them (`H-016`). Excluding allocation detail is in fact a deliberate posture: the `INVNO` column it omits is ERP's payment allocation, which is broken by long-standing finding (`business_rules.md` §3) and is the very reason this repo reconstructs allocation from evidence. Re-exporting recovers only Crd Note tagging and would not make those accounts customer-ready.
>
> *Second correction.* The revision then pointed the remedy at "the allocation lane: remittance advices → allocation edges", which assumed evidence that does not exist. **Remittance advices are available for 3 accounts only.** For every other account settlement has to be established from payment patterns, business rules, operator judgement and other logic. That is the normal route, not a fallback, and §15 now carries a separate authority order for it.

---

## Result

Tagging is reported separately per entry type, because the two carry very different weight — Crd Note tagging is broadly canonical, payment tagging is not. The evidence column records whether the account had remittance advices for the gate to test against.

| Debtor | Gate | Crd Note tagged | Payment tagged | Evidence | Open invoices | Invariant | Blocking reason |
| :--- | :--- | ---: | ---: | :--- | ---: | :--- | :--- |
| BR0001 | NOT_DERIVABLE_FROM_TXT | 0% | 0% | PATTERN_ONLY | 75 | n/a | NO_INVOICE_TAGGING_IN_EXPORT |
| IVE001 | NOT_DERIVABLE_FROM_TXT | 0% | 0% | PATTERN_ONLY | 59 | n/a | NO_INVOICE_TAGGING_IN_EXPORT |
| JEN001 | NOT_DERIVABLE_FROM_TXT | 0% | 0% | PATTERN_ONLY | 100 | n/a | NO_INVOICE_TAGGING_IN_EXPORT |
| MD0003 | **BLOCKED** | 100% | 88.9% | PATTERN_ONLY | 22 | **BREACHED** (R59,456.42) | OPEN_LIST_OVERSTATES_ACCOUNT |
| MON001 | NOT_DERIVABLE_FROM_TXT | 0% | 0% | PATTERN_ONLY | 44 | n/a | NO_INVOICE_TAGGING_IN_EXPORT |
| MOZ002 | NOT_DERIVABLE_FROM_TXT | 0% | 0% | PATTERN_ONLY | 120 | n/a | NO_INVOICE_TAGGING_IN_EXPORT |
| RED001 | NOT_DERIVABLE_FROM_TXT | 0% | 0% | PATTERN_ONLY | 54 | n/a | NO_INVOICE_TAGGING_IN_EXPORT |
| SA0001 | NOT_DERIVABLE_FROM_TXT | 0% | 0% | PATTERN_ONLY | 166 | n/a | NO_INVOICE_TAGGING_IN_EXPORT |
| TAN001 | NOT_DERIVABLE_FROM_TXT | 0% | 0% | PATTERN_ONLY | 137 | n/a | NO_INVOICE_TAGGING_IN_EXPORT |
| TWK002 | ALLOWED | 100% | 67.2% | REMITTANCE_BACKED | 11 | PASS | — |

**One account has a contradicted open list (MD0003); eight cannot produce one from the TXT at all.** TWK002 is the only account whose open-invoice list currently survives the gate, and also the only one where the settlement-discount reconciliation work has been done — the two facts are related, and the second is the cause of the first.

The split confirms the doctrine independently. In both accounts that carry allocation detail, **Crd Note tagging is 100%**, while payment tagging leaks (TWK002 67.2%, MD0003 88.9%). ERP does reliably attach credit notes to their originating invoice; it does not reliably attach payments. Every error found in this sweep sits on the payment side.

---

## Finding 0 — the gate's strongest check is inert on 9 of 10 accounts

The remittance-contradiction test — the one that caught TWK002's 42468 / 42470 — reads extracted advice lines from `data/remittance_lines_*.csv`. Only TWK002 has them, so **it ran on exactly one account**. Two separate causes, and only one is fixable:

- **Structural.** Remittance advices are available for 3 accounts in the portfolio. The other seven will never have this check, by nature of how those customers pay. Their settlement claims rest on exact-sum arithmetic, established payment patterns, business rules for the payer type, and operator judgement — now written up as authority order B in `business_rules.md` §15.
- **Fixable.** MD0003 *has* 28 advice PDFs and 3 manifests, but no extracted `remittance_lines` CSV, so the gate reads it as `PATTERN_ONLY` and cannot use evidence already sitting in the repo. Extracting those lines is now a prerequisite on `H-017` and will likely name several of the over-stated invoices without further analysis.

The gate now labels every account `REMITTANCE_BACKED` or `PATTERN_ONLY`, lists which checks ran, and names the inert one. Without that label an `ALLOWED` reads as "checked against the customer's records" on nine accounts where nothing of the kind happened.

## Finding 1 — eight exports carry no invoice tagging (by design)

Eight of the ten debtor statement TXTs were exported with the allocation-detail option off. The file header records it:

```text
"EXCLUDE:","ALLOCATION DETAIL"
```

With that flag the `INVNO` column is blank on **every** row. What the naive reconstruction then produces is *every invoice ever raised in the export window*, since nothing can be netted off — which is why BR0001 shows 75 "open" invoices and SA0001 shows 166. Those numbers are artefacts of missing data, not claims about the accounts, which is why the gate refuses to score them individually or evaluate the invariant against them.

**This is not a defect and there is nothing to repair.** The omitted column is the untrustworthy one. It does not affect:

- the ERP `CURRENT BALANCE` header, which remains ground truth for what each account owes,
- balance and ageing work driven by the running-balance column,
- the v4/v5 sub-ledger statements, which route payments by lane and never read `INVNO`.

What it does mean is that these eight accounts have **no invoice-level view yet**, and none of them has remittance advices to build one from. The route is therefore the pattern lane, in the order set out in `business_rules.md` §15 authority order B: exact-sum month tests first (deterministic, no judgement required), then the account's established payment cadence recorded in `config/payment_pattern_overrides.json`, then the business rules for that payer type, then operator judgement ratified into `config/ratification_scenarios.json` or `closedInvoiceOverrides` with its reasoning stated. MON001 and RED001 already have allocation-edge pilots and RED001 has a ratification scenario, so the machinery exists and has precedent.

**Remedy — `H-016`, re-scoped:** an operator decision per account, not a bulk re-export and not a wait for advices that are not coming. Either the account needs no invoice-level view (close as N/A), or it needs pattern-lane allocation work, or CYL credit detail specifically is wanted — in which case a re-export *with* allocation detail is worthwhile for its Crd Note tagging alone (100% on both accounts that have it), on the explicit understanding that its payment tags still carry no authority.

## Finding 2 — MD0003 over-states by R59,456.42

MD0003's export *does* carry allocation detail, and its Crd Note tagging is 100%. The leak is entirely on the payment side (88.9%), which is the TWK002 failure mode exactly: individual settlement slices posted untagged.

| Measure | Value |
| :--- | ---: |
| Σ open invoices (22) | R78,309.78 |
| ERP CURRENT BALANCE | R18,853.36 |
| **Over-stated by** | **R59,456.42** |
| Untagged credits | R65,474.71 across 9 rows |
| Opening BALANCE B/F | R52,607.52 |

The list itemises R59,456.42 more debt than the account owes, which is proof that settled invoices are being carried as open. Sending MD0003 this list would demand payment for debt already paid.

**Remedy:** reconcile remittance-by-remittance to establish which invoices the untagged credits cleared, then ratify them into `closedInvoiceOverrides` — `H-017`. MD0003 is one of the three accounts that *does* have advices (28 PDFs in `raw/Remittance/`, 3 manifests), so real evidence exists here. It is not yet extracted into `data/remittance_lines_*.csv`, which is why the gate reads MD0003 as `PATTERN_ONLY` and could not use it; extracting those lines is the first step and may resolve much of the R59,456.42 on its own.

## Note on tagging percentage

TWK002 passes at 67.2% payment tagging; MD0003 fails at 88.9%. The percentage is context, not a verdict — what matters is whether the untagged credits happen to correspond to invoices inside the export window, and only the invariant plus remittance evidence answers that. A high payment-tag percentage is not reassurance.

---

## What changed

| Change | Effect |
| :--- | :--- |
| `shared/scripts/debenq_open_invoices.mjs` | Shared open-invoice model + risk analysis. The gate scores the exact list the statement prints, so the two cannot drift apart. Tagging measured separately per entry type; every result carries an evidence basis and names any inert check |
| `shared/scripts/check_invoice_tag_coverage.mjs` | Gate CLI (`debtors:tag-check`) and portfolio sweep (`debtors:tag-check:all`), emitting `[CODE]_TAG_COVERAGE_[date].{json,md}` |
| `generate_statement_of_account.mjs` | Runs the gate and **refuses to write** on `BLOCKED` / `NOT_DERIVABLE_FROM_TXT` |
| `debenq_open_invoices.test.mjs` | Contract tests; the TWK002 case is a permanent regression fixture, and the Crd Note / Payment trust asymmetry is now pinned by test |
| `business_rules.md` §15 | Canonical rule, extending §3: two authority orders for "is this invoice settled?" (A remittance-backed, B pattern-only), the Σ(open) ≤ balance invariant, the prohibition on deriving an open list from payment tagging alone, and the requirement that a pattern-derived settlement claim name its basis |
| `DEBTORS_DOCTRINE.md` §5 | Invariant + tripwire (a remittance naming an open invoice reopens its status) |
| `SKILL_Human_Sources_Agent.md` §6.1 | Intake **records** the export posture and flags it when an invoice-level deliverable is expected — it does not reject the file |
| `SKILL_Debtor_Customer_Statement_From_TXT.md` §1, §3.1 | Gate is a mandatory pre-release step with a ratification procedure; `ALLOWED` explicitly means "no contradiction found", not verified |
| `SKILL_Payment_To_Invoice_Allocation.md` §4.8 | Open balances flagged as reconstructions; Crd Note / Payment asymmetry stated; gate required before allocating |
| `monthly-batch-erp-bridge-reconciliation/SKILL.md` §1, §7 | Schedule must be gated; anti-patterns include requesting a re-export to fix an allocation problem |

---

## Re-run

```bash
npm run debtors:tag-check:all                          # portfolio
npm run debtors:tag-check -- --debtor [CODE] --write   # one account, with artifacts
npm run debtors:test                                   # contract tests
```

Re-run the sweep whenever a new remittance batch is ingested and reconciled, or after any account's allocation-lane work lands — that is what moves an account off `NOT_DERIVABLE_FROM_TXT` into a real assessment, and it is likely to surface further `LIKELY_PAID` / `STALE_OPEN` invoices in the same class as TWK002's.

## Open items

| Item | Task |
| :--- | :--- |
| Eight accounts need a per-account decision on whether an invoice-level view is wanted, and pattern-lane work where it is | `H-016` |
| MD0003 advice lines to be extracted to CSV, then the R59,456.42 reconciled and ratified | `H-017` |
| Third remittance-backed account to be named and its advices dropped in, or the count confirmed as 2 | `H-018` |
