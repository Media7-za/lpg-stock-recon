/**
 * Shared "match one account" runner used by match_projection.mjs and close_period.mjs,
 * so a period close always locks exactly what the matcher would produce right now.
 * PROPOSED — NOT RATIFIED (PROPOSED_Projection_Matching_Locks.md).
 */
import fs from 'fs';
import path from 'path';
import { fileFingerprint, verifyProjection } from './v5_projection.mjs';
import { matchProjection } from './projection_matcher.mjs';
import { buildRemittanceEvidence } from './remittance_evidence.mjs';
import { effectiveLocks } from './locks.mjs';

export function registryPath(acct) {
  return path.join(acct, 'config/payment_pattern_overrides.json');
}

/** Returns { registry, supported, note }. A flat-array registry (WO0001 style) cannot carry locks. */
export function readRegistry(acct, code) {
  const p = registryPath(acct);
  if (!fs.existsSync(p)) {
    return { registry: { debtor: code, registry_version: 1, overrides: [] }, supported: true, exists: false };
  }
  const registry = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (Array.isArray(registry)) {
    return { registry: null, supported: false, exists: true, note: 'payment_pattern_overrides.json is a flat array (legacy schema); locks unsupported until migrated' };
  }
  return { registry, supported: true, exists: true };
}

/**
 * Write the registry, changing only its `projectionLocks` key. Everything else in the file is
 * operator-recorded judgement and keeps its original text and formatting byte for byte; the
 * locks block is (re)written as the file's last key. Falls back to a full rewrite only if the
 * spliced text would not parse back to exactly the intended registry.
 */
export function writeRegistry(acct, registry) {
  const p = registryPath(acct);
  const full = `${JSON.stringify(registry, null, 2)}\n`;
  if (!fs.existsSync(p)) return fs.writeFileSync(p, full);
  const orig = fs.readFileSync(p, 'utf8');
  const block = JSON.stringify(registry.projectionLocks, null, 2).replace(/\n/g, '\n  ');
  const at = orig.lastIndexOf('\n  "projectionLocks":');
  let text;
  if (at >= 0) {
    text = `${orig.slice(0, at)}\n  "projectionLocks": ${block}\n}\n`;
  } else {
    const end = orig.lastIndexOf('}');
    text = `${orig.slice(0, end).replace(/\s*$/, '')},\n  "projectionLocks": ${block}\n}\n`;
  }
  let same = false;
  try {
    same = JSON.stringify(JSON.parse(text)) === JSON.stringify(registry);
  } catch {
    same = false;
  }
  fs.writeFileSync(p, same ? text : full);
}

export function matchAccount(root, code) {
  const acct = path.join(root, 'analysis/debtors', code);
  const read = (p) => JSON.parse(fs.readFileSync(path.join(acct, p), 'utf8'));
  const cfg = read('config/statement_v5.json');
  const projection = read('data/v5_projection.json');
  const txtPath = path.isAbsolute(cfg.txtPath) ? cfg.txtPath : path.join(root, cfg.txtPath);
  const v = verifyProjection(projection, { txtFingerprint: fileFingerprint(txtPath) });
  if (!v.ok) return { ok: false, reasons: v.reasons };

  const evidence = buildRemittanceEvidence(acct);
  const hasEvidence = evidence.batches.length > 0 || evidence.skipped.length > 0;
  const reg = readRegistry(acct, code);
  const locks = reg.supported ? effectiveLocks(reg.registry) : null;
  const result = matchProjection(projection, undefined, hasEvidence ? evidence : null, locks);

  const reviewOnlyReasons = [];
  if (!projection.checks.tiesToErpHeader) reviewOnlyReasons.push(`ERP variance R${projection.closings.erpVariance}`);
  if (projection.ingestGate?.ingestCoverage !== 'complete') {
    reviewOnlyReasons.push(`ingestCoverage ${projection.ingestGate?.ingestCoverage ?? 'unknown'}`);
  }
  if (!result.proof.holds) reviewOnlyReasons.push('residual proof does not hold');
  if (result.lockConflicts.length) reviewOnlyReasons.push(`${result.lockConflicts.length} lock conflict(s)`);

  return { ok: true, acct, cfg, projection, evidence: hasEvidence ? evidence : null, reg, result, reviewOnlyReasons };
}

/** Earliest TXT document date the latest ingest coverage report flags as a gap (partial-close guard). */
export function earliestIngestGap(acct, code) {
  const dir = path.join(acct, 'reports');
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => new RegExp(`^${code}_INGEST_COVERAGE_\\d{4}-\\d{2}-\\d{2}\\.json$`).test(f)).sort();
  if (!files.length) return null;
  const cov = JSON.parse(fs.readFileSync(path.join(dir, files.at(-1)), 'utf8'));
  const healthy = new Set(['HEALTHY', 'EXPECTED_HEADER_ONLY', 'RATIFIED_EXCEPTION']);
  const gaps = (cov.documents || []).filter((d) => d.in_txt && !healthy.has(d.classification)).map((d) => d.tx_date).sort();
  return gaps[0] || null;
}
