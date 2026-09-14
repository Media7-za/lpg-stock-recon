# JIM001 — Legal Handoff Investigation Tasks

**Purpose of this document:** JIM001 is going to legal for collections. Before that happens, every item in the claimed balance needs to be either independently provable, or explicitly excluded. This document is the checklist that gets you from "we're confident because the numbers add up" to "here's the evidence." Assumes you already know JIM001's basic situation — this is about what to do next, not a history lesson.

**How to use this:** Work top to bottom — the order is priority order, not just a list. For each task, either bring back the evidence requested, or confirm it doesn't exist. Both are valid outcomes; the point is to know which one you're in, not to assume the best case.

**If you're working through this with a Claude Code session open on this repo:** ask it to open this file and walk you through one task at a time. It has access to the account's data and can pull specific figures, dates, and documents as you go — you don't need to run queries yourself. Tell it which task you're on and what you found; it should record the outcome in the format shown below.

---

## Before you start: three facts you need, not history

1. **`monthly_lpg_insights.csv` was stale for 2025-06 and 2026-03 as of the original Bridge review; 2025-06 is now fixed and PROVEN, not just corrected.** A raw ERP transaction export (`raw/DEBENQ_CURRENT.TXT`, provided 2026-09-14) settles doc 40746 directly — the real ERP ledger tags it against 4 named July-2025 invoices by invoice number, not June's. This is the strongest evidence tier this account has anywhere short of an actual customer remittance advice. **2026-03 (doc 44555) is still open** — and the same raw export actually *weakens* the March-2026 reading rather than helping it: that reading's supposed "ERP invoice-level allocation" turns out not to exist in the real ERP at all (the real ledger shows this payment untagged to any invoice). See the dedicated note below. If anything you're shown disagrees with the current CSV on either month, re-check which version it's reading from.
2. **The 2021 yearly report is factually wrong about October, November, and December** — it says all three were "completely skipped." They weren't; two of them have small partial payments that happen to offset each other. This is already corrected in the Bridge review, but don't let an old copy of the 2021 report resurface as if it were still authoritative.
3. **Jan and Feb 2025 were also wrongly showing as unpaid — this is fixed too.** They looked unpaid because two payments (docs 38846 and 39812) were sitting in the ledger unassigned to any month. An invoice-level check found they split cleanly across exactly those two months to the cent — see below. This changes the Priority 1 claim amount: it's *smaller* than the original unpaid-months list implied.

---

## Priority 1 — The actual claim: 2025–2026 unpaid invoices

**Why this comes first:** this *is* the amount being claimed. Nothing else on this list changes the number being pursued — this is the only section that does.

Unpaid months currently on record (corrected — Jan/Feb 2025 removed, see fact 3 above): **2025 — Apr, May, Jun, Dec. 2026 — Jan, Feb, Apr, May.** 2026-03 is `PARTIALLY_SETTLED` but disputed — see the note below before treating any part of it as settled or as an additional unpaid amount.

**Checked and closed: is there uncaptured cash sitting behind any of these months, the way there was for Jan/Feb 2025?** No. Every payment in the ledger that isn't currently assigned to a month is from 2018–2020 — there is nothing unassigned anywhere near 2025 or 2026. Concretely: the payment sequence runs 40063 (settles Mar 2025) → 40746 (settles Jul 2025) with nothing in between, and 43199 (settles Nov 2025, posted 2026-02-05) → 44555 (disputed, see below) with nothing in between either. So Apr, May, Jun, and Dec 2025 and Jan, Feb, Apr, May 2026 are genuinely unpaid — not just unassigned — and can proceed through the rest of Priority 1's checklist as real claim items.

**Open item — doc 44555 / 2026-03:** this payment (R11,666.12) either settles March 2026 in full minus a R271.44 shortfall, or settles December 2025 in full instead. The March-2026 reading was originally attributed to "the ERP's own invoice-level allocation" — **that turned out to be wrong.** The raw ERP export (fact 1 above) shows doc 44555 with a blank invoice-tag field: it is not actually allocated to any invoice in the real ERP, March-2026's included. So the March-2026 reading now has no real evidentiary basis at all, while December 2025 still has the aggregate-total match (an internal workbook computation, not a remittance advice — still not proof, but it's the only reading left with any support). This doesn't confirm December 2025 — it just means March 2026 is no longer a competing, equally-supported alternative. Don't include this payment's month in the claim as settled fact either way; treat both December 2025 and March 2026 as still-open for this specific payment until an actual remittance advice settles it.

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
