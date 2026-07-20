# TWK002 Settlement Discount Doctrine (v1)

**Account:** TWK002 — TWK AGRI PTY LTD  
**Status:** Superseded by **v2** (2026-07-13) — retained for 2023 Turn 1–6 audit trail  
**Current doctrine:** `TWK002_Settlement_Discount_Doctrine_v2.md`  
**Scope:** 2023 remittance-batch discount journal reconstruction (v1 original scope)

---

## 1. Commercial model (Model B)

| Element | Ruling |
| :--- | :--- |
| Cash received | Customer pays **97.5%** of eligible document VAT-inclusive total |
| ERP journal | One consolidated **`DISCOUNT ALLOWED`** journal per **remittance batch** for the 2.5% remainder |
| Settlement identity | `remittance_cash + net_discount_journal ≈ net_settled_incl` |
| Tolerance | **0.1%** of batch settled total |
| ERP state (2023) | Discount journals **not yet posted** — pro forma tasks required |

---

## 2. Discount calculation

Per document on remittance (VAT-inclusive header = `AMOUNT` in TXT when tax is embedded):

```text
eligible_invoice:
  discount_allowed  = ROUND(doc_incl × 0.025, 2)   # journal credit (negative in AR)
  cash_expected     = ROUND(doc_incl × 0.975, 2)

late_invoice (paid after terms):
  discount_allowed  = 0
  cash_expected     = doc_incl

credit_note_on_remittance:
  discount_reversal = ROUND(|doc_incl| × 0.025, 2)   # positive journal (undo prior discount)
```

**Eligibility:** Per invoice — paid within **30 days of invoice month-end**. Late invoices in the same remittance pay **100%** (no discount).

**Rounding:** Document level first; consolidated journal = sum of line amounts for the batch.

---

## 3. Remittance-batch posting rules

| Rule | Ruling |
| :--- | :--- |
| Journal granularity | **One consolidated journal per remittance batch** |
| Post date | **Payment date** (remittance date) |
| `ref_no` linkage | Invoice `doc_no` and/or credit note `doc_no` covered by remittance |
| Batch scope | May span **multiple billing months** (late payments) |
| CN reversal | Only for CNs **explicitly indicated on remittance** |
| Alloc mirrors | Exclude zero-net `Alloc` groups before calculation |
| Exceptions | **Per invoice** — registered in `config/settlement_discount_overrides.json` |

---

## 4. Evidence hierarchy (four tiers)

| Tier | Source | Role |
| :--- | :--- | :--- |
| **1** | **Remittance advice** (bank / TWK) | Canonical **cash** and authoritative settlement line list |
| **2** | **Operator analysis** (spreadsheet) | Discount math, doc allocation, exception flags — *not* a substitute for Tier 1 |
| **3** | **TXT export** (`raw/TWK002.TXT`) | ERP document headers, payment posting, running balance |
| **4** | **Commercial terms** | 2.5% formula and 30-day rule |

> Operator analysis drives pro forma journal **calculation**; remittance advice is required for **cash sign-off** on Deliverable 1.

---

## 5. Deliverables & artifact layout

| Turn | Deliverable | Artifacts |
| :--- | :--- | :--- |
| 1 | Scaffold | `project.json`, `raw/TWK002.TXT`, this doctrine, empty overrides |
| 2 | Pilot batch | `data/remittance_*`, `proforma_journals_2023.csv`, pilot report |
| 3 | Full 2023 missing journals | `TWK002_Missing_Discount_Journals_2023.md` |
| 4 | Invoice exceptions | Populated `settlement_discount_overrides.json` |
| 5 | Recreated ledger | `recreated_ledger_2023.csv` + narrative |
| 6 | Optional | Discount-aware payment pattern analysis |

**Storage:** CSV canonical facts; Markdown audit narrative; Google Sheet optional for finance tick-off. **No pro forma journals in Postgres.**

---

## 6. Skill relationship

| Skill | Applicability |
| :--- | :--- |
| `lpg-payment-pattern-analysis` | Base monthly-batch family — extend with discount-aware expected cash |
| `SKILL_Payment_To_Invoice_Allocation` | **Not applicable** — TWK is monthly batch, not invoice-linked ref_no |
| `ALLOCATION_DOCTRINE.md` | CYL included in discount base (unlike JIM001 LPG-only strip) |
