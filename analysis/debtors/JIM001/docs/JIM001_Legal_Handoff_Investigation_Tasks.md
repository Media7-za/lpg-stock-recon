# JIM001 — Legal Handoff Investigation Tasks

**Purpose of this document:** JIM001 is going to legal for collections. Before that happens, every item in the claimed balance needs to be either independently provable, or explicitly excluded. This document is the checklist that gets you from "we're confident because the numbers add up" to "here's the evidence." Assumes you already know JIM001's basic situation — this is about what to do next, not a history lesson.

**How to use this:** Work top to bottom — the order is priority order, not just a list. For each task, either bring back the evidence requested, or confirm it doesn't exist. Both are valid outcomes; the point is to know which one you're in, not to assume the best case.

**If you're working through this with a Claude Code session open on this repo:** ask it to open this file and walk you through one task at a time. It has access to the account's data and can pull specific figures, dates, and documents as you go — you don't need to run queries yourself. Tell it which task you're on and what you found; it should record the outcome in the format shown below.

---

## Before you start: two facts you need, not history

1. **`monthly_lpg_insights.csv` is known-stale for 2025-06 and 2026-03.** The current yearly reports are correct for those months, the CSV isn't. If anything you're shown quotes the CSV for those two months without flagging this, ask for the yearly report figure instead.
2. **The 2021 yearly report is factually wrong about October, November, and December** — it says all three were "completely skipped." They weren't; two of them have small partial payments that happen to offset each other. This is already corrected in the Bridge review, but don't let an old copy of the 2021 report resurface as if it were still authoritative.

---

## Priority 1 — The actual claim: 2025–2026 unpaid invoices

**Why this comes first:** this *is* the amount being claimed. Nothing else on this list changes the number being pursued — this is the only section that does.

Unpaid months currently on record: **2025 — Jan, Feb, Apr, May, Jun, Dec. 2026 — Jan through May.**

For each invoice in these months:

| What to confirm | How | Outcome if confirmed | Outcome if not |
|---|---|---|---|
| Delivery actually happened | Delivery note / driver record for that invoice | Stays in claim | Flag — do not claim an undelivered invoice |
| No client dispute on record | Correspondence, complaint log, any prior communication with this client | Stays in claim | Flag for legal review before including — a disputed invoice needs a different handling path |
| Pricing matches agreed contract rate | Compare invoice line rate to the client's rate agreement | Stays in claim | Flag — a pricing error needs correcting before the amount is final |

**Recording the outcome:** for each invoice, note `CONFIRMED_CLAIMABLE` or `FLAGGED — [reason]` against its doc number. Anything flagged doesn't get silently dropped or silently kept — it goes to whoever owns the legal-handoff decision for a call.

---

## Priority 2 — Historical residuals (small, but they're currently `ASSERTED` not `PROVEN`)

**Why this is lower priority:** these don't add to the amount being claimed — they're old, small, and already settled in substance. The only reason to touch them at all is that an opposing lawyer could point at an unproven historical gap to try to undermine confidence in the account's numbers generally, even though it doesn't change what's owed today.

| Item | Amount | What would prove it | Where to look |
|---|---:|---|---|
| Oct 2021 shortfall / Nov 2021 overpayment (mirror pair) | R399.91 each way | A bank deposit reference for the Nov 2021 payment (doc `12719`, paid 2022-01-31) naming what it was for | Bank statement for that period |
| Dec 2021 residual | R239.48 | Same — a reference for the payment that mostly-but-not-fully covered December | Bank statement for that period |

**Decision needed from you, not something to resolve unilaterally:** is R639.79 (both items combined) material enough to spend time chasing bank records from 2021–2022, or immaterial enough to just note as "known, small, unproven, not pursued" and move on? There's no universally correct answer here — record whichever you decide, and why, so it's not silently forgotten or silently assumed resolved.

---

## Priority 3 — 2024 pooled settlement window

Six payments jointly cleared eight months of invoicing (Apr–Nov 2024) with no clean single-month attribution. This is currently a reconstructed pattern (`ASSERTED`), not confirmed against remittances.

**What would help:** remittance advices for those six payments, if the client sent any at the time. If none exist, this stays `ASSERTED` — that's an acceptable place for it to sit, since (like Priority 2) it's historical and already fully settled in substance, not part of the current claim.

---

## What "ready for legal" looks like

- Every Priority 1 invoice is `CONFIRMED_CLAIMABLE` or explicitly `FLAGGED` with a resolution
- A materiality decision has been made and recorded for Priority 2 (chase it, or explicitly don't)
- Priority 3 is noted as `ASSERTED` if it can't be upgraded — this is fine, just needs to be stated, not silently omitted
- The final claimed balance is built **only from `CONFIRMED_CLAIMABLE` items** — nothing `ASSERTED`/`UNASSESSED` gets folded into the number without an explicit decision to include it and accept that risk
- A separate, clean client/legal-facing statement is generated from that confirmed set — not the internal Bridge review or `reconciliation_status.csv`, which are working documents full of caveats that shouldn't go external

## If something can't be resolved

Not every task will have a clean answer — some records won't exist, some clients won't respond, some old bank statements may be unrecoverable. That's a normal outcome, not a failure of the process. What matters is that the gap is *recorded as a decision* (excluded from claim, or included with a noted risk) rather than left ambiguous. An explicit "we couldn't prove this, so we're not claiming it" is a stronger position going into legal than a number that quietly includes something nobody actually checked.

**When in doubt about what standard of proof is actually required for this jurisdiction/claim type, that's a question for legal counsel directly — this document tells you what's currently provable and what isn't, not what threshold legal needs it to clear.**
