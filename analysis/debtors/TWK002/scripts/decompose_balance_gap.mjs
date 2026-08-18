/**
 * Decompose TWK002 header balance minus sum(open invoices) into named components.
 * Run: node analysis/debtors/TWK002/scripts/decompose_balance_gap.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parseDebenqWithRunning,
  computeOpenInvoices,
  findUntaggedCredits,
  round2,
  normDoc,
  PAYMENT_TYPES,
  parseCsvLine,
  fmtAmount,
} from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const txtPath = path.join(ROOT, 'analysis/debtors/TWK002/raw/DEBENQ_TWK002.TXT');
const cfgPath = path.join(ROOT, 'analysis/debtors/TWK002/config/statement_of_account.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

const { headerBalance, balanceBf, rows } = parseDebenqWithRunning(txtPath);
const open = computeOpenInvoices(rows, cfg.closedInvoiceOverrides || []);
const sumOpen = round2(open.reduce((s, i) => s + i.due, 0));
const gap = round2(headerBalance - sumOpen);
const openDocs = new Set(open.map((i) => i.doc));

// Per-invoice ledger
const invNet = new Map();
for (const r of rows) {
  if (r.entry === 'Invoice') {
    const d = normDoc(r.cleanDoc);
    if (!invNet.has(d)) invNet.set(d, { gross: 0, tagged: 0, net: 0, iso: r.iso, dn: r.dn });
    const o = invNet.get(d);
    o.gross = round2(o.gross + r.amount);
    o.net = round2(o.net + r.amount);
    o.iso = r.iso;
    o.dn = r.dn;
  } else if (r.invno && (r.entry === 'Crd Note' || PAYMENT_TYPES.has(r.entry))) {
    const d = normDoc(r.invno);
    if (!invNet.has(d)) invNet.set(d, { gross: 0, tagged: 0, net: 0, iso: '', dn: '' });
    const o = invNet.get(d);
    o.tagged = round2(o.tagged + r.amount);
    o.net = round2(o.net + r.amount);
  }
}

// Untagged rows with full TXT fields
const untaggedRows = [];
for (const line of fs.readFileSync(txtPath, 'utf8').split('\n')) {
  if (!line.trim() || line.includes('BALANCE B/F') || line.includes('CURRENT BALANCE')) continue;
  const p = parseCsvLine(line);
  if (p.length < 10) continue;
  const entry = p[3];
  const invno = normDoc(p[6] || '');
  const amount = Number(p[9]);
  if (!(entry === 'Crd Note' || PAYMENT_TYPES.has(entry)) || invno) continue;
  untaggedRows.push({
    date: p[4],
    entry,
    doc: p[2],
    ref: p[7] || '',
    amount,
  });
}

// Invoices with positive raw net not on open list
const excludedPositive = [];
for (const [doc, o] of invNet) {
  if (o.net > 0.005 && !openDocs.has(doc)) {
    const ov = (cfg.closedInvoiceOverrides || []).find((x) => normDoc(x.doc) === doc);
    excludedPositive.push({ doc, ...o, override: !!ov });
  }
}

// Sum of positive nets (all invoices)
const sumPosNet = round2([...invNet.values()].filter((o) => o.net > 0.005).reduce((s, o) => s + o.net, 0));

// Partial credits on OPEN invoices (CN tagged but list shows reduced due = same as raw net in computeOpenInvoices)
// Invoices where gross + tagged != due on open list - should match
const openDetail = open.map((i) => {
  const o = invNet.get(i.doc);
  return {
    doc: i.doc,
    iso: i.iso,
    due: i.due,
    gross: o?.gross ?? 0,
    tagged: o?.tagged ?? 0,
    rawNet: o?.net ?? 0,
  };
});

// B/F bridge: balance = B/F + period activity
const periodActivity = round2(headerBalance - balanceBf);

// Invoices raised in period (gross)
const periodInvGross = round2(rows.filter((r) => r.entry === 'Invoice').reduce((s, r) => s + r.amount, 0));
const allCredits = round2(
  rows
    .filter((r) => r.entry === 'Crd Note' || PAYMENT_TYPES.has(r.entry))
    .reduce((s, r) => s + r.amount, 0),
);
const taggedCreditTotal = round2(
  rows
    .filter((r) => (r.entry === 'Crd Note' || PAYMENT_TYPES.has(r.entry)) && r.invno)
    .reduce((s, r) => s + r.amount, 0),
);
const untaggedTotal = round2(untaggedRows.reduce((s, r) => s + r.amount, 0));

// Account residual identity:
// gap = header - sumOpen
// Also: sumPosNet - sumOpen = amount "removed" from open list (overrides + closed positive nets)
const removedFromOpenList = round2(sumPosNet - sumOpen);

// Effect of untagged credits on the relationship between sumPosNet and header:
// header = balanceBf + periodInvGross + allCredits
// sumPosNet counts positive invoice nets AFTER tagged credits only
// Untagged credits don't reduce sumPosNet but DO reduce header
// So: sumPosNet - header ≈ -untaggedTotal + (closed invoice nets that zeroed) + ...

const headerVsPosNet = round2(sumPosNet - headerBalance);

console.log('# TWK002 — balance gap decomposition\n');
console.log('## Headline\n');
console.log(`| Measure | R |`);
console.log(`| :--- | ---: |`);
console.log(`| ERP CURRENT BALANCE (TWK002) | ${fmtAmount(headerBalance)} |`);
console.log(`| Σ open invoice Due (11 lines) | ${fmtAmount(sumOpen)} |`);
console.log(`| **Unallocated balance** | **${fmtAmount(gap)}** |`);
console.log(`| TWK003 site adjustment (in Balance due, not here) | -300.00 |`);
console.log(`| **Statement recon adjustment (120-day bucket)** | **${fmtAmount(round2(gap - 300))}** |`);
console.log('');

console.log('## Ledger identity\n');
console.log(`| Component | R |`);
console.log(`| :--- | ---: |`);
console.log(`| BALANCE B/F (pre-export window) | ${fmtAmount(balanceBf)} |`);
console.log(`| + Invoices raised in export | ${fmtAmount(periodInvGross)} |`);
console.log(`| + Credits/payments/journals (all) | ${fmtAmount(allCredits)} |`);
console.log(`| = CURRENT BALANCE | ${fmtAmount(headerBalance)} |`);
console.log('');

console.log('## Why header ≠ Σ open invoices\n');
console.log('Three separate mechanisms stack:\n');

console.log('### A — Untagged settlement (R' + fmtAmount(Math.abs(untaggedTotal)) + ' credits, 17 rows)\n');
console.log('These reduce the **account balance** but do not reduce any invoice line on the open list, because ERP posted them with a blank `INVNO`. The customer paid; the money left the balance; the invoices they settled may still show partial or full open due on other lines.\n');
console.log('| Date | Entry | Doc | Ref | Amount (R) |');
console.log('| :--- | :--- | :--- | :--- | ---: |');
for (const r of untaggedRows) {
  console.log(`| ${r.date} | ${r.entry} | ${r.doc} | ${r.ref} | ${fmtAmount(r.amount)} |`);
}
console.log(`| **Total** | | | | **${fmtAmount(untaggedTotal)}** |`);
console.log('');

// Group untagged by known batches
const pathB = untaggedRows.filter((r) => r.entry === 'Journal' && r.date.startsWith('2026-08-09'));
const pathBOther = untaggedRows.filter((r) => r.entry === 'Journal' && !r.date.startsWith('2026-08-09'));
const payments = untaggedRows.filter((r) => r.entry === 'Payment');
console.log('Known buckets:\n');
console.log(`- **STAT payments (untagged):** ${payments.map((p) => `${p.date} doc ${p.doc} ${fmtAmount(p.amount)}`).join('; ')}`);
console.log(`- **Path B discount journals (2026-08-09):** ${fmtAmount(pathB.reduce((s, r) => s + r.amount, 0))} (${pathB.map((p) => p.doc).join(', ')})`);
console.log(`- **Other untagged journals (Jul 2026):** ${fmtAmount(pathBOther.reduce((s, r) => s + r.amount, 0))} (14 rows — likely CYL deposit / empty-return postings)`);
console.log('');

console.log('### B — Positive invoice nets excluded from open list (overrides + ERP-closed)\n');
console.log(`Σ positive invoice nets (ERP tagging model): **R${fmtAmount(sumPosNet)}**`);
console.log(`Σ open list (after overrides): **R${fmtAmount(sumOpen)}**`);
console.log(`Removed from open list: **R${fmtAmount(removedFromOpenList)}**\n`);
if (excludedPositive.length) {
  console.log('| Inv | Date | Gross | Tagged credits | Net | Why excluded |');
  console.log('| :--- | :--- | ---: | ---: | ---: | :--- |');
  for (const x of excludedPositive.sort((a, b) => a.doc.localeCompare(b.doc))) {
    console.log(
      `| ${x.doc} | ${x.iso} | ${fmtAmount(x.gross)} | ${fmtAmount(x.tagged)} | ${fmtAmount(x.net)} | ${x.override ? 'closedInvoiceOverride' : 'positive net, not on list'} |`,
    );
  }
  console.log('');
}

console.log('### C — Arithmetic bridge to the R' + fmtAmount(gap) + ' gap\n');
console.log('```');
console.log(`Σ positive invoice nets (ERP)     ${fmtAmount(sumPosNet)}`);
console.log(`  minus Σ open invoice Due          ${fmtAmount(-sumOpen)}  (= removed from list: overrides)`);
console.log(`  =                                 ${fmtAmount(removedFromOpenList)}`);
console.log('');
console.log(`ERP CURRENT BALANCE               ${fmtAmount(headerBalance)}`);
console.log(`Σ positive invoice nets             ${fmtAmount(sumPosNet)}`);
console.log(`  difference (header lower)         ${fmtAmount(headerVsPosNet)}  ← untagged credits net effect + closed-zero nets`);
console.log('');
console.log(`Untagged credits total              ${fmtAmount(untaggedTotal)}`);
console.log(`Header − Σ open (THE GAP)           ${fmtAmount(gap)}`);
console.log('```\n');

// Try to allocate gap into named lines
// gap = header - sumOpen
// = (balanceBf + periodInvGross + allCredits) - sumOpen
// The B/F 38791 is "old debt" - open list invoices are only 110k from recent invoices
// Old debt portion in gap ≈ gap minus identifiable current-period unallocated items?

// Sum open invoice gross vs due
const openGross = round2(openDetail.reduce((s, i) => s + i.gross, 0));
const openTagged = round2(openDetail.reduce((s, i) => s + i.tagged, 0));

console.log('### D — Open invoice lines (partial CN tagging visible)\n');
console.log('| Inv | Gross | Tagged CN/pmt | Due on list |');
console.log('| :--- | ---: | ---: | ---: |');
for (const i of openDetail) {
  console.log(`| ${i.doc} | ${fmtAmount(i.gross)} | ${fmtAmount(i.tagged)} | ${fmtAmount(i.due)} |`);
}
console.log(`| **Total** | **${fmtAmount(openGross)}** | **${fmtAmount(openTagged)}** | **${fmtAmount(sumOpen)}** |`);
console.log('');

// Named allocation attempt for gap
// Residual old balance (B/F not represented in open invoice table):
// If all open invoices are from Feb 2026+, B/F debt might still be part of header but not itemised
const oldestOpen = openDetail.sort((a, b) => a.iso.localeCompare(b.iso))[0];
console.log('### E — Proposed named allocation of R' + fmtAmount(gap) + '\n');
console.log('This is investigative — each line needs ratification before going on a customer statement.\n');
console.log('| # | Component | R | Basis | Status |');
console.log('| :---: | :--- | ---: | :--- | :--- |');

const overrideNet = round2(
  excludedPositive.filter((x) => x.override).reduce((s, x) => s + x.net, 0),
);
const pathBTotal = round2(pathB.reduce((s, r) => s + r.amount, 0));
const julJournals = round2(pathBOther.reduce((s, r) => s + r.amount, 0));
const untaggedPayTotal = round2(payments.reduce((s, r) => s + r.amount, 0));

// The gap isn't simply sum of untagged - need proper bridge
// header = sumOpen + gap
// gap represents: debt at account level not on the 11 invoice lines

// B/F residual: header - sumOpen - can't fully allocate without knowing which B/F invoices still open
// Approximation: balanceBf + activity on closed invoices + untagged effect

// Closed invoice nets that are zero or negative (fully settled in ERP tagging)
const closedZeroNet = round2(
  [...invNet.entries()]
    .filter(([doc, o]) => o.net <= 0.005 && !openDocs.has(doc))
    .reduce((s, [, o]) => s + o.net, 0),
);

console.log(`| 1 | BALANCE B/F carry not itemised on open invoice table | ${fmtAmount(balanceBf)} | Export window starts Mar 2025; B/F is pre-window debt. Open list only names 11 invoices from Feb–Jul 2026 — does **not** re-state the B/F as invoice lines. | **Investigate** — how much of B/F is still owed vs already absorbed by untagged payments? |`);
console.log(`| 2 | Untagged STAT payments (3 receipts) | ${fmtAmount(untaggedPayTotal)} | Settled batches at account level without \`INVNO\` — includes STAT 114 slice that paid 42468/42470 | **Known** — see Phase2 linkage |`);
console.log(`| 3 | Path B discount journals (2026-08-09) | ${fmtAmount(pathBTotal)} | Posted settlement discounts; untagged | **Known** — R112.78 + R228.93 + R393.99 |`);
console.log(`| 4 | Untagged Jul 2026 journals (14 rows) | ${fmtAmount(julJournals)} | CYL / deposit / empty-return class postings | **Investigate** — map to invoices or B/F |`);
console.log(`| 5 | Override invoices removed from list but net still in ERP model | ${fmtAmount(overrideNet)} | 42468 + 42470 ratified paid; removed from open list | **Closed** |`);

console.log('');
console.log('**Key insight:** the R' + fmtAmount(gap) + ' is not one posting — it is the net of B/F carry, untagged settlements, and partial CN tagging that the 11-line open table does not capture. The aged-balance recon adjustment dumps this entire residual into 120-day without naming it.');
console.log('');
console.log('**Next step:** build a balance bridge report (B/F → current) naming each untagged row\'s intended invoice target from remittance/pattern evidence, then ratify into `statement_of_account.json` as `balanceBridgeLines` or extend ageing to show the residual explicitly.');
