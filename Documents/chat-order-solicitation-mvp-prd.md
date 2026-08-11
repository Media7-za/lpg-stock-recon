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
   wrong target.) **Confirmed 2026-08-04**: a backend handover document claimed a "batch of 5"
   was found workable in practice — checked with the other session that produced that behavior; it
   was a temporary speed-oriented workflow test, not a validated alternative to this design.
   One-at-a-time remains the actual spec; disregard that line in the handover doc.
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
view refreshed on a schedule, not reverting to a manually-written column.

**`ORDERED`/`LEAD_CONVERTED` no longer write `last_order_date` at all** *(decided 2026-07-31)*. The
column was kept as "a rough cache for other purposes" in the original version of this section, but
nothing in the live system actually reads it for any purpose — checked directly before removing the
write. It drifted twice independently (once caught by an external claude.ai test session, once
rediscovered live by a second session testing Siyaya, and in Impendle's case it drifted **stale in
the other direction** — a genuine new order came in that the cached write never picked up), each
time requiring a manual re-sync. A value nothing reads and that repeatedly needs manual correction
isn't a cache, it's a liability. The column itself wasn't dropped — `commercial_customers` is
Pricing Desk's table (§5a), not this MVP's to alter — solicitation simply stopped writing to it.

**Important limit this correction surfaces, stated precisely so it isn't overclaimed:** neither
`ORDERED` nor `LEAD_CONVERTED` writes to `transaction_items` (nor should they — that's the real ERP
ledger, populated by ERP sync, not something a chat session should fabricate rows into). This means
`commercial_customer_last_order` and `commercial_status` do **not** update immediately when an
operator logs an order — they only reflect it once the real ERP sync actually ingests that invoice,
on its own timing, outside this workflow's control. This was already true even when `last_order_date`
was being written (that write never touched `transaction_items` either, so the view was always the
one lagging). **What *is* immediate and fully within this workflow's control is queue routing**: the
`ORDERED`/`LEAD_CONVERTED` row closes and a new `PENDING` row is created at the correct future date
directly from `solicitation_queue`/`commercial_customers.avg_cycle_days`, with no dependency on
`transaction_items` catching up. Operationally, that's what actually matters — the customer
correctly stops appearing in "today's targets" until their real next due date, whether or not the
displayed `commercial_status` on their record has caught up yet.

### 5a. Cross-Feature Collision: Pricing Desk Owns `commercial_customers`

**Discovered 2026-07-29, mid-backfill, the hard way** — a real `commercial_status` CHECK constraint
rejected a write. `commercial_customers` is not a table this MVP owns; it's the backing store for
an entire other feature in this codebase, **Pricing Desk** (Commercial Decision Records, Customer
Intelligence — see `docs/Pricing-Desk/COMMERCIAL_GLOSSARY.md`), with its own formally documented
vocabulary that predates this PRD. (Checked for a second overlapping system too — an "OSS" Brain
with a task engine, `src/mcp.ts`, and an `ingest-erp` Edge Function described in a separate prior
agent session — but no matching files or tables exist anywhere in this repo/project; that system, if
real, lives elsewhere and isn't a live collision here.)

The actual `commercial_status` CHECK constraint allows exactly: `new_prospect`, `active_customer`,
`dormant_customer`, `win_back`, `churn_risk`, `lost`. Every status value this PRD invented up to
this point (`churned_lead`, `excluded_not_business`) is **not valid** — the first attempt to write
`churned_lead` to a real row failed outright. Rather than widen a constraint owned by another
feature, the ratio-rule tiers were remapped onto the real vocabulary — which turned out to be a
better fit, not just a workaround, since Pricing Desk's own glossary describes `win_back` as exactly
the "churned, actively being reactivated" concept this PRD had reinvented from scratch:

| This PRD's original invented value | → | Real Pricing Desk value | Meaning |
|---|---|---|---|
| `active_customer` (ratio ≤1.5) | → | `active_customer` | unchanged |
| `win_back` (ratio 1.5–3x) | → | **`churn_risk`** | "starting to slip" — better fit than the original name |
| `dormant_customer` (ratio >3x) | → | `dormant_customer` | unchanged |
| `churned_lead` (>90 days absolute, overrides ratio) | → | **`win_back`** | reuses the app's own term for reactivation targets |
| `excluded_not_business` (`IGNORE_INDIVIDUAL` target) | → | **`lost`** | closest available terminal state; also used for confirmed-dead leads (`LEAD_DEAD`, §6) — two different intents converging on one status, distinguished by which path wrote it and the row's `notes` |

Applied retroactively to the 4 pilot customers and the full Phase 1b backfill (§8a) — this is not a
future-facing correction, it's already live. `solicitation_queue.status` (`PENDING`/`LEAD`/etc.) is
**not** affected by this constraint — that table belongs to this MVP, not Pricing Desk, so it keeps
its own workflow vocabulary freely. Only `commercial_customers.commercial_status` was constrained.

**Standing lesson, not just a one-time fix:** `list_tables` was run at the very start of this PRD and
correctly found `commercial_customers` was real and populated — but nobody checked whether an
existing CHECK constraint or another feature's documentation governed its *values*, only its
*shape*. Any future column reused from an existing table needs both checked, not just one.

## 6. Operator Reply → Intent Mapping

**Standing write rule** *(added 2026-07-31, mandatory, applies to every intent below)*: every write
to `solicitation_queue` must set `notes` (the raw operator reply text, verbatim) **and**
`last_contacted_at = now()` **and** `updated_at = now()` — no exceptions. This table has no separate
`audit_log` (§5); these fields *are* the audit trail. This is stated once here, prominently, because
a fresh session (a real test, from a separate claude.ai chat via the connector, §8 Phase 3) correctly
derived the status/date logic for `NO_ANSWER` from the intent table below but **omitted `notes` and
`last_contacted_at`** — the effect column doesn't repeat this requirement for every row, and a
prose description can lose detail a literal template can't. Fixed two ways: this rule stated once
here rather than implied only by §5, and literal SQL templates for every intent now live in the
live `SOLICITATION_RULEBOOK` (`app_config.intent_sql_templates`) — copy-and-fill is harder to get
subtly wrong than deriving a query fresh from a natural-language summary each time.

The agent classifies each free-text reply into a closed set of intents before writing anything:

| Intent | Trigger examples | Effect |
|---|---|---|
| `ORDERED` | "ordered standard batch for Friday", "reorder $1,200" | queue row → `ORDERED`; new queue row created at `today + avg_cycle_days`. **No longer writes `commercial_customers.last_order_date`** (§5, decided 2026-07-31) — nothing reads it, and it repeatedly drifted. **Deliberately no quantity/line-item parsing** (decided 2026-08-03) — `notes` captures the reply verbatim, nothing structured. Out of scope until the Orders module integration below is real; a placed order becomes actual line items there, not here. |
| `SNOOZE` | "snooze 10 days", "still has stock" | **fixed 2026-07-31** (was `→ SNOOZED`, a status with no built-in revert path — silently permanent). Queue row **stays `PENDING`**, same as `NO_ANSWER` — only `predicted_due_date` += N days (default 7 if unspecified). |
| `NO_ANSWER` | "no answer", "try again tomorrow" | queue row stays `PENDING`; `predicted_due_date` = tomorrow |
| `DECLINED` | "not reordering", "switched supplier" | **fixed 2026-07-31** (was vaguely "a churn/dormant state", written before §5a's real vocabulary existed). Queue row → `DECLINED`; `commercial_customers.commercial_status` → `lost` — same terminal marker as `IGNORE_INDIVIDUAL`/`LEAD_DEAD`. |
| `UPDATE_CONTACT` | "Sipho isn't the contact anymore, it's Jane, 082...", "number changed to..." | updates `commercial_customers.primary_contact` / `contact_phone` directly. Not tied to a queue row — can be issued at any point in a session, doesn't advance or affect the queue. |
| `IGNORE_INDIVIDUAL` | "ignore - individual", "that's a person, not a business", "not a transactional account" | **broadened 2026-08-03** — valid from **any** desk, not just `REVIEW_FLAGGED` (was gated to review-desk-only; found too narrow when an operator correctly flagged `IAN MCALLISTER EMPTY`, `MAC010` — an individual-looking name that had slipped into the normal `PENDING` reorder desk rather than being caught at backfill time). Same reasoning as `ACCOUNT_ON_HOLD` being desk-agnostic: the real-world need can surface from anywhere, not just the review queue. Effect unchanged: `commercial_customers.commercial_status` → `lost` (permanent, §5a); queue row → `DECLINED`. Never resurfaces. **Note on naming:** this now catches multiple distinct reasons (individual name, non-transactional/internal account, etc.) under one intent and one `lost` status, distinguished only by `notes` free text, not a structured `reason` field. Considered and deliberately kept as one catch-all for now (2026-08-03) rather than splitting into separate reason-typed intents — revisit only if reason-level reporting is actually needed later. |
| `CONFIRM_BUSINESS` | "no, that's a real business", "keep it" | only valid on a `REVIEW_FLAGGED` queue row. Queue row → `PENDING` with a real `predicted_due_date` computed the normal way — joins the standard solicitation loop from that point on. |
| `LEAD_CONTACTED` | "contacted the lead, following up" | only valid on a `LEAD` queue row (§8a leads desk). Logged in `notes`; row stays `LEAD` with a follow-up date (`predicted_due_date` repurposed as next-follow-up-date for lead rows). |
| `LEAD_INTERESTED` | "wants pricing", "interested, call back Thursday" | only valid on a `LEAD` queue row. Row stays `LEAD`; follow-up date set from the reply (shorter default than a bare contact). |
| `LEAD_CONVERTED` | "placed a new order" | only valid on a `LEAD` queue row. Same effect as `ORDERED` (§ above) — row closes, a new `PENDING` row is created at `today + avg_cycle_days`. Queue routing is immediate and self-healing regardless of `last_order_date`/ERP timing (§5 — removed 2026-07-31, and neither this nor `ORDERED` writes to `transaction_items`); `commercial_status` itself only catches up to `active_customer` once real ERP sync ingests the actual invoice. |
| `LEAD_DEAD` | "closed down", "no longer trading" | only valid on a `LEAD` queue row. `commercial_status` → `lost` (permanent, same terminal state as `IGNORE_INDIVIDUAL`, §5a); queue row closes. This is how the leads desk resolves the "might just be closed" risk one call at a time instead of guessing at backfill time. |
| `ACCOUNT_ON_HOLD` | "on hold due to nonpayment", "credit hold", "account suspended" | *(added 2026-07-30)* valid from any desk. `solicitation_queue.status` → **`ON_HOLD`** — a new queue status, invisible to all three existing desks the same way `LEAD`/`REVIEW_FLAGGED` already are (no new exclusion logic needed elsewhere, since every push only ever selects its own status). Not an operator-cleared state — see the auto-lift mechanic below. |
| `CLARIFY` | anything that doesn't match the above with confidence | agent asks a follow-up question; nothing is written |

This table is the actual spec — not a suggestion the model improvises around. Adding a new intent
means adding a row here and a migration, not just hoping the prompt handles it.

**`ON_HOLD` auto-lift** *(decided 2026-07-30, this domain is collections/debtors territory that
solicitation doesn't otherwise track — see `.agent/AGENT_WORKFLOW.md` for the actual debtors
workflow)*: an account goes on hold for nonpayment, not because it stopped ordering — so lifting it
should follow the same self-healing pattern as everything else here (`ORDERED`, `LEAD_CONVERTED`),
not a manual "clear the hold" step. Before computing any push (`"show today's targets"` or `"show
leads"`), check every `ON_HOLD` row for a new `Invoice`-type row in `transaction_items` — any
product, not LPG-specific, since the signal is "they're transacting again," not a reorder cycle —
with `tx_date` after the hold's `updated_at`. If found, the row falls back through the normal
`commercial_status`/desk-routing logic automatically, same as any other customer. `solicitation_queue.status` was confirmed to have **no CHECK constraint** (checked directly, given
§5a's lesson about `commercial_customers.commercial_status`) before writing `ON_HOLD` to it — this
table is fully ours, unlike that one.

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
| **Phase 1b — customer coverage backfill** *(done — see §8a)* | Onboarded 226 confirmed businesses (230 real ERP accounts) into `commercial_customers`/`commercial_customer_accounts`. 165 routed to the new leads desk (`win_back`/`LEAD`), 61 to the normal reorder desk (`PENDING`). 308 individual-looking accounts sit in `REVIEW_FLAGGED`, resolved by the operator inline as they come up (§6). Full detail in §8a. |
| **Phase 2** | Scheduled daily push (cron/Routine) that pre-computes the day's queue instead of computing it on demand. |
| **Phase 3** | Slack/Telegram **or plain claude.ai chat** front-end for the same loop, if operators need to work from a phone instead of a terminal. A claude.ai chat with the Supabase connector enabled (Settings → Connectors) hits the same `execute_sql`/`apply_migration` tools this session uses — no CLI, no repo access needed, since the loop is 100% SQL against Supabase. Requires a paid claude.ai plan (custom connectors are gated to Pro/Max/Team/Enterprise). |
| **Phase 3a — context bootstrapping** *(done)* | A fresh chat session with only DB access has none of this document's context, and the Supabase project has 40+ tables — nothing stops it from anchoring on the wrong customer table the way this session initially assumed `accounts` before discovering it was empty. Solved with a `SOLICITATION_RULEBOOK` row in `app_config` (jsonb, mirroring the existing `RECON_SCORING_WEIGHTS` pattern in the debtors domain) that acts as a **table scope map**, not just a rules list: an `in_scope_tables` map (`commercial_customers`, `commercial_customer_accounts`, `solicitation_queue`, `transaction_items`, `item_classifications` — one line each on what it's for), an `explicitly_not_this_workflow` map (`accounts` — 0 rows, decoy; `customers` — unrelated WhatsApp-dispatch feature; `reconciliation_*`/`bank_*`/`allocation_*`/`match_*` — debtors domain), the intent table, the push-query shape, and the last-order LPG filter rule including the doc_no/tx_date trap discovered live in this session (a single order date can be split across separate content vs. deposit documents — tie-breaking on `doc_no` silently picks the wrong one). A claude.ai **Project** whose custom instructions say "read `app_config.SOLICITATION_RULEBOOK` before running any query" completes the bootstrap — every new chat in that Project inherits it, the rulebook stays correct even from a different client since it lives with the data, and updating it is an UPDATE statement, not a re-onboarding exercise. |
| **Phase 3b — Real application, built inside `lpg-stock-recon`** *(done — see below)* | Replaced the Claude-Code-session-as-the-only-interface model with a real UI + backend, built as a feature slice of this repo rather than a separate app, using conventions already established by `pricing-desk` and the existing Edge Functions. Decided 2026-08-11: "Let's use lpg-stock-recon" (not a new repo), and reuse existing roles (`Depot Manager`, `Invoice Clerk`) rather than add a new one — both explicit user calls, avoiding a second database/deploy target and any change to user-management. Built: `supabase/functions/solicitation` (Deno Edge Function, service-role client, reads `SOLICITATION_RULEBOOK` from `app_config` at request time rather than hardcoding business logic, exposes `/targets` `/leads` `/review` `/classify`) and `src/features/solicitation` (React feature slice — desk switcher, single-target console with a pressure-gauge overdue indicator, per-intent reply form, session log — ported from a working prototype and rewired from mock data to the new Edge Function), routed at `/solicitation`. The chat-driven SQL workflow described in the rest of this document still works unchanged — this is a second interface onto the same tables and the same rulebook, not a replacement. |
| **Phase 4** | Multi-operator support: rep-level queue partitioning (via existing `SalesRep` model), roles/auth. |
| **Flagged future direction (not designed, not scheduled)** — Orders module integration | An external "Orders" slice/system exists separately from this codebase. Desired: push a placed order from an `ORDERED`/`LEAD_CONVERTED` reply directly into that system's database, not just record it as a note in `solicitation_queue`. Noted 2026-07-31 as a sidenote — no interface, schema, or auth for that system has been identified yet; needs its own scoping pass (same rigor as §8a) before design, including: how that system is reached (its own Supabase project? an API? shared DB?), what "push an order" needs to contain, and how success/failure feeds back into this queue's `ORDERED` write. **Confirmed 2026-08-03**: quantity/line-item capture is explicitly bundled into this future work, not a separate gap — `ORDERED` stays free-text-only until this integration exists to actually receive structured order data. |

## 8a. Phase 1b Scope: Customer Coverage Backfill

**Objective:** onboard the ~850 real ERP accounts not currently in `commercial_customers` so solicitation coverage matches the actual customer base, not just the 4-account pilot. **Executed 2026-07-29 in two passes** — the first covered only the 230 `looks_like_business` accounts (226 customers, 65 `PENDING` + 165 `LEAD`); the 308 `REVIEW_FLAGGED`-bound accounts were designed but **not actually inserted** in that pass — a real execution gap, not just a documentation one, caught live when a customer asked about a specific real account (`MGC001`, "Maritzburg Golf Club") that turned out to exist nowhere in the system at all. A second pass closed the gap (see step 6 and the discovery note below it). **Final verified totals (queried directly, not hand-computed — see §5a's own lesson about
double-checking): 536 `commercial_customers` rows, 536 `solicitation_queue` rows — 70 `PENDING`, 172
`LEAD`, 294 `REVIEW_FLAGGED`.** All steps below reflect what was actually run, not just planned;
commercial-status values use the corrected vocabulary from §5a.

**Steps:**

1. **Filter to accounts worth onboarding.** Only `account_no`s with at least one order matching the existing LPG-content filter (§5/rulebook) should get a `commercial_customers` row — some accounts in `transaction_items` carry only non-LPG lines (potatoes, onions, fertilizer show up in the ledger too; these are multi-line-of-business ERP accounts, not solicitation candidates). This leaves **596** candidates out of 850 unmapped accounts.

   **Sub-filter A — exclude supplier accounts** *(decided and refined 2026-07-29)*: a name-based
   check first caught `Easigas (Pty) Ltd` and `Oryx`/`Oryx Energy` (LPG brand names themselves,
   clearly supplier/inter-company accounts, not customers) among the near-duplicate groups (§8a
   step 2). Verifying *why* confirmed a much stronger, name-independent signal: these accounts'
   `transaction_items.entry_type` is 100% `GRV`/`Deb Note` (goods **received** from a supplier) with
   **zero** `Invoice`/`Crd Note` entries (goods sold **to** a customer) — the ERP's own record of
   which side of the transaction this account is on. Applying that structurally across all 596
   candidates found **37 pure-supplier accounts** (`has_invoice_side = false`), not just the 7 caught
   by name — no ambiguity, no review needed, this is a clean binary split (zero "mixed" accounts
   found). Hard-excluded automatically. One manual exception on top: `EAS001` has real invoice
   activity (a single 2018 order) so fails the structural test, but is still excluded since it's
   literally the supplier's own company name — a judgment call, not a rule. **38 total** supplier
   exclusions (37 structural + 1 manual).

   **Sub-filter B — exclude/flag non-business accounts** *(decided 2026-07-28, corrected 2026-07-29)*:
   of the remaining 559 real customer-side accounts, `generic_bucket` = name matches `%cash sale%`/
   `%cod account%`/`%walk in%`/`%general account%`/`%sundry%`/`%counter sale%` (**18** accounts, low
   ambiguity, hard-excluded automatically). `looks_like_individual` = no business-indicator keyword
   (a ~50-term list: `pty`, `cc`, `ltd`, `enterprise`, `wholesale`, `restaurant`, `market`, `farm`,
   etc.) AND the name is a plain 1–3-word pattern. The original regex only matched 2–3 words and
   missed **single-word personal names** (`Richard`, `Ross`, `Vanessa`, `William` — found via the
   near-duplicate review, §8a step 2) — fixed to also catch 1-word names, which moved the count from
   239 to **308** (a big jump: over half the remaining pool). Given that scale and the heuristic's
   inherent fuzziness (a real sole-proprietor business trading under an owner's name would
   false-positive), these are **flagged for review via `REVIEW_FLAGGED`, not auto-excluded** (step 6
   below) — a wrong auto-exclude permanently drops a real business from ever being called, worse than
   the review overhead. **Confirmed business total: 230** (down from the original 339 once suppliers
   were removed, the individual-name regex was fixed, and Siyathuthuka Farms was manually excluded
   as stale — step 2 below).
2. **Grouping — the hard part, and the one to get conservative about.** `account_no` isn't always 1:1 with a real business: Impendle Wholesale already spans 3 accounts (`active`, `historical`, `empties_deposit`). Default to **1 account = 1 commercial_customer** unless account names match exactly or near-exactly; do **not** auto-merge on fuzzy similarity. Under-grouping (two rows for one real business) is cosmetic and fixable later; over-grouping (one row wrongly serving two businesses) misattributes contact info and call history — a real operational mistake, not a cosmetic one. Flag near-duplicate names for human review instead of guessing.

   **Resolution of the 17 near-duplicate-name groups** *(decided 2026-07-29)*: reviewed individually
   rather than built into automated tooling — only 38 accounts, a one-time list, not worth machinery.
   Initial manual read called 7 clean merges, but **staging the backfill before writing to the real
   tables caught 3 of those 7 as wrong** once the structural rules were applied consistently: `Al
   Riaz` is a real customer-side account but reads as an individual name (routed to `REVIEW_FLAGGED`,
   not merged); `Mathew New COD Account` matches the generic-bucket pattern (hard-excluded, not
   merged); `MZM Distribution (Pty) Ltd` is **100% GRV/Deb-Note** — a supplier, not a customer at all
   (sub-filter A). **Actual clean merges: 4** — DSB Chicken vs Fish, Emerald Flow (Pty) Ltd, Jaxx
   Restaurant, West Coast Fish & Chips. **Excluded as suppliers** (sub-filter A): Easigas (Pty) Ltd,
   Oryx/Oryx Energy, and `001WOS` — the "Works on Site" collision turned out to be a supplier account
   coincidentally sharing a name with the real customer account `CS0027`, which stands alone,
   unmerged. **Already routed to `REVIEW_FLAGGED`, no separate merge decision needed:** Jeanette Nagel
   (2 accounts) — an individual-name collision, resolved by sub-filter B regardless of grouping.
   **Manually excluded as stale:** Siyathuthuka Farms (`SIY002`, `SIYA00`) — confirmed **different,
   unrelated accounts** despite sharing a name (not a merge candidate), both excluded from the
   backfill per operator judgment (brief 2021–2022 overlap, tiny volume) — a one-off exclusion, not a
   change to the general `win_back` policy. Drops confirmed-business count from 232 to **230**.

   **Post-launch discovery (2026-07-29, live testing after the backfill went live):** the exact-name
   grouping rule missed real merges where the name varies by **"AND" vs "&"** or carries an
   **`EMPTIES`/`DEPOSIT` suffix** — neither normalized before the exact-match check. Found two: `L3
   Cash and Carry` / `L3 Cash & Carry Empties`, and (ironically, on a group already merged once for
   its *other* two accounts) a third sibling of West Coast Fish & Chips spelled `West Coast Fish and
   Chips`. Both produced a **false churn signal** — the sibling account looked like a 100+ day
   `win_back` lead on the leads desk while the real business was actively ordering every ~10–14 days
   under its other account. Not cosmetic under-grouping as originally assumed (§8a step 2 framing) —
   a real false signal an operator could act on incorrectly. Fixed by merging both (re-pointed the
   stale account into the real customer as an `empties_deposit` role, matching the Impendle pattern,
   and removed the redundant duplicate customer/queue rows). **Rule going forward:** before an
   exact-name match, normalize `AND`↔`&` and strip trailing `EMPTIES`/`DEPOSIT`/`DEPOSITS`/`SHELLS`/
   `CYLINDERS` — this is now how the whole `commercial_customers` table was re-scanned (found exactly
   these 2 pairs, no others), and should be the standard check for any future backfill batch or
   ongoing new-account onboarding, not just a one-time fix.

   **Post-launch discovery #2 (2026-07-29, same live-testing session):** a customer asked about a
   specific real account, `MGC001` "Maritzburg Golf Club" — real, active LPG order history (321
   units, last order 2026-06-18), yet it existed **nowhere** in the system: not `PENDING`, not
   `LEAD`, not even `REVIEW_FLAGGED`. Two compounding gaps, not one:
   - **Execution gap.** The `REVIEW_FLAGGED` mechanism (step 6) was fully designed and documented but
     the backfill actually run only inserted `looks_like_business` accounts — the 308
     individual-flagged accounts were never created in the database at all, not even in the review
     queue. Documentation described a mechanism that didn't exist yet.
   - **Keyword-list gap.** Separately, `MGC001` also fails the individual-name business-keyword check
     — `club` was never in the ~50-term list. Re-checking the full 308 against an expanded list
     (adding `club`, `society`, `trust`, `centre`, `college`, `foundation`, `spar`, and similar
     institutional terms) recovered **14** more real businesses this way, including several Spar
     supermarket branches — confirms the keyword list is a real point of failure, not just a
     completeness nicety, but also confirms the review queue is still necessary: the other 294 still
     need it even with the expanded list.
   Fixed by executing the actual missing backfill: 14 recovered accounts went through the normal
   business pipeline (merge-collision-checked against both each other and the existing 226 — none
   found), the remaining 294 got real `commercial_customers` rows with `solicitation_queue.status =
   'REVIEW_FLAGGED'`. One more bug surfaced and fixed during this pass: 6 of those 308 accounts share
   an exact duplicate name with another account in the same batch (`Al Riaz` ×3, `Richard` ×3,
   `William`/`Vanessa`/`Ross`/`Jeanette Nagel` ×2 each — the same individual-name collisions already
   known from §8a step 2) — a name-based join used to link staging rows back to their newly-created
   customer IDs collapsed 14 accounts onto only 6 distinct customer references before this was caught
   by comparing row counts. Re-paired correctly using each account's own `(last_order, avg_cycle_days)`
   instead of name. No accounts were mis-mapped in the live tables — caught in the staging step, same
   as every other error this backfill surfaced.

   **Post-launch discovery #3 (2026-07-29, the most serious one) — live, not staged, and it reached
   real data.** An operator asked why `MGC001`'s `avg_cycle_days` showed **8 days** when the visible
   order history didn't obviously support that number. Recomputing it directly found the real value
   is **10 days** — the stored 8 was wrong, and not by a rounding difference. Root cause: the second
   backfill pass (discovery #2 above) computed `avg_cycle_days` with:
   ```sql
   update phase1b2_staging s set avg_cycle_days = coalesce(c.median_cycle, 16), ...
   from cycle c
   where c.account_no = s.account_no or true
   ```
   `or true` makes the join condition always match, turning an intended per-account lookup into an
   unintentional cross join — `UPDATE ... FROM` with multiple matches per row resolves to whichever
   match Postgres evaluates last, so most of that batch's `avg_cycle_days` ended up as an **arbitrary
   other account's** median cycle, not its own. **Unlike every prior bug in this backfill, this one
   reached the live tables** — discoveries #1 and #2's mistakes were all caught in a staging table
   before any real row was touched; this one wasn't staged at the value level (only the row-linkage
   was staged and verified — the cycle computation itself was applied directly). Checked the blast
   radius: **301 of 536 customers (56%)** had a wrong `avg_cycle_days`. Fixed by recomputing correctly
   at the customer level (combining all mapped accounts per customer, the same method that worked for
   the first pass) and propagating the correction through `commercial_status` and
   `solicitation_queue.predicted_due_date`. Net effect: `win_back` count moved from 172 to 400 overall
   (the increase landed entirely inside `REVIEW_FLAGGED`, which is status-independent, so **no
   `PENDING`/`LEAD` queue-routing changes were actually needed** — verified by cross-tabulating queue
   status against commercial status post-fix, not assumed). **Standing lesson:** staging a write
   doesn't protect against a bug in the *value being computed*, only against bugs in *whether/where
   it gets written* — the row-count check that caught discovery #2's join bug wouldn't have caught
   this one, since every row still got exactly one value, just the wrong one. The only thing that
   actually caught it was an operator questioning a specific number against the visible evidence.

   **Post-launch discovery #4 (2026-07-29, immediately after #3) — a regression caused by fixing #3.**
   The blanket `predicted_due_date` recompute in #3's fix (`UPDATE ... WHERE status = 'PENDING'`, no
   further filter) clobbered two rows that had just been given a manual `NO_ANSWER` retry date
   ("tomorrow") for DSB Chicken vs Fish and Maritzburg Golf Club — their `notes` and
   `last_contacted_at` survived untouched, but `predicted_due_date` silently reverted to the
   ledger-computed value, undoing real operator input. Caught immediately on the next *"show today's
   targets"* (the stale row reappeared at the top instead of being held until tomorrow) and restored
   both to their correct retry date. **Standing lesson:** a bulk data-quality fix must exclude rows
   with recent operator-set state (`last_contacted_at` set, non-null `notes`) rather than
   unconditionally overwriting every row matching a status filter — operator input should always
   win over a recomputation, not the other way around. Any future bulk correction to
   `solicitation_queue` needs this exclusion built in from the start.
3. **Compute `avg_cycle_days`** the same way as the pilot 4: median gap between distinct LPG order dates, excluding gaps under 3 days. Fallback for low-confidence accounts (fewer than 3 gap observations): **16 days**, the median of the trustworthy-confidence peer population (§ open questions below) — a population-derived number, not a guess.
4. **Derive initial `commercial_status`** using the ratio rule, corrected to the real Pricing Desk
   vocabulary *(§5a — decided 2026-07-29, superseding the original 2026-07-28 version of this
   step)*: `ratio = (current_date - last_lpg_order_date) / avg_cycle_days`, via the
   `commercial_customer_last_order` view. `days_since_last_order > 90` → **`win_back`** (overrides
   the ratio — this is the leads-desk routing signal, see step 6). Otherwise: `ratio <= 1.5` →
   `active_customer`; `1.5 < ratio <= 3` → **`churn_risk`**; `ratio > 3` → `dormant_customer`. Applied
   to all 226 backfilled customer groups and retroactively to the 4 pilot customers.
5. **Leave `primary_contact`/`contact_phone` null**, same as the pilot reset — operators fill them in on first real contact.
6. **Create `solicitation_queue` rows**, split by desk: `commercial_status = 'win_back'` (90+ days
   inactive) → **leads desk**, `status = 'LEAD'`, `predicted_due_date` repurposed as next-follow-up
   date (set to today so they're immediately actionable); everything else → **reorder desk**,
   `status = 'PENDING'` with a real due date from `last_lpg_order_date + avg_cycle_days`. For the
   flagged individual-looking accounts (§8a step 1 sub-filter), the row is `status = 'REVIEW_FLAGGED'`
   instead of either desk — invisible to both normal pushes, surfaced only by *"show flagged
   accounts"*. Operator resolves inline with `IGNORE_INDIVIDUAL`/`CONFIRM_BUSINESS` (review desk) or
   `LEAD_CONTACTED`/`LEAD_INTERESTED`/`LEAD_CONVERTED`/`LEAD_DEAD` (leads desk) — all four leads-desk
   intents and the two-desk model are documented in §6. This is how review ownership and lead
   management both work going forward *(decided 2026-07-28, extended 2026-07-29)*: the same operator
   running the call queue does it, inline, ongoing — not a separate reviewer, not a scheduled batch.

**Executed 2026-07-29**, staged first in a scratch table to verify counts before writing to the real
tables (same caution the earlier pilot migrations went through) — see results at the top of §8a.

**Open questions — final status, all settled as of 2026-07-29:**
- ~~What counts as "worth onboarding"~~ — any real LPG order ever (597 of 850), minus 38 supplier
  accounts (§8a step 1 sub-filter A) = 559 real customer-side accounts.
- ~~Exact thresholds for status~~ — ratio rule using the real Pricing Desk vocabulary, §5a/step 4.
- ~~Non-business accounts~~ — 18 hard-excluded (generic buckets); **308** (not the earlier 239 —
  corrected when the individual-name regex was fixed to also catch single-word names) routed to
  `REVIEW_FLAGGED`.
- ~~Who does the review, and on what cadence~~ — the same operator, inline, ongoing, via
  `REVIEW_FLAGGED`/`IGNORE_INDIVIDUAL`/`CONFIRM_BUSINESS`.
- ~~`avg_cycle_days` fallback~~ — 16 days, the population median of trustworthy-confidence peers.
- ~~Recency-window scope~~ — **superseded by the two-desk model below**, rather than decided as a
  cutoff. Every confirmed business gets backfilled regardless of how stale; age determines which
  desk it lands in, not whether it gets onboarded at all.
- ~~Near-duplicate-name grouping (17 collisions)~~ — all resolved: 4 clean merges (corrected down
  from an initial 7 — 3 were reclassified as supplier/individual/generic once the structural rules
  were applied, catching errors in the original manual scan), 3 excluded as suppliers, 1 already
  handled by the individual-name path, 1 manually excluded as stale (Siyathuthuka Farms).

**Leads desk — churn as a separate pipeline, not a different script** *(superseded 2026-07-29 by
operator request; see below for what this replaced)*: an account with `days_since_last_order > 90`
gets `commercial_status = 'win_back'` (§5a), which overrides the ratio rule — 90 days of total
silence is a stronger, cycle-independent signal than a ratio that can flag a fast-cycle customer
"dormant" after just 3 weeks. Originally this was designed to be script-only (same `PENDING` queue,
different brief tone) — but a `win_back` customer isn't resolved in one call the way a reorder is,
and pre-judging the ~39% of the backfill population that's over 3 years dormant as "probably closed"
was exactly the kind of guess this PRD kept getting burned for making elsewhere. The fix: a real
second pipeline instead of a label.

- **Two desks, one table.** `solicitation_queue.status = 'LEAD'` (not `commercial_status` — that
  stays constrained to Pricing Desk's vocabulary, §5a) makes a `win_back` customer invisible to the
  normal *"show today's targets"* push, surfaced instead by a separate ***"show leads"*** command —
  same pattern as `REVIEW_FLAGGED`, applied to a second, structurally different lane of work.
- **Own intent set** (§6): `LEAD_CONTACTED`, `LEAD_INTERESTED`, `LEAD_CONVERTED`, `LEAD_DEAD` — a
  lead conversation isn't a one-call `ORDERED`/`SNOOZE`/`NO_ANSWER` cycle. `LEAD_CONVERTED` folds
  back into the normal reorder loop (same effect as `ORDERED`); `LEAD_DEAD` sets `commercial_status`
  to `lost` — this is how the "might just be closed" question gets answered per-account, one real
  call at a time, instead of guessed at backfill time with a recency cutoff.
- **Same operator, different turn.** No new role needed yet: reorder desk daily (due dates are
  time-sensitive), leads desk in dedicated sessions with slack time (leads have no real urgency
  ordering). The two commands enforce the split naturally — a session only ever surfaces one kind of
  brief. If a second person eventually takes leads, nothing about the data model changes; the desks
  are already separate.

Applied to the full Phase 1b backfill (§8a): 165 of 230 confirmed businesses landed in `win_back`/
`LEAD` — a much bigger fraction than the pilot's zero suggested, since none of the original 4
customers happened to cross 90 days. Queue routing self-heals immediately on `LEAD_CONVERTED` (§6);
`commercial_status` catches up to `active_customer` once real ERP sync ingests the actual invoice,
same limit noted in §5 — neither this workflow's writes nor the removed `last_order_date` column
ever touched `transaction_items` directly.

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
- **`ORDERED` executions that skip the follow-up `PENDING` insert silently drop a customer out of
  the reorder cycle entirely** — found 2026-08-04 via a backend handover document that flagged this
  as a suspected gap in the manual-testing session, then verified against live data rather than
  taken on faith: **all 15** `ORDERED` rows live in `solicitation_queue` at the time had zero
  follow-up row, confirming it as real and current, not a stale claim (the two `ORDERED` executions
  earlier in *this* session's history did include the insert correctly, but those specific rows were
  wiped during the later "make it live" reset — the 15 live ones are all from a separate session's
  continued, independent use of the same rulebook). Backfilled all 15 using each row's `updated_at`
  (when `ORDERED` was recorded) as the order-date proxy, since neither `last_order_date` nor
  `transaction_items` gives a better anchor (§5). **This is exactly the kind of error the standing
  write rule and SQL templates (§6) exist to prevent** — a session correctly identified the intent
  and updated the row's status, but didn't execute the template's second statement. Worth a periodic
  integrity check (any `ORDERED` row with no newer `PENDING` row for the same customer) rather than
  assuming template adherence from an `ORDERED` status alone.
- **The rulebook's `intent_sql_templates` are literal SQL text with `$variable` placeholders —
  fine for a Claude Code session composing and reviewing each query by hand, but unsafe to execute
  as-is from a real backend.** The Edge Function built in Phase 3b does not string-interpolate them:
  `replyText` is raw operator free text and would be a SQL-injection vector if substituted directly
  into a query string. Instead, `supabase/functions/solicitation/index.ts` reimplements each
  template's *effect* as parameterized `supabase-js` `.update()`/`.insert()` calls, still fetching
  the rulebook at request time (to validate the intent key exists), but never executing rulebook
  text as SQL. Any future change to an `intent_sql_templates` entry must be mirrored by hand in that
  file's `classify()` switch — the rulebook is the source of truth for *what* each intent does, not
  something the backend can safely eval directly.

## 10. Success Metrics

- % of `PENDING` queue items actioned (not left overdue) per week.
- Reduction in accounts crossing `predicted_due_date` by >2x `avg_cycle_days` with no order
  (churn proxy).
- Operator time per check-in session (should trend down as the loop replaces manual lookups).

## 11. Related Feature: Payment Collections (Outstanding Payments)

**Not part of the solicitation loop.** Requested 2026-08-11 by the operator: "certain customers'
accounts are outstanding for payment, not related to or solicitation, but I would like it to be
handled just like how we handle reviews, leads, etc." — i.e. reuse the desk/intent-panel/session-log
*interaction pattern* this MVP established, without conflating collections state into
`solicitation_queue` or `commercial_status` (which stays constrained to Pricing Desk's vocabulary,
§5a). Built as a fully separate table, Edge Function, and route — `/payment-collections`, its own nav
entry — that happens to look and behave like a fourth desk.

**Decisions, asked directly rather than assumed (all confirmed with the operator 2026-08-11):**
- **Data source:** manual only for now — an admin panel where amounts due and a statement-of-account
  file are entered by hand. Not derived from the existing Debtors/aged-debt tables (out of scope for
  now, could be revisited later).
- **Relationship to the existing `ACCOUNT_ON_HOLD` intent:** explicitly *not* reused. `ACCOUNT_ON_HOLD`
  stays as-is (silent, auto-lifting on a new `transaction_items` invoice row, §6) for other hold
  reasons. This is a separate status domain on a separate table.
- **One running balance per customer:** `outstanding_payments.commercial_customer_id` is `unique`.
  Entering a new amount for a customer who already has a record upserts it (new amount, new statement,
  status reset to `OUTSTANDING`) rather than creating a second open row.
- **Auto-return: manual only.** Unlike `ACCOUNT_ON_HOLD`/`ORDERED`/`LEAD_CONVERTED`, there is no
  self-healing check against `transaction_items`. A record only leaves the desk when an operator
  explicitly logs "Payment received" — a new invoice appearing doesn't imply the *outstanding* amount
  was paid.
- **Access:** same role gate as the rest of Solicitation (`Depot Manager`, `Invoice Clerk`) — no new
  role, consistent with the earlier "2." decision for Solicitation itself.

**Schema** (`outstanding_payments`, migrated 2026-08-11):
`id, commercial_customer_id (unique, fk -> commercial_customers), amount_due numeric(12,2),
statement_url, statement_filename, status (OUTSTANDING|PAYMENT_PLAN|ESCALATED|PAID, CHECK
constraint), follow_up_date, notes, last_contacted_at, created_at, updated_at`. RLS disabled, matching
`solicitation_queue`'s existing pattern — access is mediated entirely by the Edge Function's
service-role key, same as solicitation. Statement-of-account files live in a new public Storage
bucket, `payment-statements`.

**Backend:** `supabase/functions/payment-collections/index.ts` — `GET /customers` (search, for the
admin form's picker), `GET /records` (desk list, excludes `PAID`), `POST /records` (admin
create/upsert — accepts a base64-encoded file inline in the JSON body and uploads it server-side,
since client-side Storage uploads require a real authenticated session and the dev `bypass_auth_role`
flow doesn't have one — same reasoning that already governs how the Solicitation Edge Function reads
`commercial_customers`, which requires `auth.role() = 'authenticated'` per its RLS policy), and
`POST /records/classify` for the four outcomes below.

**Outcomes** (all four requested by the operator, none deferred):
- `PAYMENT_RECEIVED` → `status = PAID`, drops off the desk permanently.
- `STILL_OUTSTANDING` → stays `OUTSTANDING`, `follow_up_date` pushed forward (default 7 days).
- `ESCALATED` → `status = ESCALATED`, stays visible, flagged for a manager.
- `PAYMENT_PLAN_AGREED` → `status = PAYMENT_PLAN`, `follow_up_date` set to the agreed check-in date
  (default 14 days).

**Frontend:** `src/features/payment-collections/` — same feature-slice shape as `solicitation`
(types/lib/state/components), an admin entry form (debounced customer search, amount, file upload),
and a desk console styled identically to the Solicitation console (amount due replaces the
pressure-gauge overdue indicator as the salient number, same badge/intent-panel/session-log
conventions) so operators get a consistent interaction model across both desks despite the backends
being fully independent.
