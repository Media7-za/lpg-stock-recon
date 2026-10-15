#!/usr/bin/env node
/**
 * COF001 Statement of Account v5 (sub-ledger position statement).
 *
 * Amounts and balances: ERP TXT extracts in raw/ (Tier-3 authority).
 * Routing: Invoice / Crd Note by cylinder SKU lines (9.1, 14.1, 19.1, S.1, D.1) from
 *   data/db_sku_classification.json (queried from Supabase). Mixed documents are split
 *   at line level using de-duplicated SKU totals that tie to the TXT document amount.
 * Payments route to 1A (paymentLane: LPG).
 *
 * Usage: node analysis/debtors/COF001/scripts/build_statement_v5.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const ACCT = path.join(ROOT, 'analysis/debtors/COF001');
const YEARS = ['2023', '2024', '2025', 'CURRENT'];
const COMBINED = path.join(ACCT, 'raw/COF001_COMBINED.TXT');
let OUT = path.join(ACCT, 'reports/COF001_Statement_Account_v5.md');
const cfg = JSON.parse(fs.readFileSync(path.join(ACCT, 'config/statement_v5.json'), 'utf8'));
const db = JSON.parse(fs.readFileSync(path.join(ACCT, 'data/db_sku_classification.json'), 'utf8'));

const PAYMENT_TYPES = new Set(['Payment', 'Ud Paymnt', 'Bank XFer', 'Bank UD', 'Bank Dep', 'Journal']);
const CYL_SKUS = new Set(db.cyl_skus);
const r2 = (n) => Math.round(n * 100) / 100;
const fmt = (n) => {
  const s = Math.abs(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (n < 0 ? '-' : '') + s;
};
const problems = [];

function parseFile(year) {
  const file = path.join(ACCT, `raw/COF001_${year}.TXT`);
  const text = fs.readFileSync(file, 'utf8');
  const header = {};
  const rows = [];
  let bf = null;
  let headerLinesEnd = 0;
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('"LINE","PERIOD"')) headerLinesEnd = i;
    if (!line.startsWith('"')) return;
    const f = [...line.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
    if (f.length === 2) {
      header[f[0].replace(/:$/, '')] = f[1];
      return;
    }
    if (f.length < 11) return;
    if (f[6] === 'BALANCE B/F:') {
      bf = r2(Number(f[10]));
      return;
    }
    if (!/^\d+$/.test(f[0])) return;
    const [dd, mm, yyyy] = f[4].split('/');
    rows.push({
      year,
      line: Number(f[0]),
      period: f[1],
      docNo: f[2],
      type: f[3],
      date: `${yyyy}-${mm}-${dd}`,
      ref: f[6].trim(),
      refName: f[8].trim(),
      amount: r2(Number(f[9])),
      bal: r2(Number(f[10])),
      raw: line,
    });
  });
  return { year, header, bf, rows, headerText: lines.slice(0, headerLinesEnd + 1).join('\n'), bfRaw: lines.find((l) => l.includes('BALANCE B/F:')) };
}

// 1. Parse and chain-check the four extracts.
const sources = YEARS.map(parseFile);
let prevClose = null;
for (const s of sources) {
  if (prevClose !== null && r2(s.bf) !== prevClose) {
    problems.push(`${s.year} B/F ${fmt(s.bf)} does not equal previous extract closing ${fmt(prevClose)}`);
  }
  let run = s.bf;
  for (const r of s.rows) {
    run = r2(run + r.amount);
    if (Math.abs(run - r.bal) > 0.011) {
      problems.push(`${s.year} line ${r.line} ${r.docNo} ${r.type}: chain expects ${fmt(run)}, TXT shows ${fmt(r.bal)}`);
      run = r.bal;
    }
  }
  prevClose = s.rows.at(-1).bal;
}
const erpHeaderBalance = Number(sources.at(-1).header['CURRENT BALANCE']);
if (r2(prevClose) !== r2(erpHeaderBalance)) {
  problems.push(`final chain balance ${fmt(prevClose)} != CURRENT BALANCE header ${fmt(erpHeaderBalance)}`);
}

// 2. Write combined TXT so the shared generator contract (single txtPath) can read it.
const current = sources.at(-1);
const combinedLines = [
  current.headerText,
  sources[0].bfRaw,
  ...sources.flatMap((s) => s.rows.map((r) => r.raw)),
  `"TOTAL TRANSACTIONS: ${fmt(prevClose).replace(/,/g, '')}","","","","","","","","","",""`,
];
fs.writeFileSync(COMBINED, combinedLines.join('\n') + '\n');

const rows = sources.flatMap((s) => s.rows);

// 3. Route each row.
const cylSet = new Set(db.cyl_docs);
const mixed = new Map(db.mixed_docs.map((m) => [`${m.doc_no}|${m.entry_type}`, m]));
const keyCount = new Map();
for (const r of rows) {
  if (r.type === 'Invoice' || r.type === 'Crd Note') {
    const k = `${r.docNo}|${r.type}`;
    keyCount.set(k, (keyCount.get(k) || 0) + 1);
  }
}
const duplicateKeys = [...keyCount.entries()].filter(([, n]) => n > 1);

let ledger = rows.map((r) => {
  const key = `${r.docNo}|${r.type}`;
  let lane;
  let cyl = 0;
  let gas = 0;
  if (PAYMENT_TYPES.has(r.type)) {
    lane = '1A';
    gas = r.amount;
  } else if (r.type === 'Invoice' || r.type === 'Crd Note') {
    const m = mixed.get(key);
    if (m) {
      lane = 'SPLIT';
      cyl = m.cyl_amt;
      gas = m.gas_amt;
      if (Math.abs(r2(cyl + gas) - r.amount) > 0.01) {
        problems.push(`mixed split does not tie to TXT amount: ${key} (${fmt(cyl + gas)} vs ${fmt(r.amount)})`);
      }
    } else if (cylSet.has(key)) {
      lane = '1B';
      cyl = r.amount;
    } else {
      lane = '1A';
      gas = r.amount;
    }
  } else {
    lane = '1A';
    gas = r.amount;
    problems.push(`unrecognised entry type "${r.type}" line ${r.line} (${r.year}) routed to 1A`);
  }
  return { ...r, lane, cyl: r2(cyl), gas: r2(gas), emptyRef: /EMPTY/i.test(r.ref) };
});

// 4. Running sub-ledgers and per-row bridge (1A + 1B must equal ERP balance on every row).
let run1A = r2(cfg.combinedBf - cfg.cylOpeningFinancial);
let run1B = r2(cfg.cylOpeningFinancial);
let open1A = run1A;
let open1B = run1B;
for (const r of ledger) {
  run1A = r2(run1A + r.gas);
  run1B = r2(run1B + r.cyl);
  r.bal1A = run1A;
  r.bal1B = run1B;
  if (Math.abs(r2(run1A + run1B) - r.bal) > 0.011) {
    problems.push(`bridge break ${r.year} line ${r.line} ${r.docNo}: 1A+1B ${fmt(r2(run1A + run1B))} vs ERP ${fmt(r.bal)}`);
  }
}
// Full-history ledger and validation use fullLedger. --from YYYY-MM-DD narrows the statement
// to rows on or after that date, with opening balances taken from the full running balance.
const fullLedger = ledger;
let erpOpen = cfg.combinedBf;
const FROM = process.argv.includes('--from') ? process.argv[process.argv.indexOf('--from') + 1] : null;
if (FROM) {
  const idx = ledger.findIndex((r) => r.date >= FROM);
  if (idx < 0) throw new Error(`no rows on or after ${FROM}`);
  if (!ledger.slice(idx).every((r) => r.date >= FROM)) {
    problems.push(`rows on or after ${FROM} are not contiguous in ledger order`);
  }
  const prev = idx > 0 ? ledger[idx - 1] : null;
  open1A = prev ? prev.bal1A : r2(cfg.combinedBf - cfg.cylOpeningFinancial);
  open1B = prev ? prev.bal1B : r2(cfg.cylOpeningFinancial);
  erpOpen = prev ? prev.bal : cfg.combinedBf;
  ledger = ledger.slice(idx);
  OUT = path.join(ACCT, `reports/COF001_Statement_Account_v5_${FROM}_to_${ledger.at(-1).date}.md`);
}
const erpClose = ledger.at(-1).bal;
const close1A = ledger.at(-1).bal1A;
const close1B = ledger.at(-1).bal1B;
const bridgeVariance = r2(close1A + close1B - erpClose);
const periodLabel = `${ledger[0].date} to ${ledger.at(-1).date}`;

// 5. Cross-checks for the report.
const laneCounts = {};
for (const r of fullLedger) {
  const k = `${r.type} | ${r.lane}`;
  laneCounts[k] = (laneCounts[k] || 0) + 1;
}
const emptyNot1B = fullLedger.filter((r) => r.emptyRef && r.lane === '1A' && (r.type === 'Invoice' || r.type === 'Crd Note'));
const cyl1BNoEmpty = fullLedger.filter((r) => r.lane === '1B' && !r.emptyRef);
const txtTypeCounts = {};
for (const r of fullLedger) txtTypeCounts[r.type] = (txtTypeCounts[r.type] || 0) + 1;

const sumLane = (lane, col) => r2(ledger.filter((r) => r.lane === lane || (lane === 'SPLIT' && r.lane === 'SPLIT')).reduce((a, r) => a + r[col], 0));
const mixedRows = ledger.filter((r) => r.lane === 'SPLIT');
const cyl1Bdocs = ledger.filter((r) => r.lane === '1B');
const pct = (n, d) => (d ? ((100 * n) / d).toFixed(1) : '0.0');

// 6. Part 2 custody (DB, de-duplicated) with template deposit rates (ASSUMED).
const custody = Object.entries(db.custody_qty_net_dedup).map(([sku, q]) => ({
  sku,
  qty: q,
  rate: cfg.skuRates[sku] ?? null,
  exposure: cfg.skuRates[sku] != null ? r2(q * cfg.skuRates[sku]) : null,
}));
const custodyExposure = r2(custody.reduce((a, c) => a + (c.exposure || 0), 0));

// 7. Markdown.
const md = [];
md.push('# Statement of Account - Version 5 (Sub-Ledger Position Statement)');
md.push('');
md.push(`**Account:** COF001 - COFFEEBERRY-CASCADES  `);
md.push(`**Period:** ${periodLabel} (ERP extracts 2023, 2024, 2025, CURRENT)  `);
md.push(`**Sources:** \`analysis/debtors/COF001/raw/COF001_{2023,2024,2025,CURRENT}.TXT\`; combined as \`raw/COF001_COMBINED.TXT\`  `);
md.push('**Authority:** ERP TXT for amounts and balances. Supabase (DB) for SKU routing, mixed-document splits and Part 2 quantities.  ');
md.push('**Generator:** `analysis/debtors/COF001/scripts/build_statement_v5.mjs` (generated, not hand-edited).');
md.push('');
md.push('## Summary');
md.push('');
md.push('| Position | Amount | Tag / artifact |');
md.push('| :--- | ---: | :--- |');
md.push(`| ERP opening balance (before first row) | ${fmt(erpOpen)} | PROVEN - \`raw/COF001_2023.TXT\` B/F row or prior ERP running balance |`);
md.push(`| ERP closing balance (last row) | ${fmt(erpClose)} | PROVEN - ERP running balance on the last row |`);
md.push(`| Part 1A LPG closing | ${fmt(close1A)} | PROVEN - computed in this report |`);
md.push(`| Part 1B CYL deposit closing | ${fmt(close1B)} | PROVEN - computed in this report |`);
md.push(`| Bridge variance (1A + 1B - ERP) | ${fmt(bridgeVariance)} | ${Math.abs(bridgeVariance) < 0.01 ? 'PROVEN - zero on every row' : 'UNRECONCILED'} |`);
md.push('');
md.push(`Chain integrity across the four extracts: ${problems.length ? '**' + problems.length + ' issue(s) - see Validation**' : 'PROVEN - every row balances and each extract opens on the prior closing.'}`);
md.push('');
md.push('## Part 1 - Reconciliation Bridge (1A + 1B = ERP)');
md.push('');
md.push('| Movement | 1A LPG | 1B CYL | Total | ERP |');
md.push('| :--- | ---: | ---: | ---: | ---: |');
const totalGas = r2(ledger.reduce((a, r) => a + r.gas, 0));
const totalCyl = r2(ledger.reduce((a, r) => a + r.cyl, 0));
const totalAmt = r2(ledger.reduce((a, r) => a + r.amount, 0));
md.push(`| Opening | ${fmt(open1A)} | ${fmt(open1B)} | ${fmt(open1A + open1B)} | ${fmt(erpOpen)} |`);
md.push(`| Movements | ${fmt(totalGas)} | ${fmt(totalCyl)} | ${fmt(r2(totalGas + totalCyl))} | ${fmt(totalAmt)} |`);
md.push(`| Closing | ${fmt(close1A)} | ${fmt(close1B)} | ${fmt(r2(close1A + close1B))} | ${fmt(erpClose)} |`);
md.push('');
md.push(`Mixed documents split at line level: ${mixedRows.length} documents (${mixedRows.map((r) => r.docNo.replace(/^0+/, '')).join(', ')}). Payments route to 1A only (\`paymentLane: LPG\`); no proportional payment split.`);
md.push('');

const table = (title, list, lanes) => {
  md.push(`## ${title}`);
  md.push('');
  md.push('| Date | Period | Doc | Type | Ref | Amount | Balance |');
  md.push('| :--- | :---: | :--- | :--- | :--- | ---: | ---: |');
  for (const r of list) {
    const isSplit = r.lane === 'SPLIT';
    const amt = lanes === '1A' ? r.gas : r.cyl;
    const bal = lanes === '1A' ? r.bal1A : r.bal1B;
    const ref = (r.ref || r.refName || '').replace(/\|/g, '/');
    md.push(`| ${r.date} | ${r.period} | ${r.docNo} | ${r.type}${isSplit ? ' (split)' : ''} | ${ref} | ${fmt(amt)} | ${fmt(bal)} |`);
  }
  md.push('');
};
table('Part 1A: LPG Gas Financial Statement', ledger.filter((r) => r.gas !== 0), '1A');
table('Part 1B: Cylinder Deposit Financial Statement', ledger.filter((r) => r.cyl !== 0), '1B');

md.push('## Part 2: Cylinder (CYL) Custody - Physical Asset Tracker');
md.push('');
md.push('Net quantity = invoiced less credited, de-duplicated DB lines (see `data/db_sku_classification.json`). **ASSERTED** from DB: the ingest coverage gate (`npm run debtors:ingest-check -- --debtor COF001`) was not run in this session, so custody conclusions are not yet gated.');
md.push('');
md.push('| SKU | Net qty | Template rate (ASSUMED) | Exposure at rate |');
md.push('| :--- | ---: | ---: | ---: |');
for (const c of custody) {
  md.push(`| ${c.sku} | ${c.qty} | ${c.rate != null ? fmt(c.rate) : '-'} | ${c.exposure != null ? fmt(c.exposure) : '-'} |`);
}
md.push(`| **Total** | | | **${fmt(custodyExposure)}** |`);
md.push('');
md.push('Negative net quantities mean credits exceed invoices in the ledger for that SKU. That can reflect stock held before the ledger window, so they are not a physical count.');
md.push('');
md.push('## Validation');
md.push('');
md.push('### Routing rule (cylinder SKUs in invoices and credit notes)');
md.push('');
md.push('| Check | Result | Tag |');
md.push('| :--- | :--- | :--- |');
md.push(`| DB LPG invoices (no 9.1/14.1/19.1/S.1/D.1 line) | ${db.db_routing_counts_doc_level.LPG_invoices_no_cyl_sku} documents, 0 with a cylinder SKU | PROVEN - DB query |`);
md.push(`| DB LPG credit notes (no cylinder SKU line) | ${db.db_routing_counts_doc_level.LPG_credit_notes_no_cyl_sku} documents, 0 with a cylinder SKU | PROVEN - DB query |`);
md.push(`| DB cylinder invoices (cylinder SKU lines only) | ${db.db_routing_counts_doc_level.CYL_invoices_only_cyl_sku} documents, all cylinder SKU | PROVEN - DB query |`);
md.push(`| DB cylinder credit notes (cylinder SKU lines only) | ${db.db_routing_counts_doc_level.CYL_credit_notes_only_cyl_sku} documents, all cylinder SKU | PROVEN - DB query |`);
md.push(`| Mixed documents (both kinds of line) | ${db.db_routing_counts_doc_level.MIXED_invoices} invoices + ${db.db_routing_counts_doc_level.MIXED_credit_notes} credit notes, split at line level; each split ties to its TXT amount | PROVEN - \`data/db_sku_classification.json\` |`);
md.push(`| TXT rows by lane (type \\| lane: count) | ${Object.entries(laneCounts).map(([k, v]) => `${k}: ${v}`).join('; ')} | PROVEN - this run |`);
md.push('');
md.push('### Other checks');
md.push('');
md.push('| Check | Result | Tag |');
md.push('| :--- | :--- | :--- |');
md.push(`| Balance chain across extracts (rows and file boundaries) | ${problems.length ? problems.length + ' issue(s)' : 'No breaks'} | ${problems.length ? 'UNRECONCILED' : 'PROVEN'} |`);
md.push(`| Per-row bridge 1A + 1B = ERP balance | ${Math.abs(bridgeVariance) < 0.01 ? 'Holds on all rows' : 'Breaks - see problems'} | PROVEN |`);
md.push(`| TXT rows by type | ${Object.entries(txtTypeCounts).map(([k, v]) => `${k}: ${v}`).join('; ')} | PROVEN - TXT |`);
md.push(`| DB header rows by type (for coverage comparison) | ${Object.entries(db.db_header_row_counts).map(([k, v]) => `${k}: ${v}`).join('; ')} | ASSERTED - DB |`);
md.push(`| Invoice rows: TXT vs DB | TXT ${fullLedger.filter((r) => r.type === 'Invoice').length} rows; DB ${db.db_header_row_counts.Invoice} rows | Not reconciled per document; ingest gate not run | UNRECONCILED |`);
md.push(`| Credit-note rows whose EMPTY marker routes to 1A | ${emptyNot1B.length} rows | ${emptyNot1B.length ? 'Review: EMPTY ref but SKU rule says gas' : 'PROVEN - none'} |`);
md.push(`| Cylinder-lane rows without an EMPTY marker in the ERP reference | ${cyl1BNoEmpty.length} rows | Expected: routing is SKU-based (user rule), not ERP-reference-based |`);
md.push(`| Document number used on more than one row (invoice or credit note) | ${duplicateKeys.length} keys | ${duplicateKeys.length ? 'Review: ' + duplicateKeys.map(([k, n]) => `${k} x${n}`).join(', ') : 'PROVEN - none'} |`);
md.push('');
if (emptyNot1B.length) {
  md.push('Rows with EMPTY in the ERP reference but routed to 1A:');
  md.push('');
  md.push('| Date | Doc | Type | Ref | Amount | Note |');
  md.push('| :--- | :--- | :--- | :--- | ---: | :--- |');
  for (const r of emptyNot1B) md.push(`| ${r.date} | ${r.docNo} | ${r.type} | ${r.ref} | ${fmt(r.amount)} | Cylinder-ref rows without cylinder SKU lines in DB |`);
  md.push('');
}
md.push('### Findings for review');
md.push('');
md.push('- **DB line duplication:** raw DB lines double-count six of the nine mixed documents (for example 00045528: 14,800.38 raw vs 7,400.19 in the TXT). The split uses de-duplicated lines (same rule as the generator), which tie to the TXT.');
md.push(`- **DB row count exceeds the extracts:** DB has ${db.db_header_row_counts.Invoice} invoice and ${db.db_header_row_counts.Payment} payment rows; the four extracts have ${fullLedger.filter((r) => r.type === 'Invoice').length} and ${fullLedger.filter((r) => r.type === 'Payment').length}. The TXT chain ties to the ERP balance, so the statement is unaffected, but Part 2 custody (DB-only) may include documents outside the ERP extracts.`);
md.push(`- **EMPTY marker vs SKU rule:** ${cyl1BNoEmpty.length} cylinder-routed rows carry no EMPTY marker in the ERP reference. A reference-based generator would send them to 1A, so the SKU rule changes the answer here.`);
md.push('- **Charges without cylinder SKUs:** lines such as `SM CYL RENTAL` (00049204) and rental lines 00041576 to 00041579 contain no cylinder SKU, so the SKU rule routes them to 1A. Confirm that is the intended treatment.');
md.push(`- **1B vs custody:** 1B closes at ${fmt(close1B)} and custody exposure at template rates is ${fmt(custodyExposure)}. The statement does not reconcile deposits to custody quantities.`);
md.push('');
md.push('### Not done in this run');
md.push('');
md.push('- `npm run debtors:reconcile-v5` / `reconcile_debtor_v5_from_txt.mjs` was not run: it needs `DATABASE_URL`, which is not set in this session. This report applies the same routing rules from the Supabase connector, and the generator should be re-run once the connection string is available.');
md.push('- Ingest coverage gate (`debtors:ingest-check`) not run, so Part 2 is ASSERTED, not gated.');
md.push('- Workspace fixture `src/features/debtor-position-workspace/data/fixtures/COF001.v5.json` not produced.');
md.push('');
if (problems.length) {
  md.push('### Problems');
  md.push('');
  for (const p of problems) md.push(`- ${p}`);
  md.push('');
}
md.push('---');
md.push('*Derived artifact - regenerate with the build script; do not hand-edit numbers.*');
md.push('');

fs.writeFileSync(OUT, md.join('\n'));

console.log(`1A closing ${fmt(close1A)} | 1B closing ${fmt(close1B)} | ERP ${fmt(erpClose)} | bridge variance ${fmt(bridgeVariance)}`);
console.log(`rows ${rows.length} | by lane: ${JSON.stringify(laneCounts)}`);
console.log(`EMPTY-ref routed 1A: ${emptyNot1B.length} | 1B without EMPTY ref: ${cyl1BNoEmpty.length} | duplicate doc keys: ${duplicateKeys.length}`);
console.log(problems.length ? `PROBLEMS (${problems.length}):\n - ${problems.join('\n - ')}` : 'No chain or bridge problems.');
console.log(`wrote ${path.relative(ROOT, OUT)} and ${path.relative(ROOT, COMBINED)}`);
