import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

type EyebrowProps = {
  children: ReactNode;
  className?: string;
};

export function Eyebrow({children, className}: EyebrowProps) {
  return <p className={cn('m-0 font-mono text-[13px] leading-none font-medium tracking-[0.08em] text-muted uppercase', className)}>{children}</p>;
}
