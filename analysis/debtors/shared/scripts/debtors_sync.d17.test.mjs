// D17 collections-gate tests — DEBTORS_DOCTRINE.md §4 (D17), Collectable Rule §2.
//
// Run:  node --test analysis/debtors/shared/scripts/debtors_sync.d17.test.mjs
//
// Not under vitest: vitest.config.ts restricts include to src/**/*.{test,spec}.{ts,tsx},
// and widening it for one node script is broader than this turn's scope.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateProject, evaluateD17Gate } from './debtors_sync.mjs';

const d17 = (r) => r.eligibilityErrors.filter(e => e.startsWith('D17'));

/** Minimal valid non-collections account. */
function baseAccount(overrides = {}) {
  return {
    debtorCode: 'TST001',
    clientName: 'Test Account',
    status: 'active',
    reconState: 'complete',
    financials: {
      totalOutstanding: 10000.0,
      lastInvoiceDate: '2026-06-30',
      lastPaymentDate: '2026-07-01',
      agedDebt180Plus: 0.0,
    },
    collections: {
      actionRequired: false,
      actionType: null,
      dateSent: null,
      deadlineDate: null,
      nextAction: null,
      nextActionDate: null,
      notes: '',
    },
    history: [{ date: '2026-07-26', event: 'fixture' }],
    ...overrides,
  };
}

/** Collections account that satisfies all three D17 conditions. */
function eligibleCollectionsAccount(overrides = {}) {
  const a = baseAccount({ status: 'collection' });
  a.financials.totalOutstanding = 10000.0;
  a.financials.agedDebt180Plus = 10000.0;
  a.financials.collectable = {
    amount: 9000.0,
    erpBalance: 10000.0,
    ratifiedHoldsTotal: 1000.0,
    source: 'ERP RAW DATA/CURRENT.TXT',
    asAt: '2026-07-26',
    basis: 'PROVEN',
    operatorConfirmation: 'confirmed',
  };
  a.collections.actionRequired = true;
  a.collections.actionType = 'letter-of-demand';
  a.collections.blockers = [];
  return { ...a, ...overrides };
}

test('D17: collections-eligible account passes all three gates', () => {
  const r = validateProject('TST001', eligibleCollectionsAccount());
  assert.deepEqual(d17(r), [], 'expected no D17 eligibility errors');
  assert.deepEqual(r.errors, [], 'expected no projection-validity errors');
  assert.equal(evaluateD17Gate(eligibleCollectionsAccount()).blocked, false);
});

test('D17(c): reconState complete but a blocking dispute fails', () => {
  const a = eligibleCollectionsAccount();
  a.collections.blockers = [{ type: 'disputed-invoice', ref: '00051154' }];
  const r = validateProject('TST001', a);
  assert.equal(a.reconState, 'complete', 'precondition: constitutionally closed');
  assert.ok(
    d17(r).some(e => e.includes('D17(c)') && e.includes('disputed-invoice')),
    `expected D17(c) blocker failure, got: ${JSON.stringify(r.eligibilityErrors)}`
  );
});

test('D17(b): reconState complete but stale/unconfirmed source fails', () => {
  const a = eligibleCollectionsAccount();
  a.financials.collectable.operatorConfirmation = 'pending';
  const r = validateProject('TST001', a);
  assert.ok(
    d17(r).some(e => e.includes('stale/unconfirmed')),
    `expected D17(b) staleness failure, got: ${JSON.stringify(r.eligibilityErrors)}`
  );
});

test('D17(b): age-qualified debt with no confirmed collectable balance fails', () => {
  const a = eligibleCollectionsAccount();
  delete a.financials.collectable;          // nothing stated
  a.financials.agedDebt180Plus = 250000.0;  // deeply aged
  const r = validateProject('TST001', a);
  assert.ok(
    d17(r).some(e => e.includes('D17(b)') && e.includes('financials.collectable missing')),
    `expected D17(b) schema-gap failure, got: ${JSON.stringify(r.eligibilityErrors)}`
  );
});

test('D17: age alone never makes an account collections-ready', () => {
  const a = eligibleCollectionsAccount();
  delete a.financials.collectable;
  delete a.collections.blockers;
  a.financials.totalOutstanding = 500000.0;
  a.financials.agedDebt180Plus = 500000.0; // maximally aged, nothing else proven
  const r = validateProject('TST001', a);
  assert.ok(d17(r).length >= 2, 'age must not satisfy either (b) or (c)');
  assert.ok(d17(r).some(e => e.includes('D17(b)')), 'expected (b) failure');
  assert.ok(d17(r).some(e => e.includes('D17(c)')), 'expected (c) failure');
});

test('D17(c): missing blockers array fails closed — absence is not clearance', () => {
  const a = eligibleCollectionsAccount();
  delete a.collections.blockers;
  const r = validateProject('TST001', a);
  assert.ok(
    d17(r).some(e => e.includes('D17(c)') && e.includes('blockers missing')),
    `expected fail-closed on absent blockers, got: ${JSON.stringify(r.eligibilityErrors)}`
  );
});

test('D17(b): collectable must reconcile to erpBalance − ratifiedHolds', () => {
  const a = eligibleCollectionsAccount();
  a.financials.collectable.amount = 9500.0; // holds say 1000 on erpBalance 10000 → 9000
  const r = validateProject('TST001', a);
  assert.ok(
    d17(r).some(e => e.includes('bridge must be itemized')),
    `expected identity failure, got: ${JSON.stringify(r.eligibilityErrors)}`
  );
});

test('D17(b): identity uses erpBalance, never totalOutstanding', () => {
  const a = eligibleCollectionsAccount();
  // totalOutstanding is a multi-code exposure aggregate, not the §2 anchor.
  // Diverging it must NOT affect the gate; the anchored identity still holds.
  a.financials.totalOutstanding = 999999.0;
  assert.deepEqual(d17(validateProject('TST001', a)), [], 'totalOutstanding must not participate');

  // Removing the anchor itself must fail closed.
  const b = eligibleCollectionsAccount();
  delete b.financials.collectable.erpBalance;
  assert.ok(
    d17(validateProject('TST001', b)).some(e => e.includes('erpBalance')),
    'absent erpBalance must fail closed'
  );
});

test('D17(b): basis must be PROVEN — ASSERTED or STALE does not close', () => {
  for (const basis of ['ASSERTED', 'STALE']) {
    const a = eligibleCollectionsAccount();
    a.financials.collectable.basis = basis;
    assert.ok(
      d17(validateProject('TST001', a)).some(e => e.includes('only PROVEN closes')),
      `basis ${basis} must not close`
    );
  }
});

test('D17(b): source reference is required for the anchor', () => {
  const a = eligibleCollectionsAccount();
  delete a.financials.collectable.source;
  assert.ok(d17(validateProject('TST001', a)).some(e => e.includes('source missing')));
});

test('D17(c): resolved blockers are retained as history and do not gate', () => {
  const a = eligibleCollectionsAccount();
  a.collections.blockers = [
    { type: 'DISPUTE', status: 'resolved', description: 'credit note issued', source: 'EX-0038', asAt: '2026-07-20' },
  ];
  assert.deepEqual(d17(validateProject('TST001', a)), [], 'resolved blockers must not block');

  a.collections.blockers.push({ type: 'UNRESOLVED_IDENTITY', status: 'open', description: 'doc 51154 unmatched' });
  assert.ok(
    d17(validateProject('TST001', a)).some(e => e.includes('1 open blocker') && e.includes('UNRESOLVED_IDENTITY')),
    'open blocker must block while resolved one is ignored'
  );
});

test('D17 does not apply to non-collections accounts (existing behaviour preserved)', () => {
  for (const status of ['active', 'on-hold']) {
    const r = validateProject('TST001', baseAccount({ status }));
    assert.deepEqual(d17(r), [], `${status} must not be D17-gated`);
  }
});
