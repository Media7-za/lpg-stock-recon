/**
 * Contract tests for open_items.mjs (build step 3, PROPOSED — NOT RATIFIED).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchProjection } from './projection_matcher.mjs';
import { buildOpenItems, renderOpenItemsMarkdown } from './open_items.mjs';

let n = 0;
const row = (o) => ({
  row_id: `${o.doc}|${o.type || 'Invoice'}|${o.lane || 'LPG'}|L${++n}`,
  clean_doc: o.doc,
  entry_type: o.type || 'Invoice',
  kind: { Invoice: 'invoice', 'Crd Note': 'credit_note' }[o.type || 'Invoice'] || 'payment',
  date: o.date,
  ref_no: o.ref || '',
  lane: o.lane || 'LPG',
  amount: o.amount,
  txt_line: n,
  split_basis: 'DB_LINES',
  confirmable: true,
});
function fixture() {
  const rows = [
    row({ doc: 'I1', date: '2026-07-01', amount: 312.73 }),
    row({ doc: 'P1', type: 'Payment', date: '2026-07-05', amount: -312.73, ref: 'TRANSF | STAT 128' }), // exact → confirmed
    row({ doc: 'I2', date: '2026-07-02', amount: 282.8 }),
    row({ doc: 'P2', type: 'Payment', date: '2026-07-06', amount: -283.0 }), // proximity → probable
    row({ doc: 'I3', date: '2026-07-27', amount: 6699.21 }), // open
    row({ doc: 'I4', date: '2026-07-27', lane: 'CYL', amount: 4830, ref: 'DN#22846-EMPTY' }),
    row({ doc: 'C4', type: 'Crd Note', date: '2026-07-27', lane: 'CYL', amount: -4830, ref: 'DN#22846-EMPTY' }),
  ];
  const bf = 1000;
  const closing = Math.round((bf + rows.reduce((s, r) => s + r.amount, 0)) * 100) / 100;
  const projection = {
    rows,
    openings: { combinedBf: bf, lpgOpeningBf: bf, cylOpeningFinancial: 0 },
    closings: { combined: closing },
    source: { erpCurrentBalance: closing, txtSha256: 'abc', dbChannel: 'direct' },
    window: { periodStart: '2026-07-01', lastRowDate: '2026-07-27' },
  };
  const m = matchProjection(projection);
  const matches = { ...m, projection: { path: 'x', txtSha256: 'abc' }, reviewOnly: false, reviewOnlyReasons: [] };
  return { projection, matches };
}

test('internal view hides confirmed and probable ties, keeps open rows, and ties to ERP', () => {
  const { projection, matches } = fixture();
  const v = buildOpenItems(projection, matches, 'internal');
  assert.deepEqual(v.parts.lpg.lines.map((l) => l.doc), ['I3']);
  assert.equal(v.parts.cyl.lines.length, 0);
  assert.equal(v.parts.lpg.rounding, -0.2);
  assert.equal(v.proof.holds, true);
  assert.equal(v.proof.tiesToErp, true);
  assert.equal(v.appendix.length, 1);
});

test('customer view keeps probable-tied rows (both sides) visible and still balances', () => {
  const { projection, matches } = fixture();
  const v = buildOpenItems(projection, matches, 'customer');
  assert.deepEqual(v.parts.lpg.lines.map((l) => l.doc).sort(), ['I2', 'I3', 'P2']);
  assert.ok(v.parts.lpg.lines.filter((l) => l.doc !== 'I3').every((l) => l.pendingProbable));
  assert.equal(v.parts.lpg.rounding, 0);
  assert.equal(v.proof.tiesToErp, true);
});

test('refuses matches built from a different projection', () => {
  const { projection, matches } = fixture();
  assert.throws(() => buildOpenItems(projection, { ...matches, projection: { txtSha256: 'zzz' } }), /different projection/);
});

test('markdown escapes pipes in references and keeps internal detail out of the customer copy', () => {
  const { projection, matches } = fixture();
  const ctx = { cfg: { debtorName: 'TEST', debtorCode: 'T1' }, projection, matches, generatedOn: '2026-10-06' };
  const cust = renderOpenItemsMarkdown(buildOpenItems(projection, matches, 'customer'), ctx);
  assert.match(cust, /TRANSF \\\| STAT 128|DRAFT PREVIEW/);
  assert.doesNotMatch(cust, /PROXIMITY|Appendix A|projection_matches/);
  const internal = renderOpenItemsMarkdown(buildOpenItems(projection, matches, 'internal'), ctx);
  assert.match(internal, /Appendix A/);
  assert.match(internal, /\*\*Variance\*\* \| \| \| \*\*0\.00\*\*/);
});

test('operator rulings get their own proof lines and a part-paid note; balance still ties', async () => {
  const { planApproval, applyApproval, effectiveLocks } = await import('./locks.mjs');
  const rows = [
    row({ doc: 'I1', date: '2026-07-03', amount: 623.88 }),
    row({ doc: 'I2', date: '2026-07-08', amount: 14973.23 }),
    row({ doc: 'P1', type: 'Payment', date: '2026-08-14', amount: -15000 }),
    row({ doc: 'P9', type: 'Payment', date: '2026-02-07', amount: -621.68 }),
  ];
  const bf = 5000;
  const closing = Math.round((bf + rows.reduce((s, r) => s + r.amount, 0)) * 100) / 100;
  const projection = {
    rows,
    openings: { combinedBf: bf, lpgOpeningBf: bf, cylOpeningFinancial: 0 },
    closings: { combined: closing },
    source: { erpCurrentBalance: closing, txtSha256: 'abc', dbChannel: 'direct' },
    window: { periodStart: '2026-02-01', lastRowDate: '2026-08-14' },
  };
  const a = (reg, o) => applyApproval(reg, planApproval({ projection, registry: reg, approvedBy: 'op', session: 't', now: 'n', reason: 'r', ...o }));
  let reg = a({}, { payment: 'P1', invoices: ['I2'], treatment: 'part_payment', partialDoc: 'I1' });
  reg = a(reg, { payment: 'P9', treatment: 'applied_to_bf' });
  const m = matchProjection(projection, undefined, null, effectiveLocks(reg));
  const matches = { ...m, projection: { path: 'x', txtSha256: 'abc' }, reviewOnly: false, reviewOnlyReasons: [] };
  const v = buildOpenItems(projection, matches, 'internal');
  assert.deepEqual(v.parts.lpg.lines.map((l) => l.doc), ['I1']);
  assert.equal(v.parts.lpg.rulings.part_payment, -26.77);
  assert.equal(v.parts.lpg.rulings.applied_to_bf, -621.68);
  assert.equal(v.parts.lpg.rounding, 0);
  assert.equal(v.proof.tiesToErp, true);
  const md = renderOpenItemsMarkdown(v, { cfg: { debtorName: 'X', debtorCode: 'X1' }, projection, matches, generatedOn: 'd' });
  assert.match(md, /Payments applied to opening B\/F/);
  assert.match(md, /Invoice I1 R623\.88 less part-payment R26\.77 \(payment P1\) = R597\.11 outstanding/);
  assert.match(md, /Appendix D/);
});

test('unconfirmed UD payments render as a memo, outside the balance', () => {
  const { projection, matches } = fixture();
  projection.udPending = { rows: [{ clean_doc: '46364', iso: '2026-10-06', amount: -2500 }], rowsTotal: -2500, headerTotal: -2500, unexplained: 0 };
  const v = buildOpenItems(projection, matches, 'internal');
  assert.equal(v.proof.tiesToErp, true);
  const md = renderOpenItemsMarkdown(v, { cfg: { debtorName: 'X', debtorCode: 'X1' }, projection, matches, generatedOn: 'd' });
  assert.match(md, /Memo: unconfirmed UD payments R-2,500\.00/);
  const cust = renderOpenItemsMarkdown(buildOpenItems(projection, matches, 'customer'), { cfg: { debtorName: 'X', debtorCode: 'X1' }, projection, matches, generatedOn: 'd' });
  assert.match(cust, /R2,500\.00 received but not yet confirmed/);
});

test('named residuals: untied journals listed in config leave the open rows and show as proof lines that still tie', async () => {
  const { buildOpenItems, renderOpenItemsMarkdown } = await import('./open_items.mjs');
  const mk = (doc, type, kind, amount, line) => ({ row_id: `${doc}|${type}|LPG`, clean_doc: doc, entry_type: type, kind, lane: 'LPG', amount, date: '2026-07-12', ref_no: '', txt_line: line });
  const projection = {
    rows: [mk('490', 'Journal', 'journal', 4019.12, 2), mk('491', 'Journal', 'journal', -203.65, 3), mk('900', 'Invoice', 'invoice', 1000, 4)],
    openings: { lpgOpeningBf: 100, cylOpeningFinancial: 0, combinedBf: 100 },
    closings: { combined: 4915.47 },
    source: { erpCurrentBalance: 4915.47, txtSha256: 'abcdef0123456789abcdef', dbChannel: 'test' },
    window: { periodStart: '2026-07-01', lastRowDate: '2026-07-12' },
  };
  const matches = { ties: [], summary: { confirmed: 0, probable: 0 }, proof: {}, projection: { path: 'x' }, lockConflicts: [] };
  const named = [{ id: 'phantom_cn_nets', label: 'Path B phantom journal nets', entry_type: 'Journal', docs: ['490'] }, { id: 'pathb', label: 'Path B discount journals', entry_type: 'Journal', docs: ['491'] }];
  const model = buildOpenItems(projection, matches, 'internal', { namedResiduals: named });
  assert.equal(model.parts.lpg.lines.length, 1); // only the invoice stays open
  assert.equal(model.named.length, 2);
  assert.equal(model.proof.combined, 4915.47);
  assert.ok(model.proof.tiesToErp);
  const md = renderOpenItemsMarkdown(model, { cfg: { debtorName: 'X', debtorCode: 'X1', rowNotes: [{ entry_type: 'Invoice', doc: '900', note: 'lane pending' }] }, projection, matches, generatedOn: '2026-10-09' });
  assert.match(md, /Path B phantom journal nets \(1 journal rows\)/);
  assert.match(md, /\*\*Invoice 900:\*\* lane pending/);
});
