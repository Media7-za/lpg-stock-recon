# TWK002 — Phase 2 ERP linkage (2025)

**Generated:** 2026-08-09  
**Authority:** Remittance PDFs in `raw/Remittances/` · ERP `TWK0022024.TXT` / `TWK002CURRENT23072026.TXT`

---

## Summary

| Metric | Value |
| :--- | ---: |
| Batches ingested | **3** (Jan / Mar / May 2025 paid dates) |
| STAT labels | **110**, **112**, **114** |
| Match type | **3× CASH_ONLY** (payment = remittance cash; discount journal missing) |
| Discount to post (Path B) | **R735.70** (112.78 + 228.93 + 393.99) |
| Checklist | `data/finance_posting_checklist_2025_phase2.csv` — **3/3 posting DONE** (2026-08-09) |

---

## Batch table

| Paid | STAT | Batch | PDF | Receipt | Remit. cash | ERP payment | Δ gross | Journal |
| :--- | :---: | :--- | :--- | :--- | ---: | ---: | ---: | ---: |
| 31/01/2025 | 110 | BATCH-2025-01-31 | `31.01.2025.pdf` | `00036467` | R4,398.27 | R4,398.27 | R-112.78 | **R-112.78** |
| 31/03/2025 | 112 | BATCH-2025-03-31 | `31.03.2025(1).pdf` | `00037770` | R35,693.84 | R35,693.84 | R-228.93 | **R-228.93** |
| 31/05/2025 | 114 | BATCH-2025-05-31 | `31.05.2025.pdf` | `00039080` | R15,365.65 | R15,365.65 | R-393.99 | **R-393.99** |

**Receipt vs paid date:** STAT 112 receipt **28/03/2025**; STAT 114 **30/05/2025**. Journal **post date** = remittance **electronic paid date** (doctrine v2 §2).

**STAT 110:** Previously marked “partial” — PDF shows **full** batch (gross R4,511.05; cash R4,398.27).

---

## PDF notes

| File | Note |
| :--- | :--- |
| `31.03.2025.pdf` | Image-only scan (~51 KB) — use **`31.03.2025(1).pdf`** for machine ingest |
| `31.05.2025(1).pdf`, `(2).pdf` | Duplicates of text advice; canonical **`31.05.2025.pdf`** |

---

## Still open

- **STAT 111**, **113**, **115–122** — no ERP line in indexed TXTs; may need full-history export or later remittances.
- **STAT 123** — `00043500` Feb 2026; see `18.02.2026.pdf` when extending.
- **Posting** — three Path B journals **posted** 2026-08-09 (`journal_done` on checklist); confirm via fresh TXT + ERP journal numbers.

**Pro forma ref splits:** `data/proforma_journals_2025.csv`  
**Line detail:** `data/remittance_lines_2025.csv`
