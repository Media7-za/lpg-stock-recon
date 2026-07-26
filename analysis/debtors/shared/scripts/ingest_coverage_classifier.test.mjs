// B1 — ingest coverage contract tests.
//
// Boundary under test: source completeness and ingest health only.
// No financial truth. No reconciliation closure. No collections eligibility
// (D17/D18). No workspace workflow state (workspaceStatus).
//
// Run: node --test analysis/debtors/shared/scripts/ingest_coverage_classifier.test.mjs

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ingestShapeForEntryType,
  classifyDocument,
  deriveDisplayStatus,
  classificationIsPass,
  CLASSIFICATION_BLOCKS,
} from './ingest_coverage_classifier.mjs';

describe('ingestShapeForEntryType', () => {
  test('known entry types resolve to their declared shape', () => {
    assert.equal(ingestShapeForEntryType('Invoice'), 'header_and_lines');
    assert.equal(ingestShapeForEntryType('Crd Note'), 'header_and_lines');
    assert.equal(ingestShapeForEntryType('Payment'), 'header_only');
    assert.equal(ingestShapeForEntryType('Bank UD'), 'unresolved');
  });

  test('unknown entry types fail closed to unresolved, never silently pass', () => {
    assert.equal(ingestShapeForEntryType('Some New ERP Type'), 'unresolved');
  });
});

describe('classifyDocument', () => {
  test('a ratified exception overrides every other input', () => {
    const c = classifyDocument({
      inTxt: true, headerPresent: false, linesPresent: false,
      requiredShape: 'header_and_lines', ratified: true,
    });
    assert.equal(c, 'RATIFIED_EXCEPTION');
  });

  test('DB-only document (not in TXT, present in DB) is flagged, not silently healthy', () => {
    const c = classifyDocument({
      inTxt: false, headerPresent: true, linesPresent: false, requiredShape: 'header_only',
    });
    assert.equal(c, 'DB_ONLY_DOCUMENT');
  });

  test('unresolved required shape is flagged, never assumed healthy', () => {
    const c = classifyDocument({
      inTxt: true, headerPresent: true, linesPresent: true, requiredShape: 'unresolved',
    });
    assert.equal(c, 'DOCUMENT_TYPE_UNRESOLVED');
  });

  test('header_only: present passes, absent fails', () => {
    assert.equal(
      classifyDocument({ inTxt: true, headerPresent: true, linesPresent: false, requiredShape: 'header_only' }),
      'EXPECTED_HEADER_ONLY',
    );
    assert.equal(
      classifyDocument({ inTxt: true, headerPresent: false, linesPresent: false, requiredShape: 'header_only' }),
      'MISSING_HEADER',
    );
  });

  test('header_and_lines: all four presence combinations classify distinctly', () => {
    const shape = 'header_and_lines';
    assert.equal(classifyDocument({ inTxt: true, headerPresent: true, linesPresent: true, requiredShape: shape }), 'HEALTHY');
    assert.equal(classifyDocument({ inTxt: true, headerPresent: false, linesPresent: false, requiredShape: shape }), 'MISSING_HEADER_AND_LINES');
    assert.equal(classifyDocument({ inTxt: true, headerPresent: false, linesPresent: true, requiredShape: shape }), 'MISSING_HEADER');
    assert.equal(classifyDocument({ inTxt: true, headerPresent: true, linesPresent: false, requiredShape: shape }), 'MISSING_LINES');
  });
});

describe('deriveDisplayStatus', () => {
  test('either dimension unverified forces UNVERIFIED, never a partial pass', () => {
    assert.equal(deriveDisplayStatus('unverified', 'complete'), 'UNVERIFIED');
    assert.equal(deriveDisplayStatus('current', 'unverified'), 'UNVERIFIED');
  });

  test('all four current/stale x complete/partial combinations', () => {
    assert.equal(deriveDisplayStatus('current', 'complete'), 'CURRENT_COMPLETE');
    assert.equal(deriveDisplayStatus('current', 'partial'), 'CURRENT_PARTIAL');
    assert.equal(deriveDisplayStatus('stale', 'complete'), 'STALE_COMPLETE');
    assert.equal(deriveDisplayStatus('stale', 'partial'), 'STALE_PARTIAL');
  });
});

describe('classificationIsPass', () => {
  test('only HEALTHY, EXPECTED_HEADER_ONLY, RATIFIED_EXCEPTION pass', () => {
    assert.equal(classificationIsPass('HEALTHY'), true);
    assert.equal(classificationIsPass('EXPECTED_HEADER_ONLY'), true);
    assert.equal(classificationIsPass('RATIFIED_EXCEPTION'), true);
    for (const c of ['MISSING_HEADER', 'MISSING_LINES', 'MISSING_HEADER_AND_LINES', 'DB_ONLY_DOCUMENT', 'DOCUMENT_TYPE_UNRESOLVED']) {
      assert.equal(classificationIsPass(c), false, `${c} must not pass`);
    }
  });
});

describe('B1 boundary — CLASSIFICATION_BLOCKS never names financial, reconciliation, or workspace concepts', () => {
  const ALLOWED_SCOPES = new Set(['custody', 'sku_analysis', 'allocation', 'financial_bridge_from_txt']);
  const FORBIDDEN_TERMS = ['reconState', 'collectable', 'collections', 'workspaceStatus', 'reconciliation_closure'];

  test('every blocked scope is one of the four declared analytical lanes', () => {
    for (const [classification, scopes] of Object.entries(CLASSIFICATION_BLOCKS)) {
      for (const scope of scopes) {
        assert.ok(ALLOWED_SCOPES.has(scope), `${classification} names undeclared scope "${scope}"`);
      }
    }
  });

  test('no classification ever blocks a constitutional, collections, or workspace concept', () => {
    const allBlocked = Object.values(CLASSIFICATION_BLOCKS).flat();
    for (const term of FORBIDDEN_TERMS) {
      assert.ok(!allBlocked.includes(term), `ingest classifier must never reference "${term}"`);
    }
  });

  test('a HEALTHY or RATIFIED_EXCEPTION document blocks nothing', () => {
    assert.deepEqual(CLASSIFICATION_BLOCKS.HEALTHY, []);
    assert.deepEqual(CLASSIFICATION_BLOCKS.RATIFIED_EXCEPTION, []);
  });

  test('financial_bridge_from_txt is the only scope a DB-only document blocks — TXT balance stands regardless', () => {
    assert.deepEqual(CLASSIFICATION_BLOCKS.DB_ONLY_DOCUMENT, ['financial_bridge_from_txt']);
  });
});
