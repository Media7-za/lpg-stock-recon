# TWK002 — Pilot Batch Reconciliation

**Batch:** BATCH-2023-08-28  
**Remittance:** B226 / KRD4029225 (advice dated 17.08.2023)  
**Electronic paid:** 28.08.2023  
**Source:** `raw/28.08.2023.pdf` (Tier 1 remittance advice)  
**Generated:** 2026-07-12

---

## 1. Executive summary


| Component                                | Amount                            | Status                                   |
| ---------------------------------------- | --------------------------------- | ---------------------------------------- |
| Gross payable (settled docs)             | R27,393.41                        | ✅ Matches remittance                     |
| Settlement discount (2.5%) — remittance  | R469.22                           | ❌ **No DISCOUNT ALLOWED journal in TXT** |
| Settlement discount — ERP deposit alloc. | R814.22                           | ⚠️ **R345.00 over remittance** (see §3a) |
| Cash paid (electronic)                   | R26,924.19                        | ✅ In receipt `00023836` (posted 01/09)   |
| Settlement check                         | R26,924.19 + R469.22 = R27,393.41 | ✅                                        |


**ERP actions required:** Post consolidated `DISCOUNT ALLOWED` journal per remittance (TASK-0001, use **R469.22** not R814.22). Cash receipt confirmed via deposit `00023836` (TASK-0002 closed). Reconcile deposit discount variance (TASK-0003).

---

## 2. ERP linkage — corrected (deposit detail)

Receipt `**00023836`** in ERP **is** this remittance's cash — but posted as a **single gross payment**, not a separate R26,924.19 row.


| Layer                      | Date           | Amount                                 | Source                   |
| -------------------------- | -------------- | -------------------------------------- | ------------------------ |
| Remittance electronic paid | 28.08.2023     | R26,924.19 cash                        | `28.08.2023.pdf`         |
| TXT payment header         | **01.09.2023** | **R-27,738.41**                        | `raw/TWK002.TXT` line 41 |
| Deposit detail split       | 01.09.2023     | R26,924.19 + R814.22 disc = R27,738.41 | ERP View Deposit Detail  |


```text
TXT shows:     Payment 00023836  →  R27,738.41  (one line)
Deposit shows: Cash component    →  R26,924.19  (matches remittance ✅)
               Discount alloc.   →  R814.22     (inside deposit, not a journal in TXT)
```

**TASK-0002: CLOSED** — cash is reflecting in the TXT, embedded in receipt `00023836`.  
The earlier “missing payment” call was because we expected a **standalone R26,924.19 row on 28/08** — ERP instead posts **gross R27,738.41 on 01/09** with the net cash inside the deposit allocation.

### Open issues (replaces TASK-0002)


| Issue                           | Detail                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------- |
| **Post date lag**               | Bank/remittance 28/08 → ERP 01/09 (4 days)                                                  |
| **Discount variance**           | Remittance discount **R469.22** vs deposit allocation **R814.22** → gap **R345.00**         |
| **No DISCOUNT ALLOWED journal** | Discount exists in deposit detail but **not** as journal rows in TXT (TASK-0001 still open) |
| **Partial allocations**         | Deposit lines use slices (e.g. R345 on doc `20607`) not full remittance nets                |


---

## 3. Remittance line register (18 documents)


| Doc       | Type     | Date       | Gross         | Discount   | Net           | Eligible |
| --------- | -------- | ---------- | ------------- | ---------- | ------------- | -------- |
| 00020607  | Invoice  | 24.05.2023 | 3,450.00      | 0.00       | 3,450.00      | No       |
| 00021123  | Invoice  | 08.06.2023 | 5,175.00      | 0.00       | 5,175.00      | No       |
| 00021597  | Invoice  | 23.06.2023 | 6,900.00      | 172.50     | 6,727.50      | Yes      |
| 00022058  | Invoice  | 06.07.2023 | 7,245.00      | 181.13     | 7,063.87      | Yes      |
| 00022060  | Invoice  | 06.07.2023 | 7,059.90      | 176.50     | 6,883.40      | Yes      |
| 00022255  | Invoice  | 12.07.2023 | 5,359.00      | 133.98     | 5,225.02      | Yes      |
| 00022268  | Invoice  | 12.07.2023 | 6,900.00      | 172.50     | 6,727.50      | Yes      |
| 00005038  | Crd Note | 20.07.2023 | -3,105.00     | -77.63     | -3,027.37     | Yes      |
| 00005308  | Crd Note | 20.07.2023 | -6,555.00     | -163.88    | -6,391.12     | Yes      |
| 00005498  | Crd Note | 20.07.2023 | -6,900.00     | -172.50    | -6,727.50     | Yes      |
| 00022626  | Invoice  | 21.07.2023 | 8,621.01      | 215.53     | 8,405.48      | Yes      |
| 00022627  | Invoice  | 21.07.2023 | 10,350.00     | 258.75     | 10,091.25     | Yes      |
| 00022702  | Invoice  | 24.07.2023 | 2,213.50      | 55.34      | 2,158.16      | Yes      |
| 00022739  | Invoice  | 24.07.2023 | 1,725.00      | 43.13      | 1,681.87      | Yes      |
| 00005603  | Crd Note | 26.07.2023 | -7,590.00     | -189.75    | -7,400.25     | Yes      |
| 00005155  | Crd Note | 31.07.2023 | -5,175.00     | -129.38    | -5,045.62     | Yes      |
| 00005443  | Crd Note | 02.08.2023 | -6,210.00     | -155.25    | -6,054.75     | Yes      |
| 00005632  | Crd Note | 04.08.2023 | -2,070.00     | -51.75     | -2,018.25     | Yes      |
| **Total** |          |            | **27,393.41** | **469.22** | **26,924.19** |          |


**Not on remittance** (in TXT but excluded): `00023075`, `00023077`, `00005768` (03.08.2023 D/N 5865 pair). Note: `00023077` **does** appear on deposit `00023836` as a R345 partial — not on remittance advice.

---

## 3a. Remittance vs deposit — per-document variance

Side-by-side comparison of **remittance advice** (`28.08.2023.pdf`) vs **ERP deposit detail** (receipt `00023836`).  
Canonical CSV: `data/remittance_vs_deposit_variance_2023.csv`


| Doc             | Type | Rem gross     | Rem disc   | Rem net       | Dep cash      | Dep disc   | Dep gross     | Δ Disc      | Δ Cash vs rem net | Flag      |
| --------------- | ---- | ------------- | ---------- | ------------- | ------------- | ---------- | ------------- | ----------- | ----------------- | --------- |
| 00020607        | Inv  | 3,450.00      | 0.00       | 3,450.00      | 345.00        | 0.00       | 345.00        | 0.00        | -3,105.00         | PARTIAL   |
| 00021597        | Inv  | 6,900.00      | 172.50     | 6,727.50      | 345.00        | 0.00       | 345.00        | -172.50     | -6,382.50         | DISC Δ    |
| 00022058        | Inv  | 7,245.00      | 181.13     | 7,063.87      | 1,035.00      | 0.00       | 1,035.00      | -181.13     | -6,028.87         | DISC Δ    |
| 00022060        | Inv  | 7,059.90      | 176.50     | 6,883.40      | 6,883.40      | 176.50     | 7,059.90      | 0.00        | 0.00              | **MATCH** |
| 00022255        | Inv  | 5,359.00      | 133.98     | 5,225.02      | 5,225.02      | 133.98     | 5,359.00      | 0.00        | 0.00              | **MATCH** |
| 00022626        | Inv  | 8,621.01      | 215.53     | 8,405.48      | 8,405.48      | 215.53     | 8,621.01      | 0.00        | 0.00              | **MATCH** |
| 00022627        | Inv  | 10,350.00     | 258.75     | 10,091.25     | 2,527.13      | 232.87     | 2,760.00      | -25.88      | -7,564.12         | DISC Δ    |
| 00022702        | Inv  | 2,213.50      | 55.34      | 2,158.16      | 2,158.16      | 55.34      | 2,213.50      | 0.00        | 0.00              | **MATCH** |
| 00022739        | Inv  | 1,725.00      | 43.13      | 1,681.87      | -345.00       | 0.00       | -345.00       | -43.13      | -2,026.87         | DISC Δ    |
| 00023077        | Inv  | —             | —          | —             | 345.00        | 0.00       | 345.00        | —           | —                 | DEP ONLY  |
| 00005038        | CN   | -3,105.00     | -77.63     | -3,027.37     | —             | —          | —             | —           | —                 | REM ONLY  |
| 00005155        | CN   | -5,175.00     | -129.38    | -5,045.62     | —             | —          | —             | —           | —                 | REM ONLY  |
| 00005308        | CN   | -6,555.00     | -163.88    | -6,391.12     | —             | —          | —             | —           | —                 | REM ONLY  |
| 00005443        | CN   | -6,210.00     | -155.25    | -6,054.75     | —             | —          | —             | —           | —                 | REM ONLY  |
| 00005498        | CN   | -6,900.00     | -172.50    | -6,727.50     | —             | —          | —             | —           | —                 | REM ONLY  |
| 00005603        | CN   | -7,590.00     | -189.75    | -7,400.25     | —             | —          | —             | —           | —                 | REM ONLY  |
| 00005632        | CN   | -2,070.00     | -51.75     | -2,018.25     | —             | —          | —             | —           | —                 | REM ONLY  |
| 00021123        | Inv  | 5,175.00      | 0.00       | 5,175.00      | —             | —          | —             | —           | —                 | REM ONLY  |
| 00022268        | Inv  | 6,900.00      | 172.50     | 6,727.50      | —             | —          | —             | —           | —                 | REM ONLY  |
| **Batch total** |      | **27,393.41** | **469.22** | **26,924.19** | **26,924.19** | **814.22** | **27,738.41** | **+345.00** | —                 |           |


### How to read the flags


| Flag         | Meaning                                                                                |
| ------------ | -------------------------------------------------------------------------------------- |
| **MATCH**    | Deposit cash, discount, and gross align with remittance for that doc (2.5% verified)   |
| **PARTIAL**  | Deposit allocates a slice (e.g. R345) — no discount mismatch but incomplete settlement |
| **DISC Δ**   | Discount on deposit ≠ remittance (or 2.5% rule broken on `00022627`)                   |
| **REM ONLY** | On remittance but not allocated on deposit — mostly **7 CNs** and 2 full invoices      |
| **DEP ONLY** | On deposit (`00023077`) but not on remittance advice                                   |


### Key findings from variance table

1. **4 docs fully match** (`22060`, `22255`, `22626`, `22702`) — ERP discount is correct 2.5% on these.
2. `**00022627` is wrong on deposit** — discount R232.87 vs R69.00 expected (2.5% of R2,760 deposit gross).
3. **7 credit notes on remittance are absent from deposit** — remittance nets CN discount reversals; deposit ignores them → inflates total discount.
4. **Partial slices** (`20607`, `21597`, `22058`) drop remittance discounts entirely on deposit.
5. **Batch cash matches** (R26,924.19) but **deposit gross is R345 higher** than remittance gross (R27,738.41 vs R27,393.41) — driven by extra discount allocation and `00023077` on deposit.

---

## 4. Pro forma journal (TASK-0001)

Post **one consolidated journal** on **2023-08-28**:

```text
Journal:  DISCOUNT ALLOWED
Amount:   R-469.22  (net credit to debtor)
Post date: 2023-08-28
Ref splits: 16 lines — see data/proforma_journals_2023.csv
```

Invoice ref splits are **negative** (discount allowed).  
CN ref splits are **positive** (discount reversal on credit notes).

---

## 5. Reconciliation bridge


| Step                                    | Amount           |
| --------------------------------------- | ---------------- |
| Sum net remittance lines                | R26,924.19       |
| Plus pro forma discount journal         | R469.22          |
| **Equals gross settled**                | **R27,393.41**   |
| Tolerance (0.1% of R27,393.41 = R27.39) | ✅ R0.00 variance |


---

## 6. Operator analysis vs remittance advice


| Finding               | Detail                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Analysis incomplete   | Screenshot covered mainly EMPTIES pairs; remittance includes **gas invoices** 22060, 22255, 22626, 22702                              |
| Payment link          | Operator analysis tied batch to `00023836` — **correct receipt**, but deposit discount allocation is **not** remittance-authoritative |
| Discount exceptions   | `20607`, `21123` — both sources agree **R0.00 discount**                                                                              |
| ADJ residual R-345.19 | Explained by mixing remittance gross with STAT 93 gross; see §3a variance table                                                       |


---

## 7. Next steps

1. **Finance:** Post TASK-0001 discount journal (**R-469.22** per remittance, not R814.22 deposit alloc.) dated 2023-08-28
2. **Finance:** Review TASK-0003 — correct deposit discount on `00022627`; decide CN reversal treatment
3. **Turn 4:** Register invoice exceptions for `20607`, `21123` if not standard late-payment rule
4. **Turn 3:** Provide remaining 2023 remittance PDFs for full missing-journal register

