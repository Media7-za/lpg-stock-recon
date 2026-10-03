import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { validateInput, buildProject } from './scaffold.mjs';
import { validateProject } from './debtors_sync.mjs';

test('rejects malformed codes and empty names', () => {
  assert.ok(validateInput('abc123', 'X').length > 0);
  assert.ok(validateInput('AB', 'X').length > 0);
  assert.ok(validateInput('EMB001', '  ').length > 0);
});

test('rejects an existing account directory', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'scaf-'));
  fs.mkdirSync(path.join(root, 'EMB001'));
  assert.ok(validateInput('EMB001', 'X', root).some((e) => /already exists/.test(e)));
  assert.deepEqual(validateInput('EMB002', 'X', root), []);
});

test('scaffolded project.json passes the sync schema with no errors', () => {
  const { errors } = validateProject('EMB001', buildProject('EMB001', 'ACME PTY LTD', '2026-10-03'));
  assert.deepEqual(errors, []);
});
