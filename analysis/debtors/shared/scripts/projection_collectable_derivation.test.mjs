// B2 — projection.collectable derivation-rule tests.
//
// Controlling rule (DEBTORS_DOCTRINE.md D18, PROJECT_PROJECTION_SCHEMA.md):
// projection.collectable must derive ONLY from project.json.financials.collectable.
// It must never independently infer collectability from ERP TXT, totalOutstanding,
// aged balances, or statement arithmetic.
//
// No live projection generator exists yet (schema is "Staged — not yet enforced").
// So this suite enforces the rule at the two places risk actually lives today:
//   1. the schema document itself — field alignment, identity, and the prose rule
//      must not silently drift or be removed;
//   2. the v5 statement generator — a static guard that it never starts emitting
//      an independently-computed `collectable` key.
//
// Run: node --test analysis/debtors/shared/scripts/projection_collectable_derivation.test.mjs

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

const SCHEMA_PATH = path.join(ROOT, 'analysis/debtors/shared/PROJECT_PROJECTION_SCHEMA.md');
const GENERATOR_PATH = path.join(ROOT, 'analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs');

const D18_ALIGNED_FIELDS = [
  'amount', 'erpBalance', 'ratifiedHoldsTotal', 'asAt', 'source', 'basis', 'operatorConfirmation',
];

function readSchemaDoc() {
  return fs.readFileSync(SCHEMA_PATH, 'utf8');
}

function extractProjectionExample(doc) {
  const match = doc.match(/```json\n([\s\S]+?)\n```/);
  assert.ok(match, 'expected a fenced json projection example in PROJECT_PROJECTION_SCHEMA.md');
  return JSON.parse(match[1]);
}

/** Strips // and /* *\/ comments so a key-literal search can't false-positive on prose. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

describe('PROJECT_PROJECTION_SCHEMA.md — collectable field alignment', () => {
  const example = extractProjectionExample(readSchemaDoc());

  test('example collectable block carries all seven D18-aligned fields', () => {
    for (const field of D18_ALIGNED_FIELDS) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(example.collectable, field),
        `collectable.${field} missing from schema example — D18 alignment must be exact, not partial`,
      );
    }
  });

  test('identity holds: amount = erpBalance − ratifiedHoldsTotal', () => {
    const { amount, erpBalance, ratifiedHoldsTotal } = example.collectable;
    assert.ok(
      Math.abs(amount - (erpBalance - ratifiedHoldsTotal)) <= 0.05,
      `example violates its own identity: ${amount} ≠ ${erpBalance} − ${ratifiedHoldsTotal}`,
    );
  });

  test('basis is PROVEN in the example — only PROVEN closes under D18', () => {
    assert.equal(example.collectable.basis, 'PROVEN');
  });

  test('presentation-only fields (ratifiedHolds, bridgeLines, bridgeVariance) may coexist but never replace the aligned fields', () => {
    // Presence is optional and fine; absence of the seven aligned fields is not (covered above).
    // This test only guards that the projection-only extras don't crowd out required D18 fields.
    const keys = Object.keys(example.collectable);
    for (const field of D18_ALIGNED_FIELDS) assert.ok(keys.includes(field));
  });
});

describe('PROJECT_PROJECTION_SCHEMA.md — derivation rule is stated, not just implied', () => {
  const doc = readSchemaDoc();

  test('doc states collectable is a read-through, never independently derived', () => {
    assert.match(doc, /read-through of `project\.json\.financials\.collectable`/);
    assert.match(doc, /must never be independently derived/);
  });

  test('doc explicitly forbids deriving from ERP TXT rows, totalOutstanding, aged balances, or statement arithmetic', () => {
    assert.match(doc, /must not\*\* compute .* from ERP TXT rows/);
    assert.match(doc, /totalOutstanding/);
    assert.match(doc, /agedDebt180Plus/);
  });

  test('doc states an absent persisted collectable means an omitted block, not a computed substitute', () => {
    assert.match(doc, /omit the `collectable` block entirely if `project\.json\.financials\.collectable` is absent/);
  });

  test('relationship table names financials.collectable as the sole source', () => {
    assert.match(doc, /financials\.collectable.*Sole source for `projection\.collectable`/);
  });
});

describe('reconcile_debtor_v5_from_txt.mjs — static guard against independent collectable derivation', () => {
  const src = fs.readFileSync(GENERATOR_PATH, 'utf8');
  const codeOnly = stripComments(src);

  test('generator carries the boundary comment referencing D18', () => {
    assert.match(src, /D18/);
    assert.match(src, /must NEVER compute or emit a `collectable` field/);
  });

  test('generator does not currently construct a collectable key', () => {
    // Regression guard: if this ever starts failing, someone added collectable logic
    // to a statement generator without going through the D18 read-through rule.
    assert.doesNotMatch(codeOnly, /\bcollectable\s*:/);
  });

  test('generator does not reference project.json.financials.collectable either (no read-through wired yet)', () => {
    // Documents current reality precisely: this generator neither computes collectable
    // independently NOR reads it through from project.json. Absence, not substitution.
    assert.doesNotMatch(codeOnly, /financials\.collectable/);
  });
});
