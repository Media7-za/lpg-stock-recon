#!/usr/bin/env node
/**
 * Phantom CN nets (+R9,894.01) — v5-style breakdown by underlying batch documents.
 * Run: node analysis/debtors/TWK002/scripts/build_phantom_cn_report.mjs [--write]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { parseDebenqWithRunning, normDoc, fmtAmount, parseCsvLine, displayDate } from '../../shared/scripts/debenq_open_invoices.mjs';
import { pgClientOptions } from '../../shared/scripts/require_database_url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const DATA = path.join(ROOT, 'analysis/debtors/TWK002/data');
const REPORTS = path.join(ROOT, 'analysis/debtors/TWK002/reports');
const write = process.argv.includes('--write') || !process.argv.includes('--dry-run');

const round2 = (n) => Math.round(Number(n) * 100) / 100;
const SKU_COL = { '14.1': '14kg', '19.1': '19kg', '9.1': '9kg', 'D.1': 'D.1', 'S.1': 'S.1' };

const PHANTOM_GROUPS = [
  {
    id: '2023_payment_correction',
    label: '2023 payment correction — journal 00000490',
    posted: '2026-07-12',
    journalDocs: ['490'],
    net: 4019.12,
    invnoRefs: ['22182', '23115', '23836', '24560', '25906', '26681'],
  },
  {
    id: '2025_mar_discount_mirrors',
    label: '2025 Mar discount mirror pairs — journals 00000494–496',
    posted: '2025-03-01',
    journalDocs: ['494', '495', '496'],
    net: 2299.4,
    invnoRefs: ['31558', '32332', '33224'],
  },
  {
    id: '2026_mar_fix_29684',
    label: '2026 Mar FIX — journals 00000492/493 on payment ref 29684',
    posted: '2026-03-01',
    journalDocs: ['492', '493'],
    net: 3575.49,
    invnoRefs: ['29684'],
  },
  {
    id: '2026_aug_hygiene',
    label: '2026 Aug discount hygiene — journals 00000503–506',
    posted: '2026-08-09',
    journalDocs: ['503', '504', '505', '506'],
    net: 0,
    invnoRefs: ['35263', '30419', '33921', '34518'],
  },
];

function loadManifestBatches() {
  const byPayment = new Map();
  for (const year of ['2023', '2024', '2025', '2026']) {
    const p = path.join(DATA, `remittance_manifest_${year}.json`);
    if (!fs.existsSync(p)) continue;
    for (const b of JSON.parse(fs.readFileSync(p, 'utf8')).batches ?? []) {
      if (b.erp_payment_doc) {
        byPayment.set(normDoc(b.erp_payment_doc), { ...b, year });
      }
    }
  }
  return byPayment;
}

function loadRemittanceLines() {
  const byBatch = new Map();
  for (const year of ['2023', '2024', '2025', '2026']) {
    const p = path.join(DATA, `remittance_lines_${year}.csv`);
    if (!fs.existsSync(p)) continue;
    const lines = fs.readFileSync(p, 'utf8').trim().split('\n').slice(1);
    for (const line of lines) {
      const parts = parseCsvLine(line);
      const batchId = parts[0];
      if (!byBatch.has(batchId)) byBatch.set(batchId, []);
      byBatch.get(batchId).push({
        batch_id: batchId,
        line_type: parts[1],
        doc_no: normDoc(parts[2]),
        doc_date: parts[3],
        original_amount: round2(parts[5]),
        discount_amount: round2(parts[6]),
        net_amount: round2(parts[7]),
      });
    }
  }
  return byBatch;
}

function parseDocDate(raw) {
  const s = String(raw ?? '');
  const m = s.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return s;
}

function fmtD(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const txtPath = path.join(ROOT, 'analysis/debtors/TWK002/raw/DEBENQ_TWK002.TXT');
const { rows } = parseDebenqWithRunning(txtPath);
const hasInvoiceRow = new Set(rows.filter((r) => r.entry === 'Invoice').map((r) => normDoc(r.cleanDoc)));

const journalRows = rows.filter(
  (r) =>
    r.entry === 'Journal' &&
    ['490', '492', '493', '494', '495', '496', '503', '504', '505', '506'].includes(normDoc(r.docno)),
);

const batchByPayment = loadManifestBatches();
const linesByBatch = loadRemittanceLines();

const client = new pg.Client(pgClientOptions());
await client.connect();

async function docDetail(docNos) {
  if (!docNos.length) return [];
  const q = `
    WITH deduped AS (
      SELECT DISTINCT ON (LTRIM(doc_no,'0'), entry_type, stock_no, debt_group, line_total, qty)
        tx_date::text AS tx_date,
        LTRIM(doc_no,'0') AS doc_no,
        entry_type,
        stock_no,
        debt_group,
        qty::float AS qty,
        line_total::float AS line_total
      FROM vw_clean_transactions
      WHERE account_no = 'TWK002'
        AND LTRIM(doc_no,'0') = ANY($1::text[])
      ORDER BY LTRIM(doc_no,'0'), entry_type, stock_no, debt_group, line_total, qty, id DESC
    )
    SELECT doc_no, MIN(tx_date) AS tx_date, entry_type,
      ROUND(COALESCE(SUM(line_total) FILTER (WHERE debt_group='LPG'),0)::numeric,2)::float AS lpg,
      ROUND(COALESCE(SUM(line_total) FILTER (WHERE debt_group='CYL'),0)::numeric,2)::float AS cyl,
      ROUND(COALESCE(SUM(line_total),0)::numeric,2)::float AS line_total,
      jsonb_object_agg(stock_no, qty_sum) FILTER (WHERE stock_no IS NOT NULL) AS sku_qty
    FROM (
      SELECT doc_no, tx_date, entry_type, stock_no, debt_group, line_total,
        SUM(qty)::float AS qty_sum
      FROM deduped
      GROUP BY doc_no, tx_date, entry_type, stock_no, debt_group, line_total
    ) x
    GROUP BY doc_no, entry_type
    ORDER BY tx_date, doc_no
  `;
  const { rows: dbRows } = await client.query(q, [docNos]);
  const skuQ = `
    WITH deduped AS (
      SELECT DISTINCT ON (LTRIM(doc_no,'0'), entry_type, stock_no, debt_group, line_total, qty)
        LTRIM(doc_no,'0') AS doc_no, entry_type, stock_no, qty::float AS qty
      FROM vw_clean_transactions
      WHERE account_no = 'TWK002' AND LTRIM(doc_no,'0') = ANY($1::text[])
        AND debt_group = 'CYL'
      ORDER BY LTRIM(doc_no,'0'), entry_type, stock_no, debt_group, line_total, qty, id DESC
    )
    SELECT doc_no, entry_type, stock_no, SUM(qty)::int AS qty
    FROM deduped
    GROUP BY doc_no, entry_type, stock_no
  `;
  const { rows: skuRows } = await client.query(skuQ, [docNos]);
  const skuByDoc = new Map();
  for (const s of skuRows) {
    const k = `${s.doc_no}|${s.entry_type}`;
    if (!skuByDoc.has(k)) skuByDoc.set(k, {});
    skuByDoc.get(k)[s.stock_no] = s.qty;
  }
  return dbRows.map((r) => ({
    ...r,
    sku: skuByDoc.get(`${r.doc_no}|${r.entry_type}`) ?? {},
  }));
}

const md = [];
md.push('# TWK002 — Phantom CN nets breakdown (+R9,894.01)');
md.push('');
md.push('**Bridge line:** Path B phantom journal nets (invno refs without Invoice row in Mar 2025+ export)');
md.push('**Generated:** ' + new Date().toISOString().slice(0, 10));
md.push('**Source:** `DEBENQ_TWK002.TXT` journal rows · remittance batches · DB line detail (`vw_clean_transactions`)');
md.push('');
md.push('> These journals carry an `INVNO` pointing at a **payment receipt number**, not a billable invoice in the current export window. The tables below show the **underlying remittance batch documents** each payment ref settled.');
md.push('');
md.push('---');
md.push('');
md.push('## Summary');
md.push('');
md.push('| Group | Journal(s) | Posted | Net (R) | Phantom invno refs |');
md.push('| :--- | :--- | :--- | ---: | :--- |');
let totalNet = 0;
for (const g of PHANTOM_GROUPS) {
  totalNet = round2(totalNet + g.net);
  md.push(`| ${g.label.split('—')[0].trim()} | ${g.journalDocs.map((d) => '00000' + d.replace(/^0+/, '')).join(', ')} | ${g.posted} | ${g.net.toFixed(2)} | ${g.invnoRefs.join(', ')} |`);
}
md.push(`| **Total phantom CN nets** | | | **${totalNet.toFixed(2)}** | |`);
md.push('');
md.push('Paired untagged journal **00000491** (−R3,329.12) is **not** in this line — it sits in Untagged settlements. Net 2023 correction pair: +R4,019.12 − R3,329.12 = **+R690.00**.');
md.push('');
md.push('---');
md.push('');

for (const group of PHANTOM_GROUPS) {
  md.push(`## ${group.label}`);
  md.push('');
  md.push(`**Posted:** ${group.posted} &nbsp;|&nbsp; **Group net:** R${group.net.toFixed(2)}`);
  md.push('');

  md.push('### Journal postings (ERP export)');
  md.push('');
  md.push('| Date | Journal | INVNO ref | Description | Amount (R) |');
  md.push('| :--- | :--- | :--- | :--- | ---: |');
  const jRows = journalRows.filter((r) => group.journalDocs.includes(normDoc(r.docno)));
  for (const r of jRows) {
    md.push(`| ${displayDate(r.iso)} | ${normDoc(r.docno)} | ${normDoc(r.invno) || '—'} | ${(r.dn || '').replace(/\|/g, '/')} | ${r.amount.toFixed(2)} |`);
  }
  const jSum = round2(jRows.reduce((s, r) => s + r.amount, 0));
  md.push(`| | | | **Net** | **${jSum.toFixed(2)}** |`);
  md.push('');

  for (const payRef of group.invnoRefs) {
    const batch = batchByPayment.get(payRef);
    if (!batch) {
      md.push(`### Payment ref ${payRef} — batch not found in manifests`);
      md.push('');
      continue;
    }
    const batchLines = linesByBatch.get(batch.batch_id) ?? [];
    const docNos = [...new Set(batchLines.map((l) => l.doc_no))];
    const details = await docDetail(docNos);
    const detailByDoc = new Map(details.map((d) => [d.doc_no, d]));

    md.push(`### Payment ref **${payRef}** — ${batch.batch_id} (${batch.erp_stat ?? ''})`);
    md.push('');
    md.push(`Remittance: \`${batch.source_file ?? '—'}\` · paid ${batch.electronic_paid_date ?? '—'} · cash **R${fmtAmount(batch.cash_amount).replace('R', '')}**`);
    md.push('');

    md.push('#### Quantities (Part 2 — cylinder custody, v5 layout)');
    md.push('');
    md.push('| Date | Entry | Doc # | 14kg Qty | 19kg Qty | 9kg Qty | D.1 Qty | S.1 Qty |');
    md.push('| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |');

    for (const line of batchLines.sort((a, b) => parseDocDate(a.doc_date).localeCompare(parseDocDate(b.doc_date)) || a.doc_no.localeCompare(b.doc_no))) {
      const et = /^crd note$/i.test(line.line_type) ? 'Crd Note' : 'Invoice';
      const det = detailByDoc.get(line.doc_no);
      const sku = det?.sku ?? {};
      const fmtQty = (sn) => {
        const q = sku[sn];
        if (q == null || q === 0) return '0';
        return (q > 0 ? '+' : '') + q;
      };
      md.push(
        `| ${fmtD(parseDocDate(line.doc_date))} | ${et} | ${line.doc_no} | ${fmtQty('14.1')} | ${fmtQty('19.1')} | ${fmtQty('9.1')} | ${fmtQty('D.1')} | ${fmtQty('S.1')} |`,
      );
    }
    md.push('');

    md.push('#### Values (Part 1 — financial, v5 layout)');
    md.push('');
    md.push('| Date | Entry | Doc # | LPG (R) | CYL (R) | Line total (R) | Remit net (R) | Discount (R) |');
    md.push('| :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |');

    let sumLpg = 0;
    let sumCyl = 0;
    let sumRemit = 0;
    for (const line of batchLines.sort((a, b) => parseDocDate(a.doc_date).localeCompare(parseDocDate(b.doc_date)) || a.doc_no.localeCompare(b.doc_no))) {
      const et = /^crd note$/i.test(line.line_type) ? 'Crd Note' : 'Invoice';
      const det = detailByDoc.get(line.doc_no);
      const lpg = det?.lpg ?? (et === 'Invoice' && line.net_amount > 0 ? line.original_amount : 0);
      const cyl = det?.cyl ?? 0;
      const total = det?.line_total ?? line.original_amount;
      sumLpg = round2(sumLpg + (lpg || 0));
      sumCyl = round2(sumCyl + (cyl || 0));
      sumRemit = round2(sumRemit + line.net_amount);
      md.push(
        `| ${fmtD(parseDocDate(line.doc_date))} | ${et} | ${line.doc_no} | ${(lpg || 0).toFixed(2)} | ${(cyl || 0).toFixed(2)} | ${total.toFixed(2)} | ${line.net_amount.toFixed(2)} | ${line.discount_amount.toFixed(2)} |`,
      );
    }
    md.push(`| | | **Batch subtotal** | **${sumLpg.toFixed(2)}** | **${sumCyl.toFixed(2)}** | | **${sumRemit.toFixed(2)}** | |`);
    md.push('');
    md.push(`*Payment ${payRef} has **no Invoice row** in the Mar 2025+ DEBENQ export — phantom class. Invoice row in export: ${hasInvoiceRow.has(payRef) ? 'yes' : 'no'}.*`);
    md.push('');
  }
  md.push('---');
  md.push('');
}

md.push('## Related');
md.push('');
md.push('- `TWK002_Balance_Bridge_Line_Investigation_2026-08-11.md`');
md.push('- `data/allocation_edges.csv` (remittance payment→document links)');
md.push('- `TWK002_Statement_Account_v5.md` (full v5 layout reference)');

const outPath = path.join(REPORTS, 'TWK002_Phantom_CN_Nets_Breakdown_2026-08-11.md');
if (write) {
  fs.writeFileSync(outPath, md.join('\n'));
  console.log('Written:', outPath);
} else {
  console.log(md.join('\n'));
}

await client.end();
