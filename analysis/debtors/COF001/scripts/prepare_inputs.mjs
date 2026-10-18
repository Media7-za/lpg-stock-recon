#!/usr/bin/env node
/**
 * COF001: join the ERP TXT extracts into raw/COF001_COMBINED.TXT (the single txtPath the shared
 * v5 generator reads) and verify the ERP balance chain.
 *
 * Extracts, in order:
 *   2023, 2024, 2025       yearly extracts (each opens on the prior closing)
 *   CURRENT (lines <= 187) rows to 31 Jul 2026; its August rows are superseded by LATEST
 *   LATEST                 2026-10-16 extract, B/F -1,076.02 = CURRENT line 187 balance
 *
 * Usage: node analysis/debtors/COF001/scripts/prepare_inputs.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const RAW = path.join(ROOT, 'analysis/debtors/COF001/raw');
const SOURCES = [
  { id: '2023' },
  { id: '2024' },
  { id: '2025' },
  { id: 'CURRENT', maxLine: 187 },
  { id: 'LATEST' },
];
const r2 = (n) => Math.round(n * 100) / 100;
const fmt = (n) => n.toFixed(2);
const problems = [];

function parse(src) {
  const text = fs.readFileSync(path.join(RAW, `COF001_${src.id}.TXT`), 'utf8');
  const lines = text.split('\n');
  const headerEnd = lines.findIndex((l) => l.includes('"LINE","PERIOD"'));
  const rows = [];
  let bf = null;
  let bfRaw = null;
  for (const line of lines) {
    if (!line.startsWith('"')) continue;
    const f = [...line.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
    if (f.length < 11) continue;
    if (f[6] === 'BALANCE B/F:') {
      bf = r2(Number(f[10]));
      bfRaw = line;
      continue;
    }
    if (!/^\d+$/.test(f[0])) continue;
    if (src.maxLine && Number(f[0]) > src.maxLine) continue;
    const [dd, mm, yyyy] = f[4].split('/');
    rows.push({
      src: src.id,
      docKey: `${f[2].replace(/^0+/, '')}|${f[3]}`,
      type: f[3],
      iso: `${yyyy}-${mm}-${dd}`,
      amount: r2(Number(f[9])),
      bal: r2(Number(f[10])),
      raw: line,
    });
  }
  const headerBalance = Number(text.match(/CURRENT BALANCE:","(-?[0-9.]+)"/)?.[1]);
  return { id: src.id, bf, bfRaw, rows, headerText: lines.slice(0, headerEnd + 1).join('\n'), headerBalance };
}

const parsed = SOURCES.map(parse);
let prevClose = null;
for (const s of parsed) {
  if (prevClose !== null && s.bf !== prevClose) problems.push(`${s.id}: B/F ${fmt(s.bf)} != previous closing ${fmt(prevClose)}`);
  let run = s.bf;
  for (const r of s.rows) {
    run = r2(run + r.amount);
    if (Math.abs(run - r.bal) > 0.011) {
      problems.push(`${s.id}: chain break at ${r.docKey} (expected ${fmt(run)}, ERP ${fmt(r.bal)})`);
      run = r.bal;
    }
  }
  prevClose = s.rows.at(-1).bal;
}
const latest = parsed.at(-1);
if (prevClose !== latest.headerBalance) problems.push(`closing ${fmt(prevClose)} != LATEST CURRENT BALANCE ${fmt(latest.headerBalance)}`);

const all = parsed.flatMap((s) => s.rows);
const seen = new Map();
for (const r of all) {
  if (r.type !== 'Invoice' && r.type !== 'Crd Note') continue;
  if (seen.has(r.docKey)) problems.push(`document ${r.docKey} appears in ${seen.get(r.docKey)} and ${r.src}`);
  seen.set(r.docKey, r.src);
}

const out = [
  latest.headerText,
  parsed[0].bfRaw,
  ...all.map((r) => r.raw),
  `"TOTAL TRANSACTIONS: ${fmt(prevClose)}","","","","","","","","","",""`,
];
fs.writeFileSync(path.join(RAW, 'COF001_COMBINED.TXT'), out.join('\n') + '\n');

const before2026 = all.filter((r) => r.iso < '2026-01-01').at(-1);
console.log(`rows ${all.length} | closing ${fmt(prevClose)} | ERP balance before 2026-01-01 ${fmt(before2026.bal)}`);
console.log(problems.length ? `PROBLEMS:\n - ${problems.join('\n - ')}` : 'Chain intact across all extracts; no duplicate documents.');
process.exit(problems.length ? 1 : 0);
