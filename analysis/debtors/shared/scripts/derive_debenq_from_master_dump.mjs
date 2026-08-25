#!/usr/bin/env node
/**
 * Derive a DEBENQ-format per-account statement TXT from the master ERP ledger
 * dump (`ERP RAW DATA/DETRANS.TXT`) for a debtor that has never received a
 * dedicated ERP statement export.
 *
 * WARNING: this is NOT a substitute for a genuine ERP DEBENQ export. The
 * opening balance (BALANCE B/F) cannot be recovered from the master dump —
 * it is written as ASSUMED = 0.00 unless --opening-balance is supplied with
 * evidence. Running balances are self-computed by this script, not ERP-stated.
 * Treat every figure downstream as ASSUMED basis until a real ERP export
 * confirms it (DEBTORS_DOCTRINE.md §6; SKILL_Debtors_Orchestrator.md "ERP
 * freshness gate").
 *
 * Usage:
 *   node analysis/debtors/shared/scripts/derive_debenq_from_master_dump.mjs \
 *     --debtor DBS001 --source "ERP RAW DATA/DETRANS.TXT" [--opening-balance 0]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

function parseArgs() {
  const argv = process.argv.slice(2);
  const get = (flag) => {
    const i = argv.indexOf(flag);
    return i === -1 ? undefined : argv[i + 1];
  };
  const debtorCode = get('--debtor');
  const source = get('--source') || 'ERP RAW DATA/DETRANS.TXT';
  const openingBalance = Number(get('--opening-balance') ?? 0);
  if (!debtorCode) {
    console.error('Usage: derive_debenq_from_master_dump.mjs --debtor CODE [--source PATH] [--opening-balance N]');
    process.exit(1);
  }
  return { debtorCode: debtorCode.toUpperCase(), source, openingBalance };
}

function parseCsvLine(line) {
  const out = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQ = !inQ; continue; }
    if (c === ',' && !inQ) { out.push(cur); cur = ''; continue; }
    cur += c;
  }
  out.push(cur);
  return out;
}

function ddmmyyyyToIso(d) {
  const [dd, mm, yy] = d.split('/');
  const y = yy.length === 2 ? `20${yy}` : yy;
  return `${y}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

const round2 = (n) => Math.round(Number(n) * 100) / 100;

function main() {
  const { debtorCode, source, openingBalance } = parseArgs();
  const sourcePath = path.isAbsolute(source) ? source : path.join(ROOT, source);
  if (!fs.existsSync(sourcePath)) {
    console.error(`Missing source: ${sourcePath}`);
    process.exit(1);
  }

  const lines = fs.readFileSync(sourcePath, 'utf8').split('\n');
  const header = parseCsvLine(lines[0]);
  // DETRANS.TXT: ENTRY,PERIOD,ACCNO,NAME,DOCNO,INVNO,DEBORDER,ORDERNO,DEPREF,DATE,REF,AMOUNT,TAX,EXCODE,FAMOUNT,PAID
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  const required = ['ENTRY', 'PERIOD', 'ACCNO', 'NAME', 'DOCNO', 'INVNO', 'DEBORDER', 'ORDERNO', 'DATE', 'AMOUNT'];
  for (const col of required) {
    if (!(col in idx)) {
      console.error(`Source is missing expected column "${col}" — this script targets DETRANS.TXT-shaped exports only.`);
      process.exit(1);
    }
  }

  const rows = [];
  let debtorName = null;
  for (const line of lines) {
    if (!line.startsWith('"')) continue;
    const p = parseCsvLine(line);
    if (p[idx.ACCNO] !== debtorCode) continue;
    if (!p[idx.DATE] || !p[idx.DATE].includes('/')) continue;
    debtorName = p[idx.NAME] || debtorName;
    rows.push({
      entry: p[idx.ENTRY],
      period: p[idx.PERIOD],
      docNo: p[idx.DOCNO],
      invNo: p[idx.INVNO],
      custRef: p[idx.DEBORDER],
      orderNo: p[idx.ORDERNO],
      name: p[idx.NAME],
      date: p[idx.DATE],
      iso: ddmmyyyyToIso(p[idx.DATE]),
      amount: round2(Number(p[idx.AMOUNT])),
    });
  }

  if (!rows.length) {
    console.error(`No rows found for ACCNO="${debtorCode}" in ${sourcePath}`);
    process.exit(1);
  }

  rows.sort((a, b) => a.iso.localeCompare(b.iso) || a.docNo.localeCompare(b.docNo));

  let running = openingBalance;
  const dataLines = [];
  dataLines.push(
    `"1","","","","","","BALANCE B/F:","","","${openingBalance.toFixed(2)}","${openingBalance.toFixed(2)}"`,
  );
  rows.forEach((r, i) => {
    running = round2(running + r.amount);
    const line = [
      String(i + 2),
      r.period,
      r.docNo,
      r.entry,
      r.date,
      r.invNo,
      r.custRef,
      r.orderNo,
      r.name,
      r.amount.toFixed(2),
      running.toFixed(2),
    ]
      .map((v) => `"${v}"`)
      .join(',');
    dataLines.push(line);
  });

  const outDir = path.join(ROOT, 'analysis/debtors', debtorCode, 'raw');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${debtorCode}_DERIVED_FROM_MASTER_DUMP.TXT`);

  const banner = [
    `"DERIVATION WARNING:","This file is NOT a genuine ERP DEBENQ export. It was mechanically derived from the master ledger dump (${path.relative(ROOT, sourcePath)}) by derive_debenq_from_master_dump.mjs because no dedicated per-account ERP statement export exists for ${debtorCode}. Opening balance is ASSUMED = ${openingBalance.toFixed(2)} (no BALANCE B/F evidence available). All running balances below are self-computed, not ERP-stated. Treat as ASSUMED basis until a real ERP export is obtained — see SKILL_Debtors_Orchestrator.md ERP freshness gate."`,
    `"ACCOUNT:","${debtorCode} - ${debtorName || ''}"`,
    `"ACCOUNT CURRENCY:","Local"`,
    `"DISPLAY CURRENCY:","Local"`,
    `"CURRENT BALANCE:","${running.toFixed(2)}"`,
    `"UD PAY/CHEQUES:","0.00"`,
    `"CREDIT CLAIMS:","0.00"`,
    `"TOTAL EXCLUDING UD/CLAIMS:","${running.toFixed(2)}"`,
    `"SORT ORDER:","DOCUMENT DATE (re-sorted from master dump order — not ERP-native)"`,
    `"YEAR:","DERIVED"`,
    `"INCLUDE:","DERIVED FROM ${path.relative(ROOT, sourcePath)}"`,
    '',
    `"LINE","PERIOD","DOCNO","ENTRY","DATE","INVNO","CUSTOMER/BANK REF","ORDER","REFERENCE","AMOUNT","BALANCE"`,
  ].join('\n');

  fs.writeFileSync(outPath, `${banner}\n${dataLines.join('\n')}\n`);
  console.log(`[${debtorCode}] ${rows.length} rows derived from ${path.relative(ROOT, sourcePath)}`);
  console.log(`[${debtorCode}] ASSUMED opening balance: ${openingBalance.toFixed(2)}`);
  console.log(`[${debtorCode}] Self-computed closing balance: ${running.toFixed(2)}`);
  console.log(`Written ${outPath}`);
}

main();
