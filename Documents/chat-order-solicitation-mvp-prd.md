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
   `status = 'PENDING' AND predicted_due_date <= today`, joined to `commercial_customers`, ordered
   by how overdue each customer is. Agent renders **one target at a time** — name, contact, last
   order's LPG line items (deposits excluded — see §5), suggested script — and waits for that
   target's outcome before showing the next. (We deliberately chose one-at-a-time over a batch
   list: with prose-only replies that don't always name the customer, one-at-a-time removes any
   risk of misattributing a reply to the wrong target.)
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

## 6. Operator Reply → Intent Mapping

The agent classifies each free-text reply into a closed set of intents before writing anything:

| Intent | Trigger examples | Effect |
|---|---|---|
| `ORDERED` | "ordered standard batch for Friday", "reorder $1,200" | queue row → `ORDERED`; `commercial_customers.last_order_date` = today; new queue row created at `today + avg_cycle_days` |
| `SNOOZE` | "snooze 10 days", "still has stock" | queue row → `SNOOZED`; `predicted_due_date` += N days (default 7 if unspecified) |
| `NO_ANSWER` | "no answer", "try again tomorrow" | queue row stays `PENDING`; `predicted_due_date` = tomorrow |
| `DECLINED` | "not reordering", "switched supplier" | queue row → `DECLINED`; `commercial_status` updated to a churn/dormant state, flagged for follow-up review |
| `UPDATE_CONTACT` | "Sipho isn't the contact anymore, it's Jane, 082...", "number changed to..." | updates `commercial_customers.primary_contact` / `contact_phone` directly. Not tied to a queue row — can be issued at any point in a session, doesn't advance or affect the queue. |
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
| **Phase 2** | Scheduled daily push (cron/Routine) that pre-computes the day's queue instead of computing it on demand. |
| **Phase 3** | Slack/Telegram front-end for the same loop, if operators need to work from a phone instead of a terminal — reuses all of the above, only adds a thin messaging transport. |
| **Phase 4** | Multi-operator support: rep-level queue partitioning (via existing `SalesRep` model), roles/auth. |

## 9. Risks

- **Misclassified intent silently corrupts state.** Mitigated by the closed intent set (§6) and
  `CLARIFY` fallback — the agent never writes on low confidence, and every write is logged with the
  original text for audit/undo.
- **Single point of failure (one operator, one session).** Acceptable for MVP; Phase 4 addresses
  multi-operator.
- **`avg_cycle_days` drift** if customers change ordering patterns. Recompute as a rolling average
  on each `ORDERED` event rather than a fixed constant.

## 10. Success Metrics

- % of `PENDING` queue items actioned (not left overdue) per week.
- Reduction in accounts crossing `predicted_due_date` by >2x `avg_cycle_days` with no order
  (churn proxy).
- Operator time per check-in session (should trend down as the loop replaces manual lookups).
