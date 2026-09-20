---
name: erp-payment-tag-verification
description: >-
  Verify ERP DEBENQ/statement INVNO tags before treating an invoice as settled or
  before publishing an open-invoice list. Use when a payment slice INVNO, ref_no, or
  allocation detail is about to close an invoice, or when debenq/tag-check surfaces
  stale-open candidates. Complements business_rules.md §15 and debtors:tag-check;
  does not replace lpg-payment-pattern-analysis or Payment-to-Invoice Allocation.
---

# ERP Payment Tag Verification

> **Status:** PROPOSED — operator ratification pending. Consumes `business_rules.md` §15; does not amend constitutional doctrine.

---

## When to use (triggers)

| Trigger | Action |
| :--- | :--- |
| A **Payment** row’s `INVNO` / allocation slice is used to mark an invoice **settled** | Run full verification algorithm below |
| Building or releasing an **open-invoice list** from DEBENQ / allocation detail | Run gate first: `npm run debtors:tag-check -- --debtor [CODE]` |
| **Crd Note** tagging alone would zero an invoice | Lighter path — CN tags ~90% reliable; still run chronology + cent match |
| Remittance advice **contradicts** ERP tag | Order A applies — remittance wins (§15) |

**Do not use** this skill as the primary matcher for **monthly STAT batch payers** (JIM001, BR0001, MD0003 gross-month lane). There, use `analysis/skills/lpg-payment-pattern-analysis/SKILL.md` at month-pool level. Use **this** skill when **invoice-level** tags or DEBENQ open lists are in play.

### Why this is a separate skill, not merged into the batch skills

Considered and rejected 2026-09-20. The repo already splits this payer class by **artifact**, not by payer type: `lpg-payment-pattern-analysis` (annual variance report) and `monthly-batch-erp-bridge-reconciliation` (point-in-time bridge + customer statement) are deliberate companions covering the same payers. Tag trust is a third concern, and it is **cross-cutting** — it applies to invoice-linked payers and DEBENQ open lists too, which both batch skills explicitly disclaim.

Merging would also require amending the `DEBTORS_DOCTRINE.md` §4 *Scoped-canonical implementation* table, which names `lpg-payment-pattern-analysis` as the constitutional home for the JIM001 class. Worker sessions do not author constitutional changes (§7).

**What this skill owns instead:** it is the scoped-canonical home for *"may this tag close this invoice?"* Sibling skills reference it rather than restating the gates.

---

## Tag reliability (hard rules — from §15)

| Entry type | Reliability | Rule |
| :--- | :--- | :--- |
| **Crd Note** `INVNO` | ~90% — especially CYL `-EMPTY` returns | **Usable as evidence** after gates 1–2 |
| **Payment** `INVNO` / slice tag | **Not trustworthy alone** | **Corroboration only** — never sole proof of settlement |
| **Journal / Bank UD** | Case-by-case | Treat like Payment until remittance or pattern confirms |

**Invariant (both authority orders):** Σ(open invoices) ≤ ERP `CURRENT BALANCE`. A breach proves settled debt carried as open — not proof of which tag is wrong.

**Export posture:** TXT with `"EXCLUDE: ALLOCATION DETAIL"` cannot yield a verified open-invoice list. Gate = `NOT_DERIVABLE_FROM_TXT`.

---

## Authority order (which cross-checks to run)

Determine basis from tag-check output: `REMITTANCE_BACKED` vs `PATTERN_ONLY`.

### Order A — remittance-backed (TWK002, MD0003, +1)

1. Customer remittance advice + reconciling batch total (remittance cash = ERP payment gross for that receipt)
2. Allocation lane — `allocation_edges.csv`, open-balance-at-payment-date tiers (`SKILL_Payment_To_Invoice_Allocation.md`)
3. ERP **Crd Note** tagging (after gates 1–2)
4. ERP **Payment** tagging — never alone

### Order B — pattern-only (most accounts)

1. **Exact-sum arithmetic** — payment equals sum of a defined LPG invoice set (often one billing month). Procedure and tolerance are **not restated here**: run `monthly-batch-erp-bridge-reconciliation` §2 (exact-sum-per-calendar-month test) or `lpg-payment-pattern-analysis` §5, and consume the result
2. Established **payment pattern** — `config/payment_pattern_overrides.json`, §14 mirror carry / Rule 13 surplus
3. Business rules — LPG/CYL partition, monthly cadence
4. Operator judgement — ratified in `closedInvoiceOverrides` or `ratification_scenarios.json` with named basis
5. ERP **Crd Note** tagging (after gates 1–2)
6. ERP **Payment** tagging — never alone

---

## Verification algorithm (named procedure)

Apply **in order**. Stop at first **REJECT** unless a higher authority (Order A remittance) explicitly overrides with evidence on file.

### Gate 0 — Scope

- Match target = **LPG-only** open amount for that invoice (header or line sum from `vw_clean_transactions`), not header total when CYL deposit lines exist on the same doc.
- Ignore CYL-only net-zero pairs for “is this invoice paid?” unless the question is custody.

### Gate 1 — Cent-exact amount (first numeric gate)

Compare payment **slice** amount to invoice **open LPG** at evaluation date:

- **Pass:** `|slice − open_lpg| ≤ R0.05` (same tolerance as allocation lane)
- **Fail:** amounts diverge → tag is **not confirmed**; do not mark settled from tag alone

For invoices with same-day CYL CN clearing EMPTY deposit, open LPG = gas leg only.

### Gate 2 — INVNO tag chronology (hard reject)

> **Named rule: `INVNO_TAG_CHRONOLOGY`** — A payment tag cannot prove settlement of an invoice that did not exist yet.

```
REJECT if invoice.tx_date > payment.tx_date
```

- Use **ERP document dates** from TXT or `transaction_headers.tx_date`, not DN/logistics dates unless ratified.
- **Effect:** Tag is **placeholder / doc-number reuse / DN-lag prepay pointer** — not evidence the invoice was closed on that payment date.

**Reference case:** MD0003 payment **42440** (2025-11-28) slice tagged **48372** — invoice **48372** posts **2025-12-19**. Chronology **REJECT** for “Nov payment settled Dec invoice”; treat slice as prepay / placeholder until Dec invoice exists and a **later** payment or remittance confirms. See `MD0003_Payment_42440_Match.md`, `allocation_edges.csv` AL-0046.

Also enforce allocation-lane rule: `payment_date < invoice_date` → **UNALLOCATED**, `review_required: true` (`SKILL_Payment_To_Invoice_Allocation.md` §4.6) — do not auto-allocate or cascade.

### Gate 3 — Independent cross-reference

| Basis | Check |
| :--- | :--- |
| `REMITTANCE_BACKED` | Remittance line cites doc or month pool; batch total ties |
| `PATTERN_ONLY` | Month-pool exact sum or registered override in `payment_pattern_overrides.json` |
| Allocation lane | Tier in `allocation_edges.csv` is Confirmed / OPEN_BALANCE_MATCH with gates 1–2 passed |

#### Gate 3a — Provenance (reject circular evidence)

> **Named rule: `TAG_EVIDENCE_PROVENANCE`** — invoice-level rows derived *from* a month assumption cannot confirm that month assumption.

Before citing `allocation_edges.csv` as independent corroboration, check how those rows were generated:

```
REJECT as independent if every edge for the payment is ERP_LEDGER / Probable
  AND the targets are a dense date-ordered run inside one already-assumed month
```

That fingerprint is the month assumption exploded into invoice rows after the fact, not per-invoice confirmation, and it cannot arbitrate between two candidate months. Only `Confirmed` tiers backed by remittance or independently-computed matches count at this gate.

**Reference case:** JIM001 docs **40746** / **44555** — a retraction of two misattribution candidates was itself reversed once provenance was checked; 6 payments shared this fingerprint. Doc 40746 resolved only when a **second independent computation** converged on July. See `JIM001_Exact_Sum_Bridge_Review_2026-09-13.md`.

### Gate 4 — Known-bad-pattern registry

Load `config/payment_tag_false_leads.json` if present. If `(payment_doc, invno)` or `(invno, effective_before)` matches a registry entry → **REJECT** tag conclusion; use recorded `reason` and `evidence_path`.

### Outcome labels

| Result | Meaning |
| :--- | :--- |
| **CONFIRMED** | Gates 1–2 pass + Gate 3 satisfied at required tier |
| **CORROBORATED_ONLY** | Gate 1–2 pass but only Payment tag (Order B rung 6) — do not close invoice without ratification |
| **REJECT_CHRONOLOGY** | Gate 2 failed |
| **REJECT_AMOUNT** | Gate 1 failed |
| **REJECT_REGISTRY** | Gate 4 hit |
| **PENDING_REMITTANCE** | Order A account — need advice |

Record outcomes in override/ratification config when operator accepts **CORROBORATED_ONLY** or resolves **REJECT_***.

---

## Known-bad-pattern registry (persistence)

Findings today are scattered across Payment Pattern reports and allocation notes. **Persist reusable false leads per account:**

**Path:** `analysis/debtors/[CODE]/config/payment_tag_false_leads.json`  
**Template:** `analysis/debtors/shared/templates/payment_tag_false_leads.template.json`

Each entry should include: `id`, `invno`, optional `payment_doc`, `effective_before` / `effective_after`, `classification` (`PLACEHOLDER_REUSE`, `PREPAY_POINTER`, `MISTAG`), `reason`, `evidence_path`, `ratified_by`, `ratified_at`, `tripwire` (what reopens).

**Example (MD0003):**

- **48372** on payment slices before **2025-12-19** — not a real settlement link to invoice 48372; prepay placeholder until invoice posts.

---

## Escalation

| Finding | Escalation |
| :--- | :--- |
| Single-account mistag / placeholder | Account `payment_tag_false_leads.json` + `closedInvoiceOverrides` or allocation exception |
| Same signature on **≥2 accounts** or same SKU/amount pattern across FY (e.g. recurring **~R598** CYL placeholder slices misread as LPG settlement) | Open **lpg-recon-bug-fixer** / portfolio ticket — ERP tagging defect, not payer behaviour |
| Open list vs remittance contradiction | §15 — ratify or fix before customer release; reference TWK002 stale-open case |

---

## Tooling map

| Tool | Role |
| :--- | :--- |
| `npm run debtors:tag-check -- --debtor [CODE]` | Portfolio gate before customer open lists |
| `debenq_open_invoices.mjs` | Shared open-invoice model + contradiction scoring |
| `check_invoice_tag_coverage.mjs` | CLI wrapper |
| `SKILL_Payment_To_Invoice_Allocation.md` | Invoice-linked payers after tags verified |
| `analysis/skills/lpg-payment-pattern-analysis/SKILL.md` | Monthly batch — **month pools**, not INVNO tags |
| `analysis/skills/monthly-batch-erp-bridge-reconciliation/SKILL.md` | §2 exact-sum test (Gate 3 input); §1 schedule gate; §7 anti-patterns |
| `business_rules.md` §15 | Constitutional authority order |

---

## Related skills (mutually exclusive primary matchers)

```
Payment INVNO about to close an invoice?
  ├── Monthly STAT batch payer (30T, blank ref)? → lpg-payment-pattern-analysis (month pool)
  ├── Monthly batch, need bridge/statement?      → monthly-batch-erp-bridge-reconciliation
  ├── Invoice-linked ref_no/doc_no payer?         → Payment-To-Invoice Allocation (after this skill)
  └── Open list / DEBENQ export?                  → THIS SKILL + debtors:tag-check
```

Division of labour within the monthly-batch family:

| Concern | Owner |
| :--- | :--- |
| Which month did this cash settle? | `monthly-batch-erp-bridge-reconciliation` §2 |
| Annual variance / Rule 13 / mirror carry narrative | `lpg-payment-pattern-analysis` |
| May this tag close this invoice? | **This skill** |
