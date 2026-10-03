#!/usr/bin/env node
/**
 * Scaffold a new debtor micro-project: directories + a schema-valid project.json.
 *
 * Usage: node analysis/debtors/shared/scripts/scaffold.mjs --code <CODE> --name "<CLIENT NAME>"
 *
 * Deliberately does NOT create config/*.json. Those files hold recorded operator
 * judgement (AGENTS.md §5) and each has a lane-specific shape; stubbing them here
 * would invent decisions. Create them from the owning lane skill when needed.
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const DEBTORS_ROOT = path.join(ROOT, 'analysis/debtors');
const SUBDIRS = ['config', 'data', 'raw', 'docs', 'reports'];

export function validateInput(code, clientName, debtorsRoot = DEBTORS_ROOT) {
  const errors = [];
  if (!/^[A-Z0-9]{3,6}$/.test(code ?? '')) {
    errors.push(`Debtor code "${code}" is invalid: must be 3-6 uppercase alphanumerics (e.g. EMB001)`);
  } else if (fs.existsSync(path.join(debtorsRoot, code))) {
    errors.push(`Account directory already exists: analysis/debtors/${code}`);
  }
  if (!clientName || !clientName.trim()) errors.push('Client name is required');
  return errors;
}

export function buildProject(code, clientName, today = new Date().toISOString().slice(0, 10)) {
  return {
    debtorCode: code,
    clientName,
    status: 'active',
    reconState: 'pending',
    financials: { totalOutstanding: 0, lastInvoiceDate: null, lastPaymentDate: null, agedDebt180Plus: 0 },
    collections: {
      actionRequired: false,
      actionType: null,
      dateSent: null,
      deadlineDate: null,
      nextAction: 'Obtain DEBENQ TXT from finance into raw/ (ERP freshness gate)',
      nextActionDate: null,
      notes: 'Scaffolded - no ERP evidence ingested yet',
      blockers: [],
    },
    history: [{ date: today, event: 'Initialized micro-project scaffolding (scaffold.mjs)' }],
  };
}

function main() {
  const args = process.argv.slice(2);
  const arg = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined);
  const code = arg('--code');
  const clientName = arg('--name');
  if (!code || !clientName) {
    console.error('Usage: node scaffold.mjs --code <CODE> --name "<CLIENT NAME>"');
    process.exit(2);
  }
  const errors = validateInput(code, clientName);
  if (errors.length) {
    errors.forEach((e) => console.error(`ERROR: ${e}`));
    process.exit(1);
  }

  const base = path.join(DEBTORS_ROOT, code);
  SUBDIRS.forEach((d) => fs.mkdirSync(path.join(base, d), { recursive: true }));
  fs.writeFileSync(path.join(base, 'project.json'), JSON.stringify(buildProject(code, clientName), null, 2) + '\n');
  console.log(`Scaffolded ${code} (${clientName}) at analysis/debtors/${code}/`);

  // Sync validates the whole portfolio; judge only this account's line.
  const sync = spawnSync('npm', ['run', '--silent', 'debtors:sync'], { cwd: ROOT, encoding: 'utf8' });
  const mine = (sync.stdout ?? '').split('\n').find((l) => new RegExp(`^\\[(PASS|WARN|FAIL)\\] ${code}$`).test(l));
  console.log(`debtors:sync -> ${mine ?? '(account not reported)'}`);
  console.log('Next: place DEBENQ TXT in raw/, then npm run debtors:ingest-check -- --debtor ' + code);
  process.exit(mine?.startsWith('[FAIL]') || !mine ? 1 : 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
