import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

type SectionHeadingProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};

export function SectionHeading({children, id, className}: SectionHeadingProps) {
  return (
    <h2 id={id} className={cn('m-0 font-display text-[clamp(40px,5vw,72px)] leading-[0.98] font-bold tracking-[-0.04em]', className)}>
      {children}
    </h2>
  );
}
