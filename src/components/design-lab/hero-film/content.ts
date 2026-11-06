/** The five hero film directions, in port order (scripts/design-lab.mjs serves each one on its own port). */
export const directions = [
  {
    slug: 'long-take',
    number: '01',
    port: 3001,
    title: 'The long take',
    brand: 'On-brand',
    format: 'Remotion film',
    description: 'One continuous camera move across a single board, from research notes to a live URL. No cuts.',
  },
  {
    slug: 'redline',
    number: '02',
    port: 3002,
    title: 'Redline to render',
    brand: 'On-brand',
    format: 'Remotion film',
    description: 'One project card carries every cut: redlined in Figma, written as a component, rendered, tested and shipped.',
  },
  {
    slug: 'pull-request',
    number: '03',
    port: 3003,
    title: 'Pull request',
    brand: 'On-brand',
    format: 'Remotion film',
    description: 'The build told as a real pull request: diff, preview deploy, checks going green, merged, live.',
  },
  {
    slug: 'departures',
    number: '04',
    port: 3004,
    title: 'Departures',
    brand: 'New palette and type',
    format: 'Remotion film',
    description: 'A split-flap board where each build is a departure, flipping from idea to live, then settling on my name.',
  },
  {
    slug: 'in-register',
    number: '05',
    port: 3005,
    title: 'In register',
    brand: 'New palette and type',
    format: 'Scroll-driven CSS',
    description: 'A site proof printed in four misaligned ink layers that slide into register as you scroll.',
  },
  {
    slug: 'redline-journey',
    number: '06',
    port: 3006,
    title: 'Redline: the full journey',
    brand: 'On-brand',
    format: 'Remotion film',
    description: "Redline's look and card-led motion, told as the full journey: research, design, Figma to web, QA, deploy and live, with chapters.",
  },
] as const;

export type Direction = (typeof directions)[number];
export type DirectionSlug = Direction['slug'];

export const LAB_BASE_PATH = '/design-lab/hero-film';
