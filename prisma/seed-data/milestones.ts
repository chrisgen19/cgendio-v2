import type {Milestone} from '../../src/server/content-schema';

/** From the CV and the live site's Highlights. Five cards fill the desktop row. */
export const milestones: Milestone[] = [
  {
    kind: 'MILESTONE',
    value: '15+',
    title: 'Years on the web',
    description: 'WordPress, Shopify and Next.js sites for Australian and US companies.',
    order: 1,
  },
  {
    kind: 'MILESTONE',
    value: '6',
    title: 'Developers led',
    description: 'Planning and assigning work across 40+ sites at Access Group Australia.',
    order: 2,
  },
  {
    kind: 'MILESTONE',
    value: 'CMS',
    title: 'Headless CMS on Builder.io',
    description: 'Built with Next.js, TypeScript and Tailwind CSS, plus React apps for lead and UTM tracking.',
    order: 3,
  },
  {
    kind: 'ACHIEVEMENT',
    value: '40+',
    title: 'Client sites managed',
    description: 'WordPress and Webflow sites across 40 brands for Access Group Australia.',
    order: 4,
  },
  {
    kind: 'ACHIEVEMENT',
    value: 'VPS',
    title: 'Self-hosted infrastructure',
    description: 'Own server running Coolify, Docker and PostgreSQL.',
    order: 5,
  },
];
