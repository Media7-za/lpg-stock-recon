import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const baseDir = 'analysis/debtors';

const validStatuses = ["active", "collection", "on-hold", "resolved"];
const validReconStates = ["pending", "in-progress", "complete"];

let hasHardFailures = false;

function validateProject(code, data) {
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
      return fs.statSync(path.join(baseDir, f)).isDirectory() && f !== 'shared';
    } catch {
      return false;
    }
  });

  console.log(`Starting debtors sync validation across ${folders.length} accounts...\n`);

  for (const code of folders) {
    const filePath = path.join(baseDir, code, 'project.json');
    if (!fs.existsSync(filePath)) {
      console.log(`[FAIL] ${code} — missing project.json`);
      hasHardFailures = true;
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

sync();
