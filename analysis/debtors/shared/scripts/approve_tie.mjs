#!/usr/bin/env node
/**
 * Record an operator ruling as an `approved` lock (ratified 2026-10-10,
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
 *   Journals that belong to the settlement (e.g. a batch's discount journal), against the opening B/F:
 *   node analysis/debtors/shared/scripts/approve_tie.mjs --debtor TWK002 --payment 37770 --journals 508 \
 *     --treatment applied_to_bf --reason "…"
 *   A credit note paired with an invoice the matcher did not choose (operator pairing, no payment):
 *   node analysis/debtors/shared/scripts/approve_tie.mjs --debtor TAN002 --credit-notes 14472 --invoices 49361 --reason "…"
 *   Approve probable ties the matcher found, by id (operator: "approve all"); prints each tie's documents:
 *   node analysis/debtors/shared/scripts/approve_tie.mjs --debtor TWK002 --ties T0011,T0012 --reason "…"
 *   (--max-net 1.00 also accepts a rounding net up to R1.00, the matcher's near-sum tolerance; recorded as roundingAccepted)
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
import { planApproval, applyApproval, planApproveTies, applyApprovals } from './locks.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const arg = (n) => {
  const i = process.argv.indexOf(n);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const code = String(arg('--debtor') || '').toUpperCase();
const payment = arg('--payment');
const tieIds = (arg('--ties') || '').split(',').map((s) => s.trim()).filter(Boolean);
const creditNotes = (arg('--credit-notes') || '').split(',').map((s) => s.trim().replace(/^0+/, '')).filter(Boolean);
if (!code || (!payment && !tieIds.length && !creditNotes.length)) {
  console.error('Usage: approve_tie.mjs --debtor CODE (--payment DOC [--invoices A,B] [--deposits N] [--journals N] [--credit-notes N] [--treatment T] [--partial DOC] | --credit-notes N --invoices A | --ties T0001,T0002 [--max-net 1.00]) --reason TEXT [--dry-run] [--by NAME]');
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

if (tieIds.length) {
  const tplan = planApproveTies({
    projection: run.projection,
    matches: { ties: run.result.ties },
    registry: reg.registry,
    tieIds,
    maxNet: arg('--max-net') ? Number(arg('--max-net')) : 0.05,
    reason: arg('--reason'),
    approvedBy: arg('--by') || 'operator',
    session: process.env.CLAUDE_SESSION_URL || arg('--session') || 'unrecorded',
    now: new Date().toISOString(),
  });
  if (!tplan.ok) {
    console.error(`[${code}] APPROVAL REFUSED:`);
    for (const r of tplan.reasons) console.error(`  - ${r}`);
    process.exit(3);
  }
  for (const l of tplan.locks) {
    console.log(`[${code}] ${dryRun ? 'DRY RUN — would record' : 'will record'} ${l.lock_id} (exact, net R${l.ruling.net}) = ${l.ruling.approvedTie.tie_id} ${l.ruling.approvedTie.rule}: ${l.ruling.approvedTie.docs.join(' + ')}`);
  }
  if (!dryRun) {
    writeRegistry(acct, applyApprovals(reg.registry, tplan));
    console.log(`Written ${path.relative(ROOT, registryPath(acct))} (projectionLocks). Re-run match_projection.mjs and render_open_items.mjs.`);
  }
  process.exit(0);
}

const plan = planApproval({
  projection: run.projection,
  registry: reg.registry,
  payment: payment || '',
  invoices: (arg('--invoices') || '').split(',').map((s) => s.trim().replace(/^0+/, '')).filter(Boolean),
  creditNotes,
  journals: (arg('--journals') || '').split(',').map((s) => s.trim().replace(/^0+/, '')).filter(Boolean),
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
