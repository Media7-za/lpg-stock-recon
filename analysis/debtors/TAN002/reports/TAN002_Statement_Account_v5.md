# Statement of Account: TANDOOR THE CLAY OVEN (TAN002) - Version 5 (Sub-Ledger Position Statement)
**Period:** Feb 2025 → Aug 2026 &nbsp;|&nbsp; **Account:** TAN002
**Combined Opening B/F:** R16,828.85 (ERP verified — source: `analysis/debtors/TAN002/raw/TAN002CURRENT.TXT` raw/TAN002CURRENT.TXT BALANCE B/F row (line 1) — chain-verified PROVEN against raw/TAN002_2025.TXT closing balance; see reports/TAN002_Statement_Chain_2026-09-21.md)
**LPG Opening B/F (1A):** R16,828.85 &nbsp;|&nbsp; **CYL Opening B/F (1B):** R0.00
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-09-22 from ERP TXT + Supabase MCP (`vw_clean_transactions` debt_group split) — real DB-backed run, replicating `reconcile_debtor_v5_from_txt.mjs`'s own queries directly via Supabase MCP since a live `DATABASE_URL` is not available to the `pg` client in this session. See §0 below.

---

## 0. Provenance of this run (read before trusting Part 1A/1B)

This is a **real, DB-backed** v5 run — not the TXT-only manual reproduction of
2026-09-21. `reconcile_debtor_v5_from_txt.mjs` itself could not be executed
(no `DATABASE_URL` for its `pg` client this session), so its exact two
queries — `fetchDocLineSplit()` (per-document `debt_group` split from
`vw_clean_transactions`) and the CYL-qty query inside `buildPart2()` — were
run directly via the Supabase MCP `execute_sql` tool against the same
project (`oqhpxnaadahohwkslive`), and the script's own pure JS logic
(`parseTxtRows`, `splitRowAmount`, `buildPart1Split`, `buildPart2`) was
run locally against those real results, byte-for-byte identical to the
script's source as of this session. **PROVEN**, not ASSERTED — the only
non-DB inputs are the TXT file itself (already PROVEN, see
`TAN002_Statement_Chain_2026-09-21.md`) and the two still-unverified config
placeholders below.

**Result: zero variance both ways** — Combined (1A+1B) ties the ERP TXT
header exactly (R0.00 variance), and the 1A/1B split sums to
Combined exactly (R0.00 sub-ledger variance). This
replaces the 2026-09-21 report's TXT-regex-based (ASSERTED) LPG/CYL
classification with the real `debt_group` column (PROVEN) for every
Invoice/Crd Note document in the period.

**What is still not independently proven:** `config/statement_v5.json`'s
`cylOpeningFinancial: 0` and `cylOpeningQty` (all-zero) placeholders, which
fix the CYL lane's state *at* `periodStart` (22/02/2025). This run doesn't
determine them from pre-period DB history — it only shows that, taken as
given, they produce an internally consistent, zero-variance result through
to 20/08/2026. That is real corroboration (an inconsistent opening
assumption would very likely have surfaced as a nonzero `erpVariance` or an
implausible custody figure over 18 months of trading), but it is not the
same as tracing the pre-22/02/2025 CYL history directly. Downgrade
accordingly if a future pre-period DB pull contradicts it.

---

## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Feb 2025. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`).*

### February 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **16,828.85** |
| 22 Feb 2025 | Payment | 36865 | -1,028.67 | 15,800.18 |
| 22 Feb 2025 | Payment | 36865 | -1,326.79 | 14,473.39 |
| 22 Feb 2025 | Payment | 36865 | -2,653.58 | 11,819.81 |
| 22 Feb 2025 | Payment | 36865 | -1,326.79 | 10,493.02 |
| 22 Feb 2025 | Payment | 36865 | -1,326.79 | 9,166.23 |
| 22 Feb 2025 | Payment | 36865 | -2,653.58 | 6,512.65 |
| 22 Feb 2025 | Payment | 36865 | -529.93 | 5,982.72 |
| 22 Feb 2025 | Payment | 36865 | -1,338.78 | 4,643.94 |
| 22 Feb 2025 | Payment | 36865 | -97.65 | 4,546.29 |

---

### March 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **4,546.29** |
| 06 Mar 2025 | Invoice | 41270 | 1,338.78 | 5,885.07 |
| 12 Mar 2025 | Invoice | 41408 | 3,207.50 | 9,092.57 |
| 18 Mar 2025 | Invoice | 41584 | 2,677.57 | 11,770.14 |
| 27 Mar 2025 | Payment | 37780 | -1,241.13 | 10,529.01 |
| 27 Mar 2025 | Payment | 37780 | -2,677.57 | 7,851.44 |
| 27 Mar 2025 | Payment | 37780 | -1,868.72 | 5,982.72 |
| 27 Mar 2025 | Payment | 37780 | -1,338.78 | 4,643.94 |
| 27 Mar 2025 | Payment | 37780 | -3,207.50 | 1,436.44 |
| 27 Mar 2025 | Payment | 37780 | -97.65 | 1,338.79 |

---

### April 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **1,338.79** |
| 01 Apr 2025 | Invoice | 41892 | 1,868.72 | 3,207.51 |
| 04 Apr 2025 | Invoice | 42017 | 2,677.57 | 5,885.08 |
| 14 Apr 2025 | Invoice | 42249 | 1,306.16 | 7,191.24 |
| 16 Apr 2025 | Invoice | 42315 | 1,306.16 | 8,497.40 |
| 22 Apr 2025 | Invoice | 42427 | 3,129.33 | 11,626.73 |
| 26 Apr 2025 | Invoice | 42574 | 1,306.16 | 12,932.89 |

---

### May 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **12,932.89** |
| 03 May 2025 | Invoice | 42750 | 1,306.16 | 14,239.05 |
| 06 May 2025 | Invoice | 42839 | 2,612.32 | 16,851.37 |
| 09 May 2025 | Invoice | 42964 | 1,306.16 | 18,157.53 |
| 16 May 2025 | Invoice | 43132 | 1,306.16 | 19,463.69 |
| 24 May 2025 | Invoice | 43333 | 2,650.73 | 22,114.42 |
| 24 May 2025 | Invoice | 43353 | 1,849.98 | 23,964.40 |
| 29 May 2025 | Invoice | 43465 | 1,573.87 | 25,538.27 |

---

### June 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **25,538.27** |
| 04 Jun 2025 | Payment | 39035 | -598.00 | 24,940.27 |
| 04 Jun 2025 | Payment | 39035 | -975.87 | 23,964.40 |
| 04 Jun 2025 | Payment | 39035 | -348.48 | 23,615.92 |
| 04 Jun 2025 | Payment | 39035 | -1,306.16 | 22,309.76 |
| 04 Jun 2025 | Payment | 39035 | -2,612.32 | 19,697.44 |
| 04 Jun 2025 | Payment | 39035 | -1,306.16 | 18,391.28 |
| 04 Jun 2025 | Payment | 39035 | -1,306.16 | 17,085.12 |
| 04 Jun 2025 | Payment | 39035 | -2,650.73 | 14,434.39 |
| 04 Jun 2025 | Payment | 39035 | -1,849.98 | 12,584.41 |
| 04 Jun 2025 | Payment | 39035 | -172.50 | 12,411.91 |
| 04 Jun 2025 | Payment | 39035 | -517.50 | 11,894.41 |
| 07 Jun 2025 | Invoice | 43701 | 1,849.98 | 13,744.39 |
| 10 Jun 2025 | Invoice | 43762 | 3,175.35 | 16,919.74 |
| 17 Jun 2025 | Invoice | 43994 | 3,086.80 | 20,006.54 |
| 24 Jun 2025 | Invoice | 44198 | 2,576.80 | 22,583.34 |

---

### July 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **22,583.34** |
| 02 Jul 2025 | Invoice | 44447 | 2,576.80 | 25,160.14 |
| 09 Jul 2025 | Invoice | 44672 | 2,529.22 | 27,689.36 |
| 15 Jul 2025 | Payment | 39960 | -500.57 | 27,188.79 |
| 15 Jul 2025 | Payment | 39962 | -2,445.46 | 24,743.33 |
| 15 Jul 2025 | Payment | 39962 | -1,868.72 | 22,874.61 |
| 15 Jul 2025 | Payment | 39962 | -2,677.57 | 20,197.04 |
| 15 Jul 2025 | Payment | 39962 | -1,306.16 | 18,890.88 |
| 15 Jul 2025 | Payment | 39962 | -1,306.16 | 17,584.72 |
| 15 Jul 2025 | Payment | 39962 | -395.93 | 17,188.79 |
| 15 Jul 2025 | Invoice | 44854 | 500.57 | 17,689.36 |
| 16 Jul 2025 | Invoice | 44883 | 2,529.22 | 20,218.58 |
| 23 Jul 2025 | Invoice | 45061 | 3,029.79 | 23,248.37 |
| 23 Jul 2025 | Invoice | 45067 | 1,765.18 | 25,013.55 |

---

### August 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **25,013.55** |
| 02 Aug 2025 | Invoice | 45350 | 1,264.61 | 26,278.16 |
| 09 Aug 2025 | Invoice | 45536 | 1,264.61 | 27,542.77 |
| 09 Aug 2025 | Invoice | 45543 | 2,529.22 | 30,071.99 |
| 15 Aug 2025 | Payment | 40610 | -265.26 | 29,806.73 |
| 15 Aug 2025 | Payment | 40610 | -232.11 | 29,574.62 |
| 15 Aug 2025 | Payment | 40610 | -2,529.22 | 27,045.40 |
| 15 Aug 2025 | Payment | 40610 | -3,029.79 | 24,015.61 |
| 15 Aug 2025 | Payment | 40610 | -1,765.18 | 22,250.43 |
| 15 Aug 2025 | Payment | 40610 | -1,264.61 | 20,985.82 |
| 15 Aug 2025 | Payment | 40610 | -1,264.61 | 19,721.21 |
| 15 Aug 2025 | Payment | 40610 | -2,529.22 | 17,191.99 |
| 21 Aug 2025 | Invoice | 45792 | 2,471.81 | 19,663.80 |
| 21 Aug 2025 | Invoice | 45802 | 2,471.81 | 22,135.61 |
| 23 Aug 2025 | Payment | 40718 | -513.17 | 21,622.44 |
| 23 Aug 2025 | Payment | 40718 | -1,573.87 | 20,048.57 |
| 23 Aug 2025 | Payment | 40718 | -1,849.98 | 18,198.59 |
| 23 Aug 2025 | Payment | 40718 | -3,175.35 | 15,023.24 |
| 23 Aug 2025 | Payment | 40718 | -2,576.80 | 12,446.44 |
| 23 Aug 2025 | Payment | 40718 | -2,576.80 | 9,869.64 |
| 23 Aug 2025 | Payment | 40718 | -2,529.22 | 7,340.42 |
| 23 Aug 2025 | Payment | 40718 | -690.00 | 6,650.42 |
| 23 Aug 2025 | Payment | 40718 | 1,207.50 | 7,857.92 |
| 23 Aug 2025 | Payment | 40718 | -517.50 | 7,340.42 |
| 23 Aug 2025 | Payment | 40718 | -0.36 | 7,340.06 |
| 23 Aug 2025 | Payment | 40718 | -690.00 | 6,650.06 |
| 23 Aug 2025 | Payment | 40718 | -721.95 | 5,928.11 |
| 23 Aug 2025 | Payment | 40718 | 1,207.50 | 7,135.61 |

---

### September 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **7,135.61** |
| 02 Sept 2025 | Invoice | 46077 | 1,725.12 | 8,860.73 |
| 06 Sept 2025 | Invoice | 46191 | 2,828.41 | 11,689.14 |
| 11 Sept 2025 | Invoice | 46310 | 1,180.56 | 12,869.70 |
| 18 Sept 2025 | Payment | 41252 | -3,086.80 | 9,782.90 |
| 18 Sept 2025 | Payment | 41252 | -2,471.81 | 7,311.09 |
| 18 Sept 2025 | Payment | 41252 | -2,471.81 | 4,839.28 |
| 18 Sept 2025 | Payment | 41252 | -1,725.12 | 3,114.16 |
| 18 Sept 2025 | Payment | 41252 | -2,828.41 | 285.75 |
| 18 Sept 2025 | Payment | 41252 | -1,180.56 | -894.81 |
| 18 Sept 2025 | Invoice | 46476 | 1,180.56 | 285.75 |
| 19 Sept 2025 | Invoice | 46498 | 2,361.11 | 2,646.86 |
| 20 Sept 2025 | Payment | 41261 | -1,180.56 | 1,466.30 |
| 20 Sept 2025 | Payment | 41261 | -2,361.11 | -894.81 |
| 25 Sept 2025 | Invoice | 46654 | 1,180.56 | 285.75 |
| 25 Sept 2025 | Invoice | 46656 | 1,180.56 | 1,466.31 |
| 29 Sept 2025 | Invoice | 46729 | 1,180.56 | 2,646.87 |
| 29 Sept 2025 | Crd Note | 13562 | -1,180.56 | 1,466.31 |
| 30 Sept 2025 | Payment | 41474 | -1,180.56 | 285.75 |
| 30 Sept 2025 | Payment | 41474 | -1,180.56 | -894.81 |

---

### October 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **-894.81** |
| 04 Oct 2025 | Invoice | 46882 | 1,180.56 | 285.75 |
| 08 Oct 2025 | Invoice | 46968 | 2,828.41 | 3,114.16 |
| 09 Oct 2025 | Invoice | 46984 | 1,647.86 | 4,762.02 |
| 13 Oct 2025 | Payment | 41629 | -2,828.41 | 1,933.61 |
| 13 Oct 2025 | Payment | 41629 | -1,647.86 | 285.75 |
| 13 Oct 2025 | Payment | 41630 | -1,180.56 | -894.81 |
| 20 Oct 2025 | Invoice | 47178 | 1,647.86 | 753.05 |
| 24 Oct 2025 | Invoice | 47285 | 2,361.11 | 3,114.16 |
| 27 Oct 2025 | Payment | 41964 | -1,647.86 | 1,466.30 |
| 27 Oct 2025 | Payment | 41964 | -2,361.11 | -894.81 |
| 27 Oct 2025 | Payment | 41964 | -210.88 | -1,105.69 |
| 27 Oct 2025 | Payment | 41964 | -38.76 | -1,144.45 |
| 30 Oct 2025 | Invoice | 47420 | 2,361.11 | 1,216.66 |

---

### November 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **1,216.66** |
| 14 Nov 2025 | Invoice | 47662 | 2,770.91 | 3,987.57 |
| 14 Nov 2025 | Invoice | 47666 | 1,614.36 | 5,601.93 |
| 18 Nov 2025 | Payment | 42300 | -2,361.11 | 3,240.82 |
| 18 Nov 2025 | Payment | 42300 | -2,770.91 | 469.91 |
| 18 Nov 2025 | Payment | 42300 | -1,614.00 | -1,144.09 |
| 21 Nov 2025 | Invoice | 47838 | 1,156.56 | 12.47 |
| 25 Nov 2025 | Invoice | 47887 | 2,313.11 | 2,325.58 |
| 26 Nov 2025 | Payment | 42421 | -1,156.56 | 1,169.02 |
| 26 Nov 2025 | Payment | 42421 | -2,313.11 | -1,144.09 |
| 27 Nov 2025 | Invoice | 47941 | 1,156.56 | 12.47 |

---

### December 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **12.47** |
| 06 Dec 2025 | Invoice | 48130 | 1,156.56 | 1,169.03 |
| 08 Dec 2025 | Payment | 42543 | -1,156.56 | 12.47 |
| 08 Dec 2025 | Payment | 42543 | -1,156.56 | -1,144.09 |
| 10 Dec 2025 | Invoice | 48185 | 1,162.63 | 18.54 |
| 13 Dec 2025 | Payment | 42611 | -1,162.63 | -1,144.09 |
| 18 Dec 2025 | Invoice | 48351 | 1,622.83 | 478.74 |
| 18 Dec 2025 | Invoice | 48353 | 2,325.25 | 2,803.99 |
| 30 Dec 2025 | Invoice | 48538 | 1,162.63 | 3,966.62 |

---

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **3,966.62** |
| 07 Jan 2026 | Invoice | 48645 | 2,325.25 | 6,291.87 |
| 07 Jan 2026 | Invoice | 48646 | 1,162.63 | 7,454.50 |
| 07 Jan 2026 | Crd Note | 14218 | -2,325.25 | 5,129.25 |
| 09 Jan 2026 | Invoice | 48693 | 2,325.25 | 7,454.50 |
| 09 Jan 2026 | Invoice | 48722 | 1,162.63 | 8,617.13 |
| 09 Jan 2026 | Crd Note | 14235 | -1,162.63 | 7,454.50 |
| 12 Jan 2026 | Invoice | 48730 | 2,325.25 | 9,779.75 |
| 20 Jan 2026 | Payment | 43067 | -2,286.49 | 7,493.26 |
| 20 Jan 2026 | Payment | 43067 | -1,162.63 | 6,330.63 |
| 20 Jan 2026 | Payment | 43067 | -1,162.63 | 5,168.00 |
| 20 Jan 2026 | Payment | 43067 | -1,162.62 | 4,005.38 |
| 20 Jan 2026 | Payment | 43067 | -1,207.50 | 2,797.88 |
| 20 Jan 2026 | Payment | 43067 | -1,162.63 | 1,635.25 |
| 20 Jan 2026 | Payment | 43067 | -2,325.25 | -690.00 |
| 20 Jan 2026 | Payment | 43067 | -454.09 | -1,144.09 |
| 28 Jan 2026 | Invoice | 48971 | 1,171.09 | 27.00 |
| 28 Jan 2026 | Invoice | 48975 | 1,171.09 | 1,198.09 |
| 28 Jan 2026 | Invoice | 48979 | 1,171.09 | 2,369.18 |
| 28 Jan 2026 | Crd Note | 14339 | -1,171.09 | 1,198.09 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **1,198.09** |
| 02 Feb 2026 | Payment | 43216 | -1,171.09 | 27.00 |
| 02 Feb 2026 | Payment | 43216 | -1,171.09 | -1,144.09 |
| 05 Feb 2026 | Invoice | 49100 | 1,171.09 | 27.00 |
| 13 Feb 2026 | Invoice | 49228 | 2,368.75 | 2,395.75 |
| 16 Feb 2026 | Invoice | 49259 | 1,653.19 | 4,048.94 |
| 18 Feb 2026 | Payment | 43373 | -1,171.09 | 2,877.85 |
| 18 Feb 2026 | Payment | 43373 | -2,368.75 | 509.10 |
| 18 Feb 2026 | Payment | 43373 | -1,653.19 | -1,144.09 |
| 21 Feb 2026 | Invoice | 49360 | 1,184.37 | 40.28 |
| 21 Feb 2026 | Invoice | 49361 | 1,184.37 | 1,224.65 |
| 23 Feb 2026 | Crd Note | 14472 | -1,184.37 | 40.28 |
| 24 Feb 2026 | Invoice | 49397 | 1,653.19 | 1,693.47 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **1,693.47** |
| 05 Mar 2026 | Invoice | 49577 | 1,184.37 | 2,877.84 |
| 06 Mar 2026 | Payment | 43562 | -454.09 | 2,423.75 |
| 06 Mar 2026 | Payment | 43562 | -730.28 | 1,693.47 |
| 06 Mar 2026 | Payment | 43562 | -1,653.19 | 40.28 |
| 06 Mar 2026 | Payment | 43562 | -1,184.37 | -1,144.09 |
| 13 Mar 2026 | Invoice | 49733 | 1,193.96 | 49.87 |
| 17 Mar 2026 | Invoice | 49767 | 2,387.93 | 2,437.80 |
| 20 Mar 2026 | Invoice | 49849 | 1,193.96 | 3,631.76 |
| 23 Mar 2026 | Payment | 43752 | -1,193.96 | 2,437.80 |
| 23 Mar 2026 | Payment | 43752 | -2,387.93 | 49.87 |
| 23 Mar 2026 | Payment | 43752 | -1,193.96 | -1,144.09 |
| 28 Mar 2026 | Invoice | 49971 | 1,193.96 | 49.87 |
| 31 Mar 2026 | Invoice | 50015 | 2,387.93 | 2,437.80 |
| 31 Mar 2026 | Invoice | 50035 | 1,193.96 | 3,631.76 |
| 31 Mar 2026 | Crd Note | 14686 | -2,387.93 | 1,243.83 |

---

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **1,243.83** |
| 21 Apr 2026 | Payment | 44064 | -1,193.96 | 49.87 |

---

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **49.87** |
| 02 Jul 2026 | Invoice | 51542 | 2,783.99 | 2,833.86 |
| 15 Jul 2026 | Payment | 45199 | -2,783.99 | 49.87 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **49.87** |
| 20 Aug 2026 | Invoice | 52693 | 1,312.52 | 1,362.39 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs, now DB `debt_group='CYL'`-classified). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries.*

### March 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **0.00** |
| 06 Mar 2025 | Invoice | 41271 | 1,207.50 | 1,207.50 |
| 06 Mar 2025 | Crd Note | 12022 | -1,207.50 | 0.00 |
| 18 Mar 2025 | Invoice | 41589 | 2,415.00 | 2,415.00 |
| 19 Mar 2025 | Crd Note | 12093 | -2,415.00 | 0.00 |

---

### April 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **0.00** |
| 01 Apr 2025 | Invoice | 41893 | 1,897.50 | 1,897.50 |
| 04 Apr 2025 | Invoice | 42018 | 2,415.00 | 4,312.50 |
| 04 Apr 2025 | Crd Note | 12186 | -1,897.50 | 2,415.00 |
| 07 Apr 2025 | Crd Note | 12204 | -2,415.00 | 0.00 |
| 14 Apr 2025 | Invoice | 42250 | 1,207.50 | 1,207.50 |
| 14 Apr 2025 | Crd Note | 12271 | -1,207.50 | 0.00 |
| 16 Apr 2025 | Invoice | 42316 | 1,207.50 | 1,207.50 |
| 17 Apr 2025 | Crd Note | 12298 | -1,207.50 | 0.00 |
| 22 Apr 2025 | Invoice | 42428 | 3,105.00 | 3,105.00 |
| 22 Apr 2025 | Crd Note | 12321 | -3,105.00 | 0.00 |
| 26 Apr 2025 | Invoice | 42575 | 1,207.50 | 1,207.50 |
| 29 Apr 2025 | Crd Note | 12360 | -1,207.50 | 0.00 |

---

### May 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 May** | **Opening Balance** | — | | **0.00** |
| 03 May 2025 | Invoice | 42751 | 1,207.50 | 1,207.50 |
| 03 May 2025 | Crd Note | 12393 | -1,207.50 | 0.00 |
| 06 May 2025 | Invoice | 42840 | 2,415.00 | 2,415.00 |
| 06 May 2025 | Crd Note | 12426 | -2,415.00 | 0.00 |
| 10 May 2025 | Invoice | 42965 | 1,207.50 | 1,207.50 |
| 12 May 2025 | Crd Note | 12459 | -1,207.50 | 0.00 |
| 16 May 2025 | Invoice | 43134 | 1,207.50 | 1,207.50 |
| 19 May 2025 | Crd Note | 12516 | -1,207.50 | 0.00 |
| 24 May 2025 | Invoice | 43334 | 2,415.00 | 2,415.00 |
| 26 May 2025 | Invoice | 43365 | 1,897.50 | 4,312.50 |
| 26 May 2025 | Crd Note | 12565 | -2,415.00 | 1,897.50 |
| 26 May 2025 | Crd Note | 12567 | -1,725.00 | 172.50 |
| 29 May 2025 | Invoice | 43468 | 1,725.00 | 1,897.50 |
| 30 May 2025 | Crd Note | 12597 | -1,207.50 | 690.00 |

---

### June 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | | **690.00** |
| 07 Jun 2025 | Invoice | 43702 | 1,897.50 | 2,587.50 |
| 09 Jun 2025 | Crd Note | 12661 | -1,897.50 | 690.00 |
| 10 Jun 2025 | Invoice | 43763 | 3,105.00 | 3,795.00 |
| 11 Jun 2025 | Crd Note | 12683 | -3,105.00 | 690.00 |
| 17 Jun 2025 | Invoice | 43995 | 3,105.00 | 3,795.00 |
| 17 Jun 2025 | Crd Note | 12738 | -3,105.00 | 690.00 |
| 24 Jun 2025 | Invoice | 44199 | 2,415.00 | 3,105.00 |
| 25 Jun 2025 | Crd Note | 12813 | -2,415.00 | 690.00 |

---

### July 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **690.00** |
| 02 Jul 2025 | Invoice | 44448 | 2,415.00 | 3,105.00 |
| 02 Jul 2025 | Crd Note | 12883 | -1,897.50 | 1,207.50 |
| 09 Jul 2025 | Invoice | 44673 | 2,415.00 | 3,622.50 |
| 09 Jul 2025 | Crd Note | 12944 | -2,415.00 | 1,207.50 |
| 23 Jul 2025 | Invoice | 45066 | 3,105.00 | 4,312.50 |
| 23 Jul 2025 | Invoice | 45078 | 1,897.50 | 6,210.00 |
| 23 Jul 2025 | Crd Note | 13033 | -3,105.00 | 3,105.00 |
| 23 Jul 2025 | Crd Note | 13036 | -2,415.00 | 690.00 |

---

### August 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **690.00** |
| 02 Aug 2025 | Invoice | 45351 | 1,207.50 | 1,897.50 |
| 05 Aug 2025 | Crd Note | 13135 | -1,207.50 | 690.00 |
| 09 Aug 2025 | Invoice | 45537 | 1,207.50 | 1,897.50 |
| 09 Aug 2025 | Invoice | 45544 | 2,415.00 | 4,312.50 |
| 11 Aug 2025 | Crd Note | 13185 | -1,207.50 | 3,105.00 |
| 11 Aug 2025 | Crd Note | 13188 | -2,415.00 | 690.00 |
| 21 Aug 2025 | Invoice | 45793 | 2,415.00 | 3,105.00 |
| 21 Aug 2025 | Invoice | 45803 | 2,415.00 | 5,520.00 |
| 21 Aug 2025 | Crd Note | 13280 | -2,415.00 | 3,105.00 |
| 22 Aug 2025 | Crd Note | 13285 | -2,415.00 | 690.00 |

---

### September 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **690.00** |
| 02 Sept 2025 | Invoice | 46078 | 1,897.50 | 2,587.50 |
| 03 Sept 2025 | Crd Note | 13366 | -1,897.50 | 690.00 |
| 06 Sept 2025 | Invoice | 46192 | 3,105.00 | 3,795.00 |
| 06 Sept 2025 | Crd Note | 13405 | -3,105.00 | 690.00 |
| 11 Sept 2025 | Invoice | 46311 | 1,207.50 | 1,897.50 |
| 12 Sept 2025 | Crd Note | 13449 | -1,207.50 | 690.00 |
| 18 Sept 2025 | Invoice | 46477 | 1,207.50 | 1,897.50 |
| 18 Sept 2025 | Crd Note | 13502 | -1,207.50 | 690.00 |
| 19 Sept 2025 | Invoice | 46499 | 2,415.00 | 3,105.00 |
| 19 Sept 2025 | Crd Note | 13508 | -2,415.00 | 690.00 |
| 25 Sept 2025 | Invoice | 46655 | 1,207.50 | 1,897.50 |
| 25 Sept 2025 | Invoice | 46657 | 1,207.50 | 3,105.00 |
| 29 Sept 2025 | Invoice | 46730 | 1,207.50 | 4,312.50 |
| 29 Sept 2025 | Crd Note | 13561 | -1,207.50 | 3,105.00 |
| 29 Sept 2025 | Crd Note | 13563 | -1,207.50 | 1,897.50 |
| 29 Sept 2025 | Crd Note | 13571 | -1,207.50 | 690.00 |

---

### October 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **690.00** |
| 04 Oct 2025 | Invoice | 46883 | 1,207.50 | 1,897.50 |
| 04 Oct 2025 | Crd Note | 13639 | -1,207.50 | 690.00 |
| 08 Oct 2025 | Invoice | 46969 | 3,105.00 | 3,795.00 |
| 09 Oct 2025 | Invoice | 46985 | 1,897.50 | 5,692.50 |
| 09 Oct 2025 | Crd Note | 13645 | -3,105.00 | 2,587.50 |
| 09 Oct 2025 | Crd Note | 13653 | -1,897.50 | 690.00 |
| 20 Oct 2025 | Invoice | 47179 | 1,897.50 | 2,587.50 |
| 20 Oct 2025 | Crd Note | 13713 | -1,207.50 | 1,380.00 |
| 24 Oct 2025 | Invoice | 47286 | 2,415.00 | 3,795.00 |
| 24 Oct 2025 | Crd Note | 13743 | -2,415.00 | 1,380.00 |
| 30 Oct 2025 | Invoice | 47421 | 2,415.00 | 3,795.00 |
| 30 Oct 2025 | Invoice | 47430 | 3,622.50 | 7,417.50 |
| 30 Oct 2025 | Crd Note | 13780 | -3,622.50 | 3,795.00 |
| 30 Oct 2025 | Crd Note | 13781 | -3,105.00 | 690.00 |

---

### November 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **690.00** |
| 14 Nov 2025 | Invoice | 47663 | 3,105.00 | 3,795.00 |
| 14 Nov 2025 | Invoice | 47667 | 1,897.50 | 5,692.50 |
| 14 Nov 2025 | Crd Note | 13866 | -1,897.50 | 3,795.00 |
| 14 Nov 2025 | Crd Note | 13868 | -3,105.00 | 690.00 |
| 21 Nov 2025 | Invoice | 47839 | 1,207.50 | 1,897.50 |
| 21 Nov 2025 | Crd Note | 13926 | -1,207.50 | 690.00 |
| 25 Nov 2025 | Invoice | 47888 | 2,415.00 | 3,105.00 |
| 25 Nov 2025 | Crd Note | 13938 | -2,415.00 | 690.00 |
| 27 Nov 2025 | Invoice | 47942 | 1,207.50 | 1,897.50 |
| 27 Nov 2025 | Crd Note | 13953 | -1,207.50 | 690.00 |

---

### December 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **690.00** |
| 06 Dec 2025 | Invoice | 48131 | 1,207.50 | 1,897.50 |
| 08 Dec 2025 | Crd Note | 14023 | -1,207.50 | 690.00 |
| 10 Dec 2025 | Invoice | 48186 | 1,207.50 | 1,897.50 |
| 12 Dec 2025 | Crd Note | 14063 | -1,207.50 | 690.00 |
| 18 Dec 2025 | Invoice | 48352 | 1,897.50 | 2,587.50 |
| 18 Dec 2025 | Invoice | 48354 | 2,415.00 | 5,002.50 |
| 18 Dec 2025 | Crd Note | 14110 | -1,897.50 | 3,105.00 |
| 19 Dec 2025 | Crd Note | 14123 | -2,415.00 | 690.00 |
| 30 Dec 2025 | Invoice | 48539 | 1,207.50 | 1,897.50 |
| 30 Dec 2025 | Crd Note | 14183 | -1,207.50 | 690.00 |

---

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **690.00** |
| 08 Jan 2026 | Invoice | 48680 | 1,207.50 | 1,897.50 |
| 08 Jan 2026 | Crd Note | 14222 | -1,207.50 | 690.00 |
| 09 Jan 2026 | Invoice | 48698 | 2,415.00 | 3,105.00 |
| 09 Jan 2026 | Crd Note | 14240 | -1,207.50 | 1,897.50 |
| 12 Jan 2026 | Invoice | 48731 | 2,415.00 | 4,312.50 |
| 12 Jan 2026 | Crd Note | 14287 | -2,415.00 | 1,897.50 |
| 28 Jan 2026 | Invoice | 48972 | 1,207.50 | 3,105.00 |
| 28 Jan 2026 | Invoice | 48976 | 1,207.50 | 4,312.50 |
| 28 Jan 2026 | Invoice | 48980 | 1,207.50 | 5,520.00 |
| 28 Jan 2026 | Crd Note | 14340 | -1,207.50 | 4,312.50 |
| 28 Jan 2026 | Crd Note | 14345 | -1,207.50 | 3,105.00 |
| 28 Jan 2026 | Crd Note | 14347 | -2,415.00 | 690.00 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **690.00** |
| 05 Feb 2026 | Invoice | 49101 | 1,207.50 | 1,897.50 |
| 06 Feb 2026 | Crd Note | 14383 | -1,207.50 | 690.00 |
| 13 Feb 2026 | Invoice | 49229 | 2,415.00 | 3,105.00 |
| 13 Feb 2026 | Crd Note | 14425 | -2,415.00 | 690.00 |
| 16 Feb 2026 | Invoice | 49260 | 1,897.50 | 2,587.50 |
| 16 Feb 2026 | Crd Note | 14434 | -1,897.50 | 690.00 |
| 24 Feb 2026 | Invoice | 49398 | 1,897.50 | 2,587.50 |
| 25 Feb 2026 | Crd Note | 14485 | -1,897.50 | 690.00 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **690.00** |
| 05 Mar 2026 | Invoice | 49578 | 1,207.50 | 1,897.50 |
| 05 Mar 2026 | Crd Note | 14543 | -1,207.50 | 690.00 |
| 17 Mar 2026 | Invoice | 49770 | 2,415.00 | 3,105.00 |
| 17 Mar 2026 | Crd Note | 14603 | -2,415.00 | 690.00 |
| 20 Mar 2026 | Invoice | 49850 | 1,207.50 | 1,897.50 |
| 20 Mar 2026 | Crd Note | 14633 | -1,207.50 | 690.00 |
| 28 Mar 2026 | Invoice | 49972 | 1,207.50 | 1,897.50 |
| 30 Mar 2026 | Crd Note | 14678 | -1,207.50 | 690.00 |
| 31 Mar 2026 | Invoice | 50016 | 2,415.00 | 3,105.00 |
| 31 Mar 2026 | Crd Note | 14687 | -2,415.00 | 690.00 |

---

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **690.00** |
| 02 Jul 2026 | Invoice | 51543 | 2,415.00 | 3,105.00 |
| 02 Jul 2026 | Crd Note | 15164 | -2,415.00 | 690.00 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **690.00** |
| 20 Aug 2026 | Invoice | 52694 | 1,207.50 | 1,897.50 |
| 20 Aug 2026 | Crd Note | 15518 | -1,207.50 | 690.00 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas | 1,362.39 |
| Part 1B — CYL Deposits | 690.00 |
| **Combined (1A + 1B)** | **2,052.39** |
| ERP `CURRENT BALANCE` (TXT header) | 2,052.39 |
| **Variance (Combined − ERP)** | **0.00** |

---

## Ingest Gate

*No `{DEBTOR}_INGEST_COVERAGE_*.json` report found for TAN002. Custody figures below are DB-backed (real `vw_clean_transactions` query) but have not been cross-checked against `npm run debtors:ingest-check` TXT/DB document-coverage gates. Run that check before treating Part 2 as gate-cleared.*

---

## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)
*Cylinders tracked by physical count (DB `vw_clean_transactions`, `debt_group='CYL'`, deduped on `(doc_no, entry_type, stock_no, debt_group, line_total, qty)`). Opening balances per `config/statement_v5.json` (see §0 caveat).*

### March 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| 06 Mar 2025 | Invoice | 41271 | 0 | 0 | 0 | 0 | +1 |
| 06 Mar 2025 | Crd Note | 12022 | 0 | 0 | 0 | 0 | -1 |
| 18 Mar 2025 | Invoice | 41589 | 0 | 0 | 0 | 0 | +2 |
| 19 Mar 2025 | Crd Note | 12093 | 0 | 0 | 0 | 0 | -2 |
| **End Mar** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### April 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| 01 Apr 2025 | Invoice | 41893 | 0 | +1 | 0 | 0 | +1 |
| 04 Apr 2025 | Invoice | 42018 | 0 | 0 | 0 | 0 | +2 |
| 04 Apr 2025 | Crd Note | 12186 | 0 | -1 | 0 | 0 | -1 |
| 07 Apr 2025 | Crd Note | 12204 | 0 | 0 | 0 | 0 | -2 |
| 14 Apr 2025 | Invoice | 42250 | 0 | 0 | 0 | 0 | +1 |
| 14 Apr 2025 | Crd Note | 12271 | 0 | 0 | 0 | 0 | -1 |
| 16 Apr 2025 | Invoice | 42316 | 0 | 0 | 0 | 0 | +1 |
| 17 Apr 2025 | Crd Note | 12298 | 0 | 0 | 0 | 0 | -1 |
| 22 Apr 2025 | Invoice | 42428 | 0 | +1 | 0 | 0 | +2 |
| 22 Apr 2025 | Crd Note | 12321 | 0 | -1 | 0 | 0 | -2 |
| 26 Apr 2025 | Invoice | 42575 | 0 | 0 | 0 | 0 | +1 |
| 29 Apr 2025 | Crd Note | 12360 | 0 | 0 | 0 | 0 | -1 |
| **End Apr** | **Closing Balance** | — | **0** | **0** | **0** | **0** | **0** |

---

### May 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 May** | **Opening Balance** | — | **0** | **0** | **0** | **0** | **0** |
| 03 May 2025 | Invoice | 42751 | 0 | 0 | 0 | 0 | +1 |
| 03 May 2025 | Crd Note | 12393 | 0 | 0 | 0 | 0 | -1 |
| 06 May 2025 | Invoice | 42840 | 0 | 0 | 0 | 0 | +2 |
| 06 May 2025 | Crd Note | 12426 | 0 | 0 | 0 | 0 | -2 |
| 10 May 2025 | Invoice | 42965 | 0 | 0 | 0 | 0 | +1 |
| 12 May 2025 | Crd Note | 12459 | 0 | 0 | 0 | 0 | -1 |
| 16 May 2025 | Invoice | 43134 | 0 | 0 | 0 | 0 | +1 |
| 19 May 2025 | Crd Note | 12516 | 0 | 0 | 0 | 0 | -1 |
| 24 May 2025 | Invoice | 43334 | 0 | 0 | 0 | 0 | +2 |
| 26 May 2025 | Invoice | 43365 | 0 | +1 | 0 | 0 | +1 |
| 26 May 2025 | Crd Note | 12565 | 0 | 0 | 0 | 0 | -2 |
| 26 May 2025 | Crd Note | 12567 | 0 | 0 | -1 | 0 | -1 |
| 29 May 2025 | Invoice | 43468 | 0 | 0 | +1 | 0 | +1 |
| 30 May 2025 | Crd Note | 12597 | 0 | 0 | 0 | 0 | -1 |
| **End May** | **Closing Balance** | — | **0** | **1** | **0** | **0** | **0** |

---

### June 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jun** | **Opening Balance** | — | **0** | **1** | **0** | **0** | **0** |
| 07 Jun 2025 | Invoice | 43702 | 0 | +1 | 0 | 0 | +1 |
| 09 Jun 2025 | Crd Note | 12661 | 0 | -1 | 0 | 0 | -1 |
| 10 Jun 2025 | Invoice | 43763 | 0 | +1 | 0 | 0 | +2 |
| 11 Jun 2025 | Crd Note | 12683 | 0 | -1 | 0 | 0 | -2 |
| 17 Jun 2025 | Invoice | 43995 | 0 | +1 | 0 | 0 | +2 |
| 17 Jun 2025 | Crd Note | 12738 | 0 | -1 | 0 | 0 | -2 |
| 24 Jun 2025 | Invoice | 44199 | 0 | 0 | 0 | 0 | +2 |
| 25 Jun 2025 | Crd Note | 12813 | 0 | 0 | 0 | 0 | -2 |
| **End Jun** | **Closing Balance** | — | **0** | **1** | **0** | **0** | **0** |

---

### July 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **0** | **1** | **0** | **0** | **0** |
| 02 Jul 2025 | Invoice | 44448 | 0 | 0 | 0 | 0 | +2 |
| 02 Jul 2025 | Crd Note | 12883 | 0 | -1 | 0 | 0 | -1 |
| 09 Jul 2025 | Invoice | 44673 | 0 | 0 | 0 | 0 | +2 |
| 09 Jul 2025 | Crd Note | 12944 | 0 | 0 | 0 | 0 | -2 |
| 23 Jul 2025 | Invoice | 45066 | 0 | +1 | 0 | 0 | +2 |
| 23 Jul 2025 | Invoice | 45078 | 0 | +1 | 0 | 0 | +1 |
| 23 Jul 2025 | Crd Note | 13033 | 0 | -1 | 0 | 0 | -2 |
| 23 Jul 2025 | Crd Note | 13036 | 0 | 0 | 0 | 0 | -1 |
| **End Jul** | **Closing Balance** | — | **0** | **1** | **0** | **0** | **1** |

---

### August 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **1** | **0** | **0** | **1** |
| 02 Aug 2025 | Invoice | 45351 | 0 | 0 | 0 | 0 | +1 |
| 05 Aug 2025 | Crd Note | 13135 | 0 | 0 | 0 | 0 | -1 |
| 09 Aug 2025 | Invoice | 45537 | 0 | 0 | 0 | 0 | +1 |
| 09 Aug 2025 | Invoice | 45544 | 0 | 0 | 0 | 0 | +2 |
| 11 Aug 2025 | Crd Note | 13185 | 0 | 0 | 0 | 0 | -1 |
| 11 Aug 2025 | Crd Note | 13188 | 0 | 0 | 0 | 0 | -2 |
| 21 Aug 2025 | Invoice | 45793 | 0 | 0 | 0 | 0 | +2 |
| 21 Aug 2025 | Invoice | 45803 | 0 | 0 | 0 | 0 | +2 |
| 21 Aug 2025 | Crd Note | 13280 | 0 | 0 | 0 | 0 | -2 |
| 22 Aug 2025 | Crd Note | 13285 | 0 | 0 | 0 | 0 | -2 |
| **End Aug** | **Closing Balance** | — | **0** | **1** | **0** | **0** | **1** |

---

### September 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | **0** | **1** | **0** | **0** | **1** |
| 02 Sept 2025 | Invoice | 46078 | 0 | +1 | 0 | 0 | +1 |
| 03 Sept 2025 | Crd Note | 13366 | 0 | -1 | 0 | 0 | -1 |
| 06 Sept 2025 | Invoice | 46192 | 0 | +1 | 0 | 0 | +2 |
| 06 Sept 2025 | Crd Note | 13405 | 0 | -1 | 0 | 0 | -2 |
| 11 Sept 2025 | Invoice | 46311 | 0 | 0 | 0 | 0 | +1 |
| 12 Sept 2025 | Crd Note | 13449 | 0 | 0 | 0 | 0 | -1 |
| 18 Sept 2025 | Invoice | 46477 | 0 | 0 | 0 | 0 | +1 |
| 18 Sept 2025 | Crd Note | 13502 | 0 | 0 | 0 | 0 | -1 |
| 19 Sept 2025 | Invoice | 46499 | 0 | 0 | 0 | 0 | +2 |
| 19 Sept 2025 | Crd Note | 13508 | 0 | 0 | 0 | 0 | -2 |
| 25 Sept 2025 | Invoice | 46655 | 0 | 0 | 0 | 0 | +1 |
| 25 Sept 2025 | Invoice | 46657 | 0 | 0 | 0 | 0 | +1 |
| 29 Sept 2025 | Invoice | 46730 | 0 | 0 | 0 | 0 | +1 |
| 29 Sept 2025 | Crd Note | 13561 | 0 | 0 | 0 | 0 | -1 |
| 29 Sept 2025 | Crd Note | 13563 | 0 | 0 | 0 | 0 | -1 |
| 29 Sept 2025 | Crd Note | 13571 | 0 | 0 | 0 | 0 | -1 |
| **End Sep** | **Closing Balance** | — | **0** | **1** | **0** | **0** | **1** |

---

### October 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | **0** | **1** | **0** | **0** | **1** |
| 04 Oct 2025 | Invoice | 46883 | 0 | 0 | 0 | 0 | +1 |
| 04 Oct 2025 | Crd Note | 13639 | 0 | 0 | 0 | 0 | -1 |
| 08 Oct 2025 | Invoice | 46969 | 0 | +1 | 0 | 0 | +2 |
| 09 Oct 2025 | Invoice | 46985 | 0 | +1 | 0 | 0 | +1 |
| 09 Oct 2025 | Crd Note | 13645 | 0 | -1 | 0 | 0 | -2 |
| 09 Oct 2025 | Crd Note | 13653 | 0 | -1 | 0 | 0 | -1 |
| 20 Oct 2025 | Invoice | 47179 | 0 | +1 | 0 | 0 | +1 |
| 20 Oct 2025 | Crd Note | 13713 | 0 | 0 | 0 | 0 | -1 |
| 24 Oct 2025 | Invoice | 47286 | 0 | 0 | 0 | 0 | +2 |
| 24 Oct 2025 | Crd Note | 13743 | 0 | 0 | 0 | 0 | -2 |
| 30 Oct 2025 | Invoice | 47421 | 0 | 0 | 0 | 0 | +2 |
| 30 Oct 2025 | Invoice | 47430 | 0 | 0 | 0 | 0 | +3 |
| 30 Oct 2025 | Crd Note | 13780 | 0 | 0 | 0 | 0 | -3 |
| 30 Oct 2025 | Crd Note | 13781 | 0 | -1 | 0 | 0 | -2 |
| **End Oct** | **Closing Balance** | — | **0** | **1** | **0** | **0** | **1** |

---

### November 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | **0** | **1** | **0** | **0** | **1** |
| 14 Nov 2025 | Invoice | 47663 | 0 | +1 | 0 | 0 | +2 |
| 14 Nov 2025 | Invoice | 47667 | 0 | +1 | 0 | 0 | +1 |
| 14 Nov 2025 | Crd Note | 13866 | 0 | -1 | 0 | 0 | -1 |
| 14 Nov 2025 | Crd Note | 13868 | 0 | -1 | 0 | 0 | -2 |
| 21 Nov 2025 | Invoice | 47839 | 0 | 0 | 0 | 0 | +1 |
| 21 Nov 2025 | Crd Note | 13926 | 0 | 0 | 0 | 0 | -1 |
| 25 Nov 2025 | Invoice | 47888 | 0 | 0 | 0 | 0 | +2 |
| 25 Nov 2025 | Crd Note | 13938 | 0 | 0 | 0 | 0 | -2 |
| 27 Nov 2025 | Invoice | 47942 | 0 | 0 | 0 | 0 | +1 |
| 27 Nov 2025 | Crd Note | 13953 | 0 | 0 | 0 | 0 | -1 |
| **End Nov** | **Closing Balance** | — | **0** | **1** | **0** | **0** | **1** |

---

### December 2025
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | **0** | **1** | **0** | **0** | **1** |
| 06 Dec 2025 | Invoice | 48131 | 0 | 0 | 0 | 0 | +1 |
| 08 Dec 2025 | Crd Note | 14023 | 0 | 0 | 0 | 0 | -1 |
| 10 Dec 2025 | Invoice | 48186 | 0 | 0 | 0 | 0 | +1 |
| 12 Dec 2025 | Crd Note | 14063 | 0 | 0 | 0 | 0 | -1 |
| 18 Dec 2025 | Invoice | 48352 | 0 | +1 | 0 | 0 | +1 |
| 18 Dec 2025 | Invoice | 48354 | 0 | 0 | 0 | 0 | +2 |
| 18 Dec 2025 | Crd Note | 14110 | 0 | -1 | 0 | 0 | -1 |
| 19 Dec 2025 | Crd Note | 14123 | 0 | 0 | 0 | 0 | -2 |
| 30 Dec 2025 | Invoice | 48539 | 0 | 0 | 0 | 0 | +1 |
| 30 Dec 2025 | Crd Note | 14183 | 0 | 0 | 0 | 0 | -1 |
| **End Dec** | **Closing Balance** | — | **0** | **1** | **0** | **0** | **1** |

---

### January 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | **0** | **1** | **0** | **0** | **1** |
| 08 Jan 2026 | Invoice | 48680 | 0 | 0 | 0 | 0 | +1 |
| 08 Jan 2026 | Crd Note | 14222 | 0 | 0 | 0 | 0 | -1 |
| 09 Jan 2026 | Invoice | 48698 | 0 | 0 | 0 | 0 | +2 |
| 09 Jan 2026 | Crd Note | 14240 | 0 | 0 | 0 | 0 | -1 |
| 12 Jan 2026 | Invoice | 48731 | 0 | 0 | 0 | 0 | +2 |
| 12 Jan 2026 | Crd Note | 14287 | 0 | 0 | 0 | 0 | -2 |
| 28 Jan 2026 | Invoice | 48972 | 0 | 0 | 0 | 0 | +1 |
| 28 Jan 2026 | Invoice | 48976 | 0 | 0 | 0 | 0 | +1 |
| 28 Jan 2026 | Invoice | 48980 | 0 | 0 | 0 | 0 | +1 |
| 28 Jan 2026 | Crd Note | 14340 | 0 | 0 | 0 | 0 | -1 |
| 28 Jan 2026 | Crd Note | 14345 | 0 | 0 | 0 | 0 | -1 |
| 28 Jan 2026 | Crd Note | 14347 | 0 | 0 | 0 | 0 | -2 |
| **End Jan** | **Closing Balance** | — | **0** | **1** | **0** | **0** | **1** |

---

### February 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | **0** | **1** | **0** | **0** | **1** |
| 05 Feb 2026 | Invoice | 49101 | 0 | 0 | 0 | 0 | +1 |
| 06 Feb 2026 | Crd Note | 14383 | 0 | 0 | 0 | 0 | -1 |
| 13 Feb 2026 | Invoice | 49229 | 0 | 0 | 0 | 0 | +2 |
| 13 Feb 2026 | Crd Note | 14425 | 0 | 0 | 0 | 0 | -2 |
| 16 Feb 2026 | Invoice | 49260 | 0 | +1 | 0 | 0 | +1 |
| 16 Feb 2026 | Crd Note | 14434 | 0 | -1 | 0 | 0 | -1 |
| 24 Feb 2026 | Invoice | 49398 | 0 | +1 | 0 | 0 | +1 |
| 25 Feb 2026 | Crd Note | 14485 | 0 | -1 | 0 | 0 | -1 |
| **End Feb** | **Closing Balance** | — | **0** | **1** | **0** | **0** | **1** |

---

### March 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | **0** | **1** | **0** | **0** | **1** |
| 05 Mar 2026 | Invoice | 49578 | 0 | 0 | 0 | 0 | +1 |
| 05 Mar 2026 | Crd Note | 14543 | 0 | 0 | 0 | 0 | -1 |
| 17 Mar 2026 | Invoice | 49770 | 0 | 0 | 0 | 0 | +2 |
| 17 Mar 2026 | Crd Note | 14603 | 0 | 0 | 0 | 0 | -2 |
| 20 Mar 2026 | Invoice | 49850 | 0 | 0 | 0 | 0 | +1 |
| 20 Mar 2026 | Crd Note | 14633 | 0 | 0 | 0 | 0 | -1 |
| 28 Mar 2026 | Invoice | 49972 | 0 | 0 | 0 | 0 | +1 |
| 30 Mar 2026 | Crd Note | 14678 | 0 | 0 | 0 | 0 | -1 |
| 31 Mar 2026 | Invoice | 50016 | 0 | 0 | 0 | 0 | +2 |
| 31 Mar 2026 | Crd Note | 14687 | 0 | 0 | 0 | 0 | -2 |
| **End Mar** | **Closing Balance** | — | **0** | **1** | **0** | **0** | **1** |

---

### July 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | **0** | **1** | **0** | **0** | **1** |
| 02 Jul 2026 | Invoice | 51543 | 0 | 0 | 0 | 0 | +2 |
| 02 Jul 2026 | Crd Note | 15164 | 0 | 0 | 0 | 0 | -2 |
| **End Jul** | **Closing Balance** | — | **0** | **1** | **0** | **0** | **1** |

---

### August 2026
| Date | Entry Type | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |
| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | **0** | **1** | **0** | **0** | **1** |
| 20 Aug 2026 | Invoice | 52694 | 0 | 0 | 0 | 0 | +1 |
| 20 Aug 2026 | Crd Note | 15518 | 0 | 0 | 0 | 0 | -1 |
| **End Aug** | **Closing Balance** | — | **0** | **1** | **0** | **0** | **1** |

---

<!-- INTERNAL_ONLY_START -->
<!-- DEBTOR_POSITION_WORKSPACE_START -->

## Debtor Position Summary

### 1. Financial Position

| Component | Amount |
|---|---:|
| LPG Gas Debt (Part 1A close) | R1,362.39 |
| Cylinder Financial Balance (Part 1B close) | R690.00 |
| **Total Debtor Balance** | **R2,052.39** |

### 2. Custody Position

| SKU | Net Returnable Qty | Deposit Rate | Custody Exposure |
|---|---:|---:|---:|
| 19kg | 1 | R690.00 | R690.00 |
| S.1 | 1 | R1,150.00 | R1,150.00 |
| **Total** | **2** | — | **R1,840.00** |

### 3. Reconciliation Position

| Check | Financial | Custody | Variance |
|---|---:|---:|---:|
| Cylinder Position (1B vs custody) | R690.00 | R1,840.00 | R-1,150.00 |
| Sub-ledger tie (1A + 1B vs combined) | R2,052.39 | — | R0.00 |

**ERP Combined Balance (TXT header):** R2,052.39
**Reconstructed Balance (1A + 1B):** R2,052.39
**Variance:** R0.00

**Open exception:** Part 1B (CYL financial, R690.00) does not tie to
Part 2 custody exposure (R1,840.00) — variance
R-1,150.00. Two cylinders are shown as physically outstanding
(1× 19kg, 1× S.1) worth R1,840.00 in deposit terms, while
the CYL financial sub-ledger only carries R690.00 of that as debt.
**ASSERTED, not resolved**: consistent with the account's known invoice/CN
self-cancelling pattern (`TAN002_Credit_Note_Reconciliation_2026-09-22.md`)
occasionally leaving a document's CN unmatched or a genuine physical
cylinder not yet returned or invoiced. Needs an operator/stocktake check,
not further TXT/DB analysis — this is a StatementException per
`debtorWorkspace.ts`, type `CUSTODY`, status `open`.

<!-- DEBTOR_POSITION_WORKSPACE_END -->
<!-- INTERNAL_ONLY_END -->
