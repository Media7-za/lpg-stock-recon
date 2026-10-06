/**
 * Drop-in stand-in for the `pg` module during connector replay (see replay_core.mjs).
 * Loaded only via `node --import ./analysis/debtors/shared/scripts/db_replay/register.mjs`.
 * The generator scripts themselves are not modified.
 *
 * Env:
 *   DB_REPLAY_DIR  directory holding <key>.capture.json + <key>.rows.json (required)
 */
import fs from 'fs';
import path from 'path';
import { buildCaptureSql, queryKey, rehydrateRows, verifyRowsText, REPLAY_CHANNEL } from './replay_core.mjs';

const dir = process.env.DB_REPLAY_DIR;

class ReplayMissingCapture extends Error {}

class Client {
  constructor() {
    if (!dir) throw new Error('DB_REPLAY_DIR is required for connector replay');
    fs.mkdirSync(dir, { recursive: true });
  }

  async connect() {
    console.error(`[db-replay] channel=${REPLAY_CHANNEL} dir=${dir}`);
  }

  async end() {}

  async query(sql, params = []) {
    const key = queryKey(sql, params);
    const capPath = path.join(dir, `${key}.capture.json`);
    const rowsPath = path.join(dir, `${key}.rows.json`);
    if (!fs.existsSync(capPath)) {
      const pendingPath = path.join(dir, `${key}.pending.json`);
      fs.writeFileSync(
        pendingPath,
        `${JSON.stringify({ key, sql, params, captureSql: buildCaptureSql(sql, params) }, null, 2)}\n`,
      );
      const err = new ReplayMissingCapture(
        `[db-replay] REPLAY_MISSING_CAPTURE key=${key}\n` +
          `  Run the captureSql in ${pendingPath} through the Supabase connector,\n` +
          `  save rows_json verbatim to ${rowsPath}, then:\n` +
          `  node analysis/debtors/shared/scripts/db_replay/record_capture.mjs --dir ${dir} --key ${key} --md5 <md5> --len <len> --project <project_id>`,
      );
      // Surface clearly even if the calling script swallows the error (e.g. try/catch around optional queries).
      console.error(err.message);
      process.exitCode = 3;
      throw err;
    }
    const cap = JSON.parse(fs.readFileSync(capPath, 'utf8'));
    const v = verifyRowsText(fs.readFileSync(rowsPath, 'utf8'), cap);
    if (!v.ok) {
      throw new Error(
        `[db-replay] md5/length mismatch for ${key}: expected ${cap.md5}/${cap.len}, got ${v.actualMd5}/${v.actualLen}`,
      );
    }
    const rows = rehydrateRows(JSON.parse(v.text), sql);
    return { rows, rowCount: rows.length };
  }
}

export default { Client };
export { Client };
