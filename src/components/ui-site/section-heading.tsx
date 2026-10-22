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
  className?: string;
};

export function SectionHeading({children, id, size = 'default', className}: SectionHeadingProps) {
  return (
    <h2 id={id} className={cn('m-0 font-display leading-[0.98] font-bold tracking-[-0.04em]', SIZES[size], className)}>
      {children}
    </h2>
  );
}
