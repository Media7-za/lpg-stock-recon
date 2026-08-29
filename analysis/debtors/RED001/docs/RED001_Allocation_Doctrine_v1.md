# RED001 Allocation Doctrine (v1)

**Account:** RED001 — REDLANDS HOTEL  
**Status:** **Turn 1 locked (2026-07-29)**  
**Lane:** `allocation` (invoice-linked, LPG-only match)  
**Scope:** `raw/RED001.TXT` → `raw/RED001CURRENT.TXT` (08 May 2025 – 25 Jul 2026)

---

## 0. Payer-class gate

| Metric | Value | Gate |
| :--- | ---: | :---: |
| Payment rows with `ref_no` → invoice (excl Alloc/Recon) | 46 / 56 | ✅ |
| Payment value with invoice ref | R257,017.12 / R257,017.12 (non-mirror) | ✅ |
| **Ruling** | **>50% ref-linked → allocation lane** | **PASS** |

> **Not JIM001.** Payments carry explicit ERP `ref_no` pointers to invoice `doc_no` under STAT transfer batches (`STAT 114`–`STAT 128`). Do **not** route to `lpg-payment-pattern-analysis`.

---

## 1. Commercial model (locked)

| # | Question | Ruling |
| :---: | :--- | :--- |
| 1 | Settlement pattern? | **NONE** |
| 2 | Unit of work? | **Invoice document** — LPG line total match |
| 3 | Discount terms? | **NONE** |
| 4 | ERP behaviour | STAT batches; payment slices reference target invoice `doc_no` |
| 5 | CYL in match base? | **LPG-only** — `-EMPTY` deposit pairs net via CN; exclude CYL payment slices |

### Match rules (allocation)

```text
payment_doc_slice  = sum(ERP rows sharing doc_no + ref_no) after dedupe
match_target       = deduped LPG line total on target invoice
tolerance          = R0.05 Tier 1; R0.06–R1.00 → review
split_batches      = multi-ref payment docs (e.g. 40727) — each ref slice tested independently
prepayment         = payment_date < invoice_date → UNALLOCATED + review_required
line_dedupe        = DISTINCT ON (doc_no, debt_group, stock_no, category, line_total)
```

---

## 2. ERP evidence (DETRANS / Supabase)

**Trading name:** REDLANDS HOTEL  
**DB range:** May 2025 → Jul 2026 · **56 payment rows** (28 unique docs after dedupe) · **99 invoices**  
**Portfolio snapshot** (`Global Reports/130720251H45M.TXT`, 2026-07-13): combined **R8,245.40** — superseded by later activity.

### STAT batch families observed

| STAT | First payment doc | Notes |
| :--- | :--- | :--- |
| STAT 114 | 38566 (May 2025) | ref → 42948 |
| STAT 115 | 39087 (Jun 2025) | ref → 43614 |
| STAT 116 | 40136 (Jul 2025) | ref → 44674 |
| STAT 117 | 40727 (Aug 2025) | multi-ref split batch |
| STAT 120–128 | 42420…45094 | continuing monthly pattern |

---

## 3. Known watchlist

| Pattern | Handling |
| :--- | :--- |
| Duplicate `vw_clean_transactions` lines | Dedupe before LPG sum (e.g. Inv 42948 posts twice at R5,399.99) |
| Multi-ref payment 40727 | Each ref slice: 44675, 45540, 49409, 49714 — test independently |
| Blank-ref slice 44288 (STAT 126) | Tier 5 review — R5,759.98; do not auto-allocate |
| DN-lag 1-day (May–Jun 2025) | Payment posts 1 day before invoice with exact ref+LPG → review unless operator override |
| CN **13687** (15 Oct 2025) | **CYL return error** — 7× posted; **1× valid** (−R1,207.50); **6× error** (−R7,245.00). Ratification scenario `CN13687-6CYL-NOV2025`: correct via **Invoice** +R7,245 (30 Nov 2025), not debit note. See `docs/RED001_ERP_Agent_Note_CN13687.md`. |
| Missing CURRENT TXT | ~~blocked~~ **resolved** — `RED001.TXT` ingested as `RED001CURRENT.TXT` |

---

## 4. Turn status

| Turn | Goal | Status |
| :---: | :--- | :---: |
| 1 | Scaffold + payer-class gate | ✅ |
| 2 | Pilot (Apr–Jul 2026 — STAT 125–128) | ✅ PASS (90.91%) |
| 3 | Full graph | ⏳ |
| 4 | Overrides | ⏳ |
| 5 | Statement bridge | ⏳ pending full graph + ingest PASS + CN 13687 ratification |

---

## 5. Tripwires (session close 2026-08-29)

| Ruling | Tripwire |
| :--- | :--- |
| Allocation lane (not JIM001) | Re-run payer-class gate if ref-linked share drops **below 50%** on fresh TXT |
| LPG-only match base | CYL payment slices excluded — if operator needs CYL-in-base, doctrine revision required |
| CN 13687 → Part 1B (6 cyl error) | **PROPOSED — NOT RATIFIED** — invalidate v5 RAT13687 if scenario rejected |
| Ref-linked pilot **primary** | Do not cite stripped LIFO open balance (**R17,439.40 ASSERTED**) for collections |
| Correction entry type | **Invoice** not Debit Note — kill if ERP posts DN (stock qty break) |

### Dead ends

- **Stripped LIFO authoritative balance** — abandoned; BLOCKED vs ERP R−11,879.64 gap.
- **Missing LPG invoice hypothesis** — ruled out; mis-post + duplicate 52086 + gas-only refills explain distortion.
- **Part 1A R7,245 as invoice doc** — wrong; carry mirror only; open LPG doc is **52086** (**PROVEN** R4,434.42).
