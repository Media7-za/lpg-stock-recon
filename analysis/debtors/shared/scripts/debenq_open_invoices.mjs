/**
 * Shared open-invoice model for ERP DEBENQ TXT exports.
 *
 * Single source of truth for (a) reconstructing which invoices are still open
 * from a DEBENQ TXT and (b) measuring how much that reconstruction can be
 * trusted. Both must live together: the trust check is only meaningful if it
 * scores the exact same model the statement is built from.
 *
 * THE UNTAGGED-SLICE PROBLEM
 * --------------------------
 * ERP settles an invoice by posting a Crd Note / Payment / Journal row whose
 * INVNO column carries the invoice it clears. That tagging is NOT reliable:
 * ERP frequently posts a payment slice with a BLANK INVNO. The account
 * running balance (and therefore CURRENT BALANCE) is still correct, but the
 * per-invoice reconstruction below has no way to know which invoice that
 * money cleared — so an already-paid invoice keeps showing as open forever.
 *
 * Reference case: TWK002 invoices 42468 / 42470, settled 30/05/2025 by the
 * untagged R7,306.68 slice of payment 00039080 (STAT 114), still listed as
 * open on the customer statement 15 months later until caught by hand on
 * 2026-08-11. See analysis/debtors/TWK002/reports/TWK002_Stale_Open_Invoices_2026-08-11.md.
 *
 * Consequence: an open-invoice list derived from this model is a HYPOTHESIS,
 * not a fact, for any invoice dated before an untagged credit row. Never send
 * one to a customer without running analyseInvoiceTagCoverage over it.
 */
import fs from 'fs';
import path from 'path';

/** ERP ENTRY literals that settle (credit) an invoice. */
export const PAYMENT_TYPES = new Set(['Payment', 'Journal', 'Ud Paymnt', 'Bank XFer', 'Bank Dep']);

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (const c of line) {
    if (c === '"') {
      inQ = !inQ;
      continue;
    }
    if (c === ',' && !inQ) {
      out.push(cur);
      cur = '';
      continue;
    }
    cur += c;
  }
  out.push(cur);
  return out;
}

export function normDoc(s) {
  const d = String(s || '').replace(/\D/g, '');
  return d ? String(parseInt(d, 10)) : '';
}

export function parseTxtDate(s) {
  const [d, m, y] = s.split('/');
  const yyyy = y.length === 2 ? `20${y}` : y;
  return `${yyyy}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

export function displayDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-ZA', { month: 'short' })} ${d.getFullYear()}`;
}

export function fmtAmount(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Parse a DEBENQ_*.TXT export, keeping the ERP running-balance column (p[10]).
 * `balanceBf` is the opening BALANCE B/F row — debt carried in from before the
 * export window, which is real but has no invoice detail to itemise against.
 */
export function parseDebenqWithRunning(absPath) {
  const txt = fs.readFileSync(absPath, 'utf8');
  const headerBalance = Number(txt.match(/CURRENT BALANCE:","(-?[0-9.]+)"/)?.[1]);
  // An export taken with "EXCLUDE: ALLOCATION DETAIL" leaves the INVNO column
  // blank on every row, so nothing can be netted to an invoice at all. That is
  // an export defect, not an account problem — see analyseInvoiceTagCoverage.
  const excludesAllocationDetail = /"EXCLUDE:","[^"]*ALLOCATION DETAIL/i.test(txt);
  const rows = [];
  let balanceBf = 0;
  for (const line of txt.split('\n')) {
    if (!/^"\d+"/.test(line.trim())) continue;
    const p = parseCsvLine(line);
    if (p.length < 11) continue;
    const [, , docno, entry, date, invno, dn] = p;
    const amount = round2(Number(p[9]));
    const runningBalance = round2(Number(p[10]));
    if (/BALANCE B\/F/i.test(p[6] || '')) balanceBf = amount;
    if (!date || !date.includes('/')) continue;
    rows.push({
      docno,
      cleanDoc: normDoc(docno),
      entry,
      iso: parseTxtDate(date),
      invno: normDoc(invno),
      dn: (dn || '').trim(),
      amount,
      runningBalance,
    });
  }
  return { headerBalance, balanceBf, excludesAllocationDetail, rows };
}

/** How much of the export's settlement activity actually names an invoice. */
export function measureTaggingCoverage(rows) {
  const settlement = rows.filter((r) => r.entry === 'Crd Note' || PAYMENT_TYPES.has(r.entry));
  const tagged = settlement.filter((r) => r.invno);
  return {
    settlement_rows: settlement.length,
    tagged_rows: tagged.length,
    tagged_pct: settlement.length ? Math.round((tagged.length / settlement.length) * 1000) / 10 : null,
  };
}

/**
 * Open invoice model: Invoice sets base; Crd Note and invoice-tagged
 * Payment/Journal rows net against the matched invoice document. Rows with
 * no invno on a payment/journal are account-level (not invoice-specific) and
 * are absorbed into the reconciliation adjustment, not a per-invoice row.
 *
 * `closedOverrides` excludes invoices already proven paid by external
 * evidence (a remittance advice) whose ERP settlement row was never tagged.
 */
export function computeOpenInvoices(rows, closedOverrides = []) {
  const balance = new Map();
  const meta = new Map();
  const closedDocs = new Set(closedOverrides.map((o) => normDoc(o.doc)));

  for (const r of rows) {
    if (r.entry === 'Invoice') {
      meta.set(r.cleanDoc, { docno: r.docno, iso: r.iso, dn: r.dn });
      balance.set(r.cleanDoc, round2((balance.get(r.cleanDoc) || 0) + r.amount));
    } else if (r.entry === 'Crd Note') {
      const target = r.invno || r.cleanDoc;
      if (!target) continue;
      balance.set(target, round2((balance.get(target) || 0) + r.amount));
    } else if (PAYMENT_TYPES.has(r.entry) && r.invno) {
      balance.set(r.invno, round2((balance.get(r.invno) || 0) + r.amount));
    }
  }

  return [...balance.entries()]
    .filter(([key, bal]) => bal > 0.005 && meta.has(key) && !closedDocs.has(key))
    .map(([key, bal]) => ({ key, due: bal, ...meta.get(key) }))
    .sort((a, b) => a.iso.localeCompare(b.iso) || a.docno.localeCompare(b.docno));
}

/**
 * Credit rows that reduce the account balance but name no invoice — the money
 * that makes the open-invoice list a hypothesis. A Crd Note with no invno is
 * included: computeOpenInvoices falls back to the CN's own doc number, which
 * matches no invoice, so the credit is silently lost from the per-invoice view.
 */
export function findUntaggedCredits(rows) {
  return rows
    .filter((r) => {
      if (r.amount >= 0) return false;
      if (r.entry === 'Crd Note') return !r.invno;
      return PAYMENT_TYPES.has(r.entry) && !r.invno;
    })
    .map((r) => ({
      docno: r.docno,
      entry: r.entry,
      iso: r.iso,
      dn: r.dn,
      amount: r.amount,
    }))
    .sort((a, b) => a.iso.localeCompare(b.iso) || a.docno.localeCompare(b.docno));
}

/**
 * Invoice doc numbers the customer has told us (via a remittance advice) they
 * paid. Reads any analysis/debtors/[CODE]/data/remittance_lines_*.csv.
 * Returns Map<normalisedDoc, { batches: string[], sources: string[] }>.
 */
export function loadRemittanceInvoiceDocs(debtorDir) {
  const dataDir = path.join(debtorDir, 'data');
  const found = new Map();
  if (!fs.existsSync(dataDir)) return found;

  for (const file of fs.readdirSync(dataDir)) {
    if (!/^remittance_lines_.*\.csv$/i.test(file)) continue;
    const lines = fs.readFileSync(path.join(dataDir, file), 'utf8').split('\n').filter((l) => l.trim());
    if (!lines.length) continue;
    const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
    const iBatch = header.indexOf('batch_id');
    const iType = header.indexOf('line_type');
    const iDoc = header.indexOf('doc_no');
    if (iDoc === -1) continue;

    for (const line of lines.slice(1)) {
      const p = parseCsvLine(line);
      if (iType !== -1 && p[iType] !== 'Invoice') continue;
      const doc = normDoc(p[iDoc]);
      if (!doc) continue;
      const entry = found.get(doc) || { batches: [], sources: [] };
      const batch = iBatch !== -1 ? p[iBatch] : '';
      if (batch && !entry.batches.includes(batch)) entry.batches.push(batch);
      if (!entry.sources.includes(file)) entry.sources.push(file);
      found.set(doc, entry);
    }
  }
  return found;
}

/** @typedef {'LIKELY_PAID' | 'STALE_OPEN' | 'CLEAR'} TagRisk */

/** Default: an open invoice separated from the next by ≥ this many days is anomalous. */
export const DEFAULT_STALE_GAP_DAYS = 90;

function daysBetween(isoA, isoB) {
  return Math.round(
    (new Date(`${isoB}T12:00:00`) - new Date(`${isoA}T12:00:00`)) / 86400000,
  );
}

/**
 * Score an open-invoice list for the risk that ERP's incomplete INVNO tagging
 * has left already-settled invoices stranded on it.
 *
 * Two hard signals and one anomaly test, in decreasing strength:
 *
 * 1. OVERSTATED (account invariant, exact)
 *    Σ(open invoices) must never exceed the ERP CURRENT BALANCE. The header is
 *    ground truth — it already reflects every payment, tagged or not. If the
 *    itemised list totals more than the account owes, at least one listed
 *    invoice is provably settled in whole or part. Note the breach is a LOWER
 *    BOUND on the error: understatement elsewhere can mask most of it (the
 *    TWK002 case breached by only R865.77 while the true error was R8,950.44).
 *
 * 2. LIKELY_PAID (per invoice, evidence-based)
 *    The customer's own remittance advice lists the invoice as paid, yet it
 *    still shows open. Near-proof of an untagged settlement row.
 *
 * 3. STALE_OPEN (per invoice, anomaly)
 *    An open invoice separated from the rest of the open cluster by a long
 *    quiet gap, during which untagged credits posted. Customers pay oldest
 *    first: it is not credible that months of later invoices were raised and
 *    settled while this one sat open. This is the shape the TWK002 case made —
 *    two Apr 2025 invoices marooned ten months before the Feb 2026 cluster.
 *
 * Deliberately NOT a signal: "an untagged credit exists after this invoice".
 * For a monthly-batch payer that is true of nearly every invoice, so it flags
 * the whole list and tells you nothing.
 */
export function analyseInvoiceTagCoverage({
  rows,
  openInvoices,
  headerBalance,
  balanceBf = 0,
  excludesAllocationDetail = false,
  closedOverrides = [],
  remittanceDocs = new Map(),
  staleGapDays = DEFAULT_STALE_GAP_DAYS,
  toleranceRands = 0.05,
}) {
  const untaggedCredits = findUntaggedCredits(rows);
  const untaggedTotal = round2(untaggedCredits.reduce((s, r) => s + r.amount, 0));
  const tagging = measureTaggingCoverage(rows);
  const sorted = [...openInvoices].sort((a, b) => a.iso.localeCompare(b.iso));

  // Export defect: no INVNO anywhere. Distinguished from the untagged-slice
  // problem because the remedy is different — re-export from ERP with
  // allocation detail, rather than investigate individual invoices. Scoring
  // invoices here would flag every one of them and mean nothing.
  const noAllocationDetail =
    excludesAllocationDetail || (tagging.settlement_rows >= 5 && tagging.tagged_rows === 0);

  // Everything before the most recent long quiet gap is marooned from the
  // active cluster of genuinely-current debt.
  let staleBeforeIdx = -1;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (daysBetween(sorted[i].iso, sorted[i + 1].iso) >= staleGapDays) staleBeforeIdx = i;
  }

  const assessed = sorted.map((inv, idx) => {
    const remit = remittanceDocs.get(inv.key);
    const creditsAfter = untaggedCredits.filter((c) => c.iso > inv.iso);
    const marooned = idx <= staleBeforeIdx && creditsAfter.length > 0;

    let risk = 'CLEAR';
    let basis = 'Postdates the last long payment gap; consistent with the account’s live debt cluster.';
    if (noAllocationDetail) {
      risk = 'UNASSESSABLE';
      basis = 'Export carries no allocation detail — open/closed status cannot be determined for any invoice.';
    } else if (remit) {
      risk = 'LIKELY_PAID';
      basis = `Listed as paid on remittance ${remit.batches.join(', ') || remit.sources.join(', ')}, yet still open.`;
    } else if (marooned) {
      risk = 'STALE_OPEN';
      basis = `Marooned ${daysBetween(inv.iso, sorted[staleBeforeIdx + 1].iso)} days before the next open invoice, with ${creditsAfter.length} untagged credit row(s) posted since.`;
    }

    return {
      doc: inv.docno.replace(/^0+/, '') || inv.docno,
      key: inv.key,
      iso: inv.iso,
      dn: inv.dn,
      due: inv.due,
      risk,
      basis,
      on_remittance: remit ? { batches: remit.batches, sources: remit.sources } : null,
      untagged_credits_after_invoice: creditsAfter.length,
      untagged_credit_pool_after_invoice: round2(
        creditsAfter.reduce((s, c) => s + c.amount, 0),
      ),
    };
  });

  const counts = {
    likely_paid: assessed.filter((a) => a.risk === 'LIKELY_PAID').length,
    stale_open: assessed.filter((a) => a.risk === 'STALE_OPEN').length,
    clear: assessed.filter((a) => a.risk === 'CLEAR').length,
    unassessable: assessed.filter((a) => a.risk === 'UNASSESSABLE').length,
  };

  const sumOpen = round2(assessed.reduce((s, a) => s + a.due, 0));
  const hasHeader = Number.isFinite(headerBalance);
  const reconciliationGap = hasHeader ? round2(headerBalance - sumOpen) : null;
  const overstatedBy =
    !noAllocationDetail && hasHeader && reconciliationGap < -toleranceRands
      ? round2(-reconciliationGap)
      : 0;

  let gate;
  let blockingReason = null;
  if (noAllocationDetail) {
    gate = 'UNUSABLE_EXPORT';
    blockingReason = 'EXPORT_LACKS_ALLOCATION_DETAIL';
  } else if (counts.likely_paid > 0) {
    gate = 'BLOCKED';
    blockingReason = 'INVOICE_ON_REMITTANCE_STILL_OPEN';
  } else if (overstatedBy > 0) {
    gate = 'BLOCKED';
    blockingReason = 'OPEN_LIST_OVERSTATES_ACCOUNT';
  } else if (counts.stale_open > 0) {
    gate = 'REVIEW_REQUIRED';
    blockingReason = null;
  } else {
    gate = 'ALLOWED';
  }

  return {
    gate,
    blocking_reason: blockingReason,
    export_quality: noAllocationDetail ? 'NO_ALLOCATION_DETAIL' : 'ALLOCATION_DETAIL_PRESENT',
    tagging,
    counts,
    invariant: {
      name: 'Σ(open invoices) ≤ ERP CURRENT BALANCE',
      status: noAllocationDetail
        ? 'NOT_APPLICABLE'
        : !hasHeader
          ? 'UNVERIFIED'
          : overstatedBy > 0
            ? 'BREACHED'
            : 'PASS',
      overstated_by: overstatedBy,
    },
    untagged_credits: untaggedCredits,
    untagged_credit_total: untaggedTotal,
    last_untagged_credit_date: untaggedCredits.length
      ? untaggedCredits[untaggedCredits.length - 1].iso
      : null,
    stale_gap_days: staleGapDays,
    sum_open_invoices: sumOpen,
    header_balance: hasHeader ? headerBalance : null,
    balance_bf: balanceBf,
    reconciliation_gap: reconciliationGap,
    ratified_closed: closedOverrides.map((o) => ({ doc: normDoc(o.doc), reason: o.reason || '' })),
    invoices: assessed,
  };
}

export const GATE_MEANING = {
  ALLOWED:
    'Open-invoice list ties within the ERP balance and shows no marooned invoices. Safe for customer-facing use.',
  REVIEW_REQUIRED:
    'One or more open invoices are marooned behind a long payment gap and may already be settled by an untagged credit. Verify against remittance advices before sending to a customer. Internal use (collections triage, ageing trend) is unaffected — the account total is correct either way.',
  BLOCKED:
    'The open-invoice list over-states the account, and/or lists an invoice the customer’s remittance advice says is paid. Releasing it would demand payment for settled debt. Resolve via closedInvoiceOverrides before release.',
  UNUSABLE_EXPORT:
    'This DEBENQ export was taken without allocation detail, so no row names the invoice it settles and no open-invoice list can be derived from it at all. The ERP CURRENT BALANCE header is still valid — only the per-invoice breakdown is impossible. Re-export from ERP with allocation detail included (Sources Agent task), then re-run.',
};

/** Remedy per blocking reason — different causes, genuinely different fixes. */
export const REMEDY = {
  EXPORT_LACKS_ALLOCATION_DETAIL:
    'Re-export the account from ERP DEBENQ with allocation detail INCLUDED (the export must not carry "EXCLUDE: ALLOCATION DETAIL"). Nothing in the repo can compensate for tagging that was never exported.',
  INVOICE_ON_REMITTANCE_STILL_OPEN:
    'For each flagged invoice, confirm the remittance batch reconciles (remittance cash = ERP payment total for that receipt). Where it does, ratify the invoice into closedInvoiceOverrides in config/statement_of_account.json with the evidence reference, then re-run.',
  OPEN_LIST_OVERSTATES_ACCOUNT:
    'The itemised list exceeds what the account owes, so settled debt is being carried as open. Reconcile the account remittance-by-remittance to identify which invoices the untagged credits cleared, then ratify them into closedInvoiceOverrides. Until then the open-invoice list must not go to the customer; the ERP balance total is still safe to quote.',
};
