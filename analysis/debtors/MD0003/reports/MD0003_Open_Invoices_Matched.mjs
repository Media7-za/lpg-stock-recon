#!/usr/bin/env node
/**
 * MD0003 Open Invoices — Matching Engine Analysis
 * Uses debenq_open_invoices.mjs to identify truly open invoices
 * and generate a customer-ready projection report.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  parseDebenqWithRunning,
  computeOpenInvoices,
  analyseInvoiceTagCoverage,
  fmtAmount,
  displayDate,
  GATE_MEANING,
} from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

async function main() {
  // Parse the current DEBENQ export for MD0003
  const debenqPath = path.join(ROOT, 'analysis/debtors/MD0003/raw/Enquiry/DEBENQ_CURRENT.TXT');

  if (!fs.existsSync(debenqPath)) {
    console.error(`DEBENQ not found: ${debenqPath}`);
    process.exit(1);
  }

  const { headerBalance, rows, excludesAllocationDetail } = parseDebenqWithRunning(debenqPath);

  // Compute open invoices using the matching engine
  const openInvoices = computeOpenInvoices(rows);

  // Analyse tag coverage and gate status
  const analysis = analyseInvoiceTagCoverage({
    rows,
    openInvoices,
    headerBalance,
    excludesAllocationDetail,
  });

  // Generate markdown report
  const lines = [];
  lines.push('# MD0003 Open Invoices — Matching Engine Analysis');
  lines.push('');
  lines.push('**Account:** BLUFF MEAT SUPPLY(PTY) LTD');
  lines.push(`**Analysis Date:** ${displayDate(new Date().toISOString().split('T')[0])}`);
  lines.push(`**Source:** DEBENQ current export`);
  lines.push(`**ERP Current Balance:** R${fmtAmount(headerBalance)}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Gate Status');
  lines.push('');
  lines.push(`| Status | Value |`);
  lines.push(`| :--- | :--- |`);
  lines.push(`| **Gate** | ${analysis.gate} |`);
  lines.push(`| **Blocking Reason** | ${analysis.blocking_reason || 'None'} |`);
  lines.push('');

  if (analysis.gate !== 'ALLOWED') {
    lines.push(`**Interpretation:** ${GATE_MEANING[analysis.gate]}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Open Invoices Summary');
  lines.push('');
  lines.push('| Metric | Count | Amount (R) |');
  lines.push('| :--- | ---: | ---: |');
  lines.push(`| Clear invoices | ${analysis.counts.clear} | ${fmtAmount(analysis.sum_open_invoices)} |`);

  if (analysis.counts.likely_paid > 0) {
    lines.push(`| **Likely Paid (⚠️)** | ${analysis.counts.likely_paid} | — |`);
  }
  if (analysis.counts.stale_open > 0) {
    lines.push(`| **Stale/Marooned (⚠️)** | ${analysis.counts.stale_open} | — |`);
  }
  if (analysis.counts.unassessable > 0) {
    lines.push(`| Unassessable | ${analysis.counts.unassessable} | — |`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Open Invoices Detail');
  lines.push('');
  lines.push('| Invoice | Date | DN Reference | Amount (R) | Risk | Basis |');
  lines.push('| :--- | :--- | :--- | ---: | :--- | :--- |');

  for (const inv of analysis.invoices) {
    const riskEmoji = {
      CLEAR: '✅',
      LIKELY_PAID: '⚠️',
      STALE_OPEN: '⚠️',
      UNASSESSABLE: '❓',
    }[inv.risk] || '';

    lines.push(
      `| ${inv.doc} | ${displayDate(inv.iso)} | ${inv.dn} | ${fmtAmount(inv.due)} | ${riskEmoji} ${inv.risk} | ${inv.basis} |`
    );
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Reconciliation Check');
  lines.push('');
  lines.push('| Item | Amount (R) |');
  lines.push('| :--- | ---: |');
  lines.push(`| Sum of open invoices | ${fmtAmount(analysis.sum_open_invoices)} |`);
  lines.push(`| ERP CURRENT BALANCE | ${fmtAmount(analysis.header_balance)} |`);
  lines.push(`| **Reconciliation Gap** | **${fmtAmount(analysis.reconciliation_gap)}** |`);
  lines.push('');

  const invariantStatus =
    analysis.invariant.overstated_by > 0
      ? `❌ BREACHED (overstated by R${fmtAmount(analysis.invariant.overstated_by)})`
      : analysis.invariant.status === 'PASS'
        ? '✅ PASS'
        : '⚠️ UNVERIFIED';

  lines.push(`**Invariant:** Σ(open invoices) ≤ ERP CURRENT BALANCE — ${invariantStatus}`);
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('## Tagging Analysis');
  lines.push('');
  lines.push('| Settlement Type | Total Rows | Tagged | Coverage |');
  lines.push('| :--- | ---: | ---: | ---: |');
  lines.push(
    `| Credit Notes | ${analysis.tagging.credit_note.rows} | ${analysis.tagging.credit_note.tagged} | ${analysis.tagging.credit_note.pct || 'N/A'}% |`
  );
  lines.push(
    `| Payments | ${analysis.tagging.payment.rows} | ${analysis.tagging.payment.tagged} | ${analysis.tagging.payment.pct || 'N/A'}% |`
  );
  lines.push(
    `| **Total** | **${analysis.tagging.settlement_rows}** | **${analysis.tagging.tagged_rows}** | **${analysis.tagging.tagged_pct || 'N/A'}%** |`
  );
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push('## Evidence Basis');
  lines.push('');
  lines.push(`**Export Quality:** ${analysis.export_quality}`);
  lines.push(`**Evidence Basis:** ${analysis.evidence.basis}`);
  lines.push('');
  lines.push('**Checks Run:**');
  lines.push('');
  for (const check of analysis.evidence.checks_run) {
    lines.push(`- ${check}`);
  }
  lines.push('');

  if (analysis.evidence.note) {
    lines.push(`**Note:** ${analysis.evidence.note}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## Untagged Credits');
  lines.push('');

  if (analysis.untagged_credits.length === 0) {
    lines.push('None detected.');
  } else {
    lines.push(`Total: R${fmtAmount(analysis.untagged_credit_total)}`);
    lines.push('');
    lines.push('| Date | Type | Doc # | DN Reference | Amount (R) |');
    lines.push('| :--- | :--- | :--- | :--- | ---: |');

    for (const credit of analysis.untagged_credits) {
      lines.push(
        `| ${displayDate(credit.iso)} | ${credit.entry} | ${credit.docno} | ${credit.dn} | ${fmtAmount(credit.amount)} |`
      );
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`**Generated by:** Matching Engine (debenq_open_invoices.mjs)`);
  lines.push(`**Generated at:** ${new Date().toISOString()}`);

  // Write the report
  const reportPath = path.join(__dirname, 'MD0003_Open_Invoices_Matched.md');
  fs.writeFileSync(reportPath, lines.join('\n') + '\n');
  console.log(`✓ Report generated: ${reportPath}`);
  console.log('');
  console.log(`Gate Status: ${analysis.gate}`);
  console.log(`Open Invoices: ${analysis.counts.clear} clear`);
  console.log(`Total Amount: R${fmtAmount(analysis.sum_open_invoices)}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
