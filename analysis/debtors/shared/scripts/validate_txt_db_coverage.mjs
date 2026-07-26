#!/usr/bin/env node
/**
 * TXT ↔ Supabase ingest coverage validator.
 *
 * Compares authoritative debtor statement TXT (document manifest) against
 * transaction_headers and vw_clean_transactions. Does NOT infer missing lines
 * from paired documents.
 *
 * Boundary: source completeness and ingest health only. This report never
 * asserts financial truth, reconciliation closure, collections eligibility
 * (D17/D18), or workspace workflow state (workspaceStatus). "Financial
 * balance from TXT" may read ALLOWED even while custody/sku/allocation are
 * BLOCKED — the TXT header balance is a separate, already-anchored fact.
 *
 * Usage:
 *   node analysis/debtors/shared/scripts/validate_txt_db_coverage.mjs --debtor JEN001
 *   node analysis/debtors/shared/scripts/validate_txt_db_coverage.mjs --debtor JEN001 \
 *     --txt analysis/debtors/JEN001/raw/JEN00116JULY.TXT --period-start 2026-01-01
 *
 * Outputs:
 *   analysis/debtors/[CODE]/reports/[CODE]_INGEST_COVERAGE_[date].json
 *   analysis/debtors/[CODE]/reports/[CODE]_INGEST_COVERAGE_[date].md
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pgClientOptions } from './require_database_url.mjs';
import {
  ingestShapeForEntryType,
  classifyDocument,
  deriveDisplayStatus,
  classificationIsPass,
  CLASSIFICATION_BLOCKS,
} from './ingest_coverage_classifier.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
  };
  const debtor = get('--debtor', '');
  if (!debtor) {
    console.error(
      'Usage: validate_txt_db_coverage.mjs --debtor CODE [--txt PATH] [--period-start YYYY-MM-DD] [--exceptions PATH]',
    );
    process.exit(1);
  }
  return {
    debtorCode: debtor.toUpperCase(),
    txtPath: get('--txt', null),
    periodStart: get('--period-start', null),
    exceptionsPath: get('--exceptions', null),
  };
}

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

function loadExceptions(exceptionsPath, debtorCode) {
  const defaultPath = path.join(
    ROOT,
    'analysis/debtors',
    debtorCode,
    'config',
    'ingest_exceptions.json',
  );
  const p = exceptionsPath || (fs.existsSync(defaultPath) ? defaultPath : null);
  if (!p || !fs.existsSync(p)) return new Map();
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const map = new Map();
  for (const ex of data.exceptions || []) {
    const key = `${String(ex.doc_no).replace(/^0+/, '')}|${ex.entry_type || ex.doc_type}`;
    map.set(key, ex);
  }
  return map;
}

async function fetchSyncTimestamps(client) {
  try {
    const r = await client.query(`
      SELECT file_type, MAX(created_at)::timestamptz AS latest
      FROM sync_logs
      GROUP BY file_type`);
    const out = { headers: null, items: null };
    for (const row of r.rows) {
      if (row.file_type === 'HEADERS') out.headers = row.latest;
      if (row.file_type === 'ITEMS') out.items = row.latest;
    }
    return out;
  } catch {
    return { headers: null, items: null };
  }
}

async function fetchDbDocs(client, accountNo, periodStart) {
  const headers = await client.query(
    `
    SELECT LTRIM(doc_no,'0') AS doc_no, entry_type, tx_date::date AS tx_date,
           ROUND((amount_excl + tax_amount)::numeric, 2)::float AS amount,
           source_file
    FROM transaction_headers
    WHERE account_no = $1 AND tx_date >= $2::date`,
    [accountNo, periodStart],
  );

  const lines = await client.query(
    `
    SELECT LTRIM(doc_no,'0') AS doc_no, entry_type, COUNT(*)::int AS line_count
    FROM vw_clean_transactions
    WHERE account_no = $1 AND tx_date >= $2::date
    GROUP BY doc_no, entry_type`,
    [accountNo, periodStart],
  );

  const headerMap = new Map();
  for (const h of headers.rows) {
    headerMap.set(`${h.doc_no}|${h.entry_type}`, h);
  }
  const lineMap = new Map();
  for (const l of lines.rows) {
    lineMap.set(`${l.doc_no}|${l.entry_type}`, l.line_count > 0);
  }

  return { headerMap, lineMap, dbHeaderDocs: headers.rows };
}

function assessFreshness(txtAsAt, syncTimestamps) {
  if (!syncTimestamps.headers) return 'unverified';
  const headerSync = new Date(syncTimestamps.headers);
  const txtDate = new Date(`${txtAsAt}T23:59:59Z`);
  // Stale if last header sync is more than 1 day before TXT last transaction date
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

async function main() {
  const cli = parseArgs();
  const cfg = loadConfig(cli.debtorCode);
  const periodStart = cli.periodStart || cfg?.periodStart || '2026-01-01';
  const txtPath = cli.txtPath
    ? path.isAbsolute(cli.txtPath)
      ? cli.txtPath
      : path.join(ROOT, cli.txtPath)
    : cfg?.txtPath
      ? path.isAbsolute(cfg.txtPath)
        ? cfg.txtPath
        : path.join(ROOT, cfg.txtPath)
      : null;

  if (!txtPath || !fs.existsSync(txtPath)) {
    throw new Error(`Missing statement TXT for ${cli.debtorCode}`);
  }

  const exceptions = loadExceptions(cli.exceptionsPath, cli.debtorCode);
  const { docs: txtDocs, txtAsAt } = parseTxtStatement(txtPath, periodStart);

  const client = new pg.Client(pgClientOptions());
  await client.connect();
  const syncTimestamps = await fetchSyncTimestamps(client);
  const { headerMap, lineMap, dbHeaderDocs } = await fetchDbDocs(
    client,
    cli.debtorCode,
    periodStart,
  );
  await client.end();

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
    account_no: cli.debtorCode,
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
    // Single canonical location for the blocked-scope list, matching
    // INGEST_GATE_SCHEMA_STAGED.md's staged project.json fragment. Do not
    // duplicate this at top level — a second copy is exactly the kind of
    // divergent-name drift this rename exists to eliminate. Distinct from
    // D18's `collections.blockers`: this is which analytical *lanes* cannot
    // close due to missing source coverage, not which account conditions
    // prohibit a collections action.
    // D19: `status` is schema validity ("can this object be trusted?"), never
    // computed from ingestFreshness/ingestCoverage — that conflation is exactly
    // what D19 eliminates. Reaching this line means the report object above was
    // successfully built and is well-formed, regardless of what it reports about
    // ingest health — a stale/partial report is still a trustworthy report.
    // There is no code path here that reaches this line with a malformed object;
    // a genuine construction failure throws (see main().catch) and no report is
    // written at all — which downstream reads as 'unverified' (absent), not 'fail'.
    ingest_gate: {
      status: 'pass',
      ingestBlockedScopes: blockedScopes,
    },
    documents,
  };

  const dateSlug = new Date().toISOString().slice(0, 10);
  const reportDir = path.join(ROOT, 'analysis/debtors', cli.debtorCode, 'reports');
  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = path.join(reportDir, `${cli.debtorCode}_INGEST_COVERAGE_${dateSlug}.json`);
  const mdPath = path.join(reportDir, `${cli.debtorCode}_INGEST_COVERAGE_${dateSlug}.md`);

  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, buildMarkdown(report));

  console.log(`[${cli.debtorCode}] ingestFreshness: ${ingestFreshness}`);
  console.log(`[${cli.debtorCode}] ingestCoverage: ${ingestCoverage}`);
  console.log(`[${cli.debtorCode}] display_status: ${displayStatus}`);
  console.log(`[${cli.debtorCode}] gaps: ${gaps.length} — ${gaps.map((d) => d.doc_no).join(', ') || 'none'}`);
  console.log(`[${cli.debtorCode}] gates: custody=${report.gates.custody} sku=${report.gates.sku_analysis}`);
  console.log(`Written ${jsonPath}`);
  console.log(`Written ${mdPath}`);

  process.exit(gaps.length > 0 || ingestFreshness === 'stale' ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
