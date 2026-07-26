// D19 ingest-gate tests — DEBTORS_DOCTRINE.md D19.
//
// Run:  node --test analysis/debtors/shared/scripts/debtors_sync.d19.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateIngestGate, validateProject } from './debtors_sync.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function baseAccount(overrides = {}) {
  return {
    debtorCode: 'TST001',
    clientName: 'Test Account',
    status: 'active',
    reconState: 'complete',
    financials: { totalOutstanding: 1000, agedDebt180Plus: 0 },
    collections: { actionRequired: false, actionType: null },
    history: [{ date: '2026-07-26', event: 'fixture' }],
    ...overrides,
  };
}

function wellFormedIngestGate(overrides = {}) {
  return {
    status: 'pass',
    ingestFreshness: 'current',
    ingestCoverage: 'complete',
    displayStatus: 'CURRENT_COMPLETE',
    asAt: '2026-07-26',
    reportPath: 'analysis/debtors/TST001/reports/TST001_INGEST_COVERAGE_2026-07-26.json',
    ingestBlockedScopes: [],
    exceptions: [],
    ...overrides,
  };
}

test('D19: absent ingestGate is WARN only, never an error', () => {
  const { errors, warnings } = evaluateIngestGate(baseAccount());
  assert.deepEqual(errors, [], 'absence must not be a hard failure');
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /WARN only/);
});

test('D19: well-formed present ingestGate produces no errors and no warnings', () => {
  const { errors, warnings } = evaluateIngestGate(baseAccount({ ingestGate: wellFormedIngestGate() }));
  assert.deepEqual(errors, []);
  assert.deepEqual(warnings, []);
});

test('D19: status is schema validity, independent of freshness/coverage — a stale/partial report is still trustworthy', () => {
  // This is the exact JEN001 2026-07-22 scenario: poor ingest health, well-formed object.
  const gate = wellFormedIngestGate({
    status: 'pass',
    ingestFreshness: 'stale',
    ingestCoverage: 'partial',
    displayStatus: 'STALE_PARTIAL',
    ingestBlockedScopes: ['custody', 'sku_analysis', 'allocation'],
  });
  const { errors } = evaluateIngestGate(baseAccount({ ingestGate: gate }));
  assert.deepEqual(errors, [], 'a stale/partial but well-formed object must not fail — health and validity are independent axes');
});

test('D19: present but not an object is malformed', () => {
  const { errors } = evaluateIngestGate(baseAccount({ ingestGate: 'not-an-object' }));
  assert.equal(errors.length, 1);
  assert.match(errors[0], /not an object/);
});

test('D19: each required sub-field missing or invalid produces its own error', () => {
  const cases = [
    ['status', { status: 'healthy' }],
    ['ingestFreshness', { ingestFreshness: 'fresh' }],
    ['ingestCoverage', { ingestCoverage: 'mostly' }],
    ['displayStatus', { displayStatus: '' }],
    ['asAt', { asAt: undefined }],
    ['reportPath', { reportPath: undefined }],
    ['ingestBlockedScopes', { ingestBlockedScopes: 'custody' }],
  ];
  for (const [field, override] of cases) {
    const gate = { ...wellFormedIngestGate(), ...override };
    const { errors } = evaluateIngestGate(baseAccount({ ingestGate: gate }));
    assert.ok(errors.some(e => e.includes(field)), `expected an error mentioning "${field}", got: ${JSON.stringify(errors)}`);
  }
});

test('D19: ingestBlockedScopes rejects an unrecognised scope', () => {
  const gate = wellFormedIngestGate({ ingestBlockedScopes: ['custody', 'made_up_scope'] });
  const { errors } = evaluateIngestGate(baseAccount({ ingestGate: gate }));
  assert.ok(errors.some(e => e.includes('made_up_scope')));
});

test('D19: malformed ingestGate is a hard error in validateProject (blocks projection validity)', () => {
  const { errors } = validateProject('TST001', baseAccount({ ingestGate: { status: 'nonsense' } }));
  assert.ok(errors.some(e => e.startsWith('D19')), `expected a D19 error in validateProject.errors, got: ${JSON.stringify(errors)}`);
});

test('D19: absent ingestGate does not appear in validateProject.errors, only warnings', () => {
  const { errors, warnings } = validateProject('TST001', baseAccount());
  assert.ok(!errors.some(e => e.includes('ingestGate')), 'absence must never reach the hard-fail channel');
  assert.ok(warnings.some(w => w.includes('ingestGate')));
});

test('D19: never reads or sets reconState, collections.blockers, or workspaceStatus', () => {
  const account = baseAccount({
    reconState: 'in-progress',
    ingestGate: wellFormedIngestGate({ status: 'fail' }), // malformed on purpose
  });
  const before = JSON.parse(JSON.stringify(account));
  evaluateIngestGate(account);
  assert.deepEqual(account, before, 'evaluateIngestGate must not mutate the account');
  assert.equal(account.reconState, 'in-progress', 'must not be altered');
  assert.equal(account.collections.blockers, undefined, 'must not be populated as a side effect');
  assert.equal(account.workspaceStatus, undefined, 'must not exist — ingestGate never sets it');
});

test('D19: static guard — validate_txt_db_coverage.mjs no longer conflates status with health', () => {
  const src = fs.readFileSync(
    path.resolve(__dirname, 'validate_txt_db_coverage.mjs'),
    'utf8',
  );
  assert.doesNotMatch(
    src,
    /status:\s*gaps\.length === 0/,
    'status must not be computed from gaps/freshness — that is exactly the conflation D19 eliminates',
  );
  assert.match(src, /status:\s*'pass'/, 'status should be a fixed pass — reaching that line means the object was built successfully');
});
