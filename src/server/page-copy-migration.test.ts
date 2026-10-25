import {readdirSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {pageCopy} from '../../prisma/seed-data/page-copy';
import {PAGE_COPY_KEYS} from './content-schema';

const MIGRATIONS = new URL('../../prisma/migrations/', import.meta.url);

/** Every `('key', 'value', CURRENT_TIMESTAMP)` row a migration inserts into page_copy, with SQL quotes unescaped. */
const migratedCopy = () =>
  readdirSync(MIGRATIONS)
    .filter((name) => /^\d+_/.test(name))
    .map((name) => readFileSync(new URL(`${name}/migration.sql`, MIGRATIONS), 'utf8'))
    .filter((sql) => sql.includes('INSERT INTO "page_copy"'))
    .flatMap((sql) => [...sql.matchAll(/\('((?:[^']|'')+)', '((?:[^']|'')+)', CURRENT_TIMESTAMP\)/g)])
    .map(([, key = '', value = '']) => [key.replaceAll("''", "'"), value.replaceAll("''", "'")] as const);

/*
 * A fresh database runs the migrations before the seed, and the seed skips keys that already exist, so a page-copy key
 * inserted by a migration takes the migration's value there. Keep both in step: change wording in the admin, or in the
 * seed and a new migration together.
 */
describe('page-copy data migrations', () => {
  const rows = migratedCopy();

  it('insert known keys, once each', () => {
    const keys = rows.map(([key]) => key);
    expect(keys.length).toBeGreaterThan(0);
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of keys) expect(PAGE_COPY_KEYS).toContain(key);
  });

  it('insert the seed value for each key', () => {
    for (const [key, value] of rows) expect(value, key).toBe(pageCopy[key as keyof typeof pageCopy]);
  });
});
