#!/usr/bin/env node
/**
 * Pull latest transaction_headers + vw_clean_transactions from Supabase
 * into analysis/debtors/[CODE]/data/invoices.csv and payments.csv.
 *
 * Does NOT overwrite allocation_edges.csv (remittance-authoritative accounts
 * like TWK002 maintain that separately).
 *
 * Usage:
 *   node analysis/debtors/shared/scripts/pull_debtor_transactions_from_db.mjs --debtor TWK002
 *
 * Requires DATABASE_URL (PGSSL_REJECT_UNAUTHORIZED=false for Supabase pooler if needed).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { pgClientOptions } from './require_database_url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

function loadDotEnv() {
  if (process.env.DATABASE_URL) return;
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnv();

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 && args[i + 1] ? args[i + 1] : null;
  };
  const debtor = get('--debtor');
  if (!debtor) {
    console.error('Usage: pull_debtor_transactions_from_db.mjs --debtor CODE');
    process.exit(1);
  }
  return { debtorCode: debtor.toUpperCase() };
}

function padDoc(doc) {
  const d = String(doc ?? '').replace(/^0+/, '') || '0';
  return d.padStart(8, '0');
}

function csvEscape(val) {
  const s = String(val ?? '');
  return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeCsv(filePath, header, rows) {
  const lines = [header.join(',')];
  for (const row of rows) {
    lines.push(header.map((h) => csvEscape(row[h])).join(','));
  }
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`);
}

const PAYMENT_TYPES = new Set(['Payment', 'Ud Paymnt', 'Bank XFer', 'Bank UD', 'Bank Dep']);

async function main() {
  const { debtorCode } = parseArgs();
  const dataDir = path.join(ROOT, 'analysis/debtors', debtorCode, 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  const client = new pg.Client(pgClientOptions());
  await client.connect();

  const headers = (
    await client.query(
      `SELECT account_no, doc_no, entry_type, tx_date, ref_no, description, period,
              amount_excl, tax_amount, source_file
       FROM transaction_headers
       WHERE account_no = $1
       ORDER BY tx_date, entry_type, doc_no`,
      [debtorCode],
    )
  ).rows;

  const lines = (
    await client.query(
      `SELECT account_no, doc_no, entry_type, tx_date, stock_no, debt_group,
              qty, line_total
       FROM vw_clean_transactions
       WHERE account_no = $1
       ORDER BY tx_date, entry_type, doc_no, stock_no`,
      [debtorCode],
    )
  ).rows;

  const cnRefByDoc = new Map();
  for (const h of headers) {
    if (h.entry_type !== 'Crd Note') continue;
    const clean = String(h.doc_no ?? '').replace(/^0+/, '');
    cnRefByDoc.set(clean, String(h.ref_no ?? '').replace(/^0+/, ''));
  }

  await client.end();

  const refLookup = new Map();
  for (const h of headers) {
    const clean = String(h.doc_no ?? '').replace(/^0+/, '');
    const desc = String(h.description ?? '').trim();
    if (desc && (!refLookup.has(clean) || desc.length > refLookup.get(clean).length)) {
      refLookup.set(clean, desc);
    }
  }

  const invoiceRows = [];
  for (const l of lines) {
    if (PAYMENT_TYPES.has(l.entry_type) || l.entry_type === 'Journal') continue;
    const docNo = padDoc(l.doc_no);
    const cleanDoc = docNo.replace(/^0+/, '');
    const txDate =
      l.tx_date instanceof Date ? l.tx_date.toISOString().slice(0, 10) : String(l.tx_date ?? '').slice(0, 10);
    const amountIncl = Math.round(Number(l.line_total) * 100) / 100;
    const amountExcl = Math.round((amountIncl / 1.15) * 100) / 100;
    const taxAmount = Math.round((amountIncl - amountExcl) * 100) / 100;
    invoiceRows.push({
      debtor_code: debtorCode,
      doc_no: docNo,
      entry_type: l.entry_type,
      tx_date: txDate,
      month_year: txDate.slice(0, 7),
      stock_code: l.stock_no ?? '',
      description: refLookup.get(cleanDoc) ?? '',
      debt_group: l.debt_group ?? 'LPG',
      lane: l.debt_group ?? 'LPG',
      qty: Number(l.qty) || 0,
      amount_excl: amountExcl,
      tax_amount: taxAmount,
      amount_incl: amountIncl,
      is_cyl: l.debt_group === 'CYL' ? 'True' : 'False',
      is_lpg: l.debt_group === 'LPG' ? 'True' : 'False',
      paired_cyl_doc: l.entry_type === 'Crd Note' ? cnRefByDoc.get(cleanDoc) ?? '' : '',
      notes: 'Pulled from vw_clean_transactions',
    });
  }

  const paymentGroups = new Map();
  for (const h of headers) {
    if (!PAYMENT_TYPES.has(h.entry_type)) continue;
    const docNo = padDoc(h.doc_no);
    const cleanDoc = docNo.replace(/^0+/, '');
    const txDate =
      h.tx_date instanceof Date ? h.tx_date.toISOString().slice(0, 10) : String(h.tx_date ?? '').slice(0, 10);
    const key = `${cleanDoc}|${h.entry_type}|${txDate}`;
    const amt = Math.round((Number(h.amount_excl) + Number(h.tax_amount)) * 100) / 100;
    const existing = paymentGroups.get(key) ?? {
      debtor_code: debtorCode,
      payment_doc: docNo,
      payment_date: txDate,
      batch_ref: String(h.description ?? '').trim(),
      stat_no: String(h.period ?? '').trim(),
      amount: 0,
      source_file: h.source_file ?? '',
      split_count: 0,
    };
    existing.amount = Math.round((existing.amount + amt) * 100) / 100;
    existing.split_count += 1;
    if (existing.batch_ref === '' && h.description) existing.batch_ref = String(h.description).trim();
    paymentGroups.set(key, existing);
  }

  const paymentRows = [...paymentGroups.values()]
    .map((p) => ({
      ...p,
      is_split_payment: p.split_count > 1 ? 'True' : 'False',
      notes: p.split_count > 1 ? `Consolidated from ${p.split_count} ERP segments` : '',
    }))
    .sort((a, b) => a.payment_date.localeCompare(b.payment_date) || a.payment_doc.localeCompare(b.payment_doc));

  const invoiceHeader = [
    'debtor_code',
    'doc_no',
    'entry_type',
    'tx_date',
    'month_year',
    'stock_code',
    'description',
    'debt_group',
    'lane',
    'qty',
    'amount_excl',
    'tax_amount',
    'amount_incl',
    'is_cyl',
    'is_lpg',
    'paired_cyl_doc',
    'notes',
  ];
  const paymentHeader = [
    'debtor_code',
    'payment_doc',
    'payment_date',
    'batch_ref',
    'stat_no',
    'amount',
    'source_file',
    'split_count',
    'is_split_payment',
    'notes',
  ];

  const invoicesPath = path.join(dataDir, 'invoices.csv');
  const paymentsPath = path.join(dataDir, 'payments.csv');
  writeCsv(invoicesPath, invoiceHeader, invoiceRows);
  writeCsv(paymentsPath, paymentHeader, paymentRows);

  const maxHeaderDate = headers.reduce((m, h) => {
    const d = h.tx_date instanceof Date ? h.tx_date.toISOString().slice(0, 10) : String(h.tx_date ?? '').slice(0, 10);
    return d > m ? d : m;
  }, '');
  const maxLineDate = lines.reduce((m, l) => {
    const d = l.tx_date instanceof Date ? l.tx_date.toISOString().slice(0, 10) : String(l.tx_date ?? '').slice(0, 10);
    return d > m ? d : m;
  }, '');
  const maxUpdated = null;

  const meta = {
    debtorCode,
    pulledAt: new Date().toISOString(),
    headerCount: headers.length,
    lineCount: lines.length,
    invoiceLineCount: invoiceRows.length,
    paymentCount: paymentRows.length,
    maxHeaderTxDate: maxHeaderDate,
    maxLineTxDate: maxLineDate,
    maxUpdatedAt: maxUpdated,
    outputs: {
      invoices: invoicesPath.replace(`${ROOT}/`, ''),
      payments: paymentsPath.replace(`${ROOT}/`, ''),
    },
  };
  const metaPath = path.join(dataDir, 'db_pull_meta.json');
  fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);

  console.log(`[${debtorCode}] DB pull complete`);
  console.log(`  headers: ${headers.length}  lines: ${lines.length}`);
  console.log(`  invoices.csv: ${invoiceRows.length} rows → ${invoicesPath}`);
  console.log(`  payments.csv: ${paymentRows.length} rows → ${paymentsPath}`);
  console.log(`  max tx_date: ${maxHeaderDate} (headers) / ${maxLineDate} (lines)`);
  console.log(`  max updated_at: ${maxUpdated || 'n/a'}`);
  console.log(`  meta: ${metaPath}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
