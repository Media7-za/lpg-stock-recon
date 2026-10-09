/**
 * Shared projection matcher — build step 2 of
 * analysis/debtors/shared/docs/PROPOSED_Projection_Matching_Locks.md (PROPOSED — NOT RATIFIED).
 *
 * Pure module: takes a verified v5 projection (data/v5_projection.json) and returns
 * ties between its rows. It only ever *ties* existing rows; it never creates a row,
 * so "open items + tie variances + opening B/F = ERP balance" holds by construction.
 *
 * Rule order (P4 defaults, all accounts):
 *   0. LOCKED           (P5–P6) active locks from the account's projectionLocks registry are
 *                       applied first as fixed facts. A lock whose members are missing or
 *                       changed becomes a CONFLICT and its rows stay untied. Every other rule
 *                       then runs on the unlocked frontier: rows no lock has taken, whatever
 *                       their date, so late evidence (e.g. a remittance for an old payment) can
 *                       still resolve closed-period open items. A new tie whose members all
 *                       fall on/before closedThrough is flagged `inClosedPeriod` for review;
 *                       the next close locks it if CONFIRMED. Operator rulings (approve_tie.mjs,
 *                       status 'approved', no close) are applied the same way and carry their
 *                       `ruling` (treatment of the tie's net) through to the open-items view.
 *   1. UD_CLEARING      Bank UD (+) and Payment (−) on the same doc, equal and opposite.
 *   1b. REMITTANCE      (P11; only when remittance evidence is supplied) the advice names
 *                       the payment doc and every document it settles. Ties the payment and
 *                       all lanes of every named document (CYL included, because the customer
 *                       says so). Requires every named document to be in the projection and
 *                       Σ advice lines = payment within max(R0.05, 0.1%). CONFIRMED when every
 *                       line also equals the document's ERP amount (±R0.05); PROBABLE with
 *                       the line discrepancies listed otherwise. Advice discounts are carried
 *                       as `discountPending` (P9 journals pending), not as rounding.
 *                       Batches that cannot be applied are reported, never forced.
 *   2. CN_DN_PAIR       credit note ↔ invoice, same lane, same delivery-note number,
 *                       exactly opposite amount; CONFIRMED when CN is 0–1 day after
 *                       the invoice, otherwise PROBABLE. (TXT exports carry no CN→invoice
 *                       tag when taken with EXCLUDE: ALLOCATION DETAIL, so the DN ref is the
 *                       pairing evidence — same basis as dn_pair_reconcile.mjs.)
 *      CN_AMOUNT_DATE   fallback when no DN number pairs: same lane, exactly opposite
 *                       amount, CN 0–1 day after, and exactly one candidate → PROBABLE.
 *   3. Payments against open invoice targets (LPG + OTHER lanes of one invoice doc; CYL is
 *      never a payment target), in two passes (v4): every payment, chronologically, tries the
 *      exact rules a–c first; only then do the remaining payments try the probable rules d–e.
 *      So a probable guess can never take an invoice that a later payment matches exactly.
 *        a. EXACT_SINGLE      |payment − invoice| ≤ R0.05                → CONFIRMED
 *        b. EXACT_MONTH_SUM   = all open invoices of one billing month   → CONFIRMED
 *        c. EXACT_SUM         = 2–3 open invoices (≤ R0.05)              → CONFIRMED
 *        c2. EXACT_RUN        = 4–12 consecutive open invoices (≤ R0.05) → CONFIRMED (ADM-85);
 *                             oldest run first; PROBABLE if another run fits equally well
 *        d. PROXIMITY         one open invoice within ±R5.00             → PROBABLE
 *        e. NEAR_SUM          2–3 open invoices within ±R1.00 (skill Tier 2
 *                             truncation tolerance)                       → PROBABLE
 *        f. otherwise UNALLOCATED
 *      Only invoices dated on or before the payment are eligible (no prepayment).
 *      Tie-break (operator ruling): exact, then smallest variance, then closest to the
 *      payment date. SUPERSEDED 2026-10-08 (operator, ADM-86: "45591 should have been 52195";
 *      "FIFO within this proximity"; "Let's do it"): exact, then smallest variance, then the
 *      OLDEST invoice among candidates within fifoWindowDays (14) of the closest one.
 *   4. BATCH_SUM        (v5, operator 2026-10-09: "A customer very rarely pays for part of an
 *                       invoice. The combination of batches probably need to be reviewed.")
 *                       Payments still unallocated after rule 3: 1–3 of them together settle
 *                       1–2 whole delivery batches (every open invoice row sharing a DN number,
 *                       gas AND cylinder deposit lanes; at least one gas/other row, so a deposit
 *                       alone is never a target) within ±R0.05. Payments must fall on or
 *                       after the batch and within batchWindowDays of it. A payment of
 *                       ≤ R0.05 that exactly removes the remaining variance is absorbed as the
 *                       rounding cent. Always PROBABLE (operator approves via approve_tie).
 *   5. CYL_EXCHANGE     (v5) cylinder deposit invoices and empties credit notes left unpaired
 *                       (counts differ, so amounts differ) are a custody exchange chain. In date
 *                       order, every stretch whose running total returns to R0.00 is closed as
 *                       one CONFIRMED group (net R0.00); the same is done from the latest row
 *                       backwards, so only the genuinely outstanding middle stays open.
 *   A tie touching a row whose split_basis is not confirmable (HEADER_FALLBACK, P10)
 *   is downgraded to PROBABLE.
 *
 * Not yet implemented (later build steps): locks / period close (P5–P6), mirror carry
 * for monthly batch payers (opt-in, P4), settlement discount (P9), remittance evidence
 * (P11), payerGroup (P8), pre-window lookback (P7).
 */

import { rowKey } from './locks.mjs';

export const MATCHER_VERSION = 5;

export const RULES = Object.freeze({
  exactTolerance: 0.05,
  proximityTolerance: 5.0,
  nearSumTolerance: 1.0,
  cnConfirmedMaxDays: 1,
  maxSumInvoices: 3,
  maxRunInvoices: 12,
  fifoWindowDays: 14, // FIFO tie-break only among candidates within 14 days of the closest // EXACT_RUN: longest run of consecutive open invoices one payment may settle
  combinationPool: 40, // most recent open invoices considered for 2–3 invoice sums
  paymentTargetLanes: ['LPG', 'OTHER'],
  batchMaxPayments: 3, // BATCH_SUM: payments combined against delivery batches
  batchMaxBatches: 2,
  batchWindowDays: 120, // last payment no later than this after the batch
  batchPool: 40, // most recent open batches considered
  cylExchange: true,
  remittanceLineTolerance: 0.05,
  remittanceBatchTolerancePct: 0.001,
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

export function matchProjection(projection, rules = RULES, evidence = null, locks = null) {
  const rows = projection.rows;
  const tiedRow = new Map(); // row_id -> tie_id
  const ties = [];
  const addTie = (rule, confidence, members, extra = {}) => {
    const tie_id = `T${String(ties.length + 1).padStart(4, '0')}`;
    let conf = confidence;
    if (conf === 'CONFIRMED' && members.some((r) => !r.confirmable)) conf = 'PROBABLE';
    const net = round2(members.reduce((s, r) => s + r.amount, 0));
    const inClosedPeriod = Boolean(closedThrough) && rule !== 'LOCKED' && members.every((r) => r.date <= closedThrough);
    ties.push({
      tie_id,
      rule,
      confidence: conf,
      members: members.map((r) => r.row_id),
      docs: [...new Set(members.map((r) => `${r.entry_type} ${r.clean_doc}`))],
      net,
      ...(inClosedPeriod ? { inClosedPeriod: true } : {}),
      ...extra,
    });
    for (const r of members) tiedRow.set(r.row_id, tie_id);
    return tie_id;
  };
  const free = (r) => !tiedRow.has(r.row_id);
  const closedThrough = locks?.closedThrough || null;

  // 0. Locks (P5–P6): fixed facts, matched by stable key, never by TXT line number.
  const lockConflicts = [];
  let locksApplied = 0;
  if (locks?.locks?.length) {
    const byKey = new Map();
    for (const r of rows) {
      const k = rowKey(r);
      if (!byKey.has(k)) byKey.set(k, []);
      byKey.get(k).push(r);
    }
    for (const lock of locks.locks) {
      const members = [];
      const problems = [];
      for (const m of lock.members) {
        const cand = (byKey.get(m.key) || []).find((r) => free(r) && !members.includes(r));
        if (cand) members.push(cand);
        else problems.push(`${m.entry_type} ${m.doc} ${m.lane} ${m.date} R${m.amount} not found unchanged`);
      }
      if (problems.length) {
        lockConflicts.push({ lock_id: lock.lock_id, close_id: lock.close_id, problems });
        continue;
      }
      addTie('LOCKED', 'CONFIRMED', members, {
        lock_id: lock.lock_id,
        close_id: lock.close_id,
        lockedRule: lock.rule,
        ...(lock.ruling ? { ruling: lock.ruling } : {}),
      });
      locksApplied += 1;
    }
  }

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

  // 1b. Remittance evidence (P11): runs before any pattern rule.
  const remittance = { applied: [], unresolved: [] };
  for (const b of evidence?.batches || []) {
    const fail = (reason) => remittance.unresolved.push({ batchId: b.batchId, paymentDoc: b.paymentDoc, reason });
    const pay = rows.find((r) => r.kind === 'payment' && r.entry_type !== 'Bank UD' && r.clean_doc === b.paymentDoc);
    if (!pay) {
      fail('payment not in projection window / TXT');
      continue;
    }
    if (!free(pay)) {
      fail(`payment row already tied (${tiedRow.get(pay.row_id)})`);
      continue;
    }
    const lineRows = [];
    const missing = [];
    const discrepancies = [];
    // An advice may list one document on several lines (e.g. gas and cylinder deposit
    // separately); compare and tie each document once, against the sum of its lines.
    const byDocLine = new Map();
    for (const l of b.lines) {
      const k = `${l.docType}|${l.doc}`;
      const agg = byDocLine.get(k) || { doc: l.doc, docType: l.docType, gross: 0 };
      agg.gross = round2(agg.gross + l.gross);
      byDocLine.set(k, agg);
    }
    for (const l of byDocLine.values()) {
      const docRows = rows.filter((r) => r.clean_doc === l.doc && r.entry_type === l.docType);
      if (!docRows.length) {
        missing.push(`${l.docType} ${l.doc}`);
        continue;
      }
      const taken = docRows.filter((r) => !free(r));
      if (taken.length) {
        missing.push(`${l.docType} ${l.doc} (already tied ${tiedRow.get(taken[0].row_id)})`);
        continue;
      }
      const erpAmount = round2(docRows.reduce((s, r) => s + r.amount, 0));
      if (Math.abs(erpAmount - l.gross) > rules.remittanceLineTolerance) {
        discrepancies.push({ doc: `${l.docType} ${l.doc}`, advice: l.gross, erp: erpAmount, diff: round2(l.gross - erpAmount) });
      }
      lineRows.push(...docRows);
    }
    if (missing.length) {
      fail(`documents not available: ${missing.join(', ')}`);
      continue;
    }
    // A line this advice settles only in part (paid ≠ gross − discount) means the document is
    // spread over several remittances. Tying it here would hide the remainder, so leave the
    // batch unresolved until combined-batch evidence exists.
    const split = b.lines.filter((l) => l.alreadyPaid);
    if (split.length) {
      fail(`documents settled over several remittances: ${split.map((l) => `${l.docType} ${l.doc} R${l.alreadyPaid} not settled by this advice`).join(', ')}`);
      continue;
    }
    const paid = round2(b.lines.reduce((s, l) => s + l.paid, 0));
    const cash = round2(-pay.amount);
    const tol = Math.max(rules.exactTolerance, rules.remittanceBatchTolerancePct * cash);
    if (Math.abs(paid - cash) > tol) {
      fail(`advice lines R${paid} ≠ payment R${cash}`);
      continue;
    }
    const tie_id = addTie('REMITTANCE', discrepancies.length ? 'PROBABLE' : 'CONFIRMED', [pay, ...lineRows], {
      batchId: b.batchId,
      evidence: b.source,
      payment: { doc: pay.clean_doc, date: pay.date, amount: cash },
      invoices: [...byDocLine.values()].map((l) => ({ doc: l.doc, docType: l.docType, amount: l.gross })),
      discountPending: round2(b.lines.reduce((s, l) => s + l.discount, 0)),
      lineDiscrepancies: discrepancies,
      ...(b.discountJournal ? { discountJournal: b.discountJournal } : {}),
      variance: round2(paid - cash),
    });
    remittance.applied.push({ batchId: b.batchId, tie_id });
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
  // Tie-break: smallest variance; then, among the equally good candidates, the oldest one that
  // is still within fifoWindowDays of the closest one (FIFO within proximity — operator ruling
  // 2026-10-08, ADM-86). Unbounded FIFO was tried and rejected: it reached back months and
  // overturned recorded rulings (e.g. MOZ002 43640 ↔ 49550, ratified 2026-07-20).
  const pick = (cands, A) => {
    if (!cands.length) return undefined;
    const ranked = cands.map((c) => ({ ...c, variance: round2(A - c.total) }));
    const bestVar = Math.min(...ranked.map((c) => Math.abs(c.variance)));
    const tied = ranked.filter((c) => Math.abs(c.variance) === bestVar);
    const nearest = Math.min(...tied.map((c) => c.gap));
    const window = tied.filter((c) => c.gap <= nearest + rules.fifoWindowDays * c.set.length);
    return window.sort((a, b) => b.gap - a.gap)[0];
  };

  const sumCands = (eligible, A, tol, pDate) => {
    const pool = eligible.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, rules.combinationPool);
    const cands = [];
    for (let k = 2; k <= rules.maxSumInvoices; k++) {
      for (const set of combos(pool, k)) {
        const total = round2(set.reduce((s, t) => s + t.amount, 0));
        if (Math.abs(A - total) <= tol) cands.push({ set, total, gap: set.reduce((s, t) => s + days(t.date, pDate), 0) });
      }
    }
    return cands;
  };

  // Exact rules (CONFIRMED) for every payment first, then probable rules on what is left, so a
  // probable guess for an earlier payment can never consume an invoice a later payment matches exactly.
  const tryExact = (p, A, eligible) => {
    const single = eligible.map((t) => ({ set: [t], total: t.amount, gap: days(t.date, p.date) }));
    // a. exact single
    let best = pick(single.filter((c) => Math.abs(A - c.total) <= rules.exactTolerance), A, p.date);
    if (best) return { best, rule: 'EXACT_SINGLE' };
    // b. exact billing-month sum (≥ 2 invoices; a 1-invoice month is covered by a.)
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
    if (best) return { best, rule: 'EXACT_MONTH_SUM' };
    // c. exact sum of 2–3 invoices
    best = pick(sumCands(eligible, A, rules.exactTolerance, p.date), A, p.date);
    if (best) return { best, rule: 'EXACT_SUM' };
    // c2. exact sum of a run of 4+ consecutive open invoices (date order, no gaps among the
    //     open invoices). Operator ruling 2026-10-08 (ADM-85): customers such as MOZ002 pay a
    //     batch of consecutive deliveries in one transfer.
    const byDate = eligible.slice().sort((a, b) => a.date.localeCompare(b.date) || a.doc.localeCompare(b.doc));
    const runs = [];
    for (let i = 0; i < byDate.length; i++) {
      let total = 0;
      for (let j = i; j < byDate.length && j - i < rules.maxRunInvoices; j++) {
        total = round2(total + byDate[j].amount);
        if (j - i + 1 > rules.maxSumInvoices && Math.abs(A - total) <= rules.exactTolerance) {
          const set = byDate.slice(i, j + 1);
          runs.push({ set, total, gap: set.reduce((s, t) => s + days(t.date, p.date), 0) });
        }
      }
    }
    // Tie-break for runs is oldest-first (a batch payer settles its oldest deliveries), not
    // closest-date. If another run fits equally well (e.g. two invoices of the same amount),
    // the tie is PROBABLE and lists how many alternatives there were.
    if (runs.length) {
      const ranked = runs
        .map((c) => ({ ...c, variance: round2(A - c.total) }))
        .sort((a, b) => Math.abs(a.variance) - Math.abs(b.variance) || a.set[0].date.localeCompare(b.set[0].date));
      const alternatives = ranked.filter((c) => Math.abs(c.variance) === Math.abs(ranked[0].variance)).length - 1;
      return { best: ranked[0], rule: 'EXACT_RUN', ...(alternatives ? { conf: 'PROBABLE', extra: { ambiguousAlternatives: alternatives } } : {}) };
    }
    return null;
  };
  const tryProbable = (p, A, eligible) => {
    const single = eligible.map((t) => ({ set: [t], total: t.amount, gap: days(t.date, p.date) }));
    // d. proximity
    let best = pick(single.filter((c) => Math.abs(A - c.total) <= rules.proximityTolerance), A, p.date);
    if (best) return { best, rule: 'PROXIMITY' };
    // e. near sum of 2–3 invoices within truncation tolerance
    best = pick(sumCands(eligible, A, rules.nearSumTolerance, p.date), A, p.date);
    if (best) return { best, rule: 'NEAR_SUM' };
    return null;
  };

  for (const [tryRule, conf] of [
    [tryExact, 'CONFIRMED'],
    [tryProbable, 'PROBABLE'],
  ]) {
    for (const p of payments) {
      if (!free(p)) continue;
      const A = round2(-p.amount);
      const eligible = open().filter((t) => t.date <= p.date);
      const hit = tryRule(p, A, eligible);
      if (!hit) continue;
      addTie(hit.rule, hit.conf || conf, [p, ...hit.best.set.flatMap((t) => t.rows)], {
        ...(hit.extra || {}),
        payment: { doc: p.clean_doc, date: p.date, amount: A },
        invoices: hit.best.set.map((t) => ({ doc: t.doc, date: t.date, amount: t.amount })),
        variance: hit.best.variance,
      });
    }
  }
  // 4. BATCH_SUM: combinations of unallocated payments against whole delivery batches.
  const batchSum = () => {
    const batches = new Map();
    for (const r of invoiceRows) {
      if (!free(r) || r.amount <= 0) continue;
      const k = dnNumber(r.ref_no) ? `DN${dnNumber(r.ref_no)}` : `DOC${r.clean_doc}`;
      if (!batches.has(k)) batches.set(k, { key: k, rows: [], date: r.date, amount: 0 });
      const b = batches.get(k);
      b.rows.push(r);
      if (r.date < b.date) b.date = r.date;
      b.amount = round2(b.amount + r.amount);
    }
    const pool = [...batches.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, rules.batchPool);
    const pays = payments.filter((p) => free(p) && -p.amount > rules.exactTolerance);
    const tiny = payments.filter((p) => free(p) && -p.amount <= rules.exactTolerance);
    const cands = [];
    for (let nb = 1; nb <= rules.batchMaxBatches; nb++) {
      for (const bset of combos(pool, nb)) {
        // A deposit-only set is never a payment target (deposit amounts recur, so coincidences are
        // common); a cylinder deposit is only settled by cash together with its delivery's gas.
        if (!bset.some((b) => b.rows.some((r) => rules.paymentTargetLanes.includes(r.lane)))) continue;
        const total = round2(bset.reduce((s, b) => s + b.amount, 0));
        const first = bset.reduce((d, b) => (b.date < d ? b.date : d), bset[0].date);
        const last = bset.reduce((d, b) => (b.date > d ? b.date : d), bset[0].date);
        const eligible = pays.filter((p) => p.date >= last && days(first, p.date) <= rules.batchWindowDays);
        for (let np = 1; np <= rules.batchMaxPayments; np++) {
          if (np === 1 && nb === 1 && bset[0].rows.every((r) => r.lane !== 'CYL')) continue; // rule 3's ground
          for (const pset of combos(eligible, np)) {
            const A = round2(pset.reduce((s, p) => s - p.amount, 0));
            if (Math.abs(A - total) > rules.exactTolerance) continue;
            cands.push({ bset, pset, total, A, variance: round2(A - total) });
          }
        }
      }
    }
    cands.sort(
      (a, b) =>
        Math.abs(a.variance) - Math.abs(b.variance) ||
        a.pset.length + a.bset.length - (b.pset.length + b.bset.length) ||
        a.bset[0].date.localeCompare(b.bset[0].date),
    );
    const used = new Set();
    for (const c of cands) {
      const rowsOf = [...c.pset, ...c.bset.flatMap((b) => b.rows)];
      if (rowsOf.some((r) => used.has(r.row_id) || !free(r))) continue;
      const alternatives = cands.filter(
        (o) => o !== c && Math.abs(o.variance) === Math.abs(c.variance) && o.pset.some((p) => c.pset.includes(p)),
      ).length;
      const members = rowsOf.slice();
      let variance = c.variance;
      const cent = variance ? tiny.find((t) => free(t) && !used.has(t.row_id) && round2(-t.amount) === round2(-variance)) : null;
      if (cent) {
        members.push(cent);
        variance = 0;
      }
      for (const r of members) used.add(r.row_id);
      addTie('BATCH_SUM', 'PROBABLE', members, {
        payments: c.pset.map((p) => ({ doc: p.clean_doc, date: p.date, amount: round2(-p.amount) })),
        batches: c.bset.map((b) => ({ batch: b.key, date: b.date, amount: b.amount, docs: [...new Set(b.rows.map((r) => `${r.lane} ${r.clean_doc}`))] })),
        ...(cent ? { roundingCent: { doc: cent.clean_doc, date: cent.date, amount: round2(-cent.amount) } } : {}),
        ...(alternatives ? { ambiguousAlternatives: alternatives } : {}),
        variance,
      });
    }
  };
  batchSum();

  // 5. CYL_EXCHANGE: zero-sum stretches of the unpaired cylinder deposit chain.
  if (rules.cylExchange) {
    const chain = rows
      .filter((r) => r.lane === 'CYL' && (r.kind === 'invoice' || r.kind === 'credit_note') && free(r))
      .sort((a, b) => a.date.localeCompare(b.date) || (a.txt_line ?? 0) - (b.txt_line ?? 0));
    const segment = (list) => {
      const segs = [];
      let run = 0;
      let start = 0;
      list.forEach((r, i) => {
        run = round2(run + r.amount);
        if (Math.abs(run) < 0.005) {
          if (i - start >= 1) segs.push(list.slice(start, i + 1));
          start = i + 1;
          run = 0;
        }
      });
      return { segs, rest: list.slice(start) };
    };
    const fwd = segment(chain);
    const back = segment(fwd.rest.slice().reverse());
    for (const seg of [...fwd.segs, ...back.segs.map((s) => s.slice().reverse())]) {
      addTie('CYL_EXCHANGE', 'CONFIRMED', seg, {
        from: seg[0].date,
        to: seg[seg.length - 1].date,
        invoices: seg.filter((r) => r.kind === 'invoice').length,
        creditNotes: seg.filter((r) => r.kind === 'credit_note').length,
      });
    }
  }

  for (const p of payments) if (free(p)) unallocated.push(p.row_id);

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
    discountJournalsPending: round2(ties.reduce((s, t) => s + (t.discountPending || 0), 0)),
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
    closedThrough,
    locksApplied,
    lockConflicts,
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
    remittance: evidence
      ? { batches: evidence.batches.length, applied: remittance.applied, unresolved: remittance.unresolved, skippedSources: evidence.skipped || [] }
      : null,
    ties,
    unallocatedPayments: unallocated,
  };
}
