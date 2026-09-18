// DTRX-header statement reconstruction — JAY000 is the fixture.
//
// Boundary: reconstruct running total + open invoices from transaction_headers
// when no DEBENQ TXT exists. Must never treat the reconstructed sum as a
// DEBENQ CURRENT BALANCE.
//
// Run: node --test analysis/debtors/shared/scripts/dtrx_header_statement.test.mjs

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  headersToStatementRows,
  generateFromEvidence,
  detectTaggingAnomalies,
  summariseItems,
  headerGross,
  parseObjectCsv,
  SOURCE_KIND,
} from './dtrx_header_statement.mjs';
import { computeOpenInvoices, round2 } from './debenq_open_invoices.mjs';

function h(o) {
  return {
    account_no: 'JAY000',
    account_name: 'JAYZ GRILL',
    entry_type: 'Invoice',
    period: 18,
    doc_no: '',
    ref_no: '',
    description: '',
    tx_date: '2026-08-18',
    amount_excl: 0,
    tax_amount: 0,
    source_file: 'DTRX.TXT',
    ...o,
  };
}

function item(o) {
  return {
    account_no: 'JAY000',
    entry_type: 'Invoice',
    doc_no: '',
    stock_no: 'S.4',
    product_group: 'LPG',
    tx_date: '2026-08-18',
    qty: 5,
    retail_price: 1205.23,
    line_tax: 903.92,
    reference: '',
    ...o,
  };
}

/** Live JAY000 DTRX headers as of 2026-09-08 pull. */
const JAY000_HEADERS = [
  h({ doc_no: '00052631', ref_no: '00052631', description: 'DN#24274', amount_excl: 6026.15, tax_amount: 903.92, source_file: 'DTRX1808.TXT' }),
  h({ doc_no: '00052632', ref_no: '00052632', description: 'DN#24274-EMPTY', amount_excl: 5250, tax_amount: 787.5, source_file: 'DTRX1808.TXT' }),
  h({ entry_type: 'Crd Note', doc_no: '00015509', ref_no: '00052631', description: 'DN#24274', amount_excl: -6026.15, tax_amount: -903.92, source_file: 'DTRX2008.TXT' }),
  h({ entry_type: 'Crd Note', doc_no: '00015510', ref_no: '00052632', description: 'DN#24274-EMPTY', amount_excl: -5250, tax_amount: -787.5, source_file: 'DTRX2008.TXT' }),
  h({ doc_no: '00052688', ref_no: '00052688', description: 'DN#24274', amount_excl: 11276.15, tax_amount: 1691.42, source_file: 'DTRX2008.TXT' }),
  h({ doc_no: '00052793', ref_no: '00052793', description: 'DN#23979', tx_date: '2026-08-25', amount_excl: 6026.15, tax_amount: 903.92, source_file: 'DETRANS.TXT' }),
  h({ doc_no: '00052794', ref_no: '00052794', description: 'DN#23979-EMPTY', tx_date: '2026-08-25', amount_excl: 5250, tax_amount: 787.5, source_file: 'DETRANS.TXT' }),
  h({ entry_type: 'Crd Note', doc_no: '00015552', ref_no: '00052794', description: 'DN#23979-EMPTY', tx_date: '2026-08-26', amount_excl: -5250, tax_amount: -787.5, source_file: 'DTRX2608.TXT' }),
  h({ entry_type: 'Crd Note', period: 19, doc_no: '00015594', ref_no: '00052793', description: 'DN#24950 EMPTIES', tx_date: '2026-09-03', amount_excl: -5250, tax_amount: -787.5, source_file: 'DTRX0309.TXT' }),
];

const JAY000_ITEMS = [
  item({ doc_no: '00052631', stock_no: 'S.4', product_group: 'LPG', qty: 5, retail_price: 1205.23, line_tax: 903.92, reference: 'DN#24274' }),
  item({ doc_no: '00052632', stock_no: 'S.1', product_group: 'CYL', qty: 5, retail_price: 1050, line_tax: 787.5, reference: 'DN#24274-EMPTY' }),
  item({ entry_type: 'Crd Note', doc_no: '00015509', stock_no: 'S.4', product_group: 'LPG', qty: -5, retail_price: 1205.23, line_tax: 903.92, reference: 'DN#24274' }),
  item({ entry_type: 'Crd Note', doc_no: '00015510', stock_no: 'S.1', product_group: 'CYL', qty: -5, retail_price: 1050, line_tax: 787.5, reference: 'DN#24274-EMPTY' }),
  item({ doc_no: '00052688', stock_no: 'S.1', product_group: 'CYL', qty: 5, retail_price: 1050, line_tax: 787.5, reference: 'DN#24274' }),
  item({ doc_no: '00052688', stock_no: 'S.4', product_group: 'LPG', qty: 5, retail_price: 1205.23, line_tax: 903.92, reference: 'DN#24274' }),
  item({ doc_no: '00052793', stock_no: 'S01', product_group: 'LPG', tx_date: '2026-08-25', qty: 5, retail_price: 1205.23, line_tax: 903.92, reference: 'DN#23979' }),
  item({ doc_no: '00052794', stock_no: 'S.1', product_group: 'CYL', tx_date: '2026-08-25', qty: 5, retail_price: 1050, line_tax: 787.5, reference: 'DN#23979-EMPTY' }),
  item({ entry_type: 'Crd Note', doc_no: '00015552', stock_no: 'S.1', product_group: 'CYL', tx_date: '2026-08-26', qty: -5, retail_price: 1050, line_tax: 787.5, reference: 'DN#23979-EMPTY' }),
  item({ entry_type: 'Crd Note', doc_no: '00015594', stock_no: 'S.1', product_group: 'CYL', tx_date: '2026-09-03', qty: -5, retail_price: 1050, line_tax: 787.5, reference: 'DN#24950 EMPTIES' }),
];

const cfg = {
  debtorCode: 'JAY000',
  customerName: 'JAYZ GRILL',
  businessHeader: ['BELLA ENERGY SERVICES300 (PTY) LTD T/A GAZ EXPRESS'],
  headersCsv: 'analysis/debtors/JAY000/data/dtrx_headers.csv',
  itemsCsv: 'analysis/debtors/JAY000/data/dtrx_items.csv',
};

describe('headersToStatementRows', () => {
  test('JAY000 reconstructed total is R13,860.14', () => {
    const { reconstructedBalance, rows } = headersToStatementRows(JAY000_HEADERS);
    assert.equal(reconstructedBalance, 13860.14);
    assert.equal(rows.length, 9);
    assert.equal(rows[rows.length - 1].runningBalance, 13860.14);
  });

  test('invoices before credit notes on the same date (LANE_1 intraday)', () => {
    const { rows } = headersToStatementRows(JAY000_HEADERS);
    const aug18 = rows.filter((r) => r.iso === '2026-08-18').map((r) => r.entry);
    const firstCn = aug18.indexOf('Crd Note');
    const lastInv = aug18.lastIndexOf('Invoice');
    assert.ok(firstCn > lastInv, `expected invoices before CNs, got ${aug18.join(',')}`);
  });

  test('CN INVNO is header ref_no, not the CN document', () => {
    const { rows } = headersToStatementRows(JAY000_HEADERS);
    const cn15594 = rows.find((r) => r.cleanDoc === '15594');
    assert.equal(cn15594.invno, '52793');
    const inv52688 = rows.find((r) => r.cleanDoc === '52688');
    assert.equal(inv52688.invno, '');
  });
});

describe('open invoices from DTRX tagging', () => {
  test('52688 remains fully open; 52793 nets to R892.57 after CYL CN 15594', () => {
    const { rows } = headersToStatementRows(JAY000_HEADERS);
    const open = computeOpenInvoices(rows);
    assert.deepEqual(
      open.map((i) => ({ doc: i.cleanDoc || i.key, due: i.due })),
      [
        { doc: '52688', due: 12967.57 },
        { doc: '52793', due: 892.57 },
      ],
    );
  });

  test('open list ties the reconstructed header total', () => {
    const { rows, reconstructedBalance } = headersToStatementRows(JAY000_HEADERS);
    const open = computeOpenInvoices(rows);
    const sum = round2(open.reduce((s, i) => s + i.due, 0));
    assert.equal(sum, reconstructedBalance);
  });

  test('fully reversed EMPTY pair 52794/15552 is not open', () => {
    const { rows } = headersToStatementRows(JAY000_HEADERS);
    const open = computeOpenInvoices(rows);
    assert.equal(open.some((i) => (i.cleanDoc || i.key) === '52794'), false);
    assert.equal(open.some((i) => (i.cleanDoc || i.key) === '52631'), false);
  });
});

describe('item split and tagging anomaly', () => {
  test('LPG net R13,860.14 and CYL net R0.00 — items tie headers', () => {
    const { lpgNet, cylNet } = summariseItems(JAY000_ITEMS);
    assert.equal(lpgNet, 13860.14);
    assert.equal(cylNet, 0);
    const { reconstructedBalance } = headersToStatementRows(JAY000_HEADERS);
    assert.equal(round2(lpgNet + cylNet), reconstructedBalance);
  });

  test('52688 is a mixed LPG+CYL header', () => {
    const { byDoc } = summariseItems(JAY000_ITEMS);
    const mixed = byDoc.get('52688');
    assert.equal(mixed.groups.LPG, 6930.07);
    assert.equal(mixed.groups.CYL, 6037.5);
  });

  test('CN 15594 (CYL) tagged to LPG invoice 52793 is flagged', () => {
    const anomalies = detectTaggingAnomalies(JAY000_HEADERS, JAY000_ITEMS);
    assert.equal(anomalies.length, 1);
    assert.equal(anomalies[0].cnDoc, '15594');
    assert.equal(anomalies[0].targetInv, '52793');
    assert.equal(anomalies[0].cnGroup, 'CYL');
    assert.equal(anomalies[0].invGroup, 'LPG');
  });
});

describe('committed JAY000 evidence CSVs', () => {
  test('exported headers reconstruct to the same total as the fixture', () => {
    const csv = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../JAY000/data/dtrx_headers.csv',
    );
    assert.equal(fs.existsSync(csv), true);
    const headers = parseObjectCsv(csv);
    const { reconstructedBalance } = headersToStatementRows(headers);
    assert.equal(headers.length, 9);
    assert.equal(reconstructedBalance, 13860.14);
  });
});

describe('generateFromEvidence', () => {
  test('statement is labelled internal DTRX reconstruction, not DEBENQ', () => {
    const out = generateFromEvidence({
      headers: JAY000_HEADERS,
      items: JAY000_ITEMS,
      cfg,
      asAtIso: '2026-09-08',
    });
    assert.equal(out.reconstructedBalance, 13860.14);
    assert.equal(out.tagCoverage.gate, 'ALLOWED');
    assert.match(out.statementMd, /INTERNAL DRAFT/);
    assert.match(out.statementMd, /ASSERTED/);
    assert.match(out.statementMd, /not \*\*PROVEN\*\* from an ERP `CURRENT BALANCE`/);
    assert.match(out.statementMd, /13,860\.14/);
    assert.match(out.statementMd, /15594/);
    assert.match(out.reconstructedTxt, /RECONSTRUCTED FROM DTRX/);
    assert.equal(SOURCE_KIND, 'dtrx_headers');
    assert.equal(out.itemHeaderVariance, 0);
  });

  test('does not claim a DEBENQ CURRENT BALANCE figure', () => {
    const out = generateFromEvidence({
      headers: JAY000_HEADERS,
      items: JAY000_ITEMS,
      cfg,
      asAtIso: '2026-09-08',
    });
    assert.doesNotMatch(out.statementMd, /PROVEN — DEBENQ CURRENT BALANCE/);
    assert.match(out.statementMd, /not DEBENQ CURRENT BALANCE/);
  });

  test('headerGross uses excl \+ tax', () => {
    assert.equal(headerGross({ amount_excl: 6026.15, tax_amount: 903.92 }), 6930.07);
  });
});
