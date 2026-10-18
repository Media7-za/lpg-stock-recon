/**
 * Offline stand-in for `pg`, used ONLY by run_v5_statement.mjs.
 * Answers the two queries issued by reconcile_debtor_v5_from_txt.mjs from
 * analysis/debtors/COF001/data/db_snapshot_2026.json (rows pulled from Supabase).
 */
import fs from 'fs';

const snap = JSON.parse(fs.readFileSync(process.env.COF001_DB_SNAPSHOT, 'utf8'));

class Client {
  async connect() {}
  async end() {}
  async query(sql, params = []) {
    const [from, account] = params;
    if (account !== 'COF001') throw new Error(`snapshot only holds COF001, got ${account}`);
    const validFrom = snap.validFrom || '2026-01-01';
    if (from < validFrom) throw new Error(`snapshot starts ${validFrom}, requested ${from}`);
    if (sql.includes("debt_group = 'CYL'") && sql.includes('SELECT tx_date')) {
      return { rows: snap.cylQty.filter((r) => r.tx_date >= from) };
    }
    if (sql.includes('GROUP BY doc_no, entry_type, debt_group')) {
      return { rows: [...snap.split, ...snap.assumedDocs.split] };
    }
    throw new Error(`unrecognised query: ${sql.slice(0, 80)}`);
  }
}

export default { Client };
