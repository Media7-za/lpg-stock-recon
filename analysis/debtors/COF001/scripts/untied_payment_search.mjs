#!/usr/bin/env node
/**
 * Read-only trial helper for SKILL_Untied_Payment_Evidence (draft): lists the matcher's untied rows,
 * classifies untied payments (LANE / ADVANCE / DUPLICATE / REVERSAL / CREDIT / UNKNOWN candidates) and runs the
 * bounded exact-sum search (payments <= K vs open invoices <= K) over the matcher's residual only.
 *   node analysis/debtors/COF001/scripts/untied_payment_search.mjs [--debtor COF001] [--k 4] [--tol 0] [--out DIR]
 * Inputs: data/v5_projection.json, data/projection_matches.json. Writes nothing but --out files. No DB, no config writes.
 */
import fs from 'fs';
import path from 'path';

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const code = (arg('--debtor', 'COF001')).toUpperCase();
const K = Number(arg('--k', 4));
const TOL = Math.round(Number(arg('--tol', 0)) * 100);
const outDir = arg('--out', null);
const base = path.resolve('analysis/debtors', code);
const P = JSON.parse(fs.readFileSync(path.join(base, 'data/v5_projection.json'), 'utf8'));
const M = JSON.parse(fs.readFileSync(path.join(base, 'data/projection_matches.json'), 'utf8'));
const R = new Map(P.rows.map((r) => [r.row_id, r]));
const c = (r) => Math.round(Math.abs(r.amount) * 100);
const tieOf = new Map();
for (const t of M.ties) for (const m of t.members) tieOf.set(m, t);
const rowsOf = (key) => M.residual[key].rows.map((s) => R.get(s)).filter(Boolean);

const pay = rowsOf('unallocatedPayments').filter((r) => r.entry_type === 'Payment');
const other = rowsOf('unallocatedPayments').filter((r) => r.entry_type !== 'Payment');
const inv = [...rowsOf('openInvoicesLpgOther'), ...rowsOf('openInvoicesCyl')];
const untiedOther = rowsOf('otherUntied');

// bounded exact-sum search
function subsets(items, k) {
  const out = [];
  const rec = (start, cur) => { if (cur.length) out.push(cur.slice()); if (cur.length === k) return; for (let i = start; i < items.length; i++) { cur.push(items[i]); rec(i + 1, cur); cur.pop(); } };
  rec(0, []);
  return out;
}
const sum = (s) => s.reduce((a, r) => a + c(r), 0);
const invSubsets = subsets(inv, K);
const bySum = new Map();
for (const s of invSubsets) { const k = sum(s); if (!bySum.has(k)) bySum.set(k, []); bySum.get(k).push(s); }
const hits = [];
for (const ps of subsets(pay, K)) {
  const t = sum(ps);
  for (let d = -TOL; d <= TOL; d++) for (const is of bySum.get(t + d) || []) hits.push({ pay: ps, inv: is, diff: d });
}
const idset = (s) => new Set(s.map((r) => r.row_id));
const isSubset = (a, b) => [...a].every((x) => b.has(x));
// minimal structures: no other hit with payments subset AND invoices subset (strictly smaller)
const minimal = hits.filter((h) => !hits.some((g) => g !== h && isSubset(idset(g.pay), idset(h.pay)) && isSubset(idset(g.inv), idset(h.inv)) && (g.pay.length < h.pay.length || g.inv.length < h.inv.length)));
// collapse interchangeable equal-amount structures by amount signature
const sig = (h) => `${h.pay.map(c).sort().join('+')}=${h.inv.map(c).sort().join('+')}`;
const structures = new Map();
for (const h of minimal) { const k = sig(h); if (!structures.has(k)) structures.set(k, { sig: k, count: 0, example: h }); structures.get(k).count++; }

const fmt = (n) => n.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const label = (r) => `${r.entry_type[0]}${r.doc_no.replace(/^0+/, '')}(${r.lane}${r.date ? ' ' + r.date : ''} ${fmt(r.amount)})`;

// classification tests per payment
const settledBy = (invRow) => { const t = tieOf.get(invRow.row_id); return t ? t.members.map((m) => R.get(m)).filter((x) => x && x.entry_type === 'Payment') : []; };
const classes = pay.map((p) => {
  const a = c(p);
  const tags = [];
  const notes = [];
  // DUPLICATE: an invoice of equal amount already settled by another payment
  const dupInv = P.rows.filter((r) => r.entry_type === 'Invoice' && c(r) === a && settledBy(r).some((x) => x.row_id !== p.row_id));
  if (dupInv.length) { tags.push('DUPLICATE?'); notes.push(`equals invoice(s) ${dupInv.map((r) => r.doc_no.replace(/^0+/, '') + ' settled by ' + settledBy(r).map((x) => x.doc_no.replace(/^0+/, '')).join('/')).join('; ')}`); }
  // REVERSAL: opposite-sign journal/credit of same amount within 60 days
  const rev = P.rows.filter((r) => ['Journal', 'Crd Note'].includes(r.entry_type) && c(r) === a && Math.sign(r.amount) !== Math.sign(p.amount) && Math.abs((new Date(r.date) - new Date(p.date)) / 864e5) <= 60);
  if (rev.length) { tags.push('REVERSAL?'); notes.push(`opposite-sign ${rev.map((r) => r.entry_type + ' ' + r.doc_no.replace(/^0+/, '') + ' ' + r.date).join('; ')}`); }
  // structures
  const ss = minimal.filter((h) => h.pay.some((x) => x.row_id === p.row_id));
  for (const h of ss) {
    if (h.inv.some((i) => i.lane !== p.lane)) tags.push('LANE?');
    if (h.inv.every((i) => new Date(i.date) > new Date(p.date))) tags.push('ADVANCE?');
  }
  if (ss.length) notes.push(`exact-sum structure ${sig(ss[0])}`);
  if (!ss.length && !dupInv.length && !rev.length) tags.push('CREDIT/UNKNOWN');
  return { doc: p.doc_no.replace(/^0+/, ''), date: p.date, ref: p.ref_no, amount: p.amount, lane: p.lane, tags: [...new Set(tags)], notes };
});

const lines = [];
lines.push(`# ${code} untied payments: script output (read-only)`);
lines.push(`matcher ${M.matcherVersion} generated ${M.generatedAt}; ERP ${P.source.erpCurrentBalance}; txt sha ${P.source.txtSha256.slice(0, 12)}; K=${K}, tol=${TOL / 100}`);
lines.push(`\n## Untied payments (${pay.length}) total ${fmt(pay.reduce((a, r) => a + r.amount, 0))}`);
for (const p of pay.sort((a, b) => a.txt_line - b.txt_line)) lines.push(`- ${label(p)} ${p.ref_no}`);
lines.push(`\n## Other untied rows`);
for (const r of [...other, ...untiedOther]) lines.push(`- ${label(r)} ${r.ref_no}`);
lines.push(`\n## Open invoices (${inv.length}) total ${fmt(inv.reduce((a, r) => a + r.amount, 0))}`);
for (const r of inv.sort((a, b) => a.txt_line - b.txt_line)) lines.push(`- ${label(r)}`);
lines.push(`\n## Classification tests`);
for (const k of classes) lines.push(`- ${k.doc} ${k.date} ${fmt(k.amount)} ${k.lane}: ${k.tags.join(',') || 'none'} | ${k.notes.join(' | ')}`);
lines.push(`\n## Minimal exact-sum structures (${structures.size}), hits before collapsing ${hits.length}`);
for (const s of structures.values()) { const h = s.example; lines.push(`- ${s.sig} cents x${s.count} interchangeable: payments ${h.pay.map(label).join(' + ')} vs invoices ${h.inv.map(label).join(' + ')} diff ${h.diff}c`); }
const out = lines.join('\n') + '\n';
console.log(out);
if (outDir) { fs.mkdirSync(outDir, { recursive: true }); fs.writeFileSync(path.join(outDir, `${code}_untied_payment_search_tol${TOL / 100}.txt`), out); }
