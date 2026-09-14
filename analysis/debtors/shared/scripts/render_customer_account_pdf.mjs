#!/usr/bin/env node
/**
 * Customer PDF export — generated from the SAME projectCustomerView() output
 * the customer HTML reads, not a second hand-authored document. This is the
 * mechanism (not a policy) that stops the HTML and PDF drifting into
 * different versions of the account: both call projectCustomerView() and
 * nothing else touches canonical data on the customer side.
 *
 * Implementation choice: render to Markdown, then reuse the existing
 * `npx md-to-pdf` convention generate_statement_of_account.mjs already uses
 * (same stylesheet), rather than introducing a new PDF toolchain for this
 * prototype.
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fmtAmount, displayDate } from './debenq_open_invoices.mjs';
import { ROOT, projectCustomerView } from './canonical_account_model.mjs';

const monthName = (period) => new Date(`${period}-01T12:00:00`).toLocaleString('en-ZA', { month: 'long', year: 'numeric' });

export function renderCustomerMarkdown(canonical) {
  const v = projectCustomerView(canonical);
  const lines = [];

  lines.push('# Statement of Account', '');
  v.business.header.forEach((h, i) => lines.push(i === 0 ? `**${h}**  ` : `${h}  `));
  lines.push('', '---', '');
  lines.push(`**To:** ${v.customer.name}  `);
  lines.push(`**Account:** ${v.account.code}  `);
  if (v.customer.referenceValue) lines.push(`**${v.customer.referenceLabel}:** ${v.customer.referenceValue}  `);
  lines.push(`**Statement date:** ${displayDate(v.account.asAt)}  `);

  lines.push('', '---', '', '## Current balance', '');
  lines.push(`**R${fmtAmount(v.currentBalance)}** due as at ${displayDate(v.account.asAt)}.`, '');
  lines.push(`Movement this month: R${fmtAmount(v.movementThisMonth)}.`);

  lines.push('', '---', '', '## Account movement', '');
  lines.push('| Date | Activity | Amount (R) |');
  lines.push('| :--- | :--- | ---: |');
  for (const e of v.movement) {
    lines.push(`| ${displayDate(e.date)} | ${e.description} | ${e.amount > 0 ? '+' : ''}${fmtAmount(e.amount)} |`);
  }

  lines.push('', '---', '', '## Monthly activity', '');
  lines.push('| Period | Invoiced | Payments / Credits | Closing Balance |');
  lines.push('| :--- | ---: | ---: | ---: |');
  for (const m of v.monthlyActivity) {
    lines.push(`| ${monthName(m.period)} | ${fmtAmount(m.invoiced)} | ${fmtAmount(m.paymentsCredits)} | ${fmtAmount(m.closingBalance)} |`);
  }

  if (v.custody) {
    lines.push('', '---', '', '## Cylinders on your account', '');
    lines.push('| Type | Qty held | Deposit held (R) |');
    lines.push('| :--- | ---: | ---: |');
    for (const l of v.custody.lines) lines.push(`| ${l.label} | ${Math.abs(l.qty)} | ${fmtAmount(Math.abs(l.exposure))} |`);
    lines.push(`| **Total** | | **${fmtAmount(Math.abs(v.custody.totalCustodyExposure))}** |`);
  }

  lines.push('', '---', '', '## Open invoices', '');
  if (v.openInvoices.withheld) {
    lines.push('_Open-invoice detail for this account is currently being verified. Your balance above is accurate — contact us for a breakdown._');
  } else {
    lines.push('| Inv | Inv date | Ref | Due (R) |');
    lines.push('| :--- | :--- | :--- | ---: |');
    for (const inv of v.openInvoices.items) lines.push(`| ${inv.doc} | ${displayDate(inv.date)} | ${inv.reference} | ${fmtAmount(inv.due)} |`);
  }

  return lines.join('\n');
}

export function writeCustomerPdf(canonical, { stylesheet } = {}) {
  const outDir = path.join(ROOT, 'analysis/debtors', canonical.account.code, 'canonical');
  fs.mkdirSync(outDir, { recursive: true });
  const mdPath = path.join(outDir, `${canonical.account.code}_customer_account.md`);
  fs.writeFileSync(mdPath, renderCustomerMarkdown(canonical));

  const css = stylesheet || path.join(ROOT, 'analysis/debtors/shared/templates/statement_pdf.css');
  const res = spawnSync('npx', ['md-to-pdf', mdPath, '--stylesheet', css], { cwd: outDir, stdio: 'inherit' });
  const pdfPath = mdPath.replace(/\.md$/, '.pdf');
  if (res.status !== 0) {
    throw new Error(`md-to-pdf failed (exit ${res.status}) for ${mdPath}`);
  }
  return { mdPath, pdfPath };
}
