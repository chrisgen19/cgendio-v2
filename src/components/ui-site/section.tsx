import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

const PADDING = {
  default: 'py-28 max-md:py-18',
  // The stack strip: 44px top and bottom at every width
  strip: 'py-11',
  // The contact CTA: 24px on top so the lime panel sits close to the blog list
  cta: 'pt-6 pb-28 max-md:pb-18',
} as const;

type SectionProps = {
  id?: string;
  /** Sections alternate ground and white; white ones get `line` borders top and bottom. */
  tone?: 'ground' | 'white';
  /** `default` is the canvas `112px 56px` (`72px 20px` under 860px); `strip` and `cta` are the canvas overrides. */
  padding?: keyof typeof PADDING;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
};

/** A home page section: the canvas `.sec` padding plus the 1320px `.wrap`. */
export function Section({id, tone = 'ground', padding = 'default', className, innerClassName, children}: SectionProps) {
  return (
    <section id={id} className={cn('px-14 max-md:px-5', PADDING[padding], tone === 'white' && 'border-y border-line bg-white', className)}>
      <div className={cn('mx-auto max-w-site', innerClassName)}>{children}</div>
    </section>
  );
}
