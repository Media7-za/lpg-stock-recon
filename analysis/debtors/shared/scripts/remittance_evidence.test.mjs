/**
 * Contract tests for remittance evidence (P11, PROPOSED — NOT RATIFIED): advice parsing,
 * evidence building, and the REMITTANCE rule in projection_matcher.mjs.
 * Advice text mirrors MD0003 raw/Remittances/02.03.2026.pdf (pdftotext -layout).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { parseCodRemittanceText, buildRemittanceEvidence } from './remittance_evidence.mjs';
import { matchProjection } from './projection_matcher.mjs';

const ADVICE = `                              BLUFF MEAT SUPPLY (PTY) LTD
                                C O D REMITTANCE ADVICE
                                                           Date:                     02/03/2026
        466 GREYLING STREET                                Payment Reference         000000000020326043
        Invoice Date           Document Number   Gross Amount      Discount Amount       Payment Amount
        19/01/2026             48737                   3,378.27                0.00                3,378.27
        19/01/2026             48784                   2,252.80                0.00                2,252.80
        19/01/2026             48906                   3,403.01                0.00                3,403.01
        19/01/2026             48919                   4,869.09                0.00                4,869.09
        19/01/2026             48927                   5,462.50                0.00                5,462.50
        19/01/2026             C/N 14328              -5,520.00                0.00               -5,520.00
                                       Total         13,845.67                 0.00               13,845.67
Status : Posted`;

test('parses a C O D remittance advice, including credit-note lines', () => {
  const p = parseCodRemittanceText(ADVICE);
  assert.equal(p.remittanceDate, '2026-03-02');
  assert.equal(p.paymentReference, '000000000020326043');
  assert.equal(p.lines.length, 6);
  assert.deepEqual(p.lines[5], { invoiceDate: '2026-01-19', docType: 'Crd Note', doc: '14328', gross: -5520, discount: 0, paid: -5520 });
  assert.deepEqual(p.total, { gross: 13845.67, discount: 0, paid: 13845.67 });
});

test('returns null for documents that are not remittance advices (e.g. AP ledgers)', () => {
  assert.equal(parseCodRemittanceText('BLUFF MEAT SUPPLY  Vendor Total: 110,417.22'), null);
});

function tmpAccount(manifest) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'remit-'));
  fs.mkdirSync(path.join(dir, 'data'));
  fs.mkdirSync(path.join(dir, 'raw'));
  fs.writeFileSync(path.join(dir, 'raw/advice.pdf'), 'stub');
  fs.writeFileSync(path.join(dir, 'data/remittance_manifest_2026.json'), JSON.stringify(manifest));
  fs.writeFileSync(path.join(dir, 'data/remittance_manifest_2023.json'), '{ "broken": true "x": 1 }');
  return dir;
}
const batch = (o = {}) => ({ batchId: 'RM-2026-03-02', erpPaymentDoc: '43494', remittanceTotal: 13845.67, lineCount: 6, file: 'raw/advice.pdf', ...o });

test('evidence: PDF lines accepted only when they reconcile; malformed manifests are skipped, not fatal', () => {
  const ok = buildRemittanceEvidence(tmpAccount({ batches: [batch()] }), { extract: () => ADVICE });
  assert.equal(ok.batches.length, 1);
  assert.equal(ok.batches[0].source.method, 'pdf-extract');
  assert.match(ok.skipped[0].reason, /unreadable JSON/);
  const bad = buildRemittanceEvidence(tmpAccount({ batches: [batch({ remittanceTotal: 13000 })] }), { extract: () => ADVICE });
  assert.equal(bad.batches.length, 0);
  assert.match(bad.skipped.find((s) => s.batchId).reason, /do not reconcile/);
});

test('evidence: batches in an unsupported manifest schema are skipped, never emitted with nulls', () => {
  const snake = { batch_id: 'BATCH-2024-03-26', erp_payment_doc: '00029684', cash_amount: 73610.18 };
  const out = buildRemittanceEvidence(tmpAccount({ batches: [snake] }), { extract: () => ADVICE });
  assert.equal(out.batches.length, 0);
  const s = out.skipped.find((x) => x.batchId === 'BATCH-2024-03-26');
  assert.match(s.reason, /unsupported manifest schema/);
});

let n = 0;
const row = (o) => ({
  row_id: `${o.doc}|${o.type || 'Invoice'}|${o.lane || 'LPG'}|L${++n}`,
  clean_doc: o.doc,
  entry_type: o.type || 'Invoice',
  kind: { Invoice: 'invoice', 'Crd Note': 'credit_note' }[o.type || 'Invoice'] || 'payment',
  date: o.date || '2026-01-19',
  ref_no: '',
  lane: o.lane || 'LPG',
  amount: o.amount,
  split_basis: 'DB_LINES',
  confirmable: true,
});
const proj = (rows) => {
  const closing = Math.round(rows.reduce((s, r) => s + r.amount, 0) * 100) / 100;
  return { rows, openings: { combinedBf: 0 }, closings: { combined: closing }, source: { erpCurrentBalance: closing } };
};
const ev = (lines, cash, paymentDoc = 'P1') => ({ batches: [{ batchId: 'B1', paymentDoc, cash, lines, source: { method: 'test' } }] });
const L = (doc, gross, docType = 'Invoice', discount = 0) => ({ doc, docType, gross, discount, paid: Math.round((gross - discount) * 100) / 100 });

test('REMITTANCE ties payment to every named doc (CYL included) and is CONFIRMED when lines agree', () => {
  const rows = [
    row({ doc: 'I1', amount: 3866.45 }),
    row({ doc: 'I2', lane: 'CYL', amount: 3105 }),
    row({ doc: 'P1', type: 'Payment', date: '2026-02-01', amount: -6971.45 }),
  ];
  const res = matchProjection(proj(rows), undefined, ev([L('I1', 3866.45), L('I2', 3105)], 6971.45));
  assert.equal(res.ties[0].rule, 'REMITTANCE');
  assert.equal(res.ties[0].confidence, 'CONFIRMED');
  assert.equal(res.ties[0].members.length, 3);
  assert.equal(res.proof.holds, true);
});

test('line amounts that differ from ERP make the batch PROBABLE with discrepancies listed', () => {
  const rows = [
    row({ doc: '48784', amount: 2252.18 }),
    row({ doc: '48906', amount: 3403.63 }),
    row({ doc: 'P1', type: 'Payment', date: '2026-03-02', amount: -5655.81 }),
  ];
  const res = matchProjection(proj(rows), undefined, ev([L('48784', 2252.8), L('48906', 3403.01)], 5655.81));
  assert.equal(res.ties[0].confidence, 'PROBABLE');
  assert.deepEqual(res.ties[0].lineDiscrepancies.map((d) => d.diff), [0.62, -0.62]);
});

test('missing documents or a non-reconciling total leave the batch unresolved (never forced)', () => {
  const rows = [row({ doc: 'I1', amount: 100 }), row({ doc: 'P1', type: 'Payment', amount: -250 })];
  const a = matchProjection(proj(rows), undefined, ev([L('I1', 100), L('I9', 150)], 250));
  assert.match(a.remittance.unresolved[0].reason, /not available: Invoice I9/);
  const b = matchProjection(proj(rows), undefined, ev([L('I1', 100)], 100));
  assert.match(b.remittance.unresolved[0].reason, /≠ payment/);
  const c = matchProjection(proj(rows), undefined, ev([L('I1', 100)], 100, 'P404'));
  assert.match(c.remittance.unresolved[0].reason, /not in projection/);
});

test('settlement discounts are carried as discountPending, separate from rounding (P9)', () => {
  const rows = [row({ doc: 'I1', amount: 1000 }), row({ doc: 'P1', type: 'Payment', date: '2026-02-01', amount: -975 })];
  const res = matchProjection(proj(rows), undefined, ev([L('I1', 1000, 'Invoice', 25)], 975));
  assert.equal(res.ties[0].confidence, 'CONFIRMED');
  assert.equal(res.ties[0].discountPending, 25);
  assert.equal(res.residual.discountJournalsPending, 25);
  assert.equal(res.proof.holds, true);
});

test('remittance outranks pattern rules: a named invoice is not available to proximity/sum guesses', () => {
  const rows = [
    row({ doc: 'I1', amount: 500 }),
    row({ doc: 'P1', type: 'Payment', date: '2026-02-01', amount: -500 }),
    row({ doc: 'P0', type: 'Payment', date: '2026-01-25', amount: -500 }),
  ];
  const res = matchProjection(proj(rows), undefined, ev([L('I1', 500)], 500));
  assert.equal(res.ties.length, 1);
  assert.equal(res.ties[0].payment.doc, 'P1');
  assert.equal(res.summary.paymentsUnallocated, 1);
});
