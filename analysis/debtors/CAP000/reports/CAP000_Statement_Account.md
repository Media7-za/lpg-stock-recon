# Statement of Account: CAPITOL CATERERS SELECT (PTY) (CAP000) — Combined Financial Ledger (Part 1, TXT-Only)

**Period:** Jul 2022 → Sep 2026 &nbsp;|&nbsp; **Account:** CAP000
**Combined Opening B/F:** R0.00 (23 Jul 2022 — first transaction in ERP account history)
**Current Balance (ERP-verified):** R70,773.28
**Sources (chronological, B/F-chained, all reconciled to R0.00 variance):**

| Slice | File | Coverage | Opens | Closes |
| :--- | :--- | :--- | ---: | ---: |
| 1 | `raw/DEBENQ23.TXT` | 2022 FEBRUARY (23 Jul 2022 – 01 Mar 2023) | R0.00 | R48,267.34 |
| 2 | `raw/DEBENQ24.TXT` | 2024 FEBRUARY (07 Mar 2023 – 28 Feb 2024) | R48,267.34 | R60,437.64 |
| 3 | `raw/DEBENQ25.TXT` | 2025 MARCH (incl. backdated Jan/Feb 2023 STAT:89 reallocations – 28 Feb 2025) | R60,437.64 | R43,865.94 |
| 4 | `raw/DEBENQ.TXT` | CURRENT (03 Mar 2025 – 17 Sep 2026) | R43,865.94 | R70,773.28 |

**Last regenerated:** 2026-09-17 from operator-supplied ERP account-enquiry TXT exports (standalone TXT-only builder — see scope note below)

---

## Reconciliation Gate

| Check | Result |
| :--- | :--- |
| ERP variance (computed vs. `DEBENQ.TXT` CURRENT BALANCE) | **R0.00** — PASS |
| B/F chain continuity across all 4 slices | PASS — each slice B/F ties exactly to prior slice close |
| EMPTY-pair deposit invoice/CN stripped from display | 105 pairs |
| Financial lines shown | 528 |
| Balances shown | ERP-printed running balance per row (source of truth — not recomputed) |

> **H-011 status: RESOLVED.** Full authoritative debtor account history received 2026-09-17 (operator-supplied DEBENQ*.TXT set), superseding the stale global-report anchor (`130720251H45M.TXT`, ASSERTED_STALE) used in Turn 001.

---

## Lane-Lock Finding (Turn 002)

Triage in Turn 001 **ASSUMED** lane `settlement_discount` without TXT evidence. Payment-to-invoice matching against the full TXT set below **does not support that lane**:

| Signal | Count |
| :--- | ---: |
| Payment rows analysed | 226 |
| Paid = invoice value exactly (±1c) | 181 |
| Paid < invoice value (partial/short) | 42 |
| No direct INVNO match (batch/multi-doc STAT allocation) | 3 |

The "paid < invoice" rows do **not** cluster around a fixed ratio (e.g. 97.5% for a 2.5% settlement discount) — sampled ratios range ~3%–75% of invoice value, consistent with **partial payments split across a remittance batch**, not a consistent early-settlement discount scheme.

**Lane lock: `position_recon`** (standard full-value settlement) — supersedes the Turn 001 `settlement_discount` ASSUMPTION. No remittance PDFs are required to sustain this lane.

---

## Scope note — Part 2 (CYL custody) not included

This statement covers **Part 1 (combined financial ledger) only**, built directly from ERP TXT per repo doctrine ("ERP TXT is Tier-3 authority for combined balance"). It does **not** include:

- The LPG (1A) vs. CYL deposit (1B) financial sub-ledger split (statement_v5 layout)
- Part 2 physical cylinder custody tracker (SKU quantities)

Both require a live `DATABASE_URL` connection (`vw_clean_transactions` / `transaction_headers`) which was **not available in this session**. Once DB access is available, run:

```bash
node analysis/debtors/shared/scripts/reconcile_debtor_v4_from_txt.mjs --debtor CAP000   # combined + custody
node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor CAP000   # 1A/1B split + custody
```

after populating `config/statement_v4.json` / `config/statement_v5.json` from the templates (this file supplies `combinedBf: 0.00`, `periodStart: 2022-07-23`).

EMPTY-pair stripping (deposit invoice matched to its exact-reversal credit note on the same reference) was applied for readability, matching v4 doctrine; underlying rows remain in the raw TXT.

---

## Part 1: Combined Financial Ledger

### July 2022

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | | **0.00** |
| 23 Jul 2022 | Crd Note | 3752 | PRICE WENT OFF | -1,628.40 | -1,628.40 |
| 23 Jul 2022 | Invoice | 14689 | D/N 1919 | 1,628.40 | 0.00 |
| 23 Jul 2022 | Invoice | 14690 | D/N 1919. | 1,596.00 | 1,596.00 |

---

### August 2022

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | | **1,596.00** |
| 09 Aug 2022 | Invoice | 14977 | D/N 93 | 1,624.50 | 3,220.50 |
| 27 Aug 2022 | Invoice | 15344 | D/N 2025 | 1,624.50 | 4,845.00 |
| 30 Aug 2022 | Payment | 15846 | TRANSF | STAT83 | -1,596.00 | 3,249.00 |

---

### September 2022

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | | **3,249.00** |
| 26 Sept 2022 | Invoice | 15799 | D/N 2476 | 1,566.30 | 4,815.30 |
| 30 Sept 2022 | Payment | 16210 | TRANSF | STAT84 | -1,624.50 | 3,190.80 |
| 30 Sept 2022 | Payment | 16210 | TRANSF | STAT84 | -1,624.50 | 1,566.30 |

---

### October 2022

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | | **1,566.30** |
| 12 Oct 2022 | Invoice | 16016 | D/N 2366 | 2,166.00 | 3,732.30 |
| 31 Oct 2022 | Payment | 16652 | TRANSF | STAT85 | -1,566.30 | 2,166.00 |

---

### November 2022

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | | **2,166.00** |
| 16 Nov 2022 | Crd Note | 4295 | D/N 2521 | -1,576.06 | 589.94 |
| 16 Nov 2022 | Invoice | 16473 | D/N 2521 | 1,576.06 | 2,166.00 |
| 17 Nov 2022 | Invoice | 16477 | D/N 2568 | 1,514.55 | 3,680.55 |
| 28 Nov 2022 | Invoice | 16609 | MAKRO PMB D/N 2549 | 3,981.61 | 7,662.16 |
| 30 Nov 2022 | Payment | 17049 | TRANSF | STAT86 | -2,166.00 | 5,496.16 |

---

### December 2022

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | | **5,496.16** |
| 06 Dec 2022 | Invoice | 16710 | D/N 2682 | 1,576.06 | 7,072.22 |
| 09 Dec 2022 | Invoice | 16768 | D/N 2733 | 4,101.12 | 11,173.34 |
| 22 Dec 2022 | Invoice | 16993 | D/N 2826 | 1,623.36 | 12,796.70 |
| 23 Dec 2022 | Invoice | 17026 | D/N 2829 | 4,101.12 | 16,897.82 |
| 23 Dec 2022 | Payment | 17491 | TRANSF | STAT86 | -1,514.55 | 15,383.27 |
| 31 Dec 2022 | Invoice | 17128 | D/N 2941 | 4,101.12 | 19,484.39 |
| 31 Dec 2022 | Invoice | 17139 | D/N 2941 EMPTIES | 1,794.00 | 21,278.39 |

---

### January 2023

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | | **21,278.39** |
| 09 Jan 2023 | Crd Note | 4451 | ORDER NUMBER | -9,807.88 | 11,470.51 |
| 09 Jan 2023 | Invoice | 17219 | D/N 2990 | 1,663.83 | 13,134.34 |
| 09 Jan 2023 | Invoice | 17220 | D/N 2991 HILTON | 9,807.88 | 22,942.22 |
| 09 Jan 2023 | Invoice | 17225 | D/N 2991 HILTON HL09 | 9,807.88 | 32,750.10 |
| 09 Jan 2023 | Invoice | 17227 | D/N 2991 EMPTIES | 1,794.00 | 34,544.10 |
| 09 Jan 2023 | Invoice | 17327 | D/N 2991 EMPTIES HIL | 1,794.00 | 36,338.10 |
| 19 Jan 2023 | Crd Note | 4478 | D/N 3068 EMPTIES | -1,794.00 | 34,544.10 |
| 19 Jan 2023 | Crd Note | 4479 | D/N 3068 EMPTIES | -1,794.00 | 32,750.10 |
| 30 Jan 2023 | Invoice | 17423 | D/N 3233 | 1,663.83 | 34,413.93 |
| 30 Jan 2023 | Payment | 17886 | TRANSF | STAT:89 | -15,383.27 | 45,054.37 |

---

### February 2023

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | | **34,413.93** |
| 01 Feb 2023 | Invoice | 17440 | D/N 3109 MAK 36 | 4,203.38 | 38,617.31 |
| 21 Feb 2023 | Invoice | 17711 | D/N 3321 | 1,594.35 | 40,211.66 |
| 21 Feb 2023 | Invoice | 17712 | D/N 3325 | 4,027.84 | 44,239.50 |
| 28 Feb 2023 | Payment | 18484 | TRANSF | STAT:89 | -11,471.71 | 33,582.66 |

---

### March 2023

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | | **44,239.50** |
| 01 Mar 2023 | Invoice | 18036 | D/N 3355 | 4,027.84 | 48,267.34 |
| 07 Mar 2023 | Invoice | 18248 | D/N 3369 | 1,853.37 | 50,120.71 |
| 16 Mar 2023 | Invoice | 18509 | D/N3827 | 4,682.24 | 54,802.95 |
| 17 Mar 2023 | Crd Note | 4620 | D/N  3908EMPTIES HIL | -1,794.00 | 51,214.95 |
| 17 Mar 2023 | Invoice | 18571 | D/N 3908 | 4,572.66 | 55,787.61 |
| 22 Mar 2023 | Invoice | 18635 | D/N 3916 | 1,810.01 | 59,391.62 |
| 31 Mar 2023 | Payment | 19503 | TRANSF | STAT:89 | -1,663.83 | 57,727.79 |
| 31 Mar 2023 | Payment | 19503 | TRANSF | STAT:89 | -4,203.38 | 53,524.41 |
| 31 Mar 2023 | Payment | 19503 | TRANSF | STAT:89 | -1,594.35 | 51,930.06 |
| 31 Mar 2023 | Payment | 19503 | TRANSF | STAT:89 | -4,027.84 | 47,902.22 |

---

### April 2023

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | | **47,902.22** |
| 03 Apr 2023 | Invoice | 18999 | D/N 3959 | 2,470.76 | 50,372.98 |
| 06 Apr 2023 | Invoice | 19137 | D/N 3869 MAKRO | 4,681.44 | 55,054.42 |
| 17 Apr 2023 | Invoice | 19408 | D/N 4073 | 4,567.04 | 59,621.46 |
| 17 Apr 2023 | Invoice | 19410 | D/N 4706 | 2,410.40 | 62,031.86 |
| 17 Apr 2023 | Invoice | 19411 | D/N 4707 | 4,567.04 | 66,598.90 |
| 28 Apr 2023 | Invoice | 19762 | D/N 4146 | 4,567.04 | 71,165.94 |
| 29 Apr 2023 | Crd Note | 4807 | D/N 4146 EMPTIES | -1,794.00 | 69,371.94 |
| 29 Apr 2023 | Invoice | 19811 | D/N 4146 CREDIT NOTE | 1,794.00 | 71,165.94 |

---

### May 2023

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | | **71,165.94** |
| 02 May 2023 | Payment | 20354 | TRANSF | STAT:90 | -4,027.84 | 67,138.10 |
| 02 May 2023 | Payment | 20354 | TRANSF | STAT:90 | -1,853.37 | 65,284.73 |
| 02 May 2023 | Payment | 20354 | TRANSF | STAT:90 | -4,682.24 | 60,602.49 |
| 02 May 2023 | Payment | 20354 | TRANSF | STAT:90 | -1,810.01 | 58,792.48 |
| 04 May 2023 | Invoice | 19921 | D/N 4161 | 4,567.04 | 61,565.52 |
| 08 May 2023 | Invoice | 20051 | D/N4180 | 4,010.40 | 67,369.92 |
| 08 May 2023 | Invoice | 20052 | D/N4179 | 2,116.60 | 69,486.52 |
| 22 May 2023 | Invoice | 20492 | D/N 4631 | 4,012.66 | 73,499.18 |
| 24 May 2023 | Invoice | 20547 | D/N 4778 | 2,117.79 | 73,822.97 |
| 24 May 2023 | Invoice | 20550 | D/N 3640 | 4,111.30 | 77,934.27 |

---

### June 2023

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | | **79,728.27** |
| 03 Jun 2023 | Invoice | 20959 | D/N 5303 | 4,012.66 | 83,740.93 |
| 06 Jun 2023 | Invoice | 21032 | D/N 3683 | 4,012.66 | 87,753.59 |
| 06 Jun 2023 | Invoice | 21034 | D/N 3680 | 2,117.79 | 89,871.38 |
| 07 Jun 2023 | Payment | 21432 | TRANSF | STAT:91 | -2,470.76 | 87,400.62 |
| 07 Jun 2023 | Payment | 21432 | TRANSF | STAT:91 | -4,681.44 | 82,719.18 |
| 07 Jun 2023 | Payment | 21432 | TRANSF | STAT:91 | -4,567.04 | 78,152.14 |
| 07 Jun 2023 | Payment | 21432 | TRANSF | STAT:91 | -2,410.40 | 75,741.74 |
| 07 Jun 2023 | Payment | 21432 | TRANSF | STAT:91 | -4,567.04 | 71,174.70 |
| 13 Jun 2023 | Invoice | 21266 | D/N 4686 | 4,111.30 | 73,492.00 |
| 21 Jun 2023 | Invoice | 21513 | D/N 5229 | 2,709.00 | 75,005.00 |
| 27 Jun 2023 | Invoice | 21725 | D/N 4828 | 4,106.26 | 80,307.26 |
| 29 Jun 2023 | Invoice | 21794 | D/N 4837 | 4,106.26 | 84,413.52 |
| 30 Jun 2023 | Invoice | 21816 | D/N 5260 | 2,737.51 | 87,749.03 |

---

### July 2023

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | | **88,945.03** |
| 03 Jul 2023 | Payment | 22181 | TRANSF | STAT:92 | -4,101.12 | 84,843.91 |
| 03 Jul 2023 | Payment | 22181 | TRANSF | STAT:92 | -4,567.04 | 80,276.87 |
| 03 Jul 2023 | Payment | 22181 | TRANSF | STAT:92 | -4,567.04 | 75,709.83 |
| 03 Jul 2023 | Payment | 22181 | TRANSF | STAT:92 | -4,010.40 | 71,699.43 |
| 03 Jul 2023 | Payment | 22181 | TRANSF | STAT:92 | -2,116.60 | 69,582.83 |
| 03 Jul 2023 | Payment | 22181 | TRANSF | STAT:92 | -4,012.66 | 65,570.17 |
| 03 Jul 2023 | Payment | 22181 | TRANSF | STAT:92 | -2,117.79 | 63,452.38 |
| 03 Jul 2023 | Payment | 22181 | TRANSF | STAT:92 | -4,111.30 | 59,341.08 |
| 07 Jul 2023 | Invoice | 22080 | D/N 5274 | 2,737.51 | 62,078.59 |
| 10 Jul 2023 | Invoice | 22174 | D/N 4878 | 2,709.00 | 61,797.59 |
| 18 Jul 2023 | Invoice | 22496 | D/N 5811 | 3,735.36 | 66,728.95 |
| 19 Jul 2023 | Invoice | 22524 | D/N 5514 | 2,490.24 | 71,013.19 |
| 19 Jul 2023 | Invoice | 22538 | D/N 5514 EMPTIES | 1,196.00 | 72,209.19 |
| 20 Jul 2023 | Crd Note | 5585 | D/N 5816 EMPTIES | -1,794.00 | 70,415.19 |
| 20 Jul 2023 | Invoice | 22559 | D/N 5816 | 2,490.24 | 72,905.43 |
| 20 Jul 2023 | Invoice | 22561 | D/N 5816 EMPTIES | 1,196.00 | 74,101.43 |
| 27 Jul 2023 | Invoice | 22844 | D/N 5550 | 2,464.30 | 73,575.73 |
| 31 Jul 2023 | Payment | 23110 | TRANSF | STAT 92 | -4,012.66 | 72,553.07 |
| 31 Jul 2023 | Payment | 23110 | TRANSF | STAT 92 | -4,012.66 | 68,540.41 |
| 31 Jul 2023 | Payment | 23110 | TRANSF | STAT 92 | -2,117.79 | 66,422.62 |
| 31 Jul 2023 | Payment | 23110 | TRANSF | STAT 92 | -4,111.30 | 62,311.32 |
| 31 Jul 2023 | Payment | 23110 | TRANSF | STAT 92 | -2,709.00 | 59,602.32 |
| 31 Jul 2023 | Payment | 23110 | TRANSF | STAT 92 | -4,106.26 | 55,496.06 |
| 31 Jul 2023 | Payment | 23110 | TRANSF | STAT 92 | -4,106.26 | 51,389.80 |
| 31 Jul 2023 | Payment | 23110 | TRANSF | STAT 92 | -2,737.51 | 48,652.29 |

---

### August 2023

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | | **46,858.29** |
| 02 Aug 2023 | Invoice | 23071 | D/N 4361 | 3,735.36 | 50,593.65 |
| 03 Aug 2023 | Invoice | 23096 | D/N 5570 | 2,490.24 | 54,877.89 |
| 04 Aug 2023 | Crd Note | 5789 | D/N 6204 EMPTIES | -1,196.00 | 53,681.89 |
| 04 Aug 2023 | Invoice | 23173 | D/N 6204 | 3,735.36 | 57,417.25 |
| 04 Aug 2023 | Invoice | 23180 | D/N 6204 EMPTIES | 1,794.00 | 59,211.25 |
| 04 Aug 2023 | Invoice | 23192 | D/N 6204 | 3,735.36 | 62,946.61 |
| 07 Aug 2023 | Crd Note | 5804 | D/N 6204 | -3,735.36 | 59,211.25 |
| 14 Aug 2023 | Invoice | 23418 | D/N 5598 | 1,865.79 | 58,685.04 |
| 14 Aug 2023 | Invoice | 23445 | D/N 6213 | 2,356.78 | 63,433.82 |
| 17 Aug 2023 | Invoice | 23530 | D/N 6225 | 466.44 | 63,302.26 |
| 22 Aug 2023 | Invoice | 23675 | D/N 6329 | 3,535.12 | 65,641.38 |
| 22 Aug 2023 | Invoice | 23722 | D/N 6329 | 3,535.11 | 70,970.49 |
| 23 Aug 2023 | Crd Note | 5973 | D/N 6329 | -3,535.11 | 67,435.38 |
| 23 Aug 2023 | Invoice | 23709 | D/N 6333 | 3,535.12 | 69,176.50 |
| 30 Aug 2023 | Invoice | 23948 | D/N 6370 | 3,700.71 | 72,877.21 |
| 31 Aug 2023 | Payment | 23993 | TRANSF | STAT 94 | -4,572.66 | 70,098.55 |
| 31 Aug 2023 | Payment | 23993 | TRANSF | STAT 94 | -2,737.51 | 67,361.04 |
| 31 Aug 2023 | Payment | 23993 | TRANSF | STAT 94 | -2,709.00 | 64,652.04 |
| 31 Aug 2023 | Payment | 23993 | TRANSF | STAT 94 | -3,735.36 | 60,916.68 |
| 31 Aug 2023 | Payment | 23993 | TRANSF | STAT 94 | -2,490.24 | 58,426.44 |
| 31 Aug 2023 | Payment | 23993 | TRANSF | STAT 94 | -2,464.30 | 55,962.14 |

---

### September 2023

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | | **55,962.14** |
| 01 Sept 2023 | Invoice | 24013 | D/N 6424 | 1,952.44 | 57,914.58 |
| 02 Sept 2023 | Crd Note | 6085 | D/N 6424 | -1,952.42 | 58,354.16 |
| 02 Sept 2023 | Invoice | 24048 | D/N 6381 | 2,467.14 | 57,233.30 |
| 02 Sept 2023 | Invoice | 24077 | D/N 6229 | 1,952.44 | 60,381.74 |
| 04 Sept 2023 | Invoice | 24128 | D/N 6386 | 2,467.14 | 61,652.88 |
| 07 Sept 2023 | Invoice | 24259 | D/N 6399 | 3,533.75 | 64,588.63 |
| 15 Sept 2023 | Invoice | 24487 | D/N 6456 | 2,021.47 | 64,816.10 |
| 15 Sept 2023 | Invoice | 24506 | D/N 6526 | 2,553.41 | 69,761.51 |
| 19 Sept 2023 | Invoice | 24637 | D/N 6468 | 3,830.12 | 74,787.63 |
| 28 Sept 2023 | Invoice | 24887 | D/N 6564 | 3,830.12 | 76,823.75 |
| 29 Sept 2023 | Payment | 24730 | TRANSF | STAT 94 | -2,490.24 | 73,735.51 |
| 29 Sept 2023 | Payment | 24730 | TRANSF | STAT 94 | -3,735.36 | 70,000.15 |
| 29 Sept 2023 | Payment | 24730 | TRANSF | STAT 94 | -2,490.24 | 67,509.91 |
| 29 Sept 2023 | Payment | 24730 | TRANSF | STAT 94 | -3,735.36 | 63,774.55 |
| 29 Sept 2023 | Payment | 24730 | TRANSF | STAT 94 | -1,865.79 | 61,908.76 |
| 29 Sept 2023 | Payment | 24730 | TRANSF | STAT 94 | -1,758.79 | 60,149.97 |
| 29 Sept 2023 | Payment | 24730 | TRANSF | STAT 94 | -3,535.12 | 56,614.85 |
| 29 Sept 2023 | Payment | 24730 | TRANSF | STAT 94 | -3,535.11 | 53,079.74 |
| 29 Sept 2023 | Payment | 24730 | TRANSF | STAT 94 | -3,700.71 | 49,379.03 |
| 29 Sept 2023 | Payment | 24731 | TRANSF | STAT 94 | -466.44 | 48,912.59 |
| 29 Sept 2023 | Invoice | 24930 | D/N 6568 | 2,021.47 | 50,934.06 |
| 30 Sept 2023 | Invoice | 24992 | D/N 6570 | 2,553.41 | 54,683.47 |

---

### October 2023

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | | **54,683.47** |
| 06 Oct 2023 | Invoice | 25208 | D/N 6595 | 2,838.55 | 57,522.02 |
| 09 Oct 2023 | Invoice | 25298 | D/N 6267 | 2,838.57 | 59,762.59 |
| 09 Oct 2023 | Invoice | 25304 | D/N 6267 | 4,257.85 | 65,814.44 |
| 10 Oct 2023 | Crd Note | 6467 | QTY | -2,838.57 | 62,975.87 |
| 11 Oct 2023 | Invoice | 25368 | D/N 6704 | 2,246.56 | 62,830.43 |
| 19 Oct 2023 | Invoice | 25624 | D/N 6818 | 4,256.64 | 69,479.07 |
| 20 Oct 2023 | Invoice | 25659 | D/N 6824 | 2,837.76 | 70,522.83 |
| 20 Oct 2023 | Invoice | 25694 | D/N 6728 | 1,684.92 | 73,403.75 |
| 28 Oct 2023 | Invoice | 25945 | D/N 6836 | 4,256.64 | 76,464.39 |
| 31 Oct 2023 | Payment | 26186 | TRANSF | STAT 95 | -2,467.14 | 75,791.25 |
| 31 Oct 2023 | Payment | 26186 | TRANSF | STAT 95 | -1,952.44 | 73,838.81 |
| 31 Oct 2023 | Payment | 26186 | TRANSF | STAT 95 | -2,467.14 | 71,371.67 |
| 31 Oct 2023 | Payment | 26186 | TRANSF | STAT 95 | -3,533.75 | 67,837.92 |
| 31 Oct 2023 | Payment | 26186 | TRANSF | STAT 95 | -2,021.47 | 65,816.45 |
| 31 Oct 2023 | Payment | 26186 | TRANSF | STAT 95 | -920.84 | 64,895.61 |
| 31 Oct 2023 | Payment | 26186 | TRANSF | STAT 95 | -3,830.12 | 61,065.49 |
| 31 Oct 2023 | Payment | 26186 | TRANSF | STAT 95 | -3,830.12 | 57,235.37 |

---

### November 2023

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | | **53,049.37** |
| 04 Nov 2023 | Invoice | 26253 | D/N 6774 | 2,961.60 | 56,010.97 |
| 04 Nov 2023 | Invoice | 26257 | D/N 7002 | 2,344.60 | 59,551.57 |
| 04 Nov 2023 | Invoice | 26259 | D/N 7003 | 1,153.30 | 63,096.87 |
| 09 Nov 2023 | Invoice | 26407 | D/N 6789 | 2,344.60 | 66,039.47 |
| 14 Nov 2023 | Invoice | 26569 | D/N 6862 | 4,442.40 | 68,687.87 |
| 15 Nov 2023 | Crd Note | 6819 | D/N 7018 EMPTIES | -1,196.00 | 69,285.87 |
| 15 Nov 2023 | Invoice | 26615 | D/N 7018 | 4,442.40 | 73,728.27 |
| 15 Nov 2023 | Invoice | 26616 | D/N 7018 EMPTIES | 1,794.00 | 75,522.27 |
| 16 Nov 2023 | Invoice | 26624 | D/N 7020 | 2,961.60 | 77,287.87 |
| 27 Nov 2023 | Invoice | 27141 | D/N 7052 | 1,758.45 | 80,242.32 |
| 30 Nov 2023 | Payment | 26675 | TRANSF | STAT 96 | -2,838.55 | 76,207.77 |
| 30 Nov 2023 | Payment | 26675 | TRANSF | STAT 96 | -4,257.85 | 71,949.92 |
| 30 Nov 2023 | Payment | 26675 | TRANSF | STAT 96 | -2,246.56 | 69,703.36 |
| 30 Nov 2023 | Payment | 26675 | TRANSF | STAT 96 | -4,256.64 | 65,446.72 |
| 30 Nov 2023 | Payment | 26675 | TRANSF | STAT 96 | -2,837.76 | 62,608.96 |
| 30 Nov 2023 | Payment | 26675 | TRANSF | STAT 96 | -1,684.92 | 60,924.04 |
| 30 Nov 2023 | Payment | 26675 | TRANSF | STAT 96 | -4,256.64 | 56,667.40 |
| 30 Nov 2023 | Invoice | 27107 | D/N 7067 | 2,961.60 | 59,629.00 |

---

### December 2023

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | | **60,825.00** |
| 13 Dec 2023 | Invoice | 27598 | D/N 7513 | 2,430.32 | 63,255.32 |
| 14 Dec 2023 | Crd Note | 7082 | WQRONG PRICE | -2,961.60 | 60,293.72 |
| 14 Dec 2023 | Invoice | 27609 | D/N 7517 | 2,961.60 | 63,255.32 |
| 14 Dec 2023 | Invoice | 27614 | D/N 7517-2 | 3,070.09 | 66,325.41 |
| 22 Dec 2023 | Payment | 27322 | TRANSF | STAT 97 | -2,961.60 | 63,363.81 |
| 22 Dec 2023 | Payment | 27322 | TRANSF | STAT 97 | -2,344.60 | 61,019.21 |
| 22 Dec 2023 | Payment | 27322 | TRANSF | STAT 97 | -1,153.30 | 59,865.91 |
| 22 Dec 2023 | Payment | 27322 | TRANSF | STAT 97 | -1,148.60 | 58,717.31 |
| 22 Dec 2023 | Payment | 27322 | TRANSF | STAT 97 | -4,442.40 | 54,274.91 |
| 22 Dec 2023 | Payment | 27322 | TRANSF | STAT 97 | -4,442.40 | 49,832.51 |
| 22 Dec 2023 | Payment | 27322 | TRANSF | STAT 97 | -2,961.60 | 46,870.91 |
| 30 Dec 2023 | Invoice | 28189 | D/N 7707 | 3,070.11 | 49,941.02 |

---

### January 2024

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | | **49,941.02** |
| 09 Jan 2024 | Invoice | 28470 | D/N 7586 | 2,437.91 | 52,378.93 |
| 12 Jan 2024 | Invoice | 28614 | D/N 7598 | 3,079.72 | 55,458.65 |
| 25 Jan 2024 | Invoice | 28969 | D/N 3711 | 3,079.24 | 58,537.89 |
| 26 Jan 2024 | Invoice | 28995 | D/N 7763 | 2,437.72 | 60,975.61 |
| 26 Jan 2024 | Invoice | 29002 | D/N3714 | 3,079.24 | 64,054.85 |
| 29 Jan 2024 | Payment | 28323 | TRANSF | STAT 98 | -2,961.60 | 61,093.25 |
| 29 Jan 2024 | Payment | 28323 | TRANSF | STAT 98 | -1,758.45 | 59,334.80 |
| 29 Jan 2024 | Payment | 28323 | TRANSF | STAT 98 | -2,430.32 | 56,904.48 |

---

### February 2024

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | | **56,904.48** |
| 06 Feb 2024 | Invoice | 29303 | D/N 7789 | 4,618.86 | 61,523.34 |
| 10 Feb 2024 | Invoice | 29457 | D/N 7802 PINETOWN | 3,114.75 | 64,638.09 |
| 13 Feb 2024 | Invoice | 29535 | D/N 7663/7812 MID | 1,232.91 | 65,871.00 |
| 13 Feb 2024 | Invoice | 29537 | D/N 7810 | 2,465.83 | 68,336.83 |
| 23 Feb 2024 | Invoice | 29792 | D/N 7860 | 3,114.73 | 71,451.56 |
| 28 Feb 2024 | Payment | 29266 | TRANSF | STAT 99 | -1,794.00 | 69,657.56 |
| 28 Feb 2024 | Payment | 29266 | TRANSF | STAT 99 | -3,070.09 | 66,587.47 |
| 28 Feb 2024 | Payment | 29266 | TRANSF | STAT 99 | -3,070.11 | 63,517.36 |
| 28 Feb 2024 | Payment | 29266 | TRANSF | STAT 99 | -3,079.72 | 60,437.64 |

---

### March 2024

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | | **33,582.66** |
| 04 Mar 2024 | Crd Note | 7592 | DN7900 | -2,392.00 | 31,190.66 |
| 04 Mar 2024 | Invoice | 30098 | DN7900 | 2,465.83 | 33,656.49 |
| 04 Mar 2024 | Invoice | 30100 | DN7900 | 2,392.00 | 36,048.49 |
| 08 Mar 2024 | Invoice | 30228 | SO/7837 | 3,145.83 | 39,194.32 |
| 11 Mar 2024 | Invoice | 30302 | HILTON COLLEGE | 9,437.47 | 48,631.79 |
| 27 Mar 2024 | Invoice | 30780 | DN#8077 SO#8040 | 4,718.74 | 53,350.53 |
| 28 Mar 2024 | Payment | 30021 | TRANSF | STAT 100 | -1,196.00 | 52,154.53 |
| 28 Mar 2024 | Payment | 30021 | TRANSF | STAT 100 | -598.00 | 51,556.53 |
| 28 Mar 2024 | Payment | 30021 | TRANSF | STAT 100 | -4,618.86 | 46,937.67 |
| 28 Mar 2024 | Payment | 30021 | TRANSF | STAT 100 | -3,114.75 | 43,822.92 |
| 28 Mar 2024 | Payment | 30021 | TRANSF | STAT 100 | -3,114.73 | 40,708.19 |
| 28 Mar 2024 | Payment | 30021 | TRANSF | STAT 100 | -80.22 | 40,627.97 |
| 28 Mar 2024 | Payment | 30021 | TRANSF | STAT 100 | -416.96 | 40,211.01 |
| 28 Mar 2024 | Payment | 30021 | TRANSF | STAT 100 | -1,939.82 | 38,271.19 |
| 28 Mar 2024 | Invoice | 30813 | DN#8858 SO#8047 | 3,145.83 | 41,417.02 |

---

### April 2024

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | | **41,417.02** |
| 02 Apr 2024 | Invoice | 30887 | DN#8092 SO#8081 | 2,785.36 | 44,202.38 |
| 12 Apr 2024 | Invoice | 31231 | DN#8785 SO#8190 | 3,130.37 | 47,332.75 |
| 18 Apr 2024 | Invoice | 31398 | SO 8233 D/N 8891 | 2,478.20 | 49,810.95 |
| 24 Apr 2024 | Invoice | 31559 | DN#8685 -THE VILLAGE | 3,130.37 | 52,941.32 |

---

### May 2024

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | | **52,941.32** |
| 03 May 2024 | Invoice | 31859 | HILTON COLLEGE | 4,695.55 | 57,636.87 |
| 04 May 2024 | Crd Note | 8300 | HILTON COLLEGE | -4,695.55 | 52,941.32 |
| 06 May 2024 | Invoice | 31899 | DN#8706 -SCOTSVILLE | 619.55 | 53,560.87 |
| 07 May 2024 | Invoice | 31943 | DN#8711 HILTON COL | 4,639.39 | 58,200.26 |
| 09 May 2024 | Payment | 30631 | TRANSF | STAT 102 | -3,145.83 | 55,054.43 |
| 09 May 2024 | Payment | 30631 | TRANSF | STAT 102 | -9,437.47 | 45,616.96 |
| 09 May 2024 | Payment | 30631 | TRANSF | STAT 102 | -4,718.74 | 40,898.22 |
| 09 May 2024 | Payment | 30631 | TRANSF | STAT 102 | -3,145.83 | 37,752.39 |
| 09 May 2024 | Payment | 30631 | TRANSF | STAT 102 | -624.86 | 37,127.53 |
| 09 May 2024 | Payment | 30631 | TRANSF | STAT 102 | -590.65 | 36,536.88 |
| 09 May 2024 | Payment | 30631 | TRANSF | STAT 102 | -3,111.49 | 33,425.39 |
| 09 May 2024 | Payment | 30631 | TRANSF | STAT 102 | -690.00 | 32,735.39 |
| 09 May 2024 | Payment | 30631 | TRANSF | STAT 102 | 690.00 | 33,425.39 |
| 09 May 2024 | Payment | 30631 | TRANSF | STAT 102 | -1,207.50 | 32,217.89 |
| 09 May 2024 | Payment | 30631 | TRANSF | STAT 102 | 1,207.50 | 33,425.39 |
| 09 May 2024 | Payment | 30631 | TRANSF | STAT 102 | 4,326.99 | 37,752.38 |
| 10 May 2024 | Invoice | 32040 | DN#8730 -THE VILLAGE | 3,092.93 | 40,845.31 |
| 14 May 2024 | Invoice | 32122 | DN#8742 | 2,448.58 | 43,293.89 |
| 25 May 2024 | Invoice | 32455 | DN#8924 - PINETOWN | 3,092.93 | 46,386.82 |
| 28 May 2024 | Invoice | 32510 | DN#8497 -SCOTSVILLE | 612.14 | 46,998.96 |
| 28 May 2024 | Invoice | 32539 | D/N 8926 | 4,639.39 | 51,638.35 |
| 31 May 2024 | Payment | 31835 | TRANSF | STAT 102 | -2,785.36 | 48,852.99 |
| 31 May 2024 | Payment | 31835 | TRANSF | STAT 102 | -2,478.20 | 46,374.79 |

---

### June 2024

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | | **46,374.79** |
| 03 Jun 2024 | Invoice | 32676 | DN#8937 | 2,448.58 | 48,823.37 |
| 07 Jun 2024 | Invoice | 32823 | DN#8536 | 589.90 | 49,413.27 |
| 10 Jun 2024 | Invoice | 32942 | DN#8549 - VILLAGE | 2,980.59 | 52,393.86 |
| 12 Jun 2024 | Invoice | 33007 | DN#8338 - HILTON COL | 4,470.89 | 56,864.75 |
| 14 Jun 2024 | Invoice | 33114 | DN#9087 | 2,359.62 | 59,224.37 |
| 21 Jun 2024 | Invoice | 33355 | DN#9978- VILLAGE | 2,980.59 | 62,204.96 |

---

### July 2024

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | | **62,204.96** |
| 03 Jul 2024 | Payment | 31836 | TRANSF | STAT 104 | -1,190.55 | 61,014.41 |
| 03 Jul 2024 | Payment | 31836 | TRANSF | STAT 104 | -1,257.73 | 59,756.68 |
| 03 Jul 2024 | Payment | 31836 | TRANSF | STAT 104 | -4,639.39 | 55,117.29 |
| 03 Jul 2024 | Payment | 31836 | TRANSF | STAT 104 | -3,092.93 | 52,024.36 |
| 03 Jul 2024 | Payment | 31836 | TRANSF | STAT 104 | -3,092.93 | 48,931.43 |
| 03 Jul 2024 | Payment | 31836 | TRANSF | STAT 104 | -4,639.39 | 44,292.04 |
| 04 Jul 2024 | Invoice | 33818 | DN#10034- PINETOWN | 2,980.59 | 47,272.63 |
| 08 Jul 2024 | Invoice | 33960 | DN#9781- CLOUGH ST | 2,283.05 | 49,555.68 |
| 17 Jul 2024 | Invoice | 34303 | DN#9586 | 4,442.74 | 53,998.42 |
| 18 Jul 2024 | Invoice | 34357 | DN#9820- VILLAGE | 2,961.83 | 56,960.25 |
| 30 Jul 2024 | Invoice | 34709 | 21 CLOUGH STR DN#983 | 2,344.76 | 59,305.01 |
| 30 Jul 2024 | Invoice | 34711 | SCOTSVILLE | 586.19 | 59,891.20 |
| 31 Jul 2024 | Payment | 32594 | TRANSF | STAT 104 | -1,872.64 | 58,018.56 |
| 31 Jul 2024 | Payment | 32594 | TRANSF | STAT 104 | -575.94 | 57,442.62 |
| 31 Jul 2024 | Payment | 32594 | TRANSF | STAT 104 | -1,872.64 | 55,569.98 |
| 31 Jul 2024 | Payment | 32594 | TRANSF | STAT 104 | -2,980.59 | 52,589.39 |
| 31 Jul 2024 | Payment | 32594 | TRANSF | STAT 104 | -1,812.36 | 50,777.03 |
| 31 Jul 2024 | Invoice | 34764 | DN#9850- HILTON COLL | 4,442.74 | 55,219.77 |

---

### August 2024

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | | **55,219.77** |
| 06 Aug 2024 | Invoice | 34997 | DN#11362- VILLAGE | 5,923.65 | 61,143.42 |
| 14 Aug 2024 | Invoice | 35251 | DN#9405- HILTON COL | 4,442.74 | 65,586.16 |
| 19 Aug 2024 | Invoice | 35392 | DN#9434 | 586.19 | 66,172.35 |
| 22 Aug 2024 | Invoice | 35466 | 21...D/N 9438 | 2,344.76 | 68,517.11 |
| 22 Aug 2024 | Invoice | 35468 | 12 CON D/N 9439 | 586.19 | 69,103.30 |
| 28 Aug 2024 | Invoice | 35669 | DN#11012 - VILLAGE | 2,961.83 | 72,065.13 |

---

### September 2024

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | | **72,065.13** |
| 03 Sept 2024 | Invoice | 35859 | DN#11251 | 4,442.74 | 76,507.87 |
| 04 Sept 2024 | Payment | 33260 | TRANSF | STAT 106 | -2,980.59 | 73,527.28 |
| 04 Sept 2024 | Payment | 33260 | TRANSF | STAT 106 | -2,283.05 | 71,244.23 |
| 04 Sept 2024 | Payment | 33260 | TRANSF | STAT 106 | -4,442.74 | 66,801.49 |
| 04 Sept 2024 | Payment | 33260 | TRANSF | STAT 106 | -2,961.83 | 63,839.66 |
| 04 Sept 2024 | Payment | 33260 | TRANSF | STAT 106 | -2,344.76 | 61,494.90 |
| 04 Sept 2024 | Payment | 33260 | TRANSF | STAT 106 | -4,442.74 | 57,052.16 |
| 10 Sept 2024 | Invoice | 36082 | DN#11262 | 2,935.90 | 59,988.06 |
| 11 Sept 2024 | Invoice | 36140 | DN#11041- CLOUGH | 2,324.24 | 62,312.30 |
| 13 Sept 2024 | Invoice | 36230 | DN#11283 | 4,403.86 | 66,716.16 |
| 27 Sept 2024 | Invoice | 36694 | DN#11521 | 2,935.90 | 69,652.06 |
| 30 Sept 2024 | Payment | 33821 | TRANSF | STAT 106 | -5,923.65 | 63,728.41 |
| 30 Sept 2024 | Payment | 33821 | TRANSF | STAT 106 | -4,442.74 | 59,285.67 |
| 30 Sept 2024 | Payment | 33821 | TRANSF | STAT 106 | -2,961.83 | 56,323.84 |
| 30 Sept 2024 | Invoice | 36791 | DN#10072- CLOUGH STR | 2,324.24 | 58,648.08 |

---

### October 2024

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | | **58,648.08** |
| 02 Oct 2024 | Invoice | 36890 | D/N 10161 PINETOWN | 2,935.90 | 61,583.98 |
| 03 Oct 2024 | Invoice | 36917 | D/N 10389 | 4,431.84 | 66,015.82 |
| 04 Oct 2024 | Invoice | 36987 | DN#10087 | 508.48 | 66,524.30 |
| 21 Oct 2024 | Invoice | 37450 | DN#10148 | 2,339.01 | 68,863.31 |
| 23 Oct 2024 | Invoice | 37536 | DN#10256 | 4,431.84 | 73,295.15 |
| 26 Oct 2024 | Invoice | 37667 | DN#11156 | 2,954.56 | 76,249.71 |
| 31 Oct 2024 | Payment | 34567 | TRANSF | STAT 107 | -589.90 | 75,659.81 |
| 31 Oct 2024 | Payment | 34567 | TRANSF | STAT 107 | -2.92 | 75,656.89 |
| 31 Oct 2024 | Payment | 34567 | TRANSF | STAT 107 | -591.54 | 75,065.35 |
| 31 Oct 2024 | Payment | 34567 | TRANSF | STAT 107 | -2,935.90 | 72,129.45 |
| 31 Oct 2024 | Payment | 34567 | TRANSF | STAT 107 | -2,339.01 | 69,790.44 |
| 31 Oct 2024 | Payment | 34567 | TRANSF | STAT 107 | -4,431.84 | 65,358.60 |
| 31 Oct 2024 | Payment | 34567 | TRANSF | STAT 107 | -2,954.56 | 62,404.04 |
| 31 Oct 2024 | Payment | 34567 | TRANSF | STAT 107 | -5,968.73 | 56,435.31 |
| 31 Oct 2024 | Payment | 34567 | TRANSF | STAT 107 | -2,362.61 | 54,072.70 |
| 31 Oct 2024 | Payment | 34567 | TRANSF | STAT 107 | -107.28 | 53,965.42 |
| 31 Oct 2024 | Payment | 34567 | TRANSF | STAT 107 | -2,984.37 | 50,981.05 |
| 31 Oct 2024 | Payment | 34567 | TRANSF | STAT 107 | -2,362.61 | 48,618.44 |

---

### November 2024

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | | **48,618.44** |
| 05 Nov 2024 | Invoice | 37973 | DN#10301-HILTON | 4,431.84 | 53,050.28 |
| 11 Nov 2024 | Invoice | 38186 | DN#10658 | 5,968.73 | 59,019.01 |
| 13 Nov 2024 | Invoice | 38242 | DN#10321 | 2,362.61 | 61,381.62 |
| 18 Nov 2024 | Invoice | 38357 | DN#10334 | 4,476.55 | 65,858.17 |
| 26 Nov 2024 | Invoice | 38579 | DN#11100 | 797.28 | 66,655.45 |
| 26 Nov 2024 | Invoice | 38580 | DN#10763 | 590.65 | 67,246.10 |
| 27 Nov 2024 | Crd Note | 11321 | DN#11100 | -690.00 | 66,556.10 |
| 29 Nov 2024 | Payment | 35266 | TRANSF | STAT 108 | -1,020.94 | 65,535.16 |
| 29 Nov 2024 | Payment | 35266 | TRANSF | STAT 108 | -2,324.24 | 63,210.92 |
| 29 Nov 2024 | Payment | 35266 | TRANSF | STAT 108 | -4,403.86 | 58,807.06 |
| 29 Nov 2024 | Payment | 35266 | TRANSF | STAT 108 | -2,935.90 | 55,871.16 |
| 29 Nov 2024 | Payment | 35266 | TRANSF | STAT 108 | -2,324.24 | 53,546.92 |
| 29 Nov 2024 | Payment | 35266 | TRANSF | STAT 108 | -4,431.84 | 49,115.08 |
| 30 Nov 2024 | Invoice | 38699 | D/N 10775 | 2,984.37 | 52,099.45 |

---

### December 2024

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | | **52,099.45** |
| 04 Dec 2024 | Crd Note | 11395 | CUISINE | -2,760.00 | 49,339.45 |
| 04 Dec 2024 | Invoice | 38825 | CUISINE | 5,122.61 | 54,462.06 |
| 14 Dec 2024 | Crd Note | 11483 | D/N 11955 VILLAGE | -2,415.00 | 52,047.06 |
| 14 Dec 2024 | Invoice | 39045 | D/N 11955 VILLAGE | 5,526.49 | 57,573.55 |
| 21 Dec 2024 | Payment | 36197 | TRANSF | STAT 109 | -2,328.00 | 55,245.55 |
| 21 Dec 2024 | Payment | 36197 | TRANSF | STAT 109 | -190.73 | 55,054.82 |
| 21 Dec 2024 | Payment | 36197 | TRANSF | STAT 109 | -4,431.84 | 50,622.98 |
| 21 Dec 2024 | Payment | 36197 | TRANSF | STAT 109 | -4,476.55 | 46,146.43 |

---

### January 2025

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | | **46,146.43** |
| 02 Jan 2025 | Invoice | 39534 | 11898DN | 2,495.18 | 48,641.61 |
| 06 Jan 2025 | Invoice | 39621 | DN#11794 | 3,125.88 | 51,767.49 |
| 20 Jan 2025 | Invoice | 40026 | DN#11815 | 1,856.00 | 53,623.49 |
| 21 Jan 2025 | Invoice | 40051 | DN#12030-VILLAGE | 3,125.88 | 56,749.37 |

---

### February 2025

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | | **53,126.87** |
| 03 Feb 2025 | Invoice | 40386 | HILTON COL- DN11847 | 4,688.83 | 57,815.70 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -2,021.47 | 59,416.73 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -2,437.91 | 56,978.82 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -2,437.72 | 54,541.10 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -3,079.24 | 51,461.86 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -2,465.83 | 48,996.03 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -619.55 | 48,376.48 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -612.14 | 47,764.34 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -120.58 | 47,643.76 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -852.40 | 46,791.36 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -2,359.62 | 44,431.74 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -967.76 | 43,463.98 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -586.19 | 42,877.79 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -586.19 | 42,291.60 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -2,344.76 | 39,946.84 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -586.19 | 39,360.65 |
| 05 Feb 2025 | Payment | 36640 | TRANSF | STAT 111 | -508.48 | 38,852.17 |
| 07 Feb 2025 | Invoice | 40526 | VILLAGE- DN#12770 | 3,149.87 | 39,587.04 |
| 11 Feb 2025 | Crd Note | 11872 | DN#11681-EMPTY | -2,070.00 | 39,932.04 |
| 11 Feb 2025 | Invoice | 40626 | DN#11683-HILTON COL | 4,724.81 | 41,034.35 |
| 11 Feb 2025 | Invoice | 40631 | DN#11681 | 2,493.66 | 47,150.51 |
| 11 Feb 2025 | Invoice | 40632 | DN#11681-EMPTY | 2,760.00 | 49,910.51 |
| 19 Feb 2025 | Invoice | 40836 | DN#10482 | 169.99 | 50,080.50 |
| 27 Feb 2025 | Crd Note | 11975 | DN#11713- EMPTY- SCO | -1,207.50 | 48,873.00 |
| 27 Feb 2025 | Invoice | 41036 | DN#11713- SCOTSVILLE | 1,246.83 | 50,119.83 |
| 27 Feb 2025 | Invoice | 41038 | DN#11713- EMPTY- SCO | 1,380.00 | 51,499.83 |
| 28 Feb 2025 | Payment | 37406 | TRANSF | STAT 111 | -2,012.83 | 49,487.00 |
| 28 Feb 2025 | Payment | 37406 | TRANSF | STAT 111 | -2,495.18 | 46,991.82 |
| 28 Feb 2025 | Payment | 37406 | TRANSF | STAT 111 | -3,125.88 | 43,865.94 |

---

### March 2025

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | | **43,865.94** |
| 03 Mar 2025 | Invoice | 41156 | DN#12897-PINETOWN | 3,149.87 | 47,015.81 |
| 04 Mar 2025 | Crd Note | 11997 | DN#12897-PINETOWN | -3,149.87 | 43,865.94 |
| 07 Mar 2025 | Invoice | 41307 | DN#11736- HILTON COL | 9,449.62 | 53,315.56 |
| 10 Mar 2025 | Invoice | 41378 | D/N 12897 | 3,149.87 | 63,710.43 |
| 11 Mar 2025 | Invoice | 41384 | CLOUGH STREET 12915 | 3,117.08 | 61,997.51 |
| 27 Mar 2025 | Invoice | 41768 | VILLAGE-DN#4447 | 3,149.87 | 62,732.38 |
| 27 Mar 2025 | Invoice | 41769 | DN4447- EMP- VILLAG | 2,415.00 | 65,147.38 |
| 28 Mar 2025 | Crd Note | 12139 | DN4447- EMP- VILLAG | -2,415.00 | 62,732.38 |

---

### April 2025

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | | **62,732.38** |
| 01 Apr 2025 | Invoice | 41876 | DN#4458- VILLAGE | 3,149.87 | 65,882.25 |
| 04 Apr 2025 | Invoice | 42015 | DDN#12999 | 2,493.66 | 68,375.91 |
| 09 Apr 2025 | Crd Note | 12245 | DN#12849-EMPTY | -1,380.00 | 66,995.91 |
| 09 Apr 2025 | Invoice | 42145 | DN#12849 | 2,442.00 | 69,437.91 |
| 09 Apr 2025 | Invoice | 42146 | DN#12849-EMPTY | 2,760.00 | 72,197.91 |
| 13 Apr 2025 | Invoice | 42235 | DN#13059 | 6,169.24 | 78,367.15 |
| 26 Apr 2025 | Invoice | 42576 | DN#13168 | 4,626.93 | 79,371.58 |
| 29 Apr 2025 | Crd Note | 12374 | DN#13175-EMPTY | -4,830.00 | 78,164.08 |
| 29 Apr 2025 | Invoice | 42609 | DN#13108- HILTON | 4,626.93 | 82,791.01 |
| 29 Apr 2025 | Invoice | 42641 | DN#13175 | 3,663.00 | 86,454.01 |
| 29 Apr 2025 | Invoice | 42642 | DN#13175-EMPTY | 4,140.00 | 90,594.01 |
| 30 Apr 2025 | Invoice | 42696 | DN#13115- VILL | 3,084.62 | 93,678.63 |

---

### May 2025

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | | **93,678.63** |
| 07 May 2025 | Payment | 38536 | TRANSF | STAT 114 | -182.62 | 93,496.01 |
| 07 May 2025 | Payment | 38536 | TRANSF | STAT 114 | -3,430.21 | 90,065.80 |
| 07 May 2025 | Payment | 38536 | TRANSF | STAT 114 | -2,311.04 | 87,754.76 |
| 07 May 2025 | Payment | 38536 | TRANSF | STAT 114 | -1,856.00 | 85,898.76 |
| 07 May 2025 | Payment | 38536 | TRANSF | STAT 114 | -3,125.88 | 82,772.88 |
| 07 May 2025 | Payment | 38536 | TRANSF | STAT 114 | -4,688.83 | 78,084.05 |
| 07 May 2025 | Payment | 38536 | TRANSF | STAT 114 | -169.99 | 77,914.06 |
| 07 May 2025 | Payment | 38536 | TRANSF | STAT 114 | -3,149.87 | 74,764.19 |
| 07 May 2025 | Payment | 38536 | TRANSF | STAT 114 | -4,502.28 | 70,261.91 |
| 07 May 2025 | Payment | 38536 | TRANSF | STAT 114 | -3,001.52 | 67,260.39 |
| 07 May 2025 | Payment | 38536 | TRANSF | STAT 114 | -594.06 | 66,666.33 |
| 07 May 2025 | Payment | 38536 | TRANSF | STAT 114 | -8,832.35 | 57,833.98 |
| 08 May 2025 | Invoice | 42919 | VILLAGE -DN#13201 | 3,084.62 | 60,918.60 |
| 08 May 2025 | Invoice | 42920 | DN#12301-EMPTY | 2,415.00 | 63,333.60 |
| 09 May 2025 | Crd Note | 12445 | DN#12301-EMPTY | -1,207.50 | 62,126.10 |
| 13 May 2025 | Invoice | 43010 | HILTON- DN#12078 | 4,626.93 | 63,130.53 |
| 16 May 2025 | Crd Note | 12507 | DN#13241- VILL -EMPT | -2,415.00 | 64,338.03 |
| 16 May 2025 | Invoice | 43150 | DN#13241- VILLAGE | 1,542.31 | 65,880.34 |
| 16 May 2025 | Invoice | 43151 | DN#13241- VILL -EMPT | 1,207.50 | 67,087.84 |
| 29 May 2025 | Invoice | 43432 | DN#12477 | 3,090.51 | 65,348.35 |

---

### June 2025

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | | **66,555.85** |
| 03 Jun 2025 | Invoice | 43543 | DN#12286 | 4,684.55 | 71,240.40 |
| 03 Jun 2025 | Invoice | 43581 | DN#12294-VILLAGE | 3,123.03 | 77,985.93 |
| 10 Jun 2025 | Invoice | 43759 | DN#12310 | 603.47 | 76,174.40 |
| 10 Jun 2025 | Invoice | 43771 | DN#12313 | 3,049.11 | 79,223.51 |
| 17 Jun 2025 | Invoice | 43996 | DN#12398-HILTON COLL | 4,573.67 | 82,589.68 |
| 24 Jun 2025 | Invoice | 44178 | DN#12591-VILLAGE | 3,049.11 | 89,261.29 |
| 30 Jun 2025 | Invoice | 44375 | DN#12606- SCOTSVILLE | 603.47 | 89,864.76 |

---

### July 2025

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | | **86,242.26** |
| 02 Jul 2025 | Invoice | 44449 | DN#12155- HILTON | 4,573.67 | 90,815.93 |
| 07 Jul 2025 | Invoice | 44586 | DN#12625 | 3,001.52 | 97,439.95 |
| 08 Jul 2025 | Crd Note | 12930 | DN#12477 | -7,417.50 | 90,022.45 |
| 15 Jul 2025 | Invoice | 44846 | DN#12701- VILLAGE | 3,001.52 | 93,023.97 |
| 29 Jul 2025 | Crd Note | 13077 | DN20023- | -3,622.50 | 89,401.47 |
| 29 Jul 2025 | Invoice | 45220 | DN20028 | 4,502.28 | 93,903.75 |
| 29 Jul 2025 | Invoice | 45221 | DN20023- | 3,622.50 | 97,526.25 |
| 30 Jul 2025 | Invoice | 45257 | DN#20037 | 3,001.52 | 100,527.77 |

---

### August 2025

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | | **99,837.77** |
| 05 Aug 2025 | Invoice | 45405 | DN#20064- SCOTSVILLE | 594.06 | 100,431.83 |
| 19 Aug 2025 | Invoice | 45747 | DN#20425- HILTON | 8,832.35 | 102,709.18 |

---

### September 2025

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | | **109,954.18** |
| 08 Sept 2025 | Invoice | 46213 | COLLECTION EMPTY | 690.00 | 110,644.18 |
| 08 Sept 2025 | Invoice | 46214 | COLLECTION EMPTY | 560.79 | 111,204.97 |
| 09 Sept 2025 | Crd Note | 13420 | DN#20474-EMPTY MIDLA | -1,380.00 | 109,824.97 |
| 09 Sept 2025 | Invoice | 46239 | DN#20474- MIDLAND | 560.79 | 106,763.26 |
| 09 Sept 2025 | Invoice | 46240 | DN#20474-EMPTY MIDLA | 690.00 | 107,453.26 |
| 09 Sept 2025 | Invoice | 46241 | DN#20476-HILTON COLL | 4,250.16 | 111,703.42 |
| 20 Sept 2025 | Invoice | 46538 | DN#20263- HILTON | 4,250.16 | 115,953.58 |
| 25 Sept 2025 | Invoice | 46658 | DN#21065- VILLAGE | 2,833.44 | 122,409.52 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -828.03 | 121,581.49 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -3,149.87 | 118,431.62 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -4,724.81 | 113,706.81 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -2,493.66 | 111,213.15 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -1,246.83 | 109,966.32 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -9,449.62 | 100,516.70 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -3,149.87 | 97,366.83 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -3,117.08 | 94,249.75 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -3,149.87 | 91,099.88 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -2,493.66 | 88,606.22 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -2,442.00 | 86,164.22 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -6,169.24 | 79,994.98 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -4,626.93 | 75,368.05 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -4,626.93 | 70,741.12 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -3,663.00 | 67,078.12 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -3,084.62 | 63,993.50 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -3,084.62 | 60,908.88 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -4,626.93 | 56,281.95 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -1,542.31 | 54,739.64 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -4,684.55 | 50,055.09 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -3,123.03 | 46,932.06 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -603.47 | 46,328.59 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -3,049.11 | 43,279.48 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -4,573.67 | 38,705.81 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -3,049.11 | 35,656.70 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -603.47 | 35,053.23 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -4,573.67 | 30,479.56 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -3,001.52 | 27,478.04 |
| 29 Sept 2025 | Payment | 41466 | TRANSF | STAT 118 | -3,001.52 | 24,476.52 |

---

### October 2025

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | | **20,854.02** |
| 06 Oct 2025 | Invoice | 46896 | DN-20099-HILTON | 4,250.16 | 25,104.18 |
| 10 Oct 2025 | Invoice | 47010 | DN#20177-VILLAGE | 2,833.44 | 29,145.12 |
| 17 Oct 2025 | Crd Note | 13703 | DN#20733- HILTON | -4,250.16 | 27,309.96 |
| 17 Oct 2025 | Invoice | 47146 | DN#20733- HILTON | 4,250.16 | 27,937.62 |
| 20 Oct 2025 | Invoice | 47177 | DN#21110- HILTON COL | 4,250.16 | 35,810.28 |
| 22 Oct 2025 | Invoice | 47229 | DN#20746- MHA | 560.79 | 35,681.07 |
| 24 Oct 2025 | Invoice | 47262 | DN#21123-VILLAGE | 2,833.44 | 36,789.51 |
| 30 Oct 2025 | Invoice | 47399 | DN#20766- HILTON | 4,250.16 | 39,832.17 |
| 31 Oct 2025 | Payment | 42043 | TRANSF | STAT 119 | -193.68 | 43,260.99 |
| 31 Oct 2025 | Payment | 42043 | TRANSF | STAT 119 | -1,232.91 | 42,028.08 |
| 31 Oct 2025 | Payment | 42043 | TRANSF | STAT 119 | -560.79 | 41,467.29 |
| 31 Oct 2025 | Payment | 42043 | TRANSF | STAT 119 | -36.72 | 41,430.57 |
| 31 Oct 2025 | Payment | 42043 | TRANSF | STAT 119 | -4,213.44 | 37,217.13 |
| 31 Oct 2025 | Payment | 42043 | TRANSF | STAT 119 | -882.78 | 36,334.35 |

---

### November 2025

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | | **36,334.35** |
| 07 Nov 2025 | Invoice | 47552 | DN#20803- VILLAGE | 2,785.44 | 39,119.79 |
| 13 Nov 2025 | Crd Note | 13850 | DN#21065- VILLAGE | -2,833.44 | 36,286.35 |
| 13 Nov 2025 | Crd Note | 13851 | DN#20177-VILLAGE | -2,833.44 | 33,452.91 |
| 13 Nov 2025 | Crd Note | 13852 | DN#21123-VILLAGE | -2,833.44 | 30,619.47 |
| 13 Nov 2025 | Crd Note | 13853 | DN#20803- VILLAGE | -2,785.44 | 27,834.03 |
| 14 Nov 2025 | Invoice | 47664 | DN#20830- HILTON | 4,178.16 | 28,389.69 |
| 29 Nov 2025 | Crd Note | 13976 | DN-20877 MPTY | -3,622.50 | 28,389.69 |
| 29 Nov 2025 | Invoice | 48003 | DN-20877 | 4,178.16 | 32,567.85 |
| 29 Nov 2025 | Invoice | 48004 | DN-20877 MPTY | 3,622.50 | 36,190.35 |

---

### December 2025

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | | **36,190.35** |
| 01 Dec 2025 | Payment | 42518 | TRANSF | STAT 121 | -4,250.16 | 31,940.19 |
| 01 Dec 2025 | Payment | 42518 | TRANSF | STAT 121 | -4,250.16 | 27,690.03 |
| 01 Dec 2025 | Payment | 42518 | TRANSF | STAT 121 | -4,250.16 | 23,439.87 |
| 18 Dec 2025 | Payment | 42697 | TRANSF | STAT 121 | -4,178.16 | 19,261.71 |
| 18 Dec 2025 | Payment | 42697 | TRANSF | STAT 121 | -4,178.16 | 15,083.55 |

---

### January 2026

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | | **11,461.05** |
| 21 Jan 2026 | Invoice | 48877 | DN#21201 | 4,221.73 | 15,682.78 |
| 22 Jan 2026 | Invoice | 48898 | DN-21208 | 1,114.07 | 19,039.35 |
| 29 Jan 2026 | Invoice | 49010 | DN#21224 | 4,221.73 | 24,641.08 |

---

### February 2026

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | | **24,641.08** |
| 05 Feb 2026 | Payment | 43235 | TRANSF | STAT 123 | -3,656.43 | 20,984.65 |
| 21 Feb 2026 | Invoice | 49358 | DN-21921-HILTON COL | 4,261.58 | 25,246.23 |
| 26 Feb 2026 | Payment | 43472 | TRANSF | STAT 123 | -3,367.38 | 21,878.85 |
| 26 Feb 2026 | Payment | 43472 | TRANSF | STAT 123 | -560.79 | 21,318.06 |
| 26 Feb 2026 | Payment | 43472 | TRANSF | STAT 123 | -565.30 | 20,752.76 |
| 26 Feb 2026 | Payment | 43472 | TRANSF | STAT 123 | -1,114.07 | 19,638.69 |
| 26 Feb 2026 | Payment | 43472 | TRANSF | STAT 123 | -2,835.92 | 16,802.77 |
| 26 Feb 2026 | Invoice | 49470 | DN=21804 | 4,261.58 | 21,064.35 |

---

### March 2026

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | | **20,374.35** |
| 10 Mar 2026 | Invoice | 49655 | MIDL HOPS-DN21954 | 566.09 | 20,940.44 |
| 13 Mar 2026 | Invoice | 49730 | DN#22124-HILTON | 4,290.39 | 25,920.83 |
| 26 Mar 2026 | Invoice | 49935 | DN-21986-HILTON COL | 4,290.39 | 26,588.72 |
| 31 Mar 2026 | Payment | 43872 | TRANSF | STAT 124 | -1,385.81 | 28,825.41 |
| 31 Mar 2026 | Payment | 43872 | TRANSF | STAT 124 | -4,261.58 | 24,563.83 |
| 31 Mar 2026 | Payment | 43872 | TRANSF | STAT 124 | -4,261.58 | 20,302.25 |

---

### April 2026

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | | **20,302.25** |
| 19 Apr 2026 | Invoice | 50301 | DN-21334-RIVERWOOD | 1,869.28 | 22,171.53 |
| 20 Apr 2026 | Crd Note | 14774 | DN-21334-RIVERWOOD | -1,869.28 | 22,372.25 |
| 30 Apr 2026 | Invoice | 50443 | DN-22355-HILTON COL | 4,722.39 | 21,402.14 |

---

### May 2026

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | | **25,024.64** |
| 04 May 2026 | Invoice | 50502 | DN#22216- MIDLANDS | 623.09 | 25,647.73 |
| 26 May 2026 | Invoice | 50875 | DN#22433 | 4,551.00 | 30,198.73 |

---

### June 2026

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | | **26,576.23** |
| 12 Jun 2026 | Invoice | 51173 | DN#22476 | 5,336.36 | 31,912.59 |
| 22 Jun 2026 | Invoice | 51356 | DN#22520 | 5,336.36 | 40,871.45 |

---

### July 2026

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | | **37,248.95** |
| 07 Jul 2026 | Invoice | 51653 | DN#22805 | 5,357.02 | 42,605.97 |
| 22 Jul 2026 | Invoice | 52003 | DN#22838 | 5,357.02 | 47,962.99 |

---

### August 2026

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | | **47,962.99** |
| 03 Aug 2026 | Invoice | 52276 | DN#22592 | 5,068.81 | 53,031.80 |
| 06 Aug 2026 | Invoice | 52364 | DN#24246- HILTON | 1,337.61 | 57,991.91 |
| 13 Aug 2026 | Crd Note | 15452 | DN#24905- EMP-NDH | -1,897.50 | 57,474.41 |
| 13 Aug 2026 | Invoice | 52523 | DN#24905 | 3,395.79 | 60,870.20 |
| 13 Aug 2026 | Invoice | 52524 | DN#24905- EMP-NDH | 1,897.50 | 62,767.70 |
| 14 Aug 2026 | Crd Note | 15465 | DN#24905 | -3,395.79 | 59,371.91 |
| 15 Aug 2026 | Invoice | 52588 | DN#24917 | 4,530.61 | 63,902.52 |
| 18 Aug 2026 | Crd Note | 15490 | 24917 | -984.88 | 62,917.64 |

---

### September 2026

| Date | Entry Type | Doc # | Ref / DN | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | | **61,537.64** |
| 03 Sept 2026 | Invoice | 52933 | DN#24949 | 4,617.82 | 66,155.46 |
| 17 Sept 2026 | Invoice | 53169 | DN#24862 | 4,617.82 | 70,773.28 |
