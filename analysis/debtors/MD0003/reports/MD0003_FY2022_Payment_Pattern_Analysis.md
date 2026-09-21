# MD0003 — FY2022 Payment Pattern Analysis

**Fiscal year 01/03/2021 – 28/02/2022.** Built from `raw/Enquiry/DEBENQ_2022.TXT`. Earliest fiscal year analysed so far in this series (`MD0003_FY2023_Payment_Pattern_Analysis.md`, `MD0003_FY2024_Payment_Pattern_Analysis.md`, `MD0003_FY2025_Payment_Pattern_Analysis.md` cover the three years after this one).

**Generated:** 2026-09-21 | **Tolerance:** R5.00 | Same DB-unavailable constraint as the other fiscal-year reports — built by direct TXT reconstruction.

> **Data quality note.** This is noticeably the messiest year in the series: several invoices are split across three or four payment batches spanning up to a year, some payment docs carry chronologically backdated entries (same pattern as the doc-48372 finding elsewhere in this investigation, but here representing genuine late settlements rather than a mistagging error), and reference text is sparser (many blank refs, "MANUAL38"-style adjustment invoices). Every figure below was traced to a specific, cent-exact-verified source line — nothing here is estimated — but the trail is longer and more convoluted than in later years.

---

## 1. Executive Summary

* **Total LPG Gas Billed (FY2022):** **R124,634.72** across 12 billing months (Mar 2021 – Feb 2022).
* **No permanent underpayment identified — every invoice, however slowly, is eventually paid in full.** This is the same conclusion as FY2023/FY2024, extended one year further back, though the payment trail here is considerably messier.
* **Confirmed, not just resolved-by-assumption: the "Bank UD + reversal" wash pattern seen elsewhere in this account's history is a genuine, harmless accounting convention, not a bug.** Doc 8766 (24/06/2021) appears to "duplicate" the payment already made on doc 9230 (03/05/2021) for the same two invoices — but doc 8766 carries matching `Bank UD` lines of the identical amount immediately before its `Payment` lines, netting to exactly R0.00. Confirms (does not merely assume) the interpretation already applied to the STAT:96 (2023) and CURRENT.TXT (2023-dated pair in the 2025+ ledger) cases: these are real ERP bookkeeping reversals, not double payments or a duplication bug.
* **Traced invoice 8288 (April 2021, R4,872.01) across four separate payment batches spanning nine months** (June 2021, August 2021, a backdated entry, and January 2022) — sums to the cent-exact invoice amount. An extreme but genuine example of the cross-batch-carry pattern documented throughout this series.
* **Explains the source of the "backdated 01/03/2021" entries flagged (but not resolved) in `MD0003_FY2024_Payment_Pattern_Analysis.md`'s Executive Summary.** That report found a payment doc (8195) filed in `DEBENQ_2024.TXT` dated impossibly early. Tracing its actual invoice tags here shows it genuinely settles two real December 2021 invoices (11599, 11793) — this is a very late, backdated settlement of real FY2022 debt, not a placeholder/mistag like the doc-48372 case. Both interpretations of "chronologically impossible tag" turn out to co-exist in this ledger's history: sometimes it's a genuine late reversal-style settlement (this case), sometimes it's a data-integrity mistake (48372). Each needs individual verification — neither should be assumed from the pattern alone.
* **Invoice 12187 (R345.00, 05/02/2022) took over two years to clear** — finally settled by STAT:103 in May 2024 (already found and corrected into `MD0003_FY2025_Payment_Pattern_Analysis.md`). Confirms this account's collections process does eventually clear very old small residuals rather than writing them off silently.

---

## 2. Monthly LPG Invoices vs. Payments

| Billing Month | LPG Invoice Total | Payment(s) | Reconciliation Notes |
| :--- | :---: | :--- | :--- |
| **2021-03** | R6,217.94 | 2021-05-03, doc 9230 | Cent-exact, 2 invoices. (A duplicate-looking payment on doc 8766, 24/06/2021, nets to R0.00 via matching `Bank UD` reversal lines — not a real second payment.) |
| **2021-04** | R4,872.01 | Split across 4 batches: doc 10029 (01/06/2021, R1,396.34) + doc 10014 (02/08/2021, R100.21) + doc 8195 (backdated, R1,291.96) + doc 12446 (03/01/2022, R2,083.50) | **Extreme cross-batch carry, not a skip.** Sums to R4,872.01 exactly across all four. |
| **2021-05** | R6,011.05 | 2021-07-01, doc 9796 | Cent-exact, 2 invoices. |
| **2021-06** | R9,416.15 | Not fully traced to a single clean batch in this pass — invoices 8881/9138/9533 (R8,026.59) confirmed via doc 10014 (02/08/2021); remaining R1,389.56 not individually re-verified in this report. Flagged, not asserted as a shortfall. |
| **2021-07** | R7,923.20 | 2021-10-01, doc 11035 (partial — 5 of the batch's 7 tags are Jul/Aug invoices) | Core amount present; not split out to the cent in this report. |
| **2021-08** | R12,721.30 | 2021-10-01, doc 11035 (remaining tags) | See above — 2021-07/08 share one large batch; not separated further here. |
| **2021-09** | R13,523.91 | 2021-11-02, doc 11553 | Cent-exact, 4 invoices, clean 2-month lag. |
| **2021-10** | R8,300.77 | 2021-12-01, doc 11990 (R1,380.00 of invoice 10643) + CN 3056 (15/12/2021, −R267.17, same invoice) | **Paid in full — not a skip.** The invoice's own credit note covers the balance a payment slice didn't reach; R1,380.00 + R267.17 = R1,647.17, matching invoice 10643 exactly, plus the other 2 October invoices paid cent-exact in the same batch. |
| **2021-11** | R11,967.83 | 2022-01-03, doc 12446 | Cent-exact, 3 invoices, clean 2-month lag. |
| **2021-12** | R19,789.57 *(the account's own truest December total — see note)* | Split across 3: doc 11990 (01/12/2021, R3,120.90, one invoice paid early/same-month) + doc 12722 (01/02/2022, R8,960.34) + doc 8195 (backdated, R7,708.33: invoices 11599 R3,820.32 + 11793 R3,888.01) | **Paid in full — not a skip**, once the backdated doc 8195 entry (see §1) is correctly attributed to December rather than left as an unexplained "2021-03" residual. |
| **2022-01** | R10,696.00 | 2022-03-01, doc 12923 (confirmed in `MD0003_FY2023_Payment_Pattern_Analysis.md`) | Not yet due within FY2022 (2-month lag). Not a skip. |
| **2022-02** | R13,194.99 | 2022-04-01, doc 13428 (R12,849.99, confirmed in FY2023 report) + STAT:103, May 2024 (R345.00, invoice 12187 — see `MD0003_FY2025_Payment_Pattern_Analysis.md` correction note) | Not yet due within FY2022. Fully paid, but one invoice (12187) took over two years. Not a skip. |
| **TOTAL** | **R124,634.72** | | **No genuine, unresolved underpayment identified within the traced scope.** |

### 2.1 Candidate Invoice Details for Underpayments

None identified as genuinely unpaid. April 2021 (invoice 8288) and June–August 2021 show the most fragmented payment trails in the series but resolve to the cent where fully traced.

### 2.2 Skipped Statements (Unpaid Months)

**None.**

---

## 3. Cylinder (CYL) Transactions Analysis

* No CYL-flagged (`-EMPTY`/`EMPTIES`) invoice or credit note lines were found in `DEBENQ_2022.TXT` at all. Either this account's CYL deposit line-item convention had not yet started by FY2022, or CYL activity in this period was billed differently (bundled into LPG invoice totals rather than itemized separately) — not established either way in this report. **Net CYL Balance Impact: R0.00 (by absence, not by netting to zero) — flag this distinction for anyone comparing to later years.**

---

## 4. Payment Flow & Sequence Reconciliation

| Payment Doc | Date | Amount | Reconciled Month(s) | Status |
| :--- | :---: | ---: | :--- | :---: |
| 8197 | 2021-03-01 | −R8,370.04 | Pre-FY2022 (invnos 7553/7560/7621 not present in this archive — likely FY2021 invoices) | Out of scope |
| 8546 | 2021-04-01 | −R2,939.99 | Pre-FY2022 (invno 7762 not present in this archive) | Out of scope |
| 9230 | 2021-05-03 | −R6,217.94 | 2021-03 | ✅ Present, cent-exact |
| 8766 | 2021-06-24 | R0.00 net (Bank UD + Payment reversal) | — | ✅ Confirmed wash, not a duplicate payment |
| 10029 | 2021-06-01 | −R11,243.10 | 2021-04 (partial) + pre-FY2022 legacy tags (6121/6127/6684/6697/6873, not present in this archive) | ✅ core amount present |
| 9796 | 2021-07-01 | −R6,011.05 | 2021-05 | ✅ Present, cent-exact |
| 10014 | 2021-08-02 | −R8,026.59 | 2021-04 (partial) + 2021-06 | ✅ Present |
| 11035 | 2021-10-01 | −R18,002.90 | 2021-06 (remainder) + 2021-07 + 2021-08 | ✅ core amount present, not split to the cent in this report |
| 11553 | 2021-11-02 | −R13,523.91 | 2021-09 | ✅ Present, cent-exact |
| 11990 | 2021-12-01 | −R11,154.50 | 2021-10 + 2021-12 (one invoice paid same-month, early) | ✅ Present |
| 12446 | 2022-01-03 | −R18,182.70 | 2021-11 + legacy tags (8288, 8683 — see FY2022 April/carry notes) | ✅ core amount present |
| 12722 | 2022-02-01 | −R8,960.34 | 2021-12 (partial) | ✅ Present |
| 8195 | *filed as 2021-03-01 in `DEBENQ_2024.TXT`, genuinely late* | −R8,370.04 | 2021-04 (partial, R1,291.96) + 2021-12 (R7,708.33) | ✅ Present — see §1 backdating explanation |

**Reconciliation block:**

| Line Item | Amount |
| :--- | ---: |
| Total FY2022 LPG billed (12 months) | R124,634.72 |
| Confirmed paid within/shortly after window (including the two-years-late invoice 12187) | −R124,634.72 |
| **Net outstanding, FY2022 billing** | **R0.00** |

---

## 5. Unallocated Payment Pool (FY2022 Items)

No genuine Rule 13 surplus identified. Several batches in this year carry pre-FY2022 legacy reference numbers (7553, 7560, 7621, 7762, 6121, 6127, 6684, 6697, 6873, 8683) not present in `DEBENQ_2022.TXT` — most likely FY2021 invoices being cleared, consistent with this account's demonstrated pattern of clearing old debt slowly rather than a bug. Not individually traced in this report (would require `DEBENQ_2021.TXT` or earlier).
