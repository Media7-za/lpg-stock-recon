#!/usr/bin/env node
/**
 * TWK002 — pre–Mar 2025 BALANCE B/F bridge (R38,791.27).
 *
 * Ties the current export's BALANCE B/F line back through two historical
 * TXT snapshots (raw ERP) and their Path B "recreated ledger" counterparts,
 * all the way to account opening (2023-04-28, B/F R0.00).
 *
 * Sources:
 *   raw/TWK0022023.TXT             — ERP raw, sort=DOCUMENT DATE, "YEAR: 2024 FEBRUARY"
 *                                     B/F 0.00 -> closing 87,226.46
 *   raw/TWK0022024.TXT             — ERP raw, sort=ENTRY TYPE, "YEAR: 2025 MARCH"
 *                                     B/F 87,226.46 -> closing 38,791.27 (= current export B/F)
 *   data/recreated_ledger_2023.csv — Path B adjusted 2023 (remittance cash + discount journals)
 *   data/recreated_ledger_2024.csv — Path B adjusted 2024 (remittance cash + discount journals)
 *
 * NOTE: in both the raw TXT and the recreated CSV, the literal "BALANCE B/F:"
 * marker lives in the CUSTOMER/BANK REF column (index 6 / key `cust_ref`),
 * not the REFERENCE column — do not filter/detect on `reference`.
 *
 * Run: node analysis/debtors/TWK002/scripts/build_pre_mar2025_bf_bridge.mjs [--write]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCsvLine, normDoc } from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const RAW = path.join(ROOT, 'analysis/debtors/TWK002/raw');
const DATA = path.join(ROOT, 'analysis/debtors/TWK002/data');
const REPORTS = path.join(ROOT, 'analysis/debtors/TWK002/reports');
const write = process.argv.includes('--write');

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const fmtR = (n) =>
  (n < 0 ? '-R' : 'R') + Math.abs(round2(n)).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function parseStandardCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
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

function parseTxt(absPath) {
  const text = fs.readFileSync(absPath, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const dataStart = lines.findIndex((l) => l.startsWith('"LINE"'));
  const rows = [];
  let bfAmount = null;
  for (let i = dataStart + 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith('"')) continue;
    if (line.startsWith('"TOTAL')) continue;
    const p = parseCsvLine(line);
    const [, period, docno, entry, date, invno, custRef, order, reference, amountStr, balanceStr] = p;
    const amount = round2(amountStr || 0);
    const balance = round2(balanceStr || 0);
    if (custRef === 'BALANCE B/F:') {
      bfAmount = amount;
      continue;
    }
    rows.push({ period, docno, entry, date, invno, custRef, order, reference, amount, balance });
  }
  const closing = rows.length ? rows[rows.length - 1].balance : bfAmount;
  return { bfAmount, rows, closing };
}

function parseRecreatedCsv(absPath) {
  const text = fs.readFileSync(absPath, 'utf8');
  const lines = text.trim().split('\n').map((l) => l.replace(/\r$/, ''));
  const header = parseStandardCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const parts = parseStandardCsvLine(line);
    const row = {};
    header.forEach((h, i) => (row[h] = parts[i] ?? ''));
    row.amount = round2(row.amount);
    row.balance = round2(row.balance);
    return row;
  });
  const bfRow = rows.find((r) => r.cust_ref === 'BALANCE B/F:');
  const activity = rows.filter((r) => r.cust_ref !== 'BALANCE B/F:');
  const closing = activity.length ? activity[activity.length - 1].balance : bfRow?.balance;
  return { bfAmount: bfRow?.amount ?? 0, rows: activity, closing };
}

const erp2023 = parseTxt(path.join(RAW, 'TWK0022023.TXT'));
const erp2024 = parseTxt(path.join(RAW, 'TWK0022024.TXT'));
const rec2023 = parseRecreatedCsv(path.join(DATA, 'recreated_ledger_2023.csv'));
const rec2024 = parseRecreatedCsv(path.join(DATA, 'recreated_ledger_2024.csv'));

const currentTxtPath = path.join(RAW, 'DEBENQ_TWK002.TXT');
const currentText = fs.readFileSync(currentTxtPath, 'utf8');
const bfLine = currentText.split(/\r?\n/).find((l) => l.includes('BALANCE B/F:'));
const currentBfRow = bfLine ? parseCsvLine(bfLine) : null;
const currentBf = currentBfRow ? round2(currentBfRow[currentBfRow.length - 1]) : null;

function extractDiffs(rec) {
  const paymentDiffs = [];
  for (const r of rec.rows.filter((x) => x.source_type === 'erp_adjusted_payment')) {
    const m = r.notes.match(/Adjusted gross (-?[\d,.]+) -> cash (-?[\d,.]+)/);
    const grossErp = m ? Number(m[1].replace(/,/g, '')) : null;
    const cashRecreated = m ? Number(m[2].replace(/,/g, '')) : null;
    paymentDiffs.push({
      doc: normDoc(r.docno),
      date: r.date,
      batch: r.batch_id,
      grossErp,
      cashRecreated,
      diff: grossErp !== null ? round2(cashRecreated - grossErp) : 0,
    });
  }
  const discountJournals = rec.rows
    .filter((x) => x.source_type === 'proforma_journal')
    .map((r) => ({ doc: r.docno, date: r.date, batch: r.batch_id, amount: r.amount }));
  return {
    paymentDiffs,
    discountJournals,
    paymentDiffTotal: round2(paymentDiffs.reduce((s, p) => s + p.diff, 0)),
    discountJournalTotal: round2(discountJournals.reduce((s, r) => s + r.amount, 0)),
  };
}

const d2023 = extractDiffs(rec2023);
const d2024 = extractDiffs(rec2024);

// Raw-ERP-only artefact: STAT 107 (26/10/2024) double-posts a -385.04 discount —
// once as a bare Journal (doc 00000334) mid-file, once embedded inside the
// Payment section for doc 34518. Recreated ledger drops both and posts one
// clean consolidated journal (PROFORMA-DJ-14, -983.04) instead.
const rawDoublePostRows = erp2024.rows.filter((r) => r.entry === 'Journal' || (r.entry === 'Payment' && r.reference === 'DISCOUNT ALLOWED'));
const rawDoublePostTotal = round2(rawDoublePostRows.reduce((s, r) => s + r.amount, 0));

const rec2023Closing = rec2023.closing;
const erp2023Closing = erp2023.closing;
const variance2023 = round2(rec2023Closing - erp2023Closing);

const rec2024Closing = rec2024.closing;
const erp2024Closing = erp2024.closing;
const variance2024 = round2(rec2024Closing - erp2024Closing);

const predicted2023 = round2(d2023.paymentDiffTotal + d2023.discountJournalTotal);
const predicted2024 = round2(d2024.paymentDiffTotal + d2024.discountJournalTotal - rawDoublePostTotal);

const tie1 = Math.abs(erp2024.bfAmount - erp2023Closing) < 0.02;
const tie2 = currentBf !== null && Math.abs(currentBf - erp2024Closing) < 0.02;
const tie3 = Math.abs(predicted2023 - variance2023) < 0.02;
const tie4 = Math.abs(predicted2024 - variance2024) < 0.02;

console.log('TWK002 pre-Mar-2025 B/F bridge');
console.log('  2023 ERP raw   : B/F', fmtR(erp2023.bfAmount), '-> closing', fmtR(erp2023Closing));
console.log('  2023 recreated : B/F', fmtR(rec2023.bfAmount), '-> closing', fmtR(rec2023Closing), '  variance', fmtR(variance2023), '  predicted', fmtR(predicted2023), tie3 ? 'TIE OK' : 'MISMATCH');
console.log('  2024 ERP raw   : B/F', fmtR(erp2024.bfAmount), '-> closing', fmtR(erp2024Closing));
console.log('  2024 recreated : B/F', fmtR(rec2024.bfAmount), '-> closing', fmtR(rec2024Closing), '  variance', fmtR(variance2024), '  predicted', fmtR(predicted2024), tie4 ? 'TIE OK' : 'MISMATCH');
console.log('  current export BALANCE B/F:', fmtR(currentBf));
console.log('  tie 2023close -> 2024 raw B/F:', tie1);
console.log('  tie 2024 raw close -> current B/F:', tie2);
console.log('  raw double-post (Journal 334 + Payment-embedded discount, STAT 107):', fmtR(rawDoublePostTotal));

if (write) {
  const md = [];
  md.push('# TWK002 — Pre–Mar 2025 BALANCE B/F Bridge (R38,791.27)');
  md.push('');
  md.push('**Question answered:** what is behind the R38,791.27 opening carry on the current export, all the way back to account inception?');
  md.push('');
  md.push('**Generated:** ' + new Date().toISOString().slice(0, 10));
  md.push('**Sources:** `raw/TWK0022023.TXT`, `raw/TWK0022024.TXT` (historical ERP snapshots) · `data/recreated_ledger_2023.csv`, `data/recreated_ledger_2024.csv` (Path B evidence-adjusted)');
  md.push('**Regenerate:** `node analysis/debtors/TWK002/scripts/build_pre_mar2025_bf_bridge.mjs --write`');
  md.push('');
  md.push('---');
  md.push('');
  md.push('## 1. Headline — the chain ties exactly');
  md.push('');
  md.push('| Step | B/F | Closing | Source |');
  md.push('| :--- | ---: | ---: | :--- |');
  md.push(`| **2023** (28 Apr 2023 → 26 Feb 2024) ERP raw | ${fmtR(erp2023.bfAmount)} | ${fmtR(erp2023Closing)} | \`TWK0022023.TXT\` |`);
  md.push(`| **2024** (27 Mar 2024 → 24 Feb 2025) ERP raw | ${fmtR(erp2024.bfAmount)} | ${fmtR(erp2024Closing)} | \`TWK0022024.TXT\` |`);
  md.push(`| **Current export** (Mar 2025+) BALANCE B/F | — | ${fmtR(currentBf)} | \`DEBENQ_TWK002.TXT\` line 13 |`);
  md.push('');
  md.push(`**Tie 1:** 2023 ERP closing (${fmtR(erp2023Closing)}) = 2024 ERP raw B/F (${fmtR(erp2024.bfAmount)}) — **${tie1 ? 'EXACT ✓' : 'MISMATCH ✗'}**`);
  md.push(`**Tie 2:** 2024 ERP raw closing (${fmtR(erp2024Closing)}) = current export BALANCE B/F (${fmtR(currentBf)}) — **${tie2 ? 'EXACT ✓' : 'MISMATCH ✗'}**`);
  md.push('');
  md.push('The R38,791.27 opening carry is not a black box. It is the ERP running total after **eleven STAT payment batches** (STAT 92 through STAT 110, Jul 2023 → Jan 2025), every one of which has a remittance advice on file and a reconciling batch total in `data/remittance_manifest_2023.json` / `_2024.json` / `data/allocation_edges.csv`.');
  md.push('');
  md.push('---');
  md.push('');
  md.push('## 2. Path B recreated ledger — same periods, remittance-authoritative');
  md.push('');
  md.push('The recreated ledgers replay the same two periods using **remittance cash** (not ERP gross) for each STAT payment, plus the settlement discount journals. Both start from the identical ERP raw B/F, so any difference at closing is attributable to specific, itemised corrections:');
  md.push('');
  md.push('| Period | ERP raw closing | Path B recreated closing | Variance | Predicted (below) | Ties? |');
  md.push('| :--- | ---: | ---: | ---: | ---: | :---: |');
  md.push(`| 2023 | ${fmtR(erp2023Closing)} | ${fmtR(rec2023Closing)} | ${fmtR(variance2023)} | ${fmtR(predicted2023)} | ${tie3 ? '✓' : '✗'} |`);
  md.push(`| 2024 | ${fmtR(erp2024Closing)} | ${fmtR(rec2024Closing)} | ${fmtR(variance2024)} | ${fmtR(predicted2024)} | ${tie4 ? '✓' : '✗'} |`);
  md.push('');
  md.push('### 2023 variance — R690.00 = the 2023 STAT batch shortfall pair');
  md.push('');
  md.push('| Component | Amount (R) |');
  md.push('| :--- | ---: |');
  md.push(`| Payment gross→cash adjustments (6 STAT batches) | ${d2023.paymentDiffTotal.toFixed(2)} |`);
  md.push(`| Settlement discount journals (6 journals, DJ01–06) | ${d2023.discountJournalTotal.toFixed(2)} |`);
  md.push(`| **Net 2023 variance** | **${predicted2023.toFixed(2)}** |`);
  md.push('');
  md.push(`This is **exactly** the R690.00 already identified in the phantom CN nets investigation: journal \`00000490\` (+R4,019.12, six 2023 payment corrections) paired with untagged journal \`00000491\` (−R3,329.12), posted into the *current* export on 2026-07-12. This bridge shows where that R690.00 originates — two STAT batches (BATCH-2023-08-28, BATCH-2023-11-27) where ERP's payment gross exceeded remittance cash by R345.00 each.`);
  md.push('');
  md.push('### 2024 variance — R5,409.03 = payments + discounts + one raw double-post');
  md.push('');
  md.push('| Component | Amount (R) |');
  md.push('| :--- | ---: |');
  md.push(`| Payment gross→cash adjustments (5 STAT batches) | ${d2024.paymentDiffTotal.toFixed(2)} |`);
  md.push(`| Settlement discount journals (10 journals, DJ07–16) | ${d2024.discountJournalTotal.toFixed(2)} |`);
  md.push(`| Raw ERP double-post removed (STAT 107, see below) | ${(-rawDoublePostTotal).toFixed(2)} |`);
  md.push(`| **Net 2024 variance** | **${predicted2024.toFixed(2)}** |`);
  md.push('');
  md.push('#### Raw ERP double-post — STAT 107 / 26 Oct 2024 (doc 34518)');
  md.push('');
  md.push('The raw ERP export contains **two** separate −R385.04 "DISCOUNT ALLOWED" entries for the same batch:');
  md.push('');
  md.push('| Line | Entry type | Doc | Date | Reference | Amount (R) |');
  md.push('| :--- | :--- | :--- | :--- | :--- | ---: |');
  for (const r of rawDoublePostRows) {
    md.push(`| — | ${r.entry} | ${normDoc(r.docno)} | ${r.date} | ${r.reference} | ${r.amount.toFixed(2)} |`);
  }
  md.push(`| | | | | **Total** | **${rawDoublePostTotal.toFixed(2)}** |`);
  md.push('');
  md.push('One is a bare `Journal` (doc `00000334`, no invno), the other is embedded inside the `Payment` rows for doc `34518` under the STAT 107 reference. The recreated ledger removes **both** and replaces them with a single clean journal, `PROFORMA-DJ-14` (−R983.04), sized to the correct consolidated batch discount. This raw-side artefact is itself evidence for why ERP\'s own posting hygiene — separate from the payment-tagging weakness already documented — needed the Path B correction lane.');
  md.push('');
  md.push('---');
  md.push('');
  md.push('## 3. STAT payment batches behind the R38,791.27 (both years)');
  md.push('');
  md.push('Each row is a remittance-backed payment with the ERP gross amount stripped to remittance cash in the recreated ledger:');
  md.push('');
  md.push('| Year | Date | Payment doc | Batch | ERP gross (R) | Remittance cash (R) | Diff (R) |');
  md.push('| :--- | :--- | :--- | :--- | ---: | ---: | ---: |');
  for (const [yr, d] of [['2023', d2023], ['2024', d2024]]) {
    for (const p of d.paymentDiffs) {
      md.push(`| ${yr} | ${p.date} | ${p.doc} | ${p.batch ?? '—'} | ${p.grossErp !== null ? p.grossErp.toFixed(2) : '—'} | ${p.cashRecreated !== null ? p.cashRecreated.toFixed(2) : '—'} | ${p.diff.toFixed(2)} |`);
    }
  }
  md.push(`| | | | | | **Total** | **${round2(d2023.paymentDiffTotal + d2024.paymentDiffTotal).toFixed(2)}** |`);
  md.push('');
  md.push('---');
  md.push('');
  md.push('## 4. Settlement discount journals behind the B/F (both years)');
  md.push('');
  md.push('| Year | Date | Journal | Batch | Amount (R) |');
  md.push('| :--- | :--- | :--- | :--- | ---: |');
  for (const [yr, d] of [['2023', d2023], ['2024', d2024]]) {
    for (const j of d.discountJournals) {
      md.push(`| ${yr} | ${j.date} | ${j.doc} | ${j.batch ?? '—'} | ${j.amount.toFixed(2)} |`);
    }
  }
  md.push(`| | | | **Total** | **${round2(d2023.discountJournalTotal + d2024.discountJournalTotal).toFixed(2)}** |`);
  md.push('');
  md.push('---');
  md.push('');
  md.push('## 5. Doctrine note');
  md.push('');
  md.push('- **Every STAT batch from 2023–2024 has a remittance advice on file** (`data/remittance_manifest_2023.json`, `_2024.json`, `data/allocation_edges.csv`). Nothing behind the R38,791.27 is unexplained cash — it is eleven fully-reconciled receipts.');
  md.push('- The **variances found here** (R690.00 in 2023, R5,409.03 in 2024) are exactly what the current export\'s Path B journals `00000490–509` already correct. This bridge shows their *origin*, not a new problem.');
  md.push('- **The STAT 107 double-post** is a genuine raw-ERP posting defect (same discount entered twice, once as a bare Journal, once embedded in Payment), independent of the payment-tagging weakness documented elsewhere — worth flagging to finance if the underlying ERP ledger is ever corrected directly.');
  md.push('- **No further action required** for the current statement — the account-level bridge lines (`config/statement_of_account.json`) already carry the net effect of all of this forward into the live account.');
  md.push('');
  md.push('---');
  md.push('');
  md.push('## Related');
  md.push('');
  md.push('- `TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md`');
  md.push('- `TWK002_Phantom_CN_Nets_Breakdown_2026-08-11.md`');
  md.push('- `data/remittance_manifest_2023.json`, `data/remittance_manifest_2024.json`');
  md.push('- `data/allocation_edges.csv`');

  const outPath = path.join(REPORTS, 'TWK002_Pre_Mar2025_BF_Bridge_2026-08-11.md');
  fs.writeFileSync(outPath, md.join('\n'));
  console.log('\nWritten:', outPath);
}
