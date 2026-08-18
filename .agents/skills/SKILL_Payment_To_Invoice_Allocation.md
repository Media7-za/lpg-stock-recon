---
name: payment-to-invoice-allocation
description: >-
  Allocation doctrine for debtors who pay against specific invoice documents via
  ERP ref_no links (e.g. WO0001). Covers exact ref matching, split STAT batches,
  rounding residuals, LPG-only comparison, and allocation_edges output. Do NOT
  use for monthly batch payers — use lpg-payment-pattern-analysis instead.
---

# Payment-to-Invoice Allocation Skill

> [!IMPORTANT]
> **Applicability & Scope**
> Use this skill for debtors whose payment behaviour is **invoice-document-linked**:
> the ERP records `payment.ref_no = invoice.doc_no` and amounts are cent-aligned
> to the target invoice (often split across multiple segments under one payment
> document and one STAT batch).
>
> **Reference archetype:** WO0001 (L3 Cash and Carry) — wholesale cash-and-carry,
> `TRANSF | STAT 1xx` batches, 2–3 invoices cleared per EFT.
>
> **Do NOT use** for monthly consolidated batch payers (e.g. JIM001). Those accounts
> require `analysis/skills/lpg-payment-pattern-analysis/SKILL.md`, which reconciles at the
> gross monthly level and treats `ref_no` as clerical noise.

---

## 0. Approved Doctrine (Jun 2026)

The following decisions are **locked** for invoice-linked accounts:

| Decision | Ruling |
| :--- | :--- |
| ref_no → Confirmed without remittance | **Yes** — when LPG amounts align within R0.05 |
| Match target | **Always LPG-only** — never header total |
| Split batch + rounding ≤R1 | **Yes** — absorb blank-ref micro-residuals into consolidation group |
| Blank-ref material (e.g. R16,628) | **Tier 5 review** — do not auto-allocate |
| Override registry | **Per-invoice** schema in debtor `config/payment_pattern_overrides.json` |
| ERP payment splits | **Non-canonical** — sum by payment doc# before match; never test one row alone |
| ERP ref_no | **Non-canonical** — open event balance at payment date is primary; ref is cross-check only |
| **Prepayments / DN-lag** | **Unallocated** — `payment_date < invoice_date` → `UNALLOCATED` + **`review_required: true`** (human review; no auto-allocate, no cascade) |
| **Instalments** | **Excluded** — never sum across payment docs; one EFT = one allocation pass |
| Group A (CYL+CN ≤+1d) | Auto-confirm when **payment-doc slice = open event net** at payment date |
| Blank-ref material (e.g. R16,628) | **Tier 5 review** — do not auto-allocate |

**Payment truncation note (WO0001):** The ERP sometimes posts payment amounts
truncated to whole Rand (e.g. paid R9,896.00 vs LPG R9,896.53). When `ref_no`
matches but variance is R0.06–R1.00, flag **Section 5 review** — do not promote
to Tier 1 without human approval or override entry.

---

Build a deterministic **payment → invoice allocation graph** for invoice-linked
debtors. Outputs must be auditable, VAT-correct, LPG-scoped by default, and
stored in the debtor workspace (`allocation_edges.csv` + narrative report).

**Primary deliverables per run:**

| Artifact | Path |
| :--- | :--- |
| Allocation edges | `analysis/debtors/[DEBTOR]/data/allocation_edges.csv` |
| Allocation report | `analysis/debtors/[DEBTOR]/reports/[DEBTOR]_Payment_Allocation_v1.md` |
| Override registry (if human-approved) | `analysis/debtors/[DEBTOR]/config/payment_pattern_overrides.json` |

---

## 2. Relationship to Other Skills & Docs

| Document | Role |
| :--- | :--- |
| `analysis/skills/lpg-payment-pattern-analysis/SKILL.md` | Monthly batch payers — **mutually exclusive** with this skill |
| `debtors-analysis_Skill.md` | Graph states, exception taxonomy — apply after edges are built |
| `ALLOCATION_DOCTRINE.md` | Evidence tiers and cylinder settlement rules |
| `business_rules.md` | VAT sign, Dual-Line Pattern, Rule 13 surplus, override registry doctrine |
| `SKILL_Debtors_Project_Manager.md` | Update `project.json` / run `npm run debtors:sync` after material changes |

---

## 3. Source-of-Truth Hierarchy (Invoice-Linked Debtors)

> **Constitutional doctrine:** `analysis/debtors/shared/DEBTORS_DOCTRINE.md` §§1–4 · **D14** (ref_no payer-class exception) · **D15** (edge vs epistemic labels). **Global evidence doctrine** (four-rank class table, line-level lanes, conservation invariants): scoped-canonical in `SKILL_Debtor_Statement_v4_From_TXT.md` § Doctrine addendum; summarized in `SKILL_Debtors_Orchestrator.md` §5 · §3. **This section** governs payment→invoice **matching** for invoice-linked payers only — scoped-canonical for matching; edit matching rules here.

For this payer class, the matching hierarchy **inverts** the monthly-batch skill — within **D14** constraints:

| High-confidence (use first) | Lower-confidence (fallback only) |
| :--- | :--- |
| Payment `ref_no` → invoice `doc_no` with cent-aligned amount | Amount-proximity match within ±R5.00 and 90-day window |
| Consolidated payment doc + STAT batch grouping | Chronological FIFO pool consumption |
| Invoice **LPG-only** line totals from `vw_clean_transactions` | *(No header fallback for invoice-linked accounts)* |
| Gross payment segments (sum of split lines) | Individual split line in isolation |

| Always exclude | Reason |
| :--- | :--- |
| `ref_no IN ('Alloc','Recon')` | Mirror pairs — verify group nets to zero first |
| CYL-only invoice docs (net R0.00 after `-EMPTY` pair) | Deposit charge + reversal — no LPG settlement |
| AGR / OTHER SKU lines | Out of LPG payment matching scope |

> **Intent rule:** When `ref_no` matches `doc_no` and amounts align within
> tolerance, classify as **Confirmed** via `EXPLICIT_ALLOCATION` — only after
> **D14** provenance verification (Turn 8b Step 1). Do not downgrade to "best-fit"
> unless the link is broken or amounts diverge beyond tolerance.

### 3.1 REF_DECIDED label (D14 implementation — ratified 2026-07-22)

Any allocation edge where a **reference broke a residual tie** — not merely corroborated an **amount-unique** match — must carry:

| Field | Requirement |
| :--- | :--- |
| **Edge status** | `REF_DECIDED` (not `CONFIRMED_REF_LPG_MATCH` alone) |
| **Tripwire** | Armed — a future contradicting document (remittance, ERP correction, alternate ref-bearing payment) **reopens** the edge |
| **Epistemic note** | Per **D15:** edge label `REF_DECIDED` ≠ epistemic **PROVEN** until the allocation closes within a full identity or conservation result |

Amount-unique lag matches without ref tie-break (e.g. cent-exact single candidate) do **not** use `REF_DECIDED` unless a reference was the discriminant.

---

## 4. Core Business Rules

### 4.1 VAT Handling (mandatory)

- **Payments:** VAT-inclusive cash stored in `transaction_headers.amount_excl`
  with `tax_amount = 0`.
- **Invoices:** Compare against VAT-inclusive totals:
  `amount_incl = SUM(line_total)` from `vw_clean_transactions`, or
  `amount_excl + tax_amount` from header when line detail is unavailable.
- **Never** compare payments to VAT-exclusive invoice figures.

### 4.2 LPG vs CYL Separation (Dual-Line Pattern) — **LPG-only (locked)**

> **Approved doctrine (Jun 2026):** For invoice-linked accounts, **always** match
> payments against the LPG gas lane only. Never use ERP header totals as the
> Tier 1 match target, even when CYL deposit lines net to zero on the same doc.

Before matching, compute each invoice's **sole match target**:

```
match_target_amount = SUM(line_total) WHERE debt_group = 'LPG'
```

- CYL (`.1` SKU) and `-EMPTY` deposit pairs are **excluded** from comparison.
- If `match_target_amount = 0` (cylinder-only doc), skip Tier 1 for that invoice
  — do not fall back to header total.
- Set `allocation_edges.target_lane = 'LPG'` for all confirmed edges.

**Confirmed without remittance:** When `ref_no` matches `doc_no` and
`ABS(payment_amount - match_target_amount) <= R0.05`, classify as **Confirmed**
via `EXPLICIT_ALLOCATION`. Set `commercially_confirmed = false` unless remittance
advice exists.

### 4.3 Alloc / Recon Noise

Before any matching:
1. Select payments where `ref_no IN ('Alloc','Recon')`.
2. Group by `doc_no`; each group must net to **R0.00**.
3. Flag leaky groups (non-zero net) in the report — do not exclude until investigated.
4. Exclude zero-net groups from the payment pool entirely.

### 4.4 Field Definitions — `doc_no` vs `ref_no`

| Field | Role | Example (payment row) |
| :--- | :--- | :--- |
| **`doc_no`** | This row's **payment receipt ID** (bank EFT / ERP payment doc#) | `37248` |
| **`ref_no`** | **Pointer** to the invoice being settled | `41067` → joins to `invoice.doc_no` |

On invoices, `doc_no` and `ref_no` are usually the same (self-reference).
On payments they are **almost always different** — one payment doc# splits across
many `ref_no` rows. **Never confuse payment doc# with invoice doc#.**

### 4.5 Payment Consolidation Rule (non-canonical splits)

ERP payment rows are **clerical decomposition**, not allocation facts. The bank
received one EFT; the ERP posts many rows under one **payment doc#**.

```
Payment doc 00037248 | ref 00041067 | R6,694.21   ← slice, not bank total
Payment doc 00037248 | ref 00041593 | R5,060.00
Payment doc 00037248 | ref Alloc    | R15,306.00  ← mirror — exclude
```

**Primary consolidation key:** `(payment_doc, tx_date, batch_ref, ref_no)`.

Steps:
1. Exclude `ref_no IN ('Alloc','Recon')` (verify zero-net per payment doc).
2. **Sum all rows** sharing the same `(payment_doc, tx_date, batch_ref, ref_no)`.
3. Match the **summed slice** to net invoice open — **never** a single row vs full invoice.
4. Multi-ref payment docs: each ref gets its own summed slice (do not merge refs).
5. Absorb blank-ref micro-residuals (≤ **R1.00**) into the payment doc group.

### 4.6 No Prepayment / No Instalment (locked)

**Prepayments and instalments are not part of allocation logic.** Each payment
doc# is evaluated **once**, in isolation, on its **payment date only**.

| Pattern | Rule | Outcome |
| :--- | :--- | :--- |
| **Prepayment / DN-lag** | `payment_date < invoice_date` | **`UNALLOCATED`** — do not auto-allocate; **`review_required: true`** |
| **Instalment** | Same invoice/ref paid across **multiple payment doc#s** | Each EFT tested alone; **never** sum slices across docs |
| **Partial slice** | Summed slice < net open on payment date | **`PARTIAL`** or **`DISPUTE_SHORT`** — not rescued by other EFTs |
| **Future ref / DN-lag prepay** | Payment points to invoice not yet posted | **`UNALLOCATED`** + human review |

**What this excludes from auto-allocation:**
- Pmt 35345 → 39895 (35 days before invoice) — prepay, not in logic
- Pmt 36042 + 36043 → 39491 — **not** combined; each EFT stands alone
- Pmt 36494…37248 → 41067 — five instalments; **no** chain confirmation

**Valid match window:** invoice (and CN if applicable) must exist with
`invoice_date ≤ payment_date`. Open amount = event net minus **prior** payments
allocated under the same rules, **excluding** prepayments from the paid tally.

### 4.7 Credit Note & Combined Invoice Gates (Group A — locked)

Before matching summed slices on **payment date**:

1. **CN gate:** `CN.ref_no = invoice.doc_no` within **+1 day** of invoice date.
2. Compute **event net open** at payment date:
   - Pure LPG: `net = LPG − prior_confirmed_payments`
   - LPG + OTHER/AGR: `net = (LPG + OTHER) − prior_confirmed_payments`
   - LPG + CYL with CN: `net = (LPG + net_CYL) − prior_confirmed_payments`
3. **Confirm** when **payment-doc summed slice = event net open** (± tolerance).
4. **Dispute short:** EFT < event net but matches a deliberate short → `DISPUTE_SHORT`.

### 4.8 Open Event Balance (primary — ref optional)

When ignoring or cross-checking ERP `ref_no`:

1. Build **commercial event** = invoice + CN (same DN, CN within +1d).
2. At **payment date**, compute open balance per event (excl prepayments).
3. Apply **payment doc total** (or slices) to open events in scope (recent window /
   same STAT batch — **not** account-wide FIFO).
4. Flag **`REF_DIVERGENCE`** when ERP ref slice ≠ open-balance allocation.

**WO0001 example (Pmt 36043):** Open on 2025-01-13 — Inv 38848 R2,540.18,
39491 R10,322.57, 39701 R11,673.11 — slices match open exactly without reading ref.

**Open balance is a reconstruction, not ground truth.** Every open-balance
figure above is derived from ERP tagging (`ref_no` in the DB, `INVNO` in the
TXT). ERP payment allocation is broken by long-standing finding
(`business_rules.md` §3) — which is precisely why this skill exists — so
settlement rows are routinely untagged or mis-tagged, and many exports omit the
column deliberately. An invoice can therefore show a positive open balance long
after it was paid, which silently corrupts any allocation computed against it.
Note the asymmetry: **Crd Note** tagging is broadly canonical (~90%, CYL
deposit / empty-return credits especially) and can be leaned on; **Payment**
tagging cannot, even when populated. Two guards:

- **Invariant** — Σ(open invoices) must never exceed the ERP `CURRENT BALANCE`.
  A breach proves settled debt is being carried as open; stop and reconcile
  before allocating.
- **Gate** — run `npm run debtors:tag-check -- --debtor [CODE]` before trusting
  an open-balance set. `NOT_DERIVABLE_FROM_TXT` means that TXT carries no
  tagging, so the open-balance set has to be built here, using the tier order
  below, rather than read out of ERP.

**Most accounts have no remittance advices.** They exist for 3 accounts in the
portfolio; at the 2026-08-11 sweep only TWK002 had them extracted into
`data/remittance_lines_*.csv`, so `debtors:tag-check` labels every other account
`PATTERN_ONLY` and reports its remittance-contradiction check as inert. Plan for
that: on a `PATTERN_ONLY` account the tier order below *is* the evidence, backed
by the account's payment pattern, the business rules for that payer type, and
operator judgement recorded in `config/payment_pattern_overrides.json` or
`config/ratification_scenarios.json`. A pattern-derived settlement claim is
legitimate; an unrecorded one is not, because regeneration discards it. Always
state the basis alongside the conclusion — see `business_rules.md` §15 authority
order B.

Rule: `analysis/debtors/shared/docs/business_rules.md` §15.

---

## 5. Matching Algorithm (Tier Order)

Apply tiers in sequence. Operate on **summed payment-doc slices**, not raw rows.
**One payment doc = one pass.** No cross-doc logic.

### Tier 1 — Open Balance at Payment Date (primary)

**Primary:** summed slice vs **event net open at payment date**:
- Pure LPG: `LPG − CN offset − prior slices`
- **LPG + OTHER on same invoice:** `(LPG + OTHER) − CN offset − prior slices`

**Cross-check only:** ERP `ref_no` — flag `REF_DIVERGENCE` when clerk ref ≠ open-balance target.

| Match | Condition | allocation_type |
| :--- | :--- | :--- |
| Full | `ABS(slice − net_open) ≤ R0.05` (or trunc ±R1) | `OPEN_BALANCE_MATCH` |
| Partial | `slice < net_open − R1` and slice ≤ open | `OPEN_BALANCE_PARTIAL` |
| Closed | net open ≈ R0 | `UNALLOCATED` |

**Evidence:** `OPEN_BALANCE_AT_PAYMENT` · Confidence: **Confirmed** when amount aligns; ref agreement lowers `review_required`.

**WO0001 examples:**
| Payment | ERP ref | Invoice | Slice | Open @ pmt | Result |
| :--- | :--- | :--- | ---: | ---: | :--- |
| 38817 | 42216 | 42216 | R10,926.82 | R13,981.65 | `OPEN_BALANCE_PARTIAL` |
| 39582 | 42216 | 42216 | R3,054.83 | R3,054.83 | `OPEN_BALANCE_MATCH` (tail after 38817) |
| 42429 | 47876 | 47876 | R8,360.57 | R8,360.57 | `OPEN_BALANCE_MATCH` (LPG R6,560.57 + OTHER R1,800) |

### Tier 2 — Split Batch / Combination Match (Confirmed)

When one **payment doc#** total equals the sum of **2–3 full open LPG invoices**
(within **R1.00** trunc tolerance), allocate to all targets — **never FIFO cascade**.

**Condition:**
- `SUM(material slices)` per `(payment_doc, tx_date, batch_ref)` ≈ `open_A + open_B` (+ optional C)
- Each target invoice: `invoice_date ≤ payment_date`, open LPG > 0 at payment date
- Prefer matches where at least one slice carries an explicit `ref_no` to a target
- Mis-tagged ref slices (e.g. stale refs summing to second invoice) are overridden by combination

**Evidence:** `EXPLICIT_ALLOCATION` · **allocation_type:** `COMBINATION_MATCH`

**WO0001 example:** Pmt **30504** (STAT 102) → Inv **31468** + **31751** = R23,230.00 exact.

### Tier 3 — Credit Note Offset (before payment match)

Apply **before** Tier 1 / open-at-date calculations:

1. **Explicit CN ref:** `crd_note.ref_no → invoice.doc_no` within **+1 day** of invoice date.
2. **LPG lane only:** `cn_lpg = SUM(line_total) WHERE debt_group='LPG'` on the credit note.
3. **Net target:** `net_lpg = invoice_lpg + cn_lpg` (CN amounts are negative).
4. **CN-voided:** when `|net_lpg| ≤ R0.05`, exclude invoice from outstanding; flag any payment ref as review.
5. **Same-day delivery correction:** Invoice + CN same DN (e.g. Inv 50459 → CN 14829 → replacement Inv 50470).

**WO0001 example:** Inv **45582** (R12,431.63) ← CN **13203** (R-12,431.63) via ref_no, +1d → **net R0**, excluded from outstanding.

### Tier 4 — Amount-Proximity Fallback (Probable)

When a payment **cannot be matched by explicit DB reference** (blank ref, or
**no LPG invoice** exists for the stated `ref_no`). Explicit ref present but
amount mismatch → **Unallocated** (Tier 5), not proximity redirect.

**Condition:**
- Search open invoices with **posting date 3–14 days prior** to payment date
- `ABS(payment_amount - open_LPG_balance) <= R5.00`
- Invoice still has open LPG balance > 0 on payment date
- **Allocate immediately** to the best candidate — **do not** fall through to
  chronological FIFO cascade

**Evidence:** `PARTIAL_INVOICE_INFERENCE` · Confidence: **Probable**
**allocation_type:** `PROXIMITY_INFERENCE` · **review_required:** `true`

Tie-break: smallest variance, then most recent invoice date.

**WO0001 watchlist:** Doc `00043757` (STAT 124) — R16,628.00 blank ref.

### Tier 5 — Unallocated (Exception)

Remaining payment segments after all tiers:

**Evidence:** `ERP_LEDGER` · Confidence: **Exception** · **review_required:** `true`

---

## 6. Allocation Edges Schema

Write `allocation_edges.csv` with these columns:

| Column | Description |
| :--- | :--- |
| `allocation_id` | Sequential `AL-0001` |
| `payment_doc` | Payment document number |
| `payment_date` | ISO date |
| `batch_ref` | STAT / bank reference |
| `payment_amount` | Gross segment or consolidated total |
| `target_doc` | Invoice doc_no (blank if unallocated) |
| `target_date` | Invoice date |
| `target_lane` | Always `LPG` for invoice-linked accounts |
| `target_amount` | Match target used |
| `allocated_amount` | Amount applied |
| `residual_after_allocation` | Remaining on payment segment |
| `allocation_type` | `EXPLICIT_REF` / `SPLIT_PAYMENT_PORTION` / `ROUNDING_RESIDUAL` / `PROXIMITY_INFERENCE` / `UNALLOCATED` |
| `evidence_source` | Per ALLOCATION_DOCTRINE |
| `confidence` | `Confirmed` / `Probable` / `Exception` |
| `commercially_confirmed` | `true` only with remittance advice |
| `review_required` | Boolean |
| `notes` | Audit trail |

---

## 7. Override Registry (Per-Invoice)

Human-approved overrides live in:
`analysis/debtors/[DEBTOR]/config/payment_pattern_overrides.json`

**Never hardcode debtor overrides in shared scripts.**

Each override entry must include:

```json
{
  "payment_doc": "00043757",
  "payment_date": "2026-03-23",
  "target_doc": "49682",
  "allocated_amount": 16628.00,
  "override_type": "VERIFIED_EXPLICIT_REF",
  "approval_status": "approved",
  "approved_by": "name",
  "approved_date": "YYYY-MM-DD",
  "reason": "Bank remittance confirms DN-222xx pair",
  "evidence_source": "remittance_advice",
  "reconciled_month": "2026-03"
}
```

Use `override_type` values:
- `VERIFIED_EXPLICIT_REF` — ref_no or remittance confirms invoice
- `VERIFIED_SPLIT_BATCH` — multi-invoice STAT batch verified
- `VERIFIED_PROXIMITY_MATCH` — amount-proximity accepted by operator
- `VERIFIED_UNALLOCATED` — confirmed unallocated cash (surplus)

Do not claim customer intent unless remittance advice or equivalent exists.
Use **"best-fit allocation"** in narrative unless intent is proven.

---

## 8. Required Report Template

Save as `analysis/debtors/[DEBTOR]/reports/[DEBTOR]_Payment_Allocation_v1.md`.

### Section 1 — Executive Summary
- Total payments analysed (excl Alloc/Recon)
- Tier 1 Confirmed count / amount
- Tier 4 Probable count / amount
- Tier 5 Unallocated count / amount
- LPG open balance after allocation vs ERP stated balance

### Section 2 — Confirmed Allocations (Tier 1 & 2)

| Payment Doc | Date | STAT Ref | Segment Ref | Amount | Target Invoice | Inv Date | Match Target (LPG) | Variance | Type |
| :--- | :--- | :--- | :--- | ---: | :--- | :--- | ---: | ---: | :--- |

### Section 3 — Credit Note Offsets Applied

| CN Doc | CN Date | Ref Invoice | CN Amount | Effect on Open Balance |

### Section 4 — Probable / Review Required (Tier 4)

| Payment Doc | Date | Amount | Candidate Invoice | Proximity Δ | Notes |

### Section 5 — Unallocated Pool (Tier 5)

| Payment Doc | Date | STAT Ref | Amount | Notes |

### Section 6 — Reconciliation Bridge

| Component | Amount |
| :--- | ---: |
| ERP stated balance | |
| Sum allocated to LPG invoices | |
| Sum unallocated payments | |
| Sum open LPG invoices (post-allocation) | |
| **Bridge variance** | must be **R0.00** |

---

## 9. Execution Checklist

1. **Read mandatory context:** `ALLOCATION_DOCTRINE.md`, `business_rules.md`, debtor `project.json`.
2. **Confirm payer class:** Verify invoice-linked behaviour (>50% of payments have
   non-blank `ref_no` pointing to invoice docs). If not, switch to
   `lpg-payment-pattern-analysis`.
3. **Load data:** Prefer `analysis/debtors/[DEBTOR]/data/` CSVs; else query Supabase
   (`transaction_headers` for payments, `vw_clean_transactions` for LPG lines).
4. **Exclude Alloc/Recon:** Document group nets; flag leaky groups.
5. **Consolidate payment segments** by `(payment_doc, tx_date, batch_ref)`.
6. **Apply CN offsets** (Tier 3) before payment matching.
7. **Run Tier 1 → 2 → 4 → 5** for each segment; write `allocation_edges.csv`.
8. **Compute bridge** (Section 6); variance must resolve to R0.00 or be flagged.
9. **Write report**; append `project.json` history if material.
10. **Run** `npm run debtors:sync`.

### Query snippet — Tier 1 discovery

```sql
SELECT p.doc_no AS pmt_doc, p.tx_date, ABS(p.amount_excl) AS pmt_amt,
       p.ref_no, h.doc_no AS inv_doc,
       ROUND(h.amount_excl + h.tax_amount, 2) AS inv_header,
       ROUND(SUM(v.line_total) FILTER (WHERE v.debt_group = 'LPG'), 2) AS inv_lpg
FROM transaction_headers p
JOIN transaction_headers h
  ON LTRIM(p.ref_no,'0') = LTRIM(h.doc_no,'0')
 AND h.account_no = p.account_no
 AND h.entry_type = 'Invoice'
LEFT JOIN vw_clean_transactions v
  ON LTRIM(v.doc_no,'0') = LTRIM(h.doc_no,'0')
 AND v.account_no = h.account_no
 AND v.entry_type = h.entry_type
WHERE p.account_no = :debtor
  AND p.entry_type = 'Payment'
  AND p.ref_no NOT IN ('Alloc','Recon','')
GROUP BY p.doc_no, p.tx_date, p.amount_excl, p.ref_no, h.doc_no, h.amount_excl, h.tax_amount
ORDER BY p.tx_date DESC;
```

---

## 10. WO0001 — Known Patterns & Exceptions

Document these when working WO0001; generalize for similar debtors.

| Pattern | Handling |
| :--- | :--- |
| Exact ref match | Tier 1 — primary path (~80%+ of 2026 cash flow) |
| STAT batch split | Tier 2 — one EFT, 2–3 invoice refs |
| Rounding residual (≤R1) | Absorb into parent consolidation group |
| Blank ref R16,628 (doc 43757) | Tier 4/5 — **review required**; do not auto-allocate |
| `-EMPTY` deposit pairs | Exclude from LPG match target; net R0.00 on gas ledger |
| DN correction chains | Tier 3 CN offset before re-matching replacement invoice |
| AGR/OTHER lines | Exclude from LPG lane entirely |

**STAT cadence:** Monthly batches (`STAT 122`–`STAT 127` in 2026), typically
1–3 weeks after invoice month-end.

---

## 11. Anti-Patterns (Do Not)

| Anti-pattern | Why |
| :--- | :--- |
| Applying monthly batch heuristics from JIM001 | Wrong payer class — ref_no is signal, not noise |
| Matching against VAT-exclusive invoice amounts | Systematic 15% mismatch |
| Testing a single ERP row vs full invoice LPG | Splits are non-canonical — always sum first |
| Prepayment / instalment rescue logic | One EFT = one pass; no cross-doc sums |
| Cumulative ref across payment docs | Instalments excluded — see §4.6 |
| Account-wide FIFO without event window | Pays ancient debt — use open events in scope |
| FIFO pool without ref_no evidence | Destroys audit trail for invoice-linked payers |
| Hardcoding WO0001 overrides in shared scripts | Violates override registry doctrine |
| Claiming "customer intended" without remittance | Overstates evidence strength |
| Including Alloc/Recon rows in balance or match pool | Inflates/deflates cash totals |

---

## 12. Future Automation (reserved)

Shared script target (not yet implemented):

```bash
node analysis/debtors/shared/scripts/payment_doc_allocation_2025.mjs   # payment-doc combine
node analysis/debtors/shared/scripts/payment_to_invoice_allocation.mjs \  # future general runner
  --debtor WO0001 --tolerance 0.05 --from 2026-01-01
```

Until that script exists, agents implement the tier algorithm directly (Node or
Python against Supabase / local CSVs) and write workspace artifacts manually.

---

## 13. Skill Selection Guide

```
Does >50% of payment value have ref_no → invoice.doc_no?
├── YES → SKILL_Payment_To_Invoice_Allocation (this skill)
└── NO  → Does customer pay monthly STAT totals against pooled debt?
          ├── YES → lpg-payment-pattern-analysis
          └── NO  → debtors-analysis_Skill + manual investigation
```

**Known account mapping (as of Jun 2026):**

| Account | Skill |
| :--- | :--- |
| WO0001 | Payment-to-Invoice (this skill) |
| JIM001 | LPG Payment Pattern Analysis |
| JEN001 | Reconciliation skill (running balance + CYL strip) |
| FAM000 | CSV ground truth skill |
