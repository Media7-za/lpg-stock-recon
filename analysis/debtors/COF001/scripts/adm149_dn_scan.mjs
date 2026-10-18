#!/usr/bin/env node
/**
 * COF001 / Linear ADM-149: scan every delivery note (DN#) for the invoice 45528 pattern.
 *
 * COF001 deliveries are booked as a main invoice (gas lines) plus a "-EMPTY" invoice that charges a
 * deposit for each empty cylinder swapped, which a credit note then reverses. For every DN group this
 * script compares the gas delivered (main invoice) with the deposits on the -EMPTY invoice and checks
 * that the credit note reverses them. It also lists every invoice that carries both gas and deposit
 * lines, and whether a credit note reverses those deposits.
 *
 * Inputs: raw/COF001_COMBINED.TXT (ERP ledger) and data/adm149_line_snapshot.json (de-duplicated
 * vw_clean_transactions lines, connector-sourced). Every snapshot document total is checked against
 * the TXT amount first; a mismatch is reported, never silently used.
 *
 * Usage: node analysis/debtors/COF001/scripts/adm149_dn_scan.mjs
 * Output: analysis/debtors/COF001/reports/COF001_ADM-149_DN_Scan.md
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const ACCT = path.join(ROOT, 'analysis/debtors/COF001');
const OUT = path.join(ACCT, 'reports/COF001_ADM-149_DN_Scan.md');
const snap = JSON.parse(fs.readFileSync(path.join(ACCT, 'data/adm149_line_snapshot.json'), 'utf8'));

const GAS9 = new Set(['9.3', '9.4', '901']);
const GAS48 = new Set(['S.3', 'S.4', 'S01', 'D.3', 'D.4', 'D01']);
const DEP9 = new Set(['9.1']);
const DEP48 = new Set(['S.1', 'D.1']);
const DEP = new Set(['9.1', '14.1', '19.1', 'S.1', 'D.1']);
const r2 = (n) => Math.round(n * 100) / 100;
const fmt = (n) => (Math.abs(n) < 0.005 ? 0 : n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const TYPE = { I: 'Invoice', C: 'Crd Note' };

// ERP ledger rows.
const txt = [];
for (const line of fs.readFileSync(path.join(ACCT, 'raw/COF001_COMBINED.TXT'), 'utf8').split('\n')) {
  const p = [...line.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
  if (p.length < 11 || !/^\d+$/.test(p[0]) || p[6] === 'BALANCE B/F:') continue;
  txt.push({ doc: p[2].replace(/^0+/, ''), type: p[3], iso: p[4].split('/').reverse().join('-'), ref: p[6], amount: Number(p[9]) });
}
const txtByKey = new Map(txt.map((t) => [`${t.doc}|${t.type}`, t]));

// Snapshot lines grouped by document.
const docs = new Map();
for (const [doc, t, iso, sku, qty, price, total] of snap.rows) {
  const key = `${doc}|${TYPE[t]}`;
  if (!docs.has(key)) docs.set(key, { doc, type: TYPE[t], iso, lines: [] });
  docs.get(key).lines.push({ sku, qty: Number(qty), price: Number(price), total: Number(total) });
}

// 1. Snapshot vs TXT document totals.
const mismatches = [];
let matched = 0;
for (const [key, d] of docs) {
  const t = txtByKey.get(key);
  const sum = r2(d.lines.reduce((s, l) => s + l.total, 0));
  if (!t) mismatches.push({ key, sum, txt: null, note: 'not in TXT' });
  else if (Math.abs(sum - t.amount) > 0.02) mismatches.push({ key, sum, txt: t.amount, note: 'amount differs' });
  else matched++;
  d.ref = t ? t.ref : '';
}
const txtLineDocs = txt.filter((t) => t.type === 'Invoice' || t.type === 'Crd Note');
const noLines = txtLineDocs.filter((t) => !docs.has(`${t.doc}|${t.type}`));

// 2. DN groups.
const norm = (ref) => {
  const r = ref.toUpperCase().replace(/\s+/g, '');
  if (!r.startsWith('DN')) return null;
  const empty = /EMPTY$/.test(r);
  const base = r.replace(/[-=]?EMPTY$/, '').replace(/-?SWAP$/, '').replace(/-$/, '');
  return { base, empty };
};
const qtyOf = (d, set) => (d ? d.lines.filter((l) => set.has(l.sku)).reduce((s, l) => s + l.qty, 0) : 0);
const days = (a, b) => (Date.parse(b) - Date.parse(a)) / 86400000;

const dnDocs = [];
for (const t of txtLineDocs) {
  const n = norm(t.ref);
  if (!n) continue;
  dnDocs.push({ ...t, ...n, d: docs.get(`${t.doc}|${t.type}`) });
}
// Each -EMPTY invoice anchors one delivery; attach main invoices/credits of the same DN within 7 days.
const used = new Set();
const groups = [];
for (const e of dnDocs.filter((x) => x.empty && x.type === 'Invoice').sort((a, b) => a.iso.localeCompare(b.iso))) {
  if (used.has(`${e.doc}|${e.type}`)) continue;
  const near = (x) => x.base === e.base && Math.abs(days(e.iso, x.iso)) <= 7 && !used.has(`${x.doc}|${x.type}`);
  const members = dnDocs.filter(near);
  members.forEach((m) => used.add(`${m.doc}|${m.type}`));
  const main = members.filter((m) => !m.empty);
  const emptyInv = members.filter((m) => m.empty && m.type === 'Invoice');
  const emptyCn = members.filter((m) => m.empty && m.type === 'Crd Note');
  const sum = (arr, set) => arr.reduce((s, m) => s + qtyOf(m.d, set), 0);
  const g = {
    dn: e.base.replace(/^DN#?/, 'DN#'),
    iso: e.iso,
    main: main.map((m) => m.doc).join(', '),
    emptyInv: emptyInv.map((m) => m.doc).join(', '),
    emptyCn: emptyCn.map((m) => m.doc).join(', ') || '-',
    gas9: sum(main, GAS9),
    gas48: sum(main, GAS48),
    mainDep: sum(main.filter((m) => m.type === 'Invoice'), DEP),
    eDep9: sum(emptyInv, DEP9),
    eDep48: sum(emptyInv, DEP48),
    cDep9: sum(emptyCn, DEP9),
    cDep48: sum(emptyCn, DEP48),
    linesMissing: members.some((m) => !m.d),
  };
  g.keys = members.map((m) => `${m.doc}|${m.type}`);
  g.res9 = g.eDep9 + g.cDep9;
  g.res48 = g.eDep48 + g.cDep48;
  g.flags = [];
  if (g.linesMissing) g.flags.push('LINES_MISSING');
  if (g.mainDep !== 0) g.flags.push('DEPOSIT_ON_MAIN');
  if (g.res9 !== 0 || g.res48 !== 0) g.flags.push('EMPTY_NOT_FULLY_REVERSED');
  if (g.eDep48 !== g.gas48 || g.eDep9 !== g.gas9) g.flags.push('SIZE_COUNT_MISMATCH');
  groups.push(g);
}

// 3. Invoices that carry gas and deposit lines together, and the credit note (if any) reversing the deposits.
const consumedCn = new Set(groups.flatMap((g) => g.emptyCn.split(', ')).filter((x) => x !== '-'));
const mixed = [];
for (const d of docs.values()) {
  if (d.type !== 'Invoice') continue;
  const gas = d.lines.filter((l) => GAS9.has(l.sku) || GAS48.has(l.sku));
  const dep = d.lines.filter((l) => DEP.has(l.sku));
  if (!gas.length || !dep.length) continue;
  const want = new Map();
  dep.forEach((l) => want.set(l.sku, (want.get(l.sku) || 0) + l.qty));
  let reversedBy = null;
  for (const c of docs.values()) {
    if (c.type !== 'Crd Note' || consumedCn.has(c.doc)) continue;
    const dd = days(d.iso, c.iso);
    if (dd < 0 || dd > 14) continue;
    const got = new Map();
    c.lines.filter((l) => DEP.has(l.sku)).forEach((l) => got.set(l.sku, (got.get(l.sku) || 0) + l.qty));
    if (got.size === want.size && [...want].every(([k, v]) => got.get(k) === -v)) {
      reversedBy = c.doc;
      consumedCn.add(c.doc);
      break;
    }
  }
  mixed.push({
    doc: d.doc,
    iso: d.iso,
    ref: d.ref,
    gas: gas.map((l) => `${l.sku} x${l.qty}`).join(', '),
    dep: dep.map((l) => `${l.sku} x${l.qty}`).join(', '),
    depAmt: r2(dep.reduce((s, l) => s + l.total, 0)),
    reversedBy,
    sizeMatch:
      dep.filter((l) => DEP48.has(l.sku)).reduce((s, l) => s + l.qty, 0) === gas.filter((l) => GAS48.has(l.sku)).reduce((s, l) => s + l.qty, 0) &&
      dep.filter((l) => DEP9.has(l.sku)).reduce((s, l) => s + l.qty, 0) === gas.filter((l) => GAS9.has(l.sku)).reduce((s, l) => s + l.qty, 0),
  });
}
mixed.sort((a, b) => a.iso.localeCompare(b.iso));

// 4. 45528 against its neighbours: what the 48kg gas line would have cost.
const gas48Before = [...docs.values()]
  .filter((d) => d.type === 'Invoice' && d.iso < '2025-08-09')
  .flatMap((d) => d.lines.filter((l) => GAS48.has(l.sku)).map((l) => ({ ...l, doc: d.doc, iso: d.iso })))
  .sort((a, b) => b.iso.localeCompare(a.iso))[0];
const gas48After = [...docs.values()]
  .filter((d) => d.type === 'Invoice' && d.iso > '2025-08-09')
  .flatMap((d) => d.lines.filter((l) => GAS48.has(l.sku)).map((l) => ({ ...l, doc: d.doc, iso: d.iso })))
  .sort((a, b) => a.iso.localeCompare(b.iso))[0];
const inv = docs.get('45528|Invoice');
const s1 = inv.lines.find((l) => l.sku === 'S.1');
const gas9 = inv.lines.find((l) => GAS9.has(l.sku));
const line48 = (price) => r2(s1.qty * price * 1.15);
const expectBefore = line48(gas48Before.price);
const expectAfter = line48(gas48After.price);

// 5. 48kg deposit custody (S.1 + D.1 net qty) by year, from the de-duplicated lines, and the documents that
// leave a non-zero 48kg deposit balance once each delivery and each reversed mixed invoice is netted.
const custody = new Map();
for (const d of docs.values()) {
  const y = d.iso.slice(0, 4);
  const c = custody.get(y) || { q48: 0, q9: 0 };
  c.q48 += qtyOf(d, DEP48);
  c.q9 += qtyOf(d, DEP9);
  custody.set(y, c);
}
const unit = new Map();
groups.forEach((g) => g.keys.forEach((k) => unit.set(k, `DN ${g.dn} (${g.iso})`)));
mixed
  .filter((m) => m.reversedBy)
  .forEach((m) => {
    unit.set(`${m.doc}|Invoice`, `invoice ${m.doc} + CN ${m.reversedBy}`);
    unit.set(`${m.reversedBy}|Crd Note`, `invoice ${m.doc} + CN ${m.reversedBy}`);
  });
const netByUnit = new Map();
for (const [k, d] of docs) {
  if (!qtyOf(d, DEP48)) continue;
  const u = unit.get(k) || `${d.type} ${d.doc} (${d.iso})`;
  const e = netByUnit.get(u) || { s1: 0, d1: 0, docs: new Set() };
  e.s1 += qtyOf(d, new Set(['S.1']));
  e.d1 += qtyOf(d, new Set(['D.1']));
  e.docs.add(d.doc);
  netByUnit.set(u, e);
}
// Pre-2025 deposit swaps carry no DN reference: pair a single-document invoice with a single-document credit
// note dated 0 to 7 days later whose 48kg units net to zero.
const singles = [...netByUnit].filter(([, e]) => e.docs.size === 1).map(([u, e]) => ({ u, e, d: docs.get([...docs.keys()].find((k) => k.startsWith(`${[...e.docs][0]}|`) && u.startsWith(docs.get(k).type))) }));
for (const inv of singles.filter((x) => x.d.type === 'Invoice').sort((a, b) => a.d.iso.localeCompare(b.d.iso))) {
  if (!netByUnit.has(inv.u)) continue;
  const cn = singles.find(
    (x) => x.d.type === 'Crd Note' && netByUnit.has(x.u) && days(inv.d.iso, x.d.iso) >= 0 && days(inv.d.iso, x.d.iso) <= 7 && x.e.s1 + x.e.d1 === -(inv.e.s1 + inv.e.d1),
  );
  if (!cn) continue;
  netByUnit.delete(inv.u);
  netByUnit.delete(cn.u);
  netByUnit.set(`invoice ${inv.d.doc} + CN ${cn.d.doc} (${inv.d.iso}, no DN)`, { s1: inv.e.s1 + cn.e.s1, d1: inv.e.d1 + cn.e.d1, docs: new Set([inv.d.doc, cn.d.doc]) });
}
const contributors = [...netByUnit].filter(([, e]) => e.s1 || e.d1);

// Report.
const L = [];
L.push('# COF001 - ADM-149 delivery-note scan (45528 pattern)', '');
L.push('*Generated by `analysis/debtors/COF001/scripts/adm149_dn_scan.mjs`; do not edit numbers by hand.*', '');
L.push(
  'Inputs: `raw/COF001_COMBINED.TXT` (ERP, PROVEN) and `data/adm149_line_snapshot.json` (de-duplicated `vw_clean_transactions` lines, connector-sourced 2026-10-18). Line-level facts are PROVEN where the snapshot document total equals the TXT amount (section 1); the reading of each flag is ASSERTED.',
  '',
);
L.push('## 1. Snapshot check against the ERP ledger', '');
L.push(`- Snapshot documents: ${docs.size}; total equals the TXT amount (within R0.02): **${matched}**; mismatched or not in TXT: **${mismatches.length}**.`);
L.push(`- TXT invoices and credit notes with no lines in the database: ${noLines.length} (${noLines.map((t) => t.doc).join(', ') || 'none'}).`);
if (mismatches.length) {
  L.push('', '| Document | Snapshot sum (R) | TXT (R) | Note |', '| :--- | ---: | ---: | :--- |');
  for (const m of mismatches) L.push(`| ${m.key} | ${fmt(m.sum)} | ${m.txt === null ? '-' : fmt(m.txt)} | ${m.note} |`);
}
L.push('');
L.push('## 2. Every -EMPTY delivery: gas delivered vs deposits swapped', '');
L.push(
  'Gas 9 = 9kg gas units on the main invoice(s) net of main-invoice credit notes (SKUs 9.3, 9.4, 901); Gas 48 = 48kg gas units (S.3, S.4, S01, D.3, D.4, D01). EMPTY 9 / EMPTY 48 = deposits on the -EMPTY invoice (9.1 / S.1, D.1). Residual = -EMPTY deposits left after the -EMPTY credit note. Deposit on main = deposit units on the main invoice itself.',
  '',
);
L.push('| DN | Date | Main | -EMPTY inv | -EMPTY CN | Gas 9 | Gas 48 | Deposit on main | EMPTY 9 | EMPTY 48 | Residual 9 | Residual 48 | Flags |');
L.push('| :--- | :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |');
for (const g of groups) {
  L.push(
    `| ${g.dn} | ${g.iso} | ${g.main || '-'} | ${g.emptyInv} | ${g.emptyCn} | ${g.gas9} | ${g.gas48} | ${g.mainDep} | ${g.eDep9} | ${g.eDep48} | ${g.res9} | ${g.res48} | ${g.flags.join(', ') || 'ok'} |`,
  );
}
const flagged = groups.filter((g) => g.flags.length);
L.push('', `Groups: ${groups.length}; clean: ${groups.length - flagged.length}; flagged: ${flagged.length}.`, '');
L.push('## 3. Invoices carrying gas and deposit lines together', '');
L.push('A credit note counts as reversing the deposits when it is dated 0 to 14 days after the invoice, is not already the -EMPTY credit of a section 2 delivery, and negates exactly the invoice\'s deposit SKUs and quantities.', '');
L.push('| Invoice | Date | Reference | Gas lines | Deposit lines | Deposit (R) | Deposit size matches gas | Deposits reversed by |');
L.push('| :--- | :--- | :--- | :--- | :--- | ---: | :--- | :--- |');
for (const m of mixed) {
  L.push(`| ${m.doc} | ${m.iso} | ${m.ref} | ${m.gas} | ${m.dep} | ${fmt(m.depAmt)} | ${m.sizeMatch ? 'yes' : '**no**'} | ${m.reversedBy || '**none**'} |`);
}
L.push('');
L.push('## 4. Invoice 45528: the 48kg line priced as gas', '');
L.push(`- 45528 lines: ${gas9.sku} x${gas9.qty} @ ${gas9.price} = R${fmt(gas9.total)}; S.1 x${s1.qty} @ ${s1.price} = R${fmt(s1.total)}; total R${fmt(r2(gas9.total + s1.total))}.`);
L.push(`- Last COF001 48kg gas line before 9 Aug 2025: ${gas48Before.doc} (${gas48Before.iso}) ${gas48Before.sku} @ ${gas48Before.price} ex VAT. Five at that price: **R${fmt(expectBefore)}**.`);
L.push(`- First COF001 48kg gas line after 9 Aug 2025: ${gas48After.doc} (${gas48After.iso}) ${gas48After.sku} @ ${gas48After.price} ex VAT. Five at that price: **R${fmt(expectAfter)}**.`);
L.push(
  `- If the S.1 line should have been 48kg gas, 45528 should have totalled R${fmt(r2(gas9.total + expectAfter))} to R${fmt(r2(gas9.total + expectBefore))}, so the customer was **under**charged by R${fmt(r2(expectAfter - s1.total))} to R${fmt(r2(expectBefore - s1.total))} and owes no deposit.`,
);
L.push('');
L.push('## 5. Deposit units by year, de-duplicated lines', '');
L.push('| Year | 48kg net units | 48kg cumulative | 9kg (9.1) net units | 9kg cumulative |', '| :--- | ---: | ---: | ---: | ---: |');
let cum48 = 0;
let cum9 = 0;
for (const [y, c] of [...custody].sort()) {
  cum48 += c.q48;
  cum9 += c.q9;
  L.push(`| ${y} | ${c.q48} | ${cum48} | ${c.q9} | ${cum9} |`);
}
L.push('', 'Deliveries or reversed pairs that leave a non-zero 48kg deposit balance (S.1 and D.1 shown apart):', '');
L.push('| Unit | Documents | S.1 net | D.1 net |', '| :--- | :--- | ---: | ---: |');
for (const [u, e] of contributors) L.push(`| ${u} | ${[...e.docs].join(', ')} | ${e.s1} | ${e.d1} |`);
L.push('', 'The database view `vw_cylinder_ledger` double-counts the duplicated item rows (ADM-139); these counts use the de-duplicated snapshot.', '');

fs.writeFileSync(OUT, L.join('\n'));
console.log(`wrote ${path.relative(ROOT, OUT)}: ${groups.length} DN groups, ${flagged.length} flagged; ${mixed.length} mixed invoices; snapshot ${matched}/${docs.size} docs match TXT`);
