import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildInternalLedger, renderInternalLedgerMarkdown } from './internal_ledger.mjs';

const proj = {
  openings: { combinedBf: 0 },
  source: { erpCurrentBalance: 500 },
  rows: [
    { row_id: 'I1', clean_doc: 'I1', entry_type: 'Invoice', kind: 'invoice', date: '2026-01-01', ref_no: 'DN#1', txt_line: 2, lane: 'LPG', amount: 100 },
    { row_id: 'P1', clean_doc: 'P1', entry_type: 'Payment', kind: 'payment', date: '2026-01-05', ref_no: '', txt_line: 3, lane: 'LPG', amount: -100 },
    { row_id: 'I2', clean_doc: 'I2', entry_type: 'Invoice', kind: 'invoice', date: '2026-02-01', ref_no: 'DN#2', txt_line: 4, lane: 'LPG', amount: 500 },
  ],
};
const matches = {
  matcherVersion: 5,
  summary: { confirmed: 1, probable: 0 },
  proof: { holds: true, rebuiltClosing: 500, projectionClosing: 500, erpCurrentBalance: 500 },
  ties: [{ tie_id: 'T0001', rule: 'EXACT_SINGLE', confidence: 'CONFIRMED', members: ['I1', 'P1'], docs: ['Invoice I1', 'Payment P1'], net: 0 }],
};

test('internal ledger lists every row with ERP running balance, tie status and zero markers', () => {
  const model = buildInternalLedger(proj, matches);
  assert.deepEqual(model.rows.map((r) => r.running), [100, 0, 500]);
  assert.equal(model.rows[1].zero, true);
  const md = renderInternalLedgerMarkdown(model, { cfg: { debtorName: 'X', debtorCode: 'X1' }, projection: proj, matches, generatedOn: '2026-10-09' });
  assert.match(md, /T0001 EXACT_SINGLE ✓ ↔ Inv I1 ◀ ZERO/);
  assert.match(md, /\| I2 \| DN#2 \| LPG \| 500.00 \| 500.00 \| OPEN \|/);
  assert.match(md, /Opening balance \(ERP running\): \*\*R0.00\*\*/);
});
