# MOZ002 Allocation Doctrine (v1)

**Account:** MOZ002 — MOZAMBIK  
**Status:** **Locked — Turn 1 complete (2026-07-16)**  
**Lane:** `allocation` (invoice-linked, LPG-only match)  
**Scope:** **2025–2026** (`raw/MOZ002CURRENT.TXT`, Mar 2025 – Jul 2026)

---

## 0. Lane ruling

| Item | Ruling |
| :--- | :--- |
| Worker lane | **`allocation`** — WO0001-class LPG-only payment matching |
| Settlement discount lane | **Abandoned** — operator confirmed **no settlement discount** |
| Reference archetype | **WO0001** (`SKILL_Payment_To_Invoice_Allocation.md`) |
| Portfolio triage | `defer`, tier **B** (`portfolio_candidates.csv`) |

> **Gate:** No collection action until `reconState: complete`. Payment rows in CURRENT export carry `STAT` batch refs only (no `INVNO`); allocation uses open-balance / proximity matching per WO0001 engine, not ERP clerk `ref_no` alone.

---

## 1. Commercial model (locked 2026-07-16)

| # | Question | Ruling | Confirmed |
| :---: | :--- | :--- | :---: |
| 1 | **Settlement pattern?** | **NONE** — no remittance-batch discount settlement | ✅ |
| 2 | **Unit of work?** | **Invoice document** — allocate payment to target LPG invoice | ✅ |
| 3 | **Discount terms?** | **NONE** — no `DISCOUNT ALLOWED` journals expected | ✅ |
| 4 | **ERP behaviour observed?** | **Gross payment posting** to STAT batches (`STAT 112`–`STAT 128`); `DISCOUNT` column unused. CURRENT export: **40 payments** Mar 2025 – Jul 2026. | ✅ |
| 5 | **CYL/EMPTIES in match base?** | **LPG-only** — match payment to LPG line total, not header (WO0001 style). Cylinder deposits settled via empty invoices + credit notes, **not payment slices**. Operator confirmed 2026-07-16: payment CYL splits (e.g. 41529) are **excluded** from allocation for MOZ002. | ✅ |

### Match rules (allocation)

```text
payment_doc_total  = sum(ERP payment rows sharing doc_no)
match_target       = LPG line total on target invoice (not header, not CYL)
tolerance          = R0.05 cent alignment; R0.06–R1.00 → Section 5 review (WO0001 truncation rule)
split_batches      = STAT 11x–12x may group payments; each payment doc allocates independently
prepayment         = payment_date < invoice_date → UNALLOCATED + review_required
partial_empty_cn   = register in overrides when return qty < delivery qty
```

**Not applicable:** Model B discount math, pro forma `DISCOUNT ALLOWED` journals, remittance discount column.

---

## 2. Known exceptions (operator-confirmed)

| Doc | Type | Amount | Expected | Variance | Reason | Status |
| :--- | :--- | ---: | ---: | ---: | :--- | :---: |
| 00014741 | Crd Note (empty) | R2,415.00 | R2,932.50 | R517.50 | Customer returned **1 × 9kg cylinder short** (1 × R450 + VAT = R517.50) | ✅ Registered |

Empty invoice `00050174` (DN-22161-EMPTY) remains open by R517.50 until further return or write-off.

---

## 3. ERP evidence (`MOZ002CURRENT.TXT`)

**Export:** Account enquiry, CURRENT year, excludes allocation detail.  
**Range:** 15 Mar 2025 – 13 Jul 2026 · **40 payments** · **~100 invoices**

### Payment batch families

| STAT range | Period | Count (approx.) |
| :--- | :--- | ---: |
| STAT 112–121 | Mar–Dec 2025 | ~24 |
| STAT 122–128 | Jan–Jul 2026 | ~16 |

### Apr 2026 pilot slice (header amounts — LPG split requires line detail)

| Payment doc | Date | STAT | Amount | Likely target | Notes |
| :--- | :--- | :--- | ---: | :--- | :--- |
| 00043878 | 2026-04-02 | STAT 125 | R2,428.41 | 00049933 | Exact = invoice gross; LPG split TBD |
| 00043962 | 2026-04-09 | STAT 125 | R2,971.08 | 00050066 | Header match; LPG split TBD |
| 00044028 | 2026-04-16 | STAT 125 | R2,971.08 | 00050173 | Header match; LPG split TBD |
| 00044147 | 2026-04-30 | STAT 125 | R4,074.62 | 00050305 | Header match; LPG split TBD |

**Portfolio snapshot** (`Global Reports/130720251H45M.TXT`, 2026-07-13):

| Field | Value |
| :--- | ---: |
| CURRENT BALANCE (portfolio) | R22,898.47 |
| CURRENT BALANCE (TXT export) | R13,014.50 |
| 180 days | R3,190.07 |
| Credit limit | R30,000 |
| Terms | *(blank)* |

> Portfolio vs TXT balance delta reflects export date / scope — reconcile at Turn 5.

---

## 4. Evidence hierarchy

| Tier | Source | Role | Status |
| :--- | :--- | :--- | :---: |
| **1** | ERP TXT (`raw/MOZ002CURRENT.TXT`) | Ledger truth, running balance | ✅ |
| **2** | LPG line detail (DB / allocation detail export) | LPG-only match targets | ❌ **Needed for Turn 2** |
| **3** | Remittance advice (if issued) | Cash sign-off cross-check | ❌ Missing |
| **4** | Deposit detail CSV / screenshots | Bank deposit vs ERP payment | ❌ Missing |
| **5** | Operator analysis spreadsheet | Exception hints | ❌ Missing |

---

## 5. Deliverables & artifact layout (allocation lane)

| Turn | Deliverable | Artifacts |
| :--- | :--- | :--- |
| **1** | Scaffold + doctrine | `project.json`, this doctrine, overrides registry ✅ |
| **2** | Pilot allocation | Apr 2026 month → `allocation_edges.csv` slice + pilot report | ✅ |
| **3** | Full 2025–2026 ingest | Complete `allocation_edges.csv`, payment doc allocation report | ✅ |
| **4** | Exceptions | Populated `payment_pattern_overrides.json` + exception audit | ✅ |
| **5** | Statement / position | Statement account narrative, unresolved items | ✅ |
| **6** | Payment pattern (optional) | STAT batch family report if overrides needed |

---

## 6. Open questions

1. **Remittances:** does MOZ002 issue remittance advices, or STAT-batch EFT only?
2. **Other partial empty CNs** at R2,415.00 — same 1-cylinder-short pattern? (multiple in TXT)

---

## 7. Revision log

| Date | Version | Change |
| :--- | :--- | :--- |
| 2026-07-13 | settlement-discount-v1-draft | Provisional settlement_discount scaffold (superseded) |
| 2026-07-16 | allocation-v1 | Lane locked; scope 2025–2026; LPG-only match; CN 00014741 exception |
| 2026-07-16 | allocation-v1.5 | Turn 5: MOZ002_Statement_Account_v1.md — position bridge + open items |
