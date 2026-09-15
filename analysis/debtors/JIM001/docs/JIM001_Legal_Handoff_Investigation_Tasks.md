# JIM001 — Legal Handoff Investigation Tasks

**Purpose of this document:** JIM001 is going to legal for collections. Before that happens, every item in the claimed balance needs to be either independently provable, or explicitly excluded. This document is the checklist that gets you from "we're confident because the numbers add up" to "here's the evidence." Assumes you already know JIM001's basic situation — this is about what to do next, not a history lesson.

**How to use this:** Work top to bottom — the order is priority order, not just a list. For each task, either bring back the evidence requested, or confirm it doesn't exist. Both are valid outcomes; the point is to know which one you're in, not to assume the best case.

**If you're working through this with a Claude Code session open on this repo:** ask it to open this file and walk you through one task at a time. It has access to the account's data and can pull specific figures, dates, and documents as you go — you don't need to run queries yourself. Tell it which task you're on and what you found; it should record the outcome in the format shown below.

---

## Before you start: three facts you need, not history

1. **`monthly_lpg_insights.csv` was stale for 2025-06 and 2026-03 as of the original Bridge review; both are now fixed — one PROVEN, one DECIDED.** A raw ERP transaction export (`raw/DEBENQ_CURRENT.TXT`, provided 2026-09-14) settles doc 40746 directly — the real ERP ledger tags it against 4 named July-2025 invoices by invoice number, not June's. This is the strongest evidence tier this account has anywhere short of an actual customer remittance advice. **Doc 44555 is now allocated to December 2025**, closing what was previously the open March-2026-vs-December-2025 dispute — but by explicit account-owner decision (2026-09-14), not by new evidence. The same raw export actually *weakens* the March-2026 reading: that reading's supposed "ERP invoice-level allocation" turns out not to exist in the real ERP at all (the real ledger shows this payment untagged to any invoice, December included). If a remittance advice for doc 44555 ever surfaces and contradicts December, revisit this allocation. If anything you're shown disagrees with the current CSV on either month, re-check which version it's reading from.
2. **The 2021 yearly report is factually wrong about October, November, and December** — it says all three were "completely skipped." They weren't; two of them have small partial payments that happen to offset each other. This is already corrected in the Bridge review, but don't let an old copy of the 2021 report resurface as if it were still authoritative.
3. **Jan and Feb 2025 were also wrongly showing as unpaid — this is fixed too.** They looked unpaid because two payments (docs 38846 and 39812) were sitting in the ledger unassigned to any month. An invoice-level check found they split cleanly across exactly those two months to the cent — see below. This changes the Priority 1 claim amount: it's *smaller* than the original unpaid-months list implied.

---

## Priority 1 — The actual claim: 2025–2026 unpaid invoices

**Why this comes first:** this *is* the amount being claimed. Nothing else on this list changes the number being pursued — this is the only section that does.

Unpaid months currently on record (corrected — Jan/Feb/Dec 2025 removed, see fact 3 and the note below): **2025 — Apr, May, Jun. 2026 — Jan, Feb, Mar, Apr, May.** 2026-03 is now genuinely `UNPAID` in full (R11,937.56) — doc 44555 no longer applies to it; see the note below.

> ✅ **2024-09/10/11 (R41,887.32) is NOT a claim item. Settled, proven, closed.** It was added to
> this list on 2026-09-15 and removed the same day. The ERP's *View Payment Allocations* screens for
> receipts `36139` and `36988` allocate every September, October and November 2024 invoice, to the
> cent. Do not pursue it. See Bridge review §5.5.

**Checked and closed for 2025/2026: is there uncaptured cash sitting behind any of these months, the way there was for Jan/Feb 2025?** No. Every payment in the ledger that isn't currently assigned to a month is from 2018–2020 — there is nothing unassigned anywhere near 2025 or 2026. Concretely: the payment sequence runs 40063 (settles Mar 2025) → 40746 (settles Jul 2025) with nothing in between, and 43199 (settles Nov 2025, posted 2026-02-05) → 44555 (settles Dec 2025, see below) with nothing in between either. So Apr, May, Jun 2025 and Jan, Feb, Mar, Apr, May 2026 are genuinely unpaid — not just unassigned — and can proceed through the rest of Priority 1's checklist as real claim items.

**2024-09/10/11 — RESOLVED. Paid in full. Not claimable.**

This was briefly added to the claim on 2026-09-15 on the strength of a payment-lag argument, and removed the same day. It is now settled outright by direct evidence: the account owner pulled the ERP's **View Payment Allocations** screens for all five receipts in the window, and receipts `36139` and `36988` between them allocate **every single September, October and November 2024 invoice** — R15,336.89, R14,025.58 and R12,524.85 respectively, each matching the month's billing to the cent.

The same five screens also settle May through August 2024 in full, and reduce 2024's whole-year net variance to **R0.50** — confirming the original "R0.51, near-perfect net" figure that an earlier pass on 2026-09-15 had wrongly declared broken.

**Lesson worth carrying into the rest of this handoff:** three separate readings of this stretch were wrong before the ERP screens arrived, and all three failed the same way — they inferred allocation from aggregates (month totals, payment lag, residual cash) rather than observing it. Where an allocation matters to the claim, get the ERP's per-invoice allocation screen. It is cheap, it is definitive, and on this account aggregate reasoning has repeatedly pointed the wrong way.

**Resolved — doc 44555, now allocated to December 2025 (account-owner decision, 2026-09-14):** this payment (R11,666.12) either settled March 2026 in full minus a R271.44 shortfall, or December 2025 in full instead. The March-2026 reading was originally attributed to "the ERP's own invoice-level allocation" — **that turned out to be wrong.** The raw ERP export (fact 1 above) shows doc 44555 with a blank invoice-tag field: it is not actually allocated to any invoice in the real ERP, March-2026's included. So the March-2026 reading has no real evidentiary basis at all, while December 2025 has the aggregate-total match (an internal workbook computation, not a remittance advice — still not proof, but the only reading with any support). **No new evidence resolved this — the account owner made the call** to close it out in favor of December ahead of legal handoff, rather than leave it open indefinitely. `monthly_lpg_insights.csv` now reflects this: December 2025 `FULLY_SETTLED`, March 2026 `UNPAID` in full. Do not represent this to legal as an independently proven fact — it's a decision, and it should be revisited if a remittance advice for doc 44555 ever surfaces.

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

## Priority 3 — 2024 settlement window: CLOSED, ERP-PROVEN (2026-09-15)

**Nothing to do here. This section is resolved and requires no evidence-gathering.**

April–November 2024 is settled in full. The account owner pulled the ERP's **View Payment Allocations** screens for all five receipts covering the window — `33810`, `34425`, `35270`, `36139`, `36988` — and they allocate every LPG invoice across those months to the cent:

| Receipt | Paid | Settles |
| :--- | :--- | :--- |
| `33810` | 2024-09-30 | rest of May + all June |
| `34425` | 2024-10-28 | May stragglers + all July |
| `35270` | 2024-12-04 | May stragglers + all August |
| `36139` | 2025-01-17 | all September + part of October |
| `36988` | 2025-02-21 | rest of October + all November |

April is covered by receipt `32896`, proven by a cent-exact interlock with `33810`'s screen. 2024's whole-year net variance is **R0.50**.

**The old "six payments cleared eight months, no clean single-month attribution" framing was directionally right** — the window *is* settled as a pooled/rolling window rather than one payment per month — it just had the mechanism wrong. Allocation is per-invoice, mostly oldest-first, and it revisits skipped invoices in later receipts.

**The R24,068.27 of "unconsumed leftover cash" does not exist.** It was an artifact of forcing a one-payment-per-month model onto a per-invoice ledger. Every rand of these five receipts is allocated. Nothing to chase.

**No remittance advices needed.** The ERP's own allocation record is better evidence than a remittance advice would be, and we have it.

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
