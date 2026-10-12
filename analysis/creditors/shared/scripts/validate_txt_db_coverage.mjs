#!/usr/bin/env node
/**
 * TXT ↔ Supabase ingest coverage validator (creditor AP accounts).
 *
 * Usage:
 *   node analysis/creditors/shared/scripts/validate_txt_db_coverage.mjs --creditor 008ORY
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
  const creditor = get('--creditor', '');
  if (!creditor) {
    console.error(
      'Usage: validate_txt_db_coverage.mjs --creditor CODE [--txt PATH] [--period-start YYYY-MM-DD]',
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
  const udChequesPay = Number(txt.match(/UD CHEQUES\/PAY:","([0-9.]+)"/)?.[1] ?? 0);
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

  return { docs: [...docs.values()], headerBalance, udChequesPay, txtAsAt: maxIso };
}

function loadConfig(creditorCode) {
  const p = path.join(ROOT, 'analysis/creditors', creditorCode, 'config/statement_v5.json');
  if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
  return null;
}

function linkedAccounts(cfg, creditorCode) {
  return [creditorCode, ...(cfg?.linkedAccounts || [])].filter((v, i, a) => a.indexOf(v) === i);
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

async function fetchDbDocs(client, accountNos, periodStart) {
  const headers = await client.query(
    `
    SELECT LTRIM(doc_no,'0') AS doc_no, entry_type, tx_date::date AS tx_date,
           ROUND((amount_excl + tax_amount)::numeric, 2)::float AS amount,
           source_file, account_no
    FROM transaction_headers
    WHERE account_no = ANY($1) AND tx_date >= $2::date`,
    [accountNos, periodStart],
  );

  const lines = await client.query(
    `
    SELECT LTRIM(doc_no,'0') AS doc_no, entry_type, COUNT(*)::int AS line_count
    FROM vw_clean_transactions
    WHERE account_no = ANY($1) AND tx_date >= $2::date
    GROUP BY doc_no, entry_type`,
    [accountNos, periodStart],
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
  if (!syncTimestamps.items) return 'unverified';
  const itemSync = new Date(syncTimestamps.items);
  const txtDate = new Date(`${txtAsAt}T23:59:59Z`);
  if (itemSync < txtDate) return 'stale';
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
    `| Linked accounts | ${report.linked_accounts.join(', ')} |`,
    `| TXT as-at (last period row) | ${report.txt_as_at} |`,
    `| Items sync as-at (STDatabase) | ${report.items_sync_as_at ?? 'unverified'} |`,
    `| Ingest model | \`lines_only\` (GRV/DN) · \`txt_only\` (payments) |`,
    `| ingestFreshness | \`${report.ingestFreshness}\` |`,
    `| ingestCoverage | \`${report.ingestCoverage}\` |`,
    `| Documents in TXT (period) | ${report.summary.documents_in_txt} |`,
    `| Healthy / expected | ${report.summary.healthy} |`,
    `| Gaps | ${report.summary.gaps} |`,
    ``,
    `## Gate result`,
    ``,
    `| Lane | Status |`,
    `| :--- | :--- |`,
    `| Financial balance from TXT | ${report.gates.financial_balance_from_txt} |`,
    `| Custody / Part 2 qty | ${report.gates.custody} |`,
    `| SKU analysis | ${report.gates.sku_analysis} |`,
    ``,
  ];

  const gaps = report.documents.filter((d) => !classificationIsPass(d.classification));
  if (gaps.length) {
    lines.push(`## Document gaps`, ``, `| Doc | Type | Date | Class |`, `| :--- | :--- | :--- | :--- |`);
    for (const d of gaps) {
      lines.push(`| ${d.doc_no} | ${d.doc_type} | ${d.tx_date} | ${d.classification} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  const cli = parseArgs();
  const cfg = loadConfig(cli.creditorCode);
  const accounts = linkedAccounts(cfg, cli.creditorCode);
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

  const client = new pg.Client(pgClientOptions());
  await client.connect();
  const syncTimestamps = await fetchSyncTimestamps(client);
  const { headerMap, lineMap, dbHeaderDocs } = await fetchDbDocs(client, accounts, periodStart);
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
      exception: ex ? { exception_id: ex.exception_id } : null,
    });
  }

  for (const h of dbHeaderDocs) {
    const key = `${h.doc_no}|${h.entry_type}`;
    if (txtKeys.has(key)) continue;
    documents.push({
      doc_no: h.doc_no,
      doc_type: h.entry_type,
      tx_date: isoDateOnly(h.tx_date),
      amount: h.amount,
      in_txt: false,
      header_present: true,
      lines_present: lineMap.get(key) === true,
      classification: 'DB_ONLY_DOCUMENT',
      blocks: CLASSIFICATION_BLOCKS.DB_ONLY_DOCUMENT,
      account_no: h.account_no,
    });
  }

  documents.sort((a, b) => a.tx_date.localeCompare(b.tx_date) || a.doc_no.localeCompare(b.doc_no));

  const gaps = documents.filter((d) => d.in_txt && !classificationIsPass(d.classification));
  const ingestCoverage =
    ingestFreshness === 'unverified' ? 'unverified' : gaps.length === 0 ? 'complete' : 'partial';
  const displayStatus = deriveDisplayStatus(ingestFreshness, ingestCoverage);
  const blockedScopes = [...new Set(gaps.flatMap((d) => d.blocks))];

  const report = {
    account_no: cli.creditorCode,
    linked_accounts: accounts,
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

  console.log(`[${cli.creditorCode}] ingestFreshness: ${ingestFreshness}`);
  console.log(`[${cli.creditorCode}] ingestCoverage: ${ingestCoverage}`);
  console.log(`[${cli.creditorCode}] gaps: ${gaps.length}`);
  console.log(`Written ${jsonPath}`);

  process.exit(gaps.length > 0 || ingestFreshness === 'stale' ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
