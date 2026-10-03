#!/usr/bin/env node
/**
 * DEBENQ TXT -> data/invoices.csv + data/payments.csv, for accounts with no DB line items
 * (CAP000 precedent). One row per document; no line-item detail exists in the TXT.
 *
 * Usage: node analysis/debtors/shared/scripts/debenq_to_data_csvs.mjs --debtor CAP000 [--txt raw/CAP000.TXT] [--classify-cyl] [--check]
 *
 * Assumed (not PROVEN) columns: stock_code, qty (always 1), amount_excl/tax_amount (back-calculated at 15% VAT),
 * is_cyl/is_lpg. Default classification reproduces the data committed for CAP000: every document is LPG,
 * because the original generator tested the REFERENCE column (customer name), so the EMPTY/CYL pattern never
 * matched (registry defect D-1). --classify-cyl tests the CUSTOMER/BANK REF column instead; it changes which
 * documents the status script treats as LPG invoices, so regenerate and re-run reconciliation-status together.
 * Payment rows go to payments.csv only: a payment doc number can equal an invoice number (CAP000 42697).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCsvLine } from './debenq_open_invoices.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const args = process.argv.slice(2);
const opt = (f) => (args.indexOf(f) >= 0 ? args[args.indexOf(f) + 1] : null);
const debtor = opt('--debtor');
if (!debtor) { console.error('Usage: --debtor <CODE> [--txt <path>] [--classify-cyl] [--check]'); process.exit(2); }
const dir = path.join(ROOT, 'analysis/debtors', debtor);
const txtPath = opt('--txt') ? path.resolve(opt('--txt')) : path.join(dir, `raw/${debtor}.TXT`);
const classifyCyl = args.includes('--classify-cyl');
const CYL = /EMPTY|EMPTIES|CYL|CYLINDER|DEPOSIT/;
const VAT = 0.15;

const lines = fs.readFileSync(txtPath, 'utf8').split(/\r?\n/);
let idx = null;
const inv = [];
const pay = [];
for (const line of lines) {
  if (!line.trim()) continue;
  const p = parseCsvLine(line);
  if (!idx) {
    if (p[0].trim() === 'LINE') idx = Object.fromEntries(p.map((h, i) => [h.trim(), i]));
    continue;
  }
  const doc = (p[idx.DOCNO] || '').trim();
  const entry = (p[idx.ENTRY] || '').trim();
  const dateStr = (p[idx.DATE] || '').trim();
  const amount = parseFloat(p[idx.AMOUNT]);
  if (!doc || !entry || !dateStr || Number.isNaN(amount)) continue;
  const [dd, mm, yyyy] = dateStr.split('/');
  const iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  if (entry === 'Payment') {
    const ref = (p[idx['CUSTOMER/BANK REF']] || '').trim();
    pay.push({ doc, iso, ref, amountRaw: (p[idx.AMOUNT] || '').trim() });
    continue;
  }
  const description = (p[idx.REFERENCE] || '').trim();
  const classifyOn = classifyCyl ? (p[idx['CUSTOMER/BANK REF']] || '') : description;
  const isCyl = CYL.test(classifyOn.toUpperCase());
  const excl = amount / (1 + VAT);
  inv.push([debtor, doc, entry, iso, `${yyyy}-${mm.padStart(2, '0')}`, isCyl ? 'CYL' : 'LPG', description.slice(0, 50),
    isCyl ? 'CYL' : 'LPG', isCyl ? 'CYL' : 'LPG', 1, excl.toFixed(2), (amount - excl).toFixed(2), amount.toFixed(2),
    isCyl ? 'True' : 'False', isCyl ? 'False' : 'True', '', 'Generated from DEBENQ TXT (aggregated, no line-item detail)']);
}
const q = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
const toCsv = (h, rows) => [h, ...rows.map((r) => r.map(q).join(','))].join('\n') + '\n';
const invCsv = toCsv(
  'debtor_code,doc_no,entry_type,tx_date,month_year,stock_code,description,debt_group,lane,qty,amount_excl,tax_amount,amount_incl,is_cyl,is_lpg,paired_cyl_doc,notes',
  inv);
const payCsv = toCsv(
  'debtor_code,payment_doc,payment_date,batch_ref,stat_no,amount,source_file,split_count,is_split_payment,notes',
  pay.map((x) => [debtor, x.doc, x.iso, x.ref.split('|')[0].trim(), (x.ref.split('STAT')[1] || '').replace(/[^0-9]/g, ''),
    x.amountRaw, path.basename(txtPath), 1, 'False', 'Derived from DEBENQ Payment row']));

const out = { 'data/invoices.csv': invCsv, 'data/payments.csv': payCsv };
if (args.includes('--check')) {
  let bad = 0;
  for (const [f, body] of Object.entries(out)) {
    const cur = fs.existsSync(path.join(dir, f)) ? fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n') : null;
    const same = cur === body;
    console.log(`${same ? 'MATCH ' : 'DIFFER'} ${f}`);
    if (!same) bad++;
  }
  process.exit(bad ? 1 : 0);
}
fs.mkdirSync(path.join(dir, 'data'), { recursive: true });
for (const [f, body] of Object.entries(out)) fs.writeFileSync(path.join(dir, f), body);
console.log(`${debtor}: wrote ${inv.length} invoice/credit-note rows and ${pay.length} payment rows (${classifyCyl ? 'CYL classified from customer ref' : 'all LPG, legacy classification'}).`);
