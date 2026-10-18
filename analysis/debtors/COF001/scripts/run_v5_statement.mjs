#!/usr/bin/env node
/**
 * COF001 Statement of Account v5, produced by the shared generator
 * (analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs) with its two database queries
 * answered from data/db_snapshot_2026.json instead of a live pg connection (DATABASE_URL is not
 * available in cloud sessions). Re-run the shared generator directly when DATABASE_URL is set.
 *
 * Usage: node analysis/debtors/COF001/scripts/run_v5_statement.mjs [--suffix _Aug2026]
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, '../../../..');
const ACCT = path.join(ROOT, 'analysis/debtors/COF001');
const SUFFIX = process.argv.includes('--suffix') ? process.argv[process.argv.indexOf('--suffix') + 1] : '';
const REPORT = path.join(ACCT, `reports/COF001_Statement_Account_v5${SUFFIX}.md`);
const cfg = JSON.parse(fs.readFileSync(path.join(ACCT, `config/statement_v5${SUFFIX}.json`), 'utf8'));
const snapshotPath = path.join(ACCT, cfg.dbSnapshot || 'data/db_snapshot_2026.json');
const snap = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
const r2 = (n) => Math.round(n * 100) / 100;

function run(args, env = {}) {
  const res = spawnSync('node', args, { cwd: ROOT, env: { ...process.env, ...env }, encoding: 'utf8' });
  process.stdout.write(res.stdout || '');
  process.stderr.write(res.stderr || '');
  if (res.status !== 0) process.exit(res.status || 1);
}

// 1. Combine and chain-check the TXT extracts.
run([path.join(here, 'prepare_inputs.mjs')]);

// 2. Every invoice / credit note in the period must split into lanes that add up to its TXT amount.
const txt = fs.readFileSync(path.join(ROOT, cfg.txtPath), 'utf8');
const split = new Map();
for (const s of [...snap.split, ...snap.assumedDocs.split]) {
  const k = `${s.doc_no}|${s.entry_type}`;
  split.set(k, r2((split.get(k) || 0) + s.s));
}
const bad = [];
let checked = 0;
for (const line of txt.split('\n')) {
  const f = [...line.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
  if (f.length < 11 || !/^\d+$/.test(f[0]) || !f[4].includes('/')) continue;
  const [dd, mm, yyyy] = f[4].split('/');
  const iso = `${yyyy}-${mm}-${dd}`;
  if (iso < cfg.periodStart || (cfg.periodEnd && iso > cfg.periodEnd) || (f[3] !== 'Invoice' && f[3] !== 'Crd Note')) continue;
  checked += 1;
  const k = `${f[2].replace(/^0+/, '')}|${f[3]}`;
  if (!split.has(k)) bad.push(`${k}: no lane data`);
  else if (Math.abs(split.get(k) - Number(f[9])) > 0.011) bad.push(`${k}: lanes ${split.get(k)} vs TXT ${f[9]}`);
}
if (bad.length) {
  console.error(`Lane split does not tie to TXT:\n - ${bad.join('\n - ')}`);
  process.exit(1);
}
console.log(`Lane split ties to TXT for all ${checked} invoices and credit notes since ${cfg.periodStart}.`);

// 3. Shared generator, database queries answered from the snapshot.
run(
  [
    '--import',
    path.join(here, 'pg_snapshot_register.mjs'),
    'analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs',
    '--debtor',
    'COF001',
    ...(SUFFIX ? ['--suffix', SUFFIX] : []),
  ],
  { DATABASE_URL: 'snapshot://cof001', COF001_DB_SNAPSHOT: snapshotPath },
);

// 4. Internal review notes (stripped from customer exports with the INTERNAL_ONLY block).
// Items depend on which documents fall inside the statement window.
const inWindow = (iso) => iso >= cfg.periodStart && (!cfg.periodEnd || iso <= cfg.periodEnd);
const rentalDocs = [
  ...(inWindow('2025-03-18') ? ['41576 to 41579 (R250.00 each, Mar 2025)'] : []),
  ...(inWindow('2026-02-11') ? ['49204 (`SM CYL RENTAL`, R6,960.00, Feb 2026)'] : []),
];
const has15558 = inWindow('2026-08-26');
const items = [];
items.push(
  `**Lane rule.** Invoices and credit notes are routed by cylinder SKU lines (9.1, 14.1, 19.1, S.1, D.1): cylinder-only documents go to 1B, documents with none go to 1A, and mixed documents are split by line.${
    rentalDocs.length
      ? ` This differs from the database view's \`debt_group\` for rental-only lines: ${rentalDocs.join(' and ')} ${rentalDocs.length > 1 ? 'have' : 'has'} no cylinder SKU, so ${rentalDocs.length > 1 ? 'they sit' : 'it sits'} in 1A. Under the view's grouping ${rentalDocs.length > 1 ? 'they' : 'it'} would be in 1B. Please confirm.`
      : ''
  }`,
);
if (has15558) {
  items.push(
    '**Documents not yet in the database (lane ASSUMED).** The 2026-10-16 ERP extract adds 15803 (Crd Note -3,002.83), 15804 (Crd Note -15,697.50) and 53619 (Invoice +18,700.33). The database has no lines for them. 15803 and 15804 equal the gas and cylinder parts of 15558 exactly, so they are routed 1A and 1B. 53619 equals 15558 in total and is assumed to reverse it line for line (1A +3,002.83, 1B +15,697.50). If 53619 was wholly gas, 1A would be R15,697.50 higher and 1B R15,697.50 lower; the combined balance would not change. Replace with database lines once ingested.',
    '**Net effect of the 15558 correction.** 15558 (-18,700.33) is reversed by 53619 (+18,700.33) and re-issued as 15803 + 15804 (-18,700.33). The ERP closing balance is unchanged at R-16,256.52.',
    '**Custody (Part 2).** Quantities come from the database and have no lines for 53619 or 15804. If 53619 reverses 15558 and 15804 re-issues it, they cancel and the closing quantities are unchanged.',
  );
}
if (cfg.periodStart < '2026-01-01') {
  items.push(
    '**Late-posted documents.** Four payments dated 2023-2024 (24732, 30219, 29646, 29696; R31,131.01 in total) and a journal/payment pair dated 14 Nov and 11 Dec 2024 (44844, 476) appear in the current ERP extract after 2025 entries. Statements are built by document date, so they are included in the opening balance. The ERP balance shown at the time (for example R23,095.09 after payment 35877 on 30 Dec 2024) did not include them.',
  );
}
if (cfg.quarantineFile) {
  const q = JSON.parse(fs.readFileSync(path.join(ACCT, cfg.quarantineFile), 'utf8')).items;
  for (const i of q) {
    items.push(
      `**Quarantined ${i.entry_type.toLowerCase()} ${i.doc_no} (${i.date}, R${i.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}).** Quarantined by the operator on ${i.decidedOn}; reason not stated. ${i.findings?.length ? `Initial observation (partly superseded by the update below): ${i.observation}` : i.observation} ${i.treatment} ${i.notTreatedAs}${(i.findings || []).map((f) => ` **Update ${f.date} (${f.status}).** ${f.summary} Evidence: ${f.evidence.join(' ')} ${f.supersedes} Not checked: ${f.notChecked.join(' ')} ${f.implication}`).join('')} This statement is quarantine-adjusted${i.date < cfg.periodStart ? ' (the payment is dated before this period, so the opening 1A balance excludes it)' : ''}; a statement whose config does not set \`quarantineFile\` is not adjusted. Reopen when: ${i.reopenWhen.join(' ')}`,
    );
  }
}
if (cfg.erpClosingNote) items.push(`**Closing check.** ${cfg.erpClosingNote}`);
items.push(
  `**Database coverage.** All invoices and credit notes in the window were matched to the database by document and amount (see \`reports/COF001_DB_COVERAGE_2026-10-16.md\`).${inWindow('2026-05-05') ? ' Three documents in May 2026 are dated one day later in the database (14854, 50513, 50515).' : ''}`,
  `**Generator run.** The shared generator was run unchanged (except as noted) against \`${cfg.dbSnapshot || 'data/db_snapshot_2026.json'}\` (rows pulled from Supabase on 2026-10-16) because \`DATABASE_URL\` is not set in cloud sessions. Fixes made to the shared generator: the TXT header balance regex accepts a minus sign, so credit balances no longer read as NaN; an optional \`periodEnd\` limits the window and takes the closing check from the ERP running balance on the last row inside it.`,
  '**Not run.** `npm run debtors:ingest-check -- --debtor COF001` (needs `DATABASE_URL`).',
);
const notes = `<!-- INTERNAL_ONLY_START -->

## Review Notes (internal)

*Added by \`COF001/scripts/run_v5_statement.mjs\`; the tables above are shared-generator output.*

${items.map((t, i) => `${i + 1}. ${t}`).join('\n')}

`;
let md = fs.readFileSync(REPORT, 'utf8');
if (!md.includes('## Review Notes (internal)')) {
  md = md.replace('<!-- INTERNAL_ONLY_START -->\n', notes);
  fs.writeFileSync(REPORT, md);
}
console.log('Review notes added.');
