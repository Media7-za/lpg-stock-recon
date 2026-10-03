# CAP000 Allocation Gap Analysis

**Account:** CAPITOL CATERERS SELECT (PTY)  
**Code:** CAP000  
**As At:** 30 September 2026  
**Status:** Allocation Pending — Requires Manual Review or Remittance Advice

---

## Summary

The DEBENQ account enquiry for CAP000 was exported with **ALLOCATION DETAIL EXCLUDED**, meaning the INVNO (invoice reference) column is omitted. This was a deliberate ERP configuration choice to exclude untrustworthy ERP payment-allocation metadata.

As a result, **8 payment transactions totaling R184,013.63** (`PROVEN` from `data/allocation_edges.csv` row sum; prior prose total R182,213.63 was an arithmetic error of R1,800.00, corrected 2026-10-03) **cannot be automatically matched to open invoices** using heuristic methods (exact-sum, contiguous-run, proximity).

---

## Unmatched Payments

| Payment Doc | Date | Amount (R) | Reference | Status |
|:---|:---|---:|:---|:---|
| 00038536 | 2025-05-07 | 35,844.65 | TRANSF \| STAT 114 | Unallocated |
| 00041466 | 2025-09-29 | 97,933.00 | TRANSF \| STAT 118 | Unallocated |
| 00042043 | 2025-10-31 | 7,120.32 | TRANSF \| STAT 119 | Unallocated |
| 00042518 | 2025-12-01 | 12,750.48 | TRANSF \| STAT 121 | Unallocated |
| 00042697 | 2025-12-18 | 8,356.32 | TRANSF \| STAT 121 | Unallocated |
| 00043235 | 2026-02-05 | 3,656.43 | TRANSF \| STAT 123 | Unallocated |
| 00043472 | 2026-02-26 | 8,443.46 | TRANSF \| STAT 123 | Unallocated |
| 00043872 | 2026-03-31 | 9,908.97 | TRANSF \| STAT 124 | Unallocated |
| **TOTAL** | — | **184,013.63** | — | — |

---

## Why Allocation Failed

1. **No INVNO column in export** — The DEBENQ TXT deliberately excluded allocation detail to avoid using unreliable ERP payment-to-invoice mappings.

2. **No exact-sum matches** — Tested against 129 invoices; no single or contiguous invoice set exactly matched payment amounts.

3. **No remittance advice on file** — CAP000 has not provided customer remittance advices or payment breakdowns.

4. **Partial payments likely** — Payment amounts are irregular relative to invoice amounts, suggesting multi-invoice payments or prior settlement offsets not captured in the TXT.

---

## Next Steps (Choose One)

### Option A: Obtain Remittance Advice
**Partial progress 2026-10-03:** 3 of 8 remittance Excel files located on Google Drive with exact amount matches (R51,321.29 / 27.9%) — see `raw/Remittances/CAP000_REMITTANCE_MAPPING.md` and `reports/CAP000_Remittance_Discovery_2026-10-03.md`. Files are **not yet downloaded/ingested**; edges remain `UNALLOCATED` (amount match = ASSERTED, not PROVEN allocation).

Next: download the 3 `.xlsx` into `raw/Remittances/`, extract invoice lines, write `REMITTANCE_EXPLICIT` edges, then:
```bash
npm run debtors:reconciliation-status -- --debtor CAP000
```
Still request remittances for the remaining **5 payments (R132,692.34)**.

### Option B: Manual Allocation Review
Manually update `analysis/debtors/CAP000/data/allocation_edges.csv`:
- For each unmatched payment, specify `target_doc` (invoice number or list)
- Set `target_date`, `lpg_target_amount`, `allocated_amount`
- Change `allocation_type` to `MANUAL_ALLOCATION`
- Set `confidence` to `Medium` or `High`
- Set `review_required` to `false` once verified

### Option C: Accept Pending State
Leave `reconState: "pending"` in `project.json`.  
CAP000 remains in allocation review queue until remittance advice or manual mapping is supplied.

---

## Evidence Classification (Per PDP-46)

| Field | Value | Rationale |
|:---|:---|:---|
| `settlement_unit` | UNALLOCATED_CASH_PENDING_ANALYSIS | Payments not yet assigned to invoices |
| `evidence_tier` | 5 | Lowest confidence (DEBENQ-only, no document evidence) |
| `evidence_status` | ASSUMED | No proof; amount reconstructed from balance changes only |

This reflects the deliberate ERP DEBENQ-only posture: it gives correct **account balance** (R70,773.28, verified) and **aged debt breakdown**, but cannot yield invoice-level settlement detail without external evidence (remittance advice).

---

## Reconciliation Status Current State

- **Open invoices (gross):** 129 invoices, R417,499.21
- **Unallocated payments:** R184,013.63 (`PROVEN` — sum of `data/allocation_edges.csv`)
- **Account balance (verified):** R70,773.28 ✓
- **Tag-check gate:** SKIPPED (NOT_DERIVABLE_FROM_TXT — expected)

The account's overall balance is reconciled. The open-invoice allocation remains pending customer evidence.

