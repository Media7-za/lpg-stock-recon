# MD0003 — CYL Deposit Posting Gap (Finance Pull)

**Generated:** 2026-07-17  
**Account:** MD0003 — BLUFF MEAT SUPPLY(PTY) LTD  
**Priority:** 1 — blocking ERP corrections  
**Evidence:** Supabase `transaction_headers` + `vw_clean_transactions` + COD remittances

> **Schema note:** There is no `journal_entries` table in this database. CYL deposit posting is represented by **Payment `ref_no` slices** on `transaction_headers`. `entry_type = 'Journal'` exists but has **no rows** referencing docs 46445 or 48927.

---

## Executive summary

| Invoice | Lane | Invoice gross | Remittance (customer) | ERP payment `ref_no` slice | Variance | Finance action |
| :--- | :---: | ---: | ---: | ---: | ---: | :--- |
| **46445** | CYL | **R3,105.00** | **R3,105.00** (01.11.2025 / pay **42051**) | **R57.50** | **R3,047.50** | **Reallocate / journal — blocking** |
| **48927** | CYL | R5,462.50 | R5,462.50 **less** C/N 14328 R5,520.00 = **net −R57.50** (02.03.2026 / pay **43494**) | R57.50 (+ve sign) | Net aligns; CN not on payment doc | Review sign + CN allocation; lower priority |

**Root cause (46445):** ERP clerk posted only the **19.1 vs 14.1 deposit rate differential (R57.50)** against ref **46445**. Customer remittance and bank gross confirm **full R3,105.00** CYL settlement intent. The remaining **R3,047.50** is in payment **42051** gross but **not tagged to the CYL invoice ref**.

**R57.50 identity:** `690.00 − 632.50 = 57.50` (19.1 kg deposit line vs 14.1 kg deposit line on the same empty invoice pattern).

---

## Invoice 46445 — line detail

**Header** (`transaction_headers`)

| Field | Value |
| :--- | :--- |
| Doc | 46445 |
| Date | 2025-09-17 |
| Description | DN#20387-EMPTY- ROS |
| Header total | **R3,105.00** (R2,700 + R405 VAT) |
| Lane | CYL-only (EMPTY) |

**Lines** (`vw_clean_transactions`)

| SKU | Qty | Unit (retail) | Line total | Lane |
| :--- | ---: | ---: | ---: | :--- |
| 19.1 | 1 | R600 | **R690.00** | CYL |
| S.1 | 2 | R1,050 | **R2,415.00** | CYL |
| **Total** | | | **R3,105.00** | |

**Same-day credit note 13494** (not on Nov remittance)

| CN | Ref | Header | CYL lines | Notes |
| :--- | :--- | ---: | ---: | :--- |
| 13494 | 46445 | R−3,445.00 | R−3,047.50 | Return pairing DN#20387 — **not** netted on COD advice |

---

## Payment 42051 — ref slice vs remittance

**COD remittance 01.11.2025:** line **46445 = R3,105.00** (full deposit).  
**Bank gross (non-Alloc ref slices):** **R35,770.31** ✓ cent-exact to remittance.

**ERP payment ref slice on 46445:**

| Payment doc | Date | ref_no | amount_excl | batch_ref |
| :--- | :--- | :--- | ---: | :--- |
| 42051 | 2025-11-01 | 46445 | **−R57.50** | STAT:121 |

**No payment slice** on CN 13494 for doc 42051.

| Metric | Amount |
| :--- | ---: |
| Remittance line (customer intent) | R3,105.00 |
| ERP ref slice | R57.50 |
| **Unposted to CYL ref** | **R3,047.50** |
| Payment doc gross (unchanged) | R35,770.31 |

**Impact:** Cash left the customer correctly. ERP **under-allocates** the CYL deposit on ref 46445; the R3,047.50 is absorbed in other LPG `ref_no` slices on the same payment doc (clerical decomposition), so **CYL invoice 46445 remains open** on deposit ledger logic.

---

## Invoice 48927 — line detail (repeat pattern, different remittance shape)

**Header:** 48927 | 2026-01-22 | DN#21502- EMPTY | **R5,462.50**

**Lines**

| SKU | Qty | Line total |
| :--- | ---: | ---: |
| 14.1 | 1 | R632.50 |
| S.1 | 4 | R4,830.00 |
| **Total** | | **R5,462.50** |

**COD remittance 02.03.2026 (payment 43494)**

| Doc | Remittance amount |
| :--- | ---: |
| 48927 | R5,462.50 |
| C/N 14328 | **R−5,520.00** |
| **Net CYL on advice** | **R−57.50** |

**ERP payment 43494 ref slices:** LPG refs R13,903.17 + **48927 R57.50** (positive `amount_excl` — sign anomaly) = **R13,845.67** gross ✓

| Metric | Amount |
| :--- | ---: |
| Remittance net CYL (48927 + CN14328) | −R57.50 |
| ERP slice on 48927 | R57.50 |
| **CN 14328 on payment doc** | **None** |

**Conclusion:** For **48927**, customer **netted** invoice + credit on the remittance; ERP **R57.50** matches **net CYL cash**, not the R5,462.50 gross invoice line. The Jan-2026 **R57.50 LPG billing residual** in pattern analysis is this net CYL effect — **not** the same class of error as 46445. Still worth fixing: allocate **CN14328** on payment 43494 and normalise sign.

---

## Adapted SQL (executed 2026-07-17)

```sql
-- Invoice line detail (replaces journal_entries — table does not exist)
SELECT h.entry_type, LTRIM(h.doc_no,'0') AS doc_no, h.ref_no, h.tx_date AS inv_date,
       v.debt_group, v.stock_no AS sku, v.qty, v.retail_price AS unit_price,
       v.line_total, h.amount_excl + h.tax_amount AS header_total
FROM transaction_headers h
LEFT JOIN vw_clean_transactions v
  ON h.account_no = v.account_no AND h.entry_type = v.entry_type
 AND LTRIM(h.doc_no,'0') = LTRIM(v.doc_no,'0')
WHERE h.account_no = 'MD0003'
  AND h.entry_type = 'Invoice'
  AND LTRIM(h.doc_no,'0') IN ('46445','48927')
ORDER BY h.doc_no, v.stock_no;

-- Payment ref slices (deposit posting proxy)
SELECT LTRIM(doc_no,'0') AS payment_doc, tx_date AS payment_date, ref_no,
       amount_excl, tax_amount, batch_ref
FROM transaction_headers
WHERE account_no = 'MD0003'
  AND entry_type = 'Payment'
  AND LTRIM(ref_no,'0') IN ('46445','48927')
  AND ref_no NOT IN ('Alloc','Recon');
```

---

## Finance posting checklist (ERP Agent)

| ID | Status | Task | Amount |
| :--- | :--- | :--- | ---: |
| **MD3-CYL-001** | **OPEN** | Payment **42051**: reallocate **R3,047.50** to CYL ref **46445** (currently only R57.50 posted; remittance confirms R3,105.00) | R3,047.50 |
| **MD3-CYL-002** | OPEN | Investigate CN **13494** pairing with 46445 (same day, not on remittance) — confirm deposit return before/after payment | R3,445.00 CN |
| **MD3-CYL-003** | OPEN | Payment **43494**: allocate **CN14328** on payment doc; fix **+R57.50** sign on ref 48927 | Net −R57.50 |

**Do not** treat Bluff as using a separate CYL deposit account — both lines are on **GAZ001 COD** remittances.

---

## Balance impact statement

| Scenario | Effect |
| :--- | :--- |
| **46445 uncorrected** | CYL deposit **R3,047.50** appears unpaid on invoice ref despite customer remittance — **overstates collectable** on CYL lane |
| **48927** | Net cash **R57.50** matches remittance; gross **R5,405.00** “gap” is **CN netting on advice**, not missing bank cash |

**Recon lane:** After **MD3-CYL-001** posts, regenerate payment pattern / position reports and close `REVIEW_CYL_REF` exceptions on AL-0034 / AL-0006.
