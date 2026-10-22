import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

type SectionProps = {
  id?: string;
  /** Sections alternate ground and white; white ones get `line` borders top and bottom. */
  tone?: 'ground' | 'white';
  /** Overrides the default `112px 56px` (`72px 20px` under 860px) padding, e.g. `py-11`. */
  className?: string;
  innerClassName?: string;
  children: ReactNode;
};

/** A home page section: the canvas `.sec` padding plus the 1320px `.wrap`. */
export function Section({id, tone = 'ground', className, innerClassName, children}: SectionProps) {
  return (
    <section id={id} className={cn('px-14 py-28 max-md:px-5 max-md:py-18', tone === 'white' && 'border-y border-line bg-white', className)}>
      <div className={cn('mx-auto max-w-site', innerClassName)}>{children}</div>
    </section>
  );
}
