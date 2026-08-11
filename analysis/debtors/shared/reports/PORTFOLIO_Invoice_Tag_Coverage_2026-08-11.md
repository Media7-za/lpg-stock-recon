# Portfolio — invoice tag coverage sweep (2026-08-11)

**Trigger:** TWK002 was found billing a customer for invoices 42468 / 42470, paid 15 months earlier, because ERP had settled them with an untagged payment slice (`TWK002_Stale_Open_Invoices_2026-08-11.md`). The operator asked for the risk to be addressed across all processes rather than patched on one account, so the new gate was run over the whole portfolio.

**Command:** `npm run debtors:tag-check:all`

---

## Result

| Debtor | Gate | Settlement rows tagged | Open invoices | Invariant | Blocking reason |
| :--- | :--- | ---: | ---: | :--- | :--- |
| BR0001 | UNUSABLE_EXPORT | 0% | 75 | n/a | EXPORT_LACKS_ALLOCATION_DETAIL |
| IVE001 | UNUSABLE_EXPORT | 0% | 59 | n/a | EXPORT_LACKS_ALLOCATION_DETAIL |
| JEN001 | UNUSABLE_EXPORT | 0% | 100 | n/a | EXPORT_LACKS_ALLOCATION_DETAIL |
| MD0003 | **BLOCKED** | 94.2% | 22 | **BREACHED** (R59,456.42) | OPEN_LIST_OVERSTATES_ACCOUNT |
| MON001 | UNUSABLE_EXPORT | 0% | 44 | n/a | EXPORT_LACKS_ALLOCATION_DETAIL |
| MOZ002 | UNUSABLE_EXPORT | 0% | 120 | n/a | EXPORT_LACKS_ALLOCATION_DETAIL |
| RED001 | UNUSABLE_EXPORT | 0% | 54 | n/a | EXPORT_LACKS_ALLOCATION_DETAIL |
| SA0001 | UNUSABLE_EXPORT | 0% | 166 | n/a | EXPORT_LACKS_ALLOCATION_DETAIL |
| TAN001 | UNUSABLE_EXPORT | 0% | 137 | n/a | EXPORT_LACKS_ALLOCATION_DETAIL |
| TWK002 | ALLOWED | 80% | 11 | PASS | — |

**TWK002 is the only account in the portfolio with a customer-ready open-invoice list.** It is also the only account where the settlement-discount reconciliation work has actually been done — the two facts are related.

---

## Finding 1 — eight exports carry no allocation detail at all

Eight of the ten debtor statement TXTs were exported from ERP with the allocation-detail option off. The file header records it:

```text
"EXCLUDE:","ALLOCATION DETAIL"
```

With that flag the `INVNO` column is blank on **every** row, so no payment or credit note names the invoice it settles. The consequence is stronger than "unreliable": for these accounts an open-invoice list cannot be derived at all. What the reconstruction produces instead is *every invoice ever raised in the export window*, since nothing can ever be netted off — which is why BR0001 shows 75 "open" invoices and SA0001 shows 166.

This does **not** affect:
- the ERP `CURRENT BALANCE` header, which remains ground truth for what each account owes,
- balance and ageing work driven by the running-balance column,
- the v4/v5 sub-ledger statements, which route payments by lane and never read `INVNO`.

It **does** invalidate any open-invoice list, statement of account, or payment-allocation result built from these files.

**Remedy:** re-export with allocation detail included — `H-016`. Nothing in the repo can compensate for tagging that was never exported.

## Finding 2 — MD0003 over-states by R59,456.42

MD0003's export *does* carry allocation detail (94.2% of settlement rows name an invoice), so this is the TWK002 failure mode rather than an export defect: individual settlement slices went out untagged.

| Measure | Value |
| :--- | ---: |
| Σ open invoices (22) | R78,309.78 |
| ERP CURRENT BALANCE | R18,853.36 |
| **Over-stated by** | **R59,456.42** |
| Untagged credits | R65,474.71 across 9 rows |
| Opening BALANCE B/F | R52,607.52 |

The list itemises R59,456.42 more debt than the account owes, which is proof that settled invoices are being carried as open. Sending MD0003 this list would demand payment for debt already paid.

**Remedy:** reconcile remittance-by-remittance to establish which invoices the untagged credits cleared, then ratify them into `closedInvoiceOverrides` — `H-017`. MD0003 already has remittance PDFs in `raw/Remittance/` and a manifest, so the evidence exists.

## Note on tagging percentage

TWK002 passes at 80% tagged; MD0003 fails at 94.2%. The percentage is context, not a verdict — what matters is whether the untagged credits happen to correspond to invoices inside the export window. Only the invariant answers that.

---

## What changed to prevent recurrence

| Change | Effect |
| :--- | :--- |
| `shared/scripts/debenq_open_invoices.mjs` | Shared open-invoice model + risk analysis. The gate scores the exact list the statement prints, so the two cannot drift apart |
| `shared/scripts/check_invoice_tag_coverage.mjs` | Gate CLI (`debtors:tag-check`) and portfolio sweep (`debtors:tag-check:all`), emitting `[CODE]_TAG_COVERAGE_[date].{json,md}` |
| `generate_statement_of_account.mjs` | Runs the gate and **refuses to write** on `BLOCKED` / `UNUSABLE_EXPORT` |
| `debenq_open_invoices.test.mjs` | 23 contract tests; the TWK002 case is a permanent regression fixture |
| `business_rules.md` §15 | Canonical rule: open-invoice lists are hypotheses; the Σ(open) ≤ balance invariant; exports must include allocation detail |
| `DEBTORS_DOCTRINE.md` §5 | Invariant + tripwire (a remittance naming an open invoice reopens its status) |
| `SKILL_Human_Sources_Agent.md` §6.1 | Intake now rejects an export carrying `EXCLUDE: ALLOCATION DETAIL` — stops the defect at the door |
| `SKILL_Debtor_Customer_Statement_From_TXT.md` §3.1 | Gate is a mandatory pre-release step with a ratification procedure |
| `SKILL_Payment_To_Invoice_Allocation.md` §4.8 | Open balances flagged as reconstructions; gate required before allocating |
| `monthly-batch-erp-bridge-reconciliation/SKILL.md` §1, §7 | Schedule must be gated; two new anti-patterns |

---

## Re-run

```bash
npm run debtors:tag-check:all                          # portfolio
npm run debtors:tag-check -- --debtor [CODE] --write   # one account, with artifacts
npm run debtors:test                                   # contract tests
```

Re-run the sweep after `H-016` lands: the eight re-exported accounts will move off `UNUSABLE_EXPORT` and get their first real assessment, which is likely to surface further `LIKELY_PAID` / `STALE_OPEN` invoices in the same class as TWK002's.
