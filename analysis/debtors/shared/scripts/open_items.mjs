/**
 * Open-items view — build step 3 of PROPOSED_Projection_Matching_Locks.md
 * (PROPOSED — NOT RATIFIED). Pure: projection + matcher output → open-items model
 * and Markdown. No DB, no writes.
 *
 * P3 rulings applied:
 *   - Internal copy: CONFIRMED and PROBABLE ties both drop out of the main view;
 *     probable ties are listed in Appendix A with rule and variance.
 *   - Customer copy: rows whose only tie is PROBABLE stay listed as open (with their
 *     counterpart rows, so the running balance still adds up) until confirmed.
 *   - Partly settled documents keep all their untied rows visible.
 *   - Proof: opening B/F + open rows + rounding on matched items = ERP balance.
 */

const round2 = (n) => Math.round(Number(n) * 100) / 100;
const fmt = (n) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const monthLabel = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleString('en-ZA', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const dateLabel = (iso) => {
  const d = new Date(`${iso}T12:00:00Z`);
  return `${String(d.getUTCDate()).padStart(2, '0')} ${d.toLocaleString('en-ZA', { month: 'short', timeZone: 'UTC' })} ${d.getUTCFullYear()}`;
};
const LANE_LABEL = { LPG: 'Gas', OTHER: 'Other', CYL: 'Cylinder deposit' };
const cell = (v) => String(v ?? '').replace(/\|/g, '\\|'); // keep Markdown table columns intact
// Operator-ruling treatments with their own proof line: [key, internal label, customer label].
const RULING_LINES = [
  ['applied_to_bf', 'Payments applied to opening B/F (operator rulings)', 'Payments against opening balance'],
  ['part_payment', 'Part-payments on open invoices (operator rulings)', 'Part-payments on items listed above'],
  ['customer_credit', 'Overpayments held as customer credit (operator rulings)', 'Credit in your favour (overpayments)'],
  ['short_paid', 'Short payments still owed (operator rulings)', 'Short payments still owed'],
];

/**
 * @param view 'internal' | 'customer'
 * Returns { parts: {lpg, cyl}, rounding, appendix, proof } where each part lists its
 * open rows (date-ordered) with a running balance from the part's opening B/F.
 */
export function buildOpenItems(projection, matches, view = 'internal') {
  if (matches.projection?.txtSha256 && matches.projection.txtSha256 !== projection.source.txtSha256) {
    throw new Error('projection_matches.json was built from a different projection (TXT fingerprint differs)');
  }
  const tieByRow = new Map();
  for (const t of matches.ties) for (const id of t.members) tieByRow.set(id, t);
  const visible = (r) => {
    const t = tieByRow.get(r.row_id);
    if (!t) return true;
    return view === 'customer' && t.confidence === 'PROBABLE';
  };

  const laneOf = (r) => (r.lane === 'CYL' ? 'cyl' : 'lpg');
  // Rounding on matched items: the net of each hidden tie, split by part. Remittance
  // settlement discounts (P9) are reported separately as journals pending.
  // Operator rulings (approved locks) say what their net is, so it is reported on its own line.
  const rounding = { lpg: 0, cyl: 0 };
  const journalsPending = { lpg: 0, cyl: 0 };
  const ruled = Object.fromEntries(RULING_LINES.map(([k]) => [k, { lpg: 0, cyl: 0 }]));
  const openingSettled = { lpg: 0, cyl: 0 };
  const partPaid = []; // { doc, amount, payment }
  for (const t of matches.ties) {
    if (view === 'customer' && t.confidence === 'PROBABLE') continue; // shown in full instead
    const bucket = t.ruling && t.ruling.treatment !== 'exact' ? ruled[t.ruling.treatment] : rounding;
    const memberRows = t.members.map((id) => projection.rows.find((x) => x.row_id === id)).filter(Boolean);
    if (t.rule === 'BALANCE_ZERO' || t.rule === 'SETTLED_THROUGH') {
      // Rows up to the ERP balance's return to zero also settle the opening B/F.
      const lpgBf = projection.openings.lpgOpeningBf || 0;
      const cylBf = projection.openings.cylOpeningFinancial || 0;
      openingSettled.lpg = round2(openingSettled.lpg - lpgBf);
      openingSettled.cyl = round2(openingSettled.cyl - cylBf);
      rounding.lpg = round2(rounding.lpg + t.net + lpgBf + cylBf);
    } else if (new Set(memberRows.map(laneOf)).size > 1) {
      // A tie spanning gas and cylinder lanes (e.g. BATCH_SUM: payments settling a delivery's
      // gas and deposit invoices) has no per-lane net of its own; carry its net on the gas side.
      bucket.lpg = round2(bucket.lpg + t.net);
    } else {
      for (const r of memberRows) bucket[laneOf(r)] = round2(bucket[laneOf(r)] + r.amount);
    }
    if (t.ruling?.treatment === 'part_payment') {
      const pay = t.docs.filter((d) => d.startsWith('Payment ')).map((d) => d.slice(8)).join(', ');
      partPaid.push({ doc: t.ruling.partialDoc, amount: t.net, payment: pay });
    }
    if (t.discountPending) {
      journalsPending.lpg = round2(journalsPending.lpg + t.discountPending);
      rounding.lpg = round2(rounding.lpg - t.discountPending);
    }
  }

  const opening = { lpg: projection.openings.lpgOpeningBf, cyl: projection.openings.cylOpeningFinancial };
  const parts = {};
  for (const part of ['lpg', 'cyl']) {
    const rows = projection.rows
      .filter((r) => laneOf(r) === part && visible(r))
      .sort((a, b) => a.date.localeCompare(b.date) || (a.txt_line ?? 0) - (b.txt_line ?? 0));
    let run = opening[part];
    const lines = rows.map((r) => {
      run = round2(run + r.amount);
      const t = tieByRow.get(r.row_id);
      return {
        row_id: r.row_id,
        date: r.date,
        entry_type: r.entry_type,
        doc: r.clean_doc,
        ref: r.ref_no,
        lane: r.lane,
        amount: r.amount,
        running: run,
        pendingProbable: Boolean(t && t.confidence === 'PROBABLE'),
        partPaid: partPaid.filter((x) => x.doc === r.clean_doc && r.lane !== 'CYL'),
      };
    });
    const rulings = Object.fromEntries(RULING_LINES.map(([k]) => [k, ruled[k][part]]));
    const closing = round2(
      run + rounding[part] + journalsPending[part] + openingSettled[part] + Object.values(rulings).reduce((a, b) => a + b, 0),
    );
    parts[part] = {
      opening: opening[part],
      lines,
      openTotal: round2(run - opening[part]),
      rounding: rounding[part],
      openingSettled: openingSettled[part],
      journalsPending: journalsPending[part],
      rulings,
      closing,
    };
  }

  const combined = round2(parts.lpg.closing + parts.cyl.closing);
  const erp = projection.source.erpCurrentBalance;
  return {
    view,
    parts,
    partPaid,
    appendix: matches.ties.filter((t) => t.confidence === 'PROBABLE'),
    proof: {
      combined,
      projectionClosing: projection.closings.combined,
      erp,
      holds: Math.abs(combined - projection.closings.combined) < 0.005,
      tiesToErp: Math.abs(combined - erp) < 0.005,
    },
  };
}

function partTable(part, title, view) {
  const out = [`## ${title}`, ''];
  if (!part.lines.length) {
    out.push('_No open items._', '');
  } else {
    let month = null;
    for (const l of part.lines) {
      const m = monthLabel(l.date);
      if (m !== month) {
        if (month) out.push('');
        month = m;
        out.push(`### ${m}`, '');
        out.push(
          view === 'customer'
            ? '| Date | Type | Doc # | Reference | Item | Amount (R) | Balance (R) |'
            : '| Date | Type | Doc # | Reference | Lane | Amount (R) | Running (R) |',
          '| :--- | :--- | :--- | :--- | :--- | ---: | ---: |',
        );
      }
      const lane = view === 'customer' ? LANE_LABEL[l.lane] : l.lane;
      const flag = view === 'customer' && l.pendingProbable ? ' ¹' : '';
      out.push(
        `| ${dateLabel(l.date)} | ${cell(l.entry_type)} | ${cell(l.doc)}${flag} | ${cell(l.ref) || '—'} | ${lane} | ${fmt(l.amount)} | ${fmt(l.running)} |`,
      );
    }
    out.push('');
  }
  return out;
}

export function renderOpenItemsMarkdown(model, { cfg, projection, matches, generatedOn }) {
  const { parts, proof, appendix, view } = model;
  const internal = view === 'internal';
  const L = [];
  L.push(
    `# Open Items Statement: ${cfg.debtorName} (${cfg.debtorCode})${internal ? ' — Internal' : ' — Customer copy (DRAFT PREVIEW)'}`,
  );
  L.push(
    `**Period:** from ${dateLabel(projection.window.periodStart)} to ${dateLabel(projection.window.lastRowDate)} &nbsp;|&nbsp; **Balance due:** R${fmt(proof.combined)}`,
  );
  if (internal) {
    L.push(
      `**Status:** PROPOSED — NOT RATIFIED (\`PROPOSED_Projection_Matching_Locks.md\`, build step 3) · generated ${generatedOn} by \`render_open_items.mjs\``,
    );
    L.push(
      `**Sources:** \`${matches.projection.path}\` (TXT sha256 \`${projection.source.txtSha256.slice(0, 12)}…\`, DB channel \`${projection.source.dbChannel}\`) · \`data/projection_matches.json\` (${matches.summary.confirmed} confirmed / ${matches.summary.probable} probable ties)${matches.reviewOnly ? ` · **REVIEW ONLY:** ${matches.reviewOnlyReasons.join('; ')}` : ''}`,
    );
    L.push(
      `**Locks:** ${matches.closedThrough ? `closed through ${matches.closedThrough}, ${matches.locksApplied} locks applied` : 'no period closed yet'}` +
        `${(matches.lockConflicts || []).length ? ` · **${matches.lockConflicts.length} LOCK CONFLICT(S): see Appendix C**` : ''}`,
    );
  } else {
    L.push(
      '> **Draft preview, not for release.** This copy lists only items not yet settled. Customer release goes through the official statement generator and `npm run debtors:tag-check` (business_rules.md §15).',
    );
  }
  L.push('', '---', '');
  L.push(
    internal
      ? '*Settled items (invoice ↔ payment / credit note ties) are omitted. Probable ties are also omitted here and listed in Appendix A.*'
      : '*Items already settled are omitted.*',
    '',
  );

  L.push(`**Gas (LPG) opening balance:** R${fmt(parts.lpg.opening)}`, '');
  L.push(...partTable(parts.lpg, internal ? 'Part 1A: LPG + OTHER open items' : 'Gas: open items', view));
  L.push(`**Cylinder deposit opening balance:** R${fmt(parts.cyl.opening)}`, '');
  L.push(...partTable(parts.cyl, internal ? 'Part 1B: CYL open items' : 'Cylinder deposits: open items', view));

  if (!internal && appendix.length) {
    L.push('¹ Payment received; allocation to this item is being confirmed.', '');
  }

  L.push('---', '', internal ? '## Proof: open items reconcile to the ERP balance' : '## Balance summary', '');
  L.push('| Component | Gas (R) | Cylinder deposit (R) | Total (R) |', '| :--- | ---: | ---: | ---: |');
  const row3 = (label, a, b) => `| ${label} | ${fmt(a)} | ${fmt(b)} | ${fmt(round2(a + b))} |`;
  L.push(row3(internal ? 'Opening B/F (unitemised)' : 'Opening balance', parts.lpg.opening, parts.cyl.opening));
  L.push(row3('Open items listed above', parts.lpg.openTotal, parts.cyl.openTotal));
  if (parts.lpg.openingSettled || parts.cyl.openingSettled) {
    L.push(row3(internal ? 'Opening B/F settled (ERP balance returned to zero)' : 'Opening balance settled', parts.lpg.openingSettled, parts.cyl.openingSettled));
  }
  L.push(row3(internal ? 'Rounding on matched items (tie nets)' : 'Rounding on settled items', parts.lpg.rounding, parts.cyl.rounding));
  for (const [k, labelInternal, labelCustomer] of RULING_LINES) {
    if (parts.lpg.rulings[k] || parts.cyl.rulings[k]) {
      L.push(row3(internal ? labelInternal : labelCustomer, parts.lpg.rulings[k], parts.cyl.rulings[k]));
    }
  }
  if (parts.lpg.journalsPending || parts.cyl.journalsPending) {
    L.push(row3(internal ? 'Settlement discount journals pending (P9)' : 'Settlement discount (journal pending)', parts.lpg.journalsPending, parts.cyl.journalsPending));
  }
  L.push(row3('**Balance**', parts.lpg.closing, parts.cyl.closing));
  if (internal) {
    L.push(`| ERP \`CURRENT BALANCE\` (TXT header) | | | ${fmt(proof.erp)} |`);
    L.push(`| **Variance** | | | **${fmt(round2(proof.combined - proof.erp))}** |`);
  }
  L.push('');
  const ud = projection.udPending;
  if (ud && (ud.rows.length || ud.headerTotal)) {
    L.push(
      internal
        ? `**Memo: unconfirmed UD payments R${fmt(ud.headerTotal)}** (awaiting bank reconciliation; not deducted from the balance and not matched): ${ud.rows.map((r) => `${r.clean_doc} ${r.iso} R${fmt(r.amount)}`).join('; ')}${ud.unexplained ? ` · R${fmt(ud.unexplained)} not listed as UD rows` : ''}.`
        : `**Note:** payment(s) of R${fmt(-ud.headerTotal)} received but not yet confirmed by our bank reconciliation; they will be credited once confirmed.`,
      '',
    );
  }
  for (const pp of model.partPaid || []) {
    const inv = parts.lpg.lines.find((l) => l.doc === pp.doc);
    const owed = inv ? ` = R${fmt(round2(inv.amount + pp.amount))} outstanding` : '';
    L.push(`- Invoice ${pp.doc}${inv ? ` R${fmt(inv.amount)}` : ''} less part-payment R${fmt(-pp.amount)} (payment${pp.payment.includes(',') ? 's' : ''} ${pp.payment})${owed}.`);
  }
  if ((model.partPaid || []).length) L.push('');

  if (internal) {
    L.push('---', '', '## Appendix A: Probable ties (review required, not locked)', '');
    if (!appendix.length) {
      L.push('_None._', '');
    } else {
      L.push('| Tie | Rule | Documents | Variance (R) | Note |', '| :--- | :--- | :--- | ---: | :--- |');
      for (const t of appendix) {
        const closedNote = t.inClosedPeriod ? ' (closed period: not locked)' : '';
        const note0 =
          t.rule === 'REMITTANCE'
            ? `${t.batchId}: ${(t.lineDiscrepancies || []).map((d) => `${d.doc} advice R${fmt(d.advice)} vs ERP R${fmt(d.erp)}`).join('; ')}`
            : t.lagDays != null
              ? `CN ${t.lagDays} day(s) after invoice`
              : t.rule === 'NEAR_SUM'
                ? 'within R1.00 truncation'
                : t.rule === 'PROXIMITY'
                  ? 'within ±R5.00'
                  : '';
        const note = `${note0}${closedNote}`;
        L.push(`| ${t.tie_id} | ${t.rule} | ${t.docs.join(', ')} | ${t.variance != null ? fmt(t.variance) : '—'} | ${note} |`);
      }
      L.push('');
    }
    L.push('## Appendix B: Confirmed ties by rule', '', '| Rule | Ties |', '| :--- | ---: |');
    const byRule = {};
    for (const t of matches.ties) if (t.confidence === 'CONFIRMED') byRule[t.rule] = (byRule[t.rule] || 0) + 1;
    for (const [r, n] of Object.entries(byRule)) L.push(`| ${r} | ${n} |`);
    L.push('', `Full tie list: \`data/projection_matches.json\`.`, '');
    const rulingTies = matches.ties.filter((t) => t.ruling || t.settledRuling).map((t) => (t.settledRuling ? { ...t, lock_id: t.record_id, ruling: { treatment: `settled through ${t.through}`, reason: t.settledRuling.reason } } : t));
    if (rulingTies.length) {
      L.push('## Appendix D: Operator rulings applied (approved locks)', '', '| Lock | Treatment | Documents | Net (R) | Ruling |', '| :--- | :--- | :--- | ---: | :--- |');
      for (const t of rulingTies) {
        const tr = t.ruling.partialDoc ? `${t.ruling.treatment} → ${t.ruling.partialDoc}` : t.ruling.treatment;
        L.push(`| ${t.lock_id} | ${tr} | ${t.docs.join(', ')} | ${fmt(t.net)} | ${cell(t.ruling.reason)} |`);
      }
      L.push('');
    }
    if ((matches.lockConflicts || []).length) {
      L.push('## Appendix C: Lock conflicts (rows left untied; closes blocked until resolved)', '', '| Lock | Close | Problem |', '| :--- | :--- | :--- |');
      for (const c of matches.lockConflicts) L.push(`| ${c.lock_id} | ${c.close_id} | ${cell(c.problems.join('; '))} |`);
      L.push('');
    }
  }
  return `${L.join('\n')}\n`;
}
