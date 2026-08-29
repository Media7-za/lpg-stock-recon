# MD0003 — Onboarding Status

**Client:** BLUFF MEAT SUPPLY(PTY) LTD  
**Account:** MD0003  
**Terms:** 30T  
**Portfolio balance:** R12,005.45 (Jul 2026 global report)  
**Skill lane:** **Monthly batch** — `lpg-payment-pattern-analysis`  
**Status:** Turn 1 corrected — batch payer (not invoice-linked)

---

## Skill Selection (Corrected)

| Test | Result | Implication |
| :--- | :--- | :--- |
| Monthly STAT cadence | STAT 111–127, ~1 payment event/month | Batch payer |
| Payment doc gross vs signed ERP sum | Alloc/Recon mirror pairs net signed sum to ref slice only | **ref_no is clerical noise** — do not use invoice-linked skill |
| Example: Doc 35876 | Bank gross R134,731.73 (abs); signed sum R19,247.39 | ERP decomposition, not customer intent |
| 2026 docs (43494–44561) | Gross = non-Alloc abs; monthly match works | Confirms batch reconciliation model |

**Verdict:** Use `analysis/skills/lpg-payment-pattern-analysis/SKILL.md` — **not** Payment-to-Invoice Allocation.

> Turn 1 misclassified MD0003 because ref_no slices on recent STAT batches looked invoice-linked. Operator confirmed: **MD0003 pays batch payments.**

---

## Turn 1 Deliverables (Batch Skill)

| Artifact | Path | Status |
| :--- | :--- | :--- |
| 2025 pattern report | `reports/MD0003_2025_Payment_Pattern_Analysis.md` | Generated |
| 2026 pattern report | `reports/MD0003_2026_Payment_Pattern_Analysis.md` | Generated |
| Override registry | `config/payment_pattern_overrides.json` | Empty (v1) |

### Superseded (wrong skill — do not use)

| Artifact | Reason |
| :--- | :--- |
| `data/allocation_edges.csv` | Invoice-linked skill applied incorrectly |
| `reports/MD0003_Payment_Allocation_v1.md` | Superseded by payment pattern reports |
| `scripts/allocation_ingest.mjs` | Archived — batch payer uses shared `payment_pattern_analysis.py` |

---

## 2026 Batch Matching (Gross Level)

| Billing Month | LPG Billed | Payment Doc | Gross Paid | Status |
| :--- | ---: | :--- | ---: | :--- |
| 2026-02 | R13,773.92 | 43854 (STAT 125) | R13,773.92 | Paid in full |
| 2026-03 | R15,017.78 | 44231 (STAT 126) | R15,017.78 | Paid in full |
| 2026-04 | R13,014.20 | 44561 (STAT 127) | R13,014.20 | Paid in full |

Payment **44231** is **not** unallocated — it settles the March 2026 statement at gross batch level. The prior Tier 5 flag was an invoice-linked skill artefact.

---

## Open Items

1. **2025 remaining gaps** (May partial, Aug, Oct–Nov) — need remittances or updated AP export.
2. **2026-05 / 2026-06** — `01.07.2026.pdf` on file (R17,311.60); ERP payment **not yet posted**.
3. **2026-01** — R57.50 residual on payment 43494 (CYL slice 48927) — see `reports/MD0003_CYL_Deposit_Posting_Gap.md`.
4. **CYL finance (blocking)** — MD3-CYL-001: reallocate R3,047.50 to ref 46445 on payment 42051.
4. **CURRENT.TXT** — ingested → `data/erp_current_ledger.csv`, `reports/MD0003_CURRENT_TXT_Analysis.md`.

## Override registry (v5) — Customer AP ledger ingested

| Billing month | Payment | Source | Amount | Variance |
| :--- | :--- | :--- | ---: | ---: |
| 2022-11 | 17669 | 01.01.2023.pdf | R12,025.08 | R0.00 |
| **2025-01** | **37263** | **MD0003_DETAILED_LEDGER.xls** | **R21,718.57** | **R0.00** |
| **2025-06** | **40430** | **MD0003_DETAILED_LEDGER.xls** | **R3,755.57** | **R0.00** |
| **2025-07** | **41044** | **MD0003_DETAILED_LEDGER.xls** | **R9,895.88** | **R0.00** |
| 2025-09 | 42051 | 01.11.2025.pdf | R35,770.31 | R0.00 |
| 2025-12 | 43239 | 31.01.2026.pdf | R17,999.24 | R0.00 |
| 2026-01 | 43494 | 02.03.2026.pdf | R13,845.67 | R57.50 |
| 2026-02 | 43854 | 01.04.2026.pdf | R13,773.92 | R0.00 |
| 2026-03 | 44231 | 01.05.2026.pdf | R15,017.78 | R0.00 |
| 2026-04 | 44561 | 01.06.2026.pdf | R13,014.20 | R0.00 |
| 2026-05 | 44972 | 01.07.2026.pdf + DEBENQ | R17,311.60 | −R4,539.72 |
| **2026-06** | **45595** | **01.08.2026.pdf** | **R14,863.43** | **R4,689.53** |
| **2025-10** | **42440** (share) | DEBENQ ref slices | **R16,016.28** | **R0.00** |
| **2025-11** | **42440** (share) | DEBENQ ref slices | **R14,560.26** | **R0.00** |

### Customer A/P ledger (`MD0003_DETAILED_LEDGER.xls`)

| Artifact | Path |
| :--- | :--- |
| Raw export | `raw/Remittances/MD0003_DETAILED_LEDGER.xls` |
| Parsed CSV | `data/customer_ap_ledger_2024_2025.csv` |
| Analysis report | `reports/MD0003_Customer_AP_Ledger_Analysis.md` |

Snapshot **2025-09-08**: Jan–May invoices paid on customer books; Jun/Jul open items (R13,651.45) cent-exact match ERP 40430 + 41044.

### ERP CURRENT.TXT (`MD0003CURRENT.TXT`)

| Artifact | Path |
| :--- | :--- |
| Raw export | `raw/MD0003CURRENT.TXT` |
| Parsed CSV | `data/erp_current_ledger.csv` |
| Analysis report | `reports/MD0003_CURRENT_TXT_Analysis.md` |
| v4 config scaffold | `config/statement_v4.json` |

Closing balance **R16,371.56** (Jul 2026). Payment **44972** STAT:128 posted 2026-07-01 — closes May-2026 remittance batch.

---

## Next Steps

- [x] Ingest MD0003 CURRENT.TXT → `raw/Enquiry/DEBENQ_CURRENT.TXT` (through 09 Aug 2026)
- [x] STAT:129 remittance + override (payment **45595**)
- [x] Payment **42440** Oct/Nov slices matched via DEBENQ allocation detail
- [ ] Customer AP snapshot **10.10.2025** ingested to CSV (PDF on file; see `MD0003_Payment_42440_Match.md`)

**Regenerate reports:**
```bash
export DATABASE_URL="${DATABASE_URL//\?pgbouncer=true/}"
.venv_fam/bin/python3 analysis/debtors/shared/scripts/payment_pattern_analysis.py --debtor MD0003 --years 2022,2025,2026
```
