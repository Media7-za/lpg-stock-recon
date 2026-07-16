# BU0005 Allocation Doctrine (v1)

**Account:** BU0005 — CHOBOZA - BULWER  
**Status:** Draft — Turn 1 (2026-07-13)  
**Lane:** `allocation` (WO0001 family) — **not** settlement discount  
**Worker skill:** `.agents/skills/SKILL_Payment_To_Invoice_Allocation.md`

---

## 1. Commercial model (locked Turn 1)

| Element | Ruling |
| :--- | :--- |
| Settlement discount | **NONE** — no remittance-batch 2.5% pattern |
| Unit of work | **Invoice `ref_no`** — payment linked to specific invoice doc |
| Discount terms | **NONE** |
| Payment instrument | EFT `TRANSF` under **`STAT 125`** batches (Bulwer family pattern) |
| Match target | **LPG-only** — strip CYL/EMPTY lines before amount comparison |
| CYL/EMPTIES in match base | **No** — dual-line DN pairs (e.g. `DN-22310` + `DN-22310-EMPTY`) treated like WO0001; LPG invoice is allocation target |
| Tolerance | **R0.05** cent alignment on LPG slice; excess is **rounding**, not open invoice |
| Rounding treatment | **Intentional** — ERP Agent posts **`DISCOUNT ALLOWED`** journal on payment date (operator ruling 2026-07-15) |
| Terms | **COD** — no formal settlement discount window |

---

## 2. ERP behaviour observed (preliminary)

Evidence source: `analysis/debtors/shared/raw/april_dump.TXT` (Apr 2026 slice) + global aged-debt snapshot.

| Signal | Observation |
| :--- | :--- |
| Payment posting | **Gross cash-only** — `DISCOUNT` column R0.00 on payment rows |
| `ref_no` linkage | **Mixed** — sibling account BU0002 posts payment with explicit invoice `ref_no`; BU0005 payment `00044065` has **blank `ref_no`** on STAT 125 batch |
| Dual-line DN | Invoice `00050193` (LPG R1,159.38) + `00050194` (EMPTY R2,070.00) under `DN-22310`; EMPTY reversed by CN `00014749` same period |
| Payment split (STAT 122) | **Confirmed** in `DETRANS`: R1,027.87 ref `00048766` + R2.13 blank rounding slice |
| Rounding slices (124/125) | R2.49 and R10.62 — same pattern inferred; journals **not yet posted** |
| CURRENT TXT export | **Excludes allocation detail** — use DETRANS or allocation-inclusive export for ref splits |

> Pre-2026 TXT required for B/F R1,378.19 decomposition (operator confirms available — pending intake to `raw/`).

---

## 3. Evidence hierarchy

| Tier | Source | Role |
| :--- | :--- | :--- |
| **1** | ERP TXT + payment `ref_no` when present | Primary allocation graph when LPG amounts align within R0.05 |
| **2** | Bank deposit / EFT proof | Confirms cash received; does not override ref_no without operator approval |
| **3** | Remittance advice | **Not expected** for this COD Bulwer-family payer — only if customer later provides |
| **4** | Operator notes / spreadsheet | Exception flags only — never silent adjust |

**Remittance PDFs:** Not required for lane confirmation. If supplied later, use for cash sign-off only — not discount reconstruction.

---

## 4. Allocation rules (WO0001-aligned)

| Rule | Ruling |
| :--- | :--- |
| Payment doc aggregation | Sum all rows sharing `payment_doc` before matching |
| `ref_no` present + LPG match | **Tier 1 confirmed** when variance ≤ R0.05 |
| Blank `ref_no` | **Tier 5 review** — do not auto-allocate (see WO0001 doc 43757 precedent) |
| Prepayment (`payment_date < invoice_date`) | **UNALLOCATED** + `review_required: true` |
| Instalments | One EFT = one allocation pass — never sum across payment docs |
| Override registry | Per payment/target pair in `config/payment_pattern_overrides.json` |

---

## 5. Deliverables & turn plan (allocation lane)

| Turn | Deliverable | Artifacts |
| :--- | :--- | :--- |
| **1** | Scaffold + doctrine | `project.json`, this doctrine, empty `payment_pattern_overrides.json`, onboarding status |
| **2** | ERP ingest + pilot | `raw/BU0005*.TXT`, baseline report, pilot allocation on latest STAT 125 payment |
| **3** | Allocation graph | `data/allocation_edges.csv`, `[CODE]_Payment_Allocation_v1.md` |
| **4** | Outstanding + exceptions | Overrides populated, exception register, DN-pair recon where EMPTY lines present |
| **5** | Statement bridge | `[CODE]_Statement_Account_v1.md`, position vs global aged debt |
| **+** | Collections gate | No collection recommendation until `reconState: complete` |

**Settlement-discount artifacts (`settlement_discount_overrides.json`, proforma discount journals) are explicitly out of scope.**

---

## 6. Skill relationship

| Skill | Applicability |
| :--- | :--- |
| `SKILL_Payment_To_Invoice_Allocation.md` | **Primary** — invoice ref_no linked payments |
| `debtors-analysis_Skill.md` | Graph states, exception taxonomy after edges built |
| `ALLOCATION_DOCTRINE.md` | CYL settlement evidence tiers for EMPTY/DN pairs |
| TWK002 settlement discount doctrine | **Not applicable** — no batch discount journals |

---

## 7. Rounding journal rule (locked 2026-07-15)

When payment header exceeds LPG invoice target:

```text
payment_header  = lpg_invoice_amount + rounding_slice
rounding_slice  → DISCOUNT ALLOWED journal (negative in AR), post date = payment date
lpg_slice       → allocation edge to invoice doc_no (Tier 1 when ref split present)
```

Checklist: `data/finance_posting_checklist.csv` · Pro forma: `data/proforma_rounding_journals.csv`

## 8. Open items

1. **Pre-2026 TXT** — `raw/BU00052023.TXT` ingested; B/F bridge in `reports/BU0005_BF_Bridge_v1.md`.
2. **Pilot sign-off** — invoice 2026-04-10 vs receipt 2026-04-21 (11-day lag).
3. **Legacy R1,380.00** — pre-2022 composition unknown; **2023–2025 gap** in exports.
