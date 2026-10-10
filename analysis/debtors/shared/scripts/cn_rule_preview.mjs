#!/usr/bin/env node
/**
 * Preview of proposed rule R1: "confirm a same-delivery-note credit-note pair up to N days after the invoice
 * when no rival exists" (matcher rule CN_DN_PAIR, option cnRivalFreeMaxDays; default 0 = off). Read-only.
 *
 *   node analysis/debtors/shared/scripts/cn_rule_preview.mjs [--days 3,5,7,14,31] [--propose 5] [--out report.md]
 *
 * Counterfactual: the baseline leaves out the 2026-10-10 group-approval locks ("what would the matcher say before
 * those approvals"). Per account and per N it counts the pairs the rule would confirm, and the effect on the open
 * items (internal and customer view). For the proposed N it also checks the rule against the operator's own
 * approvals: does it confirm exactly the same-DN pairs the operator approved in groups, and nothing else?
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { matchAccount } from './match_account.mjs';
import { buildOpenItems } from './open_items.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : undefined; };
const DAYS = (arg('--days') || '3,5,7,14,31').split(',').map(Number);
const PROPOSE = Number(arg('--propose') || 5);
const outFile = arg('--out');
const GROUP_MARK = 'approved as groups CN-DN-1 and CN-AD';
const base = path.join(ROOT, 'analysis/debtors');
const codes = fs.readdirSync(base).filter((c) => fs.existsSync(path.join(base, c, 'data/v5_projection.json'))).sort();
const rowKey = (r) => `${r.clean_doc}|${r.entry_type}|${r.lane}|${r.date}|${Number(r.amount).toFixed(2)}`;
const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function openRows(run, matches) {
  const mm = { ...matches, projection: { ...(matches.projection || {}), txtSha256: run.projection.source.txtSha256 } };
  const o = (view) => { const m = buildOpenItems(run.projection, mm, view, { namedResiduals: run.cfg?.namedResiduals }); return m.parts.lpg.lines.length + m.parts.cyl.lines.length; };
  return { internal: o('internal'), customer: o('customer') };
}

const perAcct = [];
const lagHist = {};
const exact = { match: 0, extra: [], missing: [], heldBack: [] };
for (const code of codes) {
  const baseRun = matchAccount(ROOT, code, { dropLocks: GROUP_MARK });
  if (!baseRun.ok) continue;
  const bProb = baseRun.result.ties.filter((t) => t.rule === 'CN_DN_PAIR' && t.confidence === 'PROBABLE');
  for (const t of bProb) lagHist[t.lagDays] = (lagHist[t.lagDays] || 0) + 1;
  const bRows = openRows(baseRun, baseRun.result);
  const row = { code, probable: bProb.length, base: bRows, byDays: {} };
  for (const d of DAYS) {
    const r = matchAccount(ROOT, code, { dropLocks: GROUP_MARK, rules: { cnRivalFreeMaxDays: d } });
    const conf = r.result.ties.filter((t) => t.confirmedBy === 'RIVAL_FREE');
    row.byDays[d] = { confirmed: conf.length, ...openRows(r, r.result) };
    if (d === PROPOSE) {
      // compare with what the operator approved (current registry, same-DN pairs)
      const curRun = matchAccount(ROOT, code);
      const approved = (curRun.reg.registry?.projectionLocks?.locks || []).filter((l) => String(l.ruling?.reason || '').includes(GROUP_MARK) && l.ruling?.approvedTie?.rule === 'CN_DN_PAIR');
      const rowById = new Map(r.projection.rows.map((x) => [x.row_id, x]));
      const ruleSets = new Set(conf.map((t) => t.members.map((id) => rowKey(rowById.get(id))).sort().join('~')));
      const apprSets = new Set(approved.map((l) => l.members.map((m) => m.key).sort().join('~')));
      for (const k of ruleSets) apprSets.has(k) ? exact.match++ : exact.extra.push(`${code}: ${[...k.split('~')].map((x) => x.split('|').slice(0, 2).join(' ')).join(' + ')}`);
      for (const k of apprSets) if (!ruleSets.has(k)) exact.missing.push(`${code}: ${k.split('~').map((x) => x.split('|').slice(0, 2).join(' ')).join(' + ')}`);
      for (const t of r.result.ties.filter((x) => x.rule === 'CN_DN_PAIR' && x.confidence === 'PROBABLE')) exact.heldBack.push(`${code}: ${t.docs.join(' + ')} (lag ${t.lagDays}d)`);
    }
  }
  // sanity: with the rule on AND the real locks kept, nothing changes versus today
  const cur = matchAccount(ROOT, code), curOn = matchAccount(ROOT, code, { rules: { cnRivalFreeMaxDays: PROPOSE } });
  const a = openRows(cur, cur.result), b = openRows(curOn, curOn.result);
  row.noChangeWithLocks = a.internal === b.internal && a.customer === b.customer;
  row.tieDelta = curOn.result.summary.ties - cur.result.summary.ties;
  perAcct.push(row);
}

const L = ['# Preview of proposed rule R1: same-delivery-note credit-note pairs', '',
  `Generated ${new Date().toISOString().slice(0, 10)} by \`cn_rule_preview.mjs\`. Read-only; the rule is **off by default** (\`cnRivalFreeMaxDays: 0\`) and nothing here changes any account. PROPOSED: needs an operator decision.`, '',
  '## The rule', '',
  'A credit note and an invoice of the **same delivery-note number and lane**, with an **exact opposite amount**, are **CONFIRMED** when the credit note is dated up to **N days** after the invoice and the pairing is the **only possible one**: no other invoice and no other credit note of the same lane, delivery-note number and amount exists anywhere in the projection. Today they are CONFIRMED only up to 1 day and otherwise PROBABLE (and wait for approval). Pairs with a twin, pairs with no delivery-note number (`CN_AMOUNT_DATE`) and everything beyond N days stay PROBABLE.', '',
  '## Counterfactual baseline', '',
  `Baseline = the matcher with the 49 group-approval locks of 2026-10-10 left out, i.e. the state before you approved them. Lag distribution of the same-DN probable pairs in that baseline (days after the invoice → pairs): ${Object.entries(lagHist).sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k}d → ${v}`).join(', ')}. **No pair exists beyond ${Math.max(...Object.keys(lagHist).map(Number))} days**, so any N from that value up gives the same result today; the proposal uses the observed maximum rather than extrapolating.`, '',
  '## Effect per account (customer-view open rows; internal in brackets)', '',
  `| Account | Same-DN probable pairs | Baseline open rows | ${DAYS.map((d) => `N=${d}: pairs confirmed → open rows`).join(' | ')} |`, `| :--- | ---: | :--- | ${DAYS.map(() => ':---').join(' | ')} |`];
for (const r of perAcct) L.push(`| ${r.code} | ${r.probable} | ${r.base.customer} (${r.base.internal}) | ${DAYS.map((d) => `${r.byDays[d].confirmed} → ${r.byDays[d].customer} (${r.byDays[d].internal})`).join(' | ')} |`);
L.push('', `## Does the rule reproduce your approvals? (N = ${PROPOSE})`, '',
  `- Same-DN pairs the rule confirms that you approved: **${exact.match}**.`,
  `- Pairs the rule confirms that you did **not** approve: **${exact.extra.length}**${exact.extra.length ? ' — ' + exact.extra.join('; ') : ''}.`,
  `- Pairs you approved that the rule does **not** confirm: **${exact.missing.length}**${exact.missing.length ? ' — ' + exact.missing.join('; ') : ''}.`,
  `- Same-DN pairs the rule leaves PROBABLE (held back): **${exact.heldBack.length}**${exact.heldBack.length ? ' — ' + exact.heldBack.join('; ') : ''}.`, '',
  `- **The ${exact.extra.length} pairs the rule confirms that you did not approve** are pairs the zero-balance rule (rule 6) had already settled inside a group: the rule pairs them individually (rule 2 runs before rule 6), so the group shrinks. ${perAcct.filter((r) => r.tieDelta).map((r) => `${r.code}: ${r.tieDelta > 0 ? '+' : ''}${r.tieDelta} ties`).join('; ') || 'No account differs.'}. They are settled either way.`,
  `- With the real locks kept and the rule on (N = ${PROPOSE}), do the **open rows and balances** change on any account, internal or customer view? ${perAcct.every((r) => r.noChangeWithLocks) ? '**No: every account\'s open rows are identical to today.**' : '**Yes: ' + perAcct.filter((r) => !r.noChangeWithLocks).map((r) => r.code).join(', ') + '.**'}`, '',
  '## Risks and what the rule does not do', '',
  '- It rests on the delivery-note text. A re-keyed or mistyped DN that coincidentally matches another delivery would be paired; the rival check catches repeats within the account but not a unique mistake. Tripwire: an ERP allocation export (credit-note INVNO) pointing a credit note at a different invoice.',
  '- It does not look at what else is open on the account, so a legitimately open invoice could be paired off if its credit note carries the same DN and amount. That is the same risk as the existing 0–1 day rule, over a longer window.',
  '- It leaves `CN_AMOUNT_DATE` pairs (no DN) alone. Eleven were approved in groups on timing alone; confirming those by rule would be a separate, weaker proposal.',
  '- The limit of N days is a judgement: the data shows nothing beyond 5, and the rule should be widened only on evidence.', '',
  '## If you adopt it', '',
  'Set `cnRivalFreeMaxDays: 5` in `RULES` (one line), add the amendment to the ratified note, re-run `matcher_preview.mjs` (it must show no unintended row change), and re-render. No account needs a lock for these pairs again; pairs already locked stay locked.', '');
const md = `${L.join('\n')}\n`;
if (outFile) { fs.writeFileSync(path.resolve(outFile), md); console.log(`Written ${outFile}`); } else process.stdout.write(md);
