# TWK002 — account-level bridge line investigation (2026-08-11)

**Question:** What is inside the two statement bridge lines?

| Line | R |
| :--- | ---: |
| Opening balance and settled-period residual | 57,635.72 |
| Untagged settlements | −49,551.05 |
| **Net (header − Σ open invoices)** | **8,084.67** |

**Source:** `raw/DEBENQ_TWK002.TXT`, `config/statement_of_account.json`, remittance manifests. Reproduce: `node analysis/debtors/TWK002/scripts/investigate_balance_bridge_lines.mjs`

---

## Headline finding

Neither line is an arbitrary plug. They are **classification buckets** that sum exactly to the gap:

```
gap = B/F + override_invoices + phantom_cn_journals + untagged_settlements
    = 38,791.27 + 8,950.44 + 9,894.01 + (−49,551.05)
    = 8,084.67  ✓
```

The “residual” line (R57,635.72) is **everything except untagged settlements** — not merely “opening balance” in the B/F sense.

---

## Line 1 — Untagged settlements (−R49,551.05)

**Definition:** ERP `Payment` / `Journal` rows with a **blank `INVNO`** — money that left the account balance but was never attributed to an invoice in the export.

### 1a — STAT payment slices (−R44,250.29)

| Date | Receipt | STAT | Amount (R) | Remittance authority | Tagging in ERP |
| :--- | :--- | :---: | ---: | :--- | :--- |
| 28/03/2025 | 00037770 | 112 | −35,693.84 | Remit cash R35,693.84 = **full receipt** (`BATCH-2025-03-31`) | **100% untagged** — no tagged sibling rows |
| 30/05/2025 | 00039080 | 114 | −7,306.68 | Remit cash R15,365.65; tagged sibling −8,058.97 to inv 42050 | **Partial untagged slice** — settled 42468/42470 batch portion |
| 25/02/2026 | 00043500 | 123 | −1,249.77 | Receipt total R176,824.24; 19 tagged siblings | **Orphan slice** — H-013/H-014 shortfall class |

**Model B read:**

- **STAT 112:** Entire receipt is untagged. Remittance says which invoices were paid; ERP posted one lump payment with no `INVNO`. Path B discount journal 00000508 (−R228.93) posted Aug 2026 separately.
- **STAT 114:** The −R7,306.68 slice is the untagged portion of a receipt whose **total** (−R7,306.68 + −R8,058.97 = −R15,365.65) matches remittance cash exactly. This slice is what left invoices 42468/42470 showing open until `closedInvoiceOverrides`.
- **STAT 123:** −R1,249.77 is the only untagged line on a 20-segment payment. Remaining R175,574.47 is tagged across 19 invoices. The untagged slice is the STAT 123 investigation item — not necessarily wrong, but unexplained at invoice level.

### 1b — Path B journals, blank INVNO (−R5,300.76)

These are **posted correction journals** from the 2023–2025 catch-up — not customer payments. They reduce the balance without naming an invoice.

| Tranche | Docs | Date posted | Net (R) | Purpose |
| :--- | :--- | :--- | ---: | :--- |
| **2023 discount reversal** | 00000491 (6 lines) | 12/07/2026 | −3,329.12 | Reverses 2023 batch discount amounts by remittance date (26.06.2023 −R1,160.62 … 28.08.2023 −R469.22) |
| **2024 discount catch-up** | 00000499–502 | 23/07/2026 | −1,235.94 | 2024 Path B discount posting (includes +R1,052.05 and +R233.10 gross-up lines netting to −R1,235.94) |
| **2025 Phase 2 discount** | 00000507–509 | 09/08/2026 | −735.70 | STAT 110/112/114 discount journals per `TWK002_Phase2_2025_Linkage.md` |

**Not in this line:** journals that carry an `INVNO` pointing at a **phantom** invoice number (no `Invoice` row in export) — those net into the residual line instead (see §2c).

### What is NOT in −R49,551.05

| Excluded | Amount | Why excluded |
| :--- | ---: | :--- |
| findUntaggedCredits total | −R50,836.20 | Library count differs by −R1,285.15 — see note below |
| Mirror journal pairs with INVNO | e.g. 00000494–496 | Classified as `phantom_cn`, not untagged |
| 00000490 payment corrections | +R4,019.12 | Tagged to phantom invnos 22182, 23115, … |

**Note on −R50,836 vs −R49,551:** `findUntaggedCredits` counts 17 rows (−R50,836.20). The bridge bucket counts 19 rows (−R49,551.05) because classification uses the same blank-`INVNO` rule but the bridge builder's row parser includes two additional Jul-2026 journal gross-up lines (+R1,052.05, +R233.10) that partially offset other journal debits. The **bridge bucket net** (−R49,551.05) is the correct figure for the statement.

---

## Line 2 — Opening balance and settled-period residual (R57,635.72)

**Definition:** `gap − untagged = 8,084.67 − (−49,551.05) = 57,635.72`

This decomposes **exactly** into three named components:

| Component | R | What it is |
| :--- | ---: | :--- |
| **BALANCE B/F** | 38,791.27 | Export-window opening carry (pre–Mar 2025 debt). Not restated as invoice lines on the open table. |
| **Override invoices (42468 / 42470)** | 8,950.44 | Invoices **ratified paid** on remittance but ERP still shows positive net (no settling tag). Removed from open list; still inflates account-level until ERP corrected. |
| **Phantom CN journal nets** | 9,894.01 | Path B journals tagged to `invno` values that have **no Invoice row** in this export — posting artefacts, not billable debt. |
| **Closed invoice net** | 0.00 | All other invoices in export window net to zero via tagged settlement. |
| **Total** | **57,635.72** | |

### 2a — BALANCE B/F (R38,791.27)

From TXT line 13: export opens **Mar 2025** with R38,791.27 carried forward. This is pre-window debt — the open invoice table only names 11 invoices from Feb–Jul 2026 and does not re-state historical B/F as invoice lines.

After B/F, the export records R845,581.17 of new invoices and −R766,240.90 of credits/payments/journals to reach header R118,131.54.

### 2b — Override invoices (R8,950.44)

| Inv | Gross | Tagged credits | ERP net | Remittance status |
| :--- | ---: | ---: | ---: | :--- |
| 42468 | 7,713.58 | 0.00 | 7,713.58 | Paid STAT 114 / BATCH-2025-05-31 |
| 42470 | 1,236.86 | 0.00 | 1,236.86 | Same batch |

These are **not owed** — they are ERP artefacts inflating the account-level bucket because the −R7,306.68 untagged slice never tagged them.

### 2c — Phantom CN journal nets (R9,894.01)

Path B journals posted with an `INVNO` that references a number **without a matching Invoice row** in the export:

| Group | Docs | Invno ref | Net (R) | Class |
| :--- | :--- | :--- | ---: | :--- |
| 2025 Mar discount mirrors | 00000494–496 | 31558, 32332, 33224 | +2,299.40 | DISCOUNT ALLOWED mirror pairs |
| 2026 Mar FIX | 00000492–493 | 29684 | +3,575.49 | `00029684 FIX` correction |
| 2023 payment correction | 00000490 | 22182, 23115, 23836, 24560, 25906, 26681 | +4,019.12 | PAYMENT CORRECTION FOR 2023 |
| 2026 Aug hygiene | 00000503–006 | 35263, 30419, 33921, 34518 | **0.00** | Mirror pairs net zero |

**Important:** The paired journal 00000491 (−R3,329.12) is **untagged** (blank INVNO) and sits in Line 1, not here. The +R4,019.12 on 00000490 and −R3,329.12 on 00000491 are the 2023 Path B correction **pair** — net +R690.00, matching the documented 2023 closing variance.

---

## Cross-check — Model B authority

| Bridge component | Remittance says | ERP says | Reconciled? |
| :--- | :--- | :--- | :---: |
| STAT 112 payment −R35,693.84 | Cash R35,693.84 | Full receipt untagged | ✓ cash; ✗ invoice tags |
| STAT 114 untagged −R7,306.68 | Part of R15,365.65 batch | Partial slice; 42468/42470 unsettled in ERP | ✓ via overrides |
| Override R8,950.44 | Batch paid May 2025 | Still positive net | ✓ overrides |
| Path B journals −R5,300.76 | Discount per remittance | Posted blank INVNO | ✓ Model B |
| B/F R38,791.27 | n/a (pre-window) | Header carry | Partial — needs B/F bridge |
| Phantom CN R9,894.01 | n/a | ERP posting refs | Internal — net +R690 = 2023 variance |

---

## Recommended bridge line split (statement)

Replace the two summary lines with seven ratified sub-lines:

| Label | R |
| :--- | ---: |
| BALANCE B/F (pre–Mar 2025 export) | 38,791.27 |
| Override invoices 42468/42470 (paid on remittance, ERP untagged) | 8,950.44 |
| Path B phantom journal nets (non-invoice invno refs) | 9,894.01 |
| STAT 112 receipt 00037770 (fully untagged) | −35,693.84 |
| STAT 114 untagged slice 00039080 | −7,306.68 |
| STAT 123 orphan slice 00043500 | −1,249.77 |
| Path B discount journals 00000491, 00000499–509 | −5,300.76 |
| **Net account-level** | **8,084.67** |

Open invoice subtotal R110,046.87 + net account-level R8,084.67 = **Balance due R118,131.54**.

---

## Open items

| Item | Action |
| :--- | :--- |
| STAT 123 −R1,249.77 orphan | Resolve under H-013/H-014 — identify invoice target or ratify as batch-level |
| Override R8,950.44 | ERP correction or keep overrides; should not appear on customer statement once settled |
| Phantom CN R9,894.01 | Internal posting refs — exclude from customer-facing wording; show net effect only |
| B/F R38,791.27 | Optional: build pre–Mar 2025 B/F bridge against recreated ledger if finance needs full history |

---

## Related

- `TWK002_Balance_Gap_Investigation_2026-08-11.md`
- `TWK002_Phase2_2025_Linkage.md`
- `docs/TWK002_Model_B_Position.md`
- `TWK002_Stale_Open_Invoices_2026-08-11.md`
