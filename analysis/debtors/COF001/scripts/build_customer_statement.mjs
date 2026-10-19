#!/usr/bin/env node
/**
 * COF001 customer statement, derived from a generated v5 statement: the heading, Part 1A (gas) and
 * Part 2 (cylinder ledger) only. Internal notes, Part 1B, the bridge, quarantine/cancellation sections,
 * row annotations and review notes are left out. Regenerate the source statement first; never edit the
 * output by hand.
 *
 * Usage: node analysis/debtors/COF001/scripts/build_customer_statement.mjs [--suffix _ADM158_Projection]
 * Output: analysis/debtors/COF001/reports/COF001_Customer_Statement<suffix>.md
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ACCT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SUFFIX = process.argv.includes('--suffix') ? process.argv[process.argv.indexOf('--suffix') + 1] : '_ADM158_Projection';
const src = fs.readFileSync(path.join(ACCT, `reports/COF001_Statement_Account_v5${SUFFIX}.md`), 'utf8');
const lines = src.split('\n');

// Section body from its `## ` heading up to the next `## ` heading or internal marker.
function section(title) {
  const start = lines.findIndex((l) => l.startsWith(`## ${title}`));
  if (start < 0) throw new Error(`Section not found: ${title}`);
  let end = lines.findIndex((l, i) => i > start && (l.startsWith('## ') || l.startsWith('<!--')));
  if (end < 0) end = lines.length;
  return lines.slice(start, end);
}

const clean = (body) =>
  body
    .filter((l) => !/^\*.*\*$/.test(l.trim())) // lane descriptions and config notes under the heading
    .map((l) => l.replace(/ \*\([^)]*\)\*/g, '')) // row annotations: (lane assumed), (projected), (split of …)
    .map((l) => l.replace(/^\| \| \*Open at start: (\w+) (\d+) \(([^,)]*)[^*]*\*/, '| | *Unpaid $1 $2 ($3)*')) // short memo keeps the first table on page 1
    .join('\n')
    .replace(/(\n---\n*)+$/, '\n');

const title = lines[0].match(/^# Statement of Account: (.*?) - Version/)?.[1] || 'COFFEEBERRY-CASCADES (COF001)';
const period = lines.find((l) => l.startsWith('**Period:**'));

// Gas opening and closing, read from Part 1A as generated (first opening row, last running balance).
const gas = section('Part 1A: LPG Gas Financial Statement');
const gasOpening = gas.find((l) => l.includes('**Opening Balance**')).match(/\*\*(-?[\d,.]+)\*\* \|$/)[1];
const gasRows = gas.filter((l) => /^\| \d{2} \w+ \d{4} \|/.test(l));
const gasClosing = gasRows.at(-1).split('|').at(-2).trim();

const md = [
  `# Statement of Account: ${title}`,
  `${period} &nbsp;|&nbsp; **Opening Balance B/F:** R${gasOpening} (LPG gas)`,
  '',
  '---',
  '',
  clean(gas),
  '',
  `**Closing Balance (LPG gas):** R${gasClosing}`,
  '',
  '---',
  '',
  clean(section('Part 2: Cylinder (CYL) Ledger (Physical Asset Tracker)')),
].join('\n');

const out = path.join(ACCT, `reports/COF001_Customer_Statement${SUFFIX}.md`);
fs.writeFileSync(out, md.replace(/\n{3,}/g, '\n\n'));
console.log(`wrote ${path.relative(path.resolve(ACCT, '../../..'), out)}`);
