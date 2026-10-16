#!/usr/bin/env node
/**
 * DEBTORS_DOCTRINE D21 intake check for ERP statement TXT exports (read-only).
 *   node analysis/debtors/COF001/scripts/d21_intake_check.mjs FILE.TXT [FILE.TXT ...]
 * Checks: each running BALANCE = previous BALANCE + AMOUNT; last running balance = header CURRENT BALANCE
 * = TOTAL TRANSACTIONS; where UD PAY/CHEQUES is non-zero, header - last balance = UD exactly; file name
 * carries <CODE>_<YYYY-MM-DD>. Also reports the allocation-detail posture (SKILL_Human_Sources_Agent 6.1).
 * Exit 1 if any file fails the numeric checks. File name dating is reported separately (not a numeric fail).
 */
import fs from 'fs';
import path from 'path';

const cents = (s) => Math.round(Number(s) * 100);
let failed = false;
for (const file of process.argv.slice(2)) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const hdr = {};
  let total = null;
  const rows = [];
  for (const raw of lines) {
    const cols = raw.match(/"((?:[^"]|"")*)"/g)?.map((c) => c.slice(1, -1).replace(/""/g, '"'));
    if (!cols) continue;
    if (cols[0].startsWith('TOTAL TRANSACTIONS')) total = cents(cols[0].split(':')[1]);
    else if (/^\d+$/.test(cols[0])) rows.push(cols);
    else if (cols[0].endsWith(':') && cols[1] !== undefined) hdr[cols[0]] = cols[1];
  }
  const problems = [];
  let prev = null;
  rows.forEach((r) => {
    const amt = cents(r[9]);
    const bal = cents(r[10]);
    if (prev !== null && prev + amt !== bal) problems.push(`chain break at line ${r[0]} doc ${r[2]}`);
    prev = bal;
  });
  const header = cents(hdr['CURRENT BALANCE:']);
  const ud = cents(hdr['UD PAY/CHEQUES:'] ?? 0);
  if (prev !== header - (ud ? ud : 0) && prev !== header) problems.push(`last balance ${prev / 100} != header ${header / 100}`);
  if (ud && header - prev !== ud) problems.push(`UD gap ${(header - prev) / 100} != header UD ${ud / 100}`);
  if (total !== null && total !== prev) problems.push(`TOTAL TRANSACTIONS ${total / 100} != last balance ${prev / 100}`);
  const dated = /_\d{4}-\d{2}-\d{2}\.TXT$/i.test(path.basename(file));
  const alloc = hdr['EXCLUDE:'] === 'ALLOCATION DETAIL' ? 'allocation detail EXCLUDED' : 'allocation detail present';
  const ok = problems.length === 0;
  if (!ok) failed = true;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${file} | rows ${rows.length} | header ${header / 100} | last ${prev / 100} | UD ${ud / 100} | ${dated ? 'dated name' : 'UNDATED name'} | ${alloc}${ok ? '' : ' | ' + problems.join('; ')}`);
}
process.exit(failed ? 1 : 0);
