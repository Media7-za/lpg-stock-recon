import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import type { StatementException } from '../../types/debtorWorkspace';
import JEN001v5 from './JEN001.v5.json';
import BR0001v5 from './BR0001.v5.json';
import IVE001v5 from './IVE001.v5.json';

// B3 — typed reconciliationPosition.exceptions[] contract.
// Extended (debtor-artifact migration bundle) to cover BR0001 and IVE001,
// which carried the same bare-string exception fixed for JEN001 in B3.
//
// Vocabulary (DEBTORS_DOCTRINE.md §6 epistemic tags, distinct from D18's blocker
// vocabulary and from v4's ExceptionSeverity):
//   type:   SOURCE_GAP | VARIANCE | CUSTODY | CLASSIFICATION | OTHER
//   basis:  PROVEN | ASSERTED | ASSUMED
//   status: open | resolved
//
// Boundary: a StatementException describes a Statement-of-Account reconciliation
// gap only. It must never be auto-treated as a D18 collections blocker — that
// requires its own evidence-backed assessment under D18, not an inference from
// statement variance.

const VALID_TYPES = ['SOURCE_GAP', 'VARIANCE', 'CUSTODY', 'CLASSIFICATION', 'OTHER'];
const VALID_BASIS = ['PROVEN', 'ASSERTED', 'ASSUMED'];
const VALID_STATUS = ['open', 'resolved'];

// D18's blocker vocabulary (DISPUTE | STALE_SOURCE | UNRESOLVED_IDENTITY | HOLD |
// OTHER) lives in DEBTORS_DOCTRINE.md, not in this codebase. It is intentionally
// disjoint from StatementExceptionType except for the shared OTHER catch-all —
// listed here only so a future edit can't quietly reuse a D18-specific term.
const D18_BLOCKER_ONLY_TYPES = ['DISPUTE', 'STALE_SOURCE', 'UNRESOLVED_IDENTITY', 'HOLD'];

const FIXTURES: [string, unknown][] = [
  ['JEN001', JEN001v5],
  ['BR0001', BR0001v5],
  ['IVE001', IVE001v5],
];

function exceptionsOf(fixture: unknown): StatementException[] {
  return (fixture as unknown as { reconciliationPosition: { exceptions: StatementException[] } })
    .reconciliationPosition.exceptions;
}

describe.each(FIXTURES)('StatementException contract (B3) — %s', (_code, fixture) => {
  it('exceptions are typed objects, not bare strings', () => {
    for (const ex of exceptionsOf(fixture)) {
      expect(typeof ex).toBe('object');
      expect(typeof (ex as unknown as string)).not.toBe('string');
    }
  });

  it('every exception has type, basis, status, description', () => {
    for (const ex of exceptionsOf(fixture)) {
      expect(ex).toHaveProperty('type');
      expect(ex).toHaveProperty('basis');
      expect(ex).toHaveProperty('status');
      expect(ex).toHaveProperty('description');
    }
  });

  it('type is one of the five declared StatementExceptionType values', () => {
    for (const ex of exceptionsOf(fixture)) {
      expect(VALID_TYPES).toContain(ex.type);
    }
  });

  it('basis is one of the doctrine §6 epistemic tags, not a v4 severity value', () => {
    for (const ex of exceptionsOf(fixture)) {
      expect(VALID_BASIS).toContain(ex.basis);
      expect(ex.basis).not.toMatch(/^(info|warning|critical)$/);
    }
  });

  it('status is open or resolved', () => {
    for (const ex of exceptionsOf(fixture)) {
      expect(VALID_STATUS).toContain(ex.status);
    }
  });

  it('a fresh generator-detected variance defaults to ASSERTED + open, never PROVEN or resolved', () => {
    // A computed, un-closed variance cannot be PROVEN (that requires closing to an
    // anchor) and cannot be assumed resolved by the generator itself.
    for (const ex of exceptionsOf(fixture)) {
      expect(ex.basis).toBe('ASSERTED');
      expect(ex.status).toBe('open');
    }
  });

  it('carries no collections object at all — it is workspace-only', () => {
    expect(fixture).not.toHaveProperty('collections');
  });
});

it('exception type vocabulary never reuses a D18-blocker-only term', () => {
  for (const type of D18_BLOCKER_ONLY_TYPES) {
    expect(VALID_TYPES).not.toContain(type);
  }
});

describe('Statement exceptions never auto-map to a D18 collections blocker (static guard)', () => {
  const generatorSrc = fs.readFileSync(
    path.resolve(__dirname, '../../../../../analysis/debtors/shared/scripts/reconcile_debtor_v5_from_txt.mjs'),
    'utf8',
  );
  // Strip comments before the code-level check — the boundary comment itself
  // legitimately names `collections.blockers` in prose (see test below); only
  // executable code writing to it would be the actual violation.
  const codeOnly = generatorSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  it('the v5 generator never writes to collections.blockers in code', () => {
    expect(codeOnly).not.toMatch(/collections\.blockers/);
    expect(codeOnly).not.toMatch(/blockers\s*:/);
  });

  it('the v5 generator states the boundary explicitly (regression guard on the comment itself)', () => {
    expect(generatorSrc).toMatch(/NEVER copied into[\s\S]{0,20}collections\.blockers/);
  });
});
