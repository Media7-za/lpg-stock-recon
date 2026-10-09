/**
 * Contract tests for projection_matcher.mjs (build step 2, PROPOSED — NOT RATIFIED).
 * Amounts mirror real SA0001 July 2026 documents where noted.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RULES, dnNumber, matchProjection } from './projection_matcher.mjs';

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
    { ...RULES, cylExchange: false }, // rule 5 would net B+C as a custody stretch; test rule 2 alone
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

test('exact single: tie-break is smallest variance, then oldest invoice first (FIFO, ADM-86)', () => {
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
  assert.deepEqual(t.invoices.map((i) => i.doc), ['51250']);
});

test('FIFO pairs equal-amount payments with invoices oldest first (FIR001 ADM-86)', () => {
  const res = matchProjection(
    projection([
      row({ doc: '52036', date: '2026-07-23', amount: 8120.59 }),
      row({ doc: '52195', date: '2026-07-30', amount: 8120.59 }),
      row({ doc: '45474', type: 'Payment', date: '2026-07-31', amount: -8120.59 }),
      row({ doc: '45591', type: 'Payment', date: '2026-08-07', amount: -8120.59 }),
    ]),
  );
  assert.deepEqual(tieOf(res, '45474').invoices.map((i) => i.doc), ['52036']);
  assert.deepEqual(tieOf(res, '45591').invoices.map((i) => i.doc), ['52195']);
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

test('exact rules run for every payment before any probable rule (SA0001 46092 / 46160)', () => {
  // v3 let 46092's NEAR_SUM (52814 + 53011, R0.55 off) take 53011, which the later
  // payment 46160 matches exactly. v4 ties 46160 ↔ 53011 first.
  const res = matchProjection(
    projection([
      row({ doc: '52814', date: '2026-08-12', amount: 5981.61 }),
      row({ doc: '52893', date: '2026-09-01', amount: 6262.0 }),
      row({ doc: '53011', date: '2026-09-07', amount: 285.84 }),
      row({ doc: '46092', type: 'Payment', date: '2026-09-08', amount: -6268.0 }),
      row({ doc: '46160', type: 'Payment', date: '2026-09-14', amount: -285.84 }),
    ]),
  );
  const t = tieOf(res, '46160');
  assert.equal(t.rule, 'EXACT_SINGLE');
  assert.deepEqual(t.invoices.map((i) => i.doc), ['53011']);
  assert.equal(tieOf(res, '46092'), undefined); // R6.00 off 52893: beyond ±R5, left for the operator
});

test('a payment equal to a run of 4+ consecutive open invoices ties as EXACT_RUN (MOZ002 39589)', () => {
  const res = matchProjection(
    projection([
      row({ doc: '43081', date: '2025-05-15', amount: 248.7 }),
      row({ doc: '43461', date: '2025-05-27', amount: 2691.21 }),
      row({ doc: '43648', date: '2025-06-03', amount: 2943.51 }),
      row({ doc: '43905', date: '2025-06-12', amount: 2617.29 }),
      row({ doc: '44062', date: '2025-06-18', amount: 2862.66 }),
      row({ doc: '39589', type: 'Payment', date: '2025-06-25', amount: -11363.37 }),
    ]),
  );
  const t = tieOf(res, '39589');
  assert.equal(t.rule, 'EXACT_RUN');
  assert.equal(t.confidence, 'CONFIRMED');
  assert.equal(t.invoices.length, 5);
  assert.equal(res.summary.paymentsUnallocated, 0);
});

test('EXACT_RUN prefers the oldest run and is PROBABLE when an equal run exists (MOZ002 40729)', () => {
  const res = matchProjection(
    projection([
      row({ doc: '44742', date: '2025-07-10', amount: 2810.61 }),
      row({ doc: '45199', date: '2025-07-28', amount: 2810.61 }),
      row({ doc: '45303', date: '2025-08-01', amount: 1525.76 }),
      row({ doc: '45488', date: '2025-08-07', amount: 2569.7 }),
      row({ doc: '45577', date: '2025-08-11', amount: 2810.61 }),
      row({ doc: '40729', type: 'Payment', date: '2025-08-14', amount: -9716.68 }),
    ]),
  );
  const t = tieOf(res, '40729');
  assert.equal(t.rule, 'EXACT_RUN');
  assert.deepEqual(t.invoices.map((i) => i.doc), ['44742', '45199', '45303', '45488']);
  assert.equal(t.confidence, 'PROBABLE');
  assert.equal(t.ambiguousAlternatives, 1);
});

test('EXACT_RUN needs consecutive invoices: a 4-invoice sum that skips one stays unallocated', () => {
  const res = matchProjection(
    projection([
      row({ doc: 'A', date: '2025-01-01', amount: 100 }),
      row({ doc: 'B', date: '2025-01-02', amount: 100 }),
      row({ doc: 'C', date: '2025-01-03', amount: 999 }),
      row({ doc: 'D', date: '2025-01-04', amount: 100 }),
      row({ doc: 'E', date: '2025-01-05', amount: 100 }),
      row({ doc: 'P', type: 'Payment', date: '2025-01-10', amount: -400 }),
    ]),
  );
  assert.equal(res.ties.length, 0);
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

// v5 rules (operator 2026-10-09). Amounts mirror MOZ002 DN#22222 (May 2026).
test('BATCH_SUM: several payments settle one delivery batch (gas + deposit); the rounding cent is absorbed', () => {
  const res = matchProjection(
    projection([
      row({ doc: '41529', type: 'Payment', date: '2025-10-07', amount: -0.01 }), // before the batch: not its cent
      row({ doc: '50528', date: '2026-05-05', ref: 'DN#22222', amount: 4329.29 }),
      row({ doc: '9001', type: 'Payment', date: '2026-08-07', amount: -0.01 }),
      row({ doc: '50529', date: '2026-05-05', ref: 'DN#22222-EMPTY', lane: 'CYL', amount: 4140 }),
      row({ doc: '44227', type: 'Payment', date: '2026-05-07', amount: -4978.91 }),
      row({ doc: '45590', type: 'Payment', date: '2026-08-06', amount: -3490.37 }),
    ]),
  );
  const t = tieOf(res, '44227');
  assert.equal(t.rule, 'BATCH_SUM');
  assert.equal(t.confidence, 'PROBABLE');
  assert.equal(t.variance, 0);
  assert.equal(t.roundingCent.doc, '9001');
  assert.deepEqual(t.payments.map((p) => p.doc), ['44227', '45590']);
  assert.equal(res.unallocatedPayments.length, 1); // 41529 stays out of this batch
  assert.equal(res.residual.openInvoicesCyl.count, 0);
});

test('BATCH_SUM: a deposit invoice alone is never a payment target', () => {
  const res = matchProjection(
    projection([
      row({ doc: 'D1', date: '2026-01-01', ref: 'DN#100-EMPTY', lane: 'CYL', amount: 4140 }),
      row({ doc: 'P1', type: 'Payment', date: '2026-01-05', amount: -2070 }),
      row({ doc: 'P2', type: 'Payment', date: '2026-01-06', amount: -2070 }),
    ]),
    { ...RULES, cylExchange: false },
  );
  assert.equal(res.ties.length, 0);
});

test('BATCH_SUM: payments before the batch or beyond batchWindowDays are not used', () => {
  const res = matchProjection(
    projection([
      row({ doc: 'P0', type: 'Payment', date: '2025-12-30', amount: -100 }),
      row({ doc: 'I1', date: '2026-01-01', ref: 'DN#200', amount: 150 }),
      row({ doc: 'C1', date: '2026-01-01', ref: 'DN#200-EMPTY', lane: 'CYL', amount: 100 }),
      row({ doc: 'P1', type: 'Payment', date: '2026-01-10', amount: -150 }),
      row({ doc: 'P2', type: 'Payment', date: '2026-06-30', amount: -100 }),
    ]),
    { ...RULES, cylExchange: false },
  );
  assert.equal(res.ties.filter((t) => t.rule === 'BATCH_SUM').length, 0);
});

test('CYL_EXCHANGE: unequal deposit/empties stretches that return to R0.00 close; the outstanding middle stays open', () => {
  const res = matchProjection(
    projection([
      row({ doc: '41523', date: '2025-03-15', lane: 'CYL', amount: 2932.5 }),
      row({ doc: '12081', type: 'Crd Note', date: '2025-03-17', lane: 'CYL', amount: -2415 }),
      row({ doc: '12082', type: 'Crd Note', date: '2025-03-17', lane: 'CYL', amount: -517.5 }),
      row({ doc: '15128', type: 'Crd Note', date: '2026-06-26', lane: 'CYL', amount: -4140 }),
      row({ doc: '51527', date: '2026-07-02', lane: 'CYL', amount: 3622.5 }),
      row({ doc: '15166', type: 'Crd Note', date: '2026-07-03', lane: 'CYL', amount: -2415 }),
      row({ doc: '15254', type: 'Crd Note', date: '2026-07-13', lane: 'CYL', amount: -1207.5 }),
    ]),
  );
  const ex = res.ties.filter((t) => t.rule === 'CYL_EXCHANGE');
  assert.equal(ex.length, 2);
  assert.ok(ex.every((t) => t.confidence === 'CONFIRMED' && t.net === 0));
  assert.equal(res.residual.unmatchedCredits.count, 1);
  assert.equal(res.residual.unmatchedCredits.amount, -4140);
  assert.ok(res.proof.holds);
});

test('BALANCE_ZERO: rows up to the ERP balance\'s latest return to zero settle together; probable ties before it dissolve', () => {
  const rows = [
    row({ doc: 'I1', date: '2026-01-01', amount: 100 }),
    row({ doc: 'I2', date: '2026-01-02', amount: 200 }),
    row({ doc: 'P1', type: 'Payment', date: '2026-01-10', amount: -150 }),
    row({ doc: 'P2', type: 'Payment', date: '2026-01-11', amount: -150.01 }),
    row({ doc: 'I3', date: '2026-02-01', amount: 500 }),
  ];
  rows.forEach((r, i) => (r.txt_line = i + 2));
  const res = matchProjection(projection(rows));
  const t = res.ties.find((x) => x.rule === 'BALANCE_ZERO');
  assert.equal(t.confidence, 'CONFIRMED');
  assert.equal(t.throughLine, 5);
  assert.equal(t.erpBalanceAtCut, -0.01);
  assert.equal(res.residual.openInvoicesLpgOther.count, 1); // I3 only
  assert.equal(res.unallocatedPayments.length, 0);
  assert.ok(res.proof.holds);
  const off = matchProjection(projection(rows), { ...RULES, balanceZeroCut: false });
  assert.equal(off.ties.filter((x) => x.rule === 'BALANCE_ZERO').length, 0);
});
