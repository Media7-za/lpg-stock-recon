# TWK002 — forked statements

Analytical outputs that **do not overwrite** the live customer draft at `reports/TWK002_Statement_of_Account.md`.

## Full history fork (two views)

### 1. Open-invoice statement (no payments)

| Artifact | Path |
| :--- | :--- |
| Config | `config/statement_of_account_full_history.json` |
| MD | `TWK002_Statement_of_Account_FullHistory.md` |
| PDF | `TWK002_Statement_of_Account_FullHistory.pdf` |

**Payments are not shown** — by design. `generate_statement_of_account.mjs` emits only **open invoices** + ageing (same layout as the live customer SOA). Settled invoices and all payment rows are excluded.

### 2. Transaction ledger (includes payments)

| Artifact | Path |
| :--- | :--- |
| MD | `TWK002_Full_History_Ledger.md` |
| Data source | `raw/TWK002_FULL_HISTORY.TXT` |

Shows **every row**: invoices, credit notes, **payments**, journals — grouped by month with running balance. **44 payment rows** in the stitched file.

Regenerate ledger:

```bash
npm run debtors:twk002-full-history-ledger
```

Regenerate open-invoice fork:

```bash
npm run debtors:twk002-statement-full-history
```

### 3. Reconciliation layers (ERP → remittance → correction)

| Artifact | Path |
| :--- | :--- |
| MD | `TWK002_Reconciliation_Layers.md` |

Three-layer view per remittance batch:
- **Layer 1** — ERP as-posted (gross/untagged payments)
- **Layer 2** — Remittance invoice slices (`allocation_edges.csv`)
- **Layer 3** — Path B corrections (cash strip, discount journal, ERP tagging tasks)

```bash
npm run debtors:twk002-reconciliation-layers
```

### Epistemic posture

| Metric | Value | Tag | Notes |
| :--- | ---: | :--- | :--- |
| ERP header | R26,498.36 | PROVEN | Full-history TXT header |
| Σ open invoices (lpg_stripped) | R443,573.83 | PROVEN | Historical invoices not in `closedInvoiceOverrides` |
| Tag gate | BLOCKED | PROVEN | Invariant breach R417,075.47 — **expected** on full-history without full override set |
| Customer send | **No** | — | `--force` bypasses gate for internal analysis only |

**Do not send** this fork to the customer. Use the live draft (`primaryTxt` = `DEBENQ.TXT`) after gate ALLOWED.
