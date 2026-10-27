import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {projects} from '../../prisma/seed-data/projects';

const MIGRATION = new URL('../../prisma/migrations/20261027120000_project_brand_colours/migration.sql', import.meta.url);

const sqlValue = (value: string | null) => (value === null ? 'NULL' : `'${value}'`);

/*
 * A fresh database runs the migrations before the seed, and an existing one (production) only runs the migrations, so
 * the backfill and the seed must agree. Each update only fills an empty colour, so it never overwrites an admin edit.
 */
describe('project brand colour migration', () => {
  const sql = readFileSync(MIGRATION, 'utf8');

  it('adds both columns', () => {
    expect(sql).toMatch(/ADD COLUMN\s+"brand_color" TEXT/);
    expect(sql).toMatch(/ADD COLUMN\s+"brand_tint" TEXT/);
  });

  it.each(projects.filter((p) => p.brandColor))('backfills $slug with the seed colours, only while empty', (p) => {
    const set = p.brandTint
      ? `SET "brand_color" = ${sqlValue(p.brandColor)}, "brand_tint" = ${sqlValue(p.brandTint)}`
      : `SET "brand_color" = ${sqlValue(p.brandColor)}`;
    expect(sql).toContain(`UPDATE "projects" ${set} WHERE "slug" = '${p.slug}' AND "brand_color" IS NULL;`);
  });

  it('gives every seed project a brand colour', () => {
    expect(projects.filter((p) => !p.brandColor).map((p) => p.slug)).toEqual([]);
  });
});
