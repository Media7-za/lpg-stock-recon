#!/usr/bin/env node
/**
 * TWK002 — stitch ERP TXT slices into one full-history export (2023-04-28 → today).
 *
 * Sources (contiguous, B/F-validated):
 *   raw/TWK0022023.TXT  — opening B/F R0.00 → closing R87,226.46
 *   raw/TWK0022024.TXT  — B/F R87,226.46 → closing R38,791.27
 *   raw/DEBENQ.TXT      — B/F R38,791.27 → header R26,498.36 (through 2026-08-31)
 *
 * This is a **stitched analytical export**, not a single ERP pull. Replace with a
 * fresh full-history ERP export when H-013 lands; re-run this script only when
 * a slice file changes.
 *
 * Run: node analysis/debtors/TWK002/scripts/build_full_history_txt.mjs [--write]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCsvLine, parseTxtDate } from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const RAW = path.join(ROOT, 'analysis/debtors/TWK002/raw');
const REPORTS = path.join(ROOT, 'analysis/debtors/TWK002/reports');
const write = process.argv.includes('--write');

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const fmtR = (n) =>
  (n < 0 ? '-R' : 'R') + Math.abs(round2(n)).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SEGMENTS = [
  { file: 'TWK0022023.TXT', label: '2023 slice (YEAR: 2024 FEBRUARY)' },
  { file: 'TWK0022024.TXT', label: '2024 slice (YEAR: 2025 MARCH)' },
  { file: 'DEBENQ.TXT', label: 'current tail (through 2026-08-31)' },
];

const CHECKPOINTS = [
  { iso: '2024-02-26', expected: 87226.46, label: '2023 slice close' },
  { iso: '2025-02-24', expected: 38791.27, label: '2024 slice close' },
];

const OUT_TXT = path.join(RAW, 'TWK002_FULL_HISTORY.TXT');
const OUT_MANIFEST = path.join(RAW, 'TWK002_FULL_HISTORY.manifest.json');

function csvQuote(s) {
  const v = String(s ?? '');
  return `"${v.replace(/"/g, '""')}"`;
}

function parseSegment(absPath, segIdx) {
  const text = fs.readFileSync(absPath, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const header = {};
  for (const line of lines.slice(0, 15)) {
    const m = line.match(/^"([^"]+)","(.*)"$/);
    if (m) header[m[1].replace(/:$/, '')] = m[2];
  }
  const dataStart = lines.findIndex((l) => l.startsWith('"LINE"'));
  const rows = [];
  for (let i = dataStart + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('"') || line.includes('TOTAL TRANSACTIONS')) continue;
    const p = parseCsvLine(line);
    if (p[6] === 'BALANCE B/F:') continue;
    if (!p[4]?.includes('/')) continue;
    rows.push({
      segIdx,
      lineIdx: i,
      iso: parseTxtDate(p[4]),
      p,
      key: [p[2], p[4], p[3], p[9], p[5], p[6], p[7], p[8]].join('|'),
    });
  }
  return { header, rows, source: path.relative(ROOT, absPath) };
}

function balanceAtIso(sortedRows, isoLimit) {
  let bal = 0;
  for (const r of sortedRows) {
    if (r.iso > isoLimit) break;
    bal = round2(bal + round2(Number(r.p[9])));
  }
  return bal;
}

function buildFullHistory() {
  const parsed = SEGMENTS.map((s, i) => parseSegment(path.join(RAW, s.file), i));
  const seen = new Set();
  const merged = [];
  const dupes = [];

  for (const seg of parsed) {
    for (const row of seg.rows) {
      if (seen.has(row.key)) {
        dupes.push({ key: row.key, source: seg.source });
        continue;
      }
      seen.add(row.key);
      merged.push(row);
    }
  }

  merged.sort((a, b) => {
    const d = a.iso.localeCompare(b.iso);
    if (d) return d;
    const doc = a.p[2].localeCompare(b.p[2]);
    if (doc) return doc;
    if (a.segIdx !== b.segIdx) return a.segIdx - b.segIdx;
    return a.lineIdx - b.lineIdx;
  });

  for (const cp of CHECKPOINTS) {
    const actual = balanceAtIso(merged, cp.iso);
    if (actual !== cp.expected) {
      throw new Error(`${cp.label}: expected ${cp.expected}, got ${actual} at ${cp.iso}`);
    }
  }

  let running = 0;
  const dataLines = [];
  dataLines.push(
    [
      '1',
      '',
      '',
      '',
      '',
      '',
      'BALANCE B/F:',
      '',
      '',
      '0.00',
      '0.00',
    ].map(csvQuote).join(','),
  );
  running = 0;

  let lineNo = 2;
  for (const row of merged) {
    running = round2(running + round2(Number(row.p[9])));
    const out = [...row.p];
    out[0] = String(lineNo++);
    out[10] = running.toFixed(2);
    dataLines.push(out.map(csvQuote).join(','));
  }

  const tailHeader = parsed[2].header;
  const headerBalance = round2(running);
  const expectedHeader = round2(Number(tailHeader['CURRENT BALANCE'] || 0));
  if (headerBalance !== expectedHeader) {
    throw new Error(`Final balance ${headerBalance} ≠ tail header ${expectedHeader}`);
  }

  const headerLines = [
    `${csvQuote('ACCOUNT:')},${csvQuote('TWK002 - TWK AGRI PTY LTD')}`,
    `${csvQuote('ACCOUNT CURRENCY:')},${csvQuote('Local')}`,
    `${csvQuote('DISPLAY CURRENCY:')},${csvQuote('Local')}`,
    `${csvQuote('CURRENT BALANCE:')},${csvQuote(headerBalance.toFixed(2))}`,
    `${csvQuote('UD PAY/CHEQUES:')},${csvQuote(tailHeader['UD PAY/CHEQUES'] || '0.00')}`,
    `${csvQuote('CREDIT CLAIMS:')},${csvQuote(tailHeader['CREDIT CLAIMS'] || '0.00')}`,
    `${csvQuote('TOTAL EXCLUDING UD/CLAIMS:')},${csvQuote(headerBalance.toFixed(2))}`,
    `${csvQuote('SORT ORDER:')},${csvQuote('DOCUMENT DATE')}`,
    `${csvQuote('YEAR:')},${csvQuote('FULL HISTORY (stitched)')}`,
    `${csvQuote('INCLUDE:')},${csvQuote('UD PAYMENTS, UD CHEQUES, CREDIT CLAIMS')}`,
    `${csvQuote('STITCH NOTE:')},${csvQuote('Merged TWK0022023 + TWK0022024 + DEBENQ.TXT — not a single ERP pull')}`,
    '',
    [
      'LINE',
      'PERIOD',
      'DOCNO',
      'ENTRY',
      'DATE',
      'INVNO',
      'CUSTOMER/BANK REF',
      'ORDER',
      'REFERENCE',
      'AMOUNT',
      'BALANCE',
    ].map(csvQuote).join(','),
    ...dataLines,
    `${csvQuote(`TOTAL TRANSACTIONS: ${headerBalance.toFixed(2)}`)},${csvQuote('')},${csvQuote('')},${csvQuote('')},${csvQuote('')},${csvQuote('')},${csvQuote('')},${csvQuote('')},${csvQuote('')},${csvQuote('')},${csvQuote('')}`,
  ];

  const manifest = {
    generatedAt: new Date().toISOString().slice(0, 10),
    kind: 'stitched_full_history',
    output: path.relative(ROOT, OUT_TXT),
    rowCount: merged.length,
    openingBf: 0,
    closingBalance: headerBalance,
    dateRange: {
      first: merged[0]?.iso ?? null,
      last: merged.at(-1)?.iso ?? null,
    },
    sources: SEGMENTS.map((s, i) => ({
      file: `analysis/debtors/TWK002/raw/${s.file}`,
      label: s.label,
      sourceHeaderBalance: parsed[i].header['CURRENT BALANCE'] ?? null,
      rowsContributed: parsed[i].rows.length,
    })),
    checkpoints: CHECKPOINTS.map((cp) => ({
      ...cp,
      actual: balanceAtIso(merged, cp.iso),
      proven: balanceAtIso(merged, cp.iso) === cp.expected,
    })),
    duplicateRowsSkipped: dupes.length,
    epistemicTag: 'PROVEN',
    replaceWhen: 'H-013 fresh full-history ERP export lands from Sources',
  };

  return { text: headerLines.join('\n') + '\n', manifest, merged, dupes };
}

const { text, manifest, merged, dupes } = buildFullHistory();

console.log(`TWK002 full history: ${merged.length} rows, ${manifest.dateRange.first} → ${manifest.dateRange.last}`);
console.log(`Closing balance: ${fmtR(manifest.closingBalance)} (PROVEN — matches DEBENQ.TXT header)`);
if (dupes.length) console.log(`Skipped ${dupes.length} duplicate row(s) at segment seams`);

if (write) {
  fs.writeFileSync(OUT_TXT, text);
  fs.writeFileSync(OUT_MANIFEST, JSON.stringify(manifest, null, 2) + '\n');

  const md = [
    '# TWK002 — full-history TXT (stitched)',
    '',
    `**Generated:** ${manifest.generatedAt}`,
    `**Output:** \`raw/TWK002_FULL_HISTORY.TXT\``,
    '',
    '## Summary',
    '',
    '| Field | Value | Tag |',
    '| :--- | ---: | :--- |',
    `| Rows | ${manifest.rowCount} | PROVEN |`,
    `| Date range | ${manifest.dateRange.first} → ${manifest.dateRange.last} | PROVEN |`,
    `| Opening B/F | R0.00 | PROVEN |`,
    `| Closing balance | ${fmtR(manifest.closingBalance)} | PROVEN |`,
    '',
    '## Sources',
    '',
    '| Slice | File | Rows |',
    '| :--- | :--- | ---: |',
    ...manifest.sources.map((s) => `| ${s.label} | \`${s.file}\` | ${s.rowsContributed} |`),
    '',
    '## Checkpoints',
    '',
    '| Label | As-at | Expected | Actual |',
    '| :--- | :--- | ---: | ---: |',
    ...manifest.checkpoints.map((c) => `| ${c.label} | ${c.iso} | ${c.expected.toFixed(2)} | ${c.actual.toFixed(2)} |`),
    '',
    '## Authority',
    '',
    'Stitched analytical export — **not** a single ERP pull. Replace when H-013 fresh export lands.',
    '',
    'Regenerate:',
    '',
    '```bash',
    'node analysis/debtors/TWK002/scripts/build_full_history_txt.mjs --write',
    '```',
    '',
  ].join('\n');

  fs.writeFileSync(path.join(REPORTS, 'TWK002_Full_History_TXT_2026-09-02.md'), md);
  console.log(`Wrote ${path.relative(ROOT, OUT_TXT)}`);
  console.log(`Wrote ${path.relative(ROOT, OUT_MANIFEST)}`);
} else {
  console.log('Dry run — pass --write to emit files');
}
