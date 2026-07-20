# Debtors Evidence Exchange

Review-ready reconciliation artifacts for orchestration, operator ratification, and external audit — without requiring repo or database access.

---

## 1. Purpose

The Evidence Exchange is a **dedicated shared folder** for debtor reconciliation outputs produced during worker turns. It establishes a clean boundary between:

| Party | Role |
| :--- | :--- |
| **Cursor (Repo Agent)** | Executes turns, writes canonical artifacts in debtor workspaces, exports review copies here |
| **ChatGPT (Orchestration Session)** | Reviews bundles, triages KPIs, dispatches turns, queues human work — does not mutate canonical state |
| **Operator** | Ratifies overrides, posts ERP journals, sends customer communications |

This folder is an **Evidence Exchange**, not a replacement repository and not a general working directory. Scripts remain in their normal repo paths (`analysis/debtors/<DEBTOR>/scripts/`). Canonical data remains in debtor workspaces (`analysis/debtors/<DEBTOR>/data/`, `config/`, `reports/`).

---

## 2. Folder structure

```text
analysis/debtors/evidence_exchange/
├── README.md
├── templates/
│   ├── TURN_MANIFEST.template.json
│   └── TURN_BUNDLE_CHECKLIST.md
└── <DEBTOR_CODE>/
    └── turn-<NNN>/
        ├── manifest.json          ← mandatory
        ├── worker_report.md
        ├── statement_bridge.md
        ├── … (review artifacts)
        └── decision_inputs.md
```

Every turn folder **must** contain `manifest.json` using the schema in `templates/TURN_MANIFEST.template.json`.

---

## 3. Doctrine

### Allowed

- Worker reports, statement bridges, residual decompositions
- Allocation edges and OTHER-lane edge extracts
- Registry snapshots, proposed overrides (staged only)
- Reconciliation summaries, operator decision inputs
- Generated debtor statements, carry blocks
- Read-only extracts needed to support a finding

### Not allowed

- Application source code, scripts, or dependency folders
- Temporary debug files or unstructured scratch work
- Credentials, `.env` files, or secrets of any kind
- Full unrestricted database dumps
- Unrelated repo documentation

---

## 4. ERP freshness gate (mandatory)

> **The newest ERP extract in the repository is not automatically the current ERP position.** Before any live financial conclusion, the operator must either upload a fresh ERP extract or explicitly confirm that the repository file is still the latest available.

Every debtor turn involving a **balance**, **allocation reconciliation**, **statement generation**, **debtor communication**, **payment position**, **registry ratification**, or **reconciliation closure** must begin with the ERP freshness gate.

### Gate procedure

Before treating any ERP TXT (or equivalent extract) as the current financial anchor:

1. Identify the newest ERP extract in the repository for that debtor.
2. Record: filename, explicit period-end (if stated), last transaction date, current balance, and repository commit/modification context where available.
3. Compare the evidence date with the current operating date.
4. Ask the operator:

   > The latest ERP extract currently available is `<filename>`, with balance `<amount>` and evidence dated `<date>`. Is this still the latest ERP export, or should you upload a fresh ERP TXT file before we continue?

5. **STOP** financial reconciliation work until either:
   - the operator uploads a newer export; or
   - the operator **explicitly confirms** the existing extract is the latest available.

Do **not** infer operator confirmation from silence.

### Evidence status before confirmation

| Label | Meaning |
| :--- | :--- |
| `LATEST_IN_REPOSITORY` | Newest file stored in repo — **not** operator-confirmed as current ERP |
| `CURRENT_CONFIRMED_BY_OPERATOR` | Operator explicitly confirmed no newer export exists |
| `SUPERSEDED` | Replaced by a newer upload |

Until confirmed, classify the balance as **`ASSERTED_STALE_PENDING_OPERATOR_CONFIRMATION`**. It may archive a historical turn but must **not** be used to:

- generate or approve live debtor communications
- recommend a collection amount
- close reconciliation
- ratify allocation overrides dependent on the current balance
- declare a statement current
- supersede a later operator-supplied balance

Record gate state in every manifest under `erp_freshness` (see `templates/TURN_MANIFEST.template.json`).

---

## 5. Review rules

1. **Self-contained bundles** — Each turn folder must be sufficient for independent review without repo or database access. Canonical source paths are recorded in `manifest.json` → `artifacts[].canonical_source`.

2. **As-at dates and sources** — All balances require an explicit as-at date and source artifact (e.g. ERP TXT filename, `dashboard_metrics.json`, Supabase query date).

3. **Staleness** — A newer TXT slice, payment, credit note, or portfolio delta invalidates stale communications and statements drafted against an older anchor. Manifests must record `staleness_warning` when applicable.

4. **Staged overrides** — Proposed overrides in `allocation_overrides_proposed.json` are **not canonical** until operator ratification moves them to `payment_pattern_overrides.json` with `approval_status: approved`.

5. **Completion gates** — No reconciliation may be marked complete while a conservation invariant or tolerance gate fails (typically allocation residual ≤ ±R0.05).

6. **No secrets** — Never copy credentials, API keys, or `.env` contents into the exchange.

7. **Copy, don't move** — Export copies or generated review outputs. Do not delete or relocate canonical repo-side artifacts.

---

## 6. Turn export rule

At the end of every debtor turn, Cursor exports relevant review artifacts to:

```text
analysis/debtors/evidence_exchange/<DEBTOR_CODE>/turn-<NNN>/
```

Use `templates/TURN_BUNDLE_CHECKLIST.md` before publishing a bundle.

---

## 7. Current bundles

| Debtor | Turn | Outcome | Residual | Path |
| :--- | ---: | :--- | ---: | :--- |
| WO0001 | 009 | STOP | R314.52 | `WO0001/turn-009/` |

---

*Framework version: 2026-07-20*
