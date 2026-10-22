import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

/** 1320px max width including 56px side padding (20px under 860px), as the design's nav and film HUD. */
export function Container({children, className}: ContainerProps) {
  return <div className={cn('mx-auto w-full max-w-site px-14 max-md:px-5', className)}>{children}</div>;
}
