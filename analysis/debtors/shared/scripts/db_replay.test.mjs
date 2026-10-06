/**
 * Contract tests for connector replay (db_replay/replay_core.mjs).
 * The md5 fixture is a real capture: sync_logs query via the Supabase connector,
 * 2026-10-06 — Postgres md5(t) = 379d332c…6861, length 142.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCaptureSql,
  dateColumns,
  inlineParams,
  queryKey,
  rehydrateRows,
  verifyRowsText,
} from './db_replay/replay_core.mjs';

const REAL_ROWS =
  '[{"latest": "2026-10-05T19:35:39.286758+00:00", "file_type": "HEADERS"}, {"latest": "2026-10-05T19:35:46.159888+00:00", "file_type": "ITEMS"}]';

test('local md5 of a verbatim copy equals the server-side md5 (real capture)', () => {
  const v = verifyRowsText(REAL_ROWS, { md5: '379d332ce6ce44873ac6b0fb3e166861', len: 142 });
  assert.equal(v.ok, true);
  assert.equal(verifyRowsText(`${REAL_ROWS}\n`, { md5: '379d332ce6ce44873ac6b0fb3e166861', len: 142 }).ok, true);
});

test('any transcription change is refused', () => {
  const bad = REAL_ROWS.replace('HEADERS', 'HEADERX');
  assert.equal(verifyRowsText(bad, { md5: '379d332ce6ce44873ac6b0fb3e166861', len: 142 }).ok, false);
  const reformatted = JSON.stringify(JSON.parse(REAL_ROWS));
  assert.equal(verifyRowsText(reformatted, { md5: '379d332ce6ce44873ac6b0fb3e166861', len: 142 }).ok, false);
});

test('query key ignores whitespace but not parameters', () => {
  const a = queryKey('SELECT 1\n   FROM t WHERE a = $1', ['SA0001']);
  assert.equal(a, queryKey('SELECT 1 FROM t WHERE a = $1', ['SA0001']));
  assert.notEqual(a, queryKey('SELECT 1 FROM t WHERE a = $1', ['MD0003']));
});

test('parameters inline as escaped literals, $10 before $1', () => {
  assert.equal(inlineParams("WHERE a = $1 AND b = $2::date", ["O'Brien", '2026-01-01']), "WHERE a = 'O''Brien' AND b = '2026-01-01'::date");
  const many = Array.from({ length: 10 }, (_, i) => `v${i + 1}`);
  assert.match(inlineParams('$1 $10', many), /^'v1' 'v10'$/);
  assert.throws(() => inlineParams('$1 $2', ['x']), /Unbound/);
});

test('capture SQL wraps the inlined query and asks Postgres for md5 + length', () => {
  const sql = buildCaptureSql('SELECT doc_no FROM t WHERE account_no = $1;', ['SA0001']);
  assert.match(sql, /md5\(t\) AS md5, length\(t\) AS len/);
  assert.match(sql, /jsonb_agg\(q\)/);
  assert.match(sql, /account_no = 'SA0001'\n\) q\) x$/);
});

test('date / timestamp casts are rehydrated like node-postgres', () => {
  const sql = 'SELECT tx_date::date AS tx_date, MAX(created_at)::timestamptz AS latest, x::float AS amount FROM t';
  const cols = dateColumns(sql);
  assert.deepEqual([...cols.date], ['tx_date']);
  assert.deepEqual([...cols.timestamp], ['latest']);
  const [r] = rehydrateRows([{ tx_date: '2026-05-18', latest: '2026-10-05T19:35:39.286758+00:00', amount: 1.5 }], sql);
  assert.ok(r.tx_date instanceof Date);
  assert.equal(r.tx_date.getFullYear(), 2026);
  assert.equal(r.tx_date.getMonth(), 4);
  assert.equal(r.tx_date.getDate(), 18);
  assert.equal(r.latest.toISOString(), '2026-10-05T19:35:39.286Z');
  assert.equal(r.amount, 1.5);
});
