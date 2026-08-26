# AP Reconciliation Workflow (Creditors)

End-to-end lifecycle for creditor Statement v5 (008ORY pilot).

---

## 1. Ingest

1. Drop ERP creditor enquiry TXT → `analysis/creditors/[CODE]/raw/[CODE]CURRENT.TXT`
2. Or export from DB (interim): `npm run creditors:export-txt -- --creditor [CODE]`
3. Copy / edit `config/statement_v5.json` from [`templates/statement_v5_config.template.json`](../templates/statement_v5_config.template.json)
4. Set `combinedBf` from balance immediately before first period row in TXT

---

## 2. Ingest gate

Validates **STDatabase line items** for GRV/Deb Note (custody lane) and treats payments as **TXT-only** (no DB header required).

```bash
npm run creditors:ingest-check -- --creditor 008ORY
```

Outputs `reports/[CODE]_INGEST_COVERAGE_[date].json/.md`. Freshness uses `CURRENT.TXT` item sync, not DTRX headers. Custody conclusions blocked when `gates.custody === BLOCKED`.

---

## 3. Generate statement v5

```bash
npm run creditors:statement-v5 -- --creditor 008ORY
```

Outputs:
- `reports/[CODE]_Statement_Account_v5.md`
- `src/features/creditor-position-workspace/data/fixtures/[CODE].v5.json`

**Pass:** console shows `ERP variance R0.00` and `Sub-ledger tie variance: R0.00`.

---

## 4. Review

- Part 1B: CYL deposit GRV+Deb Note pairs should largely net within period
- Part 2: shell qty vs Part 1B financial (target < R1.00 custody variance when ingest pass)
- Linked legacy accounts (007ORY): confirm DB scope in config

---

## Commands summary

| Command | Script |
| :--- | :--- |
| `npm run creditors:export-txt` | `export_creditor_txt_from_db.mjs` |
| `npm run creditors:ingest-check` | `validate_txt_db_coverage.mjs` |
| `npm run creditors:statement-v5` | `reconcile_creditor_v5_from_txt.mjs` |

Requires `DATABASE_URL` for ingest-check and statement generation (Part 2 + line split).
