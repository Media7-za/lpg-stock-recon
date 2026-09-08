# TWK002 — raw ERP exports

## Authoritative files

| File | Coverage | Header | Use |
| :--- | :--- | ---: | :--- |
| **`TWK002_FULL_HISTORY.TXT`** | **2023-04-28 → 2026-08-31** | **R26,498.36** | **Full timeline — stitched (see manifest)** |
| `DEBENQ.TXT` | Mar 2025 → 2026-08-31 | R26,498.36 | Current-window tail (native ERP pull) |
| `DEBENQ_TWK003.TXT` | Site code TWK003 | −R300.00 | Multi-site remittance slices |
| `DEBENQ_TWK004.TXT` | Site code TWK004 | R0.00 | Multi-site remittance slices |

## Historical slices (inputs to full-history stitch)

| File | Period | Closing / B/F |
| :--- | :--- | ---: |
| `TWK0022023.TXT` | Apr 2023 → Feb 2024 | B/F R0 → close R87,226.46 |
| `TWK0022024.TXT` | Mar 2024 → Feb 2025 | B/F R87,226.46 → close R38,791.27 |

## Superseded partials (keep for audit; do not use as primary)

| File | Notes |
| :--- | :--- |
| `DEBENQ_TWK002.TXT` | Aug-09-2026 era; header R118,131.54 |
| `DEBENQTWK002CURRENT.TXT` | Through 26 Aug; header R27,721.81 |
| `TWK002CURRENT23072026.TXT` | July snapshot |
| `TWK002CURRENT.TXT` / `TWK002CURRENT09082026.TXT` | Partial CURRENT exports |

## Regenerate full history

```bash
npm run debtors:twk002-full-history-txt
```

Manifest: `TWK002_FULL_HISTORY.manifest.json`  
Report: `reports/TWK002_Full_History_TXT_2026-09-02.md`

**Epistemic note:** `TWK002_FULL_HISTORY.TXT` is a **stitched analytical export** (PROVEN arithmetic at segment checkpoints). Replace with a single native ERP full-history pull when **H-013** completes.
