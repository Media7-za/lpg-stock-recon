# Statement of Account: DSB CHICKEN VS FISH (DBS001) - Version 5 (Sub-Ledger Position Statement)
**Period:** Mar 2025 → Feb 2026 &nbsp;|&nbsp; **Account:** DBS001
**Combined Opening B/F:** R0.00 (ERP verified — source: `analysis/debtors/DBS001/raw/DBS001_DERIVED_FROM_MASTER_DUMP.TXT` ASSUMED = 0.00 — no genuine ERP DEBENQ export exists for this debtor. Derived from master ledger dump (ERP RAW DATA/DETRANS.TXT), which itself only begins Mar 2025. True pre-Mar-2025 opening balance is UNKNOWN, not zero — treat this whole statement as ASSUMED basis pending a real ERP export (SKILL_Debtors_Orchestrator.md ERP freshness gate).)
**LPG Opening B/F (1A):** R0.00 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R0.00
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-08-25 from ERP TXT (`reconcile_debtor_v5_from_txt.mjs`)

> **DB unavailable this run** (DATABASE_URL not set in this environment). Part 2 custody and the Part 1A/1B LPG-vs-CYL doc-line split fall back to TXT-only heuristics — treat all figures below as ASSERTED/ASSUMED, not DB-verified.

---

## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Mar 2025. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### March 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **0.00** |
| 07 Mar 2025 | Invoice | 41292 | 547.68 | 547.68 |
| 10 Mar 2025 | Payment | 37375 | -547.68 | 0.00 |
| 12 Mar 2025 | Invoice | 41411 | 1,734.31 | 1,734.31 |
| 15 Mar 2025 | Payment | 38768 | -1,734.31 | 0.00 |
| 20 Mar 2025 | Invoice | 41652 | 273.84 | 273.84 |
| 25 Mar 2025 | Payment | 37625 | -273.84 | 0.00 |
| 26 Mar 2025 | Invoice | 41752 | 547.68 | 547.68 |
| 29 Mar 2025 | Invoice | 41841 | 1,460.48 | 2,008.16 |
| 31 Mar 2025 | Payment | 37767 | -547.68 | 1,460.48 |
| 31 Mar 2025 | Payment | 37767 | -1,460.48 | 0.00 |

---

### April 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **0.00** |
| 07 Apr 2025 | Invoice | 42059 | 535.44 | 535.44 |
| 09 Apr 2025 | Payment | 38076 | -535.44 | 0.00 |
| 10 Apr 2025 | Invoice | 42188 | 1,427.85 | 1,427.85 |
| 15 Apr 2025 | Invoice | 42281 | 267.72 | 1,695.57 |
| 17 Apr 2025 | Payment | 38153 | -1,427.85 | 267.72 |
| 17 Apr 2025 | Payment | 38153 | -267.72 | 0.00 |
| 25 Apr 2025 | Invoice | 42535 | 535.44 | 535.44 |
| 30 Apr 2025 | Invoice | 42673 | 1,427.85 | 1,963.29 |

---

### May 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **1,963.29** |
| 09 May 2025 | Payment | 38568 | -535.44 | 1,427.85 |
| 09 May 2025 | Payment | 38568 | -220.35 | 1,207.50 |
| 09 May 2025 | Payment | 38568 | -1,207.50 | 0.00 |
| 09 May 2025 | Invoice | 42937 | 535.44 | 535.44 |
| 16 May 2025 | Invoice | 43109 | 1,695.57 | 2,231.01 |
| 16 May 2025 | Invoice | 43144 | 267.72 | 2,498.73 |
| 16 May 2025 | Crd Note | 12499 | -1,695.57 | 803.16 |
| 19 May 2025 | Payment | 38829 | -535.44 | 267.72 |
| 20 May 2025 | Invoice | 43214 | 1,447.06 | 1,714.78 |
| 23 May 2025 | Invoice | 43292 | 542.64 | 2,257.42 |
| 26 May 2025 | Payment | 38922 | -267.72 | 1,989.70 |
| 26 May 2025 | Payment | 38922 | -1,447.06 | 542.64 |
| 26 May 2025 | Payment | 38922 | -542.64 | 0.00 |

---

### June 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **0.00** |
| 02 Jun 2025 | Invoice | 43529 | 1,718.38 | 1,718.38 |
| 07 Jun 2025 | Invoice | 43699 | 542.64 | 2,261.02 |
| 09 Jun 2025 | Payment | 39721 | -1,718.38 | 542.64 |
| 09 Jun 2025 | Payment | 39721 | -542.64 | 0.00 |
| 18 Jun 2025 | Invoice | 44038 | 1,938.89 | 1,938.89 |
| 20 Jun 2025 | Payment | 39737 | -1,938.89 | 0.00 |
| 24 Jun 2025 | Payment | 39544 | -264.40 | -264.40 |
| 24 Jun 2025 | Invoice | 44172 | 264.40 | 0.00 |

---

### July 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **0.00** |
| 04 Jul 2025 | Invoice | 44521 | 528.79 | 528.79 |
| 05 Jul 2025 | Invoice | 44543 | 1,410.10 | 1,938.89 |
| 07 Jul 2025 | Payment | 40114 | -528.79 | 1,410.10 |
| 07 Jul 2025 | Payment | 40114 | -1,410.10 | 0.00 |
| 14 Jul 2025 | Invoice | 44794 | 519.87 | 519.87 |
| 15 Jul 2025 | Payment | 40025 | -519.87 | 0.00 |
| 21 Jul 2025 | Payment | 40083 | -1,000.00 | -1,000.00 |
| 21 Jul 2025 | Invoice | 44995 | 1,000.04 | 0.04 |
| 25 Jul 2025 | Invoice | 45112 | 1,906.17 | 1,906.21 |
| 25 Jul 2025 | Invoice | 45113 | 2,242.50 | 4,148.71 |
| 25 Jul 2025 | Crd Note | 13049 | -2,242.50 | 1,906.21 |
| 28 Jul 2025 | Invoice | 45187 | 1,250.05 | 3,156.26 |

---

### August 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **3,156.26** |
| 05 Aug 2025 | Payment | 40453 | -1,906.17 | 1,250.09 |
| 05 Aug 2025 | Payment | 40453 | -1,250.05 | 0.04 |
| 11 Aug 2025 | Invoice | 45565 | 1,646.24 | 1,646.28 |
| 12 Aug 2025 | Payment | 40588 | -1,646.24 | 0.04 |
| 18 Aug 2025 | Payment | 40631 | -4.78 | -4.74 |
| 18 Aug 2025 | Payment | 40631 | -0.14 | -4.88 |
| 18 Aug 2025 | Payment | 40631 | -0.04 | -4.92 |
| 18 Aug 2025 | Payment | 40631 | -0.04 | -4.96 |
| 18 Aug 2025 | Payment | 40631 | -1,200.00 | -1,204.96 |
| 18 Aug 2025 | Payment | 40631 | 4.78 | -1,200.18 |
| 18 Aug 2025 | Payment | 40631 | -4.78 | -1,204.96 |
| 18 Aug 2025 | Payment | 40631 | -517.50 | -1,722.46 |
| 18 Aug 2025 | Payment | 40631 | 517.50 | -1,204.96 |
| 18 Aug 2025 | Payment | 40738 | -509.11 | -1,714.07 |
| 18 Aug 2025 | Invoice | 45708 | 509.11 | -1,204.96 |
| 18 Aug 2025 | Invoice | 45710 | 1,250.00 | 45.04 |
| 18 Aug 2025 | Invoice | 45725 | 509.11 | 554.15 |
| 18 Aug 2025 | Crd Note | 13244 | -509.11 | 45.04 |
| 18 Aug 2025 | Crd Note | 13246 | -50.00 | -4.96 |
| 29 Aug 2025 | Payment | 40875 | -500.00 | -504.96 |
| 29 Aug 2025 | Invoice | 45987 | 1,612.15 | 1,107.19 |
| 29 Aug 2025 | Invoice | 46030 | 500.00 | 1,607.19 |

---

### September 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **1,607.19** |
| 01 Sept 2025 | Payment | 41011 | -1,612.15 | -4.96 |
| 05 Sept 2025 | Invoice | 46145 | 488.34 | 483.38 |
| 08 Sept 2025 | Payment | 41117 | -488.34 | -4.96 |
| 17 Sept 2025 | Invoice | 46440 | 1,546.42 | 1,541.46 |
| 18 Sept 2025 | Payment | 41254 | -1,546.42 | -4.96 |
| 23 Sept 2025 | Payment | 41311 | -488.34 | -493.30 |
| 23 Sept 2025 | Invoice | 46613 | 488.34 | -4.96 |
| 30 Sept 2025 | Invoice | 46773 | 1,100.00 | 1,095.04 |

---

### October 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **1,095.04** |
| 01 Oct 2025 | Payment | 41419 | -1,100.00 | -4.96 |
| 01 Oct 2025 | Invoice | 46782 | 732.50 | 727.54 |
| 04 Oct 2025 | Invoice | 46880 | 1,302.25 | 2,029.79 |
| 06 Oct 2025 | Payment | 41569 | -732.50 | 1,297.29 |
| 06 Oct 2025 | Payment | 41569 | -1,302.25 | -4.96 |
| 13 Oct 2025 | Invoice | 47055 | 488.34 | 483.38 |
| 20 Oct 2025 | Payment | 41878 | -488.34 | -4.96 |
| 25 Oct 2025 | Invoice | 47311 | 1,790.58 | 1,785.62 |
| 27 Oct 2025 | Payment | 42036 | -1,790.58 | -4.96 |
| 31 Oct 2025 | Payment | 42044 | -2,363.34 | -2,368.30 |
| 31 Oct 2025 | Bank UD | 42044 | 2,363.34 | -4.96 |

---

### November 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **-4.96** |
| 08 Nov 2025 | Invoice | 47561 | 479.34 | 474.38 |
| 12 Nov 2025 | Payment | 42226 | -479.34 | -4.96 |
| 17 Nov 2025 | Invoice | 47717 | 1,278.25 | 1,273.29 |
| 18 Nov 2025 | Payment | 42301 | -1,278.25 | -4.96 |
| 20 Nov 2025 | Invoice | 47819 | 479.34 | 474.38 |
| 21 Nov 2025 | Payment | 42314 | -479.34 | -4.96 |
| 28 Nov 2025 | Invoice | 47972 | 239.67 | 234.71 |

---

### December 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **234.71** |
| 01 Dec 2025 | Payment | 42430 | -239.67 | -4.96 |
| 08 Dec 2025 | Invoice | 48161 | 481.62 | 476.66 |
| 10 Dec 2025 | Payment | 42598 | -1,284.32 | -807.66 |
| 10 Dec 2025 | Payment | 42600 | -481.62 | -1,289.28 |
| 10 Dec 2025 | Invoice | 48192 | 1,284.32 | -4.96 |
| 17 Dec 2025 | Invoice | 48312 | 240.81 | 235.85 |
| 17 Dec 2025 | Invoice | 48318 | 481.62 | 717.47 |
| 17 Dec 2025 | Crd Note | 14090 | -240.81 | 476.66 |
| 23 Dec 2025 | Invoice | 48445 | 481.62 | 958.28 |
| 27 Dec 2025 | Payment | 42832 | -481.62 | 476.66 |
| 27 Dec 2025 | Payment | 42832 | -0.20 | 476.46 |

---

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **476.46** |
| 02 Jan 2026 | Invoice | 48589 | 3,525.27 | 4,001.73 |
| 05 Jan 2026 | Payment | 42861 | -481.62 | 3,520.11 |
| 14 Jan 2026 | Invoice | 48786 | 484.79 | 4,004.90 |
| 15 Jan 2026 | Payment | 42994 | -3,525.27 | 479.63 |
| 15 Jan 2026 | Payment | 42994 | -484.79 | -5.16 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **-5.16** |
| 05 Feb 2026 | Invoice | 49106 | 484.79 | 479.63 |
| 19 Feb 2026 | Invoice | 49331 | 1,795.85 | 2,275.48 |
| 20 Feb 2026 | Payment | 43399 | -484.79 | 1,790.69 |
| 20 Feb 2026 | Payment | 43399 | -1,795.85 | -5.16 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

### March 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **0.00** |
| 07 Mar 2025 | Invoice | 41293 | 1,035.00 | 1,035.00 |
| 07 Mar 2025 | Crd Note | 12026 | -1,552.50 | -517.50 |
| 12 Mar 2025 | Invoice | 47175 | 517.50 | 0.00 |
| 20 Mar 2025 | Invoice | 41653 | 517.50 | 517.50 |
| 22 Mar 2025 | Crd Note | 12108 | -517.50 | 0.00 |
| 26 Mar 2025 | Invoice | 41753 | 1,035.00 | 1,035.00 |
| 27 Mar 2025 | Crd Note | 12132 | -1,035.00 | 0.00 |

---

### April 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **0.00** |
| 07 Apr 2025 | Invoice | 42060 | 1,035.00 | 1,035.00 |
| 07 Apr 2025 | Crd Note | 12219 | -1,035.00 | 0.00 |
| 15 Apr 2025 | Invoice | 42282 | 517.50 | 517.50 |
| 15 Apr 2025 | Crd Note | 12277 | -517.50 | 0.00 |
| 25 Apr 2025 | Invoice | 42536 | 1,035.00 | 1,035.00 |
| 25 Apr 2025 | Crd Note | 12346 | -1,035.00 | 0.00 |
| 30 Apr 2025 | Invoice | 42775 | 1,207.50 | 1,207.50 |
| 30 Apr 2025 | Crd Note | 12397 | -1,207.50 | 0.00 |

---

### May 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **0.00** |
| 23 May 2025 | Invoice | 43293 | 1,035.00 | 1,035.00 |
| 24 May 2025 | Crd Note | 12551 | -1,035.00 | 0.00 |

---

### June 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **0.00** |
| 02 Jun 2025 | Invoice | 43530 | 1,725.00 | 1,725.00 |
| 03 Jun 2025 | Crd Note | 12623 | -1,725.00 | 0.00 |
| 07 Jun 2025 | Invoice | 43700 | 1,035.00 | 1,035.00 |
| 09 Jun 2025 | Crd Note | 12662 | -1,035.00 | 0.00 |
| 18 Jun 2025 | Invoice | 44039 | 2,242.50 | 2,242.50 |
| 18 Jun 2025 | Crd Note | 12757 | -2,242.50 | 0.00 |
| 24 Jun 2025 | Invoice | 44173 | 517.50 | 517.50 |
| 24 Jun 2025 | Crd Note | 12798 | -517.50 | 0.00 |

---

### July 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **0.00** |
| 04 Jul 2025 | Invoice | 44522 | 1,035.00 | 1,035.00 |
| 05 Jul 2025 | Invoice | 44544 | 1,207.50 | 2,242.50 |
| 05 Jul 2025 | Crd Note | 12902 | -1,035.00 | 1,207.50 |
| 05 Jul 2025 | Crd Note | 12909 | -1,207.50 | 0.00 |
| 14 Jul 2025 | Invoice | 44796 | 1,035.00 | 1,035.00 |
| 14 Jul 2025 | Crd Note | 12977 | -1,035.00 | 0.00 |

---

### August 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **0.00** |
| 11 Aug 2025 | Invoice | 45566 | 1,725.00 | 1,725.00 |
| 11 Aug 2025 | Crd Note | 13182 | -1,725.00 | 0.00 |
| 18 Aug 2025 | Invoice | 45709 | 1,035.00 | 1,035.00 |
| 18 Aug 2025 | Crd Note | 13245 | -1,035.00 | 0.00 |
| 29 Aug 2025 | Invoice | 45988 | 1,725.00 | 1,725.00 |
| 29 Aug 2025 | Crd Note | 13336 | -1,725.00 | 0.00 |

---

### September 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **0.00** |
| 05 Sept 2025 | Invoice | 46146 | 1,035.00 | 1,035.00 |
| 05 Sept 2025 | Crd Note | 13384 | -1,035.00 | 0.00 |
| 17 Sept 2025 | Invoice | 46441 | 1,725.00 | 1,725.00 |
| 17 Sept 2025 | Crd Note | 13492 | -1,725.00 | 0.00 |
| 23 Sept 2025 | Invoice | 46614 | 1,035.00 | 1,035.00 |
| 25 Sept 2025 | Crd Note | 13537 | -1,035.00 | 0.00 |

---

### October 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **0.00** |
| 01 Oct 2025 | Invoice | 46783 | 1,552.50 | 1,552.50 |
| 01 Oct 2025 | Crd Note | 13588 | -1,035.00 | 517.50 |
| 04 Oct 2025 | Invoice | 46881 | 1,207.50 | 1,725.00 |
| 04 Oct 2025 | Crd Note | 13641 | -1,207.50 | 517.50 |
| 13 Oct 2025 | Invoice | 47056 | 1,035.00 | 1,552.50 |
| 14 Oct 2025 | Crd Note | 13672 | -1,552.50 | 0.00 |
| 25 Oct 2025 | Invoice | 47312 | 2,242.50 | 2,242.50 |
| 25 Oct 2025 | Crd Note | 13748 | -2,242.50 | 0.00 |

---

### November 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **0.00** |
| 08 Nov 2025 | Invoice | 47562 | 1,035.00 | 1,035.00 |
| 10 Nov 2025 | Crd Note | 13833 | -1,035.00 | 0.00 |
| 20 Nov 2025 | Invoice | 47820 | 1,035.00 | 1,035.00 |
| 20 Nov 2025 | Crd Note | 13913 | -1,035.00 | 0.00 |
| 28 Nov 2025 | Invoice | 47973 | 517.50 | 517.50 |
| 28 Nov 2025 | Crd Note | 13963 | -517.50 | 0.00 |

---

### December 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **0.00** |
| 08 Dec 2025 | Invoice | 48162 | 1,035.00 | 1,035.00 |
| 09 Dec 2025 | Crd Note | 14035 | -1,035.00 | 0.00 |
| 10 Dec 2025 | Invoice | 48193 | 1,207.50 | 1,207.50 |
| 10 Dec 2025 | Crd Note | 14043 | -1,207.50 | 0.00 |
| 17 Dec 2025 | Invoice | 48313 | 1,035.00 | 1,035.00 |
| 18 Dec 2025 | Crd Note | 14099 | -1,035.00 | 0.00 |
| 23 Dec 2025 | Invoice | 48446 | 1,035.00 | 1,035.00 |
| 23 Dec 2025 | Crd Note | 14147 | -1,035.00 | 0.00 |

---

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **0.00** |
| 02 Jan 2026 | Invoice | 48590 | 1,725.00 | 1,725.00 |
| 03 Jan 2026 | Crd Note | 14205 | -1,725.00 | 0.00 |
| 14 Jan 2026 | Invoice | 48787 | 1,035.00 | 1,035.00 |
| 15 Jan 2026 | Crd Note | 14270 | -1,035.00 | 0.00 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **0.00** |
| 05 Feb 2026 | Invoice | 49107 | 1,035.00 | 1,035.00 |
| 06 Feb 2026 | Crd Note | 14380 | -1,035.00 | 0.00 |
| 19 Feb 2026 | Invoice | 49332 | 2,242.50 | 2,242.50 |
| 19 Feb 2026 | Crd Note | 14457 | -2,242.50 | 0.00 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | -5.16 |
| Part 1B — CYL Deposits | 0.00 |
| **Combined (1A + 1B)** | **-5.16** |
| ERP `CURRENT BALANCE` (TXT header) | -5.16 |
| **Variance (Combined − ERP)** | **0.00** |

---

## Ingest Gate

*No coverage report found. Run `npm run debtors:ingest-check -- --debtor DBS001` before trusting Part 2 qty.*

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`.*

> **DB unavailable — Part 2 omitted.** Custody quantities require a live `vw_clean_transactions` connection (DATABASE_URL not set in this environment). No custody position can be stated for this run.

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R-5.16 |
| Cylinder Financial Balance (Part 1B close) | R0.00 |
| **Total Debtor Balance** | **R-5.16** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| — | 0 | — | R0.00 |
| **Total** | **0** | — | **R0.00** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R0.00 | R0.00 | R0.00 |
| Sub-ledger tie (1A + 1B vs combined) | R-5.16 | — | R0.00 |

**ERP Combined Balance (TXT header):** R-5.16  
**Reconstructed Balance (1A + 1B):** R-5.16  
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
