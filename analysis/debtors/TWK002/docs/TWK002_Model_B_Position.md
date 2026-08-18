# TWK002 — Model B position (north star)

**Debtor:** TWK002 · TWK AGRI PTY LTD · ref B226  
**Updated:** 2026-08-11  
**Authority:** This document is the reconciliation objective for TWK002. All balance, ageing, statement, and collections work should be read against it.

---

## Objective

Bring TWK002 to a **remittance-authoritative, Model B** debtor position so finance and reconciliation can trust the balance and settlement history.

**North star:** TWK002 balance and settlement history match remittance advice for 2023–2024 (and forward batches as scoped), with documented exceptions — so aged debt and any collection action are based on **real debt**, not posting artefacts.

---

## Commercial target (Model B)

Each remittance batch decomposes as:

| Component | Amount |
| :--- | :--- |
| Bank cash received | remittance **CASH** (97.5% on eligible lines) |
| DISCOUNT ALLOWED journal | remittance **DISCOUNT** (2.5%) |
| **Together** | remittance **GROSS** settlement |

**Tier-1 authority:** TWK remittance PDFs (cash + line list + exceptions) — **not** naive ERP deposit math or untagged payment headers.

Doctrine: `docs/TWK002_Settlement_Discount_Doctrine_v2.md`  
Shared rule: `analysis/debtors/shared/docs/business_rules.md` §3, §15 — ERP payment allocation is not trustworthy; remittance advices outrank ERP tagging where batch total reconciles.

---

## What was wrong in ERP

| Issue | 2023 | 2024 |
| :--- | :--- | :--- |
| Discount journals | Missing entirely | Mostly missing; Oct partial R385.04 |
| Payments | Posted at gross | Mix: 5 cash-only, 5 over-post (orphan in deposit DISCOUNT) |
| Exceptions | Partial pays, late pay, already-paid | Same + Sep net negative discount |

ERP over-credited settlement vs remittance (notably **+R690** in 2023, **+R6,374.90** orphan in 2024 over-posts).

**2025+ (Phase 2):** same class — untagged payment slices (e.g. STAT 114 / inv 42468–42470), missing Path B discount journals until posted 2026-08-09.

---

## What “done” looks like

| Phase | Status | Notes |
| :--- | :---: | :--- |
| **Analysis complete** | Done | Remittances ingested, pro forma journals, exceptions, recreated ledgers, over-post investigation, doctrine v2, finance checklist |
| **ERP catch-up posted** | Mostly done | Path B journals (discount + payment correction). ~aggregate net +R5,328.95 on corrections in CURRENT TXT. **Line-level gaps open:** Apr, Nov FIX, Sep/Oct amounts |
| **Optional cleanup** | Not required | Deposit line detail, payment header edits (Path A) — only if finance wants |
| **Validation** | In progress | Fresh TXT vs target; optional converge toward `recreated_ledger_20xx.csv`. Source: `raw/DEBENQ_TWK002.TXT` / `TWK002CURRENT.TXT` |
| **Collections gate** | Not yet | `reconState: complete` in `project.json` only when **finance sign-off + validation** satisfied |
| **Forward scope — 2025** | Separate | STAT 110 / 00036467, new remittances — **not** mixed into 2023–2024 catch-up until signed off |

---

## What we are **not** trying to do

- Rebuild the whole ERP ledger from scratch
- Fix every deposit screen line (unless finance wants Path A)
- Chase 00037732 / 00036467 in this catch-up
- Start 2025 batch reconciliation until 2023–2024 posting is signed off

---

## Progress (2026-08-11)

```
[████████████████░░░░]  Analysis + doctrine + checklist
[██████████████░░░░░░]  ERP journals (aggregate OK; line audit open)
[░░░░░░░░░░░░░░░░░░░░]  Formal sign-off + reconState complete
[░░░░░░░░░░░░░░░░░░░░]  2025 extension (Phase 2 tranche 2 blocked)
```

**Immediate practical goal:** Confirm the **16-batch finance checklist** is truly complete in ERP (fix Apr / Nov / Sep–Oct if needed), then sign off and decide whether to extend to 2025 or close TWK002 recon for this phase.

---

## Connection to customer statement work (Aug 2026)

The statement generator and balance bridge are **downstream of Model B**, not a substitute for it:

| Finding | Model B link |
| :--- | :--- |
| Open list ≠ header (R8,084.67 gap) | Untagged STAT slices and B/F carry — payment posted at account level without `INVNO` |
| 42468 / 42470 on open list | STAT 114 paid on remittance; ERP untagged slice — **remittance outranked ERP** |
| Account-level bridge lines | Opening/residual + untagged settlements (−R49,551.05) — ratified in `config/statement_of_account.json` |
| `debtors:tag-check` REMITTANCE_BACKED | Only account with extracted `remittance_lines_*.csv` — strongest gate check |

**Current statement posture (2026-08-11):**

- TWK002-only (`siteTxts` empty — TWK003/TWK004 ignored for now)
- Balance due **R118,131.54** = ERP TWK002 CURRENT BALANCE header
- Open invoices **R110,046.87** + account-level **R8,084.67** (explicit, not hidden in 120-day)
- Reports: `TWK002_Statement_of_Account.md`, `TWK002_Balance_Gap_Investigation_2026-08-11.md`, `TWK002_Balance_Bridge_2026-08-11.md`
- **Presentation decision (2026-08-11):** the R8,084.67 account-level subtotal is fully itemised into 7 ratified sub-lines *internally* (`config/statement_of_account.json` → `balanceBridgeLines`, backed by `TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md`, `TWK002_Phantom_CN_Nets_Breakdown_2026-08-11.md`, `TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md`), but the **customer-facing statement now collapses it into a single "Opening balance" line** (`collapseAccountLevelAsOpeningBalance: true`). Collections/ageing focus for now is scoped to the **R110,046.87 open invoices only** — the account-level detail is audit backup, not a customer-facing worklist yet.

**Rule:** Do not send a customer-facing open-invoice schedule unless Model B settlement is reflected (Path B journals posted, untagged slices understood, remittance contradictions cleared). The gate catches remittance-vs-open contradictions; the bridge names account-level residual (itemised detail kept internal; statement shows it collapsed as Opening balance).

---

## Key paths

| Asset | Path |
| :--- | :--- |
| Doctrine v2 | `docs/TWK002_Settlement_Discount_Doctrine_v2.md` |
| Finance checklist (16 batch) | `data/finance_posting_checklist.csv` |
| Phase 2 checklist | `data/finance_posting_checklist_2025_phase2.csv` |
| Remittance lines (gate authority) | `data/remittance_lines_20xx.csv` |
| **Payment→invoice edges (remittance)** | `data/allocation_edges.csv` — regenerate: `npm run debtors:twk002-allocation-ingest` |
| Allocation report | `reports/TWK002_Payment_Allocation_v1.md` |
| **Pre-Mar-2025 B/F provenance** | `reports/TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md` — regenerate: `npm run debtors:twk002-bf-bridge` |
| Recreated ledgers | `data/recreated_ledger_2023.csv`, `data/recreated_ledger_2024.csv` |
| Onboarding status | `reports/TWK002_Onboarding_Status.md` |
| Balance bridge script | `scripts/build_balance_bridge.mjs --write` |

---

## Agent reminder

When working TWK002:

1. **Remittance PDFs are tier-1** for “which invoices did this batch settle?”
2. **ERP CURRENT BALANCE header** is tier-1 for “how much does the account owe in total?”
3. **Open invoice list** is a hypothesis — must pass `npm run debtors:tag-check` and respect `closedInvoiceOverrides`
4. **Path B journals** are the ERP correction lane; do not re-export TXT expecting payment tags to become authoritative
5. **2025 Phase 2** is forward scope — do not conflate with 2023–2024 sign-off
