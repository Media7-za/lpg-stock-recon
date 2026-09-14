// Canonical account layer contract tests.
//
// Boundary under test: the canonical account must reconcile to the SAME
// trusted numbers the existing generators already produce (never a second,
// independently-derived balance), and the customer projection must never
// leak internal-only fields regardless of what canonical carries.
//
// Run: node --test analysis/debtors/shared/scripts/canonical_account_model.test.mjs

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { buildCanonicalAccount, projectCustomerView } from './canonical_account_model.mjs';

describe('buildCanonicalAccount — JEN001 (real ERP TXT)', () => {
  const canonical = buildCanonicalAccount({ debtorCode: 'JEN001', asAt: '2026-08-25' });

  test('current balance ties to the ERP CURRENT BALANCE header', () => {
    // Cross-checked against JEN001_Statement_Account_v5.md and
    // JEN001_Statement_of_Account.md, both generated independently from the
    // same TXT — R22,685.21 is the account's verified balance.
    assert.equal(canonical.financialPosition.currentBalance, 22685.21);
  });

  test('the last chronological event balance equals the ERP header (self-consistent recompute)', () => {
    const last = canonical.events.at(-1);
    assert.equal(last.balanceAfter, canonical.financialPosition.currentBalance);
  });

  test('events are in calendar-chronological order, not TXT posting order', () => {
    for (let i = 1; i < canonical.events.length; i++) {
      assert.ok(canonical.events[i].date >= canonical.events[i - 1].date);
    }
  });

  test('window opening balance matches the known combined B/F', () => {
    // Combined Opening B/F on both the v5 and customer statements.
    assert.equal(canonical.financialPosition.windowOpeningBalance, 22088.1);
  });

  test('open invoice list matches the ratified allocation result', () => {
    assert.equal(canonical.openInvoices.gate, 'ALLOWED');
    assert.equal(canonical.openInvoices.customerSafe, true);
    assert.equal(canonical.openInvoices.subtotal, 597.11);
    assert.equal(canonical.openInvoices.items.length, 1);
    assert.equal(canonical.openInvoices.items[0].doc, '51564');
  });

  test('reconciliation block is internal-only and present from the v5 fixture', () => {
    assert.ok(canonical.reconciliation);
    assert.equal(canonical.reconciliation.visibility, 'internal');
    assert.equal(canonical.reconciliation.workspaceStatus, 'clean');
  });
});

describe('projectCustomerView — never leaks internal fields', () => {
  const canonical = buildCanonicalAccount({ debtorCode: 'JEN001', asAt: '2026-08-25' });
  const view = projectCustomerView(canonical);

  test('carries no reconciliation, dataQuality, or raw events fields', () => {
    assert.equal(view.reconciliation, undefined);
    assert.equal(view.dataQuality, undefined);
    assert.equal(view.events, undefined);
  });

  test('documents are limited to customer-visibility ones', () => {
    for (const d of view.documents) assert.notEqual(d.visibility, 'internal');
    assert.ok(view.documents.length > 0);
  });

  test('movement total ties to the same balance as the internal ledger', () => {
    const sum = view.movement.reduce((s, e) => s + e.amount, 0);
    const expected = Math.round((canonical.financialPosition.currentBalance - canonical.financialPosition.windowOpeningBalance) * 100) / 100;
    assert.equal(Math.round(sum * 100) / 100, expected);
  });

  test('withholds the open-invoice table only when the gate says so', () => {
    assert.equal(Boolean(view.openInvoices.withheld), !canonical.openInvoices.customerSafe);
  });
});
