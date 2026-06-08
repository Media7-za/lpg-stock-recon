# SKU Suffix Mapping — Active Patterns (2025/2026)

> **Scope:** This document covers the three active SKU suffix patterns in use from 2025/2026.
> Historical suffixes (`.3` Easigas) are recorded in `src/lib/skuConfig.ts` but are not active in this period.

---

## The Core Rule

Every cylinder delivery generates **two line items** on the same invoice — one for the gas fill, one for the cylinder deposit bond. The suffix encodes both the **brand** and the **financial category**.

```
Invoice DN-21759
  ├── 19.4   19kg LPG Gas Fill (Oryx)        → LPG ledger  (Part 1)
  └── 19.1   19kg Cylinder Deposit Bond       → CYL ledger  (Part 2)
```

The two lines are inseparable on the source document but must be split into separate ledgers at classification time.

---

## Suffix `.1` — Cylinder Deposit / Bond (Shell Asset)

**Category:** `CYL_DEPOSIT` | **Ledger:** CYL | **Refundable:** Yes

| SKU | Size | Standard Deposit Rate |
|---|---|---|
| `9.1` | 9kg | R517.50 |
| `14.1` | 14kg | R575.00 |
| `19.1` | 19kg | R690.00 |
| `S.1` | 48kg Single-Valve | R1,150.00 |
| `D.1` | 48kg Double-Valve | R1,150.00 |

### Rules

- The `.1` deposit SKU is **brand-neutral** — it represents the physical cylinder shell regardless of which supplier filled it. It appears on both Oryx-brand and MZM-brand invoices.
- On **GRV (creditors):** `.1` SKUs net to zero (deposit charged in, returned on Debit Note). Must be **excluded from LPG cost-per-kg calculations**.
- On **debtor invoices:** `.1` SKUs are stripped from the LPG gas ledger and tracked separately in the CYL ledger.
- Historically variable deposit pricing means `cylinderFinancialBalance ≠ cylinderCustodyExposure` is a valid operating state — not a bug (see FAM000: R7,532.50 variance).
- Deposit rates must always be fetched from the database — never hardcoded (INV-001).

### Citations
- `analysis/debtors/shared/docs/business_rules.md` — §5 SKU Dual-Line Pattern, §10 CYL Zeroing Rule
- `analysis/creditors/shared/docs/lpg_costing_and_supplier_rules.md` — §1 SKU Conventions (Rule 2: Cylinder Deposit Exclusion)
- `src/lib/skuConfig.ts` — `depositSkus` map
- `docs/governance/entity_definitions.md` — Standard deposit rates table

---

## Suffix `.4` — LPG Gas Fill, Oryx Energy Brand

**Category:** `LPG_CONTENT` | **Ledger:** LPG | **Refundable:** No (consumed product)
**Supplier accounts:** `008ORY` (active Mar 2025 onwards), `007ORY` (legacy to Feb 2025)

| SKU | Size | Paired Deposit SKU |
|---|---|---|
| `9.4` | 9kg | `9.1` |
| `14.4` | 14kg | `14.1` |
| `19.4` | 19kg | `19.1` |
| `S.4` | 48kg Single-Valve | `S.1` |
| `D.4` | 48kg Double-Valve | `D.1` |

### Rules

- Appears on GRVs from Oryx (`008ORY` / `007ORY`) and on debtor invoices for Oryx-branded stock.
- The `.4` line (gas fill) and the `.1` line (cylinder deposit) always appear **together** on the same invoice document.
- `.4` SKUs go into the LPG gas statement (Part 1 — financial ledger). `.1` SKUs go into the CYL ledger (Part 2).
- Supplier account `007ORY` is the legacy code — any transactions before March 2025 from Oryx will carry this code.

### Citations
- `analysis/creditors/shared/docs/lpg_costing_and_supplier_rules.md` — §1 SKU table (Oryx rows)
- `src/lib/skuConfig.ts` — `contentSkuToSize` and `contentSkuToBrand` maps (`9.4 → Oryx`)
- `src/lib/reconciliationEngine.test.ts` — test fixtures use `9.4`, `19.4`

---

## Suffix `x01` — LPG Gas Fill, MZM Distribution (Multibrand)

**Category:** `LPG_CONTENT` | **Ledger:** LPG | **Refundable:** No (consumed product)
**Supplier accounts:** `002MZM` (active Mar 2025 onwards), `001MZM` (legacy to Mar 2025)

| SKU | Size | Paired Deposit SKU |
|---|---|---|
| `901` | 9kg | `9.1` |
| `1401` | 14kg | `14.1` |
| `1901` | 19kg | `19.1` |
| `S01` | 48kg Single-Valve | `S.1` |
| `D01` | 48kg Double-Valve | `D.1` |

### Rules

- The `01` suffix is a **numeric** pattern (no dot separator) — `901` not `9.01`.
- `s01` (lowercase) is a known ERP variant — treated identically to `S01`.
- In the ERP CSV text export, a cylinder deposit document is identified by its `CUSTOMER/BANK REF` field ending in `-EMPTY` (e.g. `DN-21759-EMPTY`). These rows must be stripped before computing the LPG financial balance (CYL Stripping Rule — business_rules.md §11).
- `INC001` (walk-in / COD account) uses these SKUs extensively for counter sales.
- Supplier account `001MZM` is the legacy code — transactions before March 2025 from MZM will carry this code. `003MZM` exists as a rare adjustment code (July 2025, very few records).

### Citations
- `analysis/debtors/shared/docs/business_rules.md` — §5 SKU table (`x01` rows), §11 CYL Document Stripping Rule
- `analysis/creditors/shared/docs/lpg_costing_and_supplier_rules.md` — §1 SKU table (MZM rows)
- `src/lib/skuConfig.ts` — `contentSkuToSize` entries for `901`, `1901`, `S01`, `D01`, `s01`

---

## Full Summary Table

| Suffix | Brand / Supplier | Supplier Code | Category | Ledger | On GRV? | On Debtor Invoice? |
|---|---|---|---|---|---|---|
| `.1` | Brand-neutral (Shell asset) | N/A | `CYL_DEPOSIT` | CYL | Yes — nets to zero; excluded from cost calc | Yes — stripped from LPG ledger, tracked in CYL |
| `.4` | Oryx Energy | `008ORY` / `007ORY` | `LPG_CONTENT` | LPG | Yes — primary stock intake | Yes |
| `x01` | MZM Distribution | `002MZM` / `001MZM` | `LPG_CONTENT` | LPG | Yes — primary stock intake | Yes |

---

## Classification Logic (Implementation Reference)

```typescript
// src/lib/skuConfig.ts

// Deposit SKUs — one per size, brand-neutral
depositSkus: {
  '9kg': '9.1', '14kg': '14.1', '19kg': '19.1', 'SV': 'S.1', 'DV': 'D.1'
}

// Content SKUs — size lookup
contentSkuToSize: {
  '9.4': '9kg',  '901':  '9kg',
  '14.4': '14kg', '1401': '14kg',
  '19.4': '19kg', '1901': '19kg',
  'S.4':  'SV',   'S01':  'SV',  's01': 'SV',
  'D.4':  'DV',   'D01':  'DV'
}

// Content SKUs — brand lookup
contentSkuToBrand: {
  '9.4': 'Oryx',  '901':  'Multibrand',
  '14.4': 'Oryx', '1401': 'Multibrand',
  '19.4': 'Oryx', '1901': 'Multibrand',
  'S.4':  'Oryx', 'S01':  'Multibrand',
  'D.4':  'Oryx', 'D01':  'Multibrand'
}
```

---

## Key Invariants

1. `.1` always travels with either a `.4` or an `x01` on the same invoice.
2. A non-zero `cylinderVariance` (financial balance ≠ custody exposure) is a **disclosed operating outcome**, not a bug — caused by historical deposit rate changes.
3. Deposit rates are fetched from the database at runtime — never hardcoded (INV-001).
4. `.1` SKUs must never enter the LPG cost-per-kg calculation engine (creditor side) or the LPG financial ledger (debtor side).
5. `-EMPTY` suffixed document references in the ERP CSV export identify cylinder deposit documents and must be stripped before computing LPG balances.
