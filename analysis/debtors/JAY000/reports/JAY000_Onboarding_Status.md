# JAY000 — Onboarding Status

**Updated:** 2026-09-08  
**Lane:** DTRX-header reconstruction only — **not** `position_recon` v5 (no statement TXT)  
**reconState:** **pending**

---

## Account

| Field | Value |
| :--- | :--- |
| Debtor code | **JAY000** |
| Trading name | **JAYZ GRILL** (DTRX `account_name` — confirm from ERP `ACCOUNT:` header when DEBENQ lands) |
| Operator label | Jays Grill |
| Sibling accounts | **None identified** |

---

## Input inventory

| Input | Path | Status |
| :--- | :--- | :---: |
| ERP statement / DEBENQ TXT | `raw/` | ❌ **absent** — Sources Agent |
| DTRX headers | `data/dtrx_headers.csv` (9 rows) | ✅ pulled 2026-09-08 · last tx **2026-09-03** |
| DTRX items | `data/dtrx_items.csv` (10 lines) | ✅ same pull · item vs header variance **R0.00** |
| Reconstructed audit TXT | `raw/DTRX_RECONSTRUCTED_JAY000.TXT` | ⚠️ derived — `CURRENT BALANCE` is **ASSERTED** header-sum, not DEBENQ |
| Customer SOA (internal) | `reports/JAY000_Statement_of_Account.md` | ✅ draft — **do not send** |
| Header ledger | `reports/JAY000_DTRX_Header_Ledger.md` | ✅ |
| Ingest coverage | — | ❌ blocked (no TXT) |
| v5 statement | — | ❌ blocked (no TXT) |

---

## Reconstructed position (ASSERTED)

| Field | Amount (R) | Basis |
| :--- | ---: | :--- |
| Header-sum running total | **13,860.14** | **ASSERTED** — Σ `transaction_headers` excl+tax; `data/dtrx_header_statement.json` |
| Open 52688 DN#24274 | 12,967.57 | Header tagging; mixed LPG 6,930.07 + CYL 6,037.50 |
| Open 52793 DN#23979 | 892.57 | Header tagging after CN 15594 R-6,037.50 |
| LPG item net | 13,860.14 | **ASSERTED** — Σ item `line_total` |
| CYL item net | 0.00 | **ASSERTED** |
| Payments | 0 | No Payment / Bank rows in headers |

**Not PROVEN.** No DEBENQ `CURRENT BALANCE`. Tripwire: a statement TXT whose header ≠ R13,860.14 supersedes this draft.

---

## Exceptions

1. **CN 15594** (CYL empties, DN#24950 EMPTIES, R-6,037.50) has header `ref_no` **52793** (LPG gas invoice). Item stock is S.1 CYL. Open-invoice *split* is a screening hypothesis. Totals still tie.
2. Invoice **52688** is mixed LPG+CYL on one header (replacement for reversed 52631/52632 on 18 Aug 2026).

---

## Next commands

```bash
# After DEBENQ lands in raw/:
npm run debtors:ingest-check -- --debtor JAY000
npm run debtors:customer-statement -- --debtor JAY000 --as-at YYYY-MM-DD --pdf

# Refresh DTRX-only draft:
DATABASE_URL=... PGSSL_REJECT_UNAUTHORIZED=false npm run debtors:dtrx-header-export -- --debtor JAY000
npm run debtors:dtrx-header-statement -- --debtor JAY000 --as-at 2026-09-08 --pdf
```
