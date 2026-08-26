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

## Related

- [`lpg_costing_and_supplier_rules.md`](lpg_costing_and_supplier_rules.md) — supplier SKU and costing rules
- [`AP_Recon_Workflow.md`](AP_Recon_Workflow.md) — ingest → reconcile lifecycle
- Debtor parallel: [`../../debtors/shared/DEBTORS_DOCTRINE.md`](../../debtors/shared/DEBTORS_DOCTRINE.md)
