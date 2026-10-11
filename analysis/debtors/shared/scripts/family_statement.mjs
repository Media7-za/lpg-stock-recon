/**
 * Consolidated family statement (operator ruling ADM-94 Q1/Q15: a parent account and its child
 * accounts are one customer, one statement). Config-driven: the family is the `payerGroup`
 * (parent + children[{ code, txtPath }]) in the parent's config/statement_v5.json; each member has
 * its own v5 projection and matcher output. No account names live in this file.
 *
 * Pure builders (no I/O) plus one loader. The generator (generate_statement_of_account.mjs) calls:
 *   loadFamilyInputs → buildFamilyStatement → renderFamilyCustomerMarkdown / renderFamilyInternalMarkdown
 *
 * Safeguards (any failure => `problems`, the generator aborts and writes nothing; --force does not
 * override them):
 *   - each member's TXT file fingerprint equals the one its projection and matcher output were built from
 *   - each member's projection was built for the TXT's ERP header
 *   - each member's rebuild proof holds and there are no unresolved lock conflicts
 *   - each member: listed open items + named lines = its ERP header (to the cent)
 *   - family amount due = sum of the member ERP headers
 * A member whose matcher output is reviewOnly makes the whole output a DRAFT (never a release copy).
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { buildOpenItems, customerSummaryLines } from './open_items.mjs';
import { displayDate, fmtAmount, round2, parseDebenqWithRunning } from './debenq_open_invoices.mjs';

const LANE_LABEL = { LPG: 'Gas', OTHER: 'Other', CYL: 'Cylinder deposit' };
const cell = (v) => String(v ?? '').replace(/\|/g, '\\|');
const fmt = fmtAmount;
const GENERIC_NAMED_LABEL = 'Journal adjustments brought forward';

function sha256File(abs) {
  return crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
}

/**
 * Read the family from disk. `parentTxtRel` is the parent's statement TXT (from its
 * statement_of_account.json primaryTxt); child TXT paths come from payerGroup.
 */
export function loadFamilyInputs({ root, parentCode, parentTxtRel }) {
  const acctDir = (code) => path.join(root, 'analysis/debtors', code);
  const readJson = (code, rel) => JSON.parse(fs.readFileSync(path.join(acctDir(code), rel), 'utf8'));
  const v5cfg = readJson(parentCode, 'config/statement_v5.json');
  const group = v5cfg.payerGroup;
  if (!group || group.parent !== parentCode || !Array.isArray(group.children) || !group.children.length) {
    throw new Error(`consolidatedFamily needs config/statement_v5.json payerGroup {parent: ${parentCode}, children[]}`);
  }
  const defs = [
    { code: parentCode, role: 'parent', txtRel: parentTxtRel },
    ...group.children.map((c) => ({ code: c.code, role: 'child', txtRel: c.txtPath })),
  ];
  return defs.map((d) => {
    const txtAbs = path.join(root, d.txtRel);
    const cfg = readJson(d.code, 'config/statement_v5.json');
    return {
      code: d.code,
      role: d.role,
      txtPath: d.txtRel,
      erpHeader: parseDebenqWithRunning(txtAbs).headerBalance,
      txtSha256Actual: sha256File(txtAbs),
      projection: readJson(d.code, 'data/v5_projection.json'),
      matches: readJson(d.code, 'data/projection_matches.json'),
      namedResiduals: cfg.namedResiduals || [],
      rowNotes: cfg.rowNotes || [],
      debtorName: cfg.debtorName,
    };
  });
}

/**
 * @param members [{ code, role, txtPath, erpHeader, txtSha256Actual, projection, matches, namedResiduals, rowNotes }]
 *   parent first, then children in config order.
 */
export function buildFamilyStatement(members) {
  const problems = [];
  const draftReasons = [];
  const built = members.map((m) => {
    const prefix = `${m.code}:`;
    let model = null;
    try {
      model = buildOpenItems(m.projection, m.matches, 'customer', { namedResiduals: m.namedResiduals });
    } catch (e) {
      problems.push(`${prefix} ${e.message}`);
    }
    const fp = m.projection?.source?.txtSha256;
    if (m.txtSha256Actual !== fp) problems.push(`${prefix} projection is stale: TXT fingerprint ${String(m.txtSha256Actual).slice(0, 12)}… ≠ projection ${String(fp).slice(0, 12)}…`);
    if (m.matches?.projection?.txtSha256 && m.matches.projection.txtSha256 !== m.txtSha256Actual) problems.push(`${prefix} matcher output was built from a different TXT than the one on disk`);
    if (Math.abs((m.projection?.source?.erpCurrentBalance ?? NaN) - m.erpHeader) > 0.005) problems.push(`${prefix} projection was built for ERP R${fmt(m.projection?.source?.erpCurrentBalance ?? 0)}, TXT header says R${fmt(m.erpHeader)}`);
    if ((m.matches?.lockConflicts || []).length) problems.push(`${prefix} ${m.matches.lockConflicts.length} lock conflict(s) unresolved`);
    if (model && !model.proof.holds) problems.push(`${prefix} open items rebuild R${fmt(model.proof.combined)} ≠ projection closing R${fmt(model.proof.projectionClosing)}`);

    let items = [];
    let named = [];
    let itemsTotal = 0;
    let namedTotal = 0;
    if (model) {
      items = [...model.parts.lpg.lines, ...model.parts.cyl.lines]
        .map((l) => ({ ...l, account: m.code }))
        .sort((a, b) => a.date.localeCompare(b.date) || String(a.doc).localeCompare(String(b.doc)) || a.lane.localeCompare(b.lane));
      // Lines with the same customer wording are combined (the two pre-window journal groups read alike).
      const byLabel = new Map();
      for (const [label, amount] of customerSummaryLines(model, {
        includeNamed: true,
        namedLabel: (n) => n.customerLabel || GENERIC_NAMED_LABEL,
      })) byLabel.set(label, round2((byLabel.get(label) || 0) + amount));
      named = [...byLabel].filter(([, amount]) => amount).map(([label, amount]) => ({ account: m.code, label, amount }));
      itemsTotal = round2(items.reduce((s, l) => s + l.amount, 0));
      namedTotal = round2(named.reduce((s, l) => s + l.amount, 0));
      if (Math.abs(itemsTotal + namedTotal - m.erpHeader) > 0.005) {
        problems.push(`${prefix} open items R${fmt(itemsTotal)} + named lines R${fmt(namedTotal)} = R${fmt(round2(itemsTotal + namedTotal))} ≠ ERP header R${fmt(m.erpHeader)}`);
      }
    }
    if (m.matches?.reviewOnly) {
      draftReasons.push(`${m.code} is review-only: ${(m.matches.reviewOnlyReasons || ['reason not recorded']).join('; ')}`);
    }
    return { ...m, model, items, named, itemsTotal, namedTotal, balance: round2(itemsTotal + namedTotal) };
  });

  const items = built.flatMap((b) => b.items);
  const named = built.flatMap((b) => b.named);
  const itemsTotal = round2(built.reduce((s, b) => s + b.itemsTotal, 0));
  const namedTotal = round2(built.reduce((s, b) => s + b.namedTotal, 0));
  const erpTotal = round2(built.reduce((s, b) => s + b.erpHeader, 0));
  const statementTotal = round2(itemsTotal + namedTotal);
  if (Math.abs(statementTotal - erpTotal) > 0.005) {
    problems.push(`family statement R${fmt(statementTotal)} ≠ sum of ERP headers R${fmt(erpTotal)}`);
  }
  return {
    members: built,
    items,
    named,
    itemsTotal,
    namedTotal,
    erpTotal,
    statementTotal,
    problems,
    draft: draftReasons.length > 0,
    draftReasons,
    asAtIso: built.map((b) => b.projection.window.lastRowDate).sort().pop(),
  };
}

const FOOTNOTE = {
  payment: '¹ Payment received; allocation to this item is being confirmed.',
  credit: '² A credit note was issued against this invoice; matching of the two documents is being confirmed.',
};

/** Customer-facing statement. A DRAFT is bannered at the top and bottom; reasons stay internal. */
export function renderFamilyCustomerMarkdown(fam, { cfg, asAtLabel }) {
  const L = [];
  L.push(fam.draft ? '# Statement of Account — DRAFT PREVIEW' : '# Statement of Account', '');
  if (fam.draft) {
    L.push('> **DRAFT PREVIEW. NOT FOR RELEASE.** Some documents on this account family are still being verified. Do not send this copy to the customer.', '');
  }
  cfg.businessHeader.forEach((h, i) => L.push(i === 0 ? `**${h}**  ` : `${h}  `));
  L.push('', '---', '');
  L.push(`**To:** ${cfg.customerName}  `);
  L.push(`**Accounts:** ${fam.members.map((m) => m.code).join(', ')} (consolidated statement)  `);
  if (cfg.referenceValue) L.push(`**${cfg.referenceLabel}:** ${cfg.referenceValue}  `);
  L.push(`**Statement date:** ${asAtLabel}  `);
  L.push('', '---', '', '## Amount due', '', `**R${fmt(fam.statementTotal)}**`, '', '---', '');

  L.push('## Open items', '', '*Items already settled are not listed.*', '');
  L.push('| Account | Date | Type | Doc # | Reference | Item | Amount (R) |', '| :--- | :--- | :--- | :--- | :--- | :--- | ---: |');
  for (const l of fam.items) {
    const flag = l.pendingProbable ? (l.pendingKind === 'credit' ? ' ²' : ' ¹') : '';
    L.push(
      `| ${l.account} | ${displayDate(l.date)} | ${cell(l.entry_type)} | ${cell(l.doc)}${flag} | ${cell(l.ref) || '—'} | ${LANE_LABEL[l.lane] || l.lane} | ${fmt(l.amount)} |`,
    );
  }
  L.push(`| | | | | | **Total open items** | **${fmt(fam.itemsTotal)}** |`, '');
  const kinds = new Set(fam.items.filter((l) => l.pendingProbable).map((l) => l.pendingKind));
  for (const k of ['payment', 'credit']) if (kinds.has(k)) L.push(FOOTNOTE[k], '');
  if (fam.named.length) {
    L.push('## Other amounts included in the balance', '', '| Account | Description | Amount (R) |', '| :--- | :--- | ---: |');
    for (const n of fam.named) L.push(`| ${n.account} | ${cell(n.label)} | ${fmt(n.amount)} |`);
    L.push('');
  }
  L.push('---', '', '## Summary by account', '', '| Account | Open items (R) | Other amounts (R) | Balance (R) |', '| :--- | ---: | ---: | ---: |');
  for (const m of fam.members) L.push(`| ${m.code} | ${fmt(m.itemsTotal)} | ${fmt(m.namedTotal)} | ${fmt(m.balance)} |`);
  L.push(`| **Amount due** | **${fmt(fam.itemsTotal)}** | **${fmt(fam.namedTotal)}** | **${fmt(fam.statementTotal)}** |`, '');
  if (fam.members.some((m) => m.balance < 0)) {
    L.push('A negative amount is a credit in your favour; it is included in the amount due above.', '');
  }
  for (const m of fam.members) {
    const ud = m.projection.udPending;
    if (ud && ud.headerTotal) {
      L.push(`**Note (${m.code}):** payment(s) of R${fmt(-ud.headerTotal)} received but not yet confirmed by our bank reconciliation; they will be credited once confirmed.`, '');
    }
  }
  if (fam.draft) L.push('---', '', '> **DRAFT PREVIEW. NOT FOR RELEASE.**', '');
  return `${L.join('\n')}\n`;
}

/** Internal reconciliation view, in the style of internal_ledger.mjs. Never a customer document. */
export function renderFamilyInternalMarkdown(fam, { cfg, parentCode, generatedOn }) {
  const L = [];
  L.push(`# Family reconciliation: ${cfg.customerName} (${fam.members.map((m) => m.code).join(' + ')}), internal`);
  L.push(
    `**INTERNAL, not for the customer.** Consolidated statement as at ${fam.asAtIso} · generated ${generatedOn} · parent ${parentCode} · ` +
      `${fam.draft ? '**DRAFT: not releasable**' : 'no draft reasons'} · family amount due R${fmt(fam.statementTotal)} vs sum of ERP headers R${fmt(fam.erpTotal)} (variance R${fmt(round2(fam.statementTotal - fam.erpTotal))}).`,
    '',
  );
  if (fam.draftReasons.length) {
    L.push('**Why this is a draft:**', ...fam.draftReasons.map((r) => `- ${r}`), '');
  }
  L.push('## Reconciliation to each ERP balance', '');
  L.push('| Account | Role | ERP header (R) | Open items (R) | Named / other lines (R) | Statement balance (R) | Variance (R) | Matcher | Review only |', '| :--- | :--- | ---: | ---: | ---: | ---: | ---: | :--- | :--- |');
  for (const m of fam.members) {
    const s = m.matches.summary || {};
    L.push(
      `| ${m.code} | ${m.role} | ${fmt(m.erpHeader)} | ${fmt(m.itemsTotal)} | ${fmt(m.namedTotal)} | ${fmt(m.balance)} | ${fmt(round2(m.balance - m.erpHeader))} | ${s.confirmed ?? 0} confirmed / ${s.probable ?? 0} probable | ${m.matches.reviewOnly ? 'YES' : 'no'} |`,
    );
  }
  L.push(`| **Family** | | **${fmt(fam.erpTotal)}** | **${fmt(fam.itemsTotal)}** | **${fmt(fam.namedTotal)}** | **${fmt(fam.statementTotal)}** | **${fmt(round2(fam.statementTotal - fam.erpTotal))}** | | |`, '');
  L.push('Sources (TXT fingerprint = projection fingerprint is a gate):', '');
  L.push('| Account | TXT | sha256 | Projection sha256 | Match |', '| :--- | :--- | :--- | :--- | :--- |');
  for (const m of fam.members) {
    const ok = m.txtSha256Actual === m.projection.source.txtSha256;
    L.push(`| ${m.code} | \`${m.txtPath}\` | \`${m.txtSha256Actual.slice(0, 12)}…\` | \`${m.projection.source.txtSha256.slice(0, 12)}…\` | ${ok ? 'yes' : '**NO**'} |`);
  }
  L.push('', '---', '');

  for (const m of fam.members) {
    const internal = buildOpenItems(m.projection, m.matches, 'internal', { namedResiduals: m.namedResiduals });
    const rows = [...internal.parts.lpg.lines, ...internal.parts.cyl.lines].sort(
      (a, b) => a.date.localeCompare(b.date) || String(a.doc).localeCompare(String(b.doc)),
    );
    L.push(`## ${m.code}: ${m.role}, ERP R${fmt(m.erpHeader)}`, '');
    L.push(`Open rows after confirmed **and probable** ties are removed (internal view), ${rows.length} row(s):`, '');
    if (rows.length) {
      L.push('| Date | Type | Doc # | Reference | Lane | Amount (R) |', '| :--- | :--- | :--- | :--- | :--- | ---: |');
      for (const l of rows) L.push(`| ${displayDate(l.date)} | ${cell(l.entry_type)} | ${cell(l.doc)} | ${cell(l.ref) || '—'} | ${l.lane} | ${fmt(l.amount)} |`);
    } else L.push('_None._');
    L.push('');
    const notes = (m.rowNotes || []).filter((n) => rows.some((l) => l.doc === String(n.doc) && l.entry_type === n.entry_type));
    for (const n of notes) L.push(`- **${n.entry_type} ${n.doc} (operator note):** ${n.note}`);
    if (notes.length) L.push('');
    L.push('Reconciliation:', '', '| Component | Amount (R) |', '| :--- | ---: |');
    const p = internal.parts;
    L.push(`| Opening B/F | ${fmt(round2(p.lpg.opening + p.cyl.opening))} |`);
    L.push(`| Open rows listed above | ${fmt(round2(p.lpg.openTotal + p.cyl.openTotal))} |`);
    const adj = [
      ['Opening B/F settled', round2(p.lpg.openingSettled + p.cyl.openingSettled)],
      ['Rounding on matched items (tie nets)', round2(p.lpg.rounding + p.cyl.rounding)],
      ...Object.keys(p.lpg.rulings).map((k) => [`Ruling: ${k}`, round2(p.lpg.rulings[k] + p.cyl.rulings[k])]),
      ...internal.named.map((n) => [`Named: ${n.label} (${n.count} journal rows)`, n.amount]),
      ['Settlement discount journals pending', round2(p.lpg.journalsPending + p.cyl.journalsPending)],
    ].filter(([, v]) => v);
    for (const [k, v] of adj) L.push(`| ${cell(k)} | ${fmt(v)} |`);
    L.push(`| **Rebuilt balance** | **${fmt(internal.proof.combined)}** |`, `| ERP header | ${fmt(m.erpHeader)} |`, `| **Variance** | **${fmt(round2(internal.proof.combined - m.erpHeader))}** |`, '');
    if (internal.appendix.length) {
      L.push('Probable ties (proposals; not approved, not locked):', '', '| Tie | Rule | Documents | Variance (R) |', '| :--- | :--- | :--- | ---: |');
      for (const t of internal.appendix) L.push(`| ${t.tie_id} | ${t.rule} | ${cell(t.docs.join(', '))} | ${t.variance != null ? fmt(t.variance) : '—'} |`);
      L.push('');
    }
    if (m.matches.reviewOnly) L.push(`**REVIEW ONLY:** ${(m.matches.reviewOnlyReasons || []).join('; ')}`, '');
    L.push('---', '');
  }
  L.push('Derived from `data/v5_projection.json` and `data/projection_matches.json` of each account. Tags and decisions: see the dated preview note for this family.', '');
  return `${L.join('\n')}\n`;
}
