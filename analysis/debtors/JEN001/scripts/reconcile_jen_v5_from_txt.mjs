#!/usr/bin/env node
/** JEN001 wrapper — delegates to shared v5 generator. */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const shared = path.resolve(__dirname, '../../shared/scripts/reconcile_debtor_v5_from_txt.mjs');
const r = spawnSync(process.execPath, [shared, '--debtor', 'JEN001'], { stdio: 'inherit' });
process.exit(r.status ?? 1);
