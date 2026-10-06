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
