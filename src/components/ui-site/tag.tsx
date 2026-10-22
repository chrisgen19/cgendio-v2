import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

// Sizes from the canvas: project card tags (sm), the default tag (md) and the stack strip chips (lg)
const SIZES = {
  sm: 'px-2.5 py-[7px] text-[11px]',
  md: 'px-[11px] py-2 text-xs',
  lg: 'px-3.5 py-2.5 text-[13px]',
} as const;

type TagProps = {
  children: ReactNode;
  size?: keyof typeof SIZES;
  className?: string;
};

export function Tag({children, size = 'md', className}: TagProps) {
  return (
    <span className={cn('inline-flex rounded-pill border border-line bg-white font-mono leading-none font-medium text-ink', SIZES[size], className)}>
      {children}
    </span>
  );
}
