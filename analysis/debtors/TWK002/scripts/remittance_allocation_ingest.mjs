#!/usr/bin/env node
/**
 * TWK002 Model B — remittance advice → payment→invoice allocation edges.
 * Tier-1 authority: remittance PDFs (cash + line list). No DATABASE_URL required.
 *
 * Run: node analysis/debtors/TWK002/scripts/remittance_allocation_ingest.mjs [--write]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const DEBTOR = 'TWK002';
const DATA = path.join(ROOT, `analysis/debtors/${DEBTOR}/data`);
const REPORTS = path.join(ROOT, `analysis/debtors/${DEBTOR}/reports`);
const write = process.argv.includes('--write') || !process.argv.includes('--dry-run');

const round2 = (n) => Math.round(Number(n) * 100) / 100;
const clean = (d) => String(d ?? '').replace(/^0+/, '') || '0';
const fmtR = (n) =>
  'R' + round2(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
const TOL = 0.05;

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const header = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const parts = line.split(',');
    const row = {};
    header.forEach((h, i) => {
      row[h.trim()] = (parts[i] ?? '').trim();
    });
    return row;
  });
}

function parseDocDate(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return s;
}

function loadManifests() {
  const batches = [];
  for (const year of ['2023', '2024', '2025', '2026']) {
    const p = path.join(DATA, `remittance_manifest_${year}.json`);
    if (!fs.existsSync(p)) continue;
    const manifest = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const b of manifest.batches ?? []) {
      batches.push({ ...b, manifestYear: year });
    }
  }
  return batches;
}

function loadRemittanceLines() {
  const byBatch = new Map();
  for (const year of ['2023', '2024', '2025', '2026']) {
    const p = path.join(DATA, `remittance_lines_${year}.csv`);
    if (!fs.existsSync(p)) continue;
    for (const row of parseCsv(fs.readFileSync(p, 'utf8'))) {
      const bid = row.batch_id;
      if (!byBatch.has(bid)) byBatch.set(bid, []);
      byBatch.get(bid).push(row);
    }
  }
  return byBatch;
}

const batches = loadManifests();
const linesByBatch = loadRemittanceLines();
const edges = [];
const batchSummaries = [];
let edgeIdx = 1;

for (const batch of batches.sort((a, b) =>
  (a.erp_payment_date ?? '').localeCompare(b.erp_payment_date ?? ''),
)) {
  const batchId = batch.batch_id;
  const lines = linesByBatch.get(batchId) ?? [];
  const paymentDoc = clean(batch.erp_payment_doc);
  const paymentDate = batch.erp_payment_date ?? batch.electronic_paid_date ?? '';
  const cashAmount = round2(batch.cash_amount ?? 0);
  const twk002Split = batch.erp_payment_split?.find((s) => s.debtorCode === DEBTOR);
  const paymentAmount = twk002Split ? round2(Math.abs(twk002Split.amount)) : cashAmount;
  const groupId = `AG-${batchId.replace(/[^A-Za-z0-9-]/g, '-')}`;

  if (!paymentDoc) {
    batchSummaries.push({ batchId, status: 'SKIP', reason: 'no erp_payment_doc' });
    continue;
  }
  if (!lines.length) {
    batchSummaries.push({ batchId, paymentDoc, status: 'SKIP', reason: 'no remittance_lines rows' });
    continue;
  }

  let lineNetSum = 0;
  for (const line of lines) {
    const net = round2(line.net_amount);
    lineNetSum = round2(lineNetSum + net);
    const isCn = /^crd note$/i.test(line.line_type);
    const allocated = round2(Math.abs(net));
    const targetDoc = clean(line.doc_no);
    edges.push({
      allocation_id: `AL-${String(edgeIdx++).padStart(4, '0')}`,
      allocation_group_id: groupId,
      payment_doc: paymentDoc,
      payment_date: paymentDate,
      payment_amount: paymentAmount,
      slice_amount: allocated,
      target_doc: targetDoc,
      target_date: parseDocDate(line.doc_date),
      lpg_target_amount: round2(Math.abs(line.original_amount)),
      allocated_amount: allocated,
      variance: 0,
      allocation_type: isCn ? 'REMITTANCE_CN_OFFSET' : 'REMITTANCE_EXPLICIT',
      confidence: 'Confirmed',
      review_required: false,
      batch_id: batchId,
      erp_stat: batch.erp_stat ?? '',
      line_type: line.line_type,
      discount_amount: round2(line.discount_amount || 0),
      source_file: batch.source_file ?? '',
    });
  }

  const cashOk = Math.abs(lineNetSum - cashAmount) <= TOL;
  const twkOk = !twk002Split || Math.abs(lineNetSum - cashAmount) <= TOL;
  if (!cashOk) {
    for (const e of edges.filter((x) => x.batch_id === batchId)) {
      e.review_required = true;
      e.variance = round2(lineNetSum - cashAmount);
    }
  }

  batchSummaries.push({
    batchId,
    paymentDoc,
    erp_stat: batch.erp_stat ?? '',
    paymentDate,
    lines: lines.length,
    lineNetSum,
    cashAmount,
    paymentAmount,
    cashOk,
    twkOk,
    multiSite: Boolean(twk002Split),
    status: cashOk ? 'OK' : 'REVIEW',
  });
}

edges.sort(
  (a, b) =>
    a.payment_date.localeCompare(b.payment_date) ||
    a.payment_doc.localeCompare(b.payment_doc) ||
    a.target_doc.localeCompare(b.target_doc),
);

const csvHeader =
  'allocation_id,allocation_group_id,payment_doc,payment_date,payment_amount,slice_amount,target_doc,target_date,lpg_target_amount,allocated_amount,variance,allocation_type,confidence,review_required,batch_id,erp_stat\n';

const csvRows = edges.map((e) =>
  [
    e.allocation_id,
    e.allocation_group_id,
    e.payment_doc,
    e.payment_date,
    e.payment_amount,
    e.slice_amount,
    e.target_doc,
    e.target_date,
    e.lpg_target_amount,
    e.allocated_amount,
    e.variance,
    e.allocation_type,
    e.confidence,
    e.review_required ? 'true' : 'false',
    e.batch_id,
    e.erp_stat,
  ].join(','),
);

const stat112 = edges.filter((e) => e.batch_id === 'BATCH-2025-03-31');
const confirmed = edges.filter((e) => !e.review_required);
const review = edges.filter((e) => e.review_required);

console.log('TWK002 remittance allocation ingest');
console.log(`  batches: ${batchSummaries.filter((b) => b.status === 'OK').length} OK, ${batchSummaries.filter((b) => b.status === 'REVIEW').length} REVIEW, ${batchSummaries.filter((b) => b.status === 'SKIP').length} SKIP`);
console.log(`  edges: ${edges.length} (${confirmed.length} confirmed, ${review.length} review)`);
console.log(`  STAT 112 (00037770): ${stat112.length} edges, Σ net ${fmtR(stat112.reduce((s, e) => s + (e.allocation_type === 'REMITTANCE_CN_OFFSET' ? -e.allocated_amount : e.allocated_amount), 0))}`);

if (write) {
  fs.mkdirSync(DATA, { recursive: true });
  fs.mkdirSync(REPORTS, { recursive: true });
  const csvPath = path.join(DATA, 'allocation_edges.csv');
  fs.writeFileSync(csvPath, csvHeader + csvRows.join('\n') + '\n');

  const md = [];
  md.push('# TWK002 — Payment Allocation v1 (Remittance-Authoritative)');
  md.push('');
  md.push('**Account:** TWK AGRI PTY LTD');
  md.push('**Method:** Model B — remittance advice → payment→document edges (`REMITTANCE_EXPLICIT` / `REMITTANCE_CN_OFFSET`)');
  md.push(`**Generated:** ${new Date().toISOString().slice(0, 10)}`);
  md.push('**Skill basis:** `business_rules.md` §15 order A · `TWK002_Model_B_Position.md`');
  md.push('');
  md.push('---');
  md.push('');
  md.push('## 1. Executive Summary');
  md.push('');
  md.push('| Metric | Value |');
  md.push('| :--- | :--- |');
  md.push(`| Remittance batches linked | ${batchSummaries.filter((b) => b.status !== 'SKIP').length} |`);
  md.push(`| Allocation edges | ${edges.length} |`);
  md.push(`| Confirmed (remittance tier-1) | ${confirmed.length} |`);
  md.push(`| Review required | ${review.length} |`);
  md.push('');
  md.push('---');
  md.push('');
  md.push('## 2. Batch register');
  md.push('');
  md.push('| Batch | STAT | Payment | Date | Lines | Σ line net | Cash | Status |');
  md.push('| :--- | :--- | :--- | :--- | ---: | ---: | ---: | :--- |');
  for (const b of batchSummaries.filter((x) => x.status !== 'SKIP')) {
    md.push(`| ${b.batchId} | ${b.erp_stat} | ${b.paymentDoc} | ${b.paymentDate} | ${b.lines} | ${fmtR(b.lineNetSum)} | ${fmtR(b.cashAmount)} | ${b.status}${b.multiSite ? ' (multi-site)' : ''} |`);
  }
  md.push('');
  md.push('---');
  md.push('');
  md.push('## 3. STAT 112 — receipt 00037770 (fully untagged in ERP)');
  md.push('');
  md.push('Remittance `BATCH-2025-03-31` / `31.03.2025(1).pdf` — cash **R35,693.84**. ERP posted one lump with blank `INVNO`; these edges are the authoritative invoice links.');
  md.push('');
  md.push('| Target doc | Type | Doc date | Allocated (R) | Discount (R) |');
  md.push('| :--- | :--- | :--- | ---: | ---: |');
  for (const e of stat112) {
    md.push(`| ${e.target_doc} | ${e.line_type} | ${e.target_date} | ${round2(e.allocated_amount).toFixed(2)} | ${round2(e.discount_amount).toFixed(2)} |`);
  }
  md.push('');
  md.push('---');
  md.push('');
  md.push('## 4. Doctrine note');
  md.push('');
  md.push('- These edges **do not** rewrite ERP `INVNO` tags — they record remittance-authoritative settlement.');
  md.push('- Use with `closedInvoiceOverrides` when ERP open list still disagrees.');
  md.push('- Path B discount journals are separate from payment allocation edges.');
  md.push('');
  md.push('---');
  md.push('');
  md.push('## 5. Artifacts');
  md.push('');
  md.push('| File | Rows |');
  md.push('| :--- | ---: |');
  md.push(`| \`data/allocation_edges.csv\` | ${edges.length} |`);
  md.push('');
  md.push('*Generated by `scripts/remittance_allocation_ingest.mjs`*');

  const reportPath = path.join(REPORTS, 'TWK002_Payment_Allocation_v1.md');
  fs.writeFileSync(reportPath, md.join('\n'));
  console.log(`\nWritten: ${csvPath}`);
  console.log(`Written: ${reportPath}`);
}
