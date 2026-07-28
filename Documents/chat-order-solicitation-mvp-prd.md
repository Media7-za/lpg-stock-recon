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
- Reuse existing infrastructure (Supabase/Postgres, Prisma schema, Claude Code session) end to end.

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

1. **Push** — Operator: *"Show today's targets."* Agent queries
   `solicitation_queue` for `status = 'PENDING' AND predicted_due_date <= today`, joined to
   `accounts`, ordered by how overdue each account is. Agent renders each as a call brief
   (name, contact, last order, suggested script).
2. **Action** — Operator calls/texts the customer, then replies in plain text
   (e.g. *"Ordered standard batch for Friday"*, *"Snooze 10 days, has stock"*, *"No answer, try
   tomorrow"*).
3. **Pull** — Agent parses the reply into one of a fixed set of intents (§6), writes the
   corresponding SQL update, and immediately shows the next target. Every write is logged to
   `audit_log` (table already exists in the schema) with the raw operator text preserved.

The agent is the only writer. It never guesses past what the fixed intent set covers — anything
ambiguous falls into a `CLARIFY` branch that re-asks the operator instead of writing a bad row.

## 5. Data Model

Extends the existing Prisma schema (`prisma/schema.prisma`) rather than inventing a parallel
schema. `Account` already exists for the debtors domain — solicitation adds sibling tables and a
handful of columns, joined by `account_id`.

```prisma
model SolicitationProfile {
  id              String    @id @default(cuid())
  accountId        String    @unique @map("account_id")
  contactName      String?   @map("contact_name")
  contactPhone     String?   @map("contact_phone")
  avgCycleDays     Int?      @map("avg_cycle_days")
  lastOrderDate    DateTime? @map("last_order_date")
  lastOrderValue   Decimal?  @map("last_order_value")
  active           Boolean   @default(true)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  @@map("solicitation_profiles")
}

model SolicitationQueue {
  id                String   @id @default(cuid())
  accountId         String   @map("account_id")
  predictedDueDate  DateTime @map("predicted_due_date")
  status            String   @default("PENDING") // PENDING | ORDERED | SNOOZED | NO_ANSWER | DECLINED
  notes             String?
  lastContactedAt   DateTime? @map("last_contacted_at")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([status, predictedDueDate])
  @@map("solicitation_queue")
}
```

`accounts.currentName` / `accounts.accountNo` already give us the customer identity; we don't
duplicate that data. `audit_log` (existing table) receives one row per operator reply: raw text,
parsed intent, and the resulting SQL diff.

## 6. Operator Reply → Intent Mapping

The agent classifies each free-text reply into a closed set of intents before writing anything:

| Intent | Trigger examples | Effect |
|---|---|---|
| `ORDERED` | "ordered standard batch for Friday", "reorder $1,200" | queue row → `ORDERED`; profile `last_order_date` = today; new queue row created at `today + avg_cycle_days` |
| `SNOOZE` | "snooze 10 days", "still has stock" | queue row → `SNOOZED`; `predicted_due_date` += N days (default 7 if unspecified) |
| `NO_ANSWER` | "no answer", "try again tomorrow" | queue row stays `PENDING`; `predicted_due_date` = tomorrow |
| `DECLINED` | "not reordering", "switched supplier" | queue row → `DECLINED`; profile `active` = false, flagged for follow-up review |
| `UPDATE_CONTACT` | "Sipho isn't the contact anymore, it's Jane, 082...", "number changed to..." | updates the profile's `primary_contact` / `contact_phone` directly. Not tied to a queue row — can be issued at any point in a session, doesn't advance or affect the queue. |
| `CLARIFY` | anything that doesn't match the above with confidence | agent asks a follow-up question; nothing is written |

This table is the actual spec — not a suggestion the model improvises around. Adding a new intent
means adding a row here and a migration, not just hoping the prompt handles it.

## 7. Session Mechanics

- **Where it runs:** this Claude Code session (or any Claude Code CLI session with Supabase MCP
  tools), same as today. No new client to build.
- **How it talks to the DB:** via the Supabase MCP tools already available in this session
  (`execute_sql` for queue reads/writes, `apply_migration` for the two new tables above), matching
  the guidance already in the Supabase MCP instructions to inspect `list_tables` before schema
  changes.
- **Seeding `avg_cycle_days` / `predicted_due_date`:** one-time backfill query derived from
  historical order gaps in `transaction_headers`, where available; otherwise a sane default (e.g.
  30 days) that self-corrects after the first real `ORDERED` cycle.

## 8. Phasing

| Phase | Scope |
|---|---|
| **MVP (this PRD)** | Two new tables, intent-mapping logic, Claude Code session as the only interface, manual "show today's targets" trigger. |
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
