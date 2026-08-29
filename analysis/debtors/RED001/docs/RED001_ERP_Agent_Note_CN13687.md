# ERP Agent Note — RED001 CN 13687 Correction

**Account:** RED001 — REDLANDS HOTEL  
**Priority:** Posting correction (historical)  
**Ratification scenario:** `CN13687-6CYL-NOV2025`  
**Workspace:** `analysis/debtors/RED001/`

---

## Problem

| Doc | Date | Issue |
|-----|------|-------|
| **CN 13687** | 15 Oct 2025 | Credited **7×** 48kg cylinder deposits (−R8,452.50) on DN#20157 |
| **Valid portion** | — | **1 cyl** only (−R1,207.50) — open deposit from DN#12678 (inv **44675**) |
| **Error portion** | — | **6 cyl** (−R7,245.00) — no open deposit invoice to reverse |

At posting, DN#20157 deposit inv **45541** had already been reversed by CN **13187** (11 Aug 2025). Gas inv **45540** was paid in full (pmt **40727**). CN 13687 had **no invoice** to attach to.

This created a persistent **−R7,245 Part 1B credit anchor** and a mirrored **+R7,245 Part 1A carry** (payment lane = LPG).

---

## Ratified assumption

**6 of the 7 cylinders on CN 13687 were a posting error.** The correction was intended for **November 2025** but was **never done** in ERP.

---

## Required ERP action — use **Invoice**, not Debit Note

Post a **Cylinder Deposit Invoice** (not a debit note). An invoice drives **stock quantity and value** correctly in ERP; a debit note would not.

| Field | Value |
|-------|-------|
| **Account** | RED001 |
| **Entry type** | **Invoice** |
| **Date** | **30 November 2025** (correction date — adjust to actual posting date if different) |
| **Customer ref** | `DN#20157-CORR` |
| **Memo / narrative** | `Correction — reverse 6-cylinder portion of CN 13687 posting error (Oct 2025). Valid CN 13687 = 1 cyl only.` |
| **Related CN** | 13687 |
| **Related DN** | 20157 |

### Line detail

| Stock | Category | Qty | Unit deposit (ex VAT) | Line (ex VAT) | Line (incl VAT @ 15%) |
|-------|----------|----:|----------------------:|--------------:|----------------------:|
| **S.1** | 48KG SV CYLINDER DEPOSIT | **+6** | R1,050.00 | R6,300.00 | **R7,245.00** |

### Financial effect

| Sub-ledger | Before correction | After +R7,245 invoice |
|------------|------------------:|----------------------:|
| Part 1B (CYL) | −R7,245 anchor | **R0.00** (error neutralised) |
| Combined | Distorted vs sub-ledgers | +R7,245 vs current TXT header |
| **Corrected combined close** | R5,559.76 (TXT today) | **R12,804.76** |

> Until this invoice is posted, v5 applies the correction as a **synthetic ratification row** (`RAT13687`). ERP TXT header will show **+R7,245 variance** until live ERP matches.

---

## Do NOT

- Post a **debit note** — will not update cylinder stock qty/values as required.
- Amend CN 13687 in place unless ERP workflow explicitly supports partial CN reversal (prefer correction invoice).
- Link the correction invoice to LPG inv **45540** — that is gas, already paid; this is **CYL deposit** only.

---

## After posting

1. Re-export debtor statement TXT for RED001.
2. Replace `raw/RED001CURRENT.TXT`.
3. Run ingest check: `npm run debtors:ingest-check -- --debtor RED001`
4. Set `ratification_scenarios.json` → `"activeScenarioId": null` (or remove synthetic row once ERP doc exists).
5. Regenerate v5: `node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor RED001`

---

## Verification checklist

| # | Check |
|---|-------|
| ☐ | Invoice amount = **R7,245.00** incl VAT (6 × R1,050 × 1.15) |
| ☐ | Stock: **+6× S.1** cylinder deposit on hand / custody |
| ☐ | Part 1B no longer shows −R7,245 anchor from Oct 2025 |
| ☐ | CN 13687 remains as **1 cyl** valid return (−R1,207.50) or is amended per operator |
| ☐ | Combined balance moves **+R7,245** vs pre-correction TXT |

---

*Generated 2026-07-29 — operator ratification scenario `CN13687-6CYL-NOV2025`*
