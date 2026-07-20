# WO0001 — CN DN-Ref Audit (Mar–Jun 2026)

**Turn:** WO0001-8  
**Generated:** 2026-07-20

---

## Executive summary

| Metric | Value | Tag |
| :--- | ---: | :--- |
| Baseline Tier-3 (ref_no gate) | 24 offsets | PROVEN (Turn 7 engine) |
| **New DN-gate discoveries** | **5** | ASSERTED |
| Mar–Jun 2026 DN discoveries | 4 | — |
| Turn 7 engine-open sum | R161 214.89 | ASSERTED |
| Turn 8 engine-open sum | R101 774.13 | ASSERTED |
| **Phantom open closed** | **R59 440.76** | PROVEN (arithmetic) |
| Gap vs dashboard LPG | R8 929.95 | DEFECT (residual) |

---

## Root cause (Turn 7 defect)

2026 LPG credit notes cite **DN#** in `ref_no` / description, not `invoice.doc_no`:

| CN | DN | LPG | → Invoice | Missed by ref_no gate? |
| :--- | :--- | ---: | :--- | :---: |
| 14595 | 21959 | R13 895,01 | **49682** | **yes** |
| 14670 | 22031 | R8 759,77 | **49968** | **yes** |
| 14829 | 22357 | R11 835,47 | **50459** | **yes** (same-day correction) |
| 15010 | 22450 | R14 167,87 | **50937** | **yes** |

CN **14608**, **15011** already matched via ref_no in baseline.

---

## DN-gate discoveries (full ledger)

| CN | Date | DN | → Invoice | Inv LPG | CN LPG | Lag | Exact |
| :--- | :--- | :--- | :--- | ---: | ---: | ---: | :---: |
| 8139 | 2024-04-18 | 8799 | 31379 | R10 782.64 | R10 782.64 | 2d | ✓ |
| 14595 | 2026-03-15 | 21959 | 49682 | R13 895.01 | R13 895.01 | 5d | ✓ |
| 14670 | 2026-03-26 | 22031 | 49968 | R8 759.77 | R8 759.77 | -1d | ✓ |
| 14829 | 2026-04-29 | 22357 | 50459 | R11 835.47 | R11 835.47 | -1d | ✓ |
| 15010 | 2026-06-01 | 22450 | 50937 | R14 167.87 | R14 167.87 | 4d | ✓ |

---

## Proposed gate rule (`config/cn_dn_gate_proposed.json`)

```text
Tier 3a: CN.ref_no = invoice.doc_no (unchanged)
Tier 3b: CN LPG DN# = invoice LPG DN#, lag ∈ [-1, 5]d, |cn_lpg| ≈ inv_lpg (±R0.05)
```

**Kill condition:** If Tier 3b match ambiguous (>1 candidate, no amount tie-break), STOP and queue operator.

---

## Invoices removed from outstanding by DN gate

- **31379** ← CN 8139 (R10 782.64 void)
- **49682** ← CN 14595 (R13 895.01 void)
- **49968** ← CN 14670 (R8 759.77 void)
- **50459** ← CN 14829 (R11 835.47 void)
- **50937** ← CN 15010 (R14 167.87 void)

---

*Read-only audit complete. Merged offsets: `data/cn_offsets_merged.json`*
