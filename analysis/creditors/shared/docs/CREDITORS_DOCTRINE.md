# Creditors Portfolio — Constitutional Doctrine

**Status:** Draft (008ORY pilot)  
**Scope:** `analysis/creditors/` — AP / supplier reconciliation

---

## Evidence hierarchy

| Tier | Source | Decides |
| :--- | :--- | :--- |
| **3** | ERP creditor enquiry TXT (`CURRENT BALANCE`) | AP balance, v5 pass gate |
| **1** | `vw_clean_transactions` line qty / `debt_group` | LPG vs CYL split, Part 2 shell qty |
| **Advisory** | Supplier-side ledgers (Oryx SAINV/SACRN) | Cross-check only — not balance authority |

## Ingest model (creditors)

| Document | DB requirement | Authority |
| :--- | :--- | :--- |
| `GRV` / `Deb Note` | STDatabase line items (`CURRENT.TXT`) | Lines for SKU split + Part 2 qty |
| `Payment` / `Bank XFer` / etc. | None (no STDatabase lines) | ERP CREDENQ TXT (Tier-3) |

**Rule:** Never build Part 1 running balance from Supabase headers alone. ERP TXT is Tier-3 authority. Creditor AP headers are **not** ingested via DTRX (debtor lane).

---

## Document mapping (008ORY / Oryx)

| ERP entry | Role | v5 lane |
| :--- | :--- | :--- |
| `GRV` | Supplier charge (goods received) | Part 1A / 1B via SKU split |
| `Deb Note` | Supplier credit / return | Part 1A / 1B via SKU split |
| `Payment` | Cash to supplier | Part 1A (default `paymentLane: LPG`) |

SKU routing: `.4` → LPG (Part 1A), `.1` → CYL deposit (Part 1B).

---

## Pass gates (v5)

- ERP variance (reconstructed vs `CURRENT BALANCE`) = **R0.00**
- Sub-ledger tie (1A + 1B vs combined running) = **R0.00**

---

## Volume rebate (memo lane)

Volume rebates are **earned entitlement, not ledger balance**. They are computed from delivered kg, not read from the ERP, so they must never enter the Part 1 running balance — doing so would break the ERP variance gate.

| Aspect | Rule |
| :--- | :--- |
| Placement | Memo section after Part 2; excluded from Part 1A / 1B and both pass gates |
| Basis | Latest `[CODE]_LPG_Volume_Monthly_*.json` (net kg × tier rate) — never recomputed inside v5 |
| Settlement (008ORY) | Oryx issues a **credit note**, so VAT is an input-tax reversal and the incl-VAT figure is the credit note face value |
| Credit detection | ERP TXT reference text match, `rebate.creditRefPattern` in config |
| Double-count guard | A received credit note is a real ledger entry and already sits in Part 1A / 1B; the memo tracks claim lifecycle only |

**Claim position** = rebate earned (incl VAT) − credit notes received = outstanding claim.

---

## Supplier ledger comparison (advisory)

The supplier's own ledger is **advisory only** — it never adjusts our balance.

**Join key: month + SO sequence.** SO sequences **restart every month**, so a bare sequence is not unique. The supplier's own form carries the month (`SON2607ZA105000048` → 2026-07 / 048); our ERP records only the sequence in the `SUPPLIER/BANK REF` column (`SON049`, `SON#128`, `SON 174`, `SO#067`, `#0093`) and takes its month from the row date. Verified on 008ORY: their SO month equals our GRV month in every amount-matched pair across Jan–Aug 2026.

| Their type | Our equivalent |
| :--- | :--- |
| `SAINV` | `GRV` (gross charge) |
| `SACRN` | `Deb Note` (cylinder deposit credit) |
| `ARPAY` / `APPAY` | payment rows |
| `CAFOO` | their carry-forward — excluded |

**Match tiers:** exact month-scoped SO → same SO with amount variance → same sequence one month apart (boundary booking) → unmatched with ranked fuzzy candidates for ratification.

Payments carry bank references (`STAT 129`, `C-COUNT`, `FNB-…`) rather than an SO, so they match on amount plus date within tolerance. Their ledger is a **snapshot**: our payments dated after its `Total Balance as at` date are reported as out of scope, not as discrepancies. Fuzzy candidates already consumed by a confirmed match are flagged `[already matched]`, since a good-looking but spoken-for candidate is evidence of a duplicate on our side rather than a link to make.

Their recon export is a **working paper, not a flat ledger**: blank rows separate delivery cycles and the SO appears once per block, so it is applied block-wide. A free-text `Rebate` tag on that working paper is an annotation, not a document type — only a credit note whose *description* matches the rebate pattern is treated as a rebate credit, so a tagged payment stays in the payment lane.

**Human ratification is durable.** `data/supplier_ledger_matches.csv` is a disposable work queue regenerated on every run; conclusions live in `data/supplier_ledger_decisions.csv`, which the script only reads. `SAME_DELIVERY` joins one of our SO references to one of theirs; `MERGE_GROUP` joins one of ours to several of theirs and is applied *before* matching, so the group is judged on combined totals. Either way the variance that survives ratification is the real one. Linking decisions can never close an item, and any decision that cannot be honoured is reported rather than applied silently.

**A reversed delivery is excluded, not compared.** Our ERP cancels a delivery by raising a Deb Note that credits back its linked GRV in full. The pair nets to zero and never reaches the supplier's ledger, so both legs are dropped from the document comparison — left in, they overstate our charge *and* our deposit credit by the same amount and surface as a variance in both lanes. Detection is by amount, not wording: a genuine deposit credit is a fraction of the load (008ORY: 5%–72% of gross), so a credit equal to its GRV within tolerance is unambiguous, whereas the SO reference is unreliable (some reversals read `REV GRV #6216`, others carry an ordinary `SON###`). Credits above 90% of gross that are not full reversals are listed as a watch list rather than excluded.

**A reused SO reference is our error, not a variance.** A delivery is one GRV plus its deposit Deb Note; two or more GRVs under one SO reference means our capture reused it across separate loads. Their side numbers loads individually, so the comparison otherwise reports our combined total against one fragment of theirs. These are flagged automatically and resolved with `MERGE_GROUP`. Note the supplier may cross deposit credits between invoices within a cluster — that nets to zero, so such SOs agree only in aggregate.

See [`Supplier_Ledger_Ratification_Guide.md`](Supplier_Ledger_Ratification_Guide.md).

Run: `npm run creditors:supplier-recon -- --creditor CODE`

---

## Related

- [`Supplier_Ledger_Ratification_Guide.md`](Supplier_Ledger_Ratification_Guide.md) — operator guide for working the open items
- [`lpg_costing_and_supplier_rules.md`](lpg_costing_and_supplier_rules.md) — supplier SKU and costing rules
- [`AP_Recon_Workflow.md`](AP_Recon_Workflow.md) — ingest → reconcile lifecycle
- Debtor parallel: [`../../debtors/shared/DEBTORS_DOCTRINE.md`](../../debtors/shared/DEBTORS_DOCTRINE.md)
