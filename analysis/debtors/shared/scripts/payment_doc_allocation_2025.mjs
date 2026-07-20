#!/usr/bin/env node
/** @deprecated Use payment_doc_allocation.mjs --from 2025-01-01 --to 2025-12-31 */
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const r = spawnSync(
  process.execPath,
  [path.join(dir, 'payment_doc_allocation.mjs'), '--debtor', 'WO0001', '--from', '2025-01-01', '--to', '2025-12-31'],
  { stdio: 'inherit' },
);
process.exit(r.status ?? 1);
