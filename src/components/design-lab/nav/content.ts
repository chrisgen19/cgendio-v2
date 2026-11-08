/**
 * The three header directions in the nav lab. All three do the same three jobs — overlay the hero then take a
 * surface, say which section you are in, and show reading progress — and differ in the shape that does them.
 *
 * Each borrows from a world the site already has: the design-tool vocabulary of the About canvas, the stacked
 * plates of the Stack section, or the hero film's transport bar.
 */
export type Direction = {
  readonly slug: 'ruler' | 'dock' | 'transport';
  readonly number: string;
  readonly port: number;
  readonly title: string;
  /** One line for the gallery card. */
  readonly description: string;
  /** What changes when the header leaves the hero. */
  readonly stuck: string;
  /** How it says "you are here". */
  readonly position: string;
  /** What it does under 860px. */
  readonly mobile: string;
};

export const directions: readonly Direction[] = [
  {
    slug: 'ruler',
    number: '01',
    port: 3001,
    title: 'The ruler',
    description: 'The header as a measuring rail, borrowed from the guides and redlines of the About canvas.',
    stuck: 'The hairline rail fills in and the tick marks become the nav.',
    position: 'The lime highlighter — the site’s own signature — slides along the rail to the section in view.',
    mobile: 'The rail stays; its label opens a sheet.',
  },
  {
    slug: 'dock',
    number: '02',
    port: 3002,
    title: 'The dock',
    description: 'Wide and transparent over the film, then one orchestrated move into a detached ink plate.',
    stuck: 'Condenses in a single move: inset from the edges, inverted to ink, shadow underneath.',
    position: 'The active link sits in a lime capsule inside the plate.',
    mobile: 'A full-screen ink sheet.',
  },
  {
    slug: 'transport',
    number: '03',
    port: 3003,
    title: 'The transport',
    description: 'The hero film’s transport bar, promoted to navigation: a position readout rather than a link list.',
    stuck: 'Hides on the way down and returns on the way up, so long reads get the full height.',
    position: 'A mono counter reads the section number and name, the way a timecode reads a frame.',
    mobile: 'Docks to the bottom edge, in reach of a thumb.',
  },
];

export const findDirection = (slug: string) => directions.find((direction) => direction.slug === slug);
