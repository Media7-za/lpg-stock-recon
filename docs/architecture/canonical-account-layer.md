# Canonical Account Layer (prototype)

Status: **architecture prototype**, one debtor (JEN001) wired end to end.
Not integrated into the React app; not a replacement for the existing v5 or
customer-statement generators. Proves the pattern — extending it to more
debtors, or into the app UI, is future work.

## The problem this solves

Before this layer, "what does JEN001 owe" had **three independent answers**
in this repo, each computed its own way:

1. `reconcile_debtor_v5_from_txt.mjs` — internal v5 sub-ledger statement.
   Needs `DATABASE_URL`. No trust gate on invoice-level detail.
2. `generate_statement_of_account.mjs` — customer-facing statement. TXT-only,
   no DB. Has an invoice-tag coverage gate the v5 generator doesn't.
3. `src/features/investigation-workspace` — a `KnowledgeBundle` (allocation
   graph: relationships, cases, entities) compiled by a third pipeline.

None of these read from each other. A change to how an invoice nets against
a payment has to be made (or drift) in up to three places. That's the
duplication this layer is meant to stop.

## The shape

```text
ERP DEBENQ TXT + config/statement_of_account.json
                    │
                    ▼
        canonical_account_model.mjs
     (buildCanonicalAccount — ONE adapter)
                    │
                    ▼
         Canonical Account (JSON)
    analysis/debtors/[CODE]/canonical/[CODE]_canonical_account.json
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
 render_internal_account_html.mjs   projectCustomerView()
   (reads canonical directly,          in canonical_account_model.mjs
    full detail, no filtering)     (the ONLY function either customer
        │                           renderer is allowed to read through)
        ▼                                    │
  Internal HTML                    ┌─────────┴─────────┐
  (reconciliation, data-           ▼                    ▼
   quality gate, custody,   render_customer_        render_customer_
   raw open-invoice list,   account_html.mjs         account_pdf.mjs
   full event ledger)       Customer HTML            Customer Markdown
                                                       → npx md-to-pdf →
                                                       Customer PDF
```

Run it:

```bash
npm run debtors:canonical-account -- --debtor JEN001 --as-at 2026-08-25 [--pdf]
```

Outputs land in `analysis/debtors/JEN001/canonical/`:
`JEN001_canonical_account.json`, `JEN001_internal_account.html`,
`JEN001_customer_account.html`, and (with `--pdf`)
`JEN001_customer_account.md` + `.pdf`.

## Reused, not reimplemented

`canonical_account_model.mjs` imports its TXT parsing, open-invoice
reconstruction, and invoice-tag coverage gate straight from
`debenq_open_invoices.mjs` — the same module `generate_statement_of_account.mjs`
already uses. It does not re-derive a balance. The one thing it *does*
independently is recompute a calendar-chronological running balance for the
event ledger, because the TXT's own row order is grouped by entry type
(all credit notes, then all invoices, then payments), not by date — the v5
generator already works around this the same way (see the comment above
`buildCanonicalAccount`'s event-sorting block). That recomputation is
self-consistency, not a second source of truth: it starts from
`ERP CURRENT BALANCE` minus the sum of all included events, so the last
event's balance always equals the ERP header exactly (asserted in
`canonical_account_model.test.mjs`).

Internal-only detail (ERP variance, sub-ledger tie, ingest gate) is read
from the already-generated v5 fixture
(`src/features/debtor-position-workspace/data/fixtures/[CODE].v5.json`)
rather than re-running the v5 generator, so this adapter has **no
`DATABASE_URL` dependency** — it degrades gracefully (reconciliation block
is simply absent) if no v5 fixture exists for a debtor yet.

## `AccountEvent` and `visibility`

Every real ledger row (invoice, credit note, payment, journal) becomes one
`AccountEvent`:

```text
AccountEvent
- id, date, type, reference, dnRef, lane (LPG | CYL | null)
- description, amount, balanceAfter
- sourceSystem, sourceReference
- visibility            // 'both' for every transaction event today
```

All transaction events are `visibility: 'both'` — a customer's own invoice
or payment is never a secret from them. What's internal-only is the
reconciliation *machinery* around those events (ERP-vs-TXT variance, ingest
gate, data-quality scoring), which is **not modelled as events at all** — it
lives in separate `reconciliation` and `dataQuality` blocks, both tagged
`visibility: 'internal'` at the block level.

### Why the open-invoice list is not a simple filter

This is the one place a naive "internal = everything, customer = filtered
subset" model breaks. ERP's invoice tagging is not trustworthy
(`business_rules.md` §3) — that exact defect billed TWK002 twice for 15
months (see `debenq_open_invoices.mjs`'s module header). So whether the
open-invoice table is safe to show a customer is a **gate result**,
recomputed on every build:

```js
canonical.openInvoices.customerSafe =
  coverage.gate !== 'BLOCKED' && coverage.gate !== 'NOT_DERIVABLE_FROM_TXT';
```

This mirrors the exact abort condition `generate_statement_of_account.mjs`
already uses. `projectCustomerView()` withholds the itemised table (falling
back to "verifying" language, balance still shown) whenever `customerSafe`
is false — never a static per-event flag, always the live gate result.

## PDF architecture

`render_customer_account_pdf.mjs` calls `projectCustomerView(canonical)` —
the identical function `render_customer_account_html.mjs` calls — renders it
to Markdown, then shells out to `npx md-to-pdf` with the existing
`statement_pdf.css` stylesheet (the same mechanism
`generate_statement_of_account.mjs --pdf` already uses; no new PDF
dependency introduced). Because both HTML and PDF are built from the same
projection call, they cannot independently drift into different versions of
the account — there is no second template that could disagree with the
first.

> Known environment limitation: in this sandboxed (root) container,
> `npx md-to-pdf`'s headless Chromium refuses to launch
> (`Running as root without --no-sandbox is not supported`). This is a
> pre-existing constraint of the tool in this environment — it would affect
> `generate_statement_of_account.mjs --pdf` identically — not something
> introduced here. `build_canonical_account_views.mjs` catches the failure
> and reports it rather than aborting the whole run; the Markdown output
> (verified correct) is written either way.

## Future integration (not built — the layer is shaped for it)

`sourceMetadata.sourceSystem` is already a field on the canonical account
(`'ERP-DEBENQ-TXT'` today). A POS or ecommerce adapter would be a second
function producing the same `AccountEvent` shape with a different
`sourceSystem`/`sourceReference`, merged into the same `events[]` array
before either projection runs. Neither renderer, nor `projectCustomerView`,
would need to change — they already only know about `AccountEvent` fields,
never about DEBENQ TXT specifically. That's the extension point section 8
of the architecture brief asks for; it isn't implemented because there is
only one source system in this repo today, and building a second one
without a second system to integrate would be speculative.

## What was deliberately not done

- **Not wired into `src/features/`** — this is scripts + static HTML/PDF
  output, matching how `generate_statement_of_account.mjs` already works.
  Making it a live React view is a follow-up, not part of proving the
  pattern.
- **Not extended past JEN001** — one debtor is enough to prove "one
  canonical source, two non-drifting projections" against real, previously
  hand-verified numbers (see `canonical_account_model.test.mjs`).
- **Did not touch `reconcile_debtor_v5_from_txt.mjs`,
  `generate_statement_of_account.mjs`, or the investigation-workspace
  `KnowledgeBundle`** — all three keep working exactly as before. This layer
  is additive.
