import {
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

// Named imports only, so the bundle carries these paths and not the whole icon set. Builder.io has no simple-icons logo.
const PATHS: Record<string, string> = {
  'Next.js': siNextdotjs.path,
  React: siReact.path,
  TypeScript: siTypescript.path,
  'Tailwind CSS': siTailwindcss.path,
  'shadcn/ui': siShadcnui.path,
  Prisma: siPrisma.path,
  PostgreSQL: siPostgresql.path,
  WordPress: siWordpress.path,
  WooCommerce: siWoocommerce.path,
  PHP: siPhp.path,
  Figma: siFigma.path,
  Vercel: siVercel.path,
  Cloudflare: siCloudflare.path,
  Coolify: siCoolify.path,
};

/** The 24x24 SVG path of a tool's logo, or undefined when there is none (Builder.io, new tools from the admin). */
export const stackIconPath = (name: string): string | undefined => PATHS[name];
