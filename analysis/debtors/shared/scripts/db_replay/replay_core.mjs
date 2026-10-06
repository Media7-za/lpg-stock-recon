/**
 * Connector replay — core helpers (pure; no DB, no network).
 *
 * Why this exists: cloud agent sessions cannot open a Postgres connection, but
 * they can run SQL through the Supabase connector. Connector replay lets the
 * UNCHANGED generator scripts run against rows fetched that way, with proof that
 * the rows were not altered in transit:
 *
 *   1. The script issues a query → the shim derives a key from the exact SQL +
 *      params and, if no capture exists, writes a `.pending.json` holding a
 *      ready-to-run `captureSql`, then stops.
 *   2. The agent runs `captureSql` through the connector. Postgres returns the
 *      result as ONE JSON text plus md5(text) and length(text), computed
 *      server-side.
 *   3. The agent saves that text verbatim to `<key>.rows.json` and records it
 *      with record_capture.mjs, which refuses the file unless the local md5 and
 *      length equal the server's. A transcription error cannot pass.
 *   4. Re-running the script replays the verified rows (md5 re-checked on every read).
 *
 * Tooling only: using it requires explicit authorisation from the operator of
 * the session that runs it. Outputs produced this way are labelled
 * connector-sourced, never as a direct database read.
 */
import crypto from 'crypto';

export const REPLAY_CHANNEL = 'supabase-connector-replay';

export function md5(text) {
  return crypto.createHash('md5').update(text, 'utf8').digest('hex');
}

/** Whitespace-insensitive SQL normalisation, so indentation never changes a key. */
export function normalizeSql(sql) {
  return String(sql).replace(/\s+/g, ' ').trim();
}

export function queryKey(sql, params = []) {
  return crypto
    .createHash('sha256')
    .update(`${normalizeSql(sql)}\u0000${JSON.stringify(params ?? [])}`)
    .digest('hex')
    .slice(0, 16);
}

function sqlLiteral(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
  throw new Error(`Unsupported query parameter type for replay: ${typeof v}`);
}

/** Inline $1..$n as SQL literals (highest index first so $10 is not read as $1). */
export function inlineParams(sql, params = []) {
  let out = String(sql);
  for (let i = params.length; i >= 1; i--) {
    out = out.split(`$${i}`).join(sqlLiteral(params[i - 1]));
  }
  if (/\$\d+/.test(out)) throw new Error('Unbound $n placeholder remains after inlining');
  return out;
}

/**
 * The SQL the agent runs through the connector. Postgres serialises the result
 * itself and returns md5 + length of that exact text, so the local copy can be
 * proven byte-identical.
 */
export function buildCaptureSql(sql, params = []) {
  const inner = inlineParams(sql, params).trim().replace(/;\s*$/, '');
  return [
    'SELECT md5(t) AS md5, length(t) AS len, t AS rows_json',
    // jsonb text is single-line (json_agg inserts newlines between rows, which
    // are easy to lose when an agent copies the value out of a tool result).
    "FROM (SELECT coalesce(jsonb_agg(q)::text, '[]') AS t FROM (",
    inner,
    ') q) x',
  ].join('\n');
}

/**
 * Columns the script's own SQL casts to date / timestamp types. node-postgres
 * returns those as JS Date objects; JSON carries them as strings, so they are
 * rehydrated to match. Every other cast the generator scripts use (::float,
 * ::int, ::text) is JSON-native.
 */
export function dateColumns(sql) {
  const cols = { date: new Set(), timestamp: new Set() };
  const re = /::\s*(date|timestamptz|timestamp)\s+AS\s+([a-z_][a-z0-9_]*)/gi;
  for (const m of normalizeSql(sql).matchAll(re)) {
    (m[1].toLowerCase() === 'date' ? cols.date : cols.timestamp).add(m[2]);
  }
  return cols;
}

/** Mirror pg-types: DATE → local-midnight Date; TIMESTAMP(TZ) → Date. */
export function rehydrateRows(rows, sql) {
  const { date, timestamp } = dateColumns(sql);
  if (!date.size && !timestamp.size) return rows;
  return rows.map((r) => {
    const o = { ...r };
    for (const c of date) {
      if (typeof o[c] === 'string') {
        const [y, m, d] = o[c].slice(0, 10).split('-').map(Number);
        o[c] = new Date(y, m - 1, d);
      }
    }
    for (const c of timestamp) {
      if (typeof o[c] === 'string') o[c] = new Date(o[c]);
    }
    return o;
  });
}

/** Text as saved by the agent; tolerate a single trailing newline added by an editor. */
export function canonicalRowsText(fileText) {
  return fileText.endsWith('\n') ? fileText.slice(0, -1) : fileText;
}

/**
 * Verify saved rows against the server-side md5/length. Postgres length() counts
 * characters, so compare character length, not bytes.
 */
export function verifyRowsText(fileText, { md5: expectedMd5, len: expectedLen }) {
  const text = canonicalRowsText(fileText);
  const actualMd5 = md5(text);
  const actualLen = [...text].length;
  const ok = actualMd5 === expectedMd5 && (expectedLen == null || actualLen === Number(expectedLen));
  return { ok, actualMd5, actualLen, text };
}
