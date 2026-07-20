# TWK002 Settlement Discount Doctrine (v2)

**Account:** TWK002 — TWK AGRI PTY LTD  
**Status:** Active — supersedes v1 for 2024 extension and finance catch-up posting  
**Issued:** 2026-07-13  
**Prior version:** `TWK002_Settlement_Discount_Doctrine_v1.md` (2023 scope, locked 2026-07-12)  
**Scope:** 2023–2024 remittance-batch settlement discount reconciliation and ERP correction

---

## 1. Commercial model (Model B)

| Element | Ruling |
| :--- | :--- |
| Cash received | Customer pays **97.5%** of eligible document VAT-inclusive total |
| ERP journal | Consolidated **`DISCOUNT ALLOWED`** journal per **remittance batch** for the 2.5% remainder |
| Settlement identity | `remittance_cash + net_discount_journal ≈ remittance_gross` |
| Tolerance | **0.1%** of batch settled total |
| Unit of work | **Remittance batch** (not calendar month) |
| Discount base | CYL / EMPTIES included (unlike JIM001 LPG-only strip) |

```text
remittance_gross  = sum of payable lines on remittance advice
remittance_cash   = electronic transfer (bank)
remittance_disc   = settlement discount on remittance advice
remittance_gross  ≈ remittance_cash + remittance_disc   (per batch)
```

---

## 2. Discount calculation

Per document on remittance (VAT-inclusive header = `AMOUNT` in TXT when tax is embedded):

```text
eligible_invoice:
  discount_allowed  = ROUND(doc_payable × 0.025, 2)   # journal debit to 240000
  cash_expected     = ROUND(doc_payable × 0.975, 2)

late_invoice (paid after terms):
  discount_allowed  = 0
  cash_expected     = doc_payable

credit_note_on_remittance:
  discount_reversal = ROUND(|doc_incl| × 0.025, 2)   # reduces net batch discount
```

**Eligibility:** Per invoice — paid within **30 days of invoice month-end**. Late invoices in the same remittance pay **100%** (no discount).

**Authority:** Tier-1 remittance advice discount column is canonical. Naive `gross × 2.5%` is a check only; deviations are registered in `config/settlement_discount_overrides.json`.

**Rounding:** Document level first; consolidated journal = sum of line ref amounts for the batch.

---

## 3. ERP state by year

| Year | Payment posting | Discount journals | Typical correction |
| :--- | :--- | :--- | :--- |
| **2023** | **Gross** (cash + discount in one payment line) | **0** posted | Discount journal **+** payment correction (reclassification) |
| **2024** | **Mixed** — 5 cash-only; 5 **over-post** | **1 partial** (Oct R385.04) | Over-post: discount journal **+** payment correction; cash-only: journal only |

**Over-post family (2023 Aug/Nov + 2024 ×5):** ERP payment gross exceeds remittance gross. Orphan lives in payment **DISCOUNT** column (deposit detail), not in cash column.

```text
ERP payment     = remittance cash + remittance discount + orphan_slice
orphan_slice    = ERP payment gross − remittance gross
payment_strip   = ERP payment gross − remittance cash
                = remittance discount + orphan_slice
```

**2023 orphan total:** R690.00 (R345 × 2 on `00023836`, `00026681`).  
**2024 orphan total:** R6,374.90 (five receipts — see `reports/TWK002_Overpost_Investigation_2024.md`).

---

## 4. Posting paths (priority order)

### Path A — Ideal (operational Model B)

Per remittance batch, oldest first:

| Step | Action | When |
| :---: | :--- | :--- |
| A | Open remittance PDF + deposit detail | Always |
| B | Correct payment header to **remittance cash** | Over-post / gross-posted batches |
| C | Correct deposit **DISCOUNT** allocations | Over-post batches |
| D | Post **`DISCOUNT ALLOWED`** journal with ref splits | Always (missing or partial) |
| E | Verify: `cash + journal = remittance gross` | Always |

**Post date:** remittance **electronic paid date**.

### Path B — Catch-up journals (archived year locked)

When ERP will not allow backdated journals, post in the **first open period**. Economic event date goes in **remark / description**, not necessarily the journal header date.

**Per over-post receipt** — one balanced journal (four lines) or two journals:

```text
Discount leg:
  Dr 240000 (DISCOUNT ALLOWED)     [journal_amt]
      Cr TWK002                    [journal_amt]

Payment correction leg:
  Dr TWK002                        [payment_strip]
      Cr 240000 or payment reclass [payment_strip]

  payment_strip = journal_amt + orphan_slice
```

**Net AR movement** = `orphan_slice` only (Dr TWK002 net). Clean batches net to zero on the discount + correction pair.

**Cash-only 2024 batches:** discount leg only — no payment correction leg.

**Critical rule — gross-posted payments (2023):** posting a discount journal **without** a matching payment correction **over-credits** AR. Both legs are required when the payment header still reflects gross settlement.

### Path C — 2023 year rollup (finance shortcut)

Allowed for 2023 catch-up only:

| Journal | Amount | Notes |
| :--- | ---: | :--- |
| Discount allowed | **R3,329.12** | Sum of six batch journals; ref splits in `proforma_journals_2023.csv` |
| Payment correction | **R4,019.12** | Sum of six receipt strips (= R3,329.12 + R690.00 orphan) |

Path C departs from per-batch journal granularity; document in journal remarks. **2024 over-post batches use Path B per receipt**, not year rollup.

---

## 5. Journal granularity

| Case | Granularity |
| :--- | :--- |
| **Default (doctrine)** | One consolidated journal per remittance batch |
| **Path B over-post** | One FIX journal per ERP receipt (four lines validated) |
| **Path C 2023** | One discount + one payment correction for full year |
| **Ref splits** | Per `proforma_journals_20xx.csv`; zero-discount lines omitted |

**Journal remark minimum:** receipt doc · STAT · remittance ref (B226/…) · economic paid date.

---

## 6. Post date and validation

| Situation | Rule |
| :--- | :--- |
| Normal posting | Journal date = remittance **electronic paid date** |
| Archived period | Post in open period; remark cites economic batch date |
| TXT validation | Use export whose closing date is **after** journal post date |
| Row match | Catch-up journals will **not** appear on year-cutoff 2024 TXT — validate **balance delta**, not row-for-row match to recreated ledger dates |

**Sign-off check:** after posting, customer balance moves by **sum of orphan slices** corrected (2023: +R690; 2024 five over-posts: +R6,374.90 when all posted).

---

## 7. Exception registry

All deviations from naive 2.5% are registered in `config/settlement_discount_overrides.json` (`registryVersion` ≥ 2).

| Type | Meaning | Journal impact |
| :--- | :--- | :--- |
| `LATE_PAYMENT_NO_DISCOUNT` | Remittance shows R0 discount | Exclude doc from ref splits |
| `PARTIAL_SETTLEMENT` | Payable slice &lt; invoice gross | Discount on payable slice only |
| `CROSS_BATCH_RESIDUAL_NO_DISCOUNT` | Residual after prior batch slice | R0 discount on residual |
| `COMPOSITE_REMITTANCE_LINE` | Combined CN pair on remittance | Map to ERP CN doc_nos |
| `STATEMENT_ROUNDING` | No ERP document | Exclude from ref splits |
| `NET_NEGATIVE_DISCOUNT` | CN reversals &gt; invoice discounts | **Positive** journal (Sep-24) |
| `LATE_CATCHUP_BATCH` | Late docs at 100%; disc on current lines only | Mar-24 pattern |
| **Already paid footer** | Remittance `already_paid` column | **Not** new settlement — never re-embed in payment gross |

**Already paid rule:** remittance footer `already_paid` (e.g. Mar-24 **R3,598.81** on doc `00023075`) is informational. EXC-2024-0001: Mar batch settles **R345 residual only**; ERP re-embedding the Sep-23 block causes orphan **R3,575.49** on `00029684`.

Reports: `reports/TWK002_Invoice_Exceptions_2023.md` · overrides JSON for 2024 entries.

---

## 8. Special batches

### Sep-24 — net negative discount (EXC-2024-0004)

CN reversals exceed invoice discounts. Journal posts **positive R233.10**:

```text
Dr TWK002  R233.10
    Cr 240000  R233.10
```

Verify: `remittance_cash − journal = remittance_gross` → R2,984.27 − R233.10 = R2,751.17.

### Oct-24 — partial journal replacement

ERP state: journal `00000334` (**R385.04** partial) + ghost payment line on `00034518`. Target: full journal **R983.04** (`00036005` R385.04 + `00036006` R598.00). Reverse partial; post full consolidated amount. Payment cash R38,338.45 is already correct — **journal only**.

**Cross-link:** `00036006` R598.00 = stale R23,920 slice absorbed as Aug orphan on `00033224`.

### Out of scope — do not post

| Receipt | Reason |
| :--- | :--- |
| `00037732` | Orphan reversed by Bank UD — net zero |
| `00036467` | Jan-2025 STAT 110 — outside 2024 remittance set |

---

## 9. Deposit detail vs balance correction

| Layer | Path A | Path B journals |
| :--- | :--- | :--- |
| Customer **balance** | Corrected | **Corrected** |
| Payment **header** amount | Reduced to cash | Unchanged (compensated by journals) |
| **View Deposit Detail** lines | Corrected | May remain wrong until operational cleanup |

Deposit line cleanup is **recommended** for operational audit but **not required** for settlement arithmetic when Path B is used.

---

## 10. GL accounts

| Account | Role |
| :--- | :--- |
| **240000** | `DISCOUNT ALLOWED` — expense; debit on discount leg |
| **TWK002** | Customer trade debtors (AR) |
| **Payment reclass / suspense** | Preferred **credit** on payment-correction leg (avoids netting 240000) |

**GL netting note:** if payment-correction leg credits **240000**, the account nets to `orphan_slice` credit — customer balance is still correct; P&L discount expense may not show clean per-batch amounts. Use payment reclass when management accounts require it.

---

## 11. Evidence hierarchy (unchanged)

| Tier | Source | Role |
| :--- | :--- | :--- |
| **1** | **Remittance advice** | Canonical cash and settlement line list |
| **2** | **Operator analysis** | Discount math and exception flags — not substitute for Tier 1 |
| **3** | **TXT export** | ERP headers, payments, running balance |
| **4** | **Commercial terms** | 2.5% formula and 30-day rule |

---

## 12. Deliverables and artifacts

### 2023 (complete)

| Artifact | Path |
| :--- | :--- |
| Pro forma journals | `data/proforma_journals_2023.csv` |
| Recreated ledger | `data/recreated_ledger_2023.csv` |
| Missing journals report | `reports/TWK002_Missing_Discount_Journals_2023.md` |
| Invoice exceptions | `reports/TWK002_Invoice_Exceptions_2023.md` |

### 2024 (complete — analysis)

| Artifact | Path |
| :--- | :--- |
| Pro forma journals | `data/proforma_journals_2024.csv` |
| Recreated ledger | `data/recreated_ledger_2024.csv` |
| Over-post investigation | `reports/TWK002_Overpost_Investigation_2024.md` |
| Deposit detail | `data/deposit_detail_2024.csv` |
| ERP linkage | `reports/TWK002_ERP_Linkage_2024.md` |

### Finance posting (in progress)

| Artifact | Path |
| :--- | :--- |
| Task register | `data/finance_posting_checklist.csv` |
| Posting guide | `reports/TWK002_Finance_Posting_Checklist.md` |
| Control panel | `reports/TWK002_Settlement_Control_Panel.html` |

**Storage:** CSV canonical facts; Markdown audit narrative. **No pro forma journals in Postgres.**

---

## 13. Skill relationship

| Skill | Applicability |
| :--- | :--- |
| `lpg-payment-pattern-analysis` | Extend with discount-aware expected cash |
| `SKILL_Payment_To_Invoice_Allocation` | **Not applicable** — TWK is monthly batch, not invoice-linked ref_no |
| `ALLOCATION_DOCTRINE.md` | CYL included in discount base |

---

## 14. Version history

| Version | Date | Change |
| :---: | :--- | :--- |
| v1 | 2026-07-12 | Model B scaffold; 2023 remittance-batch rules |
| v2 | 2026-07-13 | 2024 ERP patterns; orphan family; Path B/C catch-up; exception types; already_paid; Sep/Oct specials; GL and validation rules |
