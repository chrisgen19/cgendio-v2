import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

/*
 * 1320px max width including the page gutter, as the design's nav and film HUD. --pad-l and --pad-r in globals.css
 * carry the design's 56px and 20px plus the display cutout's inset, which the viewport needs since it is
 * `viewport-fit: cover` (#112).
 */
export function Container({children, className}: ContainerProps) {
  return <div className={cn('mx-auto w-full max-w-site pl-(--pad-l) pr-(--pad-r)', className)}>{children}</div>;
}
