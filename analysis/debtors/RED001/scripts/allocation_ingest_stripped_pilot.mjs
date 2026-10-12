#!/usr/bin/env node
/**
 * RED001 — Stripped-gas payment-pattern allocation pilot (Turn 2)
 *
 * Method: LPG-only invoice amounts from ERP TXT (EMPTY pairs stripped).
 * Allocation: chronological LIFO (newest open gas invoice first) — ref_no
 * not used as authority (SKILL_Payment_To_Invoice_Allocation / debenq model).
 *
 * Pilot window: 2026-04-01 → 2026-07-05 (STAT 125–128 batches).
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
  analyseLpgOpenCoverage,
} from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const ACCOUNT = 'RED001';
const TRADING_NAME = 'REDLANDS HOTEL';
const TXT_PATH = path.join(ROOT, 'analysis/debtors/RED001/raw/RED001CURRENT.TXT');
const PILOT_FROM = '2026-04-01';
const PILOT_TO = '2026-07-05';
const PILOT_STATS = ['STAT 125', 'STAT 126', 'STAT 127', 'STAT 128'];
const REVIEW_PAYMENTS = new Set(['44288']); // blank ref — likely 50580
const TOL = 0.05;

const fmtR = (n) => `R${fmtAmount(n)}`;

function parseTxtRows(absPath) {
  const txt = fs.readFileSync(absPath, 'utf8');
  const headerBalance = Number(txt.match(/CURRENT BALANCE:","(-?[0-9.]+)"/)?.[1]);
  const totalLine = txt.match(/TOTAL TRANSACTIONS:\s*(-?[0-9.]+)/)?.[1];
  const closeFromRows = totalLine != null ? Number(totalLine) : null;
  const rows = [];
  for (const line of txt.split('\n')) {
    if (!/^"\d+"/.test(line.trim())) continue;
    const p = parseCsvLine(line);
    if (p.length < 11) continue;
    const [, , docno, entry, date, , ref] = p;
    if (!date || !date.includes('/')) continue;
    const dn = (ref || '').trim();
    const statMatch = dn.match(/STAT\s+\d+/i);
    rows.push({
      docno,
      cleanDoc: normDoc(docno),
      entry,
      iso: parseTxtDate(date),
      dn,
      amount: round2(Number(p[9])),
      stat: statMatch ? statMatch[0].toUpperCase().replace(/\s+/, ' ') : '',
    });
  }
  return { headerBalance, closeFromRows, rows };
}

function buildLpgInvoicePool(rows) {
  const invoices = [];
  for (const r of rows) {
    if (r.entry !== 'Invoice' || isCylRef(r.dn)) continue;
    // Skip known CYL-only amounts without -EMPTY (45541 on DN#20157)
    if (r.amount === 7245 && r.dn.includes('20157') && !isCylRef(r.dn)) continue;
    if ([4830, 7245, 6037.5, 3622.5].includes(r.amount) && !r.dn.match(/DN/i)) continue;
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
      confidence: REVIEW_PAYMENTS.has(payment.cleanDoc) ? 'OPERATOR_REVIEW' : 'PATTERN_LIFO',
      review_required: REVIEW_PAYMENTS.has(payment.cleanDoc) || alloc + TOL < inv.due,
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
        allocation_group_id: ag,
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
        confidence: REVIEW_PAYMENTS.has(payment.cleanDoc) ? 'OPERATOR_REVIEW' : 'PATTERN_LIFO',
        review_required: true,
      });
    }
  }

  return allEdges;
}

function inPilotWindow(iso) {
  return iso >= PILOT_FROM && iso <= PILOT_TO;
}

function main() {
  const { headerBalance, closeFromRows, rows } = parseTxtRows(TXT_PATH);
  const pool = buildLpgInvoicePool(rows);
  const allEdges = runChronologicalAllocation(rows, pool);

  const pilotEdges = allEdges.filter((e) => inPilotWindow(e.payment_date));
  const pilotPayments = [...new Set(pilotEdges.map((e) => e.payment_doc))];
  const statPilotEdges = pilotEdges.filter(
    (e) => PILOT_STATS.some((s) => e.stat === s) && e.target_doc,
  );
  const openAfter = pool.filter((i) => i.due > 0.01);
  const sumOpen = round2(openAfter.reduce((s, i) => s + i.due, 0));

  const coverage = analyseLpgOpenCoverage({
    rows,
    openInvoices: openAfter.map((i) => ({
      doc: i.doc,
      docno: i.docno,
      iso: i.iso,
      dn: i.dn,
      due: i.due,
    })),
    headerBalance: closeFromRows ?? headerBalance,
  });

  const confirmedPilot = pilotEdges.filter((e) => e.target_doc && !e.review_required);
  const reviewPilot = pilotEdges.filter((e) => e.review_required);
  const tier12Pct = pilotEdges.filter((e) => e.target_doc).length
    ? round2(
        (confirmedPilot.length / pilotEdges.filter((e) => e.target_doc || e.allocation_type === 'UNALLOCATED_REMAINDER').length) *
          100,
      )
    : 0;
  const gatePass = confirmedPilot.length >= Math.ceil(pilotPayments.length * 0.9);

  const dataDir = path.join(ROOT, `analysis/debtors/${ACCOUNT}/data`);
  fs.mkdirSync(dataDir, { recursive: true });
  const csvPath = path.join(dataDir, 'allocation_edges_stripped_pilot.csv');
  const headers = [
    'allocation_id',
    'allocation_group_id',
    'payment_doc',
    'payment_date',
    'payment_amount',
    'stat',
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
        e.target_doc,
        e.target_date,
        `"${(e.target_dn || '').replace(/"/g, '""')}"`,
        e.lpg_open_before ?? 0,
        e.allocated_amount ?? 0,
        e.variance ?? 0,
        e.allocation_type,
        e.confidence,
        e.review_required,
      ].join(','),
    );
  }
  fs.writeFileSync(csvPath, csvLines.join('\n') + '\n');

  const report = [];
  report.push('# RED001 — Payment Allocation v1 (Turn 2 Pilot — Stripped Gas LIFO)');
  report.push('');
  report.push(`**Account:** ${TRADING_NAME}`);
  report.push(`**Source:** \`raw/RED001CURRENT.TXT\` (May 2025 → Jul 2026)`);
  report.push(`**Pilot window:** ${PILOT_FROM} → ${PILOT_TO} (${PILOT_STATS.join(', ')})`);
  report.push('**Method:** LPG-only TXT · EMPTY stripped · DN-base CN net · chronological LIFO (ref_no not authority)');
  report.push(`**Generated:** ${new Date().toISOString().slice(0, 10)}`);
  report.push('');
  report.push('---');
  report.push('');
  report.push('## 1. Executive Summary');
  report.push('');
  report.push('| Metric | Value |');
  report.push('| :--- | :--- |');
  report.push(`| Enquiry close (TOTAL TRANSACTIONS) | ${fmtR(closeFromRows ?? NaN)} |`);
  report.push(`| CURRENT header | ${fmtR(headerBalance)} |`);
  report.push(`| Total LIFO edges (full TXT) | ${allEdges.filter((e) => e.target_doc).length} |`);
  report.push(`| Pilot payment docs | ${pilotPayments.length} |`);
  report.push(`| Pilot LIFO edges (confirmed) | ${confirmedPilot.length} |`);
  report.push(`| Pilot review / remainder | ${reviewPilot.length} |`);
  report.push(`| Open LPG after all payments | ${openAfter.length} lines, ${fmtR(sumOpen)} |`);
  report.push(`| LPG stripped gate | **${coverage.gate}** |`);
  report.push(`| Reconciliation gap (ERP − Σ open LPG) | ${fmtR(coverage.reconciliation_gap ?? 0)} |`);
  report.push(`| **Pilot gate (LIFO ≥90% clean)** | **${gatePass ? 'PASS ✅' : 'REVIEW ⚠️'}** |`);
  report.push('');
  report.push('---');
  report.push('');
  report.push('## 2. Pilot payments (Apr–Jul 2026)');
  report.push('');

  for (const pmt of pilotPayments.sort()) {
    const pmtRow = rows.find((r) => r.cleanDoc === pmt && r.entry === 'Payment');
    const edges = pilotEdges.filter((e) => e.payment_doc === pmt && e.target_doc);
    const remainder = pilotEdges.find(
      (e) => e.payment_doc === pmt && e.allocation_type === 'UNALLOCATED_REMAINDER',
    );
    report.push(
      `### Payment ${pmt}${pmtRow ? ` (${displayDate(pmtRow.iso)}, ${fmtR(Math.abs(pmtRow.amount))}, ${pmtRow.stat || 'no STAT'})` : ''}`,
    );
    report.push('');
    if (REVIEW_PAYMENTS.has(pmt)) {
      report.push(
        '> **OPERATOR_REVIEW:** Blank ref in ERP — LIFO assigns to newest open gas invoice. TXT running balance suggests **50580** (DN#22374, R5,759.98). Ratify via `payment_pattern_overrides.json`.',
      );
      report.push('');
    }
    report.push('| Target | Inv date | DN | Open before | Allocated | Type | Review |');
    report.push('| :--- | :--- | :--- | ---: | ---: | :--- | :--- |');
    if (edges.length === 0) report.push('| — | — | — | — | — | — | — |');
    for (const e of edges) {
      report.push(
        `| ${e.target_doc} | ${displayDate(e.target_date)} | ${e.target_dn} | ${fmtR(e.lpg_open_before)} | ${fmtR(e.allocated_amount)} | ${e.allocation_type} | ${e.review_required ? 'yes' : 'no'} |`,
      );
    }
    if (remainder) {
      report.push(
        `| *(remainder)* | | | | ${fmtR(remainder.variance)} unallocated | UNALLOCATED_REMAINDER | yes |`,
      );
    }
    report.push('');
  }

  report.push('---');
  report.push('');
  report.push('## 3. Open LPG (post-LIFO model)');
  report.push('');
  report.push('| Inv | Date | DN | Due (R) |');
  report.push('| :--- | :--- | :--- | ---: |');
  for (const inv of openAfter) {
    report.push(`| ${inv.doc} | ${displayDate(inv.iso)} | ${inv.dn} | ${fmtR(inv.due)} |`);
  }
  if (openAfter.length === 0) report.push('| *(none)* | | | |');
  report.push('');
  report.push('---');
  report.push('');
  report.push('## 4. Reconciliation bridge');
  report.push('');
  report.push('| Component | Amount |');
  report.push('| :--- | ---: |');
  report.push(`| Σ open LPG (stripped LIFO model) | ${fmtR(sumOpen)} |`);
  report.push(`| Enquiry close / header used | ${fmtR(coverage.header_balance)} |`);
  report.push(`| Gap (CYL + account-level credits / carry) | ${fmtR(coverage.reconciliation_gap ?? 0)} |`);
  report.push(`| Untagged credit total | ${fmtR(coverage.untagged_credit_total)} |`);
  report.push('');
  report.push('> **Note:** Part 1A **R5,955.34 carry** and CN **13687** distortion are not invoice rows — expect material gap vs ERP combined until ratification posts.');
  report.push('');
  report.push('---');
  report.push('');
  report.push('## 5. Comparison — ref-linked pilot');
  report.push('');
  report.push('| Method | Pilot | Gate |');
  report.push('| :--- | :--- | :--- |');
  report.push('| Ref-linked (`allocation_ingest_pilot.mjs`) | Apr–Jul 2026 | PASS 90.91% T1/T2 |');
  report.push(`| Stripped LIFO (this report) | Apr–Jul 2026 | ${gatePass ? 'PASS' : 'REVIEW'} |`);
  report.push('');
  report.push('---');
  report.push('');
  report.push('## 6. Artifacts');
  report.push('');
  report.push('| File | Rows |');
  report.push('| :--- | ---: |');
  report.push('| `data/allocation_edges_stripped_pilot.csv` | ' + allEdges.length + ' |');
  report.push('');
  report.push('*Generated by `scripts/allocation_ingest_stripped_pilot.mjs`*');

  const reportPath = path.join(
    ROOT,
    `analysis/debtors/${ACCOUNT}/reports/${ACCOUNT}_Payment_Allocation_Stripped_v1.md`,
  );
  fs.writeFileSync(reportPath, report.join('\n') + '\n');

  console.log(`[${ACCOUNT}] Stripped-gas LIFO pilot complete`);
  console.log(`[${ACCOUNT}] Pilot payments: ${pilotPayments.length}, confirmed edges: ${confirmedPilot.length}, review: ${reviewPilot.length}`);
  console.log(`[${ACCOUNT}] Open LPG: ${fmtR(sumOpen)} (${openAfter.length} docs)`);
  console.log(`[${ACCOUNT}] Gate: ${coverage.gate}, gap: ${fmtR(coverage.reconciliation_gap ?? 0)}`);
  console.log(`[${ACCOUNT}] Pilot gate: ${gatePass ? 'PASS' : 'REVIEW'}`);
  console.log(`[${ACCOUNT}] Wrote ${csvPath}`);
  console.log(`[${ACCOUNT}] Wrote ${reportPath}`);
}

main();
