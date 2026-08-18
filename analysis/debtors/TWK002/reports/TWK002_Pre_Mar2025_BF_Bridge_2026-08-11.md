# TWK002 — Pre–Mar 2025 BALANCE B/F Bridge (R38,791.27)

**Question answered:** what is behind the R38,791.27 opening carry on the current export, all the way back to account inception?

**Generated:** 2026-08-11
**Sources:** `raw/TWK0022023.TXT`, `raw/TWK0022024.TXT` (historical ERP snapshots) · `data/recreated_ledger_2023.csv`, `data/recreated_ledger_2024.csv` (Path B evidence-adjusted)
**Regenerate:** `node analysis/debtors/TWK002/scripts/build_pre_mar2025_bf_bridge.mjs --write`

---

## 1. Headline — the chain ties exactly

| Step | B/F | Closing | Source |
| :--- | ---: | ---: | :--- |
| **2023** (28 Apr 2023 → 26 Feb 2024) ERP raw | R0,00 | R87 226,46 | `TWK0022023.TXT` |
| **2024** (27 Mar 2024 → 24 Feb 2025) ERP raw | R87 226,46 | R38 791,27 | `TWK0022024.TXT` |
| **Current export** (Mar 2025+) BALANCE B/F | — | R38 791,27 | `DEBENQ_TWK002.TXT` line 13 |

**Tie 1:** 2023 ERP closing (R87 226,46) = 2024 ERP raw B/F (R87 226,46) — **EXACT ✓**
**Tie 2:** 2024 ERP raw closing (R38 791,27) = current export BALANCE B/F (R38 791,27) — **EXACT ✓**

The R38,791.27 opening carry is not a black box. It is the ERP running total after **eleven STAT payment batches** (STAT 92 through STAT 110, Jul 2023 → Jan 2025), every one of which has a remittance advice on file and a reconciling batch total in `data/remittance_manifest_2023.json` / `_2024.json` / `data/allocation_edges.csv`.

---

## 2. Path B recreated ledger — same periods, remittance-authoritative

The recreated ledgers replay the same two periods using **remittance cash** (not ERP gross) for each STAT payment, plus the settlement discount journals. Both start from the identical ERP raw B/F, so any difference at closing is attributable to specific, itemised corrections:

| Period | ERP raw closing | Path B recreated closing | Variance | Predicted (below) | Ties? |
| :--- | ---: | ---: | ---: | ---: | :---: |
| 2023 | R87 226,46 | R87 916,46 | R690,00 | R690,00 | ✓ |
| 2024 | R38 791,27 | R44 200,30 | R5 409,03 | R5 409,03 | ✓ |

### 2023 variance — R690.00 = the 2023 STAT batch shortfall pair

| Component | Amount (R) |
| :--- | ---: |
| Payment gross→cash adjustments (6 STAT batches) | 4019.12 |
| Settlement discount journals (6 journals, DJ01–06) | -3329.12 |
| **Net 2023 variance** | **690.00** |

This is **exactly** the R690.00 already identified in the phantom CN nets investigation: journal `00000490` (+R4,019.12, six 2023 payment corrections) paired with untagged journal `00000491` (−R3,329.12), posted into the *current* export on 2026-07-12. This bridge shows where that R690.00 originates — two STAT batches (BATCH-2023-08-28, BATCH-2023-11-27) where ERP's payment gross exceeded remittance cash by R345.00 each.

### 2024 variance — R5,409.03 = payments + discounts + one raw double-post

| Component | Amount (R) |
| :--- | ---: |
| Payment gross→cash adjustments (5 STAT batches) | 9362.26 |
| Settlement discount journals (10 journals, DJ07–16) | -4723.31 |
| Raw ERP double-post removed (STAT 107, see below) | 770.08 |
| **Net 2024 variance** | **5409.03** |

#### Raw ERP double-post — STAT 107 / 26 Oct 2024 (doc 34518)

The raw ERP export contains **two** separate −R385.04 "DISCOUNT ALLOWED" entries for the same batch:

| Line | Entry type | Doc | Date | Reference | Amount (R) |
| :--- | :--- | :--- | :--- | :--- | ---: |
| — | Journal | 334 | 26/10/2024 | DISCOUNT ALLOWED | -385.04 |
| — | Payment | 34518 | 26/10/2024 | DISCOUNT ALLOWED | -385.04 |
| | | | | **Total** | **-770.08** |

One is a bare `Journal` (doc `00000334`, no invno), the other is embedded inside the `Payment` rows for doc `34518` under the STAT 107 reference. The recreated ledger removes **both** and replaces them with a single clean journal, `PROFORMA-DJ-14` (−R983.04), sized to the correct consolidated batch discount. This raw-side artefact is itself evidence for why ERP's own posting hygiene — separate from the payment-tagging weakness already documented — needed the Path B correction lane.

---

## 3. STAT payment batches behind the R38,791.27 (both years)

Each row is a remittance-backed payment with the ERP gross amount stripped to remittance cash in the recreated ledger:

| Year | Date | Payment doc | Batch | ERP gross (R) | Remittance cash (R) | Diff (R) |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: |
| 2023 | 03/07/2023 | 22182 | BATCH-2023-06-26 | -46424.87 | -45264.25 | 1160.62 |
| 2023 | 26/07/2023 | 23115 | BATCH-2023-07-26 | -8145.79 | -7942.14 | 203.65 |
| 2023 | 01/09/2023 | 23836 | BATCH-2023-08-28 | -27738.41 | -26924.19 | 814.22 |
| 2023 | 26/09/2023 | 24560 | BATCH-2023-09-26 | -14684.27 | -14317.17 | 367.10 |
| 2023 | 08/11/2023 | 25906 | BATCH-2023-10-26 | -17064.38 | -16637.78 | 426.60 |
| 2023 | 29/11/2023 | 26681 | BATCH-2023-11-27 | -31872.29 | -30825.36 | 1046.93 |
| 2024 | 27/03/2024 | 29684 | BATCH-2024-03-26 | -77692.03 | -73610.18 | 4081.85 |
| 2024 | 26/06/2024 | 31558 | BATCH-2024-06-26 | -39057.53 | -37294.98 | 1762.55 |
| 2024 | 30/07/2024 | 32332 | BATCH-2024-07-26 | -18061.64 | -16737.35 | 1324.29 |
| 2024 | 26/08/2024 | 33224 | BATCH-2024-08-26 | -22338.84 | -21197.32 | 1141.52 |
| 2024 | 10/12/2024 | 35263 | BATCH-2024-11-26 | -22581.72 | -21529.67 | 1052.05 |
| | | | | | **Total** | **13381.38** |

---

## 4. Settlement discount journals behind the B/F (both years)

| Year | Date | Journal | Batch | Amount (R) |
| :--- | :--- | :--- | :--- | ---: |
| 2023 | 26/06/2023 | PROFORMA-DJ-01 | BATCH-2023-06-26 | -1160.62 |
| 2023 | 26/07/2023 | PROFORMA-DJ-02 | BATCH-2023-07-26 | -203.65 |
| 2023 | 28/08/2023 | PROFORMA-DJ-03 | BATCH-2023-08-28 | -469.22 |
| 2023 | 26/09/2023 | PROFORMA-DJ-04 | BATCH-2023-09-26 | -367.10 |
| 2023 | 26/10/2023 | PROFORMA-DJ-05 | BATCH-2023-10-26 | -426.60 |
| 2023 | 27/11/2023 | PROFORMA-DJ-06 | BATCH-2023-11-27 | -701.93 |
| 2024 | 26/03/2024 | PROFORMA-DJ-07 | BATCH-2024-03-26 | -506.36 |
| 2024 | 26/04/2024 | PROFORMA-DJ-08 | BATCH-2024-04-26 | -375.10 |
| 2024 | 27/05/2024 | PROFORMA-DJ-09 | BATCH-2024-05-27 | -300.54 |
| 2024 | 26/06/2024 | PROFORMA-DJ-10 | BATCH-2024-06-26 | -956.28 |
| 2024 | 26/07/2024 | PROFORMA-DJ-11 | BATCH-2024-07-26 | -429.16 |
| 2024 | 26/08/2024 | PROFORMA-DJ-12 | BATCH-2024-08-26 | -543.52 |
| 2024 | 26/09/2024 | PROFORMA-DJ-13 | BATCH-2024-09-26 | 233.10 |
| 2024 | 26/10/2024 | PROFORMA-DJ-14 | BATCH-2024-10-26 | -983.04 |
| 2024 | 26/11/2024 | PROFORMA-DJ-15 | BATCH-2024-11-26 | -552.04 |
| 2024 | 27/12/2024 | PROFORMA-DJ-16 | BATCH-2024-12-27 | -310.37 |
| | | | **Total** | **-8052.43** |

---

## 5. Doctrine note

- **Every STAT batch from 2023–2024 has a remittance advice on file** (`data/remittance_manifest_2023.json`, `_2024.json`, `data/allocation_edges.csv`). Nothing behind the R38,791.27 is unexplained cash — it is eleven fully-reconciled receipts.
- The **variances found here** (R690.00 in 2023, R5,409.03 in 2024) are exactly what the current export's Path B journals `00000490–509` already correct. This bridge shows their *origin*, not a new problem.
- **The STAT 107 double-post** is a genuine raw-ERP posting defect (same discount entered twice, once as a bare Journal, once embedded in Payment), independent of the payment-tagging weakness documented elsewhere — worth flagging to finance if the underlying ERP ledger is ever corrected directly.
- **No further action required** for the current statement — the account-level bridge lines (`config/statement_of_account.json`) already carry the net effect of all of this forward into the live account.

---

## Related

- `TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md`
- `TWK002_Phantom_CN_Nets_Breakdown_2026-08-11.md`
- `data/remittance_manifest_2023.json`, `data/remittance_manifest_2024.json`
- `data/allocation_edges.csv`