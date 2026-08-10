#!/usr/bin/env node
/**
 * Generate a customer-facing Statement of Account (opening balance, ageing,
 * open invoices) for TWK AGRI PTY LTD (TWK002 + linked site codes TWK003/TWK004)
 * directly from ERP DEBENQ TXT exports. No DATABASE_URL required.
 *
 * Usage:
 *   node analysis/debtors/TWK002/scripts/generate_statement_of_account.mjs [--as-at YYYY-MM-DD] [--pdf]
 *
 * Config: analysis/debtors/TWK002/config/statement_of_account.json
 *
 * This captures the repeatable TWK002 customer-statement playbook run
 * interactively on 2026-08-10: parse open invoices from DEBENQ_TWK002.TXT,
 * roll up TWK003/TWK004 site balances, bucket ageing off invoice date, and
 * emit the same layout as TWK002_Statement_of_Account.md.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

const PAYMENT_TYPES = new Set(['Payment', 'Journal', 'Ud Paymnt', 'Bank XFer']);

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function parseArgs(argv) {
  const args = { asAt: null, pdf: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--as-at') args.asAt = argv[++i];
    else if (argv[i] === '--pdf') args.pdf = true;
    else if (argv[i] === '--debtor') args.debtor = argv[++i];
  }
  return args;
}

function loadConfig(debtorCode) {
  const cfgPath = path.join(
    ROOT,
    'analysis/debtors',
    debtorCode,
    'config/statement_of_account.json',
  );
  if (!fs.existsSync(cfgPath)) {
    throw new Error(`Missing config: ${cfgPath}`);
  }
  return JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (const c of line) {
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (c === ',' && !inQ) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

function normDoc(s) {
  const d = String(s || '').replace(/\D/g, '');
  return d ? String(parseInt(d, 10)) : '';
}

function parseTxtDate(s) {
  const [d, m, y] = s.split('/');
  const yyyy = y.length === 2 ? `20${y}` : y;
  return `${yyyy}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function displayDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-ZA', { month: 'short' })} ${d.getFullYear()}`;
}

/**
 * Open invoice model: Invoice sets base; Crd Note and invoice-tagged
 * Payment/Journal rows net against the matched invoice document. Rows with
 * no invno on a payment/journal are account-level (not invoice-specific) and
 * are absorbed into the reconciliation adjustment, not a per-invoice row.
 */
function computeOpenInvoices(rows) {
  const balance = new Map();
  const meta = new Map();

  for (const r of rows) {
    if (r.entry === 'Invoice') {
      meta.set(r.cleanDoc, { docno: r.docno, iso: r.iso, dn: r.dn });
      balance.set(r.cleanDoc, round2((balance.get(r.cleanDoc) || 0) + r.amount));
    } else if (r.entry === 'Crd Note') {
      const target = r.invno || r.cleanDoc;
      if (!target) continue;
      balance.set(target, round2((balance.get(target) || 0) + r.amount));
    } else if (PAYMENT_TYPES.has(r.entry) && r.invno) {
      balance.set(r.invno, round2((balance.get(r.invno) || 0) + r.amount));
    }
  }

  return [...balance.entries()]
    .filter(([key, bal]) => bal > 0.005 && meta.has(key))
    .map(([key, bal]) => ({ key, due: bal, ...meta.get(key) }))
    .sort((a, b) => a.iso.localeCompare(b.iso) || a.docno.localeCompare(b.docno));
}

/** Parse a DEBENQ_*.TXT export, keeping the ERP running-balance column (p[10]). */
function parseDebenqWithRunning(absPath) {
  const txt = fs.readFileSync(absPath, 'utf8');
  const headerBalance = Number(txt.match(/CURRENT BALANCE:","(-?[0-9.]+)"/)?.[1]);
  const rows = [];
  for (const line of txt.split('\n')) {
    if (!/^"\d+"/.test(line.trim())) continue;
    const p = parseCsvLine(line);
    if (p.length < 11) continue;
    const [, , docno, entry, date, invno, dn] = p;
    const amount = round2(Number(p[9]));
    const runningBalance = round2(Number(p[10]));
    if (!date || !date.includes('/')) continue;
    rows.push({
      docno,
      cleanDoc: normDoc(docno),
      entry,
      iso: parseTxtDate(date),
      invno: normDoc(invno),
      dn: (dn || '').trim(),
      amount,
      runningBalance,
    });
  }
  return { headerBalance, rows };
}

function openingBalanceForMonth(rows, monthStartIso) {
  const before = rows.filter((r) => r.iso < monthStartIso);
  if (!before.length) return null;
  before.sort((a, b) => a.iso.localeCompare(b.iso));
  return before[before.length - 1].runningBalance;
}

function ageBucket(days) {
  if (days <= 30) return 'current';
  if (days <= 60) return 'd30';
  if (days <= 90) return 'd60';
  if (days <= 120) return 'd90';
  return 'd120';
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const debtorCode = args.debtor || 'TWK002';
  const cfg = loadConfig(debtorCode);

  const asAt = args.asAt ? new Date(`${args.asAt}T12:00:00`) : new Date();
  const asAtIso = asAt.toISOString().slice(0, 10);
  const monthStartIso = `${asAtIso.slice(0, 7)}-01`;

  const primaryPath = path.join(ROOT, cfg.primaryTxt);
  const { headerBalance: primaryHeader, rows: primaryRows } = parseDebenqWithRunning(primaryPath);

  const openInvoices = computeOpenInvoices(primaryRows);
  const openingBalance = openingBalanceForMonth(primaryRows, monthStartIso);

  // Site roll-up (balances only — no invoice-level detail expected once cleared)
  const siteBalances = [];
  for (const [code, rel] of Object.entries(cfg.siteTxts || {})) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const { headerBalance } = parseDebenqWithRunning(abs);
    siteBalances.push({ code, headerBalance });
  }

  const siteTotal = round2(siteBalances.reduce((s, x) => s + x.headerBalance, 0));
  const totalDue = round2(primaryHeader + siteTotal);
  const movementThisMonth =
    openingBalance != null ? round2(primaryHeader - openingBalance) : null;

  // Ageing buckets from invoice-level open due, reconciled to totalDue via
  // an adjustment placed in the oldest (120-day) bucket — the same
  // reconciliation approach used for the manual 2026-08-10 statement.
  const buckets = { current: 0, d30: 0, d60: 0, d90: 0, d120: 0 };
  let sumOpenInvoices = 0;
  for (const inv of openInvoices) {
    const invDate = new Date(`${inv.iso}T12:00:00`);
    const days = Math.floor((asAt - invDate) / 86400000);
    buckets[ageBucket(days)] = round2(buckets[ageBucket(days)] + inv.due);
    sumOpenInvoices = round2(sumOpenInvoices + inv.due);
  }
  const reconAdjustment = round2(totalDue - sumOpenInvoices);
  buckets.d120 = round2(buckets.d120 + reconAdjustment);

  const asAtLabel = asAt.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const monthLabel = asAt.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });

  const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const lines = [];
  lines.push('# Statement of Account', '');
  cfg.businessHeader.forEach((h, i) => {
    lines.push(i === 0 ? `**${h}**  ` : `${h}  `);
  });
  lines.push('', '---', '');
  lines.push(`**To:** ${cfg.customerName}  `);
  lines.push(`**Account:** ${debtorCode}  `);
  lines.push(`**TWK reference:** ${cfg.twkReference}  `);
  lines.push(`**Statement date:** ${asAtLabel}  `);
  lines.push('', '---', '', '## Account summary', '');
  lines.push('| | Amount (R) |');
  lines.push('| :--- | ---: |');
  if (openingBalance != null) {
    lines.push(`| **Opening balance** (1 ${monthLabel}) | ${fmt(openingBalance)} |`);
    lines.push(`| Movement this month (invoices, payments, journals) | ${fmt(movementThisMonth)} |`);
  }
  lines.push(`| ${debtorCode} balance | ${fmt(primaryHeader)} |`);
  for (const s of siteBalances) {
    lines.push(`| ${s.code} adjustment | ${fmt(s.headerBalance)} |`);
  }
  lines.push(`| **Balance due** | **${fmt(totalDue)}** |`);
  lines.push('', '---', '', '## Aged balance (as at statement date)', '');
  lines.push('Age is calculated from **invoice date** to ' + asAtLabel + '.', '');
  lines.push('| Current | 30 day | 60 day | 90 day | 120 day | **Total due** |');
  lines.push('| ---: | ---: | ---: | ---: | ---: | ---: |');
  lines.push(
    `| ${fmt(buckets.current)} | ${fmt(buckets.d30)} | ${fmt(buckets.d60)} | ${fmt(buckets.d90)} | ${fmt(buckets.d120)} | **${fmt(totalDue)}** |`,
  );
  lines.push(
    '',
    '*120 day column includes long-outstanding items and account-level adjustments not tied to a single invoice.*',
    '',
    '---',
    '',
    '## Open invoices',
    '',
  );
  lines.push('| Inv | Inv date | DN / ref | **Due (R)** |');
  lines.push('| :--- | :--- | :--- | ---: |');
  for (const inv of openInvoices) {
    lines.push(`| ${inv.docno.replace(/^0+/, '') || inv.docno} | ${displayDate(inv.iso)} | ${inv.dn} | ${fmt(inv.due)} |`);
  }
  lines.push(
    '',
    '---',
    '',
    `Please remit **R${fmt(totalDue)}** and quote reference **${cfg.twkReference}** on payment. If payment has already been made, send proof of payment so we can allocate it promptly.`,
    '',
  );

  const outDir = path.join(ROOT, cfg.outputDir);
  fs.mkdirSync(outDir, { recursive: true });
  const mdPath = path.join(outDir, `${cfg.outputBaseName}.md`);
  fs.writeFileSync(mdPath, lines.join('\n'));
  console.log(`[${debtorCode}] Statement written: ${mdPath}`);
  console.log(`[${debtorCode}] Balance due: R${fmt(totalDue)}`);

  if (args.pdf) {
    const stylesheet = path.join(ROOT, cfg.pdfStylesheet);
    const res = spawnSync(
      'npx',
      ['md-to-pdf', mdPath, '--stylesheet', stylesheet],
      { cwd: outDir, stdio: 'inherit' },
    );
    if (res.status !== 0) {
      console.error(`[${debtorCode}] PDF generation failed (exit ${res.status})`);
      process.exitCode = 1;
    } else {
      console.log(`[${debtorCode}] PDF written: ${mdPath.replace(/\.md$/, '.pdf')}`);
    }
  }
}

main();
