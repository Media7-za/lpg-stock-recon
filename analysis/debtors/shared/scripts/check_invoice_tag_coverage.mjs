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
  loadPaymentTagFalseLeads,
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
  const falseLeads = loadPaymentTagFalseLeads(debtorDir);
  const analysis = analyseInvoiceTagCoverage({
    rows,
    openInvoices,
    headerBalance,
    balanceBf,
    excludesAllocationDetail,
    closedOverrides,
    remittanceDocs,
    falseLeads,
  });

  return {
    debtor: debtorCode,
    generated_at: new Date().toISOString(),
    statement_txt: path.relative(ROOT, txtPath),
    config_found: configFound,
    remittance_sources: remittanceDocs.size,
    false_leads_registered: falseLeads.size,
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
  const pctCell = (t) =>
    `${t.tagged} of ${t.rows}${t.pct != null ? ` (${t.pct}%)` : ''}`;
  L.push(`| Export allocation detail | ${res.export_quality === 'NO_ALLOCATION_DETAIL' ? '**ABSENT**' : 'present'} |`);
  L.push(
    `| Settlement rows naming an invoice | ${res.tagging.tagged_rows} of ${res.tagging.settlement_rows}${res.tagging.tagged_pct != null ? ` (${res.tagging.tagged_pct}%)` : ''} |`,
  );
  L.push(`| — Crd Note rows tagged *(broadly canonical)* | ${pctCell(res.tagging.credit_note)} |`);
  L.push(`| — Payment rows tagged *(not authoritative)* | ${pctCell(res.tagging.payment)} |`);
  L.push(`| Evidence basis | **${res.evidence.basis}** |`);
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
  L.push(
    '',
    'The two tagging rows are not equivalent. ERP tags Crd Notes to their originating invoice as a matter of course (CYL deposit / empty-return credits especially), so that percentage is meaningful evidence. ERP payment allocation is historically broken (`business_rules.md` §3) — a high payment percentage is not reassurance, and a low one is not necessarily an error. Authority over whether an invoice is settled rests with the allocation lane, never with this column.',
  );

  L.push('', '### Checks that ran', '');
  if (res.evidence.basis === 'REMITTANCE_BACKED') {
    L.push(
      `**REMITTANCE_BACKED** — ${res.evidence.remittance_invoice_docs} invoice numbers were read from this account's extracted remittance lines, so the open list was tested against the customer's own record of what they paid. That is the strongest check available here.`,
    );
  } else {
    L.push(
      `**PATTERN_ONLY** — ${res.evidence.note}`,
      '',
      'Concretely: the remittance-contradiction check did **not** run on this account, so a clean result below rests on arithmetic (the invariant) and an anomaly heuristic (staleness) alone. Neither can detect a settled invoice whose credit was untagged *and* whose absence does not break the account total. Establishing settlement here requires the pattern route — exact-sum month tests, the account’s established payment cadence, the business rules for that payer type, and operator ratification recorded in config.',
    );
  }

  L.push('', '---', '', '## Payment tag integrity (D21)', '');
  const pti = res.payment_tag_integrity;
  if (!pti) {
    L.push('_Not evaluated._', '');
  } else {
    L.push(
      `**Status:** ${pti.status === 'PASS' ? 'PASS' : `**${pti.status}**`}  `,
      `**False leads registered:** ${pti.false_leads_loaded}  `,
      `**Chronology violations:** ${pti.chronology_violations} (${pti.chronology_violations_recorded} already ruled on, **${pti.chronology_violations_unrecorded} unrecorded**)`,
      '',
      '`INVNO_TAG_CHRONOLOGY` — a settlement row naming an invoice dated *after* it cannot be paying that invoice; it is a prepay or placeholder pointer. This is derived from the TXT, not read from config, so it catches violations nobody has recorded yet.',
      '',
    );

    if (pti.unrecorded.length) {
      L.push(
        '### Unrecorded chronology violations',
        '',
        'Each needs a ruling. If confirmed a false lead, append it to `config/payment_tag_false_leads.json` so it survives regeneration — a decision made only in a session does not.',
        '',
        '| Settlement | Type | Settled | Tags invoice | Invoice dated | Days early | Amount |',
        '| :--- | :--- | :--- | :--- | :--- | ---: | ---: |',
      );
      for (const v of pti.unrecorded) {
        L.push(
          `| ${v.settlement_doc} | ${v.settlement_entry} | ${displayDate(v.settlement_iso)} | ${v.tagged_invno} | ${displayDate(v.invoice_iso)} | ${v.days_early} | R${fmtAmount(v.amount)} |`,
        );
      }
      L.push('');
    }

    if (pti.closed_on_false_tag.length) {
      L.push(
        '### Closed on a false tag — blocking',
        '',
        'These invoices are carried as settled via `closedInvoiceOverrides`, but the account has already ratified the underlying tag as false.',
        '',
        '| Invoice | Classification | Ratified | Reason |',
        '| :--- | :--- | :--- | :--- |',
      );
      for (const f of pti.closed_on_false_tag) {
        L.push(
          `| ${f.invno} | ${f.classification ?? '—'} | ${f.ratified_at ?? '—'} | ${(f.reason ?? '—').replace(/\|/g, '\\|')} |`,
        );
      }
      L.push('');
    }

    if (pti.false_lead_contradicted_by_remittance.length) {
      L.push(
        '### Tripwire fired — remittance contradicts a ratified false lead',
        '',
        'A remittance outranks tag chronology (authority order A), so the false-lead entry is what must be reopened — not the remittance.',
        '',
        '| Invoice | Recorded reason | Tripwire as written |',
        '| :--- | :--- | :--- |',
      );
      for (const f of pti.false_lead_contradicted_by_remittance) {
        L.push(
          `| ${f.invno} | ${(f.reason ?? '—').replace(/\|/g, '\\|')} | ${(f.tripwire ?? '—').replace(/\|/g, '\\|')} |`,
        );
      }
      L.push('');
    }

    if (pti.status === 'PASS') {
      L.push(
        pti.false_leads_loaded
          ? 'No unrecorded chronology violation, no closure resting on a ratified false lead, and no remittance contradicting one.'
          : 'No chronology violation found. No false-lead registry exists for this account, so the registry check was inert — absence of recorded false leads is not evidence there are none.',
        '',
      );
    }
  }

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

/**
 * Console rendering of the D21 payment-tag-integrity result.
 *
 * Separate from renderMarkdown because the written report is not the only place
 * the gate has to be legible. An unrecorded chronology violation is one of the
 * two conditions that set the gate to REVIEW_REQUIRED, so an account with zero
 * STALE_OPEN invoices and one bad tag used to print REVIEW_REQUIRED with nothing
 * on screen explaining why. PASS is printed too: a gate that says nothing when
 * it is satisfied is indistinguishable from a gate that never ran.
 */
export function d21ConsoleLines(res) {
  const pti = res.payment_tag_integrity;
  if (!pti) return [`[${res.debtor}] d21=NOT_EVALUATED — payment tag integrity was not assessed`];

  const lines = [
    `[${res.debtor}] d21=${pti.status} — chronology violations ${pti.chronology_violations} (${pti.chronology_violations_recorded} ruled on, ${pti.chronology_violations_unrecorded} unrecorded) · false leads registered ${pti.false_leads_loaded}${pti.false_leads_loaded ? '' : ' (registry check inert)'}`,
  ];
  for (const v of pti.unrecorded) {
    lines.push(
      `[${res.debtor}]   INVNO_TAG_CHRONOLOGY ${v.settlement_entry} ${v.settlement_doc} (${v.settlement_iso}, R${fmtAmount(v.amount)}) tags inv ${v.tagged_invno} dated ${v.invoice_iso} — ${v.days_early} day(s) early`,
    );
  }
  if (pti.unrecorded.length) {
    lines.push(
      `[${res.debtor}]   Each needs a ruling. Confirmed false leads belong in config/payment_tag_false_leads.json — a decision made only in a session does not survive regeneration.`,
    );
  }
  for (const f of pti.closed_on_false_tag) {
    lines.push(
      `[${res.debtor}]   INVOICE_CLOSED_ON_FALSE_TAG inv ${f.invno} is carried as settled via closedInvoiceOverrides, but its tag is a ratified false lead`,
    );
  }
  for (const f of pti.false_lead_contradicted_by_remittance) {
    lines.push(
      `[${res.debtor}]   FALSE_LEAD_CONTRADICTED_BY_REMITTANCE inv ${f.invno} — a remittance outranks tag chronology; reopen the false-lead entry, not the remittance`,
    );
  }
  return lines;
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
    if (results.some((r) => r.gate === 'BLOCKED' || r.gate === 'NOT_DERIVABLE_FROM_TXT')) process.exitCode = 1;
    return;
  }

  console.log('debtor   gate                    cn-tag  pay-tag  evidence          open  flagged  invariant       d21       bad-tags  blocking reason');
  for (const r of results) {
    const pct = (t) => (t.pct != null ? `${t.pct}%` : 'n/a');
    const flagged = r.counts.likely_paid + r.counts.stale_open + r.counts.unassessable;
    const pti = r.payment_tag_integrity;
    console.log(
      `${r.debtor.padEnd(8)} ${r.gate.padEnd(23)} ${pct(r.tagging.credit_note).padStart(6)}  ${pct(r.tagging.payment).padStart(6)}  ${r.evidence.basis.padEnd(16)}  ${String(r.invoices.length).padStart(4)}  ${String(flagged).padStart(7)}  ${r.invariant.status.padEnd(14)}  ${(pti?.status ?? 'n/a').padEnd(8)}  ${String(pti?.chronology_violations_unrecorded ?? 0).padStart(8)}  ${r.blocking_reason || ''}`,
    );
  }

  const byReason = new Map();
  for (const r of results.filter((x) => x.blocking_reason)) {
    byReason.set(r.blocking_reason, [...(byReason.get(r.blocking_reason) || []), r.debtor]);
  }
  // NOT_DERIVABLE_FROM_TXT is a scope statement, not a fault — counting those
  // accounts as "needing attention" would misrepresent a deliberate posture as
  // a backlog of nine broken accounts.
  const contradicted = results.filter((r) => r.gate === 'BLOCKED' || r.gate === 'REVIEW_REQUIRED');
  const notDerivable = results.filter((r) => r.gate === 'NOT_DERIVABLE_FROM_TXT');
  const patternOnly = results.filter((r) => r.evidence.basis === 'PATTERN_ONLY');
  console.log(
    `\n${results.length} debtor(s) assessed · ${contradicted.length} with a contradicted open list · ${notDerivable.length} not derivable from the TXT (invoice-level view belongs to the allocation lane)`,
  );
  if (patternOnly.length) {
    console.log(
      `\n${patternOnly.length} of ${results.length} account(s) are PATTERN_ONLY — no extracted remittance lines, so the remittance-contradiction check did not run: ${patternOnly.map((r) => r.debtor).join(', ')}`,
    );
    console.log(
      '  Settlement claims on these accounts rest on payment patterns, business rules and operator ratification (business_rules.md §15 authority order B). A clean gate here is a weaker statement than on a REMITTANCE_BACKED account.',
    );
  }
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

  const badTags = results.filter((r) => (r.payment_tag_integrity?.chronology_violations_unrecorded ?? 0) > 0);
  if (badTags.length) {
    const total = badTags.reduce((n, r) => n + r.payment_tag_integrity.chronology_violations_unrecorded, 0);
    console.log(
      `\nUnrecorded chronology violations (D21) — ${total} across ${badTags.length} account(s). A settlement row naming an invoice dated after it is a prepay or placeholder pointer, not a payment of that invoice:`,
    );
    for (const r of badTags) {
      for (const v of r.payment_tag_integrity.unrecorded) {
        console.log(
          `  ${r.debtor} ${v.settlement_entry} ${v.settlement_doc} (${v.settlement_iso}, R${fmtAmount(v.amount)}) tags inv ${v.tagged_invno} dated ${v.invoice_iso} — ${v.days_early} day(s) early`,
        );
      }
    }
    console.log(
      '  Each needs a ruling recorded in the account\'s config/payment_tag_false_leads.json. Derived from the TXT, so this list reappears until ruled on.',
    );
  }

  if (results.some((r) => r.gate === 'BLOCKED' || r.gate === 'NOT_DERIVABLE_FROM_TXT')) process.exitCode = 1;
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
      `[${res.debtor}] tagged: cn=${res.tagging.credit_note.tagged}/${res.tagging.credit_note.rows} pay=${res.tagging.payment.tagged}/${res.tagging.payment.rows} · open=${res.invoices.length} likely_paid=${res.counts.likely_paid} stale_open=${res.counts.stale_open} clear=${res.counts.clear} · invariant=${res.invariant.status}${res.invariant.overstated_by ? ` (over-stated by R${fmtAmount(res.invariant.overstated_by)})` : ''}`,
    );
    console.log(`[${res.debtor}] evidence=${res.evidence.basis}${res.evidence.note ? ` — ${res.evidence.note}` : ` (${res.evidence.remittance_invoice_docs} invoice docs on remittance advices)`}`);
    for (const line of d21ConsoleLines(res)) console.log(line);
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
