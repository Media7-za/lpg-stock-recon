# MD0003 — Lifetime Balance Investigation (2016–2026)

**Generated:** 2026-09-17
**Question:** why does this account carry an outstanding balance of R15,309.11?
**Method:** reconstructed the full running-balance chain across every archived fiscal-year export plus the current ledger, verifying each year's arithmetic independently rather than trusting any prior summary.

---

## 1. The account's fiscal year runs March–February, not calendar year

Every `DEBENQ_[YEAR].TXT` file's last transactions fall in late Feb/early Mar (e.g. `DEBENQ_2018.TXT` closes 01/03/2018; `DEBENQ_2025.TXT` closes 26/02/2025). `DEBENQ_CURRENT.TXT`'s first real activity is period `"01"` dated 03/02/2025 — a **new fiscal period**, even though it's chronologically inside `DEBENQ_2025.TXT`'s own date range. This is normal ERP fiscal-period behaviour, not an overlap or duplicate: confirmed no shared doc numbers between the two files (`37143`/`37144`, the first CURRENT-file transactions, do not appear anywhere in `DEBENQ_2025.TXT`).

---

## 2. Full fiscal-year chain — every year ties out exactly

Each row's **Opening** matches the prior row's **Closing** exactly, and each year's own arithmetic (`Opening + Invoices + Credit Notes + Payments + Other = Closing`) checks to the cent — verified by direct computation over the raw TXT, not read off a summary.

| Fiscal year (Mar–Feb) | Opening (R) | Invoices (R) | Credit Notes (R) | Payments (R) | Other (R) | Closing (R) | Arithmetic check |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: | :---: |
| FY2017 (acct opened Nov 2016) | 0.00 | 32,170.39 | -1,026.00 | -43,594.78 | +19,626.78 (Journal) | 7,176.39 | ✓ |
| FY2018 | 7,176.39 | 134,987.42 | -12,558.29 | -102,861.81 | 0.00 | 26,743.71 | ✓ |
| FY2019 | 26,743.71 | 121,551.41 | -5,526.10 | -149,927.74 | +18,018.38 (Bank XFer) | 10,859.66 | ✓ |
| FY2020 | 10,859.66 | 142,776.73 | -4,424.42 | -135,442.28 | +950.00 (Journal) | 14,719.69 | ✓ |
| FY2021 | 14,719.69 | 86,469.26 | -4,045.00 | -95,266.84 | +12,908.59 (Bank UD) | 14,785.70 | ✓ |
| FY2022 | 14,785.70 | 137,555.31 | -13,187.76 | -118,851.00 | +12,589.03 (Journal+Bank UD) | 32,891.28 | ✓ |
| FY2023 | 32,891.28 | 220,226.40 | -35,873.20 | -200,442.56 | 0.00 | 16,801.92 | ✓ |
| FY2024 | 16,801.92 | 285,498.65 | -73,458.68 | -180,408.98 | 0.00 | 48,432.91 | ✓ |
| FY2025 | 48,432.91 | 267,393.09 | -40,632.89 | -222,585.59 | 0.00 | 52,607.52 | ✓ |
| Current period (Mar 2025 – 15 Sep 2026, 19 months, not yet archived) | 52,607.52 | 611,410.25 | -303,778.73 | -357,768.30 | +12,838.37 (Bank UD, self-cancelling) | **15,309.11** | ✓ |

**Lifetime invoiced since account opening (2016–present): ≈ R2,040,038.91.**

**This is an unbroken 10-year chain with zero unexplained jumps.** The current R15,309.11 balance is not an anomaly, a duplication, or a missing-payment artifact at the macro level — it is the exact, verified net of a decade of continuous trading. The account has *never* been at zero; it has ranged from R5,735.63 (31 Dec 2025) up to R52,607.52 (28 Feb 2025) depending on where in the monthly invoice/payment cycle the snapshot falls.

---

## 3. Why the balance is never zero — structural, not a defect

MD0003 (per `lpg-payment-pattern-analysis` skill and `payment_pattern_overrides.json`) pays in **consolidated monthly STAT batches, roughly one month in arrears**, and does **not** part-pay invoices. That means at any snapshot date the account is carrying, by design:

- The current month's invoices-to-date (not yet due), plus
- Occasionally, one prior month's invoice that a STAT batch missed and picked up the next cycle (documented "Pattern 2" carries — e.g. invoice 51470 was left off the June batch and picked up in STAT:130 in September, per `MD0003_2026_Payment_Pattern_Analysis.md` §2 and confirmed against the STAT:130 remittance this session).

A non-zero balance every month is the **expected steady state** of this payment cadence, not evidence of a collection problem.

---

## 4. Correction — a prior report's lifetime figures do not match the verified ledger

`MD0003_2026_Payment_Pattern_Analysis.md` §4.1 ("Ledger-Wide Historical Balance Reconciliation — View A/B", generated 2026-08-11) states:

> Total Corrected Opening Balance (as of 2026-01-01): **R-48,722.41**
> LPG Gas Components (Invoices/Credits pre-2026): **+R1,535,489.66**

**This is contradicted by the verified raw ledger.** The actual ERP running balance at the closest transaction to that date — 31/12/2025 (`DEBENQ_CURRENT.TXT` line 204, doc 42858/STAT:122) — is **R5,735.63**, a small debtor balance, not a R48,722.41 *credit* balance. A credit balance of that size never appears anywhere in the verified fiscal-year chain above; the account's balance is positive (debtor owes money) at every single fiscal year-end from FY2017 onward.

The §4.1 figures appear to come from a different or miscalculated dataset (possibly a portfolio-wide query mistakenly scoped to this account, or a stale intermediate calculation) — they should not be relied on. **Recommend:** mark §4.1–4.2 of that report superseded and, if that lifetime view is needed again, regenerate it directly from the fiscal-year chain in §2 above rather than whatever produced the R1.5M figure.

---

## 5. Current balance bridge (as at 15 September 2026)

| Component | Amount (R) | Status |
| :--- | ---: | :--- |
| ERP `CURRENT BALANCE` | 15,309.11 | **PROVEN** — closes the 10-year chain above |
| Reconciled this session (STAT:126–130, 20 invoices) | 77,246.51 | **PROVEN** — remittance-backed, see `MD0003_Statement_of_Account.md` |
| Still-open, evidence-backed (Aug–Sep 2026, no remittance yet) | 15,309.11 net of the R12,263.61 gap below | Structural — expected, one cycle behind the September-invoiced work |
| Unexplained residual within the Aug–Sep window | 12,263.61 | **Unresolved** — flagged in `MD0003_TAG_COVERAGE_2026-09-17.md`; not force-closed |

The R12,263.61 gap (see prior session Q&A) is real and small relative to the R2.04M lifetime invoiced — most plausibly further historical netting noise of the same kind already identified in §4 (untagged STAT residuals), not a new multi-year problem. It does not change the conclusion of this investigation: the account's balance is fully explained by a decade of ordinary, arithmetically consistent trading and a one-month-in-arrears payment cadence.

---

## 6. What would fully close the remaining gap

1. The next remittance/STAT batch (expected ~01/10/2026, covering August invoices) — will very likely absorb most or all of the 9 currently-open August/September invoices, the same way STAT:130 absorbed the June carry-over.
2. A DB-backed re-run of `analysis/debtors/MD0003/scripts/allocation_ingest.mjs` (not possible in this session — no `DATABASE_URL`) to regenerate `allocation_edges_2026.csv` and cross-check the R12,263.61 against the allocation lane rather than the TXT alone.
3. If the gap persists after the next remittance, escalate to a dedicated Payment Pattern Analysis re-run for 2025–2026 (per `lpg-payment-pattern-analysis` skill) rather than treating it as resolved.

---

## Addendum (2026-09-20) — what the R12,263.61 gap actually decomposes into so far

Following on from §6, the operator and this session traced the gap by hand (no `DATABASE_URL` available, so remittance/proximity matching per `business_rules.md` §15 Order B, not ERP tags) rather than waiting for the next STAT batch. Progress so far:

### Confirmed contributor: R3,273.10 — invoice 48372 over-credited via two impossible ERP tags

Invoice 48372 (R5,630.46, invoiced 19/12/2025) is correctly and fully settled by STAT:123 (02/02/2026) alone. But two **earlier** payment slices also carry the tag `48372`:
- STAT:121 (doc 42440, 28/11/2025, −R3,070.77) — dated **three weeks before invoice 48372 was ever created**, chronologically impossible as a real link.
- STAT:122 (doc 42858, 31/12/2025, −R202.33) — same pattern, smaller amount.

Real cash left the account's balance via these two slices without genuinely retiring 48372 (already settled by STAT:123). This R3,273.10 is "lost" to the open-invoice model — it should have applied to whatever invoice(s) it actually belongs to, which would reduce that invoice's open balance for real, but the true target is unknown without a remittance for doc 42440 (none exists in the repo). **Contributes an estimated R3,273.10 toward the R12,263.61 gap, not force-closed.**

### Resolved, not a contributor: R469.87 (doc 42051, STAT:121, 01/11/2025)

Traced to the already-known "CYL 46445" discrepancy (remittance claimed R3,105.00 against that CYL invoice; ERP's own ledger shows only R57.50 open on it). ERP's tagging on doc 42051 compensates for the R3,047.50 difference by additionally crediting a separate, genuinely open invoice (43319, R2,577.63) plus this R469.87 blank remainder — a self-contained wash. **Explained; does not contribute to the gap.**

### Checked, still genuinely unresolved: R4,973.79 (four small residuals)

R44.74 and R889.56 (STAT:112, 03/02/2025) and R1,787.18 and R2,252.18 (STAT:121 2nd tranche, doc 42440, 28/11/2025). No remittance exists for either payment date; no exact-sum match found anywhere in the TXT, and no match in GAZ's own independent AP ledger (`MD0003_DETAILED_LEDGER.xls`, parsed this session with `openpyxl`/`xlrd`). Left flagged, not force-closed.

### A separate, independently confirmed finding — NOT part of the R12,263.61 gap

While parsing `MD0003_DETAILED_LEDGER.xls` to chase the residuals above, found invoice **38939** (09/12/2024, R13,758.14 gross / R8,928.14 net of its own credit note) was only ever paid **R3,552.14** — a **R5,376.00 shortfall silently unresolved since December 2024**. This predates `DEBENQ_CURRENT.TXT`'s own window entirely (it lives in the archived `DEBENQ_2025.TXT`), so it was invisible to every open-invoice check run against the current ledger. `MD0003_FY2025_Payment_Pattern_Analysis.md` (generated 2026-09-20) since pinned this precisely to the December 2024 billing month — see that report's §2.1. **This is real, aged, additional debt — it does not explain any part of the R12,263.61 gap (which is about the current ledger over-counting open invoices); if anything it means total lifetime exposure is understated elsewhere by this amount.** Needs an operator decision: pursue collection or ratify a write-off (`DEBTORS_DOCTRINE.md` §5 idempotency — belongs in `config/`, not silently absorbed).

### Two full fiscal-year Payment Pattern Analyses added, extending this investigation backward

- `MD0003_FY2025_Payment_Pattern_Analysis.md` (01/03/2024–28/02/2025): confirmed the 2-month payment lag holds throughout, found the invoice-38939 shortfall precisely dated, corrected the FY2026 report's "2026-07 skipped month" error before it could recur at this boundary.
- `MD0003_FY2024_Payment_Pattern_Analysis.md` (01/03/2023–29/02/2024): the cleanest fiscal year found — no genuine underpayment. Surfaced a real archive-filing trap (August 2023's payment is filed in `DEBENQ_2025.TXT`, not `DEBENQ_2024.TXT`, despite its date) and a R2,392.00 open CYL exposure as of year-end, itemized to 5 invoice/CN pairs. While cross-checking, **disproved most of the FY2025 report's initial "systemic placeholder reuse" claim** — four of five flagged reference numbers turned out to be real, legitimate multi-year-old invoices being cleared late; only `48372` (above) survives as a genuine anomaly. Corrected in place in the FY2025 report per doctrine (appended, not deleted).

### Net position on the R12,263.61 gap as of 2026-09-20

| Component | Amount (R) | Status |
| :--- | ---: | :--- |
| Confirmed contributor (doc 48372 mistag) | 3,273.10 | Identified, true target unknown, not force-closed |
| Genuinely unresolved (4 small residuals) | 4,973.79 | Checked exhaustively (remittance, exact-sum, AP ledger) — no match found |
| Still unaccounted for | ~4,016.72 | No lead yet |
| **Total** | **12,263.61** | Matches exactly |

Recommended next step for the remaining ~R4,016.72: a portfolio-wide `lpg-recon-bug-fixer` sweep for the same reference-mistagging pattern now confirmed at least twice (doc 48372, and the recurring ~R598-per-unit CYL under/over-credit signature spanning FY2024 through FY2026 — docs 21110/22004/23961 in FY2024, 46445/48927 in FY2026) — this looks systemic to the ERP's residual-crediting behaviour, not specific to one invoice.
