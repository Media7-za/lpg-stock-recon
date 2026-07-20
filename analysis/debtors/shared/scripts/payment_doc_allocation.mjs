#!/usr/bin/env node
/**
 * Production Invoice-Linked Payment Allocation Engine (WO0001 Archetype).
 *
 * Doctrine:
 * 1. Payments: NEVER trust/use database ref_no (clerk auto-allocation noise).
 *    Instead, sum payments by doc_no/date and allocate using strict proximity and lag window logic.
 * 2. Credit Notes: DO use database ref_no to link returns to original invoices.
 * 3. Overrides: Load human-verified overrides from config/payment_pattern_overrides.json.
 * 4. Never Cascade: Disabled FIFO chronological cascade. Unmatched items remain unallocated.
 */
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pgClientOptions } from './require_database_url.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../../..');

function arg(name, fallback) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const ACCOUNT = arg('--debtor', 'WO0001');
const FROM = arg('--from', '2025-01-01');
const TO = arg('--to', '2025-12-31');
const yearLabel = FROM.slice(0, 4);

const OUT =
  arg('--out', '') ||
  path.join(ROOT, `analysis/debtors/${ACCOUNT}/reports/${ACCOUNT}_Allocation_PaymentDoc_${yearLabel}.md`);
const EDGES_OUT =
  arg('--edges-out', '') ||
  path.join(ROOT, `analysis/debtors/${ACCOUNT}/data/allocation_edges_${yearLabel}.csv`);

const client = new pg.Client(pgClientOptions());

const fmtR = (n) => 'R' + (Math.round(n * 100) / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
const fmtD = (d) => (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10);
const q = async (sql, p = []) => (await client.query(sql, p)).rows;

await client.connect();

// 1. Load human overrides if config file exists
const overridePath = path.join(ROOT, `analysis/debtors/${ACCOUNT}/config/payment_pattern_overrides.json`);
let overrides = [];
if (fs.existsSync(overridePath)) {
  try {
    overrides = JSON.parse(fs.readFileSync(overridePath, 'utf8'));
  } catch (e) {
    console.error('Warning: Failed to parse overrides config:', e.message);
  }
}

// 2. Fetch Invoices with pure LPG gas match targets
const invoiceRows = await q(
  `
  SELECT 
    LTRIM(h.doc_no,'0') as doc_no, 
    h.tx_date as date,
    ROUND(SUM(v.line_total) FILTER (WHERE v.debt_group='LPG')::numeric,2)::float as lpg_amount
  FROM transaction_headers h
  JOIN vw_clean_transactions v
    ON v.account_no=h.account_no AND v.entry_type='Invoice' AND LTRIM(v.doc_no,'0')=LTRIM(h.doc_no,'0')
  WHERE h.account_no=$1 AND h.entry_type='Invoice'
  GROUP BY h.doc_no, h.tx_date
  ORDER BY h.tx_date, h.doc_no
  `,
  [ACCOUNT]
);

const invoices = invoiceRows.map(i => ({
  docNo: i.doc_no,
  date: new Date(i.date),
  dateStr: fmtD(i.date),
  amount: i.lpg_amount
})).filter(i => i.amount > 0);

// 3. Fetch Credit Notes (LPG gas portion only) and apply to Invoices via DB ref_no mapping
const cnRows = await q(
  `
  SELECT 
    LTRIM(h.doc_no,'0') as doc_no, 
    h.tx_date as date, 
    LTRIM(h.ref_no,'0') as ref_no,
    ROUND(COALESCE(SUM(v.line_total) FILTER (WHERE v.debt_group='LPG'),0)::numeric,2)::float as amount
  FROM transaction_headers h
  LEFT JOIN vw_clean_transactions v
    ON v.account_no=h.account_no AND v.entry_type='Crd Note' AND LTRIM(v.doc_no,'0')=LTRIM(h.doc_no,'0')
  WHERE h.account_no=$1 AND h.entry_type='Crd Note' AND h.ref_no NOT IN ('','Alloc','Recon')
  GROUP BY h.doc_no, h.tx_date, h.ref_no
  ORDER BY h.tx_date, h.doc_no
  `,
  [ACCOUNT]
);

const cnMatches = [];
const matchedInvoiceDocs = new Set();

for (const cn of cnRows) {
  const inv = invoices.find(i => i.docNo === cn.ref_no);
  if (inv) {
    cnMatches.push({ cn, inv });
    matchedInvoiceDocs.add(inv.docNo);
  }
}

// Compute invoice net open after credit notes
const invoiceNetOpen = {};
for (const inv of invoices) {
  invoiceNetOpen[inv.docNo] = inv.amount;
}
for (const m of cnMatches) {
  invoiceNetOpen[m.inv.docNo] = Math.round((invoiceNetOpen[m.inv.docNo] - m.cn.amount) * 100) / 100;
}

// 4. Fetch Payments, consolidating by payment doc_no (ignoring ref_no entirely)
const pmtRows = await q(
  `
  SELECT 
    LTRIM(doc_no,'0') as doc_no, 
    tx_date as date,
    ROUND(ABS(SUM(amount_excl))::numeric,2)::float as amount
  FROM transaction_headers
  WHERE account_no=$1 AND entry_type='Payment' AND ref_no NOT IN ('Alloc','Recon')
  GROUP BY doc_no, tx_date
  ORDER BY tx_date, doc_no
  `,
  [ACCOUNT]
);

const payments = pmtRows.map(p => ({
  docNo: p.doc_no,
  date: new Date(p.date),
  dateStr: fmtD(p.date),
  amount: p.amount
})).filter(p => p.amount > 0);

// 5. Sort and run matching rules
const events = [
  ...invoices.map(i => ({ type: 'invoice', date: i.date, doc: i })),
  ...payments.map(p => ({ type: 'payment', date: p.date, doc: p }))
].sort((a, b) => a.date - b.date);

const openBalances = {};
for (const inv of invoices) {
  openBalances[inv.docNo] = invoiceNetOpen[inv.docNo];
}

const allocations = [];
const unpaidInvoices = new Set(invoices.map(i => i.docNo));

for (const ev of events) {
  if (ev.type === 'invoice') {
    // Invoice posted
  } else {
    // Payment posted
    const p = ev.doc;
    const pAmt = p.amount;
    
    const candidates = [];
    for (const invDoc of unpaidInvoices) {
      const inv = invoices.find(i => i.docNo === invDoc);
      if (inv.date <= p.date) {
        candidates.push(inv);
      }
    }
    candidates.sort((a, b) => a.date - b.date);

    let matched = false;

    // Rule 0: Process Human-Verified Overrides first
    const cleanDoc = (d) => String(d).replace(/^0+/, '');
    const ovs = overrides.filter(o => cleanDoc(o.payment_doc) === cleanDoc(p.docNo));
    if (ovs.length > 0) {
      for (const ov of ovs) {
        const inv = invoices.find(i => cleanDoc(i.docNo) === cleanDoc(ov.target_doc));
        allocations.push({
          paymentDoc: p.docNo,
          paymentDate: p.dateStr,
          amount: pAmt,
          targetDoc: ov.target_doc,
          targetDate: inv ? inv.dateStr : '',
          allocated: ov.allocated_amount,
          status: 'CONFIRMED_OVERRIDE'
        });
        openBalances[ov.target_doc] = Math.round((openBalances[ov.target_doc] - ov.allocated_amount) * 100) / 100;
        if (openBalances[ov.target_doc] <= 0.05) {
          unpaidInvoices.delete(ov.target_doc);
        }
      }
      matched = true;
    }

    // Rule 1: Primary Lag Window Proximity Match (3 to 15 days lag)
    if (!matched) {
      for (const cand of candidates) {
        const openAmt = openBalances[cand.docNo];
        if (openAmt <= 0) continue;
        const lagDays = (p.date - cand.date) / 86400000;
        
        if (lagDays >= 3 && lagDays <= 15) {
          const diff = pAmt - openAmt;
          if (Math.abs(diff) <= 5.0) {
            allocations.push({
              paymentDoc: p.docNo,
              paymentDate: p.dateStr,
              amount: pAmt,
              targetDoc: cand.docNo,
              targetDate: cand.dateStr,
              allocated: pAmt,
              status: 'CONFIRMED_LAG_PROXIMITY'
            });
            openBalances[cand.docNo] = 0;
            unpaidInvoices.delete(cand.docNo);
            matched = true;
            break;
          }
        }
      }
    }

    // Rule 2: Lag Window Split Combination Match (3 to 15 days lag)
    if (!matched && candidates.length >= 2) {
      for (let i = 0; i < candidates.length; i++) {
        for (let j = i + 1; j < candidates.length; j++) {
          const openI = openBalances[candidates[i].docNo];
          const openJ = openBalances[candidates[j].docNo];
          if (openI <= 0 || openJ <= 0) continue;
          
          const lagI = (p.date - candidates[i].date) / 86400000;
          const lagJ = (p.date - candidates[j].date) / 86400000;
          
          if (lagI >= 3 && lagI <= 15 && lagJ >= 3 && lagJ <= 15) {
            const sum2 = openI + openJ;
            const diff = pAmt - sum2;
            if (Math.abs(diff) <= 1.0) {
              allocations.push({
                paymentDoc: p.docNo,
                paymentDate: p.dateStr,
                amount: pAmt,
                targetDoc: `${candidates[i].docNo} & ${candidates[j].docNo}`,
                targetDate: `${candidates[i].dateStr} / ${candidates[j].dateStr}`,
                allocated: pAmt,
                status: 'CONFIRMED_LAG_SPLIT_BATCH'
              });
              openBalances[candidates[i].docNo] = 0;
              openBalances[candidates[j].docNo] = 0;
              unpaidInvoices.delete(candidates[i].docNo);
              unpaidInvoices.delete(candidates[j].docNo);
              matched = true;
              break;
            }
          }
        }
        if (matched) break;
      }
    }

    // Rule 3: Expanded Window Proximity Match (Up to 90 days lag)
    if (!matched) {
      for (const cand of candidates) {
        const openAmt = openBalances[cand.docNo];
        if (openAmt <= 0) continue;
        const lagDays = (p.date - cand.date) / 86400000;
        
        if (lagDays >= 0 && lagDays <= 90) {
          const diff = pAmt - openAmt;
          if (Math.abs(diff) <= 5.0) {
            allocations.push({
              paymentDoc: p.docNo,
              paymentDate: p.dateStr,
              amount: pAmt,
              targetDoc: cand.docNo,
              targetDate: cand.dateStr,
              allocated: pAmt,
              status: 'CONFIRMED_EXPANDED_PROXIMITY'
            });
            openBalances[cand.docNo] = 0;
            unpaidInvoices.delete(cand.docNo);
            matched = true;
            break;
          }
        }
      }
    }

    // Rule 4: Expanded Window Split Combination Match (Up to 90 days lag)
    if (!matched && candidates.length >= 2) {
      for (let i = 0; i < candidates.length; i++) {
        for (let j = i + 1; j < candidates.length; j++) {
          const openI = openBalances[candidates[i].docNo];
          const openJ = openBalances[candidates[j].docNo];
          if (openI <= 0 || openJ <= 0) continue;
          
          const lagI = (p.date - candidates[i].date) / 86400000;
          const lagJ = (p.date - candidates[j].date) / 86400000;
          
          if (lagI >= 0 && lagI <= 90 && lagJ >= 0 && lagJ <= 90) {
            const sum2 = openI + openJ;
            const diff = pAmt - sum2;
            if (Math.abs(diff) <= 1.0) {
              allocations.push({
                paymentDoc: p.docNo,
                paymentDate: p.dateStr,
                amount: pAmt,
                targetDoc: `${candidates[i].docNo} & ${candidates[j].docNo}`,
                targetDate: `${candidates[i].dateStr} / ${candidates[j].dateStr}`,
                allocated: pAmt,
                status: 'CONFIRMED_EXPANDED_SPLIT_BATCH'
              });
              openBalances[candidates[i].docNo] = 0;
              openBalances[candidates[j].docNo] = 0;
              unpaidInvoices.delete(candidates[i].docNo);
              unpaidInvoices.delete(candidates[j].docNo);
              matched = true;
              break;
            }
          }
        }
        if (matched) break;
      }
    }

    // Rule 5: Unallocated (No chronological FIFO cascade)
    if (!matched) {
      allocations.push({
        paymentDoc: p.docNo,
        paymentDate: p.dateStr,
        amount: pAmt,
        targetDoc: '',
        targetDate: '',
        allocated: 0,
        status: 'UNALLOCATED'
      });
    }
  }
}

// Filter reporting period
const fromD = new Date(FROM);
const toD = new Date(TO);

const periodAllocations = allocations.filter(a => {
  const d = new Date(a.paymentDate);
  return d >= fromD && d <= toD;
});

// --- Graph Connected Components (Allocation Groups) Derivation ---
const adj = new Map();
const addEdge = (u, v) => {
  const cu = String(u).replace(/^0+/, '');
  const cv = String(v).replace(/^0+/, '');
  if (!adj.has(cu)) adj.set(cu, new Set());
  if (!adj.has(cv)) adj.set(cv, new Set());
  adj.get(cu).add(cv);
  adj.get(cv).add(cu);
};

// 1. Add edges from Credit Note matches
for (const m of cnMatches) {
  addEdge(m.cn.docNo, m.inv.docNo);
}

// 2. Add edges from Payment allocations
for (const a of allocations) {
  if (a.targetDoc) {
    const targets = a.targetDoc.split('&').map(t => t.trim());
    for (const t of targets) {
      addEdge(a.paymentDoc, t);
    }
  }
}

// 3. DFS to find connected components
const visited = new Set();
const docToGroup = new Map();
let groupIdx = 1;

for (const node of adj.keys()) {
  if (!visited.has(node)) {
    const comp = [];
    const queue = [node];
    visited.add(node);
    
    while (queue.length > 0) {
      const curr = queue.shift();
      comp.push(curr);
      for (const neighbor of adj.get(curr)) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    
    // Only name groups with actual relationships (size > 1)
    if (comp.length > 1) {
      const groupId = `AG-${String(groupIdx++).padStart(6, '0')}`;
      for (const doc of comp) {
        docToGroup.set(doc, groupId);
      }
    }
  }
}

const getGroupId = (pmtDoc, targetDoc) => {
  const cp = String(pmtDoc || '').replace(/^0+/, '');
  if (docToGroup.has(cp)) return docToGroup.get(cp);
  if (targetDoc) {
    const targets = targetDoc.split('&').map(t => String(t).trim().replace(/^0+/, ''));
    for (const t of targets) {
      if (docToGroup.has(t)) return docToGroup.get(t);
    }
  }
  return '';
};

const confirmed = periodAllocations.filter(a => a.status.startsWith('CONFIRMED'));
const review = periodAllocations.filter(a => a.status === 'UNALLOCATED');

const confirmedAmt = confirmed.reduce((s, a) => s + a.allocated, 0);
const reviewAmt = review.reduce((s, a) => s + a.amount, 0);

// Generate output file CSV edges
const csvHeader = 'allocation_id,allocation_group_id,payment_doc,payment_date,payment_amount,target_doc,target_date,allocated_amount,allocation_type,confidence,review_required\n';
let allocIdx = 1;
const csvBody = periodAllocations
  .map((e) =>
    [
      `AL-${String(allocIdx++).padStart(4, '0')}`,
      getGroupId(e.paymentDoc, e.targetDoc),
      e.paymentDoc,
      e.paymentDate,
      e.amount,
      e.targetDoc || '',
      e.targetDate || '',
      e.allocated,
      e.status,
      e.status.startsWith('CONFIRMED') ? 'Confirmed' : 'Exception',
      e.status === 'UNALLOCATED' ? 'true' : 'false'
    ].join(','),
  )
  .join('\n');

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.mkdirSync(path.dirname(EDGES_OUT), { recursive: true });
fs.writeFileSync(EDGES_OUT, csvHeader + csvBody + (csvBody ? '\n' : ''));

const md = `# ${ACCOUNT} — Payment Allocation (${yearLabel})

**Period:** ${FROM} → ${TO}  
**Method:** Custom Proximity & Lag Window Engine (No DB ref_no matching, no FIFO cascade, including config/payment_pattern_overrides.json)

## Summary

| Metric | Count | Amount |
| :--- | ---: | ---: |
| Confirmed Allocations | ${confirmed.length} | ${fmtR(confirmedAmt)} |
| Unallocated / Review | ${review.length} | ${fmtR(reviewAmt)} |

## Confirmed Allocations (Grouped by Allocation Group)

| Allocation Group | Date | Payment Doc | Target Invoice | Allocated Amount | Status |
| :--- | :--- | :--- | :--- | ---: | :--- |
${confirmed
  .sort((a, b) => {
    const ga = getGroupId(a.paymentDoc, a.targetDoc) || 'ZZZZZZ';
    const gb = getGroupId(b.paymentDoc, b.targetDoc) || 'ZZZZZZ';
    return ga.localeCompare(gb) || new Date(a.paymentDate) - new Date(b.paymentDate);
  })
  .map(
    (r) =>
      `| **${getGroupId(r.paymentDoc, r.targetDoc) || '—'}** | ${r.paymentDate} | ${r.paymentDoc} | ${r.targetDoc} | ${fmtR(r.allocated)} | ${r.status} |`,
  )
  .join('\n') || '| — | — | — | — | — | — |'}

## Unallocated / Review

| Date | Payment Doc | Amount | Status |
| :--- | :--- | ---: | :--- |
${review
  .sort((a, b) => new Date(a.paymentDate) - new Date(b.paymentDate))
  .map(
    (r) =>
      `| ${r.paymentDate} | ${r.paymentDoc} | ${fmtR(r.amount)} | ${r.status} |`,
  )
  .join('\n') || '| — | — | — | — |'}

*Generated by \`payment_doc_allocation.mjs\`*
`;

fs.writeFileSync(OUT, md);
console.log('Written:', OUT);
console.log('Edges:', EDGES_OUT);
console.log('Confirmed:', confirmed.length, '| Review:', review.length);

await client.end();
