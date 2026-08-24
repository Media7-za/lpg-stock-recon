import { describe, it, expect } from 'vitest';
import { computeAutoMatches, FUZZY_DATE_WINDOW_DAYS } from './cardReconMatchEngine';

describe('computeAutoMatches', () => {
  it('matches exact amount + exact date as AUTO_EXACT', () => {
    const result = computeAutoMatches(
      [{ id: 'line-1', date: '2026-08-01', amount: 350.5 }],
      [{ id: 'entry-1', date: '2026-08-01', amount: 350.5 }]
    );
    expect(result).toEqual([{ statementLineId: 'line-1', ledgerEntryId: 'entry-1', matchMethod: 'AUTO_EXACT' }]);
  });

  it('matches exact amount + date within the fuzzy window as AUTO_FUZZY', () => {
    const result = computeAutoMatches(
      [{ id: 'line-1', date: '2026-08-04', amount: 100 }],
      [{ id: 'entry-1', date: '2026-08-01', amount: 100 }]
    );
    expect(result).toEqual([{ statementLineId: 'line-1', ledgerEntryId: 'entry-1', matchMethod: 'AUTO_FUZZY' }]);
  });

  it('boundary: matches at exactly the fuzzy window edge', () => {
    const line = { id: 'line-1', date: '2026-08-04', amount: 100 }; // FUZZY_DATE_WINDOW_DAYS=3 -> 08-01 is exactly 3 days out
    expect(FUZZY_DATE_WINDOW_DAYS).toBe(3);
    const result = computeAutoMatches([line], [{ id: 'entry-1', date: '2026-08-01', amount: 100 }]);
    expect(result).toHaveLength(1);
    expect(result[0].matchMethod).toBe('AUTO_FUZZY');
  });

  it('boundary: does not match one day beyond the fuzzy window', () => {
    const result = computeAutoMatches(
      [{ id: 'line-1', date: '2026-08-05', amount: 100 }], // 4 days from 08-01
      [{ id: 'entry-1', date: '2026-08-01', amount: 100 }]
    );
    expect(result).toHaveLength(0);
  });

  it('does not match different amounts even on the same date', () => {
    const result = computeAutoMatches(
      [{ id: 'line-1', date: '2026-08-01', amount: 100 }],
      [{ id: 'entry-1', date: '2026-08-01', amount: 100.5 }]
    );
    expect(result).toHaveLength(0);
  });

  it('prefers AUTO_EXACT over AUTO_FUZZY when both a same-day and a near-day candidate exist', () => {
    const result = computeAutoMatches(
      [{ id: 'line-1', date: '2026-08-01', amount: 100 }],
      [
        { id: 'entry-near', date: '2026-08-02', amount: 100 },
        { id: 'entry-exact', date: '2026-08-01', amount: 100 },
      ]
    );
    expect(result).toEqual([{ statementLineId: 'line-1', ledgerEntryId: 'entry-exact', matchMethod: 'AUTO_EXACT' }]);
  });

  it('picks the closest date among multiple fuzzy candidates', () => {
    const result = computeAutoMatches(
      [{ id: 'line-1', date: '2026-08-04', amount: 100 }],
      [
        { id: 'entry-far', date: '2026-08-01', amount: 100 },
        { id: 'entry-close', date: '2026-08-03', amount: 100 },
      ]
    );
    expect(result[0].ledgerEntryId).toBe('entry-close');
  });

  it('never double-claims a ledger entry across two statement lines', () => {
    const result = computeAutoMatches(
      [
        { id: 'line-1', date: '2026-08-01', amount: 100 },
        { id: 'line-2', date: '2026-08-01', amount: 100 },
      ],
      [{ id: 'entry-1', date: '2026-08-01', amount: 100 }]
    );
    expect(result).toHaveLength(1);
  });

  it('leaves an unmatchable line and entry unclaimed', () => {
    const result = computeAutoMatches(
      [{ id: 'line-1', date: '2026-08-01', amount: 999 }],
      [{ id: 'entry-1', date: '2026-08-01', amount: 100 }]
    );
    expect(result).toHaveLength(0);
  });
});
