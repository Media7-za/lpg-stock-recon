#!/usr/bin/env node
/**
 * TWK002 — full-history transaction ledger (invoices, CNs, payments, journals).
 * Complements the open-invoice fork; shows every row from TWK002_FULL_HISTORY.TXT.
 *
 * Run: node analysis/debtors/TWK002/scripts/build_full_history_ledger.mjs [--write]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCsvLine, parseTxtDate, fmtAmount } from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const RAW = path.join(ROOT, 'analysis/debtors/TWK002/raw');
const OUT_DIR = path.join(ROOT, 'analysis/debtors/TWK002/reports/fork');
const write = process.argv.includes('--write');

const TXT = path.join(RAW, 'TWK002_FULL_HISTORY.TXT');
const OUT_MD = path.join(OUT_DIR, 'TWK002_Full_History_Ledger.md');

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

function parseFullHistory(absPath) {
  const lines = fs.readFileSync(absPath, 'utf8').split(/\r?\n/).filter(Boolean);
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
    if (p[6] === 'BALANCE B/F:') {
      rows.push({
        kind: 'bf',
        iso: null,
        date: '',
        entry: 'Opening',
        docno: '—',
        invno: '',
        ref: 'BALANCE B/F',
        amount: round2(p[9]),
        balance: round2(p[10]),
      });
      continue;
    }
    if (!p[4]?.includes('/')) continue;
    rows.push({
      kind: 'txn',
      iso: parseTxtDate(p[4]),
      date: p[4],
      entry: p[3],
      docno: p[2]?.replace(/^0+/, '') || p[2],
      invno: p[5]?.replace(/^0+/, '') || '',
      ref: [p[6], p[8]].filter(Boolean).join(' · ') || '—',
      amount: round2(p[9]),
      balance: round2(p[10]),
    });
  }
  return { header, rows };
}

function monthKey(iso) {
  if (!iso) return '0000-00';
  return iso.slice(0, 7);
}

function monthLabel(key) {
  if (key === '0000-00') return 'Opening';
  const [y, m] = key.split('-');
  const d = new Date(`${y}-${m}-01T12:00:00`);
  return d.toLocaleString('en-ZA', { month: 'long', year: 'numeric' });
}

function displayShortDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-ZA', { month: 'short' })} ${d.getFullYear()}`;
}

function buildLedger() {
  const { header, rows } = parseFullHistory(TXT);
  const byMonth = new Map();
  for (const r of rows) {
    const mk = r.kind === 'bf' ? '0000-00' : monthKey(r.iso);
    if (!byMonth.has(mk)) byMonth.set(mk, []);
    byMonth.get(mk).push(r);
  }

  const paymentTypes = new Set(['Payment', 'Ud Paymnt', 'Bank XFer', 'Bank UD', 'Bank Dep']);
  let paymentCount = 0;
  let paymentTotal = 0;
  for (const r of rows) {
    if (paymentTypes.has(r.entry)) {
      paymentCount++;
      paymentTotal = round2(paymentTotal + r.amount);
    }
  }

  const md = [];
  md.push('# TWK002 — full-history transaction ledger');
  md.push('');
  md.push('> **ANALYTICAL FORK — includes payments, journals, and credit notes**');
  md.push(`> Source: \`raw/TWK002_FULL_HISTORY.TXT\` · ERP header **R${fmtAmount(round2(Number(header['CURRENT BALANCE'])))}**`);
  md.push('');
  md.push('| Summary | Value |');
  md.push('| :--- | ---: |');
  md.push(`| Transaction rows | ${rows.filter((r) => r.kind === 'txn').length} |`);
  md.push(`| Payment rows | ${paymentCount} |`);
  md.push(`| Σ payment amounts | R${fmtAmount(paymentTotal)} |`);
  md.push(`| Closing balance | R${fmtAmount(round2(Number(header['CURRENT BALANCE'])))} |`);
  md.push('');
  md.push('The open-invoice fork (`TWK002_Statement_of_Account_FullHistory.md`) lists **unsettled invoices only** — payments are intentionally omitted there.');
  md.push('');
  md.push('---');
  md.push('');

  for (const mk of [...byMonth.keys()].sort()) {
    const monthRows = byMonth.get(mk);
    md.push(`## ${monthLabel(mk)}`);
    md.push('');
    md.push('| Date | Entry | Doc # | Inv | Reference | Amount (R) | Balance (R) |');
    md.push('| :--- | :--- | :--- | :--- | :--- | ---: | ---: |');
    for (const r of monthRows) {
      const dateCell = r.kind === 'bf' ? '—' : displayShortDate(r.iso);
      const amt = r.amount < 0 ? `(${fmtAmount(Math.abs(r.amount))})` : fmtAmount(r.amount);
      md.push(
        `| ${dateCell} | ${r.entry} | ${r.docno} | ${r.invno || '—'} | ${r.ref.replace(/\|/g, '/')} | ${amt} | ${fmtAmount(r.balance)} |`,
      );
    }
    md.push('');
    md.push('---');
    md.push('');
  }

  return { md: md.join('\n'), paymentCount, headerBalance: round2(Number(header['CURRENT BALANCE'])) };
}

const { md, paymentCount, headerBalance } = buildLedger();
console.log(`Ledger: ${paymentCount} payment rows · closing R${fmtAmount(headerBalance)}`);

if (write) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_MD, md);
  console.log(`Wrote ${path.relative(ROOT, OUT_MD)}`);
} else {
  console.log('Dry run — pass --write to emit');
}
