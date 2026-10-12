# GAS004 family — Combined Exposure (operator-requested)

**Decision (operator 2026-08-17):** treat Gas2Go as one commercial family with **GAS004** as primary. Do **not** merge ERP master data in this turn.

**Kill condition:** a sibling TXT that shows a different customer / site that is not Gas2Go Hilton.

---

## Codes

| Code | Name | Role |
| :--- | :--- | :--- |
| **GAS004** | GAS 2 GO HILTIN NEW ACCOUNT | Primary trading — this workspace |
| GAS002 | GAS 2 GO - HILTON | Likely superseded Hilton code (credit on stale global) |
| GAS003 | GAS TO GO EMPTIES | Empties sibling |
| GAS010 | GAS 2 GO EMPTIES | Empties sibling |

Hypothesis that GAS002 is the old account and GAS003/GAS010 are empties splits is **ASSUMED** until sibling TXTs exist.

---

## Balances

| Account | Balance | As-at | Basis | Tag |
| :--- | ---: | :--- | :--- | :--- |
| GAS004 running close | **R20,061.51** | 2026-08-03 | `DEBENQ_CURRENT.TXT` last BALANCE | **PROVEN** (TXT) |
| GAS004 header CURRENT BALANCE | R30,242.46 | 2026-08-03 | same file, excludes UD R-10,180.95 | **PROVEN** identity vs running close |
| GAS002 | −R2,111.47 | 2025-07-13 | `130720251H45M.TXT` | **ASSERTED_STALE** |
| GAS003 | R15,557.01 | 2025-07-13 | same | **ASSERTED_STALE** |
| GAS010 | R10,165.99 | 2025-07-13 | same | **ASSERTED_STALE** |

Do **not** add the four rows into a live collectable. Sibling figures are ~13 months old. Combined family total is not stated until **H-020** (fresh global) or sibling DEBENQ files land.

---

## Related artifacts

- `reports/GAS004_Onboarding_Status.md`
- `raw/DEBENQ_CURRENT.TXT`
- `analysis/debtors/Global Reports/130720251H45M.TXT` (sibling rows only)
