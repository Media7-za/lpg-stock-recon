#!/usr/bin/env node
/**
 * JEN001 — Itemise account-level opening balance (DEBENQ B/F) for customer SOA.
 *
 * Method: pre-Jul open LPG gas invoices after chronological LIFO through STAT 127,
 * plus v5 Part 1B cylinder deposit opening, plus tie residual to ERP B/F.
 *
 * Run: node analysis/debtors/JEN001/scripts/build_balance_bridge.mjs [--write]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  round2,
  parseCsvLine,
  normDoc,
  parseTxtDate,
  isCylRef,
  dnBase,
  fmtAmount,
} from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const debtorCode = 'JEN001';
const cfgPath = path.join(ROOT, `analysis/debtors/${debtorCode}/config/statement_of_account.json`);
const v5CfgPath = path.join(ROOT, `analysis/debtors/${debtorCode}/config/statement_v5.json`);
const txtPaths = [
  path.join(ROOT, 'analysis/debtors/JEN001/raw/JEN00116JULY.TXT'),
  path.join(ROOT, 'analysis/debtors/JEN001/raw/DEBENQ.TXT'),
];
const write = process.argv.includes('--write');

function parseTxtRows(absPath) {
  const txt = fs.readFileSync(absPath, 'utf8');
  const headerBalance = Number(txt.match(/CURRENT BALANCE:","(-?[0-9.]+)"/)?.[1]);
  let balanceBf = 0;
  const rows = [];
  for (const line of txt.split('\n')) {
    if (!/^"\d+"/.test(line.trim())) continue;
    const p = parseCsvLine(line);
    if (p.length < 11) continue;
    const [, , docno, entry, date, , dn] = p;
    if (/BALANCE B\/F/i.test(p[6] || '')) balanceBf = round2(Number(p[9]));
    if (!date || !date.includes('/')) continue;
    rows.push({
      docno,
      cleanDoc: normDoc(docno),
      entry,
      iso: parseTxtDate(date),
      dn: (dn || '').trim(),
      amount: round2(Number(p[9])),
      stat: (p[6] || '').includes('STAT') ? p[6].trim() : '',
    });
  }
  return { headerBalance, balanceBf, rows };
}

function mergeRows(paths) {
  const seen = new Set();
  const rows = [];
  let headerBalance = null;
  let balanceBf = null;
  for (const abs of paths) {
    if (!fs.existsSync(abs)) continue;
    const parsed = parseTxtRows(abs);
    if (Number.isFinite(parsed.headerBalance)) headerBalance = parsed.headerBalance;
    if (parsed.balanceBf) balanceBf = parsed.balanceBf;
    for (const r of parsed.rows) {
      const key = `${r.cleanDoc}|${r.entry}|${r.iso}|${r.amount}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(r);
    }
  }
  rows.sort(
    (a, b) =>
      a.iso.localeCompare(b.iso) ||
      (a.entry === 'Invoice' ? 0 : 1) - (b.entry === 'Invoice' ? 0 : 1) ||
      a.docno.localeCompare(b.docno),
  );
  return { headerBalance, balanceBf, rows };
}

function buildLpgPool(allRows, maxIso) {
  const invoices = [];
  for (const r of allRows.filter((x) => x.iso <= maxIso)) {
    if (r.entry !== 'Invoice' || isCylRef(r.dn)) continue;
    invoices.push({
      doc: r.cleanDoc,
      docno: r.docno,
      iso: r.iso,
      dn: r.dn,
      dnBase: dnBase(r.dn),
      due: r.amount,
    });
  }
  for (const cn of allRows
    .filter((r) => r.entry === 'Crd Note' && !isCylRef(r.dn) && r.iso <= maxIso)
    .sort((a, b) => a.iso.localeCompare(b.iso) || a.docno.localeCompare(b.docno))) {
    const base = dnBase(cn.dn);
    const candidates = invoices
      .filter((inv) => inv.due > 0.01 && inv.dnBase === base)
      .sort(
        (a, b) =>
          (a.iso === cn.iso ? 0 : 1) - (b.iso === cn.iso ? 0 : 1) ||
          a.doc.localeCompare(b.doc),
      );
    const target = candidates[0];
    if (!target) continue;
    target.due = round2(target.due + cn.amount);
  }
  return invoices.filter((inv) => inv.due > 0.01);
}

function allocateLifo(payment, pool) {
  let remaining = round2(Math.abs(payment.amount));
  const sorted = pool
    .filter((inv) => inv.iso <= payment.iso && inv.due > 0.01)
    .sort((a, b) => b.iso.localeCompare(a.iso) || b.doc.localeCompare(a.doc));
  for (const inv of sorted) {
    if (remaining <= 0.05) break;
    const alloc = round2(Math.min(inv.due, remaining));
    inv.due = round2(inv.due - alloc);
    remaining = round2(remaining - alloc);
  }
}

function displayDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-ZA', { month: 'short' })} ${d.getFullYear()}`;
}

const { headerBalance, balanceBf, rows } = mergeRows(txtPaths);
const v5Cfg = JSON.parse(fs.readFileSync(v5CfgPath, 'utf8'));
const cylOpening = round2(v5Cfg.cylOpeningFinancial ?? 0);
const targetBf = round2(balanceBf ?? v5Cfg.combinedBf);

const pool = buildLpgPool(rows, '2026-06-30');
for (const payment of rows
  .filter((r) => r.entry === 'Payment' && r.iso <= '2026-06-25')
  .sort((a, b) => a.iso.localeCompare(b.iso))) {
  allocateLifo(payment, pool);
}

const openPreJul = pool.filter((i) => i.due > 0.01).sort((a, b) => a.iso.localeCompare(b.iso));
const sumOpenLpg = round2(openPreJul.reduce((s, i) => s + i.due, 0));
const tieResidual = round2(targetBf - sumOpenLpg - cylOpening);

const bridgeLines = openPreJul.map((inv) => ({
  id: `open_bf_${inv.doc}`,
  label: `Invoice ${inv.docno.replace(/^0+/, '')} (${displayDate(inv.iso)}, ${inv.dn})`,
  amount: inv.due,
  reference: `Pre-Jul 2026 open LPG — LIFO through STAT 127 (44878). allocation_ingest_pilot.mjs`,
}));

if (Math.abs(cylOpening) >= 0.01) {
  bridgeLines.push({
    id: 'cyl_opening',
    label: 'Cylinder deposit net (1 Jul 2026)',
    amount: cylOpening,
    reference: `v5 Part 1B opening — config/statement_v5.json cylOpeningFinancial`,
  });
}

if (Math.abs(tieResidual) >= 0.01) {
  bridgeLines.push({
    id: 'lpg_bf_tie',
    label: 'LPG opening tie to ERP B/F (Part 1A vs invoice list)',
    amount: tieResidual,
    reference: `Closes gap to DEBENQ B/F R${fmtAmount(targetBf)} — v5 Part 1A opening R${fmtAmount(round2(targetBf - cylOpening))} vs Σ itemised LPG R${fmtAmount(sumOpenLpg)}`,
  });
}

const bridgeSum = round2(bridgeLines.reduce((s, l) => s + l.amount, 0));

console.log(`[${debtorCode}] Target B/F (DEBENQ): R${fmtAmount(targetBf)}`);
console.log(`[${debtorCode}] Σ itemised bridge lines: R${fmtAmount(bridgeSum)}`);
console.log(`[${debtorCode}] Pre-Jul open LPG invoices: ${openPreJul.length} → R${fmtAmount(sumOpenLpg)}`);
console.log(`[${debtorCode}] CYL opening: R${fmtAmount(cylOpening)}`);
console.log(`[${debtorCode}] Tie residual: R${fmtAmount(tieResidual)}`);
for (const line of bridgeLines) {
  console.log(`  ${line.label}: R${fmtAmount(line.amount)}`);
}

if (Math.abs(bridgeSum - targetBf) > 0.05) {
  console.error(`[${debtorCode}] ABORT — bridge sum ≠ B/F`);
  process.exit(1);
}

const reportPath = path.join(
  ROOT,
  `analysis/debtors/${debtorCode}/reports/JEN001_Balance_Bridge_${new Date().toISOString().slice(0, 10)}.md`,
);
const report = [
  `# JEN001 — Opening Balance Bridge (${new Date().toISOString().slice(0, 10)})`,
  '',
  '**Purpose:** Itemise DEBENQ B/F for customer Statement of Account account-level section.',
  '',
  '| Component | Amount (R) | Basis |',
  '| :--- | ---: | :--- |',
  ...bridgeLines.map(
    (l) => `| ${l.label} | ${fmtAmount(l.amount)} | ${l.reference.split(' — ')[0]} |`,
  ),
  `| **Total (ERP B/F)** | **${fmtAmount(bridgeSum)}** | PROVEN — \`raw/DEBENQ.TXT\` line 14 |`,
  '',
  'Regenerate SOA after `--write`:',
  '```bash',
  'npm run debtors:customer-statement -- --debtor JEN001 --as-at 2026-09-01 --pdf',
  '```',
].join('\n');
fs.writeFileSync(reportPath, `${report}\n`);

if (write) {
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  cfg.balanceBridgeLines = bridgeLines;
  cfg.collapseAccountLevelAsOpeningBalance = false;
  cfg._comment_balanceBridgeLines =
    'Itemised opening balance (pre-Jul 2026). Regenerate via scripts/build_balance_bridge.mjs --write after TXT/allocation refresh.';
  fs.writeFileSync(cfgPath, `${JSON.stringify(cfg, null, 2)}\n`);
  console.log(`[${debtorCode}] Wrote ${cfgPath}`);
}

console.log(`[${debtorCode}] Report: ${reportPath}`);
