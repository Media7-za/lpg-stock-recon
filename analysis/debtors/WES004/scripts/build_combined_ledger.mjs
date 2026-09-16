#!/usr/bin/env node
/**
 * Merge WES002 + WES004 (same customer, two ERP debtor codes -- see
 * project.json history) into a single synthetic DEBENQ-format ledger so the
 * account can be presented and reconciled as one continuous account instead
 * of two side-by-side balances.
 *
 * This is a DERIVED artifact, not a raw ERP export: every row is transcribed
 * unmodified from WES002CURRENT16092026.TXT / WES004CURRENT16092026.TXT,
 * merged by date (Rule 2: same-day Invoice/Payment before Crd Note) and
 * given one recomputed running balance from a combined BALANCE B/F of 0.00
 * (both source B/F rows are 0.00). The two source files are retained
 * unmodified in raw/ as the actual ERP ground truth.
 *
 * Usage: node analysis/debtors/WES004/scripts/build_combined_ledger.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCsvLine, parseTxtDate, normDoc, round2 } from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

const SOURCES = [
  { code: 'WES002', rel: 'analysis/debtors/WES004/raw/WES002CURRENT16092026.TXT' },
  { code: 'WES004', rel: 'analysis/debtors/WES004/raw/WES004CURRENT16092026.TXT' },
];

const OUT_REL = 'analysis/debtors/WES004/raw/WES004_WES002_COMBINED16092026.TXT';

function parseRaw(absPath, code) {
  const txt = fs.readFileSync(absPath, 'utf8');
  const headerBalance = Number(txt.match(/CURRENT BALANCE:","(-?[0-9.]+)"/)?.[1]);
  const rows = [];
  for (const line of txt.split('\n')) {
    if (!/^"\d+"/.test(line.trim())) continue;
    const p = parseCsvLine(line);
    if (p.length < 11) continue;
    const [, period, docno, entry, date, invno, custRef, order, ref] = p;
    const amount = round2(Number(p[9]));
    if (/BALANCE B\/F/i.test(custRef || '')) continue; // recomputed below, not carried per-source
    if (!date || !date.includes('/')) continue;
    rows.push({ code, period, docno, entry, date, iso: parseTxtDate(date), invno, custRef, order, ref, amount });
  }
  return { headerBalance, rows };
}

const ENTRY_SORT_RANK = { Invoice: 0, Payment: 0, Journal: 0, 'Crd Note': 1 };

function main() {
  const all = [];
  let combinedHeaderTotal = 0;
  for (const { code, rel } of SOURCES) {
    const abs = path.join(ROOT, rel);
    const { headerBalance, rows } = parseRaw(abs, code);
    combinedHeaderTotal = round2(combinedHeaderTotal + headerBalance);
    all.push(...rows);
  }

  // Rule 2 (business_rules.md): same-day, Invoice/Payment before Crd Note.
  all.sort((a, b) => {
    if (a.iso !== b.iso) return a.iso.localeCompare(b.iso);
    const rankDiff = (ENTRY_SORT_RANK[a.entry] ?? 0) - (ENTRY_SORT_RANK[b.entry] ?? 0);
    if (rankDiff !== 0) return rankDiff;
    return normDoc(a.docno).localeCompare(normDoc(b.docno), undefined, { numeric: true });
  });

  // Detect any doc_no collision across the two codes before trusting a merge.
  const seen = new Map();
  for (const r of all) {
    const key = normDoc(r.docno);
    if (!key) continue;
    if (seen.has(key) && seen.get(key) !== r.code) {
      console.error(`DOC_NO COLLISION: ${r.docno} appears in both ${seen.get(key)} and ${r.code} -- abort, do not trust a merge until resolved.`);
      process.exitCode = 1;
      return;
    }
    seen.set(key, r.code);
  }

  let running = 0;
  const outRows = all.map((r, i) => {
    running = round2(running + r.amount);
    return [
      String(i + 2),
      r.period,
      r.docno,
      r.entry,
      r.date,
      r.invno,
      r.custRef,
      r.order,
      r.ref,
      r.amount.toFixed(2),
      running.toFixed(2),
    ];
  });

  const finalBalance = running;
  const varianceVsErp = round2(finalBalance - combinedHeaderTotal);

  const csvEscape = (v) => `"${String(v ?? '')}"`;
  const lines = [];
  lines.push(csvEscape('ACCOUNT:') + ',' + csvEscape('WES004+WES002 - WEST COAST FISH & CHIPS (COMBINED)'));
  lines.push(csvEscape('ACCOUNT CURRENCY:') + ',' + csvEscape('Local'));
  lines.push(csvEscape('DISPLAY CURRENCY:') + ',' + csvEscape('Local'));
  lines.push(csvEscape('CURRENT BALANCE:') + ',' + csvEscape(finalBalance.toFixed(2)));
  lines.push(csvEscape('UD PAY/CHEQUES:') + ',' + csvEscape('0.00'));
  lines.push(csvEscape('CREDIT CLAIMS:') + ',' + csvEscape('0.00'));
  lines.push(csvEscape('TOTAL EXCLUDING UD/CLAIMS:') + ',' + csvEscape(finalBalance.toFixed(2)));
  lines.push(csvEscape('SORT ORDER:') + ',' + csvEscape('DOCUMENT DATE'));
  lines.push(csvEscape('YEAR:') + ',' + csvEscape('CURRENT'));
  lines.push(csvEscape('INCLUDE:') + ',' + csvEscape('UD PAYMENTS, UD CHEQUES, CREDIT CLAIMS'));
  lines.push('');
  lines.push(
    ['LINE', 'PERIOD', 'DOCNO', 'ENTRY', 'DATE', 'INVNO', 'CUSTOMER/BANK REF', 'ORDER', 'REFERENCE', 'AMOUNT', 'BALANCE']
      .map(csvEscape)
      .join(','),
  );
  lines.push(
    ['1', '', '', '', '', '', 'BALANCE B/F:', '', '', '0.00', '0.00'].map(csvEscape).join(','),
  );
  for (const row of outRows) {
    lines.push(row.map(csvEscape).join(','));
  }
  lines.push(csvEscape(`TOTAL TRANSACTIONS: ${finalBalance.toFixed(2)}`) + ',' + Array(10).fill(csvEscape('')).join(','));
  lines.push('');

  const outAbs = path.join(ROOT, OUT_REL);
  fs.writeFileSync(outAbs, lines.join('\n'));

  console.log(`Merged ${all.length} rows (WES002 + WES004) -> ${OUT_REL}`);
  console.log(`Combined ERP header total (WES002 CURRENT BALANCE + WES004 CURRENT BALANCE): R${combinedHeaderTotal.toFixed(2)}`);
  console.log(`Recomputed running-balance close: R${finalBalance.toFixed(2)}`);
  console.log(`Variance: R${varianceVsErp.toFixed(2)} ${varianceVsErp === 0 ? '(ZERO VARIANCE ✓)' : '(INVESTIGATE)'}`);
}

main();
