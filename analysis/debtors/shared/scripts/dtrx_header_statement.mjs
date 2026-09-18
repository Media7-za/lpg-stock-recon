/**
 * Reconstruct a customer Statement of Account from DTRX transaction_headers
 * (plus optional item lines) when no DEBENQ enquiry TXT exists.
 *
 * Epistemic contract:
 *   ERP DEBENQ `CURRENT BALANCE` is Tier-3 authority for what an account owes.
 *   This module does **not** mint that figure. The reconstructed running total
 *   is ASSERTED — sum of ingested header amounts (excl + tax) in date order.
 *   Do not send the document to a customer until a DEBENQ TXT lands.
 *
 * Credit-note INVNO comes from header `ref_no` (DTRX mapping, dtrx_supabase_schema.md).
 * Open invoices reuse computeOpenInvoices from debenq_open_invoices.mjs.
 */
import fs from 'fs';
import path from 'path';
import {
  round2,
  displayDate,
  fmtAmount,
  normDoc,
  parseCsvLine,
  computeOpenInvoices,
  analyseInvoiceTagCoverage,
  GATE_MEANING,
  isCylRef,
} from './debenq_open_invoices.mjs';

export const SOURCE_KIND = 'dtrx_headers';

const ENTRY_RANK = {
  Invoice: 0,
  Payment: 1,
  'Ud Paymnt': 1,
  'Bank XFer': 1,
  'Bank Dep': 1,
  Journal: 1,
  'Crd Note': 2,
};

export function isoDate(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const s = String(value ?? '').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s)) {
    const [d, m, y] = s.split('/');
    const yyyy = y.length === 2 ? `20${y}` : y;
    return `${yyyy}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return s.slice(0, 10);
}

export function headerGross(h) {
  return round2(Number(h.amount_excl || 0) + Number(h.tax_amount || 0));
}

export function sortHeaderRows(headers) {
  return [...headers].sort((a, b) => {
    const da = isoDate(a.tx_date);
    const db = isoDate(b.tx_date);
    if (da !== db) return da.localeCompare(db);
    const ra = ENTRY_RANK[a.entry_type] ?? 9;
    const rb = ENTRY_RANK[b.entry_type] ?? 9;
    if (ra !== rb) return ra - rb;
    return String(a.doc_no).localeCompare(String(b.doc_no));
  });
}

/**
 * Map DTRX headers to the row shape computeOpenInvoices expects.
 * Invoice INVNO is blank (self-keyed). Crd Note / Payment INVNO = ref_no
 * when it names a different document.
 */
export function headersToStatementRows(headers) {
  const sorted = sortHeaderRows(headers);
  let running = 0;
  const rows = [];
  for (const h of sorted) {
    const amount = headerGross(h);
    running = round2(running + amount);
    const cleanDoc = normDoc(h.doc_no);
    const refDoc = normDoc(h.ref_no);
    const invno =
      h.entry_type === 'Invoice' || !refDoc || refDoc === cleanDoc ? '' : refDoc;
    rows.push({
      docno: String(h.doc_no || ''),
      cleanDoc,
      entry: h.entry_type,
      iso: isoDate(h.tx_date),
      invno,
      dn: String(h.description || '').trim(),
      amount,
      runningBalance: running,
      sourceFile: h.source_file || '',
      period: h.period ?? '',
      fingerprint: h.fingerprint || '',
    });
  }
  return { rows, reconstructedBalance: running };
}

export function openingBalanceForMonth(rows, monthStartIso) {
  const before = rows.filter((r) => r.iso < monthStartIso);
  if (!before.length) return 0;
  return before[before.length - 1].runningBalance;
}

function ageBucket(days) {
  if (days <= 30) return 'current';
  if (days <= 60) return 'd30';
  if (days <= 90) return 'd60';
  if (days <= 120) return 'd90';
  return 'd120';
}

export function ageAsAtForStatement(asAtIso) {
  const monthStart = `${asAtIso.slice(0, 7)}-01`;
  return new Date(new Date(`${monthStart}T12:00:00`).getTime() - 86400000)
    .toISOString()
    .slice(0, 10);
}

export function bucketOpenInvoices(openInvoices, ageAsAtIso) {
  const buckets = { current: 0, d30: 0, d60: 0, d90: 0, d120: 0 };
  const ageAsAt = new Date(`${ageAsAtIso}T12:00:00`);
  let sum = 0;
  for (const inv of openInvoices) {
    const days = Math.floor((ageAsAt - new Date(`${inv.iso}T12:00:00`)) / 86400000);
    buckets[ageBucket(days)] = round2(buckets[ageBucket(days)] + inv.due);
    sum = round2(sum + inv.due);
  }
  return { buckets, sumOpenInvoices: sum };
}

export function itemGross(item) {
  if (item.line_total != null && item.line_total !== '') {
    return round2(Number(item.line_total));
  }
  const qty = Number(item.qty || 0);
  const retail = Number(item.retail_price || 0);
  const tax = Number(item.line_tax || 0);
  const signedTax = qty < 0 && tax > 0 ? -tax : tax;
  return round2(qty * retail + signedTax);
}

export function debtGroupOf(item) {
  const g = String(item.debt_group || item.product_group || item.category || '').toUpperCase();
  if (g === 'CYL' || g === 'CYLINDER') return 'CYL';
  return 'LPG';
}

export function summariseItems(items) {
  const byDoc = new Map();
  let lpgNet = 0;
  let cylNet = 0;
  for (const item of items) {
    const doc = normDoc(item.doc_no);
    const group = debtGroupOf(item);
    const gross = itemGross(item);
    if (group === 'CYL') cylNet = round2(cylNet + gross);
    else lpgNet = round2(lpgNet + gross);
    const rec = byDoc.get(doc) || { doc, groups: { LPG: 0, CYL: 0 }, lines: [] };
    rec.groups[group] = round2(rec.groups[group] + gross);
    rec.lines.push({
      stock_no: item.stock_no,
      group,
      qty: Number(item.qty || 0),
      reference: item.reference || '',
      gross,
    });
    byDoc.set(doc, rec);
  }
  return { byDoc, lpgNet, cylNet, itemCount: items.length };
}

/**
 * Flag Crd Notes whose header INVNO points at an invoice whose item lines
 * are a different debt group (typical: CYL empties CN tagged to an LPG inv).
 */
export function detectTaggingAnomalies(headers, items) {
  const itemSummary = summariseItems(items);
  const invoiceDocs = new Set(
    headers.filter((h) => h.entry_type === 'Invoice').map((h) => normDoc(h.doc_no)),
  );
  const anomalies = [];
  for (const h of headers) {
    if (h.entry_type !== 'Crd Note') continue;
    const cnDoc = normDoc(h.doc_no);
    const target = normDoc(h.ref_no);
    if (!target || !invoiceDocs.has(target)) continue;
    const cnItems = itemSummary.byDoc.get(cnDoc);
    const invItems = itemSummary.byDoc.get(target);
    if (!cnItems || !invItems) continue;
    const cnGroup = cnItems.groups.CYL && !cnItems.groups.LPG ? 'CYL' : cnItems.groups.LPG && !cnItems.groups.CYL ? 'LPG' : 'MIXED';
    const invGroup = invItems.groups.CYL && !invItems.groups.LPG ? 'CYL' : invItems.groups.LPG && !invItems.groups.CYL ? 'LPG' : 'MIXED';
    if (cnGroup !== 'MIXED' && invGroup !== 'MIXED' && cnGroup !== invGroup) {
      anomalies.push({
        cnDoc,
        targetInv: target,
        cnGroup,
        invGroup,
        cnAmount: headerGross(h),
        cnRef: String(h.description || '').trim(),
        basis: `DTRX items: CN ${cnDoc} is ${cnGroup} but header ref_no tags LPG/CYL-mismatched invoice ${target} (${invGroup})`,
      });
    }
  }
  return anomalies;
}

export function parseObjectCsv(absPath) {
  const txt = fs.readFileSync(absPath, 'utf8');
  const lines = txt.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const row = {};
    header.forEach((h, i) => {
      row[h] = cols[i] ?? '';
    });
    return row;
  });
}

export function writeCsv(absPath, columns, rows) {
  const esc = (v) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const body = [columns.join(',')];
  for (const row of rows) {
    body.push(columns.map((c) => esc(row[c])).join(','));
  }
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, `${body.join('\n')}\n`);
}

export function reconstructDebenqTxt({ debtorCode, customerName, rows, reconstructedBalance }) {
  const lines = [
    `"ACCOUNT:","${debtorCode} - ${customerName}"`,
    '"ACCOUNT CURRENCY:","Local"',
    '"DISPLAY CURRENCY:","Local"',
    `"CURRENT BALANCE:","${reconstructedBalance.toFixed(2)}"`,
    '"UD PAY/CHEQUES:","0.00"',
    '"CREDIT CLAIMS:","0.00"',
    '"TOTAL EXCLUDING UD/CLAIMS:","0.00"',
    '"SORT ORDER:","DOCUMENT NUMBER"',
    '"YEAR:","CURRENT"',
    '"INCLUDE:","UD PAYMENTS, UD CHEQUES, CREDIT CLAIMS"',
    '"NOTE:","RECONSTRUCTED FROM DTRX transaction_headers — NOT a DEBENQ enquiry. CURRENT BALANCE is the header-sum running total (ASSERTED)."',
    '',
    '"LINE","PERIOD","DOCNO","ENTRY","DATE","INVNO","CUSTOMER/BANK REF","ORDER","REFERENCE","AMOUNT","BALANCE"',
  ];
  let n = 1;
  lines.push(
    `"${n}","","","","","","BALANCE B/F:","","","0.00","0.00"`,
  );
  n += 1;
  for (const r of rows) {
    const [y, m, d] = r.iso.split('-');
    const date = `${d}/${m}/${y}`;
    const invno = r.invno ? String(r.invno).padStart(8, '0') : '';
    lines.push(
      `"${n}","${r.period}","${r.docno}","${r.entry}","${date}","${invno}","${r.dn}","","${customerName}","${r.amount.toFixed(2)}","${r.runningBalance.toFixed(2)}"`,
    );
    n += 1;
  }
  return `${lines.join('\n')}\n`;
}

function formatZaLong(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatZaMonthYear(iso) {
  return new Date(`${iso.slice(0, 7)}-01T12:00:00`).toLocaleDateString('en-ZA', {
    month: 'long',
    year: 'numeric',
  });
}

export function buildStatementMarkdown({
  cfg,
  asAtIso,
  rows,
  reconstructedBalance,
  openInvoices,
  tagCoverage,
  anomalies,
  itemSummary,
}) {
  const monthStartIso = `${asAtIso.slice(0, 7)}-01`;
  const ageAsAtIso = ageAsAtForStatement(asAtIso);
  const opening = openingBalanceForMonth(rows, monthStartIso);
  const movement = round2(reconstructedBalance - opening);
  const { buckets, sumOpenInvoices } = bucketOpenInvoices(openInvoices, ageAsAtIso);
  const fmt = fmtAmount;
  const asAtLabel = formatZaLong(asAtIso);
  const monthLabel = formatZaMonthYear(asAtIso);
  const ageAsAtLabel = formatZaLong(ageAsAtIso);

  const lines = [];
  lines.push('# Statement of Account', '');
  lines.push(
    '> **INTERNAL DRAFT — DTRX / `transaction_headers` reconstruction.** Not a DEBENQ enquiry. Balance due is **ASSERTED** (sum of ingested header amounts), not **PROVEN** from an ERP `CURRENT BALANCE` header. Do not send to the customer until a DEBENQ TXT lands and this is re-run.',
    '',
  );
  (cfg.businessHeader || []).forEach((h, i) => {
    lines.push(i === 0 ? `**${h}**  ` : `${h}  `);
  });
  lines.push('', '---', '');
  lines.push(`**To:** ${cfg.customerName}  `);
  lines.push(`**Account:** ${cfg.debtorCode}  `);
  if (cfg.referenceValue) {
    lines.push(`**${cfg.referenceLabel || 'Reference'}:** ${cfg.referenceValue}  `);
  }
  lines.push(`**Statement date:** ${asAtLabel}  `);
  lines.push(`**Source:** DTRX headers (${rows.length} rows) + item lines (${itemSummary.itemCount})`);
  lines.push('', '---', '', '## Account summary', '');
  lines.push('| | Amount (R) | Epistemic |');
  lines.push('| :--- | ---: | :--- |');
  lines.push(`| **Opening balance** (1 ${monthLabel}) | ${fmt(opening)} | ASSERTED — reconstructed running total before ${monthStartIso} |`);
  lines.push(`| Movement this month (invoices, credit notes) | ${fmt(movement)} | ASSERTED |`);
  lines.push(`| ${cfg.debtorCode} reconstructed header total | ${fmt(reconstructedBalance)} | ASSERTED — Σ DTRX header (excl+tax) |`);
  lines.push(`| **Balance due** | **${fmt(reconstructedBalance)}** | ASSERTED — not DEBENQ CURRENT BALANCE |`);
  lines.push('', '---', '', '## Aged balance — open invoices', '');
  lines.push(`Age is calculated from **invoice date** to ${ageAsAtLabel}.`, '');
  lines.push('| Current | 30 day | 60 day | 90 day | 120+ day | **Subtotal** |');
  lines.push('| ---: | ---: | ---: | ---: | ---: | ---: |');
  lines.push(
    `| ${fmt(buckets.current)} | ${fmt(buckets.d30)} | ${fmt(buckets.d60)} | ${fmt(buckets.d90)} | ${fmt(buckets.d120)} | **${fmt(sumOpenInvoices)}** |`,
  );
  lines.push('', '---', '', '## Open invoices', '');
  lines.push('Reconstructed from DTRX header `ref_no` tagging (Crd Note → invoice). Screening hypothesis — see tag gate below.', '');
  lines.push('| Inv | Inv date | DN / ref | **Due (R)** |');
  lines.push('| :--- | :--- | :--- | ---: |');
  for (const inv of openInvoices) {
    const doc = (inv.docno || inv.doc || '').replace(/^0+/, '') || inv.docno;
    lines.push(`| ${doc} | ${displayDate(inv.iso)} | ${inv.dn} | ${fmt(inv.due)} |`);
  }
  if (!openInvoices.length) {
    lines.push('| — | — | — | 0.00 |');
  }

  lines.push('', '---', '', '## Tag coverage', '');
  lines.push('| Field | Value |');
  lines.push('| :--- | :--- |');
  lines.push(`| Gate | **${tagCoverage.gate}** · ${tagCoverage.evidence?.basis || 'PATTERN_ONLY'} |`);
  lines.push(`| Meaning | ${GATE_MEANING[tagCoverage.gate] || tagCoverage.gate} |`);
  lines.push(`| Invariant Σ(open) vs reconstructed total | ${tagCoverage.invariant?.status} (open ${fmt(sumOpenInvoices)} / header ${fmt(reconstructedBalance)}) |`);
  lines.push('');
  lines.push(
    'No remittance advices on this account — remittance-contradiction check did not run. `ALLOWED` here is absence of contradiction against the reconstructed total, not verification.',
  );

  if (anomalies.length) {
    lines.push('', '---', '', '## DTRX item tagging exceptions', '');
    lines.push(
      'Header `ref_no` and item stock group disagree. Totals still tie; the **which-invoice** split may be wrong. Operator review before customer send.',
      '',
    );
    lines.push('| CN | Tagged invoice | CN group | Invoice group | CN amount (R) |');
    lines.push('| :--- | :--- | :--- | :--- | ---: |');
    for (const a of anomalies) {
      lines.push(`| ${a.cnDoc} | ${a.targetInv} | ${a.cnGroup} | ${a.invGroup} | ${fmt(a.cnAmount)} |`);
    }
  }

  lines.push('', '---', '', '## Item sub-ledgers (DTRX lines)', '');
  lines.push('| Lane | Net (R) | Epistemic |');
  lines.push('| :--- | ---: | :--- |');
  lines.push(`| LPG gas | ${fmt(itemSummary.lpgNet)} | ASSERTED — Σ vw/item line_total |`);
  lines.push(`| CYL deposits | ${fmt(itemSummary.cylNet)} | ASSERTED — Σ vw/item line_total |`);
  lines.push(`| **1A + 1B** | **${fmt(round2(itemSummary.lpgNet + itemSummary.cylNet))}** | Must equal reconstructed header total |`);

  const mixed = [...itemSummary.byDoc.values()].filter((d) => d.groups.LPG && d.groups.CYL);
  if (mixed.length) {
    lines.push('', 'Mixed header documents (LPG + CYL on one invoice):', '');
    lines.push('| Doc | LPG (R) | CYL (R) | Header total (R) |');
    lines.push('| :--- | ---: | ---: | ---: |');
    for (const d of mixed) {
      lines.push(`| ${d.doc} | ${fmt(d.groups.LPG)} | ${fmt(d.groups.CYL)} | ${fmt(round2(d.groups.LPG + d.groups.CYL))} |`);
    }
  }

  lines.push('', '---', '', '## Provenance', '');
  lines.push('| Field | Value |');
  lines.push('| :--- | :--- |');
  lines.push(`| Source kind | \`${SOURCE_KIND}\` |`);
  lines.push(`| Headers | \`${cfg.headersCsv}\` |`);
  lines.push(`| Items | \`${cfg.itemsCsv}\` |`);
  lines.push(`| As-at | ${asAtIso} |`);
  lines.push(`| Ageing as-at | ${ageAsAtIso} |`);
  lines.push('| Authority | DTRX headers + items only — DEBENQ TXT **absent** |');
  lines.push('');
  lines.push(
    '*Tripwire:* a DEBENQ / statement TXT for this account reopens the balance. If its `CURRENT BALANCE` ≠ the reconstructed total, this draft is superseded and must not be sent.',
  );
  lines.push('');
  return lines.join('\n');
}

export function buildLedgerMarkdown({
  cfg,
  asAtIso,
  rows,
  reconstructedBalance,
  openInvoices,
  anomalies,
  itemSummary,
  headers,
}) {
  const lines = [];
  lines.push(`# ${cfg.debtorCode} — DTRX header ledger`);
  lines.push('');
  lines.push(`**Account:** ${cfg.debtorCode} · **Name:** ${cfg.customerName}  `);
  lines.push(`**As-at:** ${asAtIso}  `);
  lines.push(`**Source:** \`transaction_headers\` + \`transaction_items\` (DTRX ingest) — **ASSERTED**`);
  lines.push('');
  lines.push('## Running reconstruction');
  lines.push('');
  lines.push('| Date | Type | Doc | INVNO tag | DN / ref | Amount (R) | Balance (R) | Source file |');
  lines.push('| :--- | :--- | :--- | :--- | :--- | ---: | ---: | :--- |');
  for (const r of rows) {
    const doc = (r.docno || '').replace(/^0+/, '') || r.docno;
    const inv = r.invno ? r.invno.replace(/^0+/, '') : '—';
    lines.push(
      `| ${displayDate(r.iso)} | ${r.entry} | ${doc} | ${inv} | ${r.dn} | ${fmtAmount(r.amount)} | ${fmtAmount(r.runningBalance)} | \`${r.sourceFile}\` |`,
    );
  }
  lines.push('');
  lines.push(`**Closing reconstructed total:** R${fmtAmount(reconstructedBalance)} **ASSERTED**`);
  lines.push('');
  lines.push('## Open invoices (header tagging)');
  lines.push('');
  lines.push('| Inv | Date | DN | Due (R) | Item split |');
  lines.push('| :--- | :--- | :--- | ---: | :--- |');
  for (const inv of openInvoices) {
    const doc = (inv.docno || inv.doc || '').replace(/^0+/, '');
    const split = itemSummary.byDoc.get(normDoc(doc));
    const splitTxt = split
      ? `LPG ${fmtAmount(split.groups.LPG)} · CYL ${fmtAmount(split.groups.CYL)}`
      : 'no item lines';
    lines.push(`| ${doc} | ${displayDate(inv.iso)} | ${inv.dn} | ${fmtAmount(inv.due)} | ${splitTxt} |`);
  }
  lines.push('');
  if (anomalies.length) {
    lines.push('## Tagging anomalies');
    lines.push('');
    for (const a of anomalies) {
      lines.push(
        `- CN **${a.cnDoc}** (${a.cnGroup}, R${fmtAmount(a.cnAmount)}, \`${a.cnRef}\`) is tagged to invoice **${a.targetInv}** (${a.invGroup}). ${a.basis}.`,
      );
    }
    lines.push('');
    lines.push(
      'Financial total is unchanged if the CN is re-attributed; the open-invoice *split* changes. Do not ratify a re-tag without operator decision.',
    );
    lines.push('');
  }
  lines.push('## Header inventory');
  lines.push('');
  lines.push(`| Count | ${headers.length} |`);
  lines.push(`| First tx | ${rows[0]?.iso ?? '—'} |`);
  lines.push(`| Last tx | ${rows[rows.length - 1]?.iso ?? '—'} |`);
  lines.push(`| Payments | ${headers.filter((h) => /pay|bank|journal/i.test(h.entry_type)).length} |`);
  lines.push('');
  lines.push(
    '*Not DEBENQ.* Cylinder custody qty in Part 2 is **not** signed off from this reconstruction (D19 ingest gate remains blocked until a statement TXT exists).',
  );
  lines.push('');
  return lines.join('\n');
}

export function generateFromEvidence({ headers, items, cfg, asAtIso }) {
  const { rows, reconstructedBalance } = headersToStatementRows(headers);
  const openInvoices = computeOpenInvoices(rows, cfg.closedInvoiceOverrides || []);
  const tagCoverage = analyseInvoiceTagCoverage({
    rows,
    openInvoices,
    headerBalance: reconstructedBalance,
    balanceBf: 0,
    excludesAllocationDetail: false,
    closedOverrides: cfg.closedInvoiceOverrides || [],
    remittanceDocs: new Map(),
  });
  const itemSummary = summariseItems(items);
  const anomalies = detectTaggingAnomalies(headers, items);
  const statementMd = buildStatementMarkdown({
    cfg,
    asAtIso,
    rows,
    reconstructedBalance,
    openInvoices,
    tagCoverage,
    anomalies,
    itemSummary,
  });
  const ledgerMd = buildLedgerMarkdown({
    cfg,
    asAtIso,
    rows,
    reconstructedBalance,
    openInvoices,
    anomalies,
    itemSummary,
    headers,
  });
  const reconstructedTxt = reconstructDebenqTxt({
    debtorCode: cfg.debtorCode,
    customerName: cfg.customerName,
    rows,
    reconstructedBalance,
  });
  const itemTie = round2(itemSummary.lpgNet + itemSummary.cylNet);
  return {
    rows,
    reconstructedBalance,
    openInvoices,
    tagCoverage,
    anomalies,
    itemSummary,
    itemTie,
    itemHeaderVariance: round2(reconstructedBalance - itemTie),
    statementMd,
    ledgerMd,
    reconstructedTxt,
  };
}

export function emptyCylDocs(openInvoices) {
  return openInvoices.filter((inv) => isCylRef(inv.dn));
}
