# TWK002: CN 15775 double-credit check (STAT 123 cash deposits vs cylinder quantities)

**Date:** 2026-10-12. **Status:** evidence only. PROPOSED, NOT RATIFIED. No lock, no tie approved, no ruling recorded; the CN 15775 lane and any custody conclusion remain the operator's.
**Question (from `docs/previews/2026-10-10_TWK_family_children.md` B2 and `TWK002/reports/TWK002_open_rows_analysis.md` §8.22):** does CN 15775 (-R7,935.00) credit cylinders the customer already paid for in cash on STAT 123 (R7,590.00), i.e. a double credit?
**Channel:** connector-sourced (db_replay), `analysis/debtors/TWK002/data/db_replay/2026-10-11/` (md5-verified captures `dd65819c227afafa` quantities by SKU, `a73813cd77cefdc9` CYL amounts). Remittance side: `analysis/debtors/TWK002/data/remittance_lines_2026.csv` (BATCH-2026-STAT-123). Rates: 19.1 = R690.00, 9.1 = R517.50 (`statement_v5.json` skuRates; they reproduce the DB nets exactly).

## 1. The R7,590.00 decomposes into whole cylinders (PROVEN)

STAT 123 pays these invoices gross and these credit notes at face (`remittance_lines_2026.csv`: 43294 / CN 12550, 43909 / CN 12724, 47196 / CN 13716). Net quantity per pair, from the DB lines:

| Invoice / CN | 19kg | 9kg | Net (R) |
| :--- | ---: | ---: | ---: |
| 43294 / 12550 | -2 | +3 | 172.50 |
| 43909 / 12724 | +2 | -2 | 345.00 |
| 47196 / 13716 | +5 | +7 | 7,072.50 |
| **Paid in cash on STAT 123** | **+5** | **+8** | **7,590.00** |
| 52484 / 15443 and 52803 / 15553 (still open) | +2 | -2 | 345.00 |
| **All five pairs** | **+7** | **+6** | **7,935.00** |

Every net is a whole number of cylinders at the stated rate (this is the DEBTORS_DOCTRINE §4 decomposition that was marked `unverified` in §8.8; it now holds). Under ALLOCATION_DOCTRINE §1.3 the 5 x 19kg and 8 x 9kg paid in cash are customer-owned (ASSERTED: a doctrine reading, not an operator ruling).

## 2. CN 15775 against them

| Document (DN#23843, 08 Oct 2026) | 19kg | 9kg | Amount (R) |
| :--- | ---: | ---: | ---: |
| Invoice 53507, CYL lines | +5 | +10 | 8,625.00 |
| CN 15775 | -4 | -10 | -7,935.00 |
| **Net on the delivery** | **+1** | **0** | **690.00** |

* **By value, CN 15775 equals the all-pairs net (R7,935.00). By cylinder it does not.** The all-pairs net is 7 x 19kg and 6 x 9kg; CN 15775 is 4 x 19kg and 10 x 9kg. Same total, different mix (PROVEN arithmetic). So CN 15775 is not an SKU-level reversal of those older nets; the equal total is a coincidence of value (ASSERTED reading).
* **CN 15775 stays inside its own delivery.** Per SKU, the cylinders it returns (4 x 19kg, 10 x 9kg) do not exceed the cylinders invoiced on 53507 the same day (5 x 19kg, 10 x 9kg). It is the usual invoice-plus-empties-credit pattern for one delivery (PROVEN quantities; the pattern reading is ASSERTED).
* **No overlap with the cash-paid cylinders on the quantities available.** Nothing in CN 15775 needs the older 5 x 19kg + 8 x 9kg to exist. Had it credited more of a SKU than 53507 delivered, the excess would have had to come from earlier deposits, and that would be the double-credit signal; there is none.
* **Open consequence, not a double credit:** one 19kg deposit (R690.00) from DN#23843 remains out (the R+690.00 CYL net).

## 3. Conclusion

**No double credit is indicated** between STAT 123 cash deposits (R7,590.00) and CN 15775: the credit is fully covered by its own delivery's cylinder lines, and the cash-paid cylinders are a different set (ASSERTED, quantities PROVEN). What this does **not** prove:
* that the customer physically returned the cylinders on CN 15775 (ERP credit, not a count; `unverified`);
* the physical state of the 5 x 19kg and 8 x 9kg treated as customer-owned (custody conclusion; the operator has not ruled);
* the R-57.50 custody variance and the -1 x 14kg from CN 14414 (12 Feb 2026), which this check does not touch (`unverified`).

**Tripwires (reopen if):** a customer remittance or correction naming 15775 or 53507; a DB re-sync that changes the 53507 / 15775 SKU lines; a ruling that the older cash-paid cylinders are not customer-owned; any credit of 19kg or 9kg on a later document that exceeds its own delivery.
