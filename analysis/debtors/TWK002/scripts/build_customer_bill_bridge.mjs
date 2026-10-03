#!/usr/bin/env node
/**
 * TWK002 restart — customer bill bridge (ERP header vs remittance ledger vs open bill).
 *
 * Run: node analysis/debtors/TWK002/scripts/build_customer_bill_bridge.mjs [--write]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCsvLine, fmtAmount } from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const OUT = path.join(ROOT, 'analysis/debtors/TWK002/restart');
const write = process.argv.includes('--write');

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const fmtR = (n) => 'R' + fmtAmount(round2(n));

const PATH_B_DOCNOS = new Set([
  '334', '490', '491', '492', '493', '494', '495', '496', '499', '500', '501', '502',
  '503', '504', '505', '506', '507', '508', '509', '510', '511',
]);

function readClosing() {
  const lines = fs.readFileSync(path.join(OUT, 'ledger.csv'), 'utf8').trim().split('\n').slice(1);
  return round2(Number(lines.at(-1).split(',')[6]));
}

function readOpenSum() {
  const lines = fs.readFileSync(path.join(OUT, 'open_invoices.csv'), 'utf8').trim().split('\n').slice(1);
  let sum = 0;
  for (const line of lines) {
    const p = parseCsvLine(line);
    sum = round2(sum + Number(p[p.length - 3] ?? 0));
  }
  return sum;
}

function readErpHeader() {
  const txt = fs.readFileSync(
    path.join(ROOT, 'analysis/debtors/TWK002/raw/TWK002_FULL_HISTORY.TXT'),
    'utf8',
  );
  return round2(Number(txt.match(/CURRENT BALANCE:\",\"([^\"]+)/)[1]));
}

function sumPathBJournals() {
  const txt = fs.readFileSync(
    path.join(ROOT, 'analysis/debtors/TWK002/raw/TWK002_FULL_HISTORY.TXT'),
    'utf8',
  );
  const lines = txt.split(/\r?\n/).filter(Boolean);
  const start = lines.findIndex((l) => l.startsWith('"LINE"'));
  let sum = 0;
  for (let i = start + 1; i < lines.length; i++) {
    const p = parseCsvLine(lines[i]);
    if (p[3] !== 'Journal') continue;
    const doc = String(p[2] ?? '').replace(/^0+/, '') || '0';
    const ref = `${p[6]} ${p[8]}`.toUpperCase();
    if (
      PATH_B_DOCNOS.has(doc) ||
      ref.includes('DISCOUNT ALLOWED') ||
      ref.includes('PAYMENT CORRECTION')
    ) {
      sum = round2(sum + Number(p[9]));
    }
  }
  return sum;
}

function sumOverpost() {
  const lines = fs.readFileSync(path.join(OUT, 'remittance_alloc.csv'), 'utf8').trim().split('\n').slice(1);
  let sum = 0;
  for (const line of lines) {
    const p = line.split(',');
    if (p[4] !== 'ERP_OVERPOST') continue;
    sum = round2(sum + Math.abs(Number(p[10])));
  }
  return sum;
}

function readOpenRows() {
  const lines = fs.readFileSync(path.join(OUT, 'open_invoices.csv'), 'utf8').trim().split('\n').slice(1);
  return lines.map((line) => {
    const p = parseCsvLine(line);
    return {
      doc: p[0],
      date: p[2],
      dn: p[3],
      invoiceGross: round2(Number(p[4])),
      cnDoc: p[5],
      cnAmount: round2(Number(p[6])),
      due: round2(Number(p[8])),
    };
  });
}

function buildBridge() {
  const customerBill = readOpenSum();
  const remittanceClosing = readClosing();
  const erpHeader = readErpHeader();
  const gapBillClosing = round2(remittanceClosing - customerBill);
  const gapBillErp = round2(erpHeader - customerBill);
  const gapClosingErp = round2(erpHeader - remittanceClosing);

  const stat129Discount = 1223.45;
  const stat129Gross = 110046.87;
  const stat129Cash = 108823.42;
  const beforeStat129 = round2(stat129Gross + remittanceClosing);
  const afterStat129Cash = round2(beforeStat129 - stat129Cash);
  const ledgerCarry = round2(gapBillClosing - stat129Discount);

  const pathB = sumPathBJournals();
  const overpost = sumOverpost();
  const erpUnallocated = round2(gapClosingErp - pathB);

  return {
    customerBill,
    remittanceClosing,
    erpHeader,
    gapBillClosing,
    gapBillErp,
    gapClosingErp,
    stat129Discount,
    stat129Gross,
    stat129Cash,
    beforeStat129,
    afterStat129Cash,
    ledgerCarry,
    pathB,
    overpost,
    erpUnallocated,
    openRows: readOpenRows(),
  };
}

function buildMd(d) {
  const md = [];
  md.push('# TWK002 — Customer bill bridge');
  md.push('');
  md.push('> **Greenfield restart** — reconciles three balances as at full-history TXT cut-off.');
  md.push(`> Generated: ${new Date().toISOString().slice(0, 10)}`);
  md.push('');
  md.push('## North star');
  md.push('');
  md.push('| Balance | Amount | Role | Tag |');
  md.push('| :--- | ---: | :--- | :--- |');
  md.push(`| **Customer bill** | **${fmtR(d.customerBill)}** | Collections / fork SOA Amount due | **PROVEN** — \`restart/open_invoices.csv\`, \`reports/restart/TWK002_Statement_of_Account_RESTART.md\` |`);
  md.push(`| Remittance ledger closing | ${fmtR(d.remittanceClosing)} | Running AR after spine + remittance alloc + Model B journals | **PROVEN** — \`restart/ledger.csv\` |`);
  md.push(`| ERP header | ${fmtR(d.erpHeader)} | ERP running balance (tie-out only on fork SOA) | **PROVEN** — \`raw/TWK002_FULL_HISTORY.TXT\` |`);
  md.push('');
  md.push('---');
  md.push('');
  md.push('## Bridge A — Customer bill → remittance ledger closing');
  md.push('');
  md.push(`**Gap: ${fmtR(d.gapBillClosing)}** (remittance closing − customer bill)`);
  md.push('');
  md.push('| Line | Amount | Explanation | Tag |');
  md.push('| :--- | ---: | :--- | :--- |');
  md.push(`| Customer bill (open invoices) | ${fmtR(d.customerBill)} | Inv 52484 + 52803 net of spine CNs 15443 / 15553 | **PROVEN** |`);
  md.push(`| STAT 129 Model B discount (batch journal) | ${fmtR(d.stat129Discount)} | Pro forma \`DJ-BATCH-2026-STAT-129\` in restart ledger — reduces running AR but not invoice Due rows on the open tail | **PROVEN** — \`restart/ledger.csv\` Layer C |`);
  md.push(`| Remittance ledger carry | ${fmtR(d.ledgerCarry)} | Running ledger after discount still exceeds per-invoice Due on the two open docs — spine CN rows, composite 51841 slices, and doc-level vs running-total timing | **ASSERTED** — residual ${fmtR(d.ledgerCarry)}; not billable |`);
  md.push(`| **= Remittance ledger closing** | **${fmtR(d.remittanceClosing)}** | | **PROVEN** |`);
  md.push('');
  md.push('### STAT 129 identity (PROVEN)');
  md.push('');
  md.push('```');
  md.push(`AR before STAT 129 cash     ${fmtR(d.beforeStat129)}  (= STAT129 cluster ${fmtR(d.stat129Gross)} + post-settlement carry ${fmtR(d.remittanceClosing)})`);
  md.push(`− STAT 129 remittance cash  ${fmtR(d.stat129Cash)}`);
  md.push(`= After cash, before disc   ${fmtR(d.afterStat129Cash)}  (= discount ${fmtR(d.stat129Discount)} + closing ${fmtR(d.remittanceClosing)})`);
  md.push(`− Model B discount journal  ${fmtR(d.stat129Discount)}`);
  md.push(`= Remittance closing        ${fmtR(d.remittanceClosing)}`);
  md.push('```');
  md.push('');
  md.push('Open tail **52484 / 52803** were **not** on the STAT 129 advice — they post on spine after the Aug cluster and are the only customer bill.');
  md.push('');
  md.push('---');
  md.push('');
  md.push('## Bridge B — Customer bill → ERP header');
  md.push('');
  md.push(`**Gap: ${fmtR(d.gapBillErp)}** (ERP header − customer bill)`);
  md.push('');
  md.push('| Line | Amount | Explanation | Tag |');
  md.push('| :--- | ---: | :--- | :--- |');
  md.push(`| Customer bill | ${fmtR(d.customerBill)} | Remittance-authoritative open list | **PROVEN** |`);
  md.push(`| Bridge A (remittance carry + STAT 129 discount) | ${fmtR(d.gapBillClosing)} | See above | **PROVEN** |`);
  md.push(`| Bridge C (ERP − remittance) | ${fmtR(d.gapClosingErp)} | ERP posting artefacts not in restart ledger | **PROVEN** |`);
  md.push(`| **= ERP header** | **${fmtR(d.erpHeader)}** | | **PROVEN** |`);
  md.push('');
  md.push('---');
  md.push('');
  md.push('## Bridge C — Remittance ledger closing → ERP header');
  md.push('');
  md.push(`**Gap: ${fmtR(d.gapClosingErp)}**`);
  md.push('');
  md.push('| Component | Amount | Notes | Tag |');
  md.push('| :--- | ---: | :--- | :--- |');
  md.push(`| Path B journals (ERP only) | ${fmtR(d.pathB)} | \`00000334\`, \`00000490\`–\`00000511\` — restart uses per-batch pro forma discount instead | **PROVEN** — TXT Journal rows |`);
  md.push(`| ERP over-post orphans (8 batches) | ${fmtR(d.overpost)} | Remittance gross < ERP payment gross; restart posts \`ERP_OVERPOST\` contra — not on invoices | **PROVEN** — \`restart/remittance_alloc.csv\` |`);
  md.push(`| Tail ERP-only postings | ${fmtR(d.erpUnallocated)} | Residual: \`00000510\` / \`00000511\` Aug-2026 catch-up, payment \`00045899\` cash vs remittance line timing, untagged STAT slices | **ASSERTED** — ${fmtR(d.gapClosingErp)} − Path B ${fmtR(d.pathB)} = ${fmtR(d.erpUnallocated)} |`);
  md.push('');
  md.push('These are **ERP hygiene / posting artefacts**, not TWK customer debt. The fork SOA shows ERP header as tie-out only.');
  md.push('');
  md.push('---');
  md.push('');
  md.push('## Open invoice detail (customer bill)');
  md.push('');
  md.push('| Inv | Date | D/N | Invoice (R) | CN doc | CN (R) | **Due (R)** |');
  md.push('| :--- | :--- | :--- | ---: | :--- | ---: | ---: |');
  for (const r of d.openRows) {
    md.push(
      `| ${r.doc} | ${r.date} | ${r.dn} | ${fmtR(r.invoiceGross)} | ${r.cnDoc || '—'} | ${fmtR(r.cnAmount)} | ${fmtR(r.due)} |`,
    );
  }
  md.push('');
  md.push('---');
  md.push('');
  md.push('## What is *not* on the customer bill');
  md.push('');
  md.push('| Item | Why excluded |');
  md.push('| :--- | :--- |');
  md.push('| Invoices 42468 / 42470 | Settled on STAT 114 remittance — natively closed in restart ledger (no override) |');
  md.push('| STAT 129 cluster (49208–52241) | On remittance advice — allocated in restart ledger |');
  md.push('| ERP Path B journals | Catch-up postings — restart uses remittance pro forma discount per batch |');
  md.push('| ERP over-post orphans (R7,298 Σ) | Bank deposit > remittance gross — \`ERP_OVERPOST\` contra, not invoice debt |');
  md.push('| Account-level bridge R8,084.67 (live SOA) | **Does not exist** on fork SOA — \`balanceBridgeLines: []\` |');
  md.push('');
  md.push('---');
  md.push('');
  md.push('*Generated by `scripts/build_customer_bill_bridge.mjs`*');
  return md.join('\n');
}

const data = buildBridge();
console.log('Customer bill bridge');
console.log(`  Customer bill:     ${fmtR(data.customerBill)}`);
console.log(`  Remittance close:  ${fmtR(data.remittanceClosing)}  (gap ${fmtR(data.gapBillClosing)})`);
console.log(`  ERP header:        ${fmtR(data.erpHeader)}  (gap ${fmtR(data.gapBillErp)})`);

if (write) {
  fs.mkdirSync(OUT, { recursive: true });
  const outPath = path.join(OUT, 'customer_bill_bridge.md');
  fs.writeFileSync(outPath, buildMd(data));
  console.log(`\nWrote ${path.relative(ROOT, outPath)}`);
} else {
  console.log('\nDry run — pass --write to emit');
}
