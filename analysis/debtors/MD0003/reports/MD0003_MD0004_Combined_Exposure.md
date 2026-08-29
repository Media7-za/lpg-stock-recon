# MD0003 + MD0004 — Combined Exposure (Same Entity)

**Decision (confirmed by operator):** MD0004 is the **same customer/entity** as MD0003 and should be folded into the MD0003 ledger for collections and reporting purposes.

**Status:** Combined exposure documented below using best-available data. **MD0004's own balance is NOT yet independently verified** — no full debtor-ledger export (`DEBENQ`-style, with running balance and payment history) exists for MD0004 in this repo. See "Data gap" section before treating the combined total as reconciled.

---

## Why these are the same entity

1. **Shared trading name.** MD0003 itself traded as **"BMS FOODS (PTY) LTD"** in the ERP from 2016–2017 (see `raw/Enquiry/DEBENQ_2017.TXT` line 1: `"ACCOUNT:","MD0003 - BMS FOODS (PTY) LTD"`) before being renamed to "BLUFF MEAT SUPPLY(PTY) LTD". **MD0004 carries that exact legacy name today** (`BMS FOODS (PTY) LTD`, per `analysis/debtors/Global Reports/130720251H45M.TXT` and `analysis/debtors/shared/data/portfolio_candidates.csv`).
2. **Explicit transfer notes on MD0004 credit notes.** Four historical credit notes on MD0004 carry references that say, verbatim, the line was moved to MD0003:

   | Date | Crd Note | Reference text |
   | :--- | :--- | :--- |
   | 16 Mar 2017 | 00000466 | `FROM MD004 TO MD003` |
   | 22 Jun 2017 | 00000469 | `XFER TO MD0003` |
   | 20 Oct 2017 | 00000467 | `MD004 TO MD003` |
   | 07 Dec 2017 | 00000465 | `2094 - TO - MD0003` |

   This confirms operators historically corrected mis-postings on MD0004 by crediting it and re-billing under MD0003 — i.e. MD0004 has repeatedly been treated as an **incorrect duplicate code** for the same customer.
3. **Same terms.** Both accounts are on **30T** payment terms.

---

## Data gap — what's missing for MD0004

Unlike MD0003 (which has a full `DEBENQ` enquiry export with every invoice, payment, credit note, and running balance), **MD0004 has no equivalent export in this repo.** All that's available is:

- Scattered **stock-transaction lines** (item-level sales, no payments, no running balance) pulled from the shared, all-customer `ERP RAW DATA/{2017,2018,2019,2020,2022,CURRENT}.TXT` dumps
- One **stale point-in-time balance snapshot**: **R4,413.86** as at 13 Jul 2025 (`Global Reports/130720251H45M.TXT` and `portfolio_candidates.csv`), flagged **100% aged 120+ days**
- **`DETRANS.TXT`** (the current-period debtor-transaction ledger, which does carry AMOUNT/TAX/PAID) has **zero MD0004 rows** — meaning MD0004 has had no billing activity in the current ERP period at all

**Recommended next step:** pull a `DEBENQ`-style enquiry export for MD0004 directly from the ERP (same report used for `raw/Enquiry/DEBENQ_CURRENT.TXT` on MD0003) so the balance can be verified line-by-line instead of relying on a 13-month-old snapshot.

---

## Reconstructed MD0004 activity (from scattered stock-transaction dumps)

All `MD0004` lines found across `ERP RAW DATA/2017.TXT` → `CURRENT.TXT` were extracted and are archived at:

`analysis/debtors/MD0003/raw/MD0004_source/MD0004_extracted_lines_2016-2024.csv` (51 rows)

**Important caveat:** these files are **stock/sales transaction dumps, not debtor ledgers** — they contain Invoice and Crd Note lines only, **no Payment rows**. The totals below are gross invoiced/credited value, **not** a running account balance, and cannot by themselves validate the R4,413.86 snapshot.

| Period | Gross invoiced | Gross credited | Net |
| :--- | ---: | ---: | ---: |
| 2016–2019 (ad-hoc 48kg/19kg refills) | 21,223.28 | (6,134.02) | 15,089.26 |
| 2021 (Apr + Oct, incl. cylinder-deposit pairs) | 11,525.72 | (8,519.02) | 3,006.70 |
| 2022–2023 | — | — | 0.00 (no rows found) |
| 2024 (Mar, 2 invoices) | 6,207.66 | (4,588.26) | 1,619.40 |
| **Total (2016–2024, all found rows)** | **38,956.66** | **(19,241.30)** | **19,715.36** — includes explicit MD0003 transfer reversals; **not** the current balance |

The 2024 pair (docs 30216/30754) are same-day, near-full invoice/credit-note reversals — consistent with the "-EMPTY"-style deposit correction pattern seen on MD0003, not open debt.

None of this reconstructed activity ties cleanly to R4,413.86 because payments are missing from the source data. **Treat the R4,413.86 snapshot as the best current estimate of MD0004's balance until a proper ledger export is available.**

---

## Combined exposure (current best estimate)

| Account | Balance | Basis | Confidence |
| :--- | ---: | :--- | :--- |
| MD0003 — ERP `CURRENT BALANCE` | R18,853.36 | Live, as-at 9 Aug 2026, full ledger reconciled (see `MD0003_Open_Invoices.md`) | High |
| MD0004 — last known balance | R4,413.86 | Point-in-time snapshot, 13 Jul 2025, unreconciled | **Low — stale, unverified** |
| **Combined group exposure** | **R23,267.22** | Sum of above | Blended |

**Note:** MD0004's R4,413.86 is aged **120+ days in full** per the portfolio snapshot — it should be treated as legacy/dormant debt on the combined statement, separate from MD0003's active monthly billing cycle, until confirmed otherwise.

---

## Recommended actions

1. **Pull a live `DEBENQ` enquiry export for MD0004** from the ERP to replace the stale snapshot and get a real running balance + payment history.
2. **Confirm with the ERP/accounts team whether MD0004 should be merged (closed) into MD0003** at the master-data level, given the documented history of mis-postings and manual transfers between the two codes — this would prevent the split recurring.
3. Once MD0004's live ledger is available, extend the reconciliation bridge in `MD0003_Open_Invoices.md` to cover both codes as a single combined open-invoice schedule.

---

## Related artifacts

| File | Role |
| :--- | :--- |
| `raw/MD0004_source/MD0004_extracted_lines_2016-2024.csv` | Extracted MD0004 lines from global ERP stock-transaction dumps |
| `reports/MD0003_Open_Invoices.md` | MD0003 standalone open schedule + ERP bridge |
| `analysis/debtors/shared/data/portfolio_candidates.csv` | Source of MD0004's last known balance/tier |
| `analysis/debtors/Global Reports/130720251H45M.TXT` | Source snapshot, 13 Jul 2025 |
