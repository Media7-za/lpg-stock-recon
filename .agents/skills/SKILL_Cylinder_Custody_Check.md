---
name: cylinder-custody-check
description: >
  Cylinder custody and double-credit checks for deposit credit notes and cylinder residuals
  (worked example TWK002 CN 15775 against the STAT 123 cash deposits). Use when a residual
  or credit note on the cylinder lane needs explaining: decompose it into whole cylinders at
  the dated rate, compare the credit note per SKU with its own delivery invoice, then with
  deposits already paid in cash on a remittance advice. Evidence only; custody conclusions
  and lane rulings stay with the operator. Governed by ALLOCATION_DOCTRINE section 6.
---

# Cylinder Custody Check

Governance: `analysis/debtors/shared/docs/ALLOCATION_DOCTRINE.md` section 6.2 (double-credit test), `DEBTORS_DOCTRINE.md` section 4 (evidence hierarchy) and `AGENTS.md` (every number tagged PROVEN / ASSERTED / ASSUMED with an artifact path; mark what cannot be anchored `unverified`). Recording any resulting ruling: `SKILL_Family_Rulings_And_Holds.md`. The check is read-only evidence: no lock, no tie, no lane change.

## 1. When to use

- A credit note on a delivery is large or in a doubtful lane (gas vs cylinder).
- A cylinder residual or deposit balance has no obvious cause.
- A remittance advice paid cylinder deposits in cash and a later credit note might credit the same cylinders again.

## 2. Inputs

| Input | Source |
| :--- | :--- |
| Quantities and amounts by SKU, per document | DB lines through the read-only replay (`data/db_replay/<date>/`); line quantities, not header amounts |
| Rate at the document date | The line's own unit price. `skuRates` in `statement_v5.json` is the opening-custody rate, not necessarily the rate on the day |
| Cash-paid deposits | The remittance advice lines: `data/remittance_lines_<year>.csv`, `data/remittance_evidence.json` |
| Lane of each row | `data/v5_projection.json` (`split_basis`; `HEADER_FALLBACK` means no line detail and the lane is unconfirmed) |

If a document has no DB lines, say so and stop: header-only amounts cannot be split. (Do not trust a DB header over the TXT without checking: DB credit-note headers on TWK read 1.1304 times the TXT while lines and TXT agreed.)

## 3. Procedure

1. **Decompose into whole cylinders.** For each document or pair, list the net quantity per SKU and the net amount at the dated rate. A real cylinder movement is a whole number of cylinders at the stated rate. If the net does not decompose, say what is left over; do not round it away.
2. **Compare the credit note with its own delivery.** Same DN. Per SKU: does the credit note return more of a SKU than the delivery invoice charged? If not, it stays inside its own delivery (the usual invoice-plus-empties-credit pattern).
3. **Compare with cash-paid deposits.** Decompose the cash deposit paid on the advice into whole cylinders per SKU the same way. A credit note is a double credit only if it credits more of a SKU than its own delivery invoiced **and** the excess equals the cash-paid cylinders. The same total value with a different SKU mix is not a reversal.
4. **State the open consequence.** What remains out after the delivery nets (for example one 19kg deposit).
5. **Write the note** under `docs/previews/<date>_<ACCOUNT>_<CN>_double_credit_check.md`: question, decomposition table, comparison table, conclusion with what it does **not** prove (physical return of cylinders, who owns the cash-paid cylinders, custody variances), tripwires. Propose nothing the operator has not asked for.

## 4. Worked example: TWK002 CN 15775 vs STAT 123 (2026-10-12)

Rates on the lines: 19kg R690.00, 9kg R517.50. Source: `docs/previews/2026-10-12_TWK002_CN15775_double_credit_check.md`.

| Pair paid on STAT 123 | 19kg | 9kg | Net (R) |
| :--- | ---: | ---: | ---: |
| 43294 / CN 12550 | -2 | +3 | 172.50 |
| 43909 / CN 12724 | +2 | -2 | 345.00 |
| 47196 / CN 13716 | +5 | +7 | 7,072.50 |
| **Cash paid** | **+5** | **+8** | **7,590.00** (5 x 690 + 8 x 517.50) |
| Open pairs 52484 / 15443 and 52803 / 15553 | +2 | -2 | 345.00 |
| All five pairs | +7 | +6 | 7,935.00 |

| DN#23843 (08 Oct 2026) | 19kg | 9kg | Amount (R) |
| :--- | ---: | ---: | ---: |
| Invoice 53507, cylinder lines | +5 | +10 | 8,625.00 |
| CN 15775 | -4 | -10 | -7,935.00 |
| Net on the delivery | +1 | 0 | 690.00 |

Findings: by value CN 15775 equals the all-pairs net (R7,935.00), by cylinder it does not (4 x 19kg + 10 x 9kg against 7 x 19kg + 6 x 9kg). It returns no more of any SKU than 53507 delivered, so it does not need the cash-paid cylinders to exist. **No double credit indicated** (ASSERTED; quantities PROVEN). Open consequence: one 19kg deposit (R690.00) stays out. Not proven: that the customer physically returned the cylinders; the custody of the 5 x 19kg and 8 x 9kg treated as customer-owned; the R-57.50 custody variance and the -1 x 14kg on CN 14414. Result recorded by the operator as the CYL lane ruling on CN 15775 (`rowNotes`, ADM-94 Q5, 2026-10-12).

## 5. Traps

- Same value, different SKU mix, is not a reversal.
- Header-fallback rows have no lane evidence; say so before reasoning from them.
- A price-only difference (TWK003 47866 / CN 13933) is not a cylinder question; see ALLOCATION_DOCTRINE 6.1 and its 2026-10-13 note.
- Custody counts are `unverified` until a stock count; the ERP credit is not a count.

## 6. Tripwires (state them in every note)

A remittance or correction naming the credit note or its invoice; a DB re-sync that changes the SKU lines; a ruling that the cash-paid cylinders are not customer-owned; a later credit of the same SKU on another document.
