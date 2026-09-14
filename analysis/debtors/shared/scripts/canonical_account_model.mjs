#!/usr/bin/env node
/**
 * Canonical Account Data layer — the architectural artifact described in
 * docs/architecture/canonical-account-layer.md.
 *
 * This module is the ONLY place that turns source-of-truth data (ERP DEBENQ
 * TXT rows, the invoice-tag coverage gate, the v5 sub-ledger fixture) into a
 * single normalized account representation. Both presentation projections —
 * internal HTML and the customer view (HTML + PDF) — read from the object
 * this module produces. Neither projection re-derives a balance, re-parses
 * the TXT, or re-runs the reconciliation gate; they only filter and format.
 *
 * Deliberately reused, not reimplemented:
 *   - TXT parsing, open-invoice reconstruction, and the invoice-tag coverage
 *     gate all come from debenq_open_invoices.mjs (the same module
 *     generate_statement_of_account.mjs already uses). Duplicating that logic
 *     here would let the canonical layer and the existing customer-statement
 *     generator disagree about what an account owes — exactly the drift this
 *     layer exists to prevent.
 *   - Internal-only reconciliation detail (ERP variance, sub-ledger tie,
 *     custody position) is read from the already-generated v5 fixture
 *     (src/features/debtor-position-workspace/data/fixtures/[CODE].v5.json)
 *     rather than re-running reconcile_debtor_v5_from_txt.mjs, which needs
 *     DATABASE_URL. This adapter has no DB dependency.
 *
 * visibility vs. customer gating
 * -------------------------------
 * Every ledger row (invoice, credit note, payment, journal) is an
 * `AccountEvent` with visibility 'both' — a customer's own invoice or
 * payment is never a secret from them. What IS internal-only is the
 * reconciliation *machinery* (ERP-vs-TXT variance, ingest gate, tagging risk
 * scores) — modelled as separate `reconciliation` / `dataQuality` blocks,
 * not as events.
 *
 * The one place visibility is NOT a static tag is the open-invoice list.
 * ERP's invoice tagging is not trustworthy (business_rules.md §3 — this is
 * the exact defect that billed TWK002 twice for 15 months), so whether the
 * open-invoice table is customer-safe is a GATE RESULT
 * (analyseInvoiceTagCoverage / analyseLpgOpenCoverage), computed fresh every
 * build, not a flag set once at ingestion. `openInvoices.customerSafe`
 * mirrors the exact abort condition generate_statement_of_account.mjs
 * already uses (BLOCKED / NOT_DERIVABLE_FROM_TXT withhold; ALLOWED /
 * REVIEW_REQUIRED release) — see debenq_open_invoices.mjs's module header.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  parseDebenqWithRunning,
  computeOpenInvoices,
  computeOpenLpgInvoices,
  analyseInvoiceTagCoverage,
  analyseLpgOpenCoverage,
  loadRemittanceInvoiceDocs,
  isCylRef,
  round2,
  normDoc,
  PAYMENT_TYPES,
  GATE_MEANING,
} from './debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '../../../..');

const ENTRY_TYPE_LABEL = {
  Invoice: 'Invoice',
  'Crd Note': 'Credit Note',
  Payment: 'Payment',
  'Ud Paymnt': 'Payment',
  'Bank XFer': 'Bank Transfer',
  'Bank Dep': 'Bank Deposit',
  Journal: 'Journal',
};

/** Mirrors generate_statement_of_account.mjs's ageBucket — kept local since it's
 * a five-line formatting helper, not reconciliation logic worth importing. */
function ageBucket(days) {
  if (days <= 30) return 'current';
  if (days <= 60) return 'd30';
  if (days <= 90) return 'd60';
  if (days <= 120) return 'd90';
  return 'd120';
}

/** Mirrors generate_statement_of_account.mjs's openingBalanceForMonth. */
function openingBalanceForMonth(rows, monthStartIso) {
  const before = rows.filter((r) => r.iso < monthStartIso).sort((a, b) => a.iso.localeCompare(b.iso));
  return before.length ? before[before.length - 1].runningBalance : null;
}

function eventType(entry) {
  if (entry === 'Invoice') return 'invoice';
  if (entry === 'Crd Note') return 'credit_note';
  if (entry === 'Journal') return 'journal';
  return 'payment';
}

function eventDescription(row) {
  const label = ENTRY_TYPE_LABEL[row.entry] || row.entry;
  if (row.entry === 'Invoice' || row.entry === 'Crd Note') {
    return `${isCylRef(row.dn) ? 'Cylinder Deposit' : 'LPG Gas'} ${label}`;
  }
  return label;
}

function loadSoaConfig(debtorCode) {
  const cfgPath = path.join(ROOT, 'analysis/debtors', debtorCode, 'config/statement_of_account.json');
  if (!fs.existsSync(cfgPath)) {
    throw new Error(
      `Missing config: ${cfgPath}\nCopy analysis/debtors/shared/templates/statement_of_account_config.template.json first.`,
    );
  }
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  cfg.referenceLabel = cfg.referenceLabel || 'Reference';
  cfg.closedInvoiceOverrides = cfg.closedInvoiceOverrides || [];
  cfg.openInvoiceAdjustments = cfg.openInvoiceAdjustments || [];
  return { cfg, cfgPath };
}

function loadV5Fixture(debtorCode) {
  const p = path.join(ROOT, 'src/features/debtor-position-workspace/data/fixtures', `${debtorCode}.v5.json`);
  if (!fs.existsSync(p)) return null;
  return { data: JSON.parse(fs.readFileSync(p, 'utf8')), relPath: path.relative(ROOT, p) };
}

/**
 * Build the canonical account for one debtor from source data. No DB
 * dependency — TXT + config + (optionally) the v5 fixture on disk.
 */
export function buildCanonicalAccount({ debtorCode, asAt } = {}) {
  if (!debtorCode) throw new Error('buildCanonicalAccount: debtorCode is required');
  const { cfg, cfgPath } = loadSoaConfig(debtorCode);

  const asAtDate = asAt ? new Date(`${asAt}T12:00:00`) : new Date();
  const asAtIso = asAtDate.toISOString().slice(0, 10);
  const monthStartIso = `${asAtIso.slice(0, 7)}-01`;
  const ageAsAt = new Date(new Date(`${monthStartIso}T12:00:00`).getTime() - 86400000);

  const primaryPath = path.join(ROOT, cfg.primaryTxt);
  const { headerBalance, balanceBf, excludesAllocationDetail, rows } = parseDebenqWithRunning(primaryPath);

  const useLpgStripped = cfg.openInvoiceModel === 'lpg_stripped';
  const openInvoicesRaw = useLpgStripped
    ? computeOpenLpgInvoices(rows, cfg.closedInvoiceOverrides)
    : computeOpenInvoices(rows, cfg.closedInvoiceOverrides);

  const coverage = useLpgStripped
    ? analyseLpgOpenCoverage({
        rows,
        openInvoices: openInvoicesRaw,
        headerBalance,
        closedOverrides: cfg.closedInvoiceOverrides,
        ratifiedAllocation: Boolean(cfg.allocationGate?.status === 'RATIFIED'),
      })
    : analyseInvoiceTagCoverage({
        rows,
        openInvoices: openInvoicesRaw,
        headerBalance,
        balanceBf,
        excludesAllocationDetail,
        closedOverrides: cfg.closedInvoiceOverrides,
        remittanceDocs: loadRemittanceInvoiceDocs(path.join(ROOT, 'analysis/debtors', debtorCode)),
      });

  // Ratified partial-allocation adjustments (e.g. a LIFO remainder) — same
  // override mechanism generate_statement_of_account.mjs applies.
  const openInvoices = openInvoicesRaw.map((inv) => ({ ...inv }));
  for (const adj of cfg.openInvoiceAdjustments) {
    const doc = normDoc(adj.doc);
    const inv = openInvoices.find((i) => normDoc(i.doc || i.key) === doc);
    if (inv) inv.due = round2(Number(adj.due));
  }
  const openInvoicesDue = round2(openInvoices.reduce((s, i) => s + i.due, 0));

  const buckets = { current: 0, d30: 0, d60: 0, d90: 0, d120: 0 };
  for (const inv of openInvoices) {
    const days = Math.floor((ageAsAt - new Date(`${inv.iso}T12:00:00`)) / 86400000);
    buckets[ageBucket(days)] = round2(buckets[ageBucket(days)] + inv.due);
  }

  const openingBalance = openingBalanceForMonth(rows, monthStartIso);
  const movementThisMonth = openingBalance != null ? round2(headerBalance - openingBalance) : null;
  const accountLevelBalance = round2(headerBalance - openInvoicesDue);

  // ---- Canonical events — every real ledger row, visible to both audiences.
  //
  // DEBENQ TXT rows are grouped by entry-type block (all Crd Notes, then all
  // Invoices, then Payments), each block internally date-sorted — NOT one
  // calendar-chronological stream. So each row's own ERP running-balance
  // column reflects ERP's *posting* order, not calendar order, and is not
  // usable for a date-ordered ledger. reconcile_debtor_v5_from_txt.mjs
  // already accounts for this (it re-sorts and recomputes its own running
  // total instead of trusting the TXT column for display) — the canonical
  // event list does the same, so a chronological "what happened on my
  // account" view is actually chronological.
  const chronoTiebreak = (a, b) =>
    a.iso.localeCompare(b.iso) ||
    (a.entry === 'Crd Note' ? 1 : 0) - (b.entry === 'Crd Note' ? 1 : 0) ||
    a.cleanDoc.localeCompare(b.cleanDoc);

  const ledgerRows = rows
    .filter((r) => r.entry === 'Invoice' || r.entry === 'Crd Note' || PAYMENT_TYPES.has(r.entry))
    .slice()
    .sort(chronoTiebreak);

  const windowOpeningBalance = round2(headerBalance - round2(ledgerRows.reduce((s, r) => s + r.amount, 0)));
  let runningChrono = windowOpeningBalance;
  const events = ledgerRows.map((r) => {
    runningChrono = round2(runningChrono + r.amount);
    return {
      id: `${debtorCode}:${r.cleanDoc || r.docno}:${r.entry}:${r.iso}`,
      date: r.iso,
      type: eventType(r.entry),
      reference: (r.docno || '').replace(/^0+/, '') || r.docno,
      dnRef: r.dn || null,
      lane: r.entry === 'Invoice' || r.entry === 'Crd Note' ? (isCylRef(r.dn) ? 'CYL' : 'LPG') : null,
      description: eventDescription(r),
      amount: r.amount,
      balanceAfter: runningChrono,
      sourceSystem: 'ERP-DEBENQ',
      sourceReference: path.relative(ROOT, primaryPath),
      visibility: 'both',
    };
  });

  // Whether the open-invoice list is safe to hand to the customer is a GATE
  // RESULT, not a static tag — see module header. Mirrors the exact abort
  // condition generate_statement_of_account.mjs uses (only BLOCKED /
  // NOT_DERIVABLE_FROM_TXT withhold; --force is a deliberate human override
  // there and has no equivalent here — this layer never silently ships a
  // blocked list).
  const customerSafe = coverage.gate !== 'BLOCKED' && coverage.gate !== 'NOT_DERIVABLE_FROM_TXT';

  const v5 = loadV5Fixture(debtorCode);

  const canonical = {
    schemaVersion: '1.0',
    customer: {
      code: debtorCode,
      name: cfg.customerName,
      referenceLabel: cfg.referenceLabel,
      referenceValue: cfg.referenceValue || null,
    },
    business: { header: cfg.businessHeader },
    account: {
      code: debtorCode,
      asAt: asAtIso,
      ageingAsAt: ageAsAt.toISOString().slice(0, 10),
    },
    financialPosition: {
      openingBalance,
      movementThisMonth,
      currentBalance: headerBalance,
      erpStatedBalance: headerBalance,
      accountLevelBalance,
      agedOpenInvoices: buckets,
      windowOpeningBalance,
    },
    events,
    openInvoices: {
      gate: coverage.gate,
      gateMeaning: GATE_MEANING[coverage.gate],
      evidenceBasis: coverage.evidence.basis,
      customerSafe,
      subtotal: openInvoicesDue,
      items: openInvoices.map((inv) => ({
        doc: (inv.docno || '').replace(/^0+/, '') || inv.docno,
        date: inv.iso,
        reference: inv.dn,
        due: inv.due,
      })),
    },
    custodyPosition: v5?.data?.custodyPosition ?? null,
    // Internal-only: reconciliation machinery, never surfaced to a customer.
    reconciliation: v5
      ? {
          visibility: 'internal',
          source: v5.relPath,
          workspaceStatus: v5.data.workspaceStatus,
          lpgGasDebt: v5.data.financialPosition?.lpgGasDebt,
          cylinderFinancialBalance: v5.data.financialPosition?.cylinderFinancialBalance,
          erpVariance: v5.data.reconciliationPosition?.erpVariance,
          subLedgerVariance: v5.data.reconciliationPosition?.subLedgerVariance,
          cylinderVariance: v5.data.reconciliationPosition?.cylinderVariance,
          exceptions: v5.data.reconciliationPosition?.exceptions ?? [],
        }
      : null,
    dataQuality: {
      visibility: 'internal',
      excludesAllocationDetail,
      invoiceTagCoverage: {
        gate: coverage.gate,
        meaning: GATE_MEANING[coverage.gate],
        evidenceBasis: coverage.evidence.basis,
        counts: coverage.counts,
        invariant: coverage.invariant,
        untaggedCreditTotal: coverage.untagged_credit_total,
      },
    },
    documents: [
      v5 && {
        type: 'internal_v5_statement',
        label: 'v5 Sub-Ledger Statement',
        path: `analysis/debtors/${debtorCode}/reports/${debtorCode}_Statement_Account_v5.md`,
        visibility: 'internal',
      },
      {
        type: 'source_txt',
        label: 'ERP DEBENQ export',
        path: cfg.primaryTxt,
        visibility: 'internal',
      },
      {
        type: 'customer_statement',
        label: 'Statement of Account',
        path: `${cfg.outputDir}/${cfg.outputBaseName}.md`,
        visibility: 'customer',
      },
      {
        type: 'customer_statement_pdf',
        label: 'Statement of Account (PDF)',
        path: `${cfg.outputDir}/${cfg.outputBaseName}.pdf`,
        visibility: 'customer',
      },
    ].filter(Boolean),
    sourceMetadata: {
      sourceSystem: 'ERP-DEBENQ-TXT',
      primaryTxt: path.relative(ROOT, primaryPath),
      configPath: path.relative(ROOT, cfgPath),
      generatedAt: new Date().toISOString(),
      generator: 'canonical_account_model.mjs',
    },
  };

  return canonical;
}

/**
 * The Customer Projection — the ONLY function either the customer HTML view
 * or the customer PDF export may read canonical data through. Both call this
 * function and this function alone, so they cannot drift into different
 * versions of the account (see docs/architecture/canonical-account-layer.md
 * §PDF architecture).
 */
export function projectCustomerView(canonical) {
  const movement = canonical.events
    .filter((e) => e.visibility !== 'internal')
    .slice()
    .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1)); // most recent first

  const monthly = new Map();
  for (const e of canonical.events) {
    const period = e.date.slice(0, 7);
    if (!monthly.has(period)) {
      monthly.set(period, { period, invoiced: 0, paymentsCredits: 0, closingBalance: e.balanceAfter });
    }
    const m = monthly.get(period);
    if (e.type === 'invoice') m.invoiced = round2(m.invoiced + e.amount);
    else m.paymentsCredits = round2(m.paymentsCredits + e.amount);
    m.closingBalance = e.balanceAfter; // events arrive chronological per period
  }
  const monthlyActivity = [...monthly.values()].sort((a, b) => a.period.localeCompare(b.period));

  const openInvoices = canonical.openInvoices.customerSafe
    ? canonical.openInvoices
    : { ...canonical.openInvoices, items: [], subtotal: null, withheld: true };

  return {
    customer: canonical.customer,
    business: canonical.business,
    account: canonical.account,
    currentBalance: canonical.financialPosition.currentBalance,
    openingBalance: canonical.financialPosition.openingBalance,
    movementThisMonth: canonical.financialPosition.movementThisMonth,
    accountLevelBalance: canonical.financialPosition.accountLevelBalance,
    agedOpenInvoices: canonical.financialPosition.agedOpenInvoices,
    movement,
    monthlyActivity,
    openInvoices,
    custody: canonical.custodyPosition
      ? {
          lines: canonical.custodyPosition.lines,
          totalCustodyExposure: canonical.custodyPosition.totalCustodyExposure,
        }
      : null,
    documents: canonical.documents.filter((d) => d.visibility === 'customer'),
  };
}

export function writeCanonicalAccount(canonical) {
  const outDir = path.join(ROOT, 'analysis/debtors', canonical.account.code, 'canonical');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${canonical.account.code}_canonical_account.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(canonical, null, 2)}\n`);
  return outPath;
}
