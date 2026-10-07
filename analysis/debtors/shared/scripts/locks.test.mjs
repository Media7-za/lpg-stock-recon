/**
 * Contract tests for locks & period close (P5–P6, PROPOSED — NOT RATIFIED).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchProjection } from './projection_matcher.mjs';
import { planClose, applyClose, applyVoid, effectiveLocks, emptyLocks, rowKey } from './locks.mjs';

let n = 0;
const row = (o) => ({
  row_id: `${o.doc}|${o.type || 'Invoice'}|LPG|L${++n}`,
  clean_doc: o.doc,
  entry_type: o.type || 'Invoice',
  kind: o.type === 'Payment' ? 'payment' : 'invoice',
  date: o.date,
  ref_no: '',
  lane: 'LPG',
  amount: o.amount,
  split_basis: 'DB_LINES',
  confirmable: true,
});
const projection = (rows) => {
  const closing = Math.round(rows.reduce((s, r) => s + r.amount, 0) * 100) / 100;
  return {
    rows,
    openings: { combinedBf: 0 },
    closings: { combined: closing, erpVariance: 0 },
    checks: { lpgRowsReproduce1A: true, cylRowsReproduce1B: true, tiesToErpHeader: true },
    window: { periodStart: '2026-01-01', lastRowDate: '2026-07-31' },
    source: { erpCurrentBalance: closing, txtSha256: 'abc', dbChannel: 'direct' },
    ingestGate: { ingestCoverage: 'complete' },
  };
};
const base = () => [
  row({ doc: 'I1', date: '2026-05-01', amount: 100 }),
  row({ doc: 'P1', type: 'Payment', date: '2026-05-10', amount: -100 }), // confirmed, May
  row({ doc: 'I2', date: '2026-05-02', amount: 282.8 }),
  row({ doc: 'P2', type: 'Payment', date: '2026-05-11', amount: -283 }), // probable, May
  row({ doc: 'I3', date: '2026-07-01', amount: 50 }),
  row({ doc: 'P3', type: 'Payment', date: '2026-07-05', amount: -50 }), // confirmed, July
];
const close = (proj, registry, through, extra = {}) => {
  const matches = matchProjection(proj, undefined, null, effectiveLocks(registry));
  return planClose({ projection: proj, matches, registry, through, tagGate: 'NOT_DERIVABLE_FROM_TXT', closedBy: 'agent', session: 't', now: '2026-10-07T00:00:00Z', ...extra });
};

test('close locks only CONFIRMED ties dated on/before the close date; probable never locked', () => {
  const plan = close(projection(base()), { overrides: [] }, '2026-06-30');
  assert.equal(plan.ok, true);
  assert.equal(plan.newLocks.length, 1);
  assert.deepEqual(plan.newLocks[0].members.map((m) => m.doc).sort(), ['I1', 'P1']);
  assert.equal(plan.close.probableLeftOpen, 1);
});

test('after close: locks applied first, results and open items unchanged (idempotent)', () => {
  const proj = projection(base());
  const before = matchProjection(proj);
  const reg = applyClose({ overrides: [] }, close(proj, { overrides: [] }, '2026-06-30'));
  const after = matchProjection(proj, undefined, null, effectiveLocks(reg));
  assert.equal(after.locksApplied, 1);
  assert.equal(after.ties.find((t) => t.rule === 'LOCKED').confidence, 'CONFIRMED');
  assert.deepEqual(after.residual.openInvoicesLpgOther, before.residual.openInvoicesLpgOther);
  assert.equal(after.ties.find((t) => t.rule === 'PROXIMITY').inClosedPeriod, true);
  assert.equal(reg.overrides.length, 0, 'existing overrides untouched');
});

test('a changed locked document becomes a CONFLICT (rows untied) and blocks the next close', () => {
  const reg = applyClose({ overrides: [] }, close(projection(base()), { overrides: [] }, '2026-06-30'));
  const changed = base().map((r) => (r.clean_doc === 'I1' ? { ...r, amount: 101 } : r));
  const proj2 = projection(changed);
  const res = matchProjection(proj2, undefined, null, effectiveLocks(reg));
  assert.equal(res.lockConflicts.length, 1);
  assert.match(res.lockConflicts[0].problems[0], /Invoice I1/);
  assert.ok(!res.ties.some((t) => t.members.some((id) => id.startsWith('P1|')) && t.rule === 'LOCKED'));
  const plan = close(proj2, reg, '2026-07-31');
  assert.equal(plan.ok, false);
  assert.match(plan.reasons.join(' '), /lock conflict/);
});

test('locks survive TXT line renumbering (keyed by doc/type/lane/date/amount)', () => {
  const reg = applyClose({ overrides: [] }, close(projection(base()), { overrides: [] }, '2026-06-30'));
  const renumbered = base().map((r) => ({ ...r, row_id: `${r.row_id}-x` }));
  const res = matchProjection(projection(renumbered), undefined, null, effectiveLocks(reg));
  assert.equal(res.locksApplied, 1);
  assert.equal(res.lockConflicts.length, 0);
});

test('gates: stale date, re-closing, ERP variance, BLOCKED tag gate and ingest gap all refuse', () => {
  const proj = projection(base());
  assert.match(close(proj, { overrides: [] }, '2026-08-15').reasons.join(), /stale guard/);
  const reg = applyClose({ overrides: [] }, close(proj, { overrides: [] }, '2026-05-31'));
  assert.match(close(proj, reg, '2026-05-15').reasons.join(), /already closed/);
  const bad = { ...proj, checks: { ...proj.checks, tiesToErpHeader: false }, closings: { ...proj.closings, erpVariance: 12 } };
  assert.match(close(bad, { overrides: [] }, '2026-06-30').reasons.join(), /does not tie/);
  assert.match(close(proj, { overrides: [] }, '2026-06-30', { tagGate: 'BLOCKED' }).reasons.join(), /BLOCKED/);
  assert.match(close(proj, { overrides: [] }, '2026-06-30', { ingestGapEarliest: '2026-06-15' }).reasons.join(), /ingest gap/);
  assert.equal(close(proj, { overrides: [] }, '2026-06-14', { ingestGapEarliest: '2026-06-15' }).ok, true);
});

test('void is append-only and deactivates the close and its locks', () => {
  const proj = projection(base());
  const reg = applyClose({ overrides: [] }, close(proj, { overrides: [] }, '2026-06-30'));
  const voided = applyVoid(reg, { target: 'close', id: 'C0001', voidedBy: 'agent', reason: 'test', now: 'x' });
  assert.equal(voided.projectionLocks.closes.length, 1, 'close record kept');
  assert.equal(voided.projectionLocks.locks.length, 1, 'lock record kept');
  const eff = effectiveLocks(voided);
  assert.equal(eff.closedThrough, null);
  assert.equal(eff.locks.length, 0);
  assert.throws(() => applyVoid(voided, { target: 'close', id: 'C0001', voidedBy: 'a', reason: 'r', now: 'x' }), /already voided/);
});

test('rowKey is stable across row_id changes', () => {
  assert.equal(rowKey({ clean_doc: '1', entry_type: 'Invoice', lane: 'LPG', date: '2026-01-01', amount: 5 }), '1|Invoice|LPG|2026-01-01|5.00');
  assert.deepEqual(emptyLocks().locks, []);
});
