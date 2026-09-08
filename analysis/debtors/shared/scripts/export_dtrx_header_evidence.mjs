#!/usr/bin/env node
/**
 * Pull JAY000 (or --debtor) DTRX headers + items from Supabase into evidence CSVs.
 * Requires DATABASE_URL. Does not invent DEBENQ figures.
 *
 *   DATABASE_URL=... PGSSL_REJECT_UNAUTHORIZED=false \
 *     node analysis/debtors/shared/scripts/export_dtrx_header_evidence.mjs --debtor JAY000
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { pgClientOptions } from './require_database_url.mjs';
import { writeCsv, isoDate, itemGross } from './dtrx_header_statement.mjs';

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
  const i = args.indexOf('--debtor');
  const debtor = i >= 0 && args[i + 1] ? args[i + 1].toUpperCase() : null;
  if (!debtor) {
    console.error('Usage: export_dtrx_header_evidence.mjs --debtor CODE');
    process.exit(1);
  }
  return { debtorCode: debtor };
}

async function main() {
  const { debtorCode } = parseArgs();
  const dataDir = path.join(ROOT, 'analysis/debtors', debtorCode, 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  const client = new pg.Client(pgClientOptions());
  await client.connect();

  const headersRes = await client.query(
    `SELECT id, entry_type, period, account_no, account_name, doc_no, ref_no,
            description, order_no, batch_ref, tx_date, amount_excl, tax_amount,
            source_file, fingerprint
     FROM transaction_headers
     WHERE account_no = $1
     ORDER BY tx_date, id`,
    [debtorCode],
  );

  const itemsRes = await client.query(
    `SELECT i.id, i.entry_type, i.period, i.account_no, i.account_name, i.doc_no,
            i.stock_no, i.description, i.category, i.product_group, i.order_no,
            i.tx_date, i.qty, i.retail_price, i.line_tax, i.reference,
            i.source_file, i.fingerprint,
            v.debt_group, v.line_total
     FROM transaction_items i
     LEFT JOIN vw_clean_transactions v ON v.id = i.id
     WHERE i.account_no = $1
     ORDER BY i.tx_date, i.doc_no, i.id`,
    [debtorCode],
  );
  await client.end();

  const headerCols = [
    'header_id',
    'account_no',
    'account_name',
    'entry_type',
    'period',
    'doc_no',
    'ref_no',
    'description',
    'order_no',
    'batch_ref',
    'tx_date',
    'amount_excl',
    'tax_amount',
    'source_file',
    'fingerprint',
  ];
  const headerRows = headersRes.rows.map((r) => ({
    header_id: r.id,
    account_no: r.account_no,
    account_name: r.account_name,
    entry_type: r.entry_type,
    period: r.period,
    doc_no: r.doc_no,
    ref_no: r.ref_no,
    description: r.description,
    order_no: r.order_no,
    batch_ref: r.batch_ref,
    tx_date: isoDate(r.tx_date),
    amount_excl: r.amount_excl,
    tax_amount: r.tax_amount,
    source_file: r.source_file,
    fingerprint: r.fingerprint,
  }));

  const itemCols = [
    'item_id',
    'account_no',
    'account_name',
    'entry_type',
    'period',
    'doc_no',
    'stock_no',
    'description',
    'category',
    'product_group',
    'debt_group',
    'order_no',
    'tx_date',
    'qty',
    'retail_price',
    'line_tax',
    'line_total',
    'reference',
    'source_file',
    'fingerprint',
  ];
  const itemRows = itemsRes.rows.map((r) => {
    const mapped = {
      item_id: r.id,
      account_no: r.account_no,
      account_name: r.account_name,
      entry_type: r.entry_type,
      period: r.period,
      doc_no: r.doc_no,
      stock_no: r.stock_no,
      description: r.description,
      category: r.category,
      product_group: r.product_group,
      debt_group: r.debt_group || r.product_group,
      order_no: r.order_no,
      tx_date: isoDate(r.tx_date),
      qty: r.qty,
      retail_price: r.retail_price,
      line_tax: r.line_tax,
      line_total: r.line_total,
      reference: r.reference,
      source_file: r.source_file,
      fingerprint: r.fingerprint,
    };
    if (mapped.line_total === null || mapped.line_total === undefined || mapped.line_total === '') {
      mapped.line_total = itemGross(mapped);
    }
    return mapped;
  });

  const headersPath = path.join(dataDir, 'dtrx_headers.csv');
  const itemsPath = path.join(dataDir, 'dtrx_items.csv');
  writeCsv(headersPath, headerCols, headerRows);
  writeCsv(itemsPath, itemCols, itemRows);

  const meta = {
    debtorCode,
    pulledAt: new Date().toISOString(),
    headerCount: headerRows.length,
    itemCount: itemRows.length,
    maxHeaderTxDate: headerRows.reduce((m, r) => (r.tx_date > m ? r.tx_date : m), ''),
    maxItemTxDate: itemRows.reduce((m, r) => (r.tx_date > m ? r.tx_date : m), ''),
    outputs: {
      headers: `analysis/debtors/${debtorCode}/data/dtrx_headers.csv`,
      items: `analysis/debtors/${debtorCode}/data/dtrx_items.csv`,
    },
    note: 'Evidence export from transaction_headers / transaction_items. Not a DEBENQ CURRENT BALANCE.',
  };
  fs.writeFileSync(path.join(dataDir, 'dtrx_export_meta.json'), `${JSON.stringify(meta, null, 2)}\n`);

  console.log(`[${debtorCode}] Exported ${headerRows.length} headers, ${itemRows.length} items`);
  console.log(`  ${headersPath}`);
  console.log(`  ${itemsPath}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
