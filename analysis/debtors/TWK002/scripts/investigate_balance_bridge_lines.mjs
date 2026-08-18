/**
 * Investigate the two account-level bridge lines on TWK002 statement.
 * Run: node analysis/debtors/TWK002/scripts/investigate_balance_bridge_lines.mjs [--write]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parseDebenqWithRunning,
  computeOpenInvoices,
  round2,
  normDoc,
  PAYMENT_TYPES,
  fmtAmount,
} from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const cfgPath = path.join(ROOT, 'analysis/debtors/TWK002/config/statement_of_account.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const write = process.argv.includes('--write');

const { headerBalance, balanceBf, rows } = parseDebenqWithRunning(
  path.join(ROOT, 'analysis/debtors/TWK002/raw/DEBENQ_TWK002.TXT'),
);
const open = computeOpenInvoices(rows, cfg.closedInvoiceOverrides || []);
const openKeys = new Set(open.map((i) => i.key));
const sumOpen = round2(open.reduce((s, i) => s + i.due, 0));
const gap = round2(headerBalance - sumOpen);
const overrideDocs = new Set((cfg.closedInvoiceOverrides || []).map((o) => normDoc(o.doc)));
const hasInvoiceRow = new Set(rows.filter((r) => r.entry === 'Invoice').map((r) => normDoc(r.cleanDoc)));

function classifyRow(r) {
  if (r.entry === 'Invoice') {
    const d = normDoc(r.cleanDoc);
    if (openKeys.has(d)) return 'open_invoice';
    if (overrideDocs.has(d)) return 'override_invoice';
    return 'closed_invoice';
  }
  if (r.entry === 'Crd Note' || PAYMENT_TYPES.has(r.entry)) {
    if (!r.invno) return 'untagged_settlement';
    const d = normDoc(r.invno);
    if (openKeys.has(d)) return 'open_invoice';
    if (overrideDocs.has(d)) return 'override_invoice';
    if (!hasInvoiceRow.has(d)) return 'phantom_cn';
    return 'closed_invoice';
  }
  return 'other';
}

const bucketSum = (name) =>
  round2(rows.filter((r) => classifyRow(r) === name).reduce((s, r) => s + r.amount, 0));

const bf = balanceBf;
const overrideNet = bucketSum('override_invoice');
const phantomNet = bucketSum('phantom_cn');
const closedNet = bucketSum('closed_invoice');
const untaggedNet = bucketSum('untagged_settlement');
const residual = round2(bf + overrideNet + phantomNet + closedNet);

const untaggedRows = rows.filter((r) => classifyRow(r) === 'untagged_settlement');
const stat112 = untaggedRows.filter((r) => (r.docno || '').includes('37770'));
const stat114 = untaggedRows.filter((r) => (r.docno || '').includes('39080'));
const stat123 = untaggedRows.filter((r) => (r.docno || '').includes('43500'));
const pathB2023 = untaggedRows.filter((r) => r.iso === '2026-07-12' && (r.docno || '').includes('491'));
const pathB2024 = untaggedRows.filter((r) => r.iso === '2026-07-23');
const pathB2025 = untaggedRows.filter((r) => r.iso === '2026-08-09');

const subLines = [
  {
    id: 'bf_carry',
    label: 'BALANCE B/F (pre–Mar 2025 export window)',
    amount: bf,
    reference: 'TXT BALANCE B/F line — pre-window debt not on open invoice table',
  },
  {
    id: 'override_42468_42470',
    label: 'Override invoices 42468/42470 (paid on remittance, ERP untagged)',
    amount: overrideNet,
    reference: 'STAT 114 BATCH-2025-05-31; closedInvoiceOverrides',
  },
  {
    id: 'phantom_cn_nets',
    label: 'Path B phantom journal nets (invno refs without Invoice row)',
    amount: phantomNet,
    reference: '00000490–496, 00000492/493, 00000503–006; net +R690 = 2023 variance',
  },
  {
    id: 'stat112_untagged',
    label: 'STAT 112 receipt 00037770 (fully untagged)',
    amount: round2(stat112.reduce((s, r) => s + r.amount, 0)),
    reference: 'BATCH-2025-03-31; remit cash R35,693.84',
  },
  {
    id: 'stat114_untagged',
    label: 'STAT 114 untagged slice 00039080',
    amount: round2(stat114.reduce((s, r) => s + r.amount, 0)),
    reference: 'Partial slice; tagged sibling −R8,058.97 on inv 42050',
  },
  {
    id: 'stat123_orphan',
    label: 'STAT 123 orphan slice 00043500',
    amount: round2(stat123.reduce((s, r) => s + r.amount, 0)),
    reference: 'H-013/H-014; 19 tagged siblings on same receipt',
  },
  {
    id: 'pathb_journals_untagged',
    label: 'Path B discount journals (blank INVNO)',
    amount: round2(
      pathB2023.reduce((s, r) => s + r.amount, 0) +
        pathB2024.reduce((s, r) => s + r.amount, 0) +
        pathB2025.reduce((s, r) => s + r.amount, 0),
    ),
    reference: '00000491 (−R3,329.12), 00000499–502, 00000507–509',
  },
];

const subSum = round2(subLines.reduce((s, l) => s + l.amount, 0));

console.log('Bridge line investigation');
console.log('  gap', fmtAmount(gap));
console.log('  residual (bf+override+phantom+closed)', fmtAmount(residual));
console.log('  untagged', fmtAmount(untaggedNet));
console.log('  subLines sum', fmtAmount(subSum), subSum === gap ? 'OK' : 'MISMATCH');
console.log('');
for (const l of subLines) {
  console.log(`  ${fmtAmount(l.amount).padStart(12)}  ${l.label}`);
}

if (write) {
  const out = {
    generated: new Date().toISOString().slice(0, 10),
    gap,
    sumOpenInvoices: sumOpen,
    headerBalance,
    balanceBridgeLines: subLines,
    bridgeSum: subSum,
    ties: Math.abs(subSum + sumOpen - headerBalance) < 0.05,
  };
  const jsonPath = path.join(ROOT, 'analysis/debtors/TWK002/config/balance_bridge_lines_detailed.json');
  fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2) + '\n');

  cfg.balanceBridgeLines = subLines;
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
  console.log('\nWritten:', jsonPath);
  console.log('Updated:', cfgPath, 'balanceBridgeLines (7 sub-lines)');
}
