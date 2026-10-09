#!/usr/bin/env node
/**
 * Matcher change preview: what would the CURRENT matcher do to each account, compared with the
 * committed data/projection_matches.json? Writes NOTHING to any account.
 *
 *   node analysis/debtors/shared/scripts/matcher_preview.mjs [--debtor A,B] [--out report.md]
 *
 * Per account: tie counts by rule (before/after), open rows (internal + customer views) before/after,
 * proof / lock conflicts, probable ties that would override a locked or confirmed tie's rows
 * (none can: locks run first), rows that change status, and the BALANCE_ZERO cut.
 * PROPOSED — NOT RATIFIED.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchAccount } from './match_account.mjs';
import { buildOpenItems } from './open_items.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : undefined; };
const only = arg('--debtor')?.split(',').map((s) => s.trim().toUpperCase());
const outFile = arg('--out');
const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const base = path.join(ROOT, 'analysis/debtors');
const codes = fs.readdirSync(base).filter((c) => fs.existsSync(path.join(base, c, 'data/v5_projection.json')) && (!only || only.includes(c))).sort();

const byRule = (ties) => { const o = {}; for (const t of ties) { o[t.rule] = o[t.rule] || { c: 0, p: 0 }; o[t.rule][t.confidence === 'CONFIRMED' ? 'c' : 'p'] += 1; } return o; };
const ruleStr = (o) => Object.entries(o).map(([k, v]) => `${k} ${v.c}${v.p ? `+${v.p}?` : ''}`).join(', ');
const L = ['# Matcher preview', '', `Generated ${new Date().toISOString().slice(0, 10)} by \`matcher_preview.mjs\`. Compares the current matcher with each account's committed \`projection_matches.json\`. **Nothing was written to any account.** PROPOSED — NOT RATIFIED.`, ''];
const summary = [];
const detail = [];
for (const code of codes) {
  const acct = path.join(base, code);
  let before = null;
  try { before = JSON.parse(fs.readFileSync(path.join(acct, 'data/projection_matches.json'), 'utf8')); } catch { /* none */ }
  const run = matchAccount(ROOT, code);
  if (!run.ok) { summary.push(`| ${code} | — | — | — | — | — | **REFUSED:** ${run.reasons.join('; ')} |`); continue; }
  const { projection, result } = run;
  const after = { ...result, projection: { txtSha256: projection.source.txtSha256 }, ties: result.ties };
  const open = (m, view) => { try { const mm = { ...m, projection: { ...(m.projection || {}), txtSha256: projection.source.txtSha256 } }; const o = buildOpenItems(projection, mm, view, { namedResiduals: run.cfg?.namedResiduals }); return { n: o.parts.lpg.lines.length + o.parts.cyl.lines.length, ties: o.proof.tiesToErp, bal: o.proof.combined }; } catch (e) { return { n: null, err: e.message }; } };
  const b = before ? { int: open(before, 'internal'), cus: open(before, 'customer') } : null;
  const a = { int: open(after, 'internal'), cus: open(after, 'customer') };
  const rowStatus = (m) => { const mp = new Map(); for (const t of m.ties) for (const id of t.members) mp.set(id, t); return mp; };
  const bm = before ? rowStatus(before) : new Map();
  const am = rowStatus(after);
  let changed = 0, nowSettled = 0, nowOpen = 0;
  const lockedBefore = new Set((before?.ties || []).filter((t) => t.rule === 'LOCKED').flatMap((t) => t.members));
  const lockedAfter = new Set(after.ties.filter((t) => t.rule === 'LOCKED').flatMap((t) => t.members));
  const lockDrift = [...lockedBefore].filter((id) => !lockedAfter.has(id)).length;
  for (const r of projection.rows) {
    const x = bm.get(r.row_id), y = am.get(r.row_id);
    if (!!x !== !!y) { changed += 1; if (y) nowSettled += 1; else nowOpen += 1; }
  }
  const bz = after.ties.find((t) => t.rule === 'BALANCE_ZERO');
  const conf = result.lockConflicts.length;
  const flags = [];
  if (!result.proof.holds) flags.push('PROOF FAILS');
  if (conf) flags.push(`${conf} lock conflict(s)`);
  if (lockDrift) flags.push(`${lockDrift} locked row(s) no longer locked`);
  if (nowOpen) flags.push(`${nowOpen} row(s) newly OPEN`);
  if (!a.int.ties) flags.push('does not tie to ERP');
  summary.push(`| ${code} | ${before ? `${before.summary.ties}` : '—'} → ${result.summary.ties} | ${b ? `${b.int.n} → ${a.int.n}` : `— → ${a.int.n}`} | ${b ? `${b.cus.n} → ${a.cus.n}` : `— → ${a.cus.n}`} | ${result.summary.paymentsUnallocated} | ${bz ? `line ${bz.throughLine} (${bz.throughDate})` : '—'} | ${flags.length ? `**${flags.join('; ')}**` : 'clean'} |`);
  detail.push(`### ${code}`, '', `- Ties before: ${before ? `v${before.matcherVersion}: ${ruleStr(byRule(before.ties))}` : 'none'}`, `- Ties after (v${result.matcherVersion}): ${ruleStr(byRule(after.ties))}`,
    `- Open rows internal ${b ? b.int.n : '—'} → ${a.int.n}; customer ${b ? b.cus.n : '—'} → ${a.cus.n}. Balance R${fmt(a.int.bal)} (ERP R${fmt(projection.source.erpCurrentBalance)}).`,
    `- Rows changing status: ${changed} (${nowSettled} now settled, ${nowOpen} now open). Locks applied ${result.locksApplied}, conflicts ${conf}, closedThrough ${result.closedThrough ?? '—'}.`);
  if (bz) detail.push(`- BALANCE_ZERO: ${bz.members.length} rows through line ${bz.throughLine}; dissolved probable: ${bz.dissolvedProbable.length ? bz.dissolvedProbable.map((d) => `${d.rule} ${d.docs.join('+')}`).join('; ') : 'none'}; opening settled R${fmt(bz.openingSettled)}.`);
  const pr = after.ties.filter((t) => t.confidence === 'PROBABLE');
  if (pr.length) detail.push(`- Probable ties needing approval (${pr.length}): ${pr.slice(0, 12).map((t) => `${t.tie_id} ${t.rule} ${t.docs.join(' + ')}`).join(' | ')}${pr.length > 12 ? ' …' : ''}`);
  const ua = result.unallocatedPayments.map((id) => projection.rows.find((r) => r.row_id === id)).filter(Boolean);
  if (ua.length) detail.push(`- Unallocated payments (${ua.length}, R${fmt(-ua.reduce((s, r) => s + r.amount, 0))}): ${ua.map((r) => `${r.clean_doc} R${fmt(-r.amount)}`).join(', ')}`);
  for (const c of result.lockConflicts) detail.push(`- LOCK CONFLICT ${c.lock_id}: ${c.problems.join('; ')}`);
  detail.push('');
}
L.push('| Account | Ties | Open rows (internal) | Open rows (customer) | Unallocated pmts | BALANCE_ZERO cut | Check |', '| :--- | :--- | :--- | :--- | ---: | :--- | :--- |', ...summary, '', '## Detail', '', ...detail);
const md = `${L.join('\n')}\n`;
if (outFile) { fs.writeFileSync(path.resolve(outFile), md); console.log(`Written ${outFile}`); } else process.stdout.write(md);
