# TWK002 — Invoice-Level Discount Exceptions (2023)

**Account:** TWK002 · TWK AGRI PTY LTD  
**Turn:** 4 — Override registry populated  
**Generated:** 2026-07-12  
**Registry:** `config/settlement_discount_overrides.json`

---

## 1. Summary

| Metric | Count |
| :--- | ---: |
| Remittance lines analysed | 51 |
| Lines with standard 2.5% discount | 44 |
| **Registered exceptions** | **7** |
| Zero-discount lines (no override needed) | 0 beyond exceptions |

Of 51 remittance lines, **44** follow the standard 2.5% formula on the remittance payable amount. **7** deviate and are registered as overrides with evidence and reason codes.

> **Authority rule:** Tier-1 remittance advice discount column is canonical. Overrides document *why* a line differs from naive `gross × 2.5%`, not to change remittance amounts.

---

## 2. Exception register

| ID | Doc | Batch | Type | Gross | Payable | Remit. disc. | Naive 2.5% | Reason |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: | :--- |
| EXC-0001 | 00020607 | 08-28 | `LATE_PAYMENT_NO_DISCOUNT` | 3,450.00 | 3,450.00 | 0.00 | 86.25 | Paid 59d past May terms |
| EXC-0002 | 00021123 | 08-28 | `LATE_PAYMENT_NO_DISCOUNT` | 5,175.00 | 5,175.00 | 0.00 | 129.38 | Paid 29d past June terms |
| EXC-0003 | 00023075 | 09-26 | `PARTIAL_SETTLEMENT` | 3,943.81 | 3,598.81 | 89.97 | 98.60 | R345 prior slice settled elsewhere |
| EXC-0004 | 00024011 | 10-26 | `PARTIAL_SETTLEMENT` | 8,532.19 | 5,082.19 | 127.05 | 213.30 | First slice of split invoice |
| EXC-0005 | 00024011 | 11-27 | `CROSS_BATCH_RESIDUAL_NO_DISCOUNT` | 8,532.19 | 3,450.00 | 0.00 | 86.25 | Residual after EXC-0004 |
| EXC-0006 | 5845/5875 | 09-26 | `COMPOSITE_REMITTANCE_LINE` | -197.17 | -197.17 | -4.93 | -4.93 | Combined CN pair on remittance |
| EXC-0007 | STMT-DIFF-AUG23 | 09-26 | `STATEMENT_ROUNDING` | -0.02 | -0.02 | 0.00 | 0.00 | No ERP doc; excluded from ref splits |

**Machine-readable audit:** `data/discount_exception_audit_2023.csv`

---

## 3. Exception detail

### EXC-0001 / EXC-0002 — Late payment, no discount (pilot batch)

Both invoices appear on the **28.08.2023** remittance with **R0.00 discount** despite being EMPTIES-deposit pairs settled in the same batch as discounted gas invoices.

| Doc | Invoice date | Terms deadline | Paid | Days late | TWK action |
| :--- | :--- | :--- | :--- | ---: | :--- |
| 00020607 | 24.05.2023 | 30.06.2023 | 28.08.2023 | 59 | Pay 100% |
| 00021123 | 08.06.2023 | 30.07.2023 | 28.08.2023 | 29 | Pay 100% |

**Journal impact:** These docs are **excluded from ref splits** in `proforma_journals_2023.csv` (zero-discount lines omitted). Consolidated batch total remains **R-469.22** per remittance.

**Evidence:** `raw/Remittances/28.08.2023.pdf` · operator analysis (pre-remittance flag)

### EXC-0003 — Partial settlement (`00023075`)

September remittance shows:

| Field | Amount |
| :--- | ---: |
| Invoice gross (TXT) | 3,943.81 |
| Payable on remittance | 3,598.81 |
| Prior slice | **345.00** |
| Discount on payable | 89.97 (2.5% × 3,598.81) |

The R345.00 gap matches the recurring ERP deposit variance pattern seen on receipts `00023836` and `00026681`.

### EXC-0004 / EXC-0005 — Cross-batch split (`00024011`)

Invoice `00024011` (R8,532.19) is settled across two remittance batches:

```text
Oct batch (26.10.2023):  payable R5,082.19  discount R127.05  (2.5% on slice)
Nov batch (27.11.2023):  payable R3,450.00  discount R0.00   (residual, ALREADY PAID R5,082.19)
                         ─────────────────────────────────────
                         Total:              R8,532.19         R127.05
```

Discount is taken **once**, on the first slice only — consistent with TWK remittance practice.

### EXC-0006 — Composite CN line

Remittance lists `5845/5875` as one SC/IN for R-197.17. ERP has separate CNs `00005845` (R-5,520) and `00005875` (R-197.19). Journal ref split uses the composite key; ERP CN gross mismatch is a separate stock-recon item.

### EXC-0007 — Statement rounding

TWK statement difference R-0.02 on August 2023 close. No ERP document; excluded from journal ref splits but included in batch footer total.

---

## 4. Lines confirmed standard (no override)

All other remittance lines — including April invoices on the **26.06.2023** batch paid 27+ days after strict month-end+30 terms — received **full 2.5% discount per remittance**. TWK's operational practice grants discount beyond strict calendar terms on those lines; remittance is authoritative and no override is registered.

**Notable standard lines (pilot batch):**

| Doc | Type | Discount | Notes |
| :--- | :--- | ---: | :--- |
| 00022060 | Gas invoice | 176.50 | Confirmed on remittance; absent from operator screenshot |
| 00022255 | Gas invoice | 133.98 | Same |
| 00022626 | Gas invoice | 215.53 | Same |
| 00022702 | Gas invoice | 55.34 | Same |
| 00022627 | EMPTIES | 258.75 | Deposit alloc mismatch flagged in pilot — remittance amount stands |

---

## 5. Pro forma journal ref splits (updated)

`data/proforma_journals_2023.csv` now includes **ref-level splits for all 6 batches**:

| Batch | Consolidated | Ref lines | Zero-disc excluded |
| :--- | ---: | ---: | ---: |
| BATCH-2023-06-26 | R-1,160.62 | 5 | — |
| BATCH-2023-07-26 | R-203.65 | 2 | — |
| BATCH-2023-08-28 | R-469.22 | 14 | 20607, 21123 |
| BATCH-2023-09-26 | R-367.10 | 8 | STMT-DIFF |
| BATCH-2023-10-26 | R-426.60 | 7 | — |
| BATCH-2023-11-27 | R-701.93 | 8 | 24011 residual |

Ref split sums reconcile to consolidated batch totals ✅

---

## 6. Sign-off

| # | Check | Result |
| :---: | :--- | :---: |
| 1 | All zero-discount lines explained | ✅ |
| 2 | Partial settlements documented | ✅ |
| 3 | Cross-batch splits linked | ✅ |
| 4 | Override registry populated | ✅ 7 entries |
| 5 | Pro forma ref splits complete | ✅ all 6 batches |

---

## 7. Next turn

**Turn 5:** Recreated ledger CSV (`recreated_ledger_2023.csv`) with pro forma `DISCOUNT ALLOWED` journals inserted at payment dates, plus narrative report.
