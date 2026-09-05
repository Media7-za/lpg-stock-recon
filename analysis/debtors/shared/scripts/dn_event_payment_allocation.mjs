#!/usr/bin/env node
/**
 * DN#-Event Payment Allocation Engine (LIN001 archetype).
 *
 * Different algorithm from payment_doc_allocation.mjs (the WO0001 archetype) -
 * do NOT use these interchangeably. Use this one when an account:
 *   - has no usable Payment.ref_no (payment_doc_allocation.mjs still uses
 *     ref_no on Credit Notes, which is fine either way, but its payment
 *     matching assumes LPG-only invoice targets)
 *   - settles on the HEADER-COMBINED net (invoice + CN, LPG and CYL
 *     together), not the LPG-only lane - confirmed for LIN001 by precise
 *     re-rate verification in an interactive session (invoice 49115: the
 *     matching payment tied to the combined header net, not the LPG-only
 *     total, which is a materially different number)
 *   - has delivery events that span MULTIPLE invoice/CN documents sharing
 *     one DN# label, including same-week reversal-and-reissue chains
 *     (invoice raised, fully reversed by a CN + reversing invoice pair,
 *     then cleanly reissued) - payment_doc_allocation.mjs treats every
 *     invoice as independent and has no such netting
 *
 * If an account fits the WO0001 archetype instead (ref_no-linked CNs,
 * LPG-only match target, no DN#-grouped multi-doc events), use
 * payment_doc_allocation.mjs, not this script.
 *
 * Method:
 *   1. Pull Invoice/Crd Note/Payment headers, deduped past overlapping bulk
 *      exports (excludes a caller-specified superseded source_file, plus a
 *      generic exact-duplicate pass on any remaining (doc_no, entry_type,
 *      tx_date, gross) collisions, keeping the most-recently-created row).
 *   2. Group Invoice/Crd Note rows into events by DN# parsed from
 *      `description` (handles "DN#21147", "D/N 10848", "DN- 21627", etc.).
 *      Rows that reference another doc instead of carrying a DN# of their
 *      own (e.g. "REVERSE INV 45169", "REV CRD NOTE#14430") are resolved to
 *      whichever DN# group the referenced doc landed in - this is what
 *      correctly folds reversal-and-reissue chains into one event net
 *      instead of leaving reversal legs stranded as "unlabeled."
 *   3. Consolidate Payment rows by (doc_no, tx_date, batch_ref) per
 *      SKILL_Payment_To_Invoice_Allocation.md Sec 4.5 (Payment Consolidation
 *      Rule - ERP payment rows are clerical decomposition, not allocation
 *      facts). Keep both the doc-level net AND each individual row amount,
 *      since real matches in this account showed up at both granularities
 *      (some payment docs contain an exact-cent line for one specific event
 *      buried among several other lines for different events).
 *   4. Match every non-zero-net event against every payment doc's net AND
 *      every individual row within it, at EXACT (<=2c) or TIGHT (<=R1)
 *      tolerance. Zero/near-zero-net events (fully-offsetting CN pairs) are
 *      reported separately - they spuriously "match" almost anything and
 *      have no real payment obligation.
 *
 * Output is candidates ONLY - per the doctrine, nothing here clears past
 * Probable/Exception confidence without ref_no or remittance evidence.
 * Review before promoting any row into allocation_edges.csv.
 *
 * Validated in an interactive session against LIN001's full 2023-2026
 * history: every match derived by hand during that session reproduced
 * exactly under this algorithm, plus ~30 additional exact/tight matches
 * surfaced from 2023-2024 data nobody had manually checked.
 *
 * Usage:
 *   node analysis/debtors/shared/scripts/dn_event_payment_allocation.mjs \
 *     --debtor LIN001 [--exclude-source-file DTRX2603.TXT]
 *
 * Requires DATABASE_URL.
 * Output: analysis/debtors/[DEBTOR]/data/dn_event_payment_allocation_candidates.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { pgClientOptions } from './require_database_url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 && args[i + 1] ? args[i + 1] : null;
  };
  const debtor = get('--debtor');
  if (!debtor) {
    console.error('Usage: dn_event_payment_allocation.mjs --debtor CODE [--exclude-source-file NAME]');
    process.exit(1);
  }
  return {
    debtorCode: debtor.toUpperCase(),
    excludeSourceFile: get('--exclude-source-file') || 'DTRX2603.TXT',
  };
}

const cleanDoc = (docNo) => String(docNo ?? '').replace(/^0+/, '') || '0';
const round2 = (n) => Math.round(n * 100) / 100;

// DN# label on the document itself, e.g. "DN#21147", "D/N 10848", "DN- 21627"
const DN_RE = /D[/\-\s]?N[#:\-\s]*\s*0*(\d{3,6})/i;
// Reversal rows reference another DOC by number instead of carrying a DN#,
// e.g. "REVERSE INV 45169" or "REV CRD NOTE#14430" - resolve these to
// whichever DN# group the referenced doc landed in.
const REF_RE = /REV(?:ERSE)?\s*(?:INV|CRD\s*NOTE)#?\s*0*(\d{3,8})/i;

function dedup(rows) {
  const groups = new Map();
  for (const r of rows) {
    const key = `${r.clean_doc}|${r.entry_type}|${r.tx_date}|${r.gross}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const out = [];
  let dropped = 0;
  for (const rs of groups.values()) {
    if (rs.length === 1) {
      out.push(rs[0]);
    } else {
      rs.sort((a, b) => a.created_at.localeCompare(b.created_at));
      out.push(rs[rs.length - 1]);
      dropped += rs.length - 1;
    }
  }
  console.error(`[dedup] ${rows.length} rows -> ${out.length} rows (${dropped} exact-duplicate drops)`);
  return out;
}

function buildEvents(rows) {
  const byDn = new Map();
  const docToDn = new Map();
  const candidateRefs = [];
  const unlabeled = [];

  for (const r of rows) {
    if (r.entry_type !== 'Invoice' && r.entry_type !== 'Crd Note') continue;
    const dnMatch = DN_RE.exec(r.description || '');
    if (dnMatch) {
      const dn = dnMatch[1];
      if (!byDn.has(dn)) byDn.set(dn, []);
      byDn.get(dn).push(r);
      docToDn.set(r.clean_doc, dn);
    } else {
      const refMatch = REF_RE.exec(r.description || '');
      if (refMatch) candidateRefs.push([r, cleanDoc(refMatch[1])]);
      else unlabeled.push(r);
    }
  }
  for (const [r, ref] of candidateRefs) {
    const dn = docToDn.get(ref);
    if (dn) byDn.get(dn).push(r);
    else unlabeled.push(r);
  }

  const events = [];
  for (const [dn, rs] of byDn) {
    rs.sort((a, b) => a.tx_date.localeCompare(b.tx_date));
    const net = round2(rs.reduce((s, r) => s + r.gross, 0));
    events.push({
      dn,
      date: rs[0].tx_date,
      endDate: rs[rs.length - 1].tx_date,
      docs: rs.map((r) => r.clean_doc),
      net,
      legCount: rs.length,
    });
  }
  events.sort((a, b) => a.date.localeCompare(b.date));
  return { events, unlabeled };
}

function buildPaymentDocs(rows) {
  const groups = new Map();
  for (const r of rows) {
    if (r.entry_type !== 'Payment') continue;
    const key = `${r.clean_doc}|${r.tx_date}|${r.batch_ref}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const docs = [];
  for (const [key, rs] of groups) {
    const [doc, txDate, batch] = key.split('|');
    const net = round2(rs.reduce((s, r) => s + r.gross, 0));
    const rowAmounts = [...new Set(rs.map((r) => round2(r.gross)))].sort((a, b) => a - b);
    docs.push({ doc, date: txDate, batch, net, rowAmounts, rowCount: rs.length });
  }
  docs.sort((a, b) => a.date.localeCompare(b.date));
  return docs;
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

function match(events, paymentDocs, { exactTol = 0.02, tightTol = 1.0 } = {}) {
  const results = [];
  const zeroNet = [];
  for (const ev of events) {
    if (Math.abs(ev.net) < 1.0) {
      zeroNet.push(ev);
      continue;
    }
    const candidates = [];
    for (const pd of paymentDocs) {
      const lagDays = daysBetween(ev.date, pd.date);
      const targets = [['doc_net', pd.net], ...pd.rowAmounts.map((a) => ['row', a])];
      for (const [kind, amt] of targets) {
        const diff = round2(Math.abs(Math.abs(amt) - Math.abs(ev.net)));
        let tier;
        if (diff <= exactTol) tier = 'EXACT';
        else if (diff <= tightTol) tier = 'TIGHT';
        else continue;
        candidates.push({ paymentDoc: pd.doc, paymentDate: pd.date, batch: pd.batch, kind, amount: amt, diff, tier, lagDays });
      }
    }
    candidates.sort((a, b) => (a.tier !== 'EXACT') - (b.tier !== 'EXACT') || a.diff - b.diff || Math.abs(a.lagDays) - Math.abs(b.lagDays));
    results.push({ event: ev, candidates });
  }
  return { results, zeroNet };
}

async function main() {
  const { debtorCode, excludeSourceFile } = parseArgs();
  const dataDir = path.join(ROOT, 'analysis/debtors', debtorCode, 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  const client = new pg.Client(pgClientOptions());
  await client.connect();
  const { rows: rawRows } = await client.query(
    `SELECT doc_no, entry_type, tx_date::text AS tx_date, description, batch_ref,
            source_file, created_at::text AS created_at, ROUND(amount_excl + tax_amount, 2) AS gross
     FROM transaction_headers
     WHERE account_no = $1
       AND entry_type IN ('Invoice','Crd Note','Payment')
       AND source_file <> $2
     ORDER BY tx_date, doc_no`,
    [debtorCode, excludeSourceFile],
  );
  await client.end();

  const rows = dedup(
    rawRows.map((r) => ({ ...r, gross: Number(r.gross), clean_doc: cleanDoc(r.doc_no), batch_ref: r.batch_ref || '' })),
  );

  const { events, unlabeled } = buildEvents(rows);
  const paymentDocs = buildPaymentDocs(rows);
  const { results, zeroNet } = match(events, paymentDocs);

  const matched = results.filter((r) => r.candidates.length > 0);
  const unmatched = results.filter((r) => r.candidates.length === 0);

  console.error(
    `[summary] ${events.length} DN#-labeled events, ${unlabeled.length} unlabeled invoice/CN rows, ${paymentDocs.length} consolidated payment docs`,
  );
  console.error(`[match] ${matched.length} events with a candidate, ${unmatched.length} with none, ${zeroNet.length} zero-net (skipped)`);

  const outPath = path.join(dataDir, 'dn_event_payment_allocation_candidates.json');
  fs.writeFileSync(
    outPath,
    `${JSON.stringify(
      {
        debtorCode,
        generatedAt: new Date().toISOString(),
        algorithm: 'dn_event_payment_allocation (header-combined net, DN#-grouped, reversal-chain-aware) - see payment_doc_allocation.mjs for the LPG-only, ref_no-linked WO0001 archetype instead',
        note: 'Candidate matches only - Probable/Exception confidence at best, no ref_no evidence on payments. Review before promoting into allocation_edges.csv.',
        matched: matched.map((r) => ({ dn: r.event.dn, date: r.event.date, net: r.event.net, legCount: r.event.legCount, candidates: r.candidates })),
        unmatched: unmatched.map((r) => ({ dn: r.event.dn, date: r.event.date, net: r.event.net, legCount: r.event.legCount })),
        zeroNet: zeroNet.map((e) => ({ dn: e.dn, date: e.date, net: e.net, legCount: e.legCount })),
        unlabeledRows: unlabeled.map((r) => ({ doc: r.clean_doc, entryType: r.entry_type, date: r.tx_date, gross: r.gross, description: r.description })),
      },
      null,
      2,
    )}\n`,
  );
  console.error(`[output] ${outPath}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
