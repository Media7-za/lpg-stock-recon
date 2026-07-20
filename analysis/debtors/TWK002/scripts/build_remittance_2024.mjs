#!/usr/bin/env node
/**
 * Build TWK002 2024 remittance CSVs from manifest.
 * Re-run after editing data/remittance_manifest_2024.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/remittance_manifest_2024.json'), 'utf8'));

function writeCsv(filePath, cols, rows) {
  const lines = [cols.join(',')];
  for (const row of rows) {
    lines.push(cols.map((c) => {
      const v = row[c] ?? '';
      const s = String(v);
      return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(','));
  }
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
}

const batchCols = [
  'batch_id', 'remittance_ref', 'advice_date', 'electronic_paid_date',
  'gross_payable', 'cash_amount', 'discount_amount', 'already_paid',
  'footer_col1', 'erp_payment_doc', 'erp_payment_date', 'erp_payment_gross',
  'erp_gross_variance', 'erp_stat', 'source_file', 'erp_link_status', 'notes',
];

const batchRows = manifest.batches.map((b) => ({
  ...b,
  erp_payment_doc: b.erp_payment_doc ?? '',
  erp_payment_date: b.erp_payment_date ?? '',
  erp_payment_gross: b.erp_payment_gross ?? '',
  erp_gross_variance: b.erp_gross_variance ?? '',
  erp_stat: b.erp_stat ?? '',
  erp_link_status: b.erp_link_status ?? 'PENDING_TXT',
}));

writeCsv(path.join(ROOT, 'data/remittance_batches_2024.csv'), batchCols, batchRows);

const lineCols = [
  'batch_id', 'line_type', 'doc_no', 'doc_date', 'our_ref',
  'original_amount', 'discount_amount', 'net_amount', 'discount_eligible',
  'on_remittance', 'source_type', 'notes',
];

const lineRows = (manifest.lines ?? []).map((l) => ({
  discount_eligible: l.discount_eligible ?? (Math.abs(l.discount_amount) > 0.001 ? 'true' : 'false'),
  on_remittance: 'true',
  source_type: 'remittance_advice',
  ...l,
}));

writeCsv(path.join(ROOT, 'data/remittance_lines_2024.csv'), lineCols, lineRows);

// Proforma journals
const jRows = [];
let taskId = 1;
const tasks = [];

for (const b of manifest.batches) {
  const consol = -Number(b.discount_amount);
  const bid = b.batch_id;
  jRows.push({
    batch_id: bid,
    post_date: b.electronic_paid_date,
    journal_type: 'DISCOUNT_ALLOWED',
    consolidated_amount: consol.toFixed(2),
    ref_doc_no: 'CONSOLIDATED',
    ref_discount_amount: consol.toFixed(2),
    evidence_source: 'remittance_advice',
    review_required: Number(b.discount_amount) < 0 ? 'true' : 'false',
    notes: b.notes || `Link receipt TBD; ${b.erp_link_status}`,
  });
  for (const l of lineRows.filter((r) => r.batch_id === bid)) {
    if (Math.abs(l.discount_amount) < 0.001) continue;
    jRows.push({
      batch_id: bid,
      post_date: b.electronic_paid_date,
      journal_type: 'DISCOUNT_ALLOWED',
      consolidated_amount: consol.toFixed(2),
      ref_doc_no: l.doc_no,
      ref_discount_amount: Number(l.discount_amount).toFixed(2),
      evidence_source: 'remittance_advice',
      review_required: 'false',
      notes: l.notes || '',
    });
  }
  tasks.push({
    task_id: `TASK-2024-${String(taskId++).padStart(4, '0')}`,
    batch_id: bid,
    post_date: b.electronic_paid_date,
    erp_action: 'POST_DISCOUNT_ALLOWED_JOURNAL',
    amount: consol.toFixed(2),
    ref_summary: 'Consolidated per remittance batch',
    erp_status: 'MISSING',
    evidence_source: 'remittance_advice',
    priority: 'HIGH',
    notes: `ERP payment not in raw/TWK002.TXT (export ends Feb 2024). Remittance discount R${Number(b.discount_amount).toFixed(2)}.`,
  });
}

writeCsv(path.join(ROOT, 'data/proforma_journals_2024.csv'), [
  'batch_id', 'post_date', 'journal_type', 'consolidated_amount', 'ref_doc_no',
  'ref_discount_amount', 'evidence_source', 'review_required', 'notes',
], jRows);

writeCsv(path.join(ROOT, 'data/missing_journal_tasks_2024.csv'), [
  'task_id', 'batch_id', 'post_date', 'erp_action', 'amount', 'ref_summary',
  'erp_status', 'evidence_source', 'priority', 'notes',
], tasks);

console.log(`2024 batches: ${manifest.batches.length}`);
console.log(`2024 lines: ${lineRows.length}`);
console.log(`Total discount: ${manifest.batches.reduce((s, b) => s + b.discount_amount, 0).toFixed(2)}`);
