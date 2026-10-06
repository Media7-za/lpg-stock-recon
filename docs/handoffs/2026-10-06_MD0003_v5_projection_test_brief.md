# Test Brief — 2026-10-06 — MD0003 live v5 projection run

**For:** a fresh agent session with database access.
**Branch:** `claude/payment-matching-mechanisms-4h34be`. Work and commit **only** on this branch, never on `main`.
**Context:** build step 1 of `analysis/debtors/shared/docs/PROPOSED_Projection_Matching_Locks.md`
(PROPOSED — NOT RATIFIED). The v5 generator now also writes `data/v5_projection.json`.
This test checks that it behaves correctly on live data for **MD0003** (BLUFF MEAT SUPPLY), one of the three
remittance-backed accounts (TWK002, CAP000, MD0003).

You are a **worker** session. Do not edit doctrine. Do not hand-edit generated files. Report
findings with epistemic tags (`PROVEN` / `ASSERTED` / `ASSUMED`) and cite artifact paths (AGENTS.md).

---

## 0. Preconditions

- `DATABASE_URL` must be set (the generator queries `vw_clean_transactions`). If it is not set,
  **stop and report that.** Do not substitute a stub, and do not commit any output built without the database.
- `npm run debtors:test` must pass (expected: 87/87) before you touch anything.

```bash
git fetch origin claude/payment-matching-mechanisms-4h34be
git checkout claude/payment-matching-mechanisms-4h34be
echo "${DATABASE_URL:+DATABASE_URL is set}"
npm run debtors:test
```

## 1. Create the v5 config (MD0003 has only a v4 config)

Create `analysis/debtors/MD0003/config/statement_v5.json` by copying `config/statement_v4.json` and adding
`"paymentLane": "LPG"`. Do not change any other value.

| Field | Value | Tag | Source |
| :--- | :--- | :--- | :--- |
| `periodStart` | `2025-01-01` | ASSERTED | `statement_v4.json` |
| `combinedBf` | `52607.52` | PROVEN | `raw/MD0003CURRENT.TXT` line 14 (`BALANCE B/F`) |
| `cylOpeningFinancial` | `0.0` | **ASSUMED** | inherited from v4; see `reports/MD0003_CYL_Deposit_Posting_Gap.md` |
| `paymentLane` | `LPG` | ASSUMED | template default |

Note: TXT lines 2–3 (a 2023 `Bank UD` +12,838.37 and `Payment` −12,838.37 pair) fall before
`periodStart` and net to zero, so the B/F is unaffected.

## 2. Ingest coverage, then the generator

```bash
npm run debtors:ingest-check -- --debtor MD0003   # writes reports/MD0003_INGEST_COVERAGE_<date>.json
node analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs --debtor MD0003
```

## 3. Pass criteria

| # | Check | Expected | How |
| :--- | :--- | :--- | :--- |
| 1 | ERP tie | Combined 1A + 1B = **R16,371.56**, variance R0.00 | console output; `reports/MD0003_Statement_Account_v5.md` bridge |
| 2 | Projection self-checks | `checks` all `true` | `data/v5_projection.json` → `checks` |
| 3 | Fingerprint | `source.txtSha256` equals `sha256sum raw/MD0003CURRENT.TXT` | compare |
| 4 | Split basis | most Invoice / Crd Note rows `DB_LINES`; record the counts per basis | `summary.splitBasisCounts` |
| 5 | Ingest gate recorded | `ingestGate` not null | `data/v5_projection.json` |

**Baseline from an offline run (TXT only, no DB lines; 2026-10-06, ASSERTED):** 230 rows (PAYMENT_LANE 20,
HEADER_FALLBACK 92, REF_EMPTY 118), checks all true, ERP variance R0.00. With live DB line detail, most
HEADER_FALLBACK and REF_EMPTY rows should become `DB_LINES`, and some invoices should split into LPG + CYL lanes.

## 4. Things to look for and report (do not fix)

1. **Remaining `HEADER_FALLBACK` rows:** list doc numbers and amounts. These lack usable DB line detail and
   can only produce probable matches (proposal P10). Check them against the ingest coverage report.
2. **Rows whose lane moved compared with the offline baseline**, especially any CYL deposit that had been
   sitting in LPG.
3. **Part 1B vs Part 2 custody variance** (cylinder variance in the bridge). MD0003 has a known deposit
   posting gap (`reports/MD0003_CYL_Deposit_Posting_Gap.md`), so a non-zero value is expected. Report the
   amount; do not explain it away.
4. **Remittance cross-check (read-only):** for payments 17669, 42051 and 45595, confirm each payment row
   in the projection matches the payment amount in its remittance report
   (`reports/MD0003_Remittance_Payment_*.md`). Report agreement or disagreement per payment.

## 5. Commit (only if checks 1–3 pass)

Commit to this branch, in one commit:
- `analysis/debtors/MD0003/config/statement_v5.json`
- `analysis/debtors/MD0003/reports/MD0003_INGEST_COVERAGE_<date>.{json,md}`
- `analysis/debtors/MD0003/reports/MD0003_Statement_Account_v5.md`
- `analysis/debtors/MD0003/data/v5_projection.json`
- `src/features/debtor-position-workspace/data/fixtures/MD0003.v5.json`

Append one dated `history[]` entry to `analysis/debtors/MD0003/project.json` naming the variance, the row
counts per basis and the commit. Then append the results (sections 3 and 4) as a new session block in
`docs/handoffs/2026-10-04.md`.

If any of checks 1–3 fails, **commit nothing.** Write the failure, with console output, into the handoff
and stop.
