#!/usr/bin/env node
/**
 * STAT 123 multi-site split — tag remittance lines with ERP debtor code.
 *
 * One remittance (B226/KRD4041771) posts as TWK002 + TWK003 + TWK004 slices on 00043500.
 * Classification: doc appears on site enquiry export → that code; else TWK002.
 *
 * Run: node analysis/debtors/TWK002/scripts/build_stat123_site_split.mjs [--write]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCsvLine, fmtAmount } from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const RAW = path.join(ROOT, 'analysis/debtors/TWK002/raw');
const DATA = path.join(ROOT, 'analysis/debtors/TWK002/data');
const OUT = path.join(ROOT, 'analysis/debtors/TWK002/restart');
const write = process.argv.includes('--write');

const BATCH_ID = 'BATCH-2026-STAT-123';
const LINES_CSV = path.join(DATA, 'remittance_lines_2026.csv');
const OUT_MD = path.join(OUT, 'stat123_site_split.md');

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const clean = (d) => String(d ?? '').replace(/^0+/, '') || '0';
const fmtR = (n) => 'R' + fmtAmount(round2(n));

function docsFromTxt(absPath) {
  const lines = fs.readFileSync(absPath, 'utf8').split(/\r?\n/).filter(Boolean);
  const start = lines.findIndex((l) => l.startsWith('"LINE"'));
  const docs = new Set();
  for (let i = start + 1; i < lines.length; i++) {
    const p = parseCsvLine(lines[i]);
    if (!p[4]?.includes('/')) continue;
    if (['Invoice', 'Crd Note'].includes(p[3])) docs.add(clean(p[2]));
  }
  return docs;
}

function parseRemittanceCsv(text) {
  const lines = text.trim().split('\n');
  const header = lines[0].split(',');
  return {
    header,
    rows: lines.slice(1).map((line) => {
      const parts = line.split(',');
      const row = {};
      header.forEach((h, i) => {
        row[h.trim()] = (parts[i] ?? '').trim();
      });
      return row;
    }),
  };
}

function classifyDoc(doc, twk3, twk4) {
  if (twk3.has(doc)) return 'TWK003';
  if (twk4.has(doc)) return 'TWK004';
  return 'TWK002';
}

function buildSplit() {
  const twk3 = docsFromTxt(path.join(RAW, 'DEBENQ_TWK003.TXT'));
  const twk4 = docsFromTxt(path.join(RAW, 'DEBENQ_TWK004.TXT'));
  const manifest = JSON.parse(fs.readFileSync(path.join(DATA, 'remittance_manifest_2026.json'), 'utf8'));
  const batch = manifest.batches.find((b) => b.batch_id === BATCH_ID);
  const splits = Object.fromEntries(
    (batch?.erp_payment_split ?? []).map((s) => [s.debtorCode, round2(Math.abs(s.amount))]),
  );

  const { header, rows } = parseRemittanceCsv(fs.readFileSync(LINES_CSV, 'utf8'));
  const classified = [];
  const sums = { TWK002: 0, TWK003: 0, TWK004: 0 };

  for (const row of rows) {
    if (row.batch_id !== BATCH_ID) {
      classified.push({ ...row, debtor_code: row.debtor_code ?? '' });
      continue;
    }
    const doc = clean(row.doc_no);
    const code = classifyDoc(doc, twk3, twk4);
    const net = round2(row.net_amount);
    sums[code] = round2(sums[code] + net);
    classified.push({ ...row, debtor_code: code });
  }

  const checks = ['TWK002', 'TWK003', 'TWK004'].map((code) => ({
    code,
    lineNet: sums[code],
    erpSlice: splits[code] ?? 0,
    ok: Math.abs(sums[code] - (splits[code] ?? 0)) < 0.05,
  }));

  return { classified, checks, splits, batch, twk3, twk4 };
}

function toCsv(rows, columns) {
  const hdr = columns.join(',');
  const body = rows
    .map((r) => columns.map((c) => {
      const v = String(r[c] ?? '');
      return v.includes(',') ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(','))
    .join('\n');
  return hdr + '\n' + body + '\n';
}

const { classified, checks, splits, batch, twk3, twk4 } = buildSplit();

console.log('STAT 123 multi-site split');
for (const c of checks) {
  console.log(`  ${c.code}: lines Σ net ${fmtR(c.lineNet)} vs ERP ${fmtR(c.erpSlice)} ${c.ok ? 'OK' : 'MISMATCH'}`);
}

const twk2Lines = classified.filter((r) => r.batch_id === BATCH_ID && r.debtor_code === 'TWK002');
const twk3Lines = classified.filter((r) => r.batch_id === BATCH_ID && r.debtor_code === 'TWK003');
const twk4Lines = classified.filter((r) => r.batch_id === BATCH_ID && r.debtor_code === 'TWK004');

if (write) {
  const columns = [
    'batch_id', 'line_type', 'doc_no', 'doc_date', 'our_ref', 'original_amount',
    'discount_amount', 'net_amount', 'discount_eligible', 'on_remittance', 'source_type', 'notes', 'debtor_code',
  ];
  fs.writeFileSync(LINES_CSV, toCsv(classified, columns));

  fs.mkdirSync(OUT, { recursive: true });
  const md = [];
  md.push('# STAT 123 — multi-site remittance split');
  md.push('');
  md.push('> One bank payment **00043500** · advice gross **R240,325.86** · zero discount');
  md.push(`> Source: \`raw/Remittances/18.02.2026.pdf\` · manifest \`data/remittance_manifest_2026.json\``);
  md.push('');
  md.push('## ERP slices vs remittance line nets');
  md.push('');
  md.push('| Site | Lines | Σ net (remittance) | ERP slice | Status |');
  md.push('| :--- | ---: | ---: | ---: | :--- |');
  md.push(`| TWK002 | ${twk2Lines.length} | ${fmtR(checks[0].lineNet)} | ${fmtR(checks[0].erpSlice)} | ${checks[0].ok ? 'OK' : 'REVIEW'} |`);
  md.push(`| TWK003 | ${twk3Lines.length} | ${fmtR(checks[1].lineNet)} | ${fmtR(checks[1].erpSlice)} | ${checks[1].ok ? 'OK' : 'REVIEW'} |`);
  md.push(`| TWK004 | ${twk4Lines.length} | ${fmtR(checks[2].lineNet)} | ${fmtR(checks[2].erpSlice)} | ${checks[2].ok ? 'OK' : 'REVIEW'} |`);
  md.push(`| **Σ** | ${twk2Lines.length + twk3Lines.length + twk4Lines.length} | ${fmtR(batch.cash_amount)} | ${fmtR(batch.erp_payment_gross * -1)} | |`);
  md.push('');
  md.push('## TWK003 lines (site enquiry docs)');
  md.push('');
  md.push('| Doc | Type | Net | On TWK003 TXT |');
  md.push('| :--- | :--- | ---: | :---: |');
  for (const r of twk3Lines) {
    md.push(`| ${clean(r.doc_no)} | ${r.line_type} | ${fmtR(r.net_amount)} | ${twk3.has(clean(r.doc_no)) ? '✓' : '—'} |`);
  }
  md.push('');
  md.push('## TWK004 lines');
  md.push('');
  md.push('| Doc | Type | Net | On TWK004 TXT |');
  md.push('| :--- | :--- | ---: | :---: |');
  for (const r of twk4Lines) {
    md.push(`| ${clean(r.doc_no)} | ${r.line_type} | ${fmtR(r.net_amount)} | ${twk4.has(clean(r.doc_no)) ? '✓' : '—'} |`);
  }
  md.push('');
  md.push('## Notes');
  md.push('');
  md.push('- CN doc **`10`** (R−6,900) is remittance shorthand — not on any site TXT; classified **TWK002** (default).');
  md.push('- TWK003 **R−300** after payment = site ledger hygiene; does not affect TWK002 restart ledger.');
  md.push('- `debtor_code` column written to `data/remittance_lines_2026.csv`.');
  md.push('');
  md.push('*Generated by `scripts/build_stat123_site_split.mjs`*');
  fs.writeFileSync(OUT_MD, md.join('\n'));

  console.log(`\nWrote ${path.relative(ROOT, LINES_CSV)}`);
  console.log(`Wrote ${path.relative(ROOT, OUT_MD)}`);
} else {
  console.log('\nDry run — pass --write to update remittance_lines_2026.csv');
}
