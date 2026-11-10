// Checks a PLAYBOOK.json against playbook.schema.json with the little of JSON Schema that file uses (no dependency),
// and what a schema cannot say: that records, senses and rhythms name each other correctly.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const SCHEMA = JSON.parse(readFileSync(fileURLToPath(new URL('../playbook.schema.json', import.meta.url)), 'utf8'));

const typeOf = (v) => (Array.isArray(v) ? 'array' : v === null ? 'null' : Number.isInteger(v) ? 'integer' : typeof v);

/** Problems with `value` against `schema`, as "path: message" lines; empty when it is valid. */
export function check(schema, value, path = '', root = schema) {
  if (schema.$ref) return check(root.$defs[schema.$ref.replace('#/$defs/', '')], value, path, root);
  const at = path || '(top)';
  if (schema.oneOf) {
    const passing = schema.oneOf.filter((s) => check(s, value, path, root).length === 0).length;
    return passing === 1 ? [] : [`${at}: matches ${passing} of the allowed forms, not exactly one`];
  }
  if ('const' in schema && value !== schema.const) return [`${at}: must be ${JSON.stringify(schema.const)}`];
  if (schema.enum && !schema.enum.includes(value)) return [`${at}: must be one of ${schema.enum.join(', ')}`];
  const type = typeOf(value);
  if (schema.type && !(schema.type === type || (schema.type === 'number' && type === 'integer'))) return [`${at}: must be ${schema.type}`];
  const out = [];
  if (type === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) out.push(`${at}: too short`);
    if (schema.maxLength !== undefined && value.length > schema.maxLength) out.push(`${at}: longer than ${schema.maxLength}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) out.push(`${at}: does not match ${schema.pattern}`);
  }
  if (type === 'integer' || type === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) out.push(`${at}: below ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) out.push(`${at}: above ${schema.maximum}`);
  }
  if (type === 'array') {
    if (schema.minItems !== undefined && value.length < schema.minItems) out.push(`${at}: fewer than ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) out.push(`${at}: more than ${schema.maxItems} items`);
    if (schema.items) value.forEach((item, i) => out.push(...check(schema.items, item, `${path}[${i}]`, root)));
  }
  if (type === 'object') {
    for (const key of schema.required ?? []) if (!(key in value)) out.push(`${at}: ${key} is missing`);
    for (const [key, v] of Object.entries(value)) {
      const sub = schema.properties?.[key];
      if (sub) out.push(...check(sub, v, path ? `${path}.${key}` : key, root));
      else if (schema.additionalProperties === false) out.push(`${at}: ${key} is not allowed`);
    }
  }
  return out;
}

/** Everything wrong with a playbook, schema and cross-references both. */
export function checkPlaybook(playbook) {
  const out = check(SCHEMA, playbook);
  if (out.length) return out;
  const tables = new Set((playbook.records ?? []).map((r) => `${r.database}.${r.table}`));
  const senses = new Set((playbook.senses ?? []).map((s) => s.id));
  for (const r of playbook.records ?? []) for (const k of r.key ?? []) if (!r.columns.some((c) => c.name === k)) out.push(`records ${r.database}.${r.table}: key ${k} is not a column`);
  for (const s of playbook.senses ?? []) {
    if (s.into && !tables.has(s.into)) out.push(`senses ${s.id}: ${s.into} is not one of the records`);
    if (!s.match || (!s.match.from && !s.match.subject && !s.match.kind)) out.push(`senses ${s.id}: give match.from, match.subject or match.kind, or it matches nothing`);
  }
  for (const r of playbook.rhythms ?? []) {
    if (r.when.on && !senses.has(r.when.on.slice(6))) out.push(`rhythms ${r.id}: ${r.when.on} names no sense`);
    for (const n of r.needs ?? []) if (!tables.has(n.records)) out.push(`rhythms ${r.id}: ${n.records} is not one of the records`);
  }
  for (const s of playbook.signals ?? []) {
    if (s.check && /;\s*\S/.test(s.check.sql)) out.push(`signals ${s.id}: check.sql must be one statement`);
  }
  return out;
}

/** What the index says of a playbook. */
export function playbookEntry(playbook) {
  return { title: playbook.title, summary: playbook.summary, for: playbook.for, senses: (playbook.senses ?? []).length, rhythms: (playbook.rhythms ?? []).length };
}
