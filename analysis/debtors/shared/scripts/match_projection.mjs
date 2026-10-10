#!/usr/bin/env node
/**
 * Run the shared projection matcher for one account.
 *   node analysis/debtors/shared/scripts/match_projection.mjs --debtor SA0001
 *
 * Reads  analysis/debtors/{CODE}/data/v5_projection.json (refuses if stale vs the TXT
 *        named in config/statement_v5.json, or if it fails its own checks).
 * Writes analysis/debtors/{CODE}/data/projection_matches.json — a NEW file. It never
 *        touches an account's existing allocation_edges.csv.
 *
 * Split gate (proposal P6): matching always runs, but when the projection does not tie
 * to the ERP header or ingest is not complete, the output is marked reviewOnly.
 * matcher v5 RATIFIED 2026-10-10 (PROPOSED_Projection_Matching_Locks.md); probable ties stay proposals until approved.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchAccount } from './match_account.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const i = process.argv.indexOf('--debtor');
const code = i >= 0 ? String(process.argv[i + 1] || '').toUpperCase() : '';
if (!code) {
  console.error('Usage: match_projection.mjs --debtor CODE');
  process.exit(1);
}
const run = matchAccount(ROOT, code);
if (!run.ok) {
  console.error(`[${code}] REFUSED: ${run.reasons.join('; ')}`);
  process.exit(2);
}
const { acct, projection, evidence, reg, result, reviewOnlyReasons } = run;
const projPath = path.join(acct, 'data/v5_projection.json');
if (evidence) {
  fs.writeFileSync(path.join(acct, 'data/remittance_evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`);
}
const out = {
  status: 'matcher v5 RATIFIED 2026-10-10 (PROPOSED_Projection_Matching_Locks.md); probable ties stay proposals until approved',
  debtorCode: code,
  generatedBy: 'match_projection.mjs',
  generatedAt: new Date().toISOString(),
  projection: {
    path: path.relative(ROOT, projPath),
    txtSha256: projection.source.txtSha256,
    dbChannel: projection.source.dbChannel,
    generatedAt: projection.generatedAt,
  },
  reviewOnly: reviewOnlyReasons.length > 0,
  reviewOnlyReasons,
  locksRegistry: reg.supported ? (reg.exists ? 'config/payment_pattern_overrides.json#projectionLocks' : 'none yet') : reg.note,
  ...result,
};
const outPath = path.join(acct, 'data/projection_matches.json');
fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);

const s = result.summary;
const r = result.residual;
console.log(`[${code}] ties ${s.ties} (confirmed ${s.confirmed}, probable ${s.probable}) ${JSON.stringify(s.byRule)}`);
console.log(`[${code}] payments ${s.paymentsTotal}, unallocated ${s.paymentsUnallocated}`);
if (result.remittance) {
  const rm = result.remittance;
  console.log(`[${code}] remittance: ${rm.batches} batches, ${rm.applied.length} applied, ${rm.unresolved.length} unresolved, ${rm.skippedSources.length} sources skipped`);
  for (const u of rm.unresolved) console.log(`  - ${u.batchId} (pay ${u.paymentDoc}): ${u.reason}`);
  for (const k of rm.skippedSources) console.log(`  - skipped ${k.batchId || k.file}: ${k.reason}`);
}
console.log(
  `[${code}] residual: B/F R${r.openingBfUnitemised} + open LPG/OTHER R${r.openInvoicesLpgOther.amount} (${r.openInvoicesLpgOther.count})` +
    ` + open CYL R${r.openInvoicesCyl.amount} (${r.openInvoicesCyl.count}) + unmatched CN R${r.unmatchedCredits.amount} (${r.unmatchedCredits.count})` +
    ` + unallocated pay R${r.unallocatedPayments.amount} (${r.unallocatedPayments.count}) + tie nets R${r.tieNets}`,
);
console.log(
  `[${code}] proof: rebuilt R${result.proof.rebuiltClosing} vs closing R${result.proof.projectionClosing} (ERP R${result.proof.erpCurrentBalance}) → ${result.proof.holds ? 'HOLDS' : 'FAILS'}`,
);
console.log(`[${code}] locks: closedThrough ${result.closedThrough ?? '—'}, applied ${result.locksApplied}, conflicts ${result.lockConflicts.length}`);
for (const c of result.lockConflicts) console.log(`  - CONFLICT ${c.lock_id}: ${c.problems.join('; ')}`);
console.log(`[${code}] reviewOnly: ${out.reviewOnly}${out.reviewOnly ? ` (${reviewOnlyReasons.join('; ')})` : ''}`);
console.log(`Written ${path.relative(ROOT, outPath)}`);
