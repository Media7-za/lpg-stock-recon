#!/usr/bin/env node
/**
 * JEN001 — Stripped-gas payment-pattern allocation pilot (Turn 2)
 *
 * Method: LPG-only invoice amounts from ERP TXT (EMPTY pairs stripped).
 * Allocation: LIFO (newest open gas invoice first) applied chronologically
 * across all STAT payments — validated on STAT 127 before reporting STAT 129.
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
  displayDate,
} from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const ACCOUNT = 'JEN001';
const TXT_PATHS = [
  path.join(ROOT, 'analysis/debtors/JEN001/raw/JEN00116JULY.TXT'),
  path.join(ROOT, 'analysis/debtors/JEN001/raw/DEBENQ.TXT'),
];
const PILOT_PAYMENTS = ['44878', '45717'];
const TOL = 0.05;

const fmtR = (n) => `R${fmtAmount(n)}`;

function parseTxtRows(absPath) {
  const txt = fs.readFileSync(absPath, 'utf8');
  const headerBalance = Number(txt.match(/CURRENT BALANCE:","(-?[0-9.]+)"/)?.[1]);
  const rows = [];
  for (const line of txt.split('\n')) {
    if (!/^"\d+"/.test(line.trim())) continue;
    const p = parseCsvLine(line);
    if (p.length < 11) continue;
    const [, , docno, entry, date, invno, dn] = p;
    if (!date || !date.includes('/')) continue;
    const ref = (p[6] || '').trim();
    rows.push({
      docno,
      cleanDoc: normDoc(docno),
      entry,
      iso: parseTxtDate(date),
      invno: normDoc(invno),
      dn: (dn || '').trim(),
      amount: round2(Number(p[9])),
      stat: ref.includes('STAT') ? ref : '',
    });
  }
  return { headerBalance, rows };
}

function mergeRows(paths) {
  const seen = new Set();
  const rows = [];
  let headerBalance = null;
  for (const abs of paths) {
    if (!fs.existsSync(abs)) continue;
    const parsed = parseTxtRows(abs);
    if (Number.isFinite(parsed.headerBalance)) headerBalance = parsed.headerBalance;
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
  return { headerBalance, rows };
}

function buildLpgInvoicePool(rows) {
  const invoices = [];
  for (const r of rows) {
    if (r.entry !== 'Invoice' || isCylRef(r.dn)) continue;
    invoices.push({
      doc: r.cleanDoc,
      docno: r.docno,
      iso: r.iso,
      dn: r.dn,
      dnBase: dnBase(r.dn),
      gross: r.amount,
      due: r.amount,
    });
  }
  const gasCns = rows
    .filter((r) => r.entry === 'Crd Note' && !isCylRef(r.dn))
    .sort((a, b) => a.iso.localeCompare(b.iso) || a.docno.localeCompare(b.docno));

  for (const cn of gasCns) {
    const base = dnBase(cn.dn);
    const candidates = invoices.filter((inv) => inv.due > 0.01 && inv.dnBase === base);
    candidates.sort(
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

function allocateLifo(payment, openPool) {
  const sorted = openPool
    .filter((inv) => inv.iso <= payment.iso && inv.due > 0.01)
    .sort((a, b) => b.iso.localeCompare(a.iso) || b.doc.localeCompare(a.doc));

  let remaining = round2(Math.abs(payment.amount));
  const edges = [];

  for (const inv of sorted) {
    if (remaining <= TOL) break;
    const alloc = round2(Math.min(inv.due, remaining));
    if (alloc <= TOL) continue;
    edges.push({
      payment_doc: payment.cleanDoc,
      payment_date: payment.iso,
      payment_amount: round2(Math.abs(payment.amount)),
      stat: payment.stat,
      target_doc: inv.doc,
      target_docno: inv.docno,
      target_date: inv.iso,
      target_dn: inv.dn,
      lpg_open_before: round2(inv.due),
      allocated_amount: alloc,
      variance: round2(inv.due - alloc),
      allocation_type: alloc + TOL >= inv.due ? 'LIFO_FULL' : 'LIFO_PARTIAL',
      confidence: 'PATTERN_LIFO',
      review_required: alloc + TOL < inv.due,
    });
    inv.due = round2(inv.due - alloc);
    remaining = round2(remaining - alloc);
  }

  return { edges, unallocated: remaining };
}

function runChronologicalAllocation(rows, pool) {
  const payments = rows
    .filter((r) => r.entry === 'Payment')
    .sort((a, b) => a.iso.localeCompare(b.iso) || a.docno.localeCompare(b.docno));

  const allEdges = [];
  let edgeId = 1;
  let groupId = 1;

  for (const payment of payments) {
    const { edges, unallocated } = allocateLifo(payment, pool);
    const ag = `AG-${String(groupId++).padStart(6, '0')}`;
    for (const e of edges) {
      allEdges.push({
        allocation_id: `AL-${String(edgeId++).padStart(4, '0')}`,
        allocation_group_id: ag,
        ...e,
      });
    }
    if (unallocated > TOL) {
      allEdges.push({
        allocation_id: `AL-${String(edgeId++).padStart(4, '0')}`,
        allocation_group_id: '',
        payment_doc: payment.cleanDoc,
        payment_date: payment.iso,
        payment_amount: round2(Math.abs(payment.amount)),
        stat: payment.stat,
        target_doc: '',
        target_docno: '',
        target_date: '',
        target_dn: '',
        lpg_open_before: 0,
        allocated_amount: 0,
        variance: unallocated,
        allocation_type: 'UNALLOCATED_REMAINDER',
        confidence: 'PATTERN_LIFO',
        review_required: true,
      });
    }
  }

  return allEdges;
}

function main() {
  const { headerBalance, rows } = mergeRows(TXT_PATHS);
  const pool = buildLpgInvoicePool(rows);
  const allEdges = runChronologicalAllocation(rows, pool);

  const stat127Edges = allEdges.filter((e) => e.payment_doc === '44878' && e.target_doc);
  const stat129Edges = allEdges.filter((e) => e.payment_doc === '45717' && e.target_doc);
  const openAfter = pool.filter((i) => i.due > 0.01);
  const sumOpen = round2(openAfter.reduce((s, i) => s + i.due, 0));

  const stat127Total = round2(stat127Edges.reduce((s, e) => s + e.allocated_amount, 0));
  if (Math.abs(stat127Total - 10000) > TOL || stat127Edges.length < 2) {
    console.error(`STAT 127 validation failed: allocated ${fmtR(stat127Total)}, edges ${stat127Edges.length}`);
    process.exit(1);
  }
  console.log(`[${ACCOUNT}] STAT 127 LIFO validation PASS — ${stat127Edges.length} edges, ${fmtR(stat127Total)}`);

  const dataDir = path.join(ROOT, 'analysis/debtors/JEN001/data');
  fs.mkdirSync(dataDir, { recursive: true });
  const csvPath = path.join(dataDir, 'allocation_edges.csv');
  const headers = [
    'allocation_id',
    'allocation_group_id',
    'payment_doc',
    'payment_date',
    'payment_amount',
    'stat',
    'slice_amount',
    'target_doc',
    'target_date',
    'target_dn',
    'lpg_open_before',
    'allocated_amount',
    'variance',
    'allocation_type',
    'confidence',
    'review_required',
  ];
  const csvLines = [headers.join(',')];
  for (const e of allEdges) {
    csvLines.push(
      [
        e.allocation_id,
        e.allocation_group_id,
        e.payment_doc,
        e.payment_date,
        e.payment_amount,
        `"${(e.stat || '').replace(/"/g, '""')}"`,
        e.allocated_amount,
        e.target_doc,
        e.target_date,
        `"${(e.target_dn || '').replace(/"/g, '""')}"`,
        e.lpg_open_before,
        e.allocated_amount,
        e.variance ?? 0,
        e.allocation_type,
        e.confidence,
        e.review_required,
      ].join(','),
    );
  }
  fs.writeFileSync(csvPath, csvLines.join('\n') + '\n');

  const report = [];
  report.push('# JEN001 — Payment Allocation v1 (Turn 2 Pilot — Stripped Gas LIFO)');
  report.push('');
  report.push('**Account:** JENS SPOON PTY LTD (Spoon Eatery)');
  report.push('**Pilot payments:** STAT 127 (44878) + STAT 129 (45717)');
  report.push('**Method:** LPG-only TXT · EMPTY stripped · chronological LIFO across all STAT batches');
  report.push(`**Generated:** ${new Date().toISOString().slice(0, 10)}`);
  report.push('');
  report.push('---');
  report.push('');
  report.push('## 1. Executive Summary');
  report.push('');
  report.push('| Metric | Value |');
  report.push('| :--- | :--- |');
  report.push(`| ERP CURRENT BALANCE | ${fmtR(headerBalance)} |`);
  report.push(`| Total allocation edges | ${allEdges.filter((e) => e.target_doc).length} |`);
  report.push(`| STAT 127 validation | PASS (${fmtR(stat127Total)} on 3 targets) |`);
  report.push(`| STAT 129 allocated | ${fmtR(stat129Edges.reduce((s, e) => s + e.allocated_amount, 0))} |`);
  report.push(`| Open LPG invoices (post all payments) | ${openAfter.length} line${openAfter.length === 1 ? '' : 's'}, ${fmtR(sumOpen)} |`);
  report.push('');
  report.push('---');
  report.push('');
  report.push('## 2. STAT 129 — 45717 (14 Aug 2026, R15,000.00)');
  report.push('');
  report.push('| Target | Inv date | DN | Open before | Allocated | Type |');
  report.push('| :--- | :--- | :--- | ---: | ---: | :--- |');
  for (const e of stat129Edges) {
    report.push(
      `| ${e.target_docno.replace(/^0+/, '')} | ${displayDate(e.target_date)} | ${e.target_dn} | ${fmtR(e.lpg_open_before)} | ${fmtR(e.allocated_amount)} | ${e.allocation_type} |`,
    );
  }
  report.push('');
  report.push('**Remaining open LPG (Jul–Aug 2026 window relevant to presentation):**');
  report.push('');
  report.push('| Inv | Inv date | DN | Due (R) |');
  report.push('| :--- | :--- | :--- | ---: |');
  for (const inv of openAfter.filter((i) => i.iso >= '2026-07-01')) {
    report.push(
      `| ${inv.docno.replace(/^0+/, '')} | ${displayDate(inv.iso)} | ${inv.dn} | ${fmtR(inv.due)} |`,
    );
  }
  report.push('');
  report.push('---');
  report.push('');
  report.push('## 3. STAT 127 — 44878 (25 Jun 2026, R10,000.00)');
  report.push('');
  report.push('| Target | Inv date | DN | Open before | Allocated | Type |');
  report.push('| :--- | :--- | :--- | ---: | ---: | :--- |');
  for (const e of stat127Edges) {
    report.push(
      `| ${e.target_docno.replace(/^0+/, '')} | ${displayDate(e.target_date)} | ${e.target_dn} | ${fmtR(e.lpg_open_before)} | ${fmtR(e.allocated_amount)} | ${e.allocation_type} |`,
    );
  }
  report.push('');
  report.push('---');
  report.push('');
  report.push('## 4. Reconciliation bridge');
  report.push('');
  report.push('| Component | Amount |');
  report.push('| :--- | ---: |');
  report.push(`| Σ open LPG (allocation model) | ${fmtR(sumOpen)} |`);
  report.push(`| ERP CURRENT BALANCE | ${fmtR(headerBalance)} |`);
  report.push(`| Gap (pre-window B/F + CYL, not on open list) | ${fmtR(round2(headerBalance - sumOpen))} |`);
  report.push('');
  report.push('*Expected: open list covers Jul–Aug 2026 window only; pre-Jul LPG B/F sits in account-level bridge on customer SOA.*');
  report.push('');
  report.push('## 5. Artifacts');
  report.push('');
  report.push('| File | Rows |');
  report.push('| :--- | ---: |');
  report.push('| `data/allocation_edges.csv` | ' + allEdges.length + ' |');

  const reportPath = path.join(ROOT, 'analysis/debtors/JEN001/reports/JEN001_Payment_Allocation_v1.md');
  fs.writeFileSync(reportPath, report.join('\n') + '\n');

  console.log(`[${ACCOUNT}] Wrote ${csvPath}`);
  console.log(`[${ACCOUNT}] Wrote ${reportPath}`);
  console.log(
    `[${ACCOUNT}] Open Jul–Aug:`,
    openAfter
      .filter((i) => i.iso >= '2026-07-01')
      .map((i) => `${i.doc}=${fmtR(i.due)}`)
      .join(', ') || '(none)',
  );
}

main();
