#!/usr/bin/env node
/**
 * WO0001 Turn 9 — OTHER-lane unallocated pass + allocation bridge v3.
 * Stage 7: explicit ref → OTHER-only invoices (zero LPG lines).
 * Bridge: itemize engine-open vs dashboard LPG debt residual.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEBTOR_DIR = path.resolve(__dirname, '..');
const DATA = path.join(DEBTOR_DIR, 'data');
const REPORTS = path.join(DEBTOR_DIR, 'reports');
const CONFIG = path.join(DEBTOR_DIR, 'config');

const ANCHOR = '2026-06-03';
const DASHBOARD_LPG = 92844.18;
const TURN8_OPEN = 101774.13;
const TOL = 0.05;

const fmtR = (n) =>
  'R' +
  (Math.round(n * 100) / 100)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
const round2 = (n) => Math.round(n * 100) / 100;
const clean = (d) => String(d ?? '').replace(/^0+/, '') || '0';

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map((line) => {
    const cols = [];
    let cur = '',
      inQ = false;
    for (const ch of line) {
      if (ch === '"') {
        inQ = !inQ;
        continue;
      }
      if (ch === ',' && !inQ) {
        cols.push(cur);
        cur = '';
        continue;
      }
      cur += ch;
    }
    cols.push(cur);
    const o = {};
    headers.forEach((h, i) => {
      o[h] = cols[i] ?? '';
    });
    return o;
  });
}

function loadInvoices() {
  const rows = parseCsv(fs.readFileSync(path.join(DATA, 'invoices.csv'), 'utf8'));
  const docs = new Map();
  for (const r of rows) {
    const doc = clean(r.doc_no);
    if (!docs.has(doc)) {
      docs.set(doc, {
        doc,
        entryType: r.entry_type,
        txDate: r.tx_date,
        lpg: 0,
        other: 0,
        agr: 0,
      });
    }
    const d = docs.get(doc);
    const amt = parseFloat(r.amount_incl) || 0;
    if (r.lane === 'LPG' || r.debt_group === 'LPG') d.lpg = round2(d.lpg + amt);
    else if (r.lane === 'OTHER' || r.debt_group === 'OTHER') d.other = round2(d.other + amt);
    else if (r.lane === 'AGR' || r.debt_group === 'AGR') d.agr = round2(d.agr + amt);
  }
  return docs;
}

function loadPaidByInv() {
  const rows = parseCsv(fs.readFileSync(path.join(DATA, 'allocation_edges.csv'), 'utf8'));
  const paid = new Map();
  for (const r of rows) {
    if (!r.target_doc || r.allocation_type === 'UNALLOCATED') continue;
    const amt = parseFloat(r.allocated_amount) || 0;
    if (amt <= 0) continue;
    const k = clean(r.target_doc);
    paid.set(k, round2((paid.get(k) || 0) + amt));
  }
  return paid;
}

function discoverOtherLaneMatches(docs, edges) {
  const unalloc = edges.filter(
    (e) => e.allocation_type === 'UNALLOCATED' && e.payment_date <= ANCHOR,
  );
  const matches = [];
  let id = 1;
  for (const e of unalloc) {
    const ref = clean(e.target_doc);
    if (!ref) continue;
    const inv = docs.get(ref);
    if (!inv || inv.entryType !== 'Invoice') continue;
    if (inv.lpg > TOL) continue;
    const pmtAmt = parseFloat(e.payment_amount) || 0;
    const otherAmt = round2(inv.other + inv.agr);
    if (otherAmt <= TOL) continue;
    if (Math.abs(pmtAmt - otherAmt) > TOL) continue;
    matches.push({
      allocation_id: `AL-O-${String(id++).padStart(3, '0')}`,
      payment_doc: e.payment_doc,
      payment_date: e.payment_date,
      batch_ref: e.batch_ref,
      payment_amount: pmtAmt,
      target_doc: ref,
      target_date: inv.txDate,
      target_lane: 'OTHER',
      target_amount: otherAmt,
      allocated_amount: pmtAmt,
      residual_after_allocation: 0,
      allocation_type: 'OTHER_LANE_EXPLICIT_REF',
      evidence_source: 'ERP_LEDGER',
      confidence: 'Confirmed',
      commercially_confirmed: false,
      review_required: false,
      notes: `OTHER-only invoice; LPG=0. Cent-aligned ref ${ref} → OTHER R${otherAmt.toFixed(2)}.`,
      source_edge_id: e.allocation_id,
    });
  }
  return matches;
}

function computeOutstanding(docs, paidByInv, cnMerged) {
  const netLpg = new Map();
  const invoices = [...docs.values()].filter((d) => d.entryType === 'Invoice' && d.lpg > TOL);
  for (const inv of invoices) netLpg.set(inv.doc, inv.lpg);
  for (const off of cnMerged.offsets) {
    const cur = netLpg.get(clean(off.targetInv));
    if (cur !== undefined) netLpg.set(clean(off.targetInv), round2(cur - off.cnLpg));
  }
  const outstanding = [];
  for (const inv of invoices) {
    const net = netLpg.get(inv.doc) ?? inv.lpg;
    if (net <= TOL) continue;
    const paid = paidByInv.get(inv.doc) || 0;
    const open = round2(Math.max(0, net - paid));
    if (open <= TOL) continue;
    outstanding.push({
      doc: inv.doc,
      date: inv.txDate,
      lpg: inv.lpg,
      other: inv.other,
      netTarget: round2(net + inv.other),
      engineOpen: open,
      paid,
      netLpg: net,
    });
  }
  outstanding.sort((a, b) => a.date.localeCompare(b.date) || a.doc.localeCompare(b.doc));
  return outstanding;
}

function buildBridgeRegister(outstanding, edges) {
  const unalloc = edges.filter(
    (e) => e.allocation_type === 'UNALLOCATED' && e.payment_date <= ANCHOR,
  );

  const truncOpen = outstanding.filter((r) => r.engineOpen <= 1 && r.engineOpen > 0);
  const truncSum = round2(truncOpen.reduce((s, r) => s + r.engineOpen, 0));

  // DN-lag instalment cluster — Inv 41067: unallocated slices = engine open (PROVEN)
  const inv41067 = outstanding.find((r) => r.doc === '41067');
  const lag41067 = unalloc.filter((e) => clean(e.target_doc) === '41067');
  const lag41067Sum = round2(lag41067.reduce((s, e) => s + (parseFloat(e.payment_amount) || 0), 0));
  const dnLag41067Credit =
    inv41067 && Math.abs(lag41067Sum - inv41067.engineOpen) <= TOL ? inv41067.engineOpen : 0;

  const items = [];
  if (dnLag41067Credit > 0) {
    items.push({
      id: 'BR-001',
      category: 'DN_LAG_INSTALMENT',
      invoice: '41067',
      amount: dnLag41067Credit,
      tag: 'PROVEN',
      reason:
        'Four DN-lag prepay slices (Pmt 36494/36462/36787/36969) sum R8,612.52 = engine open. ERP credited cash; engine retained invoice open.',
      payment_docs: lag41067.map((e) => clean(e.payment_doc)),
    });
  }
  if (truncSum > 0) {
    items.push({
      id: 'BR-002',
      category: 'TRUNCATION_MICRO_OPEN',
      invoice: '(10 invoices)',
      amount: truncSum,
      tag: 'ASSERTED',
      reason: 'Whole-Rand payment truncation; proposed overrides in allocation_overrides_proposed.json.',
      payment_docs: [],
    });
  }

  const bridgeCredit = round2(items.reduce((s, i) => s + i.amount, 0));
  const adjustedOpen = round2(TURN8_OPEN - bridgeCredit);
  const residualGap = round2(adjustedOpen - DASHBOARD_LPG);

  return { items, truncOpen, bridgeCredit, adjustedOpen, residualGap, lag41067, lag41067Sum };
}

function writeOtherEdgesCsv(matches) {
  const headers = [
    'allocation_id',
    'payment_doc',
    'payment_date',
    'batch_ref',
    'payment_amount',
    'target_doc',
    'target_date',
    'target_lane',
    'target_amount',
    'allocated_amount',
    'residual_after_allocation',
    'allocation_type',
    'evidence_source',
    'confidence',
    'commercially_confirmed',
    'review_required',
    'notes',
    'source_edge_id',
  ];
  const lines = [headers.join(',')];
  for (const m of matches) {
    lines.push(
      headers
        .map((h) => {
          const v = m[h] ?? '';
          return String(v).includes(',') ? `"${v}"` : v;
        })
        .join(','),
    );
  }
  fs.writeFileSync(path.join(DATA, 'allocation_other_edges.csv'), lines.join('\n') + '\n');
}

function extendProposedOverrides(matches) {
  const pathOverrides = path.join(CONFIG, 'allocation_overrides_proposed.json');
  const existing = JSON.parse(fs.readFileSync(pathOverrides, 'utf8'));
  const existingKeys = new Set(existing.map((o) => `${o.payment_doc}:${o.target_doc}`));
  for (const m of matches) {
    const key = `${m.payment_doc}:${m.target_doc}`;
    if (existingKeys.has(key)) continue;
    existing.push({
      payment_doc: m.payment_doc,
      payment_date: m.payment_date,
      target_doc: m.target_doc,
      allocated_amount: m.allocated_amount,
      override_type: 'VERIFIED_EXPLICIT_REF',
      approval_status: 'proposed',
      approved_by: null,
      approved_date: null,
      reason: m.notes,
      evidence_source: 'ERP_LEDGER',
      reconciled_month: m.payment_date.slice(0, 7),
      target_lane: 'OTHER',
      residual_open_after: 0,
    });
  }
  fs.writeFileSync(pathOverrides, JSON.stringify(existing, null, 2) + '\n');
}

function main() {
  const docs = loadInvoices();
  const edges = parseCsv(fs.readFileSync(path.join(DATA, 'allocation_edges.csv'), 'utf8'));
  const cnMerged = JSON.parse(fs.readFileSync(path.join(DATA, 'cn_offsets_merged.json'), 'utf8'));
  const paidByInv = loadPaidByInv();
  const outstanding = computeOutstanding(docs, paidByInv, cnMerged);
  const engineOpenSum = round2(outstanding.reduce((s, r) => s + r.engineOpen, 0));

  const otherMatches = discoverOtherLaneMatches(docs, edges);
  writeOtherEdgesCsv(otherMatches);
  extendProposedOverrides(otherMatches.filter((m) => clean(m.payment_doc) !== '43139'));

  const noLpgUnalloc = edges.filter(
    (e) =>
      e.allocation_type === 'UNALLOCATED' &&
      e.payment_date <= ANCHOR &&
      (e.notes || '').includes('No LPG'),
  );
  const bridge = buildBridgeRegister(outstanding, edges);
  const inv41067 = outstanding.find((r) => r.doc === '41067');
  const dnLag41067Credit = bridge.items.find((i) => i.id === 'BR-001')?.amount ?? 0;

  fs.writeFileSync(
    path.join(DATA, 'unallocated_credit_bridge.json'),
    JSON.stringify(
      {
        turn: 'WO0001-9',
        anchor: ANCHOR,
        dashboard_lpg: DASHBOARD_LPG,
        turn8_engine_open: TURN8_OPEN,
        engine_open_recomputed: engineOpenSum,
        gap_before_bridge: round2(engineOpenSum - DASHBOARD_LPG),
        bridge_items: bridge.items,
        bridge_credit_total: bridge.bridgeCredit,
        adjusted_engine_open: bridge.adjustedOpen,
        residual_gap: bridge.residualGap,
        other_lane_matches: otherMatches.length,
        other_lane_sum: round2(otherMatches.reduce((s, m) => s + m.allocated_amount, 0)),
        no_lpg_unalloc_count: noLpgUnalloc.length,
        no_lpg_unalloc_sum: round2(
          noLpgUnalloc.reduce((s, e) => s + (parseFloat(e.payment_amount) || 0), 0),
        ),
      },
      null,
      2,
    ) + '\n',
  );

  const bridgeMd = `# WO0001 — Statement Bridge (v3)

**Turn:** WO0001-9  
**Generated:** ${new Date().toISOString().slice(0, 10)}  
**Anchor:** ${ANCHOR}

---

## 1. Turn progression

| Metric | Turn 7 | Turn 8 | Turn 9 |
| :--- | ---: | ---: | ---: |
| CN offsets (DN gate) | 0 | 5 | 5 |
| Engine-open sum | ${fmtR(161214.89)} | ${fmtR(TURN8_OPEN)} | ${fmtR(engineOpenSum)} |
| Gap vs LPG debt | ${fmtR(68370.71)} | ${fmtR(8929.95)} | ${fmtR(round2(engineOpenSum - DASHBOARD_LPG))} |
| After bridge credits | — | — | ${fmtR(bridge.adjustedOpen)} |
| **Residual gap** | — | — | **${fmtR(bridge.residualGap)}** |

---

## 2. Two-lane ERP (unchanged — PROVEN)

| Component | Amount |
| :--- | ---: |
| LPG gas debt | ${fmtR(DASHBOARD_LPG)} |
| Cylinder financial | R17 945,18 |
| **ERP balance ${ANCHOR}** | **R110 789,36** |

---

## 3. OTHER-lane pass (Stage 7)

Explicit ref → **OTHER-only** invoices (zero LPG lines). Staged in \`data/allocation_other_edges.csv\`; does **not** alter LPG engine-open.

| Payment | Date | Ref | OTHER amt | Tag |
| :--- | :--- | :--- | ---: | :--- |
${otherMatches.map((m) => `| ${clean(m.payment_doc)} | ${m.payment_date} | ${m.target_doc} | ${fmtR(m.allocated_amount)} | Confirmed |`).join('\n')}

**Count:** ${otherMatches.length} · **Sum:** ${fmtR(round2(otherMatches.reduce((s, m) => s + m.allocated_amount, 0)))}

"No LPG" unallocated pool (full ledger, informational): ${noLpgUnalloc.length} edges · ${fmtR(round2(noLpgUnalloc.reduce((s, e) => s + (parseFloat(e.payment_amount) || 0), 0)))}

---

## 4. Unallocated credit bridge (LPG-scoped)

| ID | Category | Invoice | Credit | Tag |
| :--- | :--- | :--- | ---: | :--- |
${bridge.items.map((i) => `| ${i.id} | ${i.category} | ${i.invoice} | ${fmtR(i.amount)} | ${i.tag} |`).join('\n')}
| | **Bridge credit total** | | **${fmtR(bridge.bridgeCredit)}** | |
| | Adjusted engine-open | | **${fmtR(bridge.adjustedOpen)}** | |
| | Dashboard LPG debt | | ${fmtR(DASHBOARD_LPG)} | |
| | **Residual gap** | | **${fmtR(bridge.residualGap)}** | DEFECT |

### BR-001 — Inv 41067 DN-lag instalment (PROVEN)

| Payment | Date | Amount | Note |
| :--- | :--- | ---: | :--- |
${bridge.lag41067.map((e) => `| ${clean(e.payment_doc)} | ${e.payment_date} | ${fmtR(parseFloat(e.payment_amount))} | DN-lag prepay |`).join('\n')}
| **Sum** | | **${fmtR(bridge.lag41067Sum)}** | = engine open ${fmtR(inv41067?.engineOpen ?? 0)} |

### BR-002 — Truncation micro-open (ASSERTED)

${bridge.truncOpen.map((r) => `- Inv **${r.doc}** — ${fmtR(r.engineOpen)}`).join('\n')}

Proposed ratification: \`config/allocation_overrides_proposed.json\` (4 trunc + 1 OTHER entries).

---

## 5. Residual defect (${fmtR(bridge.residualGap)})

Named drivers for operator review (not cent-closed):

| Driver | Estimate | Evidence |
| :--- | ---: | :--- |
| Inv 39895 DN-lag prepay tail | ~R2 070 | Pmt 35345 R8 056,64 prepay vs open R5 986,64 |
| Historic partial tails (11882/12112 × R1 380) | R2 760 | LPG partial; no unallocated ref match |
| Inv 39063 / Pmt 35691 duplicate cluster | review | 35691 UNALLOCATED ref 39164 (39164 closed via 36042) |
| Post-anchor Inv 51007 | R12 818 | Paid 2026-06-18 (post portfolio anchor) — correct at anchor |

**STOP:** Residual ${fmtR(bridge.residualGap)} ≠ ±R0,05. Do **not** set \`reconState: complete\`.

---

## 6. Next steps

1. **Operator:** Ratify \`allocation_overrides_proposed.json\` + \`cn_dn_gate_proposed.json\`
2. **Operator:** Review residual ${fmtR(bridge.residualGap)} — 39895 DN-lag + partial tails
3. **Sources:** ERP TXT refresh (CURRENT R88 768,73 vs anchor R110 789,36)
4. **Worker (conditional):** 39895 DN-lag disposition if operator approves credit bridge extension

---

*OTHER edges: \`data/allocation_other_edges.csv\` · Bridge register: \`data/unallocated_credit_bridge.json\`*
`;

  fs.writeFileSync(path.join(REPORTS, 'WO0001_Statement_Bridge_v3.md'), bridgeMd);

  const outMd = `# WO0001 — Full Ledger Allocation (Turn 9)

**Method:** Turn 8 CN gate + Turn 9 bridge credits (virtual)  
**Turn:** WO0001-9  
**Generated:** ${new Date().toISOString().slice(0, 10)}

## Summary

| Metric | Turn 8 | Turn 9 bridge | Turn 9 adjusted |
| :--- | ---: | ---: | ---: |
| Engine-open sum | ${fmtR(TURN8_OPEN)} | ${fmtR(bridge.bridgeCredit)} credit | ${fmtR(bridge.adjustedOpen)} |
| Gap vs LPG debt | ${fmtR(8929.95)} | — | **${fmtR(bridge.residualGap)}** |
| OTHER-lane staged | — | ${otherMatches.length} edges | ${fmtR(round2(otherMatches.reduce((s, m) => s + m.allocated_amount, 0)))} |

## Virtual bridge adjustments (not in allocation_edges.csv)

| ID | Invoice | Credit | Effect |
| :--- | :--- | ---: | :--- |
${bridge.items.map((i) => `| ${i.id} | ${i.invoice} | ${fmtR(i.amount)} | Reduce engine-open |`).join('\n')}

## Outstanding (unchanged — raw engine)

| Invoice | Date | LPG | Engine open | Paid |
| :--- | :--- | ---: | ---: | ---: |
${outstanding.map((r) => `| ${r.doc} | ${r.date} | ${fmtR(r.lpg)} | ${fmtR(r.engineOpen)} | ${fmtR(r.paid)} |`).join('\n')}

**Edges:** \`data/allocation_edges.csv\` (unchanged)  
**OTHER:** \`data/allocation_other_edges.csv\` (new)

*Generated by \`scripts/other_lane_pass.mjs\`*
`;

  fs.writeFileSync(path.join(REPORTS, 'WO0001_Allocation_Outstanding.md'), outMd);

  const reportMd = `# WO0001 Turn 9 — Worker Report

**Lane:** \`allocation\` · **Objective:** OTHER-lane unallocated pass + close LPG gap

---

## Outcome

| Metric | Turn 8 | Turn 9 |
| :--- | ---: | ---: |
| Gap vs LPG debt | ${fmtR(8929.95)} | **${fmtR(bridge.residualGap)}** (after bridge) |
| OTHER-lane matches staged | 0 | **${otherMatches.length}** |
| Bridge credits itemized | 0 | **${bridge.items.length}** (${fmtR(bridge.bridgeCredit)}) |

**PROVEN:** Inv **41067** DN-lag instalment cluster — unallocated slices = engine open (${fmtR(dnLag41067Credit)} exact).

**PROVEN:** ${otherMatches.length} OTHER-only explicit-ref matches cent-aligned (${fmtR(round2(otherMatches.reduce((s, m) => s + m.allocated_amount, 0)))}).

**STOP:** Residual gap **${fmtR(bridge.residualGap)}** ≠ ±R0,05. Do not set \`reconState: complete\`. \`allocation_edges.csv\` unchanged pending operator ratification.

---

## Deliverables

| Artifact | Path |
| :--- | :--- |
| OTHER-lane edges | \`data/allocation_other_edges.csv\` |
| Credit bridge register | \`data/unallocated_credit_bridge.json\` |
| Statement bridge v3 | \`reports/WO0001_Statement_Bridge_v3.md\` |
| Outstanding (updated) | \`reports/WO0001_Allocation_Outstanding.md\` |
| Overrides (extended) | \`config/allocation_overrides_proposed.json\` |

---

## Operator actions

1. Ratify truncation overrides (4) + OTHER edges (${otherMatches.length})
2. Ratify \`cn_dn_gate_proposed.json\` (Turn 8)
3. Review residual **${fmtR(bridge.residualGap)}** — 39895 DN-lag, partial tails 11882/12112
`;

  fs.writeFileSync(path.join(REPORTS, 'WO0001_Turn9_Worker_Report.md'), reportMd);

  console.log(
    JSON.stringify(
      {
        otherMatches: otherMatches.length,
        otherSum: round2(otherMatches.reduce((s, m) => s + m.allocated_amount, 0)),
        bridgeCredit: bridge.bridgeCredit,
        adjustedOpen: bridge.adjustedOpen,
        residualGap: bridge.residualGap,
      },
      null,
      2,
    ),
  );
}

main();
