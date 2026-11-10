import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { checkPlaybook } from './playbook.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const shipped = readdirSync(root).filter((d) => statSync(join(root, d, 'PLAYBOOK.json'), { throwIfNoEntry: false }));

test('every shipped playbook passes the schema and its cross-references', () => {
  assert.ok(shipped.length >= 4);
  for (const id of shipped) assert.deepEqual(checkPlaybook(JSON.parse(readFileSync(join(root, id, 'PLAYBOOK.json'), 'utf8'))), [], id);
});

test('unknown keys, bad names, two statements and dangling references are refused', () => {
  const base = { version: 1, title: 'T', for: ['anyone'], summary: 'S' };
  assert.match(checkPlaybook({ ...base, extra: 1 }).join(), /extra is not allowed/);
  assert.match(checkPlaybook({ ...base, records: [{ database: 'Sales', table: 'days', columns: [{ name: 'd', type: 'date' }] }] }).join(), /database: does not match/);
  assert.match(checkPlaybook({ ...base, signals: [{ id: 'x', when: 'w', say: 's', check: { database: 'a', sql: 'SELECT 1; DROP TABLE t' } }] }).join(), /one statement/);
  assert.match(checkPlaybook({ ...base, signals: [{ id: 'x', when: 'w', say: 's', check: { database: 'a', sql: 'DELETE FROM t' } }] }).join(), /does not match/);
  assert.match(checkPlaybook({ ...base, rhythms: [{ id: 'r', when: { on: 'sense:none' }, do: 'x' }] }).join(), /names no sense/);
  assert.match(checkPlaybook({ ...base, senses: [{ id: 's', kind: 'address', describe: 'd', ask: 'a' }] }).join(), /matches nothing/);
  assert.match(checkPlaybook({ ...base, rhythms: [{ id: 'r', when: { every: 'week', at: '08:00' }, do: 'x' }] }).join(), /allowed forms/);
});
