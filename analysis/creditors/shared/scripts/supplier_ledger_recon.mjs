#!/usr/bin/env node
/**
 * Supplier-side ledger vs our ERP ledger comparison (ADVISORY ONLY).
 *
 * The supplier ledger never adjusts our balance — the ERP creditor enquiry TXT stays
 * Tier-3 authority (see CREDITORS_DOCTRINE.md). This script surfaces discrepancies.
 *
 * Join key: the supplier's SO number, which our ERP carries in the SUPPLIER/BANK REF
 * column on GRV / Deb Note rows. Formats vary and are normalised to a bare integer.
 *
 * Usage: node analysis/creditors/shared/scripts/supplier_ledger_recon.mjs --creditor 008ORY
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

const round2 = (n) => Math.round(Number(n) * 100) / 100;
const fmt = (n) =>
  Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const kgFmt = (n) => Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

const OUR_PAYMENT_TYPES = new Set([
  'Payment',
  'Ud Paymnt',
  'Ud XFer',
  'Bank XFer',
  'Bank UD',
  'Bank Dep',
  'Journal',
  'Expense',
]);

function parseArgs() {
  const idx = process.argv.indexOf('--creditor');
  if (idx === -1 || !process.argv[idx + 1]) {
    console.error('Usage: node supplier_ledger_recon.mjs --creditor CODE');
    process.exit(1);
  }
  return process.argv[idx + 1].toUpperCase();
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

/** "245,480.54" | "- 176,804.23 " | "  -   " | "" -> number */
function parseAmount(raw) {
  const s = String(raw || '')
    .replace(/[,\s]/g, '')
    .replace(/^R/i, '');
  if (!s || s === '-') return 0;
  const n = Number(s);
  return Number.isFinite(n) ? round2(n) : 0;
}

function isoFromDmy(d) {
  const m = String(d || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

function displayDate(iso) {
  if (!iso) return '—';
  const d = new Date(`${iso}T12:00:00`);
  return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('en-ZA', { month: 'short' })} ${d.getFullYear()}`;
}

function monthLabel(key) {
  const [y, mo] = key.split('-');
  return new Date(`${y}-${mo}-01T12:00:00`).toLocaleString('en-ZA', {
    month: 'long',
    year: 'numeric',
  });
}

function daysBetween(a, b) {
  return Math.round(Math.abs(new Date(a) - new Date(b)) / 86400000);
}

/**
 * Normalise a supplier SO reference. Sequences restart each month, so an SO is only
 * unique when scoped by month: the supplier's own form carries the month (`SON2607ZA105000048`
 * -> 2026-07 / 48) while our ERP records only the sequence (`SON#128`, `SON049`, `#0093`),
 * which takes its month from the row date.
 *
 * Rejects bank references (`FNB-15072026`) and 8-digit delivery dates (`12012026`).
 */
function normaliseSoRef(raw, rowIso) {
  const s = String(raw || '').trim();
  if (!s) return null;
  if (/^FNB/i.test(s)) return null;

  const structured = s.match(/SO[N]?\s*(\d{2})(\d{2})ZA\d{3}0*(\d{1,4})\s*\.?$/i);
  if (structured) {
    return {
      ym: `20${structured[1]}-${structured[2]}`,
      seq: parseInt(structured[3], 10),
      scoped: true,
    };
  }

  const short = s.match(/^SO[N]?\s*#?\s*0*(\d{1,4})\s*\.?$/i);
  if (short) {
    return { ym: rowIso ? rowIso.slice(0, 7) : null, seq: parseInt(short[1], 10), scoped: false };
  }

  const hash = s.match(/^#\s*0*(\d{1,4})\s*$/);
  if (hash) {
    return { ym: rowIso ? rowIso.slice(0, 7) : null, seq: parseInt(hash[1], 10), scoped: false };
  }

  return null;
}

const soKey = (so) => (so && so.ym != null ? `${so.ym}|${so.seq}` : null);
const soLabel = (key) => {
  const [ym, seq] = String(key).split('|');
  return `${ym} / ${String(seq).padStart(3, '0')}`;
};
const monthsApart = (a, b) => {
  const [ay, am] = a.split('-').map(Number);
  const [by, bm] = b.split('-').map(Number);
  return Math.abs((ay - by) * 12 + (am - bm));
};

function loadConfig(creditorCode) {
  const statementPath = path.join(
    ROOT,
    'analysis/creditors',
    creditorCode,
    'config/statement_v5.json',
  );
  const ledgerCfgPath = path.join(
    ROOT,
    'analysis/creditors',
    creditorCode,
    'config/supplier_ledger.json',
  );
  if (!fs.existsSync(statementPath)) throw new Error(`Missing config: ${statementPath}`);
  if (!fs.existsSync(ledgerCfgPath)) throw new Error(`Missing config: ${ledgerCfgPath}`);

  const statement = JSON.parse(fs.readFileSync(statementPath, 'utf8'));
  const ledger = JSON.parse(fs.readFileSync(ledgerCfgPath, 'utf8'));
  const resolve = (p) => (path.isAbsolute(p) ? p : path.join(ROOT, p));

  const txtPath = resolve(statement.txtPath);
  const ledgerPath = resolve(ledger.ledgerPath);
  if (!fs.existsSync(txtPath)) throw new Error(`Missing ERP TXT: ${txtPath}`);
  if (!fs.existsSync(ledgerPath)) throw new Error(`Missing supplier ledger: ${ledgerPath}`);

  return {
    creditorCode,
    creditorName: statement.creditorName,
    txtPath,
    ledgerPath,
    from: ledger.from,
    to: ledger.to,
    amountTolerance: Number(ledger.amountTolerance ?? 2),
    dateToleranceDays: Number(ledger.dateToleranceDays ?? 5),
    rebateDescPattern: ledger.rebateDescPattern || 'volume rebate',
    ledgerAsAtNote: ledger.ledgerAsAtNote || '',
    docTypeMap: ledger.docTypeMap || {},
  };
}

const DECISION_VOCAB = new Set([
  'SAME_DELIVERY',
  'MERGE_GROUP',
  'SAME_PAYMENT',
  'INTERNAL_REVERSAL',
  'GENUINELY_MISSING_THEIRS',
  'GENUINELY_MISSING_OURS',
  'TIMING',
  'QUERY_RAISED',
  'ACCEPTED_VARIANCE',
]);

/**
 * Decisions that join two sides together rather than close an item. They must never reach
 * the close-by-decision lookups, or naming a counterpart would silently retire it while
 * leaving the unresolved variance in place on the other side.
 */
const LINKING_DECISIONS = new Set(['SAME_DELIVERY', 'MERGE_GROUP']);

/**
 * Human ratification decisions. This file is hand-edited and never overwritten — the
 * generated matches CSV is a disposable work queue, this is the durable record.
 */
function loadDecisions(creditorCode) {
  const p = path.join(
    ROOT,
    'analysis/creditors',
    creditorCode,
    'data/supplier_ledger_decisions.csv',
  );
  const cols = ['lane', 'our_key', 'their_key', 'decision', 'note'];
  if (!fs.existsSync(p)) {
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, `${cols.join(',')}\n`);
    return { path: p, rows: [], byOur: new Map(), byTheir: new Map(), invalid: [] };
  }

  const lines = fs.readFileSync(p, 'utf8').split('\n').filter((l) => l.trim());
  const rows = [];
  const invalid = [];
  for (const line of lines.slice(1)) {
    const p2 = parseCsvLine(line).map((c) => c.trim());
    if (!p2[0]) continue;
    const rec = {
      lane: p2[0].toUpperCase(),
      ourKey: p2[1] || '',
      theirKey: p2[2] || '',
      decision: (p2[3] || '').toUpperCase(),
      note: p2[4] || '',
    };
    if (!DECISION_VOCAB.has(rec.decision)) {
      invalid.push(rec);
      continue;
    }
    rows.push(rec);
  }

  const byOur = new Map();
  const byTheir = new Map();
  for (const r of rows) {
    if (LINKING_DECISIONS.has(r.decision)) continue;
    if (r.ourKey) byOur.set(`${r.lane}|${r.ourKey}`, r);
    if (r.theirKey) byTheir.set(`${r.lane}|${r.theirKey}`, r);
  }

  // MERGE_GROUP: one of our SO references against several of theirs. Their side may be
  // listed '+'-separated on one row, or split across rows sharing the same our_key.
  const merges = new Map();
  for (const r of rows) {
    if (r.lane !== 'DOCUMENT' || r.decision !== 'MERGE_GROUP') continue;
    const theirKeys = r.theirKey
      .split('+')
      .map((s) => s.trim())
      .filter(Boolean);
    if (!r.ourKey || !theirKeys.length) continue;
    if (!merges.has(r.ourKey)) merges.set(r.ourKey, { ourKey: r.ourKey, theirKeys: [], notes: [] });
    const m = merges.get(r.ourKey);
    for (const k of theirKeys) if (!m.theirKeys.includes(k)) m.theirKeys.push(k);
    if (r.note) m.notes.push(r.note);
  }

  return { path: p, rows, byOur, byTheir, merges: [...merges.values()], invalid };
}

/** Latest LPG volume report JSON — our rebate entitlement basis. */
function loadVolumeReport(creditorCode) {
  const dir = path.join(ROOT, 'analysis/creditors', creditorCode, 'reports');
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => new RegExp(`^${creditorCode}_LPG_Volume_Monthly_.*\\.json$`).test(f))
    .sort();
  if (!files.length) return null;
  const p = path.join(dir, files.at(-1));
  return { path: p, data: JSON.parse(fs.readFileSync(p, 'utf8')) };
}

// ---------------------------------------------------------------- our ledger

function parseOurTxt(txtPath, from, to) {
  const txt = fs.readFileSync(txtPath, 'utf8');
  const rows = [];
  for (const line of txt.split('\n')) {
    if (!line.startsWith('"') || line.includes('LINE","PERIOD')) continue;
    const p = parseCsvLine(line);
    if (!p[0] || isNaN(+p[0])) continue;
    const iso = isoFromDmy((p[4] || '').trim());
    if (!iso) continue;
    rows.push({
      docNo: (p[2] || '').replace(/^0+/, '') || p[2],
      entryType: (p[3] || '').trim(),
      iso,
      grvNo: (p[5] || '').replace(/^0+/, '').trim(),
      ref: (p[6] || '').trim(),
      reference: (p[8] || '').trim(),
      amount: parseAmount(p[9]),
      balance: parseAmount(p[10]),
      so: normaliseSoRef(p[6], iso),
    });
  }
  const inScope = rows.filter((r) => r.iso >= from && r.iso <= to);
  return { all: rows, rows: inScope };
}

/** Our ERP running balance at (or immediately before) a given date. */
function ourBalanceAsAt(allRows, iso) {
  const upTo = allRows.filter((r) => r.iso <= iso);
  return upTo.length ? upTo[upTo.length - 1].balance : 0;
}

// ----------------------------------------------------------- supplier ledger

/**
 * The supplier file is a recon working paper: blank rows separate blocks, and each block
 * holds one delivery cycle (payment + credit note + invoice). The SO number usually
 * appears once per block, so it is assigned block-wide.
 */
function parseSupplierLedger(ledgerPath, cfg) {
  const raw = fs.readFileSync(ledgerPath, 'utf8').split('\n');
  const rows = [];
  const footer = { asAtDate: null, asAtBalance: null, totalDebit: null, totalCredit: null };
  let block = 0;

  for (const line of raw) {
    const p = parseCsvLine(line);
    const dateCell = (p[0] || '').trim();
    const itemCell = (p[1] || '').trim();
    const descCell = (p[2] || '').trim();

    const asAt = descCell.match(/Total Balance as at (\d{2}\/\d{2}\/\d{4})/i);
    if (asAt) {
      footer.asAtDate = isoFromDmy(asAt[1]);
      footer.asAtBalance = parseAmount(p[3]);
      continue;
    }
    if (!dateCell && !itemCell && !descCell) {
      block += 1;
      continue;
    }
    const iso = isoFromDmy(dateCell);
    if (!iso) {
      if (parseAmount(p[3]) && parseAmount(p[4]) && !itemCell) {
        footer.totalDebit = parseAmount(p[3]);
        footer.totalCredit = parseAmount(p[4]);
      }
      continue;
    }

    const [type, docNo] = itemCell.split(/\s+/);
    rows.push({
      block,
      iso,
      type: (type || '').toUpperCase(),
      docNo: docNo || '',
      description: descCell,
      debit: parseAmount(p[3]),
      credit: parseAmount(p[4]),
      tag: (p[6] || '').trim(),
      lane: cfg.docTypeMap[(type || '').toUpperCase()] || 'UNKNOWN',
      so: normaliseSoRef(descCell, iso),
    });
  }

  // Block-level SO fill: prefer the month-scoped reference, which appears once per block.
  const blockSo = new Map();
  for (const r of rows) {
    if (r.so?.scoped && !blockSo.has(r.block)) blockSo.set(r.block, r.so);
  }
  for (const r of rows) {
    if (r.so?.scoped) {
      r.blockSo = r.so;
      continue;
    }
    const inherited = blockSo.get(r.block);
    if (inherited) r.blockSo = inherited;
    else r.blockSo = r.so ?? null;
  }

  // A rebate *credit note* is identified by its description. Their sheet also carries a
  // free-text "Rebate" tag which sometimes lands on a payment row — that is an annotation,
  // not a document type, so a tagged payment stays in the payment lane.
  const rebateRe = new RegExp(cfg.rebateDescPattern, 'i');
  for (const r of rows) {
    r.isRebate = rebateRe.test(r.description);
    r.rebateTagged = /rebate/i.test(r.tag) && !r.isRebate;
    r.rebateMonth = r.isRebate ? rebateMonthFromDescription(r.description) : null;
  }

  const inScope = rows.filter((r) => r.iso >= cfg.from && r.iso <= cfg.to);
  return { rows: inScope, all: rows, footer };
}

const MONTHS = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function rebateMonthFromDescription(desc) {
  const m = String(desc).match(/([A-Za-z]{3,9})\s+(\d{4})/);
  if (!m) return null;
  const mm = MONTHS[m[1].slice(0, 3).toLowerCase()];
  return mm ? `${m[2]}-${mm}` : null;
}

// ------------------------------------------------------------------ matching

function groupBySo(rows, laneOf) {
  const map = new Map();
  const unkeyed = [];
  for (const r of rows) {
    const key = soKey(r.blockSo ?? r.so ?? null);
    if (!key) {
      unkeyed.push(r);
      continue;
    }
    if (!map.has(key)) map.set(key, { charge: [], credit: [], rows: [] });
    const lane = laneOf(r);
    if (lane) map.get(key)[lane].push(r);
    map.get(key).rows.push(r);
  }
  return { map, unkeyed };
}

function sum(rows, key) {
  return round2(rows.reduce((s, r) => s + Math.abs(Number(r[key] ?? 0)), 0));
}

function fuzzyCandidates(target, pool, cfg, amountKey = 'amount') {
  return pool
    .map((r) => ({
      row: r,
      dayGap: daysBetween(target.iso, r.iso),
      delta: round2(Math.abs(Math.abs(r[amountKey]) - target.amount)),
    }))
    .filter((c) => c.dayGap <= cfg.dateToleranceDays * 3)
    .sort((a, b) => a.delta - b.delta || a.dayGap - b.dayGap)
    .slice(0, 3);
}

function candidateLabel(c, taken) {
  const flag = taken?.has(c.row.src ?? c.row) ? ' [already matched]' : '';
  return `${c.row.docNo}@${c.row.iso} Δ${fmt(c.delta)} (${c.dayGap}d)${flag}`;
}

// -------------------------------------------------------------------- report

function buildRebateSection(cfg, theirRows, volume) {
  const lines = [
    '## 1. Volume rebates',
    '',
    '*Their credit notes for volume rebate against our computed entitlement (incl VAT). Our basis is the delivered-kg calculation; theirs is whatever they chose to pass.*',
    '',
  ];

  const theirRebates = theirRows.filter((r) => r.isRebate && r.rebateMonth);
  const theirByMonth = new Map();
  for (const r of theirRebates) {
    const cur = theirByMonth.get(r.rebateMonth) || { amount: 0, docs: [] };
    cur.amount = round2(cur.amount + Math.abs(r.credit || r.debit));
    cur.docs.push(`${r.docNo} (${displayDate(r.iso)})`);
    theirByMonth.set(r.rebateMonth, cur);
  }

  const ourByMonth = new Map();
  if (volume) {
    for (const m of volume.data.months || []) {
      if (m.month < cfg.from.slice(0, 7) || m.month > cfg.to.slice(0, 7)) continue;
      ourByMonth.set(m.month, {
        inclVat: round2(Number(m.rebate_incl_vat ?? 0)),
        exVat: round2(Number(m.rebate_ex_vat ?? 0)),
        netKg: Number(m.net_kg ?? 0),
      });
    }
  }

  const months = [...new Set([...ourByMonth.keys(), ...theirByMonth.keys()])].sort();
  lines.push(
    '| Month | Our net kg | Our entitlement (incl VAT) | Their credit note | Their doc | Variance | Status |',
    '| :--- | ---: | ---: | ---: | :--- | ---: | :--- |',
  );

  let ourTotal = 0;
  let theirTotal = 0;
  const notPassed = [];

  for (const mk of months) {
    const ours = ourByMonth.get(mk);
    const theirs = theirByMonth.get(mk);
    const ourAmt = ours?.inclVat ?? 0;
    const theirAmt = theirs?.amount ?? 0;
    ourTotal = round2(ourTotal + ourAmt);
    theirTotal = round2(theirTotal + theirAmt);
    const variance = round2(ourAmt - theirAmt);

    let status;
    if (!theirs && ourAmt > 0) {
      status = '**Not passed**';
      notPassed.push({ month: mk, amount: ourAmt });
    } else if (!ours && theirAmt > 0) {
      status = 'Credit with no entitlement in our data';
    } else if (Math.abs(variance) <= cfg.amountTolerance) {
      status = 'Agrees';
    } else if (variance > 0) {
      status = 'Short-paid';
    } else {
      status = 'Over-credited';
    }

    lines.push(
      `| ${monthLabel(mk)} | ${ours ? kgFmt(ours.netKg) : '—'} | ${ours ? fmt(ourAmt) : '—'} | ${theirs ? fmt(theirAmt) : '—'} | ${theirs ? theirs.docs.join(', ') : '—'} | ${fmt(variance)} | ${status} |`,
    );
  }

  lines.push(
    `| **Total** | — | **${fmt(ourTotal)}** | **${fmt(theirTotal)}** | — | **${fmt(round2(ourTotal - theirTotal))}** | — |`,
    '',
  );

  const tagged = theirRows.filter((r) => r.rebateTagged || (r.isRebate && !r.rebateMonth));
  if (tagged.length) {
    lines.push(
      '### Rows tagged "Rebate" on their sheet that are not rebate credit notes',
      '',
      '| Date | Type | Doc # | Description | Amount | Treated as |',
      '| :--- | :--- | :--- | :--- | ---: | :--- |',
      ...tagged.map(
        (r) =>
          `| ${displayDate(r.iso)} | ${r.type} | ${r.docNo} | ${r.description || '—'} | ${fmt(Math.abs(r.credit || r.debit))} | ${r.lane === 'PAYMENT' ? 'Payment (matched in section 3)' : r.lane} |`,
      ),
      '',
      '*The tag is free text on their working paper. These rows carry no rebate month and their document type is not a credit note, so they are reconciled in their natural lane and excluded from the rebate entitlement comparison above.*',
      '',
    );
  }

  if (notPassed.length) {
    const total = round2(notPassed.reduce((s, m) => s + m.amount, 0));
    lines.push(
      `> **R${fmt(total)} of rebate entitlement has no matching credit note** on their ledger (${notPassed.map((m) => monthLabel(m.month)).join(', ')}).`,
      '',
    );
  }

  lines.push('---', '');
  return { lines, ourTotal, theirTotal, notPassed };
}

/**
 * Our ERP books a cancelled delivery as a Deb Note crediting back its linked GRV in full.
 * That pair nets to zero and never reaches the supplier's ledger, so leaving it in the
 * comparison inflates both our charge and our credit by the same amount and reads as a
 * variance. A genuine deposit credit is a fraction of the load (008ORY tops out near 0.72),
 * so a credit equal to its GRV within tolerance is unambiguous.
 */
function findReversalPairs(ourRows, tolerance, watchRatio = 0.9) {
  const grvByNo = new Map();
  for (const r of ourRows) if (r.entryType === 'GRV') grvByNo.set(r.docNo, r);

  const reversals = [];
  const watch = [];
  for (const d of ourRows) {
    if (d.entryType !== 'Deb Note' || !d.grvNo) continue;
    const g = grvByNo.get(d.grvNo);
    if (!g) continue;
    const charge = Math.abs(g.amount);
    const credit = Math.abs(d.amount);
    if (!charge) continue;
    const gap = round2(Math.abs(charge - credit));
    if (gap <= tolerance) {
      reversals.push({ grv: g, deb: d, charge, credit, gap });
    } else if (credit / charge >= watchRatio) {
      watch.push({ grv: g, deb: d, charge, credit, gap, ratio: credit / charge });
    }
  }
  return { reversals, watch };
}

function summariseSoGroup(key, ours, theirs) {
  const ourCharge = ours ? sum(ours.charge, 'amount') : 0;
  const ourCredit = ours ? sum(ours.credit, 'amount') : 0;
  const theirCharge = theirs ? sum(theirs.charge, 'debit') : 0;
  const theirCredit = theirs ? sum(theirs.credit, 'credit') : 0;
  return {
    key,
    label: soLabel(key),
    ourCharge,
    ourCredit,
    theirCharge,
    theirCredit,
    chargeVar: round2(ourCharge - theirCharge),
    creditVar: round2(ourCredit - theirCredit),
    ourDocs: ours ? ours.rows.map((r) => r.docNo) : [],
    theirDocs: theirs ? theirs.rows.map((r) => r.docNo) : [],
    ourDate: ours ? ours.rows[0]?.iso : null,
    theirDate: theirs ? theirs.rows[0]?.iso : null,
  };
}

function buildDocumentSection(cfg, ourRows, theirRows, csvRows, decisions, asAt) {
  const ourDocRows = ourRows.filter((r) => ['GRV', 'Deb Note'].includes(r.entryType));
  const { reversals, watch: reversalWatch } = findReversalPairs(ourDocRows, cfg.amountTolerance);
  const reversedRows = new Set(reversals.flatMap((p) => [p.grv, p.deb]));

  const ourGrouped = groupBySo(
    ourDocRows.filter((r) => !reversedRows.has(r)),
    (r) => (r.entryType === 'GRV' ? 'charge' : 'credit'),
  );
  const theirGrouped = groupBySo(
    theirRows.filter((r) => ['GRV', 'Deb Note'].includes(r.lane) && !r.isRebate),
    (r) => (r.lane === 'GRV' ? 'charge' : 'credit'),
  );
  const ourBySo = ourGrouped.map;
  const theirBySo = theirGrouped.map;

  // Apply MERGE_GROUP before matching, so a merged pair is judged on its combined totals
  // rather than being reported as a variance against one fragment of the other side.
  const mergesApplied = [];
  const mergesFailed = [];
  for (const m of decisions.merges) {
    const ourEntry = [...ourBySo.keys()].find((k) => soLabel(k) === m.ourKey);
    const targets = m.theirKeys.map((label) => ({
      label,
      key: [...theirBySo.keys()].find((k) => soLabel(k) === label),
    }));
    const missing = targets.filter((t) => !t.key).map((t) => t.label);
    if (!ourEntry || missing.length) {
      mergesFailed.push({
        ...m,
        reason: !ourEntry
          ? `our SO ${m.ourKey} not found`
          : `their SO ${missing.join(', ')} not found`,
      });
      continue;
    }
    const combined = { charge: [], credit: [], rows: [] };
    // Their group already sitting under our key survives the merge even if not listed.
    if (theirBySo.has(ourEntry) && !targets.some((t) => t.key === ourEntry)) {
      const g = theirBySo.get(ourEntry);
      combined.charge.push(...g.charge);
      combined.credit.push(...g.credit);
      combined.rows.push(...g.rows);
    }
    for (const t of targets) {
      const g = theirBySo.get(t.key);
      combined.charge.push(...g.charge);
      combined.credit.push(...g.credit);
      combined.rows.push(...g.rows);
      theirBySo.delete(t.key);
    }
    theirBySo.set(ourEntry, combined);
    mergesApplied.push({ ...m, absorbed: targets.map((t) => t.label) });
  }

  const agreed = [];
  const variances = [];
  const adjacent = [];
  const onlyOurs = [];
  const onlyTheirs = [];

  const pushCsv = (rec, tier, candidates = '') =>
    csvRows.push({
      lane: 'DOCUMENT',
      so: rec.label,
      our_docs: rec.ourDocs.join(' '),
      our_date: rec.ourDate || '',
      our_charge: rec.ourCharge || '',
      our_credit: rec.ourCredit || '',
      their_docs: rec.theirDocs.join(' '),
      their_date: rec.theirDate || '',
      their_charge: rec.theirCharge || '',
      their_credit: rec.theirCredit || '',
      charge_variance: rec.chargeVar,
      credit_variance: rec.creditVar,
      match_tier: tier,
      fuzzy_candidates: candidates,
      ratified_so: '',
      decision: '',
      note: '',
    });

  // Tier 1/2 — exact month-scoped SO key on both sides.
  const matchedKeys = new Set();
  for (const key of ourBySo.keys()) {
    if (!theirBySo.has(key)) continue;
    matchedKeys.add(key);
    const rec = summariseSoGroup(key, ourBySo.get(key), theirBySo.get(key));
    const clean =
      Math.abs(rec.chargeVar) <= cfg.amountTolerance &&
      Math.abs(rec.creditVar) <= cfg.amountTolerance;
    if (clean) {
      agreed.push(rec);
      pushCsv(rec, 'SO_EXACT');
    } else {
      variances.push(rec);
      pushCsv(rec, 'SO_AMOUNT_VARIANCE');
    }
  }

  let ourLeft = [...ourBySo.keys()].filter((k) => !matchedKeys.has(k));
  let theirLeft = [...theirBySo.keys()].filter((k) => !matchedKeys.has(k));

  // Ratified links — a human confirmed the two SO references are the same delivery.
  const ratified = [];
  const rejected = [];
  const linkedOurs = new Set();
  const linkedTheirs = new Set();
  for (const d of decisions.rows) {
    if (d.lane !== 'DOCUMENT' || d.decision !== 'SAME_DELIVERY') continue;
    const ok = ourLeft.find((k) => soLabel(k) === d.ourKey);
    const tk = theirLeft.find((k) => soLabel(k) === d.theirKey);
    if (!ok || !tk) {
      // A SAME_DELIVERY aimed at a group that already matched on its own SO key cannot be
      // honoured 1:1. Surface it rather than ignore it — the intent is usually MERGE_GROUP.
      const ourMatched = [...matchedKeys].some((k) => soLabel(k) === d.ourKey);
      const theirMatched = [...matchedKeys].some((k) => soLabel(k) === d.theirKey);
      rejected.push({
        ...d,
        reason:
          ourMatched || theirMatched
            ? `${ourMatched ? d.ourKey : d.theirKey} already matched on its own SO key — use MERGE_GROUP`
            : 'one or both SO references not found among open groups',
      });
      continue;
    }
    linkedOurs.add(ok);
    linkedTheirs.add(tk);
    const rec = summariseSoGroup(ok, ourBySo.get(ok), theirBySo.get(tk));
    rec.label = `${soLabel(ok)} ↔ ${soLabel(tk)}`;
    rec.note = d.note;
    ratified.push(rec);
    pushCsv(rec, 'RATIFIED_LINK');
  }
  ourLeft = ourLeft.filter((k) => !linkedOurs.has(k));
  theirLeft = theirLeft.filter((k) => !linkedTheirs.has(k));

  // Tier 3 — same sequence in an adjacent month (month-boundary booking).
  const usedTheirs = new Set();
  const stillOurs = [];
  for (const ok of ourLeft) {
    const [oym, oseq] = ok.split('|');
    const hit = theirLeft.find((tk) => {
      if (usedTheirs.has(tk)) return false;
      const [tym, tseq] = tk.split('|');
      return tseq === oseq && monthsApart(oym, tym) === 1;
    });
    if (hit) {
      usedTheirs.add(hit);
      const rec = summariseSoGroup(ok, ourBySo.get(ok), theirBySo.get(hit));
      rec.label = `${soLabel(ok)} ↔ ${soLabel(hit)}`;
      adjacent.push(rec);
      pushCsv(rec, 'SO_ADJACENT_MONTH');
    } else {
      stillOurs.push(ok);
    }
  }
  const stillTheirs = theirLeft.filter((k) => !usedTheirs.has(k));

  // Tier 4 — unmatched, with ranked fuzzy candidates from the other side.
  const theirPool = stillTheirs.map((k) => {
    const g = theirBySo.get(k);
    return { key: k, iso: g.rows[0]?.iso, amount: sum(g.charge, 'debit'), docNo: soLabel(k) };
  });
  const ourPool = stillOurs.map((k) => {
    const g = ourBySo.get(k);
    return { key: k, iso: g.rows[0]?.iso, amount: sum(g.charge, 'amount'), docNo: soLabel(k) };
  });

  const closed = [];
  const afterAsAt = [];
  for (const k of stillOurs) {
    const rec = summariseSoGroup(k, ourBySo.get(k), null);
    // Delivered after their snapshot closed, so it cannot be on their ledger yet.
    if (asAt && rec.ourDate && rec.ourDate > asAt) {
      afterAsAt.push(rec);
      pushCsv(rec, 'AFTER_LEDGER_ASAT');
      continue;
    }
    const d = decisions.byOur.get(`DOCUMENT|${soLabel(k)}`);
    if (d) {
      rec.decision = d.decision;
      rec.note = d.note;
      closed.push(rec);
      pushCsv(rec, `CLOSED_${d.decision}`);
      continue;
    }
    onlyOurs.push(rec);
    const cands = fuzzyCandidates({ iso: rec.ourDate, amount: rec.ourCharge }, theirPool, cfg);
    pushCsv(rec, 'ONLY_OURS', cands.map((c) => candidateLabel(c)).join(' | '));
  }
  for (const k of stillTheirs) {
    const rec = summariseSoGroup(k, null, theirBySo.get(k));
    const d = decisions.byTheir.get(`DOCUMENT|${soLabel(k)}`);
    if (d) {
      rec.decision = d.decision;
      rec.note = d.note;
      closed.push(rec);
      pushCsv(rec, `CLOSED_${d.decision}`);
      continue;
    }
    onlyTheirs.push(rec);
    const cands = fuzzyCandidates({ iso: rec.theirDate, amount: rec.theirCharge }, ourPool, cfg);
    pushCsv(rec, 'ONLY_THEIRS', cands.map((c) => candidateLabel(c)).join(' | '));
  }

  const total =
    agreed.length +
    variances.length +
    ratified.length +
    adjacent.length +
    closed.length +
    afterAsAt.length +
    onlyOurs.length +
    onlyTheirs.length;

  const lines = [
    '## 2. Deliveries — their invoices/credit notes vs our GRVs/Deb Notes',
    '',
    `*Joined on **month-scoped SO** (sequences restart each month). Their \`SAINV\` maps to our \`GRV\` (gross charge) and their \`SACRN\` to our \`Deb Note\` (cylinder deposit credit). Tolerance R${fmt(cfg.amountTolerance)}.*`,
    '',
    '| Outcome | SO count |',
    '| :--- | ---: |',
    `| Agree on both charge and credit | ${agreed.length} |`,
    `| Same SO, amounts differ | ${variances.length} |`,
    `| Ratified link (human-confirmed same delivery) | ${ratified.length} |`,
    `| Merged group (our one SO vs several of theirs) | ${mergesApplied.length} |`,
    `| Matched on adjacent month (boundary booking) | ${adjacent.length} |`,
    `| Closed by a ratified decision | ${closed.length} |`,
    `| Delivered after their cut-off — out of scope | ${afterAsAt.length} |`,
    `| **Open — on our ledger only** | **${onlyOurs.length}** |`,
    `| **Open — on their ledger only** | **${onlyTheirs.length}** |`,
    `| **Total SO groups compared** | **${total}** |`,
    '',
  ];

  const classify = (r) => {
    const chargeOff = Math.abs(r.chargeVar) > cfg.amountTolerance;
    const creditOff = Math.abs(r.creditVar) > cfg.amountTolerance;
    if (chargeOff && creditOff) {
      return Math.abs(round2(r.chargeVar - r.creditVar)) <= cfg.amountTolerance
        ? 'Deposit-driven'
        : 'Both lanes';
    }
    if (creditOff) return 'Deposit only';
    return 'Charge only';
  };

  const varianceTable = (recs, title, note) => {
    if (!recs.length) return;
    lines.push(
      `### ${title}`,
      '',
      ...(note ? [note, ''] : []),
      '| SO | Docs (ours/theirs) | Our GRV | Their invoice | Charge var | Our Deb Note | Their credit note | Credit var | Pattern |',
      '| :--- | :--- | ---: | ---: | ---: | ---: | ---: | ---: | :--- |',
      ...recs.map(
        (r) =>
          `| ${r.label} | ${r.ourDocs.length}/${r.theirDocs.length} | ${fmt(r.ourCharge)} | ${fmt(r.theirCharge)} | **${fmt(r.chargeVar)}** | ${fmt(r.ourCredit)} | ${fmt(r.theirCredit)} | **${fmt(r.creditVar)}** | ${classify(r)} |`,
      ),
      '',
      '*`Deposit only` means the gas charge agrees and only the cylinder deposit credit differs. `Deposit-driven` means the charge and credit variances are equal and opposite in effect, which usually points to a deposit line landing in a different lane rather than a price difference.*',
      '',
    );
  };

  varianceTable(variances, 'Same SO, amounts differ');
  varianceTable(
    ratified,
    'Ratified links (human-confirmed same delivery)',
    '*A reviewer confirmed these two SO references are the same delivery. Variances below are the real difference once the reference mismatch is set aside.*',
  );
  varianceTable(
    adjacent,
    'Matched on adjacent month',
    '*Same SO sequence one month apart — usually a delivery booked either side of a month cut-off.*',
  );

  if (afterAsAt.length) {
    lines.push(
      `### Delivered after their cut-off (${displayDate(asAt)}) — out of scope`,
      '',
      '| SO | Our docs | Date | Our GRV | Our Deb Note |',
      '| :--- | :--- | :--- | ---: | ---: |',
      ...afterAsAt.map(
        (r) =>
          `| ${r.label} | ${r.ourDocs.join(' ')} | ${displayDate(r.ourDate)} | ${fmt(r.ourCharge)} | ${fmt(r.ourCredit)} |`,
      ),
      '',
      '*Expected to be absent from their ledger. Confirm they appear on the next statement.*',
      '',
    );
  }

  if (closed.length) {
    lines.push(
      '### Closed by ratified decision',
      '',
      '| SO | Decision | Charge | Credit | Note |',
      '| :--- | :--- | ---: | ---: | :--- |',
      ...closed.map(
        (r) =>
          `| ${r.label} | \`${r.decision}\` | ${fmt(r.ourCharge || r.theirCharge)} | ${fmt(r.ourCredit || r.theirCredit)} | ${r.note || '—'} |`,
      ),
      '',
    );
  }

  const listOnly = (recs, title, ourSide) => {
    if (!recs.length) return;
    lines.push(
      `### ${title}`,
      '',
      '| SO | Date | Docs | Charge | Credit |',
      '| :--- | :--- | :--- | ---: | ---: |',
      ...recs.map(
        (r) =>
          `| ${r.label} | ${displayDate(ourSide ? r.ourDate : r.theirDate)} | ${(ourSide ? r.ourDocs : r.theirDocs).join(', ') || '—'} | ${fmt(ourSide ? r.ourCharge : r.theirCharge)} | ${fmt(ourSide ? r.ourCredit : r.theirCredit)} |`,
      ),
      '',
      '*Ranked fuzzy candidates for these rows are in the CSV for ratification.*',
      '',
    );
  };
  listOnly(onlyOurs, 'On our ledger only (no matching SO on theirs)', true);
  listOnly(onlyTheirs, 'On their ledger only (no matching SO on ours)', false);

  if (ourGrouped.unkeyed.length || theirGrouped.unkeyed.length) {
    lines.push(
      '### Rows carrying no usable SO reference',
      '',
      `Ours: ${ourGrouped.unkeyed.length} · Theirs: ${theirGrouped.unkeyed.length}`,
      '',
    );
  }

  if (reversals.length) {
    const grossTotal = round2(reversals.reduce((s, p) => s + p.charge, 0));
    const netTotal = round2(reversals.reduce((s, p) => s + (p.charge - p.credit), 0));
    lines.push(
      '### Reversed deliveries excluded from the comparison',
      '',
      `*Our ERP cancels a delivery by raising a Deb Note that credits back its linked GRV in full. These ${reversals.length} pair(s) net to zero on our side and never reach the supplier's ledger, so both legs are excluded above. Leaving them in would overstate our charges **and** our deposit credits by R${fmt(grossTotal)} each and read as a variance.*`,
      '',
      '| Date | Our SO | GRV | Charge | Deb Note | Credit back | Residual |',
      '| :--- | :--- | :--- | ---: | :--- | ---: | ---: |',
      ...reversals.map(
        (p) =>
          `| ${displayDate(p.grv.iso)} | ${p.grv.ref || '—'} | ${p.grv.docNo} | ${fmt(p.charge)} | ${p.deb.docNo} | ${fmt(p.credit)} | ${fmt(round2(p.charge - p.credit))} |`,
      ),
      `| | | | **${fmt(grossTotal)}** | | | **${fmt(netTotal)}** |`,
      '',
      netTotal === 0
        ? '*Every pair nets exactly to zero.*'
        : `*The residual of R${fmt(netTotal)} is rounding on our own reversal, not a supplier difference.*`,
      '',
    );
  }

  if (reversalWatch.length) {
    lines.push(
      '### Deposit credits close to the full value of their GRV',
      '',
      '*Not treated as reversals, but a deposit credit this large relative to the load is unusual and may be a partial cancellation. Worth an eye.*',
      '',
      '| Date | Our SO | GRV | Charge | Deb Note | Credit | Credit as % of charge |',
      '| :--- | :--- | :--- | ---: | :--- | ---: | ---: |',
      ...reversalWatch.map(
        (p) =>
          `| ${displayDate(p.grv.iso)} | ${p.grv.ref || '—'} | ${p.grv.docNo} | ${fmt(p.charge)} | ${p.deb.docNo} | ${fmt(p.credit)} | ${(p.ratio * 100).toFixed(1)}% |`,
      ),
      '',
    );
  }

  // A delivery is one GRV plus its deposit Deb Note. Two or more GRVs under one SO
  // reference means our capture reused it, which fragments the comparison on their side.
  const mergedKeys = new Set(mergesApplied.map((m) => m.ourKey));
  const reusedSo = [...ourBySo.entries()]
    .map(([key, g]) => ({ key, label: soLabel(key), grvs: g.charge }))
    .filter((r) => r.grvs.length > 1 && !mergedKeys.has(r.label))
    .sort((a, b) => b.grvs.length - a.grvs.length || a.label.localeCompare(b.label));

  if (reusedSo.length) {
    lines.push(
      '### Our SO references carrying more than one GRV',
      '',
      `*A delivery is normally one GRV plus its deposit Deb Note. ${reusedSo.length} of our SO references still carry several GRVs, which means the reference was reused across separate loads. Their side numbers those loads individually, so the comparison above comes out as a large variance against one fragment of their ledger rather than a real difference. Resolve with a \`MERGE_GROUP\` decision naming their SOs.${mergedKeys.size ? ` A further ${mergedKeys.size} already resolved this way and are excluded from this queue.` : ''}*`,
      '',
      '| Our SO | GRVs | Our GRV numbers and amounts |',
      '| :--- | ---: | :--- |',
      ...reusedSo.map(
        (r) =>
          `| ${r.label} | ${r.grvs.length} | ${r.grvs.map((g) => `${g.docNo} ${fmt(Math.abs(g.amount))}`).join(' · ')} |`,
      ),
      '',
    );
  }

  if (mergesApplied.length || mergesFailed.length || rejected.length) {
    lines.push('### Ratification mechanics', '');
    if (mergesApplied.length) {
      lines.push(
        ...mergesApplied.map(
          (m) => `- **Merged:** our ${m.ourKey} now compared against their ${m.absorbed.join(' + ')}`,
        ),
      );
    }
    for (const m of mergesFailed) {
      lines.push(`- ⚠️ **Merge not applied:** our ${m.ourKey} → ${m.reason}`);
    }
    for (const r of rejected) {
      lines.push(`- ⚠️ **Decision not applied:** ${r.ourKey} ↔ ${r.theirKey} — ${r.reason}`);
    }
    lines.push('');
  }

  lines.push('---', '');
  return {
    lines,
    agreed,
    variances,
    ratified,
    adjacent,
    closed,
    afterAsAt,
    onlyOurs,
    onlyTheirs,
    total,
    reusedSo,
    reversals,
    reversalWatch,
    mergesApplied,
    mergesFailed,
    rejected,
  };
}

function buildPaymentSection(cfg, ourRows, theirRows, csvRows, decisions, asAt) {
  const ourPay = ourRows.filter((r) => OUR_PAYMENT_TYPES.has(r.entryType) && r.amount !== 0);
  const theirPay = theirRows.filter((r) => r.lane === 'PAYMENT' && !r.isRebate);

  const unusedOurs = new Set(ourPay.map((_, i) => i));
  const matches = [];
  const unmatchedTheirs = [];

  for (const t of theirPay) {
    const target = { iso: t.iso, amount: round2(Math.abs(t.credit || t.debit)) };
    let best = null;
    for (const i of unusedOurs) {
      const o = ourPay[i];
      const delta = round2(Math.abs(Math.abs(o.amount) - target.amount));
      const gap = daysBetween(target.iso, o.iso);
      if (delta > cfg.amountTolerance || gap > cfg.dateToleranceDays) continue;
      if (!best || delta < best.delta || (delta === best.delta && gap < best.gap)) {
        best = { i, delta, gap, row: o };
      }
    }
    if (best) {
      unusedOurs.delete(best.i);
      matches.push({ theirs: t, ours: best.row, delta: best.delta, gap: best.gap });
      csvRows.push({
        lane: 'PAYMENT',
        so: soKey(t.blockSo) ? soLabel(soKey(t.blockSo)) : '',
        our_docs: best.row.docNo,
        our_date: best.row.iso,
        our_charge: '',
        our_credit: best.row.amount,
        their_docs: t.docNo,
        their_date: t.iso,
        their_charge: '',
        their_credit: target.amount,
        charge_variance: '',
        credit_variance: best.delta,
        match_tier: best.delta === 0 && best.gap === 0 ? 'AMOUNT_DATE_EXACT' : 'AMOUNT_DATE_NEAR',
        fuzzy_candidates: '',
        ratified_so: '',
        decision: '',
        note: '',
      });
    } else {
      unmatchedTheirs.push({ row: t, amount: target.amount });
    }
  }

  // Candidates are only meaningful once matching is final, otherwise a suggestion may
  // already belong to a confirmed pair on the other side.
  const takenOurs = new Set(matches.map((m) => m.ours));
  const takenTheirs = new Set(matches.map((m) => m.theirs));

  for (const { row: t, amount } of unmatchedTheirs) {
    const cands = fuzzyCandidates({ iso: t.iso, amount }, ourPay, cfg);
    csvRows.push({
      lane: 'PAYMENT',
      so: soKey(t.blockSo) ? soLabel(soKey(t.blockSo)) : '',
      our_docs: '',
      our_date: '',
      our_charge: '',
      our_credit: '',
      their_docs: t.docNo,
      their_date: t.iso,
      their_charge: '',
      their_credit: amount,
      charge_variance: '',
      credit_variance: '',
      match_tier: 'UNMATCHED_THEIRS',
      fuzzy_candidates: cands.map((c) => candidateLabel(c, takenOurs)).join(' | '),
      ratified_so: '',
      decision: '',
      note: '',
    });
  }

  const allUnmatchedOurs = [...unusedOurs].map((i) => ourPay[i]);
  const closedOurs = [];
  const unmatchedOurs = [];
  const afterAsAt = [];
  for (const o of allUnmatchedOurs) {
    // Their ledger is a snapshot. A payment we made after their cut-off cannot appear on
    // it, so its absence is expected rather than a discrepancy.
    if (asAt && o.iso > asAt) {
      afterAsAt.push(o);
      csvRows.push({
        lane: 'PAYMENT',
        so: soKey(o.so) ? soLabel(soKey(o.so)) : '',
        our_docs: o.docNo,
        our_date: o.iso,
        our_charge: '',
        our_credit: o.amount,
        their_docs: '',
        their_date: '',
        their_charge: '',
        their_credit: '',
        charge_variance: '',
        credit_variance: '',
        match_tier: 'AFTER_LEDGER_ASAT',
        fuzzy_candidates: '',
        ratified_so: '',
        decision: '',
        note: `Paid after their ledger cut-off ${asAt}`,
      });
      continue;
    }
    const d = decisions.byOur.get(`PAYMENT|${o.docNo}`);
    if (d) {
      closedOurs.push({ row: o, decision: d.decision, note: d.note });
      csvRows.push({
        lane: 'PAYMENT',
        so: soKey(o.so) ? soLabel(soKey(o.so)) : '',
        our_docs: o.docNo,
        our_date: o.iso,
        our_charge: '',
        our_credit: o.amount,
        their_docs: '',
        their_date: '',
        their_charge: '',
        their_credit: '',
        charge_variance: '',
        credit_variance: '',
        match_tier: `CLOSED_${d.decision}`,
        fuzzy_candidates: '',
        ratified_so: '',
        decision: d.decision,
        note: d.note,
      });
      continue;
    }
    unmatchedOurs.push(o);
  }

  const theirPayPool = theirPay.map((t) => ({
    ...t,
    amount: Math.abs(t.credit || t.debit),
    src: t,
  }));
  for (const o of unmatchedOurs) {
    const cands = fuzzyCandidates(
      { iso: o.iso, amount: round2(Math.abs(o.amount)) },
      theirPayPool,
      cfg,
    );
    csvRows.push({
      lane: 'PAYMENT',
      so: soKey(o.so) ? soLabel(soKey(o.so)) : '',
      our_docs: o.docNo,
      our_date: o.iso,
      our_charge: '',
      our_credit: o.amount,
      their_docs: '',
      their_date: '',
      their_charge: '',
      their_credit: '',
      charge_variance: '',
      credit_variance: '',
      match_tier: 'UNMATCHED_OURS',
      fuzzy_candidates: cands.map((c) => candidateLabel(c, takenTheirs)).join(' | '),
      ratified_so: '',
      decision: '',
      note: '',
    });
  }

  const ourTotal = sum(ourPay, 'amount');
  const theirTotal = round2(
    theirPay.reduce((s, r) => s + Math.abs(r.credit || r.debit), 0),
  );

  const lines = [
    '## 3. Payments',
    '',
    `*Their receipts (\`ARPAY\` / \`APPAY\`) against our payment rows. Their receipts carry no SO number, so matching is on amount within R${fmt(cfg.amountTolerance)} and date within ${cfg.dateToleranceDays} days.*`,
    '',
    '| Measure | Ours | Theirs |',
    '| :--- | ---: | ---: |',
    `| Payment rows in scope | ${ourPay.length} | ${theirPay.length} |`,
    `| Total value | ${fmt(ourTotal)} | ${fmt(theirTotal)} |`,
    `| **Variance** | **${fmt(round2(ourTotal - theirTotal))}** | |`,
    '',
    `Matched ${matches.length} of ${theirPay.length} of their receipts. Open on their side: ${unmatchedTheirs.length}. Open on ours: ${unmatchedOurs.length}.${closedOurs.length ? ` Closed by ratified decision: ${closedOurs.length}.` : ''}${afterAsAt.length ? ` Out of scope (paid after their cut-off): ${afterAsAt.length}.` : ''}`,
    '',
  ];

  if (afterAsAt.length) {
    lines.push(
      `### Paid after their cut-off (${displayDate(asAt)}) — out of scope`,
      '',
      '| Date | Doc # | Type | Amount |',
      '| :--- | :--- | :--- | ---: |',
      ...afterAsAt.map(
        (o) => `| ${displayDate(o.iso)} | ${o.docNo} | ${o.entryType} | ${fmt(o.amount)} |`,
      ),
      '',
      '*Expected to be absent from their ledger. Confirm they land on the next statement.*',
      '',
    );
  }

  if (closedOurs.length) {
    lines.push(
      '### Closed by ratified decision',
      '',
      '| Date | Doc # | Amount | Decision | Note |',
      '| :--- | :--- | ---: | :--- | :--- |',
      ...closedOurs.map(
        (c) =>
          `| ${displayDate(c.row.iso)} | ${c.row.docNo} | ${fmt(c.row.amount)} | \`${c.decision}\` | ${c.note || '—'} |`,
      ),
      '',
    );
  }

  if (unmatchedTheirs.length) {
    lines.push(
      '### Their receipts with no match on our ledger',
      '',
      '| Date | Doc # | Reference | Amount |',
      '| :--- | :--- | :--- | ---: |',
      ...unmatchedTheirs.map(
        (r) =>
          `| ${displayDate(r.iso)} | ${r.docNo} | ${r.description || '—'} | ${fmt(Math.abs(r.credit || r.debit))} |`,
      ),
      '',
    );
  }
  if (unmatchedOurs.length) {
    lines.push(
      '### Our payments not reflected on their ledger',
      '',
      '| Date | Entry Type | Doc # | Reference | Amount |',
      '| :--- | :--- | :--- | :--- | ---: |',
      ...unmatchedOurs.map(
        (r) =>
          `| ${displayDate(r.iso)} | ${r.entryType} | ${r.docNo} | ${r.ref || r.reference || '—'} | ${fmt(r.amount)} |`,
      ),
      '',
    );
  }

  lines.push('---', '');
  return { lines, matches, unmatchedTheirs, unmatchedOurs, afterAsAt, ourTotal, theirTotal };
}

function buildDepositSection(cfg, ourRows, theirRows) {
  const ourDn = ourRows.filter((r) => r.entryType === 'Deb Note');
  const theirCrn = theirRows.filter((r) => r.lane === 'Deb Note' && !r.isRebate);
  const ourTotal = sum(ourDn, 'amount');
  const theirTotal = round2(theirCrn.reduce((s, r) => s + Math.abs(r.credit), 0));

  return [
    '## 4. Cylinder deposit credits',
    '',
    '*Deposit shell credits are the largest recurring credit lane and the most common source of drift when a return is booked one-for-one on one side but not the other.*',
    '',
    '| Measure | Ours (Deb Note) | Theirs (SACRN) |',
    '| :--- | ---: | ---: |',
    `| Documents | ${ourDn.length} | ${theirCrn.length} |`,
    `| Total value | ${fmt(ourTotal)} | ${fmt(theirTotal)} |`,
    `| **Variance** | **${fmt(round2(ourTotal - theirTotal))}** | |`,
    '',
    '---',
    '',
  ];
}

function writeCsv(csvPath, rows) {
  const cols = [
    'lane',
    'so',
    'our_docs',
    'our_date',
    'our_charge',
    'our_credit',
    'their_docs',
    'their_date',
    'their_charge',
    'their_credit',
    'charge_variance',
    'credit_variance',
    'match_tier',
    'fuzzy_candidates',
    'ratified_so',
    'decision',
    'note',
  ];
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const out = [cols.join(',')];
  for (const r of rows) out.push(cols.map((c) => esc(r[c])).join(','));
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  fs.writeFileSync(csvPath, `${out.join('\n')}\n`);
}

async function main() {
  const creditorCode = parseArgs();
  const cfg = loadConfig(creditorCode);
  const volume = loadVolumeReport(creditorCode);

  const our = parseOurTxt(cfg.txtPath, cfg.from, cfg.to);
  const their = parseSupplierLedger(cfg.ledgerPath, cfg);

  const decisions = loadDecisions(creditorCode);
  const asAt = their.footer.asAtDate;
  const csvRows = [];
  const rebate = buildRebateSection(cfg, their.rows, volume);
  const docs = buildDocumentSection(cfg, our.rows, their.rows, csvRows, decisions, asAt);
  const payments = buildPaymentSection(cfg, our.rows, their.rows, csvRows, decisions, asAt);
  const deposits = buildDepositSection(cfg, our.rows, their.rows);

  const ourAsAt = asAt ? ourBalanceAsAt(our.all, asAt) : null;
  const theirAsAt = their.footer.asAtBalance;

  const balanceLines = [
    '## 0. Balance headline',
    '',
    asAt
      ? `| Measure | As at ${displayDate(asAt)} |\n| :--- | ---: |\n| Their stated balance (we owe) | ${fmt(theirAsAt)} |\n| Our ERP running balance | ${fmt(ourAsAt)} |\n| **Gap (their balance − \\|ours\\|)** | **${fmt(round2(theirAsAt - Math.abs(ourAsAt)))}** |`
      : '*Their file carries no "Total Balance as at" line, so no balance headline could be extracted.*',
    '',
    '> Their balance is **advisory**. Our ERP `CURRENT BALANCE` remains Tier-3 authority for the v5 statement; nothing in this report adjusts it.',
    '',
    '---',
    '',
  ];

  const md = [
    `# ${cfg.creditorName} (${cfg.creditorCode}) — Supplier Ledger vs Our Ledger`,
    '',
    `**Generated:** ${new Date().toISOString().slice(0, 10)} · **Scope:** ${cfg.from} → ${cfg.to}`,
    `**Their ledger:** \`${path.relative(ROOT, cfg.ledgerPath)}\`${cfg.ledgerAsAtNote ? ` — ${cfg.ledgerAsAtNote}` : ''}`,
    `**Our ledger:** \`${path.relative(ROOT, cfg.txtPath)}\` (Tier-3 authority)`,
    `**Join key:** supplier SO number, normalised to a bare integer from both sides`,
    '',
    '> **Advisory only.** Per `CREDITORS_DOCTRINE.md` the supplier ledger is a cross-check, never a balance authority. Discrepancies below are findings to pursue, not adjustments to post.',
    '',
    `**Ratified decisions applied:** ${decisions.rows.length} from \`${path.relative(ROOT, decisions.path)}\`${decisions.invalid.length ? ` · ⚠️ **${decisions.invalid.length} row(s) ignored — decision value not recognised**` : ''}`,
    '',
    'See `analysis/creditors/shared/docs/Supplier_Ledger_Ratification_Guide.md` for how to work the open items.',
    '',
    '---',
    '',
    ...balanceLines,
    ...rebate.lines,
    ...docs.lines,
    ...payments.lines,
    ...deposits,
    '## Method notes',
    '',
    `- **SO normalisation:** SO sequences restart every month, so the key is **month + sequence**. Their \`SON2607ZA105000048\` carries its own month (2026-07 / 048); our \`SON#128\`, \`SON 174\`, \`#0093\` carry only the sequence and take the month from the row date. Bank references (\`FNB-…\`, \`STAT …\`) and 8-digit delivery dates are rejected.`,
    `- **Block-level SO:** their file is a recon working paper where blank rows separate delivery cycles. The SO appears once per block and is applied block-wide, which is how their sheet is built.`,
    `- **Document mapping:** \`SAINV\` → our \`GRV\`; \`SACRN\` → our \`Deb Note\`; \`ARPAY\`/\`APPAY\` → our payment rows; \`CAFOO\` is their carry-forward and is excluded.`,
    `- **Tolerance:** R${fmt(cfg.amountTolerance)} on amounts, ${cfg.dateToleranceDays} days on payment dates.`,
    `- **Fuzzy candidates:** open rows carry ranked suggestions in \`data/supplier_ledger_matches.csv\`, read as \`theirDoc@date Δamount-gap (day-gap)\`. That file is **regenerated on every run** — record conclusions in \`data/supplier_ledger_decisions.csv\` instead, which is never overwritten.`,
    `- **Rebate tag:** their sheet carries a free-text "Rebate" tag that sometimes lands on a payment row. Only a credit note whose description matches \`/${cfg.rebateDescPattern}/i\` is treated as a rebate credit; tagged payments stay in the payment lane.`,
    volume ? `- **Rebate basis:** \`${path.relative(ROOT, volume.path)}\`.` : '- **Rebate basis:** none found — run `npm run creditors:lpg-volume`.',
    '',
  ].join('\n');

  const reportPath = path.join(
    ROOT,
    'analysis/creditors',
    creditorCode,
    'reports',
    `${creditorCode}_Supplier_Ledger_Recon_${cfg.from.slice(0, 4)}.md`,
  );
  const csvPath = path.join(
    ROOT,
    'analysis/creditors',
    creditorCode,
    'data',
    'supplier_ledger_matches.csv',
  );

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, md);
  writeCsv(csvPath, csvRows);

  console.log(`[${creditorCode}] their rows in scope: ${their.rows.length} | our rows: ${our.rows.length}`);
  if (asAt) {
    console.log(
      `[${creditorCode}] balance as at ${asAt}: theirs R${fmt(theirAsAt)} vs ours R${fmt(ourAsAt)}`,
    );
  }
  console.log(
    `[${creditorCode}] rebate: ours R${fmt(rebate.ourTotal)} vs theirs R${fmt(rebate.theirTotal)} (variance R${fmt(round2(rebate.ourTotal - rebate.theirTotal))}, ${rebate.notPassed.length} month(s) not passed)`,
  );
  console.log(
    `[${creditorCode}] documents: ${docs.agreed.length} agree, ${docs.variances.length} variance, ${docs.ratified.length} ratified-link, ${docs.closed.length} closed, ${docs.afterAsAt.length} after cut-off, ${docs.onlyOurs.length} ours-only open, ${docs.onlyTheirs.length} theirs-only open (of ${docs.total} SO groups)`,
  );
  console.log(
    `[${creditorCode}] payments: ${payments.matches.length} matched, ${payments.unmatchedTheirs.length} theirs open, ${payments.unmatchedOurs.length} ours open`,
  );
  const notApplied = docs.mergesFailed.length + docs.rejected.length;
  console.log(
    `[${creditorCode}] decisions: ${decisions.rows.length} in file, ${docs.mergesApplied.length} merge(s) applied${notApplied ? `, ⚠️ ${notApplied} NOT applied` : ''}${decisions.invalid.length ? `, ${decisions.invalid.length} ignored (bad decision value)` : ''}`,
  );
  if (docs.reversals.length) {
    console.log(
      `[${creditorCode}] reversed deliveries excluded: ${docs.reversals.length} pair(s), R${fmt(round2(docs.reversals.reduce((s, p) => s + p.charge, 0)))} gross`,
    );
  }
  if (docs.reusedSo.length) {
    console.log(
      `[${creditorCode}] ⚠️ ${docs.reusedSo.length} of our SO references carry >1 GRV (reference reused across loads)`,
    );
  }
  for (const m of docs.mergesFailed) console.log(`  ! merge not applied: ${m.ourKey} — ${m.reason}`);
  for (const r of docs.rejected) console.log(`  ! decision not applied: ${r.ourKey} ↔ ${r.theirKey} — ${r.reason}`);
  console.log(`Written ${reportPath}`);
  console.log(`Written ${csvPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
