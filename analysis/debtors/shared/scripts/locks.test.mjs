/**
 * Contract tests for locks & period close (P5–P6, PROPOSED — NOT RATIFIED).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchProjection } from './projection_matcher.mjs';
import { planClose, applyClose, applyVoid, effectiveLocks, emptyLocks, rowKey, planApproval, applyApproval } from './locks.mjs';

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

const approve = (proj, registry, o) =>
  planApproval({ projection: proj, registry, approvedBy: 'operator', session: 't', now: '2026-10-08T00:00:00Z', reason: 'ruling', ...o });

test('approved ruling: payment over invoices as customer credit, applied as a LOCKED tie carrying its ruling', () => {
  const proj = projection([
    row({ doc: 'I1', date: '2026-08-07', amount: 280.39 }),
    row({ doc: 'I2', date: '2026-08-14', amount: 280.39 }),
    row({ doc: 'P1', type: 'Payment', date: '2026-08-17', amount: -594.42 }),
  ]);
  const plan = approve(proj, { overrides: [] }, { payment: 'P1', invoices: ['I1', 'I2'], treatment: 'customer_credit' });
  assert.equal(plan.ok, true);
  assert.equal(plan.lock.status, 'approved');
  assert.equal(plan.lock.close_id, null);
  assert.equal(plan.lock.ruling.net, -33.64);
  const reg = applyApproval({ overrides: [] }, plan);
  const m = matchProjection(proj, undefined, null, effectiveLocks(reg));
  assert.equal(m.locksApplied, 1);
  assert.equal(m.ties[0].rule, 'LOCKED');
  assert.equal(m.ties[0].ruling.treatment, 'customer_credit');
  assert.equal(m.proof.holds, true);
});

test('approval refuses: inexact net without a treatment, wrong-sign treatment, re-locking, missing docs or reason', () => {
  const proj = projection([
    row({ doc: 'I1', date: '2026-08-07', amount: 280.39 }),
    row({ doc: 'P1', type: 'Payment', date: '2026-08-17', amount: -300 }),
    row({ doc: 'P2', type: 'Payment', date: '2026-02-07', amount: -621.68 }),
  ]);
  assert.match(approve(proj, {}, { payment: 'P1', invoices: ['I1'] }).reasons.join(), /not within ±R0.05/);
  assert.match(approve(proj, {}, { payment: 'P1', invoices: ['I1'], treatment: 'short_paid' }).reasons.join(), /short_paid needs/);
  assert.match(approve(proj, {}, { payment: 'P1', invoices: ['NOPE'], treatment: 'customer_credit' }).reasons.join(), /NOPE/);
  assert.match(approve(proj, {}, { payment: 'P1', invoices: ['I1'], treatment: 'customer_credit', reason: '' }).reasons.join(), /reason/);
  const bf = approve(proj, {}, { payment: 'P2', treatment: 'applied_to_bf' });
  assert.equal(bf.ok, true);
  assert.equal(bf.lock.members.length, 1);
  const reg = applyApproval({}, bf);
  assert.match(approve(proj, reg, { payment: 'P2', treatment: 'applied_to_bf' }).reasons.join(), /already locked/);
});

test('part_payment needs a separate open partialDoc', () => {
  const proj = projection([
    row({ doc: 'I1', date: '2026-07-03', amount: 623.88 }),
    row({ doc: 'I2', date: '2026-07-08', amount: 14973.23 }),
    row({ doc: 'P1', type: 'Payment', date: '2026-08-14', amount: -15000 }),
  ]);
  assert.equal(approve(proj, {}, { payment: 'P1', invoices: ['I2'], treatment: 'part_payment' }).ok, false);
  const ok = approve(proj, {}, { payment: 'P1', invoices: ['I2'], treatment: 'part_payment', partialDoc: 'I1' });
  assert.equal(ok.ok, true);
  assert.equal(ok.lock.ruling.partialDoc, 'I1');
  assert.equal(ok.lock.ruling.net, -26.77);
});

test('planApproval: several payments settle one delivery with its deposit invoice (BATCH_SUM ruling)', async () => {
  const { planApproval } = await import('./locks.mjs');
  const row = (doc, type, kind, lane, amount, date) => ({ row_id: `${doc}|${type}|${lane}`, clean_doc: doc, entry_type: type, kind, lane, amount, date, ref_no: '', txt_line: 1 });
  const projection = {
    rows: [
      row('50528', 'Invoice', 'invoice', 'LPG', 4329.29, '2026-05-05'),
      row('50529', 'Invoice', 'invoice', 'CYL', 4140, '2026-05-05'),
      row('44227', 'Payment', 'payment', 'LPG', -4978.91, '2026-05-07'),
      row('45590', 'Payment', 'payment', 'LPG', -3490.37, '2026-08-06'),
    ],
  };
  const plan = planApproval({ projection, registry: {}, payment: '44227,45590', invoices: ['50528'], deposits: ['50529'], treatment: 'exact', reason: 'test', approvedBy: 'operator', session: 's', now: 'n' });
  assert.equal(plan.ok, true, plan.reasons?.join('; '));
  assert.equal(plan.lock.members.length, 4);
  assert.equal(plan.lock.ruling.net, 0.01);
  const bad = planApproval({ projection, registry: {}, payment: '44227,99999', invoices: ['50528'], deposits: ['50529'], reason: 'x', approvedBy: 'o', session: 's', now: 'n' });
  assert.equal(bad.ok, false);
});

// 'Settled through' records (operator ruling ADM-92, 2026-10-09)
const R = (doc, type, kind, amount, date, line, lane = 'LPG') => ({ row_id: `${doc}|${type}|${lane}|L${line}`, clean_doc: doc, entry_type: type, kind, lane, amount, date, ref_no: '', txt_line: line, confirmable: true, split_basis: 'DB_LINES' });
const stProjection = () => ({
  rows: [
    R('I1', 'Invoice', 'invoice', 100, '2026-01-05', 2),
    R('C1', 'Crd Note', 'credit_note', -40, '2026-01-06', 3, 'CYL'),
    R('I2', 'Invoice', 'invoice', 40, '2026-01-06', 4, 'CYL'),
    R('P1', 'Payment', 'payment', -100, '2026-04-08', 5), // pays the January statement; dated after `through`
    R('I3', 'Invoice', 'invoice', 500, '2026-04-02', 6),
  ],
  openings: { combinedBf: 0 },
  closings: { combined: 500 },
  source: { erpCurrentBalance: 500 },
});

test('planSettledThrough: needs the included payment, refuses a range that is not at R0.00, records count + digest', async () => {
  const { planSettledThrough, applySettledThrough, effectiveLocks, memberDigest } = await import('./locks.mjs');
  const proj = stProjection();
  const common = { projection: proj, registry: {}, through: '2026-03-31', reason: 'r', approvedBy: 'operator', session: 's', now: 'n' };
  const bad = planSettledThrough(common);
  assert.equal(bad.ok, false);
  assert.match(bad.reasons.join(';'), /not R0\.00/);
  const ok = planSettledThrough({ ...common, anchorLine: 5, includePayments: ['P1'] });
  assert.equal(ok.ok, true, ok.reasons?.join('; '));
  assert.equal(ok.record.memberCount, 4);
  assert.equal(ok.record.record_id, 'S0001');
  assert.equal(ok.record.memberDigest, memberDigest(proj.rows.filter((r) => r.row_id !== 'I3|Invoice|LPG|L6')));
  assert.equal(planSettledThrough({ ...common, anchorLine: 6, includePayments: ['P1'] }).ok, false); // anchor must be the last covered line
  const reg = applySettledThrough({}, ok);
  assert.equal(effectiveLocks(reg).settledThrough.length, 1);
  assert.equal(planSettledThrough({ ...common, registry: reg, includePayments: ['P1'] }).ok, false); // already settled
});

test('matcher: a settled-through record ties its range first and conflicts when a covered row changes or appears', async () => {
  const { planSettledThrough, applySettledThrough, effectiveLocks, applyVoid } = await import('./locks.mjs');
  const proj = stProjection();
  const plan = planSettledThrough({ projection: proj, registry: {}, through: '2026-03-31', includePayments: ['P1'], reason: 'r', approvedBy: 'o', session: 's', now: 'n' });
  const reg = applySettledThrough({}, plan);
  const res = matchProjection(proj, undefined, null, effectiveLocks(reg));
  const t = res.ties.find((x) => x.rule === 'SETTLED_THROUGH');
  assert.equal(t.confidence, 'CONFIRMED');
  assert.equal(t.members.length, 4);
  assert.equal(res.lockConflicts.length, 0);
  assert.equal(res.residual.openInvoicesLpgOther.count, 1); // I3 only
  assert.ok(res.proof.holds);
  // a back-dated document inside the range is the tripwire
  const changed = stProjection();
  changed.rows.push(R('I9', 'Invoice', 'invoice', 10, '2026-02-01', 7));
  changed.closings.combined = 510;
  const conflict = matchProjection(changed, undefined, null, effectiveLocks(reg));
  assert.equal(conflict.lockConflicts.length, 1);
  assert.equal(conflict.lockConflicts[0].lock_id, 'S0001');
  assert.equal(conflict.ties.filter((x) => x.rule === 'SETTLED_THROUGH').length, 0);
  // a void switches it off
  const voided = applyVoid(reg, { target: 'settled', id: 'S0001', voidedBy: 'o', reason: 'r', now: 'n' });
  assert.equal(effectiveLocks(voided).settledThrough.length, 0);
});
