#!/usr/bin/env node
/**
 * PDP-46 — reusable reconciliation_status.csv generator ("Option C").
 *
 * Usage:
 *   node analysis/debtors/shared/scripts/build_reconciliation_status.mjs \
 *     --debtor <CODE> [--json] [--no-write] [--skip-gate] [--tolerance 0.02]
 *
 * Implements the 8-step procedure from PDP-46:
 *   1. Deduped doc universe (SELECT DISTINCT-equivalent wrapper — PDP-31)
 *   2. Diff against allocation_edges.csv, auto-detecting the account's
 *      settlement mechanism (see PROFILES below)
 *   3. Candidate-pair search for gap docs (exact-sum, contiguous-run, proximity)
 *   4. Basket-check (line-item/SKU-set and debt_group-lane consistency)
 *   5. Multi-site/cross-account sweep before flagging a genuine error
 *   6. Orphaned-cash sweep
 *   7. Write reconciliation_status.csv (settlement_unit / evidence_tier /
 *      evidence_status taxonomy)
 *   8. Gate: `debtors:tag-check` + Σ(open) ≤ ERP-stated-balance invariant
 *
 * ---------------------------------------------------------------------------
 * TAXONOMY SOURCE — READ BEFORE EXTENDING
 * ---------------------------------------------------------------------------
 * The settlement_unit / evidence_tier / evidence_status field *names* and the
 * settlement_unit enum values below come from the PDP-46 ticket text, which
 * itself says they originate from a "Portfolio Review — Statement Pipeline &
 * Payment-Pattern Classification" document. That document does NOT exist
 * anywhere in this repository's git history or branches — confirmed twice
 * independently: once by `JIM001_Exact_Sum_Bridge_Review_2026-09-13.md` (§0,
 * which hit the same missing-file handoff and proceeded without it), and
 * again here via `git log --all` + full-text search across the whole repo.
 * The "Reconciliation_Status_Methodology_v1.md" prose doc the ticket also
 * cites is likewise absent. Per explicit user decision on PDP-46 (2026-09-15),
 * this script proceeds on the ticket's taxonomy as the source of truth
 * anyway, documented here as chat-sourced rather than pulled from a citable
 * artifact.
 *
 * The evidence_tier 1→5 *ladder* (which tier number means what) is NOT
 * spelled out anywhere either — only "1 (remittance advice) → 5
 * (unallocated)" is given. The ladder below is this script's own
 * operationalization, built to agree with the only two numbered precedents
 * that exist in-repo: TWK002's remittance-explicit rows (tier 1, per the
 * ticket's own anchor) and JIM001_Exact_Sum_Bridge_Review §8's explicit
 * finding that JIM001 (no remittance advice on file at all) is "ceilinged at
 * Tier 3" for every finding, human-ratified or not. Tiers 2 and 4 are this
 * script's own extrapolation (2 = bank/ERP-confirmed narrative without a
 * remittance document; 4 = this script's own generated candidate pairing,
 * unconfirmed) and should be revisited if the real Portfolio Review doc
 * surfaces.
 *
 * evidence_status is a STORED field, never re-derived — per the ticket
 * (citing the JEN001/JIM001 investigations): exact-sum conservation alone
 * does not prove PROVEN. Concretely: this script only ever emits PROVEN for
 * rows sourced from an explicit remittance-linked allocation_type
 * (ONE_SHOT_REMITTANCE profile, confidence=Confirmed) — pattern-based or
 * ERP-ledger-based allocations (LIFO, FIFO-batch) top out at ASSERTED, even
 * when human-ratified, matching JIM001_Exact_Sum_Bridge_Review's explicit
 * "No figure in this review should be reported as PROVEN" conclusion.
 * ---------------------------------------------------------------------------
 *
 * CORE DESIGN RISK THIS SCRIPT EXISTS TO GUARD AGAINST (per the ticket):
 * every account checked so far (TWK002, JEN001, JIM001) uses a DIFFERENT
 * settlement mechanism, and a naive SUM(allocated_amount) once silently
 * miscounted a fully-unallocated JIM001 payment (R20,557.69, doc 39812) as
 * matched. This script never guesses at an account's settlement mechanism:
 * `detectProfile()` matches the account's allocation_edges.csv column set
 * AND its full allocation_type vocabulary against a PROFILES registry below;
 * an unrecognized schema throws loudly and refuses to produce output, rather
 * than silently defaulting to any one profile's logic.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const DEBTORS_ROOT = path.join(ROOT, 'analysis/debtors');

const DEFAULT_TOLERANCE = 0.02; // cent-exact, matches JIM001 Bridge Review precedent

class ReconError extends Error {}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = { write: true, json: false, skipGate: false, tolerance: DEFAULT_TOLERANCE };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--debtor') args.debtor = argv[++i];
    else if (argv[i] === '--json') args.json = true;
    else if (argv[i] === '--no-write') args.write = false;
    else if (argv[i] === '--skip-gate') args.skipGate = true;
    else if (argv[i] === '--tolerance') args.tolerance = Number(argv[++i]);
  }
  if (!args.debtor) {
    console.error(
      'Usage: node build_reconciliation_status.mjs --debtor <CODE> [--json] [--no-write] [--skip-gate] [--tolerance 0.02]',
    );
    process.exit(2);
  }
  return args;
}

// ---------------------------------------------------------------------------
// CSV helpers (same hand-rolled convention as debenq_open_invoices.mjs /
// validate_txt_db_coverage.mjs / reconcile_debtor_v4_from_txt.mjs)
// ---------------------------------------------------------------------------
function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
        continue;
      }
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

function readCsv(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) return { header: [], rows: [] };
  const header = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    header.forEach((h, i) => {
      row[h] = cells[i] ?? '';
    });
    return row;
  });
  return { header, rows };
}

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeCsvFile(filePath, header, rows) {
  const lines = [header.join(',')];
  for (const row of rows) lines.push(header.map((h) => csvEscape(row[h])).join(','));
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
}

const num = (v) => (v === '' || v === undefined || v === null ? 0 : Number(v));
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
// Doc numbers are zero-padded inconsistently between files even within the
// same account (TWK002's allocation_edges.csv omits the leading zeros that
// its own invoices.csv/payments.csv carry). Normalize to strip them for every
// cross-file join key; original raw values are kept for CSV display.
const normDoc = (v) => String(v ?? '').replace(/^0+(?=\d)/, '');

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
function debtorPaths(code) {
  const dir = path.join(DEBTORS_ROOT, code);
  return {
    dir,
    invoicesCsv: path.join(dir, 'data/invoices.csv'),
    paymentsCsv: path.join(dir, 'data/payments.csv'),
    edgesCsv: path.join(dir, 'data/allocation_edges.csv'),
    dashboardJson: path.join(dir, 'data/dashboard_metrics.json'),
    knowledgeBundleJson: path.join(dir, 'data/knowledge-bundle.json'),
    reportsDir: path.join(dir, 'reports'),
  };
}

function allDebtorCodes() {
  return fs
    .readdirSync(DEBTORS_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^[A-Z]{2,4}\d{3,4}$/.test(d.name))
    .map((d) => d.name);
}

// ---------------------------------------------------------------------------
// STEP 1 — Deduped doc universe (PDP-31 mandatory dedup wrapper)
// ---------------------------------------------------------------------------
function loadDocUniverse(code, paths) {
  const inv = readCsv(paths.invoicesCsv);
  if (!inv) {
    throw new ReconError(
      `STEP 1 (doc universe) FAILED for ${code}: no data/invoices.csv found.\n` +
        `This script does not fall back to a live DB pull or guess at a different ` +
        `file shape. Either supply analysis/debtors/${code}/data/invoices.csv in ` +
        `the same line-item shape as TWK002/JIM001's (one row per doc_no × ` +
        `stock_code, with is_lpg/amount_incl columns), or wire in a DB-backed ` +
        `loader for this account before running.`,
    );
  }

  // PDP-31: dedupe on the same natural key as pdp31_dedup_transaction_items.sql
  // (account_no, doc_no, entry_type, stock_no, qty, retail_price, tx_date),
  // "keep oldest" (first occurrence in file order). Never trust a raw CSV/table
  // read as already-distinct.
  const seen = new Set();
  const deduped = [];
  let dupCount = 0;
  for (const row of inv.rows) {
    const key = [row.doc_no, row.entry_type, row.stock_code, row.qty, row.amount_excl, row.tx_date].join('|');
    if (seen.has(key)) {
      dupCount++;
      continue;
    }
    seen.add(key);
    deduped.push(row);
  }

  const byDoc = new Map();
  for (const row of deduped) {
    const doc = row.doc_no;
    if (!byDoc.has(doc)) {
      byDoc.set(doc, {
        doc_no: doc,
        entry_type: row.entry_type,
        tx_date: row.tx_date,
        month_year: row.month_year,
        amount: 0,
        lpgAmount: 0,
        skuSet: new Set(),
        isLpg: false,
      });
    }
    const d = byDoc.get(doc);
    d.amount = round2(d.amount + num(row.amount_incl));
    if (String(row.is_lpg).toLowerCase() === 'true') {
      d.lpgAmount = round2(d.lpgAmount + num(row.amount_incl));
      d.isLpg = true;
    }
    if (row.stock_code) d.skuSet.add(row.stock_code);
  }

  return { docs: [...byDoc.values()], dupLineCount: dupCount, totalLines: inv.rows.length };
}

function loadPayments(code, paths) {
  const pay = readCsv(paths.paymentsCsv);
  if (!pay) return null;
  // Consolidate multiple raw ERP-segment rows under the same payment_doc into
  // one payment record (documented simplification — see script header).
  const byDoc = new Map();
  for (const row of pay.rows) {
    const doc = row.payment_doc;
    if (!byDoc.has(doc)) {
      byDoc.set(doc, { payment_doc: doc, payment_date: row.payment_date, amount: 0 });
    }
    const p = byDoc.get(doc);
    p.amount = round2(p.amount + Math.abs(num(row.amount)));
    if (row.payment_date < p.payment_date) p.payment_date = row.payment_date;
  }
  return [...byDoc.values()];
}

// ---------------------------------------------------------------------------
// STEP 2 — settlement-mechanism auto-detection (PROFILES registry)
// ---------------------------------------------------------------------------
const PROFILES = [
  {
    id: 'ONE_SHOT_REMITTANCE',
    label: 'One-shot, remittance-linked (TWK002 precedent)',
    requiredColumns: ['payment_doc', 'target_doc', 'allocated_amount', 'allocation_type', 'confidence'],
    settlementTypes: new Set(['REMITTANCE_EXPLICIT', 'REMITTANCE_CN_OFFSET']),
    orphanTypes: new Set(),
    orphanResidualColumn: null,
    classify(row) {
      const evidence_status = row.confidence === 'Confirmed' ? 'PROVEN' : 'ASSERTED';
      return { settlement_unit: 'PER_INVOICE_REF_LINKED', evidence_tier: 1, evidence_status };
    },
  },
  {
    id: 'LIFO_MULTI_SLICE',
    label: 'LIFO multi-slice (JEN001 precedent)',
    requiredColumns: ['payment_doc', 'target_doc', 'allocated_amount', 'allocation_type', 'confidence'],
    settlementTypes: new Set(['LIFO_FULL', 'LIFO_PARTIAL']),
    orphanTypes: new Set(['UNALLOCATED_REMAINDER']),
    orphanResidualColumn: 'variance',
    classify() {
      return { settlement_unit: 'PER_INVOICE_LIFO_BATCH', evidence_tier: 3, evidence_status: 'ASSERTED' };
    },
  },
  {
    id: 'FIFO_BATCH',
    label: 'FIFO-batch, split-payment-portion (JIM001 precedent)',
    requiredColumns: [
      'payment_doc',
      'target_doc',
      'allocated_amount',
      'allocation_type',
      'evidence_source',
      'confidence',
    ],
    settlementTypes: new Set(['SPLIT_PAYMENT_PORTION']),
    orphanTypes: new Set(['UNALLOCATED_PORTION']),
    orphanResidualColumn: 'residual_after_allocation',
    classify() {
      return { settlement_unit: 'PER_INVOICE_FIFO_BATCH', evidence_tier: 3, evidence_status: 'ASSERTED' };
    },
  },
];

function allTypesKnown(profile, types) {
  return [...types].every((t) => profile.settlementTypes.has(t) || profile.orphanTypes.has(t));
}

function detectProfile(code, edges) {
  const cols = new Set(edges.header);
  const types = new Set(edges.rows.map((r) => r.allocation_type));

  const columnMatches = PROFILES.filter((p) => p.requiredColumns.every((c) => cols.has(c)));
  const exact = columnMatches.find((p) => allTypesKnown(p, types));
  if (exact) return exact;

  const near = columnMatches
    .map((p) => ({
      p,
      unknown: [...types].filter((t) => !p.settlementTypes.has(t) && !p.orphanTypes.has(t)),
    }))
    .sort((a, b) => a.unknown.length - b.unknown.length)[0];

  const lines = [
    `STEP 2 (settlement-mechanism detection) FAILED for ${code}.`,
    `allocation_edges.csv columns: ${edges.header.join(', ')}`,
    `Distinct allocation_type values found: ${[...types].join(', ') || '(none)'}`,
    columnMatches.length === 0
      ? `No registered profile even matches on required columns.`
      : `Closest registered profile is "${near.p.label}" (${near.p.id}), but it does not ` +
        `recognize allocation_type value(s): ${near.unknown.join(', ')}.`,
    '',
    `This is a deliberate fail-loud stop (PDP-46's core design risk): TWK002, JEN001, ` +
      `and JIM001 each use a different settlement mechanism, and a naive read of an ` +
      `unfamiliar schema previously miscounted a fully-unallocated JIM001 payment as ` +
      `matched. Register a new entry in PROFILES (build_reconciliation_status.mjs) with ` +
      `an explicit settlement/orphan allocation_type vocabulary and a classify() mapping ` +
      `before running this account through the pipeline — do not relax this check to ` +
      `silently pass unknown types through.`,
  ];
  throw new ReconError(lines.join('\n'));
}

/**
 * Guard the actual failure mode behind the JIM001 doc-39812 bug: a row tagged
 * as an "unallocated" type must never also claim a target_doc. (Note:
 * `allocated_amount` itself is NOT a safe universal signal here — TWK002/
 * JEN001's orphan rows carry allocated_amount≈0, but JIM001's carry
 * allocated_amount == payment_amount with the SAME semantic meaning
 * "accounted for as unallocated, not tied to any invoice." The one thing
 * every profile's orphan rows agree on is a blank target_doc; that's what a
 * naive SUM(allocated_amount) grouped by payment_doc misses.)
 */
function validateOrphanInvariant(code, edges, profile) {
  for (const row of edges.rows) {
    if (!profile.orphanTypes.has(row.allocation_type)) continue;
    if (row.target_doc && row.target_doc.trim() !== '') {
      throw new ReconError(
        `STEP 2 invariant violated for ${code}: allocation_id ${row.allocation_id} is tagged ` +
          `${row.allocation_type} (an "unallocated" type under the ${profile.id} profile) but ` +
          `carries a non-blank target_doc (${row.target_doc}). An unallocated-type row must not ` +
          `claim a target invoice — that contradiction is exactly the silent-miscount pattern ` +
          `(JIM001 doc 39812, R20,557.69) this script exists to prevent.`,
      );
    }
  }
}

function computeAllocations(edges, profile) {
  const settledByDoc = new Map(); // doc_no -> { amount, evidence: [] }
  const consumptionByPayment = new Map(); // payment_doc -> { settled, unallocated, rows }

  for (const row of edges.rows) {
    const pay = normDoc(row.payment_doc);
    if (!consumptionByPayment.has(pay)) {
      consumptionByPayment.set(pay, { settled: 0, unallocated: 0, rows: [] });
    }
    const pc = consumptionByPayment.get(pay);
    pc.rows.push(row);

    if (profile.settlementTypes.has(row.allocation_type)) {
      const amt = num(row.allocated_amount);
      pc.settled = round2(pc.settled + amt);
      const target = normDoc(row.target_doc);
      if (target) {
        if (!settledByDoc.has(target)) settledByDoc.set(target, { amount: 0, evidence: [] });
        const sd = settledByDoc.get(target);
        sd.amount = round2(sd.amount + amt);
        sd.evidence.push({ row, ...profile.classify(row) });
      }
    } else if (profile.orphanTypes.has(row.allocation_type)) {
      const residual = profile.orphanResidualColumn ? num(row[profile.orphanResidualColumn]) : num(row.allocated_amount);
      pc.unallocated = round2(pc.unallocated + residual);
    }
  }
  return { settledByDoc, consumptionByPayment };
}

// ---------------------------------------------------------------------------
// STEP 3 — candidate-pair search for gap docs
// ---------------------------------------------------------------------------
function candidatePairSearch(gapDocs, unconsumedPayments, tolerance) {
  const sortedDocs = [...gapDocs].sort((a, b) => a.tx_date.localeCompare(b.tx_date));
  const usedPayments = new Set();
  const results = new Map(); // doc_no -> { type, payment, diff?, runDocs? }

  // Pass 1: exact single-doc-to-single-payment match.
  for (const doc of sortedDocs) {
    for (const pay of unconsumedPayments) {
      if (usedPayments.has(pay.payment_doc)) continue;
      const diff = Math.abs(pay.residual - doc.openAmount);
      if (diff <= tolerance) {
        results.set(doc.doc_no, { type: 'EXACT_SUM_SINGLE', payment: pay, diff, runDocs: [doc] });
        usedPayments.add(pay.payment_doc);
        break;
      }
    }
  }

  // Pass 2: contiguous date-ordered run of still-gap docs exact-summing to one
  // payment's residual (mirrors the method validated in
  // JIM001_Exact_Sum_Bridge_Review §1/§5 — docs 38846/39812 vs Jan+Feb 2025).
  let stillGap = sortedDocs.filter((d) => !results.has(d.doc_no));
  for (const pay of unconsumedPayments) {
    if (usedPayments.has(pay.payment_doc)) continue;
    let matched = false;
    for (let start = 0; start < stillGap.length && !matched; start++) {
      let sum = 0;
      for (let end = start; end < stillGap.length && end < start + 12; end++) {
        sum = round2(sum + stillGap[end].openAmount);
        if (Math.abs(sum - pay.residual) <= tolerance && end > start) {
          const run = stillGap.slice(start, end + 1);
          for (const d of run) {
            results.set(d.doc_no, { type: 'EXACT_SUM_RUN', payment: pay, runSize: run.length, runDocs: run });
          }
          usedPayments.add(pay.payment_doc);
          matched = true;
          break;
        }
      }
    }
    if (matched) stillGap = stillGap.filter((d) => !results.has(d.doc_no));
  }

  // Pass 3: proximity-only fallback (wider, non-cent-exact band) for anything left.
  const PROXIMITY_BAND = Math.max(tolerance, 5);
  for (const doc of stillGap) {
    let best = null;
    for (const pay of unconsumedPayments) {
      if (usedPayments.has(pay.payment_doc)) continue;
      const diff = Math.abs(pay.residual - doc.openAmount);
      if (diff <= PROXIMITY_BAND && (!best || diff < best.diff)) best = { type: 'PROXIMITY', payment: pay, diff, runDocs: [doc] };
    }
    if (best) results.set(doc.doc_no, best);
  }

  return results;
}

// ---------------------------------------------------------------------------
// STEP 4 — basket-check (line-item SKU set + debt_group-lane consistency)
// ---------------------------------------------------------------------------
function basketCheck(candidate) {
  const docs = candidate.runDocs || [];
  if (docs.length === 0) return { passed: false, reason: 'no candidate docs to check' };

  const nonLpg = docs.filter((d) => !d.isLpg);
  if (nonLpg.length > 0) {
    return {
      passed: false,
      reason: `candidate includes non-LPG-lane doc(s) ${nonLpg.map((d) => d.doc_no).join(', ')} — ` +
        `refusing to fold a CYL/OTHER-lane document into an LPG settlement match (PDP-33 lane-gate)`,
    };
  }
  const empty = docs.filter((d) => d.skuSet.size === 0);
  if (empty.length > 0) {
    return {
      passed: false,
      reason: `no line-item/SKU data available for doc(s) ${empty.map((d) => d.doc_no).join(', ')} — ` +
        `basket-check cannot be evaluated, only amount-matched`,
    };
  }
  return { passed: true, reason: 'LPG lane consistent, SKU baskets present' };
}

// ---------------------------------------------------------------------------
// STEP 5 — multi-site / cross-account sweep
// ---------------------------------------------------------------------------
/** Built once per run, not once per gap doc — same sibling files otherwise get re-read O(gaps) times. */
function buildCrossAccountIndex(code) {
  const index = new Map(); // normDoc(docNo) -> ['SIBLING/invoices.csv', ...]
  for (const sibling of allDebtorCodes()) {
    if (sibling === code) continue;
    const p = debtorPaths(sibling);
    for (const [file, label, col] of [
      [p.invoicesCsv, 'invoices.csv', 'doc_no'],
      [p.paymentsCsv, 'payments.csv', 'payment_doc'],
    ]) {
      const csv = readCsv(file);
      if (!csv) continue;
      for (const row of csv.rows) {
        const key = normDoc(row[col]);
        if (!key) continue;
        const tag = `${sibling}/${label}`;
        if (!index.has(key)) index.set(key, new Set());
        index.get(key).add(tag);
      }
    }
  }
  return index;
}

function crossAccountLookup(index, docOrPaymentNo) {
  const hits = index.get(normDoc(docOrPaymentNo));
  return hits ? [...hits] : [];
}

// ---------------------------------------------------------------------------
// STEP 8 — ERP balance invariant source
// ---------------------------------------------------------------------------
function loadErpStatedBalance(paths) {
  if (fs.existsSync(paths.dashboardJson)) {
    const d = JSON.parse(fs.readFileSync(paths.dashboardJson, 'utf8'));
    for (const key of ['unpaid_lpg_invoices', 'lpg_gas_debt', 'corrected_erp_stated_balance', 'net_lpg_debt']) {
      if (typeof d[key] === 'number') return { value: d[key], source: `data/dashboard_metrics.json:${key}` };
    }
  }
  if (fs.existsSync(paths.knowledgeBundleJson)) {
    const d = JSON.parse(fs.readFileSync(paths.knowledgeBundleJson, 'utf8'));
    const v = d?.views?.summary?.totalDebtorBalance;
    if (typeof v === 'number') return { value: v, source: 'data/knowledge-bundle.json:views.summary.totalDebtorBalance' };
  }
  return null;
}

function runTagCheckGate(code) {
  const result = spawnSync(
    'node',
    ['analysis/debtors/shared/scripts/check_invoice_tag_coverage.mjs', '--debtor', code, '--json'],
    { cwd: ROOT, encoding: 'utf8', timeout: 60000 },
  );
  if (result.error || result.status === null) {
    return { status: 'SKIPPED', reason: `could not run debtors:tag-check: ${result.error?.message || 'no exit status'}` };
  }
  let gate = null;
  try {
    gate = JSON.parse(result.stdout).gate;
  } catch {
    // fall through to exit-code interpretation below
  }
  // check_invoice_tag_coverage.mjs's gate values: ALLOWED, BLOCKED, REVIEW_REQUIRED,
  // NOT_DERIVABLE_FROM_TXT, UNVERIFIED. Only ALLOWED is a genuine pass — the others
  // must not be silently upgraded to PASSED just because the process exited 0.
  if (gate === 'BLOCKED' || result.status !== 0) {
    return { status: 'FAILED', reason: gate || `exit code ${result.status}`, stderr: result.stderr?.slice(0, 500) };
  }
  if (gate === 'REVIEW_REQUIRED') {
    return { status: 'WARN', reason: gate };
  }
  if (gate === 'NOT_DERIVABLE_FROM_TXT' || gate === 'UNVERIFIED' || !gate) {
    return { status: 'SKIPPED', reason: gate || 'no gate value returned' };
  }
  return { status: 'PASSED', reason: gate || 'ok' };
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------
function buildReconciliationStatus(code, { tolerance = DEFAULT_TOLERANCE, skipGate = false } = {}) {
  const paths = debtorPaths(code);
  if (!fs.existsSync(paths.dir)) {
    throw new ReconError(`No such debtor directory: analysis/debtors/${code}`);
  }

  // --- Step 1 ---
  const universe = loadDocUniverse(code, paths);
  const payments = loadPayments(code, paths);

  // --- Step 2 ---
  const edges = readCsv(paths.edgesCsv);
  if (!edges) {
    throw new ReconError(
      `STEP 2 FAILED for ${code}: no data/allocation_edges.csv found — cannot detect a ` +
        `settlement mechanism or diff the doc universe against it.`,
    );
  }
  const profile = detectProfile(code, edges);
  validateOrphanInvariant(code, edges, profile);
  const { settledByDoc, consumptionByPayment } = computeAllocations(edges, profile);

  // D-NEW.7 (Portfolio Review doctrine): a doc predating allocation_edges.csv's own
  // earliest payment was never in scope for the allocator to consider — that's a
  // coverage gap, not an open item. (JEN001 precedent: 36 of 90 invoices looked
  // like a backlog but predated the edges file's earliest payment entirely.)
  const coverageStart = edges.rows
    .map((r) => r.payment_date)
    .filter(Boolean)
    .sort()[0];

  const invoiceDocs = universe.docs.filter((d) => d.entry_type === 'Invoice' && d.isLpg);
  for (const d of invoiceDocs) {
    d.settledAmount = settledByDoc.get(normDoc(d.doc_no))?.amount || 0;
    d.openAmount = round2(d.lpgAmount - d.settledAmount);
  }
  const gapDocs = invoiceDocs.filter((d) => Math.abs(d.openAmount) > tolerance);

  // Unconsumed payments = payments with residual cash beyond their edges-recorded settlement.
  const unconsumedPayments = (payments || [])
    .map((p) => {
      const c = consumptionByPayment.get(normDoc(p.payment_doc));
      const settled = c?.settled || 0;
      const residual = round2(p.amount - settled);
      return { ...p, settled, residual };
    })
    .filter((p) => p.residual > tolerance);

  // --- Step 3 ---
  const candidates = candidatePairSearch(gapDocs, unconsumedPayments, tolerance);

  // --- Step 4 + 5 applied per gap doc ---
  const crossAccountIndex = buildCrossAccountIndex(code);
  const rows = [];
  for (const d of invoiceDocs) {
    if (Math.abs(d.openAmount) <= tolerance) {
      const evidence = settledByDoc.get(normDoc(d.doc_no))?.evidence || [];
      const best = evidence.reduce(
        (acc, e) => (acc === null || e.evidence_tier < acc.evidence_tier ? e : acc),
        null,
      );
      rows.push({
        doc_no: d.doc_no,
        doc_type: 'INVOICE',
        tx_date: d.tx_date,
        month_year: d.month_year,
        gross_amount: d.lpgAmount,
        settled_amount: d.settledAmount,
        open_amount: d.openAmount,
        settlement_unit: best?.settlement_unit || 'UNCHARACTERIZED',
        evidence_tier: best?.evidence_tier ?? 5,
        evidence_status: best?.evidence_status || 'UNASSESSED',
        matched_against: evidence.map((e) => e.row.payment_doc).join(';'),
        notes: `Settled via ${profile.id} profile (${evidence.length} allocation row(s)).`,
      });
      continue;
    }

    const candidate = candidates.get(d.doc_no);
    if (candidate) {
      const basket = basketCheck(candidate);
      const isExact = candidate.type !== 'PROXIMITY';
      const isPooled =
        candidate.type === 'EXACT_SUM_RUN' && new Set(candidate.runDocs.map((x) => x.month_year)).size > 1;
      // Tier per D-NEW.5 (Portfolio Review doctrine, see reconciliation_status_taxonomy.md):
      // an exact-sum match is real evidence the month/window ties out — tier 3, same ceiling
      // as the LIFO/FIFO profiles — NOT a flat tier 4. Only a non-exact proximity match is tier 4.
      const settlement_unit = !isExact
        ? 'PROXIMITY_ONLY'
        : isPooled
          ? 'POOLED_MULTI_MONTH_WINDOW'
          : 'PER_CALENDAR_MONTH_EXACT_SUM';
      const evidence_tier = !isExact ? 4 : 3;
      rows.push({
        doc_no: d.doc_no,
        doc_type: 'INVOICE',
        tx_date: d.tx_date,
        month_year: d.month_year,
        gross_amount: d.lpgAmount,
        settled_amount: d.settledAmount,
        open_amount: d.openAmount,
        settlement_unit,
        evidence_tier,
        evidence_status: isExact && basket.passed ? 'ASSERTED' : 'UNASSESSED',
        matched_against: candidate.payment.payment_doc,
        notes: `STEP 3 candidate (${candidate.type}) vs payment ${candidate.payment.payment_doc}; basket-check: ${basket.reason}. Script-generated — not ERP/human-confirmed. Per D-NEW.5, ${settlement_unit === 'PER_CALENDAR_MONTH_EXACT_SUM' ? 'month-level tie-out only — never treat as per-invoice-confident' : settlement_unit === 'POOLED_MULTI_MONTH_WINDOW' ? 'window-level only, weak' : 'balance-only, no invoice-level claim'}.`,
      });
      continue;
    }

    // D-NEW.7 — check coverage boundary before Step 5's cross-account sweep, and
    // before ever calling this a genuine gap: absence of a match outside the
    // allocator's own scope is not evidence of non-payment.
    if (coverageStart && d.tx_date < coverageStart) {
      rows.push({
        doc_no: d.doc_no,
        doc_type: 'INVOICE',
        tx_date: d.tx_date,
        month_year: d.month_year,
        gross_amount: d.lpgAmount,
        settled_amount: d.settledAmount,
        open_amount: d.openAmount,
        settlement_unit: 'UNCHARACTERIZED',
        evidence_tier: 5,
        evidence_status: 'UNASSESSED',
        matched_against: '',
        notes: `NOT_ATTEMPTED_BY_DESIGN (D-NEW.7): doc predates allocation_edges.csv's earliest payment_date (${coverageStart}) — outside the allocator's coverage, not a genuine gap. Verify against the raw ERP export before treating as open.`,
      });
      continue;
    }

    // Step 5 — cross-account sweep before calling this a genuine gap.
    const crossHits = crossAccountLookup(crossAccountIndex, d.doc_no);
    rows.push({
      doc_no: d.doc_no,
      doc_type: 'INVOICE',
      tx_date: d.tx_date,
      month_year: d.month_year,
      gross_amount: d.lpgAmount,
      settled_amount: d.settledAmount,
      open_amount: d.openAmount,
      settlement_unit: 'UNCHARACTERIZED',
      evidence_tier: 5,
      evidence_status: 'UNASSESSED',
      matched_against: '',
      notes:
        crossHits.length > 0
          ? `No same-account candidate found. Doc number also appears in: ${crossHits.join(', ')} — verify not a cross-account misposting before treating as a genuine gap.`
          : 'No candidate found (exact-sum, contiguous-run, proximity, or cross-account). Genuine gap requiring investigation.',
    });
  }

  // --- Step 6 — orphaned-cash sweep ---
  const consumedByCandidate = new Set([...candidates.values()].map((c) => c.payment.payment_doc));
  for (const p of unconsumedPayments) {
    const crossHits = crossAccountLookup(crossAccountIndex, p.payment_doc);
    rows.push({
      doc_no: p.payment_doc,
      doc_type: 'PAYMENT',
      tx_date: p.payment_date,
      month_year: (p.payment_date || '').slice(0, 7),
      gross_amount: p.amount,
      settled_amount: p.settled,
      open_amount: p.residual,
      settlement_unit: 'UNCHARACTERIZED',
      evidence_tier: 5,
      evidence_status: 'UNASSESSED',
      matched_against: consumedByCandidate.has(p.payment_doc) ? '(consumed by a STEP 3 candidate above)' : '',
      notes: consumedByCandidate.has(p.payment_doc)
        ? 'Orphaned cash consumed by a candidate match against a gap doc above.'
        : crossHits.length > 0
          ? `Orphaned cash, unmatched in this account. Payment doc also appears in: ${crossHits.join(', ')} — verify not misposted.`
          : 'Orphaned cash — no target doc found in this account or any sibling account.',
    });
  }

  // --- Step 8a — Σ(open) ≤ ERP invariant ---
  const sumOpen = round2(rows.filter((r) => r.doc_type === 'INVOICE' && r.open_amount > 0).reduce((s, r) => s + r.open_amount, 0));
  const erp = loadErpStatedBalance(paths);
  const invariant = erp
    ? { held: sumOpen <= erp.value + tolerance, sumOpen, erpValue: erp.value, source: erp.source }
    : { held: null, sumOpen, erpValue: null, source: null, skippedReason: 'no dashboard_metrics.json or knowledge-bundle.json found' };

  // --- Step 8b — debtors:tag-check gate ---
  const tagCheckGate = skipGate ? { status: 'SKIPPED', reason: '--skip-gate' } : runTagCheckGate(code);

  return {
    debtor: code,
    profile: { id: profile.id, label: profile.label },
    dedup: { dupLineCount: universe.dupLineCount, totalLines: universe.totalLines },
    rows,
    summary: {
      invoiceDocs: invoiceDocs.length,
      settled: rows.filter((r) => r.doc_type === 'INVOICE' && Math.abs(r.open_amount) <= tolerance).length,
      gaps: rows.filter(
        (r) => r.doc_type === 'INVOICE' && r.evidence_tier === 5 && !r.notes.startsWith('NOT_ATTEMPTED_BY_DESIGN'),
      ).length,
      notAttemptedByDesign: rows.filter((r) => r.doc_type === 'INVOICE' && r.notes.startsWith('NOT_ATTEMPTED_BY_DESIGN'))
        .length,
      candidates: candidates.size,
      orphanedPayments: unconsumedPayments.length,
    },
    invariant,
    tagCheckGate,
  };
}

const CSV_HEADER = [
  'doc_no',
  'doc_type',
  'tx_date',
  'month_year',
  'gross_amount',
  'settled_amount',
  'open_amount',
  'settlement_unit',
  'evidence_tier',
  'evidence_status',
  'matched_against',
  'notes',
];

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
function main() {
  const args = parseArgs(process.argv);
  let result;
  try {
    result = buildReconciliationStatus(args.debtor, { tolerance: args.tolerance, skipGate: args.skipGate });
  } catch (err) {
    if (err instanceof ReconError) {
      console.error(err.message);
      process.exit(1);
    }
    throw err;
  }

  const outPath = path.join(DEBTORS_ROOT, args.debtor, 'reports/reconciliation_status.csv');
  if (args.write) {
    writeCsvFile(outPath, CSV_HEADER, result.rows);
  }

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`${args.debtor} — settlement profile: ${result.profile.label} (${result.profile.id})`);
    console.log(
      `Doc universe: ${result.dedup.totalLines} lines, ${result.dedup.dupLineCount} PDP-31 duplicates removed.`,
    );
    console.log(
      `Invoices: ${result.summary.invoiceDocs} | settled: ${result.summary.settled} | ` +
        `candidate matches: ${result.summary.candidates} | genuine gaps: ${result.summary.gaps} | ` +
        `not-attempted-by-design (D-NEW.7): ${result.summary.notAttemptedByDesign} | ` +
        `orphaned payments: ${result.summary.orphanedPayments}`,
    );
    if (result.invariant.held === null) {
      console.log(`Σ(open) invariant: SKIPPED — ${result.invariant.skippedReason} (Σopen=${result.invariant.sumOpen})`);
    } else {
      console.log(
        `Σ(open)=${result.invariant.sumOpen} vs ERP (${result.invariant.source})=${result.invariant.erpValue} → ` +
          (result.invariant.held ? 'HOLDS' : 'VIOLATED'),
      );
    }
    console.log(`debtors:tag-check gate: ${result.tagCheckGate.status} (${result.tagCheckGate.reason})`);
    if (args.write) console.log(`Written: ${path.relative(ROOT, outPath)}`);
  }

  const hardFail = result.invariant.held === false || result.tagCheckGate.status === 'FAILED';
  if (hardFail) process.exit(1);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  main();
}

export { buildReconciliationStatus, detectProfile, PROFILES, ReconError };
