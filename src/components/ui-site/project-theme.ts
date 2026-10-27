import type {CSSProperties} from 'react';
import {brandPalette} from '@/lib/brand-palette';
import type {ProjectTheme} from '@/server/content';

/** Background and text colour of a project's thumb (canvas th-ink/tint/lime/gray). Full class names so Tailwind sees them. */
export const PROJECT_THEMES: Record<ProjectTheme, string> = {
  ink: 'bg-thumb-ink text-on-dark shadow-(--shadow-thumb)',
  tint: 'bg-tint text-accent',
  lime: 'bg-lime text-on-lime',
  gray: 'bg-thumb text-ink',
};

/** The two outline circles in a thumb's top-right corner (the element needs `relative overflow-hidden`). */
export const PROJECT_RINGS = [
  "before:absolute before:-top-20 before:-right-15 before:size-65 before:rounded-full before:border-[1.5px] before:border-current before:opacity-14 before:content-['']",
  "after:absolute after:-top-40 after:-right-35 after:size-105 after:rounded-full after:border-[1.5px] after:border-current after:opacity-14 after:content-['']",
].join(' ');

/**
 * A project's brand tint as inline CSS variables, both page themes at once; the `.brand-panel` rule in globals.css picks
 * the set for the current theme. Undefined without a brand colour (the tint alone does nothing), so the theme applies.
 */
export const brandPanelStyle = (brandColor: string | null, brandTint: string | null): CSSProperties | undefined => {
  if (!brandColor) return undefined;
  const {light, dark} = brandPalette(brandColor, brandTint);
  return {
    '--brand-bg-light': light.background,
    '--brand-accent-light': light.accent,
    '--brand-button-light': light.button,
    '--brand-on-button-light': light.onButton,
    '--brand-bg-dark': dark.background,
    '--brand-accent-dark': dark.accent,
    '--brand-button-dark': dark.button,
    '--brand-on-button-dark': dark.onButton,
  } as CSSProperties;
};
