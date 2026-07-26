// D17 collections-gate tests — DEBTORS_DOCTRINE.md §4 (D17), Collectable Rule §2.
//
// Run:  node --test analysis/debtors/shared/scripts/debtors_sync.d17.test.mjs
//
// Not under vitest: vitest.config.ts restricts include to src/**/*.{test,spec}.{ts,tsx},
// and widening it for one node script is broader than this turn's scope.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateProject } from './debtors_sync.mjs';

const d17 = (errors) => errors.filter(e => e.startsWith('D17'));

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
    ratifiedHoldsTotal: 1000.0,
    asAt: '2026-07-26',
    basis: 'ERP CURRENT.TXT closing less ratified hold EX-0041',
    operatorConfirmation: 'confirmed',
  };
  a.collections.actionRequired = true;
  a.collections.actionType = 'letter-of-demand';
  a.collections.blockers = [];
  return { ...a, ...overrides };
}

test('D17: collections-eligible account passes all three gates', () => {
  const { errors } = validateProject('TST001', eligibleCollectionsAccount());
  assert.deepEqual(d17(errors), [], 'expected no D17 errors');
  assert.deepEqual(errors, [], 'expected no errors at all');
});

test('D17(c): reconState complete but a blocking dispute fails', () => {
  const a = eligibleCollectionsAccount();
  a.collections.blockers = [{ type: 'disputed-invoice', ref: '00051154' }];
  const { errors } = validateProject('TST001', a);
  assert.equal(a.reconState, 'complete', 'precondition: constitutionally closed');
  assert.ok(
    d17(errors).some(e => e.includes('D17(c)') && e.includes('disputed-invoice')),
    `expected D17(c) blocker failure, got: ${JSON.stringify(errors)}`
  );
});

test('D17(b): reconState complete but stale/unconfirmed source fails', () => {
  const a = eligibleCollectionsAccount();
  a.financials.collectable.operatorConfirmation = 'pending';
  const { errors } = validateProject('TST001', a);
  assert.ok(
    d17(errors).some(e => e.includes('stale/unconfirmed')),
    `expected D17(b) staleness failure, got: ${JSON.stringify(errors)}`
  );
});

test('D17(b): age-qualified debt with no confirmed collectable balance fails', () => {
  const a = eligibleCollectionsAccount();
  delete a.financials.collectable;          // nothing stated
  a.financials.agedDebt180Plus = 250000.0;  // deeply aged
  const { errors } = validateProject('TST001', a);
  assert.ok(
    d17(errors).some(e => e.includes('D17(b)') && e.includes('SCHEMA GAP')),
    `expected D17(b) schema-gap failure, got: ${JSON.stringify(errors)}`
  );
});

test('D17: age alone never makes an account collections-ready', () => {
  const a = eligibleCollectionsAccount();
  delete a.financials.collectable;
  delete a.collections.blockers;
  a.financials.totalOutstanding = 500000.0;
  a.financials.agedDebt180Plus = 500000.0; // maximally aged, nothing else proven
  const { errors } = validateProject('TST001', a);
  assert.ok(d17(errors).length >= 2, 'age must not satisfy either (b) or (c)');
  assert.ok(d17(errors).some(e => e.includes('D17(b)')), 'expected (b) failure');
  assert.ok(d17(errors).some(e => e.includes('D17(c)')), 'expected (c) failure');
});

test('D17(c): missing blockers array fails closed — absence is not clearance', () => {
  const a = eligibleCollectionsAccount();
  delete a.collections.blockers;
  const { errors } = validateProject('TST001', a);
  assert.ok(
    d17(errors).some(e => e.includes('D17(c)') && e.includes('SCHEMA GAP')),
    `expected fail-closed on absent blockers, got: ${JSON.stringify(errors)}`
  );
});

test('D17(b): collectable must reconcile to totalOutstanding − ratifiedHolds', () => {
  const a = eligibleCollectionsAccount();
  a.financials.collectable.amount = 9500.0; // holds say 1000 on 10000 → 9000
  const { errors } = validateProject('TST001', a);
  assert.ok(
    d17(errors).some(e => e.includes('bridge must be itemized')),
    `expected identity failure, got: ${JSON.stringify(errors)}`
  );
});

test('D17 does not apply to non-collections accounts (existing behaviour preserved)', () => {
  for (const status of ['active', 'on-hold']) {
    const { errors } = validateProject('TST001', baseAccount({ status }));
    assert.deepEqual(d17(errors), [], `${status} must not be D17-gated`);
  }
});
