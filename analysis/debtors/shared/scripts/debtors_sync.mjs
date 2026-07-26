import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const baseDir = 'analysis/debtors';
const skipDirs = new Set(['shared', 'Global Reports']);

const validStatuses = ["active", "collection", "on-hold", "resolved"];
const validReconStates = ["pending", "in-progress", "complete"];

let hasHardFailures = false;

export function validateProject(code, data) {
  let errors = [];
  let warnings = [];

  // Root level requirements
  if (!data.debtorCode || data.debtorCode !== code) errors.push('debtorCode missing or mismatch');
  if (!data.clientName) errors.push('clientName missing');
  else if (data.clientName.includes('Placeholder')) warnings.push('clientName is placeholder');

  if (!validStatuses.includes(data.status)) errors.push(`invalid status: ${data.status}`);
  if (!validReconStates.includes(data.reconState)) errors.push(`invalid reconState: ${data.reconState}`);

  // Financials
  if (!data.financials) {
    errors.push('financials object missing');
  } else {
    if (typeof data.financials.totalOutstanding !== 'number') errors.push('totalOutstanding missing or not a number');
    if (typeof data.financials.agedDebt180Plus !== 'number') errors.push('agedDebt180Plus missing or not a number');
    
    if (data.financials.lastInvoiceDate === undefined) warnings.push('lastInvoiceDate omitted');
    if (data.financials.lastPaymentDate === undefined) warnings.push('lastPaymentDate omitted');
  }

  // Collections
  if (!data.collections) {
    errors.push('collections object missing');
  } else {
    if (typeof data.collections.actionRequired !== 'boolean') errors.push('actionRequired missing or not boolean');
    if (data.collections.actionType === undefined) warnings.push('actionType omitted');
    if (data.collections.dateSent === undefined) warnings.push('dateSent omitted');
    if (data.collections.deadlineDate === undefined) warnings.push('deadlineDate omitted');
    if (data.collections.nextAction === undefined) warnings.push('nextAction omitted');
    if (data.collections.nextActionDate === undefined) warnings.push('nextActionDate omitted');
    if (data.collections.notes === undefined) warnings.push('notes omitted');
  }

  // History
  if (!Array.isArray(data.history) || data.history.length === 0) {
    warnings.push('history array empty or missing');
  }

  // State Machine Rules
  if (data.status === 'collection') {
    if (data.reconState !== 'complete') errors.push('STATE MACHINE: Cannot be in collection without reconState complete');
    if (!data.collections?.actionRequired) errors.push('STATE MACHINE: collection status requires actionRequired = true');
    if (!data.collections?.actionType) errors.push('STATE MACHINE: collection status requires actionType');

    // D17 collections gate — DEBTORS_DOCTRINE.md §4 (D17), Collectable Rule §2.
    // Fails CLOSED: absence of evidence is never treated as absence of a blocker.
    // Age (financials.agedDebt180Plus) sets priority only and is deliberately NOT read here.
    const c = data.financials?.collectable;
    if (c === undefined) {
      errors.push('D17(b): financials.collectable missing — collectable balance must be stated under Constitution §2 (ERP balance − Σ ratified holds). SCHEMA GAP: field not yet in PROJECT_SCHEMA.md; cannot infer from totalOutstanding or age');
    } else {
      if (typeof c.amount !== 'number') errors.push('D17(b): financials.collectable.amount missing or not a number');
      if (typeof c.ratifiedHoldsTotal !== 'number') errors.push('D17(b): financials.collectable.ratifiedHoldsTotal missing or not a number — holds must be quantified, not implied');
      if (!c.asAt) errors.push('D17(b): financials.collectable.asAt missing — collectable balance requires a dated source');
      if (!c.basis) errors.push('D17(b): financials.collectable.basis missing — basis of derivation must be stated');
      if (c.operatorConfirmation !== 'confirmed') {
        errors.push(`D17(b): financials.collectable.operatorConfirmation is "${c.operatorConfirmation ?? 'absent'}" — source is stale/unconfirmed until "confirmed"`);
      }
      if (typeof c.amount === 'number' && typeof c.ratifiedHoldsTotal === 'number'
          && typeof data.financials?.totalOutstanding === 'number') {
        const expected = data.financials.totalOutstanding - c.ratifiedHoldsTotal;
        if (Math.abs(expected - c.amount) > 0.05) {
          errors.push(`D17(b): collectable ${c.amount} ≠ totalOutstanding ${data.financials.totalOutstanding} − ratifiedHolds ${c.ratifiedHoldsTotal} (= ${expected.toFixed(2)}); bridge must be itemized and registered`);
        }
      }
    }

    const blockers = data.collections?.blockers;
    if (!Array.isArray(blockers)) {
      errors.push('D17(c): collections.blockers missing or not an array — an empty array affirms "no blocking dispute, stale source, unratified hold, or open identity". SCHEMA GAP: field not yet in PROJECT_SCHEMA.md');
    } else if (blockers.length > 0) {
      errors.push(`D17(c): ${blockers.length} unresolved blocker(s) — route to human review, not collections: ${blockers.map(b => (typeof b === 'string' ? b : b?.type ?? 'unspecified')).join(', ')}`);
    }
  }
  
  if (data.status === 'resolved') {
    if (data.financials?.totalOutstanding !== 0.0) {
      warnings.push('STATE MACHINE: status is resolved but outstanding balance is not 0.0 (check if write-off is documented)');
    }
  }

  return { errors, warnings };
}

function sync() {
  const folders = fs.readdirSync(baseDir).filter(f => {
    try {
      return fs.statSync(path.join(baseDir, f)).isDirectory() && !skipDirs.has(f);
    } catch {
      return false;
    }
  });

  console.log(`Starting debtors sync validation across ${folders.length} accounts...\n`);

  for (const code of folders) {
    const filePath = path.join(baseDir, code, 'project.json');
    if (!fs.existsSync(filePath)) {
      console.log(`[SKIP] ${code} — no project.json (not a debtor micro-project)`);
      continue;
    }

    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      console.log(`[FAIL] ${code} — invalid JSON syntax`);
      hasHardFailures = true;
      continue;
    }

    const { errors, warnings } = validateProject(code, data);

    if (errors.length > 0) {
      console.log(`[FAIL] ${code}`);
      errors.forEach(e => console.log(`  - ERROR: ${e}`));
      hasHardFailures = true;
    } else if (warnings.length > 0) {
      console.log(`[WARN] ${code}`);
      warnings.forEach(w => console.log(`  - WARN: ${w}`));
    } else {
      console.log(`[PASS] ${code}`);
    }
  }

  console.log();

  if (hasHardFailures) {
    console.error('❌ Sync failed due to schema or state machine violations. Fix errors and retry.');
    process.exit(1);
  } else {
    console.log('✅ Validation passed. Triggering dashboard generation...');
    const result = spawnSync('node', ['analysis/debtors/shared/scripts/debtors_dashboard.mjs'], { stdio: 'inherit' });
    if (result.error || result.status !== 0) {
      console.error('❌ Dashboard generation failed.');
      process.exit(result.status || 1);
    }
  }
}

// Run only when executed directly, so validateProject can be imported by tests.
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  sync();
}
