# TWK002 — link “not in layers” txs to residual R8,084.67

**Question:** Which of the 87 gap-report rows explain the account-level residual?

| Metric | Value | Tag |
| :--- | ---: | :--- |
| ERP header | R26,498.36 | PROVEN — `TWK002_FULL_HISTORY.TXT` |
| Σ open invoices | R18,413.69 | PROVEN — live SOA |
| **Residual** | **R8,084.67** | PROVEN |
| 7-line bridge sum | R8,084.67 | PROVEN — `config/statement_of_account.json` |

```
residual = bf_carry + override + phantom_cn + stat112 + stat114 + stat123 + pathb_journals
         = 38,791.27 + 8,950.44 + 9,894.01 − 35,693.84 − 7,306.68 − 1,249.77 − 5,300.76
         = 8,084.67
```

**Key insight:** Unlinked txs are not *added* to get R8,084.67. They are **evidence rows** classified into the seven bridge buckets that *already* sum to the plug.

---

## Bridge lines ← unlinked ledger evidence

### `bf_carry` — **R38,791.27** (ratified)

| Config amount | Unlinked rows | Σ unlinked row amounts |
| ---: | ---: | ---: |
| 38,791.27 | 0 | 0.00 |

*B/F R0.00 is the export opening line — not an activity row in the gap list.*

### `override_42468_42470` — **R8,950.44** (ratified)

| Config amount | Unlinked rows | Σ unlinked row amounts |
| ---: | ---: | ---: |
| 8,950.44 | 0 | 0.00 |

*No unlinked rows — driver txs appear in Reconciliation Layers (e.g. payment docs in edges).*

### `phantom_cn_nets` — **R9,894.01** (ratified)

| Config amount | Unlinked rows | Σ unlinked row amounts |
| ---: | ---: | ---: |
| 9,894.01 | 11 | 11,944.29 |

| Date | Entry | Doc | Inv | Amount | Note |
| :--- | :--- | :--- | :--- | ---: | :--- |
| 26/10/2024 | Journal | 334 | — | -R385.04 | Partial Oct — superseded |
| 01/03/2025 | Journal | 494 | 31558 | R1,762.55 | 2025 gross→cash correction (+leg) |
| 01/03/2025 | Journal | 495 | 32332 | R1,324.29 | 2025 gross→cash correction (+leg) |
| 01/03/2025 | Journal | 496 | 33224 | R1,141.52 | 2025 gross→cash correction (+leg) |
| 01/03/2026 | Journal | 493 | 29684 | R4,081.85 | 29684 FIX group |
| 12/07/2026 | Journal | 490 | 22182 | R1,160.62 | 2023 payment correction (+leg) |
| 12/07/2026 | Journal | 490 | 23115 | R203.65 | 2023 payment correction (+leg) |
| 12/07/2026 | Journal | 490 | 23836 | R814.22 | 2023 payment correction (+leg) |
| 12/07/2026 | Journal | 490 | 24560 | R367.10 | 2023 payment correction (+leg) |
| 12/07/2026 | Journal | 490 | 25906 | R426.60 | 2023 payment correction (+leg) |
| 12/07/2026 | Journal | 490 | 26681 | R1,046.93 | 2023 payment correction (+leg) |

### `stat112_untagged` — **-R35,693.84** (ratified)

| Config amount | Unlinked rows | Σ unlinked row amounts |
| ---: | ---: | ---: |
| -35,693.84 | 0 | 0.00 |

*No unlinked rows — driver txs appear in Reconciliation Layers (e.g. payment docs in edges).*

### `stat114_untagged` — **-R7,306.68** (ratified)

| Config amount | Unlinked rows | Σ unlinked row amounts |
| ---: | ---: | ---: |
| -7,306.68 | 0 | 0.00 |

*No unlinked rows — driver txs appear in Reconciliation Layers (e.g. payment docs in edges).*

### `stat123_orphan` — **-R1,249.77** (ratified)

| Config amount | Unlinked rows | Σ unlinked row amounts |
| ---: | ---: | ---: |
| -1,249.77 | 0 | 0.00 |

*No unlinked rows — driver txs appear in Reconciliation Layers (e.g. payment docs in edges).*

### `pathb_journals_untagged` — **-R5,300.76** (ratified)

| Config amount | Unlinked rows | Σ unlinked row amounts |
| ---: | ---: | ---: |
| -5,300.76 | 7 | -2,277.07 |

| Date | Entry | Doc | Inv | Amount | Note |
| :--- | :--- | :--- | :--- | ---: | :--- |
| 12/07/2026 | Journal | 491 | — | -R203.65 | 2023 discount reversal bundle |
| 12/07/2026 | Journal | 491 | — | -R367.10 | 2023 discount reversal bundle |
| 12/07/2026 | Journal | 491 | — | -R426.60 | 2023 discount reversal bundle |
| 12/07/2026 | Journal | 491 | — | -R469.22 | 2023 discount reversal bundle |
| 12/07/2026 | Journal | 491 | — | -R701.93 | 2023 discount reversal bundle |
| 12/07/2026 | Journal | 491 | — | -R1,160.62 | 2023 discount reversal bundle |
| 23/07/2026 | Journal | 499 | — | R1,052.05 | 2024 discount catch-up |

---

## Unlinked txs mapped to residual (summary)

| Category | Rows | Maps to bridge line |
| :--- | ---: | :--- |
| **Residual drivers** | **18** | See above |
| Excluded (not plug) | 67 | CN pairs, current open, zero-net reclass |
| Unmapped | 2 | Immaterial / investigate |

### Driver rows by bridge line

| Bridge line | Config | Unlinked evidence rows |
| :--- | ---: | ---: |
| `bf_carry` | R38,791.27 | 0 |
| `override_42468_42470` | R8,950.44 | 0 |
| `phantom_cn_nets` | R9,894.01 | 11 |
| `stat112_untagged` | -R35,693.84 | 0 |
| `stat114_untagged` | -R7,306.68 | 0 |
| `stat123_orphan` | -R1,249.77 | 0 |
| `pathb_journals_untagged` | -R5,300.76 | 7 |

---

## Excluded unlinked (do NOT explain residual)

| Reason | Rows | Σ amounts |
| :--- | ---: | ---: |
| CN pairing — not header plug | 31 | -R512,165.57 |
| STAT 112 reclass block — nets zero (PROVEN) | 9 | R0.00 |
| Settled / layered / historical | 8 | R122,031.45 |
| H-025 STAT 129 discount — moved header, not in 7-line bridge | 8 | -R1,223.45 |
| Empty-return pair | 5 | R79,246.50 |
| CN on current open — nets in SOA | 2 | -R28,117.50 |
| Current billable open — in Σ open R18,413.69 | 2 | R46,531.19 |
| Deposit reversal — nets with 37732 | 1 | R10,430.79 |
| STAT:105 — pairs with Bank UD, nets zero | 1 | -R10,430.79 |

**Journal 00000511** — 9 lines, **net R0.00** (PROVEN). ERP reclass of STAT 112; does not change residual identity.

---

## Findings

1. **20 unlinked rows are direct evidence** for `phantom_cn_nets` and `pathb_journals_untagged` — the Path B catch-up journals that sit in the header without open-invoice lines.
2. **STAT payment orphans** (`43500` −R1,249.77 slice) link to `stat123_orphan`; `37770` / `39080` untagged slices are in layers as payment docs but their *untagged character* is the residual driver.
3. **67 excluded unlinked rows** (mostly CN/empty pairs + current open 52484/52803) net on the invoice model — they are **not** the R8,084.67 plug.
4. **No new bridge line** emerges from the gap — confirms root-cause report: residual is decomposition of known forces, not a missing txn.
5. **H-027** remains the lever (BS reclass); tagging unlinked CN pairs would not move the R8,084.67 total.

Regenerate: `npm run debtors:twk002-unlinked-residual-link`
