#!/usr/bin/env node
/** JEN001 wrapper — delegates to shared v5 generator. Forwards --config when supplied. */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shared = path.resolve(__dirname, '../../shared/scripts/reconcile_debtor_v5_from_txt.mjs');
const args = [shared, '--debtor', 'JEN001'];
const configIdx = process.argv.indexOf('--config');
if (configIdx !== -1 && process.argv[configIdx + 1]) {
  args.push('--config', process.argv[configIdx + 1]);
}
const r = spawnSync(process.execPath, args, { stdio: 'inherit' });
process.exit(r.status ?? 1);
