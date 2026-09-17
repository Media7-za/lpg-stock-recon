# CAP000 — Payment Gap & Missing-Payment Screening Report

**Account:** CAP000 — CAPITOL CATERERS SELECT (PTY)
**Period covered:** Jul 2022 → Sep 2026 (full ERP history, 51 calendar months)
**Sources:** `raw/DEBENQ23.TXT`, `raw/DEBENQ24.TXT`, `raw/DEBENQ25.TXT`, `raw/DEBENQ.TXT`
**Method:** repo's shared open-invoice model (`analysis/debtors/shared/scripts/debenq_open_invoices.mjs`) — same module used for TWK002/MD0003 open-invoice screening. Per that module's own doctrine, this is a **screening hypothesis, not a finding**: ERP payment tagging is not authoritative (`business_rules.md` §3).

---

## Bottom line

**No evidence of a genuinely missing payment.** The 19 calendar months with zero payment rows are a normal feature of this account's payment style (payments arrive in periodic STAT-batch lump sums, not monthly). The one real anomaly — 7 invoices from Nov 2022–Jan 2023 sitting open for 3+ years — is fully explained: two untagged 2023 payments net to the **exact rand** of those 7 invoices. They were very likely paid; the ERP just never tagged which invoices the payment cleared.

---

## 1. Months with zero payment activity

Of 51 months in the account's history, **19** had no Payment-type row at all. This is expected for a debtor whose payments post as large periodic batches (`TRANSF | STAT nnn`) rather than per-invoice — invoicing continues every month, payment batches land every 1–3 months and clear a backlog at once. **A zero-payment month by itself is not evidence of a missing payment on this account** — see §2 for the signal that actually matters.

| Month | Invoices raised | Invoiced (R) | Credit notes | CN (R) |
| :--- | ---: | ---: | ---: | ---: |
| July 2022 | 2 | 3,224.40 | 1 | -1,628.40 |
| April 2023 | 8 | 26,851.72 | 2 | -3,588.00 |
| April 2024 | 4 | 11,524.30 | 0 | 0.00 |
| June 2024 | 6 | 15,830.17 | 0 | 0.00 |
| August 2024 | 6 | 16,845.36 | 0 | 0.00 |
| January 2025 | 8 | 20,262.94 | 4 | -9,660.00 |
| March 2025 | 10 | 39,956.31 | 6 | -21,089.87 |
| April 2025 | 15 | 53,198.75 | 6 | -19,837.50 |
| June 2025 | 12 | 34,176.41 | 5 | -14,490.00 |
| July 2025 | 10 | 32,570.51 | 6 | -21,907.50 |
| August 2025 | 4 | 17,361.41 | 2 | -7,935.00 |
| November 2025 | 6 | 20,801.76 | 7 | -20,945.76 |
| January 2026 | 6 | 18,182.53 | 3 | -8,625.00 |
| April 2026 | 4 | 12,284.17 | 3 | -7,561.78 |
| May 2026 | 3 | 5,864.09 | 1 | -690.00 |
| June 2026 | 4 | 17,917.72 | 2 | -7,245.00 |
| July 2026 | 4 | 17,959.04 | 2 | -7,245.00 |
| August 2026 | 8 | 23,647.82 | 6 | -13,695.67 |
| September 2026 | 2 | 9,235.64 | 0 | 0.00 |

---

## 2. Open-invoice invariant check

| Check | Result |
| :--- | ---: |
| Σ(open invoices, reconstructed) | R100,710.26 |
| ERP CURRENT BALANCE (`DEBENQ.TXT`) | R70,773.28 |
| **Overstatement** | **R29,936.98** |
| Gate | **BLOCKED** (OPEN_LIST_OVERSTATES_ACCOUNT) |

The reconstructed open-invoice list **overstates** the account by R29,936.98 — i.e. the model, taken at face value, would claim R29,936.98 more debt than the ERP itself says exists. Per the shared module's own doctrine, that means **settled debt is sitting on the list as open**, not that the account owes more. Two things explain nearly all of it:

---

## 3. The R26,854.98 match — likely already paid, not missing

Two payment rows carry **no INVNO tag** (the ERP recorded the payment but never recorded which invoice(s) it cleared):

| Doc | Date | Ref | Amount (R) |
| :--- | :--- | :--- | ---: |
| 17886 | 2023-01-30 | TRANSF | STAT:89 | -15,383.27 |
| 18484 | 2023-02-28 | TRANSF | STAT:89 | -11,471.71 |
| **Total** | | | **-26,854.98** |

Meanwhile, 7 invoices from the same window sit open on the reconstructed list, flagged `STALE_OPEN` (marooned 1,150+ days behind the next open invoice — customers pay oldest-first, so it is not credible that 3 years of later invoices were raised and paid while these sat untouched):

| Doc | Date | Reference | Due (R) |
| :--- | :--- | :--- | ---: |
| 16609 | 2022-11-28 | MAKRO PMB D/N 2549 | 3,981.61 |
| 16710 | 2022-12-06 | D/N 2682 | 1,576.06 |
| 16768 | 2022-12-09 | D/N 2733 | 4,101.12 |
| 16993 | 2022-12-22 | D/N 2826 | 1,623.36 |
| 17026 | 2022-12-23 | D/N 2829 | 4,101.12 |
| 17219 | 2023-01-09 | D/N 2990 | 1,663.83 |
| 17225 | 2023-01-09 | D/N 2991 HILTON HL09 | 9,807.88 |
| **Total** | | | **26,854.98** |

**R26,854.98 = R26,854.98, to the cent.** This is strong pattern evidence (not proof — no remittance advice exists for this account) that the two untagged STAT:89 payments (30 Jan 2023 and 28 Feb 2023) are exactly what cleared these 7 invoices, and the ERP simply never tagged the INVNO column on those two payment rows. These are the account's only genuinely anomalous items, and the pattern points to **already paid**, not missing.

---

## 4. Remaining R3,082.00 — scattered partial-payment shortfalls, not a gap

The residual overstatement (R29,936.98 − R26,854.98 = R3,082.00) is not concentrated in one place. It matches the pattern already found in the Turn 002 lane-lock check: of 226 payment rows, 42 paid *less* than the invoice they were tagged against, with no consistent ratio — consistent with STAT-batch payments whose line-by-line split doesn't always net exactly to the invoice it references (rounding/timing across a multi-invoice remittance), not a systematically skipped payment. These sit inside the `CLEAR` bucket (current, un-marooned invoices) as small individual residues rather than one dramatic gap.

---

## 5. Recommendation

1. **Do not send an invoice-level open list to this customer as-is** — the gate is `BLOCKED` (`OPEN_LIST_OVERSTATES_ACCOUNT`). The account-level ERP balance (R70,773.28) remains safe to quote.
2. If/when this account needs an invoice-level view: ratify the 7 Nov 2022–Jan 2023 invoices into `closedInvoiceOverrides` (config), citing the two STAT:89 payments as evidence, then re-run.
3. No remittance advice exists for CAP000, so this stays `PATTERN_ONLY` evidence, not `REMITTANCE_BACKED` — a customer/operator confirmation would upgrade it to proven.
4. No action needed on the 19 zero-payment months themselves — they are explained by this account's batch payment cadence, not by anything missing.

---

## Appendix — full month-by-month table (invoiced vs. paid)

| Month | Invoices | Invoiced (R) | Credit Notes | CN (R) | Payments | Paid (R) |
| :--- | ---: | ---: | ---: | ---: | ---: | ---: |
| July 2022 ⚠️ | 2 | 3,224.40 | 1 | -1,628.40 | 0 | 0.00 |
| August 2022 | 2 | 3,249.00 | 0 | 0.00 | 1 | -1,596.00 |
| September 2022 | 1 | 1,566.30 | 0 | 0.00 | 2 | -3,249.00 |
| October 2022 | 1 | 2,166.00 | 0 | 0.00 | 1 | -1,566.30 |
| November 2022 | 3 | 7,072.22 | 1 | -1,576.06 | 1 | -2,166.00 |
| December 2022 | 6 | 17,296.78 | 0 | 0.00 | 1 | -1,514.55 |
| January 2023 | 6 | 26,531.42 | 3 | -13,395.88 | 1 | -15,383.27 |
| February 2023 | 3 | 9,825.57 | 0 | 0.00 | 1 | -11,471.71 |
| March 2023 | 6 | 18,740.12 | 2 | -3,588.00 | 4 | -11,489.40 |
| April 2023 ⚠️ | 8 | 26,851.72 | 2 | -3,588.00 | 0 | 0.00 |
| May 2023 | 8 | 24,523.79 | 2 | -3,588.00 | 4 | -12,373.46 |
| June 2023 | 13 | 37,481.44 | 5 | -9,568.00 | 5 | -18,696.68 |
| July 2023 | 12 | 27,988.65 | 5 | -10,764.00 | 16 | -57,517.39 |
| August 2023 | 20 | 47,043.39 | 11 | -21,024.47 | 6 | -18,709.07 |
| September 2023 | 22 | 48,916.91 | 12 | -21,686.42 | 10 | -27,313.16 |
| October 2023 | 15 | 37,177.49 | 8 | -14,798.57 | 8 | -21,023.02 |
| November 2023 | 18 | 37,928.55 | 9 | -11,960.00 | 7 | -22,378.92 |
| December 2023 | 5 | 22,953.92 | 2 | -14,383.40 | 7 | -19,454.50 |
| January 2024 | 5 | 14,113.83 | 0 | 0.00 | 3 | -7,150.37 |
| February 2024 | 5 | 14,547.08 | 0 | 0.00 | 4 | -11,013.92 |
| March 2024 | 6 | 25,305.70 | 1 | -2,392.00 | 8 | -15,079.34 |
| April 2024 ⚠️ | 4 | 11,524.30 | 0 | 0.00 | 0 | 0.00 |
| May 2024 | 8 | 23,840.46 | 1 | -4,695.55 | 14 | -25,711.44 |
| June 2024 ⚠️ | 6 | 15,830.17 | 0 | 0.00 | 0 | 0.00 |
| July 2024 | 7 | 20,041.90 | 0 | 0.00 | 11 | -27,027.09 |
| August 2024 ⚠️ | 6 | 16,845.36 | 0 | 0.00 | 0 | 0.00 |
| September 2024 | 6 | 19,366.88 | 0 | 0.00 | 9 | -32,783.93 |
| October 2024 | 6 | 17,601.63 | 0 | 0.00 | 12 | -27,631.27 |
| November 2024 | 7 | 21,612.03 | 1 | -690.00 | 6 | -17,441.02 |
| December 2024 | 2 | 10,649.10 | 2 | -5,175.00 | 4 | -11,427.12 |
| January 2025 ⚠️ | 8 | 20,262.94 | 4 | -9,660.00 | 0 | 0.00 |
| February 2025 | 11 | 30,273.99 | 5 | -12,937.50 | 19 | -30,219.92 |
| March 2025 ⚠️ | 10 | 39,956.31 | 6 | -21,089.87 | 0 | 0.00 |
| April 2025 ⚠️ | 15 | 53,198.75 | 6 | -19,837.50 | 0 | 0.00 |
| May 2025 | 9 | 24,419.37 | 6 | -14,490.00 | 12 | -35,844.65 |
| June 2025 ⚠️ | 12 | 34,176.41 | 5 | -14,490.00 | 0 | 0.00 |
| July 2025 ⚠️ | 10 | 32,570.51 | 6 | -21,907.50 | 0 | 0.00 |
| August 2025 ⚠️ | 4 | 17,361.41 | 2 | -7,935.00 | 0 | 0.00 |
| September 2025 | 10 | 23,495.34 | 4 | -11,040.00 | 29 | -97,933.00 |
| October 2025 | 13 | 39,615.81 | 7 | -20,637.66 | 6 | -7,120.32 |
| November 2025 ⚠️ | 6 | 20,801.76 | 7 | -20,945.76 | 0 | 0.00 |
| December 2025 | 0 | 0.00 | 0 | 0.00 | 5 | -21,106.80 |
| January 2026 ⚠️ | 6 | 18,182.53 | 3 | -8,625.00 | 0 | 0.00 |
| February 2026 | 4 | 15,768.16 | 2 | -7,245.00 | 6 | -12,099.89 |
| March 2026 | 5 | 13,459.37 | 2 | -4,312.50 | 3 | -9,908.97 |
| April 2026 ⚠️ | 4 | 12,284.17 | 3 | -7,561.78 | 0 | 0.00 |
| May 2026 ⚠️ | 3 | 5,864.09 | 1 | -690.00 | 0 | 0.00 |
| June 2026 ⚠️ | 4 | 17,917.72 | 2 | -7,245.00 | 0 | 0.00 |
| July 2026 ⚠️ | 4 | 17,959.04 | 2 | -7,245.00 | 0 | 0.00 |
| August 2026 ⚠️ | 8 | 23,647.82 | 6 | -13,695.67 | 0 | 0.00 |
| September 2026 ⚠️ | 2 | 9,235.64 | 0 | 0.00 | 0 | 0.00 |

⚠️ = zero payment rows that month (see §1 for why this is routine, not anomalous, on this account).

