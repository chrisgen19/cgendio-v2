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

  it('gives all six projects a tour', () => {
    expect(projects.filter((project) => project.tourStops?.length).map(({slug}) => slug)).toEqual([
      'access-hire',
      'myimprov',
      'merthyr-village',
      'experience-sunnybank',
      'premium-mobile-car-valeting',
      'fresh-fruit-and-veg',
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

describe('project fresh fruit tour migration', () => {
  const sql = readFileSync(new URL('../../prisma/migrations/20261102160000_project_fresh_fruit_tour/migration.sql', import.meta.url), 'utf8');
  const freshFruit = projects.find((project) => project.slug === 'fresh-fruit-and-veg');

  it('seeds a valid tour with an opening and three notes', () => {
    const stops = tourStopsSchema.parse(freshFruit?.tourStops);
    expect(stops).toHaveLength(4);
    expect(stops[0]?.note).toBe('');
    expect(stops.slice(1).every((stop) => stop.note !== '')).toBe(true);
  });

  it('backfills the seed tour, only while empty', () => {
    const match = sql.match(
      /UPDATE "projects" SET "tour_stops" = '(.+)'::jsonb WHERE "slug" = 'fresh-fruit-and-veg' AND "tour_stops" = '\[\]'::jsonb;/,
    );
    expect(JSON.parse(unquote(match?.[1] ?? 'null'))).toEqual(freshFruit?.tourStops);
  });

  it('keeps every capture in the tour folder and every page on the live site', () => {
    for (const stop of freshFruit?.tourStops ?? []) {
      expect(stop.captures.desktop.url).toContain('/images/2026/fresh-fruit-tour/');
      expect(stop.captures.mobile.url).toContain('/images/2026/fresh-fruit-tour/');
      expect(tourHref(stop.path, freshFruit?.liveUrl ?? null)).not.toBeNull();
    }
  });

  it('describes the live office deliveries site, not a subscription shop', () => {
    const home = freshFruit?.tourStops?.find(({key}) => key === 'home');
    expect(home?.note).toContain('office');
    expect(`${home?.note} ${home?.onScreen}`).not.toMatch(/subscription|checkout|delivery slots|now leads/i);
  });

  it('leaves the reasoning empty', () => {
    expect(sql).not.toMatch(/SET "(decision|contribution|outcome)"/);
  });
});

const OFFICE_SUMMARY = 'Office fruit deliveries for workplaces in Glasgow, on a WordPress and WooCommerce site.';

describe('project fresh fruit copy migration', () => {
  const sql = readFileSync(new URL('../../prisma/migrations/20261102170000_project_fresh_fruit_copy/migration.sql', import.meta.url), 'utf8');
  const writeUp = readFileSync(new URL('../../prisma/seed-data/projects/fresh-fruit-and-veg.md', import.meta.url), 'utf8');
  const freshFruit = projects.find((project) => project.slug === 'fresh-fruit-and-veg');
  const quoted = (value: string) => `'${value.replaceAll("'", "''")}'`;

  // The summary went back to the previous site's in 20261107120000_project_fresh_fruit_summary (#81 Phase A)
  it('describes the office deliveries site in the label and tags', () => {
    expect(freshFruit?.kindLabel).toBe('CLIENT · OFFICE DELIVERIES');
    expect(`${freshFruit?.kindLabel} ${freshFruit?.tags.join(' ')}`).not.toMatch(/subscription/i);
  });

  it('keeps the technical story and says the site has moved', () => {
    expect(writeUp).toContain('A WooCommerce shop for home and office deliveries, with boxes sold as monthly subscriptions');
    expect(writeUp).toContain('WooCommerce Subscriptions charged on the first of each month');
    expect(writeUp).toContain('Custom Elementor widgets on an Astra child theme');
    expect(writeUp).toMatch(/has since moved to office deliveries/);
  });

  it.each([
    // This migration is history: it set the office summary, which the next one replaces
    ['summary', () => quoted(OFFICE_SUMMARY)],
    ['kind_label', () => quoted(freshFruit?.kindLabel ?? '')],
    ['case_study', () => quoted(writeUp)],
  ])('backfills %s with the seed value, only while it still has the old one', (column, value) => {
    const set = `UPDATE "projects" SET "${column}" = ${value()} WHERE "slug" = 'fresh-fruit-and-veg' AND "${column}" = '`;
    expect(sql).toContain(set);
  });

  it('backfills the tags with the seed value, only while they still have the old ones', () => {
    const tags = (freshFruit?.tags ?? []).map(quoted).join(', ');
    expect(sql).toContain(`UPDATE "projects" SET "tags" = ARRAY[${tags}]::text[] WHERE "slug" = 'fresh-fruit-and-veg' AND "tags" = ARRAY[`);
  });

  it('points the boxes stop at the office site', () => {
    expect(freshFruit?.tourStops?.find(({key}) => key === 'boxes')?.note).toBe('Office delivery boxes');
  });
});

describe('project fresh fruit summary migration', () => {
  const sql = readFileSync(new URL('../../prisma/migrations/20261107120000_project_fresh_fruit_summary/migration.sql', import.meta.url), 'utf8');
  const freshFruit = projects.find((project) => project.slug === 'fresh-fruit-and-veg');
  const quoted = (value: string) => `'${value.replaceAll("'", "''")}'`;

  it("puts back the previous site's summary in the seed", () => {
    expect(freshFruit?.summary).toBe('Weekly fruit and veg boxes for homes and offices in Glasgow, sold as WooCommerce subscriptions.');
  });

  it('sets the seed summary, only while the office summary is still there', () => {
    expect(sql).toContain(
      `UPDATE "projects" SET "summary" = ${quoted(freshFruit?.summary ?? '')} WHERE "slug" = 'fresh-fruit-and-veg' AND "summary" = ${quoted(OFFICE_SUMMARY)};`,
    );
  });

  it('changes only the summary', () => {
    expect(sql.match(/^UPDATE /gm)).toHaveLength(1);
    expect(sql).not.toMatch(/SET "(kind_label|tags|case_study)"/);
  });
});

describe('project premium mobile car valeting tour migration', () => {
  const sql = readFileSync(
    new URL('../../prisma/migrations/20261103120000_project_premium_mobile_car_valeting_tour/migration.sql', import.meta.url),
    'utf8',
  );
  const valeting = projects.find((project) => project.slug === 'premium-mobile-car-valeting');

  it('seeds a valid tour with an opening and three notes', () => {
    const stops = tourStopsSchema.parse(valeting?.tourStops);
    expect(stops).toHaveLength(4);
    expect(stops[0]?.note).toBe('');
    expect(stops.slice(1).every((stop) => stop.note !== '')).toBe(true);
  });

  it('backfills the seed tour, only while empty', () => {
    const match = sql.match(
      /UPDATE "projects" SET "tour_stops" = '(.+)'::jsonb WHERE "slug" = 'premium-mobile-car-valeting' AND "tour_stops" = '\[\]'::jsonb;/,
    );
    expect(JSON.parse(unquote(match?.[1] ?? 'null'))).toEqual(valeting?.tourStops);
  });

  it('keeps every capture in the tour folder, every box inside its capture and every page on the live site', () => {
    for (const stop of valeting?.tourStops ?? []) {
      for (const device of ['desktop', 'mobile'] as const) {
        const {url, width, height} = stop.captures[device];
        const {box} = stop.positions[device];
        expect(url).toContain('/images/2026/premium-mobile-car-valeting-tour/');
        expect(box.x + box.w).toBeLessThanOrEqual(width);
        expect(box.y + box.h).toBeLessThanOrEqual(height);
      }
      expect(tourHref(stop.path, valeting?.liveUrl ?? null)).not.toBeNull();
    }
  });

  it('uses the write-up for every note, word for word', () => {
    const writeUp = readFileSync(new URL('../../prisma/seed-data/projects/premium-mobile-car-valeting.md', import.meta.url), 'utf8');
    for (const stop of valeting?.tourStops?.slice(1) ?? []) expect(writeUp).toContain(stop.note);
  });

  it('leaves the reasoning empty', () => {
    expect(sql).not.toMatch(/SET "(decision|contribution|outcome)"/);
  });
});

describe('project premium mobile car valeting copy migration', () => {
  const sql = readFileSync(
    new URL('../../prisma/migrations/20261103130000_project_premium_mobile_car_valeting_copy/migration.sql', import.meta.url),
    'utf8',
  );
  const writeUp = readFileSync(new URL('../../prisma/seed-data/projects/premium-mobile-car-valeting.md', import.meta.url), 'utf8');
  const valeting = projects.find((project) => project.slug === 'premium-mobile-car-valeting');
  const quoted = (value: string) => `'${value.replaceAll("'", "''")}'`;

  it('tags the live stack, without AngularJS', () => {
    expect(valeting?.tags).toEqual(['WordPress', 'WooCommerce', 'PayPal', 'Bootstrap']);
  });

  it('keeps the original build and says the site has moved on', () => {
    expect(writeUp).toContain('an AngularJS and Bootstrap front end that worked on phones');
    expect(writeUp).toMatch(/## Since then\n\nThe site has since moved to a new theme/);
    expect(writeUp).toContain('## What it included');
  });

  it('backfills the write-up with the seed value, only while it still has the old one', () => {
    expect(sql).toContain(
      `UPDATE "projects" SET "case_study" = ${quoted(writeUp)} WHERE "slug" = 'premium-mobile-car-valeting' AND "case_study" = '`,
    );
  });

  it('backfills the tags with the seed value, only while they still have the old ones', () => {
    const tags = (valeting?.tags ?? []).map(quoted).join(', ');
    expect(sql).toContain(
      `UPDATE "projects" SET "tags" = ARRAY[${tags}]::text[] WHERE "slug" = 'premium-mobile-car-valeting' AND "tags" = ARRAY['WordPress', 'WooCommerce', 'PayPal', 'AngularJS']::text[];`,
    );
  });
});
