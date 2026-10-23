import type {ProjectTheme} from '@/server/content';

/** Background and text colour of a project's thumb (canvas th-ink/tint/lime/gray). Full class names so Tailwind sees them. */
export const PROJECT_THEMES: Record<ProjectTheme, string> = {
  ink: 'bg-ink text-white',
  tint: 'bg-tint text-accent',
  lime: 'bg-lime text-ink',
  gray: 'bg-thumb text-ink',
};

/** The two outline circles in a thumb's top-right corner (the element needs `relative overflow-hidden`). */
export const PROJECT_RINGS = [
  "before:absolute before:-top-20 before:-right-15 before:size-65 before:rounded-full before:border-[1.5px] before:border-current before:opacity-14 before:content-['']",
  "after:absolute after:-top-40 after:-right-35 after:size-105 after:rounded-full after:border-[1.5px] after:border-current after:opacity-14 after:content-['']",
].join(' ');
