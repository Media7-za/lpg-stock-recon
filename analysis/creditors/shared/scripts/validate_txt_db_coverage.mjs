#!/usr/bin/env node
/**
 * Creditor TXT ↔ Supabase ingest coverage validator (Accounts Payable).
 *
 * Fork of the debtor validator. Compares the authoritative creditor statement
 * TXT (document manifest) against transaction_headers and vw_clean_transactions
 * for the creditor account and any linked legacy accounts (e.g. 008ORY + 007ORY).
 * AP document literals: GRV (supplier charge) and Deb Note (supplier credit).
 *
 * Boundary (identical to debtor lane): source completeness / ingest health only.
 * The TXT header CURRENT BALANCE is a separate, already-anchored Tier-3 fact and
 * is never blocked by this report.
 *
 * DB-optional: when DATABASE_URL is unset the script cannot compare TXT ↔ DB, so
 * it emits an honest `UNVERIFIED` report (custody/sku/allocation not signed off)
 * and exits non-zero — the TXT-only financial bridge in the statement still runs.
 *
 * Usage:
 *   node analysis/creditors/shared/scripts/validate_txt_db_coverage.mjs --creditor 008ORY
 *   node analysis/creditors/shared/scripts/validate_txt_db_coverage.mjs --creditor 008ORY \
 *     --txt analysis/creditors/008ORY/raw/008ORYCURRENT.TXT --period-start 2026-07-01
 *
 * Outputs:
 *   analysis/creditors/[CODE]/reports/[CODE]_INGEST_COVERAGE_[date].json
 *   analysis/creditors/[CODE]/reports/[CODE]_INGEST_COVERAGE_[date].md
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pgClientOptions, hasDatabaseUrl } from './require_database_url.mjs';
import {
  ingestShapeForEntryType,
  classifyDocument,
  deriveDisplayStatus,
  classificationIsPass,
  CLASSIFICATION_BLOCKS,
} from './ingest_coverage_classifier.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

const LINE_ENTRY_TYPES = ['GRV', 'Deb Note'];

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (flag, fallback) => {
    const i = args.indexOf(flag);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
  };
  const creditor = get('--creditor', '');
  if (!creditor) {
    console.error(
      'Usage: validate_txt_db_coverage.mjs --creditor CODE [--txt PATH] [--period-start YYYY-MM-DD] [--exceptions PATH]',
    );
    process.exit(1);
  }
  return {
    creditorCode: creditor.toUpperCase(),
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
  const headerBalance = Number(txt.match(/CURRENT BALANCE:","(-?[0-9.]+)"/)?.[1] ?? NaN);
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

function loadConfig(creditorCode) {
  const p = path.join(ROOT, 'analysis/creditors', creditorCode, 'config', 'statement_v5.json');
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  return null;
}

function accountsFor(creditorCode, cfg) {
  return [creditorCode, ...((cfg && cfg.linkedAccounts) || [])];
}

function loadExceptions(exceptionsPath, creditorCode) {
  const defaultPath = path.join(
    ROOT,
    'analysis/creditors',
    creditorCode,
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

async function fetchDbDocs(client, accounts, periodStart) {
  const headers = await client.query(
    `
    SELECT LTRIM(doc_no,'0') AS doc_no, entry_type, tx_date::date AS tx_date,
           ROUND((amount_excl + tax_amount)::numeric, 2)::float AS amount,
           source_file
    FROM transaction_headers
    WHERE account_no = ANY($1) AND tx_date >= $2::date`,
    [accounts, periodStart],
  );

  const lines = await client.query(
    `
    SELECT LTRIM(doc_no,'0') AS doc_no, entry_type, COUNT(*)::int AS line_count
    FROM vw_clean_transactions
    WHERE account_no = ANY($1) AND tx_date >= $2::date
      AND entry_type = ANY($3)
    GROUP BY doc_no, entry_type`,
    [accounts, periodStart, LINE_ENTRY_TYPES],
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
  if (headerSync < txtDate) return 'stale';
  return 'current';
}

function isoDateOnly(d) {
  if (!d) return null;
  return new Date(d).toISOString().slice(0, 10);
}

function buildMarkdown(report) {
  const lines = [
    `# ${report.account_no} — Creditor Ingest Coverage Report`,
    ``,
    `**Generated:** ${report.generated_at.slice(0, 10)} · **Display status:** \`${report.display_status}\``,
    ``,
    `## Summary`,
    ``,
    `| Field | Value |`,
    `| :--- | :--- |`,
    `| Statement TXT | \`${report.statement_txt}\` |`,
    `| Linked accounts | ${report.accounts.join(', ')} |`,
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

  if (report.db_connected === false) {
    lines.push(
      `> **DATABASE_URL not set.** TXT ↔ DB coverage could not be verified; custody / SKU / allocation lanes are \`UNVERIFIED\` and Part 2 qty must not be trusted until Supabase is wired and this check re-run.`,
      ``,
    );
  }

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
    `> Supabase is a derived cache of ERP exports. This report compares the creditor statement TXT manifest to database feeds. It does **not** infer missing GRV lines from Deb Notes.`,
  );
  lines.push('');

  return lines.join('\n');
}

function buildUnverifiedDocuments(txtDocs, exceptions) {
  return txtDocs.map((td) => {
    const key = `${td.doc_no}|${td.doc_type}`;
    const ex = exceptions.get(key);
    const requiredShape = ingestShapeForEntryType(td.doc_type);
    // header_only docs (payments) need no DB lines, so they are not custody gaps
    // even when the DB is offline; only header_and_lines docs are unverifiable.
    const classification =
      requiredShape === 'header_only'
        ? 'EXPECTED_HEADER_ONLY'
        : ex
          ? 'RATIFIED_EXCEPTION'
          : 'DB_UNVERIFIED';
    return {
      doc_no: td.doc_no,
      doc_type: td.doc_type,
      tx_date: td.tx_date,
      ref_no: td.ref_no,
      amount: td.amount,
      in_txt: true,
      header_present: false,
      lines_present: false,
      required_ingest_shape: requiredShape,
      classification,
      blocks: classification === 'DB_UNVERIFIED' ? ['custody', 'sku_analysis', 'allocation'] : [],
      exception: ex ? { exception_id: ex.exception_id, review_by: ex.review_by } : null,
    };
  });
}

async function main() {
  const cli = parseArgs();
  const cfg = loadConfig(cli.creditorCode);
  const accounts = accountsFor(cli.creditorCode, cfg);
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
    throw new Error(`Missing statement TXT for ${cli.creditorCode}`);
  }

  const exceptions = loadExceptions(cli.exceptionsPath, cli.creditorCode);
  const { docs: txtDocs, txtAsAt } = parseTxtStatement(txtPath, periodStart);
  const dbConnected = hasDatabaseUrl();

  let documents = [];
  let ingestFreshness = 'unverified';
  let syncTimestamps = { headers: null, items: null };

  if (dbConnected) {
    const client = new pg.Client(pgClientOptions());
    await client.connect();
    syncTimestamps = await fetchSyncTimestamps(client);
    const { headerMap, lineMap, dbHeaderDocs } = await fetchDbDocs(client, accounts, periodStart);
    await client.end();

    ingestFreshness = assessFreshness(txtAsAt, syncTimestamps);
    const txtKeys = new Set(txtDocs.map((d) => `${d.doc_no}|${d.doc_type}`));

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
        exception: ex ? { exception_id: ex.exception_id, review_by: ex.review_by } : null,
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
  } else {
    documents = buildUnverifiedDocuments(txtDocs, exceptions);
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
  const gateFor = (scope) =>
    !dbConnected ? 'UNVERIFIED' : blockedScopes.includes(scope) ? 'BLOCKED' : 'ALLOWED';

  const report = {
    account_no: cli.creditorCode,
    accounts,
    db_connected: dbConnected,
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
      custody: gateFor('custody'),
      sku_analysis: gateFor('sku_analysis'),
      allocation: gateFor('allocation'),
    },
    ingest_gate: {
      status: 'pass',
      ingestBlockedScopes: blockedScopes,
    },
    documents,
  };

  const dateSlug = new Date().toISOString().slice(0, 10);
  const reportDir = path.join(ROOT, 'analysis/creditors', cli.creditorCode, 'reports');
  fs.mkdirSync(reportDir, { recursive: true });
  const jsonPath = path.join(reportDir, `${cli.creditorCode}_INGEST_COVERAGE_${dateSlug}.json`);
  const mdPath = path.join(reportDir, `${cli.creditorCode}_INGEST_COVERAGE_${dateSlug}.md`);

  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(mdPath, buildMarkdown(report));

  console.log(`[${cli.creditorCode}] db_connected: ${dbConnected}`);
  console.log(`[${cli.creditorCode}] ingestFreshness: ${ingestFreshness}`);
  console.log(`[${cli.creditorCode}] ingestCoverage: ${ingestCoverage}`);
  console.log(`[${cli.creditorCode}] display_status: ${displayStatus}`);
  console.log(`[${cli.creditorCode}] gaps: ${gaps.length} — ${gaps.map((d) => d.doc_no).join(', ') || 'none'}`);
  console.log(`[${cli.creditorCode}] gates: custody=${report.gates.custody} sku=${report.gates.sku_analysis}`);
  console.log(`Written ${jsonPath}`);
  console.log(`Written ${mdPath}`);

  process.exit(gaps.length > 0 || ingestFreshness === 'stale' || !dbConnected ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
