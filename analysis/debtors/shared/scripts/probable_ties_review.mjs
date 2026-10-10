#!/usr/bin/env node
/**
 * Probable ties grouped by rule and evidence, across all projected accounts. Read-only.
 *
 *   node analysis/debtors/shared/scripts/probable_ties_review.mjs [--debtor A,B] [--out report.md]
 *
 * Groups (so the operator can approve a whole group, and so approvals can calibrate the matcher):
 *   CN-DN-1  credit note pairs with the same delivery-note number, exact opposite amount, lag 2-7 days
 *   CN-DN-2  same, lag 8-31 days
 *   CN-DN-3  same, lag over 31 days
 *   CN-AD    credit note pairs matched on exact amount + date only (no delivery-note number)
 *   PAY-PROX payment within +-R5.00 of one invoice (variance)
 *   PAY-NEAR payment within +-R1.00 of 2-3 invoices (variance)
 *   PAY-BATCH payments settling a whole delivery batch (BATCH_SUM)
 *   PAY-RUN  run of 4-12 consecutive invoices where an equal run exists (ambiguous)
 *   REMIT    remittance tie with line discrepancies
 *   OTHER    anything else (e.g. a confirmable=false downgrade)
 * Only zero-net ties (|net| <= R0.05) can be approved with `approve_tie.mjs --ties`; the rest need a treatment.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchAccount } from './match_account.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : undefined; };
const only = arg('--debtor')?.split(',').map((s) => s.trim().toUpperCase());
const outFile = arg('--out');
const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const base = path.join(ROOT, 'analysis/debtors');
const codes = fs.readdirSync(base).filter((c) => fs.existsSync(path.join(base, c, 'data/v5_projection.json')) && (!only || only.includes(c))).sort();

export function groupOf(t) {
  if (t.rule === 'CN_DN_PAIR') return t.lagDays <= 7 ? 'CN-DN-1' : t.lagDays <= 31 ? 'CN-DN-2' : 'CN-DN-3';
  if (t.rule === 'CN_AMOUNT_DATE') return 'CN-AD';
  if (t.rule === 'PROXIMITY') return 'PAY-PROX';
  if (t.rule === 'NEAR_SUM') return 'PAY-NEAR';
  if (t.rule === 'BATCH_SUM') return 'PAY-BATCH';
  if (t.rule === 'EXACT_RUN') return 'PAY-RUN';
  if (t.rule === 'REMITTANCE') return 'REMIT';
  return 'OTHER';
}
const NAME = { 'CN-DN-1': 'CN pair, same DN, exact amount, lag 2-7 days', 'CN-DN-2': 'CN pair, same DN, exact amount, lag 8-31 days', 'CN-DN-3': 'CN pair, same DN, exact amount, lag over 31 days', 'CN-AD': 'CN pair, exact amount + date only (no DN)', 'PAY-PROX': 'payment within R5.00 of one invoice', 'PAY-NEAR': 'payment within R1.00 of 2-3 invoices', 'PAY-BATCH': 'payments settling a delivery batch', 'PAY-RUN': 'ambiguous run of 4-12 invoices', REMIT: 'remittance tie with line discrepancies', OTHER: 'other' };

function main() {
const rowsOut = [];
const perAcct = {};
for (const code of codes) {
  const run = matchAccount(ROOT, code);
  if (!run.ok) { perAcct[code] = { refused: run.reasons.join('; ') }; continue; }
  const rowById = new Map(run.projection.rows.map((r) => [r.row_id, r]));
  perAcct[code] = {};
  for (const t of run.result.ties.filter((x) => x.confidence === 'PROBABLE')) {
    const g = groupOf(t);
    const mem = t.members.map((id) => rowById.get(id)).filter(Boolean);
    const gross = Math.round(mem.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0) * 100) / 100;
    const lanes = [...new Set(mem.map((r) => r.lane))].join('+');
    const dates = mem.map((r) => r.date).sort();
    rowsOut.push({ code, g, tie: t.tie_id, rule: t.rule, net: t.net, zero: Math.abs(t.net) <= 0.05, gross, lanes, lag: t.lagDays ?? null, docs: t.docs.join(' + '), from: dates[0], to: dates.at(-1), alt: t.ambiguousAlternatives || 0, inClosed: Boolean(t.inClosedPeriod) });
    perAcct[code][g] = (perAcct[code][g] || 0) + 1;
  }
}
const groups = [...new Set(rowsOut.map((r) => r.g))].sort();
const L = ['# Probable ties by group', '', `Generated ${new Date().toISOString().slice(0, 10)} by \`probable_ties_review.mjs\`. Read-only. ${rowsOut.length} probable ties across ${codes.length} accounts. PROPOSED until approved (an approval records an operator ruling as a lock).`, ''];
L.push('| Group | What it is | Ties | Zero-net | Gross (R) | ' + codes.join(' | ') + ' |', '| :--- | :--- | ---: | ---: | ---: | ' + codes.map(() => '---:').join(' | ') + ' |');
for (const g of groups) {
  const rs = rowsOut.filter((r) => r.g === g);
  L.push(`| **${g}** | ${NAME[g]} | ${rs.length} | ${rs.filter((r) => r.zero).length} | ${fmt(rs.reduce((s, r) => s + r.gross, 0))} | ${codes.map((c) => perAcct[c][g] || '').join(' | ')} |`);
}
L.push('', '## Detail', '');
for (const g of groups) {
  L.push(`### ${g}: ${NAME[g]}`, '', '| Account | Tie | Documents | Lanes | Dates | Lag (d) | Net (R) | Gross (R) | Note |', '| :--- | :--- | :--- | :--- | :--- | ---: | ---: | ---: | :--- |');
  for (const r of rowsOut.filter((x) => x.g === g)) L.push(`| ${r.code} | ${r.tie} | ${r.docs} | ${r.lanes} | ${r.from}${r.to !== r.from ? ' → ' + r.to : ''} | ${r.lag ?? '—'} | ${fmt(r.net)} | ${fmt(r.gross)} | ${[r.inClosed ? 'closed period' : '', r.alt ? `${r.alt} equal alternative(s)` : '', r.zero ? '' : 'needs a treatment'].filter(Boolean).join('; ')} |`);
  L.push('');
}
const md = `${L.join('\n')}\n`;
if (outFile) { fs.writeFileSync(path.resolve(outFile), md); console.log(`Written ${outFile}`); } else process.stdout.write(md);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
