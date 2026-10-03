# CAP000 Remittance Discovery Summary — 2026-10-03

**Account:** CAP000 — CAPITOL CATERERS SELECT (PTY)  
**Lane:** H-011 allocation (DEBENQ-only → remittance evidence)  
**Status:** Discovery + **ingest of 3/8 complete** (see amendment below); 5 payments still missing remittance  
**Canonical payment universe:** **R184,013.63** (`PROVEN` — eight DEBENQ Payment rows)

---

## Breakthrough

Google Drive search located **3 of 8** remittance workbooks whose filenames/amounts **exactly match** unallocated STAT payments. Mapping and ingestion workflow: `raw/Remittances/CAP000_REMITTANCE_MAPPING.md`.

Folder: https://drive.google.com/drive/folders/1zSMLoURs99ML8SnMpRTlg8wZYWCrm9Yg

---

## Three remittances (ingested)

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

## H-011 impact (post-ingest amendment)

| Claim | Verdict |
| :--- | :--- |
| 3 remittances ingested | **Done** — `config/remittance_allocations.json` + ingest script |
| ASSUMED → PROVEN | **7 in-universe invoices** now `PROVEN` / tier 1 in `reconciliation_status.csv` |
| Payment coverage | R51,321.29 of R184,013.63 linked; **5 orphans R132,692.34** |
| Account balance | Still **PROVEN R70,773.28** |

Open review items: R113.75 adj on 00038536 (not in ERP); CN 12245 mapping Medium/ASSERTED.

---

## Next steps (executable)

```bash
node analysis/debtors/CAP000/scripts/remittance_allocation_ingest.mjs
npm run debtors:reconciliation-status -- --debtor CAP000
```

1. Request remittances for the remaining **R132,692.34**, starting with **00041466**.
2. Operator decision on R113.75 “adj to statement” (settlement-discount candidate).
3. Confirm or replace CN 12245 ↔ printout “CN 42146” mapping.
4. Optional: move non-CAP000 files out of `raw/Remittances/Remittances/` (GAZ EXPRESS / BELLA / MIDLANDS dump).

---

## Tripwires

| Ruling | Reopens / falsifies if |
| :--- | :--- |
| Remittance net = ERP payment | Fresh printout totals differ, or ingest script throws |
| 7 PROVEN in-universe invoices | Edge regeneration drops a Confirmed `REMITTANCE_EXPLICIT` row |
| Remaining R132,692.34 | Additional remittances found for the five missing docs |
| R113.75 review_required | ERP posts the adjustment, or operator allocates it to a named invoice |
