# CAP000 Remittance Discovery Summary — 2026-10-03

**Account:** CAP000 — CAPITOL CATERERS SELECT (PTY)  
**Lane:** H-011 allocation (DEBENQ-only → remittance evidence)  
**Status:** Discovery committed; **ingestion not yet run**  
**Canonical unallocated total:** **R184,013.63** (`PROVEN` — `data/allocation_edges.csv`)

---

## Breakthrough

Google Drive search located **3 of 8** remittance workbooks whose filenames/amounts **exactly match** unallocated STAT payments. Mapping and ingestion workflow: `raw/Remittances/CAP000_REMITTANCE_MAPPING.md`.

Folder: https://drive.google.com/drive/folders/1zSMLoURs99ML8SnMpRTlg8wZYWCrm9Yg

---

## Three remittances ready for ingestion

| Remittance | Payment Doc | Date | Amount (R) | Drive file ID | Epistemic |
| :--- | :--- | :--- | ---: | :--- | :--- |
| Jan–Mar 2025 | 00038536 | 2025-05-07 | 35,844.65 | `1JyyS1NMRqVgdhbnlJvCtQIxdQfs86MMO` | ASSERTED amount match |
| November | 00042697 | 2025-12-18 | 8,356.32 | `1TysrfMSGCvkSgfrAYFuSbEjPUh9fdcb5` | ASSERTED amount match |
| September 2025 | 00042043 | 2025-10-31 | 7,120.32 | `1OfwvjN4eK71uCzCtKXMz__tr_KwBFyNG` | ASSERTED amount match |
| **Matched subtotal** | — | — | **51,321.29** | — | **27.9%** of R184,013.63 |

Direct links:

- https://drive.google.com/file/d/1JyyS1NMRqVgdhbnlJvCtQIxdQfs86MMO/view?usp=drivesdk
- https://drive.google.com/file/d/1TysrfMSGCvkSgfrAYFuSbEjPUh9fdcb5/view?usp=drivesdk
- https://drive.google.com/file/d/1OfwvjN4eK71uCzCtKXMz__tr_KwBFyNG/view?usp=drivesdk

---

## Still missing (5 payments)

| Payment Doc | Date | Amount (R) |
| :--- | :--- | ---: |
| 00041466 | 2025-09-29 | 97,933.00 |
| 00042518 | 2025-12-01 | 12,750.48 |
| 00043235 | 2026-02-05 | 3,656.43 |
| 00043472 | 2026-02-26 | 8,443.46 |
| 00043872 | 2026-03-31 | 9,908.97 |
| **TOTAL** | — | **132,692.34** |

Prior remaining figure **R132,891.34** is **SUPERSEDED**.

---

## H-011 impact

| Claim | Verdict |
| :--- | :--- |
| “28% can now be closed” | **Path opened**, not closed — Excel not yet in-repo; edges still `UNALLOCATED` |
| “ASSUMED → PROVEN” | **Premature** until remittance lines → `REMITTANCE_EXPLICIT` edges + recon-status regenerate |
| Current best tag for the 3 | **ASSERTED** (exact amount match to Drive workbook) |

Account balance remains **PROVEN R70,773.28** (unchanged).

---

## Next steps (executable)

```bash
# After placing the 3 .xlsx files in raw/Remittances/ and writing edges:
npm run debtors:reconciliation-status -- --debtor CAP000
```

1. Download the 3 Excel files into `analysis/debtors/CAP000/raw/Remittances/`.
2. Extract invoice-level breakdowns.
3. Update `data/allocation_edges.csv` (`allocation_type: REMITTANCE_EXPLICIT`).
4. Re-run reconciliation-status for CAP000.
5. Confirm PROVEN / remittance-linked rows in `reports/reconciliation_status.csv`.
6. Request customer remittances for the remaining **R132,692.34**.

---

## Tripwires

| Ruling | Reopens / falsifies if |
| :--- | :--- |
| Drive amount match for a payment | Downloaded workbook totals a different amount, or names a different payment doc |
| Matched subtotal R51,321.29 | Any of the three payment amounts in `allocation_edges.csv` change |
| Remaining R132,692.34 | Additional remittances found for the five missing docs |
