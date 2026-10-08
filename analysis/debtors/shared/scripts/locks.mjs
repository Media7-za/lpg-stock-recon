/**
 * Locks & period close — proposals P5–P6 of PROPOSED_Projection_Matching_Locks.md
 * (PROPOSED — NOT RATIFIED). Pure: no file I/O.
 *
 * Registry home (P5): the account's config/payment_pattern_overrides.json, under a
 * new top-level key `projectionLocks`. Existing `overrides` entries are never touched,
 * so the per-account engines that read them keep working.
 *
 *   projectionLocks: {
 *     schema: 1,
 *     closes: [{ close_id, closedThrough, closedAt, closedBy, session, gates, locksCreated, value }],
 *     locks:  [{ lock_id, close_id, status: 'auto_locked'|'approved', rule, tie_basis,
 *                members: [{ key, doc, entry_type, lane, date, amount }], createdAt }],
 *     voids:  [{ target: 'close'|'lock', id, voidedAt, voidedBy, reason }]
 *   }
 *
 * Append-only: closes, locks and voids are only ever appended. A void makes its target
 * (and, for a close, all of that close's locks) inactive; nothing is edited in place.
 *
 * Lock members are keyed by document, entry type, lane, date and amount — never by TXT
 * line number, which shifts when a new export is taken. If a locked member is missing
 * or changed in a fresh projection, the lock becomes a CONFLICT (its tripwire): its rows
 * are left untied and further closes are blocked until it is voided or resolved.
 */

export const LOCKS_SCHEMA = 1;

export const rowKey = (r) => `${r.clean_doc}|${r.entry_type}|${r.lane}|${r.date}|${Number(r.amount).toFixed(2)}`;

export function emptyLocks() {
  return { schema: LOCKS_SCHEMA, closes: [], locks: [], voids: [] };
}

/** Active closes / locks after applying voids, plus the effective closedThrough. */
export function effectiveLocks(registry) {
  const pl = registry?.projectionLocks || emptyLocks();
  const voided = new Set((pl.voids || []).map((v) => `${v.target}:${v.id}`));
  const closes = (pl.closes || []).filter((c) => !voided.has(`close:${c.close_id}`));
  const activeCloseIds = new Set(closes.map((c) => c.close_id));
  const locks = (pl.locks || []).filter(
    (l) => !voided.has(`lock:${l.lock_id}`) && (!l.close_id || activeCloseIds.has(l.close_id)),
  );
  const closedThrough = closes.reduce((m, c) => (c.closedThrough > m ? c.closedThrough : m), '');
  return { closes, locks, closedThrough: closedThrough || null };
}

function nextId(prefix, existing) {
  const n = existing.reduce((m, x) => {
    const k = Number(String(x).replace(prefix, ''));
    return Number.isFinite(k) && k > m ? k : m;
  }, 0);
  return `${prefix}${String(n + 1).padStart(4, '0')}`;
}

/**
 * Plan a period close through `through` (YYYY-MM-DD). Applies the P6 split gate:
 *  - projection self-checks pass and it ties to the ERP header (variance R0.00);
 *  - the matcher proof holds and there are no lock conflicts;
 *  - tag-check gate is not BLOCKED (NOT_DERIVABLE_FROM_TXT is recorded, not blocking);
 *  - `through` is after any existing close, on/after periodStart, not beyond the TXT's
 *    last row (stale guard), and before the earliest ingest gap (partial-ingest guard).
 * Only CONFIRMED ties whose every member is dated on/before `through` are locked.
 */
export function planClose({ projection, matches, registry, through, ingestGapEarliest = null, tagGate = null, closedBy, session, now }) {
  const reasons = [];
  const eff = effectiveLocks(registry);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(through))) reasons.push(`invalid --through ${through}`);
  if (!projection.checks?.lpgRowsReproduce1A || !projection.checks?.cylRowsReproduce1B) {
    reasons.push('projection self-checks fail');
  }
  if (!projection.checks?.tiesToErpHeader) reasons.push(`projection does not tie to ERP (variance R${projection.closings?.erpVariance})`);
  if (!matches.proof?.holds) reasons.push('matcher residual proof does not hold');
  if ((matches.lockConflicts || []).length) reasons.push(`${matches.lockConflicts.length} lock conflict(s) unresolved`);
  if (tagGate === 'BLOCKED') reasons.push('tag-check gate BLOCKED');
  if (eff.closedThrough && through <= eff.closedThrough) reasons.push(`already closed through ${eff.closedThrough}`);
  if (through < projection.window.periodStart) reasons.push(`through ${through} is before periodStart ${projection.window.periodStart}`);
  if (through > projection.window.lastRowDate) {
    reasons.push(`through ${through} is beyond the TXT's last row ${projection.window.lastRowDate} (stale guard)`);
  }
  if (ingestGapEarliest && through >= ingestGapEarliest) {
    reasons.push(`ingest gap on ${ingestGapEarliest}: partial close allowed only through the day before`);
  }

  const rowById = new Map(projection.rows.map((r) => [r.row_id, r]));
  const lockedKeys = new Set(eff.locks.flatMap((l) => l.members.map((m) => m.key)));
  const candidates = matches.ties.filter(
    (t) =>
      t.confidence === 'CONFIRMED' &&
      t.rule !== 'LOCKED' &&
      t.members.every((id) => rowById.get(id)?.date <= through) &&
      t.members.every((id) => !lockedKeys.has(rowKey(rowById.get(id)))),
  );

  if (reasons.length) return { ok: false, reasons, newLocks: [], close: null };

  const pl = registry?.projectionLocks || emptyLocks();
  const close_id = nextId('C', (pl.closes || []).map((c) => c.close_id));
  let lockSeq = (pl.locks || []).map((l) => l.lock_id);
  const newLocks = candidates.map((t) => {
    const lock_id = nextId('L', lockSeq);
    lockSeq = [...lockSeq, lock_id];
    return {
      lock_id,
      close_id,
      status: 'auto_locked',
      rule: t.rule,
      tie_basis: { tie_id: t.tie_id, ...(t.batchId ? { batchId: t.batchId } : {}), ...(t.variance != null ? { variance: t.variance } : {}) },
      members: t.members.map((id) => {
        const r = rowById.get(id);
        return { key: rowKey(r), doc: r.clean_doc, entry_type: r.entry_type, lane: r.lane, date: r.date, amount: r.amount };
      }),
      createdAt: now,
    };
  });
  const value = Math.round(
    newLocks.reduce((s, l) => s + l.members.filter((m) => m.amount > 0).reduce((a, m) => a + m.amount, 0), 0) * 100,
  ) / 100;
  const close = {
    close_id,
    closedThrough: through,
    closedAt: now,
    closedBy,
    session,
    gates: {
      erpVariance: projection.closings.erpVariance,
      ingestCoverage: projection.ingestGate?.ingestCoverage ?? null,
      tagGate,
      txtSha256: projection.source.txtSha256,
      dbChannel: projection.source.dbChannel,
    },
    locksCreated: newLocks.length,
    value,
    probableLeftOpen: matches.ties.filter((t) => t.confidence === 'PROBABLE').length,
  };
  return { ok: true, reasons: [], newLocks, close };
}

export function applyClose(registry, plan) {
  const pl = registry.projectionLocks || emptyLocks();
  return {
    ...registry,
    projectionLocks: {
      ...pl,
      schema: LOCKS_SCHEMA,
      closes: [...(pl.closes || []), plan.close],
      locks: [...(pl.locks || []), ...plan.newLocks],
      voids: pl.voids || [],
    },
  };
}

/**
 * Operator ruling → `approved` lock (no close needed; close_id null keeps it active on its own).
 *
 *   payment     payment doc (its Payment row, never the Bank UD leg)
 *   invoices    invoice docs it settles (their LPG + OTHER rows; CYL is never a payment target)
 *   treatment   what the tie's net (payment + invoices) means, required when |net| > R0.05:
 *                 'exact'           net within ±R0.05 (default)
 *                 'customer_credit' payment exceeds the invoices; the excess is owed to the customer
 *                 'applied_to_bf'   the excess (or, with no invoices, the whole payment) settles part
 *                                   of the unitemised opening B/F
 *                 'part_payment'    the excess is a part-payment on `partialDoc`, which stays open
 *                 'short_paid'      the invoices exceed the payment; the shortfall is still owed
 * Members are keyed exactly as period-close locks are, so a changed document turns the ruling
 * into a CONFLICT in the next run rather than being silently re-applied.
 */
export function planApproval({ projection, registry, payment, invoices = [], treatment = 'exact', partialDoc = null, reason, approvedBy, session, now }) {
  const reasons = [];
  const TREATMENTS = ['exact', 'customer_credit', 'applied_to_bf', 'part_payment', 'short_paid'];
  if (!TREATMENTS.includes(treatment)) reasons.push(`unknown treatment ${treatment}`);
  if (!reason) reasons.push('a reason (the operator ruling) is required');
  const eff = effectiveLocks(registry);
  const lockedKeys = new Set(eff.locks.flatMap((l) => l.members.map((m) => m.key)));
  const rows = projection.rows;

  const payRows = rows.filter((r) => r.kind === 'payment' && r.entry_type !== 'Bank UD' && r.clean_doc === String(payment) && r.amount < 0);
  if (payRows.length !== 1) reasons.push(`payment ${payment}: expected 1 payment row, found ${payRows.length}`);
  const members = [...payRows];
  for (const doc of invoices) {
    const inv = rows.filter((r) => r.kind === 'invoice' && r.clean_doc === String(doc) && r.lane !== 'CYL');
    if (!inv.length) reasons.push(`invoice ${doc}: no LPG/OTHER rows in the projection`);
    members.push(...inv);
  }
  for (const r of members) if (lockedKeys.has(rowKey(r))) reasons.push(`${r.entry_type} ${r.clean_doc} ${r.lane} is already locked`);
  if (treatment === 'applied_to_bf' && !invoices.length && payRows.length) {
    // whole payment to the opening balance: nothing else to check
  } else if (!invoices.length) {
    reasons.push('no invoices given (use treatment applied_to_bf for a payment against the opening balance)');
  }
  if (treatment === 'part_payment') {
    const target = rows.filter((r) => r.kind === 'invoice' && r.clean_doc === String(partialDoc) && r.lane !== 'CYL');
    if (!partialDoc || !target.length) reasons.push(`part_payment needs partialDoc that is an invoice in the projection (got ${partialDoc})`);
    if (invoices.map(String).includes(String(partialDoc))) reasons.push('partialDoc must not also be a settled invoice');
  }

  const net = Math.round(members.reduce((s, r) => s + r.amount, 0) * 100) / 100;
  const exact = Math.abs(net) <= 0.05;
  if (!reasons.length) {
    if (treatment === 'exact' && !exact) reasons.push(`net R${net} is not within ±R0.05; name a treatment`);
    if (['customer_credit', 'applied_to_bf', 'part_payment'].includes(treatment) && net >= 0) reasons.push(`treatment ${treatment} needs the payment to exceed the invoices (net R${net})`);
    if (treatment === 'short_paid' && net <= 0) reasons.push(`short_paid needs the invoices to exceed the payment (net R${net})`);
  }
  if (reasons.length) return { ok: false, reasons, lock: null };

  const pl = registry?.projectionLocks || emptyLocks();
  const lock = {
    lock_id: nextId('L', (pl.locks || []).map((l) => l.lock_id)),
    close_id: null,
    status: 'approved',
    rule: 'OPERATOR_RULING',
    ruling: { treatment, ...(partialDoc ? { partialDoc: String(partialDoc) } : {}), net, reason, approvedBy, session },
    members: members.map((r) => ({ key: rowKey(r), doc: r.clean_doc, entry_type: r.entry_type, lane: r.lane, date: r.date, amount: r.amount })),
    createdAt: now,
  };
  return { ok: true, reasons: [], lock };
}

export function applyApproval(registry, plan) {
  const pl = registry.projectionLocks || emptyLocks();
  return {
    ...registry,
    projectionLocks: { ...pl, schema: LOCKS_SCHEMA, closes: pl.closes || [], locks: [...(pl.locks || []), plan.lock], voids: pl.voids || [] },
  };
}

export function applyVoid(registry, { target, id, voidedBy, reason, now }) {
  const pl = registry.projectionLocks || emptyLocks();
  const exists = target === 'close' ? (pl.closes || []).some((c) => c.close_id === id) : (pl.locks || []).some((l) => l.lock_id === id);
  if (!exists) throw new Error(`no ${target} ${id}`);
  if ((pl.voids || []).some((v) => v.target === target && v.id === id)) throw new Error(`${target} ${id} already voided`);
  return {
    ...registry,
    projectionLocks: { ...pl, voids: [...(pl.voids || []), { target, id, voidedAt: now, voidedBy, reason }] },
  };
}
