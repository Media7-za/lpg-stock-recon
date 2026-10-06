#!/usr/bin/env node
/**
 * Render the open-items statement (internal + customer draft preview) for one account.
 *   node analysis/debtors/shared/scripts/render_open_items.mjs --debtor SA0001
 *
 * Reads  data/v5_projection.json + data/projection_matches.json (refuses if they were
 *        built from different TXT fingerprints or if the proof does not hold).
 * Writes reports/{CODE}_Open_Items_v5.md (internal) and
 *        reports/{CODE}_Open_Items_v5_Customer_PREVIEW.md (draft; not for release).
 * PROPOSED — NOT RATIFIED (PROPOSED_Projection_Matching_Locks.md, build step 3).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildOpenItems, renderOpenItemsMarkdown } from './open_items.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const i = process.argv.indexOf('--debtor');
const code = i >= 0 ? String(process.argv[i + 1] || '').toUpperCase() : '';
if (!code) {
  console.error('Usage: render_open_items.mjs --debtor CODE');
  process.exit(1);
}
const acct = path.join(ROOT, 'analysis/debtors', code);
const read = (p) => JSON.parse(fs.readFileSync(path.join(acct, p), 'utf8'));
const cfg = read('config/statement_v5.json');
const projection = read('data/v5_projection.json');
const matches = read('data/projection_matches.json');
const generatedOn = new Date().toISOString().slice(0, 10);

for (const view of ['internal', 'customer']) {
  const model = buildOpenItems(projection, matches, view);
  if (!model.proof.holds) {
    console.error(`[${code}] REFUSED (${view}): open items rebuild R${model.proof.combined} ≠ projection closing R${model.proof.projectionClosing}`);
    process.exit(2);
  }
  const md = renderOpenItemsMarkdown(model, { cfg, projection, matches, generatedOn });
  const name = view === 'internal' ? `${code}_Open_Items_v5.md` : `${code}_Open_Items_v5_Customer_PREVIEW.md`;
  fs.writeFileSync(path.join(acct, 'reports', name), md);
  const n = model.parts.lpg.lines.length + model.parts.cyl.lines.length;
  console.log(
    `[${code}] ${view}: ${n} open rows; balance R${model.proof.combined} (ERP R${model.proof.erp}, ${model.proof.tiesToErp ? 'ties' : 'DOES NOT TIE'}) → reports/${name}`,
  );
}
