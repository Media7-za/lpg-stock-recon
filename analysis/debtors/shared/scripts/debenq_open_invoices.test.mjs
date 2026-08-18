// Invoice-tag coverage contract tests.
//
// Boundary under test: how far an open-invoice list reconstructed from ERP
// INVNO tagging can be trusted. No financial truth (the ERP CURRENT BALANCE
// header remains ground truth), no collections eligibility, no ingest health.
//
// The TWK002 case below is a permanent regression fixture: invoices 42468 and
// 42470 were settled 30/05/2025 by an untagged payment slice and sat on the
// customer statement for 15 months before being caught by hand on 2026-08-11.
// Any change that lets that shape pass the gate is a regression.
//
// Run: node --test analysis/debtors/shared/scripts/debenq_open_invoices.test.mjs

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeOpenInvoices,
  findUntaggedCredits,
  analyseInvoiceTagCoverage,
  measureTaggingCoverage,
  GATE_MEANING,
  REMEDY,
} from './debenq_open_invoices.mjs';

const row = (o) => ({ docno: '', cleanDoc: '', entry: '', iso: '', invno: '', dn: '', amount: 0, runningBalance: 0, ...o });

const invoice = (doc, iso, amount) =>
  row({ docno: doc, cleanDoc: String(Number(doc)), entry: 'Invoice', iso, amount });
const taggedPayment = (doc, iso, invno, amount) =>
  row({ docno: doc, cleanDoc: String(Number(doc)), entry: 'Payment', iso, invno: String(Number(invno)), amount });
const untaggedPayment = (doc, iso, amount) =>
  row({ docno: doc, cleanDoc: String(Number(doc)), entry: 'Payment', iso, amount });

function analyse(rows, opts = {}) {
  const closedOverrides = opts.closedOverrides || [];
  const openInvoices = computeOpenInvoices(rows, closedOverrides);
  return analyseInvoiceTagCoverage({ rows, openInvoices, closedOverrides, ...opts });
}

describe('computeOpenInvoices', () => {
  test('a tagged payment closes its invoice', () => {
    const rows = [invoice('1000', '2026-01-10', 500), taggedPayment('2000', '2026-02-10', '1000', -500)];
    assert.deepEqual(computeOpenInvoices(rows), []);
  });

  test('an untagged payment does NOT close any invoice — the whole problem in one test', () => {
    const rows = [invoice('1000', '2026-01-10', 500), untaggedPayment('2000', '2026-02-10', -500)];
    const open = computeOpenInvoices(rows);
    assert.equal(open.length, 1);
    assert.equal(open[0].due, 500);
  });

  test('closedInvoiceOverrides remove a ratified invoice from the open list', () => {
    const rows = [invoice('1000', '2026-01-10', 500), untaggedPayment('2000', '2026-02-10', -500)];
    assert.deepEqual(computeOpenInvoices(rows, [{ doc: '1000', reason: 'proven paid' }]), []);
  });
});

describe('findUntaggedCredits', () => {
  test('picks up payments and credit notes carrying no invno', () => {
    const rows = [
      untaggedPayment('2000', '2026-02-10', -500),
      row({ docno: '3000', cleanDoc: '3000', entry: 'Crd Note', iso: '2026-02-11', amount: -100 }),
      taggedPayment('2001', '2026-02-12', '1000', -200),
      invoice('1000', '2026-01-10', 500),
    ];
    const found = findUntaggedCredits(rows);
    assert.equal(found.length, 2);
    assert.deepEqual(found.map((f) => f.docno).sort(), ['2000', '3000']);
  });

  test('a debit (positive) row is never treated as a credit', () => {
    const rows = [row({ docno: '4000', cleanDoc: '4000', entry: 'Journal', iso: '2026-02-10', amount: 250 })];
    assert.deepEqual(findUntaggedCredits(rows), []);
  });
});

describe('invariant — Σ(open invoices) ≤ ERP CURRENT BALANCE', () => {
  test('breach is BLOCKED and reports the shortfall', () => {
    const rows = [invoice('1000', '2026-01-10', 500), invoice('1001', '2026-01-20', 500)];
    const res = analyse(rows, { headerBalance: 900 });
    assert.equal(res.invariant.status, 'BREACHED');
    assert.equal(res.invariant.overstated_by, 100);
    assert.equal(res.gate, 'BLOCKED');
  });

  test('list totalling less than the header passes — under-statement is not over-billing', () => {
    const rows = [invoice('1000', '2026-01-10', 500)];
    const res = analyse(rows, { headerBalance: 900 });
    assert.equal(res.invariant.status, 'PASS');
    assert.equal(res.gate, 'ALLOWED');
  });

  test('no header in the TXT leaves the invariant UNVERIFIED rather than silently passing', () => {
    const rows = [invoice('1000', '2026-01-10', 500)];
    const res = analyse(rows, { headerBalance: NaN });
    assert.equal(res.invariant.status, 'UNVERIFIED');
  });
});

describe('LIKELY_PAID — remittance evidence contradicts the open list', () => {
  test('an invoice the customer says they paid, still showing open, blocks release', () => {
    const rows = [invoice('42468', '2025-04-23', 7713.58), untaggedPayment('39080', '2025-05-30', -7713.58)];
    const res = analyse(rows, {
      headerBalance: 7713.58,
      remittanceDocs: new Map([['42468', { batches: ['BATCH-2025-05-31'], sources: ['remittance_lines_2025.csv'] }]]),
    });
    assert.equal(res.counts.likely_paid, 1);
    assert.equal(res.gate, 'BLOCKED');
    assert.match(res.invoices[0].basis, /BATCH-2025-05-31/);
  });

  test('once ratified into closedInvoiceOverrides the same account is ALLOWED', () => {
    const rows = [invoice('42468', '2025-04-23', 7713.58), untaggedPayment('39080', '2025-05-30', -7713.58)];
    const res = analyse(rows, {
      headerBalance: 7713.58,
      closedOverrides: [{ doc: '42468', reason: 'STAT 114 remittance' }],
      remittanceDocs: new Map([['42468', { batches: ['BATCH-2025-05-31'], sources: [] }]]),
    });
    assert.equal(res.gate, 'ALLOWED');
    assert.equal(res.ratified_closed.length, 1);
  });
});

describe('STALE_OPEN — invoice marooned behind a long payment gap', () => {
  // The TWK002 shape: two Apr 2025 invoices, then nothing open until Feb 2026.
  // Ten months of invoices in between were raised and settled, so a customer
  // paying oldest-first cannot credibly have left the Apr 2025 pair open.
  const maroonedRows = [
    invoice('42468', '2025-04-23', 7713.58),
    invoice('42470', '2025-04-23', 1236.86),
    untaggedPayment('39080', '2025-05-30', -15365.65),
    invoice('49208', '2026-02-12', 13468.47),
    invoice('49606', '2026-03-06', 8277.21),
    invoice('49882', '2026-03-24', 8858.97),
  ];

  test('the marooned pair is flagged even with no remittance CSV available', () => {
    const res = analyse(maroonedRows, { headerBalance: 100000 });
    const flagged = res.invoices.filter((i) => i.risk === 'STALE_OPEN').map((i) => i.doc);
    assert.deepEqual(flagged.sort(), ['42468', '42470']);
    assert.equal(res.gate, 'REVIEW_REQUIRED');
  });

  test('the live monthly cluster is left CLEAR — the check must not flag the whole list', () => {
    const res = analyse(maroonedRows, { headerBalance: 100000 });
    const clear = res.invoices.filter((i) => i.risk === 'CLEAR').map((i) => i.doc);
    assert.deepEqual(clear.sort(), ['49208', '49606', '49882']);
  });

  test('a contiguous monthly cluster with untagged credits throughout stays ALLOWED', () => {
    // A batch payer posts untagged credits constantly. That alone must never
    // flag anything, or the gate is noise and gets ignored.
    const rows = [
      invoice('49208', '2026-02-12', 13468.47),
      untaggedPayment('43500', '2026-02-25', -10000),
      invoice('49606', '2026-03-06', 8277.21),
      untaggedPayment('43600', '2026-03-25', -10000),
      invoice('49882', '2026-03-24', 8858.97),
      untaggedPayment('43700', '2026-04-25', -10000),
    ];
    const res = analyse(rows, { headerBalance: 100000 });
    assert.equal(res.gate, 'ALLOWED');
    assert.equal(res.counts.stale_open, 0);
    assert.ok(res.untagged_credits.length === 3, 'untagged credits are still reported as context');
  });

  test('an invoice with no untagged credit after it is never stale — nothing could have cleared it', () => {
    const rows = [invoice('1000', '2025-01-10', 500), invoice('2000', '2026-06-10', 500)];
    const res = analyse(rows, { headerBalance: 1000 });
    assert.equal(res.counts.stale_open, 0);
    assert.equal(res.gate, 'ALLOWED');
  });

  test('staleGapDays is tunable per account rhythm', () => {
    const rows = [
      invoice('1000', '2026-01-10', 500),
      untaggedPayment('9000', '2026-02-01', -500),
      invoice('2000', '2026-03-20', 500),
    ];
    assert.equal(analyse(rows, { headerBalance: 1000, staleGapDays: 30 }).counts.stale_open, 1);
    assert.equal(analyse(rows, { headerBalance: 1000, staleGapDays: 120 }).counts.stale_open, 0);
  });
});

describe('export quality — an export taken without allocation detail', () => {
  // 8 of 10 portfolio exports were taken with "EXCLUDE: ALLOCATION DETAIL"
  // (2026-08-11 sweep) — a deliberate posture, since the omitted INVNO column
  // is the untrustworthy one (business_rules.md §3). Nothing names an invoice,
  // so no open list is derivable from the TXT alone, and the answer is to use
  // the allocation lane. It must never be reported as if individual invoices
  // were suspicious, nor as an export defect that re-exporting would cure.
  const rows = [
    invoice('1000', '2026-01-10', 500),
    untaggedPayment('9001', '2026-01-20', -100),
    untaggedPayment('9002', '2026-02-20', -100),
    untaggedPayment('9003', '2026-03-20', -100),
    untaggedPayment('9004', '2026-04-20', -100),
    untaggedPayment('9005', '2026-05-20', -100),
  ];

  test('the declared EXCLUDE header yields NOT_DERIVABLE_FROM_TXT', () => {
    const res = analyse(rows, { headerBalance: 0, excludesAllocationDetail: true });
    assert.equal(res.gate, 'NOT_DERIVABLE_FROM_TXT');
    assert.equal(res.blocking_reason, 'NO_INVOICE_TAGGING_IN_EXPORT');
    assert.equal(res.export_quality, 'NO_ALLOCATION_DETAIL');
  });

  test('the remedy points at the allocation lane, not at re-exporting', () => {
    const res = analyse(rows, { headerBalance: 0, excludesAllocationDetail: true });
    const remedy = REMEDY[res.blocking_reason];
    assert.match(remedy, /allocation lane/i);
    assert.match(remedy, /do not assume a re-export is the answer/i);
    assert.match(remedy, /only Crd Note tagging/i, 'must say what a re-export does and does not recover');
  });

  test('is detected behaviourally too, when no settlement row names an invoice', () => {
    const res = analyse(rows, { headerBalance: 0, excludesAllocationDetail: false });
    assert.equal(res.gate, 'NOT_DERIVABLE_FROM_TXT');
  });

  test('every invoice is UNASSESSABLE, never dressed up as a per-invoice suspicion', () => {
    const res = analyse(rows, { headerBalance: 0, excludesAllocationDetail: true });
    assert.equal(res.counts.unassessable, 1);
    assert.equal(res.counts.stale_open, 0);
    assert.equal(res.counts.likely_paid, 0);
  });

  test('the invariant is NOT_APPLICABLE — comparing a phantom list to the balance is meaningless', () => {
    const res = analyse(rows, { headerBalance: 0, excludesAllocationDetail: true });
    assert.equal(res.invariant.status, 'NOT_APPLICABLE');
    assert.equal(res.invariant.overstated_by, 0);
  });

  test('an export WITH tagging is never mistaken for a defective one', () => {
    const tagged = [invoice('1000', '2026-01-10', 500), taggedPayment('9001', '2026-02-10', '1000', -500)];
    const res = analyse(tagged, { headerBalance: 0 });
    assert.equal(res.export_quality, 'ALLOCATION_DETAIL_PRESENT');
    assert.equal(res.gate, 'ALLOWED');
  });

  test('tagging coverage is reported so partial tagging is visible', () => {
    const mixed = [
      invoice('1000', '2026-01-10', 500),
      taggedPayment('9001', '2026-02-10', '1000', -250),
      untaggedPayment('9002', '2026-02-11', -250),
    ];
    const res = analyse(mixed, { headerBalance: 250 });
    assert.equal(res.tagging.settlement_rows, 2);
    assert.equal(res.tagging.tagged_rows, 1);
    assert.equal(res.tagging.tagged_pct, 50);
  });
});

describe('tagging coverage is split by entry type', () => {
  // Crd Note tagging is broadly canonical (~90%, especially CYL deposit /
  // empty-return credits); Payment tagging is not trustworthy even when
  // present (business_rules.md §3). Reporting a single blended percentage
  // would hide that distinction and imply false reassurance.
  const rows = [
    invoice('1000', '2026-01-10', 1000),
    row({ docno: '5001', cleanDoc: '5001', entry: 'Crd Note', iso: '2026-01-11', invno: '1000', amount: -100 }),
    row({ docno: '5002', cleanDoc: '5002', entry: 'Crd Note', iso: '2026-01-12', invno: '1000', amount: -100 }),
    taggedPayment('9001', '2026-02-10', '1000', -100),
    untaggedPayment('9002', '2026-02-11', -100),
    untaggedPayment('9003', '2026-02-12', -100),
    untaggedPayment('9004', '2026-02-13', -100),
  ];

  test('credit note and payment tagging are counted separately', () => {
    const t = measureTaggingCoverage(rows);
    assert.equal(t.credit_note.rows, 2);
    assert.equal(t.credit_note.tagged, 2);
    assert.equal(t.credit_note.pct, 100);
    assert.equal(t.payment.rows, 4);
    assert.equal(t.payment.tagged, 1);
    assert.equal(t.payment.pct, 25);
  });

  test('the blended figure still reports, but never replaces the split', () => {
    const t = measureTaggingCoverage(rows);
    assert.equal(t.settlement_rows, 6);
    assert.equal(t.tagged_rows, 3);
    assert.equal(t.tagged_pct, 50);
    assert.ok(t.credit_note && t.payment, 'split must always be present alongside the blend');
  });

  test('an entry type with no rows reports null rather than a misleading 0%', () => {
    const t = measureTaggingCoverage([invoice('1000', '2026-01-10', 500)]);
    assert.equal(t.credit_note.rows, 0);
    assert.equal(t.credit_note.pct, null);
    assert.equal(t.payment.pct, null);
  });
});

describe('evidence basis is reported, so a clean gate is read correctly', () => {
  // Remittance advices exist for 3 accounts out of the portfolio; at the
  // 2026-08-11 sweep only TWK002 had them extracted into remittance_lines CSVs.
  // The remittance-contradiction check is therefore inert on almost every
  // account, and an ALLOWED there is a weaker claim than the same result on a
  // remittance-backed account. The gate must say so rather than imply parity.
  const rows = [invoice('1000', '2026-01-10', 500), taggedPayment('9001', '2026-02-10', '1000', -500)];

  test('with no remittance lines the basis is PATTERN_ONLY and the check is declared inert', () => {
    const res = analyse(rows, { headerBalance: 0 });
    assert.equal(res.evidence.basis, 'PATTERN_ONLY');
    assert.deepEqual(res.evidence.checks_inert, ['REMITTANCE_CONTRADICTION']);
    assert.ok(!res.evidence.checks_run.includes('REMITTANCE_CONTRADICTION'));
    assert.match(res.evidence.note, /pattern|business rules/i);
  });

  test('with remittance lines the basis is REMITTANCE_BACKED and nothing is inert', () => {
    const res = analyse(rows, {
      headerBalance: 0,
      remittanceDocs: new Map([['1000', { batches: ['BATCH-1'], sources: ['remittance_lines_2026.csv'] }]]),
    });
    assert.equal(res.evidence.basis, 'REMITTANCE_BACKED');
    assert.equal(res.evidence.remittance_invoice_docs, 1);
    assert.deepEqual(res.evidence.checks_inert, []);
    assert.ok(res.evidence.checks_run.includes('REMITTANCE_CONTRADICTION'));
    assert.equal(res.evidence.note, null);
  });

  test('the invariant and staleness checks run under either basis', () => {
    for (const opts of [{}, { remittanceDocs: new Map([['9999', { batches: [], sources: [] }]]) }]) {
      const res = analyse(rows, { headerBalance: 0, ...opts });
      assert.ok(res.evidence.checks_run.includes('INVARIANT'));
      assert.ok(res.evidence.checks_run.includes('STALENESS_ANOMALY'));
    }
  });
});

describe('ALLOWED is absence of contradiction, not proof', () => {
  // Guards against the gate being read as verification. ERP payment tagging is
  // not authoritative, so a clean gate cannot promise the list is correct — a
  // remittance advice can still overturn any line.
  test('the ALLOWED wording does not claim the list is verified or safe outright', () => {
    assert.match(GATE_MEANING.ALLOWED, /not proof|absence of evidence/i);
    assert.match(GATE_MEANING.ALLOWED, /remittance/i);
  });

  test('the ALLOWED wording directs the reader to the evidence basis', () => {
    assert.match(GATE_MEANING.ALLOWED, /PATTERN_ONLY/);
    assert.match(GATE_MEANING.ALLOWED, /REMITTANCE_BACKED/);
  });

  test('no remedy sends the reader to remittance advices as the only route', () => {
    // Most accounts have none and never will, so a remedy that assumes them is
    // unactionable there.
    for (const [reason, text] of Object.entries(REMEDY)) {
      if (reason === 'INVOICE_ON_REMITTANCE_STILL_OPEN') continue; // by definition advice-driven
      assert.match(text, /pattern|business_rules\.md §15|authority order B/i, `${reason} must offer a pattern route`);
    }
  });
});

describe('gate precedence', () => {
  test('hard evidence outranks the anomaly test: remittance proof yields BLOCKED, not REVIEW_REQUIRED', () => {
    const rows = [
      invoice('42468', '2025-04-23', 7713.58),
      untaggedPayment('39080', '2025-05-30', -1000),
      invoice('49208', '2026-02-12', 13468.47),
    ];
    const res = analyse(rows, {
      headerBalance: 100000,
      remittanceDocs: new Map([['42468', { batches: ['BATCH-2025-05-31'], sources: [] }]]),
    });
    assert.equal(res.gate, 'BLOCKED');
    assert.equal(res.invoices.find((i) => i.doc === '42468').risk, 'LIKELY_PAID');
  });

  test('an empty open list is ALLOWED, not an error', () => {
    const res = analyse([invoice('1000', '2026-01-10', 500), taggedPayment('2000', '2026-02-10', '1000', -500)], {
      headerBalance: 0,
    });
    assert.equal(res.gate, 'ALLOWED');
    assert.deepEqual(res.invoices, []);
  });
});
