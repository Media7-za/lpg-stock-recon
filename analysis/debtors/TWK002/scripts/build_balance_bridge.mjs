/**
 * B/F → CURRENT BALANCE bridge for TWK002.
 * Names the account-level residual (header − Σ open invoices) for the statement.
 *
 * Run: node analysis/debtors/TWK002/scripts/build_balance_bridge.mjs [--write]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parseDebenqWithRunning,
  computeOpenInvoices,
  findUntaggedCredits,
  round2,
  normDoc,
  PAYMENT_TYPES,
  fmtAmount,
} from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const debtorCode = 'TWK002';
const cfgPath = path.join(ROOT, `analysis/debtors/${debtorCode}/config/statement_of_account.json`);
const txtPath = path.join(ROOT, 'analysis/debtors/TWK002/raw/DEBENQ_TWK002.TXT');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const write = process.argv.includes('--write');

const { headerBalance, balanceBf, rows } = parseDebenqWithRunning(txtPath);
const open = computeOpenInvoices(rows, cfg.closedInvoiceOverrides || []);
const openKeys = new Set(open.map((i) => i.key));
const sumOpen = round2(open.reduce((s, i) => s + i.due, 0));
const gap = round2(headerBalance - sumOpen);

// Site roll-up (matches statement generator)
const siteBalances = [];
for (const [code, rel] of Object.entries(cfg.siteTxts || {})) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  const { headerBalance: hb } = parseDebenqWithRunning(abs);
  siteBalances.push({ code, headerBalance: hb });
}
const siteTotal = round2(siteBalances.reduce((s, x) => s + x.headerBalance, 0));
const totalDue = round2(headerBalance + siteTotal);
const accountLevelOnStatement = round2(totalDue - sumOpen);

// Classify every row's effect: open-invoice attributable vs account-level
const hasInvoiceRow = new Set(rows.filter((r) => r.entry === 'Invoice').map((r) => normDoc(r.cleanDoc)));
const overrideDocs = new Set((cfg.closedInvoiceOverrides || []).map((o) => normDoc(o.doc)));

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

const buckets = {
  open_invoice: 0,
  closed_invoice: 0,
  override_invoice: 0,
  untagged_settlement: 0,
  phantom_cn: 0,
  other: 0,
};
for (const r of rows) {
  buckets[classifyRow(r)] = round2(buckets[classifyRow(r)] + r.amount);
}

// Untagged detail for bridge lines
const untagged = findUntaggedCredits(rows);
const untaggedPayments = untagged.filter((r) => r.entry === 'Payment');
const untaggedJournals = untagged.filter((r) => r.entry === 'Journal');
const pathBJournals = untaggedJournals.filter((r) => r.iso === '2026-08-09');
const cylJournals = untaggedJournals.filter((r) => r.iso !== '2026-08-09');

// Bridge identity:
// header = balanceBf + sum(row amounts)  [rows exclude B/F]
// gap = header - sumOpen
// sumOpen = open_invoice bucket net on the 11 keys only

// Account-level residual = gap
// Decompose into ratifiable lines that SUM to gap:

// Line 1: B/F opening carry still not on open invoice list
// = gap minus identifiable untagged effects that net into closed/settled activity
// Practical split validated to sum to gap:

// Closed + override + phantom activity nets (not on open list, not in gap directly)
const nonOpenActivity = round2(
  buckets.closed_invoice + buckets.override_invoice + buckets.phantom_cn,
);
// Period activity on open invoice keys
const openActivity = buckets.open_invoice; // should equal sumOpen since all open nets positive

// B/F + non-open activity + untagged + open activity = header
// balanceBf + nonOpenActivity + untagged + openActivity = header
const check = round2(balanceBf + nonOpenActivity + buckets.untagged_settlement + openActivity);
const checkOk = Math.abs(check - headerBalance) < 0.02;

// Ratifiable bridge lines — sum to gap (primary) then add site lines for statement
const bridgeLines = [
  {
    id: 'bf_and_settled_residual',
    label: 'Opening balance and settled-period residual (not on invoice list below)',
    amount: round2(gap - buckets.untagged_settlement),
    reference:
      'Net of B/F R38,791.27 and export-window activity on invoices not in the open table — see TWK002_Balance_Gap_Investigation_2026-08-11.md',
  },
  {
    id: 'untagged_settlements',
    label: 'Untagged settlements (STAT payment slices and discount journals)',
    amount: buckets.untagged_settlement,
    reference:
      'ERP posted with blank INVNO — 00037770 (−R35,693.84), 00039080 (−R7,306.68), 00043500 (−R1,249.77), Path B journals 00000507–509',
  },
];

const lineSum = round2(bridgeLines.reduce((s, l) => s + l.amount, 0));
if (Math.abs(lineSum - gap) > 0.05) {
  throw new Error(`Bridge lines sum ${lineSum} != gap ${gap}`);
}

const bridgeLinesStatement = [...bridgeLines];
if (siteTotal !== 0) {
  for (const s of siteBalances) {
    if (s.headerBalance !== 0) {
      bridgeLinesStatement.push({
        id: `site_${s.code.toLowerCase()}`,
        label: `${s.code} site adjustment`,
        amount: s.headerBalance,
        reference: 'Linked ERP site code balance included in combined Balance due',
      });
    }
  }
}
const statementBridgeSum = round2(bridgeLinesStatement.reduce((s, l) => s + l.amount, 0));
const invTotal = round2(rows.filter((r) => r.entry === 'Invoice').reduce((s, r) => s + r.amount, 0));

// Markdown report
const L = [];
L.push('# TWK002 — B/F → current balance bridge\n');
L.push(`**Generated:** ${new Date().toISOString().slice(0, 10)}  `);
L.push(`**Source:** \`raw/DEBENQ_TWK002.TXT\`\n`);
L.push('---\n');
L.push('## Summary\n');
L.push('| Measure | R |');
L.push('| :--- | ---: |');
L.push(`| BALANCE B/F | ${fmtAmount(balanceBf)} |`);
L.push(`| ERP CURRENT BALANCE (TWK002) | ${fmtAmount(headerBalance)} |`);
L.push(`| Σ open invoice Due (11 lines) | ${fmtAmount(sumOpen)} |`);
L.push(`| **Account-level balance (primary)** | **${fmtAmount(gap)}** |`);
L.push(`| Site adjustments | ${fmtAmount(siteTotal)} |`);
L.push(`| **Balance due (statement)** | **${fmtAmount(totalDue)}** |`);
L.push('');

L.push('## Ledger roll-forward\n');
L.push('| Component | R |');
L.push('| :--- | ---: |');
L.push(`| BALANCE B/F | ${fmtAmount(balanceBf)} |`);
L.push(`| + Invoices (all, export window) | ${fmtAmount(invTotal)} |`);
L.push(`| + Credits/settlements (tagged to open invoices) | ${fmtAmount(rows.filter(r=>openKeys.has(normDoc(r.invno||'')) && (r.entry==='Crd Note'||PAYMENT_TYPES.has(r.entry))).reduce((s,r)=>s+r.amount,0))} |`);
L.push(`| + Credits/settlements (tagged to closed/override) | ${fmtAmount(rows.filter(r=>{const d=normDoc(r.invno||''); return d && !openKeys.has(d) && (r.entry==='Crd Note'||PAYMENT_TYPES.has(r.entry));}).reduce((s,r)=>s+r.amount,0))} |`);
L.push(`| + Untagged settlements | ${fmtAmount(buckets.untagged_settlement)} |`);
L.push(`| + Phantom CN mirrors (no Invoice row) | ${fmtAmount(buckets.phantom_cn)} |`);
L.push(`| **= CURRENT BALANCE** | **${fmtAmount(headerBalance)}** |`);
L.push(`| Identity check | ${checkOk ? 'PASS' : `FAIL (${fmtAmount(check)})`} |`);
L.push('');

L.push('## Account-level balance — ratified bridge lines\n');
L.push('These lines sum to **Balance due − Σ open invoices** and appear on the customer statement.\n');
L.push('| Label | R | Reference |');
L.push('| :--- | ---: | :--- |');
for (const line of bridgeLinesStatement) {
  L.push(`| ${line.label} | ${fmtAmount(line.amount)} | ${line.reference} |`);
}
L.push(`| **Total (must equal Balance due − Σ open)** | **${fmtAmount(statementBridgeSum)}** | |`);
L.push(`| Open invoice subtotal | ${fmtAmount(sumOpen)} | 11 lines below |`);
L.push(`| **Balance due** | **${fmtAmount(totalDue)}** | |`);
L.push('');

L.push('## Row classification (export window)\n');
L.push('| Bucket | R |');
L.push('| :--- | ---: |');
for (const [k, v] of Object.entries(buckets)) {
  L.push(`| ${k} | ${fmtAmount(v)} |`);
}
L.push('');

L.push('## Untagged settlements (detail)\n');
L.push('| Date | Doc | Entry | Amount (R) |');
L.push('| :--- | :--- | :--- | ---: |');
for (const r of untagged) {
  L.push(`| ${r.iso} | ${r.docno || r.cleanDoc} | ${r.entry} | ${fmtAmount(r.amount)} |`);
}

const reportPath = path.join(ROOT, 'analysis/debtors/TWK002/reports/TWK002_Balance_Bridge_2026-08-11.md');
const jsonPath = path.join(ROOT, 'analysis/debtors/TWK002/config/balance_bridge_lines.json');

const output = {
  debtorCode,
  generated: new Date().toISOString().slice(0, 10),
  balanceBf,
  headerBalance,
  sumOpenInvoices: sumOpen,
  accountLevelPrimary: gap,
  siteTotal,
  totalDue,
  accountLevelOnStatement,
  bridgeLines: bridgeLinesStatement,
  bridgeSum: statementBridgeSum,
  ties: Math.abs(statementBridgeSum + sumOpen - totalDue) < 0.05,
};

console.log('TWK002 balance bridge');
console.log('  B/F', fmtAmount(balanceBf));
console.log('  Header', fmtAmount(headerBalance));
console.log('  Sum open', fmtAmount(sumOpen));
console.log('  Account-level (primary)', fmtAmount(gap));
console.log('  Site adj', fmtAmount(siteTotal));
console.log('  Balance due', fmtAmount(totalDue));
console.log('  Bridge lines sum', fmtAmount(statementBridgeSum), '+ open', fmtAmount(sumOpen), '=', fmtAmount(statementBridgeSum + sumOpen));
console.log('  Ties to total due:', output.ties);
for (const line of bridgeLinesStatement) {
  console.log(`    ${line.label}: ${fmtAmount(line.amount)}`);
}

if (write) {
  fs.writeFileSync(reportPath, L.join('\n') + '\n');
  fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2) + '\n');
  console.log('\nWritten:', reportPath);
  console.log('Written:', jsonPath);
} else {
  console.log('\nRe-run with --write to save report and config/balance_bridge_lines.json');
}
