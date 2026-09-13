#!/usr/bin/env node
/**
 * Generate a Statement of Account from committed DTRX header + item CSVs.
 * No DEBENQ TXT required. Balance is ASSERTED (header-sum), not PROVEN.
 *
 *   node analysis/debtors/shared/scripts/generate_dtrx_header_statement.mjs \
 *     --debtor JAY000 [--as-at YYYY-MM-DD] [--pdf]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import {
  parseObjectCsv,
  generateFromEvidence,
} from './dtrx_header_statement.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

function parseArgs(argv) {
  const args = { asAt: null, pdf: false, debtor: null };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--as-at') args.asAt = argv[++i];
    else if (argv[i] === '--pdf') args.pdf = true;
    else if (argv[i] === '--debtor') args.debtor = argv[++i];
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const debtorCode = (args.debtor || '').toUpperCase();
  if (!debtorCode) {
    console.error('Usage: generate_dtrx_header_statement.mjs --debtor CODE [--as-at YYYY-MM-DD] [--pdf]');
    process.exit(1);
  }
  const cfgPath = path.join(ROOT, 'analysis/debtors', debtorCode, 'config/statement_of_account.json');
  if (!fs.existsSync(cfgPath)) {
    console.error(`Missing config: ${cfgPath}`);
    process.exit(1);
  }
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  if ((cfg.sourceKind || cfg.primarySource) !== 'dtrx_headers') {
    console.error(
      `[${debtorCode}] This generator is for sourceKind: dtrx_headers. Config has ${cfg.sourceKind || cfg.primarySource || 'unset'}.`,
    );
    process.exit(1);
  }
  const headersAbs = path.join(ROOT, cfg.headersCsv);
  const itemsAbs = path.join(ROOT, cfg.itemsCsv);
  const headers = parseObjectCsv(headersAbs);
  const items = parseObjectCsv(itemsAbs);
  const asAtIso = args.asAt || new Date().toISOString().slice(0, 10);

  const out = generateFromEvidence({ headers, items, cfg, asAtIso });

  const outDir = path.join(ROOT, cfg.outputDir);
  fs.mkdirSync(outDir, { recursive: true });
  const mdPath = path.join(outDir, `${cfg.outputBaseName}.md`);
  const ledgerPath = path.join(outDir, `${debtorCode}_DTRX_Header_Ledger.md`);
  const txtPath = path.join(ROOT, cfg.reconstructedTxt || `analysis/debtors/${debtorCode}/raw/DTRX_RECONSTRUCTED_${debtorCode}.TXT`);
  fs.mkdirSync(path.dirname(txtPath), { recursive: true });

  fs.writeFileSync(mdPath, `${out.statementMd}\n`);
  fs.writeFileSync(ledgerPath, `${out.ledgerMd}\n`);
  fs.writeFileSync(txtPath, out.reconstructedTxt);

  const derived = {
    debtorCode,
    asAtIso,
    sourceKind: 'dtrx_headers',
    reconstructedBalance: out.reconstructedBalance,
    openInvoices: out.openInvoices.map((i) => ({
      doc: (i.cleanDoc || i.key),
      iso: i.iso,
      dn: i.dn,
      due: i.due,
    })),
    tagGate: out.tagCoverage.gate,
    tagBasis: out.tagCoverage.evidence?.basis,
    itemTie: out.itemTie,
    itemHeaderVariance: out.itemHeaderVariance,
    anomalies: out.anomalies,
    lpgNet: out.itemSummary.lpgNet,
    cylNet: out.itemSummary.cylNet,
    epistemic: 'ASSERTED',
    notProvenBecause: 'No DEBENQ CURRENT BALANCE — reconstructed from DTRX headers only',
  };
  const derivedPath = path.join(ROOT, 'analysis/debtors', debtorCode, 'data/dtrx_header_statement.json');
  fs.writeFileSync(derivedPath, `${JSON.stringify(derived, null, 2)}\n`);

  console.log(`[${debtorCode}] DTRX-header statement: ${mdPath}`);
  console.log(`[${debtorCode}] Ledger: ${ledgerPath}`);
  console.log(`[${debtorCode}] Reconstructed TXT (audit, not DEBENQ): ${txtPath}`);
  console.log(`[${debtorCode}] Reconstructed total: R${out.reconstructedBalance.toFixed(2)} ASSERTED`);
  console.log(`[${debtorCode}] Open invoices: ${out.openInvoices.length} · gate ${out.tagCoverage.gate}`);
  console.log(`[${debtorCode}] Item vs header variance: R${out.itemHeaderVariance.toFixed(2)}`);
  if (out.anomalies.length) {
    console.warn(`[${debtorCode}] ${out.anomalies.length} tagging anomal${out.anomalies.length === 1 ? 'y' : 'ies'} — see statement`);
  }

  if (args.pdf) {
    const stylesheet = path.join(ROOT, cfg.pdfStylesheet);
    const res = spawnSync('npx', ['md-to-pdf', mdPath, '--stylesheet', stylesheet], {
      cwd: outDir,
      stdio: 'inherit',
    });
    if (res.status !== 0) {
      console.error(`[${debtorCode}] PDF generation failed (exit ${res.status})`);
      process.exitCode = 1;
    } else {
      console.log(`[${debtorCode}] PDF written: ${mdPath.replace(/\.md$/, '.pdf')}`);
    }
  }
}

main();
