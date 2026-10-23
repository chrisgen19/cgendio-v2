import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

const SIZES = {
  default: 'text-[clamp(40px,5vw,72px)]',
  // The contact CTA's larger heading
  cta: 'text-[clamp(44px,6.4vw,96px)]',
} as const;

type SectionHeadingProps = {
  children: ReactNode;
  id?: string;
  size?: keyof typeof SIZES;
  /** Inner pages use the same heading style for their single h1 (the home page's h1 is visually hidden). */
  level?: 1 | 2;
  className?: string;
};

export function SectionHeading({children, id, size = 'default', level = 2, className}: SectionHeadingProps) {
  const Tag = level === 1 ? 'h1' : 'h2';
  return (
    <Tag id={id} className={cn('m-0 font-display leading-[0.98] font-bold tracking-[-0.04em]', SIZES[size], className)}>
      {children}
    </Tag>
  );
}
