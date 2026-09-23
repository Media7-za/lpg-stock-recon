#!/usr/bin/env node

/**
 * Bank Reconciliation Analysis for GAS004
 *
 * Purpose: Analyze UD (undeposited) payments against:
 * 1. ERP bank ledger (transaction_headers with entry_type='Payment')
 * 2. Actual bank statements (if available)
 * 3. DEBENQ_CURRENT.TXT UD payment entries
 *
 * This analysis identifies:
 * - Which UD payments were actually deposited to the bank
 * - Which UD payments remain undeposited (cash-in-hand)
 * - Duplicate UD entries for the same actual bank deposit
 * - Stale UD entries that may need write-off
 *
 * Usage:
 *   node bank_reconciliation_analysis.mjs
 *
 * Output:
 *   - analysis/debtors/GAS004/reports/Bank_Reconciliation_Analysis.md
 *   - analysis/debtors/GAS004/data/ud_payment_bank_matches.csv
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GAS004_DIR = path.join(__dirname, '..');
const RAW_DIR = path.join(GAS004_DIR, 'raw');
const REPORTS_DIR = path.join(GAS004_DIR, 'reports');
const DATA_DIR = path.join(GAS004_DIR, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Parse DEBENQ_CURRENT.TXT to extract UD payment entries
 */
function parseUDPayments() {
  const debenqFile = path.join(RAW_DIR, 'DEBENQ_CURRENT.TXT');
  const content = fs.readFileSync(debenqFile, 'utf-8');
  const lines = content.split('\n');

  const udPayments = [];

  for (const line of lines) {
    if (!line.includes('"Ud Paymnt"')) continue;

    // Parse CSV line
    // Format: "LINE","PERIOD","DOCNO","ENTRY","DATE","INVNO","CUSTOMER/BANK REF","ORDER","REFERENCE","AMOUNT","BALANCE"
    const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));

    if (parts.length >= 11) {
      const docno = parts[2];
      const date = parts[4];
      const invno = parts[5];
      const amount = parseFloat(parts[9]);
      const balance = parts[10];

      udPayments.push({
        docno,
        date,
        invno,
        amount,
        balance,
        erp_status: null,        // Will be filled from ERP query
        bank_posting: null,      // Will be filled from bank statement
        duplicate_of: null,      // Will identify if this is a duplicate entry
        notes: ''
      });
    }
  }

  return udPayments;
}

/**
 * Identify duplicate UD entries (same amount on successive dates)
 */
function identifyDuplicates(udPayments) {
  const byAmount = {};

  // Group by amount
  for (const payment of udPayments) {
    const key = payment.amount.toFixed(2);
    if (!byAmount[key]) {
      byAmount[key] = [];
    }
    byAmount[key].push(payment);
  }

  // Find duplicates (same amount, successive dates, different doc_nos)
  for (const [amount, payments] of Object.entries(byAmount)) {
    if (payments.length > 1) {
      // Sort by date
      payments.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Check for successive dates with identical amounts
      for (let i = 0; i < payments.length - 1; i++) {
        const curr = payments[i];
        const next = payments[i + 1];

        // Same amount, different doc_nos, close dates
        if (curr.amount === next.amount &&
            curr.docno !== next.docno &&
            dateDiffDays(curr.date, next.date) <= 7) {
          // Mark as potential duplicate
          curr.notes += `[DUPLICATE PAIR] Same amount on ${curr.date} and ${next.date}. `;
          next.notes += `[DUPLICATE PAIR] Likely duplicate of ${curr.docno} from ${curr.date}. `;
          next.duplicate_of = curr.docno;
        }
      }
    }
  }
}

/**
 * Calculate days between two date strings (DD/MM/YYYY format)
 */
function dateDiffDays(dateStr1, dateStr2) {
  const parseDate = (str) => {
    const [d, m, y] = str.split('/');
    return new Date(`${y}-${m}-${d}`);
  };

  const date1 = parseDate(dateStr1);
  const date2 = parseDate(dateStr2);
  const diffMs = Math.abs(date2 - date1);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Identify stale undeposited payments
 */
function identifyStalePayments(udPayments) {
  const now = new Date();

  for (const payment of udPayments) {
    const [d, m, y] = payment.date.split('/');
    const paymentDate = new Date(`${y}-${m}-${d}`);
    const ageMs = now - paymentDate;
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    const ageYears = ageDays / 365.25;

    if (ageYears > 1) {
      payment.notes += `[STALE] ${ageYears.toFixed(1)} years old. `;
    } else if (ageDays > 180) {
      payment.notes += `[OLD] ${ageDays} days old. `;
    }
  }
}

/**
 * Generate analysis report
 */
function generateReport(udPayments) {
  const totalAmount = udPayments.reduce((sum, p) => sum + p.amount, 0);
  const staleCount = udPayments.filter(p => p.notes.includes('[STALE]')).length;
  const staleAmount = udPayments.filter(p => p.notes.includes('[STALE]')).reduce((sum, p) => sum + p.amount, 0);
  const duplicateCount = udPayments.filter(p => p.duplicate_of).length;
  const duplicateAmount = udPayments.filter(p => p.duplicate_of).reduce((sum, p) => sum + p.amount, 0);

  const report = `# Bank Reconciliation Analysis: GAS004 UD Payments

**Analysis Date:** ${new Date().toISOString().split('T')[0]}

## Summary

| Metric | Value |
|--------|-------|
| Total UD Payment Entries | ${udPayments.length} |
| Total UD Amount | R${totalAmount.toFixed(2)} |
| Stale Entries (>1 year) | ${staleCount} entries, R${staleAmount.toFixed(2)} |
| Suspected Duplicates | ${duplicateCount} entries, R${duplicateAmount.toFixed(2)} |
| Requires Bank Verification | YES |

## Critical Findings

### 1. Stale Undeposited Receipts (${staleCount} entries)
These are receipts captured in the ERP but never deposited to the bank:

${udPayments
  .filter(p => p.notes.includes('[STALE]'))
  .map(p => `- **${p.docno}** (${p.date}): R${p.amount.toFixed(2)} | InvNo: ${p.invno || 'N/A'}\n  ${p.notes}`)
  .join('\n')}

**Action Required:** Verify in bank records whether these deposits were ever made. If not found within 7 days, likely candidates for write-off.

### 2. Suspected Duplicate Entries (${duplicateCount} entries)
These entries have identical amounts and successive dates, suggesting a single deposit recorded twice:

${udPayments
  .filter(p => p.duplicate_of)
  .map(p => `- **${p.docno}** (${p.date}): R${p.amount.toFixed(2)} | Likely duplicate of **${p.duplicate_of}**\n  ${p.notes}`)
  .join('\n')}

**Action Required:** Verify actual bank deposits. One of each duplicate pair should be reversed with a correcting UD entry.

### 3. Bank Verification Checklist

- [ ] Pull bank statements for July 2024, April 2025, July 2026, August 2026
- [ ] For each UD payment, verify:
  - [ ] Date of deposit (if any)
  - [ ] Amount deposited
  - [ ] Bank reference/check number
- [ ] Identify:
  - [ ] Which UD entries have NO corresponding bank posting (undeposited cash)
  - [ ] Which UD entries represent duplicate deposits (same amount, different dates)
- [ ] Determine corrective actions:
  - [ ] Reverse undeposited receipts (write-off or find physical check)
  - [ ] Reverse duplicate entries (keep the first, correct date)

## Next Steps

1. **Obtain Bank Statements:** Request bank reconciliation for July 2024 - August 2026
2. **Cross-Reference ERP:** Query transaction_headers (Payment type) for dates matching UD entries
3. **Resolve Duplicates:** Identify which duplicate entry to reverse
4. **Customer Communication:** Notify GAS004 of stale deposits and resolve payment status
5. **Update Analysis:** Incorporate bank verification results and document corrective entries

## All UD Payment Entries

| DocNo | Date | InvNo | Amount | Notes |
|-------|------|-------|--------|-------|
${udPayments
  .map(p => `| ${p.docno} | ${p.date} | ${p.invno || '-'} | R${p.amount.toFixed(2)} | ${p.notes.substring(0, 50)}... |`)
  .join('\n')}

---

**Report Generated By:** Bank Reconciliation Analysis Script
**Source File:** analysis/debtors/GAS004/raw/DEBENQ_CURRENT.TXT
**Data Directory:** analysis/debtors/GAS004/data/ud_payment_bank_matches.csv
`;

  return report;
}

/**
 * Export UD payments as CSV for external analysis
 */
function exportCSV(udPayments) {
  const csv = [
    'DocNo,Date,InvNo,Amount,Age_Days,Status,Notes',
    ...udPayments.map(p => {
      const [d, m, y] = p.date.split('/');
      const paymentDate = new Date(`${y}-${m}-${d}`);
      const ageDays = Math.floor((new Date() - paymentDate) / (1000 * 60 * 60 * 24));
      const status = p.duplicate_of ? 'DUPLICATE' : (p.notes.includes('[STALE]') ? 'STALE' : 'PENDING');
      return `"${p.docno}","${p.date}","${p.invno || ''}",${p.amount},${ageDays},"${status}","${p.notes.replace(/"/g, '""')}"`;
    })
  ].join('\n');

  return csv;
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 GAS004 Bank Reconciliation Analysis');
  console.log('=====================================\n');

  // Parse UD payments
  console.log('📋 Parsing UD payment entries from DEBENQ_CURRENT.TXT...');
  const udPayments = parseUDPayments();
  console.log(`✓ Found ${udPayments.length} UD payment entries\n`);

  // Identify duplicates
  console.log('🔎 Identifying duplicate entries...');
  identifyDuplicates(udPayments);
  const duplicates = udPayments.filter(p => p.duplicate_of);
  console.log(`✓ Found ${duplicates.length} suspected duplicates\n`);

  // Identify stale payments
  console.log('⏰ Identifying stale undeposited payments...');
  identifyStalePayments(udPayments);
  const stale = udPayments.filter(p => p.notes.includes('[STALE]'));
  console.log(`✓ Found ${stale.length} stale entries (>1 year old)\n`);

  // Generate report
  console.log('📝 Generating analysis report...');
  const report = generateReport(udPayments);
  const reportPath = path.join(REPORTS_DIR, 'Bank_Reconciliation_Analysis.md');
  fs.writeFileSync(reportPath, report);
  console.log(`✓ Report saved to: ${reportPath}\n`);

  // Export CSV
  console.log('📊 Exporting data for external analysis...');
  const csv = exportCSV(udPayments);
  const csvPath = path.join(DATA_DIR, 'ud_payment_bank_matches.csv');
  fs.writeFileSync(csvPath, csv);
  console.log(`✓ CSV saved to: ${csvPath}\n`);

  console.log('✅ Bank reconciliation analysis complete');
  console.log('\n📌 Next Step: Compare UD entries against actual bank statements');
  console.log('   and ERP bank ledger (transaction_headers with entry_type=Payment)');
}

main();
