# TWK002 — Finance Posting Checklist

**Account:** TWK002 · TWK AGRI PTY LTD  
**Doctrine:** `docs/TWK002_Settlement_Discount_Doctrine_v2.md` (Model B)  
**Generated:** 2026-07-12  
**Audience:** Finance / AR clerk  
**Tick-off CSV:** `data/finance_posting_checklist.csv`  
**Interactive HTML:** `reports/TWK002_Settlement_Control_Panel.html` (open in browser; checklist persists in localStorage)  
**Cursor Canvas:** `canvases/twk002-settlement-control-panel.canvas.tsx` (IDE side panel)

---

## 1. What finance must achieve

Model B requires **two legs** per remittance batch:

```text
Payment receipt  = remittance CASH only
DISCOUNT ALLOWED = remittance DISCOUNT (one journal per batch)
Settlement         = cash + journal = remittance gross
```

| Period | Batches | Journals to post | Payment adjustments | Deposit fixes |
| :--- | ---: | ---: | ---: | ---: |
| **2023** | 6 | 6 (R3,329.12) | 2 over-post receipts | 2 (R345 each) |
| **2024** | 10 | 10 (R4,723.31 net)* | 5 over-post receipts | 5 (R6,374.90 orphan) |
| **Total** | **16** | **R7,667.39 net new** | **7 receipts** | **7 receipts** |

\*Includes Oct reversal of partial R385.04 and full R983.04 journal; Sep posts **positive** R233.10.

**Target state:** `data/recreated_ledger_2023.csv` · `data/recreated_ledger_2024.csv`

---

## 2. Posting rules (read once)

| # | Rule |
| :---: | :--- |
| 1 | **Journal post date** = remittance **electronic paid date** (not ERP receipt date where they differ) |
| 2 | **Journal amount** = remittance discount column — **never** ERP deposit discount total |
| 3 | **Payment amount** = remittance cash — strip orphan/excess discount from payment header |
| 4 | **Ref splits** = invoice/CN `doc_no` per `data/proforma_journals_20xx.csv` |
| 5 | **CN lines** on journal = **positive** amounts (discount reversal) |
| 6 | **Exceptions** = honour `config/settlement_discount_overrides.json` (zero-discount lines) |
| 7 | **Do not touch** orphan receipts `00037732` / Jan-2025 `00036467` without separate review |

---

## 3. Recommended posting order

Work **oldest batch first** within each year. Per batch, follow **Steps A → B → C → D**:

| Step | Action | Applies when |
| :---: | :--- | :--- |
| **A** | Open remittance PDF + deposit detail | Always |
| **B** | Correct payment header to **cash** | Over-post batches |
| **C** | Correct deposit **DISCOUNT** allocations | Over-post batches |
| **D** | Post **`DISCOUNT ALLOWED`** journal | Always (missing or partial) |
| **E** | Verify: cash + journal = gross | Always |
| **F** | Tick off in `data/finance_posting_checklist.csv` | Always |

---

## 4. 2023 batches (6)

| ☐ | Task | Paid | Receipt | Step B | Step D journal | Post date | Amount |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- | ---: |
| ☐ | TASK-0001 | 26.06.2023 | `00022182` | — | POST journal | 26/06/2023 | **R-1,160.62** |
| ☐ | TASK-0002 | 26.07.2023 | `00023115` | — | POST journal | 26/07/2023 | **R-203.65** |
| ☐ | TASK-0003 | 28.08.2023 | `00023836` | **Adjust** R27,738.41 → R26,924.19 | POST journal | 28/08/2023 | **R-469.22** |
| ☐ | TASK-0004 | 26.09.2023 | `00024560` | — | POST journal | 26/09/2023 | **R-367.10** |
| ☐ | TASK-0005 | 26.10.2023 | `00025906` | — | POST journal | 26/10/2023 | **R-426.60** |
| ☐ | TASK-0006 | 27.11.2023 | `00026681` | **Adjust** R31,872.29 → R30,825.36 | POST journal | 27/11/2023 | **R-701.93** |

**2023 deposit fixes (TASK-0003, TASK-0006):** Reduce deposit discount by **R345.00** each — remove orphan slice on doc `00023077` pattern. See `reports/TWK002_Pilot_Batch_2023-08-28.md` §3a.

**Ref splits:** `data/proforma_journals_2023.csv`  
**Remittance PDFs:** `raw/Remittances/26.06.2023.pdf` … `27.11.2023.pdf`

---

## 5. 2024 batches (10)

### 5a. Cash-only — journal only (5 batches)

Payment already matches bank cash. **Step D only.**

| ☐ | Task | Paid | Receipt | Cash ✓ | Journal | Post date | Amount |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- | ---: |
| ☐ | TASK-2024-0002 | 26.04.2024 | `00030419` | R28,428.84 | POST | 26/04/2024 | **R-375.10** |
| ☐ | TASK-2024-0003 | 27.05.2024 | `00031365` | R11,721.10 | POST | 27/05/2024 | **R-300.54** |
| ☐ | TASK-2024-0007 | 26.09.2024 | `00033921` | R2,984.27 | POST **positive** | 26/09/2024 | **R+233.10** |
| ☐ | TASK-2024-0010 | 27.12.2024 | `00036195` | R12,104.70 | POST | 27/12/2024 | **R-310.37** |

**Sep note:** Net negative discount on remittance — journal posts as **credit R+233.10** (CN reversals dominate).

### 5b. Over-post — payment + deposit + journal (5 batches)

Deposit **AMOUNT** already equals remittance cash. Excess is in deposit **DISCOUNT** column.

| ☐ | Task | Paid | Receipt | ERP gross → cash | Orphan strip | Journal | Post date | Amount |
| :---: | :--- | :--- | :--- | :--- | ---: | :--- | :--- | ---: |
| ☐ | TASK-2024-0001 | 26.03.2024 | `00029684` | R77,692.03 → **R73,610.18** | R3,575.49 | POST | 26/03/2024 | **R-506.36** |
| ☐ | TASK-2024-0004 | 26.06.2024 | `00031558` | R39,057.53 → **R37,294.98** | R806.27 | POST | 26/06/2024 | **R-956.28** |
| ☐ | TASK-2024-0005 | 26.07.2024 | `00032332` | R18,061.64 → **R16,737.35** | R895.13 | POST | 26/07/2024 | **R-429.16** |
| ☐ | TASK-2024-0006 | 26.08.2024 | `00033224` | R22,338.84 → **R21,197.32** | R598.00 | POST | 26/08/2024 | **R-543.52** |
| ☐ | TASK-2024-0009 | 26.11.2024 | `00035263` | R22,581.72 → **R21,529.67** | R500.01 | POST | 26/11/2024 | **R-552.04** |

### 5c. Oct partial journal (special)

| ☐ | Task | Paid | Receipt | Action |
| :---: | :--- | :--- | :--- | :--- |
| ☐ | TASK-2024-0008 | 26.10.2024 | `00034518` | **Reverse** journal `00000334` (R385.04) · **Delete** ghost payment line R-385.04 if present · **Post** full journal **R-983.04** on 26/10/2024 |

Payment cash R38,338.45 is already correct — journal only.

---

## 6. Deposit correction detail (2024 over-post)

After Step B (payment header), correct deposit allocations per `data/deposit_detail_2024.csv`:

### `00029684` (Mar) — reduce DISCOUNT R4,081.85 → R506.36

| ☐ | Action |
| :---: | :--- |
| ☐ | Set discount **R0** on late catch-up lines `26577`, `27340`, `27764` |
| ☐ | Halve doubled discounts on `28765` (→ R268.31), `29140` (→ R366.25) |
| ☐ | Review partial `29889` allocation vs remittance |
| ☐ | Do **not** re-embed `00023075` already-paid slice R3,598.81 |

### `00031558` (Jun) — reduce DISCOUNT R1,762.55 → R956.28

| ☐ | Action |
| :---: | :--- |
| ☐ | **Delete** blank orphan line **R806.46** (no INV/GRV) |
| ☐ | Halve discount on `31907` (→ R266.94) |
| ☐ | Add missing CNs `08324`, `08530`, `08700` to deposit |
| ☐ | Complete partial allocations on `31908`, `32419`, `32425` |

### `00032332` (Jul) — reduce DISCOUNT R1,324.29 → R429.16

| ☐ | Action |
| :---: | :--- |
| ☐ | **Delete** discount-only rows `29890` (R594.59) and `31405` (R300.54) |
| ☐ | Add missing CN `08913` to deposit |
| ☐ | Complete partial on `33278` (R26,910 gross) |

### `00033224` (Aug) — reduce DISCOUNT R1,141.52 → R543.52

| ☐ | Action |
| :---: | :--- |
| ☐ | Set per-line discount: `33800` → R218.12, `34342` → R340.35 (not R570.76 each) |
| ☐ | Add missing `34343` and CN `09426` to deposit |

### `00035263` (Nov) — reduce DISCOUNT R1,052.05 → R552.04

| ☐ | Action |
| :---: | :--- |
| ☐ | **Delete** discount-only row `37189` (R526.13) — move discount into net settlement |
| ☐ | Add missing CNs `10617`, `10189`, `11003` and invoice `37818` |
| ☐ | Complete partial on `37817` |

---

## 7. Per-batch verification (tick when done)

| ☐ | Batch | Cash = bank? | Payment header = cash? | Deposit disc = remit disc? | Journal posted? | Gross check |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| ☐ | 2023-06-26 | | n/a | n/a | | |
| ☐ | 2023-07-26 | | n/a | n/a | | |
| ☐ | 2023-08-28 | | | | | |
| ☐ | 2023-09-26 | | n/a | n/a | | |
| ☐ | 2023-10-26 | | n/a | n/a | | |
| ☐ | 2023-11-27 | | | | | |
| ☐ | 2024-03-26 | ✓ | | | | |
| ☐ | 2024-04-26 | ✓ | ✓ | n/a | | |
| ☐ | 2024-05-27 | ✓ | ✓ | n/a | | |
| ☐ | 2024-06-26 | ✓ | | | | |
| ☐ | 2024-07-26 | ✓ | | | | |
| ☐ | 2024-08-26 | ✓ | | | | |
| ☐ | 2024-09-26 | ✓ | ✓ | n/a | | |
| ☐ | 2024-10-26 | ✓ | ✓ | n/a | | |
| ☐ | 2024-11-26 | ✓ | | | | |
| ☐ | 2024-12-27 | ✓ | ✓ | n/a | | |

**Gross check:** `payment cash + journal = remittance gross` (Sep: R2,984.27 + R233.10 = R2,751.17 net settlement)

---

## 8. Out of scope — do not post

| Receipt | Amount | Reason |
| :--- | ---: | :--- |
| `00037732` | R10,430.79 | Orphan — reversed by Bank UD same doc |
| `00036467` | R4,398.27 | Jan-2025 STAT 110 — no 2024 remittance batch |

---

## 9. Source file index

| Need | File |
| :--- | :--- |
| Task register (2023) | `data/missing_journal_tasks_2023.csv` |
| Task register (2024) | `data/missing_journal_tasks_2024.csv` |
| Journal ref splits (2023) | `data/proforma_journals_2023.csv` |
| Journal ref splits (2024) | `data/proforma_journals_2024.csv` |
| Payment bridge (2023) | `data/recreated_ledger_payment_bridge_2023.csv` |
| Payment bridge (2024) | `data/recreated_ledger_payment_bridge_2024.csv` |
| Deposit detail (2024) | `data/deposit_detail_2024.csv` |
| Over-post investigation | `reports/TWK002_Overpost_Investigation_2024.md` |
| Invoice exceptions | `config/settlement_discount_overrides.json` |
| Remittance PDFs (2023) | `raw/Remittances/*2023*.pdf` |
| Remittance PDFs (2024) | `raw/Remittances/*2024*.pdf` |

---

## 10. Final sign-off

| ☐ | # | Check |
| :---: | :---: | :--- |
| ☐ | 1 | All 16 remittance batches: cash + journal = gross |
| ☐ | 2 | All 16 `DISCOUNT ALLOWED` journals posted (or Oct partial reversed + full posted) |
| ☐ | 3 | Seven over-post payment headers reduced to cash |
| ☐ | 4 | Seven deposit discount totals corrected |
| ☐ | 5 | No new orphan slices introduced |
| ☐ | 6 | Fresh TXT export matches recreated ledger within R100 tolerance |
| ☐ | 7 | Tick-off CSV completed with clerk initials + date |

**Clerk:** _________________ **Date:** _________  
**Reviewer:** _________________ **Date:** _________
