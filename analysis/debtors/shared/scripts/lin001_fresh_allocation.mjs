#!/usr/bin/env node
/**
 * One-off fresh allocation pass for LIN001 (Slindokuhle Enterprises).
 *
 * Operator rules (2026-09-04):
 * - Scope: 2025-03-01 → 2026-02-28
 * - Source: Supabase transaction_headers (ignore header tags / overrides)
 * - Invoice amounts: header total (LPG + CYL)
 * - Credit notes: ref_no → invoice; else DN# / order_no text match
 * - Payments: ignore ERP ref_no; consolidate by payment doc; amount-only match
 * - Best-effort output CSV
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { pgClientOptions } from './require_database_url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

function loadDotEnv() {
  if (process.env.DATABASE_URL) return;
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnv();

const ACCOUNT = 'LIN001';
const FROM = '2025-03-01';
const TO = '2026-02-28';
const OUT = path.join(ROOT, 'analysis/debtors/shared/reports/LIN001_fresh_allocation_2025-03_2026-02.csv');

const TOL_EXACT = 1.0;
const TOL_LAG = 5.0;
const TOL_PAIR = 1.0;

const cleanDoc = (d) => String(d ?? '').replace(/^0+/, '') || '0';
const fmtD = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? '').slice(0, 10));
const round2 = (n) => Math.round(Number(n) * 100) / 100;
const csvEsc = (v) => {
  const s = String(v ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
};

function extractDnTokens(...parts) {
  const tokens = new Set();
  const re = /\bDN\s*#?\s*(\d+)|\bD\s*\/\s*N\s*(\d+)/gi;
  for (const part of parts) {
    const text = String(part ?? '');
    let m;
    while ((m = re.exec(text)) !== null) {
      tokens.add(m[1] || m[2]);
    }
  }
  return [...tokens];
}

function extractOrderToken(orderNo) {
  const o = cleanDoc(orderNo);
  return o === '0' ? '' : o;
}

async function fetchDedupedHeaders(client) {
  const { rows: raw } = await client.query(
    `
    SELECT id, entry_type, doc_no, ref_no, description, order_no, batch_ref, tx_date,
           (amount_excl + tax_amount) AS amount_incl
    FROM transaction_headers
    WHERE account_no = $1
      AND tx_date >= $2::date
      AND tx_date <= $3::date
      AND entry_type IN ('Invoice', 'Crd Note', 'Payment', 'Journal')
    ORDER BY id DESC
    `,
    [ACCOUNT, FROM, TO],
  );

  const seen = new Set();
  const deduped = [];
  for (const row of raw) {
    const key = [
      row.entry_type,
      row.doc_no,
      row.ref_no ?? '',
      fmtD(row.tx_date),
      round2(row.amount_incl),
    ].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }

  const headerSeen = new Set();
  const headers = [];
  const payments = [];
  for (const row of deduped) {
    if (row.entry_type === 'Payment') {
      payments.push(row);
      continue;
    }
    const hkey = `${row.entry_type}|${row.doc_no}`;
    if (headerSeen.has(hkey)) continue;
    headerSeen.add(hkey);
    headers.push(row);
  }

  return { headers, payments };
}

function buildInvoices(headerRows) {
  return headerRows
    .filter((r) => r.entry_type === 'Invoice')
    .map((r) => ({
      docNo: cleanDoc(r.doc_no),
      date: new Date(r.tx_date),
      dateStr: fmtD(r.tx_date),
      amount: round2(Math.abs(r.amount_incl)),
      description: String(r.description ?? ''),
      orderNo: extractOrderToken(r.order_no),
      dnTokens: extractDnTokens(r.description, r.order_no),
    }))
    .sort((a, b) => a.date - b.date || a.docNo.localeCompare(b.docNo));
}

function buildCreditNotes(headerRows, invoices) {
  const invByDoc = new Map(invoices.map((i) => [i.docNo, i]));
  const invByDn = new Map();
  const invByOrder = new Map();
  for (const inv of invoices) {
    for (const dn of inv.dnTokens) {
      if (!invByDn.has(dn)) invByDn.set(dn, inv);
    }
    if (inv.orderNo) invByOrder.set(inv.orderNo, inv);
  }

  const edges = [];
  const unmatched = [];

  for (const r of headerRows.filter((x) => x.entry_type === 'Crd Note')) {
    const cn = {
      docNo: cleanDoc(r.doc_no),
      date: new Date(r.tx_date),
      dateStr: fmtD(r.tx_date),
      amount: round2(Math.abs(r.amount_incl)),
      refNo: cleanDoc(r.ref_no),
      description: String(r.description ?? ''),
      orderNo: extractOrderToken(r.order_no),
      dnTokens: extractDnTokens(r.description, r.order_no),
    };

    let target = null;
    let method = '';

    const refRaw = String(r.ref_no ?? '').trim();
    const ref = cleanDoc(refRaw);
    if (refRaw && ref !== '0' && !['Alloc', 'Recon', ''].includes(refRaw)) {
      target = invByDoc.get(ref) ?? null;
      if (target) method = 'CN_REFNO';
    }

    if (!target) {
      for (const dn of cn.dnTokens) {
        if (invByDn.has(dn)) {
          target = invByDn.get(dn);
          method = 'CN_DN_TEXT';
          break;
        }
      }
    }

    if (!target && cn.orderNo && invByOrder.has(cn.orderNo)) {
      target = invByOrder.get(cn.orderNo);
      method = 'CN_ORDER_NO';
    }

    if (target) {
      edges.push({
        edge_type: 'credit_note_to_invoice',
        source_doc: cn.docNo,
        source_date: cn.dateStr,
        source_amount: cn.amount,
        target_doc: target.docNo,
        target_date: target.dateStr,
        target_amount: target.amount,
        match_method: method,
        confidence: 'PROBABLE',
        residual: round2(target.amount - cn.amount),
        notes: '',
      });
    } else {
      unmatched.push(cn);
      edges.push({
        edge_type: 'credit_note_unmatched',
        source_doc: cn.docNo,
        source_date: cn.dateStr,
        source_amount: cn.amount,
        target_doc: '',
        target_date: '',
        target_amount: '',
        match_method: 'CN_NO_MATCH',
        confidence: 'UNVERIFIED',
        residual: cn.amount,
        notes: `ref_no=${cn.refNo || 'blank'} desc=${cn.description}`,
      });
    }
  }

  return { edges, unmatched };
}

function buildPayments(paymentRows) {
  const groups = new Map();
  for (const r of paymentRows) {
    const key = `${cleanDoc(r.doc_no)}|${fmtD(r.tx_date)}`;
    const g = groups.get(key) ?? {
      docNo: cleanDoc(r.doc_no),
      date: new Date(r.tx_date),
      dateStr: fmtD(r.tx_date),
      net: 0,
      batchRef: String(r.batch_ref ?? r.description ?? '').trim(),
    };
    g.net = round2(g.net + Number(r.amount_incl));
    if (!g.batchRef && r.batch_ref) g.batchRef = String(r.batch_ref).trim();
    groups.set(key, g);
  }

  return [...groups.values()]
    .map((g) => ({
      ...g,
      amount: round2(Math.abs(g.net)),
      signedNet: g.net,
    }))
    .filter((p) => p.amount > 0.009)
    .sort((a, b) => a.date - b.date || a.docNo.localeCompare(b.docNo));
}

function applyCnToOpen(invoices, cnEdges) {
  const open = Object.fromEntries(invoices.map((i) => [i.docNo, i.amount]));
  for (const e of cnEdges) {
    if (e.edge_type !== 'credit_note_to_invoice') continue;
    const doc = e.target_doc;
    if (open[doc] != null) open[doc] = round2(Math.max(0, open[doc] - e.source_amount));
  }
  return open;
}

function allocatePayments(invoices, payments, openStart) {
  const open = { ...openStart };
  const edges = [];
  const unpaid = () =>
    invoices
      .filter((i) => (open[i.docNo] ?? 0) > 0.05)
      .sort((a, b) => a.date - b.date || a.docNo.localeCompare(b.docNo));

  const pushEdge = (p, targetDoc, targetDate, allocated, method, confidence, notes = '') => {
    edges.push({
      edge_type: 'payment_to_invoice',
      source_doc: p.docNo,
      source_date: p.dateStr,
      source_amount: p.amount,
      target_doc: targetDoc,
      target_date: targetDate,
      target_amount: allocated,
      match_method: method,
      confidence,
      residual: round2(p.amount - allocated),
      notes,
    });
  };

  for (const p of payments) {
    const candidates = unpaid().filter((i) => i.date <= p.date);
    let remaining = p.amount;
    let matchedAny = false;

    const trySingle = (pool, maxLag, tol, method, confidence) => {
      for (const cand of pool) {
        const openAmt = open[cand.docNo];
        if (openAmt <= 0.05) continue;
        const lag = (p.date - cand.date) / 86400000;
        if (lag < 0 || lag > maxLag) continue;
        if (Math.abs(remaining - openAmt) <= tol) {
          pushEdge(p, cand.docNo, cand.dateStr, remaining, method, confidence);
          open[cand.docNo] = 0;
          remaining = 0;
          matchedAny = true;
          return true;
        }
      }
      return false;
    };

    const tryPair = (pool, maxLag, tol, method, confidence) => {
      for (let i = 0; i < pool.length; i++) {
        for (let j = i + 1; j < pool.length; j++) {
          const a = pool[i];
          const b = pool[j];
          const openA = open[a.docNo];
          const openB = open[b.docNo];
          if (openA <= 0.05 || openB <= 0.05) continue;
          const lagA = (p.date - a.date) / 86400000;
          const lagB = (p.date - b.date) / 86400000;
          if (lagA < 0 || lagB < 0 || lagA > maxLag || lagB > maxLag) continue;
          const sum = round2(openA + openB);
          if (Math.abs(remaining - sum) <= tol) {
            pushEdge(
              p,
              `${a.docNo} & ${b.docNo}`,
              `${a.dateStr} / ${b.dateStr}`,
              remaining,
              method,
              confidence,
            );
            open[a.docNo] = 0;
            open[b.docNo] = 0;
            remaining = 0;
            matchedAny = true;
            return true;
          }
        }
      }
      return false;
    };

    if (trySingle(candidates, 90, TOL_EXACT, 'PMT_EXACT_SINGLE', 'PROBABLE')) continue;
    if (trySingle(candidates, 15, TOL_LAG, 'PMT_LAG_SINGLE', 'PROBABLE')) continue;
    if (tryPair(candidates, 15, TOL_PAIR, 'PMT_LAG_PAIR', 'PROBABLE')) continue;
    if (trySingle(candidates, 90, TOL_LAG, 'PMT_EXPANDED_SINGLE', 'ASSUMED')) continue;
    if (tryPair(candidates, 90, TOL_PAIR, 'PMT_EXPANDED_PAIR', 'ASSUMED')) continue;

    // Best-effort partial: oldest open invoice
    for (const cand of candidates) {
      const openAmt = open[cand.docNo];
      if (openAmt <= 0.05) continue;
      const alloc = round2(Math.min(remaining, openAmt));
      if (alloc > 0.05) {
        pushEdge(p, cand.docNo, cand.dateStr, alloc, 'PMT_PARTIAL_FIFO', 'ASSUMED', 'partial best-effort');
        open[cand.docNo] = round2(openAmt - alloc);
        remaining = round2(remaining - alloc);
        matchedAny = true;
        if (remaining <= 0.05) break;
      }
    }

    if (remaining > 0.05) {
      edges.push({
        edge_type: matchedAny ? 'payment_residual' : 'payment_unallocated',
        source_doc: p.docNo,
        source_date: p.dateStr,
        source_amount: p.amount,
        target_doc: '',
        target_date: '',
        target_amount: matchedAny ? round2(p.amount - remaining) : 0,
        match_method: matchedAny ? 'PMT_PARTIAL_RESIDUAL' : 'PMT_NO_MATCH',
        confidence: 'UNVERIFIED',
        residual: remaining,
        notes: p.batchRef || '',
      });
    }
  }

  return edges;
}

function writeCsv(outPath, rows) {
  const header = [
    'edge_type',
    'source_doc',
    'source_date',
    'source_amount',
    'target_doc',
    'target_date',
    'target_amount',
    'match_method',
    'confidence',
    'residual',
    'notes',
  ];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(header.map((h) => csvEsc(r[h])).join(','));
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${lines.join('\n')}\n`);
}

const client = new pg.Client(pgClientOptions());
await client.connect();

const { headers: headerRows, payments: paymentRows } = await fetchDedupedHeaders(client);
await client.end();

const invoices = buildInvoices(headerRows);
const payments = buildPayments(paymentRows);
const { edges: cnEdges } = buildCreditNotes(headerRows, invoices);
const openAfterCn = applyCnToOpen(invoices, cnEdges);
const pmtEdges = allocatePayments(invoices, payments, openAfterCn);

const allEdges = [...cnEdges, ...pmtEdges];

const summary = {
  account: ACCOUNT,
  period: `${FROM} → ${TO}`,
  source: 'Supabase transaction_headers',
  invoices: invoices.length,
  credit_notes: cnEdges.filter((e) => e.edge_type === 'credit_note_to_invoice').length,
  credit_notes_unmatched: cnEdges.filter((e) => e.edge_type === 'credit_note_unmatched').length,
  payments: payments.length,
  payment_edges: pmtEdges.filter((e) => e.edge_type === 'payment_to_invoice').length,
  payment_unallocated: pmtEdges.filter((e) => e.edge_type === 'payment_unallocated').length,
  payment_residual: pmtEdges.filter((e) => e.edge_type === 'payment_residual').length,
};

writeCsv(OUT, allEdges);

console.log(JSON.stringify(summary, null, 2));
console.log('Written:', OUT);
