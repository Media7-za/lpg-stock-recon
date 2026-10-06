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
 * PROPOSED — NOT RATIFIED (PROPOSED_Projection_Matching_Locks.md, build step 2).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fileFingerprint, verifyProjection } from './v5_projection.mjs';
import { matchProjection } from './projection_matcher.mjs';
import { buildRemittanceEvidence } from './remittance_evidence.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const i = process.argv.indexOf('--debtor');
const code = i >= 0 ? String(process.argv[i + 1] || '').toUpperCase() : '';
if (!code) {
  console.error('Usage: match_projection.mjs --debtor CODE');
  process.exit(1);
}
const acct = path.join(ROOT, 'analysis/debtors', code);
const projPath = path.join(acct, 'data/v5_projection.json');
const cfg = JSON.parse(fs.readFileSync(path.join(acct, 'config/statement_v5.json'), 'utf8'));
const projection = JSON.parse(fs.readFileSync(projPath, 'utf8'));
const txtPath = path.isAbsolute(cfg.txtPath) ? cfg.txtPath : path.join(ROOT, cfg.txtPath);

const v = verifyProjection(projection, { txtFingerprint: fileFingerprint(txtPath) });
if (!v.ok) {
  console.error(`[${code}] REFUSED: ${v.reasons.join('; ')}`);
  process.exit(2);
}

// P11: remittance evidence, when the account has remittance manifests.
const evidence = buildRemittanceEvidence(acct);
const hasEvidence = evidence.batches.length > 0 || evidence.skipped.length > 0;
if (hasEvidence) {
  fs.writeFileSync(path.join(acct, 'data/remittance_evidence.json'), `${JSON.stringify(evidence, null, 2)}\n`);
}
const result = matchProjection(projection, undefined, hasEvidence ? evidence : null);
const reviewOnlyReasons = [];
if (!projection.checks.tiesToErpHeader) reviewOnlyReasons.push(`ERP variance R${projection.closings.erpVariance}`);
if (projection.ingestGate?.ingestCoverage !== 'complete') {
  reviewOnlyReasons.push(`ingestCoverage ${projection.ingestGate?.ingestCoverage ?? 'unknown'}`);
}
if (!result.proof.holds) reviewOnlyReasons.push('residual proof does not hold');

const out = {
  status: 'PROPOSED — NOT RATIFIED (PROPOSED_Projection_Matching_Locks.md, build step 2)',
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
  locksApplied: 0, // P5 locks not implemented yet
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
console.log(`[${code}] reviewOnly: ${out.reviewOnly}${out.reviewOnly ? ` (${reviewOnlyReasons.join('; ')})` : ''}`);
console.log(`Written ${path.relative(ROOT, outPath)}`);
