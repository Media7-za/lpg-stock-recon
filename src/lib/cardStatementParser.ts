import Papa from 'papaparse';

// CSV column layout not specified anywhere in the locked docs (the bank's
// exact export format was never described) -- flexible header matching
// across common variants, same approach as csvParser.ts's ERP import.
// Not yet PM-confirmed against a real statement export.

export interface ParsedStatementLine {
  date: string; // yyyy-MM-dd
  description: string;
  amount: number;
}

export interface StatementParseResult {
  success: boolean;
  lines?: ParsedStatementLine[];
  error?: string;
}

function normalizeDate(raw: string): string | null {
  const trimmed = raw.trim();
  // yyyy-MM-dd already
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  // dd/MM/yyyy or dd-MM-yyyy
  const dmy = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return null;
}

export function parseStatementCsv(csvText: string): StatementParseResult {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (result.errors.length > 0) {
    return { success: false, error: `CSV parsing errors: ${result.errors.map((e) => e.message).join(', ')}` };
  }

  const rows = result.data as Record<string, string>[];
  const lines: ParsedStatementLine[] = [];

  for (const row of rows) {
    const dateRaw = row['Date'] ?? row['date'] ?? row['Transaction Date'] ?? row['TRANSACTION DATE'] ?? '';
    const description = (row['Description'] ?? row['description'] ?? row['Narrative'] ?? row['NARRATIVE'] ?? '').trim();
    const amountRaw = row['Amount'] ?? row['amount'] ?? row['Value'] ?? row['VALUE'] ?? '';

    const date = normalizeDate(dateRaw);
    const amount = parseFloat(String(amountRaw).replace(/[,\s]/g, ''));

    if (!date || Number.isNaN(amount)) continue; // skip unparseable rows silently -- matches csvParser.ts precedent
    lines.push({ date, description, amount });
  }

  if (lines.length === 0) {
    return { success: false, error: "Couldn't read this file — check it's the unedited bank export" };
  }

  return { success: true, lines };
}
