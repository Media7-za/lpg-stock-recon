# PRD: Chat-Driven Order Solicitation (MVP)

## 1. Problem

Sales/ops staff currently have no systematic prompt for *when* to call a customer for a repeat
order. Outreach happens on memory or ad hoc spreadsheets, so accounts that are due for
replenishment slip past their cycle and quietly churn. We already run an agent-first pattern for
the Debtors workspace (`.agent/AGENT_WORKFLOW.md`): the agent owns state and logic, the UI/chat is
just the surface. This MVP applies the same pattern to outbound order solicitation, using the
Supabase project this app already runs on — no new service, no new UI.

## 2. Goals

- Give an operator a same-day, prioritized call list without opening a dashboard.
- Let the operator log outcomes in plain English and have the database update itself
  (status, next predicted date, notes) — no forms.
- Reuse existing infrastructure (the same Supabase/Postgres project, Claude Code session) end to
  end — see §5 for why that turned out to mean `commercial_customers`, not the Prisma-modeled
  `accounts` table originally assumed here.

## Non-Goals (MVP)

- No Slack/Telegram bot, no SMS sending, no auth/roles beyond the single operator using this
  session. (Candidate for a later phase — see §8.)
- No automatic demand forecasting model. `avg_cycle_days` is a simple rolling average, not ML.
- No customer-facing surface. Everything here is internal-only, same boundary the debtors
  workflow already enforces (UI/chat never becomes the source of truth).

## 3. Users

Single role for MVP: the **operator** (sales/ops person making the calls), working directly in a
Claude Code (or equivalent) chat session.

## 4. Core Loop

Same three-step loop already proven in the debtors workflow, applied to solicitation:

1. **Push** — Operator: *"Show today's targets."* Agent queries `solicitation_queue` for
   `status = 'PENDING' AND predicted_due_date <= today`, joined to `commercial_customers` and (for
   display only, never for filtering) left-joined to the `commercial_customer_last_order` view
   (§5) — never `commercial_customers.last_order_date` directly, which is a writable cache that
   drifted from reality once already. Rows are ordered by how overdue each customer is. Agent
   renders **one target at a time** — name, contact, last order's LPG line items (deposits
   excluded — see §5), suggested script — and waits for that target's outcome before showing the
   next. (We deliberately chose one-at-a-time over a batch list: with prose-only replies that
   don't always name the customer, one-at-a-time removes any risk of misattributing a reply to the
   wrong target.)
2. **Action** — Operator calls/texts the customer, then replies in plain text
   (e.g. *"Ordered standard batch for Friday"*, *"Snooze 10 days, has stock"*, *"No answer, try
   tomorrow"*).
3. **Pull** — Agent parses the reply into one of a fixed set of intents (§6), writes the
   corresponding SQL update, and shows the next target. The write itself — status, dates, note —
   is the audit trail (see §5's note on `audit_log`).

The agent is the only writer. It never guesses past what the fixed intent set covers — anything
ambiguous falls into a `CLARIFY` branch that re-asks the operator instead of writing a bad row.

## 5. Data Model

**Revised from the original plan.** The PRD originally assumed we'd extend the Prisma-modeled
`Account` table. Once connected to the live Supabase project it turned out `accounts` has **zero
rows** — it's an unused table in this environment. The real, populated customer entity is
`commercial_customers` (business identity: name, lane, commercial status, contact) joined via
`commercial_customer_accounts` to one or more ERP `account_no`s (a business can span several ERP
accounts — e.g. one customer has an `active` account plus a separate `empties_deposit` account).
Solicitation anchors to `commercial_customers`, not `accounts`.

Two changes applied directly to the live Supabase project (migration `solicitation_mvp_prototype`,
raw SQL — not yet reflected in `prisma/schema.prisma`, which still only models `Account`):

```sql
-- extends the existing, already-populated commercial_customers table
alter table commercial_customers
  add column avg_cycle_days integer,
  add column last_order_date timestamptz,
  add column last_order_value numeric,
  add column contact_phone text;
  -- primary_contact and notes already existed on this table

-- new table
create table solicitation_queue (
  id uuid primary key default gen_random_uuid(),
  commercial_customer_id uuid not null references commercial_customers(id),
  predicted_due_date date not null,
  status text not null default 'PENDING', -- PENDING | ORDERED | SNOOZED | DECLINED
  notes text,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index solicitation_queue_status_due_idx on solicitation_queue (status, predicted_due_date);
```

This is **one new table**, not two — `SolicitationProfile` from the original draft was dropped
because `commercial_customers` already had (or now has) every field it would have contained.
`solicitation_queue` is 1-to-many with `commercial_customers` (a new row per reorder cycle,
preserving call history); the profile fields on `commercial_customers` are 1-to-1 by nature, so no
separate table was needed there.

**Audit trail:** the formal `audit_log` table exists but is FK-bound to `sessions` in a way that's
specific to the debtors workflow; wiring solicitation into it wasn't worth the coupling for an MVP.
Instead, every write records its own trail directly — `solicitation_queue.notes` holds the raw
operator outcome, `updated_at`/`last_contacted_at` timestamp it. Revisit a shared audit table if/when
solicitation goes multi-operator (§8, Phase 4).

**"Last order" line items (§ operator request):** the call brief shows the customer's most recent
order's LPG-only line items (not just a dollar value), sourced from `transaction_items` joined to
`item_classifications` on `stock_no`. That classification table is **incomplete** — some real LPG
SKUs (e.g. `9.3`, `19.3`, refill-suffix codes) aren't classified — so the filter is:
`business_bucket = 'LPG_CONTENT'` OR (`unclassified` AND `description ILIKE '%LPG%'` AND NOT
`description ILIKE '%CYLINDER DEPOSIT%'`). This was a deliberate simplification: last order only,
not a commonly-ordered aggregate — cheaper to compute and gives the operator a concrete, specific
script ("last time you ordered X and Y...") rather than a vague summary. Revisit an aggregate
fallback later for long-dormant accounts where the last order may be stale.

Grouping must be by **most recent matching date, not most recent doc_no** — this ERP sometimes
splits a single order into separate documents on the same date (one for LPG content, one for the
cylinder deposit), and tie-breaking on `doc_no` can silently select the deposit-only document,
producing an empty or wrong "last order" for a customer who did order that day. Found live during
the Tandoor simulation in this session.

**`commercial_customers.last_order_date` is not the source of truth.** It's a column written
directly by the `ORDERED` intent, and during live testing (a separate claude.ai chat session
exercising this same rulebook) it was caught showing dates for Tandoor and Impendle with **no
corresponding `transaction_items` row** — nothing kept it reconciled against the real ledger. Fixed
two ways: (1) reverted the two drifted values back to their real last-LPG-order dates (Tandoor →
2026-07-02, Impendle → 2026-06-11), and (2) added a view so "last order" is never trusted from a
stored column again:

```sql
create view commercial_customer_last_order as
select cca.commercial_customer_id,
       max(ti.tx_date) as last_lpg_order_date
from commercial_customer_accounts cca
join transaction_items ti on ti.account_no = cca.account_no
left join item_classifications ic on ic.stock_no = ti.stock_no
where (
    ic.business_bucket = 'LPG_CONTENT'
    or (ic.business_bucket is null and ti.description ilike '%LPG%' and ti.description not ilike '%CYLINDER DEPOSIT%')
  )
  and ti.qty > 0
group by cca.commercial_customer_id;
```

A view needs no refresh job — every read recomputes `MAX(tx_date)` live from `transaction_items`,
so there's no staleness window to manage and nothing that can drift by construction. The push query
(§4/§6) now joins this view for display instead of reading `commercial_customers.last_order_date`.
Tradeoff: recomputed on every read instead of an O(1) column lookup — trivial at the current
~169k-row scale; if the ledger grows large enough for that to matter, the fallback is a materialized
view refreshed on a schedule, not reverting to a manually-written column. The `ORDERED` intent still
writes `last_order_date` as a rough cache for other purposes, but nothing should display it as the
"last order" date going forward.

## 6. Operator Reply → Intent Mapping

The agent classifies each free-text reply into a closed set of intents before writing anything:

| Intent | Trigger examples | Effect |
|---|---|---|
| `ORDERED` | "ordered standard batch for Friday", "reorder $1,200" | queue row → `ORDERED`; `commercial_customers.last_order_date` = today; new queue row created at `today + avg_cycle_days` |
| `SNOOZE` | "snooze 10 days", "still has stock" | queue row → `SNOOZED`; `predicted_due_date` += N days (default 7 if unspecified) |
| `NO_ANSWER` | "no answer", "try again tomorrow" | queue row stays `PENDING`; `predicted_due_date` = tomorrow |
| `DECLINED` | "not reordering", "switched supplier" | queue row → `DECLINED`; `commercial_status` updated to a churn/dormant state, flagged for follow-up review |
| `UPDATE_CONTACT` | "Sipho isn't the contact anymore, it's Jane, 082...", "number changed to..." | updates `commercial_customers.primary_contact` / `contact_phone` directly. Not tied to a queue row — can be issued at any point in a session, doesn't advance or affect the queue. |
| `IGNORE_INDIVIDUAL` | "ignore - individual", "that's a person, not a business" | only valid on a `REVIEW_FLAGGED` queue row (§8a). `commercial_customers.commercial_status` → `excluded_not_business` (permanent); the flagged queue row is closed. Never resurfaces, including on future backfill runs. |
| `CONFIRM_BUSINESS` | "no, that's a real business", "keep it" | only valid on a `REVIEW_FLAGGED` queue row. Queue row → `PENDING` with a real `predicted_due_date` computed the normal way — joins the standard solicitation loop from that point on. |
| `CLARIFY` | anything that doesn't match the above with confidence | agent asks a follow-up question; nothing is written |

This table is the actual spec — not a suggestion the model improvises around. Adding a new intent
means adding a row here and a migration, not just hoping the prompt handles it.

## 7. Session Mechanics

- **Where it runs:** this Claude Code session (or any Claude Code CLI session with Supabase MCP
  tools), same as today. No new client to build.
- **How it talks to the DB:** via the Supabase MCP tools already available in this session
  (`execute_sql` for reads/writes, `apply_migration` for schema changes), matching the guidance
  already in the Supabase MCP instructions to inspect `list_tables` before schema changes — that
  inspection step is exactly what surfaced the `accounts`-is-empty / `commercial_customers`-is-real
  finding in §5, so it's load-bearing, not just a formality.
- **Prisma is not the source of truth for this feature yet.** The prototype tables live only as
  raw SQL applied directly to Supabase. Backfilling `prisma/schema.prisma` (adding
  `SolicitationQueue` and the new `commercial_customers` columns as a proper Prisma model) is
  follow-up work once the shape is validated, not a prerequisite for the MVP.
- **Seeding `avg_cycle_days` / `predicted_due_date`:** one-time backfill query derived from
  historical order gaps in `transaction_items`/`transaction_headers`, where available; otherwise a
  sane default (e.g. 30 days) that self-corrects after the first real `ORDERED` cycle.

## 8. Phasing

| Phase | Scope |
|---|---|
| **MVP (this PRD)** | One new table (`solicitation_queue`) plus new columns on `commercial_customers`, intent-mapping logic, Claude Code session as the only interface, manual "show today's targets" trigger. |
| **Phase 1b — customer coverage backfill** *(scoped, next up — see §8a)* | Onboard the other ~850 real ERP accounts into `commercial_customers`/`commercial_customer_accounts` so they're no longer structurally invisible to solicitation. Not started; full scope in §8a. |
| **Phase 2** | Scheduled daily push (cron/Routine) that pre-computes the day's queue instead of computing it on demand. |
| **Phase 3** | Slack/Telegram **or plain claude.ai chat** front-end for the same loop, if operators need to work from a phone instead of a terminal. A claude.ai chat with the Supabase connector enabled (Settings → Connectors) hits the same `execute_sql`/`apply_migration` tools this session uses — no CLI, no repo access needed, since the loop is 100% SQL against Supabase. Requires a paid claude.ai plan (custom connectors are gated to Pro/Max/Team/Enterprise). |
| **Phase 3a — context bootstrapping** *(done)* | A fresh chat session with only DB access has none of this document's context, and the Supabase project has 40+ tables — nothing stops it from anchoring on the wrong customer table the way this session initially assumed `accounts` before discovering it was empty. Solved with a `SOLICITATION_RULEBOOK` row in `app_config` (jsonb, mirroring the existing `RECON_SCORING_WEIGHTS` pattern in the debtors domain) that acts as a **table scope map**, not just a rules list: an `in_scope_tables` map (`commercial_customers`, `commercial_customer_accounts`, `solicitation_queue`, `transaction_items`, `item_classifications` — one line each on what it's for), an `explicitly_not_this_workflow` map (`accounts` — 0 rows, decoy; `customers` — unrelated WhatsApp-dispatch feature; `reconciliation_*`/`bank_*`/`allocation_*`/`match_*` — debtors domain), the intent table, the push-query shape, and the last-order LPG filter rule including the doc_no/tx_date trap discovered live in this session (a single order date can be split across separate content vs. deposit documents — tie-breaking on `doc_no` silently picks the wrong one). A claude.ai **Project** whose custom instructions say "read `app_config.SOLICITATION_RULEBOOK` before running any query" completes the bootstrap — every new chat in that Project inherits it, the rulebook stays correct even from a different client since it lives with the data, and updating it is an UPDATE statement, not a re-onboarding exercise. |
| **Phase 4** | Multi-operator support: rep-level queue partitioning (via existing `SalesRep` model), roles/auth. |

## 8a. Phase 1b Scope: Customer Coverage Backfill

**Objective:** onboard the ~850 real ERP accounts not currently in `commercial_customers` so solicitation coverage matches the actual customer base, not just the 4-account pilot. Scoped now, **not executed yet** — this is the plan, ready to run once the open questions below are answered.

**Steps:**

1. **Filter to accounts worth onboarding.** Only `account_no`s with at least one order matching the existing LPG-content filter (§5/rulebook) should get a `commercial_customers` row — some accounts in `transaction_items` carry only non-LPG lines (potatoes, onions, fertilizer show up in the ledger too; these are multi-line-of-business ERP accounts, not solicitation candidates). This leaves **596** candidates out of 850 unmapped accounts.

   **Sub-filter — exclude non-business accounts** *(decided 2026-07-28)*: a preview of the 596 found
   two categories that shouldn't get an outbound-solicitation call at all — generic bucket accounts
   (e.g. `CS0000 "Cash Sales - Pensioner"`) with no single person behind them, and accounts that
   read as individual/household names rather than businesses. Classified with:
   `generic_bucket` = name matches `%cash sale%`/`%cod account%`/`%walk in%`/`%general account%`/
   `%sundry%`/`%counter sale%` (**18** accounts, low ambiguity, hard-excluded automatically);
   `looks_like_individual` = no business-indicator keyword (a ~50-term list: `pty`, `cc`, `ltd`,
   `enterprise`, `wholesale`, `restaurant`, `market`, `farm`, etc.) AND the name is a plain 2–3-word
   pattern (**239** accounts — 40% of the 596, much bigger than expected from a first manual sample).
   Given that scale and that the heuristic is fuzzy (a real sole-proprietor business trading under an
   owner's name would false-positive here), the 239 are **flagged for a human review pass, not
   auto-excluded** — a wrong auto-exclude permanently drops a real business from ever being called,
   which is a worse failure than a few minutes of manual scanning. Remaining safe-to-backfill count
   pending that review: **339** confirmed businesses, +however many of the 239 clear review.
2. **Grouping — the hard part, and the one to get conservative about.** `account_no` isn't always 1:1 with a real business: Impendle Wholesale already spans 3 accounts (`active`, `historical`, `empties_deposit`). Default to **1 account = 1 commercial_customer** unless account names match exactly or near-exactly; do **not** auto-merge on fuzzy similarity. Under-grouping (two rows for one real business) is cosmetic and fixable later; over-grouping (one row wrongly serving two businesses) misattributes contact info and call history — a real operational mistake, not a cosmetic one. Flag near-duplicate names for human review instead of guessing.
3. **Compute `avg_cycle_days`** the same way as the pilot 4: median gap between distinct LPG order dates, excluding gaps under 3 days. Needs an explicit low-confidence fallback for accounts with too few order dates to trust a median (e.g., fewer than 3 gap observations) — flag those rather than writing a shaky number.
4. **Derive initial `commercial_status`** (`active_customer`/`win_back`/`dormant_customer`) using the
   canonical ratio rule *(decided and applied 2026-07-28)*: `ratio = (current_date -
   last_lpg_order_date) / avg_cycle_days`, via the `commercial_customer_last_order` view — `ratio
   <= 1.5` → `active_customer`; `1.5 < ratio <= 3` → `win_back`; `ratio > 3` → `dormant_customer`.
   This is a **standalone** rule, not one reverse-engineered from the pilot: checking the 4 pilot
   customers' original manually-set labels against their real ratios showed no consistent threshold
   existed — Siyaya was labeled `active_customer` at a 5.86x ratio, higher than the `win_back`
   (3.86x) and `dormant_customer` (3.43x) accounts. Rather than leave that inconsistency in place,
   all 4 pilot customers were reclassified under this rule (3 of 4 changed: Slindokuhle
   active→win_back, Tandoor win_back→dormant, Siyaya active→dormant). Apply the same rule to every
   Phase 1b backfill customer so classification is consistent across the whole customer base.
5. **Leave `primary_contact`/`contact_phone` null**, same as the pilot reset — operators fill them in on first real contact.
6. **Create `solicitation_queue` rows** for confirmed businesses using the same `commercial_customer_last_order` view + `avg_cycle_days` formula already in production — `status = 'PENDING'` as normal. For the flagged individual-looking accounts (§8a step 1 sub-filter), create the row with **`status = 'REVIEW_FLAGGED'`** instead — a new queue status that's invisible to the normal push query (which only selects `PENDING`), surfaced instead by a separate *"show flagged accounts"* command. The operator resolves each one inline with `IGNORE_INDIVIDUAL` (permanent exclusion — `commercial_customers.commercial_status` → `excluded_not_business`) or `CONFIRM_BUSINESS` (converts the row to a normal `PENDING` target). This is how review ownership works going forward *(decided 2026-07-28)*: the same operator running the call queue does it, inline, on an ongoing basis — not a separate one-time reviewer or scheduled batch pass. Any future account that trips the same individual-name heuristic lands in `REVIEW_FLAGGED` automatically and gets resolved the same way.

**Before running it for real:** preview the backfill (counts, sample rows, any flagged near-duplicate names) rather than writing ~850 rows straight to the live table in one shot — same caution the pilot's migrations went through.

**Open questions — status as of 2026-07-28:**
- ~~What counts as "worth onboarding"~~ — **settled**: any real LPG order ever (596 of 850).
- ~~Exact thresholds for `active`/`win_back`/`dormant`~~ — **settled**: standalone ratio rule, §5/§8a
  step 4 above.
- ~~Non-business accounts (generic buckets, individual names)~~ — **settled**: 18 hard-excluded, 239
  routed to the `REVIEW_FLAGGED` inline mechanism (step 6 above).
- ~~Who does the review, and on what cadence~~ — **settled**: the same operator running the call
  queue, inline, ongoing — via `REVIEW_FLAGGED`/`IGNORE_INDIVIDUAL`/`CONFIRM_BUSINESS` (§6, step 6
  above). Not a separate reviewer or scheduled batch.
- ~~`avg_cycle_days` fallback for low-confidence accounts~~ — **settled**: within the 339 confirmed
  businesses, 198 have a trustworthy median (≥3 gap observations) and 141 don't. Fallback for the
  141: **16 days**, the median `avg_cycle_days` of the 198 trustworthy peers — a population-derived
  number, not another guess. Self-corrects to the account's own real median once it accumulates
  enough order history, same as the original design intent.
- **Still open**: recency-window scope. Within the 339 confirmed businesses, 155 ordered within the
  last 2 years and 184 haven't — recommended reading: back the 155 now, treat the 184 as a separate
  "verify-still-trading, then win-back" batch rather than immediate `PENDING` targets, since a
  business dormant 2+ years may simply be closed rather than churned. Not yet decided.
- **Still open**: manual review process for the 17 near-duplicate-name grouping collisions (step 2)
  — distinct from the individual/business review above; this is about whether multiple account_nos
  belong to one real business, not whether the business itself is real.

## 9. Risks

- **Misclassified intent silently corrupts state.** Mitigated by the closed intent set (§6) and
  `CLARIFY` fallback — the agent never writes on low confidence, and every write is logged with the
  original text for audit/undo.
- **Single point of failure (one operator, one session).** Acceptable for MVP; Phase 4 addresses
  multi-operator.
- **`avg_cycle_days` drift** if customers change ordering patterns. Recompute as a rolling average
  on each `ORDERED` event rather than a fixed constant. **Update:** the placeholder values (30/21/
  14/60) from initial seeding have been replaced with real numbers computed from actual order gaps
  in `transaction_items` — median gap between distinct LPG order dates, excluding gaps under 3 days
  (same-week reissue noise, not real reorder cadence) and using median rather than mean so each
  customer's one big dormancy gap (the reason they're flagged `win_back`/`dormant_customer` in the
  first place) doesn't inflate their "normal" cadence. Real values: Impendle 14, Siyaya 7,
  Slindokuhle 9, Tandoor 7 — all notably more frequent than the original placeholder guesses.
  `solicitation_queue.predicted_due_date` was recomputed from these; as of today all four are
  already overdue under the corrected cadence.

## 10. Success Metrics

- % of `PENDING` queue items actioned (not left overdue) per week.
- Reduction in accounts crossing `predicted_due_date` by >2x `avg_cycle_days` with no order
  (churn proxy).
- Operator time per check-in session (should trend down as the loop replaces manual lookups).
