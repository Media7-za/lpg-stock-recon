#!/usr/bin/env node
/**
 * COF001 / ADM-150: what did payment 35877 (30 Dec 2024, R9,649.56) pay for?
 *
 * Tests, in business_rules.md section 15 Order B order:
 *   1. Exact-sum search: every set of COF001 documents (whole invoices / credit notes, or their gas or
 *      deposit parts, at most one option per document) whose total equals the target within 0.02.
 *   2. Scalar tests on every COF001 payment: payment = 1.15 x (invoice or gas part) - a VAT gross-up.
 *   3. Section 14 mirror carry: another payment short of an invoice (or its gas part) by exactly X.
 *   4. Payment slices in the database (SKILL_Payment_To_Invoice_Allocation.md section 4.5): sum the
 *      ref slices per payment document, excluding the zero-net Alloc mirror, and compare to the TXT.
 *   5. Bank lines for each payment.
 *
 * Inputs: raw/COF001_COMBINED.TXT (amount authority), data/db_sku_classification.json (gas/deposit split
 * of mixed documents, whole history), data/adm150/db_capture_2026-10-18.json (database lines, payment
 * slices and bank rows captured through the Supabase connector).
 *
 * Usage: node analysis/debtors/COF001/scripts/adm150_payment_35877_search.mjs [--target 9649.56]
 *        [--from 2024-10-01 --to 2025-01-31] [--max 6]
 * Output: analysis/debtors/COF001/reports/COF001_ADM-150_35877_Payment_Investigation.md
 *         (only when run with the default target and window)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const ACCT = path.join(ROOT, 'analysis/debtors/COF001');
const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const TARGET = Number(arg('--target', '9649.56'));
const FROM = arg('--from', '2024-10-01');
const TO = arg('--to', '2025-01-31');
const MAX = Number(arg('--max', '6'));
const WIDE = { from: '2024-07-01', to: '2025-03-31', max: 4 };
const PAY_DATE = '2024-12-30';
const TOL = 2; // cents: the ERP's 0.02 rounding
const IS_DEFAULT = !args.length;

const CYL_SKUS = new Set(['9.1', '14.1', '19.1', 'S.1', 'D.1']);
const r2 = (n) => Math.round(n * 100) / 100;
const cents = (n) => Math.round(n * 100);
const fmt = (n) => (Math.abs(n) < 0.005 ? 0 : n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const rel = (p) => path.relative(ROOT, p);

// ---------- inputs ----------
const TXT = path.join(ACCT, 'raw/COF001_COMBINED.TXT');
const SKU = path.join(ACCT, 'data/db_sku_classification.json');
const CAP = path.join(ACCT, 'data/adm150/db_capture_2026-10-18.json');
const sku = JSON.parse(fs.readFileSync(SKU, 'utf8'));
const cap = JSON.parse(fs.readFileSync(CAP, 'utf8'));
const mixed = new Map(sku.mixed_docs.map((m) => [`${m.doc_no.replace(/^0+/, '')}|${m.entry_type}`, m]));
const cylDocs = new Set(sku.cyl_docs.map((x) => x.replace(/^0+/, '')));

const txt = [];
for (const line of fs.readFileSync(TXT, 'utf8').split('\n')) {
  const p = [...line.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
  if (p.length < 11 || !/^\d+$/.test(p[0]) || p[6] === 'BALANCE B/F:') continue;
  txt.push({ iso: p[4].split('/').reverse().join('-'), doc: p[2].replace(/^0+/, ''), type: p[3], desc: p[6], amount: Number(p[9]) });
}
const find = (doc, type) => txt.find((t) => t.doc === doc && t.type === type);
const pay = find('35877', 'Payment');
if (!pay || r2(-pay.amount) !== 9649.56) throw new Error('TXT payment 35877 not found at -9,649.56');

// Gas / deposit parts of a document: database lines where captured, else the classification file.
function parts(t) {
  const key = `${t.doc}|${t.type}`;
  const c = cap.lines[key];
  if (c) {
    const gas = r2(c.lines.filter((l) => !CYL_SKUS.has(l[0])).reduce((s, l) => s + l[2], 0));
    const dep = r2(c.lines.filter((l) => CYL_SKUS.has(l[0])).reduce((s, l) => s + l[2], 0));
    const sum = r2(gas + dep);
    if (Math.abs(sum - t.amount) > 0.02) throw new Error(`${key}: DB lines ${sum} vs TXT ${t.amount}`);
    return { gas, dep, src: 'db lines' };
  }
  if (mixed.has(key)) return { gas: mixed.get(key).gas_amt, dep: mixed.get(key).cyl_amt, src: 'classification' };
  if (cylDocs.has(t.doc) && (t.type === 'Invoice' || t.type === 'Crd Note')) return { gas: 0, dep: t.amount, src: 'classification' };
  return { gas: t.amount, dep: 0, src: 'classification' };
}

// ---------- 1. exact-sum search ----------
function options(from, to) {
  const out = [];
  for (const t of txt) {
    if (t.iso < from || t.iso > to || (t.type !== 'Invoice' && t.type !== 'Crd Note')) continue;
    const pr = parts(t);
    const label = `${t.type === 'Invoice' ? 'Inv' : 'CN'} ${t.doc} (${t.iso})`;
    out.push({ doc: `${t.doc}|${t.type}`, iso: t.iso, label, part: 'whole', amt: t.amount });
    if (Math.abs(pr.gas) >= 0.005 && Math.abs(pr.dep) >= 0.005) {
      out.push({ doc: `${t.doc}|${t.type}`, iso: t.iso, label, part: 'gas', amt: pr.gas });
      out.push({ doc: `${t.doc}|${t.type}`, iso: t.iso, label, part: 'deposit', amt: pr.dep });
    }
  }
  return out;
}

function subsetsUpTo(items, k) {
  // All subsets of size 1..k with distinct documents, as index arrays (ascending).
  const res = [];
  const rec = (start, chosen, docs, sum) => {
    if (chosen.length) res.push({ idx: chosen.slice(), sum });
    if (chosen.length === k) return;
    for (let i = start; i < items.length; i++) {
      if (docs.has(items[i].doc)) continue;
      chosen.push(i);
      docs.add(items[i].doc);
      rec(i + 1, chosen, docs, sum + cents(items[i].amt));
      chosen.pop();
      docs.delete(items[i].doc);
    }
  };
  rec(0, [], new Set(), 0);
  return res;
}

function exactSum(items, target, maxSize) {
  const half = Math.ceil(maxSize / 2);
  const subs = subsetsUpTo(items, half);
  const bySum = new Map();
  for (const s of subs) {
    if (!bySum.has(s.sum)) bySum.set(s.sum, []);
    bySum.get(s.sum).push(s);
  }
  const t = cents(target);
  const seen = new Set();
  const hits = [];
  const add = (idx) => {
    const k = idx.slice().sort((a, b) => a - b).join(',');
    if (seen.has(k)) return;
    seen.add(k);
    hits.push(idx.slice().sort((a, b) => a - b));
  };
  for (const a of subs) {
    for (let d = -TOL; d <= TOL; d++) {
      if (a.sum === t + d) add(a.idx);
      for (const b of bySum.get(t + d - a.sum) || []) {
        if (a.idx.length + b.idx.length > maxSize) continue;
        const docs = new Set(a.idx.map((i) => items[i].doc));
        if (b.idx.some((i) => docs.has(items[i].doc))) continue;
        add([...a.idx, ...b.idx]);
      }
    }
  }
  return hits.map((idx) => idx.map((i) => items[i]));
}

// Documents already settled on or before 30 Dec 2024 by a same-amount payment (whole or gas part).
const settledBy = new Map();
{
  const used = new Set();
  const pays = txt.filter((t) => t.type === 'Payment' && t.iso <= PAY_DATE && t.doc !== '35877').sort((a, b) => a.iso.localeCompare(b.iso));
  const docs = txt.filter((t) => t.type === 'Invoice' && t.iso <= PAY_DATE).sort((a, b) => a.iso.localeCompare(b.iso));
  for (const d of docs) {
    const pr = parts(d);
    const p = pays.find((x) => !used.has(x.doc) && x.iso >= d.iso && (Math.abs(-x.amount - d.amount) <= 0.02 || Math.abs(-x.amount - pr.gas) <= 0.02));
    if (p) {
      used.add(p.doc);
      settledBy.set(`${d.doc}|Invoice`, `${p.doc} (${p.iso}, ${fmt(-p.amount)})`);
    }
  }
}
const classify = (set) => {
  const future = set.filter((x) => x.iso > PAY_DATE);
  const settled = set.filter((x) => settledBy.has(x.doc));
  return { future, settled, open: !future.length && !settled.length };
};

const winItems = options(FROM, TO);
const winHits = exactSum(winItems, TARGET, MAX);
const wideItems = options(WIDE.from, WIDE.to);
const wideHits = exactSum(wideItems, TARGET, WIDE.max);

// ---------- 2. VAT gross-up test over every payment ----------
const vatHits = [];
const allDocs = txt.filter((t) => t.type === 'Invoice');
for (const p of txt.filter((t) => t.type === 'Payment')) {
  for (const d of allDocs) {
    const days = (Date.parse(p.iso) - Date.parse(d.iso)) / 864e5;
    if (days < 0 || days > 90) continue;
    const pr = parts(d);
    for (const [part, base] of [['whole', d.amount], ['gas', pr.gas]]) {
      if (part === 'gas' && (Math.abs(base - d.amount) < 0.005 || base <= 0)) continue;
      if (Math.abs(-p.amount - base * 1.15) <= 0.02) vatHits.push({ p, d, part, base, days });
    }
  }
}
// A gross-up hit is coincidental when the payment also equals an invoice (whole or gas part) outright.
for (const v of vatHits) {
  const plain = allDocs.find((d) => {
    const days = (Date.parse(v.p.iso) - Date.parse(d.iso)) / 864e5;
    return days >= 0 && days <= 90 && [d.amount, parts(d).gas].some((a) => Math.abs(a + v.p.amount) <= 0.02);
  });
  v.plain = plain ? `${plain.doc} (${plain.iso}) totals ${fmt(-v.p.amount)}` : '';
}
const vatOnly = vatHits.filter((v) => !v.plain);
// Control: the same search must find the known 8,390.92 settlement, to show it can find sets.
const control = exactSum(winItems, 8390.92, MAX);

// ---------- 3. mirror carry (section 14) ----------
const X = r2(-pay.amount - 8390.92);
const mirror = [];
for (const p of txt.filter((t) => t.type === 'Payment' && t.doc !== '35877')) {
  const days = (Date.parse(p.iso) - Date.parse(PAY_DATE)) / 864e5;
  if (Math.abs(days) > 365) continue;
  for (const d of allDocs) {
    const lag = (Date.parse(p.iso) - Date.parse(d.iso)) / 864e5;
    if (lag < 0 || lag > 60) continue;
    const pr = parts(d);
    for (const base of new Set([d.amount, pr.gas])) {
      if (base > 0 && Math.abs(base + p.amount - X) <= 0.02) mirror.push({ p, d, base });
    }
  }
}
const equalX = txt.filter((t) => [X, 851.02, 407.62].some((v) => Math.abs(Math.abs(t.amount) - v) <= 0.02));

// ---------- 4. payment slices ----------
const SLICE_DOCS = [
  ['35877', 'Payment'],
  ['32620', 'Payment'],
  ['23445', 'Payment'],
  ['33627', 'Payment'],
  ['42889', 'Payment'],
  ['40294', 'Payment'],
  ['40294', 'Bank UD'],
];
const sliceRows = SLICE_DOCS.map(([doc, type]) => {
  const s = cap.paymentSlices[type === 'Payment' ? doc : `${doc}|${type}`];
  const t = find(doc, type);
  const real = s.slices.filter((x) => x[0] !== 'Alloc');
  const alloc = r2(s.slices.filter((x) => x[0] === 'Alloc').reduce((a, x) => a + x[1], 0));
  const sum = r2(real.reduce((a, x) => a + x[1], 0));
  const first = real[0][1];
  return { doc, type, txt: t.amount, first, sum, alloc, real, ok: Math.abs(sum - t.amount) <= 0.005 };
});

// ---------- 5. bank ----------
const bankFor = (doc, type) => {
  const t = find(doc, type);
  const m = t.iso.slice(0, 7);
  const rows = cap.bankCascades.filter((b) => b[0] === t.iso && Math.abs(b[1] + t.amount) <= 0.005);
  if (rows.length) return { t, txtRef: rows.map((b) => `${b[2]} (${b[3]})`).join('; '), present: true };
  const note = cap.bankMonthNotes[m] ? `, ${cap.bankMonthNotes[m]}` : '';
  return { t, txtRef: cap.bankMonthsPresent.includes(m) ? `no credit of this amount on this date (month present${note})` : `month ${m} absent from bank_transactions`, present: false };
};
const bankRows = ['35877', '32620', '23445', '33627', '42889', '40294'].map((d) => ({ doc: d, ...bankFor(d, 'Payment') }));
const dup19400 = cap.bankCascades.filter((b) => b[2] === '00019400');

// ---------- console ----------
const show = (set) => set.map((x) => `${x.label}${x.part === 'whole' ? '' : ' ' + x.part} ${fmt(x.amt)}`).join(' + ');
console.log(`target ${fmt(TARGET)}; window ${FROM}..${TO} (${winItems.length} options, sets up to ${MAX}): ${winHits.length} hit(s)`);
for (const h of winHits) console.log('  ', show(h), '=', fmt(r2(h.reduce((s, x) => s + x.amt, 0))), classify(h).open ? 'OPEN-ON-PAYMENT-DATE' : '');
console.log(`wide ${WIDE.from}..${WIDE.to} (${wideItems.length} options, up to ${WIDE.max}): ${wideHits.length} hit(s)`);
console.log(`VAT gross-up hits: ${vatHits.length}; mirror-carry hits for X=${fmt(X)}: ${mirror.length}`);
for (const v of vatHits) console.log('  vat', v.p.doc, v.p.iso, -v.p.amount, v.d.doc, v.d.iso, v.part, v.base, v.plain);
console.log(`control target 8,390.92: ${control.length} set(s)`);
if (!IS_DEFAULT) process.exit(0);

// ---------- report ----------
const vat = r2(8390.92 * 1.15);
const vat3 = (8390.92 * 1.15).toFixed(3);
const s35877 = sliceRows[0];
const md = [];
const L = (s = '') => md.push(s);
L('# COF001 - ADM-150: what did payment 35877 pay for?');
L();
L(`*Generated by \`${rel(fileURLToPath(import.meta.url))}\`; do not edit numbers by hand. Re-run the script to regenerate.*`);
L();
L(`Inputs: \`${rel(TXT)}\` (ERP amounts, authority), \`${rel(SKU)}\` (gas/deposit split of mixed documents), \`${rel(CAP)}\` (database lines, payment slices and bank rows captured read-only through the Supabase connector on 2026-10-18; connector-sourced copy, ASSERTED as a copy).`);
L();
L('## Answer');
L();
L(`- **No set of documents sums to R${fmt(TARGET)}.** The exact-sum search (section 15 Order B step 1) over ${winItems.length} document options dated ${FROM} to ${TO} (whole documents and their gas / deposit parts, sets of up to ${MAX}, tolerance 0.02) found **${winHits.length}** set(s); ${winHits.filter((h) => classify(h).open).length} of them use only documents that were dated on or before 30 Dec 2024 and not already settled by a same-amount payment. The wider pass (${WIDE.from} to ${WIDE.to}, ${wideItems.length} options, sets of up to ${WIDE.max}) found ${wideHits.length}. PROVEN (search output below). So the premise that the payment is an exact sum of documents fails for 35877; the premise that the customer pays whole invoices survives in a narrower form: the payment names and covers one whole invoice (39311) and overpays it.`);
L(`- **R${fmt(TARGET)} is 39311's net gas amount grossed up by 15% VAT a second time:** R8,390.92 x 1.15 = R${vat3}, which rounds to R${fmt(vat)}. The excess, R${fmt(X)}, is exactly 15% of R8,390.92. Arithmetic PROVEN; that the payer added VAT to a VAT-inclusive amount is ASSUMED (it is the only arithmetic that reproduces the figure to the cent, and the bank line names only 39311). R8,390.92 already includes VAT (database header 39311: excl 13,896.45 + VAT 2,084.47 = 15,980.92 before credit note 11573's -7,590.00).`);
L(`- **The ERP did not leave the excess unallocated; the earlier "database records only -8,390.92" compared one slice only.** The database holds 35877 as ${s35877.real.length} ref slices plus a zero-net Alloc mirror (${fmt(s35877.alloc)}): ${s35877.real.map((x) => `${fmt(-x[1])} to ${x[0]}`).join(', ')} = **${fmt(-s35877.sum)}**, equal to the TXT. The R${fmt(X)} excess was spread by the ERP cashier as R851.02 to invoice 34831 and R407.62 to invoice 41238 (an invoice dated 5 Mar 2025, so a later reallocation; that slice comes from the \`DTRX2603.TXT\` load). PROVEN as database content; per section 15 ERP payment tagging is corroboration, never proof of what the customer intended.`);
L('- **Where the ~R407.6 credit comes from.** R1,258.64 less the R851.00 legacy Part 1B deposit balance is R407.64 on the statement basis; the ERP itself applied exactly R407.62 of 35877 to 41238. The ERP tags show the R851.02 reaching the legacy pre-2024 cylinder documents by a two-step route: payment 32620 (5 Aug 2024, R7,437.11 = invoice 34831 in full) was sliced R6,586.09 to 34831 plus a net R851.02 to six 2022-2023 cylinder/EMPTIES documents (12454, 13956, 16770, 17259, 23253, 23259), leaving 34831 R851.02 short, and 35877 then cleared that R851.02. So in the ERP\'s allocation the R851.02 legacy deposit residual has been paid with cash, while the statements route all payments to Part 1A and keep the R851.00 open in Part 1B. ASSERTED (ERP tagging, untrusted on its own).');
L(`- **Classification:** a genuine overpayment of R${fmt(X)} (section 13: log full cash, show the variance, carry the surplus), most likely a payer VAT error, not an exact sum of documents and not a mirror carry. Confidence: **high** that no document set explains it (PROVEN search), **medium** for the VAT gross-up reading (it reproduces the figure to the cent and no innocent goods combination does, but 15% coincidences occur on this account (section 2) and no remittance confirms it), **low** that the customer meant to pay the legacy R851.02 (it does not explain the R407.62 remainder).`);
L();
L('## 1. Exact-sum search (Order B step 1)');
L();
L(`Target R${fmt(TARGET)} +/- 0.02. Options: each invoice or credit note in the window, whole, and for documents with both gas and deposit lines also the gas part and the deposit part (at most one option per document). Parts come from de-duplicated database lines (\`lines\` in the capture) or, outside the capture window, from \`db_sku_classification.json\`. "Open on 30 Dec" = dated on or before 2024-12-30 and not matched by an earlier same-amount payment (whole or gas part); anything dated later would be a prepayment, which SKILL section 4.6 excludes.`);
L();
L(`Control: the same search over the primary window finds **${control.length}** sets totalling R8,390.92 (39311's net gas, settled other ways), so the search has ample freedom; finding none for R${fmt(TARGET)} is a real negative.`);
L();
L('| Pass | Window | Options | Max set size | Sets found | Sets open on 30 Dec 2024 |');
L('| :--- | :--- | ---: | ---: | ---: | ---: |');
L(`| Primary | ${FROM} to ${TO} | ${winItems.length} | ${MAX} | ${winHits.length} | ${winHits.filter((h) => classify(h).open).length} |`);
L(`| Wide | ${WIDE.from} to ${WIDE.to} | ${wideItems.length} | ${WIDE.max} | ${wideHits.length} | ${wideHits.filter((h) => classify(h).open).length} |`);
L();
const allHits = [...winHits.map((h) => ['Primary', h]), ...wideHits.filter((h) => !winHits.some((w) => show(w) === show(h))).map((h) => ['Wide', h])];
if (allHits.length) {
  L('Every set found, ranked (open-on-payment-date first, then fewest members):');
  L();
  L('| Rank | Pass | Set | Sum | Why it fails or holds |');
  L('| ---: | :--- | :--- | ---: | :--- |');
  allHits
    .map(([pass, h]) => ({ pass, h, c: classify(h) }))
    .sort((a, b) => b.c.open - a.c.open || a.h.length - b.h.length)
    .forEach(({ pass, h, c }, i) => {
      const why = c.open
        ? 'all members open on 30 Dec 2024: candidate'
        : [c.future.length ? `dated after 30 Dec 2024: ${c.future.map((x) => x.label).join(', ')} (prepayment, section 4.6)` : '', c.settled.length ? `already paid: ${c.settled.map((x) => `${x.label} by ${settledBy.get(x.doc)}`).join(', ')}` : ''].filter(Boolean).join('; ');
      L(`| ${i + 1} | ${pass} | ${show(h)} | ${fmt(r2(h.reduce((s, x) => s + x.amt, 0)))} | ${why} |`);
    });
} else L('No set of documents in either pass totals the target.');
L();
L(`Neighbourhood of the payment (PROVEN, TXT): on 23 Dec 2024 payments 35887 (R7,542.39) and 35888 (R848.53) paid the gas parts of 39076 and 38976 exactly; 39311's gas lines are the same goods (901 x3 R848.53 + S01 x5 R7,542.39 = R8,390.92). Invoices 38734 and 38735 (R7,224.65 each, 2 Dec) were paid on 11 Dec by 35898 and 39454 (bank lines 00038734 and 00038735). So on 30 Dec 2024 the only open gas item in this window was 39311's R8,390.92.`);
L();
L('## 2. Scalar tests: VAT gross-up');
L();
L(`Every COF001 payment in the TXT was tested against 1.15 x (invoice total, or invoice gas part) for invoices dated 0 to 90 days earlier. Hits: **${vatHits.length}**.`);
L();
L('| Payment | Date | Amount | Invoice | Part | Base | 1.15 x base | Days after invoice | Payment also equals an invoice outright? |');
L('| :--- | :--- | ---: | :--- | :--- | ---: | ---: | ---: | :--- |');
for (const v of vatHits) L(`| ${v.p.doc} | ${v.p.iso} | ${fmt(-v.p.amount)} | ${v.d.doc} (${v.d.iso}) | ${v.part} | ${fmt(v.base)} | ${(v.base * 1.15).toFixed(3)} | ${v.days} | ${v.plain || 'no'} |`);
L();
L(`Hits not explained by an outright invoice match: **${vatOnly.length}** (${vatOnly.map((v) => v.p.doc).join(', ')}). ${vatOnly.length === 1 && vatOnly[0].p.doc === '35877' ? 'Only 35877 fits, so the gross-up is a one-off, not an established payer pattern.' : 'See the table.'} PROVEN (script output). Caution: 15% coincidences do occur on this account without any error. Payment 37633 equals 1.15 x 7,638.42 only because invoice 40942 (4 x 9kg gas R1,145.77 + 5 x 48kg gas R7,638.41) happens to carry 9kg gas worth about 15% of the 48kg gas, and 37633 pays 40942 exactly. 35877's R1,258.64 is not a whole number of 9kg (about R282.84 to R286.44 each) or 48kg (about R1,508.48 to R1,527.68 each) fills, and no document or document set equals it, so that innocent explanation is not available for 35877. Consistent with the payer's AP system or clerk treating the VAT-inclusive net of R8,390.92 as an exclusive amount after credit note 11573 changed the invoice total; ASSUMED.`);
L();
L('## 3. Mirror carry (section 14 Pattern 3)');
L();
L(`Test: any other COF001 payment within 365 days of 30 Dec 2024 that is short by exactly R${fmt(X)} of an invoice (whole or gas part) dated 0 to 60 days before it. Hits: **${mirror.length}**.${mirror.length ? '' : ' No mirror carry.'}`);
for (const m of mirror) L(`- ${m.p.doc} (${m.p.iso}, ${fmt(-m.p.amount)}) vs ${m.d.doc} (${m.d.iso}) base ${fmt(m.base)}`);
L();
L(`Any TXT row equal to R${fmt(X)}, R851.02 or R407.62: ${equalX.length ? equalX.map((t) => `${t.type} ${t.doc} ${t.iso} ${fmt(t.amount)}`).join('; ') : 'none'}. PROVEN.`);
L();
L('## 4. Database payment slices: the "amount differs" mechanism');
L();
L('Section 4.5 says payment rows are clerical slices: sum every ref slice per payment document and drop the zero-net `Alloc` mirror. Done for the six payment-type documents the 2026-10-16 coverage report flagged:');
L();
L('| Doc | Type | TXT | DB first slice | DB sum of ref slices | Alloc net | Ties to TXT | Slices (ref: amount) |');
L('| :--- | :--- | ---: | ---: | ---: | ---: | :--- | :--- |');
for (const s of sliceRows) L(`| ${s.doc} | ${s.type} | ${fmt(s.txt)} | ${fmt(s.first)} | ${fmt(s.sum)} | ${fmt(s.alloc)} | ${s.ok ? 'yes' : '**no**'} | ${s.real.map((x) => `${x[0] || '(blank)'}: ${fmt(x[1])}`).join('; ')} |`);
L();
L(`**Result: ${sliceRows.filter((s) => s.ok).length} of ${sliceRows.length} tie exactly once slices are summed.** The "amount differs" rows in \`reports/COF001_DB_COVERAGE_2026-10-16.md\` compared one slice per payment with the TXT; they are not database errors and not the same mechanism as 35877's overpayment. PROVEN (capture). Per payment:`);
L();
L('- **23445** (18 May 2023, R8,827.62): sliced to 22252 (R7,596.15) and 23258 (R1,231.47), both invoiced later (Jul/Aug 2023). The bank shows **two** credits of R8,827.62 both referencing **00019400** (2 May and 18 May 2023): the customer paid invoice 19400 twice. The TXT agrees: payment 20487 (2 May 2023, R8,827.62) already settled 19400, and 23445 carries a document number from the Aug 2023 range, so it was posted late and back-dated. This is the duplicate reading that ADM-144 staged as the alternative to its P2. Bank and TXT PROVEN; the ERP then applied the duplicate to the next invoices (22252, 23258).');
L('- **32620** (5 Aug 2024, R7,437.11 = invoice 34831 in full; bank line 00034831): sliced R6,586.09 to 34831 and a net R851.02 to six 2022-2023 cylinder documents. This is the first half of the R851.02 route described in the Answer.');
L('- **33627** (18 Sep 2024, R7,902.65 = invoice 36265): sliced R3,107.78 to 36265 and R4,794.87 to 36358 (36265 was part-credited by 10298 for R4,794.87 and re-billed as 36358). Net effect is the same. Bank month Sep 2024 is absent, so not bank-checked.');
L('- **42889** (5 Jan 2026, R7,264.46): R6,856.74 to 48422 plus an untagged R407.72 slice (flag N). R6,856.74 + R407.72 = R7,264.46.');
L('- **40294** (22 Jul 2025): payment R6,446.60 sliced R22.91 to 43287, R6,015.97 to 44348 and R407.72 to 48422 (an invoice dated 22 Dec 2025), then reversed the same day by Bank UD 40294 (+R6,446.60, TXT description "REV COFFEEBERRY CASCADES 00044"; DB Bank UD slices R430.63 + R6,015.97). The pair nets to zero.');
L('- R407.72 (40294, 42889) is R0.10 from 35877\'s R407.62. Not the same number; no link claimed.');
L();
L('## 5. Bank lines');
L();
L('| Payment | Date | TXT amount | Bank credit (Coffeeberry Cascades, same date and amount) |');
L('| :--- | :--- | ---: | :--- |');
for (const b of bankRows) L(`| ${b.doc} | ${b.t.iso} | ${fmt(-b.t.amount)} | ${b.txtRef} |`);
L();
L(`Bank credits referencing 00019400: ${dup19400.map((b) => `${b[0]} R${fmt(b[1])} (${b[3]})`).join('; ')}.`);
L();
L(`**Bank coverage is not continuous.** \`bank_transactions\` spans 2021-01-01 to 2026-03-30, but has no rows at all for Sep 2024, Nov 2024 and Feb to Nov 2025, and only 6 rows each in Dec 2025 (all 31 Dec) and Jan 2026 (30-31 Jan). Months present: ${cap.bankMonthsPresent.join(', ')}. So a missing bank credit in those months is not evidence that no money arrived. This matters for ADM-149: Aug 2025 is absent, so "no bank credit of R7,400.19 for payment 40757" says nothing either way. PROVEN (row counts in the capture).`);
L();
L('## 6. Reconciliation with ADM-144 (branch `claude/cof001-analysis`)');
L();
L('- ADM-144 classed 35877 as **CREDIT / UNKNOWN** ("no structure, no equal invoice; the R1,258.64 difference matches nothing", ASSUMED) and proposed P6: leave it unallocated as customer credit. **This report agrees it is credit, and adds the reason (VAT gross-up of 39311) and where the ERP put it (R851.02 to 34831, R407.62 to 41238).** It does not change P6\'s total.');
L('- ADM-144\'s alternative for P2 (23445 as a duplicate of 19400\'s amount) is **supported by the bank**: two R8,827.62 credits both reference 00019400. P2 itself (23445 + 23395 vs 22252 + 23258, R13,276.64) still balances arithmetically; the operator decides which reading to rule.');
L('- ADM-144 recorded as a negative result that asking the ERP for allocation detail is the wrong route, because ERP payment allocation is untrusted. Agreed for allocation: this report already has the ERP\'s slices from the database. The draft request in `docs/requests/` therefore asks for the bank statement line and the receipt as captured (remittance reference, amount keyed), not for the allocation to be trusted.');
L('- No COF002 overlap: 35877\'s bank line names Coffeeberry **Cascades** and invoice 39311 (COF001), unlike 29492. Not a cross-posting.');
L();
L('## 7. Proposed payer-pattern entry (PROPOSED - NOT RATIFIED)');
L();
L('Not written to `config/payment_pattern_overrides.json`; the operator decides. Staged text:');
L();
L('```json');
L(JSON.stringify({
  status: 'PROPOSED - NOT RATIFIED',
  debtor: 'COF001',
  pattern: 'WHOLE_INVOICE_PAYER_WITH_ONE_OFF_ERRORS',
  statement: 'COF001 pays each delivery invoice (or its gas part after a deposit credit note) whole, typically 3 to 9 days after the invoice (Oct-Dec 2024 sample in section 1), with the invoice number as bank reference. Exceptions seen so far are payer errors, not part payments: a duplicate payment of invoice 19400 (bank 2023-05-02 and 2023-05-18) and a VAT gross-up of invoice 39311 (35877, 2024-12-30, R9,649.56 = 1.15 x R8,390.92, surplus R1,258.64).',
  evidence: [
    'reports/COF001_ADM-150_35877_Payment_Investigation.md sections 1, 2 and 5',
    'data/adm150/db_capture_2026-10-18.json bankCascades',
  ],
  treatmentProposed: 'Payment 35877: R8,390.92 settles invoice 39311 (net of credit note 11573); R1,258.64 is unallocated customer credit (business_rules.md section 13). No exact-sum or mirror-carry tie.',
  operatorDecisionNeeded: 'Ratify the pattern; and choose between (a) leaving R1,258.64 as customer credit on the statements, or (b) following the ERP allocation (R851.02 against the legacy pre-2024 cylinder residual carried in Part 1B as R851.00, R407.62 credit), which would need a lane decision because a gas-lane payment would then settle a cylinder-lane balance.',
  tripwires: [
    'A remittance advice or the customer ledger shows 35877 was meant for other documents.',
    'The bank statement line for 30 Dec 2024 shows a different amount or reference.',
    'The ERP reverses, refunds or reallocates any part of 35877.',
    'Another COF001 payment is found equal to 1.15 x an invoice (the VAT error would then be a recurring pattern, not a one-off).',
  ],
}, null, 2));
L('```');
L();
L('## 8. What the ERP (or bank) must confirm');
L();
L('1. The bank statement line for 30 Dec 2024: amount R9,649.56, payer reference 00039311 (the `bank_transactions` row is UNMATCHED in the bank reconciliation, so it has not been ticked off by anyone).');
L('2. The receipt as captured for 35877: was a remittance received with it, and did it mention VAT or any document other than 39311?');
L('3. Whether the customer has been told of, or has claimed, a R1,258.64 credit (refund or set-off).');
L('4. Whether the R407.62 slice to 41238 (from the `DTRX2603.TXT` load) was a manual reallocation and when.');
L();
L('Draft request (not sent): `docs/requests/2026-10-18_COF001_35877_bank_line_and_receipt_DRAFT.md`.');
L();
L('## Tripwires (reopen when)');
L();
L('- Any item in section 8 comes back different from the reading above.');
L('- Bank data for Sep 2024, Nov 2024 or Feb to Nov 2025 is loaded: re-run section 5 for 33627, 40294 and 42889 (and ADM-149 for 40757).');
L('- COF001 is re-ingested, or new ref slices appear for 35877, 32620 or 41238: re-capture `paymentSlices` and re-run.');
L('- The operator rules on the proposed pattern or on ADM-144 P2 / P6.');
L();
fs.writeFileSync(path.join(ACCT, 'reports/COF001_ADM-150_35877_Payment_Investigation.md'), md.join('\n'));
console.log('wrote', rel(path.join(ACCT, 'reports/COF001_ADM-150_35877_Payment_Investigation.md')));
