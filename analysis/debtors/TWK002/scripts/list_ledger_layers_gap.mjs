#!/usr/bin/env node
/**
 * List full-history ledger rows not covered by Reconciliation Layers.
 * Run: node analysis/debtors/TWK002/scripts/list_ledger_layers_gap.mjs [--write]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCsvLine, parseTxtDate, fmtAmount } from '../../shared/scripts/debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const TXT = path.join(ROOT, 'analysis/debtors/TWK002/raw/TWK002_FULL_HISTORY.TXT');
const DATA = path.join(ROOT, 'analysis/debtors/TWK002/data');
const CONFIG = path.join(ROOT, 'analysis/debtors/TWK002/config/statement_of_account.json');
const OUT = path.join(ROOT, 'analysis/debtors/TWK002/reports/fork/TWK002_Ledger_Layers_Gap.md');
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

function normDoc(s) {
  const d = String(s || '').replace(/\D/g, '');
  return d ? String(parseInt(d, 10)) : '';
}

function loadTxns() {
  const txtLines = fs.readFileSync(TXT, 'utf8').split(/\r?\n/);
  const ds = txtLines.findIndex((l) => l.startsWith('"LINE"'));
  const txns = [];
  for (let i = ds + 1; i < txtLines.length; i++) {
    const line = txtLines[i];
    if (!line.startsWith('"') || line.includes('TOTAL TRANSACTIONS')) continue;
    const p = parseCsvLine(line);
    if (p[6] === 'BALANCE B/F:') continue;
    if (!p[4]?.includes('/')) continue;
    txns.push({
      date: p[4],
      iso: parseTxtDate(p[4]),
      docno: normDoc(p[2]),
      entry: p[3],
      invno: normDoc(p[5]),
      ref: [p[6], p[8]].filter(Boolean).join(' · '),
      amount: round2(Number(p[9])),
    });
  }
  return txns;
}

function buildLayerIndex() {
  const edges = parseCsv(path.join(DATA, 'allocation_edges.csv'));
  const bridges = [
    ...parseCsv(path.join(DATA, 'recreated_ledger_payment_bridge_2023.csv')),
    ...parseCsv(path.join(DATA, 'recreated_ledger_payment_bridge_2024.csv')),
  ];
  const phase2 = parseCsv(path.join(DATA, 'finance_posting_checklist_2025_phase2.csv'));
  const cfg = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));

  const paymentDocs = new Set();
  const targetDocs = new Set();
  const batches = new Set();
  const journalByAmount = new Map();

  for (const e of edges) {
    paymentDocs.add(normDoc(e.payment_doc));
    targetDocs.add(normDoc(e.target_doc));
    batches.add(e.batch_id);
  }
  for (const b of bridges) {
    paymentDocs.add(normDoc(b.erp_payment_doc));
    batches.add(b.batch_id);
    if (b.proforma_journal) {
      journalByAmount.set(String(Math.abs(Number(b.proforma_journal))), b.batch_id);
    }
  }
  for (const p of phase2) {
    if (p.erp_receipt) paymentDocs.add(normDoc(p.erp_receipt));
    if (p.batch_id) batches.add(p.batch_id);
    if (p.journal_amount && Number(p.journal_amount) !== 0) {
      journalByAmount.set(String(Math.abs(Number(p.journal_amount))), p.batch_id);
    }
  }

  const overrides = new Set((cfg.closedInvoiceOverrides || []).map((o) => normDoc(o.doc)));

  return { paymentDocs, targetDocs, batches, journalByAmount, overrides, edgeCount: edges.length, batchCount: batches.size };
}

function classify(t, idx) {
  if (t.entry === 'Payment') {
    if (idx.paymentDocs.has(t.docno)) return { linked: true, link: 'Layer 1 — payment doc in remittance batch' };
    return {
      linked: false,
      category: 'payment_orphan',
      note: 'Payment doc not referenced in allocation_edges, bridge, or phase2 checklist',
    };
  }
  if (t.entry === 'Invoice') {
    if (idx.targetDocs.has(t.docno)) return { linked: true, link: 'Layer 2 — remittance edge target' };
    if (idx.overrides.has(t.docno)) return { linked: true, link: 'closedInvoiceOverrides (remittance-backed, not edge target_doc)' };
    return {
      linked: false,
      category: 'invoice_not_in_edges',
      note: 'Invoice not in allocation_edges — may be CN-paired empty-return, open, or settled without edge row',
    };
  }
  if (t.entry === 'Crd Note') {
    if (idx.targetDocs.has(t.invno)) return { linked: true, link: 'Layer 2 — CN on remittance target invno' };
    if (idx.overrides.has(t.invno)) return { linked: true, link: 'CN on override-closed invoice' };
    return {
      linked: false,
      category: 'cn_not_in_edges',
      note: 'CN invno not in remittance edges — typically empty-return / deposit pairing',
    };
  }
  if (t.entry === 'Journal') {
    if (/DISCOUNT ALLOWED/i.test(t.ref)) {
      const batch = idx.journalByAmount.get(String(Math.abs(t.amount)));
      if (batch) return { linked: true, link: `Layer 3 — Path B journal (${batch})` };
      return {
        linked: false,
        category: 'discount_journal_unmapped',
        note: 'DISCOUNT ALLOWED amount not in bridge/checklist batch table',
      };
    }
    if (/PAYMENT REDUCTION|PAYMENT CORRECTION|CORRECTION/i.test(t.ref)) {
      return {
        linked: false,
        category: 'pathb_payment_correction',
        note: '2025 Path B gross→cash correction pair — not a remittance batch section',
      };
    }
    return { linked: false, category: 'journal_other', note: t.ref.slice(0, 80) };
  }
  if (t.entry === 'Bank UD') {
    return {
      linked: false,
      category: 'bank_ud',
      note: 'Bank UD reversal row — deposit screen artefact, outside remittance batch model',
    };
  }
  return { linked: false, category: 'other', note: t.entry };
}

const txns = loadTxns();
const idx = buildLayerIndex();
const results = txns.map((t) => ({ ...t, ...classify(t, idx) }));
const unlinked = results.filter((r) => !r.linked);

const byCat = {};
for (const u of unlinked) {
  if (!byCat[u.category]) byCat[u.category] = [];
  byCat[u.category].push(u);
}

function tableRows(rows) {
  return rows
    .sort((a, b) => a.iso.localeCompare(b.iso) || a.docno.localeCompare(b.docno))
    .map(
      (u) =>
        `| ${u.date} | ${u.entry} | ${u.docno} | ${u.invno || '—'} | ${fmtR(u.amount)} | ${u.ref.replace(/\|/g, '/').slice(0, 55)} | ${u.note} |`,
    );
}

const md = [];
md.push('# TWK002 — ledger rows not in Reconciliation Layers');
md.push('');
md.push('**Compare:** `TWK002_Full_History_Ledger.md` (301 rows) vs `TWK002_Reconciliation_Layers.md` (21 remittance batches)');
md.push('');
md.push('| Metric | Value | Tag |');
md.push('| :--- | ---: | :--- |');
md.push(`| Full-history rows | ${txns.length} | PROVEN |`);
md.push(`| Linked to a layer | ${results.filter((r) => r.linked).length} | PROVEN |`);
md.push(`| **Not in layers** | **${unlinked.length}** | PROVEN |`);
md.push(`| Remittance batches in layers | ${idx.batchCount} | PROVEN |`);
md.push(`| Allocation edges | ${idx.edgeCount} | PROVEN |`);
md.push('');
md.push('**What “linked” means:** row appears as Layer 1 payment doc, Layer 2 edge target/override, or Layer 3 Path B journal amount in `allocation_edges.csv` / payment bridge / phase2 checklist.');
md.push('');
md.push('---');
md.push('');

const sections = [
  ['payment_orphan', 'Payments — no remittance batch', 'These payment docs are in the ledger but not referenced by any batch in Reconciliation Layers.'],
  ['invoice_not_in_edges', 'Invoices — not remittance edge targets', 'Not in `allocation_edges.csv` target_doc. Includes current open invoices (52484, 52803) if edges use different doc keys, CN-paired empties, and historical rows settled without an ingested edge.'],
  ['cn_not_in_edges', 'Credit notes — not on remittance targets', 'Mostly empty-return / deposit CN pairing — not modelled as remittance invoice slices.'],
  ['pathb_payment_correction', 'Path B payment correction journals', '2025 catch-up gross→cash pairs (00000494–496). Layer 3 for 2024 batches uses bridge; these are separate ERP posting fixes.'],
  ['discount_journal_unmapped', 'Discount journals — amount not in batch table', 'DISCOUNT ALLOWED posted but amount not matched to bridge/checklist.'],
  ['bank_ud', 'Bank UD', 'Deposit-screen reversal — outside remittance model.'],
  ['journal_other', 'Other journals', 'Non-discount, non-correction journals.'],
];

for (const [cat, title, desc] of sections) {
  const rows = byCat[cat] || [];
  if (!rows.length) continue;
  md.push(`## ${title} (${rows.length})`);
  md.push('');
  md.push(desc);
  md.push('');
  md.push('| Date | Entry | Doc | Inv | Amount | Reference | Note |');
  md.push('| :--- | :--- | :--- | :--- | ---: | :--- | :--- |');
  md.push(...tableRows(rows));
  md.push('');
}

md.push('## Interpretation');
md.push('');
md.push('| Category | Action |');
md.push('| :--- | :--- |');
md.push('| **payment_orphan** (37732 / STAT:105) | Add to remittance ingest or document as non-remittance transfer |');
md.push('| **invoice_not_in_edges** | Many are **expected** — empty-return pairs, open invoices, or settled before edge ingest. Cross-check open list vs overrides. |');
md.push('| **cn_not_in_edges** | Expected for CYL/empty CN activity — not remittance LPG slices |');
md.push('| **pathb_payment_correction** | Already in ERP fix plan as 2025 catch-up — extend layers report if needed |');
md.push('| **discount_journal_unmapped** | Match to batch or flag as orphan Path B post |');
md.push('');
md.push('Regenerate: `node analysis/debtors/TWK002/scripts/list_ledger_layers_gap.mjs --write`');
md.push('');

console.log(`Linked: ${results.filter((r) => r.linked).length} / ${txns.length}`);
console.log(`Unlinked: ${unlinked.length}`);
for (const [cat, rows] of Object.entries(byCat)) console.log(`  ${cat}: ${rows.length}`);

if (write) {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, md.join('\n'));
  console.log(`Wrote ${path.relative(ROOT, OUT)}`);
}
