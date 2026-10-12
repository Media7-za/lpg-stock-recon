#!/usr/bin/env node
/**
 * Build inputs required by allocation_knowledge_compile.mjs for TWK002.
 * TWK002 edges come from remittance_allocation_ingest.mjs (not DB invoice export).
 *
 * Run: node analysis/debtors/TWK002/scripts/build_knowledge_prep.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.resolve(__dirname, '../data');
const DEBTOR = 'TWK002';

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const header = lines[0].split(',').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const parts = line.split(',');
    const row = {};
    header.forEach((h, i) => {
      row[h] = (parts[i] ?? '').trim();
    });
    return row;
  });
}

function padDoc(doc) {
  const d = String(doc ?? '').replace(/^0+/, '') || '0';
  return d.padStart(8, '0');
}

const edgesPath = path.join(DATA, 'allocation_edges.csv');
if (!fs.existsSync(edgesPath)) {
  console.error('Missing', edgesPath);
  process.exit(1);
}

const edges = parseCsv(fs.readFileSync(edgesPath, 'utf8'));
const docs = new Map();

for (const row of edges) {
  if (!row.target_doc) continue;
  const doc = padDoc(row.target_doc);
  const isCn = /^REMITTANCE_CN/i.test(row.allocation_type);
  const entryType = isCn ? 'Crd Note' : 'Invoice';
  const amount = Math.abs(Number(row.lpg_target_amount || row.allocated_amount || 0));
  const txDate = row.target_date || row.payment_date || '';
  const key = `${entryType}:${doc}`;
  const existing = docs.get(key);
  if (!existing || amount > existing.amount_incl) {
    docs.set(key, {
      debtor_code: DEBTOR,
      doc_no: doc,
      entry_type: entryType,
      tx_date: txDate,
      month_year: txDate ? txDate.slice(0, 7) : '',
      stock_code: '',
      description: '',
      debt_group: 'LPG',
      lane: 'LPG',
      qty: '0',
      amount_excl: String(amount),
      tax_amount: '0',
      amount_incl: String(amount),
      is_cyl: 'False',
      is_lpg: 'True',
      paired_cyl_doc: '',
      notes: 'Synthesized from allocation_edges.csv for knowledge compile',
    });
  }
}

const header =
  'debtor_code,doc_no,entry_type,tx_date,month_year,stock_code,description,debt_group,lane,qty,amount_excl,tax_amount,amount_incl,is_cyl,is_lpg,paired_cyl_doc,notes\n';
const body = [...docs.values()]
  .sort((a, b) => a.tx_date.localeCompare(b.tx_date) || a.doc_no.localeCompare(b.doc_no))
  .map((r) =>
    [
      r.debtor_code,
      r.doc_no,
      r.entry_type,
      r.tx_date,
      r.month_year,
      r.stock_code,
      r.description,
      r.debt_group,
      r.lane,
      r.qty,
      r.amount_excl,
      r.tax_amount,
      r.amount_incl,
      r.is_cyl,
      r.is_lpg,
      r.paired_cyl_doc,
      r.notes,
    ].join(','),
  )
  .join('\n');

const outPath = path.join(DATA, 'invoices.csv');
fs.writeFileSync(outPath, header + body + (body ? '\n' : ''));
console.log(`Wrote ${outPath} (${docs.size} docs from ${edges.length} edges)`);
