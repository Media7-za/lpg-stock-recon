#!/usr/bin/env node
/**
 * COF002 2024 cross-posting search (analyst scratch, read-only, labelled ASSERTED; not a pipeline generator).
 *   node docs/previews/2026-10-16_COF002_2024/cof002_2024_crosspost_search.mjs
 * Inputs: COF002 DEBENQ year files + CURRENT from commit fd8a268 of origin/claude/exciting-lamport-rvb277 (read with git show;
 *         nothing is copied into analysis/debtors/COF002), COF001 from analysis/debtors/COF001/raw/COF001_COMBINED.TXT.
 * Runs analysis/debtors/COF001/scripts/d21_intake_check.mjs on each COF002 file (D21), merges the COF002 files,
 * pairs payments to invoices by exact amount inside each account, then tests the residuals across the two accounts.
 * Writes: out/ (CSV + report.md). No ERP, DB or config writes.
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { execFileSync, spawnSync } from 'child_process';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(HERE, 'out');
fs.mkdirSync(OUT, { recursive: true });
const COMMIT = 'fd8a268dc3af4bee38e8ebd4b66692e217051fa7';
const BR = 'analysis/debtors/COF002/raw/';
const FILES = ['COF002_DEBENQ_2023.TXT', 'COF002_DEBENQ_2024.TXT', 'COF002_DEBENQ_2025.TXT', 'COF002_DEBENQ_CURRENT.TXT'];
const cents = (s) => Math.round(Number(s) * 100);
const m = (c) => (c / 100).toFixed(2);
const log = [];
const say = (s = '') => { log.push(s); console.log(s); };

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cof002-'));
const text = {};
for (const f of FILES) {
  const buf = execFileSync('git', ['show', `${COMMIT}:${BR}${f}`], { maxBuffer: 1 << 26 });
  fs.writeFileSync(path.join(tmp, f), buf);
  text[f] = buf.toString('utf8');
  say(`source ${f} @ ${COMMIT.slice(0, 7)} sha256 ${crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16)}`);
}
const c1path = 'analysis/debtors/COF001/raw/COF001_COMBINED.TXT';
text.c1 = fs.readFileSync(c1path, 'utf8');
say(`source ${c1path} sha256 ${crypto.createHash('sha256').update(text.c1).digest('hex').slice(0, 16)}`);

say('\n## D21 intake check (existing script analysis/debtors/COF001/scripts/d21_intake_check.mjs)');
const d21 = spawnSync('node', ['analysis/debtors/COF001/scripts/d21_intake_check.mjs', ...FILES.map((f) => path.join(tmp, f))], { encoding: 'utf8' });
say(d21.stdout.split(tmp + '/').join('').trim());

function parse(t, src) {
  const rows = []; const hdr = {};
  for (const l of t.split(/\r?\n/)) {
    const c = l.match(/"((?:[^"]|"")*)"/g)?.map((x) => x.slice(1, -1));
    if (!c) continue;
    if (/^\d+$/.test(c[0]) && c[3]) {
      rows.push({ src, line: +c[0], period: c[1], doc: c[2], entry: c[3], date: c[4].split('/').reverse().join('-'), ref: c[6], stat: (c[6].match(/STAT:?\s*(\d+)/i) || [])[1] || '', reference: c[8], amt: cents(c[9]), bal: cents(c[10]) });
    } else if (c[0].endsWith(':') && c[1] !== undefined) hdr[c[0]] = c[1];
  }
  return { rows, hdr };
}
const P2 = FILES.map((f) => parse(text[f], f.replace('COF002_DEBENQ_', '').replace('.TXT', '')));
const P1 = parse(text.c1, 'COMBINED');
const hdr2 = P2[3].hdr; const hdr1 = P1.hdr;
const sortR = (a, b) => a.date.localeCompare(b.date) || a.doc.localeCompare(b.doc);
const L2 = P2.flatMap((p) => p.rows).sort(sortR);
const L1 = P1.rows.slice().sort(sortR);

say('\n## Chain of the year files and merge (COF002)');
P2.forEach((p, i) => say(`${FILES[i]}: rows ${p.rows.length}, B/F ${m(p.rows[0].bal - p.rows[0].amt)}, last balance ${m(p.rows.at(-1).bal)}`));
const sum2 = L2.reduce((s, r) => s + r.amt, 0);
say(`merged COF002 rows ${L2.length} (docs duplicated across files: ${L2.length - new Set(L2.map((r) => r.doc + r.entry)).size}); sum of AMOUNT = ${m(sum2)}; header CURRENT BALANCE ${hdr2['CURRENT BALANCE:']} -> ${sum2 === cents(hdr2['CURRENT BALANCE:']) ? 'MATCH' : 'NO MATCH'}`);
const curEarly = P2[3].rows.filter((r) => r.date < '2025-03-01');
say(`CURRENT carries ${curEarly.length} payments dated before 2025-03 that no year file carries: ${curEarly.map((r) => `${r.doc} ${r.date} ${m(r.amt)}`).join('; ')}`);
const sum1 = L1.reduce((s, r) => s + r.amt, 0);
say(`COF001 COMBINED rows ${L1.length}; sum ${m(sum1)}; header ${hdr1['CURRENT BALANCE:']}`);

say('\n## Where do the portfolio figures come from? (running balance on the merged date-ordered ledger)');
for (const [n, L, target] of [['COF002', L2, -526766], ['COF001', L1, 795838]]) {
  let b = 0; const hits = [];
  L.forEach((r) => { b += r.amt; if (b === target) hits.push(`${r.date} after ${r.entry} ${r.doc}`); });
  say(`${n}: running balance equals Global Report figure ${m(target)} at: ${hits.join(' | ') || 'no date'}`);
  const at = (d) => { let x = 0; L.forEach((r) => { if (r.date <= d) x += r.amt; }); return m(x); };
  say(`${n}: balance on 2025-07-13 = ${at('2025-07-13')}`);
}

// --- pairing inside an account -------------------------------------------------------------
const day = (s) => Date.parse(s) / 864e5;
function pairAccount(L) {
  const inv = L.filter((r) => r.entry === 'Invoice').map((r) => ({ ...r, net: r.amt, via: [] }));
  const cns = L.filter((r) => r.entry === 'Crd Note');
  const cnUsed = new Set();
  const nr = (s) => s.replace(/\s+/g, '').toUpperCase();
  // 1) credit notes that cancel an invoice exactly (single, or two with same ref)
  for (const i of inv) {
    const same = cns.filter((c) => !cnUsed.has(c) && Math.abs(day(c.date) - day(i.date)) <= 45 && (nr(c.ref) === nr(i.ref) || c.date === i.date));
    const one = same.find((c) => -c.amt === i.net);
    if (one) { cnUsed.add(one); i.net = 0; i.via.push('CN ' + one.doc); continue; }
    outer: for (let a = 0; a < same.length; a++) for (let b = a + 1; b < same.length; b++) if (-(same[a].amt + same[b].amt) === i.net) { [same[a], same[b]].forEach((c) => { cnUsed.add(c); i.via.push('CN ' + c.doc); }); i.net = 0; break outer; }
  }
  // 2) remaining credit notes reduce the same-ref invoice that has a positive net
  for (const c of cns.filter((c) => !cnUsed.has(c))) {
    const i = inv.find((x) => x.net > -c.amt && nr(x.ref) === nr(c.ref) && Math.abs(day(x.date) - day(c.date)) <= 45);
    if (i) { i.net += c.amt; i.via.push('CN ' + c.doc); cnUsed.add(c); }
  }
  const pays = L.filter((r) => r.entry === 'Payment').sort(sortR);
  const link = new Map(); const spare = [];
  for (const p of pays) {
    const c = inv.filter((i) => i.net > 0 && !i.paid && i.net === -p.amt).sort((a, b) => Math.abs(day(a.date) - day(p.date)) - Math.abs(day(b.date) - day(p.date)))[0];
    if (c) { c.paid = p.doc; link.set(p, [c.doc]); } else spare.push(p);
  }
  // 3) leftover payments: try two open invoices of the same account (sum), within 60 days
  const openInv = () => inv.filter((i) => i.net > 0 && !i.paid);
  for (const p of spare.slice()) {
    const o = openInv().filter((i) => Math.abs(day(i.date) - day(p.date)) <= 60);
    let hit = null;
    for (let a = 0; a < o.length && !hit; a++) for (let b = a + 1; b < o.length; b++) if (o[a].net + o[b].net === -p.amt) { hit = [o[a], o[b]]; break; }
    if (hit) { hit.forEach((i) => (i.paid = p.doc)); link.set(p, hit.map((i) => i.doc)); spare.splice(spare.indexOf(p), 1); }
  }
  // 4) leftover invoices: try two leftover payments (split payment) within 60 days
  for (const i of openInv()) {
    const o = spare.filter((p) => Math.abs(day(i.date) - day(p.date)) <= 60);
    let hit = null;
    for (let a = 0; a < o.length && !hit; a++) for (let b = a + 1; b < o.length; b++) if (-(o[a].amt + o[b].amt) === i.net) { hit = [o[a], o[b]]; break; }
    if (hit) { i.paid = hit.map((p) => p.doc).join('+'); hit.forEach((p) => { link.set(p, [i.doc]); spare.splice(spare.indexOf(p), 1); }); }
  }
  return { inv, link, spare, openInv: openInv() };
}
const A1 = pairAccount(L1); const A2 = pairAccount(L2);

const y24 = (r) => r.date.startsWith('2024');
const fmt = (r) => `${r.doc} ${r.entry} ${r.date}${r.stat ? ' STAT' + r.stat : ''} ${m(r.amt)}`;
function table(name, L, A) {
  say(`\n## ${name} 2024 payments: own-account exact-amount pairing`);
  const rows = L.filter((r) => y24(r) && ['Payment', 'Bank UD', 'Journal', 'Ud Paymnt'].includes(r.entry));
  const stats = {};
  rows.forEach((r) => { if (r.entry === 'Payment' && r.stat) stats[r.stat] = (stats[r.stat] || 0) + 1; });
  const csv = ['account,doc,entry,date,stat,amount,pays_own_invoice,flag'];
  for (const r of rows) {
    const l = A.link.get(r);
    const flag = r.entry !== 'Payment' ? 'non-payment entry' : l ? '' : 'NO OWN INVOICE OF THIS AMOUNT';
    csv.push([name, r.doc, r.entry, r.date, r.stat, m(r.amt), l ? l.join('+') : '', flag].join(','));
    say(`${fmt(r)} -> ${l ? l.join('+') : '-'}${flag ? '   <-- ' + flag : ''}`);
  }
  fs.writeFileSync(path.join(OUT, `${name}_2024_payments.csv`), csv.join('\n') + '\n');
  say(`STAT repeats in 2024 (payments per STAT): ${Object.entries(stats).map(([k, v]) => `${k}:${v}`).join(' ')}`);
}
table('COF001', L1, A1); table('COF002', L2, A2);

say('\n## 2024-dated invoices with no own-account payment of the same net amount');
for (const [n, A] of [['COF001', A1], ['COF002', A2]]) A.openInv.filter(y24).forEach((i) => say(`${n}: ${fmt(i)} net ${m(i.net)} ${i.ref}`));
const cnSpare = (L, A) => L.filter((r) => r.entry === 'Crd Note' && y24(r));
say('\n## Open own-account leftovers that are 2024-dated, payments side (spare payments, 2024)');
for (const [n, A] of [['COF001', A1], ['COF002', A2]]) A.spare.filter(y24).forEach((p) => say(`${n}: ${fmt(p)}`));

// --- cross-account exact-sum tests -------------------------------------------------------------
say('\n## Cross-account exact-sum tests (2024 spare payments of one account vs open invoices of the other, exact and sums of up to 3)');
function subsets(items, target, maxN = 3) {
  const res = [];
  const go = (start, chosen, sum) => {
    if (chosen.length && sum === target) res.push(chosen.slice());
    if (chosen.length === maxN) return;
    for (let k = start; k < items.length; k++) { chosen.push(items[k]); go(k + 1, chosen, sum + items[k].net); chosen.pop(); }
  };
  go(0, [], 0);
  return res;
}
const cross = [];
for (const [from, to, ST, TA] of [['COF001', 'COF002', A1, A2], ['COF002', 'COF001', A2, A1]]) {
  for (const p of ST.spare.filter(y24)) {
    const pool = TA.openInv.filter((i) => Math.abs(day(i.date) - day(p.date)) <= 90);
    const hits = subsets(pool, -p.amt);
    const anyInv = TA.inv.filter((i) => i.amt === -p.amt || i.net === -p.amt);
    cross.push({ from, to, p, hits, anyInv });
    say(`${from} ${fmt(p)}  vs ${to} open invoices (+-90d): ${hits.length ? hits.map((h) => h.map((i) => `${i.doc} ${i.date} ${m(i.net)} [${i.ref}]`).join(' + ')).join(' || ') : 'none'}${anyInv.length ? `   (same amount exists as ${to} invoice: ${anyInv.map((i) => `${i.doc} ${i.date} ${i.paid ? 'paid by ' + i.paid : 'UNPAID'}`).join(', ')})` : ''}`);
  }
}

say('\n## Context only (outside the 2024 scope): spare payments of any year vs open invoices of the other account, exact amount, any date');
for (const [from, to, ST, TA] of [['COF001', 'COF002', A1, A2], ['COF002', 'COF001', A2, A1]]) {
  for (const p of ST.spare.filter((x) => !y24(x))) {
    const hit = TA.openInv.filter((i) => i.net === -p.amt);
    if (hit.length) say(`${from} ${fmt(p)} = ${to} open invoice ${hit.map((i) => `${i.doc} ${i.date} ${m(i.net)}`).join(', ')}`);
  }
}
const prec = L1.filter((r) => r.entry === 'Invoice' && r.amt === 799626);
say(`COF001 precedent: invoices of 7996.26: ${prec.map((r) => r.doc + ' ' + r.date).join(', ') || 'none'}; payments of 7996.26: ${L1.filter((r) => r.entry === 'Payment' && r.amt === -799626).map(fmt).join('; ')}`);

say('\n## Stock lines behind the candidate invoices (ERP RAW DATA/CURRENT.TXT, shared stock-line dump; ASSERTED, not a statement)');
{
  const sl = fs.readFileSync('ERP RAW DATA/CURRENT.TXT', 'utf8').split(/\r?\n/);
  const h = sl[0].match(/"((?:[^"]|"")*)"/g).map((x) => x.slice(1, -1));
  const ix = Object.fromEntries(h.map((k, i) => [k, i]));
  for (const l of sl.slice(1)) {
    const c = l.match(/"((?:[^"]|"")*)"|[^,]+/g);
    if (!c) continue;
    const v = c.map((x) => x.replace(/^"|"$/g, ''));
    if (['COF001', 'COF002'].includes(v[ix.ACCNO]) && ['00030276', '00031096', '00034681'].includes(v[ix.DOCNO])) {
      const line = +v[ix.QTY] * +v[ix.RETAIL];
      say(`${v[ix.ACCNO]} ${v[ix.DOCNO]} ${v[ix.DATE]} ${v[ix.STOCKNO]} ${v[ix.DESCRIPTION]} qty ${v[ix.QTY]} x ${v[ix.RETAIL]} = ${line.toFixed(2)} + line tax ${v[ix.LINETAX]} = ${(line + +v[ix.LINETAX]).toFixed(2)}`);
    }
  }
}

say('\n## Base rate: how often does one account invoice an amount the other also invoiced?');
const amts = (L, yr) => new Set(L.filter((r) => r.entry === 'Invoice' && r.amt > 100000 && (!yr || r.date.startsWith(yr))).map((r) => r.amt));
for (const yr of [null, '2024']) {
  const a = amts(L1, yr); const b = amts(L2, yr); const both = [...a].filter((x) => b.has(x));
  say(`${yr || 'all years'}: COF001 distinct invoice amounts > R1000: ${a.size}; COF002: ${b.size}; amounts invoiced in both accounts: ${both.length} (${both.map((x) => m(x)).join(', ')})`);
}

say('\n## Document-number adjacency across the two accounts, 2024 payment-type rows (|delta doc| <= 3)');
const FIRST = '010688c0b3c4dffe4b0ef6ccb1eeb184859d19cd'; // first COF002 CURRENT export, still carried UD payments
const udText = execFileSync('git', ['show', `${FIRST}:${BR}COF002_DEBENQ_CURRENT.TXT`], { maxBuffer: 1 << 26 }).toString('utf8');
const udParsed = parse(udText, 'CURRENT@010688c');
const udRows = udParsed.rows.filter((r) => r.entry === 'Ud Paymnt');
say(`first CURRENT export (${FIRST.slice(0, 7)}, header UD PAY/CHEQUES ${udParsed.hdr['UD PAY/CHEQUES:']}) carried: ${udRows.map(fmt).join('; ')}`);
const converted = udRows.map((u) => { const t = L2.find((r) => r.entry === 'Payment' && r.date === u.date && r.amt === u.amt); return `${u.doc} -> ${t ? t.doc + ' STAT' + t.stat : 'no payment twin'}`; });
say(`UD rows vs later Payment rows (same date and amount in the later export): ${converted.join('; ')}`);
const tagAcct = (L, n) => L.filter((r) => ['Payment', 'Bank UD', 'Ud Paymnt'].includes(r.entry)).map((r) => ({ ...r, acct: n }));
const all = [...tagAcct(L1, 'COF001'), ...tagAcct(L2, 'COF002'), ...tagAcct(udRows, 'COF002')];
const own = (a) => ((a.acct === 'COF001' ? A1 : A2).link.get((a.acct === 'COF001' ? L1 : L2).find((r) => r.doc === a.doc && r.entry === a.entry)) || ['-']).join('+');
for (const a of all.filter((r) => r.acct === 'COF001' && y24(r))) for (const b of all.filter((r) => r.acct === 'COF002' && (y24(r)))) if (Math.abs(+a.doc - +b.doc) <= 3) say(`COF001 ${fmt(a)} | COF002 ${fmt(b)} | own-account invoice: ${own(a)} / ${b.entry === 'Ud Paymnt' ? 'UD row' : own(b)}`);

say('\n## Document-number "era" vs ledger date (payment-type rows, both accounts, 2023-09..2025-01; era = median date of the 4 nearest doc numbers)');
const spine = all.filter((r) => r.date >= '2023-09-01' && r.date <= '2025-01-31');
const med = (a) => a.sort()[Math.floor(a.length / 2)];
const outl = [];
for (const r of spine) {
  const nb = spine.filter((x) => x !== r).sort((a, b) => Math.abs(+a.doc - +r.doc) - Math.abs(+b.doc - +r.doc)).slice(0, 4);
  const era = med(nb.map((x) => x.date));
  const gap = Math.round(day(r.date) - day(era));
  if (Math.abs(gap) > 20) outl.push({ r, era, gap });
}
outl.sort((a, b) => +a.r.doc - +b.r.doc).forEach(({ r, era, gap }) => say(`${r.acct} ${fmt(r)}: doc number sits in the ${era} era, ledger date is ${gap > 0 ? gap + ' days later' : -gap + ' days earlier'}`));

fs.writeFileSync(path.join(OUT, 'report.txt'), log.join('\n') + '\n');
