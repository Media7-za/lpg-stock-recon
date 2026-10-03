# TWK002 remittance ledger restart

Greenfield remittance-authoritative ledger. **Does not overwrite live SOA.**

## Authority

| Source | Role |
| :--- | :--- |
| `raw/TWK002_FULL_HISTORY.TXT` | Document spine (Invoice + Crd Note only) |
| `data/remittance_manifest_*.json` + `data/remittance_lines_*.csv` | Allocation + Model B journals |
| ERP payment rows | Cash pool reference only — **INVNO ignored** |

## Ignored

- ERP payment `INVNO` / header allocation
- `closedInvoiceOverrides`, H-022–H-027, `allocation_edges.csv`
- Path B journals in TXT (00000490–00000511) — replaced by pro forma discount journals

## Artifacts

| File | Contents |
| :--- | :--- |
| `raw_spine.csv` | Layer A — invoices + CNs |
| `cash_pools.csv` | ERP receipts, unallocated |
| `remittance_alloc.csv` | Layer B + C — line cash + batch discount |
| `ledger.csv` | Running remittance AR |
| `open_invoices.csv` | Customer bill (not on remittance) |
| `erp_tieout.md` | Remittance AR vs ERP header |

## Regenerate

```bash
npm run debtors:twk002-stat123-site-split   # tag STAT 123 lines with debtor_code
npm run debtors:twk002-remit-ledger-restart
```

Multi-site STAT 123: see `stat123_site_split.md`.
