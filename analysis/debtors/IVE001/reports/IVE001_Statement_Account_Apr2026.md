# Statement of Account: ST IVES (IVE001) — April 2026 to Date

**Period:** 1 Apr 2026 → 7 Jul 2026 &nbsp;|&nbsp; **Account:** IVE001  
**Source:** DTRX / Supabase (deduped) + **ERP-confirmed allocations** (operator 2026-07-23)  
**Generated:** 2026-07-23 &nbsp;|&nbsp; **Status:** Draft — pending `IVE001CURRENT.TXT`

---

## Opening balance (1 Apr 2026): **8,638.96**

---

## Part 1: Combined Financial Ledger

### April 2026

| Date | Type | Doc # | Reference | Amount (R) | Balance (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| **01 Apr 2026** | **Opening B/F** | — | — | | **8,638.96** |
| 01 Apr 2026 | Payment | 43880 | → 49476 | -2,880.00 | 5,758.96 |
| 14 Apr 2026 | Crd Note | 14883 | DN-22321-EMPTY | -6,037.50 | -278.54 |
| 14 Apr 2026 | Invoice | 50242 | DN-22321 | 7,199.98 | 6,921.44 |
| 14 Apr 2026 | Invoice | 50243 | DN-22321-EMPTY | 6,037.50 | 12,958.94 |
| 28 Apr 2026 | Payment | 44142 | → 49659 | -14,399.96 | -1,441.02 |
| 29 Apr 2026 | Invoice | 50432 | DN-21883-EMPTY | 6,037.50 | 4,596.48 |
| 29 Apr 2026 | Invoice | 50434 | DN-21883 | 7,199.98 | 11,796.46 |
| 30 Apr 2026 | Crd Note | 14824 | DN-21883-EMPTY | -6,825.00 | 4,971.46 |
| 30 Apr 2026 | Crd Note | 14825 | DN-21883 | -8,139.11 | -3,167.65 |
| 30 Apr 2026 | Invoice | 50471 | DN#22358 | 7,199.98 | 4,032.33 |
| 30 Apr 2026 | Invoice | 50472 | DN#22358-EMPTY | 6,037.50 | 10,069.83 |

---

### May 2026

| Date | Type | Doc # | Reference | Amount (R) | Balance (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| 02 May 2026 | Crd Note | 14842 | DN#22358-EMPTY | -6,825.00 | 3,244.83 |
| 06 May 2026 | Payment | 44230 | → 50471 | -7,199.98 | -3,955.15 |
| 14 May 2026 | Crd Note | 14908 | DN#22711-EMPTY | -7,245.00 | -11,200.15 |
| 14 May 2026 | Invoice | 50687 | DN#22711 | 8,639.97 | -2,560.18 |
| 14 May 2026 | Invoice | 50688 | DN#22711-EMPTY | 7,245.00 | 4,684.82 |
| 27 May 2026 | Payment | 44457 | → **50687** ✓ | -8,639.97 | **-3,955.15** |

---

### June 2026

| Date | Type | Doc # | Reference | Amount (R) | Balance (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| 03 Jun 2026 | Invoice | 51036 | DN#22627 | 4,319.99 | -635.16 |
| 17 Jun 2026 | Invoice | 51291 | DN#22912 | 10,079.97 | 9,444.81 |
| 17 Jun 2026 | Invoice | 51292 | DN#22912-EMPTIES | 8,452.50 | 17,897.31 |
| 18 Jun 2026 | Crd Note | 15089 | DN#22912-EMPTIES | -8,452.50 | 9,444.81 |
| 24 Jun 2026 | Payment | 44876 | STAT 127 → see §44876 | -23,039.94 | **-13,595.13** |

---

### July 2026

| Date | Type | Doc # | Reference | Amount (R) | Balance (R) |
| :--- | :--- | :--- | :--- | ---: | ---: |
| 04 Jul 2026 | Invoice | 51603 | *(gas)* | 7,199.98 | -6,395.15 |
| 07 Jul 2026 | Payment | 45099 | → **51291** + **51603** ✓ | -17,279.95 | **-23,675.10** |

---

## ERP-confirmed payment allocations (operator)

| Invoice | Inv date | Amount (R) | Payment | Pay date | Amount (R) | Status |
| :--- | :--- | ---: | :--- | :--- | ---: | :---: |
| **50687** | 15/05/2026 | 8,639.97 | **44457** | 27/05/2026 | -8,639.97 | ✓ Closed |
| **51291** | 18/06/2026 | 10,079.97 | **45099** | 07/07/2026 | -10,079.97 | ✓ Closed |
| **51603** | 04/07/2026 | 7,199.98 | **45099** | 07/07/2026 | -7,199.98 | ✓ Closed |

**Pay 45099 gross:** R17,279.95 (R10,079.97 + R7,199.98) — split across two invoices.

> **Not in Supabase yet:** pays **44457**, **45099**; inv **51603**. DB/DTRX ingest required.

---

## Pay 44876 · Open invoices

See **`IVE001_Open_Invoices_and_Overpayment_Batch.md`** for open invoice detail and the **44876** overpayment (blank R4,319.99 slice).

---

## Closing summary

| View | Balance (R) | Notes |
| :--- | ---: | :--- |
| After pay **44876** (24 Jun) | -13,595.13 | Recalc with 44457 closing 50687 in May |
| After pay **45099** (7 Jul) | **-23,675.10** | ERP-confirmed allocs to 51291 + 51603 |
| Global aged-debt (13 Jul 2026) | **12,959.96** | **Unreconciled** vs ledger — pending TXT + DTRX sync |

Ledger vs global gap likely driven by: blank **44876** slice, Apr/May CN timing, and missing TXT running balance.

---

## Next steps

1. **Sources:** Upload **IVE001CURRENT.TXT** + DTRX/ITEMS through Jul 2026.
2. See **`IVE001_Open_Invoices_and_Overpayment_Batch.md`** for collections + ERP Agent actions.
3. Re-run ingest check + v5 statement when TXT lands.
