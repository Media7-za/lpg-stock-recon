#!/usr/bin/env node
/**
 * JIM001 ingest coverage check -- MCP-cache variant.
 *
 * Mirrors analysis/debtors/shared/scripts/validate_txt_db_coverage.mjs
 * exactly (same classification logic, same report shape), except the three
 * DB-dependent lookups (sync_logs timestamps, transaction_headers, and
 * vw_clean_transactions line counts) are read from pre-fetched JSON caches
 * instead of a live `pg` connection, because DATABASE_URL was not available
 * in this session's sandbox. The caches were populated by running the
 * *exact same* SQL the shared script runs via the Supabase MCP tool against
 * project oqhpxnaadahohwkslive on 2026-09-14. Do not use this script for any
 * debtor other than JIM001. If DATABASE_URL becomes available, use
 * `npm run debtors:ingest-check -- --debtor JIM001` (the shared script)
 * directly instead and retire this file.
 *
 * Usage: node analysis/debtors/JIM001/scripts/validate_jim001_ingest_coverage_from_mcp_cache.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  ingestShapeForEntryType,
  classifyDocument,
  deriveDisplayStatus,
  classificationIsPass,
  CLASSIFICATION_BLOCKS,
} from '../../shared/scripts/ingest_coverage_classifier.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');
const DEBTOR_CODE = 'JIM001';
const CACHE_DIR = path.join(__dirname, 'v5_mcp_cache');

function parseCsvLine(line) {
  const out = [];
  let cur = '',
    inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
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

function parseTxtDate(d) {
  const [dd, mm, yy] = d.split('/');
  const y = yy.length === 2 ? `20${yy}` : yy;
  return `${y}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

function parseTxtStatement(filePath, periodStart) {
  const txt = fs.readFileSync(filePath, 'utf8');
  const headerBalance = Number(txt.match(/CURRENT BALANCE:","([0-9.]+)"/)?.[1] ?? NaN);
  const docs = new Map();
  let maxIso = periodStart;

  for (const line of txt.split('\n')) {
    if (!line.startsWith('"') || line.includes('LINE","PERIOD')) continue;
    const p = parseCsvLine(line);
    if (!p[0] || isNaN(+p[0]) || !p[4]?.includes('/')) continue;
    const iso = parseTxtDate(p[4]);
    if (iso < periodStart) continue;
    if (iso > maxIso) maxIso = iso;

    const cleanDoc = p[2].replace(/^0+/, '') || p[2];
    const entryType = p[3];
    const key = `${cleanDoc}|${entryType}`;
    if (!docs.has(key)) {
      docs.set(key, {
        doc_no: cleanDoc,
        doc_type: entryType,
        tx_date: iso,
        ref_no: (p[6] || '').trim(),
        amount: Math.round(Number(p[9]) * 100) / 100,
        in_txt: true,
      });
    }
  }

  return { docs: [...docs.values()], headerBalance, txtAsAt: maxIso };
}

function loadConfig(debtorCode) {
  for (const name of ['statement_v5.json', 'statement_v4.json']) {
    const p = path.join(ROOT, 'analysis/debtors', debtorCode, 'config', name);
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  }
  return null;
}

function loadExceptions(debtorCode) {
  const defaultPath = path.join(
    ROOT,
    'analysis/debtors',
    debtorCode,
    'config',
    'ingest_exceptions.json',
  );
  if (!fs.existsSync(defaultPath)) return new Map();
  const data = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
  const map = new Map();
  for (const ex of data.exceptions || []) {
    const key = `${String(ex.doc_no).replace(/^0+/, '')}|${ex.entry_type || ex.doc_type}`;
    map.set(key, ex);
  }
  return map;
}

/** MCP-cache variant of fetchSyncTimestamps. */
function fetchSyncTimestampsFromCache() {
  const p = path.join(CACHE_DIR, 'sync_timestamps.json');
  if (!fs.existsSync(p)) return { headers: null, items: null };
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/** MCP-cache variant of fetchDbDocs -- reads pre-fetched JSON instead of querying pg. */
function fetchDbDocsFromCache() {
  const headers = JSON.parse(
    fs.readFileSync(path.join(CACHE_DIR, 'txn_headers_2025-03-01_onward.json'), 'utf8'),
  );
  const lines = JSON.parse(
    fs.readFileSync(path.join(CACHE_DIR, 'line_counts_2025-03-01_onward.json'), 'utf8'),
  );

  const headerMap = new Map();
  for (const h of headers) {
    headerMap.set(`${h.doc_no}|${h.entry_type}`, h);
  }
  const lineMap = new Map();
  for (const l of lines) {
    lineMap.set(`${l.doc_no}|${l.entry_type}`, l.line_count > 0);
  }

  return { headerMap, lineMap, dbHeaderDocs: headers };
}

function assessFreshness(txtAsAt, syncTimestamps) {
  if (!syncTimestamps.headers) return 'unverified';
  const headerSync = new Date(syncTimestamps.headers);
  const txtDate = new Date(`${txtAsAt}T23:59:59Z`);
  if (headerSync < txtDate) return 'stale';
  return 'current';
}

function isoDateOnly(d) {
  if (!d) return null;
  return new Date(d).toISOString().slice(0, 10);
}

function buildMarkdown(report) {
  const lines = [
    `# ${report.account_no} — Ingest Coverage Report`,
    ``,
    `**Generated:** ${report.generated_at.slice(0, 10)} · **Display status:** \`${report.display_status}\``,
    ``,
    `*Generated via the MCP-cache variant (DATABASE_URL unavailable in-session) -- sync_logs/transaction_headers/vw_clean_transactions lookups sourced via Supabase MCP query 2026-09-14 against project \`oqhpxnaadahohwkslive\`, same SQL as the shared \`validate_txt_db_coverage.mjs\`.*`,
    ``,
    `## Summary`,
    ``,
    `| Field | Value |`,
    `| :--- | :--- |`,
    `| Statement TXT | \`${report.statement_txt}\` |`,
    `| TXT as-at (last period row) | ${report.txt_as_at} |`,
    `| Header sync as-at | ${report.header_sync_as_at ?? 'unverified'} |`,
    `| Items sync as-at | ${report.items_sync_as_at ?? 'unverified'} |`,
    `| ingestFreshness | \`${report.ingestFreshness}\` |`,
    `| ingestCoverage | \`${report.ingestCoverage}\` |`,
    `| Documents in TXT (period) | ${report.summary.documents_in_txt} |`,
    `| Healthy / expected | ${report.summary.healthy} |`,
    `| Gaps | ${report.summary.gaps} |`,
    `| DB-only (not in TXT) | ${report.summary.db_only} |`,
    ``,
    `## Gate result`,
    ``,
    `| Lane | Status |`,
    `| :--- | :--- |`,
    `| Financial balance from TXT | ${report.gates.financial_balance_from_txt} |`,
    `| Custody / Part 2 qty | ${report.gates.custody} |`,
    `| SKU analysis | ${report.gates.sku_analysis} |`,
    `| Allocation | ${report.gates.allocation} |`,
    ``,
  ];

  const gaps = report.documents.filter((d) => !classificationIsPass(d.classification));
  if (gaps.length) {
    lines.push(`## Document gaps`, ``, `| Doc | Type | Date | Class | Blocks |`, `| :--- | :--- | :--- | :--- | :--- |`);
    for (const d of gaps) {
      lines.push(
        `| ${d.doc_no} | ${d.doc_type} | ${d.tx_date} | ${d.classification} | ${d.blocks.join(', ') || '—'} |`,
      );
    }
    lines.push('');
  }

  lines.push(`## Doctrine`, ``);
  lines.push(
    `> Supabase is a derived cache of ERP exports. This report compares the statement TXT manifest to database feeds. It does **not** infer missing invoice lines from credit notes.`,
  );
  lines.push('');

  return lines.join('\n');
}

function main() {
  const cfg = loadConfig(DEBTOR_CODE);
  const periodStart = cfg?.periodStart || '2026-01-01';
  const txtPath = cfg?.txtPath
    ? path.isAbsolute(cfg.txtPath)
      ? cfg.txtPath
      : path.join(ROOT, cfg.txtPath)
    : null;

  if (!txtPath || !fs.existsSync(txtPath)) {
    throw new Error(`Missing statement TXT for ${DEBTOR_CODE}`);
  }

  const exceptions = loadExceptions(DEBTOR_CODE);
  const { docs: txtDocs, txtAsAt } = parseTxtStatement(txtPath, periodStart);

  const syncTimestamps = fetchSyncTimestampsFromCache();
  const { headerMap, lineMap, dbHeaderDocs } = fetchDbDocsFromCache();

  const ingestFreshness = assessFreshness(txtAsAt, syncTimestamps);
  const txtKeys = new Set(txtDocs.map((d) => `${d.doc_no}|${d.doc_type}`));
  const documents = [];

  for (const td of txtDocs) {
    const key = `${td.doc_no}|${td.doc_type}`;
    const headerPresent = headerMap.has(key);
    const linesPresent = lineMap.get(key) === true;
    const requiredShape = ingestShapeForEntryType(td.doc_type);
    const ex = exceptions.get(key);
    const classification = classifyDocument({
      inTxt: true,
      headerPresent,
      linesPresent,
      requiredShape,
      ratified: Boolean(ex),
    });

    documents.push({
      doc_no: td.doc_no,
      doc_type: td.doc_type,
      tx_date: td.tx_date,
      ref_no: td.ref_no,
      amount: td.amount,
      in_txt: true,
      header_present: headerPresent,
      lines_present: linesPresent,
      required_ingest_shape: requiredShape,
      classification,
      blocks: ex?.blocked_use || CLASSIFICATION_BLOCKS[classification] || [],
      exception: ex
        ? {
            exception_id: ex.exception_id,
            review_by: ex.review_by,
          }
        : null,
    });
  }

  for (const h of dbHeaderDocs) {
    const key = `${h.doc_no}|${h.entry_type}`;
    if (txtKeys.has(key)) continue;
    const linesPresent = lineMap.get(key) === true;
    documents.push({
      doc_no: h.doc_no,
      doc_type: h.entry_type,
      tx_date: isoDateOnly(h.tx_date),
      ref_no: null,
      amount: h.amount,
      in_txt: false,
      header_present: true,
      lines_present: linesPresent,
      required_ingest_shape: ingestShapeForEntryType(h.entry_type),
      classification: 'DB_ONLY_DOCUMENT',
      blocks: CLASSIFICATION_BLOCKS.DB_ONLY_DOCUMENT,
      source_file: h.source_file,
      exception: null,
    });
  }

  documents.sort(
    (a, b) => a.tx_date.localeCompare(b.tx_date) || a.doc_no.localeCompare(b.doc_no),
  );

  const gaps = documents.filter((d) => d.in_txt && !classificationIsPass(d.classification));
  const ingestCoverage =
    ingestFreshness === 'unverified'
      ? 'unverified'
      : gaps.length === 0
        ? 'complete'
        : 'partial';

  const displayStatus = deriveDisplayStatus(ingestFreshness, ingestCoverage);
  const blockedScopes = [...new Set(gaps.flatMap((d) => d.blocks))];

  const report = {
    account_no: DEBTOR_CODE,
    generated_at: new Date().toISOString(),
    statement_txt: path.relative(ROOT, txtPath),
    period_start: periodStart,
    txt_as_at: txtAsAt,
    header_sync_as_at: isoDateOnly(syncTimestamps.headers),
    items_sync_as_at: isoDateOnly(syncTimestamps.items),
    ingestFreshness,
    ingestCoverage,
    display_status: displayStatus,
    summary: {
      documents_in_txt: txtDocs.length,
      healthy: documents.filter((d) => d.in_txt && classificationIsPass(d.classification)).length,
      gaps: gaps.length,
      db_only: documents.filter((d) => d.classification === 'DB_ONLY_DOCUMENT').length,
    },
    gates: {
      financial_balance_from_txt: 'ALLOWED',
      custody: blockedScopes.includes('custody') ? 'BLOCKED' : 'ALLOWED',
      sku_analysis: blockedScopes.includes('sku_analysis') ? 'BLOCKED' : 'ALLOWED',
      allocation: blockedScopes.includes('allocation') ? 'BLOCKED' : 'ALLOWED',
    },
    ingest_gate: {
      status: 'pass',
      ingestBlockedScopes: blockedScopes,
    },
    generation_method: 'mcp_cache',
    generation_note:
      'DATABASE_URL unavailable in-session; sync_logs/transaction_headers/vw_clean_transactions data sourced via Supabase MCP query 2026-09-14 against project oqhpxnaadahohwkslive, using the exact SQL from validate_txt_db_coverage.mjs.',
    documents,
  };

  const dateSlug = new Date().toISOString().slice(0, 10);
  const reportDir = path.join(ROOT, 'analysis/debtors', DEBTOR_CODE, 'reports');
  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = path.join(reportDir, `${DEBTOR_CODE}_INGEST_COVERAGE_${dateSlug}.json`);
  const mdPath = path.join(reportDir, `${DEBTOR_CODE}_INGEST_COVERAGE_${dateSlug}.md`);

  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, buildMarkdown(report));

  console.log(`[${DEBTOR_CODE}] ingestFreshness: ${ingestFreshness}`);
  console.log(`[${DEBTOR_CODE}] ingestCoverage: ${ingestCoverage}`);
  console.log(`[${DEBTOR_CODE}] display_status: ${displayStatus}`);
  console.log(`[${DEBTOR_CODE}] gaps: ${gaps.length} — ${gaps.map((d) => d.doc_no).join(', ') || 'none'}`);
  console.log(`[${DEBTOR_CODE}] gates: custody=${report.gates.custody} sku=${report.gates.sku_analysis}`);
  console.log(`Written ${jsonPath}`);
  console.log(`Written ${mdPath}`);

  process.exitCode = gaps.length > 0 || ingestFreshness === 'stale' ? 1 : 0;
}

main();
