/**
 * Contract tests for v5_projection.mjs (PROPOSED_Projection_Matching_Locks.md
 * build step 1). Run: npm run debtors:test
 *
 * Fixture rows mirror real SA0001 documents (TXT lines 258–261): mixed invoice
 * 50721 (CYL R4,830 + LPG R324.88), CYL-only invoice 50723 whose ref lacks
 * -EMPTY, and the reversing credit note 14917.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildV5Projection,
  laneRowsFor,
  verifyProjection,
  SPLIT_BASIS,
  PROJECTION_SCHEMA_VERSION,
} from './v5_projection.mjs';

const fin = (o) => ({
  doc_no: `000${o.doc}`,
  clean_doc: o.doc,
  entry_type: o.type || 'Invoice',
  iso: o.iso || '2026-05-18',
  ref_no: o.ref || '',
  lineNo: o.line ?? 1,
  amount: o.amount,
  lpg_amount: o.lpg ?? 0,
  cyl_amount: o.cyl ?? 0,
  split_basis: o.basis,
  db_other: o.other ?? 0,
  ...(o.rat ? { is_ratification: true, ratification_id: o.rat } : {}),
});

const cfg = {
  debtorCode: 'TEST01',
  periodStart: '2026-05-01',
  paymentLane: 'LPG',
  combinedBf: 1000,
  lpgOpeningBf: 1000,
  cylOpeningFinancial: 0,
};

test('mixed DB_LINES invoice splits into LPG and CYL rows, both confirmable', () => {
  const rows = laneRowsFor(
    fin({ doc: '50721', line: 258, amount: 5154.88, lpg: 324.88, cyl: 4830, basis: SPLIT_BASIS.DB_LINES }),
  );
  assert.deepEqual(
    rows.map((r) => [r.lane, r.amount, r.confirmable]),
    [
      ['LPG', 324.88, true],
      ['CYL', 4830, true],
    ],
  );
  assert.equal(rows[0].row_id, '50721|Invoice|LPG|L258');
});

test('OTHER is broken out only on DB_LINES rows and stays inside LPG otherwise', () => {
  const db = laneRowsFor(
    fin({ doc: '47876', amount: 8360.57, lpg: 8360.57, other: 1800, basis: SPLIT_BASIS.DB_LINES }),
  );
  assert.deepEqual(
    db.map((r) => [r.lane, r.amount]),
    [
      ['LPG', 6560.57],
      ['OTHER', 1800],
    ],
  );
  const fallback = laneRowsFor(
    fin({ doc: '47876', amount: 8360.57, lpg: 8360.57, other: 1800, basis: SPLIT_BASIS.HEADER_FALLBACK }),
  );
  assert.deepEqual(fallback.map((r) => [r.lane, r.amount]), [['LPG', 8360.57]]);
});

test('HEADER_FALLBACK rows are not confirmable (P10: probable-only)', () => {
  const [row] = laneRowsFor(
    fin({ doc: '50723', amount: 5347.5, lpg: 5347.5, ref: 'DN-22719', basis: SPLIT_BASIS.HEADER_FALLBACK }),
  );
  assert.equal(row.lane, 'LPG');
  assert.equal(row.confirmable, false);
});

test('ratification rows keep their scenario id and carry no TXT line', () => {
  const [row] = laneRowsFor(
    fin({ doc: '99999', amount: 7245, cyl: 7245, basis: SPLIT_BASIS.RATIFICATION, rat: 'CN13687-6CYL-NOV2025' }),
  );
  assert.equal(row.txt_line, null);
  assert.equal(row.ratification_id, 'CN13687-6CYL-NOV2025');
  assert.equal(row.row_id, '99999|Invoice|CYL');
});

const financial = [
  fin({ doc: '50721', line: 258, amount: 5154.88, lpg: 324.88, cyl: 4830, basis: SPLIT_BASIS.DB_LINES }),
  fin({ doc: '50723', line: 260, amount: 5347.5, cyl: 5347.5, ref: 'DN-22719', basis: SPLIT_BASIS.DB_LINES }),
  fin({ doc: '14917', line: 261, type: 'Crd Note', amount: -5154.88, lpg: -324.88, cyl: -4830, basis: SPLIT_BASIS.DB_LINES }),
  fin({ doc: '45000', line: 262, type: 'Payment', amount: -500, lpg: -500, basis: SPLIT_BASIS.PAYMENT_LANE }),
];
const finals = { finalLpg: 500, finalCyl: 5347.5, finalCombined: 5847.5 };

test('projection reproduces 1A/1B closings and ties to the ERP header', () => {
  const p = buildV5Projection({
    cfg,
    financial,
    headerBalance: 5847.5,
    txtFingerprint: 'abc',
    configFingerprint: 'def',
    coverage: { ingestCoverage: 'complete', ingestFreshness: 'current', display_status: 'CURRENT_COMPLETE' },
    finals,
    generatedAt: '2026-10-06T00:00:00.000Z',
    txtRelPath: 'x.TXT',
  });
  assert.equal(p.schemaVersion, PROJECTION_SCHEMA_VERSION);
  assert.deepEqual(p.checks, { lpgRowsReproduce1A: true, cylRowsReproduce1B: true, tiesToErpHeader: true });
  assert.equal(p.summary.rowCount, 6);
  assert.equal(p.summary.splitBasisCounts.DB_LINES, 5);
  assert.equal(verifyProjection(p, { txtFingerprint: 'abc', requireErpTie: true }).ok, true);
});

test('verifyProjection refuses a stale TXT fingerprint and an untied projection', () => {
  const p = buildV5Projection({
    cfg,
    financial,
    headerBalance: 6000, // ERP header disagrees
    txtFingerprint: 'abc',
    configFingerprint: 'def',
    coverage: null,
    finals,
    txtRelPath: 'x.TXT',
  });
  const stale = verifyProjection(p, { txtFingerprint: 'zzz' });
  assert.equal(stale.ok, false);
  assert.match(stale.reasons.join(' '), /fingerprint mismatch/);
  const untied = verifyProjection(p, { txtFingerprint: 'abc', requireErpTie: true });
  assert.equal(untied.ok, false);
  assert.match(untied.reasons.join(' '), /does not tie/);
  // Without requireErpTie the review-only path (P6 split gate) may still read it.
  assert.equal(verifyProjection(p, { txtFingerprint: 'abc' }).ok, true);
});

test('rows that do not reproduce the statement closings fail verification', () => {
  const p = buildV5Projection({
    cfg,
    financial,
    headerBalance: 5847.5,
    txtFingerprint: 'abc',
    configFingerprint: 'def',
    coverage: null,
    finals: { ...finals, finalLpg: 999 },
    txtRelPath: 'x.TXT',
  });
  assert.equal(p.checks.lpgRowsReproduce1A, false);
  assert.equal(verifyProjection(p, { txtFingerprint: 'abc' }).ok, false);
});
