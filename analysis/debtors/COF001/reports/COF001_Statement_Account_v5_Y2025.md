# Statement of Account: COFFEEBERRY-CASCADES (COF001) - Version 5 (Sub-Ledger Position Statement)
**Period:** Jan 2025 → Dec 2025 &nbsp;|&nbsp; **Account:** COF001
**Combined Opening B/F:** R-8,035.92 (ERP verified — source: `analysis/debtors/COF001/raw/COF001_COMBINED.TXT` sum of all ERP documents dated before 1 Jan 2025 in the current extracts (includes four payments posted late; see Review Notes))
**LPG Opening B/F (1A):** R-1,258.62 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R851.00
**Quarantine adjustment:** opening 1A excludes quarantined payment 29492 (18 Apr 2024, R-7,628.30), dated before this period; the combined opening B/F above is the ERP figure.
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-10-18 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`)

---



## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Jan 2025. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`). Documents marked `(split of …)` are mixed gas and deposit documents; the amount shown is this lane's part of that total. `lane override` marks a line moved between 1A and 1B by operator decision (record: `config/lane_overrides.json`).*

### January 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **-1,258.62** |
| 06 Jan 2025 | Invoice | 39608 | 8,146.82 | 6,888.20 |
| 17 Jan 2025 | Invoice | 39944 | 8,715.19 | 15,603.39 |
| 20 Jan 2025 | Payment | 36190 | -8,146.82 | 7,456.57 |
| 22 Jan 2025 | Payment | 36950 | -8,715.19 | -1,258.62 |
| 29 Jan 2025 | Invoice | 40252 | 8,146.82 | 6,888.20 |
| 29 Jan 2025 | Invoice | 40274 | 632.50 | 7,520.70 |
| 31 Jan 2025 | Payment | 36509 | -8,715.19 | -1,194.49 |
| 31 Jan 2025 | Payment | 36512 | -7,224.65 | -8,419.14 |

---

### February 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **-8,419.14** |
| 05 Feb 2025 | Payment | 36658 | -8,146.82 | -16,565.96 |
| 05 Feb 2025 | Payment | 36659 | -632.50 | -17,198.46 |
| 07 Feb 2025 | Invoice | 40536 | 974.05 | -16,224.41 |
| 07 Feb 2025 | Invoice | 40553 | 7,638.42 | -8,585.99 |
| 12 Feb 2025 | Payment | 36799 | -7,638.42 | -16,224.41 |
| 12 Feb 2025 | Payment | 36800 | -974.05 | -17,198.46 |
| 24 Feb 2025 | Invoice | 40942 | 8,784.18 | -8,414.28 |

---

### March 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **-8,414.28** |
| 05 Mar 2025 | Invoice | 41238 | 7,638.42 | -775.86 |
| 18 Mar 2025 | Invoice | 41562 | 8,211.30 | 7,435.44 |
| 18 Mar 2025 | Invoice | 41576 | 250.00 | 7,685.44 |
| 18 Mar 2025 | Invoice | 41577 | 250.00 | 7,935.44 |
| 18 Mar 2025 | Invoice | 41578 | 250.00 | 8,185.44 |
| 18 Mar 2025 | Invoice | 41579 | 250.00 | 8,435.44 |
| 19 Mar 2025 | Payment | 37628 | -250.00 | 8,185.44 |
| 19 Mar 2025 | Payment | 37629 | -250.00 | 7,935.44 |
| 19 Mar 2025 | Payment | 37630 | -250.00 | 7,685.44 |
| 19 Mar 2025 | Payment | 37631 | -250.00 | 7,435.44 |
| 19 Mar 2025 | Payment | 37633 | -8,784.18 | -1,348.74 |
| 31 Mar 2025 | Invoice | 41869 | 1,505.01 | 156.27 |
| 31 Mar 2025 | Invoice | 41870 | 838.35 | 994.62 |
| 31 Mar 2025 | Crd Note | 12159 | -1,505.01 | -510.39 |

---

### April 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **-510.39** |
| 02 Apr 2025 | Invoice | 41930 | 9,070.63 | 8,560.24 |
| 07 Apr 2025 | Invoice | 42061 *(split of R2,702.56)* | 1,495.06 | 10,055.30 |
| 07 Apr 2025 | Crd Note | 12218 *(split of R-2,702.56)* | -1,495.06 | 8,560.24 |
| 10 Apr 2025 | Payment | 38217 | -9,070.63 | -510.39 |
| 14 Apr 2025 | Invoice | 42260 | 7,475.29 | 6,964.90 |
| 15 Apr 2025 | Payment | 38270 | -9,070.63 | -2,105.73 |
| 23 Apr 2025 | Payment | 38242 | -7,475.29 | -9,581.02 |
| 29 Apr 2025 | Invoice | 42614 | 560.65 | -9,020.37 |

---

### May 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **-9,020.37** |
| 03 May 2025 | Invoice | 42748 | 8,596.58 | -423.79 |
| 07 May 2025 | Invoice | 42875 | 7,475.29 | 7,051.50 |
| 23 May 2025 | Invoice | 43287 | 7,571.31 | 14,622.81 |

---

### June 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **14,622.81** |
| 02 Jun 2025 | Payment | 39144 | -6,446.60 | 8,176.21 |
| 06 Jun 2025 | Invoice | 43671 | 8,423.08 | 16,599.29 |
| 17 Jun 2025 | Invoice | 44011 | 7,386.51 | 23,985.80 |
| 18 Jun 2025 | Payment | 39402 | -7,386.51 | 16,599.29 |
| 20 Jun 2025 | Payment | 39533 | -8,423.08 | 8,176.21 |
| 26 Jun 2025 | Invoice | 44264 | 830.97 | 9,007.18 |
| 30 Jun 2025 | Invoice | 44348 | 7,386.51 | 16,393.69 |

---

### July 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **16,393.69** |
| 02 Jul 2025 | Payment | 39817 | -830.97 | 15,562.72 |
| 10 Jul 2025 | Invoice | 44729 | 8,630.23 | 24,192.95 |
| 17 Jul 2025 | Payment | 40148 | -8,630.23 | 15,562.72 |
| 22 Jul 2025 | Bank UD | 40294 | 6,446.60 | 22,009.32 |
| 22 Jul 2025 | Payment | 40294 | -6,446.60 | 15,562.72 |
| 22 Jul 2025 | Payment | 41416 | -7,386.51 | 8,176.21 |
| 26 Jul 2025 | Invoice | 45143 | 7,267.54 | 15,443.75 |
| 31 Jul 2025 | Payment | 40427 | -7,267.54 | 8,176.21 |

---

### August 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **8,176.21** |
| 09 Aug 2025 | Invoice | 45528 *(S.1 R6,037.50 moved to 1A, lane override OPERATOR CONFIRMED)* | 7,400.19 | 15,576.40 |
| 18 Aug 2025 | Payment | 40757 | -7,400.19 | 8,176.21 |
| 25 Aug 2025 | Invoice | 45883 | 7,124.02 | 15,300.23 |
| 26 Aug 2025 | Payment | 40923 | -7,124.02 | 8,176.21 |

---

### September 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **8,176.21** |
| 02 Sept 2025 | Invoice | 46071 | 8,459.80 | 16,636.01 |
| 05 Sept 2025 | Payment | 41162 | -8,459.80 | 8,176.21 |
| 15 Sept 2025 | Invoice | 46375 | 6,847.27 | 15,023.48 |
| 15 Sept 2025 | Invoice | 46379 | 6,847.27 | 21,870.75 |
| 15 Sept 2025 | Crd Note | 13464 | -6,847.27 | 15,023.48 |
| 19 Sept 2025 | Payment | 41285 | -8,596.58 | 6,426.90 |
| 23 Sept 2025 | Invoice | 46829 | 838.35 | 7,265.25 |
| 25 Sept 2025 | Payment | 41478 | -838.35 | 6,426.90 |

---

### October 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **6,426.90** |
| 01 Oct 2025 | Invoice | 46819 | 7,617.59 | 14,044.49 |
| 02 Oct 2025 | Payment | 41578 | -6,847.27 | 7,197.22 |
| 13 Oct 2025 | Invoice | 47064 | 6,847.27 | 14,044.49 |
| 20 Oct 2025 | Payment | 41949 | -7,617.59 | 6,426.90 |
| 20 Oct 2025 | Payment | 41950 | -6,847.27 | -420.37 |
| 21 Oct 2025 | Payment | 41952 | -838.35 | -1,258.72 |
| 27 Oct 2025 | Invoice | 47335 | 7,360.82 | 6,102.10 |

---

### November 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **6,102.10** |
| 04 Nov 2025 | Invoice | 47504 | 838.35 | 6,940.45 |
| 07 Nov 2025 | Payment | 42145 | -7,360.82 | -420.37 |
| 14 Nov 2025 | Payment | 42236 | -838.35 | -1,258.72 |
| 17 Nov 2025 | Invoice | 47706 | 7,484.10 | 6,225.38 |
| 20 Nov 2025 | Payment | 42322 | -7,484.10 | -1,258.72 |

---

### December 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **-1,258.72** |
| 03 Dec 2025 | Invoice | 48067 | 7,484.10 | 6,225.38 |
| 09 Dec 2025 | Bank UD | 42621 | 7,360.82 | 13,586.20 |
| 09 Dec 2025 | Payment | 42621 | -7,360.82 | 6,225.38 |
| 09 Dec 2025 | Payment | 42635 | -7,484.10 | -1,258.72 |
| 11 Dec 2025 | Invoice | 48216 | 6,757.63 | 5,498.91 |
| 17 Dec 2025 | Payment | 42636 | -517.50 | 4,981.41 |
| 17 Dec 2025 | Payment | 42637 | -6,757.63 | -1,776.22 |
| 17 Dec 2025 | Carry held aside | CARRY-1A-2025-12 | 1,776.24 | 0.02 |
| 22 Dec 2025 | Invoice | 48422 | 7,264.46 | 7,264.48 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries. Documents marked `(split of …)` are mixed gas and deposit documents; the amount shown is this lane's part of that total. `lane override` marks a line moved between 1A and 1B by operator decision (record: `config/lane_overrides.json`).*

### January 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **851.00** |
| 06 Jan 2025 | Invoice | 39609 | 7,072.50 | 7,923.50 |
| 06 Jan 2025 | Crd Note | 11625 | -7,072.50 | 851.00 |
| 17 Jan 2025 | Invoice | 39968 | 8,107.50 | 8,958.50 |
| 17 Jan 2025 | Crd Note | 11718 | -8,107.50 | 851.00 |
| 29 Jan 2025 | Invoice | 40253 | 7,072.50 | 7,923.50 |
| 29 Jan 2025 | Crd Note | 11780 | -7,072.50 | 851.00 |

---

### February 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **851.00** |
| 07 Feb 2025 | Invoice | 40554 | 6,037.50 | 6,888.50 |
| 08 Feb 2025 | Crd Note | 11840 | -6,037.50 | 851.00 |
| 24 Feb 2025 | Invoice | 40943 | 8,107.50 | 8,958.50 |
| 24 Feb 2025 | Crd Note | 11950 | -8,107.50 | 851.00 |

---

### March 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **851.00** |
| 05 Mar 2025 | Invoice | 41239 | 6,037.50 | 6,888.50 |
| 05 Mar 2025 | Crd Note | 12009 | -6,037.50 | 851.00 |
| 18 Mar 2025 | Invoice | 41563 | 7,072.50 | 7,923.50 |
| 18 Mar 2025 | Crd Note | 12089 | -7,072.50 | 851.00 |

---

### April 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **851.00** |
| 02 Apr 2025 | Invoice | 41931 | 8,625.00 | 9,476.00 |
| 02 Apr 2025 | Crd Note | 12176 | -8,625.00 | 851.00 |
| 07 Apr 2025 | Invoice | 42061 *(split of R2,702.56)* | 1,207.50 | 2,058.50 |
| 07 Apr 2025 | Crd Note | 12218 *(split of R-2,702.56)* | -1,207.50 | 851.00 |
| 14 Apr 2025 | Invoice | 42261 | 6,037.50 | 6,888.50 |
| 14 Apr 2025 | Crd Note | 12273 | -6,037.50 | 851.00 |
| 29 Apr 2025 | Invoice | 42615 | 1,035.00 | 1,886.00 |
| 29 Apr 2025 | Crd Note | 12370 | -1,035.00 | 851.00 |

---

### May 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **851.00** |
| 03 May 2025 | Invoice | 42749 | 8,107.50 | 8,958.50 |
| 03 May 2025 | Crd Note | 12396 | -8,107.50 | 851.00 |
| 07 May 2025 | Invoice | 42876 | 6,037.50 | 6,888.50 |
| 07 May 2025 | Crd Note | 12429 | -6,037.50 | 851.00 |
| 23 May 2025 | Invoice | 43288 | 6,037.50 | 6,888.50 |
| 23 May 2025 | Crd Note | 12547 | -6,037.50 | 851.00 |

---

### June 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **851.00** |
| 06 Jun 2025 | Invoice | 43672 | 7,590.00 | 8,441.00 |
| 06 Jun 2025 | Crd Note | 12644 | -7,590.00 | 851.00 |
| 17 Jun 2025 | Invoice | 44012 | 6,037.50 | 6,888.50 |
| 18 Jun 2025 | Crd Note | 12753 | -6,037.50 | 851.00 |
| 30 Jun 2025 | Invoice | 44349 | 6,037.50 | 6,888.50 |
| 30 Jun 2025 | Crd Note | 12857 | -6,037.50 | 851.00 |

---

### July 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **851.00** |
| 10 Jul 2025 | Invoice | 44730 | 8,625.00 | 9,476.00 |
| 11 Jul 2025 | Crd Note | 12956 | -8,107.50 | 1,368.50 |
| 26 Jul 2025 | Invoice | 45144 | 6,037.50 | 7,406.00 |
| 26 Jul 2025 | Crd Note | 13059 | -6,037.50 | 1,368.50 |

---

### August 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **1,368.50** |
| 09 Aug 2025 | Invoice | 45529 | 8,625.00 | 9,993.50 |
| 11 Aug 2025 | Crd Note | 13191 | -8,625.00 | 1,368.50 |
| 25 Aug 2025 | Invoice | 45884 | 6,037.50 | 7,406.00 |
| 26 Aug 2025 | Crd Note | 13307 | -6,037.50 | 1,368.50 |

---

### September 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **1,368.50** |
| 02 Sept 2025 | Invoice | 46072 | 8,625.00 | 9,993.50 |
| 03 Sept 2025 | Crd Note | 13363 | -8,625.00 | 1,368.50 |
| 15 Sept 2025 | Invoice | 46376 | 6,037.50 | 7,406.00 |
| 15 Sept 2025 | Invoice | 46380 | 6,037.50 | 13,443.50 |
| 15 Sept 2025 | Crd Note | 13465 | -6,037.50 | 7,406.00 |
| 15 Sept 2025 | Crd Note | 13469 | -6,037.50 | 1,368.50 |

---

### October 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **1,368.50** |
| 01 Oct 2025 | Invoice | 46820 | 7,590.00 | 8,958.50 |
| 03 Oct 2025 | Crd Note | 13599 | -7,590.00 | 1,368.50 |
| 13 Oct 2025 | Invoice | 47065 | 6,037.50 | 7,406.00 |
| 14 Oct 2025 | Crd Note | 13676 | -6,037.50 | 1,368.50 |
| 27 Oct 2025 | Invoice | 47336 | 7,072.50 | 8,441.00 |
| 27 Oct 2025 | Crd Note | 13753 | -7,072.50 | 1,368.50 |
| 29 Oct 2025 | Invoice | 47380 | 7,590.00 | 8,958.50 |
| 29 Oct 2025 | Crd Note | 13765 | -7,590.00 | 1,368.50 |

---

### December 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **1,368.50** |
| 03 Dec 2025 | Invoice | 48068 | 7,590.00 | 8,958.50 |
| 03 Dec 2025 | Crd Note | 13996 | -7,590.00 | 1,368.50 |
| 11 Dec 2025 | Invoice | 48217 | 6,037.50 | 7,406.00 |
| 11 Dec 2025 | Crd Note | 14053 | -6,037.50 | 1,368.50 |
| 22 Dec 2025 | Invoice | 48423 | 7,072.50 | 8,441.00 |
| 22 Dec 2025 | Crd Note | 14139 | -7,072.50 | 1,368.50 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 7,264.48 |
| Part 1B — CYL Deposits | 1,368.50 |
| **Combined (1A + 1B)** | **8,632.98** |
| ERP `CURRENT BALANCE` (TXT header) | -771.56 |
| Less: quarantined documents held aside | -9,404.54 |
| **ERP balance excluding quarantined documents** | **8,632.98** |
| **Variance (Combined − ERP excl. quarantine)** | **0.00** |

---

## Quarantined Documents (held aside)

| Date | Entry Type | Doc # | Amount (R) | Would post to | Decision |
| :--- | :--- | :--- | ---: | :--- | :--- |
| 18 Apr 2024 | Payment | 29492 | -7,628.30 | 1A | QUARANTINED (2026-10-18) |
| 17 Dec 2025 | Carry | CARRY-1A-2025-12 | -1,776.24 | 1A | QUARANTINED (2026-10-18) |

*Held aside from Part 1A and 1B and the running balances above, pending review (documents dated before this period are excluded from the opening balances). They remain in the ERP balance, so the bridge shows them as a reconciling line. Record: `config/quarantine.json`.*

---

## Ingest Gate

*No coverage report found. Run `npm run debtors:ingest-check -- --debtor COF001` before trusting Part 2 qty.*

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`.*

### January 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **0** | **-1** | **2** | **5** | **-5** |
| 06 Jan 2025 | Invoice | 39609 | 0 | 0 | +2 | 0 | +5 |
| 06 Jan 2025 | Crd Note | 11625 | 0 | 0 | -2 | 0 | -5 |
| 17 Jan 2025 | Invoice | 39968 | 0 | 0 | +4 | 0 | +5 |
| 17 Jan 2025 | Crd Note | 11718 | 0 | 0 | -4 | 0 | -5 |
| 29 Jan 2025 | Invoice | 40253 | 0 | 0 | +2 | 0 | +5 |
| 29 Jan 2025 | Crd Note | 11780 | 0 | 0 | -2 | 0 | -5 |
| **End Jan** | **Closing Balance** | — | **0** | **-1** | **2** | **5** | **-5** |

---

### February 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **0** | **-1** | **2** | **5** | **-5** |
| 07 Feb 2025 | Invoice | 40554 | 0 | 0 | 0 | 0 | +5 |
| 08 Feb 2025 | Crd Note | 11840 | 0 | 0 | 0 | 0 | -5 |
| 24 Feb 2025 | Invoice | 40943 | 0 | 0 | +4 | 0 | +5 |
| 24 Feb 2025 | Crd Note | 11950 | 0 | 0 | -4 | 0 | -5 |
| **End Feb** | **Closing Balance** | — | **0** | **-1** | **2** | **5** | **-5** |

---

### March 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **0** | **-1** | **2** | **5** | **-5** |
| 05 Mar 2025 | Invoice | 41239 | 0 | 0 | 0 | 0 | +5 |
| 05 Mar 2025 | Crd Note | 12009 | 0 | 0 | 0 | 0 | -5 |
| 18 Mar 2025 | Invoice | 41563 | 0 | 0 | +2 | 0 | +5 |
| 18 Mar 2025 | Crd Note | 12089 | 0 | 0 | -2 | 0 | -5 |
| **End Mar** | **Closing Balance** | — | **0** | **-1** | **2** | **5** | **-5** |

---

### April 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **0** | **-1** | **2** | **5** | **-5** |
| 02 Apr 2025 | Invoice | 41931 | 0 | 0 | +5 | 0 | +5 |
| 02 Apr 2025 | Crd Note | 12176 | 0 | 0 | -5 | 0 | -5 |
| 07 Apr 2025 | Invoice | 42061 | 0 | 0 | 0 | 0 | +1 |
| 07 Apr 2025 | Crd Note | 12218 | 0 | 0 | 0 | 0 | -1 |
| 14 Apr 2025 | Invoice | 42261 | 0 | 0 | 0 | 0 | +5 |
| 14 Apr 2025 | Crd Note | 12273 | 0 | 0 | 0 | 0 | -5 |
| 29 Apr 2025 | Invoice | 42615 | 0 | 0 | +2 | 0 | 0 |
| 29 Apr 2025 | Crd Note | 12370 | 0 | 0 | -2 | 0 | 0 |
| **End Apr** | **Closing Balance** | — | **0** | **-1** | **2** | **5** | **-5** |

---

### May 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **0** | **-1** | **2** | **5** | **-5** |
| 03 May 2025 | Invoice | 42749 | 0 | 0 | +4 | 0 | +5 |
| 03 May 2025 | Crd Note | 12396 | 0 | 0 | -4 | 0 | -5 |
| 07 May 2025 | Invoice | 42876 | 0 | 0 | 0 | 0 | +5 |
| 07 May 2025 | Crd Note | 12429 | 0 | 0 | 0 | 0 | -5 |
| 23 May 2025 | Invoice | 43288 | 0 | 0 | 0 | 0 | +5 |
| 23 May 2025 | Crd Note | 12547 | 0 | 0 | 0 | 0 | -5 |
| **End May** | **Closing Balance** | — | **0** | **-1** | **2** | **5** | **-5** |

---

### June 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **0** | **-1** | **2** | **5** | **-5** |
| 06 Jun 2025 | Invoice | 43672 | 0 | 0 | +3 | 0 | +5 |
| 06 Jun 2025 | Crd Note | 12644 | 0 | 0 | -3 | 0 | -5 |
| 17 Jun 2025 | Invoice | 44012 | 0 | 0 | 0 | 0 | +5 |
| 18 Jun 2025 | Crd Note | 12753 | 0 | 0 | 0 | 0 | -5 |
| 30 Jun 2025 | Invoice | 44349 | 0 | 0 | 0 | 0 | +5 |
| 30 Jun 2025 | Crd Note | 12857 | 0 | 0 | 0 | 0 | -5 |
| **End Jun** | **Closing Balance** | — | **0** | **-1** | **2** | **5** | **-5** |

---

### July 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **0** | **-1** | **2** | **5** | **-5** |
| 10 Jul 2025 | Invoice | 44730 | 0 | 0 | +5 | 0 | +5 |
| 11 Jul 2025 | Crd Note | 12956 | 0 | 0 | -4 | 0 | -5 |
| 26 Jul 2025 | Invoice | 45144 | 0 | 0 | 0 | 0 | +5 |
| 26 Jul 2025 | Crd Note | 13059 | 0 | 0 | 0 | 0 | -5 |
| **End Jul** | **Closing Balance** | — | **0** | **-1** | **3** | **5** | **-5** |

---

### August 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **-1** | **3** | **5** | **-5** |
| 09 Aug 2025 | Invoice | 45529 | 0 | 0 | +5 | 0 | +5 |
| 11 Aug 2025 | Crd Note | 13191 | 0 | 0 | -5 | 0 | -5 |
| 25 Aug 2025 | Invoice | 45884 | 0 | 0 | 0 | 0 | +5 |
| 26 Aug 2025 | Crd Note | 13307 | 0 | 0 | 0 | 0 | -5 |
| **End Aug** | **Closing Balance** | — | **0** | **-1** | **3** | **5** | **-5** |

---

### September 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **0** | **-1** | **3** | **5** | **-5** |
| 02 Sept 2025 | Invoice | 46072 | 0 | 0 | +5 | 0 | +5 |
| 03 Sept 2025 | Crd Note | 13363 | 0 | 0 | -5 | 0 | -5 |
| 15 Sept 2025 | Invoice | 46376 | 0 | 0 | 0 | 0 | +5 |
| 15 Sept 2025 | Invoice | 46380 | 0 | 0 | 0 | +5 | 0 |
| 15 Sept 2025 | Crd Note | 13465 | 0 | 0 | 0 | 0 | -5 |
| 15 Sept 2025 | Crd Note | 13469 | 0 | 0 | 0 | 0 | -5 |
| **End Sep** | **Closing Balance** | — | **0** | **-1** | **3** | **10** | **-10** |

---

### October 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | **0** | **-1** | **3** | **10** | **-10** |
| 01 Oct 2025 | Invoice | 46820 | 0 | 0 | +3 | 0 | +5 |
| 03 Oct 2025 | Crd Note | 13599 | 0 | 0 | -3 | 0 | -5 |
| 13 Oct 2025 | Invoice | 47065 | 0 | 0 | 0 | 0 | +5 |
| 14 Oct 2025 | Crd Note | 13676 | 0 | 0 | 0 | 0 | -5 |
| 27 Oct 2025 | Invoice | 47336 | 0 | 0 | +2 | 0 | +5 |
| 27 Oct 2025 | Crd Note | 13753 | 0 | 0 | -2 | 0 | -5 |
| 29 Oct 2025 | Invoice | 47380 | 0 | 0 | +3 | 0 | +5 |
| 29 Oct 2025 | Crd Note | 13765 | 0 | 0 | -3 | 0 | -5 |
| **End Oct** | **Closing Balance** | — | **0** | **-1** | **3** | **10** | **-10** |

---

### November 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | **0** | **-1** | **3** | **10** | **-10** |
| **End Nov** | **Closing Balance** | — | **0** | **-1** | **3** | **10** | **-10** |

---

### December 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | **0** | **-1** | **3** | **10** | **-10** |
| 03 Dec 2025 | Invoice | 48068 | 0 | 0 | +3 | 0 | +5 |
| 03 Dec 2025 | Crd Note | 13996 | 0 | 0 | -3 | 0 | -5 |
| 11 Dec 2025 | Invoice | 48217 | 0 | 0 | 0 | 0 | +5 |
| 11 Dec 2025 | Crd Note | 14053 | 0 | 0 | 0 | 0 | -5 |
| 22 Dec 2025 | Invoice | 48423 | 0 | 0 | +2 | 0 | +5 |
| 22 Dec 2025 | Crd Note | 14139 | 0 | 0 | -2 | 0 | -5 |
| **End Dec** | **Closing Balance** | — | **0** | **-1** | **3** | **10** | **-10** |

---

<!-- INTERNAL_ONLY_START -->

## Review Notes (internal)

*Added by `COF001/scripts/run_v5_statement.mjs`; the tables above are shared-generator output.*

1. **Lane rule.** Invoices and credit notes are routed by cylinder SKU lines (9.1, 14.1, 19.1, S.1, D.1): cylinder-only documents go to 1B, documents with none go to 1A, and mixed documents are split by line. This differs from the database view's `debt_group` for rental-only lines: 41576 to 41579 (R250.00 each, Mar 2025) has no cylinder SKU, so it sits in 1A. Under the view's grouping it would be in 1B. Please confirm.
2. **Late-posted documents.** Four payments dated 2023-2024 (24732, 30219, 29646, 29696; R31,131.01 in total) and a journal/payment pair dated 14 Nov and 11 Dec 2024 (44844, 476) appear in the current ERP extract after 2025 entries. Statements are built by document date, so they are included in the opening balance. The ERP balance shown at the time (for example R23,095.09 after payment 35877 on 30 Dec 2024) did not include them.
3. **Quarantined payment 29492 (2024-04-18, R-7,628.30).** Quarantined by the operator on 2026-10-18; reason not stated. Initial observation (partly superseded by the update below): ASSERTED from TXT: payment 30219 (12 Mar 2024, -7,628.30) was posted for the same amount against invoice 30276 (9 Mar 2024, 7,628.30). With 29492 also posted, the account is R7,628.28 in credit from 18 Apr 2024 until later invoices absorb it. Not confirmed as a duplicate. Held aside: excluded from Part 1A and 1B and from running balances. Still included in the ERP balance, so the bridge shows it as a reconciling line. Not treated as a cylinder-deposit payment (business_rules.md sections 3 and 4): no allocation to the cylinder ledger and no cylinder write-off. **Update 2026-10-18 (ASSERTED - database evidence (bank and ERP reconciliation tables), not confirmed against the ERP).** Payment 29492 appears to belong to COF002 (COFFEEBERRY-HILTON, bank name 'Coffeeberry Avenues'), not COF001. It was posted to COF001 against COF001 invoice 30276, which payment 30219 had already settled. Evidence: Bank credit 2024-04-18, R7,628.30, described 'Magtape Credit Coffeeberry Avenues 00031096' (bank_transactions, status MATCHED). 31096 is a COF002 invoice dated 2024-04-08 for R7,628.30. That bank credit is approved-matched (EXACT_AMOUNT_DATE) to ERP entry refDoc 00029492 (STAT:102), whose ERP description is 'MAGTAPE CREDIT COFFEEBERRY AVE'. The earlier bank credit 2024-03-12, R7,628.30, described 'Magtape Credit Coffeeberry Cascades 00030276', is the COF001 receipt that payment 30219 recorded for invoice 30276. In the database, transaction_headers shows 29492 with reference 00030276 (COF001's invoice). No payment of R7,628.30 exists on COF002, and every other COF002 invoice from 15 Feb to 15 Jun 2024 has a same-amount payment within days; 31096 does not. The 'observation' above (29492 as a second payment of the same invoice by COF001) is not supported by the bank data: the two R7,628.30 receipts came from two different payers. Not checked: COF002's ERP statement (no TXT in the repo): whether invoice 31096 is still open there, or was settled another way. Whether the ERP has since reposted or reversed 29492. The quarantine on COF001 stands as a hold-aside until the ERP reposts 29492 to COF002. COF002 would then show invoice 31096 paid. This statement is quarantine-adjusted (the item is dated before this period, so the opening 1A balance excludes it); a statement whose config does not set `quarantineFile` is not adjusted. Reopen when: The ERP reverses, refunds or reallocates payment 29492. Bank statement evidence shows only one receipt of 7,628.30 for invoice 30276, or shows 29492 belongs to another invoice. The operator rules that 29492 is a cylinder-deposit payment (business_rules.md sections 3 and 4 then apply). Payment 30219 is itself reversed or reallocated.
4. **Quarantined carry CARRY-1A-2025-12 (2025-12-17, R-1,776.24).** Quarantined by the operator on 2026-10-18; reason: Operator ruling 2026-10-18: invoice 45528 was incorrect and so was the selling price; the standing gas credit is to be written off against that shortfall in the ERP. The 45528 shortfall is not yet quantified by the ERP. At the July / 7 Aug 2025 48kg gas price (R7,267.54 for 5) it is R1,230.04; at the 25 Aug price (R7,124.02) it is R1,086.52. Either way the credit (R1,776.24) exceeds it by R546.20 to R689.72; the operator decides how any remainder is treated. Task: Linear ADM-158 (child of ADM-151): correct invoice 45528 and write off the credit against the shortfall. ASSERTED (reports/COF001_1A_Carry_Trace.md, amount pairing, not the ERP allocation): the 1A credit carried from 17 Dec 2025 into 2026 is made of (1) the excess of payment 35877 (30 Dec 2024, R9,649.56) over the gas part of invoice 39311 (R8,390.92): -1,258.64, see ADM-150; (2) net -0.10 from the Jan-Jul 2025 pairings; (3) payment 42636 (17 Dec 2025, -517.50, ERP ref 44730), which paid the one 9kg deposit left uncredited by credit note 12956 and therefore sits in 1A while that deposit stays in 1B. The statements show -1,776.22 at that point; the 0.02 difference is ERP rounding on otherwise exact pairs and is left in 1A. Held aside: a carry, not a single document. From 17 Dec 2025 the generator takes R-1,776.24 out of Part 1A (an offsetting row inside the window, or out of the opening 1A balance for later windows). It stays in the ERP balance, so the bridge shows it as a reconciling line. Not a refund to the customer, not a cylinder-deposit payment and not yet a write-off: nothing is written off until the ERP posts it. Holding 42636 aside leaves the R517.50 deposit on 44730 showing in Part 1B although the customer paid it; the ERP write-off should settle both. This statement is quarantine-adjusted; a statement whose config does not set `quarantineFile` is not adjusted. Reopen when: The ERP posts the write-off or the 45528 correction documents (then remove this item and the 45528 lane override so nothing is counted twice). ADM-150 explains payment 35877 differently (for example an exact-sum match, or money belonging to another account). The operator rules on the R517.50 deposit on 44730 / payment 42636 separately. The ERP shortfall for 45528 differs materially from R1,086.52 to R1,230.04.
5. **Lane override: invoice 45528 S.1 ×5 (2025-08-09, R6,037.50) treated as gas (1A), OPERATOR CONFIRMED.** TREAT AS GAS (wrong stock code); operator, 2026-10-18. Basis: ASSERTED (database lines, ADM-149 report analysis/debtors/COF001/reports/COF001_ADM-149_45528_Deposit_Investigation.md on branch claude/adm-149-cof001-45528, rechecked by the parent session 2026-10-18): every other COF001 48kg delivery Jun-Sep 2025 bills S01 x5 (48kg gas) on the main invoice, while DN#20080 bills none; the -EMPTY pair 45529/13191 records 5 x 48kg empties swapped; COF002 invoice 45486 (7 Aug 2025) billed the same 9kg line R1,362.69 plus 5 x S.4 48kg gas. Not confirmed by the ERP. Effect: Moves R6,037.50 from Part 1B to Part 1A and removes S.1 +5 from Part 2 custody. Combined balance unchanged. Payment 40757 (R7,400.19) then pays a gas-only invoice in full. No credit note or rebill is assumed: the possible R1,086.52 to R1,230.04 undercharge on 48kg gas is not added to any statement. The line is inside this period and is routed in the tables above. Pending: Superseded 2026-10-18 by the operator ruling. Was: Linear ADM-152 (FINCON line audit of 45528, signed DN#20080, stock movements 9 Aug 2025). Reopen when: The FINCON line audit shows S.1 was keyed on purpose on 45528 (for example a sale of cylinders). Signed DN#20080 shows no 48kg fulls delivered. A site count shows five 48kg cylinders above the agreed float. The ERP issues any credit note or invoice against 45528 or DN#20080 (then remove this override so the correction is not counted twice). A dated full export (ADM-135) shows different lines for 45528.
6. **Database coverage.** All invoices and credit notes in the window were matched to the database by document and amount (see `reports/COF001_DB_COVERAGE_2026-10-16.md`).
7. **Generator run.** The shared generator was run unchanged (except as noted) against `data/db_snapshot_2025.json` (rows pulled from Supabase on 2026-10-16) because `DATABASE_URL` is not set in cloud sessions. Fixes made to the shared generator: the TXT header balance regex accepts a minus sign, so credit balances no longer read as NaN; an optional `periodEnd` limits the window and takes the closing check from the ERP running balance on the last row inside it.
8. **Not run.** `npm run debtors:ingest-check -- --debtor COF001` (needs `DATABASE_URL`).

<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R7,264.48 |
| Cylinder Financial Balance (Part 1B close) | R1,368.50 |
| **Total Debtor Balance** | **R8,632.98** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 19kg | -1 | R690.00 | R-690.00 |
| 9kg | 3 | R517.50 | R1,552.50 |
| D.1 | 10 | R1,150.00 | R11,500.00 |
| S.1 | -10 | R1,150.00 | R-11,500.00 |
| **Total** | **2** | — | **R862.50** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R1,368.50 | R862.50 | R506.00 |
| Sub-ledger tie (1A + 1B vs combined) | R8,632.98 | — | R0.00 |

**ERP Combined Balance (TXT header):** R-771.56  
**Quarantined documents (held aside):** R-9,404.54  
**ERP balance excluding quarantined documents:** R8,632.98  
**Reconstructed Balance (1A + 1B):** R8,632.98  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
