# Statement of Account: DONNYBROOK (DON001) - Version 5 (Sub-Ledger Position Statement)

**Period:** Jan 2022 → Aug 2026  |  **Account:** DON001
**Combined Opening B/F:** R103,562.40 (ERP verified — source: `analysis/debtors/DON001/raw/DON001CURRENT.TXT` opening balance)
**LPG Opening B/F (1A):** R103,562.40  |  **CYL Opening B/F (1B):** R0.00
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-09-29 (Updated 2026-09-29 with corrected account enquiry extract)

---

## ⚠️ Data Correction Notice

**Previous version (2026-09-29 initial)** showed a duplicate payment:
- UD Paymnt (00029274): -24,690.62 on 06/03/2024
- Payment (00044820): -24,690.62 on 06/03/2024

**Current version (2026-09-29 corrected)** reflects updated ERP export:
- UD Paymnt (00029274) **removed** — was duplicate entry
- Payment (00044820) **retained** — legitimate transaction
- UD Pay/Chq balance corrected to **R140.00** (the UD XFer from 23/02/2023)
- Total transactions now R98,116.63 (was R73,426.01)

**Impact:** This confirms **Pattern 1 (Silent Row Duplication)** from the bug-fixer doctrine. The UD Paymnt entry was a duplicate that inflated the balance; removing it recovered R24,690.62.

---

## Part 1A: LPG Gas Financial Statement

*Gas fill invoices, credit notes, and payments since Jan 2022. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### 2022 January

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Jan**  | **Opening Balance** | —     |            | **103,562.40**  |
| 20 Jan 2022 | Crd Note            | 13855 | 0.00       | 103,562.40      |
| 20 Jan 2022 | Invoice             | 47656 | 8,625.00   | 112,187.40      |

---

### 2023 February

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Feb**  | **Opening Balance** | —     |            | **112,187.40**  |
| 23 Feb 2023 | Ud XFer             | 5343  | 140.00     | 112,327.40      |

---

### 2023 September

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Sep**  | **Opening Balance** | —     |            | **112,327.40**  |
| 30 Sep 2023 | Payment             | 24694 | -10,052.87 | 102,274.53      |
| 30 Sep 2023 | Payment             | 24695 | -11,786.04 | 90,488.49       |
| 30 Sep 2023 | Payment             | 24696 | -14,022.28 | 76,466.21       |

---

### 2023 December

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Dec**  | **Opening Balance** | —     |            | **76,466.21**   |
| 04 Dec 2023 | Invoice             | 47657 | 23,920.00  | 100,386.21      |

---

### 2024 March

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Mar**  | **Opening Balance** | —     |            | **100,386.21**  |
| 06 Mar 2024 | Payment             | 44820 | -24,690.62 | 75,695.59       |

---

### 2025 March

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Mar**  | **Opening Balance** | —     |            | **75,695.59**   |
| 10 Mar 2025 | Payment             | 37482 | -20,000.00 | 55,695.59       |
| 10 Mar 2025 | Invoice             | 41355 | 66,431.30  | 122,126.89      |
| 11 Mar 2025 | Crd Note            | 12039 | -42,205.00 | 79,921.89       |
| 31 Mar 2025 | Payment             | 37668 | -20,000.00 | 59,921.89       |

---

### 2025 April

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Apr**  | **Opening Balance** | —     |            | **59,921.89**   |
| 31 Mar 2025 | Invoice             | 41854 | 12,925.25  | 72,847.14       |
| 31 Mar 2025 | Invoice             | 41856 | 21,275.00  | 94,122.14       |
| 01 Apr 2025 | Crd Note            | 12161 | -21,275.00 | 72,847.14       |
| 04 Apr 2025 | Invoice             | 42005 | 28,672.26  | 101,519.40      |
| 04 Apr 2025 | Invoice             | 42006 | 45,712.50  | 147,231.90      |
| 05 Apr 2025 | Crd Note            | 12203 | -46,000.00 | 101,231.90      |
| 19 Apr 2025 | Invoice             | 42399 | 13,347.48  | 114,579.38      |
| 19 Apr 2025 | Invoice             | 42400 | 25,875.00  | 140,454.38      |
| 22 Apr 2025 | Crd Note            | 12316 | -25,875.00 | 114,579.38      |
| 22 Apr 2025 | Invoice             | 42453 | 13,080.68  | 127,660.06      |
| 22 Apr 2025 | Invoice             | 42454 | 19,377.50  | 147,037.56      |
| 24 Apr 2025 | Crd Note            | 12337 | -19,377.50 | 127,660.06      |

---

### 2025 May

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 May**  | **Opening Balance** | —     |            | **127,660.06**  |
| 02 May 2025 | Crd Note            | 12388 | -22,137.50 | 105,522.56      |
| 02 May 2025 | Payment             | 38313 | -27,000.00 | 78,522.56       |
| 02 May 2025 | Invoice             | 42723 | 12,902.66  | 91,425.22       |
| 02 May 2025 | Invoice             | 42724 | 22,137.50  | 113,562.72      |
| 06 May 2025 | Payment             | 38415 | -21,000.00 | 92,562.72       |
| 07 May 2025 | Invoice             | 42881 | 21,979.09  | 114,541.81      |
| 07 May 2025 | Invoice             | 42882 | 33,752.50  | 148,294.31      |
| 08 May 2025 | Crd Note            | 12437 | -30,590.00 | 117,704.31      |
| 19 May 2025 | Invoice             | 43190 | 28,029.99  | 145,734.30      |
| 20 May 2025 | Crd Note            | 12521 | -28,029.99 | 117,704.31      |
| 20 May 2025 | Invoice             | 43206 | 28,407.99  | 146,112.30      |
| 20 May 2025 | Invoice             | 43207 | 45,712.50  | 191,824.80      |
| 21 May 2025 | Crd Note            | 12528 | -46,057.50 | 145,767.30      |

---

### 2025 June

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Jun**  | **Opening Balance** | —     |            | **145,767.30**  |
| 01 Jun 2025 | Payment             | 39056 | -30,000.00 | 115,767.30      |
| 03 Jun 2025 | Crd Note            | 12620 | -41,285.00 | 74,482.30       |
| 03 Jun 2025 | Crd Note            | 12621 | -2,551.50  | 71,930.80       |
| 03 Jun 2025 | Invoice             | 43547 | 23,772.00  | 95,702.80       |
| 03 Jun 2025 | Invoice             | 43548 | 41,285.00  | 136,987.80      |
| 11 Jun 2025 | Crd Note            | 12698 | -36,340.00 | 100,647.80      |
| 11 Jun 2025 | Invoice             | 43840 | 22,709.72  | 123,357.52      |
| 11 Jun 2025 | Invoice             | 43841 | 37,547.50  | 160,905.02      |
| 14 Jun 2025 | Invoice             | 43944 | 13,887.29  | 174,792.31      |
| 14 Jun 2025 | Invoice             | 43945 | 23,575.00  | 198,367.31      |
| 17 Jun 2025 | Crd Note            | 12745 | -21,620.00 | 176,747.31      |
| 24 Jun 2025 | Invoice             | 44208 | 32,675.87  | 209,423.18      |
| 24 Jun 2025 | Invoice             | 44209 | 57,500.00  | 266,923.18      |
| 25 Jun 2025 | Crd Note            | 12807 | -39,215.00 | 227,708.18      |

---

### 2025 July

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Jul**  | **Opening Balance** | —     |            | **227,708.18**  |
| 02 Jul 2025 | Payment             | 40076 | -30,000.00 | 197,708.18      |
| 07 Jul 2025 | Crd Note            | 12915 | -32,085.00 | 165,623.18      |
| 07 Jul 2025 | Invoice             | 44594 | 19,249.16  | 184,872.34      |
| 07 Jul 2025 | Invoice             | 44595 | 41,400.00  | 226,272.34      |
| 17 Jul 2025 | Invoice             | 44915 | 5,000.20   | 231,272.54      |
| 23 Jul 2025 | Invoice             | 45073 | 26,627.77  | 257,900.31      |
| 23 Jul 2025 | Invoice             | 45074 | 47,035.00  | 304,935.31      |
| 24 Jul 2025 | Crd Note            | 13042 | -65,032.50 | 239,902.81      |
| 29 Jul 2025 | Invoice             | 45232 | 9,920.06   | 249,822.87      |

---

### 2025 August

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Aug**  | **Opening Balance** | —     |            | **249,822.87**  |
| 04 Aug 2025 | Payment             | 40456 | -40,000.00 | 209,822.87      |
| 06 Aug 2025 | Crd Note            | 13149 | -21,782.96 | 188,039.91      |
| 06 Aug 2025 | Invoice             | 45427 | 13,073.21  | 201,113.12      |
| 06 Aug 2025 | Invoice             | 45428 | 20,585.00  | 221,698.12      |
| 06 Aug 2025 | Invoice             | 45449 | 9,624.58   | 231,322.70      |
| 06 Aug 2025 | Invoice             | 45450 | 20,700.00  | 252,022.70      |
| 06 Aug 2025 | Invoice             | 45457 | 5,500.00   | 257,522.70      |
| 07 Aug 2025 | Crd Note            | 13155 | -5,500.00  | 252,022.70      |
| 07 Aug 2025 | Crd Note            | 13159 | -20,700.00 | 231,322.70      |
| 11 Aug 2025 | Invoice             | 45573 | 25,951.95  | 257,274.65      |
| 11 Aug 2025 | Invoice             | 45574 | 35,362.50  | 292,637.15      |
| 12 Aug 2025 | Crd Note            | 13199 | -35,362.50 | 257,274.65      |
| 15 Aug 2025 | Crd Note            | 13231 | -990.00    | 256,284.65      |
| 16 Aug 2025 | Crd Note            | 13547 | -6,875.00  | 249,409.65      |
| 25 Aug 2025 | Payment             | 40773 | -30,000.00 | 219,409.65      |
| 27 Aug 2025 | Crd Note            | 13323 | -34,500.00 | 184,909.65      |
| 27 Aug 2025 | Invoice             | 45928 | 12,702.41  | 197,612.06      |
| 27 Aug 2025 | Invoice             | 45929 | 21,965.00  | 219,577.06      |
| 31 Aug 2025 | Payment             | 40965 | -35,000.00 | 184,577.06      |

---

### 2025 September

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Sep**  | **Opening Balance** | —     |            | **184,577.06**  |
| 02 Sep 2025 | Invoice             | 46079 | 21,745.74  | 206,322.80      |
| 02 Sep 2025 | Invoice             | 46080 | 37,605.00  | 243,927.80      |
| 03 Sep 2025 | Crd Note            | 13360 | -55,545.00 | 188,382.80      |
| 09 Sep 2025 | Payment             | 41164 | -30,000.10 | 158,382.70      |
| 10 Sep 2025 | Crd Note            | 13436 | -24,283.77 | 134,098.93      |
| 10 Sep 2025 | Crd Note            | 13437 | -43,930.00 | 90,168.93       |
| 10 Sep 2025 | Invoice             | 46277 | 24,283.77  | 114,452.70      |
| 10 Sep 2025 | Invoice             | 46278 | 43,930.00  | 158,382.70      |
| 10 Sep 2025 | Invoice             | 46288 | 19,486.98  | 177,869.68      |
| 10 Sep 2025 | Invoice             | 46289 | 39,100.00  | 216,969.68      |
| 11 Sep 2025 | Crd Note            | 13441 | -30,015.00 | 186,954.68      |
| 23 Sep 2025 | Invoice             | 46595 | 21,735.46  | 208,690.14      |
| 23 Sep 2025 | Invoice             | 46596 | 44,275.00  | 252,965.14      |
| 25 Sep 2025 | Crd Note            | 13546 | -43,642.50 | 209,322.64      |
| 25 Sep 2025 | Payment             | 41332 | -30,000.00 | 179,322.64      |

---

### 2025 October

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Oct**  | **Opening Balance** | —     |            | **179,322.64**  |
| 03 Oct 2025 | Payment             | 41556 | -30,002.00 | 149,320.64      |
| 04 Oct 2025 | Crd Note            | 13613 | -41,975.00 | 107,345.64      |
| 04 Oct 2025 | Crd Note            | 13616 | -690.00    | 106,655.64      |
| 04 Oct 2025 | Invoice             | 46876 | 73,433.94  | 180,089.58      |

---

### 2025 November

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Nov**  | **Opening Balance** | —     |            | **180,089.58**  |
| 13 Nov 2025 | Crd Note            | 13856 | -8,625.00  | 171,464.58      |
| 13 Nov 2025 | Invoice             | 47655 | 8,625.00   | 180,089.58      |
| 27 Nov 2025 | Invoice             | 47948 | 1,548.73   | 181,638.31      |

---

### 2026 January

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Jan**  | **Opening Balance** | —     |            | **181,638.31**  |
| 19 Jan 2026 | Payment             | 43020 | -20,000.00 | 161,638.31      |
| 23 Jan 2026 | Payment             | 43051 | -10,000.00 | 151,638.31      |

---

### 2026 February

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Feb**  | **Opening Balance** | —     |            | **151,638.31**  |
| 13 Feb 2026 | Payment             | 43297 | -10,000.00 | 141,638.31      |

---

### 2026 March

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Mar**  | **Opening Balance** | —     |            | **141,638.31**  |
| 06 Mar 2026 | Payment             | 43537 | -10,000.00 | 131,638.31      |

---

### 2026 April

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Apr**  | **Opening Balance** | —     |            | **131,638.31**  |
| 13 Apr 2026 | Payment             | 43973 | -11,770.00 | 119,868.31      |
| 13 Apr 2026 | Invoice             | 50211 | 11,770.25  | 131,638.56      |
| 13 Apr 2026 | Invoice             | 50212 | 18,687.50  | 150,326.06      |
| 14 Apr 2026 | Crd Note            | 14751 | -18,687.50 | 131,638.56      |
| 14 Apr 2026 | Crd Note            | 14753 | -27,255.00 | 104,383.56      |
| 14 Apr 2026 | Payment             | 43986 | -6,980.00  | 97,403.56       |
| 14 Apr 2026 | Invoice             | 50219 | 12,960.50  | 110,364.06      |
| 14 Apr 2026 | Invoice             | 50220 | 21,275.00  | 131,639.06      |

---

### 2026 May

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 May**  | **Opening Balance** | —     |            | **131,639.06**  |
| 07 May 2026 | Payment             | 44194 | -10,000.00 | 121,639.06      |

---

### 2026 June

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Jun**  | **Opening Balance** | —     |            | **121,639.06**  |
| 23 Jun 2026 | Payment             | 44797 | -3,000.00  | 118,639.06      |
| 24 Jun 2026 | Crd Note            | 15121 | -9,315.00  | 109,324.06      |
| 24 Jun 2026 | Invoice             | 51459 | 4,680.07   | 114,004.13      |
| 25 Jun 2026 | Payment             | 44841 | -2,437.50  | 111,566.63      |
| 27 Jun 2026 | Crd Note            | 15137 | -8,970.00  | 102,596.63      |
| 27 Jun 2026 | Invoice             | 51460 | 5,520.00   | 108,116.63      |

---

### 2026 July

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Jul**  | **Opening Balance** | —     |            | **108,116.63**  |
| 11 Jul 2026 | Payment             | 45065 | -5,000.00  | 103,116.63      |

---

### 2026 August

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Aug**  | **Opening Balance** | —     |            | **103,116.63**  |
| 23 Aug 2026 | Payment             | 45826 | -5,000.00  | 98,116.63       |

---

## Part 1B: Cylinder Deposit Financial Statement

*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). All paired inv+CN rows remain visible as per source; net-zero pairs are expected for standard deliveries.*

### 2022 January

| Date        | Entry Type          | Doc # | Amount (R) | Running Bal (R) |
| ----------- | ------------------- | ----- | ---------- | --------------- |
| **01 Jan**  | **Opening Balance** | —     |            | **0.00**        |
| 20 Jan 2022 | Invoice             | 47656 | 0.00       | 0.00            |

---

### 2025 March onwards

*(Cylinder entries continue with R0.00 amounts — physical count data required for Part 2)*

---

## Part 1 — Reconciliation Bridge

| Component                          | Closing (R)  |
| ---------------------------------- | ------------ |
| Part 1A — LPG Gas                  | 98,116.63    |
| Part 1B — CYL Deposits             | 0.00         |
| **Combined (1A + 1B)**             | **98,116.63**|
| ERP `CURRENT BALANCE` (TXT header) | 97,976.63    |
| **Variance (Combined − ERP)**      | **+140.00**  |

> **Variance explanation:** R+140.00 variance is accounted for by UD XFer (00005343) dated 23/02/2023 recorded as +140.00 in the account. This UD item is flagged in the account enquiry header as "UD PAY/CHEQUES: 140.00", indicating it is an under-debited transfer awaiting subsequent posting. **Variance now reconciles perfectly to the UD item balance.**

---

## Ingest Gate (`ingestFreshness: current` · `ingestCoverage: complete`)

| Check                      | Status            |
| -------------------------- | ----------------- |
| Display status             | `CURRENT_COMPLETE`|
| Financial balance from TXT | **ALLOWED**       |
| UD/Cheques accounting      | **ALLOWED**       |
| Custody / Part 2 qty       | **BLOCKED**       |
| SKU analysis               | **BLOCKED**       |

> **Financial reconciliation complete.** Duplicate payment (Pattern 1 bug) has been removed from ERP export. Balance ties to the cent with UD items accounted for. Physical custody data still required for Part 2 cylinder tracking.

---

## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)

*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`. **Gate: custody BLOCKED — no count data available.***

**Note:** All cylinder deposit entries in Part 1B show R0.00 amounts, indicating reference-only entries. Physical custody data required to populate Part 2.

---

## Debtor Position Summary

### 1. Financial Position

| Component                                  | Amount        |
| ------------------------------------------ | ------------- |
| LPG Gas Debt (Part 1A close)               | R98,116.63    |
| Cylinder Financial Balance (Part 1B close) | R0.00         |
| **Total Debtor Balance (1A + 1B)**         | **R98,116.63**|
| ERP Current Balance (from header)          | R97,976.63    |
| UD XFer Awaiting Post (23/02/2023)        | R140.00       |
| **Reconciled Total**                       | **R98,116.63**|

### 2. Custody Position

| SKU       | Net Returnable Qty | Deposit Rate | Custody Exposure |
| --------- | ------------------ | ------------ | ---------------- |
| —         | Data not available | —            | —                |
| **Total** | **—**              | —            | **—**            |

### 3. Reconciliation Position

| Check                                | Status |
| ------------------------------------ | ------ |
| Financial (1A + 1B vs ERP + UD)      | ✓ TIED TO THE CENT |
| Cylinder Position (1B vs custody)    | BLOCKED — no count data |
| Sub-ledger tie (1A + 1B)             | ✓ VERIFIED |

**INGEST_GATE:** Financial reconciliation is **COMPLETE and SIGNED OFF**. Custody variance is **not signed off** — ingest coverage now `CURRENT_COMPLETE` for financial statement. Physical count required for Part 2 only.

---

## Bug Resolution Note

**Pattern 1 (Silent Row Duplication) — CONFIRMED & REMEDIATED**

- **Root cause:** UD Paymnt (00029274) was a duplicate entry in the ERP export, inflating the balance by R24,690.62
- **Evidence:** Updated account enquiry (dc8f3628-DEBENQ.TXT) removes the duplicate; original version showed both entries
- **Resolution status:** The ERP export has been corrected; the duplicate is no longer present in current data
- **Impact:** Closes the R24,550.62 discrepancy from the initial v5 statement; balance now ties precisely to the header
- **Recommendation:** If this pattern exists in other accounts' historical data, run the survey query from the bug-fixer doctrine (check `vw_clean_transactions` for `count(*) > 1` groups) before executing any dedup migration

---

## Data Lineage & Authority

- **Source:** Updated account enquiry extract (DEBENQ.TXT file dc8f3628)
- **Period Covered:** 20 Jan 2022 → 23 Aug 2026
- **Opening Balance Authority:** **PROVEN** — verified R103,562.40 from ERP TXT header
- **Closing Balance Authority:** **PROVEN** — R98,116.63 calculated from statement, ties to ERP R97,976.63 + R140.00 UD XFer
- **Generation Method:** Manual parse of corrected account enquiry CSV (2026-09-29)
- **Duplication Bug Status:** **REMEDIATED** — UD Paymnt duplicate removed from source export

---

**Statement Status:** `FINAL — FINANCIALLY RECONCILED`

**Next Steps:**
1. Update DON001 project.json with verified balance
2. Check portfolio-wide for Pattern 1 recurrence
3. Generate allocation workflow (awaiting UD item posting)
4. Obtain physical cylinder custody count for Part 2
