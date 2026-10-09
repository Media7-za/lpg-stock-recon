/**
 * Internal matcher-review ledger (operator 2026-10-09: "I would like an internal view like that
 * especially whilst we are developing the matcher"). Pure: projection + matcher output → Markdown.
 *
 * Every row of the v5 projection in ERP (TXT line) order, month by month, with the ERP running
 * balance and what the matcher did with the row: OPEN, or the tie id, rule, confidence and the
 * documents it was tied to. Rows where the ERP running balance returns to zero are marked ◀ ZERO.
 * Internal only: never a customer document.
 */
const round2 = (n) => Math.round(Number(n) * 100) / 100;
const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const monthLabel = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleString('en-ZA', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const dateLabel = (iso) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${String(d.getUTCDate()).padStart(2, '0')} ${d.toLocaleString('en-ZA', { month: 'short', timeZone: 'UTC' })} ${d.getUTCFullYear()}`;
};
const cell = (v) => String(v ?? '').replace(/\|/g, '\\|');
const SHORT = { Invoice: 'Inv', 'Crd Note': 'CN', Payment: 'Pmt', 'Bank UD': 'UD', Journal: 'Jnl' };

export function buildInternalLedger(projection, matches) {
  const tieByRow = new Map();
  for (const t of matches.ties) for (const id of t.members) tieByRow.set(id, t);
  const rows = projection.rows
    .slice()
    .sort((a, b) => (a.txt_line ?? 1e9) - (b.txt_line ?? 1e9) || a.lane.localeCompare(b.lane));
  let run = projection.openings.combinedBf || 0;
  const lineEnd = new Map(); // txt_line -> index of its last row
  rows.forEach((r, i) => lineEnd.set(r.txt_line, i));
  const out = rows.map((r, i) => {
    run = round2(run + r.amount);
    const t = tieByRow.get(r.row_id);
    const endOfLine = lineEnd.get(r.txt_line) === i;
    return {
      ...r,
      running: run,
      zero: endOfLine && Math.abs(run) <= 0.05,
      tie: t || null,
    };
  });
  return { rows: out, opening: projection.openings.combinedBf || 0 };
}

export function renderInternalLedgerMarkdown(model, { cfg, projection, matches, generatedOn }) {
  const L = [];
  const open = model.rows.filter((r) => !r.tie);
  const zeros = model.rows.filter((r) => r.zero);
  L.push(`# Internal ledger: ${cfg.debtorName} (${cfg.debtorCode}), matcher review`);
  L.push(
    `**INTERNAL, not for the customer.** Every transaction in ERP order with the ERP running balance and what matcher v${matches.matcherVersion} did with it · generated ${generatedOn} · ` +
      `${matches.summary.confirmed} confirmed / ${matches.summary.probable} probable ties · ${open.length} rows open · ` +
      `ERP \`CURRENT BALANCE\` R${fmt(projection.source.erpCurrentBalance)} · PROPOSED — NOT RATIFIED${matches.reviewOnly ? ` · **REVIEW ONLY:** ${matches.reviewOnlyReasons.join('; ')}` : ''}`,
  );
  L.push('', '**Status key:** `OPEN` untied · `T0001 EXACT_SINGLE ✓` confirmed tie · `T0001 BATCH_SUM ?` probable tie (needs approval) · `LOCKED` operator-approved lock · `◀ ZERO` ERP running balance is within R0.05 after this line.', '');
  if (zeros.length) {
    L.push(`**ERP balance returns to ~R0.00** after: ${zeros.map((r) => `${dateLabel(r.date)} (${SHORT[r.entry_type] || r.entry_type} ${r.clean_doc}, line ${r.txt_line}, R${fmt(r.running)})`).join('; ')}.`, '');
  }
  L.push('---', '');
  let month = null;
  let monthOpen = model.opening;
  const firstOfMonth = new Map();
  for (const r of model.rows) {
    const m = monthLabel(r.date);
    if (!firstOfMonth.has(m)) firstOfMonth.set(m, round2(r.running - r.amount));
  }
  for (const r of model.rows) {
    const m = monthLabel(r.date);
    if (m !== month) {
      if (month) L.push('');
      month = m;
      monthOpen = firstOfMonth.get(m);
      L.push(`### ${m}`, '', `Opening balance (ERP running): **R${fmt(monthOpen)}**`, '');
      L.push('| Date | Type | Doc # | Reference | Lane | Amount (R) | ERP running (R) | Matcher status |', '| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |');
    }
    let status = 'OPEN';
    if (r.tie) {
      const t = r.tie;
      const mark = t.rule === 'LOCKED' ? '' : t.confidence === 'CONFIRMED' ? ' ✓' : ' ?';
      const withDocs = t.docs
        .filter((d) => !d.endsWith(` ${r.clean_doc}`))
        .slice(0, 4)
        .map((d) => d.replace(/^(\w+) (.*)$/, (_, ty, no) => `${SHORT[ty] || ty} ${no}`))
        .join(', ');
      const more = t.docs.length - 1 > 4 ? ` +${t.docs.length - 5}` : '';
      const ruling = t.ruling ? ` [${t.ruling.treatment}]` : '';
      status = `${t.tie_id} ${t.lockedRule ? `LOCKED:${t.lockedRule}` : t.rule}${mark}${ruling}${withDocs ? ` ↔ ${withDocs}${more}` : ''}`;
    }
    if (r.zero) status += ' ◀ ZERO';
    const amt = r.amount < 0 ? `**${fmt(r.amount)}**`.replace(/\*/g, '') : fmt(r.amount);
    L.push(`| ${dateLabel(r.date)} | ${cell(r.entry_type)} | ${cell(r.clean_doc)} | ${cell(r.ref_no) || '—'} | ${r.lane} | ${amt} | ${fmt(r.running)} | ${cell(status)} |`);
  }
  L.push('', '---', '', '## Ties by rule', '', '| Rule | Confirmed | Probable |', '| :--- | ---: | ---: |');
  const byRule = new Map();
  for (const t of matches.ties) {
    const e = byRule.get(t.rule) || { c: 0, p: 0 };
    if (t.confidence === 'CONFIRMED') e.c += 1;
    else e.p += 1;
    byRule.set(t.rule, e);
  }
  for (const [rule, e] of byRule) L.push(`| ${rule} | ${e.c} | ${e.p} |`);
  const dissolved = matches.ties.filter((t) => t.dissolvedProbable?.length);
  if (dissolved.length) {
    L.push('', '## Probable ties dissolved by BALANCE_ZERO', '', '| Group | Through | Dissolved |', '| :--- | :--- | :--- |');
    for (const t of dissolved) L.push(`| ${t.tie_id} | ${dateLabel(t.throughDate)} (line ${t.throughLine}) | ${t.dissolvedProbable.map((d) => `${d.rule}: ${d.docs.join(' + ')}`).join('; ')} |`);
  }
  const probable = matches.ties.filter((t) => t.confidence === 'PROBABLE');
  if (probable.length) {
    L.push('', '## Probable ties awaiting approval', '', '| Tie | Rule | Documents | Variance (R) |', '| :--- | :--- | :--- | ---: |');
    for (const t of probable) L.push(`| ${t.tie_id} | ${t.rule} | ${t.docs.join(', ')} | ${t.variance != null ? fmt(t.variance) : '—'} |`);
  }
  L.push('', `Proof: ${matches.proof.holds ? 'holds' : '**DOES NOT HOLD**'} (rebuilt R${fmt(matches.proof.rebuiltClosing)} vs closing R${fmt(matches.proof.projectionClosing)}; ERP R${fmt(matches.proof.erpCurrentBalance)}).`, '');
  return `${L.join('\n')}\n`;
}
