# TWK002 — STAT 129 remittance (`B226 - REMITTANCE.pdf`)

**Generated:** 2026-08-30  
**PDF:** `raw/Remittances/B226 - REMITTANCE.pdf` (image scan — operator-extracted lines)  
**ERP payment:** `00045899` · **STAT 129** · posted **26/08/2026** · cash **−R108,823.42**  
**Source TXT:** `raw/DEBENQTWK002CURRENT.TXT`

---

## Model B decomposition (operator-confirmed — PROVEN footer)

| Component | Amount (R) | Epistemic | ERP status |
| :--- | ---: | :--- | :--- |
| Gross (batch settlement) | 110,046.87 | **PROVEN** — matches pre-payment open-invoice cluster (snapshot `2026-08-11_v1`) | Invoices/CNs on ledger |
| Settlement discount | **1,223.45** | **PROVEN** — PDF footer | **POSTED** — journal `00000510` (H-025 done 2026-08-30) |
| Cash (net payable) | **108,823.42** | **PROVEN** — receipt `00045899` | **POSTED** |

**Math check:** `110,046.87 − 1,223.45 = 108,823.42` ✓

**Tripwire:** reopens if remittance PDF amended or footer totals change.

---

## Batch header (ASSERTED — advice ref pending from PDF header)

| Field | Value |
| :--- | :--- |
| `batch_id` | **BATCH-2026-STAT-129** |
| Advice date | **2026-08-14** (from batch label) |
| Electronic paid | **2026-08-31** (operator) |
| ERP receipt | **00045899** (posted 2026-08-26) |
| `remittance_ref` | **B226/** — *KRD suffix not yet captured; update manifest when header typed* |
| Line count | **21** cash allocation lines |
| Post-payment header | **R27,721.81** (inv `52803` + CN `15553` same cycle — **not** in this batch) |

---

## Step A — Path B discount journal (ERP Agent)

| Field | Value |
| :--- | :--- |
| Amount | **−R1,223.45** |
| Narrative min | `STAT 129` · `B226/…` · paid **2026-08-31** · `00045899` |
| Allocate to | 8 discount-bearing lines (see table below) |
| Human task | **H-025** — **DONE** (`00000510`) |

### Discount lines (settlement column on advice)

| Doc | Type | Gross (R) | Discount (R) | Net (R) |
| :--- | :--- | ---: | ---: | ---: |
| 15155 | CN | −17,250.00 | 431.25 | −16,818.75 |
| 15370 | CN | −19,665.00 | 491.63 | −19,173.37 |
| 15262 | CN | −14,835.00 | 370.88 | −14,464.12 |
| 51226 | Inv | 12,471.98 | 311.80 | 12,160.18 |
| 51496 | Inv | 29,721.98 | 743.05 | 28,978.93 |
| 51841 | Inv (CYL split) | 4,140.00 | 103.50 | 4,036.50 |
| 51841 | Inv (LPG split) | 20,302.49 | 507.56 | 19,794.93 |
| 52241 | Inv | 34,052.09 | 851.30 | 33,200.79 |
| **Σ discount** | | | **1,223.45** | |

---

## Step B — Cash receipt tagging `00045899` (ERP Agent)

**Authority:** `data/allocation_edges.csv` **AL-0171–AL-0191** (21 edges).

### Credit notes (offsets)

| Doc | ERP amount | Discount | **Net allocate (R)** | Edge |
| :--- | ---: | ---: | ---: | :--- |
| 14414 | −22,195.00 | 0.00 | −22,195.00 | AL-0171 |
| 14554 | −15,180.00 | 0.00 | −15,180.00 | AL-0172 |
| 14649 | −14,490.00 | 0.00 | −14,490.00 | AL-0173 |
| 14711 | −13,972.50 | 0.00 | −13,972.50 | AL-0174 |
| 14910 | −9,142.50 | 0.00 | −9,142.50 | AL-0175 |
| 14982 | −11,385.00 | 0.00 | −11,385.00 | AL-0176 |
| 15155 | −17,250.00 | 431.25 | −16,818.75 | AL-0177 |
| 15370 | −19,665.00 | 491.63 | −19,173.37 | AL-0178 |
| 15262 | −14,835.00 | 370.88 | −14,464.12 | AL-0179 |
| **Subtotal** | | | **−136,821.24** | |

### Invoices

| Doc | ERP amount | Discount | **Net allocate (R)** | Edge |
| :--- | ---: | ---: | ---: | :--- |
| 49208 | 35,663.47 | 0.00 | 35,663.47 | AL-0180 |
| 49606 | 23,457.21 | 0.00 | 23,457.21 | AL-0181 |
| 49882 | 23,348.97 | 0.00 | 23,348.97 | AL-0182 |
| 50099 | 22,982.66 | 0.00 | 22,982.66 | AL-0183 |
| 50439 | 5,300.12 | 0.00 | 5,300.12 | AL-0184 |
| 50680 | 16,387.95 | 0.00 | 16,387.95 | AL-0185 |
| 50898 | 20,332.95 | 0.00 | 20,332.95 | AL-0186 |
| 51226 | 12,471.98 | 311.80 | 12,160.18 | AL-0187 |
| 51496 | 29,721.98 | 743.05 | 28,978.93 | AL-0188 |
| 51841 | 4,140.00 | 103.50 | 4,036.50 | AL-0189 |
| 51841 | 20,302.49 | 507.56 | 19,794.93 | AL-0190 |
| 52241 | 34,052.09 | 851.30 | 33,200.79 | AL-0191 |
| **Subtotal** | | | **245,644.66** | |

**Net check:** `245,644.66 − 136,821.24 =` **108,823.42** ✓ (matches receipt)

**Human task:** **H-026**

---

## Inv 51841 composite line — RESOLVED (PROVEN)

PDF anomaly row (`YOUR REF` = date `15.07.2026`, `OUR REF` = **374961**) is **not** a missing invoice.

| Line | Gross (R) | ERP |
| :--- | ---: | :--- |
| CYL split | 4,140.00 | Part of inv **51841** header **24,442.49** |
| LPG split (our_ref 374961) | 20,302.49 | Same invoice — remittance composite row |
| **Σ** | **24,442.49** | **PROVEN** — `DEBENQTWK002CURRENT.TXT` row 51841 |

Tag **both** cash slices to **inv 51841** (edges AL-0189, AL-0190). No separate INVNO search required.

**Kill condition:** would falsify if ERP adds a second invoice dated 15/07/2026 for exactly R20,302.49 with ref 374961 — none in TXT/DB.

---

## Expected outcome after Steps A + B

| Metric | Before STAT 129 | After (expected) |
| :--- | ---: | ---: |
| Open invoices from batch | R110,046.87 gross cluster | **Cleared** (11-invoice Aug snapshot cluster) |
| Header | R118,131.54 (Aug-09 export) → R27,721.81 (Aug-26 export) | Stable at **R27,721.81** until new billing |
| Bridge residual R8,084.67 | Internal | **Unchanged** — STAT 129 clears *current* open cluster; historical bridge lines (B/F, STAT 112/114 untagged) remain until H-022/H-023 |

**Note:** inv **52803** / CN **15553** (Aug 26) post **after** payment in TXT — not part of this remittance batch.

---

## Regenerate after ERP posts

```bash
npm run debtors:twk002-allocation-ingest   # if lines edited
npm run debtors:tag-check -- --debtor TWK002 --txt analysis/debtors/TWK002/raw/DEBENQTWK002CURRENT.TXT --write
node analysis/debtors/TWK002/scripts/build_balance_bridge.mjs --write
```

---

## Key paths

| Asset | Path |
| :--- | :--- |
| This report | `reports/TWK002_STAT129_Remittance_2026-08.md` |
| Manifest | `data/remittance_manifest_2026.json` → `BATCH-2026-STAT-129` |
| Lines | `data/remittance_lines_2026.csv` |
| Edges | `data/allocation_edges.csv` AL-0171–AL-0191 |
| Checklist | `data/finance_posting_checklist_2025_phase2.csv` TASK-2026-0002 |
| PDF | `raw/Remittances/B226 - REMITTANCE.pdf` |
