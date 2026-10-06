/**
 * Contract tests for projection_matcher.mjs (build step 2, PROPOSED — NOT RATIFIED).
 * Amounts mirror real SA0001 July 2026 documents where noted.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dnNumber, matchProjection } from './projection_matcher.mjs';

let line = 0;
const row = (o) => {
  line += 1;
  const kind = { Invoice: 'invoice', 'Crd Note': 'credit_note' }[o.type || 'Invoice'] || 'payment';
  return {
    row_id: `${o.doc}|${o.type || 'Invoice'}|${o.lane || 'LPG'}|L${line}`,
    clean_doc: o.doc,
    entry_type: o.type || 'Invoice',
    kind,
    date: o.date,
    ref_no: o.ref || '',
    lane: o.lane || 'LPG',
    amount: o.amount,
    split_basis: o.basis || 'DB_LINES',
    confirmable: o.basis !== 'HEADER_FALLBACK',
  };
};
const projection = (rows, bf = 0) => {
  const closing = Math.round((bf + rows.reduce((s, r) => s + r.amount, 0)) * 100) / 100;
  return {
    rows,
    openings: { combinedBf: bf },
    closings: { combined: closing },
    source: { erpCurrentBalance: closing },
  };
};
const tieOf = (res, doc) => res.ties.find((t) => t.docs.some((d) => d.endsWith(` ${doc}`)));

test('dnNumber reads DN#, DN-, D/N and embedded forms; ignores placeholders', () => {
  assert.equal(dnNumber('DN#22719'), '22719');
  assert.equal(dnNumber('DN-22719'), '22719');
  assert.equal(dnNumber('D/N20345'), '20345');
  assert.equal(dnNumber('MKONDENI DN20430 EMP'), '20430');
  assert.equal(dnNumber('DN#21635MPTY-KONDENI'), '21635');
  assert.equal(dnNumber('DN-00-EMPTY'), null);
  assert.equal(dnNumber('ON 257219'), null);
});

test('Bank UD / Payment on the same doc clear each other and are never matched to invoices', () => {
  const res = matchProjection(
    projection([
      row({ doc: '42780', type: 'Bank UD', date: '2025-04-29', amount: 64736 }),
      row({ doc: '42780', type: 'Payment', date: '2025-04-29', amount: -64736 }),
      row({ doc: '1', date: '2025-04-01', amount: 64736 }),
    ]),
  );
  assert.equal(tieOf(res, '42780').rule, 'UD_CLEARING');
  assert.equal(res.residual.openInvoicesLpgOther.count, 1);
});

test('credit note pairs by DN number per lane; 0–1 day CONFIRMED, later PROBABLE', () => {
  const res = matchProjection(
    projection([
      row({ doc: '50721', date: '2026-05-18', ref: 'DN#22719', lane: 'LPG', amount: 324.88 }),
      row({ doc: '50721', date: '2026-05-18', ref: 'DN#22719', lane: 'CYL', amount: 4830 }),
      row({ doc: '14917', type: 'Crd Note', date: '2026-05-19', ref: 'DN#22719', lane: 'LPG', amount: -324.88 }),
      row({ doc: '14917', type: 'Crd Note', date: '2026-05-19', ref: 'DN#22719', lane: 'CYL', amount: -4830 }),
      row({ doc: '42584', date: '2025-04-26', ref: 'DN#13102', lane: 'CYL', amount: 4830 }),
      row({ doc: '12361', type: 'Crd Note', date: '2025-04-29', ref: 'DN#13102-EMPTY', lane: 'CYL', amount: -4830 }),
    ]),
  );
  const pairs = res.ties.filter((t) => t.rule === 'CN_DN_PAIR');
  assert.equal(pairs.length, 3);
  assert.deepEqual(pairs.map((t) => t.confidence).sort(), ['CONFIRMED', 'CONFIRMED', 'PROBABLE']);
});

test('CN fallback pairs on exact amount + date only when unambiguous, and only as PROBABLE', () => {
  const one = matchProjection(
    projection([
      row({ doc: '44988', date: '2025-07-21', lane: 'CYL', amount: 4830 }),
      row({ doc: '13028', type: 'Crd Note', date: '2025-07-21', lane: 'CYL', amount: -4830 }),
    ]),
  );
  assert.equal(one.ties[0].rule, 'CN_AMOUNT_DATE');
  assert.equal(one.ties[0].confidence, 'PROBABLE');
  const two = matchProjection(
    projection([
      row({ doc: 'A', date: '2025-07-21', lane: 'CYL', amount: 4830 }),
      row({ doc: 'B', date: '2025-07-21', lane: 'CYL', amount: 4830 }),
      row({ doc: 'C', type: 'Crd Note', date: '2025-07-21', lane: 'CYL', amount: -4830 }),
    ]),
  );
  assert.equal(two.ties.length, 0, 'ambiguous fallback must leave rows open');
});

test('partial cylinder returns (amounts differ) stay open', () => {
  const res = matchProjection(
    projection([
      row({ doc: '46993', date: '2025-10-09', ref: 'DN#20609-EMPTY', lane: 'CYL', amount: 4830 }),
      row({ doc: '13648', type: 'Crd Note', date: '2025-10-09', ref: 'DN#20609-EMPTY', lane: 'CYL', amount: -3622.5 }),
    ]),
  );
  assert.equal(res.ties.length, 0);
});

test('exact single: tie-break is smallest variance, then closest to the payment date', () => {
  const res = matchProjection(
    projection([
      row({ doc: '51250', date: '2026-06-17', amount: 312.73 }),
      row({ doc: '51428', date: '2026-06-26', amount: 312.73 }),
      row({ doc: '44962', type: 'Payment', date: '2026-07-01', amount: -312.73 }),
    ]),
  );
  const t = tieOf(res, '44962');
  assert.equal(t.rule, 'EXACT_SINGLE');
  assert.equal(t.confidence, 'CONFIRMED');
  assert.deepEqual(t.invoices.map((i) => i.doc), ['51428']);
});

test('exact 2-invoice sum (SA0001 payment 45095 = 51472 + 51594)', () => {
  const res = matchProjection(
    projection([
      row({ doc: '51472', date: '2026-06-29', amount: 6671.66 }),
      row({ doc: '51594', date: '2026-07-03', amount: 314.03 }),
      row({ doc: '45095', type: 'Payment', date: '2026-07-06', amount: -6985.69 }),
    ]),
  );
  const t = tieOf(res, '45095');
  assert.ok(['EXACT_SUM', 'EXACT_MONTH_SUM'].includes(t.rule));
  assert.deepEqual(t.invoices.map((i) => i.doc).sort(), ['51472', '51594']);
});

test('billing-month exact sum is CONFIRMED', () => {
  const res = matchProjection(
    projection([
      row({ doc: '51723', date: '2026-07-09', amount: 314.03 }),
      row({ doc: '51739', date: '2026-07-10', amount: 6699.21 }),
      row({ doc: '45194', type: 'Payment', date: '2026-07-13', amount: -7013.24 }),
    ]),
  );
  const t = tieOf(res, '45194');
  assert.equal(t.rule, 'EXACT_MONTH_SUM');
  assert.equal(t.confidence, 'CONFIRMED');
});

test('proximity and near-sum ties are PROBABLE; beyond tolerance stays unallocated', () => {
  const res = matchProjection(
    projection([
      row({ doc: '43375', date: '2025-05-15', amount: 282.8 }),
      row({ doc: '38878', type: 'Payment', date: '2025-05-20', amount: -283.0 }),
      row({ doc: 'X1', date: '2025-04-20', amount: 6235.37 }),
      row({ doc: 'X2', date: '2025-05-02', amount: 279.2 }),
      row({ doc: '38531', type: 'Payment', date: '2025-05-07', amount: -6514.5 }),
      row({ doc: '99999', type: 'Payment', date: '2025-06-01', amount: -10 }),
    ]),
  );
  assert.equal(tieOf(res, '38878').rule, 'PROXIMITY');
  assert.equal(tieOf(res, '38878').confidence, 'PROBABLE');
  assert.equal(tieOf(res, '38531').rule, 'NEAR_SUM');
  assert.equal(tieOf(res, '38531').confidence, 'PROBABLE');
  assert.equal(res.summary.paymentsUnallocated, 1);
});

test('no prepayment: invoices dated after the payment are not eligible', () => {
  const res = matchProjection(
    projection([
      row({ doc: 'P1', type: 'Payment', date: '2026-01-05', amount: -500 }),
      row({ doc: 'I1', date: '2026-01-10', amount: 500 }),
    ]),
  );
  assert.equal(res.ties.length, 0);
});

test('CYL lanes are never payment targets; OTHER lane joins LPG in the target', () => {
  const res = matchProjection(
    projection([
      row({ doc: 'CYLONLY', date: '2026-01-01', lane: 'CYL', amount: 5347.5 }),
      row({ doc: 'MIX', date: '2026-01-02', lane: 'LPG', amount: 6560.57 }),
      row({ doc: 'MIX', date: '2026-01-02', lane: 'OTHER', amount: 1800 }),
      row({ doc: 'P1', type: 'Payment', date: '2026-01-10', amount: -5347.5 }),
      row({ doc: 'P2', type: 'Payment', date: '2026-01-10', amount: -8360.57 }),
    ]),
  );
  assert.equal(tieOf(res, 'P1'), undefined);
  assert.equal(tieOf(res, 'P2').rule, 'EXACT_SINGLE');
});

test('a tie touching a HEADER_FALLBACK row is downgraded to PROBABLE (P10)', () => {
  const res = matchProjection(
    projection([
      row({ doc: 'I1', date: '2026-01-01', amount: 100, basis: 'HEADER_FALLBACK' }),
      row({ doc: 'P1', type: 'Payment', date: '2026-01-05', amount: -100 }),
    ]),
  );
  assert.equal(res.ties[0].rule, 'EXACT_SINGLE');
  assert.equal(res.ties[0].confidence, 'PROBABLE');
});

test('residual proof rebuilds the closing balance exactly', () => {
  const res = matchProjection(
    projection(
      [
        row({ doc: 'I1', date: '2026-01-01', amount: 100 }),
        row({ doc: 'I2', date: '2026-01-02', amount: 250 }),
        row({ doc: 'P1', type: 'Payment', date: '2026-01-05', amount: -100.03 }),
        row({ doc: 'P2', type: 'Payment', date: '2026-01-06', amount: -999 }),
      ],
      4945.93,
    ),
  );
  assert.equal(res.proof.holds, true);
  assert.equal(res.residual.tieNets, -0.03);
});
