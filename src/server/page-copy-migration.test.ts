import {readdirSync, readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {pageCopy} from '../../prisma/seed-data/page-copy';
import {PAGE_COPY_KEYS} from './content-schema';

const MIGRATIONS = new URL('../../prisma/migrations/', import.meta.url);

/**
 * The keys from before page copy had data migrations: only the seed inserts them. Every key added since needs a
 * migration row, or a database that only runs `prisma migrate deploy` fails on every page that reads copy.
 */
const SEED_ONLY_KEYS: ReadonlySet<string> = new Set([
  'stack.eyebrow',
  'about.eyebrow',
  'about.name',
  'work.eyebrow',
  'work.heading',
  'milestones.eyebrow',
  'milestones.heading',
  'milestones.lede',
  'timeline.eyebrow',
  'timeline.heading',
  'timeline.lede',
  'timeline.cvLabel',
  'blog.eyebrow',
  'blog.heading',
  'blog.lede',
  'blog.allLabel',
  'contact.eyebrow',
  'contact.heading',
  'contact.lede',
  'contact.primaryLabel',
  'contact.cvLabel',
  'contact.location',
]);

const migrationSql = () =>
  readdirSync(MIGRATIONS)
    .filter((name) => /^\d+_/.test(name))
    .sort()
    .map((name) => readFileSync(new URL(`${name}/migration.sql`, MIGRATIONS), 'utf8'));

/** Every `('key', 'value', CURRENT_TIMESTAMP)` row a migration inserts into page_copy, with SQL quotes unescaped. */
const migratedCopy = () =>
  migrationSql()
    .filter((sql) => sql.includes('INSERT INTO "page_copy"'))
    .flatMap((sql) => [...sql.matchAll(/\('((?:[^']|'')+)', '((?:[^']|'')+)', CURRENT_TIMESTAMP\)/g)])
    .map(([, key = '', value = '']) => [key.replaceAll("''", "'"), value.replaceAll("''", "'")] as const);

const unquote = (value: string) => value.replaceAll("''", "'");

/**
 * Every `UPDATE "page_copy" SET "value" = 'to', ... WHERE "key" = 'key'` a migration runs, in migration order, with SQL
 * quotes unescaped. `from` is the value a guarded update (`AND "value" = 'from'`) requires, or null for an overwrite.
 */
const updatedCopy = () =>
  migrationSql()
    .flatMap((sql) => [
      ...sql.matchAll(
        /UPDATE "page_copy" SET "value" = '((?:[^']|'')+)', "updated_at" = CURRENT_TIMESTAMP WHERE "key" = '((?:[^']|'')+)'(?: AND "value" = '((?:[^']|'')+)')?;/g,
      ),
    ])
    .map(([, to = '', key = '', from]) => ({key: unquote(key), from: from === undefined ? null : unquote(from), to: unquote(to)}));

/** Every key a migration deletes with `DELETE FROM "page_copy" WHERE "key" IN (...)`, with SQL quotes unescaped. */
const deletedKeys = () =>
  migrationSql()
    .flatMap((sql) => [...sql.matchAll(/DELETE FROM "page_copy" WHERE "key" IN \(([^)]+)\)/g)])
    .flatMap(([, list = '']) => [...list.matchAll(/'((?:[^']|'')+)'/g)].map(([, key = '']) => key.replaceAll("''", "'")));

/*
 * A fresh database runs the migrations before the seed, and the seed skips keys that already exist, so a page-copy key
 * inserted by a migration takes the migration's value there. Keep both in step: change wording in the admin, or in the
 * seed and a new migration together.
 */
describe('page-copy data migrations', () => {
  const rows = migratedCopy();
  const updates = updatedCopy();

  /** The value an inserted key ends on once every later overwrite, and every guarded update whose `from` matches, has run. */
  const finalValue = (key: string, inserted: string) =>
    updates
      .filter((update) => update.key === key)
      .reduce((value, update) => (update.from === null || update.from === value ? update.to : value), inserted);

  it('insert known keys, once each', () => {
    const keys = rows.map(([key]) => key);
    expect(keys.length).toBeGreaterThan(0);
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of keys) expect(PAGE_COPY_KEYS).toContain(key);
  });

  it('leave each inserted key on its seed value', () => {
    for (const [key, value] of rows) expect(finalValue(key, value), key).toBe(pageCopy[key as keyof typeof pageCopy]);
  });

  it('update known keys, ending each on its seed value', () => {
    expect(updates.length).toBeGreaterThan(0);
    for (const {key} of updates) expect(PAGE_COPY_KEYS).toContain(key);
    const last = new Map(updates.map((update) => [update.key, update.to]));
    for (const [key, value] of last) expect(value, key).toBe(pageCopy[key as keyof typeof pageCopy]);
  });

  it('insert every key added after the seed-only ones', () => {
    const migrated = new Set(rows.map(([key]) => key));
    expect(PAGE_COPY_KEYS.filter((key) => !SEED_ONLY_KEYS.has(key) && !migrated.has(key))).toEqual([]);
  });

  it('delete only keys the site no longer reads', () => {
    const keys = deletedKeys();
    expect(keys.length).toBeGreaterThan(0);
    expect(keys.filter((key) => (PAGE_COPY_KEYS as readonly string[]).includes(key))).toEqual([]);
  });
});
