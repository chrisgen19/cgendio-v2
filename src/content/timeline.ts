import type {TimelineEntry} from './schema';

export const timeline: TimelineEntry[] = [
  {
    when: 'Now',
    role: 'Founder & developer',
    org: 'Cgdiomampo.dev',
    description: 'Independent web studio for agencies and brands — WordPress, WooCommerce, Next.js and migrations.',
    dot: 'lime',
    isCurrent: true,
    order: 1,
  },
  {
    when: '2026 — Present',
    role: 'Full-stack Developer, IT Team',
    org: 'Access Group International',
    description:
      'Leading WordPress/Elementor to Next.js and Builder.io migrations, edge redirect architecture, and identity resolution with Firebase, Vercel and BigQuery.',
    dot: 'accent',
    isCurrent: true,
    order: 2,
  },
  {
    when: 'Nov 2025',
    role: 'Promoted to Full-stack Developer',
    org: 'Access Group',
    description: 'Stepped up from WordPress development into full-stack product work.',
    dot: 'accent',
    isCurrent: false,
    order: 3,
  },
  {
    when: '[START] — 2025',
    role: 'WordPress / WooCommerce Developer',
    org: 'Access Group Australia',
    description: 'Built and maintained 20+ client sites in PHP, WordPress and WooCommerce, including performance, SEO and CRM integrations.',
    dot: 'ink',
    isCurrent: false,
    order: 4,
  },
  {
    when: '[YEAR]',
    role: '[Earlier role]',
    org: '[Company]',
    description: '[One line on what you did there.]',
    dot: 'placeholder',
    isCurrent: false,
    order: 5,
  },
];
