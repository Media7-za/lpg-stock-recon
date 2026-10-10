#!/usr/bin/env node
/**
 * Record a 'settled through' operator ruling (ADM-92, 2026-10-09; ratified 2026-10-10).
 * Everything dated on/before --through is settled in aggregate: the ERP balance returns to R0.00
 * there, so the payments up to it each paid a statement balance (gas, cylinders, credit notes).
 * Appends one record to config/payment_pattern_overrides.json → projectionLocks.settledThrough;
 * never edits or removes anything. Undo: close_period.mjs --debtor CODE --void-settled S0001 --reason "…".
 *
 *   node analysis/debtors/shared/scripts/settle_through.mjs --debtor JEN001 --through 2026-03-31 \
 *     --anchor-line 131 --include-payments 43927 --reason "…" [--dry-run] [--by operator]
 *   --include-payments: payments dated after --through that pay the last statement in the range.
 *
 * Refuses unless opening B/F + the covered rows = R0.00 (±R0.05), --anchor-line is the last covered
 * TXT line, and no covered row is already locked. Re-run match_projection.mjs and render_open_items.mjs after.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { matchAccount, readRegistry, registryPath, writeRegistry } from './match_account.mjs';
import { planSettledThrough, applySettledThrough } from './locks.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const arg = (n) => {
  const i = process.argv.indexOf(n);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const code = String(arg('--debtor') || '').toUpperCase();
const through = arg('--through');
if (!code || !through) {
  console.error('Usage: settle_through.mjs --debtor CODE --through YYYY-MM-DD [--anchor-line N] --reason TEXT [--dry-run] [--by NAME]');
  process.exit(1);
}
const dryRun = process.argv.includes('--dry-run');
const acct = path.join(ROOT, 'analysis/debtors', code);
const reg = readRegistry(acct, code);
if (!reg.supported) {
  console.error(`[${code}] REFUSED: ${reg.note}`);
  process.exit(2);
}
const run = matchAccount(ROOT, code); // verifies the projection against the current TXT first
if (!run.ok) {
  console.error(`[${code}] REFUSED: ${run.reasons.join('; ')}`);
  process.exit(2);
}
const plan = planSettledThrough({
  projection: run.projection,
  registry: reg.registry,
  through,
  anchorLine: arg('--anchor-line'),
  includePayments: (arg('--include-payments') || '').split(',').map((s) => s.trim()).filter(Boolean),
  reason: arg('--reason'),
  approvedBy: arg('--by') || 'operator',
  session: process.env.CLAUDE_SESSION_URL || arg('--session') || 'unrecorded',
  now: new Date().toISOString(),
});
if (!plan.ok) {
  console.error(`[${code}] SETTLED-THROUGH REFUSED:`);
  for (const r of plan.reasons) console.error(`  - ${r}`);
  process.exit(3);
}
const { record } = plan;
console.log(
  `[${code}] ${dryRun ? 'DRY RUN — would record' : 'recorded'} ${record.record_id}: settled through ${record.through} ` +
    `(${record.memberCount} rows, TXT line ${record.anchor.txt_line}, B/F R${record.openingBf} + rows R${record.rowsNet} = R${record.closing})`,
);
if (!dryRun) {
  writeRegistry(acct, applySettledThrough(reg.registry, plan));
  console.log(`Written ${path.relative(ROOT, registryPath(acct))} (projectionLocks). Re-run match_projection.mjs and render_open_items.mjs.`);
}
