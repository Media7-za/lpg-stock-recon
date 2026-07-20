#!/usr/bin/env node
/**
 * Parse TWK remittance PDFs from raw/Remittances via `pdftotext` when available.
 * Fallback: use pre-extracted batch manifest in data/remittance_manifest_2023.json
 */
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const ROOT = path.resolve('analysis/debtors/TWK002');
const REMIT_DIR = path.join(ROOT, 'raw/Remittances');
const MANIFEST = path.join(ROOT, 'data/remittance_manifest_2023.json');

export function loadManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const m = loadManifest();
  console.log(`Loaded ${m.batches.length} batches, ${m.lines.length} lines`);
}
