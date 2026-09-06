---
name: lin001-debtor-reconciliation
description: >
  Cold-start worker for debtor LIN001 (SLINDOKUHLE ENTERPRISES (PTY) LTD).
  DN#-proof event model, header-combined (LPG+CYL) settlement — NOT the
  WO0001 LPG-only allocation lane. Use when continuing LIN001 event
  walk-backs, evaluating new customer evidence (WhatsApp receipts,
  delivery notes, proformas), proposing ERP corrections, or syncing the
  DK Jira project for this account. Everything lives under
  analysis/debtors/LIN001/ and Jira project DK.
---

# LIN001 Debtor Reconciliation Worker

You are the **LIN001 worker agent**, reconciling **SLINDOKUHLE ENTERPRISES (PTY) LTD** (ERP code `LIN001`). You have **no prior chat context**. This file plus the artifacts it points to are the full handoff — read them before doing anything else.

---

## 0. Environment setup

```bash
git clone https://github.com/Media7-za/lpg-stock-recon.git
cd lpg-stock-recon
git fetch origin
git checkout claude/lin001-delivery-events-xb8nt7   # this account's working branch — confirm with operator it's still current
```

Data sources:
- **Supabase** project `oqhpxnaadahohwkslive` (alias "lpg-stock-recon" in older docs) — tables `transaction_headers` and `transaction_items`, filtered `account_no = 'LIN001'`.
- **Jira** — cloudId `c92f7a02-c91d-4832-9b07-46dcae32b3da`, site `media7.atlassian.net`, project key `DK` ("Debtors Kanban"). LIN001 tickets carry `LIN001` in the summary — `searchJiraIssuesUsingJql` with `project = DK AND summary ~ "LIN001"` finds them all (the plain `project = DK` backlog is portfolio-wide, hundreds of unrelated accounts).
- **Source-file duplication bug** (portfolio-wide, tracked as DK-593): `transaction_items`/`vw_clean_transactions` can double-post under multiple `source_file` values. Dedupe to `source_file='CURRENT2307.TXT'` by default, but check `CURRENT.TXT` too — at least one confirmed case (DN#22630/invoice 51132/CN 15039) only exists under `CURRENT.TXT`.

### 0A. Cold-start reading order

1. This file.
2. `analysis/debtors/LIN001/reports/LIN001_events_consolidated_2026-06_2026-09.md` — Jun–Sep 2026 register, event-by-event, with a correction log at the top (read it — status lines get retracted/updated in place, the log explains why).
3. `analysis/debtors/LIN001/reports/LIN001_Payment_Allocation_v1.md` — the payment↔event allocation ledger with formal confidence tags (`Confirmed`/`Probable`/`Exception`), cross-references `allocation_edges.csv`.
4. `analysis/debtors/LIN001/data/allocation_edges.csv` — one row per payment→event edge; the `notes` column carries the full evidentiary history per edge, including retractions. **This file's `notes` column is more current than any prose report** — if a report and a CSV row disagree, trust the CSV row's most recent note and flag the report as stale.
5. Individual event cards, `analysis/debtors/LIN001/docs/LIN001_event_*.md` — one per DN#, the most detailed writeup for that event.
6. `.agents/skills/SKILL_Payment_To_Invoice_Allocation.md` — the portfolio-wide doctrine LIN001 deviates from in two ways (see §2 below); §4.6 (no-prepayment rule), §4.8 (Open Event Balance matching, LIN001's actual lane), §7 (override registry), §13 (skill selection) are the sections referenced throughout LIN001's own docs.

**Known staleness (fix or flag, don't trust blindly):** `analysis/debtors/LIN001/config/events.json` was last updated 2026-09-05 and does not reflect this session's later corrections (DN#21237, DN#22630 closures) or any of the Jan/Feb 2026 events (DN-21627, DN#21237, DN#21541) — those live only in the docs/data files above. Don't treat `events.json` as ground truth without cross-checking `allocation_edges.csv`.

---

## 1. Account snapshot

| Field | Value |
| :--- | :--- |
| **Code** | LIN001 |
| **Name** | SLINDOKUHLE ENTERPRISES (PTY) LTD |
| **Lane** | DN#-proof event model, **header-combined** (LPG+CYL) — not WO0001's LPG-only allocation lane |
| **`ref_no` availability** | None — every LIN001 payment row has blank `ref_no`. Never expect Tier 1/2 ref-based matching to fire. |
| **Payer pattern** | Individual DN#-keyed events, variable lag (5–91+ days seen), occasional prepayments |

---

## 2. Event model (LIN001-specific — read before touching WO0001 doctrine)

**Event = invoice + credit note + delivery note (DN# proof) + payment.**
**Event net = invoice gross + CN gross** (CN stored as negative gross in ERP — plain sum), computed at the **header level** (LPG + CYL/deposit combined), not LPG-only.

This is a deliberate deviation from `SKILL_Payment_To_Invoice_Allocation.md`'s §4.2 LPG-only rule — proven this session by exact-cent rate re-verification. Don't "fix" it back to LPG-only without re-deriving that proof.

CN↔invoice linkage is via `ref_no` (CN's `ref_no` = invoice `doc_no`) and the literal `DN#` tag inside the `description` field of both docs — use both to group a delivery's legs, especially across reversal-and-reissue chains (some events span 4-6 ERP documents).

### Standard doctrine: rolling/cumulative account balance (adopted 2026-09-06)

LIN001 is a **COD account**, judged as a rolling running balance across chronological events — the same way the ERP's own Debtor Account Enquiry screen works (one running `BALANCE` column down the whole account) — **not** by isolating each event's payment against only its own invoice+CN.

**How to compute it:** walk events in date order. For each: `balance = event net (invoice gross + CN gross)`; `surplus_out = payment(s) received + surplus_in − balance`. That `surplus_out` carries forward as the next event's `surplus_in`. A negative result is a shortage carried forward, not a debt to chase in isolation.

**What this changes vs. what it doesn't:**
- It changes the **final judgment call** — whether a given event's gap is a live commercial concern. A shortfall funded by surplus from adjacent deliveries is not urgent; a persistent, growing cumulative shortage across the window is.
- It does **not** change how individual facts get verified. Confirming which payment targets which delivery, whether a CN is correctly linked and reflects a real physical return, or what a signed delivery note shows for disputed quantities — that evidence work is exactly as rigorous as before, and still comes first. The rolling view only applies once those facts are settled.
- It does **not** erase an individual, customer-acknowledged liability. DN-21627's R1,449.00 (the customer's own confirmed 2-unit 9kg undercount) still stands as a discrete debt regardless of the account's rolling position — the rolling view speaks to collections urgency, not to forgiving a specific admitted error.

**Authoritative source:** the ERP's own running balance (Debtor Account Enquiry screen) is ground truth. This repo's rolling-balance bridge is a derived cross-check and can lag it (see the Supabase sync-lag note in §0) — when they disagree, trust the live ERP screen and re-sync the repo.

**Current status:** verified and adopted for the Jun–Sep 2026 window — `analysis/debtors/LIN001/reports/LIN001_balance_bridge_2026-06_2026-09.md` is the authoritative rolling-balance table there (final cumulative position: R477.83 short, immaterial). **Not yet extended** back through the fuller Nov 2025–Sep 2026 history covered by `LIN001_Payment_Allocation_v1.md` (DN-21627, DN#21237, DN#21541, and the Probable-tier events before that) — chaining those in requires care around correction-posting dates (e.g. DN#22630's discount posted 2026-09-06 against a 2026-06-08 delivery) and is a follow-up, not assumed done.

### Evidence hierarchy (the load-bearing rule of this account)

1. **Signed/physical ERP-side evidence** (delivery notes, invoices as posted) — canonical for **quantities actually dispatched**.
2. **Payment-app / bank remittance advice naming a DN#/invoice number explicitly** — canonical for **which payment targets which event** (upgrades an edge from `PROXIMITY_INFERENCE`/Probable to `EXPLICIT_REF`/Confirmed in `allocation_edges.csv`).
3. **Customer proforma quotes** — canonical for **what rate/structure the customer was quoted**, and can fully explain a payment that exactly matches the quote even when it disagrees with ERP's posted model (see DN#22630).
4. **Customer notebooks / self-reported reconciliations** — **never canonical over (1) or (2) when they conflict.** They're useful for understanding *how a customer computed a figure* (which can itself explain a residual, e.g. DN-21627's 2-unit undercount), but a customer's own tally does not override a signed delivery note. Push a conflict back to the customer for confirmation rather than resolving it in their favor unilaterally. This was learned the hard way this session (see DN-21627's correction log) — do not repeat that mistake.

### Rate model

Every invoice uses **one flat ex-VAT rate per kg**, applied uniformly across all cylinder sizes (9KG/14K/19K/48KG) for that delivery. Verify via `retail_price ÷ cylinder_kg` on the gas lines. Incl-VAT rate = ex-VAT × 1.15.

**Cylinder deposits are FIXED regardless of period** and are never part of a rate correction:

| Size | Ex-VAT | Incl-VAT |
| :--- | ---: | ---: |
| 9kg | R450 | R517.50 |
| 14kg | R550 | R632.50 |
| 19kg | R600 | R690.00 |
| 48kg | R1,050 | R1,207.50 |

**Confirmed period gas rates so far** (do not assume these hold outside their period — a June 2026 test at the Feb rate was explicitly wrong-direction and off by ~6x):

| Period | Rate (ex-VAT/kg) | Source |
| :--- | ---: | :--- |
| January 2026 | R20.00 | Customer-stated, used on DN-21627/invoice 48725 |
| February 2026 | R20.24 | Operator-confirmed, used on DN#21237/invoice 49115 (supersedes an earlier, less-accurate R20.391/kg attempt) |

**Rate-correction methodology:** re-rate only the GAS lines (qty × kg × new_rate, then `round(net × 0.15, 2)` tax, sum). Deposit lines are untouched.

**Proforma-vs-invoice risk:** at least one delivery (DN#22630) was quoted on a flat "refill" proforma (gas-only per kg + a one-off empty-cylinder charge) but posted in ERP using the standard invoice+deposit-dispatch/return model — a structural mismatch, not a rate error. **Watch for this pattern recurring** — it's exactly the open question on DN#24817 (§4 below): a proforma quoted as a "refill" (implying the customer's own empties return, no deposit) was invoiced with a full cylinder deposit added.

---

## 3. Jira conventions (DK project)

- **Keep every comment/description terse** — numbers + action item, not narrative. This is an explicit, durable operator instruction.
- **Statuses relevant to this account** (get via `getTransitionsForJiraIssue` if unsure of current transition IDs — they can change):
  - `AWAITNG PAYMENT` (transition id `4` as of this session — literal typo in the source workflow, not an error to fix) — use when a fix is agreed/posted but payment is still owed by the customer. **Never hard-close** a ticket in that state.
  - `DISCOUNTS - SHARMIN` (transition id `10`) — a routing status; do not move tickets here or set up assignment/routing without being asked. This was explicitly deferred ("we can discuss workflows at a later stage").
- Tickets get a title update reflecting the final resolved state once an event closes (see DK-590/591/592/595/596 for the pattern), plus a short "READY TO POST" comment when a correction is proposed but not yet posted in ERP.
- No live Jira-activity subscription exists for this project (unlike GitHub PR subscriptions) — comments alone do not wake a session. Don't assume a ticket update will be noticed without the operator pointing it out.

---

## 4. Current state (as of 2026-09-06 — verify against the docs before trusting this table blindly)

| Event | Status | Ticket |
| :--- | :--- | :--- |
| DN-21627 (Jan) | Closed — R1,449.00 owed by customer (confirmed his own error), collections-only | DK-592, `AWAITNG PAYMENT` |
| DN#21237 (Feb) | Closed to R0.16 — credit ready to post | DK-590, ready to post |
| DN#21541 (Feb) | Explained, R349.02 residual — **two credits still not posted in ERP** | DK-591 (price adj), DK-596 (empties credit), both ready to post |
| DN#22508 (Jun) | Closed, zero-net | — |
| DN#22630 (Jun) | Closed exactly — credit ready to post | DK-595, ready to post |
| DN#22936 (Jul) | Closed | — |
| DN#23974 (Aug) | Closed | — |
| DN#24947 (Sep) | Closed | — |
| **DN#24817 / invoice 52949** (Sep) | **OPEN — R38,410.00, cause unresolved** | not yet ticketed |

### DN#24817 — the live open item

Originated as "Proforma 2026-09-04" (70×9kg LPG refill quote, R16,291.80, R2,185.00 short-paid, no DN#). Has since posted to ERP as **invoice 52949** (2026-09-04, `source_file DTRX0409.TXT`):

| Line | Amount |
| :--- | ---: |
| 9KG LPG refill (70×9kg, gas only) | R16,291.80 — matches the original proforma exactly |
| 9KG cylinder deposit (70×R450 ex-VAT) | R36,225.00 — **not in the original proforma** |
| **Invoice total** | **R52,516.80** |

Payments to date: R13,416.80 + R690.00 = R14,106.80. **Gap: R38,410.00.** No CN posted, no further payment since 2026-09-04 (checked against `transaction_headers` directly).

**What's needed to resolve it:** the signed delivery note for DN#24817, specifically whether it records 70 empty 9kg cylinders actually returned on this delivery.
- If yes → the deposit charge is a posting error → propose a -R36,225.00 credit, and the real remaining question shrinks back to the original R2,185.00 gas-rate gap.
- If no → the deposit is legitimate and R38,410.00 is a real collections shortfall, not an ERP mistake.

Do not guess at this — it is a binary evidence question, not something derivable from ERP data alone. A request to locate the scanned delivery note was sent to another session (`user-90`) this session but that session was unreachable; the operator may retry or supply the DN directly.

### Lower-priority open threads

- Payment 42975(slice) → DN#21432: a customer payment-app receipt naming "21432" exists but was never confirmed against this specific payment slice (see `LIN001_Payment_Allocation_v1.md` §4).
- 46 unmatched historical events (2023–2024) from the full-history scripted pass (`data/dn_event_payment_allocation_candidates.json`) — candidates only, not promoted.
- DK-594: reconcile overlapping branches (`claude/lin001-delivery-events-xb8nt7` vs `cursor/lin001-fresh-allocation-bb32`) before any merge to main.
- DK-593: the source-file duplication bug is portfolio-wide (~300 accounts), not LIN001-specific — out of this skill's scope beyond the dedupe workaround in §0.

---

## 5. Rules of engagement

| Rule | Detail |
| :--- | :--- |
| Evidence hierarchy | Signed ERP-side docs > remittance advice naming a target > proforma quotes > customer notebooks. Never resolve a conflict in the customer's favor unilaterally — push it back to them. |
| Jira notes | Terse — numbers + action item only. |
| Ticket status | Fix agreed but not posted/collected → `AWAITNG PAYMENT`, never a hard close. |
| Workflow routing | Do not move tickets into `DISCOUNTS - SHARMIN` or set up assignment/routing unless asked again. |
| Corrections | Deposit rates never change (§2 fixed table). Gas rates are period-specific — verify per period, don't assume portability. |
| Retractions | If new evidence contradicts a prior conclusion, retract explicitly in both the repo doc and the Jira ticket — don't quietly overwrite. Say what changed and why (see DN-21627's correction log for the pattern). |
| Commits/pushes | Follow the repo's standard git safety practices; this branch pushes directly (`claude/lin001-delivery-events-xb8nt7`), no PR required unless asked. |
| Sync discipline | When an event's status changes, update **all** of: the event card, `allocation_edges.csv`, the consolidated register, `LIN001_Payment_Allocation_v1.md`, the balance bridge, and the Jira ticket. This session left several of these out of sync more than once — treat "update everywhere" as a checklist, not a single-file edit. |

---

## 6. Artifact layout

```text
analysis/debtors/LIN001/
├── config/events.json                          # STALE as of 2026-09-06 (see §0A) — cross-check before trusting
├── data/
│   ├── allocation_edges.csv                    # most current source of truth per payment→event edge
│   ├── dn_event_payment_allocation_candidates.json  # full-history scripted pass, 2023-2026, candidates only
│   └── LIN001_manual_allocation_2026-06_2026-09.csv
├── docs/
│   ├── LIN001_event_DN*.md                     # one per DN#, most detailed per-event writeup
│   ├── LIN001_event_2026-09-04_proforma.md     # superseded by invoice 52949/DN#24817 — needs a follow-up card
│   └── LIN001_ERP_correction_request_*.md      # one per proposed ERP posting, ties to a Jira ticket
└── reports/
    ├── LIN001_events_consolidated_2026-06_2026-09.md   # Jun-Sep register, correction log at top
    ├── LIN001_Payment_Allocation_v1.md                 # payment↔event ledger, confidence-tagged
    └── LIN001_balance_bridge_2026-06_2026-09.md        # Jun-Sep aggregate tie-out
```

---

## 7. Related skills

| Skill | When |
| :--- | :--- |
| `SKILL_Payment_To_Invoice_Allocation.md` | Portfolio-wide doctrine — LIN001 deviates on §4.2 (header-combined, not LPG-only) and has no `ref_no`, so Tier 1/2 never fire; §4.6 (no-prepayment), §4.8 (Open Event Balance, LIN001's actual matching lane), §7 (override registry) all apply directly. |
| `SKILL_Debtors_Project_Manager.md` | If LIN001 is ever migrated to the `project.json`/`debtors:sync` convention other accounts use (it currently isn't). |
| `debtors-analysis_Skill.md` | Exception taxonomy, general report section conventions. |
