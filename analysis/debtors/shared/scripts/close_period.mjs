#!/usr/bin/env node
/**
 * Period close / void for one account (P5–P6, ratified 2026-10-10).
 *
 *   node analysis/debtors/shared/scripts/close_period.mjs --debtor SA0001 --through 2026-06-30 [--dry-run]
 *   node analysis/debtors/shared/scripts/close_period.mjs --debtor SA0001 --void-close C0001 --reason "…"
 *   node analysis/debtors/shared/scripts/close_period.mjs --debtor SA0001 --void-lock L0007 --reason "…"
 *
 * Close: re-runs the matcher exactly as match_projection.mjs does, applies the split gate
 * (locks.mjs planClose), and appends a close plus one auto_locked lock per CONFIRMED tie
 * dated on/before --through to config/payment_pattern_overrides.json → projectionLocks.
 * Operator ruling (2026-10-04): the agent may close periods and auto-lock confirmed ties.
 * Probable ties are never locked. Void: appends a void record (append-only, never edits).
 */
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import { matchAccount, readRegistry, registryPath, writeRegistry, earliestIngestGap } from './match_account.mjs';
import { planClose, applyClose, applyVoid } from './locks.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const arg = (n) => {
  const i = process.argv.indexOf(n);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const code = String(arg('--debtor') || '').toUpperCase();
const through = arg('--through');
const voidClose = arg('--void-close');
const voidLock = arg('--void-lock');
const voidSettled = arg('--void-settled');
const reason = arg('--reason');
const dryRun = process.argv.includes('--dry-run');
const closedBy = arg('--by') || 'agent';
const session = process.env.CLAUDE_SESSION_URL || arg('--session') || 'unrecorded';
if (!code || (!through && !voidClose && !voidLock && !voidSettled)) {
  console.error('Usage: close_period.mjs --debtor CODE (--through YYYY-MM-DD [--dry-run] | --void-close ID | --void-lock ID | --void-settled ID) [--reason TEXT]');
  process.exit(1);
}
const acct = path.join(ROOT, 'analysis/debtors', code);
const reg = readRegistry(acct, code);
if (!reg.supported) {
  console.error(`[${code}] REFUSED: ${reg.note}`);
  process.exit(2);
}
const now = new Date().toISOString();
const write = (registry) => {
  if (dryRun) return;
  writeRegistry(acct, registry);
};

if (voidClose || voidLock || voidSettled) {
  if (!reason) {
    console.error('A --reason is required to void.');
    process.exit(1);
  }
  const next = applyVoid(reg.registry, { target: voidClose ? 'close' : voidSettled ? 'settled' : 'lock', id: voidClose || voidLock || voidSettled, voidedBy: closedBy, reason, now });
  write(next);
  console.log(`[${code}] voided ${voidClose ? 'close' : voidSettled ? 'settled-through record' : 'lock'} ${voidClose || voidLock || voidSettled}${dryRun ? ' (dry run)' : ''}`);
  process.exit(0);
}

const run = matchAccount(ROOT, code);
if (!run.ok) {
  console.error(`[${code}] REFUSED: ${run.reasons.join('; ')}`);
  process.exit(2);
}

// Tag-check gate (business_rules.md §15). Only BLOCKED stops an internal close.
let tagGate = null;
try {
  const out = execFileSync(
    process.execPath,
    [path.join(ROOT, 'analysis/debtors/shared/scripts/check_invoice_tag_coverage.mjs'), '--debtor', code, '--txt', run.cfg.txtPath, '--json'],
    { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
  );
  tagGate = JSON.parse(out).gate ?? null;
} catch (e) {
  try {
    tagGate = JSON.parse(e.stdout || '').gate ?? 'UNKNOWN';
  } catch {
    tagGate = 'UNKNOWN';
  }
}

const plan = planClose({
  projection: run.projection,
  matches: run.result,
  registry: reg.registry,
  through,
  ingestGapEarliest: earliestIngestGap(acct, code),
  tagGate,
  closedBy,
  session,
  now,
});
if (!plan.ok) {
  console.error(`[${code}] CLOSE REFUSED through ${through}:`);
  for (const r of plan.reasons) console.error(`  - ${r}`);
  process.exit(3);
}
write(applyClose(reg.registry, plan));
const byRule = {};
for (const l of plan.newLocks) byRule[l.rule] = (byRule[l.rule] || 0) + 1;
console.log(
  `[${code}] ${dryRun ? 'DRY RUN — would close' : 'closed'} ${plan.close.close_id} through ${through}: ${plan.newLocks.length} locks ${JSON.stringify(byRule)}, value R${plan.close.value}; tag gate ${tagGate}; ${plan.close.probableLeftOpen} probable ties left unlocked`,
);
if (!dryRun) console.log(`Written ${path.relative(ROOT, registryPath(acct))} (projectionLocks). Re-run match_projection.mjs and render_open_items.mjs.`);
