# MD0003 — Open Invoices

**As-at:** 9 August 2026 (last row in `raw/Enquiry/DEBENQ_CURRENT.TXT`)  
**Account:** MD0003 — BLUFF MEAT SUPPLY(PTY) LTD  
**ERP `CURRENT BALANCE`:** **R18,853.36**  
**Source:** `raw/Enquiry/DEBENQ_CURRENT.TXT` + COD remittance advices

> **Linked account:** MD0004 (BMS FOODS (PTY) LTD) is the **same customer/entity** — confirmed same trading name MD0003 used historically, plus explicit "XFER TO MD0003" transfer notes on MD0004 credit notes. Last known MD0004 balance: **R4,413.86** (stale, 13 Jul 2025 snapshot, unreconciled — no live ledger export yet). See `MD0003_MD0004_Combined_Exposure.md` for full detail and combined group total.

---

## Business rule — no partial invoice payment

**MD0003 does not part-pay invoices.** Bluff pays **monthly STAT batches** against remittance-listed documents at **full invoice gross**. An invoice is either:

- **Fully settled** — listed on a COD remittance (or verified month batch) → **omit** from open list, or  
- **Fully open** — entire LPG gas line amount remains due.

Do **not** derive open amounts by FIFO / running-balance slicing across later-month invoices. Every STAT batch reconciles to exactly one month of net billing (see bridge). The ERP balance sits below the invoice schedule because of a **standing credit on the account**, not because any invoice is part-paid.

---

## Summary

|                                                         | Amount (R)    |
| ------------------------------------------------------- | ------------- |
| Open LPG gas invoices (full lines below)                | 30,599.47     |
| CYL ledger residual (Aug deposit pair 52422 / CN 15422) | 517.50        |
| **Commercial open position**                            | **31,116.97** |
| Standing ledger credit on account                       | (12,263.61)   |
| **ERP `CURRENT BALANCE`**                               | **18,853.36** |

The ERP header is authoritative for **amount to remit**. The invoice table is the **full open schedule** by remittance/month doctrine. The difference is **not** part-payment and **not** a July timing effect — it is a long-standing credit balance carried on the account since November 2025.

---

## Reconciliation bridge (schedule → ERP, incl. CYL)

| Bridge line                                      | Amount (R)      | Basis                                                              |
| ------------------------------------------------ | --------------- | ------------------------------------------------------------------ |
| **A. Open LPG gas schedule**                     | **30,599.47**   | 51470 + full July month + 52421                                    |
| **B. CYL net residual**                          | **517.50**      | 52422 R1,035.00 + CN 15422 (R517.50); all other Jun–Jul pairs net R0 |
| **= Commercial open position**                   | **31,116.97**   | A + B                                                              |
| **C. Standing ledger credit**                    | **(12,263.61)** | Unallocated credit on account since the Nov 2025 catch-up payment  |
| **= ERP `CURRENT BALANCE`**                      | **18,853.36**   | A + B − C ✓                                                        |

### Why STAT:129 does not appear in the bridge

Payment **45595** (R14,863.43) settles **June** invoices **50996 + 50998 + 51099 + 51398**, which sum to **exactly R14,863.43**. Those four docs are already **excluded** from the open schedule, so the payment and the invoices it settled cancel out. Netting the payment against the schedule a second time would be a double-count — the July invoices were never touched by it.

Likewise **44972** (STAT:128, R17,311.60) settles **May** billing exactly. Every STAT batch from 124 to 128 matches one month of net LPG billing to the cent:

| STAT | Paid       | Month settled | Net billing that month |
| ---- | ---------- | ------------- | ---------------------- |
| 124  | 13,845.67  | Jan 2026      | 13,845.67 ✓            |
| 125  | 13,773.92  | Feb 2026      | 13,773.92 ✓            |
| 126  | 15,017.78  | Mar 2026      | 15,017.78 ✓            |
| 127  | 13,014.20  | Apr 2026      | 13,014.20 ✓            |
| 128  | 17,311.60  | May 2026      | 17,311.60 ✓            |
| 129  | 14,863.43  | Jun 2026      | 19,902.95 — **51470 omitted** |

The pattern is a clean **two-month lag**: cash on the 1st of month *M* settles month *M−2* billing in full. No part-payment anywhere.

### C — the standing credit

Measured after each batch as *(commercial open − ERP balance)*, the credit is a **constant**:

| After STAT | Date        | ERP balance | Commercial open | Credit         |
| ---------- | ----------- | ----------- | --------------- | -------------- |
| 125        | 01 Apr 2026 | 2,754.17    | 15,017.78       | 12,263.61      |
| 126        | 04 May 2026 | 750.59      | 13,014.20       | 12,263.61      |
| 127        | 01 Jun 2026 | 5,047.99    | 17,311.60       | 12,263.61      |
| 128        | 01 Jul 2026 | 7,639.34    | 19,902.95       | 12,263.61      |

**Origin:** payment **42440** (STAT:121, 28 Nov 2025, R47,511.17 across 13 slices) overshot the ledger and drove the balance to **−R2,533.35** — a genuine credit position. The residual has been carried forward untouched ever since.

**Implication:** the customer owes **R31,116.97** on invoices but holds **R12,263.61** of credit on account, so the ERP amount to remit is **R18,853.36**. The credit should be confirmed with the customer and either allocated to specific documents or written back.

> **⚑ Flagged for investigation (internal, not customer-facing):** the R12,263.61 standing credit traced to payment **42440** (STAT:121, 28 Nov 2025) needs ERP-side verification — confirm whether the R47,511.17 batch was genuinely an overpayment/credit, or whether a posting/allocation error needs correcting in the ERP. Until resolved, the customer-facing statement uses the **commercial gas schedule (R30,599.47)**, not the ERP balance, per business rule (no part-payment; full invoice gross only).

---

## Open invoices (LPG gas — full amounts only)

### June 2026 — not on STAT:129 remittance


| Inv   | Date        | DN / ref          | **Due (R)**  |
| ----- | ----------- | ----------------- | ------------ |
| 51470 | 29 Jun 2026 | DN#22920=ROSEDALE | **5,039.52** |


### July 2026 — no STAT:130 payment yet (full month open)


| Inv   | Date        | DN / ref           | **Due (R)**  |
| ----- | ----------- | ------------------ | ------------ |
| 51655 | 07 Jul 2026 | DN#22806           | **4,366.11** |
| 51839 | 15 Jul 2026 | DN#22575=ROSEDALE  | **4,366.11** |
| 51923 | 20 Jul 2026 | DN#22830- MKONDENI | **2,910.74** |
| 52102 | 27 Jul 2026 | DN#22847           | **4,366.11** |
| 52219 | 31 Jul 2026 | DN#24226           | **4,366.11** |
| 52242 | 31 Jul 2026 | DN#24230           | **4,639.00** |


### August 2026


| Inv   | Date        | DN / ref           | **Due (R)**   |
| ----- | ----------- | ------------------ | ------------- |
| 52421 | 08 Aug 2026 | DN#23948- ROSEDALE | **545.77**    |
|       |             | **Subtotal (gas)** | **30,599.47** |


### Settled — exclude from open list (STAT:129 remittance 01.08.2026)

Docs **50996**, **50998**, **51099**, **51398** — paid in full per `raw/Remittance/01.08.2026.pdf` (R14,863.43).

---

## Recent settlement


| STAT    | Payment   | Date            | Gross          | Settles                                                          |
| ------- | --------- | --------------- | -------------- | ---------------------------------------------------------------- |
| 128     | 44972     | 01 Jul 2026     | R17,311.60     | **May 2026** billing in full (exact match, no surplus)           |
| **129** | **45595** | **03 Aug 2026** | **R14,863.43** | **June 2026** remittance lines only (50996, 50998, 51099, 51398) |


June month variance **R5,039.52** = Jun net LPG billing R19,902.95 − remittance gross R14,863.43. This is **exactly invoice 51470**, which was not included on the COD advice (Pattern 2 candidate). It is not part-payment on July docs.

---

## Related artifacts


| File                                              | Role                                       |
| ------------------------------------------------- | ------------------------------------------ |
| `config/payment_pattern_overrides.json`           | `noPartialInvoiceLines` in approval_policy |
| `reports/MD0003_Remittance_Payment_45595.md`      | STAT:129 line match                        |
| `reports/MD0003_2026_Payment_Pattern_Analysis.md` | Monthly batch variance                     |


