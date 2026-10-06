/**
 * v5 projection dataset — the persisted, filtered row set the v5 statement is
 * built from, written so matching can run on top of it instead of re-parsing
 * raw TXT / DB per account.
 *
 * Status: build step 1 of analysis/debtors/shared/docs/PROPOSED_Projection_Matching_Locks.md
 * (PROPOSED — NOT RATIFIED). P2: rows are per document per lane, persisted to
 * data/v5_projection.json and stamped with a fingerprint of the source TXT so a
 * matcher can refuse to run against a stale projection. P10: every row carries
 * the basis of its LPG/CYL split.
 *
 * This module is pure (no DB, no writes) so it can be tested in isolation. The
 * v5 generator calls it after building Part 1, with the exact `financial` rows
 * the statement was rendered from — the projection can therefore never disagree
 * with the statement it accompanies.
 */
import crypto from 'crypto';
import fs from 'fs';

export const PROJECTION_SCHEMA_VERSION = 1;

/** split_basis values (proposal P10) plus the two non-split cases. */
export const SPLIT_BASIS = Object.freeze({
  DB_LINES: 'DB_LINES', // DB line detail ties to the TXT header (±R0.02)
  SINGLE_LANE: 'SINGLE_LANE', // line detail exists but is all one lane
  REF_EMPTY: 'REF_EMPTY', // no usable line detail; -EMPTY / EMPTIES ref routes to CYL
  HEADER_FALLBACK: 'HEADER_FALLBACK', // no usable line detail; whole amount assumed LPG
  PAYMENT_LANE: 'PAYMENT_LANE', // payments / journals route by cfg.paymentLane, never split
  RATIFICATION: 'RATIFICATION', // synthetic row from an active ratification scenario
});

/** Bases whose rows may support CONFIRMED ties (P10). Everything else is probable-only. */
export const CONFIRMABLE_BASES = new Set([
  SPLIT_BASIS.DB_LINES,
  SPLIT_BASIS.SINGLE_LANE,
  SPLIT_BASIS.REF_EMPTY,
  SPLIT_BASIS.PAYMENT_LANE,
  SPLIT_BASIS.RATIFICATION,
]);

const round2 = (n) => Math.round(Number(n) * 100) / 100;

export function sha256(bufOrString) {
  return crypto.createHash('sha256').update(bufOrString).digest('hex');
}

export function fileFingerprint(filePath) {
  return sha256(fs.readFileSync(filePath));
}

function kindOf(entryType) {
  if (entryType === 'Invoice') return 'invoice';
  if (entryType === 'Crd Note') return 'credit_note';
  if (entryType === 'Journal') return 'journal';
  return 'payment';
}

/**
 * Expand one v5 `financial` row into its lane rows.
 * LPG + OTHER is the default match target (proposal P4); OTHER is broken out as
 * its own lane only when DB line detail ties exactly (DB_LINES), otherwise it is
 * folded into LPG, which is exactly how the v5 statement already treats it.
 */
export function laneRowsFor(r) {
  const base = {
    doc_no: r.doc_no,
    clean_doc: r.clean_doc,
    entry_type: r.entry_type,
    kind: kindOf(r.entry_type),
    date: r.iso,
    ref_no: r.ref_no || '',
    txt_line: r.is_ratification ? null : r.lineNo,
    txt_amount: r.amount,
    split_basis: r.split_basis,
    confirmable: CONFIRMABLE_BASES.has(r.split_basis),
    ...(r.is_ratification ? { ratification_id: r.ratification_id } : {}),
  };
  const out = [];
  const lpgTotal = round2(r.lpg_amount);
  const other =
    r.split_basis === SPLIT_BASIS.DB_LINES ? round2(r.db_other || 0) : 0;
  const lpgOnly = round2(lpgTotal - other);
  if (Math.abs(lpgOnly) >= 0.01) out.push({ ...base, lane: 'LPG', amount: lpgOnly });
  if (Math.abs(other) >= 0.01) out.push({ ...base, lane: 'OTHER', amount: other });
  if (Math.abs(r.cyl_amount) >= 0.01) out.push({ ...base, lane: 'CYL', amount: round2(r.cyl_amount) });
  return out.map((row) => ({
    row_id: `${row.clean_doc}|${row.entry_type}|${row.lane}${row.txt_line != null ? `|L${row.txt_line}` : ''}`,
    ...row,
  }));
}

/**
 * Build the projection object. Includes self-checks proving the rows reproduce
 * the statement's sub-ledger closings — a projection that fails them must not be
 * matched against.
 */
export function buildV5Projection({
  cfg,
  financial,
  headerBalance,
  txtFingerprint,
  configFingerprint,
  coverage,
  finals,
  generatedAt = new Date().toISOString(),
  txtRelPath,
}) {
  const rows = financial.flatMap(laneRowsFor);

  const sumLane = (lanes) =>
    round2(rows.filter((x) => lanes.includes(x.lane)).reduce((s, x) => s + x.amount, 0));
  const lpgMovement = sumLane(['LPG', 'OTHER']);
  const cylMovement = sumLane(['CYL']);
  const lpgRebuilt = round2(cfg.lpgOpeningBf + lpgMovement);
  const cylRebuilt = round2(cfg.cylOpeningFinancial + cylMovement);
  const erpVariance = round2(finals.finalCombined - headerBalance);

  const basisCounts = {};
  for (const x of rows) basisCounts[x.split_basis] = (basisCounts[x.split_basis] || 0) + 1;

  const checks = {
    lpgRowsReproduce1A: Math.abs(lpgRebuilt - finals.finalLpg) < 0.02,
    cylRowsReproduce1B: Math.abs(cylRebuilt - finals.finalCyl) < 0.02,
    tiesToErpHeader: Math.abs(erpVariance) < 0.02,
  };

  return {
    schemaVersion: PROJECTION_SCHEMA_VERSION,
    status: 'PROPOSED — NOT RATIFIED (PROPOSED_Projection_Matching_Locks.md, build step 1)',
    debtorCode: cfg.debtorCode,
    generatedBy: 'reconcile_debtor_v5_from_txt.mjs',
    generatedAt,
    source: {
      txtPath: txtRelPath,
      txtSha256: txtFingerprint,
      configSha256: configFingerprint,
      erpCurrentBalance: headerBalance,
    },
    window: {
      periodStart: cfg.periodStart,
      lastRowDate: financial.at(-1)?.iso || cfg.periodStart,
      paymentLane: cfg.paymentLane,
    },
    openings: {
      combinedBf: cfg.combinedBf,
      lpgOpeningBf: cfg.lpgOpeningBf,
      cylOpeningFinancial: cfg.cylOpeningFinancial,
    },
    closings: {
      lpg: finals.finalLpg,
      cyl: finals.finalCyl,
      combined: finals.finalCombined,
      erpVariance,
    },
    ingestGate: coverage
      ? {
          ingestCoverage: coverage.ingestCoverage ?? null,
          ingestFreshness: coverage.ingestFreshness ?? null,
          displayStatus: coverage.display_status ?? null,
        }
      : null,
    checks,
    summary: { rowCount: rows.length, splitBasisCounts: basisCounts },
    rows,
  };
}

/**
 * Guard for downstream consumers (the matcher): the projection must have been
 * built from the TXT that is on disk now, and must pass its own checks.
 * Returns { ok, reasons[] } — callers refuse to run when ok is false.
 */
export function verifyProjection(projection, { txtFingerprint, requireErpTie = false } = {}) {
  const reasons = [];
  if (projection?.schemaVersion !== PROJECTION_SCHEMA_VERSION) {
    reasons.push(`schemaVersion ${projection?.schemaVersion} != ${PROJECTION_SCHEMA_VERSION}`);
  }
  if (txtFingerprint && projection?.source?.txtSha256 !== txtFingerprint) {
    reasons.push('TXT fingerprint mismatch — projection is stale; re-run the v5 generator');
  }
  if (!projection?.checks?.lpgRowsReproduce1A) reasons.push('LPG rows do not reproduce Part 1A closing');
  if (!projection?.checks?.cylRowsReproduce1B) reasons.push('CYL rows do not reproduce Part 1B closing');
  if (requireErpTie && !projection?.checks?.tiesToErpHeader) {
    reasons.push(`projection does not tie to ERP header (variance R${projection?.closings?.erpVariance})`);
  }
  return { ok: reasons.length === 0, reasons };
}
