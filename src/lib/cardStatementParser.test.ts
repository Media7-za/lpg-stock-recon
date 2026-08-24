import { describe, it, expect } from 'vitest';
import { parseStatementCsv } from './cardStatementParser';

describe('parseStatementCsv', () => {
  it('parses a standard Date/Description/Amount CSV', () => {
    const csv = 'Date,Description,Amount\n2026-08-01,FUEL STATION,350.50\n2026-08-03,BANK FEE,12.00\n';
    const result = parseStatementCsv(csv);
    expect(result.success).toBe(true);
    expect(result.lines).toEqual([
      { date: '2026-08-01', description: 'FUEL STATION', amount: 350.5 },
      { date: '2026-08-03', description: 'BANK FEE', amount: 12 },
    ]);
  });

  it('normalizes dd/MM/yyyy dates', () => {
    const csv = 'Date,Description,Amount\n15/08/2026,SHOP,100\n';
    const result = parseStatementCsv(csv);
    expect(result.lines?.[0].date).toBe('2026-08-15');
  });

  it('handles comma thousand separators in amounts', () => {
    const csv = 'Date,Description,Amount\n2026-08-01,BIG PURCHASE,"1,250.75"\n';
    const result = parseStatementCsv(csv);
    expect(result.lines?.[0].amount).toBe(1250.75);
  });

  it('fails with a helpful error when no row has a usable date/amount', () => {
    const result = parseStatementCsv('Foo,Bar,Baz\nnot a date,irrelevant,not a number\n');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/unedited bank export/i);
  });

  it('fails with a parsing error on structurally malformed CSV', () => {
    const result = parseStatementCsv('not,a,valid\nstatement,file,at,all\n');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/CSV parsing errors/i);
  });

  it('skips rows with no parseable date or amount rather than throwing', () => {
    const csv = 'Date,Description,Amount\n2026-08-01,GOOD ROW,100\n,BAD ROW,\n';
    const result = parseStatementCsv(csv);
    expect(result.lines).toHaveLength(1);
  });
});
