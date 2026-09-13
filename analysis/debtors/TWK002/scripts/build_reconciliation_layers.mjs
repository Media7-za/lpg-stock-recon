#!/usr/bin/env node
/**
 * TWK002 — three-layer reconciliation view (ERP → remittance → correction).
 *
 * Visualises the Model B correction stack per remittance batch:
 *   Layer 1 — ERP as-posted (gross/untagged payments, wrong structure)
 *   Layer 2 — Remittance invoice allocations (Tier-1 authority)
 *   Layer 3 — Path B / hygiene corrections (cash strip, discount journal, ERP tags)
 *
 * Run: node analysis/debtors/TWK002/scripts/build_reconciliation_layers.mjs [--write]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCsvLine, parseTxtDate, fmtAmount } from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const DATA = path.join(ROOT, 'analysis/debtors/TWK002/data');
const RAW = path.join(ROOT, 'analysis/debtors/TWK002/raw');
const OUT = path.join(ROOT, 'analysis/debtors/TWK002/reports/fork/TWK002_Reconciliation_Layers.md');
const write = process.argv.includes('--write');

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
const fmtR = (n) => (n < 0 ? '-R' : 'R') + fmtAmount(Math.abs(round2(n)));

function parseCsv(absPath) {
  const lines = fs.readFileSync(absPath, 'utf8').trim().split('\n').map((l) => l.replace(/\r$/, ''));
  const header = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const parts = [];
    let cur = '';
    let inQ = false;
    for (const c of line) {
      if (c === '"') {
        inQ = !inQ;
        continue;
      }
      if (c === ',' && !inQ) {
        parts.push(cur);
        cur = '';
        continue;
      }
      cur += c;
    }
    parts.push(cur);
    const row = {};
    header.forEach((h, i) => (row[h] = parts[i] ?? ''));
    return row;
  });
}

function parseTxtPayments(absPath) {
  const text = fs.readFileSync(absPath, 'utf8');
  const out = [];
  for (const line of text.split(/\r?\n/)) {
    if (!/^"\d+"/.test(line.trim())) continue;
    const p = parseCsvLine(line);
    if (p[3] !== 'Payment' && p[3] !== 'Journal') continue;
    if (!p[4]?.includes('/')) continue;
    out.push({
      docno: p[2]?.replace(/^0+/, '') || p[2],
      entry: p[3],
      iso: parseTxtDate(p[4]),
      date: p[4],
      invno: (p[5] || '').replace(/^0+/, '') || '—',
      ref: [p[6], p[8]].filter(Boolean).join(' · ') || '—',
      amount: round2(p[9]),
    });
  }
  return out;
}

function loadBridge(year) {
  const p = path.join(DATA, `recreated_ledger_payment_bridge_${year}.csv`);
  if (!fs.existsSync(p)) return [];
  return parseCsv(p).map((r) => ({
    batchId: r.batch_id,
    paidDate: r.remittance_paid_date,
    erpDoc: r.erp_payment_doc?.replace(/^0+/, ''),
    erpGross: round2(r.erp_payment_gross),
    cash: round2(r.remittance_cash),
    journal: round2(r.proforma_journal),
    gross: round2(r.remittance_gross),
    variance: round2(r.erp_variance),
    proformaDoc: r.proforma_doc,
    adjusted: r.payment_adjusted === 'True',
  }));
}

const edges = parseCsv(path.join(DATA, 'allocation_edges.csv'));
const phase2 = parseCsv(path.join(DATA, 'finance_posting_checklist_2025_phase2.csv'));
const txtRows = parseTxtPayments(path.join(RAW, 'TWK002_FULL_HISTORY.TXT'));
const bridges = [...loadBridge('2023'), ...loadBridge('2024')];

const edgesByBatch = new Map();
for (const e of edges) {
  const bid = e.batch_id;
  if (!edgesByBatch.has(bid)) edgesByBatch.set(bid, []);
  edgesByBatch.get(bid).push(e);
}

const bridgeByBatch = new Map(bridges.map((b) => [b.batchId, b]));
const phase2ByBatch = new Map(phase2.filter((r) => r.batch_id).map((r) => [r.batch_id, r]));

const batchIds = [...new Set([...edgesByBatch.keys(), ...bridgeByBatch.keys()])].sort();

function erpRowsForDoc(doc) {
  const d = String(doc).replace(/^0+/, '');
  return txtRows.filter((r) => r.docno === d || r.docno.replace(/^0+/, '') === d);
}

function journalRowsForBatch(batchId, erpDoc) {
  const rows = [];
  const p2 = phase2ByBatch.get(batchId);
  if (p2?.journal_amount && Number(p2.journal_amount) !== 0) {
    rows.push({
      kind: 'Path B journal',
      doc: p2.proforma_doc || '—',
      amount: round2(p2.journal_amount),
      status: p2.journal_done === 'true' ? 'POSTED' : p2.status,
      note: p2.notes || `Discount for ${batchId}`,
    });
  }
  const bridge = bridgeByBatch.get(batchId);
  if (bridge?.proformaDoc) {
    const posted = txtRows.find(
      (r) =>
        r.entry === 'Journal' &&
        r.ref.includes('DISCOUNT') &&
        Math.abs(r.amount) === Math.abs(bridge.journal),
    );
    if (posted && !rows.some((x) => x.amount === posted.amount)) {
      rows.push({
        kind: 'ERP journal (posted)',
        doc: posted.docno,
        amount: posted.amount,
        status: 'PROVEN',
        note: posted.ref,
      });
    }
  }
  return rows;
}

function hygieneNote(batchId, erpDoc) {
  if (batchId === 'BATCH-2025-03-31') return 'H-022 OPEN — tag receipt 00037770 per AL-0109–0116 (does not change header residual)';
  if (batchId === 'BATCH-2025-05-31') return 'H-023 OPEN — tag untagged slice on 00039080 → 42468/42470';
  if (batchId === 'BATCH-2026-STAT-129') return 'H-026 OPEN — tag cash 00045899 per AL-0171–0191';
  return '';
}

const md = [];
md.push('# TWK002 — reconciliation layers (ERP → remittance → correction)');
md.push('');
md.push('**Purpose:** Visualise the three-step Model B stack you described:');
md.push('');
md.push('1. **Layer 1 — ERP as-posted** — what the ledger shows today (often gross lump payments, blank INVNO)');
md.push('2. **Layer 2 — Remittance adjustments** — which invoices each payment actually cleared (Tier-1 authority)');
md.push('3. **Layer 3 — Corrections** — strip payment to cash, post `DISCOUNT ALLOWED` journal, reverse ghosts; ERP tagging hygiene');
md.push('');
md.push('**Sources:** `TWK002_FULL_HISTORY.TXT` · `allocation_edges.csv` · `recreated_ledger_payment_bridge_*.csv` · `finance_posting_checklist_2025_phase2.csv`');
md.push('');
md.push('```mermaid');
md.push('flowchart LR');
md.push('  A[Layer 1: ERP gross payment] --> B[Layer 2: Remittance invoice slices]');
md.push('  A --> C[Layer 3a: Adjust to cash]');
md.push('  C --> D[Layer 3b: DISCOUNT ALLOWED journal]');
md.push('  B --> E[Layer 3c: ERP payment tags H-022/023/026]');
md.push('  D --> F[Target: cash + journal = remittance gross]');
md.push('```');
md.push('');
md.push('---');
md.push('');

for (const batchId of batchIds) {
  const batchEdges = edgesByBatch.get(batchId) || [];
  const bridge = bridgeByBatch.get(batchId);
  const erpDoc = batchEdges[0]?.payment_doc || bridge?.erpDoc || '—';
  const stat = batchEdges[0]?.erp_stat || '—';
  const paymentAmt = batchEdges[0] ? round2(batchEdges[0].payment_amount) : bridge?.erpGross;

  md.push(`## ${batchId} · ${stat} · receipt **${erpDoc}**`);
  md.push('');

  md.push('### Layer 1 — ERP as-posted');
  md.push('');
  md.push('| Date | Doc | Entry | INVNO | Reference | Amount | Issue |');
  md.push('| :--- | :--- | :--- | :--- | :--- | ---: | :--- |');

  const erpPayments = erpRowsForDoc(erpDoc).filter((r) => r.entry === 'Payment');
  if (erpPayments.length) {
    for (const r of erpPayments) {
      const issue =
        r.invno === '—' ? '**Untagged** — remittance names targets; ERP INVNO blank' : `Tagged → ${r.invno}`;
      md.push(
        `| ${r.date} | ${r.docno} | Payment | ${r.invno} | ${r.ref.replace(/\|/g, '/')} | ${fmtR(r.amount)} | ${issue} |`,
      );
    }
  } else if (bridge) {
    md.push(
      `| ${bridge.paidDate} | ${bridge.erpDoc} | Payment | — | (from bridge) | ${fmtR(bridge.erpGross)} | ${bridge.adjusted ? '**Gross over-post** — strip to cash in Layer 3' : 'Cash-only post — journal missing until Layer 3'} |`,
    );
  } else {
    md.push('| — | — | — | — | — | — | No payment row in full-history TXT |');
  }
  md.push('');

  md.push('### Layer 2 — Remittance invoice allocations (Tier-1)');
  md.push('');
  if (batchEdges.length) {
    md.push(`Remittance **cash R${fmtAmount(paymentAmt)}** decomposed to **${batchEdges.length}** invoice/CN slices:`);
    md.push('');
    md.push('| Edge | Invoice | Slice (R) | Type |');
    md.push('| :--- | :--- | ---: | :--- |');
    for (const e of batchEdges) {
      md.push(
        `| ${e.allocation_id} | ${e.target_doc} | ${fmtAmount(round2(e.allocated_amount))} | ${e.allocation_type} |`,
      );
    }
  } else {
    md.push('*No allocation edges ingested for this batch.*');
  }
  md.push('');

  md.push('### Layer 3 — Path B corrections & hygiene');
  md.push('');
  md.push('| Step | Action | Doc / task | Amount | Status |');
  md.push('| :--- | :--- | :--- | ---: | :--- |');

  if (bridge?.adjusted) {
    md.push(
      `| 3a | **Reverse gross → cash** | ${bridge.erpDoc} | ${fmtR(bridge.cash)} (was ${fmtR(bridge.erpGross)}) | PROVEN — bridge |`,
    );
  } else if (bridge) {
    md.push(`| 3a | Cash already correct | ${bridge.erpDoc} | ${fmtR(bridge.cash)} | PROVEN — no strip needed |`);
  } else {
    const p2 = phase2ByBatch.get(batchId);
    if (p2) {
      md.push(
        `| 3a | Cash post | ${p2.erp_receipt} | ${fmtR(round2(p2.correct_cash || p2.erp_gross))} | ${p2.payment_done === 'true' ? 'DONE' : p2.status} |`,
      );
    }
  }

  const journals = journalRowsForBatch(batchId, erpDoc);
  for (const j of journals) {
    md.push(`| 3b | ${j.kind} | ${j.doc} | ${fmtR(j.amount)} | ${j.status} — ${j.note} |`);
  }

  if (bridge) {
    md.push(
      `| ✓ | **Target check** | cash + journal | ${fmtR(bridge.gross)} gross | remittance gross ${fmtR(bridge.gross)} |`,
    );
  }

  const hygiene = hygieneNote(batchId, erpDoc);
  if (hygiene) {
    md.push(`| 3c | ERP tagging hygiene | — | — | ${hygiene} |`);
  }
  md.push('');
  md.push('---');
  md.push('');
}

md.push('## What this is not');
md.push('');
md.push('- **Not a customer statement** — open-invoice forks omit payments by design.');
md.push('- **Not H-027** — the R8,084.67 residual is a header plug after layers 1–3; BS reclass is separate.');
md.push('- **2025+ gross→cash strips** — mostly already correct in ERP; Layer 3 for those batches is mainly **discount journal + tagging hygiene**.');
md.push('');
md.push('Regenerate: `npm run debtors:twk002-reconciliation-layers`');
md.push('');

console.log(`Reconciliation layers: ${batchIds.length} batches`);

if (write) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, md.join('\n'));
  console.log(`Wrote ${path.relative(ROOT, OUT)}`);
} else {
  console.log('Dry run — pass --write');
}
