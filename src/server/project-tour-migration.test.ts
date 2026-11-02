import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {tourHref} from '@/lib/tour';
import {projects} from '../../prisma/seed-data/projects';
import {tourStopsSchema} from './content-schema';

const MIGRATION = new URL('../../prisma/migrations/20261102120000_project_walkthrough/migration.sql', import.meta.url);

const unquote = (sql: string) => sql.replaceAll("''", "'");

/*
 * A fresh database runs the migrations before the seed, and an existing one only runs the migrations, so the backfill
 * and the seed must agree. The update only fills an empty tour, so it never overwrites an admin edit.
 */
describe('project walkthrough migration', () => {
  const sql = readFileSync(MIGRATION, 'utf8');
  const accessHire = projects.find((project) => project.slug === 'access-hire');

  it('adds the columns', () => {
    expect(sql).toMatch(/ADD COLUMN\s+"tour_stops" JSONB NOT NULL DEFAULT '\[\]'/);
    for (const column of ['decision', 'contribution', 'outcome']) expect(sql).toMatch(new RegExp(`ADD COLUMN\\s+"${column}" TEXT`));
  });

  it('seeds a valid Access Hire tour with an opening and seven notes', () => {
    const stops = tourStopsSchema.parse(accessHire?.tourStops);
    expect(stops).toHaveLength(8);
    expect(stops[0]?.note).toBe('');
    expect(stops.slice(1).every((stop) => stop.note !== '')).toBe(true);
  });

  it('backfills the seed tour, only while empty', () => {
    const match = sql.match(/UPDATE "projects" SET "tour_stops" = '(.+)'::jsonb WHERE "slug" = 'access-hire' AND "tour_stops" = '\[\]'::jsonb;/);
    expect(JSON.parse(unquote(match?.[1] ?? 'null'))).toEqual(accessHire?.tourStops);
  });

  it('keeps every capture in the tour folder and leaves the reasoning empty', () => {
    for (const stop of accessHire?.tourStops ?? []) {
      expect(stop.captures.desktop.url).toContain('/images/2026/access-hire-tour/');
      expect(stop.captures.mobile.url).toContain('/images/2026/access-hire-tour/');
    }
    expect(sql).not.toMatch(/SET "(decision|contribution|outcome)"/);
  });

  it('gives only the four finished projects a tour', () => {
    expect(projects.filter((project) => project.tourStops?.length).map(({slug}) => slug)).toEqual([
      'access-hire',
      'myimprov',
      'merthyr-village',
      'experience-sunnybank',
    ]);
  });
});

describe('project myimprov tour migration', () => {
  const sql = readFileSync(new URL('../../prisma/migrations/20261102130000_project_myimprov_tour/migration.sql', import.meta.url), 'utf8');
  const myimprov = projects.find((project) => project.slug === 'myimprov');

  it('seeds a valid tour with an opening and six notes', () => {
    const stops = tourStopsSchema.parse(myimprov?.tourStops);
    expect(stops).toHaveLength(7);
    expect(stops[0]?.note).toBe('');
    expect(stops.slice(1).every((stop) => stop.note !== '')).toBe(true);
  });

  it('backfills the seed tour, only while empty', () => {
    const match = sql.match(/UPDATE "projects" SET "tour_stops" = '(.+)'::jsonb WHERE "slug" = 'myimprov' AND "tour_stops" = '\[\]'::jsonb;/);
    expect(JSON.parse(unquote(match?.[1] ?? 'null'))).toEqual(myimprov?.tourStops);
  });

  it('keeps every capture in the tour folder and every full address on the project domain', () => {
    for (const stop of myimprov?.tourStops ?? []) {
      expect(stop.captures.desktop.url).toContain('/images/2026/myimprov-tour/');
      expect(stop.captures.mobile.url).toContain('/images/2026/myimprov-tour/');
      expect(tourHref(stop.path, myimprov?.liveUrl ?? null)).not.toBeNull();
    }
  });

  it('leaves the reasoning empty', () => {
    expect(sql).not.toMatch(/SET "(decision|contribution|outcome)"/);
  });
});

describe('project merthyr village tour migration', () => {
  const sql = readFileSync(new URL('../../prisma/migrations/20261102140000_project_merthyr_village_tour/migration.sql', import.meta.url), 'utf8');
  const merthyr = projects.find((project) => project.slug === 'merthyr-village');

  it('seeds a valid tour with an opening and four notes', () => {
    const stops = tourStopsSchema.parse(merthyr?.tourStops);
    expect(stops).toHaveLength(5);
    expect(stops[0]?.note).toBe('');
    expect(stops.slice(1).every((stop) => stop.note !== '')).toBe(true);
  });

  it('backfills the seed tour, only while empty', () => {
    const match = sql.match(/UPDATE "projects" SET "tour_stops" = '(.+)'::jsonb WHERE "slug" = 'merthyr-village' AND "tour_stops" = '\[\]'::jsonb;/);
    expect(JSON.parse(unquote(match?.[1] ?? 'null'))).toEqual(merthyr?.tourStops);
  });

  it('keeps every capture in the tour folder and every page on the live site', () => {
    for (const stop of merthyr?.tourStops ?? []) {
      expect(stop.captures.desktop.url).toContain('/images/2026/merthyr-village-tour/');
      expect(stop.captures.mobile.url).toContain('/images/2026/merthyr-village-tour/');
      expect(tourHref(stop.path, merthyr?.liveUrl ?? null)).not.toBeNull();
    }
  });

  it('uses the independent tenant, not a national brand', () => {
    expect(JSON.stringify(merthyr?.tourStops)).not.toMatch(/coles/i);
    expect(merthyr?.tourStops?.map(({path}) => path)).toContain('/store/new-farm-deli-cafe/');
  });

  it('leaves the reasoning empty', () => {
    expect(sql).not.toMatch(/SET "(decision|contribution|outcome)"/);
  });
});

describe('project experience sunnybank tour migration', () => {
  const sql = readFileSync(
    new URL('../../prisma/migrations/20261102150000_project_experience_sunnybank_tour/migration.sql', import.meta.url),
    'utf8',
  );
  const sunnybank = projects.find((project) => project.slug === 'experience-sunnybank');

  it('seeds a valid tour with an opening and five notes', () => {
    const stops = tourStopsSchema.parse(sunnybank?.tourStops);
    expect(stops).toHaveLength(6);
    expect(stops[0]?.note).toBe('');
    expect(stops.slice(1).every((stop) => stop.note !== '')).toBe(true);
  });

  it('backfills the seed tour, only while empty', () => {
    const match = sql.match(
      /UPDATE "projects" SET "tour_stops" = '(.+)'::jsonb WHERE "slug" = 'experience-sunnybank' AND "tour_stops" = '\[\]'::jsonb;/,
    );
    expect(JSON.parse(unquote(match?.[1] ?? 'null'))).toEqual(sunnybank?.tourStops);
  });

  it('keeps every capture in the tour folder and every page on the live site', () => {
    for (const stop of sunnybank?.tourStops ?? []) {
      expect(stop.captures.desktop.url).toContain('/images/2026/experience-sunnybank-tour/');
      expect(stop.captures.mobile.url).toContain('/images/2026/experience-sunnybank-tour/');
      expect(tourHref(stop.path, sunnybank?.liveUrl ?? null)).not.toBeNull();
    }
  });

  it('leaves the reasoning empty', () => {
    expect(sql).not.toMatch(/SET "(decision|contribution|outcome)"/);
  });
});
