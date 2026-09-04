#!/usr/bin/env node
/**
 * LIN001 delivery event register — groups invoice + CN by DN# from Supabase.
 * Operator model: event = invoice + credit note + delivery note (proof) + payment.
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
const FROM = process.argv[2] ?? '2026-03-01';
const TO = process.argv[3] ?? '2026-09-30';
const OUT = path.join(
  ROOT,
  'analysis/debtors/shared/reports',
  `LIN001_event_register_${FROM.slice(0, 7)}_${TO.slice(0, 7)}.csv`,
);

const cleanDoc = (d) => String(d ?? '').replace(/^0+/, '') || '0';
const fmtD = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? '').slice(0, 10));
const round2 = (n) => Math.round(Number(n) * 100) / 100;
const csvEsc = (v) => {
  const s = String(v ?? '');
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
};

function extractDn(description) {
  const m = String(description ?? '').match(/\bDN\s*#?\s*(\d+)/i);
  return m ? m[1] : '';
}

async function main() {
  const client = new pg.Client(pgClientOptions());
  await client.connect();

  const { rows } = await client.query(
    `
    SELECT entry_type, doc_no, ref_no, description, order_no, batch_ref, tx_date,
           (amount_excl + tax_amount) AS amount_incl
    FROM transaction_headers
    WHERE account_no = $1
      AND tx_date >= $2::date
      AND tx_date <= $3::date
      AND entry_type IN ('Invoice', 'Crd Note', 'Payment')
    ORDER BY tx_date, entry_type, doc_no
    `,
    [ACCOUNT, FROM, TO],
  );

  await client.end();

  const seen = new Set();
  const deduped = [];
  for (const row of rows) {
    const key = [row.entry_type, row.doc_no, row.ref_no ?? '', fmtD(row.tx_date), round2(row.amount_incl)].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }

  const events = new Map();
  const payments = [];

  for (const row of deduped) {
    if (row.entry_type === 'Payment') {
      payments.push({
        docNo: cleanDoc(row.doc_no),
        date: fmtD(row.tx_date),
        amount: round2(Math.abs(row.amount_incl)),
        batch: String(row.batch_ref ?? ''),
        description: String(row.description ?? ''),
      });
      continue;
    }

    const dn = extractDn(row.description);
    if (!dn && row.entry_type === 'Crd Note') continue;

    const key = dn || `NO_DN_${cleanDoc(row.doc_no)}`;
    if (!events.has(key)) {
      events.set(key, { dn: dn || '', invoice: null, creditNote: null, date: fmtD(row.tx_date) });
    }
    const ev = events.get(key);
    if (row.entry_type === 'Invoice') {
      ev.invoice = {
        docNo: cleanDoc(row.doc_no),
        date: fmtD(row.tx_date),
        amount: round2(Math.abs(row.amount_incl)),
      };
      ev.date = ev.date || fmtD(row.tx_date);
    }
    if (row.entry_type === 'Crd Note') {
      ev.creditNote = {
        docNo: cleanDoc(row.doc_no),
        date: fmtD(row.tx_date),
        amount: round2(Math.abs(row.amount_incl)),
        refNo: cleanDoc(row.ref_no),
      };
    }
  }

  const lines = [
    [
      'event_dn',
      'event_part',
      'doc_ref',
      'doc_date',
      'amount',
      'event_net',
      'source',
      'confidence',
      'notes',
    ].join(','),
  ];

  const sorted = [...events.values()].sort((a, b) => a.date.localeCompare(b.date) || a.dn.localeCompare(b.dn));

  for (const ev of sorted) {
    const invAmt = ev.invoice?.amount ?? 0;
    const cnAmt = ev.creditNote?.amount ?? 0;
    const net = round2(invAmt - cnAmt);
    const dnLabel = ev.dn ? `DN#${ev.dn}` : 'NO_DN';

    if (ev.invoice) {
      lines.push(
        [ev.dn, 'invoice', ev.invoice.docNo, ev.invoice.date, invAmt, net, 'ERP', 'PROVEN', `${dnLabel} invoice`]
          .map(csvEsc)
          .join(','),
      );
    }
    if (ev.creditNote) {
      lines.push(
        [
          ev.dn,
          'credit_note',
          ev.creditNote.docNo,
          ev.creditNote.date,
          cnAmt,
          net,
          'ERP',
          'PROVEN',
          `${dnLabel} CN → ${ev.creditNote.refNo || ev.invoice?.docNo || '?'}`,
        ]
          .map(csvEsc)
          .join(','),
      );
    }
    lines.push([ev.dn, 'delivery_note', dnLabel, ev.date, '', net, 'ERP', 'PROVEN', 'Proof of event'].map(csvEsc).join(','));
    lines.push([ev.dn, 'event_net', '', ev.date, net, net, 'COMPUTED', 'PROVEN', `${dnLabel} net`].map(csvEsc).join(','));
    lines.push([ev.dn, 'payment', '', '', '', net, '', 'UNVERIFIED', 'Payment not auto-matched — manual allocation required'].map(csvEsc).join(','));
  }

  lines.push('');
  lines.push(['# payments_in_scope', 'event_part', 'doc_ref', 'doc_date', 'amount', '', 'batch_ref', '', 'notes'].map(csvEsc).join(','));
  for (const p of payments) {
    lines.push(['POOL', 'payment', p.docNo, p.date, p.amount, '', p.batch, 'PROVEN', p.description].map(csvEsc).join(','));
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, lines.join('\n') + '\n');
  console.log(`Wrote ${sorted.length} events, ${payments.length} payments → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
