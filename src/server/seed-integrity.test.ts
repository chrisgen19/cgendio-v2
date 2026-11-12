import {describe, expect, it} from 'vitest';
import {hasTour, tourHref} from '@/lib/tour';
import {projects} from '../../prisma/seed-data/projects';
import {tourStopsSchema} from './content-schema';

/*
 * The rules every seeded tour keeps, whatever its wording. These replace the tests that matched each project migration's
 * SQL against the seed: those migrations have run, and on a fresh database their UPDATEs match no rows, because no
 * migration inserts projects and prisma/seed.mts runs after them. tourStopsSchema already refuses duplicate keys and an
 * empty note after the first stop, so parsing covers those.
 */
const toured = projects.filter((project) => project.tourStops?.length);

const DEVICES = ['desktop', 'mobile'] as const;

describe('seeded tours', () => {
  // A guard, not a count: a filter typo must not empty the loop below, and a new project must not need a test edit
  it('cover at least one project', () => {
    expect(toured.length).toBeGreaterThan(0);
  });

  describe.each(toured)('$slug', (project) => {
    const stops = project.tourStops ?? [];

    it('parses and has a note to show', () => {
      expect(tourStopsSchema.safeParse(stops).error?.issues ?? []).toEqual([]);
      expect(hasTour(stops)).toBe(true);
    });

    it('opens on a stop with no note', () => {
      expect(stops[0]?.note).toBe('');
    });

    it('keeps every capture in a tour folder', () => {
      const outside = stops.flatMap((stop) =>
        DEVICES.filter((device) => !/\/images\/\d{4}\/[a-z0-9-]+-tour\//.test(stop.captures[device].url)).map((device) => `${stop.key} ${device}`),
      );
      expect(outside).toEqual([]);
    });

    it('keeps every box inside its capture', () => {
      const outside = stops.flatMap((stop) =>
        DEVICES.filter((device) => {
          const {width, height} = stop.captures[device];
          const {box} = stop.positions[device];
          return box.x + box.w > width || box.y + box.h > height;
        }).map((device) => `${stop.key} ${device}`),
      );
      expect(outside).toEqual([]);
    });

    it('links every stop to the live site', () => {
      expect(stops.filter((stop) => tourHref(stop.path, project.liveUrl ?? null) === null).map(({key}) => key)).toEqual([]);
    });
  });
});
