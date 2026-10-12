#!/usr/bin/env node
/**
 * Export creditor AP statement TXT (DEBENQ-style) from transaction_headers.
 * Use when ERP TXT is not yet dropped — Tier-3 authority should still be ERP export when available.
 *
 * Usage: node analysis/creditors/shared/scripts/export_creditor_txt_from_db.mjs --creditor 008ORY
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pgClientOptions } from './require_database_url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

function parseArgs() {
  const idx = process.argv.indexOf('--creditor');
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error('Usage: export_creditor_txt_from_db.mjs --creditor CODE [--period-start YYYY-MM-DD]');
    process.exit(1);
  }
  const psIdx = process.argv.indexOf('--period-start');
  return {
    creditorCode: process.argv[idx + 1].toUpperCase(),
    periodStart: psIdx >= 0 ? process.argv[psIdx + 1] : null,
  };
}

function loadConfig(creditorCode) {
  const configPath = path.join(ROOT, 'analysis/creditors', creditorCode, 'config/statement_v5.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Missing config: ${configPath}`);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function fmtDate(iso) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y.slice(2)}`;
}

function fmt(n) {
  return Number(n).toFixed(2);
}

async function main() {
  const { creditorCode, periodStart: cliPeriodStart } = parseArgs();
  const cfg = loadConfig(creditorCode);
  const linked = [creditorCode, ...(cfg.linkedAccounts || [])].filter(
    (v, i, a) => a.indexOf(v) === i,
  );
  const periodStart = cliPeriodStart || cfg.periodStart || '2026-01-01';

  const client = new pg.Client(pgClientOptions());
  await client.connect();

  const nameRes = await client.query(
    `SELECT DISTINCT account_name FROM transaction_headers
     WHERE account_no = ANY($1) AND account_name IS NOT NULL
     ORDER BY account_name LIMIT 1`,
    [linked],
  );
  const accountName = nameRes.rows[0]?.account_name || cfg.creditorName || creditorCode;

  const rowsRes = await client.query(
    `
    SELECT doc_no, entry_type, tx_date::date AS tx_date,
           ROUND((amount_excl + tax_amount)::numeric, 2)::float AS amount
    FROM transaction_headers
    WHERE account_no = ANY($1)
    ORDER BY tx_date, entry_type DESC, doc_no`,
    [linked],
  );
  await client.end();

  const allRows = rowsRes.rows;
  const periodRows = allRows.filter((r) => r.tx_date >= periodStart);
  const prePeriod = allRows.filter((r) => r.tx_date < periodStart);

  let running = prePeriod.reduce((s, r) => s + Number(r.amount), 0);
  running = Math.round(running * 100) / 100;

  const headerBalance = periodRows.length
    ? (() => {
        let bal = running;
        for (const r of periodRows) bal = Math.round((bal + Number(r.amount)) * 100) / 100;
        return bal;
      })()
    : running;

  const lines = [
    `"ACCOUNT:","${creditorCode} - ${accountName}"`,
    `"ACCOUNT CURRENCY:","Local"`,
    `"DISPLAY CURRENCY:","Local"`,
    `"CURRENT BALANCE:","${fmt(headerBalance)}"`,
    `"UD PAY/CHEQUES:","0.00"`,
    `"CREDIT CLAIMS:","0.00"`,
    `"TOTAL EXCLUDING UD/CLAIMS:","0.00"`,
    `"SORT ORDER:","DOCUMENT DATE"`,
    `"YEAR:","CURRENT"`,
    `"INCLUDE:","UD PAYMENTS, UD CHEQUES, CREDIT CLAIMS"`,
    `"EXCLUDE:","ALLOCATION DETAIL"`,
    '',
    `"LINE","PERIOD","DOCNO","ENTRY","DATE","INVNO","CUSTOMER/BANK REF","ORDER","REFERENCE","AMOUNT","BALANCE"`,
  ];

  let lineNo = 1;
  if (Math.abs(running) >= 0.005) {
    lines.push(
      `"${lineNo}","","","","","","BALANCE B/F:","","","${fmt(running)}","${fmt(running)}"`,
    );
    lineNo++;
  }

  for (const r of periodRows) {
    running = Math.round((running + Number(r.amount)) * 100) / 100;
    const period = String(new Date(r.tx_date).getMonth() + 1).padStart(2, '0');
    lines.push(
      `"${lineNo}","${period}","${r.doc_no}","${r.entry_type}","${fmtDate(r.tx_date)}","","","","","${fmt(r.amount)}","${fmt(running)}"`,
    );
    lineNo++;
  }

  const outPath = path.join(ROOT, 'analysis/creditors', creditorCode, 'raw', `${creditorCode}CURRENT.TXT`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${lines.join('\n')}\n`);

  console.log(`[${creditorCode}] Exported ${periodRows.length} period rows (+ B/F) → ${outPath}`);
  console.log(`[${creditorCode}] CURRENT BALANCE: R${fmt(headerBalance)}`);
  console.log(`[${creditorCode}] combinedBf (pre-period running): R${fmt(prePeriod.reduce((s, r) => s + Number(r.amount), 0))}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
