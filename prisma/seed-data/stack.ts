import type {StackItem} from '../../src/server/content-schema';

const NAMES = [
  'Next.js',
  'React',
  'TypeScript',
  'Tailwind CSS',
  'shadcn/ui',
  'Prisma',
  'PostgreSQL',
  'WordPress',
  'WooCommerce',
  'PHP',
  'Builder.io',
  'Figma',
  'Vercel',
  'Cloudflare',
  'Coolify',
];

export const stack: StackItem[] = NAMES.map((name, i) => ({name, order: i + 1}));
