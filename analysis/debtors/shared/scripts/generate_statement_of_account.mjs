#!/usr/bin/env node
/**
 * Generate a customer-facing Statement of Account (opening balance, ageing,
 * open invoices) for any debtor directly from ERP DEBENQ TXT exports.
 * No DATABASE_URL required — pure TXT parsing.
 *
 * Usage:
 *   node analysis/debtors/shared/scripts/generate_statement_of_account.mjs \
 *     --debtor [CODE] [--as-at YYYY-MM-DD] [--pdf] [--force]
 *
 * Config: analysis/debtors/[CODE]/config/statement_of_account.json
 *   (template: analysis/debtors/shared/templates/statement_of_account_config.template.json)
 *
 * This captures the repeatable customer-statement playbook first run
 * interactively for TWK002 on 2026-08-10: parse open invoices from the
 * primary DEBENQ TXT, roll up any linked site-code balances, bucket ageing
 * off invoice date, and emit the same layout as
 * TWK002_Statement_of_Account.md. See
 * .agents/skills/SKILL_Debtor_Customer_Statement_From_TXT.md.
 *
 * Before writing, the invoice-tag coverage gate runs over the open-invoice
 * list (see debenq_open_invoices.mjs). A BLOCKED gate aborts the run: it means
 * an invoice the customer has already paid by remittance is about to be billed
 * again. `--force` overrides, and should only be used with a reason recorded.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import {
  round2,
  displayDate,
  fmtAmount,
  parseDebenqWithRunning,
  computeOpenInvoices,
  analyseInvoiceTagCoverage,
  loadRemittanceInvoiceDocs,
  GATE_MEANING,
  REMEDY,
} from './debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

function parseArgs(argv) {
  const args = { asAt: null, pdf: false, force: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--as-at') args.asAt = argv[++i];
    else if (argv[i] === '--pdf') args.pdf = true;
    else if (argv[i] === '--force') args.force = true;
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
    throw new Error(
      `Missing config: ${cfgPath}\n` +
        'Copy analysis/debtors/shared/templates/statement_of_account_config.template.json ' +
        `into analysis/debtors/${debtorCode}/config/statement_of_account.json and fill it in.`,
    );
  }
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  // Back-compat: TWK002's original config used a bespoke `twkReference` field.
  cfg.referenceLabel = cfg.referenceLabel || 'Reference';
  cfg.referenceValue = cfg.referenceValue || cfg.twkReference || '';
  cfg.closedInvoiceOverrides = cfg.closedInvoiceOverrides || [];
  return cfg;
}

function reportTagCoverage(debtorCode, cov) {
  if (cov.gate === 'ALLOWED') {
    console.log(`[${debtorCode}] Invoice tag coverage: ALLOWED (${cov.counts.clear} open invoices, all clear)`);
    return;
  }
  console.warn(`[${debtorCode}] Invoice tag coverage: ${cov.gate}`);
  console.warn(`[${debtorCode}] ${GATE_MEANING[cov.gate]}`);
  if (cov.blocking_reason) console.warn(`[${debtorCode}] REMEDY: ${REMEDY[cov.blocking_reason]}`);
  if (cov.invariant.status === 'BREACHED') {
    console.warn(
      `[${debtorCode}]   INVARIANT BREACHED — Σ(open invoices) exceeds the ERP balance by R${fmtAmount(cov.invariant.overstated_by)}`,
    );
  }
  for (const inv of cov.invoices) {
    if (inv.risk === 'CLEAR') continue;
    console.warn(
      `[${debtorCode}]   ${inv.risk} inv ${inv.doc} (${inv.iso}, R${fmtAmount(inv.due)}) — ${inv.basis}`,
    );
  }
  console.warn(
    `[${debtorCode}] Full detail: node analysis/debtors/shared/scripts/check_invoice_tag_coverage.mjs --debtor ${debtorCode} --write`,
  );
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
  const {
    headerBalance: primaryHeader,
    balanceBf: primaryBf,
    excludesAllocationDetail,
    rows: primaryRows,
  } = parseDebenqWithRunning(primaryPath);

  const openInvoices = computeOpenInvoices(primaryRows, cfg.closedInvoiceOverrides);
  const openingBalance = openingBalanceForMonth(primaryRows, monthStartIso);

  // Invoice-tag coverage gate — never bill a customer for an invoice their own
  // remittance advice says they already paid. See debenq_open_invoices.mjs.
  const tagCoverage = analyseInvoiceTagCoverage({
    rows: primaryRows,
    openInvoices,
    headerBalance: primaryHeader,
    balanceBf: primaryBf,
    excludesAllocationDetail,
    closedOverrides: cfg.closedInvoiceOverrides,
    remittanceDocs: loadRemittanceInvoiceDocs(path.join(ROOT, 'analysis/debtors', debtorCode)),
  });
  reportTagCoverage(debtorCode, tagCoverage);
  if ((tagCoverage.gate === 'BLOCKED' || tagCoverage.gate === 'UNUSABLE_EXPORT') && !args.force) {
    console.error(
      `[${debtorCode}] ABORTED — statement not written. Resolve the invoices above, or re-run with --force if you have a recorded reason.`,
    );
    process.exitCode = 1;
    return;
  }

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

  const fmt = fmtAmount;

  const lines = [];
  lines.push('# Statement of Account', '');
  cfg.businessHeader.forEach((h, i) => {
    lines.push(i === 0 ? `**${h}**  ` : `${h}  `);
  });
  lines.push('', '---', '');
  lines.push(`**To:** ${cfg.customerName}  `);
  lines.push(`**Account:** ${debtorCode}  `);
  if (cfg.referenceValue) {
    lines.push(`**${cfg.referenceLabel}:** ${cfg.referenceValue}  `);
  }
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
  const refSuffix = cfg.referenceValue
    ? ` and quote reference **${cfg.referenceValue}**`
    : '';
  lines.push(
    '',
    '---',
    '',
    `Please remit **R${fmt(totalDue)}**${refSuffix} on payment. If payment has already been made, send proof of payment so we can allocate it promptly.`,
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
