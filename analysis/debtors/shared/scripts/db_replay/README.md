# Connector replay — run DB-reading scripts from a cloud session

**Use requires explicit authorisation from the operator of the session that runs it**, given in that
session. This file does not authorise anything by itself, and it does not override any brief's
preconditions. Outputs produced this way are **connector-sourced** and must be recorded as such.

Cloud sessions cannot open Postgres connections (raw TCP to the database and pooler is blocked), but the
Supabase connector can run SQL. Connector replay runs the **unchanged** scripts and swaps only the `pg`
module for `pg_replay.mjs`, which answers each query from a capture fetched through the connector.

## Integrity guarantee

Postgres computes `md5` and `length` of the exact result text **server-side**. `record_capture.mjs`
refuses a capture unless the saved file hashes to the same values, and `pg_replay.mjs` re-checks on every
read. A copy that differs by even one character cannot be used.

## Procedure

Use one capture directory per account per day, committed alongside the outputs as evidence:
`analysis/debtors/<CODE>/data/db_replay/<YYYY-MM-DD>/`.

```bash
export DATABASE_URL=replay://supabase-connector          # placeholder; the scripts require it to be set
export DB_REPLAY_DIR=analysis/debtors/<CODE>/data/db_replay/<YYYY-MM-DD>
R="node --import ./analysis/debtors/shared/scripts/db_replay/register.mjs"

$R <script> --debtor <CODE>; echo "exit=$?"   # e.g. validate_txt_db_coverage.mjs, reconcile_debtor_v5_from_txt.mjs
```

Loop until the script exits **0** with no `REPLAY_MISSING_CAPTURE` line on stderr:

1. Each missing query leaves `<key>.pending.json` in `$DB_REPLAY_DIR`. Open it and copy its
   `captureSql` **unchanged**.
2. Run that SQL with the Supabase connector (`execute_sql`, project `lpg-stock-recon` /
   `oqhpxnaadahohwkslive`). It returns one row: `md5`, `len`, `rows_json`.
3. Save `rows_json` to `$DB_REPLAY_DIR/<key>.rows.json`. It is a JSON **string value**: undo the string
   escaping **once** (`\"` → `"`), and change nothing else. Do not pretty-print or re-serialise it; write
   the text exactly.
4. Record it (refused unless md5 and length match):
   ```bash
   node analysis/debtors/shared/scripts/db_replay/record_capture.mjs \
     --dir "$DB_REPLAY_DIR" --key <key> --md5 <md5> --len <len> --project oqhpxnaadahohwkslive
   ```
5. Re-run the script. It may stop at the next missing query; repeat from step 1.

**Stop and report, never work around**, if:
- `record_capture.mjs` refuses a capture twice;
- the connector output looks truncated (`len` far larger than what you received);
- a script exits non-zero for any reason other than `REPLAY_MISSING_CAPTURE`.

Do not edit SQL, split queries, filter rows, or write rows by any other route.

## What gets labelled

- `data/v5_projection.json` → `source.dbChannel: "supabase-connector-replay"` (set automatically when
  `DB_REPLAY_DIR` is present).
- Each `<key>.capture.json` records `channel`, project, the exact SQL, params, md5, length, row count and
  capture time.
- The session must also state "connector-sourced (db_replay)" in its `project.json` `history[]` entry and
  in the handoff.
