import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

const PADDING = {
  default: 'py-28 max-md:py-18',
  // The stack strip: 44px top and bottom at every width
  strip: 'py-11',
  // The contact CTA: 24px on top so the lime panel sits close to the blog list
  cta: 'pt-6 pb-28 max-md:pb-18',
  /*
   * A page header band and the section under it read as one unit, not two, so they halve the padding they meet on:
   * 56px each side of the border instead of 112px (40px instead of 72px under 860px). Use them as a pair.
   */
  head: 'pt-6 pb-14 max-md:pb-10',
  'under-head': 'pt-14 pb-28 max-md:pt-10 max-md:pb-18',
} as const;

type SectionProps = {
  id?: string;
  /** Sections alternate ground and white; white ones get `line` borders top and bottom. */
  tone?: 'ground' | 'white';
  /**
   * `default` is the canvas `112px 56px` (`72px 20px` under 860px); `strip` and `cta` are the canvas overrides.
   * `head` and `under-head` are the pair for a page header band and the section it runs into.
   */
  padding?: keyof typeof PADDING;
  className?: string;
  innerClassName?: string;
  /** Keep the inner panel light in dark mode (the lime contact panel). */
  innerTheme?: 'light';
  children: ReactNode;
};

/** A home page section: the canvas `.sec` padding plus the 1320px `.wrap`. */
export function Section({id, tone = 'ground', padding = 'default', className, innerClassName, innerTheme, children}: SectionProps) {
  return (
    <section id={id} className={cn('px-14 max-md:px-5', PADDING[padding], tone === 'white' && 'border-y border-line bg-white', className)}>
      <div data-theme={innerTheme} className={cn('mx-auto max-w-site', innerClassName)}>
        {children}
      </div>
    </section>
  );
}
