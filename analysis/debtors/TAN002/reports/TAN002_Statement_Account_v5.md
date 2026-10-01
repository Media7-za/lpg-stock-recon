# Statement of Account: TANDOOR THE CLAY OVEN (TAN002) - Version 5 (Sub-Ledger Position Statement)
**Period:** Feb 2025 → Aug 2026 &nbsp;|&nbsp; **Account:** TAN002
**Combined Opening B/F:** R16,828.85 (ERP verified, PROVEN — source: `analysis/debtors/TAN002/raw/TAN002CURRENT.TXT`, chain-verified per `reports/TAN002_Statement_Chain_2026-09-21.md`)
**LPG Opening B/F (1A) / CYL Opening B/F (1B):** R16,828.85 / R0.00 — **UNVERIFIED PLACEHOLDER SPLIT** (see §0 below)
**Payment routing:** LPG lane (payments post to Part 1A unless configured otherwise)
**Last regenerated:** 2026-09-21 — **manually reproduced**, not run via `reconcile_debtor_v5_from_txt.mjs` (see §0)

---

## §0 — How this statement was produced (read this first)

The canonical generator, `analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs`,
**could not be run this session**: it requires both the `pg` npm package
(`node_modules` is not installed in this checkout) and a live `DATABASE_URL`
(unset). Both are hard requirements — the script calls `client.connect()`
unconditionally before producing any output.

What follows was instead produced by a **standalone, read-only reproduction**
of the generator's own pure-JS parsing/splitting logic
(`parseTxtRows`, `splitRowAmount`, `buildLaneSections`, `buildPart1Split` —
copied verbatim, no DB calls), run against `raw/TAN002CURRENT.TXT` and
`config/statement_v5.json`. This is **not** an approximation of the
generator's behavior — it is the exact code path the generator itself takes
when `fetchDocLineSplit` (its one DB call for Part 1) returns nothing: each
Invoice/Crd Note line is classified LPG vs CYL purely by regex on the
`REFERENCE` field (`-EMPTY`/`EMPTIES` → CYL), same as the generator's own
documented fallback.

**What this means for trust:**

| Section | Status | Why |
| :--- | :--- | :--- |
| Part 1 Combined Bridge (1A+1B vs ERP header) | **PROVEN** | Independent of the LPG/CYL split point — see chain report |
| Part 1A / Part 1B split (which lane each line falls in) | **ASSERTED** | REFERENCE-regex classification only; DB-backed `vw_clean_transactions.debt_group` (used by the real generator when available) can differ on mixed-line documents |
| Part 1A / Part 1B **opening** B/F split (R16,828.85 / R0.00) | **UNVERIFIED PLACEHOLDER** | No DB-backed historical split exists for TAN002; cfg.cylOpeningFinancial defaults to R0.00 — see `config/statement_v5.json` notes |
| Part 2 (physical cylinder custody) | **NOT COMPUTED** | Requires DB — not attempted, not guessed |
| Ingest gate (DB vs TXT coverage) | **NOT COMPUTED** | Requires DB — `validate_txt_db_coverage.mjs` not run |

**One figure survives the placeholder uncertainty:** net CYL-lane movement
for the whole period sums to **R0.00** —
this is a property of the period's transactions alone, not of the assumed
opening split. So whatever TAN002's true CYL opening balance is, its true
CYL closing balance today equals that same figure. Only the *opening* value
is unknown.

**Do not treat Part 1A/1B closing balances below as PROVEN.** Rerun via the
real generator once `DATABASE_URL` and `node_modules` are available, and
once `config/statement_v5.json`'s `cylOpeningFinancial`/`cylOpeningQty`
placeholders are replaced with an established figure.

---

## Part 1A: LPG Gas Financial Statement
*Gas fill invoices, credit notes, and payments since Feb 2025. Payments route to this sub-ledger per debtor config (`paymentLane: LPG`). Classification: TXT REFERENCE-regex fallback — ASSERTED, not DB-verified.*

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
| 23 Jul 2025 | Invoice | 45066 | 3,105.00 | 26,353.37 |
| 23 Jul 2025 | Invoice | 45067 | 1,765.18 | 28,118.55 |
| 23 Jul 2025 | Invoice | 45078 | 1,897.50 | 30,016.05 |
| 23 Jul 2025 | Crd Note | 13033 | -3,105.00 | 26,911.05 |
| 23 Jul 2025 | Crd Note | 13036 | -2,415.00 | 24,496.05 |

---

### August 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **24,496.05** |
| 02 Aug 2025 | Invoice | 45350 | 1,264.61 | 25,760.66 |
| 02 Aug 2025 | Invoice | 45351 | 1,207.50 | 26,968.16 |
| 05 Aug 2025 | Crd Note | 13135 | -1,207.50 | 25,760.66 |
| 09 Aug 2025 | Invoice | 45536 | 1,264.61 | 27,025.27 |
| 09 Aug 2025 | Invoice | 45543 | 2,529.22 | 29,554.49 |
| 15 Aug 2025 | Payment | 40610 | -265.26 | 29,289.23 |
| 15 Aug 2025 | Payment | 40610 | -232.11 | 29,057.12 |
| 15 Aug 2025 | Payment | 40610 | -2,529.22 | 26,527.90 |
| 15 Aug 2025 | Payment | 40610 | -3,029.79 | 23,498.11 |
| 15 Aug 2025 | Payment | 40610 | -1,765.18 | 21,732.93 |
| 15 Aug 2025 | Payment | 40610 | -1,264.61 | 20,468.32 |
| 15 Aug 2025 | Payment | 40610 | -1,264.61 | 19,203.71 |
| 15 Aug 2025 | Payment | 40610 | -2,529.22 | 16,674.49 |
| 21 Aug 2025 | Invoice | 45792 | 2,471.81 | 19,146.30 |
| 21 Aug 2025 | Invoice | 45802 | 2,471.81 | 21,618.11 |
| 23 Aug 2025 | Payment | 40718 | -513.17 | 21,104.94 |
| 23 Aug 2025 | Payment | 40718 | -1,573.87 | 19,531.07 |
| 23 Aug 2025 | Payment | 40718 | -1,849.98 | 17,681.09 |
| 23 Aug 2025 | Payment | 40718 | -3,175.35 | 14,505.74 |
| 23 Aug 2025 | Payment | 40718 | -2,576.80 | 11,928.94 |
| 23 Aug 2025 | Payment | 40718 | -2,576.80 | 9,352.14 |
| 23 Aug 2025 | Payment | 40718 | -2,529.22 | 6,822.92 |
| 23 Aug 2025 | Payment | 40718 | -690.00 | 6,132.92 |
| 23 Aug 2025 | Payment | 40718 | 1,207.50 | 7,340.42 |
| 23 Aug 2025 | Payment | 40718 | -517.50 | 6,822.92 |
| 23 Aug 2025 | Payment | 40718 | -0.36 | 6,822.56 |
| 23 Aug 2025 | Payment | 40718 | -690.00 | 6,132.56 |
| 23 Aug 2025 | Payment | 40718 | -721.95 | 5,410.61 |
| 23 Aug 2025 | Payment | 40718 | 1,207.50 | 6,618.11 |

---

### September 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **6,618.11** |
| 02 Sept 2025 | Invoice | 46077 | 1,725.12 | 8,343.23 |
| 06 Sept 2025 | Invoice | 46191 | 2,828.41 | 11,171.64 |
| 11 Sept 2025 | Invoice | 46310 | 1,180.56 | 12,352.20 |
| 18 Sept 2025 | Payment | 41252 | -3,086.80 | 9,265.40 |
| 18 Sept 2025 | Payment | 41252 | -2,471.81 | 6,793.59 |
| 18 Sept 2025 | Payment | 41252 | -2,471.81 | 4,321.78 |
| 18 Sept 2025 | Payment | 41252 | -1,725.12 | 2,596.66 |
| 18 Sept 2025 | Payment | 41252 | -2,828.41 | -231.75 |
| 18 Sept 2025 | Payment | 41252 | -1,180.56 | -1,412.31 |
| 18 Sept 2025 | Invoice | 46476 | 1,180.56 | -231.75 |
| 19 Sept 2025 | Invoice | 46498 | 2,361.11 | 2,129.36 |
| 20 Sept 2025 | Payment | 41261 | -1,180.56 | 948.80 |
| 20 Sept 2025 | Payment | 41261 | -2,361.11 | -1,412.31 |
| 25 Sept 2025 | Invoice | 46654 | 1,180.56 | -231.75 |
| 25 Sept 2025 | Invoice | 46656 | 1,180.56 | 948.81 |
| 29 Sept 2025 | Invoice | 46729 | 1,180.56 | 2,129.37 |
| 29 Sept 2025 | Crd Note | 13562 | -1,180.56 | 948.81 |
| 30 Sept 2025 | Payment | 41474 | -1,180.56 | -231.75 |
| 30 Sept 2025 | Payment | 41474 | -1,180.56 | -1,412.31 |

---

### October 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **-1,412.31** |
| 04 Oct 2025 | Invoice | 46882 | 1,180.56 | -231.75 |
| 08 Oct 2025 | Invoice | 46968 | 2,828.41 | 2,596.66 |
| 09 Oct 2025 | Invoice | 46984 | 1,647.86 | 4,244.52 |
| 13 Oct 2025 | Payment | 41629 | -2,828.41 | 1,416.11 |
| 13 Oct 2025 | Payment | 41629 | -1,647.86 | -231.75 |
| 13 Oct 2025 | Payment | 41630 | -1,180.56 | -1,412.31 |
| 20 Oct 2025 | Invoice | 47178 | 1,647.86 | 235.55 |
| 24 Oct 2025 | Invoice | 47285 | 2,361.11 | 2,596.66 |
| 27 Oct 2025 | Payment | 41964 | -1,647.86 | 948.80 |
| 27 Oct 2025 | Payment | 41964 | -2,361.11 | -1,412.31 |
| 27 Oct 2025 | Payment | 41964 | -210.88 | -1,623.19 |
| 27 Oct 2025 | Payment | 41964 | -38.76 | -1,661.95 |
| 30 Oct 2025 | Invoice | 47420 | 2,361.11 | 699.16 |

---

### November 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **699.16** |
| 14 Nov 2025 | Invoice | 47662 | 2,770.91 | 3,470.07 |
| 14 Nov 2025 | Invoice | 47666 | 1,614.36 | 5,084.43 |
| 18 Nov 2025 | Payment | 42300 | -2,361.11 | 2,723.32 |
| 18 Nov 2025 | Payment | 42300 | -2,770.91 | -47.59 |
| 18 Nov 2025 | Payment | 42300 | -1,614.00 | -1,661.59 |
| 21 Nov 2025 | Invoice | 47838 | 1,156.56 | -505.03 |
| 25 Nov 2025 | Invoice | 47887 | 2,313.11 | 1,808.08 |
| 26 Nov 2025 | Payment | 42421 | -1,156.56 | 651.52 |
| 26 Nov 2025 | Payment | 42421 | -2,313.11 | -1,661.59 |
| 27 Nov 2025 | Invoice | 47941 | 1,156.56 | -505.03 |

---

### December 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **-505.03** |
| 06 Dec 2025 | Invoice | 48130 | 1,156.56 | 651.53 |
| 08 Dec 2025 | Payment | 42543 | -1,156.56 | -505.03 |
| 08 Dec 2025 | Payment | 42543 | -1,156.56 | -1,661.59 |
| 10 Dec 2025 | Invoice | 48185 | 1,162.63 | -498.96 |
| 13 Dec 2025 | Payment | 42611 | -1,162.63 | -1,661.59 |
| 18 Dec 2025 | Invoice | 48351 | 1,622.83 | -38.76 |
| 18 Dec 2025 | Invoice | 48353 | 2,325.25 | 2,286.49 |
| 30 Dec 2025 | Invoice | 48538 | 1,162.63 | 3,449.12 |

---

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **3,449.12** |
| 07 Jan 2026 | Invoice | 48645 | 2,325.25 | 5,774.37 |
| 07 Jan 2026 | Invoice | 48646 | 1,162.63 | 6,937.00 |
| 07 Jan 2026 | Crd Note | 14218 | -2,325.25 | 4,611.75 |
| 09 Jan 2026 | Invoice | 48693 | 2,325.25 | 6,937.00 |
| 09 Jan 2026 | Invoice | 48698 | 2,415.00 | 9,352.00 |
| 09 Jan 2026 | Invoice | 48722 | 1,162.63 | 10,514.63 |
| 09 Jan 2026 | Crd Note | 14235 | -1,162.63 | 9,352.00 |
| 09 Jan 2026 | Crd Note | 14240 | -1,207.50 | 8,144.50 |
| 12 Jan 2026 | Invoice | 48730 | 2,325.25 | 10,469.75 |
| 20 Jan 2026 | Payment | 43067 | -2,286.49 | 8,183.26 |
| 20 Jan 2026 | Payment | 43067 | -1,162.63 | 7,020.63 |
| 20 Jan 2026 | Payment | 43067 | -1,162.63 | 5,858.00 |
| 20 Jan 2026 | Payment | 43067 | -1,162.62 | 4,695.38 |
| 20 Jan 2026 | Payment | 43067 | -1,207.50 | 3,487.88 |
| 20 Jan 2026 | Payment | 43067 | -1,162.63 | 2,325.25 |
| 20 Jan 2026 | Payment | 43067 | -2,325.25 | 0.00 |
| 20 Jan 2026 | Payment | 43067 | -454.09 | -454.09 |
| 28 Jan 2026 | Invoice | 48971 | 1,171.09 | 717.00 |
| 28 Jan 2026 | Invoice | 48975 | 1,171.09 | 1,888.09 |
| 28 Jan 2026 | Invoice | 48979 | 1,171.09 | 3,059.18 |
| 28 Jan 2026 | Crd Note | 14339 | -1,171.09 | 1,888.09 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **1,888.09** |
| 02 Feb 2026 | Payment | 43216 | -1,171.09 | 717.00 |
| 02 Feb 2026 | Payment | 43216 | -1,171.09 | -454.09 |
| 05 Feb 2026 | Invoice | 49100 | 1,171.09 | 717.00 |
| 13 Feb 2026 | Invoice | 49228 | 2,368.75 | 3,085.75 |
| 16 Feb 2026 | Invoice | 49259 | 1,653.19 | 4,738.94 |
| 18 Feb 2026 | Payment | 43373 | -1,171.09 | 3,567.85 |
| 18 Feb 2026 | Payment | 43373 | -2,368.75 | 1,199.10 |
| 18 Feb 2026 | Payment | 43373 | -1,653.19 | -454.09 |
| 21 Feb 2026 | Invoice | 49360 | 1,184.37 | 730.28 |
| 24 Feb 2026 | Invoice | 49397 | 1,653.19 | 2,383.47 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **2,383.47** |
| 05 Mar 2026 | Invoice | 49577 | 1,184.37 | 3,567.84 |
| 06 Mar 2026 | Payment | 43562 | -454.09 | 3,113.75 |
| 06 Mar 2026 | Payment | 43562 | -730.28 | 2,383.47 |
| 06 Mar 2026 | Payment | 43562 | -1,653.19 | 730.28 |
| 06 Mar 2026 | Payment | 43562 | -1,184.37 | -454.09 |
| 13 Mar 2026 | Invoice | 49733 | 1,193.96 | 739.87 |
| 17 Mar 2026 | Invoice | 49767 | 2,387.93 | 3,127.80 |
| 20 Mar 2026 | Invoice | 49849 | 1,193.96 | 4,321.76 |
| 23 Mar 2026 | Payment | 43752 | -1,193.96 | 3,127.80 |
| 23 Mar 2026 | Payment | 43752 | -2,387.93 | 739.87 |
| 23 Mar 2026 | Payment | 43752 | -1,193.96 | -454.09 |
| 28 Mar 2026 | Invoice | 49971 | 1,193.96 | 739.87 |
| 31 Mar 2026 | Invoice | 50015 | 2,387.93 | 3,127.80 |
| 31 Mar 2026 | Invoice | 50035 | 1,193.96 | 4,321.76 |
| 31 Mar 2026 | Crd Note | 14686 | -2,387.93 | 1,933.83 |

---

### April 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Apr** | **Opening Balance** | — | | **1,933.83** |
| 21 Apr 2026 | Payment | 44064 | -1,193.96 | 739.87 |

---

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **739.87** |
| 02 Jul 2026 | Invoice | 51542 | 2,783.99 | 3,523.86 |
| 15 Jul 2026 | Payment | 45199 | -2,783.99 | 739.87 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **739.87** |
| 20 Aug 2026 | Invoice | 52693 | 1,312.52 | 2,052.39 |

---

## Part 1B: Cylinder Deposit Financial Statement
*Cylinder deposit charges and reversals (`-EMPTY` / `EMPTIES` refs). Paired inv+CN rows remain visible; net-zero pairs are expected for standard deliveries. Classification: TXT REFERENCE-regex fallback — ASSERTED, not DB-verified.*

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

---

### August 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **1,207.50** |
| 09 Aug 2025 | Invoice | 45537 | 1,207.50 | 2,415.00 |
| 09 Aug 2025 | Invoice | 45544 | 2,415.00 | 4,830.00 |
| 11 Aug 2025 | Crd Note | 13185 | -1,207.50 | 3,622.50 |
| 11 Aug 2025 | Crd Note | 13188 | -2,415.00 | 1,207.50 |
| 21 Aug 2025 | Invoice | 45793 | 2,415.00 | 3,622.50 |
| 21 Aug 2025 | Invoice | 45803 | 2,415.00 | 6,037.50 |
| 21 Aug 2025 | Crd Note | 13280 | -2,415.00 | 3,622.50 |
| 22 Aug 2025 | Crd Note | 13285 | -2,415.00 | 1,207.50 |

---

### September 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Sep** | **Opening Balance** | — | | **1,207.50** |
| 02 Sept 2025 | Invoice | 46078 | 1,897.50 | 3,105.00 |
| 03 Sept 2025 | Crd Note | 13366 | -1,897.50 | 1,207.50 |
| 06 Sept 2025 | Invoice | 46192 | 3,105.00 | 4,312.50 |
| 06 Sept 2025 | Crd Note | 13405 | -3,105.00 | 1,207.50 |
| 11 Sept 2025 | Invoice | 46311 | 1,207.50 | 2,415.00 |
| 12 Sept 2025 | Crd Note | 13449 | -1,207.50 | 1,207.50 |
| 18 Sept 2025 | Invoice | 46477 | 1,207.50 | 2,415.00 |
| 18 Sept 2025 | Crd Note | 13502 | -1,207.50 | 1,207.50 |
| 19 Sept 2025 | Invoice | 46499 | 2,415.00 | 3,622.50 |
| 19 Sept 2025 | Crd Note | 13508 | -2,415.00 | 1,207.50 |
| 25 Sept 2025 | Invoice | 46655 | 1,207.50 | 2,415.00 |
| 25 Sept 2025 | Invoice | 46657 | 1,207.50 | 3,622.50 |
| 29 Sept 2025 | Invoice | 46730 | 1,207.50 | 4,830.00 |
| 29 Sept 2025 | Crd Note | 13561 | -1,207.50 | 3,622.50 |
| 29 Sept 2025 | Crd Note | 13563 | -1,207.50 | 2,415.00 |
| 29 Sept 2025 | Crd Note | 13571 | -1,207.50 | 1,207.50 |

---

### October 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Oct** | **Opening Balance** | — | | **1,207.50** |
| 04 Oct 2025 | Invoice | 46883 | 1,207.50 | 2,415.00 |
| 04 Oct 2025 | Crd Note | 13639 | -1,207.50 | 1,207.50 |
| 08 Oct 2025 | Invoice | 46969 | 3,105.00 | 4,312.50 |
| 09 Oct 2025 | Invoice | 46985 | 1,897.50 | 6,210.00 |
| 09 Oct 2025 | Crd Note | 13645 | -3,105.00 | 3,105.00 |
| 09 Oct 2025 | Crd Note | 13653 | -1,897.50 | 1,207.50 |
| 20 Oct 2025 | Invoice | 47179 | 1,897.50 | 3,105.00 |
| 20 Oct 2025 | Crd Note | 13713 | -1,207.50 | 1,897.50 |
| 24 Oct 2025 | Invoice | 47286 | 2,415.00 | 4,312.50 |
| 24 Oct 2025 | Crd Note | 13743 | -2,415.00 | 1,897.50 |
| 30 Oct 2025 | Invoice | 47421 | 2,415.00 | 4,312.50 |
| 30 Oct 2025 | Invoice | 47430 | 3,622.50 | 7,935.00 |
| 30 Oct 2025 | Crd Note | 13780 | -3,622.50 | 4,312.50 |
| 30 Oct 2025 | Crd Note | 13781 | -3,105.00 | 1,207.50 |

---

### November 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Nov** | **Opening Balance** | — | | **1,207.50** |
| 14 Nov 2025 | Invoice | 47663 | 3,105.00 | 4,312.50 |
| 14 Nov 2025 | Invoice | 47667 | 1,897.50 | 6,210.00 |
| 14 Nov 2025 | Crd Note | 13866 | -1,897.50 | 4,312.50 |
| 14 Nov 2025 | Crd Note | 13868 | -3,105.00 | 1,207.50 |
| 21 Nov 2025 | Invoice | 47839 | 1,207.50 | 2,415.00 |
| 21 Nov 2025 | Crd Note | 13926 | -1,207.50 | 1,207.50 |
| 25 Nov 2025 | Invoice | 47888 | 2,415.00 | 3,622.50 |
| 25 Nov 2025 | Crd Note | 13938 | -2,415.00 | 1,207.50 |
| 27 Nov 2025 | Invoice | 47942 | 1,207.50 | 2,415.00 |
| 27 Nov 2025 | Crd Note | 13953 | -1,207.50 | 1,207.50 |

---

### December 2025

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Dec** | **Opening Balance** | — | | **1,207.50** |
| 06 Dec 2025 | Invoice | 48131 | 1,207.50 | 2,415.00 |
| 08 Dec 2025 | Crd Note | 14023 | -1,207.50 | 1,207.50 |
| 10 Dec 2025 | Invoice | 48186 | 1,207.50 | 2,415.00 |
| 12 Dec 2025 | Crd Note | 14063 | -1,207.50 | 1,207.50 |
| 18 Dec 2025 | Invoice | 48352 | 1,897.50 | 3,105.00 |
| 18 Dec 2025 | Invoice | 48354 | 2,415.00 | 5,520.00 |
| 18 Dec 2025 | Crd Note | 14110 | -1,897.50 | 3,622.50 |
| 19 Dec 2025 | Crd Note | 14123 | -2,415.00 | 1,207.50 |
| 30 Dec 2025 | Invoice | 48539 | 1,207.50 | 2,415.00 |
| 30 Dec 2025 | Crd Note | 14183 | -1,207.50 | 1,207.50 |

---

### January 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jan** | **Opening Balance** | — | | **1,207.50** |
| 08 Jan 2026 | Invoice | 48680 | 1,207.50 | 2,415.00 |
| 08 Jan 2026 | Crd Note | 14222 | -1,207.50 | 1,207.50 |
| 12 Jan 2026 | Invoice | 48731 | 2,415.00 | 3,622.50 |
| 12 Jan 2026 | Crd Note | 14287 | -2,415.00 | 1,207.50 |
| 28 Jan 2026 | Invoice | 48972 | 1,207.50 | 2,415.00 |
| 28 Jan 2026 | Invoice | 48976 | 1,207.50 | 3,622.50 |
| 28 Jan 2026 | Invoice | 48980 | 1,207.50 | 4,830.00 |
| 28 Jan 2026 | Crd Note | 14340 | -1,207.50 | 3,622.50 |
| 28 Jan 2026 | Crd Note | 14345 | -1,207.50 | 2,415.00 |
| 28 Jan 2026 | Crd Note | 14347 | -2,415.00 | 0.00 |

---

### February 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Feb** | **Opening Balance** | — | | **0.00** |
| 05 Feb 2026 | Invoice | 49101 | 1,207.50 | 1,207.50 |
| 06 Feb 2026 | Crd Note | 14383 | -1,207.50 | 0.00 |
| 13 Feb 2026 | Invoice | 49229 | 2,415.00 | 2,415.00 |
| 13 Feb 2026 | Crd Note | 14425 | -2,415.00 | 0.00 |
| 16 Feb 2026 | Invoice | 49260 | 1,897.50 | 1,897.50 |
| 16 Feb 2026 | Crd Note | 14434 | -1,897.50 | 0.00 |
| 21 Feb 2026 | Invoice | 49361 | 1,184.37 | 1,184.37 |
| 23 Feb 2026 | Crd Note | 14472 | -1,184.37 | 0.00 |
| 24 Feb 2026 | Invoice | 49398 | 1,897.50 | 1,897.50 |
| 25 Feb 2026 | Crd Note | 14485 | -1,897.50 | 0.00 |

---

### March 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Mar** | **Opening Balance** | — | | **0.00** |
| 05 Mar 2026 | Invoice | 49578 | 1,207.50 | 1,207.50 |
| 05 Mar 2026 | Crd Note | 14543 | -1,207.50 | 0.00 |
| 17 Mar 2026 | Invoice | 49770 | 2,415.00 | 2,415.00 |
| 17 Mar 2026 | Crd Note | 14603 | -2,415.00 | 0.00 |
| 20 Mar 2026 | Invoice | 49850 | 1,207.50 | 1,207.50 |
| 20 Mar 2026 | Crd Note | 14633 | -1,207.50 | 0.00 |
| 28 Mar 2026 | Invoice | 49972 | 1,207.50 | 1,207.50 |
| 30 Mar 2026 | Crd Note | 14678 | -1,207.50 | 0.00 |
| 31 Mar 2026 | Invoice | 50016 | 2,415.00 | 2,415.00 |
| 31 Mar 2026 | Crd Note | 14687 | -2,415.00 | 0.00 |

---

### July 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Jul** | **Opening Balance** | — | | **0.00** |
| 02 Jul 2026 | Invoice | 51543 | 2,415.00 | 2,415.00 |
| 02 Jul 2026 | Crd Note | 15164 | -2,415.00 | 0.00 |

---

### August 2026

| Date | Entry Type | Doc # | Amount (R) | Running Bal (R) |
| :--- | :--- | :--- | ---: | ---: |
| **01 Aug** | **Opening Balance** | — | | **0.00** |
| 20 Aug 2026 | Invoice | 52694 | 1,207.50 | 1,207.50 |
| 20 Aug 2026 | Crd Note | 15518 | -1,207.50 | 0.00 |

---

## Part 1 — Reconciliation Bridge

| Component | Closing (R) |
| :--- | ---: |
| Part 1A — LPG Gas (ASSERTED split) | 2,052.39 |
| Part 1B — CYL Deposits (ASSERTED split) | 0.00 |
| **Combined (1A + 1B)** | **2,052.39** |
| ERP `CURRENT BALANCE` (TXT header) | 2,052.39 |
| **Variance (Combined − ERP)** | **0.00** |

The Combined figure and its zero variance against the ERP header are
**PROVEN** — this identity holds for *any* LPG/CYL split of the same total,
including the placeholder used here. It was independently re-derived here
from the row-level engine after already being confirmed by direct chain
recomputation in `reports/TAN002_Statement_Chain_2026-09-21.md`.

---

## Ingest Gate

*Not computed — `DATABASE_URL` unavailable this session. Treat as
`ingestBlockedScopes: ["custody", "sku_analysis", "allocation",
"financial_bridge_from_txt"]` per D19: absence is never clearance. Run
`npm run debtors:ingest-check -- --debtor TAN002` once DB access exists.*

---

## Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)

**BLOCKED — not computed.** Requires DB-backed `vw_clean_transactions`
(stock_no / qty per line) via `buildPart2`, and an established
`cylOpeningQty` baseline (currently an unverified all-zero placeholder in
`config/statement_v5.json`). Neither is available this session.

---

## Summary (with the caveats above)

| Component | Amount | Basis |
|---|---:|---|
| Combined Debtor Balance | R2,052.39 | **PROVEN** |
| — of which LPG Gas (Part 1A) | R2,052.39 | ASSERTED (regex split, unverified opening) |
| — of which Cylinder Deposits (Part 1B) | R0.00 | ASSERTED (regex split, unverified opening) |
| Physical cylinder custody exposure | — | NOT COMPUTED |
