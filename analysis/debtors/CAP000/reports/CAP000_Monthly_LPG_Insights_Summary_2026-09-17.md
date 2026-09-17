# CAP000 — Monthly LPG Insights Summary

**Data file:** `analysis/debtors/CAP000/data/monthly_lpg_insights.csv`
**Schema:** matches `analysis/debtors/JIM001/data/monthly_lpg_insights.csv` (year, month, month_year, lpg_invoice_total, lpg_credit_notes, net_lpg_invoiced, payment_refs_allocated, payment_dates, payment_total_allocated, difference, month_status, review_required, notes)
**Coverage:** 50 months with LPG gas activity, Jul 2022 → Sep 2026
**LPG classification:** gas invoices/credit notes only (`-EMPTY`/`EMPTIES` deposit rows excluded). Unlike JIM001 (which needed a manual exact-sum bridge because its export excludes allocation detail), CAP000's TXT carries real `INVNO` tags, so payment attribution here is a direct invoice-level match, not a hypothesis — plus 7 known mixed LPG+CYL documents (docs 26259, 38579, 38825, 39045, 52523, 15465, and the OTHER-classified doc 40836) were split/excluded using **exact debt_group amounts pulled from the Supabase MCP `execute_sql`** against `vw_clean_transactions`, not the ref-text heuristic.

---

## Totals (50 months)

| Metric | Amount |
| :--- | ---: |
| LPG invoiced | R783,017.17 |
| LPG credit notes | -R86,623.69 |
| **Net LPG invoiced** | **R696,393.48** |
| Payments tagged to LPG invoices | R616,443.99 |

## Month status breakdown

| Status | Months |
| :--- | ---: |
| FULLY_SETTLED | 27 |
| PARTIALLY_SETTLED | 11 |
| OVERPAID | 5 |
| UNPAID | 7 |

## Yearly trend — LPG gas volume is declining

| Year | Months | Avg net LPG invoiced / month | Total |
| :--- | ---: | ---: | ---: |
| 2022 (from Jul) | 6 | R4,929.37 | R29,576.24 |
| 2023 | 12 | R19,901.19 | R238,814.23 |
| 2024 | 12 | R16,052.78 | R192,633.39 |
| 2025 | 11 | R14,333.73 | R157,671.03 |
| 2026 (to Sep) | 9 | R8,633.18 | R77,698.59 |

2026's monthly average (R8,633) is **less than half** the 2023 peak (R19,901) and the lowest of the full account history. Worth a commercial check-in — is this an intentional reduction in gas volume, or a competitor/lost-business signal?

## Largest genuinely underpaid months (excludes recent months simply awaiting the next payment batch)

| Month | Shortfall |
| :--- | ---: |
| Jan 2023 | R11,471.71 |
| Dec 2022 | R11,401.66 |
| Oct 2025 | R5,666.88 |
| Sep 2023 | R4,186.00 |
| Nov 2022 | R3,981.61 |

The Dec 2022/Jan 2023 pair (R22,873.37 combined) lines up with the untagged-payment finding already reported in `CAP000_Payment_Gap_Report_2026-09-17.md` (H-030) — likely already paid via the two untagged STAT:89 payments, just not reflected here since this file only counts *tagged* payments.

## Currently unpaid (awaiting next payment batch, not a concern by itself)

Mar 2026 → Sep 2026 (7 months, R59,318.13 combined net) have no payment tagged yet — consistent with this account's periodic STAT-batch cadence (see `CAP000_Payment_Gap_Report_2026-09-17.md` §1); the account's last tagged payment batch was 31 Mar 2026 (STAT 124).

---

## Caveat

This file counts only **tagged** payments (Payment rows whose INVNO names an LPG invoice). It does not re-run the untagged-payment pattern match from H-030, so the Dec 2022/Jan 2023 "shortfall" above double-counts a gap that report already explains. Treat this file as the LPG-only invoicing/payment ledger, and the payment-gap report as the authority on untagged settlement evidence.
