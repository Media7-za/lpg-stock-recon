#!/usr/bin/env node
/**
 * Build RED001 Delivery Event Ledger from TXT + vw_clean_transactions.
 */
import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { pgClientOptions } from '../../shared/scripts/require_database_url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TXT_PATH = path.join(ROOT, 'raw/RED001CURRENT.TXT');
const OUT_PATH = path.join(ROOT, 'reports/RED001_Delivery_Event_Ledger_v1.md');

const fmt = (n) =>
  `R${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const parseLine = (line) => {
  const p = [];
  let cur = '';
  let inQ = false;
  for (const c of line) {
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (c === ',' && !inQ) {
      p.push(cur);
      cur = '';
      continue;
    }
    cur += c;
  }
  p.push(cur);
  return {
    doc: p[2]?.replace(/^0+/, ''),
    entry: p[3],
    date: p[4],
    ref: (p[6] || '').trim(),
    amt: +p[9],
  };
};

const dnKey = (ref) => {
  const s = ref.replace(/-EMPTY.*|EMPTY.*|EMPTIES.*/i, '').replace(/=EMPTY/i, '').trim();
  const m = s.match(/DN[#*-]?\s*(\d+)/i) || s.match(/D\/N\s*(\d+)/i);
  return m ? m[1] : null;
};

const isEmptyRef = (ref) => /EMPTY|EMPTIES/i.test(ref);
const CYL_AMTS = new Set([4830, 7245, 6037.5, 3622.5, 1207.5]);

const fmtD = (d) => {
  const [dd, mm, yy] = d.split('/');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${dd} ${months[+mm - 1]} ${yy}`;
};

const txt = fs.readFileSync(TXT_PATH, 'utf8');
const rows = txt.split('\n').filter((l) => l.match(/^"[0-9]/)).map(parseLine);

const c = new pg.Client(pgClientOptions());
await c.connect();

async function docLines(doc) {
  const r = await c.query(
    `SELECT debt_group, stock_no, category, qty::numeric qty, ROUND(line_total::numeric,2) lt
     FROM (
       SELECT DISTINCT ON (stock_no,category,qty,line_total,debt_group)
         debt_group, stock_no, category, qty, line_total
       FROM vw_clean_transactions
       WHERE account_no='RED001' AND LTRIM(doc_no,'0')=$1
       ORDER BY stock_no,category,qty,line_total,debt_group,id DESC
     ) x`,
    [doc],
  );
  return r.rows;
}

const docMeta = new Map();
for (const r of rows.filter((x) => x.entry === 'Invoice' || x.entry === 'Crd Note')) {
  const lines = await docLines(r.doc);
  const lpg = lines.filter((l) => l.debt_group === 'LPG');
  const cyl = lines.filter((l) => l.debt_group === 'CYL');
  let lane = 'UNK';
  if (lpg.length && !cyl.length) lane = 'LPG';
  else if (cyl.length && !lpg.length) lane = 'CYL';
  else if (isEmptyRef(r.ref) || (r.entry === 'Invoice' && CYL_AMTS.has(r.amt))) lane = 'CYL';
  else if (r.entry === 'Invoice') lane = 'LPG';
  else lane = cyl.length ? 'CYL' : lpg.length ? 'LPG' : isEmptyRef(r.ref) ? 'CYL' : 'UNK';
  const lpgQty = lpg.reduce((s, l) => s + Number(l.qty), 0) || null;
  const cylQty = cyl.reduce((s, l) => s + Math.abs(Number(l.qty)), 0) || null;
  docMeta.set(r.doc, { lane, lines, lpgQty, cylQty });
}

const byDn = new Map();
for (const r of rows.filter((x) => x.entry === 'Invoice' || x.entry === 'Crd Note')) {
  const dn = dnKey(r.ref);
  if (!dn) continue;
  if (!byDn.has(dn)) byDn.set(dn, { dn, docs: [] });
  byDn.get(dn).docs.push({ ...r, ...docMeta.get(r.doc) });
}

for (const v of byDn.values()) {
  v.docs.sort((a, b) => a.date.localeCompare(b.date) || a.doc.localeCompare(b.doc));
  v.gas = v.docs.filter((d) => d.lane === 'LPG' && d.entry === 'Invoice');
  v.cyl = v.docs.filter((d) => d.lane === 'CYL' && d.entry === 'Invoice');
  v.cn = v.docs.filter((d) => d.entry === 'Crd Note');
  v.gasAmt = v.gas.reduce((s, d) => s + d.amt, 0);
  v.cylAmt = v.cyl.reduce((s, d) => s + d.amt, 0);
  v.cnAmt = v.cn.reduce((s, d) => s + d.amt, 0);
  v.net = v.gasAmt + v.cylAmt + v.cnAmt;
  const sameDayPair = v.gas.some((g) => v.cyl.some((cy) => cy.date === g.date));
  v.pattern =
    v.gas.length === 0
      ? 'CYL_ONLY'
      : v.cyl.length === 0
        ? 'GAS_ONLY'
        : sameDayPair
          ? 'PAIRED'
          : 'PAIRED_OTHER_DAY';
  if (v.dn === '20157') v.pattern = 'PAIRED_CN_DISTORTED';
  if (v.dn === '213454') v.pattern = 'CYL_ORPHAN';
}

const events = [...byDn.values()].sort((a, b) => {
  const da = a.docs[0]?.date.split('/').reverse().join('-');
  const db = b.docs[0]?.date.split('/').reverse().join('-');
  return da.localeCompare(db) || a.dn.localeCompare(b.dn, undefined, { numeric: true });
});

await c.end();

const summary = {
  dns: events.length,
  lpgEvents: events.reduce((s, d) => s + d.gas.length, 0),
  cylEvents: events.reduce((s, d) => s + d.cyl.length, 0),
  paired: events.filter(
    (d) => d.pattern === 'PAIRED' || d.pattern === 'PAIRED_CN_DISTORTED' || d.pattern === 'PAIRED_OTHER_DAY',
  ).length,
  gasOnly: events.filter((d) => d.pattern === 'GAS_ONLY').length,
};

const lines = [];
lines.push('# RED001 Delivery Event Ledger (v1)\n');
lines.push('**Account:** RED001 — REDLANDS HOTEL  ');
lines.push('**Period:** May 2025 → Jul 2026  ');
lines.push('**Sources:** `raw/RED001CURRENT.TXT` (manifest) + `vw_clean_transactions` (LPG/CYL line split)  ');
lines.push('**Generated:** 2026-07-29  ');
lines.push(
  '**Purpose:** Operator ratification — one row per delivery note (DN), with gas invoice, cylinder invoice, and credit notes.\n',
);
lines.push('---\n');
lines.push('## Summary\n');
lines.push('| Metric | Count |');
lines.push('| :--- | ---: |');
lines.push(`| Delivery notes (DN events) | **${summary.dns}** |`);
lines.push(`| LPG gas invoices | **${summary.lpgEvents}** |`);
lines.push(`| CYL deposit invoices | **${summary.cylEvents}** |`);
lines.push(`| Paired events (gas + cyl) | **${summary.paired}** |`);
lines.push(`| Gas-only (refill — no cyl inv) | **${summary.gasOnly}** |`);
lines.push('| CYL-only orphan | **1** (DN 213454 — typo ref) |\n');
lines.push('### Pattern key\n');
lines.push('| Pattern | Meaning |');
lines.push('| :--- | :--- |');
lines.push('| **PAIRED** | Same-day LPG + CYL invoices on same DN |');
lines.push('| **GAS_ONLY** | LPG invoice only — refill on existing cylinders |');
lines.push('| **CYL_ONLY** | Deposit invoice without LPG on same DN |');
lines.push('| **PAIRED_CN_DISTORTED** | Paired but CN chain breaks deposit logic (DN 20157) |\n');
lines.push('---\n');
lines.push('## Event ledger (by delivery note)\n');

for (const ev of events) {
  lines.push(`### DN ${ev.dn} — **${ev.pattern}**\n`);
  lines.push('| Date | Type | Doc # | Lane | Ref | Amount | Qty | Line detail |');
  lines.push('| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |');
  for (const d of ev.docs) {
    const qty = d.lane === 'LPG' ? (d.lpgQty ?? '—') : d.lane === 'CYL' ? (d.cylQty ?? '—') : '—';
    const detail = (d.lines || []).map((l) => `${l.stock_no} ${l.category} ×${l.qty}`).join('; ') || '—';
    lines.push(
      `| ${fmtD(d.date)} | ${d.entry} | ${d.doc} | ${d.lane} | ${d.ref} | ${fmt(d.amt)} | ${qty} | ${detail} |`,
    );
  }
  lines.push('');
  lines.push(
    `| | **Net financial (DN)** | | | | **${fmt(ev.net)}** | | Gas ${fmt(ev.gasAmt)} + Cyl ${fmt(ev.cylAmt)} + CN ${fmt(ev.cnAmt)} |`,
  );
  lines.push('');

  if (ev.pattern === 'GAS_ONLY') {
    lines.push('> **Ratification:** Gas-only refill — no `-EMPTY` deposit invoice expected.\n');
  }
  if (ev.pattern === 'CYL_ORPHAN') {
    lines.push(
      '> **Ratification:** CYL invoice only; ref typo (`DN-213454`). CN 14798 reverses. No LPG delivery on this DN.\n',
    );
  }
  if (ev.pattern === 'PAIRED_CN_DISTORTED') {
    lines.push(
      '> **Ratification:** CN 13187 reverses same-day deposit (45541). CN 13687 (Oct) returns **7 cyl** (−R8,452.50) vs **6 delivered** — Part 1B −R7,245 anchor. ERP ref on 13687 mispoints to LPG inv 45540.\n',
    );
  }
  if (ev.dn === '22741') {
    lines.push(
      '> **Ratification:** Split delivery — 2 LPG + 2 CYL same day. Check qty match on 50780 (5 gas) vs 50777 (4 deposit).\n',
    );
  }
  if (ev.dn === '22974') {
    lines.push(
      '> **Ratification:** Duplicate LPG inv 52042 + 52086; CN 15325 reverses 52042. Net open LPG = 52086 (R4,434.42).\n',
    );
  }
}

lines.push('---\n');
lines.push('## Gas-only events (no CYL invoice)\n');
lines.push('| DN | Date | LPG doc | Amount | Operator sign-off |');
lines.push('| :--- | :--- | :--- | ---: | :--- |');
for (const ev of events.filter((e) => e.pattern === 'GAS_ONLY')) {
  const g = ev.gas[0];
  lines.push(`| ${ev.dn} | ${fmtD(g.date)} | ${g.doc} | ${fmt(g.amt)} | ☐ Refill confirmed |`);
}

lines.push('\n---\n');
lines.push('## Operator ratification checklist\n');
lines.push('| # | Item | Status |');
lines.push('| :---: | :--- | :---: |');
lines.push('| 1 | All **PAIRED** events have same-day gas + deposit | ☐ |');
lines.push('| 2 | All **GAS_ONLY** events are refills (no new cylinders) | ☐ |');
lines.push('| 3 | DN **20157** / CN **13687** corrected or accepted | ☐ |');
lines.push('| 4 | DN **22974** duplicate inv **52086** resolved in ERP | ☐ |');
lines.push('| 5 | DN **213454** orphan **50346** accepted as typo/reversal | ☐ |');
lines.push('| 6 | DN **22741** qty mismatch reviewed | ☐ |\n');
lines.push('---\n');
lines.push('*Internal workspace artifact — `analysis/debtors/RED001/reports/RED001_Delivery_Event_Ledger_v1.md`*\n');

fs.writeFileSync(OUT_PATH, lines.join('\n'));
console.log(`Wrote ${OUT_PATH} (${lines.length} lines)`);
