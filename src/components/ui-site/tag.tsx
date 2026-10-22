import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

type TagProps = {
  children: ReactNode;
  className?: string;
};

export function Tag({children, className}: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-pill border border-line bg-white px-[11px] py-2 font-mono text-xs leading-none font-medium text-ink',
        className,
      )}
    >
      {children}
    </span>
  );
}
