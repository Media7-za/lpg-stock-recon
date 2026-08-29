#!/usr/bin/env node
/**
 * Generate a customer-facing Statement of Account (opening balance, ageing,
 * open invoices) for any debtor directly from ERP DEBENQ TXT exports.
 * No DATABASE_URL required — pure TXT parsing.
 *
 * Usage:
 *   node analysis/debtors/shared/scripts/generate_statement_of_account.mjs \
 *     --debtor [CODE] [--as-at YYYY-MM-DD] [--pdf] [--force]
 *
 * Immutable snapshot (collections gate / finance sign-off / customer send):
 *   ... --snapshot [--snapshot-version v1] [--pdf] [--also-live]
 *   Writes to analysis/debtors/[CODE]/snapshots/[YYYY-MM-DD]_vN/ with archived
 *   TXT + config, versioned .md/.pdf, manifest.json (sha256), and provenance.
 *
 * Live drafts (internal reconciliation) omit --snapshot and overwrite
 * reports/[CODE]_Statement_of_Account.md.
 *
 * Config: analysis/debtors/[CODE]/config/statement_of_account.json
 *   (template: analysis/debtors/shared/templates/statement_of_account_config.template.json)
 *
 * This captures the repeatable customer-statement playbook first run
 * interactively for TWK002 on 2026-08-10: parse open invoices from the
 * primary DEBENQ TXT, roll up any linked site-code balances, bucket ageing
 * off invoice date, and emit the same layout as
 * TWK002_Statement_of_Account.md. See
 * .agents/skills/SKILL_Debtor_Customer_Statement_From_TXT.md.
 *
 * Before writing, the invoice-tag coverage gate runs over the open-invoice
 * list (see debenq_open_invoices.mjs). A BLOCKED gate aborts the run: it means
 * an invoice the customer has already paid by remittance is about to be billed
 * again. `--force` overrides, and should only be used with a reason recorded.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import {
  round2,
  displayDate,
  fmtAmount,
  normDoc,
  parseDebenqWithRunning,
  computeOpenInvoices,
  computeOpenLpgInvoices,
  analyseInvoiceTagCoverage,
  analyseLpgOpenCoverage,
  loadRemittanceInvoiceDocs,
  GATE_MEANING,
  REMEDY,
} from './debenq_open_invoices.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

function parseArgs(argv) {
  const args = {
    asAt: null,
    pdf: false,
    force: false,
    snapshot: false,
    snapshotVersion: null,
    alsoLive: false,
  };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--as-at') args.asAt = argv[++i];
    else if (argv[i] === '--pdf') args.pdf = true;
    else if (argv[i] === '--force') args.force = true;
    else if (argv[i] === '--snapshot') args.snapshot = true;
    else if (argv[i] === '--snapshot-version') args.snapshotVersion = argv[++i];
    else if (argv[i] === '--also-live') args.alsoLive = true;
    else if (argv[i] === '--debtor') args.debtor = argv[++i];
  }
  return args;
}

function sha256File(absPath) {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(absPath));
  return hash.digest('hex');
}

function fileMeta(absPath, relFromRoot) {
  const st = fs.statSync(absPath);
  return {
    path: relFromRoot,
    modified: st.mtime.toISOString(),
    sha256: sha256File(absPath),
    bytes: st.size,
  };
}

function gitHead() {
  const res = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', cwd: ROOT });
  if (res.status !== 0) return null;
  return res.stdout.trim() || null;
}

function formatGeneratedSast(date = new Date()) {
  return date.toLocaleString('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function normalizeSnapshotVersion(raw) {
  const v = String(raw || 'v1').trim();
  return v.startsWith('v') ? v : `v${v}`;
}

function nextSnapshotVersion(snapshotsRoot, asAtIso, requested) {
  if (requested) return normalizeSnapshotVersion(requested);
  let n = 1;
  if (fs.existsSync(snapshotsRoot)) {
    const re = new RegExp(`^${asAtIso.replace(/[-]/g, '\\-')}_v(\\d+)$`);
    for (const name of fs.readdirSync(snapshotsRoot)) {
      const m = name.match(re);
      if (m) n = Math.max(n, Number(m[1]) + 1);
    }
  }
  return `v${n}`;
}

function copyIntoSnapshot(absSrc, absDest) {
  fs.mkdirSync(path.dirname(absDest), { recursive: true });
  fs.copyFileSync(absSrc, absDest);
}

function relPath(absPath) {
  return path.relative(ROOT, absPath).split(path.sep).join('/');
}

function archiveSnapshotInputs({
  debtorCode,
  cfg,
  cfgPath,
  asAtIso,
  snapshotVersion,
}) {
  const snapshotsRoot = path.join(ROOT, 'analysis/debtors', debtorCode, 'snapshots');
  const snapshotId = `${asAtIso}_${snapshotVersion}`;
  const snapshotDir = path.join(snapshotsRoot, snapshotId);
  fs.mkdirSync(snapshotDir, { recursive: true });

  const archivedConfig = path.join(snapshotDir, 'statement_of_account.json');
  copyIntoSnapshot(cfgPath, archivedConfig);

  const archivedPrimary = path.join(snapshotDir, path.basename(cfg.primaryTxt));
  const primaryAbs = path.join(ROOT, cfg.primaryTxt);
  copyIntoSnapshot(primaryAbs, archivedPrimary);

  const archivedSites = {};
  for (const [code, rel] of Object.entries(cfg.siteTxts || {})) {
    const src = path.join(ROOT, rel);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(snapshotDir, path.basename(rel));
    copyIntoSnapshot(src, dest);
    archivedSites[code] = relPath(dest);
  }

  return {
    snapshotId,
    snapshotDir,
    baseName: `${debtorCode}_Statement_of_Account_${asAtIso}_${snapshotVersion}`,
    inputs: {
      config: archivedConfig,
      primaryTxt: archivedPrimary,
      siteTxts: archivedSites,
    },
  };
}

function buildProvenanceSection(meta) {
  const lines = [
    '---',
    '',
    '## Record provenance',
    '',
    '| Field | Value |',
    '| :--- | :--- |',
    `| **Generated** | ${meta.generatedSast} SAST |`,
    `| **Statement as-at** | ${meta.statementAsAt} |`,
    `| **Ageing as-at** | ${meta.ageingAsAt} (last day of prior month) |`,
    `| **Data source** | \`${meta.primaryTxt.path}\` · modified ${meta.primaryTxt.modified.slice(0, 10)} · sha256 \`${meta.primaryTxt.sha256.slice(0, 16)}…\` |`,
    `| **Config** | \`${meta.config.path}\` · sha256 \`${meta.config.sha256.slice(0, 16)}…\` |`,
    `| **Repository commit** | ${meta.gitCommit ?? '— (not a git checkout)'} |`,
    `| **Invoice tag gate** | ${meta.gate.status} · ${meta.gate.basis} |`,
    `| **Customer due basis** | ${meta.customerDueBasis} |`,
    `| **Account-level on document** | ${meta.hideAccountLevel ? 'hidden (internal bridge only)' : 'shown'} |`,
    `| **Snapshot id** | \`${meta.snapshotId}\` |`,
    '',
    meta.ruleNote,
    '',
  ];
  return lines;
}

function loadConfig(debtorCode) {
  const cfgPath = path.join(
    ROOT,
    'analysis/debtors',
    debtorCode,
    'config/statement_of_account.json',
  );
  if (!fs.existsSync(cfgPath)) {
    throw new Error(
      `Missing config: ${cfgPath}\n` +
        'Copy analysis/debtors/shared/templates/statement_of_account_config.template.json ' +
        `into analysis/debtors/${debtorCode}/config/statement_of_account.json and fill it in.`,
    );
  }
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  // Back-compat: TWK002's original config used a bespoke `twkReference` field.
  cfg.referenceLabel = cfg.referenceLabel || 'Reference';
  cfg.referenceValue = cfg.referenceValue || cfg.twkReference || '';
  cfg.closedInvoiceOverrides = cfg.closedInvoiceOverrides || [];
  cfg.balanceBridgeLines = cfg.balanceBridgeLines || [];
  // Opt-in presentation override: collapse the itemised account-level bridge
  // lines into a single "Opening balance" style row on the customer-facing
  // statement, while still computing/validating the itemised lines
  // internally against config so the detail isn't lost — just not exposed.
  cfg.collapseAccountLevelAsOpeningBalance = cfg.collapseAccountLevelAsOpeningBalance || false;
  cfg.collapsedAccountLevelLabel = cfg.collapsedAccountLevelLabel || 'Opening balance (pre-existing, not itemised below)';
  // customerDueBasis:
  //   erp_header (default) — Amount due = ERP CURRENT BALANCE (+ sites)
  //   open_invoices — Amount due = Σ open invoice Due only; account-level
  //     residual stays internal (bridge still validated in config)
  cfg.customerDueBasis = cfg.customerDueBasis || 'erp_header';
  cfg.hideAccountLevelSection =
    cfg.hideAccountLevelSection ?? cfg.customerDueBasis === 'open_invoices';
  return cfg;
}

function reportTagCoverage(debtorCode, cov) {
  if (cov.gate === 'ALLOWED') {
    console.log(
      `[${debtorCode}] Invoice tag coverage: ALLOWED (${cov.counts.clear} open invoices, all clear) · evidence=${cov.evidence.basis}`,
    );
    // A clean gate on a PATTERN_ONLY account did not consult the customer's own
    // records, because there are none to consult. The operator has to know that
    // before deciding whether to send an itemised table or only the balance.
    if (cov.evidence.basis === 'PATTERN_ONLY') {
      console.warn(
        `[${debtorCode}] NOTE: no remittance advices for this account, so the remittance-contradiction check did not run — this ALLOWED rests on the invariant and the staleness heuristic only. See business_rules.md §15 authority order B.`,
      );
    }
    return;
  }
  console.warn(`[${debtorCode}] Invoice tag coverage: ${cov.gate} · evidence=${cov.evidence.basis}`);
  console.warn(`[${debtorCode}] ${GATE_MEANING[cov.gate]}`);
  if (cov.blocking_reason) console.warn(`[${debtorCode}] REMEDY: ${REMEDY[cov.blocking_reason]}`);
  if (cov.invariant.status === 'BREACHED') {
    console.warn(
      `[${debtorCode}]   INVARIANT BREACHED — Σ(open invoices) exceeds the ERP balance by R${fmtAmount(cov.invariant.overstated_by)}`,
    );
  }
  for (const inv of cov.invoices) {
    if (inv.risk === 'CLEAR') continue;
    console.warn(
      `[${debtorCode}]   ${inv.risk} inv ${inv.doc} (${inv.iso}, R${fmtAmount(inv.due)}) — ${inv.basis}`,
    );
  }
  console.warn(
    `[${debtorCode}] Full detail: node analysis/debtors/shared/scripts/check_invoice_tag_coverage.mjs --debtor ${debtorCode} --write`,
  );
}

function openingBalanceForMonth(rows, monthStartIso) {
  const before = rows.filter((r) => r.iso < monthStartIso);
  if (!before.length) return null;
  before.sort((a, b) => a.iso.localeCompare(b.iso));
  return before[before.length - 1].runningBalance;
}

function ageBucket(days) {
  if (days <= 30) return 'current';
  if (days <= 60) return 'd30';
  if (days <= 90) return 'd60';
  if (days <= 120) return 'd90';
  return 'd120';
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const debtorCode = args.debtor || 'TWK002';
  const cfgPath = path.join(ROOT, 'analysis/debtors', debtorCode, 'config/statement_of_account.json');
  const cfg = loadConfig(debtorCode);

  const asAt = args.asAt ? new Date(`${args.asAt}T12:00:00`) : new Date();
  const asAtIso = asAt.toISOString().slice(0, 10);
  const monthStartIso = `${asAtIso.slice(0, 7)}-01`;
  // Ageing is reported as at the last date of the prior month (i.e. the
  // month-end the statement is drawn for), not the statement-run date.
  const ageAsAt = new Date(new Date(`${monthStartIso}T12:00:00`).getTime() - 86400000);

  const generatedAt = new Date();
  let snapshotCtx = null;
  if (args.snapshot) {
    const snapshotsRoot = path.join(ROOT, 'analysis/debtors', debtorCode, 'snapshots');
    const snapshotVersion = nextSnapshotVersion(
      snapshotsRoot,
      asAtIso,
      args.snapshotVersion,
    );
    snapshotCtx = archiveSnapshotInputs({
      debtorCode,
      cfg: JSON.parse(fs.readFileSync(cfgPath, 'utf8')),
      cfgPath,
      asAtIso,
      snapshotVersion,
    });
    console.log(
      `[${debtorCode}] Snapshot mode: ${snapshotCtx.snapshotId} → ${relPath(snapshotCtx.snapshotDir)}`,
    );
  }

  const cfgForRun = snapshotCtx
    ? JSON.parse(fs.readFileSync(snapshotCtx.inputs.config, 'utf8'))
    : cfg;
  const primaryPath = snapshotCtx ? snapshotCtx.inputs.primaryTxt : path.join(ROOT, cfg.primaryTxt);
  const {
    headerBalance: primaryHeader,
    balanceBf: primaryBf,
    excludesAllocationDetail,
    rows: primaryRows,
  } = parseDebenqWithRunning(primaryPath);

  const useLpgStripped = cfgForRun.openInvoiceModel === 'lpg_stripped';
  const openInvoices = useLpgStripped
    ? computeOpenLpgInvoices(primaryRows, cfgForRun.closedInvoiceOverrides)
    : computeOpenInvoices(primaryRows, cfgForRun.closedInvoiceOverrides);
  const openingBalance = openingBalanceForMonth(primaryRows, monthStartIso);

  // Invoice-tag coverage gate — never bill a customer for an invoice their own
  // remittance advice says they already paid. See debenq_open_invoices.mjs.
  const tagCoverage = useLpgStripped
    ? analyseLpgOpenCoverage({
        rows: primaryRows,
        openInvoices,
        headerBalance: primaryHeader,
        closedOverrides: cfgForRun.closedInvoiceOverrides,
        ratifiedAllocation: Boolean(cfgForRun.allocationGate?.status === 'RATIFIED'),
      })
    : analyseInvoiceTagCoverage({
        rows: primaryRows,
        openInvoices,
        headerBalance: primaryHeader,
        balanceBf: primaryBf,
        excludesAllocationDetail,
        closedOverrides: cfgForRun.closedInvoiceOverrides,
        remittanceDocs: loadRemittanceInvoiceDocs(path.join(ROOT, 'analysis/debtors', debtorCode)),
      });
  reportTagCoverage(debtorCode, tagCoverage);
  if ((tagCoverage.gate === 'BLOCKED' || tagCoverage.gate === 'NOT_DERIVABLE_FROM_TXT') && !args.force) {
    console.error(
      `[${debtorCode}] ABORTED — statement not written. Resolve the invoices above, or re-run with --force if you have a recorded reason.`,
    );
    process.exitCode = 1;
    return;
  }

  // Site roll-up (balances only — no invoice-level detail expected once cleared)
  const siteBalances = [];
  for (const [code, rel] of Object.entries(cfgForRun.siteTxts || {})) {
    const abs = snapshotCtx?.inputs.siteTxts[code] ?? path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    const { headerBalance } = parseDebenqWithRunning(abs);
    siteBalances.push({ code, headerBalance });
  }

  const siteTotal = round2(siteBalances.reduce((s, x) => s + x.headerBalance, 0));
  const totalDue = round2(primaryHeader + siteTotal);
  const movementThisMonth =
    openingBalance != null ? round2(primaryHeader - openingBalance) : null;

  // Ageing buckets from open invoice due only — no silent dump into 120-day.
  // Account-level balance (header − Σ open invoices, plus site adjustments) is
  // shown explicitly in its own section; see balanceBridgeLines in config.
  const buckets = { current: 0, d30: 0, d60: 0, d90: 0, d120: 0 };
  let sumOpenInvoices = 0;
  for (const inv of openInvoices) {
    const invDate = new Date(`${inv.iso}T12:00:00`);
    const days = Math.floor((ageAsAt - invDate) / 86400000);
    buckets[ageBucket(days)] = round2(buckets[ageBucket(days)] + inv.due);
    sumOpenInvoices = round2(sumOpenInvoices + inv.due);
  }

  // Partial allocations ratified via openInvoiceAdjustments (e.g. LIFO remainder).
  for (const adj of cfgForRun.openInvoiceAdjustments || []) {
    const doc = normDoc(adj.doc);
    const inv = openInvoices.find((i) => normDoc(i.doc || i.key) === doc);
    if (inv) inv.due = round2(Number(adj.due));
  }
  sumOpenInvoices = round2(openInvoices.reduce((s, inv) => s + inv.due, 0));
  for (const k of Object.keys(buckets)) buckets[k] = 0;
  for (const inv of openInvoices) {
    const invDate = new Date(`${inv.iso}T12:00:00`);
    const days = Math.floor((ageAsAt - invDate) / 86400000);
    buckets[ageBucket(days)] = round2(buckets[ageBucket(days)] + inv.due);
  }
  const accountLevelTotal = round2(totalDue - sumOpenInvoices);

  // Bridge lines: config first, else one auto line.
  // when not already present in config (they also appear in Account summary).
  const bridgeLines = [...(cfgForRun.balanceBridgeLines || [])];
  if (!bridgeLines.length && accountLevelTotal !== 0) {
    bridgeLines.push({
      label: 'Account-level balance (not on open invoices below)',
      amount: accountLevelTotal,
      reference: 'ERP running balance minus Σ open invoice Due — ratify in config/balanceBridgeLines',
    });
  }
  for (const s of siteBalances) {
    if (s.headerBalance === 0) continue;
    const id = `site_${s.code.toLowerCase()}`;
    if (bridgeLines.some((l) => l.id === id || l.label?.includes(s.code))) continue;
    bridgeLines.push({
      id,
      label: `${s.code} site adjustment`,
      amount: s.headerBalance,
      reference: 'Linked ERP site code balance included in combined Balance due',
    });
  }
  const bridgeSum = round2(bridgeLines.reduce((s, l) => s + l.amount, 0));
  if (Math.abs(bridgeSum - accountLevelTotal) > 0.05) {
    console.warn(
      `[${debtorCode}] WARNING: balanceBridgeLines sum R${fmtAmount(bridgeSum)} ≠ account-level R${fmtAmount(accountLevelTotal)} — check config/statement_of_account.json`,
    );
  }

  const asAtLabel = asAt.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const monthLabel = asAt.toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' });
  const ageAsAtLabel = ageAsAt.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const fmt = fmtAmount;
  const customerDueBasis = cfgForRun.customerDueBasis || 'erp_header';
  const hideAccountLevel = cfgForRun.hideAccountLevelSection ?? customerDueBasis === 'open_invoices';
  const customerAmountDue =
    customerDueBasis === 'open_invoices' ? sumOpenInvoices : totalDue;

  const lines = [];
  lines.push('# Statement of Account', '');
  cfgForRun.businessHeader.forEach((h, i) => {
    lines.push(i === 0 ? `**${h}**  ` : `${h}  `);
  });
  lines.push('', '---', '');
  lines.push(`**To:** ${cfgForRun.customerName}  `);
  lines.push(`**Account:** ${debtorCode}  `);
  if (cfgForRun.referenceValue) {
    lines.push(`**${cfgForRun.referenceLabel}:** ${cfgForRun.referenceValue}  `);
  }
  lines.push(`**Statement date:** ${asAtLabel}  `);
  lines.push('', '---', '', '## Account summary', '');
  lines.push('| | Amount (R) |');
  lines.push('| :--- | ---: |');
  if (customerDueBasis === 'open_invoices') {
    lines.push(`| Open invoices (detailed below) | ${fmt(sumOpenInvoices)} |`);
    lines.push(`| **Amount due** | **${fmt(customerAmountDue)}** |`);
  } else {
    if (openingBalance != null) {
      lines.push(`| **Opening balance** (1 ${monthLabel}) | ${fmt(openingBalance)} |`);
      lines.push(`| Movement this month (invoices, payments, journals) | ${fmt(movementThisMonth)} |`);
    }
    lines.push(`| ${debtorCode} balance | ${fmt(primaryHeader)} |`);
    for (const s of siteBalances) {
      lines.push(`| ${s.code} adjustment | ${fmt(s.headerBalance)} |`);
    }
    lines.push(`| **Balance due** | **${fmt(totalDue)}** |`);
  }
  lines.push('', '---', '', '## Aged balance — open invoices', '');
  lines.push('Age is calculated from **invoice date** to ' + ageAsAtLabel + '.', '');
  lines.push('| Current | 30 day | 60 day | 90 day | 120+ day | **Subtotal** |');
  lines.push('| ---: | ---: | ---: | ---: | ---: | ---: |');
  lines.push(
    `| ${fmt(buckets.current)} | ${fmt(buckets.d30)} | ${fmt(buckets.d60)} | ${fmt(buckets.d90)} | ${fmt(buckets.d120)} | **${fmt(sumOpenInvoices)}** |`,
  );
  if (!hideAccountLevel) {
    lines.push('', '---', '', '## Account-level balance', '');
    const acctLevelNote = siteBalances.length
      ? 'Debt not attributable to the open invoice lines below (opening carry, untagged settlements, site adjustments).'
      : 'Debt not attributable to the open invoice lines below (opening carry, untagged settlements).';
    lines.push(acctLevelNote, '');
    lines.push('| | Amount (R) |');
    lines.push('| :--- | ---: |');
    if (cfgForRun.collapseAccountLevelAsOpeningBalance) {
      lines.push(`| ${cfgForRun.collapsedAccountLevelLabel} | ${fmt(bridgeSum)} |`);
    } else {
      for (const line of bridgeLines) {
        lines.push(`| ${line.label} | ${fmt(line.amount)} |`);
      }
    }
    lines.push(`| **Account-level subtotal** | **${fmt(bridgeSum)}** |`);
    lines.push(`| Open invoice subtotal (aged table above) | ${fmt(sumOpenInvoices)} |`);
    lines.push(`| **Balance due** | **${fmt(totalDue)}** |`);
  }
  lines.push('', '---', '', '## Open invoices', '');
  lines.push('| Inv | Inv date | DN / ref | **Due (R)** |');
  lines.push('| :--- | :--- | :--- | ---: |');
  for (const inv of openInvoices) {
    lines.push(`| ${inv.docno.replace(/^0+/, '') || inv.docno} | ${displayDate(inv.iso)} | ${inv.dn} | ${fmt(inv.due)} |`);
  }

  if (snapshotCtx) {
    const ruleParts = [
      'Model B settlement doctrine applied.',
      cfgForRun.collapseAccountLevelAsOpeningBalance
        ? 'Account-level residual collapsed per config when shown.'
        : null,
      hideAccountLevel
        ? `Customer amount due = open invoices only; internal bridge R${fmt(bridgeSum)} not on customer document.`
        : null,
    ].filter(Boolean);
    lines.push('', ...buildProvenanceSection({
        generatedSast: formatGeneratedSast(generatedAt),
        statementAsAt: asAtLabel,
        ageingAsAt: ageAsAtLabel,
        primaryTxt: fileMeta(primaryPath, relPath(primaryPath)),
        config: fileMeta(snapshotCtx.inputs.config, relPath(snapshotCtx.inputs.config)),
        gitCommit: gitHead(),
        gate: { status: tagCoverage.gate, basis: tagCoverage.evidence.basis },
        customerDueBasis,
        hideAccountLevel,
        snapshotId: snapshotCtx.snapshotId,
        ruleNote: `*Rule:* ${ruleParts.join(' ')}`,
      }),
    );
  }

  const liveOutDir = path.join(ROOT, cfg.outputDir);
  const outDir = snapshotCtx ? snapshotCtx.snapshotDir : liveOutDir;
  fs.mkdirSync(outDir, { recursive: true });
  const mdBaseName = snapshotCtx ? snapshotCtx.baseName : cfg.outputBaseName;
  const mdPath = path.join(outDir, `${mdBaseName}.md`);
  const mdBody = lines.join('\n');
  fs.writeFileSync(mdPath, mdBody);
  console.log(`[${debtorCode}] Statement written: ${mdPath}`);

  if (snapshotCtx && args.alsoLive) {
    const liveMdPath = path.join(liveOutDir, `${cfg.outputBaseName}.md`);
    fs.mkdirSync(liveOutDir, { recursive: true });
    fs.writeFileSync(liveMdPath, mdBody);
    console.log(`[${debtorCode}] Live draft also updated: ${liveMdPath}`);
  }
  if (customerDueBasis === 'open_invoices') {
    console.log(
      `[${debtorCode}] Customer amount due: R${fmt(customerAmountDue)} (open invoices only; ERP header R${fmt(totalDue)}, internal residual R${fmt(bridgeSum)})`,
    );
  } else {
    console.log(
      `[${debtorCode}] Balance due: R${fmt(totalDue)} (open R${fmt(sumOpenInvoices)} + account-level R${fmt(bridgeSum)})`,
    );
  }

  if (args.pdf) {
    const stylesheet = path.join(ROOT, cfgForRun.pdfStylesheet || cfg.pdfStylesheet);
    const res = spawnSync(
      'npx',
      ['md-to-pdf', mdPath, '--stylesheet', stylesheet],
      { cwd: outDir, stdio: 'inherit' },
    );
    const pdfPath = mdPath.replace(/\.md$/, '.pdf');
    if (res.status !== 0) {
      console.error(`[${debtorCode}] PDF generation failed (exit ${res.status})`);
      process.exitCode = 1;
    } else {
      console.log(`[${debtorCode}] PDF written: ${pdfPath}`);
    }

    if (snapshotCtx && res.status === 0) {
      const manifest = {
        schemaVersion: '1.0',
        debtorCode,
        snapshotId: snapshotCtx.snapshotId,
        generatedAt: generatedAt.toISOString(),
        generatedAtSast: formatGeneratedSast(generatedAt),
        statementAsAt: asAtIso,
        ageingAsAt: ageAsAt.toISOString().slice(0, 10),
        gitCommit: gitHead(),
        gate: {
          status: tagCoverage.gate,
          basis: tagCoverage.evidence.basis,
          openInvoiceCount: tagCoverage.counts?.clear ?? openInvoices.length,
        },
        amounts: {
          erpHeader: primaryHeader,
          openInvoices: sumOpenInvoices,
          accountLevel: bridgeSum,
          customerAmountDue: customerAmountDue,
          customerDueBasis,
          siteTotal,
        },
        presentation: {
          hideAccountLevelSection: hideAccountLevel,
          collapseAccountLevelAsOpeningBalance: Boolean(cfgForRun.collapseAccountLevelAsOpeningBalance),
          openInvoiceModel: cfgForRun.openInvoiceModel || 'erp_due',
        },
        rule:
          'Immutable snapshot — inputs archived in this folder. Do not regenerate for sign-off disputes; cite this manifest.',
        artifacts: {
          statementMd: fileMeta(mdPath, relPath(mdPath)),
          statementPdf: fs.existsSync(pdfPath) ? fileMeta(pdfPath, relPath(pdfPath)) : null,
          config: fileMeta(snapshotCtx.inputs.config, relPath(snapshotCtx.inputs.config)),
          primaryTxt: fileMeta(primaryPath, relPath(primaryPath)),
          siteTxts: Object.fromEntries(
            Object.entries(snapshotCtx.inputs.siteTxts).map(([code, abs]) => [code, fileMeta(abs, relPath(abs))]),
          ),
        },
      };
      const manifestPath = path.join(snapshotCtx.snapshotDir, 'manifest.json');
      fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
      console.log(`[${debtorCode}] Snapshot manifest: ${manifestPath}`);
    }
  } else if (snapshotCtx) {
    const manifest = {
      schemaVersion: '1.0',
      debtorCode,
      snapshotId: snapshotCtx.snapshotId,
      generatedAt: generatedAt.toISOString(),
      generatedAtSast: formatGeneratedSast(generatedAt),
      statementAsAt: asAtIso,
      ageingAsAt: ageAsAt.toISOString().slice(0, 10),
      gitCommit: gitHead(),
      gate: { status: tagCoverage.gate, basis: tagCoverage.evidence.basis },
      amounts: {
        erpHeader: primaryHeader,
        openInvoices: sumOpenInvoices,
        accountLevel: bridgeSum,
        customerAmountDue: customerAmountDue,
        customerDueBasis,
      },
      artifacts: {
        statementMd: fileMeta(mdPath, relPath(mdPath)),
        config: fileMeta(snapshotCtx.inputs.config, relPath(snapshotCtx.inputs.config)),
        primaryTxt: fileMeta(primaryPath, relPath(primaryPath)),
      },
      note: 'PDF not generated — re-run with --pdf to add statement PDF and complete artifact checksums.',
    };
    fs.writeFileSync(
      path.join(snapshotCtx.snapshotDir, 'manifest.json'),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
  }
}

main();
