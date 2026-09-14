#!/usr/bin/env node
/**
 * CLI orchestrator for the canonical account layer prototype.
 *
 *   node analysis/debtors/shared/scripts/build_canonical_account_views.mjs \
 *     --debtor JEN001 [--as-at YYYY-MM-DD] [--pdf]
 *
 * Runs the full pipeline for one debtor:
 *   ERP TXT + config  →  canonical account (JSON)
 *                          ├─→ Internal HTML   (full detail)
 *                          └─→ Customer HTML   (projectCustomerView only)
 *                                 └─→ Customer PDF (--pdf; same projection)
 *
 * All outputs land under analysis/debtors/[CODE]/canonical/.
 */
import { buildCanonicalAccount, writeCanonicalAccount } from './canonical_account_model.mjs';
import { writeInternalHtml } from './render_internal_account_html.mjs';
import { writeCustomerHtml } from './render_customer_account_html.mjs';
import { writeCustomerPdf } from './render_customer_account_pdf.mjs';
import { fmtAmount } from './debenq_open_invoices.mjs';

function parseArgs(argv) {
  const args = { pdf: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--debtor') args.debtor = argv[++i];
    else if (argv[i] === '--as-at') args.asAt = argv[++i];
    else if (argv[i] === '--pdf') args.pdf = true;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.debtor) {
    console.error('Usage: node build_canonical_account_views.mjs --debtor CODE [--as-at YYYY-MM-DD] [--pdf]');
    process.exitCode = 1;
    return;
  }

  const canonical = buildCanonicalAccount({ debtorCode: args.debtor, asAt: args.asAt });
  const canonicalPath = writeCanonicalAccount(canonical);
  console.log(`[${args.debtor}] Canonical account: ${canonicalPath}`);
  console.log(
    `[${args.debtor}] Balance R${fmtAmount(canonical.financialPosition.currentBalance)} · ` +
      `open invoices R${fmtAmount(canonical.openInvoices.subtotal)} (gate ${canonical.openInvoices.gate}, ` +
      `customer-safe: ${canonical.openInvoices.customerSafe}) · events ${canonical.events.length}`,
  );

  const internalPath = writeInternalHtml(canonical);
  console.log(`[${args.debtor}] Internal HTML: ${internalPath}`);

  const customerPath = writeCustomerHtml(canonical);
  console.log(`[${args.debtor}] Customer HTML: ${customerPath}`);

  if (args.pdf) {
    try {
      const { pdfPath } = writeCustomerPdf(canonical);
      console.log(`[${args.debtor}] Customer PDF: ${pdfPath}`);
    } catch (err) {
      console.error(`[${args.debtor}] PDF generation skipped: ${err.message}`);
    }
  }
}

main();
