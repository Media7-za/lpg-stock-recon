# SA0001 — July 2026 open invoices (projection)

**As-at:** 31 Jul 2026 (last row in `raw/SA0001.TXT`)  
**Scope:** **July-issued LPG gas invoices still unpaid** after July STAT payments and same-month empty credit notes.  
**Classification:** **ASSERTED** (TXT running balance; no August payment in extract).

---

## Open July gas — debtor view

| Gas inv | Date | DN | Description | Open (ZAR) | Age (days)* | Empty inv | Empty CN |
| :--- | :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| **52100** | 27/07/2026 | DN#22846 | LPG delivery | **6 699,21** | 4 | 52101 | 15347 ✓ |
| **52193** | 30/07/2026 | DN#23928 | LPG delivery | **314,03** | 1 | 52194 | 15362 ✓ |
| | | | **Total open July gas** | **7 013,24** | | | |

\*Age to 31/07/2026.

Deposit legs **not** shown — credited in July; **collectable lines for matching** are gas only.

---

## Projection note

| Field | Value |
| :--- | :--- |
| Sum open July gas | **R7 013,24** |
| Typical next STAT 128 pattern | **R6 699,21 + R314,03** (same as payment **45194** on 13/07) |
| ERP `CURRENT BALANCE` (header) | R10 804,97 — includes **older** ledger exposure beyond this July cohort |
| Share of header from this cohort | **R7 013,24 / R10 804,97 ≈ 64,9%** (remainder = prior-period gas per TXT) |

---

## Status vs July payment run

All other **July** gas invoices were cleared by payments **44962–45466** (see `SA0001_July_2026_Payment_Match.md`). Only **52100** and **52193** remain open at month-end in the extract.

---

## Visual

Canvas: `sa0001-july-2026-open-invoices.canvas.tsx`
