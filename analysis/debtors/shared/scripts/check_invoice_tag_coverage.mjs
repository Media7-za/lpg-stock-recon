#!/usr/bin/env node
/**
 * Invoice-tag coverage gate.
 *
 * The existing ingest gate (validate_txt_db_coverage.mjs) asks "is every ERP
 * document present in the DB?". This asks a different question the ingest gate
 * cannot see: "can we trust WHICH invoices the open-invoice list says are
 * open?" — because ERP posts settlement rows with a blank INVNO, leaving
 * already-paid invoices stranded as open forever.
 *
 * Usage:
 *   node analysis/debtors/shared/scripts/check_invoice_tag_coverage.mjs \
 *     --debtor [CODE] [--txt path/to/DEBENQ.TXT] [--write] [--json]
 *
 *   --write   emit reports/[CODE]_TAG_COVERAGE_[YYYY-MM-DD].{json,md}
 *   --json    print the raw JSON result to stdout instead of the summary
 *
 * Exit code 1 when the gate is BLOCKED, so callers and CI can fail hard.
 *
 * Reads the debtor's statement_of_account.json for `primaryTxt` and
 * `closedInvoiceOverrides`; falls back to raw/DEBENQ_[CODE].TXT.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import {
  parseDebenqWithRunning,
  computeOpenInvoices,
  analyseInvoiceTagCoverage,
  loadRemittanceInvoiceDocs,
  displayDate,
  fmtAmount,
  GATE_MEANING,
  REMEDY,
} from './debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

function parseArgs(argv) {
  const args = { write: false, json: false, all: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--debtor') args.debtor = argv[++i];
    else if (argv[i] === '--txt') args.txt = argv[++i];
    else if (argv[i] === '--write') args.write = true;
    else if (argv[i] === '--json') args.json = true;
    else if (argv[i] === '--all') args.all = true;
  }
  return args;
}

/** Every debtor folder that has at least one DEBENQ-style TXT to check. */
function listDebtors() {
  const base = path.join(ROOT, 'analysis/debtors');
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^[A-Z]{2,4}\d{3,4}$/.test(d.name))
    .map((d) => d.name)
    .sort();
}

/**
 * Resolve TXT path + closed-invoice overrides for a debtor, config optional.
 * TXT preference: explicit --txt, then the statement config, then the debtor's
 * ratified v5 TXT, then the default DEBENQ name. Never guesses from a raw/ glob
 * — debtors hold several overlapping exports and picking the wrong one would
 * produce a confidently wrong gate result.
 */
export function resolveDebtorInputs(debtorCode, txtOverride) {
  const debtorDir = path.join(ROOT, 'analysis/debtors', debtorCode);
  const cfgPath = path.join(debtorDir, 'config/statement_of_account.json');
  let cfg = {};
  if (fs.existsSync(cfgPath)) cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));

  const v5Path = path.join(debtorDir, 'config/statement_v5.json');
  let v5Txt = null;
  if (fs.existsSync(v5Path)) {
    try {
      v5Txt = JSON.parse(fs.readFileSync(v5Path, 'utf8')).txtPath || null;
    } catch {
      v5Txt = null;
    }
  }

  const candidates = [
    txtOverride,
    cfg.primaryTxt,
    v5Txt,
    `analysis/debtors/${debtorCode}/raw/DEBENQ_${debtorCode}.TXT`,
  ].filter(Boolean);

  const txtPath = candidates
    .map((rel) => (path.isAbsolute(rel) ? rel : path.join(ROOT, rel)))
    .find((abs) => fs.existsSync(abs));

  return {
    debtorDir,
    txtPath,
    closedOverrides: cfg.closedInvoiceOverrides || [],
    configFound: fs.existsSync(cfgPath),
  };
}

/** Run the gate for one debtor. Returns the full result object. */
export function checkDebtor(debtorCode, txtOverride) {
  const { debtorDir, txtPath, closedOverrides, configFound } = resolveDebtorInputs(
    debtorCode,
    txtOverride,
  );
  if (!txtPath) {
    return { debtor: debtorCode, gate: 'UNVERIFIED', error: 'No DEBENQ TXT found', configFound };
  }

  const { headerBalance, balanceBf, excludesAllocationDetail, rows } = parseDebenqWithRunning(txtPath);
  const openInvoices = computeOpenInvoices(rows, closedOverrides);
  const remittanceDocs = loadRemittanceInvoiceDocs(debtorDir);
  const analysis = analyseInvoiceTagCoverage({
    rows,
    openInvoices,
    headerBalance,
    balanceBf,
    excludesAllocationDetail,
    closedOverrides,
    remittanceDocs,
  });

  return {
    debtor: debtorCode,
    generated_at: new Date().toISOString(),
    statement_txt: path.relative(ROOT, txtPath),
    config_found: configFound,
    remittance_sources: remittanceDocs.size,
    ...analysis,
  };
}

function renderMarkdown(res) {
  const L = [];
  L.push(`# ${res.debtor} — Invoice tag coverage gate`, '');
  L.push(`**Generated:** ${res.generated_at.slice(0, 10)}  `);
  L.push(`**Source:** \`${res.statement_txt}\`  `);
  L.push(`**Gate:** **${res.gate}**`, '');
  L.push(`> ${GATE_MEANING[res.gate] || ''}`, '');
  L.push('---', '', '## Summary', '');
  L.push('| Metric | Value |', '| :--- | ---: |');
  L.push(`| Export allocation detail | ${res.export_quality === 'NO_ALLOCATION_DETAIL' ? '**ABSENT**' : 'present'} |`);
  L.push(
    `| Settlement rows naming an invoice | ${res.tagging.tagged_rows} of ${res.tagging.settlement_rows}${res.tagging.tagged_pct != null ? ` (${res.tagging.tagged_pct}%)` : ''} |`,
  );
  L.push(`| Open invoices assessed | ${res.invoices.length} |`);
  if (res.counts.unassessable) {
    L.push(`| — unassessable (no allocation detail) | **${res.counts.unassessable}** |`);
  } else {
    L.push(`| — likely already paid | **${res.counts.likely_paid}** |`);
    L.push(`| — stale open (marooned behind a payment gap) | ${res.counts.stale_open} |`);
    L.push(`| — clear | ${res.counts.clear} |`);
  }
  L.push(`| Untagged credit rows | ${res.untagged_credits.length} |`);
  L.push(`| Untagged credit total | R${fmtAmount(res.untagged_credit_total)} |`);
  L.push(`| Opening BALANCE B/F | R${fmtAmount(res.balance_bf)} |`);
  L.push(`| Σ open invoices | R${fmtAmount(res.sum_open_invoices)} |`);
  if (res.header_balance != null) {
    L.push(`| ERP CURRENT BALANCE | R${fmtAmount(res.header_balance)} |`);
    L.push(`| Reconciliation gap (header − Σ open) | R${fmtAmount(res.reconciliation_gap)} |`);
  }
  L.push(`| Ratified closed (overrides) | ${res.ratified_closed.length} |`);

  L.push('', '---', '', '## Invariant', '');
  L.push(`**${res.invariant.name}** — ${res.invariant.status === 'PASS' ? 'PASS' : `**${res.invariant.status}**`}`, '');
  if (res.invariant.status === 'NOT_APPLICABLE') {
    L.push(
      'Not evaluated: with no allocation detail in the export, the open-invoice list is an artefact of missing data rather than a claim about the account, so comparing it to the ERP balance would be meaningless.',
    );
  } else if (res.invariant.status === 'BREACHED') {
    L.push(
      `The itemised list totals **R${fmtAmount(res.invariant.overstated_by)} more** than the account actually owes, which is proof that at least one listed invoice is settled in whole or part. Treat this as a lower bound: understatement elsewhere can mask most of the true error.`,
    );
  } else if (res.invariant.status === 'PASS') {
    L.push(
      'The itemised list does not exceed the ERP balance, so it is not over-stating the account in aggregate. This does not prove every individual line is correct — offsetting errors can still net out.',
    );
  } else {
    L.push('No ERP CURRENT BALANCE header found in the TXT, so the invariant could not be evaluated.');
  }

  if (res.export_quality === 'NO_ALLOCATION_DETAIL') {
    L.push('', '---', '', '## Open invoices by risk', '');
    L.push(
      `Not listed. With no allocation detail, the reconstruction returns every invoice raised in the export window (${res.invoices.length} of them, R${fmtAmount(res.sum_open_invoices)}) because nothing can ever be netted off. Listing them individually would imply a per-invoice finding that does not exist.`,
    );
  } else if (res.invoices.length) {
    L.push('', '---', '', '## Open invoices by risk', '');
    L.push('| Inv | Date | DN / ref | Due (R) | Risk | Basis |');
    L.push('| :--- | :--- | :--- | ---: | :--- | :--- |');
    const order = { LIKELY_PAID: 0, STALE_OPEN: 1, CLEAR: 2 };
    for (const inv of [...res.invoices].sort(
      (a, b) => order[a.risk] - order[b.risk] || a.iso.localeCompare(b.iso),
    )) {
      L.push(
        `| ${inv.doc} | ${displayDate(inv.iso)} | ${inv.dn} | ${fmtAmount(inv.due)} | ${inv.risk === 'CLEAR' ? 'CLEAR' : `**${inv.risk}**`} | ${inv.basis} |`,
      );
    }
  }

  if (res.untagged_credits.length) {
    L.push('', '---', '', '## Untagged credit rows', '');
    L.push('These reduce the account balance but name no invoice — the reason the open-invoice list is a hypothesis rather than a fact.', '');
    L.push('| Doc | Entry | Date | Ref | Amount (R) |');
    L.push('| :--- | :--- | :--- | :--- | ---: |');
    for (const c of res.untagged_credits) {
      L.push(`| ${c.docno} | ${c.entry} | ${displayDate(c.iso)} | ${c.dn} | ${fmtAmount(c.amount)} |`);
    }
  }

  if (res.ratified_closed.length) {
    L.push('', '---', '', '## Ratified closed invoices (excluded from open list)', '');
    L.push('| Doc | Reason |', '| :--- | :--- |');
    for (const r of res.ratified_closed) L.push(`| ${r.doc} | ${r.reason} |`);
  }

  L.push('', '---', '', '## What to do', '');
  if (res.blocking_reason) {
    L.push(REMEDY[res.blocking_reason], '');
    L.push(
      'Until resolved, do **not** send an open-invoice list or statement to this customer. The ERP CURRENT BALANCE total remains valid and safe to quote.',
    );
  } else if (res.gate === 'REVIEW_REQUIRED') {
    L.push(
      'Before any customer-facing release, check each `STALE_OPEN` invoice against the remittance advices covering the gap period. Ratify genuinely-settled invoices into `closedInvoiceOverrides`; leave genuinely-open ones as they are and note why. Internal use (collections triage, ageing trend) is fine — the account total is correct either way.',
    );
  } else {
    L.push(
      'No action. The list ties within the ERP balance and no open invoice is marooned behind a payment gap.',
    );
  }
  L.push('');
  return L.join('\n');
}

function runAll(args) {
  const results = [];
  for (const code of listDebtors()) {
    const res = checkDebtor(code);
    if (res.error) continue; // no TXT for this debtor — nothing to assess
    results.push(res);
  }

  if (args.json) {
    console.log(JSON.stringify(results, null, 2));
    if (results.some((r) => r.gate === 'BLOCKED' || r.gate === 'UNUSABLE_EXPORT')) process.exitCode = 1;
    return;
  }

  console.log('debtor   gate              tagged      open  flagged  invariant       blocking reason');
  for (const r of results) {
    const tagged = r.tagging.tagged_pct != null ? `${r.tagging.tagged_pct}%` : 'n/a';
    const flagged = r.counts.likely_paid + r.counts.stale_open + r.counts.unassessable;
    console.log(
      `${r.debtor.padEnd(8)} ${r.gate.padEnd(17)} ${tagged.padStart(6)}  ${String(r.invoices.length).padStart(8)}  ${String(flagged).padStart(7)}  ${r.invariant.status.padEnd(14)}  ${r.blocking_reason || ''}`,
    );
  }

  const byReason = new Map();
  for (const r of results.filter((x) => x.blocking_reason)) {
    byReason.set(r.blocking_reason, [...(byReason.get(r.blocking_reason) || []), r.debtor]);
  }
  const attention = results.filter((r) => r.gate !== 'ALLOWED');
  console.log(`\n${results.length} debtor(s) assessed · ${attention.length} needing attention`);
  for (const [reason, debtors] of byReason) {
    console.log(`\n${reason} — ${debtors.join(', ')}`);
    console.log(`  ${REMEDY[reason]}`);
  }
  const stale = results.filter((r) => r.counts.stale_open > 0);
  if (stale.length) {
    console.log('\nSTALE_OPEN invoices (candidate untagged settlements):');
    for (const r of stale) {
      for (const inv of r.invoices.filter((i) => i.risk === 'STALE_OPEN')) {
        console.log(`  ${r.debtor} inv ${inv.doc} (${inv.iso}, R${fmtAmount(inv.due)}) — ${inv.basis}`);
      }
    }
  }

  if (results.some((r) => r.gate === 'BLOCKED' || r.gate === 'UNUSABLE_EXPORT')) process.exitCode = 1;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.all) {
    runAll(args);
    return;
  }

  if (!args.debtor) {
    console.error('Usage: check_invoice_tag_coverage.mjs (--debtor [CODE] | --all) [--txt PATH] [--write] [--json]');
    process.exit(2);
  }

  const res = checkDebtor(args.debtor, args.txt);

  if (res.error) {
    console.error(`[${res.debtor}] ${res.error}`);
    process.exit(2);
  }

  if (args.json) {
    console.log(JSON.stringify(res, null, 2));
  } else {
    console.log(`[${res.debtor}] Invoice tag coverage: ${res.gate}${res.blocking_reason ? ` (${res.blocking_reason})` : ''}`);
    console.log(
      `[${res.debtor}] tagged=${res.tagging.tagged_rows}/${res.tagging.settlement_rows} settlement rows · open=${res.invoices.length} likely_paid=${res.counts.likely_paid} stale_open=${res.counts.stale_open} clear=${res.counts.clear} · invariant=${res.invariant.status}${res.invariant.overstated_by ? ` (over-stated by R${fmtAmount(res.invariant.overstated_by)})` : ''}`,
    );
    if (res.blocking_reason) console.log(`[${res.debtor}] ${REMEDY[res.blocking_reason]}`);
    for (const inv of res.invoices.filter((i) => i.risk === 'LIKELY_PAID' || i.risk === 'STALE_OPEN')) {
      console.log(`[${res.debtor}]   ${inv.risk} inv ${inv.doc} (${inv.iso}, R${fmtAmount(inv.due)}) — ${inv.basis}`);
    }
  }

  if (args.write) {
    const outDir = path.join(ROOT, 'analysis/debtors', res.debtor, 'reports');
    fs.mkdirSync(outDir, { recursive: true });
    const stamp = res.generated_at.slice(0, 10);
    const base = path.join(outDir, `${res.debtor}_TAG_COVERAGE_${stamp}`);
    fs.writeFileSync(`${base}.json`, `${JSON.stringify(res, null, 2)}\n`);
    fs.writeFileSync(`${base}.md`, renderMarkdown(res));
    console.log(`[${res.debtor}] Written: ${path.relative(ROOT, base)}.{json,md}`);
  }

  if (res.gate === 'BLOCKED') process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
