import {
  type SimpleIcon,
  siCloudflare,
  siCoolify,
  siFigma,
  siNextdotjs,
  siPhp,
  siPostgresql,
  siPrisma,
  siReact,
  siShadcnui,
  siTailwindcss,
  siTypescript,
  siVercel,
  siWoocommerce,
  siWordpress,
} from 'simple-icons';

/** Brand logos by stack name. Builder.io has no Simple Icons logo, so it (and any new name) gets the monogram fallback. */
const STACK_ICONS: Readonly<Record<string, SimpleIcon>> = {
  'Next.js': siNextdotjs,
  React: siReact,
  TypeScript: siTypescript,
  'Tailwind CSS': siTailwindcss,
  'shadcn/ui': siShadcnui,
  Prisma: siPrisma,
  PostgreSQL: siPostgresql,
  WordPress: siWordpress,
  WooCommerce: siWoocommerce,
  PHP: siPhp,
  Figma: siFigma,
  Vercel: siVercel,
  Cloudflare: siCloudflare,
  Coolify: siCoolify,
};

/** The SVG path (24x24 viewBox) for a stack name, or undefined when there is no logo. */
export const getStackIconPath = (name: string): string | undefined => STACK_ICONS[name]?.path;
