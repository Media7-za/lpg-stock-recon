#!/usr/bin/env node
/**
 * Record an operator ruling as an `approved` lock (PROPOSED — NOT RATIFIED,
 * PROPOSED_Projection_Matching_Locks.md P5). Appends to config/payment_pattern_overrides.json →
 * projectionLocks.locks; never edits or removes anything. Undo with
 * `close_period.mjs --debtor CODE --void-lock L0123 --reason "…"`.
 *
 *   node analysis/debtors/shared/scripts/approve_tie.mjs --debtor SA0001 --payment 45782 \
 *     --invoices 52813,52547 --treatment customer_credit --reason "…" [--dry-run]
 *   node analysis/debtors/shared/scripts/approve_tie.mjs --debtor SA0001 --payment 44740 \
 *     --treatment applied_to_bf --reason "…"
 *   node analysis/debtors/shared/scripts/approve_tie.mjs --debtor CODE --payment P1 \
 *     --invoices I2,I3 --treatment part_payment --partial I1 --reason "…"
 *   Several payments for one delivery, with its cylinder deposit invoice (BATCH_SUM rulings):
 *   node analysis/debtors/shared/scripts/approve_tie.mjs --debtor MOZ002 --payment 44227,45590 \
 *     --invoices 50528 --deposits 50529 --treatment exact --reason "…"
 *
 * Treatments (see locks.mjs planApproval): exact | customer_credit | applied_to_bf |
 * part_payment | short_paid. Re-run match_projection.mjs and render_open_items.mjs afterwards.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { matchAccount, readRegistry, registryPath, writeRegistry } from './match_account.mjs';
import { planApproval, applyApproval } from './locks.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const arg = (n) => {
  const i = process.argv.indexOf(n);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const code = String(arg('--debtor') || '').toUpperCase();
const payment = arg('--payment');
if (!code || !payment) {
  console.error('Usage: approve_tie.mjs --debtor CODE --payment DOC [--invoices A,B] [--treatment T] [--partial DOC] --reason TEXT [--dry-run] [--by NAME]');
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

const plan = planApproval({
  projection: run.projection,
  registry: reg.registry,
  payment: String(payment),
  invoices: (arg('--invoices') || '').split(',').map((s) => s.trim().replace(/^0+/, '')).filter(Boolean),
  deposits: (arg('--deposits') || '').split(',').map((s) => s.trim().replace(/^0+/, '')).filter(Boolean),
  treatment: arg('--treatment') || 'exact',
  partialDoc: arg('--partial') ? String(arg('--partial')).replace(/^0+/, '') : null,
  reason: arg('--reason'),
  approvedBy: arg('--by') || 'operator',
  session: process.env.CLAUDE_SESSION_URL || arg('--session') || 'unrecorded',
  now: new Date().toISOString(),
});
if (!plan.ok) {
  console.error(`[${code}] APPROVAL REFUSED:`);
  for (const r of plan.reasons) console.error(`  - ${r}`);
  process.exit(3);
}
const { lock } = plan;
console.log(
  `[${code}] ${dryRun ? 'DRY RUN — would record' : 'recorded'} ${lock.lock_id} (${lock.ruling.treatment}, net R${lock.ruling.net}): ` +
    lock.members.map((m) => `${m.entry_type} ${m.doc} ${m.lane} R${m.amount}`).join(' + '),
);
if (!dryRun) {
  writeRegistry(acct, applyApproval(reg.registry, plan));
  console.log(`Written ${path.relative(ROOT, registryPath(acct))} (projectionLocks). Re-run match_projection.mjs and render_open_items.mjs.`);
}
