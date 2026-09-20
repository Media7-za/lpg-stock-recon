# MD0003 — FY2025 Payment Pattern Analysis

**Fiscal year 01/03/2024 – 28/02/2025** (this ERP account runs a March–February fiscal year — confirmed via the unbroken B/F chain in `MD0003_Lifetime_Balance_Investigation_2026-09-17.md`; every `DEBENQ_[YEAR].TXT` archive closes in late Feb/early Mar). This is a **different window** from the existing `MD0003_2025_Payment_Pattern_Analysis.md`, which covers **calendar** 2025 (Jan–Dec).

**Generated:** 2026-09-20 | **Tolerance:** R5.00 | **Source:** `raw/Enquiry/DEBENQ_2025.TXT` (the FY2025 archive), cross-checked against `raw/Enquiry/DEBENQ_CURRENT.TXT` for post-window settlement and `raw/Remittances/MD0003_DETAILED_LEDGER.xls` (GAZ's independent AP ledger) where available.

> **Methodology note.** The real generator (`analysis/debtors/shared/scripts/payment_pattern_analysis.py`) requires `DATABASE_URL` and a `.venv_fam` Python environment — unavailable this session (confirmed: `ModuleNotFoundError: No module named 'pandas'`, no `DATABASE_URL`). This report was built by direct TXT reconstruction instead: LPG vs CYL classification uses the `-EMPTY`/`EMPTIES` text-reference heuristic (ASSERTED, not DB-verified — see `MD0003_Statement_Account_v5.md` for the known limitations of this approach), but the **payment-to-invoice matching itself is unusually strong for this period** — unlike the account's 2026 STAT batches, almost every FY2025 payment slice carries a real, verifiable `INVNO` tag, and every genuine FY2025-dated invoice tag checked matches its invoice amount to the cent (raw evidence in the working notes; spot-checkable against `DEBENQ_2025.TXT` directly).

---

## 1. Executive Summary

* **Total LPG Gas Billed (FY2025):** **R226,760.20** across 12 billing months (Mar 2024 – Feb 2025)
* **Confirmed cadence: 2-month payment lag, not 1-month.** Every month's LPG billing is paid by a STAT batch landing almost exactly 2 calendar months later (e.g. March 2024 invoices → STAT:103, posted 2 May 2024). This is the same cadence later observed in FY2026 (`MD0003_2026_Payment_Pattern_Analysis.md`) — it is a long-standing, established pattern for this account, not a recent change.
* **Genuine outstanding anomaly: R5,376.00, invoice 38939 (December 2024 billing month).** December's full LPG billing (R24,178.73 = invoices 38757 + 38918 + 38939 + 39277, net of their own credit notes) was due via STAT:112 (03/02/2025, within this fiscal year). STAT:112 paid R18,802.73 of it — invoice 38939 (R8,928.14 net) was only ever paid R3,552.14, leaving **R5,376.00 unpaid since December 2024**. This is the same shortfall already found and reported to the operator during this session's earlier "R12,263.61 gap" investigation — confirmed here as a genuine within-year underpayment, not a timing artifact. See §2.1.
* **Not anomalies — normal end-of-window pipeline:** January 2025 (R21,718.57) and February 2025 (R15,633.20) billing had not yet reached their 2-month due date when this fiscal year closed (due March and April 2025 respectively — both outside this window). Both are independently confirmed paid in full shortly after, per `MD0003_2025_Payment_Pattern_Analysis.md` (STAT:113, STAT:114). **Not skipped months** — flagging this explicitly because a prior report (`MD0003_2026_Payment_Pattern_Analysis.md`, before its 2026-09-20 correction) made exactly this mistake for a later fiscal-year boundary.
* **Two small untagged residuals remain unexplained:** R44.74 and R889.56, both on STAT:112 (03/02/2025). Already investigated with the operator this session — no remittance exists for this payment date, no exact-sum match found in the TXT or the AP ledger. Left flagged, not force-closed.
* **Portfolio-relevant finding: doc reference "48372" is reused as a placeholder/residual tag, not a genuine invoice link, for 19 months before it became a real invoice.** Payment slice tagging invno `48372` on STAT:103 (02/05/2024, −R629.74) predates invoice 48372's actual creation (19/12/2025, confirmed in this session's earlier investigation) by 19 months — chronologically impossible as a real link. It later, coincidentally, becomes the correct tag once that invoice number is genuinely reused (STAT:123, 02/02/2026).
* **CORRECTION 2026-09-20 (originally overstated in this report):** the other four "no matching FY2025 invoice" tags on STAT:103/STAT:107 — `12187`, `17143`, `21110`, `24010` — were wrongly grouped with 48372's placeholder-reuse pattern above. Checked against the older archives while building `MD0003_FY2024_Payment_Pattern_Analysis.md` (and one against `DEBENQ_2022.TXT`): all four are **real, legitimate invoices**, just much older than this fiscal year — normal old-debt cleanup, not a bug:
  * `12187` = R345.00, invoice 05/02/2022 (`DEBENQ_2022.TXT`, FY2022, "REFER TO INV12186")
  * `17143` = R1,196.00, invoice 31/12/2022 (`DEBENQ_2023.TXT`, FY2023, "D/N2943 EMPTIES")
  * `21110` = R598.00, invoice 08/06/2023 (`DEBENQ_2024.TXT`, FY2024, "D/N 5316 EMPTIES R") — this is the exact R598.00 net-open CYL residual on that invoice identified in the FY2024 report's §3
  * `24010` = R1,196.00 total, invoice 01/09/2023 (`DEBENQ_2024.TXT`, FY2024, "D/N 6421 EMPTIES") — settled across two slices, R335.09 here on STAT:103 and R860.91 on STAT:107 below, summing exactly
  So the "systemic recycled-reference" finding narrows to **`48372` alone** — a single genuinely anomalous case, not a five-item pattern. Still worth its own `lpg-recon-bug-fixer` ticket; the other four are this account routinely clearing multi-year-old small debts, which is normal.

---

## 2. Monthly LPG Invoices vs. Payments

| Billing Month | LPG Invoice Total | Payment Date | Payment Doc | Payment Amount | Reconciliation Notes |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **2024-03** | R10,863.40 | 2024-05-02 | 30410 (STAT:103) | −R10,863.40 | Invoices 30219+30626+30811, cent-exact. STAT:103 also clears R2,474.09 of genuine old-debt (FY2022–FY2024 invoices 12187/17143/21110, partial 24010 — see correction note in §1) plus the anomalous R629.74 `48372` placeholder tag — none of this is FY2025 activity, not netted here. |
| **2024-04** | R23,232.34 | 2024-06-01 | 31375 (STAT:104) | −R23,232.34 | Invoices 30920+30962+31554+31733, cent-exact. |
| **2024-05** | R21,468.82 | 2024-07-01 | 31842 (STAT:105) | −R21,468.82 | Invoices 31768+32046+32206+32573, cent-exact. |
| **2024-06** | R11,979.04 | 2024-08-01 | 32604 (STAT:106, partial) | −R11,979.04 | Invoices 32723+33294, cent-exact. STAT:106 also picks up invoice 33704 (R4,407.89, dated 01/07/2024) a month early — see 2024-07 row. |
| **2024-07** | R26,447.35 | split: 2024-08-01 (33704 via STAT:106) + 2024-09-02 (rest via STAT:107) | 32604 + 33247 | −R4,407.89 + −R22,039.46 = −R26,447.35 | **Pattern 2 cross-batch carry**, cleanly resolved: one July invoice paid a month early with June's batch, the other 4 (33991+34143+34570+34572) paid on schedule with STAT:107. Sums to the exact July total. |
| **2024-08** | R13,927.72 | 2024-10-01 | 33817 (STAT:108) | −R13,927.72 | Invoices 35072+35191+35667+35707+35709, cent-exact. |
| **2024-09** | R11,715.50 | 2024-11-01 + 2024-11-07 | 34555 + 34686 (both STAT:109) | −R4,369.01 + −R7,346.49 = −R11,715.50 | Same STAT:109 batch split across two ERP payment docs a week apart. Invoices 36331+35883, cent-exact. |
| **2024-10** | R26,348.14 | 2024-12-02 | 35269 (STAT:110) | −R26,348.14 | Invoices 37005+37052+37074+37084+37445, cent-exact. |
| **2024-11** | R19,247.39 | 2025-01-02 | 35876 (STAT:111) | −R19,247.39 | Invoices 38238+38428+38480, cent-exact. |
| **2024-12** | R24,178.73 | 2025-02-03 | 37143 + 37144 (STAT:112) | −R18,802.73 | **Underpaid R5,376.00.** Invoices 38757 (R4,441.70) and 39277 (R4,632.38 net) and 38918 (R6,176.51 net) paid in full. Invoice 38939 (R13,758.14 gross, R8,928.14 net of its own CN 11444) paid only R3,552.14 — **R5,376.00 remains unpaid since this billing month.** Absent from GAZ's own AP ledger extract entirely (checked — possibly linked to the MD0003/MD0004 same-entity situation, per `MD0003_MD0004_Combined_Exposure.md`). Also on this payment: two untagged residuals, R44.74 and R889.56 — unexplained, no remittance exists for this date, checked against `MD0003_DETAILED_LEDGER.xls` with no match. |
| **2025-01** | R21,718.57 | 2025-03-03 (outside window) | 37262+37263 | −R21,718.57 | Not yet due within FY2025 (due 2 months later, March 2025). Confirmed paid in full per `MD0003_2025_Payment_Pattern_Analysis.md` (customer AP ledger match, STAT:113). **Not an anomaly.** |
| **2025-02** | R15,633.20 | 2025-04-07 (outside window) | 37817 | −R15,633.20 | Not yet due within FY2025 (due 2 months later, April 2025). Confirmed paid per `MD0003_2025_Payment_Pattern_Analysis.md`'s payment-sequence table (doc 37817). **Not an anomaly** — do not repeat the "skipped month" mistake corrected elsewhere in this session for a later fiscal boundary. |
| **TOTAL** | **R226,760.20** | | | **R221,384.20 confirmed paid to date (within + shortly after window); R5,376.00 genuinely outstanding** | Net position: R226,760.20 billed − R221,384.20 paid = **R5,376.00**, matching the single identified underpayment exactly. |

### 2.1 Candidate Invoice Details for Underpayments

| Underpaid Month | Underpaid Amount | Candidate Doc | Invoice Date | LPG Gas Items | Line Total |
| :--- | :---: | :---: | :---: | :--- | ---: |
| 2024-12 | R5,376.00 | 38939 | 09/12/2024 | 215584/DN#10815 | R13,758.14 gross / R8,928.14 net of CN 11444 (−R4,830.00) |

**Investigation notes:** Only R3,552.14 of this invoice's R8,928.14 net value was ever paid (two slices on doc 37144, STAT:112, 03/02/2025). No later STAT batch references doc 38939 again anywhere in `DEBENQ_CURRENT.TXT` through 15/09/2026. This is a confirmed, standing shortfall — not a timing gap — and should be raised with the operator for collection or write-off ratification (`DEBTORS_DOCTRINE.md` §5 idempotency: an operator decision here belongs in `config/`, not silently absorbed into a future report).

### 2.2 Skipped Statements (Unpaid Months)

**None.** Every FY2025 billing month is either paid in full (Mar–Nov 2024, cent-exact) or accounted for by the account's normal 2-month lag (Jan/Feb 2025, confirmed paid shortly after this window) — except December 2024, which is a **partial underpayment** (§2.1), not a full skip.

---

## 3. Cylinder (CYL) Transactions Analysis

* **Net CYL Balance Impact: R0.00** for all 12 FY2025 billing months — every `-EMPTY`-tagged invoice/credit-note pair in this window nets to exactly zero, with no residual (unlike FY2026, which has two open CYL exceptions — docs 46445 and 52422, both dated after this window closes).
* One classification caveat consistent with the account's later history: at least one CYL deposit invoice in this window (doc 39843, 14/01/2025, "DN#11922- MKONDENI", R2,415.00) carries **no `-EMPTY` marker at all**, yet its matching credit note (doc 11685, same day, −R2,415.00) confirms it is a cylinder deposit. Text-heuristic classification would miss it; the invoice/CN pair still nets to R0.00 regardless of which sub-ledger bucket it lands in, so this does not affect the balance conclusion, only illustrates why DB-sourced `debt_group` classification (unavailable this session) is needed for a fully reliable Part 1A/1B-style split.

---

## 4. Payment Flow & Sequence Reconciliation

| STAT Batch | Payment Doc(s) | Payment Date | Amount | Reconciled Billing Month | Status |
| :--- | :--- | :--- | :---: | :--- | :---: |
| STAT:103 | 30410 | 2024-05-02 | −R13,967.23 | 2024-03 (R10,863.40) + R3,103.83 unrelated legacy residual | ✅ core amount present |
| STAT:104 | 31375 | 2024-06-01 | −R23,232.34 | 2024-04 | ✅ Present, cent-exact |
| STAT:105 | 31842 | 2024-07-01 | −R21,468.82 | 2024-05 | ✅ Present, cent-exact |
| STAT:106 | 32604 | 2024-08-01 | −R16,386.93 | 2024-06 (R11,979.04) + 1 early Jul invoice (R4,407.89) | ✅ Present, cent-exact |
| STAT:107 | 33247 | 2024-09-02 | −R26,447.35 | 2024-07 remainder (R22,039.46) + R860.91 clearing the rest of old FY2024 invoice 24010 (see §1 correction) + R3,546.98 blank-invno residual | ✅ core amount present |
| STAT:108 | 33817 | 2024-10-01 | −R13,927.72 | 2024-08 | ✅ Present, cent-exact |
| STAT:109 | 34555 + 34686 | 2024-11-01/07 | −R11,715.50 | 2024-09 | ✅ Present, cent-exact (split across 2 docs) |
| STAT:110 | 35269 | 2024-12-02 | −R26,348.14 | 2024-10 | ✅ Present, cent-exact |
| STAT:111 | 35876 | 2025-01-02 | −R19,247.39 | 2024-11 | ✅ Present, cent-exact |
| STAT:112 | 37143 + 37144 | 2025-02-03 | −R19,737.03 | 2024-12 (R18,802.73 of R24,178.73 due) + R934.30 unexplained residual (R44.74+R889.56) | ⚠ **Underpaid by R5,376.00** — see §2.1 |

**Reconciliation block — Payment Settlement Pool vs. FY2025 ERP headers:**

| Line Item | Amount |
| :--- | ---: |
| Total FY2025 LPG billed (12 months) | R226,760.20 |
| Confirmed paid within/shortly after window (Mar 2024 – Feb 2025 billing, including Jan/Feb 2025 settled in Mar/Apr 2025) | −R221,384.20 |
| **Net outstanding, FY2025 billing** | **R5,376.00** |

This ties exactly to the single identified underpayment (invoice 38939) — no unexplained residual at the whole-year level, unlike the small STAT:112 line-item noise (R934.30) which nets out below the year-total line because it's immaterial relative to R226,760.20 and doesn't correspond to any specific still-open invoice.

---

## 5. Unallocated Payment Pool (FY2025 Items)

No genuine surplus (Rule 13) items identified for this fiscal year — every payment batch's core (invoice-matched) total is less than or equal to its corresponding billing month, with the sole variance being the December 2024 underpayment (§2.1) and the small untagged residuals already discussed (§1, §2 STAT:112 row).
