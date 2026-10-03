# MD0003 — H-017 Remittance Contradictions (2026-10-03)

**Task:** `shared/HUMAN_TASKS.md` H-017 — open-invoice list over-states the account by R59,456.42.
**Statement TXT:** `raw/Enquiry/DEBENQ_CURRENT.TXT` (CURRENT BALANCE R18,853.36, last row 2026-08-09).
**Gate:** `npm run debtors:tag-check -- --debtor MD0003`
**Status:** Prerequisite done; 13 invoices proposed for closure — **PROPOSED — NOT RATIFIED** (operator decision required). R12,263.61 over-statement remains unexplained.

---

## 1. Prerequisite: remittance lines extracted

`scripts/build_remittance_lines.mjs --write` reads each COD advice PDF (`pdftotext -layout`) and writes
`data/remittance_lines_{2023,2025,2026}.csv` in the TWK002 shape. Each advice is gated against
`data/remittance_manifest_*.json`: Σ lines = printed payment total = manifest `remittanceTotal`, and line count = manifest `lineCount`. All 9 advices pass. **PROVEN** — script output.

| Advice | Batch | ERP receipt | Lines | Payment total |
| :--- | :--- | :--- | ---: | ---: |
| 01.01.2023.pdf | RM-2023-01-01 | 17669 | 4 | R12,025.08 |
| 01.11.2025.pdf | RM-2025-11-01 | 42051 | 10 | R35,770.31 |
| 31.01.2026.pdf | RM-2026-01-31 | 43239 | 5 | R17,999.24 |
| 02.03.2026.pdf | RM-2026-03-02 | 43494 | 6 (incl. C/N 14328) | R13,845.67 |
| 01.04.2026.pdf | RM-2026-04-01 | 43854 | 4 | R13,773.92 |
| 01.05.2026.pdf | RM-2026-05-01 | 44231 | 5 | R15,017.78 |
| 01.06.2026.pdf | RM-2026-06-01 | 44561 | 3 | R13,014.20 |
| 01.07.2026.pdf | RM-2026-07-01 | 44972 | 4 | R17,311.60 |
| 01.08.2026.pdf | RM-2026-08-01 | 45595 | 4 | R14,863.43 |

Corrections to the H-017 premise:
- There are **9** COD advices on disk, not 28 PDFs. `10.10.2025.pdf` is the customer's A/P vendor-transactions report (already used as `customer_ap_ledger`). `2026-07-13_FNB_PaymentNotification_ZAR8050.pdf` is a bank notification with reference "Mid004", not an advice. **PROVEN** — `raw/Remittances/`.
- `remittance_manifest_2026.json` carries batch totals only and has no `lines[]`. Line detail came from the PDFs.
- `remittance_manifest_2023.json` was invalid JSON because `sourceFiles` was never closed. It has been repaired structurally (one `}` and one `],`). No values were changed.
- Three advices print a Gross *Total* that doesn't match their lines (01.11.2025: R321,932.79; 01.04.2026: R55,095.68; 01.07.2026: R69,246.40). This is a print artefact on the customer's side. The Payment column ties on every advice, and the gross total is not gated.

## 2. Gate result after extraction

`evidence.basis` changed from `PATTERN_ONLY` to **`REMITTANCE_BACKED`** (44 invoice docs). The gate now reports `BLOCKED (INVOICE_ON_REMITTANCE_STILL_OPEN)`, with 13 LIKELY_PAID, 9 CLEAR and the invariant still BREACHED by R59,456.42. **PROVEN** — gate output 2026-10-03.

### 13 invoices the customer's advices say are paid

| Inv | Inv date | Due | Advice | Receipt | Receipt in TXT |
| :--- | :--- | ---: | :--- | :--- | :--- |
| 49573 | 2026-03-04 | 3,443.48 | RM-2026-05-01 | 44231 | −15,017.78, **untagged** |
| 49796 | 2026-03-18 | 3,472.29 | RM-2026-05-01 | 44231 | 〃 |
| 49905 | 2026-03-25 | 1,157.43 | RM-2026-05-01 | 44231 | 〃 |
| 50004 | 2026-03-30 | 3,472.29 | RM-2026-05-01 | 44231 | 〃 |
| 50013 | 2026-03-31 | 3,472.29 | RM-2026-05-01 | 44231 | 〃 |
| 50100 | 2026-04-06 | 5,205.68 | RM-2026-06-01 | 44561 | **mistagged** — see below |
| 50671 | 2026-05-14 | 4,539.72 | RM-2026-07-01 | 44972 | −17,311.60, **untagged** |
| 50867 | 2026-05-25 | 3,026.48 | RM-2026-07-01 | 44972 | 〃 |
| 50886 | 2026-05-27 | 4,539.72 | RM-2026-07-01 | 44972 | 〃 |
| 50996 | 2026-06-02 | 5,822.54 | RM-2026-08-01 | 45595 | −14,863.43, **untagged** |
| 50998 | 2026-06-02 | 349.99 | RM-2026-08-01 | 45595 | 〃 |
| 51099 | 2026-06-09 | 4,345.45 | RM-2026-08-01 | 45595 | 〃 |
| 51398 | 2026-06-24 | 4,345.45 | RM-2026-08-01 | 45595 | 〃 |
| **Total** | | **47,192.81** | | | |

**Receipt-to-advice tie.** Each ERP receipt total equals its advice cash to the cent: 44231 R15,017.78, 44561 R13,014.20 (3,904.26 + 3,904.26 + 5,205.68), 44972 R17,311.60 and 45595 R14,863.43. **PROVEN** — `DEBENQ_CURRENT.TXT` lines 271, 282–284, 298, 317 against the advices.

**Tag swap on 44561 / 44972.** The advice for 44561 (STAT:127) lists invoices 50100, 50234 and 50429. ERP tagged the receipt to 50234, 50429 and **50524**. Invoice 50524 is on the *next* advice (RM-2026-07-01, receipt 44972). Both invoices are paid, but ERP closed the wrong one, which leaves 50100 looking open. This is ERP-side tagging (§3), and it doesn't change the account balance. **PROVEN** — TXT lines 282–284 against 01.06.2026.pdf and 01.07.2026.pdf.

The R47,192.81 equals the sum of the untagged receipts 44231, 44972 and 45595 exactly (15,017.78 + 17,311.60 + 14,863.43), once the 50100↔50524 swap is accounted for. **PROVEN** — arithmetic on the rows above.

## 3. Proposed `closedInvoiceOverrides` — PROPOSED — NOT RATIFIED

`config/statement_of_account.json` has no `closedInvoiceOverrides` key yet. If the operator ratifies, add the 13 docs above with reasons in the TWK002 form, for example:

```json
{ "doc": "49573", "reason": "Paid via COD remittance RM-2026-05-01 (raw/Remittances/01.05.2026.pdf), receipt 00044231 STAT:126 — advice total = receipt total R15,017.78." }
{ "doc": "50100", "reason": "Paid via COD remittance RM-2026-06-01 (raw/Remittances/01.06.2026.pdf), receipt 00044561 STAT:127. ERP tagged that slice to 50524 (paid on RM-2026-07-01) instead." }
```

**Decision needed (operator):** ratify all 13, a subset, or none. Nothing has been written to config.

## 4. What is still unexplained — R12,263.61

After the 13 are closed, the 9 remaining open invoices total **R31,116.97**, against an ERP balance of **R18,853.36**. The list would still over-state the account by **R12,263.61**. **ASSERTED** — arithmetic on gate output; no artifact proves the cause yet.

The 9 remaining invoices are 51470 (June; not on the 01.08.2026 advice), 51655, 51839, 51923, 52102, 52219 and 52242 (the July statement, R25,014.18, with no advice yet), and 52421 and 52422 (August).

The untagged credits still unaccounted for total **R18,281.90**:

| Receipt | Date | Untagged amount |
| :--- | :--- | ---: |
| 44785 | 2023-10-02 (STAT 96) | 12,838.37 |
| 37143 | 2025-02-03 | 44.74 |
| 37144 | 2025-02-03 | 889.56 |
| 42051 | 2025-11-01 | 469.87 |
| 42440 | 2025-11-28 | 1,787.18 |
| 42440 | 2025-11-28 | 2,252.18 |

That pool is larger than the gap, which implies about R6,018.29 of offsetting tag error in the other direction. Two leads are already visible:
- On 42051, ERP tagged R57.50 to CYL invoice 46445, where the advice says R3,105.00.
- ERP also tagged R2,577.63 to invoice 43319, which is not on the advice.

These are leads, not findings. The next step is to extend the receipt-by-receipt tie to the 2025 advices (RM-2025-11-01, receipt 42051) and the 42440 batch.

## 5. Tripwires
Reopen this analysis if any of these happens:
- a fresh `DEBENQ_CURRENT.TXT` is exported;
- ERP re-tags 44231, 44561, 44972 or 45595;
- an advice for the July 2026 statement or for receipt 42440 arrives;
- a new PDF is added to `raw/Remittances/`. Re-run `build_remittance_lines.mjs --write`, then the gate.
