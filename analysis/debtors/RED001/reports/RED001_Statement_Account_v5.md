# Statement of Account: REDLANDS HOTEL (RED001) - Version 5 (Sub-Ledger Position Statement)
**Period:** May 2025 → Jul 2026 &nbsp;|&nbsp; **Account:** RED001
**Combined Opening B/F:** R0.00 (ERP verified — source: `analysis/debtors/RED001/raw/RED001CURRENT.TXT` RED001CURRENT.TXT line 14 — BALANCE B/F R0.00 before first period row (payment 38566, 08 May 2025))
**LPG Opening B/F (1A):** R0.00 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R0.00
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-07-29 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`) · **Ratification scenario active**

---

## Ratification Scenario (active)

**ID:** `CN13687-6CYL-NOV2025` · **Status:** proposed

6 of 7 cylinders credited on CN 13687 (15 Oct 2025, −R8,452.50) were a posting error. Only 1 cylinder (−R1,207.50) was valid against the open deposit from DN#12678 (inv 44675). The 6-cylinder portion (−R7,245.00) should have been corrected in November 2025 but was never posted in ERP.

| Synthetic v5 row | ERP action (when posted) |
| :--- | :--- |
| Doc **RAT13687** · 2025-11-30 · **+R7,245.00** · Part 1B | **Invoice** (not Debit Note) · ref `DN#20157-CORR` · 6× S.1 |

> **ERP TXT variance expected:** Combined reconstruct exceeds TXT header by **R7,245.00** until correction invoice is posted live. See `docs/RED001_ERP_Agent_Note_CN13687.md`.

---


## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since May 2025. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### May 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **0.00** |
| 08 May 2025 | Payment | 38566 | -5,399.99 | -5,399.99 |
| 09 May 2025 | Invoice | 42948 | 5,399.99 | 0.00 |

---

### June 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **0.00** |
| 03 Jun 2025 | Payment | 39087 | -8,639.97 | -8,639.97 |
| 04 Jun 2025 | Invoice | 43614 | 8,639.97 | 0.00 |

---

### July 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **0.00** |
| 09 Jul 2025 | Payment | 40136 | -5,759.98 | -5,759.98 |
| 09 Jul 2025 | Invoice | 44674 | 5,759.98 | 0.00 |

---

### August 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **0.00** |
| 09 Aug 2025 | Invoice | 45540 | 8,639.97 | 8,639.97 |
| 13 Aug 2025 | Payment | 40727 | -8,639.97 | 0.00 |

---

### November 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **0.00** |
| 25 Nov 2025 | Payment | 42420 | -4,780.00 | -4,780.00 |
| 27 Nov 2025 | Invoice | 47943 | 4,780.00 | 0.00 |
| 27 Nov 2025 | Crd Note | 13954 | -4,780.00 | -4,780.00 |

---

### December 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **-4,780.00** |
| 01 Dec 2025 | Invoice | 48022 | 4,780.00 | 0.00 |
| 22 Dec 2025 | Invoice | 48430 | 8,639.97 | 8,639.97 |
| 23 Dec 2025 | Payment | 42732 | -8,639.97 | 0.00 |
| 30 Dec 2025 | Invoice | 48542 | 5,759.98 | 5,759.98 |

---

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **5,759.98** |
| 05 Jan 2026 | Payment | 42868 | -5,759.98 | 0.00 |
| 12 Jan 2026 | Payment | 42984 | -5,759.98 | -5,759.98 |
| 13 Jan 2026 | Invoice | 48747 | 5,759.98 | 0.00 |
| 28 Jan 2026 | Invoice | 48982 | 8,639.97 | 8,639.97 |
| 30 Jan 2026 | Payment | 43155 | -8,639.97 | 0.00 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **0.00** |
| 10 Feb 2026 | Payment | 43317 | -5,759.98 | -5,759.98 |
| 10 Feb 2026 | Invoice | 49164 | 5,759.98 | 0.00 |
| 25 Feb 2026 | Invoice | 49409 | 7,199.98 | 7,199.98 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **7,199.98** |
| 12 Mar 2026 | Payment | 43641 | -1,440.00 | 5,759.98 |
| 12 Mar 2026 | Invoice | 49714 | 5,759.98 | 11,519.96 |
| 17 Mar 2026 | Payment | 43698 | -4,274.96 | 7,245.00 |
| 24 Mar 2026 | Payment | 43754 | -8,639.97 | -1,394.97 |
| 24 Mar 2026 | Invoice | 49875 | 8,639.97 | 7,245.00 |

---

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **7,245.00** |
| 02 Apr 2026 | Invoice | 50064 | 8,639.97 | 15,884.97 |
| 07 Apr 2026 | Payment | 43921 | -8,639.97 | 7,245.00 |
| 22 Apr 2026 | Invoice | 50344 | 5,759.98 | 13,004.98 |
| 28 Apr 2026 | Invoice | 50406 | 5,759.98 | 18,764.96 |
| 29 Apr 2026 | Payment | 44143 | -11,519.96 | 7,245.00 |

---

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **7,245.00** |
| 07 May 2026 | Invoice | 50580 | 5,759.98 | 13,004.98 |
| 08 May 2026 | Crd Note | 14885 | -1,289.66 | 11,715.32 |
| 12 May 2026 | Payment | 44288 | -5,759.98 | 5,955.34 |
| 20 May 2026 | Invoice | 50776 | 6,143.99 | 12,099.33 |
| 20 May 2026 | Invoice | 50780 | 7,679.99 | 19,779.32 |
| 20 May 2026 | Crd Note | 14926 | -6,143.99 | 13,635.33 |
| 21 May 2026 | Payment | 44376 | -7,679.99 | 5,955.34 |
| 28 May 2026 | Invoice | 50915 | 6,143.99 | 12,099.33 |

---

### June 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **12,099.33** |
| 03 Jun 2026 | Payment | 44552 | -6,143.99 | 5,955.34 |
| 05 Jun 2026 | Invoice | 51048 | 5,885.01 | 11,840.35 |
| 09 Jun 2026 | Payment | 44653 | -5,885.01 | 5,955.34 |
| 15 Jun 2026 | Invoice | 51221 | 5,885.01 | 11,840.35 |
| 17 Jun 2026 | Payment | 44744 | -5,885.01 | 5,955.34 |
| 18 Jun 2026 | Invoice | 51286 | 5,885.01 | 11,840.35 |
| 22 Jun 2026 | Payment | 44870 | -5,885.01 | 5,955.34 |
| 25 Jun 2026 | Invoice | 51426 | 7,356.26 | 13,311.60 |
| 29 Jun 2026 | Payment | 44959 | -7,356.26 | 5,955.34 |

---

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **5,955.34** |
| 03 Jul 2026 | Invoice | 51557 | 5,912.56 | 11,867.90 |
| 06 Jul 2026 | Payment | 45094 | -5,912.56 | 5,955.34 |
| 16 Jul 2026 | Invoice | 51890 | 7,390.70 | 13,346.04 |
| 21 Jul 2026 | Payment | 45328 | -7,390.70 | 5,955.34 |
| 23 Jul 2026 | Invoice | 52042 | 4,434.42 | 10,389.76 |
| 24 Jul 2026 | Invoice | 52086 | 4,434.42 | 14,824.18 |
| 25 Jul 2026 | Crd Note | 15325 | -4,434.42 | 10,389.76 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

### May 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **0.00** |
| 09 May 2025 | Invoice | 42954 | 4,830.00 | 4,830.00 |
| 09 May 2025 | Crd Note | 12452 | -4,830.00 | 0.00 |

---

### June 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **0.00** |
| 04 Jun 2025 | Invoice | 43615 | 7,245.00 | 7,245.00 |
| 06 Jun 2025 | Crd Note | 12638 | -7,245.00 | 0.00 |

---

### July 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **0.00** |
| 09 Jul 2025 | Invoice | 44675 | 4,830.00 | 4,830.00 |
| 09 Jul 2025 | Crd Note | 12945 | -3,622.50 | 1,207.50 |

---

### August 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **1,207.50** |
| 09 Aug 2025 | Invoice | 45541 | 7,245.00 | 8,452.50 |
| 11 Aug 2025 | Crd Note | 13187 | -7,245.00 | 1,207.50 |

---

### October 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **1,207.50** |
| 15 Oct 2025 | Crd Note | 13687 | -8,452.50 | -7,245.00 |

---

### November 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **-7,245.00** |
| 27 Nov 2025 | Invoice | 47944 | 4,830.00 | -2,415.00 |
| 27 Nov 2025 | Crd Note | 13955 | -4,830.00 | -7,245.00 |
| 30 Nov 2025 | Invoice | RAT13687 *(ratification)* | 7,245.00 | 0.00 |

---

### December 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **0.00** |
| 01 Dec 2025 | Invoice | 48023 | 4,830.00 | 4,830.00 |
| 02 Dec 2025 | Crd Note | 13987 | -4,830.00 | 0.00 |
| 22 Dec 2025 | Invoice | 48431 | 7,245.00 | 7,245.00 |
| 22 Dec 2025 | Crd Note | 14140 | -7,245.00 | 0.00 |
| 30 Dec 2025 | Invoice | 48543 | 4,830.00 | 4,830.00 |
| 30 Dec 2025 | Crd Note | 14185 | -4,830.00 | 0.00 |

---

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **0.00** |
| 13 Jan 2026 | Invoice | 48748 | 4,830.00 | 4,830.00 |
| 13 Jan 2026 | Crd Note | 14254 | -4,830.00 | 0.00 |
| 28 Jan 2026 | Invoice | 48983 | 7,245.00 | 7,245.00 |
| 28 Jan 2026 | Crd Note | 14341 | -7,245.00 | 0.00 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **0.00** |
| 10 Feb 2026 | Invoice | 49165 | 4,830.00 | 4,830.00 |
| 10 Feb 2026 | Crd Note | 14409 | -4,830.00 | 0.00 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **0.00** |
| 12 Mar 2026 | Invoice | 49715 | 4,830.00 | 4,830.00 |
| 13 Mar 2026 | Crd Note | 14585 | -4,830.00 | 0.00 |
| 24 Mar 2026 | Invoice | 49876 | 7,245.00 | 7,245.00 |
| 25 Mar 2026 | Crd Note | 14644 | -7,245.00 | 0.00 |

---

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **0.00** |
| 02 Apr 2026 | Invoice | 50065 | 7,245.00 | 7,245.00 |
| 02 Apr 2026 | Crd Note | 14704 | -4,830.00 | 2,415.00 |
| 22 Apr 2026 | Invoice | 50346 | 4,830.00 | 7,245.00 |
| 23 Apr 2026 | Crd Note | 14798 | -4,830.00 | 2,415.00 |
| 28 Apr 2026 | Invoice | 50407 | 4,830.00 | 7,245.00 |
| 28 Apr 2026 | Crd Note | 14880 | -4,830.00 | 2,415.00 |

---

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **2,415.00** |
| 07 May 2026 | Invoice | 50581 | 4,830.00 | 7,245.00 |
| 08 May 2026 | Crd Note | 15238 | -4,830.00 | 2,415.00 |
| 20 May 2026 | Invoice | 50777 | 4,830.00 | 7,245.00 |
| 20 May 2026 | Invoice | 50781 | 6,037.50 | 13,282.50 |
| 20 May 2026 | Crd Note | 14927 | -4,830.00 | 8,452.50 |
| 21 May 2026 | Crd Note | 14932 | -6,037.50 | 2,415.00 |

---

### June 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **2,415.00** |
| 15 Jun 2026 | Invoice | 51222 | 4,830.00 | 7,245.00 |
| 15 Jun 2026 | Crd Note | 15069 | -6,037.50 | 1,207.50 |
| 18 Jun 2026 | Invoice | 51287 | 4,830.00 | 6,037.50 |
| 19 Jun 2026 | Crd Note | 15090 | -4,830.00 | 1,207.50 |
| 25 Jun 2026 | Invoice | 51427 | 6,037.50 | 7,245.00 |
| 26 Jun 2026 | Crd Note | 15125 | -3,622.50 | 3,622.50 |

---

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **3,622.50** |
| 03 Jul 2026 | Invoice | 51558 | 4,830.00 | 8,452.50 |
| 03 Jul 2026 | Crd Note | 15192 | -4,830.00 | 3,622.50 |
| 16 Jul 2026 | Invoice | 51891 | 6,037.50 | 9,660.00 |
| 17 Jul 2026 | Crd Note | 15274 | -7,245.00 | 2,415.00 |
| 24 Jul 2026 | Invoice | 52053 | 3,622.50 | 6,037.50 |
| 25 Jul 2026 | Crd Note | 15327 | -3,622.50 | 2,415.00 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 10,389.76 |
| Part 1B — CYL Deposits | 2,415.00 |
| **Combined (1A + 1B)** | **12,804.76** |
| ERP `CURRENT BALANCE` (TXT header) | 5,559.76 |
| **Variance (Combined − ERP)** | **7,245.00** |

---

## Ingest Gate (`ingestFreshness: current` · `ingestCoverage: partial`)

| Check | Status |
| :--- | :--- |
| Display status | `CURRENT_PARTIAL` |
| Financial balance from TXT | **ALLOWED** |
| Custody / Part 2 qty | **BLOCKED** |
| SKU analysis | **BLOCKED** |

> **Custody conclusions blocked.** DB qty may be incomplete or stale vs statement TXT (`analysis/debtors/RED001/raw/RED001CURRENT.TXT`). See `RED001_INGEST_COVERAGE_*.md`.

**INGEST_GAP documents (custody-blocking):**
- **45328** (Payment, 2026-07-21) — `MISSING_HEADER`
- **52086** (Invoice, 2026-07-24) — `MISSING_LINES`
- **15325** (Crd Note, 2026-07-25) — `MISSING_LINES`
- **15327** (Crd Note, 2026-07-25) — `MISSING_LINES`

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`. **Gate: custody BLOCKED — see Ingest Gate above.***

### May 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| 09 May 2025 | Invoice | 42954 | 0 | 0 | 0 | 0 | +4 |
| 09 May 2025 | Crd Note | 12452 | 0 | 0 | 0 | 0 | -4 |
| **End May** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### June 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| 04 Jun 2025 | Invoice | 43615 | 0 | 0 | 0 | 0 | +6 |
| 06 Jun 2025 | Crd Note | 12638 | 0 | 0 | 0 | 0 | -6 |
| **End Jun** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### July 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| 09 Jul 2025 | Invoice | 44675 | 0 | 0 | 0 | 0 | +4 |
| 09 Jul 2025 | Crd Note | 12945 | 0 | 0 | 0 | 0 | -3 |
| **End Jul** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **1** |

---

### August 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **1** |
| 09 Aug 2025 | Invoice | 45541 | 0 | 0 | 0 | 0 | +6 |
| 11 Aug 2025 | Crd Note | 13187 | 0 | 0 | 0 | 0 | -6 |
| **End Aug** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **1** |

---

### October 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **1** |
| 15 Oct 2025 | Crd Note | 13687 | 0 | 0 | 0 | 0 | -7 |
| **End Oct** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **-6** |

---

### November 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **-6** |
| 27 Nov 2025 | Invoice | 47944 | 0 | 0 | 0 | 0 | +4 |
| 27 Nov 2025 | Crd Note | 13955 | 0 | 0 | 0 | 0 | -4 |
| 30 Nov 2025 | Invoice | RAT13687 *(ratification)* | 0 | 0 | 0 | 0 | +6 |
| **End Nov** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### December 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| 01 Dec 2025 | Invoice | 48023 | 0 | 0 | 0 | 0 | +4 |
| 02 Dec 2025 | Crd Note | 13987 | 0 | 0 | 0 | 0 | -4 |
| 22 Dec 2025 | Invoice | 48431 | 0 | 0 | 0 | 0 | +6 |
| 22 Dec 2025 | Crd Note | 14140 | 0 | 0 | 0 | 0 | -6 |
| 30 Dec 2025 | Invoice | 48543 | 0 | 0 | 0 | 0 | +4 |
| 30 Dec 2025 | Crd Note | 14185 | 0 | 0 | 0 | 0 | -4 |
| **End Dec** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### January 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| 13 Jan 2026 | Invoice | 48748 | 0 | 0 | 0 | +4 | 0 |
| 13 Jan 2026 | Crd Note | 14254 | 0 | 0 | 0 | 0 | -4 |
| 28 Jan 2026 | Invoice | 48983 | 0 | 0 | 0 | 0 | +6 |
| 28 Jan 2026 | Crd Note | 14341 | 0 | 0 | 0 | 0 | -6 |
| **End Jan** | **Closing Balance** | — | **0** | **0** | **0** | **4** | **-4** |

---

### February 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **0** | **0** | **0** | **4** | **-4** |
| 10 Feb 2026 | Invoice | 49165 | 0 | 0 | 0 | 0 | +4 |
| 10 Feb 2026 | Crd Note | 14409 | 0 | 0 | 0 | 0 | -4 |
| **End Feb** | **Closing Balance** | — | **0** | **0** | **0** | **4** | **-4** |

---

### March 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **0** | **0** | **0** | **4** | **-4** |
| 12 Mar 2026 | Invoice | 49715 | 0 | 0 | 0 | 0 | +4 |
| 13 Mar 2026 | Crd Note | 14585 | 0 | 0 | 0 | -1 | -3 |
| 24 Mar 2026 | Invoice | 49876 | 0 | 0 | 0 | 0 | +6 |
| 25 Mar 2026 | Crd Note | 14644 | 0 | 0 | 0 | 0 | -6 |
| **End Mar** | **Closing Balance** | — | **0** | **0** | **0** | **3** | **-3** |

---

### April 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **0** | **0** | **0** | **3** | **-3** |
| 02 Apr 2026 | Invoice | 50065 | 0 | 0 | 0 | 0 | +6 |
| 02 Apr 2026 | Crd Note | 14704 | 0 | 0 | 0 | 0 | -4 |
| 22 Apr 2026 | Invoice | 50346 | 0 | 0 | 0 | 0 | +4 |
| 23 Apr 2026 | Crd Note | 14798 | 0 | 0 | 0 | 0 | -4 |
| 28 Apr 2026 | Invoice | 50407 | 0 | 0 | 0 | 0 | +4 |
| 28 Apr 2026 | Crd Note | 14880 | 0 | 0 | 0 | 0 | -4 |
| **End Apr** | **Closing Balance** | — | **0** | **0** | **0** | **3** | **-1** |

---

### May 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **0** | **0** | **0** | **3** | **-1** |
| 07 May 2026 | Invoice | 50581 | 0 | 0 | 0 | 0 | +4 |
| 08 May 2026 | Crd Note | 15238 | 0 | 0 | 0 | 0 | -4 |
| 20 May 2026 | Invoice | 50777 | 0 | 0 | 0 | 0 | +4 |
| 20 May 2026 | Invoice | 50781 | 0 | 0 | 0 | 0 | +5 |
| 20 May 2026 | Crd Note | 14927 | 0 | 0 | 0 | 0 | -4 |
| 21 May 2026 | Crd Note | 14932 | 0 | 0 | 0 | 0 | -5 |
| **End May** | **Closing Balance** | — | **0** | **0** | **0** | **3** | **-1** |

---

### June 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **0** | **0** | **0** | **3** | **-1** |
| 15 Jun 2026 | Invoice | 51222 | 0 | 0 | 0 | +4 | 0 |
| 15 Jun 2026 | Crd Note | 15069 | 0 | 0 | 0 | 0 | -5 |
| 18 Jun 2026 | Invoice | 51287 | 0 | 0 | 0 | 0 | +4 |
| 19 Jun 2026 | Crd Note | 15090 | 0 | 0 | 0 | 0 | -4 |
| 25 Jun 2026 | Invoice | 51427 | 0 | 0 | 0 | 0 | +5 |
| 26 Jun 2026 | Crd Note | 15125 | 0 | 0 | 0 | 0 | -3 |
| **End Jun** | **Closing Balance** | — | **0** | **0** | **0** | **7** | **-4** |

---

### July 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **0** | **0** | **0** | **7** | **-4** |
| 03 Jul 2026 | Invoice | 51558 | 0 | 0 | 0 | 0 | +4 |
| 03 Jul 2026 | Crd Note | 15192 | 0 | 0 | 0 | 0 | -4 |
| 16 Jul 2026 | Invoice | 51891 | 0 | 0 | 0 | 0 | +5 |
| 17 Jul 2026 | Crd Note | 15274 | 0 | 0 | 0 | 0 | -6 |
| 24 Jul 2026 | Invoice | 52053 | 0 | 0 | 0 | 0 | +3 |
| 25 Jul 2026 | Crd Note | 15327 | 0 | 0 | 0 | 0 | -3 |
| **End Jul** | **Closing Balance** | — | **0** | **0** | **0** | **7** | **-5** |

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R10,389.76 |
| Cylinder Financial Balance (Part 1B close) | R2,415.00 |
| **Total Debtor Balance** | **R12,804.76** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| D.1 | 7 | R1,150.00 | R8,050.00 |
| S.1 | -5 | R1,150.00 | R-5,750.00 |
| **Total** | **2** | — | **R2,300.00** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R2,415.00 | R2,300.00 | R115.00 |
| Sub-ledger tie (1A + 1B vs combined) | R12,804.76 | — | R0.00 |

> **INGEST_GATE:** Custody variance below is **not signed off** — ingest coverage `CURRENT_PARTIAL`. DB-backed qty may not reflect all TXT documents.

**ERP Combined Balance (TXT header):** R5,559.76  
**Reconstructed Balance (1A + 1B):** R12,804.76  
**Variance:** R7,245.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
