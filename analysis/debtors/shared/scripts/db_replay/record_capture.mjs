#!/usr/bin/env node
/**
 * Record a connector capture after verifying it (see replay_core.mjs).
 *   node analysis/debtors/shared/scripts/db_replay/record_capture.mjs \
 *     --dir <DB_REPLAY_DIR> --key <key> --md5 <md5 from connector> --len <len from connector> --project <supabase project id>
 * Refuses (exit 1) unless md5 and length of <key>.rows.json equal the server's values.
 */
import fs from 'fs';
import path from 'path';
import { verifyRowsText, REPLAY_CHANNEL } from './replay_core.mjs';

const arg = (n) => {
  const i = process.argv.indexOf(n);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const dir = arg('--dir');
const key = arg('--key');
const expMd5 = arg('--md5');
const expLen = arg('--len');
const project = arg('--project');
if (!dir || !key || !expMd5 || !expLen || !project) {
  console.error('Usage: record_capture.mjs --dir DIR --key KEY --md5 MD5 --len LEN --project PROJECT_ID');
  process.exit(1);
}
const pendingPath = path.join(dir, `${key}.pending.json`);
const rowsPath = path.join(dir, `${key}.rows.json`);
if (!fs.existsSync(pendingPath)) {
  console.error(`No pending query ${pendingPath}`);
  process.exit(1);
}
if (!fs.existsSync(rowsPath)) {
  console.error(`No rows file ${rowsPath}`);
  process.exit(1);
}
const pending = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));
const v = verifyRowsText(fs.readFileSync(rowsPath, 'utf8'), { md5: expMd5, len: expLen });
if (!v.ok) {
  console.error(
    `REFUSED: rows file does not match the server. expected md5=${expMd5} len=${expLen}; got md5=${v.actualMd5} len=${v.actualLen}.\n` +
      'Re-copy rows_json exactly (it is a JSON string value: unescape it once, do not reformat).',
  );
  process.exit(1);
}
let rowCount;
try {
  rowCount = JSON.parse(v.text).length;
} catch (e) {
  console.error(`REFUSED: rows file is not valid JSON: ${e.message}`);
  process.exit(1);
}
const capture = {
  key,
  channel: REPLAY_CHANNEL,
  supabaseProject: project,
  capturedAt: new Date().toISOString(),
  md5: expMd5,
  len: Number(expLen),
  rowCount,
  sql: pending.sql,
  params: pending.params,
  captureSql: pending.captureSql,
};
fs.writeFileSync(path.join(dir, `${key}.capture.json`), `${JSON.stringify(capture, null, 2)}\n`);
fs.unlinkSync(pendingPath);
console.log(`Recorded ${key}: ${rowCount} rows, md5 ${expMd5} verified.`);
