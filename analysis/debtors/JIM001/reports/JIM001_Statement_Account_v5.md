# Statement of Account: Jimmy's / Invesco (JIM001) - Version 5 (Sub-Ledger Position Statement)
**Period:** Mar 2025 → Jun 2026 &nbsp;|&nbsp; **Account:** JIM001
**Combined Opening B/F:** R45,202.67 (ERP verified — source: `analysis/debtors/JIM001/raw/DEBENQ_CURRENT.TXT` raw/DEBENQ_CURRENT.TXT line 16 -- last posted balance before the window (04/07/2024, TXT date format DD/MM/YYYY). Period starts 2025-03-01, not 2025-01-01, because this TXT export has a real coverage gap between 2024-07-04 and 2025-03-05 (confirmed vs invoices.csv -- see JIM001_Exact_Sum_Bridge_Review_2026-09-13.md SS5/SS7.1); it is complete from 2025-03-01 onward only.)
**LPG Opening B/F (1A):** R46,934.17 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R-1,731.50
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-09-14 from ERP TXT (`reconcile_jim001_v5_from_mcp_cache.mjs` — MCP-cache variant, DATABASE_URL unavailable in-session; doc-split/qty lookups sourced via Supabase MCP query 2026-09-14 against project `oqhpxnaadahohwkslive`, same SQL as the shared generator)

---

## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Mar 2025. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### March 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **46,934.17** |
| 05 Mar 2025 | Invoice | 41216 | 2,948.81 | 49,882.98 |
| 14 Mar 2025 | Invoice | 41486 | 2,948.81 | 52,831.79 |
| 20 Mar 2025 | Invoice | 41633 | 2,948.81 | 55,780.60 |
| 28 Mar 2025 | Invoice | 41799 | 2,948.81 | 58,729.41 |

---

### April 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **58,729.41** |
| 02 Apr 2025 | Invoice | 41926 | 4,423.21 | 63,152.62 |
| 10 Apr 2025 | Invoice | 42181 | 4,325.33 | 67,477.95 |
| 17 Apr 2025 | Invoice | 42357 | 4,325.33 | 71,803.28 |
| 25 Apr 2025 | Invoice | 42565 | 4,325.33 | 76,128.61 |
| 30 Apr 2025 | Invoice | 42704 | 4,325.33 | 80,453.94 |

---

### May 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **80,453.94** |
| 03 May 2025 | Invoice | 42755 | 3,153.89 | 83,607.83 |
| 03 May 2025 | Crd Note | 12390 | -4,325.33 | 79,282.50 |
| 05 May 2025 | Payment | 38481 | -4,325.33 | 74,957.17 |
| 05 May 2025 | Payment | 38481 | -1,012.00 | 73,945.17 |
| 05 May 2025 | Payment | 38481 | -4,325.33 | 69,619.84 |
| 05 May 2025 | Payment | 38481 | -3,153.89 | 66,465.95 |
| 05 May 2025 | Payment | 38481 | -517.50 | 65,948.45 |
| 05 May 2025 | Payment | 38481 | -2,482.58 | 63,465.87 |
| 09 May 2025 | Invoice | 42949 | 4,325.33 | 67,791.20 |
| 15 May 2025 | Invoice | 43089 | 2,883.56 | 70,674.76 |
| 21 May 2025 | Invoice | 43271 | 4,382.95 | 75,057.71 |
| 22 May 2025 | Payment | 38846 | -2,950.74 | 72,106.97 |
| 22 May 2025 | Payment | 38846 | -4,387.23 | 67,719.74 |
| 29 May 2025 | Invoice | 43451 | 2,921.97 | 70,641.71 |

---

### June 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **70,641.71** |
| 05 Jun 2025 | Invoice | 43628 | 4,382.95 | 75,024.66 |
| 12 Jun 2025 | Payment | 39812 | -4,387.23 | 70,637.43 |
| 12 Jun 2025 | Payment | 39812 | -2,924.82 | 67,712.61 |
| 12 Jun 2025 | Payment | 39812 | -2,924.82 | 64,787.79 |
| 12 Jun 2025 | Payment | 39812 | -4,423.21 | 60,364.58 |
| 12 Jun 2025 | Payment | 39812 | -4,423.21 | 55,941.37 |
| 12 Jun 2025 | Payment | 39812 | -1,474.40 | 54,466.97 |
| 12 Jun 2025 | Invoice | 43880 | 3,115.05 | 57,582.02 |
| 12 Jun 2025 | Crd Note | 12712 | -3,115.05 | 54,466.97 |
| 13 Jun 2025 | Invoice | 43910 | 3,115.05 | 57,582.02 |
| 20 Jun 2025 | Invoice | 44097 | 4,272.07 | 61,854.09 |
| 26 Jun 2025 | Invoice | 44241 | 2,848.04 | 64,702.13 |

---

### July 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **64,702.13** |
| 04 Jul 2025 | Invoice | 44516 | 3,115.05 | 67,817.18 |
| 10 Jul 2025 | Invoice | 44707 | 4,200.69 | 72,017.87 |
| 14 Jul 2025 | Payment | 40063 | -690.00 | 71,327.87 |
| 14 Jul 2025 | Payment | 40063 | 345.00 | 71,672.87 |
| 14 Jul 2025 | Payment | 40063 | 156.00 | 71,828.87 |
| 14 Jul 2025 | Payment | 40063 | 1,207.50 | 73,036.37 |
| 14 Jul 2025 | Payment | 40063 | -1,207.50 | 71,828.87 |
| 14 Jul 2025 | Payment | 40063 | 1,207.50 | 73,036.37 |
| 14 Jul 2025 | Payment | 40063 | -2,316.03 | 70,720.34 |
| 14 Jul 2025 | Payment | 40063 | -1,207.50 | 69,512.84 |
| 14 Jul 2025 | Payment | 40063 | -3,115.05 | 66,397.79 |
| 14 Jul 2025 | Payment | 40063 | -4,272.07 | 62,125.72 |
| 14 Jul 2025 | Payment | 40063 | -2,848.04 | 59,277.68 |
| 14 Jul 2025 | Payment | 40063 | 1,207.50 | 60,485.18 |
| 14 Jul 2025 | Payment | 40063 | -262.55 | 60,222.63 |
| 14 Jul 2025 | Payment | 40063 | -1,207.50 | 59,015.13 |
| 14 Jul 2025 | Payment | 40063 | -2,415.00 | 56,600.13 |
| 14 Jul 2025 | Payment | 40063 | 2,415.00 | 59,015.13 |
| 14 Jul 2025 | Payment | 40063 | -1,207.50 | 57,807.63 |
| 14 Jul 2025 | Payment | 40063 | 1,207.50 | 59,015.13 |
| 14 Jul 2025 | Payment | 40063 | 1,207.50 | 60,222.63 |
| 18 Jul 2025 | Invoice | 44933 | 4,200.69 | 64,423.32 |
| 24 Jul 2025 | Invoice | 45091 | 2,800.46 | 67,223.78 |
| 26 Jul 2025 | Invoice | 45162 | 262.55 | 67,486.33 |

---

### August 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **67,486.33** |
| 01 Aug 2025 | Invoice | 45323 | 4,200.69 | 71,687.02 |
| 08 Aug 2025 | Invoice | 45498 | 2,800.46 | 74,487.48 |
| 15 Aug 2025 | Invoice | 45671 | 4,114.57 | 78,602.05 |
| 22 Aug 2025 | Payment | 40746 | -262.54 | 78,339.51 |
| 22 Aug 2025 | Payment | 40746 | -3,115.05 | 75,224.46 |
| 22 Aug 2025 | Payment | 40746 | -4,200.69 | 71,023.77 |
| 22 Aug 2025 | Payment | 40746 | -4,200.69 | 66,823.08 |
| 22 Aug 2025 | Payment | 40746 | -2,800.46 | 64,022.62 |
| 22 Aug 2025 | Payment | 40746 | -0.01 | 64,022.61 |
| 22 Aug 2025 | Invoice | 45831 | 4,114.57 | 68,137.18 |
| 29 Aug 2025 | Invoice | 45992 | 1,371.53 | 69,508.71 |

---

### September 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **69,508.71** |
| 04 Sept 2025 | Invoice | 46124 | 4,114.57 | 73,623.28 |
| 11 Sept 2025 | Invoice | 46308 | 3,948.56 | 77,571.84 |
| 19 Sept 2025 | Invoice | 46525 | 2,632.37 | 80,204.21 |
| 26 Sept 2025 | Invoice | 46686 | 2,632.37 | 82,836.58 |

---

### October 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **82,836.58** |
| 03 Oct 2025 | Invoice | 46859 | 3,948.56 | 86,785.14 |
| 09 Oct 2025 | Invoice | 46990 | 3,948.56 | 90,733.70 |
| 14 Oct 2025 | Payment | 41664 | -4,200.68 | 86,533.02 |
| 14 Oct 2025 | Payment | 41664 | -2,800.46 | 83,732.56 |
| 14 Oct 2025 | Payment | 41664 | -4,114.57 | 79,617.99 |
| 14 Oct 2025 | Payment | 41664 | -4,114.57 | 75,503.42 |
| 14 Oct 2025 | Payment | 41664 | -1,371.53 | 74,131.89 |
| 14 Oct 2025 | Payment | 41664 | -1,207.50 | 72,924.39 |
| 14 Oct 2025 | Payment | 41664 | 1,207.50 | 74,131.89 |
| 17 Oct 2025 | Invoice | 47148 | 2,632.37 | 76,764.26 |
| 24 Oct 2025 | Invoice | 47292 | 2,632.37 | 79,396.63 |

---

### November 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **79,396.63** |
| 01 Nov 2025 | Invoice | 47464 | 3,948.56 | 83,345.19 |
| 06 Nov 2025 | Payment | 42134 | -4,114.57 | 79,230.62 |
| 06 Nov 2025 | Payment | 42134 | -3,948.56 | 75,282.06 |
| 06 Nov 2025 | Payment | 42134 | -2,632.37 | 72,649.69 |
| 06 Nov 2025 | Payment | 42134 | -2,632.37 | 70,017.32 |
| 08 Nov 2025 | Invoice | 47571 | 2,584.37 | 72,601.69 |
| 14 Nov 2025 | Invoice | 47670 | 2,584.37 | 75,186.06 |
| 21 Nov 2025 | Invoice | 47848 | 3,876.56 | 79,062.62 |
| 28 Nov 2025 | Invoice | 47983 | 2,584.37 | 81,646.99 |

---

### December 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **81,646.99** |
| 04 Dec 2025 | Invoice | 48098 | 3,876.56 | 85,523.55 |
| 12 Dec 2025 | Invoice | 48244 | 2,596.52 | 88,120.07 |
| 19 Dec 2025 | Invoice | 48391 | 3,894.77 | 92,014.84 |
| 24 Dec 2025 | Invoice | 48487 | 1,298.26 | 93,313.10 |
| 29 Dec 2025 | Payment | 42788 | -3,948.56 | 89,364.54 |
| 29 Dec 2025 | Payment | 42788 | -3,948.56 | 85,415.98 |
| 29 Dec 2025 | Payment | 42788 | -2,632.37 | 82,783.61 |
| 29 Dec 2025 | Payment | 42788 | -2,632.37 | 80,151.24 |
| 31 Dec 2025 | Invoice | 48578 | 3,894.77 | 84,046.01 |
| 31 Dec 2025 | Crd Note | 14198 | -3,894.77 | 80,151.24 |

---

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **80,151.24** |
| 01 Jan 2026 | Invoice | 48599 | 3,894.77 | 84,046.01 |
| 03 Jan 2026 | Invoice | 48776 | 2,596.52 | 86,642.53 |
| 03 Jan 2026 | Crd Note | 14201 | -2,596.52 | 84,046.01 |
| 09 Jan 2026 | Invoice | 48701 | 3,894.77 | 87,940.78 |
| 17 Jan 2026 | Invoice | 48828 | 3,920.13 | 91,860.91 |
| 28 Jan 2026 | Invoice | 48994 | 2,613.42 | 94,474.33 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **94,474.33** |
| 05 Feb 2026 | Payment | 43199 | -9,105.15 | 85,369.18 |
| 05 Feb 2026 | Payment | 43199 | -3,876.56 | 81,492.62 |
| 05 Feb 2026 | Payment | 43199 | -2,596.52 | 78,896.10 |
| 06 Feb 2026 | Invoice | 49126 | 3,959.98 | 82,856.08 |
| 13 Feb 2026 | Invoice | 49242 | 2,639.99 | 85,496.07 |
| 18 Feb 2026 | Invoice | 49315 | 3,959.98 | 89,456.05 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **89,456.05** |
| 03 Mar 2026 | Invoice | 49530 | 3,959.98 | 93,416.03 |
| 04 Mar 2026 | Invoice | 49540 | 3,959.98 | 97,376.01 |
| 04 Mar 2026 | Crd Note | 14526 | -3,959.98 | 93,416.03 |
| 13 Mar 2026 | Invoice | 49727 | 3,988.79 | 97,404.82 |
| 20 Mar 2026 | Invoice | 49842 | 3,988.79 | 101,393.61 |

---

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **101,393.61** |
| 01 Apr 2026 | Invoice | 50042 | 3,988.79 | 105,382.40 |
| 09 Apr 2026 | Invoice | 50161 | 4,420.80 | 109,803.20 |
| 18 Apr 2026 | Invoice | 50290 | 2,947.20 | 112,750.40 |
| 24 Apr 2026 | Invoice | 50371 | 2,947.20 | 115,697.60 |
| 30 Apr 2026 | Invoice | 50468 | 4,420.80 | 120,118.40 |

---

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **120,118.40** |
| 08 May 2026 | Invoice | 50594 | 3,370.81 | 123,489.21 |
| 16 May 2026 | Invoice | 50712 | 3,370.81 | 126,860.02 |
| 21 May 2026 | Invoice | 50810 | 5,056.22 | 131,916.24 |
| 28 May 2026 | Invoice | 50920 | 5,056.22 | 136,972.46 |

---

### June 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **136,972.46** |
| 05 Jun 2026 | Payment | 44555 | -11,666.12 | 125,306.34 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

### March 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **-1,731.50** |
| 05 Mar 2025 | Invoice | 41217 | 2,415.00 | 683.50 |
| 05 Mar 2025 | Crd Note | 12003 | -2,415.00 | -1,731.50 |
| 14 Mar 2025 | Invoice | 41487 | 2,415.00 | 683.50 |
| 14 Mar 2025 | Crd Note | 12072 | -2,415.00 | -1,731.50 |
| 20 Mar 2025 | Invoice | 41634 | 2,415.00 | 683.50 |
| 22 Mar 2025 | Crd Note | 12116 | -2,415.00 | -1,731.50 |
| 28 Mar 2025 | Invoice | 41800 | 2,415.00 | 683.50 |
| 28 Mar 2025 | Crd Note | 12141 | -2,415.00 | -1,731.50 |

---

### April 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **-1,731.50** |
| 02 Apr 2025 | Invoice | 41927 | 3,622.50 | 1,891.00 |
| 02 Apr 2025 | Crd Note | 12178 | -2,415.00 | -524.00 |
| 17 Apr 2025 | Invoice | 42358 | 3,622.50 | 3,098.50 |
| 17 Apr 2025 | Crd Note | 12300 | -3,622.50 | -524.00 |
| 25 Apr 2025 | Invoice | 42566 | 3,622.50 | 3,098.50 |
| 25 Apr 2025 | Crd Note | 12349 | -3,622.50 | -524.00 |
| 30 Apr 2025 | Invoice | 42705 | 3,622.50 | 3,098.50 |

---

### May 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **3,098.50** |
| 03 May 2025 | Invoice | 42756 | 2,932.50 | 6,031.00 |
| 03 May 2025 | Crd Note | 12391 | -3,622.50 | 2,408.50 |
| 05 May 2025 | Crd Note | 12408 | -2,415.00 | -6.50 |
| 09 May 2025 | Invoice | 42951 | 3,622.50 | 3,616.00 |
| 09 May 2025 | Crd Note | 12453 | -3,622.50 | -6.50 |
| 15 May 2025 | Invoice | 43090 | 2,415.00 | 2,408.50 |
| 15 May 2025 | Crd Note | 12488 | -2,415.00 | -6.50 |
| 22 May 2025 | Invoice | 43272 | 3,622.50 | 3,616.00 |
| 22 May 2025 | Crd Note | 12543 | -3,622.50 | -6.50 |
| 29 May 2025 | Invoice | 43452 | 2,415.00 | 2,408.50 |
| 29 May 2025 | Crd Note | 12592 | -3,622.50 | -1,214.00 |

---

### June 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **-1,214.00** |
| 05 Jun 2025 | Invoice | 43630 | 3,622.50 | 2,408.50 |
| 05 Jun 2025 | Crd Note | 12634 | -2,415.00 | -6.50 |
| 12 Jun 2025 | Invoice | 43883 | 2,932.50 | 2,926.00 |
| 12 Jun 2025 | Crd Note | 12713 | -2,932.50 | -6.50 |
| 13 Jun 2025 | Invoice | 43911 | 2,932.50 | 2,926.00 |
| 13 Jun 2025 | Crd Note | 12725 | -2,932.50 | -6.50 |
| 20 Jun 2025 | Invoice | 44098 | 3,622.50 | 3,616.00 |
| 21 Jun 2025 | Crd Note | 12775 | -3,622.50 | -6.50 |
| 26 Jun 2025 | Invoice | 44242 | 2,415.00 | 2,408.50 |
| 26 Jun 2025 | Crd Note | 12823 | -2,415.00 | -6.50 |

---

### July 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **-6.50** |
| 04 Jul 2025 | Invoice | 44517 | 2,932.50 | 2,926.00 |
| 05 Jul 2025 | Crd Note | 12900 | -2,932.50 | -6.50 |
| 18 Jul 2025 | Invoice | 44934 | 3,622.50 | 3,616.00 |
| 18 Jul 2025 | Crd Note | 13010 | -3,622.50 | -6.50 |
| 24 Jul 2025 | Invoice | 45096 | 2,415.00 | 2,408.50 |
| 24 Jul 2025 | Crd Note | 13047 | -3,622.50 | -1,214.00 |
| 26 Jul 2025 | Invoice | 45165 | 517.50 | -696.50 |
| 26 Jul 2025 | Crd Note | 13061 | -517.50 | -1,214.00 |

---

### August 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **-1,214.00** |
| 01 Aug 2025 | Invoice | 45324 | 3,622.50 | 2,408.50 |
| 03 Aug 2025 | Crd Note | 13118 | -2,415.00 | -6.50 |
| 08 Aug 2025 | Invoice | 45499 | 2,415.00 | 2,408.50 |
| 08 Aug 2025 | Crd Note | 13171 | -2,415.00 | -6.50 |
| 15 Aug 2025 | Invoice | 45672 | 3,622.50 | 3,616.00 |
| 16 Aug 2025 | Crd Note | 13239 | -1,207.50 | 2,408.50 |
| 22 Aug 2025 | Invoice | 45832 | 3,622.50 | 6,031.00 |
| 22 Aug 2025 | Crd Note | 13288 | -3,622.50 | 2,408.50 |
| 29 Aug 2025 | Invoice | 45993 | 1,207.50 | 3,616.00 |
| 29 Aug 2025 | Crd Note | 13333 | -1,207.50 | 2,408.50 |

---

### September 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **2,408.50** |
| 04 Sept 2025 | Invoice | 46121 | 3,622.50 | 6,031.00 |
| 04 Sept 2025 | Crd Note | 13375 | -3,622.50 | 2,408.50 |
| 11 Sept 2025 | Invoice | 46309 | 3,622.50 | 6,031.00 |
| 12 Sept 2025 | Crd Note | 13450 | -3,622.50 | 2,408.50 |
| 19 Sept 2025 | Invoice | 46526 | 2,415.00 | 4,823.50 |
| 22 Sept 2025 | Crd Note | 13519 | -4,830.00 | -6.50 |
| 26 Sept 2025 | Invoice | 46687 | 2,415.00 | 2,408.50 |
| 26 Sept 2025 | Crd Note | 13554 | -2,415.00 | -6.50 |

---

### October 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **-6.50** |
| 03 Oct 2025 | Invoice | 46860 | 3,622.50 | 3,616.00 |
| 03 Oct 2025 | Crd Note | 13607 | -3,622.50 | -6.50 |
| 09 Oct 2025 | Invoice | 46991 | 3,622.50 | 3,616.00 |
| 09 Oct 2025 | Crd Note | 13647 | -2,415.00 | 1,201.00 |
| 17 Oct 2025 | Invoice | 47157 | 2,415.00 | 3,616.00 |
| 17 Oct 2025 | Crd Note | 13705 | -3,622.50 | -6.50 |
| 24 Oct 2025 | Invoice | 47293 | 2,415.00 | 2,408.50 |
| 24 Oct 2025 | Crd Note | 13745 | -2,415.00 | -6.50 |

---

### November 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **-6.50** |
| 01 Nov 2025 | Invoice | 47465 | 3,622.50 | 3,616.00 |
| 03 Nov 2025 | Crd Note | 13804 | -3,622.50 | -6.50 |
| 08 Nov 2025 | Invoice | 47572 | 2,415.00 | 2,408.50 |
| 08 Nov 2025 | Crd Note | 13828 | -3,622.50 | -1,214.00 |
| 14 Nov 2025 | Invoice | 47671 | 2,415.00 | 1,201.00 |
| 14 Nov 2025 | Crd Note | 13870 | -1,207.50 | -6.50 |
| 21 Nov 2025 | Invoice | 47849 | 1,207.50 | 1,201.00 |
| 21 Nov 2025 | Crd Note | 13925 | -3,622.50 | -2,421.50 |
| 28 Nov 2025 | Invoice | 47984 | 1,207.50 | -1,214.00 |

---

### December 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **-1,214.00** |
| 04 Dec 2025 | Invoice | 48099 | 3,622.50 | 2,408.50 |
| 04 Dec 2025 | Crd Note | 14008 | -2,415.00 | -6.50 |
| 12 Dec 2025 | Invoice | 48245 | 2,415.00 | 2,408.50 |
| 12 Dec 2025 | Crd Note | 14066 | -3,622.50 | -1,214.00 |
| 19 Dec 2025 | Invoice | 48392 | 3,622.50 | 2,408.50 |
| 20 Dec 2025 | Crd Note | 14131 | -3,622.50 | -1,214.00 |
| 24 Dec 2025 | Invoice | 48488 | 1,207.50 | -6.50 |
| 24 Dec 2025 | Crd Note | 14159 | -1,207.50 | -1,214.00 |
| 31 Dec 2025 | Invoice | 48579 | 3,622.50 | 2,408.50 |
| 31 Dec 2025 | Crd Note | 14199 | -3,622.50 | -1,214.00 |

---

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **-1,214.00** |
| 01 Jan 2026 | Invoice | 48600 | 3,622.50 | 2,408.50 |
| 01 Jan 2026 | Crd Note | 14259 | -2,415.00 | -6.50 |
| 09 Jan 2026 | Invoice | 48702 | 3,622.50 | 3,616.00 |
| 09 Jan 2026 | Crd Note | 14239 | -4,830.00 | -1,214.00 |
| 17 Jan 2026 | Invoice | 48829 | 3,622.50 | 2,408.50 |
| 22 Jan 2026 | Crd Note | 14313 | -2,415.00 | -6.50 |
| 28 Jan 2026 | Invoice | 48995 | 2,415.00 | 2,408.50 |
| 29 Jan 2026 | Crd Note | 14352 | -4,830.00 | -2,421.50 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **-2,421.50** |
| 06 Feb 2026 | Invoice | 49127 | 3,622.50 | 1,201.00 |
| 06 Feb 2026 | Crd Note | 14389 | -3,622.50 | -2,421.50 |
| 18 Feb 2026 | Invoice | 49316 | 3,622.50 | 1,201.00 |
| 18 Feb 2026 | Crd Note | 14438 | -2,415.00 | -1,214.00 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **-1,214.00** |
| 03 Mar 2026 | Invoice | 49531 | 3,622.50 | 2,408.50 |
| 04 Mar 2026 | Invoice | 49541 | 3,622.50 | 6,031.00 |
| 04 Mar 2026 | Crd Note | 14525 | -2,415.00 | 3,616.00 |
| 04 Mar 2026 | Crd Note | 14527 | -3,622.50 | -6.50 |
| 13 Mar 2026 | Invoice | 49728 | 3,622.50 | 3,616.00 |
| 14 Mar 2026 | Crd Note | 14591 | -3,622.50 | -6.50 |
| 20 Mar 2026 | Invoice | 49843 | 3,622.50 | 3,616.00 |
| 20 Mar 2026 | Crd Note | 14630 | -3,622.50 | -6.50 |

---

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **-6.50** |
| 01 Apr 2026 | Invoice | 50043 | 3,622.50 | 3,616.00 |
| 01 Apr 2026 | Crd Note | 14694 | -4,830.00 | -1,214.00 |
| 09 Apr 2026 | Invoice | 50162 | 3,622.50 | 2,408.50 |
| 09 Apr 2026 | Crd Note | 14731 | -3,622.50 | -1,214.00 |
| 18 Apr 2026 | Invoice | 50291 | 2,415.00 | 1,201.00 |
| 20 Apr 2026 | Crd Note | 14779 | -3,622.50 | -2,421.50 |
| 24 Apr 2026 | Invoice | 50372 | 2,415.00 | -6.50 |
| 24 Apr 2026 | Crd Note | 14878 | -2,415.00 | -2,421.50 |
| 30 Apr 2026 | Invoice | 50469 | 3,622.50 | 1,201.00 |
| 30 Apr 2026 | Crd Note | 14835 | -3,622.50 | -2,421.50 |

---

### May 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **-2,421.50** |
| 08 May 2026 | Invoice | 50595 | 2,415.00 | -6.50 |
| 08 May 2026 | Crd Note | 14877 | -2,415.00 | -2,421.50 |
| 16 May 2026 | Invoice | 50713 | 2,415.00 | -6.50 |
| 19 May 2026 | Crd Note | 14924 | -2,415.00 | -2,421.50 |
| 21 May 2026 | Invoice | 50811 | 3,622.50 | 1,201.00 |
| 21 May 2026 | Crd Note | 14940 | -3,622.50 | -2,421.50 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 125,306.34 |
| Part 1B — CYL Deposits | -2,421.50 |
| **Combined (1A + 1B)** | **122,884.84** |
| ERP `CURRENT BALANCE` (TXT header) | 122,884.84 |
| **Variance (Combined − ERP)** | **0.00** |

---

## Ingest Gate (`ingestFreshness: current` · `ingestCoverage: complete`)

| Check | Status |
| :--- | :--- |
| Display status | `CURRENT_COMPLETE` |
| Financial balance from TXT | **ALLOWED** |
| Custody / Part 2 qty | **ALLOWED** |
| SKU analysis | **ALLOWED** |

*Generated via the MCP-cache variant (DATABASE_URL unavailable in-session) -- doc-split/qty lookups sourced from a Supabase MCP query on 2026-09-14, not a live DB connection at generation time.*

---


## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count. Opening balances per `config/statement_v5.json`.*

### March 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **1** | **20** | **1** | **15** | **-9** |
| 05 Mar 2025 | Invoice | 41217 | 0 | 0 | 0 | 0 | +2 |
| 05 Mar 2025 | Crd Note | 12003 | 0 | 0 | 0 | 0 | -2 |
| 14 Mar 2025 | Invoice | 41487 | 0 | 0 | 0 | 0 | +2 |
| 14 Mar 2025 | Crd Note | 12072 | 0 | 0 | 0 | 0 | -2 |
| 20 Mar 2025 | Invoice | 41634 | 0 | 0 | 0 | 0 | +2 |
| 22 Mar 2025 | Crd Note | 12116 | 0 | 0 | 0 | 0 | -2 |
| 28 Mar 2025 | Invoice | 41800 | 0 | 0 | 0 | 0 | +2 |
| 28 Mar 2025 | Crd Note | 12141 | 0 | 0 | 0 | 0 | -2 |
| **End Mar** | **Closing Balance** | — | **1** | **20** | **1** | **15** | **-9** |

---

### April 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **1** | **20** | **1** | **15** | **-9** |
| 02 Apr 2025 | Invoice | 41927 | 0 | 0 | 0 | 0 | +3 |
| 02 Apr 2025 | Crd Note | 12178 | 0 | 0 | 0 | 0 | -2 |
| 17 Apr 2025 | Invoice | 42358 | 0 | 0 | 0 | 0 | +3 |
| 17 Apr 2025 | Crd Note | 12300 | 0 | 0 | 0 | 0 | -3 |
| 25 Apr 2025 | Invoice | 42566 | 0 | 0 | 0 | 0 | +3 |
| 25 Apr 2025 | Crd Note | 12349 | 0 | 0 | 0 | 0 | -3 |
| 30 Apr 2025 | Invoice | 42705 | 0 | 0 | 0 | 0 | +3 |
| **End Apr** | **Closing Balance** | — | **1** | **20** | **1** | **15** | **-5** |

---

### May 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **1** | **20** | **1** | **15** | **-5** |
| 03 May 2025 | Invoice | 42756 | 0 | 0 | +1 | 0 | +2 |
| 03 May 2025 | Crd Note | 12391 | 0 | 0 | 0 | 0 | -3 |
| 05 May 2025 | Crd Note | 12408 | 0 | 0 | 0 | 0 | -2 |
| 09 May 2025 | Invoice | 42951 | 0 | 0 | 0 | 0 | +3 |
| 09 May 2025 | Crd Note | 12453 | 0 | 0 | 0 | 0 | -3 |
| 15 May 2025 | Invoice | 43090 | 0 | 0 | 0 | 0 | +2 |
| 15 May 2025 | Crd Note | 12488 | 0 | 0 | 0 | 0 | -2 |
| 22 May 2025 | Invoice | 43272 | 0 | 0 | 0 | 0 | +3 |
| 22 May 2025 | Crd Note | 12543 | 0 | 0 | 0 | 0 | -3 |
| 29 May 2025 | Invoice | 43452 | 0 | 0 | 0 | 0 | +2 |
| 29 May 2025 | Crd Note | 12592 | 0 | 0 | 0 | 0 | -3 |
| **End May** | **Closing Balance** | — | **1** | **20** | **2** | **15** | **-9** |

---

### June 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **1** | **20** | **2** | **15** | **-9** |
| 05 Jun 2025 | Invoice | 43630 | 0 | 0 | 0 | 0 | +3 |
| 05 Jun 2025 | Crd Note | 12634 | 0 | 0 | 0 | 0 | -2 |
| 12 Jun 2025 | Invoice | 43883 | 0 | 0 | +1 | 0 | +2 |
| 12 Jun 2025 | Crd Note | 12713 | 0 | 0 | -1 | 0 | -2 |
| 13 Jun 2025 | Invoice | 43911 | 0 | 0 | +1 | 0 | +2 |
| 13 Jun 2025 | Crd Note | 12725 | 0 | 0 | -1 | 0 | -2 |
| 20 Jun 2025 | Invoice | 44098 | 0 | 0 | 0 | 0 | +3 |
| 21 Jun 2025 | Crd Note | 12775 | 0 | 0 | 0 | 0 | -3 |
| 26 Jun 2025 | Invoice | 44242 | 0 | 0 | 0 | 0 | +2 |
| 26 Jun 2025 | Crd Note | 12823 | 0 | 0 | 0 | 0 | -2 |
| **End Jun** | **Closing Balance** | — | **1** | **20** | **2** | **15** | **-8** |

---

### July 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **1** | **20** | **2** | **15** | **-8** |
| 04 Jul 2025 | Invoice | 44517 | 0 | 0 | +1 | 0 | +2 |
| 05 Jul 2025 | Crd Note | 12900 | 0 | 0 | -1 | 0 | -2 |
| 18 Jul 2025 | Invoice | 44934 | 0 | 0 | 0 | 0 | +3 |
| 18 Jul 2025 | Crd Note | 13010 | 0 | 0 | 0 | 0 | -3 |
| 24 Jul 2025 | Invoice | 45096 | 0 | 0 | 0 | 0 | +2 |
| 24 Jul 2025 | Crd Note | 13047 | 0 | 0 | 0 | 0 | -3 |
| 26 Jul 2025 | Invoice | 45165 | 0 | 0 | +1 | 0 | 0 |
| 26 Jul 2025 | Crd Note | 13061 | 0 | 0 | -1 | 0 | 0 |
| **End Jul** | **Closing Balance** | — | **1** | **20** | **2** | **15** | **-9** |

---

### August 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **1** | **20** | **2** | **15** | **-9** |
| 01 Aug 2025 | Invoice | 45324 | 0 | 0 | 0 | 0 | +3 |
| 03 Aug 2025 | Crd Note | 13118 | 0 | 0 | 0 | 0 | -2 |
| 08 Aug 2025 | Invoice | 45499 | 0 | 0 | 0 | 0 | +2 |
| 08 Aug 2025 | Crd Note | 13171 | 0 | 0 | 0 | 0 | -2 |
| 15 Aug 2025 | Invoice | 45672 | 0 | 0 | 0 | 0 | +3 |
| 16 Aug 2025 | Crd Note | 13239 | 0 | 0 | 0 | 0 | -1 |
| 22 Aug 2025 | Invoice | 45832 | 0 | 0 | 0 | 0 | +3 |
| 22 Aug 2025 | Crd Note | 13288 | 0 | 0 | 0 | 0 | -3 |
| 29 Aug 2025 | Invoice | 45993 | 0 | 0 | 0 | 0 | +1 |
| 29 Aug 2025 | Crd Note | 13333 | 0 | 0 | 0 | 0 | -1 |
| **End Aug** | **Closing Balance** | — | **1** | **20** | **2** | **15** | **-6** |

---

### September 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **1** | **20** | **2** | **15** | **-6** |
| 04 Sept 2025 | Invoice | 46121 | 0 | 0 | 0 | 0 | +3 |
| 04 Sept 2025 | Crd Note | 13375 | 0 | 0 | 0 | 0 | -3 |
| 11 Sept 2025 | Invoice | 46309 | 0 | 0 | 0 | 0 | +3 |
| 12 Sept 2025 | Crd Note | 13450 | 0 | 0 | 0 | 0 | -3 |
| 19 Sept 2025 | Invoice | 46526 | 0 | 0 | 0 | 0 | +2 |
| 22 Sept 2025 | Crd Note | 13519 | 0 | 0 | 0 | 0 | -4 |
| 26 Sept 2025 | Invoice | 46687 | 0 | 0 | 0 | 0 | +2 |
| 26 Sept 2025 | Crd Note | 13554 | 0 | 0 | 0 | 0 | -2 |
| **End Sep** | **Closing Balance** | — | **1** | **20** | **2** | **15** | **-8** |

---

### October 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | **1** | **20** | **2** | **15** | **-8** |
| 03 Oct 2025 | Invoice | 46860 | 0 | 0 | 0 | 0 | +3 |
| 03 Oct 2025 | Crd Note | 13607 | 0 | 0 | 0 | 0 | -3 |
| 09 Oct 2025 | Invoice | 46991 | 0 | 0 | 0 | 0 | +3 |
| 09 Oct 2025 | Crd Note | 13647 | 0 | 0 | 0 | 0 | -2 |
| 17 Oct 2025 | Invoice | 47157 | 0 | 0 | 0 | 0 | +2 |
| 17 Oct 2025 | Crd Note | 13705 | 0 | 0 | 0 | 0 | -3 |
| 24 Oct 2025 | Invoice | 47293 | 0 | 0 | 0 | 0 | +2 |
| 24 Oct 2025 | Crd Note | 13745 | 0 | 0 | 0 | 0 | -2 |
| **End Oct** | **Closing Balance** | — | **1** | **20** | **2** | **15** | **-8** |

---

### November 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | **1** | **20** | **2** | **15** | **-8** |
| 01 Nov 2025 | Invoice | 47465 | 0 | 0 | 0 | 0 | +3 |
| 03 Nov 2025 | Crd Note | 13804 | 0 | 0 | 0 | 0 | -3 |
| 08 Nov 2025 | Invoice | 47572 | 0 | 0 | 0 | 0 | +2 |
| 08 Nov 2025 | Crd Note | 13828 | 0 | 0 | 0 | 0 | -3 |
| 14 Nov 2025 | Invoice | 47671 | 0 | 0 | 0 | 0 | +2 |
| 14 Nov 2025 | Crd Note | 13870 | 0 | 0 | 0 | 0 | -1 |
| 21 Nov 2025 | Invoice | 47849 | 0 | 0 | 0 | 0 | +1 |
| 21 Nov 2025 | Crd Note | 13925 | 0 | 0 | 0 | 0 | -3 |
| 28 Nov 2025 | Invoice | 47984 | 0 | 0 | 0 | 0 | +1 |
| **End Nov** | **Closing Balance** | — | **1** | **20** | **2** | **15** | **-9** |

---

### December 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | **1** | **20** | **2** | **15** | **-9** |
| 04 Dec 2025 | Invoice | 48099 | 0 | 0 | 0 | 0 | +3 |
| 04 Dec 2025 | Crd Note | 14008 | 0 | 0 | 0 | 0 | -2 |
| 12 Dec 2025 | Invoice | 48245 | 0 | 0 | 0 | 0 | +2 |
| 12 Dec 2025 | Crd Note | 14066 | 0 | 0 | 0 | 0 | -3 |
| 19 Dec 2025 | Invoice | 48392 | 0 | 0 | 0 | 0 | +3 |
| 20 Dec 2025 | Crd Note | 14131 | 0 | 0 | 0 | 0 | -3 |
| 24 Dec 2025 | Invoice | 48488 | 0 | 0 | 0 | 0 | +1 |
| 24 Dec 2025 | Crd Note | 14159 | 0 | 0 | 0 | 0 | -1 |
| 31 Dec 2025 | Invoice | 48579 | 0 | 0 | 0 | 0 | +3 |
| 31 Dec 2025 | Crd Note | 14199 | 0 | 0 | 0 | 0 | -3 |
| **End Dec** | **Closing Balance** | — | **1** | **20** | **2** | **15** | **-9** |

---

### January 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **1** | **20** | **2** | **15** | **-9** |
| 01 Jan 2026 | Invoice | 48600 | 0 | 0 | 0 | 0 | +3 |
| 01 Jan 2026 | Crd Note | 14259 | 0 | 0 | 0 | 0 | -2 |
| 09 Jan 2026 | Invoice | 48702 | 0 | 0 | 0 | 0 | +3 |
| 09 Jan 2026 | Crd Note | 14239 | 0 | 0 | 0 | 0 | -4 |
| 17 Jan 2026 | Invoice | 48829 | 0 | 0 | 0 | 0 | +3 |
| 22 Jan 2026 | Crd Note | 14313 | 0 | 0 | 0 | 0 | -2 |
| 28 Jan 2026 | Invoice | 48995 | 0 | 0 | 0 | 0 | +2 |
| 29 Jan 2026 | Crd Note | 14352 | 0 | 0 | 0 | 0 | -4 |
| **End Jan** | **Closing Balance** | — | **1** | **20** | **2** | **15** | **-10** |

---

### February 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **1** | **20** | **2** | **15** | **-10** |
| 06 Feb 2026 | Invoice | 49127 | 0 | 0 | 0 | 0 | +3 |
| 06 Feb 2026 | Crd Note | 14389 | 0 | 0 | 0 | 0 | -3 |
| 18 Feb 2026 | Invoice | 49316 | 0 | 0 | 0 | +3 | 0 |
| 18 Feb 2026 | Crd Note | 14438 | 0 | 0 | 0 | 0 | -2 |
| **End Feb** | **Closing Balance** | — | **1** | **20** | **2** | **18** | **-12** |

---

### March 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **1** | **20** | **2** | **18** | **-12** |
| 03 Mar 2026 | Invoice | 49531 | 0 | 0 | 0 | 0 | +3 |
| 04 Mar 2026 | Invoice | 49541 | 0 | 0 | 0 | 0 | +3 |
| 04 Mar 2026 | Crd Note | 14525 | 0 | 0 | 0 | 0 | -2 |
| 04 Mar 2026 | Crd Note | 14527 | 0 | 0 | 0 | 0 | -3 |
| 13 Mar 2026 | Invoice | 49728 | 0 | 0 | 0 | 0 | +3 |
| 14 Mar 2026 | Crd Note | 14591 | 0 | 0 | 0 | 0 | -3 |
| 20 Mar 2026 | Invoice | 49843 | 0 | 0 | 0 | 0 | +3 |
| 20 Mar 2026 | Crd Note | 14630 | 0 | 0 | 0 | -2 | -1 |
| **End Mar** | **Closing Balance** | — | **1** | **20** | **2** | **16** | **-9** |

---

### April 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **1** | **20** | **2** | **16** | **-9** |
| 01 Apr 2026 | Invoice | 50043 | 0 | 0 | 0 | 0 | +3 |
| 01 Apr 2026 | Crd Note | 14694 | 0 | 0 | 0 | 0 | -4 |
| 09 Apr 2026 | Invoice | 50162 | 0 | 0 | 0 | 0 | +3 |
| 09 Apr 2026 | Crd Note | 14731 | 0 | 0 | 0 | 0 | -3 |
| 18 Apr 2026 | Invoice | 50291 | 0 | 0 | 0 | 0 | +2 |
| 20 Apr 2026 | Crd Note | 14779 | 0 | 0 | 0 | 0 | -3 |
| 24 Apr 2026 | Invoice | 50372 | 0 | 0 | 0 | 0 | +2 |
| 24 Apr 2026 | Crd Note | 14878 | 0 | 0 | 0 | 0 | -2 |
| 30 Apr 2026 | Invoice | 50469 | 0 | 0 | 0 | 0 | +3 |
| 30 Apr 2026 | Crd Note | 14835 | 0 | 0 | 0 | 0 | -3 |
| **End Apr** | **Closing Balance** | — | **1** | **20** | **2** | **16** | **-11** |

---

### May 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **1** | **20** | **2** | **16** | **-11** |
| 08 May 2026 | Invoice | 50595 | 0 | 0 | 0 | 0 | +2 |
| 08 May 2026 | Crd Note | 14877 | 0 | 0 | 0 | 0 | -2 |
| 16 May 2026 | Invoice | 50713 | 0 | 0 | 0 | 0 | +2 |
| 19 May 2026 | Crd Note | 14924 | 0 | 0 | 0 | 0 | -2 |
| 21 May 2026 | Invoice | 50811 | 0 | 0 | 0 | 0 | +3 |
| 21 May 2026 | Crd Note | 14940 | 0 | 0 | 0 | 0 | -3 |
| **End May** | **Closing Balance** | — | **1** | **20** | **2** | **16** | **-11** |

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R125,306.34 |
| Cylinder Financial Balance (Part 1B close) | R-2,421.50 |
| **Total Debtor Balance** | **R122,884.84** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 14kg | 1 | R575.00 | R575.00 |
| 19kg | 20 | R690.00 | R13,800.00 |
| 9kg | 2 | R517.50 | R1,035.00 |
| D.1 | 16 | R1,150.00 | R18,400.00 |
| S.1 | -11 | R1,150.00 | R-12,650.00 |
| **Total** | **28** | — | **R21,160.00** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R-2,421.50 | R21,160.00 | R-23,581.50 |
| Sub-ledger tie (1A + 1B vs combined) | R122,884.84 | — | R0.00 |

**ERP Combined Balance (TXT header):** R122,884.84
**Reconstructed Balance (1A + 1B):** R122,884.84
**Variance:** R0.00

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
