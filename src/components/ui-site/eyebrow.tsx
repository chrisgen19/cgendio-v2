import type {ReactNode} from 'react';
import {cn} from '@/lib/cn';

type EyebrowProps = {
  children: ReactNode;
  /** `ink` on coloured panels such as the lime contact CTA. */
  tone?: 'muted' | 'ink';
  className?: string;
};

export function Eyebrow({children, tone = 'muted', className}: EyebrowProps) {
  return (
    <p
      className={cn(
        'm-0 font-mono text-[13px] leading-none font-medium tracking-[0.08em] uppercase',
        tone === 'ink' ? 'text-ink' : 'text-muted',
        className,
      )}
    >
      {children}
    </p>
  );
}
