# JES002 Onboarding Status

**Account:** `JES002` — JESMOND EMPTIES
**Scaffolded:** 2026-10-20
**reconState:** pending
**ERP anchor:** none (**UNVERIFIED**)

---

## 1. What exists

| Artifact | Path | State |
| :--- | :--- | :--- |
| Project file | `analysis/debtors/JES002/project.json` | Created (scaffold) |
| Folders | `raw/`, `config/`, `data/`, `reports/` | Created, empty except this report |
| ERP statement TXT | `raw/` | **Missing** |
| Statement config | `config/statement_v5.json` | Not created (needs the TXT for periodStart and balances) |
| DB snapshot | `data/` | Not created |

## 2. What the shared ERP extracts show (PROVEN, row counts only)

Source: `ERP RAW DATA/` (shared extracts, not an account statement).

| Extract | JES002 rows | Date range (document dates) |
| :--- | ---: | :--- |
| `2024.TXT` | 24 | 17 Oct 2023 – 22 Feb 2024 |
| `CURRENT.TXT` | 77 | 4 Mar 2024 – 5 Sep 2025 |
| `DETRANS.TXT` | 12 | 5 Sep 2025 |
| `STTRANS.TXT` | 12 | 5 Sep 2025 |

- Customer name on the ledger lines is `JESMOND EMPTIES`.
- Sister code `JES001` (`2 ON JESMOND ROAD PTY LTD`) appears in `DETRANS.TXT` and is a **separate** account. Do not merge the two.
- Products seen: 9.1 9KG CYLINDER DEPOSIT, 9.4 9KG ORYX LPG, one 48KG SV CYLINDER DEPOSIT line.
- Most documents from 5 Sep 2025 are reversed the same day by credit notes, so the net position cannot be read from these rows. These are not a balance and are **not** a substitute for the statement TXT.

## 3. Operator decisions and inputs needed

1. Export the ERP account statement for `JES002` (the same format as `analysis/debtors/JAY000/raw/JAY000CURRENT.TXT.TXT`) and save it to `analysis/debtors/JES002/raw/`.
2. Confirm the collection posture for JESMOND EMPTIES. The status is `active`, `actionRequired: false`.

## 4. Tripwires

- Statement TXT arrives: fill `financials`, create `config/statement_v5.json`, run the shared v5 generator, and run the ingest coverage check. Then move `ingestGate` from `unverified` and clear the STALE_SOURCE blocker.
- Any JES002 document appears in a later extract dated after 5 Sep 2025: update `lastInvoiceDate` and the history.
