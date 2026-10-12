import { describe, it, expect } from 'vitest';
import type { DebtorWorkspaceState, DebtorWorkspaceStatus } from '../../types/debtorWorkspace';
import JEN001v4 from './JEN001.v4.json';
import FAM000v4 from './FAM000.v4.json';
import TAN001v4 from './TAN001.v4.json';
import JEN001v5 from './JEN001.v5.json';
import BR0001v5 from './BR0001.v5.json';
import IVE001v5 from './IVE001.v5.json';

// B0 — application-contract repair. Guards against the two defects found in review:
// (1) a generic `status` field with no declared owner or relationship to constitutional
//     state (D16-adjacent authority leak), and (2) `version` hard-coded to 'v4' only.
// This does not re-test D16/D17/D18 — workspaceStatus is explicitly NOT that state.

const VALID_STATUSES: DebtorWorkspaceStatus[] = [
  'clean', 'cylinder_variance', 'erp_exception', 'pending_review',
  'approved_internal', 'customer_ready', 'sent',
];

const fixtures: Array<[string, unknown]> = [
  ['JEN001.v4', JEN001v4],
  ['FAM000.v4', FAM000v4],
  ['TAN001.v4', TAN001v4],
  ['JEN001.v5', JEN001v5],
  ['BR0001.v5', BR0001v5],
  ['IVE001.v5', IVE001v5],
];

describe('DebtorWorkspaceState contract (B0)', () => {
  it.each(fixtures)('%s: version is v4 or v5', (_name, raw) => {
    const f = raw as DebtorWorkspaceState;
    expect(['v4', 'v5']).toContain(f.version);
  });

  it.each(fixtures)('%s: workspaceStatus is a valid DebtorWorkspaceStatus', (_name, raw) => {
    const f = raw as DebtorWorkspaceState;
    expect(VALID_STATUSES).toContain(f.workspaceStatus);
  });

  it.each(fixtures)('%s: no generic "status" field is emitted', (_name, raw) => {
    expect(Object.prototype.hasOwnProperty.call(raw as object, 'status')).toBe(false);
  });

  it.each(fixtures)('%s: does not carry constitutional or ingest fields', (_name, raw) => {
    // workspaceStatus answers "where is this in the review/send workflow?" only.
    // reconState, collections eligibility, and ingest health are separate axes
    // (project.json / DEBTORS_DOCTRINE.md D16-D18) and must never be inferred here.
    const obj = raw as Record<string, unknown>;
    expect(obj.reconState).toBeUndefined();
    expect(obj.ingestGate).toBeUndefined();
    expect(obj.collectable).toBeUndefined();
  });

  it('v5 fixtures with cylinderVariance >= 1 are pending_review, not the invalid "review"', () => {
    // JEN001.v5 is excluded here: its cylinderVariance is 0 (a clean reconciliation),
    // so it belongs to the zero-variance case below, not this group.
    for (const [name, raw] of [['BR0001.v5', BR0001v5], ['IVE001.v5', IVE001v5]] as const) {
      const f = raw as unknown as DebtorWorkspaceState & {
        reconciliationPosition: { cylinderVariance: number };
      };
      expect(Math.abs(f.reconciliationPosition.cylinderVariance), `${name} variance`).toBeGreaterThanOrEqual(1);
      expect(f.workspaceStatus, name).toBe('pending_review');
    }
  });

  it('JEN001.v5 has cylinderVariance 0 and is clean, not pending_review', () => {
    const f = JEN001v5 as unknown as DebtorWorkspaceState & {
      reconciliationPosition: { cylinderVariance: number };
    };
    expect(f.reconciliationPosition.cylinderVariance).toBe(0);
    expect(f.workspaceStatus).toBe('clean');
  });

  it('preserves each v4 fixture\'s original status value under the new field name', () => {
    expect((JEN001v4 as unknown as DebtorWorkspaceState).workspaceStatus).toBe('clean');
    expect((FAM000v4 as unknown as DebtorWorkspaceState).workspaceStatus).toBe('cylinder_variance');
    expect((TAN001v4 as unknown as DebtorWorkspaceState).workspaceStatus).toBe('erp_exception');
  });
});
