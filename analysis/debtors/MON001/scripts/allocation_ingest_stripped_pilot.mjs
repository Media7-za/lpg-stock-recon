#!/usr/bin/env node
/**
 * MON001 — Stripped-gas payment-pattern allocation pilot (Turn 2)
 *
 * Method: LPG-only invoice amounts from ERP TXT (EMPTY pairs stripped).
 * Allocation: chronological LIFO (newest open gas invoice first) across STAT
 * payments — untagged enquiry rows; ref_no not used as authority.
 *
 * Pilot window: MON0012025.TXT (Mar 2024 → Feb 2025) with STAT 109 focus.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  round2,
  parseCsvLine,
  normDoc,
  parseTxtDate,
  isCylRef,
  dnBase,
  fmtAmount,
  displayDate,
  analyseLpgOpenCoverage,
  computeOpenLpgInvoices,
} from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const ACCOUNT = 'MON001';
const TXT_PATHS = [
  path.join(ROOT, 'analysis/debtors/MON001/raw/MON0012025.TXT'),
];
const PILOT_STAT = 'STAT 109';
const PILOT_PAYMENTS = ['39293', '35241', '35818'];
const REVIEW_PAYMENTS = new Set(['39293']); // operator: likely duplicate / over-gross pay
const TOL = 0.05;

const fmtR = (n) => `R${fmtAmount(n)}`;

function parseTxtRows(absPath) {
  const txt = fs.readFileSync(absPath, 'utf8');
  const headerBalance = Number(txt.match(/CURRENT BALANCE:","(-?[0-9.]+)"/)?.[1]);
  const totalLine = txt.match(/TOTAL TRANSACTIONS:\s*(-?[0-9.]+)/)?.[1];
  const closeFromRows = totalLine != null ? Number(totalLine) : null;
  const rows = [];
  for (const line of txt.split('\n')) {
    if (!/^"\d+"/.test(line.trim())) continue;
    const p = parseCsvLine(line);
    if (p.length < 11) continue;
    const [, , docno, entry, date, invno, ref] = p;
    if (!date || !date.includes('/')) continue;
    const dn = (ref || '').trim();
    const statMatch = dn.match(/STAT\s+\d+/i);
    rows.push({
      docno,
      cleanDoc: normDoc(docno),
      entry,
      iso: parseTxtDate(date),
      invno: normDoc(invno),
      dn,
      amount: round2(Number(p[9])),
      stat: statMatch ? statMatch[0].toUpperCase().replace(/\s+/, ' ') : '',
    });
  }
  return { headerBalance, closeFromRows, rows };
}

function mergeRows(paths) {
  const seen = new Set();
  const rows = [];
  let headerBalance = null;
  let closeFromRows = null;
  for (const abs of paths) {
    if (!fs.existsSync(abs)) continue;
    const parsed = parseTxtRows(abs);
    if (Number.isFinite(parsed.headerBalance)) headerBalance = parsed.headerBalance;
    if (Number.isFinite(parsed.closeFromRows)) closeFromRows = parsed.closeFromRows;
    for (const r of parsed.rows) {
      const key = `${r.cleanDoc}|${r.entry}|${r.iso}|${r.amount}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(r);
    }
  }
  rows.sort(
    (a, b) =>
      a.iso.localeCompare(b.iso) ||
      (a.entry === 'Invoice' ? 0 : 1) - (b.entry === 'Invoice' ? 0 : 1) ||
      a.docno.localeCompare(b.docno),
  );
  return { headerBalance, closeFromRows, rows };
}

function buildLpgInvoicePool(rows) {
  const invoices = [];
  for (const r of rows) {
    if (r.entry !== 'Invoice' || isCylRef(r.dn)) continue;
    invoices.push({
      doc: r.cleanDoc,
      docno: r.docno,
      iso: r.iso,
      dn: r.dn,
      dnBase: dnBase(r.dn),
      gross: r.amount,
      due: r.amount,
    });
  }
  const gasCns = rows
    .filter((r) => r.entry === 'Crd Note' && !isCylRef(r.dn))
    .sort((a, b) => a.iso.localeCompare(b.iso) || a.docno.localeCompare(b.docno));

  for (const cn of gasCns) {
    const base = dnBase(cn.dn);
    const candidates = invoices.filter((inv) => inv.due > 0.01 && inv.dnBase === base);
    candidates.sort(
      (a, b) =>
        (a.iso === cn.iso ? 0 : 1) - (b.iso === cn.iso ? 0 : 1) ||
        a.doc.localeCompare(b.doc),
    );
    const target = candidates[0];
    if (!target) continue;
    target.due = round2(target.due + cn.amount);
  }
  return invoices.filter((inv) => inv.due > 0.01);
}

function allocateLifo(payment, openPool) {
  const sorted = openPool
    .filter((inv) => inv.iso <= payment.iso && inv.due > 0.01)
    .sort((a, b) => b.iso.localeCompare(a.iso) || b.doc.localeCompare(a.doc));

  let remaining = round2(Math.abs(payment.amount));
  const edges = [];

  for (const inv of sorted) {
    if (remaining <= TOL) break;
    const alloc = round2(Math.min(inv.due, remaining));
    if (alloc <= TOL) continue;
    edges.push({
      payment_doc: payment.cleanDoc,
      payment_date: payment.iso,
      payment_amount: round2(Math.abs(payment.amount)),
      stat: payment.stat,
      target_doc: inv.doc,
      target_docno: inv.docno,
      target_date: inv.iso,
      target_dn: inv.dn,
      lpg_open_before: round2(inv.due),
      allocated_amount: alloc,
      variance: round2(inv.due - alloc),
      allocation_type: alloc + TOL >= inv.due ? 'LIFO_FULL' : 'LIFO_PARTIAL',
      confidence: REVIEW_PAYMENTS.has(payment.cleanDoc) ? 'OPERATOR_REVIEW' : 'PATTERN_LIFO',
      review_required: REVIEW_PAYMENTS.has(payment.cleanDoc) || alloc + TOL < inv.due,
    });
    inv.due = round2(inv.due - alloc);
    remaining = round2(remaining - alloc);
  }

  return { edges, unallocated: remaining };
}

// ---------------------------------------------------------------------------
// Decision cards — anomaly + evidence only, no pre-proposed readings.
// Disposition vocabulary is fixed and account-agnostic; the operator ticks one
// in reports/[ACCOUNT]_Allocation_Decisions.md and the next run merges it.
// ---------------------------------------------------------------------------

const DISPOSITIONS = [
  'CONFIRM',
  'REALLOCATE',
  'UNAPPLIED_CASH',
  'DUPLICATE_REVERSE',
  'NEEDS_EVIDENCE',
  'DEFER',
];

/** Coupling: ruling on the key payment reopens the listed payments' decisions. */
const COUPLED_PAYMENTS = { '35818': ['36258'] };

/** Ledger window: rows sharing the payment's DN base, or within ±45 days. */
function ledgerWindow(rows, payment, targets) {
  const dnBases = new Set(
    [payment, ...targets].map((r) => dnBase(r?.dn || '')).filter(Boolean),
  );
  const pDate = payment.iso;
  const days = (a, b) => Math.abs((new Date(a) - new Date(b)) / 86400000);
  return rows
    .filter((r) => {
      if (r.entry === 'Payment' && r.cleanDoc === payment.cleanDoc) return true;
      if (targets.some((t) => t.cleanDoc === r.cleanDoc)) return true;
      if (dnBases.has(dnBase(r.dn || ''))) return true;
      return days(r.iso, pDate) <= 45;
    })
    .sort((a, b) => a.iso.localeCompare(b.iso) || a.docno.localeCompare(b.docno));
}

/** Running balance across a window; the window's first row opens at its amount. */
function withRunningBalance(window) {
  let bal = 0;
  return window.map((r) => {
    bal = round2(bal + r.amount);
    return { ...r, running: bal };
  });
}

function buildDecisions(rows, allEdges) {
  const decisions = [];
  const reviewEdges = allEdges.filter((e) => e.review_required);

  for (const e of reviewEdges) {
    const payment = rows.find(
      (r) => r.cleanDoc === e.payment_doc && r.entry === 'Payment',
    );
    if (!payment) continue;

    const targets = rows.filter((r) => r.cleanDoc === e.target_doc);
    const window = ledgerWindow(rows, payment, targets);
    const balBefore = round2(
      window
        .filter((r) => r.iso < payment.iso || (r.iso === payment.iso && r.entry !== 'Payment'))
        .reduce((s, r) => s + r.amount, 0),
    );

    const isRemainder = e.allocation_type === 'UNALLOCATED_REMAINDER';
    const anomaly = isRemainder
      ? `Payment ${e.payment_doc} (${fmtR(e.payment_amount)}) leaves ${fmtR(e.variance)} unallocated after LIFO targets — no open gas invoice at or before ${displayDate(e.payment_date)} absorbs the remainder.`
      : `Payment ${e.payment_doc} (${fmtR(e.payment_amount)}) allocated ${fmtR(e.allocated_amount)} to ${e.target_doc} (${displayDate(e.target_date)}, open ${fmtR(e.lpg_open_before)}) — ${e.allocation_type === 'LIFO_PARTIAL' ? `partial, ${fmtR(e.variance)} remains open` : 'full'}; account balance before payment ${fmtR(balBefore)}.`;

    decisions.push({
      id: `D-${ACCOUNT}-${e.payment_doc}${isRemainder ? '-REM' : ''}`,
      payment_doc: e.payment_doc,
      payment_date: e.payment_date,
      payment_amount: e.payment_amount,
      stat: e.stat,
      edge_id: e.allocation_id,
      allocation_type: e.allocation_type,
      target_doc: e.target_doc || null,
      target_date: e.target_date || null,
      target_dn: e.target_dn || null,
      allocated_amount: e.allocated_amount,
      variance: e.variance,
      lpg_open_before: e.lpg_open_before,
      anomaly,
      coupled_with: COUPLED_PAYMENTS[e.payment_doc] || [],
      ledger_window: withRunningBalance(window).map((r) => ({
        date: r.iso,
        doc: r.cleanDoc,
        entry: r.entry,
        dn: r.dn,
        amount: r.amount,
        running: r.running,
      })),
      ruling: null,
      ruling_docs: '',
      ruling_reason: '',
    });
  }
  return decisions;
}

function parseExistingDecisions(mdPath) {
  if (!fs.existsSync(mdPath)) return new Map();
  const md = fs.readFileSync(mdPath, 'utf8');
  const map = new Map();
  const cardRe = /### (D-[A-Z0-9-]+)[\s\S]*?(?=\n### D-|\n## |\n---\s*$|$)/g;
  let m;
  while ((m = cardRe.exec(md))) {
    const id = m[1];
    const body = m[2] || '';
    const ticked = body.match(/- \[x\] `([A-Z_]+)`/i);
    const docs = body.match(/docs:\s*`([^`]*)`/);
    const reason = body.match(/Reason:\s*`([^`]*)`/);
    map.set(id, {
      ruling: ticked ? ticked[1].toUpperCase() : null,
      ruling_docs: docs ? docs[1] : '',
      ruling_reason: reason ? reason[1] : '',
    });
  }
  return map;
}

function renderDecisionsMd(decisions, existing) {
  const lines = [];
  lines.push(`# ${ACCOUNT} — Allocation Decision Queue`);
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString().slice(0, 10)} · regenerate via \`scripts/allocation_ingest_stripped_pilot.mjs\``);
  lines.push('');
  lines.push('Tick exactly one disposition per card. `REALLOCATE` needs `docs:` and amounts. Rulings merge into `data/allocation_decisions.json` on re-run; unticked cards stay open.');
  lines.push('');
  const open = decisions.filter((d) => !d.ruling);
  const ruled = decisions.filter((d) => d.ruling);
  lines.push(`| Open | Ruled | Total |`);
  lines.push(`| ---: | ---: | ---: |`);
  lines.push(`| ${open.length} | ${ruled.length} | ${decisions.length} |`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const d of decisions) {
    const prior = existing.get(d.id);
    const ruling = prior?.ruling ?? d.ruling;
    const rulingDocs = prior?.ruling_docs ?? d.ruling_docs;
    const rulingReason = prior?.ruling_reason ?? d.ruling_reason;

    lines.push(`### ${d.id} · Payment ${d.payment_doc} — ${fmtR(d.payment_amount)} · ${d.stat || 'no batch'} · ${displayDate(d.payment_date)}`);
    lines.push('');
    lines.push(`**Status:** ${ruling ? `RULED — ${ruling}` : 'OPEN'}`);
    if (d.coupled_with.length) {
      lines.push(` · **Coupled:** ruling here reopens ${d.coupled_with.map((p) => `D-${ACCOUNT}-${p}`).join(', ')}`);
    }
    lines.push('');
    lines.push('');
    lines.push(`**Engine allocation:** ${d.target_doc ? `${fmtR(d.allocated_amount)} → ${d.target_doc} (${displayDate(d.target_date)}, ${d.target_dn || 'no DN'}, open ${fmtR(d.lpg_open_before)})` : `${fmtR(d.variance)} unallocated remainder`} · ${d.allocation_type}`);
    lines.push('');
    lines.push('**Anomaly:** ' + d.anomaly);
    lines.push('');
    lines.push('**Ledger window** *(running balance is window-local)*');
    lines.push('');
    lines.push('| Date | Doc | Entry | DN | Amount | Running |');
    lines.push('| :--- | :--- | :--- | :--- | ---: | ---: |');
    for (const r of d.ledger_window) {
      const mark = r.doc === d.payment_doc && r.entry === 'Payment' ? ' **→**' : '';
      lines.push(`| ${displayDate(r.date)} |${mark} ${r.doc} | ${r.entry} | ${r.dn || ''} | ${fmtR(r.amount)} | ${fmtR(r.running)} |`);
    }
    lines.push('');
    lines.push('**Your ruling** (tick one)');
    lines.push('');
    for (const disp of DISPOSITIONS) {
      const tick = ruling === disp ? 'x' : ' ';
      const extra = disp === 'REALLOCATE' ? ` → docs: \`${rulingDocs}\`  amounts: \`\`` : disp === 'NEEDS_EVIDENCE' ? ' → artifact: ``' : '';
      lines.push(`- [${tick}] \`${disp}\`${extra}`);
    }
    lines.push('');
    lines.push(`Reason: \`${rulingReason}\``);
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  return lines.join('\n');
}

function runChronologicalAllocation(rows, pool) {
  const payments = rows
    .filter((r) => r.entry === 'Payment')
    .sort((a, b) => a.iso.localeCompare(b.iso) || a.docno.localeCompare(b.docno));

  const allEdges = [];
  let edgeId = 1;
  let groupId = 1;

  for (const payment of payments) {
    const { edges, unallocated } = allocateLifo(payment, pool);
    const ag = `AG-${String(groupId++).padStart(6, '0')}`;
    for (const e of edges) {
      allEdges.push({
        allocation_id: `AL-${String(edgeId++).padStart(4, '0')}`,
        allocation_group_id: ag,
        ...e,
      });
    }
    if (unallocated > TOL) {
      allEdges.push({
        allocation_id: `AL-${String(edgeId++).padStart(4, '0')}`,
        allocation_group_id: ag,
        payment_doc: payment.cleanDoc,
        payment_date: payment.iso,
        payment_amount: round2(Math.abs(payment.amount)),
        stat: payment.stat,
        target_doc: '',
        target_docno: '',
        target_date: '',
        target_dn: '',
        lpg_open_before: 0,
        allocated_amount: 0,
        variance: unallocated,
        allocation_type: 'UNALLOCATED_REMAINDER',
        confidence: 'PATTERN_LIFO',
        review_required: true,
      });
    }
  }

  return allEdges;
}

function main() {
  const { headerBalance, closeFromRows, rows } = mergeRows(TXT_PATHS);
  const pool = buildLpgInvoicePool(rows);
  const allEdges = runChronologicalAllocation(rows, pool);
  const decisions = buildDecisions(rows, allEdges);

  const pilotEdges = allEdges.filter((e) => PILOT_PAYMENTS.includes(e.payment_doc));
  const stat109Edges = allEdges.filter((e) => e.stat === PILOT_STAT && e.target_doc);
  const openAfter = pool.filter((i) => i.due > 0.01);
  const sumOpen = round2(openAfter.reduce((s, i) => s + i.due, 0));

  const coverage = analyseLpgOpenCoverage({
    rows,
    openInvoices: openAfter.map((i) => ({
      doc: i.doc,
      docno: i.docno,
      iso: i.iso,
      dn: i.dn,
      due: i.due,
    })),
    headerBalance: closeFromRows ?? headerBalance,
  });

  const dataDir = path.join(ROOT, 'analysis/debtors/MON001/data');
  fs.mkdirSync(dataDir, { recursive: true });
  const csvPath = path.join(dataDir, 'allocation_edges_stripped_pilot.csv');
  const headers = [
    'allocation_id',
    'allocation_group_id',
    'payment_doc',
    'payment_date',
    'payment_amount',
    'stat',
    'target_doc',
    'target_date',
    'target_dn',
    'lpg_open_before',
    'allocated_amount',
    'variance',
    'allocation_type',
    'confidence',
    'review_required',
  ];
  const csvLines = [headers.join(',')];
  for (const e of allEdges) {
    csvLines.push(
      [
        e.allocation_id,
        e.allocation_group_id,
        e.payment_doc,
        e.payment_date,
        e.payment_amount,
        `"${(e.stat || '').replace(/"/g, '""')}"`,
        e.target_doc,
        e.target_date,
        `"${(e.target_dn || '').replace(/"/g, '""')}"`,
        e.lpg_open_before ?? 0,
        e.allocated_amount ?? 0,
        e.variance ?? 0,
        e.allocation_type,
        e.confidence,
        e.review_required,
      ].join(','),
    );
  }
  fs.writeFileSync(csvPath, csvLines.join('\n') + '\n');

  const report = [];
  report.push('# MON001 — Payment Allocation v1 (Turn 2 Pilot — Stripped Gas LIFO)');
  report.push('');
  report.push('**Account:** SHORTEN INTERNATIONAL 66 ON MONZALI');
  report.push(`**Source:** \`raw/MON0012025.TXT\` (Mar 2024 → Feb 2025)`);
  report.push(`**Pilot focus:** ${PILOT_STAT} payments ${PILOT_PAYMENTS.join(', ')}`);
  report.push('**Method:** LPG-only TXT · EMPTY stripped · DN-base CN net · chronological LIFO (ref_no not authority)');
  report.push(`**Generated:** ${new Date().toISOString().slice(0, 10)}`);
  report.push('');
  report.push('---');
  report.push('');
  report.push('## 1. Executive Summary');
  report.push('');
  report.push('| Metric | Value |');
  report.push('| :--- | :--- |');
  report.push(`| Enquiry close (TOTAL TRANSACTIONS) | ${fmtR(closeFromRows ?? NaN)} |`);
  report.push(`| CURRENT header (now) | ${fmtR(headerBalance)} |`);
  report.push(`| Total allocation edges | ${allEdges.filter((e) => e.target_doc).length} |`);
  report.push(`| ${PILOT_STAT} pilot edges | ${stat109Edges.length} |`);
  report.push(`| Open LPG after all payments | ${openAfter.length} lines, ${fmtR(sumOpen)} |`);
  report.push(`| LPG stripped gate | **${coverage.gate}** |`);
  report.push(`| Reconciliation gap (ERP − Σ open LPG) | ${fmtR(coverage.reconciliation_gap ?? 0)} |`);
  report.push('');
  report.push('---');
  report.push('');
  report.push('## 2. Pilot — STAT 109 payments');
  report.push('');
  for (const pmt of PILOT_PAYMENTS) {
    const pmtRow = rows.find((r) => r.cleanDoc === pmt && r.entry === 'Payment');
    const edges = pilotEdges.filter((e) => e.payment_doc === pmt && e.target_doc);
    const remainder = pilotEdges.find((e) => e.payment_doc === pmt && e.allocation_type === 'UNALLOCATED_REMAINDER');
    report.push(`### Payment ${pmt}${pmtRow ? ` (${displayDate(pmtRow.iso)}, ${fmtR(Math.abs(pmtRow.amount))})` : ''}`);
    report.push('');
    if (REVIEW_PAYMENTS.has(pmt)) {
      report.push('> **OPERATOR_REVIEW:** Flagged as likely duplicate / gross overpay — pays full LPG on **36720** while account net before payment was **R1,059.20**; recreates **~R1,543.66** credit.');
      report.push('');
    }
    if (pmt === '35818') {
      report.push('> **OPERATOR_CONFIRMED:** Commercial bundle **38044 + CN 9078 + pmt 35818** — LIFO may not match ERP clerical refs; ratify via `payment_pattern_overrides.json`.');
      report.push('');
    }
    report.push('| Target | Inv date | DN | Open before | Allocated | Type | Review |');
    report.push('| :--- | :--- | :--- | ---: | ---: | :--- | :--- |');
    if (edges.length === 0) {
      report.push('| — | — | — | — | — | — | — |');
    }
    for (const e of edges) {
      report.push(
        `| ${e.target_doc} | ${displayDate(e.target_date)} | ${e.target_dn} | ${fmtR(e.lpg_open_before)} | ${fmtR(e.allocated_amount)} | ${e.allocation_type} | ${e.review_required ? 'yes' : 'no'} |`,
      );
    }
    if (remainder) {
      report.push(`| *(remainder)* | | | | ${fmtR(remainder.variance)} unallocated | UNALLOCATED_REMAINDER | yes |`);
    }
    report.push('');
  }
  report.push('---');
  report.push('');
  report.push('## 3. Open LPG (post-allocation model)');
  report.push('');
  report.push('| Inv | Date | DN | Due (R) |');
  report.push('| :--- | :--- | :--- | ---: |');
  for (const inv of openAfter) {
    report.push(`| ${inv.doc} | ${displayDate(inv.iso)} | ${inv.dn} | ${fmtR(inv.due)} |`);
  }
  if (openAfter.length === 0) report.push('| *(none)* | | | |');
  report.push('');
  report.push('---');
  report.push('');
  report.push('## 4. Reconciliation bridge');
  report.push('');
  report.push('| Component | Amount |');
  report.push('| :--- | ---: |');
  report.push(`| Σ open LPG (stripped model) | ${fmtR(sumOpen)} |`);
  report.push(`| Enquiry close / header used | ${fmtR(coverage.header_balance)} |`);
  report.push(`| Gap (CYL + account-level credits) | ${fmtR(coverage.reconciliation_gap ?? 0)} |`);
  report.push(`| Untagged credit total | ${fmtR(coverage.untagged_credit_total)} |`);
  report.push('');
  report.push('---');
  report.push('');
  report.push('## 5. Artifacts');
  report.push('');
  report.push('| File | Rows |');
  report.push('| :--- | ---: |');
  report.push('| `data/allocation_edges_stripped_pilot.csv` | ' + allEdges.length + ' |');
  report.push('| `reports/MON001_Allocation_Decisions.md` | ' + decisions.length + ' cards |');
  report.push('| `data/allocation_decisions.json` | parsed rulings |');
  report.push('');
  report.push(`**${decisions.filter((d) => !d.ruling).length} decisions open** — see [Allocation_Decisions.md](MON001_Allocation_Decisions.md). Gate stays BLOCKED while cards are open.`);
  report.push('');
  report.push('*Generated by `scripts/allocation_ingest_stripped_pilot.mjs`*');

  // Decision queue: scaffold + merge prior rulings
  const decisionsMdPath = path.join(ROOT, 'analysis/debtors/MON001/reports/MON001_Allocation_Decisions.md');
  const decisionsJsonPath = path.join(dataDir, 'allocation_decisions.json');
  const existing = parseExistingDecisions(decisionsMdPath);
  for (const d of decisions) {
    const prior = existing.get(d.id);
    if (prior?.ruling) {
      d.ruling = prior.ruling;
      d.ruling_docs = prior.ruling_docs;
      d.ruling_reason = prior.ruling_reason;
    }
  }
  fs.writeFileSync(decisionsMdPath, renderDecisionsMd(decisions, existing) + '\n');
  fs.writeFileSync(
    decisionsJsonPath,
    JSON.stringify(
      {
        account: ACCOUNT,
        generated: new Date().toISOString(),
        decisions,
      },
      null,
      2,
    ) + '\n',
  );

  const reportPath = path.join(ROOT, 'analysis/debtors/MON001/reports/MON001_Payment_Allocation_Stripped_v1.md');
  fs.writeFileSync(reportPath, report.join('\n') + '\n');

  console.log(`[${ACCOUNT}] Stripped-gas LIFO pilot complete`);
  console.log(`[${ACCOUNT}] Edges: ${allEdges.filter((e) => e.target_doc).length} confirmed, ${allEdges.filter((e) => e.allocation_type === 'UNALLOCATED_REMAINDER').length} remainders`);
  console.log(`[${ACCOUNT}] Open LPG: ${fmtR(sumOpen)} (${openAfter.length} docs)`);
  console.log(`[${ACCOUNT}] Gate: ${coverage.gate}`);
  console.log(`[${ACCOUNT}] Wrote ${csvPath}`);
  console.log(`[${ACCOUNT}] Wrote ${reportPath}`);
}

main();
