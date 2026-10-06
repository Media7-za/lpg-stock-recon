# Test Brief — 2026-10-06 — SA0001 live v5 projection run

**For:** a fresh agent session whose environment has `DATABASE_URL` set.
**Branch:** `claude/payment-matching-mechanisms-4h34be`. Work and commit **only** on this branch.
**Context:** build step 1 of `analysis/debtors/shared/docs/PROPOSED_Projection_Matching_Locks.md`
(PROPOSED — NOT RATIFIED). SA0001 is the pilot account. Its statement must come out **unchanged** apart from
the regeneration date, and a new `data/v5_projection.json` must appear beside it.

You are a **worker** session. Do not edit doctrine or hand-edit generated files. Tag findings
`PROVEN` / `ASSERTED` / `ASSUMED` and cite paths.

## 0. Preconditions

If `DATABASE_URL` is not set, **stop and report.** Do not use a stub or replay rows from another channel.

```bash
git fetch origin claude/payment-matching-mechanisms-4h34be
git checkout claude/payment-matching-mechanisms-4h34be
echo "${DATABASE_URL:+DATABASE_URL is set}"
npm run debtors:test                      # expect all pass (87 at time of writing)
```

## 1. Run

SA0001 already has `config/statement_v5.json`. Do not edit it.

```bash
npm run debtors:ingest-check -- --debtor SA0001
node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor SA0001
git diff --stat
git diff analysis/debtors/SA0001/reports/SA0001_Statement_Account_v5.md
```

## 2. Pass criteria

| # | Check | Expected |
| :--- | :--- | :--- |
| 1 | ERP tie | Combined 1A + 1B = **R10,804.97**, variance R0.00 (console + bridge) |
| 2 | Statement unchanged | the only diff in `SA0001_Statement_Account_v5.md` is the `**Last regenerated:**` line; in `src/features/debtor-position-workspace/data/fixtures/SA0001.v5.json`, only `lastGeneratedAt` |
| 3 | Projection checks | `analysis/debtors/SA0001/data/v5_projection.json` → `checks` all `true` |
| 4 | Fingerprint | `source.txtSha256` equals `sha256sum analysis/debtors/SA0001/raw/SA0001.TXT` (expected `dab06b2f…039c`) |
| 5 | Known lane case | invoice **50723** (R5,347.50, ref `DN-22719`) is a **CYL** row with `split_basis: DB_LINES`; invoice **50721** splits into LPG R324.88 + CYL R4,830 |

**Offline baseline (TXT only, no DB lines; ASSERTED):** 309 rows (PAYMENT_LANE 60, HEADER_FALLBACK 107,
REF_EMPTY 142), checks all true. Live, most HEADER_FALLBACK / REF_EMPTY rows should become `DB_LINES`.

**If check 2 fails** (any statement change other than the date line), that is a regression in the
generator change. Commit nothing; paste the diff into the handoff and stop.

## 3. Report (do not fix)

- `summary.splitBasisCounts` from the live run.
- Every remaining `HEADER_FALLBACK` row (doc, date, amount), cross-checked against the new ingest coverage report.

## 4. Commit (only if checks 1–4 pass)

One commit on this branch containing:
- `analysis/debtors/SA0001/data/v5_projection.json`
- `analysis/debtors/SA0001/reports/SA0001_Statement_Account_v5.md` (date line only)
- `src/features/debtor-position-workspace/data/fixtures/SA0001.v5.json`
- `analysis/debtors/SA0001/reports/SA0001_INGEST_COVERAGE_<date>.{json,md}`

Append a dated `history[]` entry to `analysis/debtors/SA0001/project.json` (variance, basis counts, commit),
and append the results as a new session block in `docs/handoffs/2026-10-04.md`.
