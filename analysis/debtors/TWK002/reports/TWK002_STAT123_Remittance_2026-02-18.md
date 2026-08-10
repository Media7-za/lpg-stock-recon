# TWK002 — STAT 123 remittance (`18.02.2026.pdf`)

**Generated:** 2026-08-10  
**PDF:** `raw/Remittances/18.02.2026.pdf` (InterForm400 — **text in content stream**, plus logo images)

---

## Header

| Field | Value |
| :--- | :--- |
| Reference | **B226 / KRD4041771** |
| Advice date | **18/02/2026** |
| Electronic paid | **28/02/2026** |
| Contact | SHANTELLE NELSON |

---

## Footer (settlement)

| Col (advice) | Amount |
| :--- | ---: |
| Footer col1 | R260,163.36 |
| Already paid | R19,837.50 |
| **Gross payable** | **R240,325.86** |
| **Discount** | **R0.00** |
| **Cash** | **R240,325.86** |

**Line count:** 46 invoices/CNs (May 2025 – Feb 2026 window; includes **00041747** with **R19,837.50 already paid** — ties to prior STAT 114 partial-payable slice).

---

## ERP link — `00043500` (one bank payment, **three ERP debtor codes**)

**Commercial reality:** one TWK AGRI account with **multiple sites**; **TWK002 / TWK003 / TWK004** are ERP posting buckets, not separate customers.

| ERP code | STAT 123 slice | Balance after | Source |
| :--- | ---: | ---: | :--- |
| **TWK002** | **R176,824.24** | (see TWK002 CURRENT) | `TWK002CURRENT23072026.TXT` |
| **TWK003** | **R38,501.31** | **R−300.00** | `raw/DEBENQ_TWK003.TXT` |
| **TWK004** | **R25,000.31** | **R0.00** | `raw/DEBENQ_TWK004.TXT` |
| **Σ (one remittance)** | **R240,325.86** | | = advice **cash** |

Same doc **`00043500`**, date **25/02/2026**, ref **`TRANSF | STAT 123`** on each enquiry export.

**Earlier “shortfall” on TWK002-only view was misleading** — ERP allocates one remittance cash across site codes; sum of slices matches the advice.

### Site ledgers vs remittance lines

Docs on **TWK003** enquiry (Oct–Nov 2025 invoices + CN activity) appear on the STAT 123 advice (e.g. `00046857`, `00047076`, `00047523`, `00047880`).  
**TWK004** enquiry holds e.g. `00046858`, `00047176`, `00047297`, `00047584` — also on the advice.

Settlement discount on the advice remains **R0.00** — **no DISCOUNT ALLOWED journal** for any slice.

**TWK003 R−300.00** after payment: site ledger **R38,201.31** open docs vs **R38,501.31** payment (**R300 over** on TWK003 code) — optional site-level hygiene; does not change batch-level zero discount.

---

## Status

**Checklist:** `TASK-2026-EVID-01` DONE · `TASK-2026-0001` **DONE** (TWK002 slice; batch cash reconciled via Σ sites; **no journal**)

Line detail: `data/remittance_lines_2026.csv`
