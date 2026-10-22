import type {Milestone} from '../../src/server/content-schema';

export const milestones: Milestone[] = [
  {
    kind: 'MILESTONE',
    value: '2026',
    title: 'Joined the IT team',
    description: 'Moved into Access Group International’s IT team to bring Next.js work in-house.',
    order: 1,
  },
  {kind: 'PROMOTION', value: 'Nov ’25', title: 'Promoted to full-stack', description: 'From WordPress specialist to full-stack developer.', order: 2},
  {
    kind: 'ACHIEVEMENT',
    value: '20+',
    title: 'Client sites managed',
    description: 'WordPress and WooCommerce sites for Access Group Australia.',
    order: 3,
  },
  {
    kind: 'ACHIEVEMENT',
    value: 'VPS',
    title: 'Self-hosted infrastructure',
    description: 'Own server running Coolify, Docker and PostgreSQL.',
    order: 4,
  },
  {
    kind: 'IN PROGRESS',
    value: 'Shopify',
    title: 'Shopify developer track',
    description: 'Working through the Shopify Academy developer path.',
    order: 5,
  },
];
