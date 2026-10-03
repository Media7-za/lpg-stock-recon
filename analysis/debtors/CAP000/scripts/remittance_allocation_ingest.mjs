#!/usr/bin/env node
// Rebuilds data/allocation_edges.csv: payments from raw/CAP000.TXT, remittance-linked rows from config/remittance_allocations.json, rest UNALLOCATED.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/remittance_allocations.json'), 'utf8'));
const byPay = new Map(cfg.payments.map((p) => [p.paymentDoc, p]));

function parseCsvLine(line) {
  const out = [];
  let cur = '', inQ = false;
  for (const c of line) {
    if (c === '"') inQ = !inQ;
    else if (c === ',' && !inQ) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
const iso = (d) => d.split('/').reverse().join('-');
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const payments = fs.readFileSync(path.join(ROOT, 'raw/CAP000.TXT'), 'utf8').split('\n')
  .map(parseCsvLine).filter((r) => r[3] === 'Payment')
  .map((r) => ({ doc: r[2], date: iso(r[4]), amount: Math.abs(parseFloat(r[9])), ref: r[6] }));

const header = ['allocation_id','allocation_group_id','payment_doc','payment_date','payment_amount','slice_amount','target_doc','target_date','lpg_target_amount','allocated_amount','variance','allocation_type','confidence','review_required','batch_id','erp_stat'];
const rows = [];
let n = 0;
const id = () => `AL-CAP000-${String(++n).padStart(5, '0')}`;

for (const p of payments) {
  const rem = byPay.get(p.doc);
  if (!rem) {
    const g = `AG-UNALLOCATED-${p.date}`;
    rows.push([id(), g, p.doc, p.date, p.amount.toFixed(2), p.amount.toFixed(2), '', '', '', '', '', 'UNALLOCATED', 'Unconfirmed', 'true', g, p.ref]);
    continue;
  }
  const net = r2(rem.lines.reduce((s, l) => s + (l.type === 'CN' ? -l.amount : l.amount), 0) - (rem.remittanceAdjustment?.amount ?? 0));
  if (Math.abs(net - p.amount) > 0.005 || Math.abs(rem.remittanceNet - p.amount) > 0.005) {
    throw new Error(`Remittance for ${p.doc} does not reconcile: lines net ${net}, stated ${rem.remittanceNet}, ERP payment ${p.amount}`);
  }
  const g = `AG-REMIT-${p.date}`;
  for (const l of rem.lines) {
    const cn = l.type === 'CN';
    rows.push([id(), g, p.doc, p.date, p.amount.toFixed(2), l.amount.toFixed(2), l.doc, l.date, l.amount.toFixed(2), l.amount.toFixed(2), '0',
      cn ? 'REMITTANCE_CN_OFFSET' : 'REMITTANCE_EXPLICIT', l.confidence ?? 'Confirmed', cn || rem.remittanceAdjustment ? 'true' : 'false', g, rem.erpStat]);
  }
}

fs.writeFileSync(path.join(ROOT, 'data/allocation_edges.csv'), [header, ...rows].map((r) => r.join(',')).join('\n') + '\n');
console.log(`Wrote ${rows.length} edge rows for ${payments.length} payments (${rows.filter((r) => r[11] === 'UNALLOCATED').length} unallocated).`);
