/**
 * Shared projection matcher — build step 2 of
 * analysis/debtors/shared/docs/PROPOSED_Projection_Matching_Locks.md (PROPOSED — NOT RATIFIED).
 *
 * Pure module: takes a verified v5 projection (data/v5_projection.json) and returns
 * ties between its rows. It only ever *ties* existing rows; it never creates a row,
 * so "open items + tie variances + opening B/F = ERP balance" holds by construction.
 *
 * Rule order (P4 defaults, all accounts):
 *   1. UD_CLEARING      Bank UD (+) and Payment (−) on the same doc, equal and opposite.
 *   2. CN_DN_PAIR       credit note ↔ invoice, same lane, same delivery-note number,
 *                       exactly opposite amount; CONFIRMED when CN is 0–1 day after
 *                       the invoice, otherwise PROBABLE. (TXT exports carry no CN→invoice
 *                       tag when taken with EXCLUDE: ALLOCATION DETAIL, so the DN ref is the
 *                       pairing evidence — same basis as dn_pair_reconcile.mjs.)
 *      CN_AMOUNT_DATE   fallback when no DN number pairs: same lane, exactly opposite
 *                       amount, CN 0–1 day after, and exactly one candidate → PROBABLE.
 *   3. Payments, one payment doc at a time, chronologically, against open invoice
 *      targets (LPG + OTHER lanes of one invoice doc; CYL is never a payment target):
 *        a. EXACT_SINGLE      |payment − invoice| ≤ R0.05                → CONFIRMED
 *        b. EXACT_MONTH_SUM   = all open invoices of one billing month   → CONFIRMED
 *        c. EXACT_SUM         = 2–3 open invoices (≤ R0.05)              → CONFIRMED
 *        d. PROXIMITY         one open invoice within ±R5.00             → PROBABLE
 *        e. NEAR_SUM          2–3 open invoices within ±R1.00 (skill Tier 2
 *                             truncation tolerance)                       → PROBABLE
 *        f. otherwise UNALLOCATED
 *      Only invoices dated on or before the payment are eligible (no prepayment).
 *      Tie-break (operator ruling): exact, then smallest variance, then closest to the
 *      payment date.
 *   A tie touching a row whose split_basis is not confirmable (HEADER_FALLBACK, P10)
 *   is downgraded to PROBABLE.
 *
 * Not yet implemented (later build steps): locks / period close (P5–P6), mirror carry
 * for monthly batch payers (opt-in, P4), settlement discount (P9), remittance evidence
 * (P11), payerGroup (P8), pre-window lookback (P7).
 */

export const MATCHER_VERSION = 1;

export const RULES = Object.freeze({
  exactTolerance: 0.05,
  proximityTolerance: 5.0,
  nearSumTolerance: 1.0,
  cnConfirmedMaxDays: 1,
  maxSumInvoices: 3,
  combinationPool: 40, // most recent open invoices considered for 2–3 invoice sums
  paymentTargetLanes: ['LPG', 'OTHER'],
});

const round2 = (n) => Math.round(Number(n) * 100) / 100;
const DAY = 86400000;
const days = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY);

/** Delivery-note number from a TXT reference (DN#22719, DN-22719, D/N20345, MKONDENI DN20430 EMP …). */
export function dnNumber(ref) {
  const m = String(ref || '').match(/D\W?N\W*(\d{3,})/i);
  return m ? m[1] : null;
}

function combos(arr, k, start = 0, acc = [], out = []) {
  if (acc.length === k) {
    out.push(acc.slice());
    return out;
  }
  for (let i = start; i < arr.length; i++) {
    acc.push(arr[i]);
    combos(arr, k, i + 1, acc, out);
    acc.pop();
  }
  return out;
}

export function matchProjection(projection, rules = RULES) {
  const rows = projection.rows;
  const tiedRow = new Map(); // row_id -> tie_id
  const ties = [];
  const addTie = (rule, confidence, members, extra = {}) => {
    const tie_id = `T${String(ties.length + 1).padStart(4, '0')}`;
    let conf = confidence;
    if (conf === 'CONFIRMED' && members.some((r) => !r.confirmable)) conf = 'PROBABLE';
    const net = round2(members.reduce((s, r) => s + r.amount, 0));
    ties.push({
      tie_id,
      rule,
      confidence: conf,
      members: members.map((r) => r.row_id),
      docs: [...new Set(members.map((r) => `${r.entry_type} ${r.clean_doc}`))],
      net,
      ...extra,
    });
    for (const r of members) tiedRow.set(r.row_id, tie_id);
    return tie_id;
  };
  const free = (r) => !tiedRow.has(r.row_id);

  // 1. UD clearing pairs
  const byDoc = new Map();
  for (const r of rows) {
    if (r.kind !== 'payment') continue;
    const k = r.clean_doc;
    if (!byDoc.has(k)) byDoc.set(k, []);
    byDoc.get(k).push(r);
  }
  for (const group of byDoc.values()) {
    const ud = group.filter((r) => r.entry_type === 'Bank UD' && free(r));
    for (const u of ud) {
      const p = group.find((r) => r.entry_type !== 'Bank UD' && free(r) && Math.abs(r.amount + u.amount) < 0.005);
      if (p) addTie('UD_CLEARING', 'CONFIRMED', [u, p]);
    }
  }

  // 2. Credit note ↔ invoice by delivery-note number, per lane
  const invoiceRows = rows.filter((r) => r.kind === 'invoice');
  const cnRows = rows.filter((r) => r.kind === 'credit_note').sort((a, b) => a.date.localeCompare(b.date));
  for (const cn of cnRows) {
    if (!free(cn)) continue;
    const dn = dnNumber(cn.ref_no);
    if (!dn) continue;
    const cands = invoiceRows
      .filter(
        (inv) =>
          free(inv) &&
          inv.lane === cn.lane &&
          dnNumber(inv.ref_no) === dn &&
          Math.abs(inv.amount + cn.amount) < 0.005 &&
          inv.date <= cn.date,
      )
      .sort((a, b) => b.date.localeCompare(a.date)); // closest date first
    if (!cands.length) continue;
    const inv = cands[0];
    const lag = days(inv.date, cn.date);
    addTie('CN_DN_PAIR', lag <= rules.cnConfirmedMaxDays ? 'CONFIRMED' : 'PROBABLE', [inv, cn], {
      dn,
      lagDays: lag,
    });
  }
  for (const cn of cnRows) {
    if (!free(cn)) continue;
    const cands = invoiceRows.filter(
      (inv) =>
        free(inv) &&
        inv.lane === cn.lane &&
        Math.abs(inv.amount + cn.amount) < 0.005 &&
        inv.date <= cn.date &&
        days(inv.date, cn.date) <= rules.cnConfirmedMaxDays,
    );
    if (cands.length !== 1) continue; // ambiguous or none: leave both open
    addTie('CN_AMOUNT_DATE', 'PROBABLE', [cands[0], cn], { lagDays: days(cands[0].date, cn.date) });
  }

  // 3. Payments against open invoice targets (LPG + OTHER of one invoice doc)
  const targets = new Map(); // clean_doc -> { doc, date, rows, amount }
  for (const r of invoiceRows) {
    if (!rules.paymentTargetLanes.includes(r.lane) || !free(r)) continue;
    if (!targets.has(r.clean_doc)) targets.set(r.clean_doc, { doc: r.clean_doc, date: r.date, rows: [], amount: 0 });
    const t = targets.get(r.clean_doc);
    t.rows.push(r);
    t.amount = round2(t.amount + r.amount);
  }
  const open = () => [...targets.values()].filter((t) => t.amount > 0 && t.rows.every(free));

  const payments = rows
    .filter((r) => r.kind === 'payment' && r.entry_type !== 'Bank UD' && r.amount < 0 && free(r))
    .sort((a, b) => a.date.localeCompare(b.date) || a.clean_doc.localeCompare(b.clean_doc));

  const unallocated = [];
  const pick = (cands, A, pDate) =>
    cands
      .map((c) => ({ ...c, variance: round2(A - c.total), gap: c.gap }))
      .sort((a, b) => Math.abs(a.variance) - Math.abs(b.variance) || a.gap - b.gap)[0];

  for (const p of payments) {
    const A = round2(-p.amount);
    const eligible = open().filter((t) => t.date <= p.date);
    const single = eligible.map((t) => ({ set: [t], total: t.amount, gap: days(t.date, p.date) }));

    // a. exact single
    let best = pick(single.filter((c) => Math.abs(A - c.total) <= rules.exactTolerance), A, p.date);
    let rule = 'EXACT_SINGLE';
    let conf = 'CONFIRMED';

    // b. exact billing-month sum (≥ 2 invoices; a 1-invoice month is covered by a.)
    if (!best) {
      const months = new Map();
      for (const t of eligible) {
        const m = t.date.slice(0, 7);
        if (!months.has(m)) months.set(m, []);
        months.get(m).push(t);
      }
      const monthCands = [...months.values()]
        .filter((set) => set.length >= 2)
        .map((set) => ({
          set,
          total: round2(set.reduce((s, t) => s + t.amount, 0)),
          gap: Math.max(...set.map((t) => days(t.date, p.date))),
        }))
        .filter((c) => Math.abs(A - c.total) <= rules.exactTolerance);
      best = pick(monthCands, A, p.date);
      rule = 'EXACT_MONTH_SUM';
    }

    // c. exact sum of 2–3 invoices
    if (!best) {
      const pool = eligible.sort((a, b) => b.date.localeCompare(a.date)).slice(0, rules.combinationPool);
      const cands = [];
      for (let k = 2; k <= rules.maxSumInvoices; k++) {
        for (const set of combos(pool, k)) {
          const total = round2(set.reduce((s, t) => s + t.amount, 0));
          if (Math.abs(A - total) <= rules.exactTolerance) {
            cands.push({ set, total, gap: set.reduce((s, t) => s + days(t.date, p.date), 0) });
          }
        }
      }
      best = pick(cands, A, p.date);
      rule = 'EXACT_SUM';
    }

    // d. proximity (probable)
    if (!best) {
      best = pick(single.filter((c) => Math.abs(A - c.total) <= rules.proximityTolerance), A, p.date);
      rule = 'PROXIMITY';
      conf = 'PROBABLE';
    }

    // e. near sum of 2–3 invoices within truncation tolerance (probable)
    if (!best) {
      const pool = eligible.sort((a, b) => b.date.localeCompare(a.date)).slice(0, rules.combinationPool);
      const cands = [];
      for (let k = 2; k <= rules.maxSumInvoices; k++) {
        for (const set of combos(pool, k)) {
          const total = round2(set.reduce((s, t) => s + t.amount, 0));
          if (Math.abs(A - total) <= rules.nearSumTolerance) {
            cands.push({ set, total, gap: set.reduce((s, t) => s + days(t.date, p.date), 0) });
          }
        }
      }
      best = pick(cands, A, p.date);
      rule = 'NEAR_SUM';
      conf = 'PROBABLE';
    }

    if (!best) {
      unallocated.push(p.row_id);
      continue;
    }
    addTie(rule, conf, [p, ...best.set.flatMap((t) => t.rows)], {
      payment: { doc: p.clean_doc, date: p.date, amount: A },
      invoices: best.set.map((t) => ({ doc: t.doc, date: t.date, amount: t.amount })),
      variance: best.variance,
    });
  }

  // Proof: B/F + Σ untied rows + Σ tie nets = closing combined (and the ERP header).
  const untied = rows.filter(free);
  const sum = (xs) => round2(xs.reduce((s, r) => s + r.amount, 0));
  const bucket = (pred) => {
    const xs = untied.filter(pred);
    return { count: xs.length, amount: sum(xs), rows: xs.map((r) => r.row_id) };
  };
  const residual = {
    openingBfUnitemised: projection.openings.combinedBf,
    openInvoicesLpgOther: bucket((r) => r.kind === 'invoice' && r.lane !== 'CYL'),
    openInvoicesCyl: bucket((r) => r.kind === 'invoice' && r.lane === 'CYL'),
    unmatchedCredits: bucket((r) => r.kind === 'credit_note'),
    unallocatedPayments: bucket((r) => r.kind === 'payment'),
    otherUntied: bucket((r) => !['invoice', 'credit_note', 'payment'].includes(r.kind)),
    tieNets: round2(ties.reduce((s, t) => s + t.net, 0)),
  };
  const rebuilt = round2(
    residual.openingBfUnitemised +
      residual.openInvoicesLpgOther.amount +
      residual.openInvoicesCyl.amount +
      residual.unmatchedCredits.amount +
      residual.unallocatedPayments.amount +
      residual.otherUntied.amount +
      residual.tieNets,
  );

  const count = (pred) => ties.filter(pred).length;
  return {
    matcherVersion: MATCHER_VERSION,
    rules,
    summary: {
      ties: ties.length,
      confirmed: count((t) => t.confidence === 'CONFIRMED'),
      probable: count((t) => t.confidence === 'PROBABLE'),
      byRule: Object.fromEntries(
        [...new Set(ties.map((t) => t.rule))].map((r) => [r, count((t) => t.rule === r)]),
      ),
      paymentsTotal: payments.length,
      paymentsUnallocated: unallocated.length,
    },
    proof: {
      rebuiltClosing: rebuilt,
      projectionClosing: projection.closings.combined,
      erpCurrentBalance: projection.source.erpCurrentBalance,
      holds: Math.abs(rebuilt - projection.closings.combined) < 0.005,
    },
    residual,
    ties,
    unallocatedPayments: unallocated,
  };
}
